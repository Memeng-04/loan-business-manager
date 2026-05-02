import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, CreditCard, Trash2, Plus } from "lucide-react";
import Header from "../../components/ui/header/Header";
import Navbar from "../../components/ui/navigation/Navbar";
import Card from "../../components/ui/card/Card";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import { LoanRepository } from "../../repositories/LoanRepository";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";
import { useBorrowers } from "../../hooks/useBorrowers";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { StandardScheduleStrategy } from "../../strategies/ScheduleStrategy";
import type { PaymentFrequency } from "../../types/loans";
import type { Loan } from "../../types/loans";
import type { ScheduleEntry } from "../../types/strategies";
import { sanitizeNumber } from "../../utils/numberUtils";
import styles from "./LoanPage.module.css";
import BorrowerProfileCard from "../../components/borrowers/BorrowerDetails/BorrowerProfileCard";

export default function BorrowerLoansPage() {
  const { borrowerId } = useParams<{ borrowerId: string }>();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const { borrowers, loading: borrowersLoading } = useBorrowers();
  const borrower = borrowers.find((b) => b.id === borrowerId);

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"loans" | "schedules">("loans");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // States for Schedule Management
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ROWS_PER_PAGE = 10;

  const fetchLoans = useCallback(async () => {
    if (!borrower) return;
    setLoading(true);
    try {
      const data = await LoanRepository.getByBorrowerId(borrower.id!);
      setLoans(data);
      if (data.length > 0) setSelectedLoan(data[0]);
    } catch {
      console.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  }, [borrower]);

  const fetchSchedules = useCallback(async () => {
    if (!selectedLoan?.id) return;
    setSchedulesLoading(true);
    setSchedules([]);
    try {
      const data = await ScheduleRepository.getByLoanId(selectedLoan.id);
      setSchedules(data);
    } catch {
      console.error("Failed to fetch schedules");
    } finally {
      setSchedulesLoading(false);
    }
  }, [selectedLoan]);

  useEffect(() => {
    if (borrower) {
      fetchLoans();
      setActiveTab("loans");
      setSelectedLoan(null);
    }
  }, [borrower, fetchLoans]);

  useEffect(() => {
    if (selectedLoan && activeTab === "schedules") {
      setCurrentPage(1);
      fetchSchedules();
    }
  }, [selectedLoan, activeTab, fetchSchedules]);

  // Reset to page 1 when schedules change
  useEffect(() => {
    setCurrentPage(1);
  }, [schedules]);

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Delete this schedule entry?")) return;
    try {
      await ScheduleRepository.deleteById(id);
      fetchSchedules();
    } catch {
      alert("Failed to delete");
    }
  };

  const handleFixSchedule = async () => {
    if (!selectedLoan) return;
    setSchedulesLoading(true);
    try {
      const start = new Date(selectedLoan.start_date);
      const end = new Date(selectedLoan.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const strategy = new StandardScheduleStrategy();
      const generated = strategy.generate(
        selectedLoan.start_date,
        selectedLoan.total_payable,
        selectedLoan.frequency as PaymentFrequency,
        diffDays,
      );

      const schedulesForDb = generated.map((entry) => ({
        ...entry,
        loan_id: selectedLoan.id,
      }));

      await ScheduleRepository.saveSchedule(schedulesForDb);
      fetchSchedules();
    } catch (e) {
      console.error(e);
      alert("Failed to regenerate schedule");
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newAmount || !selectedLoan) return;
    setAddLoading(true);
    try {
      await ScheduleRepository.saveSchedule([
        {
          loan_id: selectedLoan.id,
          due_date: newDate,
          amount_due: Math.round(parseFloat(newAmount) * 100) / 100,
          status: "unpaid",
        },
      ]);
      setNewDate("");
      setNewAmount("");
      fetchSchedules();
    } catch {
      alert("Failed to add");
    } finally {
      setAddLoading(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(schedules.length / ROWS_PER_PAGE);
  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return schedules.slice(start, start + ROWS_PER_PAGE);
  }, [schedules, currentPage]);

  if (borrowersLoading || !borrower) {
    return (
      <main className={styles.page}>
        <Header
          title="Loading..."
          onMenuClick={() => setIsNavOpen((prev) => !prev)}
        />
        <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <section className={styles.content}>
          <LoadingState message="Loading borrower details..." />
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header
        title="Loan Details"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        {/* Top bar: BorrowerProfileCard */}
        <div className="mb-2">
          <BorrowerProfileCard
            name={borrower.full_name}
            onViewProfile={() => navigate(`/borrowers/${borrowerId}`)}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-3">
          <div className="flex w-full gap-2 rounded-2xl bg-gray-50 p-1 shadow-sm ring-1 ring-gray-100">
            <button
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                activeTab === "loans"
                  ? "bg-main-blue text-white"
                  : "text-gray-500 hover:bg-white hover:text-main-blue"
              }`}
              onClick={() => setActiveTab("loans")}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={16} />
                Loans Overview
              </div>
            </button>
            <button
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                activeTab === "schedules"
                  ? "bg-main-blue text-white"
                  : "text-gray-500 hover:bg-white hover:text-main-blue"
              }`}
              onClick={() => setActiveTab("schedules")}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={16} />
                Edit Timeline
              </div>
            </button>
          </div>

          <div />
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {loading ? (
            <LoadingState message="Fetching account portfolio..." />
          ) : (
            <>
              {/* Tab 1: Loans Overview */}
              {activeTab === "loans" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                    Account Portfolio
                  </h3>
                  {loans.length === 0 ? (
                    <Card
                      padding="lg"
                      variant="subtle"
                      className="border-dashed border-2 bg-gray-50/30 text-center py-20 flex flex-col items-center gap-4"
                    >
                      <p className="text-gray-400 text-sm italic">
                        No active loans found.
                      </p>
                    </Card>
                  ) : (
                    loans.map((loan) => (
                      <Card
                        key={loan.id}
                        interactive
                        padding="md"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setActiveTab("schedules");
                        }}
                        className={`group border-2 transition-all ${
                          selectedLoan?.id === loan.id
                            ? "border-main-blue bg-blue-50/50 ring-1 ring-main-blue"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="block text-xl font-black text-main-blue">
                              {formatCurrency(loan.principal)}
                            </span>
                            <span className="text-xs text-blue-600/60 font-bold uppercase tracking-tighter">
                              Principal Amount
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              loan.status === "active"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : loan.status === "completed"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100/60 flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span>
                            {loan.frequency} payments of{" "}
                            {formatCurrency(loan.payment_amount)}
                          </span>
                          <span className="text-main-blue group-hover:translate-x-1 transition-transform">
                            View Details →
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Edit Timeline */}
              {activeTab === "schedules" && (
                <div className="space-y-6">
                  {selectedLoan ? (
                    <>
                      <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                            Currently Editing
                          </span>
                          <span className="text-xs font-black text-main-blue">
                            {formatDate(selectedLoan.start_date)} - Term
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          {formatCurrency(selectedLoan.principal)} Loan
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Schedule timeline
                          </h4>
                          <span className="text-[10px] text-gray-400 italic">
                            {schedules.length > ROWS_PER_PAGE
                              ? `${ROWS_PER_PAGE} rows per page`
                              : `${schedules.length} entries`}
                          </span>
                        </div>

                        {schedulesLoading ? (
                          <LoadingState
                            variant="compact"
                            message="Updating timeline..."
                            className="py-8"
                          />
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                            <table className="min-w-180 text-sm w-full">
                              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                  <th className="px-4 py-3 font-black text-left">
                                    Date
                                  </th>
                                  <th className="px-4 py-3 font-black text-left">
                                    Due
                                  </th>
                                  <th className="px-4 py-3 font-black text-left">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-right font-black">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {paginatedSchedules.map((sch) => (
                                  <tr
                                    key={sch.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="px-4 py-3 font-medium text-gray-600 text-left">
                                      {formatDate(sch.due_date)}
                                    </td>
                                    <td className="px-4 py-3 font-black text-main-blue text-left">
                                      {formatCurrency(sch.amount_due)}
                                    </td>
                                    <td className="px-4 py-3 text-left">
                                      <div className="flex flex-col gap-1">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase w-fit ${
                                            sch.status === "paid"
                                              ? "text-green-600 bg-green-50"
                                              : sch.status === "missed"
                                                ? "text-red-600 bg-red-50"
                                                : sch.status === "partial"
                                                  ? "text-orange-600 bg-orange-50"
                                                  : "text-blue-600 bg-blue-50"
                                          }`}
                                        >
                                          {sch.status}
                                        </span>
                                        {sch.is_penalty && (
                                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white w-fit animate-pulse">
                                            Penalty Fee
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() =>
                                          sch.id && handleDeleteSchedule(sch.id)
                                        }
                                        className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ml-auto"
                                        disabled={!sch.id}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {schedules.length === 0 && (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="text-center py-12 text-gray-400 italic text-xs"
                                    >
                                      <div className="flex flex-col items-center gap-3">
                                        <p>No entries found for this loan.</p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleFixSchedule}
                                          className="text-[10px] font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                          Fix Missing Schedule
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Pagination Controls (show only when more than 1 page) */}
                        {totalPages > 1 && (
                          <div className="flex flex-col items-stretch justify-center gap-3 py-4 border-t border-gray-100 mt-4 sm:flex-row sm:items-center sm:gap-4">
                            <Button
                              variant="outline"
                              size="md"
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="w-full text-xs sm:w-auto"
                            >
                              ← Prev
                            </Button>
                            <span className="text-center text-xs font-medium text-gray-600 sm:text-left">
                              Page {currentPage} of {totalPages}
                              <span className="text-gray-400">
                                &nbsp;({schedules.length} total)
                              </span>
                            </span>
                            <Button
                              variant="outline"
                              size="md"
                              onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                              }
                              disabled={currentPage === totalPages}
                              className="w-full text-xs sm:w-auto"
                            >
                              Next →
                            </Button>
                          </div>
                        )}

                        {/* Add Tool */}
                        <form
                          onSubmit={handleAddSchedule}
                          className="bg-white p-4 rounded-2xl shadow-xl space-y-3 ring-1 ring-gray-200 border border-gray-100"
                        >
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            <Plus size={12} className="text-blue-500" />
                            Manually Append Entry
                          </label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="date"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="w-full flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-xs p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="Amount PHP"
                              value={newAmount}
                              onChange={(e) =>
                                setNewAmount(sanitizeNumber(e.target.value))
                              }
                              className="w-full flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-xs p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="blue"
                            size="md"
                            className="mt-2 w-full"
                            disabled={addLoading}
                          >
                            {addLoading ? "Appending..." : "Add Schedule Row"}
                          </Button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <Card
                      padding="lg"
                      className="text-center py-12 text-gray-400 italic"
                    >
                      Select a loan to manage its schedule
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
