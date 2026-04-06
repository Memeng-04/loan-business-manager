import type { Borrower } from "../../types/borrowers";
import { Link } from "react-router-dom";
import Card from "../card/Card";
import styles from "./BorrowerCard.module.css";

type BorrowerCardProps = {
  borrower: Borrower;
};

export default function BorrowerCard({ borrower }: BorrowerCardProps) {
  return (
    <Card as="li" interactive>
      {borrower.id ? (
        <Link className={styles.cardLink} to={`/borrowers/${borrower.id}`}>
          <h2 className={styles.borrowerName}>{borrower.full_name}</h2>

          {borrower.business_name ? (
            <p className={styles.metaLine}>
              Business: {borrower.business_name}
            </p>
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
        </Link>
      ) : (
        <div>
          <h2 className={styles.borrowerName}>{borrower.full_name}</h2>

          {borrower.business_name ? (
            <p className={styles.metaLine}>
              Business: {borrower.business_name}
            </p>
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
        </div>
      )}
    </Card>
  );
}
