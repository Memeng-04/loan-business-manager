import { useState } from "react";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import { CreateLoanWizard } from "../../components/loans/CreateLoanWizard";
import { RepaymentSchedule } from "../../components/loans/RepaymentSchedule";
import styles from "./NewLoanPage.module.css";
import LoadingState from "../../components/LoadingState";

export default function NewLoanPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [createdLoanData, setCreatedLoanData] = useState<{ loanId: string; borrowerId: string } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleWizardSuccess = (loanData: { loanId: string; borrowerId: string }) => {
    setCreatedLoanData(loanData);
    setIsTransitioning(true);
    // Simulate loading time for the schedule generation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500); 
  };

  const handleReturnToWizard = () => {
    setCreatedLoanData(null);
  };

  return (
    <main className={styles.page}>
      <Header title="Add Loan" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {!createdLoanData && !isTransitioning && (
        <section className={styles.content}>
          <CreateLoanWizard
            onSuccess={handleWizardSuccess}
          />
        </section>
      )}

      {isTransitioning && (
        <section className={styles.content}>
          <LoadingState message="Generating Repayment Schedule..." fullScreen={false} />
        </section>
      )}

      {createdLoanData && !isTransitioning && (
        <section className={styles.content}>
          <RepaymentSchedule
            loanId={createdLoanData.loanId}
            borrowerId={createdLoanData.borrowerId}
            onScheduleSaved={handleReturnToWizard}
            onBack={handleReturnToWizard}
          />
        </section>
      )}
    </main>
  );
}
