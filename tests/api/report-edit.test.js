import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isAuthorized, getReportHtml, updateReportHtml } from "../../api/_lib/report-edit.js";
import { fakeSupabase, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

const PAGE = { id: "p1", slug: "tharaa-shop", storage_path: "reports/tharaa-shop/index.html", public_url: "https://optimizers.agency/audit-reports/tharaa-shop", updated_at: "2026-10-18", bucket: "audit-reports-test" };

function setup(page = PAGE) {
  return fakeSupabase({
    db: q => (q.op === "update" ? { data: null, error: null } : { data: page, error: null }),
    files: { [`audit-reports-test/${PAGE.storage_path}`]: "<h1>Old</h1>" },
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

describe("getReportHtml", () => {
  test("returns the page details and HTML, read from the row's bucket", async () => {
    const result = await getReportHtml({ supabase: setup(), bucket: "audit-reports", slug: "tharaa-shop" });
    assert.deepEqual(result, {
      status: 200,
      body: { slug: "tharaa-shop", publicUrl: PAGE.public_url, updatedAt: "2026-10-18", html: "<h1>Old</h1>" },
    });
  });

  test("bad slug, unknown slug, missing file", async () => {
    assert.equal((await getReportHtml({ supabase: setup(), bucket: "b", slug: "../x" })).status, 400);
    assert.equal((await getReportHtml({ supabase: setup(null), bucket: "b", slug: "nope" })).status, 404);
    const noFile = setup({ ...PAGE, storage_path: "gone.html" });
    assert.equal((await getReportHtml({ supabase: noFile, bucket: "b", slug: "tharaa-shop" })).status, 404);
  });
});

describe("updateReportHtml", () => {
  test("replaces the stored file and bumps updated_at", async () => {
    const supabase = setup();
    const result = await updateReportHtml({ supabase, bucket: "audit-reports", slug: " tharaa-shop ", html: "<h1>New</h1>" });
    assert.deepEqual(result, { status: 200, body: { success: true, slug: "tharaa-shop" } });
    assert.deepEqual(supabase.uploads.map(u => [u.bucket, u.path, u.body, u.options.upsert]), [["audit-reports-test", PAGE.storage_path, "<h1>New</h1>", true]]);
    const update = supabase.calls.find(c => c.op === "update");
    assert.deepEqual(update.filters, { id: "p1" });
  });

  test("rejects a bad slug or empty html without touching storage", async () => {
    const supabase = setup();
    assert.equal((await updateReportHtml({ supabase, bucket: "b", slug: "a/b", html: "<p>x</p>" })).status, 400);
    for (const html of ["", "   ", undefined, 42]) {
      assert.equal((await updateReportHtml({ supabase, bucket: "b", slug: "tharaa-shop", html })).status, 400);
    }
    assert.equal(supabase.uploads.length, 0);
  });

  test("unknown slug is a 404", async () => {
    assert.equal((await updateReportHtml({ supabase: setup(null), bucket: "b", slug: "nope", html: "<p>x</p>" })).status, 404);
  });
});
