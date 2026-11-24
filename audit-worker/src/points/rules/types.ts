import type { StoreEvidence } from "../../fud/evidence.js";
import type { Ga4Facts, SiteChecks } from "../../types.js";
import type { PageSpeedResult } from "../../pagespeed.js";
import type { ClaritySnapshot } from "../../clarity-facts.js";
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
  // Points the AI judges (decidedBy "code+ai" or "ai"): what it saw on this
  // store, in each report language. Templates show it through {observation};
  // everything else in the text is fixed.
  observation?: { en?: string; ar?: string };
  // Who settled it in the audit (points/pipeline.ts): the code rule, or the
  // AI (its own points, or a code point the rule couldn't settle).
  decidedBy?: "code" | "ai";
  // Unverified only: why, for the report's grouping (points/pipeline.ts).
  unchecked?: import("../../types.js").UncheckedWhy;
}

// Everything a rule may read. All optional: each rule handles what's missing.
export interface RuleInput {
  ga4?: Ga4Facts | null;
  evidence?: StoreEvidence | null;
  siteChecks?: SiteChecks | null;
  pageSpeed?: PageSpeedResult | null;
  // The raw Clarity snapshot (audit_requests.clarity_data): page rows live there.
  clarity?: ClaritySnapshot | null;
  // The GTM container export (gtm_oauth_data), read by points/gtm.ts.
  gtm?: unknown;
  // Plain HTTP checks (points/net-checks.ts): robots.txt, hreflang, links, 404 page.
  net?: NetChecks | null;
}

export type Rule = (input: RuleInput) => RuleResult;

export const unverified = (reason: string, facts?: RuleResult["facts"]): RuleResult => ({ status: "unverified", reason, ...(facts && { facts }) });
