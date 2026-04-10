-- ============================================================
-- BnB CRM — ADDITIONAL SCHEMA (run after main schema)
-- Adds: subsidiary ledgers, settings, control accounts
-- ============================================================

-- ── SETTINGS ─────────────────────────────────────────────────
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  updated_at timestamptz default now()
);

-- Insert default settings
insert into public.settings (key, value) values
('company_name', 'Border and Bridges Pvt. Ltd.'),
('company_tagline', 'Immigration and Legal Consultants'),
('company_address', 'Lahore, Pakistan'),
('company_phone', '+92 300 0000000'),
('company_email', 'info@borderandbridges.pk'),
('company_website', 'www.borderandbridges.pk'),
('financial_year_start', '2025-07-01'),
('financial_year_end', '2026-06-30'),
('currency', 'PKR'),
('whatsapp_number', ''),
('whatsapp_api_key', ''),
('ntn_number', ''),
('secp_number', '')
on conflict (key) do nothing;

-- ── SUBSIDIARY LEDGER ACCOUNTS (individual debtors/creditors) ──
create table if not exists public.sub_accounts (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  type text not null, -- 'Debtor' or 'Creditor'
  control_account text not null, -- '1300' for debtors, '2100' for creditors
  phone text,
  email text,
  address text,
  opening_balance numeric(12,2) default 0,
  active boolean default true,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz default now()
);

-- ── JOURNAL LINES (detailed, linked to sub accounts) ──────────
-- Extend journals table to support sub_account_id per line
-- We store this inside the existing journals.lines jsonb
-- Each line can have: { account, sub_account_id, sub_account_name, dr, cr }

-- ── ENABLE RLS ────────────────────────────────────────────────
alter table public.settings enable row level security;
alter table public.sub_accounts enable row level security;

create policy "Auth read settings" on public.settings
  for all using (auth.role() = 'authenticated');

create policy "Auth read sub_accounts" on public.sub_accounts
  for all using (auth.role() = 'authenticated');

-- ── ADD BRANCHES TABLE ────────────────────────────────────────
create table if not exists public.branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  city text,
  address text,
  phone text,
  manager_id uuid references public.users(id),
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.branches enable row level security;
create policy "Auth read branches" on public.branches
  for all using (auth.role() = 'authenticated');

insert into public.branches (name, city) values
('Lahore (HQ)', 'Lahore'),
('Karachi', 'Karachi'),
('Islamabad', 'Islamabad')
on conflict (name) do nothing;

-- ── DONE ──────────────────────────────────────────────────────
