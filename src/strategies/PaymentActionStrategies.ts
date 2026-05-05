import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { LoanRepository } from '../repositories/LoanRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { roundToTwoDecimals } from './PaymentStrategy';
import type { IPaymentActionStrategy, PaymentActionInput } from '../types/strategies';

abstract class BasePaymentActionStrategy implements IPaymentActionStrategy {
  protected shiftDate(date: Date, frequency: string): Date {
    const newDate = new Date(date);
    switch(frequency) {
      case 'weekly': newDate.setDate(newDate.getDate() + 7); break;
      case 'bi-monthly': newDate.setDate(newDate.getDate() + 15); break;
      case 'monthly': newDate.setDate(newDate.getDate() + 30); break;
      default: newDate.setDate(newDate.getDate() + 1); // daily
    }
    return newDate;
  }

  abstract execute(input: PaymentActionInput): Promise<void>;
}

export class FullPaymentActionStrategy extends BasePaymentActionStrategy {
  async execute(input: PaymentActionInput): Promise<void> {
    if (input.scheduleId) {
      await ScheduleRepository.updateSchedule(input.scheduleId, { status: 'paid' });
    }

    if (input.amountPaid > 0) {
      await PaymentRepository.create({
        loan_id: input.loanId,
        amount_paid: input.amountPaid,
        payment_date: input.paymentDate,
        schedule_id: input.scheduleId,
      });
    }
  }
}

export class PartialPaymentActionStrategy extends BasePaymentActionStrategy {
  async execute(input: PaymentActionInput): Promise<void> {
    const loan = await LoanRepository.getById(input.loanId);
    if (!loan) throw new Error('Loan not found');

    const schedules = await ScheduleRepository.getByLoanId(input.loanId);
    const targetSchedule = schedules.find((s) => s.id === input.scheduleId);
    if (!targetSchedule) throw new Error('Schedule not found');

    if (input.scheduleId) {
      await ScheduleRepository.updateSchedule(input.scheduleId, { status: 'partial' });
    }

    if (input.amountPaid > 0) {
      await PaymentRepository.create({
        loan_id: input.loanId,
        amount_paid: input.amountPaid,
        payment_date: input.paymentDate,
        schedule_id: input.scheduleId,
      });
    }

    const unpaidSchedules = schedules
      .filter((s) => s.status === 'unpaid' && s.id !== input.scheduleId)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const remainder = roundToTwoDecimals(targetSchedule.amount_due - input.amountPaid);
    
    if (unpaidSchedules.length > 0) {
      const nextSchedule = unpaidSchedules[0];
      await ScheduleRepository.updateSchedule(nextSchedule.id!, {
        amount_due: roundToTwoDecimals(nextSchedule.amount_due + remainder)
      });
    } else {
      const nextDate = this.shiftDate(new Date(targetSchedule.due_date), loan.frequency);
      await ScheduleRepository.saveSchedule([{
        loan_id: input.loanId,
        due_date: nextDate.toISOString().split('T')[0],
        amount_due: remainder,
        status: 'unpaid',
      }]);
    }
  }
}

export class AdvancePaymentActionStrategy extends BasePaymentActionStrategy {
  async execute(input: PaymentActionInput): Promise<void> {
    const schedules = await ScheduleRepository.getByLoanId(input.loanId);
    const targetSchedule = schedules.find((s) => s.id === input.scheduleId);
    if (!targetSchedule) throw new Error('Schedule not found');

    if (input.scheduleId) {
      await ScheduleRepository.updateSchedule(input.scheduleId, { status: 'paid' });
    }

    if (input.amountPaid > 0) {
      await PaymentRepository.create({
        loan_id: input.loanId,
        amount_paid: input.amountPaid,
        payment_date: input.paymentDate,
        schedule_id: input.scheduleId,
      });
    }

    const unpaidSchedules = schedules
      .filter((s) => s.status === 'unpaid' && s.id !== input.scheduleId)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    let overpayment = roundToTwoDecimals(input.amountPaid - targetSchedule.amount_due);
    for (let i = unpaidSchedules.length - 1; i >= 0 && overpayment > 0; i--) {
      const scheduleToReduce = unpaidSchedules[i];
      if (overpayment >= scheduleToReduce.amount_due) {
        await ScheduleRepository.updateSchedule(scheduleToReduce.id!, { status: 'paid', amount_due: 0 });
        overpayment = roundToTwoDecimals(overpayment - scheduleToReduce.amount_due);
      } else {
        await ScheduleRepository.updateSchedule(scheduleToReduce.id!, {
          amount_due: roundToTwoDecimals(scheduleToReduce.amount_due - overpayment),
        });
        overpayment = 0;
      }
    }
  }
}

export class AbsentPaymentActionStrategy extends BasePaymentActionStrategy {
  async execute(input: PaymentActionInput): Promise<void> {
    const loan = await LoanRepository.getById(input.loanId);
    if (!loan) throw new Error('Loan not found');

    const schedules = await ScheduleRepository.getByLoanId(input.loanId);
    const targetSchedule = schedules.find((s) => s.id === input.scheduleId);
    if (!targetSchedule) throw new Error('Schedule not found');

    if (input.scheduleId) {
      await ScheduleRepository.updateSchedule(input.scheduleId, { status: 'missed' });
    }

    const unpaidSchedules = schedules
      .filter((s) => s.status === 'unpaid' && s.id !== input.scheduleId)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const lastScheduleDate =
      unpaidSchedules.length > 0
        ? new Date(unpaidSchedules[unpaidSchedules.length - 1].due_date)
        : new Date(targetSchedule.due_date);

    if (unpaidSchedules.length > 0) {
       const nextSchedule = unpaidSchedules[0];
       await ScheduleRepository.updateSchedule(nextSchedule.id!, {
         amount_due: roundToTwoDecimals(nextSchedule.amount_due + targetSchedule.amount_due)
       });
    } else {
       const nextDate = this.shiftDate(new Date(targetSchedule.due_date), loan.frequency);
       await ScheduleRepository.saveSchedule([{
         loan_id: input.loanId,
         due_date: nextDate.toISOString().split('T')[0],
         amount_due: targetSchedule.amount_due,
         status: 'unpaid',
       }]);
    }

    // Recalculate missed count from the database to ensure accuracy for penalty trigger
    const updatedSchedules = await ScheduleRepository.getByLoanId(input.loanId);
    const missedCount = updatedSchedules.filter(s => s.status === 'missed').length;
    const effectivePenaltyRate = loan.penalty_rate ?? input.penaltyPercentage ?? 5;

    if (missedCount > 0 && missedCount % 3 === 0) {
      const penaltyAmount = roundToTwoDecimals(loan.principal * (effectivePenaltyRate / 100));
      const penaltyDateLabel = unpaidSchedules.length > 0 ? this.shiftDate(lastScheduleDate, loan.frequency) : this.shiftDate(new Date(targetSchedule.due_date), loan.frequency);
      
      await ScheduleRepository.saveSchedule([{
        loan_id: input.loanId,
        due_date: penaltyDateLabel.toISOString().split('T')[0],
        amount_due: penaltyAmount,
        status: 'unpaid',
        is_penalty: true,
      }]);
    }
  }
}
