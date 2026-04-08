import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../../components/card/Card";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CHART_COLORS = ["#012A6A", "#1F3CA8", "#6DB6FE", "#93C5FD"];

type RevenueChartDatum = {
  name: string;
  value: number;
};

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { profile } = useCurrentUserProfile();
  const [loans, setLoans] = useState<DashboardLoan[]>([]);
  const [borrowers, setBorrowers] = useState<DashboardBorrower[]>([]);
  const [dueSchedules, setDueSchedules] = useState<DashboardSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
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
      } finally {
        if (isMounted) {
          setIsLoading(false);
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
          <p className={styles.subtitle}>
            Here is your lending snapshot today.
          </p>
        </div>

        {error ? <FeedbackMessage message={error} /> : null}

        <div className={styles.grid}>
          <Card className={styles.balanceCard} variant="default" padding="lg">
            <p className={styles.cardLabel}>Outstanding Fund Balance</p>
            <h3 className={styles.balanceValue}>
              {formatCurrency(outstandingFundBalance)}
            </h3>

            <div className={styles.balanceMeta}>
              <span>
                Capital: {formatCurrency(profile?.initial_capital ?? 0)}
              </span>
              <span>
                Earned Profit: {formatCurrency(profile?.initial_profit ?? 0)}
              </span>
              <span>
                Active Lent Out: {formatCurrency(totalActivePrincipal)}
              </span>
            </div>
          </Card>

          <Card className={styles.revenueCard} variant="subtle" padding="lg">
            <div className={styles.cardHeaderRow}>
              <p className={styles.cardLabel}>Revenue Report by Frequency</p>
              <strong className={styles.totalRevenueLabel}>
                Total: {formatCurrency(totalRevenue)}
              </strong>
            </div>

            {isLoading ? (
              <p className={styles.emptyText}>Loading revenue data...</p>
            ) : totalRevenue <= 0 ? (
              <p className={styles.emptyText}>No loan revenue yet.</p>
            ) : (
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={revenueChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={2}
                    >
                      {revenueChartData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => {
                        const numeric = typeof value === "number" ? value : 0;
                        return formatCurrency(numeric);
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <ul className={styles.legendList}>
              {revenueChartData.map((item, index) => (
                <li key={item.name} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  <span>{item.name}</span>
                  <strong>{formatCurrency(item.value)}</strong>
                </li>
              ))}
            </ul>
          </Card>

          <Card className={styles.dueCard} variant="default" padding="lg">
            <p className={styles.cardLabel}>Due Today List</p>

            {isLoading ? (
              <p className={styles.emptyText}>Loading dues...</p>
            ) : dueTodayItems.length === 0 ? (
              <p className={styles.emptyText}>No repayments due today.</p>
            ) : (
              <ul className={styles.dueList}>
                {dueTodayItems.map((item, index) => (
                  <li
                    key={`${item.borrowerName}-${index}`}
                    className={styles.dueRow}
                  >
                    <span className={styles.borrowerName}>
                      {item.borrowerName}
                    </span>
                    <strong>{formatCurrency(item.amountDue)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
