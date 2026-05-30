import { cn } from "@/lib/cn";
import styles from "./MapPanel.module.css";

interface MapPanelProps {
  variant?: "dashboard" | "wide";
}

export function MapPanel({ variant = "dashboard" }: MapPanelProps) {
  return (
    <article className={cn(styles.map, styles[variant])} aria-label="Flood monitoring map">
      <span className={cn(styles.label, styles.caloocan)}>CALOOCAN</span>
      <span className={cn(styles.label, styles.quezon)}>QUEZON</span>
      <div className={styles.pin} aria-hidden="true">
        <span />
      </div>
      <div className={styles.legend}>
        <h3>ALERT STATUS</h3>
        <p><span className={cn(styles.dot, styles.normal)} />Normal</p>
        <p><span className={cn(styles.dot, styles.warning)} />Warning</p>
        <p><span className={cn(styles.dot, styles.critical)} />Critical</p>
      </div>
    </article>
  );
}
