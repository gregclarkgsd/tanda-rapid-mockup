# Staff database backend schema sketch

This is the backend lane for turning the static staff mockup into the production staff database.

```sql
create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  employment_status text not null check (employment_status in ('active', 'inactive', 'leaver')),
  payroll_id text unique,
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_contacts (
  staff_id uuid primary key references staff_profiles(id) on delete cascade,
  mobile text not null,
  email text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  updated_at timestamptz not null default now()
);

create table staff_skills (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  tag text not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (staff_id, tag)
);

create table training_certificates (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  certificate_name text not null,
  certificate_no text,
  status text not null check (status in ('missing', 'pending', 'verified')),
  expires_on date,
  file_path text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_notes (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  author_id uuid,
  visibility text not null check (visibility in ('manager', 'payroll', 'agent')),
  body text not null,
  created_at timestamptz not null default now()
);

create table agent_staff_tasks (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  task_type text not null,
  priority text not null check (priority in ('blocker', 'high', 'medium', 'low')),
  status text not null default 'detected' check (status in ('detected', 'drafted', 'review_required', 'approved', 'executed', 'closed', 'dismissed')),
  due_on date,
  instruction text not null,
  source_record_id uuid,
  created_by_agent text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agent_action_audit (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references agent_staff_tasks(id),
  actor_type text not null check (actor_type in ('agent', 'human', 'system')),
  actor_ref text not null,
  action text not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);
```

## Reminder logic

- Expired or missing mandatory certificates: create `blocker` agent task.
- Expiring within 14 days: create `high` task.
- Expiring within 30 days: create `medium` task.
- Reminders are drafts until a manager approves sending.
- Rota blocking is a proposed restriction until a manager approves.
