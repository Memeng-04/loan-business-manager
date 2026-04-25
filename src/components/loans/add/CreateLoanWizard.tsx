import { useState, useCallback, useEffect } from 'react'
import type {
  CreateLoanWizardState,
  WizardStep,
} from "../../../types/wizardTypes";
import { CheckCircle } from "lucide-react";
import { useCreateLoan } from "../../../hooks/useCreateFixedLoan";
import { useCreatePercentageLoan } from "../../../hooks/useCreatePercentageLoan";
import { Step1LoanCategory } from "./steps/Step1LoanCategory";
import { Step2Borrower } from "./steps/Step2Borrower";
import { Step3LoanDetails } from "./steps/Step3LoanDetails";
import { Step4InterestDetails } from "./steps/Step4InterestDetails";
import { Step5ReviewConfirm } from "./steps/Step5ReviewConfirm";
import Button from "../../Button";
import styles from "./CreateLoanWizard.module.css";

interface CreateLoanWizardProps {
  onSuccess?: (loanData: { loanId: string; borrowerId: string }) => void;
}

/**
 * Multi-step wizard component for creating loans.
 * Manages unified state across 5 steps:
 * 1. Loan Type Selection
 * 2. Borrower Selection
 * 3. Loan Details
 * 4. Interest Details
 * 5. Review & Submit
 */
