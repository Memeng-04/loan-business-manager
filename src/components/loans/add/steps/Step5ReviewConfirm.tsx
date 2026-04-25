import React, { useMemo } from 'react'
import type { WizardStepProps } from '../../../../types/wizardTypes'
import {
  FixedInterestStrategy,
  PercentageInterestStrategy
} from '../../../strategies/InterestStrategy'
import { useBorrowers } from '../../../hooks/useBorrowers'
import { Clipboard, BarChart3, Check, User, DollarSign, Clock, Calendar, Info } from 'lucide-react'
import { SummaryCard } from '../../SummaryCard'
import { InfoBox } from '../../InfoBox'
import FeedbackMessage from '../../../feedback/FeedbackMessage'
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
    const termUnitValue = Number(state.termDays)
    let totalDays = termUnitValue

    // Convert units to days based on frequency for strategy calculation
    switch (state.frequency) {
      case 'weekly':     totalDays = termUnitValue * 7; break;
      case 'bi-monthly': totalDays = termUnitValue * 15; break;
      case 'monthly':    totalDays = termUnitValue * 30; break;
      default:           totalDays = termUnitValue; // daily
    }

    if (state.loanType === 'fixed' && state.totalPayable) {
      const totalPayable = Number(state.totalPayable)

      const strategy = new FixedInterestStrategy();
      const result = strategy.calculate(
        principal,
        totalDays,
        state.frequency || 'monthly',
        new Date().toISOString(),
        totalPayable
      );

      return {
        principal,
        totalPayable: result.totalPayable,
        interest: result.interest,
        interestRate: result.interestRate,
        paymentAmount: result.paymentAmount,
        frequency: state.frequency,
        termDays: totalDays
      }
    } else if (state.loanType === 'percentage' && state.interestRate) {
      const interestRate = Number(state.interestRate)

      const strategy = new PercentageInterestStrategy();
      const result = strategy.calculate(
        principal,
        totalDays,
        state.frequency || 'monthly',
        new Date().toISOString(),
        interestRate
      );

      return {
        principal,
        totalPayable: result.totalPayable,
        interest: result.interest,
        interestRate: result.interestRate,
        paymentAmount: result.paymentAmount,
        frequency: state.frequency,
        termDays: totalDays
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
                {state.termDays} {
                  state.frequency === 'daily' ? 'days' : 
                  state.frequency === 'weekly' ? 'weeks' : 
                  state.frequency === 'bi-monthly' ? 'payouts' : 
                  state.frequency === 'monthly' ? 'months' : 'units'
                }
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

        {/* Payment per Due Date - Highlight Card */}
        {preview && (
          <div className={styles.paymentHighlightCard}>
            <div className={styles.paymentHighlightLabel}>
              Payment per {
                state.frequency === 'daily' ? 'day' :
                state.frequency === 'weekly' ? 'week' :
                state.frequency === 'bi-monthly' ? 'payout' :
                state.frequency === 'monthly' ? 'month' : 'installment'
              }
            </div>
            <div className={styles.paymentHighlightAmount}>₱{formatCurrency(preview.paymentAmount)}</div>
            <div className={styles.paymentHighlightSub}>due every {state.frequency} · {state.termDays} {state.frequency === 'daily' ? 'days' : state.frequency === 'weekly' ? 'weeks' : state.frequency === 'bi-monthly' ? 'payouts' : 'months'} total</div>
          </div>
        )}

        {/* Payment Summary - Full Width */}
        {preview && (
          <div className={styles.fullWidthCard}>
            <SummaryCard
              title="Loan Totals"
              icon={<Check size={16} />}
              items={[
                {
                  label: 'Principal Borrowed:',
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
                }
              ]}
            />
          </div>
        )}

      </div>{/* end summaryGrid */}

      {/* Info Box */}
      <InfoBox icon={<Info size={16} />}>
        Upon clicking submit, the loan will be recorded and a repayment schedule will be generated and saved automatically.
      </InfoBox>

      {/* Error State */}
      {error && (
        <FeedbackMessage message={error} variant="error" />
      )}
    </div>
  )
}
