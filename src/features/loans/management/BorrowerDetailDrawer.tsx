import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, CreditCard, ChevronRight, Trash2, Plus, Info } from 'lucide-react';
import Card from '../../../components/ui/card/Card';
import Button from '../../../components/ui/Button';
import { LoanRepository } from '../../../repositories/LoanRepository';
import { ScheduleRepository } from '../../../repositories/ScheduleRepository';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import LoadingState from '../../../components/ui/LoadingState';
import { StandardScheduleStrategy } from '../../../strategies/ScheduleStrategy';
import type { Borrower } from '../../../types/borrowers';
import type { Loan } from '../../../types/loans';
import type { ScheduleEntry } from '../../../types/strategies';
import type { PaymentFrequency } from '../../../types/loans';
import { sanitizeNumber } from '../../../utils/numberUtils';

interface BorrowerDetailDrawerProps {
  borrower: Borrower | null;
  onClose: () => void;
}

type LoanWithRelations = Loan & {
  borrowers?: Pick<Borrower, 'id' | 'full_name' | 'phone'> | null;
};

export default function BorrowerDetailDrawer({
  borrower,
  onClose,
}: BorrowerDetailDrawerProps) {
  const [loans, setLoans] = useState<LoanWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"loans" | "schedules">("loans");
  const [selectedLoan, setSelectedLoan] = useState<LoanWithRelations | null>(null);

  // States for Schedule Management
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchLoans = useCallback(async () => {
    if (!borrower?.id) return;

    setLoading(true);
    try {
      const data = (await LoanRepository.getByBorrowerId(borrower.id)) as LoanWithRelations[];
      setLoans(data);
      if (data.length > 0) setSelectedLoan(data[0]);
    } catch {
      console.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  }, [borrower?.id]);

  const fetchSchedules = useCallback(async () => {
    if (!selectedLoan?.id) return;

    setSchedulesLoading(true);
    setSchedules([]); // Clear old state immediately
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
    if (borrower?.id) {
      fetchLoans();
      setActiveTab("loans");
      setSelectedLoan(null);
    }
  }, [borrower?.id, fetchLoans]);

  useEffect(() => {
    if (selectedLoan && activeTab === "schedules") {
      fetchSchedules();
    }
  }, [selectedLoan, activeTab, fetchSchedules]);

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
      // Calculate term days from start and end dates
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
    } catch {
      console.error("Failed to regenerate schedule");
      alert("Failed to regenerate schedule");
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleAddSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  if (!borrower) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col translate-x-0 overflow-hidden">
        {/* Header */}
        <header className="p-6 bg-main-blue text-white flex justify-between items-start shadow-lg ring-1 ring-white/10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {borrower.full_name}
            </h2>
            <p className="text-blue-100/80 text-sm mt-1 flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">
                BORROWER
              </span>
              {borrower.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === "loans" ? "border-main-blue text-main-blue bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("loans")}
          >
            <CreditCard size={18} />
            Loans Overview
          </button>
          <button
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === "schedules" ? "border-main-blue text-main-blue bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("schedules")}
          >
            <Calendar size={18} />
            Edit Timeline
          </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {loading ? (
            <LoadingState
              message="Fetching account portfolio..."
              className="h-64"
            />
          ) : (
            <>
              {/* Tab 1: Loans Overview */}
              {activeTab === "loans" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                    Account Portfolio
                  </h3>
                  {loans.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 text-sm italic">
                        No active loans found.
                      </p>
                    </div>
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
                        className={`group border-2 transition-all ${selectedLoan?.id === loan.id ? "border-main-blue bg-blue-50/50 ring-1 ring-main-blue" : "border-gray-100 hover:border-gray-200"}`}
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
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            loan.status === 'defaulted' ? 'bg-red-100 text-red-700 border border-red-200' : 
                            loan.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100/60 flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span>
                            {loan.frequency} payments of{" "}
                            {formatCurrency(loan.payment_amount)}
                          </span>
                          <span className="text-main-blue group-hover:translate-x-1 transition-transform">
                            Details{" "}
                            <ChevronRight size={14} className="inline" />
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Schedule Editor */}
              {activeTab === "schedules" && (
                <div className="space-y-6">
                  {selectedLoan ? (
                    <>
                      <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                        <div className="flex justify-between items-center">
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
                        <div className="flex justify-between items-end">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Schedule timeline
                          </h4>
                          <span className="text-[10px] text-gray-400 italic">
                            Scroll for more entries
                          </span>
                        </div>

                        {schedulesLoading ? (
                          <LoadingState
                            variant="compact"
                            message="Updating timeline..."
                            className="py-8"
                          />
                        ) : (
                          <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                  <th className="px-4 py-3 font-black">Date</th>
                                  <th className="px-4 py-3 font-black">Due</th>
                                  <th className="px-4 py-3 font-black">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-right">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {schedules.map((sch) => (
                                  <tr
                                    key={sch.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="px-4 py-3 font-medium text-gray-600">
                                      {formatDate(sch.due_date)}
                                    </td>
                                    <td className="px-4 py-3 font-black text-main-blue">
                                      {formatCurrency(sch.amount_due)}
                                    </td>
                                    <td className="px-4 py-3">
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
                                        onClick={() => {
                                          if (sch.id) {
                                            handleDeleteSchedule(sch.id);
                                          }
                                        }}
                                        className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

                        {/* Add Tool */}
                        <form
                          onSubmit={handleAddSchedule}
                          className="bg-gray-900 p-4 rounded-2xl shadow-xl space-y-3 ring-1 ring-white/10"
                        >
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Plus size={12} className="text-blue-400" />
                            Manually Append Entry
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="flex-1 bg-gray-800 border-0 text-white text-xs p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="Amount PHP"
                              value={newAmount}
                              onChange={(e) => setNewAmount(sanitizeNumber(e.target.value))}
                              className="flex-1 bg-gray-800 border-0 text-white text-xs p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="blue"
                            className="w-full mt-1! py-3! text-xs! font-black! uppercase tracking-widest rounded-xl! active:scale-[0.98] transition-all"
                            disabled={addLoading}
                          >
                            {addLoading ? "Appending..." : "Add Schedule Row"}
                          </Button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                      <div className="bg-blue-50 p-4 rounded-full">
                        <Info size={32} className="text-main-blue/40" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          No Loan Selected
                        </h4>
                        <p className="text-xs text-gray-500 max-w-50 mx-auto mt-1">
                          Select a loan from your account portfolio to manage
                          its timeline.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setActiveTab("loans")}
                        className="mt-2! text-xs! bg-white!"
                      >
                        View Portfolio
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <footer className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-main-blue">
            <Info size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              Admin Panel
            </p>
            <p className="text-xs text-gray-600 font-medium">
              Changes here bypass automatic lifecycle triggers.
            </p>
          </div>
        </footer>
      </aside>
    </>
  );
}
