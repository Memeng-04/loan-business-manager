import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount,
  calculateEndDate
} from '../strategies/InterestStrategy'
import type { Loan, CreateLoanInput, CreatePercentageLoanInput } from '../types/loans'

export class LoanFactory {
  static create(input: CreateLoanInput): Loan {
    const { interest, interestRate } = calculateInterest(
      input.principal,
      input.total_payable
    )

    const paymentAmount = calculatePaymentAmount(
      input.total_payable,
      input.frequency,
      input.term_days
    )

    const endDate = calculateEndDate(
      input.start_date,
      input.term_days
    )

    return {
      borrower_id:    input.borrower_id,
      principal:      input.principal,
      total_payable:  input.total_payable,
      interest,
      interest_rate:  interestRate,
      frequency:      input.frequency,
      payment_amount: paymentAmount,
      start_date:     input.start_date,
      end_date:       endDate,
      status:         'active',
      penalty_rate:   input.penalty_rate
    }
  }

  static createFromPercentage(input: CreatePercentageLoanInput): Loan {
    const { interest, totalPayable } = calculateFromPercentage(
      input.principal,
      input.interest_rate
    )

    const paymentAmount = calculatePaymentAmount(
      totalPayable,
      input.frequency,
      input.term_days
    )

    const endDate = calculateEndDate(
      input.start_date,
      input.term_days
    )

    return {
      borrower_id:    input.borrower_id,
      principal:      input.principal,
      total_payable:  totalPayable,
      interest,
      interest_rate:  input.interest_rate,
      frequency:      input.frequency,
      payment_amount: paymentAmount,
      start_date:     input.start_date,
      end_date:       endDate,
      status:         'active',
      penalty_rate:   input.penalty_rate
    }
  }
}