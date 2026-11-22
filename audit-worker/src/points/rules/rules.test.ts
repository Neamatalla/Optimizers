import assert from "node:assert/strict";
import { test } from "node:test";
import type { PageEvidence, StoreEvidence, TextBlock } from "../../fud/evidence.js";
import type { Ga4Fact, Ga4Facts } from "../../types.js";
import { pointById } from "../index.js";
import { RULES, runRules } from "./index.js";

// ---- builders ----
let n = 0;
const block = (text: string, y: number, over: Partial<TextBlock> = {}): TextBlock => ({ id: `b${n++}`, text, tag: "p", box: { x: 10, y, w: 300, h: 24 }, aboveFold: y < 844, ...over });
function pg(pageType: PageEvidence["pageType"], over: Partial<PageEvidence> = {}): PageEvidence {
  return { pageType, url: `https://x.com/${pageType}`, loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, ...over };
}
const facts = (over: Record<string, unknown> = {}) => ({
  lang: "ar", dir: "rtl", hreflang: [], langSwitch: false, h1: [], h1Count: 1, nav: [], search: { present: true, visible: true, action: "", param: "q" },
  media: { images: 5, video: false, zoom: false }, infoSections: { details: 0, expanders: 0 }, heroButtons: [], hero: null, capture: { email: false, phone: false, account: false }, soldOutTop: 0, ...over,
}) as PageEvidence["facts"];
function store(pages: PageEvidence[], over: Partial<StoreEvidence> = {}): StoreEvidence {
  return { website: "https://x.com", pages, addToCart: { attempted: true, ok: true, via: "click", clickAdded: true }, blockedHits: 3, durationMs: 1, ...over } as StoreEvidence;
}
const ga4 = (fs: Ga4Fact[]): Ga4Facts => ({ currency: "KWD", periodDays: 28, sessions: 5000, purchases: 50, revenue: 1, conversionRate: 0.01, aov: 20, focus: { step: null, page: null }, facts: Object.fromEntries(fs.map(f => [f.id, f])) });

// ---- registry ----
test("every rule belongs to an active, code-decided master point", () => {
  for (const id of Object.keys(RULES)) {
    const p = pointById(id);
    assert.ok(p, `${id} exists`);
    assert.equal(p!.status, "active", id);
    assert.equal(p!.decidedBy, "code", id);
  }
});

test("a rule that throws is reported as unverified, the rest still run", () => {
  const out = runRules({ evidence: { pages: null } as never });
  assert.equal(out["PATH-03"].status, "unverified");
  assert.match(out["PATH-03"].reason, /Rule error/);
  assert.equal(out["TRK-01"].status, "unverified", "GA4 rules unaffected");
});

// ---- GA4 ----
test("GA4 rules map the computed fact: pass/fail kept, no_data and no GA4 become unverified", () => {
  assert.equal(RULES["TRK-20"]({}).status, "unverified");
  assert.match(RULES["TRK-20"]({}).reason, /No GA4 data/);
  const f = ga4([
    { id: "GA4-05", status: "fail", en: "Phones convert at 1.0% against 2.0% on desktop.", money: { low: 10, high: 20, currency: "KWD" } },
    { id: "GA4-02", status: "pass", en: "Of 1,000 people who viewed a product, 120 added to cart." },
    { id: "GA4-06", status: "no_data", en: "No landing-page data with sales to compare." },
  ]);
  const r = RULES["TRK-20"]({ ga4: f });
  assert.deepEqual([r.status, r.facts?.fact, r.facts?.moneyLow], ["fail", "GA4-05", 10]);
  assert.equal(RULES["TRK-01"]({ ga4: f }).status, "pass");
  assert.deepEqual([RULES["TRK-21"]({ ga4: f }).status, RULES["TRK-21"]({ ga4: f }).reason], ["unverified", "No landing-page data with sales to compare."]);
});

test("TRK-27 uses the 90-day key-event fact, and falls back to GA4-20 without it", () => {
  const both = ga4([{ id: "GA4-P16", status: "fail", en: "sign_up recorded nothing in 90 days." }, { id: "GA4-20", status: "pass", en: "Key events: purchase." }]);
  assert.equal(RULES["TRK-27"]({ ga4: both }).status, "fail");
  const fallback = ga4([{ id: "GA4-P16", status: "no_data", en: "No 90-day counts." }, { id: "GA4-20", status: "pass", en: "Key events: purchase." }]);
  assert.deepEqual([RULES["TRK-27"]({ ga4: fallback }).status, RULES["TRK-27"]({ ga4: fallback }).facts?.fact], ["pass", "GA4-20"]);
});

