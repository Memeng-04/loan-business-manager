import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

const isTest = import.meta.env.MODE === "test" || !!import.meta.env.VITEST;

// Singleton pattern to prevent multiple GoTrueClient instances during HMR or Storybook reloads.
// We use globalThis to persist the instance across module reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var __supabaseInstance: SupabaseClient | undefined;
}

let client: SupabaseClient;

if (import.meta.env.DEV && !isTest && globalThis.__supabaseInstance) {
  client = globalThis.__supabaseInstance;
} else {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: !isTest,
      autoRefreshToken: !isTest,
      detectSessionInUrl: !isTest,
      storageKey: isTest ? `sb-test-${Math.random().toString(36).slice(2)}-auth-token` : undefined,
    },
  });

  if (import.meta.env.DEV && !isTest) {
    globalThis.__supabaseInstance = client;
  }
}

export const supabase = client;
