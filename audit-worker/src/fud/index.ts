import type { FudFinding, FudPageType, FudResult, FudStatus, Ga4Facts, Ga4Metrics, JobProgress } from "../types.js";
import { collectStoreEvidence } from "./collect.js";
import { buildInsights } from "./insights.js";
import { collectorFocus } from "../ga4-facts.js";
import { desktopView, pageOf, type StoreEvidence } from "./evidence.js";
import { runJudge, type JudgeVerdict } from "./judge.js";
import { audienceRoleOf, type AudienceRole } from "../audience.js";
import { FUD_RULES, groupOf, RULE_SET_VERSION, type FudRule, type SignalState } from "./rules.js";
import { GROUP_OPPORTUNITY, RULE_ACTIONS } from "./rule-actions.js";
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
  // Lets dev scripts (and poll.ts's pre-audit visit) reuse evidence instead
  // of opening a browser.
  evidence?: StoreEvidence;
  // Where to point a fresh visit (ga4-facts.ts collectorFocus).
  focus?: import("../types.js").Ga4Focus;
  // The raw GA4 reports the OAuth callback fetched (row.ga4_oauth_data), the
  // richest source for the money/segment insights. Optional.
  ga4OAuthData?: unknown;
  // Worker-computed GA4 facts (ga4-facts.ts): the page behind the worst
  // funnel step becomes the focus page — the judge is told the drop and the
  // findings there rank higher and are marked `focus`.
  ga4Facts?: Ga4Facts | null;
  // Who the report is for (audience.ts): sets the judge's business voice.
  audienceRole?: AudienceRole | null;
}

const STEP_WORDS: Record<string, string> = {
  "view_item>add_to_cart": "product page to add to cart",
  "add_to_cart>begin_checkout": "cart to checkout",
  "add_to_cart>add_shipping_info": "cart to checkout",
  "begin_checkout>purchase": "checkout to purchase",
  "add_shipping_info>purchase": "checkout to purchase",
};

/** The judge's GA4 hand-off line for the focus page, or undefined. */
export function focusLine(facts: Ga4Facts | null | undefined): string | undefined {
  const f = facts?.focus;
  if (!f?.step || !f.page) return undefined;
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  return `GA4 HAND-OFF: this store's biggest funnel leak is ${STEP_WORDS[`${f.step.from}>${f.step.to}`] ?? `${f.step.from} to ${f.step.to}`}: ${pct(f.step.rate)} against a ${pct(f.step.benchmark)} benchmark (${pct(1 - f.step.rate)} drop-off). Look hardest at the ${f.page} evidence for what causes it, and name it in the findings on that page.`;
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
export function buildFinding(rule: FudRule, verdict: JudgeVerdict | undefined, signal: SignalState, e: StoreEvidence, ga4: Ga4Metrics | null, allowFail: boolean, preUnassessed: string | null, focusPage: FudPageType | null = null): FudFinding {
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
  const focus = Boolean(focusPage && rule.pageType === focusPage && status !== "unassessed");
  const pexti = computePexti({ status, signal, rule, judge: verdict, leak: Boolean(leak) || focus });
  const fallback = {
    summary: `${rule.title.en}: not checked this run.`,
    detail: preUnassessed ? `We couldn't check this: ${preUnassessed}.` : "We couldn't confirm this from the page with enough certainty.",
  };
  const fallbackAr = {
    summary: `${rule.title.ar}: لم يتم فحصه في هذا التشغيل.`,
    detail: preUnassessed ? "تعذّر فحص هذا البند لأن الصفحة المطلوبة لم تكن متاحة." : "لم تُرجع خطوة المراجعة نتيجة لهذا البند.",
  };
  const useVerdictText = verdict && !preUnassessed;
  const issue = status === "warn" || status === "fail";
  const ra = RULE_ACTIONS[rule.id];
  const step = issue ? verdict?.recommendation : undefined;

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
    ar: useVerdictText && status !== "unassessed" && verdict.ar ? { ...verdict.ar, doneWhen: issue ? ra?.doneWhen.ar : undefined } : useVerdictText && status !== "unassessed" ? undefined : { technical: fallbackAr, business: fallbackAr },
    desktop,
    opportunity: focus && issue ? "revenue_loss" : GROUP_OPPORTUNITY[groupOf(rule)],
    action: step && ra ? { step, owners: ra.owners, doneWhen: ra.doneWhen.en } : undefined,
    focus: focus || undefined,
  };
}