// ---- store visit ----
test("every visit rule says unverified when the visit didn't run", () => {
  for (const id of ["TRK-17", "PATH-03", "PATH-16", "PDP-01", "PDP-11", "NAV-02", "NAV-04", "NAV-10", "OFFER-06", "OFFER-18"]) {
    assert.equal(RULES[id]({}).status, "unverified", id);
  }
});

test("TRK-17: passes when every platform records the add to cart; a missing hit is unverified, never a fail", () => {
  const hits = [{ page: "product", vendor: "ga4", name: "view_item" }, { page: "product", vendor: "meta", name: "ViewContent" }];
  const all = store([], { pageHits: hits, atcEvents: { dataLayer: ["add_to_cart"], ga4: [], pixels: ["meta:AddToCart"] } });
  assert.equal(RULES["TRK-17"]({ evidence: all }).status, "pass");
  // regal-honey.com, 22 Nov: Meta and TikTok fired, GA4 sent nothing within the window.
  const late = store([], { pageHits: hits, atcEvents: { dataLayer: [], ga4: [], pixels: ["meta:AddToCart"] } });
  const r = RULES["TRK-17"]({ evidence: late });
  assert.equal(r.status, "unverified");
  assert.deepEqual(r.facts?.missing, ["ga4"]);
  const botClick = store([], { pageHits: hits, addToCart: { attempted: true, ok: true, via: "api", clickAdded: false } });
  assert.equal(RULES["TRK-17"]({ evidence: botClick }).status, "unverified");
});

test("PATH-03: a sold-out badge up top or a disabled buy button fails; both clean passes", () => {
  const ok = store([pg("home", { facts: facts() }), pg("product", { cta: { text: "Add to cart", box: { x: 0, y: 700, w: 200, h: 50 }, disabled: false, nearbyBlockIds: [] } })]);
  assert.equal(RULES["PATH-03"]({ evidence: ok }).status, "pass");
  const sold = store([pg("home", { facts: facts({ soldOutTop: 2 }) }), pg("product")]);
  assert.equal(RULES["PATH-03"]({ evidence: sold }).status, "fail");
  const off = store([pg("home", { facts: facts() }), pg("product", { cta: { text: "Sold out", box: { x: 0, y: 700, w: 200, h: 50 }, disabled: true, nearbyBlockIds: [] } })]);
  assert.equal(RULES["PATH-03"]({ evidence: off }).status, "fail");
});

test("PATH-16: a log-in page instead of checkout is unverified; a menu on checkout fails", () => {
  const login = store([pg("checkout", { note: "the store sent us to a log-in page before checkout", facts: facts() })]);
  assert.equal(RULES["PATH-16"]({ evidence: login }).status, "unverified");
  const menu = store([pg("checkout", { facts: facts({ nav: ["Home", "Shop", "Blog", "Contact"] }), popups: { onLoad: [], afterEscape: 0 } })]);
  assert.equal(RULES["PATH-16"]({ evidence: menu }).status, "fail");
  const clean = store([pg("checkout", { facts: facts({ nav: [] }), popups: { onLoad: [], afterEscape: 0 } })]);
  assert.equal(RULES["PATH-16"]({ evidence: clean }).status, "pass");
});

test("PDP-01: button below the fold with no sticky bar fails; a sticky bar rescues it; a missing price is unverified", () => {
  const cta = (y: number) => ({ text: "أضف للسلة", box: { x: 0, y, w: 185, h: 50 }, disabled: false, nearbyBlockIds: [] });
  assert.equal(RULES["PDP-01"]({ evidence: store([pg("product", { cta: cta(1200) })]) }).status, "fail");
  assert.equal(RULES["PDP-01"]({ evidence: store([pg("product", { cta: cta(1200), sticky: "أضف للسلة" })]) }).status, "pass");
  assert.equal(RULES["PDP-01"]({ evidence: store([pg("product", { cta: cta(700), blocks: [block("12.500 د.ك", 400)] })]) }).status, "pass");
  assert.equal(RULES["PDP-01"]({ evidence: store([pg("product", { cta: cta(700) })]) }).status, "unverified");
});

test("PDP-11: zoom found passes; zoom not found is unverified (pinch-zoom can't be seen)", () => {
  assert.equal(RULES["PDP-11"]({ evidence: store([pg("product", { facts: facts({ media: { images: 6, video: false, zoom: true } }) })]) }).status, "pass");
  assert.equal(RULES["PDP-11"]({ evidence: store([pg("product", { facts: facts() })]) }).status, "unverified");
});

