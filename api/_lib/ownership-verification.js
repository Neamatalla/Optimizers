// Ownership verification for the "Get a Free Audit" form: does the visitor
// actually own the website they asked us to audit? Recorded on the row as
// audit_requests.verification_methods (is_verified is derived from it in
// Postgres, see supabase/schema.sql). Nothing acts on it yet: it's a signal
// on the record, not a gate.
//
// Used by api/audit-request.js. None of this touches req/res.
//
// Each method is recorded on its own, and A/B are kept apart per tool,
// because they're not equally strong:
//   email_domain          The email's domain is the website's domain.
//   ga4_stream_url        The submitted GA4 property's web stream URL is the
//                         website. Typed by whoever created the property, so
//                         it's a claim, not proof.
//   ga4_site_tag          The submitted GA4 property's measurement ID is live
//                         on the website (in its HTML, or inside a GTM
//                         container that's itself matched to the site).
//   gtm_container_domain  The submitted GTM container lists the website in
//                         its own domain settings. A claim, like the stream URL.
//   gtm_site_tag          The submitted GTM container's ID is live on the
//                         website.
//
// Trust caveat: ga4OAuthData/gtmOAuthData and the email arrive from the
// browser unsigned, so a hand-made POST can claim any of these. Fine while
// nothing acts on the flag; before anything does, the OAuth callback needs to
// sign what Google actually returned and intake needs to check it.
//
// GTM: the gtm_* methods read the container shape
// api/_lib/google-oauth.js's fetchAllGTMContainers returns (publicId,
// domainName, discoveredGa4MeasurementIds). They only fire when the visitor
// connected GTM through the OAuth flow.

import { getDomain } from "tldts";
import { detectTracking } from "./detect-tracking.js";
import { normalizeHostname } from "./audit-intake.js";
import { BLOCKED_AUDIT_APEX_ONLY } from "./blocked-domains.js";
import { log } from "./log.js";

export const VERIFICATION_METHODS = [
  "email_domain",
  "ga4_stream_url",
  "ga4_site_tag",
  "gtm_container_domain",
  "gtm_site_tag",
];

/**
 * The part of a hostname one owner controls: "shop.brand.com.sa" and
 * "brand.com.sa" both give "brand.com.sa". Uses the Public Suffix List
 * (private section included), so "mystore.myshopify.com" stays whole rather
 * than collapsing to "myshopify.com". Store builders the list doesn't know
 * (salla.sa, zid.store, see BLOCKED_AUDIT_APEX_ONLY) get the same treatment:
 * their subdomains are separate customers' stores, so the full hostname is
 * the owner. Returns "" for anything without one (IPs, bare suffixes).
 */
export function ownerDomain(hostname) {
  const host = normalizeHostname(hostname);
  if (!host) return "";
  const domain = getDomain(host, { allowPrivateDomains: true });
  if (!domain) return "";
  if (BLOCKED_AUDIT_APEX_ONLY.includes(domain)) return host === domain ? "" : host;
  return domain;
}

function sameOwner(a, b) {
  const ownerA = ownerDomain(a);
  return !!ownerA && ownerA === ownerDomain(b);
}

const upperSet = values => new Set((Array.isArray(values) ? values : []).filter(v => typeof v === "string").map(v => v.toUpperCase()));

// The payloads come from the browser, so read them defensively: anything
// that isn't the expected shape just doesn't match.
const asObject = value => (value && typeof value === "object" && !Array.isArray(value) ? value : null);

export function emailMatchesWebsite(email, websiteHostname) {
  const domain = String(email || "").trim().split("@").pop();
  return sameOwner(domain, websiteHostname);
}

export function ga4StreamUrlMatches(ga4OAuthData, websiteHostname) {
  const property = asObject(ga4OAuthData);
  if (!property || !Array.isArray(property.dataStreams)) return false;
  return property.dataStreams.some(stream => sameOwner(stream?.webStreamData?.defaultUri ?? "", websiteHostname));
}

export function gtmContainerDomainMatches(gtmOAuthData, websiteHostname) {
  const container = asObject(gtmOAuthData);
  if (!container || !Array.isArray(container.domainName)) return false;
  return container.domainName.some(domain => sameOwner(domain, websiteHostname));
}

export function gtmSiteTagMatches(gtmOAuthData, siteScan) {
  const container = asObject(gtmOAuthData);
  if (!container || typeof container.publicId !== "string") return false;
  return upperSet(siteScan?.gtmContainerIds).has(container.publicId.toUpperCase());
}

/**
 * GA4 counts as live on the site when its measurement ID is in the site's
 * HTML, or configured inside the submitted GTM container once that container
 * is itself matched to the site: the second covers GA4 deployed through GTM,
 * which the plain HTML scan can't see.
 */
export function ga4SiteTagMatches(ga4OAuthData, gtmOAuthData, siteScan, websiteHostname) {
  const property = asObject(ga4OAuthData);
  if (!property || typeof property.measurementId !== "string") return false;
  const liveIds = upperSet(siteScan?.ga4MeasurementIds);
  if (gtmSiteTagMatches(gtmOAuthData, siteScan) || gtmContainerDomainMatches(gtmOAuthData, websiteHostname)) {
    for (const id of upperSet(asObject(gtmOAuthData).discoveredGa4MeasurementIds)) liveIds.add(id);
  }
  return liveIds.has(property.measurementId.toUpperCase());
}

/**
 * Every method that passes, in VERIFICATION_METHODS order; [] when none do.
 * Scans the live site only when there's Google data to check against it,
 * so a submission without Google access never waits on the scan (capped at
 * 8s by detectTracking). Never throws: a failed scan only means the two
 * site_tag methods don't pass, never a failed submission.
 */
export async function verifyOwnership({ email, website, websiteHostname, ga4OAuthData, gtmOAuthData }) {
  const passed = new Set();
  if (emailMatchesWebsite(email, websiteHostname)) passed.add("email_domain");
  if (ga4StreamUrlMatches(ga4OAuthData, websiteHostname)) passed.add("ga4_stream_url");
  if (gtmContainerDomainMatches(gtmOAuthData, websiteHostname)) passed.add("gtm_container_domain");

  if (asObject(ga4OAuthData) || asObject(gtmOAuthData)) {
    let siteScan = null;
    try {
      siteScan = await detectTracking(String(website).trim());
    } catch (err) {
      log.error("Ownership verification site scan failed", { error: err?.message || err });
    }
    if (ga4SiteTagMatches(ga4OAuthData, gtmOAuthData, siteScan, websiteHostname)) passed.add("ga4_site_tag");
    if (gtmSiteTagMatches(gtmOAuthData, siteScan)) passed.add("gtm_site_tag");
  }

  return VERIFICATION_METHODS.filter(method => passed.has(method));
}
