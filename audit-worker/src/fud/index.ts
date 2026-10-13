import type { FudFinding, FudResult, FudStatus, Ga4Metrics, JobProgress } from "../types.js";
import { collectStoreEvidence } from "./collect.js";
import { crawlWebsite } from "../crawl.js";
import { discoverPages } from "../discover-pages.js";
import { buildInsights } from "./insights.js";
import { desktopView, pageOf, type StoreEvidence } from "./evidence.js";
import { runJudge, type JudgeVerdict } from "./judge.js";
import { FUD_RULES, RULE_SET_VERSION, type FudRule, type SignalState } from "./rules.js";
import { band, computePexti, frictionScore, funnelLeak, gate, sortFindings } from "./score.js";

/**
 * The purchase-friction (FUD) pass: poll.ts stage 1b. Runs after the main
 * 50-check audit is saved and is never allowed to fail it — every error
 * comes back as `{ error }` and the report simply omits the section.
 * Design: audit-worker/FUD-PASS-DESIGN.md.
 */

export type FudPassMode = "off" | "test" | "all";

export function fudPassMode(): FudPassMode {
  const v = (process.env.FUD_PASS || "off").trim().toLowerCase();
  return v === "all" || v === "test" ? v : "off";
}

/** Whether stage 1b runs for this request. */
export function fudPassEnabled(row: { is_test: boolean }): boolean {
  const mode = fudPassMode();
  return mode === "all" || (mode === "test" && row.is_test);
}

export interface RunFudPassOptions {
  website: string;
  discoveredPages: string[];
  ga4Metrics: Ga4Metrics | null;
  jobId: string;
  // Real FAILs allowed (test runs, or FUD_ALLOW_FAIL=true). Otherwise every
  // FAIL ships as WARN — rollout phase 2 in the design doc.
  allowFail: boolean;
  // Lets dev scripts reuse saved evidence instead of opening a browser.
  evidence?: StoreEvidence;
  // The raw GA4 reports the OAuth callback fetched (row.ga4_oauth_data), the
  // richest source for the money/segment insights. Optional.
  ga4OAuthData?: unknown;
  // Optional competitor to benchmark with the same rules (status only).
  competitorUrl?: string | null;
}

function unassessedReason(rule: FudRule, e: StoreEvidence): string | null {
  const loaded = rule.needs.filter(t => pageOf(e, t));
  if (loaded.length === 0) {
    const page = e.pages.find(p => rule.needs.includes(p.pageType));
    return page?.note ?? `${rule.needs.join("/")} page not available`;
  }
  if (rule.pageType === "cart") {
    const cart = pageOf(e, "cart");
    if (!cart) return e.pages.find(p => p.pageType === "cart")?.note ?? "cart not available";
    if (cart.cart?.empty) return e.addToCart.reason ?? "cart was empty";
  }
  // Rules about the button area itself can't be judged without the button.
  if ((rule.id === "B1" || rule.id === "D1") && !pageOf(e, "product")?.cta) return "no Add-to-Cart button found on the product page";
  return null;
}

