import type { StoreEvidence } from "./fud/evidence.js";
import { formatMoney, formatPct, fromOAuth, rowsOf, salesIn, STEP_BENCHMARKS, type Normalized } from "./fud/insights.js";
import { freeShippingThreshold } from "./fud/rules-cro.js";
import type { FudPageType, Ga4Fact, Ga4Facts, Ga4Focus, Ga4Metrics, Handoff } from "./types.js";

/**
 * The GA4 action points' numbers and verdicts, computed by code from the raw
 * GA4 reports the OAuth callback fetched (api/_lib/google-oauth.js). The
 * audit prompt quotes these facts instead of doing its own maths, the
 * Conversion review is pointed at the page behind the worst funnel step, and
 * the report and email reuse the same money ranges — one set of numbers for
 * the whole audit. Same data in, same result out.
 *
 * Every threshold is in one place below. Money is always a range: closing
 * 10%–25% of the gap to the benchmark, never more than 10% of monthly
 * revenue for one point. (Was 25–50% and 30% until 2026-10-15: a store doing
 * SAR 4.8M a month was told one point was worth SAR 723K–1.45M a month, a
 * number owners and buyers would not believe or forward.)
 */

const LOW_SHARE = 0.1;
const HIGH_SHARE = 0.25;
const MAX_REVENUE_SHARE = 0.1;
const TRACKING_GAP = 0.3;
const MIN_SESSIONS = 300;
const MOBILE_FLOOR = 0.6;
const LANDING_FLOOR = 1 / 3;
const CAMPAIGN_FLOOR = 0.25;
const UNKNOWN_SOURCE_MAX = 0.1;
const DROP_ALERT = 0.4;

const STEP_LABEL: Record<string, string> = {
  view_item: "viewed a product",
  add_to_cart: "added to cart",
  begin_checkout: "started checkout",
  add_shipping_info: "entered shipping details",
  add_payment_info: "entered payment details",
  purchase: "bought",
};
const STEP_NAME: Record<string, string> = {
  "view_item>add_to_cart": "product page to add to cart",
  "add_to_cart>begin_checkout": "cart to checkout",
  "add_to_cart>add_shipping_info": "cart to checkout",
  "begin_checkout>purchase": "checkout to purchase",
  "add_shipping_info>purchase": "checkout to purchase",
};
// The page a shopper is on when each step loses them. Checkout itself is
// never automated, so a checkout leak points at the cart, where shipping
// cost, payment options and trust are first shown.
const STEP_PAGE: Record<string, FudPageType> = {
  "view_item>add_to_cart": "product",
  "add_to_cart>begin_checkout": "cart",
  "add_to_cart>add_shipping_info": "cart",
  "begin_checkout>purchase": "cart",
  "add_shipping_info>purchase": "cart",
};

const GATEWAY = /tabby|tamara|paymob|paypal|fawry|valu\b|stripe|payfort|amazon\s*payment|hyperpay|moyasar|tap\.company|telr|geidea|kashier|checkout\.com|paytabs|myfatoorah|knet|sadad|cybersource|3dsecure|acs\./i;
const PII = /(@|%40)[a-z0-9.-]+\.[a-z]{2,}|[?&](e-?mail|phone|mobile|tel|whatsapp)=[^&]{4,}/i;
const NOISE_KEY_EVENTS = new Set(["page_view", "scroll", "session_start", "first_visit", "user_engagement", "click", "view_item", "form_start"]);
const DEFAULT_AUDIENCES = /^(all users|purchasers)$/i;
const NOT_A_CAMPAIGN = /^\((not set|organic|direct|referral|none|data deleted)\)$/i;

const MARKETS: Record<string, { currency: string; offset: number }> = {
  Egypt: { currency: "EGP", offset: 2 },
  "Saudi Arabia": { currency: "SAR", offset: 3 },
  "United Arab Emirates": { currency: "AED", offset: 4 },
  Kuwait: { currency: "KWD", offset: 3 },
  Qatar: { currency: "QAR", offset: 3 },
  Bahrain: { currency: "BHD", offset: 3 },
  Oman: { currency: "OMR", offset: 4 },
  Jordan: { currency: "JOD", offset: 3 },
  Iraq: { currency: "IQD", offset: 3 },
  Morocco: { currency: "MAD", offset: 1 },
};
const TZ_OFFSET: Record<string, number> = {
  "Africa/Cairo": 2, "Asia/Riyadh": 3, "Asia/Kuwait": 3, "Asia/Qatar": 3, "Asia/Bahrain": 3, "Asia/Baghdad": 3, "Asia/Amman": 3, "Europe/Istanbul": 3,
  "Asia/Dubai": 4, "Asia/Muscat": 4, "Africa/Casablanca": 1,
};
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYPART = [
  { name: "night (0–6h)", from: 0, to: 6 },
  { name: "morning (6–12h)", from: 6, to: 12 },
  { name: "afternoon (12–18h)", from: 12, to: 18 },
  { name: "evening (18–24h)", from: 18, to: 24 },
];

const n0 = (v: number) => Math.round(v).toLocaleString("en-US");

/** Report rows with a sales count each, or null when sales can't be read (polluted key events). */
function withSales(ctx: Ctx, report: unknown): Array<{ dims: string[]; vals: number[]; sales: number }> | null {
  const rows = rowsOf(report);
  const out: Array<{ dims: string[]; vals: number[]; sales: number }> = [];
  for (const r of rows) {
    const sales = salesIn(r.vals, ctx.d.keyEventsClean);
    if (sales === null) return null;
    out.push({ ...r, sales });
  }
  return out;
}

/** The "can't read sales here" fact, pointing at GA4-20. */
function pollutedFact(ctx: Ctx, id: string, what: string): Ga4Fact {
  return {
    id,
    status: "no_data",
    en: `Sales ${what} can't be read: GA4 counts ${n0(ctx.d.keyEvents ?? 0)} key events against ${n0(ctx.d.purchases ?? 0)} real purchases, because non-purchase events are marked as key events (GA4-20). Fix GA4-20 first.`,
    handoff: { kind: "check", id: "GA4-20" },
  };
}
const pct = formatPct;

interface Ctx {
  d: Normalized;
  rd: Record<string, unknown>;
  oauth: Record<string, unknown>;
  origin: string | null;
  cr: number | null;
  aov: number | null;
  monthly: number | null;
  evidence: StoreEvidence | null;
}

