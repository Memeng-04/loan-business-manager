import type { Borrower } from "../../types/borrowers";
import styles from "./BorrowerCard.module.css";

type BorrowerCardProps = {
  borrower: Borrower;
};

export default function BorrowerCard({ borrower }: BorrowerCardProps) {
  return (
    <li className={styles.card}>
      <h2 className={styles.borrowerName}>{borrower.full_name}</h2>

      {borrower.business_name ? (
        <p className={styles.metaLine}>Business: {borrower.business_name}</p>
      ) : null}

      {borrower.address ? (
        <p className={styles.metaLine}>Address: {borrower.address}</p>
      ) : null}

      {borrower.phone ? (
        <p className={styles.metaLine}>Number: {borrower.phone}</p>
      ) : null}

      {borrower.notes ? (
        <p className={styles.notesLine}>Notes: {borrower.notes}</p>
      ) : null}
    </li>
  );
}
