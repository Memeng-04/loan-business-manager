import { useNavigate } from "react-router-dom";
import Card from "../ui/card/Card";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import styles from "./DueCard.module.css";

type DueItem = {
  borrowerName: string;
  amountDue: number;
};

type DueCardProps = {
  items: DueItem[];
  isLoading?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DueCard({ items, isLoading = false }: DueCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={styles.card} variant="default" padding="lg">
      <p className={styles.label}>Due Today List</p>

      {isLoading ? (
        <LoadingState variant="compact" message="Fetching due repayments..." className="py-8" />
      ) : items.length === 0 ? (
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
