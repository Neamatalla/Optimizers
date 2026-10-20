import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { fakeReq, fakeRes, fakeSupabase, useEnv, offlineAndQuiet, mockResend, mockSupabaseModule } from "./helpers.js";

const resend = mockResend();
const supabaseModule = mockSupabaseModule();
const { default: handler } = await import("../../api/audit-request.js");

offlineAndQuiet();
useEnv({
  SUPABASE_URL: "https://db.test",
  SUPABASE_SECRET_KEY: "service-key",
  RESEND_API_KEY: "re_test",
  AUDIT_REVIEWER_EMAIL: "reviewer@optimizers.agency",
});

const FORM = {
  tools: ["GA4", "GTM"],
  website: "https://www.shop.com/collections/all",
  email: "owner@shop.com",
  businessName: "Shop",
  role: "store_owner",
  ga4MeasurementId: "g-abc1234",
  gtmContainerId: "gtm-xyz9",
  storePlatform: "Shopify",
};

// What the fake database does on this test: an existing request for the
// site (duplicate), and/or an error on insert.
let db;
beforeEach(() => {
  db = { existing: null, insertError: null };
  resend.sent.length = 0;
  resend.result = { data: { id: "email_1" }, error: null };
  supabaseModule.client = fakeSupabase({
    db: q => {
      if (q.op === "select") return { data: db.existing, error: null };
      if (db.insertError) return { data: null, error: db.insertError };
      return { data: { id: "req_1", ...q.row }, error: null };
    },
  });
});

async function call(body, method = "POST") {
  const res = fakeRes();
  await handler(fakeReq({ method, body }), res);
  return res;
}

const inserted = () => supabaseModule.client.calls.find(c => c.op === "insert")?.row;
const lookups = () => supabaseModule.client.calls.filter(c => c.op === "select");

test("a valid request is saved as pending and the reviewer is emailed", async () => {
  const res = await call(FORM);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, message: "Audit request received. Check your inbox shortly." });

  const row = inserted();
  assert.equal(row.status, "pending");
  assert.equal(row.is_test, false);
  assert.equal(row.website_hostname, "shop.com");
  assert.equal(row.email_normalized, "owner@shop.com");
  assert.equal(row.ga4_measurement_id, "G-ABC1234");
  assert.equal(row.gtm_container_id, "GTM-XYZ9");
  assert.equal(row.audience_role, "store_owner");
  assert.equal(row.store_platform, "Shopify");
  assert.deepEqual(row.verification_methods, ["email_domain"]);

  assert.deepEqual(lookups()[0].filters, { website_hostname: "shop.com" });
  assert.equal(resend.sent.length, 1);
  assert.deepEqual(resend.sent[0].to, ["reviewer@optimizers.agency"]);
});

test("only POST is allowed", async () => {
  assert.equal((await call(FORM, "GET")).statusCode, 405);
});

test("500 when Supabase isn't configured", async () => {
  delete process.env.SUPABASE_SECRET_KEY;
  assert.equal((await call(FORM)).statusCode, 500);
});

test("each rule answers 400 with its own message", async () => {
  const cases = [
    [{ email: "-owner@shop.com", website: "-https://shop.com" }, "Please enter a valid email address."],
    [{ website: "-https://shop.com" }, "Please enter a valid website URL."],
    [{ tools: "GA4" }, "Invalid tools selection."],
    [{ tools: ["GA4", "Meta"] }, "Invalid tools selection."],
    [{ role: "ceo" }, "Please choose your role."],
    [{ website: "", email: "" }, "Website and email are required."],
    [{ email: "owner@shop" }, "Please enter a valid email address."],
    [{ website: "shop.com" }, "Please enter a valid website URL."],
    [{ website: "https://localhost" }, "Please enter a valid website URL."],
    [{ website: "https://www.amazon.ae/shop" }, /large platform or marketplace/],
    [{ ga4MeasurementId: "UA-12345" }, "A valid GA4 measurement ID is required when GA4 is selected."],
    [{ ga4MeasurementId: "" }, "A valid GA4 measurement ID is required when GA4 is selected."],
    [{ gtmContainerId: "GTM-1" }, "A valid GTM container ID is required when GTM is selected."],
  ];
  for (const [change, message] of cases) {
    const res = await call({ ...FORM, ...change });
    assert.equal(res.statusCode, 400, JSON.stringify(change));
    if (message instanceof RegExp) assert.match(res.body.error, message);
    else assert.equal(res.body.error, message, JSON.stringify(change));
  }
  assert.equal(inserted(), undefined);
});

