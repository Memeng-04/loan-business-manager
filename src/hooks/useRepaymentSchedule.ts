import { useState } from 'react'
import { supabase } from '../services/supabase'
import { generateSchedule} from '../strategies/ScheduleStrategy'
import type { ScheduleEntry } from '../strategies/ScheduleStrategy'
import type { PaymentFrequency } from '../types/loans'

export const useRepaymentSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)

  const previewFromLoan = async (loanId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('loans')
        .select('total_payable, frequency, start_date, end_date')
        .eq('id', loanId)
        .single()

      if (error) throw error

      const start    = new Date(data.start_date)
      const end      = new Date(data.end_date)
      const termDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      const generated = generateSchedule(
        data.start_date,
        data.total_payable,
        data.frequency as PaymentFrequency,
        termDays
      )

      setSchedule(generated)
      setSaved(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const saveSchedule = async (loanId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await supabase.functions.invoke(
        'generate-repayment-schedule',
        {
          body: { loanId },
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      )

      console.log('response:', response)

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save schedule')
      }

      setSaved(true)
      return response.data
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save schedule'
      setError(errorMessage)
      console.error('Save error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { schedule, previewFromLoan, saveSchedule, loading, error, saved }
}