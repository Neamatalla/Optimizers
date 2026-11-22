import assert from "node:assert/strict";
import { test } from "node:test";
import { ga4ItemFields, hitEvents } from "../../fud/collect.js";
import type { PageEvidence, PageNet, StoreEvidence, TextBlock } from "../../fud/evidence.js";
import { RULES } from "./index.js";
import { amountsIn, eventProblems, failedFiles, firstRowColumns, hitCountsById, ownErrors, sortVerdict } from "./collect.js";

// ---- builders ----
let n = 0;
const block = (text: string, y: number): TextBlock => ({ id: `b${n++}`, text, tag: "p", box: { x: 10, y, w: 300, h: 24 }, aboveFold: y < 844 });
const net = (over: Partial<PageNet> = {}): PageNet => ({ errors: [], failed: [], http: [], gtag: {}, media: [], ...over });
function pg(pageType: PageEvidence["pageType"], over: Partial<PageEvidence> = {}): PageEvidence {
  return { pageType, url: `https://shop.example.com/${pageType}`, loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, net: net(), ...over };
}
function store(pages: PageEvidence[], over: Partial<StoreEvidence> = {}): StoreEvidence {
  return { website: "https://shop.example.com", pages, addToCart: { attempted: true, ok: true, via: "click", clickAdded: true }, blockedHits: 3, durationMs: 1, ...over } as StoreEvidence;
}
const run = (id: string, e?: StoreEvidence) => RULES[id]({ evidence: e });
const status = (id: string, e?: StoreEvidence) => run(id, e).status;
const own = { msg: "x is not defined", host: "shop.example.com" };
const listing = (over: Partial<NonNullable<PageEvidence["listing"]>> = {}): PageEvidence["listing"] => ({
  cards: 8, withPrice: 8, withRating: 8, quickAdd: 0, quickAddLabels: [], hasFilter: true, hasSort: true, pills: 0,
  withImage: 8, withName: 8, withStrike: 0, withSaleText: 0, soldOutFlags: Array(8).fill(false), firstCardTop: 500, controlsTop: 400,
  cardBoxes: [{ x: 10, y: 500, w: 180 }, { x: 200, y: 500, w: 180 }, { x: 10, y: 800, w: 180 }, { x: 200, y: 800, w: 180 }] as never, sort: "featured|manual", ...over,
});

test("every rule here belongs to an active, code-decided master point and says unverified without a visit", () => {
  const ids = ["TRK-33", "PATH-02", "PATH-07", "RISK-02", "SPEED-07", "TRK-14", "TRK-18", "COL-02", "COL-03", "COL-04", "COL-05", "COL-10", "HOME-05", "TRUST-02", "OFFER-03", "OFFER-08", "OFFER-16", "SEO-05"];
  for (const id of ids) {
    assert.ok(RULES[id], id);
    assert.equal(status(id), "unverified", id);
  }
});

// ---- helpers ----
test("ownErrors keeps the store's and platform code, drops other origins", () => {
  const nt = net({ errors: [own, { msg: "Script error." }, { msg: "boom", host: "cdn.shopify.com" }, { msg: "app", host: "widget.klaviyo.com" }, { msg: "no stack" }] });
  assert.deepEqual(ownErrors(nt, "https://www.example.com").map(x => x.msg), ["x is not defined", "boom", "no stack"]);
  assert.equal(ownErrors(undefined, "https://example.com").length, 0);
});

test("failedFiles: 404/5xx/real errors are hard, a bare ERR_FAILED is vague", () => {
  const f = failedFiles(net({ failed: [{ url: "a", type: "script", status: 404 }, { url: "b", type: "image", status: 403 }, { url: "c", type: "fetch", error: "ERR_NAME_NOT_RESOLVED" }, { url: "d", type: "xhr", error: "ERR_FAILED" }, { url: "https://x.com/favicon.ico", type: "other", status: 404 }] }));
  assert.deepEqual(f.hard.map(x => x.url), ["a", "c"]);
  assert.deepEqual(f.vague.map(x => x.url), ["d"]);
});

