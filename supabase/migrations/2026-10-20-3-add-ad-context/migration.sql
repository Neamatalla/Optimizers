-- The media buyer's ad, typed on the form (optional): { text, coupon } — the
-- headline or offer the ad promises and a coupon code. Cleaned by
-- api/_lib/audit-intake.js's cleanAdContext. The audit compares it with the
-- landing page and the cart. null when not given. Existing rows get null.
alter table audit_requests
  add column if not exists ad_context jsonb;