export function assemble(e: StoreEvidence, verdicts: JudgeVerdict[], ga4: Ga4Metrics | null, allowFail: boolean, focusPage: FudPageType | null = null): FudResult {
  const byId = new Map(verdicts.map(v => [v.ruleId, v]));
  const findings: FudFinding[] = [];
  for (const rule of FUD_RULES) {
    if (rule.applies && !rule.applies(e)) continue;
    const verdict = byId.get(rule.id);
    if (verdict && !verdict.applicable) continue;
    findings.push(buildFinding(rule, verdict, rule.signal(e), e, ga4, allowFail, unassessedReason(rule, e), focusPage));
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
    const evidence = opts.evidence ?? (await collectStoreEvidence(opts.website, opts.discoveredPages, { focus: collectorFocus(opts.focus) }));
    console.log(
      `[audit-worker] FUD collect: ${evidence.pages.filter(p => p.loaded).length}/${evidence.pages.length} pages, add-to-cart ${evidence.addToCart.ok ? "ok" : evidence.addToCart.reason ?? "skipped"}, cart from ${pageOf(evidence, "cart")?.cart?.source ?? "nothing"}, desktop ${evidence.desktop?.filter(p => p.loaded).length ?? 0} pages, ${evidence.blockedHits} analytics hits blocked, ${Math.round(evidence.durationMs / 1000)}s`,
    );
    if (evidence.leakedHits?.length) {
      console.warn(`[audit-worker] FUD collect: ${evidence.leakedHits.length} analytics-looking request(s) were NOT blocked — add them to BLOCKED_HITS in fud/collect.ts: ${evidence.leakedHits.slice(0, 10).join(" | ")}`);
    }
    if (!evidence.pages.some(p => p.loaded)) return { error: "no page could be loaded for the friction pass" };
    const insights = buildInsights({ oauth: opts.ga4OAuthData, ga4: opts.ga4Metrics });
    const aov = insights?.aov ?? averageOrderValue(opts.ga4Metrics);
    evidence.context = { ...(evidence.context ?? {}), aov: opts.ga4Facts?.aov ?? aov ?? undefined, currency: insights?.currency ?? opts.ga4Metrics?.currency ?? null, focus: focusLine(opts.ga4Facts) };

    // Only ask the judge about rules that apply and have their page.
    const toJudge = FUD_RULES.filter(r => (!r.applies || r.applies(evidence)) && !unassessedReason(r, evidence)).map(rule => ({ rule, signal: rule.signal(evidence) }));
    const verdicts = await runJudge(evidence, toJudge, opts.ga4Metrics, opts.jobId, opts.audienceRole);
    const result = assemble(evidence, verdicts, opts.ga4Metrics, opts.allowFail, opts.ga4Facts?.focus.page ?? null);
    result.insights = insights;
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
export async function runFrictionStage(
  row: { id: string; website: string; is_test: boolean; ga4_oauth_data?: unknown; audience_role?: unknown },
  progress: JobProgress,
  save: () => Promise<void>,
  run: (opts: RunFudPassOptions) => Promise<FudResult | { error: string }> = runFudPass,
  // The store visit poll.ts already made before the audit (so the 50 checks
  // and this pass describe the same visit). Absent on a resumed run: the
  // pass then visits the store itself, pointed at the same GA4 pages.
  pre: { evidence?: StoreEvidence | null } = {},
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
      ga4Facts: progress.ga4Facts ?? null,
      evidence: pre.evidence ?? undefined,
      focus: progress.ga4Facts?.focus ?? undefined,
      audienceRole: audienceRoleOf(row.audience_role),
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
