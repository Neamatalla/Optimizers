// Owner round 2: "What's costing me sales?" answered by root cause, with one
// honest count and no contradictions the owner can catch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { causeOfFud, causeOfPoint, moneyBasis, OWNER_CAUSES, ownerCauses, ownerVerdict } from "./owner-causes.js";
import { PERSONA_CHECKLISTS } from "./checklist-persona-data.js";
import { FUD_RULES } from "./fud/rules.js";
import { ownerActionCategories, ownerSampleFud } from "./preview-owner.js";
import { OWNER_STORE } from "./preview-owner-data.js";
import { buildAuditHtmlReport } from "./html-report-node.js";
import type { AuditResult, FudFinding } from "./types.js";

const W = OWNER_STORE.website;

function ownerResult(mode: "tracking" | "website" = "tracking"): AuditResult {
  const { categories, ga4Facts } = ownerActionCategories(mode, W);
  return {
    websiteUrl: W, businessName: OWNER_STORE.name, discoveredPages: [W], categories, ga4Facts,
    fud: ownerSampleFud(W, ga4Facts), overallScore: 0, possiblePoints: 50, audienceRole: "store_owner",
  };
}

const visible = (html: string) => html
  .replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<\/?(b|a|span|bdi|i|strong)(\s[^>]*)?>/g, "").replace(/<[^>]+>/g, " ")
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

test("every owner point and page-review rule has a cause", () => {
  const known = new Set(OWNER_CAUSES.map(c => c.key));
  // Two points have no root cause of their own (best hours, recordings installed).
  const loose = new Set(["SO-GA4-25", "SO-GTM-24"]);
  for (const p of Object.values(PERSONA_CHECKLISTS.store_owner).flat()) {
    const c = causeOfPoint(p.id, { from: "add_to_cart", to: "begin_checkout" });
    assert.ok(known.has(c), p.id);
    if (!loose.has(p.id)) assert.notEqual(c, "other", p.id);
  }
  for (const r of FUD_RULES) assert.notEqual(causeOfFud(r.id), "other", r.id);
});

test("the weakest step joins the cause behind it; shared ids resolve to the owner point's cause", () => {
  assert.equal(causeOfPoint("SO-GA4-01", { from: "view_item", to: "add_to_cart" }), "product");
  assert.equal(causeOfPoint("SO-GA4-01", { from: "add_to_cart", to: "begin_checkout" }), "cart_cost");
  assert.equal(causeOfPoint("SO-GA4-01", { from: "begin_checkout", to: "purchase" }), "payment");
  assert.equal(causeOfPoint("GA4-05"), "phones");
  assert.equal(causeOfPoint("GA4-19"), "credit");
  assert.deepEqual(moneyBasis("SO-GA4-05"), moneyBasis("GA4-05"));
});

test("each problem lands in exactly one cause; money is the cause's largest range, never a sum", () => {
  const r = ownerResult();
  const causes = ownerCauses(r);
  const failed = r.categories.flatMap(c => c.findings.filter(f => f.status === "fail").map(f => f.checklistId));
  const fudIssues = r.fud!.findings.filter(f => f.status === "fail" || f.status === "warn").map(f => f.ruleId);
  const placed = causes.flatMap(c => c.items.filter(i => i.kind === "point" || i.kind === "fud").map(i => i.id));
  assert.deepEqual([...placed].sort(), [...failed, ...fudIssues].sort());
  for (const c of causes) {
    const ranges = c.items.filter(i => i.money).map(i => i.money!.high);
    assert.equal(c.money?.range.high ?? 0, ranges.length ? Math.max(...ranges) : 0, c.def.key);
  }
  // Biggest money first; "other" last.
  const highs = causes.filter(c => c.def.key !== "other").map(c => c.money?.range.high ?? 0);
  assert.deepEqual(highs, [...highs].sort((a, b) => b - a));
  assert.ok(causes.findIndex(c => c.def.key === "other") === -1 || causes[causes.length - 1].def.key === "other");
});

