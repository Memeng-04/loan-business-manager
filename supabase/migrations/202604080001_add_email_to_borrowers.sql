alter table if exists public.borrowers
add column if not exists email text;
