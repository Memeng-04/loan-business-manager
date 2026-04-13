// src/repositories/PaymentRepository.ts
// Repository for all payment-related Supabase operations (US-09: Record Payment)

import { supabase } from '../services/supabase';
import type { Payment, CreatePaymentInput } from '../types/payment';

export class PaymentRepository {
  /**
   * Create a new payment record
   * @param payment - Payment data to save
   * @returns Created payment object with id
   * @throws Error if authentication fails or database error occurs
   */
  static async create(payment: CreatePaymentInput): Promise<Payment> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Authentication required to record payment');
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          loan_id: payment.loan_id,
          amount_paid: payment.amount_paid,
          payment_date: payment.payment_date,
          schedule_id: payment.schedule_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }

    return data as Payment;
  }

  /**
   * Fetch all payments for a specific loan
   * @param loanId - ID of the loan
   * @returns Array of payments for the loan, sorted by payment_date descending
   * @throws Error if database fetch fails
   */
  static async getByLoanId(loanId: string): Promise<Payment[]> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Authentication required to fetch payments');
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return (data || []) as Payment[];
  }

  /**
   * Fetch payment for a specific date and loan
   * @param loanId - ID of the loan
   * @param date - Payment date (ISO format YYYY-MM-DD)
   * @returns Payment object or null if not found
   * @throws Error if database fetch fails
   */
  static async getByDate(
    loanId: string,
    date: string
  ): Promise<Payment | null> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Authentication required to fetch payment');
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .eq('payment_date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is okay
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }

    return (data || null) as Payment | null;
  }

  /**
   * Update payment status and allocation details
   * Called after edge function processes the payment
   * @param paymentId - ID of the payment to update
   * @param updates - Partial payment object with fields to update
   * @returns Updated payment object
   * @throws Error if update fails
   */
  static async update(
    paymentId: string,
    updates: Partial<Payment>
  ): Promise<Payment> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Authentication required to update payment');
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    return data as Payment;
  }

  /**
   * Get payment summary for a loan (total paid, remaining, etc.)
   * @param loanId - ID of the loan
   * @returns { totalPaid, count, latestPaymentDate }
   * @throws Error if database fetch fails
   */
  static async getSummary(loanId: string): Promise<{
    totalPaid: number;
    count: number;
    latestPaymentDate: string | null;
  }> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Authentication required to fetch payment summary');
    }

    const { data, error } = await supabase
      .from('payments')
      .select('amount_paid, payment_date')
      .eq('loan_id', loanId)
      .not('amount_paid', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch payment summary: ${error.message}`);
    }

    const payments = (data || []) as Array<{
      amount_paid: number;
      payment_date: string;
    }>;

    return {
      totalPaid: payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
      count: payments.length,
      latestPaymentDate:
        payments.length > 0
          ? payments.sort((a, b) =>
              b.payment_date.localeCompare(a.payment_date)
            )[0].payment_date
          : null,
    };
  }

  /**
   * Legacy method for backward compatibility - calls edge function for payment recording
   * @deprecated Use create() instead
   */
  async recordPayment(paymentInput: CreatePaymentInput): Promise<Payment | null> {
    try {
      const { loan_id, amount_paid, payment_date } = paymentInput;

      // Call the Supabase Edge Function to record the payment
      const { data, error } = await supabase.functions.invoke('record-payment', {
        body: JSON.stringify({
          loanId: loan_id,
          amount: amount_paid,
          paymentDate: payment_date,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Error invoking record-payment function:', error);
        throw new Error(`Failed to record payment: ${error.message}`);
      }

      if (data && data.success) {
        return data.payment as Payment;
      } else {
        console.error('record-payment function returned an error:', data);
        throw new Error(`Failed to record payment: ${data?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('PaymentRepository.recordPayment error:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getByLoanId() instead
   */
  async getPaymentsByLoanId(loanId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: true });

      if (error) {
        console.error('Error fetching payments:', error);
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }

      return data as Payment[];
    } catch (error: any) {
      console.error('PaymentRepository.getPaymentsByLoanId error:', error);
      throw error;
    }
  }
}
