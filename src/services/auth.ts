import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

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
