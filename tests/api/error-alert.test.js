import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { fakeReq, fakeRes, useEnv, offlineAndQuiet, mockResend } from "./helpers.js";

const resend = mockResend();
const { setLogContext, withLog } = await import("../../api/_lib/log.js");
const { resetErrorAlerts } = await import("../../api/_lib/error-alert.js");

offlineAndQuiet();
useEnv({ VERCEL_ENV: "production", RESEND_API_KEY: "re_test", AUDIT_REVIEWER_EMAIL: "review@optimizers.agency" });

beforeEach(() => {
  resetErrorAlerts();
  resend.sent.length = 0;
  resend.result = { data: { id: "email_1" }, error: null };
});

const failing = route => withLog(route, async (req, res) => {
  setLogContext({ auditId: "a1" });
  return res.status(500).json({ error: "Could not queue audit request." });
});

test("a 500 emails the reviewer with the route, error and audit ID", async () => {
  await failing("audit-request")(fakeReq({ method: "POST" }), fakeRes());
  assert.equal(resend.sent.length, 1);
  const [email] = resend.sent;
  assert.deepEqual(email.to, ["review@optimizers.agency"]);
  assert.match(email.subject, /\/api\/audit-request returned 500/);
  assert.match(email.html, /Could not queue audit request\./);
  assert.match(email.html, /a1/);
});

test("at most one email per route in the gap, other routes still alert", async () => {
  await failing("audit-request")(fakeReq(), fakeRes());
  await failing("audit-request")(fakeReq(), fakeRes());
  await failing("contact")(fakeReq(), fakeRes());
  assert.deepEqual(resend.sent.map(e => e.subject), [
    "API error: /api/audit-request returned 500",
    "API error: /api/contact returned 500",
  ]);
});

test("a crash alerts too, and still rethrows", async () => {
  const handler = withLog("crashy", async () => { throw new Error("kaboom"); });
  await assert.rejects(handler(fakeReq(), fakeRes()), /kaboom/);
  assert.equal(resend.sent.length, 1);
  assert.equal(resend.sent[0].subject, "API error: /api/crashy crashed");
  assert.match(resend.sent[0].html, /kaboom/);
});

test("4xx answers never alert", async () => {
  await withLog("contact", async (req, res) => res.status(400).json({ error: "Bad input" }))(fakeReq(), fakeRes());
  assert.equal(resend.sent.length, 0);
});

test("no alert outside production", async () => {
  process.env.VERCEL_ENV = "preview";
  await failing("audit-request")(fakeReq(), fakeRes());
  assert.equal(resend.sent.length, 0);
});

test("a failed alert email doesn't change the response", async () => {
  resend.result = new Error("network down");
  const res = fakeRes();
  await failing("audit-request")(fakeReq(), res);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: "Could not queue audit request." });
});
