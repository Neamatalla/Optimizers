import { test } from "node:test";
import assert from "node:assert/strict";
import { getServableReport, previewSignature } from "../../api/_lib/report-access.js";
import { fakeSupabase, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

const SECRET = "preview-secret";
const SLUG = "tharaa-shop";
const HOUR = 60 * 60 * 1000;
const REQUEST = { website: "https://tharaa.shop", business_name: "Tharaa", audience_role: "media_buyer" };
const REPORT = { audit_request_id: "r1", generated_at: "2026-10-20T10:00:00Z", discovered_pages: [] };
const FINDINGS = [{ id: "f1", kind: "check", point_id: "GA4-01", status: "fail" }];
const ROWS_BODY = { request: REQUEST, report: REPORT, findings: FINDINGS };

// A report_pages row linked to its audit request, and either the report's
// rows (the default) or, for an old report, its stored HTML file.
function setup(status, { bucket = "audit-reports", lookupError = null, file = false } = {}) {
  const page = status === undefined
    ? null
    : { audit_request_id: "r1", bucket, storage_path: file ? `reports/${SLUG}/index.html` : null, audit_requests: { ...REQUEST, ...status } };
  return fakeSupabase({
    db: q => {
      if (q.table === "report_pages") return { data: lookupError ? null : page, error: lookupError };
      if (q.table === "audit_reports") return { data: file ? null : REPORT, error: null };
      if (q.table === "audit_findings") return { data: FINDINGS, error: null };
      return { data: null, error: null };
    },
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

test("a sent report returns its rows and the request fields", async () => {
  const supabase = setup({ status: "done" });
  assert.deepEqual(await serve(supabase), { status: 200, body: ROWS_BODY });
  const findings = supabase.calls.find(c => c.table === "audit_findings");
  assert.deepEqual(findings.filters, { audit_request_id: "r1" });
});

test("a scheduled report is shown once its send time has passed", async () => {
  const past = new Date(Date.now() - HOUR).toISOString();
  assert.equal((await serve(setup({ status: "scheduled", scheduled_send_at: past }))).status, 200);
});

test("a report that isn't due yet looks the same as a missing one", async () => {
  const future = new Date(Date.now() + HOUR).toISOString();
  for (const request of [{ status: "scheduled", scheduled_send_at: future }, { status: "scheduled" }, { status: "awaiting_approval" }, { status: "processing" }]) {
    assert.deepEqual(await serve(setup(request)), { status: 404, body: { error: "Audit report not found." } }, request.status);
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

test("an old report with no rows is returned as its HTML file", async () => {
  assert.deepEqual(await serve(setup({ status: "done" }, { file: true })), { status: 200, body: { legacyHtml: "<h1>Report</h1>" } });
});

test("an old report's file is read from its own bucket", async () => {
  assert.equal((await serve(setup({ status: "done" }, { file: true, bucket: "audit-reports-test" }))).status, 200);
});

test("old reports with no report_pages row are served from the default bucket", async () => {
  assert.deepEqual(await serve(setup(undefined)), { status: 200, body: { legacyHtml: "<h1>Report</h1>" } });
});

test("lookup error: 500 for a plain request, the old default file with a valid preview", async () => {
  const lookupError = { message: "db down" };
  assert.equal((await serve(setup({ status: "done" }, { lookupError }))).status, 500);
  const preview = previewSignature(SLUG, SECRET);
  assert.equal((await serve(setup({ status: "done" }, { lookupError }), { preview })).status, 200);
});

test("no rows and no file is a 404", async () => {
  const supabase = fakeSupabase({
    db: q => (q.table === "report_pages" ? { data: { audit_request_id: "r1", bucket: "audit-reports", storage_path: "gone.html", audit_requests: { status: "done" } }, error: null } : { data: null, error: null }),
  });
  assert.equal((await serve(supabase)).status, 404);
});
