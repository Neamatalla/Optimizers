-- Job queue resilience for audit_requests (2026-09-28). Run once in the
-- Supabase SQL editor BEFORE starting a worker built from this version.
-- Safe to re-run (every statement is idempotent). Also folded into
-- supabase/schema.sql for fresh projects.
--
--   attempts      Real attempts used, incremented when a worker claims the
--                 row. Rate-limit bounces give theirs back. The worker gives
--                 up (status 'failed', reviewer emailed) at MAX_ATTEMPTS.
--   locked_by     Which worker holds the row while it is 'processing'.
--   heartbeat_at  Refreshed every minute by that worker. A 'processing' row
--                 whose heartbeat is older than the lease (10 min) belongs to
--                 a worker that died, and any worker may reclaim it.
--   progress      Saved output of each finished stage (audit result,
--                 translation, published report, emails sent), so a retry
--                 resumes where the last attempt stopped instead of re-running
--                 the expensive claude -p audit or sending an email twice.

alter table audit_requests
  add column if not exists attempts integer not null default 0,
  add column if not exists locked_by text,
  add column if not exists heartbeat_at timestampt
  add column if not exists progress jsonb not null default '{}'::jsonb;

create index if not exists audit_requests_processing_heartbeat_idx
  on audit_requests (heartbeat_at) where status = 'processing';