test("NAV-02: reads the desktop menu; over 6 links or a blog ahead of shopping links fails", () => {
  const withDesk = (nav: string[]) => store([pg("home", { facts: facts() })], { desktop: [pg("home", { facts: facts({ nav }) })] });
  assert.equal(RULES["NAV-02"]({ evidence: withDesk(["الرئيسية", "العسل", "عروض", "تواصل معنا"]) }).status, "pass");
  assert.equal(RULES["NAV-02"]({ evidence: withDesk(["Home", "Blog", "Shop", "Sale"]) }).status, "fail");
  assert.equal(RULES["NAV-02"]({ evidence: withDesk(["1", "2", "3", "4", "5", "6", "7"]) }).status, "fail");
  assert.equal(RULES["NAV-02"]({ evidence: store([pg("home", { facts: facts() })]) }).status, "unverified", "no desktop visit");
});

test("NAV-04: search hidden behind the phone menu fails", () => {
  const s = (visible: boolean, present = true) => store([pg("home", { facts: facts({ search: { present, visible, action: "", param: "q" } }) })]);
  assert.equal(RULES["NAV-04"]({ evidence: s(true) }).status, "pass");
  assert.equal(RULES["NAV-04"]({ evidence: s(false) }).status, "fail");
  assert.match(RULES["NAV-04"]({ evidence: s(false, false) }).reason, /No search/);
});

test("NAV-10: a popup covering the screen on arrival fails; cookie banners don't count", () => {
  const home = (onLoad: Array<{ kind: string; cover: number; text: string }>) => store([pg("home", { popups: { onLoad, afterEscape: 0 } })]);
  assert.equal(RULES["NAV-10"]({ evidence: home([]) }).status, "pass");
  assert.equal(RULES["NAV-10"]({ evidence: home([{ kind: "cookie", cover: 20, text: "We use cookies" }]) }).status, "pass");
  assert.equal(RULES["NAV-10"]({ evidence: home([{ kind: "other", cover: 74, text: "ابدأ الاختبار الآن" }]) }).status, "fail");
});

test("OFFER-06: no provider is n/a; a line near the price passes; a provider with no readable line is unverified", () => {
  const price = block("15.000 د.ك", 300);
  assert.equal(RULES["OFFER-06"]({ evidence: store([pg("product", { blocks: [price] })]) }).status, "n/a");
  assert.equal(RULES["OFFER-06"]({ evidence: store([pg("product", { blocks: [price, block("قسّمها على 4 دفعات بدون فوائد مع تابي", 340)] })]) }).status, "pass");
  assert.equal(RULES["OFFER-06"]({ evidence: store([pg("product", { blocks: [price, block("pay in 4 installments", 1200)] })]) }).status, "fail");
  assert.equal(RULES["OFFER-06"]({ evidence: store([pg("product", { blocks: [price], widgets: ["tabby"] })]) }).status, "unverified");
});

test("OFFER-18: no stock message is n/a, not a fail", () => {
  const price = block("15.000 د.ك", 300);
  assert.equal(RULES["OFFER-18"]({ evidence: store([pg("product", { blocks: [price] })]) }).status, "n/a");
  assert.equal(RULES["OFFER-18"]({ evidence: store([pg("product", { blocks: [price, block("Only 3 left in stock", 360)] })]) }).status, "pass");
  assert.equal(RULES["OFFER-18"]({ evidence: store([pg("product", { blocks: [price, block("الاكثر مبيعا", 900)] })]) }).status, "fail");
});

// regal-honey.com, 22 Nov: the announcement bar "free shipping over 40 KD" was
// taken as the product price, so price distances were measured from the top.
test("the product price is the one near the buy button, never a shipping or promo line", () => {
  const cta = { text: "أضف للسلة", box: { x: 10, y: 775, w: 185, h: 50 }, disabled: false, nearbyBlockIds: [] };
  const bar = block("كود خصم R26 + شحن مجاني للطلبات فوق 40 دينار كويتي", 11);
  const price = block("53.100 د.ك", 925);
  const tabby = block("قسّمها على 4 دفعات بدون فوائد مع تابي", 980);
  const r = RULES["OFFER-06"]({ evidence: store([pg("product", { cta, blocks: [bar, price, tabby] })]) });
  assert.equal(r.status, "pass");
  assert.equal(r.facts?.distancePx, 31);
  // Price below the first screen with no sticky bar fails; with one it passes.
  assert.equal(RULES["PDP-01"]({ evidence: store([pg("product", { cta, blocks: [bar, price] })]) }).status, "fail");
  assert.equal(RULES["PDP-01"]({ evidence: store([pg("product", { cta, blocks: [bar, price], sticky: "أضف للسلة" })]) }).status, "pass");
});

