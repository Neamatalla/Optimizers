import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAction, doneWhenIsCheckable, stepIsActionable } from "./actions.js";
import { computeCategoryResult } from "./audit-prompt.js";
import { CHECK_GROUP_LABELS, GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, checklistPoint } from "./checklist.js";
import { hitEvents } from "./fud/collect.js";
import { collectorFocus, computeGa4Facts, ga4Focus, ga4MetricsFromOAuth } from "./ga4-facts.js";
import { siteChecksFrom } from "./site-checks.js";
import type { StoreEvidence } from "./fud/evidence.js";

// ---- checklists ---------------------------------------------------------------

test("checklists: 25 / 25 / 50 / 25, unique ids, every point fully actionable", () => {
  assert.equal(GA4_CHECKLIST.length, 25);
  assert.equal(GTM_CHECKLIST.length, 25);
  assert.equal(WEBSITE_CHECKLIST.length, 50);
  assert.equal(WEBSITE_CODE_CHECKLIST.length, 25);
  const all = [...GA4_CHECKLIST, ...GTM_CHECKLIST, ...WEBSITE_CHECKLIST];
  assert.equal(new Set(all.map(p => p.id)).size, all.length);
  for (const p of all) {
    assert.ok(CHECK_GROUP_LABELS[p.group], `${p.id} group`);
    assert.ok(p.owners.length > 0, `${p.id} owner`);
    assert.ok(stepIsActionable(p.action), `${p.id} default action is actionable: ${p.action}`);
    assert.ok(doneWhenIsCheckable(p.doneWhen), `${p.id} default doneWhen is checkable: ${p.doneWhen}`);
  }
  // Every hand-off to another check points at a real id.
  for (const p of all) if (p.handoff?.kind === "check") assert.ok(checklistPoint(p.handoff.id), `${p.id} → ${p.handoff.id}`);
});

// ---- actionability rule ------------------------------------------------------

test("actionability: vague steps and unverifiable done-states fall back to the checklist default", () => {
  const point = checklistPoint("GA4-03")!;
  const good = buildAction({ step: "Show the shipping cost in the cart drawer before the checkout button.", owners: ["dev"], doneWhen: "Cart to checkout rate at 50% or more over 14 days." }, point);
  assert.equal(good.rejected, false);
  assert.match(good.action.step, /cart drawer/);
  const vague = buildAction({ step: "Improve things.", owners: "everyone", doneWhen: "It is better" }, point);
  assert.equal(vague.rejected, true);
  assert.equal(vague.action.step, point.action);
  assert.equal(vague.action.doneWhen, point.doneWhen);
  assert.deepEqual(vague.action.owners, point.owners);
  // Owner strings are normalised.
  assert.deepEqual(buildAction({ step: good.action.step, owner: "Developer + Marketing", doneWhen: good.action.doneWhen }, point).action.owners, ["dev", "marketing"]);
});

// ---- GA4 facts ---------------------------------------------------------------

const rep = (rows: Array<[string[], number[]]>, currencyCode?: string) => ({
  rows: rows.map(([d, m]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(v => ({ value: String(v) })) })),
  metadata: { currencyCode },
});

