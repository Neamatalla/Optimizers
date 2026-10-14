# Supabase

- **`schema.sql`**: the baseline. The complete current schema in one script. Staging and production are both at exactly this state, as of 2026-10-13.
- **`migrations/`**: changes made after that baseline, one dated file each. Empty until the next schema or data change.

## New project
Run `schema.sql` once in the SQL Editor (New query → paste → Run), then apply anything in `migrations/`.

## Making a change
1. Add `migrations/YYYY-MM-DD-short-name.sql`. Use `.md` instead for a data change made by a script, naming the command. Number same-day files: `YYYY-MM-DD-1-…`, `YYYY-MM-DD-2-…`.
2. Fold any schema change into `schema.sql` as well, so it stays the full current state.
3. Add a row to the log below, and tick each project once it's applied there.

Once every project has a migration and it's folded into `schema.sql`, the file can be deleted, leaving a one-line summary under History. Git keeps the original.

## Migration log
| Migration | What | Staging | Production |
|---|---|---|---|
| `2026-10-13-drop-email-unique-index.sql` | Drop the one-audit-per-email limit (website limit stays) | ☐ | ☐ |
| `2026-10-14-add-ownership-verification.sql` | Add `verification_methods` and derived `is_verified` | ☐ | ☐ |

## History (squashed into the baseline)
Full files are in git history before the 2026-10-13 squash.
- **2026-09-09:** one free audit per site/email (partial unique indexes), test mode, internal review and delayed send, `report_pages.bucket`. Pre-cutover internal rows were marked as tests.
- **2026-09-28:** job queue: `attempts`, `locked_by`, `heartbeat_at`, `progress`.
- **2026-10-13:** report slugs became the domain only (`test_` prefix for test runs), and existing reports were renamed on staging. Production was wiped before launch: all rows, and both report buckets emptied.
