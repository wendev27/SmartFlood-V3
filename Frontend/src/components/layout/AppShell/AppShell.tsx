"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { Topbar } from "@/components/layout/Topbar/Topbar";
import type { PageKey } from "@/types/navigation";
import styles from "./AppShell.module.css";

interface AppShellProps {
  activePage: PageKey;
  isMobileNavOpen: boolean;
  hideTopbar?: boolean;
  onNavigate: (page: PageKey) => void;
  onToggleMobileNav: () => void;
  children: ReactNode;
}

export function AppShell({
  activePage,
  isMobileNavOpen,
  hideTopbar = false,
  onNavigate,
  onToggleMobileNav,
  children,
}: AppShellProps) {
  return (
    <main className={styles.shell}>
      <Sidebar
        activePage={activePage}
        isOpen={isMobileNavOpen}
        onNavigate={onNavigate}
        onToggleMobileNav={onToggleMobileNav}
      />
      <section className={styles.dashboard}>
        {hideTopbar ? null : <Topbar activePage={activePage} />}
        {children}
      </section>
    </main>
  );
}
