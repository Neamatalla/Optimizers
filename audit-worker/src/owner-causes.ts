// Store owner (ICP1): "What's costing me sales?", answered by root cause.
//
// The owner report opens with this (ROUNDS-LOG-OWNER.md round 2). Every
// failed point and every page-review problem lands in exactly one cause, so a
// symptom seen three ways (GA4 says carts don't reach checkout, our phone
// visit saw the delivery cost hidden in the cart, the free-delivery threshold
// sits far above the average order) reads as one cause with its evidence
// chain: what we saw → what it costs → what to do first → how sure we are
// (owner-market-research.md item M8).
//
// Pure: no HTML. html-report.ts renders it. Money is never summed: a cause
// shows the single largest GA4 range among its own points, and the opening
// names only the largest of those as "the biggest".

import { PERSONA_SHARED_SOURCES } from "./checklist-persona-data.js";
import type { AuditResult, CategoryKey, FindingAction, FindingSeverity } from "./types.js";

export type Bi = [string, string];
export type Money = NonNullable<FindingAction["money"]>;

export type CauseKey =
  | "broken" | "phones" | "cart_cost" | "payment" | "product" | "wasted" | "trust" | "contact"
  | "homepage" | "finding" | "arabic" | "repeat"
  | "counting" | "credit" | "ads" | "privacy"
  | "other";

// "sales": costs sales directly. "numbers": makes the sales numbers (and the
// ad platforms' numbers) wrong, so decisions taken on them go wrong. "risk":
// customer data or old code, a risk rather than lost sales.
export type CauseKind = "sales" | "numbers" | "risk";

export interface CauseDef {
  key: CauseKey;
  kind: CauseKind;
  title: Bi;
  // The cause as a short phrase for the opening's answer line.
  phrase: Bi;
}

// Order = tie-break order when two causes have the same money and severity.
export const OWNER_CAUSES: CauseDef[] = [
  { key: "broken", kind: "sales", title: ["Something on the way to buying is broken", "فيه شي خربان في طريق الشراء"], phrase: ["broken buying steps", "خطوات شراء خربانة"] },
  { key: "cart_cost", kind: "sales", title: ["Shoppers can't see the delivery cost and total before checkout", "العميل ما يشوف تكلفة التوصيل والإجمالي قبل الدفع"], phrase: ["unclear costs in the cart", "تكلفة مو واضحة في السلة"] },
  { key: "phones", kind: "sales", title: ["Your store is harder to buy from on a phone", "الشراء من متجرك على الجوال أصعب"], phrase: ["the phone experience", "تجربة الجوال"] },
  { key: "payment", kind: "sales", title: ["Shoppers drop out at payment", "العميل يطلع عند الدفع"], phrase: ["the payment step", "خطوة الدفع"] },
  { key: "product", kind: "sales", title: ["Product pages don't convince shoppers to add to cart", "صفحات المنتجات ما تقنع العميل يضيف للسلة"], phrase: ["product pages that don't convince", "صفحات منتجات ما تقنع"] },
  { key: "wasted", kind: "sales", title: ["Visits land on pages that don't sell", "الزيارات تنزل في صفحات ما تبيع"], phrase: ["visits that land where nobody buys", "زيارات تنزل في صفحات ما تبيع"] },
  { key: "trust", kind: "sales", title: ["Shoppers aren't sure they can trust the store", "العميل مو متأكد إنه يقدر يثق بالمتجر"], phrase: ["doubts about trust", "الشك في الثقة"] },
  { key: "contact", kind: "sales", title: ["Shoppers can't reach you easily on WhatsApp", "العميل ما يقدر يوصلك بسهولة على الواتساب"], phrase: ["WhatsApp that's hard to reach", "واتساب صعب الوصول له"] },
  { key: "homepage", kind: "sales", title: ["Your homepage doesn't say why to buy from you", "صفحتك الرئيسية ما تقول ليش يشتري منك"], phrase: ["a homepage that doesn't say why to buy", "صفحة رئيسية ما تقول ليش يشتري منك"] },
  { key: "finding", kind: "sales", title: ["Shoppers struggle to find the right product", "العميل يتعب لين يلقى المنتج المناسب"], phrase: ["products that are hard to find", "منتجات صعب يلقاها العميل"] },
  { key: "arabic", kind: "sales", title: ["The Arabic store doesn't read right", "النسخة العربية من متجرك مو مضبوطة"], phrase: ["Arabic pages that don't read right", "صفحات عربية مو مضبوطة"] },
  { key: "repeat", kind: "sales", title: ["Few buyers come back for a second order", "قليل من العملاء يرجعون يطلبون مرة ثانية"], phrase: ["few repeat buyers", "قلة العملاء اللي يرجعون"] },
  { key: "counting", kind: "numbers", title: ["Your sales aren't counted right", "مبيعاتك ما تنحسب صح"], phrase: ["sales that aren't counted right", "مبيعات ما تنحسب صح"] },
  { key: "credit", kind: "numbers", title: ["Sales are credited to the wrong source", "المبيعات تنحسب لمصدر غلط"], phrase: ["sales credited to the wrong source", "مبيعات تنحسب لمصدر غلط"] },
  { key: "ads", kind: "numbers", title: ["Your ad platforms get wrong or missing sales", "منصات إعلاناتك توصلها مبيعات غلط أو ناقصة"], phrase: ["ad platforms that see the wrong sales", "منصات إعلانات تشوف مبيعات غلط"] },
  { key: "privacy", kind: "risk", title: ["Customer data and old scripts need a clean-up", "بيانات العملاء والأكواد القديمة تحتاج ترتيب"], phrase: ["customer data that needs a clean-up", "بيانات عملاء تحتاج ترتيب"] },
  { key: "other", kind: "sales", title: ["Other things to fix", "أشياء ثانية تحتاج إصلاح"], phrase: ["other fixes", "إصلاحات ثانية"] },
];

