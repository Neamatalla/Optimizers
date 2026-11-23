import type { Ga4CampaignRow } from "../../types.js";
import { parseGtm, type GtmPlatform, type GtmSummary } from "../gtm.js";
import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";

/**
 * Code part of the tracking points that used to go entirely to the AI
 * (decidedBy "code+ai"). Each rule settles what the data proves and says
 * "unverified" otherwise; the pipeline then hands only those to the AI.
 */

// A platform counts as "run" when paid campaigns sent it this many visits.
const MIN_PAID_SESSIONS = 30;
type Platform = "meta" | "tiktok" | "snap" | "ads";
const LABEL: Record<Platform, string> = { meta: "Meta", tiktok: "TikTok", snap: "Snapchat", ads: "Google Ads" };

function platformOfRow(r: Ga4CampaignRow): Platform | null {
  const src = `${r.source} ${r.campaign}`.toLowerCase();
  const paid = /^(cpc|paid|ppc|paid_social|paidsocial|social_paid)/i.test(r.medium) || /^paid/i.test(r.channel);
  if (!paid) return null;
  if (/facebook|^fb\b|instagram|^ig\b|meta/.test(src)) return "meta";
  if (/tiktok/.test(src)) return "tiktok";
  if (/snap/.test(src)) return "snap";
  if (/google/.test(r.source.toLowerCase())) return "ads";
  return null;
}

/** The platforms paid campaigns sent visits from, or null when GA4 has no campaign rows. */
export function paidPlatforms(rows: Ga4CampaignRow[] | undefined): { platform: Platform; sessions: number }[] | null {
  if (!rows?.length) return null;
  const by = new Map<Platform, number>();
  for (const r of rows) {
    const p = platformOfRow(r);
    if (p) by.set(p, (by.get(p) ?? 0) + r.sessions);
  }
  return [...by.entries()].filter(([, s]) => s >= MIN_PAID_SESSIONS).map(([platform, sessions]) => ({ platform, sessions }));
}

const NO_PAID = "GA4 shows no paid campaign traffic to judge this against.";
const join = (xs: string[]) => xs.join(", ");

const liveTags = (s: GtmSummary, platform: GtmPlatform) => s.tags.filter(t => !t.paused && t.platform === platform);

const trk43: Rule = ({ ga4 }) => {
  const f = ga4?.facts["GA4-21"];
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  if (!f || f.status === "no_data") return unverified(f?.en ?? "The Google Ads link list wasn't in the GA4 pull.");
  return { status: f.status, reason: f.en, facts: { fact: "GA4-21" } };
};

const trk05: Rule = ({ ga4, gtm }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const paid = paidPlatforms(ga4.campaigns);
  if (!paid) return unverified("GA4 gave no per-campaign visits this run.");
  const g = paid.find(p => p.platform === "ads");
  if (!g) return { status: "n/a", reason: "GA4 shows no google/cpc visits, so the store isn't running Google Ads.", facts: { paid: paid.map(p => p.platform) } };
  const s = parseGtm(gtm);
  if (!s) return unverified(`GA4 shows ${g.sessions} google/cpc visits, but no GTM container was shared, so the Ads conversion tag can't be checked.`, { googleCpcSessions: g.sessions });
  const conv = s.tags.filter(t => !t.paused && t.type === "awct");
  const linker = s.tags.some(t => !t.paused && t.type === "gclidw");
  const facts = { googleCpcSessions: g.sessions, conversionTags: conv.map(t => t.name), conversionLinker: linker };
  if (conv.length && linker) return { status: "pass", reason: `GTM has a Google Ads conversion tag (${join(conv.map(t => `"${t.name}"`))}) and a Conversion Linker.`, facts };
  const linked = ga4.facts["GA4-21"]?.status === "pass";
  if (linked) return unverified(`GTM has no ${conv.length ? "Conversion Linker" : "Google Ads conversion tag"}, but Google Ads is linked to GA4 and may import purchases from it.`, facts);
  return { status: "fail", reason: `Google Ads brings ${g.sessions} visits, but GTM has no ${conv.length ? "Conversion Linker" : "Google Ads conversion tag"} and Ads isn't linked to GA4, so Ads can't see sales.`, facts };
};

const PAGE_VIEW = /^page_?view$/i;
const ADD_CART = /^(AddToCart|ADD_CART)$/i;

