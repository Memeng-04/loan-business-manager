import { PaymentActionFactory } from '../factories/PaymentActionFactory';
import { ScheduleRepository } from '../repositories/ScheduleRepository';

export class PaymentService {
  /**
   * Orchestrates complex payment actions (Advance, Partial, Absent, Paid)
   * using the Strategy and Factory patterns.
   */
  static async processPaymentAction({
    loanId,
    scheduleId,
    amountPaid,
    paymentDate,
    status,
    penaltyPercentage,
  }: {
    loanId: string;
    scheduleId: string;
    amountPaid: number;
    paymentDate: string;
    status: 'paid' | 'partial' | 'advance' | 'absent';
    penaltyPercentage?: number;
  }): Promise<void> {

    // Helper to determine if advance payment is actually an overpayment
    let isOverpayment = false;
    if (status === 'advance' && scheduleId) {
      const schedules = await ScheduleRepository.getByLoanId(loanId);
      const targetSchedule = schedules.find((s) => s.id === scheduleId);
      if (targetSchedule && amountPaid > targetSchedule.amount_due) {
        isOverpayment = true;
      }
    }

    // Resolve the appropriate strategy through the Factory
    const strategy = PaymentActionFactory.createStrategy(status, isOverpayment);

    // Execute the strategy
    await strategy.execute({
      loanId,
      scheduleId,
      amountPaid,
      paymentDate,
      penaltyPercentage
    });
  }
}
