import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../../api/_lib/escape-html.js";

test("escapes the characters that can start markup or break an attribute", () => {
  assert.equal(escapeHtml(`<a href="x" title='y'>&</a>`), "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
});

test("plain text is unchanged", () => {
  assert.equal(escapeHtml("Tharaa Shop 2026"), "Tharaa Shop 2026");
});

test("null and undefined become empty, numbers become text", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml(42), "42");
});