test("missing website and email are both listed", async () => {
  const res = await call({ ...FORM, website: " ", email: "" });
  assert.deepEqual(res.body.missingFields, ["website", "email"]);
});

test("no tools and no role is fine", async () => {
  const res = await call({ website: "https://shop.com", email: "owner@shop.com", tools: [] });
  assert.equal(res.statusCode, 200);
  assert.equal(inserted().audience_role, null);
  assert.equal(inserted().ga4_measurement_id, null);
});

test("a site that already had an audit is a 409, without saving", async () => {
  db.existing = { id: "old", status: "done", created_at: "2026-10-01" };
  const res = await call(FORM);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.duplicate, "website");
  assert.match(res.body.error, /already had its free audit/);
  assert.equal(inserted(), undefined);
});

test("two submissions racing: the losing insert is also a 409", async () => {
  db.insertError = { code: "23505", message: 'duplicate key value violates unique constraint "audit_requests_website_hostname_key"' };
  const res = await call(FORM);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.duplicate, "website");
});

test("any other insert error is a 500", async () => {
  db.insertError = { code: "XX000", message: "boom" };
  const res = await call(FORM);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, "Could not queue audit request.");
});

test("test mode: saved as a test, no duplicate check, no reviewer email, same answer", async () => {
  db.existing = { id: "old", status: "done", created_at: "2026-10-01" };
  const res = await call({ ...FORM, email: "-omar@optimizers.agency", website: "-https://www.shop.com" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, message: "Audit request received. Check your inbox shortly." });
  assert.equal(inserted().is_test, true);
  assert.equal(inserted().email, "omar@optimizers.agency");
  assert.equal(inserted().website, "https://www.shop.com");
  assert.equal(lookups().length, 0);
  assert.equal(resend.sent.length, 0);
});

test("a failed reviewer email doesn't fail the request", async () => {
  resend.result = new Error("Resend down");
  assert.equal((await call(FORM)).statusCode, 200);
});

test("no Resend key: saved, nobody emailed", async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal((await call(FORM)).statusCode, 200);
  assert.equal(resend.sent.length, 0);
});

test("form values are escaped in the reviewer email", async () => {
  await call({ ...FORM, businessName: "<script>alert(1)</script>" });
  assert.doesNotMatch(resend.sent[0].html, /<script>/);
  assert.match(resend.sent[0].html, /&lt;script&gt;/);
});

const CLARITY = {
  source: "clarity",
  days: 3,
  fetchedAt: "2026-10-20T10:00:00.000Z",
  sessions: 6810,
  behaviours: { deadClicks: { sessionsPct: 3.5, pageViews: 258, count: 460 } },
  topPages: [{ url: "https://www.shop.com/products/a", visits: 3831 }],
  hostMatch: true,
};

test("a Clarity snapshot for this site is saved, rebuilt from known fields", async () => {
  await call({ ...FORM, clarityData: { ...CLARITY, injected: "x" } });
  const saved = inserted().clarity_data;
  assert.equal(saved.sessions, 6810);
  assert.equal(saved.hostMatch, true);
  assert.equal(saved.injected, undefined);
  assert.match(resend.sent[0].html, /Connected, 6810 sessions in 3 days/);
});

test("a Clarity snapshot for another site is not saved", async () => {
  await call({ ...FORM, clarityData: { ...CLARITY, topPages: [{ url: "https://other.com/", visits: 9 }] } });
  assert.equal("clarity_data" in inserted(), false);
});
