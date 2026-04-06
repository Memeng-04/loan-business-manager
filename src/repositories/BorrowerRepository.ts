import { supabase } from "../services/supabase";
import { BorrowerFactory } from "../factories/BorrowerFactory";
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
    const payload = BorrowerFactory.create(input);

    const { data, error } = await supabase
      .from("borrowers")
      .insert(payload)
      .select("id, full_name, business_name, address, phone, notes, created_at")
      .single();

    if (error) throw error;
    return data;
  }
}
