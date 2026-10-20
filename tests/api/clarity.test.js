import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isValidClarityToken,
  parseOverview,
  parseBreakdown,
  clarityMatchesSite,
  fetchClaritySnapshot,
  sanitizeClaritySnapshot,
} from "../../api/_lib/clarity.js";
import handler from "../../api/clarity/connect.js";
import { fakeReq, fakeRes, offlineAndQuiet, mockFetch } from "./helpers.js";

offlineAndQuiet();

const TOKEN = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.c2lnbmF0dXJlLXZhbHVl";

// Trimmed from a real no-dimension response (2026-10-20).
const OVERVIEW = [
  { metricName: "DeadClickCount", information: [{ sessionsCount: 6810, sessionsWithMetricPercentage: 3.54, sessionsWithoutMetricPercentage: 96.46, pagesViews: 258, subTotal: 460 }] },
  { metricName: "RageClickCount", information: [{ sessionsCount: 6810, sessionsWithMetricPercentage: 0.04, pagesViews: 3, subTotal: 5 }] },
  { metricName: "QuickbackClick", information: [{ sessionsCount: 6810, sessionsWithMetricPercentage: 13.17, pagesViews: 2560, subTotal: 2579 }] },
  { metricName: "ScriptErrorCount", information: [{ sessionsCount: 6810, sessionsWithMetricPercentage: 4.61, pagesViews: 325, subTotal: 425 }] },
  { metricName: "ScrollDepth", information: [{ averageScrollDepth: 35.36 }] },
  { metricName: "Traffic", information: [{ totalSessionCount: 6810, totalBotSessionCount: 1268, distinctUserCount: 6060, pagesPerSessionPercentage: 2.22 }] },
  { metricName: "EngagementTime", information: [{ totalTime: 111, activeTime: 49 }] },
  { metricName: "Device", information: [{ name: "Mobile", sessionsCount: 6569 }, { name: "PC", sessionsCount: 146 }] },
  { metricName: "PopularPages", information: [{ url: "https://www.shop.com/products/a", visitsCount: 3831 }, { url: "https://www.shop.com/", visitsCount: 1247 }] },
];

const BY_URL = [
  { metricName: "DeadClickCount", information: [{ Url: "https://www.shop.com/products/a", sessionsCount: 4000, sessionsWithMetricPercentage: 6.5 }] },
  { metricName: "QuickbackClick", information: [{ Url: "https://www.shop.com/products/a", sessionsCount: 4000, sessionsWithMetricPercentage: 20 }] },
  { metricName: "ScrollDepth", information: [{ Url: "https://www.shop.com/products/a", averageScrollDepth: 30 }] },
];

describe("token check", () => {
  test("accepts a JWT-shaped token and rejects anything else", () => {
    assert.equal(isValidClarityToken(TOKEN), true);
    for (const bad of ["", "abc", "not a token", "a.b", `${TOKEN} extra`, "x".repeat(5000)]) {
      assert.equal(isValidClarityToken(bad), false, bad);
    }
  });
});

describe("parsing", () => {
  test("overview keeps the sitewide numbers", () => {
    const o = parseOverview(OVERVIEW);
    assert.equal(o.sessions, 6810);
    assert.equal(o.botSessions, 1268);
    assert.equal(o.scrollDepth, 35.36);
    assert.deepEqual(o.behaviours.deadClicks, { sessionsPct: 3.54, pageViews: 258, count: 460 });
    assert.deepEqual(o.behaviours.quickbacks, { sessionsPct: 13.17, pageViews: 2560, count: 2579 });
    assert.equal(o.behaviours.excessiveScroll, null);
    assert.deepEqual(o.devices[0], { name: "Mobile", sessions: 6569 });
    assert.deepEqual(o.topPages[0], { url: "https://www.shop.com/products/a", visits: 3831 });
  });

  test("a URL breakdown becomes one row per page", () => {
    assert.deepEqual(parseBreakdown(BY_URL), [
      { name: "https://www.shop.com/products/a", sessions: 4000, scrollDepth: 30, deadClicks: 6.5, quickbacks: 20 },
    ]);
    assert.equal(parseBreakdown([]), null);
  });

  test("site match is by hostname, ignoring www", () => {
    assert.equal(clarityMatchesSite([{ url: "https://www.shop.com/x" }], "shop.com"), true);
    assert.equal(clarityMatchesSite([{ url: "https://m.shop.com/x" }], "www.shop.com"), true);
    assert.equal(clarityMatchesSite([{ url: "https://othershop.com/x" }], "shop.com"), false);
    assert.equal(clarityMatchesSite([], "shop.com"), false);
  });
});

