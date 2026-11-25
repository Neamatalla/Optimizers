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
  if (!g) return { observation: { ar: `لا يُظهر GA4 أي زيارات من google/cpc، فالمتجر لا يشغّل إعلانات Google Ads.` }, status: "n/a", reason: "GA4 shows no google/cpc visits, so the store isn't running Google Ads.", facts: { paid: paid.map(p => p.platform) } };
  const s = parseGtm(gtm);
  if (!s) return unverified(`GA4 shows ${g.sessions} google/cpc visits, but no GTM container was shared, so the Ads conversion tag can't be checked.`, { googleCpcSessions: g.sessions });
  // The Conversion Linker (saving the click ID) is judged by TRK-48.
  const conv = s.tags.filter(t => !t.paused && t.type === "awct");
  const facts = { googleCpcSessions: g.sessions, conversionTags: conv.map(t => t.name) };
  if (conv.length) return { observation: { ar: `في GTM وسم تحويل Google Ads.` }, status: "pass", reason: `GTM has a Google Ads conversion tag (${join(conv.map(t => `"${t.name}"`))}).`, facts };
  const linked = ga4.facts["GA4-21"]?.status === "pass";
  if (linked) return unverified("GTM has no Google Ads conversion tag, but Google Ads is linked to GA4 and may import purchases from it.", facts);
  return { observation: { ar: `إعلانات Google Ads تجلب ${g.sessions} زيارة، لكن GTM ليس فيه وسم تحويل Google Ads، وGoogle Ads غير مربوط بـ GA4، فلا ترى الإعلانات المبيعات.` }, status: "fail", reason: `Google Ads brings ${g.sessions} visits, but GTM has no Google Ads conversion tag and Ads isn't linked to GA4, so Ads can't see sales.`, facts };
};

const PAGE_VIEW = /^page_?view$/i;
const ADD_CART = /^(AddToCart|ADD_CART)$/i;

const trk12: Rule = ({ ga4, evidence: e, gtm, siteChecks }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const paid = paidPlatforms(ga4.campaigns);
  if (!paid) return unverified("GA4 gave no per-campaign visits this run.");
  const pixels = paid.filter(p => p.platform !== "ads");
  if (!pixels.length) return { observation: { ar: `المنصة المدفوعة الوحيدة هي Google Ads، ويُفحص وسمها في بند Google Ads.` }, status: "n/a", reason: paid.length ? "The only paid platform is Google Ads; its tag is judged by the Google Ads point." : NO_PAID, facts: { paid: paid.map(p => p.platform) } };
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
  return { observation: { ar: `بكسل ${join(good)} أرسل PageView و AddToCart أثناء زيارتنا.` }, status: "pass", reason: `${join(good)} ${good.length > 1 ? "pixels sent" : "pixel sent"} PageView and AddToCart during our visit.`, facts };
};

const trk13: Rule = ({ ga4, gtm, evidence: e, siteChecks }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const paid = paidPlatforms(ga4.campaigns);
  if (!paid) return unverified("GA4 gave no per-campaign visits this run.");
  if (!paid.length) return { observation: { ar: `لا يُظهر GA4 زيارات من حملات مدفوعة للحكم على هذا البند.` }, status: "n/a", reason: NO_PAID };
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
  return { observation: { ar: `في GTM وسوم الشراء لـ ${join(good)}.` }, status: "pass", reason: `GTM has the purchase${paid.some(p => p.platform !== "ads") ? " and add-to-cart" : ""} tags for ${join(good)}.`, facts };
};

