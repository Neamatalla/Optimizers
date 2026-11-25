import { arabicShare, imageKey, missingTestParams } from "../../fud/collect-probes.js";
import type { TagPageProbe } from "../../fud/collect-probes.js";
import { pageOf } from "../../fud/evidence.js";
import type { Rule } from "./types.js";
import { unverified } from "./types.js";

/**
 * Rules that read StoreEvidence.probes (fud/collect-probes.ts): extra browser
 * interactions made after the main visit. A probe that didn't run or failed
 * leaves its field empty, and its rule says so (unverified). Every probe
 * blocks analytics hits, so what a rule reads from a hit is the request the
 * store's tags tried to send.
 */

const noProbe = (name: string) => unverified(`The ${name} check didn't run this time.`);
const path = (u: string) => { try { return new URL(u).pathname || "/"; } catch { return u; } };

// ---- PATH-15: empty cart offers a way forward ----
const EMPTY_MESSAGE = /(?:cart|bag|basket) is (?:currently )?empty|(?:cart|bag|basket) (?:is )?(?:currently )?(?:empty|has no items)|no (?:items|products) in (?:your )?(?:cart|bag)|nothing in (?:your )?(?:cart|bag)|(?:السلة|سلة|سلتك|عربة|حقيبة)[^.!؟\n]{0,30}(?:فارغة|خالية)|لا توجد (?:منتجات|عناصر) في (?:السلة|سلة)/i;
const CONTINUE = /continue shopping|start shopping|keep shopping|shop now|return to (?:the )?shop|back to (?:the )?shop|browse|shop all|تسوق|متابعة التسوق|العودة (?:إلى|الى) (?:المتجر|التسوق)|ابدأ التسوق|تصفح/i;
const WAY_FORWARD_PATH = /\/collections?\b|best-?sell|\/shop\b|\/products\b|\/category|\/catalog|\/all\b|المنتجات|الأكثر/i;
const WAY_FORWARD_TEXT = /best.?sell|collection|shop all|all products|new arrivals|الأكثر مبيع|جميع المنتجات|المجموعات|الأكثر طلب/i;

const path15: Rule = ({ evidence: e }) => {
  const p = e?.probes?.emptyCart;
  if (!p) return noProbe("empty cart");
  if (!p.loaded) return unverified(`The cart page ${p.url} didn't load for our empty-cart check${p.note ? ` (${p.note})` : ""}.`);
  if (p.itemCount != null && p.itemCount > 0) return unverified(`The fresh cart already held ${p.itemCount} item(s), so it was not an empty cart.`);
  const finalPath = path(p.finalUrl ?? p.url);
  if (!/cart|bag|basket|checkout/i.test(finalPath)) return unverified(`${p.url} sent us to ${finalPath}, so the store's empty cart (maybe a drawer) wasn't seen.`);
  const text = p.text ?? "";
  const says = EMPTY_MESSAGE.test(text);
  if (!says) {
    // Only a confirmed-empty cart (Shopify count 0) lets us say the message is missing.
    return p.itemCount === 0 && text.length > 0
      ? { status: "fail", reason: `The empty cart page ${p.url} doesn't say the cart is empty.`, facts: { url: p.url, text: text.slice(0, 160) } }
      : unverified(`${p.url} shows no empty-cart message we can read, and we can't confirm the cart was empty.`);
  }
  const links = p.links ?? [];
  const onward = links.filter(l => (l.href && WAY_FORWARD_PATH.test(path(l.href)) && path(l.href) !== path(p.url)) || WAY_FORWARD_TEXT.test(l.text));
  const button = links.filter(l => CONTINUE.test(l.text));
  const facts = { url: p.url, onwardLinks: onward.slice(0, 3).map(l => l.href || l.text), continueButton: button[0]?.text ?? "none" };
  if (onward.length && button.length) return { status: "pass", reason: `The empty cart page says it is empty and offers "${button[0].text}" and a link to ${onward[0].href ? path(onward[0].href) : onward[0].text}.`, facts };
  const missing = [...(onward.length ? [] : ["a link to a collection or best sellers"]), ...(button.length ? [] : ["a continue-shopping button"])];
  // Not a fail: the links are read once, and on Regal (23 Nov) the same page
  // gave a collection link in one run and none in the next. The AI checks it.
  return unverified(`The empty cart page ${p.url} says it is empty, but our read found no ${missing.join(" and no ")}. The read can miss links, so this isn't proof.`, facts);
};