const DEF = new Map(OWNER_CAUSES.map(d => [d.key, d]));
export const causeDef = (key: CauseKey): CauseDef => DEF.get(key)!;

// The owner's own points (checklist-persona-data.ts store_owner). Shared ids
// (results from before the persona lists) resolve through
// PERSONA_SHARED_SOURCES, below. SO-GA4-01 (the weakest step) follows the
// step GA4 named: see causeOfPoint.
const POINT_CAUSE: Record<string, CauseKey> = {
  "SO-GA4-02": "payment", "SO-GA4-03": "cart_cost", "SO-GA4-04": "product", "SO-GA4-05": "phones",
  "SO-GA4-06": "counting", "SO-GA4-07": "counting", "SO-GA4-08": "counting", "SO-GA4-09": "product",
  "SO-GA4-10": "wasted", "SO-GA4-11": "cart_cost", "SO-GA4-12": "wasted", "SO-GA4-13": "repeat",
  "SO-GA4-14": "credit", "SO-GA4-15": "credit", "SO-GA4-16": "counting", "SO-GA4-17": "credit",
  "SO-GA4-18": "credit", "SO-GA4-19": "counting", "SO-GA4-20": "counting", "SO-GA4-21": "finding",
  "SO-GA4-22": "counting", "SO-GA4-23": "privacy", "SO-GA4-24": "wasted", "SO-GA4-25": "other",
  "SO-GTM-01": "counting", "SO-GTM-02": "counting", "SO-GTM-03": "counting", "SO-GTM-04": "counting",
  "SO-GTM-05": "ads", "SO-GTM-06": "ads", "SO-GTM-07": "counting", "SO-GTM-08": "counting",
  "SO-GTM-09": "ads", "SO-GTM-10": "ads", "SO-GTM-11": "ads", "SO-GTM-12": "ads",
  "SO-GTM-13": "counting", "SO-GTM-14": "counting", "SO-GTM-15": "ads", "SO-GTM-16": "privacy",
  "SO-GTM-17": "counting", "SO-GTM-18": "privacy", "SO-GTM-19": "counting", "SO-GTM-20": "privacy",
  "SO-GTM-21": "counting", "SO-GTM-22": "counting", "SO-GTM-23": "privacy", "SO-GTM-24": "other",
  "SO-GTM-25": "counting",
  "SO-WC-01": "broken", "SO-WC-02": "broken", "SO-WC-03": "phones", "SO-WC-04": "contact",
  "SO-WC-05": "finding", "SO-WC-06": "counting", "SO-WC-07": "counting", "SO-WC-08": "counting",
  "SO-WC-09": "counting", "SO-WC-10": "broken", "SO-WC-11": "ads", "SO-WC-12": "phones",
  "SO-WC-13": "phones", "SO-WC-14": "phones", "SO-WC-15": "phones", "SO-WC-16": "finding",
  "SO-WC-17": "finding", "SO-WC-18": "counting", "SO-WC-19": "phones", "SO-WC-20": "phones",
  "SO-WC-21": "product", "SO-WC-22": "finding", "SO-WC-23": "counting", "SO-WC-24": "finding",
  "SO-WC-25": "counting",
  "SO-CRO-01": "payment", "SO-CRO-02": "cart_cost", "SO-CRO-03": "cart_cost", "SO-CRO-04": "payment",
  "SO-CRO-05": "contact", "SO-CRO-06": "phones", "SO-CRO-07": "arabic", "SO-CRO-08": "arabic",
  "SO-CRO-09": "cart_cost", "SO-CRO-10": "cart_cost", "SO-CRO-11": "payment", "SO-CRO-12": "phones",
  "SO-CRO-13": "cart_cost", "SO-CRO-14": "trust", "SO-CRO-15": "trust", "SO-CRO-16": "product",
  "SO-CRO-17": "product", "SO-CRO-18": "product", "SO-CRO-19": "product", "SO-CRO-20": "arabic",
  "SO-CRO-21": "product", "SO-CRO-22": "phones", "SO-CRO-23": "finding", "SO-CRO-24": "finding",
  "SO-CRO-25": "phones",
  "SO-CL-01": "phones", "SO-CL-02": "broken", "SO-CL-03": "product",
};