const trk16: Rule = ({ siteChecks, gtm, ga4 }) => {
  const platform = siteChecks?.platform;
  if (!platform) return unverified("We couldn't tell which platform the store runs on.");
  if (!/shopify/i.test(platform)) return { observation: { ar: `المتجر يعمل على ${platform}، وليس Shopify.` }, status: "n/a", reason: `The store runs on ${platform}, not Shopify.`, facts: { platform } };
  const s = parseGtm(gtm);
  if (!s) return unverified("The store is on Shopify but no GTM container was shared, so its checkout tags can't be checked.", { platform });
  const buy = s.conversionTags;
  if (buy.length) return { observation: { ar: `صفحة الدفع في Shopify تعمل في بيئة معزولة لا يقرأها GTM، ومع ذلك فيه وسوم شراء: ${join(buy.slice(0, 3).map(t => t.name))}. لن تعمل في صفحة الطلب الحقيقية.` }, status: "fail", reason: `Shopify checkout runs in a sandbox GTM can't read, yet GTM has purchase tag(s) ${join(buy.slice(0, 3).map(t => `"${t.name}"`))}. They won't fire on the real order page.`, facts: { platform, tags: buy.map(t => t.name) } };
  if ((ga4?.purchases ?? 0) > 0) return { observation: { ar: `GTM ليس فيه وسوم شراء، وGA4 يسجّل ${ga4!.purchases} عملية شراء، فهي تأتي من بكسل Shopify أو تطبيق.` }, status: "pass", reason: `GTM has no purchase tags, and GA4 still records ${ga4!.purchases} purchases, so they come from Shopify's own pixel or app.`, facts: { platform, purchases: ga4!.purchases ?? 0 } };
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
  return { observation: { ar: `كل منصة تستخدم معرّفًا واحدًا في الإشارات التي رأيناها، وحاوية GTM ليس فيها وسوم متوقفة أو بلا مشغّل.` }, status: "pass", reason: "Each platform uses one ID in the hits we saw, and the GTM container has no paused or triggerless tags.", facts };
};

const trk30: Rule = ({ siteChecks, gtm }) => {
  if (!siteChecks) return unverified("No visit data this run.");
  const links = siteChecks.contactLinks.filter(l => l.valid);
  if (!links.length) return { observation: { ar: `لم تجد زيارتنا روابط واتساب أو اتصال لتتبعها.` }, status: "n/a", reason: "The visit found no WhatsApp or call links to track." };
  const s = parseGtm(gtm);
  // Only a pass is provable: a live GTM tag on a click trigger whose name says whatsapp/call.
  const tag = s?.tags.find(t => !t.paused && /whats|call|phone|tel\b|contact/i.test(t.name) && t.triggers.some(tr => tr.kind === "other" && /click|link|whats|call|tel|phone/i.test(tr.name ?? "")));
  if (tag) return { observation: { ar: `في المتجر ${links.length} رابط واتساب أو اتصال، ووسم GTM ${tag.name} يعمل عند النقر.` }, status: "pass", reason: `The store has ${links.length} WhatsApp/call link(s) and GTM tag "${tag.name}" fires on a click.`, facts: { links: links.length, tag: tag.name } };
  return unverified(`The store has ${links.length} WhatsApp/call link(s); no GTM tag clearly counts their clicks, and we can't read GA4 event names here.`, { links: links.length });
};

// ---- TRK-39: session recordings installed ----
const RECORDER_TAG = /clarity|hotjar|mouseflow|smartlook|lucky ?orange|fullstory/i;

const trk39: Rule = ({ evidence: e, gtm }) => {
  if (!e) return unverified("No visit data this run.");
  if (!e.recorders) return unverified("This visit was recorded before we read recorder scripts.");
  if (e.recorders.length) return { status: "pass", reason: `${join(e.recorders)} loaded during our visit.`, facts: { recorders: e.recorders } };
  const tag = parseGtm(gtm)?.tags.find(t => !t.paused && (RECORDER_TAG.test(t.name) || t.scriptHosts.some(h => RECORDER_TAG.test(h))));
  if (tag) return { status: "pass", reason: `GTM has a live session-recording tag ("${tag.name}").`, facts: { tag: tag.name } };
  const home = e.pages.find(p => p.pageType === "home");
  if (!home?.loaded) return unverified("The home page didn't load, so no recorder could be seen.");
  if (e.probes?.campaignParams?.consentBanner || e.probes?.tagCoverage?.pages.some(p => p.consentBanner)) return unverified("No session-recording script loaded, but a consent banner was showing, so a recorder may be waiting for a choice.");
  return { status: "fail", reason: "No session-recording tool (Microsoft Clarity, Hotjar, Mouseflow, Smartlook, Lucky Orange or FullStory) loaded during our visit, and none is set up in GTM.", facts: { recorders: [] } };
};

