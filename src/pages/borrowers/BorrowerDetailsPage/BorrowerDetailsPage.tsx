import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/Button";
import Card from "../../../components/card/Card";
import Header from "../../../components/header/Header";
import LoadingState from "../../../components/LoadingState";
import Navbar from "../../../components/navigation/Navbar";
import { BorrowerRepository } from "../../../repositories/BorrowerRepository";
import { LoanRepository } from "../../../repositories/LoanRepository";
import type { Borrower } from "../../../types/borrowers";
import type { Loan } from "../../../types/loans";
import BorrowerInformationCard from "./components/BorrowerInformationCard";
import BorrowerProfileCard from "./components/BorrowerProfileCard";
import LoanSummaryCard from "./components/LoanSummaryCard";
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
  const doneLoanCount = loans.filter(
    (loan) => loan.status === "completed",
  ).length;
  const latestLoan = loans[0] ?? null;

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
            <BorrowerProfileCard
              name={borrower.full_name}
              contact={
                borrower.email ??
                borrower.phone ??
                "No contact details saved."
              }
              onBack={() => navigate("/borrowers")}
            />

            <div className={styles.detailsGrid}>
              <BorrowerInformationCard
                borrower={borrower}
                createdDate={formatDate(borrower.created_at)}
              />

              <LoanSummaryCard
                loanError={loanError}
                totalLoans={loans.length}
                activeLoans={activeLoanCount}
                doneLoans={doneLoanCount}
                latestLoan={latestLoan}
                latestLoanAmount={
                  latestLoan ? formatCurrency(latestLoan.principal) : "—"
                }
                latestLoanCreatedAt={formatDate(latestLoan?.created_at)}
                onSeeLoans={() => navigate("/loans")}
              />
            </div>
          </section>
        </main>
      ) : null}
    </div>
  );
}
