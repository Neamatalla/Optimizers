import assert from "node:assert/strict";
import { test } from "node:test";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST } from "../checklist.js";
import { PERSONA_CHECKLISTS } from "../checklist-persona-data.js";
import { FUD_RULES } from "../fud/rules.js";
import { MANUAL_CHECKPOINTS } from "../fud/manual-checklist-data.js";
import { QUESTION_FUD_IDS, QUESTION_IDS, READER_QUESTIONS } from "../reader-questions.js";
import { AUDIENCE_ROLES } from "../audience.js";
import { DROPPED, POINTS, activePoints, droppedOldId, pointById, pointForOldId } from "./index.js";

// Every id in the old lists, read live from the code that still runs.
const OLD_IDS = [
  ...GA4_CHECKLIST, ...GTM_CHECKLIST, ...WEBSITE_CHECKLIST,
  ...Object.values(PERSONA_CHECKLISTS).flatMap(s => Object.values(s).flat()),
  ...FUD_RULES, ...MANUAL_CHECKPOINTS,
].map(p => p.id);

const PREFIX: Record<string, string> = {
  tracking: "TRK", "buying-path": "PATH", "product-page": "PDP", collection: "COL", homepage: "HOME", navigation: "NAV",
  trust: "TRUST", offers: "OFFER", landing: "LAND", speed: "SPEED", findability: "SEO", risk: "RISK",
};
const ROLE_ONLY = /^(SO|MB)-(GA4|GTM|WC|CRO|CL)-/;

test("every old point is accounted for exactly once: in one master point or in the dropped list", () => {
  assert.equal(new Set(OLD_IDS).size, OLD_IDS.length, "old ids are unique");
  const placed = POINTS.flatMap(p => p.origin);
  const dropped = DROPPED.map(d => d.id);
  const seen = [...placed, ...dropped];
  assert.equal(new Set(seen).size, seen.length, "no old id sits in two places");
  const old = new Set(OLD_IDS);
  assert.deepEqual(seen.filter(id => !old.has(id)), [], "no unknown old ids");
  assert.deepEqual(OLD_IDS.filter(id => !seen.includes(id)), [], "no old id left out");
});

test("master ids are unique, stable-looking and match their category", () => {
  assert.equal(new Set(POINTS.map(p => p.id)).size, POINTS.length);
  for (const p of POINTS) assert.match(p.id, new RegExp(`^${PREFIX[p.category]}-\\d{2}$`), p.id);
});

test("every point is well-formed", () => {
  const decider = new Set(["code", "code+ai", "ai"]);
  const sev = new Set(["critical", "medium", "low"]);
  for (const p of POINTS) {
    assert.ok(p.title.trim() && p.rule.trim(), `${p.id} has a title and a rule`);
    assert.ok(decider.has(p.decidedBy), `${p.id} decidedBy`);
    assert.ok(sev.has(p.severity), `${p.id} severity`);
    assert.ok(p.origin.length > 0, `${p.id} replaces at least one old point`);
    assert.ok(p.roles.length > 0 && p.roles.every(r => AUDIENCE_ROLES.includes(r)), `${p.id} roles`);
    if (p.status === "parked") assert.ok(p.parkedReason, `${p.id} parked needs a reason`);
    else assert.equal(p.status, "active", p.id);
  }
});

// GA4 and GTM checks serve every role, so each reader gets the same 25 + 25
// (the store's tracking is the same whoever reads about it). Website points
// keep the roles of their origins.
test("roles follow the origins: role-only points come only from SO-/MB- points", () => {
  for (const p of POINTS) {
    const shared = p.origin.some(o => !ROLE_ONLY.test(o));
    if (shared || p.tab !== "Website") assert.equal(p.roles.length, AUDIENCE_ROLES.length, `${p.id} serves every role`);
    else {
      const want = new Set(p.origin.map(o => (o.startsWith("SO") ? "store_owner" : "media_buyer")));
      assert.deepEqual(new Set(p.roles), want, p.id);
    }
    for (const r of Object.keys(p.roleCopy)) assert.ok(p.roles.includes(r as never), `${p.id} has wording only for roles it serves`);
  }
});

test("role wording carries over: every store-owner and media-buyer old point keeps its title on its master point", () => {
  for (const p of POINTS) {
    if (p.origin.some(o => o.startsWith("SO-") && ROLE_ONLY.test(o))) assert.ok(p.roleCopy.store_owner?.title, `${p.id} store owner wording`);
    if (p.origin.some(o => o.startsWith("MB-") && ROLE_ONLY.test(o))) assert.ok(p.roleCopy.media_buyer?.title, `${p.id} media buyer wording`);
  }
});

test("lookups: old id to master point, dropped reason, active points per role", () => {
  assert.equal(pointForOldId("W-01")?.id, "PATH-01");
  assert.equal(pointById("PATH-01")?.origin.includes("SO-WC-01"), true);
  assert.equal(pointForOldId("TY-001"), undefined);
  assert.ok(droppedOldId("TY-001")?.reason, "thank-you page points are dropped with a reason");
  assert.ok(activePoints().every(p => p.status === "active"));
  assert.ok(activePoints("store_owner").every(p => p.roles.includes("store_owner")));
  const ownerOnly = POINTS.find(p => p.status === "active" && p.roles.length === 1 && p.roles[0] === "store_owner");
  if (ownerOnly) assert.ok(!activePoints("media_buyer").includes(ownerOnly), "a store-owner-only point is not in the media buyer's list");
});

test("every old id the reader questions point to still resolves", () => {
  for (const id of [...QUESTION_IDS, ...QUESTION_FUD_IDS]) {
    assert.ok(pointForOldId(id) || droppedOldId(id), `${id} resolves`);
  }
});

// Dropped ids in a question (GA4-01, GTM-14, W-06, W-33, W-34, W-35) were cut
// on purpose; the question stays answerable through its other points.
test("every reader question keeps at least one active master point", () => {
  for (const [role, qs] of Object.entries(READER_QUESTIONS)) {
    for (const q of qs) {
      const ids = [...q.points, ...(q.fud ?? [])];
      if (!ids.length) continue;
      assert.ok(ids.some(id => pointForOldId(id)?.status === "active"), `${role} "${q.id}" has a live point`);
    }
  }
});
