"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge/Badge";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import { getAccountUsers } from "@/services/logsService";
import styles from "./AccountManagement.module.css";

type AccountUserRow = {
  user_id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  lastLogin: string;
};

export function AccountManagement() {
  const [users, setUsers] = useState<AccountUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getAccountUsers();
        if (!cancelled) setUsers(data.map(mapAccountUser));
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load account users.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className={styles.card}>
      <div className={styles.toolbar}>
        <label className={styles.search}><span /><input type="search" placeholder="Search by name, email..." /></label>
        <select aria-label="Department"><option>All Departments</option></select>
        <select aria-label="Role"><option>All Roles</option></select>
        <select aria-label="Status"><option>All Status</option></select>
        <button type="button" className={styles.exportButton}>Export</button>
        <button type="button" className={styles.addButton}>+ Add New</button>
      </div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <DataTable headers={["Name", "Department", "Role", "Status", "Last Login", "Actions"]} minWidth={880}>
        {users.map((user, index) => (
          <tr key={user.user_id ?? `${user.name}-${index}`}>
            <td>{user.name}</td>
            <td><Badge tone={departmentTone(user.department)}>{user.department}</Badge></td>
            <td>{user.role}</td>
            <td><Badge tone={user.status === "Active" ? "green" : "gray"}>{user.status}</Badge></td>
            <td>{user.lastLogin}</td>
            <td><span className={styles.edit} /><span className={styles.delete} /><span className={styles.view} /></td>
          </tr>
        ))}
        {isLoading ? (
          <tr>
            <td colSpan={6}>Loading account users...</td>
          </tr>
        ) : null}
        {!isLoading && users.length === 0 ? (
          <tr>
            <td colSpan={6}>No account users found.</td>
          </tr>
        ) : null}
      </DataTable>
    </article>
  );
}

function departmentTone(department: string) {
  if (department === "Barangay") return "green";
  if (department === "CSWDD") return "orange";
  return "purple";
}

function mapAccountUser(row: Record<string, unknown>): AccountUserRow {
  const firstName = String(row.first_name ?? "");
  const lastName = String(row.last_name ?? "");
  const fallbackName = [firstName, lastName].filter(Boolean).join(" ");
  const name = (row.full_name ?? row.name ?? fallbackName) || row.email || "Unnamed user";

  return {
    user_id: String(row.user_id ?? row.id ?? ""),
    name: String(name),
    department: String(row.department ?? "CDRRMO"),
    role: String(row.role ?? "User"),
    status: String(row.status ?? "Inactive"),
    lastLogin: String(row.last_login ?? row.lastLogin ?? "Never"),
  };
}
