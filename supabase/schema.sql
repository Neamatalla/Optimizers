-- The complete current schema, for a NEW Supabase project (SQL Editor -> New
-- query -> paste -> Run): the 2026-10-13 baseline with every later migration
-- in supabase/migrations/ folded in. Each change goes in both places — see
-- supabase/README.md.

-- ---------------------------------------------------------------------------
-- audit_requests: the queue the Vercel capture endpoint (api/audit-request.js)
-- writes to and the audit-worker polls from. One row per audit request.
-- ---------------------------------------------------------------------------
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
  -- Lifecycle (see audit-worker/src/poll.ts). A request that hits a rate
  -- limit mid-run goes back to 'pending' with retry_after set instead of
  -- 'failed', keeping its created_at queue position. A completed audit goes
  -- to 'awaiting_approval' (internal review email to the reviewer);
  -- approving it (via the one-time approval_token link, see
  -- api/_lib/audit-approve.js) moves it to 'scheduled' with
  -- scheduled_send_at = approval time + 2 days, and the worker sends the
  -- client email once that's due, landing on 'done' only then. Test rows go
  -- straight from 'processing' to 'done'.
  status text not null default 'pending'
    constraint audit_requests_status_check
    check (status in ('pending', 'processing', 'awaiting_approval', 'scheduled', 'done', 'failed')),
  result_error text,
  retry_after timestamptz,
  retry_count integer not null default 0,
  approval_token text,
  approved_at timestamptz,
  scheduled_send_at timestamptz,
  sent_to_client_at timestamptz,
  -- Snapshot of AuditResult.categories at completion time — the row itself
  -- carries no other trace of which categories actually ran once
  -- processing finishes, but the client email's coverage sentence
  -- (audit-worker/src/email.ts's coverageSentence) needs it again at send
  -- time, out of processDueSends.
  categories_audited text[],
  -- Normalized forms written by api/_lib/audit-intake.js's
  -- normalizeEmail/normalizeHostname. website_hostname is behind the
  -- one-free-audit-per-site limit (see the unique index below);
  -- email_normalized is for lookups only and is not unique.
  email_normalized text,
  website_hostname text,
  -- A submission whose email AND website were both typed with a leading "-"
  -- (see api/_lib/audit-intake.js's parseTestPrefix) is a test run: the
  -- report is published to a separate Storage bucket and emailed straight to
  -- whoever was in the form, with no internal review step and no 2-day
  -- delay. The worker reads the flag long after intake to pick the bucket
  -- and delivery path (audit-worker/src/poll.ts).
  is_test boolean not null default false,
  -- Ownership verification (2026-10-14): which checks showed the visitor
  -- owns the website, written once at intake by
  -- api/_lib/ownership-verification.js (the file documents each method).
  -- is_verified is true when any passed; it's derived, so it can't drift
  -- from the list and can't be written directly. Recorded only, nothing
  -- acts on either yet.
  verification_methods text[] not null default '{}'
    constraint audit_requests_verification_methods_check
    check (verification_methods <@ array['email_domain', 'ga4_stream_url', 'ga4_site_tag', 'gtm_container_domain', 'gtm_site_tag']::text[]),
  is_verified boolean generated always as (cardinality(verification_methods) > 0) stored,
  -- The e-commerce platform (e.g. 'Shopify') Intellia's e-store check found
  -- on the form's website step (api/_lib/detect-tracking.js's checkStore),
  -- as the browser reported it at submit. Sites Intellia says aren't stores
  -- never get past that step, so null means Intellia was unavailable or not
  -- configured at the time (2026-10-14).
  store_platform text,
  -- Who the report is written for: the form's "Your role" (2026-10-14,
  -- 'agency' added 2026-10-15). Same checks for every role; the worker
  -- changes the voice and what the report surfaces first
  -- (audit-worker/src/audience.ts). Null on rows from before the field: the
  -- default store-owner report.
  audience_role text
    constraint audit_requests_audience_role_check
    check (audience_role is null or audience_role in ('store_owner', 'media_buyer', 'marketing_manager', 'agency')),
  -- Job queue resilience (see audit-worker/src/poll.ts):
  --   attempts      Real attempts used, incremented when a worker claims the
  --                 row. Rate-limit bounces give theirs back. The worker gives
  --                 up (status 'failed', reviewer emailed) at MAX_ATTEMPTS.
  --   locked_by     Which worker holds the row while it is 'processing'.
  --   heartbeat_at  Refreshed every minute by that worker. A 'processing' row
  --                 whose heartbeat is older than the lease (10 min) belongs to
  --                 a worker that died, and any worker may reclaim it.
  --   progress      Saved output of each finished stage (audit result,
  --                 translation, published report, emails sent), so a retry
  --                 resumes where the last attempt stopped instead of
  --                 re-running the expensive claude -p audit or sending an
  --                 email twice.
  attempts integer not null default 0,
  locked_by text,
  heartbeat_at timestamptz,
  progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audit_requests_status_created_at_idx
  on audit_requests (status, created_at);
