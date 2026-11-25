import assert from "node:assert/strict";
import { test } from "node:test";
import type { StoreEvidence } from "../../fud/evidence.js";
import type { Ga4Facts } from "../../types.js";
import { TRACKING_RULES as R } from "./tracking.js";

const row = (source: string, medium: string, sessions = 200, channel = "Paid Social") => ({ channel, source, medium, campaign: "c", sessions, engaged: 1, adds: 1, sales: 1, revenue: 1 });
const ga4 = (campaigns: ReturnType<typeof row>[], facts: Ga4Facts["facts"] = {}, purchases = 10): Ga4Facts => ({ currency: "SAR", periodDays: 28, sessions: 5000, purchases, revenue: 1, conversionRate: 0.01, aov: 20, focus: { step: null, page: null }, facts, campaigns }) as Ga4Facts;
const tag = (name: string, type: string, extra: Record<string, unknown> = {}) => ({ name, type, firingTriggerId: ["7"], parameter: [], ...extra });
const gtm = (tags: unknown[]) => ({ liveVersion: { tags, triggers: [{ triggerId: "7", type: "customEvent", name: "evt" }] } });
const metaHtml = (ev: string) => tag(`Meta ${ev}`, "html", { parameter: [{ key: "html", value: `fbq('track','${ev}')` }] });
const ev = (over: Partial<StoreEvidence>) => ({ website: "https://x.com", pages: [], addToCart: { attempted: true, ok: true, via: "click", clickAdded: true }, ...over }) as StoreEvidence;

test("TRK-05: google/cpc without any Ads tag or link fails; the conversion tag alone passes (the linker is TRK-48); no google traffic is n/a", () => {
  const g = ga4([row("google", "cpc", 100, "Paid Search")]);
  assert.equal(R["TRK-05"]({ ga4: g, gtm: gtm([tag("Other", "gaawe")]) }).status, "fail");
  assert.equal(R["TRK-05"]({ ga4: g, gtm: gtm([tag("Conv", "awct")]) }).status, "pass");
  assert.equal(R["TRK-05"]({ ga4: ga4([row("facebook", "paid")]), gtm: gtm([]) }).status, "n/a");
  assert.equal(R["TRK-05"]({ ga4: g }).status, "unverified");
  const linked = ga4([row("google", "cpc", 100, "Paid Search")], { "GA4-21": { id: "GA4-21", status: "pass", en: "linked" } });
  assert.equal(R["TRK-05"]({ ga4: linked, gtm: gtm([]) }).status, "unverified", "linked may import");
});

test("TRK-12: PageView and AddToCart pass; missing AddToCart fails; silent pixel with a GTM tag is unverified", () => {
  const g = ga4([row("facebook", "paid")]);
  const ok = ev({ pageHits: [{ page: "home", vendor: "meta", name: "PageView" }], atcHits: [{ vendor: "meta", name: "AddToCart" }] });
  assert.equal(R["TRK-12"]({ ga4: g, evidence: ok, gtm: gtm([]) }).status, "pass");
  const noAtc = ev({ pageHits: [{ page: "home", vendor: "meta", name: "PageView" }], atcHits: [{ vendor: "ga4", name: "add_to_cart" }] });
  assert.equal(R["TRK-12"]({ ga4: g, evidence: noAtc }).status, "fail");
  const silent = ev({ pageHits: [{ page: "home", vendor: "ga4", name: "page_view" }], atcHits: [] });
  assert.equal(R["TRK-12"]({ ga4: g, evidence: silent, gtm: gtm([metaHtml("PageView")]) }).status, "unverified");
  assert.equal(R["TRK-12"]({ ga4: g, evidence: silent, gtm: gtm([]) }).status, "fail");
});

test("TRK-13: GTM needs purchase and add-to-cart tags per paid platform", () => {
  const g = ga4([row("facebook", "paid")]);
  assert.equal(R["TRK-13"]({ ga4: g, gtm: gtm([metaHtml("Purchase"), metaHtml("AddToCart")]) }).status, "pass");
  assert.equal(R["TRK-13"]({ ga4: g, gtm: gtm([]), evidence: ev({}) }).status, "fail");
  assert.equal(R["TRK-13"]({ ga4: g, gtm: gtm([]), evidence: ev({ pageHits: [{ page: "home", vendor: "meta", name: "PageView" }] }) }).status, "unverified");
});

test("TRK-16: only Shopify is judged; GTM purchase tags there fail", () => {
  const sc = (platform: string) => ({ platform }) as never;
  assert.equal(R["TRK-16"]({ siteChecks: sc("zid") }).status, "n/a");
  assert.equal(R["TRK-16"]({ siteChecks: sc("shopify"), gtm: gtm([metaHtml("Purchase")]) }).status, "fail");
  assert.equal(R["TRK-16"]({ siteChecks: sc("shopify"), gtm: gtm([]), ga4: ga4([]) }).status, "pass");
});

test("TRK-29: a second ID or a paused tag fails", () => {
  const sc = { pixelMap: { pages: [], ids: { meta: ["1", "2"] } } } as never;
  assert.equal(R["TRK-29"]({ siteChecks: sc, gtm: gtm([]) }).status, "fail");
  const one = { pixelMap: { pages: [], ids: { meta: ["1"] } } } as never;
  assert.equal(R["TRK-29"]({ siteChecks: one, gtm: gtm([tag("Old", "html", { paused: true })]) }).status, "fail");
  assert.equal(R["TRK-29"]({ siteChecks: one, gtm: gtm([tag("A", "gaawe")]) }).status, "pass");
});

