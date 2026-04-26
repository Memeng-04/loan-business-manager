import React from 'react'
import type { WizardStepProps } from '../../../../types/wizardTypes'
import type { PaymentFrequency } from '../../../../types/loans'
import { Lightbulb, Clipboard } from 'lucide-react'
import { isValidPositiveInteger, formatCurrency, formatDate } from '../../../../lib/formatters'
import { SummaryCard } from '../../SummaryCard'
import { InfoBox } from '../../InfoBox'
import { sanitizeNumber } from '../../../../utils/numberUtils'
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
    const sanitized = sanitizeNumber(value)
    updateState('principal', sanitized)
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

  // Calculate TOMORROW's date (as requested: "cant enter current date")
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleFrequencyChange = (frequency: PaymentFrequency) => {
    updateState('frequency', frequency)
    // Clear term whenever frequency changes to prevent accidental errors (e.g. 30 days -> 30 months)
    updateState('termDays', '')
  }

  // Determine dynamic label and placeholder for term
  const termConfig = {
    daily: { label: 'Loan Term (Days)', placeholder: 'e.g. 30' },
    weekly: { label: 'Loan Term (Weeks)', placeholder: 'e.g. 4' },
    'bi-monthly': { label: 'Loan Term (Payouts)', placeholder: 'e.g. 2' },
    monthly: { label: 'Loan Term (Months)', placeholder: 'e.g. 1' }
  }[state.frequency || 'daily']

  return (
    <div className={styles.stepContainer}>
      {/* Left Column: Form Inputs */}
      <div className={styles.inputGridWrapper}>
        <div className={styles.inputGrid}>
          {/* 1. Principal Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Principal Amount (₱)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50000"
              value={state.principal}
              onChange={e => handlePrincipalChange(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Enter the amount to be borrowed
            </p>
          </div>

          {/* 2. Payment Frequency - NOW HIGHER */}
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
            <p className={styles.inputHelper}>Determines the cycle and term units</p>
          </div>

          {/* 3. Loan Term - NOW DYNAMIC */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{termConfig.label}</label>
            <input
              type="text"
              placeholder={termConfig.placeholder}
              value={state.termDays}
              onChange={e => handleTermDaysChange(e.target.value)}
              maxLength={5}
              disabled={isLoading || !state.frequency}
              className={styles.input}
            />
            <p className={styles.inputHelper}>
              Duration of the loan in {state.frequency === 'bi-monthly' ? 'payouts' : state.frequency || 'units'}
            </p>
          </div>

          {/* 4. Start Date - RESTRICTED TO TOMORROW+ */}
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
        </div>

        {/* Info Box */}
        <InfoBox icon={<Lightbulb size={16} />}>
          Choose your frequency first, then specify the term. We'll automatically calculate the schedule based on these units.
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
              value: state.frequency ? state.frequency.charAt(0).toUpperCase() + state.frequency.slice(1) : '—'
            },
            {
              label: 'Term:',
              value: state.termDays 
                ? `${state.termDays} ${
                    state.frequency === 'daily' ? 'days' : 
                    state.frequency === 'weekly' ? 'weeks' : 
                    state.frequency === 'bi-monthly' ? 'payouts' : 
                    state.frequency === 'monthly' ? 'months' : 'units'
                  }`
                : '—'
            },
            ...(state.startDate ? [{ label: 'Start Date:', value: formatDate(state.startDate) }] : [])
          ]}
        />
      </div>
    </div>
  )
}


