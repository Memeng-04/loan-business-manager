import { supabase } from "../services/supabase";
import type { Borrower, CreateBorrowerInput } from "../types/borrowers";

export class BorrowerRepository {
  static async getAll(): Promise<Borrower[]> {
    const { data, error } = await supabase
      .from("borrowers")
      .select("id, full_name, business_name, address, phone, notes, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async create(input: CreateBorrowerInput): Promise<Borrower> {
    const payload = {
      full_name: input.full_name,
      business_name: input.business_name || null,
      address: input.address || null,
      phone: input.phone || null,
      notes: input.notes || null,
    };

    const { data, error } = await supabase
      .from("borrowers")
      .insert(payload)
      .select("id, full_name, business_name, address, phone, notes, created_at")
      .single();

    if (error) throw error;
    return data;
  }
}
