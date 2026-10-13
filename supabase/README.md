# Supabase

Two kinds of files live here:

- **`schema.sql`**: the baseline. The complete current schema in one script, for a **new** project only.
- **`migrations/`**: every change since, one dated file each, for bringing an **existing** project up to date.

## New project
Run `schema.sql` once in the SQL Editor (New query → paste → Run). Its header says which migration it includes up to; apply only the migrations dated after that.

## Existing project
Apply each migration not yet applied there, in filename order. Each file's header says how.
- **`.sql` files:** paste into the SQL Editor.
- **`.md` files:** data changes made by a script; the file names the command.

All SQL migrations are idempotent, so re-running one is harmless.

## Adding a change
1. Add `migrations/YYYY-MM-DD-short-name.sql` (or `.md` for a scripted data change). If two land on the same day, number them: `YYYY-MM-DD-1-…`, `YYYY-MM-DD-2-…`.
2. Fold any schema change into `schema.sql` as well, and update the "includes every migration up to" line in its header.
3. Add a row to the log below, and tick each project once it's applied there.

## Migration log
| Migration | What | Staging | Production |
|---|---|---|---|
| `2026-09-09-1-cutover-cleanup.sql` | One-off data cleanup before the one-audit limit (marks pre-cutover rows as tests) | ✅ | n/a, created after |
| `2026-09-09-2-schema-upgrades.sql` | Review/delayed-send columns, one-audit-per-site/email indexes, test mode, `report_pages.bucket` | ✅ | n/a, in baseline |
| `2026-09-28-job-queue.sql` | Leases, attempt counting, per-stage `progress` | ✅ | n/a, in baseline |
| `2026-10-13-1-clean-report-slugs.md` | Report slugs → domain only (`test_` for test runs), Storage files moved | ✅ 2026-10-13 | ✅ 2026-10-13 (all test reports dropped) |
| `2026-10-13-2-production-prelaunch-wipe.md` | Every row deleted from production before launch (all test data) | n/a | ✅ 2026-10-13 |

The production column assumes production was created from the baseline. If it was built from the older files instead, the first three are applied there the same way.
