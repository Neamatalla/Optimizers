import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";

/**
 * GA4 rules. The numbers and the pass/fail are already computed by
 * ga4-facts.ts (reviewed and tested); these rules only map a fact to its
 * master point. The point's rule line describes the fact's logic exactly
 * (registry.ts, "the code wins", 22 Nov 2026). A fact's no_data becomes
 * unverified, with the fact's own sentence as the reason.
 */
function fromFacts(...ids: string[]): Rule {
  return ({ ga4 }) => {
    if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
    for (const id of ids) {
      const f = ga4.facts[id];
      if (!f || f.status === "no_data") continue;
      const facts: NonNullable<RuleResult["facts"]> = { fact: id };
      if (f.money) {
        facts.moneyLow = f.money.low;
        facts.moneyHigh = f.money.high;
      }
      return { status: f.status, reason: f.en, facts };
    }
    const first = ids.map(id => ga4.facts[id]).find(Boolean);
    return unverified(first?.en ?? `GA4 fact ${ids.join("/")} not computed this run.`, { fact: ids[0] });
  };
}

/**
 * A point built from several facts (e.g. gateways AND self-referrals): any
 * fail is a fail; a pass needs every fact to pass. A mix of pass and no_data
 * is unverified, because part of the rule couldn't be checked.
 */
function allOf(...ids: string[]): Rule {
  return ({ ga4 }) => {
    if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
    const fs = ids.map(id => ga4.facts[id]).filter(Boolean);
    const failed = fs.filter(f => f.status === "fail");
    if (failed.length) return { status: "fail", reason: failed.map(f => f.en).join(" "), facts: { facts: failed.map(f => f.id) } };
    const passed = fs.filter(f => f.status === "pass");
    if (fs.length === ids.length && passed.length === ids.length) return { status: "pass", reason: passed.map(f => f.en).join(" "), facts: { facts: ids } };
    const open = ids.filter(id => ga4.facts[id]?.status !== "pass");
    return unverified(`${passed.map(f => f.en).join(" ")} ${open.map(id => ga4.facts[id]?.en ?? `${id} not computed.`).join(" ")}`.trim(), { unchecked: open });
  };
}

export const GA4_RULES: Record<string, Rule> = {
  "TRK-06": allOf("GA4-19", "GA4-P06"),
  "TRK-07": allOf("GA4-15", "GA4-P15"),
  "TRK-09": allOf("GA4-18", "GA4-P01"),
  "TRK-10": allOf("GA4-P03", "GA4-P04"),
  "TRK-22": fromFacts("GA4-10"),
  "TRK-25": allOf("GA4-08", "GA4-P09"),
  "TRK-01": fromFacts("GA4-02"),
  "TRK-02": fromFacts("GA4-03"),
  "TRK-03": fromFacts("GA4-04"),
  "TRK-04": fromFacts("GA4-07"),
  "TRK-08": fromFacts("GA4-17"),
  "TRK-20": fromFacts("GA4-05"),
  "TRK-21": fromFacts("GA4-06"),
  // P16 also checks each key event recorded data in 90 days; GA4-20 is the
  // fallback when the 90-day report isn't in the pull.
  "TRK-27": fromFacts("GA4-P16", "GA4-20"),
  "TRK-35": fromFacts("GA4-09"),
  "TRK-36": fromFacts("GA4-12"),
  "TRK-37": fromFacts("GA4-13"),
  "TRK-38": fromFacts("GA4-22"),
  "OFFER-04": fromFacts("GA4-11"),
  "TRK-45": fromFacts("GA4-23"),
  "TRK-46": fromFacts("GA4-P17"),
  "TRK-47": fromFacts("GA4-16"),
};
