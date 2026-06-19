# Engineering Loop: Hermes Coordinator + Codex Builder

## Goal
Build a usable time-and-attendance product fast while preventing agent drift.

## Agent team

### 1. Hermes — coordinator / product controller
- Converts Greg's requirements into bounded lanes.
- Writes the Codex packet.
- Owns the source-of-truth scope and acceptance gates.
- Decides whether a lane is merge, rework, or park.

### 2. Codex — builder
- Implements one lane only.
- Opens a PR or commits to the agreed branch.
- Reports changed files, verification commands, and known gaps.
- Stops after the lane; no follow-on work without coordinator approval.

### 3. Scope checker
Gate before PR review:
- Did the lane build only the requested scope?
- Did it add speculative backend, payroll, AI, workflow automation, or accounting features?
- Did it preserve mobile simplicity?
- Are mocked features clearly labelled as mocked?

### 4. Code reviewer
Gate after scope check:
- Type safety and build health.
- Sensible component boundaries.
- No secrets in client code.
- No over-complicated abstractions.
- Tests/checks prove the changed behaviour.

### 5. Debugger
Triggered only if build/test/runtime fails:
- Reproduce the failure.
- Identify root cause.
- Apply the smallest fix.
- Re-run the failing command.
- Do not broaden the feature while debugging.

### 6. Runtime verifier
Final gate:
- Runs install/build/lint.
- Launches the app locally or checks the preview URL.
- Clicks the core flows.
- Confirms the user can review it tonight.

## Loop per lane
1. Hermes writes lane packet.
2. Codex builds.
3. Scope checker reviews diff against lane.
4. Code reviewer reviews implementation.
5. Debugger fixes only blocking failures.
6. Runtime verifier proves the app runs.
7. Hermes reports: merge / rework / park.
8. Greg reviews the product.

## Stop conditions
- No Vercel token: stop at local/GitHub artifact and give deployment steps.
- Supabase project creation requires password/billing confirmation: stop with schema file and setup command.
- Codex auth fails: Hermes may build the mockup directly, but must report Codex as blocked.
- Any secret request appears in logs/client code: stop and remove before deployment.

## Tonight's shortcut
For speed, build a visual full-product mockup first:
- mock data
- Supabase-ready schema
- no payroll integration
- no native mobile app yet
- staff mobile flow simulated inside responsive web UI

Then harden into real Supabase + Expo mobile in lanes.
