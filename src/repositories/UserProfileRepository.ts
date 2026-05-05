import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import type { CreateUserProfileInput, UserProfile } from "../types/userProfile";

export class UserProfileRepository {
  static async getByUserId(
    userId: string,
    client: SupabaseClient = supabase
  ): Promise<UserProfile | null> {
    const { data, error } = await client
      .from("user_profiles")
      .select(
        "user_id, legal_full_name, display_name, initial_capital, initial_profit, created_at, updated_at",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  static async upsertByUserId(
    userId: string,
    input: Partial<CreateUserProfileInput>,
    client: SupabaseClient = supabase
  ): Promise<UserProfile> {
    // 1. Check if profile exists
    const existing = await this.getByUserId(userId, client);

    if (existing) {
      // 2. If exists, perform a partial update
      const payload: any = {};
      if (input.legal_full_name !== undefined) payload.legal_full_name = input.legal_full_name?.trim();
      if (input.display_name !== undefined) payload.display_name = input.display_name?.trim();
      if (input.initial_capital !== undefined) payload.initial_capital = input.initial_capital;
      if (input.initial_profit !== undefined) payload.initial_profit = input.initial_profit;

      const { data, error } = await client
        .from("user_profiles")
        .update(payload)
        .eq("user_id", userId)
        .select(
          "user_id, legal_full_name, display_name, initial_capital, initial_profit, created_at, updated_at",
        )
        .single();

      if (error) throw error;
      return data;
    } else {
      // 3. If new, perform an insert
      const payload: any = { 
        user_id: userId,
        legal_full_name: input.legal_full_name?.trim() || "",
        display_name: input.display_name?.trim() || "",
        initial_capital: input.initial_capital || 0,
        initial_profit: input.initial_profit || 0,
      };

      const { data, error } = await client
        .from("user_profiles")
        .insert(payload)
        .select(
          "user_id, legal_full_name, display_name, initial_capital, initial_profit, created_at, updated_at",
        )
        .single();

      if (error) throw error;
      return data;
    }
  }
}