test("TRK-43 follows the GA4 Ads-link fact", () => {
  assert.equal(R["TRK-43"]({ ga4: ga4([], { "GA4-21": { id: "GA4-21", status: "fail", en: "none" } }) }).status, "fail");
  assert.equal(R["TRK-43"]({ ga4: ga4([]) }).status, "unverified");
});

const home = { pageType: "home", url: "https://x.com", loaded: true } as StoreEvidence["pages"][number];
const product = { pageType: "product", url: "https://x.com/p", loaded: true } as StoreEvidence["pages"][number];
const probe = (cookies: string[] | undefined, consentBanner = false) => ({ campaignParams: { loaded: true, requestedUrl: "https://x.com/?gclid=1", params: [], ga4: [], cookies, consentBanner } }) as StoreEvidence["probes"];

test("TRK-39: a recorder seen passes; none fails; a consent banner or an old visit is unverified", () => {
  assert.equal(R["TRK-39"]({ evidence: ev({ pages: [home], recorders: ["Microsoft Clarity"] }) }).status, "pass");
  assert.equal(R["TRK-39"]({ evidence: ev({ pages: [home], recorders: [] }) }).status, "fail");
  assert.equal(R["TRK-39"]({ evidence: ev({ pages: [home], recorders: [] }), gtm: gtm([tag("Hotjar", "html")]) }).status, "pass", "a recorder tag in GTM");
  assert.equal(R["TRK-39"]({ evidence: ev({ pages: [home], recorders: [], probes: probe([], true) }) }).status, "unverified");
  assert.equal(R["TRK-39"]({ evidence: ev({ pages: [home] }) }).status, "unverified");
});

test("TRK-40: a pasted Meta pixel fails; known hosts pass; an unknown host is left to the AI", () => {
  const html = (name: string, body: string) => tag(name, "html", { parameter: [{ key: "html", value: body }] });
  assert.equal(R["TRK-40"]({ gtm: gtm([metaHtml("PageView")]) }).status, "fail");
  assert.equal(R["TRK-40"]({ gtm: gtm([html("gtag", "<script src='https://www.googletagmanager.com/gtag/js?id=G-1'></script>")]) }).status, "fail");
  assert.equal(R["TRK-40"]({ gtm: gtm([html("Clarity", "<script src='https://www.clarity.ms/tag/abc'></script>")]) }).status, "pass");
  assert.equal(R["TRK-40"]({ gtm: gtm([html("Odd", "<script src='https://cdn.weird-tracker.io/x.js'></script>")]) }).status, "unverified");
  assert.equal(R["TRK-40"]({ gtm: gtm([tag("GA4", "gaawe")]) }).status, "pass", "no Custom HTML at all");
  assert.equal(R["TRK-40"]({}).status, "unverified");
});

test("TRK-41: pushes cleared in between pass; a push right after another fails; no ecommerce pushes is n/a", () => {
  assert.equal(R["TRK-41"]({ evidence: ev({ pages: [product], dlEcommerce: ["null", "view_item", "null", "add_to_cart"] }) }).status, "pass");
  assert.equal(R["TRK-41"]({ evidence: ev({ pages: [product], dlEcommerce: ["view_item", "null", "add_to_cart"] }) }).status, "pass", "the first push needs no clear");
  const bad = R["TRK-41"]({ evidence: ev({ pages: [product], dlEcommerce: ["view_item", "add_to_cart"] }) });
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /add_to_cart/);
  assert.equal(R["TRK-41"]({ evidence: ev({ pages: [product], dlEcommerce: [] }) }).status, "n/a");
  assert.equal(R["TRK-41"]({ evidence: ev({ pages: [product], dlEcommerce: ["view_item"] }) }).status, "unverified");
  assert.equal(R["TRK-41"]({ evidence: ev({ pages: [product] }) }).status, "unverified", "older visit");
});

test("TRK-48: click-ID cookies per platform run; missing fails unless a consent banner shows; no platform is n/a", () => {
  const both = ga4([row("google", "cpc", 100, "Paid Search"), row("facebook", "paid")]);
  assert.equal(R["TRK-48"]({ ga4: both, evidence: ev({ probes: probe(["_gcl_aw", "_fbc", "_ga"]) }) }).status, "pass");
  const miss = R["TRK-48"]({ ga4: both, evidence: ev({ probes: probe(["_gcl_aw", "_ga"]) }) });
  assert.equal(miss.status, "fail");
  assert.match(miss.reason, /_fbc/);
  assert.equal(R["TRK-48"]({ ga4: both, evidence: ev({ probes: probe(["_ga"], true) }) }).status, "unverified");
  assert.equal(R["TRK-48"]({ ga4: ga4([row("tiktok", "paid")]), evidence: ev({ probes: probe(["_ga"]) }) }).status, "n/a");
  assert.equal(R["TRK-48"]({ evidence: ev({ pageHits: [{ page: "home", vendor: "meta", name: "PageView" }], probes: probe(["_fbc"]) }) }).status, "pass", "Meta seen without GA4");
  assert.equal(R["TRK-48"]({ ga4: both, evidence: ev({ probes: probe(undefined) }) }).status, "unverified", "older visit");
});
