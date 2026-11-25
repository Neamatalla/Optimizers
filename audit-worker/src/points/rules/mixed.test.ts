import assert from "node:assert/strict";
import { test } from "node:test";
import type { PageEvidence, PageFacts, StoreEvidence, TextBlock } from "../../fud/evidence.js";
import type { Ga4Facts } from "../../types.js";
import { pointById } from "../index.js";
import { RULES } from "./index.js";
import { MIXED_RULES } from "./mixed.js";

// ---- builders ----
let n = 0;
const block = (text: string, y: number, tag = "p"): TextBlock => ({ id: `b${n++}`, text, tag, box: { x: 10, y, w: 300, h: 24 }, aboveFold: y < 844 });
function pg(pageType: PageEvidence["pageType"], over: Partial<PageEvidence> = {}): PageEvidence {
  return { pageType, url: `https://shop.example.com/${pageType}`, loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, ...over };
}
// A main button at y with the given text blocks right next to it.
function withCta(type: PageEvidence["pageType"], text: string, y: number, near: TextBlock[], over: Partial<PageEvidence> = {}): PageEvidence {
  return pg(type, { blocks: near, cta: { text, box: { x: 10, y, w: 370, h: 48 }, disabled: false, nearbyBlockIds: near.map(b => b.id) }, ...over });
}
function store(pages: PageEvidence[], over: Partial<StoreEvidence> = {}): StoreEvidence {
  return { website: "https://shop.example.com", pages, addToCart: { attempted: true, ok: true, via: "click", clickAdded: true }, blockedHits: 3, durationMs: 1, ...over } as StoreEvidence;
}
const facts = (over: Partial<PageFacts> = {}): PageFacts => ({
  lang: "en", dir: "ltr", hreflang: [], langSwitch: false, h1: [], h1Count: 1, nav: [], search: { present: true, visible: true, action: "", param: "" },
  media: { images: 4, video: false, zoom: false }, infoSections: { details: 0, expanders: 0 }, heroButtons: [], hero: null, capture: { email: false, phone: false, account: false }, ...over,
});
const cart = (over: Partial<PageEvidence> = {}) => pg("cart", { cart: { source: "page", empty: false }, ...over });
const run = (id: string, e?: StoreEvidence, ga4?: Ga4Facts) => RULES[id]({ evidence: e, ga4 });
const status = (id: string, e?: StoreEvidence) => run(id, e).status;

test("every mixed rule belongs to an active code+ai point and says unverified without a visit", () => {
  for (const id of Object.keys(MIXED_RULES)) {
    const p = pointById(id);
    assert.ok(p && p.status === "active" && p.decidedBy === "code+ai", id);
    assert.equal(status(id), "unverified", id);
  }
});

test("a missing match never fails a pass-only rule", () => {
  const e = store([withCta("product", "Add to cart", 900, [block("Lovely honey", 950)]), withCta("cart", "Checkout", 600, [block("Total 100 SAR", 560)], { cart: { source: "page", empty: false } }), withCta("landing", "Buy now", 900, [block("Story", 950)]), pg("home", { blocks: [block("Welcome", 100)] })]);
  for (const id of ["TRUST-04", "TRUST-05", "TRUST-06", "TRUST-11", "TRUST-12", "OFFER-01", "OFFER-05", "OFFER-07", "OFFER-09", "OFFER-20", "OFFER-22", "OFFER-24", "LAND-07"]) {
    assert.equal(status(id, e), "unverified", id);
  }
});

test("PATH-01: a real tap that fills the cart passes; our API fallback stays unverified", () => {
  assert.equal(status("PATH-01", store([cart()])), "pass");
  assert.equal(status("PATH-01", store([cart()], { addToCart: { attempted: true, ok: true, via: "api", clickAdded: false } })), "unverified");
  assert.equal(status("PATH-01", store([cart({ cart: { source: "page", empty: true } })])), "unverified");
});

test("PATH-04: checkout wording on the first screen, nothing floating over it", () => {
  const ok = withCta("cart", "Checkout", 600, [], { cart: { source: "page", empty: false }, facts: facts({ floaters: [] }) });
  assert.equal(status("PATH-04", store([ok])), "pass");
  const covered = withCta("cart", "Checkout", 600, [], { cart: { source: "page", empty: false }, facts: facts({ floaters: [{ kind: "chat", box: { x: 300, y: 610, w: 60, h: 60 } }] }) });
  assert.equal(status("PATH-04", store([covered])), "unverified");
  const low = withCta("cart", "Checkout", 1200, [], { cart: { source: "page", empty: false }, facts: facts({ floaters: [] }) });
  assert.equal(status("PATH-04", store([low])), "unverified");
});

