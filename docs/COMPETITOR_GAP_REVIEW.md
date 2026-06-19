# Competitor Gap Review — Time & Attendance App

Public research date: 2026-06-19

## Scope covered

### ConstructionClock
- Crawled 54 publicly reachable pages from `constructionclock.com`, including pricing, feature pages, integrations, customer stories, blog articles, privacy policy, and terms.
- Their public help centre at `help.constructionclock.com` currently exposes only a sparse KB shell publicly; detailed app help appears not publicly indexed.
- No public API documentation found.
- No MCP-specific instructions found.

### TimeKeeper
- Crawled 46 marketing/legal pages from `timekeeper.co.uk` including pricing, industries, features, customer stories, privacy, terms, subprocessors, DPA.
- Crawled 80 public help articles/categories from `help.timekeeper.co.uk`, including clock-in, kiosk, facial recognition, rounding rules, approvals, geofences, locations, job scheduling, rota planner, reports, discrepancies and settings.
- No public API developer documentation found, though their terms define API as part of the Services.
- No MCP-specific instructions found.

## Executive takeaways

1. Our current mockup has the right top-level modules: management web GUI, projects/geofences, rota, staff, timesheets, rule-based reporting, simple mobile clock-in/out, and 100+ user positioning.
2. TimeKeeper is the stronger direct UK benchmark. It has a more complete operational feature set: kiosk mode, facial recognition, leave, expenses, multi-level approvals, automatic reminders, discrepancy handling, working patterns, breaks, job/activity costing, documents, and payroll exports.
3. ConstructionClock differentiates with automatic background geofence clock-in/out and “keep phone in pocket” simplicity. That is the strongest gap against our current manually tapped mobile mockup.
4. Greg’s new requirement — track workers during the day and flag when they leave the geolocation zone — goes beyond TimeKeeper’s published geofence behaviour. TimeKeeper’s public docs mainly enforce geofence at clock-in/out and show latest clock-in location; ConstructionClock claims detailed route/location history and automatic come/go records.
5. At 100 users, Greg’s current £7,000/year spend is roughly £5.83/user/month. TimeKeeper Pro is publicly £5/user/month ex VAT (£6,000/year ex VAT, £7,200/year inc VAT). So commercial replacement only makes sense if we own the workflow, avoid per-seat scaling, and integrate with GSD operations rather than merely clone TimeKeeper.

## Competitor capability map

### ConstructionClock public claims

Positioning:
- Construction-focused automatic time tracking.
- Crews are clocked in automatically when they walk into a job site.
- Records every time they come and go.
- Real-time project tracking.
- Payroll export to Payworks, QuickBooks, Xero, XLSX, PDF.
- CompanyCam integration for projects/photos.
- Mobile apps plus full web app.

Pricing shown publicly:
- Solo: $0/user.
- Team: $12 USD/user/month.
- Pro: $18 USD/user/month.
- Team includes unlimited projects, web app, PDF/XLSX reports, QuickBooks, Xero, CompanyCam, free bookkeeper access.
- Pro adds unlimited cloud storage, custom integration support, Pro support.

Notable features:
- Automatic clock-in/out based on project geo-location.
- Project setup by geo-location on map.
- Tasks, notes, photos.
- Work schedules and automatic deductions.
- Labour hours and costs.
- Crew management.
- Customer testimonials emphasise GPS, auto-clock, payroll simplicity, and tracking crews/projects.

Privacy/legal:
- Canadian operator: Roofbundle Incorporated / ConstructionClock, Winnipeg.
- Privacy policy says the app may use detailed location and route information from GPS/mobile signals.
- It says ConstructionClock uses location and route information to create detailed route history of journeys made when using the service.
- Cross-border transfer may occur outside Canada.

Gaps / public opacity:
- Detailed help docs not publicly available from the KB shell.
- No public API docs found.
- No public SOC2/ISO/security page found in crawl.

### TimeKeeper public claims

Positioning:
- UK/Ireland timesheet platform for construction and field service businesses.
- Owned/trading as Artificialdev Ltd, subsidiary/member of Bright Software Group.
- Used by 10,000s of employees; millions of timesheets managed; 4.9+ Capterra claim.

Pricing shown publicly:
- Core: £3.33/employee/month ex VAT when annual.
- Pro: £5/employee/month ex VAT when annual.
- For 100 users: Core ≈ £3,996/year ex VAT / £4,795.20 inc VAT. Pro ≈ £6,000/year ex VAT / £7,200 inc VAT.

