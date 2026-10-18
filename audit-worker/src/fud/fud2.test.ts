import assert from "node:assert/strict";
import { test } from "node:test";
import type { FudResult, JobProgress } from "../types.js";
import { isAnalyticsLike, isBlockedHit } from "./collect.js";
import type { PageEvidence, StoreEvidence, TextBlock } from "./evidence.js";
import { desktopView } from "./evidence.js";
import { applyOverride, assemble, runFrictionStage, visibleFindings } from "./index.js";
import type { JudgeVerdict } from "./judge.js";
import { parseVerdicts, repairJsonQuotes } from "./judge.js";
import { FUD_RULES, ruleById } from "./rules.js";
import { frictionWinsOf } from "../email.js";
import { matches } from "./signals.js";

let n = 0;
const block = (prefix: string, text: string, extra: Partial<TextBlock> = {}): TextBlock => ({ id: `${prefix}${++n}`, text, tag: "p", box: { x: 0, y: 900, w: 300, h: 20 }, aboveFold: false, ...extra });
const page = (type: PageEvidence["pageType"], blocks: TextBlock[], extra: Partial<PageEvidence> = {}): PageEvidence => ({
  pageType: type, url: `https://store.eg/${type}`, loaded: true, blocks, widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: { fold: `F-${type}`, cta: `C-${type}`, cart: `K-${type}` }, ...extra,
});
const voice = { summary: "s", detail: "d" };
const verdict = (ruleId: string, status: JudgeVerdict["status"], blockIds: string[] = [], confidence = 0.95): JudgeVerdict => ({ ruleId, applicable: true, status, confidence, blockIds, technical: voice, business: { summary: `${ruleId} summary`, detail: "d" } });

function store(): StoreEvidence {
  n = 0;
  const nearReturn = block("p", "Free returns within 14 days");
  return {
    website: "https://store.eg",
    pages: [
      page("home", [block("h", "New collection", { aboveFold: true })]),
      // Phone: nothing reassuring near the button.
      page("product", [block("p", "1,250 EGP"), block("p", "Description")], { cta: { text: "Add to cart", box: { x: 0, y: 900, w: 300, h: 48 }, disabled: false, nearbyBlockIds: [] } }),
      page("cart", [block("c", "Subtotal 1,250 EGP"), block("c", "Checkout")], { cart: { source: "drawer", empty: false } }),
      page("collection", [block("l", "All products")], { listing: { cards: 24, withPrice: 24, withRating: 0, quickAdd: 24, quickAddLabels: ["add to cart", "add", "buy"], hasFilter: false, hasSort: false, pills: 0 } }),
    ],
    // Desktop: the returns line sits right by the button.
    desktop: [page("product", [nearReturn], { cta: { text: "Add to cart", box: { x: 0, y: 400, w: 300, h: 48 }, disabled: false, nearbyBlockIds: [nearReturn.id] } })],
    addToCart: { attempted: true, ok: true },
    blockedHits: 10,
    leakedHits: [],
    durationMs: 1000,
  };
}

// ---- judge output repair ------------------------------------------------------

test("repairJsonQuotes escapes bare quotes and line breaks inside values, leaves structure alone", () => {
  const broken = '{"findings":[{"ruleId":"A1","technical":{"summary":"The bar says "شحن مجاني" in the cart","detail":"line one\nline two"},"business":{"summary":"ok","detail":"d"}}]}';
  assert.throws(() => JSON.parse(broken));
  const fixed = JSON.parse(repairJsonQuotes(broken));
  assert.equal(fixed.findings[0].technical.summary, 'The bar says "شحن مجاني" in the cart');
  assert.equal(fixed.findings[0].technical.detail, "line one\nline two");
  assert.equal(parseVerdicts(fixed).length, 1);
  // Already-valid JSON (including escaped quotes) survives unchanged.
  const valid = '{"a":"he said \\"hi\\"","b":[1,2],"c":{"d":"x"}}';
  assert.deepEqual(JSON.parse(repairJsonQuotes(valid)), JSON.parse(valid));
});

// ---- analytics blocking ---------------------------------------------------------

