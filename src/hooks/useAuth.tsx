import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import {
  getCurrentSession,
  signInWithEmailPassword,
  signOut as signOutService,
  signUpWithEmailPassword,
} from "../services/auth";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; hasSession: boolean }>;
  signOut: () => Promise<{ error: string | null }>;
};

function mapAuthErrorMessage(message: string | null): string | null {
  if (!message) {
    return null;
  }

  if (message.toLowerCase().includes("email logins are disabled")) {
    return "Email/password auth is disabled in Supabase. Enable it in Supabase Dashboard → Authentication → Providers → Email.";
  }

  return message;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const { session: currentSession } = await getCurrentSession();
      if (isMounted) {
        setSession(currentSession);
        setIsLoading(false);
      }
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      signIn: async (email: string, password: string) => {
        const { error } = await signInWithEmailPassword(email, password);
        return { error: mapAuthErrorMessage(error?.message ?? null) };
      },
      signUp: async (email: string, password: string) => {
        const { error, session: nextSession } = await signUpWithEmailPassword(
          email,
          password,
        );
        return {
          error: mapAuthErrorMessage(error?.message ?? null),
          hasSession: Boolean(nextSession),
        };
      },
      signOut: async () => {
        const { error } = await signOutService();
        return { error: error?.message ?? null };
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
