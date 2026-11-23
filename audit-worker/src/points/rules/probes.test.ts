import assert from "node:assert/strict";
import { test } from "node:test";
import { arabicShare, ga4HitsOf, imageKey, missingTestParams, withTestParams } from "../../fud/collect-probes.js";
import type { ProbeResults, TagPageProbe } from "../../fud/collect-probes.js";
import type { PageEvidence, StoreEvidence, TextBlock } from "../../fud/evidence.js";
import { RULES } from "./index.js";
import type { RuleInput } from "./types.js";

const store = (probes?: ProbeResults, pages: PageEvidence[] = []): RuleInput => ({ evidence: { website: "https://x.com", pages, addToCart: { attempted: false, ok: false }, blockedHits: 0, durationMs: 1, ...(probes && { probes }) } as StoreEvidence });
const withProbe = (p: Partial<ProbeResults>) => store({ ranMs: 1, ...p });
const run = (id: string, input: RuleInput) => RULES[id](input);
const status = (id: string, input: RuleInput) => run(id, input).status;

// ---- pure helpers ----
test("ga4HitsOf reads event, measurement id and page_location from URL and body", () => {
  const url = "https://www.google-analytics.com/g/collect?v=2&tid=G-ABC123&dl=https%3A%2F%2Fx.com%2F%3Futm_source%3Da&en=page_view";
  assert.deepEqual(ga4HitsOf(url, undefined), [{ name: "page_view", tid: "G-ABC123", dl: "https://x.com/?utm_source=a" }]);
  const batch = ga4HitsOf("https://www.google-analytics.com/g/collect?v=2&tid=G-ABC123&dl=https%3A%2F%2Fx.com%2Fa", "en=scroll&epn.percent=90\nen=user_engagement");
  assert.deepEqual(batch.map(h => [h.name, h.dl]), [["scroll", "https://x.com/a"], ["user_engagement", "https://x.com/a"]]);
  assert.deepEqual(ga4HitsOf("https://x.com/app.js", undefined), []);
});

test("imageKey ignores size, query and protocol", () => {
  assert.equal(imageKey("https://cdn.shopify.com/s/files/a_600x.jpg?v=123"), imageKey("//cdn.shopify.com/s/files/a_1024x1024.jpg?v=9"));
  assert.notEqual(imageKey("https://cdn.x.com/red.jpg"), imageKey("https://cdn.x.com/blue.jpg"));
  assert.equal(imageKey(""), "");
});

test("arabicShare: Arabic, English, mixed and too little text", () => {
  assert.ok(arabicShare("تسوق الآن أفضل المنتجات الطبيعية بأسعار مناسبة وشحن سريع لجميع دول الخليج") as number > 0.9);
  assert.equal(arabicShare("Shop the best natural products with fast shipping to the whole Gulf region") as number, 0);
  assert.equal(arabicShare("hi"), null);
});

test("test parameters: all kept, some lost, bad URL", () => {
  const u = withTestParams("https://x.com/");
  assert.deepEqual(missingTestParams(u), []);
  assert.deepEqual(missingTestParams(u.replace(/&?gclid=[^&]*/, "")), ["gclid"]);
  assert.equal(missingTestParams(undefined).length, 6);
});

// ---- registry ----
test("probe rules are all unverified when no probe ran", () => {
  for (const id of ["PATH-15", "PDP-12", "TRK-23", "TRK-31", "TRK-19", "TRK-32"]) {
    assert.equal(status(id, store()), "unverified", id);
    assert.equal(status(id, { evidence: null }), "unverified", id);
  }
});

// ---- PATH-15 ----
const cart = (over: Record<string, unknown> = {}) => withProbe({ emptyCart: { loaded: true, url: "https://x.com/cart", finalUrl: "https://x.com/cart", itemCount: 0, text: "Your cart is empty Continue shopping", links: [{ text: "Continue shopping", href: "https://x.com/collections/all" }], ...over } });
test("PATH-15 pass, fail and unverified", () => {
  assert.equal(status("PATH-15", cart()), "pass");
  // Missing links are never a code fail: the link read can miss them.
  assert.equal(status("PATH-15", cart({ links: [{ text: "Home", href: "https://x.com/" }] })), "unverified");
  assert.equal(status("PATH-15", cart({ links: [{ text: "Best sellers", href: "https://x.com/collections/best-sellers" }] })), "unverified", "no continue button");
  assert.equal(status("PATH-15", cart({ text: "Your cart", links: [] })), "fail", "confirmed empty, no message");
  assert.equal(status("PATH-15", cart({ text: "Your cart", itemCount: null })), "unverified");
  assert.equal(status("PATH-15", cart({ itemCount: 2 })), "unverified");
  assert.equal(status("PATH-15", cart({ finalUrl: "https://x.com/" })), "unverified", "redirected away (drawer cart)");
  assert.equal(status("PATH-15", cart({ loaded: false })), "unverified");
  assert.equal(status("PATH-15", cart({ text: "سلتك فارغة تابع التسوق", links: [{ text: "متابعة التسوق", href: "https://x.com/collections/all" }] })), "pass");
});