test("amountsIn, sortVerdict, firstRowColumns, hitCountsById, ga4ItemFields", () => {
  assert.deepEqual(amountsIn("Was KD 12.500 now ١٠ د.ك"), [12.5, 10]);
  assert.equal(sortVerdict("best selling|best-selling"), "good");
  assert.equal(sortVerdict("featured|manual"), "good");
  assert.equal(sortVerdict("price, low to high|price-ascending"), "bad");
  assert.equal(sortVerdict("الأحدث|created-descending"), "bad");
  assert.equal(sortVerdict("shuffle|x"), "unknown");
  assert.equal(firstRowColumns([{ x: 10, y: 500, w: 180 }, { x: 200, y: 505, w: 180 }, { x: 10, y: 800, w: 180 }]), 2);
  assert.equal(firstRowColumns([{ x: 10, y: 500, w: 180 }, { x: 200, y: 500, w: 180 }, { x: 390, y: 500, w: 180 }]), null);
  assert.equal(firstRowColumns([]), null);
  const c = hitCountsById([{ page: "home", vendor: "meta", name: "PageView", id: "1" }, { page: "home", vendor: "meta", name: "PageView", id: "2" }, { page: "home", vendor: "meta", name: "PageView", id: "1" }]);
  assert.deepEqual(c.map(x => [x.id, x.count]), [["1", 2], ["2", 1]]);
  assert.deepEqual(ga4ItemFields("idSKU1~nmShirt~pr10~qt1"), { id: true, name: true, price: true, qty: true });
  assert.deepEqual(ga4ItemFields("id~pr10"), { id: false, name: false, price: true, qty: false });
});

test("hitEvents reads GA4 item fields from pr1…", () => {
  const url = "https://www.google-analytics.com/g/collect?v=2&tid=G-AAA&en=add_to_cart&cu=KWD&epn.value=10&pr1=idA~nmShirt~pr10~qt1&pr2=idB~pr5";
  const [h] = hitEvents(url, undefined);
  assert.equal(h.q?.items, 2);
  assert.deepEqual(h.q?.itemFields, [{ id: true, name: true, price: true, qty: true }, { id: true, name: false, price: true, qty: false }]);
});

test("eventProblems", () => {
  const full = { value: 10, currency: "KWD", items: 1, itemFields: [{ id: true, name: true, price: true, qty: true }] };
  assert.deepEqual(eventProblems(full, true), []);
  assert.deepEqual(eventProblems({ ...full, currency: "K" }, true), ["no 3-letter currency"]);
  assert.deepEqual(eventProblems({ ...full, itemFields: [{ id: true, name: false, price: true, qty: false }] }, true), ["items missing item_name, quantity"]);
  assert.deepEqual(eventProblems({ value: 1, currency: "KWD", items: 1 }, true), ["?"]);
  assert.deepEqual(eventProblems(undefined, false), ["no value, currency or products"]);
});

// ---- TRK-33 ----
const view = { page: "product", vendor: "ga4", name: "view_item" };
test("TRK-33: clean, error with events intact, error with view_item missing, unverified without tracking", () => {
  assert.equal(status("TRK-33", store([pg("product"), pg("cart")])), "pass");
  const withErr = (extra: Partial<StoreEvidence>) => store([pg("product", { net: net({ errors: [own] }) }), pg("cart")], extra);
  const ok = withErr({ pageHits: [{ page: "product", vendor: "ga4", name: "page_view" }, view], atcEvents: { dataLayer: [], ga4: ["add_to_cart"], pixels: [] } });
  assert.equal(status("TRK-33", ok), "pass");
  const noView = withErr({ pageHits: [{ page: "product", vendor: "ga4", name: "page_view" }] });
  const r = run("TRK-33", noView);
  assert.equal(r.status, "fail");
  assert.match(r.reason, /ga4 sent no view_item/);
  assert.equal(status("TRK-33", withErr({})), "unverified");
  assert.equal(status("TRK-33", withErr({ pageHits: [view], atcEvents: { dataLayer: [], ga4: [], pixels: [] } })), "unverified", "a late add_to_cart is not proof");
  assert.equal(status("TRK-33", withErr({ pageHits: [view], addToCart: { attempted: true, ok: true, via: "api", clickAdded: false } })), "unverified");
  assert.equal(status("TRK-33", store([pg("home")])), "unverified", "no product page");
  assert.equal(status("TRK-33", store([pg("product", { net: undefined })])), "unverified");
  assert.equal(status("TRK-33", store([pg("product", { net: net({ errors: [{ msg: "Script error." }, { msg: "t", host: "x.klaviyo.com" }] }) })])), "pass", "third-party errors ignored");
});

