import { supabase } from "../services/supabase";
import type { CreateUserProfileInput, UserProfile } from "../types/userProfile";

export class UserProfileRepository {
  static async getByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
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
    input: CreateUserProfileInput,
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          legal_full_name: input.legal_full_name.trim(),
          display_name: input.display_name.trim(),
          initial_capital: input.initial_capital,
          initial_profit: input.initial_profit,
        },
        { onConflict: "user_id" },
      )
      .select(
        "user_id, legal_full_name, display_name, initial_capital, initial_profit, created_at, updated_at",
      )
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
