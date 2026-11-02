# Supabase

The audit system's database: `baseline.sql` plus the folders in `migrations/`. How to make changes: see [`docs/DB_WORKFLOW.md`](../docs/DB_WORKFLOW.md).

## Before the baseline

Squashed into the 2026-10-13 baseline. Full files are in git history before that commit.
- **2026-09-09:** one free audit per site/email (partial unique indexes), test mode, internal review and delayed send, `report_pages.bucket`. Pre-cutover internal rows were marked as tests.
- **2026-09-28:** job queue: `attempts`, `locked_by`, `heartbeat_at`, `progress`.
- **2026-10-13:** report slugs became the domain only (`test_` prefix for test runs), and existing reports were renamed on staging. Production was wiped before launch: all rows, and both report buckets emptied.
