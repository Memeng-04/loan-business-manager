import React, { useMemo } from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import { Lightbulb, BarChart3, AlertCircle, Check } from 'lucide-react'
import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount
} from '../../../strategies/InterestStrategy'
import { formatCurrency, formatNumber, isValidCurrency } from '../../../lib/formatters'
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
      {/* Section Title */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Interest Details</h3>
        <p className={styles.sectionDescription}>
          {isFixedLoan
            ? 'Enter the total amount the borrower will repay (including interest).'
            : 'Enter the annual interest rate as a percentage.'}
        </p>
      </div>

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
                type="text"
                placeholder="e.g. 60,000"
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
                    <Check size={16} style={{ display: 'inline', marginRight: '0.5rem', rotation: '45deg', opacity: 0.7 }} />
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
                type="text"
                placeholder="e.g. 15.5"
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
                  <Check size={16} style={{ display: 'inline', marginRight: '0.5rem', rotation: '45deg', opacity: 0.7 }} />
                  Interest rate cannot be negative
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div>
          {isLoading && !preview && (
            <div className={`${styles.previewCard} ${styles.loading}`}>
              <div className={styles.loadingMessage}>Loading Preview...</div>
            </div>
          )}
          {preview && (
            <div className={styles.previewCard}>
              <h4 className={styles.previewCardTitle}><BarChart3 size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Loan Preview</h4>
              <div className={styles.previewItem}>
                <span className={styles.previewItemLabel}>Principal:</span>
                <span className={styles.previewItemValue}>
                  {formatCurrency(preview.principal)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewItemLabel}>
                  {isFixedLoan ? 'Fixed' : 'Interest'} Amount:
                </span>
                <span className={styles.previewItemValue}>
                  {isFixedLoan ? formatCurrency(preview.interest) : `${preview.interestRate?.toFixed(2)}%`}
                </span>
              </div>
              <div className={styles.previewDivider} />
              <div className={styles.previewItem}>
                <span className={styles.previewItemTotal}>Total Payable:</span>
                <span className={styles.previewItemTotalValue}>
                  {formatCurrency(preview.totalPayable)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewItemLabel}>
                  Payment per {preview.frequency}:
                </span>
                <span className={styles.previewItemValue}>
                  {formatCurrency(preview.paymentAmount)}
                </span>
              </div>
                  })}
                </span>
              </div>
            </div>
          )}
          {!preview && !isLoading && (
            <div className={styles.warningBox}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#ca8a04' }} />
              Enter valid {isFixedLoan ? 'total payable' : 'interest rate'} to
              see preview
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
          <Lightbulb size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          The preview shows estimated payment amounts based on your selected
        frequency. Review carefully before submitting.
      </div>
    </div>
  )
}
