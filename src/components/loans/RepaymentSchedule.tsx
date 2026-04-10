import { useEffect, useMemo } from 'react'
import { useRepaymentSchedule } from '../../hooks/useRepaymentSchedule'
import LoadingState from '../LoadingState'
import type { ScheduleEntry } from '../../strategies/ScheduleStrategy'
import { useBorrowers } from '../../hooks/useBorrowers'
import Button from '../Button'
import styles from './RepaymentSchedule.module.css'

interface RepaymentScheduleProps {
  loanId: string
  borrowerId: string
  onScheduleSaved: () => void
  onBack?: () => void
}

export const RepaymentSchedule = ({
  loanId,
  borrowerId,
  onScheduleSaved,
  onBack
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
    <div className={styles.scheduleContainer}>
      <div className={styles.scheduleWrapper}>
        {/* Loading State Overlay */}
        {loading && schedule.length === 0 && !error && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState message="Loading Schedule Preview..." />
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Repayment Schedule</h2>
          <p className={styles.headerSubtitle}>
            Review the generated payment schedule below before confirming.
          </p>
        </div>

        {/* Borrower & Loan Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Borrower</span>
            <p className={styles.infoValue}>
              {borrower?.full_name || 'N/A'}
            </p>
            <p className={styles.infoSubvalue}>ID: {borrowerId}</p>
          </div>
          <div className={styles.infoBlock} style={{ textAlign: 'left' }}>
            <span className={styles.infoLabel}>Total Amount</span>
            <p className={`${styles.infoValue} ${styles.totalAmountValue}`}>
              ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <p className={styles.infoSubvalue}>
              {schedule.length} payments
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* Error State */}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorBox}>
                <h3 className={styles.errorTitle}>
                  ❌ Error Fetching Schedule
                </h3>
                <p className={styles.errorMessage}>{error}</p>
              </div>
            </div>
          )}

          {/* Schedule Table */}
          {schedule.length > 0 && (
            <div className={styles.scheduleGrid}>
              <table className={styles.scheduleTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>#</th>
                    <th className={styles.tableHeaderCell}>Due Date</th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellRight}`}>
                      Amount Due
                    </th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((entry: ScheduleEntry, index: number) => (
                    <tr key={index} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.indexCell}`}>
                        {index + 1}
                      </td>
                      <td className={`${styles.tableCell} ${styles.dateCell}`}>
                        {new Date(entry.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellRight} ${styles.amountCell}`}>
                        ₱
                        {entry.amount_due.toLocaleString('en-PH', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.statusBadge} ${styles[entry.status.toLowerCase()]}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!error && schedule.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <p>Loading schedule or no payments found</p>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className={styles.footerContainer}>
          {saved && (
            <div className={styles.successMessage}>
              ✅ Schedule saved successfully!
            </div>
          )}

          {!saved && schedule.length > 0 && (
            <div className={styles.buttonGroup}>
              {onBack && (
                <Button
                  onClick={onBack}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={loading}
                variant="blue"
                size="lg"
                className="flex-1"
              >
                {loading ? 'Confirming...' : 'Confirm'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
