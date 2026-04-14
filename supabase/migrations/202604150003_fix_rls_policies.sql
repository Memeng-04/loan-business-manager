-- Migration: Fix RLS policies - Remove public access, enforce user isolation
-- Created: 2026-04-15
-- Problem: "Public Access" policies grant ALL operations to public role,
--          bypassing all user-specific RLS policies

-- ============================================================
-- STEP 1: Drop ALL overly-permissive public access policies
-- ============================================================

-- Borrowers: Drop public access policies
DROP POLICY IF EXISTS "Public Access Borrowers" ON borrowers;
DROP POLICY IF EXISTS "Public Read Access" ON borrowers;
DROP POLICY IF EXISTS "Public Read Borrowers" ON borrowers;
DROP POLICY IF EXISTS "Users can manage own borrowers" ON borrowers;

-- Loans: Drop public access policies
DROP POLICY IF EXISTS "Public Access Loans" ON loans;
DROP POLICY IF EXISTS "Public Read Loans" ON loans;
DROP POLICY IF EXISTS "Users can manage own loans" ON loans;

-- Payment Schedules: Drop public access policies
DROP POLICY IF EXISTS "Enable all actions for user" ON payment_schedules;
DROP POLICY IF EXISTS "Public Access Payment Schedules" ON payment_schedules;

-- Payments: Drop public access policies
DROP POLICY IF EXISTS "Public Access Payments" ON payments;
DROP POLICY IF EXISTS "Users can manage own payments" ON payments;

-- ============================================================
-- STEP 2: Drop the old conflicting policies (from original migrations)
-- These may or may not exist depending on what was already cleaned up
-- ============================================================

DROP POLICY IF EXISTS "Individuals can view their own payments." ON payments;
DROP POLICY IF EXISTS "Individuals can insert their own payments." ON payments;

-- Also drop the policies from the multi-user migration if they exist
-- (we'll recreate them all cleanly below)
DROP POLICY IF EXISTS "Users can view own borrowers" ON borrowers;
DROP POLICY IF EXISTS "Users can insert own borrowers" ON borrowers;
DROP POLICY IF EXISTS "Users can update own borrowers" ON borrowers;
DROP POLICY IF EXISTS "Users can delete own borrowers" ON borrowers;

DROP POLICY IF EXISTS "Users can view own loans" ON loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON loans;
DROP POLICY IF EXISTS "Users can update own loans" ON loans;
DROP POLICY IF EXISTS "Users can delete own loans" ON loans;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;

DROP POLICY IF EXISTS "Users can view own payment schedules" ON payment_schedules;
DROP POLICY IF EXISTS "Users can insert own payment schedules" ON payment_schedules;
DROP POLICY IF EXISTS "Users can update own payment schedules" ON payment_schedules;
DROP POLICY IF EXISTS "Users can delete own payment schedules" ON payment_schedules;

-- ============================================================
-- STEP 3: Ensure RLS is enabled on all tables
-- ============================================================

ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: Create CLEAN user-scoped policies
-- Only authenticated users can access their OWN data
-- ============================================================

-- Borrowers policies
CREATE POLICY "borrowers_select_own" ON borrowers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "borrowers_insert_own" ON borrowers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "borrowers_update_own" ON borrowers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "borrowers_delete_own" ON borrowers
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Loans policies
CREATE POLICY "loans_select_own" ON loans
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "loans_insert_own" ON loans
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "loans_update_own" ON loans
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "loans_delete_own" ON loans
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_own" ON payments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "payments_delete_own" ON payments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Payment Schedules policies
CREATE POLICY "schedules_select_own" ON payment_schedules
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "schedules_insert_own" ON payment_schedules
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedules_update_own" ON payment_schedules
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "schedules_delete_own" ON payment_schedules
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
