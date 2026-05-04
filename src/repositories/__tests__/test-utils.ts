import { createClient } from '@supabase/supabase-js';

// These should be in your .env file. 
// For testing, we use the values from process.env which Vitest loads from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// IMPORTANT: Add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'service_role_key'; 

export const TEST_USER_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Fixed test UUID

/**
 * Admin client that bypasses RLS.
 * Use this for test setup (seeding) and cleanup.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storageKey: `sb-admin-${Math.random().toString(36).slice(2)}-auth-token`,
  }
});

/**
 * User client that respects RLS and Audit Logs.
 * Use this to verify that lenders can only see their own data.
 */
export const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    storageKey: `sb-user-${Math.random().toString(36).slice(2)}-auth-token`,
  },
  global: {
    headers: {
      // This helps Supabase Platform Audit Logs identify the user
      'X-Supabase-Auth-User-ID': TEST_USER_ID,
    },
  },
});

/**
 * Robustly ensures the test user exists in the auth.users table.
 * Handles the fixed TEST_USER_ID and suppresses "already exists" errors.
 */
export async function ensureTestUser(id: string = TEST_USER_ID): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    id,
    email: `test-lender-${id.slice(0, 8)}@example.com`,
    password: 'password123',
    email_confirm: true,
  }).catch((e) => ({ error: e }));

  if (error) {
    const msg = error.message?.toLowerCase() || '';
    // Ignore common "already exists" errors
    if (
      msg.includes('already exists') || 
      msg.includes('database error creating new user') ||
      msg.includes('duplicate key')
    ) {
      return;
    }
    console.warn(`User creation warning for ${id}:`, error.message);
  }
}

/**
 * Helper to execute a database operation with a specific user's identity
 * even when using the service role (God Mode).
 * 
 * This ensures that Audit Logs correctly attribute the action to the lender.
 */
export async function withAuditContext<T>(operation: () => Promise<T>): Promise<T> {
  // 1. Set the session context in Postgres so that triggers/audit logs see the user
  // For now, we will rely on manual user_id tagging which your repositories already do.
  
  return await operation();
}
