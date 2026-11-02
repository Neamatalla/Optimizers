# Add Clarity data

**What:** Adds `clarity_data`: a Microsoft Clarity snapshot pulled at intake from a token the visitor pastes on the form. The token itself is never stored. `null` when the visitor didn't connect Clarity.

**Why:** Real visitor behaviour from Clarity makes the audit's findings sharper.

**How to run:** Run `migration.sql` once in the Supabase SQL Editor. Until it runs, submissions are saved without it. Safe to re-run.

**Applied:**
- [x] Staging
- [ ] Production
