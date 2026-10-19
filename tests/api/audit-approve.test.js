import { test } from "node:test";
import assert from "node:assert/strict";
import { approveAuditRequest } from "../../api/_lib/audit-approve.js";
import { fakeSupabase, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

const TOKEN = "a".repeat(32);
const ROW = { id: "r1", email: "client@shop.com", website: "https://shop.com", status: "awaiting_approval", approval_token: TOKEN, scheduled_send_at: null };

function setup(row = ROW, { lookupError = null, updateError = null } = {}) {
  return fakeSupabase({
    db: q => (q.op === "update" ? { data: null, error: updateError } : { data: lookupError ? null : row, error: lookupError }),
  });
}

const approve = (supabase, id = "r1", token = TOKEN) => approveAuditRequest({ supabase, id, token });

test("approving schedules the send 2 days out", async () => {
  const supabase = setup();
  const before = Date.now();
  const result = await approve(supabase);
  assert.equal(result.status, 200);
  assert.match(result.html, /Approved/);

  const update = supabase.calls.find(c => c.op === "update");
  assert.equal(update.fields.status, "scheduled");
  const delay = new Date(update.fields.scheduled_send_at).getTime() - before;
  assert.ok(Math.abs(delay - 2 * 24 * 60 * 60 * 1000) < 60_000, `delay was ${delay}ms`);
  // Only flips a row that is still awaiting approval (double-click guard).
  assert.deepEqual(update.filters, { id: "r1", status: "awaiting_approval" });
});

test("missing id or token is a 400", async () => {
  assert.equal((await approve(setup(), "", TOKEN)).status, 400);
  assert.equal((await approve(setup(), "r1", "")).status, 400);
});

test("unknown id is a 404", async () => {
  assert.equal((await approve(setup(null))).status, 404);
});

test("wrong token is a 401 and nothing changes", async () => {
  const supabase = setup();
  const result = await approve(supabase, "r1", "b".repeat(32));
  assert.equal(result.status, 401);
  assert.equal(supabase.calls.some(c => c.op === "update"), false);
});

test("wrong token never reveals the client's email or the status", async () => {
  for (const status of ["done", "scheduled", "processing"]) {
    const result = await approve(setup({ ...ROW, status }), "r1", "wrong");
    assert.equal(result.status, 401, status);
    assert.doesNotMatch(result.html, /client@shop\.com/);
    assert.doesNotMatch(result.html, new RegExp(status));
  }
});

test("a row with no token can't be approved", async () => {
  assert.equal((await approve(setup({ ...ROW, approval_token: null }), "r1", "anything")).status, 401);
});

test("clicking again after approval says it's already handled", async () => {
  const scheduled = await approve(setup({ ...ROW, status: "scheduled", scheduled_send_at: "2026-10-21T10:00:00Z" }));
  assert.equal(scheduled.status, 200);
  assert.match(scheduled.html, /Already approved/);

  const done = await approve(setup({ ...ROW, status: "done" }));
  assert.equal(done.status, 200);
  assert.match(done.html, /Already sent to client@shop\.com/);
});

test("a request that isn't ready for approval is a 409", async () => {
  const result = await approve(setup({ ...ROW, status: "processing" }));
  assert.equal(result.status, 409);
  assert.match(result.html, /processing/);
});

test("database errors are a 500", async () => {
  assert.equal((await approve(setup(ROW, { lookupError: { message: "down" } }))).status, 500);
  assert.equal((await approve(setup(ROW, { updateError: { message: "down" } }))).status, 500);
});

test("values shown on the page are escaped", async () => {
  const result = await approve(setup({ ...ROW, email: "<b>x</b>@shop.com" }));
  assert.match(result.html, /&lt;b&gt;x&lt;\/b&gt;@shop\.com/);
});
