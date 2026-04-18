import React from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import type { PaymentFrequency } from '../../../types/loans'
import { Lightbulb, Clipboard } from 'lucide-react'
import { isValidCurrency, isValidPositiveInteger, formatCurrency, formatDate } from '../../../lib/formatters'
import { SummaryCard } from '../SummaryCard'
import { InfoBox } from '../InfoBox'
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
    // Limit to 15 characters max - truncate if exceeds
    const truncated = value.slice(0, 15)
    if (isValidCurrency(truncated)) {
      updateState('principal', truncated)
    }
  }

  const handleTermDaysChange = (value: string) => {
    // Limit to 5 characters max - truncate if exceeds
    const truncated = value.slice(0, 5)
    if (isValidPositiveInteger(truncated)) {
      updateState('termDays', truncated)
    }
  }

  const handleStartDateChange = (value: string) => {
    updateState('startDate', value)
  }

  // Calculate today's date for 'min' attribute
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]

  const handleFrequencyChange = (frequency: PaymentFrequency) => {
    updateState('frequency', frequency)
  }

  return (
    <div className={styles.stepContainer}>
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
              maxLength={15}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Enter the amount you wish to borrow (max 15 digits)
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
              maxLength={5}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Number of days before the loan is fully paid (max 5 digits)
            </p>
          </div>

          {/* Start Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date</label>
            <input
              type="date"
              value={state.startDate}
              min={minDate}
              onChange={e => handleStartDateChange(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>First payment date (tomorrow or later)</p>
          </div>

          {/* Payment Frequency - Dropdown Select */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Payment Frequency</label>
            <select
              value={state.frequency}
              onChange={e => handleFrequencyChange(e.target.value as PaymentFrequency)}
              disabled={isLoading}
              className={styles.select}
            >
              <option value="">Select a frequency...</option>
              {frequencyOptions.map(freq => (
                <option key={freq} value={freq}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Box - Below form on all sizes */}
        <InfoBox icon={<Lightbulb size={16} />}>
          Enter the principal amount and how often the borrower will make payments (daily, weekly, bi-monthly, or monthly). The start date is when the loan begins.
        </InfoBox>
      </div>

      {/* Right Column: Sticky Summary Card */}
      <div className={styles.summaryCardWrapper}>
        <SummaryCard
          title="Summary"
          icon={<Clipboard size={18} />}
          items={[
            {
              label: 'Principal:',
              value: state.principal ? formatCurrency(Number(state.principal)) : '—'
            },
            {
              label: 'Frequency:',
              value: state.frequency.charAt(0).toUpperCase() + state.frequency.slice(1)
            },
            {
              label: 'Term:',
              value: state.termDays ? `${state.termDays} days` : '—'
            },
            ...(state.startDate ? [{ label: 'Start Date:', value: formatDate(state.startDate) }] : [])
          ]}
        />
      </div>
    </div>
  )
}

