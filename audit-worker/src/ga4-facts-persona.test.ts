import assert from "node:assert/strict";
import { test } from "node:test";
import { computeGa4Facts } from "./ga4-facts.js";

// Persona-point GA4 facts (GA4-P01..P17): one pass, one fail and one no_data
// fixture each. no_data = the report is missing, as on rows saved before the
// 2026-10-20 reports existed.

type Row = [string[], number[]];
const rep = (rows: Row[], extra: Record<string, unknown> = {}) => ({
  rows: rows.map(([d, m]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(v => ({ value: String(v) })) })),
  rowCount: rows.length,
  metadata: { currencyCode: "EGP" },
  ...extra,
});

function days(n: number, last?: [number, number, number]): Row[] {
  const out: Row[] = [];
  const start = Date.UTC(2026, 6, 20);
  for (let i = 0; i < n; i++) {
    const d = new Date(start + i * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
    out.push([[d], i === n - 1 && last ? last : [700, 420, 10]]);
  }
  return out;
}

function base() {
  return {
    details: { currencyCode: "EGP", timeZone: "Africa/Cairo" },
    dataStreams: [{ webStreamData: { defaultUri: "https://www.store.eg" } }],
    keyEvents: [{ eventName: "purchase" }] as Array<{ eventName: string }>,
    attribution: {
      reportingAttributionModel: "PAID_AND_ORGANIC_CHANNELS_DATA_DRIVEN",
      acquisitionConversionEventLookbackWindow: "ACQUISITION_CONVERSION_EVENT_LOOKBACK_WINDOW_30_DAYS",
      otherConversionEventLookbackWindow: "OTHER_CONVERSION_EVENT_LOOKBACK_WINDOW_90_DAYS",
    } as Record<string, string>,
    reportData: {
      realtime: rep([[[], [12]]]),
      weekOverWeek: rep([[["last7Days"], [5000, 40000]], [["prior7Days"], [5200, 41000]]]),
      totals: rep([[[], [20000, 12000, 90, 300]]]),
      purchaseMetrics: rep([[["purchase"], [300, 330000, 300]]]),
      channels: rep([[["Paid Social"], [12000, 150, 150]], [["Organic Search"], [7000, 140, 140]], [["Unassigned"], [1000, 10, 10]]]),
      sourceMedium: rep([[["facebook", "cpc"], [6000, 80, 80]], [["google", "organic"], [7000, 140, 140]]]),
      purchaseIds: rep([[["T1"], [1]], [["T2"], [1]]]),
      purchaseCurrency: rep([[["EGP"], [300, 330000]]]),
      itemSales: rep([[["Oil"], [200000, 400]], [["Cream"], [130000, 300]]], { totals: [{ metricValues: [{ value: "330000" }, { value: "700" }] }] }),
      hostnames: rep([[["www.store.eg"], [19990, 300, 330000]], [["store.eg"], [10, 0, 0]]]),
      trafficSources: rep([
        [["Paid Social", "facebook", "cpc", "summer_sale"], [6000, 3600, 400, 80]],
        [["Paid Social", "instagram", "cpc", "summer_sale"], [6000, 3500, 380, 70]],
        [["Organic Search", "google", "organic", "(organic)"], [7000, 4500, 500, 140]],
        [["Unassigned", "(not set)", "(not set)", "(not set)"], [1000, 300, 10, 10]],
      ]),
      dailyTrend: rep(days(90)),
      paidSegments: rep([
        [["Paid Social", "mobile", "new"], [6000, 60, 66000]],
        [["Paid Social", "mobile", "returning"], [3000, 60, 66000]],
        [["Paid Social", "desktop", "new"], [2000, 25, 27500]],
        [["Paid Social", "desktop", "returning"], [1000, 5, 5500]],
      ]),
      paidFunnel: rep([[["view_item"], [40000, 20000]], [["add_to_cart"], [3000, 2000]], [["begin_checkout"], [1500, 1100]], [["purchase"], [600, 600]]]),
      paidLanding: rep([[["/products/oil"], [5000, 300, 60]], [["/collections/all"], [4000, 200, 50]]]),
      events90: rep([[["page_view"], [100000]], [["purchase"], [900]]]),
    } as Record<string, unknown>,
  };
}

type O = ReturnType<typeof base>;
function fact(id: string, mut?: (o: O) => void) {
  const o = base();
  mut?.(o);
  const f = computeGa4Facts(o, "https://store.eg")!.facts[id];
  assert.ok(f, `${id} exists`);
  assert.ok(f.en.length > 10, `${id} has a sentence`);
  return f;
}
const rows = (o: O, key: string) => (o.reportData[key] as { rows: unknown[] }).rows;
const row = (d: string[], m: number[]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(v => ({ value: String(v) })) });

