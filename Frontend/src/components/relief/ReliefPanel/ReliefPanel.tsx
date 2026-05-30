"use client";

import { useState } from "react";
import {
  reliefAllocationHistoryMock,
  reliefInventoryMock,
  reliefRecommendationsMock,
} from "@/data/relief.mock";
import { Button } from "@/components/ui/Button/Button";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import { Modal } from "@/components/ui/Modal/Modal";
import type { ReliefInventoryItem, ReliefRecommendation } from "@/types/relief";
import styles from "./ReliefPanel.module.css";

const emptyReliefInventory = reliefInventoryMock.map((item) => ({ ...item, quantity: 0 }));

export function ReliefPanel() {
  const [inventory, setInventory] = useState<ReliefInventoryItem[]>(emptyReliefInventory);
  const [draftInventory, setDraftInventory] = useState<ReliefInventoryItem[]>(emptyReliefInventory);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReliefRecommendation | null>(null);

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

  function saveInventory() {
    setInventory(draftInventory);
    setIsInventoryOpen(false);
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
              <Button className={styles.actionButton}>Generate Recommendation</Button>
              <Button className={styles.actionButton} onClick={openInventoryModal}>
                Input Available Relief
              </Button>
            </div>
          </div>

          <div className={styles.recommendationList}>
            {reliefRecommendationsMock.map((recommendation) => (
              <article
                className={styles.recommendationCard}
                key={recommendation.id}
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
            {reliefAllocationHistoryMock.map((entry, index) => (
              <tr key={`${entry.barangay}-${entry.date}-${index}`}>
                <td>{entry.id}</td>
                <td>{entry.date}</td>
                <td>{entry.time}</td>
                <td>{entry.barangay}</td>
                <td>{entry.familyFoodPacks}</td>
                <td>{entry.medicineKits}</td>
                <td>{entry.reliefForIndividual}</td>
              </tr>
            ))}
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
            {draftInventory.map((item) => (
              <div className={styles.inventoryItem} key={item.id}>
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