// ---- PDP-12: picking a variant changes the photo ----
const pdp12: Rule = ({ evidence: e }) => {
  const p = e?.probes?.variantImage;
  if (!p) return noProbe("variant image");
  if (!p.loaded) return unverified(`The product page ${p.url || "(none)"} didn't load for our variant check${p.note ? ` (${p.note})` : ""}.`);
  if (p.note) return unverified(`We couldn't test the variant photo on ${p.url}: ${p.note}.`);
  if (!p.group || !p.from || !p.to || !p.before || !p.after) return unverified(`The variant test on ${p.url} didn't return both images.`);
  if (!p.selected) return unverified(`Our click on "${p.to}" (${p.group}) didn't select it, so the photo can't be judged.`);
  const facts = { url: p.url, group: p.group, from: p.from, to: p.to, before: p.before, after: p.after };
  if (imageKey(p.before) !== imageKey(p.after)) return { status: "pass", reason: `Choosing ${p.group} "${p.to}" instead of "${p.from}" switched the main photo.`, facts };
  // The store registered the change (its URL moved to the new variant) yet the photo stayed.
  if (p.urlVariantAfter && p.urlVariantAfter !== p.urlVariantBefore) return { status: "fail", reason: `Choosing ${p.group} "${p.to}" moved the page to variant ${p.urlVariantAfter} but the main photo stayed the same.`, facts };
  return unverified(`The main photo didn't change after choosing ${p.group} "${p.to}", but the store didn't show the new variant in its URL, so it may just be a slow swap.`, facts);
};

// ---- TRK-23: campaign tags survive redirects ----
const trk23: Rule = ({ evidence: e }) => {
  const p = e?.probes?.campaignParams;
  if (!p) return noProbe("campaign parameters");
  if (!p.loaded) return unverified(`Home didn't load with the test parameters${p.note ? ` (${p.note})` : ""}.`);
  const first = p.ga4.find(h => h.name === "page_view");
  if (!first) return unverified("No GA4 page_view was seen within 8 seconds, so there is no page_location to read.");
  if (!first.dl) return unverified("The first GA4 page_view carried no page_location (dl), so it can't be compared.");
  const missing = missingTestParams(first.dl);
  const lostInUrl = missingTestParams(p.finalUrl);
  const facts = { requested: p.requestedUrl, finalUrl: p.finalUrl ?? "", pageLocation: first.dl, missing, missingInFinalUrl: lostInUrl };
  return missing.length
    ? { status: "fail", reason: `The first GA4 page_view page_location (${first.dl.slice(0, 120)}) lost ${missing.join(", ")} from the campaign link.`, facts }
    : { status: "pass", reason: `The first GA4 page_view page_location kept all ${p.params.length} campaign parameters${lostInUrl.length ? ` (even though the final URL lost ${lostInUrl.join(", ")})` : ""}.`, facts };
};

// ---- TRK-31: pages without reload still counted ----
const trk31: Rule = ({ evidence: e }) => {
  const p = e?.probes?.spaNav;
  if (!p) return noProbe("in-app navigation");
  if (!p.loaded) return unverified(`Home didn't load for our navigation check${p.note ? ` (${p.note})` : ""}.`);
  const first = p.steps[0];
  if (!first) return unverified(p.note ?? "We found no in-app link to tap.");
  if (first.clickFailed) return unverified(`Our tap on an in-app link did nothing within 5 seconds, so navigation wasn't tested.`);
  if (!first.spa) return { status: "n/a", reason: `The store reloads the page on navigation (${first.from} to ${first.to ?? "?"}), so there is no in-app navigation to count.`, facts: { from: first.from, to: first.to ?? "" } };
  if (p.initialPageViews === 0) return unverified("No GA4 page_view was seen when home loaded, so in-app page_views can't be judged.");
  const spa = p.steps.filter(s => s.spa);
  const silent = spa.filter(s => s.pageViews === 0);
  const facts = { navigations: spa.length, pageViews: spa.map(s => s.pageViews).join(", "), pageViewsForNewPage: spa.map(s => s.pageViewsForNewPage).join(", "), initialPageViews: p.initialPageViews };
  if (silent.length) return { status: "fail", reason: `The store changes pages without reloading, and ${silent.length} of ${spa.length} in-app navigation(s) (${silent.map(s => path(s.to ?? "")).join(", ")}) sent no GA4 page_view within 3.5 seconds.`, facts };
  return { status: "pass", reason: `The store changes pages without reloading, and each of the ${spa.length} in-app navigation(s) sent a GA4 page_view.`, facts };
};

