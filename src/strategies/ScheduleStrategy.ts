import type { PaymentFrequency } from '../types/loans';
import type { IScheduleStrategy, ScheduleEntry } from '../types/strategies';


export class StandardScheduleStrategy implements IScheduleStrategy {
  generate(
    startDate: string,
    totalPayable: number,
    frequency: PaymentFrequency,
    termDays: number
  ): ScheduleEntry[] {
    const schedule: ScheduleEntry[] = []
    const start = new Date(startDate)

    let numberOfPayments: number
    let intervalDays:     number

    switch (frequency) {
      case 'daily':
        numberOfPayments = termDays
        intervalDays     = 1
        break
      case 'weekly':
        numberOfPayments = Math.ceil(termDays / 7)
        intervalDays     = 7
        break
      case 'bi-monthly':
        numberOfPayments = Math.ceil(termDays / 15)
        intervalDays     = 15
        break
      case 'monthly':
        numberOfPayments = Math.ceil(termDays / 30)
        intervalDays     = 30
        break
      default:
        numberOfPayments = termDays
        intervalDays     = 1
    }

    const amountPerPayment = Math.round((totalPayable / numberOfPayments) * 100) / 100

    for (let i = 0; i < numberOfPayments; i++) {
      const dueDate = new Date(start)
      dueDate.setDate(start.getDate() + intervalDays * (i + 1))

      schedule.push({
        due_date:   dueDate.toISOString().split('T')[0],
        amount_due: amountPerPayment,
        status:     'unpaid'
      })
    }

    return schedule
  }
}