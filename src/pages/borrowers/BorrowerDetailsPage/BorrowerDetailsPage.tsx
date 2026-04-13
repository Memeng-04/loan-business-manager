import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/header/Header";
import LoadingState from "../../../components/LoadingState";
import Navbar from "../../../components/navigation/Navbar";
import { BorrowerRepository } from "../../../repositories/BorrowerRepository";
import { LoanRepository } from "../../../repositories/LoanRepository";
import type { Borrower } from "../../../types/borrowers";
import type { Loan } from "../../../types/loans";
import BorrowerInformationCard from "../../../components/borrowers/BorrowerDetails/BorrowerInformationCard";
import BorrowerProfileCard from "../../../components/borrowers/BorrowerDetails/BorrowerProfileCard";
import LoanSummaryCard from "../../../components/borrowers/BorrowerDetails/LoanSummaryCard";
import styles from "./BorrowerDetailsPage.module.css";
import { useUpdateBorrower } from "../../../hooks/useUpdateBorrower";
import type { CreateBorrowerInput } from "../../../types/borrowers";

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
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
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
  const { updateBorrower, updating, error: updateError } = useUpdateBorrower();

  const activeLoanCount = loans.filter(
    (loan) => loan.status === "active",
  ).length;
  const doneLoanCount = loans.filter(
    (loan) => loan.status === "completed",
  ).length;
  const latestLoan = loans[0] ?? null;
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
  const totalPayable = loans.reduce((sum, loan) => sum + loan.total_payable, 0);
  const averageLoanAmount =
    loans.length > 0 ? totalPrincipal / loans.length : 0;

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

  async function handleSaveBorrower(
    input: CreateBorrowerInput,
  ): Promise<boolean> {
    if (!id) {
      return false;
    }

    const updated = await updateBorrower(id, input);

    if (updated) {
      setBorrower(updated);
      return true;
    }

    return false;
  }

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
            <LoadingState
              variant="error"
              message={error}
              fullScreen={false}
              actionLabel="Back to borrowers"
              onAction={() => navigate("/borrowers")}
            />
          </section>
        </main>
      ) : null}

      {!loading && !error && borrower ? (
        <main className={styles.content}>
          <section className={styles.container}>
            <BorrowerProfileCard
              name={borrower.full_name}
              onBack={() => navigate("/borrowers")}
            />

            <div className={styles.detailsGrid}>
              <BorrowerInformationCard
                borrower={borrower}
                createdDate={formatDate(borrower.created_at)}
                onSave={handleSaveBorrower}
                saving={updating}
                saveError={updateError}
              />

              <LoanSummaryCard
                loanError={loanError}
                totalLoans={loans.length}
                activeLoans={activeLoanCount}
                doneLoans={doneLoanCount}
                totalPrincipal={formatCurrency(totalPrincipal)}
                totalPayable={formatCurrency(totalPayable)}
                averageLoanAmount={formatCurrency(averageLoanAmount)}
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
