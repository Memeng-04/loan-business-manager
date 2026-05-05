-- Migration: Add trigger to automatically create user_profile on signup
-- Description: Ensures every auth.user has a corresponding public.user_profile record.

-- 1. Create the function that inserts the profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, legal_full_name, display_name, initial_capital, initial_profit)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), -- Try to get name from auth metadata if it exists
    COALESCE(new.raw_user_meta_data->>'display_name', ''), 
    0, 
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the auth.users table
-- We use a DROP first to ensure idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
