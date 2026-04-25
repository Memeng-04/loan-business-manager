import { useState } from 'react'
import { LoanFactory } from '../factories/LoanFactory'
import { LoanRepository } from '../repositories/LoanRepository'
import { ScheduleRepository } from '../repositories/ScheduleRepository'
import { StandardScheduleStrategy } from '../strategies/ScheduleStrategy'
import type { CreatePercentageLoanInput, PaymentFrequency } from '../types/loans'

export const useCreatePercentageLoan = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createLoan = async (input: CreatePercentageLoanInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Create the loan
      const loan  = LoanFactory.createFromPercentage(input)
      const savedLoan = await LoanRepository.create(loan)
      
      if (!savedLoan) throw new Error('Failed to save loan record')

      // 2. Generate and Save the schedule automatically
      const strategy  = new StandardScheduleStrategy();
      const generated = strategy.generate(
        savedLoan.start_date,
        savedLoan.total_payable,
        savedLoan.frequency as PaymentFrequency,
        input.term_days // Original term days from input
      )

      const schedulesForDb = generated.map(entry => ({
        ...entry,
        loan_id: savedLoan.id,
      }))

      await ScheduleRepository.saveSchedule(schedulesForDb)

      setSuccess(true)
      return savedLoan
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createLoan, loading, error, success }
}