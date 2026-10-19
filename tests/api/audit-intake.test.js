import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  normalizeHostname,
  parseAudienceRole,
  cleanStorePlatform,
  isUniqueViolation,
  duplicateMessage,
  findExistingAuditRequest,
  insertAuditRequest,
  auditNotifyEmail,
} from "../../api/_lib/audit-intake.js";
import { fakeSupabase, offlineAndQuiet } from "./helpers.js";

offlineAndQuiet();

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Omar@Shop.COM "), "omar@shop.com");
  assert.equal(normalizeEmail(undefined), "");
});

test("normalizeHostname reduces every form of a site to one bare hostname", () => {
  for (const input of ["https://www.Shop.com/collections/all", "http://shop.com", "shop.com", "www.shop.com:8080/?a=1", " https://SHOP.com "]) {
    assert.equal(normalizeHostname(input), "shop.com", input);
  }
});

test("normalizeHostname keeps real subdomains", () => {
  assert.equal(normalizeHostname("https://mystore.myshopify.com"), "mystore.myshopify.com");
});

test("normalizeHostname returns empty for nothing or junk", () => {
  assert.equal(normalizeHostname(""), "");
  assert.equal(normalizeHostname("http://"), "");
});

test("parseAudienceRole accepts the 4 roles and treats missing as no role", () => {
  for (const role of ["store_owner", "media_buyer", "marketing_manager", "agency"]) {
    assert.deepEqual(parseAudienceRole(role), { role, invalid: false });
  }
  for (const missing of [undefined, null, ""]) {
    assert.deepEqual(parseAudienceRole(missing), { role: null, invalid: false });
  }
});

test("parseAudienceRole rejects anything else", () => {
  assert.deepEqual(parseAudienceRole("ceo"), { role: null, invalid: true });
  assert.deepEqual(parseAudienceRole(["agency"]), { role: null, invalid: true });
});

test("cleanStorePlatform keeps short strings and drops the rest", () => {
  assert.equal(cleanStorePlatform(" Shopify "), "Shopify");
  assert.equal(cleanStorePlatform(""), null);
  assert.equal(cleanStorePlatform("x".repeat(51)), null);
  assert.equal(cleanStorePlatform({ name: "Shopify" }), null);
});

test("isUniqueViolation spots the website index and nothing else", () => {
  assert.equal(isUniqueViolation(null), null);
  assert.equal(isUniqueViolation({ code: "42703", message: "website_hostname" }), null);
  assert.equal(isUniqueViolation({ code: "23505", message: 'duplicate key value violates unique constraint "audit_requests_website_hostname_key"' }), "website");
  assert.equal(isUniqueViolation({ code: "23505", message: "other_key" }), "unknown");
});

test("duplicateMessage explains the one-audit-per-site rule", () => {
  assert.match(duplicateMessage("website"), /already had its free audit/);
  assert.match(duplicateMessage("unknown"), /already been requested/);
});

test("auditNotifyEmail prefers the env bag, then process.env, then the default", () => {
  const saved = process.env.AUDIT_REVIEWER_EMAIL;
  delete process.env.AUDIT_REVIEWER_EMAIL;
  assert.equal(auditNotifyEmail(), "omar@optimizers.agency");
  process.env.AUDIT_REVIEWER_EMAIL = "env@optimizers.agency";
  assert.equal(auditNotifyEmail(), "env@optimizers.agency");
  assert.equal(auditNotifyEmail({ AUDIT_REVIEWER_EMAIL: "bag@optimizers.agency" }), "bag@optimizers.agency");
  if (saved === undefined) delete process.env.AUDIT_REVIEWER_EMAIL;
  else process.env.AUDIT_REVIEWER_EMAIL = saved;
});

test("findExistingAuditRequest looks up by hostname", async () => {
  const row = { id: "r1", status: "done", created_at: "2026-10-01" };
  const supabase = fakeSupabase({ db: () => ({ data: row, error: null }) });
  assert.deepEqual(await findExistingAuditRequest(supabase, { websiteHostname: "shop.com" }), { reason: "website", row });
  assert.deepEqual(supabase.calls[0].filters, { website_hostname: "shop.com" });
});

test("findExistingAuditRequest returns null when there is no match or no hostname", async () => {
  const supabase = fakeSupabase();
  assert.equal(await findExistingAuditRequest(supabase, { websiteHostname: "shop.com" }), null);
  assert.equal(await findExistingAuditRequest(supabase, { websiteHostname: "" }), null);
  assert.equal(supabase.calls.length, 1);
});

test("findExistingAuditRequest throws on a database error instead of letting duplicates through", async () => {
  const supabase = fakeSupabase({ db: () => ({ data: null, error: { message: "timeout" } }) });
  await assert.rejects(findExistingAuditRequest(supabase, { websiteHostname: "shop.com" }), /Duplicate check failed/);
});

test("insertAuditRequest saves the row as given", async () => {
  const supabase = fakeSupabase({ db: q => ({ data: { id: "r1", ...q.row }, error: null }) });
  const result = await insertAuditRequest(supabase, { email: "a@b.com", audience_role: "agency" });
  assert.equal(result.data.audience_role, "agency");
  assert.equal(supabase.calls.length, 1);
});

test("insertAuditRequest retries without the role when the table rejects it", async () => {
  for (const code of ["PGRST204", "42703", "23514"]) {
    const supabase = fakeSupabase({
      db: q => ("audience_role" in q.row
        ? { data: null, error: { code, message: 'column "audience_role" problem' } }
        : { data: { id: "r1" }, error: null }),
    });
    const result = await insertAuditRequest(supabase, { email: "a@b.com", audience_role: "agency" });
    assert.equal(result.error, null, code);
    assert.equal(supabase.calls.length, 2);
    assert.equal("audience_role" in supabase.calls[1].row, false);
  }
});

test("insertAuditRequest does not retry other errors", async () => {
  const error = { code: "23505", message: "website_hostname" };
  const supabase = fakeSupabase({ db: () => ({ data: null, error }) });
  const result = await insertAuditRequest(supabase, { email: "a@b.com", audience_role: "agency" });
  assert.equal(result.error, error);
  assert.equal(supabase.calls.length, 1);
});
