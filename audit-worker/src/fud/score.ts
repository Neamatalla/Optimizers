import type { FudBand, FudFinding, FudPexti, FudStatus, Ga4Metrics } from "../types.js";
import type { FudRule, SignalState } from "./rules.js";

/**
 * Everything here is deterministic: the judge proposes a status and text,
 * this file decides what actually ships. Pure functions, unit-tested in
 * score.test.ts.
 */

// A FAIL needs at least this much judge confidence AND the detectors'
// agreement; a PASS needs this much or it becomes a WARN.
export const FAIL_CONFIDENCE = 0.85;
export const PASS_CONFIDENCE = 0.7;
// Below either, the section shows findings but no score.
export const MIN_ASSESSED = 5;
export const MIN_COVERAGE = 0.6;

export interface GateInput {
  proposed: FudStatus;
  confidence: number;
  signal: SignalState;
  // Cited block ids that actually exist in the evidence.
  validBlockIds: number;
  rule: Pick<FudRule, "autoFail">;
  // Live runs start with FAIL shown as WARN (rollout phase 2); test runs and
  // FUD_ALLOW_FAIL=true allow real FAILs.
  allowFail: boolean;
}

/** The judge proposes, code decides. See FUD-PASS-DESIGN.md §5. */
export function gate(input: GateInput): FudStatus {
  const { proposed, confidence, signal, validBlockIds, rule, allowFail } = input;
  if (proposed === "unassessed") return "unassessed";

  if (proposed === "fail") {
    // The detectors found the thing: the judge missed it or is being harsh.
    if (signal === "present" || signal === "elsewhere") return "warn";
    if (!rule.autoFail || !allowFail) return "warn";
    // Judgement-only rules (signal unknown) never auto-fail either.
    if (signal !== "absent" || confidence < FAIL_CONFIDENCE) return "warn";
    return "fail";
  }

  if (proposed === "pass") {
    if (validBlockIds === 0) return "warn";
    if (confidence < PASS_CONFIDENCE) return "warn";
    // Detectors found nothing at all where the judge claims a pass.
    if (signal === "absent" && confidence < FAIL_CONFIDENCE) return "warn";
    return "pass";
  }

  return "warn";
}

export function frictionScore(statuses: FudStatus[]): { score: number | null; assessed: number; applicable: number } {
  const pass = statuses.filter(s => s === "pass").length;
  const warn = statuses.filter(s => s === "warn").length;
  const fail = statuses.filter(s => s === "fail").length;
  const assessed = pass + warn + fail;
  const applicable = statuses.length;
  if (assessed < MIN_ASSESSED || applicable === 0 || assessed / applicable < MIN_COVERAGE) {
    return { score: null, assessed, applicable };
  }
  return { score: Math.round((100 * (pass + 0.5 * warn)) / assessed), assessed, applicable };
}

// Step rates below these count as a leak at that step. Deliberately
// conservative, event-count based (GA4 funnel counts are events, not users).
export const FUNNEL_BENCHMARK: Record<string, number> = {
  "view_item>add_to_cart": 0.08,
  "add_to_cart>begin_checkout": 0.5,
  "begin_checkout>purchase": 0.5,
};

export function funnelLeak(
  ga4: Ga4Metrics | null | undefined,
  step: FudRule["funnel"],
): FudFinding["funnel"] {
  if (!ga4 || !step) return null;
  const count = (event: string) => ga4.funnel.find(s => s.event === event)?.count;
  const from = count(step.from);
  const to = count(step.to);
  if (!from || to === undefined || from < 50) return null; // too little data to mean anything
  const rate = to / from;
  const benchmark = FUNNEL_BENCHMARK[`${step.from}>${step.to}`];
  if (benchmark === undefined || rate >= benchmark) return null;
  return { from: step.from, to: step.to, rate: Math.round(rate * 1000) / 1000 };
}

export function pextiScore(f: Omit<FudPexti, "score">): number {
  const s = f.P + 0.8 * f.E + 0.6 * f.C + 0.6 * f.T + f.I;
  return Math.round((100 * (s - 4)) / 16);
}

export function band(score: number): FudBand {
  if (score >= 75) return "quick_win";
  if (score >= 50) return "dev_task";
  return "test_first";
}

const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

/**
 * P from evidence strength, E/C/T from the rule (judge may only lower each
 * by one), I from the rule plus one when GA4 shows the leak.
 */
export function computePexti(input: {
  status: FudStatus;
  signal: SignalState;
  rule: Pick<FudRule, "E" | "C" | "T" | "I">;
  judge?: { E?: number; C?: number; T?: number };
  leak: boolean;
}): FudPexti | null {
  const { status, signal, rule, judge, leak } = input;
  if (status !== "fail" && status !== "warn") return null;
  const agrees = status === "fail" ? signal === "absent" : signal === "absent" || signal === "elsewhere";
  const P = clamp((agrees ? 3 : 2) + (leak ? 1 : 0));
  const lowerOnly = (def: number, j?: number) => (j !== undefined && Number.isFinite(j) && j === def - 1 ? clamp(j) : def);
  const E = lowerOnly(rule.E, judge?.E);
  const C = lowerOnly(rule.C, judge?.C);
  const T = lowerOnly(rule.T, judge?.T);
  const I = clamp(rule.I + (leak ? 1 : 0));
  return { score: pextiScore({ P, E, C, T, I }), P, E, C, T, I };
}

const STATUS_ORDER: Record<FudStatus, number> = { fail: 0, warn: 0, pass: 1, unassessed: 2 };

/** Display order: issues by PEXTI (FAIL before WARN on ties), then passes, then unassessed. */
export function sortFindings(findings: FudFinding[]): FudFinding[] {
  return [...findings].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    const p = (b.pexti?.score ?? -1) - (a.pexti?.score ?? -1);
    if (p !== 0) return p;
    return (a.status === "fail" ? 0 : 1) - (b.status === "fail" ? 0 : 1);
  });
}