// ---- TRK-19: tracking on every page type ----
const TYPES = ["home", "collection", "product", "cart"] as const;
type Baseline = { kind: "GTM container" | "GA4 tag"; ids: string[] };
const hasBaseline = (p: TagPageProbe, b: Baseline) => b.ids.every(id => (b.kind === "GTM container" ? p.gtmIds : [...p.ga4Ids, ...p.gtagIds]).includes(id));

const trk19: Rule = ({ evidence: e }) => {
  const all = e?.probes?.tagCoverage?.pages;
  if (!all?.length) return noProbe("tags on every page type");
  const usable = all.filter(p => p.loaded && !p.botWall);
  const home = usable.find(p => p.page === "home" && p.profile === "phone") ?? usable.find(p => p.page === "home");
  if (!home) return unverified("The home page didn't load for the tag check, so there is no container to compare against.");
  const baseline: Baseline | null = home.gtmIds.length ? { kind: "GTM container", ids: home.gtmIds } : [...home.ga4Ids, ...home.gtagIds].length ? { kind: "GA4 tag", ids: [...new Set([...home.ga4Ids, ...home.gtagIds])] } : null;
  if (!baseline) return unverified(`No GTM container or GA4 tag loaded on ${home.url} within our wait (tags may wait for a consent choice).`, { consentBanner: Boolean(home.consentBanner) });
  const label = (p: TagPageProbe) => `${p.page} (${p.profile})`;
  const missing = usable.filter(p => !hasBaseline(p, baseline));
  const facts = { baseline: `${baseline.kind} ${baseline.ids.join(", ")}`, checked: usable.map(label), missing: missing.map(label) };
  const decisive = missing.filter(p => !p.consentBanner);
  if (decisive.length) return { status: "fail", reason: `${baseline.kind} ${baseline.ids.join(", ")} from the home page did not load on ${decisive.map(label).join(", ")}.`, facts };
  if (missing.length) return unverified(`${baseline.kind} ${baseline.ids.join(", ")} didn't load on ${missing.map(label).join(", ")}, where a consent banner was showing, so the tags may be waiting for a choice.`, facts);
  const phoneTypes = new Set(usable.filter(p => p.profile === "phone").map(p => p.page));
  const desktop = usable.filter(p => p.profile === "desktop");
  if (phoneTypes.size < 3 || !desktop.length) {
    const unseen = TYPES.filter(t => !phoneTypes.has(t));
    return unverified(`${baseline.kind} ${baseline.ids.join(", ")} loaded on every page we could open, but ${phoneTypes.size < 3 ? `the phone ${unseen.join(" and ")} page(s) didn't load` : "no desktop page loaded"}.`, facts);
  }
  return { status: "pass", reason: `${baseline.kind} ${baseline.ids.join(", ")} loaded on all ${usable.length} pages checked (${[...phoneTypes].join(", ")} on phone, ${desktop.length} on desktop).`, facts };
};

// ---- TRK-32: page view hits go out early ----
const PIXEL_PAGEVIEW = /^(?:pageview|page_view|pagevisit)$/i;
const trk32: Rule = ({ evidence: e }) => {
  const p = e?.probes?.hitTiming;
  if (!p) return noProbe("hit timing");
  if (!p.loaded) return unverified(`Home didn't load for the hit-timing check${p.note ? ` (${p.note})` : ""}.`);
  if (!p.throttled) return unverified("The phone throttling (4x slower CPU, 1.6 Mbps) could not be applied, so hit times can't be compared with a throttled LCP.");
  if (!p.lcpMs) return unverified("The browser reported no LCP time, so the hits can't be compared with it.");
  const hits = p.hits;
  const first = (f: (h: (typeof hits)[number]) => boolean) => hits.filter(f).sort((a, b) => a.tMs - b.tMs)[0];
  const ga4 = first(h => h.vendor === "ga4");
  const pixel = first(h => h.vendor !== "ga4" && PIXEL_PAGEVIEW.test(h.name));
  if (!ga4 && !pixel) return unverified("No GA4 hit or pixel PageView was seen on the throttled home load, so there is no send time to compare.");
  const rows = [ga4 && { label: "GA4", h: ga4 }, pixel && { label: `${pixel.vendor} PageView`, h: pixel }].filter((x): x is { label: string; h: typeof ga4 & {} } => Boolean(x));
  const facts: Record<string, string | number> = { lcpMs: p.lcpMs, ...(ga4 && { ga4Ms: ga4.tMs }), ...(pixel && { pixelMs: pixel.tMs, pixelVendor: pixel.vendor }) };
  // Throttled timings move by seconds between loads (Regal, 23 Nov: GA4 at
  // 12.6 s, 16.2 s and 6.5 s; LCP at 7.5 s, 5.9 s and 6.9 s). A hit this close
  // to the LCP could land on either side next time, so it isn't decided.
  const margin = Math.max(1000, Math.round(p.lcpMs * 0.2));
  const close = rows.filter(r => Math.abs(r.h.tMs - p.lcpMs!) < margin);
  if (close.length) return unverified(`On a throttled phone, ${close.map(r => `${r.label} went out at ${r.h.tMs} ms`).join(" and ")}, within ${margin} ms of the LCP at ${p.lcpMs} ms: too close to call, as these times move between loads.`, { ...facts, marginMs: margin, final: true });
  const late = rows.filter(r => r.h.tMs >= p.lcpMs!);
  const times = rows.map(r => `${r.label} ${r.h.tMs} ms`).join(", ");
  return late.length
    ? { status: "fail", reason: `On a throttled phone, ${late.map(r => `${r.label} went out at ${r.h.tMs} ms`).join(" and ")}, after the LCP at ${p.lcpMs} ms.`, facts }
    : { status: "pass", reason: `On a throttled phone, ${times} went out before the LCP at ${p.lcpMs} ms.`, facts };
};

// ---- LAND-06: landing page language matches the text ----
// Decided here: lang and dir against the visible text, and that an Arabic
// version with a switcher exists. Arabic GA4 sessions landing on Arabic pages
// needs a GA4 language-by-landing report, which isn't pulled yet.
const land06: Rule = ({ evidence: e }) => {
  const l = e ? pageOf(e, "landing") : undefined;
  if (!l) return unverified("No landing page was visited.");
  const f = l.facts;
  if (!f) return unverified(`The language settings of ${l.url} weren't read.`);
  const share = arabicShare(l.blocks.map(b => b.text).join(" "));
  if (share === null) return unverified(`${l.url} has too little text to tell its language.`);
  if (share > 0.1 && share < 0.6) return unverified(`The text on ${l.url} mixes Arabic (${Math.round(share * 100)}%) and other scripts, so its language can't be told.`, { arabicShare: Math.round(share * 100) });
  const arabic = share >= 0.6;
  const lang = f.lang.trim().toLowerCase().split(/[-_]/)[0];
  const dir = f.dir.trim().toLowerCase();
  const facts = { url: l.url, lang: f.lang, dir: f.dir, textLanguage: arabic ? "Arabic" : "Latin script", arabicShare: Math.round(share * 100) };
  if (arabic && (lang !== "ar" || dir !== "rtl")) return { status: "fail", reason: `The text on ${l.url} is Arabic but the page says lang="${f.lang || "(none)"}" dir="${f.dir || "(none)"}".`, facts };
  if (!arabic && (!lang || lang === "ar" || dir === "rtl")) return { status: "fail", reason: `The text on ${l.url} is not Arabic but the page says lang="${f.lang || "(none)"}" dir="${f.dir || "(none)"}".`, facts };
  if (!arabic && !(f.langSwitch || f.hreflang.some(h => /^ar\b/i.test(h)))) return unverified(`${l.url} matches its English text, but we found no Arabic version or language switcher.`, facts);
  return { status: "pass", reason: `${l.url} has lang="${f.lang}" dir="${f.dir}" matching its ${arabic ? "Arabic" : "English"} text${arabic ? "" : " and offers an Arabic version"}. Arabic GA4 sessions weren't checked.`, facts };
};

export const PROBE_RULES: Record<string, Rule> = {
  "PATH-15": path15,
  "PDP-12": pdp12,
  "TRK-23": trk23,
  "TRK-31": trk31,
  "TRK-19": trk19,
  "TRK-32": trk32,
  "LAND-06": land06,
};
