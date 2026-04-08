import { useState, useCallback, useEffect } from 'react'
import type {
  CreateLoanWizardState,
  WizardStep
} from '../../types/wizardTypes'
import { useCreateLoan } from '../../hooks/useCreateFixedLoan'
import { useCreatePercentageLoan } from '../../hooks/useCreatePercentageLoan'
import { Step1LoanCategory } from './steps/Step1LoanCategory'
import { Step2Borrower } from './steps/Step2Borrower'
import { Step3LoanDetails } from './steps/Step3LoanDetails'
import { Step4InterestDetails } from './steps/Step4InterestDetails'
import { Step5ReviewConfirm } from './steps/Step5ReviewConfirm'
import Button from '../Button'

interface CreateLoanWizardProps {
  onSuccess?: (loanData: { loanId: string; borrowerId: string }) => void
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

  const [countdown, setCountdown] = useState(3);

  const { createLoan: createFixedLoan, loading: fixedLoading } =
    useCreateLoan()
  const { createLoan: createPercentageLoan, loading: percentageLoading } =
    useCreatePercentageLoan()

  // Initialize wizard state with single source of truth
  const [state, setState] = useState<CreateLoanWizardState>({
    loanType: null,
    borrowerId: '',
    principal: '',
    frequency: 'daily',
    termDays: '30',
    startDate: '',
    totalPayable: '',
    interestRate: '',
    calculatedPreview: null
  })

  /**
   * Update a single key in the wizard state.
   * Follows controlled component pattern with parent holding all state.
   */
  const updateState = useCallback(
    <K extends keyof CreateLoanWizardState>(
      key: K,
      value: CreateLoanWizardState[K]
    ) => {
      setState(prev => ({
        ...prev,
        [key]: value
      }))
    },
    []
  )

  /**
   * Advance to the next step.
   * Step validation should be handled by child components before calling this.
   */
  const nextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep((prev: WizardStep) => ((prev + 1) as WizardStep))
      setSubmitError(null)
    }
  }, [currentStep])

  /**
   * Return to the previous step.
   */
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev: WizardStep) => ((prev - 1) as WizardStep))
      setSubmitError(null)
    }
  }, [currentStep])

  /**
   * Handle final wizard submission.
   * Routes to the appropriate Supabase hook based on loanType.
   */
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validation
      if (!state.loanType) {
        throw new Error('Loan type not selected')
      }
      if (!state.principal || !state.startDate) {
        throw new Error('Missing required fields')
      }

      let loanId: string | undefined

      if (state.loanType === 'fixed') {
        if (!state.totalPayable) {
          throw new Error('Total payable amount is required for fixed loans')
        }

        loanId = await createFixedLoan({
          borrower_id: state.borrowerId,
          principal: Number(state.principal),
          total_payable: Number(state.totalPayable),
          frequency: state.frequency,
          term_days: Number(state.termDays),
          start_date: state.startDate
        })
      } else if (state.loanType === 'percentage') {
        if (!state.interestRate) {
          throw new Error('Interest rate is required for percentage loans')
        }

        loanId = await createPercentageLoan({
          borrower_id: state.borrowerId,
          principal: Number(state.principal),
          interest_rate: Number(state.interestRate),
          frequency: state.frequency,
          term_days: Number(state.termDays),
          start_date: state.startDate
        })
      }

      if (loanId) {
        // Extract ID if loanId is an object (full loan data) or already a string
        const idString = typeof loanId === 'string' ? loanId : (loanId as any).id
        setSuccessLoanId(idString)
        setIsSuccess(true)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Submission failed'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    if (isSuccess) {
      setCountdown(3); // Reset countdown on success
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);

      const timer = setTimeout(() => {
        // Call onSuccess callback to transition to the next screen
        if (onSuccess && successLoanId) {
          onSuccess({ loanId: successLoanId, borrowerId: state.borrowerId });
        }
        // Reset state after transition
        setIsSuccess(false);
        setSuccessLoanId(null);
        setCurrentStep(1);
        setState({
          loanType: null,
          borrowerId: '',
          principal: '',
          frequency: 'daily',
          termDays: '30',
          startDate: '',
          totalPayable: '',
          interestRate: '',
          calculatedPreview: null
        });
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isSuccess, successLoanId, onSuccess, state.borrowerId]);

  const isLoading = fixedLoading || percentageLoading || isSubmitting

  // Step rendering logic
  const renderStep = () => {
    const commonProps = {
      currentStep,
      state,
      updateState,
      nextStep,
      prevStep,
      isLoading,
      error: submitError
    }

    switch (currentStep) {
      case 1:
        return <Step1LoanCategory {...commonProps} />

      case 2:
        return <Step2Borrower {...commonProps} />

      case 3:
        return <Step3LoanDetails {...commonProps} />

      case 4:
        return <Step4InterestDetails {...commonProps} />

      case 5:
        return <Step5ReviewConfirm {...commonProps} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-gray-800 text-3xl font-bold">Create New Loan</h2>
          <p className="text-gray-500 text-sm mt-2">
            Step {currentStep} of 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="flex-1 h-2 rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full bg-blue-600 transition-all duration-300 ${
                    currentStep >= step ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className="px-6 py-8 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Loan Created Successfully!
            </h2>
            <p className="text-gray-600 mb-4">Loan ID: {successLoanId}</p>
            <p className="text-sm text-gray-500">
              Generating schedule in {countdown}...
            </p>
          </div>
        ) : (
          <>
            {/* Step Content */}
            {renderStep()}

            {/* Footer Navigation */}
            <div className="px-8 pb-8 pt-6 flex gap-4 justify-between items-center border-t border-gray-200">
              {currentStep > 1 ? (
                <Button
                  onClick={prevStep}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                >
                  Back
                </Button>
              ) : (
                <div /> // Placeholder to keep "Next" button on the right
              )}

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
                  {isLoading ? 'Submitting...' : 'Confirm & Create Loan'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
