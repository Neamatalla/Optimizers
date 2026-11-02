import { test } from "node:test";
import assert from "node:assert/strict";
import { hitEvents } from "./fud/collect.js";
import { pixelMapFrom } from "./site-checks.js";

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
