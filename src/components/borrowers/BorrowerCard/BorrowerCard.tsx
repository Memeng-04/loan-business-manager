import type { Borrower } from "../../../types/borrowers";
import { Link } from "react-router-dom";
import Card from "../../ui/card/Card";
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

          {borrower.email ? (
            <p className={styles.metaLine}>Email: {borrower.email}</p>
          ) : null}

          {borrower.address ? (
            <p className={styles.metaLine}>Address: {borrower.address}</p>
          ) : null}

          {borrower.phone ? (
            <p className={styles.metaLine}>Number: {borrower.phone}</p>
          ) : null}
        </Link>
      ) : (
        <div>
          <h2 className={styles.borrowerName}>{borrower.full_name}</h2>

          {borrower.email ? (
            <p className={styles.metaLine}>Email: {borrower.email}</p>
          ) : null}

          {borrower.address ? (
            <p className={styles.metaLine}>Address: {borrower.address}</p>
          ) : null}

          {borrower.phone ? (
            <p className={styles.metaLine}>Number: {borrower.phone}</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
