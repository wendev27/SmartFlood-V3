"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionResultModal, type ActionResultType } from "@/components/ui/ActionResultModal";
import { Button } from "@/components/ui/Button/Button";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal/Modal";
import { getFloodStatusLabel } from "@/lib/statusStyles";
import {
  generateReliefRecommendations,
  getReliefRecommendations,
} from "@/services/reliefService";
import type { ReliefRecommendation } from "@/types/relief";
import styles from "./ReliefPanel.module.css";

type HistoryEntry = ReturnType<typeof mapHistory>;
type HistoryDateFilter = "" | "all" | "today" | "last7" | "month";
type HistorySort = "newest" | "oldest" | "barangay" | "food" | "medicine" | "goods";
type GenerationInventoryField = "family_food_packs" | "medicine_kits" | "relief_goods_individual";

const generationInventoryDefaults: Record<GenerationInventoryField, string> = {
  family_food_packs: "0",
  medicine_kits: "0",
  relief_goods_individual: "0",
};

export function ReliefPanel() {
  const [generationInventory, setGenerationInventory] = useState<Record<GenerationInventoryField, string>>(generationInventoryDefaults);
  const [isGenerationOpen, setIsGenerationOpen] = useState(false);
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
        const recommendationRows = await getReliefRecommendations();

        if (cancelled) return;

        setRecommendations(latestUniqueRecommendations(recommendationRows).map(mapRecommendation));
        setHistory(recommendationRows.map(mapHistory));
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

  function openGenerationModal() {
    setGenerationInventory(generationInventoryDefaults);
    setIsGenerationOpen(true);
  }

  function updateGenerationQuantity(field: GenerationInventoryField, value: string) {
    if (!/^\d*$/.test(value)) return;
    setGenerationInventory((current) => ({ ...current, [field]: value }));
  }

  function normalizeGenerationQuantity(field: GenerationInventoryField) {
    setGenerationInventory((current) => ({ ...current, [field]: String(parseWholeNumber(current[field])) }));
  }

  async function submitGeneration() {
    const payload = {
      family_food_packs: parseWholeNumber(generationInventory.family_food_packs),
      medicine_kits: parseWholeNumber(generationInventory.medicine_kits),
      relief_goods_individual: parseWholeNumber(generationInventory.relief_goods_individual),
    };

    if (!hasAnyInventory(payload)) {
      setResultModal({
        open: true,
        type: "error",
        title: "Relief Inventory Required",
        description: "Please input available relief inventory before generating recommendations.",
        details: "At least one inventory value must be greater than 0.",
      });
      return;
    }

    setIsGenerating(true);
    setError("");
    try {
      const generatedRows = await generateReliefRecommendations(payload);
      const latestRows = await getReliefRecommendations();
      const currentRows = generatedRows.length > 0 ? generatedRows : latestUniqueRecommendations(latestRows);
      setRecommendations(currentRows.map(mapRecommendation));
      setHistory(latestRows.map(mapHistory));
      setIsGenerationOpen(false);
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
        details: "Please verify the entered inventory, sensor data, and resident data before trying again.",
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
              <Button className={styles.actionButton} onClick={openGenerationModal} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Recommendation"}
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
                description="Generate a recommendation once flood data is available, then enter the current relief inventory."
                actionLabel="Generate Recommendation"
                onAction={openGenerationModal}
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
        isOpen={isGenerationOpen}
        labelledBy="generate-relief-title"
        onClose={() => setIsGenerationOpen(false)}
      >
        <header className={styles.modalHeader}>
          <div>
            <h3 id="generate-relief-title">Generate Relief Recommendation</h3>
            <p>Input current available relief inventory to calculate recommended allocation.</p>
          </div>
          <button className={styles.closeButtonLight} type="button" onClick={() => setIsGenerationOpen(false)} aria-label="Close">
            x
          </button>
        </header>
        <div className={styles.inventoryBody}>
          <div className={styles.inventoryList}>
            <GenerationQuantityField
              label="Family Food Packs"
              unit="packs"
              value={generationInventory.family_food_packs}
              onBlur={() => normalizeGenerationQuantity("family_food_packs")}
              onChange={(value) => updateGenerationQuantity("family_food_packs", value)}
            />
            <GenerationQuantityField
              label="Medicine Kits"
              unit="kits"
              value={generationInventory.medicine_kits}
              onBlur={() => normalizeGenerationQuantity("medicine_kits")}
              onChange={(value) => updateGenerationQuantity("medicine_kits", value)}
            />
            <GenerationQuantityField
              label="Relief Goods for Individual"
              unit="pcs"
              value={generationInventory.relief_goods_individual}
              onBlur={() => normalizeGenerationQuantity("relief_goods_individual")}
              onChange={(value) => updateGenerationQuantity("relief_goods_individual", value)}
            />
          </div>
          <div className={styles.modalFooter}>
            <Button className={styles.footerButton} tone="muted" onClick={() => setIsGenerationOpen(false)}>
              Cancel
            </Button>
            <Button className={styles.footerButton} onClick={submitGeneration} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Recommendation"}
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
              <section className={styles.reportSection}>
                <h4>Recommendation Summary</h4>
                <dl className={styles.reportGrid}>
                  <ReportDetail label="Barangay" value={selectedReport.barangay} />
                  <ReportDetail label="Risk Level" value={selectedReport.riskLevel} />
                  <ReportDetail label="Affected Family Records" value={selectedReport.affectedFamilies} />
                  <ReportDetail label="Family Food Packs" value={selectedReport.familyFoodPacks} />
                  <ReportDetail label="Medicine Kits" value={selectedReport.medicineKits} />
                  <ReportDetail label="Relief Goods for Individual" value={selectedReport.reliefForIndividual} />
                </dl>
              </section>
              <section className={styles.reportSection}>
                <h4>Recommended Allocation</h4>
                <p>{selectedReport.recommendedItems}</p>
              </section>
              <section className={styles.reportSection}>
                <h4>Flood Risk / Fuzzy Logic Explanation</h4>
                <p>
                  The system uses fuzzy-rule-based flood classification to convert water level readings into understandable risk categories:
                  Normal is below alert threshold, Flood Alert is around 0.25m to 0.50m, Flood Warning is around 0.75m to 1.00m, and Severity is around 1.20m to 1.50m.
                  {!selectedReport.hasSensorReading ? " No latest sensor reading was available, so the recommendation relied more heavily on family vulnerability data." : ""}
                </p>
                <dl className={styles.reportGrid}>
                  <ReportDetail label="Fuzzy Risk Label" value={selectedReport.fuzzyExplanation?.riskLabel ?? selectedReport.riskLevel} />
                  <ReportDetail label="Water Level" value={formatWaterLevel(selectedReport.fuzzyExplanation?.waterLevelM)} />
                  <ReportDetail label="Fuzzy Confidence" value={formatConfidence(selectedReport.fuzzyExplanation?.confidence)} />
                </dl>
              </section>
              <section className={styles.reportSection}>
                <h4>AHP-inspired Vulnerability Explanation</h4>
                <p>
                  The recommendation applies AHP-inspired vulnerability weighting using household factors such as PWD, elderly, 4Ps, lactating, pregnant, infant, toddler, and total family members. These factors help prioritize barangays with more vulnerable residents.
                </p>
                <dl className={styles.reportGrid}>
                  <ReportDetail label="AHP Vulnerability Score" value={formatNumber(selectedReport.ahpVulnerabilityScore)} />
                </dl>
              </section>
              <section className={styles.reportSection}>
                <h4>AI Reasoning Steps</h4>
                {(selectedReport.reasoningSteps?.length ?? 0) > 0 ? (
                  <ol className={styles.reasoningList}>
                    {selectedReport.reasoningSteps?.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
                  </ol>
                ) : <p>No detailed reasoning steps were returned for this historical recommendation.</p>}
              </section>
              <section className={styles.reportSection}>
                <h4>Inventory Constraint Explanation</h4>
                <p>This recommendation uses fuzzy-rule-based flood classification to interpret sensor water levels, then applies AHP-inspired vulnerability weighting using family cluster factors such as PWD, elderly, pregnant, infant, toddler, and total family members. Final allocations are constrained by the available relief inventory entered during generation.</p>
              </section>
              <section className={styles.reportSection}>
                <h4>Final Analysis Reason</h4>
                <p>{selectedReport.report}</p>
              </section>
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

function parseWholeNumber(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/^0+(?=\d)/, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function hasAnyInventory(payload: Record<GenerationInventoryField, number>) {
  return Object.values(payload).some((value) => value > 0);
}

function GenerationQuantityField({
  label,
  unit,
  value,
  onBlur,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.inventoryItem}>
      <div>
        <strong>{label}</strong>
        <span>Unit: {unit}</span>
      </div>
      <div className={styles.quantityControl}>
        <label>
          <span className="srOnly">{label}</span>
          <input
            min={0}
            type="number"
            value={value}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
          />
          <small>{unit}</small>
        </label>
      </div>
    </div>
  );
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
  const affectedFamilies = Number(row.affected_families ?? affectedFamiliesFromReason(analysisReason));
  const rawRisk = String(row.risk_level ?? "");
  const riskLevel = formatRiskLevel(rawRisk || riskFromReason(analysisReason));
  const hasSensorReading = rawRisk !== "no_reading" && !/^No latest sensor reading/i.test(analysisReason);
  const hasAllocation = foodPacks + medicineKits + individualGoods > 0;
  const fuzzyExplanation = asRecord(row.fuzzy_explanation);
  const ahpBreakdown = asRecord(row.ahp_breakdown);

  return {
    recommendation_id: row.recommendation_id ? String(row.recommendation_id) : undefined,
    id: String(index + 1),
    barangay_name: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    barangay: String(row.barangay_name ?? row.barangay ?? "Unknown"),
    riskLevel,
    affectedFamilies,
    familyFoodPacks: foodPacks,
    medicineKits,
    reliefForIndividual: individualGoods,
    hasSensorReading,
    recommendedItems: hasAllocation
      ? `${foodPacks} food packs, ${medicineKits} medicine kits, ${individualGoods} individual goods`
      : "Inventory fully allocated to higher-priority areas.",
    analysisReason,
    report: analysisReason,
    fuzzyExplanation: fuzzyExplanation ? {
      waterLevelM: nullableNumber(fuzzyExplanation.water_level_m),
      confidence: nullableNumber(fuzzyExplanation.confidence),
      riskLabel: formatRiskLevel(String(fuzzyExplanation.risk_label ?? fuzzyExplanation.risk_level ?? riskLevel)),
    } : undefined,
    ahpVulnerabilityScore: nullableNumber(ahpBreakdown?.total_vulnerability_score),
    reasoningSteps: Array.isArray(row.reasoning_steps) ? row.reasoning_steps.map(String).filter(Boolean) : [],
  };
}

function affectedFamiliesFromReason(reason: string) {
  const match = reason.match(/(\d+)\s+affected/i);
  return match ? Number(match[1]) : 0;
}

function riskFromReason(reason: string) {
  const match = reason.match(/^(Normal|Flood Alert|Flood Warning|Critical|Warning|Severe|Severity)/i);
  return match?.[1] ?? "No reading";
}

function formatRiskLevel(value: string) {
  const normalized = value.replace(/_/g, " ").trim().toLowerCase();
  if (/^(critical|severe|severity|warning|alert|no reading|normal)$/.test(normalized)) return getFloodStatusLabel(normalized);
  return normalized ? capitalize(normalized) : "No reading";
}

function ReportDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function nullableNumber(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatWaterLevel(value: number | null | undefined) {
  return value == null ? "Unavailable" : `${value.toFixed(2)}m`;
}

function formatConfidence(value: number | null | undefined) {
  return value == null ? "Unavailable" : `${Math.round(value * 100)}%`;
}

function formatNumber(value: number | null | undefined) {
  return value == null ? "Unavailable" : value.toLocaleString(undefined, { maximumFractionDigits: 4 });
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

  const sensorMatch = normalized.match(/^(critical|severity|warning|normal|flood warning)\s+flood risk (?:detected )?at ([^,.]+)(?: with|,)\s*(\d+)\s+affected famil(?:y|ies)\.?(.*)$/i);
  if (sensorMatch) {
    const [, risk, level, familyCount, suffix] = sensorMatch;
    return `${formatRiskLevel(risk)} flood risk detected at ${level.trim()} with ${familyCount} affected ${familyCount === "1" ? "family" : "families"}.${suffix ? ` ${ensureSentence(capitalize(suffix.trim()))}` : ""}`;
  }

  const noReadingMatch = normalized.match(/^no latest sensor reading available\.?\s*(?:based on)?\s*(\d+)\s+affected famil(?:y|ies|y record|y records)\.?(.*)$/i);
  if (noReadingMatch) {
    const familyCount = noReadingMatch[1];
    const suffix = noReadingMatch[2]?.trim();
    return `No latest sensor reading available. Based on ${familyCount} affected ${familyCount === "1" ? "family record" : "family records"}.${suffix ? ` ${ensureSentence(capitalize(suffix))}` : ""}`;
  }

  if (!normalized) return "Recommendation generated from current flood and resident data.";
  return ensureSentence(capitalize(normalized.replace(/\bcritical\b/gi, "Severity")));
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
