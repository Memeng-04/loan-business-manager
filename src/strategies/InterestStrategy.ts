import type { PaymentFrequency } from '../types/loans'

export const calculateInterest = (
  principal: number,
  totalPayable: number
) => {
  const interest     = totalPayable - principal
  const interestRate = (interest / principal) * 100
  return { interest, interestRate }
}

export const calculatePaymentAmount = (
  totalPayable: number,
  frequency: PaymentFrequency,
  termDays: number
): number => {
  switch (frequency) {
    case 'daily':      return totalPayable / termDays
    case 'weekly':     return totalPayable / (termDays / 7)
    case 'bi-monthly': return totalPayable / (termDays / 15)
    case 'monthly':    return totalPayable / (termDays / 30)
    default:           return totalPayable
  }
}

export const calculateEndDate = (
  startDate: string,
  termDays: number
): string => {
  const date = new Date(startDate)
  date.setDate(date.getDate() + termDays)
  return date.toISOString().split('T')[0]
}