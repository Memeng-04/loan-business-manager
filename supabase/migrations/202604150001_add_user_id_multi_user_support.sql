-- Migration: Add user_id columns for multi-user support
-- Created: 2026-04-15
-- This migration enables multi-user data isolation with RLS

-- 1. Add user_id to borrowers table
ALTER TABLE borrowers ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE borrowers ADD CONSTRAINT fk_borrowers_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_borrowers_user_id ON borrowers(user_id);

-- 2. Add user_id to loans table
ALTER TABLE loans ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE loans ADD CONSTRAINT fk_loans_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_loans_user_id ON loans(user_id);

-- 3. Add user_id to payments table
ALTER TABLE payments ADD COLUMN user_id UUID DEFAULT auth.uid();
ALTER TABLE payments ADD CONSTRAINT fk_payments_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- 4. Enable Row Level Security
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for borrowers
CREATE POLICY "Users can view own borrowers" ON borrowers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own borrowers" ON borrowers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own borrowers" ON borrowers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own borrowers" ON borrowers
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS Policies for loans
CREATE POLICY "Users can view own loans" ON loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans" ON loans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans" ON loans
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS Policies for payment_schedules
-- payment_schedules should be accessible only through loan's user_id
ALTER TABLE payment_schedules ADD COLUMN user_id UUID;

CREATE POLICY "Users can view own payment schedules" ON payment_schedules
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can insert own payment schedules" ON payment_schedules
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payment schedules" ON payment_schedules
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own payment schedules" ON payment_schedules
  FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_payment_schedules_user_id ON payment_schedules(user_id);
