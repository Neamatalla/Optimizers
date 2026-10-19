import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTestPrefix } from "../../api/_lib/test-mode.js";

test("both fields prefixed with a team email is a test run, prefix stripped", () => {
  const result = parseTestPrefix({ email: "-omar@optimizers.agency", website: "-https://example.com" });
  assert.deepEqual(result, { isTest: true, invalidFields: [], email: "omar@optimizers.agency", website: "https://example.com" });
});

test("team email check ignores case", () => {
  assert.equal(parseTestPrefix({ email: "-Omar@Optimizers.Agency", website: "-https://example.com" }).isTest, true);
});

test("no prefix is a normal run, values only trimmed", () => {
  const result = parseTestPrefix({ email: "  a@b.com ", website: " https://shop.com " });
  assert.deepEqual(result, { isTest: false, invalidFields: [], email: "a@b.com", website: "https://shop.com" });
});

test("only the email prefixed marks the email invalid", () => {
  const result = parseTestPrefix({ email: "-omar@optimizers.agency", website: "https://example.com" });
  assert.equal(result.isTest, false);
  assert.deepEqual(result.invalidFields, ["email"]);
});

test("only the website prefixed marks the website invalid", () => {
  const result = parseTestPrefix({ email: "omar@optimizers.agency", website: "-https://example.com" });
  assert.deepEqual(result.invalidFields, ["website"]);
});

test("both prefixed with a non-team email marks both invalid", () => {
  const result = parseTestPrefix({ email: "-someone@gmail.com", website: "-https://example.com" });
  assert.equal(result.isTest, false);
  assert.deepEqual(result.invalidFields, ["email", "website"]);
});

test("missing values don't throw", () => {
  assert.deepEqual(parseTestPrefix({}), { isTest: false, invalidFields: [], email: "", website: "" });
});