// ---- PDP-12 ----
const variant = (over: Record<string, unknown> = {}) => withProbe({ variantImage: { loaded: true, url: "https://x.com/p", group: "Color", from: "Red", to: "Blue", selected: true, before: "https://c.com/red_600x.jpg", after: "https://c.com/blue_600x.jpg", urlVariantBefore: null, urlVariantAfter: "2", ...over } });
test("PDP-12 pass, fail and unverified", () => {
  assert.equal(status("PDP-12", variant()), "pass");
  assert.equal(status("PDP-12", variant({ after: "https://c.com/red_900x.jpg?v=2" })), "fail");
  assert.equal(status("PDP-12", variant({ after: "https://c.com/red_900x.jpg", urlVariantAfter: null })), "unverified", "slow swap not provable");
  assert.equal(status("PDP-12", variant({ selected: false })), "unverified");
  assert.equal(status("PDP-12", variant({ note: "no second option" })), "unverified");
  assert.equal(status("PDP-12", variant({ loaded: false })), "unverified");
});

// ---- TRK-23 ----
const camp = (dl: string | undefined, over: Record<string, unknown> = {}) => withProbe({ campaignParams: { loaded: true, requestedUrl: withTestParams("https://x.com/"), finalUrl: withTestParams("https://x.com/"), params: ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "ttclid"], ga4: dl === undefined ? [] : [{ t: 1, name: "page_view", dl }], ...over } });
test("TRK-23 pass, fail and unverified", () => {
  const full = withTestParams("https://x.com/");
  assert.equal(status("TRK-23", camp(full)), "pass");
  assert.equal(status("TRK-23", camp(full.replace(/&fbclid=[^&]*/, ""))), "fail");
  assert.match(run("TRK-23", camp("https://x.com/")).reason, /utm_source/);
  assert.equal(status("TRK-23", camp(undefined)), "unverified");
  assert.equal(status("TRK-23", withProbe({ campaignParams: { loaded: true, requestedUrl: "", params: [], ga4: [{ t: 1, name: "page_view" }] } })), "unverified", "no dl");
  assert.equal(status("TRK-23", camp(full, { loaded: false })), "unverified");
});

// ---- TRK-31 ----
const step = (over: Record<string, unknown> = {}) => ({ from: "https://x.com/", to: "https://x.com/collections/a", spa: true, pageViews: 1, pageViewsForNewPage: 1, ga4Hits: 2, ...over });
const nav = (steps: ReturnType<typeof step>[], over: Record<string, unknown> = {}) => withProbe({ spaNav: { loaded: true, url: "https://x.com/", initialPageViews: 1, steps, ...over } });
test("TRK-31 pass, fail, n/a and unverified", () => {
  assert.equal(status("TRK-31", nav([step(), step()])), "pass");
  assert.equal(status("TRK-31", nav([step(), step({ pageViews: 0, ga4Hits: 0 })])), "fail");
  assert.equal(status("TRK-31", nav([step({ spa: false, pageViews: 0 })])), "n/a");
  assert.equal(status("TRK-31", nav([step({ spa: false })])), "n/a");
  assert.equal(status("TRK-31", nav([step({ clickFailed: true, spa: false })])), "unverified");
  assert.equal(status("TRK-31", nav([])), "unverified");
  assert.equal(status("TRK-31", nav([step()], { initialPageViews: 0 })), "unverified");
  assert.equal(status("TRK-31", nav([step()], { loaded: false })), "unverified");
});

