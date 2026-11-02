# Allow the agency role

**What:** Adds `agency` ("Agency / consultant") to the allowed `audience_role` values.

**Why:** Agencies and consultants were a fourth kind of visitor the form didn't cover.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor, after `2026-10-14-3-add-audience-role` and before deploying the form from this version. Until it runs, an agency submission is saved without its role. Safe to re-run.

**Applied:**
- [x] Staging
- [x] Production