// ---- PATH-02 ----
test("PATH-02: pass, fail on an own error, unverified for drawer cart or login checkout", () => {
  const cartPg = (over: Partial<PageEvidence> = {}) => pg("cart", { cart: { source: "page", empty: false }, ...over });
  assert.equal(status("PATH-02", store([cartPg(), pg("checkout")])), "pass");
  const bad = run("PATH-02", store([cartPg({ net: net({ errors: [own] }) }), pg("checkout")]));
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /cart page/);
  assert.equal(status("PATH-02", store([cartPg(), pg("checkout", { net: net({ errors: [own] }) })])), "fail");
  assert.equal(status("PATH-02", store([pg("cart", { cart: { source: "drawer", empty: false } }), pg("checkout")])), "unverified");
  assert.equal(status("PATH-02", store([cartPg(), pg("checkout", { note: "the store sent us to a log-in page before checkout" })])), "unverified");
  assert.equal(status("PATH-02", store([cartPg({ cart: { source: "page", empty: true } }), pg("checkout")])), "unverified");
  assert.equal(status("PATH-02", store([cartPg()])), "unverified", "checkout didn't load");
});

// ---- PATH-07 ----
test("PATH-07: pass, fail on 404, vague errors and gaps stay unverified", () => {
  const pages = (over: Record<string, Partial<PageEvidence>> = {}) => ["home", "collection", "product", "cart"].map(t => pg(t as never, over[t] ?? {}));
  assert.equal(status("PATH-07", store(pages())), "pass");
  const r = run("PATH-07", store(pages({ product: { net: net({ failed: [{ url: "https://app.x/a.js", type: "script", status: 404 }] }) } })));
  assert.equal(r.status, "fail");
  assert.match(r.reason, /404 https:\/\/app\.x\/a\.js/);
  assert.equal(status("PATH-07", store(pages({ home: { net: net({ failed: [{ url: "u", type: "xhr", error: "ERR_FAILED" }] }) } }))), "unverified");
  assert.equal(status("PATH-07", store(pages().slice(0, 3))), "unverified", "cart missing");
  assert.equal(status("PATH-07", store([...pages().slice(0, 3), pg("cart", { cart: { source: "drawer", empty: false }, net: undefined })])), "pass", "drawer covered by the product log");
});

// ---- RISK-02 ----
test("RISK-02: pass, fail on http page or http file, unverified when checkout is behind login", () => {
  const all = (over: Record<string, Partial<PageEvidence>> = {}) => ["home", "product", "cart", "checkout"].map(t => pg(t as never, over[t] ?? {}));
  assert.equal(status("RISK-02", store(all())), "pass");
  assert.equal(status("RISK-02", store(all({ home: { url: "http://shop.example.com/" } }))), "fail");
  const mixed = run("RISK-02", store(all({ product: { net: net({ http: ["image http://cdn.x/a.jpg"] }) } })));
  assert.equal(mixed.status, "fail");
  assert.match(mixed.reason, /http:\/\/cdn\.x\/a\.jpg/);
  assert.equal(status("RISK-02", store(all({ product: { net: net({ http: ["document http://shop.example.com/p"] }) } }))), "pass", "an http document hop is not mixed content");
  assert.equal(status("RISK-02", store(all({ checkout: { note: "sent us to a log-in page" } }))), "unverified");
  assert.equal(status("RISK-02", store([pg("home", { loaded: false })])), "unverified");
});

// ---- SPEED-07 ----
test("SPEED-07: none in the fold passes; big autoplay fails; unknown size is unverified", () => {
  const vid = (over = {}) => ({ autoplay: true, muted: true, src: "https://cdn.x/hero.mp4", y: 0, w: 390, h: 300, ...over });
  assert.equal(status("SPEED-07", store([pg("home")])), "pass");
  assert.equal(status("SPEED-07", store([pg("home", { videos: [vid({ y: 1200 })] })])), "pass", "below the first screen");
  assert.equal(status("SPEED-07", store([pg("home", { videos: [vid({ autoplay: false })] })])), "pass");
  const big = store([pg("home", { videos: [vid()], net: net({ media: [{ url: "https://cdn.x/hero.mp4", status: 206, bytes: 5 * 1024 * 1024 }] }) })]);
  assert.equal(status("SPEED-07", big), "fail");
  const small = store([pg("home", { videos: [vid()], net: net({ media: [{ url: "https://cdn.x/hero.mp4", status: 200, bytes: 300_000 }] }) })]);
  assert.equal(status("SPEED-07", small), "pass");
  assert.equal(status("SPEED-07", store([pg("home", { videos: [vid()] })])), "unverified");
  assert.equal(status("SPEED-07", store([pg("home", { net: undefined })])), "unverified");
  assert.equal(status("SPEED-07", store([])), "unverified");
});

