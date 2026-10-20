# Persona points proposal: store owner and media buyer

Draft for Omar's approval, 2026-10-20. Phase 0 of `ICP-REPORT-PLAN.md`.
**No checklist code has changed.** Once approved, session S0b turns these
lists into code.

## What this is

Two new checklists, one per persona, each with four sections of 25 points:
GA4, GTM, Website code, CRO. They replace today's single checklist for these
two readers. Manager, agency and requests with no role keep today's list.

Which sections a report uses depends on the access the visitor gives us
(same 50-point scale as today):

| Access shared | Sections in the report |
|---|---|
| GA4 and GTM | GA4 25 + GTM 25 |
| GA4 only | GA4 25 + Website code 25 |
| GTM only | GTM 25 + Website code 25 |
| Neither | Website code 25 + CRO 25 |

## How the points were chosen

1. **1,963 source points** from the CRO benchmark audits (5 stores), the
   DataHash agency audit, your Master Tracking Audit Checklist (203) and
   Framework note, merged into **402 unique points**.
2. Each of the 402 scored **for each persona** against the ICP cards and tool
   briefs: impact on that persona's goal, how easily they can get it fixed,
   and whether our tools can measure it.
3. Split into the four sections, then one agent per persona and section
   picked the **25 with the highest value to that persona**. Measurability was
   a pass/fail gate: a point we can't measure was dropped, never faked. The
   tool's current points competed on equal terms; they won only when they
   were the more valuable point.
4. Every point was rewritten in the persona's terms (title, pass, failure,
   action, who fixes it, done when, why it matters; the buyer's points also
   carry the ad effect).
5. **Duplicates removed across sections** that appear in the same report
   (store owner 13, media buyer 17), each concern kept in the section whose
   tool measures it best, and the free slots refilled from the pool.

## The two lists at a glance

**Store owner: "what's costing me sales, and let me fix it"**
- GA4 leads with money: the worst funnel step, checkout and cart drop-offs,
  product visits with no add to cart, phone vs desktop, and whether GA4's
  sales match real orders.
- CRO is mostly new (21 of 25), built from the store audits and the ICP1
  card's Elevr list: payment logos (mada, Apple Pay, Tabby, Tamara), delivery
  cost, the free-delivery threshold and the COD fee before checkout, WhatsApp
  on the phone, and Arabic product titles.
- Website code covers what breaks a sale: Add to cart that doesn't add, a
  cart that errors, a slow product page, WhatsApp links that don't work.
- GTM is the weakest section for this persona (see decision 1).

**Media buyer: "is it the ads or the site?"**
- GA4 answers "is the number real?" (more purchases than orders, zero or
  mixed-currency revenue, non-sales as key events) and "does paid traffic
  convert?" (paid campaigns with clicks and no sales, the paid funnel).
- GTM covers Meta, Snapchat, TikTok and Google: purchase fires once with
  value, currency and items; event_id dedupe for CAPI and Events API; click
  IDs (fbclid, ScCid, ttclid, gclid); Consent Mode v2 in the Gulf.
- Website code is what the live page sends: the same event from two setups,
  missing pixels, click IDs lost before the cart, and our own Add to Cart click
  checked against the cart.
- CRO is post-click: shipping cost before checkout, paid landing pages vs
  their conversion, advertised products that can't be bought, 404 landing pages.

## Cost to build

| | GA4 | GTM | Website code | CRO |
|---|---|---|---|---|
| Store owner: new GA4 queries | 7 | 0 | 0 | 0 |
| Media buyer: new GA4 queries | 12 | 0 | 0 | 6 |

Points marked 🆕 below need a GA4 query or calculation the worker doesn't run
yet. The buyer's are mostly the current GA4 facts filtered to paid traffic.
Every other point uses data the worker already collects (GA4 reports, the GTM
container, the store visit, the crawl), but each one still needs its check
written into the audit prompt.

## Decisions for you

1. **Store owner GTM.** The pool ran out of valuable GTM points for the owner:
   the 7 backfills after deduping are low-value developer points (scores
   31–42). (a) keep 25 as listed, or (b) cut owner GTM to 18 and give the
   GA4-and-GTM route 7 more GA4 points instead. Recommend (b).
2. **Media buyer weak tail.** GTM-22 to GTM-25 and CRO-23/24 are hygiene
   points that only made the list to fill 25. Same choice: keep, or shorten
   those sections.
3. **The ad itself.** We never see the ad, so "the landing page matches the ad
   promise" is measured only from GA4 (campaign × landing page) and the page's
   offer. A field on the form where the buyer pastes the ad text or coupon
   would let us check the real match and the "coupon on the ad vs price in
   cart" point from the Elevr list. Add it?
4. **Checkout stays out of reach.** We stop at the cart, so checkout-only points
   (guest checkout, payment step, purchase on the thank-you page) are judged
   from the GTM container and GA4 numbers only. Accept, or plan a test-order
   path for test-mode audits?
5. **Clarity (connector built 2026-10-20).** None of the 17 Clarity points in
   your Master Checklist can be checked through Clarity's Data Export API:
   they are about the Clarity setup itself (masking, consent, funnels, smart
   events, custom tags, Identify API, GA4/Ads integrations, project hygiene),
   which the API doesn't expose. What the API does give is shopper behaviour
   (dead clicks, rage clicks, quick-backs, script errors, scroll depth, bots,
   devices, in-app browsers, top pages), so the Clarity section below has 3
   new points per persona built on that. Shown only when the visitor connects
   Clarity, as an extra section outside the 50-point score. Checking the setup
   points would need someone logged into their Clarity dashboard.

## Known issues in the lists

- "Confirm with owner" is used on 3 store-owner CRO points (offers not shown on
  the storefront). The report must label these clearly, not mark them failed.
- Snap and TikTok click-ID and payload field names are written generically.
  Verify them against each platform's docs when coding the checks.
- SO-WC-21 (colour swatches) is a shopper-facing point that landed in Website
  code. It only appears in the no-access route next to CRO, so it can stay or
  swap with the next CRO point.
- Store-owner impact scores were capped at medium for every point (no GA4
  money in the source data), so owner ranking leans on the ICP card's rules
  more than on score gaps. Real audits will show which points actually fail.

## Files

- Point data: `icp/research/selected/<persona>-<section>.jsonl`
- Dedupe logs: `icp/research/selected/dedupe-store-owner.md`, `dedupe-media-buyer.md`
- Candidate pools and ranks: `icp/research/pools/`, `rank-*.tsv`
- Brief the agents followed: `icp/research/SELECT-BRIEF.md`

## Store owner (ICP1)


### GA4 — 25 points (7 need a new GA4 query · 21 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Why it matters | Sources |
|---|---|---|---|---|---|---|
| 1 | **The one step losing you the most sales** <br><small>SO-GA4-01</small> | critical | ga4_fact | owner, dev | Fixing the single worst step brings back the most sales for the least work. | EXIST-GA4-01, CHK-C-027 |
| 2 | **Shoppers who start checkout but don't pay** <br><small>SO-GA4-02</small> | critical | ga4_fact | owner | These people already chose to buy; every one lost here is a sale you almost had. | EXIST-GA4-04 |
| 3 | **Carts that never reach checkout** <br><small>SO-GA4-03</small> | critical | ga4_fact | owner, dev | People leave full carts when the cost or next step is unclear, so sales stop one click from checkout. | EXIST-GA4-03 |
| 4 | **Product visits that don't turn into add to cart** <br><small>SO-GA4-04</small> | critical | ga4_fact | content, owner | Most product visits end without a sale, so this step limits every sale after it. | EXIST-GA4-02 |
| 5 | **Phone shoppers buy less than desktop shoppers** <br><small>SO-GA4-05</small> | medium | ga4_fact | dev, owner | Most of your visitors are on phones, so a weak phone page holds back most of your sales. | EXIST-GA4-05 |
| 6 | **Your sales number in GA4 matches your real orders** <br><small>SO-GA4-06</small> | critical | ga4_fact 🆕 | dev | Every money figure in this report comes from this number; if it is wrong, you can't trust any of them. | EXIST-GA4-18, CHK-C-025, EXIST-GTM-02, CHK-A-045 |
| 7 | **GA4 is recording right now, with no sudden drops or jumps** <br><small>SO-GA4-07</small> | critical | ga4_fact 🆕 | dev | A tracking gap hides sales, and fake visits make your conversion rate look worse than it is. | EXIST-GA4-15, CHK-C-024, CHK-C-001 |
| 8 | **Every buying step is recorded** <br><small>SO-GA4-08</small> | critical | ga4_fact | dev | You can't find where sales are lost if a step of the path isn't recorded. | EXIST-GA4-17 |
| 9 | **Popular products that people view but don't add** <br><small>SO-GA4-09</small> | medium | ga4_fact | content, owner | Your most-viewed product that doesn't sell is where your visits are lost. | EXIST-GA4-10 |
| 10 | **Landing pages with visits but no sales** <br><small>SO-GA4-10</small> | medium | ga4_fact | owner, marketing | Visits that land on a page that doesn't sell are money spent with nothing back. | EXIST-GA4-06 |
| 11 | **Free-delivery threshold vs your average order** <br><small>SO-GA4-11</small> | medium | ga4_fact | owner | A threshold just above the usual order nudges shoppers to add one more item. | EXIST-GA4-11 |
| 12 | **Paid campaign that brings visits but no sales** <br><small>SO-GA4-12</small> | medium | ga4_fact | marketing, owner | Ad visits that never buy cost you money every day the campaign runs. | EXIST-GA4-07 |
| 13 | **Bringing buyers back** <br><small>SO-GA4-13</small> | medium | ga4_fact | owner, marketing | A past buyer is cheaper to sell to again than a new visitor. | EXIST-GA4-12 |
| 14 | **Tabby, Tamara or your payment page taking credit for sales** <br><small>SO-GA4-14</small> | medium | ga4_fact | marketing, owner | When payment pages take the credit, you can't see which ads and links really bring sales. | EXIST-GA4-19, CHK-A-010 |
| 15 | **Your own store domains showing as a traffic source** <br><small>SO-GA4-15</small> | medium | ga4_fact 🆕 | dev | When your own store shows as the source, sales from your ads and links are credited to yourself, so good campaigns look weak. | CHK-A-003 |
| 16 | **GA4 uses your currency and time zone** <br><small>SO-GA4-16</small> | medium | ga4_fact | owner | Money figures in the wrong currency or day make every sales number in the report harder to trust. | EXIST-GA4-22, CHK-A-001 |
| 17 | **Visits and sales with no known source** <br><small>SO-GA4-17</small> | medium | ga4_fact 🆕 | marketing, owner | If you can't see where sales come from, you can't put more into what works. | EXIST-GA4-08, CHK-A-040, CHK-B-036, CHK-B-039 |
| 18 | **Campaign tags survive redirects so GA4 credits the right source** <br><small>SO-GA4-18</small> | medium | browser | dev, owner | When the tags drop, sales from your ads show up as direct visits and good campaigns look weak. | CHK-B-038, CHK-B-040 |
| 19 | **Test and preview sites sending data into your real numbers** <br><small>SO-GA4-19</small> | medium | ga4_fact 🆕 | dev | Test orders and fake hosts add sales that never happened, so your revenue looks higher than it is. | CHK-A-019, CHK-C-006 |
| 20 | **Only real sales count as conversions** <br><small>SO-GA4-20</small> | medium | ga4_fact 🆕 | marketing, owner | When page views count as conversions, your conversion rate looks good while sales stay flat. | EXIST-GA4-20, CHK-A-015 |
| 21 | **What shoppers search for on your store** <br><small>SO-GA4-21</small> | low | ga4_fact | owner, dev | A shopper who searches knows what they want; a search with no result is a lost sale. | EXIST-GA4-13 |
| 22 | **Sales recorded per product** <br><small>SO-GA4-22</small> | low | ga4_fact 🆕 | dev | Without product sales, you can't tell which products to push, restock or drop. | CHK-C-026, CHK-C-030 |
| 23 | **Customer emails and phone numbers in GA4** <br><small>SO-GA4-23</small> | medium | ga4_fact | dev | Google can delete a property's data for this, and you would lose your sales history. | EXIST-GA4-24, CHK-A-008, CHK-A-009 |
| 24 | **Visits from countries you don't deliver to** <br><small>SO-GA4-24</small> | low | ga4_fact | marketing, owner | Visits from places you can't deliver to never become sales. | EXIST-GA4-09 |
| 25 | **Hours and days your store sells best** <br><small>SO-GA4-25</small> | low | ga4_fact | marketing, owner | Putting your budget and messages where shoppers buy gets more sales from the same spend. | EXIST-GA4-16 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **SO-GA4-01 The one step losing you the most sales**
  - Pass: Each step (product view to add to cart, add to cart to checkout, checkout to purchase) is at or above the tool's benchmark (8% / 50% / 50%).
  - Fails: One step is below its benchmark; the worst one, with the most lost sales, is named with its page.
  - How we check: Computed GA4 fact: run_report 28 days, dimensions=[eventName], metrics=[totalUsers] for view_item, add_to_cart, begin_checkout, purchase; compare each step with 8% / 50% / 50%; money = sessions at that step x gap x average order value, in the property currency.
  - Action: Start with the page behind the worst step. The page review below shows what your customers see there and what to change.
  - Done when: That step is within 10% of its benchmark over 14 days in GA4.
  - Selected because: Money-first headline finding straight from the owner's own GA4; CHK-C-027 is the same step-ratio check.
- **SO-GA4-02 Shoppers who start checkout but don't pay**
  - Pass: At least half of started checkouts end in a purchase.
  - Fails: Fewer than half of started checkouts are paid; add_shipping_info and add_payment_info show whether delivery or payment is where they stop.
  - How we check: Computed GA4 fact: run_report 28 days, metrics=[totalUsers] for begin_checkout, add_shipping_info, add_payment_info, purchase; name the sub-step with the biggest drop.
  - Action: Place one test order on your phone. Check that the delivery cost shows before the last step, cash on delivery and its fee are clear, mada, Apple Pay, Tabby or Tamara are offered, and no account is forced.
  - Done when: Each item on that list is checked and fixed or ruled out, and checkout to purchase is at 50% or more over 14 days.
  - Selected because: Highest-intent leak and it maps to GCC payment and COD fixes the owner can make in the admin.
- **SO-GA4-03 Carts that never reach checkout**
  - Pass: At least half of the people who add to cart start checkout.
  - Fails: Fewer than half of shoppers with a full cart start checkout.
  - How we check: Computed GA4 fact: run_report 28 days, metrics=[totalUsers] for add_to_cart and begin_checkout; our cart visit (browser) shows what the cart page shows on a phone.
  - Action: Fix what the cart review found: show the delivery cost and free-delivery threshold, payment options and a clear checkout button in the cart.
  - Done when: Cart to checkout is at 50% or more over 14 days.
  - Selected because: Core funnel fact, measurable today, fix sits in the owner's cart and delivery settings.
- **SO-GA4-04 Product visits that don't turn into add to cart**
  - Pass: At least 8 in 100 product viewers add to cart.
  - Fails: Fewer than 8 in 100 people who open a product add it to the cart.
  - How we check: Computed GA4 fact: run_report 28 days, metrics=[totalUsers] for view_item and add_to_cart.
  - Action: Fix the product page first named in this report: price, photos, Arabic title and description, delivery time and stock.
  - Done when: Add-to-cart rate from product views is up over 14 days in GA4.
  - Selected because: Top-of-funnel money step; fix is content the owner controls.
- **SO-GA4-05 Phone shoppers buy less than desktop shoppers**
  - Pass: Phone conversion is at least 60% of desktop conversion.
  - Fails: Phones convert at under 60% of desktop while most visits come from phones.
  - How we check: Computed GA4 fact: run_report 28 days, dimensions=[deviceCategory], metrics=[sessions,transactions]; phone screenshots from our headless visit show the page.
  - Action: Fix the phone issues the page review found on the worst step's page: Arabic layout, buttons, delivery and payment info on small screens.
  - Done when: Phone conversion is at 60% or more of desktop over 14 days.
  - Selected because: GCC traffic is mobile-heavy; the spec scores mobile and RTL gaps high.
- **SO-GA4-06 Your sales number in GA4 matches your real orders**
  - Pass: Purchase events equal transactions, no order ID is counted twice, and every purchase has a value and currency.
  - Fails: Purchases and transactions differ by over 10%, the same order ID appears more than once (thank-you page refresh), revenue is zero, or currency is missing.
  - How we check: Computed GA4 fact: run_report eventName=purchase metrics=[eventCount,transactions,purchaseRevenue]; new query: run_report 28 days dimensions=[transactionId] metrics=[eventCount] filtered to purchase, count IDs with more than one event.
  - Action: Ask your developer to send each order to GA4 once, with its order ID, value and currency.
  - Done when: Purchases equal transactions, no repeated order IDs, and GA4 revenue matches your store admin within 5% for the same days.
  - Selected because: Money numbers must be believable (ICP N2); duplicate order IDs are the same failure, now checked directly. Also holds the purchase value and currency concern from the removed SO-GTM-03.
- **SO-GA4-07 GA4 is recording right now, with no sudden drops or jumps**
  - Pass: Visitors show in realtime, and week-on-week visits have no unexplained fall or one-source spike.
  - Fails: No live users, visits fell over 40% week on week, or one day has a jump from one source or country with almost no engaged visits (likely bots).
  - How we check: Computed GA4 fact: run_realtime_report activeUsers; run_report sessions last 7 vs prior 7 days; new query: run_report 28 days dimensions=[date,sessionSource,country] metrics=[sessions,engagedSessions] to flag single-day spikes with near-zero engagement.
  - Action: If tracking stopped, ask your developer to check the last site or app change. If a spike is bots, have it excluded so your conversion rate shows real shoppers.
  - Done when: Realtime shows visitors, and the last 28 days have no unexplained cliff or bot spike.
  - Selected because: Without live, clean data no other finding holds; bot and volume-jump checks are the same stability question.
- **SO-GA4-08 Every buying step is recorded**
  - Pass: Product view, add to cart, begin checkout and purchase all record with believable counts.
  - Fails: A step is missing, or so low (under 30% of benchmark) that it is likely not recording.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[eventName] metrics=[eventCount] for view_item, add_to_cart, begin_checkout, purchase.
  - Action: Ask your developer, or your store's GA4 app, to send the missing step so you can see where shoppers stop.
  - Done when: All four steps show in GA4 with believable counts.
  - Selected because: Prerequisite for every funnel money figure; measurable today.
- **SO-GA4-09 Popular products that people view but don't add**
  - Pass: No much-viewed product adds to cart at far below your store average.
  - Fails: A product with many views adds to cart at under half your store average; it is named.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[pagePath,eventName] metrics=[eventCount] for view_item and add_to_cart; our headless visit opens that product.
  - Action: Fix that product page: price, photos, Arabic title, size or option info and stock. The page review checks this exact product.
  - Done when: That product's add-to-cart rate reaches your store average.
  - Selected because: Names a specific product the owner can fix in the product editor today.
- **SO-GA4-10 Landing pages with visits but no sales**
  - Pass: No high-traffic landing page converts at under a third of your store average.
  - Fails: A top landing page converts at under a third of your store average; it is named.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[landingPage] metrics=[sessions,conversions] ordered by sessions.
  - Action: Fix that page, or send your ads and links to a page that sells until it is fixed.
  - Done when: The page converts at half your store average or more, or no paid traffic lands on it.
  - Selected because: Named page, clear owner action, measurable today.
- **SO-GA4-11 Free-delivery threshold vs your average order**
  - Pass: A free-delivery threshold is shown on the store and sits a little above your average order value (1.1 to 1.6 times).
  - Fails: No free-delivery threshold is shown, or it sits below or far above your average order value.
  - How we check: Computed GA4 fact: purchaseRevenue / transactions for the average order value; the threshold is read from the live store pages and cart in our headless visit.
  - Action: In your store's delivery settings, set free delivery a little above your average order value and show it in the cart.
  - Done when: The threshold is set at 1.2 to 1.5 times your average order value and shows in the cart on a phone.
  - Selected because: GCC free-delivery lever scored high in the spec; owner sets it in the admin.
- **SO-GA4-12 Paid campaign that brings visits but no sales**
  - Pass: No paid campaign with real volume converts near zero.
  - Fails: A paid campaign brings many visits and almost no sales; it is named with its landing page.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[sessionCampaignName,sessionDefaultChannelGroup,landingPage] metrics=[sessions,conversions].
  - Action: Pause that campaign or point it to a page that sells.
  - Done when: The campaign is paused, or its conversion rate is up after the change.
  - Selected because: Direct waste the owner can stop; measurable from GA4 without ad accounts.
- **SO-GA4-13 Bringing buyers back**
  - Pass: Returning visitors convert at 2 times new visitors or more, or the store already collects WhatsApp numbers or emails.
  - Fails: Returning visitors convert at under 2 times new visitors and the store has no WhatsApp or email signup.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[newVsReturning] metrics=[sessions,conversions]; our headless visit looks for a WhatsApp or email signup.
  - Action: Add a WhatsApp or email signup with a first-order offer, and send a message after each purchase.
  - Done when: The signup is live on the store and the returning-visitor share rises month on month.
  - Selected because: Retention is a top ICP1 pain; WhatsApp is their channel.
- **SO-GA4-14 Tabby, Tamara or your payment page taking credit for sales**
  - Pass: No payment provider, bank or payment gateway shows as a traffic source.
  - Fails: tabby, tamara, a bank or a payment gateway shows as a source, so orders are credited to it instead of the ad or link that brought the buyer.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[sessionSource,sessionMedium] metrics=[sessions,conversions]; match sources against the gateway list.
  - Action: In GA4, add those domains to the unwanted referrals list of your web data stream.
  - Done when: They no longer appear as traffic sources in GA4.
  - Selected because: Common GCC failure (BNPL redirects) with a one-step owner fix.
- **SO-GA4-15 Your own store domains showing as a traffic source**
  - Pass: None of the store's own domains or subdomains (www, shop, checkout or the platform's store domain) appears as a referral source, and no sales are credited to them.
  - Fails: The store's own domain or checkout subdomain shows as a referral source with visits or sales, so one visit is split in two and the sale loses the ad or link that brought the shopper.
  - How we check: New GA4 fact: run_report 28 days dimensions=[sessionSource,sessionMedium] metrics=[sessions,conversions,purchaseRevenue] filtered to medium=referral; match sources against the store's own domains from the crawl and the hostName report; report the share of sales credited to self-referrals.
  - Action: Ask your developer to set up cross-domain measurement in the GA4 data stream for all your store domains, and add them to the unwanted referrals list.
  - Done when: Your own domains no longer appear as traffic sources in GA4.
  - Selected because: Backfill for removed SO-GA4-09: highest-impact unused GA4 candidate, scoped to self-referrals that GA4 data shows directly (we never visit checkout).
- **SO-GA4-16 GA4 uses your currency and time zone**
  - Pass: The GA4 property currency and time zone match the country most of your sales come from.
  - Fails: Currency or time zone doesn't match your main market, so revenue shows in the wrong currency and daily sales don't line up with your store admin.
  - How we check: Computed GA4 fact: get_property (currencyCode, timeZone) compared with the top country by sessions and purchases.
  - Action: In GA4 property settings, set the currency and time zone to your store's market.
  - Done when: Property settings show your store's currency and time zone.
  - Selected because: Directly decides whether the money number is in the store's currency (ICP rule).
- **SO-GA4-17 Visits and sales with no known source**
  - Pass: Unassigned and (not set) are under 10% of visits, and campaign names in GA4 are clean (no broken or placeholder values).
  - Fails: Over 10% of visits have no known source, or links carry broken or mixed-case campaign tags that GA4 can't sort.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[sessionDefaultChannelGroup] metrics=[sessions]; new check: run_report dimensions=[sessionSource,sessionMedium,sessionCampaignName] to flag placeholder text, encoded characters and case variants of the same source.
  - Action: Add simple, lowercase campaign tags to every ad, Instagram bio, WhatsApp and SMS link.
  - Done when: Unassigned visits are under 5% in GA4 and no broken campaign names appear.
  - Selected because: Measurable today; merges four candidates that all measure unknown or misfiled sources.
- **SO-GA4-18 Campaign tags survive redirects so GA4 credits the right source**
  - Pass: A link with campaign tags keeps them through any redirect, and links inside the store carry no campaign tags.
  - Fails: A redirect (http to https, www, language page) drops the campaign tags, or banners and menu links inside the store carry campaign tags that overwrite the real source.
  - How we check: Browser: open the home page with test utm_ parameters on phone and desktop and check the page_location of the first GA4 page_view after redirects still has them. Crawl: scan internal links on home, collection, product and cart for utm_ parameters.
  - Action: Remove campaign tags from links inside your store; ask your developer to keep the tags through redirects.
  - Done when: Our re-visit shows the tags kept after redirects and no internal links with campaign tags.
  - Selected because: Both checkable from our visit and crawl; they are one question: does the store keep the real source.
- **SO-GA4-19 Test and preview sites sending data into your real numbers**
  - Pass: Only your real store domain(s) send visits and purchases to this GA4 property.
  - Fails: Preview, staging, theme-editor, localhost or unknown hostnames send visits or test purchases into the live numbers.
  - How we check: New GA4 fact: run_report 28 days dimensions=[hostName] metrics=[sessions,transactions,purchaseRevenue]; flag hostnames that are not the store's domains seen in the crawl.
  - Action: Ask your developer to stop test and preview sites from sending to this GA4 property, and to filter out unknown hostnames.
  - Done when: Only your store's domains appear in the hostname report.
  - Selected because: Turns two hard-to-check candidates into one GA4 hostname query that directly protects the sales number.
- **SO-GA4-20 Only real sales count as conversions**
  - Pass: purchase is a key event, no noise events (page view, scroll, session start) are, and no key event has recorded nothing in the period.
  - Fails: purchase is not a key event, noise events are marked as key events, or a key event has no data.
  - How we check: Computed GA4 fact: list_key_events; new check: run_report 90 days dimensions=[eventName] metrics=[eventCount] to flag key events with zero count.
  - Action: In GA4, mark purchase as a key event and unmark page view, scroll and anything that isn't a sale or lead.
  - Done when: The key events list shows only real sales and leads, each with data.
  - Selected because: Tested; decides whether the conversion rate the owner reads is real.
- **SO-GA4-21 What shoppers search for on your store**
  - Pass: Search is visible on phones and searches are recorded in GA4.
  - Fails: Shoppers search but search is hidden on phones, or searches aren't recorded so nobody sees what they look for.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[searchTerm] metrics=[eventCount]; our phone visit checks the search icon in the header.
  - Action: Show search in the phone header and make sure your top searched words, Arabic and English, return products.
  - Done when: Search shows in the phone header and the top 5 searched words return products.
  - Selected because: Owner-fixable, gives real customer demand from their own data.
- **SO-GA4-22 Sales recorded per product**
  - Pass: Purchased items carry product names, and item revenue adds up to order revenue within 5%.
  - Fails: Item names show as (not set), or item revenue doesn't add up to order revenue, so you can't see which products sell.
  - How we check: New GA4 fact: run_report 28 days dimensions=[itemName] metrics=[itemRevenue,itemsPurchased]; share of (not set) item rows; compare total itemRevenue with purchaseRevenue for the same period.
  - Action: Ask your developer to send each purchased product's name, ID, price and quantity with the order.
  - Done when: Product names show in GA4's items report and item revenue adds up to order revenue within 5%.
  - Selected because: Product-level sales are an owner decision tool; both candidates measure the same item data.
- **SO-GA4-23 Customer emails and phone numbers in GA4**
  - Pass: No email addresses or phone numbers appear in page addresses sent to GA4.
  - Fails: Emails or phone numbers appear in page paths or URL parameters sent to GA4.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[pagePath,pageLocation] scanning for @, %40, email=, phone=, mobile= and long digit strings.
  - Action: Ask your developer to remove personal data from page addresses, and turn on email and URL redaction in the GA4 data stream.
  - Done when: No emails or phone numbers appear in page paths.
  - Selected because: Protects the owner's whole data history; redaction candidates are the fix for the same failure.
