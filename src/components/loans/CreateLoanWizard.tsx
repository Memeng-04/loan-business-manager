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
import Card from '../card/Card'

interface CreateLoanWizardProps {
  onSuccess?: (loanData: { loanId: string; borrowerId: string }) => void
  onCancel?: () => void
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
  onSuccess,
  onCancel
}: CreateLoanWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successLoanId, setSuccessLoanId] = useState<string | null>(null)
  const [successLoanData, setSuccessLoanData] = useState<any>(null)

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
        setSuccessLoanData(loanId)
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
      const timer = setTimeout(() => {
        setIsSuccess(false)
        setSuccessLoanId(null)
        setSuccessLoanData(null)
        setCurrentStep(1)
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
        })
        // Call onSuccess callback after reset
        if (onSuccess && successLoanId) {
          onSuccess({ loanId: successLoanId, borrowerId: state.borrowerId })
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, successLoanId, successLoanData, onSuccess, state.borrowerId])

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#012a6a] px-6 py-5 -m-4 mb-4">
          <h1 className="text-white text-2xl font-bold">
            {isSuccess ? 'Loan Created' : 'Create New Loan'}
          </h1>
          <p className="text-[#6db6fe] text-sm mt-1">
            {isSuccess ? 'Success! Your loan has been created.' : `Step ${currentStep} of 5`}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors ${
                step <= currentStep
                  ? 'bg-[#112bd6]'
                  : 'bg-gray-200'
              }`}
            />
          ))}
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
              Resetting in 3 seconds...
            </p>
          </div>
        ) : (
          <>
            {/* Step Content */}
            {renderStep()}

            {/* Footer Navigation */}
            <div className="px-6 pb-6 flex gap-3 justify-between border-t border-gray-200 pt-6">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Back
                </button>
              )}
              {currentStep === 1 && <div />}

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#112bd6] text-white rounded-2xl hover:bg-[#0d1fa6] disabled:opacity-50 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
