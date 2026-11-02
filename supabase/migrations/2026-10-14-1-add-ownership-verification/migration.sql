-- Ownership verification: which checks showed the visitor owns the website
-- they asked to audit (see api/_lib/ownership-verification.js). Recorded
-- only; nothing acts on it yet. Existing rows get '{}', so is_verified = false.
alter table audit_requests
  add column if not exists verification_methods text[] not null default '{}'
    constraint audit_requests_verification_methods_check
    check (verification_methods <@ array['email_domain', 'ga4_stream_url', 'ga4_site_tag', 'gtm_container_domain', 'gtm_site_tag']::text[]);

alter table audit_requests
  add column if not exists is_verified boolean
    generated always as (cardinality(verification_methods) > 0) stored;
