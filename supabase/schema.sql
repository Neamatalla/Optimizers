-- Run this once against a new Supabase project (SQL Editor -> New query -> paste -> Run).
-- This is the queue table the Vercel capture endpoint (api/audit-request.js) writes to
-- and the audit-worker polls from.

create table if not exists audit_requests (
  id uuid primary key default gen_random_uuid(),
  tools text[] not null default '{}',
  website text not null,
  email text not null,
  business_name text,
  -- User-provided as a supplement to (not a replacement for) crawl-extracted IDs.
  -- Providing an ID grants no new access by itself — it's only ever used as an
  -- exact-match candidate against what the shared service account can already
  -- see (see audit-worker/src/audit-prompt.ts). A wrong/mistyped value just
  -- fails to match and that category falls back to detection-only.
  ga4_measurement_id text,
  gtm_container_id text,
  -- Pre-fetched by api/oauth/google/callback.js during the OAuth popup flow —
  -- already scoped to exactly what the visitor's own Google login consented
  -- to (no shared-identity cross-contamination risk, unlike the service
  -- account path above). null if the visitor used the manual invite flow
  -- instead. The worker treats this as authoritative "live" data directly,
  -- no MCP exact-match needed when present.
  ga4_oauth_data jsonb,
  gtm_oauth_data jsonb,
  -- Public URL to the generated live HTML audit report page.
  report_url text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  result_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audit_requests_status_created_at_idx
  on audit_requests (status, created_at);

alter table audit_requests
  add column if not exists report_url text;

-- Clarity/SessionRecording removed entirely as an audit category — no live-data
-- path exists for it any more. Drops the column for any project whose table was
-- created before this change; a no-op (IF EXISTS) on a fresh one.
alter table audit_requests
  drop column if exists clarity_token;

-- Sequential-queue rate-limit retention + internal-review/delayed-send flow
-- (see audit-worker/src/poll.ts). A request that hits a rate limit mid-run
-- goes back to status='pending' with retry_after set instead of 'failed' —
-- claimNextPendingRequest() skips it until that time, so it keeps its
-- original created_at queue position and no work/progress is lost. A
-- completed audit goes to 'awaiting_approval' (internal review email to
-- the reviewer) rather than straight to 'done'; approving it (via the
-- one-time approval_token link, see api/_lib/audit-approve.js) moves it to
-- 'scheduled' with scheduled_send_at = approval time + 2 days, and the
-- worker's own loop sends the client email once that's due, landing on
-- 'done' only then.
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
  -- Snapshot of AuditResult.categories at completion time — the row itself
  -- carries no other trace of which categories actually ran once
  -- processing finishes, but the client email's coverage sentence
  -- (audit-worker/src/email.ts's coverageSentence) needs it again at
  -- send time, which now happens later out of processDueSends, not
  -- processRequest.
  add column if not exists categories_audited text[];

create index if not exists audit_requests_scheduled_send_at_idx
  on audit_requests (scheduled_send_at) where status = 'scheduled';

-- Singleton-ish log of daily-digest sends (audit-worker/src/poll.ts checks
-- the latest row's date before sending another) — a real table instead of
-- in-memory state so a worker restart never causes a duplicate or a missed
-- digest for the day.
create table if not exists audit_digest_log (
  id bigint generated always as identity primary key,
  sent_at timestamptz not null default now()
);

alter table audit_digest_log enable row level security;

alter table audit_requests enable row level security;

-- No public policies are created on purpose: the Vercel function and the worker
-- both use the Supabase *service role* key (server-side only, never exposed to
-- the browser), which bypasses RLS entirely. ga4_oauth_data/gtm_oauth_data carry
-- OAuth-scoped payloads at rest, so this table should never be reachable with
-- the anon/public key.

create or replace function set_audit_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists audit_requests_set_updated_at on audit_requests;
create trigger audit_requests_set_updated_at
  before update on audit_requests
  for each row
  execute function set_audit_requests_updated_at();

-- One free audit per website and per email address, ever (2026-09-09).
-- The audit is expensive — a `claude -p` run with live browser access, then
-- a human review pass before it's sent — so it's offered exactly once per
-- site and once per address, regardless of how the first one turned out.
--
-- api/_lib/audit-intake.js checks for an existing row before inserting so
-- the visitor gets a real explanation, but THESE INDEXES are what actually
-- make the limit hold: two submissions racing each other both pass that
-- check, and the loser's insert is rejected here. The normalization below
-- must stay in step with that file's normalizeEmail/normalizeHostname —
-- the indexes are on the stored values, so a row written with different
-- normalization won't collide with an existing one.
alter table audit_requests
  add column if not exists email_normalized text,
  add column if not exists website_hostname text;

-- Backfill any pre-existing rows. lower(btrim(...)) for email; for the
-- website: drop the scheme, cut at the first / ? or #, drop any :port, then
-- strip a leading "www." — i.e. https://www.Example.com/collections/all
-- and http://example.com both become "example.com".
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

-- Test-mode rows (2026-09-09). A submission whose email AND website were
-- both typed with a leading "-" (see api/_lib/audit-intake.js's
-- parseTestPrefix) is a test run: the report is published to a separate
-- Storage bucket and emailed straight to whoever was in the form, with no
-- internal review step and no 2-day delay. The flag lives on the row
-- because the worker needs it long after intake — it decides which bucket
-- to publish to and which delivery path to take (audit-worker/src/poll.ts).
alter table audit_requests
  add column if not exists is_test boolean not null default false;

create index if not exists audit_requests_is_test_created_at_idx
  on audit_requests (is_test, created_at);

-- The one-audit-per-site/email limit deliberately does NOT apply to test
-- rows — a test mode you can only run once per site is useless. Both
-- indexes are therefore partial: they only constrain real submissions, so
-- the same site/address can be test-run any number of times, and an earlier
-- test run never blocks that site's real audit later. Any project that ran
-- an earlier version of this file has the non-partial versions, hence the
-- explicit drops.
drop index if exists audit_requests_email_normalized_key;
drop index if exists audit_requests_website_hostname_key;

-- If either CREATE below fails with "could not create unique index", the
-- table already holds duplicates from before this rule existed. Find them:
--
--   select email_normalized, count(*) from audit_requests
--     where is_test = false group by email_normalized having count(*) > 1;
--   select website_hostname, count(*) from audit_requests
--     where is_test = false group by website_hostname having count(*) > 1;
--
-- then decide per group which row to keep (usually the newest completed
-- one) and delete the rest — a judgment call about real client requests,
-- so it is deliberately NOT automated here.
create unique index if not exists audit_requests_email_normalized_key
  on audit_requests (email_normalized) where is_test = false;
create unique index if not exists audit_requests_website_hostname_key
  on audit_requests (website_hostname) where is_test = false;

-- Private bucket for live audit report pages generated by audit-worker.
-- The worker uploads reports/<client-slug>/index.html (e.g.
-- "nour-home-goods-a1b2c3" — see audit-worker/src/supabase.ts's reportSlug())
-- with the service role key, and api/audit-report.js serves it through
-- /audit-reports/<client-slug>.
insert into storage.buckets (id, name, public)
values ('audit-reports', 'audit-reports', false)
on conflict (id) do update set public = false;

-- Same thing for test-mode runs, kept in its own bucket so throwaway
-- reports never sit alongside real client ones and the whole lot can be
-- emptied without touching production reports. audit-worker picks between
-- the two by the row's is_test flag (AUDIT_REPORTS_BUCKET vs
-- AUDIT_REPORTS_TEST_BUCKET), and report_pages.bucket records which one a
-- given slug actually lives in so the serving/editing endpoints don't have
-- to guess.
insert into storage.buckets (id, name, public)
values ('audit-reports-test', 'audit-reports-test', false)
on conflict (id) do update set public = false;
