import test from "node:test";
import assert from "node:assert/strict";
import { computeClarityFacts, clarityFactsPromptBlock, type ClaritySnapshot } from "./clarity-facts.js";

const SNAPSHOT: ClaritySnapshot = {
  source: "clarity",
  fetchedAt: "2026-10-20T10:00:00.000Z",
  days: 3,
  hostMatch: true,
  sessions: 6810,
  botSessions: 1268,
  distinctUsers: 6060,
  pagesPerSession: 2.2,
  engagement: { totalSeconds: 111, activeSeconds: 49 },
  scrollDepth: 35.36,
  behaviours: {
    deadClicks: { sessionsPct: 3.54, pageViews: 258, count: 460 },
    rageClicks: { sessionsPct: 0.04, pageViews: 3, count: 5 },
    quickbacks: { sessionsPct: 13.17, pageViews: 2560, count: 2579 },
    excessiveScroll: null,
    scriptErrors: { sessionsPct: 4.61, pageViews: 325, count: 425 },
    errorClicks: null,
  },
  devices: [{ name: "Mobile", sessions: 6569 }, { name: "PC", sessions: 146 }],
  browsers: [{ name: "FacebookApp", sessions: 2222 }, { name: "ChromeMobile", sessions: 1909 }, { name: "InstagramApp", sessions: 1580 }],
  os: [],
  countries: [],
  referrers: [],
  pageTitles: [],
  topPages: [{ url: "https://www.shop.com/products/a", visits: 3831 }],
  byUrl: [
    { name: "https://www.shop.com/products/a", sessions: 3900, scrollDepth: 30, deadClicks: 8, quickbacks: 14 },
    { name: "https://www.shop.com/tiny", sessions: 10, scrollDepth: 10, deadClicks: 40 },
  ],
  byDevice: null,
};

test("clarity facts: shares and in-app browsers from the snapshot", () => {
  const f = computeClarityFacts(SNAPSHOT)!;
  assert.equal(f.sessions, 6810);
  assert.equal(f.botShare, 18.6);
  assert.equal(f.mobileShare, 96.5);
  assert.equal(f.inAppShare, 55.8);
  assert.deepEqual(f.inAppBrowsers.map(b => b.name), ["FacebookApp", "InstagramApp"]);
  assert.equal(f.activeShare, 44.1);
  assert.equal(f.sitewide.quickbacks, 13.17);
  assert.equal(f.mobileVsDesktop, null);
});

test("clarity facts: a page counts as an outlier at twice the site's own rate, with enough sessions", () => {
  const f = computeClarityFacts(SNAPSHOT)!;
  assert.deepEqual(f.hotPages, [{ url: "https://www.shop.com/products/a", behaviour: "deadClicks", pageRate: 8, siteRate: 3.54, sessions: 3900 }]);
  assert.equal(computeClarityFacts({ ...SNAPSHOT, byUrl: null })!.hotPages, null);
});

test("clarity facts: nothing for a missing, foreign or empty snapshot", () => {
  assert.equal(computeClarityFacts(null), null);
  assert.equal(computeClarityFacts(undefined), null);
  assert.equal(computeClarityFacts({ ...SNAPSHOT, hostMatch: false }), null);
  assert.equal(computeClarityFacts({ ...SNAPSHOT, sessions: 0 }), null);
  assert.equal(computeClarityFacts({ source: "other" }), null);
});

test("clarity facts: the prompt block quotes the numbers and the source", () => {
  const block = clarityFactsPromptBlock(computeClarityFacts(SNAPSHOT)!);
  assert.match(block, /Microsoft Clarity, last 3 days, 6810 sessions/);
  assert.match(block, /in-app browsers: 55\.8% \(FacebookApp 2222, InstagramApp 1580\)/);
  assert.match(block, /products\/a: dead clicks .* in 8% of its 3900 sessions \(site 3\.54%\)/);
});
