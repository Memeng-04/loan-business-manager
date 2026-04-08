import React, { useMemo } from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount
} from '../../../strategies/InterestStrategy'

/**
 * Step 4: Interest Details
 * Branches based on loanType:
 * - Fixed: User enters total payable amount
 * - Percentage: User enters interest rate percentage
 * Shows live calculation preview.
 */
export const Step4InterestDetails: React.FC<WizardStepProps> = ({
  state,
  updateState
}) => {
  const handleTotalPayableChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      updateState('totalPayable', value)
    }
  }

  const handleInterestRateChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      updateState('interestRate', value)
    }
  }

  // Calculate preview based on loan type
  const preview = useMemo(() => {
    if (!state.principal || !state.termDays) return null

    const principal = Number(state.principal)
    const termDays = Number(state.termDays)

    if (state.loanType === 'fixed' && state.totalPayable) {
      const totalPayable = Number(state.totalPayable)
      if (totalPayable <= principal) return null

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
      if (interestRate < 0) return null

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

  const isFixedLoan = state.loanType === 'fixed'
  const isPercentageLoan = state.loanType === 'percentage'

  // Determine if we can proceed
  const canProceed =
    (isFixedLoan && state.totalPayable && Number(state.totalPayable) > Number(state.principal)) ||
    (isPercentageLoan && state.interestRate && Number(state.interestRate) >= 0)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-bold text-[#012a6a] mb-2">
          Interest Details
        </h3>
        <p className="text-sm text-gray-600">
          {isFixedLoan
            ? 'Enter the total amount the borrower will repay (including interest).'
            : 'Enter the annual interest rate as a percentage.'}
        </p>
      </div>

      {/* Fixed Loan: Total Payable Input */}
      {isFixedLoan && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#012a6a]">
            Total Payable Amount (₱)
          </label>
          <input
            type="text"
            placeholder="e.g. 60,000"
            value={state.totalPayable}
            onChange={e => handleTotalPayableChange(e.target.value)}
            disabled={isLoading}
            className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#112bd6] transition disabled:opacity-50 disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be greater than the principal amount
          </p>
          {state.totalPayable &&
            Number(state.totalPayable) <= Number(state.principal) && (
              <p className="text-xs text-red-600 mt-1">
                ❌ Total payable must be greater than principal
              </p>
            )}
        </div>
      )}

      {/* Percentage Loan: Interest Rate Input */}
      {isPercentageLoan && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#012a6a]">
            Annual Interest Rate (%)
          </label>
          <input
            type="text"
            placeholder="e.g. 15.5"
            value={state.interestRate}
            onChange={e => handleInterestRateChange(e.target.value)}
            disabled={isLoading}
            className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#112bd6] transition disabled:opacity-50 disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter as a number (e.g., 15 for 15%)
          </p>
          {state.interestRate && Number(state.interestRate) < 0 && (
            <p className="text-xs text-red-600 mt-1">
              ❌ Interest rate cannot be negative
            </p>
          )}
        </div>
      )}

      {/* Calculation Preview */}
      {isLoading && !preview && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500 animate-pulse">Loading Preview...</p>
        </div>
      )}
      {preview && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4">
          <h4 className="font-bold text-green-900 mb-3">Loan Preview</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Principal:</span>
              <span className="font-semibold text-green-900">
                ₱{preview.principal.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">
                {isFixedLoan ? 'Fixed' : 'Interest'} Amount:
              </span>
              <span className="font-semibold text-green-900">
                {isFixedLoan ? '₱' : ''}
                {isFixedLoan
                  ? preview.interest.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : preview.interestRate?.toFixed(2)}
                {!isFixedLoan && '%'}
              </span>
            </div>
            <div className="border-t border-green-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">
                  Total Payable:
                </span>
                <span className="font-bold text-lg text-green-900">
                  ₱{preview.totalPayable.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
            <div className="border-t border-green-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">
                  Payment per {preview.frequency}:
                </span>
                <span className="font-bold text-green-900">
                  ₱{preview.paymentAmount.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {!preview && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-xs text-yellow-700 font-medium">
            ⚠️ Enter valid {isFixedLoan ? 'total payable' : 'interest rate'} to
            see preview
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-[#6db6fe] rounded-2xl p-4">
        <p className="text-xs text-[#012a6a] font-medium">
          💡 The preview shows estimated payment amounts based on your selected
          frequency. Review carefully before submitting.
        </p>
      </div>
    </div>
  )
}
