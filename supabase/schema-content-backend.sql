-- Run this once against the Supabase project, same way as schema.sql
-- (SQL Editor -> New query -> paste -> Run). Adds two tables on top of
-- audit_requests (schema.sql): checklist_points and report_pages.

-- Reference/display copy of audit-worker/src/checklist.ts's checklist
-- points — NOT the live source the audit pipeline reads from.
-- audit-prompt.ts and scoring.ts still import checklist.ts directly at
-- runtime, unchanged; this table exists so the points + their descriptions
-- are queryable (and editable) from Supabase for whatever downstream use
-- needs that. Kept in sync by running `npm run seed-checklist` in
-- audit-worker/ after any checklist.ts edit — it is NOT automatically kept
-- in sync on every audit run. NOTE: if this table was already seeded before
-- the PageSpeed category was removed, re-run seed-checklist and manually
-- `delete from checklist_points where category = 'PageSpeed'` — the upsert
-- never deletes stale rows on its own.
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
-- No public policies on purpose — service-role key only, same discipline as
-- audit_requests below.

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

-- One row per published live audit-report page. audit_requests.report_url
-- already holds the full link for email delivery, but this is the
-- dedicated, queryable record of "the links of the pages" — and the exact
-- row api/report/edit.js reads/writes against when a report's content
-- needs to change after publishing.
create table if not exists report_pages (
  id uuid primary key default gen_random_uuid(),
  audit_request_id uuid not null references audit_requests(id) on delete cascade,
  slug text not null unique,
  -- e.g. "reports/nour-home-goods-a1b2c3/index.html" — same bucket/path
  -- convention audit-worker/src/supabase.ts's publishAuditReport() already
  -- uses, just recorded as a row instead of only living in Storage.
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_pages_audit_request_id_idx
  on report_pages (audit_request_id);

alter table report_pages enable row level security;
-- No public policies on purpose — both audit-worker and api/report/edit.js
-- use the Supabase secret key server-side only, same as audit_requests.

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
