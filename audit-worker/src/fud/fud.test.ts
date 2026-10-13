import assert from "node:assert/strict";
import { test } from "node:test";
import type { Ga4Metrics } from "../types.js";
import type { PageEvidence, StoreEvidence, TextBlock } from "./evidence.js";
import { assemble } from "./index.js";
import type { JudgeVerdict } from "./judge.js";
import { parseVerdicts } from "./judge.js";
import { isBlockedHit } from "./collect.js";
import { FUD_RULES, ruleById } from "./rules.js";
import { band, computePexti, frictionScore, funnelLeak, gate, pextiScore } from "./score.js";
import { matches, normalize, widgetsIn } from "./signals.js";

// ---- signals ----------------------------------------------------------------

test("normalize folds Arabic-Indic digits, alef forms and spacing", () => {
  assert.equal(normalize("خلال ٣ أيام"), "خلال 3 ايام");
  assert.equal(normalize("  FREE   Shipping "), " free shipping ");
});

test("free-shipping thresholds match in English and Arabic, with local currencies", () => {
  for (const s of [
    "Free shipping on orders over 500 EGP",
    "FREE DELIVERY above AED 200",
    "شحن مجاني للطلبات فوق ٥٠٠ ج.م",
    "توصيل مجاني عند الشراء بقيمة 300 ريال",
    "Add EGP 120 more for free shipping",
    "أضف 150 ر.س للحصول على شحن مجاني",
  ]) assert.ok(matches("shippingThreshold", s), s);
  assert.ok(!matches("shippingThreshold", "Fast shipping to all governorates"));
});

test("cash on delivery, installments and delivery time", () => {
  assert.ok(matches("cod", "الدفع عند الاستلام متاح"));
  assert.ok(matches("cod", "Cash on Delivery available"));
  assert.ok(matches("installments", "قسّط على 4 دفعات بدون فوائد".replace("ّ", "")));
  assert.ok(matches("installments", "Pay in 4 interest-free payments with Tabby"));
  assert.ok(matches("deliveryTime", "التوصيل خلال ٢-٤ أيام"));
  assert.ok(matches("deliveryTime", "Delivered in 2-4 business days"));
  assert.ok(matches("returnsDays", "14-day returns"));
  assert.ok(matches("returnsDays", "استرجاع مجاني خلال ١٤ يوم"));
});

test("widget fingerprints", () => {
  assert.deepEqual(widgetsIn('<script src="https://cdn.judge.me/widget.js"></script><a href="https://wa.me/2010">x</a>').sort(), ["judgeme", "whatsapp"]);
  assert.ok(widgetsIn('<div class="tabby-promo-snippet"></div><script src="https://checkout.tabby.ai/tabby-promo.js">').includes("tabby"));
});

test("only analytics collection hits are blocked, not the tag scripts", () => {
  assert.ok(isBlockedHit("https://region1.google-analytics.com/g/collect?v=2&en=add_to_cart"));
  assert.ok(isBlockedHit("https://www.facebook.com/tr/?id=1&ev=AddToCart"));
  assert.ok(isBlockedHit("https://analytics.tiktok.com/api/v2/pixel"));
  assert.ok(!isBlockedHit("https://www.googletagmanager.com/gtm.js?id=GTM-ABC"));
  assert.ok(!isBlockedHit("https://connect.facebook.net/en_US/fbevents.js"));
  assert.ok(!isBlockedHit("https://store.com/cart/add.js"));
});

// ---- score ------------------------------------------------------------------

const autoFail = { autoFail: true };

test("gate: FAIL needs confidence, detector agreement, autoFail and allowFail", () => {
  const base = { proposed: "fail" as const, confidence: 0.9, signal: "absent" as const, validBlockIds: 0, rule: autoFail, allowFail: true };
  assert.equal(gate(base), "fail");
  assert.equal(gate({ ...base, confidence: 0.8 }), "warn");
  assert.equal(gate({ ...base, signal: "present" }), "warn");
  assert.equal(gate({ ...base, signal: "elsewhere" }), "warn");
  assert.equal(gate({ ...base, signal: "unknown" }), "warn");
  assert.equal(gate({ ...base, rule: { autoFail: false } }), "warn");
  assert.equal(gate({ ...base, allowFail: false }), "warn");
});

