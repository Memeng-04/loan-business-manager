import { useState } from "react";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import LoadingState from "../../components/LoadingState";
import { LoanForm } from "../../components/loans/fixedLoanForm";
import { PercentageLoanForm } from "../../components/loans/PercentageLoanForm";
import { RepaymentSchedule } from "../../components/loans/RepaymentSchedule";
import { useBorrowers } from "../../hooks/useBorrowers";
import styles from "./NewLoanPage.module.css";

export default function NewLoanPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { borrowers, loading, error } = useBorrowers();
  const selectedBorrowerId =
    borrowers.find((borrower) => borrower.id)?.id ?? "";
  const selectedLoanId = "";

  return (
    <main className={styles.page}>
      <Header title="Add Loan" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        {loading ? (
          <LoadingState message="Loading..." fullScreen={false} />
        ) : null}
        {error ? <p className={styles.errorText}>{error}</p> : null}
        {!loading && !error && !selectedBorrowerId ? (
          <p className={styles.stateText}>Error</p>
        ) : null}

        {!loading && !error && selectedBorrowerId ? (
          <LoanForm borrowerId={selectedBorrowerId} />
        ) : null}

        {!loading && !error && selectedBorrowerId ? (
          <PercentageLoanForm borrowerId={selectedBorrowerId} />
        ) : null}

        {!loading && !error && selectedBorrowerId ? (
          <RepaymentSchedule
            borrowerId={selectedBorrowerId}
            loanId={selectedLoanId}
          />
        ) : null}
      </section>
    </main>
  );
}
