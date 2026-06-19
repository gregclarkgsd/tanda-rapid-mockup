-- Draft Supabase schema for SiteClock Pro / TANDA rapid mockup.
-- Intended as a starting point, not yet applied to production.

create extension if not exists "pgcrypto";

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('owner','manager','supervisor','staff')),
  created_at timestamptz not null default now()
);

create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  employee_ref text,
  trade text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  code text not null,
  name text not null,
  address text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(company_id, code)
);

create table project_geo_fences (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  radius_m integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  staff_profile_id uuid not null references staff_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table clock_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  staff_profile_id uuid not null references staff_profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  shift_id uuid references shifts(id) on delete set null,
  event_type text not null check (event_type in ('clock_in','clock_out','break_start','break_end')),
  captured_at timestamptz not null default now(),
  latitude numeric(10,7),
  longitude numeric(10,7),
  gps_accuracy_m integer,
  inside_geo_fence boolean,
  distance_from_fence_m integer,
  device_label text,
  source text not null default 'mobile'
);

create table timesheets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  staff_profile_id uuid not null references staff_profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft','submitted','approved','rejected','exported')),
  approved_by uuid references users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table timesheet_lines (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  project_id uuid not null references projects(id),
  work_date date not null,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  payable_minutes integer,
  raw_minutes integer,
  status text not null default 'pending',
  notes text
);

create table attendance_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  rule_type text not null,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table attendance_exceptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  staff_profile_id uuid not null references staff_profiles(id) on delete cascade,
  project_id uuid references projects(id),
  clock_event_id uuid references clock_events(id),
  shift_id uuid references shifts(id),
  exception_type text not null,
  severity text not null default 'medium',
  status text not null default 'open' check (status in ('open','approved','rejected','resolved')),
  manager_note text,
  resolved_by uuid references users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  actor_user_id uuid references users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
