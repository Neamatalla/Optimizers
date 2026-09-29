// Big platforms and marketplaces a visitor can't own: an audit of them (or of
// a shop page hosted on them) can't use the visitor's own GA4/GTM and would
// burn a pipeline run on a meaningless report. Kept in its own dependency-free
// file because the form (src/imports/GetFreeAudit.tsx) imports it too, and
// audit-intake.js holds internal addresses that must not reach the browser.

// Blocked including every subdomain:
export const BLOCKED_AUDIT_DOMAINS = [
  "google.com", "facebook.com", "instagram.com", "amazon.com", "amazon.ae", "amazon.sa", "amazon.eg",
  "noon.com", "ebay.com", "apple.com", "microsoft.com", "youtube.com", "tiktok.com", "x.com", "twitter.com",
  "linkedin.com", "wikipedia.org", "aliexpress.com", "etsy.com", "talabat.com", "careem.com",
  "whatsapp.com", "t.me", "linktr.ee",
];

// Store builders: only their own homepage is blocked, because customer stores
// live on their subdomains (e.g. yourstore.myshopify.com) and are auditable.
export const BLOCKED_AUDIT_APEX_ONLY = ["shopify.com", "myshopify.com", "wix.com", "wordpress.com", "salla.sa", "zid.store"];

export function isBlockedAuditDomain(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^www\./, "");
  return BLOCKED_AUDIT_DOMAINS.some(d => host === d || host.endsWith(`.${d}`)) || BLOCKED_AUDIT_APEX_ONLY.includes(host);
}

export const BLOCKED_DOMAIN_MESSAGE =
  "This looks like a large platform or marketplace we can't audit. Please enter your own store's website address.";
