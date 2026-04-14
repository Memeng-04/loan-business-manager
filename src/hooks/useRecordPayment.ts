// src/hooks/useRecordPayment.ts
// Custom hook for payment recording and allocation (US-09, US-10, US-11)

import { useState } from 'react';
import { getAccessToken } from '../services/auth';
import { PaymentRepository } from '../repositories/PaymentRepository';
import type { CreatePaymentInput, Payment, PaymentAllocationResult } from '../types/payment';

export interface UseRecordPaymentReturn {
  recordPayment: (input: CreatePaymentInput) => Promise<Payment | null>;
  allocatePayment: (loanId: string, amountPaid: number, scheduleId: string, paymentDate: string) => Promise<PaymentAllocationResult | null>;
  markAbsent: (loanId: string, scheduleId: string, paymentDate: string) => Promise<Payment | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  resetStatus: () => void;
}

export const useRecordPayment = (): UseRecordPaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Record a payment and allocate it to the loan
   */
  const recordPayment = async (input: CreatePaymentInput): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create payment record
      const payment = await PaymentRepository.create(input);
      
      // If schedule_id is provided, trigger allocation
      if (input.schedule_id) {
        await allocatePayment(
          input.loan_id,
          input.amount_paid,
          input.schedule_id,
          input.payment_date
        );
      }

      setSuccess(true);
      return payment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to record payment';
      setError(errorMessage);
      console.error('useRecordPayment.recordPayment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Allocate payment to interest and principal using edge function
   * Business rule: Interest is paid first, then principal
   */
  const allocatePayment = async (
    loanId: string,
    amountPaid: number,
    scheduleId: string,
    paymentDate: string
  ): Promise<PaymentAllocationResult | null> => {
    try {
      // Get a FRESH access token from the Supabase client
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/allocate-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loanId,
            amountPaid,
            scheduleId,
            paymentDate,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          (errorData as { error?: string }).error || 
          `HTTP ${response.status}: Allocation failed`
        );
      }

      const data = await response.json();

      if (!data?.success) {
        throw new Error(data?.error || 'Payment allocation failed');
      }

      return {
        payment_id: data.paymentId,
        interest_portion: data.interestPortion,
        principal_portion: data.principalPortion,
        remaining_balance: data.remainingBalance,
        status: data.status,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to allocate payment';
      setError(errorMessage);
      console.error('useRecordPayment.allocatePayment error:', err);
      return null;
    }
  };

  /**
   * Mark payment as absent (no payment made on this date)
   */
  const markAbsent = async (
    loanId: string,
    scheduleId: string,
    paymentDate: string
  ): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create payment record with 0 amount and 'absent' status
      const payment = await PaymentRepository.create({
        loan_id: loanId,
        amount_paid: 0,
        payment_date: paymentDate,
        schedule_id: scheduleId,
      });

      // Update status to 'absent'
      const updatedPayment = await PaymentRepository.update(payment.id, {
        status: 'absent',
      });

      setSuccess(true);
      return updatedPayment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark payment as absent';
      setError(errorMessage);
      console.error('useRecordPayment.markAbsent error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset error and success states
   */
  const resetStatus = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    recordPayment,
    allocatePayment,
    markAbsent,
    loading,
    error,
    success,
    resetStatus,
  };
};
