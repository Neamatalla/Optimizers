import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPrompt, computeCategoryResult } from "./audit-prompt.js";
import { personaChecklistFor } from "./persona-checklist.js";

// 2026-11-02, regal-honey.com as a media buyer: the model answered every GA4
// and GTM point with the base ids (GA4-07) instead of the reader's (MB-GA4-07);
// all 50 were dropped as unknown and turned into generic passes.

test("a base id (GA4-07) is matched to the reader's renamed point (MB-GA4-07), not dropped", () => {
  const checklist = personaChecklistFor("media_buyer", "GA4", ["GA4", "GTM"]);
  const target = checklist[6];
  assert.match(target.id, /^MB-GA4-/);
  const base = target.id.replace(/^MB-/, "");
  const cat = computeCategoryResult({
    category: "GA4",
    findings: [{ checklistId: base, status: "fail", technical: { summary: "Purchase fires twice per order in DebugView.", detail: "Two tags send purchase." }, business: { summary: "Sales count twice.", detail: "Ad platforms see double." } }],
  } as any, checklist);
  const f = cat.findings.find(x => x.checklistId === target.id)!;
  assert.equal(f.status, "fail", "the model's answer is kept under the reader's id");
  assert.match(f.technical.summary, /twice/);
});

test("the prompt's example ids come from the reader's own checklist", () => {
  const p = buildPrompt({
    tools: ["GA4", "GTM"], audienceRole: "media_buyer",
    crawl: { html: "", headers: {}, detected: { GA4: false, GTM: true, Clarity: false, Hotjar: false }, ids: { ga4MeasurementIds: [], gtmContainerIds: ["GTM-ABC123"] }, structuralSignals: {} },
  } as any);
  assert.match(p, /e\.g\. "MB-GA4-\d+"/);
  assert.doesNotMatch(p, /e\.g\. "GA4-03"/);
});

test("a check the model leaves out is unassessed: not a pass, out of passed and the score", () => {
  const checklist = personaChecklistFor("media_buyer", "GA4", ["GA4", "GTM"]);
  const [a, b, c] = checklist;
  const ok = (id: string, status: string) => ({ checklistId: id, status, technical: { summary: "x y z", detail: "d" }, business: { summary: "x y z", detail: "d" } });
  const cat = computeCategoryResult({ category: "GA4", findings: [ok(a.id, "pass"), ok(b.id, "fail")] } as any, checklist.slice(0, 3));
  const missed = cat.findings.find(f => f.checklistId === c.id)!;
  assert.equal(missed.status, "unassessed");
  assert.match(missed.business.summary, /manual look/);
  assert.equal(missed.protect, undefined);
  assert.deepEqual(cat.checklistTally, { total: 3, evaluated: 2, passed: 1 });
  assert.equal(cat.score, 50);
});
