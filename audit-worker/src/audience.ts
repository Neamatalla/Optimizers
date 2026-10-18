// Who the report is written for: the "Your role" dropdown on the free-audit
// form (src/imports/GetFreeAudit.tsx), stored as audit_requests.audience_role.
// One role per ICP card (repo docs ICP1-ICP4):
//
//   store_owner        ICP1  self-serve GCC store owner, "fix it myself"
//   media_buyer        ICP2  media buyer, "prove it's not my ads"
//   marketing_manager  ICP3  marketing director / manager, "show my CEO and team"
//   agency             ICP4  agency / consultant, "a deliverable for my client"
//
// Every role gets the same 50 points, statuses and numbers: the store is the
// same whoever reads about it, which keeps scores comparable and the GA4
// facts deterministic. What a role changes is the voice of the business text
// (a reader brief in icp/), the report's first section and highlighted
// metrics, the copy around the checks, the email, and the Arabic register.
// Null (rows from before the field) keeps the original store-owner report.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type AudienceRole = "store_owner" | "media_buyer" | "marketing_manager" | "agency";

export const AUDIENCE_ROLES: readonly AudienceRole[] = ["store_owner", "media_buyer", "marketing_manager", "agency"];

export const ROLE_LABEL: Record<AudienceRole, { en: string; ar: string }> = {
  store_owner: { en: "E-commerce store owner", ar: "صاحب متجر إلكتروني" },
  media_buyer: { en: "Media buyer", ar: "Media Buyer" },
  marketing_manager: { en: "Marketing director / manager", ar: "مدير التسويق" },
  agency: { en: "Agency / consultant", ar: "وكالة / استشاري" },
};