// ---- TRK-40: no hand-pasted pixels or unknown scripts in GTM ----
// Hosts a Custom HTML tag may load from without a question.
const KNOWN_HOSTS = /(^|\.)(googletagmanager\.com|google-analytics\.com|google\.com|googleadservices\.com|doubleclick\.net|gstatic\.com|googleapis\.com|facebook\.net|facebook\.com|tiktok\.com|snapchat\.com|sc-static\.net|clarity\.ms|hotjar\.com|hotjar\.io|klaviyo\.com|pinterest\.com|pinimg\.com|twitter\.com|ads-twitter\.com|t\.co|linkedin\.com|licdn\.com|bing\.com|tabby\.ai|tamara\.co|zid\.sa|salla\.sa|salla\.network|shopify\.com|shopifycdn\.com|cloudflare\.com|jsdelivr\.net|unpkg\.com|jquery\.com|wa\.me|whatsapp\.com|criteo\.com|criteo\.net|taboola\.com|outbrain\.com|yandex\.ru|youtube\.com|w3\.org|schema\.org)$/i;
const PASTED: Partial<Record<GtmPlatform, string>> = { meta: "Meta", tiktok: "TikTok", snap: "Snapchat" };

const trk40: Rule = ({ gtm }) => {
  const s = parseGtm(gtm);
  if (!s) return unverified("No GTM container was shared, so its Custom HTML tags can't be read.");
  const html = s.tags.filter(t => !t.paused && t.type === "html");
  if (!html.length) return { observation: { ar: `لا يوجد في حاوية GTM أي وسم Custom HTML يعمل.` }, status: "pass", reason: "The GTM container has no live Custom HTML tags.", facts: { customHtml: 0 } };
  const pasted = html.filter(t => PASTED[t.platform] || t.pastedGtag);
  if (pasted.length) {
    const list = pasted.map(t => `"${t.name}" (${PASTED[t.platform] ?? "gtag"})`);
    return { observation: { ar: `في GTM بكسلات ملصوقة يدويًا في وسوم Custom HTML: ${pasted.map(t => t.name).join("، ")}، مع أن لها قوالب رسمية.` }, status: "fail", reason: `Pixels are pasted by hand into Custom HTML tags where an official template exists: ${join(list)}.`, facts: { pasted: pasted.map(t => t.name) } };
  }
  const unknown = [...new Set(html.flatMap(t => t.scriptHosts).filter(h => !KNOWN_HOSTS.test(h)))];
  const cut = html.filter(t => t.htmlCut).map(t => t.name);
  if (unknown.length) return unverified(`Custom HTML tags load from hosts we don't know: ${join(unknown.slice(0, 8))}.`, { unknownHosts: unknown, customHtml: html.length });
  if (cut.length) return unverified(`${cut.length} Custom HTML tag(s) were too long to read in full (${join(cut.slice(0, 5))}).`, { cut });
  return { observation: { ar: `وسوم Custom HTML في GTM (${html.length}) تحمّل من جهات معروفة فقط، ولا يوجد بكسل ملصوق يدويًا.` }, status: "pass", reason: `The ${html.length} live Custom HTML tag(s) load only from known vendors, and none is a hand-pasted pixel.`, facts: { customHtml: html.length } };
};

