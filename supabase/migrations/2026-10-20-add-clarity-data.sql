-- Microsoft Clarity snapshot pulled at intake by api/clarity/connect.js from
-- a token the visitor pasted on the form (rebuilt from known fields by
-- api/_lib/clarity.js's sanitizeClaritySnapshot). The token itself is never
-- stored. null when the visitor didn't connect Clarity. Existing rows get null.
alter table audit_requests
  add column if not exists clarity_data jsonb;
