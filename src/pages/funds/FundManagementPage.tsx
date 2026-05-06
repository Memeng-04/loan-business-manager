import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "../../components/home/BalanceCard";
import Card from "../../components/ui/card/Card";
import Button from "../../components/ui/Button";


import FeedbackMessage from "../../components/ui/feedback/FeedbackMessage";
import EditFundsModal, {
  type EditFundsFormData,
} from "../../components/funds/EditFundsModal";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { UserProfileRepository } from "../../repositories/UserProfileRepository";
import {
  DashboardRepository,
  type DashboardLoan,
} from "../../repositories/DashboardRepository";


type Transaction = {
  id: string;
  date: string;
  type: "withdraw_capital" | "add_capital" | "withdraw_profit" | "add_profit";
  amount: number;
  balanceBefore: number;
};

export default function FundManagementPage() {
  const navigate = useNavigate();
  const {
    profile,
    setProfile,
    isLoading: profileIsLoading,
  } = useCurrentUserProfile();
  const [transactions] = useState<Transaction[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loans, setLoans] = useState<DashboardLoan[]>([]);
  type PaymentRow = {
    amount_paid?: number;
    interest_portion?: number;
    principal_portion?: number;
  };
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loanRows, paymentRows] = await Promise.all([
          DashboardRepository.getLoans(),
          DashboardRepository.getAllPayments(),
        ]);
        setLoans(loanRows);
        setPayments(paymentRows);
      } catch (err) {
        console.error("Failed to load funds data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  const initialCapital = profile?.initial_capital ?? 0;
  const initialProfit = profile?.initial_profit ?? 0;

  const totalPrincipalLent = loans.reduce(
    (sum, loan) => sum + (loan.principal || 0),
    0,
  );
  const totalPaymentsReceived = payments.reduce(
    (sum, p) => sum + (p.amount_paid ?? 0),
    0,
  );
  const totalInterestEarned = payments.reduce(
    (sum, p) => sum + (p.interest_portion ?? 0),
    0,
  );

  const outstandingBalance =
    initialCapital + initialProfit - totalPrincipalLent + totalPaymentsReceived;

  const handleEditFunds = async (formData: EditFundsFormData) => {
    if (!profile) return;

    setError(null);
    setSuccess(null);

    const withdrawCap = parseFloat(formData.withdrawCapital || "0");
    const addCap = parseFloat(formData.addCapital || "0");
    const withdrawProf = parseFloat(formData.withdrawProfit || "0");
    const addProf = parseFloat(formData.addProfit || "0");

    if (
      withdrawCap === 0 &&
      addCap === 0 &&
      withdrawProf === 0 &&
      addProf === 0
    ) {
      setError("Please enter a transaction amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nextCapital = initialCapital + addCap - withdrawCap;
      const nextProfit = initialProfit + addProf - withdrawProf;

      if (nextCapital < 0 || nextProfit < 0) {
        throw new Error("Insufficient funds for this transaction.");
      }

      const updated = await UserProfileRepository.upsertByUserId(
        profile.user_id,
        {
          legal_full_name: profile.legal_full_name,
          display_name: profile.display_name,
          initial_capital: nextCapital,
          initial_profit: nextProfit,
        },
      );

      setProfile(updated);
      setSuccess("Funds updated successfully.");
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update funds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8] overflow-y-auto">

      <div className="max-w-4xl mx-auto p-8 w-full">
        <div className="mb-6">
          <Button
            variant="back"
            size="md"
            onClick={() => navigate("/dashboard")}
          >
            Back
          </Button>
        </div>

        {error ? <FeedbackMessage message={error} /> : null}
        {success ? (
          <FeedbackMessage variant="success" message={success} />
        ) : null}

        <div className="mb-10">
          <div className="w-full">
            <BalanceCard
              outstandingBalance={outstandingBalance}
              initialCapital={initialCapital}
              initialProfit={initialProfit + totalInterestEarned}
              isLoading={profileIsLoading || isLoadingData}
              onManageFunds={() => setIsEditModalOpen(true)}
            />
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
            <Button variant="blue" size="md" onClick={() => navigate("/add")}>
              + Add
            </Button>
          </div>
          <Card>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="flex flex-col">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-4 items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.type.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 justify-self-end">
                      ₦
                      {transaction.amount.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-sm text-gray-500 justify-self-end">
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
      </div>

      <EditFundsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditFunds}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
