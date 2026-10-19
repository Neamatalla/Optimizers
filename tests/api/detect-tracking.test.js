import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { detectTracking, checkStore } from "../../api/_lib/detect-tracking.js";
import { offlineAndQuiet, mockFetch, useEnv } from "./helpers.js";

offlineAndQuiet();

const SITE_HTML = `
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234"></script>
  <script>gtag('config', 'g-abc1234'); gtag("config", "G-SECOND99");</script>
  <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XYZ9"></script>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XYZ9"></iframe>
  <div class="g-recaptcha" data-note="GTM-FAKE in plain text"></div>`;

describe("detectTracking", () => {
  test("finds GA4 and GTM IDs from Google's snippets, once each, uppercased", async () => {
    mockFetch(() => new Response(SITE_HTML, { status: 200 }));
    const result = await detectTracking("https://shop.com");
    assert.deepEqual(result, {
      reachable: true,
      status: 200,
      ga4MeasurementIds: ["G-ABC1234", "G-SECOND99"],
      gtmContainerIds: ["GTM-XYZ9"],
    });
  });

  test("a site with no snippets is reachable with empty lists", async () => {
    mockFetch(() => new Response("<html></html>", { status: 200 }));
    const result = await detectTracking("https://shop.com");
    assert.equal(result.reachable, true);
    assert.deepEqual(result.ga4MeasurementIds, []);
  });

  test("403 counts as reachable (bot protection on a real site)", async () => {
    mockFetch(() => new Response("", { status: 403 }));
    assert.equal((await detectTracking("https://shop.com")).reachable, true);
  });

  test("other error codes count as not reachable", async () => {
    mockFetch(() => new Response("", { status: 404 }));
    const result = await detectTracking("https://shop.com");
    assert.equal(result.reachable, false);
    assert.equal(result.status, 404);
  });

  test("a failed fetch counts as not reachable", async () => {
    assert.deepEqual(await detectTracking("https://shop.com"), { reachable: false, ga4MeasurementIds: [], gtmContainerIds: [] });
  });
});

describe("checkStore", () => {
  useEnv({ INTELLIA_STORE_CHECK_URL: "https://intellia.test/check", INTELLIA_API_KEY: "key-1" });
  const intellia = (body, status = 200) => mockFetch(() => Response.json(body, { status }));

  test("sends the site URL with the API key", async () => {
    let sent;
    mockFetch((url, init) => {
      sent = { url, init };
      return Response.json({ status: "not_ecommerce" });
    });
    await checkStore("https://shop.com/");
    assert.equal(sent.url, "https://intellia.test/check");
    assert.equal(sent.init.method, "POST");
    assert.equal(sent.init.headers["X-API-Key"], "key-1");
    assert.deepEqual(JSON.parse(sent.init.body), { url: "https://shop.com/" });
  });

  test("an online store comes back as 'store' with its platform", async () => {
    intellia({ status: "ecommerce", platform: " Shopify ", fetch_error: null });
    assert.deepEqual(await checkStore("https://shop.com"), { verdict: "store", reason: null, platform: "Shopify" });
  });

  test("a store with no platform name still counts", async () => {
    intellia({ status: "ecommerce", platform: null });
    assert.deepEqual(await checkStore("https://shop.com"), { verdict: "store", reason: null, platform: null });
  });

  test("not a store", async () => {
    intellia({ status: "not_ecommerce", platform: null });
    assert.deepEqual(await checkStore("https://blog.com"), { verdict: "not_store", reason: "not_ecommerce", platform: null });
  });

  test("Intellia couldn't load the site: blocked vs everything else", async () => {
    intellia({ status: "fetch_failed", fetch_error: "blocked" });
    assert.equal((await checkStore("https://shop.com")).reason, "blocked");
    for (const fetchError of ["timeout", "unreachable", "http_error"]) {
      intellia({ status: "fetch_failed", fetch_error: fetchError });
      assert.equal((await checkStore("https://shop.com")).reason, "unreachable", fetchError);
    }
  });

  test("skipped when Intellia isn't set up, is down, or answers oddly", async () => {
    const skipped = { verdict: "skipped", reason: null, platform: null };
    delete process.env.INTELLIA_STORE_CHECK_URL;
    assert.deepEqual(await checkStore("https://shop.com"), skipped);
    process.env.INTELLIA_STORE_CHECK_URL = "https://intellia.test/check";

    intellia({ status: "ecommerce" }, 500);
    assert.deepEqual(await checkStore("https://shop.com"), skipped);

    intellia({ status: "maybe" });
    assert.deepEqual(await checkStore("https://shop.com"), skipped);

    mockFetch(() => { throw new Error("timeout"); });
    assert.deepEqual(await checkStore("https://shop.com"), skipped);
  });
});