/** Turns one verdict into a shipped finding: gates, PEXTI, crop, funnel. */
export function buildFinding(rule: FudRule, verdict: JudgeVerdict | undefined, signal: SignalState, e: StoreEvidence, ga4: Ga4Metrics | null, allowFail: boolean, preUnassessed: string | null): FudFinding {
  const page = pageOf(e, rule.pageType) ?? e.pages.find(p => p.pageType === rule.pageType);
  const allIds = new Set(e.pages.flatMap(p => p.blocks.map(b => b.id)));
  const blockIds = (verdict?.blockIds ?? []).filter(id => allIds.has(id));

  let status = preUnassessed
    ? "unassessed"
    : verdict
      ? gate({ proposed: verdict.status, confidence: verdict.confidence, signal, validBlockIds: blockIds.length, rule, allowFail })
      : "unassessed";
  if (rule.id === "C4" && status === "fail") status = "warn";

  // Desktop comparison, detectors only: the judge reads the phone visit, so
  // this is a pointer for the reader, never a second verdict.
  let desktop: FudFinding["desktop"];
  const dv = rule.layout && status !== "unassessed" ? desktopView(e) : null;
  if (dv && rule.needs.some(t => dv.pages.some(p => p.pageType === t && p.loaded && e.desktop?.includes(p)))) {
    const rank: Record<SignalState, number | null> = { present: 2, elsewhere: 1, absent: 0, unknown: null };
    const m = rank[signal];
    const d = rank[rule.signal(dv)];
    if (m !== null && d !== null) desktop = d > m ? "better" : d < m ? "worse" : "same";
  }

  const leak = funnelLeak(ga4, rule.funnel);
  const pexti = computePexti({ status, signal, rule, judge: verdict, leak: Boolean(leak) });
  const fallback = {
    summary: `${rule.title.en}: not checked this run.`,
    detail: preUnassessed ? `We couldn't check this: ${preUnassessed}.` : "We couldn't confirm this from the page with enough certainty.",
  };
  const fallbackAr = {
    summary: `${rule.title.ar}: لم يتم فحصه في هذا التشغيل.`,
    detail: preUnassessed ? "تعذّر فحص هذا البند لأن الصفحة المطلوبة لم تكن متاحة." : "لم تُرجع خطوة المراجعة نتيجة لهذا البند.",
  };
  const useVerdictText = verdict && !preUnassessed;

  return {
    ruleId: rule.id,
    ruleVersion: RULE_SET_VERSION,
    pageType: rule.pageType,
    pageUrl: page?.url ?? null,
    status,
    unassessedReason: status === "unassessed" ? preUnassessed ?? (verdict ? "not certain enough to confirm" : "no verdict") : undefined,
    confidence: verdict?.confidence ?? 0,
    technical: useVerdictText && status !== "unassessed" ? verdict.technical : fallback,
    business: useVerdictText && status !== "unassessed" ? verdict.business : fallback,
    recommendation: status === "warn" || status === "fail" ? verdict?.recommendation : undefined,
    exampleCopy: status === "warn" || status === "fail" ? verdict?.exampleCopy : undefined,
    evidence: { blockIds, crop: status === "unassessed" ? null : page?.crops[rule.crop] ?? page?.crops.fold ?? null },
    pexti,
    band: pexti ? band(pexti.score) : undefined,
    funnel: pexti ? leak : null,
    ar: useVerdictText && status !== "unassessed" ? verdict.ar : { technical: fallbackAr, business: fallbackAr },
    desktop,
  };
}

export function assemble(e: StoreEvidence, verdicts: JudgeVerdict[], ga4: Ga4Metrics | null, allowFail: boolean): FudResult {
  const byId = new Map(verdicts.map(v => [v.ruleId, v]));
  const findings: FudFinding[] = [];
  for (const rule of FUD_RULES) {
    if (rule.applies && !rule.applies(e)) continue;
    const verdict = byId.get(rule.id);
    if (verdict && !verdict.applicable) continue;
    findings.push(buildFinding(rule, verdict, rule.signal(e), e, ga4, allowFail, unassessedReason(rule, e)));
  }

  // Crops are the heaviest part of the report: keep them for the issues the
  // reader sees first (FUD-PASS-DESIGN.md §13 — about 6 per report).
  const sorted = sortFindings(findings);
  // The same region often backs several findings (B1 and D1 are both about
  // the button area) — show it once, with the first (highest-priority) one.
  let crops = 0;
  const shown = new Set<string>();
  for (const f of sorted) {
    const crop = f.evidence.crop;
    if (!crop) continue;
    if (f.status === "pass" || shown.has(crop) || ++crops > 6) f.evidence.crop = null;
    else shown.add(crop);
  }

  const { score, assessed, applicable } = frictionScore(sorted.map(f => f.status));
  return {
    ruleSetVersion: RULE_SET_VERSION,
    viewport: "mobile",
    desktopChecked: Boolean(e.desktop?.some(p => p.loaded)),
    pagesSampled: e.pages.map(p => ({ url: p.url, pageType: p.pageType, loaded: p.loaded, note: p.note })),
    score,
    assessed,
    applicable,
    findings: sorted,
  };
}

