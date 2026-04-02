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
}