function originOf(website: string): string | null {
  try {
    return new URL(/^https?:\/\//.test(website) ? website : `https://${website}`).origin;
  } catch {
    return null;
  }
}

function pageTypeOfPath(path: string): FudPageType | null {
  if (/\/products?\/[^/]+/i.test(path)) return "product";
  if (/\/(collections?|categor(y|ies)|product-category|shop)\/[^/]+/i.test(path)) return "collection";
  if (path === "/" || path === "") return "home";
  return null;
}

function urlOf(ctx: Ctx, path: string): string | undefined {
  if (!ctx.origin || !path || path.startsWith("(")) return undefined;
  try {
    return new URL(path, ctx.origin).toString();
  } catch {
    return undefined;
  }
}

/** A low–high range, both capped; when the cap flattens it, low becomes half of high. */
function capped(ctx: Ctx, low: number, high: number): Ga4Fact["money"] {
  const cap = ctx.monthly! * MAX_REVENUE_SHARE;
  const h = Math.min(cap, high);
  const l = Math.min(low, h);
  return { low: l >= h ? h / 2 : l, high: h, currency: ctx.d.currency };
}

/** Money range from extra purchases per 28 days, capped. */
function moneyFromPurchases(ctx: Ctx, extraLow: number, extraHigh: number): Ga4Fact["money"] {
  if (!ctx.aov || !ctx.monthly || extraHigh <= 0) return null;
  const scale = 30 / ctx.d.periodDays;
  return capped(ctx, extraLow * ctx.aov * scale, extraHigh * ctx.aov * scale);
}

/** Money range from lifting one funnel step part of the way to its benchmark. */
function moneyFromStep(ctx: Ctx, rate: number, benchmark: number): Ga4Fact["money"] {
  if (!ctx.monthly || rate <= 0 || rate >= benchmark) return null;
  const lift = (share: number) => ctx.monthly! * ((rate + share * (benchmark - rate)) / rate - 1);
  return capped(ctx, lift(LOW_SHARE), lift(HIGH_SHARE));
}

function moneyText(m: Ga4Fact["money"]): string {
  return m ? ` Estimated gain: ${formatMoney(m.low, m.currency)}–${formatMoney(m.high, m.currency)} a month.` : "";
}

interface Step {
  key: string;
  from: string;
  to: string;
  a: number;
  b: number;
  rate: number;
  benchmark: number;
  state: "pass" | "fail" | "gap" | "no_data";
  money: Ga4Fact["money"];
}

function step(ctx: Ctx, from: string, to: string, funnel: Normalized["funnel"] = ctx.d.funnel): Step | null {
  const byEvent = new Map(funnel.map(s => [s.event, s.count]));
  const key = `${from}>${to}`;
  const benchmark = STEP_BENCHMARKS[key];
  if (!benchmark || !byEvent.has(from)) return null;
  const a = byEvent.get(from) ?? 0;
  const b = byEvent.get(to) ?? 0;
  if (!byEvent.has(to)) return { key, from, to, a, b: 0, rate: 0, benchmark, state: a >= 50 ? "gap" : "no_data", money: null };
  if (a < 50) return { key, from, to, a, b, rate: b / Math.max(a, 1), benchmark, state: "no_data", money: null };
  const rate = b / a;
  // More people at the later step than the earlier one, or a step far under
  // its benchmark: an event that doesn't fire, not real shopper behaviour.
  if (b > a * 1.05 || rate < benchmark * TRACKING_GAP) return { key, from, to, a, b, rate, benchmark, state: "gap", money: null };
  if (rate >= benchmark) return { key, from, to, a, b, rate, benchmark, state: "pass", money: null };
  return { key, from, to, a, b, rate, benchmark, state: "fail", money: moneyFromStep(ctx, rate, benchmark) };
}

function steps(ctx: Ctx, funnel: Normalized["funnel"] = ctx.d.funnel): { browse: Step | null; cart: Step | null; checkout: Step | null } {
  const has = (e: string) => funnel.some(s => s.event === e);
  return {
    browse: step(ctx, "view_item", "add_to_cart", funnel),
    cart: has("begin_checkout") || !has("add_shipping_info") ? step(ctx, "add_to_cart", "begin_checkout", funnel) : step(ctx, "add_to_cart", "add_shipping_info", funnel),
    checkout: has("begin_checkout") ? step(ctx, "begin_checkout", "purchase", funnel) : step(ctx, "add_shipping_info", "purchase", funnel),
  };
}

function stepSentence(s: Step): string {
  return `Of ${n0(s.a)} people who ${STEP_LABEL[s.from]}, ${n0(s.b)} ${STEP_LABEL[s.to]} (${pct(s.rate)}, benchmark ${pct(s.benchmark)}): a ${pct(1 - s.rate)} drop-off.`;
}

function stepFact(id: string, s: Step | null, handoff?: Handoff): Ga4Fact {
  if (!s || s.state === "no_data") return { id, status: "no_data", en: s ? `Too few people reached this step in 28 days to judge (${n0(s.a)}).` : "This step's events are not in the GA4 data." };
  if (s.state === "gap") {
    return {
      id,
      status: "fail",
      en: s.b === 0
        ? `${n0(s.a)} people ${STEP_LABEL[s.from]}, but GA4 records no "${s.to}" event at all, so this step can't be measured. Fix the tracking first (GA4-17).`
        : `${stepSentence(s)} That is so far under the benchmark that the "${s.to}" event is most likely not firing; fix the tracking first (GA4-17), then judge the page.`,
      handoff: { kind: "check", id: "GA4-17" },
    };
  }
  if (s.state === "pass") return { id, status: "pass", en: `${stepSentence(s)} At or above the benchmark.` };
  return { id, status: "fail", en: `${stepSentence(s)}${moneyText(s.money)}`, money: s.money, handoff };
}

// ---------------------------------------------------------------------------

function deviceFact(ctx: Ctx, focusPage: FudPageType | null): Ga4Fact {
  const mobile = ctx.d.devices.find(x => x.name === "mobile");
  const desktop = ctx.d.devices.find(x => x.name === "desktop");
  if (!mobile || !desktop || mobile.purchases === null || desktop.purchases === null || mobile.sessions < 200 || desktop.sessions < 200 || !desktop.purchases) {
    return { id: "GA4-05", status: "no_data", en: "Not enough visits with sales on both phone and desktop to compare." };
  }
  const m = mobile.purchases / mobile.sessions;
  const dk = desktop.purchases / desktop.sessions;
  const line = `Phones convert at ${pct(m)} (${n0(mobile.sessions)} visits) against ${pct(dk)} on desktop (${n0(desktop.sessions)} visits): phones are at ${Math.round((m / dk) * 100)}% of desktop.`;
  if (m >= dk * MOBILE_FLOOR) return { id: "GA4-05", status: "pass", en: `${line} Within the 60% bar.` };
  const gap = dk * MOBILE_FLOOR - m;
  const money = moneyFromPurchases(ctx, mobile.sessions * gap * LOW_SHARE, mobile.sessions * gap * HIGH_SHARE);
  return { id: "GA4-05", status: "fail", en: `${line}${moneyText(money)}`, money, handoff: { kind: "cro", page: focusPage ?? "product" } };
}

function landingFact(ctx: Ctx): { fact: Ga4Fact; url?: string; page?: FudPageType } {
  const { cr } = ctx;
  if (!ctx.d.segmentSales) return { fact: pollutedFact(ctx, "GA4-06", "by landing page") };
  if (!cr || !ctx.d.landing.length || !ctx.d.sessions) return { fact: { id: "GA4-06", status: "no_data", en: "No landing-page data with sales to compare." } };
  const minSessions = Math.max(200, ctx.d.sessions * 0.03);
  const weak = ctx.d.landing
    .filter(l => !l.path.startsWith("(") && l.sessions >= minSessions && l.purchases / l.sessions < cr * LANDING_FLOOR)
    .sort((a, b) => b.sessions - a.sessions)[0];
  if (!weak) return { fact: { id: "GA4-06", status: "pass", en: `No landing page with ${n0(minSessions)}+ visits converts under a third of the store average (${pct(cr)}).` } };
  const wcr = weak.purchases / weak.sessions;
  const money = moneyFromPurchases(ctx, weak.sessions * (cr / 2 - wcr) * 0.5, weak.sessions * (cr / 2 - wcr));
  const url = urlOf(ctx, weak.path);
  const page = pageTypeOfPath(weak.path) ?? undefined;
  return {
    fact: {
      id: "GA4-06",
      status: "fail",
      en: `${weak.path} is the first page for ${n0(weak.sessions)} visits in 28 days and converts at ${pct(wcr)}, against a store average of ${pct(cr)} (${weak.purchases} sales).${moneyText(money)}`,
      money,
      handoff: page && page !== "home" ? { kind: "cro", page, url } : undefined,
    },
    url,
    page,
  };
}

function campaignFact(ctx: Ctx): { fact: Ga4Fact; url?: string } {
  const rows = withSales(ctx, ctx.rd.campaignLanding);
  if (rows === null) return { fact: pollutedFact(ctx, "GA4-07", "by campaign") };
  if (!rows.length) return { fact: { id: "GA4-07", status: "no_data", en: "No campaign data in this GA4 pull." } };
  const paid = rows.filter(r => /paid|display|cross-network|affiliates/i.test(r.dims[1] ?? "") && !NOT_A_CAMPAIGN.test(r.dims[0] ?? ""));
  if (!paid.length) return { fact: { id: "GA4-07", status: "pass", en: "No paid campaigns with tracked visits in the last 28 days." } };
  const byCampaign = new Map<string, { sessions: number; conv: number; landing: Map<string, number> }>();
  for (const r of paid) {
    const c = byCampaign.get(r.dims[0]) ?? { sessions: 0, conv: 0, landing: new Map() };
    c.sessions += r.vals[0];
    c.conv += r.sales;
    c.landing.set(r.dims[2], (c.landing.get(r.dims[2]) ?? 0) + r.vals[0]);
    byCampaign.set(r.dims[0], c);
  }
  const cr = ctx.cr ?? 0;
  const minSessions = Math.max(150, (ctx.d.sessions ?? 0) * 0.02);
  const worst = [...byCampaign.entries()]
    .filter(([, c]) => c.sessions >= minSessions && c.conv / c.sessions < cr * CAMPAIGN_FLOOR)
    .sort((a, b) => b[1].sessions - a[1].sessions)[0];
  if (!worst) return { fact: { id: "GA4-07", status: "pass", en: `No paid campaign with ${n0(minSessions)}+ visits converts under a quarter of the store average.` } };
  const [name, c] = worst;
  const landing = [...c.landing.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const url = urlOf(ctx, landing);
  const page = pageTypeOfPath(landing);
  return {
    fact: {
      id: "GA4-07",
      status: "fail",
      en: `Paid campaign "${name}" brought ${n0(c.sessions)} visits in 28 days and ${n0(c.conv)} sales (${pct(c.conv / c.sessions)} vs ${pct(cr)} store average). Its main landing page is ${landing || "unknown"}.`,
      handoff: page && page !== "home" ? { kind: "cro", page, url } : undefined,
    },
    url: page && page !== "home" ? url : undefined,
  };
}

function unknownSourceFact(ctx: Ctx): Ga4Fact {
  // Visits only, so this works even when sales by channel can't be read.
  const chans = rowsOf(ctx.rd.channels).map(r => ({ name: r.dims[0], sessions: r.vals[0] }));
  const total = chans.reduce((s, c) => s + c.sessions, 0);
  if (!total) return { id: "GA4-08", status: "no_data", en: "No channel data." };
  const unknown = chans.filter(c => /^(unassigned|\(not set\)|\(other\))$/i.test(c.name)).reduce((s, c) => s + c.sessions, 0);
  const share = unknown / total;
  const line = `${pct(share)} of visits (${n0(unknown)} of ${n0(total)}) have no known source.`;
  return { id: "GA4-08", status: share > UNKNOWN_SOURCE_MAX ? "fail" : "pass", en: share > UNKNOWN_SOURCE_MAX ? `${line} Budget decisions on those visits are guesses.` : `${line} Under the 10% bar.` };
}

function countryFact(ctx: Ctx): Ga4Fact {
  const all = withSales(ctx, ctx.rd.countryConversion);
  if (all === null) return pollutedFact(ctx, "GA4-09", "by country");
  const rows = all.filter(r => r.dims[0] && r.dims[0] !== "(not set)");
  if (!rows.length) return { id: "GA4-09", status: "no_data", en: "No country data with conversions in this GA4 pull." };
  const total = rows.reduce((s, r) => s + r.vals[0], 0);
  const top = [...rows].sort((a, b) => b.vals[0] - a.vals[0])[0];
  const dead = rows.filter(r => r !== top && r.vals[0] / total >= 0.03 && r.sales === 0);
  const deadShare = dead.reduce((s, r) => s + r.vals[0], 0) / total;
  if (deadShare < 0.05) return { id: "GA4-09", status: "pass", en: `Countries with a real share of visits also produce sales; ${top.dims[0]} brings ${pct(top.vals[0] / total)} of visits.` };
  return {
    id: "GA4-09",
    status: "fail",
    en: `${dead.map(r => `${r.dims[0]} (${n0(r.vals[0])} visits)`).join(", ")} brought ${pct(deadShare)} of visits in 28 days and zero sales.`,
  };
}

function productFact(ctx: Ctx): { fact: Ga4Fact; url?: string } {
  const rows = rowsOf(ctx.rd.pageFunnel);
  const byPath = new Map<string, { views: number; adds: number }>();
  for (const r of rows) {
    const p = byPath.get(r.dims[0]) ?? { views: 0, adds: 0 };
    if (r.dims[1] === "view_item") p.views += r.vals[0];
    if (r.dims[1] === "add_to_cart") p.adds += r.vals[0];
    byPath.set(r.dims[0], p);
  }
  const viewed = [...byPath.entries()].filter(([path, p]) => p.views > 0 && pageTypeOfPath(path) === "product");
  if (viewed.length < 2) return { fact: { id: "GA4-10", status: "no_data", en: "No per-product view and add-to-cart data in this GA4 pull." } };
  const views = viewed.reduce((s, [, p]) => s + p.views, 0);
  const adds = viewed.reduce((s, [, p]) => s + p.adds, 0);
  const avg = adds / views;
  const minViews = Math.max(100, views * 0.02);
  const worst = viewed
    .filter(([, p]) => p.views >= minViews && p.adds / p.views < avg * 0.5)
    .sort((a, b) => b[1].views * (avg - b[1].adds / b[1].views) - a[1].views * (avg - a[1].adds / a[1].views))[0];
  if (!worst) return { fact: { id: "GA4-10", status: "pass", en: `No product with ${n0(minViews)}+ views adds to cart at under half the store average (${pct(avg)}).` } };
  const [path, p] = worst;
  const rate = p.adds / p.views;
  const addToBuy = ctx.d.purchases && adds ? Math.min(1, ctx.d.purchases / Math.max(adds, 1)) : 0;
  const gapAdds = p.views * (avg - rate);
  const money = moneyFromPurchases(ctx, gapAdds * LOW_SHARE * addToBuy, gapAdds * HIGH_SHARE * addToBuy);
  const url = urlOf(ctx, path);
  return {
    fact: {
      id: "GA4-10",
      status: "fail",
      en: `${path} was viewed ${n0(p.views)} times in 28 days and added to cart ${n0(p.adds)} times (${pct(rate)}), against ${pct(avg)} across your products.${moneyText(money)}`,
      money,
      handoff: { kind: "cro", page: "product", url },
    },
    url,
  };
}

function thresholdFact(ctx: Ctx): Ga4Fact {
  if (!ctx.aov) return { id: "GA4-11", status: "no_data", en: "No average order value in the GA4 data." };
  const aovText = formatMoney(ctx.aov, ctx.d.currency);
  if (!ctx.evidence) return { id: "GA4-11", status: "no_data", en: `Average order value is ${aovText}. The store's pages weren't visited this run, so the free-shipping threshold is unknown.` };
  const threshold = freeShippingThreshold(ctx.evidence);
  if (threshold === null) return { id: "GA4-11", status: "no_data", en: `Average order value is ${aovText}. No free-shipping threshold was found on the pages we visited.` };
  const ratio = threshold / ctx.aov;
  const line = `Free shipping starts at ${formatMoney(threshold, ctx.d.currency)}, ${ratio.toFixed(2)}× your average order value of ${aovText}.`;
  if (ratio >= 1.1 && ratio <= 1.6) return { id: "GA4-11", status: "pass", en: `${line} That nudges orders up without feeling out of reach.` };
  return {
    id: "GA4-11",
    status: "fail",
    en: ratio < 1.1 ? `${line} Most orders already qualify, so it gives margin away without lifting order value.` : `${line} It is too far for most shoppers to try for.`,
    handoff: { kind: "cro", page: "cart" },
  };
}

function returningFact(ctx: Ctx): Ga4Fact {
  if (!ctx.d.segmentSales) return pollutedFact(ctx, "GA4-12", "for new vs returning visitors");
  const nv = ctx.d.newVsReturning.find(x => x.name === "new");
  const rv = ctx.d.newVsReturning.find(x => x.name === "returning");
  if (!nv || !rv || nv.sessions < 200 || rv.sessions < 50 || !nv.purchases) return { id: "GA4-12", status: "no_data", en: "Not enough new and returning visits with sales to compare." };
  const n = nv.purchases / nv.sessions;
  const r = rv.purchases / rv.sessions;
  const ratio = r / n;
  const line = `Returning visitors convert at ${pct(r)} against ${pct(n)} for new ones (${ratio.toFixed(1)}×; a healthy store sees about 2×).`;
  const capture = ctx.evidence?.pages.some(p => p.facts?.capture.email || p.facts?.capture.phone);
  if (ratio >= 2) return { id: "GA4-12", status: "pass", en: line };
  if (!ctx.evidence) return { id: "GA4-12", status: "no_data", en: `${line} The store's pages weren't visited this run, so email/WhatsApp capture is unknown.` };
  if (capture) return { id: "GA4-12", status: "pass", en: `${line} The site already asks for an email or phone number, so the gap is in what is sent afterwards.` };
  return { id: "GA4-12", status: "fail", en: `${line} No email or WhatsApp signup was found on the pages we visited.`, handoff: { kind: "cro", page: "home" } };
}

function searchFact(ctx: Ctx): Ga4Fact {
  const terms = rowsOf(ctx.rd.searchTerms).filter(r => r.dims[0] && r.dims[0] !== "(not set)").sort((a, b) => b.vals[0] - a.vals[0]);
  const events = rowsOf(ctx.rd.eventVolume).filter(r => r.dims[0] === "view_search_results" || r.dims[0] === "search").reduce((s, r) => s + r.vals[0], 0);
  const home = ctx.evidence?.pages.find(p => p.pageType === "home" && p.loaded)?.facts;
  const top = terms.slice(0, 5).map(t => `"${t.dims[0]}" (${n0(t.vals[0])})`).join(", ");
  const tracked = events > 0 || terms.length > 0;
  if (!home) return { id: "GA4-13", status: "no_data", en: tracked ? `${n0(events)} searches in 28 days${top ? `; top terms ${top}` : ""}.` : "No search events in GA4." };
  if (!home.search.present) return { id: "GA4-13", status: tracked ? "fail" : "no_data", en: tracked ? `GA4 records ${n0(events)} searches, but no search box was found on the phone homepage.` : "No search box found and no search events in GA4." };
  if (!tracked) return { id: "GA4-13", status: "fail", en: "The store has a search box, but GA4 records no searches, so nobody sees what shoppers look for.", handoff: { kind: "check", id: "GTM-13" } };
  if (!home.search.visible) return { id: "GA4-13", status: "fail", en: `Shoppers searched ${n0(events)} times in 28 days${top ? ` (top: ${top})` : ""}, but search is hidden behind a menu on phones.`, handoff: { kind: "cro", page: "home" } };
  return { id: "GA4-13", status: "pass", en: `Search is visible on phones and tracked: ${n0(events)} searches in 28 days${top ? `, top ${top}` : ""}.` };
}

function audienceFact(ctx: Ctx): Ga4Fact {
  const raw = ctx.oauth.audiences as unknown;
  const ads = ctx.oauth.googleAdsLinks as unknown;
  const adsLinked = Array.isArray(ads) && ads.length > 0;
  if (!Array.isArray(raw)) return { id: "GA4-14", status: adsLinked ? "no_data" : "fail", en: adsLinked ? "Audience list not available in this GA4 pull." : "No Google Ads link, so no audience can be used for remarketing." };
  const custom = raw.map(a => String((a as { displayName?: string }).displayName ?? "")).filter(n => n && !DEFAULT_AUDIENCES.test(n));
  if (!custom.length) return { id: "GA4-14", status: "fail", en: `Only the default audiences exist${adsLinked ? "" : " and Google Ads isn't linked"}, so cart abandoners and product viewers can't be shown ads.` };
  if (!adsLinked) return { id: "GA4-14", status: "fail", en: `Audiences exist (${custom.slice(0, 4).join(", ")}) but Google Ads isn't linked to use them.` };
  return { id: "GA4-14", status: "pass", en: `Custom audiences exist (${custom.slice(0, 4).join(", ")}) and Google Ads is linked.` };
}

function liveFact(ctx: Ctx): Ga4Fact {
  const realtime = rowsOf(ctx.rd.realtime).reduce((s, r) => s + r.vals[0], 0);
  const wow = rowsOf(ctx.rd.weekOverWeek);
  const sessionsFor = (name: string) => wow.filter(r => r.dims.includes(name)).reduce((s, r) => s + r.vals[0], 0);
  const last = sessionsFor("last7Days");
  const prior = sessionsFor("prior7Days");
  if (!wow.length) return { id: "GA4-15", status: "no_data", en: `Realtime shows ${n0(realtime)} active users; no week-on-week data.` };
  const line = `${n0(last)} visits in the last 7 days against ${n0(prior)} the week before; ${n0(realtime)} active users at the time of the audit.`;
  if (last === 0) return { id: "GA4-15", status: "fail", en: `${line} Nothing recorded this week: tracking is down.`, handoff: { kind: "check", id: "W-21" } };
  if (prior >= 200 && last < prior * (1 - DROP_ALERT)) return { id: "GA4-15", status: "fail", en: `${line} A ${pct(1 - last / prior)} drop; check whether tracking broke or traffic really fell.`, handoff: { kind: "check", id: "W-21" } };
  return { id: "GA4-15", status: "pass", en: line };
}

function timingFact(ctx: Ctx): Ga4Fact {
  const sold = withSales(ctx, ctx.rd.hourDay);
  if (sold === null) return pollutedFact(ctx, "GA4-16", "by hour and weekday");
  const rows = sold;
  const conv = rows.reduce((s, r) => s + r.sales, 0);
  const sessions = rows.reduce((s, r) => s + r.vals[0], 0);
  if (!rows.length || conv < 30) return { id: "GA4-16", status: "no_data", en: "Too few sales by hour and weekday to judge." };
  const bucket = (pick: (r: { dims: string[] }) => string) => {
    const m = new Map<string, { s: number; c: number }>();
    for (const r of rows) {
      const k = pick(r);
      const v = m.get(k) ?? { s: 0, c: 0 };
      v.s += r.vals[0];
      v.c += r.sales;
      m.set(k, v);
    }
    return [...m.entries()].filter(([, v]) => v.s >= sessions * 0.08).map(([k, v]) => ({ k, cr: v.c / v.s }));
  };
  const parts = bucket(r => DAYPART.find(p => Number(r.dims[1]) >= p.from && Number(r.dims[1]) < p.to)?.name ?? "?");
  const days = bucket(r => DAY[Number(r.dims[0])] ?? r.dims[0]);
  const spread = (list: Array<{ k: string; cr: number }>) => {
    const sorted = [...list].sort((a, b) => b.cr - a.cr);
    return sorted.length >= 2 && sorted.at(-1)!.cr > 0 ? { best: sorted[0], worst: sorted.at(-1)!, x: sorted[0].cr / sorted.at(-1)!.cr } : null;
  };
  const p = spread(parts);
  const dd = spread(days);
  const big = [p, dd].filter((s): s is NonNullable<typeof s> => Boolean(s && s.x >= 1.8));
  const describe = (s: NonNullable<ReturnType<typeof spread>>) => `${s.best.k} converts at ${pct(s.best.cr)} against ${pct(s.worst.cr)} for ${s.worst.k}`;
  if (!big.length) return { id: "GA4-16", status: "pass", en: `Conversion is fairly even across the day and week${p ? ` (${describe(p)})` : ""}.` };
  return { id: "GA4-16", status: "fail", en: `${big.map(describe).join("; ")}. Ads spend the same at every hour today.` };
}

function eventsFact(ctx: Ctx, s: ReturnType<typeof steps>): Ga4Fact {
  const present = new Set(ctx.d.funnel.map(f => f.event));
  for (const r of rowsOf(ctx.rd.eventVolume)) if (r.vals[0] > 0) present.add(r.dims[0]);
  if ((ctx.d.purchases ?? 0) > 0) present.add("purchase");
  const core = ["view_item", "add_to_cart", "begin_checkout", "purchase"];
  const missing = core.filter(e => !present.has(e) && !(e === "begin_checkout" && present.has("add_shipping_info")));
  const gaps = [s.browse, s.cart, s.checkout].filter((x): x is Step => Boolean(x && x.state === "gap" && x.b > 0));
  if (!missing.length && !gaps.length) return { id: "GA4-17", status: "pass", en: `All funnel events record: ${core.filter(e => present.has(e)).join(", ")}${present.has("add_payment_info") ? ", add_payment_info" : ""}.` };
  const parts: string[] = [];
  if (missing.length) parts.push(`Missing from GA4 in 28 days: ${missing.join(", ")}.`);
  for (const g of gaps) parts.push(g.b > g.a ? `More "${g.to}" (${n0(g.b)}) than "${g.from}" (${n0(g.a)}): one of them is miscounted.` : `"${g.from}" → "${g.to}" is ${pct(g.rate)}, far under the ${pct(g.benchmark)} benchmark, so "${g.to}" is most likely not firing everywhere.`);
  return { id: "GA4-17", status: "fail", en: parts.join(" "), handoff: { kind: "check", id: "GTM-06" } };
}

function purchaseFact(ctx: Ctx): Ga4Fact {
  const row = rowsOf(ctx.rd.purchaseMetrics)[0];
  if (!row) return (ctx.d.sessions ?? 0) >= MIN_SESSIONS ? { id: "GA4-18", status: "fail", en: `${n0(ctx.d.sessions ?? 0)} visits in 28 days and no purchase event recorded.`, handoff: { kind: "check", id: "GTM-01" } } : { id: "GA4-18", status: "no_data", en: "No purchase data." };
  const [events, revenue, tx] = row.vals;
  const issues: string[] = [];
  if (events > 0 && tx > 0 && Math.abs(events - tx) / Math.max(events, tx) > 0.1) issues.push(`${n0(events)} purchase events but ${n0(tx)} transactions`);
  if (events > 0 && !revenue) issues.push("revenue recorded as zero");
  if (!ctx.d.currency) issues.push("no currency on purchases");
  const line = `${n0(events)} purchase events, ${n0(tx)} transactions, ${formatMoney(revenue, ctx.d.currency)} revenue in 28 days.`;
  return issues.length
    ? { id: "GA4-18", status: "fail", en: `${line} Problem: ${issues.join("; ")}.`, handoff: { kind: "check", id: "GTM-01" } }
    : { id: "GA4-18", status: "pass", en: `${line} They line up.` };
}

function gatewayFact(ctx: Ctx): Ga4Fact {
  const rows = rowsOf(ctx.rd.sourceMedium);
  if (!rows.length) return { id: "GA4-19", status: "no_data", en: "No source/medium data in this GA4 pull." };
  const hits = rows.filter(r => GATEWAY.test(r.dims[0] ?? "") && r.vals[0] >= 5);
  if (!hits.length) return { id: "GA4-19", status: "pass", en: "No payment gateway shows up as a traffic source." };
  // Sales only when they can be read; the visits alone already prove the point.
  const sales = (r: { vals: number[] }) => salesIn(r.vals, ctx.d.keyEventsClean);
  const known = hits.every(r => sales(r) !== null);
  const conv = known ? hits.reduce((s, r) => s + (sales(r) ?? 0), 0) : 0;
  return { id: "GA4-19", status: "fail", en: `${hits.map(r => `${r.dims[0]} / ${r.dims[1]} (${n0(r.vals[0])} visits${known ? `, ${n0(sales(r) ?? 0)} sales` : ""})`).join(", ")} appear as traffic sources${known ? `, taking credit for ${n0(conv)} sales that belong to the ad or channel that brought the shopper` : ", taking credit for sales that belong to the ad or channel that brought the shopper"}.` };
}

function keyEventsFact(ctx: Ctx): Ga4Fact {
  const raw = ctx.oauth.keyEvents as unknown;
  if (!Array.isArray(raw)) return { id: "GA4-20", status: "no_data", en: "Key events list not available." };
  const names = raw.map(k => String((k as { eventName?: string }).eventName ?? "")).filter(Boolean);
  const noise = names.filter(n => NOISE_KEY_EVENTS.has(n));
  const hasPurchase = names.includes("purchase");
  if (hasPurchase && !noise.length) return { id: "GA4-20", status: "pass", en: `Key events: ${names.join(", ")}.` };
  return { id: "GA4-20", status: "fail", en: `Key events: ${names.join(", ") || "none"}.${hasPurchase ? "" : " purchase is not a key event."}${noise.length ? ` ${noise.join(", ")} ${noise.length > 1 ? "are" : "is"} marked as key, which teaches ad bidding the wrong goal.` : ""}` };
}

function adsFact(ctx: Ctx): Ga4Fact {
  const raw = ctx.oauth.googleAdsLinks as unknown;
  if (!Array.isArray(raw)) return { id: "GA4-21", status: "no_data", en: "Google Ads link list not available." };
  return raw.length
    ? { id: "GA4-21", status: "pass", en: `Google Ads linked (${raw.length} link${raw.length > 1 ? "s" : ""}).` }
    : { id: "GA4-21", status: "fail", en: "No Google Ads account is linked, so Ads can't learn from GA4 purchases or use GA4 audiences." };
}

function settingsFact(ctx: Ctx): Ga4Fact {
  const details = (ctx.oauth.details ?? {}) as { currencyCode?: string; timeZone?: string };
  const rows = rowsOf(ctx.rd.countryConversion).length ? rowsOf(ctx.rd.countryConversion) : rowsOf(ctx.rd.geoDevice);
  const byCountry = new Map<string, number>();
  for (const r of rows) byCountry.set(r.dims[0], (byCountry.get(r.dims[0]) ?? 0) + r.vals[0]);
  const top = [...byCountry.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const market = top ? MARKETS[top] : undefined;
  if (!details.currencyCode || !details.timeZone || !market) return { id: "GA4-22", status: "no_data", en: `Property currency ${details.currencyCode ?? "unknown"}, timezone ${details.timeZone ?? "unknown"}; top country ${top ?? "unknown"}.` };
  const tzOk = TZ_OFFSET[details.timeZone] === market.offset;
  const curOk = details.currencyCode === market.currency;
  const line = `Property currency ${details.currencyCode}, timezone ${details.timeZone}; most visits come from ${top} (${market.currency}).`;
  return curOk && tzOk ? { id: "GA4-22", status: "pass", en: line } : { id: "GA4-22", status: "fail", en: `${line} ${curOk ? "" : "Revenue is reported in a different currency than the store sells in. "}${tzOk ? "" : "Days and hours are cut in the wrong timezone."}`.trim() };
}

function retentionFact(ctx: Ctx): Ga4Fact {
  const r = (ctx.oauth.retention ?? {}) as { eventDataRetention?: string };
  if (!r.eventDataRetention) return { id: "GA4-23", status: "no_data", en: "Retention setting not available." };
  const label = r.eventDataRetention.replace(/_/g, " ").toLowerCase();
  return r.eventDataRetention === "TWO_MONTHS"
    ? { id: "GA4-23", status: "fail", en: "Event data is kept for 2 months, so last Ramadan or White Friday can't be compared in explorations." }
    : { id: "GA4-23", status: "pass", en: `Event data is kept for ${label}.` };
}

function piiFact(ctx: Ctx): Ga4Fact {
  const paths = [
    ...ctx.d.landing.map(l => l.path),
    ...rowsOf(ctx.rd.pageFunnel).map(r => r.dims[0]),
    ...rowsOf(ctx.rd.campaignLanding).map(r => r.dims[2]),
  ].filter(Boolean);
  if (!paths.length) return { id: "GA4-24", status: "no_data", en: "No page paths in this GA4 pull to scan." };
  const hit = paths.find(p => PII.test(p));
  if (!hit) return { id: "GA4-24", status: "pass", en: `No email or phone found in the ${n0(new Set(paths).size)} page paths read.` };
  const redacted = hit.replace(/([?&][^=]+=)[^&]+/g, "$1…").replace(/[^/?&=]*(@|%40)[^/?&]*/g, "…@…");
  return { id: "GA4-24", status: "fail", en: `Personal data appears in page paths sent to GA4, e.g. ${redacted}.` };
}

// ---------------------------------------------------------------------------
// Persona points (GA4-P01..P17): facts for the ICP checklist points, from the
// reports google-oauth.js added on 2026-10-20 (purchaseIds, purchaseCurrency,
// itemSales, hostnames, trafficSources, dailyTrend, paidSegments, paidFunnel,
// paidLanding, events90) plus the attribution settings already fetched.
// Same rules as above: the store is compared with itself or with a number
// stated in the point; a missing or failed report (every row saved before
// that date) is no_data, never a guess.

const PAID_CHANNELS = new Set(["Paid Search", "Paid Social", "Paid Shopping", "Paid Video", "Paid Other", "Display", "Cross-network"]);
const PAID_MEDIUM = /^(cpc|paid|ppc)$/i;
// Unresolved ad-platform macros and broken encoding in UTM values.
const PLACEHOLDER = /\{\{|\}\}|%7b|%7d|&amp;|\{[a-z_.]+\}/i;
const ENCODED = /%[0-9a-f]{2}/i;
const NO_VALUE = /^(\((not set|none|direct|data deleted|organic|referral|not provided)\))?$/i;
const UNKNOWN_CHANNEL = /^(unassigned|\(not set\)|\(other\))$/i;
// One platform under several names (the point's own example: Facebook, facebook, fb).
const SOURCE_ALIAS: Record<string, string> = { fb: "facebook", ig: "instagram" };
// A row needs this many visits before it is named (same floor as GA4-19).
const MIN_ROW = 5;
// SO-GA4-06: purchases and transactions may differ by up to 10%.
const COUNT_TOLERANCE = 0.1;
// SO-GA4-22: item revenue adds up to order revenue within 5%.
const ITEM_TOLERANCE = 0.05;
// A day is a spike at twice the store's own median day, with 50+ extra visits.
const SPIKE = 2;
const SPIKE_MIN_EXTRA = 50;
// "Almost no engagement": under a quarter of the store's own engagement rate.
const LOW_ENGAGEMENT = 0.25;
// MB-GA4-13 "near zero": new-user paid conversion under a quarter of returning.
const NEAR_ZERO = 0.25;
const CHECKOUT_HOSTS = /^(checkout\.shopify\.com|pay\.shopify\.com)$/i;
const PLATFORM_HOST = /\.myshopify\.com$/i;

const isPaid = (channel: string, medium = "") => PAID_CHANNELS.has(channel) || PAID_MEDIUM.test(medium);
const plural = (n: number, word: string) => `${n0(n)} ${word}${n === 1 ? "" : "s"}`;

/** A report that was fetched and didn't fail (rows saved before a report existed have no key at all). */
function got(r: unknown): boolean {
  return Boolean(r && typeof r === "object" && !("error" in (r as object)));
}

/** Whether a report holds every row GA4 has (rowCount within the limit). */
function complete(r: unknown): boolean {
  const rc = (r as { rowCount?: number } | undefined)?.rowCount;
  return typeof rc !== "number" || rc <= rowsOf(r).length;
}

/** The TOTAL row of a report, or the sum of its rows when it holds them all. */
function totalsOf(r: unknown): number[] | null {
  const t = (r as { totals?: Array<{ metricValues?: Array<{ value?: string }> }> } | undefined)?.totals?.[0]?.metricValues;
  if (Array.isArray(t)) return t.map(m => Number(m.value ?? 0) || 0);
  if (!complete(r)) return null;
  return rowsOf(r).reduce<number[]>((acc, x) => x.vals.map((v, i) => (acc[i] ?? 0) + v), []);
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};

const bareHost = (h: string) => h.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/:?#].*$/, "").replace(/^www\./, "").replace(/\.$/, "");

/** The store's own domains: the audited website and the GA4 web streams' URLs. */
function storeDomains(ctx: Ctx): string[] {
  const out = new Set<string>();
  if (ctx.origin) out.add(bareHost(new URL(ctx.origin).hostname));
  const streams = ctx.oauth.dataStreams;
  if (Array.isArray(streams)) {
    for (const s of streams) {
      const uri = (s as { webStreamData?: { defaultUri?: string } } | null)?.webStreamData?.defaultUri;
      if (uri) out.add(bareHost(uri));
    }
  }
  return [...out].filter(d => d.includes("."));
}

const onDomain = (host: string, domains: string[]) => {
  const b = bareHost(host);
  return domains.some(d => b === d || b.endsWith(`.${d}`));
};

interface SourceRow { channel: string; source: string; medium: string; campaign: string; sessions: number; engaged: number; adds: number; sales: number }

function trafficRows(ctx: Ctx): SourceRow[] | null {
  if (!got(ctx.rd.trafficSources)) return null;
  return rowsOf(ctx.rd.trafficSources).map(r => ({
    channel: r.dims[0] ?? "", source: r.dims[1] ?? "", medium: r.dims[2] ?? "", campaign: r.dims[3] ?? "",
    sessions: r.vals[0] ?? 0, engaged: r.vals[1] ?? 0, adds: r.vals[2] ?? 0, sales: r.vals[3] ?? 0,
  }));
}

function unknownShare(ctx: Ctx): { share: number; unknown: number; total: number } | null {
  const chans = rowsOf(ctx.rd.channels).map(r => ({ name: r.dims[0], sessions: r.vals[0] }));
  const total = chans.reduce((s, c) => s + c.sessions, 0);
  if (!total) return null;
  const unknown = chans.filter(c => UNKNOWN_CHANNEL.test(c.name)).reduce((s, c) => s + c.sessions, 0);
  return { share: unknown / total, unknown, total };
}

/** Broken values (macros, encoding) and one value under several spellings. */
function tagIssues(rows: SourceRow[], alias = false): { broken: string[]; variants: string[] } {
  const broken = new Set<string>();
  for (const r of rows) for (const v of [r.source, r.medium, r.campaign]) if (v && (PLACEHOLDER.test(v) || ENCODED.test(v))) broken.add(v);
  const variants: string[] = [];
  for (const field of ["source", "medium"] as const) {
    const groups = new Map<string, Set<string>>();
    for (const r of rows) {
      const v = r[field];
      if (NO_VALUE.test(v)) continue;
      const lower = v.trim().toLowerCase();
      const key = alias ? SOURCE_ALIAS[lower] ?? lower : lower;
      groups.set(key, (groups.get(key) ?? new Set()).add(v));
    }
    for (const set of groups.values()) if (set.size > 1) variants.push([...set].join(" / "));
  }
  return { broken: [...broken].slice(0, 4), variants: variants.slice(0, 4) };
}

interface PurchaseCounts { events: number; revenue: number; tx: number }

function purchaseCounts(ctx: Ctx): PurchaseCounts | null {
  const row = rowsOf(ctx.rd.purchaseMetrics)[0];
  return row ? { events: row.vals[0] ?? 0, revenue: row.vals[1] ?? 0, tx: row.vals[2] ?? 0 } : null;
}

/** Problems with purchase count vs orders: count gap, repeated order ids, purchases with no id. */
function orderIssues(c: PurchaseCounts, ctx: Ctx): { issues: string[]; idsKnown: boolean } {
  const issues: string[] = [];
  if (!c.tx) issues.push("GA4 records no transactions, so purchases carry no order ID");
  else if (Math.abs(c.events - c.tx) / Math.max(c.events, c.tx) > COUNT_TOLERANCE) issues.push(`purchase events and transactions differ by ${pct(Math.abs(c.events - c.tx) / Math.max(c.events, c.tx))}`);
  if (!got(ctx.rd.purchaseIds)) return { issues, idsKnown: false };
  const rows = rowsOf(ctx.rd.purchaseIds);
  const isUnset = (v: string) => v === "" || v === "(not set)";
  const unset = rows.filter(r => isUnset(r.dims[0] ?? "")).reduce((s, r) => s + r.vals[0], 0);
  const dups = rows.filter(r => !isUnset(r.dims[0] ?? "") && r.vals[0] > 1);
  if (dups.length) {
    const extra = dups.reduce((s, r) => s + r.vals[0] - 1, 0);
    issues.push(`${dups.length >= rows.length && !complete(ctx.rd.purchaseIds) ? "at least " : ""}${plural(dups.length, "order ID")} counted on more than one purchase event (${n0(extra)} extra purchases; the most repeated ID ${n0(Math.max(...dups.map(r => r.vals[0])))} times)`);
  }
  if (unset) issues.push(`${plural(unset, "purchase event")} with no order ID ((not set))`);
  return { issues, idsKnown: true };
}

/** Currencies sent on purchase events; null when the report is missing. */
function purchaseCurrencies(ctx: Ctx): { codes: string[]; unset: number } | null {
  if (!got(ctx.rd.purchaseCurrency)) return null;
  const rows = rowsOf(ctx.rd.purchaseCurrency).filter(r => r.vals[0] > 0);
  const isUnset = (v: string) => v === "" || v === "(not set)";
  return {
    codes: rows.filter(r => !isUnset(r.dims[0] ?? "")).map(r => r.dims[0]),
    unset: rows.filter(r => isUnset(r.dims[0] ?? "")).reduce((s, r) => s + r.vals[0], 0),
  };
}

// MB-GA4-02
function ordersFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P01";
  const c = purchaseCounts(ctx);
  if (!c || !c.events) return { id, status: "no_data", en: "No purchase events in the last 28 days to compare with orders." };
  const { issues, idsKnown } = orderIssues(c, ctx);
  const line = `${n0(c.events)} purchase events against ${n0(c.tx)} transactions in 28 days.`;
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}. GA4 shows more purchases than real orders.`, handoff: { kind: "check", id: "GTM-01" } };
  if (!idsKnown) return { id, status: "no_data", en: `${line} The per-order ID report isn't in this GA4 pull, so repeated order IDs can't be checked.` };
  return { id, status: "pass", en: `${line} Every order ID is counted once.` };
}

// SO-GA4-06
function salesMatchFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P02";
  const c = purchaseCounts(ctx);
  if (!c || !c.events) return { id, status: "no_data", en: "No purchase events in the last 28 days to compare with orders." };
  const { issues, idsKnown } = orderIssues(c, ctx);
  if (!c.revenue) issues.push("purchase revenue is zero");
  const cur = purchaseCurrencies(ctx);
  if (cur ? cur.unset > 0 : !ctx.d.currency) issues.push(cur ? `${plural(cur.unset, "purchase")} sent with no currency` : "no currency on purchases");
  const line = `${n0(c.events)} purchase events, ${n0(c.tx)} transactions, ${formatMoney(c.revenue, ctx.d.currency)} revenue in 28 days.`;
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}.`, handoff: { kind: "check", id: "GTM-01" } };
  if (!idsKnown) return { id, status: "no_data", en: `${line} The per-order ID report isn't in this GA4 pull, so repeated order IDs can't be checked.` };
  return { id, status: "pass", en: `${line} Purchases match transactions, no order ID is counted twice, and every purchase has a value and currency.` };
}

