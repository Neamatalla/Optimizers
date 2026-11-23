import { test } from "node:test";
import assert from "node:assert/strict";
import { activePoints } from "./index.js";
import { menuLinksFrom, pointsToCategories, tabOf } from "./pipeline.js";
import { buildPointsAsk, buildSharedPrompt, parsePointVerdicts } from "./ai-judge.js";
import { computeOverallPoints } from "../scoring.js";
import type { RuleResult } from "./rules/types.js";

test("pointsToCategories: n/a left out, unverified not scored, both languages filled", () => {
  const [a, b, c] = activePoints("store_owner").filter(p => p.category !== "tracking");
  const results: Record<string, RuleResult> = {
    [a.id]: { status: "pass", reason: "ok" },
    [b.id]: { status: "unverified", reason: "no page" },
    [c.id]: { status: "n/a", reason: "no sizes" },
  };
  const cats = pointsToCategories(results, "store_owner");
  assert.equal(cats.length, 1);
  assert.equal(cats[0].category, "Website");
  assert.deepEqual(cats[0].checklistTally, { total: 2, evaluated: 1, passed: 1 });
  assert.equal(cats[0].findings.find(f => f.checklistId === b.id)?.status, "unassessed");
  for (const f of cats[0].findings) assert.ok(f.ar?.business.summary, `${f.checklistId} has Arabic`);
  assert.deepEqual(computeOverallPoints(cats), { earned: 1, possible: 1 });
});

test("pointsToCategories: a fail carries the fix and owners, an AI observation shows in both languages", () => {
  const p = activePoints().find(x => x.decidedBy !== "code" && x.category !== "tracking")!;
  const cats = pointsToCategories({ [p.id]: { status: "fail", reason: "x", observation: { en: "No returns line near the button.", ar: "لا يوجد سطر للإرجاع قرب الزر." } } }, null);
  const f = cats[0].findings[0];
  assert.equal(f.technical.summary, "No returns line near the button.");
  assert.equal(f.ar?.technical.summary, "لا يوجد سطر للإرجاع قرب الزر.");
  assert.ok(f.action?.step);
});

test("tracking points go to the GA4 or GTM tab, the rest to Website", () => {
  for (const p of activePoints()) {
    const tab = tabOf(p);
    if (p.category !== "tracking") assert.equal(tab, "Website");
    else assert.ok(tab === "GA4" || tab === "GTM");
  }
});

test("parsePointVerdicts keeps only listed ids and known statuses", () => {
  const out = parsePointVerdicts({ points: [
    { id: "A", status: "pass", en: "Seen.", ar: "تم." },
    { id: "B", status: "maybe", en: "?" },
    { id: "Z", status: "fail", en: "not asked" },
  ] }, ["A", "B"]);
  assert.deepEqual(Object.keys(out), ["A"]);
  assert.deepEqual(out.A.observation, { en: "Seen.", ar: "تم." });
  assert.throws(() => parsePointVerdicts({}, ["A"]));
});

test("the AI prompt: shared evidence has no point ids, each ask lists its own points", () => {
  const pts = activePoints().filter(p => p.decidedBy !== "code").slice(0, 3);
  const shared = buildSharedPrompt({ website: "https://x.sa", evidence: null, ga4: null, gtm: null, siteChecks: null, role: null });
  assert.match(shared, /No GA4 access/);
  assert.match(shared, /No GTM container access/);
  for (const p of pts) assert.ok(!shared.includes(`${p.id} —`), "the shared part is the same for every batch");
  const ask = buildPointsAsk(pts);
  for (const p of pts) assert.ok(ask.includes(p.id));
});

test("menuLinksFrom reads same-site header, nav and footer links only", () => {
  const html = `<header><a href="/collections/all">All</a><a href="https://other.com/x">x</a></header><main><a href="/products/p">p</a></main><footer><a href="/pages/returns">Returns</a><a href="#top">top</a></footer>`;
  assert.deepEqual(menuLinksFrom(html, "https://shop.sa/"), ["https://shop.sa/collections/all", "https://shop.sa/pages/returns"]);
});

test("convertPegged converts GCC currencies and refuses floating ones", async () => {
  const { convertPegged } = await import("../ga4-facts.js");
  assert.equal(Math.round(convertPegged(40, "KWD", "SAR")!), 489);
  assert.equal(convertPegged(100, "SAR", "SAR"), 100);
  assert.equal(convertPegged(100, "EGP", "SAR"), null);
});

test("collection pages are found on Shopify, Zid, WooCommerce and Salla", async () => {
  const { pageTypeOf } = await import("../discover-pages.js");
  const home = "https://s.sa/";
  for (const u of ["https://s.sa/collections/all", "https://s.sa/categories/1034544/honey", "https://s.sa/product-category/honey/", "https://s.sa/honey/c123456"]) assert.equal(pageTypeOf(u, home), "collection", u);
  assert.equal(pageTypeOf("https://s.sa/categories", home), "other");
});

test("every visual point is an active AI-judged point", async () => {
  const { VISUAL_POINTS } = await import("./ai-judge.js");
  const { pointById } = await import("./index.js");
  for (const id of VISUAL_POINTS) {
    const p = pointById(id);
    assert.ok(p && p.status === "active" && p.decidedBy !== "code", id);
  }
});

test("only the visual ask tells the AI to open pictures", () => {
  const pts = activePoints().filter(p => p.decidedBy !== "code").slice(0, 2);
  assert.doesNotMatch(buildPointsAsk(pts), /Read tool/);
  assert.match(buildPointsAsk(pts, {}, [{ file: "/tmp/x/home-fold.jpg", what: "home page, first phone screen" }]), /Read tool[\s\S]*home-fold\.jpg/);
});