export const CreateLoanWizard = ({
  onSuccess
}: CreateLoanWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successLoanId, setSuccessLoanId] = useState<string | null>(null)
  const [isLoadingFromSession, setIsLoadingFromSession] = useState(true)

  const { createLoan: createFixedLoan, loading: fixedLoading } =
    useCreateLoan();
  const { createLoan: createPercentageLoan, loading: percentageLoading } =
    useCreatePercentageLoan();

  // Initialize wizard state with single source of truth
  const [state, setState] = useState<CreateLoanWizardState>({
    loanType: null,
    borrowerId: "",
    principal: "",
    frequency: "daily",
    termDays: "30",
    startDate: "",
    totalPayable: "",
    interestRate: "",
    penaltyRate: "5",
    calculatedPreview: null,
  });

  /**
   * Load wizard state and current step from sessionStorage on mount
   */
  useEffect(() => {
    const savedState = sessionStorage.getItem("wizardState");
    const savedStep = sessionStorage.getItem("wizardStep");

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.principal && parsedState.principal.length > 15) {
          parsedState.principal = parsedState.principal.slice(0, 15);
        }
        if (parsedState.termDays && parsedState.termDays.length > 5) {
          parsedState.termDays = parsedState.termDays.slice(0, 5);
        }
        setState(parsedState);
      } catch (error) {
        console.error("Failed to restore wizard state:", error);
      }
    }

    if (savedStep) {
      try {
        const step = parseInt(savedStep) as WizardStep;
        if (step >= 1 && step <= 5) {
          setCurrentStep(step);
        }
      } catch (error) {
        console.error("Failed to restore wizard step:", error);
      }
    }

    setIsLoadingFromSession(false);
  }, []);

  useEffect(() => {
    if (!isLoadingFromSession) {
      sessionStorage.setItem("wizardState", JSON.stringify(state));
    }
  }, [state, isLoadingFromSession]);

  useEffect(() => {
    if (!isLoadingFromSession) {
      sessionStorage.setItem("wizardStep", currentStep.toString());
    }
  }, [currentStep, isLoadingFromSession]);

  const updateState = useCallback(
    <K extends keyof CreateLoanWizardState>(
      key: K,
      value: CreateLoanWizardState[K],
    ) => {
      setState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const nextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep((prev: WizardStep) => (prev + 1) as WizardStep);
      setSubmitError(null);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev: WizardStep) => (prev - 1) as WizardStep);
      setSubmitError(null);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (!state.loanType) {
        throw new Error("Loan type not selected");
      }
      if (!state.principal || !state.startDate) {
        throw new Error("Missing required fields");
      }

      const termUnitValue = Number(state.termDays)
      let totalDays = termUnitValue
      
      switch (state.frequency) {
        case 'weekly':     totalDays = termUnitValue * 7; break;
        case 'bi-monthly': totalDays = termUnitValue * 15; break;
        case 'monthly':    totalDays = termUnitValue * 30; break;
        default:           totalDays = termUnitValue;
      }

      let loanId: string | undefined

      const getLoanId = (result: unknown) => {
        if (typeof result === 'string') {
          return result;
        }

        if (
          result &&
          typeof result === 'object' &&
          'id' in result &&
          typeof (result as { id: unknown }).id === 'string'
        ) {
          return (result as { id: string }).id;
        }

        return undefined;
      }

      if (state.loanType === "fixed") {
        if (!state.totalPayable) {
          throw new Error("Total payable amount is required for fixed loans");
        }

        loanId = getLoanId(await createFixedLoan({
          borrower_id: state.borrowerId,
          principal: Number(state.principal),
          total_payable: Number(state.totalPayable),
          frequency: state.frequency,
          term_days: totalDays,
          start_date: state.startDate,
          penalty_rate: Number(state.penaltyRate),
        }));
      } else if (state.loanType === "percentage") {
        if (!state.interestRate) {
          throw new Error("Interest rate is required for percentage loans");
        }

        loanId = getLoanId(await createPercentageLoan({
          borrower_id: state.borrowerId,
          principal: Number(state.principal),
          interest_rate: Number(state.interestRate),
          frequency: state.frequency,
          term_days: totalDays,
          start_date: state.startDate,
          penalty_rate: Number(state.penaltyRate),
        }));
      }

      if (loanId) {
        setSuccessLoanId(loanId);
        setIsSuccess(true);

        sessionStorage.removeItem("wizardState");
        sessionStorage.removeItem("wizardStep");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('wizardState')
        sessionStorage.removeItem('wizardStep')

        if (onSuccess && successLoanId) {
          onSuccess({ loanId: successLoanId, borrowerId: state.borrowerId });
        }
        setIsSuccess(false);
        setSuccessLoanId(null);
        setCurrentStep(1);
        setState({
          loanType: null,
          borrowerId: "",
          principal: "",
          frequency: "daily",
          termDays: "30",
          startDate: "",
          totalPayable: "",
          interestRate: "",
          penaltyRate: "5",
          calculatedPreview: null,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, successLoanId, onSuccess, state.borrowerId]);

  const isLoading = fixedLoading || percentageLoading || isSubmitting;

  const stepTitles: Record<WizardStep, string> = {
    1: 'Select Your Loan Type',
    2: 'Select Borrower',
    3: 'Loan Details',
    4: 'Interest Details',
    5: 'Review & Confirm'
  }

  const renderStep = () => {
    const commonProps = {
      currentStep,
      state,
      updateState,
      nextStep,
      prevStep,
      isLoading,
      error: submitError,
    };

    switch (currentStep) {
      case 1: return <Step1LoanCategory {...commonProps} />;
      case 2: return <Step2Borrower {...commonProps} />;
      case 3: return <Step3LoanDetails {...commonProps} />;
      case 4: return <Step4InterestDetails {...commonProps} />;
      case 5: return <Step5ReviewConfirm {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className={styles.wizardContainer}>
        {!isSuccess && (
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>{stepTitles[currentStep]}</h2>
            <p className={styles.headerSubtitle}>Step {currentStep} of 5</p>
          </div>
        )}

        {!isSuccess && (
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={styles.progressStep}>
                  <div
                    className={styles.progressStepFill}
                    style={{ width: currentStep >= step ? '100%' : '0%' }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.stepLabel}>
              {[
                'Choose the loan structure that best fits your needs.',
                'Choose the borrower for this loan.',
                'Enter the principal amount, frequency, term, and start date.',
                'Enter the annual interest rate as a percentage.',
                'Please review all details before submitting.'
              ][currentStep - 1]}
            </div>
          </div>
        )}

      {/* Success Message */}
      {isSuccess ? (
        <div className={styles.contentArea}>
          <div className={styles.successMessage}>
            <div className={styles.successEmoji}>
              <CheckCircle size={64} color="#16a34a" />
            </div>
            <h2 className={styles.successTitle}>Loan Created Successfully!</h2>
            <p className={styles.successText}>Loan ID: {successLoanId}</p>
            <p className={styles.successCountdown}>
              Redirecting to repayment schedule...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Step Content */}
          <div className={styles.contentArea}>{renderStep()}</div>

          {/* Footer Navigation */}
          <div className={styles.footerNav}>
            {currentStep > 1 ? (
              <Button
                onClick={prevStep}
                disabled={isLoading}
                variant="back"
                size="lg"
              >
                Back
              </Button>
            ) : (
              <div className={styles.navPlaceholder} />
            )}

            <div className={styles.navButtonGroup}>
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  variant="blue"
                  size="lg"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  variant="blue"
                  size="lg"
                >
                  {isLoading ? "Submitting..." : "Confirm"}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
