"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { residentsMock } from "@/data/residents.mock";
import styles from "./ResidentsPanel.module.css";

type ResidentRow = {
  id: string;
  name: string;
  age: number | string;
  sex: string;
  address: string;
  barangay: string;
  contact: string;
  selected?: boolean;
};

type FamilyRow = {
  id: string;
  familyName: string;
  familyHead: string;
  pwd: number;
  elderly: number;
  fourPs: number;
  lactating: number;
  pregnant: number;
  infant: number;
};

export function ResidentsPanel() {
  const [residents, setResidents] = useState<ResidentRow[]>(residentsMock);
  const [familyClusters, setFamilyClusters] = useState<FamilyRow[]>([]);
  const [familySearch, setFamilySearch] = useState("");

  useEffect(() => {
    fetch("/api/residents")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.success) {
          setResidents(payload.data.map(mapResident));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const query = familySearch ? `?search=${encodeURIComponent(familySearch)}` : "";
    fetch(`/api/families${query}`)
      .then((response) => response.json())
      .then((payload) => {
        if (payload.success) {
          setFamilyClusters(payload.data.map(mapFamily));
        }
      })
      .catch(() => undefined);
  }, [familySearch]);

  const displayedResidents = useMemo(() => residents, [residents]);

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
                  {displayedResidents.map((resident, index) => (
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
                <input
                  type="search"
                  placeholder="Search by name, ID, address, age, sex, or contact..."
                  value={familySearch}
                  onChange={(event) => setFamilySearch(event.target.value)}
                />
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

function mapResident(row: Record<string, unknown>): ResidentRow {
  return {
    id: String(row.id),
    name: [row.first_name, row.middle_name, row.last_name, row.suffix].filter(Boolean).join(" "),
    age: String(row.age ?? ""),
    sex: String(row.sex ?? ""),
    address: String(row.complete_address ?? ""),
    barangay: String(row.barangay_name ?? ""),
    contact: String(row.contact_number ?? ""),
  };
}

function mapFamily(row: Record<string, unknown>): FamilyRow {
  return {
    id: String(row.id),
    familyName: String(row.family_name ?? ""),
    familyHead: String(row.family_head_name ?? ""),
    pwd: Number(row.pwd_count ?? 0),
    elderly: Number(row.elderly_count ?? 0),
    fourPs: Number(row.four_ps_count ?? 0),
    lactating: Number(row.lactating_count ?? 0),
    pregnant: Number(row.pregnant_count ?? 0),
    infant: Number(row.infant_count ?? 0),
  };
}
