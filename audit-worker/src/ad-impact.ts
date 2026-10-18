// Which way each checklist point moves ROAS and CAC: a direction, never a
// value. The audit sees GA4 and GTM, not the ad accounts, so it can't know
// spend, and so can't compute ROAS or CAC. What the store's data does show is
// how a problem changes them:
//
//   performance   a post-click leak. Fixing it converts more of the same paid
//                 clicks: ROAS up, CAC down.
//   aov           fixing it raises order value: ROAS up, CAC unchanged.
//   cost          paid clicks wasted right now (traffic that can't buy, sold-out
//                 products advertised): CAC up until fixed.
//   inflated      sales counted twice / non-sales counted: reported ROAS reads
//                 higher than real, so losing campaigns get scaled.
//   deflated      sales missed or credited elsewhere: reported ROAS reads lower
//                 than real, winning campaigns get cut, the algorithm learns
//                 from fewer sales.
//   optimization  weaker signal for targeting and bidding: fixing it raises
//                 ROAS and lowers CAC over time.
//
// Points with no honest single direction (security, SEO, accessibility,
// privacy, consent defaults, team-visit filters, currency/timezone, stray
// IDs) have no entry: no chip, no claim. The size of a performance
// estimate comes from the GA4 money range against the store's own revenue
// (adEffectSize) — still a band, not a ROAS figure.
//
// Used for the readers judged on ROAS/CAC (audience.ts AD_EFFECT_ROLES):
// a chip on each failed point in the report, and one line per checklist point
// in the audit prompt so Claude's words say the same thing.

import type { AudienceRole } from "./audience.js";
import type { AuditResult, FindingAction } from "./types.js";

export type AdEffect = "performance" | "aov" | "cost" | "inflated" | "deflated" | "optimization";

export const AD_EFFECT: Readonly<Record<string, AdEffect>> = {
  // GA4: funnel and landing pages
  "GA4-01": "performance", "GA4-02": "performance", "GA4-03": "performance", "GA4-04": "performance",
  "GA4-05": "performance", "GA4-06": "performance", "GA4-07": "performance", "GA4-10": "performance",
  "GA4-11": "aov", "GA4-12": "optimization", "GA4-13": "performance", "GA4-16": "optimization",
  "GA4-09": "cost",
  // GA4: data quality
  "GA4-08": "deflated", "GA4-14": "optimization", "GA4-15": "deflated", "GA4-17": "optimization",
  "GA4-18": "deflated", "GA4-19": "deflated", "GA4-20": "inflated", "GA4-21": "optimization",
  // GTM
  "GTM-01": "inflated", "GTM-02": "deflated", "GTM-03": "inflated", "GTM-04": "deflated",
  "GTM-05": "deflated", "GTM-06": "optimization", "GTM-07": "inflated", "GTM-08": "optimization",
  "GTM-11": "deflated", "GTM-12": "optimization", "GTM-14": "deflated", "GTM-21": "deflated",
  "GTM-22": "performance", "GTM-24": "deflated", "GTM-25": "deflated",
  // Website
  "W-01": "performance", "W-02": "performance", "W-03": "performance", "W-04": "performance",
  "W-05": "cost", "W-06": "cost", "W-07": "performance", "W-08": "cost",
  "W-09": "performance", "W-10": "performance", "W-11": "performance", "W-12": "performance",
  "W-13": "performance", "W-14": "performance", "W-15": "performance", "W-16": "performance", "W-17": "performance",
  "W-18": "performance", "W-19": "performance", "W-20": "performance",
  "W-21": "deflated", "W-22": "deflated", "W-23": "deflated", "W-24": "inflated", "W-25": "deflated",
  "W-26": "deflated", "W-28": "deflated", "W-44": "performance",
};

/** Readers judged on ROAS/CAC: they get the chips and the prompt lines. */
export const AD_EFFECT_ROLES: ReadonlySet<AudienceRole> = new Set(["media_buyer", "marketing_manager", "agency"]);

export function adEffectOf(checklistId: string): AdEffect | null {
  return AD_EFFECT[checklistId] ?? null;
}

/** The sentence Claude gets for the point (direction only). */
export const AD_EFFECT_PROMPT: Record<AdEffect, string> = {
  performance: "fixing it converts more of the same paid clicks: ROAS goes up, CAC goes down",
  aov: "fixing it raises order value: ROAS goes up at the same CAC",
  cost: "right now it wastes paid clicks on visits that can't buy: CAC is higher than it needs to be",
  inflated: "right now sales or conversions are over-counted: reported ROAS reads higher than real, so losing campaigns can look like winners",
  deflated: "right now sales are missed or credited to the wrong source: reported ROAS reads lower than real, winning campaigns can get cut and the algorithm learns from fewer sales",
  optimization: "it weakens the signal for targeting and bidding: fixing it raises ROAS and lowers CAC over time",
};

