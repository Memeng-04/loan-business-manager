import Card from "../ui/card/Card";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import styles from "./BalanceCard.module.css";

type BalanceCardProps = {
  outstandingBalance: number;
  initialCapital: number;
  initialProfit: number;
  isLoading?: boolean;
  onManageFunds?: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BalanceCard({
  outstandingBalance,
  initialCapital,
  initialProfit,
  isLoading = false,
  onManageFunds,
}: BalanceCardProps) {
  return (
    <Card className={styles.card} variant="default" padding="lg">
      <p className={styles.label}>Outstanding Fund Balance</p>
      
      {isLoading ? (
        <LoadingState variant="compact" message="Calculating Balance..." className="align-center justify-center max-w-[200px]" />
      ) : (
        <h3 className={styles.balanceValue}>
          {formatCurrency(outstandingBalance)}
        </h3>
      )}

      <div className={styles.metricsGrid}>
        <div className={styles.metricWrapper}>
          <p className={styles.metricLabel}>Capital</p>
          <p className={styles.metricValue}>
            {isLoading ? "..." : formatCurrency(initialCapital)}
          </p>
        </div>

        <div className={styles.metricWrapper}>
          <p className={styles.metricLabel}>Earned Profit</p>
          <p className={styles.metricValue}>
            {isLoading ? "..." : formatCurrency(initialProfit)}
          </p>
        </div>

        <div className={styles.metricWrapper}>
          <p className={styles.metricLabel}>Active Lent Out</p>
          <p className={styles.metricValue}>
            {isLoading
              ? "..."
              : formatCurrency(
                  initialCapital + initialProfit - outstandingBalance,
                )}
          </p>
        </div>
      </div>

      {onManageFunds && (
        <div className={styles.buttonWrapper}>
          <Button 
            variant="blue" 
            size="md" 
            onClick={onManageFunds}
            disabled={isLoading}
          >
            Manage Funds
          </Button>
        </div>
      )}
    </Card>
  );
}
