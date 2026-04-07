import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../../components/Button";
import Card from "../../../components/card/Card";
import Header from "../../../components/header/Header";
import LoadingState from "../../../components/LoadingState";
import Navbar from "../../../components/navigation/Navbar";
import { BorrowerRepository } from "../../../repositories/BorrowerRepository";
import { LoanRepository } from "../../../repositories/LoanRepository";
import type { Borrower } from "../../../types/borrowers";
import type { Loan } from "../../../types/loans";
import styles from "./BorrowerDetailsPage.module.css";

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BorrowerDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);

  const activeLoanCount = loans.filter(
    (loan) => loan.status === "active",
  ).length;
  const completedLoanCount = loans.filter(
    (loan) => loan.status === "completed",
  ).length;
  const defaultedLoanCount = loans.filter(
    (loan) => loan.status === "defaulted",
  ).length;
  const latestLoan = loans[0] ?? null;

  const borrowerInitials = borrower
    ? borrower.full_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "B"
    : "B";

  useEffect(() => {
    let isMounted = true;

    async function loadBorrowerDetails() {
      if (!id) {
        setError("Missing borrower id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setLoanError(null);

      try {
        const borrowerData = await BorrowerRepository.getById(id);

        if (!isMounted) {
          return;
        }

        if (!borrowerData) {
          setBorrower(null);
          setLoans([]);
          setError("Borrower not found.");
          return;
        }

        setBorrower(borrowerData);

        try {
          const loanData = await LoanRepository.getByBorrowerId(id);

          if (isMounted) {
            setLoans(loanData);
          }
        } catch (loanErr) {
          if (isMounted) {
            setLoans([]);
            setLoanError(
              loanErr instanceof Error
                ? loanErr.message
                : "Failed to load loan history.",
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load borrower.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBorrowerDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className={styles.page}>
      <Header
        title="Borrower Details"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {loading ? (
        <main className={styles.content}>
          <section className={styles.loadingContainer}>
            <LoadingState
              message="Loading borrower details..."
              fullScreen={false}
            />
          </section>
        </main>
      ) : null}

      {!loading && error ? (
        <main className={styles.content}>
          <section className={styles.container}>
            <Card className={styles.errorPanel}>
              <p className={styles.errorText}>{error}</p>
              <Button
                variant="outline"
                size="md"
                className={`mt-0! ${styles.backButton}`}
                onClick={() => navigate("/borrowers")}
              >
                <ArrowLeft size={16} />
                Back to borrowers
              </Button>
            </Card>
          </section>
        </main>
      ) : null}

      {!loading && !error && borrower ? (
        <main className={styles.content}>
          <section className={styles.container}>
            <Card className={styles.hero}>
              <div className={styles.heroText}>
                <p className={styles.eyebrow}>Borrower profile</p>
                <h2 className={styles.title}>{borrower.full_name}</h2>
                <p className={styles.subtitle}>
                  {borrower.business_name
                    ? borrower.business_name
                    : "No business name saved."}
                </p>
              </div>

              <Button
                variant="outline"
                size="md"
                className={`mt-0! ${styles.backButton}`}
                onClick={() => navigate("/borrowers")}
              >
                <ArrowLeft size={16} />
                Back to borrowers
              </Button>
            </Card>

            <Card as="section" padding="none" className={styles.snapshotPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>Loan snapshot</p>
                  <h3 className={styles.panelTitle}>Account activity</h3>
                </div>

                <p className={styles.snapshotMeta}>
                  {loans.length > 0
                    ? `${loans.length} loan${loans.length === 1 ? "" : "s"} on record`
                    : "No loans yet"}
                </p>
              </div>

              {loanError ? (
                <p className={styles.noticeError}>{loanError}</p>
              ) : null}

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Total loans</span>
                  <strong className={styles.metricValue}>{loans.length}</strong>
                </div>

                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Active</span>
                  <strong className={styles.metricValue}>
                    {activeLoanCount}
                  </strong>
                </div>

                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Completed</span>
                  <strong className={styles.metricValue}>
                    {completedLoanCount}
                  </strong>
                </div>

                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Defaulted</span>
                  <strong className={styles.metricValue}>
                    {defaultedLoanCount}
                  </strong>
                </div>
              </div>

              {latestLoan ? (
                <div className={styles.latestLoan}>
                  <div>
                    <p className={styles.latestLoanLabel}>Latest loan</p>
                    <p className={styles.latestLoanValue}>
                      {formatCurrency(latestLoan.principal)}
                    </p>
                  </div>

                  <div className={styles.latestLoanMeta}>
                    <span>{latestLoan.status}</span>
                    <span>{formatDate(latestLoan.created_at)}</span>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card as="section" className={styles.panel}>
              <h3 className={styles.panelTitle}>Borrower info</h3>

              <dl className={styles.detailList}>
                <div className={styles.detailItem}>
                  <dt className={styles.label}>ID</dt>
                  <dd className={styles.value}>{borrower.id ?? "—"}</dd>
                </div>

                <div className={styles.detailItem}>
                  <dt className={styles.label}>Business</dt>
                  <dd className={styles.value}>
                    {borrower.business_name ?? "Not provided"}
                  </dd>
                </div>

                <div className={styles.detailItem}>
                  <dt className={styles.label}>Address</dt>
                  <dd className={styles.value}>
                    {borrower.address ?? "Not provided"}
                  </dd>
                </div>

                <div className={styles.detailItem}>
                  <dt className={styles.label}>Phone</dt>
                  <dd className={styles.value}>
                    {borrower.phone ?? "Not provided"}
                  </dd>
                </div>

                <div className={styles.detailItem}>
                  <dt className={styles.label}>Notes</dt>
                  <dd className={styles.value}>
                    {borrower.notes ?? "No notes saved yet."}
                  </dd>
                </div>

                <div className={styles.detailItem}>
                  <dt className={styles.label}>Created</dt>
                  <dd className={styles.value}>
                    {formatDate(borrower.created_at)}
                  </dd>
                </div>
              </dl>
            </Card>
          </section>
        </main>
      ) : null}
    </div>
  );
}