test("the answer names the top two causes; the numbers verdict reads the right way round", () => {
  const causes = ownerCauses(ownerResult());
  const v = ownerVerdict(causes, true);
  const sales = causes.filter(c => c.def.kind === "sales");
  assert.ok(v.answer[0].toLowerCase().includes(sales[0].def.phrase[0]) && v.answer[0].includes(sales[1].def.phrase[0]));
  assert.equal(v.numbers?.word[0], "No"); // a critical counting problem
  assert.equal(ownerVerdict([], true).numbers?.word[0], "Yes");
  assert.equal(ownerVerdict([], false).numbers, null);
  assert.doesNotMatch(v.answer[0], /^Yes/);
});

test("the owner page: one count, one 'biggest', no answers section, no second score", async () => {
  const r = ownerResult();
  const html = (await buildAuditHtmlReport(r)).html;
  const text = visible(html);
  assert.doesNotMatch(html, /id="answers"/);
  assert.doesNotMatch(text, /Yes: \d+ problems? found/);
  assert.doesNotMatch(text, /Conversion score \d+\/100/);
  assert.doesNotMatch(text, /Follow-up from GA4/);
  assert.doesNotMatch(html, /class="toc-n"/);
  // "Biggest" only for the opening's one money figure (technical-voice fact
  // text from ga4-facts.ts aside).
  const business = text.replace(/Biggest leak: [^.]+\.|This is the biggest leak \(GA4-01\)\./g, "");
  assert.equal((business.match(/[Bb]iggest single figure/g) ?? []).length, 1);
  assert.doesNotMatch(business, /[Bb]iggest leak/);
  // The one count adds up: checks + page-review rules, problems = failed + issues.
  const failed = r.categories.reduce((s, c) => s + c.findings.filter(f => f.status === "fail").length, 0);
  const issues = r.fud!.findings.filter(f => f.status === "fail" || f.status === "warn").length;
  const rules = r.fud!.findings.filter(f => f.status !== "unassessed").length;
  assert.match(text, new RegExp(`We ran ${50 + rules} checks: 50 on Google Analytics and Google Tag Manager, and ${rules} on your pages`));
  assert.match(text, new RegExp(`${failed + issues} need work`));
  // One money notation: currency once per range.
  assert.match(text, /SAR 5,250–11,300/);
  assert.doesNotMatch(text.replace(/Estimated gain: SAR [\d,]+–SAR [\d,]+ a month\./g, ""), /–SAR \d/);
});

test("WhatsApp is never 'working' when our visit found a broken WhatsApp link", async () => {
  const r = ownerResult();
  const fud = r.fud!;
  const d3 = fud.findings.find(f => f.ruleId === "D3")!;
  const passing: FudFinding = { ...d3, status: "pass", business: { summary: "Shoppers can message you on WhatsApp from any page", detail: "" } };
  const result: AuditResult = {
    ...r,
    fud: { ...fud, findings: fud.findings.map(f => (f.ruleId === "D3" ? passing : f)) },
    siteChecks: {
      platform: "salla", addToCart: { attempted: true, ok: true }, atcEvents: null, soldOutPromoted: 0, heroVideoMobile: false, pagesVisited: [],
      contactLinks: [{ href: "https://wa.me/966500000000", kind: "whatsapp", valid: true }, { href: "https://wa.me/0500", kind: "whatsapp", valid: false }],
    },
  };
  const contact = ownerCauses(result).find(c => c.def.key === "contact");
  assert.ok(contact?.items.some(i => i.id === "visit-whatsapp"));
  const text = visible((await buildAuditHtmlReport(result)).html);
  const working = text.split("Already working")[1] ?? "";
  assert.doesNotMatch(working.split("Not confirmed")[0], /message you on WhatsApp/);
  assert.match(text, /1 of your 2 WhatsApp links doesn't open a chat/);
});

test("without Google Analytics: no money, no 'next audit', no false all-clear", async () => {
  const r = ownerResult("website");
  const text = visible((await buildAuditHtmlReport(r)).html);
  assert.match(text, /Google Analytics wasn't connected, so this report has no money figures/);
  assert.doesNotMatch(text, /next audit/i);
  assert.doesNotMatch(text, /No problem found/);
  assert.doesNotMatch(text, /SAR [\d,]+–[\d,]+ a month at stake/);
});
