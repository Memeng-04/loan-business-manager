import { useState } from "react";


import { LoanCreationFlow } from "../../features/loans/create-wizard/LoanCreationFlow";
import { RepaymentSchedule } from "../../features/loans/create-wizard/RepaymentSchedule";

import LoadingState from "../../components/ui/LoadingState";

export default function NewLoanPage() {
  const [createdLoanData, setCreatedLoanData] = useState<{
    loanId: string;
    borrowerId: string;
  } | null>(() => {
    const saved = sessionStorage.getItem("createdLoanData");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as { loanId: string; borrowerId: string };
    } catch (error) {
      console.error("Failed to restore loan data from sessionStorage:", error);
      sessionStorage.removeItem("createdLoanData");
      return null;
    }
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFlowSuccess = (loanData: { loanId: string; borrowerId: string }) => {
    setCreatedLoanData(loanData);
    // Save to sessionStorage so it persists across page refreshes
    sessionStorage.setItem("createdLoanData", JSON.stringify(loanData));
    setIsTransitioning(true);
    // Simulate loading time for the schedule generation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  };

  const handleScheduleSaved = () => {
    // Full reset — the loan is done, clear everything
    setCreatedLoanData(null);
    sessionStorage.removeItem("createdLoanData");
    sessionStorage.removeItem("wizardState");
    sessionStorage.removeItem("wizardStep");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8] overflow-y-auto">
      <Header
        title="Add Loan"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {!createdLoanData && !isTransitioning && (
        <div className="max-w-4xl mx-auto p-8 w-full">
          <LoanCreationFlow
            onSuccess={handleFlowSuccess}
          />
        </div>
      )}

      {isTransitioning && (
        <div className="max-w-4xl mx-auto p-8 w-full">
          <LoadingState
            message="Generating Repayment Schedule..."
            fullScreen={false}
          />
        </div>
      )}

      {createdLoanData && !isTransitioning && (
        <div className="max-w-4xl mx-auto p-8 w-full">
          <RepaymentSchedule
            loanId={createdLoanData.loanId}
            borrowerId={createdLoanData.borrowerId}
            onScheduleSaved={handleScheduleSaved}
          />
        </div>
      )}
    </div>
  );
}