function oauth() {
  return {
    details: { currencyCode: "EGP", timeZone: "Africa/Cairo" },
    retention: { eventDataRetention: "TWO_MONTHS" },
    keyEvents: [{ eventName: "purchase" }, { eventName: "page_view" }],
    googleAdsLinks: [],
    audiences: [{ displayName: "All Users" }, { displayName: "Purchasers" }],
    reportData: {
      realtime: rep([[[], [12]]]),
      weekOverWeek: rep([[["last7Days"], [5000, 40000]], [["prior7Days"], [5200, 41000]]]),
      eventVolume: rep([[["page_view"], [60000]], [["view_search_results"], [800]]]),
      totals: rep([[[], [20000, 12000, 90, 300]]], "EGP"),
      purchaseMetrics: rep([[["purchase"], [300, 330000, 300]]], "EGP"),
      // 8% browse (pass), 41% cart (fail: worst vs 50%), 75% checkout (pass)
      funnel: rep([[["view_item"], [40000, 15000]], [["add_to_cart"], [3000, 1200]], [["begin_checkout"], [800, 492]], [["purchase"], [300, 369]]]),
      deviceConversion: rep([[["mobile"], [17000, 200, 220000, 200]], [["desktop"], [3000, 100, 110000, 100]]]),
      channels: rep([[["Paid Social"], [12000, 150]], [["Unassigned"], [3000, 20]], [["Organic Search"], [5000, 130]]]),
      newVsReturning: rep([[["new"], [15000, 180]], [["returning"], [5000, 120]]]),
      landingPages: rep([[["/collections/sale"], [3000, 2]], [["/"], [8000, 200]], [["/products/oil?email=a%40b.com"], [50, 1]]]),
      pageFunnel: rep([[["/products/oil", "view_item"], [6000]], [["/products/oil", "add_to_cart"], [150]], [["/products/cream", "view_item"], [4000]], [["/products/cream", "add_to_cart"], [500]]]),
      sourceMedium: rep([[["tabby.ai", "referral"], [40, 12]], [["google", "cpc"], [3000, 60]]]),
      countryConversion: rep([[["Egypt"], [17000, 290]], [["Germany"], [1500, 0]], [["Saudi Arabia"], [1500, 10]]]),
    },
  };
}

test("GA4 facts: worst step named with numbers and money, CRO pointed at the cart", () => {
  const f = computeGa4Facts(oauth(), "https://store.eg")!;
  const leak = f.facts["GA4-01"];
  assert.equal(leak.status, "fail");
  assert.match(leak.en, /cart to checkout/);
  assert.match(leak.en, /59% drop-off/);
  assert.ok(leak.money && leak.money.low > 0 && leak.money.high > leak.money.low);
  assert.ok(leak.money!.high <= (330000 / 28) * 30 * 0.3 + 1, "capped at 30% of monthly revenue");
  assert.deepEqual(leak.handoff, { kind: "cro", page: "cart", url: undefined });
  assert.equal(f.focus.page, "cart");
  assert.equal(f.facts["GA4-02"].status, "pass");
  assert.equal(f.facts["GA4-03"].status, "fail");
  // Same data, same result.
  assert.deepEqual(computeGa4Facts(oauth(), "https://store.eg"), f);
});

test("GA4 facts: product, landing, gateway, PII, settings, key events, retention", () => {
  const f = computeGa4Facts(oauth(), "https://store.eg")!;
  assert.equal(f.facts["GA4-10"].status, "fail");
  assert.equal(f.focus.productUrl, "https://store.eg/products/oil");
  assert.equal(f.facts["GA4-06"].status, "fail");
  assert.equal(f.focus.landingUrl, "https://store.eg/collections/sale");
  assert.deepEqual(collectorFocus(f.focus), { productUrl: "https://store.eg/products/oil", collectionUrl: "https://store.eg/collections/sale" });
  assert.equal(f.facts["GA4-19"].status, "fail");
  assert.match(f.facts["GA4-19"].en, /tabby/);
  assert.equal(f.facts["GA4-24"].status, "fail");
  assert.ok(!f.facts["GA4-24"].en.includes("a%40b.com"), "the email itself is never repeated");
  assert.equal(f.facts["GA4-22"].status, "pass");
  assert.equal(f.facts["GA4-20"].status, "fail");
  assert.equal(f.facts["GA4-23"].status, "fail");
  assert.equal(f.facts["GA4-21"].status, "fail");
  assert.equal(f.facts["GA4-14"].status, "fail");
  assert.equal(f.facts["GA4-09"].status, "fail");
  assert.equal(f.facts["GA4-08"].status, "fail"); // 3000 of 20000 visits unassigned = 15%
});

