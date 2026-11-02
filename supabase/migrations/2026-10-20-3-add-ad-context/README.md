# Add ad context

**What:** Adds `ad_context`: the media buyer's ad, typed on the form, as `{ text, coupon }`. `null` when not given.

**Why:** The audit compares what the ad promises with the landing page and the cart.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor. Until it runs, submissions are saved without it. Safe to re-run.

**Applied:**
- [x] Staging
- [ ] Production
