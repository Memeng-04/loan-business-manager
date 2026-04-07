import { useEffect } from 'react'
import { useRepaymentSchedule } from '../../hooks/useRepaymentSchedule'

interface RepaymentScheduleProps {
  loanId:     string
  borrowerId: string
}

export const RepaymentSchedule = ({ loanId, borrowerId }: RepaymentScheduleProps) => {
  const { schedule, previewFromLoan, saveSchedule, loading, error, saved } =
    useRepaymentSchedule()

  useEffect(() => {
    if (loanId) previewFromLoan(loanId)
  }, [loanId])

  const handleSave = async () => {
    if (!loanId) return
    await saveSchedule(loanId)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#012a6a] px-6 py-5">
          <h2 className="text-white text-2xl font-bold">Repayment Schedule</h2>
          <p className="text-[#6db6fe] text-sm mt-1">
            Borrower ID: {borrowerId}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-500 text-sm">
              Loading schedule...
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Schedule Table */}
          {schedule.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-[#012a6a]">
                  {schedule.length} payments
                </p>
                <p className="text-sm text-gray-500">
                  ₱{schedule[0].amount_due.toFixed(2)} per payment
                </p>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#012a6a] text-white">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Due Date</th>
                      <th className="p-3 text-right">Amount Due</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="p-3 text-gray-500">{index + 1}</td>
                        <td className="p-3 font-medium">{entry.due_date}</td>
                        <td className="p-3 text-right font-bold text-[#012a6a]">
                          ₱{entry.amount_due.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Success */}
              {saved && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-lg">
                  ✅ Schedule saved successfully!
                </div>
              )}

              {/* Save Button */}
              {!saved && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#112bd6] hover:bg-[#012a6a] text-white p-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Schedule'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}