const trk12: Rule = ({ ga4, evidence: e, gtm, siteChecks }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const paid = paidPlatforms(ga4.campaigns);
  if (!paid) return unverified("GA4 gave no per-campaign visits this run.");
  const pixels = paid.filter(p => p.platform !== "ads");
  if (!pixels.length) return { status: "n/a", reason: paid.length ? "The only paid platform is Google Ads; its tag is judged by the Google Ads point." : NO_PAID, facts: { paid: paid.map(p => p.platform) } };
  const pageHits = e?.pageHits ?? [];
  if (!pageHits.length) return unverified("Our visit recorded no tracking hits at all, so pixels can't be judged.");
  const s = parseGtm(gtm);
  const clickOk = Boolean(e?.addToCart.ok && e.addToCart.clickAdded !== false && e.addToCart.via !== "api" && e.atcHits);
  const bad: string[] = [];
  const open: string[] = [];
  const good: string[] = [];
  for (const { platform } of pixels) {
    const label = LABEL[platform as Platform];
    const mine = pageHits.filter(h => h.vendor === platform);
    const pv = mine.some(h => PAGE_VIEW.test(h.name));
    const hasTag = Boolean(s && liveTags(s, platform).length);
    if (!mine.length && !(e?.atcHits ?? []).some(h => h.vendor === platform)) {
      // A silent pixel may just not have loaded for our visit: only a store with no tag and no ID anywhere is clearly missing it.
      const hasId = Boolean(siteChecks?.pixelMap?.ids[platform]?.length);
      if (s && !hasTag && !hasId) bad.push(`${label} has paid visits but no pixel tag in GTM and none fired during our visit`);
      else open.push(`${label} pixel sent nothing during our visit`);
      continue;
    }
    if (!pv) { open.push(`${label} sent hits but no PageView`); continue; }
    if (!clickOk) { open.push(`${label} PageView seen; our Add to Cart tap didn't work, so AddToCart couldn't be checked`); continue; }
    const atc = (e!.atcHits ?? []).some(h => h.vendor === platform && ADD_CART.test(h.name));
    if (atc) good.push(label);
    else bad.push(`${label} sent PageView but no AddToCart after our tap`);
  }
  const facts = { platforms: pixels.map(p => LABEL[p.platform as Platform]), ok: good, problems: [...bad, ...open] };
  if (bad.length) return { status: "fail", reason: `${join(bad)}.`, facts };
  if (open.length) return unverified(`${join(open)}.`, facts);
  return { status: "pass", reason: `${join(good)} ${good.length > 1 ? "pixels sent" : "pixel sent"} PageView and AddToCart during our visit.`, facts };
};

const trk13: Rule = ({ ga4, gtm, evidence: e, siteChecks }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const paid = paidPlatforms(ga4.campaigns);
  if (!paid) return unverified("GA4 gave no per-campaign visits this run.");
  if (!paid.length) return { status: "n/a", reason: NO_PAID };
  const s = parseGtm(gtm);
  if (!s) return unverified("No GTM container was shared, so purchase and add-to-cart tags can't be checked.", { platforms: paid.map(p => LABEL[p.platform]) });
  const bad: string[] = [];
  const open: string[] = [];
  const good: string[] = [];
  for (const { platform } of paid) {
    const label = LABEL[platform];
    const tags = liveTags(s, platform);
    const buy = tags.some(t => t.event === "purchase");
    const cart = tags.some(t => t.event === "add_to_cart");
    // Google Ads only needs its purchase conversion; the others need both events.
    if (platform === "ads" ? buy : buy && cart) { good.push(label); continue; }
    const fired = (e?.pageHits ?? []).some(h => h.vendor === platform) || (e?.atcHits ?? []).some(h => h.vendor === platform) || Boolean(siteChecks?.pixelMap?.ids[platform]?.length);
    const missing = platform === "ads" ? "a purchase conversion" : [!buy && "purchase", !cart && "add-to-cart"].filter(Boolean).join(" and ");
    if (fired) open.push(`${label} has no GTM ${missing} tag, but its pixel fires, so a store app may send them`);
    else bad.push(`${label} has paid visits but GTM has no ${missing} tag and no ${label} pixel fired during our visit`);
  }
  const facts = { platforms: paid.map(p => LABEL[p.platform]), ok: good, problems: [...bad, ...open] };
  if (bad.length) return { status: "fail", reason: `${join(bad)}.`, facts };
  if (open.length) return unverified(`${join(open)}.`, facts);
  return { status: "pass", reason: `GTM has the purchase${paid.some(p => p.platform !== "ads") ? " and add-to-cart" : ""} tags for ${join(good)}.`, facts };
};