Core features listed:
- Time clock kiosk.
- Mobile app clock-in.
- Web browser clock-in.
- Facial recognition.
- See who is in and where.
- Leave management and leave wall calendar.
- Expenses.
- Time requests.
- Rota planner.
- Automatic lateness and absenteeism calculations.
- Alerts and notifications.
- Timesheet calculations.
- Manual timesheet entry.
- Employee and company documents.
- Multi-level timesheet approval.
- GPS clock-in.
- 2FA.

Pro features listed:
- Track time on jobs.
- Geofence job sites.
- Track time on activities.
- Job scheduler.
- Job management.
- Job reporting and costing.
- Job notes/photos/documents/signatures.

Help docs details:
- Mobile clock-in: open app, press clock-in, front camera photo stored with local time; facial recognition can verify employee; GPS location recorded by default; photo/facial/GPS toggles can be switched per business/individual.
- Kiosk mode: shared tablet/mobile near entry/exit; employees use 4-digit PIN; can select job before clock-in; no stated limit on devices.
- Facial recognition: first clock-in photo becomes profile image; later entries compared; violations raised; can be skipped per employee.
- Geofenced jobs: can enforce that employees must be within a distance of the site address to clock in/out; default recommendation at least 100m due to phone GPS variation around 50m; marker can be dragged for accuracy.
- Locations: company/kiosk locations can have optional geoboundary; mobile clock-ins within boundary are associated to location but locations do not block off-site clock-ins; geofenced jobs are required for blocking.
- Who’s In: live report showing who is clocked in across mobile/kiosks; map shows latest GPS clock-in location; refreshes every minute.
- Rota planner: shift workers can be scheduled; drag/drop shifts; breaks; titles/notes; copy shifts/week; publish rota sends push notification to employees.
- Job scheduler: assign employees to jobs/dates; save schedule; mobile push notifies employees; employees see job schedule in mobile app; filters by teams/jobs.
- Rounding rules: extensive rules; count/exclude time before/after scheduled hours; global rounding intervals; split rules; grace periods.
- Breaks: day breaks and flexi-breaks; shift worker breaks can be scheduled/deducted.
- Approvals: up to 3 levels; approval roles; approved timesheets locked; rejection unlocks; email notifications.
- Reports: employee timesheet, staff Excel report, job summary, employee logs, location breakdown, lateness/absence/left early, warnings.
- Discrepancies: highlights forgotten clock-outs and auto clock-outs for investigation.
- Settings: timezone; first day of week; clock entry settings; require photo/facial/GPS/job/geofence; reminders 15 minutes after expected clock-in/out; manager emails; automatic clock-out after configured conditions.

Trust/legal/security:
- Privacy policy and terms are substantial.
- Subprocessors page lists AWS for hosting, Twilio for SMS/password, Google Maps for locations, Opencage for reverse geocoding, Plausible, Senja.io.
- 2FA listed in pricing table.
- DPA and subprocessors published.

Gaps / public opacity:
- No public API docs found.
- No MCP docs found.
- No public deep technical security architecture found beyond privacy/DPA/subprocessors.

## Our current mockup versus competitors

### Strong / already represented
- 100+ user management model.
- Management dashboard.
- Multi-project setup.
- Geo-fence radius cards.
- Rota screen.
- Staff details and current status.
- Timesheet approval queue.
- Rule-based reporting concepts: grace, rounding, overtime, missed clock-out, outside geo-fence, unscheduled attendance.
- Simple mobile staff flow: login, assigned project, clock in/out, hours, timesheets.
- Evidence model for GPS rather than absolute truth.

### Missing or underpowered versus TimeKeeper / ConstructionClock

P0 for Greg replacement:
1. Live during-day location monitoring and leave-zone alerts.
2. Background/mobile app location heartbeat while clocked in, not just clock-in/out GPS stamp.
3. Alert policy: worker leaves geofence while clocked in, no movement/location stale, low accuracy, GPS disabled, battery/location permission revoked.
4. Audit timeline: clock-in, location samples, leave-zone event, return-zone event, clock-out, manager decision.
5. Privacy/consent controls: only track during active shift/clocked-in period; clear worker notice; retention rules.
6. Real manager notifications: push/email/SMS/Telegram-style alerts for off-site exceptions.
7. Real Supabase data model and API for projects, workers, rotas, clock events, geofence events, timesheets.
8. Native/mobile wrapper or PWA with background geolocation strategy.

