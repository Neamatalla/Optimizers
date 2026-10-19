import { test } from "node:test";
import assert from "node:assert/strict";
import { fakeReq, fakeRes, useEnv, offlineAndQuiet, mockResend } from "./helpers.js";

const resend = mockResend();
const { default: handler } = await import("../../api/contact.js");

offlineAndQuiet();
useEnv({ RESEND_API_KEY: "re_test" });

const FORM = {
  firstName: "Omar",
  email: "omar@shop.com",
  website: "https://shop.com",
  traffic: "10k-50k",
  monthlyConversions: "100-500",
  challenge: "Low conversion rate",
};

async function call(body, method = "POST") {
  const res = fakeRes();
  await handler(fakeReq({ method, body }), res);
  return res;
}

test("a full form sends one email and returns 200", async () => {
  resend.sent.length = 0;
  resend.result = { data: { id: "email_1" }, error: null };
  const res = await call(FORM);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(resend.sent.length, 1);
  assert.match(resend.sent[0].html, /Low conversion rate/);
});

test("only POST is allowed", async () => {
  assert.equal((await call(FORM, "GET")).statusCode, 405);
});

test("500 when the Resend key is missing", async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal((await call(FORM)).statusCode, 500);
});

test("missing fields are listed by name", async () => {
  const res = await call({ ...FORM, traffic: "  ", challenge: undefined });
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.missingFields, ["traffic", "challenge"]);
});

test("an empty body lists every field", async () => {
  const res = await call(undefined);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.missingFields.length, 6);
});

test("bad email is a 400", async () => {
  for (const email of ["omar", "omar@shop", "omar @shop.com"]) {
    const res = await call({ ...FORM, email });
    assert.equal(res.statusCode, 400, email);
    assert.equal(res.body.error, "Please enter a valid email address.");
  }
});

test("bad website is a 400", async () => {
  for (const website of ["shop.com", "https://localhost", "not a url"]) {
    const res = await call({ ...FORM, website });
    assert.equal(res.statusCode, 400, website);
    assert.equal(res.body.error, "Please enter a valid website URL.");
  }
});

test("a Resend error or crash is a 500", async () => {
  resend.result = { data: null, error: { message: "rate limited" } };
  assert.equal((await call(FORM)).statusCode, 500);
  resend.result = new Error("network down");
  assert.equal((await call(FORM)).statusCode, 500);
  resend.result = { data: { id: "email_1" }, error: null };
});

test("form values are escaped in the email", async () => {
  resend.sent.length = 0;
  await call({ ...FORM, challenge: '<img src="x" onerror="alert(1)">' });
  assert.doesNotMatch(resend.sent[0].html, /<img/);
  assert.match(resend.sent[0].html, /&lt;img src=&quot;x&quot;/);
});
