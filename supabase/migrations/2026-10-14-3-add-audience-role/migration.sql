-- "Your role" on the free-audit form. See README.md in this folder.
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
