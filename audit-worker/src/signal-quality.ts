import type { HitParams, StoreEvidence } from "./fud/evidence.js";

/**
 * Pixel signal quality (round 19): for each ad platform the store's pixels
 * talk to, did each funnel step send its event, and did the event carry what
 * the platform needs to optimize on it (value, currency, product IDs, an
 * event ID for server-side dedup)? Read from the hits our phone visit
 * blocked, so nothing reached the client's data. Purchase is never tested:
 * we place no orders.
 */

export type SignalStep = "view" | "cart" | "checkout";
export type SignalField = "value" | "currency" | "items" | "eventId";

export interface SignalCell {
  step: SignalStep;
  // The event the platform expects at this step.
  expect: string;
  // "untested": our visit didn't reach the step (cart stayed empty, checkout
  // didn't open), so nothing can be said about it.
  status: "sent" | "missing" | "untested";
  // Names actually sent at this step, when they weren't the expected one.
  other?: string[];
  // What the expected event carried; only on "sent".
  has?: Partial<Record<SignalField, boolean>>;
  value?: number;
  currency?: string;
  // How many times the expected event fired for one action.
  count?: number;
  userData?: boolean;
  // Untested because this platform's pixel sent nothing at all at this step.
  silent?: boolean;
}

export interface SignalVendor {
  vendor: string;
  label: string;
  cells: SignalCell[];
  // 0–100 over the steps we could test.
  score: number | null;
}

export interface SignalIssue {
  vendor: string;
  step: SignalStep | null;
  kind: "missing" | "no_value" | "no_currency" | "no_items" | "no_event_id" | "twice" | "value_mismatch" | "currency_mismatch";
}

export interface SignalQuality {
  vendors: SignalVendor[];
  // Over every tested cell of every vendor.
  score: number | null;
  issues: SignalIssue[];
  // Which steps our visit reached.
  reached: Record<SignalStep, boolean>;
  // Checkout sent our visit to a log-in page first.
  checkoutLogin?: boolean;
}

const VENDORS: Array<{ key: string; label: string; events: Record<SignalStep, string[]>; fields: SignalField[] }> = [
  { key: "meta", label: "Meta", events: { view: ["ViewContent"], cart: ["AddToCart"], checkout: ["InitiateCheckout"] }, fields: ["value", "currency", "items", "eventId"] },
  { key: "ga4", label: "GA4", events: { view: ["view_item"], cart: ["add_to_cart"], checkout: ["begin_checkout"] }, fields: ["value", "currency", "items"] },
  { key: "tiktok", label: "TikTok", events: { view: ["ViewContent"], cart: ["AddToCart"], checkout: ["InitiateCheckout"] }, fields: ["value", "currency", "items", "eventId"] },
  { key: "snap", label: "Snap", events: { view: ["VIEW_CONTENT"], cart: ["ADD_CART"], checkout: ["START_CHECKOUT"] }, fields: [] },
];
export const SIGNAL_STEPS: SignalStep[] = ["view", "cart", "checkout"];

type Hit = { vendor: string; name: string; q?: HitParams };

function hasField(q: HitParams | undefined, f: SignalField): boolean {
  if (!q) return false;
  if (f === "value") return typeof q.value === "number" && q.value > 0;
  if (f === "currency") return Boolean(q.currency);
  if (f === "items") return (q.items ?? 0) > 0;
  return Boolean(q.eventId);
}

/** The hits sent while one step happened: product-page load, the Add-to-Cart click, checkout load. Null when the visit didn't reach it. */
function windowHits(e: StoreEvidence, step: SignalStep): Hit[] | null {
  if (step === "view") return e.pages.some(p => p.pageType === "product" && p.loaded) ? (e.pageHits ?? []).filter(h => h.page === "product") : null;
  if (step === "cart") return e.addToCart.ok && e.addToCart.clickAdded !== false && e.addToCart.via !== "api" ? e.atcHits ?? null : null;
  // A log-in page in place of checkout (collect.ts notes it) is not a
  // checkout: nothing there can be judged (regal-honey.com, 2026-11-02).
  return e.pages.some(p => p.pageType === "checkout" && p.loaded && !behindLogin(p.note)) ? (e.pageHits ?? []).filter(h => h.page === "checkout") : null;
}

/**
 * A step's hits, plus its own events that arrived during a later step.
 * Shopify's app pixels queue events and send them late, often after the next
 * action started (tharaa.shop, 2026-11-02: the full view_item came after the
 * Add-to-Cart tap, the full add_to_cart while checkout loaded). They are still
 * that step's events, so they are judged with it.
 */
