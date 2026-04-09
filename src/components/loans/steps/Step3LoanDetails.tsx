import React from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import type { PaymentFrequency } from '../../../types/loans'
import { Lightbulb, Clipboard } from 'lucide-react'
import { isValidCurrency, isValidPositiveInteger, formatCurrency, formatDate } from '../../../lib/formatters'
import styles from './Step3LoanDetails.module.css'

/**
 * Step 3: Common Loan Details - Dashboard Layout Version
 * 
 * NEW LAYOUT (Desktop):
 * - Left column: Form inputs (principal, term, start date, frequency)
 * - Right column: Sticky summary preview card that updates in real-time
 * - Creates a spacious, modern dashboard-like experience
 * 
 * Mobile: Gracefully stacks to single column
 */
export const Step3LoanDetails: React.FC<WizardStepProps> = ({
  state,
  updateState,
  isLoading
}) => {
  const frequencyOptions: PaymentFrequency[] = [
    'daily',
    'weekly',
    'bi-monthly',
    'monthly'
  ]

  const handlePrincipalChange = (value: string) => {
    if (isValidCurrency(value)) {
      updateState('principal', value)
    }
  }

  const handleTermDaysChange = (value: string) => {
    if (isValidPositiveInteger(value)) {
      updateState('termDays', value)
    }
  }

  const handleStartDateChange = (value: string) => {
    updateState('startDate', value)
  }

  const handleFrequencyChange = (frequency: PaymentFrequency) => {
    updateState('frequency', frequency)
  }

  return (
    <div className={styles.stepContainer}>
      {/* Section Title - Spans full width */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Loan Details</h3>
        <p className={styles.sectionDescription}>
          Enter the principal amount, frequency, term, and start date.
        </p>
      </div>

      {/* Left Column: Form Inputs */}
      <div className={styles.inputGridWrapper}>
        <div className={styles.inputGrid}>
          {/* Principal Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Principal Amount (₱)</label>
            <input
              type="text"
              placeholder="e.g. 50,000"
              value={state.principal}
              onChange={e => handlePrincipalChange(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Enter the amount you wish to borrow
            </p>
          </div>

          {/* Loan Term (Days) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Loan Term (Days)</label>
            <input
              type="text"
              placeholder="e.g. 365"
              value={state.termDays}
              onChange={e => handleTermDaysChange(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Number of days before the loan is fully paid
            </p>
          </div>

          {/* Start Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date</label>
            <input
              type="date"
              value={state.startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>When the loan begins</p>
          </div>

          {/* Payment Frequency - Full Width */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Payment Frequency</label>
            <div className={styles.frequencyGrid}>
              {frequencyOptions.map(freq => (
                <button
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  disabled={isLoading}
                  className={`${styles.frequencyButton} ${
                    state.frequency === freq ? styles.active : ''
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box - Below form on all sizes */}
        <div className={styles.infoBox}>
          <Lightbulb size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Enter the principal amount and how often the borrower will make payments (daily, weekly, bi-monthly, or monthly). The start date is when the loan begins.
        </div>
      </div>

      {/* Right Column: Sticky Summary Card */}
      <div className={styles.summaryCardWrapper}>
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryTitle}><Clipboard size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Summary</h4>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Principal:</span>
            <span className={styles.summaryValue}>
              {state.principal ? formatCurrency(Number(state.principal)) : <span style={{ color: '#a0aec0' }}>—</span>}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Frequency:</span>
            <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>
              {state.frequency}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Term:</span>
            <span className={styles.summaryValue}>
              {state.termDays ? `${state.termDays} days` : '—'}
            </span>
          </div>
          {state.startDate && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Start Date:</span>
              <span className={styles.summaryValue}>
                {formatDate(state.startDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

