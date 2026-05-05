import {
  FixedInterestStrategy,
  PercentageInterestStrategy
} from '../strategies/InterestStrategy'
import type { Loan, CreateLoanInput, CreatePercentageLoanInput } from '../types/loans'

export class LoanFactory {
  static create(input: CreateLoanInput): Loan {
    const strategy = new FixedInterestStrategy();
    const result = strategy.calculate(
      input.principal,
      input.term_days,
      input.frequency,
      input.start_date,
      input.total_payable
    );

    return {
      borrower_id:    input.borrower_id,
      principal:      input.principal,
      total_payable:  result.totalPayable,
      interest:       result.interest,
      interest_rate:  result.interestRate,
      frequency:      input.frequency,
      payment_amount: result.paymentAmount,
      start_date:     input.start_date,
      end_date:       result.endDate,
      status:         'active',
      penalty_rate:   input.penalty_rate
    }
  }

  static createFromPercentage(input: CreatePercentageLoanInput): Loan {
    const strategy = new PercentageInterestStrategy();
    const result = strategy.calculate(
      input.principal,
      input.term_days,
      input.frequency,
      input.start_date,
      input.interest_rate
    );

    return {
      borrower_id:    input.borrower_id,
      principal:      input.principal,
      total_payable:  result.totalPayable,
      interest:       result.interest,
      interest_rate:  result.interestRate,
      frequency:      input.frequency,
      payment_amount: result.paymentAmount,
      start_date:     input.start_date,
      end_date:       result.endDate,
      status:         'active',
      penalty_rate:   input.penalty_rate
    }
  }
}