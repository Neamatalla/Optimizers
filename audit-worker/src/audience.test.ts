import test from "node:test";
import assert from "node:assert/strict";
import { AUDIENCE_ROLES, arabicRegisterRule, audienceRoleOf, judgeBusinessRule, mediaBuyerLane, mediaBuyerRank } from "./audience.js";
import { readerBrief } from "./reader-brief.js";
import { topActionsOf } from "./email.js";
import type { CategoryResult } from "./types.js";

test("audience: four known roles, each with its own brief and Arabic register", () => {
  for (const role of AUDIENCE_ROLES) {
    assert.equal(audienceRoleOf(role), role);
    assert.ok((readerBrief(role) ?? "").startsWith("# Reader brief:"), role);
    assert.ok(arabicRegisterRule(role), role);
    assert.ok(judgeBusinessRule(role), role);
  }
  assert.deepEqual([...AUDIENCE_ROLES], ["store_owner", "media_buyer", "marketing_manager", "agency"]);
  assert.equal(audienceRoleOf("ceo"), null);
  assert.equal(audienceRoleOf(null), null);
  assert.equal(readerBrief(null), null);
  assert.equal(arabicRegisterRule(null), null);
  assert.match(readerBrief("media_buyer") ?? "", /ROAS = conversion rate × AOV ÷ CPC/);
  assert.match(readerBrief("store_owner") ?? "", /Money first/);
  assert.match(arabicRegisterRule("store_owner") ?? "", /توصيل/);
  // The audit writes English: no brief carries its Arabic section into the prompt.
  for (const role of AUDIENCE_ROLES) assert.doesNotMatch(readerBrief(role) ?? "", /## Arabic|[\u0600-\u06FF]/, role);
});

test("audience: a medium tracking problem outranks a critical one the buyer can't act on", () => {
  assert.equal(mediaBuyerLane("GTM-03"), "signal");
  assert.equal(mediaBuyerLane("GA4-02"), "post_click");
  assert.equal(mediaBuyerLane("W-33"), "other");
  // GTM-03 medium (1) vs W-33 exposed files critical (0)
  assert.ok(mediaBuyerRank("GTM-03", 1) < mediaBuyerRank("W-33", 0));
  // post-click critical still beats signal low
  assert.ok(mediaBuyerRank("GA4-02", 0) < mediaBuyerRank("GTM-14", 2));
});

test("audit prompt: a role adds its brief at the end; no role keeps the default voice", async () => {
  const { buildPrompt } = await import("./audit-prompt.js");
  const crawl = { detected: {}, headers: {}, structuralSignals: {}, ids: { ga4MeasurementIds: [], gtmContainerIds: [] } } as never;
  const base = {
    website: "https://store.eg", tools: [] as never[], discoveredPages: ["https://store.eg/"], crawl, mcpConfigPath: "x", businessName: null,
    userProvidedGa4Id: null, userProvidedGtmId: null, ga4OAuthData: null, gtmOAuthData: null,
  };
  for (const role of AUDIENCE_ROLES) {
    const prompt = buildPrompt({ ...base, audienceRole: role });
    const at = prompt.indexOf("## WHO READS THIS REPORT");
    assert.ok(at > 0, role);
    assert.ok(at > prompt.indexOf("## How scoring works"), `${role}: brief comes after the checklists and scoring`);
    assert.ok(at < prompt.indexOf("Respond with ONLY a JSON object"), `${role}: brief comes right before the answer format`);
  }
  assert.match(buildPrompt({ ...base, audienceRole: "media_buyer" }), /Is the number real\?/);
  assert.doesNotMatch(buildPrompt({ ...base, audienceRole: null }), /WHO READS THIS REPORT/);
  // With a role, the store-owner voice rules are gone, not just overridden.
  const owner = buildPrompt({ ...base, audienceRole: null });
  assert.match(owner, /grade 6-8 reading level/);
  assert.match(owner, /"the tracking code" not "tag" or "pixel"/);
  for (const role of AUDIENCE_ROLES) {
    const prompt = buildPrompt({ ...base, audienceRole: role });
    assert.doesNotMatch(prompt, /grade 6-8 reading level/, role);
    assert.doesNotMatch(prompt, /"the tracking code" not "tag" or "pixel"/, role);
    assert.doesNotMatch(prompt, /readable by someone who has never opened GA4/, role);
    assert.doesNotMatch(prompt, /non-technical business owner/, role);
    assert.match(prompt, /WRITING RULES/, role);
  }
});

test("email: a media buyer's top actions lead with tracking, the owner's with money", () => {
  const finding = (checklistId: string, severity: "critical" | "medium" | "low", opportunity: "revenue_loss" | "risk", step: string, money: number | null) => ({
    checklistId, status: "fail", severity, opportunity, dataSource: "live",
    technical: { summary: "", detail: "" }, business: { summary: "", detail: "" },
    action: { step, owners: ["dev"], doneWhen: "x", money: money ? { low: money / 2, high: money, currency: "SAR" } : null },
  });
  const categories = [
    { category: "GA4", findings: [finding("GA4-01", "critical", "revenue_loss", "fix funnel", 50000)] },
    { category: "GTM", findings: [finding("GTM-03", "medium", "revenue_loss", "dedupe meta", null)] },
    { category: "Website", findings: [finding("W-33", "critical", "risk", "hide .env", null)] },
  ] as unknown as CategoryResult[];
  assert.deepEqual(topActionsOf({ categories }).map(a => a.step), ["fix funnel", "hide .env", "dedupe meta"]);
  // Media buyer: the Meta dedupe point is critical for them (audience.ts
  // roleSeverity) and a tracking point, so it leads; the exposed file drops.
  assert.deepEqual(topActionsOf({ categories }, "media_buyer").map(a => a.step), ["dedupe meta", "fix funnel", "hide .env"]);
});

test("reader questions: every role has its own, and each points at real checks and rules", async () => {
  const { READER_QUESTIONS, QUESTION_IDS, QUESTION_FUD_IDS } = await import("./reader-questions.js");
  const { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST } = await import("./checklist.js");
  const { FUD_RULES } = await import("./fud/rules.js");
  const ids = new Set([...GA4_CHECKLIST, ...GTM_CHECKLIST, ...WEBSITE_CHECKLIST].map(p => p.id));
  const rules = new Set(FUD_RULES.map(r => r.id));
  for (const id of QUESTION_IDS) assert.ok(ids.has(id), id);
  for (const id of QUESTION_FUD_IDS) assert.ok(rules.has(id), id);
  for (const role of AUDIENCE_ROLES) {
    assert.ok(READER_QUESTIONS[role].length >= 4, role);
    for (const q of READER_QUESTIONS[role]) assert.ok(q.en.endsWith("?") && q.ar.length > 5 && q.cleanEn && q.cleanAr, `${role}:${q.id}`);
  }
  // The audit prompt carries them, so findings are written as answers.
  const { buildPrompt } = await import("./audit-prompt.js");
  const crawl = { detected: {}, headers: {}, structuralSignals: {}, ids: { ga4MeasurementIds: [], gtmContainerIds: [] } } as never;
  const prompt = buildPrompt({ website: "https://store.eg", tools: [] as never[], discoveredPages: ["https://store.eg/"], crawl, mcpConfigPath: "x", businessName: null, userProvidedGa4Id: null, userProvidedGtmId: null, ga4OAuthData: null, gtmOAuthData: null, audienceRole: "media_buyer" });
  assert.match(prompt, /THE READER CAME TO US WITH THESE QUESTIONS[\s\S]*"Are my ad numbers real\?" \(answered by GTM-01/);
});