// MB-GA4-03
function revenueFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P03";
  const c = purchaseCounts(ctx);
  if (!c || !c.events) return { id, status: "no_data", en: "No purchase events in the last 28 days." };
  const issues: string[] = [];
  if (!c.revenue) issues.push("purchase revenue is zero");
  const cur = purchaseCurrencies(ctx);
  if (cur && cur.codes.length > 1) issues.push(`purchases arrive in ${cur.codes.length} currencies (${cur.codes.join(", ")})`);
  if (cur && cur.unset > 0) issues.push(`${plural(cur.unset, "purchase")} sent with no currency`);
  const items = got(ctx.rd.itemSales) ? totalsOf(ctx.rd.itemSales) : null;
  const itemRevenue = items ? items[0] ?? 0 : null;
  if (itemRevenue !== null && c.revenue > 0) {
    if (itemRevenue === 0) issues.push("purchases carry no item revenue (items missing)");
    else if (itemRevenue > c.revenue * (1 + ITEM_TOLERANCE)) issues.push(`item revenue (${formatMoney(itemRevenue, ctx.d.currency)}) is ${pct(itemRevenue / c.revenue - 1)} above purchase revenue (duplicated items)`);
  }
  const line = `${formatMoney(c.revenue, ctx.d.currency)} purchase revenue from ${n0(c.events)} purchases in 28 days${itemRevenue !== null ? `, ${formatMoney(itemRevenue, ctx.d.currency)} item revenue` : ""}${cur?.codes.length ? `, currency ${cur.codes.join(", ")}` : ""}.`;
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}.`, handoff: { kind: "check", id: "GTM-01" } };
  if (!cur || itemRevenue === null) return { id, status: "no_data", en: `${line} The currency or item revenue report isn't in this GA4 pull.` };
  return { id, status: "pass", en: `${line} One currency, a real value on every purchase, and item revenue no higher than purchase revenue.` };
}

