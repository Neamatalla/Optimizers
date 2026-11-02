import assert from "node:assert/strict";
import { test } from "node:test";
import { hitEvents } from "./fud/collect.js";
import type { StoreEvidence } from "./fud/evidence.js";
import { collectorLanding } from "./ga4-facts.js";
import { pagesForTab } from "./fud/manual-checklist-score.js";
import { signalQualityFrom } from "./signal-quality.js";

test("Meta hits: value, currency, product IDs, event ID and user data are read; user data values are not kept", () => {
  const url = "https://www.facebook.com/tr/?id=123456789012345&ev=AddToCart&cd[value]=1399&cd[currency]=EGP&cd%5Bcontent_ids%5D=%5B%2287%22%5D&cd[content_type]=product&eid=abc-1&ud[em]=deadbeef";
  const [h] = hitEvents(url, undefined);
  assert.equal(h.vendor, "meta");
  assert.equal(h.name, "AddToCart");
  assert.equal(h.id, "123456789012345");
  assert.deepEqual(h.q, { value: 1399, currency: "EGP", items: 1, eventId: true, userData: true, contentType: "product" });
  assert.ok(!JSON.stringify(h).includes("deadbeef"));
});

test("Meta multipart body is read the same way", () => {
  const body = ['name="ev"', "", "ViewContent", 'name="cd[value]"', "", "250"].map((l, i) => (i % 3 === 0 ? `Content-Disposition: form-data; ${l}` : l)).join("\r\n");
  const [h] = hitEvents("https://www.facebook.com/tr/?id=123456789012345", body);
  assert.equal(h.name, "ViewContent");
  assert.equal(h.q?.value, 250);
  assert.equal(h.q?.eventId, undefined);
});

test("GA4 batched hits: one event per body line, shared currency from the URL, items counted", () => {
  const url = "https://region1.google-analytics.com/g/collect?v=2&tid=G-ABC123&cu=EGP";
  const body = ["en=view_item&epn.value=1399&pr1=id87~nmOil", "en=scroll&epn.percent_scrolled=90"].join("\n");
  const hits = hitEvents(url, body);
  assert.deepEqual(hits.map(h => h.name), ["view_item", "scroll"]);
  assert.deepEqual(hits[0].q, { value: 1399, currency: "EGP", items: 1 });
  assert.equal(hits[0].id, "G-ABC123");
});

test("GA4: the first event in the URL is read too, and its fields don't leak into the body events", () => {
  const url = "https://region1.google-analytics.com/g/collect?v=2&tid=G-W24H2MD4HL&_s=3&sid=9&cu=SAR&en=view_item&epn.value=120&pr1=id5~nmHoney";
  const body = ["en=user_engagement&_et=4000", "en=scroll&epn.percent_scrolled=90"].join("\n");
  const hits = hitEvents(url, body);
  assert.deepEqual(hits.map(h => h.name), ["view_item", "user_engagement", "scroll"]);
  assert.deepEqual(hits[0].q, { value: 120, currency: "SAR", items: 1 });
  assert.equal(hits[1].q?.value, undefined, "the URL event's value stays with it");
  assert.equal(hits[1].q?.items, undefined);
  assert.equal(hits[1].q?.currency, "SAR", "shared currency still applies");
});

test("TikTok JSON body: properties and event_id", () => {
  const body = JSON.stringify({ event: "AddToCart", event_id: "e1", properties: { value: 99, currency: "SAR", contents: [{ content_id: "1" }, { content_id: "2" }] }, context: { user: {} } });
  const [h] = hitEvents("https://analytics.tiktok.com/api/v2/pixel", body);
  assert.deepEqual(h.q, { value: 99, currency: "SAR", items: 2, eventId: true });
});

const ev = (over: Partial<StoreEvidence> = {}): StoreEvidence => ({
  website: "https://store.eg",
  pages: [
    { pageType: "product", url: "https://store.eg/p", loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} },
    { pageType: "checkout", url: "https://store.eg/checkout", loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} },
  ],
  addToCart: { attempted: true, ok: true, via: "click", clickAdded: true },
  blockedHits: 5,
  durationMs: 1,
  ...over,
} as StoreEvidence);

test("signal quality: full Meta signal scores 100; a missing event, a missing field and a double fire are named", () => {
  const full = { value: 100, currency: "EGP", items: 1, eventId: true };
  const good = signalQualityFrom(ev({
    pageHits: [{ page: "product", vendor: "meta", name: "ViewContent", q: full }, { page: "checkout", vendor: "meta", name: "InitiateCheckout", q: full }],
    atcHits: [{ vendor: "meta", name: "AddToCart", q: full }],
  }), "EGP")!;
  assert.equal(good.score, 100);
  assert.deepEqual(good.issues, []);

  const bad = signalQualityFrom(ev({
    pageHits: [{ page: "product", vendor: "meta", name: "ViewContent", q: { value: 100, currency: "EGP", items: 1 } }, { page: "checkout", vendor: "meta", name: "PageView", q: {} }],
    atcHits: [{ vendor: "meta", name: "AddToCart", q: full }, { vendor: "meta", name: "AddToCart", q: full }],
  }), "EGP")!;
  const kinds = bad.issues.map(i => `${i.step}:${i.kind}`).sort();
  assert.deepEqual(kinds, ["cart:twice", "checkout:missing", "view:no_event_id"]);
  assert.deepEqual(bad.vendors[0].cells.find(c => c.step === "checkout")!.other, ["PageView"]);
  assert.ok(bad.score! < 70);
});

