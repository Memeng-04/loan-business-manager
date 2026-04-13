import { supabase } from '../services/supabase'
import type { ScheduleEntry } from '../strategies/ScheduleStrategy'

export class ScheduleRepository {
  static async getByLoanId(loanId: string): Promise<ScheduleEntry[]> {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('loan_id', loanId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data as ScheduleEntry[]
  }

  static async saveSchedule(schedules: ScheduleEntry[]): Promise<ScheduleEntry[]> {
    // 1. Fetch the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user || userError) {
      throw new Error('User must be authenticated to save payment schedules')
    }

    // 2. Map schedules to include user_id for RLS compliance
    const schedulesWithUserId = schedules.map(schedule => ({
      ...schedule,
      user_id: user.id
    }))

    // 3. Insert schedules with user_id
    const { data, error } = await supabase
      .from('payment_schedules')
      .insert(schedulesWithUserId)
      .select()

    if (error) throw error
    return data as ScheduleEntry[]
  }
}