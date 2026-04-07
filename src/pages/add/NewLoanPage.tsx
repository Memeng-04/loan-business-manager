import { useState } from "react";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import { CreateLoanWizard } from "../../components/loans/CreateLoanWizard";
import { RepaymentSchedule } from "../../components/loans/RepaymentSchedule";
import styles from "./NewLoanPage.module.css";

export default function NewLoanPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [createdLoanData, setCreatedLoanData] = useState<{ loanId: string; borrowerId: string } | null>(null);

  const handleWizardSuccess = (loanData: { loanId: string; borrowerId: string }) => {
    setCreatedLoanData(loanData);
  };

  const handleWizardCancel = () => {
    setCreatedLoanData(null);
  };

  return (
    <main className={styles.page}>
      <Header title="Add Loan" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        {!createdLoanData && (
          <CreateLoanWizard
            onSuccess={handleWizardSuccess}
            onCancel={handleWizardCancel}
          />
        )}

        {createdLoanData && (
          <RepaymentSchedule
            borrowerId={createdLoanData.borrowerId}
            loanId={createdLoanData.loanId}
          />
        )}
      </section>
    </main>
  );
}
