import { cn } from "@/lib/cn";
import type { DashboardStat } from "@/types/dashboard";
import styles from "./StatCard.module.css";

interface StatCardProps {
  stat: DashboardStat;
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <article className={cn(styles.card, styles[stat.tone])}>
      <span>{stat.label}</span>
      <strong>{stat.value}</strong>
      <p className={stat.captionTone ? styles[stat.captionTone] : undefined}>{stat.caption}</p>
    </article>
  );
}
