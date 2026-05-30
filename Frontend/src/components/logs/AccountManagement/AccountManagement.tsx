import { accountUsersMock } from "@/data/logs.mock";
import { Badge } from "@/components/ui/Badge/Badge";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import styles from "./AccountManagement.module.css";

export function AccountManagement() {
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
      <DataTable headers={["Name", "Department", "Role", "Status", "Last Login", "Actions"]} minWidth={880}>
        {accountUsersMock.map((user) => (
          <tr key={user.name}>
            <td>{user.name}</td>
            <td><Badge tone={departmentTone(user.department)}>{user.department}</Badge></td>
            <td>{user.role}</td>
            <td><Badge tone={user.status === "Active" ? "green" : "gray"}>{user.status}</Badge></td>
            <td>{user.lastLogin}</td>
            <td><span className={styles.edit} /><span className={styles.delete} /><span className={styles.view} /></td>
          </tr>
        ))}
      </DataTable>
    </article>
  );
}

function departmentTone(department: string) {
  if (department === "Barangay") return "green";
  if (department === "CSWDD") return "orange";
  return "purple";
}
