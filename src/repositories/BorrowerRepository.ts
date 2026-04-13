import { supabase } from "../services/supabase";
import { BorrowerFactory } from "../factories/BorrowerFactory";
import type { Borrower, CreateBorrowerInput } from "../types/borrowers";

export class BorrowerRepository {
  /**
   * Get all borrowers for the current authenticated user
   */
  static async getAll(): Promise<Borrower[]> {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to fetch borrowers');
    }

    const { data, error } = await supabase
      .from("borrowers")
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .eq("user_id", session.data.session.user.id)  // Filter by current user
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Get a specific borrower by ID (only if owned by current user)
   */
  static async getById(id: string): Promise<Borrower | null> {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to fetch borrower');
    }

    const { data, error } = await supabase
      .from("borrowers")
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .eq("id", id)
      .eq("user_id", session.data.session.user.id)  // Filter by current user
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  }

  /**
   * Create a new borrower for the current authenticated user
   */
  static async create(input: CreateBorrowerInput): Promise<Borrower> {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to create borrower');
    }

    const payload = BorrowerFactory.create(input);

    const { data, error } = await supabase
      .from("borrowers")
      .insert({
        ...payload,
        user_id: session.data.session.user.id,  // Automatically associate with current user
      })
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a borrower (only if owned by current user)
   */
  static async update(
    id: string,
    input: CreateBorrowerInput,
  ): Promise<Borrower> {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user?.id) {
      throw new Error('Authentication required to update borrower');
    }

    const payload = BorrowerFactory.create(input);

    const { data, error } = await supabase
      .from("borrowers")
      .update(payload)
      .eq("id", id)
      .eq("user_id", session.data.session.user.id)  // Ensure user owns this borrower
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .single();

    if (error) throw error;
    return data;
  }
}
