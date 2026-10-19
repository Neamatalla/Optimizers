import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../../api/detect-tracking.js";
import { fakeReq, fakeRes, useEnv, offlineAndQuiet, mockFetch } from "./helpers.js";

offlineAndQuiet();
useEnv({ INTELLIA_STORE_CHECK_URL: undefined });

async function call(query, method = "GET") {
  const res = fakeRes();
  await handler(fakeReq({ method, query }), res);
  return res;
}

test("returns the IDs found and the store verdict", async () => {
  mockFetch(() => new Response('<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234"></script>'));
  const res = await call({ website: "https://shop.com" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    reachable: true,
    status: 200,
    ga4MeasurementIds: ["G-ABC1234"],
    gtmContainerIds: [],
    store: { verdict: "skipped", reason: null, platform: null },
  });
  assert.equal(res.headers["cache-control"], "private, max-age=60");
});

test("only GET is allowed", async () => {
  assert.equal((await call({ website: "https://shop.com" }, "POST")).statusCode, 405);
});

test("missing or bad website is a 400", async () => {
  assert.equal((await call({})).statusCode, 400);
  for (const website of ["shop.com", "https://localhost", "nope"]) {
    const res = await call({ website });
    assert.equal(res.statusCode, 400, website);
    assert.equal(res.body.error, "Invalid website URL.");
  }
});

test("an unreachable site is still a 200, with reachable false", async () => {
  const res = await call({ website: "https://down.shop" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.reachable, false);
});

test("an unexpected crash is a 200 with empty lists", async () => {
  mockFetch(() => ({ ok: true, status: 200, text: async () => { throw new Error("stream broke"); } }));
  const res = await call({ website: "https://shop.com" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: false, ga4MeasurementIds: [], gtmContainerIds: [], store: { verdict: "skipped", reason: null, platform: null } });
});
