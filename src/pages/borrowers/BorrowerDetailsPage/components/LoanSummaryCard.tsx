import Button from "../../../../components/Button";
import Card from "../../../../components/card/Card";
import type { Loan } from "../../../../types/loans";
import styles from "./BorrowerDetailCards.module.css";

type LoanSummaryCardProps = {
  loanError: string | null;
  totalLoans: number;
  activeLoans: number;
  doneLoans: number;
  latestLoan: Loan | null;
  latestLoanAmount: string;
  latestLoanCreatedAt: string;
  onSeeLoans: () => void;
};

export default function LoanSummaryCard({
  loanError,
  totalLoans,
  activeLoans,
  doneLoans,
  latestLoan,
  latestLoanAmount,
  latestLoanCreatedAt,
  onSeeLoans,
}: LoanSummaryCardProps) {
  const latestStatus = latestLoan?.status.toUpperCase() ?? "NONE";

  return (
    <Card as="section" className={styles.summaryCard}>
      <h3 className={styles.cardTitle}>LOAN SUMMARY</h3>

      {loanError ? <p className={styles.errorText}>{loanError}</p> : null}

      {!loanError ? (
        <>
          <div className={styles.latestWrap}>
            <div>
              <p className={styles.latestLabel}>LATEST LOAN</p>
              <p className={styles.latestAmount}>{latestLoanAmount}</p>
              <p className={styles.latestDate}>{latestLoanCreatedAt}</p>
            </div>
            <span className={styles.statusBadge}>{latestStatus}</span>
          </div>

          <div className={styles.summaryMetrics}>
            <div className={styles.metricTile}>
              <span className={styles.metricTileLabel}>TOTAL LOANS</span>
              <strong className={styles.metricTileValue}>{totalLoans}</strong>
            </div>
            <div className={styles.metricTile}>
              <span className={styles.metricTileLabel}>ACTIVE</span>
              <strong className={styles.metricTileValue}>{activeLoans}</strong>
            </div>
            <div className={styles.metricTile}>
              <span className={styles.metricTileLabel}>DONE</span>
              <strong className={styles.metricTileValue}>{doneLoans}</strong>
            </div>
          </div>
        </>
      ) : null}

      <Button
        variant="blue"
        size="md"
        className={`mt-0! ${styles.primaryAction}`}
        onClick={onSeeLoans}
      >
        See Loans
      </Button>
    </Card>
  );
}
