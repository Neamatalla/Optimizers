import assert from "node:assert/strict";
import { test } from "node:test";
import type { ClaritySnapshot } from "../../clarity-facts.js";
import type { Ga4Facts } from "../../types.js";
import { parseGtm } from "../gtm.js";
import { RULES } from "./index.js";

// ---- Clarity ----
const beh = (pct: number) => ({ sessionsPct: pct, pageViews: null, count: null });
function clarity(byUrl: ClaritySnapshot["byUrl"], over: Partial<ClaritySnapshot> = {}): ClaritySnapshot {
  return {
    source: "clarity", fetchedAt: null, days: 3, hostMatch: true, sessions: 5000, botSessions: 0, distinctUsers: 4000, pagesPerSession: 2,
    engagement: { totalSeconds: 1, activeSeconds: 1 }, scrollDepth: 50,
    behaviours: { deadClicks: beh(5), rageClicks: beh(1), quickbacks: beh(8), excessiveScroll: beh(2), scriptErrors: beh(3), errorClicks: beh(1) },
    devices: [], browsers: [], os: [], countries: [], referrers: [], pageTitles: [], topPages: [{ url: "https://x.com/", visits: 900 }], byUrl, byDevice: null, ...over,
  };
}
const row = (name: string, sessions: number, v: Record<string, number>) => ({ name, sessions, scrollDepth: null, ...v });

test("Clarity rules need a connected, matching project with page rows", () => {
  assert.equal(RULES["PATH-06"]({}).status, "unverified");
  assert.match(RULES["PATH-06"]({ clarity: clarity([], { hostMatch: false }) }).reason, /different site/);
  assert.equal(RULES["PDP-02"]({ clarity: clarity(null) }).status, "unverified");
});

test("PATH-06: product and cart error shares vs the site's own share", () => {
  const ok = clarity([row("https://x.com/products/a", 300, { scriptErrors: 2, errorClicks: 0.5 }), row("https://x.com/cart", 120, { scriptErrors: 3, errorClicks: 1 })]);
  assert.equal(RULES["PATH-06"]({ clarity: ok }).status, "pass");
  const bad = clarity([row("https://x.com/products/a", 300, { scriptErrors: 9, errorClicks: 0.5 })]);
  assert.equal(RULES["PATH-06"]({ clarity: bad }).status, "fail");
  const thin = clarity([row("https://x.com/products/a", 40, { scriptErrors: 9, errorClicks: 4 })]);
  assert.equal(RULES["PATH-06"]({ clarity: thin }).status, "unverified", "under 100 sessions");
});

test("PDP-02: the most-visited product page's dead and rage clicks vs site-wide", () => {
  const c = clarity([row("https://x.com/products/top", 400, { deadClicks: 9, rageClicks: 0.5 }), row("https://x.com/products/b", 150, { deadClicks: 1, rageClicks: 0 })]);
  const r = RULES["PDP-02"]({ clarity: c });
  assert.equal(r.status, "fail");
  assert.equal(r.facts?.url, "https://x.com/products/top");
});

test("LAND-05: the most-visited page's quick-backs vs site-wide", () => {
  assert.equal(RULES["LAND-05"]({ clarity: clarity([row("https://x.com/", 900, { quickbacks: 6 })]) }).status, "pass");
  assert.equal(RULES["LAND-05"]({ clarity: clarity([row("https://x.com/", 900, { quickbacks: 15 })]) }).status, "fail");
  assert.equal(RULES["LAND-05"]({ clarity: clarity([row("https://x.com/other", 900, { quickbacks: 6 })]) }).status, "unverified");
});

// ---- GA4 items per order ----
test("OFFER-15: 1.2 items per order or more passes", () => {
  const g = (itemsPerOrder: number | null) => ({ facts: {}, itemsPerOrder } as unknown as Ga4Facts);
  assert.equal(RULES["OFFER-15"]({ ga4: g(1.45) }).status, "pass");
  assert.equal(RULES["OFFER-15"]({ ga4: g(1.05) }).status, "fail");
  assert.equal(RULES["OFFER-15"]({ ga4: g(null) }).status, "unverified");
});

