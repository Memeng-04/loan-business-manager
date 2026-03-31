import { useState } from 'react'
import { LoanFactory } from '../factories/LoanFactory'
import { LoanRepository } from '../repositories/LoanRepository'
import type { CreatePercentageLoanInput } from '../types/loans'

export const useCreatePercentageLoan = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createLoan = async (input: CreatePercentageLoanInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const loan  = LoanFactory.createFromPercentage(input)
      const saved = await LoanRepository.create(loan)
      setSuccess(true)
      return saved
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createLoan, loading, error, success }
}