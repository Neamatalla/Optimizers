import assert from "node:assert/strict";
import { test } from "node:test";
import type { Ga4Metrics } from "../types.js";
import type { PageEvidence, PageFacts, StoreEvidence, TextBlock } from "./evidence.js";
import { buildInsights } from "./insights.js";
import { freeShippingThreshold } from "./rules-cro.js";
import { FUD_RULES, groupOf, ruleById } from "./rules.js";
import { matches } from "./signals.js";

let n = 0;
const block = (text: string, extra: Partial<TextBlock> = {}): TextBlock => ({ id: `b${++n}`, text, tag: "p", box: { x: 0, y: 900, w: 300, h: 20 }, aboveFold: false, ...extra });
const facts = (extra: Partial<PageFacts> = {}): PageFacts => ({
  lang: "ar", dir: "rtl", hreflang: [], langSwitch: false, h1: ["Rosemary oil"], h1Count: 1, nav: [],
  search: { present: true, visible: true, action: "/search", param: "q" },
  media: { images: 6, video: true, zoom: false }, infoSections: { details: 4, expanders: 2 },
  heroButtons: ["تسوقي الآن"], hero: null, capture: { email: true, phone: false, account: true }, ...extra,
});
const page = (type: PageEvidence["pageType"], blocks: TextBlock[], extra: Partial<PageEvidence> = {}): PageEvidence => ({
  pageType: type, url: `https://store.eg/${type}`, loaded: true, blocks, widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, ...extra,
});

function store(): StoreEvidence {
  n = 0;
  const bundle = block("اشتري قطعتين ووفري 15%");
  return {
    website: "https://store.eg",
    pages: [
      page("home", [block("زيوت طبيعية لشعر أقوى", { aboveFold: true }), block("خصم 10% على أول طلب")], { facts: facts(), popups: { onLoad: [], afterEscape: 0 } }),
      page("product", [block("LE 1,250"), bundle, block("قد يعجبك أيضًا"), block("شحن مجاني للطلبات فوق 1,500 جنيه")], {
        facts: facts(), sticky: "اطلبيه دلوقتي",
        cta: { text: "أضف إلى السلة", box: { x: 0, y: 900, w: 300, h: 48 }, disabled: false, nearbyBlockIds: [bundle.id] },
        variants: { hasSize: false, control: "pills", groups: ["Volume"] },
      }),
      page("cart", [block("كمّلي روتينك الطبيعي"), block("الدفع عند الاستلام · توصيل لكل مصر")], { cart: { source: "drawer", empty: false } }),
    ],
    desktop: [page("home", [], { facts: facts({ nav: ["زيوت الشعر", "العناية بالبشرة", "العروض", "تواصل معنا"] }) })],
    addToCart: { attempted: true, ok: true },
    searchTest: { query: "Rosemary", url: "https://store.eg/search?q=Rosemary", results: 9, loaded: true },
    context: { aov: 1100, currency: "EGP" },
    blockedHits: 3,
    durationMs: 1,
  };
}

test("rule set: unique ids, every rule grouped and titled in both languages", () => {
  const ids = FUD_RULES.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(FUD_RULES.length >= 30);
  for (const r of FUD_RULES) assert.ok(r.title.en && r.title.ar && groupOf(r), r.id);
  assert.equal(groupOf(ruleById("A1")!), "trust");
  assert.equal(groupOf(ruleById("M1")!), "buy_more");
});

test("new detectors: bundles, cross-sell, loyalty, signup offer, local payment, coverage", () => {
  assert.ok(matches("bundle", "Buy 2 save 15%"));
  assert.ok(matches("bundle", "اشتري قطعتين ووفري"));
  assert.ok(matches("crossSell", "Frequently bought together"));
  assert.ok(matches("crossSell", "كمّلي روتينك الطبيعي".replace("ّ", "")));
  assert.ok(matches("loyalty", "Earn points on every order"));
  assert.ok(matches("signupOffer", "خصم 10% على أول طلب"));
  assert.ok(matches("localPayment", "ادفع بفاليو أو الدفع عند الاستلام"));
  assert.ok(matches("deliveryCoverage", "توصيل لكل مصر"));
});

test("CRO rule signals on a well-built store", () => {
  const e = store();
  const sig = (id: string) => ruleById(id)!.signal(e);
  assert.equal(sig("H2"), "present"); // one hero button
  assert.equal(sig("P1"), "present"); // 6 images + video
  assert.equal(sig("P2"), "present"); // pills
  assert.equal(sig("P3"), "present"); // sticky button found
  assert.equal(sig("P4"), "present");
  assert.equal(sig("N1"), "present"); // 4 desktop menu items
  assert.equal(sig("N2"), "present"); // visible search, 9 results
  assert.equal(sig("M1"), "present"); // bundle next to the button
  assert.equal(sig("M2"), "present"); // cross-sell on product and in cart
  assert.equal(freeShippingThreshold(e), 1500);
  assert.equal(sig("M3"), "present"); // 1500 / 1100 = 1.36
  assert.equal(sig("R1"), "present"); // email field + first-order offer
  assert.equal(sig("L2"), "present"); // COD + nationwide delivery
  assert.equal(sig("U1"), "present"); // no popup
});

