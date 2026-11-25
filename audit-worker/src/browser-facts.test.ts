import assert from "node:assert/strict";
import { test } from "node:test";
import { browserFact, browserFactFor } from "./browser-facts.js";
import { buildPrompt, computeCategoryResult } from "./audit-prompt.js";
import { WEBSITE_CHECKLIST } from "./checklist.js";
import { personaChecklistFor } from "./persona-checklist.js";
import type { SiteChecks } from "./types.js";

// A clean phone visit: the click filled the cart, add_to_cart fired, one
// valid WhatsApp link, no sold-out badge, no hero video, home loaded.
function visit(over: Partial<SiteChecks> = {}): SiteChecks {
  return {
    platform: "shopify",
    addToCart: { attempted: true, ok: true, via: "drawer", method: "click", clickAdded: true },
    atcEvents: { dataLayer: ["add_to_cart"], ga4: [], pixels: [] },
    contactLinks: [{ href: "https://wa.me/966501234567", kind: "whatsapp", valid: true }],
    soldOutPromoted: 0,
    heroVideoMobile: false,
    pagesVisited: [{ pageType: "home", url: "https://x.com/", loaded: true }],
    ...over,
  };
}

const status = (id: string, s: SiteChecks | null) => browserFactFor(id, s)?.status ?? null;

test("Add to cart (W-01): only a click that filled the cart decides it, and only as a pass", () => {
  assert.equal(status("W-01", visit()), "pass");
  // A failed click may be our automated browser: the model judges it.
  assert.equal(status("W-01", visit({ addToCart: { attempted: true, ok: false, reason: "cart empty" } })), null);
  assert.equal(status("W-01", visit({ addToCart: { attempted: true, ok: true, method: "api", clickAdded: false } })), null);
  assert.equal(status("W-01", visit({ addToCart: { attempted: true, ok: true, method: "click", clickAdded: false } })), null);
  assert.equal(status("W-01", visit({ addToCart: { attempted: false, ok: false, reason: "no product page" } })), null);
});

test("WhatsApp/phone links (W-07): any invalid number fails, all valid passes, none found is left to the model", () => {
  assert.equal(status("W-07", visit()), "pass");
  const bad = visit({ contactLinks: [...visit().contactLinks, { href: "tel:0501", kind: "tel", valid: false }] });
  assert.equal(status("W-07", bad), "fail");
  assert.match(browserFactFor("W-07", bad)!.reason, /tel:0501/);
  assert.equal(status("W-07", visit({ contactLinks: [] })), null);
});

test("Sold out (W-08) and hero video (W-17): a seen problem fails; a pass needs the home page to have loaded", () => {
  assert.equal(status("W-08", visit()), "pass");
  assert.equal(status("W-08", visit({ soldOutPromoted: 3 })), "fail");
  assert.equal(status("W-17", visit()), "pass");
  assert.equal(status("W-17", visit({ heroVideoMobile: true })), "fail");
  const noHome = visit({ pagesVisited: [{ pageType: "home", url: "https://x.com/", loaded: false }] });
  assert.equal(status("W-08", noHome), null);
  assert.equal(status("W-17", noHome), null);
  assert.equal(status("W-08", { ...noHome, soldOutPromoted: 1 }), "fail");
});

test("add_to_cart recorded (W-22): a seen event passes; a missing one is left to the model", () => {
  assert.equal(status("W-22", visit()), "pass");
  assert.equal(status("W-22", visit({ atcEvents: { dataLayer: [], ga4: ["add_to_cart"], pixels: [] } })), "pass");
  assert.equal(status("W-22", visit({ atcEvents: { dataLayer: ["view_item"], ga4: [], pixels: [] } })), null);
  assert.equal(status("W-22", visit({ atcEvents: null })), null);
});

