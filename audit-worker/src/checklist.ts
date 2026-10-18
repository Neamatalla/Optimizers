import type { ActionOwner, FindingSeverity, Handoff, Opportunity } from "./types.js";

/**
 * The action-point checklists (ACTION-POINTS-PROPOSAL.md, 2026-10-13). Every
 * point is something the store can act on: it names the opportunity type,
 * the default action, who does it and a checkable "done when". The audit
 * prompt asks Claude for the store-specific wording of the action; these
 * defaults fill in whatever it leaves out (actions.ts).
 *
 * Same three routes and the same flat 50-check scale as before:
 *   - GA4 + GTM           → 25 + 25
 *   - exactly one of them → 25 + the 25-point WEBSITE_CODE_CHECKLIST slice
 *   - neither             → the 50-point WEBSITE_CHECKLIST
 *
 * GA4 points marked `fact: true` are decided by code, not by the model:
 * ga4-facts.ts computes the numbers and the pass/fail from the OAuth reports,
 * the prompt quotes them, and computeCategoryResult enforces the status.
 * Points marked `browser: true` read what the friction collector saw on the
 * live store (site-checks.ts) — our own Add-to-Cart click, the events it
 * produced, the contact links — when that collection ran.
 *
 * The checklists in use before this rewrite live in checklist-legacy.ts so
 * older saved results still render.
 */

export interface BaseChecklistPoint {
  id: string;
  title: string;
  expectedState: string;
  commonFailure: string;
  validate: string;
  severity: FindingSeverity;
}

export interface ChecklistPoint extends BaseChecklistPoint {
  group: string;
  opportunity: Opportunity;
  owners: ActionOwner[];
  // Default action and done-state, used when the model's own are missing or
  // fail the actionability rule (actions.ts).
  action: string;
  doneWhen: string;
  // Where this point continues (a Conversion review page, or another check).
  handoff?: Handoff;
  fact?: boolean;
  browser?: boolean;
}

// Report sections, in display order per tool (html-report.ts).
export const CHECK_GROUP_LABELS: Record<string, { en: string; ar: string }> = {
  "ga4-funnel": { en: "Where the funnel leaks money", ar: "أين يخسر مسار الشراء المال" },
  "ga4-traffic": { en: "Where traffic is wasted", ar: "أين تُهدر الزيارات" },
  "ga4-orders": { en: "Bigger orders and repeat buyers", ar: "طلبات أكبر وعملاء يعودون" },
  "ga4-trust": { en: "Can the numbers be trusted", ar: "هل يمكن الوثوق بالأرقام" },
  "ga4-account": { en: "Protect the account", ar: "حماية الحساب" },
  "gtm-signal": { en: "Ad platforms get the right signal", ar: "منصات الإعلان تستقبل الإشارة الصحيحة" },
  "gtm-shoppers": { en: "Track what your shoppers really do", ar: "تتبّع ما يفعله المتسوقون فعلًا" },
  "gtm-privacy": { en: "Consent, privacy and security", ar: "الموافقة والخصوصية والأمان" },
  "gtm-fit": { en: "Container fit for this store", ar: "ملاءمة الحاوية لهذا المتجر" },
  "web-path": { en: "The buying path works", ar: "مسار الشراء يعمل" },
  "web-speed": { en: "Speed on phones", ar: "السرعة على الهاتف" },
  "web-tracking": { en: "Tracking seen from outside", ar: "التتبع كما يظهر من الخارج" },
  "web-risk": { en: "Security and privacy risk", ar: "مخاطر الأمان والخصوصية" },
  "web-find": { en: "Findability and sales channels", ar: "الظهور في البحث وقنوات البيع" },
  "web-a11y": { en: "Accessibility on the buying path", ar: "سهولة الاستخدام في مسار الشراء" },
};

type Def = Omit<ChecklistPoint, "expectedState" | "commonFailure"> & { pass: string; fires: string };

function point(d: Def): ChecklistPoint {
  const { pass, fires, ...rest } = d;
  return { ...rest, expectedState: pass, commonFailure: fires };
}

const FACT = "Decided by the worker: quote the computed fact for this id from \"Computed GA4 facts\" (numbers and status) and write the action around it.";

// ---------------------------------------------------------------------------
// GA4 (25)
// ---------------------------------------------------------------------------

