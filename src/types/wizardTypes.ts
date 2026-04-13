import type { PaymentFrequency } from './loans'

export type LoanType = 'fixed' | 'percentage'

export type WizardStep = 1 | 2 | 3 | 4 | 5

/**
 * Unified wizard state combining both fixed and percentage loan data.
 * The parent component holds a single source of truth for all step data.
 */
export interface CreateLoanWizardState {
  // Step 1: Loan Type Selection
  loanType: LoanType | null

  // Step 2: Common Loan Details
  borrowerId: string
  principal: string // string to support input field binding
  frequency: PaymentFrequency
  termDays: string
  startDate: string

  // Step 3: Interest Details (branch by loanType)
  totalPayable: string // for fixed loans
  interestRate: string // for percentage loans

  // Step 4: Review & Confirm (metadata)
  calculatedPreview: LoanPreview | null
}

/**
 * Loan calculation preview shown to the user before submission.
 */
export interface LoanPreview {
  principal: number
  totalPayable: number
  interest: number
  interestRate?: number // only for percentage loans
  paymentAmount: number
  frequency: PaymentFrequency
  termDays: number
}

/**
 * Props passed to each wizard step component.
 * Ensures child components are controlled by parent state.
 */
export interface WizardStepProps {
  currentStep: WizardStep
  state: CreateLoanWizardState
  updateState: <K extends keyof CreateLoanWizardState>(
    key: K,
    value: CreateLoanWizardState[K]
  ) => void
  nextStep: () => void
  prevStep: () => void
  isLoading?: boolean
  error?: string | null
}