// The page review's rules (fud/rules.ts, rules-cro.ts).
const FUD_CAUSE: Record<string, CauseKey> = {
  A1: "cart_cost", A3: "cart_cost", M3: "cart_cost", K1: "cart_cost", D2: "cart_cost", B5: "cart_cost",
  A4: "payment", L2: "payment",
  A2: "product", B4: "product", P1: "product", P2: "product", P4: "product", P5: "product", P6: "product",
  P7: "product", P8: "product", P9: "product", P10: "product", P11: "product", P12: "product", M1: "product", M2: "product",
  B1: "trust", C1: "trust", C3: "trust", C4: "trust", C5: "trust", D1: "trust", H4: "trust",
  D3: "contact",
  H1: "homepage", H2: "homepage", H3: "homepage", H5: "homepage", H6: "homepage", U1: "homepage",
  N1: "finding", N2: "finding", C6: "finding", D4: "finding", D5: "finding", G1: "finding", G2: "finding",
  P3: "phones",
  R1: "repeat", R2: "repeat",
  L1: "arabic",
};

// The weakest funnel step (SO-GA4-01 / GA4-01) belongs to the cause behind it.
function causeOfStep(step: { from: string; to: string } | null | undefined): CauseKey {
  if (!step) return "other";
  if (step.to === "add_to_cart") return "product";
  if (step.from === "add_to_cart") return "cart_cost";
  if (step.to === "purchase") return "payment";
  return "other";
}

const WEAKEST_STEP = new Set(["SO-GA4-01", "GA4-01"]);

export function causeOfPoint(id: string, step?: { from: string; to: string } | null): CauseKey {
  if (WEAKEST_STEP.has(id)) return causeOfStep(step);
  if (POINT_CAUSE[id]) return POINT_CAUSE[id];
  // A shared id: the owner point rewritten from it.
  for (const [so, sources] of Object.entries(PERSONA_SHARED_SOURCES)) {
    if (so.startsWith("SO-") && sources.includes(id) && POINT_CAUSE[so]) return POINT_CAUSE[so];
  }
  // Another persona's point (a media buyer run re-rendered for layout
  // checks): through the shared points it was rewritten from.
  if (!id.startsWith("SO-")) {
    for (const shared of PERSONA_SHARED_SOURCES[id] ?? []) {
      const c = causeOfPoint(shared, step);
      if (c !== "other") return c;
    }
  }
  return "other";
}

export function causeOfFud(ruleId: string): CauseKey {
  return FUD_CAUSE[ruleId] ?? "other";
}

// ---- the causes for one audit ----

export type EvidenceSource = "ga4" | "gtm" | "code" | "visit" | "clarity" | "speed";

