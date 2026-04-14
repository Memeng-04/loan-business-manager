import { supabase } from "../services/supabase";
import { getCurrentUserId } from "../services/auth";
import type { Loan } from "../types/loans";

export class LoanRepository {
  /**
   * Create a new loan for the current authenticated user
   */
  static async create(loan: Loan) {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("loans")
      .insert({ ...loan, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all loans for a specific borrower (only if user owns borrower)
   */
  static async getByBorrowerId(borrowerId: string): Promise<Loan[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("borrower_id", borrowerId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Get all loans for the current authenticated user
   */
  static async getAll() {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("loans")
      .select(
        `
        *,
        borrowers (
          id,
          full_name,
          phone
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific loan by ID (only if owned by current user)
   */
  static async getById(id: string) {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("loans")
      .select(
        `
        *,
        borrowers (
          id,
          full_name,
          phone
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update loan status (only if owned by current user)
   */
  static async updateStatus(id: string, status: string) {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("loans")
      .update({ status })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
