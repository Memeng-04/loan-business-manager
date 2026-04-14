import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from '../services/supabase';

export type AuthResponse = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.getSession();

  return {
    session: data.session,
    error,
  };
}

/**
 * Get a fresh access token for edge function calls.
 * Always reads from the Supabase client's internal storage
 * which handles token refresh automatically.
 */
export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Not authenticated — please log in first');
  }
  return data.session.access_token;
}

/**
 * Get the current authenticated user's ID.
 * Uses getUser() which validates the token server-side.
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) {
    throw new Error('Not authenticated');
  }
  return user.id;
}
