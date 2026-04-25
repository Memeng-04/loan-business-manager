import { useState, useCallback } from 'react'
import { StandardScheduleStrategy } from '../strategies/ScheduleStrategy'
import type { ScheduleEntry } from '../types/strategies'
import type { PaymentFrequency } from '../types/loans'
import { LoanRepository } from '../repositories/LoanRepository'
import { ScheduleRepository } from '../repositories/ScheduleRepository'

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
      const loan = await LoanRepository.getById(loanId)

      if (!loan) throw new Error(`No loan found for ID ${loanId}`)

      // Try to fetch existing schedule from DB
      const existing = await ScheduleRepository.getByLoanId(loanId)
      
      if (existing && existing.length > 0) {
        setSchedule(existing)
        setSaved(true)
        return
      }

      // Fallback: Generate preview if no existing schedule
      const start    = new Date(loan.start_date)
      const end      = new Date(loan.end_date)
      const termDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      const strategy = new StandardScheduleStrategy();
      const generated = strategy.generate(
        loan.start_date,
        loan.total_payable,
        loan.frequency as PaymentFrequency,
        termDays
      )

      setSchedule(generated)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save the repayment schedule directly via ScheduleRepository.
   * No edge function needed — generates client-side and saves via Supabase client.
   */
  const saveSchedule = async (loanId: string) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Fetch the loan details
      const loan = await LoanRepository.getById(loanId)
      if (!loan) throw new Error(`No loan found for ID ${loanId}`)

      // 2. Calculate term days
      const start    = new Date(loan.start_date)
      const end      = new Date(loan.end_date)
      const termDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      // 3. Generate the schedule client-side
      const strategy  = new StandardScheduleStrategy();
      const generated = strategy.generate(
        loan.start_date,
        loan.total_payable,
        loan.frequency as PaymentFrequency,
        termDays
      )

      // 4. Map schedule entries to include loan_id for DB insert
      const schedulesForDb = generated.map(entry => ({
        ...entry,
        loan_id: loanId,
      }))

      // 5. Delete existing schedules for this loan first
      await ScheduleRepository.deleteByLoanId(loanId)

      // 6. Save via Repository (handles user_id automatically)
      const savedData = await ScheduleRepository.saveSchedule(schedulesForDb)

      setSaved(true)
      return savedData
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
