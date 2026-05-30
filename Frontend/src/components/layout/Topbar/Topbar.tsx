import { pageCopy } from "@/data/pageCopy";
import type { PageKey } from "@/types/navigation";
import styles from "./Topbar.module.css";

interface TopbarProps {
  activePage: PageKey;
}

export function Topbar({ activePage }: TopbarProps) {
  const copy = pageCopy[activePage];
  const isBarangayProfile = activePage === "residents" || activePage === "accounts";

  return (
    <header className={styles.topbar}>
      <div>
        <h2>{copy.title}</h2>
        {copy.subtitle ? <p>{copy.subtitle}</p> : null}
      </div>
      <div className={styles.actions}>
        <button className={styles.alertButton} type="button" aria-label="Notifications">
          <span className={styles.bell} />
          <strong>3</strong>
        </button>
        <div className={styles.profileChip}>
          <div>
            <b>{isBarangayProfile ? "Barangay Official" : "NDRRMO Official"}</b>
            <span>{isBarangayProfile ? "Administrator" : "Disaster Response"}</span>
          </div>
          <span className={styles.avatar}>{isBarangayProfile ? "BO" : "NO"}</span>
        </div>
      </div>
    </header>
  );
}
