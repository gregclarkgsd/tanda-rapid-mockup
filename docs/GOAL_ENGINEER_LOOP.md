# SiteClock Pro goal + engineer loop

This is the control packet for turning the current SiteClock Pro clickable mockup into a real MVP without letting agents drift into a giant rewrite.

## North-star goal

Build a GSD-owned time and attendance platform that can replace the current circa £7k/year system for 100+ staff:

- Web management GUI for managers/admin/payroll.
- Very simple staff mobile clock-in/out flow.
- Multiple projects and geofenced sites.
- Rota/scheduling and project assignment.
- Rule-based attendance/timesheet reporting.
- Staff database with contacts, skills, notes, certificate expiries, and evidence.
- Custom reports and payroll-ready exports.
- Agent-safe reminder/chase workflows gated by human approval.

## Operating principle

Do not build this as one large autonomous sprint.

Use short lanes with this loop:

1. **Goal** — one outcome, one lane, one bounded slice.
2. **Engineer** — Codex implements using strict TDD.
3. **Verifier** — separate review checks spec compliance, tests, scope, and security.
4. **Controller** — Hermes/Greg decides merge, rework, or park.
5. **Ratchet** — every lane leaves durable tests, docs, schema, or audit guardrails.

No lane is complete because an agent says it is complete. It is complete only when verified with real commands and, for UI changes, visual proof.

## Agent roles

### Greg

- Product owner and approval authority.
- Decides commercial workflow and UX acceptance.
- Approves any live credentials, deployments, migrations, payroll exports, email/SMS sends, or native app account setup.

### Hermes/controller

- Holds product scope and memory.
- Writes the exact `/goal` and engineer packets.
- Verifies branch, diff, tests, build, CI, and deployment claims.
- Stops duplicate or drifting lanes.
- Produces merge/rework/park decision.

### Codex/engineer

- Implements one bounded lane from a fresh branch/worktree.
- Must follow strict TDD: failing test first, then implementation.
- Opens PR or reports patch with real command output.
- Does not self-certify merge readiness.
- Does not start follow-on lanes.

### Claude/design/workflow QA

- Optional reviewer for product/design/workflow quality.
- Read-only unless explicitly asked to implement.
- Produces scope traps and follow-up engineer packet.

## Permanent build fences

- No secrets committed.
- No payroll/time edits without audit.
- No autonomous message sending.
- No certificate verification without human approval.
- No deleting clock events, GPS samples, notes, certificates, or audit records.
- No native app claim until installed/tested app proof exists.
- No live DB migration without explicit approval.
- No broad rewrite/redesign unless Greg opens that lane.
- Unknown data renders as `—`, not fake zero or guessed values.

## MVP lane sequence

### LANE 0 — repo and runtime guard

Outcome: prove the current repo is clean and commands pass before backend work starts.

Verification:

```bash
git status --short --branch
npm test
npm run lint
npm run build
```

### LANE 1 — backend spine

Outcome: Supabase-ready app foundation without changing the visual product.

Build:

- Supabase client setup via env vars.
- Local env docs with redacted examples only.
- Migration files for core tables.
- Seed/demo data matching the mockup.
- Repository/service layer for staff and project/geofence reads.
- Loading/error states where needed.

Acceptance:

- Current mockup still renders.
- At least one data path is backend-ready behind a service/repository interface.
- Tests cover mapping/fallback behavior.
- No secrets committed.

### LANE 2 — staff database live

Outcome: management can create and maintain real staff records.

Build:

- Staff profile CRUD.
- Contacts and emergency contacts.
- Skills/tags.
- Certificates and expiry status.
- Notes with visibility labels.
- Agent task queue for missing/expired data, approval-gated.

Acceptance:

- Staff data persists.
- Certificate expiry logic is tested.
- All edits are auditable.
- Agents only draft tasks; humans approve actions.

### LANE 3 — projects, sites, geofences

Outcome: management can set up multiple projects and geofenced sites.

Build:

- Project CRUD.
- Site CRUD.
- Radius geofence first; polygon later.
- Staff/project assignment.
- Geofence validation helpers.

Acceptance:

- Multiple projects/sites supported.
- Staff mobile project list can be derived from rota/assignment.
- Geofence tests cover inside/outside/low accuracy.

### LANE 4 — rota and scheduling

Outcome: staff mobile flow is driven by assigned rota, not free-form project picking.

Build:

- Rota and shift tables/services.
- Manager rota screen.
- Staff sees today's assigned project/site.
- Conflict/gap flags.

Acceptance:

- Staff can only choose projects/sites they are assigned to for the shift.
- Manager can see coverage gaps.

### LANE 5 — mobile web clock-in/out MVP

Outcome: simple staff mobile web flow works end to end.

Build:

- Staff login/session guard.
- Today's shift view.
- Clock in/out buttons.
- GPS capture with accuracy.
- Clock event storage.
- Manager live status board.

Acceptance:

- Staff can clock in/out on mobile browser.
- Outside geofence/low accuracy/GPS unavailable are flagged.
- Tracking stops after clock out.

### LANE 6 — geofence heartbeat and exceptions

Outcome: manager can see likely site-leave and stale-location exceptions.

Build:

- Location sample heartbeat while clocked in.
- Stale sample detection.
- Outside geofence exception timeline.
- Manager exception review.

Acceptance:

- Exceptions are evidence records, not silent payroll edits.
- Low accuracy is separate from confirmed outside-site.

### LANE 7 — timesheets and approvals

Outcome: clock events generate approvable timesheets.

Build:

- Daily/weekly timesheet generation.
- Exception flags.
- Manager approve/reject/edit-with-reason.
- Audit trail.

Acceptance:

- Weekly timesheet can be approved.
- Any edit has reason and audit.
- Raw clock/GPS evidence is preserved.

### LANE 8 — rules and custom reporting

Outcome: management gets usable attendance reporting and payroll export.

Build:

- Attendance rules: grace, rounding, breaks, overtime, missed clock, early leave.
- Project/staff/date filters.
- Payroll-ready CSV/XLSX export.
- Custom report builder basics.

Acceptance:

- Weekly payroll export works.
- Reports show exceptions separately from approved payable time.

### LANE 9 — native app wrapper

Outcome: Apple/Android app path once web MVP proves value.

Build:

- Capacitor wrapper or Expo/React Native decision.
- Permission handling.
- Installable iOS/Android builds.
- Offline queue if needed.

Acceptance:

- Real device install proof.
- Background/location limitations documented honestly.

## Standard `/goal` prompt

Use this for each lane, replacing the lane name and scope.

```text
/goal
You are the engineer for SiteClock Pro.

Repo: tanda-rapid-mockup
Base: fresh origin/main at <BASE_SHA>
Lane: <LANE_NAME>

North-star product:
Build a GSD-owned time and attendance SaaS for 100+ staff: web management GUI, simple mobile clock-ins, multiple projects, geofences, rota, rule-based attendance reporting, staff database, certificates, and custom reports.

Your specific goal:
<ONE SENTENCE OUTCOME>

Read first:
- docs/GOAL_ENGINEER_LOOP.md
- docs/AGENT_OPERATING_MODEL.md
- docs/STAFF_DATABASE_SCHEMA.md
- src/main.tsx
- src/staff.ts
- src/geo.ts
- src/staff.test.ts
- src/geo.test.ts
- package.json

Hard rules:
- Strict TDD: write failing tests first and show the failing output before production code.
- Keep the lane small and reviewable.
- Preserve the current premium UI unless the lane explicitly asks for UI change.
- No secrets committed.
- No live DB migration unless explicitly authorised.
- No autonomous email/SMS/app notification sending.
- No payroll/time/certificate verification changes without human approval and audit.
- No follow-on lane after this one.

Implementation scope:
1. <SPECIFIC TASK 1>
2. <SPECIFIC TASK 2>
3. <SPECIFIC TASK 3>

Acceptance criteria:
- [ ] <USER-FACING ACCEPTANCE>
- [ ] <DATA/AUDIT/SECURITY ACCEPTANCE>
- [ ] <TEST ACCEPTANCE>
- [ ] <SCOPE ACCEPTANCE>

Verification commands:
- npm test
- npm run lint
- npm run build
- git diff --check
- git status --short

Report back with:
- Branch/worktree
- Changed files
- Tests you wrote and their RED/GREEN output
- Full verification output
- What remains mocked/not built
- Any blocker

Stop after reporting or opening the PR.
Do not start the next lane.
```