// SO-GA4-22
function itemsFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P04";
  const c = purchaseCounts(ctx);
  if (!got(ctx.rd.itemSales)) return { id, status: "no_data", en: "The per-product sales report isn't in this GA4 pull." };
  if (!c || !c.revenue) return { id, status: "no_data", en: "No purchase revenue in the last 28 days to compare items with." };
  const totals = totalsOf(ctx.rd.itemSales);
  if (!totals) return { id, status: "no_data", en: "Item totals can't be read from this GA4 pull." };
  const [itemRevenue = 0, units = 0] = totals;
  const unset = rowsOf(ctx.rd.itemSales).filter(r => r.dims[0] === "(not set)" || r.dims[0] === "").reduce((s, r) => s + (r.vals[1] ?? 0), 0);
  const issues: string[] = [];
  if (!units) issues.push("no purchased items are recorded at all");
  else if (unset / units > ITEM_TOLERANCE) issues.push(`${pct(unset / units)} of items sold (${n0(unset)} of ${n0(units)}) have no product name ((not set))`);
  const gap = Math.abs(itemRevenue - c.revenue) / c.revenue;
  if (gap > ITEM_TOLERANCE) issues.push(`item revenue ${formatMoney(itemRevenue, ctx.d.currency)} is ${pct(gap)} ${itemRevenue > c.revenue ? "above" : "below"} order revenue ${formatMoney(c.revenue, ctx.d.currency)}`);
  const line = `${n0(units)} items sold for ${formatMoney(itemRevenue, ctx.d.currency)} against ${formatMoney(c.revenue, ctx.d.currency)} order revenue in 28 days.`;
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}.`, handoff: { kind: "check", id: "GTM-01" } };
  return { id, status: "pass", en: `${line} Products are named and item revenue is within 5% of order revenue.` };
}

// SO-GA4-19, MB-GA4-22
function hostFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P05";
  if (!got(ctx.rd.hostnames)) return { id, status: "no_data", en: "The hostname report isn't in this GA4 pull." };
  const domains = storeDomains(ctx);
  if (!domains.length) return { id, status: "no_data", en: "The store's own domain is unknown, so hostnames can't be judged." };
  const rows = rowsOf(ctx.rd.hostnames).filter(r => r.dims[0] && r.dims[0] !== "(not set)");
  if (!rows.length) return { id, status: "no_data", en: "No hostnames recorded in the last 28 days." };
  const total = rows.reduce((s, r) => s + r.vals[0], 0);
  const foreign = rows.filter(r => !onDomain(r.dims[0], domains) && !CHECKOUT_HOSTS.test(bareHost(r.dims[0])) && (r.vals[0] >= MIN_ROW || (r.vals[1] ?? 0) > 0));
  if (!foreign.length) return { id, status: "pass", en: `Every hostname with traffic in 28 days is the store's own (${domains.join(", ")}); ${n0(total)} visits.` };
  const visits = foreign.reduce((s, r) => s + r.vals[0], 0);
  const sales = foreign.reduce((s, r) => s + (r.vals[1] ?? 0), 0);
  return {
    id,
    status: "fail",
    en: `${foreign.slice(0, 4).map(r => `${r.dims[0]} (${n0(r.vals[0])} visits${r.vals[1] ? `, ${n0(r.vals[1])} purchases` : ""})`).join(", ")} send data into this property besides ${domains.join(", ")}: ${pct(visits / Math.max(total, 1))} of visits${sales ? ` and ${plural(sales, "purchase")}` : ""} in 28 days.`,
  };
}