P1 parity items:
1. Kiosk mode with 4-digit PIN for site tablets.
2. Photo/selfie capture on clock-in/out.
3. Optional facial verification or lighter anti-buddy-clock check.
4. Per-employee access settings: mobile clock-in allowed, web clock-in allowed, GPS required, photo required, job required.
5. Working patterns and shift-worker modes.
6. Break rules: fixed day break, flexi-break after X hours, shift break deduction.
7. Rounding/grace engine with scenario preview.
8. Multi-level approvals and locked approved timesheets.
9. Discrepancy handling: missed clock-out, auto clock-out, forgotten clock-in/out reminders.
10. Lateness/absence/left-early reporting.
11. Employee documents and company documents.
12. Leave/holiday requests and wall calendar.
13. Expenses/mileage/allowances.
14. Job/activity tracking under projects.
15. Job notes/photos/signatures.
16. Payroll exports and accounting mappings.
17. 2FA and role permissions.
18. Subprocessor/privacy pages for internal rollout.

P2 nice-to-have / commercial differentiators:
1. CompanyCam-style photo/project integration, or GSD evidence folder integration.
2. Custom report builder with saved report packs.
3. Cost code/trade/package split for construction commercial reporting.
4. Supervisor daily sign-off packs.
5. “Entitlement evidence” export: where people were, when, under which project/package, approved by whom.
6. Offline-first mobile clock events with later sync and conflict handling.
7. Route/travel mode if needed, but high privacy risk; better for GSD to avoid unless essential.

## Recommended product stance for GSD

Do not clone TimeKeeper feature-for-feature first. Build a GSD-owned replacement around the exact spend-killing workflow:

1. Workers see only today’s rota, project, clock in/out, hours, timesheets.
2. Managers see live attendance board by project and exception queue.
3. System tracks location only while clocked in / scheduled and flags leave-zone events.
4. Timesheet approval converts evidence into payable hours.
5. Reports export payroll pack, project labour pack, exceptions pack, and geofence breach pack.

ConstructionClock’s “automatic clock-in/out” is attractive but risky for first release because iOS/Android background geolocation is harder to make reliable and privacy-safe. The safer MVP is manual clock-in/out + background check-ins while clocked in + leave-zone alerts. Then add optional auto clock-out/auto exceptions.

## Build priorities for next lane

### Lane 1 — Real MVP foundation
- Supabase auth/roles.
- Tables: companies, users, staff profiles, projects, geofences, rota shifts, clock events, location samples, geofence events, timesheets, approvals, rules, notifications.
- Web manager CRUD for projects/geofences/staff/rotas.
- Mobile PWA clock-in/out backed by DB.
- Store GPS coordinate, accuracy, source, permission state, device timestamp and server timestamp.

### Lane 2 — Location monitoring
- While clocked in, mobile sends heartbeat every N minutes or on significant movement.
- Server computes inside/outside using geofence radius + accuracy buffer.
- Generate event only on state changes: inside -> outside, outside -> inside, stale/no signal.
- Manager alert rules: after outside for X minutes, after missing samples for Y minutes, after GPS disabled.
- Keep GPS evidence, not truth: accuracy and confidence always displayed.

### Lane 3 — Timesheet/rules/reporting parity
- Rounding/grace/break/overtime engine.
- Discrepancy queue.
- Multi-level approval locks.
- CSV/XLSX exports.
- Lateness/absence/left-early reports.

### Lane 4 — On-site alternatives
- Kiosk mode with PIN.
- Selfie capture.
- Optional face comparison later.
- Offline queue.

## Specific data model additions needed beyond current draft

Add:
- `locations_samples`: worker_id, project_id, shift_id, lat, lng, accuracy_m, captured_at_device, received_at_server, source, battery_state, permission_state.
- `geofence_events`: worker_id, project_id, shift_id, event_type (`entered`, `exited`, `stale`, `gps_disabled`, `low_accuracy`), distance_from_fence_m, accuracy_m, started_at, ended_at, severity, manager_status.
- `device_sessions`: worker_id, device_id, platform, app_version, push_token, last_seen_at, permission_status.
- `notification_events`: target_role/user, channel, event_type, payload, sent_at, acknowledged_at.
- `approval_steps`: timesheet_id, level, approver_role, approver_id, decision, decided_at, reason.
- `pay_rules`: rounding, grace, break, overtime, unpaid/paid policies.
- `export_runs`: report type, filters, generated file, generated_by, generated_at.

## Bottom line

The mockup is directionally right, but to beat Greg’s current £7k/year system we must prioritise live location evidence, leave-zone alerts, manager exception handling, and payroll-ready rule/report exports before secondary HR features like expenses/documents/leave.