// ---- TRK-14 ----
test("TRK-14: once each passes; per-ID doubles and double gtag loads fail; missing data is unverified", () => {
  const pv = (page: string, vendor: string, id: string) => ({ page, vendor, name: vendor === "ga4" ? "page_view" : "PageView", id });
  const atc = [{ vendor: "ga4", name: "add_to_cart", id: "G-1" }, { vendor: "meta", name: "AddToCart", id: "1" }];
  const base = store([pg("home")], { pageHits: [pv("home", "ga4", "G-1"), pv("home", "meta", "1"), pv("home", "meta", "2")], atcHits: atc });
  assert.equal(status("TRK-14", base), "pass", "two Meta IDs are not a double");
  const dbl = run("TRK-14", store([pg("home")], { pageHits: [pv("home", "meta", "1"), pv("home", "meta", "1")], atcHits: atc }));
  assert.equal(dbl.status, "fail");
  assert.match(dbl.reason, /meta 1 sent PageView 2 times/);
  assert.equal(status("TRK-14", store([pg("home", { net: net({ gtag: { "G-1": 2 } }) })], { pageHits: [pv("home", "ga4", "G-1")], atcHits: atc })), "fail");
  assert.equal(status("TRK-14", store([pg("home")], { pageHits: [pv("home", "ga4", "G-1")], atcHits: [...atc, atc[0]] })), "fail");
  assert.equal(status("TRK-14", store([pg("home")], { pageHits: [] })), "unverified");
  assert.equal(status("TRK-14", store([pg("home")], { pageHits: [pv("home", "ga4", "G-1")], addToCart: { attempted: true, ok: true, via: "api", clickAdded: false } })), "unverified");
  assert.equal(status("TRK-14", store([pg("home")], { pageHits: [pv("home", "ga4", "G-1")], atcHits: [] })), "unverified");
});

// ---- TRK-18 ----
test("TRK-18: full fields pass; a missing currency or item field fails; absent events are unverified", () => {
  const f = { id: true, name: true, price: true, qty: true };
  const good = { value: 10, currency: "KWD", items: 1, itemFields: [f] };
  const ok = store([pg("product")], { pageHits: [{ ...view, q: good }], atcHits: [{ vendor: "ga4", name: "add_to_cart", q: good }] });
  assert.equal(status("TRK-18", ok), "pass");
  const noCur = store([pg("product")], { pageHits: [{ ...view, q: { ...good, currency: undefined } }], atcHits: [{ vendor: "ga4", name: "add_to_cart", q: good }] });
  assert.match(run("TRK-18", noCur).reason, /no 3-letter currency/);
  assert.equal(status("TRK-18", noCur), "fail");
  const noName = store([pg("product")], { pageHits: [{ ...view, q: good }], atcHits: [{ vendor: "ga4", name: "add_to_cart", q: { ...good, itemFields: [{ ...f, name: false }] } }] });
  assert.match(run("TRK-18", noName).reason, /item_name/);
  const dlBad = store([pg("product")], { pageHits: [{ ...view, q: good }], atcHits: [{ vendor: "ga4", name: "add_to_cart", q: good }], dlPushes: { view: [{ event: "view_item", value: 5, items: [] }] } });
  assert.equal(status("TRK-18", dlBad), "fail");
  assert.equal(status("TRK-18", store([pg("product")], { pageHits: [{ ...view, q: good }] })), "unverified", "no add_to_cart yet");
  assert.equal(status("TRK-18", store([pg("product")], { pageHits: [{ ...view, q: good }], addToCart: { attempted: true, ok: true, via: "api", clickAdded: false } })), "unverified");
  assert.equal(status("TRK-18", store([pg("product")], { pageHits: [] })), "unverified");
  const old = store([pg("product")], { pageHits: [{ ...view, q: { ...good, itemFields: undefined } }], atcHits: [{ vendor: "ga4", name: "add_to_cart", q: { ...good, itemFields: undefined } }] });
  assert.equal(status("TRK-18", old), "unverified", "item fields not recorded");
  const meta = store([pg("product")], { pageHits: [{ page: "product", vendor: "meta", name: "ViewContent", q: { value: 3, currency: "KWD", items: 1 } }], atcHits: [{ vendor: "meta", name: "AddToCart", q: { value: 3, currency: "KWD", items: 1 } }] });
  assert.equal(status("TRK-18", meta), "pass", "Meta has no item name to check");
});

