import { test } from "node:test";
import assert from "node:assert/strict";
import { ministryChecks } from "./ministry-checks.js";

const page = (pageType: string, texts: string[], loaded = true, policyLinks: unknown[] = []) =>
  ({ pageType, url: "https://x.sa", loaded, blocks: texts.map((text, i) => ({ id: `p${i}`, text, tag: "p" })), widgets: [], policyLinks }) as never;

test("finds Saudi trust items on the pages", () => {
  const m = ministryChecks({ website: "https://store.sa", pages: [
    page("home", ["السجل التجاري 1010123456", "الرقم الضريبي 310123456700003", "info@store.sa", "0551234567", "موثق في المركز السعودي للأعمال"]),
    page("product", ["التوصيل خلال 2-3 أيام"], true, [{ kind: "returns", text: "سياسة الاسترجاع", href: "/returns" }]),
  ] });
  assert.ok(m);
  assert.equal(m.saudi, true);
  for (const k of ["sbc", "cr", "vat", "email", "phone", "returns", "deliveryTime"] as const) assert.equal(m.items[k], true, k);
  assert.equal(m.items.terms, false);
  assert.equal(m.items.complaints, false);
});

test("null when no page loaded: never 'missing' unseen", () => {
  assert.equal(ministryChecks({ website: "https://x.sa", pages: [page("home", ["x"], false)] }), null);
});

test("not Saudi for a non-SAR .com store", () => {
  const m = ministryChecks({ website: "https://shop.com", pages: [page("home", ["AED 99"])] }, "AED");
  assert.equal(m?.saudi, false);
});
