import { useState, useEffect, useMemo } from "react";
import Header from "../../components/ui/header/Header";
import Navbar from "../../components/ui/navigation/Navbar";
import styles from "./LoanPage.module.css";
import ScheduleList from "../../features/loans/management/ScheduleList";
import BorrowerList from "../../features/loans/management/BorrowerList";
import PaymentActionModal from "../../features/loans/management/PaymentActionModal";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";
import { useBorrowers } from "../../hooks/useBorrowers";
import { formatCurrency } from "../../lib/formatters";
import SearchBar from "../../components/ui/search/SearchBar";

export default function LoanPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'borrowers'>('schedules');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');


  const { borrowers, loading: borrowersLoading } = useBorrowers();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  // Calculate Date Ranges based on filter
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let start = new Date(today);
    let end = new Date(today);

    if (dateFilter === 'custom') {
      start = new Date(customDate);
      end = new Date(customDate);
    } else if (dateFilter === 'week') {
      end.setDate(end.getDate() + 7);
    } else if (dateFilter === 'month') {
      end.setMonth(end.getMonth() + 1);
    }

    try {
      const startISO = start.toISOString().split('T')[0];
      const endISO = end.toISOString().split('T')[0];
      return { startDate: startISO, endDate: endISO };
    } catch (e) {
      console.error('Invalid date generated:', e);
      const now = new Date().toISOString().split('T')[0];
      return { startDate: now, endDate: now };
    }
  }, [dateFilter, customDate]);

  const loadSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const data = await ScheduleRepository.getDashboardSchedules(dateRange.startDate, dateRange.endDate);
      setSchedules(data);
    } catch (e) {
      console.error('Error fetching schedules:', e);
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedules') {
      loadSchedules();
    }
  }, [dateRange, activeTab]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      // 1. Frequency Filter
      const matchesFreq = frequencyFilter === 'all' || 
        s.loan?.frequency?.toLowerCase() === frequencyFilter.toLowerCase();
      
      if (!matchesFreq) return false;

      // 2. Search Filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const borrower = s.loan?.borrower;
      
      return (
        borrower?.full_name?.toLowerCase().includes(query) ||
        borrower?.phone?.toLowerCase().includes(query) ||
        s.loan_id?.toLowerCase().includes(query)
      );
    });
  }, [schedules, frequencyFilter, searchQuery]);


  return (
    <main className={styles.page}>
      <Header title="Loans Dashboard" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        
        {/* Top Toggle */}
        <div className="flex gap-2 bg-white p-1 rounded-full shadow-sm mb-6 max-w-sm mx-auto">
          <button 
            className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-colors ${activeTab === 'schedules' ? 'bg-main-blue text-white' : 'text-gray-500 hover:text-main-blue'}`}
            onClick={() => setActiveTab('schedules')}
          >
            Schedules
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-colors ${activeTab === 'borrowers' ? 'bg-main-blue text-white' : 'text-gray-500 hover:text-main-blue'}`}
            onClick={() => setActiveTab('borrowers')}
          >
            Borrowers
          </button>
        </div>

        {/* Schedules View */}
        {activeTab === 'schedules' && (
          <div className="flex flex-col gap-6">
            {/* Unified Filter Bar */}
            <div className={styles.filterCard}>
              <div className="p-4 flex flex-col lg:flex-row items-center gap-4">
                {/* Search - Growing to fill space */}
                <div className="w-full lg:flex-1">
                  <SearchBar 
                    value={searchQuery} 
                    onChange={setSearchQuery} 
                    placeholder="Search borrower or loan ID..."
                    className="!shadow-none"
                  />
                </div>

                {/* Filters - Right aligned on desktop */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {['today', 'week', 'month'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${dateFilter === filter ? 'bg-blue-100 text-main-blue border-blue-200 border' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <select 
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all cursor-pointer focus:outline-none ${
                      frequencyFilter !== 'all' 
                        ? 'bg-blue-100 text-main-blue border-blue-200 border' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-transparent border'
                    }`}
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
                      setDateFilter('custom');
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs bg-white shadow-sm focus:outline-none focus:border-main-blue focus:ring-4 focus:ring-main-blue/5 transition-all font-bold text-main-blue grow sm:grow-0"
                  />
                </div>
              </div>
            </div>

            <ScheduleList 
              schedules={filteredSchedules} 
              loading={schedulesLoading}
              onScheduleClick={(schedule) => setSelectedSchedule(schedule)}
            />

            {/* Total collections overview logic could be injected here */}
            {filteredSchedules.length > 0 && !schedulesLoading && (
              <div className="text-right text-gray-600 font-medium text-sm mt-4">
                Total Due for selection: {formatCurrency(
                  filteredSchedules
                    .filter(s => s.status !== 'paid')
                    .reduce((acc, curr) => acc + (Number(curr.amount_due) || 0), 0)
                )}
              </div>
            )}
          </div>
        )}

        {/* Borrowers View */}
        {activeTab === 'borrowers' && (
          <BorrowerList borrowers={borrowers} loading={borrowersLoading} />
        )}
      </section>

      {/* Payment Action Modal */}
      {selectedSchedule && (
        <PaymentActionModal
          loanId={selectedSchedule.loan_id}
          scheduleId={selectedSchedule.id}
          defaultAmountDue={selectedSchedule.amount_due}
          onClose={() => setSelectedSchedule(null)}
          onSuccess={() => {
            setSelectedSchedule(null);
            loadSchedules(); // Force refresh dashboard data to reflect payment status
          }}
        />
      )}
    </main>
  );
}
