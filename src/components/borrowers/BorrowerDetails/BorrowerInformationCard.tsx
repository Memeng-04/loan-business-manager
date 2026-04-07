import Button from "../../Button";
import Card from "../../card/Card";
import type { Borrower } from "../../../types/borrowers";
import styles from "./BorrowerDetailCards.module.css";

type BorrowerInformationCardProps = {
  borrower: Borrower;
  createdDate: string;
};

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.dataCell}>
      <span className={styles.dataLabel}>{label}</span>
      <p className={styles.dataValue}>{value}</p>
    </div>
  );
}

export default function BorrowerInformationCard({
  borrower,
  createdDate,
}: BorrowerInformationCardProps) {
  return (
    <Card as="section" className={styles.infoCard}>
      <h3 className={styles.cardTitle}>INFORMATION</h3>

      <div className={styles.infoGrid}>
        <DataCell label="ADDRESS" value={borrower.address ?? "Not provided"} />
        <DataCell label="NOTES" value={borrower.notes ?? "No notes"} />
        <DataCell label="PHONE" value={borrower.phone ?? "Not provided"} />
        <DataCell label="EMAIL" value={borrower.email ?? "No email"} />
        <DataCell label="CREATED" value={createdDate} />
      </div>

      <Button
        variant="blue"
        size="md"
        className={`mt-0! ${styles.primaryAction}`}
      >
        Edit Borrower details
      </Button>
    </Card>
  );
}
