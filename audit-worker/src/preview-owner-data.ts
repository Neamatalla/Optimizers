/**
 * Dev-only sample data for the store owner preview (preview-report.ts
 * --role=store_owner): a Saudi store on Salla, selling oud, perfume and
 * bakhoor, in SAR. The numbers are chosen to agree with each other, so a
 * contradiction on the rendered page comes from the report's code, not from
 * the fixture (owner gap audit, items marked [fixture]):
 *   - 300 purchases from 20,000 visits = 1.50% everywhere (funnel, totals,
 *     conversions, purchase events, transactions).
 *   - Add-to-cart rate is 8% both as the funnel step (1,200 of 15,000 product
 *     viewers) and across the product pages (1,200 adds of 15,000 views).
 *   - Cart to checkout is 41% (492 of 1,200) in GA4 and in the page review.
 *   - Phones are 85% of visits in GA4 and about 86% in Clarity, and Clarity's
 *     3 days are about 3/28 of GA4's 28 days.
 *   - Free delivery from SAR 600 with an SAR 350 cart: "SAR 250 more".
 * Nothing here reaches a real audit.
 */

import type { Ga4Metrics } from "./types.js";

export const OWNER_STORE = {
  name: "Bayt Al Oud",
  nameAr: "بيت العود",
  website: "https://baytaloud.example",
  platform: "Salla",
  currency: "SAR",
  timeZone: "Asia/Riyadh",
  /** Free delivery starts here (the cart line our visit read). */
  freeDeliveryFrom: 600,
  /** The cart our visit filled: one 350 SAR item. */
  cartTotal: 350,
} as const;

const rep = (rows: Array<[string[], number[]]>, currencyCode?: string) => ({
  rows: rows.map(([d, m]) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(v => ({ value: String(v) })) })),
  metadata: { currencyCode },
});

/** The GA4 pull (same shape as the form's Google sign-in data). */
export function ownerSampleGa4OAuth() {
  const C = OWNER_STORE.currency;
  return {
    details: { currencyCode: C, timeZone: OWNER_STORE.timeZone },
    retention: { eventDataRetention: "TWO_MONTHS" },
    keyEvents: [{ eventName: "purchase" }, { eventName: "page_view" }],
    googleAdsLinks: [],
    audiences: [{ displayName: "All Users" }, { displayName: "Purchasers" }],
    reportData: {
      realtime: rep([[[], [12]]]),
      weekOverWeek: rep([[["last7Days"], [5000, 40000]], [["prior7Days"], [5200, 41000]]]),
      eventVolume: rep([[["page_view"], [60000]], [["view_search_results"], [800]]]),
      totals: rep([[[], [20000, 12000, 90, 300]]], C),
      purchaseMetrics: rep([[["purchase"], [300, 105000, 300]]], C),
      funnel: rep([[["view_item"], [40000, 15000]], [["add_to_cart"], [3000, 1200]], [["begin_checkout"], [800, 492]], [["purchase"], [300, 300]]]),
      deviceConversion: rep([[["mobile"], [17000, 200, 70000, 200]], [["desktop"], [3000, 100, 35000, 100]]]),
      channels: rep([[["Paid Social"], [12000, 150]], [["Unassigned"], [3000, 20]], [["Organic Search"], [5000, 130]]]),
      newVsReturning: rep([[["new"], [15000, 180]], [["returning"], [5000, 120]]]),
      landingPages: rep([[["/collections/offers"], [3000, 2]], [["/"], [8000, 200]]]),
      pageFunnel: rep([
        [["/products/cambodi-oud", "view_item"], [6000]], [["/products/cambodi-oud", "add_to_cart"], [150]],
        [["/products/musk-tahara", "view_item"], [4000]], [["/products/musk-tahara", "add_to_cart"], [500]],
        [["/products/bakhoor-gift-set", "view_item"], [5000]], [["/products/bakhoor-gift-set", "add_to_cart"], [550]],
      ]),
      sourceMedium: rep([[["tabby.ai", "referral"], [40, 12]], [["google", "cpc"], [3000, 60]]]),
      countryConversion: rep([[["Saudi Arabia"], [17000, 290]], [["India"], [1500, 0]], [["United Arab Emirates"], [1500, 10]]]),
      trafficSources: rep([
        [["Paid Social", "snapchat", "paid_social", "white_friday_teaser"], [5200, 2900, 420, 52, 18200]],
        [["Organic Search", "google", "organic", "(organic)"], [5000, 3200, 380, 130, 45500]],
        [["Paid Social", "instagram", "paid_social", "reels_new_oud"], [2600, 700, 40, 3, 1050]],
        [["Paid Social", "tiktok", "paid_social", "tiktok_bakhoor"], [2100, 1300, 25, 2, 700]],
        [["Paid Search", "google", "cpc", "brand_search"], [1800, 1300, 210, 48, 16800]],
        [["Direct", "(direct)", "(none)", "(direct)"], [1500, 900, 80, 30, 10500]],
        [["Paid Social", "snapchat", "paid_social", "(not set)"], [1200, 600, 60, 9, 3150]],
        [["Paid Search", "google", "cpc", "pmax_all_products"], [1200, 700, 110, 12, 4200]],
        [["Paid Social", "instagram", "paid_social", "retargeting_cart_7d"], [900, 650, 160, 41, 14350]],
        [["Paid Social", "snapchat", "paid_social", "snap_eid_offer"], [800, 520, 120, 2, 700]],
        [["Referral", "whatsapp", "referral", "(referral)"], [300, 220, 40, 15, 5250]],
        [["Paid Social", "tiktok", "paid_social", "tt_test_ugc"], [60, 30, 3, 0, 0]],
      ], C),
    },
  };
}

