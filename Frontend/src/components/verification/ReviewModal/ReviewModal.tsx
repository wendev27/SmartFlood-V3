import { Modal } from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button/Button";
import type { VerificationApplication } from "@/types/verification";
import styles from "./ReviewModal.module.css";

interface ReviewModalProps {
  isOpen: boolean;
  application: VerificationApplication | null;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function ReviewModal({ isOpen, application, onApprove, onReject, onClose }: ReviewModalProps) {
  const raw = application?.raw ?? {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="review-title">
      <header className={styles.header}>
        <div className={styles.avatar}>{application?.initials ?? "NA"}</div>
        <div><h2 id="review-title">{application?.name ?? "Application"}</h2><p>Resident Registration</p></div>
        <button className={styles.close} type="button" aria-label="Close review" onClick={onClose} />
      </header>
      <div className={styles.body}>
        <ReviewSection title="Personal Information" columns={3} fields={[
          ["Surname", String(raw.last_name ?? "")], ["First Name", String(raw.first_name ?? "")], ["Middle Name", String(raw.middle_name ?? "N/A")],
          ["Contact Number", String(raw.contact_number ?? application?.phone ?? "")], ["Age & Sex", `${raw.age ?? ""} ${raw.sex ?? ""}`.trim()], ["Occupation", String(raw.occupation ?? "N/A")],
        ]} />
        <ReviewSection title="Location Information" fields={[
          ["Complete Address", String(raw.complete_address ?? application?.address ?? "")], ["Barangay", application?.barangay ?? ""],
        ]} />
        <ReviewSection title="Family & Household Information" columns={3} fields={[
          ["Total Family Members", String(raw.total_family_members ?? application?.familyMembers ?? "")], ["Household Head", raw.is_family_head ? "Yes" : "No"], ["Special Needs", String(raw.special_needs ?? "N/A")], ["Medical Conditions", String(raw.medical_conditions ?? "N/A")],
        ]} />
        <ReviewSection title="Submission Details" columns={2} fields={[
          ["Date Submitted", application?.submitted ?? ""], ["Submitted By", String(raw.source ?? "Self-registered")],
        ]} />
        <footer className={styles.actions}>
          <Button tone="danger" onClick={onReject}>⊗ Reject Application</Button>
          <Button tone="success" onClick={onApprove}>✓ Approve Application</Button>
        </footer>
      </div>
    </Modal>
  );
}

interface ReviewSectionProps {
  title: string;
  fields: Array<[string, string]>;
  columns?: 1 | 2 | 3;
}

function ReviewSection({ title, fields, columns = 1 }: ReviewSectionProps) {
  return (
    <section className={styles.section}>
      <h3><span />{title}</h3>
      <div className={styles[`cols${columns}`]}>
        {fields.map(([label, value], index) => (
          <div key={`${label}-${index}`} className={index === 3 && fields.length === 4 ? styles.wide : undefined}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
