import React, { useMemo } from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount
} from '../../../strategies/InterestStrategy'
import { useBorrowers } from '../../../hooks/useBorrowers'
import { AlertCircle, Clipboard, BarChart3, Check, User, DollarSign, Clock, Calendar } from 'lucide-react'
import { SummaryCard } from '../SummaryCard'
import styles from './Step5ReviewConfirm.module.css'

/**
 * Step 5: Review & Confirmation
 * Displays all entered loan information in a high-density summary layout.
 * Uses CSS Grid for space-efficient two-column layout on desktop.
 * User can submit or return to edit previous steps.
 */
export const Step5ReviewConfirm: React.FC<WizardStepProps> = ({
  state,
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
      month: 'short',
      day: 'numeric'
    })

  return (
    <div className={styles.stepContainer}>
      {/* Error State */}
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {/* Summary Grid - Two columns on desktop */}
      <div className={styles.summaryGrid}>
        
        {/* Borrower Details */}
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryCardTitle}>
            <span className={styles.summaryCardTitleEmoji}><User size={16} /></span> Borrower
          </h4>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Name:</span>
              <span className={styles.summaryItemValue}>
                {selectedBorrower?.full_name || '—'}
              </span>
            </div>
            {selectedBorrower?.phone && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Phone:</span>
                <span className={styles.summaryItemValue}>
                  {selectedBorrower.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loan Type */}
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryCardTitle}>
            <span className={styles.summaryCardTitleEmoji}><Clipboard size={16} /></span> Type
          </h4>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemValue} style={{ fontWeight: 700 }}>
                {state.loanType === 'fixed' ? 'Fixed Interest' : 'Percentage Interest'}
              </span>
            </div>
          </div>
        </div>

        {/* Principal & Term */}
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryCardTitle}>
            <span className={styles.summaryCardTitleEmoji}><DollarSign size={16} /></span> Principal
          </h4>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemValue} style={{ fontWeight: 700 }}>
                ₱{formatCurrency(Number(state.principal))}
              </span>
            </div>
          </div>
        </div>

        {/* Frequency & Duration */}
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryCardTitle}>
            <span className={styles.summaryCardTitleEmoji}><Clock size={16} /></span> Schedule
          </h4>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Frequency:</span>
              <span className={styles.summaryItemValue} style={{ textTransform: 'capitalize' }}>
                {state.frequency}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Term:</span>
              <span className={styles.summaryItemValue}>
                {state.termDays} days
              </span>
            </div>
          </div>
        </div>

        {/* Interest Details */}
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryCardTitle}>
            <span className={styles.summaryCardTitleEmoji}><BarChart3 size={16} /></span> Interest
          </h4>
          <div className={styles.summaryItems}>
            {state.loanType === 'fixed' ? (
              <>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>Total Payable:</span>
                  <span className={styles.summaryItemValue}>
                    ₱{formatCurrency(Number(state.totalPayable))}
                  </span>
                </div>
                {preview && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryItemLabel}>Fixed Int:</span>
                    <span className={styles.summaryItemValue}>
                      ₱{formatCurrency(preview.interest)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>Rate:</span>
                  <span className={styles.summaryItemValue}>
                    {state.interestRate}%
                  </span>
                </div>
                {preview && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryItemLabel}>Calc Int:</span>
                    <span className={styles.summaryItemValue}>
                      ₱{formatCurrency(preview.interest)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryCardTitle}>
            <span className={styles.summaryCardTitleEmoji}><Calendar size={16} /></span> Start Date
          </h4>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemValue} style={{ fontWeight: 600 }}>
                {formatDate(state.startDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary - Full Width */}
        {preview && (
          <div className={styles.fullWidthCard}>
            <SummaryCard
              title="Payment Summary"
              icon={<Check size={16} />}
              items={[
                {
                  label: 'Principal:',
                  value: `₱${formatCurrency(preview.principal)}`
                },
                {
                  label: 'Total Interest:',
                  value: `₱${formatCurrency(preview.interest)}`
                },
                {
                  label: 'Total to Repay:',
                  value: `₱${formatCurrency(preview.totalPayable)}`,
                  isTotal: true
                },
                {
                  label: `Payment per ${state.frequency}:`,
                  value: `₱${formatCurrency(preview.paymentAmount)}`
                }
              ]}
            />
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        ℹ️ After submission, a repayment schedule will be generated for you to confirm.
      </div>
    </div>
  )
}