export function audienceRoleOf(value: unknown): AudienceRole | null {
  return typeof value === "string" && (AUDIENCE_ROLES as readonly string[]).includes(value) ? (value as AudienceRole) : null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICP_DIR = path.join(__dirname, "..", "icp");
const BRIEF_FILES: Record<AudienceRole, string> = {
  store_owner: "store-owner.md",
  media_buyer: "media-buyer.md",
  marketing_manager: "marketing-manager.md",
  agency: "agency.md",
};

/**
 * The reader brief added to the audit prompt, or null for no role (default
 * voice). The "## Arabic" section is cut: the audit writes English only, and
 * the Arabic register reaches the translation step through
 * arabicRegisterRule. Left in, the audit wrote its English fields in Arabic.
 */
export function readerBrief(role: AudienceRole | null | undefined): string | null {
  if (!role) return null;
  const file = BRIEF_FILES[role];
  try {
    const text = fs.readFileSync(path.join(ICP_DIR, file), "utf8").replace(/\r\n/g, "\n");
    return text.replace(/\n## Arabic\b[\s\S]*?(?=\n## |$)/, "").trim();
  } catch (err) {
    // A missing brief must not fail a paid-for audit: it falls back to the
    // default voice, and the log says why.
    console.warn(`[audit-worker] Reader brief ${file} unreadable, using the default voice: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

// ---- Arabic register per reader (translate-ar.ts, fud/judge.ts) ----
// From each ICP card's language section.
const LATIN_AD_TERMS = "ROAS, CAC, CPA, CPP, CPC, CVR, AOV, MER, CAPI, Conversions API, Pixel, Events Manager, EMQ, event_id, UTM, fbclid, gclid, ttclid, and event names such as Purchase, Add to Cart, ViewContent, InitiateCheckout";

export function arabicRegisterRule(role: AudienceRole | null | undefined): string | null {
  switch (role) {
    case "store_owner":
      return "This report's business text is for the STORE OWNER in the Gulf, mostly Saudi Arabia. Write the business text in native, plain Gulf/Saudi Arabic, not formal MSA and with no Egyptian words: توصيل (not شحن) for delivery, أضف للسلة for add to cart. Money in the store's currency, Western digits only.";
    case "media_buyer":
      return `This report's business text is for a MEDIA BUYER (the person running the store's paid ads), not the owner, usually Egyptian. Write the business text in everyday Egyptian-friendly Arabic, not formal MSA, addressed to the buyer. Keep these terms in Latin script exactly as written, without brackets: ${LATIN_AD_TERMS}. Ad platform names (Meta, Snapchat, TikTok, Google Ads) stay in Latin script too. For these terms this replaces the Arabic glossary above.`;
    case "marketing_manager":
      return "This report's business text is for a MARKETING DIRECTOR OR MANAGER who shares it with a bilingual team and the CEO. Use clear, professional Modern Standard Arabic suited to a briefing, and keep KPI names such as ROAS, CAC and AOV in Latin script.";
    case "agency":
      return "This report's business text is for an AGENCY that will forward it to its merchant client. Use professional, neutral, client-safe Modern Standard Arabic. Refer to the store as «المتجر», never as if the reader owns it.";
    default:
      return null;
  }
}

/** The conversion-review judge's business-voice lines per reader (fud/judge.ts). */
export function judgeBusinessRule(role: AudienceRole | null | undefined): string | null {
  switch (role) {
    case "store_owner":
      return `- business: for the STORE OWNER who fixes things themselves in their store admin. Money first: what the shopper experiences and what it costs in sales, in plain words, no jargon. summary = one line, detail = 2-4 sentences. Speak to the owner ("your cart", "your customers").
- recommendation: for warn/fail, one or two imperative sentences naming exactly what to add or change and where on this store, so the owner can do it in the store admin. No "consider" or "review". Omit for pass.`;
    case "media_buyer":
      return `- business: for the MEDIA BUYER running this store's paid ads, not the owner. What a shopper who clicked an ad experiences on this page, and what it does to conversion rate, ROAS or CAC on that paid traffic. Use their terms directly (ROAS, CAC, CPA, CVR, AOV, landing page, paid traffic). Never invent ad spend or ROAS figures. summary = one line, detail = 2-4 sentences. Say "the store" for the shop and "your campaigns" for their ads.
- recommendation: for warn/fail, one or two imperative sentences naming exactly what to add or change and where on this store. The buyer forwards it to the store owner or developer, so no "consider" or "review". Omit for pass.`;
    case "marketing_manager":
      return `- business: for the MARKETING DIRECTOR OR MANAGER who prioritizes fixes for the team and reports to the CEO. What the shopper experiences, what it does to conversion and sales, and how much it matters. Clear and professional. summary = one line, detail = 2-4 sentences.
- recommendation: for warn/fail, one or two imperative sentences naming exactly what to change and where, written as a brief the manager can hand to the developer, designer or copywriter. No "consider" or "review". Omit for pass.`;
    case "agency":
      return `- business: for an AGENCY that will show this to its merchant client. Neutral, professional and defensible: what the shopper experiences, the effect on conversion and sales, and the evidence. Refer to "the store", never "your store". No selling. summary = one line, detail = 2-4 sentences.
- recommendation: for warn/fail, one or two imperative sentences naming exactly what to change and where on this store, written as a scoped task. No "consider" or "review". Omit for pass.`;
    default:
      return null;
  }
}

// ---- what each reader treats as critical ----
// The checklist severity is the store's severity and stays on the finding.
// Each reader sees it moved one step up or down by what their ICP card says
// they are judged on (roleSeverity): the summary's critical count, the first
// section, the ordering inside each tool and the severity tags all use it.
// Pass/fail and the 50-check score never change.

type Sev = "critical" | "medium" | "low";
const SEV_STEPS: Sev[] = ["low", "medium", "critical"];

// Points that are about money, checkout and payment for the owner (ICP1:
// money-first, GCC payments, WhatsApp, delivery; fix it myself).
const OWNER_UP = new Set([
  "GA4-01", "GA4-02", "GA4-03", "GA4-04", "GA4-05", "GA4-06", "GA4-10", "GA4-11", "GA4-12",
  "W-01", "W-02", "W-07", "W-08", "W-09", "W-20", "W-31", "W-45",
]);
// Analytics hygiene an owner can't act on and doesn't feel in sales.
const OWNER_DOWN = new Set([
  "GA4-08", "GA4-13", "GA4-14", "GA4-17", "GA4-21", "GA4-22", "GA4-23", "GA4-25",
  "GTM-06", "GTM-07", "GTM-08", "GTM-09", "GTM-10", "GTM-12", "GTM-13", "GTM-14", "GTM-15", "GTM-19", "GTM-20", "GTM-22", "GTM-23",
  "W-12", "W-14", "W-15", "W-16", "W-18", "W-19", "W-21", "W-23", "W-27", "W-28", "W-38", "W-39", "W-42", "W-43", "W-46", "W-48", "W-49", "W-50",
]);
// ICP3 KPIs: conversion by source, mobile vs desktop, ROAS/CAC, local
// payments, privacy and compliance; numbers they can defend to the CEO.
const MANAGER_UP = new Set([
  "GA4-01", "GA4-05", "GA4-06", "GA4-07", "GA4-08", "GA4-18", "GA4-19", "GA4-20", "GA4-24",
  "GTM-01", "GTM-04", "GTM-05", "GTM-16", "GTM-17", "GTM-18", "GTM-25",
  "W-29", "W-30", "W-35",
]);
const MANAGER_DOWN = new Set([
  "GTM-09", "GTM-10", "GTM-13", "GTM-15", "GTM-19", "GTM-20", "GTM-22",
  "W-12", "W-14", "W-15", "W-16", "W-18", "W-19", "W-27", "W-38", "W-39", "W-42", "W-43", "W-48", "W-49", "W-50",
]);
// ICP4: a wrong number in front of the client burns the agency, so data
// accuracy goes up; client-facing trust and compliance stay visible.
const AGENCY_UP = new Set([
  "GA4-15", "GA4-18", "GA4-19", "GA4-20", "GA4-22", "GTM-01", "GTM-02", "GTM-03", "GTM-07", "W-24", "W-33", "W-34",
]);
const AGENCY_DOWN = new Set(["GTM-15", "W-38", "W-48", "W-49", "W-50"]);

/** For tests: every id in these sets must be a real checklist point. */
export const ROLE_SEVERITY_IDS = [OWNER_UP, OWNER_DOWN, MANAGER_UP, MANAGER_DOWN, AGENCY_UP, AGENCY_DOWN].flatMap(set => [...set]);

function stepOf(role: AudienceRole, id: string): -1 | 0 | 1 {
  switch (role) {
    case "media_buyer": {
      const lane = mediaBuyerLane(id);
      return lane === "other" ? -1 : 1;
    }
    case "store_owner": return OWNER_UP.has(id) ? 1 : OWNER_DOWN.has(id) ? -1 : 0;
    case "marketing_manager": return MANAGER_UP.has(id) ? 1 : MANAGER_DOWN.has(id) ? -1 : 0;
    case "agency": return AGENCY_UP.has(id) ? 1 : AGENCY_DOWN.has(id) ? -1 : 0;
  }
}

/** The severity this reader sees for a point: the checklist severity moved one step by the reader's ICP. */
export function roleSeverity<S extends Sev>(role: AudienceRole | null | undefined, checklistId: string, base: S): Sev {
  if (!role) return base;
  const i = SEV_STEPS.indexOf(base) + stepOf(role, checklistId);
  return SEV_STEPS[Math.max(0, Math.min(2, i))];
}

// ---- lanes: which question a point answers ----
// "Is the number real?" (signal: what the ad platforms and GA4 see) and "does
// traffic convert?" (post-click). Used by the media buyer's two lists, the
// agency's workstreams and the media buyer's email ordering.

/** Points about what the ad platforms and GA4 see: purchases, values, events, click IDs, consent. */
export const SIGNAL_POINTS: ReadonlySet<string> = new Set([
  "GTM-01", "GTM-02", "GTM-03", "GTM-04", "GTM-05", "GTM-06", "GTM-07", "GTM-08", "GTM-14",
  "GTM-16", "GTM-17", "GTM-21", "GTM-24", "GTM-25",
  "GA4-14", "GA4-17", "GA4-18", "GA4-19", "GA4-20", "GA4-21",
  "W-21", "W-22", "W-23", "W-24", "W-25", "W-26", "W-28", "W-29",
]);

/** Points about what happens after the click: funnel steps, landing pages, speed, mobile, cart. */
export const POST_CLICK_POINTS: ReadonlySet<string> = new Set([
  "GA4-01", "GA4-02", "GA4-03", "GA4-04", "GA4-05", "GA4-06", "GA4-07", "GA4-10", "GA4-11",
  "W-01", "W-02", "W-03", "W-04", "W-07", "W-08", "W-09", "W-10", "W-11", "W-17", "W-20", "W-44",
]);

export type MediaBuyerLane = "signal" | "post_click" | "other";

export function mediaBuyerLane(checklistId: string): MediaBuyerLane {
  if (SIGNAL_POINTS.has(checklistId)) return "signal";
  if (POST_CLICK_POINTS.has(checklistId)) return "post_click";
  return "other";
}

/**
 * Sort key for failed points (lower first). Severity still leads within a
 * lane, but a medium signal or post-click problem outranks a critical one the
 * buyer can't act on through their campaigns (an exposed file, a missing
 * privacy line): 0/1/2 by severity, plus 0 for signal, 0.5 for post-click,
 * 1.5 for the rest.
 */
export function mediaBuyerRank(checklistId: string, severityRank: number): number {
  const lane = mediaBuyerLane(checklistId);
  return severityRank + (lane === "signal" ? 0 : lane === "post_click" ? 0.5 : 1.5);
}
