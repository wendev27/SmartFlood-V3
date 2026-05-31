"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionResultModal, type ActionResultType } from "@/components/ui/ActionResultModal";
import { Button } from "@/components/ui/Button/Button";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal/Modal";
import {
  generateReliefRecommendations,
  getReliefInventory,
  getReliefRecommendations,
  saveReliefInventory,
} from "@/services/reliefService";
import type { ReliefInventoryItem, ReliefRecommendation } from "@/types/relief";
import styles from "./ReliefPanel.module.css";

type HistoryEntry = ReturnType<typeof mapHistory>;
type HistoryDateFilter = "" | "all" | "today" | "last7" | "month";
type HistorySort = "newest" | "oldest" | "barangay" | "food" | "medicine" | "goods";

export function ReliefPanel() {
  const [inventory, setInventory] = useState<ReliefInventoryItem[]>([]);
  const [draftInventory, setDraftInventory] = useState<ReliefInventoryItem[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReliefRecommendation | null>(null);
  const [recommendations, setRecommendations] = useState<ReliefRecommendation[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyDateFilter, setHistoryDateFilter] = useState<HistoryDateFilter>("");
  const [historyBarangayFilter, setHistoryBarangayFilter] = useState("");
  const [historySort, setHistorySort] = useState<HistorySort>("newest");
  const [historySearch, setHistorySearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultModal, setResultModal] = useState({
    open: false,
    type: "success" as ActionResultType,
    title: "",
    description: "",
    details: "",
  });

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

        setRecommendations(latestUniqueRecommendations(recommendationRows).map(mapRecommendation));
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

  const activeHistoryDateFilter = historyDateFilter || defaultHistoryDateFilter(history);
  const historyBarangays = useMemo(() => Array.from(new Set(history.map((entry) => entry.barangay).filter(Boolean))).sort(), [history]);
  const filteredHistory = useMemo(() => {
    const normalizedSearch = historySearch.trim().toLowerCase();

    return history
      .filter((entry) => {
        const searchable = [
          entry.recommendation_id,
          entry.id,
          entry.date,
          entry.time,
          entry.barangay_name,
          entry.barangay,
          entry.familyFoodPacks,
          entry.medicineKits,
          entry.reliefForIndividual,
        ].join(" ").toLowerCase();

        return isInDateFilter(entry.createdAt, activeHistoryDateFilter)
          && (!historyBarangayFilter || entry.barangay === historyBarangayFilter)
          && (!normalizedSearch || searchable.includes(normalizedSearch));
      })
      .sort((a, b) => sortHistoryEntries(a, b, historySort));
  }, [activeHistoryDateFilter, history, historyBarangayFilter, historySearch, historySort]);

  function resetHistoryFilters() {
    setHistoryDateFilter(defaultHistoryDateFilter(history));
    setHistoryBarangayFilter("");
    setHistorySort("newest");
    setHistorySearch("");
  }

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
      const message = saveError instanceof Error ? saveError.message : "Unable to save inventory";
      setResultModal({
        open: true,
        type: "error",
        title: "Failed to Save Inventory",
        description: message,
        details: "Inventory changes were not applied. Please check the quantities and try again.",
      });
      return;
    }

    setInventory(draftInventory);
    setIsInventoryOpen(false);
    setResultModal({
      open: true,
      type: "success",
      title: "Inventory Saved Successfully",
      description: "The available relief goods inventory has been updated.",
      details: "Future recommendation runs will use the latest saved inventory values.",
    });
  }

  async function generateRecommendation() {
    setIsGenerating(true);
    setError("");
    try {
      const generatedRows = await generateReliefRecommendations();
      const latestRows = await getReliefRecommendations();
      const currentRows = generatedRows.length > 0 ? generatedRows : latestUniqueRecommendations(latestRows);
      setRecommendations(currentRows.map(mapRecommendation));
      setHistory(latestRows.map(mapHistory));
      setResultModal({
        open: true,
        type: "success",
        title: "Recommendation Generated Successfully",
        description: "SmartFlood has generated updated AI allocation suggestions.",
        details: "Review the recommendation cards and allocation history for the latest outputs.",
      });
    } catch (generateError) {
      setResultModal({
        open: true,
        type: "error",
        title: "Failed to Generate Recommendation",
        description: generateError instanceof Error ? generateError.message : "Unable to generate recommendations",
        details: "Please verify sensor, resident, and relief inventory data before trying again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <section className={styles.stack} aria-label="AI relief recommendations">
        <div className={`${styles.panel} ${styles.historyPanel}`}>
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
          {error ? <ErrorState title="Unable to Load Relief Data" message={error} /> : null}
          {isLoading ? <LoadingState message="Loading relief data..." /> : null}

          <div className={styles.recommendationList}>
            {recommendations.map((recommendation, index) => (
              <article
                className={styles.recommendationCard}
                key={recommendation.recommendation_id || `${recommendation.barangay_name ?? recommendation.barangay}-${index}`}
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
              <EmptyState
                title="No recommendations generated yet"
                description="Generate a recommendation once flood data and relief inventory are available."
                actionLabel="Generate Recommendation"
                onAction={generateRecommendation}
              />
            ) : null}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.historyHeader}>
            <h3>Allocation History</h3>
            <p>View past and scheduled relief distributions</p>
          </div>
          <div className={styles.historyFilters} aria-label="Allocation history filters">
            <label>
              <span>Date</span>
              <select value={activeHistoryDateFilter} onChange={(event) => setHistoryDateFilter(event.target.value as HistoryDateFilter)}>
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="last7">Last 7 days</option>
                <option value="month">This month</option>
              </select>
            </label>
            <label>
              <span>Barangay</span>
              <select value={historyBarangayFilter} onChange={(event) => setHistoryBarangayFilter(event.target.value)}>
                <option value="">All barangays</option>
                {historyBarangays.map((barangay) => <option key={barangay} value={barangay}>{barangay}</option>)}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={historySort} onChange={(event) => setHistorySort(event.target.value as HistorySort)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="barangay">Barangay A-Z</option>
                <option value="food">Highest Family Food Packs</option>
                <option value="medicine">Highest Medicine Kits</option>
                <option value="goods">Highest Relief Goods</option>
              </select>
            </label>
            <label className={styles.historySearch}>
              <span>Search</span>
              <input
                type="search"
                placeholder="Search ID, date, barangay, or goods..."
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
              />
            </label>
            <button type="button" onClick={resetHistoryFilters}>Reset</button>
          </div>
          <div className={styles.historyTableWrap}>
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
              {filteredHistory.map((entry) => (
                <tr key={entry.recommendation_id}>
                  <td title={entry.recommendation_id}>{entry.id}</td>
                  <td>{entry.date}</td>
                  <td>{entry.time}</td>
                  <td>{entry.barangay}</td>
                  <td>{entry.familyFoodPacks}</td>
                  <td>{entry.medicineKits}</td>
                  <td>{entry.reliefForIndividual}</td>
                </tr>
              ))}
              {!isLoading && filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title={history.length === 0 ? "No allocation history yet." : "No allocation history matches your filters."}
                      description={history.length === 0 ? "Generated allocation recommendations will appear here." : "Try changing the date, barangay, sort, or search filters."}
                    />
                  </td>
                </tr>
              ) : null}
            </DataTable>
          </div>
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
              <div className={styles.inventoryItem} key={item.inventory_id || `${item.name}-${index}`}>
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
            {!isLoading && draftInventory.length === 0 ? (
              <EmptyState
                title="No relief inventory available"
                description="Inventory items will appear here once the inventory API returns data."
              />
            ) : null}
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

      <ActionResultModal
        open={resultModal.open}
        type={resultModal.type}
        title={resultModal.title}
        description={resultModal.description}
        details={resultModal.details}
        primaryLabel="OK"
        onPrimary={() => setResultModal((current) => ({ ...current, open: false }))}
        onClose={() => setResultModal((current) => ({ ...current, open: false }))}
      />
    </>
  );
}

function quantityFor(items: ReliefInventoryItem[], partialName: string) {
  return items.find((item) => item.name.toLowerCase().includes(partialName.toLowerCase()))?.quantity ?? 0;
}

function latestUniqueRecommendations(rows: Record<string, unknown>[]) {
  const latestByBarangay = new Map<string, Record<string, unknown>>();

  for (const row of rows) {
    const key = recommendationBarangayKey(row);
    if (!key || latestByBarangay.has(key)) continue;
    latestByBarangay.set(key, row);
  }

  return Array.from(latestByBarangay.values());
}

function recommendationBarangayKey(row: Record<string, unknown>) {
  const barangayId = row.barangay_id == null ? "" : String(row.barangay_id).trim();
  if (["1", "2", "3"].includes(barangayId)) return barangayId;

  const barangayName = String(row.barangay_name ?? row.barangay ?? "").trim().toLowerCase();
  if (barangayName === "barangay tanong") return "1";
  if (barangayName === "barangay catmon") return "2";
  if (barangayName === "barangay potrero") return "3";
  return "";
}

function mapRecommendation(row: Record<string, unknown>, index: number): ReliefRecommendation {
  const foodPacks = Number(row.recommended_family_food_packs ?? 0);
  const medicineKits = Number(row.recommended_medicine_kits ?? 0);
  const individualGoods = Number(row.recommended_relief_goods_individual ?? 0);
  const analysisReason = formatAnalysisReason(String(row.analysis_reason ?? fallbackAnalysisReason(row)));

  return {
    recommendation_id: row.recommendation_id ? String(row.recommendation_id) : undefined,
    id: String(index + 1),
    barangay_name: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    barangay: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    recommendedItems: `${foodPacks} food packs, ${medicineKits} medicine kits, ${individualGoods} individual goods`,
    analysisReason,
    report: analysisReason,
  };
}

function fallbackAnalysisReason(row: Record<string, unknown>) {
  const riskLevel = String(row.risk_level ?? "normal").replace(/_/g, " ");
  return `${riskLevel} flood risk.`;
}

function formatAnalysisReason(reason: string) {
  const withoutScore = reason
    .replace(/\s*,?\s*priority[_\s-]*score\s*:?\s*\d+(\.\d+)?/gi, "")
    .replace(/\s*,?\s*priority[_\s-]*score\s*:?\s*n\/a/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();

  const normalized = withoutScore
    .replace(/\b1 affected families\b/gi, "1 affected family")
    .replace(/\b(\d+) affected family record(s)?\b/gi, (_match, count: string) => `${count} affected ${count === "1" ? "family record" : "family records"}`);

  const sensorMatch = normalized.match(/^(critical|warning|normal)\s+flood risk at ([^,.]+),\s*(\d+)\s+affected famil(?:y|ies)\.?$/i);
  if (sensorMatch) {
    const [, risk, level, familyCount] = sensorMatch;
    return `${capitalize(risk)} flood risk detected at ${level.trim()} with ${familyCount} affected ${familyCount === "1" ? "family" : "families"}.`;
  }

  const noReadingMatch = normalized.match(/^no latest sensor reading available,\s*(\d+)\s+affected famil(?:y|ies)\.?$/i);
  if (noReadingMatch) {
    const familyCount = noReadingMatch[1];
    return `No latest sensor reading available. Based on ${familyCount} affected ${familyCount === "1" ? "family record" : "family records"}.`;
  }

  if (!normalized) return "Recommendation generated from current flood and resident data.";
  return ensureSentence(capitalize(normalized));
}

function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function ensureSentence(value: string) {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function mapHistory(row: Record<string, unknown>, index: number) {
  const createdAt = row.created_at ? new Date(String(row.created_at)) : new Date();
  const recommendationId = String(row.recommendation_id ?? index + 1);

  return {
    recommendation_id: recommendationId,
    id: shortenId(recommendationId),
    createdAt,
    barangay_name: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    date: createdAt.toLocaleDateString(),
    time: createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    barangay: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    familyFoodPacks: Number(row.recommended_family_food_packs ?? 0),
    medicineKits: Number(row.recommended_medicine_kits ?? 0),
    reliefForIndividual: Number(row.recommended_relief_goods_individual ?? 0),
  };
}

function shortenId(id: string) {
  return id.length > 12 ? id.slice(0, 8) : id;
}

function defaultHistoryDateFilter(history: HistoryEntry[]): Exclude<HistoryDateFilter, ""> {
  return history.some((entry) => isInDateFilter(entry.createdAt, "today")) ? "today" : "all";
}

function isInDateFilter(date: Date, filter: Exclude<HistoryDateFilter, "">) {
  if (filter === "all") return true;
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEntry = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (filter === "today") {
    return startOfEntry.getTime() === startOfToday.getTime();
  }

  if (filter === "last7") {
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(startOfToday.getDate() - 6);
    return startOfEntry >= sevenDaysAgo && startOfEntry <= startOfToday;
  }

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function sortHistoryEntries(a: HistoryEntry, b: HistoryEntry, sort: HistorySort) {
  if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
  if (sort === "barangay") return a.barangay.localeCompare(b.barangay);
  if (sort === "food") return b.familyFoodPacks - a.familyFoodPacks;
  if (sort === "medicine") return b.medicineKits - a.medicineKits;
  if (sort === "goods") return b.reliefForIndividual - a.reliefForIndividual;
  return b.createdAt.getTime() - a.createdAt.getTime();
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