export async function runFudPass(opts: RunFudPassOptions): Promise<FudResult | { error: string }> {
  try {
    const evidence = opts.evidence ?? (await collectStoreEvidence(opts.website, opts.discoveredPages));
    console.log(
      `[audit-worker] FUD collect: ${evidence.pages.filter(p => p.loaded).length}/${evidence.pages.length} pages, add-to-cart ${evidence.addToCart.ok ? "ok" : evidence.addToCart.reason ?? "skipped"}, cart from ${pageOf(evidence, "cart")?.cart?.source ?? "nothing"}, desktop ${evidence.desktop?.filter(p => p.loaded).length ?? 0} pages, ${evidence.blockedHits} analytics hits blocked, ${Math.round(evidence.durationMs / 1000)}s`,
    );
    if (evidence.leakedHits?.length) {
      console.warn(`[audit-worker] FUD collect: ${evidence.leakedHits.length} analytics-looking request(s) were NOT blocked — add them to BLOCKED_HITS in fud/collect.ts: ${evidence.leakedHits.slice(0, 10).join(" | ")}`);
    }
    if (!evidence.pages.some(p => p.loaded)) return { error: "no page could be loaded for the friction pass" };
    const insights = buildInsights({ oauth: opts.ga4OAuthData, ga4: opts.ga4Metrics });
    const aov = insights?.aov ?? averageOrderValue(opts.ga4Metrics);
    evidence.context = { ...(evidence.context ?? {}), aov: aov ?? undefined, currency: insights?.currency ?? opts.ga4Metrics?.currency ?? null };

    // Only ask the judge about rules that apply and have their page.
    const toJudge = FUD_RULES.filter(r => (!r.applies || r.applies(evidence)) && !unassessedReason(r, evidence)).map(rule => ({ rule, signal: rule.signal(evidence) }));
    const verdicts = await runJudge(evidence, toJudge, opts.ga4Metrics, opts.jobId);
    const result = assemble(evidence, verdicts, opts.ga4Metrics, opts.allowFail);
    result.insights = insights;
    if (opts.competitorUrl) result.competitor = await benchmarkCompetitor(opts.competitorUrl, opts.jobId, opts.allowFail);
    console.log(`[audit-worker] FUD result: score ${result.score ?? "n/a"}, ${result.assessed}/${result.applicable} assessed, ${result.findings.filter(f => f.status === "fail").length} fail, ${result.findings.filter(f => f.status === "warn").length} warn`);
    return result;
  } catch (err) {
    return { error: err instanceof Error ? err.message.slice(0, 500) : String(err) };
  }
}

/** Revenue / purchases from the GA4 summary, when both are real. */
export function averageOrderValue(ga4: Ga4Metrics | null | undefined): number | null {
  if (!ga4?.revenue || !ga4.conversions || ga4.conversions < 5) return null;
  return Math.round((ga4.revenue / ga4.conversions) * 100) / 100;
}

export function isFudResult(v: unknown): v is FudResult {
  return Boolean(v && typeof v === "object" && Array.isArray((v as FudResult).findings));
}

/**
 * poll.ts stage 1b, kept here so it can be tested without Supabase: runs the
 * pass once per request, stores the result (or `{ error }`) on the saved
 * progress, and never throws. Returns true when it ran.
 */
/**
 * The same rules on a competitor the visitor named: its own collector run
 * (one throwaway session, analytics blocked, one item in its cart) and one
 * short status-only judge call. Never throws — the comparison just goes
 * missing from the report.
 */
