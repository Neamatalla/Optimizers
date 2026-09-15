-- One-off data cleanup for the 2026-09-09 cutover (PageSpeed removal +
-- one-audit-per-site/email limit + test mode). Run this FIRST, before
-- schema.sql — see the order note below for why it can't be second.
--
-- SQL Editor -> New query -> paste -> Run.
--
-- WHY THIS EXISTS
-- schema.sql creates two UNIQUE indexes (email_normalized, website_hostname)
-- that enforce "one free audit per email, one per website". The table
-- already holds 14 rows of internal testing, and among them:
--
--   team@optimizers.agency   x10
--   tharaa.shop              x9
--   regal-honey.com          x2
--
-- Postgres cannot build a unique index over existing duplicates, so
-- schema.sql would abort at that step. Nothing here deletes an audit: the
-- two indexes are PARTIAL (`where is_test = false`), so marking historical
-- rows as test runs resolves every collision while keeping the full history
-- queryable.
--
-- ORDER MATTERS
-- Marking rows requires the is_test column, and the column is added by
-- schema.sql — which then immediately tries to build the indexes and fails.
-- So this script adds the column itself (same idempotent DDL, harmless to
-- run twice), marks the rows, and leaves schema.sql to do the rest.
--
--   1. this file
--   2. supabase/schema.sql
--   3. supabase/schema-content-backend.sql

-- ---------------------------------------------------------------------------
-- 1. is_test column, ahead of schema.sql (identical statement, idempotent)
-- ---------------------------------------------------------------------------
alter table audit_requests
  add column if not exists is_test boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Mark every pre-cutover row as a test run
-- ---------------------------------------------------------------------------
-- Every row currently in the table is internal traffic: 11 submissions from
-- @optimizers.agency addresses against tharaa.shop and regal-honey.com, plus
-- 3 synthetic fixtures from audit-worker's test-send-review-email script.
-- None of them is a real visitor who asked for an audit, so none of them
-- should consume that site's or that address's one free audit.
--
-- Consequence worth being deliberate about: tharaa.shop and regal-honey.com
-- stay eligible for a real free audit later. That is the intended reading —
-- these were internal runs, not client-requested audits. If you would rather
-- treat the most recent completed audit of each site as the real one (so
-- those two sites are used up), skip this statement and run the alternative
-- block below it instead.
update audit_requests
set is_test = true
where created_at < '2026-09-09'::timestamptz;

-- ALTERNATIVE to the statement above — keeps the newest completed audit per
-- site/address as the real one and marks only the rest as tests. Leaves
-- tharaa.shop, regal-honey.com and team@optimizers.agency used up. Only run
-- this if you did NOT run the update above.
--
-- with ranked as (
--   select id,
--          row_number() over (
--            partition by lower(btrim(email))
--            order by (status = 'done') desc, created_at desc
--          ) as email_rank,
--          row_number() over (
--            partition by regexp_replace(
--              split_part(split_part(split_part(split_part(
--                regexp_replace(lower(btrim(website)), '^[a-z][a-z0-9+.-]*://', ''),
--              '/', 1), '?', 1), '#', 1), ':', 1), '^www\.', '')
--            order by (status = 'done') desc, created_at desc
--          ) as site_rank
--   from audit_requests
--   where created_at < '2026-09-09'::timestamptz
-- )
-- update audit_requests a
-- set is_test = true
-- from ranked r
-- where a.id = r.id and (r.email_rank > 1 or r.site_rank > 1);

-- ---------------------------------------------------------------------------
-- 3. Release the row stuck in 'processing'
-- ---------------------------------------------------------------------------
-- A worker died mid-run on 2026-09-06 and left one row in 'processing'.
-- Nothing ever reclaims that state (claimNextPendingRequest only picks up
-- 'pending'), so it sits there forever looking like work in flight. Marked
-- failed with a real reason instead. Flip it to 'pending' rather than
-- 'failed' if you want the worker to actually retry it.
update audit_requests
set status = 'failed',
    result_error = coalesce(result_error, 'Worker exited mid-run; released during the 2026-09-09 cutover.')
where status = 'processing'
  and created_at < '2026-09-09'::timestamptz;

-- ---------------------------------------------------------------------------
-- 4. Stop the synthetic fixtures from being emailed
-- ---------------------------------------------------------------------------
-- Three rows created by audit-worker/src/test-send-review-email.ts are
-- sitting in 'scheduled' with a send date that has now passed, so the next
-- worker run will try to email dummy-requester*@example.com for real. The
-- addresses are unroutable, so nothing reaches anyone — but it burns a
-- Resend call per row and clutters the log. Marking them done takes them out
-- of the due-send query without deleting the history.
update audit_requests
set status = 'done',
    sent_to_client_at = coalesce(sent_to_client_at, now())
where status = 'scheduled'
  and email like 'dummy-requester%@example.com';

-- If you would rather they were gone entirely (this also removes their
-- report_pages rows via the FK cascade, and their files stay orphaned in
-- Storage until deleted there):
--
-- delete from audit_requests where email like 'dummy-requester%@example.com';

-- ---------------------------------------------------------------------------
-- 5. Drop the stale PageSpeed checklist rows
-- ---------------------------------------------------------------------------
-- checklist_points is a reference/display copy of audit-worker's
-- checklist.ts, refreshed by `npm run seed-checklist`. That upsert never
-- deletes rows, so the 4 PS-1..PS-4 rows from the removed PageSpeed category
-- would linger forever. The 46 Website rows are updated in place by the
-- reseed (and gain WEB-60..WEB-63, the browser-measured replacements for
-- exactly what PS-1..PS-4 scored), so they need no deletion.
--
-- Run `npm run seed-checklist` in audit-worker/ AFTER this, to bring the
-- table to 100 rows again: GA4 25 + GTM 25 + Website 50.
delete from checklist_points where category = 'PageSpeed';

-- ---------------------------------------------------------------------------
-- 6. Verify
-- ---------------------------------------------------------------------------
-- Expect: every existing row marked is_test, no remaining duplicates among
-- non-test rows, nothing stuck in processing or scheduled.
select
  count(*)                                                as total_rows,
  count(*) filter (where is_test)                         as test_rows,
  count(*) filter (where not is_test)                     as real_rows,
  count(*) filter (where status = 'processing')           as stuck_processing,
  count(*) filter (where status = 'scheduled')            as awaiting_send
from audit_requests;

-- Must both return zero rows, or schema.sql's index creation will still fail.
select lower(btrim(email)) as email, count(*)
from audit_requests where not is_test
group by 1 having count(*) > 1;

select regexp_replace(
         split_part(split_part(split_part(split_part(
           regexp_replace(lower(btrim(website)), '^[a-z][a-z0-9+.-]*://', ''),
         '/', 1), '?', 1), '#', 1), ':', 1), '^www\.', '') as hostname,
       count(*)
from audit_requests where not is_test
group by 1 having count(*) > 1;
