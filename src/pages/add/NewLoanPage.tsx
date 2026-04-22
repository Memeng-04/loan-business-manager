import { useState, useEffect } from "react";
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

  // Load loan data from sessionStorage on mount
  useEffect(() => {
    const savedLoanData = sessionStorage.getItem('createdLoanData');
    if (savedLoanData) {
      try {
        const parsedData = JSON.parse(savedLoanData);
        setCreatedLoanData(parsedData);
      } catch (error) {
        console.error('Failed to restore loan data from sessionStorage:', error);
        sessionStorage.removeItem('createdLoanData');
      }
    }
  }, []);

  const handleWizardSuccess = (loanData: { loanId: string; borrowerId: string }) => {
    setCreatedLoanData(loanData);
    // Save to sessionStorage so it persists across page refreshes
    sessionStorage.setItem('createdLoanData', JSON.stringify(loanData));
    setIsTransitioning(true);
    // Simulate loading time for the schedule generation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500); 
  };


  const handleScheduleSaved = () => {
    // Full reset — the loan is done, clear everything
    setCreatedLoanData(null);
    sessionStorage.removeItem('createdLoanData');
    sessionStorage.removeItem('wizardState');
    sessionStorage.removeItem('wizardStep');
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
            onScheduleSaved={handleScheduleSaved}
          />
        </section>
      )}
    </main>
  );
}
