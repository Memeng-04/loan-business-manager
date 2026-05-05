import { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import PaymentActionModal from "../../features/loans/management/PaymentActionModal";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";
import { useBorrowers } from "../../hooks/useBorrowers";
import { formatCurrency } from "../../lib/formatters";
import type { AppLayoutContext } from "../../components/layout/AppLayout";
import type { DashboardScheduleWithLoan } from "../../repositories/ScheduleRepository";

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
};

export default function LoanPage() {
  const { searchQuery } = useOutletContext<AppLayoutContext>();
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "custom">("month");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

  const [schedules, setSchedules] = useState<DashboardScheduleWithLoan[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DashboardScheduleWithLoan | null>(null);

  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    let end = new Date(today);

    if (dateFilter === "custom") {
      start = new Date(customDate);
      end = new Date(customDate);
    } else if (dateFilter === "week") {
      end.setDate(end.getDate() + 7);
    } else if (dateFilter === "month") {
      end.setMonth(end.getMonth() + 1);
      start.setMonth(start.getMonth() - 1); // Get recent past to see late/paid ones
    }

    try {
      return { 
        startDate: start.toISOString().split("T")[0], 
        endDate: end.toISOString().split("T")[0] 
      };
    } catch (e) {
      const now = new Date().toISOString().split("T")[0];
      return { startDate: now, endDate: now };
    }
  }, [dateFilter, customDate]);

  const loadSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    try {
      const data = await ScheduleRepository.getDashboardSchedules(dateRange.startDate, dateRange.endDate);
      setSchedules(data);
    } catch {
      console.error("Error fetching schedules");
    } finally {
      setSchedulesLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesFreq = frequencyFilter === "all" || s.loan?.frequency?.toLowerCase() === frequencyFilter.toLowerCase();
      if (!matchesFreq) return false;

      if (!searchQuery?.trim()) return true;
      const query = searchQuery.toLowerCase();
      const borrower = s.loan?.borrower;

      return (
        borrower?.full_name?.toLowerCase().includes(query) ||
        borrower?.phone?.toLowerCase().includes(query) ||
        s.loan_id?.toLowerCase().includes(query)
      );
    });
  }, [schedules, frequencyFilter, searchQuery]);

  // Grouping into Kanban Columns
  const columnsData: Record<string, DashboardScheduleWithLoan[]> = {
    pending: [],
    active: [],
    delinquent: [],
    paid: []
  };

  const todayStr = new Date().toISOString().split("T")[0];

  filteredSchedules.forEach(s => {
    const status = s.status?.toLowerCase();
    if (status === 'paid') {
      columnsData.paid.push(s);
    } else if (status === 'late' || (s.due_date && s.due_date < todayStr && status !== 'paid')) {
      columnsData.delinquent.push(s);
    } else if (s.due_date === todayStr) {
      columnsData.active.push(s);
    } else {
      columnsData.pending.push(s);
    }
  });

  const columns = [
    { id: 'pending', title: 'Upcoming', items: columnsData.pending },
    { id: 'active', title: 'Due Today', items: columnsData.active },
    { id: 'delinquent', title: 'Delinquent', items: columnsData.delinquent },
    { id: 'paid', title: 'Paid', items: columnsData.paid },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8]">
      {/* Filters Area */}
      <div className="px-8 pt-4 pb-2 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["today", "week", "month"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${dateFilter === filter ? "bg-[#012a6a] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer bg-gray-50 border border-gray-200 text-gray-600 focus:outline-none focus:border-[#012a6a]"
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
            >
              <option value="all">All Freq</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-monthly">Bi-Monthly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter("custom");
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#012a6a] font-bold text-[#012a6a] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 pt-2">
        {schedulesLoading ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-medium">Loading schedules...</div>
        ) : (
          <div className="flex gap-6 h-full min-w-max">
            {columns.map(col => (
              <div key={col.id} className="w-[320px] flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="font-semibold text-[1.05rem] text-gray-900">{col.title}</h2>
                  <div className="flex items-center gap-1 border border-gray-200 bg-white px-2 py-0.5 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
                    <span>{col.items.length}</span>
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 pb-4 flex flex-col gap-4 scrollbar-thin">
                  {col.items.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl h-24 flex items-center justify-center text-sm text-gray-400 font-medium">
                      Empty
                    </div>
                  ) : (
                    col.items.map(schedule => (
                      <motion.div 
                        key={schedule.id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden group"
                        onClick={() => setSelectedSchedule(schedule)}
                      >
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          col.id === 'delinquent' ? 'bg-red-500' : 
                          col.id === 'paid' ? 'bg-green-500' : 
                          col.id === 'active' ? 'bg-[#012a6a]' : 'bg-blue-300'
                        }`} />
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">
                            {schedule.loan?.borrower?.full_name || "Unknown Borrower"}
                          </h3>
                          <span className="font-bold text-[#012a6a] text-sm shrink-0">
                            {formatCurrency(Number(schedule.amount_due) || 0)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-3">Due: {new Date(schedule.due_date).toLocaleDateString()}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            col.id === 'delinquent' ? 'bg-red-50 text-red-700' : 
                            col.id === 'paid' ? 'bg-green-50 text-green-700' : 
                            col.id === 'active' ? 'bg-blue-50 text-[#012a6a]' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {col.title}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">#{schedule.loan_id.slice(0,6)}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSchedule && (
        <PaymentActionModal
          loanId={selectedSchedule.loan_id}
          scheduleId={selectedSchedule.id}
          defaultAmountDue={Number(selectedSchedule.amount_due) || 0}
          onClose={() => setSelectedSchedule(null)}
          onSuccess={() => {
            setSelectedSchedule(null);
            loadSchedules();
          }}
        />
      )}
    </div>
  );
}
