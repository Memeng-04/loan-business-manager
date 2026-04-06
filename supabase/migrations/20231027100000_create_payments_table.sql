-- Create payments table
create table payments (
  id uuid primary key default uuid_generate_v4(),
  loan_id uuid references loans(id) on delete cascade not null,
  amount numeric not null,
  payment_date date not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  -- Add a status for the payment (e.g., 'recorded', 'reversed', 'pending')
  status text default 'recorded' not null
);

-- Indexes for performance
create index payments_loan_id_idx on payments (loan_id);

-- Enable Row Level Security (RLS)
alter table payments enable row level security;

-- Policies for RLS
create policy "Individuals can view their own payments." on payments
  for select using (auth.uid() = (select borrower_id from loans where id = loan_id));

create policy "Individuals can insert their own payments." on payments
  for insert with check (auth.uid() = (select borrower_id from loans where id = loan_id));

-- Optionally, if payments can be updated (e.g., status changes)
-- create policy "Individuals can update their own payments." on payments
--   for update using (auth.uid() = (select borrower_id from loans where id = loan_id));
