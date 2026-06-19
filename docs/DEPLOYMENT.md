# Deployment Setup

## Current state
- Local mockup app: built with Vite + React + TypeScript.
- GitHub CLI is authenticated as `gregclarkgsd`.
- Supabase CLI is authenticated and can list existing projects.
- Vercel CLI is installed but not authenticated on this machine.
- Codex CLI exists but failed with a refresh-token error during this run, so Hermes built the first mockup directly.

## Fastest path tonight
1. Push this repo to GitHub.
2. Import the GitHub repo into Vercel manually from the Vercel dashboard, or run `vercel login` / provide `VERCEL_TOKEN` for CLI deploy.
3. Create/link a Supabase project only when moving from mock data to real data.
4. Apply `docs/SUPABASE_SCHEMA.sql` after review.

## GitHub
```bash
cd /Users/claudebot/tanda-rapid-mockup
gh repo create tanda-rapid-mockup --private --source . --push
```

## Vercel
Blocked for CLI deploy until one of these is done:
```bash
vercel login
# or
export VERCEL_TOKEN=...
vercel --prod --token "$VERCEL_TOKEN"
```

Suggested Vercel settings:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Supabase
For a new project, the CLI usually needs project/org choice and database password confirmation. Safer first step is manual project creation, then:
```bash
supabase link --project-ref <project-ref>
supabase db push
```

For this mockup, no live Supabase env vars are needed. When backend starts, expected variables will be:
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=server-only-never-client
```