// ---- TRK-41: ecommerce data cleared between pushes ----
const trk41: Rule = ({ evidence: e }) => {
  if (!e) return unverified("No visit data this run.");
  const product = e.pages.find(p => p.pageType === "product");
  if (!product?.loaded) return unverified("The product page didn't load, so its dataLayer wasn't read.");
  const seq = e.dlEcommerce;
  if (!seq) return unverified("This visit was recorded before we read the dataLayer order.");
  const pushes = seq.filter(x => x !== "null");
  if (!pushes.length) return { status: "n/a", reason: "The store pushes no ecommerce objects to the dataLayer on the product page.", facts: { sequence: seq } };
  // A push needs a clear right before it once an earlier ecommerce push could merge into it.
  const uncleared: string[] = [];
  let seen = false;
  seq.forEach((x, i) => {
    if (x === "null") return;
    if (seen && seq[i - 1] !== "null") uncleared.push(x);
    seen = true;
  });
  const facts = { sequence: seq.slice(0, 20), pushes: pushes.length, uncleared };
  if (pushes.length < 2) return unverified(`Only one ecommerce push (${pushes[0]}) was seen on the product page, so clearing between pushes can't be judged.`, facts);
  if (uncleared.length) return { status: "fail", reason: `On the product page, ${join(uncleared)} went to the dataLayer with no ecommerce: null push right before, so values from the earlier push can leak in.`, facts };
  return { status: "pass", reason: `Each of the ${pushes.length} ecommerce pushes on the product page after the first comes right after an ecommerce: null push.`, facts };
};

// ---- TRK-48: ad click IDs saved ----
const CLICK_COOKIES = [["ads", "_gcl_aw", "Google Ads"], ["meta", "_fbc", "Meta"]] as const;

const trk48: Rule = ({ evidence: e, ga4, gtm }) => {
  const probe = e?.probes?.campaignParams;
  if (!probe) return unverified("The campaign link check didn't run this time.");
  if (!probe.loaded) return unverified(`Home didn't load with the test click IDs${probe.note ? ` (${probe.note})` : ""}.`);
  const cookies = probe.cookies;
  if (!cookies) return unverified("This visit was recorded before we read cookies.");
  const paid = paidPlatforms(ga4?.campaigns);
  const s = parseGtm(gtm);
  const hits = e?.pageHits ?? [];
  const runs = {
    ads: Boolean(paid?.some(p => p.platform === "ads") || s?.tags.some(t => !t.paused && (t.type === "awct" || t.type === "gclidw"))),
    meta: Boolean(paid?.some(p => p.platform === "meta") || hits.some(h => h.vendor === "meta") || (s && liveTags(s, "meta").length)),
  };
  const want = CLICK_COOKIES.filter(([k]) => runs[k]);
  if (!want.length) return { status: "n/a", reason: "We found no sign the store runs Google Ads or Meta, so no click-ID cookie is expected.", facts: { cookies: cookies.length } };
  const label = (x: (typeof CLICK_COOKIES)[number]) => `${x[2]} (${x[1]})`;
  const missing = want.filter(([, c]) => !cookies.includes(c));
  const facts = { checked: want.map(label), missing: missing.map(([, c]) => c) };
  if (!missing.length) return { status: "pass", reason: `After landing with test click IDs, the click-ID cookie was set for ${join(want.map(label))}.`, facts };
  const list = join(missing.map(label));
  if (probe.consentBanner) return unverified(`After landing with test click IDs, no click-ID cookie was set for ${list}, but a consent banner was showing, so it may wait for a choice.`, facts);
  return { status: "fail", reason: `After landing with test click IDs, no click-ID cookie was set for ${list}, so a buyer who comes back later can't be tied to the ad click.`, facts };
};

export const TRACKING_RULES: Record<string, Rule> = {
  "TRK-39": trk39,
  "TRK-40": trk40,
  "TRK-41": trk41,
  "TRK-48": trk48,
  "TRK-05": trk05,
  "TRK-12": trk12,
  "TRK-13": trk13,
  "TRK-16": trk16,
  "TRK-29": trk29,
  "TRK-30": trk30,
  "TRK-43": trk43,
};

export type { RuleResult };