create index if not exists audit_requests_scheduled_send_at_idx
  on audit_requests (scheduled_send_at) where status = 'scheduled';
create index if not exists audit_requests_is_test_created_at_idx
  on audit_requests (is_test, created_at);
create index if not exists audit_requests_processing_heartbeat_idx
  on audit_requests (heartbeat_at) where status = 'processing';

-- One free audit per website, ever (2026-09-09; the per-email limit was
-- dropped 2026-10-13). The audit is expensive — a `claude -p` run with live
-- browser access, then a human review pass before it's sent — so it's
-- offered exactly once per site, regardless of how the first one turned
-- out. api/_lib/audit-intake.js checks for an existing row before inserting
-- so the visitor gets a real explanation, but this index is what makes the
-- limit hold when two submissions race each other. Partial on purpose: test
-- rows never consume a site's one audit.
create unique index if not exists audit_requests_website_hostname_key
  on audit_requests (website_hostname) where is_test = false;

alter table audit_requests enable row level security;
-- No public policies are created on purpose: the Vercel functions and the
-- worker all use the Supabase secret key (server-side only, never exposed to
-- the browser), which bypasses RLS entirely. ga4_oauth_data/gtm_oauth_data
-- carry OAuth-scoped payloads at rest, so this table must never be reachable
-- with the anon/public key. The same holds for every table below.

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

-- ---------------------------------------------------------------------------
-- audit_digest_log: singleton-ish log of daily-digest sends
-- (audit-worker/src/poll.ts checks the latest row's date before sending
-- another) — a real table instead of in-memory state so a worker restart
-- never causes a duplicate or a missed digest for the day.
-- ---------------------------------------------------------------------------
create table if not exists audit_digest_log (
  id bigint generated always as identity primary key,
  sent_at timestamptz not null default now()
);

alter table audit_digest_log enable row level security;

