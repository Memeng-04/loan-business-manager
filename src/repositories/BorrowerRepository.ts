import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import { getCurrentUserId } from "../services/auth";
import { BorrowerFactory } from "../factories/BorrowerFactory";
import type { Borrower, CreateBorrowerInput } from "../types/borrowers";

export class BorrowerRepository {
  /**
   * Get all borrowers for the current authenticated user
   */
  static async getAll(client: SupabaseClient = supabase): Promise<Borrower[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from("borrowers")
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Get a specific borrower by ID (only if owned by current user)
   */
  static async getById(id: string, client: SupabaseClient = supabase): Promise<Borrower | null> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from("borrowers")
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .eq("id", id)
      .eq("user_id", userId)
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
  static async create(input: CreateBorrowerInput, client: SupabaseClient = supabase): Promise<Borrower> {
    const userId = await getCurrentUserId();
    
    if (!input.full_name?.trim()) throw new Error("Full name is required");
    if (!input.phone?.trim()) throw new Error("Phone number is required");

    const payload = BorrowerFactory.create(input);

    const { data, error } = await client
      .from("borrowers")
      .insert({ ...payload, user_id: userId })
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
    client: SupabaseClient = supabase
  ): Promise<Borrower> {
    const userId = await getCurrentUserId();
    
    if (!input.full_name?.trim()) throw new Error("Full name is required");
    if (!input.phone?.trim()) throw new Error("Phone number is required");

    const payload = BorrowerFactory.create(input);

    const { data, error } = await client
      .from("borrowers")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select(
        "id, full_name, email, address, phone, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name",
      )
      .single();

    if (error) throw error;
    return data;
  }
}

