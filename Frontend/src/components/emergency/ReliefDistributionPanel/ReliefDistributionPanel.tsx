"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  confirmReliefDistribution,
  getReliefDistributionHistory,
  verifyReliefDistribution,
} from "@/services/emergencyService";
import type {
  ReliefDistributionAllocation,
  ReliefDistributionBeneficiary,
  ReliefDistributionRecord,
  ReliefDistributionVerifyResponse,
} from "@/types/emergency";
import styles from "./ReliefDistributionPanel.module.css";

type LoadState = "idle" | "loading" | "verifying" | "confirming";

export function ReliefDistributionPanel() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<ReliefDistributionVerifyResponse | null>(null);
  const [history, setHistory] = useState<ReliefDistributionRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const receivedCount = history.filter((record) => record.status === "received").length;
  const lastAllocation = result?.data?.allocation ?? null;
  const remainingLabel = lastAllocation ? "Server checked per scanned family" : "Verify a family to resolve allocation";

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        setState("loading");
        const rows = await getReliefDistributionHistory();
        if (!cancelled) {
          setHistory(rows);
          setError(null);
        }
      } catch (historyError) {
        if (!cancelled) setError(historyError instanceof Error ? historyError.message : "Unable to load relief distribution history.");
      } finally {
        if (!cancelled) setState("idle");
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Enter a beneficiary QR, family ID, or resident ID.");
      return;
    }

    try {
      setState("verifying");
      setMessage(null);
      setError(null);
      const verification = await verifyReliefDistribution(trimmed);
      setResult(verification);
      if (verification.result === "ELIGIBLE") setMessage("Beneficiary is eligible for this distribution.");
      if (verification.result === "ALREADY_RECEIVED") setMessage("Relief already received for this family.");
      if (!["ELIGIBLE", "ALREADY_RECEIVED"].includes(verification.result)) setError(resultMessage(verification));
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify beneficiary.");
      setResult(null);
    } finally {
      setState("idle");
    }
  }

  async function handleConfirm() {
    if (!identifier.trim() || result?.result !== "ELIGIBLE") return;

    try {
      setState("confirming");
      setMessage(null);
      setError(null);
      const confirmation = await confirmReliefDistribution(identifier.trim(), result.data?.allocation?.item_id);
      setResult(confirmation);
      if (confirmation.result === "RECEIVED") {
        setMessage("Relief Distribution Confirmed");
        const distribution = confirmation.data?.distribution;
        if (distribution) setHistory((current) => [distribution, ...current.filter((row) => row.distribution_id !== distribution.distribution_id)]);
      } else if (confirmation.result === "ALREADY_RECEIVED") {
        setMessage("Relief already received for this family.");
      } else {
        setError(resultMessage(confirmation));
      }
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Unable to confirm relief distribution.");
    } finally {
      setState("idle");
    }
  }

  return (
    <section className={styles.stack} aria-label="QR relief distribution">
      <div className={styles.summary}>
        <div>
          <span>QR Relief Distribution</span>
          <h3>Beneficiary Verification</h3>
          <p>Verify family eligibility before confirming actual relief receipt.</p>
        </div>
        <div className={styles.summaryStats}>
          <Metric label="Received" value={receivedCount} />
          <Metric label="Remaining" value={remainingLabel} compact />
        </div>
      </div>

      {message ? <p className={styles.stateMessage}>{message}</p> : null}
      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.layout}>
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <span>Step 1</span>
            <h3>Enter / Scan Beneficiary QR</h3>
            <p>Use the family or resident identifier from the QR code. Verification does not mark relief as received.</p>
          </header>
          <form className={styles.verifyForm} onSubmit={handleVerify}>
            <label>
              Beneficiary QR / Identifier
              <input
                autoComplete="off"
                placeholder="family:uuid or resident:uuid"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>
            <button className={styles.primaryButton} type="submit" disabled={state === "verifying" || state === "confirming"}>
              {state === "verifying" ? "Verifying..." : "Verify"}
            </button>
          </form>
        </section>

        <DistributionResultCard
          allocation={result?.data?.allocation ?? null}
          beneficiary={result?.data?.beneficiary ?? null}
          distribution={result?.data?.distribution ?? result?.data?.existing_distribution ?? null}
          onConfirm={handleConfirm}
          result={result}
          state={state}
        />
      </div>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <span>Recent</span>
          <h3>Distribution History</h3>
          <p>Latest confirmed relief distributions visible to your role.</p>
        </header>
        {state === "loading" ? (
          <div className={styles.emptyState}>Loading distribution history...</div>
        ) : history.length === 0 ? (
          <div className={styles.emptyState}>No confirmed relief distributions yet.</div>
        ) : (
          <div className={styles.historyList}>
            {history.slice(0, 10).map((record) => (
              <article key={record.distribution_id}>
                <div>
                  <strong>{record.family_name ?? "Family"}</strong>
                  <span>{record.family_head_name ?? "Family head not recorded"} • {record.barangay_name ?? `Barangay ${record.barangay_id}`}</span>
                </div>
                <time>{formatDate(record.verified_at)}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function DistributionResultCard({
  allocation,
  beneficiary,
  distribution,
  onConfirm,
  result,
  state,
}: {
  allocation: ReliefDistributionAllocation | null;
  beneficiary: ReliefDistributionBeneficiary | null;
  distribution: ReliefDistributionRecord | null;
  onConfirm: () => void;
  result: ReliefDistributionVerifyResponse | null;
  state: LoadState;
}) {
  const tone = useMemo(() => resultTone(result?.result), [result?.result]);

  if (!result) {
    return (
      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <span>Step 2</span>
          <h3>Beneficiary Result</h3>
          <p>Verification results will appear here after scanning or manual entry.</p>
        </header>
        <div className={styles.emptyState}>No beneficiary verified yet.</div>
      </section>
    );
  }

  return (
    <section className={cn(styles.card, styles.resultCard, styles[tone])}>
      <header className={styles.cardHeader}>
        <span>Step 2</span>
        <h3>{resultTitle(result.result)}</h3>
        <p>{result.reason ?? resultSubtitle(result.result)}</p>
      </header>

      {beneficiary ? (
        <dl className={styles.details}>
          <Detail label="Family" value={beneficiary.family_name} />
          <Detail label="Family Head" value={beneficiary.family_head_name ?? "Not recorded"} />
          <Detail label="Barangay" value={beneficiary.barangay_name} />
          <Detail label="Family Members" value={String(beneficiary.total_family_members || "Not recorded")} />
        </dl>
      ) : null}

      {allocation ? (
        <div className={styles.allocationBox}>
          <span>Active Emergency Allocation</span>
          <strong>{allocation.batch?.plan_name ?? "Emergency allocation"}</strong>
          <p>{allocation.family_food_packs} food packs • {allocation.emergency_kits} emergency kits • {allocation.individual_relief_goods} relief goods</p>
        </div>
      ) : null}

      {distribution ? (
        <div className={styles.duplicateBox}>
          <strong>Received: {formatDate(distribution.verified_at)}</strong>
          <span>Verified by: {distribution.verified_by_name ?? shortId(distribution.verified_by)}</span>
          <span>Distribution ID: {shortId(distribution.distribution_id)}</span>
        </div>
      ) : null}

      {result.result === "ELIGIBLE" ? (
        <button className={styles.primaryButton} type="button" disabled={state === "confirming"} onClick={onConfirm}>
          {state === "confirming" ? "Confirming..." : "Confirm Relief Received"}
        </button>
      ) : null}
    </section>
  );
}

function Metric({ compact = false, label, value }: { compact?: boolean; label: string; value: number | string }) {
  return (
    <div className={cn(styles.metric, compact && styles.compactMetric)}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function resultTone(result?: string) {
  if (result === "ELIGIBLE" || result === "RECEIVED") return "success";
  if (result === "ALREADY_RECEIVED") return "warning";
  if (!result) return "neutral";
  return "danger";
}

function resultTitle(result: string) {
  if (result === "ELIGIBLE") return "Eligible for Relief";
  if (result === "RECEIVED") return "Relief Distribution Confirmed";
  if (result === "ALREADY_RECEIVED") return "Relief Already Received";
  if (result === "WRONG_BARANGAY") return "Wrong Barangay";
  if (result === "ALLOCATION_NOT_READY") return "Allocation Not Ready";
  if (result === "UNAUTHORIZED") return "Unauthorized";
  return "Beneficiary Not Eligible";
}

function resultSubtitle(result: string) {
  if (result === "ELIGIBLE") return "This family can receive relief for the active emergency allocation.";
  if (result === "RECEIVED") return "This family has now been marked as received for this allocation.";
  if (result === "ALREADY_RECEIVED") return "This family cannot receive the same emergency allocation twice.";
  return "The beneficiary could not be cleared for relief distribution.";
}

function resultMessage(response: ReliefDistributionVerifyResponse) {
  return response.reason || resultSubtitle(response.result);
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortId(value?: string | null) {
  if (!value) return "Not recorded";
  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}
