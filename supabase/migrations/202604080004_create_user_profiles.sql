create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  legal_full_name text not null,
  display_name text not null,
  initial_capital numeric(14, 2) not null default 0,
  initial_profit numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_user_profiles_updated_at on public.user_profiles;
create trigger trg_set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute procedure public.set_user_profiles_updated_at();
