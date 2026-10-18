-- Fourth form role, "Agency / consultant" (2026-10-15). Run once in the
-- Supabase SQL editor after after 2026-10-14-3-add-audience-role.sql and BEFORE
-- deploying the form from this version. Until it runs, an "agency"
-- submission is still saved, just without its role (api/_lib/audit-intake.js
-- insertAuditRequest). Safe to re-run. Also folded into supabase/schema.sql.

alter table audit_requests
  drop constraint if exists audit_requests_audience_role_check;
alter table audit_requests
  add constraint audit_requests_audience_role_check
  check (audience_role is null or audience_role in ('store_owner', 'media_buyer', 'marketing_manager', 'agency'));