// ---- PageSpeed ----
test("metricsFrom reads LCP, CLS, TBT, page weight and third-party bytes from a Lighthouse result", async () => {
  const { metricsFrom } = await import("../../pagespeed.js");
  const m = metricsFrom({ audits: {
    "largest-contentful-paint": { numericValue: 3120 }, "cumulative-layout-shift": { numericValue: 0.04 }, "total-blocking-time": { numericValue: 410 },
    "total-byte-weight": { numericValue: 2_000_000 }, "third-party-summary": { details: { items: [{ entity: "Facebook", transferSize: 300_000 }, { entity: { text: "Hotjar" }, transferSize: 50_000 }] } },
  } });
  assert.deepEqual(m, { lcpMs: 3120, cls: 0.04, tbtMs: 410, totalBytes: 2_000_000, thirdParty: [{ entity: "Facebook", bytes: 300_000 }, { entity: "Hotjar", bytes: 50_000 }] });
  assert.deepEqual(metricsFrom(undefined), { lcpMs: null, cls: null, tbtMs: null, totalBytes: null, thirdParty: null });
});

const speed = (pages: Array<[string, Record<string, unknown>]>) => ({ pages: pages.map(([type, m]) => ({ type, url: `https://x.com/${type}`, mobile: 50, desktop: 80, mobileMetrics: { lcpMs: null, cls: null, tbtMs: null, totalBytes: null, thirdParty: null, ...m } })), average: { mobile: 50, desktop: 80 } }) as never;

test("speed rules: the worst page decides; no numbers is unverified", () => {
  const ps = speed([["home", { lcpMs: 2100, cls: 0.02, tbtMs: 150 }], ["product", { lcpMs: 3400, cls: 0.25, tbtMs: 90 }], ["collection", { cls: 0.05 }]]);
  const lcp = RULES["SPEED-01"]({ pageSpeed: ps });
  assert.equal(lcp.status, "fail");
  assert.match(lcp.reason, /3\.4 s on the product page/);
  assert.equal(RULES["SPEED-02"]({ pageSpeed: ps }).status, "fail");
  assert.equal(RULES["SPEED-03"]({ pageSpeed: ps }).status, "pass");
  assert.equal(RULES["SPEED-01"]({ pageSpeed: speed([["home", {}]]) }).status, "unverified", "old results have no metrics");
  assert.equal(RULES["SPEED-01"]({}).status, "unverified");
});

test("SPEED-06: third-party apps over half the home page, or one app over 20%, fail; platform CDNs don't count", () => {
  const home = (thirdParty: Array<{ entity: string; bytes: number }>) => speed([["home", { totalBytes: 1_000_000, thirdParty }]]);
  assert.equal(RULES["SPEED-06"]({ pageSpeed: home([{ entity: "Facebook", bytes: 150_000 }, { entity: "Shopify", bytes: 600_000 }]) }).status, "pass");
  assert.equal(RULES["SPEED-06"]({ pageSpeed: home([{ entity: "Facebook", bytes: 250_000 }]) }).status, "fail");
  assert.equal(RULES["SPEED-06"]({ pageSpeed: home([{ entity: "A", bytes: 190_000 }, { entity: "B", bytes: 190_000 }, { entity: "C", bytes: 190_000 }]) }).status, "fail");
});

test("PATH-08: a share button is ignored; a short number fails; no links is n/a", () => {
  const withLinks = (links: string[]) => store([pg("product", { facts: facts({ contactLinks: links }) })]);
  assert.equal(RULES["PATH-08"]({ evidence: withLinks(["https://api.whatsapp.com/send?text=look https://x.com/p", "https://wa.me/96596080212"]) }).status, "pass");
  assert.equal(RULES["PATH-08"]({ evidence: withLinks(["tel:12345"]) }).status, "fail");
  assert.equal(RULES["PATH-08"]({ evidence: withLinks([]) }).status, "n/a");
});

test("points built from two GA4 facts: any fail fails, a pass needs both, a gap is unverified", () => {
  const f = (a: Ga4Fact["status"], b: Ga4Fact["status"]) => ga4([{ id: "GA4-19", status: a, en: "Gateways." }, { id: "GA4-P06", status: b, en: "Self-referrals." }]);
  assert.equal(RULES["TRK-06"]({ ga4: f("pass", "pass") }).status, "pass");
  assert.equal(RULES["TRK-06"]({ ga4: f("pass", "fail") }).status, "fail");
  assert.equal(RULES["TRK-06"]({ ga4: f("fail", "no_data") }).status, "fail");
  const gapR = RULES["TRK-06"]({ ga4: f("pass", "no_data") });
  assert.equal(gapR.status, "unverified");
  assert.deepEqual(gapR.facts?.unchecked, ["GA4-P06"]);
});

test("every active code-decided point has a code rule", async () => {
  const { activePoints } = await import("../index.js");
  const missing = activePoints().filter(p => p.decidedBy === "code" && !RULES[p.id]).map(p => p.id);
  assert.deepEqual(missing, []);
});
