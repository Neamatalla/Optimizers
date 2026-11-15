// The store owner preview fixture (owner round 1): it must show what a real
// owner audit produces, and its numbers must agree with each other, so a
// contradiction on the page comes from the report's code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerActionCategories, ownerChecklistFixture, ownerSampleFud, ownerTools, OWNER_AR_TITLE, toOwnerArabic, toOwnerEnglish } from "./preview-owner.js";
import { OWNER_STORE, ownerClarityInput, ownerGa4Metrics } from "./preview-owner-data.js";
import { personaChecklistFor } from "./persona-checklist.js";
import { PERSONA_CHECKLISTS } from "./checklist-persona-data.js";
import { buildAuditHtmlReport } from "./html-report-node.js";
import type { AuditResult } from "./types.js";

const W = OWNER_STORE.website;

test("each route uses the owner's own points, every one of them, once", () => {
  for (const mode of ["tracking", "single", "website"] as const) {
    const { categories } = ownerActionCategories(mode, W);
    for (const cat of categories) {
      const expected = personaChecklistFor("store_owner", cat.category, ownerTools(mode)).map(p => p.id);
      assert.deepEqual(cat.findings.map(f => f.checklistId), expected, `${mode} ${cat.category}`);
      assert.ok(expected.every(id => id.startsWith("SO-")));
    }
    assert.equal(categories.reduce((s, c) => s + c.checklistTally.total, 0), 50, mode);
  }
});

test("every owner point has a Gulf Arabic title, and every finding Arabic text", () => {
  const all = Object.values(PERSONA_CHECKLISTS.store_owner).flat();
  for (const p of all) assert.ok(OWNER_AR_TITLE[p.id], `no Arabic title for ${p.id}`);
  for (const mode of ["tracking", "single", "website"] as const) {
    for (const f of ownerActionCategories(mode, W).categories.flatMap(c => c.findings)) {
      assert.ok(f.ar?.business.summary && f.ar.business.detail, f.checklistId);
      if (f.status === "fail") assert.ok(f.ar.action?.step && f.ar.action.doneWhen, `${f.checklistId} action`);
    }
  }
});

test("money is in SAR, no EGP, Western digits only, no internal ids in owner text", () => {
  const { categories } = ownerActionCategories("tracking", W);
  const text = JSON.stringify(categories.flatMap(c => c.findings.map(f => [f.business, f.ar])));
  assert.doesNotMatch(text, /EGP|ج\.م|جنيه/);
  assert.doesNotMatch(text, /[٠-٩]/);
  assert.doesNotMatch(text, /\b(?:GA4|GTM|SO|MB)-[A-Z]*-?\d/);
  const fud = JSON.stringify(ownerSampleFud(W, null));
  assert.doesNotMatch(fud, /EGP|ج\.م|[٠-٩]/);
});

test("owner text for GA4 points quotes only the computed numbers", () => {
  const { categories, ga4Facts } = ownerActionCategories("tracking", W);
  const ga4 = categories.find(c => c.category === "GA4")!;
  const nums = (s: string) => (s.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map(n => n.replace(/,/g, ""));
  for (const f of ga4.findings.filter(x => x.status === "fail")) {
    const point = PERSONA_CHECKLISTS.store_owner.GA4.find(p => p.id === f.checklistId)!;
    const fact = point.factId ? ga4Facts!.facts[point.factId] : undefined;
    if (!fact || fact.status === "no_data") continue;
    // The fact sentence, plus the money range written without its rounding.
    const allowed = new Set([...nums(fact.en), "28", "14", "50", "10", "6", "3"]);
    if (fact.money) { allowed.add(String(Math.round(fact.money.low))); allowed.add(String(Math.round(fact.money.high))); }
    for (const t of [f.business.detail, f.ar!.business.detail]) {
      for (const n of nums(t)) assert.ok(allowed.has(n), `${f.checklistId}: ${n} is not in "${fact.en}"`);
    }
  }
});

test("the sample's numbers agree with each other", () => {
  const m = ownerGa4Metrics();
  const purchases = m.funnel.find(s => s.event === "purchase")!.count;
  assert.equal(purchases, m.conversions);
  assert.equal(Math.round((purchases / m.sessions) * 10000) / 100, m.conversionRate);
  const { ga4Facts } = ownerActionCategories("tracking", W);
  // Add-to-cart rate: funnel step and across the product pages, both 8%.
  assert.match(ga4Facts!.facts["GA4-02"].en, /\(8%/);
  assert.equal(ga4Facts!.facts["GA4-10"].status, "fail");
  assert.match(ga4Facts!.facts["GA4-10"].en, /against 8% across your products/);
  // Cart to checkout 41% in GA4 and in the page review.
  const fudRate = ownerSampleFud(W, ga4Facts).findings.find(f => f.funnel?.from === "add_to_cart")!.funnel!.rate;
  assert.match(ga4Facts!.facts["GA4-03"].en, /\(41%/);
  assert.equal(fudRate, 0.41);
  // The free-delivery threshold was read on the visit, not "unknown".
  assert.match(ga4Facts!.facts["GA4-11"].en, /SAR 600/);
  // Clarity: phone share within 3 points of GA4's, visits about 3/28 of GA4's.
  const c = ownerClarityInput(W);
  const clarityPhones = c.devices[0].sessions / c.sessions;
  assert.ok(Math.abs(clarityPhones - 17000 / 20000) < 0.03);
  assert.ok(Math.abs(c.sessions - (m.sessions * c.days) / 28) / c.sessions < 0.05);
});

test("the checklist fixture is reworded into owner register", () => {
  assert.equal(toOwnerArabic("اطلبيه دلوقتي، مش كده ده ١٢٠ ج.م"), "اطلبه الحين، مو كذا هذا 120 ر.س");
  assert.equal(toOwnerArabic("وده بالموبايل"), "وهذا بالجوال");
  assert.equal(toOwnerEnglish("Price LE 1,399. When paid visitors land here, the ad spend is wasted. Keep it."), "Price SAR 1,399. Keep it.");
  assert.equal(toOwnerEnglish("The ad spend is wasted."), "The ad spend is wasted.");
  const fixture = ownerChecklistFixture({ items: [{ id: "X-1", t: "زرار إزاي", x: { title: { en: "LE 5", ar: "شحن ٥" } }, crop: "data:image/png;base64,LEEGP" }] });
  assert.deepEqual(fixture, { items: [{ id: "X-1", t: "زر كيف", x: { title: { en: "SAR 5", ar: "توصيل 5" } }, crop: "data:image/png;base64,LEEGP" }] });
});

test("the owner page has its own body scope; other readers don't", async () => {
  const { categories, ga4Facts } = ownerActionCategories("tracking", W);
  const base: AuditResult = { websiteUrl: W, businessName: OWNER_STORE.name, discoveredPages: [W], categories, ga4Facts, overallScore: 0, possiblePoints: 50 };
  const owner = (await buildAuditHtmlReport({ ...base, audienceRole: "store_owner" })).html;
  assert.match(owner, /<body class="is-owner">/);
  assert.match(owner, /window\.__owner = api/);
  for (const role of ["media_buyer", "marketing_manager", "agency"] as const) {
    const html = (await buildAuditHtmlReport({ ...base, audienceRole: role })).html;
    assert.doesNotMatch(html, /is-owner|__owner/, role);
  }
});
