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

-- Private bucket for live audit report pages generated by audit-worker.
-- The worker uploads reports/<client-slug>/index.html (e.g.
-- "nour-home-goods-a1b2c3" — see audit-worker/src/supabase.ts's reportSlug())
-- with the service role key, and api/audit-report.js serves it through
-- /audit-reports/<client-slug>.
insert into storage.buckets (id, name, public)
values ('audit-reports', 'audit-reports', false)
on conflict (id) do update set public = false;
