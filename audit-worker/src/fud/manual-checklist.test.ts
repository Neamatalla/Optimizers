import assert from "node:assert/strict";
import { test } from "node:test";
import type { StoreEvidence } from "./evidence.js";
import { MANUAL_CHECKPOINTS } from "./manual-checklist-data.js";
import { batchesOf, finalize, parseExplains, parseVerdicts, runnableCheckpoints, scoreChecklist } from "./manual-checklist.js";

const store = (pages: string[]): StoreEvidence => ({
  website: "https://store.eg",
  pages: pages.map(t => ({ pageType: t, url: `https://store.eg/${t}`, loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} })),
} as unknown as StoreEvidence);

const explain = (id: string) => ({
  id,
  title: { en: "Shoppers can't see delivery cost", ar: "العميل مش شايف تكلفة التوصيل" },
  found: { en: "The cart shows only the total.", ar: "السلة بتوري الإجمالي بس." },
  means: { en: "Hidden costs are the top reason carts are left.", ar: "التكاليف المخفية أكبر سبب لترك السلة." },
  problem: { en: "People leave at checkout.", ar: "الناس بتمشي عند الدفع." },
  fix: { en: ["Add a delivery line.", "Show the free-shipping amount."], ar: ["ضيف سطر التوصيل.", "اعرض مبلغ الشحن المجاني."] },
  done: { en: "The cart shows delivery before checkout.", ar: "السلة بتوري التوصيل قبل الدفع." },
});

test("all 377 checkpoints of the workbook, unique, with importance and text", () => {
  assert.equal(MANUAL_CHECKPOINTS.length, 377);
  assert.equal(new Set(MANUAL_CHECKPOINTS.map(c => c.id)).size, 377);
  for (const c of MANUAL_CHECKPOINTS) {
    assert.ok(["Critical", "High", "Medium", "Low"].includes(c.importance), c.id);
    assert.ok(c.checkpoint && c.why && c.how && c.pass, c.id);
  }
});

test("only checkpoints whose pages were captured run; checkout, thank-you and landing pages don't yet", () => {
  const all = runnableCheckpoints(store(["home", "collection", "product", "cart"]));
  assert.ok(all.length > 200);
  assert.ok(!all.some(c => c.tab === "Checkout" || c.tab === "Thank You & Post-Purchase" || c.tab === "Landing Pages"));
  const homeOnly = runnableCheckpoints(store(["home"]));
  assert.ok(homeOnly.some(c => c.tab === "Homepage"));
  assert.ok(!homeOnly.some(c => c.tab === "Product Page" || c.tab === "Collection Page" || c.tab === "Cart Drawer & Cart"));
});

test("verdicts: codes read, unknown ids ignored, skipped checkpoints become can't-tell", () => {
  const got = parseVerdicts({ items: [
    { id: "SW-001", v: "n", en: "No bar above the header.", ar: "مفيش شريط.", t: "شريط إعلانات" },
    { id: "SW-002", v: "W", en: "Says free delivery over 1,000 EGP." },
    { id: "ZZ-999", v: "N" },
    { id: "SW-003", v: "?" },
  ] }, ["SW-001", "SW-002", "SW-003", "SW-004"]);
  assert.deepEqual(got.map(d => d.v), ["missing", "well", "unknown", "unknown"]);
  assert.equal(got[0].t, "شريط إعلانات");
  assert.equal(got[1].seen!.ar, "Says free delivery over 1,000 EGP."); // falls back to English
  assert.throws(() => parseVerdicts({ nope: [] }, ["SW-001"]));
});

test("doesn't apply and can't tell are dropped: never a card, never scored", () => {
  const drafts = parseVerdicts({ items: [
    { id: "SW-001", v: "N", en: "Missing." }, { id: "SW-002", v: "X" }, { id: "SW-003", v: "U" }, { id: "SW-004", v: "W", en: "Same amount." },
  ] }, ["SW-001", "SW-002", "SW-003", "SW-004"]);
  const r = finalize(drafts, parseExplains({ items: [explain("SW-001")] }, ["SW-001"]), 4, 0);
  assert.deepEqual(r.items.map(i => i.id), ["SW-001", "SW-004"]);
  assert.equal(r.ran, 4);
  assert.equal(r.dropped, 2);
  assert.ok(r.items[0].x, "the failing checkpoint carries its write-up");
  assert.equal(r.items[1].x, undefined, "a passing one doesn't");
  const s = scoreChecklist(r);
  assert.equal(s.total.judged, 2);
  assert.equal(s.total.score, 50); // well 3 + missing 0 of 6
});

test("write-ups are all or nothing, and long fields are kept", () => {
  const half = { ...explain("PDP-002"), fix: undefined };
  const got = parseExplains({ items: [explain("PDP-001"), half, explain("ZZ-1")] }, ["PDP-001", "PDP-002"]);
  assert.deepEqual([...got.keys()], ["PDP-001"]);
  assert.equal(got.get("PDP-001")!.fix.en.length, 2);
  const long = "A long, careful explanation. ".repeat(40);
  const kept = parseExplains({ items: [{ ...explain("PDP-001"), means: { en: long, ar: long } }] }, ["PDP-001"]);
  assert.ok(kept.get("PDP-001")!.means.en.length > 1000);
});

test("scores follow the sheet: well 3, adequately 2, badly 1, not implemented 0; critical failures counted", () => {
  const crit = MANUAL_CHECKPOINTS.find(c => c.importance === "Critical" && c.tab === "Product Page")!;
  const other = MANUAL_CHECKPOINTS.filter(c => c.tab === "Product Page" && c.id !== crit.id).slice(0, 3);
  const r = finalize([
    { id: crit.id, v: "missing" }, { id: other[0].id, v: "well" }, { id: other[1].id, v: "adequate" }, { id: other[2].id, v: "badly" },
  ], new Map(), 4, 0);
  const pdp = scoreChecklist(r).tabs.find(t => t.tab === "Product Page")!;
  assert.equal(pdp.judged, 4);
  assert.equal(pdp.score, 50); // (0 + 3 + 2 + 1) / 12
  assert.equal(pdp.criticalFailing, 1);
});

test("batches: a tab stays together unless it is bigger than one call; small tabs share", () => {
  const items = [...Array(50)].map((_, i) => ({ tab: "A", i })).concat([...Array(5)].map((_, i) => ({ tab: "B", i })), [...Array(4)].map((_, i) => ({ tab: "C", i })));
  const b = batchesOf(items, x => x.tab, 40);
  assert.deepEqual(b.map(x => x.length), [40, 19]);
  assert.equal(b.flat().length, 59);
});
