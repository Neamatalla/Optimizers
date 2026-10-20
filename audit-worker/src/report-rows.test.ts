import test from "node:test";
import assert from "node:assert/strict";
import { fromRows, toRows, type FindingRow } from "./report-rows.js";
import type { AuditResult, CategoryFinding, FudFinding } from "./types.js";

const voice = (s: string) => ({ summary: s, detail: `${s} detail` });

function check(id: string, status: "pass" | "fail"): CategoryFinding {
  const f: CategoryFinding = { checklistId: id, status, severity: "critical", dataSource: "live", technical: voice(`${id} tech`), business: voice(`${id} biz`), opportunity: "revenue_loss", criteria: `${id} criteria` };
  if (status === "fail") f.action = { step: `Fix ${id} on the cart page now`, owners: ["dev"], doneWhen: "Rate is above 50% in GA4", money: null };
  else f.protect = `Keep ${id} as it is today.`;
  f.ar = { technical: voice("تقني"), business: voice("عمل") };
  return f;
}

function friction(ruleId: string, status: FudFinding["status"], pexti: number | null): FudFinding {
  return {
    ruleId,
    ruleVersion: "fud-2.0.0",
    pageType: "product",
    pageUrl: "https://store.example/p/1",
    status,
    confidence: 0.9,
    technical: voice(`${ruleId} tech`),
    business: voice(`${ruleId} biz`),
    evidence: { blockIds: ["b1"], crop: "https://img.example/crop.jpg" },
    pexti: pexti === null ? null : { score: pexti, P: 3, E: 3, C: 3, T: 3, I: 3 },
    opportunity: "revenue_gain",
  };
}

const result: AuditResult = {
  categories: [
    { category: "GA4", score: 50, checklistTally: { total: 2, evaluated: 2, passed: 1 }, findings: [check("GA4-01", "fail"), check("GA4-02", "pass")] },
    { category: "Website", score: 100, checklistTally: { total: 1, evaluated: 1, passed: 1 }, findings: [check("W-01", "pass")] },
  ],
  overallScore: 2,
  possiblePoints: 3,
  websiteUrl: "https://store.example",
  businessName: "Store",
  audienceRole: "media_buyer",
  discoveredPages: ["https://store.example/"],
  screenshots: { desktop: "https://img.example/d.jpg", mobile: null },
  ga4Metrics: null,
  ga4Facts: null,
  fud: {
    ruleSetVersion: "fud-2.0.0",
    viewport: "mobile",
    pagesSampled: [{ url: "https://store.example/p/1", pageType: "product", loaded: true }],
    score: null,
    assessed: 3,
    applicable: 3,
    findings: [friction("A1", "fail", 80), friction("B1", "warn", 40), friction("C1", "pass", null)],
  },
  // Only carried through, so any shape will do.
  siteChecks: { addToCart: { ok: true } } as unknown as AuditResult["siteChecks"],
  clarityFacts: { days: 3, sessions: 6810 } as unknown as AuditResult["clarityFacts"],
  generatedAt: "2026-10-20T10:00:00.000Z",
};

const request = { website: result.websiteUrl, business_name: result.businessName, audience_role: "media_buyer" };

test("rows round-trip to the same result", () => {
  const { report, findings } = toRows(result);
  assert.equal(findings.length, 6);
  const back = fromRows(request, report, findings);
  // frictionScore needs more assessed rules than this fixture has.
  assert.deepEqual(back, { ...result, pageSpeed: undefined });
});

test("scores come from the finding rows, so an edited status counts", () => {
  const { report, findings } = toRows(result);
  const edited: FindingRow[] = findings.map(r => (r.point_id === "GA4-01" ? { ...r, status: "pass" } : r));
  const back = fromRows(request, report, edited);
  assert.equal(back.overallScore, 3);
  assert.deepEqual(back.categories[0].checklistTally, { total: 2, evaluated: 2, passed: 2 });
  assert.equal(back.categories[0].score, 100);
});

test("row order doesn't matter, and categories keep their order", () => {
  const { report, findings } = toRows(result);
  const back = fromRows(request, report, [...findings].reverse());
  assert.deepEqual(back.categories.map(c => c.category), ["GA4", "Website"]);
  assert.deepEqual(back.fud?.findings.map(f => f.ruleId), ["A1", "B1", "C1"]);
});

test("no friction section stays null", () => {
  const { report, findings } = toRows({ ...result, fud: null });
  assert.equal(report.friction, null);
  assert.equal(fromRows(request, report, findings).fud, null);
});

test("old results that listed failed checks only keep their counts", () => {
  // Before 2026-09-06 passes had no finding: GA4 passed 17 of 25 with 1 row,
  // and GTM passed all 25 with none.
  const old: AuditResult = {
    ...result,
    categories: [
      { category: "GA4", score: 68, checklistTally: { total: 25, evaluated: 25, passed: 17 }, findings: [check("GA4-01", "fail")] },
      { category: "GTM", score: 100, checklistTally: { total: 25, evaluated: 25, passed: 25 }, findings: [] },
    ],
    overallScore: 42,
    possiblePoints: 50,
  };
  const { report, findings } = toRows(old);
  const back = fromRows(request, report, findings);
  assert.deepEqual(back.categories, old.categories);
  assert.equal(back.overallScore, 42);
});

test("rows saved before category_tallies existed still count from the rows", () => {
  const { report, findings } = toRows(result);
  const back = fromRows(request, { ...report, category_tallies: null }, findings);
  assert.deepEqual(back.categories, result.categories);
});
