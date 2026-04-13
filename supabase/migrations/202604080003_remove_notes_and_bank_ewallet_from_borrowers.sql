alter table if exists public.borrowers
  drop column if exists notes,
  drop column if exists bank_ewallet_details;