export interface CauseItem {
  kind: "point" | "fud" | "visit" | "speed" | "clarity";
  // checklistId for a point, ruleId for a page-review rule.
  id: string;
  category?: CategoryKey;
  text: Bi;
  source: EvidenceSource;
  // Page-review "Missing" ranks as medium, "Needs work" as low.
  severity: FindingSeverity;
  // Page-review "Needs work": worth checking, not proven.
  soft?: boolean;
  money: Money | null;
  action: { step: Bi; done: Bi; owners: FindingAction["owners"] } | null;
}

export interface OwnerCause {
  def: CauseDef;
  // The problems behind the cause, biggest money first, then severity.
  items: CauseItem[];
  // Context from Google's speed test and Clarity: shown with the cause, not counted.
  support: CauseItem[];
  money: { range: Money; item: CauseItem } | null;
  // The fix to start with: the first item that has an action.
  first: CauseItem | null;
  severity: FindingSeverity;
  sure: "high" | "medium" | "check";
  sources: EvidenceSource[];
}

const SEV_RANK: Record<FindingSeverity, number> = { critical: 0, medium: 1, low: 2 };

function sourceOfPoint(category: CategoryKey, dataSource: string): EvidenceSource {
  if (category === "GA4") return dataSource === "live" ? "ga4" : "code";
  if (category === "GTM") return "gtm";
  return "code";
}

function itemRank(a: CauseItem, b: CauseItem): number {
  return (b.money?.high ?? 0) - (a.money?.high ?? 0)
    || SEV_RANK[a.severity] - SEV_RANK[b.severity]
    || (a.kind === "point" ? 0 : 1) - (b.kind === "point" ? 0 : 1);
}

const KIND_RANK: Record<CauseKind, number> = { sales: 0, numbers: 1, risk: 2 };
const ORDER = new Map(OWNER_CAUSES.map((d, i) => [d.key, i]));

