// src/types/payment.ts
// Payment types and interfaces for US-09, US-10, US-11

export type PaymentStatus = 'paid' | 'partial' | 'absent';

export interface Payment {
  id: string;
  loan_id: string;
  amount_paid: number;
  payment_date: string; // ISO date format YYYY-MM-DD
  status: PaymentStatus;
  interest_portion: number;
  principal_portion: number;
  schedule_id?: string;
  remaining_balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentInput {
  loan_id: string;
  amount_paid: number;
  payment_date: string; // ISO date format YYYY-MM-DD
  schedule_id?: string;
}

export interface PaymentAllocationResult {
  payment_id: string;
  interest_portion: number;
  principal_portion: number;
  remaining_balance: number;
  status: PaymentStatus;
}

export interface PaymentValidation {
  valid: boolean;
  message: string;
  isPartial?: boolean;
  remainingBalance?: number;
}