// SO-GA4-15
function selfReferralFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P06";
  const domains = storeDomains(ctx);
  if (!domains.length) return { id, status: "no_data", en: "The store's own domain is unknown, so self-referrals can't be judged." };
  if (!got(ctx.rd.sourceMedium) && !got(ctx.rd.trafficSources)) return { id, status: "no_data", en: "No source/medium data in this GA4 pull." };
  const pairs = new Map<string, { source: string; medium: string; sessions: number; sales: number | null }>();
  for (const r of rowsOf(ctx.rd.sourceMedium)) pairs.set(`${r.dims[0]}|${r.dims[1]}`, { source: r.dims[0], medium: r.dims[1], sessions: r.vals[0], sales: r.vals.length >= 3 ? r.vals[2] : null });
  const fromTraffic = new Map<string, { source: string; medium: string; sessions: number; sales: number | null }>();
  for (const r of trafficRows(ctx) ?? []) {
    const key = `${r.source}|${r.medium}`;
    if (pairs.has(key)) continue;
    const p = fromTraffic.get(key) ?? { source: r.source, medium: r.medium, sessions: 0, sales: 0 };
    p.sessions += r.sessions;
    p.sales = (p.sales ?? 0) + r.sales;
    fromTraffic.set(key, p);
  }
  const all = [...pairs.values(), ...fromTraffic.values()];
  const own = all.filter(p => /referral/i.test(p.medium) && p.sessions > 0 && (onDomain(p.source, domains) || PLATFORM_HOST.test(bareHost(p.source)) || CHECKOUT_HOSTS.test(bareHost(p.source))));
  if (!own.length) return { id, status: "pass", en: `None of the store's own domains (${domains.join(", ")}) shows as a referral source in the ${n0(all.length)} source/medium rows read.` };
  const sales = own.every(p => p.sales !== null) ? own.reduce((s, p) => s + (p.sales ?? 0), 0) : null;
  const share = sales !== null && ctx.d.purchases ? sales / ctx.d.purchases : null;
  return {
    id,
    status: "fail",
    en: `The store's own domain shows as a referral source: ${own.slice(0, 4).map(p => `${p.source} (${n0(p.sessions)} visits${p.sales !== null ? `, ${n0(p.sales)} sales` : ""})`).join(", ")}.${share !== null && sales ? ` ${pct(share)} of sales (${n0(sales)} of ${n0(ctx.d.purchases ?? 0)}) are credited to the store itself instead of the ad or link that brought the shopper.` : " Each one splits a visit in two."}`,
  };
}