## First engineer packet: LANE 1 backend spine

```text
/goal
You are the engineer for SiteClock Pro.

Repo: tanda-rapid-mockup
Base: fresh origin/main at 6c5e4aa
Lane: SITECLOCK-BACKEND-SPINE-1

Goal:
Turn the static SiteClock Pro mockup into a Supabase-backed MVP foundation without changing the product design or claiming native app support.

Read first:
- docs/GOAL_ENGINEER_LOOP.md
- docs/AGENT_OPERATING_MODEL.md
- docs/STAFF_DATABASE_SCHEMA.md
- src/main.tsx
- src/staff.ts
- src/geo.ts
- src/staff.test.ts
- src/geo.test.ts
- package.json

Hard rules:
- Strict TDD: failing test first for every new service/helper.
- No secrets committed.
- Use env vars only for Supabase URL/key.
- No live DB push/migration apply unless Greg explicitly approves.
- No autonomous agent actions or message sending.
- No payroll/time/certificate approval workflow yet.
- Preserve current UI except loading/error states if required.
- Stop after this lane.

Implementation scope:
1. Add Supabase client/config wrapper using env vars and safe missing-env handling.
2. Add SQL migration files for the core MVP tables:
   - companies
   - profiles/users
   - staff_profiles
   - staff_contacts
   - staff_skills
   - training_certificates
   - staff_notes
   - projects
   - project_sites
   - geofences
   - rotas
   - shifts
   - clock_events
   - location_samples
   - timesheets
   - timesheet_exceptions
   - agent_tasks
   - audit_log
3. Add seed/demo data matching the existing mockup where practical.
4. Introduce a staff repository/service layer so staff data can come from Supabase later while the current mockup still works without live credentials.
5. Add tests for env handling, staff mapping, and fallback behavior.
6. Add docs for local env setup with redacted placeholders only.

Acceptance criteria:
- [ ] App still runs without Supabase credentials using safe demo/fallback data.
- [ ] Service/repository layer exists and is tested.
- [ ] Migration files are additive and reviewable.
- [ ] No secrets or real keys are committed.
- [ ] Existing geo/staff tests still pass.
- [ ] npm test, npm run lint, npm run build pass.

Verification commands:
- npm test
- npm run lint
- npm run build
- git diff --check
- git status --short

Report back with:
- Branch/worktree
- Changed files
- Tests written and RED/GREEN outputs
- Full verification output
- What is real vs still mocked
- Whether live Supabase setup is blocked by credentials/project linking

Stop after reporting or opening the PR.
Do not start LANE 2.
```

## Engineer loop checklist

Every loop must finish with this controller check:

- [ ] Branch based on intended `origin/main`.
- [ ] Diff matches the lane and nothing else.
- [ ] Tests were written before production code.
- [ ] RED output and GREEN output reported.
- [ ] `npm test` passed.
- [ ] `npm run lint` passed.
- [ ] `npm run build` passed.
- [ ] No secrets committed.
- [ ] UI visually checked if changed.
- [ ] PR/body honestly says what is still mocked.
- [ ] Next lane not started automatically.

## Escalation rules

Stop and ask Greg before:

- Creating paid cloud resources.
- Applying migrations to a live DB.
- Using real staff data.
- Sending emails/SMS/push notifications.
- Changing payroll/payable time approval behavior.
- Publishing native apps.
- Adding broad AI/agent automation beyond draft/review tasks.
