-- SiteClock Pro lane SITECLOCK-BACKEND-SPINE-1
-- Additive Supabase schema for the MVP backend spine. Do not apply to a live DB without owner approval.

create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete restrict,
  auth_user_id uuid unique,
  full_name text not null,
  email text,
  role text not null check (role in ('admin', 'manager', 'payroll', 'staff', 'agent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  full_name text not null,
  role text not null,
  employment_status text not null check (employment_status in ('active', 'inactive', 'leaver')),
  payroll_id text,
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, payroll_id)
);

create table if not exists staff_contacts (
  staff_id uuid primary key references staff_profiles(id) on delete cascade,
  mobile text not null,
  email text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  updated_at timestamptz not null default now()
);

create table if not exists staff_skills (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  tag text not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (staff_id, tag)
);

create table if not exists training_certificates (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  certificate_name text not null,
  certificate_no text,
  status text not null check (status in ('missing', 'pending', 'verified')),
  expires_on date,
  file_path text,
  verified_by uuid references profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff_notes (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  author_name text,
  visibility text not null check (visibility in ('manager', 'payroll', 'agent')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  code text not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'complete', 'archived')),
  supervisor_profile_id uuid references profiles(id) on delete set null,
  supervisor_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create table if not exists project_sites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists geofences (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references project_sites(id) on delete cascade,
  fence_type text not null default 'radius' check (fence_type in ('radius', 'polygon')),
  center_lat double precision,
  center_lng double precision,
  radius_m integer,
  polygon_json jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (fence_type = 'radius' and center_lat is not null and center_lng is not null and radius_m is not null and radius_m > 0)
    or (fence_type = 'polygon' and polygon_json is not null)
  )
);

create table if not exists rotas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  week_start date not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'locked')),
  created_by uuid references profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, week_start)
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  rota_id uuid not null references rotas(id) on delete cascade,
  staff_id uuid not null references staff_profiles(id) on delete restrict,
  project_id uuid not null references projects(id) on delete restrict,
  site_id uuid references project_sites(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  break_minutes integer not null default 30,
  status text not null default 'scheduled' check (status in ('scheduled', 'changed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists clock_events (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete restrict,
  shift_id uuid references shifts(id) on delete set null,
  project_id uuid references projects(id) on delete restrict,
  site_id uuid references project_sites(id) on delete restrict,
  event_type text not null check (event_type in ('clock_in', 'clock_out', 'break_start', 'break_end')),
  occurred_at timestamptz not null,
  source text not null default 'web' check (source in ('web', 'kiosk', 'admin')),
  lat double precision,
  lng double precision,
  accuracy_m numeric,
  geofence_state text check (geofence_state in ('inside', 'outside', 'low_accuracy', 'gps_disabled', 'unknown')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists location_samples (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete restrict,
  clock_event_id uuid references clock_events(id) on delete set null,
  shift_id uuid references shifts(id) on delete set null,
  project_id uuid references projects(id) on delete restrict,
  site_id uuid references project_sites(id) on delete restrict,
  captured_at timestamptz not null,
  lat double precision not null,
  lng double precision not null,
  accuracy_m numeric not null,
  permission text not null check (permission in ('granted', 'denied', 'prompt', 'unavailable')),
  battery numeric,
  distance_from_fence_m integer,
  presence_state text check (presence_state in ('inside', 'outside', 'low_accuracy', 'gps_disabled')),
  created_at timestamptz not null default now()
);

create table if not exists timesheets (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete restrict,
  shift_id uuid references shifts(id) on delete set null,
  work_date date not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'rejected', 'locked')),
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  payable_minutes integer,
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamptz,
  approval_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists timesheet_exceptions (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  exception_type text not null check (exception_type in ('late', 'missing_clock', 'leave_zone', 'stale_gps', 'low_accuracy', 'manual_review')),
  severity text not null check (severity in ('info', 'warning', 'high', 'blocker')),
  detail text not null,
  evidence_json jsonb,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz
);

create table if not exists agent_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  staff_id uuid references staff_profiles(id) on delete cascade,
  task_type text not null,
  priority text not null check (priority in ('blocker', 'high', 'medium', 'low')),
  status text not null default 'detected' check (status in ('detected', 'drafted', 'review_required', 'approved', 'executed', 'closed', 'dismissed')),
  due_on date,
  instruction text not null,
  source_table text,
  source_record_id uuid,
  created_by_agent text,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete restrict,
  actor_type text not null check (actor_type in ('human', 'agent', 'system')),
  actor_id uuid references profiles(id) on delete set null,
  actor_ref text not null,
  action text not null,
  target_table text,
  target_id uuid,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_profiles_company on staff_profiles(company_id);
create index if not exists idx_training_certificates_staff on training_certificates(staff_id);
create index if not exists idx_staff_notes_staff_created on staff_notes(staff_id, created_at desc);
create index if not exists idx_projects_company on projects(company_id);
create index if not exists idx_shifts_staff_starts on shifts(staff_id, starts_at);
create index if not exists idx_clock_events_staff_occurred on clock_events(staff_id, occurred_at desc);
create index if not exists idx_location_samples_staff_captured on location_samples(staff_id, captured_at desc);
create index if not exists idx_timesheets_staff_date on timesheets(staff_id, work_date desc);
create index if not exists idx_agent_tasks_status_priority on agent_tasks(status, priority);
create index if not exists idx_audit_log_target on audit_log(target_table, target_id);
