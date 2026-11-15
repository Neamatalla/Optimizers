import assert from "node:assert/strict";
import test from "node:test";
import { compactGa4, compactGtm, compactReport, json } from "./prompt-data.js";
import type { Ga4Facts } from "./types.js";

const report = (rows: Array<[string[], string[]]>, extra = {}) => ({
  kind: "analyticsData#runReport",
  metadata: { currencyCode: "SAR", timeZone: "Asia/Riyadh" },
  rowCount: rows.length,
  dimensionHeaders: [{ name: "pagePath" }],
  metricHeaders: [{ name: "sessions", type: "TYPE_INTEGER" }, { name: "revenue", type: "TYPE_CURRENCY" }],
  rows: rows.map(([d, m]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(value => ({ value })) })),
  ...extra,
});

test("compactReport keeps every value, with column names, numbers as numbers", () => {
  const c = compactReport(report([[["/a"], ["10", "12.5"]], [["/b"], ["3", "0"]]])) as { columns: string[]; rows: unknown[][] };
  assert.deepEqual(c.columns, ["pagePath", "sessions", "revenue"]);
  assert.deepEqual(c.rows, [["/a", 10, 12.5], ["/b", 3, 0]]);
});

test("compactReport keeps a row count that differs from the rows sent, and the totals", () => {
  const c = compactReport(report([[["/a"], ["1", "2"]]], { rowCount: 227, totals: [{ dimensionValues: [{ value: "RESERVED_TOTAL" }], metricValues: [{ value: "9" }] }] })) as { rowCount: number; totals: unknown[][] };
  assert.equal(c.rowCount, 227);
  assert.deepEqual(c.totals, [["RESERVED_TOTAL", 9]]);
});

test("compactReport leaves a non-report value alone", () => {
  assert.equal(compactReport(null), null);
  assert.deepEqual(compactReport({ a: 1 }), { a: 1 });
});

const facts = (status: string) => ({ facts: { "GA4-16": { id: "GA4-16", status, en: "x" } } }) as unknown as Ga4Facts;
const ga4 = { details: { name: "p" }, audiences: [1, 2], reportData: { hourDay: report([[["1"], ["1", "1"]]]), channels: report([[["Direct"], ["5", "1"]]]) } };

test("compactGa4 leaves out the hour-by-weekday report only when GA4-16 was decided by code", () => {
  const decided = compactGa4(ga4, facts("pass")) as { reportData: Record<string, unknown>; details: unknown; audiences: unknown };
  assert.deepEqual(Object.keys(decided.reportData), ["channels"]);
  assert.deepEqual(decided.audiences, [1, 2]);
  assert.deepEqual(Object.keys((compactGa4(ga4, facts("no_data")) as { reportData: object }).reportData), ["hourDay", "channels"]);
  assert.deepEqual(Object.keys((compactGa4(ga4, null) as { reportData: object }).reportData), ["hourDay", "channels"]);
});

test("compactGa4 returns data without reports unchanged", () => {
  assert.deepEqual(compactGa4({ details: 1 }, null), { details: 1 });
});

test("compactGtm turns parameter lists into key/value objects, nested ones too, and keeps lists and maps", () => {
  const gtm = { liveVersion: {
    tags: [{ name: "t", parameter: [{ key: "eventName", type: "template", value: "x" }, { key: "on", type: "boolean", value: "false" }] }],
    triggers: [{ name: "g", filter: [{ type: "contains", parameter: [{ key: "arg0", type: "template", value: "{{Click}}" }] }] }],
    variables: [{ name: "v", parameter: [{ key: "m", type: "map", map: [] }] }],
  } };
  const c = compactGtm(gtm) as typeof gtm & { liveVersion: any };
  assert.deepEqual(c.liveVersion.tags[0].parameter, { eventName: "x", on: "false" });
  assert.deepEqual(c.liveVersion.triggers[0].filter[0].parameter, { arg0: "{{Click}}" });
  assert.deepEqual(c.liveVersion.variables[0].parameter, [{ key: "m", type: "map", map: [] }]);
});

test("json is compact", () => assert.equal(json({ a: [1, 2] }), '{"a":[1,2]}'));