// ---- TRK-19 ----
const tp = (page: TagPageProbe["page"], profile: TagPageProbe["profile"], over: Partial<TagPageProbe> = {}): TagPageProbe => ({ page, profile, url: `https://x.com/${page}`, loaded: true, gtmIds: ["GTM-AAA111"], gtagIds: [], ga4Ids: ["G-AAA"], pixelIds: [], ...over });
const full = () => [tp("home", "phone"), tp("collection", "phone"), tp("product", "phone"), tp("cart", "phone"), tp("home", "desktop"), tp("product", "desktop")];
const cov = (pages: TagPageProbe[]) => withProbe({ tagCoverage: { pages } });
test("TRK-19 pass, fail and unverified", () => {
  assert.equal(status("TRK-19", cov(full())), "pass");
  const lost = full(); lost[3] = tp("cart", "phone", { gtmIds: [] });
  const r = run("TRK-19", cov(lost));
  assert.equal(r.status, "fail");
  assert.match(r.reason, /cart \(phone\)/);
  const banner = full(); banner[3] = tp("cart", "phone", { gtmIds: [], consentBanner: true });
  assert.equal(status("TRK-19", cov(banner)), "unverified");
  assert.equal(status("TRK-19", cov(full().filter(p => p.profile === "phone"))), "unverified", "no desktop page");
  assert.equal(status("TRK-19", cov(full().filter(p => p.page === "home"))), "unverified", "too few phone pages");
  assert.equal(status("TRK-19", cov([tp("home", "phone", { loaded: false })])), "unverified");
  assert.equal(status("TRK-19", cov(full().map(p => ({ ...p, gtmIds: [], ga4Ids: [] })))), "unverified", "no tag on home");
  // GA4-only store: the GA4 id is the baseline.
  const ga = full().map(p => ({ ...p, gtmIds: [] }));
  assert.equal(status("TRK-19", cov(ga)), "pass");
  ga[1] = tp("collection", "phone", { gtmIds: [], ga4Ids: [] });
  assert.equal(status("TRK-19", cov(ga)), "fail");
  // A different container on another page is not the home container.
  const other = full(); other[2] = tp("product", "phone", { gtmIds: ["GTM-BBB222"] });
  assert.equal(status("TRK-19", cov(other)), "fail");
});

// ---- TRK-32 ----
const timing = (over: Record<string, unknown> = {}) => withProbe({ hitTiming: { loaded: true, url: "https://x.com/", throttled: true, lcpMs: 3000, hits: [{ vendor: "ga4", name: "page_view", tMs: 1800 }, { vendor: "meta", name: "PageView", tMs: 2200 }], ...over } });
test("TRK-32 pass, fail and unverified", () => {
  assert.equal(status("TRK-32", timing()), "pass");
  assert.equal(status("TRK-32", timing({ hits: [{ vendor: "ga4", name: "page_view", tMs: 1800 }, { vendor: "meta", name: "PageView", tMs: 3500 }] })), "fail");
  assert.equal(status("TRK-32", timing({ hits: [{ vendor: "ga4", name: "page_view", tMs: 4100 }] })), "fail");
  assert.equal(status("TRK-32", timing({ hits: [{ vendor: "ga4", name: "page_view", tMs: 900 }, { vendor: "meta", name: "ViewContent", tMs: 9000 }] })), "pass", "only PageView counts for pixels");
  assert.equal(status("TRK-32", timing({ throttled: false })), "unverified");
  assert.equal(status("TRK-32", timing({ lcpMs: undefined })), "unverified");
  assert.equal(status("TRK-32", timing({ hits: [] })), "unverified");
  assert.equal(status("TRK-32", timing({ loaded: false })), "unverified");
});

// ---- LAND-06 ----
const AR = "تسوق الآن أفضل المنتجات الطبيعية بأسعار مناسبة وشحن سريع لجميع دول الخليج والعالم العربي";
const EN = "Shop the best natural products with fast shipping to the whole Gulf region and beyond today";
const blk = (text: string): TextBlock => ({ id: "b1", text, tag: "p", box: { x: 0, y: 0, w: 300, h: 20 }, aboveFold: true });
const landing = (text: string, lang: string, dir: string, over: Record<string, unknown> = {}) => store(undefined, [{ pageType: "landing", url: "https://x.com/lp", loaded: true, blocks: [blk(text)], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, facts: { lang, dir, hreflang: [], langSwitch: false, ...over } } as unknown as PageEvidence]);
test("LAND-06 pass, fail and unverified", () => {
  assert.equal(status("LAND-06", landing(AR, "ar", "rtl")), "pass");
  assert.equal(status("LAND-06", landing(AR, "en", "ltr")), "fail");
  assert.equal(status("LAND-06", landing(AR, "ar-KW", "ltr")), "fail");
  assert.equal(status("LAND-06", landing(EN, "en", "ltr", { langSwitch: true })), "pass");
  assert.equal(status("LAND-06", landing(EN, "en", "ltr", { hreflang: ["ar", "en"] })), "pass");
  assert.equal(status("LAND-06", landing(EN, "ar", "rtl", { langSwitch: true })), "fail");
  assert.equal(status("LAND-06", landing(EN, "", "ltr", { langSwitch: true })), "fail", "no lang attribute");
  assert.equal(status("LAND-06", landing(EN, "en", "ltr")), "unverified", "no Arabic version found");
  assert.equal(status("LAND-06", landing(`${AR} ${EN}`, "en", "ltr")), "unverified", "mixed text");
  assert.equal(status("LAND-06", landing("Shop", "en", "ltr")), "unverified", "too little text");
  assert.equal(status("LAND-06", store()), "unverified", "no landing page");
});