const trk16: Rule = ({ siteChecks, gtm, ga4 }) => {
  const platform = siteChecks?.platform;
  if (!platform) return unverified("We couldn't tell which platform the store runs on.");
  if (!/shopify/i.test(platform)) return { status: "n/a", reason: `The store runs on ${platform}, not Shopify.`, facts: { platform } };
  const s = parseGtm(gtm);
  if (!s) return unverified("The store is on Shopify but no GTM container was shared, so its checkout tags can't be checked.", { platform });
  const buy = s.conversionTags;
  if (buy.length) return { status: "fail", reason: `Shopify checkout runs in a sandbox GTM can't read, yet GTM has purchase tag(s) ${join(buy.slice(0, 3).map(t => `"${t.name}"`))}. They won't fire on the real order page.`, facts: { platform, tags: buy.map(t => t.name) } };
  if ((ga4?.purchases ?? 0) > 0) return { status: "pass", reason: `GTM has no purchase tags, and GA4 still records ${ga4!.purchases} purchases, so they come from Shopify's own pixel or app.`, facts: { platform, purchases: ga4!.purchases ?? 0 } };
  return unverified("GTM has no purchase tag, but GA4 shows no purchases either, so we can't tell whether Shopify's own pixel sends them.", { platform });
};

const trk29: Rule = ({ siteChecks, gtm }) => {
  const s = parseGtm(gtm);
  const map = siteChecks?.pixelMap;
  if (!s && !map) return unverified("No GTM container and no hit data this run.");
  const problems: string[] = [];
  const ids = Object.entries(map?.ids ?? {}).filter(([, v]) => v.length > 1);
  for (const [v, list] of ids) problems.push(`${v} sends to ${list.length} IDs (${join(list)})`);
  if (s) {
    const paused = s.tags.filter(t => t.paused).map(t => t.name);
    const none = s.tags.filter(t => !t.paused && !t.triggers.length).map(t => t.name);
    if (paused.length) problems.push(`paused tag(s) ${join(paused.slice(0, 4).map(n => `"${n}"`))}`);
    if (none.length) problems.push(`tag(s) with no trigger ${join(none.slice(0, 4).map(n => `"${n}"`))}`);
  }
  const facts = { multipleIds: ids.map(([v]) => v), problems };
  if (problems.length) return { status: "fail", reason: `${join(problems)}.`, facts };
  if (!s || !map) return unverified(`No problem found in the ${s ? "GTM container" : "hits seen"}, but the ${s ? "live hits" : "GTM container"} weren't available to check too.`);
  return { status: "pass", reason: "Each platform uses one ID in the hits we saw, and the GTM container has no paused or triggerless tags.", facts };
};

const trk30: Rule = ({ siteChecks, gtm }) => {
  if (!siteChecks) return unverified("No visit data this run.");
  const links = siteChecks.contactLinks.filter(l => l.valid);
  if (!links.length) return { status: "n/a", reason: "The visit found no WhatsApp or call links to track." };
  const s = parseGtm(gtm);
  // Only a pass is provable: a live GTM tag on a click trigger whose name says whatsapp/call.
  const tag = s?.tags.find(t => !t.paused && /whats|call|phone|tel\b|contact/i.test(t.name) && t.triggers.some(tr => tr.kind === "other" && /click|link|whats|call|tel|phone/i.test(tr.name ?? "")));
  if (tag) return { status: "pass", reason: `The store has ${links.length} WhatsApp/call link(s) and GTM tag "${tag.name}" fires on a click.`, facts: { links: links.length, tag: tag.name } };
  return unverified(`The store has ${links.length} WhatsApp/call link(s); no GTM tag clearly counts their clicks, and we can't read GA4 event names here.`, { links: links.length });
};

export const TRACKING_RULES: Record<string, Rule> = {
  "TRK-05": trk05,
  "TRK-12": trk12,
  "TRK-13": trk13,
  "TRK-16": trk16,
  "TRK-29": trk29,
  "TRK-30": trk30,
  "TRK-43": trk43,
};

export type { RuleResult };
