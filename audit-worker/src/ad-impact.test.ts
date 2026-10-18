import test from "node:test";
import assert from "node:assert/strict";
import { AD_EFFECT, AD_EFFECT_ROLES, adEffectOf, adEffectSize } from "./ad-impact.js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST } from "./checklist.js";
import { AUDIENCE_ROLES } from "./audience.js";

test("ad effect: every mapped id is a real checklist point", () => {
  const ids = new Set([...GA4_CHECKLIST, ...GTM_CHECKLIST, ...WEBSITE_CHECKLIST].map(p => p.id));
  for (const id of Object.keys(AD_EFFECT)) assert.ok(ids.has(id), id);
});

test("ad effect: directions for the classic cases", () => {
  assert.equal(adEffectOf("GTM-01"), "inflated"); // purchase counted twice
  assert.equal(adEffectOf("GA4-20"), "inflated"); // non-sales as key events
  assert.equal(adEffectOf("GA4-19"), "deflated"); // gateways take the credit
  assert.equal(adEffectOf("GA4-02"), "performance"); // product page to cart
  assert.equal(adEffectOf("GA4-11"), "aov");
  assert.equal(adEffectOf("GA4-09"), "cost");
  assert.equal(adEffectOf("W-33"), null); // exposed files: no ROAS claim
});

test("ad effect: size is a band from the money range against monthly revenue", () => {
  const result = { ga4Facts: { revenue: 1_000_000, periodDays: 30 } as never, ga4Metrics: null };
  assert.equal(adEffectSize({ low: 10_000, high: 20_000, currency: "SAR" }, result), "small"); // 1.5%
  assert.equal(adEffectSize({ low: 40_000, high: 80_000, currency: "SAR" }, result), "moderate"); // 6%
  assert.equal(adEffectSize({ low: 150_000, high: 300_000, currency: "SAR" }, result), "large"); // 22.5%
  assert.equal(adEffectSize(null, result), null);
  assert.equal(adEffectSize({ low: 1, high: 2, currency: null }, { ga4Facts: null, ga4Metrics: null }), null);
});

test("audit prompt: ad effect lines only for readers judged on ROAS/CAC", async () => {
  const { buildPrompt } = await import("./audit-prompt.js");
  const crawl = { detected: {}, headers: {}, structuralSignals: {}, ids: { ga4MeasurementIds: [], gtmContainerIds: [] } } as never;
  const base = {
    website: "https://store.eg", tools: ["GA4", "GTM"] as never[], discoveredPages: ["https://store.eg/"], crawl, mcpConfigPath: "x", businessName: null,
    userProvidedGa4Id: null, userProvidedGtmId: null, ga4OAuthData: null, gtmOAuthData: null,
  };
  for (const role of [null, ...AUDIENCE_ROLES]) {
    const prompt = buildPrompt({ ...base, audienceRole: role });
    const has = /Ad effect when failing \(direction only, never a ROAS\/CAC value\): right now sales or conversions are over-counted/.test(prompt);
    assert.equal(has, Boolean(role && AD_EFFECT_ROLES.has(role)), String(role));
  }
});

test("reader severity: each ICP moves different points, the checklist severity stays the base", async () => {
  const { roleSeverity, ROLE_SEVERITY_IDS } = await import("./audience.js");
  const ids = new Set([...GA4_CHECKLIST, ...GTM_CHECKLIST, ...WEBSITE_CHECKLIST].map(p => p.id));
  for (const id of ROLE_SEVERITY_IDS) assert.ok(ids.has(id), id);
  // media buyer: tracking up, exposed files down
  assert.equal(roleSeverity("media_buyer", "GTM-03", "medium"), "critical");
  assert.equal(roleSeverity("media_buyer", "W-33", "critical"), "medium");
  // store owner: free-shipping threshold up, team-visit filter down
  assert.equal(roleSeverity("store_owner", "GA4-11", "medium"), "critical");
  assert.equal(roleSeverity("store_owner", "GTM-23", "medium"), "low");
  // manager: consent up; agency: purchase counted once up
  assert.equal(roleSeverity("marketing_manager", "GTM-16", "medium"), "critical");
  assert.equal(roleSeverity("agency", "GTM-01", "medium"), "critical");
  // no role keeps it; never past the ends
  assert.equal(roleSeverity(null, "GTM-03", "medium"), "medium");
  assert.equal(roleSeverity("media_buyer", "GTM-01", "critical"), "critical");
  assert.equal(roleSeverity("media_buyer", "W-33", "low"), "low");
});

test("direction sentence: added only when the text never names ROAS/CAC/CVR, only for ad readers", async () => {
  const { ensureAdDirection } = await import("./ad-impact.js");
  const mk = () => [{ findings: [
    { checklistId: "GTM-09", status: "fail", business: { summary: "WhatsApp clicks reach no tag.", detail: "Orders started in WhatsApp get no click record." } },
    { checklistId: "GTM-01", status: "fail", business: { summary: "A refresh counts twice.", detail: "That inflates ROAS." } },
    { checklistId: "W-33", status: "fail", business: { summary: "Exposed file.", detail: "Anyone can read it." } },
    { checklistId: "GA4-02", status: "pass", business: { summary: "Fine.", detail: "Fine." } },
  ] }];
  const cats = mk();
  assert.equal(ensureAdDirection(cats, "media_buyer"), 0, "GTM-09 (double page views) has no ad effect mapped");
  const c2 = mk();
  c2[0].findings[0].checklistId = "GTM-04";
  assert.equal(ensureAdDirection(c2, "media_buyer"), 1);
  assert.match(c2[0].findings[0].business.detail, /^Orders started in WhatsApp get no click record\. Estimated effect: reported ROAS reads lower than real/);
  assert.equal(c2[0].findings[1].business.detail, "That inflates ROAS.");
  assert.equal(c2[0].findings[2].business.detail, "Anyone can read it.");
  const c3 = mk();
  c3[0].findings[0].checklistId = "GTM-04";
  assert.equal(ensureAdDirection(c3, "store_owner"), 0);
});
