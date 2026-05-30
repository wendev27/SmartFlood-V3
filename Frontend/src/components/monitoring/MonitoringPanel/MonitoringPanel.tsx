"use client";

import { useState } from "react";
import { SmartFloodIcon, type SmartFloodIconName } from "@/components/icons/SmartFloodIcon";
import styles from "./MonitoringPanel.module.css";

export type MonitoringView = "main" | "alertLevels" | "heatmap" | "history";

interface MonitoringPanelProps {
  onViewChange?: (view: MonitoringView) => void;
}

export function MonitoringPanel({ onViewChange }: MonitoringPanelProps) {
  const [activeView, setActiveView] = useState<MonitoringView>("main");

  function changeView(view: MonitoringView) {
    setActiveView(view);
    onViewChange?.(view);
  }

  if (activeView === "alertLevels") {
    return <AlertLevelManagement onBack={() => changeView("main")} />;
  }

  if (activeView === "heatmap") {
    return <FloodHeatmap onBack={() => changeView("main")} />;
  }

  if (activeView === "history") {
    return <FloodHistory onBack={() => changeView("main")} />;
  }

  return (
    <section className={styles.panel} aria-label="Flood monitoring modules">
      <div className={styles.moduleCards}>
        {monitoringModules.map((item) => (
          <article className={styles.moduleCard} key={item.label}>
            <span className={styles.moduleIcon}>
              <SmartFloodIcon name={item.icon} size={40} />
            </span>
            <strong>{item.label}</strong>
            <p>{item.caption}</p>
            {item.view === "alertLevels" ? (
              <button className={styles.openButton} type="button" onClick={() => changeView("alertLevels")}>
                Open <span aria-hidden="true">↗</span>
              </button>
            ) : item.view === "heatmap" ? (
              <button className={styles.openButton} type="button" onClick={() => changeView("heatmap")}>
                Open <span aria-hidden="true">↗</span>
              </button>
            ) : item.view === "history" ? (
              <button className={styles.openButton} type="button" onClick={() => changeView("history")}>
                Open <span aria-hidden="true">↗</span>
              </button>
            ) : (
              <a href="#monitoring">Open <span aria-hidden="true">↗</span></a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function FloodHistory({ onBack }: { onBack: () => void }) {
  return (
    <section className={styles.historyPage} aria-label="Flood history">
      <button className={styles.backButton} type="button" onClick={onBack}>
        <span aria-hidden="true">←</span>
        Back
      </button>

      <h2>Flood History</h2>

      <article className={styles.historyCard}>
        <h3>Flood History Records</h3>
        <div className={styles.historyBody}>
          <button className={styles.historyFilter} type="button">
            <span aria-hidden="true">☷</span>
            Filters
          </button>

          <h4>Flood Level Timeline</h4>
          <div className={styles.lineChartWrap}>
            <div className={styles.historyYAxis}>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            <span className={styles.historyAxisLabel}>Max Level (m)</span>
            <div className={styles.lineChart}>
              <svg viewBox="0 0 720 150" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 99 C70 102 120 86 190 72 C270 54 320 42 395 38 C480 34 560 55 720 70" />
              </svg>
              <span className={`${styles.lineDot} ${styles.dotWarning}`} />
              <span className={`${styles.lineDot} ${styles.dotCritical}`} />
              <span className={`${styles.lineDot} ${styles.dotAlert}`} />
            </div>
          </div>

          <div className={styles.historyTableWrap}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Baragay</th>
                  <th>Minimum</th>
                  <th>Max Level</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((record) => (
                  <tr key={`${record.date}-${record.location}`}>
                    <td>{record.date}</td>
                    <td>{record.location}</td>
                    <td>{record.barangay}</td>
                    <td>{record.minimum}</td>
                    <td>{record.maxLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  );
}

function FloodHeatmap({ onBack }: { onBack: () => void }) {
  return (
    <section className={styles.heatmapPage} aria-label="Flood heatmap">
      <div className={styles.heatmapTop}>
        <div>
          <button className={styles.backButton} type="button" onClick={onBack}>
            <span aria-hidden="true">←</span>
            Back
          </button>
          <h2>Flood Heatmap</h2>
          <p>Monitor flood levels and manage alerts</p>
        </div>
        <button className={styles.reviewButton} type="button">
          <span aria-hidden="true">▣</span>
          Review Narrative Report
        </button>
      </div>

      <article className={styles.heatmapCard}>
        <div className={styles.heatmapHeader}>
          <h3>Flood Risk Heatmap</h3>
          <div className={styles.legendRow}>
            <span><i className={styles.legendWarning} />Warning</span>
            <span><i className={styles.legendAlert} />Alert</span>
            <span><i className={styles.legendCritical} />Critical</span>
          </div>
        </div>
        <div className={styles.mapCanvas}>
          <span className={styles.hotspotOne} />
          <span className={styles.hotspotTwo} />
          <span className={styles.pinOne}>⌖</span>
          <span className={styles.pinTwo}>⌖</span>
          <span className={styles.mapTooltip}>Area 1: Normal</span>
          <span className={styles.mapScribble} aria-hidden="true" />
        </div>
      </article>

      <article className={styles.chartCard}>
        <h3>Water Level Trends (Current)</h3>
        <div className={styles.chartWrap}>
          <div className={styles.yAxis}>
            <span>8</span>
            <span>6</span>
            <span>4</span>
            <span>2</span>
            <span>0</span>
          </div>
          <span className={styles.axisLabel}>Water Level (m)</span>
          <div className={styles.barChart}>
            <span className={styles.hoverNote}>
              Barangay Tanong- Street Sebastian
              <b>2.1m</b>
              <em>Warning</em>
            </span>
            {waterLevels.map((item) => (
              <div className={styles.barSlot} key={item.label}>
                <span
                  className={`${styles.bar} ${styles[item.tone]}`}
                  style={{ height: `${item.height}%` }}
                />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.chartLegend}>
          <span><i className={styles.legendWarning} />Warning (m)</span>
          <span><i className={styles.legendAlert} />Alert (m)</span>
          <span><i className={styles.legendCritical} />Critical (m)</span>
        </div>
      </article>

      <article className={styles.distributionCard}>
        <h3>Flood Risk Distribution</h3>
        <div className={styles.distributionBody}>
          <div className={styles.donut}>
            <div>
              <strong>12</strong>
              <span>Areas</span>
            </div>
          </div>
          <div className={styles.distributionStats}>
            {riskDistribution.map((item) => (
              <div key={item.label}>
                <span><i className={styles[item.dot]} />{item.label}</span>
                <strong className={styles[item.valueTone]}>{item.value}</strong>
                <small>{item.percent}</small>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function AlertLevelManagement({ onBack }: { onBack: () => void }) {
  return (
    <section className={styles.alertPage} aria-label="Alert level management">
      <button className={styles.backButton} type="button" onClick={onBack}>
        <span aria-hidden="true">←</span>
        Back
      </button>

      <h2>Alert Level Management</h2>

      <article className={styles.configPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Alert Level Configuration</h3>
            <p>Manage flood alert thresholds and automated actions</p>
          </div>
          <button className={styles.addButton} type="button">
            <span aria-hidden="true">+</span>
            Add New Alert Level
          </button>
        </div>

        <div className={styles.alertCards}>
          {alertLevels.map((level) => (
            <section className={`${styles.alertCard} ${styles[level.tone]}`} key={level.name}>
              <div className={styles.levelTop}>
                <span className={styles.levelIcon}>
                  <SmartFloodIcon name="alertLevel" size={20} />
                </span>
                <div>
                  <strong>{level.name}</strong>
                  <small>{level.range}</small>
                </div>
              </div>
              <p>{level.action}</p>
              <span className={styles.levelNote}>{level.note}</span>
              <div className={styles.cardActions}>
                <button className={styles.editButton} type="button">
                  <span aria-hidden="true">/</span>
                  Edit
                </button>
                <button className={styles.deleteButton} type="button">
                  <span aria-hidden="true">□</span>
                  Delete
                </button>
              </div>
            </section>
          ))}
        </div>
      </article>

      <article className={styles.activityPanel}>
        <h3>Recent Alert Activity</h3>
        <div className={styles.activityList}>
          {recentActivity.map((activity) => (
            <section className={`${styles.activityItem} ${styles[activity.tone]}`} key={activity.title}>
              <span className={styles.activityIcon}>
                <SmartFloodIcon name="alertLevel" size={20} />
              </span>
              <div>
                <strong>{activity.title}</strong>
                <p>{activity.meta}</p>
              </div>
              <span className={styles.activityBadge}>{activity.badge}</span>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}

const monitoringModules: Array<{
  label: string;
  caption: string;
  icon: SmartFloodIconName;
  view?: "alertLevels" | "heatmap" | "history";
}> = [
  {
    label: "Alert Level Management",
    caption: "View descriptive graphs and narrative reports",
    icon: "alertLevel",
    view: "alertLevels",
  },
  {
    label: "Flood Heatmap",
    caption: "View real-time flood intensity across regions",
    icon: "floodHeatmap",
    view: "heatmap",
  },
  {
    label: "Flood History",
    caption: "View tabulated flood history records",
    icon: "floodHistory",
    view: "history",
  },
];

const alertLevels = [
  {
    name: "Alert",
    range: "0m - 2m",
    action: "Automated Action",
    note: "Monitor closely, prepare evacuation",
    tone: "alert",
  },
  {
    name: "Warning",
    range: "2m - 4m",
    action: "Automated Action",
    note: "Prepare evacuation, mobilize resources",
    tone: "warning",
  },
  {
    name: "Critical",
    range: "4m - 6m+",
    action: "Automated Action",
    note: "Evacuate immediately, deploy relief",
    tone: "critical",
  },
] as const;

const waterLevels = [
  { id: "tanong-sebastian-warning", label: "Barangay Tanong - Street sebastian", height: 26, tone: "warningBar" },
  { id: "tanong-sebastian-critical", label: "Barangay Tanong - Street Sebastian", height: 26, tone: "criticalBar" },
  { id: "tanong-sebastian-alert", label: "Barangay Tanong - Street Sebastian", height: 50, tone: "alertBar" },
  { id: "tanong-sebastian-low", label: "Barangay Tanong - Street Sebastian", height: 19, tone: "warningBar" },
] as const;

const riskDistribution = [
  { label: "Warning", value: "2", percent: "90%", dot: "legendWarning", valueTone: "warningText" },
  { label: "Alert", value: "2", percent: "50%", dot: "legendAlert", valueTone: "alertText" },
  { label: "Critical", value: "1", percent: "10%", dot: "legendCritical", valueTone: "criticalText" },
] as const;

const recentActivity = [
  {
    title: "Critical alert triggered at Barangay Tanong",
    meta: "Water level: 4.8m · 2 minutes ago",
    badge: "Critical",
    tone: "critical",
  },
  {
    title: "Warning level at Barangay Potrero",
    meta: "Water level: 3.2m · 15 minutes ago",
    badge: "Alert",
    tone: "warning",
  },
  {
    title: "Alert level at Barangay Catmon",
    meta: "Water level: 1.5m · 1 hour ago",
    badge: "Warning",
    tone: "alert",
  },
] as const;

const historyRecords = [
  {
    date: "2026-04-10",
    location: "Creek Bridge",
    barangay: "Catmon",
    minimum: "",
    maxLevel: "4.2m",
  },
  {
    date: "2026-03-28",
    location: "Riverside Area",
    barangay: "Tanong",
    minimum: "",
    maxLevel: "6.1m",
  },
  {
    date: "2026-03-15",
    location: "Main Street",
    barangay: "Potrero",
    minimum: "",
    maxLevel: "3.0m",
  },
] as const;
