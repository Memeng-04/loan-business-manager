import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BalanceCard from "../../components/home/BalanceCard";
import DueCard from "../../components/home/DueCard";
import RevenueCard from "../../components/home/RevenueCard";
import FeedbackMessage from "../../components/ui/feedback/FeedbackMessage";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import {
  DashboardRepository,
  type DashboardBorrower,
  type DashboardLoan,
  type DashboardSchedule,
} from "../../repositories/DashboardRepository";

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type RevenueChartDatum = {
  name: string;
  value: number;
};

type Payment = {
  id?: string;
  amount_paid?: number;
  interest_portion?: number;
  [key: string]: unknown;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, isLoading: profileIsLoading } = useCurrentUserProfile();
  const [loans, setLoans] = useState<DashboardLoan[]>([]);
  const [borrowers, setBorrowers] = useState<DashboardBorrower[]>([]);
  const [dueSchedules, setDueSchedules] = useState<DashboardSchedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dashboardIsLoading, setDashboardIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setDashboardIsLoading(true);
      setError(null);

      try {
        const today = getTodayDateKey();
        const [loanRows, borrowerRows, scheduleRows, paymentRows] =
          await Promise.all([
            DashboardRepository.getLoans(),
            DashboardRepository.getBorrowers(),
            DashboardRepository.getDueSchedulesForDate(today),
            DashboardRepository.getAllPayments(),
          ]);

        if (isMounted) {
          setLoans(loanRows);
          setBorrowers(borrowerRows);
          setDueSchedules(scheduleRows);
          setPayments(paymentRows);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) {
          setDashboardIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const borrowerNameById = useMemo(() => {
    return new Map(borrowers.map((item) => [item.id, item.full_name]));
  }, [borrowers]);

  const loanById = useMemo(() => {
    return new Map(loans.map((loan) => [loan.id, loan]));
  }, [loans]);

  const totalPrincipalLent = useMemo(() => {
    return loans.reduce((sum, loan) => sum + loan.principal, 0);
  }, [loans]);

  const totalPaymentsReceived = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  }, [payments]);

  const totalInterestEarned = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.interest_portion || 0), 0);
  }, [payments]);

  const startingFundBase =
    (profile?.initial_capital ?? 0) + (profile?.initial_profit ?? 0);

  const outstandingFundBalance =
    startingFundBase - totalPrincipalLent + totalPaymentsReceived;

  const revenueByFrequency = useMemo(() => {
    const groups = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      "bi-monthly": 0,
    };

    for (const loan of loans) {
      groups[loan.frequency] += loan.interest;
    }

    return groups;
  }, [loans]);

  const revenueChartData: RevenueChartDatum[] = [
    { name: "Daily", value: revenueByFrequency.daily },
    { name: "Weekly", value: revenueByFrequency.weekly },
    { name: "Monthly", value: revenueByFrequency.monthly },
    { name: "Bi-Monthly", value: revenueByFrequency["bi-monthly"] },
  ];

  const totalRevenue = revenueChartData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const dueTodayItems = dueSchedules
    .map((schedule) => {
      const loan = loanById.get(schedule.loan_id);
      if (!loan) {
        return null;
      }

      return {
        borrowerName:
          borrowerNameById.get(loan.borrower_id) ?? "Unknown borrower",
        amountDue: schedule.amount_due,
      };
    })
    .filter((item): item is { borrowerName: string; amountDue: number } =>
      Boolean(item),
    );

  return (
    <div className="flex-1 px-8 pb-12 pt-4 bg-[#F9F9F8]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Hi, {profile?.display_name ?? "there"}!
          </h2>
          <p className="text-gray-500 font-medium">Here is your lending summary today.</p>
        </motion.div>

        {error ? (
          <div className="mb-8">
            <FeedbackMessage message={error} />
          </div>
        ) : null}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Balance Card - Wide on medium screens */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 h-full">
            <BalanceCard
              outstandingBalance={outstandingFundBalance}
              initialCapital={profile?.initial_capital ?? 0}
              initialProfit={
                (profile?.initial_profit ?? 0) + totalInterestEarned
              }
              isLoading={profileIsLoading || dashboardIsLoading}
              onManageFunds={() => navigate("/funds")}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <DueCard
              items={dueTodayItems}
              isLoading={profileIsLoading || dashboardIsLoading}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3 h-full">
            <RevenueCard
              data={revenueChartData}
              totalRevenue={totalRevenue}
              isLoading={profileIsLoading || dashboardIsLoading}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