test("trackers found by the leak audit are blocked; cart and tag scripts are not", () => {
  for (const u of [
    "https://www.google.com.eg/ads/ga-audiences?v=1&t=sr&tid=G-ABC",
    "https://c.clarity.ms/c.gif",
    "https://monorail-edge.shopifysvc.com/unstable/produce_batch",
    "https://store.com/.well-known/shopify/monorail/unstable/produce_batch",
    "https://sgtm.store.com/g/collect?v=2&tid=G-ABC&en=add_to_cart",
  ]) assert.ok(isBlockedHit(u), u);
  for (const u of ["https://store.com/cart/add.js", "https://store.com/cart.js", "https://www.googletagmanager.com/gtm.js?id=GTM-X", "https://cdn.shopify.com/s/files/theme.js", "https://store.com/collections/all"]) {
    assert.ok(!isBlockedHit(u), u);
  }
  // Anything analytics-shaped that the blocklist misses is at least reported.
  assert.ok(isAnalyticsLike("https://www.google-analytics.com/some/new/endpoint"));
  assert.ok(!isAnalyticsLike("https://store.com/cart/add.js"));
});

test("'X left for free shipping' wording counts as a threshold", () => {
  assert.ok(matches("shippingThreshold", "فاضلك LE 1,360.00 ويوصلك شحن مجاني"));
  assert.ok(matches("shippingThreshold", "Only 120 EGP away from free shipping"));
});

// ---- collection rules -----------------------------------------------------------

test("collection rules read the card counts", () => {
  const e = store();
  assert.equal(ruleById("C6")!.signal(e), "elsewhere"); // price yes, ratings no
  assert.equal(ruleById("D4")!.signal(e), "absent"); // 24 cards, no filter/sort/pills
  assert.equal(ruleById("D5")!.signal(e), "elsewhere"); // three different labels
  assert.equal(ruleById("D4")!.applies!(e), true);
  e.pages[3].listing!.cards = 6;
  assert.equal(ruleById("D4")!.applies!(e), false); // short catalogue needs no filter
  const r = assemble(store(), [verdict("C6", "fail"), verdict("D4", "fail"), verdict("D5", "fail")], null, true);
  assert.equal(r.findings.find(f => f.ruleId === "C6")!.status, "warn"); // never auto-fails
  assert.equal(r.findings.find(f => f.ruleId === "D4")!.status, "fail");
  assert.equal(r.findings.find(f => f.ruleId === "D4")!.pageType, "collection");
});

// ---- desktop comparison ---------------------------------------------------------

test("desktop comparison: flags a phone-only gap, and only for layout rules", () => {
  const e = store();
  assert.ok(desktopView(e)!.pages.some(p => p.pageType === "product" && p.cta?.nearbyBlockIds.length === 1));
  const r = assemble(e, [verdict("B1", "fail"), verdict("A3", "warn")], null, true);
  assert.equal(r.desktopChecked, true);
  assert.equal(r.findings.find(f => f.ruleId === "B1")!.desktop, "better"); // in place on desktop
  assert.equal(r.findings.find(f => f.ruleId === "A3")!.desktop, undefined); // cart rule: not layout-compared
  const noDesktop = store();
  delete noDesktop.desktop;
  const r2 = assemble(noDesktop, [verdict("B1", "fail")], null, true);
  assert.equal(r2.desktopChecked, false);
  assert.equal(r2.findings.find(f => f.ruleId === "B1")!.desktop, undefined);
});

// ---- reviewer overrides ---------------------------------------------------------

function sample(): FudResult {
  // A verdict for every rule, so coverage is high enough for a score.
  const fails = new Set(["A1", "B1", "D1"]);
  const verdicts = FUD_RULES.map(r => (fails.has(r.id) ? verdict(r.id, "fail") : r.id === "A3" ? verdict(r.id, "pass", ["c3"]) : verdict(r.id, "warn")));
  return assemble(store(), verdicts, null, true);
}

