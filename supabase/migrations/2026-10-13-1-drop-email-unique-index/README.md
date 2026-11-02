# Drop the one-audit-per-email limit

**What:** Drops the unique index on `audit_requests.email_normalized`. The unique index on `website_hostname` stays.

**Why:** The limit that matters is one free audit per website. The same person (an agency, or someone with several stores) should be able to request audits for different sites.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor. Safe to re-run.

**Applied:**
- [ ] Staging
- [ ] Production
