import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isAuthorized, getReport, updateFinding } from "../../api/_lib/report-edit.js";
import { fakeSupabase, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

const PAGE = { audit_request_id: "r1", bucket: "audit-reports", storage_path: null, public_url: "https://optimizers.agency/audit-reports/tharaa-shop", audit_requests: { status: "awaiting_approval", website: "https://tharaa.shop", business_name: null, audience_role: null } };
const REPORT = { audit_request_id: "r1", generated_at: "2026-10-20T10:00:00Z" };
const FINDING = { id: "f1", kind: "check", audit_request_id: "r1" };
const voice = { summary: "New summary", detail: "New detail" };

// report_pages -> page, audit_reports -> report, audit_findings -> the finding.
function setup({ page = PAGE, report = REPORT, finding = FINDING } = {}) {
  return fakeSupabase({
    db: q => {
      if (q.op === "update") return { data: null, error: null };
      if (q.table === "report_pages") return { data: page, error: null };
      if (q.table === "audit_reports") return { data: report, error: null };
      if (q.table === "audit_findings") return { data: q.filters.id ? finding : [finding], error: null };
      return { data: null, error: null };
    },
    files: { "audit-reports/reports/tharaa-shop/index.html": "<h1>Old</h1>" },
  });
}

describe("isAuthorized", () => {
  test("only an exact match passes", () => {
    assert.equal(isAuthorized("secret-key", "secret-key"), true);
    assert.equal(isAuthorized("secret-kez", "secret-key"), false);
    assert.equal(isAuthorized("secret", "secret-key"), false);
    assert.equal(isAuthorized(undefined, "secret-key"), false);
  });

  test("nobody passes when no key is configured", () => {
    assert.equal(isAuthorized("", ""), false);
    assert.equal(isAuthorized("anything", undefined), false);
  });
});

describe("getReport", () => {
  test("returns the rows at any stage, with the slug and link", async () => {
    const result = await getReport({ supabase: setup(), bucket: "audit-reports", slug: "tharaa-shop" });
    assert.equal(result.status, 200);
    assert.equal(result.body.slug, "tharaa-shop");
    assert.equal(result.body.publicUrl, PAGE.public_url);
    assert.deepEqual(result.body.findings, [FINDING]);
  });

  test("bad slug, unknown slug", async () => {
    assert.equal((await getReport({ supabase: setup(), bucket: "b", slug: "../x" })).status, 400);
    assert.equal((await getReport({ supabase: setup({ page: null }), bucket: "b", slug: "nope" })).status, 404);
  });

  test("an old HTML report has nothing to edit", async () => {
    const old = setup({ page: { ...PAGE, storage_path: "reports/tharaa-shop/index.html" }, report: null });
    assert.equal((await getReport({ supabase: old, bucket: "audit-reports", slug: "tharaa-shop" })).status, 409);
  });
});

describe("updateFinding", () => {
  test("updates the finding's row", async () => {
    const supabase = setup();
    const changes = { business: voice, status: "pass" };
    const result = await updateFinding({ supabase, slug: " tharaa-shop ", findingId: "f1", changes });
    assert.deepEqual(result, { status: 200, body: { success: true, slug: "tharaa-shop", findingId: "f1" } });
    const update = supabase.calls.find(c => c.op === "update");
    assert.equal(update.table, "audit_findings");
    assert.deepEqual(update.filters, { id: "f1" });
    assert.deepEqual(update.fields, changes);
  });

  test("rejects bad input without writing", async () => {
    const supabase = setup();
    const bad = [
      { slug: "a/b", findingId: "f1", changes: { protect: "x" } },
      { slug: "tharaa-shop", findingId: "", changes: { protect: "x" } },
      { slug: "tharaa-shop", findingId: "f1", changes: {} },
      { slug: "tharaa-shop", findingId: "f1", changes: { point_id: "GA4-99" } },
      { slug: "tharaa-shop", findingId: "f1", changes: { business: { summary: "only a summary" } } },
      { slug: "tharaa-shop", findingId: "f1", changes: { status: "warn" } },
    ];
    for (const input of bad) assert.equal((await updateFinding({ supabase, ...input })).status, 400, JSON.stringify(input));
    assert.equal(supabase.calls.filter(c => c.op === "update").length, 0);
  });

  test("a friction finding takes its own statuses", async () => {
    const supabase = setup({ finding: { ...FINDING, kind: "friction" } });
    assert.equal((await updateFinding({ supabase, slug: "tharaa-shop", findingId: "f1", changes: { status: "warn" } })).status, 200);
  });

  test("a finding from another report is a 404", async () => {
    const supabase = setup({ finding: { ...FINDING, audit_request_id: "r2" } });
    assert.equal((await updateFinding({ supabase, slug: "tharaa-shop", findingId: "f1", changes: { protect: "x" } })).status, 404);
    assert.equal(supabase.calls.filter(c => c.op === "update").length, 0);
  });

  test("unknown slug is a 404", async () => {
    assert.equal((await updateFinding({ supabase: setup({ page: null }), slug: "nope", findingId: "f1", changes: { protect: "x" } })).status, 404);
  });
});
