import type { FudInsights, FudInsightLine, Ga4Metrics } from "../types.js";

/**
 * Money and segment insights from the store's own GA4 data — no LLM, no
 * extra GA4 calls at audit time. Two sources, in order of preference:
 *
 * 1. `ga4_oauth_data.reportData` — the raw GA4 Data API reports the OAuth
 *    callback already fetched for the property the visitor picked
 *    (api/_lib/google-oauth.js's fetchGa4ReportData).
 * 2. `ga4Metrics` — the summary the main audit copies into the result.
 *
 * Everything shown is either a number from those reports or a clearly
 * labelled estimate (the revenue opportunity is a range, with its
 * assumptions written next to it).
 */

// Step conversion benchmarks (event or user counts), deliberately on the
// cautious side for EG/GCC fashion/beauty/home stores.
export const STEP_BENCHMARKS: Record<string, number> = {
  "view_item>add_to_cart": 0.08,
  "add_to_cart>begin_checkout": 0.5,
  "add_to_cart>add_shipping_info": 0.4,
  "begin_checkout>purchase": 0.5,
  "add_shipping_info>purchase": 0.6,
  "add_shipping_info>add_payment_info": 0.65,
  "add_payment_info>purchase": 0.75,
};
// Closing this share of the gap to the benchmark gives the low/high estimate.
const LOW_SHARE = 0.25;
const HIGH_SHARE = 0.5;
// Never claim more than this multiple of current revenue.
const MAX_MULTIPLIER = 1.3;
// A step this far under its benchmark is far more likely a tracking gap
// (an event that doesn't fire) than real lost sales: it's reported as such
// and kept out of the money estimate.
const TRACKING_GAP_SHARE = 0.3;
// Not real acquisition channels — never named as "best".
const NOT_A_CHANNEL = /^(unassigned|(other)|(not set)|cross-network)$/i;
const MIN_SESSIONS = 300;

type Report = { rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }>; metadata?: { currencyCode?: string } };

function rowsOf(r: unknown): Array<{ dims: string[]; vals: number[] }> {
  const rows = (r as Report | undefined)?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map(row => ({
    dims: (row.dimensionValues ?? []).map(d => String(d.value ?? "")),
    vals: (row.metricValues ?? []).map(m => Number(m.value ?? 0) || 0),
  }));
}

interface Normalized {
  currency: string | null;
  periodDays: number;
  sessions: number | null;
  purchases: number | null;
  revenue: number | null;
  funnel: Array<{ event: string; count: number }>;
  channels: Array<{ name: string; sessions: number; purchases: number }>;
  newVsReturning: Array<{ name: string; sessions: number; purchases: number }>;
  devices: Array<{ name: string; sessions: number; purchases: number | null; revenue: number | null }>;
  landing: Array<{ path: string; sessions: number; purchases: number }>;
}

function fromOAuth(oauth: unknown): Normalized | null {
  const rd = (oauth as { reportData?: Record<string, unknown> } | null)?.reportData;
  if (!rd || typeof rd !== "object") return null;
  const currency = (rd.purchaseMetrics as Report | undefined)?.metadata?.currencyCode ?? (rd.totals as Report | undefined)?.metadata?.currencyCode ?? null;
  const totals = rowsOf(rd.totals)[0];
  const purchase = rowsOf(rd.purchaseMetrics)[0];
  const funnelRows = rowsOf(rd.funnel);
  // totalUsers (2nd metric) is the closer "distinct people" count per step.
  const funnel = funnelRows.map(r => ({ event: r.dims[0], count: r.vals[1] || r.vals[0] })).filter(s => s.event && s.count > 0);
  const deviceRows = rowsOf(rd.deviceConversion);
  const devices = deviceRows.length
    ? deviceRows.map(r => ({ name: r.dims[0], sessions: r.vals[0], purchases: r.vals[3] || r.vals[1], revenue: r.vals[2] }))
    : Object.entries(
        rowsOf(rd.geoDevice).reduce<Record<string, number>>((acc, r) => {
          acc[r.dims[1]] = (acc[r.dims[1]] ?? 0) + r.vals[0];
          return acc;
        }, {}),
      ).map(([name, sessions]) => ({ name, sessions, purchases: null, revenue: null }));
  return {
    currency,
    periodDays: 28,
    sessions: totals?.vals[0] ?? null,
    purchases: purchase ? purchase.vals[2] || purchase.vals[0] : totals?.vals[3] ?? null,
    revenue: purchase?.vals[1] ?? null,
    funnel,
    channels: rowsOf(rd.channels).map(r => ({ name: r.dims[0], sessions: r.vals[0], purchases: r.vals[1] })),
    newVsReturning: rowsOf(rd.newVsReturning).map(r => ({ name: r.dims[0], sessions: r.vals[0], purchases: r.vals[1] })),
    devices,
    landing: rowsOf(rd.landingPages).map(r => ({ path: r.dims[0], sessions: r.vals[0], purchases: r.vals[1] })),
  };
}

