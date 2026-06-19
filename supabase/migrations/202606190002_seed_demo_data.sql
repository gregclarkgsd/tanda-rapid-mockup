-- SiteClock Pro demo seed data for local Supabase review.
-- Uses fictional/redacted contacts and stable UUIDs from the static mockup.

insert into companies (id, name, slug)
values ('00000000-0000-4000-8000-000000000001', 'GSD Demo Company', 'gsd-demo')
on conflict (slug) do nothing;

insert into profiles (id, company_id, full_name, email, role)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Nina Brooks', 'nina.brooks@gsd.example', 'manager'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Aaron Patel', 'aaron.patel@gsd.example', 'manager')
on conflict (id) do nothing;

insert into staff_profiles (id, company_id, full_name, role, employment_status, payroll_id, start_date)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Aaron Patel', 'Supervisor', 'active', 'GSD-001', '2022-04-01'),
  ('10000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'Mia O’Connor', 'Painter', 'active', 'GSD-014', '2024-02-12'),
  ('10000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000001', 'Lewis Grant', 'Dryliner', 'active', 'GSD-028', '2023-09-04')
on conflict (company_id, payroll_id) do nothing;

insert into staff_contacts (staff_id, mobile, email, address, emergency_contact_name, emergency_contact_phone)
values
  ('10000000-0000-4000-8000-000000000001', '07700 900101', 'aaron.patel@gsd.example', 'East London', 'Priya Patel', '07700 900199'),
  ('10000000-0000-4000-8000-000000000014', '07700 900102', 'mia.oconnor@gsd.example', null, 'Sean O’Connor', '07700 900198'),
  ('10000000-0000-4000-8000-000000000028', '07700 900103', 'lewis.grant@gsd.example', null, 'Hannah Grant', '07700 900197')
on conflict (staff_id) do nothing;

insert into staff_skills (staff_id, tag)
values
  ('10000000-0000-4000-8000-000000000001', 'SSSTS'),
  ('10000000-0000-4000-8000-000000000001', 'Painter'),
  ('10000000-0000-4000-8000-000000000001', 'First Aid'),
  ('10000000-0000-4000-8000-000000000001', 'Key holder'),
  ('10000000-0000-4000-8000-000000000014', 'Painter'),
  ('10000000-0000-4000-8000-000000000014', 'Sprayer'),
  ('10000000-0000-4000-8000-000000000014', 'MEWP'),
  ('10000000-0000-4000-8000-000000000028', 'Drylining'),
  ('10000000-0000-4000-8000-000000000028', 'Fire stopping'),
  ('10000000-0000-4000-8000-000000000028', 'Supervisor cover')
on conflict (staff_id, tag) do nothing;

insert into training_certificates (id, staff_id, certificate_name, certificate_no, status, expires_on)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'CSCS Card', 'CSCS-7788', 'verified', '2026-06-29'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Asbestos Awareness', 'AA-9912', 'verified', '2026-06-10'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'First Aid', 'FA-2041', 'verified', '2026-09-30'),
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000014', 'CSCS Card', 'CSCS-3341', 'verified', '2026-07-15'),
  ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000014', 'MEWP/IPAF', 'IPAF-1299', 'verified', '2026-06-23'),
  ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000028', 'CSCS Card', 'CSCS-4418', 'verified', '2027-01-10'),
  ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000028', 'Fire Stopping', null, 'missing', null)
on conflict (id) do nothing;

insert into staff_notes (id, staff_id, author_id, author_name, visibility, body, created_at)
values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'Nina Brooks', 'manager', 'Strong supervisor for live geofence exception reviews.', '2026-06-01T10:00:00Z'),
  ('30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000102', 'Aaron Patel', 'manager', 'Available for weekend snagging if rota published early.', '2026-05-20T09:15:00Z'),
  ('30000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000028', null, 'System', 'agent', 'Leave-zone event requires manager decision before payroll lock.', '2026-06-18T14:20:00Z')
on conflict (id) do nothing;