// ---- collection ----
const coll = (l: PageEvidence["listing"], over: Partial<PageEvidence> = {}) => store([pg("collection", { listing: l, ...over })]);

test("COL-02: sold-out last passes, sold-out first fails, none is n/a", () => {
  assert.equal(status("COL-02", coll(listing({ soldOutFlags: [false, false, false, true, true] }))), "pass");
  const bad = run("COL-02", coll(listing({ soldOutFlags: [false, true, false, false] })));
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /card 2 of 4/);
  assert.equal(status("COL-02", coll(listing())), "n/a");
  assert.equal(status("COL-02", coll(listing({ soldOutFlags: undefined }))), "unverified");
  assert.equal(status("COL-02", coll(undefined)), "unverified");
});

test("COL-03: controls and a good default pass; no controls or a bad default fail; unreadable sort is unverified", () => {
  assert.equal(status("COL-03", coll(listing())), "pass");
  assert.equal(status("COL-03", coll(listing({ hasFilter: false, hasSort: false, controlsTop: undefined }))), "fail");
  assert.equal(status("COL-03", coll(listing({ hasFilter: false, hasSort: false, controlsTop: undefined, pills: 4 }))), "pass");
  assert.equal(status("COL-03", coll(listing({ controlsTop: 1500, pills: 0 }))), "fail", "controls below the grid");
  assert.equal(status("COL-03", coll(listing({ sort: "price, low to high|price-ascending" }))), "fail");
  assert.equal(status("COL-03", coll(listing({ sort: undefined }))), "unverified");
  assert.equal(status("COL-03", coll(listing({ sort: "shuffle|x" }))), "unverified");
  assert.equal(status("COL-03", store([pg("collection", { loaded: false })])), "unverified");
});

test("COL-04: first row inside the first screen passes, below it fails", () => {
  assert.equal(status("COL-04", coll(listing({ firstCardTop: 600 }))), "pass");
  const bad = run("COL-04", coll(listing({ firstCardTop: 1100 })));
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /1100px/);
  assert.equal(status("COL-04", coll(listing({ firstCardTop: undefined }))), "unverified");
});

test("COL-05: every card with image, name and price passes; gaps fail; old evidence is unverified", () => {
  assert.equal(status("COL-05", coll(listing())), "pass");
  const bad = run("COL-05", coll(listing({ withImage: 6, withPrice: 7 })));
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /2 without an image, 1 without a price/);
  assert.equal(status("COL-05", coll(listing({ withImage: undefined }))), "unverified");
});

test("COL-10: two columns pass, one or three fail, a carousel or one card is unverified", () => {
  assert.equal(status("COL-10", coll(listing())), "pass");
  assert.equal(status("COL-10", coll(listing({ cardBoxes: [{ x: 10, y: 500, w: 370, h: 300 }, { x: 10, y: 900, w: 370, h: 300 }] }))), "fail");
  assert.equal(status("COL-10", coll(listing({ cardBoxes: [{ x: 0, y: 500, w: 130, h: 1 }, { x: 130, y: 500, w: 130, h: 1 }, { x: 260, y: 500, w: 130, h: 1 }] }))), "fail");
  assert.equal(status("COL-10", coll(listing({ cardBoxes: [{ x: 10, y: 500, w: 200, h: 1 }, { x: 220, y: 500, w: 200, h: 1 }] }))), "unverified", "runs past the screen");
  assert.equal(status("COL-10", coll(listing({ cardBoxes: [{ x: 10, y: 500, w: 200, h: 1 }] }))), "unverified");
});

