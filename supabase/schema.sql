-- ============================================================
-- Scorna Client Dashboard — database schema
-- Run this in the Supabase SQL editor.
-- Note: team_members is created BEFORE leads/appointments because
-- those tables reference it via foreign key.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  industry text,
  owner_email text
);

-- Users (extends auth.users)
create table users (
  id uuid references auth.users primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete set null,
  role text check (role in ('admin', 'client')) default 'client',
  full_name text,
  email text
);

-- Team members (defined before leads/appointments that reference it)
create table team_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  full_name text not null,
  role text,
  status text check (status in ('active','off')) default 'active',
  initials text,
  color text default '#7B0D0D'
);

-- Leads
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  name text not null,
  service text,
  status text check (status in ('new','contacted','qualified','closed','lost')) default 'new',
  source text,
  notes text,
  estimated_value numeric,
  next_action text,
  next_action_date date,
  assigned_staff uuid references team_members(id) on delete set null
);

-- Lead activity log
create table lead_activity (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  type text check (type in ('status_change','note','call','email','sms','appointment')) not null,
  content text,
  from_status text,
  to_status text,
  created_by uuid references users(id) on delete set null
);

-- Appointments
create table appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete set null,
  client_name text not null,
  service text,
  staff_id uuid references team_members(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text check (status in ('confirmed','pending','cancelled')) default 'confirmed',
  notes text,
  is_recurring boolean default false,
  recurrence_rule text,
  recurrence_end date
);

-- Blog posts
create table blog_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  title text not null,
  slug text,
  status text check (status in ('published','scheduled','draft')) default 'draft',
  publish_date date,
  content text,
  excerpt text,
  meta_title text,
  meta_description text
);

-- Content schedule
create table content_schedule (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  week_start date not null,
  day_of_week text check (day_of_week in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')) not null,
  content_type text,
  status text check (status in ('published','scheduled','draft','approved')) default 'draft',
  caption text,
  platform text,
  scheduled_time timestamptz
);

-- Ad metrics
create table ad_metrics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  platform text check (platform in ('Meta','Google')) not null,
  impressions integer default 0,
  clicks integer default 0,
  spend numeric default 0,
  conversions integer default 0,
  recorded_date date not null
);

-- Reviews
create table reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  reviewer_name text,
  rating integer check (rating between 1 and 5),
  review_text text,
  platform text default 'Google',
  review_date date,
  responded boolean default false
);

-- Notifications
create table notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  read boolean default false,
  link_page text,
  link_id uuid
);

-- Indexes
create index on leads(client_id, status);
create index on leads(client_id, created_at desc);
create index on lead_activity(lead_id, created_at desc);
create index on appointments(client_id, start_time);
create index on appointments(staff_id);
create index on blog_posts(client_id, status);
create index on content_schedule(client_id, week_start);
create index on ad_metrics(client_id, platform, recorded_date desc);
create index on reviews(client_id, created_at desc);
create index on notifications(client_id, read, created_at desc);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger leads_updated_at before update on leads
  for each row execute function update_updated_at();
create trigger blog_posts_updated_at before update on blog_posts
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table clients enable row level security;
alter table users enable row level security;
alter table leads enable row level security;
alter table lead_activity enable row level security;
alter table team_members enable row level security;
alter table appointments enable row level security;
alter table blog_posts enable row level security;
alter table content_schedule enable row level security;
alter table ad_metrics enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;

-- Helper function: get current user's client_id
create or replace function get_my_client_id()
returns uuid as $$
  select client_id from users where id = auth.uid();
$$ language sql security definer;

-- Helper function: get current user's role
create or replace function get_my_role()
returns text as $$
  select role from users where id = auth.uid();
$$ language sql security definer;

-- RLS Policies: admin sees all, client sees own
create policy "admin_all" on clients for all using (get_my_role() = 'admin');
create policy "client_own" on clients for select using (id = get_my_client_id());

create policy "admin_all" on users for all using (get_my_role() = 'admin');
create policy "client_own" on users for select using (client_id = get_my_client_id());

-- Apply the same pattern to all data tables
do $$ declare t text; begin
  foreach t in array array['leads','lead_activity','team_members','appointments',
    'blog_posts','content_schedule','ad_metrics','reviews','notifications']
  loop
    execute format('create policy "admin_all" on %I for all using (get_my_role() = ''admin'')', t);
    execute format('create policy "client_own" on %I for all using (client_id = get_my_client_id())', t);
  end loop;
end $$;

-- ───────────────────────────────────────────────────────────────────
-- Public lead capture (marketing site contact form).
-- Unauthenticated visitors can INSERT a booking request; only admins
-- can read/manage them. No client_id — these are inbound prospects for
-- Scorna itself, triaged into clients/leads after a discovery call.
-- ───────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  business_name     text,
  business_type     text,
  email             text not null,
  phone             text,
  marketing_spend   text,
  biggest_challenge text,
  preferred_time    text,
  status            text default 'New',
  notes             text default '',
  created_at        timestamptz default now()
);

alter table bookings enable row level security;

-- Anyone (anon role) may submit a request…
create policy "public_insert" on bookings
  for insert to anon, authenticated with check (true);
-- …but only admins may read or manage them.
create policy "admin_read" on bookings
  for select using (get_my_role() = 'admin');
create policy "admin_manage" on bookings
  for all using (get_my_role() = 'admin');