-- ---------------------------------------------------------------------------
-- checklist_points: reference/display copy of audit-worker/src/checklist.ts's
-- checklist points — NOT the live source the audit pipeline reads from.
-- audit-prompt.ts and scoring.ts import checklist.ts directly at runtime; this
-- table exists so the points + their descriptions are queryable (and
-- editable) from Supabase. Kept in sync by running `npm run seed-checklist`
-- in audit-worker/ after any checklist.ts edit — not on every audit run. The
-- seed upserts and never deletes, so a point removed from checklist.ts has to
-- be deleted here by hand.
-- ---------------------------------------------------------------------------
create table if not exists checklist_points (
  id text primary key,
  category text not null check (category in ('GA4', 'GTM', 'Website')),
  title text not null,
  expected_state text not null,
  common_failure text not null,
  validate text not null,
  severity text not null check (severity in ('critical', 'medium', 'low')),
  -- Preserves checklist.ts's own array order within a category — the order
  -- points are actually evaluated/displayed in, not alphabetical by id.
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklist_points_category_sort_idx
  on checklist_points (category, sort_order);

alter table checklist_points enable row level security;

create or replace function set_checklist_points_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists checklist_points_set_updated_at on checklist_points;
create trigger checklist_points_set_updated_at
  before update on checklist_points
  for each row
  execute function set_checklist_points_updated_at();

-- ---------------------------------------------------------------------------
-- report_pages: one row per published live audit-report page.
-- audit_requests.report_url holds the full link for email delivery; this is
-- the dedicated, queryable record of "the links of the pages" — the row
-- api/audit-report.js serves from (and checks the linked request's status
-- against, see api/_lib/report-access.js) and api/report/edit.js reads/writes
-- when a report's content needs to change after publishing.
-- ---------------------------------------------------------------------------
create table if not exists report_pages (
  id uuid primary key default gen_random_uuid(),
  audit_request_id uuid not null references audit_requests(id) on delete cascade,
  -- The site's domain, e.g. "tharaa-shop"; "test_tharaa-shop" for a test
  -- run (see audit-worker/src/supabase.ts's reportSlug()).
  slug text not null unique,
  -- Only for old reports still served as an HTML file, e.g.
  -- "reports/tharaa-shop/index.html". Reports from 2026-10-20 on are rows
  -- in audit_reports/audit_findings and have none.
  storage_path text,
  -- Which Storage bucket that old file is in: 'audit-reports' normally,
  -- 'audit-reports-test' for a test-mode run (see audit_requests.is_test).
  bucket text not null default 'audit-reports',
  public_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_pages_audit_request_id_idx
  on report_pages (audit_request_id);

alter table report_pages enable row level security;

create or replace function set_report_pages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists report_pages_set_updated_at on report_pages;
create trigger report_pages_set_updated_at
  before update on report_pages
  for each row
  execute function set_report_pages_updated_at();

-- ---------------------------------------------------------------------------
-- audit_reports / audit_findings: the final result of each audit as rows.
-- The worker writes them (audit-worker/src/supabase.ts saveAuditReport);
-- /audit-reports/<slug> is a static page that fetches them through
-- api/audit-report.js and renders them in the browser. The overall score and
-- per-category tallies are not stored: the page counts passes from
-- audit_findings, so editing a status updates the score.
-- ---------------------------------------------------------------------------
create table if not exists audit_reports (
  audit_request_id uuid primary key references audit_requests(id) on delete cascade,
  -- The report date shown on the page.
  generated_at timestamptz not null default now(),
  discovered_pages jsonb not null default '[]',
  page_speed jsonb,
  ga4_metrics jsonb,
  ga4_facts jsonb,
  -- The friction (FUD) result without its findings, or {"error": ...}.
  friction jsonb,
  screenshot_desktop_url text,
  screenshot_mobile_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table audit_reports enable row level security;

create or replace function set_audit_reports_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists audit_reports_set_updated_at on audit_reports;
create trigger audit_reports_set_updated_at
  before update on audit_reports
  for each row
  execute function set_audit_reports_updated_at();

create table if not exists audit_findings (
  id uuid primary key default gen_random_uuid(),
  audit_request_id uuid not null references audit_requests(id) on delete cascade,
  kind text not null check (kind in ('check', 'friction')),
  -- GA4 / GTM / Website for checks; the page type for friction rules.
  category text not null,
  -- The checklist id (GA4-03, W-22) or friction rule id (A1).
  point_id text not null,
  sort_order integer not null,
  status text not null,
  severity text,
  opportunity text,
  data_source text,
  technical jsonb not null,
  business jsonb not null,
  ar jsonb,
  action jsonb,
  protect text,
  criteria text,
  -- Friction-only fields: pexti, band, funnel, evidence, recommendation,
  -- exampleCopy, override, confidence, pageUrl...
  details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (audit_request_id, kind, point_id)
);

create index if not exists audit_findings_report_idx
  on audit_findings (audit_request_id, kind, sort_order);
-- "Every store failing GA4-03".
create index if not exists audit_findings_point_status_idx
  on audit_findings (point_id, status);

alter table audit_findings enable row level security;

create or replace function set_audit_findings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists audit_findings_set_updated_at on audit_findings;
create trigger audit_findings_set_updated_at
  before update on audit_findings
  for each row
  execute function set_audit_findings_updated_at();

-- ---------------------------------------------------------------------------
-- Storage buckets. The two report buckets are private and only hold old
-- reports still served as an HTML file. audit-images is public: screenshots
-- and friction crops at <audit_request_id>/<name>.jpg.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('audit-images', 'audit-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('audit-reports', 'audit-reports', false)
on conflict (id) do update set public = false;

-- Test-mode runs get their own bucket so throwaway reports never sit
-- alongside real client ones and the whole lot can be emptied without
-- touching client reports. audit-worker picks between the two by the row's
-- is_test flag (AUDIT_REPORTS_BUCKET vs AUDIT_REPORTS_TEST_BUCKET).
insert into storage.buckets (id, name, public)
values ('audit-reports-test', 'audit-reports-test', false)
on conflict (id) do update set public = false;
