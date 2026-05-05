import Button from "../../ui/Button";
import Card from "../../ui/card/Card";
import FeedbackMessage from "../../ui/feedback/FeedbackMessage";
import StatusBadge from "../../ui/status-badge/StatusBadge";
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
  const latestStatus = latestLoan?.status ?? "done";
  const latestStatusLabel = latestStatus.toUpperCase();
  const latestStatusTone =
    latestStatus === "active"
      ? "active"
      : latestStatus === "done"
        ? "done"
        : "active";

  return (
    <Card as="section" className={styles.summaryCard}>
      <h3 className={styles.cardTitle}>LOAN SUMMARY</h3>

      {loanError ? <FeedbackMessage message={loanError} /> : null}

      {!loanError ? (
        <>
          <div className={styles.latestWrap}>
            <div>
              <p className={styles.dataLabel}>LATEST LOAN</p>
              <p className={styles.latestAmount}>{latestLoanAmount}</p>
              <p className={styles.latestDate}>{latestLoanCreatedAt}</p>
            </div>
            <StatusBadge
              label={latestStatusLabel}
              tone={latestStatusTone}
              className={styles.latestStatus}
            />
          </div>

          <div className={styles.summaryMetrics}>
            <div className={styles.metricTile}>
              <span className={styles.dataLabel}>LOANS</span>
              <div className={styles.metricTileValue}>{totalLoans}</div>
            </div>
            <div className={styles.metricTile}>
              <span className={styles.dataLabelActive}>ACTIVE</span>
              <div className={styles.metricTileValue}>{activeLoans}</div>
            </div>
            <div className={styles.metricTile}>
              <span className={styles.dataLabelDone}>DONE</span>
              <div className={styles.metricTileValue}>{doneLoans}</div>
            </div>
          </div>

          <div className={styles.financialTotals}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total repayment</span>
              <div className={styles.totalValue}>{totalPayable}</div>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total principal</span>
              <div className={styles.totalValue}>{totalPrincipal}</div>
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