test("gate: PASS needs a cited block and confidence", () => {
  const base = { proposed: "pass" as const, confidence: 0.9, signal: "present" as const, validBlockIds: 2, rule: autoFail, allowFail: true };
  assert.equal(gate(base), "pass");
  // Detectors agree it's in place: a hesitant or citation-less pass stands.
  assert.equal(gate({ ...base, validBlockIds: 0 }), "pass");
  assert.equal(gate({ ...base, confidence: 0.6 }), "pass");
  // Without that backing, a shaky pass is "not confirmed" — never a WARN.
  const weak = { ...base, signal: "elsewhere" as const };
  assert.equal(gate(weak), "pass");
  assert.equal(gate({ ...weak, validBlockIds: 0 }), "unassessed");
  assert.equal(gate({ ...weak, confidence: 0.6 }), "unassessed");
  assert.equal(gate({ ...base, signal: "absent", confidence: 0.8 }), "unassessed");
  assert.equal(gate({ ...base, signal: "absent", confidence: 0.9 }), "pass");
  assert.equal(gate({ ...base, proposed: "unassessed" }), "unassessed");
});

test("friction score and coverage", () => {
  assert.deepEqual(frictionScore(["pass", "pass", "warn", "fail", "pass", "unassessed"]), { score: 70, assessed: 5, applicable: 6 });
  // too few assessed
  assert.equal(frictionScore(["pass", "fail", "unassessed"]).score, null);
  // coverage below 60%
  assert.equal(frictionScore(["pass", "pass", "pass", "pass", "pass", "unassessed", "unassessed", "unassessed", "unassessed"]).score, null);
  assert.equal(frictionScore([]).score, null);
});

test("PEXTI normalization and bands", () => {
  assert.equal(pextiScore({ P: 1, E: 1, C: 1, T: 1, I: 1 }), 0);
  assert.equal(pextiScore({ P: 5, E: 5, C: 5, T: 5, I: 5 }), 100);
  assert.equal(band(88), "quick_win");
  assert.equal(band(75), "quick_win");
  assert.equal(band(60), "dev_task");
  assert.equal(band(49), "test_first");
});

test("PEXTI: proof from detector agreement and GA4 leak; judge can only lower E/C/T by one", () => {
  const rule = { E: 4, C: 5, T: 5, I: 4 };
  const fail = computePexti({ status: "fail", signal: "absent", rule, leak: false })!;
  assert.deepEqual({ P: fail.P, I: fail.I }, { P: 3, I: 4 });
  const leaky = computePexti({ status: "fail", signal: "absent", rule, leak: true })!;
  assert.deepEqual({ P: leaky.P, I: leaky.I }, { P: 4, I: 5 });
  assert.ok(leaky.score > fail.score);
  const lowered = computePexti({ status: "warn", signal: "elsewhere", rule, judge: { E: 3, C: 1, T: 6 }, leak: false })!;
  assert.deepEqual({ E: lowered.E, C: lowered.C, T: lowered.T }, { E: 3, C: 5, T: 5 });
  assert.equal(computePexti({ status: "pass", signal: "present", rule, leak: false }), null);
});

const ga4 = (funnel: Ga4Metrics["funnel"]): Ga4Metrics => ({ periodDays: 28, currency: "EGP", sessions: 1000, conversions: 10, conversionRate: 1, revenue: 1, funnel, channels: [], segments: [] });

test("funnel leak only below benchmark and with enough data", () => {
  const step = { from: "add_to_cart", to: "begin_checkout" } as const;
  assert.deepEqual(funnelLeak(ga4([{ event: "add_to_cart", count: 400 }, { event: "begin_checkout", count: 120 }]), step), { from: "add_to_cart", to: "begin_checkout", rate: 0.3 });
  assert.equal(funnelLeak(ga4([{ event: "add_to_cart", count: 400 }, { event: "begin_checkout", count: 300 }]), step), null);
  assert.equal(funnelLeak(ga4([{ event: "add_to_cart", count: 20 }, { event: "begin_checkout", count: 2 }]), step), null);
  assert.equal(funnelLeak(null, step), null);
});

// ---- judge parsing ------------------------------------------------------------

test("parseVerdicts keeps valid entries and normalizes fields", () => {
  const v = parseVerdicts({
    findings: [
      { ruleId: "a1", status: "fail", confidence: 1.4, blockIds: ["p1", 3], technical: { summary: "t", detail: "d" }, business: { summary: "b", detail: "d" }, exampleCopy: { en: "x", ar: "" } },
      { ruleId: "B1", status: "nonsense", technical: { summary: "t", detail: "d" }, business: { summary: "b", detail: "d" } },
      { ruleId: "C1", status: "pass", technical: { summary: "", detail: "" }, business: { summary: "b", detail: "d" } },
    ],
  });
  assert.equal(v.length, 2);
  assert.equal(v[0].ruleId, "A1");
  assert.equal(v[0].confidence, 1);
  assert.deepEqual(v[0].blockIds, ["p1"]);
  assert.equal(v[0].exampleCopy, undefined);
  assert.equal(v[1].status, "warn");
});

// ---- end to end on fake evidence ---------------------------------------------

let n = 0;
const block = (prefix: string, text: string, extra: Partial<TextBlock> = {}): TextBlock => ({ id: `${prefix}${++n}`, text, tag: "p", box: { x: 0, y: 900, w: 300, h: 20 }, aboveFold: false, ...extra });

