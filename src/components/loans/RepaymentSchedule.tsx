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
<<<<<<< HEAD
  onBack,
}: RepaymentScheduleProps) => {
  const { schedule, previewFromLoan, saveSchedule, loading, error, saved } =
    useRepaymentSchedule();
  const { borrowers } = useBorrowers();
=======
}: RepaymentScheduleProps) => {
  const { schedule, previewFromLoan, loading, error } = useRepaymentSchedule()
  const { borrowers } = useBorrowers()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)

  const borrower = useMemo(
    () => borrowers.find((b) => b.id === borrowerId),
    [borrowers, borrowerId],
  );

  useEffect(() => {
    if (loanId) {
      previewFromLoan(loanId);
    }
  }, [loanId, previewFromLoan]);

<<<<<<< HEAD
  const handleSave = async () => {
    if (!loanId || saved) return;
    const result = await saveSchedule(loanId);
    if (result) {
      // Wait for the "saved" message to show, then redirect
      setTimeout(() => {
        onScheduleSaved();
      }, 2000); // 2-second delay
    }
  };
=======
  useEffect(() => {
    setCurrentPage(1)
  }, [schedule])
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)

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
<<<<<<< HEAD
            {saved
              ? "This schedule has been automatically generated and saved."
              : "Review the generated payment schedule below before confirming."}
=======
            {loading
              ? 'Loading your repayment schedule...'
              : `Your loan and repayment schedule for ${borrower?.full_name ?? 'borrower'} have been saved. Review the schedule below.`}
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)
          </p>
        </div>

        {/* Borrower & Loan Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Borrower</span>
<<<<<<< HEAD
            <p className={styles.infoValue}>{borrower?.full_name || "N/A"}</p>
=======
            <p className={styles.infoValue}>{borrower?.full_name || 'N/A'}</p>
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)
          </div>
          <div className={styles.infoBlock} style={{ textAlign: "left" }}>
            <span className={styles.infoLabel}>Total Amount</span>
            <p className={`${styles.infoValue} ${styles.totalAmountValue}`}>
<<<<<<< HEAD
              ₱
              {totalAmount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
=======
              ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)
            </p>
            <p className={styles.infoSubvalue}>{schedule.length} payments</p>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorBox}>
<<<<<<< HEAD
                <h3 className={styles.errorTitle}>Error Fetching Schedule</h3>
=======
                <h3 className={styles.errorTitle}>Error Loading Schedule</h3>
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)
                <p className={styles.errorMessage}>{error}</p>
              </div>
            </div>
          )}

          {schedule.length > 0 && (
<<<<<<< HEAD
            <div className={styles.scheduleGrid}>
              <table className={styles.scheduleTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>#</th>
                    <th className={styles.tableHeaderCell}>Due Date</th>
                    <th
                      className={`${styles.tableHeaderCell} ${styles.tableHeaderCellRight}`}
                    >
                      Amount Due
                    </th>
                    <th
                      className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}
                    >
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
                        {new Date(entry.due_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td
                        className={`${styles.tableCell} ${styles.tableCellRight} ${styles.amountCell}`}
                      >
                        ₱
                        {entry.amount_due.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`${styles.tableCell} ${styles.tableCellCenter}`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`${styles.statusBadge} ${styles[entry.status.toLowerCase()]}`}
                          >
                            {entry.status}
                          </span>
                          {entry.is_penalty && (
                            <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter animate-pulse">
                              Penalty Fee
                            </span>
                          )}
                        </div>
                      </td>
=======
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
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)
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
<<<<<<< HEAD
          {saved ? (
            <div className="flex flex-col gap-4 w-full">
              <div className={styles.successMessage}>
                ✅ Schedule is active and saved!
              </div>
              <Button
                onClick={onScheduleSaved}
                variant="blue"
                size="lg"
                className="w-full"
              >
                Done & Go back
              </Button>
            </div>
          ) : (
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
                {loading ? "Confirming..." : "Confirm & Save"}
              </Button>
            </div>
          )}
=======
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
>>>>>>> 55b023a (feat: add pagination to borrower loans schedule and polish payment card styling)
        </div>
      </div>
    </div>
  );
};
