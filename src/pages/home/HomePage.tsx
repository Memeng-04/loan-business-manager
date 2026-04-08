import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "../../components/home/BalanceCard";
import DueCard from "../../components/home/DueCard";
import RevenueCard from "../../components/home/RevenueCard";
import FeedbackMessage from "../../components/feedback/FeedbackMessage";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import {
  DashboardRepository,
  type DashboardBorrower,
  type DashboardLoan,
  type DashboardSchedule,
} from "../../repositories/DashboardRepository";
import styles from "./HomePage.module.css";

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

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();
  const [loans, setLoans] = useState<DashboardLoan[]>([]);
  const [borrowers, setBorrowers] = useState<DashboardBorrower[]>([]);
  const [dueSchedules, setDueSchedules] = useState<DashboardSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setError(null);

      try {
        const today = getTodayDateKey();
        const [loanRows, borrowerRows, scheduleRows] = await Promise.all([
          DashboardRepository.getLoans(),
          DashboardRepository.getBorrowers(),
          DashboardRepository.getDueSchedulesForDate(today),
        ]);

        if (isMounted) {
          setLoans(loanRows);
          setBorrowers(borrowerRows);
          setDueSchedules(scheduleRows);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data.",
          );
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

  const totalActivePrincipal = useMemo(() => {
    return loans
      .filter((loan) => loan.status === "active")
      .reduce((sum, loan) => sum + loan.principal, 0);
  }, [loans]);

  const startingFundBase =
    (profile?.initial_capital ?? 0) + (profile?.initial_profit ?? 0);
  const outstandingFundBalance = startingFundBase - totalActivePrincipal;

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
    <main className={styles.page}>
      <Header title="Home" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        <div className={styles.hero}>
          <h2 className={styles.greeting}>
            Hi, {profile?.display_name ?? "there"}!
          </h2>
          <p className={styles.subtitle}>Here is your lending summary today.</p>
        </div>

        {error ? <FeedbackMessage message={error} /> : null}

        <div className={styles.grid}>
          <div className={styles.balanceCard}>
            <BalanceCard
              outstandingBalance={outstandingFundBalance}
              initialCapital={profile?.initial_capital ?? 0}
              initialProfit={profile?.initial_profit ?? 0}
              onManageFunds={() => navigate("/funds")}
            />
          </div>

          <div className={styles.revenueCard}>
            <RevenueCard data={revenueChartData} totalRevenue={totalRevenue} />
          </div>

          <div className={styles.dueCard}>
            <DueCard items={dueTodayItems} />
          </div>
        </div>
      </section>
    </main>
  );
}
