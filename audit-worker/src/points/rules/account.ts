import type { ClarityBreakdownRow, ClaritySnapshot } from "../../clarity-facts.js";
import { parseGtm } from "../gtm.js";
import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";

/**
 * Rules read from the store's own accounts: Clarity (the raw snapshot pulled
 * at intake), GTM (the container export) and one GA4 number.
 */

// ---- Clarity ----
// Clarity numbers are a 3-day snapshot; a page needs this many sessions to judge.
const MIN_SESSIONS = 100;

function clarityOk(c: ClaritySnapshot | null | undefined): string | null {
  if (!c || c.source !== "clarity") return "Clarity isn't connected for this store.";
  if (!c.hostMatch) return "The Clarity project is for a different site than the one audited.";
  if (!c.byUrl) return "Clarity didn't return per-page numbers this time.";
  return null;
}

function pathOf(url: string): string {
  try {
    return decodeURIComponent(new URL(url, "https://x.invalid").pathname).replace(/\/+$/, "") || "/";
  } catch {
    return url.split("?")[0];
  }
}
const isProduct = (url: string) => /\/products?\/[^/]+/i.test(pathOf(url));
const isCart = (url: string) => /\/(cart|basket|bag)(\/|$)/i.test(pathOf(url));

// Session-weighted share of a behaviour across rows (row values are % of sessions).
function weighted(rows: ClarityBreakdownRow[], key: keyof ClarityBreakdownRow): number | null {
  const valid = rows.filter(r => typeof r[key] === "number");
  const sessions = valid.reduce((s, r) => s + r.sessions, 0);
  return sessions ? Math.round((valid.reduce((s, r) => s + (r[key] as number) * r.sessions, 0) / sessions) * 10) / 10 : null;
}

// Compares page-level behaviour shares with the site's own share.
function compare(label: string, rows: ClarityBreakdownRow[], c: ClaritySnapshot, keys: Array<"scriptErrors" | "errorClicks" | "deadClicks" | "rageClicks" | "quickbacks">): RuleResult {
  const sessions = rows.reduce((s, r) => s + r.sessions, 0);
  if (sessions < MIN_SESSIONS) return unverified(`The ${label} had ${sessions} sessions in Clarity's ${c.days}-day window; ${MIN_SESSIONS} are needed to judge.`);
  const facts: NonNullable<RuleResult["facts"]> = { sessions };
  const worse: string[] = [];
  const parts: string[] = [];
  for (const k of keys) {
    const page = weighted(rows, k);
    const site = c.behaviours?.[k]?.sessionsPct ?? null;
    if (page === null || site === null) continue;
    facts[`${k}Page`] = page;
    facts[`${k}Site`] = site;
    parts.push(`${k} ${page}% vs ${site}% site-wide`);
    if (page > site) worse.push(`${k} ${page}% vs ${site}%`);
  }
  if (!parts.length) return unverified(`Clarity gave no ${keys.join("/")} numbers for the ${label}.`);
  return worse.length
    ? { status: "fail", reason: `On the ${label} (${sessions} sessions), ${worse.join(" and ")} site-wide.`, facts }
    : { status: "pass", reason: `On the ${label} (${sessions} sessions): ${parts.join("; ")}.`, facts };
}

const path06: Rule = ({ clarity: c }) => {
  const bad = clarityOk(c);
  if (bad) return unverified(bad);
  const rows = c!.byUrl!.filter(r => isProduct(r.name) || isCart(r.name));
  if (!rows.length) return unverified("No product or cart page is among Clarity's top pages.");
  return compare("product and cart pages", rows, c!, ["scriptErrors", "errorClicks"]);
};

const pdp02: Rule = ({ clarity: c }) => {
  const bad = clarityOk(c);
  if (bad) return unverified(bad);
  const top = c!.byUrl!.filter(r => isProduct(r.name)).sort((a, b) => b.sessions - a.sessions)[0];
  if (!top) return unverified("No product page is among Clarity's top pages.");
  const r = compare(`most-visited product page (${pathOf(top.name)})`, [top], c!, ["deadClicks", "rageClicks"]);
  return { ...r, facts: { ...r.facts, url: top.name } };
};

