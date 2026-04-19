// src/components/payments/RecordPaymentForm.tsx
// Payment recording form component (US-09, US-10, US-11)
// Allows users to record payments for loans with partial payment support

import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { formatCurrency } from "../../lib/formatters";
import {
  validatePayment,
  calculateRemainingBalance,
} from "../../strategies/PaymentStrategy";
import { useRecordPayment } from "../../hooks/useRecordPayment";
import { useBorrowers } from "../../hooks/useBorrowers";
import Button from "../Button";
import Card from "../card/Card";
import FeedbackMessage from "../feedback/FeedbackMessage";
import { LoanRepository } from "../../repositories/LoanRepository";
import type { Loan } from "../../types/loans";
import type { PaymentValidation } from "../../types/payment";
import styles from "./RecordPaymentForm.module.css";

interface RecordPaymentFormProps {
  onPaymentRecorded?: (paymentId: string) => void;
  initialLoanId?: string;
}

export const RecordPaymentForm: React.FC<RecordPaymentFormProps> = ({
  onPaymentRecorded,
  initialLoanId,
}) => {
  // State
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    initialLoanId || "",
  );
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>("");

  // Data fetching
  const { borrowers, loading: borrowersLoading } = useBorrowers();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Payment handling
  const { recordPayment, loading: recordLoading, error } = useRecordPayment();
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackVariant, setFeedbackVariant] = useState<
    "success" | "error" | null
  >(null);

  // Fetch loans for selected borrower
  useEffect(() => {
    if (!selectedBorrowerId) {
      setLoans([]);
      setSelectedLoanId("");
      setSelectedLoan(null);
      return;
    }

    const fetchLoans = async () => {
      try {
        setLoansLoading(true);
        const borrowerLoans =
          await LoanRepository.getByBorrowerId(selectedBorrowerId);
        // Filter to only active loans
        const activeLoans = borrowerLoans.filter(
          (loan) => loan.status === "active",
        );
        setLoans(activeLoans);
      } catch (err) {
        console.error("Failed to fetch loans:", err);
        setLoans([]);
      } finally {
        setLoansLoading(false);
      }
    };

    fetchLoans();
  }, [selectedBorrowerId]);

  // Update selected loan details when loan changes
  useEffect(() => {
    const loan = loans.find((l) => l.id === selectedLoanId) || null;
    setSelectedLoan(loan);
    setAmountPaid("");
  }, [selectedLoanId, loans]);

  // Validate payment amount
  const validation: PaymentValidation = useMemo(() => {
    if (!amountPaid || !selectedLoan) {
      return { valid: false, message: "" };
    }

    const parsed = parseFloat(amountPaid);
    if (isNaN(parsed)) {
      return { valid: false, message: "Invalid amount" };
    }

    // For now, use payment_amount as the due amount (can be enhanced with schedule data)
    return validatePayment(parsed, selectedLoan.payment_amount);
  }, [amountPaid, selectedLoan]);

  // Calculate remaining balance for preview
  const remainingBalance = useMemo(() => {
    if (!amountPaid || !selectedLoan) return 0;
    const parsed = parseFloat(amountPaid);
    if (isNaN(parsed)) return 0;
    return calculateRemainingBalance(selectedLoan.payment_amount, parsed);
  }, [amountPaid, selectedLoan]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.valid || !selectedLoan || !selectedBorrowerId) {
      setFeedbackVariant("error");
      setFeedbackMessage("Please correct the errors above");
      return;
    }

    try {
      const payment = await recordPayment({
        loan_id: selectedLoan.id!,
        amount_paid: parseFloat(amountPaid),
        payment_date: paymentDate,
      });

      if (payment) {
        setFeedbackVariant("success");
        setFeedbackMessage(
          validation.isPartial
            ? `Partial payment of ₱${formatCurrency(parseFloat(amountPaid))} recorded. Remaining: ₱${formatCurrency(remainingBalance)}`
            : `Payment of ₱${formatCurrency(parseFloat(amountPaid))} recorded successfully!`,
        );

        // Reset form
        setAmountPaid("");
        setSelectedLoanId("");
        setSelectedLoan(null);

        // Callback
        if (onPaymentRecorded && payment.id) {
          onPaymentRecorded(payment.id);
        }

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedbackVariant(null), 3000);
      }
    } catch (err) {
      setFeedbackVariant("error");
      setFeedbackMessage(error || "Failed to record payment");
    }
  };

  const isFormValid =
    validation.valid && selectedLoan && amountPaid && selectedBorrowerId;
  const isLoading = borrowersLoading || loansLoading || recordLoading;

  return (
    <div className={styles.stepContainer}>
      {/* Feedback */}
      {feedbackVariant && (
        <div className={styles.feedbackContainer}>
          <FeedbackMessage
            variant={feedbackVariant as "success" | "error"}
            message={feedbackMessage}
          />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Borrower Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Borrower
            <span className={styles.labelRequired}>*</span>
          </label>
          <select
            value={selectedBorrowerId}
            onChange={(e) => setSelectedBorrowerId(e.target.value)}
            disabled={isLoading}
            className={styles.selectDropdown}
            required
          >
            <option value="">Select a borrower...</option>
            {borrowers.map((borrower) => (
              <option key={borrower.id} value={borrower.id}>
                {borrower.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Loan Selection */}
        {selectedBorrowerId && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Loan
              <span className={styles.labelRequired}>*</span>
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              disabled={isLoading || loansLoading || loans.length === 0}
              className={styles.selectDropdown}
              required
            >
              <option value="">Select a loan...</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  Principal: ₱{formatCurrency(loan.principal)} | Status:{" "}
                  {loan.status}
                </option>
              ))}
            </select>
            {loans.length === 0 && selectedBorrowerId && !loansLoading && (
              <p className={styles.inputHelper} style={{ color: "#dc2626" }}>
                No active loans found for this borrower
              </p>
            )}
          </div>
        )}

        {/* Loan Details Card */}
        {selectedLoan && (
          <Card
            padding="lg"
            style={{ backgroundColor: "#eff6ff", borderColor: "#93c5fd" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#012a6a",
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                Loan Details
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#4a5568" }}>Principal:</span>
                <span style={{ fontWeight: 600, color: "#012a6a" }}>
                  ₱{formatCurrency(selectedLoan.principal)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#4a5568" }}>Payment Amount:</span>
                <span style={{ fontWeight: 600, color: "#012a6a" }}>
                  ₱{formatCurrency(selectedLoan.payment_amount)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#4a5568" }}>Interest Rate:</span>
                <span style={{ fontWeight: 600, color: "#012a6a" }}>
                  {selectedLoan.interest_rate.toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Input */}
        {selectedLoan && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Payment Amount (₱)
                <span className={styles.labelRequired}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={`e.g. ${selectedLoan.payment_amount}`}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                disabled={isLoading}
                className={styles.input}
                required
              />
              <p className={styles.inputHelper}>
                Enter the amount being paid today
              </p>
              {amountPaid && !validation.valid && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "0.75rem",
                    marginTop: "-0.5rem",
                  }}
                >
                  <AlertCircle
                    size={12}
                    style={{ display: "inline", marginRight: "0.25rem" }}
                  />
                  {validation.message}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Payment Date
                <span className={styles.labelRequired}>*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={isLoading}
                className={styles.input}
                required
              />
            </div>
          </div>
        )}

        {/* Payment Preview */}
        {selectedLoan && amountPaid && validation.valid && (
          <div className={styles.previewCard}>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Amount to Pay:</span>
              <span className={styles.previewValue}>
                ₱{parseFloat(amountPaid).toFixed(2)}
              </span>
            </div>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Due Amount:</span>
              <span className={styles.previewValue}>
                ₱{selectedLoan.payment_amount.toFixed(2)}
              </span>
            </div>

            {validation.isPartial && (
              <div className={styles.partialPaymentInfo}>
                <div className={styles.partialPaymentLabel}>
                  ⚠ Partial Payment
                </div>
                <div className={styles.partialPaymentText}>
                  Remaining to pay: ₱{remainingBalance.toFixed(2)}
                </div>
              </div>
            )}

            {!validation.isPartial &&
              parseFloat(amountPaid) >= selectedLoan.payment_amount && (
                <div
                  style={{
                    color: "#16a34a",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  ✓ Full payment
                </div>
              )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className={styles.buttonGroup}>
          <Button
            type="button"
            onClick={() => {
              setAmountPaid("");
              setSelectedLoanId("");
              setSelectedBorrowerId("");
              setFeedbackVariant(null);
            }}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="blue"
            size="lg"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