// SO-GA4-17
function sourceHygieneFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P07";
  const u = unknownShare(ctx);
  if (!u) return { id, status: "no_data", en: "No channel data." };
  const rows = trafficRows(ctx);
  const issues: string[] = [];
  if (u.share > UNKNOWN_SOURCE_MAX) issues.push(`${pct(u.share)} of visits (${n0(u.unknown)} of ${n0(u.total)}) have no known source`);
  if (rows) {
    const t = tagIssues(rows);
    if (t.broken.length) issues.push(`broken campaign tags: ${t.broken.map(v => `"${v}"`).join(", ")}`);
    if (t.variants.length) issues.push(`one source under several spellings: ${t.variants.join("; ")}`);
  }
  if (issues.length) return { id, status: "fail", en: `${issues.join("; ")}.`.replace(/^./, ch => ch.toUpperCase()) };
  if (!rows) return { id, status: "no_data", en: `${pct(u.share)} of visits have no known source; the source/medium/campaign report isn't in this GA4 pull.` };
  return { id, status: "pass", en: `${pct(u.share)} of visits have no known source (under the 10% bar) and no broken or mixed-case tags in the ${plural(rows.length, "source/medium/campaign row")} read.` };
}

// MB-GA4-11
function paidTagsFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P08";
  const rows = trafficRows(ctx);
  if (!rows) return { id, status: "no_data", en: "The source/medium/campaign report isn't in this GA4 pull." };
  const paid = rows.filter(r => isPaid(r.channel, r.medium));
  const issues: string[] = [];
  const t = tagIssues(paid, true);
  if (t.broken.length) issues.push(`unresolved or broken values: ${t.broken.map(v => `"${v}"`).join(", ")}`);
  if (t.variants.length) issues.push(`one platform under several spellings: ${t.variants.join("; ")}`);
  const upper = [...new Set(paid.flatMap(r => [r.source, r.medium]).filter(v => v && !NO_VALUE.test(v) && v !== v.toLowerCase()))];
  if (upper.length) issues.push(`not lowercase: ${upper.slice(0, 4).map(v => `"${v}"`).join(", ")}`);
  const invented = rows.filter(r => UNKNOWN_CHANNEL.test(r.channel) && !NO_VALUE.test(r.medium) && r.sessions >= MIN_ROW);
  if (invented.length) issues.push(`mediums GA4 does not recognise, landing in Unassigned: ${invented.slice(0, 4).map(r => `${r.source} / ${r.medium} (${n0(r.sessions)} visits)`).join(", ")}`);
  const paidSessions = paid.reduce((s, r) => s + r.sessions, 0);
  if (issues.length) return { id, status: "fail", en: `Paid link tags: ${issues.join("; ")}.` };
  if (!paid.length) return { id, status: "pass", en: "No paid traffic rows in the last 28 days and no unrecognised mediums." };
  return { id, status: "pass", en: `${plural(paid.length, "paid source/medium/campaign row")} (${n0(paidSessions)} visits) are lowercase, consistent and free of placeholders.` };
}

// MB-GA4-09
function paidChannelFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P09";
  const u = unknownShare(ctx);
  if (!u) return { id, status: "no_data", en: "No channel data." };
  const rows = trafficRows(ctx);
  const issues: string[] = [];
  if (u.share > UNKNOWN_SOURCE_MAX) issues.push(`${pct(u.share)} of visits (${n0(u.unknown)} of ${n0(u.total)}) have no known channel`);
  let top = "";
  if (rows) {
    const unassigned = rows.filter(r => UNKNOWN_CHANNEL.test(r.channel)).sort((a, b) => b.sessions - a.sessions);
    top = unassigned.slice(0, 3).map(r => `${r.source} / ${r.medium} (${n0(r.sessions)})`).join(", ");
    const tagged = rows.filter(r => r.sessions >= MIN_ROW && ((UNKNOWN_CHANNEL.test(r.channel) && (!NO_VALUE.test(r.medium) || !NO_VALUE.test(r.campaign))) || (r.channel === "Referral" && !NO_VALUE.test(r.campaign))));
    if (tagged.length) issues.push(`tagged campaign traffic lands outside the paid channels: ${tagged.slice(0, 4).map(r => `${r.source} / ${r.medium}${NO_VALUE.test(r.campaign) ? "" : ` "${r.campaign}"`} in ${r.channel} (${n0(r.sessions)} visits)`).join(", ")}`);
  }
  const topText = top ? ` Top pairs in Unassigned: ${top}.` : "";
  if (issues.length) return { id, status: "fail", en: `${issues.join("; ")}.`.replace(/^./, ch => ch.toUpperCase()) + topText };
  if (!rows) return { id, status: "no_data", en: `${pct(u.share)} of visits have no known channel; the source/medium/campaign report isn't in this GA4 pull.` };
  return { id, status: "pass", en: `${pct(u.share)} of visits have no known channel (under the 10% bar) and no tagged campaign traffic falls into Unassigned or Referral.${topText}` };
}

// MB-GA4-04
function paidFunnelFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P10";
  if (!got(ctx.rd.paidFunnel)) return { id, status: "no_data", en: "The paid-traffic funnel report isn't in this GA4 pull." };
  const funnel = rowsOf(ctx.rd.paidFunnel).map(r => ({ event: r.dims[0], count: r.vals[1] || r.vals[0] })).filter(s => s.event && s.count > 0);
  if (!funnel.length) return { id, status: "no_data", en: "No paid visitors reached the shopping funnel events in 28 days." };
  const s = steps(ctx, funnel);
  const all = [s.browse, s.cart, s.checkout].filter((x): x is Step => Boolean(x));
  const worst = worstStep(s);
  const gaps = all.filter(x => x.state === "gap");
  const measured = all.filter(x => x.state === "pass" || x.state === "fail");
  if (worst) {
    const page = STEP_PAGE[worst.key];
    const others = measured.filter(x => x !== worst);
    return {
      id,
      status: "fail",
      en: `Paid visitors drop most at ${STEP_NAME[worst.key]}. ${stepSentence(worst)}${others.length ? ` Other paid steps: ${others.map(o => `${STEP_NAME[o.key]} ${pct(o.rate)} (benchmark ${pct(o.benchmark)})`).join(", ")}.` : ""}`,
      handoff: page ? { kind: "cro", page } : undefined,
    };
  }
  if (gaps.length) return { id, status: "fail", en: `The paid funnel can't be ranked: ${gaps.map(g => `"${g.to}"`).join(", ")} ${gaps.length > 1 ? "look" : "looks"} untracked for paid visitors. Fix tracking first (GA4-17).`, handoff: { kind: "check", id: "GA4-17" } };
  if (!measured.length) return { id, status: "no_data", en: "Too few paid visitors reached each step in 28 days to judge." };
  return { id, status: "pass", en: `Every measured paid step is at or above its benchmark: ${measured.map(m => `${STEP_NAME[m.key]} ${pct(m.rate)} (benchmark ${pct(m.benchmark)})`).join(", ")}.` };
}

