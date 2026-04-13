-- supabase/migrations/202604140001_add_payment_allocation_columns.sql
-- Add columns for payment allocation (US-11: Auto Allocation Edge Function)

-- Add allocation columns
ALTER TABLE payments 
ADD COLUMN interest_portion NUMERIC DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN principal_portion NUMERIC DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL;

ALTER TABLE payments 
ADD COLUMN remaining_balance NUMERIC DEFAULT 0;

-- Add index for schedule_id lookups
CREATE INDEX payments_schedule_id_idx ON payments (schedule_id);

-- Update RLS policies to include admin access for edge functions
-- (Edge functions run with service role, so they bypass RLS)
