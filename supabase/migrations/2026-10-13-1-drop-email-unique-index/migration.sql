-- One free audit per website only: the same email may now request audits
-- for different sites. The website_hostname unique index stays.
drop index if exists audit_requests_email_normalized_key;
