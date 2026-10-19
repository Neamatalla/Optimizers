import { test } from "node:test";
import assert from "node:assert/strict";
import { log, setLogContext, withLog } from "../../api/_lib/log.js";
import { fakeReq, fakeRes, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

// Every JSON line written at one level, parsed.
const lines = level => console[level].mock.calls.map(call => JSON.parse(call.arguments[0]));
const allLines = () => [...lines("log"), ...lines("warn"), ...lines("error")];

test("logs one end line with route, status, time and the error text", async () => {
  const handler = withLog("demo", async (req, res) => res.status(409).json({ error: "Already requested" }));
  await handler(fakeReq({ method: "POST" }), fakeRes());

  const [end] = lines("warn");
  assert.equal(end.route, "demo");
  assert.equal(end.status, 409);
  assert.equal(end.error, "Already requested");
  assert.equal(end.message, "POST demo 409");
  assert.equal(typeof end.ms, "number");
});

test("a 500 is logged at error level, a 200 at info", async () => {
  await withLog("ok", async (req, res) => res.status(200).json({ success: true }))(fakeReq(), fakeRes());
  await withLog("bad", async (req, res) => res.status(500).json({ error: "Boom" }))(fakeReq(), fakeRes());
  assert.equal(lines("log")[0].route, "ok");
  assert.equal(lines("error")[0].route, "bad");
});

test("setLogContext adds the audit ID to every later line, including the end line", async () => {
  const handler = withLog("audit-request", async (req, res) => {
    setLogContext({ auditId: "a1" });
    log.error("Something failed", { error: new Error("nope") });
    return res.status(200).json({ success: true });
  });
  await handler(fakeReq({ method: "POST" }), fakeRes());

  const [failure] = lines("error");
  assert.equal(failure.auditId, "a1");
  assert.equal(failure.route, "audit-request");
  assert.equal(failure.error.message, "nope");
  assert.equal(lines("log")[0].auditId, "a1");
});

test("two requests running at once keep their own audit IDs", async () => {
  const handler = withLog("audit-request", async (req, res) => {
    setLogContext({ auditId: req.body.id });
    await new Promise(resolve => setTimeout(resolve, req.body.wait));
    log.info("Inside", { expect: req.body.id });
    return res.status(200).json({ success: true });
  });
  await Promise.all([
    handler(fakeReq({ body: { id: "first", wait: 20 } }), fakeRes()),
    handler(fakeReq({ body: { id: "second", wait: 5 } }), fakeRes()),
  ]);

  const inside = lines("log").filter(l => l.message === "Inside");
  assert.equal(inside.length, 2);
  for (const l of inside) assert.equal(l.auditId, l.expect);
});

test("a crash is logged and still rethrown", async () => {
  const handler = withLog("crashy", async () => { throw new Error("kaboom"); });
  await assert.rejects(handler(fakeReq(), fakeRes()), /kaboom/);
  assert.ok(allLines().some(l => l.message === "Handler crashed" && l.error.message === "kaboom"));
});

test("outside a request, setLogContext does nothing and log still works", () => {
  setLogContext({ auditId: "ignored" });
  log.info("Loose line");
  assert.deepEqual(lines("log")[0], { level: "info", message: "Loose line" });
});
