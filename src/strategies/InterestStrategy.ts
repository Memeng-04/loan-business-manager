import type { PaymentFrequency } from '../types/loans';
import type { IInterestStrategy, CalculationResult } from '../types/strategies';

export abstract class BaseInterestStrategy {
  protected calculatePaymentAmount(
    totalPayable: number,
    frequency: PaymentFrequency,
    termDays: number
  ): number {
    switch (frequency) {
      case 'daily':      return totalPayable / termDays;
      case 'weekly':     return totalPayable / (termDays / 7);
      case 'bi-monthly': return totalPayable / (termDays / 15);
      case 'monthly':    return totalPayable / (termDays / 30);
      default:           return totalPayable;
    }
  }

  protected calculateEndDate(
    startDate: string,
    termDays: number
  ): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + termDays);
    return date.toISOString().split('T')[0];
  }
}

export class FixedInterestStrategy extends BaseInterestStrategy implements IInterestStrategy {
  calculate(
    principal: number,
    termDays: number,
    frequency: PaymentFrequency,
    startDate: string,
    totalPayable: number
  ): CalculationResult {
    const interest = totalPayable - principal;
    const interestRate = (interest / principal) * 100;
    const paymentAmount = this.calculatePaymentAmount(totalPayable, frequency, termDays);
    const endDate = this.calculateEndDate(startDate, termDays);

    return {
      interest,
      interestRate,
      totalPayable,
      paymentAmount,
      endDate
    };
  }
}

export class PercentageInterestStrategy extends BaseInterestStrategy implements IInterestStrategy {
  calculate(
    principal: number,
    termDays: number,
    frequency: PaymentFrequency,
    startDate: string,
    interestRate: number
  ): CalculationResult {
    const interest = principal * (interestRate / 100);
    const totalPayable = principal + interest;
    const paymentAmount = this.calculatePaymentAmount(totalPayable, frequency, termDays);
    const endDate = this.calculateEndDate(startDate, termDays);

    return {
      interest,
      interestRate,
      totalPayable,
      paymentAmount,
      endDate
    };
  }
}