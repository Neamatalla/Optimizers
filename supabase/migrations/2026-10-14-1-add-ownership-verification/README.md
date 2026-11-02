# Add ownership verification

**What:** Adds `verification_methods` (which checks showed the visitor owns the site) and `is_verified`, derived from it. Existing rows get `{}`, so `is_verified = false`.

**Why:** To know whether the person asking for an audit likely owns the website. Recorded only: nothing acts on it yet. See `api/_lib/ownership-verification.js`.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor. Safe to re-run.

**Applied:**
- [ ] Staging
- [ ] Production
