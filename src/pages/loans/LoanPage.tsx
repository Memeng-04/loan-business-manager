import { useState, useEffect, useMemo } from "react";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import styles from "./LoanPage.module.css";
import Card from "../../components/card/Card";
import ScheduleList from "../../components/loans/ScheduleList";
import BorrowerList from "../../components/loans/BorrowerList";
import PaymentActionModal from "../../components/loans/PaymentActionModal";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";
import { useBorrowers } from "../../hooks/useBorrowers";
import { formatCurrency } from "../../lib/formatters";

export default function LoanPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'borrowers'>('schedules');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

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

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
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
            <Card padding="sm" className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-md border-b">
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
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

                <input 
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateFilter('custom');
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:border-main-blue focus:ring-4 focus:ring-main-blue/5 transition-all font-bold text-main-blue"
                />
            </Card>

            <ScheduleList 
              schedules={schedules} 
              loading={schedulesLoading} 
              onScheduleClick={(s) => setSelectedSchedule(s)} 
            />

            {/* Total collections overview logic could be injected here */}
            {schedules.length > 0 && !schedulesLoading && (
              <div className="text-right text-gray-600 font-medium text-sm mt-4">
                Total Due for selection: {formatCurrency(schedules.filter(s => s.status !== 'paid').reduce((a, b) => a + Number(b.amount_due), 0))}
              </div>
            )}
          </div>
        )}

        {/* Borrowers View */}
        {activeTab === 'borrowers' && (
          <BorrowerList borrowers={borrowers} loading={borrowersLoading} />
        )}

        {/* Payment Modal */}
        {selectedSchedule && (
          <PaymentActionModal
            loanId={selectedSchedule.loan_id}
            scheduleId={selectedSchedule.id}
            defaultAmountDue={selectedSchedule.amount_due}
            onClose={() => setSelectedSchedule(null)}
            onSuccess={() => {
              setSelectedSchedule(null);
              loadSchedules(); // Refresh the list
            }}
          />
        )}
      </section>
    </main>
  );
}
