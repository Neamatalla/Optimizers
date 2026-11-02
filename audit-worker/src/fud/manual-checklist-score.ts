import type { FudPageType, ManualChecklistResult, ManualShownVerdict, ManualVerdict } from "../types.js";
import type { StoreEvidence } from "./evidence.js";
import { MANUAL_CHECKPOINTS, type ManualCheckpoint, type ManualImportance, type ManualTab } from "./manual-checklist-data.js";

/**
 * The browser-safe half of the CRO manual checklist (no Claude, no Node):
 * which tabs run on which captured pages, and the sheet's Score Summary
 * maths. The report imports this; manual-checklist.ts adds the reviewer.
 */

export type { ManualChecklistResult, ManualShownVerdict, ManualVerdict };
export type ManualItemResult = ManualChecklistResult["items"][number];

// Bump when the prompt, the verdict scale or the write-up shape changes.
export const MANUAL_CHECKLIST_VERSION = "manual-2026-11-02b";

// Which captured pages each tab is judged on. Every tab is in the engine;
// a tab whose pages the visit didn't capture (today: checkout, the
// thank-you page, ad landing pages) simply produces no checkpoints.
const TAB_PAGES: Record<ManualTab, FudPageType[]> = {
  "Sitewide & Header": ["home", "collection", "product", "cart"],
  "Homepage": ["home"],
  "Collection Page": ["collection"],
  "Product Page": ["product"],
  "Cart Drawer & Cart": ["cart"],
  "Mobile": ["home", "product", "cart"],
  "Trust & Social Proof": ["home", "product"],
  "Pricing, Offers & Urgency": ["product", "cart"],
  "Copy & Messaging": ["home", "product"],
  // Round 19: the first checkout screen (nothing typed) and the pages paid
  // campaigns land on (from GA4). Thank-you pages need a real order: never run.
  "Checkout": ["checkout"],
  "Thank You & Post-Purchase": [],
  "Landing Pages": ["landing"],
};

// The reviewer's one-letter codes.
export const CODES: Record<string, ManualVerdict> = { W: "well", A: "adequate", B: "badly", N: "missing", X: "na", U: "unknown" };
// The sheet's Points column: well 3, adequately 2, badly 1, not implemented 0.
export const VERDICT_POINTS: Record<ManualShownVerdict, number> = { well: 3, adequate: 2, badly: 1, missing: 0 };
export const IMPORTANCE_ORDER: Record<ManualImportance, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
// Worst first inside one importance level.
export const VERDICT_ORDER: Record<ManualShownVerdict, number> = { missing: 0, badly: 1, adequate: 2, well: 3 };

export function pagesForTab(tab: ManualTab): FudPageType[] {
  return TAB_PAGES[tab];
}

/** Checkpoints whose pages were captured (at least one page of the tab loaded). */
export function runnableCheckpoints(e: StoreEvidence): ManualCheckpoint[] {
  const loaded = new Set(e.pages.filter(p => p.loaded).map(p => p.pageType));
  return MANUAL_CHECKPOINTS.filter(c => pagesForTab(c.tab).some(p => loaded.has(p)));
}

/** Only verdicts the report may show; "doesn't apply" and "can't tell" never are. */
export function isShown(v: ManualVerdict): v is ManualShownVerdict {
  return v === "well" || v === "adequate" || v === "badly" || v === "missing";
}

export function checkpointById(id: string): ManualCheckpoint | undefined {
  return MANUAL_CHECKPOINTS.find(c => c.id === id);
}

export interface TabScore {
  tab: ManualTab;
  // Checkpoints judged on this store (the ones the report shows).
  judged: number;
  counts: Record<ManualShownVerdict, number>;
  // Points earned ÷ points possible, 0-100; null when nothing was judged.
  score: number | null;
  criticalFailing: number;
}

/** The sheet's Score Summary, per tab (in sheet order) and in total. Only judged checkpoints count. */
export function scoreChecklist(result: ManualChecklistResult): { tabs: TabScore[]; total: TabScore } {
  const byId = new Map(result.items.map(i => [i.id, i]));
  const zero = (): Record<ManualShownVerdict, number> => ({ well: 0, adequate: 0, badly: 0, missing: 0 });
  const make = (tab: ManualTab, list: ManualCheckpoint[]): TabScore => {
    const counts = zero();
    let earned = 0, judged = 0, critical = 0;
    for (const c of list) {
      const r = byId.get(c.id);
      if (!r || !isShown(r.v)) continue;
      judged++;
      counts[r.v]++;
      earned += VERDICT_POINTS[r.v];
      if (c.importance === "Critical" && (r.v === "badly" || r.v === "missing")) critical++;
    }
    return { tab, judged, counts, score: judged ? Math.round((earned / (judged * 3)) * 100) : null, criticalFailing: critical };
  };
  const tabs = [...new Set(MANUAL_CHECKPOINTS.map(c => c.tab))].map(tab => make(tab, MANUAL_CHECKPOINTS.filter(c => c.tab === tab)));
  const counts = zero();
  let judged = 0, critical = 0;
  for (const t of tabs) {
    judged += t.judged; critical += t.criticalFailing;
    for (const k of Object.keys(counts) as ManualShownVerdict[]) counts[k] += t.counts[k];
  }
  const earned = counts.well * 3 + counts.adequate * 2 + counts.badly;
  return { tabs, total: { tab: "Homepage", judged, counts, score: judged ? Math.round((earned / (judged * 3)) * 100) : null, criticalFailing: critical } };
}
