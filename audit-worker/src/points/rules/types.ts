import type { StoreEvidence } from "../../fud/evidence.js";
import type { Ga4Facts, SiteChecks } from "../../types.js";
import type { PageSpeedResult } from "../../pagespeed.js";
import type { NetChecks } from "../net-checks.js";

/**
 * A code rule decides one master point (src/points/registry.ts) from data the
 * worker already collected. It never guesses: when the data is missing or
 * can't prove the answer, it returns "unverified" and says why.
 *
 *   pass / fail   decided, with the facts that prove it
 *   unverified    the data can't settle it (page didn't load, no GA4 access,
 *                 a failed bot click, a widget we can't read)
 *   n/a           the point doesn't apply to this store (e.g. no instalment
 *                 provider offered)
 */
export type RuleStatus = "pass" | "fail" | "unverified" | "n/a";

export interface RuleResult {
  status: RuleStatus;
  // One plain sentence with the store's own values. Templates (step 4)
  // build the report text from this and `facts`.
  reason: string;
  facts?: Record<string, string | number | boolean | string[]>;
}

// Everything a rule may read. All optional: each rule handles what's missing.
export interface RuleInput {
  ga4?: Ga4Facts | null;
  evidence?: StoreEvidence | null;
  siteChecks?: SiteChecks | null;
  pageSpeed?: PageSpeedResult | null;
  // Plain HTTP checks (points/net-checks.ts): robots.txt, hreflang, links, 404 page.
  net?: NetChecks | null;
}

export type Rule = (input: RuleInput) => RuleResult;

export const unverified = (reason: string, facts?: RuleResult["facts"]): RuleResult => ({ status: "unverified", reason, ...(facts && { facts }) });
