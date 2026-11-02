# Add store platform

**What:** Adds `store_platform`: the e-commerce platform Intellia's e-store check found (e.g. `Shopify`). `null` when Intellia was unavailable. Existing rows get `null`.

**Why:** The free audit is for e-commerce stores. We keep what the check found with each request.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor. Safe to re-run.

**Applied:**
- [x] Staging
- [x] Production