/** Every failed point and page-review problem, grouped by cause, biggest money first. */
export function ownerCauses(result: AuditResult): OwnerCause[] {
  const step = result.ga4Facts?.focus.step ?? null;
  const byKey = new Map<CauseKey, { items: CauseItem[]; support: CauseItem[] }>();
  const add = (key: CauseKey, item: CauseItem, support = false) => {
    const slot = byKey.get(key) ?? { items: [], support: [] };
    (support ? slot.support : slot.items).push(item);
    byKey.set(key, slot);
  };

  for (const cat of result.categories) {
    for (const f of cat.findings) {
      if (f.status !== "fail") continue;
      const ar = f.ar?.business ?? f.business;
      add(causeOfPoint(f.checklistId, step), {
        kind: "point",
        id: f.checklistId,
        category: cat.category,
        text: [f.business.summary, ar.summary],
        source: sourceOfPoint(cat.category, f.dataSource),
        severity: f.severity,
        money: f.action?.money ?? null,
        action: f.action ? {
          step: [f.action.step, f.ar?.action?.step ?? f.action.step],
          done: [f.action.doneWhen, f.ar?.action?.doneWhen ?? f.action.doneWhen],
          owners: f.action.owners,
        } : null,
      });
    }
  }

  // The page review: the status a reviewer set wins; hidden ones are out.
  for (const f of result.fud?.findings ?? []) {
    const status = f.override?.to ?? f.status;
    if (status !== "fail" && status !== "warn") continue;
    const ar = f.ar?.business ?? f.business;
    const rec = f.action?.step ?? f.recommendation;
    add(causeOfFud(f.ruleId), {
      kind: "fud",
      id: f.ruleId,
      text: [f.business.summary, ar.summary],
      source: "visit",
      severity: status === "fail" ? "medium" : "low",
      soft: status === "warn",
      money: null,
      action: rec ? {
        step: [rec, f.ar?.recommendation ?? rec],
        done: [f.action?.doneWhen ?? "", f.ar?.doneWhen ?? f.action?.doneWhen ?? ""],
        owners: f.action?.owners ?? [],
      } : null,
    });
  }

  // What the phone visit saw that no rule reports on its own: a WhatsApp or
  // phone link that doesn't open, and an Add to Cart that didn't work.
  const sc = result.siteChecks;
  if (sc) {
    const brokenWa = sc.contactLinks.filter(c => c.kind === "whatsapp" && !c.valid);
    const wa = sc.contactLinks.filter(c => c.kind === "whatsapp");
    const alreadySaid = byKey.get("contact")?.items.some(i => i.id === "D3" || i.id === "SO-WC-04");
    if (brokenWa.length && !alreadySaid) {
      add("contact", {
        kind: "visit", id: "visit-whatsapp", source: "visit", severity: "medium", money: null, action: null,
        text: [
          wa.length === 1
            ? "Your WhatsApp link doesn't open a chat: the number is wrong."
            : `${brokenWa.length} of your ${wa.length} WhatsApp links ${brokenWa.length === 1 ? "doesn't" : "don't"} open a chat: the number is wrong.`,
          `${brokenWa.length} من ${wa.length} روابط واتساب عندك ما تفتح محادثة: الرقم غلط.`,
        ],
      });
    }
    if (sc.addToCart.attempted && !sc.addToCart.ok && !byKey.get("broken")?.items.some(i => i.id === "SO-WC-01")) {
      add("broken", {
        kind: "visit", id: "visit-atc", source: "visit", severity: "critical", money: null, action: null,
        text: ["On our phone visit, Add to cart didn't put the product in the cart.", "في زيارتنا من الجوال، زر أضف للسلة ما أضاف المنتج."],
      });
    }
  }

  // Context for a cause that already has a problem: the slowest page on a
  // phone (Google's test) and Clarity's taps that do nothing, for "phones".
  if (byKey.has("phones")) {
    const slow = result.pageSpeed?.pages.filter(p => p.mobile !== null).sort((a, b) => a.mobile! - b.mobile!)[0];
    if (slow && slow.mobile! < 50) {
      const [en, ar] = SPEED_PAGE[slow.type] ?? ["One of your pages", "وحدة من صفحاتك"];
      add("phones", {
        kind: "speed", id: "speed", source: "speed", severity: "low", money: null, action: null,
        text: [`${en} scores ${slow.mobile} out of 100 on Google's phone speed test (under 50 is slow).`, `${ar} درجتها ${slow.mobile} من 100 في اختبار سرعة الجوال من Google (أقل من 50 يعني بطيئة).`],
      }, true);
    }
    const dead = result.clarityFacts?.hotPages?.find(h => h.behaviour === "deadClicks");
    if (dead) {
      const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
      add("phones", {
        kind: "clarity", id: "clarity", source: "clarity", severity: "low", money: null, action: null,
        text: [
          `In your Clarity, ${pct(dead.pageRate)} of visits to ${pathOf(dead.url)} tap things that do nothing (${pct(dead.siteRate)} across your store).`,
          `في Clarity حقك، ${pct(dead.pageRate)} من زيارات ${pathOf(dead.url)} يضغطون على أشياء ما تسوي شي (${pct(dead.siteRate)} في متجرك كامل).`,
        ],
      }, true);
    }
  }

  const causes: OwnerCause[] = [];
  for (const [key, slot] of byKey) {
    if (!slot.items.length) continue;
    const items = [...slot.items].sort(itemRank);
    const withMoney = items.filter(i => i.money).sort((a, b) => b.money!.high - a.money!.high)[0];
    const sources = [...new Set([...items, ...slot.support].map(i => i.source))];
    const hard = items.filter(i => !i.soft);
    const sure: OwnerCause["sure"] = sources.includes("ga4") || new Set(items.map(i => i.source)).size >= 2
      ? "high"
      : hard.length ? "medium" : "check";
    causes.push({
      def: causeDef(key),
      items,
      support: slot.support,
      money: withMoney ? { range: withMoney.money!, item: withMoney } : null,
      first: items.find(i => i.action && i.action.step[0]) ?? null,
      severity: items.map(i => i.severity).sort((a, b) => SEV_RANK[a] - SEV_RANK[b])[0],
      sure,
      sources,
    });
  }
  // Biggest money first, then the worst severity, then causes that cost
  // sales before the numbers, the numbers before risks, then the larger group.
  // "Other things to fix" always comes last.
  return causes.sort((a, b) =>
    (a.def.key === "other" ? 1 : 0) - (b.def.key === "other" ? 1 : 0)
    || (b.money?.range.high ?? 0) - (a.money?.range.high ?? 0)
    || SEV_RANK[a.severity] - SEV_RANK[b.severity]
    || KIND_RANK[a.def.kind] - KIND_RANK[b.def.kind]
    || b.items.length - a.items.length
    || ORDER.get(a.def.key)! - ORDER.get(b.def.key)!,
  );
}

