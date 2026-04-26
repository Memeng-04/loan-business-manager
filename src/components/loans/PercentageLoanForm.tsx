import { useState } from 'react'
import { useCreatePercentageLoan } from '../../hooks/useCreatePercentageLoan'
import { PercentageInterestStrategy } from '../../strategies/InterestStrategy'
import type { PaymentFrequency } from '../../types/loans'
import { sanitizeNumber } from '../../utils/numberUtils'

interface PercentageLoanFormProps {
  borrowerId: string
  onSuccess?: () => void
}

export const PercentageLoanForm = ({ borrowerId, onSuccess }: PercentageLoanFormProps) => {
  const { createLoan, loading, error, success } = useCreatePercentageLoan()

  const [form, setForm] = useState({
    principal:    '',
    interestRate: '',
    frequency:    'daily' as PaymentFrequency,
    termDays:     '30',
    startDate:    '',
    penaltyRate:  '5'
  })

  let preview = null;
  if (form.principal && form.interestRate) {
    const strategy = new PercentageInterestStrategy();
    preview = strategy.calculate(
      Number(form.principal),
      Number(form.termDays),
      form.frequency,
      form.startDate || new Date().toISOString(),
      Number(form.interestRate)
    );
  }

  const handleSubmit = async () => {
    if (!form.principal || !form.interestRate || !form.startDate) return

    const saved = await createLoan({
      borrower_id:   borrowerId,
      principal:     Number(form.principal),
      interest_rate: Number(form.interestRate),
      frequency:     form.frequency,
      term_days:     Number(form.termDays),
      start_date:    form.startDate,
      penalty_rate:  Number(form.penaltyRate)
    })

    if (saved && onSuccess) onSuccess()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#012a6a] px-6 py-5">
          <h2 className="text-white text-2xl font-bold">Create Loan</h2>
          <p className="text-[#6db6fe] text-sm mt-1">Percentage Interest</p>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* Principal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012a6a]">
              Principal Amount (₱)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 10,000"
              className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none transition"
              value={form.principal}
              onChange={e => setForm({ ...form, principal: sanitizeNumber(e.target.value) })}
            />
          </div>

          {/* Interest Rate */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012a6a]">
              Interest Rate (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 15"
              className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none transition"
              value={form.interestRate}
              onChange={e => setForm({ ...form, interestRate: sanitizeNumber(e.target.value) })}
            />
          </div>

          {/* Auto calculated preview */}
          {preview && (
            <div className="bg-[#012a6a] rounded-xl p-4 flex flex-col gap-2">
              <p className="text-[#6db6fe] text-xs font-semibold uppercase tracking-wide">
                Loan Summary
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Interest Amount</span>
                <span className="text-white font-bold">
                  ₱{preview.interest.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Total Payable</span>
                <span className="text-white font-bold">
                  ₱{preview.totalPayable.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/20 pt-2 mt-1">
                <span className="text-[#6db6fe] font-semibold">Per Payment</span>
                <span className="text-[#6db6fe] font-bold">
                  ₱{preview.paymentAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Frequency */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012a6a]">
              Payment Frequency
            </label>
            <select
              className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none transition bg-white"
              value={form.frequency}
              onChange={e => setForm({ ...form, frequency: e.target.value as PaymentFrequency })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-monthly">Bi-Monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Term */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012a6a]">
              Duration (days)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 30"
              className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none transition"
              value={form.termDays}
              onChange={e => setForm({ ...form, termDays: sanitizeNumber(e.target.value, 10000) })}
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012a6a]">
              Start Date
            </label>
            <input
              type="date"
              className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none transition"
              value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          {/* Penalty Rate */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012a6a]">
              Penalty Rate (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 5"
              className="border border-gray-200 p-3 rounded-lg text-sm focus:outline-none transition"
              value={form.penaltyRate}
              onChange={e => setForm({ ...form, penaltyRate: sanitizeNumber(e.target.value, 100) })}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
               {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-lg">
               Loan created successfully!
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#112bd6] hover:bg-[#012a6a] text-white p-3 rounded-xl font-semibold transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating...' : 'Create Loan'}
          </button>

        </div>
      </div>
    </div>
  )
}
