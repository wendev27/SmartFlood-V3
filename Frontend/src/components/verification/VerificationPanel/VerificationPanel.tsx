"use client";

import { useMemo, useState } from "react";
import { applicationFormDefaultsMock, verificationApplicationsMock } from "@/data/verification.mock";
import type { ModalMode, VerificationStatus } from "@/types/verification";
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

  const visibleApplications = useMemo(
    () => verificationApplicationsMock.filter((application) => application.status === activeTab),
    [activeTab],
  );

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
          { key: "pending", label: "Pending Review", count: "3", icon: <SmartFloodIcon name="pendingReview" size={20} /> },
          { key: "approved", label: "Approved", count: "1", countTone: "green", icon: <SmartFloodIcon name="approved" size={20} /> },
          { key: "rejected", label: "Rejected", count: "1", countTone: "red", icon: <SmartFloodIcon name="rejected" size={20} /> },
        ]}
      />
      <div className={styles.list}>
        {visibleApplications.map((application) => (
          <ApplicationCard
            key={`${application.name}-${application.status}`}
            application={application}
            onReview={() => setIsReviewOpen(true)}
            onEdit={application.status === "approved" ? () => {
              setApplicationMode("edit");
              setIsApplicationOpen(true);
            } : undefined}
          />
        ))}
      </div>
      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
      <ApplicationFormModal
        isOpen={isApplicationOpen}
        mode={applicationMode}
        values={formValues}
        onClose={() => setIsApplicationOpen(false)}
      />
    </section>
  );
}
