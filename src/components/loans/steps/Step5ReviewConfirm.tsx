import React, { useMemo } from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount
} from '../../../strategies/InterestStrategy'
import { useBorrowers } from '../../../hooks/useBorrowers'

/**
 * Step 5: Review & Confirmation
 * Displays all entered loan information for final review.
 * User can submit or return to edit previous steps.
 */
export const Step5ReviewConfirm: React.FC<WizardStepProps> = ({
  state,
  nextStep,
  prevStep,
  isLoading,
  error
}) => {
  const { borrowers } = useBorrowers()
  const selectedBorrower = borrowers.find(b => b.id === state.borrowerId)

  // Calculate final preview
  const preview = useMemo(() => {
    if (!state.principal || !state.termDays) return null

    const principal = Number(state.principal)
    const termDays = Number(state.termDays)

    if (state.loanType === 'fixed' && state.totalPayable) {
      const totalPayable = Number(state.totalPayable)

      const { interest, interestRate } = calculateInterest(
        principal,
        totalPayable
      )
      const paymentAmount = calculatePaymentAmount(
        totalPayable,
        state.frequency,
        termDays
      )

      return {
        principal,
        totalPayable,
        interest,
        interestRate,
        paymentAmount,
        frequency: state.frequency,
        termDays
      }
    } else if (state.loanType === 'percentage' && state.interestRate) {
      const interestRate = Number(state.interestRate)

      const { interest, totalPayable } = calculateFromPercentage(
        principal,
        interestRate
      )
      const paymentAmount = calculatePaymentAmount(
        totalPayable,
        state.frequency,
        termDays
      )

      return {
        principal,
        totalPayable,
        interest,
        interestRate,
        paymentAmount,
        frequency: state.frequency,
        termDays
      }
    }

    return null
  }, [state.principal, state.termDays, state.loanType, state.totalPayable, state.interestRate, state.frequency])

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-bold text-[#012a6a] mb-2">
          Review & Confirm
        </h3>
        <p className="text-sm text-gray-600">
          Please review all details before submitting. You can go back to make
          changes.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl">
          ❌ {error}
        </div>
      )}

      {/* Borrower Details Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-bold text-[#012a6a] mb-3 flex items-center gap-2">
          <span>👤</span> Borrower
        </h4>
        {selectedBorrower ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium text-[#012a6a]">Name:</span> 
              <span className="ml-2 text-gray-700">{selectedBorrower.full_name}</span>
            </p>
            {selectedBorrower.business_name && (
              <p className="text-sm">
                <span className="font-medium text-[#012a6a]">Business:</span>
                <span className="ml-2 text-gray-700">
                  {selectedBorrower.business_name}
                </span>
              </p>
            )}
            {selectedBorrower.phone && (
              <p className="text-sm">
                <span className="font-medium text-[#012a6a]">Phone:</span>
                <span className="ml-2 text-gray-700">{selectedBorrower.phone}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No borrower selected</p>
        )}
      </div>

      {/* Loan Type Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <h4 className="font-bold text-[#012a6a] mb-3 flex items-center gap-2">
          <span>📋</span> Loan Type
        </h4>
        <p className="text-sm">
          <span className="capitalize font-semibold text-[#012a6a]">
            {state.loanType === 'fixed' ? 'Fixed Interest' : 'Percentage Interest'}
          </span>
        </p>
      </div>

      {/* Loan Details Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <h4 className="font-bold text-[#012a6a] mb-3 flex items-center gap-2">
          <span>💰</span> Loan Details
        </h4>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium text-[#012a6a]">Principal:</span>
            <span className="ml-2 text-gray-700">₱{formatCurrency(Number(state.principal))}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium text-[#012a6a]">Payment Frequency:</span>
            <span className="ml-2 capitalized text-gray-700">{state.frequency}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium text-[#012a6a]">Loan Term:</span>
            <span className="ml-2 text-gray-700">{state.termDays} days</span>
          </p>
          <p className="text-sm">
            <span className="font-medium text-[#012a6a]">Start Date:</span>
            <span className="ml-2 text-gray-700">{formatDate(state.startDate)}</span>
          </p>
        </div>
      </div>

      {/* Interest Details Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <h4 className="font-bold text-[#012a6a] mb-3 flex items-center gap-2">
          <span>📊</span> Interest Details
        </h4>
        <div className="space-y-2">
          {state.loanType === 'fixed' ? (
            <>
              <p className="text-sm">
                <span className="font-medium text-[#012a6a]">Total Payable:</span>
                <span className="ml-2 text-gray-700">
                  ₱{formatCurrency(Number(state.totalPayable))}
                </span>
              </p>
              {preview && (
                <p className="text-sm">
                  <span className="font-medium text-[#012a6a]">
                    Fixed Interest:
                  </span>
                  <span className="ml-2 text-gray-700">
                    ₱{formatCurrency(preview.interest)}
                  </span>
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm">
                <span className="font-medium text-[#012a6a]">Interest Rate:</span>
                <span className="ml-2 text-gray-700">{state.interestRate}%</span>
              </p>
              {preview && (
                <p className="text-sm">
                  <span className="font-medium text-[#012a6a]">
                    Calculated Interest:
                  </span>
                  <span className="ml-2 text-gray-700">
                    ₱{formatCurrency(preview.interest)}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Schedule Preview Section */}
      {preview && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <span>✅</span> Payment Summary
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-green-700">Principal:</span>
              <span className="font-semibold text-green-900">
                ₱{formatCurrency(preview.principal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Total Interest:</span>
              <span className="font-semibold text-green-900">
                ₱{formatCurrency(preview.interest)}
              </span>
            </div>
            <div className="border-t border-green-300 pt-3 flex justify-between items-center">
              <span className="font-bold text-green-900">Total Amount to Repay:</span>
              <span className="font-bold text-lg text-green-900">
                ₱{formatCurrency(preview.totalPayable)}
              </span>
            </div>
            <div className="border-t border-green-300 pt-3 flex justify-between items-center">
              <span className="font-medium text-green-700">
                Payment per {state.frequency}:
              </span>
              <span className="font-bold text-green-900">
                ₱{formatCurrency(preview.paymentAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-[#6db6fe] rounded-2xl p-4">
        <p className="text-xs text-[#012a6a] font-medium">
          ℹ️ After submission, you'll be able to create a repayment schedule for
          this loan.
        </p>
      </div>
    </div>
  )
}
