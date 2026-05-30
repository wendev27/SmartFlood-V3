import { Modal } from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button/Button";
import styles from "./ReviewModal.module.css";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="review-title">
      <header className={styles.header}>
        <div className={styles.avatar}>MC</div>
        <div><h2 id="review-title">Maria Clara Santos</h2><p>Resident Registration</p></div>
        <button className={styles.close} type="button" aria-label="Close review" onClick={onClose} />
      </header>
      <div className={styles.body}>
        <ReviewSection title="Personal Information" columns={3} fields={[
          ["Surname", "Santos"], ["First Name", "Maria Clara"], ["Middle Name", "N/A"],
          ["Contact Number", "+63-912-345-6789"], ["Age & Sex", "28 years, Female"], ["Occupation", "Self-employed"],
        ]} />
        <ReviewSection title="Location Information" fields={[
          ["Complete Address", "123 Rizal Street, Barangay Tanong, Labusan"], ["Barangay", "Tanong"],
        ]} />
        <ReviewSection title="Family & Household Information" columns={3} fields={[
          ["Total Family Members", "4 members"], ["Household Head", "Maria Clara Santos"], ["Special Needs", "3 children (ages 3, 5, 7)"], ["Medical Conditions", "None"],
        ]} />
        <ReviewSection title="Submission Details" columns={2} fields={[
          ["Date Submitted", "2026-05-10 14:30"], ["Submitted By", "Self-registered"],
        ]} />
        <footer className={styles.actions}>
          <Button tone="danger">⊗ Reject Application</Button>
          <Button tone="success">✓ Approve Application</Button>
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