test("PATH-05: a readable form passes; a log-in page goes to the AI", () => {
  const input = { type: "tel", inputmode: "", autocomplete: "tel", name: "phone", label: "Phone", w: 300, h: 48, fs: 16, inHeader: false };
  assert.equal(status("PATH-05", store([pg("checkout", { facts: facts({ inputs: [input, { ...input, type: "text", name: "name" }] }) })])), "pass");
  assert.equal(status("PATH-05", store([pg("checkout", { note: "log-in page" })])), "unverified");
  assert.equal(status("PATH-05", store([pg("checkout", { facts: facts({ inputs: [input, { ...input, type: "password" }] }) })])), "unverified");
});

test("PDP-04 / PDP-13: no options at all is not applicable", () => {
  const none = pg("product", { variants: { hasSize: false, control: "none", groups: [] }, facts: facts({ swatches: [] }) });
  assert.equal(status("PDP-04", store([none])), "n/a");
  assert.equal(status("PDP-13", store([none])), "n/a");
  const sizes = pg("product", { variants: { hasSize: true, control: "pills", groups: ["Size"] }, facts: facts({ swatches: [] }) });
  assert.equal(status("PDP-13", store([sizes])), "unverified");
});

test("NAV-08: no Arabic anywhere is n/a; Arabic laid out left-to-right fails", () => {
  assert.equal(status("NAV-08", store([pg("home", { facts: facts() })])), "n/a");
  assert.equal(status("NAV-08", store([pg("home", { facts: facts({ langSwitch: true }) })])), "unverified");
  assert.equal(status("NAV-08", store([pg("home", { facts: facts({ lang: "ar", dir: "ltr" }) })])), "fail");
  assert.equal(status("NAV-08", store([pg("home", { facts: facts({ lang: "ar-SA", dir: "rtl" }) })])), "unverified");
});

test("TRUST-01: fails only with no link, no page and no mention at all", () => {
  const bare = store([pg("home"), pg("product")], { policies: [] });
  assert.equal(status("TRUST-01", bare), "fail");
  assert.equal(status("TRUST-01", store([pg("home"), pg("product", { blocks: [block("Free returns", 900)] })], { policies: [] })), "unverified");
  assert.equal(status("TRUST-01", store([pg("home"), pg("product")])), "unverified");
});

test("TRUST-05 / OFFER-24: a guarantee line by the button passes", () => {
  const p = withCta("product", "Add to cart", 700, [block("30-day money-back guarantee", 760)]);
  assert.equal(status("TRUST-05", store([p])), "pass");
  assert.equal(status("OFFER-24", store([p])), "pass");
});

test("TRUST-06: two different trust signals near the cart button", () => {
  const c = withCta("cart", "Checkout", 600, [block("Free delivery within 2 days", 560), block("Secure checkout", 660)], { cart: { source: "page", empty: false } });
  assert.equal(status("TRUST-06", store([c])), "pass");
});

test("TRUST-08: phone link plus a contact page passes", () => {
  const h = pg("home", { facts: facts({ contactLinks: ["https://wa.me/966500000000"] }), policyLinks: [{ kind: "contact", text: "Contact", href: "/contact" }] });
  assert.equal(status("TRUST-08", store([h])), "pass");
  assert.equal(status("TRUST-08", store([pg("home", { facts: facts({ contactLinks: ["https://wa.me/966500000000"] }) })])), "unverified");
});

test("OFFER-01: free shipping or a shipping price passes; delivery days alone don't", () => {
  assert.equal(status("OFFER-01", store([pg("product", { blocks: [block("Free shipping over 200 SAR", 100)] })])), "pass");
  assert.equal(status("OFFER-01", store([pg("product", { blocks: [block("Shipping: 25 SAR", 100)] })])), "pass");
  assert.equal(status("OFFER-01", store([pg("product", { blocks: [block("Shipping in 3 days", 100)] })])), "unverified");
});

test("OFFER-05: a delivery time near the button passes; a returns window doesn't", () => {
  assert.equal(status("OFFER-05", store([withCta("product", "Add to cart", 700, [block("Delivery in 2-3 business days", 780)])])), "pass");
  assert.equal(status("OFFER-05", store([withCta("product", "Add to cart", 700, [block("التوصيل خلال 3 أيام", 780)])])), "pass");
  assert.equal(status("OFFER-05", store([withCta("product", "Add to cart", 700, [block("Free shipping and returns within 14 days", 780)])])), "unverified");
});

test("OFFER-07: needs a local method and a secure line by both buttons", () => {
  const p = withCta("product", "Add to cart", 700, [block("mada", 760, "img"), block("Secure payment", 790)]);
  const c = withCta("cart", "Checkout", 600, [block("Tabby", 560, "img"), block("Secure checkout", 660)], { cart: { source: "page", empty: false } });
  assert.equal(status("OFFER-07", store([p, c])), "pass");
  const c2 = withCta("cart", "Checkout", 600, [block("Tabby", 560, "img")], { cart: { source: "page", empty: false } });
  assert.equal(status("OFFER-07", store([p, c2])), "unverified");
});

