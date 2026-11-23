import assert from "node:assert/strict";
import { test } from "node:test";
import { pointById } from "../index.js";
import { TEMPLATES } from "./index.js";
import { renderFinding } from "./render.js";
import type { Copy, PartialCopy, RoleCopies } from "./types.js";

// Every string in a template, for the writing-rule checks.
function texts(c: RoleCopies): string[] {
  const out: string[] = [];
  const add = (x?: Copy | PartialCopy) => {
    if (!x) return;
    for (const v of [x.technical?.summary, x.technical?.detail, x.business?.summary, x.business?.detail, x.step, x.doneWhen, x.protect]) if (v) out.push(v);
  };
  for (const [, byStatus] of Object.entries(c)) {
    add((byStatus as Record<string, Copy | PartialCopy> | undefined)?.pass);
    add((byStatus as Record<string, Copy | PartialCopy> | undefined)?.fail);
  }
  return out;
}

test("templates exist only for active points", () => {
  for (const id of Object.keys(TEMPLATES)) {
    const p = pointById(id);
    assert.ok(p && p.status === "active", id);
  }
});

test("every template has complete default pass and fail copy in English and Arabic", () => {
  for (const [id, t] of Object.entries(TEMPLATES)) {
    for (const lang of ["en", "ar"] as const) {
      const d = t[lang]?.default;
      assert.ok(d, `${id} ${lang} default`);
      for (const s of ["pass", "fail"] as const) {
        const c = d![s];
        assert.ok(c.technical.summary && c.technical.detail && c.business.summary && c.business.detail, `${id} ${lang} ${s} voices`);
      }
      assert.ok(d!.fail.step && d!.fail.doneWhen, `${id} ${lang} fail action`);
      assert.ok(d!.pass.protect, `${id} ${lang} pass protect`);
    }
  }
});

// The prompt's writing rules (audit-prompt.ts), applied to the written text.
const BANNED = /\b(delve|leverage|utilize|robust|seamless|streamline|empower|crucial|pivotal|testament|game changer)\b/i;
test("templates follow the house writing rules: no em dashes, no banned words, Western digits", () => {
  for (const [id, t] of Object.entries(TEMPLATES)) {
    for (const lang of ["en", "ar"] as const) {
      if (!t[lang]) continue;
      for (const s of texts(t[lang]!)) {
        assert.ok(!s.includes("—"), `${id} ${lang}: em dash in "${s.slice(0, 50)}"`);
        assert.ok(!BANNED.test(s), `${id} ${lang}: banned word in "${s.slice(0, 50)}"`);
        assert.ok(!/[٠-٩]/.test(s), `${id} ${lang}: Arabic-Indic digits in "${s.slice(0, 50)}"`);
      }
    }
  }
});

test("no raw {slot} ever reaches a report, even when the rule gave no facts", () => {
  for (const id of Object.keys(TEMPLATES)) {
    for (const status of ["pass", "fail"] as const) {
      for (const lang of ["en", "ar"] as const) {
        for (const role of [null, "store_owner", "media_buyer", "marketing_manager", "agency"] as const) {
          const r = renderFinding(id, { status, reason: "Reason with values." }, { role, lang });
          const all = [r.technical.summary, r.technical.detail, r.business.summary, r.business.detail, r.step ?? "", r.doneWhen ?? "", r.protect ?? ""].join(" ");
          assert.ok(!/\{[a-zA-Z]/.test(all), `${id} ${status} ${lang} ${role}: ${all.slice(0, 80)}`);
        }
      }
    }
  }
});

test("renderFinding fills slots from the rule's facts and picks the role's voice", () => {
  const fail = { status: "fail" as const, reason: "1 contact link(s) have a missing or short number: tel:12345.", facts: { links: ["tel:12345"], broken: ["tel:12345"] } };
  const en = renderFinding("PATH-08", fail);
  assert.equal(en.technical.summary, fail.reason);
  assert.match(en.technical.detail, /tel:12345/);
  assert.match(en.step!, /wa\.me/);
  const mb = renderFinding("PATH-08", fail, { role: "media_buyer" });
  assert.match(mb.business.summary, /clicks are wasted/);
  assert.equal(mb.technical.detail, en.technical.detail, "roles change the business voice, not the technical one");
  const so = renderFinding("PATH-08", fail, { role: "store_owner", lang: "ar" });
  assert.match(so.business.summary, /متجرك/);
  assert.equal(so.technical.detail, "tel:12345");
});

test("renderFinding: unverified and n/a get short generic text; a point with no template is marked generic", () => {
  const u = renderFinding("PATH-08", { status: "unverified", reason: "No page loaded." });
  assert.equal(u.technical.summary, "No page loaded.");
  assert.match(u.business.summary, /Not checked/);
  assert.match(renderFinding("PATH-08", { status: "n/a", reason: "x" }, { lang: "ar" }).business.summary, /لا ينطبق/);
  // TRK-34 is parked, so it never gets a template.
  const none = renderFinding("TRK-34", { status: "pass", reason: "All 5 cards ok." });
  assert.equal(none.generic, true);
  assert.equal(none.technical.summary, "All 5 cards ok.");
});

test("renderFinding: a missing slot falls back to the rule's sentence and is reported", () => {
  const r = renderFinding("PDP-01", { status: "fail", reason: "The price sits 925px down." });
  assert.ok(r.missingSlots.includes("buttonBottom"));
  assert.equal(r.technical.detail, "");
  assert.equal(r.technical.summary, "The price sits 925px down.");
});

test("a frame shows the AI's observation in the report's language, with fallbacks", () => {
  const id = "TEST-FRAME";
  const copy = (obs: string, extra: string) => ({
    technical: { summary: obs, detail: extra }, business: { summary: extra, detail: extra }, step: extra, doneWhen: extra, protect: extra,
  });
  TEMPLATES[id] = {
    en: { default: { pass: copy("{observation}", "Fixed."), fail: copy("{observation}", "Fixed.") } },
    ar: { default: { pass: copy("{observation}", "ثابت."), fail: copy("{observation}", "ثابت.") } },
  };
  try {
    const obs = { status: "fail" as const, reason: "Code sentence.", observation: { en: "The hero has no offer.", ar: "لا يوجد عرض في الواجهة." } };
    assert.equal(renderFinding(id, obs).technical.summary, "The hero has no offer.");
    assert.equal(renderFinding(id, obs, { lang: "ar" }).technical.summary, "لا يوجد عرض في الواجهة.");
    // Code settled it (no observation): English shows the rule's sentence, Arabic the fixed business line.
    const code = { status: "pass" as const, reason: "Code sentence." };
    assert.equal(renderFinding(id, code).technical.summary, "Code sentence.");
    assert.equal(renderFinding(id, code, { lang: "ar" }).technical.summary, "ثابت.");
  } finally {
    delete TEMPLATES[id];
  }
});

test("frames for AI-judged points put the AI's finding in {observation}", () => {
  for (const [id, t] of Object.entries(TEMPLATES)) {
    if (pointById(id)?.decidedBy === "code") continue;
    for (const lang of ["en", "ar"] as const) {
      for (const s of ["pass", "fail"] as const) {
        assert.ok(t[lang]!.default[s].technical.summary.includes("{observation}"), `${id} ${lang} ${s}: technical.summary needs {observation}`);
      }
    }
  }
});