test("a reader's wider point can only be failed by a fact, never passed", () => {
  // SO-CRO-19 also asks for sold-out pages with a way forward: no badge doesn't prove that.
  assert.equal(status("SO-CRO-19", visit()), null);
  assert.equal(status("SO-CRO-19", visit({ soldOutPromoted: 2 })), "fail");
  assert.equal(status("MB-CRO-15", visit()), null);
  // Same-meaning reader points are decided both ways.
  assert.equal(status("SO-WC-01", visit()), "pass");
  assert.equal(status("SO-WC-04", visit({ contactLinks: [{ href: "tel:12", kind: "tel", valid: false }] })), "fail");
});

test("no visit, or a point no fact covers: the model decides", () => {
  assert.equal(status("W-01", null), null);
  assert.equal(status("W-02", visit()), null);
  assert.equal(browserFact("soldOut", visit({ soldOutPromoted: 1 }))?.status, "fail");
});

const ans = (id: string, s: "pass" | "fail") => ({ checklistId: id, status: s, technical: { summary: "x y z", detail: "d" }, business: { summary: "x y z", detail: "d" }, dataSource: "detection" });
const web = WEBSITE_CHECKLIST.filter(p => ["W-01", "W-02", "W-07", "W-08"].includes(p.id));

test("computeCategoryResult: the browser fact overrides the model's status and marks the finding live", () => {
  const s = visit({ soldOutPromoted: 2 });
  const cat = computeCategoryResult({ category: "Website", findings: [ans("W-01", "fail"), ans("W-02", "fail"), ans("W-07", "fail"), ans("W-08", "pass")] } as any, web, { siteChecks: s });
  const by = Object.fromEntries(cat.findings.map(f => [f.checklistId, f]));
  assert.equal(by["W-01"].status, "pass");
  assert.equal(by["W-01"].dataSource, "live");
  assert.ok(by["W-01"].protect, "a flipped pass gets a protect line, not an action");
  assert.equal(by["W-01"].action, undefined);
  assert.equal(by["W-07"].status, "pass");
  assert.equal(by["W-08"].status, "fail");
  assert.ok(by["W-08"].action, "a flipped fail gets an action");
  // No fact for W-02: the model's answer stands.
  assert.equal(by["W-02"].status, "fail");
  assert.equal(by["W-02"].dataSource, "detection");
  assert.deepEqual(cat.checklistTally, { total: 4, evaluated: 4, passed: 2 });
});

test("computeCategoryResult: without a visit, the model's status stands (behaviour before this change)", () => {
  const cat = computeCategoryResult({ category: "Website", findings: [ans("W-01", "fail"), ans("W-02", "pass"), ans("W-07", "fail"), ans("W-08", "pass")] } as any, web);
  assert.deepEqual(cat.findings.map(f => f.status), ["fail", "pass", "fail", "pass"]);
});

test("computeCategoryResult: a decided check the model leaves out is still unassessed (not filled from the fact)", () => {
  const cat = computeCategoryResult({ category: "Website", findings: [ans("W-02", "pass")] } as any, web, { siteChecks: visit() });
  assert.equal(cat.findings.find(f => f.checklistId === "W-01")!.status, "unassessed");
});

test("the prompt lists the decided statuses for the reader's own point ids", () => {
  const base = {
    tools: [], website: "https://x.com",
    crawl: { html: "", headers: {}, detected: { GA4: false, GTM: false, Clarity: false, Hotjar: false }, ids: { ga4MeasurementIds: [], gtmContainerIds: [] }, structuralSignals: {} },
  };
  const p = buildPrompt({ ...base, siteChecks: visit({ heroVideoMobile: true }) } as any);
  assert.match(p, /Decided by code from these facts/);
  assert.match(p, /- W-01: PASS \(our Add-to-Cart click filled the cart/);
  assert.match(p, /- W-17: FAIL/);
  const so = buildPrompt({ ...base, audienceRole: "store_owner", siteChecks: visit() } as any);
  assert.match(so, /- SO-WC-01: PASS/);
  assert.doesNotMatch(so, /- SO-CRO-19:/);
  assert.doesNotMatch(buildPrompt(base as any), /Decided by code from these facts/);
  assert.ok(personaChecklistFor("store_owner", "Website", []).some(x => x.id === "SO-CRO-19"));
});