function page(type: PageEvidence["pageType"], blocks: TextBlock[], extra: Partial<PageEvidence> = {}): PageEvidence {
  return { pageType: type, url: `https://store.eg/${type}`, loaded: true, blocks, widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: { fold: "data:image/jpeg;base64,AA", cta: "data:image/jpeg;base64,BB", cart: "data:image/jpeg;base64,CC" }, ...extra };
}

function store(): StoreEvidence {
  n = 0;
  const priceBlock = block("p", "1,250 EGP");
  const nearReturn = block("p", "إرجاع مجاني خلال 14 يوم · الدفع عند الاستلام");
  return {
    website: "https://store.eg",
    pages: [
      page("home", [block("h", "New collection", { aboveFold: true })], { policyLinks: [{ kind: "about", text: "من نحن", href: "/about" }, { kind: "contact", text: "تواصل معنا", href: "/contact" }] }),
      page("product", [priceBlock, nearReturn, block("p", "Size guide")], {
        cta: { text: "أضف إلى السلة", box: { x: 0, y: 900, w: 300, h: 48 }, disabled: false, nearbyBlockIds: [priceBlock.id, nearReturn.id] },
        variants: { hasSize: true, control: "pills", groups: ["Size"] },
      }),
      page("cart", [block("c", "Subtotal 1,250 EGP"), block("c", "Checkout")], { cart: { source: "drawer", empty: false } }),
    ],
    addToCart: { attempted: true, ok: true },
    blockedHits: 4,
    durationMs: 1000,
  };
}

const voice = { summary: "s", detail: "d" };
const verdict = (ruleId: string, status: JudgeVerdict["status"], blockIds: string[] = [], confidence = 0.95): JudgeVerdict => ({ ruleId, applicable: true, status, confidence, blockIds, technical: voice, business: voice });

test("assemble: shipping missing everywhere is a FAIL quick win; judge harshness is overruled by detectors", () => {
  const e = store();
  const verdicts = [
    verdict("A1", "fail"),
    verdict("B1", "fail"), // detector sees returns + COD near the CTA → must not ship as FAIL
    verdict("D1", "pass", ["p2"]),
  ];
  const r = assemble(e, verdicts, null, true);
  const a1 = r.findings.find(f => f.ruleId === "A1")!;
  const b1 = r.findings.find(f => f.ruleId === "B1")!;
  assert.equal(a1.status, "fail");
  assert.equal(a1.band, "quick_win");
  assert.equal(a1.evidence.crop, "data:image/jpeg;base64,CC");
  assert.equal(b1.status, "warn");
  assert.equal(r.findings.find(f => f.ruleId === "D1")!.status, "pass");
  // Rules with no verdict are unassessed, never pass/fail.
  assert.equal(r.findings.find(f => f.ruleId === "C3")!.status, "unassessed");
  // Display order: issues first.
  assert.equal(r.findings[0].status === "fail" || r.findings[0].status === "warn", true);
});

test("assemble: live runs ship FAIL as WARN; empty cart makes cart rules unassessed", () => {
  const e = store();
  e.pages[2].cart = { source: "page", empty: true };
  e.addToCart = { attempted: true, ok: false, reason: "atc_no_drawer" };
  const r = assemble(e, [verdict("A1", "fail"), verdict("B4", "fail")], null, false);
  assert.equal(r.findings.find(f => f.ruleId === "A1")!.status, "unassessed");
  assert.equal(r.findings.find(f => f.ruleId === "A1")!.unassessedReason, "atc_no_drawer");
  assert.ok(["warn"].includes(r.findings.find(f => f.ruleId === "B4")!.status));
});

test("assemble: size rule is skipped for products without sizes", () => {
  const e = store();
  e.pages[1].variants = { hasSize: false, control: "none", groups: [] };
  const r = assemble(e, [], null, true);
  assert.ok(!r.findings.some(f => f.ruleId === "B4"));
});

test("every rule has bilingual titles and sane defaults", () => {
  for (const r of FUD_RULES) {
    assert.ok(r.title.en && r.title.ar, r.id);
    for (const k of ["E", "C", "T", "I"] as const) assert.ok(r[k] >= 1 && r[k] <= 5, `${r.id}.${k}`);
  }
  assert.equal(ruleById("C4")!.autoFail, false);
});

test("assemble: the same crop is shown once, on the highest-priority finding", () => {
  const e = store();
  const r = assemble(e, [verdict("B1", "warn"), verdict("D1", "warn"), verdict("A4", "warn")], null, true);
  const withCta = r.findings.filter(f => f.evidence.crop === "data:image/jpeg;base64,BB");
  assert.equal(withCta.length, 1);
});