insert into projects (id, company_id, code, name, status, supervisor_name)
values
  ('40000000-0000-4000-8000-000000000184', '00000000-0000-4000-8000-000000000001', 'CW-184', 'Canary Wharf Fit-Out', 'active', 'Aaron Patel'),
  ('40000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000001', 'MYB-042', 'Marylebone Hotel', 'active', 'Nina Brooks'),
  ('40000000-0000-4000-8000-000000000319', '00000000-0000-4000-8000-000000000001', 'BAT-319', 'Battersea Phase 3', 'active', 'Chris Morgan'),
  ('40000000-0000-4000-8000-000000000077', '00000000-0000-4000-8000-000000000001', 'KX-077', 'King’s Cross Labs', 'active', 'Fatima Khan')
on conflict (company_id, code) do nothing;

insert into project_sites (id, project_id, name, address, lat, lng)
values
  ('50000000-0000-4000-8000-000000000184', '40000000-0000-4000-8000-000000000184', 'Canary Wharf Fit-Out', 'Upper Bank Street, London E14', 51.5055, -0.0235),
  ('50000000-0000-4000-8000-000000000042', '40000000-0000-4000-8000-000000000042', 'Marylebone Hotel', 'Marylebone Road, London NW1', 51.5226, -0.1627),
  ('50000000-0000-4000-8000-000000000319', '40000000-0000-4000-8000-000000000319', 'Battersea Phase 3', 'Nine Elms Lane, London SW11', 51.4821, -0.1449),
  ('50000000-0000-4000-8000-000000000077', '40000000-0000-4000-8000-000000000077', 'King’s Cross Labs', 'Pancras Square, London N1C', 51.5352, -0.1257)
on conflict (id) do nothing;

insert into geofences (id, site_id, fence_type, center_lat, center_lng, radius_m)
values
  ('60000000-0000-4000-8000-000000000184', '50000000-0000-4000-8000-000000000184', 'radius', 51.5055, -0.0235, 125),
  ('60000000-0000-4000-8000-000000000042', '50000000-0000-4000-8000-000000000042', 'radius', 51.5226, -0.1627, 90),
  ('60000000-0000-4000-8000-000000000319', '50000000-0000-4000-8000-000000000319', 'radius', 51.4821, -0.1449, 160),
  ('60000000-0000-4000-8000-000000000077', '50000000-0000-4000-8000-000000000077', 'radius', 51.5352, -0.1257, 110)
on conflict (id) do nothing;

insert into rotas (id, company_id, week_start, status, created_by, published_at)
values ('70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '2026-06-15', 'published', '00000000-0000-4000-8000-000000000101', '2026-06-12T16:00:00Z')
on conflict (company_id, week_start) do nothing;

insert into shifts (id, rota_id, staff_id, project_id, site_id, starts_at, ends_at, break_minutes)
values
  ('80000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000184', '50000000-0000-4000-8000-000000000184', '2026-06-19T08:00:00+01:00', '2026-06-19T17:00:00+01:00', 30),
  ('80000000-0000-4000-8000-000000000014', '70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000014', '40000000-0000-4000-8000-000000000042', '50000000-0000-4000-8000-000000000042', '2026-06-19T08:00:00+01:00', '2026-06-19T17:00:00+01:00', 30),
  ('80000000-0000-4000-8000-000000000028', '70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000028', '40000000-0000-4000-8000-000000000319', '50000000-0000-4000-8000-000000000319', '2026-06-19T08:00:00+01:00', '2026-06-19T17:00:00+01:00', 30)
on conflict (id) do nothing;

insert into agent_tasks (id, company_id, staff_id, task_type, priority, status, due_on, instruction, source_table, source_record_id, created_by_agent)
values
  ('90000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'training_expired', 'blocker', 'detected', '2026-06-10', 'Aaron Patel’s Asbestos Awareness expired. Draft reminder only; human approval required before any message or rota action.', 'training_certificates', '20000000-0000-4000-8000-000000000002', 'seed-demo'),
  ('90000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000014', 'training_expiring', 'high', 'detected', '2026-06-23', 'Mia O’Connor’s MEWP/IPAF expires soon. Draft reminder only; human approval required before any message.', 'training_certificates', '20000000-0000-4000-8000-000000000015', 'seed-demo'),
  ('90000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000028', 'training_missing', 'blocker', 'detected', null, 'Lewis Grant is missing Fire Stopping. Prepare manager review; do not remove from live work automatically.', 'training_certificates', '20000000-0000-4000-8000-000000000029', 'seed-demo')
on conflict (id) do nothing;