/** The GA4 numbers behind the report's own funnel and KPI tiles. */
export function ownerGa4Metrics(): Ga4Metrics {
  return {
    periodDays: 28, currency: OWNER_STORE.currency, sessions: 20000, conversions: 300, conversionRate: 1.5, revenue: 105000,
    funnel: [{ event: "view_item", count: 15000 }, { event: "add_to_cart", count: 1200 }, { event: "begin_checkout", count: 492 }, { event: "purchase", count: 300 }],
    channels: [], segments: [],
  };
}

/** The cart line our phone visit read: enough for GA4-11 to compare the threshold with the average order. */
export function ownerStoreEvidence() {
  const w = OWNER_STORE.website;
  return {
    website: w,
    pages: [{
      pageType: "cart", url: `${w}/cart`, loaded: true, widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {},
      blocks: [{ id: "c1", text: `التوصيل مجاني للطلبات فوق ${OWNER_STORE.freeDeliveryFrom} ر.س`, y: 120, h: 24 }],
    }],
  };
}

/**
 * Clarity, 3 days. 2,150 visits is about 3/28 of GA4's 20,000; 1,850 on
 * phones is 86% (GA4: 85%).
 */
export function ownerClarityInput(website: string) {
  const base = website.replace(/\/$/, "");
  return {
    source: "clarity" as const, fetchedAt: new Date().toISOString(), days: 3, hostMatch: true,
    sessions: 2150, botSessions: 400, distinctUsers: 1900, pagesPerSession: 2.2,
    engagement: { totalSeconds: 111, activeSeconds: 49 }, scrollDepth: 35.4,
    behaviours: {
      deadClicks: { sessionsPct: 3.5, pageViews: 82, count: 145 },
      rageClicks: { sessionsPct: 0.04, pageViews: 1, count: 2 },
      quickbacks: { sessionsPct: 13.2, pageViews: 810, count: 815 },
      excessiveScroll: null,
      scriptErrors: { sessionsPct: 4.6, pageViews: 103, count: 134 },
      errorClicks: null,
    },
    devices: [{ name: "Mobile", sessions: 1850 }, { name: "PC", sessions: 300 }],
    browsers: [{ name: "SnapchatApp", sessions: 520 }, { name: "ChromeMobile", sessions: 610 }, { name: "InstagramApp", sessions: 380 }, { name: "MobileSafari", sessions: 340 }],
    os: [], countries: [], referrers: [], pageTitles: [],
    topPages: [{ url: `${base}/products/cambodi-oud`, visits: 1210 }],
    byUrl: [{ name: `${base}/products/cambodi-oud`, sessions: 1230, scrollDepth: 30, deadClicks: 8, quickbacks: 21, scriptErrors: 4 }],
    byDevice: null,
  };
}