// MB-GA4-08
function paidLandingFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P11";
  if (!got(ctx.rd.paidLanding)) return { id, status: "no_data", en: "The paid landing-page report isn't in this GA4 pull." };
  const cr = ctx.cr;
  const rows = rowsOf(ctx.rd.paidLanding).filter(r => r.dims[0] && !r.dims[0].startsWith("("));
  if (!cr || !rows.length) return { id, status: "no_data", en: "No paid landing pages with a store conversion rate to compare." };
  const paidSessions = rows.reduce((s, r) => s + r.vals[0], 0);
  const minSessions = Math.max(200, paidSessions * 0.03);
  const weak = rows.filter(r => r.vals[0] >= minSessions && (r.vals[2] ?? 0) / r.vals[0] < cr * LANDING_FLOOR).sort((a, b) => b.vals[0] - a.vals[0])[0];
  if (!weak) return { id, status: "pass", en: `No paid landing page with ${n0(minSessions)}+ paid visits converts under a third of the store average (${pct(cr)}).` };
  const path = weak.dims[0];
  const wcr = (weak.vals[2] ?? 0) / weak.vals[0];
  const page = pageTypeOfPath(path);
  return {
    id,
    status: "fail",
    en: `${path} gets ${n0(weak.vals[0])} paid visits in 28 days (${pct(weak.vals[0] / paidSessions)} of paid visits read) and converts at ${pct(wcr)} (${n0(weak.vals[2] ?? 0)} sales), against a store average of ${pct(cr)}.`,
    handoff: page && page !== "home" ? { kind: "cro", page, url: urlOf(ctx, path) } : undefined,
  };
}

/** paidSegments summed by one dimension (1 = device, 2 = new/returning). */
function paidBy(ctx: Ctx, dim: 1 | 2): Map<string, { sessions: number; sales: number }> | null {
  if (!got(ctx.rd.paidSegments)) return null;
  const m = new Map<string, { sessions: number; sales: number }>();
  for (const r of rowsOf(ctx.rd.paidSegments)) {
    const v = m.get(r.dims[dim]) ?? { sessions: 0, sales: 0 };
    v.sessions += r.vals[0];
    v.sales += r.vals[1] ?? 0;
    m.set(r.dims[dim], v);
  }
  return m;
}

// MB-GA4-12
function paidDeviceFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P12";
  const by = paidBy(ctx, 1);
  if (!by) return { id, status: "no_data", en: "The paid device report isn't in this GA4 pull." };
  const mobile = by.get("mobile");
  const desktop = by.get("desktop");
  if (!mobile || !desktop || mobile.sessions < 200 || desktop.sessions < 200 || !desktop.sales) return { id, status: "no_data", en: "Not enough paid visits with sales on both phone and desktop to compare." };
  const m = mobile.sales / mobile.sessions;
  const dk = desktop.sales / desktop.sessions;
  const line = `Paid phone visits convert at ${pct(m)} (${n0(mobile.sessions)} visits) against ${pct(dk)} on desktop (${n0(desktop.sessions)} visits): phones are at ${Math.round((m / dk) * 100)}% of desktop.`;
  if (m >= dk * MOBILE_FLOOR) return { id, status: "pass", en: `${line} Within the 60% bar.` };
  return { id, status: "fail", en: `${line} Under the 60% bar.`, handoff: { kind: "cro", page: "product" } };
}

// MB-GA4-13
function paidNewBuyersFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P13";
  const by = paidBy(ctx, 2);
  if (!by) return { id, status: "no_data", en: "The paid new-vs-returning report isn't in this GA4 pull." };
  const nv = by.get("new");
  const rv = by.get("returning");
  if (!nv || !rv || nv.sessions < 200 || rv.sessions < 50 || !(nv.sales + rv.sales)) return { id, status: "no_data", en: "Not enough new and returning paid visits with sales to compare." };
  const n = nv.sales / nv.sessions;
  const r = rv.sales / rv.sessions;
  const retShare = rv.sales / (nv.sales + rv.sales);
  const line = `Paid visits from new users convert at ${pct(n)} (${n0(nv.sessions)} visits, ${n0(nv.sales)} sales) against ${pct(r)} for returning users (${n0(rv.sessions)} visits, ${n0(rv.sales)} sales); returning users make ${pct(retShare)} of paid sales.`;
  if (!nv.sales) return { id, status: "fail", en: `${line} New-user paid visits recorded no purchases at all.` };
  if (retShare > 0.5 && n < r * NEAR_ZERO) return { id, status: "fail", en: `${line} Paid campaigns mostly re-buy people who already know the store.` };
  return { id, status: "pass", en: line };
}

interface Day { date: string; sessions: number; engaged: number; sales: number }

function dailyRows(ctx: Ctx): Day[] | null {
  if (!got(ctx.rd.dailyTrend)) return null;
  return rowsOf(ctx.rd.dailyTrend)
    .map(r => ({ date: r.dims[0] ?? "", sessions: r.vals[0] ?? 0, engaged: r.vals[1] ?? 0, sales: r.vals[2] ?? 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const dayLabel = (d: string) => (/^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d);

/** Days at twice the store's own median day or more; null when there are too few days to judge. */
function spikeDays(days: Day[]): { m: number; me: number; mt: number; spikes: Day[] } | null {
  if (days.length < 14) return null;
  const m = median(days.map(d => d.sessions));
  const me = median(days.map(d => d.engaged));
  const mt = median(days.map(d => d.sales));
  return { m, me, mt, spikes: days.filter(d => d.sessions > m * SPIKE && d.sessions - m >= SPIKE_MIN_EXTRA) };
}

// MB-GA4-14
function paidBotsFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P14";
  const rows = trafficRows(ctx);
  const days = dailyRows(ctx);
  const issues: string[] = [];
  if (rows) {
    const paid = rows.filter(r => isPaid(r.channel, r.medium) && r.sessions > 0);
    const sessions = paid.reduce((s, r) => s + r.sessions, 0);
    const avg = sessions ? paid.reduce((s, r) => s + r.engaged, 0) / sessions : 0;
    const minSessions = Math.max(150, (ctx.d.sessions ?? 0) * 0.02);
    const bots = paid.filter(r => r.sessions >= minSessions && r.adds === 0 && r.engaged / r.sessions < avg * LOW_ENGAGEMENT);
    if (bots.length) issues.push(`${bots.slice(0, 3).map(r => `${r.source} / ${r.medium}${NO_VALUE.test(r.campaign) ? "" : ` "${r.campaign}"`} sent ${n0(r.sessions)} visits with ${pct(r.engaged / r.sessions)} engaged (paid average ${pct(avg)}) and no add to cart`).join("; ")}`);
  }
  const sp = days ? spikeDays(days) : null;
  if (sp) {
    const flat = sp.spikes.filter(d => d.sales <= sp.mt);
    if (flat.length) {
      const big = [...flat].sort((a, b) => b.sessions - a.sessions)[0];
      issues.push(`${plural(flat.length, "day")} in 90 days had visits jump with no rise in sales, e.g. ${dayLabel(big.date)}: ${n0(big.sessions)} visits (usual day ${n0(sp.m)}) and ${n0(big.sales)} sales (usual ${n0(sp.mt)})`);
    }
  }
  if (issues.length) return { id, status: "fail", en: `${issues.join(". ")}. Likely bot or junk placements.` };
  if (!rows || !sp) return { id, status: "no_data", en: "The source/campaign engagement or the daily 90-day report isn't in this GA4 pull." };
  return { id, status: "pass", en: `No paid source with real volume shows near-zero engagement and no adds to cart, and no day in 90 had a visit spike without sales (usual day ${n0(sp.m)} visits).` };
}

// SO-GA4-07
function recordingFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P15";
  const realtimeOk = got(ctx.rd.realtime);
  const live = rowsOf(ctx.rd.realtime).reduce((s, r) => s + r.vals[0], 0);
  const wow = rowsOf(ctx.rd.weekOverWeek);
  const sessionsFor = (name: string) => wow.filter(r => r.dims.includes(name)).reduce((s, r) => s + r.vals[0], 0);
  const last = sessionsFor("last7Days");
  const prior = sessionsFor("prior7Days");
  // Visits the store averages in 30 minutes (the realtime window).
  const expected = last / (7 * 48);
  const issues: string[] = [];
  let liveUnjudged = false;
  if (realtimeOk && live === 0) {
    if (expected >= 5) issues.push(`no live users, while the store averages ${n0(expected)} visits every 30 minutes`);
    else liveUnjudged = true;
  }
  if (wow.length) {
    if (last === 0 && prior > 0) issues.push("nothing recorded in the last 7 days");
    else if (prior >= 200 && last < prior * (1 - DROP_ALERT)) issues.push(`visits fell ${pct(1 - last / prior)} week on week (${n0(last)} vs ${n0(prior)})`);
  }
  const days = dailyRows(ctx);
  const sp = days ? spikeDays(days.slice(-28)) : null;
  if (sp && sp.m > 0) {
    const usual = sp.me / sp.m;
    const junk = sp.spikes.filter(d => (d.engaged - sp.me) / (d.sessions - sp.m) < usual * LOW_ENGAGEMENT);
    if (junk.length) {
      const big = [...junk].sort((a, b) => b.sessions - a.sessions)[0];
      issues.push(`${dayLabel(big.date)} had ${n0(big.sessions)} visits against a usual ${n0(sp.m)}, and almost none of the extra visits were engaged (${pct(big.engaged / big.sessions)} engaged that day vs ${pct(usual)} usually): likely bots`);
    }
  }
  const line = wow.length ? `${n0(last)} visits in the last 7 days against ${n0(prior)} the week before; ${realtimeOk ? `${n0(live)} active users at the time of the audit` : "realtime not available"}.` : "";
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}.`.trim(), handoff: { kind: "check", id: "W-21" } };
  if (!wow.length || !realtimeOk || !sp || liveUnjudged) return { id, status: "no_data", en: `${line} ${liveUnjudged ? "No live users, but the store is too quiet for that to prove anything." : "Realtime, week-on-week or daily data is missing from this GA4 pull."}`.trim() };
  return { id, status: "pass", en: `${line} No sudden drop and no one-day spike of unengaged visits in 28 days.` };
}

// SO-GA4-20
function keyEventsUsedFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P16";
  const raw = ctx.oauth.keyEvents as unknown;
  if (!Array.isArray(raw)) return { id, status: "no_data", en: "Key events list not available." };
  const names = raw.map(k => String((k as { eventName?: string }).eventName ?? "")).filter(Boolean);
  const noise = names.filter(n => NOISE_KEY_EVENTS.has(n));
  const issues: string[] = [];
  if (!names.includes("purchase")) issues.push("purchase is not a key event");
  if (noise.length) issues.push(`${noise.join(", ")} ${noise.length > 1 ? "are" : "is"} marked as key`);
  const ev = got(ctx.rd.events90) ? ctx.rd.events90 : null;
  const counts = new Map(rowsOf(ev).map(r => [r.dims[0], r.vals[0]]));
  const full = ev ? complete(ev) : false;
  const zero = ev ? names.filter(n => (counts.has(n) ? counts.get(n)! <= 0 : full)) : [];
  const unknown = ev && !full ? names.filter(n => !counts.has(n)) : [];
  if (zero.length) issues.push(`${zero.join(", ")} recorded nothing in 90 days`);
  const line = `Key events: ${names.join(", ") || "none"}.`;
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}.` };
  if (!ev || unknown.length) return { id, status: "no_data", en: `${line} Their 90-day counts aren't all in this GA4 pull.` };
  return { id, status: "pass", en: `${line} purchase is key, no noise events are, and each recorded data in 90 days (${names.map(n => `${n} ${n0(counts.get(n) ?? 0)}`).join(", ")}).` };
}

