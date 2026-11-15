import { test } from "node:test";
import assert from "node:assert/strict";
import { adminPathFor, detectStorePlatform, normalizePlatform, ownerLane } from "./owner-admin-paths.js";

test("detects Salla, Zid, Shopify and WooCommerce from HTML", () => {
  assert.equal(detectStorePlatform('<script src="https://cdn.salla.network/js/app.js">'), "salla");
  assert.equal(detectStorePlatform('<img src="https://media.zid.store/x.jpg">'), "zid");
  assert.equal(detectStorePlatform('<link href="//cdn.shopify.com/s/files/a.css">'), "shopify");
  assert.equal(detectStorePlatform("wp-content/plugins/woocommerce/x.js"), "woocommerce");
  assert.equal(detectStorePlatform("<html></html>"), null);
  assert.equal(normalizePlatform("Salla"), "salla");
  assert.equal(normalizePlatform("Wix"), "other");
  assert.equal(normalizePlatform(null), null);
});

test("GA4/GTM/ads work never lands on the owner", () => {
  assert.equal(ownerLane("GA4", ["owner"]), "ads");
  assert.equal(ownerLane("Website", ["marketing"]), "ads");
  assert.equal(ownerLane("Website", ["owner"], "Connect Google Ads conversions"), "ads");
  assert.equal(ownerLane("Website", ["owner", "dev"]), "dev");
  assert.equal(ownerLane("Website", ["owner", "content"], "Add a returns policy page"), "admin");
});

test("admin paths only where confirmed", () => {
  assert.match(adminPathFor("salla", "Add free delivery above SAR 200")!.path, /الشحن المجاني/);
  assert.ok(adminPathFor("zid", "Turn on the WhatsApp button")!.gate);
  assert.equal(adminPathFor("shopify", "Add a COD fee"), null);
  assert.equal(adminPathFor("salla", "Add a WhatsApp button"), null);
  assert.equal(adminPathFor("other", "free shipping"), null);
  assert.equal(adminPathFor(null, "free shipping"), null);
});
