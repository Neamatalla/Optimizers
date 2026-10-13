import type { FudFinding, FudResult, Ga4Metrics } from "../types.js";
import { collectStoreEvidence } from "./collect.js";
import { pageOf, type StoreEvidence } from "./evidence.js";
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

  const leak = funnelLeak(ga4, rule.funnel);
  const pexti = computePexti({ status, signal, rule, judge: verdict, leak: Boolean(leak) });
  const fallback = {
    summary: `${rule.title.en}: not checked this run.`,
    detail: preUnassessed ? `We couldn't check this: ${preUnassessed}.` : "The review step returned no verdict for this check.",
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
    unassessedReason: status === "unassessed" ? preUnassessed ?? "no verdict" : undefined,
    confidence: verdict?.confidence ?? 0,
    technical: useVerdictText ? verdict.technical : fallback,
    business: useVerdictText ? verdict.business : fallback,
    recommendation: status === "warn" || status === "fail" ? verdict?.recommendation : undefined,
    exampleCopy: status === "warn" || status === "fail" ? verdict?.exampleCopy : undefined,
    evidence: { blockIds, crop: status === "unassessed" ? null : page?.crops[rule.crop] ?? page?.crops.fold ?? null },
    pexti,
    band: pexti ? band(pexti.score) : undefined,
    funnel: pexti ? leak : null,
    ar: useVerdictText ? verdict.ar : { technical: fallbackAr, business: fallbackAr },
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
      `[audit-worker] FUD collect: ${evidence.pages.filter(p => p.loaded).length}/${evidence.pages.length} pages, add-to-cart ${evidence.addToCart.ok ? "ok" : evidence.addToCart.reason ?? "skipped"}, ${evidence.blockedHits} analytics hits blocked, ${Math.round(evidence.durationMs / 1000)}s`,
    );
    if (!evidence.pages.some(p => p.loaded)) return { error: "no page could be loaded for the friction pass" };

    // Only ask the judge about rules that apply and have their page.
    const toJudge = FUD_RULES.filter(r => (!r.applies || r.applies(evidence)) && !unassessedReason(r, evidence)).map(rule => ({ rule, signal: rule.signal(evidence) }));
    const verdicts = await runJudge(evidence, toJudge, opts.ga4Metrics, opts.jobId);
    const result = assemble(evidence, verdicts, opts.ga4Metrics, opts.allowFail);
    console.log(`[audit-worker] FUD result: score ${result.score ?? "n/a"}, ${result.assessed}/${result.applicable} assessed, ${result.findings.filter(f => f.status === "fail").length} fail, ${result.findings.filter(f => f.status === "warn").length} warn`);
    return result;
  } catch (err) {
    return { error: err instanceof Error ? err.message.slice(0, 500) : String(err) };
  }
}

export function isFudResult(v: unknown): v is FudResult {
  return Boolean(v && typeof v === "object" && Array.isArray((v as FudResult).findings));
}
