export interface UserProfile {
  user_id: string;
  legal_full_name: string;
  display_name: string;
  initial_capital: number;
  initial_profit: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserProfileInput {
  legal_full_name: string;
  display_name: string;
  initial_capital: number;
  initial_profit: number;
}
