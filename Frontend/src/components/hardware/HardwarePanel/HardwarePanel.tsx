"use client";

import { useState } from "react";
import { hardwareStatusMock } from "@/data/hardware.mock";
import { Button } from "@/components/ui/Button/Button";
import { ControlCard } from "@/components/hardware/ControlCard/ControlCard";
import { SensorsPanel } from "@/components/sensors/SensorsPanel/SensorsPanel";
import { SmartFloodIcon, type SmartFloodIconName } from "@/components/icons/SmartFloodIcon";
import styles from "./HardwarePanel.module.css";

export function HardwarePanel() {
  const [activeView, setActiveView] = useState<"main" | "hardware" | "history">("main");

  if (activeView === "hardware") {
    return (
      <section className={styles.subPage} aria-label="Hardware configuration">
        <button className={styles.backButton} type="button" onClick={() => setActiveView("main")}>
          <span aria-hidden="true">←</span>
          Back
        </button>
        <HardwareConfiguration />
      </section>
    );
  }

  if (activeView === "history") {
    return (
      <section className={styles.subPage} aria-label="Sensor history">
        <button className={styles.backButton} type="button" onClick={() => setActiveView("main")}>
          <span aria-hidden="true">←</span>
          Back
        </button>
        <SensorsPanel />
      </section>
    );
  }

  return (
    <section className={styles.landingPanel} aria-label="Sensor configuration management">
      <div className={styles.moduleCards}>
        {sensorModules.map((item) => (
          <article className={styles.moduleCard} key={item.label}>
            <span className={styles.moduleIcon}>
              <SmartFloodIcon name={item.icon} size={40} />
            </span>
            <strong>{item.label}</strong>
            <p>{item.caption}</p>
            <button className={styles.openButton} type="button" onClick={() => setActiveView(item.view)}>
              Open <span aria-hidden="true">↗</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function HardwareConfiguration() {
  return (
    <section className={styles.panel} aria-label="Arduino control panel">
      <div className={styles.topRow}>
        <ControlCard label="DEVICE CONTROL">
          <Button className={styles.connectButton} tone="success"><span className={styles.wifiMark} />Connect via WiFi</Button>
        </ControlCard>
        <ControlCard label="CONNECTION STATUS">
          <div className={styles.disconnectStatus}>
            <div>
              <strong>Disconnected</strong>
              <p>Connect to start monitoring</p>
            </div>
            <span />
          </div>
        </ControlCard>
      </div>

      <div className={styles.monitorRow}>
        <ControlCard label="DEVICE STATUS">
          <div className={styles.statusStack}>
            <div className={styles.statusBox}><span>ESP32 Status</span><b className={styles.offline}>{hardwareStatusMock.esp32Status}</b><i /></div>
            <div className={styles.statusBox}><span>Status</span><b>{hardwareStatusMock.status}</b></div>
            <div className={styles.statusBox}><span>Last Update</span><b>{hardwareStatusMock.lastUpdate}</b></div>
          </div>
        </ControlCard>
        <ControlCard label="SENSOR MONITOR">
          <Meter label="Water Level" value={hardwareStatusMock.waterLevel} percent={hardwareStatusMock.waterLevelPercent} min="0m" max="10m" />
          <Meter label="Update Interval" value={hardwareStatusMock.updateInterval} percent={hardwareStatusMock.updateIntervalPercent} min="5s" max="60s" />
        </ControlCard>
        <ControlCard label="LIVE LOGS">
          <div className={styles.logStack}>
            {hardwareStatusMock.logs.map((log) => (
              <p key={`${log.time}-${log.message}`}>
                <span>{log.time}</span>
                <i className={styles[`${log.tone}Dot`]} />
                {log.message}
              </p>
            ))}
          </div>
          <div className={styles.logFade} />
        </ControlCard>
      </div>

      <ControlCard label="DEVICE COMMANDS">
        <div className={styles.commandGrid}>
          <form>
            <h3>WiFi Configuration</h3>
            <p>Enter your WiFi SSID and password to connect the ESP32</p>
            <input type="text" placeholder="SSID" aria-label="SSID" />
            <input type="password" placeholder="Password" aria-label="Password" />
            <Button className={styles.fullButton}>Update WiFi</Button>
            <Button className={styles.fullButton} tone="muted" disabled>Start</Button>
          </form>
          <form>
            <h3>Sensor Interval</h3>
            <p>Set the interval (in ms) between sensor readings</p>
            <input type="number" placeholder="5000" aria-label="Sensor interval" />
            <Button className={styles.fullButton} tone="purple">Set Interval</Button>
            <Button className={styles.fullButton} tone="muted" disabled>Stop</Button>
          </form>
        </div>
      </ControlCard>
    </section>
  );
}

const sensorModules: Array<{
  label: string;
  caption: string;
  icon: SmartFloodIconName;
  view: "hardware" | "history";
}> = [
  {
    label: "Hardware Configuration",
    caption: "Remotely configure your ESP32 sensor setup and send commands",
    icon: "hardware",
    view: "hardware",
  },
  {
    label: "Sensor History",
    caption: "Configure and monitor sensor devices",
    icon: "sensorConfiguration",
    view: "history",
  },
];

interface MeterProps {
  label: string;
  value: string;
  percent: number;
  min: string;
  max: string;
}

function Meter({ label, value, percent, min, max }: MeterProps) {
  return (
    <div className={styles.meterBlock}>
      <div className={styles.meterHead}><span>{label}</span><b>{value}</b></div>
      <div className={styles.meterTrack}><span style={{ width: `${percent}%` }} /></div>
      <div className={styles.meterScale}><span>{min}</span><span>{max}</span></div>
    </div>
  );
}