export async function benchmarkCompetitor(url: string, jobId: string, allowFail: boolean): Promise<FudResult["competitor"]> {
  try {
    const site = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const crawl = await crawlWebsite(site);
    const pages = await discoverPages(site, crawl.html);
    const evidence = await collectStoreEvidence(site, pages, { desktop: true });
    if (!evidence.pages.some(p => p.loaded)) return { website: site, error: "the competitor's site could not be loaded" };
    const toJudge = FUD_RULES.filter(r => (!r.applies || r.applies(evidence)) && !unassessedReason(r, evidence)).map(rule => ({ rule, signal: rule.signal(evidence) }));
    const verdicts = await runJudge(evidence, toJudge, null, `${jobId}-competitor`, { brief: true });
    const res = assemble(evidence, verdicts, null, allowFail);
    console.log(`[audit-worker] FUD competitor ${site}: score ${res.score ?? "n/a"}, ${res.assessed}/${res.applicable} assessed`);
    return {
      website: site,
      score: res.score,
      statuses: Object.fromEntries(res.findings.map(f => [f.ruleId, f.status])),
      notes: Object.fromEntries(res.findings.filter(f => f.status !== "unassessed").map(f => [f.ruleId, f.business.summary])),
    };
  } catch (err) {
    return { website: url, error: err instanceof Error ? err.message.slice(0, 300) : String(err) };
  }
}

export async function runFrictionStage(
  row: { id: string; website: string; is_test: boolean; ga4_oauth_data?: unknown },
  progress: JobProgress,
  save: () => Promise<void>,
  run: (opts: RunFudPassOptions) => Promise<FudResult | { error: string }> = runFudPass,
): Promise<boolean> {
  if (progress.fud !== undefined || !fudPassEnabled(row)) return false;
  try {
    progress.fud = await run({
      website: row.website,
      discoveredPages: progress.discoveredPages ?? [],
      ga4Metrics: progress.ga4Metrics ?? null,
      jobId: row.id,
      allowFail: row.is_test || process.env.FUD_ALLOW_FAIL === "true",
      ga4OAuthData: row.ga4_oauth_data ?? null,
      competitorUrl: progress.competitorUrl ?? null,
    });
  } catch (err) {
    progress.fud = { error: err instanceof Error ? err.message.slice(0, 500) : String(err) };
  }
  if (!isFudResult(progress.fud)) console.warn(`[audit-worker] Friction pass unavailable for ${row.id}: ${progress.fud.error}`);
  await save();
  return true;
}

/**
 * A reviewer's correction to one finding: change its status, or hide it.
 * The machine's original status is kept on the finding (first override
 * wins as `from`), the score is recomputed, and nothing else changes.
 */
export function applyOverride(result: FudResult, ruleId: string, to: FudStatus | "hidden", reason: string): FudResult {
  const id = ruleId.trim().toUpperCase();
  const target = result.findings.find(f => f.ruleId === id);
  if (!target) throw new Error(`no finding ${id} in this report (have: ${result.findings.map(f => f.ruleId).join(", ")})`);
  if (!reason.trim()) throw new Error("an override needs a reason");
  const from = target.override?.from ?? target.status;
  const findings = result.findings.map(f => {
    if (f !== target) return f;
    const next: FudFinding = { ...f, override: { from, to, reason: reason.trim(), at: new Date().toISOString() } };
    if (to === "hidden") return next;
    next.status = to;
    if (to === "pass" || to === "unassessed") {
      next.pexti = null;
      next.band = undefined;
      next.recommendation = undefined;
      next.exampleCopy = undefined;
      next.evidence = { ...f.evidence, crop: null };
    } else if (!next.pexti) {
      // Promoted to an issue by a human: that is corroboration (P 3).
      const rule = FUD_RULES.find(r => r.id === id);
      if (rule) {
        next.pexti = computePexti({ status: to, signal: to === "fail" ? "absent" : "elsewhere", rule, leak: false });
        next.band = next.pexti ? band(next.pexti.score) : undefined;
      }
    }
    return next;
  });
  const sorted = sortFindings(findings);
  const { score, assessed, applicable } = frictionScore(visibleFindings({ ...result, findings: sorted }).map(f => f.status));
  return { ...result, findings: sorted, score, assessed, applicable };
}

/** Findings the report shows: everything a reviewer hasn't hidden. */
export function visibleFindings(result: FudResult): FudFinding[] {
  return result.findings.filter(f => f.override?.to !== "hidden");
}