function stepHits(e: StoreEvidence, step: SignalStep): Hit[] | null {
  const own = windowHits(e, step);
  if (!own) return null;
  // Later steps, then the pages the visit opens after checkout (collection,
  // landing pages): a step's own events can arrive that late.
  const after = (e.pageHits ?? []).filter(h => h.page === "collection" || h.page === "landing");
  const later = [...SIGNAL_STEPS.slice(SIGNAL_STEPS.indexOf(step) + 1).flatMap(s => windowHits(e, s) ?? []), ...after];
  const names = new Set(VENDORS.flatMap(v => v.events[step]));
  return [...own, ...later.filter(h => names.has(h.name))];
}

const behindLogin = (note?: string) => /log-in page/i.test(note ?? "");

export function signalQualityFrom(e: StoreEvidence, storeCurrency?: string | null): SignalQuality | null {
  // Evidence from before round 19 has no hit parameters: nothing to grade.
  const all = [...(e.pageHits ?? []), ...(e.atcHits ?? [])];
  if (!all.length || !all.some(h => h.q) && !e.atcHits) return null;
  const steps = Object.fromEntries(SIGNAL_STEPS.map(s => [s, stepHits(e, s)])) as Record<SignalStep, Hit[] | null>;
  const used = VENDORS.filter(v => all.some(h => h.vendor === v.key));
  if (!used.length) return null;

  const issues: SignalIssue[] = [];
  let pts = 0, max = 0;
  const vendors = used.map(v => {
    let vp = 0, vm = 0;
    const cells: SignalCell[] = SIGNAL_STEPS.map(step => {
      const expect = v.events[step][0];
      const hits = steps[step];
      if (!hits) return { step, expect, status: "untested" };
      // A pixel that sent nothing at all while the step happened (not even a
      // PageView) hadn't loaded for our visit: that's not proof the store
      // skips the event (tharaa.shop run 3, 2026-11-02: Meta silent on home
      // and product in one of four visits). Not tested, never "missing".
      const heard = [...(step === "cart" ? windowHits(e, "view") ?? [] : []), ...(windowHits(e, step) ?? []), ...hits].some(h => h.vendor === v.key);
      if (!heard) return { step, expect, status: "untested", silent: true };
      const mine = hits.filter(h => h.vendor === v.key);
      const hit = mine.filter(h => v.events[step].includes(h.name));
      // Weight: the event itself is worth as much as all its fields together.
      const weight = 1 + (v.fields.length ? 1 : 0);
      vm += weight;
      if (!hit.length) {
        issues.push({ vendor: v.key, step, kind: "missing" });
        const other = [...new Set(mine.map(h => h.name))];
        return { step, expect, status: "missing", ...(other.length && { other }) };
      }
      const q = hit.find(h => h.q)?.q;
      const has = Object.fromEntries(v.fields.map(f => [f, hasField(q, f)])) as Partial<Record<SignalField, boolean>>;
      const got = v.fields.filter(f => has[f]).length;
      // A doubled event inflates every count built on it: it costs half the
      // event's worth.
      vp += 1 + (v.fields.length ? got / v.fields.length : 0) - (hit.length > 1 ? 0.5 : 0);
      for (const f of v.fields) if (!has[f]) issues.push({ vendor: v.key, step, kind: f === "value" ? "no_value" : f === "currency" ? "no_currency" : f === "items" ? "no_items" : "no_event_id" });
      if (hit.length > 1) issues.push({ vendor: v.key, step, kind: "twice" });
      if (q?.currency && storeCurrency && q.currency.toUpperCase() !== storeCurrency.toUpperCase()) issues.push({ vendor: v.key, step, kind: "currency_mismatch" });
      return {
        step, expect, status: "sent", has, count: hit.length,
        ...(q?.value !== undefined && { value: q.value }),
        ...(q?.currency && { currency: q.currency }),
        ...(q?.userData && { userData: true }),
      };
    });
    pts += vp; max += vm;
    return { vendor: v.key, label: v.label, cells, score: vm ? Math.round((vp / vm) * 100) : null };
  });

  // Platforms that disagree on the value of the same step: one of them is
  // reporting the wrong revenue to its bidding.
  for (const step of SIGNAL_STEPS) {
    const vals = vendors.flatMap(v => v.cells.filter(c => c.step === step && typeof c.value === "number" && c.value > 0).map(c => ({ vendor: v.vendor, value: c.value! })));
    if (vals.length < 2) continue;
    const lo = Math.min(...vals.map(x => x.value)), hi = Math.max(...vals.map(x => x.value));
    if (hi > lo * 1.02) issues.push({ vendor: vals.find(x => x.value === hi)!.vendor, step, kind: "value_mismatch" });
  }

  return {
    vendors,
    score: max ? Math.round((pts / max) * 100) : null,
    issues,
    reached: { view: Boolean(steps.view), cart: Boolean(steps.cart), checkout: Boolean(steps.checkout) },
    ...(e.pages.some(p => p.pageType === "checkout" && behindLogin(p.note)) && { checkoutLogin: true }),
  };
}