test("override: status change keeps the original, recomputes the score, clears the fix on a pass", () => {
  const before = sample();
  const b1 = before.findings.find(f => f.ruleId === "B1")!;
  assert.equal(b1.status, "fail");
  const after = applyOverride(before, "b1", "pass", "COD line is in the sticky bar");
  const o = after.findings.find(f => f.ruleId === "B1")!;
  assert.equal(o.status, "pass");
  assert.deepEqual({ from: o.override!.from, to: o.override!.to }, { from: "fail", to: "pass" });
  assert.equal(o.pexti, null);
  assert.equal(o.evidence.crop, null);
  assert.ok((after.score ?? 0) > (before.score ?? 0));
  // A second override keeps the machine's first status as `from`.
  const again = applyOverride(after, "B1", "warn", "actually only partly there");
  assert.equal(again.findings.find(f => f.ruleId === "B1")!.override!.from, "fail");
  assert.ok(again.findings.find(f => f.ruleId === "B1")!.pexti);
  // Input is not mutated.
  assert.equal(before.findings.find(f => f.ruleId === "B1")!.status, "fail");
});

test("override: hidden leaves the report, the score and the email, but stays on record", () => {
  const before = sample();
  const after = applyOverride(before, "A1", "hidden", "store is digital, no shipping");
  assert.equal(after.findings.length, before.findings.length);
  assert.ok(!visibleFindings(after).some(f => f.ruleId === "A1"));
  assert.equal(after.applicable, before.applicable - 1);
  assert.ok(!frictionWinsOf(after).some(w => w.startsWith("A1")));
  assert.throws(() => applyOverride(before, "ZZ", "pass", "x"), /no finding ZZ/);
  assert.throws(() => applyOverride(before, "A1", "pass", "  "), /needs a reason/);
});

test("client email gets at most two quick wins, issues only", () => {
  const wins = frictionWinsOf(sample());
  assert.ok(wins.length >= 1 && wins.length <= 2);
  assert.deepEqual(frictionWinsOf(null), []);
  assert.deepEqual(frictionWinsOf({ error: "x" }), []);
});

// ---- queue stage (poll.ts 1b) ----------------------------------------------------

test("queue stage: gated by FUD_PASS, runs once, saves the result or the error, never throws", async () => {
  const row = { id: "r1", website: "https://store.eg", is_test: true };
  const live = { ...row, is_test: false };
  const ok = sample();
  let saves = 0;
  const save = async () => void saves++;
  const prev = { pass: process.env.FUD_PASS, allow: process.env.FUD_ALLOW_FAIL };
  try {
    process.env.FUD_PASS = "off";
    const p0: JobProgress = {};
    assert.equal(await runFrictionStage(row, p0, save, async () => ok), false);
    assert.equal(p0.fud, undefined);

    process.env.FUD_PASS = "test";
    const pLive: JobProgress = {};
    assert.equal(await runFrictionStage(live, pLive, save, async () => ok), false); // live run, test-only mode
    const p1: JobProgress = { discoveredPages: ["https://store.eg/"] };
    let seen: any;
    assert.equal(await runFrictionStage(row, p1, save, async o => ((seen = o), ok)), true);
    assert.equal(p1.fud, ok);
    assert.equal(seen.allowFail, true); // test runs show real FAILs
    assert.deepEqual(seen.discoveredPages, ["https://store.eg/"]);
    assert.equal(saves, 1);
    // Resume: already has a result, must not run again.
    assert.equal(await runFrictionStage(row, p1, save, async () => { throw new Error("must not run"); }), false);

    process.env.FUD_PASS = "all";
    delete process.env.FUD_ALLOW_FAIL;
    const p2: JobProgress = {};
    await runFrictionStage(live, p2, save, async o => ((seen = o), ok));
    assert.equal(seen.allowFail, false); // live runs ship FAIL as WARN until calibrated
    // A crash inside the pass is stored, not thrown, and not retried.
    const p3: JobProgress = {};
    assert.equal(await runFrictionStage(live, p3, save, async () => { throw new Error("browser died"); }), true);
    assert.deepEqual(p3.fud, { error: "browser died" });
    assert.equal(await runFrictionStage(live, p3, save, async () => ok), false);
  } finally {
    if (prev.pass === undefined) delete process.env.FUD_PASS; else process.env.FUD_PASS = prev.pass;
    if (prev.allow === undefined) delete process.env.FUD_ALLOW_FAIL; else process.env.FUD_ALLOW_FAIL = prev.allow;
  }
});