// MB-GA4-17
function attributionFact(ctx: Ctx): Ga4Fact {
  const id = "GA4-P17";
  const a = ctx.oauth.attribution as { reportingAttributionModel?: string; acquisitionConversionEventLookbackWindow?: string; otherConversionEventLookbackWindow?: string; error?: string } | undefined;
  if (!a || typeof a !== "object" || a.error || !a.reportingAttributionModel) return { id, status: "no_data", en: "Attribution settings not available." };
  const days = (w?: string) => {
    const m = /(\d+)_DAYS/.exec(w ?? "");
    return m ? Number(m[1]) : null;
  };
  const acq = days(a.acquisitionConversionEventLookbackWindow);
  const other = days(a.otherConversionEventLookbackWindow);
  const label = a.reportingAttributionModel.replace(/_/g, " ").toLowerCase();
  const issues: string[] = [];
  if (/GOOGLE_PAID|ADS_PREFERRED/.test(a.reportingAttributionModel)) issues.push("the model credits Google paid channels only");
  if (acq !== null && acq < 30) issues.push(`the first-visit (acquisition) lookback is ${acq} days instead of GA4's default 30`);
  if (other !== null && other < 90) issues.push(`the lookback for other key events is ${other} days instead of GA4's default 90`);
  const line = `Reporting attribution model: ${label}; lookback ${acq ?? "?"} days for acquisition key events, ${other ?? "?"} days for the rest.`;
  if (issues.length) return { id, status: "fail", en: `${line} Problem: ${issues.join("; ")}.` };
  if (acq === null || other === null) return { id, status: "no_data", en: `${line} The lookback windows couldn't be read.` };
  return { id, status: "pass", en: `${line} Not a Google-paid-only model, and the windows are GA4's defaults.` };
}

/** The persona-point facts, keyed GA4-P01..P17. */
function personaFacts(ctx: Ctx): Ga4Fact[] {
  return [
    ordersFact(ctx),
    salesMatchFact(ctx),
    revenueFact(ctx),
    itemsFact(ctx),
    hostFact(ctx),
    selfReferralFact(ctx),
    sourceHygieneFact(ctx),
    paidTagsFact(ctx),
    paidChannelFact(ctx),
    paidFunnelFact(ctx),
    paidLandingFact(ctx),
    paidDeviceFact(ctx),
    paidNewBuyersFact(ctx),
    paidBotsFact(ctx),
    recordingFact(ctx),
    keyEventsUsedFact(ctx),
    attributionFact(ctx),
  ];
}

// ---------------------------------------------------------------------------

function context(oauth: unknown, website: string, evidence: StoreEvidence | null): Ctx | null {
  const d = fromOAuth(oauth);
  if (!d || !d.sessions || d.sessions < MIN_SESSIONS) return null;
  const o = oauth as Record<string, unknown>;
  const cr = d.purchases ? d.purchases / d.sessions : null;
  return {
    d,
    rd: (o.reportData ?? {}) as Record<string, unknown>,
    oauth: o,
    origin: originOf(website),
    cr,
    aov: d.revenue && d.purchases ? d.revenue / d.purchases : null,
    monthly: d.revenue ? (d.revenue / d.periodDays) * 30 : null,
    evidence,
  };
}

function worstStep(s: ReturnType<typeof steps>): Step | null {
  return [s.browse, s.cart, s.checkout]
    .filter((x): x is Step => Boolean(x && x.state === "fail"))
    .sort((a, b) => (b.benchmark - b.rate) / b.benchmark - (a.benchmark - a.rate) / a.benchmark)[0] ?? null;
}

/**
 * Where the Conversion review should look, from GA4 alone — called before
 * the store is visited so the collector can open these exact pages.
 */
export function ga4Focus(oauth: unknown, website: string): Ga4Focus | null {
  const ctx = context(oauth, website, null);
  if (!ctx) return null;
  const s = steps(ctx);
  const worst = worstStep(s);
  return {
    step: worst ? { from: worst.from, to: worst.to, rate: worst.rate, benchmark: worst.benchmark } : null,
    page: worst ? STEP_PAGE[worst.key] ?? null : null,
    productUrl: productFact(ctx).url,
    landingUrl: landingFact(ctx).url,
    campaignLandingUrl: campaignFact(ctx).url,
  };
}

export function computeGa4Facts(oauth: unknown, website: string, evidence: StoreEvidence | null = null): Ga4Facts | null {
  const ctx = context(oauth, website, evidence);
  if (!ctx) return null;
  const s = steps(ctx);
  const worst = worstStep(s);
  const focusPage = worst ? STEP_PAGE[worst.key] ?? null : null;
  const product = productFact(ctx);
  const landing = landingFact(ctx);
  const campaign = campaignFact(ctx);

  let leak: Ga4Fact;
  if (worst) {
    const others = [s.browse, s.cart, s.checkout].filter((x): x is Step => Boolean(x && x !== worst && x.state !== "no_data"));
    leak = {
      id: "GA4-01",
      status: "fail",
      en: `Biggest leak: ${STEP_NAME[worst.key]}. ${stepSentence(worst)}${others.length ? ` Other steps: ${others.map(o => `${STEP_NAME[o.key]} ${pct(o.rate)} (benchmark ${pct(o.benchmark)})`).join(", ")}.` : ""}${moneyText(worst.money)}`,
      money: worst.money,
      handoff: focusPage ? { kind: "cro", page: focusPage, url: focusPage === "product" ? product.url : undefined } : undefined,
    };
  } else {
    const gaps = [s.browse, s.cart, s.checkout].filter((x): x is Step => Boolean(x && x.state === "gap"));
    const measured = [s.browse, s.cart, s.checkout].filter((x): x is Step => Boolean(x && x.state === "pass"));
    leak = gaps.length
      ? { id: "GA4-01", status: "fail", en: `The funnel can't be ranked: ${gaps.map(g => `"${g.to}"`).join(", ")} ${gaps.length > 1 ? "look" : "looks"} untracked. Fix tracking first (GA4-17).`, handoff: { kind: "check", id: "GA4-17" } }
      : measured.length
        ? { id: "GA4-01", status: "pass", en: `Every measured step is at or above its benchmark: ${measured.map(m => `${STEP_NAME[m.key]} ${pct(m.rate)}`).join(", ")}.` }
        : { id: "GA4-01", status: "no_data", en: "Not enough funnel data to rank the steps." };
  }

  // The worst step's own point keeps its status but leaves the money to
  // GA4-01, so the same leak is never counted twice in the Action plan.
  const stepPoint = (id: string, st: Step | null, handoff?: Handoff): Ga4Fact => {
    const f = stepFact(id, st, handoff);
    if (worst && st === worst && f.status === "fail") return { ...f, en: `${f.en.replace(/ Estimated gain:.*$/, "")} This is the biggest leak (GA4-01).`, money: null, handoff: { kind: "check", id: "GA4-01" } };
    return f;
  };
  const list: Ga4Fact[] = [
    leak,
    stepPoint("GA4-02", s.browse, { kind: "cro", page: "product", url: product.url }),
    stepPoint("GA4-03", s.cart, { kind: "cro", page: "cart" }),
    stepPoint("GA4-04", s.checkout),
    deviceFact(ctx, focusPage),
    landing.fact,
    campaign.fact,
    unknownSourceFact(ctx),
    countryFact(ctx),
    product.fact,
    thresholdFact(ctx),
    returningFact(ctx),
    searchFact(ctx),
    audienceFact(ctx),
    liveFact(ctx),
    timingFact(ctx),
    eventsFact(ctx, s),
    purchaseFact(ctx),
    gatewayFact(ctx),
    keyEventsFact(ctx),
    adsFact(ctx),
    settingsFact(ctx),
    retentionFact(ctx),
    piiFact(ctx),
    ...personaFacts(ctx),
  ];

  return {
    currency: ctx.d.currency,
    periodDays: ctx.d.periodDays,
    sessions: ctx.d.sessions,
    purchases: ctx.d.purchases,
    revenue: ctx.d.revenue,
    conversionRate: ctx.cr,
    aov: ctx.aov,
    focus: {
      step: worst ? { from: worst.from, to: worst.to, rate: worst.rate, benchmark: worst.benchmark } : null,
      page: focusPage,
      productUrl: product.url,
      landingUrl: landing.url,
      campaignLandingUrl: campaign.url,
    },
    facts: Object.fromEntries(list.map(f => [f.id, f])),
  };
}

/**
 * The report's chart numbers straight from the OAuth reports, so the charts
 * and the facts can't disagree. Null when there is no usable GA4 data.
 */
export function ga4MetricsFromOAuth(oauth: unknown): Ga4Metrics | null {
  const d = fromOAuth(oauth);
  if (!d || !d.sessions) return null;
  const order = ["page_view", "view_item", "add_to_cart", "begin_checkout", "add_shipping_info", "add_payment_info", "purchase"] as const;
  const funnel = order
    .map(event => ({ event, count: d.funnel.find(f => f.event === event)?.count ?? 0 }))
    .filter(s => s.count > 0);
  const rate = (p: number, s: number) => (s ? Math.round((p / s) * 10000) / 100 : 0);
  return {
    periodDays: d.periodDays,
    currency: d.currency,
    sessions: d.sessions,
    conversions: d.purchases,
    conversionRate: d.purchases ? rate(d.purchases, d.sessions) : null,
    revenue: d.revenue,
    funnel,
    channels: d.channels.filter(c => c.sessions > 0 && c.purchases <= c.sessions).map(c => ({ name: c.name, sessions: c.sessions, conversionRate: rate(c.purchases, c.sessions) })),
    segments: d.newVsReturning
      .filter((x): x is typeof x & { name: "new" | "returning" } => x.name === "new" || x.name === "returning")
      .map(x => ({ name: x.name, sessions: x.sessions, conversionRate: rate(x.purchases, x.sessions) })),
  };
}

/** The prompt block: one line per fact, numbers and status fixed. */
export function ga4FactsPromptBlock(f: Ga4Facts): string {
  const head = `Store totals (28 days): ${f.sessions ?? "?"} visits, ${f.purchases ?? "?"} purchases, conversion rate ${f.conversionRate !== null ? pct(f.conversionRate) : "?"}, average order value ${f.aov ? formatMoney(f.aov, f.currency) : "?"}.`;
  const lines = Object.values(f.facts).map(x => `- ${x.id} [${x.status.toUpperCase()}] ${x.en}`);
  return [head, ...lines].join("\n");
}

/** Which pages the store visit should open, from the GA4 focus. */
export function collectorFocus(focus: Ga4Focus | null | undefined): { productUrl?: string; collectionUrl?: string } | undefined {
  if (!focus) return undefined;
  const candidates = [focus.landingUrl, focus.campaignLandingUrl].filter((u): u is string => Boolean(u));
  const typeOf = (u: string) => {
    try {
      return pageTypeOfPath(new URL(u).pathname);
    } catch {
      return null;
    }
  };
  const productUrl = focus.productUrl ?? candidates.find(u => typeOf(u) === "product");
  const collectionUrl = candidates.find(u => typeOf(u) === "collection");
  return productUrl || collectionUrl ? { productUrl, collectionUrl } : undefined;
}