export const GA4_CHECKLIST: ChecklistPoint[] = [
  // A. Where the funnel leaks money
  point({
    id: "GA4-01", group: "ga4-funnel", title: "Biggest funnel leak", severity: "critical", opportunity: "revenue_gain", owners: ["dev", "owner"], fact: true,
    pass: "Every funnel step converts at or above its benchmark.",
    fires: "One of view_item→add_to_cart, add_to_cart→begin_checkout, begin_checkout→purchase is below its benchmark; the worst one is named.",
    validate: `${FACT} MCP route: run_report 28 days, dimensions=[eventName] metrics=[totalUsers] for view_item, add_to_cart, begin_checkout, purchase; compare each step with the benchmarks 8% / 50% / 50%.`,
    action: "Fix the page behind the worst funnel step first; the Conversion review below shows what is wrong on it.",
    doneWhen: "That step's rate is within 10% of its benchmark over 14 days in GA4.",
    handoff: { kind: "cro", page: "cart" },
  }),
  point({
    id: "GA4-02", group: "ga4-funnel", title: "Product page to add to cart", severity: "critical", opportunity: "revenue_gain", owners: ["dev", "content"], fact: true,
    pass: "view_item→add_to_cart at or above 8%.",
    fires: "view_item→add_to_cart below 8% of product viewers.",
    validate: `${FACT} MCP route: totalUsers for view_item and add_to_cart, 28 days.`,
    action: "Fix the weakest product page (see GA4-10) using the product-page issues in the Conversion review.",
    doneWhen: "Add-to-cart rate from product views is up over 14 days.",
    handoff: { kind: "cro", page: "product" },
  }),
  point({
    id: "GA4-03", group: "ga4-funnel", title: "Cart to checkout", severity: "critical", opportunity: "revenue_loss", owners: ["dev"], fact: true,
    pass: "add_to_cart→begin_checkout at or above 50%.",
    fires: "Fewer than half of the people who add to cart start checkout.",
    validate: `${FACT} MCP route: totalUsers for add_to_cart and begin_checkout, 28 days.`,
    action: "Fix the cart issues the Conversion review found (costs, trust, next step) for the people who already chose to buy.",
    doneWhen: "Cart to checkout rate at 50% or more over 14 days.",
    handoff: { kind: "cro", page: "cart" },
  }),
  point({
    id: "GA4-04", group: "ga4-funnel", title: "Checkout to purchase", severity: "critical", opportunity: "revenue_loss", owners: ["owner"], fact: true,
    pass: "begin_checkout→purchase at or above 50%.",
    fires: "Fewer than half of started checkouts end in a purchase; add_shipping_info / add_payment_info show which sub-step loses them.",
    validate: `${FACT} MCP route: totalUsers for begin_checkout, add_shipping_info, add_payment_info, purchase, 28 days.`,
    action: "Run one test order on a phone and check: shipping cost shown before the last step, cash on delivery offered, no forced account, local payment options, no errors.",
    doneWhen: "Each item on that list is tested and fixed or ruled out, and checkout to purchase is at 50% or more.",
  }),
  point({
    id: "GA4-05", group: "ga4-funnel", title: "Mobile vs desktop conversion", severity: "medium", opportunity: "revenue_gain", owners: ["dev"], fact: true,
    pass: "Mobile conversion is at least 60% of desktop.",
    fires: "Mobile converts at under 60% of desktop with enough visits on both.",
    validate: `${FACT} MCP route: run_report dimensions=[deviceCategory] metrics=[sessions,transactions], 28 days.`,
    action: "Fix the phone issues on the page behind the worst funnel step (Conversion review, phone screenshots).",
    doneWhen: "Mobile conversion at 60% or more of desktop over 14 days.",
    handoff: { kind: "cro", page: "product" },
  }),

  // B. Where traffic is wasted
  point({
    id: "GA4-06", group: "ga4-traffic", title: "Landing pages with visits but no sales", severity: "medium", opportunity: "revenue_loss", owners: ["dev", "marketing"], fact: true,
    pass: "No high-traffic landing page converts under a third of the store average.",
    fires: "A top landing page converts under one third of the store average.",
    validate: `${FACT} MCP route: run_report dimensions=[landingPage] metrics=[sessions,conversions] ordered by sessions, 28 days.`,
    action: "Fix that landing page, or stop sending ad traffic to it until it is fixed.",
    doneWhen: "The page converts at half the store average or more, or no paid traffic lands on it.",
  }),
  point({
    id: "GA4-07", group: "ga4-traffic", title: "Worst paid campaign and its landing page", severity: "medium", opportunity: "revenue_loss", owners: ["marketing"], fact: true,
    pass: "No paid campaign with real volume is converting near zero.",
    fires: "A paid campaign brings many visits with almost no sales; named with its landing page.",
    validate: `${FACT} MCP route: run_report dimensions=[sessionCampaignName,sessionDefaultChannelGroup,landingPage] metrics=[sessions,conversions], 28 days.`,
    action: "Pause that campaign or point it to a landing page that sells.",
    doneWhen: "The campaign is paused, or its conversion rate is up after the change.",
  }),
  point({
    id: "GA4-08", group: "ga4-traffic", title: "Visits with an unknown source", severity: "medium", opportunity: "benefit", owners: ["marketing"], fact: true,
    pass: "Unassigned and (not set) are under 10% of visits.",
    fires: "Over 10% of visits have no known source.",
    validate: `${FACT} MCP route: run_report dimensions=[sessionDefaultChannelGroup] metrics=[sessions], 28 days.`,
    action: "Add UTM tags to every ad, bio link, WhatsApp and SMS link.",
    doneWhen: "Unassigned visits under 5% in GA4.",
    handoff: { kind: "check", id: "GTM-14" },
  }),
  point({
    id: "GA4-09", group: "ga4-traffic", title: "Visits from countries you don't sell to", severity: "low", opportunity: "revenue_loss", owners: ["marketing"], fact: true,
    pass: "Countries with real traffic also produce sales.",
    fires: "Countries with a real share of visits and zero sales.",
    validate: `${FACT} MCP route: run_report dimensions=[country] metrics=[sessions,conversions], 28 days.`,
    action: "Exclude those countries from ad targeting.",
    doneWhen: "Paid visits from those countries close to zero.",
  }),
  point({
    id: "GA4-10", group: "ga4-traffic", title: "Products viewed but not added to cart", severity: "medium", opportunity: "revenue_gain", owners: ["content", "owner"], fact: true,
    pass: "No popular product's add-to-cart rate is far below the store average.",
    fires: "A product page with many views adds to cart at under half the store average.",
    validate: `${FACT} MCP route: run_report dimensions=[pagePath,eventName] metrics=[eventCount] for view_item and add_to_cart, 28 days.`,
    action: "Fix that product page: price, photos, stock, size information. The Conversion review checks this exact product.",
    doneWhen: "That product's add-to-cart rate reaches the store average.",
    handoff: { kind: "cro", page: "product" },
  }),

  // C. Bigger orders and repeat buyers
  point({
    id: "GA4-11", group: "ga4-orders", title: "Order value vs free-shipping threshold", severity: "medium", opportunity: "revenue_gain", owners: ["owner"], fact: true, browser: true,
    pass: "The free-shipping threshold sits at 1.1–1.6× the average order value.",
    fires: "No threshold found on the site, or it sits below or far above the average order value.",
    validate: `${FACT} Threshold read from the live store's pages (Browser facts). MCP route: purchaseRevenue/transactions for the average order value.`,
    action: "Set the free-shipping threshold at about 1.3× your average order value and show it in the cart.",
    doneWhen: "Threshold set at 1.2–1.5× the average order value and visible in the cart.",
    handoff: { kind: "cro", page: "cart" },
  }),
  point({
    id: "GA4-12", group: "ga4-orders", title: "Returning buyers", severity: "medium", opportunity: "revenue_gain", owners: ["marketing", "dev"], fact: true, browser: true,
    pass: "Returning visitors convert 2× new ones or more, or the site already captures email/WhatsApp.",
    fires: "Returning visitors convert under 2× new ones AND the site has no email/WhatsApp capture.",
    validate: `${FACT} MCP route: run_report dimensions=[newVsReturning] metrics=[sessions,conversions], 28 days.`,
    action: "Add an email or WhatsApp signup with a first-order offer, and a message after each purchase.",
    doneWhen: "Signup live on the site and returning-visitor share rising month on month.",
    handoff: { kind: "cro", page: "home" },
  }),
  point({
    id: "GA4-13", group: "ga4-orders", title: "Site search", severity: "low", opportunity: "revenue_gain", owners: ["dev", "owner"], fact: true, browser: true,
    pass: "Search is visible on phones and tracked.",
    fires: "Shoppers search but search is hidden on phones, or search is not tracked so nobody sees what they look for.",
    validate: `${FACT} MCP route: run_report dimensions=[searchTerm] metrics=[eventCount], 28 days.`,
    action: "Make search visible on phones and make sure the top search terms return products.",
    doneWhen: "Search visible on the phone header; the top 5 terms return products.",
    handoff: { kind: "cro", page: "home" },
  }),
  point({
    id: "GA4-14", group: "ga4-orders", title: "Remarketing audiences", severity: "medium", opportunity: "revenue_gain", owners: ["marketing"], fact: true,
    pass: "Cart-abandoner or product-viewer audiences exist and Google Ads is linked.",
    fires: "Only default audiences exist, or no Google Ads link to use them in.",
    validate: `${FACT} MCP route: list_audiences and list_google_ads_links.`,
    action: "Create cart-abandoner and product-viewer audiences and share them with Google Ads.",
    doneWhen: "Both audiences exist and show users in Google Ads.",
  }),
  point({
    id: "GA4-16", group: "ga4-orders", title: "Hours and days that convert", severity: "low", opportunity: "revenue_loss", owners: ["marketing"], fact: true,
    pass: "Conversion is about even across the day and week.",
    fires: "Some hours or weekdays convert far better than others, with enough volume to act on.",
    validate: `${FACT} MCP route: run_report dimensions=[dayOfWeek,hour] metrics=[sessions,conversions], 28 days.`,
    action: "Schedule ad budget toward the hours and days that convert.",
    doneWhen: "Ad schedule set to match in the ad accounts.",
  }),

  // D. Can the numbers be trusted
  point({
    id: "GA4-15", group: "ga4-trust", title: "Tracking live and stable", severity: "critical", opportunity: "revenue_loss", owners: ["dev"], fact: true,
    pass: "Events flowing now, and no unexplained drop week on week.",
    fires: "No live users, or visits fell over 40% week on week.",
    validate: `${FACT} MCP route: run_realtime_report activeUsers; run_report sessions for the last 7 vs the prior 7 days.`,
    action: "Fix the tag before anything else; check the last GTM publish and the last site release.",
    doneWhen: "Events flowing in realtime and no unexplained cliff.",
    handoff: { kind: "check", id: "W-21" },
  }),
  point({
    id: "GA4-17", group: "ga4-trust", title: "Funnel events complete", severity: "critical", opportunity: "benefit", owners: ["dev"], fact: true,
    pass: "view_item, add_to_cart, begin_checkout and purchase all record with plausible counts.",
    fires: "A funnel event is missing, or a step is so low (under 30% of benchmark) that the event is likely not firing.",
    validate: `${FACT} MCP route: run_report dimensions=[eventName] metrics=[eventCount] for the ecommerce events.`,
    action: "Add or fix the missing funnel event so each step can be measured.",
    doneWhen: "Every funnel step shows in GA4 with plausible counts.",
    handoff: { kind: "check", id: "GTM-06" },
  }),
  point({
    id: "GA4-18", group: "ga4-trust", title: "Purchases and revenue agree", severity: "critical", opportunity: "revenue_loss", owners: ["dev"], fact: true,
    pass: "Purchase events, transactions and revenue line up.",
    fires: "Purchases and transactions differ by over 10%, revenue is zero, or currency is missing.",
    validate: `${FACT} MCP route: run_report eventName=purchase metrics=[eventCount,transactions,purchaseRevenue].`,
    action: "Fix the purchase tag so each order is sent once with its value and currency.",
    doneWhen: "Purchases equal transactions and revenue matches the store admin within 5%.",
    handoff: { kind: "check", id: "GTM-01" },
  }),
  point({
    id: "GA4-19", group: "ga4-trust", title: "Payment gateways taking sales credit", severity: "medium", opportunity: "benefit", owners: ["marketing"], fact: true,
    pass: "No payment gateway shows as a traffic source.",
    fires: "tabby, tamara, paymob, PayPal, Fawry, a bank or a checkout domain shows as a source.",
    validate: `${FACT} MCP route: run_report dimensions=[sessionSource,sessionMedium] metrics=[sessions,conversions].`,
    action: "Add those domains to the unwanted referrals list in the GA4 data stream.",
    doneWhen: "They no longer appear as traffic sources.",
  }),
  point({
    id: "GA4-20", group: "ga4-trust", title: "Key events", severity: "medium", opportunity: "revenue_loss", owners: ["marketing"], fact: true,
    pass: "purchase is a key event and no noise events are.",
    fires: "purchase is not a key event, or page_view/scroll/session_start are.",
    validate: `${FACT} MCP route: list_key_events.`,
    action: "Mark purchase (and lead, if used) as key events and unmark the rest.",
    doneWhen: "Key events list shows only real conversions.",
  }),
  point({
    id: "GA4-21", group: "ga4-trust", title: "Google Ads linked", severity: "medium", opportunity: "revenue_gain", owners: ["marketing"], fact: true,
    pass: "Google Ads is linked to this property.",
    fires: "No Google Ads link.",
    validate: `${FACT} MCP route: list_google_ads_links.`,
    action: "Link Google Ads and import purchase so bidding learns from real sales.",
    doneWhen: "purchase shows as a primary conversion in Google Ads.",
  }),
  point({
    id: "GA4-22", group: "ga4-trust", title: "Currency and timezone", severity: "low", opportunity: "benefit", owners: ["marketing"], fact: true,
    pass: "Property currency and timezone match the store's market.",
    fires: "Currency or timezone doesn't match the country most visits and sales come from.",
    validate: `${FACT} MCP route: get_property (currencyCode, timeZone).`,
    action: "Set the property currency and timezone to the store's market.",
    doneWhen: "Property settings show the store's currency and timezone.",
  }),
  point({
    id: "GA4-23", group: "ga4-trust", title: "Data kept long enough", severity: "low", opportunity: "benefit", owners: ["marketing"], fact: true,
    pass: "Event data retention is 14 months or more.",
    fires: "Retention is 2 months.",
    validate: `${FACT} MCP route: get_data_retention_settings.`,
    action: "Switch event data retention to 14 months so Ramadan and White Friday can be compared year on year.",
    doneWhen: "Retention setting shows 14 months.",
  }),

  // E. Protect the account
  point({
    id: "GA4-24", group: "ga4-account", title: "Personal data in GA4", severity: "critical", opportunity: "risk", owners: ["dev"], fact: true,
    pass: "No email addresses or phone numbers in page URLs.",
    fires: "Emails or phone numbers appear in page paths sent to GA4.",
    validate: `${FACT} MCP route: run_report dimensions=[pagePath] and scan for @, %40, email=, phone=.`,
    action: "Remove personal data from URLs and turn on email/query redaction in the data stream; Google can delete a property's data for this.",
    doneWhen: "No emails or phone numbers in page paths.",
  }),
  point({
    id: "GA4-25", group: "ga4-account", title: "Team visits filtered out", severity: "low", opportunity: "benefit", owners: ["marketing"],
    pass: "An internal-traffic filter is active.",
    fires: "No internal-traffic rule or filter, so the team's own visits count as shoppers.",
    validate: "GA4 Admin: data stream internal traffic rules and data filters. Not in the OAuth pre-fetch: judge from what the data and crawl show, dataSource \"detection\" when unsure.",
    action: "Define the team's and agency's IP addresses as internal traffic and activate the filter.",
    doneWhen: "The internal-traffic filter shows as active.",
    handoff: { kind: "check", id: "GTM-23" },
  }),
];