// ---- GTM ----
const p = (key: string, value: string) => ({ key, type: "template", value });
const gtm = (tags: unknown[], triggers: unknown[] = []) => ({ liveVersion: { tags, triggers } });
const purchaseTrigger = { triggerId: "10", name: "purchase event", type: "customEvent", customEventFilter: [{ type: "equals", parameter: [{ key: "arg0", value: "{{_event}}" }, { key: "arg1", value: "purchase" }] }] };
const thankYou = { triggerId: "11", name: "thank you page", type: "pageview", filter: [{ type: "contains", parameter: [{ key: "arg0", value: "{{Page URL}}" }, { key: "arg1", value: "/thank-you" }] }] };

test("parseGtm finds purchase tags per platform, their triggers and IDs", () => {
  const s = parseGtm(gtm([
    { name: "GA4 purchase", type: "gaawe", firingTriggerId: ["10"], parameter: [p("eventName", "purchase"), p("sendEcommerceData", "true")] },
    { name: "Meta Purchase", type: "html", firingTriggerId: ["2147479553"], parameter: [p("html", "<script>fbq('track','Purchase',{value:1});</script>")] },
    { name: "Snap", type: "html", paused: true, firingTriggerId: ["10"], parameter: [p("html", "<script>snaptr('track','PURCHASE')</script>")] },
  ], [purchaseTrigger]))!;
  assert.deepEqual(s.conversionTags.map(t => [t.name, t.platform, t.triggers[0].kind, t.sendsOrderId]), [["GA4 purchase", "ga4", "custom_event", true], ["Meta Purchase", "meta", "all_pages", false]]);
  assert.equal(parseGtm(null), null);
});

test("TRK-11: purchase tags on a dataLayer event with an order ID pass; All Pages or a thank-you page view fail", () => {
  const ga4Tag = { name: "GA4 purchase", type: "gaawe", firingTriggerId: ["10"], parameter: [p("eventName", "purchase"), p("sendEcommerceData", "true")] };
  assert.equal(RULES["TRK-11"]({ gtm: gtm([ga4Tag], [purchaseTrigger]) }).status, "pass");
  const ads = { name: "Ads conv", type: "awct", firingTriggerId: ["11"], parameter: [p("conversionId", "1")] };
  const r = RULES["TRK-11"]({ gtm: gtm([ga4Tag, ads], [purchaseTrigger, thankYou]) });
  assert.equal(r.status, "fail");
  assert.match(r.reason, /thank-you URL/);
  assert.match(r.reason, /no order ID/);
  assert.equal(RULES["TRK-11"]({}).status, "unverified");
  const cut = { name: "Pixels", type: "html", firingTriggerId: ["10"], parameter: [p("html", "<script>!function(f,b,e){…")] };
  assert.match(RULES["TRK-11"]({ gtm: gtm([cut], [purchaseTrigger]) }).reason, /cut off/);
});

test("TRK-28: Meta/TikTok/Snap tags and our click's hits need an event ID", () => {
  const withId = { name: "Meta Purchase", type: "html", firingTriggerId: ["10"], parameter: [p("html", "fbq('track','Purchase',{}, {eventID: '{{order id}}'})")] };
  const noId = { name: "TikTok", type: "html", firingTriggerId: ["10"], parameter: [p("html", "ttq.track('CompletePayment')")] };
  assert.equal(RULES["TRK-28"]({ gtm: gtm([withId]) }).status, "pass");
  assert.equal(RULES["TRK-28"]({ gtm: gtm([withId, noId]) }).status, "fail");
  const ev = { atcHits: [{ vendor: "meta", name: "AddToCart", q: { eventId: false } }] } as never;
  assert.equal(RULES["TRK-28"]({ evidence: ev }).status, "fail");
  assert.equal(RULES["TRK-28"]({}).status, "unverified");
});
