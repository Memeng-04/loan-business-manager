import { supabase } from "../services/supabase";
import type { PaymentFrequency } from "../types/loans";
import type { Payment } from "../types/payment";

export type DashboardLoan = {
  id: string;
  borrower_id: string;
  principal: number;
  interest: number;
  frequency: PaymentFrequency;
  status: string;
};

export type DashboardSchedule = {
  loan_id: string;
  due_date: string;
  amount_due: number;
  status: string;
};

export type DashboardBorrower = {
  id: string;
  full_name: string;
};

export class DashboardRepository {
  static async getLoans(): Promise<DashboardLoan[]> {
    const { data, error } = await supabase
      .from("loans")
      .select("id, borrower_id, principal, interest, frequency, status");

    if (error) {
      throw error;
    }

    return (data ?? []) as DashboardLoan[];
  }

  static async getBorrowers(): Promise<DashboardBorrower[]> {
    const { data, error } = await supabase
      .from("borrowers")
      .select("id, full_name");

    if (error) {
      throw error;
    }

    return (data ?? []) as DashboardBorrower[];
  }

  static async getDueSchedulesForDate(
    dueDate: string,
  ): Promise<DashboardSchedule[]> {
    const { data, error } = await supabase
      .from("payment_schedules")
      .select("loan_id, due_date, amount_due, status")
      .eq("due_date", dueDate)
      .neq("status", "paid")
      .order("due_date", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as DashboardSchedule[];
  }

  static async getAllPayments(): Promise<Pick<Payment, 'amount_paid' | 'interest_portion' | 'principal_portion'>[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("amount_paid, interest_portion, principal_portion");

    if (error) {
      throw error;
    }

    return (data ?? []) as Pick<Payment, 'amount_paid' | 'interest_portion' | 'principal_portion'>[];
  }
}
