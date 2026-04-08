import { useEffect, useMemo } from 'react'
import { useRepaymentSchedule } from '../../hooks/useRepaymentSchedule'
import LoadingState from '../LoadingState'
import type { ScheduleEntry } from '../../strategies/ScheduleStrategy'
import { useBorrowers } from '../../hooks/useBorrowers'
import Card from '../card/Card'
import Button from '../Button'

interface RepaymentScheduleProps {
  loanId: string
  borrowerId: string
  onScheduleSaved: () => void
}

export const RepaymentSchedule = ({
  loanId,
  borrowerId,
  onScheduleSaved
}: RepaymentScheduleProps) => {
  const { schedule, previewFromLoan, saveSchedule, loading, error, saved } =
    useRepaymentSchedule()
  const { borrowers } = useBorrowers()

  const borrower = useMemo(
    () => borrowers.find(b => b.id === borrowerId),
    [borrowers, borrowerId]
  )

  useEffect(() => {
    if (loanId) {
      previewFromLoan(loanId)
    }
  }, [loanId, previewFromLoan])

  const handleSave = async () => {
    if (!loanId || saved) return
    const result = await saveSchedule(loanId)
    if (result) {
      // Wait for the "saved" message to show, then redirect
      setTimeout(() => {
        onScheduleSaved()
      }, 2000) // 2-second delay
    }
  }

  const totalAmount = useMemo(
    () => schedule.reduce((acc, entry) => acc + entry.amount_due, 0),
    [schedule]
  )

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-2xl h-auto max-h-[95vh] flex flex-col overflow-hidden">
        {/* Loading State Overlay */}
        {loading && schedule.length === 0 && !error && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState message="Loading Schedule Preview..." />
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-gray-800 text-3xl font-bold">
            Repayment Schedule
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Review the generated payment schedule below before confirming.
          </p>
        </div>

        {/* Borrower & Loan Info */}
        <div className="px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50">
          <div>
            <h3 className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
              Borrower
            </h3>
            <p className="text-lg font-bold text-[#012a6a] mt-1">
              {borrower?.full_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">ID: {borrowerId}</p>
          </div>
          <div className="text-left md:text-right">
            <h3 className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
              Total Amount
            </h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">
              {schedule.length} payments
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8">
          {/* Error State */}
          {error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-lg mb-2">
                  <span role="img" aria-label="error">
                    ❌
                  </span>{' '}
                  Error Fetching Schedule
                </h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Schedule Table */}
          {schedule.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden my-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-600">#</th>
                    <th className="p-4 text-left font-semibold text-gray-600">
                      Due Date
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-600">
                      Amount Due
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((entry: ScheduleEntry, index: number) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-500 font-medium">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-800">
                        {new Date(entry.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right font-bold text-lg text-[#012a6a]">
                        ₱
                        {entry.amount_due.toLocaleString('en-PH', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="px-8 pb-8 pt-6 border-t border-gray-200 bg-white flex-shrink-0">
          {saved && (
            <div className="bg-green-100 border-2 border-green-300 text-green-800 p-4 rounded-xl text-center font-semibold shadow-inner">
              <span role="img" aria-label="check">
                ✅
              </span>{' '}
              Schedule saved successfully!
            </div>
          )}

          {!saved && schedule.length > 0 && (
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="blue"
              size="lg"
              className="w-full"
            >
              {loading ? 'Confirming...' : 'Confirm and Save Schedule'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
