# Supabase

How database changes are made. Claude reads this before any database work.

## Layout

- **`baseline.sql`**: the schema as of 2026-10-13. Frozen: never edit it.
- **`migrations/`**: every change since, one folder each, in the order they're applied:
  ```
  migrations/2026-10-20-4-add-report-columns/
    migration.sql   the change
    README.md       what it does, why, how to run it, where it's applied
  ```

There's no single file with the full current schema. To see a table as it is now, open it in the Supabase dashboard.

## Rules

- Only run a migration when explicitly asked to.
- Apply to staging first. Production only after it works on staging.
- Never edit `baseline.sql`, or a migration that's already applied anywhere. To change something, add a new migration.
- Never delete a migration. Together they're the history of the database.

## Making a change

1. Make a folder `migrations/YYYY-MM-DD-N-short-name/`. `N` is that day's number, starting at 1, and is always there. This keeps folders sorted in the order they're applied.
2. Write `migration.sql`. Make it safe to re-run (`if not exists`, `drop … if exists`).
   A data change made by a script has no `migration.sql`. Its README names the command instead.
3. Write `README.md` from the template below.
4. When it's applied on staging, tick Staging. Same for Production.

### README template

```markdown
# Short title

**What:** what changes in the database.

**Why:** the reason we made it.

**How to run:** where to run it, and when (e.g. before deploying the API). Any extra step, like a backfill script.

**Applied:**
- [ ] Staging
- [ ] Production
```

## New project

In the Supabase SQL Editor, run `baseline.sql`. Then run each `migration.sql` in folder order, plus any extra step its README names.

## Before the baseline

Squashed into the 2026-10-13 baseline. Full files are in git history before that commit.
- **2026-09-09:** one free audit per site/email (partial unique indexes), test mode, internal review and delayed send, `report_pages.bucket`. Pre-cutover internal rows were marked as tests.
- **2026-09-28:** job queue: `attempts`, `locked_by`, `heartbeat_at`, `progress`.
- **2026-10-13:** report slugs became the domain only (`test_` prefix for test runs), and existing reports were renamed on staging. Production was wiped before launch: all rows, and both report buckets emptied.
