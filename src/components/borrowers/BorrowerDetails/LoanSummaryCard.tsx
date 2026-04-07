import Button from "../../Button";
import Card from "../../card/Card";
import type { Loan } from "../../../types/loans";
import styles from "./BorrowerDetailCards.module.css";

type LoanSummaryCardProps = {
  loanError: string | null;
  totalLoans: number;
  activeLoans: number;
  doneLoans: number;
  totalPrincipal: string;
  totalPayable: string;
  averageLoanAmount: string;
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
  totalPrincipal,
  totalPayable,
  averageLoanAmount,
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
              <p className={styles.dataLabel}>LATEST LOAN</p>
              <p className={styles.latestAmount}>{latestLoanAmount}</p>
              <p className={styles.latestDate}>{latestLoanCreatedAt}</p>
            </div>
            <span className={styles.statusBadge}>{latestStatus}</span>
          </div>

          <div className={styles.summaryMetrics}>
            <div className={styles.metricTile}>
              <span className={styles.dataLabel}>LOANS</span>
              <div className={styles.metricTileValue}>{totalLoans}</div>
            </div>
            <div className={styles.metricTile}>
              <span className={styles.dataLabel}>ACTIVE</span>
              <div className={styles.metricTileValue}>{activeLoans}</div>
            </div>
            <div className={styles.metricTile}>
              <span className={styles.dataLabel}>DONE</span>
              <div className={styles.metricTileValue}>{doneLoans}</div>
            </div>
          </div>

          <div className={styles.financialTotals}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total principal</span>
              <div className={styles.totalValue}>{totalPrincipal}</div>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total payable</span>
              <div className={styles.totalValue}>{totalPayable}</div>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Average loan</span>
              <div className={styles.totalValue}>{averageLoanAmount}</div>
            </div>
          </div>
        </>
      ) : null}

      <Button
        variant="blue"
        size="md"
        className={`mt-0! ${styles.primaryAction} ${styles.summaryAction}`}
        onClick={onSeeLoans}
      >
        See Loans
      </Button>
    </Card>
  );
}
