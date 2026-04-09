-- ============================================================
-- BORDER AND BRIDGES PVT. LTD. — SUPABASE DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── USERS (staff profiles, linked to Supabase Auth) ──────────
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'Counselor',
  branch text not null default 'Lahore (HQ)',
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ── LEADS ────────────────────────────────────────────────────
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  country text not null default '🇬🇧 UK',
  source text not null default 'Other',
  branch text not null default 'Lahore (HQ)',
  list text not null default 'GCL',
  stage text not null default 'New Enquiry',
  type text not null default 'B2C',
  score integer default 3,
  assigned_to uuid references public.users(id),
  agent_id uuid,
  consultation_done boolean default false,
  agreement_signed boolean default false,
  payment_received boolean default false,
  invoice_generated boolean default false,
  all_doc_received boolean default false,
  ielts_score text,
  intake_target text,
  pending_approval boolean default true,
  approved boolean default false,
  lost boolean default false,
  lost_reason text,
  lost_note text,
  lost_at date,
  lost_by text,
  last_contact date default current_date,
  notes jsonb default '[]'::jsonb,
  docs jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── TASKS ────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  client_name text,
  lead_id uuid references public.leads(id) on delete set null,
  assigned_to uuid references public.users(id),
  due_date date,
  priority text default 'Medium',
  type text default 'Follow-up',
  done boolean default false,
  auto_generated boolean default false,
  created_at timestamptz default now()
);

-- ── INVOICES ─────────────────────────────────────────────────
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete set null,
  client_name text not null,
  service text,
  amount numeric(12,2) not null default 0,
  paid numeric(12,2) not null default 0,
  invoice_date date default current_date,
  due_date date,
  status text default 'Unpaid',
  account_code text default '4100',
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- ── CHART OF ACCOUNTS ────────────────────────────────────────
create table public.accounts (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  type text not null,
  parent_code text,
  is_parent boolean default false,
  opening_balance numeric(12,2) default 0,
  created_at timestamptz default now()
);

-- ── JOURNAL ENTRIES ──────────────────────────────────────────
create table public.journals (
  id uuid primary key default uuid_generate_v4(),
  ref text not null,
  journal_date date not null default current_date,
  narrative text not null,
  lines jsonb not null default '[]'::jsonb,
  posted boolean default true,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- ── BANK TRANSACTIONS ────────────────────────────────────────
create table public.bank_transactions (
  id uuid primary key default uuid_generate_v4(),
  transaction_date date not null,
  description text not null,
  credit numeric(12,2) default 0,
  debit numeric(12,2) default 0,
  balance numeric(12,2) default 0,
  matched boolean default false,
  invoice_id uuid references public.invoices(id) on delete set null,
  created_at timestamptz default now()
);

-- ── WHATSAPP LEADS ───────────────────────────────────────────
create table public.wa_leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  message text,
  branch text default 'Lahore (HQ)',
  assigned_to uuid references public.users(id),
  converted boolean default false,
  lead_id uuid references public.leads(id) on delete set null,
  received_at timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  phone text,
  trigger_event text,
  message text,
  sent_by uuid references public.users(id),
  status text default 'Sent',
  sent_at timestamptz default now()
);

-- ── AUDIT LOG ────────────────────────────────────────────────
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  user_name text,
  action text not null,
  module text,
  created_at timestamptz default now()
);

-- ── AGENTS ───────────────────────────────────────────────────
create table public.agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text,
  contact text,
  email text,
  commission_pct numeric(5,2) default 10,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — data protection
-- ============================================================

alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.accounts enable row level security;
alter table public.journals enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.wa_leads enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;
alter table public.agents enable row level security;

-- Allow authenticated users to read all data in their company
-- (Role-based filtering happens in the app layer)
create policy "Authenticated users can read all" on public.leads
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert" on public.leads
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update" on public.leads
  for update using (auth.role() = 'authenticated');

create policy "Auth read tasks" on public.tasks for select using (auth.role() = 'authenticated');
create policy "Auth insert tasks" on public.tasks for insert with check (auth.role() = 'authenticated');
create policy "Auth update tasks" on public.tasks for update using (auth.role() = 'authenticated');

create policy "Auth read invoices" on public.invoices for select using (auth.role() = 'authenticated');
create policy "Auth insert invoices" on public.invoices for insert with check (auth.role() = 'authenticated');
create policy "Auth update invoices" on public.invoices for update using (auth.role() = 'authenticated');

create policy "Auth read accounts" on public.accounts for all using (auth.role() = 'authenticated');
create policy "Auth read journals" on public.journals for all using (auth.role() = 'authenticated');
create policy "Auth read bank" on public.bank_transactions for all using (auth.role() = 'authenticated');
create policy "Auth read wa" on public.wa_leads for all using (auth.role() = 'authenticated');
create policy "Auth read notifs" on public.notifications for all using (auth.role() = 'authenticated');
create policy "Auth read audit" on public.audit_log for all using (auth.role() = 'authenticated');
create policy "Auth read agents" on public.agents for all using (auth.role() = 'authenticated');
create policy "Auth read users" on public.users for all using (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA — Default Chart of Accounts
-- ============================================================

insert into public.accounts (code, name, type, parent_code, is_parent, opening_balance) values
('1000','Current Assets','Asset',null,true,0),
('1100','Cash in Hand','Asset','1000',false,50000),
('1200','Bank Account','Asset','1000',false,160000),
('1300','Accounts Receivable','Asset','1000',false,25000),
('2000','Current Liabilities','Liability',null,true,0),
('2100','Accounts Payable','Liability','2000',false,8500),
('2200','Agent Commissions Payable','Liability','2000',false,0),
('3000','Owner''s Equity','Equity',null,true,0),
('3100','Share Capital','Equity','3000',false,300000),
('3200','Retained Earnings','Equity','3000',false,0),
('4000','Income','Income',null,true,0),
('4100','Visa Consultancy Fees','Income','4000',false,0),
('4200','Application Processing Fees','Income','4000',false,0),
('4300','Document Attestation Fees','Income','4000',false,0),
('5000','Cost of Services','Expense',null,true,0),
('5100','Visa Filing Fees','Expense','5000',false,0),
('5200','University Application Fees','Expense','5000',false,0),
('6000','Operating Expenses','Expense',null,true,0),
('6100','Staff Costs','Expense','6000',true,0),
('6110','Salaries','Expense','6100',false,0),
('6120','EOBI / Provident Fund','Expense','6100',false,0),
('6200','Premises','Expense','6000',true,0),
('6210','Office Rent','Expense','6200',false,0),
('6220','Utilities & Internet','Expense','6200',false,0),
('6300','Marketing','Expense','6000',true,0),
('6310','Digital Advertising','Expense','6300',false,0),
('6320','Printing & Branding','Expense','6300',false,0),
('6400','Agent Commissions','Expense','6000',false,0),
('6500','Travel & Entertainment','Expense','6000',false,0),
('6600','Professional Fees','Expense','6000',false,0),
('6700','Bank Charges','Expense','6000',false,0);

-- ============================================================
-- SEED DATA — Default Agents
-- ============================================================

insert into public.agents (name, city, contact, email, commission_pct) values
('Ali Brokers', 'Karachi', '+92 300 1112233', 'ali@brokers.com', 10),
('Bright Path', 'Lahore', '+92 321 4445566', 'info@brightpath.pk', 12);

-- ============================================================
-- FUNCTION: auto-update updated_at on leads
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function update_updated_at();

-- ============================================================
-- Done. Your database is ready.
-- ============================================================
