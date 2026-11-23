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
import { judgePoints } from "./ai-judge.js";
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

/** Runs every active point for this reader: net checks, code rules, then the AI points. */
export async function runPoints(input: PointsInput): Promise<{ results: Record<string, RuleResult>; net: NetChecks | null }> {
  let net: NetChecks | null = null;
  try {
    const pages = (input.evidence?.pages ?? []).filter(p => p.loaded && ["home", "product", "collection"].includes(p.pageType)).map(p => ({ url: p.url, type: p.pageType }));
    net = await runNetChecks({
      website: input.website,
      pages: pages.length ? pages : input.discoveredPages.slice(0, 3).map(url => ({ url })),
      paidLandingUrls: input.ga4?.focus.paidLandingUrls,
      menuLinks: menuLinksFrom(input.homeHtml, input.website),
    });
  } catch (err) {
    console.warn(`[audit-worker] Net checks failed for ${input.id}: ${err instanceof Error ? err.message : err}`);
  }

  const points = activePoints(input.role ?? "store_owner");
  const code = runRules({ ga4: input.ga4, evidence: input.evidence, siteChecks: input.siteChecks, pageSpeed: input.pageSpeed, clarity: input.clarity as any, gtm: input.gtm, net });
  const toJudge = points.filter(p => p.decidedBy !== "code");
  const ai = await judgePoints(toJudge, { website: input.website, evidence: input.evidence, ga4: input.ga4, gtm: input.gtm, siteChecks: input.siteChecks, role: input.role, adContext: input.adContext }, input.id);

  const results: Record<string, RuleResult> = {};
  for (const p of points) results[p.id] = code[p.id] ?? ai[p.id] ?? { status: "unverified", reason: "No rule ran for this point." };
  const count = (s: string) => Object.values(results).filter(r => r.status === s).length;
  console.log(`[audit-worker] Points: ${points.length} for this reader (${points.length - toJudge.length} code, ${toJudge.length} AI): ${count("pass")} pass, ${count("fail")} fail, ${count("unverified")} unverified, ${count("n/a")} n/a`);
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
