import type { CategoryKey, CategoryResult, ToolId } from "./types.js";

/**
 * The audit always totals exactly 50 points, but which categories fill that
 * 50 depends on which of GA4/GTM the visitor actually has — THREE possible
 * routes, never a mix beyond what's listed:
 *
 * - Visitor has BOTH GA4 and GTM → GA4 + GTM, 25 items each (checklist.ts),
 *   50 combined. Website/PageSpeed do NOT run at all on this route.
 * - Visitor has exactly ONE of GA4/GTM → that one tool's real 25-item
 *   checklist, PLUS a 21-item curated "website code" slice of the Website
 *   checklist (WEBSITE_CODE_CHECKLIST) and the full 4-item PageSpeed
 *   checklist — 25 + 21 + 4 = 50. The tool the visitor DOESN'T have is not
 *   evaluated at all (no weak detection-only guess about a tool they don't
 *   use) — its 25 slots are replaced by a real, fully-evaluable website-code
 *   audit instead (image weight, dataLayer/ecommerce, duplicate tag/event
 *   firing, consent mode, network anomalies, console errors — see
 *   checklist.ts's WEBSITE_CODE_CHECKLIST for the exact point list). This
 *   route also grants live browser access (chrome-devtools MCP — see
 *   mcp-config.ts) since most of that curated slice needs it.
 * - Visitor has NEITHER → the full Website checklist (46 items) + PageSpeed
 *   (4 items) = 50. GA4/GTM do NOT run at all on this route.
 *
 * A prior version of this function returned only the categories the visitor
 * actually selected (so a GA4-only visitor got a 25-point report), then a
 * version after that ran BOTH GA4 and GTM regardless of pick (GTM
 * detection-only off the public crawl signal when not actually connected).
 * Both were wrong: every route must total exactly 50, and a single-tool
 * visitor's other half must be a real website-code audit, not a guess about
 * a tool they don't have — that's what this version does.
 *
 * Scoring is flat: every checklist item is worth exactly 1 point, fail it
 * and that point is lost — there is no separate point-weighting layer on
 * top of the checklist (a prior version of this file had one; it's gone).
 * The checklist size IS the point scale, which is also why every route
 * totals exactly 50 items — see checklist.ts's own doc comment.
 */
export function countedCategories(tools: ToolId[]): CategoryKey[] {
  const hasGa4 = tools.includes("GA4");
  const hasGtm = tools.includes("GTM");
  if (hasGa4 && hasGtm) return ["GA4", "GTM"];
  if (hasGa4) return ["GA4", "Website", "PageSpeed"];
  if (hasGtm) return ["GTM", "Website", "PageSpeed"];
  return ["Website", "PageSpeed"];
}

/**
 * Sums the deterministic per-category tallies (audit-prompt.ts's
 * computeCategoryResult) into the run's overall check count — earned = total
 * checks that passed, possible = total checks in this run's checklists,
 * which is ALWAYS exactly 50 (computeCategoryResult hard-guarantees each
 * category's evaluated === total, no "couldn't check this one" exceptions
 * any more — see its own doc comment). NOT a 0-100 percentage, NOT rounded —
 * callers format for display, same as a category's own passed-count figure.
 *
 * Takes `categories` directly rather than re-deriving which ones counted —
 * `result.categories` only ever contains the one path's categories to begin
 * with (countedCategories() decides that upstream, before any audit runs),
 * so summing everything present here is already correct.
 */
export function computeOverallPoints(categories: CategoryResult[]): { earned: number; possible: number } {
  let earned = 0;
  let possible = 0;
  for (const cat of categories) {
    earned += cat.checklistTally.passed;
    possible += cat.checklistTally.evaluated;
  }
  return { earned, possible };
}
