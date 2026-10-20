-- Audit findings as rows (2026-10-20). Run once in the Supabase SQL editor
-- BEFORE deploying the API and worker from this version. Safe to re-run.
-- Also folded into supabase/schema.sql for fresh projects.
--
-- Until now each report was one rendered HTML file in the audit-reports
-- bucket. From this version the worker writes the final result as rows, and
-- /audit-reports/<slug> is a static page that fetches them through
-- api/audit-report.js and renders them in the browser.
--
--   audit_reports   One row per audit: report-level data (GA4 numbers,
--                   PageSpeed, friction summary, screenshot URLs).
--   audit_findings  One row per check (kind 'check', e.g. GA4-03) and per
--                   friction rule (kind 'friction', e.g. A1).
--   audit-images    Public bucket for screenshots and friction crops, at
--                   <audit_request_id>/<name>.jpg.
--
-- The overall score and per-category tallies are not stored: the page counts
-- passes from audit_findings, so editing a status updates the score.
-- report_pages stays the slug lookup; storage_path is now only set for old
-- reports still served as an HTML file.

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

-- New reports have no HTML file.
alter table report_pages
  alter column storage_path drop not null;

insert into storage.buckets (id, name, public)
values ('audit-images', 'audit-images', true)
on conflict (id) do update set public = true;
