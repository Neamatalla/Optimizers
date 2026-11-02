import assert from "node:assert/strict";
import { test } from "node:test";
import type { PageEvidence, PageFacts, StoreEvidence, TextBlock } from "./evidence.js";
import { RULE_ACTIONS } from "./rule-actions.js";
import { FUD_RULES, RULE_SET_VERSION, ruleById } from "./rules.js";
import { matches } from "./signals.js";

// fud-2.1.0: the landing-page framework rules (H3-H6, P5-P12, K1, G1-G2).
let n = 0;
const block = (text: string, extra: Partial<TextBlock> = {}): TextBlock => ({ id: `b${++n}`, text, tag: "p", box: { x: 0, y: 900, w: 300, h: 20 }, aboveFold: false, ...extra });
const top = (text: string, extra: Partial<TextBlock> = {}) => block(text, { aboveFold: true, box: { x: 0, y: 200, w: 300, h: 20 }, ...extra });
const facts = (extra: Partial<PageFacts> = {}): PageFacts => ({
  lang: "ar", dir: "rtl", hreflang: [], langSwitch: false, h1: ["Rosemary oil"], h1Count: 1, nav: [],
  search: { present: true, visible: true, action: "/search", param: "q" },
  media: { images: 6, video: true, zoom: false }, infoSections: { details: 4, expanders: 2 },
  heroButtons: ["تسوقي الآن"], hero: null, capture: { email: true, phone: false, account: true }, ...extra,
});
const page = (type: PageEvidence["pageType"], blocks: TextBlock[], extra: Partial<PageEvidence> = {}): PageEvidence => ({
  pageType: type, url: `https://store.eg/${type}`, loaded: true, blocks, widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, ...extra,
});
const evidence = (pages: PageEvidence[]): StoreEvidence => ({
  website: "https://store.eg", pages, desktop: [], addToCart: { attempted: true, ok: true }, searchTest: null,
  context: { aov: 1100, currency: "EGP" }, blockedHits: 0, durationMs: 1,
} as unknown as StoreEvidence);
const sig = (id: string, e: StoreEvidence) => ruleById(id)!.signal(e);
const NEW = ["H3", "H4", "H5", "H6", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "K1", "G1", "G2"];

test("fud-2.1.0: 15 new rules, each with an action and a fix owner", () => {
  assert.equal(RULE_SET_VERSION, "fud-2.1.0");
  assert.equal(FUD_RULES.length, 48);
  for (const id of NEW) {
    const r = ruleById(id);
    assert.ok(r, id);
    assert.equal(r!.autoFail, false, `${id} is WARN at most`);
    assert.ok(RULE_ACTIONS[id]?.owners.length && RULE_ACTIONS[id].doneWhen.en && RULE_ACTIONS[id].doneWhen.ar, id);
  }
  for (const r of FUD_RULES) assert.ok(RULE_ACTIONS[r.id], `every rule has an action: ${r.id}`);
});

test("new patterns read English and Egyptian Arabic", () => {
  assert.ok(matches("ratedBy", "Rated 4.8/5 by 12,000+ customers"));
  assert.ok(matches("ratedBy", "+15,000 عميل سعيد"));
  assert.ok(matches("checkMark", "✓ Gluten-free"));
  assert.ok(matches("genericCta", "shop now"));
  assert.ok(matches("genericCta", "تسوقي الان"));
  assert.ok(!matches("genericCta", "shop bestsellers"));
  assert.ok(matches("howItWorks", "How it works: 3 easy steps"));
  assert.ok(matches("howItWorks", "طريقة الطلب"));
  assert.ok(matches("faq", "Frequently asked questions"));
  assert.ok(matches("faq", "الأسئلة الشائعة".replace("أ", "ا")));
  assert.ok(matches("comparison", "Us vs others"));
  assert.ok(matches("comparison", "ليه تختار منتجاتنا"));
  assert.ok(matches("savings", "You saved 250 EGP"));
  assert.ok(matches("savings", "وفرت ٢٥٠ جنيه"));
  assert.ok(matches("merchBadge", "Best seller"));
  assert.ok(matches("merchBadge", "الأكثر مبيعًا".replace("أ", "ا")));
  assert.ok(matches("whatsIncluded", "What's in the box"));
  assert.ok(matches("ugc", "Real results from real customers"));
});

