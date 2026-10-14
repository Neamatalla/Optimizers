-- The e-commerce platform Intellia's e-store check found on the form's
-- website step (api/_lib/detect-tracking.js's checkStore), e.g. 'Shopify'.
-- null when Intellia was unavailable or not configured. Existing rows get null.
alter table audit_requests
  add column if not exists store_platform text;
