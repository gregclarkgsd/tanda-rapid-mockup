# Local Supabase setup (optional)

SiteClock Pro lane `SITECLOCK-BACKEND-SPINE-1` is Supabase-ready but still runs safely with demo/fallback data when credentials are missing.

## Environment variables

Create a local-only `.env.local` file if you want the app to read from a Supabase project later:

```bash
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-redacted-anon-key"
```

Rules:

- Do not commit `.env.local` or real keys.
- Use the public anon key only in the browser app.
- Do not use service-role keys in Vite/client-side code.
- Missing variables are safe: the repository layer falls back to demo data.

## Current dependency decision

This lane adds a typed config/client factory wrapper but does **not** install `@supabase/supabase-js` yet. That keeps the mockup build working without live credentials and avoids pretending a live DB is connected. A later live-data lane can install the SDK and pass `createClient` into `createSupabaseClient`.

Example future wiring:

```ts
import { createClient } from '@supabase/supabase-js'
import { createSupabaseClient, getSupabaseConfig } from './supabase'

const supabase = createSupabaseClient(getSupabaseConfig(), ({ url, anonKey }) => createClient(url, anonKey))
```

## Migrations

Review-only migration files live under `supabase/migrations/`:

- `202606190001_core_mvp_tables.sql` — additive MVP tables and indexes.
- `202606190002_seed_demo_data.sql` — fictional demo rows based on the current mockup.

Do **not** push/apply these to a live database without explicit owner approval.