- **SO-GA4-24 Visits from countries you don't deliver to**
  - Pass: Countries with a real share of visits also produce sales.
  - Fails: Countries with a real share of visits and no sales; they are named.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[country] metrics=[sessions,conversions].
  - Action: Exclude those countries from your ad targeting, or add delivery to them if you want those buyers.
  - Done when: Paid visits from those countries are close to zero, or they start to produce sales.
  - Selected because: Simple waste check with a clear owner action; measurable today.
- **SO-GA4-25 Hours and days your store sells best**
  - Pass: Conversion is about even across the day and week, or your ads and messages already follow the best times.
  - Fails: Some hours or days convert far better than others, with enough visits to act on.
  - How we check: Computed GA4 fact: run_report 28 days dimensions=[dayOfWeek,hour] metrics=[sessions,conversions].
  - Action: Run more of your ads, offers and WhatsApp messages in the hours and days that sell best.
  - Done when: Your ad schedule and message times match the best hours and days.
  - Selected because: Owner-actionable timing insight from their own data; beats ad-side admin points for this reader.

</details>

### GTM — 25 points (0 need a new GA4 query · 17 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Why it matters | Sources |
|---|---|---|---|---|---|---|
| 1 | **Purchase tags fire once, only on the real purchase** <br><small>SO-GTM-01</small> | critical | gtm_read | dev | Double-counted orders make your sales and conversion rate look higher than the money in your bank. | EXIST-GTM-01, EXIST-GTM-07, CHK-A-078, CHK-A-047 |
| 2 | **Shopify checkout and orders are tracked** <br><small>SO-GTM-02</small> | critical | gtm_read | dev | If checkout and orders are not recorded, GA4 cannot show your real sales or where shoppers drop out of checkout. | EXIST-GTM-21 |
| 3 | **Consent settings do not hide your Gulf visitors** <br><small>SO-GTM-03</small> | medium | gtm_read | dev | Visits and orders blocked by consent disappear from your reports, so your sales look lower than they are. | EXIST-GTM-25, CHK-B-022, CHK-B-030 |
| 4 | **Add to cart is counted once in tracking for each real add** <br><small>SO-GTM-04</small> | medium | browser | dev | A wrong add-to-cart count hides whether your product pages or your cart are losing the sale. | EXIST-GTM-24 |
| 5 | **Each ad pixel is installed once, not twice** <br><small>SO-GTM-05</small> | medium | browser | dev, owner | Double-sent sales make your ads look better than they are, so you may spend more on ads that do not sell. | CHK-A-042 |
| 6 | **Purchase tag set up for every ad platform you pay for** <br><small>SO-GTM-06</small> | medium | gtm_read | dev | An ad platform that never sees your sales cannot find more buyers like them. | EXIST-GTM-04 |
| 7 | **WhatsApp and call clicks are counted** <br><small>SO-GTM-07</small> | medium | gtm_read | dev | Shoppers who order through WhatsApp look like lost visitors, so you cannot see which pages and ads bring them. | EXIST-GTM-11, CHK-B-048 |
| 8 | **Your data goes to your own GA4 only** <br><small>SO-GTM-08</small> | medium | gtm_read | dev | Sales sent to another property are missing from your reports, and someone else can see your sales. | EXIST-GTM-10 |
| 9 | **Ad pixel loads before its events** <br><small>SO-GTM-09</small> | medium | gtm_read | dev | Lost events mean your ad platforms see fewer sales than you made. | CHK-A-055, CHK-A-067 |
| 10 | **Meta does not count the same sale twice** <br><small>SO-GTM-10</small> | medium | gtm_read | dev | Without a matching id Meta can count one sale twice or miss it, so you cannot trust Meta's sales number. | EXIST-GTM-03, CHK-A-054 |
| 11 | **Each ad platform gets your sales on one pixel ID** <br><small>SO-GTM-11</small> | medium | gtm_read | dev, marketing | When sales are split across two pixels, each ad account sees fewer sales than you made and spends less well. | CHK-A-044 |
| 12 | **Google Ads sees your sales** <br><small>SO-GTM-12</small> | medium | gtm_read | dev | Google Ads can only find more buyers if it sees which clicks became sales. | EXIST-GTM-05 |
| 13 | **Key tags fire on store events, not on how buttons look** <br><small>SO-GTM-13</small> | low | gtm_read | dev | Tags tied to how a button looks stop counting the day you change or update your theme. | CHK-A-046 |
| 14 | **Newsletter and contact form sign-ups are counted** <br><small>SO-GTM-14</small> | medium | gtm_read | dev | You can only grow your WhatsApp and email list if you see which pages and ads bring sign-ups. | EXIST-GTM-12, CHK-C-017 |
| 15 | **Ad click IDs are saved so ad platforms can match sales** <br><small>SO-GTM-15</small> | low | browser | dev | When the click is not stored, sales show up as unknown, and you cannot tell which ads sell. | EXIST-GTM-14 |
| 16 | **Ad and analytics tags don't send plain customer emails or phone numbers** <br><small>SO-GTM-16</small> | medium | gtm_read | dev | Sending customer details in plain text puts your customers' trust and your accounts at risk. | EXIST-GTM-18, CHK-B-025, CHK-B-027, CHK-B-026 |
| 17 | **Your latest tracking fixes are actually live** <br><small>SO-GTM-17</small> | low | gtm_read | dev | A fix that was never published never reaches your reports. | CHK-A-076 |
| 18 | **No unknown scripts running on your store** <br><small>SO-GTM-18</small> | medium | gtm_read | dev | Unknown scripts can break your pages or collect your customers' data without you knowing. | EXIST-GTM-19, CHK-A-063 |
| 19 | **Pages that change without reloading are still counted** <br><small>SO-GTM-19</small> | low | gtm_read | dev | Pages and products that are not counted vanish from your funnel and product reports. | CHK-A-057, CHK-C-014 |
| 20 | **Old agency and campaign tags removed** <br><small>SO-GTM-20</small> | low | gtm_read | dev | Old tags slow your store and keep sending your data to people you stopped working with. | EXIST-GTM-20, CHK-A-060 |
| 21 | **Your team's visits are kept out of sales numbers** <br><small>SO-GTM-21</small> | low | gtm_read | dev | Your own visits make conversion rate and product views look different from what customers do. | EXIST-GTM-23, CHK-A-073 |
| 22 | **Triggers don't depend on switched-off settings** <br><small>SO-GTM-22</small> | low | gtm_read | dev | A tag that silently never fires is a step or sale you never see. | CHK-A-072 |
| 23 | **Consent banner works before and after the choice** <br><small>SO-GTM-23</small> | low | gtm_read | dev | A banner that does not work exposes you to complaints from customers in regions that require consent. | EXIST-GTM-16, EXIST-GTM-17, CHK-B-023, CHK-A-056 |
| 24 | **Session recordings installed to check your fixes** <br><small>SO-GTM-24</small> | low | browser | dev | Recordings let you see whether a fix helped shoppers, not just guess. | EXIST-GTM-15, CHK-A-062, CHK-A-079 |
| 25 | **Visits to missing pages are recorded** <br><small>SO-GTM-25</small> | low | browser | dev | Ads and WhatsApp links that land on a missing page lose the sale; tracking them shows which links to fix. | CHK-C-015 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **SO-GTM-01 Purchase tags fire once, only on the real purchase**
  - Pass: Every purchase and conversion tag fires on the dataLayer purchase event only, sends transaction_id, and has no extra trigger (no thank-you URL page view, no All Pages trigger, no trigger group missing a condition).
  - Fails: A purchase tag fires on a thank-you page URL, so reloading or revisiting that page counts the order again; or a conversion tag is tied to a broad trigger and fires on unrelated pages.
  - How we check: GTM read: for each purchase/conversion tag, list its firing triggers; fail if any is a page-view trigger with a thank-you/order URL filter, an All Pages trigger, or a trigger group without the purchase event condition; fail if transaction_id is not sent.
  - Action: Have your developer fire purchase tags only on the purchase event and send the order number with it.
  - Done when: Every purchase tag in GTM has one trigger on the purchase event and sends transaction_id.
  - Selected because: An inflated order count makes every money number in the report untrustworthy for the owner.
- **SO-GTM-02 Shopify checkout and orders are tracked**
  - Pass: The store is not on Shopify, or begin_checkout and purchase come from a Shopify Customer Events pixel or the native Google and YouTube integration.
  - Fails: A Shopify store relies on GTM tags for checkout and purchase, but GTM does not run inside Shopify checkout, so those steps are missing or partial.
  - How we check: Platform from the crawl and headless visit; GTM read for begin_checkout and purchase tags and their triggers; headless visit for the Shopify web-pixels / Customer Events sandbox scripts. Fail on Shopify when checkout/purchase depend on GTM tags only.
  - Action: On Shopify, have your developer send checkout and purchase from a custom pixel in Settings > Customer events, or the native Google integration.
  - Done when: Checkout and purchase events come from a Customer Events pixel or the native integration, not from GTM tags alone.
  - Selected because: A common Shopify gap that removes the last and most valuable funnel steps.
- **SO-GTM-03 Consent settings do not hide your Gulf visitors**
  - Pass: Consent defaults are set per region, or the consent banner applies only where required, so visits from GCC markets are recorded normally.
  - Fails: All tags are denied by default for every region, including markets with no such requirement, so many visits and sales are never recorded.
  - How we check: GTM read: consent default tag parameters (region list, ad_storage, analytics_storage); headless visit without clicking the banner: decode the gcs/gcd parameter on GA4 hits to see whether storage is denied.
  - Action: Have your developer set consent defaults per region so visitors in your markets are counted.
  - Done when: Consent default lists the regions that need it, and our visit from a GCC location sends GA4 hits with storage granted.
  - Selected because: An over-strict banner removes real GCC sales from the owner's numbers.
- **SO-GTM-04 Add to cart is counted once in tracking for each real add**
  - Pass: Our real Add-to-Cart click on a product page produced one add_to_cart event, including from a cart drawer or quick add.
  - Fails: Add to cart fires only on a form submit or page change, so drawer and quick adds are not counted; or it fires on the click even when nothing was added.
  - How we check: Headless phone visit: click Add to Cart on one product, confirm the cart count changed, and check the dataLayer and network for exactly one add_to_cart hit; GTM read for the add_to_cart trigger type.
  - Action: Have your developer trigger add to cart from your theme's own add-to-cart event, not from a click or a page change.
  - Done when: A test add to cart on phone produces one add_to_cart event and the cart shows the item.
  - Selected because: Directly measured on the live store; decides which page the owner fixes first.