// ---- HOME-05 ----
test("HOME-05: a grid inside two screens with full cards passes; low grid or thin cards fail; no grid is unverified", () => {
  const home = (l: PageEvidence["listing"], over: Partial<PageEvidence> = {}) => store([pg("home", { listing: l, ...over })]);
  assert.equal(status("HOME-05", home(listing({ firstCardTop: 900 }))), "pass");
  assert.equal(status("HOME-05", home(listing({ firstCardTop: 2000 }))), "fail");
  assert.equal(status("HOME-05", home(listing({ firstCardTop: 900, withName: 4 }))), "fail");
  assert.equal(status("HOME-05", home(listing({ firstCardTop: 900, withRating: 0 }), { jsonLd: { types: [], ratingValue: 4.5 } })), "fail", "store has reviews, no card shows one");
  assert.equal(status("HOME-05", home(listing({ firstCardTop: 900, withRating: 0 }))), "pass", "no reviews on the store");
  assert.equal(status("HOME-05", home(undefined)), "unverified");
});

// ---- TRUST-02 ----
test("TRUST-02: rating link near the title and half the cards passes; gaps fail; no reviews is n/a", () => {
  const prod = (over: Partial<PageEvidence> = {}) => pg("product", {
    jsonLd: { types: ["Product"], ratingValue: 4.6, reviewCount: 12 }, facts: { h1: ["Rose Oud"] } as never,
    blocks: [block("Rose Oud", 300)], reviewAnchor: { text: "4.6 (12 reviews)", y: 340, href: "#reviews" }, ...over,
  });
  const st = (p: PageEvidence, l = listing()) => store([p, pg("collection", { listing: l })]);
  assert.equal(status("TRUST-02", st(prod())), "pass");
  assert.equal(status("TRUST-02", st(prod({ reviewAnchor: null }))), "fail");
  assert.equal(status("TRUST-02", st(prod({ reviewAnchor: { text: "4.6 (12)", y: 1500, href: "#r" } }))), "fail", "far from the title");
  assert.equal(status("TRUST-02", st(prod({ reviewAnchor: { text: "reviews", y: 340, href: "#reviews" } }))), "fail", "no number");
  assert.equal(status("TRUST-02", st(prod(), listing({ withRating: 2 }))), "fail");
  assert.equal(status("TRUST-02", store([prod()])), "unverified", "no collection grid");
  assert.equal(status("TRUST-02", st(prod({ reviewAnchor: undefined }))), "unverified");
  assert.equal(status("TRUST-02", st(prod({ jsonLd: { types: ["Product"] } }))), "n/a");
  assert.equal(status("TRUST-02", store([])), "unverified");
});

// ---- offers ----
const cta = { text: "Add to cart", box: { x: 10, y: 700, w: 300, h: 50 }, disabled: false, nearbyBlockIds: [] };
const sale = [{ text: "KD 12.000", y: 650 }];

test("OFFER-03: matching cart price passes; different price or lost old price fails; no prices or bot add is unverified", () => {
  const prod = (over: Partial<PageEvidence> = {}) => pg("product", { jsonLd: { types: ["Product"], price: 10, priceCurrency: "KWD" }, cta, ...over });
  const cart = (over: Partial<PageEvidence> = {}) => pg("cart", { cart: { source: "page", empty: false }, blocks: [block("Rose Oud KD 10.000", 100), block("Total KD 10.000", 200)], ...over });
  assert.equal(status("OFFER-03", store([prod(), cart()])), "pass");
  const diff = run("OFFER-03", store([prod(), cart({ blocks: [block("Rose Oud KD 12.000", 100)] })]));
  assert.equal(diff.status, "fail");
  assert.match(diff.reason, /12/);
  assert.equal(status("OFFER-03", store([prod(), cart({ blocks: [block("Rose Oud 10.000 SAR", 100)] })])), "fail", "currency differs");
  assert.equal(status("OFFER-03", store([prod({ struck: sale }), cart()])), "fail", "old price dropped");
  assert.equal(status("OFFER-03", store([prod({ struck: sale }), cart({ struck: [{ text: "KD 12.000", y: 100 }] })])), "pass");
  assert.equal(status("OFFER-03", store([prod(), cart({ blocks: [block("Your cart", 100)] })])), "unverified");
  assert.equal(status("OFFER-03", store([prod({ jsonLd: { types: ["Product"] } }), cart()])), "unverified", "page price unknown");
  assert.equal(status("OFFER-03", store([prod(), cart()], { addToCart: { attempted: true, ok: true, via: "api", clickAdded: false } })), "unverified");
  assert.equal(status("OFFER-03", store([prod(), cart({ cart: { source: "page", empty: true } })])), "unverified");
});