function fromSummary(g: Ga4Metrics | null | undefined): Normalized | null {
  if (!g) return null;
  const rateToPurchases = (sessions: number | null, rate: number) => (sessions ? Math.round((sessions * rate) / 100) : 0);
  return {
    currency: g.currency,
    periodDays: g.periodDays,
    sessions: g.sessions,
    purchases: g.conversions,
    revenue: g.revenue,
    funnel: g.funnel.map(s => ({ event: s.event, count: s.count })),
    channels: g.channels.map(c => ({ name: c.name, sessions: c.sessions ?? 0, purchases: rateToPurchases(c.sessions, c.conversionRate) })),
    newVsReturning: g.segments.map(s => ({ name: s.name, sessions: s.sessions ?? 0, purchases: rateToPurchases(s.sessions, s.conversionRate) })),
    devices: [],
    landing: [],
  };
}

const ORDER = ["view_item", "add_to_cart", "begin_checkout", "add_shipping_info", "add_payment_info", "purchase"];

function money(n: number, currency: string | null, ar = false): string {
  const rounded = n >= 100000 ? Math.round(n / 1000) * 1000 : n >= 10000 ? Math.round(n / 100) * 100 : Math.round(n);
  const s = rounded.toLocaleString("en-US");
  if (!currency) return s;
  const arCur: Record<string, string> = { EGP: "ج.م", SAR: "ر.س", AED: "د.إ", KWD: "د.ك", QAR: "ر.ق", BHD: "د.ب", OMR: "ر.ع", USD: "$" };
  return ar ? `${s} ${arCur[currency] ?? currency}` : `${currency} ${s}`;
}

const pct = (n: number) => `${(Math.round(n * 1000) / 10).toString()}%`;

const CHANNEL_AR: Record<string, string> = {
  "Organic Search": "البحث المجاني", "Paid Search": "البحث المدفوع", "Organic Social": "التواصل الاجتماعي المجاني", "Paid Social": "التواصل الاجتماعي المدفوع",
  Direct: "الزيارات المباشرة", Referral: "الإحالات", Email: "البريد الإلكتروني", Unassigned: "غير محدد المصدر", "Cross-network": "عبر الشبكات",
  "Paid Other": "مدفوع آخر", "Organic Shopping": "التسوق المجاني", "Paid Shopping": "التسوق المدفوع", Display: "الإعلانات المصوّرة", Affiliates: "التسويق بالعمولة",
};
const DEVICE_AR: Record<string, string> = { mobile: "الهاتف", desktop: "الكمبيوتر", tablet: "التابلت" };