// ---------------------------------------------------------------------------
// GTM (25)
// ---------------------------------------------------------------------------

const GTM_V = "GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_triggers/list_variables on the live version.";

export const GTM_CHECKLIST: ChecklistPoint[] = [
  // Ad platforms get the right signal
  point({
    id: "GTM-01", group: "gtm-signal", title: "Each purchase counted once", severity: "critical", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Purchase tags fire on the dataLayer purchase event and send transaction_id.",
    fires: "No transaction_id on purchase tags, or purchase fires on a thank-you page view (a refresh counts the order again).",
    validate: `${GTM_V} Check every purchase/conversion tag's trigger and its transaction_id parameter.`,
    action: "Fire purchase tags on the dataLayer purchase event and send transaction_id.",
    doneWhen: "One purchase per order in GA4 and the ad platforms.",
  }),
  point({
    id: "GTM-02", group: "gtm-signal", title: "Purchase sends value, currency and items", severity: "critical", opportunity: "revenue_gain", owners: ["dev"],
    pass: "Purchase tags send value, currency and items.",
    fires: "Any of value, currency or items missing on a purchase tag.",
    validate: `${GTM_V} Read the GA4 purchase event tag's parameters.`,
    action: "Add value, currency and items to the purchase tags so ads can bid on revenue.",
    doneWhen: "Purchase events carry all three in GA4 DebugView.",
  }),
  point({
    id: "GTM-03", group: "gtm-signal", title: "Meta pixel purchase with deduplication", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Meta Purchase event fires with an event_id (for Conversions API deduplication), or Meta isn't used.",
    fires: "Meta pixel present without a Purchase event, or without event_id.",
    validate: `${GTM_V} Find Meta/Facebook pixel tags (Custom HTML or template) and their event and eventID parameters.`,
    action: "Send the Purchase event to the Meta pixel with an event_id, and set up the Conversions API with the same id.",
    doneWhen: "Meta Events Manager shows deduplicated purchases.",
  }),
  point({
    id: "GTM-04", group: "gtm-signal", title: "Pixels for the channels you pay for", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Every paid social channel bringing traffic has its pixel with add-to-cart and purchase.",
    fires: "TikTok, Snapchat or Meta paid traffic shows in GA4 but that platform's pixel or its ecommerce events are missing.",
    validate: `${GTM_V} Compare pixel tags with the paid channels in the GA4 facts (if GA4 is in this run) or the crawl's detected pixels.`,
    action: "Add the missing platform's pixel with add-to-cart and purchase events.",
    doneWhen: "That platform's events manager shows add-to-cart and purchase.",
  }),
  point({
    id: "GTM-05", group: "gtm-signal", title: "Google Ads conversion tracking", severity: "medium", opportunity: "revenue_gain", owners: ["dev"],
    pass: "Google Ads conversion tag and Conversion Linker present (or GA4 import used), enhanced conversions on.",
    fires: "Ads used but no conversion tag/linker, or enhanced conversions off.",
    validate: `${GTM_V} Look for awct / gclidw (Conversion Linker) tags and enhanced-conversion settings.`,
    action: "Add the Google Ads conversion tag, the Conversion Linker and enhanced conversions.",
    doneWhen: "Google Ads shows the conversion as recording, with enhanced conversions active.",
  }),
  point({
    id: "GTM-06", group: "gtm-signal", title: "Every funnel step has a tag", severity: "critical", opportunity: "benefit", owners: ["dev"],
    pass: "Tags exist for view_item, add_to_cart, begin_checkout and purchase.",
    fires: "Any of those events has no tag or trigger.",
    validate: `${GTM_V} List GA4 event tags by event name.`,
    action: "Add tags for the missing funnel events.",
    doneWhen: "Each funnel step shows in GA4.",
    handoff: { kind: "check", id: "GA4-17" },
  }),
  point({
    id: "GTM-07", group: "gtm-signal", title: "Conversions on events, not page URLs", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Conversion tags use dataLayer custom-event triggers.",
    fires: "A conversion tag fires on a page-view trigger matching a thank-you URL.",
    validate: `${GTM_V} Check conversion tags' firing triggers for pageview + URL filters.`,
    action: "Move conversion tags to custom-event triggers.",
    doneWhen: "No URL-based conversion triggers left.",
  }),
  point({
    id: "GTM-08", group: "gtm-signal", title: "Product data complete", severity: "medium", opportunity: "benefit", owners: ["dev"],
    pass: "Ecommerce tags send items with item_id, item_name, price and quantity.",
    fires: "Items are missing or lack id/price/quantity.",
    validate: `${GTM_V} Check ecommerce tags' items / "send ecommerce data" setting.`,
    action: "Map items with id, name, price and quantity on every ecommerce tag.",
    doneWhen: "GA4's item report shows product names and revenue.",
    handoff: { kind: "check", id: "GA4-10" },
  }),
  point({
    id: "GTM-09", group: "gtm-signal", title: "No double page views", severity: "medium", opportunity: "benefit", owners: ["dev"],
    pass: "One Google tag / GA4 config per measurement ID and no extra page_view event tag.",
    fires: "Two config tags for the same ID, or a manual page_view on top of the automatic one.",
    validate: `${GTM_V} Count googtag/gaawc tags per ID and gaawe tags named page_view.`,
    action: "Delete the duplicate Google tag or the extra page_view event tag in the container.",
    doneWhen: "One page_view per page load in DebugView.",
  }),
  point({
    id: "GTM-10", group: "gtm-signal", title: "One measurement ID, no stray IDs", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "Every GA4 tag uses one constant variable with the store's own ID.",
    fires: "Hardcoded or old IDs sending data to another property.",
    validate: `${GTM_V} Collect every G- ID in tag parameters and variables.`,
    action: "Put the ID in one constant variable and remove the others.",
    doneWhen: "Only the store's ID appears in the container.",
  }),

  // Track what shoppers really do
  point({
    id: "GTM-11", group: "gtm-shoppers", title: "WhatsApp and call clicks tracked", severity: "medium", opportunity: "revenue_loss", owners: ["dev"], browser: true,
    pass: "Clicks on WhatsApp and phone links fire an event, or the site has no such links.",
    fires: "The site has WhatsApp or tel: links (Browser facts) and no tag tracks them.",
    validate: `${GTM_V} Look for link-click triggers on wa.me / api.whatsapp.com / tel:. Browser facts list the links found on the store.`,
    action: "Track WhatsApp and call clicks as conversions; orders that start in WhatsApp are invisible today.",
    doneWhen: "A whatsapp_click event appears in GA4.",
  }),
  point({
    id: "GTM-12", group: "gtm-shoppers", title: "Signups and lead forms tracked", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "Email/phone signups fire sign_up or generate_lead.",
    fires: "The site captures emails or phones and no tag tracks it.",
    validate: `${GTM_V} Look for form-submit triggers and sign_up / generate_lead tags.`,
    action: "Add a sign_up or generate_lead event to the signup forms.",
    doneWhen: "The event appears in GA4.",
  }),
  point({
    id: "GTM-13", group: "gtm-shoppers", title: "Site search tracked", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "Searches record a search / view_search_results event with the term.",
    fires: "The site has search and nothing records the term.",
    validate: `${GTM_V} Look for a search tag, or GA4 enhanced measurement site search.`,
    action: "Track searches with the search term.",
    doneWhen: "Search terms appear in GA4.",
    handoff: { kind: "check", id: "GA4-13" },
  }),
  point({
    id: "GTM-14", group: "gtm-shoppers", title: "Ad click IDs kept", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "gclid, fbclid and ttclid are captured (Conversion Linker, first-party cookies).",
    fires: "Paid traffic arrives with click IDs and nothing stores them.",
    validate: `${GTM_V} Conversion Linker tag, URL-parameter variables for fbclid/ttclid.`,
    action: "Capture click IDs so sales are credited to the right ad.",
    doneWhen: "Click IDs stored and sent with conversions.",
  }),
  point({
    id: "GTM-15", group: "gtm-shoppers", title: "Session recordings to prove fixes", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "Microsoft Clarity or Hotjar is installed.",
    fires: "No behaviour-recording tool.",
    validate: `${GTM_V} Look for Clarity/Hotjar tags; also the crawl's detected scripts.`,
    action: "Install Microsoft Clarity (free) so every fix in this report can be checked on real recordings.",
    doneWhen: "Recordings visible in Clarity.",
  }),

  // Consent, privacy and security
  point({
    id: "GTM-16", group: "gtm-privacy", title: "Consent defaults load first", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "A consent default fires on Consent Initialization before any tag.",
    fires: "Consent default missing or on a later trigger.",
    validate: `${GTM_V} Check the CMP/consent tag's trigger (Consent Initialization - All Pages).`,
    action: "Move the consent default to the Consent Initialization trigger.",
    doneWhen: "The consent default fires before any other tag.",
  }),
  point({
    id: "GTM-17", group: "gtm-privacy", title: "Marketing tags respect a refusal", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "Marketing tags require ad_storage consent.",
    fires: "Pixels fire with no consent check.",
    validate: `${GTM_V} Read each marketing tag's consentSettings.`,
    action: "Add consent requirements to every marketing tag.",
    doneWhen: "A visitor who refuses fires no marketing tags.",
  }),
  point({
    id: "GTM-18", group: "gtm-privacy", title: "No personal data in tags", severity: "critical", opportunity: "risk", owners: ["dev"],
    pass: "No raw email or phone in tag parameters.",
    fires: "Email or phone sent unhashed in a tag.",
    validate: `${GTM_V} Scan tag parameters and dataLayer variables for email/phone.`,
    action: "Remove raw email/phone from tags, or hash them where the platform asks for it.",
    doneWhen: "No raw email or phone in any tag.",
  }),
  point({
    id: "GTM-19", group: "gtm-privacy", title: "Unknown custom scripts", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "Every Custom HTML tag has a known purpose and owner.",
    fires: "Custom HTML tags loading scripts from unknown vendors.",
    validate: `${GTM_V} List Custom HTML tags and the domains their scripts load.`,
    action: "Remove unknown Custom HTML tags or replace them with gallery templates.",
    doneWhen: "Every Custom HTML tag left in the live version has a named owner and purpose.",
  }),
  point({
    id: "GTM-20", group: "gtm-privacy", title: "Old agency and campaign tags", severity: "low", opportunity: "risk", owners: ["dev"],
    pass: "No paused, dead or ex-vendor tags.",
    fires: "Paused tags, tags with no trigger, or pixels from past vendors still firing.",
    validate: `${GTM_V} paused flag, tags with no firing trigger, vendor names.`,
    action: "Delete dead and ex-vendor tags.",
    doneWhen: "None left in the live version.",
  }),

  // Container fit
  point({
    id: "GTM-21", group: "gtm-fit", title: "Checkout events on Shopify", severity: "critical", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Not Shopify, or begin_checkout/purchase come from a Shopify Customer Events pixel or the native integration.",
    fires: "Shopify store relying on GTM for checkout and purchase (GTM doesn't run inside Shopify checkout).",
    validate: `${GTM_V} Platform from the crawl/Browser facts; purchase/begin_checkout tags and whether they can run in checkout.`,
    action: "Send checkout and purchase from a Shopify Customer Events custom pixel.",
    doneWhen: "begin_checkout and purchase arrive in GA4 from the custom pixel.",
  }),
  point({
    id: "GTM-22", group: "gtm-fit", title: "Heavy tags on every page", severity: "low", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Only core tags fire on All Pages.",
    fires: "Heavy third-party tags fire on All Pages though only some pages need them.",
    validate: `${GTM_V} Tags on the All Pages trigger and what they load.`,
    action: "Scope heavy tags to the pages that need them.",
    doneWhen: "Only the Google tag and consent tags fire on the All Pages trigger.",
  }),
  point({
    id: "GTM-23", group: "gtm-fit", title: "Team visits marked internal", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "A traffic_type parameter or IP rule marks team visits.",
    fires: "Nothing marks the team's own visits.",
    validate: `${GTM_V} traffic_type parameter on the Google tag.`,
    action: "Add traffic_type for team visits (pairs with GA4-25).",
    doneWhen: "Team visits are tagged internal.",
    handoff: { kind: "check", id: "GA4-25" },
  }),
  point({
    id: "GTM-24", group: "gtm-fit", title: "Add to cart from the drawer tracked", severity: "medium", opportunity: "benefit", owners: ["dev"], browser: true,
    pass: "Our real Add-to-Cart click produced an add_to_cart event (Browser facts), or the tag listens to the theme's AJAX add.",
    fires: "Add-to-cart only fires on a form submit or page change, so drawer and quick adds aren't counted.",
    validate: `${GTM_V} add_to_cart trigger type. Browser facts: events seen after our click.`,
    action: "Trigger add_to_cart from the theme's AJAX add-to-cart event.",
    doneWhen: "A drawer add produces add_to_cart in DebugView.",
  }),
  point({
    id: "GTM-25", group: "gtm-fit", title: "Consent not over-blocking GCC visitors", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Consent defaults are set per region, or the CMP applies only where required.",
    fires: "All tags denied by default for every region, including markets with no such requirement.",
    validate: `${GTM_V} Consent default tag parameters (region, ad_storage/analytics_storage).`,
    action: "Set region-specific consent defaults so GCC/Egypt visits record normally.",
    doneWhen: "GCC/Egypt visits record in GA4; EEA visitors stay denied by default.",
  }),
];

