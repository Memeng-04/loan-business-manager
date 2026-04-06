import { supabase } from "../services/supabase";
import type { Loan } from "../types/loans";

export class LoanRepository {
  static async create(loan: Loan) {
    const { data, error } = await supabase
      .from("loans")
      .insert(loan)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getByBorrowerId(borrowerId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("borrower_id", borrowerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async getAll() {
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
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
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
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from("loans")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
