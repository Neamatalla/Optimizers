import { test } from "node:test";
import assert from "node:assert/strict";
import { getServableReport, previewSignature } from "../../api/_lib/report-access.js";
import { fakeSupabase, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

const SECRET = "preview-secret";
const SLUG = "tharaa-shop";
const HOUR = 60 * 60 * 1000;

// A report_pages row linked to its audit request, plus the stored file.
function setup(request, { bucket = "audit-reports", lookupError = null } = {}) {
  const page = request === undefined ? null : { bucket, storage_path: `reports/${SLUG}/index.html`, audit_requests: request };
  return fakeSupabase({
    db: () => ({ data: lookupError ? null : page, error: lookupError }),
    files: { [`${bucket}/reports/${SLUG}/index.html`]: "<h1>Report</h1>" },
  });
}

const serve = (supabase, extra = {}) =>
  getServableReport({ supabase, slug: SLUG, defaultBucket: "audit-reports", previewSecret: SECRET, ...extra });

test("bad slug is rejected before any lookup", async () => {
  const supabase = setup({ status: "done" });
  for (const slug of ["../etc", "a b", "", "x/y"]) {
    assert.equal((await serve(supabase, { slug })).status, 400, slug);
  }
  assert.equal(supabase.calls.length, 0);
});

test("a sent report is shown to the client", async () => {
  assert.deepEqual(await serve(setup({ status: "done" })), { status: 200, body: "<h1>Report</h1>" });
});

test("a scheduled report is shown once its send time has passed", async () => {
  const past = new Date(Date.now() - HOUR).toISOString();
  assert.equal((await serve(setup({ status: "scheduled", scheduled_send_at: past }))).status, 200);
});

test("a report that isn't due yet looks the same as a missing one", async () => {
  const future = new Date(Date.now() + HOUR).toISOString();
  for (const request of [{ status: "scheduled", scheduled_send_at: future }, { status: "scheduled" }, { status: "awaiting_approval" }, { status: "processing" }]) {
    assert.deepEqual(await serve(setup(request)), { status: 404, body: "Audit report not found." }, request.status);
  }
});

test("a signed preview link shows the report at any stage", async () => {
  const preview = previewSignature(SLUG, SECRET);
  assert.equal((await serve(setup({ status: "awaiting_approval" }), { preview })).status, 200);
});

test("a wrong preview signature is ignored", async () => {
  const preview = previewSignature("other-slug", SECRET);
  assert.equal((await serve(setup({ status: "awaiting_approval" }), { preview })).status, 404);
});

test("previews never work when the secret isn't set", async () => {
  const preview = previewSignature(SLUG, SECRET);
  assert.equal((await serve(setup({ status: "awaiting_approval" }), { preview, previewSecret: undefined })).status, 404);
});

test("old reports with no report_pages row are served from the default bucket", async () => {
  assert.deepEqual(await serve(setup(undefined)), { status: 200, body: "<h1>Report</h1>" });
});

test("a test-mode report is read from its own bucket", async () => {
  assert.equal((await serve(setup({ status: "done" }, { bucket: "audit-reports-test" }))).status, 200);
});

test("lookup error: 500 for a plain request, still served with a valid preview", async () => {
  const lookupError = { message: "db down" };
  assert.equal((await serve(setup({ status: "done" }, { lookupError }))).status, 500);
  const preview = previewSignature(SLUG, SECRET);
  assert.equal((await serve(setup({ status: "done" }, { lookupError }), { preview })).status, 200);
});

test("a row whose file is missing from storage is a 404", async () => {
  const supabase = fakeSupabase({ db: () => ({ data: { bucket: "audit-reports", storage_path: "gone.html", audit_requests: { status: "done" } }, error: null }) });
  assert.equal((await serve(supabase)).status, 404);
});
