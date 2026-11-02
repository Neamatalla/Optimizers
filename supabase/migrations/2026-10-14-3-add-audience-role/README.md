# Add audience role

**What:** Adds `audience_role` ("Your role" on the form): `store_owner`, `media_buyer` or `marketing_manager`. Older rows stay `null` and get the default store-owner report.

**Why:** The report is written for whoever reads it. Same checks for every role; the worker changes the voice and what it shows first (`audit-worker/src/audience.ts`).

**How to run:** Run `migration.sql` once in the Supabase SQL Editor, before deploying the form and API from this version. Until it runs, submissions are saved without the role. Safe to re-run.

**Applied:**
- [x] Staging
- [x] Production
