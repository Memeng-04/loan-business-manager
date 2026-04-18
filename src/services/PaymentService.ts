import { PaymentRepository } from '../repositories/PaymentRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { LoanRepository } from '../repositories/LoanRepository';
import { roundToTwoDecimals } from '../strategies/PaymentStrategy';

export class PaymentService {
  /**
   * Orchestrates complex payment actions (Advance, Partial, Absent, Paid)
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
    const loan = await LoanRepository.getById(loanId);
    if (!loan) throw new Error('Loan not found');

    const schedules = await ScheduleRepository.getByLoanId(loanId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);
    if (!targetSchedule) throw new Error('Schedule not found');

    // 1. Mark current schedule status
    const actualStatus = status === 'advance' ? 'paid' : (status === 'absent' ? 'missed' : status);
    
    if (scheduleId) {
      await ScheduleRepository.updateSchedule(scheduleId, { status: actualStatus });
    }

    // 2. Record the payment if amount > 0
    if (amountPaid > 0) {
      await PaymentRepository.create({
        loan_id: loanId,
        amount_paid: amountPaid,
        payment_date: paymentDate,
        schedule_id: scheduleId,
      });
    }

    // Sort remaining schedules to find the end dates
    const unpaidSchedules = schedules
      .filter((s) => s.status === 'unpaid' && s.id !== scheduleId)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const lastScheduleDate =
      unpaidSchedules.length > 0
        ? new Date(unpaidSchedules[unpaidSchedules.length - 1].due_date)
        : new Date(targetSchedule.due_date);

    // Helper to shift date by frequency
    const shiftDate = (date: Date, frequency: string) => {
      const newDate = new Date(date);
      switch(frequency) {
        case 'weekly': newDate.setDate(newDate.getDate() + 7); break;
        case 'bi-monthly': newDate.setDate(newDate.getDate() + 15); break;
        case 'monthly': newDate.setDate(newDate.getDate() + 30); break;
        default: newDate.setDate(newDate.getDate() + 1); // daily
      }
      return newDate;
    };

    // A) ADVANCE PAYMENT: Reduces schedules from the end
    if (status === 'advance' && amountPaid > targetSchedule.amount_due) {
      let overpayment = roundToTwoDecimals(amountPaid - targetSchedule.amount_due);
      // Start from the very last schedule and pay them off backwards
      for (let i = unpaidSchedules.length - 1; i >= 0 && overpayment > 0; i--) {
        const scheduleToReduce = unpaidSchedules[i];
        if (overpayment >= scheduleToReduce.amount_due) {
          // completely eliminate this schedule
          await ScheduleRepository.updateSchedule(scheduleToReduce.id!, { status: 'paid', amount_due: 0 });
          overpayment = roundToTwoDecimals(overpayment - scheduleToReduce.amount_due);
        } else {
          // partially reduce
          await ScheduleRepository.updateSchedule(scheduleToReduce.id!, {
            amount_due: roundToTwoDecimals(scheduleToReduce.amount_due - overpayment),
          });
          overpayment = 0;
        }
      }
    }

    // B) PARTIAL PAYMENT: Roll remainder into the next schedule
    if (status === 'partial' && amountPaid < targetSchedule.amount_due) {
      const remainder = roundToTwoDecimals(targetSchedule.amount_due - amountPaid);
      
      if (unpaidSchedules.length > 0) {
        // Roll into the next immediate unpaid schedule
        const nextSchedule = unpaidSchedules[0];
        await ScheduleRepository.updateSchedule(nextSchedule.id!, {
          amount_due: roundToTwoDecimals(nextSchedule.amount_due + remainder)
        });
      } else {
        // No future schedules exist, append a new one
        const nextDate = shiftDate(new Date(targetSchedule.due_date), loan.frequency);
        await ScheduleRepository.saveSchedule([{
          loan_id: loanId,
          due_date: nextDate.toISOString().split('T')[0],
          amount_due: remainder,
          status: 'unpaid',
        }]);
      }
    }

    // C) ABSENT: Missed payment rolls into next schedule + Penalty check
    if (status === 'absent') {
      if (unpaidSchedules.length > 0) {
         // Roll the missed amount into the next immediate schedule
         const nextSchedule = unpaidSchedules[0];
         await ScheduleRepository.updateSchedule(nextSchedule.id!, {
           amount_due: roundToTwoDecimals(nextSchedule.amount_due + targetSchedule.amount_due)
         });
      } else {
         // No future schedules exist, extend the loan
         const nextDate = shiftDate(new Date(targetSchedule.due_date), loan.frequency);
         await ScheduleRepository.saveSchedule([{
           loan_id: loanId,
           due_date: nextDate.toISOString().split('T')[0],
           amount_due: targetSchedule.amount_due,
           status: 'unpaid',
         }]);
      }

      // Check total absents for this loan to apply penalty
      const missedCount = schedules.filter(s => s.status === 'missed').length + 1; // +1 for the current one
      
      const effectivePenaltyRate = loan.penalty_rate ?? penaltyPercentage ?? 5;

      if (missedCount > 0 && missedCount % 3 === 0) { // Every 3 absents
        const penaltyAmount = roundToTwoDecimals(loan.principal * (effectivePenaltyRate / 100));
        // Penalties are usually billed at the end of the loan cycle or immediately. 
        // We will append it to the end of the loan as a distinct penalty fee schedule.
        const penaltyDateLabel = unpaidSchedules.length > 0 ? shiftDate(lastScheduleDate, loan.frequency) : shiftDate(new Date(targetSchedule.due_date), loan.frequency);
        
        await ScheduleRepository.saveSchedule([{
          loan_id: loanId,
          due_date: penaltyDateLabel.toISOString().split('T')[0],
          amount_due: penaltyAmount,
          status: 'unpaid',
          is_penalty: true,
        }]);
      }
    }
  }
}
