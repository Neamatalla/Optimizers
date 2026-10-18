import { computeCategoryResult } from "./audit-prompt.js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, type ChecklistPoint } from "./checklist.js";
import { groupOf, ruleById } from "./fud/rules.js";
import { GROUP_OPPORTUNITY, RULE_ACTIONS } from "./fud/rule-actions.js";
import { computeGa4Facts } from "./ga4-facts.js";
import type { AuditResult, CategoryKey, CategoryResult, FudResult, Ga4Facts } from "./types.js";

/**
 * Dev-only fixtures for the action-point report (preview-report.ts): a small
 * GA4 OAuth pull run through the real ga4-facts.ts maths, and checklist
 * results built through the real computeCategoryResult, so the preview shows
 * exactly what the pipeline produces — chips, actions, hand-offs, the Action
 * plan and the GA4 → Conversion review follow-up.
 */

const rep = (rows: Array<[string[], number[]]>, currencyCode?: string) => ({
  rows: rows.map(([d, m]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(v => ({ value: String(v) })) })),
  metadata: { currencyCode },
});

export function sampleGa4OAuth() {
  return {
    details: { currencyCode: "EGP", timeZone: "Africa/Cairo" },
    retention: { eventDataRetention: "TWO_MONTHS" },
    keyEvents: [{ eventName: "purchase" }, { eventName: "page_view" }],
    googleAdsLinks: [],
    audiences: [{ displayName: "All Users" }, { displayName: "Purchasers" }],
    reportData: {
      realtime: rep([[[], [12]]]),
      weekOverWeek: rep([[["last7Days"], [5000, 40000]], [["prior7Days"], [5200, 41000]]]),
      eventVolume: rep([[["page_view"], [60000]], [["view_search_results"], [800]]]),
      totals: rep([[[], [20000, 12000, 90, 300]]], "EGP"),
      purchaseMetrics: rep([[["purchase"], [300, 330000, 300]]], "EGP"),
      funnel: rep([[["view_item"], [40000, 15000]], [["add_to_cart"], [3000, 1200]], [["begin_checkout"], [800, 492]], [["purchase"], [300, 369]]]),
      deviceConversion: rep([[["mobile"], [17000, 200, 220000, 200]], [["desktop"], [3000, 100, 110000, 100]]]),
      channels: rep([[["Paid Social"], [12000, 150]], [["Unassigned"], [3000, 20]], [["Organic Search"], [5000, 130]]]),
      newVsReturning: rep([[["new"], [15000, 180]], [["returning"], [5000, 120]]]),
      landingPages: rep([[["/collections/sale"], [3000, 2]], [["/"], [8000, 200]]]),
      pageFunnel: rep([[["/products/best-seller", "view_item"], [6000]], [["/products/best-seller", "add_to_cart"], [150]], [["/products/cream", "view_item"], [4000]], [["/products/cream", "add_to_cart"], [500]]]),
      sourceMedium: rep([[["tabby.ai", "referral"], [40, 12]], [["google", "cpc"], [3000, 60]]]),
      countryConversion: rep([[["Egypt"], [17000, 290]], [["Germany"], [1500, 0]], [["Saudi Arabia"], [1500, 10]]]),
    },
  };
}

function rawFindings(points: ChecklistPoint[], facts: Ga4Facts | null): unknown[] {
  return points.map((p, i) => {
    const fact = facts?.facts[p.id];
    const status = fact && fact.status !== "no_data" ? fact.status : i % 3 === 0 ? "fail" : "pass";
    const summary = fact?.en.split(". ")[0] ?? (status === "fail" ? `${p.title}: not in place on example.com.` : `${p.title}: in place.`);
    return {
      checklistId: p.id,
      status,
      dataSource: fact ? "live" : "detection",
      severity: p.severity,
      technical: { summary, detail: fact?.en ?? p.commonFailure },
      business: { summary, detail: fact?.en ?? (status === "fail" ? p.commonFailure : p.expectedState) },
      ...(status === "fail" ? { action: { step: p.action, owners: p.owners, doneWhen: p.doneWhen } } : { protect: `${p.expectedState} Keep it that way while the fixes above go in.` }),
    };
  });
}

export function actionCategories(mode: "tracking" | "single" | "website", website: string): { categories: CategoryResult[]; ga4Facts: Ga4Facts | null } {
  const ga4Facts = mode === "website" ? null : computeGa4Facts(sampleGa4OAuth(), website);
  const keys: CategoryKey[] = mode === "tracking" ? ["GA4", "GTM"] : mode === "single" ? ["GA4", "Website"] : ["Website"];
  const list = (k: CategoryKey) => (k === "GA4" ? GA4_CHECKLIST : k === "GTM" ? GTM_CHECKLIST : mode === "single" ? WEBSITE_CODE_CHECKLIST : WEBSITE_CHECKLIST);
  const categories = keys.map(k => computeCategoryResult({ category: k, findings: rawFindings(list(k), k === "GA4" ? ga4Facts : null) } as never, list(k), { ga4Facts }));
  return { categories, ga4Facts };
}

/** Adds the action layer to a saved or sample Conversion review result. */
export function withFudActions(fud: FudResult, ga4Facts: Ga4Facts | null): FudResult {
  const focusPage = ga4Facts?.focus.page ?? null;
  return {
    ...fud,
    findings: fud.findings.map(f => {
      const rule = ruleById(f.ruleId);
      const ra = RULE_ACTIONS[f.ruleId];
      const issue = f.status === "fail" || f.status === "warn";
      const focus = Boolean(focusPage && f.pageType === focusPage && f.status !== "unassessed");
      return {
        ...f,
        focus: focus || undefined,
        opportunity: focus && issue ? "revenue_loss" : rule ? GROUP_OPPORTUNITY[groupOf(rule)] : "revenue_gain",
        action: issue && f.recommendation && ra ? { step: f.recommendation, owners: ra.owners, doneWhen: ra.doneWhen.en } : undefined,
        ar: f.ar ? { ...f.ar, doneWhen: issue ? ra?.doneWhen.ar : undefined } : f.ar,
      };
    }),
  };
}

export function applyPreviewActions(result: AuditResult, mode: "tracking" | "single" | "website"): void {
  const { categories, ga4Facts } = actionCategories(mode, result.websiteUrl);
  result.categories = categories;
  result.ga4Facts = ga4Facts;
  result.overallScore = categories.reduce((s, c) => s + c.checklistTally.passed, 0);
  if (result.fud) result.fud = withFudActions(result.fud, ga4Facts);
}