test("OFFER-08: sale with a saving passes; old price without a saving fails; no sale is n/a; sale words without a strike are unverified", () => {
  const prod = (over: Partial<PageEvidence> = {}) => pg("product", { cta, ...over });
  const col = (l: Partial<NonNullable<PageEvidence["listing"]>>) => pg("collection", { listing: listing(l) });
  assert.equal(status("OFFER-08", store([prod(), col({})])), "n/a");
  assert.equal(status("OFFER-08", store([prod({ struck: sale, blocks: [block("Save 20% today", 720)] }), col({ withStrike: 3, withSaleText: 3 })])), "pass");
  const bad = run("OFFER-08", store([prod({ struck: sale, blocks: [block("KD 10.000", 720)] }), col({ withStrike: 3 })]));
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /states no saving/);
  assert.equal(status("OFFER-08", store([prod({ struck: sale, blocks: [block("Save 20% today", 720)] }), col({ withSaleText: 3 })])), "unverified");
  assert.equal(status("OFFER-08", store([prod(), col({ withStrike: 2, withSaleText: 2 })])), "pass", "cards show old and new price, product not on sale");
  assert.equal(status("OFFER-08", store([prod({ struck: [{ text: "KD 3", y: 3000 }] }), col({})])), "n/a", "a struck price far from the buy button belongs to another product");
  assert.equal(status("OFFER-08", store([pg("product", { loaded: false }), pg("collection", { loaded: false })])), "unverified");
  assert.equal(status("OFFER-08", store([prod({ struck: sale, blocks: [block("وفر 20%", 720)] }), col({ withStrike: 1 })])), "pass");
});

test("OFFER-16: saving line or struck price passes; sale without either fails on a cart page; drawer is unverified; no discount is n/a", () => {
  const prod = (over: Partial<PageEvidence> = {}) => pg("product", { cta, ...over });
  const cart = (over: Partial<PageEvidence> = {}) => pg("cart", { cart: { source: "page", empty: false }, blocks: [block("Total KD 10.000", 100)], ...over });
  assert.equal(status("OFFER-16", store([prod({ struck: sale }), cart({ blocks: [block("You saved KD 2.000", 100)] })])), "pass");
  assert.equal(status("OFFER-16", store([prod({ struck: sale }), cart({ struck: [{ text: "KD 12", y: 90 }] })])), "pass");
  assert.equal(status("OFFER-16", store([prod({ struck: sale }), cart()])), "fail");
  assert.equal(status("OFFER-16", store([prod({ struck: sale }), cart({ cart: { source: "drawer", empty: false } })])), "unverified");
  assert.equal(status("OFFER-16", store([prod(), cart()])), "n/a");
  assert.equal(status("OFFER-16", store([prod(), cart({ cart: { source: "page", empty: true } })])), "unverified");
  assert.equal(status("OFFER-16", store([prod(), cart()], { addToCart: { attempted: true, ok: false, clickAdded: false } })), "unverified");
});

// ---- SEO-05 ----
test("SEO-05: Offer with price and availability passes; missing parts fail; unrecorded offers are unverified", () => {
  const prod = (jsonLd: PageEvidence["jsonLd"]) => store([pg("product", { jsonLd })]);
  assert.equal(status("SEO-05", prod({ types: ["Product"], offer: true, price: 10, priceCurrency: "KWD", availability: "InStock" })), "pass");
  assert.equal(status("SEO-05", prod({ types: ["Product"], offer: true, availability: "InStock" })), "fail", "no price");
  assert.equal(status("SEO-05", prod({ types: ["Product"], offer: true, price: 10 })), "fail", "no availability");
  assert.equal(status("SEO-05", prod({ types: ["Product"], offer: false })), "fail", "no offer");
  assert.equal(status("SEO-05", prod({ types: ["Organization"], offer: false })), "fail", "no Product");
  assert.equal(status("SEO-05", prod({ types: ["Product"] })), "unverified", "older evidence");
  assert.equal(status("SEO-05", store([pg("product", { loaded: false })])), "unverified");
});