const cases: Array<{ id: string; fail: (o: O) => void; noData: (o: O) => void; failText: RegExp }> = [
  { id: "GA4-P01", fail: o => (o.reportData.purchaseIds = rep([[["T1"], [3]], [["T2"], [1]]])), noData: o => delete o.reportData.purchaseIds, failText: /order ID counted on more than one/ },
  { id: "GA4-P02", fail: o => rows(o, "purchaseCurrency").push(row(["(not set)"], [20, 0])), noData: o => delete o.reportData.purchaseIds, failText: /no currency/ },
  { id: "GA4-P03", fail: o => rows(o, "purchaseCurrency").push(row(["USD"], [10, 500])), noData: o => delete o.reportData.itemSales, failText: /2 currencies/ },
  { id: "GA4-P04", fail: o => ((o.reportData.itemSales as { totals: unknown }).totals = [{ metricValues: [{ value: "250000" }, { value: "700" }] }]), noData: o => delete o.reportData.itemSales, failText: /below order revenue/ },
  { id: "GA4-P05", fail: o => rows(o, "hostnames").push(row(["store-dev.myshopify.com"], [50, 2, 1000])), noData: o => delete o.reportData.hostnames, failText: /store-dev\.myshopify\.com/ },
  { id: "GA4-P06", fail: o => rows(o, "sourceMedium").push(row(["checkout.store.eg", "referral"], [300, 20, 20])), noData: o => { delete o.reportData.sourceMedium; delete o.reportData.trafficSources; }, failText: /checkout\.store\.eg/ },
  { id: "GA4-P07", fail: o => rows(o, "trafficSources").push(row(["Paid Social", "Facebook", "cpc", "summer_sale"], [50, 30, 2, 1])), noData: o => delete o.reportData.trafficSources, failText: /several spellings/ },
  { id: "GA4-P08", fail: o => rows(o, "trafficSources").push(row(["Paid Social", "facebook", "cpc", "{{campaign.name}}"], [50, 30, 2, 1])), noData: o => delete o.reportData.trafficSources, failText: /campaign\.name/ },
  { id: "GA4-P09", fail: o => rows(o, "trafficSources").push(row(["Unassigned", "facebook", "story", "summer"], [200, 100, 5, 2])), noData: o => delete o.reportData.trafficSources, failText: /facebook \/ story/ },
  { id: "GA4-P10", fail: o => (o.reportData.paidFunnel = rep([[["view_item"], [40000, 20000]], [["add_to_cart"], [2000, 1200]], [["begin_checkout"], [800, 700]], [["purchase"], [400, 400]]])), noData: o => delete o.reportData.paidFunnel, failText: /product page to add to cart/ },
  { id: "GA4-P11", fail: o => (o.reportData.paidLanding = rep([[["/products/oil"], [5000, 300, 60]], [["/collections/all"], [4000, 200, 5]]])), noData: o => delete o.reportData.paidLanding, failText: /\/collections\/all/ },
  {
    id: "GA4-P12",
    fail: o => (o.reportData.paidSegments = rep([[["Paid Social", "mobile", "new"], [6000, 5, 0]], [["Paid Social", "mobile", "returning"], [3000, 5, 0]], [["Paid Social", "desktop", "new"], [2000, 25, 0]], [["Paid Social", "desktop", "returning"], [1000, 5, 0]]])),
    noData: o => delete o.reportData.paidSegments,
    failText: /Under the 60% bar/,
  },
  {
    id: "GA4-P13",
    fail: o => (o.reportData.paidSegments = rep([[["Paid Social", "mobile", "new"], [6000, 0, 0]], [["Paid Social", "mobile", "returning"], [3000, 60, 0]], [["Paid Social", "desktop", "new"], [2000, 0, 0]], [["Paid Social", "desktop", "returning"], [1000, 5, 0]]])),
    noData: o => delete o.reportData.paidSegments,
    failText: /no purchases/,
  },
  { id: "GA4-P14", fail: o => (o.reportData.dailyTrend = rep(days(90, [3000, 450, 10]))), noData: o => delete o.reportData.dailyTrend, failText: /no rise in sales/ },
  { id: "GA4-P15", fail: o => (o.reportData.dailyTrend = rep(days(90, [3000, 450, 10]))), noData: o => delete o.reportData.dailyTrend, failText: /likely bots/ },
  { id: "GA4-P16", fail: o => o.keyEvents.push({ eventName: "generate_lead" }), noData: o => delete o.reportData.events90, failText: /generate_lead recorded nothing/ },
  { id: "GA4-P17", fail: o => (o.attribution.acquisitionConversionEventLookbackWindow = "ACQUISITION_CONVERSION_EVENT_LOOKBACK_WINDOW_7_DAYS"), noData: o => delete (o as Partial<O>).attribution, failText: /7 days instead of GA4's default 30/ },
];

for (const c of cases) {
  test(`${c.id}: pass, fail and no_data`, () => {
    const pass = fact(c.id);
    assert.equal(pass.status, "pass", `${c.id} pass: ${pass.en}`);
    const fail = fact(c.id, c.fail);
    assert.equal(fail.status, "fail", `${c.id} fail: ${fail.en}`);
    assert.match(fail.en, c.failText);
    const nd = fact(c.id, c.noData);
    assert.equal(nd.status, "no_data", `${c.id} no_data: ${nd.en}`);
  });
}

test("persona facts: old rows without the new reports are no_data, never pass", () => {
  const o = base();
  for (const k of ["purchaseIds", "purchaseCurrency", "itemSales", "hostnames", "trafficSources", "dailyTrend", "paidSegments", "paidFunnel", "paidLanding", "events90"]) delete o.reportData[k];
  delete (o as Partial<O>).attribution;
  const f = computeGa4Facts(o, "https://store.eg")!.facts;
  // GA4-P06 (self-referrals) also reads the older sourceMedium report, so it
  // can still answer on old rows.
  for (const c of cases.filter(c => c.id !== "GA4-P06")) assert.equal(f[c.id].status, "no_data", `${c.id}: ${f[c.id].en}`);
  assert.notEqual(f["GA4-P06"].status, "no_data");
  // Existing facts are untouched.
  assert.ok(f["GA4-01"] && f["GA4-24"]);
});

test("persona facts: a failed report counts as missing", () => {
  const f = fact("GA4-P05", o => (o.reportData.hostnames = { error: "403" }));
  assert.equal(f.status, "no_data");
});
