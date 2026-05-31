"use client";

import { useState } from "react";
import { pageCopy } from "@/data/pageCopy";
import type { DashboardUserProfile } from "@/components/layout/AppShell/AppShell";
import { clearStoredSession } from "@/lib/authSession";
import type { PageKey } from "@/types/navigation";
import styles from "./Topbar.module.css";

interface TopbarProps {
  activePage: PageKey;
  userProfile: DashboardUserProfile;
}

export function Topbar({ activePage, userProfile }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const copy = activePage === "systemLogs"
    ? { ...pageCopy[activePage], title: userProfile.logLabel }
    : pageCopy[activePage];

  function logout() {
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audit_actor: {
          actor_user_id: userProfile.userId,
          actor_name: userProfile.displayName,
          actor_role: userProfile.roleLabel,
          barangay_id: userProfile.barangayId,
          barangay_name: userProfile.barangayName,
        },
        action: "LOGOUT",
        module: "Authentication",
        description: `${userProfile.displayName} logged out.`,
        target_type: "app_user",
        target_id: userProfile.userId,
      }),
      keepalive: true,
    }).catch(() => undefined);
    clearStoredSession();
    window.location.href = "/";
  }

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
        <div
          className={styles.profileMenu}
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <button
            className={styles.profileChip}
            type="button"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            onClick={() => setIsProfileOpen((current) => !current)}
          >
            <div>
              <b>{userProfile.roleLabel}</b>
              <span>{userProfile.roleSubtitle}</span>
            </div>
            <span className={styles.avatar}>{userProfile.initials}</span>
          </button>
          {isProfileOpen ? (
            <div className={styles.profileDropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownAvatar}>{userProfile.initials}</span>
                <div>
                  <b>{userProfile.displayName}</b>
                  <span>{userProfile.email || "No email available"}</span>
                </div>
              </div>
              <dl className={styles.profileDetails}>
                <div>
                  <dt>Role</dt>
                  <dd>{userProfile.roleLabel}</dd>
                </div>
                <div>
                  <dt>Access</dt>
                  <dd>{userProfile.logLabel}</dd>
                </div>
              </dl>
              <button className={styles.logoutButton} type="button" role="menuitem" onClick={logout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
