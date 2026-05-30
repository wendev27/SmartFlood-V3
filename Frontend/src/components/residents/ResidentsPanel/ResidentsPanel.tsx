import { residentsMock } from "@/data/residents.mock";
import { cn } from "@/lib/cn";
import styles from "./ResidentsPanel.module.css";

const familyClusters = [
  {
    id: "001",
    familyName: "Divina Family",
    familyHead: "Rich Divina",
    pwd: 1,
    elderly: 2,
    fourPs: 0,
    lactating: 0,
    pregnant: 0,
    infant: 1,
  },
  {
    id: "002",
    familyName: "Bitago Family",
    familyHead: "Gerald Bitago",
    pwd: 0,
    elderly: 0,
    fourPs: 0,
    lactating: 0,
    pregnant: 0,
    infant: 0,
  },
  {
    id: "003",
    familyName: "Lagudgud Family",
    familyHead: "Nessy Lagudgud",
    pwd: 0,
    elderly: 1,
    fourPs: 0,
    lactating: 0,
    pregnant: 0,
    infant: 0,
  },
];

export function ResidentsPanel() {
  return (
    <section className={styles.panel} aria-label="Resident information">
      <div className={styles.scrollArea}>
        <article className={styles.card}>
          <h3>All Residents</h3>
          <div className={styles.cardBody}>
            <div className={styles.toolbar}>
              <label className={styles.searchField}>
                <span className="srOnly">Search residents</span>
                <span className={styles.searchIcon} aria-hidden="true" />
                <input type="search" placeholder="Search by name, ID, address, age, sex, or contact..." />
              </label>
              <button className={styles.filterButton} type="button">
                <span className={styles.filterIcon} aria-hidden="true" />
                Filters
              </button>
            </div>

            <div className={styles.wrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Sex</th>
                    <th>Address</th>
                    <th>Barangay</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residentsMock.map((resident, index) => (
                    <tr key={resident.id} className={cn(resident.selected && styles.selected)}>
                      <td>{String(index + 1).padStart(3, "0")}</td>
                      <td>
                        <a href="#">{resident.name}</a>
                      </td>
                      <td>{resident.age}</td>
                      <td>{resident.sex}</td>
                      <td>{resident.address}</td>
                      <td>{resident.barangay}</td>
                      <td>{resident.contact}</td>
                      <td>
                        <button className={styles.editButton} type="button">
                          <span aria-hidden="true">/</span>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <h3>Family Cluster</h3>
          <div className={styles.cardBody}>
            <div className={cn(styles.toolbar, styles.compactToolbar)}>
              <label className={styles.searchField}>
                <span className="srOnly">Search family clusters</span>
                <span className={styles.searchIcon} aria-hidden="true" />
                <input type="search" placeholder="Search by name, ID, address, age, sex, or contact..." />
              </label>
            </div>

            <div className={styles.wrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Family Name</th>
                    <th>Family head</th>
                    <th>PWD</th>
                    <th>Elderly</th>
                    <th>4Ps</th>
                    <th>Lactating</th>
                    <th>Pregnant</th>
                    <th>Infant</th>
                  </tr>
                </thead>
                <tbody>
                  {familyClusters.map((cluster) => (
                    <tr key={cluster.id}>
                      <td>{cluster.id}</td>
                      <td>
                        <a href="#">{cluster.familyName}</a>
                      </td>
                      <td>{cluster.familyHead}</td>
                      <td>{cluster.pwd}</td>
                      <td>{cluster.elderly}</td>
                      <td>{cluster.fourPs}</td>
                      <td>{cluster.lactating}</td>
                      <td>{cluster.pregnant}</td>
                      <td>{cluster.infant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
