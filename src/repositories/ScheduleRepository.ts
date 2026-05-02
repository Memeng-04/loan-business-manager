import { supabase } from '../services/supabase'
import { getCurrentUserId } from '../services/auth'
import type { ScheduleEntry } from '../types/strategies';
import type { Loan } from '../types/loans';
import type { Borrower } from '../types/borrowers';

export type DashboardScheduleWithLoan = {
  id: string;
  loan_id: string;
  due_date?: string;
  amount_due: number;
  status: string;
  loan?: Loan & { borrower?: Borrower };
}

export class ScheduleRepository {
  static async getByLoanId(loanId: string): Promise<ScheduleEntry[]> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('loan_id', loanId)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data as ScheduleEntry[]
  }

  static async saveSchedule(schedules: ScheduleEntry[]): Promise<ScheduleEntry[]> {
    const userId = await getCurrentUserId()

    // Map schedules to include user_id for RLS compliance
    const schedulesWithUserId = schedules.map(schedule => ({
      ...schedule,
      user_id: userId
    }))

    const { data, error } = await supabase
      .from('payment_schedules')
      .insert(schedulesWithUserId)
      .select()

    if (error) throw error
    return data as ScheduleEntry[]
  }

  static async deleteByLoanId(loanId: string): Promise<void> {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('payment_schedules')
      .delete()
      .eq('loan_id', loanId)
      .eq('user_id', userId)

    if (error) throw error
  }

  static async deleteById(scheduleId: string): Promise<void> {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('payment_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId)

    if (error) throw error
  }

  static async updateSchedule(scheduleId: string, updates: Partial<ScheduleEntry>): Promise<void> {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('payment_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .eq('user_id', userId)

    if (error) throw error
  }

  static async getDashboardSchedules(startDate: string, endDate: string): Promise<DashboardScheduleWithLoan[]> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('payment_schedules')
      .select(`
        *,
        loan:loans (
          id, principal, status, interest_rate, payment_amount, frequency,
          borrower:borrowers ( id, full_name, phone )
        )
      `)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return (data ?? []) as DashboardScheduleWithLoan[]
  }
}