-- Upgrades that brought pre-existing projects to the 2026-09-09 schema
-- (internal review + delayed send, one-audit-per-site/email limit, test
-- mode). These statements used to live inside schema.sql and
-- schema-content-backend.sql, re-run on top of older tables; they moved here
-- when those files became the single clean baseline (supabase/schema.sql).
-- Moved verbatim. Every statement is idempotent.
--
-- Run 2026-09-09-1-cutover-cleanup.sql FIRST (see its order note).
-- Not needed for a fresh project: schema.sql already includes all of this.
-- Tables that first appeared in this period (audit_digest_log,
-- checklist_points, report_pages) have no upgrade path of their own: on a
-- project that predates them, run their sections of schema.sql first.

-- Present in the original create table; added here for tables older still.
alter table audit_requests
  add column if not exists report_url text;

-- Clarity/SessionRecording removed entirely as an audit category — no live-data
-- path exists for it any more.
alter table audit_requests
  drop column if exists clarity_token;

-- Internal-review/delayed-send flow widened the allowed statuses (see
-- schema.sql's audit_requests for what each one means).
alter table audit_requests
  drop constraint if exists audit_requests_status_check;
alter table audit_requests
  add constraint audit_requests_status_check
  check (status in ('pending', 'processing', 'awaiting_approval', 'scheduled', 'done', 'failed'));

alter table audit_requests
  add column if not exists retry_after timestamptz,
  add column if not exists retry_count integer not null default 0,
  add column if not exists approval_token text,
  add column if not exists approved_at timestamptz,
  add column if not exists scheduled_send_at timestamptz,
  add column if not exists sent_to_client_at timestamptz,
  add column if not exists categories_audited text[];

create index if not exists audit_requests_scheduled_send_at_idx
  on audit_requests (scheduled_send_at) where status = 'scheduled';

-- One free audit per website and per email address.
alter table audit_requests
  add column if not exists email_normalized text,
  add column if not exists website_hostname text;

-- Backfill any pre-existing rows. lower(btrim(...)) for email; for the
-- website: drop the scheme, cut at the first / ? or #, drop any :port, then
-- strip a leading "www." — i.e. https://www.Example.com/collections/all
-- and http://example.com both become "example.com". Must match
-- api/_lib/audit-intake.js's normalizeEmail/normalizeHostname.
update audit_requests
set email_normalized = lower(btrim(email))
where email_normalized is null;

update audit_requests
set website_hostname = nullif(
  regexp_replace(
    split_part(
      split_part(
        split_part(
          split_part(regexp_replace(lower(btrim(website)), '^[a-z][a-z0-9+.-]*://', ''), '/', 1),
          '?', 1),
        '#', 1),
      ':', 1),
    '^www\.', ''),
  '')
where website_hostname is null;

-- Test-mode rows.
alter table audit_requests
  add column if not exists is_test boolean not null default false;

create index if not exists audit_requests_is_test_created_at_idx
  on audit_requests (is_test, created_at);

-- Any project that ran an earlier version had non-partial unique indexes;
-- these are partial so test rows never consume a site's/address's audit.
-- If a CREATE fails with "could not create unique index", find the
-- duplicates with:
--
--   select email_normalized, count(*) from audit_requests
--     where is_test = false group by email_normalized having count(*) > 1;
--   select website_hostname, count(*) from audit_requests
--     where is_test = false group by website_hostname having count(*) > 1;
drop index if exists audit_requests_email_normalized_key;
drop index if exists audit_requests_website_hostname_key;
create unique index if not exists audit_requests_email_normalized_key
  on audit_requests (email_normalized) where is_test = false;
create unique index if not exists audit_requests_website_hostname_key
  on audit_requests (website_hostname) where is_test = false;

-- report_pages.bucket, added after that table shipped — the default
-- backfills every existing row to the real reports bucket, which is where
-- they all were.
alter table report_pages
  add column if not exists bucket text not null default 'audit-reports';
