import { useState } from 'react'
import { supabase } from '../services/supabase'
import { generateSchedule } from '../strategies/ScheduleStrategy'
import type {ScheduleEntry } from '../strategies/ScheduleStrategy'
import type { PaymentFrequency } from '../types/loans'

export const useRepaymentSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)

  const previewSchedule = (
    startDate:    string,
    totalPayable: number,
    frequency:    PaymentFrequency,
    termDays:     number
  ) => {
    const generated = generateSchedule(startDate, totalPayable, frequency, termDays)
    setSchedule(generated)
    setSaved(false)
  }

  const saveSchedule = async (
    loanId:       string,
    startDate:    string,
    totalPayable: number,
    frequency:    PaymentFrequency,
    termDays:     number
  ) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-repayment-schedule',
        {
          body: { loanId, startDate, totalPayable, frequency, termDays }
        }
      )

      if (error) throw error
      setSaved(true)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { schedule, previewSchedule, saveSchedule, loading, error, saved }
}