test("GA4 facts: an untracked step is a tracking gap, never a page problem", () => {
  const o = oauth();
  o.reportData.funnel = rep([[["view_item"], [40000, 15000]], [["add_to_cart"], [3000, 1200]], [["begin_checkout"], [80, 30]], [["purchase"], [300, 25]]]);
  const f = computeGa4Facts(o, "https://store.eg")!;
  assert.equal(f.facts["GA4-03"].status, "fail");
  assert.deepEqual(f.facts["GA4-03"].handoff, { kind: "check", id: "GA4-17" });
  assert.equal(f.facts["GA4-17"].status, "fail");
  assert.notEqual(f.focus.page, "cart");
  assert.equal(ga4Focus(o, "https://store.eg")?.page, f.focus.page);
});

test("GA4 facts: too little traffic gives nothing", () => {
  const o = oauth();
  o.reportData.totals = rep([[[], [100, 50, 10, 1]]], "EGP");
  assert.equal(computeGa4Facts(o, "https://store.eg"), null);
  assert.ok(ga4MetricsFromOAuth(oauth())!.funnel.length >= 3);
});

// ---- status enforcement --------------------------------------------------------

test("computed GA4 status overrides the model, and every fail carries an action", () => {
  const facts = computeGa4Facts(oauth(), "https://store.eg")!;
  const rejected: Array<{ category: string; id: string }> = [];
  const cat = computeCategoryResult(
    {
      category: "GA4",
      findings: [
        { checklistId: "GA4-01", status: "pass", dataSource: "detection", severity: "low", technical: { summary: "t", detail: "" }, business: { summary: "b", detail: "" } },
        { checklistId: "GA4-02", status: "pass", dataSource: "live", severity: "low", technical: { summary: "t", detail: "" }, business: { summary: "b", detail: "" }, protect: "Keep the product photos and size chart as they are today." },
      ],
    } as never,
    GA4_CHECKLIST,
    { ga4Facts: facts, rejected },
  );
  const leak = cat.findings.find(f => f.checklistId === "GA4-01")!;
  assert.equal(leak.status, "fail");
  assert.equal(leak.dataSource, "live");
  assert.equal(leak.opportunity, "revenue_gain");
  assert.ok(leak.action?.money);
  assert.match(leak.action!.impact!, /Estimated gain/);
  assert.equal(leak.action!.handoff?.kind, "cro");
  assert.ok(rejected.some(r => r.id === "GA4-01"), "no model action → queued for repair");
  const kept = cat.findings.find(f => f.checklistId === "GA4-02")!;
  assert.equal(kept.status, "pass");
  assert.match(kept.protect!, /product photos/);
  assert.equal(cat.findings.length, 25);
});

// ---- browser facts -------------------------------------------------------------

test("hit parsing reads GA4 batches, Meta and TikTok event names", () => {
  assert.deepEqual(hitEvents("https://region1.google-analytics.com/g/collect?v=2&tid=G-1", "en=page_view&ep.x=1\nen=add_to_cart&pr1=id1").map(e => e.name), ["page_view", "add_to_cart"]);
  assert.deepEqual(hitEvents("https://www.facebook.com/tr/?id=1&ev=AddToCart&dl=x", undefined), [{ vendor: "meta", name: "AddToCart" }]);
  assert.deepEqual(hitEvents("https://analytics.tiktok.com/api/v2/pixel", '{"event":"AddToCart"}'), [{ vendor: "tiktok", name: "AddToCart" }]);
});

