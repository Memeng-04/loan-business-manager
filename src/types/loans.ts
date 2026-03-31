export type PaymentFrequency = 'daily' | 'weekly' | 'bi-monthly' | 'monthly'

export type LoanStatus = 'active' | 'completed' | 'defaulted'

export interface Loan {
  id?: string
  borrower_id: string
  principal: number
  total_payable: number
  interest: number
  interest_rate: number
  frequency: PaymentFrequency
  payment_amount: number
  start_date: string
  end_date: string
  status: LoanStatus
  created_at?: string
}

export interface CreateLoanInput {
  borrower_id: string
  principal: number
  total_payable: number
  frequency: PaymentFrequency
  term_days: number
  start_date: string
}

export interface CreatePercentageLoanInput {
  borrower_id: string
  principal: number
  interest_rate: number
  frequency: PaymentFrequency
  term_days: number
  start_date: string
}