describe("fetchClaritySnapshot", () => {
  test("keeps the overview when the breakdowns fail", async () => {
    const urls = [];
    mockFetch(url => {
      urls.push(String(url));
      return String(url).includes("dimension1") ? new Response("", { status: 400 }) : Response.json(OVERVIEW);
    });
    const snap = await fetchClaritySnapshot(TOKEN, "shop.com");
    assert.equal(urls.length, 3);
    assert.ok(urls.every(u => u.includes("numOfDays=3")));
    assert.equal(snap.sessions, 6810);
    assert.equal(snap.hostMatch, true);
    assert.equal(snap.byUrl, null);
    assert.equal(snap.byDevice, null);
  });
});

describe("sanitizeClaritySnapshot", () => {
  test("rebuilds from known fields and recomputes the site match", () => {
    const raw = { ...parseOverview(OVERVIEW), source: "clarity", days: 3, hostMatch: true, fetchedAt: "2026-10-20T10:00:00.000Z", evil: "<script>", byUrl: [{ name: "https://www.shop.com/a", sessions: 10, deadClicks: 500 }] };
    const clean = sanitizeClaritySnapshot(raw, "shop.com");
    assert.equal(clean.evil, undefined);
    assert.equal(clean.hostMatch, true);
    assert.equal(clean.byUrl[0].deadClicks, 100, "percentages are clamped");
    assert.equal(sanitizeClaritySnapshot(raw, "another.com").hostMatch, false);
    assert.equal(sanitizeClaritySnapshot({ source: "other" }, "shop.com"), null);
    assert.equal(sanitizeClaritySnapshot(null, "shop.com"), null);
  });
});

describe("POST /api/clarity/connect", () => {
  async function call(body, method = "POST") {
    const res = fakeRes();
    await handler(fakeReq({ method, body }), res);
    return res;
  }

  test("returns the snapshot for a token that tracks the site", async () => {
    mockFetch(url => (String(url).includes("dimension1") ? new Response("", { status: 400 }) : Response.json(OVERVIEW)));
    const res = await call({ token: TOKEN, website: "https://shop.com" });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.snapshot.sessions, 6810);
    assert.deepEqual(res.body.summary, { sessions: 6810, days: 3, breakdowns: false });
  });

  test("rejects a project that doesn't track this site", async () => {
    mockFetch(() => Response.json(OVERVIEW));
    const res = await call({ token: TOKEN, website: "https://othershop.com" });
    assert.equal(res.statusCode, 422);
    assert.match(res.body.error, /doesn't seem to track othershop\.com/);
  });

  test("maps Clarity's errors to plain messages", async () => {
    mockFetch(() => new Response("", { status: 401 }));
    assert.equal((await call({ token: TOKEN, website: "https://shop.com" })).statusCode, 401);
    mockFetch(() => new Response("", { status: 429 }));
    assert.equal((await call({ token: TOKEN, website: "https://shop.com" })).statusCode, 429);
    mockFetch(() => new Response("", { status: 500 }));
    assert.equal((await call({ token: TOKEN, website: "https://shop.com" })).statusCode, 502);
  });

  test("validates input and method", async () => {
    assert.equal((await call({ token: "nope", website: "https://shop.com" })).statusCode, 400);
    assert.equal((await call({ token: TOKEN, website: "" })).statusCode, 400);
    assert.equal((await call({}, "GET")).statusCode, 405);
  });
});
