import { supabase } from "../services/supabase";
import type { Loan } from "../types/loans";

export class LoanRepository {
  /**
   * Create a new loan for the current authenticated user
   */
  static async create(loan: Loan) {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to create loan');
    }

    const { data, error } = await supabase
      .from("loans")
      .insert({
        ...loan,
        user_id: session.data.session.user.id,  // Automatically associate with current user
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all loans for a specific borrower (only if user owns borrower)
   */
  static async getByBorrowerId(borrowerId: string): Promise<Loan[]> {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to fetch loans');
    }

    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("borrower_id", borrowerId)
      .eq("user_id", session.data.session.user.id)  // Filter by current user
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Get all loans for the current authenticated user
   */
  static async getAll() {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to fetch loans');
    }

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
      .eq("user_id", session.data.session.user.id)  // Filter by current user
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific loan by ID (only if owned by current user)
   */
  static async getById(id: string) {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to fetch loan');
    }

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
      .eq("user_id", session.data.session.user.id)  // Filter by current user
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update loan status (only if owned by current user)
   */
  static async updateStatus(id: string, status: string) {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to update loan');
    }

    const { data, error } = await supabase
      .from("loans")
      .update({ status })
      .eq("id", id)
      .eq("user_id", session.data.session.user.id)  // Ensure user owns this loan
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
