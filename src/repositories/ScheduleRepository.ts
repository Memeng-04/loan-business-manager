import { supabase } from '../services/supabase'
import { getCurrentUserId } from '../services/auth'
import type { ScheduleEntry } from '../strategies/ScheduleStrategy'

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
}