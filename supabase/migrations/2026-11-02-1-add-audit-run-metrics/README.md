# Add audit run metrics

**What:** Adds the `audit_run_metrics` table: one row per audit attempt, with its outcome, time, time per stage, Claude model, billing source, tokens, retries and estimated cost.

**Why:** The worker now runs Claude on API credits, which we pay per token. This table shows what each audit costs and how long it takes, so cost can be analysed with one query instead of reading logs.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor, before deploying the worker from this version. Safe to re-run. If the worker runs before it, audits still work; it only logs that it couldn't save the metrics.

**Applied:**
- [x] Staging
- [x] Production
