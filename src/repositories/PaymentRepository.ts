// src/repositories/PaymentRepository.ts
// Repository for all payment-related Supabase operations (US-09: Record Payment)
// Updated for multi-user support with explicit user_id filtering

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../services/auth';
import type { Payment, CreatePaymentInput } from '../types/payment';

export class PaymentRepository {
  /**
   * Create a new payment record for the current authenticated user
   */
  static async create(payment: CreatePaymentInput, client: SupabaseClient = supabase): Promise<Payment> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from('payments')
      .insert([
        {
          loan_id: payment.loan_id,
          amount_paid: payment.amount_paid,
          payment_date: payment.payment_date,
          schedule_id: payment.schedule_id || null,
          user_id: userId,
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
   * Fetch all payments for a specific loan (only if user owns loan)
   */
  static async getByLoanId(loanId: string, client: SupabaseClient = supabase): Promise<Payment[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return (data || []) as Payment[];
  }

  /**
   * Fetch payment for a specific date and loan (only if user owns loan)
   */
  static async getByDate(
    loanId: string,
    date: string,
    client: SupabaseClient = supabase
  ): Promise<Payment | null> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .eq('payment_date', date)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }

    return (data || null) as Payment | null;
  }

  /**
   * Update payment status and allocation details (only if user owns payment)
   */
  static async update(
    paymentId: string,
    updates: Partial<Payment>,
    client: SupabaseClient = supabase
  ): Promise<Payment> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    return data as Payment;
  }

  /**
   * Get payment summary for a loan (only if user owns loan)
   */
  static async getSummary(loanId: string, client: SupabaseClient = supabase): Promise<{
    totalPaid: number;
    count: number;
    latestPaymentDate: string | null;
  }> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from('payments')
      .select('amount_paid, payment_date')
      .eq('loan_id', loanId)
      .eq('user_id', userId)
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
}
