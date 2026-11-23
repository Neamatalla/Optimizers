import type { AudienceRole } from "../audience.js";
import type { StoreEvidence } from "../fud/evidence.js";
import type { PageSpeedResult } from "../pagespeed.js";
import type { CategoryFinding, CategoryKey, CategoryResult, Ga4Facts, SiteChecks } from "../types.js";
import { activePoints, pointById } from "./index.js";
import type { AuditPoint, PointCategory } from "./types.js";
import { runNetChecks, sameSite, type NetChecks } from "./net-checks.js";
import { runRules } from "./rules/index.js";
import type { RuleResult } from "./rules/types.js";
import { renderFinding } from "./templates/render.js";
import { translateReasons } from "./translate-reasons.js";
import { BROWSER_MAX_POINTS, browsable, browserStepOn, investigatePoints, judgePoints } from "./ai-judge.js";
export { POINT_CATEGORY_LABELS } from "./pipeline-labels.js";

/**
 * The master-point audit (PHASE1-PLAN.md steps 5-6), behind POINTS_PIPELINE=on.
 * Code decides the code points, one AI call judges the rest, and the
 * templates write every finding in English and Arabic. The result has the
 * same shape as the old audit's categories, so the report, rows and email
 * keep working; the finding ids are master point ids.
 */

export function pointsPipelineOn(): boolean {
  return (process.env.POINTS_PIPELINE ?? "").trim().toLowerCase() === "on";
}

export interface PointsInput {
  id: string;
  website: string;
  homeHtml: string;
  discoveredPages: string[];
  evidence: StoreEvidence | null;
  ga4: Ga4Facts | null;
  gtm: unknown;
  siteChecks: SiteChecks | null;
  pageSpeed: PageSpeedResult | null;
  clarity: unknown;
  role: AudienceRole | null;
  adContext?: { text: string | null; coupon: string | null } | null;
  // The pages paid campaigns land on (ga4-facts.ts ga4Focus), for LAND-02.
  paidLandingUrls?: string[];
}

