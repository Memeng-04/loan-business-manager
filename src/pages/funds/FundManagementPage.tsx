import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "../../components/home/BalanceCard";
import Card from "../../components/card/Card";
import Button from "../../components/Button";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import FeedbackMessage from "../../components/feedback/FeedbackMessage";
import EditFundsModal, {
  type EditFundsFormData,
} from "../../components/funds/EditFundsModal";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import styles from "./FundManagementPage.module.css";

type Transaction = {
  id: string;
  date: string;
  type: "withdraw_capital" | "add_capital" | "withdraw_profit" | "add_profit";
  amount: number;
  balanceBefore: number;
};

export default function FundManagementPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();
  const [transactions] = useState<Transaction[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initialCapital = profile?.initial_capital ?? 0;
  const initialProfit = profile?.initial_profit ?? 0;
  const totalActivePrincipal = 0; // TODO: Calculate from loans
  const outstandingBalance =
    initialCapital + initialProfit - totalActivePrincipal;

  const handleEditFunds = (formData: EditFundsFormData) => {
    setError(null);
    setSuccess(null);

    const hasAnyInput = Object.values(formData).some(
      (val) => val.trim() !== "",
    );
    if (!hasAnyInput) {
      setError("Please enter a transaction amount.");
      return;
    }

    // TODO: Implement transaction logic
    setSuccess("Transaction recorded successfully.");
    setIsEditModalOpen(false);
  };

  return (
    <main className={styles.page}>
      <Header
        title="Fund Management"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        <div className={styles.backButtonWrapper}>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </Button>
        </div>

        {error ? <FeedbackMessage message={error} /> : null}
        {success ? <FeedbackMessage message={success} /> : null}

        <div className={styles.section}>
          <div className={styles.balanceCardWrapper}>
            <BalanceCard
              outstandingBalance={outstandingBalance}
              initialCapital={initialCapital}
              initialProfit={initialProfit}
              onManageFunds={() => setIsEditModalOpen(true)}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.transactionHeaderRow}>
            <h3 className={styles.sectionTitle}>Transaction History</h3>
            <Button
              variant="blue"
              size="md"
              onClick={() => navigate("/funds/add")}
            >
              Add Transaction
            </Button>
          </div>
          <Card>
            {transactions.length === 0 ? (
              <p className={styles.emptyText}>No transactions yet.</p>
            ) : (
              <div className={styles.transactionList}>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className={styles.transactionRow}>
                    <div className={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    <div className={styles.transactionType}>
                      {transaction.type.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className={styles.transactionAmount}>
                      ₦
                      {transaction.amount.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className={styles.transactionBalance}>
                      ₦
                      {transaction.balanceBefore.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      <EditFundsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditFunds}
      />
    </main>
  );
}
