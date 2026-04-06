import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/header/Header";
import LoadingState from "../components/LoadingState";
import Navbar from "../components/navigation/Navbar";
import { BorrowerRepository } from "../repositories/BorrowerRepository";
import { LoanRepository } from "../repositories/LoanRepository";
import type { Borrower } from "../types/borrowers";
import type { Loan } from "../types/loans";
import styles from "./styles/BorrowerDetailsPage.module.css";

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

export default function BorrowerDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);

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
              <div>
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

            <div className={styles.detailsGrid}>
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

              <Card as="section" className={styles.panel}>
                <h3 className={styles.panelTitle}>Loan history</h3>

                {loanError ? (
                  <p className={styles.errorText}>{loanError}</p>
                ) : null}

                {!loanError && loans.length === 0 ? (
                  <p className={styles.emptyState}>No loans recorded yet.</p>
                ) : null}

                {!loanError && loans.length > 0 ? (
                  <ul className={styles.historyList}>
                    {loans.map((loan) => (
                      <li key={loan.id} className={styles.historyItem}>
                        <div>
                          <p className={styles.historyTitle}>
                            {loan.principal.toLocaleString()} total loan
                          </p>
                          <p className={styles.historyMeta}>
                            {loan.frequency} payment plan · {loan.status}
                          </p>
                        </div>

                        <div className={styles.historyMetaBlock}>
                          <span>Started {formatDate(loan.start_date)}</span>
                          <span>Ends {formatDate(loan.end_date)}</span>
                          <span>
                            Payable {loan.total_payable.toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            </div>
          </section>
        </main>
      ) : null}
    </div>
  );
}
