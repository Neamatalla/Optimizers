import test from "node:test";
import assert from "node:assert/strict";
import { CHECK_GROUP_LABELS, checklistPoint } from "./checklist.js";
import { PERSONA_CHECKLISTS } from "./checklist-persona-data.js";
import { personaChecklistFor, personaOf, personaOfFindings } from "./persona-checklist.js";
import { adEffectOf } from "./ad-impact.js";
import { mediaBuyerLane } from "./audience.js";

test("persona lists: 25 per section, unique ids, every group labelled", () => {
  const seen = new Set<string>();
  for (const [persona, sections] of Object.entries(PERSONA_CHECKLISTS)) {
    for (const section of ["GA4", "GTM", "WEBCODE", "CRO"] as const) {
      assert.equal(sections[section].length, 25, `${persona} ${section}`);
    }
    for (const p of Object.values(sections).flat()) {
      assert.ok(!seen.has(p.id), `duplicate ${p.id}`);
      seen.add(p.id);
      assert.ok(CHECK_GROUP_LABELS[p.group], `${p.id} group ${p.group}`);
      assert.ok(p.expectedState && p.commonFailure && p.validate && p.action && p.doneWhen, `${p.id} text`);
      assert.equal(checklistPoint(p.id)?.id, p.id);
    }
  }
});

test("persona routes keep the 50-point scale", () => {
  for (const persona of ["store_owner", "media_buyer"] as const) {
    assert.equal(personaChecklistFor(persona, "GA4", ["GA4", "GTM"]).length + personaChecklistFor(persona, "GTM", ["GA4", "GTM"]).length, 50);
    assert.equal(personaChecklistFor(persona, "GA4", ["GA4"]).length + personaChecklistFor(persona, "Website", ["GA4"]).length, 50);
    assert.equal(personaChecklistFor(persona, "Website", []).length, 50);
  }
});

test("only the store owner and media buyer get their own points", () => {
  assert.equal(personaOf("store_owner"), "store_owner");
  assert.equal(personaOf("media_buyer"), "media_buyer");
  assert.equal(personaOf("agency"), null);
  assert.equal(personaOf(null), null);
  assert.equal(personaOfFindings(["SO-GA4-01"]), "store_owner");
  assert.equal(personaOfFindings(["MB-GTM-01"]), "media_buyer");
  assert.equal(personaOfFindings(["GA4-01"]), null);
});

test("media buyer points carry their ad effect and lane", () => {
  const mb = PERSONA_CHECKLISTS.media_buyer;
  const withEffect = [...mb.GA4, ...mb.GTM, ...mb.WEBCODE, ...mb.CRO].filter(p => adEffectOf(p.id));
  assert.ok(withEffect.length > 50, `${withEffect.length} media buyer points with an ad effect`);
  for (const p of withEffect) assert.notEqual(mediaBuyerLane(p.id), "other", p.id);
});