/** Same-site links inside the home page's header, nav and footer (max 15), for the dead-link check. */
export function menuLinksFrom(html: string, website: string): string[] {
  const out = new Set<string>();
  for (const block of html.matchAll(/<(header|nav|footer)\b[\s\S]*?<\/\1>/gi)) {
    for (const m of block[0].matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["']/gi)) {
      try {
        const u = new URL(m[1], website);
        if (/^https?:$/.test(u.protocol) && sameSite(u.href, website)) out.add(u.href);
      } catch {
        // not a URL
      }
      if (out.size >= 15) return [...out];
    }
  }
  return [...out];
}

// The points that read the first checkout screen's own form. A log-in page in
// front of checkout blocks them: they stay unchecked with one clear reason
// and the AI isn't asked. Points the log-in page itself can settle (guest
// option, express pay) are not in this set.
export const CHECKOUT_FORM_POINTS = new Set(["PATH-11", "PATH-12", "PATH-13", "PATH-16"]);
export const LOGIN_BLOCK_REASON = "Checkout sits behind a log-in page, so our visit couldn't see the checkout form. This point wasn't checked.";
export const LOGIN_BLOCK_REASON_AR = "صفحة الدفع خلف صفحة تسجيل دخول، فلم تستطع زيارتنا رؤية نموذج الدفع. لم يتم فحص هذه النقطة.";

/** True when our visit hit a log-in page where checkout should start. */
export function checkoutLoginBlocks(e: StoreEvidence | null): boolean {
  return Boolean(e?.pages.some(p => p.pageType === "checkout" && p.loaded && /log-in page/i.test(p.note ?? "")));
}

/** Runs every active point for this reader: net checks, code rules, then the AI points. */
export async function runPoints(input: PointsInput): Promise<{ results: Record<string, RuleResult>; net: NetChecks | null }> {
  let net: NetChecks | null = null;
  try {
    const pages = (input.evidence?.pages ?? []).filter(p => p.loaded && ["home", "product", "collection"].includes(p.pageType)).map(p => ({ url: p.url, type: p.pageType }));
    net = await runNetChecks({
      website: input.website,
      pages: pages.length ? pages : input.discoveredPages.slice(0, 3).map(url => ({ url })),
      paidLandingUrls: input.paidLandingUrls ?? input.ga4?.focus.paidLandingUrls,
      menuLinks: menuLinksFrom(input.homeHtml, input.website),
    });
  } catch (err) {
    console.warn(`[audit-worker] Net checks failed for ${input.id}: ${err instanceof Error ? err.message : err}`);
  }

  const points = activePoints(input.role ?? "store_owner");
  const code = runRules({ ga4: input.ga4, evidence: input.evidence, siteChecks: input.siteChecks, pageSpeed: input.pageSpeed, clarity: input.clarity as any, gtm: input.gtm, net });
  // The AI judges its own points, plus every code point the code couldn't
  // settle (unverified), with the code's reason as a hint. No point is dropped.
  // A code+ai point goes to the AI only when its rule is missing or unverified.
  const blocked = checkoutLoginBlocks(input.evidence);
  const isBlocked = (p: AuditPoint) => blocked && CHECKOUT_FORM_POINTS.has(p.id);
  const unsettled = (p: AuditPoint) => !code[p.id] || code[p.id].status === "unverified";
  const fallback = points.filter(p => p.decidedBy !== "ai" && unsettled(p) && !isBlocked(p));
  const toJudge = [...points.filter(p => p.decidedBy === "ai" && !isBlocked(p)), ...fallback];
  const hints = Object.fromEntries(fallback.map(p => [p.id, code[p.id]?.reason ?? "No code rule ran."]));
  const ai = await judgePoints(toJudge, { website: input.website, evidence: input.evidence, ga4: input.ga4, gtm: input.gtm, siteChecks: input.siteChecks, role: input.role, adContext: input.adContext, hints, policies: input.evidence?.policies }, input.id);

  const results: Record<string, RuleResult> = {};
  for (const p of points) {
    if (isBlocked(p)) {
      results[p.id] = { status: "unverified", reason: LOGIN_BLOCK_REASON, facts: { blockedBy: "login" }, observation: { en: LOGIN_BLOCK_REASON, ar: LOGIN_BLOCK_REASON_AR } };
      continue;
    }
    const c = code[p.id];
    const a = ai[p.id];
    // Code wins when it decided; the AI's answer fills in where it couldn't.
    if (c && c.status !== "unverified") results[p.id] = { ...c, decidedBy: "code" };
    else if (a && a.status !== "unverified") results[p.id] = { ...a, facts: c?.facts, decidedBy: "ai" };
    else results[p.id] = { ...(c ?? a ?? { status: "unverified", reason: "No rule ran for this point." }), ...(a?.observation && { observation: a.observation }) };
  }
  // Browser step: the page points still open get tested in a real browser.
  const open = browserStepOn() ? points.filter(p => browsable(p, results[p.id])) : [];
  let browsed = 0;
  if (open.length) {
    const reasons = Object.fromEntries(open.map(p => [p.id, results[p.id].observation?.en ?? results[p.id].reason]));
    const seen = await investigatePoints(open, reasons, { website: input.website, platform: input.siteChecks?.platform }, input.id);
    for (const [id, r] of Object.entries(seen)) {
      if (r.status === "unverified") continue;
      results[id] = { ...r, facts: { ...code[id]?.facts, ...r.facts }, decidedBy: "ai" };
      browsed++;
    }
  }
  // Arabic for the English-only sentences (code rules, unchecked reasons).
  const arabic = await translateReasons(results, input.id);
  const count = (s: string) => Object.values(results).filter(r => r.status === s).length;
  const byCode = points.filter(p => results[p.id].decidedBy === "code").length;
  console.log(`[audit-worker] Points: ${points.length} for this reader. Decided by code ${byCode}; sent to the AI ${toJudge.length}; browser step tried ${Math.min(open.length, BROWSER_MAX_POINTS)} of ${open.length} open and settled ${browsed}; Arabic added for ${arabic}. Result: ${count("pass")} pass, ${count("fail")} fail, ${count("unverified")} unverified, ${count("n/a")} n/a`);
  return { results, net };
}

// Report tab per point: GA4 and GTM tracking points sit with their tool,
// everything else under Website.
export function tabOf(p: AuditPoint): CategoryKey {
  if (p.category !== "tracking") return "Website";
  if (p.needs.includes("gtm") && !p.needs.includes("ga4")) return "GTM";
  if (p.needs.includes("ga4")) return "GA4";
  return "GTM";
}


const CATEGORY_ORDER: PointCategory[] = ["tracking", "buying-path", "product-page", "collection", "homepage", "navigation", "trust", "offers", "landing", "speed", "findability", "risk"];

/** The point results as report categories. n/a points are left out; unverified ones are "unassessed" (not scored). */
export function pointsToCategories(results: Record<string, RuleResult>, role: AudienceRole | null): CategoryResult[] {
  const byTab = new Map<CategoryKey, CategoryFinding[]>();
  const ids = Object.keys(results)
    .map(id => pointById(id))
    .filter((p): p is AuditPoint => Boolean(p))
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  for (const p of ids) {
    const r = results[p.id];
    if (r.status === "n/a") continue;
    const en = renderFinding(p.id, r, { role, lang: "en" });
    const ar = renderFinding(p.id, r, { role, lang: "ar" });
    const status = r.status === "pass" ? "pass" : r.status === "fail" ? "fail" : "unassessed";
    const f: CategoryFinding = {
      checklistId: p.id,
      status,
      severity: p.severity,
      dataSource: p.needs.some(n => n === "ga4" || n === "gtm" || n === "clarity") ? "live" : "public",
      technical: en.technical,
      business: en.business,
      criteria: p.rule,
      ...(p.opportunity && { opportunity: p.opportunity }),
      ar: {
        technical: ar.technical,
        business: ar.business,
        ...(ar.step && { action: { step: ar.step, doneWhen: ar.doneWhen ?? "" } }),
        ...(ar.protect && { protect: ar.protect }),
      },
    };
    if (status === "fail" && en.step) f.action = { step: en.step, doneWhen: en.doneWhen ?? "", owners: p.owners ?? [] };
    if (status === "pass" && en.protect) f.protect = en.protect;
    const tab = tabOf(p);
    byTab.set(tab, [...(byTab.get(tab) ?? []), f]);
  }
  const order: CategoryKey[] = ["GA4", "GTM", "Website"];
  return order.filter(k => byTab.has(k)).map(k => {
    const findings = byTab.get(k)!;
    const evaluated = findings.filter(f => f.status !== "unassessed").length;
    const passed = findings.filter(f => f.status === "pass").length;
    return { category: k, score: evaluated ? Math.round((passed / evaluated) * 100) : 0, checklistTally: { total: findings.length, evaluated, passed }, findings };
  });
}
