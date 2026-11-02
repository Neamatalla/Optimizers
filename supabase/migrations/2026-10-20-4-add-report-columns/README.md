# Add report columns

**What:** Adds `clarity_facts`, `site_checks` and `category_tallies` to `audit_reports`.

**Why:** The report page needs them: the Clarity section, proof the store visit ran, and pass counts for old results that only listed failed checks.

**How to run:**
1. Run `migration.sql` once in the Supabase SQL Editor, after `2026-10-20-1-audit-report-tables` and before deploying the worker from this version. Safe to re-run.
2. Then run `npm run backfill-report-rows` in `audit-worker/`, so older reports get the three fields.

**Applied:**
- [x] Staging
- [x] Production