test("signal quality: steps the visit didn't reach are untested, not failed; old evidence gives nothing", () => {
  const sq = signalQualityFrom(ev({
    pages: [{ pageType: "product", url: "https://store.eg/p", loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} }],
    addToCart: { attempted: true, ok: true, via: "api", clickAdded: false },
    pageHits: [{ page: "product", vendor: "ga4", name: "view_item", q: { value: 5, currency: "EGP", items: 1 } }],
    atcHits: [],
  }), "EGP")!;
  assert.deepEqual(sq.reached, { view: true, cart: false, checkout: false });
  assert.deepEqual(sq.vendors[0].cells.map(c => c.status), ["sent", "untested", "untested"]);
  assert.equal(sq.score, 100);
  assert.equal(signalQualityFrom(ev({ pageHits: [{ page: "product", vendor: "meta", name: "ViewContent" }] })), null);
});

test("signal quality: a pixel silent during a step is not tested there, never 'missing'; late events count for their own step", () => {
  const full = { value: 100, currency: "EGP", items: 1, eventId: true };
  const sq = signalQualityFrom(ev({
    // Meta sent nothing on the product page (not loaded yet), only at checkout.
    pageHits: [
      { page: "product", vendor: "ga4", name: "page_view" },
      { page: "checkout", vendor: "meta", name: "InitiateCheckout", q: full },
      // GA4's begin_checkout arrived while the next page loaded.
      { page: "collection", vendor: "ga4", name: "begin_checkout", q: { value: 100, currency: "EGP", items: 1 } },
    ],
    atcHits: [{ vendor: "ga4", name: "add_to_cart", q: { value: 100, currency: "EGP", items: 1 } }, { vendor: "ga4", name: "view_item", q: { value: 100, currency: "EGP", items: 1 } }],
  }), "EGP")!;
  const meta = sq.vendors.find(v => v.vendor === "meta")!;
  assert.deepEqual(meta.cells.map(c => `${c.status}${c.silent ? ":silent" : ""}`), ["untested:silent", "untested:silent", "sent"]);
  const ga4 = sq.vendors.find(v => v.vendor === "ga4")!;
  assert.deepEqual(ga4.cells.map(c => c.status), ["sent", "sent", "sent"], "view_item after the tap and begin_checkout on the next page still count");
  assert.ok(!sq.issues.some(i => i.vendor === "meta"));
});

test("signal quality: a checkout behind a log-in wall is not tested, never 'missing'", () => {
  const sq = signalQualityFrom(ev({
    pages: [
      { pageType: "product", url: "https://store.eg/p", loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} },
      { pageType: "checkout", url: "https://store.eg/login", loaded: true, note: "first checkout screen only, nothing typed: the store sent us to a log-in page before checkout", blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} },
    ],
    pageHits: [{ page: "product", vendor: "meta", name: "ViewContent", q: { value: 1, currency: "SAR", items: 1, eventId: true } }, { page: "checkout", vendor: "meta", name: "PageView" }],
    atcHits: [{ vendor: "meta", name: "AddToCart", q: { value: 1, currency: "SAR", items: 1, eventId: true } }],
  }), "SAR")!;
  assert.equal(sq.reached.checkout, false);
  assert.equal(sq.checkoutLogin, true);
  assert.equal(sq.vendors[0].cells[2].status, "untested");
  assert.ok(!sq.issues.some(i => i.kind === "missing"));
});

test("signal quality: platforms that disagree on value, and a currency that isn't the store's", () => {
  const sq = signalQualityFrom(ev({
    pageHits: [
      { page: "product", vendor: "meta", name: "ViewContent", q: { value: 1399, currency: "USD", items: 1, eventId: true } },
      { page: "product", vendor: "ga4", name: "view_item", q: { value: 1199, currency: "EGP", items: 1 } },
    ],
    atcHits: [],
  }), "EGP")!;
  const kinds = sq.issues.map(i => `${i.vendor}:${i.kind}`).sort();
  assert.ok(kinds.includes("meta:currency_mismatch"));
  assert.ok(kinds.includes("meta:value_mismatch"));
});

test("round 19 pages: checkout and landing tabs run on the new page types; landing URLs come from GA4", () => {
  assert.deepEqual(pagesForTab("Checkout"), ["checkout"]);
  assert.deepEqual(pagesForTab("Landing Pages"), ["landing"]);
  assert.deepEqual(pagesForTab("Thank You & Post-Purchase"), []);
  const l = collectorLanding({ step: null, page: null, paidLandingUrls: ["https://s.eg/a", "https://s.eg/b"] })!;
  assert.deepEqual(l.map(x => x.url), ["https://s.eg/a", "https://s.eg/b"]);
  assert.match(l[0].source, /most paid visits/);
  assert.equal(collectorLanding({ step: null, page: null }), undefined);
});
