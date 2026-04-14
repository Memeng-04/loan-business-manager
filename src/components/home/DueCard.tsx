import { useNavigate } from "react-router-dom";
import Card from "../card/Card";
import Button from "../Button";
import styles from "./DueCard.module.css";

type DueItem = {
  borrowerName: string;
  amountDue: number;
};

type DueCardProps = {
  items: DueItem[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DueCard({ items }: DueCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={styles.card} variant="default" padding="lg">
      <p className={styles.label}>Due Today List</p>

      {items.length === 0 ? (
        <p className={styles.emptyText}>No repayments due today.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={`${item.borrowerName}-${index}`} className={styles.row}>
              <span className={styles.borrowerName}>{item.borrowerName}</span>
              <strong>{formatCurrency(item.amountDue)}</strong>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.buttonWrapper}>
        <Button variant="blue" size="md" onClick={() => navigate("/loans")}>
          See Loans
        </Button>
      </div>
    </Card>
  );
}