// ---------------------------------------------------------------------------
// Website (50) — technical only; anything a shopper sees as UX is the
// Conversion review's job (src/fud/), so the two never repeat each other.
// ---------------------------------------------------------------------------

const BROWSER = "Headless browser (chrome-devtools MCP) on home, product and cart; Browser facts from our own visit when present.";

export const WEBSITE_CHECKLIST: ChecklistPoint[] = [
  // A. The buying path works
  point({ id: "W-01", group: "web-path", title: "Add to cart works", severity: "critical", opportunity: "revenue_loss", owners: ["dev"], browser: true,
    pass: "Our real click added the item and the cart updated.", fires: "Clicking Add to Cart did not add the item.",
    validate: `Browser facts: addToCart result. Otherwise ${BROWSER}`,
    action: "Fix the Add-to-Cart button or the theme script behind it.", doneWhen: "A click on Add to Cart adds the item and the cart count updates on a phone." }),
  point({ id: "W-02", group: "web-path", title: "Cart and checkout load without errors", severity: "critical", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No JavaScript errors or failed loads on cart/checkout.", fires: "Errors (including repeating ones) or a failed load on cart or checkout.",
    validate: BROWSER, action: "Fix the errors on the cart and checkout pages.", doneWhen: "Zero console errors when cart and checkout load." }),
  point({ id: "W-03", group: "web-path", title: "Broken files on money pages", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No 404/500 requests on home, product or cart.", fires: "Images or scripts failing on those pages.",
    validate: `${BROWSER} Network requests with status >= 400.`, action: "Fix or remove the broken files.", doneWhen: "Zero failed requests on home, product and cart." }),
  point({ id: "W-04", group: "web-path", title: "Requests that hang", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No request over 3 seconds blocks content.", fires: "Requests over 3s delay what the shopper sees.",
    validate: `${BROWSER} Network timing.`, action: "Defer or remove the requests that take over 3 seconds on first load.", doneWhen: "No request over 3s on first load." }),
  point({ id: "W-05", group: "web-path", title: "Broken links and the 404 page", severity: "low", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Menu and footer links work; the 404 page offers search or a way back.", fires: "Dead menu/footer links, or a 404 page with no way back.",
    validate: "Static crawl of menu/footer links; fetch a made-up URL for the 404 page.", action: "Fix dead links and add search and best-sellers to the 404 page.", doneWhen: "No dead menu/footer links; the 404 page has search." }),
  point({ id: "W-06", group: "web-path", title: "Redirect chains", severity: "low", opportunity: "revenue_loss", owners: ["dev"],
    pass: "http and non-www reach the final URL in one hop.", fires: "Two or more redirects before the page.",
    validate: "Crawl redirect chain for http://, https://, www and non-www.", action: "Redirect straight to the final URL in one hop.", doneWhen: "http and www versions reach the final URL in 1 redirect." }),
  point({ id: "W-07", group: "web-path", title: "WhatsApp and call links work", severity: "medium", opportunity: "revenue_loss", owners: ["owner"], browser: true,
    pass: "WhatsApp/phone links use a full international number, or there are none.", fires: "A wa.me or tel: link with a missing or malformed number.",
    validate: `Browser facts: contactLinks. Otherwise ${BROWSER}`, action: "Fix the WhatsApp/phone link to the full international number.", doneWhen: "The link opens a chat with the right number." }),
  point({ id: "W-08", group: "web-path", title: "Sold-out products promoted", severity: "medium", opportunity: "revenue_loss", owners: ["content"], browser: true,
    pass: "No sold-out product in the hero or first row of home/collections.", fires: "Sold-out items featured where shoppers look first.",
    validate: `Browser facts: soldOutPromoted. Otherwise ${BROWSER}`, action: "Move sold-out products out of the first row and feature in-stock ones.", doneWhen: "No sold-out item in the hero or first row." }),

  // B. Speed on phones
  point({ id: "W-09", group: "web-speed", title: "Main content shows late (LCP)", severity: "critical", opportunity: "revenue_loss", owners: ["dev"],
    pass: "LCP under 2.5s on the product page (phone).", fires: "LCP over 2.5s.",
    validate: `${BROWSER} performance trace, mobile throttling.`, action: "Preload the hero/product image and cut render-blocking files.", doneWhen: "LCP under 2.5s on a phone." }),
  point({ id: "W-10", group: "web-speed", title: "Page jumps while loading (CLS)", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "CLS under 0.1.", fires: "CLS over 0.1.",
    validate: `${BROWSER} performance trace.`, action: "Set image sizes and reserve space for banners and apps.", doneWhen: "CLS under 0.1." }),
  point({ id: "W-11", group: "web-speed", title: "Slow to respond to taps", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No main-thread task over 200ms on load.", fires: "Long tasks make taps lag.",
    validate: `${BROWSER} performance trace long tasks / TBT.`, action: "Defer heavy scripts until after the page is usable.", doneWhen: "No task over 200ms on load." }),
  point({ id: "W-12", group: "web-speed", title: "Render-blocking files", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No blocking CSS/JS delays first paint.", fires: "Blocking scripts/styles in the head.",
    validate: `${BROWSER} resources before first paint.`, action: "Defer or async the blocking files.", doneWhen: "No CSS or JS file blocks first paint in a performance trace." }),
  point({ id: "W-13", group: "web-speed", title: "Image weight", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Images served near display size, in WebP/AVIF, lazy below the fold.", fires: "Images far bigger than shown, old formats, or below-fold images loading first.",
    validate: `${BROWSER} image natural vs rendered size, format, loading attribute.`, action: "Resize images, serve WebP/AVIF and lazy-load below the fold.", doneWhen: "No image over 2× its display size." }),
  point({ id: "W-14", group: "web-speed", title: "Heavy code on first load", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "JS + CSS on first load under about 1 MB.", fires: "Over budget.",
    validate: `${BROWSER} transfer size by type.`, action: "Remove unused code and apps.", doneWhen: "First-load JS + CSS under budget." }),
  point({ id: "W-15", group: "web-speed", title: "Third-party app weight", severity: "medium", opportunity: "revenue_loss", owners: ["owner", "dev"],
    pass: "Chat, review and popup apps load light or late.", fires: "Third-party apps dominate load weight.",
    validate: `${BROWSER} third-party transfer size by domain.`, action: "Drop or delay the heaviest apps.", doneWhen: "Third-party JS under budget." }),
  point({ id: "W-16", group: "web-speed", title: "Leftover scripts from removed apps", severity: "low", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No scripts from apps that no longer do anything.", fires: "Scripts load from app domains with no visible feature (or fail).",
    validate: `${BROWSER} third-party scripts vs visible features; failed app requests.`, action: "Remove leftover app code from the theme.", doneWhen: "No orphan app scripts load." }),
  point({ id: "W-17", group: "web-speed", title: "Heavy hero video on phones", severity: "low", opportunity: "revenue_loss", owners: ["dev"], browser: true,
    pass: "No autoplay video on the phone first screen.", fires: "An autoplay video fills the phone first screen.",
    validate: `Browser facts: heroVideoMobile. Otherwise ${BROWSER}`, action: "Show a poster image on phones instead of the video.", doneWhen: "No autoplay video on the mobile first screen." }),
  point({ id: "W-18", group: "web-speed", title: "Compression and caching", severity: "low", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Text compressed (gzip/brotli), static files cached long.", fires: "Uncompressed text or short cache on static files.",
    validate: "Response headers: content-encoding, cache-control.", action: "Turn on compression and long caching for static files.", doneWhen: "HTML, CSS and JS are served with gzip or brotli and static files cache for 30+ days." }),
  point({ id: "W-19", group: "web-speed", title: "Arabic font loading", severity: "low", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Text visible while web fonts load.", fires: "Text invisible until the font loads.",
    validate: "@font-face font-display, font file sizes.", action: "Use font-display: swap and a subset Arabic font.", doneWhen: "Text visible immediately." }),
  point({ id: "W-20", group: "web-speed", title: "Mobile layout", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "No sideways scroll; tap targets 44px+.", fires: "Overflow or small tap targets.",
    validate: `${BROWSER} at 390px.`, action: "Fix the elements that overflow the 390px screen and enlarge tap targets under 44px.", doneWhen: "No horizontal scroll; targets 44px or more." }),

  // C. Tracking seen from outside
  point({ id: "W-21", group: "web-tracking", title: "Tag on every page type", severity: "critical", opportunity: "revenue_loss", owners: ["dev"],
    pass: "The tracking tag loads on home, product and cart.", fires: "Missing on a page type.",
    validate: `${BROWSER} gtag/GTM requests per page.`, action: "Install the tag on every page template.", doneWhen: "Tag loads on home, product and cart." }),
  point({ id: "W-22", group: "web-tracking", title: "Add to cart is recorded", severity: "critical", opportunity: "benefit", owners: ["dev"], browser: true,
    pass: "Our click produced add_to_cart (dataLayer or GA4 hit).", fires: "Our Add-to-Cart click produced no add_to_cart event.",
    validate: `Browser facts: atcEvents. Otherwise ${BROWSER} dataLayer after clicking Add to Cart.`, action: "Send add_to_cart on every add, including the drawer.", doneWhen: "add_to_cart appears when Add to Cart is clicked." }),
  point({ id: "W-23", group: "web-tracking", title: "Event data complete", severity: "medium", opportunity: "benefit", owners: ["dev"],
    pass: "Ecommerce events carry items, value and currency.", fires: "Fields missing.",
    validate: `${BROWSER} dataLayer ecommerce objects.`, action: "Add items, value and currency to the ecommerce events.", doneWhen: "All fields present." }),
  point({ id: "W-24", group: "web-tracking", title: "Tags firing twice", severity: "medium", opportunity: "benefit", owners: ["dev"],
    pass: "One hit per event.", fires: "Duplicate page_view or events.",
    validate: `${BROWSER} count collect hits per event.`, action: "Remove the duplicate tag or script that sends the same event twice.", doneWhen: "Each event sends 1 hit per action in the network log." }),
  point({ id: "W-25", group: "web-tracking", title: "Ad pixels present", severity: "medium", opportunity: "revenue_loss", owners: ["marketing", "dev"],
    pass: "Pixels for the platforms the store advertises on load and fire.", fires: "No Meta/TikTok/Snap/Google Ads pixel.",
    validate: "Crawl detected pixels + browser requests (blocked hits still show the vendor).", action: "Add the pixels for the platforms you advertise on.", doneWhen: "Pixels load and fire." }),
  point({ id: "W-26", group: "web-tracking", title: "Campaign tags survive", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "UTMs reach the landing page; internal links carry none.", fires: "Redirects strip UTMs, or internal links have UTMs.",
    validate: "Fetch a URL with UTMs and follow redirects; scan internal links for utm_.", action: "Keep query strings through redirects and remove UTMs from internal links.", doneWhen: "UTMs survive; none on internal links." }),
  point({ id: "W-27", group: "web-tracking", title: "Old Universal Analytics", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "No analytics.js / UA- tags.", fires: "UA code still loads.",
    validate: "Crawl for analytics.js / UA- IDs.", action: "Remove the old Universal Analytics (analytics.js / UA-) code from the theme.", doneWhen: "No UA script loads." }),
  point({ id: "W-28", group: "web-tracking", title: "dataLayer set before the tag", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "dataLayer declared before GTM.", fires: "Declared after the container.",
    validate: "Source order of dataLayer and the GTM snippet.", action: "Declare dataLayer before the GTM snippet.", doneWhen: "The page source declares window.dataLayer before the GTM snippet." }),

  // D. Risk
  point({ id: "W-29", group: "web-risk", title: "Consent banner connected", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "Banner choices change what tags do (Consent Mode signal).", fires: "Banner shown, but tags behave the same either way.",
    validate: `${BROWSER} gcs/consent parameters before and after a choice.`, action: "Connect the banner to Consent Mode.", doneWhen: "After a visitor refuses, no marketing tag fires in the network log." }),
  point({ id: "W-30", group: "web-risk", title: "Personal data in URLs", severity: "critical", opportunity: "risk", owners: ["dev"],
    pass: "No emails/phones in query strings.", fires: "Forms put emails or phones in the URL.",
    validate: "Crawl forms using GET with email/phone fields; URLs seen in the browser.", action: "Send those forms with POST.", doneWhen: "No personal data in URLs." }),
  point({ id: "W-31", group: "web-risk", title: "HTTPS and checkout trust", severity: "critical", opportunity: "risk", owners: ["dev"],
    pass: "Every page and the checkout on HTTPS with no mixed content.", fires: "http reachable, mixed content, or checkout on an unsecured domain.",
    validate: "Crawl http:// redirect, mixed-content requests, checkout domain.", action: "Redirect every http URL to https and replace http resource links in the theme.", doneWhen: "Every page and the checkout load on https with zero mixed-content warnings." }),
  point({ id: "W-32", group: "web-risk", title: "Security headers and cookies", severity: "low", opportunity: "risk", owners: ["dev"],
    pass: "HSTS, frame protection and secure cookie flags present — or the platform (Shopify, Salla, Zid) manages them.", fires: "Missing on a site whose hosting the store controls.",
    validate: "Response headers and Set-Cookie flags. On a hosted platform mark pass as platform-managed.", action: "Add HSTS, frame-ancestors and Secure/HttpOnly/SameSite flags.", doneWhen: "Headers and flags present." }),
  point({ id: "W-33", group: "web-risk", title: "Exposed files", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "No source maps, .env, .git or backups reachable.", fires: "Any of them returns 200.",
    validate: "Fetch common paths (/.env, /.git/config, *.map).", action: "Remove or block those files.", doneWhen: "All return 404." }),
  point({ id: "W-34", group: "web-risk", title: "Vulnerable libraries", severity: "medium", opportunity: "risk", owners: ["dev"],
    pass: "No known-vulnerable JS library versions.", fires: "An old jQuery or similar with known issues.",
    validate: "Library versions from the crawl/browser.", action: "Update the outdated JavaScript library to its current patched version.", doneWhen: "No known-vulnerable versions." }),
  point({ id: "W-35", group: "web-risk", title: "Trackers not in the privacy policy", severity: "low", opportunity: "risk", owners: ["owner"],
    pass: "Every third-party tracker is named in the privacy policy.", fires: "Trackers firing that the policy doesn't mention.",
    validate: "Detected trackers vs the privacy policy text.", action: "Remove the tracker or list it in the privacy policy.", doneWhen: "The privacy policy names every tracker found on the site." }),

  // E. Findability and sales channels
  point({ id: "W-36", group: "web-find", title: "Money pages blocked from Google", severity: "critical", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Product and collection pages indexable.", fires: "noindex/nofollow or robots block on them.",
    validate: "Meta robots, X-Robots-Tag, robots.txt rules on product/collection URLs.", action: "Remove the noindex tag or robots.txt rule blocking product and collection pages.", doneWhen: "Product and collection pages indexable." }),
  point({ id: "W-37", group: "web-find", title: "Page titles", severity: "medium", opportunity: "revenue_gain", owners: ["content"],
    pass: "Unique titles under 60 characters with the product/category name.", fires: "Missing, duplicate or overlong titles.",
    validate: "Titles of the discovered pages.", action: "Rewrite titles with the product or category and what it's for.", doneWhen: "Unique titles under 60 characters." }),
  point({ id: "W-38", group: "web-find", title: "Descriptions and canonicals", severity: "low", opportunity: "benefit", owners: ["content", "dev"],
    pass: "Unique meta descriptions; canonicals point to themselves.", fires: "Missing/duplicate descriptions or wrong canonicals.",
    validate: "Meta description + canonical on the discovered pages.", action: "Write unique descriptions and fix the canonicals.", doneWhen: "Each page has a unique meta description and a canonical pointing to itself." }),
  point({ id: "W-39", group: "web-find", title: "robots.txt and sitemap", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "robots.txt valid and lists a reachable sitemap.", fires: "Missing, blocking, or no sitemap.",
    validate: "Fetch /robots.txt and the sitemap.", action: "Fix robots.txt and publish a sitemap.", doneWhen: "Sitemap listed and reachable." }),
  point({ id: "W-40", group: "web-find", title: "Product schema", severity: "medium", opportunity: "revenue_gain", owners: ["dev"],
    pass: "Product pages have Product + Offer with price and availability.", fires: "Missing price or availability in schema.",
    validate: "JSON-LD on the product page.", action: "Add Product schema with price and availability.", doneWhen: "Valid in Google's Rich Results Test." }),
  point({ id: "W-41", group: "web-find", title: "Schema matches the page", severity: "medium", opportunity: "revenue_loss", owners: ["dev"],
    pass: "Schema price and stock equal what the page shows.", fires: "They differ (Google Shopping disapproves such products).",
    validate: "JSON-LD price/availability vs the visible price and stock on the product page.", action: "Make the schema use the live price and stock.", doneWhen: "Schema price and stock match the visible page in the Rich Results Test." }),
  point({ id: "W-42", group: "web-find", title: "Brand and product IDs in schema", severity: "low", opportunity: "revenue_gain", owners: ["content"],
    pass: "Product schema has brand and GTIN or MPN.", fires: "Missing, which limits free Google Shopping listings.",
    validate: "JSON-LD brand, gtin*, mpn.", action: "Add brand and GTIN/MPN to products.", doneWhen: "Fields present in schema." }),
  point({ id: "W-43", group: "web-find", title: "Review stars and breadcrumbs", severity: "low", opportunity: "revenue_gain", owners: ["dev"],
    pass: "Reviews and breadcrumbs marked up.", fires: "Reviews shown but no AggregateRating; no BreadcrumbList.",
    validate: "JSON-LD AggregateRating and BreadcrumbList.", action: "Add review and breadcrumb markup.", doneWhen: "Stars eligible in the Rich Results Test." }),
  point({ id: "W-44", group: "web-find", title: "Link previews in WhatsApp and Instagram", severity: "medium", opportunity: "revenue_gain", owners: ["dev"],
    pass: "og:title, og:image and og:description on home and product.", fires: "Missing, so shared links show no picture.",
    validate: "Open Graph tags on home and product.", action: "Add Open Graph title, image and description.", doneWhen: "A shared link shows image and title." }),
  point({ id: "W-45", group: "web-find", title: "Arabic and English versions", severity: "medium", opportunity: "revenue_gain", owners: ["dev"],
    pass: "Correct lang/dir and hreflang; Arabic pages indexable.", fires: "Wrong lang/dir, no hreflang, or Arabic not indexable.",
    validate: "html lang/dir, hreflang links, Arabic URLs.", action: "Fix lang/dir and add hreflang between the versions.", doneWhen: "Both versions indexable with hreflang." }),
  point({ id: "W-46", group: "web-find", title: "Filter and sort pages indexed", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "Filter/sort URLs are noindex or canonical to the clean collection.", fires: "?filter / ?sort URLs indexable.",
    validate: "Canonical/robots on a filtered collection URL.", action: "Canonical filter/sort URLs to the clean collection.", doneWhen: "Only clean collection URLs indexable." }),

  // F. Accessibility on the buying path
  point({ id: "W-47", group: "web-a11y", title: "Contrast on price and buttons", severity: "low", opportunity: "benefit", owners: ["dev"],
    pass: "Price and buy buttons pass WCAG AA contrast.", fires: "They fail AA.",
    validate: `${BROWSER} computed colours of price and CTA.`, action: "Darken the price and button colours.", doneWhen: "Price and button colours pass WCAG AA (4.5:1 contrast)." }),
  point({ id: "W-48", group: "web-a11y", title: "Product image descriptions", severity: "low", opportunity: "benefit", owners: ["content"],
    pass: "Product images have alt text.", fires: "Product images without alt.",
    validate: "img alt on product and collection pages.", action: "Add the product name as alt text.", doneWhen: "Every product image shows its product name as alt text." }),
  point({ id: "W-49", group: "web-a11y", title: "Form labels", severity: "low", opportunity: "risk", owners: ["dev"],
    pass: "Every input has a label.", fires: "Inputs without labels.",
    validate: "Inputs vs label/aria-label.", action: "Add a visible label or aria-label to every form input.", doneWhen: "All inputs labelled." }),
  point({ id: "W-50", group: "web-a11y", title: "Icon buttons named", severity: "low", opportunity: "risk", owners: ["dev"],
    pass: "Cart, menu and search icons have names.", fires: "Icon buttons with no accessible name.",
    validate: "Buttons/links without text or aria-label.", action: "Add aria-labels to the icon buttons.", doneWhen: "All icon buttons named." }),
];

// The 25-point slice that runs next to one tracking tool.
const WEBSITE_CODE_IDS = new Set(["W-01", "W-02", "W-03", "W-04", "W-07", "W-08", "W-09", "W-10", "W-11", "W-12", "W-13", "W-14", "W-15", "W-16", "W-21", "W-22", "W-23", "W-24", "W-25", "W-29", "W-30", "W-36", "W-40", "W-41", "W-44"]);
export const WEBSITE_CODE_CHECKLIST: ChecklistPoint[] = WEBSITE_CHECKLIST.filter(p => WEBSITE_CODE_IDS.has(p.id));

const ALL = [...GA4_CHECKLIST, ...GTM_CHECKLIST, ...WEBSITE_CHECKLIST];
export function checklistPoint(id: string): ChecklistPoint | undefined {
  return ALL.find(p => p.id === id);
}
