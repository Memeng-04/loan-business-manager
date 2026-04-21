import React, { useMemo } from 'react'
import type { WizardStepProps } from '../../../../types/wizardTypes'
import { Lightbulb, BarChart3, Check } from 'lucide-react'
import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount
} from '../../../../strategies/InterestStrategy'
import { formatCurrency, isValidCurrency } from '../../../../lib/formatters'
import { SummaryCard } from '../../SummaryCard'
import { InfoBox } from '../../InfoBox'
import styles from './Step4InterestDetails.module.css'

/**
 * Step 4: Interest Details
 * Branches based on loanType:
 * - Fixed: User enters total payable amount (left), preview on right
 * - Percentage: User enters interest rate percentage (left), preview on right
 * 
 * NEW: Uses CSS Grid for side-by-side layout on desktop (left: inputs, right: preview),
 * responsive single-column on mobile.
 */
export const Step4InterestDetails: React.FC<WizardStepProps> = ({
  state,
  updateState,
  isLoading
}) => {
  const handleTotalPayableChange = (value: string) => {
    if (isValidCurrency(value)) {
      updateState('totalPayable', value)
    }
  }

  const handleInterestRateChange = (value: string) => {
    if (isValidCurrency(value)) {
      updateState('interestRate', value)
    }
  }

  const handlePenaltyRateChange = (value: string) => {
    if (isValidCurrency(value)) {
      updateState('penaltyRate', value)
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

  return (
    <div className={styles.stepContainer}>
      {/* Content Grid: Left (Input), Right (Preview) */}
      <div className={styles.contentGrid}>
        {/* Left Column: Input */}
        <div>
          {/* Fixed Loan: Total Payable Input */}
          {isFixedLoan && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Total Payable Amount (₱)
              </label>
              <input
                type="number"
                placeholder="e.g. 60000"
                value={state.totalPayable}
                onChange={e => handleTotalPayableChange(e.target.value)}
                disabled={isLoading}
                className={styles.input}
              />
              <p className={styles.inputHelper}>
                Must be greater than the principal amount
              </p>
              {state.totalPayable &&
                Number(state.totalPayable) <= Number(state.principal) && (
                  <p className={styles.errorText}>
                    <Check size={16} style={{ display: 'inline', marginRight: '0.5rem', transform: 'rotate(45deg)', opacity: 0.7 }} />
                    Total payable must be greater than principal
                  </p>
                )}
            </div>
          )}

          {/* Percentage Loan: Interest Rate Input */}
          {isPercentageLoan && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={state.interestRate}
                onChange={e => handleInterestRateChange(e.target.value)}
                disabled={isLoading}
                className={styles.input}
              />
              <p className={styles.inputHelper}>
                Enter as a number (e.g., 15 for 15%)
              </p>
              {state.interestRate && Number(state.interestRate) < 0 && (
                <p className={styles.errorText}>
                  <Check size={16} style={{ display: 'inline', marginRight: '0.5rem', transform: 'rotate(45deg)', opacity: 0.7 }} />
                  Interest rate cannot be negative
                </p>
              )}
            </div>
          )}

          {/* Common Penalty Rate Input */}
          <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
            <label className={styles.label}>
              Default Penalty Rate (%)
            </label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={state.penaltyRate}
              onChange={e => handlePenaltyRateChange(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Applied to missed payments (every 3 consecutive misses)
            </p>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div>
          {preview && (
            <SummaryCard
              title="Loan Preview"
              icon={<BarChart3 size={18} />}
              items={[
                {
                  label: 'Principal:',
                  value: formatCurrency(preview.principal)
                },
                {
                  label: `${isFixedLoan ? 'Fixed' : 'Interest'} Amount:`,
                  value: isFixedLoan ? formatCurrency(preview.interest) : `${preview.interestRate?.toFixed(2)}%`
                },
                {
                  label: 'Total Payable:',
                  value: formatCurrency(preview.totalPayable),
                  isTotal: true
                },
                {
                  label: `Payment per ${preview.frequency}:`,
                  value: formatCurrency(preview.paymentAmount)
                }
              ]}
            />
          )}
        </div>
      </div>

      {/* Info Box */}
      <InfoBox icon={<Lightbulb size={16} />}>
        Enter {isFixedLoan ? 'the total amount the borrower will repay (must be more than the principal)' : 'the annual interest rate as a percentage'} to see the payment preview on the right.
      </InfoBox>
    </div>
  )
}
