"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import { Modal } from "@/components/ui/Modal/Modal";
import {
  generateReliefRecommendations,
  getReliefInventory,
  getReliefRecommendations,
  saveReliefInventory,
} from "@/services/reliefService";
import type { ReliefInventoryItem, ReliefRecommendation } from "@/types/relief";
import styles from "./ReliefPanel.module.css";

export function ReliefPanel() {
  const [inventory, setInventory] = useState<ReliefInventoryItem[]>([]);
  const [draftInventory, setDraftInventory] = useState<ReliefInventoryItem[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReliefRecommendation | null>(null);
  const [recommendations, setRecommendations] = useState<ReliefRecommendation[]>([]);
  const [history, setHistory] = useState<ReturnType<typeof mapHistory>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [recommendationRows, inventoryRows] = await Promise.all([
          getReliefRecommendations(),
          getReliefInventory(),
        ]);

        if (cancelled) return;

        setRecommendations(recommendationRows.map(mapRecommendation));
        setHistory(recommendationRows.map(mapHistory));
        setInventory(mapInventoryRows(inventoryRows));
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load relief data.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function openInventoryModal() {
    setDraftInventory(inventory.map((item) => ({ ...item, quantity: 0 })));
    setIsInventoryOpen(true);
  }

  function updateDraftQuantity(itemId: string, quantity: number) {
    setDraftInventory((items) =>
      items.map((item) => (item.id === itemId ? { ...item, quantity: Number.isNaN(quantity) ? 0 : quantity } : item)),
    );
  }

  function resetDraftQuantity(itemId: string) {
    setDraftInventory((items) => items.map((item) => (item.id === itemId ? { ...item, quantity: 0 } : item)));
  }

  async function saveInventory() {
    const payload = {
      family_food_packs: quantityFor(draftInventory, "Food Pack"),
      medicine_kits: quantityFor(draftInventory, "Medicine"),
      relief_goods_individual: quantityFor(draftInventory, "Individual"),
      items: draftInventory,
    };

    try {
      await saveReliefInventory(payload);
    } catch (saveError) {
      window.alert(saveError instanceof Error ? saveError.message : "Unable to save inventory");
      return;
    }

    setInventory(draftInventory);
    setIsInventoryOpen(false);
  }

  async function generateRecommendation() {
    setIsGenerating(true);
    setError("");
    try {
      const rows = await generateReliefRecommendations();
      const mapped = rows.map(mapRecommendation);
      setRecommendations(mapped);
      setHistory(rows.map(mapHistory));
    } catch (generateError) {
      window.alert(generateError instanceof Error ? generateError.message : "Unable to generate recommendations");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <section className={styles.stack} aria-label="AI relief recommendations">
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>AI Allocation Suggestions</h3>
              <p>Based on current flood data and affected population analysis</p>
            </div>
            <div className={styles.actions}>
              <Button className={styles.actionButton} onClick={generateRecommendation} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Recommendation"}
              </Button>
              <Button className={styles.actionButton} onClick={openInventoryModal}>
                Input Available Relief
              </Button>
            </div>
          </div>
          {error ? <p className={styles.errorMessage}>{error}</p> : null}
          {isLoading ? <p className={styles.stateMessage}>Loading relief data...</p> : null}

          <div className={styles.recommendationList}>
            {recommendations.map((recommendation, index) => (
              <article
                className={styles.recommendationCard}
                key={recommendation.recommendation_id ?? `${recommendation.barangay_name ?? recommendation.barangay}-${index}`}
                onClick={() => setSelectedReport(recommendation)}
                tabIndex={0}
                role="button"
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedReport(recommendation);
                  }
                }}
                aria-label={`View full report for ${recommendation.barangay}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.rank}>{recommendation.id}</span>
                  <h4>{recommendation.barangay}</h4>
                  <button
                    className={styles.viewButton}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedReport(recommendation);
                    }}
                  >
                    View
                  </button>
                </div>
                <div className={styles.cardDetails}>
                  <div>
                    <span>Recommended Items</span>
                    <p>{recommendation.recommendedItems}</p>
                  </div>
                  <div>
                    <span>Analysis Reason</span>
                    <p>{recommendation.analysisReason}</p>
                  </div>
                </div>
              </article>
            ))}
            {!isLoading && recommendations.length === 0 ? (
              <p className={styles.stateMessage}>No recommendations found.</p>
            ) : null}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.historyHeader}>
            <h3>Allocation History</h3>
            <p>View past and scheduled relief distributions</p>
          </div>
          <DataTable
            headers={[
              "Allocation ID",
              "Date",
              "Time",
              "Barangay",
              "Family Food Packs",
              "Medicine Kits",
              "Relief for Individual",
            ]}
            minWidth={760}
          >
            {history.map((entry, index) => (
              <tr key={entry.recommendation_id ?? `${entry.barangay_name ?? entry.barangay}-${index}`}>
                <td>{entry.id}</td>
                <td>{entry.date}</td>
                <td>{entry.time}</td>
                <td>{entry.barangay}</td>
                <td>{entry.familyFoodPacks}</td>
                <td>{entry.medicineKits}</td>
                <td>{entry.reliefForIndividual}</td>
              </tr>
            ))}
            {!isLoading && history.length === 0 ? (
              <tr>
                <td colSpan={7}>No allocation history found.</td>
              </tr>
            ) : null}
          </DataTable>
        </div>
      </section>

      <Modal
        className={styles.inventoryDialog}
        isOpen={isInventoryOpen}
        labelledBy="available-relief-title"
        onClose={() => setIsInventoryOpen(false)}
      >
        <header className={styles.modalHeader}>
          <div>
            <h3 id="available-relief-title">Input Available Relief</h3>
            <p>Manage and update your current relief goods inventory</p>
          </div>
          <button className={styles.closeButtonLight} type="button" onClick={() => setIsInventoryOpen(false)} aria-label="Close">
            x
          </button>
        </header>
        <div className={styles.inventoryBody}>
          <h4>Current Inventory ({draftInventory.length} items)</h4>
          <div className={styles.inventoryList}>
            {draftInventory.map((item, index) => (
              <div className={styles.inventoryItem} key={item.inventory_id ?? `${item.name}-${index}`}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Unit: {item.unit}</span>
                </div>
                <div className={styles.quantityControl}>
                  <label>
                    <span className="srOnly">{item.name} quantity</span>
                    <input
                      min={0}
                      type="number"
                      value={item.quantity}
                    onChange={(event) => updateDraftQuantity(item.id, Number(event.target.value))}
                  />
                    <small>{item.unit}</small>
                  </label>
                  <button
                    className={styles.refreshButton}
                    type="button"
                    onClick={() => resetDraftQuantity(item.id)}
                    aria-label={`Reset ${item.name} quantity`}
                  >
                    <span className={styles.refreshIcon} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.modalFooter}>
            <Button className={styles.footerButton} tone="muted" onClick={() => setIsInventoryOpen(false)}>
              Cancel
            </Button>
            <Button className={styles.footerButton} onClick={saveInventory}>
              Save Inventory
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        className={styles.reportDialog}
        isOpen={Boolean(selectedReport)}
        labelledBy="barangay-report-title"
        onClose={() => setSelectedReport(null)}
      >
        {selectedReport ? (
          <>
            <header className={styles.reportHeader}>
              <div>
                <h3 id="barangay-report-title">{selectedReport.barangay}</h3>
                <p>Comprehensive Barangay Information</p>
              </div>
              <button className={styles.closeButtonDark} type="button" onClick={() => setSelectedReport(null)} aria-label="Close">
                x
              </button>
            </header>
            <div className={styles.reportBody}>
              <p>{selectedReport.report}</p>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}

function quantityFor(items: ReliefInventoryItem[], partialName: string) {
  return items.find((item) => item.name.toLowerCase().includes(partialName.toLowerCase()))?.quantity ?? 0;
}

function mapRecommendation(row: Record<string, unknown>, index: number): ReliefRecommendation {
  const foodPacks = Number(row.recommended_family_food_packs ?? 0);
  const medicineKits = Number(row.recommended_medicine_kits ?? 0);
  const individualGoods = Number(row.recommended_relief_goods_individual ?? 0);

  return {
    recommendation_id: row.recommendation_id ? String(row.recommendation_id) : undefined,
    id: String(index + 1),
    barangay_name: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    barangay: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    recommendedItems: `${foodPacks} food packs, ${medicineKits} medicine kits, ${individualGoods} individual goods`,
    analysisReason: String(row.analysis_reason ?? `${row.risk_level ?? "normal"} risk, priority score ${row.priority_score ?? 0}`),
    report: String(row.analysis_reason ?? JSON.stringify(row, null, 2)),
  };
}

function mapHistory(row: Record<string, unknown>, index: number) {
  const createdAt = row.created_at ? new Date(String(row.created_at)) : new Date();

  return {
    recommendation_id: row.recommendation_id ? String(row.recommendation_id) : undefined,
    id: String(row.recommendation_id ?? index + 1),
    barangay_name: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    date: createdAt.toLocaleDateString(),
    time: createdAt.toLocaleTimeString(),
    barangay: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    familyFoodPacks: Number(row.recommended_family_food_packs ?? 0),
    medicineKits: Number(row.recommended_medicine_kits ?? 0),
    reliefForIndividual: Number(row.recommended_relief_goods_individual ?? 0),
  };
}

function mapInventoryRows(rows: Record<string, unknown>[]): ReliefInventoryItem[] {
  const latest = rows[0];

  if (Array.isArray(latest?.items)) {
    return latest.items.map((item, index) => mapInventoryItem(item as Record<string, unknown>, index));
  }

  if (latest && ("family_food_packs" in latest || "medicine_kits" in latest || "relief_goods_individual" in latest)) {
    return [
      {
        inventory_id: `${latest.inventory_id ?? "current"}-food-packs`,
        id: "family-food-packs",
        name: "Family Food Pack",
        unit: "packs",
        quantity: Number(latest.family_food_packs ?? 0),
      },
      {
        inventory_id: `${latest.inventory_id ?? "current"}-medicine-kits`,
        id: "medicine-kits",
        name: "Medicine Kit",
        unit: "kits",
        quantity: Number(latest.medicine_kits ?? 0),
      },
      {
        inventory_id: `${latest.inventory_id ?? "current"}-individual-goods`,
        id: "relief-goods-individual",
        name: "Relief Goods Individual",
        unit: "pcs",
        quantity: Number(latest.relief_goods_individual ?? 0),
      },
    ];
  }

  return rows.map(mapInventoryItem);
}

function mapInventoryItem(row: Record<string, unknown>, index: number): ReliefInventoryItem {
  const inventoryId = row.inventory_id ? String(row.inventory_id) : undefined;
  const name = String(row.item_name ?? row.name ?? `Inventory Item ${index + 1}`);

  return {
    inventory_id: inventoryId,
    id: inventoryId ?? `${name}-${index}`,
    name,
    unit: String(row.unit ?? "pcs"),
    quantity: Number(row.quantity ?? 0),
  };
}