export function buildInsights(opts: { oauth?: unknown; ga4?: Ga4Metrics | null }): FudInsights | null {
  const d = fromOAuth(opts.oauth) ?? fromSummary(opts.ga4);
  if (!d || !d.sessions || d.sessions < MIN_SESSIONS) return null;
  const lines: FudInsightLine[] = [];
  const cr = d.purchases ? d.purchases / d.sessions : null;
  const aov = d.revenue && d.purchases ? d.revenue / d.purchases : null;
  const monthly = d.revenue ? (d.revenue / d.periodDays) * 30 : null;

  // ---- revenue opportunity -------------------------------------------------
  let opportunity: FudInsights["opportunity"] = null;
  const byEvent = new Map(d.funnel.map(s => [s.event, s.count]));
  const steps = ORDER.filter(e => byEvent.has(e));
  const leaks: NonNullable<FudInsights["opportunity"]>["steps"] = [];
  const gaps: Array<{ from: string; to: string; rate: number }> = [];
  for (let i = 0; i < steps.length - 1; i++) {
    const from = steps[i];
    const to = steps[i + 1];
    const a = byEvent.get(from)!;
    const b = byEvent.get(to)!;
    const benchmark = STEP_BENCHMARKS[`${from}>${to}`];
    if (!benchmark || a < 50 || b > a) continue;
    const rate = b / a;
    if (rate >= benchmark) continue;
    if (rate < benchmark * TRACKING_GAP_SHARE) {
      gaps.push({ from, to, rate });
      continue;
    }
    leaks.push({ from, to, rate, benchmark, lowMultiplier: (rate + LOW_SHARE * (benchmark - rate)) / rate, highMultiplier: (rate + HIGH_SHARE * (benchmark - rate)) / rate });
  }
  if (monthly && leaks.length) {
    const low = Math.min(MAX_MULTIPLIER, leaks.reduce((m, l) => m * l.lowMultiplier, 1));
    const high = Math.min(MAX_MULTIPLIER, leaks.reduce((m, l) => m * l.highMultiplier, 1));
    opportunity = { low: monthly * (low - 1), high: monthly * (high - 1), monthlyRevenue: monthly, steps: leaks, basis: "funnel" };
  } else if (monthly && cr !== null && cr < 0.02) {
    // No usable funnel: lift overall conversion a quarter / half of the way to 2%.
    const low = Math.min(MAX_MULTIPLIER, (cr + LOW_SHARE * (0.02 - cr)) / cr);
    const high = Math.min(MAX_MULTIPLIER, (cr + HIGH_SHARE * (0.02 - cr)) / cr);
    opportunity = { low: monthly * (low - 1), high: monthly * (high - 1), monthlyRevenue: monthly, steps: [], basis: "conversion_rate" };
  }

  const STEP_EN: Record<string, string> = { view_item: "product views", add_to_cart: "add-to-carts", begin_checkout: "checkouts started", add_shipping_info: "shipping details entered", add_payment_info: "payment details entered", purchase: "purchases" };
  const STEP_AR: Record<string, string> = { view_item: "مشاهدات المنتجات", add_to_cart: "الإضافات إلى السلة", begin_checkout: "بدء إتمام الشراء", add_shipping_info: "إدخال بيانات الشحن", add_payment_info: "إدخال بيانات الدفع", purchase: "عمليات الشراء" };
  for (const g of gaps) {
    lines.push({
      kind: "funnel",
      tone: "bad",
      en: `Only ${pct(g.rate)} of ${STEP_EN[g.from]} are followed by ${STEP_EN[g.to]} in GA4 — so low it is more likely an event that isn't firing than real lost sales. Fix the tracking first (see the GA4 checks), then this step can be measured.`,
      ar: `${pct(g.rate)} فقط من ${STEP_AR[g.from]} يتبعها ${STEP_AR[g.to]} في GA4 — نسبة منخفضة جدًا، والأرجح أن الحدث لا يُسجَّل وليست مبيعات ضائعة فعلًا. أصلح التتبع أولًا (راجع فحوصات GA4) ثم يمكن قياس هذه الخطوة.`,
    });
  }
  if (!opportunity && steps.length >= 3 && leaks.length === 0 && gaps.length === 0) {
    lines.push({
      kind: "funnel",
      tone: "good",
      en: "Every step of your purchase funnel converts at or above typical benchmarks, so the biggest gains are in getting more of the right visitors and raising order value, not in fixing a broken step.",
      ar: "كل خطوة في مسار الشراء لديك تحقق معدلات مساوية للمعتاد أو أعلى، لذلك أكبر المكاسب في جلب زوار مناسبين أكثر ورفع قيمة الطلب، وليس في إصلاح خطوة معطلة.",
    });
  }

  // ---- devices -----------------------------------------------------------------
  const totalDev = d.devices.reduce((s, x) => s + x.sessions, 0);
  const mobile = d.devices.find(x => x.name === "mobile");
  const desktop = d.devices.find(x => x.name === "desktop");
  if (mobile && totalDev > 0) {
    const share = mobile.sessions / totalDev;
    let en = `${pct(share)} of your visits are on a phone, so the phone experience is your store for most shoppers.`;
    let ar = `${pct(share)} من زياراتك من الهاتف، أي أن تجربة الهاتف هي متجرك بالنسبة لمعظم المتسوقين.`;
    let tone: FudInsightLine["tone"] = "neutral";
    if (mobile.purchases !== null && desktop?.purchases && desktop.sessions >= 200 && mobile.sessions >= 200) {
      const mCr = mobile.purchases / mobile.sessions;
      const dCr = desktop.purchases / desktop.sessions;
      if (dCr > 0 && mCr < dCr * 0.75) {
        en = `${pct(share)} of your visits are on a phone, but phones convert at ${pct(mCr)} against ${pct(dCr)} on desktop. Closing part of that gap is where most of the money is.`;
        ar = `${pct(share)} من زياراتك من الهاتف، لكن معدل التحويل على الهاتف ${pct(mCr)} مقابل ${pct(dCr)} على الكمبيوتر. تقليص جزء من هذه الفجوة هو أكبر فرصة لديك.`;
        tone = "bad";
      } else {
        en = `${pct(share)} of your visits are on a phone, and phones convert at ${pct(mCr)} — in line with desktop (${pct(dCr)}).`;
        ar = `${pct(share)} من زياراتك من الهاتف، ومعدل التحويل على الهاتف ${pct(mCr)} — قريب من الكمبيوتر (${pct(dCr)}).`;
        tone = "good";
      }
    }
    lines.push({ kind: "device", tone, en, ar });
  }

  // ---- new vs returning ---------------------------------------------------------
  const nv = d.newVsReturning.find(x => x.name === "new");
  const rv = d.newVsReturning.find(x => x.name === "returning");
  if (nv && rv && nv.sessions >= 200 && rv.sessions >= 100 && nv.purchases > 0) {
    const n = nv.purchases / nv.sessions;
    const r = rv.purchases / rv.sessions;
    const ratio = r / n;
    const good = ratio >= 2;
    lines.push({
      kind: "new_returning",
      tone: good ? "good" : "bad",
      en: good
        ? `Returning visitors buy ${ratio.toFixed(1)}× as often as new ones (${pct(r)} vs ${pct(n)}) — above the 2× a healthy store shows, so people who come back trust you.`
        : `Returning visitors buy only ${ratio.toFixed(1)}× as often as new ones (${pct(r)} vs ${pct(n)}); a healthy store sees about 2×. Bringing people back (email, WhatsApp, loyalty) is underused.`,
      ar: good
        ? `الزوار العائدون يشترون ${ratio.toFixed(1)} أضعاف الزوار الجدد (${pct(r)} مقابل ${pct(n)}) — أعلى من الضعفين المعتاد في المتاجر الجيدة، أي أن من يعود يثق بك.`
        : `الزوار العائدون يشترون ${ratio.toFixed(1)} أضعاف الزوار الجدد فقط (${pct(r)} مقابل ${pct(n)})، والمعتاد حوالي الضعفين. إعادة الزوار (البريد، واتساب، برامج الولاء) غير مستغلة بالكامل.`,
    });
  }

  // ---- channels ---------------------------------------------------------------------
  const chans = d.channels.filter(c => c.sessions >= 300).map(c => ({ ...c, cr: c.purchases / c.sessions }));
  if (chans.length >= 2 && cr) {
    const biggest = [...chans].sort((a, b) => b.sessions - a.sessions)[0];
    const best = [...chans].filter(c => !NOT_A_CHANNEL.test(c.name)).sort((a, b) => b.cr - a.cr)[0] ?? chans[0];
    const share = biggest.sessions / d.sessions;
    if (biggest.cr < cr * 0.85 && share >= 0.3) {
      lines.push({
        kind: "channel",
        tone: "bad",
        en: `${biggest.name} brings ${pct(share)} of your visits but converts at ${pct(biggest.cr)}, below your store average of ${pct(cr)}. The ad traffic you pay for lands on pages that don't close the sale${best.name !== biggest.name ? `; ${best.name} converts best at ${pct(best.cr)}` : ""}.`,
        ar: `${CHANNEL_AR[biggest.name] ?? biggest.name} يجلب ${pct(share)} من زياراتك لكن معدل تحويله ${pct(biggest.cr)}، أقل من متوسط متجرك ${pct(cr)}. الزيارات التي تدفع ثمنها تصل إلى صفحات لا تُكمل البيع${best.name !== biggest.name ? `؛ وأفضل مصدر هو ${CHANNEL_AR[best.name] ?? best.name} بمعدل ${pct(best.cr)}` : ""}.`,
      });
    } else if (best.name !== biggest.name) {
      lines.push({
        kind: "channel",
        tone: "neutral",
        en: `${best.name} converts best (${pct(best.cr)}); ${biggest.name} brings the most visits (${pct(share)} at ${pct(biggest.cr)}).`,
        ar: `${CHANNEL_AR[best.name] ?? best.name} هو الأعلى تحويلًا (${pct(best.cr)})، و${CHANNEL_AR[biggest.name] ?? biggest.name} يجلب أكبر عدد من الزيارات (${pct(share)} بمعدل ${pct(biggest.cr)}).`,
      });
    }
  }

  // ---- landing pages -------------------------------------------------------------------
  if (cr && d.landing.length) {
    const sessions = d.sessions;
    const weak = d.landing.filter(l => l.sessions >= Math.max(500, sessions * 0.05) && l.purchases / l.sessions < cr * 0.6).sort((a, b) => b.sessions - a.sessions)[0];
    if (weak) {
      const wcr = weak.purchases / weak.sessions;
      lines.push({
        kind: "landing",
        tone: "bad",
        en: `${weak.path} receives ${weak.sessions.toLocaleString("en-US")} visits a month as a first page but converts at ${pct(wcr)}, under ${Math.round((wcr / cr) * 100)}% of your average. It is the first page to fix.`,
        ar: `الصفحة ${weak.path} تستقبل ${weak.sessions.toLocaleString("en-US")} زيارة شهريًا كأول صفحة، لكن معدل تحويلها ${pct(wcr)} فقط، أي ${Math.round((wcr / cr) * 100)}% من متوسطك. هي أول صفحة يجب إصلاحها.`,
      });
    }
  }

  return {
    source: fromOAuth(opts.oauth) ? "ga4_oauth" : "ga4_summary",
    currency: d.currency,
    periodDays: d.periodDays,
    sessions: d.sessions,
    purchases: d.purchases,
    revenue: d.revenue,
    conversionRate: cr,
    aov,
    opportunity,
    lines,
    text: opportunity
      ? {
          en: `Estimated extra revenue if the weakest funnel steps move part of the way to typical benchmarks: ${money(opportunity.low, d.currency)}–${money(opportunity.high, d.currency)} a month.`,
          ar: `الإيرادات الإضافية المتوقعة إذا تحسنت أضعف خطوات مسار الشراء جزئيًا نحو المعدلات المعتادة: ${money(opportunity.low, d.currency, true)}–${money(opportunity.high, d.currency, true)} شهريًا.`,
        }
      : null,
  };
}

export { money as formatMoney, pct as formatPct, CHANNEL_AR, DEVICE_AR };
