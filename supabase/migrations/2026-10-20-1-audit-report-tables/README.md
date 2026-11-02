# Audit findings as rows

**What:** Adds the `audit_reports` and `audit_findings` tables and the public `audit-images` bucket. Makes `report_pages.storage_path` nullable.

**Why:** Each report used to be one rendered HTML file. As rows, a single finding can be edited, findings can be queried across stores ("every store failing GA4-03"), and `/audit-reports/<slug>` renders straight from the data.

**How to run:**
1. Run `migration.sql` once in the Supabase SQL Editor, before deploying the API and worker from this version. Safe to re-run.
2. Then run `npm run backfill-report-rows` in `audit-worker/`, to turn existing reports into rows.

**Applied:**
- [x] Staging
- [ ] Production
