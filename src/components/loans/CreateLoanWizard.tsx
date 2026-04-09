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
import styles from './CreateLoanWizard.module.css'

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
  const [isLoadingFromSession, setIsLoadingFromSession] = useState(true)

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
   * Load wizard state and current step from sessionStorage on mount
   */
  useEffect(() => {
    const savedState = sessionStorage.getItem('wizardState')
    const savedStep = sessionStorage.getItem('wizardStep')
    
    console.log('🔍 Wizard Mount - Checking sessionStorage...')
    console.log('savedState:', savedState ? JSON.parse(savedState) : 'NOT FOUND')
    console.log('savedStep:', savedStep ? parseInt(savedStep) : 'NOT FOUND')

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        // Sanitize principal and termDays to enforce length limits
        if (parsedState.principal && parsedState.principal.length > 15) {
          parsedState.principal = parsedState.principal.slice(0, 15)
        }
        if (parsedState.termDays && parsedState.termDays.length > 5) {
          parsedState.termDays = parsedState.termDays.slice(0, 5)
        }
        setState(parsedState)
        console.log('✅ Restored wizard state from sessionStorage')
      } catch (error) {
        console.error('Failed to restore wizard state:', error)
      }
    }

    if (savedStep) {
      try {
        const step = parseInt(savedStep) as WizardStep
        if (step >= 1 && step <= 5) {
          setCurrentStep(step)
          console.log('✅ Restored step:', step)
        }
      } catch (error) {
        console.error('Failed to restore wizard step:', error)
      }
    }

    // Mark that we're done loading from session - now safe to save
    setIsLoadingFromSession(false)
  }, [])

  /**
   * Save wizard state to sessionStorage whenever it changes
   * Skip saving during initial load to avoid overwriting restored state
   */
  useEffect(() => {
    if (!isLoadingFromSession) {
      sessionStorage.setItem('wizardState', JSON.stringify(state))
      console.log('💾 Saved wizard state to sessionStorage:', state)
    }
  }, [state, isLoadingFromSession])

  /**
   * Save current step to sessionStorage whenever it changes
   * Skip saving during initial load to avoid overwriting restored step
   */
  useEffect(() => {
    if (!isLoadingFromSession) {
      sessionStorage.setItem('wizardStep', currentStep.toString())
      console.log('💾 Saved wizard step to sessionStorage:', currentStep)
    }
  }, [currentStep, isLoadingFromSession])

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
        
        // Clear saved wizard state after successful submission
        sessionStorage.removeItem('wizardState')
        sessionStorage.removeItem('wizardStep')
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
      // Automatically redirect after 2 seconds
      const timer = setTimeout(() => {
        // Call onSuccess callback to transition to the next screen
        if (onSuccess && successLoanId) {
          onSuccess({ loanId: successLoanId, borrowerId: state.borrowerId })
        }
        // Reset state after transition
        setIsSuccess(false)
        setSuccessLoanId(null)
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
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess, successLoanId, onSuccess, state.borrowerId])

  const isLoading = fixedLoading || percentageLoading || isSubmitting

  // Step titles for each step
  const stepTitles: Record<WizardStep, string> = {
    1: 'Select Your Loan Type',
    2: 'Select Borrower',
    3: 'Loan Details',
    4: 'Interest Details',
    5: 'Review & Confirm'
  }

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
    <div className={styles.wizardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>{stepTitles[currentStep]}</h2>
        <p className={styles.headerSubtitle}>
          Step {currentStep} of 5
        </p>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className={styles.progressStep}>
                <div
                  className={styles.progressStepFill}
                  style={{
                    width: currentStep >= step ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>
          <div className={styles.stepLabel}>
            Step {currentStep}: {['Loan Type', 'Borrower', 'Details', 'Interest', 'Review'][currentStep - 1]}
          </div>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className={styles.contentArea}>
            <div className={styles.successMessage}>
              <div className={styles.successEmoji}>✅</div>
              <h2 className={styles.successTitle}>
                Loan Created Successfully!
              </h2>
              <p className={styles.successText}>Loan ID: {successLoanId}</p>
              <p className={styles.successCountdown}>
                Redirecting to repayment schedule...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Step Content */}
            <div className={styles.contentArea}>
              {renderStep()}
            </div>

            {/* Footer Navigation */}
            <div className={styles.footerNav}>
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
                    {isLoading ? 'Submitting...' : 'Confirm & Create Loan'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  )
}