const land05: Rule = ({ clarity: c }) => {
  const bad = clarityOk(c);
  if (bad) return unverified(bad);
  // Clarity has no landing-page field: its most-visited page stands in.
  const topUrl = c!.topPages?.[0]?.url;
  const row = topUrl ? c!.byUrl!.find(r => pathOf(r.name) === pathOf(topUrl)) : undefined;
  if (!row) return unverified("Clarity's most-visited page has no per-page row to compare.");
  const r = compare(`most-visited page (${pathOf(row.name)})`, [row], c!, ["quickbacks"]);
  return { ...r, facts: { ...r.facts, url: row.name } };
};

// ---- GA4: items per order ----
const offer15: Rule = ({ ga4 }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const ipo = ga4.itemsPerOrder;
  if (ipo == null) return unverified("GA4 had no item or transaction numbers to divide this run.");
  return ipo >= 1.2
    ? { status: "pass", reason: `Orders hold ${ipo} items on average over 28 days.`, facts: { itemsPerOrder: ipo } }
    : { status: "fail", reason: `Orders hold ${ipo} items on average over 28 days: most shoppers buy a single item.`, facts: { itemsPerOrder: ipo } };
};

// ---- GTM ----
const trk11: Rule = ({ gtm }) => {
  const s = parseGtm(gtm);
  if (!s) return unverified("No GTM container was shared this run.");
  if (!s.conversionTags.length) {
    return unverified(s.unreadable.length
      ? `No purchase tag found; Custom HTML tag(s) ${s.unreadable.slice(0, 3).join(", ")} were cut off and may hold one.`
      : "No purchase or conversion tag in the GTM container (purchases may be sent by the store platform's own app).");
  }
  const problems: string[] = [];
  for (const t of s.conversionTags) {
    for (const tr of t.triggers) {
      if (tr.kind === "all_pages") problems.push(`"${t.name}" fires on All Pages`);
      else if (tr.kind === "page_view") problems.push(`"${t.name}" fires on a page view${tr.thankYouUrl ? " of the thank-you URL" : ""}`);
    }
    if (!t.sendsOrderId) problems.push(`"${t.name}" sends no order ID`);
  }
  const unknown = s.conversionTags.filter(t => t.triggers.some(tr => tr.kind === "unknown" || tr.kind === "other"));
  const facts = { conversionTags: s.conversionTags.map(t => `${t.name} (${t.platform})`) };
  if (problems.length) return { status: "fail", reason: `${problems.slice(0, 4).join("; ")}.`, facts };
  if (unknown.length) return unverified(`The trigger of ${unknown.map(t => `"${t.name}"`).join(", ")} couldn't be read from the export.`, facts);
  return { status: "pass", reason: `All ${s.conversionTags.length} purchase/conversion tag(s) fire on a dataLayer event and send an order ID.`, facts };
};

const ATC_HIT: Record<string, RegExp> = { meta: /^AddToCart$/, tiktok: /^AddToCart$/, snap: /^ADD_CART$/i };
const trk28: Rule = ({ gtm, evidence }) => {
  const s = parseGtm(gtm);
  const tags = (s?.tags ?? []).filter(t => !t.paused && ["meta", "tiktok", "snap"].includes(t.platform) && t.event);
  const hits = (evidence?.atcHits ?? []).filter(h => ATC_HIT[h.vendor]?.test(h.name));
  if (!tags.length && !hits.length) return unverified("No Meta, TikTok or Snap purchase or add-to-cart tag was seen (no GTM export, or the click didn't fire them).");
  const missing = [
    ...tags.filter(t => !t.sendsEventId).map(t => `GTM tag "${t.name}" (${t.platform} ${t.event})`),
    // Snap hits carry no readable parameters, so only Meta and TikTok are judged from the click.
    ...hits.filter(h => h.vendor !== "snap" && h.q && !h.q.eventId).map(h => `${h.vendor} AddToCart hit from our click`),
  ];
  const facts = { checked: tags.length + hits.length, missing };
  return missing.length
    ? { status: "fail", reason: `No event ID on ${missing.slice(0, 3).join(", ")}, so the platform can't drop the server-side copy if Conversions API also sends it.`, facts }
    : { status: "pass", reason: `Every Meta/TikTok/Snap purchase and add-to-cart tag or hit we saw carries an event ID.`, facts };
};

export const ACCOUNT_RULES: Record<string, Rule> = {
  "PATH-06": path06,
  "PDP-02": pdp02,
  "LAND-05": land05,
  "OFFER-15": offer15,
  "TRK-11": trk11,
  "TRK-28": trk28,
};