test("OFFER-09: an amount-left line in the cart passes", () => {
  assert.equal(status("OFFER-09", store([cart({ blocks: [block("Add 50 SAR more for free shipping", 200)] })])), "pass");
  assert.equal(status("OFFER-09", store([cart({ blocks: [block("أضف 50 ر.س للحصول على شحن مجاني", 200)] })])), "pass");
});

test("OFFER-17: an open code field fails, a link alone passes", () => {
  const field = { type: "text", inputmode: "", autocomplete: "", name: "discount", label: "Discount code", w: 300, h: 44, fs: 16, inHeader: false };
  assert.equal(status("OFFER-17", store([cart({ facts: facts({ inputs: [field] }) })])), "fail");
  assert.equal(status("OFFER-17", store([cart({ facts: facts({ inputs: [] }), blocks: [block("Have a discount code?", 300)] })])), "pass");
  assert.equal(status("OFFER-17", store([cart({ facts: facts({ inputs: [] }) })])), "unverified");
});

test("LAND-03 / LAND-09: menu on the landing page fails; generic button labels fail", () => {
  assert.equal(status("LAND-03", store([pg("landing", { facts: facts({ menuLinks: 8 }) })])), "fail");
  assert.equal(status("LAND-03", store([pg("landing", { facts: facts({ menuLinks: 0 }) })])), "unverified");
  assert.equal(status("LAND-09", store([withCta("landing", "Submit", 700, [], { facts: facts() })])), "fail");
  assert.equal(status("LAND-09", store([withCta("landing", "Order now", 700, [], { facts: facts({ heroButtons: ["Shop now"] }) })])), "pass");
});

test("SEO-06 / TRK-44: one shown price that matches passes; a lower-case currency fails", () => {
  const p = pg("product", { blocks: [block("SAR 120", 300)], jsonLd: { types: ["Product"], price: 120, offer: true } });
  assert.equal(status("SEO-06", store([p])), "pass");
  assert.equal(status("SEO-06", store([pg("product", { blocks: [block("SAR 120", 300), block("SAR 150", 320)], jsonLd: { types: ["Product"], price: 120 } })])), "unverified");
  const sent = { dlPushes: { view: [{ event: "view_item", value: 120, currency: "SAR" }], atc: [{ event: "add_to_cart", value: 120, currency: "SAR" }] } };
  assert.equal(status("TRK-44", store([p], sent)), "pass");
  assert.equal(status("TRK-44", store([p], { dlPushes: { view: [{ event: "view_item", value: 120, currency: "sar" }] } })), "fail");
  assert.equal(status("TRK-44", store([p], { dlPushes: { view: [{ event: "view_item", value: 99, currency: "SAR" }] } })), "unverified");
});

test("TRK-26: only dev-looking hosts fail", () => {
  const ga4 = (status: "pass" | "fail", en: string) => ({ facts: { "GA4-P05": { id: "GA4-P05", status, en } } }) as unknown as Ga4Facts;
  assert.equal(run("TRK-26", undefined, ga4("fail", "store-staging.myshopify.com (50 visits) send data into this property besides shop.com: 1% of visits in 28 days.")).status, "fail");
  assert.equal(run("TRK-26", undefined, ga4("fail", "translate.goog (40 visits) send data into this property besides shop.com: 1% of visits in 28 days.")).status, "pass");
  assert.equal(run("TRK-26", undefined, ga4("pass", "Every hostname is the store's own.")).status, "pass");
});

// ---- second batch (24 Nov evening) ----
test("RISK-01: a clear email in GA4 page paths fails; a clean scan stays open", () => {
  const ga4 = (status: "pass" | "fail", en: string) => ({ facts: { "GA4-24": { id: "GA4-24", status, en } } }) as unknown as Ga4Facts;
  assert.equal(run("RISK-01", undefined, ga4("fail", "Personal data appears in page paths sent to GA4, e.g. /thanks?email=…@….")).status, "fail");
  assert.equal(run("RISK-01", undefined, ga4("fail", "Personal data appears in page paths sent to GA4, e.g. /x?phone=….")).status, "unverified");
  assert.equal(run("RISK-01", undefined, ga4("pass", "No email or phone found.")).status, "unverified");
});

