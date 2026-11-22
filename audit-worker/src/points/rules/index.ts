import { pointById } from "../index.js";
import { FACTS_RULES } from "./facts.js";
import { GA4_RULES } from "./ga4.js";
import { VISIT_RULES } from "./visit.js";
import { SPEED_RULES } from "./speed.js";
import { ACCOUNT_RULES } from "./account.js";
import { NET_RULES } from "./net.js";
import { PROBE_RULES } from "./probes.js";
import type { Rule, RuleInput, RuleResult } from "./types.js";

export type * from "./types.js";

/** Every code rule, by master point id. */
export const RULES: Record<string, Rule> = { ...GA4_RULES, ...VISIT_RULES, ...SPEED_RULES, ...ACCOUNT_RULES, ...NET_RULES, ...PROBE_RULES, ...FACTS_RULES };

/**
 * Runs every code rule for the active points. A rule that throws is
 * reported as unverified with the error, so one bad rule never stops the rest.
 * Not wired into the audit yet (PHASE1-PLAN.md step 5).
 */
export function runRules(input: RuleInput): Record<string, RuleResult> {
  const out: Record<string, RuleResult> = {};
  for (const [id, rule] of Object.entries(RULES)) {
    if (pointById(id)?.status !== "active") continue;
    try {
      out[id] = rule(input);
    } catch (err) {
      out[id] = { status: "unverified", reason: `Rule error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  return out;
}