const SPEED_PAGE: Record<string, Bi> = {
  home: ["Your homepage", "صفحتك الرئيسية"],
  collection: ["Your collection page", "صفحة التصنيف"],
  cart: ["Your cart", "سلتك"],
  product: ["Your product page", "صفحة المنتج"],
};

function pathOf(url: string): string {
  try { return decodeURIComponent(new URL(url).pathname) || "/"; } catch { return url; }
}

// ---- what a money figure compares (one sentence per kind of GA4 figure) ----

const STEP_IDS = new Set(["SO-GA4-01", "SO-GA4-02", "SO-GA4-03", "SO-GA4-04", "GA4-01", "GA4-02", "GA4-03", "GA4-04"]);

/** What the GA4 money range on this point compares, in the owner's words. */
export function moneyBasis(id: string): Bi {
  const shared = PERSONA_SHARED_SOURCES[id] ?? [];
  const is = (x: string) => id === x || shared.includes(x);
  if (STEP_IDS.has(id)) return ["one buying step against a typical store", "خطوة شراء وحدة بمتجر معتاد"];
  if (is("GA4-05")) return ["your phone sales against your computer sales", "مبيعات الجوال بمبيعات الكمبيوتر"];
  if (is("GA4-06")) return ["that page against your store average", "هذي الصفحة بمتوسط متجرك"];
  if (is("GA4-10")) return ["that product against your other products", "هذا المنتج بباقي منتجاتك"];
  return ["parts of your own Google Analytics numbers", "أجزاء من أرقام Google Analytics حقك ببعض"];
}

// ---- the opening's answer lines ----

export interface OwnerVerdict {
  // Answer to "What's costing <store> sales?"
  answer: Bi;
  // Answer to "Can you trust your sales numbers?", with its verdict word.
  numbers: { word: Bi; tone: "bad" | "warn" | "ok"; line: Bi } | null;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ownerVerdict(causes: OwnerCause[], countingRan: boolean): OwnerVerdict {
  const sales = causes.filter(c => c.def.kind === "sales" && c.def.key !== "other");
  const numbers = causes.filter(c => c.def.kind === "numbers");
  let answer: Bi;
  if (sales.length >= 2) {
    answer = [`${cap(sales[0].def.phrase[0])} first, then ${sales[1].def.phrase[0]}.`, `${sales[0].def.phrase[1]} أول شي، وبعدها ${sales[1].def.phrase[1]}.`];
  } else if (sales.length === 1) {
    answer = [`Mainly ${sales[0].def.phrase[0]}.`, `أغلبه من ${sales[0].def.phrase[1]}.`];
  } else if (numbers.length) {
    answer = ["Nothing we checked is clearly losing you sales. Your sales numbers need fixing first.", "ما لقينا شي واضح يضيّع عليك مبيعات. أرقام مبيعاتك تحتاج تصليح أول."];
  } else if (causes.length) {
    answer = ["Nothing big. A few smaller fixes are below.", "ما فيه شي كبير. تحت فيه كم إصلاح صغير."];
  } else {
    answer = ["Nothing we checked is costing you sales.", "ما فيه شي من اللي فحصناه يضيّع عليك مبيعات."];
  }
  const n = numbers.reduce((s, c) => s + c.items.length, 0);
  let verdict: OwnerVerdict["numbers"] = null;
  if (n) {
    const critical = numbers.some(c => c.severity === "critical");
    verdict = critical
      ? { word: ["No", "لا"], tone: "bad", line: [`${n} ${n === 1 ? "problem" : "problems"} in how your sales are counted. Fix these before you judge any number.`, `فيه ${n} ${n === 1 ? "مشكلة" : "مشاكل"} في طريقة حساب مبيعاتك. صلّحها قبل ما تحكم على أي رقم.`] }
      : { word: ["Partly", "جزئيًا"], tone: "warn", line: [`${n} ${n === 1 ? "problem" : "problems"} in how your sales are counted.`, `فيه ${n} ${n === 1 ? "مشكلة" : "مشاكل"} في طريقة حساب مبيعاتك.`] };
  } else if (countingRan) {
    verdict = { word: ["Yes", "إيه"], tone: "ok", line: ["Your sales are counted once, with their value.", "مبيعاتك تنحسب مرة وحدة وبقيمتها."] };
  }
  return { answer, numbers: verdict };
}