test("CRO rule signals on gaps", () => {
  const e = store();
  e.pages[0].facts = facts({ heroButtons: [], search: { present: false, visible: false, action: "", param: "q" } });
  e.pages[0].popups = { onLoad: [{ kind: "discount", cover: 80, text: "Spin to win 20% off" }], afterEscape: 0 };
  e.pages[1].sticky = null;
  e.pages[1].variants = { hasSize: true, control: "dropdown", groups: ["Size"] };
  e.searchTest = undefined;
  e.context = { aov: 2000, currency: "EGP" };
  const sig = (id: string) => ruleById(id)!.signal(e);
  assert.equal(sig("H2"), "absent");
  assert.equal(sig("N2"), "absent");
  assert.equal(sig("P3"), "absent");
  assert.equal(sig("P2"), "absent");
  assert.equal(sig("U1"), "elsewhere");
  assert.equal(sig("M3"), "elsewhere"); // threshold 1500 below a 2000 order: gives margin away
  // Search present but finds nothing.
  e.pages[0].facts = facts();
  e.searchTest = { query: "Rosemary", url: "x", results: 0, loaded: true };
  assert.equal(sig("N2"), "elsewhere");
});

const ga4 = (over: Partial<Ga4Metrics> = {}): Ga4Metrics => ({
  periodDays: 28, currency: "EGP", sessions: 50000, conversions: 600, conversionRate: 1.2, revenue: 600000,
  funnel: [{ event: "view_item", count: 30000 }, { event: "add_to_cart", count: 1500 }, { event: "begin_checkout", count: 600 }, { event: "purchase", count: 300 }],
  channels: [{ name: "Paid Social", sessions: 35000, conversionRate: 0.8 }, { name: "Organic Search", sessions: 8000, conversionRate: 2.5 }, { name: "Unassigned", sessions: 2000, conversionRate: 9 }],
  segments: [{ name: "new", sessions: 40000, conversionRate: 1.0 }, { name: "returning", sessions: 10000, conversionRate: 1.4 }],
  ...over,
});

test("insights: revenue range is bounded, explained, and skips tracking gaps", () => {
  const ins = buildInsights({ ga4: ga4() })!;
  assert.ok(ins.opportunity);
  const o = ins.opportunity!;
  assert.ok(o.low > 0 && o.high > o.low);
  assert.ok(o.high <= o.monthlyRevenue * 0.3 + 1, "capped at 30% of revenue");
  assert.ok(ins.text?.en.includes("EGP"));
  // view_item→add_to_cart 5% vs 8%: a leak; atc→checkout 40% vs 50%: a leak.
  assert.deepEqual(o.steps.map(s => `${s.from}>${s.to}`), ["view_item>add_to_cart", "add_to_cart>begin_checkout"]);
  // A step at 3% of a 50% benchmark reads as a tracking gap, not money.
  const gap = buildInsights({ ga4: ga4({ funnel: [{ event: "add_to_cart", count: 5000 }, { event: "begin_checkout", count: 60 }, { event: "purchase", count: 40 }] }) })!;
  assert.ok(gap.lines.some(l => l.kind === "funnel" && /tracking/.test(l.en)));
  assert.ok(!gap.opportunity || gap.opportunity.steps.every(s => s.from !== "add_to_cart"));
});

test("insights: segments, and 'Unassigned' is never the best channel", () => {
  const ins = buildInsights({ ga4: ga4() })!;
  const ch = ins.lines.find(l => l.kind === "channel")!;
  assert.ok(ch && ch.tone === "bad" && ch.en.startsWith("Paid Social"));
  assert.ok(!/Unassigned converts best/.test(ch.en));
  const nr = ins.lines.find(l => l.kind === "new_returning")!;
  assert.equal(nr.tone, "bad"); // 1.4× < 2×
  assert.equal(buildInsights({ ga4: ga4({ sessions: 100 }) }), null); // too little traffic
});

test("insights read the raw GA4 OAuth reports when present", () => {
  const rep = (rows: Array<[string[], number[]]>, currencyCode?: string) => ({ rows: rows.map(([d, m]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(v => ({ value: String(v) })) })), metadata: { currencyCode } });
  const oauth = {
    reportData: {
      totals: rep([[[], [20000, 12000, 90, 400]]], "SAR"),
      purchaseMetrics: rep([[["purchase"], [400, 200000, 400]]], "SAR"),
      funnel: rep([[["view_item"], [30000, 10000]], [["add_to_cart"], [3000, 1200]], [["purchase"], [500, 400]]]),
      deviceConversion: rep([[["mobile"], [17000, 250, 110000, 250]], [["desktop"], [3000, 150, 90000, 150]]]),
      channels: rep([[["Paid Social"], [12000, 150]], [["Organic Search"], [5000, 200]]]),
      newVsReturning: rep([[["new"], [15000, 200]], [["returning"], [5000, 200]]]),
      landingPages: rep([[["/products/a"], [6000, 20]], [["/"], [8000, 300]]]),
    },
  };
  const ins = buildInsights({ oauth })!;
  assert.equal(ins.source, "ga4_oauth");
  assert.equal(ins.currency, "SAR");
  assert.equal(ins.aov, 500);
  const dev = ins.lines.find(l => l.kind === "device")!;
  assert.equal(dev.tone, "bad"); // mobile 1.5% vs desktop 5%
  assert.ok(ins.lines.some(l => l.kind === "landing" && l.en.includes("/products/a")));
  assert.ok(ins.lines.find(l => l.kind === "new_returning")!.tone === "good"); // 4% vs 1.3%
});
