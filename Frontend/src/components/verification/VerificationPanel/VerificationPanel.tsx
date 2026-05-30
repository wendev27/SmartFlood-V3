"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplicationFormValues, ModalMode, VerificationApplication, VerificationStatus } from "@/types/verification";
import { fetchJson } from "@/services/apiClient";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { Button } from "@/components/ui/Button/Button";
import { ApplicationCard } from "@/components/verification/ApplicationCard/ApplicationCard";
import { ApplicationFormModal } from "@/components/verification/ApplicationFormModal/ApplicationFormModal";
import { ReviewModal } from "@/components/verification/ReviewModal/ReviewModal";
import { SmartFloodIcon } from "@/components/icons/SmartFloodIcon";
import styles from "./VerificationPanel.module.css";

export function VerificationPanel() {
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [applicationMode, setApplicationMode] = useState<ModalMode>("add");
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<VerificationApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchJson<Record<string, unknown>[]>("/api/resident-applications");
      setApplications(data.map(mapApplication));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load applications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchJson<Record<string, unknown>[]>("/api/resident-applications");
        if (!cancelled) setApplications(data.map(mapApplication));
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load applications.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleApplications = useMemo(
    () => applications.filter((application) => application.status === activeTab),
    [activeTab, applications],
  );

  const counts = useMemo(() => ({
    pending: String(applications.filter((application) => application.status === "pending").length),
    approved: String(applications.filter((application) => application.status === "approved").length),
    rejected: String(applications.filter((application) => application.status === "rejected").length),
  }), [applications]);

  async function reviewApplication(action: "approved" | "rejected") {
    if (!selectedApplication) return;

    const selectedFamilyId = selectedApplication.raw?.selected_family_id ?? selectedApplication.raw?.family_id;
    const body: Record<string, unknown> = {
      action,
      admin_review_notes: action === "approved" ? "Approved from SmartFlood admin dashboard" : "Rejected from SmartFlood admin dashboard",
    };

    if (action === "approved" && !selectedApplication.raw?.is_family_head) {
      body.selected_family_id = selectedFamilyId || window.prompt("Enter selected family ID for this resident");
    }

    try {
      await fetchJson(`/api/resident-applications/${selectedApplication.application_id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (reviewError) {
      window.alert(reviewError instanceof Error ? reviewError.message : "Unable to review application");
      return;
    }

    setIsReviewOpen(false);
    setSelectedApplication(null);
    await fetchApplications();
  }

  const emptyFormValues: ApplicationFormValues = {
    surname: "",
    firstName: "",
    middleName: "",
    contactNumber: "",
    ageSex: "",
    occupation: "",
    completeAddress: "",
    barangay: "",
    totalFamilyMembers: "",
    householdHead: "",
    specialNeeds: "",
    medicalConditions: "",
  };

  const formValues = emptyFormValues;

  return (
    <section className={styles.panel} aria-label="Resident account verification">
      <div className={styles.headerActions}>
        <Button onClick={() => {
          setApplicationMode("add");
          setIsApplicationOpen(true);
        }}>
          + Add Application
        </Button>
      </div>
      <Tabs
        ariaLabel="Verification status"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "pending", label: "Pending Review", count: counts.pending, icon: <SmartFloodIcon name="pendingReview" size={20} /> },
          { key: "approved", label: "Approved", count: counts.approved, countTone: "green", icon: <SmartFloodIcon name="approved" size={20} /> },
          { key: "rejected", label: "Rejected", count: counts.rejected, countTone: "red", icon: <SmartFloodIcon name="rejected" size={20} /> },
        ]}
      />
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      {isLoading ? <p className={styles.stateMessage}>Loading applications...</p> : null}
      <div className={styles.list}>
        {visibleApplications.map((application, index) => (
          <ApplicationCard
            key={application.application_id ?? `${String(application.raw?.first_name ?? "")}-${String(application.raw?.last_name ?? "")}-${index}`}
            application={application}
            onReview={() => {
              setSelectedApplication(application);
              setIsReviewOpen(true);
            }}
            onEdit={application.status === "approved" ? () => {
              setApplicationMode("edit");
              setIsApplicationOpen(true);
            } : undefined}
          />
        ))}
        {!isLoading && visibleApplications.length === 0 ? (
          <p className={styles.stateMessage}>No applications found.</p>
        ) : null}
      </div>
      <ReviewModal
        isOpen={isReviewOpen}
        application={selectedApplication}
        onApprove={() => reviewApplication("approved")}
        onReject={() => reviewApplication("rejected")}
        onClose={() => setIsReviewOpen(false)}
      />
      <ApplicationFormModal
        isOpen={isApplicationOpen}
        mode={applicationMode}
        values={formValues}
        onClose={() => setIsApplicationOpen(false)}
      />
    </section>
  );
}

function mapApplication(row: Record<string, unknown>): VerificationApplication {
  const firstName = String(row.first_name ?? "");
  const lastName = String(row.last_name ?? "");
  const name = [firstName, row.middle_name, lastName].filter(Boolean).join(" ") || "Unnamed Applicant";
  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "NA";

  return {
    application_id: row.application_id ? String(row.application_id) : undefined,
    initials,
    name,
    status: (row.status === "approved" || row.status === "rejected" ? row.status : "pending") as VerificationStatus,
    type: row.is_family_head ? "Family Head" : "Family Member",
    barangay: String(row.barangay_name ?? row.barangay ?? ""),
    familyMembers: String(row.total_family_members ?? ""),
    submitted: String(row.created_at ?? row.submitted_at ?? ""),
    phone: String(row.contact_number ?? ""),
    address: String(row.complete_address ?? ""),
    approvalNote: row.reviewed_at ? {
      approvedBy: `Reviewed ${String(row.reviewed_at)}`,
      details: String(row.admin_review_notes ?? ""),
    } : undefined,
    raw: row,
  };
}
