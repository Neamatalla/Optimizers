// The master audit point list: every point we check.
// Drafted 22 Nov 2026 from the old lists (see master-points/README.md), then
// reviewed. This file is now the source of truth: edit it by hand.
// Ids are stable and never reused.

import type { AuditPoint } from "./types.js";

export const POINTS: AuditPoint[] = [
  {
    "id": "TRK-01",
    "category": "tracking",
    "title": "Product views that turn into add to cart",
    "rule": "Over 28 days, with 50+ view_item users: add_to_cart users are at least 8% of view_item users. Fails as a tracking gap when the later step has over 5% more users than the earlier one, or sits under 30% of its benchmark.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Product visits that don't turn into add to cart",
        "whyItMatters": "Most product visits end without a sale, so this step limits every sale after it."
      },
      "marketing_manager": {
        "title": "Product views that turn into add to cart",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Product views that turn into add to cart",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev",
      "content"
    ],
    "defaultAction": "Fix the weakest product page (see GA4-10) using the product-page issues in the Conversion review.",
    "doneWhen": "Add-to-cart rate from product views is up over 14 days.",
    "origin": [
      "GA4-02",
      "SO-GA4-04"
    ],
    "note": "Rule matches ga4-facts.ts GA4-02; the code wins (decided 22 Nov). Report names the worst of TRK-01/02/03 as the biggest leak."
  },
  {
    "id": "TRK-02",
    "category": "tracking",
    "title": "Carts that reach checkout",
    "rule": "Over 28 days, with 50+ add_to_cart users: begin_checkout users are at least 50% of them (if begin_checkout is missing but add_shipping_info exists, add_shipping_info at least 40%). Fails as a tracking gap when the later step has over 5% more users than the earlier one, or sits under 30% of its benchmark.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "cart"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Carts that never reach checkout",
        "whyItMatters": "People leave full carts when the cost or next step is unclear, so sales stop one click from checkout."
      },
      "marketing_manager": {
        "title": "Carts that reach checkout",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Carts that reach checkout",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the cart issues the Conversion review found. Look at costs, trust and the next step.",
    "doneWhen": "Cart to checkout reaches 50% or more over 14 days.",
    "origin": [
      "GA4-03",
      "SO-GA4-03"
    ],
    "note": "Rule matches ga4-facts.ts GA4-03; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-03",
    "category": "tracking",
    "title": "Started checkouts that end in a sale",
    "rule": "Over 28 days, with 50+ begin_checkout users: purchase users are at least 50% of them (if begin_checkout is missing, at least 60% of add_shipping_info users). Fails as a tracking gap when the later step has over 5% more users than the earlier one, or sits under 30% of its benchmark.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Shoppers who start checkout but don't pay",
        "whyItMatters": "These people already chose to buy; every one lost here is a sale you almost had."
      },
      "marketing_manager": {
        "title": "Started checkouts that end in a sale",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Started checkouts that end in a sale",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Run one test order on a phone and check: shipping cost shown before the last step, cash on delivery offered, no forced account, local payment options, no errors.",
    "doneWhen": "Each item on that list is tested and fixed or ruled out, and checkout to purchase is at 50% or more.",
    "origin": [
      "GA4-04",
      "SO-GA4-02"
    ],
    "note": "Rule matches ga4-facts.ts GA4-04; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-04",
    "category": "tracking",
    "title": "Paid campaign with visits but no sales",
    "rule": "No paid campaign with at least 150 sessions (and 2% of all sessions) converts below a quarter of the store average in 28 days; a failing campaign is named with its top landing page.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Paid campaign that brings visits but no sales",
        "whyItMatters": "Ad visits that never buy cost you money every day the campaign runs."
      },
      "media_buyer": {
        "title": "Paid campaign that brings clicks but almost no sales",
        "whyItMatters": "Paid clicks on this campaign are likely lost after landing, so CAC is higher than it needs to be; fixing the page or the destination is expected to raise ROAS on the same spend.",
        "adEffect": "cost",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Paid campaign with visits but no sales",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Paid campaign with visits but no sales",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Pause that campaign. Or send it to a landing page that sells.",
    "doneWhen": "The campaign is paused. Or its conversion rate is up after the change.",
    "origin": [
      "GA4-07",
      "SO-GA4-12",
      "MB-GA4-01"
    ],
    "note": "Volume and near-zero cutoffs to tune. Review: Rule says 0.2% but the code (GA4-07) uses a quarter of store average with a scaled session minimum. Use one test; a fixed 0.2% fails stores with low conversion."
  },
  {
    "id": "TRK-05",
    "category": "tracking",
    "title": "Google Ads receives your sales",
    "rule": "If GA4 shows google/cpc sessions: a Google Ads conversion tag plus Conversion Linker exist in GTM, or the account is known to import GA4 purchases (otherwise unassessed, not fail).",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Google Ads sees your sales",
        "whyItMatters": "Google Ads can only find more buyers if it sees which clicks became sales."
      },
      "media_buyer": {
        "title": "Google Ads conversion tag, Conversion Linker and Enhanced Conversions set",
        "whyItMatters": "Missing conversions or no Conversion Linker leave Smart Bidding with fewer sales, so Google's reported ROAS reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Google Ads receives your sales",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Google Ads receives your sales",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add the Google Ads conversion tag, the Conversion Linker and enhanced conversions.",
    "doneWhen": "Google Ads shows the conversion as recording, with enhanced conversions active.",
    "origin": [
      "GTM-05",
      "SO-GTM-12",
      "MB-GTM-11"
    ],
    "note": "Enhanced conversions: advice, not pass/fail. Import isn't visible from GA4 alone. Review: Ads-to-GA4 link and the Ads conversion tag are two checks. With a link but no tag, import cannot be seen, so a fail is not certain. Split the link check out."
  },
  {
    "id": "TRK-06",
    "category": "tracking",
    "title": "Payment pages or own domains taking credit",
    "rule": "No payment gateway (Tabby, Tamara, KNET, MyFatoorah and others) is a session source with 5+ sessions in 28 days, and the store's own domain never appears as a referral source.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Tabby, Tamara or your payment page taking credit for sales",
        "whyItMatters": "When payment pages take the credit, you can't see which ads and links really bring sales."
      },
      "media_buyer": {
        "title": "Payment gateways taking credit for paid sales",
        "whyItMatters": "Sales credited to a gateway are taken from your campaigns, so paid ROAS in GA4 reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Payment pages or own domains taking credit",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Payment pages or own domains taking credit",
        "adEffect": "deflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Open the GA4 data stream. Add those sites to the unwanted referrals list.",
    "doneWhen": "They no longer appear as traffic sources.",
    "origin": [
      "GA4-19",
      "SO-GA4-14",
      "MB-GA4-07",
      "SO-GA4-15",
      "MB-GA4-10"
    ],
    "note": "Rule matches ga4-facts.ts GA4-19, GA4-P06; the code wins (decided 22 Nov). Own-domain list from crawl hostnames and GA4 hostName."
  },
  {
    "id": "TRK-07",
    "category": "tracking",
    "title": "Tracking live with no sudden drop",
    "rule": "Fails when: realtime shows no users while the store averages 5+ visits per 30 minutes; nothing was recorded in the last 7 days; visits fell over 40% week on week (prior week 200+); or a day in the last 28 had a spike of unengaged visits.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "GA4 is recording right now, with no sudden drops or jumps",
        "whyItMatters": "A tracking gap hides sales, and fake visits make your conversion rate look worse than it is."
      },
      "media_buyer": {
        "title": "Tracking live with no sudden drop",
        "whyItMatters": "When tracking drops, GA4 misses sales, so reported ROAS reads lower than real and good campaigns can get cut.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Tracking live with no sudden drop",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Tracking live with no sudden drop",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the tag before anything else; check the last GTM publish and the last site release.",
    "doneWhen": "Events flowing in realtime and no unexplained cliff.",
    "origin": [
      "GA4-15",
      "SO-GA4-07",
      "MB-GA4-06",
      "MB-GA4-14"
    ],
    "note": "Rule matches ga4-facts.ts GA4-15, GA4-P15; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-08",
    "category": "tracking",
    "title": "Every buying step is recorded",
    "rule": "view_item, add_to_cart, begin_checkout (or add_shipping_info) and purchase all record events in 28 days, and no funnel step shows a tracking gap. Fails as a tracking gap when the later step has over 5% more users than the earlier one, or sits under 30% of its benchmark.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart",
      "checkout"
    ],
    "needs": [
      "ga4",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Every buying step is recorded",
        "whyItMatters": "You can't find where sales are lost if a step of the path isn't recorded."
      },
      "media_buyer": {
        "title": "Funnel events all reach GA4 with sane counts",
        "whyItMatters": "Missing funnel events mean fewer signals and smaller retargeting audiences, so the algorithm learns slower and CAC stays higher.",
        "adEffect": "optimization",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Every buying step is recorded",
        "adEffect": "optimization"
      },
      "agency": {
        "title": "Every buying step is recorded",
        "adEffect": "optimization"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add or fix the missing funnel event so each step can be measured.",
    "doneWhen": "Every funnel step shows in GA4 with plausible counts.",
    "origin": [
      "GA4-17",
      "SO-GA4-08",
      "MB-GA4-16",
      "GTM-06"
    ],
    "note": "Rule matches ga4-facts.ts GA4-17; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-09",
    "category": "tracking",
    "title": "Each order counted once",
    "rule": "No order ID is counted on more than one purchase event, purchase events and transactions are within 10% of each other, and purchases carry revenue and a currency.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Your sales number in GA4 matches your real orders",
        "whyItMatters": "Every money figure in this report comes from this number; if it is wrong, you can't trust any of them."
      },
      "media_buyer": {
        "title": "Same order counted twice in GA4",
        "whyItMatters": "An order counted twice makes GA4 revenue, and the Google Ads conversions imported from it, read higher than real, so losing campaigns can look like winners; fixing it may lower reported numbers, which is the truth showing, not performance dropping.",
        "adEffect": "inflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Each order counted once",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Each order counted once",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the purchase tag so each order is sent once with its value and currency.",
    "doneWhen": "Purchases equal transactions and revenue matches the store admin within 5%.",
    "origin": [
      "GA4-18",
      "SO-GA4-06",
      "MB-GA4-02"
    ],
    "note": "Rule matches ga4-facts.ts GA4-18, GA4-P01; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-10",
    "category": "tracking",
    "title": "Purchases carry revenue and products",
    "rule": "Purchases carry a non-zero value in one currency (none unset), at most 5% of items sold have no product name, and item revenue is within 5% of order revenue.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Sales recorded per product",
        "whyItMatters": "Without product sales, you can't tell which products to push, restock or drop."
      },
      "media_buyer": {
        "title": "GA4 purchase revenue zero, in mixed currencies, or not matching its items",
        "whyItMatters": "Missing or wrong values make reported ROAS read lower than real, so value-based bidding learns from bad numbers and winning campaigns can get cut.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Purchases carry revenue and products",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Purchases carry revenue and products",
        "adEffect": "deflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Forward to the developer: the purchase event must send value as a number, the store currency, and the full items list.",
    "doneWhen": "purchaseRevenue is above zero, one currency shows on purchases, and item revenue matches purchase revenue apart from shipping and tax.",
    "origin": [
      "MB-GA4-03",
      "SO-GA4-22",
      "GTM-02",
      "MB-GTM-03"
    ],
    "note": "Rule matches ga4-facts.ts GA4-P03, GA4-P04; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-11",
    "category": "tracking",
    "title": "Conversion tags fire only on the purchase event",
    "rule": "Every purchase or conversion tag fires on a dataLayer custom-event trigger, never on All Pages or a thank-you URL page view, and sends transaction_id.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Purchase tags fire once, only on the real purchase",
        "whyItMatters": "Double-counted orders make your sales and conversion rate look higher than the money in your bank."
      },
      "media_buyer": {
        "title": "Purchase tags fire on a thank-you page view or without an order ID",
        "whyItMatters": "A repeat Purchase makes reported ROAS read higher than real, so losing campaigns can look like winners and get scaled; fixing it may lower reported ROAS, which is the truth showing.",
        "adEffect": "inflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Conversion tags fire only on the purchase event",
        "adEffect": "inflated"
      },
      "agency": {
        "title": "Conversion tags fire only on the purchase event",
        "adEffect": "inflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fire purchase tags on the dataLayer purchase event. Send transaction_id with them.",
    "doneWhen": "Each order shows one purchase in GA4 and the ad platforms.",
    "origin": [
      "GTM-01",
      "GTM-07",
      "SO-GTM-01",
      "MB-GTM-01",
      "MB-GTM-09"
    ]
  },
  {
    "id": "TRK-12",
    "category": "tracking",
    "title": "Pixel live for every ad platform you run",
    "rule": "For each platform with paid sessions in GA4 (Meta, TikTok, Snap, Google Ads), its pixel loads and sends PageView and AddToCart hits, not blocked, during our visit.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "ga4",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Ad pixels fire on your live pages",
        "whyItMatters": "Without a working pixel, your ads cannot learn which visitors buy, so you pay for visitors who are less likely to order."
      },
      "media_buyer": {
        "title": "Pixel missing or blocked for a platform you run",
        "whyItMatters": "A platform with no pixel cannot see sales, so reported ROAS reads low and its algorithm optimises blind.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Pixel live for every ad platform you run",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Pixel live for every ad platform you run",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "marketing",
      "dev"
    ],
    "defaultAction": "Add the pixels for the platforms you advertise on.",
    "doneWhen": "Pixels load and fire.",
    "origin": [
      "W-25",
      "SO-WC-11",
      "MB-WC-03"
    ],
    "note": "Without GA4, fail only when no ad pixel loads at all. Review: A missing pixel hit may be consent default (no banner choice), bot blocking or a failed Add to Cart click. Code proves only the pass."
  },
  {
    "id": "TRK-13",
    "category": "tracking",
    "title": "Purchase events set for each paid platform",
    "rule": "For each platform with paid sessions in GA4, GTM has purchase and add-to-cart tags on matching event triggers, or a store-app integration sends them.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Purchase tag set up for every ad platform you pay for",
        "whyItMatters": "An ad platform that never sees your sales cannot find more buyers like them."
      },
      "media_buyer": {
        "title": "Meta tags set up for every funnel step",
        "whyItMatters": "Missing funnel events leave Meta optimising on thin signal, so delivery finds fewer buyers and CAC likely runs higher than it needs to.",
        "adEffect": "optimization",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Purchase events set for each paid platform",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Purchase events set for each paid platform",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add the missing platform's pixel. Send add-to-cart and purchase events.",
    "doneWhen": "That platform's events manager shows add-to-cart and purchase.",
    "origin": [
      "GTM-04",
      "SO-GTM-06",
      "MB-GTM-06",
      "MB-GTM-12",
      "MB-GTM-14"
    ],
    "note": "Code reads GTM; AI judges whether a store app covers the platform. Review: Rule keeps only purchase. Origins also required AddToCart and InitiateCheckout (Meta, TikTok) and ViewContent/ADD_CART (Snap); these funnel steps are lost."
  },
  {
    "id": "TRK-14",
    "category": "tracking",
    "title": "Each event sent once",
    "rule": "During our visit each GA4 ID and pixel sends one page_view/PageView per page load and one add-to-cart hit per click; gtag.js loads once per measurement ID.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "visit",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "GA4 counts each visit and event once",
        "whyItMatters": "Double counting makes your conversion rate look lower or higher than it is, so you fix the wrong thing."
      },
      "media_buyer": {
        "title": "Same event sent twice by two setups",
        "whyItMatters": "Double events inflate reported conversions and feed the algorithm a false signal, so reported ROAS reads higher than real and audiences fill with wrong people.",
        "adEffect": "inflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Each event sent once",
        "adEffect": "inflated"
      },
      "agency": {
        "title": "Each event sent once",
        "adEffect": "inflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Remove the duplicate tag or script that sends the same event twice.",
    "doneWhen": "Each event sends 1 hit per action in the network log.",
    "origin": [
      "W-24",
      "SO-WC-08",
      "GTM-09",
      "SO-GTM-05",
      "MB-WC-01"
    ]
  },
  {
    "id": "TRK-15",
    "category": "tracking",
    "title": "Consent setup not hiding Gulf visitors",
    "rule": "The GTM consent defaults are region-specific, or none deny ad_storage and analytics_storage for GCC countries (SA, AE, KW, QA, BH, OM).",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "gtm",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Consent settings do not hide your Gulf visitors",
        "whyItMatters": "Visits and orders blocked by consent disappear from your reports, so your sales look lower than they are."
      },
      "media_buyer": {
        "title": "Consent default set first in the container, per region",
        "whyItMatters": "Blocked tags hide real sales from every platform, so reported ROAS reads lower than real and the algorithm learns from a fraction of buyers.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Consent setup not hiding Gulf visitors",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Consent setup not hiding Gulf visitors",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Set consent defaults per region. GCC and Egypt visits then record normally.",
    "doneWhen": "GCC and Egypt visits record in GA4. EEA visits stay denied by default.",
    "origin": [
      "GTM-25",
      "SO-GTM-03",
      "MB-GTM-04"
    ],
    "note": "Review: 'Our GCC visit' is wrong: the worker runs from Railway, not a GCC IP, so region consent logic gives wrong results. Decide from the GTM/CMP config only; no GTM consent template means unassessed."
  },
  {
    "id": "TRK-16",
    "category": "tracking",
    "title": "Shopify checkout events tracked",
    "rule": "Store is not Shopify, or begin_checkout and purchase come from a Shopify Customer Events pixel or native app, not GTM tags.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "checkout"
    ],
    "needs": [
      "crawl",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Shopify checkout and orders are tracked",
        "whyItMatters": "If checkout and orders are not recorded, GA4 cannot show your real sales or where shoppers drop out of checkout."
      },
      "media_buyer": {
        "title": "Shopify checkout purchases actually reach the platforms",
        "whyItMatters": "Sales that never fire make reported ROAS read lower than real, so winning campaigns can get cut and the algorithm learns from fewer purchases.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Shopify checkout events tracked",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Shopify checkout events tracked",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Send checkout and purchase from a Shopify Customer Events custom pixel.",
    "doneWhen": "begin_checkout and purchase arrive in GA4 from the custom pixel.",
    "origin": [
      "GTM-21",
      "SO-GTM-02",
      "MB-GTM-02"
    ],
    "note": "Code detects Shopify and GTM tags; AI confirms the native setup."
  },
  {
    "id": "TRK-17",
    "category": "tracking",
    "title": "Our add to cart reaches GA4 and pixels",
    "rule": "If our Add to Cart click fills the cart, the dataLayer gets add_to_cart and GA4 and each pixel send at least one add-to-cart hit; else unassessed.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Add to cart is counted once in tracking for each real add",
        "whyItMatters": "A wrong add-to-cart count hides whether your product pages or your cart are losing the sale."
      },
      "media_buyer": {
        "title": "Our successful Add to Cart reaches GA4 and every pixel",
        "whyItMatters": "Missing Add to Cart events thin the mid-funnel signal and retargeting audiences the algorithm uses.",
        "adEffect": "optimization",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Our add to cart reaches GA4 and pixels",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Our add to cart reaches GA4 and pixels",
        "adEffect": "deflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Trigger add_to_cart from the theme's AJAX add-to-cart event.",
    "doneWhen": "A drawer add produces add_to_cart in DebugView.",
    "origin": [
      "GTM-24",
      "SO-GTM-04",
      "W-22",
      "MB-WC-08",
      "MB-GTM-10"
    ],
    "note": "Review: 'one add-to-cart hit' duplicates TRK-14. Say at least one. If the click did not fill the cart, or consent default denies pixels, result is unassessed, not fail."
  },
  {
    "id": "TRK-18",
    "category": "tracking",
    "title": "Shopping events carry value and products",
    "rule": "view_item and add_to_cart pushes and hits carry a numeric value, a 3-letter currency, and items with item_id, item_name, price and quantity.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Shopping events carry value, currency and product details",
        "whyItMatters": "Without these fields your reports cannot show which products sell or what each step is worth in money."
      },
      "media_buyer": {
        "title": "Live product and cart events sent without value, currency or items",
        "whyItMatters": "Events without value starve value-based bidding and catalogue retargeting, so reported ROAS reads low and the algorithm optimises on counts, not money.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Shopping events carry value and products",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Shopping events carry value and products",
        "adEffect": "deflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add items, value and currency to the ecommerce events.",
    "doneWhen": "All fields present.",
    "origin": [
      "W-23",
      "GTM-08",
      "SO-WC-07",
      "MB-WC-06",
      "MB-WC-24",
      "MB-WC-10"
    ],
    "note": "Review: Seven origins mix completeness (items, value, currency, field names) with correctness (value equals shown price). Shown-price parsing is not certain (sale vs compare price). Split correctness out as code+ai."
  },
  {
    "id": "TRK-19",
    "category": "tracking",
    "title": "Tracking on every page type",
    "rule": "The same GTM container ID we read (or the GA4 tag) loads on home, collection, product and cart, on phone and desktop.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "home",
      "collection",
      "product",
      "cart"
    ],
    "needs": [
      "visit",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Tracking loads on every page type, phone and desktop",
        "whyItMatters": "A page with no tracking is a blind spot: its visitors and sales disappear from your numbers."
      },
      "media_buyer": {
        "title": "Tracking missing on pages your ads land on",
        "whyItMatters": "Pages with no tracking send no events, so sales from those landing pages go uncounted and reported ROAS reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Tracking on every page type",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Tracking on every page type",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Install the tag on every page template.",
    "doneWhen": "Tag loads on home, product and cart.",
    "origin": [
      "W-21",
      "SO-WC-06",
      "MB-WC-05"
    ]
  },
  {
    "id": "TRK-20",
    "category": "tracking",
    "title": "Phone shoppers convert close to desktop",
    "rule": "With 200+ sessions on both phone and desktop and at least one desktop sale in 28 days, phone conversion rate is at least 60% of desktop's.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Phone shoppers buy less than desktop shoppers",
        "whyItMatters": "Most of your visitors are on phones, so a weak phone page holds back most of your sales."
      },
      "marketing_manager": {
        "title": "Phone shoppers convert close to desktop",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Phone shoppers convert close to desktop",
        "adEffect": "performance"
      },
      "media_buyer": {
        "title": "Paid traffic on phones vs desktop",
        "whyItMatters": "Paid clicks on phones that cannot convert raise CAC; fixing the phone page is expected to lift CVR and ROAS on mobile placements.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the phone issues on the page behind the worst funnel step. The Conversion review shows them.",
    "doneWhen": "Phones convert at 60% of desktop or more, over 14 days.",
    "origin": [
      "GA4-05",
      "SO-GA4-05",
      "MB-GA4-12"
    ],
    "note": "Rule matches ga4-facts.ts GA4-05; the code wins (decided 22 Nov). Session minimum is a threshold to tune."
  },
  {
    "id": "TRK-21",
    "category": "tracking",
    "title": "Busy landing pages with no sales",
    "rule": "No landing page with at least 200 sessions (or 3% of all sessions) converts below one third of the store average in 28 days; the biggest such page is named.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Landing pages with visits but no sales",
        "whyItMatters": "Visits that land on a page that doesn't sell are money spent with nothing back."
      },
      "marketing_manager": {
        "title": "Busy landing pages with no sales",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Busy landing pages with no sales",
        "adEffect": "performance"
      },
      "media_buyer": {
        "title": "Paid landing pages that don't convert",
        "whyItMatters": "Paid clicks landing on a weak page are bought and lost, so CVR is low and CAC higher than it needs to be; fixing it is expected to raise ROAS.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev",
      "marketing"
    ],
    "defaultAction": "Fix that landing page. Until then, stop sending ads to it.",
    "doneWhen": "The page converts at half the store average or more. Or no paid traffic lands on it.",
    "origin": [
      "GA4-06",
      "SO-GA4-10",
      "MB-GA4-08"
    ],
    "note": "Rule matches ga4-facts.ts GA4-06; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-22",
    "category": "tracking",
    "title": "Popular products viewed but not added",
    "rule": "No product page with at least 100 views (or 2% of all product views) adds to cart at under half the store average in 28 days; the worst one is named.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Popular products that people view but don't add",
        "whyItMatters": "Your most-viewed product that doesn't sell is where your visits are lost."
      },
      "media_buyer": {
        "title": "Product pages that get views but no add to cart",
        "whyItMatters": "Paid clicks sent to a product that does not add to cart are wasted, so CAC rises; fixing the page or switching the product is expected to lift CVR.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Popular products viewed but not added",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Popular products viewed but not added",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "content",
      "owner"
    ],
    "defaultAction": "Fix that product page. Check the price, photos, stock and sizes. The Conversion review checks this exact product.",
    "doneWhen": "That product gets added to cart as often as the store average.",
    "origin": [
      "GA4-10",
      "SO-GA4-09",
      "MB-GA4-19"
    ],
    "note": "Rule matches ga4-facts.ts GA4-10; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-23",
    "category": "tracking",
    "title": "Campaign tags survive redirects",
    "rule": "Home opened with test utm_ values and gclid/fbclid/ttclid keeps all of them in the first GA4 page_view page_location after any redirect.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Campaign tags survive redirects so GA4 credits the right source",
        "whyItMatters": "When the tags drop, sales from your ads show up as direct visits and good campaigns look weak."
      },
      "media_buyer": {
        "title": "Click IDs and UTMs lost between the ad click and the cart",
        "whyItMatters": "Lost click IDs and UTMs push paid sales into direct and stop the platforms tying the sale to the click, so reported ROAS reads lower than real and winning campaigns can get cut.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Campaign tags survive redirects",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Campaign tags survive redirects",
        "adEffect": "deflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Keep query strings through redirects and remove UTMs from internal links.",
    "doneWhen": "UTMs survive; none on internal links.",
    "origin": [
      "W-26",
      "SO-GA4-18",
      "MB-WC-04"
    ]
  },
  {
    "id": "TRK-24",
    "category": "tracking",
    "title": "No campaign tags on internal links",
    "rule": "No link on home, collection, product or cart pointing to the store's own domain carries utm_ parameters.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Internal links that overwrite the ad source",
        "whyItMatters": "Each internal UTM click takes the sale away from your campaign, so paid ROAS in GA4 reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev",
      "content"
    ],
    "defaultAction": "Forward to the developer or content team: remove UTMs from internal links and use GA4 events for banner clicks.",
    "doneWhen": "The crawl finds no internal link with UTMs.",
    "origin": [
      "MB-GA4-23"
    ]
  },
  {
    "id": "TRK-25",
    "category": "tracking",
    "title": "Visits with no known source",
    "rule": "Unassigned, (not set) and (other) sessions are at most 10% of sessions in 28 days, and paid-medium traffic sits in a paid channel group.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Visits and sales with no known source",
        "whyItMatters": "If you can't see where sales come from, you can't put more into what works."
      },
      "media_buyer": {
        "title": "Paid sessions with an unknown source",
        "whyItMatters": "Paid sales hidden in Unassigned are not credited to your campaigns, so paid ROAS in GA4 reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Visits with no known source",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "Visits with no known source",
        "adEffect": "deflated"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Add UTM tags to every link you share. That means ads, bio links, WhatsApp and SMS.",
    "doneWhen": "Unassigned visits under 5% in GA4.",
    "origin": [
      "GA4-08",
      "SO-GA4-17",
      "MB-GA4-09",
      "MB-GA4-11"
    ],
    "note": "Rule matches ga4-facts.ts GA4-08, GA4-P09; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-26",
    "category": "tracking",
    "title": "Test sites mixed into live numbers",
    "rule": "No hostname with 5+ sessions in GA4 is staging, preview, theme-editor, localhost or a dev domain; other hosts not on the store's own domains are listed for review.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Test and preview sites sending data into your real numbers",
        "whyItMatters": "Test orders and fake hosts add sales that never happened, so your revenue looks higher than it is."
      },
      "media_buyer": {
        "title": "Data comes only from the live store",
        "whyItMatters": "Test orders and unknown hostnames add purchases that never happened, so reported ROAS can read higher than real.",
        "adEffect": "inflated",
        "lane": "signal"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask your developer to stop test and preview sites from sending to this GA4 property, and to filter out unknown hostnames.",
    "doneWhen": "Only your store's domains appear in the hostname report.",
    "origin": [
      "SO-GA4-19",
      "MB-GA4-22"
    ],
    "note": "Review: 'Unknown' hostname is not proof of error (checkout host, translate proxy, payment host). Fail only on staging, preview, localhost or theme-editor patterns; other unknown hosts are advice."
  },
  {
    "id": "TRK-27",
    "category": "tracking",
    "title": "Only real sales count as key events",
    "rule": "purchase is a key event; none of page_view, scroll, session_start, first_visit, user_engagement, click, view_item or form_start is; and every key event recorded data in the last 90 days.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Only real sales count as conversions",
        "whyItMatters": "When page views count as conversions, your conversion rate looks good while sales stay flat."
      },
      "media_buyer": {
        "title": "Key events count only real sales",
        "whyItMatters": "This is a tracking problem, not a ROAS problem: when actions like video plays count as conversions, GA4's conversion count is wrong, and if Google Ads imports those conversions it optimises toward people who watch instead of people who buy. The Meta pixel is not affected.",
        "adEffect": "optimization",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Only real sales count as key events",
        "adEffect": "inflated"
      },
      "agency": {
        "title": "Only real sales count as key events",
        "adEffect": "inflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Mark purchase (and lead, if used) as key events and unmark the rest.",
    "doneWhen": "Key events list shows only real conversions.",
    "origin": [
      "GA4-20",
      "SO-GA4-20",
      "MB-GA4-05"
    ],
    "note": "Rule matches ga4-facts.ts GA4-20, GA4-P16; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-28",
    "category": "tracking",
    "title": "Ad pixels can match browser and server sales",
    "rule": "Where a Meta, Snap or TikTok purchase or add-to-cart tag exists, it sends event_id (Snap: client_dedup_id); advice-level unless a Conversions API setup is detected.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "gtm",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Meta does not count the same sale twice",
        "whyItMatters": "Without a matching id Meta can count one sale twice or miss it, so you cannot trust Meta's sales number."
      },
      "media_buyer": {
        "title": "Meta events carry an event_id for CAPI dedupe",
        "whyItMatters": "With Pixel plus CAPI and no shared event_id, Meta can count a sale twice, so reported ROAS reads higher than real.",
        "adEffect": "inflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Ad pixels can match browser and server sales",
        "adEffect": "inflated"
      },
      "agency": {
        "title": "Ad pixels can match browser and server sales",
        "adEffect": "inflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Send the Purchase event to the Meta pixel with an event_id, and set up the Conversions API with the same id.",
    "doneWhen": "Meta Events Manager shows deduplicated purchases.",
    "origin": [
      "GTM-03",
      "SO-GTM-10",
      "MB-GTM-05",
      "MB-GTM-13",
      "MB-GTM-15",
      "MB-GTM-08"
    ],
    "note": "Matters most when a Conversions API runs; we can't see the server side. Review: Missing event_id only matters when a Conversions API runs, which we cannot see. Report as advice unless server-side GTM or a CAPI gateway is seen; skip if no Meta/Snap/TikTok tag. Rule must say so."
  },
  {
    "id": "TRK-29",
    "category": "tracking",
    "title": "One ID per platform, all your own",
    "rule": "Each platform uses one ID across all container tags and live hits; any second ID is shown for review; no paused or triggerless tags remain.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "gtm",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Your data goes to your own GA4 only",
        "whyItMatters": "Sales sent to another property are missing from your reports, and someone else can see your sales."
      },
      "media_buyer": {
        "title": "Container sends data to IDs the store doesn't own",
        "whyItMatters": "Events sent to an old or foreign pixel never reach the account you bid in, so that account learns from fewer sales and reported ROAS reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Put the ID in one constant variable. Remove the others.",
    "doneWhen": "Only the store's ID appears in the container.",
    "origin": [
      "GTM-10",
      "SO-GTM-08",
      "SO-GTM-11",
      "MB-GTM-07"
    ],
    "note": "Can't prove ownership; a second ID is the signal. Review: Two IDs is not proof of an error (two GA4 properties, agency pixel). Code can flag it but not prove ownership. Drops origin MB-GTM-07's 'no paused or triggerless tags' part."
  },
  {
    "id": "TRK-30",
    "category": "tracking",
    "title": "WhatsApp and call taps counted",
    "rule": "If the visit finds wa.me, api.whatsapp.com or tel: links, a GTM tag fires on clicks to them, or GA4 has a whatsapp/call click event in 28 days.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "gtm",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "WhatsApp and call clicks are counted",
        "whyItMatters": "Shoppers who order through WhatsApp look like lost visitors, so you cannot see which pages and ads bring them."
      },
      "media_buyer": {
        "title": "WhatsApp clicks tracked as a signal",
        "whyItMatters": "WhatsApp orders that never fire an event make your campaigns look like they sell less than they do, so reported ROAS reads lower than real.",
        "adEffect": "deflated",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "WhatsApp and call taps counted",
        "adEffect": "deflated"
      },
      "agency": {
        "title": "WhatsApp and call taps counted",
        "adEffect": "deflated"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Track WhatsApp and call clicks as conversions; orders that start in WhatsApp are invisible today.",
    "doneWhen": "A whatsapp_click event appears in GA4.",
    "origin": [
      "GTM-11",
      "SO-GTM-07",
      "MB-GTM-17"
    ],
    "note": "Media buyers also want a pixel Contact event; advice only. Review: A custom click listener or app can track these clicks with no matching GTM trigger. Also accept GA4 events named whatsapp/call click. Failing on GTM alone is not certain."
  },
  {
    "id": "TRK-31",
    "category": "tracking",
    "title": "Pages without reload still counted",
    "rule": "If the store changes pages without a full reload, each in-app navigation in our visit sends a new GA4 page_view; otherwise not applicable.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit",
      "crawl"
    ],
    "roles": [
      "store_owner",
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Pages that change without reloading are still counted",
        "whyItMatters": "Pages and products that are not counted vanish from your funnel and product reports."
      },
      "media_buyer": {
        "title": "Page changes without a reload still send a page view",
        "whyItMatters": "Missed page views after the landing page thin out the funnel and retargeting audiences, so the platforms learn from fewer product views.",
        "adEffect": "deflated",
        "lane": "signal"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Have your developer add page-change triggers in GTM if your store loads pages without reloading.",
    "doneWhen": "Each page change in our visit sends one page view.",
    "origin": [
      "SO-GTM-19",
      "MB-GTM-22"
    ],
    "note": "Review: Collector loads each page by URL; it does not click through in-app navigation, so nothing is observed today. Needs a click-through step (code+). If the SPA guess is false, not applicable."
  },
  {
    "id": "TRK-32",
    "category": "tracking",
    "title": "Page view hits go out early",
    "rule": "On a throttled phone, the first GA4 hit and first ad pixel PageView are sent before the LCP time.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Tracking starts before phone shoppers leave a slow page",
        "whyItMatters": "Shoppers who leave a slow page before tracking fires disappear, so visits look lower and ads look like they bring fewer people."
      },
      "media_buyer": {
        "title": "Pixel fires too late in the page load",
        "whyItMatters": "Late pixels miss early leavers, so landing page views and visits are under-counted and the click-to-LPV gap looks worse than the page alone.",
        "adEffect": "deflated",
        "lane": "signal"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask your developer to load tracking early and send page views when the page starts, not after everything has loaded.",
    "doneWhen": "Our re-scan sees the first GA4 page_view before LCP on all three pages.",
    "origin": [
      "SO-WC-18",
      "MB-WC-13"
    ],
    "note": "Review: Two tests in one line ('within 3s' and 'before load event') can disagree; GTM-loaded pixels often fire after load. Pick one: before LCP (SO-WC-18)."
  },
  {
    "id": "TRK-33",
    "category": "tracking",
    "title": "Script errors do not break tracking",
    "rule": "No uncaught console error on product or cart is followed by a missing view_item or add_to_cart event.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Script errors stop tracking and the cart",
        "whyItMatters": "Errors cut both conversions and the events that report them, so CVR drops and reported ROAS reads low.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Send the console log to the developer to fix the erroring script.",
    "doneWhen": "No console errors on product and cart, and all expected events still fire.",
    "origin": [
      "MB-WC-12"
    ]
  },
  {
    "id": "TRK-34",
    "category": "tracking",
    "title": "Standard ecommerce event names",
    "rule": "Ecommerce events use standard names: view_item_list, view_item, add_to_cart for GA4; ViewContent, AddToCart for Meta.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "parked",
    "parkedReason": "Covered by TRK-18 event presence check",
    "roleCopy": {
      "media_buyer": {
        "title": "Non-standard event names",
        "whyItMatters": "Custom names are not used for standard optimisation or reports, so the algorithm gets a thinner funnel signal.",
        "adEffect": "optimization",
        "lane": "signal"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask the developer to rename events to the platforms' standard names.",
    "doneWhen": "All ecommerce events seen use standard names.",
    "origin": [
      "MB-WC-14"
    ]
  },
  {
    "id": "TRK-35",
    "category": "tracking",
    "title": "Visits from countries with no sales",
    "rule": "Countries other than the top one, each with 3%+ of sessions and zero purchases, add up to under 5% of sessions in 28 days.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Visits from countries you don't deliver to",
        "whyItMatters": "Visits from places you can't deliver to never become sales."
      },
      "media_buyer": {
        "title": "Countries that get visits but never buy",
        "whyItMatters": "Paid clicks from countries the store does not sell to cannot convert, so CAC is higher than it needs to be.",
        "adEffect": "cost",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Visits from countries with no sales",
        "adEffect": "cost"
      },
      "agency": {
        "title": "Visits from countries with no sales",
        "adEffect": "cost"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Exclude those countries from ad targeting.",
    "doneWhen": "Paid visits from those countries are close to zero.",
    "origin": [
      "GA4-09",
      "SO-GA4-24",
      "MB-GA4-21"
    ],
    "note": "Rule matches ga4-facts.ts GA4-09; the code wins (decided 22 Nov). Mostly ad geo-targeting leaks for media buyers."
  },
  {
    "id": "TRK-36",
    "category": "tracking",
    "title": "Bringing past visitors back",
    "rule": "With 200+ new and 50+ returning sessions, returning visitors convert at 2x new visitors or more; if not, the visit finds an email or phone signup field.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Bringing buyers back",
        "whyItMatters": "A past buyer is cheaper to sell to again than a new visitor."
      },
      "marketing_manager": {
        "title": "Bringing past visitors back",
        "adEffect": "optimization"
      },
      "agency": {
        "title": "Bringing past visitors back",
        "adEffect": "optimization"
      },
      "media_buyer": {
        "title": "Retargeting audiences ready",
        "whyItMatters": "Without these audiences you cannot retarget people who already viewed or carted from GA4 data, so retargeting reach and ROAS are lower than they could be.",
        "adEffect": "optimization",
        "lane": "signal"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "marketing",
      "dev"
    ],
    "defaultAction": "Add an email or WhatsApp signup with a first-order offer, and a message after each purchase.",
    "doneWhen": "Signup live on the site and returning-visitor share rising month on month.",
    "origin": [
      "GA4-12",
      "SO-GA4-13",
      "GA4-14",
      "MB-GA4-18"
    ],
    "note": "Rule matches ga4-facts.ts GA4-12; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-37",
    "category": "tracking",
    "title": "Site searches recorded with the term",
    "rule": "If the phone homepage has a search box, GA4 records search events in 28 days and the box is visible on phones, not hidden behind the menu. Fails if GA4 records searches but no search box was found.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4",
      "gtm",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "What shoppers search for on your store",
        "whyItMatters": "A shopper who searches knows what they want; a search with no result is a lost sale."
      },
      "marketing_manager": {
        "title": "Site searches recorded with the term",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Site searches recorded with the term",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev",
      "owner"
    ],
    "defaultAction": "Show search on phones. Make sure the top search terms return products.",
    "doneWhen": "Search shows in the phone header. The top 5 terms return products.",
    "origin": [
      "GA4-13",
      "GTM-13",
      "SO-GA4-21"
    ],
    "note": "Rule matches ga4-facts.ts GA4-13; the code wins (decided 22 Nov). Search box visible on phones is a navigation point, not this one."
  },
  {
    "id": "TRK-38",
    "category": "tracking",
    "title": "GA4 uses your currency and time zone",
    "rule": "GA4 property currency and time zone match the country with the most sessions (one of the markets the code knows).",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "GA4 uses your currency and time zone",
        "whyItMatters": "Money figures in the wrong currency or day make every sales number in the report harder to trust."
      },
      "media_buyer": {
        "title": "Property currency and timezone match the store",
        "whyItMatters": "A wrong currency or timezone makes GA4 revenue and daily numbers disagree with Ads Manager and the store admin, so GA4 ROAS checks are off.",
        "adEffect": "deflated",
        "lane": "signal"
      }
    },
    "opportunity": "benefit",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Set the property currency and timezone to the store's market.",
    "doneWhen": "Property settings show the store's currency and timezone.",
    "origin": [
      "GA4-22",
      "SO-GA4-16",
      "MB-GA4-25"
    ],
    "note": "Rule matches ga4-facts.ts GA4-22; the code wins (decided 22 Nov)."
  },
  {
    "id": "TRK-39",
    "category": "tracking",
    "title": "Session recordings installed",
    "rule": "A session-recording script (Microsoft Clarity, Hotjar, Mouseflow, Smartlook, Lucky Orange or FullStory) loads on the live home page.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Tool presence, not a store problem",
    "roleCopy": {
      "store_owner": {
        "title": "Session recordings installed to check your fixes",
        "whyItMatters": "Recordings let you see whether a fix helped shoppers, not just guess."
      }
    },
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Install Microsoft Clarity (free) so every fix in this report can be checked on real recordings.",
    "doneWhen": "Recordings visible in Clarity.",
    "origin": [
      "GTM-15",
      "SO-GTM-24"
    ],
    "note": "Review: Fails stores using another recorder (Mouseflow, Smartlook, Lucky Orange, FullStory). Name them or a fail is not certain."
  },
  {
    "id": "TRK-40",
    "category": "tracking",
    "title": "No hand-pasted pixels or unknown scripts",
    "rule": "Every Custom HTML tag loads scripts only from a known-vendor domain list, and no Meta, Snap, TikTok or gtag pixel sits in Custom HTML where an official template exists.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Container hygiene; rarely changes conversion",
    "roleCopy": {
      "store_owner": {
        "title": "No unknown scripts running on your store",
        "whyItMatters": "Unknown scripts can break your pages or collect your customers' data without you knowing."
      },
      "media_buyer": {
        "title": "Pixels pasted as Custom HTML and unknown scripts",
        "whyItMatters": "Hand-pasted pixel code breaks quietly, so events and values can stop reaching the platforms and the signal campaigns learn from drifts from real.",
        "adEffect": "optimization",
        "lane": "signal"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Remove unknown Custom HTML tags. Or replace them with gallery templates.",
    "doneWhen": "Each Custom HTML tag left live has a named owner. Each has a clear purpose.",
    "origin": [
      "GTM-19",
      "SO-GTM-18",
      "MB-GTM-20"
    ],
    "note": "Vendor list needs upkeep. Review: A 'known vendor' list will miss real vendors, so an unknown domain is not proof of a problem. Code proves the pass; unknown domains go to AI."
  },
  {
    "id": "TRK-41",
    "category": "tracking",
    "title": "Ecommerce data cleared between events",
    "rule": "Each new ecommerce dataLayer push is preceded by an ecommerce: null push.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit",
      "gtm"
    ],
    "roles": [
      "media_buyer",
      "store_owner"
    ],
    "status": "parked",
    "parkedReason": "Niche dataLayer detail, little shop-owner value",
    "roleCopy": {
      "media_buyer": {
        "title": "Old cart items attached to new events",
        "whyItMatters": "Carried-over items inflate item counts and values on later events, so product-level numbers read higher than real.",
        "adEffect": "inflated",
        "lane": "signal"
      },
      "store_owner": {
        "title": "Product data is ready and fresh when tags read it",
        "whyItMatters": "Mixed-up product data makes your product reports show the wrong items as viewed and added."
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask the developer to clear the ecommerce object before each push.",
    "doneWhen": "Each ecommerce push follows an ecommerce:null and carries only its own items.",
    "origin": [
      "MB-WC-23",
      "SO-WC-25"
    ]
  },
  {
    "id": "TRK-42",
    "category": "tracking",
    "title": "Home banners send view and select events",
    "rule": "If home has banners, GA4 has view_promotion and select_promotion events in 28 days, or GTM has tags for both.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner"
    ],
    "status": "parked",
    "parkedReason": "Promotion events rarely used by GCC stores",
    "roleCopy": {
      "store_owner": {
        "title": "Home banners record views and taps, so you can see which ones sell",
        "whyItMatters": "Your home banners get the most taps; knowing which one sells tells you what to put there."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev",
      "marketing"
    ],
    "defaultAction": "Ask your developer to send promotion events for your home banners.",
    "doneWhen": "Our re-scan sees view_promotion and select_promotion with banner names.",
    "origin": [
      "SO-WC-23"
    ],
    "note": "Review: Our visit never taps banners, so select_promotion cannot be seen and absence proves nothing. Use GA4 event names or GTM tags instead."
  },
  {
    "id": "TRK-43",
    "category": "tracking",
    "title": "Google Ads linked",
    "rule": "Google Ads is linked to this property.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "checkout"
    ],
    "needs": [
      "ga4",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Google Ads linked to GA4",
        "whyItMatters": "Without the link, Google bidding and audiences miss GA4 sales data, so Smart Bidding learns from less signal; fixing it is expected to improve ROAS over time.",
        "adEffect": "optimization",
        "lane": "signal"
      },
      "marketing_manager": {
        "title": "Google Ads linked",
        "adEffect": "optimization"
      },
      "agency": {
        "title": "Google Ads linked",
        "adEffect": "optimization"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "marketing"
    ],
    "defaultAction": "Link Google Ads to GA4. Import purchase. Bidding then learns from real sales.",
    "doneWhen": "Google Ads shows purchase as a primary conversion.",
    "origin": [
      "GA4-21",
      "MB-GA4-15"
    ],
    "note": "Split out of TRK-05 in review; rule copied from GA4-21, needs sharpening Review: New point from a split"
  },
  {
    "id": "TRK-44",
    "category": "tracking",
    "title": "The value sent matches the price shown on the page",
    "rule": "The value sent with view_item and add_to_cart equals the price shown on the product page (times quantity), and currency is the store's three-letter code in capitals (for example SAR).",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "The value sent matches the price shown on the page",
        "whyItMatters": "A wrong currency or price makes every sales figure in your reports wrong, even when orders are fine."
      },
      "media_buyer": {
        "title": "Value sent as text or in the wrong currency",
        "whyItMatters": "A wrong value or currency makes every reported sale worth the wrong amount, so reported ROAS can read high or low and value bidding learns from bad numbers.",
        "adEffect": "optimization",
        "lane": "signal"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask your developer to send the price as a plain number and the currency as the three-letter code your store charges in.",
    "doneWhen": "Our re-scan sees the same price and the correct currency code in the event as on the page.",
    "origin": [
      "SO-WC-09",
      "MB-WC-09"
    ],
    "note": "Split out of TRK-18 in review; rule copied from SO-WC-09, needs sharpening Review: New point from a split"
  },
  {
    "id": "PATH-01",
    "category": "buying-path",
    "title": "Add to cart really adds the item",
    "rule": "Our phone tap on Add to Cart opens a drawer or message with the item, or the cart count rises, within 2 seconds, and the cart page lists it.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Add to cart actually adds the product",
        "whyItMatters": "If the button does not add the product, every customer who decided to buy leaves without an order."
      },
      "media_buyer": {
        "title": "Our Add to Cart click really fills the cart",
        "whyItMatters": "Paid clicks that cannot add to cart cannot buy, so CVR drops and CAC rises on the same spend.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Add to cart really adds the item",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Add to cart really adds the item",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the Add-to-Cart button or the theme script behind it.",
    "doneWhen": "A click on Add to Cart adds the item and the cart count updates on a phone.",
    "origin": [
      "W-01",
      "SO-WC-01",
      "MB-WC-02",
      "PDP-027",
      "CT-001"
    ],
    "note": "Review: CT-002 (drawer header count, close, full width) is a different issue; move out. A failed tap may be our bot (collector falls back to a /cart/add.js fetch), so code proves the pass only."
  },
  {
    "id": "PATH-02",
    "category": "buying-path",
    "title": "Cart and checkout load without errors",
    "rule": "Cart page (and first checkout screen) loads on phone and desktop with no uncaught script errors.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "cart",
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "The cart opens without errors",
        "whyItMatters": "Customers who reach the cart already chose to buy; an error here loses them at the last step we can see."
      },
      "marketing_manager": {
        "title": "Cart and checkout load without errors",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Cart and checkout load without errors",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the errors on the cart and checkout pages.",
    "doneWhen": "Zero console errors when cart and checkout load.",
    "origin": [
      "W-02",
      "SO-WC-02"
    ]
  },
  {
    "id": "PATH-03",
    "category": "buying-path",
    "title": "Top products can actually be bought",
    "rule": "Hero and first-row products on home and collections are in stock; on the product page, Add to cart is active for the first in-stock variant.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "home",
      "collection",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Advertised products that can't be bought",
        "whyItMatters": "Clicks on products nobody can buy are paid traffic that can't convert, so CAC is higher than it needs to be right now.",
        "adEffect": "cost",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Top products can actually be bought",
        "adEffect": "cost"
      },
      "agency": {
        "title": "Top products can actually be bought",
        "adEffect": "cost"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "marketing",
      "owner"
    ],
    "defaultAction": "Pause or switch ads that send traffic to sold-out products; ask the owner to restock them or swap them out of featured spots.",
    "doneWhen": "No top-viewed product in GA4 has zero adds over 14 days, our visit finds Add to Cart enabled on the top product, and every featured product is in stock.",
    "origin": [
      "MB-CRO-03",
      "W-08"
    ],
    "note": "Review: Stock in hero and first row is code-certain. 'Every variant selectable' wrongly fails normal sold-out variants; limit to first in-stock variant. Hero sold-out is also in COL-02's SO-CRO-19; keep it here only."
  },
  {
    "id": "PATH-04",
    "category": "buying-path",
    "title": "Cart checkout button is clear on phone",
    "rule": "Phone cart has one checkout button with checkout wording (checkout, إتمام الطلب, الدفع), inside the first screen or sticky, not covered by popups, chat or upsells.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Checkout button in the cart is clear on the phone",
        "whyItMatters": "People who already added to cart need an obvious next step, or they leave the cart without buying."
      },
      "media_buyer": {
        "title": "Clear checkout button in the cart",
        "whyItMatters": "Shoppers who added from an ad but can't find the next step stall in the cart, so CVR likely reads lower than the traffic deserves.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "dev"
    ],
    "defaultAction": "Make the checkout button the main button in the cart and keep it visible on mobile (sticky if the cart is long).",
    "doneWhen": "A phone screenshot of the cart shows the checkout button without scrolling.",
    "origin": [
      "SO-CRO-10",
      "MB-CRO-09",
      "CT-006",
      "CT-021"
    ]
  },
  {
    "id": "PATH-05",
    "category": "buying-path",
    "title": "Guest checkout, no forced sign-in",
    "rule": "Checkout opens in one click from the cart and the first checkout screen allows guest or phone-number entry, with no login wall.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "cart",
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Cart doesn't force sign-in before checkout",
        "whyItMatters": "New shoppers from cold ads rarely have an account; a forced login likely cuts CVR on the traffic you pay most to win.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Ask the owner to turn on guest checkout or phone-number checkout in the store settings.",
    "doneWhen": "Our re-scan finds no login-only wall on the cart.",
    "origin": [
      "MB-CRO-10",
      "CO-001"
    ]
  },
  {
    "id": "PATH-06",
    "category": "buying-path",
    "title": "Script errors on product and cart pages",
    "rule": "With 100+ sessions on the page, product and cart script-error and error-click session shares are at or below the site-wide shares.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "clarity"
    ],
    "roles": [
      "store_owner"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Errors on the pages where people buy",
        "whyItMatters": "An error on the product or cart page can stop the order at the last step, where every lost shopper was close to paying."
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Send this to your developer: the product and cart pages throw more errors than the rest of the store. Ask them to open those pages on a phone, check the browser console, and fix the errors that fire when someone picks an option or taps Add to cart.",
    "doneWhen": "On the next 3-day snapshot, product and cart pages show script-error and error-click shares at or below the home page and the site average, and our visit logs no console errors there.",
    "origin": [
      "SO-CL-02"
    ],
    "note": "Review: 'Error clicks are 0' is too strict on small samples; use at or below site share like the origin. Needs Clarity connected; no_data otherwise."
  },
  {
    "id": "PATH-07",
    "category": "buying-path",
    "title": "No failed files on money pages",
    "rule": "No request returns 404, 500 or a network error on home, collection, product or cart, including third-party app scripts.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "collection",
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "No broken images or files on the pages that sell",
        "whyItMatters": "A missing product photo or a broken script makes the store look untrustworthy and can stop buttons working."
      },
      "media_buyer": {
        "title": "Failed or hanging requests on landing pages",
        "whyItMatters": "Broken or stalled pages lose paid visitors before they act, so CVR drops on the same clicks.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "No failed files on money pages",
        "adEffect": "performance"
      },
      "agency": {
        "title": "No failed files on money pages",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix or remove the broken files.",
    "doneWhen": "Zero failed requests on home, product and cart.",
    "origin": [
      "W-03",
      "SO-WC-10",
      "MB-WC-19"
    ],
    "note": "Third-party failures usually mean scripts left from removed apps. Hanging requests are covered by LCP. Review: W-16 and SO-WC-20 (leftover scripts from removed apps) are another issue and need judgement; move out as their own point (ai or code+ai). Keep 404/500 only; network errors may be our bot."
  },
  {
    "id": "PATH-08",
    "category": "buying-path",
    "title": "WhatsApp and call links work",
    "rule": "Every wa.me, api.whatsapp.com and tel: link uses a full international number with country code, or the store has none.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "WhatsApp and call links use a number that works",
        "whyItMatters": "Many GCC customers ask on WhatsApp before they order; a broken link sends those orders away."
      },
      "media_buyer": {
        "title": "WhatsApp or contact visible and working on the product page",
        "whyItMatters": "In COD and WhatsApp-heavy stores, cold paid shoppers with one question leave if they can't ask, and a broken link loses those who wanted to order by chat, so CVR drops.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "WhatsApp and call links work",
        "adEffect": "performance"
      },
      "agency": {
        "title": "WhatsApp and call links work",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Fix the WhatsApp/phone link to the full international number.",
    "doneWhen": "The link opens a chat with the right number.",
    "origin": [
      "W-07",
      "SO-WC-04",
      "MB-CRO-15"
    ]
  },
  {
    "id": "PATH-09",
    "category": "buying-path",
    "title": "Cart quantity and remove controls work",
    "rule": "In the cart, changing quantity updates the line and total with no error, and an item can be removed.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Cart quantity and remove controls work",
        "whyItMatters": "A cart that breaks when shoppers adjust it loses orders from clicks already paid for, so CVR likely reads lower.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Send the steps to the developer to fix the cart quantity update.",
    "doneWhen": "Our re-scan sees the total change with the quantity and the item removed cleanly.",
    "origin": [
      "MB-CRO-25",
      "CT-011"
    ],
    "note": "Review: Collector never clicks quantity or remove (one item, quantity 1). Needs a new bot interaction that can fail by our fault; make it code+ai or cut."
  },
  {
    "id": "PATH-10",
    "category": "buying-path",
    "title": "Express pay buttons offered",
    "rule": "Apple Pay, Google Pay, Shop Pay or PayPal buttons show in the cart or at the top of the first checkout screen, where the platform supports them.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "cart",
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CT-023",
      "CO-002"
    ],
    "note": "Review: Headless Chrome shows no Apple Pay and express buttons often load late in iframes; code proves presence only. Absence is not a certain fail (CT-023 'missing' 5 of 5 smells like this)."
  },
  {
    "id": "PATH-11",
    "category": "buying-path",
    "title": "Checkout field labels are clear",
    "rule": "Every field on the first checkout screen has a visible label in the page language saying what to type, and local address needs (city, area, landmark) are covered.",
    "severity": "medium",
    "decidedBy": "ai",
    "pages": [
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CO-003"
    ]
  },
  {
    "id": "PATH-12",
    "category": "buying-path",
    "title": "Checkout fields use right phone keyboards",
    "rule": "On the first checkout screen, phone fields use a numeric keyboard, email fields an email keyboard, autocomplete attributes are set, and fields are at least 44px tall.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CO-010"
    ]
  },
  {
    "id": "PATH-13",
    "category": "buying-path",
    "title": "Order summary visible on checkout",
    "rule": "The first checkout screen shows items, quantities, discounts, shipping and total, or one tap expands them on phone.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CO-012"
    ]
  },
  {
    "id": "PATH-14",
    "category": "buying-path",
    "title": "Cart lines show item details",
    "rule": "Each cart line shows image, name, chosen variant and price (with old price if on sale).",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CT-010"
    ]
  },
  {
    "id": "PATH-15",
    "category": "buying-path",
    "title": "Empty cart offers a way forward",
    "rule": "An empty cart says it is empty and links to a collection or best sellers, with a continue-shopping button.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CT-005",
      "CT-025"
    ],
    "note": "Needs a look at the cart before our add. Review: Collector opens the cart only after adding an item, so an empty cart is never seen. Needs a pre-add cart visit (code+) or cut. Neither origin was ever shown in reports."
  },
  {
    "id": "PATH-16",
    "category": "buying-path",
    "title": "Checkout has no distractions",
    "rule": "The first checkout screen has no main menu, no popups and at most a logo and a back link leading out.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CO-013"
    ]
  },
  {
    "id": "PATH-17",
    "category": "buying-path",
    "title": "Drawer header shows 'Your cart (N items)' and an obvious close (×); on mobile it covers the full width",
    "rule": "Count + close visible; full width.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CT-002"
    ],
    "note": "Split out of PATH-01 in review; rule copied from CT-002, needs sharpening Review: New point from a split"
  },
  {
    "id": "PATH-18",
    "category": "buying-path",
    "title": "Leftover scripts from removed apps",
    "rule": "No scripts from apps that no longer do anything.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home",
      "collection",
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "No leftover code from apps you removed",
        "whyItMatters": "Leftover code slows the store and can break other features, with nothing gained."
      },
      "marketing_manager": {
        "title": "Leftover scripts from removed apps",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Leftover scripts from removed apps",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Remove leftover app code from the theme.",
    "doneWhen": "No orphan app scripts load.",
    "origin": [
      "W-16",
      "SO-WC-20"
    ],
    "note": "Split out of PATH-07 in review; rule copied from W-16, needs sharpening Review: New point from a split"
  },
  {
    "id": "PDP-01",
    "category": "product-page",
    "title": "Add to cart reachable on first phone screen",
    "rule": "On a 390x844 phone, price and Add to cart show in the first screen, or a sticky bar with price and Add to cart appears once the button scrolls away.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Add to cart is in the first phone screen",
        "whyItMatters": "When the buy button is out of sight on a phone, fewer product visitors add to cart."
      },
      "media_buyer": {
        "title": "Add to Cart reachable on the phone first screen",
        "whyItMatters": "If mobile paid visitors can't see the button, fewer add to cart, so CVR likely reads lower.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner",
      "dev"
    ],
    "defaultAction": "Move the price and Add to cart up under the first product photo, or turn on the theme's sticky Add to cart bar for mobile.",
    "doneWhen": "A 375px screenshot of the product page shows the price and Add to cart (or a sticky bar) without scrolling.",
    "origin": [
      "MB-002",
      "MB-003",
      "PDP-010",
      "P3",
      "PDP-035",
      "SO-CRO-06",
      "MB-CRO-21"
    ],
    "note": "SW-023 also limits shared button colour; that part not kept. Review: Drop SW-023 (button colour) and MB-006 (one-handed reach); they are different issues. Remove 'covering no content', not testable."
  },
  {
    "id": "PDP-02",
    "category": "product-page",
    "title": "Dead and rage taps on top product",
    "rule": "On the most-visited product page, dead-click and rage-click session shares are each at or below the site-wide share.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "clarity"
    ],
    "roles": [
      "store_owner"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Shoppers tap things that don't work on your top product page",
        "whyItMatters": "When a shopper taps and nothing happens on the page that sells, some give up before Add to cart, and that is lost sales on your busiest product."
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "dev"
    ],
    "defaultAction": "Open your top product page on your phone and tap everything that looks tappable: images, colour and size options, the price, delivery and payment badges. Make each one do something (zoom, select, open details) or make it look like plain text.",
    "doneWhen": "On the next 3-day snapshot, the top product page's dead-click and rage-click shares are at or below the site average.",
    "origin": [
      "SO-CL-01"
    ],
    "note": "Needs a session minimum, e.g. 100."
  },
  {
    "id": "PDP-03",
    "category": "product-page",
    "title": "Product has enough distinct, sharp photos",
    "rule": "Gallery has 4 or more distinct image URLs, at least one showing the product in use or a close detail, each with natural width at least 1.5x displayed width.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Product page has several clear photos",
        "whyItMatters": "Shoppers can't touch the product; more photos answer their doubts and lead to more add to carts."
      },
      "media_buyer": {
        "title": "Enough product photos on the top product",
        "whyItMatters": "The ad's image sets the expectation; a thin gallery on the landing product likely holds add-to-cart rate and CVR down.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "content",
      "owner"
    ],
    "defaultAction": "Upload extra photos for each product: different angles, the product in use and a size reference.",
    "doneWhen": "The opened product shows more than one distinct sharp photo on a phone.",
    "origin": [
      "SO-CRO-16",
      "MB-CRO-19",
      "P1",
      "PDP-006"
    ],
    "note": "Inputs said 3, 4 and 5 photos; 4 chosen, tune."
  },
  {
    "id": "PDP-04",
    "category": "product-page",
    "title": "Options are tiles or swatches with clear state",
    "rule": "Every option (size, colour, scent) is a visible button or swatch, not a dropdown; the selected one is highlighted and sold-out ones are marked, not hidden.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Colour options shown as swatches on the product page",
        "whyItMatters": "Seeing the colours makes choosing easier, so more shoppers reach Add to cart."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on colour swatches in your theme or variant settings and add a photo for each colour.",
    "doneWhen": "Colour options show as swatches on the product page, on our re-scan.",
    "origin": [
      "P2",
      "PDP-021",
      "PDP-022",
      "SO-WC-21"
    ],
    "note": "Review: Dropdown vs tiles is code, but selected highlight and sold-out marking are not collected; past runs show unassessed. Use code+ai."
  },
  {
    "id": "PDP-05",
    "category": "product-page",
    "title": "Floating widgets do not cover buying controls",
    "rule": "On phone product page and cart, no chat, WhatsApp, discount tab or banner overlaps the options, price, Add to cart or checkout button.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "WhatsApp button is easy to see on phones and doesn't cover the buy button",
        "whyItMatters": "GCC shoppers ask questions on WhatsApp before buying; a hidden button turns those questions into lost orders."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on the floating WhatsApp button for mobile and place it so it does not cover the Add to cart or checkout buttons.",
    "doneWhen": "On a phone, a WhatsApp button shows on the product page and cart and leaves the buy buttons clear.",
    "origin": [
      "PDP-034",
      "SO-CRO-05",
      "SW-020"
    ],
    "note": "Review: MB-CRO-15 (wa.me number format, contact link present) is a different issue; move out. Overlap needs element boxes, so code+, not code."
  },
  {
    "id": "PDP-06",
    "category": "product-page",
    "title": "Benefit line under the product name",
    "rule": "In the first phone screen, a line of 120 characters or fewer under the product name states a benefit or result, not just a feature.",
    "severity": "medium",
    "decidedBy": "ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "doneWhen": "Every product shows a benefit line or 2-4 benefit points next to its name and price.",
    "origin": [
      "P5",
      "PDP-015"
    ]
  },
  {
    "id": "PDP-07",
    "category": "product-page",
    "title": "Description covers size, material and key benefits",
    "rule": "Product description, in the page language, covers material or specs, size or fit, usage and what is included.",
    "severity": "medium",
    "decidedBy": "ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "media_buyer",
      "store_owner"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Product description answers buyer questions, in Arabic",
        "whyItMatters": "Missing details make shoppers leave to ask or to buy elsewhere."
      },
      "media_buyer": {
        "title": "Product page answers the buying questions",
        "whyItMatters": "Paid visitors who can't find the facts don't add to cart, so CVR on product ads likely stays low.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "defaultAction": "Ask the content owner to add size, material and key benefits to the top advertised product first.",
    "doneWhen": "The top product page shows a full description with specs in our re-scan.",
    "origin": [
      "MB-CRO-18",
      "SO-CRO-17"
    ]
  },
  {
    "id": "PDP-08",
    "category": "product-page",
    "title": "Quantity selector and clear Add to cart button",
    "rule": "Quantity selector sits next to a full-width Add to cart button with text-to-background contrast of at least 3:1.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-026"
    ],
    "note": "Review: 'Most visible button' and 'clear label' are subjective. Keep: quantity selector present beside a full-width Add to cart with contrast ratio 3:1 or more."
  },
  {
    "id": "PDP-09",
    "category": "product-page",
    "title": "Buy button looks the same everywhere",
    "rule": "Primary buy button has the same background colour and font on product page, cart and collection quick add.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Cosmetic consistency, low impact",
    "roleCopy": {},
    "origin": [
      "SW-022",
      "PDP-048"
    ],
    "note": "Review: Collection quick-add and cart button colours are not collected today (only primary CTA text/box). Needs a style measurement: code+. Never shown in past reports."
  },
  {
    "id": "PDP-10",
    "category": "product-page",
    "title": "Product video available",
    "rule": "The product page gallery or the area near the top has a product video (demo or customer).",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Video nice to have, not a fail",
    "roleCopy": {},
    "origin": [
      "PDP-011"
    ]
  },
  {
    "id": "PDP-11",
    "category": "product-page",
    "title": "Photos zoom on click or pinch",
    "rule": "The product gallery supports zoom by click, tap or pinch.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-009"
    ],
    "note": "Review: Zoom presence is code; 'stays sharp' needs image judgement. Split into zoom exists (code) and sharp (ai), or drop sharp. Lost: first image load time."
  },
  {
    "id": "PDP-12",
    "category": "product-page",
    "title": "Picking a variant changes the photo",
    "rule": "Selecting a different colour or option switches the main gallery image to that variant's image.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-012"
    ],
    "note": "Review: Needs clicking a variant and watching the gallery; we only click Add to cart. Code+ at best; never shown in past reports."
  },
  {
    "id": "PDP-13",
    "category": "product-page",
    "title": "Size or fit guide next to options",
    "rule": "Where sizes or fit matter, a size guide link or pop-up sits next to the option selector. Not applicable if no size options.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "content",
      "dev"
    ],
    "doneWhen": "A size guide link sits next to the size options.",
    "origin": [
      "PDP-023",
      "B4"
    ]
  },
  {
    "id": "PDP-14",
    "category": "product-page",
    "title": "Details split into labelled sections or tabs",
    "rule": "Description, details and shipping sit in labelled tabs or accordions, not one long text block, covering the main buying questions.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content",
      "dev"
    ],
    "doneWhen": "Product details are split into short sections or tabs with headings.",
    "origin": [
      "P4",
      "PDP-033",
      "MB-007"
    ]
  },
  {
    "id": "PDP-15",
    "category": "product-page",
    "title": "What is included is stated",
    "rule": "For bundles and sets, a list or line names every item in the package. Not applicable for single items.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "doneWhen": "Every product page says exactly what's in the package.",
    "origin": [
      "P12",
      "PDP-043",
      "LP-007"
    ]
  },
  {
    "id": "PDP-16",
    "category": "product-page",
    "title": "How to use is shown",
    "rule": "Where use is not obvious, the page has simple usage steps or a short video.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Niche; only some product types",
    "roleCopy": {},
    "origin": [
      "PDP-041"
    ]
  },
  {
    "id": "PDP-17",
    "category": "product-page",
    "title": "Product page has an FAQ",
    "rule": "The product page has an FAQ with 5 or more questions with short, specific answers, covering shipping, returns and use.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "5-question PDP FAQ is arbitrary",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content",
      "dev"
    ],
    "doneWhen": "The product page has an FAQ of 4-6 questions buyers ask before ordering.",
    "origin": [
      "P10",
      "PDP-051"
    ]
  },
  {
    "id": "PDP-18",
    "category": "product-page",
    "title": "Repeat buy button further down the page",
    "rule": "On long pages, a buy button repeats after the details or reviews and near the page end; a sticky bar alone does not count.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Sticky buy bar already covers this",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "dev",
      "content"
    ],
    "doneWhen": "The end of the product page has a closing line and a buy button.",
    "origin": [
      "P11",
      "PDP-054"
    ]
  },
  {
    "id": "PDP-19",
    "category": "product-page",
    "title": "The primary call-to-action colour is used only for buying actions and stands out from everything else",
    "rule": "Add-to-cart / checkout is the most visually dominant element above the fold.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-023"
    ],
    "note": "Removed from PDP-01 in review (different issue). Keep, merge elsewhere or drop. Kept as its own point after review Review: Needs a home"
  },
  {
    "id": "PDP-20",
    "category": "product-page",
    "title": "Key actions (add to cart, checkout) sit in the lower, easy-to-reach part of the screen",
    "rule": "Main CTAs reachable one-handed.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Thumb-zone layout is hard to measure and low impact",
    "roleCopy": {},
    "origin": [
      "MB-006"
    ],
    "note": "Removed from PDP-01 in review (different issue). Keep, merge elsewhere or drop Review: Needs a home"
  },
  {
    "id": "COL-01",
    "category": "collection",
    "title": "Search finds the right product",
    "rule": "A search field or icon is visible in the header on phone and desktop, and searching a real product's exact name returns it in the top 3 results.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Search easy to find and returning results",
        "whyItMatters": "Paid visitors who land on a product that isn't quite right and can't search for another leave, so CVR likely reads lower.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask the developer to show search in the phone header and fix search results if a real product returns nothing.",
    "doneWhen": "Our re-scan finds search in the header and the search test returns products.",
    "origin": [
      "N2",
      "MB-CRO-23",
      "SW-028"
    ],
    "note": "Misspelling and Arabic/English variants need extra test queries. Review: Rule dropped what N2 and MB-CRO-23 checked (19 past passes): search icon or field visible in the header on phone and desktop. Add it back."
  },
  {
    "id": "COL-02",
    "category": "collection",
    "title": "Sold-out items are marked and placed last",
    "rule": "Sold-out products on collection pages carry a clear label and sit after in-stock ones, or are hidden.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "collection",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Sold-out products don't block the shopper",
        "whyItMatters": "Shoppers who land on sold-out items, often from ads, leave instead of buying something else."
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Swap sold-out products out of your home banner and first rows, move them to the end of collections, and add 'similar products' or 'notify me' on sold-out pages.",
    "doneWhen": "No sold-out product in the home banner or first row of home and collections, and sold-out pages show alternatives.",
    "origin": [
      "SO-CRO-19",
      "CL-019"
    ],
    "note": "Review: Hero sold-out part of SO-CRO-19 belongs to PATH-03. Sold-out product page 'notify me' needs a sold-out product visit we do not make. Allow hidden as a pass (CL-019)."
  },
  {
    "id": "COL-03",
    "category": "collection",
    "title": "Filter, sort or category chips are visible",
    "rule": "On a phone, filter and sort controls or category chips are visible above the product grid; sort defaults to best selling or featured.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Filter and sort are available on phone collection pages",
        "whyItMatters": "On large collections, shoppers who can't narrow down give up before finding a product."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on mobile filters and sort for collections in the theme, including a price filter.",
    "doneWhen": "A phone screenshot of the collection shows filter and sort controls.",
    "origin": [
      "SO-CRO-24",
      "D4",
      "CL-006",
      "CL-009"
    ],
    "note": "Review: Collector has no desktop collection copy, so 'phone and desktop' cannot be checked on desktop. Make phone-only."
  },
  {
    "id": "COL-04",
    "category": "collection",
    "title": "Products show on the first screen",
    "rule": "On a phone, the top of the first product row is visible in the first screen, not pushed down by banner or filters.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CL-002",
      "CL-010",
      "CL-005"
    ],
    "note": "Review: No desktop copy of the collection page, so the desktop part (CL-005) cannot be checked. Make phone-only or add a desktop collection visit."
  },
  {
    "id": "COL-05",
    "category": "collection",
    "title": "Product cards show image, name, price and rating",
    "rule": "Every product card shows image, name and price with currency ('From X' for variants); rating handled by TRUST-01@cro-a.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Prices shown on collection pages",
        "whyItMatters": "Collection-page campaigns lose shoppers who can't compare prices, so CVR on those clicks likely reads lower.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask the developer to show the price on every product card.",
    "doneWhen": "Every card on the collection shows a price in our re-scan.",
    "origin": [
      "CL-011",
      "MB-CRO-22"
    ]
  },
  {
    "id": "COL-06",
    "category": "collection",
    "title": "Filters show counts, clear in one tap, never empty",
    "rule": "Collection filters show option counts and offer a one-tap clear; filter types fit the catalogue (size, price, type).",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CL-007",
      "CL-008"
    ],
    "note": "Review: 'No option returns an empty list' needs clicking every filter (not collected); 'apply quickly' and 'match how shoppers choose' are judgement. Keep counts and one-tap clear; decide by ai."
  },
  {
    "id": "COL-07",
    "category": "collection",
    "title": "Cards have quick add to cart",
    "rule": "Product cards on home and collections show an Add to cart button, or a quick-pick button for variant products.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "collection",
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CL-015",
      "HP-022"
    ],
    "note": "Review: Collector does not tap quick-add on cards, so 'tapping updates the cart count' is not observable. Check presence of button or picker only."
  },
  {
    "id": "COL-08",
    "category": "collection",
    "title": "Card titles name the product in words",
    "rule": "Of 10 card titles, none is a bare SKU code and at least 8 name the product type in words.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Bare SKU titles are rare",
    "roleCopy": {},
    "origin": [
      "CL-012"
    ]
  },
  {
    "id": "COL-09",
    "category": "collection",
    "title": "Cards use badges like best seller or new",
    "rule": "Some cards carry badges such as Best seller, Selling fast or New.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Badges weak; honest-use part was unobservable",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "owner",
      "dev"
    ],
    "doneWhen": "Collection cards show honest badges such as Best seller or New.",
    "origin": [
      "G2",
      "CL-017",
      "HP-023"
    ],
    "note": "Likely duplicates CL-017 in another batch. Review: Badge wording in Arabic and English is open-ended; a regex proves a pass but a miss is not a certain fail. Use code+ai."
  },
  {
    "id": "COL-10",
    "category": "collection",
    "title": "Collection grid is 2 columns on phone",
    "rule": "The phone collection grid shows 2 columns.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CL-021"
    ],
    "note": "Review: No desktop collection copy, so desktop 3-4 columns cannot be checked; 'readable text and tappable buttons' is vague. Phone 2 columns only, or add a desktop visit (code+)."
  },
  {
    "id": "COL-11",
    "category": "collection",
    "title": "Page title or breadcrumb shows location",
    "rule": "The collection page has a clear H1 title or a breadcrumb showing its place in the store.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Breadcrumb or H1, minor",
    "roleCopy": {},
    "origin": [
      "CL-004"
    ]
  },
  {
    "id": "HOME-01",
    "category": "homepage",
    "title": "First screen says what you sell",
    "rule": "On a 390x844 phone, the first screen has an H1, a product image or hero, one primary CTA, and the H1 or image makes clear what is sold.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "doneWhen": "The homepage first screen says what you sell and for whom in one line.",
    "origin": [
      "H1",
      "MB-001",
      "CP-001",
      "HP-009",
      "HP-002",
      "HP-005"
    ]
  },
  {
    "id": "HOME-02",
    "category": "homepage",
    "title": "Headline states a benefit",
    "rule": "Home H1 names an outcome or reason to buy, not only the brand name, a sale or a new-product announcement.",
    "severity": "medium",
    "decidedBy": "ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "HP-004",
      "CP-008"
    ]
  },
  {
    "id": "HOME-03",
    "category": "homepage",
    "title": "Hero claims carry proof",
    "rule": "At least 2 claims in the hero and benefit blocks include a number, named study or named certification in the same block; no medical cure claims.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Niche (supplements/health); hard to judge",
    "roleCopy": {},
    "origin": [
      "HP-020",
      "CP-014"
    ],
    "note": "Review: CP-009 (why this brand is different: unique mechanism, origin) is a separate point about differentiation, not claim proof. Make it its own ai point."
  },
  {
    "id": "HOME-04",
    "category": "homepage",
    "title": "One clear primary hero button",
    "rule": "First screen has one solid, high-contrast, large primary button; other buttons are visibly secondary.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content",
      "dev"
    ],
    "doneWhen": "The homepage first screen has one main button to shop.",
    "origin": [
      "H2",
      "HP-007"
    ]
  },
  {
    "id": "HOME-05",
    "category": "homepage",
    "title": "Best sellers shown high on home",
    "rule": "A product grid appears within the first 2 phone screens, each card showing image, name and price (rating if the store has reviews).",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "HP-021"
    ],
    "note": "Review: Collection card counts exist, but home grid detection and its position are not collected. Use code+. Card needs rating only if store has reviews, as written."
  },
  {
    "id": "HOME-06",
    "category": "homepage",
    "title": "Button labels say what happens",
    "rule": "The primary CTA label is not a generic phrase such as Shop now, Shop all or the Arabic equivalents; it names a product, category or outcome.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Label wording nitpick, weak evidence",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "doneWhen": "The homepage's main button names where it goes, e.g. 'Shop bestsellers'.",
    "origin": [
      "H6",
      "HP-008",
      "CP-017"
    ],
    "note": "Review: 'Names the action or outcome' is judgement. Code can only fail a stoplist (Shop now, Shop all, and the Arabic equivalents). Consistency across pages is untestable; drop it."
  },
  {
    "id": "HOME-07",
    "category": "homepage",
    "title": "Benefits listed near the top",
    "rule": "Home has a section under a benefit heading with 3 or more items, each with an icon or image and short text, within the first 2 phone screens.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "doneWhen": "Two to four short benefit points sit under the homepage headline.",
    "origin": [
      "H5",
      "HP-006",
      "HP-034"
    ]
  },
  {
    "id": "HOME-08",
    "category": "homepage",
    "title": "Hero text readable over image",
    "rule": "Text over a hero image has clear contrast (overlay or dark/light background) and no key promo text is baked into the image.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "HP-010"
    ],
    "note": "Review: Contrast over an image and text baked into an image need pixel or vision analysis; not collected. Use ai (or code+ with contrast sampling). Never shown in past reports."
  },
  {
    "id": "HOME-09",
    "category": "homepage",
    "title": "Announcement bar with a concrete reason",
    "rule": "A bar above the header on all pages states a concrete current reason: free-shipping threshold, active sale, delivery promise or guarantee.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home",
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "marketing",
      "dev"
    ],
    "doneWhen": "A top bar on every page states one specific offer: free shipping over an amount, COD or delivery time.",
    "origin": [
      "H3",
      "SW-001",
      "SW-002",
      "PDP-002"
    ]
  },
  {
    "id": "HOME-10",
    "category": "homepage",
    "title": "USP strip under the header",
    "rule": "A strip under the header lists 3 or more store promises such as shipping, returns, quality or support; a one-line ticker on phone counts.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Overlaps announcement bar point HOME-08",
    "roleCopy": {},
    "origin": [
      "HP-017",
      "LP-065"
    ]
  },
  {
    "id": "HOME-11",
    "category": "homepage",
    "title": "No long phone stretch without a button",
    "rule": "On phone home, no stretch longer than 1,200px lacks a CTA button.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Arbitrary 1200px rule, weak evidence",
    "roleCopy": {},
    "origin": [
      "HP-029"
    ],
    "note": "Review: Only the primary CTA is collected, not all buttons with positions down the page. Needs a new measurement: code+."
  },
  {
    "id": "HOME-12",
    "category": "homepage",
    "title": "FAQ before the footer",
    "rule": "Home has an FAQ accordion of 5 or more questions before the footer, covering ordering, shipping, returns and payment.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Home FAQ is low value for stores",
    "roleCopy": {},
    "origin": [
      "HP-040",
      "CP-005"
    ]
  },
  {
    "id": "HOME-13",
    "category": "homepage",
    "title": "The value proposition says why THIS brand is different (unique mechanism, origin, quality proof, guarantee)",
    "rule": "No — it is specific to this brand.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CP-009"
    ],
    "note": "Split out of HOME-03 in review; rule copied from CP-009, needs sharpening Review: New point from a split"
  },
  {
    "id": "NAV-01",
    "category": "navigation",
    "title": "No dead menu or footer links",
    "rule": "Every menu and footer link returns a working page, and the 404 page offers search or product links.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Menu reaches every category and no menu or footer link is dead",
        "whyItMatters": "Products shoppers cannot find through the menu are products they do not buy."
      },
      "marketing_manager": {
        "title": "No dead menu or footer links",
        "adEffect": "cost"
      },
      "agency": {
        "title": "No dead menu or footer links",
        "adEffect": "cost"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix dead links and add search and best-sellers to the 404 page.",
    "doneWhen": "No dead menu/footer links; the 404 page has search.",
    "origin": [
      "W-05",
      "SO-WC-16"
    ],
    "note": "Reachability of collections may be split out if too heavy to check. Review: Three checks in one: link status needs fetching (code+), 404 page content, collection reachability. Split or drop reachability. Only visited pages are known."
  },
  {
    "id": "NAV-02",
    "category": "navigation",
    "title": "Short main menu",
    "rule": "Top-level menu has 6 links or fewer, and weak links such as Blog are not placed ahead of buying links.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "dev",
      "content"
    ],
    "doneWhen": "The main menu has 7 or fewer specific items.",
    "origin": [
      "N1",
      "SW-006",
      "HP-001",
      "PDP-001"
    ],
    "note": "Sources said 5 and 5-6; 6 chosen."
  },
  {
    "id": "NAV-03",
    "category": "navigation",
    "title": "Menu opens fast and links work",
    "rule": "The phone menu opens on first tap and lists main categories first.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-008",
      "MB-004"
    ],
    "note": "Review: 'Every link works' duplicates NAV-01; remove. Hover and open behaviour not collected, 'categories first' and 'closes easily' need judgement. Use code+ai."
  },
  {
    "id": "NAV-04",
    "category": "navigation",
    "title": "Search easy to find in header",
    "rule": "A search icon or bar is visible in the header on phone and desktop without opening the menu.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Search is easy to find on the phone",
        "whyItMatters": "Shoppers who know what they want buy faster when they can search for it."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on the search icon in the mobile header in your theme settings.",
    "doneWhen": "Search shows in the phone header on home and collection pages.",
    "origin": [
      "SO-CRO-23",
      "SW-009"
    ]
  },
  {
    "id": "NAV-05",
    "category": "navigation",
    "title": "Cart icon with item count",
    "rule": "Header shows a cart icon at all times, with an item count after adding a product, and it opens the cart drawer or page.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide",
      "home",
      "collection",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Cart icon is always visible in the phone header",
        "whyItMatters": "Shoppers who can't find their cart again leave with items still in it."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on the cart icon in the mobile header in your theme settings.",
    "doneWhen": "The cart icon shows in the phone header on home, collection and product pages.",
    "origin": [
      "SW-010",
      "SO-CRO-22"
    ]
  },
  {
    "id": "NAV-06",
    "category": "navigation",
    "title": "Language switch easy to find",
    "rule": "On phone, a language switch is visible in the header or first menu level.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-013"
    ],
    "note": "Currency rule is a second check; split if tuning. Review: Language switch and one-currency pricing are two issues. Make currency consistency its own point (from SO-CRO-20 and SW-013 currency part); 'switch works' needs a click, so code+."
  },
  {
    "id": "NAV-07",
    "category": "navigation",
    "title": "Footer has contact and policy links",
    "rule": "Footer contains contact details (phone, WhatsApp or email) and links to shipping, returns, privacy and terms.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-014"
    ],
    "note": "Review: Collected policy links cover shipping/returns/contact only, not privacy or terms; contact details need regex incl. Arabic wording. Use code+. 'Links load a real page' was lost."
  },
  {
    "id": "NAV-08",
    "category": "navigation",
    "title": "Arabic layout mirrors correctly",
    "rule": "Arabic pages have html lang=ar and dir=rtl, containers compute rtl, text is right-aligned, arrows face the right way, and nothing overflows 390px.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Arabic pages read right to left on the phone, cart included",
        "whyItMatters": "A broken Arabic cart makes the store look unsafe at the moment the customer decides to pay."
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask your developer or theme support to fix the right-to-left layout on the product page and cart for Arabic.",
    "doneWhen": "Arabic product page and cart screenshots on a phone show a correct right-to-left layout with nothing overlapping.",
    "origin": [
      "SO-CRO-08",
      "SW-027"
    ]
  },
  {
    "id": "NAV-09",
    "category": "navigation",
    "title": "Arabic version reads naturally",
    "rule": "Arabic pages are fully translated: product titles, menus and buttons are in Arabic, with natural wording and no spelling errors or leftover English.",
    "severity": "medium",
    "decidedBy": "ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Product titles are in Arabic",
        "whyItMatters": "Arabic-speaking shoppers find and trust products faster when the name is in their language."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "content",
      "owner"
    ],
    "defaultAction": "Add an Arabic title to each product in the product editor, starting with your best-selling products; keep the brand name as is.",
    "doneWhen": "All product titles on the Arabic collection page and the opened product page contain an Arabic name.",
    "origin": [
      "L1",
      "SO-CRO-07",
      "CP-015"
    ]
  },
  {
    "id": "NAV-10",
    "category": "navigation",
    "title": "No popup in the way on arrival",
    "rule": "No popup, discount teaser or chat bubble covers the headline, main button or buy button in the first seconds; any popup closes with one tap or Escape.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "marketing",
      "dev"
    ],
    "doneWhen": "No popup covers the page in the first 10 seconds of a visit.",
    "origin": [
      "U1",
      "SW-019",
      "HP-014"
    ]
  },
  {
    "id": "NAV-11",
    "category": "navigation",
    "title": "Header and footer same on all key pages",
    "rule": "Announcement bar, header and footer (including USP strip) are the same on home, collection and product pages.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "home",
      "collection",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Themes keep header and footer shared",
    "roleCopy": {},
    "origin": [
      "CL-026",
      "PDP-059"
    ],
    "note": "Review: Comparing header, bar and footer across pages needs a new DOM signature compare: code+. 'Identical' is brittle; compare structure, not text. Low value."
  },
  {
    "id": "NAV-12",
    "category": "navigation",
    "title": "Language switch and prices in the right currency",
    "rule": "A language switch (Arabic/English) is easy to find on the phone, and prices show in the store currency (for example SAR) the same way on product, cart and collection; if a currency switch exists it works.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Language switch and prices in the right currency",
        "whyItMatters": "Shoppers who can't read the page in their language or see a strange currency don't buy."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Show the language switch in the mobile header and set prices to show in your store currency on every page.",
    "doneWhen": "Language switch visible on the phone header, and the same currency on collection, product and cart.",
    "origin": [
      "SO-CRO-20"
    ],
    "note": "Split out of NAV-06 in review; rule copied from SO-CRO-20, needs sharpening Review: New point from a split"
  },
  {
    "id": "TRUST-01",
    "category": "trust",
    "title": "Return policy is easy to find",
    "rule": "A returns page loads from the footer of home, product and cart, states the time window and who pays, and the product page or cart mentions returns.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide",
      "product",
      "cart"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Return and exchange policy is easy to find",
        "whyItMatters": "Clear return terms reduce the fear of buying from a store the shopper doesn't know yet."
      },
      "media_buyer": {
        "title": "Return policy reachable from the product page",
        "whyItMatters": "First-time shoppers from ads weigh the risk of buying; clear returns likely lift CVR.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner",
      "content"
    ],
    "defaultAction": "Publish a short Arabic return and exchange policy, link it in the footer, and add one line near Add to cart (for example 'Exchange within X days').",
    "doneWhen": "Footer links to return, privacy and terms pages work, and the product page mentions returns near the buy button.",
    "origin": [
      "SO-CRO-14",
      "MB-CRO-20",
      "SW-032"
    ],
    "note": "Arabic policy page check dropped; covered by language checks. Review: Window and who-pays on the returns page need page text and judgement, in Arabic too; only the link is collected. Use code+ai."
  },
  {
    "id": "TRUST-02",
    "category": "trust",
    "title": "Ratings show on cards and product page",
    "rule": "If the store has reviews, a star rating with review count shows near the product title, linking to reviews, and on at least half of collection cards.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "collection",
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Reviews and ratings show on product and collection pages",
        "whyItMatters": "Reviews from other buyers are what convinces a hesitant first-time shopper to add to cart."
      },
      "media_buyer": {
        "title": "Reviews visible where paid shoppers decide",
        "whyItMatters": "Cold paid shoppers who see no sign that others bought tend to hesitate, so CVR on product ads likely stays lower than it could.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on product reviews, show the rating under the product title, and ask recent buyers for a review (WhatsApp works well).",
    "doneWhen": "The product page shows a rating with a count under the title, and collection cards show stars.",
    "origin": [
      "TR-001",
      "SO-CRO-15",
      "MB-CRO-16",
      "PDP-013",
      "PDP-014",
      "C6",
      "CP-021"
    ],
    "note": "Review: Lost: rating phrased as a quantified claim (PDP-014) and above the title. 'Links to reviews' needs anchor check: code+. Image-only star widgets may false-fail."
  },
  {
    "id": "TRUST-03",
    "category": "trust",
    "title": "Reviews look real",
    "rule": "Reviews come from a review app, are dated, include some customer photos, and not every review is 5 stars.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "doneWhen": "Reviews show names, dates and some photos, with a mix of ratings.",
    "origin": [
      "C3",
      "TR-002",
      "HP-038"
    ],
    "note": "Review: Thresholds (3 photos in 15, 20% under 5 stars, brand reply) are invented and too strict; origins only asked for verified marks or photos. Loosen: reviews dated, some photos, not all 5 stars."
  },
  {
    "id": "TRUST-04",
    "category": "trust",
    "title": "Proof on the first phone screen",
    "rule": "Home first phone screen shows a star rating with number or customer count, or a short named testimonial.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "doneWhen": "A star rating or review count shows on the product's first screen.",
    "origin": [
      "C1",
      "H4",
      "HP-003",
      "HP-013",
      "TR-009"
    ],
    "note": "Review: A named testimonial needs judgement: code+ai. Lost: product page first-screen proof (C1); covered by TRUST-02 only if near title."
  },
  {
    "id": "TRUST-05",
    "category": "trust",
    "title": "Guarantee or returns next to buy button",
    "rule": "A money-back, return or exchange guarantee line sits within the buy box, next to Add to cart.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "content"
    ],
    "doneWhen": "A returns or guarantee line is visible within one screen of the Add to Cart button.",
    "origin": [
      "B1",
      "TR-005",
      "PDP-031",
      "PDP-030"
    ]
  },
  {
    "id": "TRUST-06",
    "category": "trust",
    "title": "Trust signals in the cart",
    "rule": "Near the cart checkout button, at least 2 of: returns note, guarantee, delivery promise, secure payment icons, support contact.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "doneWhen": "The cart shows payment options and a returns or security line next to the checkout button.",
    "origin": [
      "D2",
      "CT-026",
      "CO-007"
    ]
  },
  {
    "id": "TRUST-07",
    "category": "trust",
    "title": "Shipping policy states cost and time",
    "rule": "Shipping policy page states cost, delivery time per region and couriers, and is linked from the footer.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-031"
    ]
  },
  {
    "id": "TRUST-08",
    "category": "trust",
    "title": "Phone, WhatsApp and email easy to find",
    "rule": "A real phone or WhatsApp number and an email or form are reachable in one tap from the header, footer or contact page.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "dev"
    ],
    "doneWhen": "A WhatsApp or chat link is reachable from the product page in one tap.",
    "origin": [
      "D3",
      "TR-010",
      "SW-034"
    ],
    "note": "Review: 'Contact page states response time' is rare and low value; contact page not visited. Drop it; keep a real phone/WhatsApp plus email or form reachable in one tap."
  },
  {
    "id": "TRUST-09",
    "category": "trust",
    "title": "No template or placeholder content",
    "rule": "No page shows Lorem ipsum, demo addresses, theme-demo links or placeholder text.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-017"
    ]
  },
  {
    "id": "TRUST-10",
    "category": "trust",
    "title": "Reviews show text, names, dates and breakdown",
    "rule": "Reviews section shows total count, star breakdown, sort or filter, and individual reviews with text, name and date.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-044",
      "PDP-045"
    ]
  },
  {
    "id": "TRUST-11",
    "category": "trust",
    "title": "Landing page has a guarantee",
    "rule": "The landing page states a guarantee or returns promise within 300px of the main CTA.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-047"
    ]
  },
  {
    "id": "TRUST-12",
    "category": "trust",
    "title": "Trust badges beside landing CTAs",
    "rule": "The main landing CTA has a lock or security line, payment icons or a trust seal within 300px.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-046",
      "LP-103",
      "LP-096"
    ],
    "note": "Review: LP-040 (name the next step in the CTA) is a CTA label issue, and LP-103 mixes footer social links and newsletter. Move LP-040 out; 'each CTA' within 300px is too strict, use the main CTA."
  },
  {
    "id": "TRUST-13",
    "category": "trust",
    "title": "Testimonials are named and specific",
    "rule": "Testimonials show name, photo and a specific outcome, not just praise; an aggregate rating with count follows the testimonials section.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Landing-page style; stores rely on reviews",
    "roleCopy": {},
    "origin": [
      "HP-035",
      "HP-036",
      "HP-037",
      "CP-022"
    ],
    "note": "Review: CP-004 (four proof types: reviews, case studies, UGC) is broader and overlaps TRUST-14; move out. Keep named testimonials with outcomes and aggregate rating."
  },
  {
    "id": "TRUST-14",
    "category": "trust",
    "title": "Customer photos and videos shown",
    "rule": "At least 3 real customer photos or videos show on product pages, with some on home.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "marketing",
      "dev"
    ],
    "doneWhen": "The product page shows at least 3 customer photos or one customer video.",
    "origin": [
      "TR-004",
      "HP-039",
      "P8",
      "PDP-047",
      "PDP-053"
    ]
  },
  {
    "id": "TRUST-15",
    "category": "trust",
    "title": "About page and real business shown",
    "rule": "An About page names the business, shows real people or photos, and gives a physical address or registration where it exists.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "About page rarely visited by buyers",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "content"
    ],
    "doneWhen": "The site shows a business address or registration, a phone or WhatsApp and an About page.",
    "origin": [
      "C5",
      "SW-033"
    ]
  },
  {
    "id": "TRUST-16",
    "category": "trust",
    "title": "Logo or USP trust bar on landing page",
    "rule": "Within the first two phone screens, a bar shows real press or partner logos, or 3-4 icon promises.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Press logos rare for GCC stores",
    "roleCopy": {},
    "origin": [
      "LP-066",
      "LP-004",
      "LP-013"
    ],
    "note": "Real logos only. Review: LP-069 mixes logo, policy bar and CTA-scroll: not one issue; move out. LP-065 (icon USP bar) duplicates HOME-10; fold it there."
  },
  {
    "id": "TRUST-21",
    "category": "trust",
    "title": "Press, certification or partner logos",
    "rule": "Home page shows at least one recognised press, certification or partner logo (image alt or text) above the footer.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "content"
    ],
    "doneWhen": "Every trust badge links to or names something a shopper can check.",
    "origin": [
      "C4",
      "HP-016",
      "TR-007"
    ],
    "note": "Restored in review: these got real verdicts in 5-6 past reports Review: Restored from dropped"
  },
  {
    "id": "OFFER-01",
    "category": "offers",
    "title": "Shipping cost and total shown before checkout",
    "rule": "The product page or cart states the shipping cost, how it is worked out, or the free-shipping rule before the checkout button.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Delivery cost is shown before checkout",
        "whyItMatters": "A delivery cost that appears only at the last step is a common reason buyers drop out after adding to cart."
      },
      "media_buyer": {
        "title": "Shipping cost shown before checkout",
        "whyItMatters": "Shoppers from ads who meet a surprise cost in checkout leave after you paid for the click; showing it earlier likely lifts CVR and lowers CPA on the same spend.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Write the delivery cost in the cart and on the product page (for example the price per city or 'free above X'), and keep the delivery policy page linked from both.",
    "doneWhen": "A phone shopper can read the delivery cost on the product page or in the cart before tapping checkout.",
    "origin": [
      "A1",
      "SO-CRO-02",
      "MB-CRO-01",
      "CT-018",
      "SO-CRO-04",
      "CO-008",
      "CO-006"
    ],
    "note": "Review: Two issues. Shipping cost shown (A1, SO-CRO-02, MB-CRO-01, CT-018) stays. A3, MB-CRO-06, SO-CRO-09, CT-017 are a clear cart total with VAT: second point (price match is OFFER-03, saved line OFFER-16, code field OFFER-17)."
  },
  {
    "id": "OFFER-02",
    "category": "offers",
    "title": "Price clear with local currency and variant updates",
    "rule": "Price sits next to the title in local currency ('From X' when variants differ) and updates when the variant changes.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-017"
    ]
  },
  {
    "id": "OFFER-03",
    "category": "offers",
    "title": "Cart price matches product page",
    "rule": "After our add, the cart unit price and currency equal the product page price, and a sale price keeps its old price.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Cart price matches the product page price",
        "whyItMatters": "A price that changes between the ad, the page and the cart breaks trust after the click, so CVR likely drops on the same paid traffic.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "dev"
    ],
    "defaultAction": "Ask the owner or developer to make the product page and cart show the same price, with currency and the old price on sale items.",
    "doneWhen": "Our re-scan finds the same price on the product page and in the cart, with currency shown.",
    "origin": [
      "MB-CRO-07"
    ]
  },
  {
    "id": "OFFER-04",
    "category": "offers",
    "title": "Free-delivery threshold vs average order",
    "rule": "A free-delivery threshold found on the visited pages sits at 1.1 to 1.6 times the GA4 average order value.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide",
      "product",
      "cart"
    ],
    "needs": [
      "ga4",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Free-delivery threshold vs your average order",
        "whyItMatters": "A threshold just above the usual order nudges shoppers to add one more item."
      },
      "media_buyer": {
        "title": "Order value vs free-shipping threshold",
        "whyItMatters": "A threshold just above AOV encourages bigger baskets, so AOV and ROAS are expected to rise at the same CAC.",
        "adEffect": "aov",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Free-delivery threshold vs average order",
        "adEffect": "aov"
      },
      "agency": {
        "title": "Free-delivery threshold vs average order",
        "adEffect": "aov"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Set the free-shipping threshold at about 1.3× your average order value and show it in the cart.",
    "doneWhen": "Threshold set at 1.2–1.5× the average order value and visible in the cart.",
    "origin": [
      "GA4-11",
      "SO-GA4-11",
      "MB-GA4-20",
      "M3",
      "MB-CRO-13"
    ],
    "note": "Rule matches ga4-facts.ts GA4-11; the code wins (decided 22 Nov). AI reads the threshold from site text; code compares. Overlaps SO-CRO-03, MB-CRO-13."
  },
  {
    "id": "OFFER-05",
    "category": "offers",
    "title": "Delivery time shown before buying",
    "rule": "The product page (or collection cards) states a delivery time estimate in days, a date or by city, near the buy box.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Delivery time is shown before buying",
        "whyItMatters": "Shoppers who don't know when the order arrives hesitate, especially for gifts and occasions."
      },
      "media_buyer": {
        "title": "Delivery time shown before checkout",
        "whyItMatters": "Shoppers from ads who don't know when it arrives hesitate in the cart, so stating it likely lifts CVR.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Add a short line under the price: 'Delivery in X to Y days' (by city if it differs).",
    "doneWhen": "The product page shows a delivery time on a phone.",
    "origin": [
      "SO-CRO-13",
      "MB-CRO-12",
      "B5"
    ],
    "note": "Review: Requiring delivery time AND stock status explains B5's 19 of 19 warns. Make stock status optional. PDP-029's free-shipping threshold belongs to OFFER-01/09, not here."
  },
  {
    "id": "OFFER-06",
    "category": "offers",
    "title": "Instalment price shown near price",
    "rule": "If Tabby, Tamara or valU is offered, an instalment line (for example 4 payments of X) shows within 300px of the product price and in the cart.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Pay-in-instalments price is shown on the product page",
        "whyItMatters": "Seeing a smaller instalment amount helps shoppers commit to higher-priced items."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on the Tabby or Tamara product-page widget from the app or payment settings so the instalment amount shows under the price.",
    "doneWhen": "The product page and cart show the instalment line with an amount on a phone.",
    "origin": [
      "SO-CRO-11",
      "PO-004",
      "PDP-005"
    ]
  },
  {
    "id": "OFFER-07",
    "category": "offers",
    "title": "Local payment methods shown before checkout",
    "rule": "Icons or text for GCC payment methods (mada, Apple Pay, Tabby or Tamara, cash on delivery) and a secure-checkout line sit by Add to cart and the cart checkout button, not only the footer.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Local payment options visible before checkout",
        "whyItMatters": "Paid shoppers who can't see their way to pay drop before checkout, so CVR likely reads lower and CPA higher than the traffic deserves.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "store_owner": {
        "title": "Customers can see they can pay with mada, Apple Pay, Tabby or Tamara before checkout",
        "whyItMatters": "Shoppers who don't see their way to pay stop before checkout, so the sale is lost after they already chose the product."
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "dev"
    ],
    "defaultAction": "Ask the owner to show accepted payment methods near Add to Cart and in the cart; the developer adds the BNPL widget if the store uses Tabby or Tamara.",
    "doneWhen": "Payment icons or a BNPL widget are visible on the product page and cart in our re-scan.",
    "origin": [
      "MB-CRO-05",
      "CT-022",
      "A4",
      "L2",
      "TR-006",
      "HP-012",
      "PDP-028",
      "CO-011",
      "SO-CRO-01"
    ],
    "note": "Icons should match methods really offered at checkout. Review: D1 and CP-018 (reassurance microcopy: delivery, returns, cancel) are a different issue from payment icons; move out. L2 delivery-coverage half overlaps OFFER-05. A4 instalment half overlaps OFFER-06."
  },
  {
    "id": "OFFER-08",
    "category": "offers",
    "title": "Sale price and saving are clear",
    "rule": "Discounted products show old and new price on the card; the product page also shows the saving (amount or %), with currency.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Sale price and saving are clear",
        "whyItMatters": "A clear saving gets deal-seeking shoppers to act; an unclear price makes them doubt the offer."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Set the old price (compare-at price) on discounted products so the saving shows everywhere, and keep the price visible on all product cards.",
    "doneWhen": "Every collection card shows a price, and a discounted product shows old and new price on the card and the product page.",
    "origin": [
      "SO-CRO-18",
      "PO-001",
      "PDP-019",
      "CL-018"
    ],
    "note": "Review: CL-018 only wanted the crossed-out old price on cards; the saving amount is a product-page need. Cards: old and new price. Product page: also the saving."
  },
  {
    "id": "OFFER-09",
    "category": "offers",
    "title": "Free-shipping progress bar in cart",
    "rule": "The cart shows a progress bar or line naming the exact amount left for free shipping or a free gift, and the product page shows it too if possible.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Free-delivery threshold is shown and explained",
        "whyItMatters": "A clear free-delivery amount gives shoppers a reason to add one more item, which raises order value."
      }
    },
    "origin": [
      "CT-007",
      "PO-008",
      "SO-CRO-03"
    ],
    "note": "Review: No gate for stores without free shipping; the bar may be an image, so a miss is not certain. Gate as not applicable, use code+ai. Drop vague 'product page too if possible'."
  },
  {
    "id": "OFFER-10",
    "category": "offers",
    "title": "Offers match across site and cart",
    "rule": "The offer and free-shipping amount in the cart equal those in the announcement bar.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home",
      "cart",
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "CT-003",
      "CT-008",
      "PO-007",
      "SW-004"
    ],
    "note": "Review: Checkout is only the first screen and rarely shows the free-shipping amount; drop checkout from the comparison. Keep cart vs announcement bar."
  },
  {
    "id": "OFFER-11",
    "category": "offers",
    "title": "Bundle or multi-buy saving is quantified",
    "rule": "A bundle or quantity offer sits next to the price or button and states the exact saving (amount or %), not only 2x1.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "owner",
      "dev"
    ],
    "doneWhen": "A bundle or multi-buy offer shows next to the Add to Cart button.",
    "origin": [
      "M1",
      "PO-003",
      "PDP-024",
      "HP-026"
    ]
  },
  {
    "id": "OFFER-12",
    "category": "offers",
    "title": "Add-ons suggested, one tap to add",
    "rule": "The product page or cart suggests 2-3 relevant add-ons, each with image, price and a one-tap Add button.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Related products shown to raise order value",
        "whyItMatters": "Suggesting a matching item lets buyers add more to the same order."
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner"
    ],
    "defaultAction": "Turn on the related-products section on product pages and a 'you may also like' block in the cart.",
    "doneWhen": "Product page and cart each show at least one in-stock related product.",
    "origin": [
      "M2",
      "PO-009",
      "CT-014",
      "CT-015",
      "SO-CRO-21",
      "PDP-055",
      "PDP-056"
    ]
  },
  {
    "id": "OFFER-13",
    "category": "offers",
    "title": "Main offer in one clear sentence",
    "rule": "Main offer is stated in one sentence of 25 words or fewer: what you get, the saving as a number, and the end or condition.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Copy judgement, hard to apply consistently",
    "roleCopy": {},
    "origin": [
      "CP-020"
    ]
  },
  {
    "id": "OFFER-14",
    "category": "offers",
    "title": "Only one offer message at a time",
    "rule": "On the product page one offer message is visible; promo bar, floating discount tab and pop-up do not compete.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-003"
    ]
  },
  {
    "id": "OFFER-15",
    "category": "offers",
    "title": "Orders contain more than one item",
    "rule": "GA4 item units per order average 1.2 or more over the last 28 days (item units sold ÷ transactions).",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Ways to add a second item",
        "whyItMatters": "More items per order raises AOV, so ROAS likely rises at the same CAC.",
        "adEffect": "aov",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "owner",
      "content"
    ],
    "defaultAction": "Ask the owner to add related products or a bundle on the best-selling product page and in the cart.",
    "doneWhen": "A cross-sell or bundle block is visible on product page or cart, and GA4 items per order is tracked over 28 days after.",
    "origin": [
      "MB-CRO-14"
    ],
    "note": "28 days: the period the GA4 pull already covers (was 90 days in the draft). Units, so three of one product count as 3. Outcome measure of the cross-sell point; threshold to tune per store type. Review: Items per purchase above 1.0 passes almost every store, no signal. Use 1.2 or more. Not in ga4-facts.ts today, so it needs a new GA4 metric (code+)."
  },
  {
    "id": "OFFER-16",
    "category": "offers",
    "title": "Cart shows what shopper saved",
    "rule": "When a discount applies, the cart shows a You saved line or crossed-out prices.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "doneWhen": "The cart shows a 'You saved …' line when items are discounted.",
    "origin": [
      "K1"
    ]
  },
  {
    "id": "OFFER-17",
    "category": "offers",
    "title": "Discount code field is present but quiet",
    "rule": "A discount code field exists in the cart or checkout, collapsed or behind a small link, not a large open box.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "cart",
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Promo codes from your ads have a place to go",
        "whyItMatters": "Code-based campaigns lose shoppers who can't use the code, so CVR on those campaigns likely reads lower.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Ask the owner to show the discount field in the cart, or use auto-apply discount links in the ads.",
    "doneWhen": "Our re-scan finds a discount field in the cart, or the ad links apply the code.",
    "origin": [
      "MB-CRO-17",
      "CT-019",
      "CO-014"
    ],
    "note": "Message check may need entering a fake code. Review: Nothing is typed, so 'clear success or error message' cannot be checked (CO-014). Drop it. MB-CRO-17 only wanted a place for codes; keep presence plus collapsed."
  },
  {
    "id": "OFFER-18",
    "category": "offers",
    "title": "Stock or sale-end message near price",
    "rule": "If a stock or sale-end message exists, it sits within 200px of the price. No message is not a fail.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PO-006"
    ],
    "note": "Must be real data, not fake urgency."
  },
  {
    "id": "OFFER-19",
    "category": "offers",
    "title": "Value is framed per use or day",
    "rule": "The product page has a per-unit, per-day or days-of-supply line within 300px of the price.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Per-use framing niche to consumables",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "content"
    ],
    "doneWhen": "The product page shows at least three reasons the price is worth it, above the fold or next to the price.",
    "origin": [
      "PO-002",
      "A2"
    ]
  },
  {
    "id": "OFFER-20",
    "category": "offers",
    "title": "Email or WhatsApp signup with incentive",
    "rule": "A signup form or WhatsApp link states a clear incentive (discount, early access) in the first load or footer.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "marketing",
      "dev"
    ],
    "doneWhen": "An email or WhatsApp signup with a first-order offer is live on the site.",
    "origin": [
      "R1"
    ]
  },
  {
    "id": "OFFER-21",
    "category": "offers",
    "title": "Loyalty, referral or subscription visible",
    "rule": "The site shows a loyalty, referral or subscribe-and-save programme link or banner before purchase.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Loyalty programme is strategy, not a fix",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "marketing"
    ],
    "doneWhen": "The site shows a loyalty, referral or subscribe-and-save offer.",
    "origin": [
      "R2"
    ],
    "note": "Review: Loyalty apps often load as floating widgets; link regex proves a pass but a miss is not a certain fail. Use code+ai. Also gate by store type."
  },
  {
    "id": "OFFER-22",
    "category": "offers",
    "title": "Cart shows the full cost clearly",
    "rule": "Subtotal plus clear shipping handling, and a discount field or note, before the checkout button.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Cart shows the same price and a clear total",
        "whyItMatters": "A price that changes between the product page and the cart breaks trust right before checkout."
      },
      "media_buyer": {
        "title": "Cart shows the full total before checkout",
        "whyItMatters": "Fees that appear late push paid shoppers out of checkout, so fixing it likely raises CVR on clicks you already paid for.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner"
    ],
    "defaultAction": "Ask the owner to show the total and any fees (cash-on-delivery fee, VAT) in the cart, not only in checkout.",
    "doneWhen": "The cart in our re-scan shows a total line and states VAT and any fee.",
    "origin": [
      "A3",
      "MB-CRO-06",
      "SO-CRO-09",
      "CT-017"
    ],
    "note": "Split out of OFFER-01 in review; rule copied from A3, needs sharpening Review: New point from a split"
  },
  {
    "id": "OFFER-23",
    "category": "offers",
    "title": "Delivery details: specific timing ('Order in 3h → delivered Thursday'), estimated duration, and free-shipping threshold BELOW the delivery time",
    "rule": "Delivery estimate + shipping cost/free threshold.",
    "severity": "low",
    "decidedBy": "ai",
    "pages": [
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "PDP-029"
    ],
    "note": "Removed from OFFER-05 in review (different issue). Keep, merge elsewhere or drop. Kept as its own point after review Review: Needs a home"
  },
  {
    "id": "OFFER-24",
    "category": "offers",
    "title": "Reassurance right under the button",
    "rule": "One or more short reassurance lines sit directly by the CTA.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "content",
      "dev"
    ],
    "doneWhen": "A short reassurance line (returns, delivery, payment) sits right under the Add to Cart button.",
    "origin": [
      "D1",
      "CP-018"
    ],
    "note": "Split out of OFFER-07 in review; rule copied from D1, needs sharpening Review: New point from a split"
  },
  {
    "id": "LAND-01",
    "category": "landing",
    "title": "Paid campaigns land on pages that convert",
    "rule": "Each top-3 paid campaign (50+ sessions) lands on a page with add-to-cart rate at least 70% of the paid average.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "ga4",
      "visit"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Top paid campaigns: landing page conversion and what the page offers",
        "whyItMatters": "Paid clicks that land on a page that converts poorly or doesn't show what they came for are bought and lost, so CVR is likely lower and CAC higher than the traffic deserves.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "marketing",
      "owner"
    ],
    "defaultAction": "Point each weak campaign at the product or collection it sells; ask the owner to put that product or offer and a clear headline on the landing page's first screen.",
    "doneWhen": "Each top paid campaign's main landing page in GA4 converts at or above the paid average over 14 days, and its first screen shows the headline and offer.",
    "origin": [
      "MB-CRO-02"
    ],
    "note": "Review: 'Non-home page' is a new, wrong requirement: brand-search campaigns can land on home. Two checks glued: conversion vs paid average (GA4) and first-screen content (overlaps LAND-04). Drop the home rule and the first-screen half."
  },
  {
    "id": "LAND-02",
    "category": "landing",
    "title": "Paid landing pages do not show not-found",
    "rule": "No landing page getting paid sessions returns an error or not-found page, and the 404 page offers search or a way back.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "ga4",
      "crawl"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Paid landing pages that show 'page not found'",
        "whyItMatters": "Every paid click to a dead page is spend with no chance to convert, so CAC is higher than it needs to be right now.",
        "adEffect": "cost",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "marketing",
      "dev"
    ],
    "defaultAction": "Change the ad URLs that point to dead pages; ask the developer to redirect deleted product URLs to the closest live product or collection.",
    "doneWhen": "No paid landing page in GA4 over the last 14 days shows a not-found title, and the listed URLs return a live page.",
    "origin": [
      "MB-CRO-04"
    ],
    "note": "Review: Collector visits at most two landing pages. Checking every paid landing URL needs a fetch of the top landing URLs (code+). The 404-page search check needs a separate 404 visit."
  },
  {
    "id": "LAND-03",
    "category": "landing",
    "title": "Landing page stays focused on one goal",
    "rule": "The landing page has no main menu, at most 2 header links, one main offer, and every main button leads to the same action.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-001",
      "LP-043",
      "LP-057",
      "LP-081",
      "LP-018",
      "LP-077"
    ]
  },
  {
    "id": "LAND-04",
    "category": "landing",
    "title": "First screen has benefit headline and CTA",
    "rule": "The first phone screen shows a benefit-led headline, 3 short benefit points and one clear CTA.",
    "severity": "critical",
    "decidedBy": "ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-002",
      "LP-064",
      "LP-101",
      "LP-092",
      "LP-033",
      "LP-034"
    ]
  },
  {
    "id": "LAND-05",
    "category": "landing",
    "title": "Quick-backs on the top landing page",
    "rule": "With 100+ sessions on the top landing page, its quick-back share is at or below the site-wide share.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "clarity"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Quick-backs on the top landing page",
        "whyItMatters": "Quick-backs on the page ads send traffic to likely mean paid clicks that never get a chance to convert, so CVR reads low and CAC high because of the page, not the targeting.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "content",
      "dev"
    ],
    "defaultAction": "Forward to the store owner: check that the top landing page's first screen shows the product and offer from the ad. If the ad sells one product, land on that product, not the home page.",
    "doneWhen": "Next 3-day snapshot shows the top landing page's quick-back share at or below the site average.",
    "origin": [
      "MB-CL-02"
    ],
    "note": "Needs a session minimum, e.g. 100. Review: No minimum sessions; a quick-back share on few sessions is noise. Add 100+ sessions like PATH-06; no_data without Clarity."
  },
  {
    "id": "LAND-06",
    "category": "landing",
    "title": "Landing page matches shopper's language",
    "rule": "Landing page lang and dir match its visible text language, an Arabic version with a visible switcher exists, and Arabic-language GA4 sessions land on Arabic pages.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "media_buyer"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Landing page speaks the shopper's language",
        "whyItMatters": "An Arabic ad that lands on an English or broken page loses the shopper the ad just won, so CVR likely drops and CPA rises.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev",
      "marketing"
    ],
    "defaultAction": "Point Arabic ads at the Arabic URLs; ask the developer to fix lang, dir and right-to-left layout.",
    "doneWhen": "GA4 shows Arabic-language paid sessions landing on Arabic pages, and our visit finds correct lang and dir.",
    "origin": [
      "MB-CRO-11"
    ],
    "note": "Review: We do not see the ad language, so that is untestable. Use lang and dir matching visible text, an Arabic version with switcher, and GA4 Arabic sessions landing on Arabic pages. All code."
  },
  {
    "id": "LAND-07",
    "category": "landing",
    "title": "Landing page shows named customer proof",
    "rule": "The page shows a star rating with count or at least 2 testimonials with first and last name, within the first two phone screens.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-008",
      "LP-028",
      "LP-036",
      "LP-056",
      "LP-044"
    ]
  },
  {
    "id": "LAND-08",
    "category": "landing",
    "title": "CTA repeats down the page",
    "rule": "On a landing page longer than 4 phone screens, the main CTA appears at least 4 times, including after the hero and at the close.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-009",
      "LP-045"
    ],
    "note": "Review: Both origins ask 4 CTAs; rule drops to 3 with no reason, and 'after the proof' needs section judgement. 'Long page' undefined. Use 4 on a page over 4 screens; code+ai."
  },
  {
    "id": "LAND-09",
    "category": "landing",
    "title": "CTA labels say what the visitor gets",
    "rule": "Main buttons carry a specific benefit or next-step label, not Submit, Click here or Learn more.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-048",
      "LP-035"
    ]
  },
  {
    "id": "LAND-10",
    "category": "landing",
    "title": "Lead form is short",
    "rule": "The landing page form asks 3 fields or fewer (4 with an optional question), each with a visible label.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Lead forms rare on store landing pages",
    "roleCopy": {},
    "origin": [
      "LP-062",
      "LP-083"
    ]
  },
  {
    "id": "LAND-11",
    "category": "landing",
    "title": "Form or buy box reachable at once",
    "rule": "The form or buy box shows in the first phone screen, or comes directly after the headline, with no scrolling past body copy.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "LP-061",
      "LP-074",
      "LP-032",
      "LP-082"
    ]
  },
  {
    "id": "LAND-12",
    "category": "landing",
    "title": "Multi-step forms show progress and time",
    "rule": "A multi-step form shows a progress bar or step count and states how long it takes.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Multi-step forms rare on stores",
    "roleCopy": {},
    "origin": [
      "LP-052",
      "LP-090",
      "LP-063",
      "LP-051",
      "LP-075"
    ]
  },
  {
    "id": "LAND-13",
    "category": "landing",
    "title": "Landing page answers questions with FAQ",
    "rule": "A FAQ block with at least 3 questions sits before the closing CTA.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "landing"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Landing FAQ is low value",
    "roleCopy": {},
    "origin": [
      "LP-011",
      "LP-024"
    ],
    "note": "Review: 'Below the benefits' needs section judgement. Test only what code can: a FAQ block with 3 or more questions sits before the closing CTA."
  },
  {
    "id": "SPEED-01",
    "category": "speed",
    "title": "Main content shows fast (LCP)",
    "rule": "LCP is under 2.5s on a throttled phone, on the product page and home.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product",
      "home",
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Product page shows fast on phones",
        "whyItMatters": "A product page that shows late loses visitors before they see the price or the Add to cart button."
      },
      "media_buyer": {
        "title": "Main content shows late after the ad click",
        "whyItMatters": "People who leave before the page shows never become a landing page view, so the click-to-LPV gap widens and CAC rises; ad-side LPV is not visible to us.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Main content shows fast (LCP)",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Main content shows fast (LCP)",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Preload the hero/product image and cut render-blocking files.",
    "doneWhen": "LCP under 2.5s on a phone.",
    "origin": [
      "W-09",
      "SO-WC-03",
      "MB-WC-11",
      "MB-009"
    ],
    "note": "PageSpeed Insights gives LCP."
  },
  {
    "id": "SPEED-02",
    "category": "speed",
    "title": "Page does not jump while loading",
    "rule": "CLS is under 0.1 on a phone on home, collection and product.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "collection",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "The page does not jump while loading",
        "whyItMatters": "When the page jumps, customers tap the wrong button and lose trust."
      },
      "media_buyer": {
        "title": "Page jumps while it loads",
        "whyItMatters": "A page that jumps under the thumb causes mis-taps and drop-offs right after the click, so CVR is lower than the traffic deserves.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Page does not jump while loading",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Page does not jump while loading",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Set image sizes and reserve space for banners and apps.",
    "doneWhen": "CLS under 0.1.",
    "origin": [
      "W-10",
      "SO-WC-15",
      "MB-WC-21"
    ],
    "note": "PageSpeed Insights gives CLS."
  },
  {
    "id": "SPEED-03",
    "category": "speed",
    "title": "Taps respond without lag",
    "rule": "Total Blocking Time is under 200 ms while home and product load on a throttled phone.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Taps respond without delay",
        "whyItMatters": "A button that does not react right away makes customers think the store is broken."
      },
      "media_buyer": {
        "title": "Taps lag on the phone after the ad click",
        "whyItMatters": "Paid visitors who tap and get no response leave or give up on the add, so CVR drops on clicks already paid for.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Taps respond without lag",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Taps respond without lag",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Defer heavy scripts until after the page is usable.",
    "doneWhen": "No task over 200ms on load.",
    "origin": [
      "W-11",
      "SO-WC-12",
      "MB-WC-16"
    ],
    "note": "PageSpeed TBT is the proxy; tune threshold to TBT under 200 ms. Review: One task over 200 ms fails nearly every real store, and data-center CPU is noisy. The note's own proxy, Total Blocking Time under 200 ms, is the better line."
  },
  {
    "id": "SPEED-04",
    "category": "speed",
    "title": "No render-blocking files",
    "rule": "No third-party script in the head lacks async/defer, and render-blocking resources delay first paint by under 0.5s.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Cause, not outcome; LCP already measures it",
    "roleCopy": {
      "marketing_manager": {
        "title": "No render-blocking files",
        "adEffect": "performance"
      },
      "agency": {
        "title": "No render-blocking files",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Defer or async the blocking files.",
    "doneWhen": "No CSS or JS file blocks first paint in a performance trace.",
    "origin": [
      "W-12"
    ],
    "note": "PageSpeed render-blocking audit. Review: Every stylesheet in the head blocks first paint, so this fails every site. Test only head scripts without async/defer, and render-blocking time over a limit."
  },
  {
    "id": "SPEED-05",
    "category": "speed",
    "title": "Images are light and lazy",
    "rule": "At least 90% of content images (not SVG, not under 48px) have natural width up to 2x display width and are WebP or AVIF; images below the first screen use loading=lazy.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home",
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Product photos are not heavier than needed",
        "whyItMatters": "Heavy photos are the most common reason a store page shows slowly on a phone."
      },
      "marketing_manager": {
        "title": "Images are light and lazy",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Images are light and lazy",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Resize images, serve WebP/AVIF and lazy-load below the fold.",
    "doneWhen": "No image over 2× its display size.",
    "origin": [
      "W-13",
      "SO-WC-13"
    ],
    "note": "PageSpeed image audits give the weight. Review: 'Each image' fails on one logo or icon. Use a share, skip SVG and tiny icons, and account for phone pixel ratio."
  },
  {
    "id": "SPEED-06",
    "category": "speed",
    "title": "Third-party apps stay light",
    "rule": "Third-party transfer (excluding the store's own domains and image CDN) is under 50% of home page bytes, and no single app domain exceeds 20%.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Apps and tags do not slow the store down",
        "whyItMatters": "Each app adds waiting time before customers see your product."
      },
      "media_buyer": {
        "title": "Third-party apps slow the page",
        "whyItMatters": "App weight slows the page after the ad click, so CVR drops and the click-to-LPV gap widens.",
        "adEffect": "performance",
        "lane": "post_click"
      },
      "marketing_manager": {
        "title": "Third-party apps stay light",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Third-party apps stay light",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "owner",
      "dev"
    ],
    "defaultAction": "Drop or delay the heaviest apps.",
    "doneWhen": "Third-party JS under budget.",
    "origin": [
      "W-15",
      "MB-WC-20",
      "SO-WC-14"
    ],
    "note": "Review: GTM-22 ('only core tags on All Pages') is a different, judgement check, not a byte share. Also exclude the store's own CDN and platform CDN from 'third-party'."
  },
  {
    "id": "SPEED-07",
    "category": "speed",
    "title": "No autoplay video on phone first screen",
    "rule": "No autoplay video larger than 1 MB is in the phone first screen of home.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "No heavy autoplay video on the phone first screen",
        "whyItMatters": "A heavy video slows the first screen on mobile data, and slower pages lose visitors before they see a product."
      },
      "marketing_manager": {
        "title": "No autoplay video on phone first screen",
        "adEffect": "performance"
      },
      "agency": {
        "title": "No autoplay video on phone first screen",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Show a poster image on phones instead of the video.",
    "doneWhen": "No autoplay video on the mobile first screen.",
    "origin": [
      "W-17",
      "SO-CRO-25"
    ],
    "note": "Review: Origin SO-CRO-25 said 'heavy'. Rule fails any small muted loop. Add a weight limit."
  },
  {
    "id": "SPEED-08",
    "category": "speed",
    "title": "Heavy tags on every page",
    "rule": "Only core tags fire on All Pages.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "marketing_manager": {
        "title": "Heavy tags on every page",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Heavy tags on every page",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Load heavy tags only on the pages that need them.",
    "doneWhen": "Only the Google tag and consent tags fire on All Pages.",
    "origin": [
      "GTM-22"
    ],
    "note": "Split out of SPEED-06 in review; rule copied from GTM-22, needs sharpening Review: New point from a split"
  },
  {
    "id": "SEO-01",
    "category": "findability",
    "title": "Product and collection pages indexable",
    "rule": "Product and collection pages are allowed in robots.txt and carry no noindex or nofollow.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "product",
      "collection"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Google can show your products and collections",
        "whyItMatters": "Blocked pages get no free visits from Google, so you pay for every visitor through ads."
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Remove the noindex tag or robots.txt rule blocking product and collection pages.",
    "doneWhen": "Product and collection pages indexable.",
    "origin": [
      "W-36",
      "SO-WC-05"
    ]
  },
  {
    "id": "SEO-02",
    "category": "findability",
    "title": "Page titles unique and short",
    "rule": "Each page title is unique, under 60 characters and holds the product or category name.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "home",
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "SEO, not CRO; low value here",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "content"
    ],
    "defaultAction": "Rewrite titles with the product or category and what it's for.",
    "doneWhen": "Unique titles under 60 characters.",
    "origin": [
      "W-37"
    ]
  },
  {
    "id": "SEO-03",
    "category": "findability",
    "title": "Canonical tags point to themselves",
    "rule": "Product and collection pages have a canonical URL pointing to their own clean address.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product",
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "SEO, not CRO; platforms handle canonicals",
    "roleCopy": {},
    "opportunity": "benefit",
    "owners": [
      "content",
      "dev"
    ],
    "defaultAction": "Write unique descriptions and fix the canonicals.",
    "doneWhen": "Each page has a unique meta description and a canonical pointing to itself.",
    "origin": [
      "W-38"
    ],
    "note": "Unique meta descriptions can be a low-severity extra."
  },
  {
    "id": "SEO-04",
    "category": "findability",
    "title": "robots.txt and sitemap work",
    "rule": "robots.txt is valid and lists a sitemap URL that returns 200.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "SEO, not CRO; platforms auto-generate",
    "roleCopy": {},
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix robots.txt and publish a sitemap.",
    "doneWhen": "Sitemap listed and reachable.",
    "origin": [
      "W-39"
    ]
  },
  {
    "id": "SEO-05",
    "category": "findability",
    "title": "Product pages carry Product schema",
    "rule": "Product pages have Product schema with an Offer holding price and availability.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add Product schema with price and availability.",
    "doneWhen": "Valid in Google's Rich Results Test.",
    "origin": [
      "W-40"
    ]
  },
  {
    "id": "SEO-06",
    "category": "findability",
    "title": "Schema price and stock match the page",
    "rule": "When the product page clearly shows one price, schema price equals it; when it shows stock status, availability matches it.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Google sees the right price and stock",
        "whyItMatters": "Correct price and stock keep your products eligible for free Google Shopping listings."
      },
      "media_buyer": {
        "title": "Product schema price or stock wrong",
        "whyItMatters": "Google Shopping can disapprove products whose page data disagrees, which cuts Shopping and Performance Max reach.",
        "adEffect": "cost",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Make the schema use the live price and stock.",
    "doneWhen": "Schema price and stock match the visible page in the Rich Results Test.",
    "origin": [
      "W-41",
      "SO-WC-22",
      "MB-WC-25"
    ],
    "note": "Review: Shown-price parsing is not certain (sale price, variant, several prices), and many pages show no stock text. Compare only when one price/stock is clearly shown; otherwise unassessed."
  },
  {
    "id": "SEO-07",
    "category": "findability",
    "title": "Language tags and hreflang correct",
    "rule": "If the store has English and Arabic versions: html lang and dir match each page, hreflang pairs reciprocally, and Arabic pages have no noindex.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "home"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix lang/dir and add hreflang between the versions.",
    "doneWhen": "Both versions indexable with hreflang.",
    "origin": [
      "W-45"
    ],
    "note": "Review: Single-language stores must be not applicable. Origin also said Arabic pages indexable; that part is lost."
  },
  {
    "id": "SEO-08",
    "category": "findability",
    "title": "Shared links show picture and title",
    "rule": "Home and product pages have og:title, og:image and og:description.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "home",
      "product"
    ],
    "needs": [
      "crawl",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Share previews, weak conversion impact",
    "roleCopy": {
      "store_owner": {
        "title": "Shared links show a picture in WhatsApp and Instagram",
        "whyItMatters": "Customers share products on WhatsApp; a link with a photo gets more people to open it."
      },
      "marketing_manager": {
        "title": "Shared links show picture and title",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Shared links show picture and title",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_gain",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add Open Graph title, image and description.",
    "doneWhen": "A shared link shows image and title.",
    "origin": [
      "W-44",
      "SO-WC-24"
    ]
  },
  {
    "id": "SEO-09",
    "category": "findability",
    "title": "Collection page has helpful text below the grid",
    "rule": "A text block of at least 100 words below the product grid explains the collection and is not keyword stuffing.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "collection"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "SEO copy, not CRO",
    "roleCopy": {},
    "origin": [
      "CL-025"
    ],
    "note": "Review: The 300-word cap is arbitrary; long text is not a fault. Past: 6 of 6 'missing', so check the collector scrolls to the text below the grid."
  },
  {
    "id": "RISK-01",
    "category": "risk",
    "title": "No customer emails or phones sent to trackers",
    "rule": "No email or phone number appears in page URLs, GA4 page paths, query strings of pixel or GA4 hits, or as plain text in any GTM tag parameter.",
    "severity": "critical",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "ga4",
      "gtm",
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Customer emails and phone numbers in GA4",
        "whyItMatters": "Google can delete a property's data for this, and you would lose your sales history."
      },
      "media_buyer": {
        "title": "Personal data in page URLs",
        "whyItMatters": "Platforms can flag or restrict events that carry personal data in URLs, which cuts the signal campaigns optimise on; check warnings in Events Manager.",
        "adEffect": "optimization",
        "lane": "signal"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Remove personal data from URLs and turn on email/query redaction in the data stream; Google can delete a property's data for this.",
    "doneWhen": "No emails or phone numbers in page paths.",
    "origin": [
      "GA4-24",
      "SO-GA4-23",
      "GTM-18",
      "SO-GTM-16",
      "W-30",
      "MB-WC-15"
    ],
    "note": "Review: Phone regex hits order IDs and product IDs in URLs, and a GTM variable's value is unknown (Meta hashes it). Code proves clear email hits only."
  },
  {
    "id": "RISK-02",
    "category": "risk",
    "title": "HTTPS everywhere, no mixed content",
    "rule": "All pages including checkout load on HTTPS with no mixed-content requests.",
    "severity": "critical",
    "decidedBy": "code",
    "pages": [
      "sitewide",
      "checkout",
      "home",
      "collection",
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "media_buyer": {
        "title": "Every page loads on a secure connection",
        "whyItMatters": "A not-secure warning after the ad click makes shoppers leave before they look, so the click is spend with no chance to convert.",
        "adEffect": "cost",
        "lane": "post_click"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Redirect every http URL to https and replace http resource links in the theme.",
    "doneWhen": "Every page and the checkout load on https with zero mixed-content warnings.",
    "origin": [
      "W-31",
      "MB-CRO-24"
    ]
  },
  {
    "id": "RISK-03",
    "category": "risk",
    "title": "Consent banner choice is respected",
    "rule": "Where a banner shows: the consent default fires on Consent Initialization; after refusing, no ad pixel hits are sent; after accepting, consent signals are granted. If we cannot click the buttons, that part is unassessed.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit",
      "gtm"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Consent banner works before and after the choice",
        "whyItMatters": "A banner that does not work exposes you to complaints from customers in regions that require consent."
      },
      "media_buyer": {
        "title": "Consent state on live hits blocks or ignores ad tags",
        "whyItMatters": "Over-blocking hides real sales from the platforms, so reported ROAS reads lower than real and Google's modelling has less to work with.",
        "adEffect": "deflated",
        "lane": "signal"
      }
    },
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Move the consent default to the Consent Initialization trigger.",
    "doneWhen": "The consent default fires before any other tag.",
    "origin": [
      "GTM-16",
      "GTM-17",
      "SO-GTM-23",
      "MB-WC-07",
      "W-29"
    ],
    "note": "Not applicable without a banner; refuse/accept clicks are a small add. Review: Needs banner Accept/Reject clicks; a missed button is our bot, not a fail. Say so. Static GTM parts (default order) are certain, live parts are not."
  },
  {
    "id": "RISK-04",
    "category": "risk",
    "title": "No exposed source files",
    "rule": "Source maps, .env, .git and backup files at standard paths do not return a real file body (a 404 or the HTML shell is a pass).",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "crawl"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Security scan, outside CRO audit scope",
    "roleCopy": {},
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Remove or block those files.",
    "doneWhen": "All return 404.",
    "origin": [
      "W-33"
    ],
    "note": "Review: Single-page and catch-all hosts return HTTP 200 with an HTML page for any path; that is a false fail. Require a real file body."
  },
  {
    "id": "RISK-05",
    "category": "risk",
    "title": "Price and buy buttons readable",
    "rule": "Price text and Add to Cart button pass WCAG AA contrast (4.5:1 text, 3:1 large).",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "product"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "opportunity": "benefit",
    "owners": [
      "dev"
    ],
    "defaultAction": "Darken the price and button colours.",
    "doneWhen": "Price and button colours pass WCAG AA (4.5:1 contrast).",
    "origin": [
      "W-47"
    ],
    "note": "Review: Colour is not in collected data, and text over an image or gradient cannot be computed. Code decides solid backgrounds only; others to AI. Overlaps RISK-11's contrast part."
  },
  {
    "id": "RISK-06",
    "category": "risk",
    "title": "Tap targets at least 44px",
    "rule": "Primary controls (CTA, quantity, swatches, menu, cart, search, checkout) are at least 44x44px on phone with spacing between them; the main CTA is near full width.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide",
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "marketing_manager": {
        "title": "Tap targets at least 44px",
        "adEffect": "performance"
      },
      "agency": {
        "title": "Tap targets at least 44px",
        "adEffect": "performance"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Fix the elements that overflow the 390px screen and enlarge tap targets under 44px.",
    "doneWhen": "No horizontal scroll; targets 44px or more.",
    "origin": [
      "MB-005",
      "HP-047",
      "W-20"
    ],
    "note": "Review: 'Links' at 44px fails every store (footer, inline text links). Limit to primary controls. Also loses HP-047's near-full-width CTA."
  },
  {
    "id": "RISK-07",
    "category": "risk",
    "title": "No sideways scroll on small phones",
    "rule": "At 390px and 360px, home, collection, product and cart have no horizontal scrolling.",
    "severity": "medium",
    "decidedBy": "code",
    "pages": [
      "sitewide",
      "home",
      "collection",
      "product",
      "cart"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {
      "store_owner": {
        "title": "Phone layout has no sideways scroll and buttons are easy to tap",
        "whyItMatters": "Most store visits are on phones; missed taps and a wobbling page lose buyers on the way to the cart."
      },
      "media_buyer": {
        "title": "Phone layout works for mobile paid traffic",
        "whyItMatters": "Most paid social clicks come from phones; a broken phone page likely holds mobile CVR down and CPA up.",
        "adEffect": "performance",
        "lane": "post_click"
      }
    },
    "opportunity": "revenue_loss",
    "owners": [
      "dev"
    ],
    "defaultAction": "Ask your developer to remove the element causing sideways scroll and enlarge the small buy and quantity buttons on mobile.",
    "doneWhen": "No sideways scroll on the four pages and all listed buttons measure 44px or more.",
    "origin": [
      "MB-011",
      "SO-CRO-12",
      "MB-CRO-08"
    ]
  },
  {
    "id": "RISK-08",
    "category": "risk",
    "title": "No broken images or empty gaps",
    "rule": "After scrolling each audited page, no visible image has naturalWidth 0 and no empty block over 600px tall.",
    "severity": "medium",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-018"
    ],
    "note": "Review: Lazy images read naturalWidth 0 until scrolled, so false fails. Past 3 of 3 'badly' is suspect. Overlap detection needs vision. Test only loaded images after scroll."
  },
  {
    "id": "RISK-09",
    "category": "risk",
    "title": "Icon buttons have names",
    "rule": "Cart, menu and search icon buttons each have an aria-label or visible text name.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Accessibility detail, low conversion impact",
    "roleCopy": {},
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add aria-labels to the icon buttons.",
    "doneWhen": "All icon buttons named.",
    "origin": [
      "W-50"
    ]
  },
  {
    "id": "RISK-10",
    "category": "risk",
    "title": "Form fields have labels",
    "rule": "Every input on visited forms has a label or aria-label.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "cart",
      "checkout"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "parked",
    "parkedReason": "Accessibility detail, low conversion impact",
    "roleCopy": {},
    "opportunity": "risk",
    "owners": [
      "dev"
    ],
    "defaultAction": "Add a visible label or aria-label to every form input.",
    "doneWhen": "All inputs labelled.",
    "origin": [
      "W-49"
    ]
  },
  {
    "id": "RISK-11",
    "category": "risk",
    "title": "Text readable on phone",
    "rule": "Body text is at least 16px on phone and its contrast meets 4.5:1.",
    "severity": "low",
    "decidedBy": "code+ai",
    "pages": [
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "SW-024"
    ],
    "note": "Review: Paragraph 'three lines or fewer' depends on width; arbitrary. Contrast duplicates RISK-05. Keep font size and contrast only."
  },
  {
    "id": "RISK-12",
    "category": "risk",
    "title": "Form fields do not zoom on tap",
    "rule": "Form inputs use font size 16px or more and the right keyboard type (tel, email), so the page does not zoom on tap.",
    "severity": "low",
    "decidedBy": "code",
    "pages": [
      "checkout",
      "sitewide"
    ],
    "needs": [
      "visit"
    ],
    "roles": [
      "store_owner",
      "media_buyer",
      "marketing_manager",
      "agency"
    ],
    "status": "active",
    "roleCopy": {},
    "origin": [
      "MB-008"
    ]
  }
];
