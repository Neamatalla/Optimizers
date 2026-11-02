-- Fourth form role, "Agency / consultant". See README.md in this folder.

alter table audit_requests
  drop constraint if exists audit_requests_audience_role_check;
alter table audit_requests
  add constraint audit_requests_audience_role_check
  check (audience_role is null or audience_role in ('store_owner', 'media_buyer', 'marketing_manager', 'agency'));
