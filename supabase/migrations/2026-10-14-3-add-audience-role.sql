-- "Your role" on the free-audit form (2026-10-14). Run once in the Supabase
-- SQL editor BEFORE deploying the form/API from this version: the API writes
-- this column on every insert, so an older table rejects new submissions.
-- Safe to re-run. Also folded into supabase/schema.sql for fresh projects.
--
--   audience_role  Who the report is written for: media_buyer,
--                  marketing_manager or store_owner. Same 50 checks for every
--                  role; the worker changes the voice and what the report
--                  surfaces first (audit-worker/src/audience.ts). Null on
--                  rows from before the field: the default store-owner report.

alter table audit_requests
  add column if not exists audience_role text;

alter table audit_requests
  drop constraint if exists audit_requests_audience_role_check;
alter table audit_requests
  add constraint audit_requests_audience_role_check
  check (audience_role is null or audience_role in ('media_buyer', 'marketing_manager', 'store_owner'));
