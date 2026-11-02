import assert from "node:assert/strict";
import { test } from "node:test";
import { adMatch, adWords, normalize, offerTokens, type LandingSummary } from "./ad-match.js";
import type { StoreEvidence } from "./fud/evidence.js";
import { buildVerdictPrompt } from "./fud/manual-checklist.js";
import { MANUAL_CHECKPOINTS } from "./fud/manual-checklist-data.js";
import { siteChecksFrom } from "./site-checks.js";

const land = (fold: string, page = fold): LandingSummary => ({ url: "https://s.eg/l", source: "x", loaded: true, h1: [], fold, page, priceOnFold: false, buyOnFold: false });

test("normalize: Arabic digits, ٪, thousands separators, subscript digits, alef/taa forms", () => {
  assert.equal(normalize("خصم ٣٠٪ على ١٬٣٩٩ CO₂ أحمر ة"), "خصم 30% علي 1399 co2 احمر ه");
});

test("offer tokens: percentages, 'N for M' deals (with words between) and prices; small numbers alone are not offers", () => {
  assert.deepEqual(offerTokens("٤ منتجات بسعر ٣ وخصم ٣٠٪"), ["30%", "4/3"]);
  assert.deepEqual(offerTokens("Buy 2 for 1, only 1,399 EGP"), ["2/1", "1399"]);
  assert.deepEqual(offerTokens("Get 3 today"), []);
});

test("ad words: filler, offer and currency words dropped; original spelling kept", () => {
  assert.deepEqual(adWords("عروض نوفمبر على زيت الروزماري بسعر 1399 جنيه"), ["نوفمبر", "زيت", "الروزماري"]);
});

test("match: an offer in the first screen, lower down, or missing; Arabic prefixes match their word", () => {
  const m = adMatch({ text: "٤ منتجات بسعر ٣ على زيت الروزماري لتساقط الشعر", coupon: "NOV30" },
    land("عروض نوفمبر — 4 منتجات بسعر 3 | تساقط وفراغات | زيت الروزماري", "… use code NOV30 …"),
    { loaded: true, couponField: true })!;
  assert.deepEqual(m.offers, [{ text: "4/3", where: "fold" }]);
  assert.ok(m.words.found.includes("لتساقط"), "ل + تساقط matches تساقط");
  assert.deepEqual(m.words.missing, ["الشعر"]);
  assert.deepEqual(m.coupon, { code: "NOV30", where: "page", checkoutField: true });
  assert.ok(m.score! > 60);

  const miss = adMatch({ text: "50% off all abayas today only", coupon: "SAVE50" }, land("Rosemary oil | LE 1,399"), null)!;
  assert.equal(miss.score, 0);
  assert.equal(miss.coupon!.checkoutField, null, "checkout not seen: unknown, not 'no'");
});

test("no ad typed, or the page didn't load: no match", () => {
  assert.equal(adMatch(null, land("x"), null), null);
  assert.equal(adMatch({ text: null, coupon: null }, land("x"), null), null);
  assert.equal(adMatch({ text: "50% off", coupon: null }, { ...land("50%"), loaded: false }, null), null);
});

test("site checks summarize landing pages (price and buy button on the first screen) and the checkout's coupon field", () => {
  const page = (pageType: string, blocks: Array<{ text: string; aboveFold: boolean }>, extra = {}) => ({
    pageType, url: `https://s.eg/${pageType}`, loaded: true, widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: { fold: "data:image/jpeg;base64,AA" },
    blocks: blocks.map((b, i) => ({ id: `b${i}`, tag: "p", box: { x: 0, y: 0, w: 1, h: 1 }, ...b })), ...extra,
  });
  const e = {
    website: "https://s.eg", blockedHits: 0, durationMs: 1, addToCart: { attempted: false, ok: false },
    pages: [
      page("landing", [{ text: "Rosemary oil", aboveFold: true }, { text: "LE 1,399.00", aboveFold: true }], { landing: { source: "GA4: the page with the most paid visits (28 days)" }, cta: { text: "Add to cart", box: { x: 0, y: 900, w: 300, h: 48 }, disabled: false, nearbyBlockIds: [] } }),
      page("checkout", [{ text: "إضافة خصم", aboveFold: true }]),
    ],
  } as unknown as StoreEvidence;
  const s = siteChecksFrom(e, "Shopify", "EGP");
  assert.equal(s.landing!.length, 1);
  assert.equal(s.landing![0].priceOnFold, true);
  assert.equal(s.landing![0].buyOnFold, false, "the button sits below the 844px phone screen");
  assert.equal(s.landing![0].crop, "data:image/jpeg;base64,AA");
  assert.deepEqual(s.checkout, { loaded: true, couponField: true });
});

test("the typed ad reaches landing-page checkpoints only", () => {
  const e = { website: "https://s.eg", pages: [], addToCart: { attempted: false, ok: false } } as unknown as StoreEvidence;
  const lp = MANUAL_CHECKPOINTS.filter(c => c.tab === "Landing Pages").slice(0, 2);
  const pdp = MANUAL_CHECKPOINTS.filter(c => c.tab === "Product Page").slice(0, 2);
  const ad = { text: "50% off", coupon: "SAVE50" };
  assert.match(buildVerdictPrompt(e, lp, null, ad), /THE AD THAT SENDS TRAFFIC[\s\S]*"50% off"[\s\S]*"SAVE50"/);
  assert.doesNotMatch(buildVerdictPrompt(e, pdp, null, ad), /THE AD THAT SENDS TRAFFIC/);
  assert.doesNotMatch(buildVerdictPrompt(e, lp, null, null), /THE AD THAT SENDS TRAFFIC/);
});