- **SO-GTM-05 Each ad pixel is installed once, not twice**
  - Pass: Each ad pixel (Meta, Snapchat, TikTok, Google) loads from one source only: a store app, GTM, or code, not two or three at once.
  - Fails: The same pixel is added by a Salla, Zid or Shopify app and again through GTM or pasted code, so page views, add to carts and purchases are sent twice.
  - How we check: Headless visit of home, product and cart: count base-pixel loads and event hits per pixel ID in the network log; compare with pixel tags in the GTM read. Fail if one pixel ID loads from more than one source or sends duplicate events for one action.
  - Action: Pick one way to install each pixel (the store's app or GTM) and remove the other; you can switch off the app integration yourself, the GTM tag needs your developer.
  - Done when: Our re-scan sees each pixel ID load once and send one event per action.
  - Selected because: Tested in audits, failed on 2 of 3 stores; the owner can fix part of it in the admin.
- **SO-GTM-06 Purchase tag set up for every ad platform you pay for**
  - Pass: Every paid channel that brings traffic (Meta, Snapchat, TikTok) has a purchase event tag in GTM with an active purchase trigger, or its purchases come from the store-app integration.
  - Fails: GA4 shows paid traffic from Snapchat, TikTok or Meta, but GTM has no purchase tag for that platform and no store-app integration sends it.
  - How we check: GA4 report: paid channels by source; GTM read: for each paying platform, a purchase event tag with an active purchase trigger. Live pixel loading and page-view/add-to-cart firing is checked in the website section, not here.
  - Action: Have your developer add a purchase event for the missing platform's pixel.
  - Done when: Each platform sending paid visits has a purchase tag with an active trigger in GTM, or a store-app integration that sends purchases.
  - Selected because: Ties tracking to ad money the owner already spends.
- **SO-GTM-07 WhatsApp and call clicks are counted**
  - Pass: Clicks on WhatsApp and phone links fire an event, or the store has no such links.
  - Fails: The store shows a WhatsApp or call button but no tag records the click, so orders that start in WhatsApp are invisible.
  - How we check: Headless visit lists wa.me, api.whatsapp.com and tel: links; GTM read for link-click triggers on those URLs and the event they send. Fail if links exist and no tag tracks them.
  - Action: Have your developer track WhatsApp and call button clicks as an event in GTM.
  - Done when: A click on the WhatsApp button sends an event, visible in our re-scan.
  - Selected because: WhatsApp is a main sales channel for GCC stores and is usually untracked.
- **SO-GTM-08 Your data goes to your own GA4 only**
  - Pass: Every GA4 tag uses one constant variable holding the store's own measurement ID.
  - Fails: Old or hard-coded IDs send visits and sales to another GA4 property, such as one from a past agency.
  - How we check: GTM read: collect every G- ID in tags and variables; headless visit: list G- IDs in GA4 hits. Fail if any ID is not the store's connected property.
  - Action: Have your developer keep one GA4 ID in one variable and remove the others.
  - Done when: Only your own GA4 ID appears in GTM and in our visit.
  - Selected because: Split data hides part of the owner's sales.
- **SO-GTM-09 Ad pixel loads before its events**
  - Pass: Each pixel's base tag loads before its event tags (by tag sequencing or priority), so add-to-cart and purchase events are received.
  - Fails: Event tags fire before the base pixel is ready, so some add-to-cart or purchase events are lost.
  - How we check: GTM read: setup-tag sequencing and firing priority on pixel event tags; headless visit: order of base-pixel load and event hits in the network log.
  - Action: Have your developer set each pixel's base tag to load before its event tags.
  - Done when: Every pixel event tag has the base tag as its setup tag, and our visit sees the base load first.
  - Selected because: Tested in audits, failed on 2 of 3 stores; causes sales to go missing in ad platforms.
- **SO-GTM-10 Meta does not count the same sale twice**
  - Pass: The Meta Purchase event fires with an event_id that can match a server event, or Meta is not used.
  - Fails: The Meta pixel is present without a Purchase event, or without an event_id, so Meta cannot match browser and server sales.
  - How we check: GTM read: Meta pixel tags (Custom HTML or template) and their event name and eventID parameters; headless visit: event_id present on Meta hits we can trigger (view content, add to cart).
  - Action: Have your developer send Purchase to Meta with an order-based event_id, and use the same id in the Conversions API if you use it.
  - Done when: The Meta Purchase tag in GTM sends an event_id.
  - Selected because: Meta is the main paid channel for GCC stores.
- **SO-GTM-11 Each ad platform gets your sales on one pixel ID**
  - Pass: Each ad platform (Meta, Snapchat, TikTok, Google Ads) uses one pixel or conversion ID, kept in one constant variable that all its tags read.
  - Fails: Two different pixel IDs for the same platform fire together, or one platform's tags use different hard-coded IDs, so your sales are split across pixels and each sees only part of them.
  - How we check: GTM read: collect pixel and conversion IDs from every Meta, Snapchat, TikTok and Google Ads tag and variable; group by platform; fail if a platform has more than one active ID or IDs are typed into tags instead of read from one variable.
  - Action: Confirm with whoever runs your ads which pixel ID is yours, and have your developer use only that one, from one variable.
  - Done when: Each platform has one ID in GTM, read from one variable.
  - Selected because: Backfill: next most valuable measurable GTM candidate; covers ad pixel IDs (SO-GTM-08 covers the GA4 ID only).
- **SO-GTM-12 Google Ads sees your sales**
  - Pass: When Google Ads traffic exists, a Google Ads conversion tag and the Conversion Linker are present (or GA4 conversions are imported), with enhanced conversions on.
  - Fails: GA4 shows Google Ads traffic but there is no conversion tag or linker, or enhanced conversions are off.
  - How we check: GA4 report: google / cpc sessions; GTM read: awct and Conversion Linker tags and the enhanced conversions setting on the tag.
  - Action: Have your developer add the Google Ads purchase tag and the Conversion Linker, with enhanced conversions.
  - Done when: GTM has a Google Ads purchase tag and Conversion Linker, both with active triggers.
  - Selected because: Relevant when the owner pays for Google Ads, shown only then.
- **SO-GTM-13 Key tags fire on store events, not on how buttons look**
  - Pass: Tags for checkout, WhatsApp, sign-up and other key actions fire on dataLayer events or link addresses, not on CSS classes, element IDs or button text.
  - Fails: Triggers depend on CSS classes, element IDs or button text, so a theme update or redesign stops them firing without anyone noticing.
  - How we check: GTM read: for each active tag on a shopping or contact action (add to cart has its own point), list trigger types and conditions; flag Click or Element Visibility triggers matching on Click Classes, Click ID, CSS selectors or Click Text.
  - Action: Have your developer switch these triggers to the store's own events so they keep working after theme changes.
  - Done when: No key-action tag in GTM relies on a CSS class, element ID or button text.
  - Selected because: Backfill: theme changes are common on Salla, Zid and Shopify stores; fully readable from the container.
- **SO-GTM-14 Newsletter and contact form sign-ups are counted**
  - Pass: When the store has an email, phone or WhatsApp sign-up form, one tag sends sign_up or generate_lead when the form is sent successfully.
  - Fails: The store collects emails or phone numbers and no tag records it, or the tag fires on every submit click (including failed ones), or two tags count the same form.
  - How we check: Crawl and headless visit list sign-up and contact forms on home, product and footer (we do not submit them); GTM read: tags sending sign_up, generate_lead or form events, their triggers (form submit with a success check, or a dataLayer event) and duplicate tags for the same form.
  - Action: Have your developer send a sign-up event when a customer leaves an email or number on your store.
  - Done when: GTM has one active sign-up tag per form, firing only on a successful submit.
  - Selected because: Backfill: current-tool point merged with form tracking (same check); ties to the owner's WhatsApp and email list.
- **SO-GTM-15 Ad click IDs are saved so ad platforms can match sales**
  - Pass: Ad click IDs (gclid, fbclid, ttclid, ScCid) are stored when a shopper lands from an ad.
  - Fails: Paid visitors arrive with click IDs and nothing stores them, so the sale cannot be tied back to the ad.
  - How we check: Headless visit to a product page with test gclid, fbclid and ttclid parameters added to the URL; check first-party cookies (_gcl_aw, _fbc, _ttp or similar) after load; GTM read for the Conversion Linker and URL-parameter variables.
  - Action: Have your developer add the Conversion Linker and store ad click IDs in first-party cookies.
  - Done when: Our test visit with click IDs leaves matching first-party cookies.
  - Selected because: Lets the owner see which ads bring sales.
- **SO-GTM-16 Ad and analytics tags don't send plain customer emails or phone numbers**
  - Pass: No raw email, phone or name in tag parameters or in the dataLayer variables tags read; any customer data a platform asks for is hashed and sent only with consent.
  - Fails: Email or phone is sent as plain text in a tag parameter, often in hand-built pixel advanced matching.
  - How we check: GTM read: scan tag parameters and dataLayer variables used by tags for email or phone fields and hashing settings. Personal data in page addresses is checked in GA4, not here.
  - Action: Have your developer remove plain customer details from tags and URLs, or hash them where the platform requires it.
  - Done when: No plain email or phone appears in any GTM tag parameter.
  - Selected because: A real risk the owner is responsible for, kept as one merged privacy point.
- **SO-GTM-17 Your latest tracking fixes are actually live**
  - Pass: The container version the live store loads is the latest published version, and no finished changes sit unpublished in the workspace.
  - Fails: The live site loads an older container version, or fixes sit in the workspace and were never published, so the store still runs the old tracking.
  - How we check: GTM read: latest published version number and date, and workspace status (pending changes); crawl: fetch the live gtm.js for the container and read its version; fail if they differ or the workspace has pending tag, trigger or variable changes.
  - Action: Ask your developer to publish finished changes and confirm the live store loads the new version.
  - Done when: The live gtm.js version equals the latest published version and the workspace has no pending changes.
  - Selected because: Backfill: measurable from the container read plus one crawl; catches fixes that never went live.
- **SO-GTM-18 No unknown scripts running on your store**
  - Pass: Every Custom HTML tag has a known purpose and owner, and official tag templates are used where they exist.
  - Fails: Custom HTML tags load scripts from unknown vendors, or hand-pasted pixel code is used where an official template exists and breaks without notice.
  - How we check: GTM read: list Custom HTML tags, the domains their scripts load, and whether an official template exists for that vendor; headless visit: domains loaded by GTM.
  - Action: Have your developer remove scripts no one recognises and switch hand-pasted pixels to official templates.
  - Done when: Every Custom HTML tag in GTM has a named purpose, and known pixels use official templates.
  - Selected because: A risk the owner can ask about and verify.
- **SO-GTM-19 Pages that change without reloading are still counted**
  - Pass: If the store changes pages without a full reload, a page view fires on each change and old product data is cleared; or the store reloads on every page.
  - Fails: The store changes pages without reloading, but GTM fires only on the first load, so later pages and products viewed are not counted.
  - How we check: Headless visit: move from home to collection to product by tapping links and note whether the document reloads or the address changes by script; when it changes by script, check for one page_view per change; GTM read for History Change triggers and ecommerce clearing.
  - Action: Have your developer add page-change triggers in GTM if your store loads pages without reloading.
  - Done when: Each page change in our visit sends one page view.
  - Selected because: Backfill: two candidates measuring the same history-change setup merged; only applies to stores that load pages by script.
- **SO-GTM-20 Old agency and campaign tags removed**
  - Pass: No paused tags, tags with no trigger, or pixels from past vendors and ended campaigns.
  - Fails: Tags from a past agency or old campaigns still load on every visit, slowing pages and sending your data to vendors you no longer use.
  - How we check: GTM read: paused flag, tags without firing triggers, vendor names and IDs not matching current platforms; headless visit: requests to those vendors.
  - Action: Have your developer delete dead and past-vendor tags.
  - Done when: GTM has no paused, trigger-less or past-vendor tags.
  - Selected because: Easy cleanup with a speed and data-risk effect the owner understands.
- **SO-GTM-21 Your team's visits are kept out of sales numbers**
  - Pass: A traffic_type parameter, IP rule or logged-in-staff exception marks your team's own visits.
  - Fails: Nothing marks the team's visits, so your own browsing and test orders mix with real customers.
  - How we check: GTM read: traffic_type parameter on the Google tag, or a blocking exception for staff or admin sessions.
  - Action: Have your developer mark your team's visits so GA4 can leave them out.
  - Done when: The Google tag sends traffic_type for team visits, or staff sessions are blocked.
  - Selected because: Small, clean fix that makes the owner's numbers truer.
- **SO-GTM-22 Triggers don't depend on switched-off settings**
  - Pass: Every built-in variable a trigger or tag uses (Page URL, Click URL, Click Text, Form ID and so on) is turned on in the container.
  - Fails: A trigger uses a built-in variable that is turned off, so its tag never fires as intended.
  - How we check: GTM read: list enabled built-in variables and every {{variable}} reference in triggers and tags; fail on references to built-ins that are not enabled.
  - Action: Have your developer turn on the built-in variables your triggers use.
  - Done when: No trigger or tag references a disabled built-in variable.
  - Selected because: Backfill: fully readable from the container; low value but it decides whether tags fire.
- **SO-GTM-23 Consent banner works before and after the choice**
  - Pass: Where a consent banner is used, the consent default fires on Consent Initialization before any tag, and marketing tags require ad_storage consent.
  - Fails: The consent default is missing or loads late, or pixels fire with no consent check, so the banner has no real effect.
  - How we check: GTM read: consent tag trigger (Consent Initialization - All Pages) and each marketing tag's consent settings; headless visit: whether pixel hits are sent before any banner choice.
  - Action: Have your developer load consent defaults first and link marketing tags to consent.
  - Done when: Consent default runs on Consent Initialization and each marketing tag lists its consent requirement.
  - Selected because: Kept as one low point; matters mainly for stores selling outside the GCC.
- **SO-GTM-24 Session recordings installed to check your fixes**
  - Pass: Microsoft Clarity or Hotjar is installed and its script actually loads on the live store.
  - Fails: No recording tool, or a tag set up in GTM that never loads on the live site.
  - How we check: GTM read for Clarity or Hotjar tags; crawl and headless visit for their script requests on live pages. We only check that it loads; we do not read its data.
  - Action: Install Microsoft Clarity (free) through GTM or your store's app so you can watch how shoppers use the pages you fix.
  - Done when: Our re-scan sees the recording script load on home and product pages.
  - Selected because: Tested in audits, failed on 3 of 4 stores; helps the owner confirm fixes.
- **SO-GTM-25 Visits to missing pages are recorded**
  - Pass: Visits to a not-found page send an event (or a page title GA4 can filter) with the page address and where the visitor came from.
  - Fails: Not-found visits look like normal page views, so dead links in ads, posts and messages go unseen.
  - How we check: Headless visit to a made-up address on the store: check whether a page_view with a not-found title or a dedicated error event is sent; GTM read for a 404 trigger or tag.
  - Action: Have your developer send a not-found event with the page address and referrer.
  - Done when: Our visit to a missing page sends a not-found event.
  - Selected because: Backfill: measurable in one headless visit; pairs with the website section's dead-link check without measuring the same thing.

</details>

### Website code — 25 points (0 need a new GA4 query · 20 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Why it matters | Sources |
|---|---|---|---|---|---|---|
| 1 | **Add to cart actually adds the product** <br><small>SO-WC-01</small> | critical | browser | dev | If the button does not add the product, every customer who decided to buy leaves without an order. | EXIST-W-01 |
| 2 | **The cart opens without errors** <br><small>SO-WC-02</small> | critical | browser | dev | Customers who reach the cart already chose to buy; an error here loses them at the last step we can see. | EXIST-W-02, CHK-B-065 |
| 3 | **Product page shows fast on phones** <br><small>SO-WC-03</small> | critical | browser | dev, owner | A product page that shows late loses visitors before they see the price or the Add to cart button. | EXIST-W-09, UX-004 |
| 4 | **WhatsApp and call links use a number that works** <br><small>SO-WC-04</small> | critical | browser | owner | Many GCC customers ask on WhatsApp before they order; a broken link sends those orders away. | EXIST-W-07 |
| 5 | **Google can show your products and collections** <br><small>SO-WC-05</small> | critical | crawl | owner, dev | Blocked pages get no free visits from Google, so you pay for every visitor through ads. | EXIST-W-36 |
| 6 | **Tracking loads on every page type, phone and desktop** <br><small>SO-WC-06</small> | critical | browser | dev | A page with no tracking is a blind spot: its visitors and sales disappear from your numbers. | EXIST-W-21, CHK-A-077, CHK-A-041 |
| 7 | **Shopping events carry value, currency and product details** <br><small>SO-WC-07</small> | critical | browser | dev | Without these fields your reports cannot show which products sell or what each step is worth in money. | EXIST-W-23, CHK-B-005, CHK-B-011, CHK-B-010, EXIST-GTM-08, CHK-A-048 |
| 8 | **GA4 counts each visit and event once** <br><small>SO-WC-08</small> | critical | browser | dev | Double counting makes your conversion rate look lower or higher than it is, so you fix the wrong thing. | EXIST-W-24, UX-195, CHK-B-064, CHK-A-039, CHK-A-004, EXIST-GTM-09 |
| 9 | **The value sent matches the price shown on the page** <br><small>SO-WC-09</small> | medium | browser | dev | A wrong currency or price makes every sales figure in your reports wrong, even when orders are fine. | CHK-B-015, CHK-B-018 |
| 10 | **No broken images or files on the pages that sell** <br><small>SO-WC-10</small> | medium | browser | dev, owner | A missing product photo or a broken script makes the store look untrustworthy and can stop buttons working. | EXIST-W-03 |
| 11 | **Ad pixels fire on your live pages** <br><small>SO-WC-11</small> | medium | browser | marketing, dev | Without a working pixel, your ads cannot learn which visitors buy, so you pay for visitors who are less likely to order. | EXIST-W-25 |
| 12 | **Taps respond without delay** <br><small>SO-WC-12</small> | medium | browser | dev | A button that does not react right away makes customers think the store is broken. | EXIST-W-11 |
| 13 | **Product photos are not heavier than needed** <br><small>SO-WC-13</small> | medium | browser | owner, content | Heavy photos are the most common reason a store page shows slowly on a phone. | EXIST-W-13 |
| 14 | **Apps and tags do not slow the store down** <br><small>SO-WC-14</small> | medium | browser | owner, dev | Each app adds waiting time before customers see your product. | EXIST-W-15, EXIST-GTM-22, CHK-A-074 |
| 15 | **The page does not jump while loading** <br><small>SO-WC-15</small> | medium | browser | dev | When the page jumps, customers tap the wrong button and lose trust. | EXIST-W-10 |
| 16 | **Menu reaches every category and no menu or footer link is dead** <br><small>SO-WC-16</small> | medium | crawl | owner | Products shoppers cannot find through the menu are products they do not buy. | UX-032, EXIST-W-05 |
| 17 | **Product names show in full on collection pages** <br><small>SO-WC-17</small> | medium | browser | owner, content | Shoppers open the products they can recognise; unclear names mean fewer product views and fewer sales. | UX-026 |
| 18 | **Tracking starts before phone shoppers leave a slow page** <br><small>SO-WC-18</small> | medium | browser | dev | Shoppers who leave a slow page before tracking fires disappear, so visits look lower and ads look like they bring fewer people. | CHK-B-073 |
| 19 | **No slow or blocking code before the page shows** <br><small>SO-WC-19</small> | low | browser | dev | Code that loads before the product makes every page slower for every customer. | EXIST-W-12, EXIST-W-14, EXIST-W-04 |
| 20 | **No leftover code from apps you removed** <br><small>SO-WC-20</small> | low | browser | owner, dev | Leftover code slows the store and can break other features, with nothing gained. | EXIST-W-16 |
| 21 | **Colour options shown as swatches on the product page** <br><small>SO-WC-21</small> | low | browser | owner | Seeing the colours makes choosing easier, so more shoppers reach Add to cart. | UX-029 |
| 22 | **Google sees the right price and stock** <br><small>SO-WC-22</small> | low | crawl | dev | Correct price and stock keep your products eligible for free Google Shopping listings. | EXIST-W-40, EXIST-W-41 |
| 23 | **Home banners record views and taps, so you can see which ones sell** <br><small>SO-WC-23</small> | low | browser | dev, marketing | Your home banners get the most taps; knowing which one sells tells you what to put there. | CHK-B-020 |
| 24 | **Shared links show a picture in WhatsApp and Instagram** <br><small>SO-WC-24</small> | low | crawl | dev, content | Customers share products on WhatsApp; a link with a photo gets more people to open it. | EXIST-W-44 |
| 25 | **Product data is ready and fresh when tags read it** <br><small>SO-WC-25</small> | low | browser | dev | Mixed-up product data makes your product reports show the wrong items as viewed and added. | CHK-B-008, CHK-B-007, EXIST-W-28 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **SO-WC-01 Add to cart actually adds the product**
  - Pass: On a phone, our tap on Add to cart put the product in the cart and the cart count went up.
  - Fails: The tap does nothing, shows an error, or the cart stays empty, so a customer who wants to buy cannot.
  - How we check: Headless phone visit of one product page: tap Add to cart, then read the cart count, the cart drawer or cart page, and the network response of the add request. Fail when the item is not in the cart afterwards.
  - Action: Ask your developer to fix the Add to cart button or the theme script behind it, then test it yourself on your phone.
  - Done when: A tap on Add to cart on a phone adds the product and the cart count updates, on our re-scan.
  - Selected because: A broken Add to cart stops all sales on that page; highest direct sales effect in this section.
- **SO-WC-02 The cart opens without errors**
  - Pass: The cart page loads fully on phone and desktop with no script errors and no failed loads.
  - Fails: Script errors, repeating errors or a failed load on the cart, so totals, buttons or the checkout button may not work.
  - How we check: Headless phone and desktop visit of the cart after our add to cart: collect console errors, uncaught exceptions and failed requests (status 400 or more) on the cart. Fail on any error that repeats or any failed load of the cart's own scripts. Checkout itself is not visited.
  - Action: Send the error list from this report to your developer and ask them to clear every error on the cart page.
  - Done when: Zero console errors and zero failed loads when the cart opens, on our re-scan.
  - Selected because: Cart errors block people who already want to buy; merged with the console-error check (same measurement).
- **SO-WC-03 Product page shows fast on phones**
  - Pass: On a phone, the main product image or title shows in under 2.5 seconds (LCP).
  - Fails: The main content of the product page takes longer than 2.5 seconds to show on a phone, so some visitors leave before they see the product.
  - How we check: Headless phone visit of the product page with a throttled mobile profile: read LCP and the element that was the LCP. Fail when LCP is over 2.5 seconds. Repeat on home and collection for context.
  - Action: Make the main product photo smaller in file size and ask your developer to load it first, before apps and banners.
  - Done when: LCP on the product page is under 2.5 seconds on a phone, on our re-scan.
  - Selected because: Slow mobile product pages failed in 3 of 4 tested stores and most GCC traffic is on phones.
- **SO-WC-04 WhatsApp and call links use a number that works**
  - Pass: Every WhatsApp (wa.me or api.whatsapp.com) and phone (tel:) link uses a full international number, or the store has none.
  - Fails: A WhatsApp or call link has a missing, local-format or malformed number, so a customer who wants to ask before buying cannot reach you.
  - How we check: Headless visit of home, collection, product and cart: collect every wa.me, api.whatsapp.com and tel: link and check each number is present and in full international format with the country code.
  - Action: Fix the number in your WhatsApp button or app settings so it starts with your country code (for Saudi numbers, 966) with no leading zero.
  - Done when: Every WhatsApp and call link on the store opens a chat or call to your number, on our re-scan.
  - Selected because: WhatsApp is the GCC customer's main question channel; owner can fix it in minutes.
- **SO-WC-05 Google can show your products and collections**
  - Pass: Product and collection pages are allowed in robots.txt and carry no noindex or nofollow tag.
  - Fails: A noindex tag, an X-Robots-Tag header or a robots.txt rule blocks product or collection pages, so they cannot appear in Google.
  - How we check: Public crawl: fetch robots.txt and the sitemap, then the HTML and headers of the visited product and collection pages plus a sample of sitemap URLs. Fail on any noindex/nofollow meta, X-Robots-Tag, or robots.txt Disallow that covers product or collection URLs.
  - Action: Turn off any setting or app that hides your products from search engines, or ask your developer to remove the noindex tag.
  - Done when: Product and collection pages show no noindex and are not blocked in robots.txt, on our re-scan.
  - Selected because: A block removes all free search traffic to the pages that sell; a sales effect, not SEO polish.
- **SO-WC-06 Tracking loads on every page type, phone and desktop**
  - Pass: The store's own GTM container (same ID as the container we read) or GA4 tag loads on home, collection, product and cart, on phone and desktop.
  - Fails: The tag is missing on one page type (often product or cart, or a swapped theme template), or the live site loads a different container, so visits and sales on that page are not counted.
  - How we check: Crawl the HTML source of home, one collection, one product and the cart, and check the headless phone and desktop visits for a gtm.js request with the container ID we read (or a GA4 tag) and at least one GA4 collect hit on each. Fail if any page type has no request or a different ID.
  - Action: Ask your developer to add the tracking code to the shared store layout so it loads on every page, including product and cart pages.
  - Done when: Our re-scan sees the same container and GA4 hits on home, collection, product and cart, on phone and desktop.
  - Selected because: A missing tag removes a page from every sales figure; merged with removed SO-GTM-01 (same live check), tested in audits, failed on 3 of 5 stores.
- **SO-WC-07 Shopping events carry value, currency and product details**
  - Pass: view_item and add_to_cart carry value, currency and an items list with item_id, item_name, price and quantity (GA4 field names) in the dataLayer and the GA4 hit.
  - Fails: Value, currency or items are missing, use old field names, or the dataLayer push is malformed, so GA4 shows blank or wrong product and sales figures.
  - How we check: Headless visit: read the dataLayer pushes and GA4 collect hits for view_item on the product page and add_to_cart after our click. Fail when value, currency or items[] is missing, items lack item_id, item_name, price or quantity, items use legacy names (id, name instead of item_id, item_name), or the push is not a valid ecommerce object.
  - Action: Ask your developer to send value, currency and the product list with every shopping event, using the GA4 field names.
  - Done when: Our re-scan sees value, currency, item_id, item_name, price and quantity on view_item and add_to_cart.
  - Selected because: Missing value or items blanks the sales numbers the owner reads; dataLayer format failed in 3 of 5 tested stores. Absorbs the removed SO-GTM-14 (product fields), measured here on the live hits.
- **SO-WC-08 GA4 counts each visit and event once**
  - Pass: One GA4 tag load and one page_view per page load for each measurement ID, one hit per event (scroll, click, add to cart), and no blocked tracking requests.
  - Fails: Two tracking setups (a store app plus GTM, two Google tags for one ID, a manual page_view tag, or pasted code) send page_view or other events twice, or requests are blocked, so visit and conversion numbers are wrong.
  - How we check: Headless phone and desktop visit of home, collection, product and cart: count gtag/js loads and GA4 collect hits per page load and per event, grouped by measurement ID. Fail on two loads or more than one page_view per load for one ID, a repeated event from one action, or tracking requests blocked by the site's own security policy.
  - Action: Ask your developer to keep one tracking setup and remove the duplicate.
  - Done when: One page_view per page and one add_to_cart per click, on our re-scan.
  - Selected because: Double counting distorts the conversion rate the owner sees; one live network check. Merged with removed SO-GA4-09 and SO-GTM-12 (same concern); failed on 3 of 5 tested stores.
- **SO-WC-09 The value sent matches the price shown on the page**
  - Pass: The value sent with view_item and add_to_cart equals the price shown on the product page (times quantity), and currency is the store's three-letter code in capitals (for example SAR).
  - Fails: Currency is a symbol, lowercase, a different code from the store's, or the value is off by a factor (for example 1000x from a comma or dot read the wrong way).
  - How we check: Headless visit: read the displayed price on the product page and the value and currency in the view_item and add_to_cart dataLayer pushes and GA4 hits. Fail when currency is not an uppercase ISO 4217 code matching the store's currency, or the value differs from the displayed price beyond rounding.
  - Action: Ask your developer to send the price as a plain number and the currency as the three-letter code your store charges in.
  - Done when: Our re-scan sees the same price and the correct currency code in the event as on the page.
  - Selected because: Wrong currency or price corrupts all revenue reporting the owner reads; checkable against the page price.
- **SO-WC-10 No broken images or files on the pages that sell**
  - Pass: No request returns 404 or 500 on home, collection, product or cart.
  - Fails: Product images, scripts or styles fail to load, so pages look broken or features stop working.
  - How we check: Headless visit of home, collection, product and cart: list network requests with status 400 or more and the page each is on.
  - Action: Re-upload the missing images and ask your developer to fix or remove the broken files.
  - Done when: Zero failed requests on home, collection, product and cart, on our re-scan.
  - Selected because: Broken files hurt trust and function on the money pages; clear fix list.
- **SO-WC-11 Ad pixels fire on your live pages**
  - Pass: For each ad platform the store uses (Meta, Snapchat, TikTok, Google Ads), its pixel loads and sends page view and add to cart during our visit.
  - Fails: No pixel, or a pixel that loads but sends no events, for a platform the store advertises on.
  - How we check: Headless visit: detect Meta, Snapchat, TikTok and Google Ads tags in the HTML and network, and check each sends PageView/ViewContent and AddToCart hits during our visit.
  - Action: Connect the pixel for each platform you advertise on, through your store's sales-channel or app settings, or ask whoever runs your ads.
  - Done when: Our re-scan sees each platform's pixel fire on page view and add to cart.
  - Selected because: Owners pay for ads; a missing pixel wastes that budget and is a quick connect in most store admins. Purchase setup per platform is checked in the GTM section; this point checks live firing only.
- **SO-WC-12 Taps respond without delay**
  - Pass: No script task longer than 200 ms while the product page loads on a phone.
  - Fails: Long script tasks make taps on Add to cart, size or colour lag, so shoppers tap again or give up.
  - How we check: Headless phone visit of the product page: record main-thread long tasks during load and report the longest and the scripts behind them.
  - Action: Ask your developer to delay or remove the scripts behind the long tasks listed in this report.
  - Done when: No task over 200 ms on the product page, on our re-scan.
  - Selected because: Lagging taps hit the Add to cart moment on phones.
- **SO-WC-13 Product photos are not heavier than needed**
  - Pass: Images are served near the size shown, in WebP or AVIF, and images below the first screen load later.
  - Fails: Photos are far larger than shown, in old formats, or images lower on the page load before the main photo.
  - How we check: Headless phone visit of home, collection and product: compare each image's file size and pixel size with its displayed size, check format and loading order.
  - Action: Resize and compress your largest photos before uploading them again; this report lists them.
  - Done when: No listed image is more than twice its shown size, on our re-scan.
  - Selected because: A speed fix the owner can do without a developer.
- **SO-WC-14 Apps and tags do not slow the store down**
  - Pass: Chat, review, popup, pixel and other third-party scripts (from store apps or GTM) load light or after the page shows.
  - Fails: Third-party scripts from apps or GTM make up most of the page weight or load before the product shows.
  - How we check: Headless phone visit: group network bytes and script time by third-party domain and name the app or GTM tag behind each; report the share of load each takes.
  - Action: Remove apps and tags you do not use and have the heavy ones load after the page.
  - Done when: No single app is the largest part of page weight on the product page, on our re-scan.
  - Selected because: Owner controls which apps are installed; direct speed effect. Absorbs the removed SO-GTM-11 (tags slowing phones), measured here on the live page.
- **SO-WC-15 The page does not jump while loading**
  - Pass: CLS under 0.1 on home, collection and product on a phone.
  - Fails: Banners, images or app widgets push content down as they load, so shoppers tap the wrong thing.
  - How we check: Headless phone visit: read CLS and the elements that moved on home, collection and product.
  - Action: Ask your developer to reserve space for images, banners and app widgets so nothing moves after the page shows.
  - Done when: CLS under 0.1 on all three pages, on our re-scan.
  - Selected because: Layout jumps cause mis-taps on phones; measurable on every page.
- **SO-WC-16 Menu reaches every category and no menu or footer link is dead**
  - Pass: Every collection that has products can be reached from the main menu or its sub-menus, every menu and footer link opens a working page, and the not-found page offers search or links back to products.
  - Fails: Collections with products are missing from the menu, menu or footer links point to old collections or deleted products, or the not-found page has no way back.
  - How we check: Public crawl plus headless visit: list collection URLs from the sitemap and the links in the header, mobile menu and footer; list collections with products the menu does not link to; fetch every menu and footer link and record non-200 responses; fetch a made-up URL and check the not-found page has search or product links.
  - Action: Add the missing categories to your store menu, fix or remove the dead links listed, and add search and a back-to-shop link on the not-found page.
  - Done when: Every collection with products is linked from the menu, no menu or footer link is broken, and the not-found page links back to products, on our re-scan.
  - Selected because: Hidden categories cut product discovery; failed in 3 of 5 tested stores; owner edits the menu. Merged with removed SO-CRO-25 (menu and footer links), one crawl of the same links.
- **SO-WC-17 Product names show in full on collection pages**
  - Pass: Every product card on the collection page shows a readable product name on phone and desktop.
  - Fails: Cards show no name, or names cut off so shoppers cannot tell products apart.
  - How we check: Headless phone and desktop visit of the collection: for each product card, read the visible name text and check it is present and not truncated to the point of losing the product type.
  - Action: Shorten long product titles so the key words come first, or change the theme setting that hides names.
  - Done when: Every product card shows a readable name, on our re-scan.
  - Selected because: Owner fixes titles in the admin; affects every collection visit.
- **SO-WC-18 Tracking starts before phone shoppers leave a slow page**
  - Pass: On a throttled phone visit, the GA4 page_view and ad pixel page views are sent before the main content finishes showing (LCP), not held until the whole page has loaded.
  - Fails: Tags wait for the full page load, or GTM loads late behind other scripts, so shoppers who leave a slow page are never counted.
  - How we check: Headless phone visit of home, collection and product with a throttled mobile profile: record the time of the gtm.js load, the first GA4 page_view hit and each pixel page view, and compare them with LCP and the load event.
  - Action: Ask your developer to load tracking early and send page views when the page starts, not after everything has loaded.
  - Done when: Our re-scan sees the first GA4 page_view before LCP on all three pages.
  - Selected because: Backfill: next most valuable WEBCODE candidate with an effect on the visit numbers; measured in the throttled phone visit.
- **SO-WC-19 No slow or blocking code before the page shows**
  - Pass: No render-blocking scripts or styles in the head, no request over 3 seconds holding up content, and first-load code under about 1 MB.
  - Fails: Blocking files in the head, requests that hang over 3 seconds, or more code than needed on first load delay the first view.
  - How we check: Headless phone visit of home, collection and product: list render-blocking resources, requests longer than 3 seconds that delay visible content, and total JS plus CSS bytes on first load.
  - Action: Send this list to your developer and ask them to delay or remove the files named.
  - Done when: No blocking files, no request over 3 seconds and first-load code under about 1 MB, on our re-scan.
  - Selected because: Developer-only speed causes merged into one point so the owner gets one hand-over list.
- **SO-WC-20 No leftover code from apps you removed**
  - Pass: Every app script that loads belongs to an app with a visible feature on the store.
  - Fails: Scripts still load from app domains with no visible feature, or fail to load, after the app was removed.
  - How we check: Headless visit: list third-party script domains, match them to known apps, and flag those with no matching widget on the page or that return errors.
  - Action: Check the listed apps; reinstall and properly uninstall them, or ask your developer to remove their leftover code from the theme.
  - Done when: No scripts from removed apps load, on our re-scan.
  - Selected because: Easy speed win the owner can start without code.
- **SO-WC-21 Colour options shown as swatches on the product page**
  - Pass: Products that come in colours show each colour as a swatch or small photo the shopper can tap, on phone and desktop.
  - Fails: Colours sit in a plain dropdown or text list, so shoppers can't see the options and choose slower or not at all.
  - How we check: Headless phone and desktop visit of the product page: read the variant options; when a colour option exists, check whether it shows as swatches or images rather than a select element. Not applicable when the product has no colour option.
  - Action: Turn on colour swatches in your theme or variant settings and add a photo for each colour.
  - Done when: Colour options show as swatches on the product page, on our re-scan.
  - Selected because: Backfill: tested in audits; owner theme setting; checked on the product page we visit (no swatch point exists in CRO).
- **SO-WC-22 Google sees the right price and stock**
  - Pass: Product pages carry Product and Offer data with price and availability, and both match what the page shows.
  - Fails: Price or stock is missing from the product data, or differs from the page, so Google can drop the product from free Shopping listings.
  - How we check: Public crawl of the visited product page and sitemap samples: read JSON-LD Product/Offer price, currency and availability and compare them with the displayed price and stock.
  - Action: Ask your developer to make the product data on each page show the same price and stock as the page.
  - Done when: Product data has price and availability that match the page, on our re-scan.
  - Selected because: Kept only for its Google Shopping sales effect; presence and match merged into one point.
- **SO-WC-23 Home banners record views and taps, so you can see which ones sell**
  - Pass: Home page banners send view_promotion when shown and select_promotion when tapped, with the banner name.
  - Fails: Banners send no promotion events, so you cannot tell which banner brings sales and which wastes the best spot on the page.
  - How we check: Headless phone and desktop visit of home: read dataLayer pushes and GA4 hits for view_promotion when the hero banners show; tap the first banner and check for select_promotion with promotion_name or creative_name.
  - Action: Ask your developer to send promotion events for your home banners.
  - Done when: Our re-scan sees view_promotion and select_promotion with banner names.
  - Selected because: Backfill: tested in audits, failed on 3 of 5 stores; tells the owner which banners earn their spot.
- **SO-WC-24 Shared links show a picture in WhatsApp and Instagram**
  - Pass: Home and product pages have og:title, og:image and og:description.
  - Fails: These tags are missing, so links shared in WhatsApp or Instagram show no picture or title.
  - How we check: Public crawl of home and product HTML: check og:title, og:image and og:description exist and the og:image URL loads.
  - Action: Add a share image and description for your home page and products, or ask your developer to turn them on in the theme.
  - Done when: Home and product pages have all three tags and the image loads, on our re-scan.
  - Selected because: WhatsApp sharing is a real GCC sales channel; low because it is a tag-only fix.
- **SO-WC-25 Product data is ready and fresh when tags read it**
  - Pass: The dataLayer is set before the GTM snippet, and each shopping event clears the previous product data first, so every event carries only its own products.
  - Fails: The dataLayer is set after GTM, so early events miss product data, or old products carry over into the next event (for example a viewed product showing up in add to cart).
  - How we check: Crawl: order of the dataLayer declaration and the GTM snippet in the HTML source. Headless visit: read the dataLayer sequence on collection, product and after our add to cart; fail if an ecommerce push is not preceded by ecommerce: null and its items include items from an earlier event.
  - Action: Ask your developer to set the dataLayer before GTM and clear the ecommerce data before each shopping event.
  - Done when: Our re-scan sees the dataLayer before GTM and each event carrying only its own products.
  - Selected because: Backfill: dataLayer order (tested) and clearing are one check of the same push sequence; EXIST-W-28 is the current-tool version.

</details>

### CRO (storefront) — 25 points (0 need a new GA4 query · 4 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Why it matters | Sources |
|---|---|---|---|---|---|---|
| 1 | **Customers can see they can pay with mada, Apple Pay, Tabby or Tamara before checkout** <br><small>SO-CRO-01</small> | critical | browser | owner | Shoppers who don't see their way to pay stop before checkout, so the sale is lost after they already chose the product. | ICP1-card-§16, UX-087, UX-176, UX-163 |
| 2 | **Delivery cost is shown before checkout** <br><small>SO-CRO-02</small> | critical | browser | owner | A delivery cost that appears only at the last step is a common reason buyers drop out after adding to cart. | UX-061 |
| 3 | **Free-delivery threshold is shown and explained** <br><small>SO-CRO-03</small> | critical | browser | owner, marketing | A clear free-delivery amount gives shoppers a reason to add one more item, which raises order value. | ICP1-card-§16, UX-179 |
| 4 | **Cash-on-delivery fee is stated before checkout** <br><small>SO-CRO-04</small> | critical | browser | owner | An unexpected COD fee at the last step makes buyers abandon or refuse the order at the door. | ICP1-card-§16 |
| 5 | **WhatsApp button is easy to see on phones and doesn't cover the buy button** <br><small>SO-CRO-05</small> | critical | browser | owner | GCC shoppers ask questions on WhatsApp before buying; a hidden button turns those questions into lost orders. | ICP1-card-§16, UX-008 |
| 6 | **Add to cart is in the first phone screen** <br><small>SO-CRO-06</small> | critical | browser | owner, dev | When the buy button is out of sight on a phone, fewer product visitors add to cart. | UX-057 |
| 7 | **Product titles are in Arabic** <br><small>SO-CRO-07</small> | medium | browser | content, owner | Arabic-speaking shoppers find and trust products faster when the name is in their language. | ICP1-card-§16 |
| 8 | **Arabic pages read right to left on the phone, cart included** <br><small>SO-CRO-08</small> | medium | browser | dev | A broken Arabic cart makes the store look unsafe at the moment the customer decides to pay. | EXIST-W-45 |
| 9 | **Cart shows the same price and a clear total** <br><small>SO-CRO-09</small> | medium | browser | owner, dev | A price that changes between the product page and the cart breaks trust right before checkout. | UX-072, UX-049 |
| 10 | **Checkout button in the cart is clear on the phone** <br><small>SO-CRO-10</small> | medium | browser | owner, dev | People who already added to cart need an obvious next step, or they leave the cart without buying. | UX-074 |
| 11 | **Pay-in-instalments price is shown on the product page** <br><small>SO-CRO-11</small> | medium | browser | owner | Seeing a smaller instalment amount helps shoppers commit to higher-priced items. | ICP1-card-§16 |
| 12 | **Phone layout has no sideways scroll and buttons are easy to tap** <br><small>SO-CRO-12</small> | medium | browser | dev | Most store visits are on phones; missed taps and a wobbling page lose buyers on the way to the cart. | EXIST-W-20, UX-007, UX-033, UX-058 |
| 13 | **Delivery time is shown before buying** <br><small>SO-CRO-13</small> | medium | browser | owner | Shoppers who don't know when the order arrives hesitate, especially for gifts and occasions. | UX-037 |
| 14 | **Return and exchange policy is easy to find** <br><small>SO-CRO-14</small> | medium | browser | owner, content | Clear return terms reduce the fear of buying from a store the shopper doesn't know yet. | UX-129, UX-164, UX-001, UX-002 |
| 15 | **Reviews and ratings show on product and collection pages** <br><small>SO-CRO-15</small> | medium | browser | owner | Reviews from other buyers are what convinces a hesitant first-time shopper to add to cart. | UX-051, UX-023, UX-053, UX-157 |
| 16 | **Product page has several clear photos** <br><small>SO-CRO-16</small> | medium | browser | content, owner | Shoppers can't touch the product; more photos answer their doubts and lead to more add to carts. | UX-059 |
| 17 | **Product description answers buyer questions, in Arabic** <br><small>SO-CRO-17</small> | medium | browser | content | Missing details make shoppers leave to ask or to buy elsewhere. | UX-050, UX-052 |
| 18 | **Sale price and saving are clear** <br><small>SO-CRO-18</small> | medium | browser | owner | A clear saving gets deal-seeking shoppers to act; an unclear price makes them doubt the offer. | UX-034, UX-022 |
| 19 | **Sold-out products don't block the shopper** <br><small>SO-CRO-19</small> | medium | browser | owner | Shoppers who land on sold-out items, often from ads, leave instead of buying something else. | UX-027, UX-167, EXIST-W-08 |
| 20 | **Language switch and prices in the right currency** <br><small>SO-CRO-20</small> | medium | browser | owner | Shoppers who can't read the page in their language or see a strange currency don't buy. | ICP1-card-§16, UX-019 |
| 21 | **Related products shown to raise order value** <br><small>SO-CRO-21</small> | low | browser | owner | Suggesting a matching item lets buyers add more to the same order. | UX-158, UX-092, UX-186 |
| 22 | **Cart icon is always visible in the phone header** <br><small>SO-CRO-22</small> | low | browser | owner | Shoppers who can't find their cart again leave with items still in it. | UX-011 |
| 23 | **Search is easy to find on the phone** <br><small>SO-CRO-23</small> | low | browser | owner | Shoppers who know what they want buy faster when they can search for it. | UX-009 |
| 24 | **Filter and sort are available on phone collection pages** <br><small>SO-CRO-24</small> | low | browser | owner | On large collections, shoppers who can't narrow down give up before finding a product. | UX-025, UX-031 |
| 25 | **No heavy autoplay video on the phone first screen** <br><small>SO-CRO-25</small> | low | browser | owner, dev | A heavy video slows the first screen on mobile data, and slower pages lose visitors before they see a product. | EXIST-W-17 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **SO-CRO-01 Customers can see they can pay with mada, Apple Pay, Tabby or Tamara before checkout**
  - Pass: On the phone product page (near Add to cart) and in the cart, the payment methods the store accepts are shown as logos or text: mada, Apple Pay, Tabby, Tamara, STC Pay, cash on delivery, as offered.
  - Fails: No payment logos on the product page or cart, or only Visa/Mastercard shown, so a shopper who wants mada or instalments only finds out at checkout or leaves.
  - How we check: Headless phone and desktop visit of the product page and the cart: search the DOM (img alt/src, svg titles, class names, visible text) for mada, Apple Pay, Visa, Mastercard, STC Pay, Tabby, Tamara and cash-on-delivery wording; record which appear and whether they sit in the first screen near Add to cart and near the cart's checkout button. Screenshot both. Payment setup itself is not visible to us: mark 'confirm with owner' for methods offered but not shown.
  - Action: Show the payment logos you accept (mada, Apple Pay, Tabby, Tamara, cash on delivery) under the Add to cart button and next to the checkout button in the cart. Most themes have a payment-icons setting or block for this.
  - Done when: On a phone, the product page and the cart both show the payment methods you accept without scrolling past the buy button.
  - Selected because: Top store-owner leak in the spec (payment visibility), Elevr list item, tested in CRO audits, owner can fix in the admin.
- **SO-CRO-02 Delivery cost is shown before checkout**
  - Pass: The product page or the cart states the delivery cost (or how it is worked out, by city or order value), so the shopper knows the full price before checkout.
  - Fails: The cart says delivery is calculated at checkout or says nothing, and no delivery-cost text is reachable from the product page; the cost first appears at the last step.
  - How we check: Headless phone visit of product page and cart after our add to cart: search visible text for delivery/shipping cost wording (توصيل, شحن, delivery, shipping) with an amount or a rule; note 'calculated at checkout' wording. Public crawl of the delivery/shipping policy page linked from the footer to see if costs are listed. Screenshot cart.
  - Action: Write the delivery cost in the cart and on the product page (for example the price per city or 'free above X'), and keep the delivery policy page linked from both.
  - Done when: A phone shopper can read the delivery cost on the product page or in the cart before tapping checkout.
  - Selected because: Spec ranks late shipping cost high for this reader; tested and failed in 3 of 5 audited stores; owner setting.
- **SO-CRO-03 Free-delivery threshold is shown and explained**
  - Pass: If the store offers free delivery above an amount, that amount is stated on the home page bar or product page, and the cart tells the shopper how much more they need to add.
  - Fails: Free delivery is offered but the amount is not shown, the bar says 'free delivery' with no amount, or the cart gives no 'add X more' message.
  - How we check: Headless phone visit of home, product and cart: search visible text for free-delivery wording (توصيل مجاني, شحن مجاني, free delivery/shipping) and capture any amount next to it; in the cart (with our one product) check for a remaining-amount message or progress bar. Crawl the delivery policy page for the threshold. If no free-delivery offer is found anywhere, mark 'not offered or not shown, confirm with owner'.
  - Action: State the free-delivery amount in the top bar and on the product page, and turn on a cart message that shows how much more the customer needs to add.
  - Done when: Home or product page shows the free-delivery amount and the cart shows the remaining amount for the current order.
  - Selected because: Elevr list item and a high-scoring delivery lever in the spec; visible storefront fact.
- **SO-CRO-04 Cash-on-delivery fee is stated before checkout**
  - Pass: If cash on delivery is offered, the product page, cart or delivery policy page says whether it has a fee and how much.
  - Fails: Cash on delivery is mentioned but the fee is not, so the shopper meets an extra charge at the last step; or COD wording only appears inside checkout.
  - How we check: Headless phone visit of product page and cart plus public crawl of the delivery/payment policy pages: search for COD wording (الدفع عند الاستلام, cash on delivery, COD) and, where found, for a fee amount or 'no fee' wording near it. If COD wording is not found, mark 'COD offer not visible, confirm with owner'. We do not open checkout.
  - Action: Add one line near the payment logos and in the delivery policy: 'Cash on delivery: fee X' or 'Cash on delivery with no extra fee'.
  - Done when: The COD fee (or 'no fee') is readable on the product page, the cart or the linked delivery page.
  - Selected because: Elevr list item; spec scores hidden COD fee high; checkable from storefront text and policy pages.
- **SO-CRO-05 WhatsApp button is easy to see on phones and doesn't cover the buy button**
  - Pass: On the phone product page and cart, a WhatsApp (or other contact) button is visible and does not cover Add to cart or the checkout button.
  - Fails: No WhatsApp link at all, the link is only in the footer, the button is hidden on mobile, or it sits on top of the buy button.
  - How we check: Headless phone visit of product page and cart: find links to wa.me, api.whatsapp.com or whatsapp:// and chat widgets; check the element's box is inside the viewport and visible, and that it does not overlap the Add to cart or checkout button boxes. Whether the number itself works is checked in the website section. Also note other contact routes (phone, email) in header/footer. Screenshot.
  - Action: Turn on the floating WhatsApp button for mobile and place it so it does not cover the Add to cart or checkout buttons.
  - Done when: On a phone, a WhatsApp button shows on the product page and cart and leaves the buy buttons clear.
  - Selected because: Elevr list item and spec high-score item on mobile-heavy stores; tested (2 of 5 failed); owner setting.
- **SO-CRO-06 Add to cart is in the first phone screen**
  - Pass: On a 375px phone, the product page shows the price and the Add to cart button without scrolling, or a sticky Add to cart appears as soon as the shopper scrolls.
  - Fails: Add to cart sits below a tall gallery, banners or long text, so the shopper has to scroll to find how to buy.
  - How we check: Headless phone visit (375px) of the product page: locate the Add to cart button and the price, read their bounding boxes and check they fall inside the first viewport; scroll once and check for a sticky buy bar. Screenshot the first screen.
  - Action: Move the price and Add to cart up under the first product photo, or turn on the theme's sticky Add to cart bar for mobile.
  - Done when: A 375px screenshot of the product page shows the price and Add to cart (or a sticky bar) without scrolling.
  - Selected because: Direct lever on product page to add to cart; tested (2 of 5 failed); measured exactly by the phone visit.
- **SO-CRO-07 Product titles are in Arabic**
  - Pass: On the Arabic store, product titles on the collection page and the product page are written in Arabic (brand or model names in Latin letters are fine).
  - Fails: Arabic pages show English-only product titles, or titles copied from the supplier with codes and no Arabic name.
  - How we check: Headless visit of the Arabic version of the collection and product pages: read the product card titles and the product h1; compute the share of titles that contain Arabic letters; list the English-only titles found.
  - Action: Add an Arabic title to each product in the product editor, starting with your best-selling products; keep the brand name as is.
  - Done when: All product titles on the Arabic collection page and the opened product page contain an Arabic name.
  - Selected because: Elevr list item; spec scores Arabic product titles high; owner fixes in the product editor.
- **SO-CRO-08 Arabic pages read right to left on the phone, cart included**
  - Pass: Arabic pages declare lang=ar and dir=rtl, and the product page and cart lay out right to left on a phone: prices, quantity, remove and checkout buttons in the right places with no overlapping or cut text.
  - Fails: Arabic text inside a left-to-right layout, mirrored icons, prices or numbers jumbled, or cart rows that overlap or cut off on a phone.
  - How we check: Headless phone visit of the Arabic home, product and cart pages: read html lang/dir and the computed direction of the main product and cart containers; check for elements whose boxes overflow the viewport or overlap in the cart; screenshot the cart for review.
  - Action: Ask your developer or theme support to fix the right-to-left layout on the product page and cart for Arabic.
  - Done when: Arabic product page and cart screenshots on a phone show a correct right-to-left layout with nothing overlapping.
  - Selected because: Spec scores RTL breaks in the cart high on mobile-heavy stores; the current tool already reads lang/dir.
- **SO-CRO-09 Cart shows the same price and a clear total**
  - Pass: After adding our product, the cart shows the same price as the product page, a clear subtotal or total, and says whether delivery and VAT are included.
  - Fails: The cart price differs from the product page, the discount shown on the product page is missing in the cart, or the total is unclear about delivery and VAT.
  - How we check: Headless phone visit: record the price (and any sale price) on the product page, add the product to the cart, then read the cart line price, subtotal and total and any 'VAT included' or delivery wording. Flag any mismatch between product page and cart prices. Screenshot.
  - Action: Check the product's price and discount settings so the cart shows the same price, and add a line under the total saying whether VAT and delivery are included.
  - Done when: Product page price equals the cart line price, and the cart total states what it includes.
  - Selected because: Hidden or changing total is a known cart leak; we add one product so the comparison is exact. Covers the measurable part of the Elevr 'coupon vs cart price' item.
- **SO-CRO-10 Checkout button in the cart is clear on the phone**
  - Pass: The cart has one clear checkout button visible on a phone without scrolling (or sticky), with a plain label such as 'إتمام الطلب'.
  - Fails: The checkout button is below the fold, looks like a secondary link, competes with several other buttons, or the label is unclear.
  - How we check: Headless phone visit of the cart after our add to cart: locate the checkout button, read its label and bounding box, check it is in the first viewport or sticky, and count other buttons of equal weight. Screenshot.
  - Action: Make the checkout button the main button in the cart and keep it visible on mobile (sticky if the cart is long).
  - Done when: A phone screenshot of the cart shows the checkout button without scrolling.
  - Selected because: Direct cart-to-checkout lever, the step store owners lose most; measured exactly in the cart visit.
- **SO-CRO-11 Pay-in-instalments price is shown on the product page**
  - Pass: If the store offers Tabby or Tamara, the product page shows the instalment line under the price (for example 'or 4 payments of X'), and the cart shows it too.
  - Fails: Tabby or Tamara is offered at checkout but no instalment line shows on the product page or cart, or the widget loads empty.
  - How we check: Headless phone visit of product page and cart: look for Tabby or Tamara widget elements or scripts in the DOM and network, and for instalment text near the price; check the widget renders text, not an empty box. If no BNPL is found, mark 'not visible, confirm with owner whether Tabby or Tamara is active'.
  - Action: Turn on the Tabby or Tamara product-page widget from the app or payment settings so the instalment amount shows under the price.
  - Done when: The product page and cart show the instalment line with an amount on a phone.
  - Selected because: Elevr list (Tabby/Tamara on product and cart); distinct from logos because it shows the instalment amount; visible in DOM and network.
- **SO-CRO-12 Phone layout has no sideways scroll and buttons are easy to tap**
  - Pass: Home, collection, product and cart pages fit the phone width with no sideways scroll; Add to cart, quantity, menu and checkout targets are 44px or more.
  - Fails: Pages scroll sideways, or the buy, quantity or remove buttons are too small to tap.
  - How we check: Headless 375px visit of the four pages: compare document scrollWidth with viewport width; measure the bounding boxes of Add to cart, quantity controls, menu and checkout buttons against 44px; list failures with screenshots.
  - Action: Ask your developer to remove the element causing sideways scroll and enlarge the small buy and quantity buttons on mobile.
  - Done when: No sideways scroll on the four pages and all listed buttons measure 44px or more.
  - Selected because: Mobile usability on the buying path; current tool already measures it; merged with tap-size and mobile readability candidates.
- **SO-CRO-13 Delivery time is shown before buying**
  - Pass: The product page (or collection cards) states how long delivery takes, in days or by city.
  - Fails: No delivery time anywhere before checkout, or only inside a policy page that is not linked from the product page.
  - How we check: Headless phone visit of collection and product pages: search visible text for delivery-time wording (توصيل خلال, أيام, delivery in, days) with a number; crawl the linked delivery policy page for times. Screenshot.
  - Action: Add a short line under the price: 'Delivery in X to Y days' (by city if it differs).
  - Done when: The product page shows a delivery time on a phone.
  - Selected because: Delivery expectation is a GCC trust moment; tested (3 of 5 failed); owner can add text.
- **SO-CRO-14 Return and exchange policy is easy to find**
  - Pass: A return/exchange policy is linked from the footer on all pages and mentioned near Add to cart, the page loads, and it is in Arabic; privacy and terms pages are linked too.
  - Fails: No return policy link, a broken policy page, an English-only policy on the Arabic store, or return terms only revealed after purchase.
  - How we check: Headless visit and public crawl: find footer links to return/exchange, privacy and terms pages on home, product and cart; fetch each and check status 200 and Arabic text; search the product page for return wording near Add to cart.
  - Action: Publish a short Arabic return and exchange policy, link it in the footer, and add one line near Add to cart (for example 'Exchange within X days').
  - Done when: Footer links to return, privacy and terms pages work, and the product page mentions returns near the buy button.
  - Selected because: Spec lists returns as a medium product-page trust lever; merged policy-link candidates into one point.
- **SO-CRO-15 Reviews and ratings show on product and collection pages**
  - Pass: The product page shows real customer reviews with a rating and count near the title, the rating links to the reviews, and collection cards show stars where reviews exist.
  - Fails: No reviews block, a widget showing zero reviews, a rating that doesn't link to the reviews, or reviews only in English on the Arabic store.
  - How we check: Headless visit of product and collection pages: detect review widgets and rating elements (stars, counts) in the DOM; read the review count; check the rating links or scrolls to the review section; check review text language. Screenshot.
  - Action: Turn on product reviews, show the rating under the product title, and ask recent buyers for a review (WhatsApp works well).
  - Done when: The product page shows a rating with a count under the title, and collection cards show stars.
  - Selected because: Product-page trust (medium in spec); tested in CRO audits; merged four review candidates.
- **SO-CRO-16 Product page has several clear photos**
  - Pass: The product page gallery has more than one photo (different angles, in use or with size reference), and the photos load sharp on a phone.
  - Fails: A single photo, the same photo repeated, or blurry images.
  - How we check: Headless phone visit of the product page: count unique gallery image URLs, read their natural sizes against displayed sizes. Screenshot the gallery.
  - Action: Upload extra photos for each product: different angles, the product in use and a size reference.
  - Done when: The opened product shows more than one distinct sharp photo on a phone.
  - Selected because: Highest-scoring tested pool candidate; owner fixes in the product editor; directly measurable.
- **SO-CRO-17 Product description answers buyer questions, in Arabic**
  - Pass: The product page has an Arabic description that covers what the shopper needs to decide: size or dimensions, material or ingredients, how to use, what is in the box.
  - Fails: Empty or one-line description, supplier text in English on the Arabic store, or key facts (size, material) missing.
  - How we check: Headless visit of the Arabic product page: extract the description text, measure its length, check the share of Arabic letters, and look for size/material/usage terms; the model reviews the text against the product type.
  - Action: Rewrite the description of your top products in Arabic with size, material, how to use and what's included.
  - Done when: The opened product's description is in Arabic and states size, material and use.
  - Selected because: Spec lists missing Arabic description as medium; tested (3 of 5 failed); merged two description candidates.
- **SO-CRO-18 Sale price and saving are clear**
  - Pass: Prices show on every collection card, and discounted products show the old and new price (and the saving) on the card and the product page.
  - Fails: Price missing on cards, old price shown without the new one, or a discount shown on the card but not on the product page.
  - How we check: Headless visit of collection and product pages: check each card has a price; where a compare-at or crossed-out price exists, check the new price and saving appear on the product page too. Price carry-over into the cart is checked in the cart-price point.
  - Action: Set the old price (compare-at price) on discounted products so the saving shows everywhere, and keep the price visible on all product cards.
  - Done when: Every collection card shows a price, and a discounted product shows old and new price on the card and the product page.
  - Selected because: Price clarity is a medium spec item; tested; owner admin setting.
- **SO-CRO-19 Sold-out products don't block the shopper**
  - Pass: No sold-out product sits in the home banner or the first row of home or a collection; sold-out products and sizes are clearly marked and sit after in-stock items; a sold-out product page offers similar items or a 'notify me'.
  - Fails: Sold-out products featured in the home banner or first row, many sold-out products at the top of the collection, sold-out sizes selectable until the cart, or a sold-out page with no way forward.
  - How we check: Headless visit of home and the collection page: read the products in the hero and first row and their stock state from the page and product schema, count cards marked sold out and their positions; on the product page read variant availability (disabled options, out-of-stock text) and check for similar-product or notify-me blocks.
  - Action: Swap sold-out products out of your home banner and first rows, move them to the end of collections, and add 'similar products' or 'notify me' on sold-out pages.
  - Done when: No sold-out product in the home banner or first row of home and collections, and sold-out pages show alternatives.
  - Selected because: Stock problems lose ready buyers; owner manages stock; visible on collection and product pages. Merged with removed SO-WC-12 (sold-out products in the first spots).
- **SO-CRO-20 Language switch and prices in the right currency**
  - Pass: A language switch (Arabic/English) is easy to find on the phone, and prices show in the store currency (for example SAR) the same way on product, cart and collection; if a currency switch exists it works.
  - Fails: No language switch, the switch hidden deep in the menu, prices in a different currency than the store sells in, or mixed currencies between pages.
  - How we check: Headless phone visit of home, collection, product and cart: find language and currency switch controls in header or menu and their visibility; read the currency symbol or code on prices on each page and check they match; follow the language switch link and check the Arabic/English page loads.
  - Action: Show the language switch in the mobile header and set prices to show in your store currency on every page.
  - Done when: Language switch visible on the phone header, and the same currency on collection, product and cart.
  - Selected because: Elevr list item (currency and language switching); tested (3 of 5 failed); platform setting.
- **SO-CRO-21 Related products shown to raise order value**
  - Pass: The product page or cart shows related or complementary products that can be added in one tap.
  - Fails: No related products on the product page or cart, or a block that shows the same product or sold-out items.
  - How we check: Headless visit of product page and cart: detect related/recommended product blocks (section headings such as منتجات مشابهة, recommendation app scripts) and count in-stock items in them.
  - Action: Turn on the related-products section on product pages and a 'you may also like' block in the cart.
  - Done when: Product page and cart each show at least one in-stock related product.
  - Selected because: Order-value lever; tested (4 of 5 lacked tools); owner app or theme setting.
- **SO-CRO-22 Cart icon is always visible in the phone header**
  - Pass: On a phone, a cart icon shows in the header of home, collection and product pages and opens the cart.
  - Fails: The cart icon is missing on mobile, hidden in the menu, or scrolls away, so shoppers can't get back to their cart.
  - How we check: Headless phone visit of home, collection and product: find the header cart link or icon, check it is visible in the first viewport and links to the cart.
  - Action: Turn on the cart icon in the mobile header in your theme settings.
  - Done when: The cart icon shows in the phone header on home, collection and product pages.
  - Selected because: Backfill: highest-value unused CRO candidate, tested (2 of 5 failed); theme setting.
- **SO-CRO-23 Search is easy to find on the phone**
  - Pass: A search icon or field is visible in the phone header on home and collection pages.
  - Fails: No search on mobile, or search hidden inside the menu.
  - How we check: Headless phone visit of home and collection: locate search inputs or search icons in the header and check they are visible in the first viewport.
  - Action: Turn on the search icon in the mobile header in your theme settings.
  - Done when: Search shows in the phone header on home and collection pages.
  - Selected because: Product-finding lever, tested (2 of 5 failed); simple theme fix.
- **SO-CRO-24 Filter and sort are available on phone collection pages**
  - Pass: The collection page on a phone has visible filter and sort controls (including price), reachable without scrolling the whole list.
  - Fails: Filters exist on desktop only, or there is no way to sort or filter on mobile.
  - How we check: Headless phone visit of the collection page: find filter and sort controls and check they are visible in the first viewport or a sticky bar; note whether a price filter exists. Compare with desktop.
  - Action: Turn on mobile filters and sort for collections in the theme, including a price filter.
  - Done when: A phone screenshot of the collection shows filter and sort controls.
  - Selected because: Mobile product finding on collection pages; tested; theme setting.
- **SO-CRO-25 No heavy autoplay video on the phone first screen**
  - Pass: The phone home page first screen shows products or an image, not an autoplay video.
  - Fails: An autoplay video fills the phone first screen, delaying the page and pushing products down.
  - How we check: Headless phone visit of the home page: detect video elements with autoplay in the first viewport and record their file size from network requests. Screenshot.
  - Action: Replace the mobile hero video with an image, or set the video to play only on tap.
  - Done when: The phone home page first screen has no autoplay video.
  - Selected because: Current-tool point with a real mobile sales effect; owner can change the banner.

</details>

### Clarity (only when connected, outside the 50) — 3 points (3 need a new GA4 query · 0 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Why it matters | Sources |
|---|---|---|---|---|---|---|
| 1 | **Shoppers tap things that don't work on your top product page** <br><small>SO-CL-01</small> | medium | clarity 🆕 | owner, dev | When a shopper taps and nothing happens on the page that sells, some give up before Add to cart, and that is lost sales on your busiest product. | clarity-snapshot |
| 2 | **Errors on the pages where people buy** <br><small>SO-CL-02</small> | medium | clarity 🆕 | dev | An error on the product or cart page can stop the order at the last step, where every lost shopper was close to paying. | clarity-snapshot |
| 3 | **How far phone shoppers scroll on your top product page** <br><small>SO-CL-03</small> | medium | clarity 🆕 | owner, content | If phone shoppers never scroll to the delivery cost, payment options or reviews, they decide without the facts that make them buy. | clarity-snapshot |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **SO-CL-01 Shoppers tap things that don't work on your top product page**
  - Pass: On the most-visited product page in byUrl, the share of sessions with dead clicks and the share with rage clicks are each at or below the site-wide share (behaviours.deadClicks.sessionsPct, behaviours.rageClicks.sessionsPct).
  - Fails: The top product page has a higher share of sessions with dead clicks or rage clicks than the site average: shoppers tap the product image, size or colour swatch, price or delivery line and nothing happens, then tap again.
  - How we check: From the Clarity snapshot (store's own Clarity, last 3 days): pick the byUrl row with the most sessions whose URL matches a product-page pattern (Shopify /products/, Salla /p, Zid /products/; cross-check with the product URL from our headless visit). Compare its deadClicks % and rageClicks % with behaviours.deadClicks.sessionsPct and behaviours.rageClicks.sessionsPct. If byUrl is null or no product page is in it, mark 'unavailable'. Our headless phone visit of the same page can show which elements look tappable (images, swatches, badges) but are not links or buttons, as a hint for where to look.
  - Action: Open your top product page on your phone and tap everything that looks tappable: images, colour and size options, the price, delivery and payment badges. Make each one do something (zoom, select, open details) or make it look like plain text.
  - Done when: On the next 3-day snapshot, the top product page's dead-click and rage-click shares are at or below the site average.
  - Selected because: Pool had no measurable point; the snapshot's per-page dead and rage clicks show friction on the page that sells, with a fix the owner can test on their own phone.
- **SO-CL-02 Errors on the pages where people buy**
  - Pass: On the product page(s) and the cart page in byUrl, the share of sessions with script errors and with error clicks is at or below the home page's share and the site-wide share (behaviours.scriptErrors.sessionsPct, behaviours.errorClicks.sessionsPct).
  - Fails: Product or cart pages show more script errors or error clicks than the home page or the site average: a button, option picker or the cart itself throws an error when shoppers use it.
  - How we check: From the Clarity snapshot: find byUrl rows for product pages (URL pattern as in SO-CL-01) and the cart page (/cart). Compare each row's scriptErrors % and errorClicks % with the home page row ('/') and with behaviours.scriptErrors.sessionsPct and behaviours.errorClicks.sessionsPct. Presence check: errorClicks above 0 on the cart page is reported even when below average. If byUrl is null, use the site-wide shares only and say per-page data is unavailable. Our headless visit (product page plus one add to cart) logs console errors on the same pages; list any that match.
  - Action: Send this to your developer: the product and cart pages throw more errors than the rest of the store. Ask them to open those pages on a phone, check the browser console, and fix the errors that fire when someone picks an option or taps Add to cart.
  - Done when: On the next 3-day snapshot, product and cart pages show script-error and error-click shares at or below the home page and the site average, and our visit logs no console errors there.
  - Selected because: Script errors and error clicks on the pages that sell are a direct sales leak, decided by code from the snapshot and backed by our own visit.
- **SO-CL-03 How far phone shoppers scroll on your top product page**
  - Pass: Phone sessions scroll at least as far as desktop sessions (byDevice scrollDepth, mobile vs desktop), and the top product page's scrollDepth is at or above the site average scrollDepth.
  - Fails: Phone shoppers stop scrolling earlier than desktop shoppers, or the top product page is scrolled less than the rest of the store, so delivery cost, payment options (mada, Apple Pay, Tabby, Tamara, COD) and reviews lower on the page go unseen.
  - How we check: From the Clarity snapshot: compare byDevice mobile scrollDepth with desktop scrollDepth, and the top product page's byUrl scrollDepth (URL pattern as in SO-CL-01) with the site scrollDepth. If byDevice or byUrl is null, decide on what is present and mark the rest unavailable. Context, not part of pass/fail: our headless phone visit measures how far down the page (as % of page height) the price, Add to cart, delivery and payment info and reviews sit, so the report can say which of them sit below the average scroll point.
  - Action: On the phone layout of your top product page, move the delivery cost, payment options and a short review summary up, close to the price and Add to cart, so shoppers see them without scrolling far.
  - Done when: Delivery, payment and review info sit above the page's average phone scroll point on our phone visit, and the next snapshot shows phone scroll depth no lower than desktop.
  - Selected because: Scroll depth by device and page shows whether phone shoppers reach the trust and payment info; the owner can move that content in the admin.

</details>

## Media buyer (ICP2)


### GA4 — 25 points (12 need a new GA4 query · 19 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Ad effect | Why it matters | Sources |
|---|---|---|---|---|---|---|---|
| 1 | **Paid campaign that brings clicks but almost no sales** <br><small>MB-GA4-01</small> | critical | ga4_fact | marketing, dev | cost | Paid clicks on this campaign are likely lost after landing, so CAC is higher than it needs to be; fixing the page or the destination is expected to raise ROAS on the same spend. | EXIST-GA4-07 |
| 2 | **GA4 records more purchases than real orders** <br><small>MB-GA4-02</small> | critical | ga4_report 🆕 | dev | inflated | Duplicate purchases make reported ROAS read higher than real, so losing campaigns can look like winners; fixing it may lower reported ROAS, which is the truth showing, not performance dropping. | EXIST-GA4-18, CHK-C-025, CHK-C-009 |
| 3 | **GA4 purchase revenue zero, in mixed currencies, or not matching its items** <br><small>MB-GA4-03</small> | critical | ga4_report 🆕 | dev | deflated | Missing or wrong values make reported ROAS read lower than real, so value-based bidding learns from bad numbers and winning campaigns can get cut. | EXIST-GA4-18, CHK-C-030 |
| 4 | **Where paid visitors drop after the click** <br><small>MB-GA4-04</small> | critical | ga4_report 🆕 | dev, owner | performance | Closing the worst post-click step converts more of the same paid clicks, so CVR and ROAS are expected to rise and CAC to fall. | EXIST-GA4-01, EXIST-GA4-02, EXIST-GA4-03, EXIST-GA4-04, CHK-C-027 |
| 5 | **Key events count only real sales** <br><small>MB-GA4-05</small> | critical | ga4_fact | marketing, dev | inflated | Non-sale key events make reported conversions and ROAS read higher than real, and Google Ads bids on actions that are not sales. | EXIST-GA4-20, CHK-A-015, CHK-A-026 |
| 6 | **Tracking live with no sudden drop** <br><small>MB-GA4-06</small> | critical | ga4_fact | dev | deflated | When tracking drops, GA4 misses sales, so reported ROAS reads lower than real and good campaigns can get cut. | EXIST-GA4-15 |
| 7 | **Payment gateways taking credit for paid sales** <br><small>MB-GA4-07</small> | medium | ga4_fact | marketing, dev | deflated | Sales credited to a gateway are taken from your campaigns, so paid ROAS in GA4 reads lower than real. | EXIST-GA4-19, CHK-A-010 |
| 8 | **Paid landing pages that don't convert** <br><small>MB-GA4-08</small> | medium | ga4_report 🆕 | dev, marketing | performance | Paid clicks landing on a weak page are bought and lost, so CVR is low and CAC higher than it needs to be; fixing it is expected to raise ROAS. | EXIST-GA4-06 |
| 9 | **Paid sessions with an unknown source** <br><small>MB-GA4-09</small> | medium | ga4_fact | marketing | deflated | Paid sales hidden in Unassigned are not credited to your campaigns, so paid ROAS in GA4 reads lower than real. | EXIST-GA4-08, CHK-A-040, CHK-A-014 |
| 10 | **Session breaks between store domains** <br><small>MB-GA4-10</small> | medium | ga4_report 🆕 | dev | deflated | Each session break hands the sale to a self-referral, so paid ROAS reads lower than real and fewer purchases reach the campaign that earned them. | CHK-A-003 |
| 11 | **Clean UTM names on paid links** <br><small>MB-GA4-11</small> | medium | ga4_report 🆕 | marketing | deflated | Split or broken UTM values scatter paid sales across rows and channels, so campaign ROAS in GA4 reads lower than real and winners are harder to spot. | CHK-B-039, CHK-B-036, CHK-B-041 |
| 12 | **Paid traffic on phones vs desktop** <br><small>MB-GA4-12</small> | medium | ga4_report 🆕 | dev | performance | Paid clicks on phones that cannot convert raise CAC; fixing the phone page is expected to lift CVR and ROAS on mobile placements. | EXIST-GA4-05 |
| 13 | **Paid sales from new buyers vs returning ones** <br><small>MB-GA4-13</small> | medium | ga4_report 🆕 | marketing | inflated | When paid purchases come mostly from people who already buy from the store, reported ROAS reads higher than the new demand the ads create, and CAC for new customers is higher than it looks. | EXIST-GA4-12 |
| 14 | **Paid sessions that look like bots** <br><small>MB-GA4-14</small> | medium | ga4_report 🆕 | marketing | cost | Bot or junk clicks are paid for but can never buy, so CAC is higher than it needs to be and CVR reads lower than real. | CHK-C-001, CHK-C-024 |
| 15 | **Google Ads linked to GA4** <br><small>MB-GA4-15</small> | medium | ga4_fact | marketing | optimization | Without the link, Google bidding and audiences miss GA4 sales data, so Smart Bidding learns from less signal; fixing it is expected to improve ROAS over time. | EXIST-GA4-21, CHK-A-018 |
| 16 | **Funnel events all reach GA4 with sane counts** <br><small>MB-GA4-16</small> | medium | ga4_report 🆕 | dev | optimization | Missing funnel events mean fewer signals and smaller retargeting audiences, so the algorithm learns slower and CAC stays higher. | EXIST-GA4-17, CHK-C-022, EXIST-GTM-06 |
| 17 | **Attribution settings that decide paid credit** <br><small>MB-GA4-17</small> | medium | ga4_report 🆕 | marketing | optimization | The attribution model decides how much of each sale GA4 gives to paid channels and to imported Google Ads conversions, so an unplanned setting can move paid ROAS in GA4 with no change in the ads. | CHK-A-013 |
| 18 | **Retargeting audiences ready** <br><small>MB-GA4-18</small> | medium | ga4_fact | marketing | optimization | Without these audiences you cannot retarget people who already viewed or carted from GA4 data, so retargeting reach and ROAS are lower than they could be. | EXIST-GA4-14, CHK-A-021 |
| 19 | **Product pages that get views but no add to cart** <br><small>MB-GA4-19</small> | medium | ga4_fact | content, owner | performance | Paid clicks sent to a product that does not add to cart are wasted, so CAC rises; fixing the page or switching the product is expected to lift CVR. | EXIST-GA4-10 |
| 20 | **Order value vs free-shipping threshold** <br><small>MB-GA4-20</small> | medium | ga4_fact | owner | aov | A threshold just above AOV encourages bigger baskets, so AOV and ROAS are expected to rise at the same CAC. | EXIST-GA4-11 |
| 21 | **Countries that get visits but never buy** <br><small>MB-GA4-21</small> | low | ga4_fact | marketing | cost | Paid clicks from countries the store does not sell to cannot convert, so CAC is higher than it needs to be. | EXIST-GA4-09 |
| 22 | **Data comes only from the live store** <br><small>MB-GA4-22</small> | low | ga4_report 🆕 | dev | inflated | Test orders and unknown hostnames add purchases that never happened, so reported ROAS can read higher than real. | CHK-A-019 |
| 23 | **Internal links that overwrite the ad source** <br><small>MB-GA4-23</small> | low | crawl | dev, content | deflated | Each internal UTM click takes the sale away from your campaign, so paid ROAS in GA4 reads lower than real. | CHK-B-040 |
| 24 | **Hours and days that convert** <br><small>MB-GA4-24</small> | low | ga4_fact | marketing | cost | Spend in hours that rarely convert raises CAC; moving it is expected to lower CAC on the same budget. | EXIST-GA4-16 |
| 25 | **Property currency and timezone match the store** <br><small>MB-GA4-25</small> | low | ga4_fact | marketing | deflated | A wrong currency or timezone makes GA4 revenue and daily numbers disagree with Ads Manager and the store admin, so GA4 ROAS checks are off. | EXIST-GA4-22, CHK-A-001 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **MB-GA4-01 Paid campaign that brings clicks but almost no sales**
  - Pass: No paid campaign with real session volume converts near zero in GA4 over the last 28 days.
  - Fails: A paid campaign brings many sessions with almost no purchases; GA4 names the campaign and the landing page it sends people to.
  - How we check: GA4 fact GA4-07: run_report 28 days, dimensions=[sessionCampaignName, sessionDefaultChannelGroup, landingPage], metrics=[sessions, transactions], paid channel groups only; rank by sessions and flag campaigns with real volume and near-zero transactions.
  - Action: Check that campaign's landing page against the ad promise. Point the campaign to a page that sells, or pause it while the developer fixes the page.
  - Done when: The campaign is paused or points to a new landing page, and its GA4 conversion rate is up over the next 14 days.
  - Selected because: Answers 'ads or site?' directly with a named campaign and landing page from the store's own GA4.
- **MB-GA4-02 GA4 records more purchases than real orders**
  - Pass: purchase event count equals transactions, and no transaction ID appears on more than one purchase event.
  - Fails: purchase fires more than once per order (thank-you page refresh, platform app plus GTM, two tags), so GA4 shows more purchases than real orders.
  - How we check: GA4: run_report 28 days eventName=purchase metrics=[eventCount, transactions]; second run_report dimensions=[transactionId] metrics=[eventCount], count IDs with eventCount above 1 and purchases with transactionId (not set).
  - Action: Forward to the developer: fire purchase once per order with a unique transaction_id, and block repeats when the thank-you page is refreshed or reopened.
  - Done when: purchase event count equals transactions over 7 days and no transaction ID repeats.
  - Selected because: Over-count is the top 'is the number real?' failure; this is the effect seen in GA4 order data, while the GTM list checks the Purchase tag setup that causes it.
- **MB-GA4-03 GA4 purchase revenue zero, in mixed currencies, or not matching its items**
  - Pass: Every purchase in GA4 carries a numeric value and the store currency, and item revenue adds up to purchase revenue apart from shipping and tax.
  - Fails: GA4 purchase revenue is zero or missing, more than one currency shows on purchases, or item revenue does not add up to purchase revenue (missing or duplicated items, value sent as text).
  - How we check: GA4: run_report 28 days eventName=purchase metrics=[eventCount, purchaseRevenue, itemRevenue]; run_report dimensions=[currencyCode] for purchase; flag zero revenue, more than one currency, or item revenue far from purchase revenue.
  - Action: Forward to the developer: the purchase event must send value as a number, the store currency, and the full items list.
  - Done when: purchaseRevenue is above zero, one currency shows on purchases, and item revenue matches purchase revenue apart from shipping and tax.
  - Selected because: Value and currency are what ROAS is built on; this reads the purchases GA4 actually stored, which the store visit cannot see because it stops at the cart.
- **MB-GA4-04 Where paid visitors drop after the click**
  - Pass: For paid sessions, each step (view_item to add_to_cart, add_to_cart to begin_checkout, begin_checkout to purchase) is at or above the tool's step benchmark.
  - Fails: One step loses most paid visitors; the worst step is named with the page behind it.
  - How we check: GA4: run_report 28 days dimensions=[eventName, sessionDefaultChannelGroup] metrics=[totalUsers] for view_item, add_to_cart, begin_checkout, purchase, paid channel groups only; compare each step with the GA4-01 benchmarks and name the worst. Checkout steps come from GA4 only; the headless visit does not go past the cart.
  - Action: Forward the worst step and its page to the owner and developer; the Conversion review lists what is wrong on that page.
  - Done when: That step's rate for paid sessions is up over 14 days in GA4.
  - Selected because: The core 'does paid traffic convert?' answer; the four current funnel points measure one funnel, so they merge into one paid-only point.
- **MB-GA4-05 Key events count only real sales**
  - Pass: purchase is a key event, and no page_view, scroll, session_start, audience-trigger or other non-sale event is.
  - Fails: Non-sale events are marked as key events (key events: the actions GA4 counts as conversions), so conversion rates can go above 100% and imported conversions count actions that are not sales.
  - How we check: GA4 fact GA4-20: list_key_events; flag purchase missing, any noise or audience-trigger event marked as a key event, and key events with zero count in the period.
  - Action: Mark purchase as a key event and unmark the rest (GA4 edit access); then check which GA4 conversions Google Ads imports.
  - Done when: The key events list shows only real conversions and the session key event rate is below 100%.
  - Selected because: Named in the persona spec as a core over-count cause; decided by code from the key events list.
- **MB-GA4-06 Tracking live with no sudden drop**
  - Pass: Events flow in realtime, and sessions and purchases show no unexplained drop week on week.
  - Fails: No live users, or sessions fell over 40% week on week, often after a site release or GTM publish.
  - How we check: GA4 fact GA4-15: run_realtime_report activeUsers; run_report sessions and purchase eventCount for the last 7 vs the prior 7 days.
  - Action: Ask the developer what changed in the last GTM publish or site release and restore the tag.
  - Done when: Realtime shows events and the week-on-week drop is explained or gone.
  - Selected because: A broken tag invalidates every other number; must be ruled out before judging campaigns.
- **MB-GA4-07 Payment gateways taking credit for paid sales**
  - Pass: No payment gateway (Tabby, Tamara, Tap, PayTabs, a bank 3-D Secure page) shows as a session source.
  - Fails: Gateway domains show as referral sources with purchases, taking credit from the paid campaign that brought the buyer.
  - How we check: GA4 fact GA4-19: run_report dimensions=[sessionSource, sessionMedium] metrics=[sessions, transactions], matched against a gateway domain list.
  - Action: Add the gateway domains to the unwanted referrals list in the GA4 data stream (whoever has GA4 edit access).
  - Done when: No gateway domain appears as a source with purchases over 7 days.
  - Selected because: Common in GCC stores using BNPL; the persona spec names it directly.
- **MB-GA4-08 Paid landing pages that don't convert**
  - Pass: No landing page with real paid traffic converts under a third of the store average.
  - Fails: A landing page that gets a large share of paid sessions converts under a third of the store average.
  - How we check: GA4: run_report 28 days dimensions=[landingPage, sessionDefaultChannelGroup] metrics=[sessions, transactions], paid channel groups only; compare each page with the store average (GA4-06 rule).
  - Action: Send ad traffic to a page that converts, and forward this page to the developer with the Conversion review findings for it.
  - Done when: The page converts at half the store average or more, or no paid traffic lands on it.
  - Selected because: Page-level view across campaigns; the current point covers all traffic, the buyer needs paid only.
- **MB-GA4-09 Paid sessions with an unknown source**
  - Pass: Unassigned and (not set) are under 10% of sessions, and paid traffic lands in a paid channel group.
  - Fails: Over 10% of sessions have no known channel, or paid campaigns fall into Unassigned or Referral because of untagged links or mediums GA4 does not recognise.
  - How we check: GA4 fact GA4-08: run_report 28 days dimensions=[sessionDefaultChannelGroup] metrics=[sessions, transactions]; list the top source/medium pairs inside Unassigned.
  - Action: Tag every ad, bio, WhatsApp and SMS link with UTMs; for Unassigned pairs from ad platforms, change utm_medium to a value GA4 counts as paid.
  - Done when: Unassigned under 5% of sessions and no ad platform source sits in Unassigned.
  - Selected because: Unattributed sessions hide paid results; the buyer can fix most of it in their own ad URLs.
- **MB-GA4-10 Session breaks between store domains**
  - Pass: The store's own domains and checkout domain never show as a session source, and links to other store domains carry the _gl linker.
  - Fails: The store's own domain, checkout subdomain or app domain appears as a referral source, so the session restarts and the purchase loses the campaign that brought it.
  - How we check: GA4: run_report 28 days dimensions=[sessionSource, sessionMedium] metrics=[sessions, transactions], flag the store's own hostnames and checkout domains; headless visit: check whether links to other store domains get a _gl parameter.
  - Action: Forward to the developer: set up cross-domain measurement for every store and checkout domain in the GA4 data stream, and list own domains as unwanted referrals.
  - Done when: No own or checkout domain shows as a source with purchases over 7 days.
  - Selected because: Under-credit at checkout is high value for the buyer; self-referrals are readable in GA4.
- **MB-GA4-11 Clean UTM names on paid links**
  - Pass: Paid source, medium and campaign values are lowercase, consistent per platform, use mediums GA4 recognises, and contain no placeholders or broken encoding.
  - Fails: One platform appears under several spellings (Facebook, facebook, fb), mediums are invented, or values hold unresolved placeholders ({{campaign.name}}, %7B) or encoded ampersands that break the parameters after them.
  - How we check: GA4: run_report 28 days dimensions=[sessionSource, sessionMedium, sessionCampaignName] metrics=[sessions, transactions]; code flags case variants of one source, placeholder patterns ({{, }}, %7B, %7D, &amp;), mediums outside GA4's paid list, and offline values such as utm_medium=qr that land in Unassigned.
  - Action: Fix the URL parameters in your ad templates (Meta, Snap, TikTok, Google) to one lowercase naming scheme, and check that dynamic placeholders resolve.
  - Done when: Each platform shows under one source/medium pair in GA4 and no placeholder values appear for 7 days.
  - Selected because: The buyer owns the UTMs, so this is the one GA4 fix they can make themselves today.
- **MB-GA4-12 Paid traffic on phones vs desktop**
  - Pass: For paid sessions, mobile conversion is at least 60% of desktop.
  - Fails: Paid mobile sessions convert under 60% of paid desktop sessions, with enough visits on both.
  - How we check: GA4: run_report 28 days dimensions=[deviceCategory, sessionDefaultChannelGroup] metrics=[sessions, transactions], paid channel groups only (GA4-05 rule).
  - Action: Forward the phone screenshots of the worst page to the developer, and fix the phone issues before scaling mobile placements.
  - Done when: Paid mobile conversion at 60% or more of paid desktop over 14 days.
  - Selected because: Device gap on paid sessions points to a site problem, not an ad problem.
- **MB-GA4-13 Paid sales from new buyers vs returning ones**
  - Pass: New-user paid sessions record purchases, and paid purchases are not almost all from returning users.
  - Fails: Most paid purchases come from returning users while new-user paid sessions convert near zero, so paid campaigns mostly re-buy people who already know the store.
  - How we check: GA4: run_report 28 days dimensions=[newVsReturning, sessionDefaultChannelGroup] metrics=[sessions, transactions, purchaseRevenue], paid channel groups only; compare new and returning conversion and each one's share of paid purchases. Extends current fact GA4-12 (returning vs new conversion) to paid sessions.
  - Action: If paid sales lean on returning users, split prospecting and retargeting budgets and judge prospecting on new-user sales; forward the pages new paid visitors land on to the Conversion review.
  - Done when: New-user paid sessions show purchases in GA4, and the new vs returning split is reviewed per campaign each month.
  - Selected because: Backfill: tells the buyer whether paid traffic wins new buyers or re-buys existing ones, from the store's own GA4 new vs returning data.
- **MB-GA4-14 Paid sessions that look like bots**
  - Pass: No paid source, campaign or placement brings sessions with near-zero engagement and no add_to_cart, and no session spike shows without matching purchases.
  - Fails: One paid source or placement sends many sessions with almost no engagement time and no product views, or sessions jump with no change in purchases.
  - How we check: GA4: run_report 28 days dimensions=[sessionSource, sessionMedium, sessionCampaignName] metrics=[sessions, engagementRate, userEngagementDuration, addToCarts, transactions], compare each paid row with the store's paid average; run_report dimensions=[date] for 90 days to find spikes without purchases.
  - Action: Exclude that placement, audience network or source in the ad platform, then watch engaged sessions.
  - Done when: The flagged source's sessions drop, or its engagement rate matches the rest of paid traffic over 14 days.
  - Selected because: Wasted paid clicks the buyer can act on in their own ad account, found from GA4 engagement data.
- **MB-GA4-15 Google Ads linked to GA4**
  - Pass: Google Ads is linked to this GA4 property.
  - Fails: No Google Ads link, so GA4 audiences and conversions cannot reach Google Ads and GA4 shows no Google Ads cost.
  - How we check: GA4 fact GA4-21: list_google_ads_links. Whether purchase is the primary conversion in Google Ads is not verifiable from the audit: check in Google Ads.
  - Action: Link Google Ads to GA4 (needs GA4 edit and Google Ads admin access) and import purchase as the primary conversion.
  - Done when: The link shows in GA4 Admin and purchase is a primary conversion in Google Ads.
  - Selected because: Direct signal path for Google campaigns; readable from the Admin API.
- **MB-GA4-16 Funnel events all reach GA4 with sane counts**
  - Pass: view_item, add_to_cart, begin_checkout and purchase all record in GA4, and begin_checkout is in line with views of the checkout page.
  - Fails: A funnel event is missing or far too low in GA4, or begin_checkout differs a lot from checkout page views, so a trigger is broken.
  - How we check: GA4 fact GA4-17: run_report dimensions=[eventName] metrics=[eventCount] for the ecommerce events; plus run_report dimensions=[pagePath] metrics=[screenPageViews] for checkout pages compared with the begin_checkout count.
  - Action: Forward to the developer: add or fix the missing event so every funnel step reaches GA4.
  - Done when: Every funnel step shows in GA4 with counts that match views of its page.
  - Selected because: Without complete events the paid funnel cannot be measured; GA4's own counts show whether each step arrives, whatever sends it, so the container-only 'tag exists' check was merged here.
- **MB-GA4-17 Attribution settings that decide paid credit**
  - Pass: The GA4 reporting attribution model is data-driven or another model the team chose on purpose, and the key event lookback windows are not shortened from GA4's defaults.
  - Fails: The model is set to a Google-paid-channels-only last click, or lookback windows are shortened, so GA4 and the conversions Google Ads imports from it credit paid channels differently from what the team assumes.
  - How we check: GA4 admin: get_attribution_settings; read reportingAttributionModel, acquisitionConversionEventLookbackWindow and otherConversionEventLookbackWindow; flag a Google-paid-only model or windows shorter than GA4's defaults.
  - Action: Set the reporting attribution model and lookback windows on purpose in GA4 admin (GA4 edit access), note the change date, and compare campaign numbers only across periods with the same setting.
  - Done when: The model and windows are the ones the team chose, and the change date is recorded.
  - Selected because: Backfill: the one GA4 setting that directly changes paid credit; readable through the Admin API.
- **MB-GA4-18 Retargeting audiences ready**
  - Pass: Cart-abandoner or product-viewer audiences exist and Google Ads is linked.
  - Fails: Only GA4's default audiences exist, or there is no Google Ads link to use them in.
  - How we check: GA4 fact GA4-14: list_audiences and list_google_ads_links.
  - Action: Create cart-abandoner and product-viewer audiences in GA4 and share them with Google Ads.
  - Done when: Both audiences exist and show users in Google Ads.
  - Selected because: A buyer-owned lever that is readable from the Admin API.
- **MB-GA4-19 Product pages that get views but no add to cart**
  - Pass: No popular product's add-to-cart rate is far below the store average.
  - Fails: A product page with many views adds to cart at under half the store average.
  - How we check: GA4 fact GA4-10: run_report 28 days dimensions=[pagePath, eventName] metrics=[eventCount] for view_item and add_to_cart.
  - Action: If you run ads to this product, forward it to the owner (price, photos, stock, size info on that page), or move spend to products that add to cart.
  - Done when: That product's add-to-cart rate reaches the store average, or ads no longer point to it.
  - Selected because: Tells the buyer which product to stop advertising or forward for a fix.
- **MB-GA4-20 Order value vs free-shipping threshold**
  - Pass: The free-shipping threshold sits at 1.1–1.6× the average order value.
  - Fails: No threshold found on the site, or it sits below or far above the average order value.
  - How we check: GA4 fact GA4-11: AOV from purchaseRevenue / transactions, 28 days; threshold read from the live store pages and the cart in the headless visit.
  - Action: Ask the owner to set free shipping at about 1.3× AOV and show it in the cart.
  - Done when: Threshold set at 1.2–1.5× AOV and visible in the cart.
  - Selected because: An AOV lever measured against this store's own GA4 AOV, not a generic best practice.
- **MB-GA4-21 Countries that get visits but never buy**
  - Pass: Countries with real traffic also produce sales.
  - Fails: A country with a real share of sessions, often from paid channels, has zero purchases.
  - How we check: GA4 fact GA4-09: run_report 28 days dimensions=[country, sessionDefaultChannelGroup] metrics=[sessions, transactions].
  - Action: Exclude those countries from ad targeting, or confirm with the owner that the store ships there.
  - Done when: Paid sessions from those countries close to zero.
  - Selected because: Wasted paid clicks the buyer can stop in targeting settings.
- **MB-GA4-22 Data comes only from the live store**
  - Pass: All sessions and purchases come from the store's live hostnames.
  - Fails: Staging, preview, localhost, theme-editor or unknown hostnames send sessions or test purchases into the live property.
  - How we check: GA4: run_report 28 days dimensions=[hostName] metrics=[sessions, transactions, purchaseRevenue]; flag any hostname that is not the store's live domain or checkout domain.
  - Action: Forward to the developer: send test and staging traffic to a separate GA4 property, and filter unknown hostnames.
  - Done when: Only live store hostnames appear in GA4 over 7 days.
  - Selected because: Catches fake purchases in the live numbers with one hostname report.
- **MB-GA4-23 Internal links that overwrite the ad source**
  - Pass: No internal link on the store carries utm_ parameters.
  - Fails: Banners, menus or home-page sliders link to the store's own pages with UTMs, which start a new session and replace the paid source.
  - How we check: Public crawl of home, one collection, one product and the cart: list links to the store's own domain whose href has utm_source, utm_medium or utm_campaign; GA4 cross-check: sessionSource values that match those internal tags.
  - Action: Forward to the developer or content team: remove UTMs from internal links and use GA4 events for banner clicks.
  - Done when: The crawl finds no internal link with UTMs.
  - Selected because: A hidden under-credit cause that the crawl proves link by link.
- **MB-GA4-24 Hours and days that convert**
  - Pass: Conversion is about even across the day and week.
  - Fails: Some hours or weekdays convert far better than others, with enough volume to act on.
  - How we check: GA4 fact GA4-16: run_report 28 days dimensions=[dayOfWeek, hour] metrics=[sessions, transactions].
  - Action: Shift budget or set an ad schedule toward the hours and days that convert, where the platform allows it.
  - Done when: Ad schedule or budget split set to match in the ad accounts.
  - Selected because: A budget decision the buyer makes alone, from the store's own GA4 data.
- **MB-GA4-25 Property currency and timezone match the store**
  - Pass: Property currency and timezone match the store's main market.
  - Fails: Currency or timezone differs from the country most sessions and sales come from, so revenue shows in another currency and days do not line up with the ad platforms or the store admin.
  - How we check: GA4 fact GA4-22: get_property (currencyCode, timeZone), compared with the top country by sessions and transactions.
  - Action: Set the GA4 property currency and timezone to the store's market (GA4 edit access).
  - Done when: Property settings show the store's currency and timezone.
  - Selected because: Revenue currency and day boundaries decide whether GA4 and the ad platforms can be compared.

</details>

### GTM — 25 points (0 need a new GA4 query · 14 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Ad effect | Why it matters | Sources |
|---|---|---|---|---|---|---|---|
| 1 | **Purchase tags fire on a thank-you page view or without an order ID** <br><small>MB-GTM-01</small> | critical | gtm_read | dev | inflated | A repeat Purchase makes reported ROAS read higher than real, so losing campaigns can look like winners and get scaled; fixing it may lower reported ROAS, which is the truth showing. | EXIST-GTM-01, EXIST-GTM-07, CHK-A-078, CHK-B-006, CHK-B-014, CHK-B-003 |
| 2 | **Shopify checkout purchases actually reach the platforms** <br><small>MB-GTM-02</small> | critical | gtm_read | dev | deflated | Sales that never fire make reported ROAS read lower than real, so winning campaigns can get cut and the algorithm learns from fewer purchases. | EXIST-GTM-21 |
| 3 | **Purchase tags mapped to value, currency and items** <br><small>MB-GTM-03</small> | critical | gtm_read | dev | deflated | Without value and currency on Purchase the platforms can't see revenue, so reported ROAS reads low or blank and value-based bidding has nothing to learn from. | EXIST-GTM-02, CHK-A-045, CHK-A-048 |
| 4 | **Consent default set first in the container, per region** <br><small>MB-GTM-04</small> | critical | gtm_read | dev, owner | deflated | Blocked tags hide real sales from every platform, so reported ROAS reads lower than real and the algorithm learns from a fraction of buyers. | EXIST-GTM-16, EXIST-GTM-25, CHK-B-023, CHK-B-024 |
| 5 | **Meta events carry an event_id for CAPI dedupe** <br><small>MB-GTM-05</small> | medium | gtm_read | dev | inflated | With Pixel plus CAPI and no shared event_id, Meta can count a sale twice, so reported ROAS reads higher than real. | EXIST-GTM-03, CHK-A-054 |
| 6 | **Meta tags set up for every funnel step** <br><small>MB-GTM-06</small> | critical | gtm_read | dev | optimization | Missing funnel events leave Meta optimising on thin signal, so delivery finds fewer buyers and CAC likely runs higher than it needs to. | EXIST-GTM-04, CHK-A-055 |
| 7 | **Container sends data to IDs the store doesn't own** <br><small>MB-GTM-07</small> | medium | gtm_read | dev, marketing | deflated | Events sent to an old or foreign pixel never reach the account you bid in, so that account learns from fewer sales and reported ROAS reads lower than real. | EXIST-GTM-10, EXIST-GTM-20 |
| 8 | **Server route for Meta CAPI, Snap CAPI and TikTok Events API** <br><small>MB-GTM-08</small> | medium | gtm_read | dev | deflated | Browser-only tracking misses blocked sales, so reported ROAS reads lower than real and the algorithm learns from fewer buyers. | CHK-B-054, CHK-B-060, CHK-B-055 |
| 9 | **Conversion tags that fire on every page** <br><small>MB-GTM-09</small> | medium | gtm_read | dev | inflated | A conversion tag on every page counts visits as sales or adds, so reported conversions and ROAS read higher than real and the algorithm chases the wrong people. | CHK-A-047 |
| 10 | **Add to Cart tags triggered by a button click, not the add event** <br><small>MB-GTM-10</small> | medium | gtm_read | dev | optimization | A click-based Add to Cart feeds the algorithm false intent, so ATC-optimised campaigns and retargeting audiences are built on clicks that weren't adds. | EXIST-GTM-24, CHK-A-046 |
| 11 | **Google Ads conversion tag, Conversion Linker and Enhanced Conversions set** <br><small>MB-GTM-11</small> | medium | gtm_read | dev, marketing | deflated | Missing conversions or no Conversion Linker leave Smart Bidding with fewer sales, so Google's reported ROAS reads lower than real. | EXIST-GTM-05, EXIST-GTM-14, CHK-B-044 |
| 12 | **Snap tags set up for the funnel your Snap ads need** <br><small>MB-GTM-12</small> | medium | gtm_read | dev | optimization | Without Snap events, Snap campaigns optimise on clicks instead of buyers, so CAC on Snap likely runs higher than it needs to. | EXIST-GTM-04, CHK-B-058 |
| 13 | **Snap events carry a dedupe id for Snap CAPI** <br><small>MB-GTM-13</small> | medium | gtm_read | dev | inflated | Pixel plus CAPI without a shared id can count one Snap sale twice, so Snap's reported ROAS reads higher than real. | CHK-B-055, CHK-A-054 |
| 14 | **TikTok tags set up for the funnel your TikTok ads need** <br><small>MB-GTM-14</small> | medium | gtm_read | dev | optimization | Without TikTok events, TikTok optimises on clicks instead of buyers, so CAC on TikTok likely runs higher than it needs to. | EXIST-GTM-04, CHK-B-058 |
| 15 | **TikTok events carry an event_id for Events API dedupe** <br><small>MB-GTM-15</small> | medium | gtm_read | dev | inflated | Pixel plus Events API without a shared event_id can count one sale twice, so TikTok's reported ROAS reads higher than real. | CHK-B-055, CHK-A-054 |
| 16 | **Click-ID and analytics cookies last long enough** <br><small>MB-GTM-16</small> | medium | browser | dev | deflated | Short cookies cut the link between the ad click and a later purchase, so returning buyers show as direct and reported ROAS reads lower than real. | CHK-B-061, CHK-A-052 |
| 17 | **WhatsApp clicks tracked as a signal** <br><small>MB-GTM-17</small> | medium | gtm_read | dev | deflated | WhatsApp orders that never fire an event make your campaigns look like they sell less than they do, so reported ROAS reads lower than real. | EXIST-GTM-11, CHK-B-048 |
| 18 | **Accepting the banner late still credits the ad** <br><small>MB-GTM-18</small> | low | browser | dev | deflated | Visitors who accept late get credited to direct, so paid campaigns look weaker than they are and reported ROAS reads low. | CHK-B-032 |
| 19 | **Built-in variables your triggers need are switched on** <br><small>MB-GTM-19</small> | medium | gtm_read | dev | deflated | A trigger that never fires means its events never reach GA4 or the platforms, so the conversions behind it go uncounted and reported ROAS reads lower than real. | CHK-A-072 |
| 20 | **Pixels pasted as Custom HTML and unknown scripts** <br><small>MB-GTM-20</small> | low | gtm_read | dev | optimization | Hand-pasted pixel code breaks quietly, so events and values can stop reaching the platforms and the signal campaigns learn from drifts from real. | CHK-A-063, EXIST-GTM-19 |
| 21 | **Team and staff visits marked so they don't count as shoppers** <br><small>MB-GTM-21</small> | low | gtm_read | dev, marketing | inflated | Team test orders and visits count as real buyers, so conversions can read higher than real, most of all on small stores. | EXIST-GTM-23, CHK-A-073 |
| 22 | **Page changes without a reload still send a page view** <br><small>MB-GTM-22</small> | low | gtm_read | dev | deflated | Missed page views after the landing page thin out the funnel and retargeting audiences, so the platforms learn from fewer product views. | CHK-C-014, CHK-A-057 |
| 23 | **Live site runs the latest published container version** <br><small>MB-GTM-23</small> | low | gtm_read | dev | optimization | If the live site runs an older version, fixes to Purchase or pixel tags don't take effect, so the platforms keep learning from the broken setup. | CHK-A-076 |
| 24 | **Snap, TikTok and Google event tags wait for their base tag** <br><small>MB-GTM-24</small> | low | gtm_read | dev | deflated | Events dropped at random mean the platforms see fewer adds and purchases than happened, so reported ROAS reads lower than real. | CHK-A-067 |
| 25 | **Custom JavaScript variables behind value and IDs only return a value** <br><small>MB-GTM-25</small> | low | gtm_read | dev | inflated | A variable that acts each time it is read can repeat events or blank the value, so conversions and revenue the platforms see drift from real. | CHK-A-050 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **MB-GTM-01 Purchase tags fire on a thank-you page view or without an order ID**
  - Pass: Every Purchase tag (GA4, Meta, Snap, TikTok, Google Ads) fires on the dataLayer purchase event, not on a thank-you page view, and sends the order's transaction_id (or the platform's order id / event_id).
  - Fails: A Purchase or conversion tag fires on a page-view trigger matching the thank-you URL, so a refresh or a back-button visit sends the order again; or no transaction_id is sent, so GA4 can't drop the repeat.
  - How we check: GTM read: list every purchase/conversion tag for each platform, its firing trigger (custom event vs page view + URL filter) and whether transaction_id (or the platform's order id) is mapped to an order variable. Fail on any URL-based purchase trigger or missing order id. Checkout is not observed in the browser, so the verdict comes from the container only.
  - Action: Ask the developer to fire every Purchase tag on the dataLayer purchase event and send the order id with it.
  - Done when: No purchase or conversion tag in the live container uses a page-view or URL trigger, and each one sends the order id.
  - Selected because: The setup that causes double purchases, read from the container; GA4's order data shows the effect as a separate finding.
- **MB-GTM-02 Shopify checkout purchases actually reach the platforms**
  - Pass: The store is not on Shopify, or begin_checkout and Purchase for each platform come from a Shopify Customer Events pixel or the platform's native Shopify app.
  - Fails: A Shopify store relies on GTM tags for checkout and Purchase, but GTM does not run inside Shopify checkout, so those events never fire.
  - How we check: Crawl/browser: detect Shopify. GTM read: find begin_checkout and Purchase tags and check whether they rely on triggers that can only fire inside checkout. Browser: look for the Shopify web pixel manager loading custom or app pixels on storefront pages. Checkout itself is not observed; say so.
  - Action: Ask the developer to send checkout and Purchase from a Shopify Customer Events custom pixel or the platform's own Shopify app, not from GTM.
  - Done when: No platform depends on a GTM-only Purchase tag on Shopify, and a custom or app pixel for each paid platform is visible on the storefront.
  - Selected because: A whole-store under-count on the most common platform; readable from container plus platform detection.
- **MB-GTM-03 Purchase tags mapped to value, currency and items**
  - Pass: Every platform's Purchase tag (GA4, Meta, Snap, TikTok, Google Ads) reads value as a number, the store's currency (SAR, AED, EGP and so on) and items from dataLayer variables whose paths match the store's purchase push.
  - Fails: On a Purchase tag, value or currency is missing, hard-typed, or read from a mistyped dataLayer path that returns undefined, or items/contents are not mapped.
  - How we check: GTM read: for each platform's Purchase tag, the value, currency and items/contents parameters and the variables behind them (paths such as ecommerce.value, ecommerce.currency, ecommerce.items, and any constant or Custom JavaScript used instead). Purchase is not observed in the browser, so the container is the only place its payload can be checked.
  - Action: Ask the developer to map value, currency and items from one set of dataLayer variables into every platform's Purchase tag.
  - Done when: Every Purchase tag reads value, currency and items from dataLayer variables with the store's real paths.
  - Selected because: Revenue the platforms never see; the Purchase payload is only checkable in the container because the visit stops at the cart.
- **MB-GTM-04 Consent default set first in the container, per region**
  - Pass: The consent template fires on Consent Initialization - All Pages before any other tag, its defaults are set per region (denied where the law requires it, granted where it doesn't, for example GCC and Egypt), and each ad tag's consent settings match the banner categories.
  - Fails: The consent default fires late on a page-view trigger, denies every tag in every region, or ad tags carry no or wrong consent settings, so Meta, Snap, TikTok and Google tags stay silent for visitors who never touch the banner or ignore the choice.
  - How we check: GTM read: the consent/CMP tag's trigger and firing order, its default parameters and region lists, and the consent settings on each Meta, Snap, TikTok, GA4 and Google Ads tag.
  - Action: Ask the developer to move the consent default to Consent Initialization, set it per region so GCC and Egypt visits record normally, and give every ad tag consent settings that match the banner.
  - Done when: The consent default fires on Consent Initialization with region rules, and every ad tag has consent settings that match the banner categories.
  - Selected because: Tested in audits (2 of 4 failed the default); the container setup behind consent, while the page-code list reads the consent state on live hits.
- **MB-GTM-05 Meta events carry an event_id for CAPI dedupe**
  - Pass: Every Meta Purchase and AddToCart tag sends an event_id from one shared variable that the Conversions API feed can reuse, unique per event.
  - Fails: The Pixel sends no event_id, or a fixed or reused value, so Pixel and CAPI copies of one sale can't be matched.
  - How we check: GTM read: eventID parameter on Meta Purchase and AddToCart tags and the variable behind it (unique per event, not a constant). Browser: the eid parameter on the live AddToCart hit after our click. Whether CAPI uses the same id is not visible from here; say so.
  - Action: Ask the developer to send a unique event_id on Meta Pixel events and pass the same id to the Conversions API.
  - Done when: Meta Purchase and AddToCart tags read eventID from a per-event variable, and the live AddToCart hit shows an eid.
  - Selected because: event_id dedupe is named in the spec; the browser side is fully checkable.
- **MB-GTM-06 Meta tags set up for every funnel step**
  - Pass: The container (or the Meta app) has ViewContent, AddToCart, InitiateCheckout and Purchase tags, each on the matching event, and the Pixel base code fires before them.
  - Fails: Meta paid traffic shows in GA4 but the container only sends PageView, Purchase or InitiateCheckout has no tag, or event tags fire before the base code loads and get dropped.
  - How we check: GA4 report: sessionSource/medium for facebook, instagram, meta paid traffic. GTM read: Meta tags for ViewContent, AddToCart, InitiateCheckout and Purchase, their triggers, and tag sequencing or priority so the base code fires first. Browser cross-check: ViewContent on the product page and AddToCart after our click on facebook.com/tr.
  - Action: Ask the developer to add the missing Meta events and fire the Pixel base code before them.
  - Done when: Tags for all four Meta events exist on the matching dataLayer events, sequenced after the base code, and ViewContent and AddToCart are seen live.
  - Selected because: Meta leads tracked spend; base-before-events was tested (2 of 3 stores failed). Per-event setup, distinct from whether a pixel loads at all.
- **MB-GTM-07 Container sends data to IDs the store doesn't own**
  - Pass: Every GA4, Meta, Snap, TikTok and Google Ads tag in the live container uses the store's own ID, ideally from one constant variable per platform, and no paused, triggerless or ex-agency tag is left.
  - Fails: Tags hold hard-coded or old IDs (a past agency's pixel, a second GA4 property), or dead tags from past vendors still fire, so part of the signal goes to an account you don't optimise.
  - How we check: GTM read: list every tag's platform and ID (direct or through variables), paused tags, tags with no trigger, and IDs that differ from the main one per platform; output the list for the buyer to match against the ad accounts they run.
  - Action: Confirm which IDs belong to your ad accounts, then ask the developer to remove the rest and move each ID into one constant variable.
  - Done when: Each platform has one ID in the live container and it is one you confirmed.
  - Selected because: Backfill: the container-only view of stray and ex-vendor IDs; the live double-hit check stays in the page-code list.
- **MB-GTM-08 Server route for Meta CAPI, Snap CAPI and TikTok Events API**
  - Pass: A server-side route for ad events is visible: a server GTM container (server_container_url or transport_url), first-party collection hits, or a detected platform app that sends server events, for each paid platform.
  - Fails: Every paid platform is browser-pixel only, so purchases blocked by ad blockers, Safari or iOS limits never reach Meta, Snap or TikTok.
  - How we check: GTM read: server_container_url / transport_url on the Google tag, server-bound tags or templates for Meta CAPI, Snap CAPI or TikTok Events API. Browser: hits to a first-party collection subdomain. Crawl: platform app scripts that offer server events. If an app is present but its server events can't be seen, mark 'not visible from outside', not failed.
  - Action: Ask the developer to add a server route (server GTM or each platform's server integration) for Purchase on Meta, Snap and TikTok, with the same event_id as the Pixel.
  - Done when: A server route is visible in the container or network for each paid platform.
  - Selected because: Tested (2 of 5 stores had no server route); kept to what the container and network show, no Events Manager data.
- **MB-GTM-09 Conversion tags that fire on every page**
  - Pass: Purchase, Add to Cart and lead conversion tags fire only on their own event, with trigger conditions (or trigger groups) that require every needed condition, never on All Pages.
  - Fails: A conversion tag sits on All Pages, on a broad page-view trigger with no condition, or on a trigger group missing a condition, so it fires on visits that are not conversions.
  - How we check: GTM read: the triggers on each conversion tag across platforms; flag All Pages, page-view triggers with no URL or event condition, and trigger groups that miss a required condition.
  - Action: Ask the developer to put each conversion tag on its own event trigger and remove All Pages from it.
  - Done when: No conversion tag in the live container fires on All Pages or an unconditioned trigger.
  - Selected because: Backfill: an over-count cause read directly from trigger conditions.
- **MB-GTM-10 Add to Cart tags triggered by a button click, not the add event**
  - Pass: Every platform's Add to Cart tag fires on the store's add-to-cart dataLayer event (or the theme's AJAX add event), not on a click, CSS-selector or form-submit trigger.
  - Fails: Add to Cart fires on a button-click or selector trigger, so it counts clicks that add nothing (no variant chosen, out of stock), or on a form-submit trigger that misses drawer and quick adds.
  - How we check: GTM read: the trigger type and conditions behind each platform's Add to Cart tag (custom event vs click, element selector or form submit).
  - Action: Ask the developer to trigger Add to Cart from the store's add-to-cart event, not from the button click.
  - Done when: Every Add to Cart tag uses a custom-event trigger on the store's add event.
  - Selected because: The trigger setup behind Add to Cart counts; our live click shows whether the event arrives, this shows whether it can fire on clicks that add nothing.
- **MB-GTM-11 Google Ads conversion tag, Conversion Linker and Enhanced Conversions set**
  - Pass: When Google Ads runs, the container has a Google Ads conversion tag (or GA4 import is used), a Conversion Linker on all pages, and Enhanced Conversions with user-provided data set on the conversion tag.
  - Fails: Google Ads traffic shows in GA4 but there is no conversion tag or Conversion Linker, or Enhanced Conversions is not set in the tag.
  - How we check: GA4 report: google / cpc traffic. GTM read: awct and Conversion Linker tags, their triggers, and the conversion tag's user-provided-data setting. The Google Ads account side is not checked; say so.
  - Action: Ask the developer to add the Google Ads conversion tag, a Conversion Linker on all pages and Enhanced Conversions in the tag.
  - Done when: The container has a conversion tag with user-provided data and a Conversion Linker on all pages.
  - Selected because: Google is the fourth platform in the spec; container setup only, the gclid survival test sits with the live click-ID check.
- **MB-GTM-12 Snap tags set up for the funnel your Snap ads need**
  - Pass: When Snapchat sends traffic, the container (or the Snap app) has VIEW_CONTENT, ADD_CART and PURCHASE tags on the matching events.
  - Fails: Snapchat paid traffic shows in GA4 but only PAGE_VIEW is set up, or PURCHASE has no tag.
  - How we check: GA4 report: sessionSource for snapchat paid traffic. GTM read: Snap tags for VIEW_CONTENT, ADD_CART and PURCHASE and their triggers. Browser cross-check: tr.snapchat.com hits for VIEW_CONTENT on the product page and ADD_CART after our click.
  - Action: Ask the developer to add the missing Snap events: VIEW_CONTENT, ADD_CART and PURCHASE.
  - Done when: Tags for all three Snap events exist on the matching events, and VIEW_CONTENT and ADD_CART are seen live.
  - Selected because: Snapchat leads reach in KSA; spec says score it after Meta. Per-event setup, distinct from whether the pixel loads.
- **MB-GTM-13 Snap events carry a dedupe id for Snap CAPI**
  - Pass: The Snap PURCHASE (and ADD_CART) tag sends client_dedup_id from a unique per-event variable that the Snap Conversions API feed can reuse.
  - Fails: No dedupe id, or a fixed value, so a Pixel sale and its CAPI copy can't be matched.
  - How we check: GTM read: client_dedup_id (or the template's dedupe field) on Snap PURCHASE and ADD_CART tags and the variable behind it. Browser: the dedupe field on the live ADD_CART hit. Whether Snap CAPI sends the same id is not visible; say so.
  - Action: Ask the developer to send a unique client_dedup_id on Snap events and the same id from Snap CAPI.
  - Done when: Snap PURCHASE and ADD_CART tags read a per-event dedupe id, and the live ADD_CART hit carries one.
  - Selected because: Snap pixel/CAPI dedupe requested for this persona; browser side checkable.
- **MB-GTM-14 TikTok tags set up for the funnel your TikTok ads need**
  - Pass: When TikTok sends traffic, the container (or the TikTok app) has ViewContent, AddToCart, InitiateCheckout and CompletePayment (or Purchase) tags on the matching events.
  - Fails: TikTok paid traffic shows in GA4 but only PageView is set up, or the purchase event has no tag.
  - How we check: GA4 report: sessionSource for tiktok paid traffic. GTM read: TikTok tags for ViewContent, AddToCart, InitiateCheckout and CompletePayment/Purchase and their triggers. Browser cross-check: analytics.tiktok.com hits for ViewContent on the product page and AddToCart after our click.
  - Action: Ask the developer to add the TikTok events that are missing.
  - Done when: Tags for all four TikTok events exist on the matching events, and ViewContent and AddToCart are seen live.
  - Selected because: TikTok named in the persona spec; per-event setup, distinct from whether the pixel loads.
- **MB-GTM-15 TikTok events carry an event_id for Events API dedupe**
  - Pass: The TikTok purchase and AddToCart tags send an event_id from a unique per-event variable that the Events API feed can reuse.
  - Fails: No event_id, or a fixed value, so pixel and Events API copies of one sale can't be matched.
  - How we check: GTM read: event_id on TikTok purchase and AddToCart tags and the variable behind it. Browser: event_id on the live AddToCart hit. Whether the Events API sends the same id is not visible; say so.
  - Action: Ask the developer to send a unique event_id on TikTok pixel events and the same id from the Events API.
  - Done when: TikTok purchase and AddToCart tags read a per-event event_id, and the live AddToCart hit carries one.
  - Selected because: TikTok Events API dedupe requested for this persona; browser side checkable.
- **MB-GTM-16 Click-ID and analytics cookies last long enough**
  - Pass: _ga, _fbc, _gcl_aw and the Snap and TikTok first-party cookies are set with a lifetime that covers a normal consideration window, and cookie variables in GTM read the right cookie names.
  - Fails: Cookies are set by script with a short or session-only lifetime, or a GTM cookie variable points at a wrong name, so a buyer who returns days after the ad click is no longer tied to it.
  - How we check: Browser (Chromium): after landing with test click IDs, read each cookie's expiry and whether it was set by script or by an HTTP header. GTM read: first-party cookie variables and their names compared with the cookies seen live. Safari and Firefox behaviour is not checked; say so.
  - Action: Ask the developer to set click-ID and analytics cookies with a long first-party lifetime (server-set where possible) and fix cookie variable names.
  - Done when: Every checked cookie has a lifetime longer than a session, and each GTM cookie variable matches a cookie seen live.
  - Selected because: High value for purchases made days after the click (I 4); about cookie lifetime, not whether the click ID arrives.
- **MB-GTM-17 WhatsApp clicks tracked as a signal**
  - Pass: The store has no WhatsApp or phone links, or clicks on them fire a GA4 event and a pixel event (for example Meta Contact) with the page.
  - Fails: The site has wa.me, api.whatsapp.com or tel: links and no tag tracks them, so orders that start in WhatsApp never reach GA4 or the ad platforms.
  - How we check: Browser: WhatsApp and tel: links found on home, product and cart. GTM read: link-click triggers on wa.me / api.whatsapp.com / tel: and the tags they fire.
  - Action: Ask the developer to track WhatsApp and call clicks in GA4 and in each paid platform's pixel.
  - Done when: A click on the store's WhatsApp link fires a GA4 event and a pixel event.
  - Selected because: Spec names WhatsApp orders that never fire as an under-count; links and triggers are both visible.
- **MB-GTM-18 Accepting the banner late still credits the ad**
  - Pass: When a banner shows, a visitor who lands from an ad and accepts a few seconds later still gets a page_view and pixel PageView with the original UTMs and click IDs.
  - Fails: Tags wait for consent, then fire without the landing parameters, so the session is credited to direct and the click ID is lost.
  - How we check: Browser: open a landing URL with test UTMs and fbclid/ttclid/ScCid; wait; accept the banner; check that the first GA4 page_view and each pixel hit after accepting carry the test values. If no banner shows to our visit, mark not applicable.
  - Action: Ask the developer to keep the landing parameters and send them with the first hits after consent.
  - Done when: After a late accept, the first GA4 and pixel hits carry the test UTMs and click IDs.
  - Selected because: A consent-timing leak that hides paid credit; testable with one accept in the headless run.
- **MB-GTM-19 Built-in variables your triggers need are switched on**
  - Pass: Built-in variables used by triggers and tags (Page URL, Page Path, Click URL, Click Element, Event and the form variables) are enabled in the container.
  - Fails: A trigger or tag condition refers to a built-in variable that is switched off, so the trigger never fires as built and the tag stays silent.
  - How we check: GTM read: list_built_in_variables compared with the variables referenced in trigger filters and tag fields; flag any reference to a disabled built-in.
  - Action: Ask the developer to enable the missing built-in variables and test the affected tags in Preview.
  - Done when: No trigger or tag refers to a disabled built-in variable.
  - Selected because: Backfill: a silent cause of missing events, fully readable in the container.
- **MB-GTM-20 Pixels pasted as Custom HTML and unknown scripts**
  - Pass: Meta, Snap, TikTok and Google tags use the official GTM templates or the store platform's integration, and every remaining Custom HTML tag has a known purpose.
  - Fails: Pixels run from Custom HTML tags with copied code, so events, parameters or IDs drift and break without notice, or Custom HTML tags load scripts from vendors nobody can name.
  - How we check: GTM read: tag types per platform; flag Custom HTML tags whose code loads fbevents.js, Snap tr, TikTok analytics or gtag, list what each sends, and list other Custom HTML tags with the domains they load.
  - Action: Ask the developer to move each pasted pixel to the official template or the platform integration, and remove Custom HTML tags no one can explain.
  - Done when: No pixel runs from Custom HTML, and every Custom HTML tag left has a named purpose.
  - Selected because: Backfill: tested in CRO audits (1 of 4 failed); template use is readable per tag.
- **MB-GTM-21 Team and staff visits marked so they don't count as shoppers**
  - Pass: The container sets traffic_type=internal (or a similar rule) for team and agency visits, or blocks primary tags for logged-in staff sessions, so GA4 can filter them.
  - Fails: Nothing in the container marks team, agency or staff visits, so their browsing, test adds and test orders count as shoppers.
  - How we check: GTM read: a traffic_type parameter on the Google tag, internal-traffic rules, and blocking triggers or exceptions for staff/admin sessions on primary tags. Whether staff are logged in on the live site is not visible; say so.
  - Action: Ask the developer to mark team visits as internal and block primary tags for staff sessions, then turn on the internal-traffic filter in GA4.
  - Done when: The container marks internal visits or blocks staff sessions on primary tags.
  - Selected because: Backfill: current-tool check plus the staff-session exception, both readable in the container.
- **MB-GTM-22 Page changes without a reload still send a page view**
  - Pass: If the store moves between pages without full reloads (headless or app-like themes), a History Change or custom page-view trigger sends a page_view and pixel PageView for each new page; otherwise not applicable.
  - Fails: On an app-like store only the first page sends a page view, so product views and later steps of paid visits go missing.
  - How we check: Browser: check whether moving from home to collection to product reloads the document. If not, GTM read: History Change or custom page-view triggers on GA4 and pixel page-view tags.
  - Action: Ask the developer to add a History Change or route-change trigger to the page-view tags.
  - Done when: Each page change on the app-like store sends one page_view and one pixel PageView.
  - Selected because: Backfill: high-impact where it applies; applicability and triggers are both checkable.
- **MB-GTM-23 Live site runs the latest published container version**
  - Pass: The gtm.js served on the live store reports the same version as the container's live version in GTM.
  - Fails: A cache, CDN or hard-coded copy serves an older container, so tracking fixes you published never reach shoppers.
  - How we check: GTM read: get_live_version (version id). Browser: the gtm.js request for the store's container ID on the visited pages and the version it reports; flag a mismatch.
  - Action: Ask the developer to clear the cache or remove the hard-coded copy so the live site loads the published container.
  - Done when: The live gtm.js version equals the published version.
  - Selected because: Backfill: confirms that container fixes are live; version readable on both sides.
- **MB-GTM-24 Snap, TikTok and Google event tags wait for their base tag**
  - Pass: Where Snap, TikTok or Google event tags share a trigger with the base pixel or Google tag they depend on, tag sequencing or firing priority makes the base fire first.
  - Fails: Event tags can fire before the base tag that loads the library, so those events are dropped at random.
  - How we check: GTM read: tags sharing a trigger, their firing priority and setup/teardown sequencing; flag Snap, TikTok and Google event tags with no order set against their base tag. Meta order is checked with the Meta funnel tags.
  - Action: Ask the developer to set the base tag as a setup tag, or give it a higher priority, for each event tag that needs it.
  - Done when: Every Snap, TikTok and Google event tag that shares a trigger with its base tag has an order set.
  - Selected because: Backfill: a race condition readable from priority and sequencing settings.
- **MB-GTM-25 Custom JavaScript variables behind value and IDs only return a value**
  - Pass: Custom JavaScript variables used for value, currency, items, order ID or event_id return a value and change nothing on the page.
  - Fails: A Custom JavaScript variable pushes to the dataLayer, sets cookies or edits the page, so it runs every time a tag reads it and can repeat events or return an empty value.
  - How we check: GTM read: the code of each Custom JavaScript variable referenced by ecommerce or conversion tags; flag dataLayer.push, cookie writes, DOM changes or network calls inside them.
  - Action: Ask the developer to move any action out of these variables so they only return a value.
  - Done when: No Custom JavaScript variable used by a conversion tag does anything but return a value.
  - Selected because: Backfill: lowest-value pick; a quiet cause of wrong values, readable in the variable code.

</details>

### Website code — 25 points (0 need a new GA4 query · 19 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Ad effect | Why it matters | Sources |
|---|---|---|---|---|---|---|---|
| 1 | **Same event sent twice by two setups** <br><small>MB-WC-01</small> | critical | browser | dev, marketing | inflated | Double events inflate reported conversions and feed the algorithm a false signal, so reported ROAS reads higher than real and audiences fill with wrong people. | EXIST-W-24, UX-195, CHK-B-064, UX-196, CHK-A-039, CHK-A-004, CHK-C-006, CHK-A-042, EXIST-GTM-09 |
| 2 | **Our Add to Cart click really fills the cart** <br><small>MB-WC-02</small> | critical | browser | dev | performance | Paid clicks that cannot add to cart cannot buy, so CVR drops and CAC rises on the same spend. | EXIST-W-01 |
| 3 | **Pixel missing or blocked for a platform you run** <br><small>MB-WC-03</small> | critical | browser | marketing, dev | deflated | A platform with no pixel cannot see sales, so reported ROAS reads low and its algorithm optimises blind. | EXIST-W-25 |
| 4 | **Click IDs and UTMs lost between the ad click and the cart** <br><small>MB-WC-04</small> | critical | browser | dev | deflated | Lost click IDs and UTMs push paid sales into direct and stop the platforms tying the sale to the click, so reported ROAS reads lower than real and winning campaigns can get cut. | EXIST-W-26, EXIST-W-06, CHK-B-038, CHK-B-037, CHK-A-053 |
| 5 | **Tracking missing on pages your ads land on** <br><small>MB-WC-05</small> | critical | browser | dev | deflated | Pages with no tracking send no events, so sales from those landing pages go uncounted and reported ROAS reads lower than real. | EXIST-W-21, CHK-A-041, CHK-A-077 |
| 6 | **Live product and cart events sent without value, currency or items** <br><small>MB-WC-06</small> | critical | browser | dev | deflated | Events without value starve value-based bidding and catalogue retargeting, so reported ROAS reads low and the algorithm optimises on counts, not money. | EXIST-W-23, CHK-B-005, CHK-B-011 |
| 7 | **Consent state on live hits blocks or ignores ad tags** <br><small>MB-WC-07</small> | medium | browser | dev | deflated | Over-blocking hides real sales from the platforms, so reported ROAS reads lower than real and Google's modelling has less to work with. | EXIST-W-29, CHK-B-022, CHK-B-029, CHK-B-030, CHK-A-056 |
| 8 | **Our successful Add to Cart reaches GA4 and every pixel** <br><small>MB-WC-08</small> | medium | browser | dev | optimization | Missing Add to Cart events thin the mid-funnel signal and retargeting audiences the algorithm uses. | EXIST-W-22 |
| 9 | **Value sent as text or in the wrong currency** <br><small>MB-WC-09</small> | medium | browser | dev | optimization | A wrong value or currency makes every reported sale worth the wrong amount, so reported ROAS can read high or low and value bidding learns from bad numbers. | CHK-B-015, CHK-B-018 |
| 10 | **Product IDs differ between pixels, GA4 and the page** <br><small>MB-WC-10</small> | medium | browser | dev, marketing | optimization | Mismatched IDs quietly break dynamic product ads and catalogue retargeting, so those campaigns learn from fewer matches. | CHK-B-021, EXIST-GTM-08, CHK-A-051 |
| 11 | **Main content shows late after the ad click** <br><small>MB-WC-11</small> | medium | browser | dev | performance | People who leave before the page shows never become a landing page view, so the click-to-LPV gap widens and CAC rises; ad-side LPV is not visible to us. | EXIST-W-09, UX-004 |
| 12 | **Script errors stop tracking and the cart** <br><small>MB-WC-12</small> | medium | browser | dev | performance | Errors cut both conversions and the events that report them, so CVR drops and reported ROAS reads low. | EXIST-W-02, CHK-B-065 |
| 13 | **Pixel fires too late in the page load** <br><small>MB-WC-13</small> | medium | browser | dev | deflated | Late pixels miss early leavers, so landing page views and visits are under-counted and the click-to-LPV gap looks worse than the page alone. | CHK-B-073 |
| 14 | **Non-standard event names** <br><small>MB-WC-14</small> | medium | browser | dev | optimization | Custom names are not used for standard optimisation or reports, so the algorithm gets a thinner funnel signal. | CHK-B-002 |
| 15 | **Personal data in page URLs** <br><small>MB-WC-15</small> | medium | browser | dev | optimization | Platforms can flag or restrict events that carry personal data in URLs, which cuts the signal campaigns optimise on; check warnings in Events Manager. | EXIST-W-30 |
| 16 | **Taps lag on the phone after the ad click** <br><small>MB-WC-16</small> | low | browser | dev | performance | Paid visitors who tap and get no response leave or give up on the add, so CVR drops on clicks already paid for. | EXIST-W-11 |
| 17 | **dataLayer set before the tag loads** <br><small>MB-WC-17</small> | low | browser | dev | optimization | Events that fire before their data reach the platforms with empty values or items, so value bidding and catalogue ads get less to learn from. | CHK-B-008, EXIST-W-28 |
| 18 | **Heavy or blocking files on first load** <br><small>MB-WC-18</small> | low | browser | dev | performance | Heavy first loads slow the page after the click, so more paid visitors leave before the landing page view and you pay for clicks that never saw the store. | EXIST-W-12, EXIST-W-14, EXIST-W-17, EXIST-W-18, EXIST-W-19 |
| 19 | **Failed or hanging requests on landing pages** <br><small>MB-WC-19</small> | low | browser | dev | performance | Broken or stalled pages lose paid visitors before they act, so CVR drops on the same clicks. | EXIST-W-03, EXIST-W-04 |
| 20 | **Third-party apps slow the page** <br><small>MB-WC-20</small> | low | browser | dev, owner | performance | App weight slows the page after the ad click, so CVR drops and the click-to-LPV gap widens. | EXIST-W-15 |
| 21 | **Page jumps while it loads** <br><small>MB-WC-21</small> | low | browser | dev | performance | A page that jumps under the thumb causes mis-taps and drop-offs right after the click, so CVR is lower than the traffic deserves. | EXIST-W-10 |
| 22 | **Embedded widgets that hide conversions** <br><small>MB-WC-22</small> | low | browser | dev | deflated | Conversions inside iframes never reach the platforms, so reported ROAS reads low for campaigns that drive them. | CHK-B-070 |
| 23 | **Old cart items attached to new events** <br><small>MB-WC-23</small> | low | browser | dev | inflated | Carried-over items inflate item counts and values on later events, so product-level numbers read higher than real. | CHK-B-007 |
| 24 | **Item fields use old or platform names** <br><small>MB-WC-24</small> | low | browser | dev | optimization | Dropped item data blanks product reports and the audiences built from them, which weakens product-level signal. | CHK-B-010, CHK-B-012 |
| 25 | **Product schema price or stock wrong** <br><small>MB-WC-25</small> | low | crawl | dev | cost | Google Shopping can disapprove products whose page data disagrees, which cuts Shopping and Performance Max reach. | EXIST-W-40, EXIST-W-41 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **MB-WC-01 Same event sent twice by two setups**
  - Pass: Each platform gets one hit per action: one page_view / PageView per page load and one add_to_cart / AddToCart per Add to Cart click, and gtag.js loads once per Measurement ID.
  - Fails: A platform app, the store's built-in integration, GTM and a hard-coded snippet each send the same pixel or GA4 event, so the network log shows two or more hits for one action (often two gtag loads or two GA4 configs for one ID).
  - How we check: Browser: on home, product and cart (phone and desktop), count gtag/js loads per Measurement ID and collect hits per event name per platform (google-analytics collect, facebook.com/tr, analytics.tiktok.com, tr.snapchat.com, googleadservices) for one page load and for our one Add to Cart click; list each pixel/measurement ID and where it loads from (app script, GTM, inline HTML in the crawl).
  - Action: Send the network capture to the developer and ask them to keep one setup per platform (app or GTM, not both) and remove the extra snippet.
  - Done when: The network log shows exactly one hit per platform per page load and per Add to Cart click.
  - Selected because: Tested failing in real stores (gtag double-load 3 of 5, duplicate pixel sources 2 of 3) and fully visible in the network log; the GA4 and GTM copies of this check were merged here.
- **MB-WC-02 Our Add to Cart click really fills the cart**
  - Pass: On the worker's phone visit, our one click on the product page's Add to Cart puts the item in the cart: a cart drawer with the item opens, or the store's cart count goes above zero, and the cart page lists it.
  - Fails: The button is not clickable, or after the click the drawer is empty, the cart count stays at zero and the cart page is empty.
  - How we check: Browser facts from the worker's own store visit (src/fud/collect.ts addToCartAndCapture, reported by src/site-checks.ts as addToCart): it selects variants, clicks Add to Cart once, waits for a drawer or a URL change, reads the store's cart count, then opens the cart page. Pass when addToCart.ok is true with via=click. Fail on reason atc_not_clickable, atc_drawer_empty or an empty cart page. When the click left the cart empty but the store's own cart endpoint filled it (via=api), report 'unconfirmed, may be our automated browser', not a broken button. A disabled button (atc_disabled_or_out_of_stock) is reported under sold-out products, not here. Attach the cart crop screenshot.
  - Action: Send the screenshot and the step that failed to the developer to fix the Add to Cart button or the theme script behind it.
  - Done when: A re-scan shows addToCart.ok via the click: the item reaches the drawer or the cart page on a phone.
  - Selected because: The biggest post-click leak we can prove with our own click; moved here from the Conversion list and sourced on the worker's own add-to-cart visit, not on the cart-icon checklist item.
- **MB-WC-03 Pixel missing or blocked for a platform you run**
  - Pass: Meta, TikTok, Snap and Google Ads tags all load and send hits (not blocked) on the paid path.
  - Fails: A platform has no pixel, or the pixel script loads but its hits fail or are blocked (CSP, script error), so that platform never sees visits or sales.
  - How we check: Crawl HTML for pixel IDs plus browser network requests to each vendor on home, product and cart; record loaded, fired, blocked or failed per platform. Which platforms carry spend is not visible to us, so list every platform found and every one missing for the buyer to match against their accounts.
  - Action: Tell the store owner which platform has no working pixel; the developer adds it through GTM or the platform app.
  - Done when: Each platform you advertise on shows its pixel hits in the network log on home, product and cart.
  - Selected because: Without a working pixel no other tracking point matters for that platform; Snap and TikTok coverage is often missed.
- **MB-WC-04 Click IDs and UTMs lost between the ad click and the cart**
  - Pass: A landing URL with utm_* plus fbclid, ttclid, ScCid and gclid reaches the final page in one hop with every parameter intact; the first GA4 hit carries the UTMs in page_location; _fbc, _ttp, the Snap click cookie and _gcl_aw are set; and the Meta, TikTok and Snap hits on the product page and after our Add to Cart click still carry the click IDs.
  - Fails: A redirect (http to https, www, trailing slash, language or country switch, link shortener) drops the query string, nothing stores a click ID, or it is gone by the cart, so the sale is credited to direct or not matched to the ad.
  - How we check: Browser (phone): open home and one product URL with test utm_source/medium/campaign and test fbclid, ttclid, ScCid and gclid; record the redirect chain and final URL, page_location in the first GA4 collect hit, the _fbc / _ttp / Snap / _gcl_aw cookies, and the fbc, ttclid and ScCid values on pixel hits on the product page and after our Add to Cart click. Gateway redirects after the cart are not checked.
  - Action: Ask the developer to keep the full query string on every redirect (language, country, www, https) and let each pixel store its click ID on the first page.
  - Done when: Every test parameter survives to the final URL in one hop, the cookies hold the test click IDs, and the Add to Cart hits carry them.
  - Selected because: One live test for every click ID and UTM, merged from the copies that sat in all four lists; the browser is the tool that measures it.
- **MB-WC-05 Tracking missing on pages your ads land on**
  - Pass: GTM (with the same container ID as the one we read) and the pixels load on home, collection, product, cart and GA4's top paid landing pages.
  - Fails: A template (often collection, cart or a landing page built outside the theme) has no tag, or the site loads a different container ID from the one the team edits, so visits there are not counted.
  - How we check: Crawl and browser: GTM snippet and container ID in the HTML and a gtm.js request on home, one collection, one product, the cart and GA4's top campaign landing URLs; pixel requests per page; compare the container ID with the one read via the service account.
  - Action: Ask the developer to install the store's GTM container on every page template, including landing pages built outside the theme.
  - Done when: Every checked page loads the same container ID, it is the one the team edits, and the pixels fire there.
  - Selected because: Tested in audits (3 of 5 stores failed placement); the GTM list's crawl copy of this check was merged here.
- **MB-WC-06 Live product and cart events sent without value, currency or items**
  - Pass: view_item and add_to_cart (and the matching ViewContent / AddToCart pixel hits) carry value, currency and items[] / content_ids.
  - Fails: The dataLayer or pixel hit has no value, no currency, or an empty items array, so the platform gets the event but not what it was worth.
  - How we check: Browser: read the dataLayer ecommerce objects and the GA4 and pixel hit parameters for view_item and our add_to_cart on the product page; flag missing value, currency or items. Purchase is not observed because the visit stops at the cart.
  - Action: Ask the developer to add value, currency and items to every ecommerce push and map them in each pixel tag.
  - Done when: Every ecommerce event on product and cart shows value, currency and items in the dataLayer and in each platform's hit.
  - Selected because: Value and currency gaps failed in 3 of 5 tested stores; this reads the live hits, while the Purchase mapping is read from the container.
- **MB-WC-07 Consent state on live hits blocks or ignores ad tags**
  - Pass: With no banner choice, the gcs/gcd consent state and the pixel hits match the store's region policy; after accept, all four Consent Mode v2 signals (ad_storage, analytics_storage, ad_user_data, ad_personalization) turn granted and ad tags fire; after refuse, marketing tags stop.
  - Fails: The default denies everything so visitors who never touch the banner send no ad hits, only the two older consent signals are sent, or the banner choice changes nothing on the hits.
  - How we check: Browser: record gcs/gcd on Google hits and which vendor hits fire before any choice, after accept and after refuse (separate visits). If no banner shows, record the default state only. This point reads live hits only.
  - Action: Ask the developer to connect the banner to Consent Mode v2 with all four signals and check the default state for GCC and Egypt visitors.
  - Done when: Before a choice the hits match the region policy, after accept all four signals show granted and ad tags fire, and after refuse no marketing tag fires.
  - Selected because: Consent blocking ad tags is a named under-count cause; the live Consent Mode v2 check from the GTM list was merged here, the container default stays in GTM.
- **MB-WC-08 Our successful Add to Cart reaches GA4 and every pixel**
  - Pass: After our click fills the cart, the dataLayer gets an add_to_cart push and GA4 and each pixel found on the page record an add-to-cart hit.
  - Fails: The item lands in the cart (often from a drawer or quick add) but GA4 or a pixel records no add-to-cart event.
  - How we check: Browser facts: atcEvents from the worker's visit (dataLayer entries, GA4 event names and vendor:event pixel hits recorded after the click, src/fud/collect.ts eventsAfterClick), read only when addToCart.ok is true; compare with the pixels found on the page.
  - Action: Ask the developer to send add_to_cart on every successful add, including the drawer and quick add.
  - Done when: After a successful add, GA4 and every pixel on the page record one add-to-cart event.
  - Selected because: Spec scores Add to Cart signal medium-high; checked with our own click. The trigger setup that can fire on non-adds is read in the container.
- **MB-WC-09 Value sent as text or in the wrong currency**
  - Pass: value is a plain number equal to the shown price, and currency is a three-letter ISO code that matches the price the shopper sees.
  - Fails: value arrives as a string with a symbol or a comma decimal (so it is cut or misread), or currency is lowercase, a symbol, or a different currency from the page.
  - How we check: Browser: compare the dataLayer and pixel value/currency for view_item and add_to_cart with the price and currency shown on the product page and in the cart; flag type, format or currency mismatch.
  - Action: Ask the developer to send value as a number and currency as the ISO code of the price shown.
  - Done when: value equals the shown price as a number and currency matches the page on product and cart.
  - Selected because: Distinct from presence: this checks correctness of the number the platforms optimise on.
- **MB-WC-10 Product IDs differ between pixels, GA4 and the page**
  - Pass: The product ID in Meta content_ids, TikTok content_id, Snap item_ids, GA4 item_id and the page's product schema SKU/ID is the same value.
  - Fails: A pixel sends a variant ID, handle or SKU while the other sources use a different ID, or IDs are scraped from page text and break on some products, so catalogue ads cannot match the viewer to the product.
  - How we check: Browser: on the product page and after our Add to Cart click, compare content_ids / content_id / item_ids in pixel hits with GA4 item_id and the JSON-LD sku/productID. The catalogue feed itself is not readable; mark 'confirm the feed uses the same ID'.
  - Action: Ask the developer to send one product ID, from the dataLayer, to every platform, matching the catalogue feed.
  - Done when: All four platforms and the schema show the same product ID on the checked product.
  - Selected because: High-impact (I4) catalogue-ad failure; the GTM list's copy of the same live comparison was merged here.
- **MB-WC-11 Main content shows late after the ad click**
  - Pass: LCP under 2.5s on the product and home page on a throttled phone.
  - Fails: LCP over 2.5s, so paid visitors wait for the main image or headline.
  - How we check: Browser: performance trace with mobile throttling on home and product (LCP, plus TTFB and the LCP element).
  - Action: Ask the developer to preload the hero/product image and cut render-blocking files.
  - Done when: LCP under 2.5s on a phone on home and product.
  - Selected because: Speed after the click is in the section scope; slow paid landings failed in 3 of 4 tested stores.
- **MB-WC-12 Script errors stop tracking and the cart**
  - Pass: No JavaScript errors on product and cart that stop later dataLayer pushes or the cart from working.
  - Fails: An error (often repeating) breaks the cart script or stops the pushes that follow it, so later events never fire.
  - How we check: Browser: console errors on home, product and cart, matched to the dataLayer pushes and hits that follow them.
  - Action: Send the console log to the developer to fix the erroring script.
  - Done when: No console errors on product and cart, and all expected events still fire.
  - Selected because: One error can break both buying and counting; fully checkable in the console.
- **MB-WC-13 Pixel fires too late in the page load**
  - Pass: The Meta PageView and the other pixels send their first hit early in the load, not after heavy scripts or a late GTM trigger.
  - Fails: Pixels wait for window load or a delayed GTM trigger, so visitors who leave early are never counted.
  - How we check: Browser: on home and product (throttled phone), record the time of each platform's first hit against first paint and load; read the GTM trigger type for the base pixel tags where the container is readable.
  - Action: Ask the developer to fire base pixels on page initialisation instead of window load.
  - Done when: Each platform's first hit is sent before the page finishes loading on a throttled phone.
  - Selected because: Explains part of the link-click to LPV gap, which buyers see daily but cannot diagnose.
- **MB-WC-14 Non-standard event names**
  - Pass: Ecommerce events use the standard names (view_item_list, view_item, add_to_cart; ViewContent, AddToCart).
  - Fails: Custom names (for example productView, addtocart) that the platforms do not map to standard events.
  - How we check: Browser: list event names in the dataLayer and in pixel/GA4 hits on collection, product and cart; flag non-standard names.
  - Action: Ask the developer to rename events to the platforms' standard names.
  - Done when: All ecommerce events seen use standard names.
  - Selected because: Failed in 3 of 5 tested stores; directly limits what platforms can optimise on.
- **MB-WC-15 Personal data in page URLs**
  - Pass: No emails or phone numbers in query strings sent with pixel or GA4 hits.
  - Fails: A form or login puts email or phone in the URL, which the pixels then pass on.
  - How we check: Browser and crawl: scan visited URLs and the dl / page URL parameters of pixel and GA4 hits for email or phone patterns.
  - Action: Ask the developer to send forms by POST and strip personal data from URLs.
  - Done when: No email or phone appears in any URL or hit parameter on the visited pages.
  - Selected because: Real link to ads: platforms can restrict events with personal data in URLs.
- **MB-WC-16 Taps lag on the phone after the ad click**
  - Pass: No main-thread task over 200 ms while home and product load on a throttled phone.
  - Fails: Long script tasks block the page, so taps on variants and Add to Cart lag or are missed.
  - How we check: Browser: performance trace with mobile throttling on home and product; list main-thread tasks over 200 ms and the scripts behind them.
  - Action: Ask the developer to split or defer the long scripts named in the trace.
  - Done when: No task over 200 ms on load on home and product.
  - Selected because: Backfill: current-tool check of tap delay on the pages paid traffic lands on.
- **MB-WC-17 dataLayer set before the tag loads**
  - Pass: The page declares dataLayer and pushes page and product data before the GTM snippet, so the first events carry that data.
  - Fails: dataLayer is declared after the container, or product data is pushed late, so page_view and view_item fire before the data exists or the data is overwritten.
  - How we check: Crawl and browser: position of the dataLayer declaration and first pushes against the GTM snippet in the HTML of home and product, and the order of dataLayer entries against the first GA4 and pixel hits.
  - Action: Ask the developer to declare dataLayer and push page data above the GTM snippet.
  - Done when: On home and product, dataLayer and the page data come before the GTM snippet and the first hits carry the data.
  - Selected because: Backfill: tested in CRO audits (1 of 2 failed); the order is readable in the page source and the dataLayer.
- **MB-WC-18 Heavy or blocking files on first load**
  - Pass: No render-blocking CSS/JS in the head, JS + CSS on first load under about 1 MB, text compressed, static files cached long, no autoplay hero video on the phone first screen, and text visible while Arabic fonts load.
  - Fails: Blocking or oversized files delay first paint, text is sent uncompressed or static files are cached briefly, a hero video fills the phone first screen, or text stays invisible until the font loads.
  - How we check: Browser (phone): performance trace (render-blocking resources), JS and CSS transfer size, response encoding and cache headers, first-screen media, and font-display on home and product.
  - Action: Ask the developer to defer non-critical scripts, trim unused code, turn on compression and caching, replace the phone hero video with an image, and show text while fonts load.
  - Done when: No render-blocking files, first-load JS + CSS under about 1 MB, compressed and cached files, no phone hero video, and text visible during font load.
  - Selected because: Main fixable cause behind slow paid landings; the Conversion list's speed point (hero video, compression, caching, fonts) was merged here.
- **MB-WC-19 Failed or hanging requests on landing pages**
  - Pass: No 404/500 requests and no request over 3 seconds blocking content on home, product or cart.
  - Fails: Images or scripts fail, or a slow request holds back what the shopper sees.
  - How we check: Browser: network log status codes and durations on home, product and cart.
  - Action: Ask the developer to fix or remove the failing and slow requests.
  - Done when: No 404/500 and no blocking request over 3 seconds on those pages.
  - Selected because: Post-click leak visible in the network log.
- **MB-WC-20 Third-party apps slow the page**
  - Pass: Chat, review and popup apps load light or after the main content.
  - Fails: Third-party app scripts make up most of the load weight.
  - How we check: Browser: transfer size and timing by third-party domain on home and product.
  - Action: Ask the store owner to remove unused apps and the developer to load the rest after the main content.
  - Done when: Third-party apps no longer dominate load weight on home and product.
  - Selected because: Common speed leak on app-heavy stores; measured per domain.
- **MB-WC-21 Page jumps while it loads**
  - Pass: CLS under 0.1 on home and product on a phone.
  - Fails: Content shifts as images, banners or apps load, so shoppers tap the wrong thing or lose their place.
  - How we check: Browser: CLS and the shifting elements from the phone performance trace on home and product.
  - Action: Ask the developer to reserve space for images, banners and app widgets so the page doesn't shift.
  - Done when: CLS under 0.1 on home and product on a phone.
  - Selected because: Backfill: current-tool Core Web Vitals check not yet covered by the speed points.
- **MB-WC-22 Embedded widgets that hide conversions**
  - Pass: Any iframe that takes an action on the visited pages (form, booking, embedded checkout) passes its events to the parent page's dataLayer.
  - Fails: The action happens inside an iframe, so GA4 and the pixels on the page never see it.
  - How we check: Browser: list iframes on home, product and cart and their domains; where one is a form or checkout, check for postMessage pushes into the parent dataLayer. Checkout after the cart is not checked.
  - Action: Ask the developer to relay iframe events to the page's dataLayer.
  - Done when: Actions inside the iframe show as dataLayer events on the parent page.
  - Selected because: High-impact (I4) under-count cause; iframe presence on visited pages is checkable.
- **MB-WC-23 Old cart items attached to new events**
  - Pass: ecommerce is set to null before each new ecommerce push.
  - Fails: No clearing, so items from an earlier push merge into the next event.
  - How we check: Browser: dataLayer sequence on product then cart; check for ecommerce:null before each push and for items carried over.
  - Action: Ask the developer to clear the ecommerce object before each push.
  - Done when: Each ecommerce push follows an ecommerce:null and carries only its own items.
  - Selected because: Over-count source visible in the dataLayer sequence.
- **MB-WC-24 Item fields use old or platform names**
  - Pass: items[] use item_id, item_name, item_brand, item_category, item_variant, price, quantity.
  - Fails: Legacy or platform-native field names (id, name, product_id) that GA4 drops, leaving item reports as (not set).
  - How we check: Browser: read item field names in dataLayer ecommerce objects on product and cart.
  - Action: Ask the developer to map the platform's item output to the GA4 item fields in GTM.
  - Done when: All items show the standard field names in the dataLayer.
  - Selected because: Common platform quirk; readable directly in the dataLayer.
- **MB-WC-25 Product schema price or stock wrong**
  - Pass: Product pages carry Product + Offer schema whose price and availability equal what the page shows.
  - Fails: Schema missing price or availability, or showing a different price or stock than the page.
  - How we check: Crawl: JSON-LD Product/Offer on the product page vs the visible price and stock.
  - Action: Ask the developer to make the schema use the live price and stock.
  - Done when: Schema price and stock match the visible page.
  - Selected because: Real link to Google Shopping ads approval.

</details>

### CRO (storefront) — 25 points (6 need a new GA4 query · 5 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Ad effect | Why it matters | Sources |
|---|---|---|---|---|---|---|---|
| 1 | **Shipping cost shown before checkout** <br><small>MB-CRO-01</small> | critical | browser | owner | performance | Shoppers from ads who meet a surprise cost in checkout leave after you paid for the click; showing it earlier likely lifts CVR and lowers CPA on the same spend. | UX-061 |
| 2 | **Top paid campaigns: landing page conversion and what the page offers** <br><small>MB-CRO-02</small> | critical | ga4_report 🆕 | marketing, owner | performance | Paid clicks that land on a page that converts poorly or doesn't show what they came for are bought and lost, so CVR is likely lower and CAC higher than the traffic deserves. | UX-167, UX-018 |
| 3 | **Advertised products that can't be bought** <br><small>MB-CRO-03</small> | critical | ga4_report 🆕 | marketing, owner | cost | Clicks on products nobody can buy are paid traffic that can't convert, so CAC is higher than it needs to be right now. | UX-027, UX-160, EXIST-W-08 |
| 4 | **Paid landing pages that show 'page not found'** <br><small>MB-CRO-04</small> | critical | ga4_report 🆕 | marketing, dev | cost | Every paid click to a dead page is spend with no chance to convert, so CAC is higher than it needs to be right now. | EXIST-W-05 |
| 5 | **Local payment options visible before checkout** <br><small>MB-CRO-05</small> | medium | browser | owner, dev | performance | Paid shoppers who can't see their way to pay drop before checkout, so CVR likely reads lower and CPA higher than the traffic deserves. | UX-087, UX-163, UX-176 |
| 6 | **Cart shows the full total before checkout** <br><small>MB-CRO-06</small> | medium | browser | owner | performance | Fees that appear late push paid shoppers out of checkout, so fixing it likely raises CVR on clicks you already paid for. | UX-072 |
| 7 | **Cart price matches the product page price** <br><small>MB-CRO-07</small> | medium | browser | owner, dev | performance | A price that changes between the ad, the page and the cart breaks trust after the click, so CVR likely drops on the same paid traffic. | UX-049, UX-034, UX-067, UX-162 |
| 8 | **Phone layout works for mobile paid traffic** <br><small>MB-CRO-08</small> | medium | browser | dev | performance | Most paid social clicks come from phones; a broken phone page likely holds mobile CVR down and CPA up. | EXIST-W-20, UX-007, UX-033, UX-058 |
| 9 | **Clear checkout button in the cart** <br><small>MB-CRO-09</small> | medium | browser | dev | performance | Shoppers who added from an ad but can't find the next step stall in the cart, so CVR likely reads lower than the traffic deserves. | UX-074, UX-177, UX-183 |
| 10 | **Cart doesn't force sign-in before checkout** <br><small>MB-CRO-10</small> | medium | browser | owner | performance | New shoppers from cold ads rarely have an account; a forced login likely cuts CVR on the traffic you pay most to win. | UX-082, UX-184 |
| 11 | **Landing page speaks the shopper's language** <br><small>MB-CRO-11</small> | medium | browser 🆕 | dev, marketing | performance | An Arabic ad that lands on an English or broken page loses the shopper the ad just won, so CVR likely drops and CPA rises. | UX-019, EXIST-W-45 |
| 12 | **Delivery time shown before checkout** <br><small>MB-CRO-12</small> | medium | browser | owner | performance | Shoppers from ads who don't know when it arrives hesitate in the cart, so stating it likely lifts CVR. | UX-037 |
| 13 | **Free-shipping threshold set against order value** <br><small>MB-CRO-13</small> | medium | browser 🆕 | owner | aov | A threshold set near the typical order raises AOV, so ROAS likely rises at the same CAC. | UX-179 |
| 14 | **Ways to add a second item** <br><small>MB-CRO-14</small> | medium | ga4_report 🆕 | owner, content | aov | More items per order raises AOV, so ROAS likely rises at the same CAC. | UX-158, UX-092, UX-168, UX-186, UX-173 |
| 15 | **WhatsApp or contact visible and working on the product page** <br><small>MB-CRO-15</small> | medium | browser | owner, dev | performance | In COD and WhatsApp-heavy stores, cold paid shoppers with one question leave if they can't ask, and a broken link loses those who wanted to order by chat, so CVR drops. | UX-008, EXIST-W-07 |
| 16 | **Reviews visible where paid shoppers decide** <br><small>MB-CRO-16</small> | low | browser | owner | performance | Cold paid shoppers who see no sign that others bought tend to hesitate, so CVR on product ads likely stays lower than it could. | UX-051, UX-023, UX-157 |
| 17 | **Promo codes from your ads have a place to go** <br><small>MB-CRO-17</small> | low | browser | owner | performance | Code-based campaigns lose shoppers who can't use the code, so CVR on those campaigns likely reads lower. | UX-077, UX-182 |
| 18 | **Product page answers the buying questions** <br><small>MB-CRO-18</small> | low | browser | content | performance | Paid visitors who can't find the facts don't add to cart, so CVR on product ads likely stays low. | UX-050, UX-052, UX-140, UX-172 |
| 19 | **Enough product photos on the top product** <br><small>MB-CRO-19</small> | low | browser | content | performance | The ad's image sets the expectation; a thin gallery on the landing product likely holds add-to-cart rate and CVR down. | UX-059, UX-169 |
| 20 | **Return policy reachable from the product page** <br><small>MB-CRO-20</small> | low | browser | owner | performance | First-time shoppers from ads weigh the risk of buying; clear returns likely lift CVR. | UX-129, UX-164 |
| 21 | **Add to Cart reachable on the phone first screen** <br><small>MB-CRO-21</small> | low | browser | dev | performance | If mobile paid visitors can't see the button, fewer add to cart, so CVR likely reads lower. | UX-057, UX-065, UX-066 |
| 22 | **Prices shown on collection pages** <br><small>MB-CRO-22</small> | low | browser | dev | performance | Collection-page campaigns lose shoppers who can't compare prices, so CVR on those clicks likely reads lower. | UX-022, UX-153 |
| 23 | **Search easy to find and returning results** <br><small>MB-CRO-23</small> | low | browser | dev | performance | Paid visitors who land on a product that isn't quite right and can't search for another leave, so CVR likely reads lower. | UX-009 |
| 24 | **Every page loads on a secure connection** <br><small>MB-CRO-24</small> | low | browser | dev | cost | A not-secure warning after the ad click makes shoppers leave before they look, so the click is spend with no chance to convert. | UX-005 |
| 25 | **Cart quantity and remove controls work** <br><small>MB-CRO-25</small> | low | browser | dev | performance | A cart that breaks when shoppers adjust it loses orders from clicks already paid for, so CVR likely reads lower. | UX-054, UX-075, UX-076 |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **MB-CRO-01 Shipping cost shown before checkout**
  - Pass: The product page or the cart states the shipping cost, or the free-shipping rule, before the checkout button.
  - Fails: No shipping cost on the product page or in the cart; the shopper first sees it inside checkout.
  - How we check: Browser (phone): read product page and cart DOM after our add for shipping cost text or a shipping estimator; screenshot. GA4: quote add_to_cart→begin_checkout and begin_checkout→purchase (GA4-03, GA4-04); mark the point high when either step is below the tool's benchmark. Checkout itself: not checked.
  - Action: Ask the store owner to show the shipping cost (or the free-shipping rule) on the product page and in the cart.
  - Done when: Shipping cost text is visible on the product page and in the cart on phone in our re-scan.
  - Selected because: High-impact, tested leak (3 of 5 stores failed) tied to the cart and checkout funnel steps.
- **MB-CRO-02 Top paid campaigns: landing page conversion and what the page offers**
  - Pass: Each top paid campaign's main landing page converts at or above the store's paid average in GA4, and the top campaign's landing page shows a clear headline and the product or offer on its first screen; where the campaign name names a product, collection or offer, the landing page shows it.
  - Fails: A top paid campaign lands mostly on the home page or on a page that converts well below the paid average, or the landing page's first screen has no clear headline, product or offer, or shows a different one from what the campaign name points to.
  - How we check: GA4: run_report 28 days, dimensions sessionCampaignName + landingPage for paid channels, metrics sessions, addToCarts, ecommercePurchases; for each top campaign, its main landing page and that page's add-to-cart and purchase rates against the store's paid average. Browser: visit the top campaign landing URL (focus.campaignLandingUrl), screenshot the first screen, read title, H1, offer and price text, and compare them with the product, collection or offer words in the campaign name.
  - Action: Point each weak campaign at the product or collection it sells; ask the owner to put that product or offer and a clear headline on the landing page's first screen.
  - Done when: Each top paid campaign's main landing page in GA4 converts at or above the paid average over 14 days, and its first screen shows the headline and offer.
  - Selected because: Message match measured only from what we can see: GA4 campaign × landing page conversion and the landing page's own headline and offer; the ad itself is not visible, so it is not checked.
- **MB-CRO-03 Advertised products that can't be bought**
  - Pass: The most-viewed products are in stock, every variant can be selected, Add to Cart is active, and no sold-out product sits in the hero or first row of home and collections.
  - Fails: A top-viewed product is sold out or its variants can't be chosen while traffic keeps landing on it, or sold-out items are featured where shoppers look first.
  - How we check: GA4: run_report 28 days, dimension itemName, metrics itemsViewed and itemsAddedToCart; list the top-viewed items with zero adds or the lowest add rate (new computation). Browser: open the top product (focus.productUrl) and read stock text, variant state and whether Add to Cart is enabled (addToCart reason atc_disabled_or_out_of_stock); read the stock state of products in the hero and first row of home and the visited collection.
  - Action: Pause or switch ads that send traffic to sold-out products; ask the owner to restock them or swap them out of featured spots.
  - Done when: No top-viewed product in GA4 has zero adds over 14 days, our visit finds Add to Cart enabled on the top product, and every featured product is in stock.
  - Selected because: Wasted paid clicks shown from the store's own product data; the page-code list's sold-out check was merged here because it is what the shopper sees.
- **MB-CRO-04 Paid landing pages that show 'page not found'**
  - Pass: None of the landing pages that get paid sessions return an error or a 'not found' page, and the 404 page offers search or a way back.
  - Fails: Ads or old links send paid sessions to deleted products or a dead page with no way back.
  - How we check: GA4: run_report 28 days, dimensions landingPagePlusQueryString + pageTitle + sessionDefaultChannelGroup (paid channels), metric sessions; flag titles that read as not-found pages. Crawl: request the top paid landing URLs and record HTTP status; check menu and footer links and what the 404 page offers.
  - Action: Change the ad URLs that point to dead pages; ask the developer to redirect deleted product URLs to the closest live product or collection.
  - Done when: No paid landing page in GA4 over the last 14 days shows a not-found title, and the listed URLs return a live page.
  - Selected because: A measured waste of paid clicks the buyer can fix in the ads the same day.
- **MB-CRO-05 Local payment options visible before checkout**
  - Pass: The product page or cart shows the payment methods GCC shoppers look for (such as mada, Apple Pay, Tabby or Tamara, cash on delivery) as icons, widgets or text.
  - Fails: No payment information until checkout; cash on delivery or buy-now-pay-later never mentioned.
  - How we check: Browser: read product page and cart DOM, image alt text and network for payment icons and BNPL widget scripts (Tabby, Tamara); screenshot. GA4: quote begin_checkout→purchase (GA4-04); raise to high when that step is below the tool's benchmark. Methods offered inside checkout: not checked.
  - Action: Ask the owner to show accepted payment methods near Add to Cart and in the cart; the developer adds the BNPL widget if the store uses Tabby or Tamara.
  - Done when: Payment icons or a BNPL widget are visible on the product page and cart in our re-scan.
  - Selected because: High-impact GCC conversion lever, visible on the storefront and tied to the checkout step in GA4.
- **MB-CRO-06 Cart shows the full total before checkout**
  - Pass: The cart shows a clear total with every extra cost known at that point stated (VAT included or listed, cash-on-delivery fee, other fees).
  - Fails: The cart shows only the item subtotal; VAT or a cash-on-delivery fee appears only later.
  - How we check: Browser: after our add, read the cart DOM for subtotal, fee lines, VAT wording and a total line; screenshot. GA4: quote add_to_cart→begin_checkout (GA4-03) beside it.
  - Action: Ask the owner to show the total and any fees (cash-on-delivery fee, VAT) in the cart, not only in checkout.
  - Done when: The cart in our re-scan shows a total line and states VAT and any fee.
  - Selected because: High-impact hidden-cost leak, checked on the cart page we can reach.
- **MB-CRO-07 Cart price matches the product page price**
  - Pass: The product page shows the price with currency near Add to Cart; a sale price shows the old price; the cart shows the same price after our add.
  - Fails: Price missing or without currency, the discount unclear, or the cart price differs from the product page.
  - How we check: Browser: read the price, currency and any compare-at price on the product page, then the line price in the cart after our add; flag any difference; screenshot both.
  - Action: Ask the owner or developer to make the product page and cart show the same price, with currency and the old price on sale items.
  - Done when: Our re-scan finds the same price on the product page and in the cart, with currency shown.
  - Selected because: A concrete, checkable price mismatch on the buy path, beyond a generic 'price clarity' item.
- **MB-CRO-08 Phone layout works for mobile paid traffic**
  - Pass: On a phone, the home, product and cart pages have no sideways scroll, readable text and buttons large enough to tap.
  - Fails: Sideways scroll, cut-off buttons, tiny tap targets or small text on the phone product page or cart.
  - How we check: Browser (phone): compare document width with the viewport, measure tap-target and font sizes on home, product and cart; screenshot. GA4: quote mobile vs desktop conversion (GA4-05) beside it.
  - Action: Send the screenshots to the developer to fix the overflow and enlarge the buttons on phone.
  - Done when: Our phone re-scan finds no sideways scroll and no undersized buttons on product and cart.
  - Selected because: Ties a visible phone layout fault to the GA4 mobile vs desktop gap.
- **MB-CRO-09 Clear checkout button in the cart**
  - Pass: After our add, the phone cart shows one clear checkout button in the first screen, not hidden by popups or upsells.
  - Fails: The checkout button is missing, below the fold on phone, or covered by a popup or upsell block.
  - How we check: Browser (phone): after our add, find the checkout button in the cart DOM, record its position against the viewport and any overlay; screenshot. GA4: quote add_to_cart→begin_checkout (GA4-03).
  - Action: Ask the developer to place one visible checkout button at the top of the phone cart and remove anything covering it.
  - Done when: Our phone re-scan shows the checkout button in the cart's first screen with nothing on top of it.
  - Selected because: Directly tied to the cart-to-checkout step and checked on our own cart.
- **MB-CRO-10 Cart doesn't force sign-in before checkout**
  - Pass: The cart's checkout path offers guest checkout or a phone-number step, with no 'log in to checkout' wall shown on the cart.
  - Fails: The cart shows only 'log in' or 'create account' before checkout.
  - How we check: Browser: read the cart DOM after our add for login-only buttons, account prompts or a guest option; screenshot. Steps after the cart: not checked.
  - Action: Ask the owner to turn on guest checkout or phone-number checkout in the store settings.
  - Done when: Our re-scan finds no login-only wall on the cart.
  - Selected because: A known checkout blocker that can be seen on the cart page without going further.
- **MB-CRO-11 Landing page speaks the shopper's language**
  - Pass: Pages declare the right lang and dir, an Arabic version exists with a visible switcher, and Arabic-language paid sessions land on Arabic pages.
  - Fails: Arabic-language sessions land on English pages, or Arabic pages render with broken right-to-left layout.
  - How we check: Browser/crawl: read html lang, dir, hreflang and the language switcher on landing and product pages; screenshot the Arabic product page. GA4: run_report 28 days, dimensions language + landingPage for paid channels; flag Arabic-language sessions landing on English pages (new computation).
  - Action: Point Arabic ads at the Arabic URLs; ask the developer to fix lang, dir and right-to-left layout.
  - Done when: GA4 shows Arabic-language paid sessions landing on Arabic pages, and our visit finds correct lang and dir.
  - Selected because: Message match by language, measurable from GA4 language data and the page markup.
- **MB-CRO-12 Delivery time shown before checkout**
  - Pass: The product page or listing states the expected delivery time.
  - Fails: No delivery time anywhere before checkout.
  - How we check: Browser: read product page, collection and cart DOM for delivery-time text; screenshot. GA4: quote add_to_cart→begin_checkout (GA4-03) beside it.
  - Action: Ask the owner to add the delivery time to the product page, near Add to Cart.
  - Done when: Delivery time text is visible on the product page in our re-scan.
  - Selected because: Tested and failed in 3 of 5 stores; clear page fact tied to the cart step.
- **MB-CRO-13 Free-shipping threshold set against order value**
  - Pass: If the store has free shipping above an amount, the amount shows on the product page and in the cart, and it sits a reachable step above the store's GA4 AOV.
  - Fails: No threshold shown, or the threshold is far from the store's typical order, so it doesn't move order value.
  - How we check: Browser: read free-shipping text on the product page and cart, including any 'add X more' message after our add. GA4: quote AOV from the computed facts and compare it with the threshold found (new computation).
  - Action: Ask the owner to show the free-shipping amount in the cart and set it just above the current AOV.
  - Done when: The cart shows the threshold with a progress message, and GA4 AOV is tracked over 28 days after the change.
  - Selected because: An AOV lever tied to the store's own GA4 AOV, not a free-shipping bar taken alone.
- **MB-CRO-14 Ways to add a second item**
  - Pass: The product page or cart offers related items, bundles or multi-buy offers, and GA4 items per order is above one item.
  - Fails: No cross-sell or bundle anywhere, and GA4 shows orders are almost all single items.
  - How we check: Browser: detect recommendation blocks, bundle or multi-buy offers on the product page and cart (DOM and known app scripts). GA4: compute items per order = itemsPurchased ÷ transactions, 28 days (new computation).
  - Action: Ask the owner to add related products or a bundle on the best-selling product page and in the cart.
  - Done when: A cross-sell or bundle block is visible on product page or cart, and GA4 items per order is tracked over 28 days after.
  - Selected because: AOV lever made measurable with the store's own items-per-order figure.
- **MB-CRO-15 WhatsApp or contact visible and working on the product page**
  - Pass: The product page shows a WhatsApp or contact link without leaving the page, and every wa.me / tel: link on the visited pages uses a full international number.
  - Fails: No contact route on the product page, or a WhatsApp or phone link with a missing or malformed number.
  - How we check: Browser facts: wa.me / api.whatsapp.com / tel: links, phone numbers and chat widgets found on the visited pages, with each number's format checked; screenshot the product page.
  - Action: Ask the owner to add a WhatsApp button on product pages and fix the WhatsApp number in the store settings or theme.
  - Done when: Our re-scan finds a WhatsApp or contact link on the product page, and every WhatsApp/phone link opens a chat or call to the right full number.
  - Selected because: A GCC trust and ordering route on the page paid traffic lands on; the page-code list's broken-link check was merged here because it is what the shopper can do.
- **MB-CRO-16 Reviews visible where paid shoppers decide**
  - Pass: The top product page shows reviews or a star rating near the price, collection cards show ratings, and the score links to the reviews.
  - Fails: No reviews or ratings on the product page or collection cards, or a review widget that loads empty.
  - How we check: Browser: on the top product (focus.productUrl) and the visited collection, read the DOM and known review-app scripts for rating, review count and review list, and check whether the score links to the review section; screenshot. GA4 context: quote that product's view_item→add_to_cart rate beside it.
  - Action: Ask the owner to switch on reviews on product pages and collection cards, starting with the top advertised product.
  - Done when: Our re-scan finds a rating near the price on the top product and ratings on collection cards.
  - Selected because: Backfill: tested in CRO audits (2 of 5 failed); the three review items merged into one trust point on the page paid traffic lands on.
- **MB-CRO-17 Promo codes from your ads have a place to go**
  - Pass: The cart shows a discount code field, or the store applies codes from the link automatically.
  - Fails: Ads or influencers give a code, but the cart has no field, so shoppers hunt for it or leave.
  - How we check: Browser: read the cart DOM after our add for a discount code input. Whether a given code works: not checked.
  - Action: Ask the owner to show the discount field in the cart, or use auto-apply discount links in the ads.
  - Done when: Our re-scan finds a discount field in the cart, or the ad links apply the code.
  - Selected because: Directly affects code-based paid and influencer campaigns; visible on the cart.
- **MB-CRO-18 Product page answers the buying questions**
  - Pass: The top product page has a description in the shopper's language with size, material or specs, and key benefits near Add to Cart.
  - Fails: A one-line or empty description, missing size or specs, or text only in another language.
  - How we check: Browser: on the top product (focus.productUrl) read description length and language, and look for size, material or spec fields; screenshot. GA4: flag high only when view_item→add_to_cart (GA4-02) for that product is below the store's average.
  - Action: Ask the content owner to add size, material and key benefits to the top advertised product first.
  - Done when: The top product page shows a full description with specs in our re-scan.
  - Selected because: Merged product-information items, tied to the product's own add-to-cart rate.
- **MB-CRO-19 Enough product photos on the top product**
  - Pass: The top advertised product shows several photos, including the product in use.
  - Fails: One photo only, or low-quality images on the product page.
  - How we check: Browser: count gallery images on the top product (focus.productUrl) and record their sizes; screenshot. GA4: flag high only when that product's view_item→add_to_cart is below the store's average.
  - Action: Ask the content owner to add more photos, including in-use shots, to the top advertised product.
  - Done when: The top product page shows more than one photo in our re-scan.
  - Selected because: Catalogue lever on the product the ads send traffic to, tied to its GA4 add rate.
- **MB-CRO-20 Return policy reachable from the product page**
  - Pass: The product page or cart links to a return policy or states the return terms.
  - Fails: Return terms only in the footer, or no return policy page.
  - How we check: Browser: read product page and cart DOM for return text or links; crawl the linked policy page for a live response.
  - Action: Ask the owner to add a short return line near Add to Cart, linked to the policy.
  - Done when: Our re-scan finds return terms on the product page or cart.
  - Selected because: A trust point close to the buy button for new paid shoppers.
- **MB-CRO-21 Add to Cart reachable on the phone first screen**
  - Pass: On a phone, Add to Cart is in the first screen of the product page or stays reachable while scrolling.
  - Fails: Add to Cart sits several screens down below images and text.
  - How we check: Browser (phone): record the Add to Cart button position against the viewport and whether it stays fixed on scroll; screenshot. GA4: flag high only when view_item→add_to_cart (GA4-02) is below the tool's benchmark.
  - Action: Ask the developer to bring Add to Cart into the first screen on phone, or keep it fixed on scroll.
  - Done when: Our phone re-scan finds Add to Cart in the first screen or fixed on scroll.
  - Selected because: A checklist item kept only because it is tied to the GA4 product-to-cart step.
- **MB-CRO-22 Prices shown on collection pages**
  - Pass: Every product card on the collection page shows its price.
  - Fails: Cards without a price, so shoppers must open each product.
  - How we check: Browser: on the collection we visit, count product cards and cards with a price; screenshot. GA4: note whether paid sessions land on collection pages (landingPage for paid channels).
  - Action: Ask the developer to show the price on every product card.
  - Done when: Every card on the collection shows a price in our re-scan.
  - Selected because: Matters for campaigns that land on collections; clean DOM check.
- **MB-CRO-23 Search easy to find and returning results**
  - Pass: A search field or icon is visible in the header on phone and desktop, and searching a product name from the store returns results.
  - Fails: No search, search hidden deep in a menu, or a search for a real product name returns nothing.
  - How we check: Browser: find the search input or icon in the header on phone and desktop; read the worker's search test from the store visit (searchTest) for whether a product name returned results; screenshot.
  - Action: Ask the developer to show search in the phone header and fix search results if a real product returns nothing.
  - Done when: Our re-scan finds search in the header and the search test returns products.
  - Selected because: Backfill: tested in CRO audits (2 of 5 failed); visible and testable in our visit.
- **MB-CRO-24 Every page loads on a secure connection**
  - Pass: Home, collection, product and cart load on HTTPS with no browser security warning and no blocked mixed content.
  - Fails: A page loads on http, shows a not-secure warning, or has blocked mixed content (images or scripts) on the buy path.
  - How we check: Browser and crawl: final URL scheme, certificate errors and mixed-content console messages on home, collection, product and cart.
  - Action: Ask the developer to force HTTPS on every page and fix any http images or scripts.
  - Done when: Our re-scan finds HTTPS with no warnings or mixed content on the four pages.
  - Selected because: Backfill: rare but blocks the sale outright; a page fact the visit reads directly.
- **MB-CRO-25 Cart quantity and remove controls work**
  - Pass: In the cart, changing the quantity updates the line and total without errors, and an item can be removed.
  - Fails: Quantity changes don't update the total, show an error, or need a reload.
  - How we check: Browser: after our add, raise the quantity by one in the cart, read the total before and after, then remove the item and confirm the cart updates; screenshot.
  - Action: Send the steps to the developer to fix the cart quantity update.
  - Done when: Our re-scan sees the total change with the quantity and the item removed cleanly.
  - Selected because: A functional cart check we can run in our own visit; lowest value of the set.

</details>

### Clarity (only when connected, outside the 50) — 3 points (3 need a new GA4 query · 0 build on a current tool point)

| # | Point | Severity | Measured by | Who fixes | Ad effect | Why it matters | Sources |
|---|---|---|---|---|---|---|---|
| 1 | **Share of visitors in Facebook/Instagram in-app browsers, and whether mobile breaks** <br><small>MB-CL-01</small> | medium | clarity 🆕 | dev | performance | Meta clicks open in the in-app browser; if mobile breaks there, CVR on paid social likely drops and CPA reads higher, and it is the site, not the ad. | clarity-snapshot |
| 2 | **Quick-backs on the top landing page** <br><small>MB-CL-02</small> | medium | clarity 🆕 | owner, content, dev | performance | Quick-backs on the page ads send traffic to likely mean paid clicks that never get a chance to convert, so CVR reads low and CAC high because of the page, not the targeting. | clarity-snapshot |
| 3 | **Bot traffic inflating the session count** <br><small>MB-CL-03</small> | low | clarity 🆕 | marketing, dev | deflated | Extra non-human sessions in GA4 push reported CVR down, so paid traffic can look like it converts worse than it does; the ad platforms' own counts are not checked here. | clarity-snapshot |

<details><summary>Pass / fails / how we check / action / done when</summary>

- **MB-CL-01 Share of visitors in Facebook/Instagram in-app browsers, and whether mobile breaks**
  - Pass: The in-app browser share is reported (FacebookApp, InstagramApp and any other in-app names in the browsers list, as share of sessions), and mobile sessions show script-error, error-click, dead-click and rage-click shares at or below desktop (byDevice).
  - Fails: A large part of traffic arrives inside Meta's in-app browsers, and mobile sessions show more script errors, error clicks, dead clicks or rage clicks than desktop: the page paid clicks land on works worse where those clicks open.
  - How we check: From the Clarity snapshot (store's own Clarity, last 3 days): sum sessions for in-app entries in browsers (FacebookApp, InstagramApp, plus TikTok or Snapchat in-app names if listed) and divide by total sessions. Compare byDevice mobile vs desktop on scriptErrors, errorClicks, deadClicks and rageClicks. The snapshot does not split behaviours by browser, so the card says the breakage signal is mobile-wide, not in-app-only. If byDevice is null, report the share only and mark the comparison unavailable. GA4 OAuth session source/medium can show how much of the same window is paid social, for context.
  - Action: Forward to the developer: test the landing and product pages inside the Instagram and Facebook apps (open the link from a DM or a test ad), and fix errors and taps that do nothing on mobile.
  - Done when: Next 3-day snapshot shows mobile error and dead/rage-click shares at or below desktop, and a manual in-app test adds to cart without errors.
  - Selected because: Pool had no snapshot-measurable point; in-app share plus mobile vs desktop breakage answers 'does paid traffic convert' from the store's own data.
- **MB-CL-02 Quick-backs on the top landing page**
  - Pass: The top landing page (most visits in topPages, matched to its byUrl row) has a quick-back share at or below the site-wide quickbacks.sessionsPct.
  - Fails: Visitors land on the top landing page and bounce back to where they came from faster than on the rest of the site: the page does not match what the click promised, or loads into something they did not expect.
  - How we check: From the Clarity snapshot: take topPages[0] (or the top non-home page if paid traffic lands on product or collection pages), find its byUrl row, and compare quickbacks % with behaviours.quickbacks.sessionsPct. If byUrl is null, mark unavailable. GA4 OAuth landing-page report filtered to paid source/medium names which page paid traffic actually lands on; use that page if it appears in byUrl. Our headless phone visit of the same page gives a screenshot of the first screen for the card.
  - Action: Forward to the store owner: check that the top landing page's first screen shows the product and offer from the ad. If the ad sells one product, land on that product, not the home page.
  - Done when: Next 3-day snapshot shows the top landing page's quick-back share at or below the site average.
  - Selected because: Quick-backs on the landing page are the closest snapshot signal to post-click message mismatch, compared only with the store's own average.
- **MB-CL-03 Bot traffic inflating the session count**
  - Pass: GA4 sessions for the same 3 days are not above Clarity's sessions plus botSessions; Clarity's bot share (botSessions / (sessions + botSessions)) is reported.
  - Fails: GA4 counts more sessions than Clarity saw in total, bots included, for the same days: GA4 is likely counting non-human or duplicate traffic that dilutes CVR and makes paid traffic look worse than it is.
  - How we check: From the Clarity snapshot: botSessions and sessions give the bot share, reported as a fact. From GA4 OAuth: sessions for the same 3 dates (and by session source/medium for paid). Fail when GA4 sessions exceed Clarity sessions + botSessions. Note on the card: consent banners and ad blockers can make either tool undercount, so the result is direction only. Referrers in the snapshot can show whether paid-click referrers (facebook, instagram, google, snapchat, tiktok) are present at all.
  - Action: Forward to whoever owns GA4: check the paid source/medium rows for sessions with no engagement and odd countries or hours, and exclude known bot traffic before judging CVR.
  - Done when: GA4 sessions for a 3-day window are at or below Clarity sessions plus bot sessions for the same window.
  - Selected because: Answers 'is the number real' on the traffic side by comparing two of the store's own tools, with no invented bot benchmark.

</details>
