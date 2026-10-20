# Supabase

- **`schema.sql`**: the complete current schema in one script. The 2026-10-13 baseline with every migration below folded in.
- **`migrations/`**: every change made after the baseline, one dated file each. Never deleted: together they're the history of the schema, and replaying them on a baseline project brings it to the current state.

## New project
Run `schema.sql` once in the SQL Editor (New query → paste → Run). It already includes every migration, so there's nothing else to apply. Tick the new project in the log.

## Making a change
1. Add `migrations/YYYY-MM-DD-short-name.sql`. Use `.md` instead for a data change made by a script, naming the command. Number same-day files: `YYYY-MM-DD-1-…`, `YYYY-MM-DD-2-…`. Write it to be safe to re-run (`if not exists`, `drop … if exists`).
2. Fold any schema change into `schema.sql` as well, so it stays the full current state.
3. Add a row to the log below, and tick each project once it's applied there.

## Migration log
| Migration | What | Staging | Production |
|---|---|---|---|
| `2026-10-13-drop-email-unique-index.sql` | Drop the one-audit-per-email limit (website limit stays) | ☐ | ☐ |
| `2026-10-14-1-add-ownership-verification.sql` | Add `verification_methods` and derived `is_verified` | ☐ | ☐ |
| `2026-10-14-2-add-store-platform.sql` | Add `store_platform` (Intellia's e-store check) | ☐ | ☐ |
| `2026-10-14-3-add-audience-role.sql` | Add `audience_role` ("Your role" on the form) | ☑ | ☑ |
| `2026-10-15-add-agency-audience-role.sql` | Allow the `agency` role | ☑ | ☑ |
| `2026-10-20-add-clarity-data.sql` | Add `clarity_data` (Clarity snapshot from the form) | ☐ | ☐ |
| `2026-10-20-2-add-ad-context.sql` | Add `ad_context` (media buyer's ad text and coupon) | ☐ | ☐ |
## Before the baseline
Squashed into the 2026-10-13 baseline. Full files are in git history before that commit.
- **2026-09-09:** one free audit per site/email (partial unique indexes), test mode, internal review and delayed send, `report_pages.bucket`. Pre-cutover internal rows were marked as tests.
- **2026-09-28:** job queue: `attempts`, `locked_by`, `heartbeat_at`, `progress`.
- **2026-10-13:** report slugs became the domain only (`test_` prefix for test runs), and existing reports were renamed on staging. Production was wiped before launch: all rows, and both report buckets emptied.