test("site checks: contact links validated, sold-out counted, events passed through", () => {
  const facts = { contactLinks: ["https://wa.me/201001234567", "https://wa.me/", "tel:+20 100 123 4567"], soldOutTop: 2 } as never;
  const e = {
    website: "https://store.eg",
    pages: [
      { pageType: "home", url: "https://store.eg/", loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, facts },
      { pageType: "cart", url: "https://store.eg/cart", loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, cart: { source: "drawer", empty: false } },
    ],
    addToCart: { attempted: true, ok: true },
    atcEvents: { dataLayer: ["add_to_cart"], ga4: [], pixels: ["meta:AddToCart"] },
    blockedHits: 3,
    durationMs: 1,
  } as unknown as StoreEvidence;
  const s = siteChecksFrom(e, "Shopify");
  assert.deepEqual(s.contactLinks.map(c => c.valid), [true, false, true]);
  assert.equal(s.soldOutPromoted, 2);
  assert.equal(s.addToCart.via, "drawer");
  assert.deepEqual(s.atcEvents?.pixels, ["meta:AddToCart"]);
});

test("audit prompt: computed facts and browser facts are in, the old open GA4 slots are gone", async () => {
  const { buildPrompt } = await import("./audit-prompt.js");
  const { sampleGa4OAuth } = await import("./preview-actions.js");
  const ga4Facts = computeGa4Facts(sampleGa4OAuth(), "https://store.eg");
  const crawl = { detected: {}, headers: {}, structuralSignals: {}, ids: { ga4MeasurementIds: [], gtmContainerIds: [] } } as never;
  const prompt = buildPrompt({
    website: "https://store.eg", tools: ["GA4"], discoveredPages: ["https://store.eg/"], crawl, mcpConfigPath: "x", businessName: null,
    userProvidedGa4Id: null, userProvidedGtmId: null, ga4OAuthData: sampleGa4OAuth(), gtmOAuthData: null, ga4Facts,
    siteChecks: { platform: "Shopify", addToCart: { attempted: true, ok: true, via: "drawer" }, atcEvents: { dataLayer: [], ga4: [], pixels: [] }, contactLinks: [], soldOutPromoted: 0, heroVideoMobile: false, pagesVisited: [] },
  });
  assert.match(prompt, /Computed GA4 facts/);
  assert.match(prompt, /GA4-01 \[FAIL\] Biggest leak: cart to checkout/);
  assert.match(prompt, /Browser facts/);
  assert.match(prompt, /ACTIONS/);
  assert.match(prompt, /W-22/);
  assert.doesNotMatch(prompt, /GA4-D\d/);
  assert.doesNotMatch(prompt, /WEB-\d/);
});

test("GA4 facts: polluted key events never become sales; transactions are used when pulled", () => {
  // 21 key events (view_item, add_to_cart, video…): "conversions" 140× purchases.
  const o = oauth();
  o.reportData.totals = rep([[[], [20000, 12000, 90, 42000]]], "EGP");
  o.reportData.channels = rep([[["Paid Social"], [12000, 30000]], [["Organic Search"], [5000, 9000]]]);
  const f = computeGa4Facts(o, "https://store.eg")!;
  assert.equal(f.facts["GA4-12"].status, "no_data");
  assert.match(f.facts["GA4-12"].en, /GA4-20/);
  assert.equal(f.facts["GA4-09"].status, "no_data");
  assert.equal(ga4MetricsFromOAuth(o)!.channels.length, 0, "no impossible channel rates");
  // Same store, with real transactions pulled per channel/country: usable again.
  o.reportData.channels = rep([[["Paid Social"], [12000, 30000, 150]], [["Organic Search"], [5000, 9000, 130]]]);
  o.reportData.countryConversion = rep([[["Egypt"], [17000, 40000, 290]], [["Germany"], [1500, 900, 0]], [["Saudi Arabia"], [1500, 1100, 10]]]);
  const g = computeGa4Facts(o, "https://store.eg")!;
  assert.equal(g.facts["GA4-09"].status, "fail");
  const ch = ga4MetricsFromOAuth(o)!.channels;
  assert.ok(ch.length === 2 && ch.every(c => c.conversionRate <= 100));
  assert.equal(ch[0].conversionRate, 1.25);
});
