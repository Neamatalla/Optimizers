import { test, describe } from "node:test";
import assert from "node:assert/strict";
import authorize from "../../api/oauth/google/authorize.js";
import callback from "../../api/oauth/google/callback.js";
import { fakeReq, fakeRes, useEnv, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();
useEnv({
  GOOGLE_OAUTH_CLIENT_ID: "client-1",
  GOOGLE_OAUTH_CLIENT_SECRET: "secret-1",
  GOOGLE_OAUTH_REDIRECT_URI: "https://optimizers.agency/api/oauth/google/callback",
});

async function call(handler, req = {}) {
  const res = fakeRes();
  await handler(fakeReq(req), res);
  return res;
}

describe("authorize", () => {
  test("saves a random state in a cookie and sends the visitor to Google with it", async () => {
    const res = await call(authorize);
    assert.equal(res.statusCode, 302);

    const cookie = res.headers["set-cookie"];
    const state = cookie.match(/^g_oauth_state=([a-f0-9]{32});/)?.[1];
    assert.ok(state, cookie);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Path=\/api\/oauth\/google/);

    const google = new URL(res.headers.location);
    assert.equal(google.origin, "https://accounts.google.com");
    assert.equal(google.searchParams.get("state"), state);
    assert.equal(google.searchParams.get("client_id"), "client-1");
    assert.equal(google.searchParams.get("redirect_uri"), "https://optimizers.agency/api/oauth/google/callback");
    assert.equal(google.searchParams.get("scope"), "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/tagmanager.readonly");
  });

  test("a new state every time", async () => {
    const first = (await call(authorize)).headers["set-cookie"];
    const second = (await call(authorize)).headers["set-cookie"];
    assert.notEqual(first, second);
  });

  test("500 when Google isn't configured", async () => {
    delete process.env.GOOGLE_OAUTH_CLIENT_ID;
    assert.equal((await call(authorize)).statusCode, 500);
  });
});

describe("callback", () => {
  test("500 when Google isn't configured", async () => {
    delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    assert.equal((await call(callback, { query: {} })).statusCode, 500);
  });

  test("the visitor said no: the error goes back to the form", async () => {
    const res = await call(callback, { query: { error: "access_denied" } });
    assert.equal(res.statusCode, 200);
    assert.match(res.body, /Google denied access: access_denied/);
  });

  test("state that doesn't match the cookie is refused before talking to Google", async () => {
    const res = await call(callback, { query: { code: "attacker-code", state: "abc" }, headers: { cookie: "g_oauth_state=xyz" } });
    assert.match(res.body, /State mismatch/);
    assert.equal(globalThis.fetch.mock.callCount(), 0);
  });

  test("no cookie at all is refused the same way", async () => {
    const res = await call(callback, { query: { code: "attacker-code", state: "abc" } });
    assert.match(res.body, /State mismatch/);
    assert.equal(globalThis.fetch.mock.callCount(), 0);
  });

  test("the result page sends the visitor back to the form, never elsewhere", async () => {
    const res = await call(callback, { query: { error: "access_denied" } });
    assert.match(res.body, /location\.replace\("\/#free-audit"\)/);
  });
});