test("TRK-15 / SPEED-08 read the GTM container", () => {
  const all = ["2147479553"];
  const gtm = (tags: object[]) => ({ liveVersion: { tags, triggers: [] } });
  const ga = { name: "GA4", type: "googtag", firingTriggerId: all };
  const none = RULES["TRK-15"]({ gtm: gtm([ga]) });
  assert.equal(none.status, "unverified");
  assert.equal(none.facts?.final, true, "no consent setup: the AI isn't asked");
  const cmp = RULES["TRK-15"]({ gtm: gtm([ga, { name: "Cookiebot CMP", type: "cvt_123", firingTriggerId: all }]) });
  assert.notEqual(cmp.facts?.final, true, "a consent setup goes to the AI");
  assert.equal(RULES["SPEED-08"]({ gtm: gtm([ga]) }).status, "pass");
  assert.equal(RULES["SPEED-08"]({ gtm: gtm([ga, { name: "Hotjar", type: "html", firingTriggerId: all, parameter: [{ key: "html", value: "<script src=hotjar></script>" }] }]) }).status, "unverified");
});

test("HOME-09 / OFFER-10: top bar with free shipping, same amount in the cart", () => {
  const bar = block("Free shipping over 200 SAR", 10);
  const e = store([pg("home", { blocks: [bar] }), pg("product", { blocks: [block("Free shipping over 200 SAR", 10)] }), cart({ blocks: [block("Free shipping on orders over 200 SAR", 300)] })]);
  assert.equal(status("HOME-09", e), "pass");
  assert.equal(status("OFFER-10", e), "pass");
  const off = store([pg("home", { blocks: [bar] }), cart({ blocks: [block("Free shipping over 300 SAR", 300)] })]);
  assert.equal(status("OFFER-10", off), "fail");
  const cur = store([pg("home", { blocks: [bar] }), cart({ blocks: [block("Free shipping over 50 KWD", 300)] })]);
  assert.equal(status("OFFER-10", cur), "unverified");
});

test("NAV-12: switch in the header and one currency passes; two currencies fail", () => {
  const home = pg("home", { facts: facts({ langAt: "header" }) });
  const one = store([home, pg("product", { blocks: [block("SAR 120", 300)] }), cart({ blocks: [block("SAR 120", 300)] }), pg("collection", { blocks: [block("SAR 90", 300)] })]);
  assert.equal(status("NAV-12", one), "pass");
  const two = store([home, pg("product", { blocks: [block("SAR 120", 300)] }), cart({ blocks: [block("AED 120", 300)] }), pg("collection", { blocks: [block("SAR 90", 300)] })]);
  assert.equal(status("NAV-12", two), "fail");
});

test("RISK-11: small body text fails, 16px with good contrast passes", () => {
  const body = (fs: number, fg = "rgb(20, 20, 20)") => facts({ bodyText: { fs, n: 5, color: { fg, bg: "rgb(255, 255, 255)", bgComplex: false, text: "x" } } });
  assert.equal(status("RISK-11", store([pg("home", { facts: body(14) })])), "fail");
  assert.equal(status("RISK-11", store([pg("home", { facts: body(16) })])), "pass");
  assert.equal(status("RISK-11", store([pg("home", { facts: body(16, "rgb(180, 180, 180)") })])), "fail");
  assert.equal(status("RISK-11", store([pg("home", { facts: facts() })])), "unverified");
});

test("OFFER-11 / OFFER-23 / TRUST-21 / PATH-10: text that proves the pass", () => {
  assert.equal(status("OFFER-11", store([withCta("product", "Add to cart", 700, [block("Bundle of 3: save 20%", 760)])])), "pass");
  assert.equal(status("OFFER-23", store([withCta("product", "Add to cart", 700, [block("Delivery in 2-3 days", 760), block("Free shipping over 200 SAR", 800)])])), "pass");
  assert.equal(status("OFFER-23", store([withCta("product", "Add to cart", 700, [block("Free shipping over 200 SAR", 700), block("Delivery in 2-3 days", 800)])])), "unverified");
  assert.equal(status("TRUST-21", store([pg("home", { blocks: [block("Halal certified", 900)] })])), "pass");
  const c = withCta("cart", "Checkout", 600, [block("Apple Pay", 660, "button")], { cart: { source: "page", empty: false } });
  assert.equal(status("PATH-10", store([c])), "pass");
  const icon = withCta("cart", "Checkout", 600, [block("Apple Pay", 660, "img")], { cart: { source: "page", empty: false } });
  assert.equal(status("PATH-10", store([icon])), "unverified");
});

test("code verdicts carry their own Arabic sentence; unverified ones don't", () => {
  const p = withCta("product", "Add to cart", 700, [block("30-day money-back guarantee", 760)]);
  const r = run("TRUST-05", store([p]));
  assert.equal(r.status, "pass");
  assert.match(r.observation?.ar ?? "", /«30-day money-back guarantee»/);
  assert.equal(run("TRUST-05", store([withCta("product", "Add to cart", 700, [])])).observation, undefined);
  assert.ok(run("NAV-08", store([pg("home", { facts: facts({ lang: "ar", dir: "ltr" }) })])).observation?.ar);
});
