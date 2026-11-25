import { test } from "node:test";
import assert from "node:assert/strict";
import { hitEvents } from "./fud/collect.js";
import { contactLinksFrom, hasPrice, pixelMapFrom } from "./site-checks.js";
import { browserFactFor } from "./browser-facts.js";

test("hitEvents reads the GA4 measurement ID and the Meta pixel ID", () => {
  assert.deepEqual(hitEvents("https://region1.google-analytics.com/g/collect?v=2&tid=G-ABC123&en=page_view", undefined), [{ vendor: "ga4", name: "page_view", id: "G-ABC123" }]);
  assert.deepEqual(hitEvents("https://www.facebook.com/tr/?id=1234567890&ev=PageView&dl=x", undefined), [{ vendor: "meta", name: "PageView", id: "1234567890" }]);
  // No ID on the hit: no id field, never an empty one.
  assert.deepEqual(hitEvents("https://www.facebook.com/tr/?ev=PageView", undefined), [{ vendor: "meta", name: "PageView" }]);
});

test("pixelMapFrom groups hits per page, counts repeats, and collects IDs", () => {
  const map = pixelMapFrom([
    { page: "product", vendor: "meta", name: "ViewContent", id: "111" },
    { page: "home", vendor: "meta", name: "PageView", id: "111" },
    { page: "home", vendor: "meta", name: "PageView", id: "222" },
    { page: "home", vendor: "ga4", name: "page_view", id: "G-ABC123" },
  ]);
  // Pages in visit order (home, collection, product), whatever order the hits came in.
  assert.deepEqual(map?.pages.map(p => p.pageType), ["home", "product"]);
  assert.deepEqual(map?.pages[0].hits, [{ vendor: "meta", name: "PageView", count: 2 }, { vendor: "ga4", name: "page_view", count: 1 }]);
  assert.deepEqual(map?.ids, { meta: ["111", "222"], ga4: ["G-ABC123"] });
});

test("pixelMapFrom is null when nothing fired (older runs, or no tags)", () => {
  assert.equal(pixelMapFrom(undefined), null);
  assert.equal(pixelMapFrom([]), null);
});

// regal-honey.com (22 Nov): the product page has a "share on WhatsApp" button
// next to the store's real number. The share link has no number, so it was
// read as a broken contact link and W-07 failed a store whose links work.
const pages = (links: string[][]) => links.map((contactLinks, i) => ({ pageType: i ? "product" : "home", facts: { contactLinks } })) as never;

test("a WhatsApp share button is not a contact link", () => {
  const share = "https://api.whatsapp.com/send?text=اطَّلع على المنتج التالي https://regal-honey.com/products/x";
  const links = contactLinksFrom(pages([["https://wa.me/96596080212"], [share, "https://wa.me/96596080212"]]));
  assert.deepEqual(links, [{ href: "https://wa.me/96596080212", kind: "whatsapp", valid: true }]);
  assert.equal(contactLinksFrom(pages([["https://wa.me/?text=hello"]])).length, 0);
  const s = { contactLinks: links, pagesVisited: [], addToCart: { attempted: false, ok: false }, atcEvents: null, soldOutPromoted: 0, heroVideoMobile: false, platform: null } as never;
  assert.equal(browserFactFor("W-07", s)?.status, "pass");
});

test("a contact link with a missing or short number still counts as broken", () => {
  const links = contactLinksFrom(pages([["https://api.whatsapp.com/send?phone=0501", "tel:12345", "https://wa.me/"]]));
  assert.deepEqual(links.map(l => l.valid), [false, false, false]);
});

test("prices are found in every GCC currency, Latin and Arabic, either order", () => {
  for (const t of ["5.000 د.ك", "د.ك 5.000", "12 دينار", "KWD 5", "99 ر.س", "45 ر.ق", "3.5 ر.ع", "4 د.ب", "120 درهم", "AED 120", "BHD 4", "OMR 3", "250 ج.م", "$19"]) {
    assert.ok(hasPrice(t), t);
  }
  assert.ok(!hasPrice("Free delivery across Kuwait"));
});
