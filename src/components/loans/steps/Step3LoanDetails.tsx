import React from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import type { PaymentFrequency } from '../../../types/loans'

/**
 * Step 3: Common Loan Details
 * User enters principal amount, selects payment frequency, term days, and start date.
 * These fields are common to both fixed and percentage interest loans.
 */
export const Step3LoanDetails: React.FC<WizardStepProps> = ({
  state,
  updateState,
  nextStep,
  prevStep,
  isLoading
}) => {
  const frequencyOptions: PaymentFrequency[] = [
    'daily',
    'weekly',
    'bi-monthly',
    'monthly'
  ]

  const handlePrincipalChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      updateState('principal', value)
    }
  }

  const handleTermDaysChange = (value: string) => {
    // Allow only positive integers
    if (value === '' || /^\d+$/.test(value)) {
      updateState('termDays', value)
    }
  }

  const handleStartDateChange = (value: string) => {
    updateState('startDate', value)
  }

  const handleFrequencyChange = (frequency: PaymentFrequency) => {
    updateState('frequency', frequency)
  }

  const canProceed =
    state.principal &&
    state.startDate &&
    state.termDays &&
    Number(state.principal) > 0 &&
    Number(state.termDays) > 0

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-bold text-[#012a6a] mb-2">
          Loan Details
        </h3>
        <p className="text-sm text-gray-600">
          Enter the principal amount, frequency, term, and start date.
        </p>
      </div>

      {/* Principal Amount */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#012a6a]">
          Principal Amount (₱)
        </label>
        <input
          type="text"
          placeholder="e.g. 50,000"
          value={state.principal}
          onChange={e => handlePrincipalChange(e.target.value)}
          disabled={isLoading}
          className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#112bd6] transition disabled:opacity-50 disabled:bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the amount you wish to borrow
        </p>
      </div>

      {/* Payment Frequency */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[#012a6a]">
          Payment Frequency
        </label>
        <div className="grid grid-cols-2 gap-2">
          {frequencyOptions.map(freq => (
            <button
              key={freq}
              onClick={() => handleFrequencyChange(freq)}
              disabled={isLoading}
              className={`p-2 rounded-2xl border-2 transition capitalize text-sm font-medium ${
                state.frequency === freq
                  ? 'border-[#112bd6] bg-blue-50 text-[#012a6a]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#112bd6]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* Term Days */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#012a6a]">
          Loan Term (Days)
        </label>
        <input
          type="text"
          placeholder="e.g. 365"
          value={state.termDays}
          onChange={e => handleTermDaysChange(e.target.value)}
          disabled={isLoading}
          className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#112bd6] transition disabled:opacity-50 disabled:bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Number of days before the loan is fully paid
        </p>
      </div>

      {/* Start Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#012a6a]">
          Start Date
        </label>
        <input
          type="date"
          value={state.startDate}
          onChange={e => handleStartDateChange(e.target.value)}
          disabled={isLoading}
          className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#112bd6] transition disabled:opacity-50 disabled:bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          When the loan begins
        </p>
      </div>

      {/* Summary Card */}
      {state.principal && state.termDays && (
        <div className="bg-blue-50 border border-[#6db6fe] rounded-2xl p-4">
          <h4 className="font-bold text-[#012a6a] mb-2">Summary</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium text-[#012a6a]">Principal:</span> ₱
              {Number(state.principal).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-[#012a6a]">Frequency:</span>{' '}
              <span className="capitalize">{state.frequency}</span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-[#012a6a]">Term:</span>{' '}
              {state.termDays} days
            </p>
            {state.startDate && (
              <p className="text-gray-600">
                <span className="font-medium text-[#012a6a]">Start Date:</span>{' '}
                {new Date(state.startDate).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-[#6db6fe] rounded-lg p-4">
        <p className="text-xs text-[#012a6a] font-medium">
          💡 These details apply to all loan types. You'll specify the interest
          structure in the next step.
        </p>
      </div>
    </div>
  )
}