test("homepage: offer bar, rating, benefit points, specific button", () => {
  const good = evidence([page("home", [
    top("شحن مجاني للطلبات فوق 1000 جنيه", { box: { x: 0, y: 10, w: 390, h: 24 } }),
    top("★★★★★ Rated 4.8/5 by 12,000+ customers"),
    top("✓ Natural oils", { tag: "li" }), top("✓ Delivery in 48 hours", { tag: "li" }),
  ], { facts: facts({ heroButtons: ["Shop bestsellers"] }) })]);
  assert.equal(sig("H3", good), "present");
  assert.equal(sig("H4", good), "present");
  assert.equal(sig("H5", good), "present");
  assert.equal(sig("H6", good), "present");
  const bare = evidence([page("home", [top("Welcome"), block("reviews")], { facts: facts({ heroButtons: ["تسوقي الآن"] }) })]);
  assert.equal(sig("H3", bare), "unknown");
  assert.equal(sig("H4", bare), "elsewhere"); // reviews exist, but below the first screen
  assert.equal(sig("H5", bare), "unknown");
  assert.equal(sig("H6", bare), "absent"); // generic "shop now"
  assert.equal(ruleById("H6")!.applies!(evidence([page("home", [], { facts: facts({ heroButtons: [] }) })])), false);
});

test("product page: benefit points, steps, UGC, comparison, FAQ, what's included", () => {
  const good = evidence([page("product", [
    top("✓ 25g protein per serving", { tag: "li" }), top("✓ Gluten-free", { tag: "li" }),
    block("How it works: order today, delivered in 2 days"), block("Real results from real customers"),
    block("Us vs others"), block("Frequently asked questions"), block("What's in the box: 2 bottles"),
  ])]);
  for (const id of ["P5", "P6", "P8", "P9", "P10", "P12"]) assert.equal(sig(id, good), "present", id);
  assert.equal(sig("P7", good), "unknown"); // judgement only
  assert.equal(sig("P11", good), "unknown");
  const bare = evidence([page("product", [block("LE 1,250")], { policyLinks: [{ kind: "faq", text: "FAQ", href: "/faq" }] })]);
  assert.equal(sig("P6", bare), "absent");
  assert.equal(sig("P9", bare), "absent");
  assert.equal(sig("P10", bare), "elsewhere"); // only a link to a general FAQ
  assert.equal(sig("P8", evidence([page("product", [], { widgets: ["loox"] })])), "present"); // photo-review app
});

test("cart savings only applies to discounted products; collection header and badges", () => {
  const sale = evidence([page("product", [block("خصم 20%")]), page("cart", [block("وفرت 250 جنيه")], { cart: { source: "drawer", empty: false } })]);
  assert.equal(ruleById("K1")!.applies!(sale), true);
  assert.equal(sig("K1", sale), "present");
  const noSave = evidence([page("product", [block("خصم 20%")]), page("cart", [block("الإجمالي 1,000")], { cart: { source: "drawer", empty: false } })]);
  assert.equal(sig("K1", noSave), "absent");
  assert.equal(ruleById("K1")!.applies!(evidence([page("product", [block("LE 1,250")])])), false);
  const col = evidence([page("collection", [top("عبايات بتريحك طول اليوم · 4.8/5"), block("Best seller")])]);
  assert.equal(sig("G1", col), "present");
  assert.equal(sig("G2", col), "present");
  assert.equal(sig("G2", evidence([page("collection", [block("Abaya")])])), "absent");
});
