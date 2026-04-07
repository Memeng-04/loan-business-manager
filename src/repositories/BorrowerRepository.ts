import { supabase } from "../services/supabase";
import { BorrowerFactory } from "../factories/BorrowerFactory";
import type { Borrower, CreateBorrowerInput } from "../types/borrowers";

export class BorrowerRepository {
  static async getAll(): Promise<Borrower[]> {
    const { data, error } = await supabase
      .from("borrowers")
      .select(
        "id, full_name, email, address, phone, notes, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name, bank_ewallet_details",
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async getById(id: string): Promise<Borrower | null> {
    const { data, error } = await supabase
      .from("borrowers")
      .select(
        "id, full_name, email, address, phone, notes, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name, bank_ewallet_details",
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }

      throw error;
    }

    return data;
  }

  static async create(input: CreateBorrowerInput): Promise<Borrower> {
    const payload = BorrowerFactory.create(input);

    const { data, error } = await supabase
      .from("borrowers")
      .insert(payload)
      .select(
        "id, full_name, email, address, phone, notes, created_at, monthly_income, source_of_income, secondary_contact_number, secondary_contact_name, bank_ewallet_details",
      )
      .single();

    if (error) throw error;
    return data;
  }
}
