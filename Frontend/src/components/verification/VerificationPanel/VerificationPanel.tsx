"use client";

import { useEffect, useMemo, useState } from "react";
import { applicationFormDefaultsMock, verificationApplicationsMock } from "@/data/verification.mock";
import type { ModalMode, VerificationApplication, VerificationStatus } from "@/types/verification";
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
  const [applications, setApplications] = useState<VerificationApplication[]>(verificationApplicationsMock.map((application, index) => ({ ...application, id: `mock-${index}` })));
  const [selectedApplication, setSelectedApplication] = useState<VerificationApplication | null>(null);

  useEffect(() => {
    fetchApplications();
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

  async function fetchApplications() {
    const response = await fetch("/api/resident-applications");
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      return;
    }

    setApplications(payload.data.map(mapApplication));
  }

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

    const response = await fetch(`/api/resident-applications/${selectedApplication.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      window.alert(payload?.error ?? "Unable to review application");
      return;
    }

    setIsReviewOpen(false);
    setSelectedApplication(null);
    await fetchApplications();
  }

  const formValues = applicationMode === "add"
    ? {
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
      }
    : applicationFormDefaultsMock;

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
      <div className={styles.list}>
        {visibleApplications.map((application) => (
          <ApplicationCard
            key={`${application.name}-${application.status}`}
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
    id: String(row.id),
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
