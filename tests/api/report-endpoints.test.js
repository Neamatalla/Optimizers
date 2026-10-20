// The three report endpoints: approve, view, edit. Their rules are tested in
// audit-approve.test.js, report-access.test.js and report-edit.test.js; this
// file checks what the handlers add on top (method, config, auth, headers).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { fakeReq, fakeRes, fakeSupabase, useEnv, offlineAndQuiet, mockSupabaseModule } from "./helpers.js";

const supabaseModule = mockSupabaseModule();
const { default: approveHandler } = await import("../../api/audit-approve.js");
const { default: reportHandler } = await import("../../api/audit-report.js");
const { default: editHandler } = await import("../../api/report/edit.js");

offlineAndQuiet();
useEnv({
  SUPABASE_URL: "https://db.test",
  SUPABASE_SECRET_KEY: "service-key",
  REPORT_EDIT_API_KEY: "edit-key",
  AUDIT_REPORTS_BUCKET: undefined,
  REPORT_PREVIEW_SECRET: undefined,
});

async function call(handler, req) {
  const res = fakeRes();
  await handler(fakeReq(req), res);
  return res;
}

describe("GET /api/audit-approve", () => {
  test("only GET is allowed", async () => {
    const res = await call(approveHandler, { method: "POST" });
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers["content-type"], "text/html; charset=utf-8");
  });

  test("500 when Supabase isn't configured", async () => {
    delete process.env.SUPABASE_URL;
    assert.equal((await call(approveHandler, { query: { id: "r1", token: "t" } })).statusCode, 500);
  });

  test("passes id and token through and answers with an HTML page", async () => {
    supabaseModule.client = fakeSupabase({
      db: q => (q.op === "update" ? { data: null, error: null } : { data: { id: "r1", email: "c@shop.com", website: "https://shop.com", status: "awaiting_approval", approval_token: "tok" }, error: null }),
    });
    const res = await call(approveHandler, { query: { id: " r1 ", token: " tok " } });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers["content-type"], "text/html; charset=utf-8");
    assert.match(res.body, /Approved/);
  });

  test("missing query is a 400", async () => {
    assert.equal((await call(approveHandler, { query: {} })).statusCode, 400);
  });
});

describe("GET /api/audit-report", () => {
  const rows = status => q => {
    if (q.table === "report_pages") return { data: { audit_request_id: "r1", bucket: "audit-reports", storage_path: null, audit_requests: { status, website: "https://tharaa.shop" } }, error: null };
    if (q.table === "audit_reports") return { data: { audit_request_id: "r1" }, error: null };
    if (q.table === "audit_findings") return { data: [], error: null };
    return { data: null, error: null };
  };

  test("only GET is allowed", async () => {
    assert.equal((await call(reportHandler, { method: "POST", query: { slug: "tharaa-shop" } })).statusCode, 405);
  });

  test("500 when Supabase isn't configured", async () => {
    delete process.env.SUPABASE_SECRET_KEY;
    assert.equal((await call(reportHandler, { query: { slug: "tharaa-shop" } })).statusCode, 500);
  });

  test("a sent report is served as JSON, cached for a minute", async () => {
    supabaseModule.client = fakeSupabase({ db: rows("done") });
    const res = await call(reportHandler, { query: { slug: "tharaa-shop" } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.report, { audit_request_id: "r1" });
    assert.deepEqual(res.body.findings, []);
    assert.equal(res.headers["cache-control"], "public, max-age=60, s-maxage=60");
  });

  test("the old ?id= parameter still works", async () => {
    supabaseModule.client = fakeSupabase({ db: rows("done") });
    assert.equal((await call(reportHandler, { query: { id: "tharaa-shop" } })).statusCode, 200);
  });

  test("a report that isn't due is a 404 and is not cached", async () => {
    supabaseModule.client = fakeSupabase({ db: rows("awaiting_approval") });
    const res = await call(reportHandler, { query: { slug: "tharaa-shop" } });
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { error: "Audit report not found." });
    assert.equal(res.headers["cache-control"], undefined);
  });

  test("a bad slug is a 400", async () => {
    assert.equal((await call(reportHandler, { query: { slug: "../x" } })).statusCode, 400);
  });
});

describe("/api/report/edit", () => {
  const withReport = () => {
    supabaseModule.client = fakeSupabase({
      db: q => {
        if (q.op === "update") return { data: null, error: null };
        if (q.table === "report_pages") return { data: { audit_request_id: "r1", bucket: "audit-reports", storage_path: null, public_url: "u", audit_requests: { status: "awaiting_approval" } }, error: null };
        if (q.table === "audit_reports") return { data: { audit_request_id: "r1" }, error: null };
        if (q.table === "audit_findings") return { data: q.filters.id ? { id: "f1", kind: "check", audit_request_id: "r1" } : [{ id: "f1" }], error: null };
        return { data: null, error: null };
      },
    });
  };

  test("only GET and PATCH are allowed", async () => {
    assert.equal((await call(editHandler, { method: "POST", headers: { "x-api-key": "edit-key" } })).statusCode, 405);
  });

  test("a missing or wrong key is a 401", async () => {
    assert.equal((await call(editHandler, { query: { slug: "tharaa-shop" } })).statusCode, 401);
    assert.equal((await call(editHandler, { query: { slug: "tharaa-shop" }, headers: { "x-api-key": "nope" } })).statusCode, 401);
  });

  test("nobody gets in when REPORT_EDIT_API_KEY isn't set", async () => {
    delete process.env.REPORT_EDIT_API_KEY;
    assert.equal((await call(editHandler, { query: { slug: "tharaa-shop" }, headers: { "x-api-key": "" } })).statusCode, 401);
  });

  test("GET returns the report's findings", async () => {
    withReport();
    const res = await call(editHandler, { query: { slug: "tharaa-shop" }, headers: { "x-api-key": "edit-key" } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.findings, [{ id: "f1" }]);
  });

  test("PATCH updates one finding", async () => {
    withReport();
    const res = await call(editHandler, { method: "PATCH", body: { slug: "tharaa-shop", findingId: "f1", changes: { protect: "Keep it." } }, headers: { "x-api-key": "edit-key" } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(supabaseModule.client.calls.find(c => c.op === "update").fields, { protect: "Keep it." });
  });

  test("PATCH with no changes is a 400", async () => {
    withReport();
    const res = await call(editHandler, { method: "PATCH", body: { slug: "tharaa-shop", findingId: "f1", changes: {} }, headers: { "x-api-key": "edit-key" } });
    assert.equal(res.statusCode, 400);
  });
});
