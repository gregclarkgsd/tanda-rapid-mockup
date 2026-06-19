# SiteClock Pro agent operating model

This app must be designed so future agents can operate routine staff-admin workflows without becoming the source of truth or silently changing payroll/project access.

## Staff database scope

Each staff profile should store:

- Identity: name, role, employment status, payroll ID, start date.
- Contact: mobile, email, address, emergency contact name/phone.
- Skills: editable tags such as trade, certifications, project suitability, supervisor cover, plant/equipment competence.
- Training certificates: certificate name, number, status, expiry date, uploaded file reference, verifier, verification date.
- Notes: timestamped notes with visibility labels: `manager`, `payroll`, or `agent`.
- Audit: every agent-generated suggestion, human approval, reminder, rota block, and profile edit.

## Agent-safe workflow rules

Agents may:

1. Detect expired/missing/soon-expiring training.
2. Draft reminder messages for manager review.
3. Prepare a suggested rota block where training is expired or missing.
4. Summarise staff notes and certificate status for a manager.
5. Queue data-cleanup tasks, e.g. duplicate skill tags or missing emergency contacts.

Agents must not without human approval:

1. Send external messages to staff.
2. Remove a worker from an active/live project.
3. Change payable time, payroll status, rates, or timesheet approval.
4. Delete certificates, notes, audit records, clock events, or GPS evidence.
5. Mark a certificate verified unless a human approved the file/evidence.

## Suggested Supabase tables

- `staff_profiles`
- `staff_contacts`
- `staff_skills`
- `training_certificates`
- `staff_notes`
- `agent_staff_tasks`
- `agent_action_audit`
- `staff_project_eligibility`

## Agent task lifecycle

1. `detected`: system found expiry/missing data.
2. `drafted`: agent prepared reminder or proposed action.
3. `review_required`: manager must approve/reject.
4. `approved`: human approved execution.
5. `executed`: reminder sent or rota restriction applied.
6. `closed`: certificate renewed, missing data filled, or manager dismissed task.

## RLS/data-access direction

- Staff can see their own profile basics, skills, certificates, and submitted docs.
- Staff cannot see manager/payroll/private notes.
- Managers can view staff assigned to their projects.
- Payroll/admin can view all staff, certificates, timesheets, and audit.
- Agents should use scoped service roles with explicit allowed actions and audit every generated task.