/**
 * Chip text. `metrics` (ROAS/CAC with arrows) is shown left-to-right in both
 * languages, isolated from the Arabic label so the arrows keep their order.
 */
export const AD_EFFECT_CHIP: Record<AdEffect, { en: string; ar: string; metrics: string }> = {
  performance: { en: "Fixing:", ar: "بعد الإصلاح:", metrics: "ROAS ↑ · CAC ↓" },
  aov: { en: "Fixing:", ar: "بعد الإصلاح:", metrics: "AOV ↑ → ROAS ↑" },
  cost: { en: "Now: wasted clicks,", ar: "الآن: نقرات مهدرة،", metrics: "CAC ↑" },
  inflated: { en: "Now: reported", ar: "الآن:", metrics: "ROAS ↑ too high" },
  deflated: { en: "Now: reported", ar: "الآن:", metrics: "ROAS ↓ too low" },
  optimization: { en: "Fixing: better targeting,", ar: "بعد الإصلاح: استهداف أدق،", metrics: "ROAS ↑ · CAC ↓" },
};

/**
 * One estimated sentence per effect, added to a failed finding's business
 * detail when Claude's text never says which way ROAS/CAC moves
 * (ensureAdDirection). Translated with the rest of the finding.
 */
export const AD_EFFECT_SENTENCE: Record<AdEffect, string> = {
  performance: "Estimated effect: fixing it converts more of the same paid clicks, so ROAS goes up and CAC goes down.",
  aov: "Estimated effect: a higher order value on the same paid clicks raises ROAS at the same CAC.",
  cost: "Estimated effect: until it's fixed, part of the ad budget buys clicks that can't convert, so CAC stays higher than it needs to be.",
  inflated: "Estimated effect: reported ROAS reads higher than real until this is fixed, so a losing campaign can look like a winner.",
  deflated: "Estimated effect: reported ROAS reads lower than real until this is fixed, so a winning campaign can look weak and the algorithm learns from fewer sales.",
  optimization: "Estimated effect: fixing it gives the ad platforms a better signal to target and bid on, so ROAS should rise and CAC fall over time.",
};

const MENTIONS_AD_METRIC = /\b(ROAS|CAC|CPA|CPP|CVR|MER)\b|conversion rate/i;

/**
 * For readers judged on ROAS/CAC: a failed point with an ad effect whose
 * business text never names ROAS, CAC, CPA, CVR or conversion rate gets the
 * effect's estimated sentence appended to its detail. Deterministic, no
 * extra Claude call; returns how many findings were completed.
 */
export function ensureAdDirection(categories: Array<{ findings: Array<{ checklistId: string; status: string; business: { summary: string; detail: string } }> }>, role: AudienceRole | null | undefined): number {
  if (!role || !AD_EFFECT_ROLES.has(role)) return 0;
  let added = 0;
  for (const cat of categories) {
    for (const f of cat.findings) {
      if (f.status !== "fail") continue;
      const effect = adEffectOf(f.checklistId);
      if (!effect || MENTIONS_AD_METRIC.test(`${f.business.summary} ${f.business.detail}`)) continue;
      f.business.detail = `${f.business.detail.trim()} ${AD_EFFECT_SENTENCE[effect]}`.trim();
      added++;
    }
  }
  return added;
}

export type AdEffectSize = "small" | "moderate" | "large";

export const AD_EFFECT_SIZE_LABEL: Record<AdEffectSize, { en: string; ar: string }> = {
  small: { en: "small", ar: "صغير" },
  moderate: { en: "moderate", ar: "متوسط" },
  large: { en: "large", ar: "كبير" },
};

/**
 * Size band for a performance/AOV point with a GA4 money range: the middle of
 * the range against the store's own monthly revenue, i.e. roughly how much
 * more revenue the same ad spend would bring. Under 3% small, under 10%
 * moderate, else large. Null without a money range or revenue.
 */
export function adEffectSize(money: FindingAction["money"], result: Pick<AuditResult, "ga4Facts" | "ga4Metrics">): AdEffectSize | null {
  if (!money) return null;
  const revenue = result.ga4Facts?.revenue ?? result.ga4Metrics?.revenue ?? null;
  const days = result.ga4Facts?.periodDays ?? result.ga4Metrics?.periodDays ?? 28;
  if (!revenue || revenue <= 0 || !days) return null;
  const monthly = (revenue * 30) / days;
  const share = (money.low + money.high) / 2 / monthly;
  return share < 0.03 ? "small" : share < 0.1 ? "moderate" : "large";
}
