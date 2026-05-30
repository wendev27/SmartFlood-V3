import type { ReactNode } from "react";
import styles from "./DataTable.module.css";

interface DataTableProps {
  headers: string[];
  children: ReactNode;
  minWidth?: number;
}

export function DataTable({ headers, children, minWidth = 820 }: DataTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table} style={{ minWidth }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
