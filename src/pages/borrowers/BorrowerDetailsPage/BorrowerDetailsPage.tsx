import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LoadingState from "../../../components/ui/LoadingState";

import { BorrowerRepository } from "../../../repositories/BorrowerRepository";
import { LoanRepository } from "../../../repositories/LoanRepository";
import type { Borrower } from "../../../types/borrowers";
import type { Loan } from "../../../types/loans";
import BorrowerInformationCard from "../../../components/borrowers/BorrowerDetails/BorrowerInformationCard";
import BorrowerProfileCard from "../../../components/borrowers/BorrowerDetails/BorrowerProfileCard";
import LoanSummaryCard from "../../../components/borrowers/BorrowerDetails/LoanSummaryCard";

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
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8] overflow-y-auto">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingState
            message="Loading borrower details..."
            fullScreen={false}
          />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingState
            variant="error"
            message={error}
            fullScreen={false}
            actionLabel="Back to borrowers"
            onAction={() => navigate("/borrowers")}
          />
        </div>
      ) : null}

      {!loading && !error && borrower ? (
        <div className="max-w-5xl mx-auto p-8 w-full">
          <BorrowerProfileCard name={borrower.full_name} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
              onSeeLoans={() => navigate(`/loans/borrowers/${borrower.id}`)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
