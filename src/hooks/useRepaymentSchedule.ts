import { useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { generateSchedule } from '../strategies/ScheduleStrategy'
import type { ScheduleEntry } from '../strategies/ScheduleStrategy'
import type { PaymentFrequency } from '../types/loans'

export const useRepaymentSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)

  const previewFromLoan = useCallback(async (loanId: string) => {
    setLoading(true)
    setError(null)
    setSchedule([])
    setSaved(false)

    try {
      const { data, error: fetchError } = await supabase
        .from('loans')
        .select('total_payable, frequency, start_date, end_date')
        .eq('id', loanId)
        .single()

      if (fetchError) throw new Error(`Failed to fetch loan details: ${fetchError.message}`)
      if (!data)      throw new Error(`No loan found for ID ${loanId}`)

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSchedule = async (loanId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Get JWT token from current session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) throw new Error('Not authenticated — please log in first')

      const { data, error: invokeError } = await supabase.functions.invoke(
        'generate-repayment-schedule',
        {
          body: { loanId },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      if (invokeError) throw new Error(invokeError.message || 'Failed to save schedule')

      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error((data as { error: string }).error)
      }

      setSaved(true)
      return data
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
