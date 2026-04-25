import { useEffect, useMemo, useState } from 'react'
import { useRepaymentSchedule } from '../../hooks/useRepaymentSchedule'
import type { ScheduleEntry } from '../../types/strategies'
import { useBorrowers } from '../../hooks/useBorrowers'
import { useNavigate } from 'react-router-dom'
import Button from '../Button'
import styles from './RepaymentSchedule.module.css'

interface RepaymentScheduleProps {
  loanId: string;
  borrowerId: string;
  onScheduleSaved: () => void;
  onBack?: () => void;
}

const ROWS_PER_PAGE = 10

export const RepaymentSchedule = ({
  loanId,
  borrowerId,
  onScheduleSaved,
}: RepaymentScheduleProps) => {
  const { schedule, previewFromLoan, loading, error } = useRepaymentSchedule()
  const { borrowers } = useBorrowers()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const borrower = useMemo(
    () => borrowers.find((b) => b.id === borrowerId),
    [borrowers, borrowerId],
  );

  useEffect(() => {
    if (loanId) {
      previewFromLoan(loanId);
    }
  }, [loanId, previewFromLoan]);

  useEffect(() => {
    setCurrentPage(1)
  }, [schedule])

  const totalAmount = useMemo(
    () => schedule.reduce((acc, entry) => acc + entry.amount_due, 0),
    [schedule],
  );

  const totalPages = Math.ceil(schedule.length / ROWS_PER_PAGE)
  const paginatedSchedule = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE
    return schedule.slice(start, start + ROWS_PER_PAGE)
  }, [schedule, currentPage])

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.scheduleWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Loan Created Successfully!</h2>
          <p className={styles.headerSubtitle}>
            {loading
              ? 'Loading your repayment schedule...'
              : `Your loan and repayment schedule for ${borrower?.full_name ?? 'borrower'} have been saved. Review the schedule below.`}
          </p>
        </div>

        {/* Borrower & Loan Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Borrower</span>
            <p className={styles.infoValue}>{borrower?.full_name || 'N/A'}</p>
          </div>
          <div className={styles.infoBlock} style={{ textAlign: "left" }}>
            <span className={styles.infoLabel}>Total Amount</span>
            <p className={`${styles.infoValue} ${styles.totalAmountValue}`}>
              ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <p className={styles.infoSubvalue}>{schedule.length} payments</p>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorBox}>
                <h3 className={styles.errorTitle}>Error Loading Schedule</h3>
                <p className={styles.errorMessage}>{error}</p>
              </div>
            </div>
          )}

          {schedule.length > 0 && (
            <>
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
                    {paginatedSchedule.map((entry: ScheduleEntry, index: number) => {
                      const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index
                      return (
                        <tr key={globalIndex} className={styles.tableRow}>
                          <td className={`${styles.tableCell} ${styles.indexCell}`}>
                            {globalIndex + 1}
                          </td>
                          <td className={`${styles.tableCell} ${styles.dateCell}`}>
                            {new Date(entry.due_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className={`${styles.tableCell} ${styles.tableCellRight} ${styles.amountCell}`}>
                            ₱{entry.amount_due.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                            <div className="flex flex-col items-center gap-1">
                              <span className={`${styles.statusBadge} ${styles[entry.status.toLowerCase()]}`}>
                                {entry.status}
                              </span>
                              {entry.is_penalty && (
                                <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter animate-pulse">
                                  Penalty Fee
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className={styles.paginationControls}>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </Button>
                  <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                    <span className={styles.pageTotal}>&nbsp;({schedule.length} total)</span>
                  </span>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}

          {!error && schedule.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <p>No schedule found for this loan.</p>
            </div>
          )}
        </div>

        {/* Footer — single Done action, no "Back" since loan is already saved */}
        <div className={styles.footerContainer}>
          <div className={styles.buttonGroup}>
            <Button
              onClick={() => navigate('/loans')}
              variant="outline"
              size="lg"
            >
              View All Loans
            </Button>
            <Button
              onClick={onScheduleSaved}
              variant="blue"
              size="lg"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
