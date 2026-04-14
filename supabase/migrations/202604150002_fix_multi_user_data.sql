-- Migration: Fix multi-user data and clean up conflicting policies
-- Created: 2026-04-15
-- Fixes:
--   BUG 1: Backfill NULL user_id for pre-migration data
--   BUG 2: Remove conflicting old RLS policies on payments table

-- ============================================================
-- STEP 1: Backfill orphaned data (user_id = NULL)
-- Assign all orphaned records to the first registered user
-- ============================================================

-- Backfill borrowers
UPDATE borrowers
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

-- Backfill loans
UPDATE loans
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

-- Backfill payments
UPDATE payments
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

-- Backfill payment_schedules
UPDATE payment_schedules
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

-- ============================================================
-- STEP 2: Drop conflicting OLD RLS policies on payments table
-- These policies incorrectly compare auth.uid() with borrower_id
-- ============================================================

DROP POLICY IF EXISTS "Individuals can view their own payments." ON payments;
DROP POLICY IF EXISTS "Individuals can insert their own payments." ON payments;

-- ============================================================
-- STEP 3: Add NOT NULL constraints to user_id columns
-- Ensures all future inserts MUST have a user_id
-- ============================================================

ALTER TABLE borrowers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE loans ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE payment_schedules ALTER COLUMN user_id SET NOT NULL;
