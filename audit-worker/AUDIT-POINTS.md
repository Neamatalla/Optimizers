# Audit points: what we check and who decides

Built from the code on `staging`, 22 Nov 2026. A `*` marks a point that today's local branch (`feature/deterministic-checks`, not committed) moves to code.

## Short version

The audit has four sets of points.

**1. The 50 scored checks.** These make the score. Which ones run depends on what the store connected:
GA4 and GTM → 25 GA4 + 25 GTM. Only one of them → that tool's 25 + 25 Website. Neither → all 50 Website.

- **GA4 (25):** code decides 24 of them from the GA4 numbers. The AI only writes the text. That needs OAuth access and enough data. Without them, the AI judges these points from the page source. GA4-25 is always the AI.
- **GTM (25):** the AI decides all 25. With OAuth it reads the real container. Without it, the page source. Two of them also read what our browser visit saw.
- **Website (50):** the AI decides all 50. For 5 of them, code has already collected the facts in our own phone visit, and the AI reads them. For the rest, the AI opens a live browser or reads the page source.
- **Code always does the bookkeeping:** one result per check, made-up or repeated IDs dropped, a missing check counted as "unassessed", then the tally and the score.

**2. Reader versions.** The store owner and the media buyer each get their own 103 points, rewritten from the shared checks. Same rule: code decides the GA4 ones (24 for the store owner, 22 for the media buyer), the AI decides the rest.

**3. Conversion review (48 rules).** Runs only when `FUD_PASS` is on. The AI judge proposes pass, warn or fail. Code compares that with its own detector and can only make it safer: a fail becomes a warn, a weak pass becomes "not confirmed". 3 rules have no detector. Only 16 rules can ever show as fail.

**4. Manual CRO checklist (377 points).** The CRO team's workbook, word for word. Runs with the Conversion review. The AI decides all of them.

**In numbers:** of the 100 shared scored checks, code decides 24 and the AI decides 76. Everything in sets 3 and 4 is the AI, with code only as a safety check in set 3.

## 1. The 50 scored checks

### GA4 (25)

| ID | Point | Decided by | How it's checked |
|---|---|---|---|
| GA4-01 | Biggest funnel leak | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report 28 days, dimensions=[eventName] metrics=[totalUsers] for view_item, add_to_cart, begin_checkout, purchase; c… |
| GA4-02 | Product page to add to cart | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. totalUsers for view_item and add_to_cart, 28 days. |
| GA4-03 | Cart to checkout | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. totalUsers for add_to_cart and begin_checkout, 28 days. |
| GA4-04 | Checkout to purchase | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. totalUsers for begin_checkout, add_shipping_info, add_payment_info, purchase, 28 days. |
| GA4-05 | Mobile vs desktop conversion | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[deviceCategory] metrics=[sessions,transactions], 28 days. |
| GA4-06 | Landing pages with visits but no sales | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[landingPage] metrics=[sessions,conversions] ordered by sessions, 28 days. |
| GA4-07 | Worst paid campaign and its landing page | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[sessionCampaignName,sessionDefaultChannelGroup,landingPage] metrics=[sessions,conversions], 28 d… |
| GA4-08 | Visits with an unknown source | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[sessionDefaultChannelGroup] metrics=[sessions], 28 days. |
| GA4-09 | Visits from countries you don't sell to | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[country] metrics=[sessions,conversions], 28 days. |
| GA4-10 | Products viewed but not added to cart | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[pagePath,eventName] metrics=[eventCount] for view_item and add_to_cart, 28 days. |
| GA4-11 | Order value vs free-shipping threshold | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. purchaseRevenue/transactions for the average order value. |
| GA4-12 | Returning buyers | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[newVsReturning] metrics=[sessions,conversions], 28 days. |
| GA4-13 | Site search | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[searchTerm] metrics=[eventCount], 28 days. |
| GA4-14 | Remarketing audiences | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. list_audiences and list_google_ads_links. |
| GA4-16 | Hours and days that convert | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[dayOfWeek,hour] metrics=[sessions,conversions], 28 days. |
| GA4-15 | Tracking live and stable | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_realtime_report activeUsers; run_report sessions for the last 7 vs the prior 7 days. |
| GA4-17 | Funnel events complete | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[eventName] metrics=[eventCount] for the ecommerce events. |
| GA4-18 | Purchases and revenue agree | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report eventName=purchase metrics=[eventCount,transactions,purchaseRevenue]. |
| GA4-19 | Payment gateways taking sales credit | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[sessionSource,sessionMedium] metrics=[sessions,conversions]. |
| GA4-20 | Key events | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. list_key_events. |
| GA4-21 | Google Ads linked | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. list_google_ads_links. |
| GA4-22 | Currency and timezone | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. get_property (currencyCode, timeZone). |
| GA4-23 | Data kept long enough | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. get_data_retention_settings. |
| GA4-24 | Personal data in GA4 | Code | GA4 reports (OAuth): code computes the numbers and pass/fail. run_report dimensions=[pagePath] and scan for @, %40, email=, phone=. |
| GA4-25 | Team visits filtered out | AI | GA4 Admin: data stream internal traffic rules and data filters. Not in the OAuth pre-fetch: judge from what the data and crawl show, dataSource "detection" when unsure. |

### GTM (25)

| ID | Point | Decided by | How it's checked |
|---|---|---|---|
| GTM-01 | Each purchase counted once | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-02 | Purchase sends value, currency and items | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-03 | Meta pixel purchase with deduplication | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-04 | Pixels for the channels you pay for | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-05 | Google Ads conversion tracking | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-06 | Every funnel step has a tag | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-07 | Conversions on events, not page URLs | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-08 | Product data complete | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-09 | No double page views | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-10 | One measurement ID, no stray IDs | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-11 | WhatsApp and call clicks tracked | AI, from our browser facts | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-12 | Signups and lead forms tracked | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-13 | Site search tracked | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-14 | Ad click IDs kept | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-15 | Session recordings to prove fixes | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-16 | Consent defaults load first | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-17 | Marketing tags respect a refusal | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-18 | No personal data in tags | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-19 | Unknown custom scripts | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-20 | Old agency and campaign tags | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-21 | Checkout events on Shopify | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-22 | Heavy tags on every page | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-23 | Team visits marked internal | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-24 | Add to cart from the drawer tracked | AI, from our browser facts | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |
| GTM-25 | Consent not over-blocking GCC visitors | AI | GTM container (OAuth) when granted, else page source. GTM OAuth data (full tag, trigger and variable parameters) or mcp__google-tag-manager-mcp-server list_tags/list_trigger… |

### Website (50)

The "In 25" column marks the 25 used when the store has only one of GA4/GTM.

| ID | Point | In 25 | Decided by | How it's checked |
|---|---|---|---|---|
| W-01 | Add to cart works | yes | AI, from our browser facts * | Browser facts: addToCart result. Otherwise Live browser on home, product and cart. |
| W-02 | Cart and checkout load without errors | yes | AI | Live browser on home, product and cart. |
| W-03 | Broken files on money pages | yes | AI | Live browser on home, product and cart. Network requests with status >= 400. |
| W-04 | Requests that hang | yes | AI | Live browser on home, product and cart. Network timing. |
| W-05 | Broken links and the 404 page |  | AI | Static crawl of menu/footer links; fetch a made-up URL for the 404 page. |
| W-06 | Redirect chains |  | AI | Crawl redirect chain for http://, https://, www and non-www. |
| W-07 | WhatsApp and call links work | yes | AI, from our browser facts * | Browser facts: contactLinks. Otherwise Live browser on home, product and cart. |
| W-08 | Sold-out products promoted | yes | AI, from our browser facts * | Browser facts: soldOutPromoted. Otherwise Live browser on home, product and cart. |
| W-09 | Main content shows late (LCP) | yes | AI | Live browser on home, product and cart. performance trace, mobile throttling. |
| W-10 | Page jumps while loading (CLS) | yes | AI | Live browser on home, product and cart. performance trace. |
| W-11 | Slow to respond to taps | yes | AI | Live browser on home, product and cart. performance trace long tasks / TBT. |
| W-12 | Render-blocking files | yes | AI | Live browser on home, product and cart. resources before first paint. |
| W-13 | Image weight | yes | AI | Live browser on home, product and cart. image natural vs rendered size, format, loading attribute. |
| W-14 | Heavy code on first load | yes | AI | Live browser on home, product and cart. transfer size by type. |
| W-15 | Third-party app weight | yes | AI | Live browser on home, product and cart. third-party transfer size by domain. |
| W-16 | Leftover scripts from removed apps | yes | AI | Live browser on home, product and cart. third-party scripts vs visible features; failed app requests. |
| W-17 | Heavy hero video on phones |  | AI, from our browser facts * | Browser facts: heroVideoMobile. Otherwise Live browser on home, product and cart. |
| W-18 | Compression and caching |  | AI | Response headers: content-encoding, cache-control. |
| W-19 | Arabic font loading |  | AI | @font-face font-display, font file sizes. |
| W-20 | Mobile layout |  | AI | Live browser on home, product and cart. at 390px. |
| W-21 | Tag on every page type | yes | AI | Live browser on home, product and cart. gtag/GTM requests per page. |
| W-22 | Add to cart is recorded | yes | AI, from our browser facts * | Browser facts: atcEvents. Otherwise Live browser on home, product and cart. dataLayer after clicking Add to Cart. |
| W-23 | Event data complete | yes | AI | Live browser on home, product and cart. dataLayer ecommerce objects. |
| W-24 | Tags firing twice | yes | AI | Live browser on home, product and cart. count collect hits per event. |
| W-25 | Ad pixels present | yes | AI | Crawl detected pixels + browser requests (blocked hits still show the vendor). |
| W-26 | Campaign tags survive |  | AI | Fetch a URL with UTMs and follow redirects; scan internal links for utm_. |
| W-27 | Old Universal Analytics |  | AI | Crawl for analytics.js / UA- IDs. |
| W-28 | dataLayer set before the tag |  | AI | Source order of dataLayer and the GTM snippet. |
| W-29 | Consent banner connected | yes | AI | Live browser on home, product and cart. gcs/consent parameters before and after a choice. |
| W-30 | Personal data in URLs | yes | AI | Crawl forms using GET with email/phone fields; URLs seen in the browser. |
| W-31 | HTTPS and checkout trust |  | AI | Crawl http:// redirect, mixed-content requests, checkout domain. |
| W-32 | Security headers and cookies |  | AI | Response headers and Set-Cookie flags. On a hosted platform mark pass as platform-managed. |
| W-33 | Exposed files |  | AI | Fetch common paths (/.env, /.git/config, *.map). |
| W-34 | Vulnerable libraries |  | AI | Library versions from the crawl/browser. |
| W-35 | Trackers not in the privacy policy |  | AI | Detected trackers vs the privacy policy text. |
| W-36 | Money pages blocked from Google | yes | AI | Meta robots, X-Robots-Tag, robots.txt rules on product/collection URLs. |
| W-37 | Page titles |  | AI | Titles of the discovered pages. |
| W-38 | Descriptions and canonicals |  | AI | Meta description + canonical on the discovered pages. |
| W-39 | robots.txt and sitemap |  | AI | Fetch /robots.txt and the sitemap. |
| W-40 | Product schema | yes | AI | JSON-LD on the product page. |
| W-41 | Schema matches the page | yes | AI | JSON-LD price/availability vs the visible price and stock on the product page. |
| W-42 | Brand and product IDs in schema |  | AI | JSON-LD brand, gtin*, mpn. |
| W-43 | Review stars and breadcrumbs |  | AI | JSON-LD AggregateRating and BreadcrumbList. |
| W-44 | Link previews in WhatsApp and Instagram | yes | AI | Open Graph tags on home and product. |
| W-45 | Arabic and English versions |  | AI | html lang/dir, hreflang links, Arabic URLs. |
| W-46 | Filter and sort pages indexed |  | AI | Canonical/robots on a filtered collection URL. |
| W-47 | Contrast on price and buttons |  | AI | Live browser on home, product and cart. computed colours of price and CTA. |
| W-48 | Product image descriptions |  | AI | img alt on product and collection pages. |
| W-49 | Form labels |  | AI | Inputs vs label/aria-label. |
| W-50 | Icon buttons named |  | AI | Buttons/links without text or aria-label. |

## 2. Reader versions (store owner, media buyer)

Same route and scale, but each reader has its own rewritten points. "From" is the shared check each one was rewritten from.

<details><summary>Store owner (103 points)</summary>

| ID | Section | Point | From | Decided by | How it's checked |
|---|---|---|---|---|---|
| SO-GA4-01 | GA4 | The one step losing you the most sales | GA4-01 | Code | Computed GA4 fact: run_report 28 days, dimensions=[eventName], metrics=[totalUsers] for view_item, add_to_cart, begin_checkout, purchase; c… |
| SO-GA4-02 | GA4 | Shoppers who start checkout but don't pay | GA4-04 | Code | Computed GA4 fact: run_report 28 days, metrics=[totalUsers] for begin_checkout, add_shipping_info, add_payment_info, purchase; name the sub… |
| SO-GA4-03 | GA4 | Carts that never reach checkout | GA4-03 | Code | Computed GA4 fact: run_report 28 days, metrics=[totalUsers] for add_to_cart and begin_checkout; our cart visit (browser) shows what the car… |
| SO-GA4-04 | GA4 | Product visits that don't turn into add to cart | GA4-02 | Code | Computed GA4 fact: run_report 28 days, metrics=[totalUsers] for view_item and add_to_cart. |
| SO-GA4-05 | GA4 | Phone shoppers buy less than desktop shoppers | GA4-05 | Code | Computed GA4 fact: run_report 28 days, dimensions=[deviceCategory], metrics=[sessions,transactions]; phone screenshots from our headless vi… |
| SO-GA4-06 | GA4 | Your sales number in GA4 matches your real orders | GA4-18, GTM-02 | Code | Computed GA4 fact: run_report eventName=purchase metrics=[eventCount,transactions,purchaseRevenue]; new query: run_report 28 days dimension… |
| SO-GA4-07 | GA4 | GA4 is recording right now, with no sudden drops or jumps | GA4-15 | Code | Computed GA4 fact: run_realtime_report activeUsers; run_report sessions last 7 vs prior 7 days; new query: run_report 28 days dimensions=[d… |
| SO-GA4-08 | GA4 | Every buying step is recorded | GA4-17 | Code | Computed GA4 fact: run_report 28 days dimensions=[eventName] metrics=[eventCount] for view_item, add_to_cart, begin_checkout, purchase. |
| SO-GA4-09 | GA4 | Popular products that people view but don't add | GA4-10 | Code | Computed GA4 fact: run_report 28 days dimensions=[pagePath,eventName] metrics=[eventCount] for view_item and add_to_cart; our headless visi… |
| SO-GA4-10 | GA4 | Landing pages with visits but no sales | GA4-06 | Code | Computed GA4 fact: run_report 28 days dimensions=[landingPage] metrics=[sessions,conversions] ordered by sessions. |
| SO-GA4-11 | GA4 | Free-delivery threshold vs your average order | GA4-11 | Code | Computed GA4 fact: purchaseRevenue / transactions for the average order value; the threshold is read from the live store pages and cart in… |
| SO-GA4-12 | GA4 | Paid campaign that brings visits but no sales | GA4-07 | Code | Computed GA4 fact: run_report 28 days dimensions=[sessionCampaignName,sessionDefaultChannelGroup,landingPage] metrics=[sessions,conversions… |
| SO-GA4-13 | GA4 | Bringing buyers back | GA4-12 | Code | Computed GA4 fact: run_report 28 days dimensions=[newVsReturning] metrics=[sessions,conversions]; our headless visit looks for a WhatsApp o… |
| SO-GA4-14 | GA4 | Tabby, Tamara or your payment page taking credit for sales | GA4-19 | Code | Computed GA4 fact: run_report 28 days dimensions=[sessionSource,sessionMedium] metrics=[sessions,conversions]; match sources against the ga… |
| SO-GA4-15 | GA4 | Your own store domains showing as a traffic source |  | Code | New GA4 fact: run_report 28 days dimensions=[sessionSource,sessionMedium] metrics=[sessions,conversions,purchaseRevenue] filtered to medium… |
| SO-GA4-16 | GA4 | GA4 uses your currency and time zone | GA4-22 | Code | Computed GA4 fact: get_property (currencyCode, timeZone) compared with the top country by sessions and purchases. |
| SO-GA4-17 | GA4 | Visits and sales with no known source | GA4-08 | Code | Computed GA4 fact: run_report 28 days dimensions=[sessionDefaultChannelGroup] metrics=[sessions]; new check: run_report dimensions=[session… |
| SO-GA4-18 | GA4 | Campaign tags survive redirects so GA4 credits the right source |  | AI, from our browser facts | Browser: open the home page with test utm_ parameters on phone and desktop and check the page_location of the first GA4 page_view after red… |
| SO-GA4-19 | GA4 | Test and preview sites sending data into your real numbers |  | Code | New GA4 fact: run_report 28 days dimensions=[hostName] metrics=[sessions,transactions,purchaseRevenue]; flag hostnames that are not the sto… |
| SO-GA4-20 | GA4 | Only real sales count as conversions | GA4-20 | Code | Computed GA4 fact: list_key_events; new check: run_report 90 days dimensions=[eventName] metrics=[eventCount] to flag key events with zero… |
| SO-GA4-21 | GA4 | What shoppers search for on your store | GA4-13 | Code | Computed GA4 fact: run_report 28 days dimensions=[searchTerm] metrics=[eventCount]; our phone visit checks the search icon in the header. |
| SO-GA4-22 | GA4 | Sales recorded per product |  | Code | New GA4 fact: run_report 28 days dimensions=[itemName] metrics=[itemRevenue,itemsPurchased]; share of (not set) item rows; compare total it… |
| SO-GA4-23 | GA4 | Customer emails and phone numbers in GA4 | GA4-24 | Code | Computed GA4 fact: run_report 28 days dimensions=[pagePath,pageLocation] scanning for @, %40, email=, phone=, mobile= and long digit string… |
| SO-GA4-24 | GA4 | Visits from countries you don't deliver to | GA4-09 | Code | Computed GA4 fact: run_report 28 days dimensions=[country] metrics=[sessions,conversions]. |
| SO-GA4-25 | GA4 | Hours and days your store sells best | GA4-16 | Code | Computed GA4 fact: run_report 28 days dimensions=[dayOfWeek,hour] metrics=[sessions,conversions]. |
| SO-GTM-01 | GTM | Purchase tags fire once, only on the real purchase | GTM-01, GTM-07 | AI | GTM read: for each purchase/conversion tag, list its firing triggers; fail if any is a page-view trigger with a thank-you/order URL filter,… |
| SO-GTM-02 | GTM | Shopify checkout and orders are tracked | GTM-21 | AI | Platform from the crawl and headless visit; GTM read for begin_checkout and purchase tags and their triggers; headless visit for the Shopif… |
| SO-GTM-03 | GTM | Consent settings do not hide your Gulf visitors | GTM-25 | AI | GTM read: consent default tag parameters (region list, ad_storage, analytics_storage); headless visit without clicking the banner: decode t… |
| SO-GTM-04 | GTM | Add to cart is counted once in tracking for each real add | GTM-24 | AI, from our browser facts | Headless phone visit: click Add to Cart on one product, confirm the cart count changed, and check the dataLayer and network for exactly one… |
| SO-GTM-05 | GTM | Each ad pixel is installed once, not twice |  | AI, from our browser facts | Headless visit of home, product and cart: count base-pixel loads and event hits per pixel ID in the network log; compare with pixel tags in… |
| SO-GTM-06 | GTM | Purchase tag set up for every ad platform you pay for | GTM-04 | AI | GA4 report: paid channels by source; GTM read: for each paying platform, a purchase event tag with an active purchase trigger. Live pixel l… |
| SO-GTM-07 | GTM | WhatsApp and call clicks are counted | GTM-11 | AI | Headless visit lists wa.me, api.whatsapp.com and tel: links; GTM read for link-click triggers on those URLs and the event they send. Fail i… |
| SO-GTM-08 | GTM | Your data goes to your own GA4 only | GTM-10 | AI | GTM read: collect every G- ID in tags and variables; headless visit: list G- IDs in GA4 hits. Fail if any ID is not the store's connected p… |
| SO-GTM-09 | GTM | Ad pixel loads before its events |  | AI | GTM read: setup-tag sequencing and firing priority on pixel event tags; headless visit: order of base-pixel load and event hits in the netw… |
| SO-GTM-10 | GTM | Meta does not count the same sale twice | GTM-03 | AI | GTM read: Meta pixel tags (Custom HTML or template) and their event name and eventID parameters; headless visit: event_id present on Meta h… |
| SO-GTM-11 | GTM | Each ad platform gets your sales on one pixel ID |  | AI | GTM read: collect pixel and conversion IDs from every Meta, Snapchat, TikTok and Google Ads tag and variable; group by platform; fail if a… |
| SO-GTM-12 | GTM | Google Ads sees your sales | GTM-05 | AI | GA4 report: google / cpc sessions; GTM read: awct and Conversion Linker tags and the enhanced conversions setting on the tag. |
| SO-GTM-13 | GTM | Key tags fire on store events, not on how buttons look |  | AI | GTM read: for each active tag on a shopping or contact action (add to cart has its own point), list trigger types and conditions; flag Clic… |
| SO-GTM-14 | GTM | Newsletter and contact form sign-ups are counted | GTM-12 | AI | Crawl and headless visit list sign-up and contact forms on home, product and footer (we do not submit them); GTM read: tags sending sign_up… |
| SO-GTM-15 | GTM | Ad click IDs are saved so ad platforms can match sales | GTM-14 | AI, from our browser facts | Headless visit to a product page with test gclid, fbclid and ttclid parameters added to the URL; check first-party cookies (_gcl_aw, _fbc,… |
| SO-GTM-16 | GTM | Ad and analytics tags don't send plain customer emails or phone numbers | GTM-18 | AI | GTM read: scan tag parameters and dataLayer variables used by tags for email or phone fields and hashing settings. Personal data in page ad… |
| SO-GTM-17 | GTM | Your latest tracking fixes are actually live |  | AI | GTM read: latest published version number and date, and workspace status (pending changes); crawl: fetch the live gtm.js for the container… |
| SO-GTM-18 | GTM | No unknown scripts running on your store | GTM-19 | AI | GTM read: list Custom HTML tags, the domains their scripts load, and whether an official template exists for that vendor; headless visit: d… |
| SO-GTM-19 | GTM | Pages that change without reloading are still counted |  | AI | Headless visit: move from home to collection to product by tapping links and note whether the document reloads or the address changes by sc… |
| SO-GTM-20 | GTM | Old agency and campaign tags removed | GTM-20 | AI | GTM read: paused flag, tags without firing triggers, vendor names and IDs not matching current platforms; headless visit: requests to those… |
| SO-GTM-21 | GTM | Your team's visits are kept out of sales numbers | GTM-23 | AI | GTM read: traffic_type parameter on the Google tag, or a blocking exception for staff or admin sessions. |
| SO-GTM-22 | GTM | Triggers don't depend on switched-off settings |  | AI | GTM read: list enabled built-in variables and every {{variable}} reference in triggers and tags; fail on references to built-ins that are n… |
| SO-GTM-23 | GTM | Consent banner works before and after the choice | GTM-16, GTM-17 | AI | GTM read: consent tag trigger (Consent Initialization - All Pages) and each marketing tag's consent settings; headless visit: whether pixel… |
| SO-GTM-24 | GTM | Session recordings installed to check your fixes | GTM-15 | AI, from our browser facts | GTM read for Clarity or Hotjar tags; crawl and headless visit for their script requests on live pages. We only check that it loads; we do n… |
| SO-GTM-25 | GTM | Visits to missing pages are recorded |  | AI, from our browser facts | Headless visit to a made-up address on the store: check whether a page_view with a not-found title or a dedicated error event is sent; GTM… |
| SO-WC-01 | WEBCODE | Add to cart actually adds the product | W-01 | AI, from our browser facts * | Headless phone visit of one product page: tap Add to cart, then read the cart count, the cart drawer or cart page, and the network response… |
| SO-WC-02 | WEBCODE | The cart opens without errors | W-02 | AI, from our browser facts | Headless phone and desktop visit of the cart after our add to cart: collect console errors, uncaught exceptions and failed requests (status… |
| SO-WC-03 | WEBCODE | Product page shows fast on phones | W-09 | AI, from our browser facts | Headless phone visit of the product page with a throttled mobile profile: read LCP and the element that was the LCP. Fail when LCP is over… |
| SO-WC-04 | WEBCODE | WhatsApp and call links use a number that works | W-07 | AI, from our browser facts * | Headless visit of home, collection, product and cart: collect every wa.me, api.whatsapp.com and tel: link and check each number is present… |
| SO-WC-05 | WEBCODE | Google can show your products and collections | W-36 | AI | Public crawl: fetch robots.txt and the sitemap, then the HTML and headers of the visited product and collection pages plus a sample of site… |
| SO-WC-06 | WEBCODE | Tracking loads on every page type, phone and desktop | W-21 | AI, from our browser facts | Crawl the HTML source of home, one collection, one product and the cart, and check the headless phone and desktop visits for a gtm.js reque… |
| SO-WC-07 | WEBCODE | Shopping events carry value, currency and product details | W-23, GTM-08 | AI, from our browser facts | Headless visit: read the dataLayer pushes and GA4 collect hits for view_item on the product page and add_to_cart after our click. Fail when… |
| SO-WC-08 | WEBCODE | GA4 counts each visit and event once | W-24, GTM-09 | AI, from our browser facts | Headless phone and desktop visit of home, collection, product and cart: count gtag/js loads and GA4 collect hits per page load and per even… |
| SO-WC-09 | WEBCODE | The value sent matches the price shown on the page |  | AI, from our browser facts | Headless visit: read the displayed price on the product page and the value and currency in the view_item and add_to_cart dataLayer pushes a… |
| SO-WC-10 | WEBCODE | No broken images or files on the pages that sell | W-03 | AI, from our browser facts | Headless visit of home, collection, product and cart: list network requests with status 400 or more and the page each is on. |
| SO-WC-11 | WEBCODE | Ad pixels fire on your live pages | W-25 | AI, from our browser facts | Headless visit: detect Meta, Snapchat, TikTok and Google Ads tags in the HTML and network, and check each sends PageView/ViewContent and Ad… |
| SO-WC-12 | WEBCODE | Taps respond without delay | W-11 | AI, from our browser facts | Headless phone visit of the product page: record main-thread long tasks during load and report the longest and the scripts behind them. |
| SO-WC-13 | WEBCODE | Product photos are not heavier than needed | W-13 | AI, from our browser facts | Headless phone visit of home, collection and product: compare each image's file size and pixel size with its displayed size, check format a… |
| SO-WC-14 | WEBCODE | Apps and tags do not slow the store down | W-15, GTM-22 | AI, from our browser facts | Headless phone visit: group network bytes and script time by third-party domain and name the app or GTM tag behind each; report the share o… |
| SO-WC-15 | WEBCODE | The page does not jump while loading | W-10 | AI, from our browser facts | Headless phone visit: read CLS and the elements that moved on home, collection and product. |
| SO-WC-16 | WEBCODE | Menu reaches every category and no menu or footer link is dead | W-05 | AI | Public crawl plus headless visit: list collection URLs from the sitemap and the links in the header, mobile menu and footer; list collectio… |
| SO-WC-17 | WEBCODE | Product names show in full on collection pages |  | AI, from our browser facts | Headless phone and desktop visit of the collection: for each product card, read the visible name text and check it is present and not trunc… |
| SO-WC-18 | WEBCODE | Tracking starts before phone shoppers leave a slow page |  | AI, from our browser facts | Headless phone visit of home, collection and product with a throttled mobile profile: record the time of the gtm.js load, the first GA4 pag… |
| SO-WC-19 | WEBCODE | No slow or blocking code before the page shows | W-12, W-14, W-04 | AI, from our browser facts | Headless phone visit of home, collection and product: list render-blocking resources, requests longer than 3 seconds that delay visible con… |
| SO-WC-20 | WEBCODE | No leftover code from apps you removed | W-16 | AI, from our browser facts | Headless visit: list third-party script domains, match them to known apps, and flag those with no matching widget on the page or that retur… |
| SO-WC-21 | WEBCODE | Colour options shown as swatches on the product page |  | AI, from our browser facts | Headless phone and desktop visit of the product page: read the variant options; when a colour option exists, check whether it shows as swat… |
| SO-WC-22 | WEBCODE | Google sees the right price and stock | W-40, W-41 | AI | Public crawl of the visited product page and sitemap samples: read JSON-LD Product/Offer price, currency and availability and compare them… |
| SO-WC-23 | WEBCODE | Home banners record views and taps, so you can see which ones sell |  | AI, from our browser facts | Headless phone and desktop visit of home: read dataLayer pushes and GA4 hits for view_promotion when the hero banners show; tap the first b… |
| SO-WC-24 | WEBCODE | Shared links show a picture in WhatsApp and Instagram | W-44 | AI | Public crawl of home and product HTML: check og:title, og:image and og:description exist and the og:image URL loads. |
| SO-WC-25 | WEBCODE | Product data is ready and fresh when tags read it | W-28 | AI, from our browser facts | Crawl: order of the dataLayer declaration and the GTM snippet in the HTML source. Headless visit: read the dataLayer sequence on collection… |
| SO-CRO-01 | CRO | Customers can see they can pay with mada, Apple Pay, Tabby or Tamara before checkout |  | AI, from our browser facts | Headless phone and desktop visit of the product page and the cart: search the DOM (img alt/src, svg titles, class names, visible text) for… |
| SO-CRO-02 | CRO | Delivery cost is shown before checkout |  | AI, from our browser facts | Headless phone visit of product page and cart after our add to cart: search visible text for delivery/shipping cost wording (توصيل, شحن, de… |
| SO-CRO-03 | CRO | Free-delivery threshold is shown and explained |  | AI, from our browser facts | Headless phone visit of home, product and cart: search visible text for free-delivery wording (توصيل مجاني, شحن مجاني, free delivery/shippi… |
| SO-CRO-04 | CRO | Cash-on-delivery fee is stated before checkout |  | AI, from our browser facts | Headless phone visit of product page and cart plus public crawl of the delivery/payment policy pages: search for COD wording (الدفع عند الا… |
| SO-CRO-05 | CRO | WhatsApp button is easy to see on phones and doesn't cover the buy button |  | AI, from our browser facts | Headless phone visit of product page and cart: find links to wa.me, api.whatsapp.com or whatsapp:// and chat widgets; check the element's b… |
| SO-CRO-06 | CRO | Add to cart is in the first phone screen |  | AI, from our browser facts | Headless phone visit (375px) of the product page: locate the Add to cart button and the price, read their bounding boxes and check they fal… |
| SO-CRO-07 | CRO | Product titles are in Arabic |  | AI, from our browser facts | Headless visit of the Arabic version of the collection and product pages: read the product card titles and the product h1; compute the shar… |
| SO-CRO-08 | CRO | Arabic pages read right to left on the phone, cart included | W-45 | AI, from our browser facts | Headless phone visit of the Arabic home, product and cart pages: read html lang/dir and the computed direction of the main product and cart… |
| SO-CRO-09 | CRO | Cart shows the same price and a clear total |  | AI, from our browser facts | Headless phone visit: record the price (and any sale price) on the product page, add the product to the cart, then read the cart line price… |
| SO-CRO-10 | CRO | Checkout button in the cart is clear on the phone |  | AI, from our browser facts | Headless phone visit of the cart after our add to cart: locate the checkout button, read its label and bounding box, check it is in the fir… |
| SO-CRO-11 | CRO | Pay-in-instalments price is shown on the product page |  | AI, from our browser facts | Headless phone visit of product page and cart: look for Tabby or Tamara widget elements or scripts in the DOM and network, and for instalme… |
| SO-CRO-12 | CRO | Phone layout has no sideways scroll and buttons are easy to tap | W-20 | AI, from our browser facts | Headless 375px visit of the four pages: compare document scrollWidth with viewport width; measure the bounding boxes of Add to cart, quanti… |
| SO-CRO-13 | CRO | Delivery time is shown before buying |  | AI, from our browser facts | Headless phone visit of collection and product pages: search visible text for delivery-time wording (توصيل خلال, أيام, delivery in, days) w… |
| SO-CRO-14 | CRO | Return and exchange policy is easy to find |  | AI, from our browser facts | Headless visit and public crawl: find footer links to return/exchange, privacy and terms pages on home, product and cart; fetch each and ch… |
| SO-CRO-15 | CRO | Reviews and ratings show on product and collection pages |  | AI, from our browser facts | Headless visit of product and collection pages: detect review widgets and rating elements (stars, counts) in the DOM; read the review count… |
| SO-CRO-16 | CRO | Product page has several clear photos |  | AI, from our browser facts | Headless phone visit of the product page: count unique gallery image URLs, read their natural sizes against displayed sizes. Screenshot the… |
| SO-CRO-17 | CRO | Product description answers buyer questions, in Arabic |  | AI, from our browser facts | Headless visit of the Arabic product page: extract the description text, measure its length, check the share of Arabic letters, and look fo… |
| SO-CRO-18 | CRO | Sale price and saving are clear |  | AI, from our browser facts | Headless visit of collection and product pages: check each card has a price; where a compare-at or crossed-out price exists, check the new… |
| SO-CRO-19 | CRO | Sold-out products don't block the shopper | W-08 | AI, from our browser facts * | Headless visit of home and the collection page: read the products in the hero and first row and their stock state from the page and product… |
| SO-CRO-20 | CRO | Language switch and prices in the right currency |  | AI, from our browser facts | Headless phone visit of home, collection, product and cart: find language and currency switch controls in header or menu and their visibili… |
| SO-CRO-21 | CRO | Related products shown to raise order value |  | AI, from our browser facts | Headless visit of product page and cart: detect related/recommended product blocks (section headings such as منتجات مشابهة, recommendation… |
| SO-CRO-22 | CRO | Cart icon is always visible in the phone header |  | AI, from our browser facts | Headless phone visit of home, collection and product: find the header cart link or icon, check it is visible in the first viewport and link… |
| SO-CRO-23 | CRO | Search is easy to find on the phone |  | AI, from our browser facts | Headless phone visit of home and collection: locate search inputs or search icons in the header and check they are visible in the first vie… |
| SO-CRO-24 | CRO | Filter and sort are available on phone collection pages |  | AI, from our browser facts | Headless phone visit of the collection page: find filter and sort controls and check they are visible in the first viewport or a sticky bar… |
| SO-CRO-25 | CRO | No heavy autoplay video on the phone first screen | W-17 | AI, from our browser facts * | Headless phone visit of the home page: detect video elements with autoplay in the first viewport and record their file size from network re… |
| SO-CL-01 | CLARITY | Shoppers tap things that don't work on your top product page |  | AI | From the Clarity snapshot (store's own Clarity, last 3 days): pick the byUrl row with the most sessions whose URL matches a product-page pa… |
| SO-CL-02 | CLARITY | Errors on the pages where people buy |  | AI | From the Clarity snapshot: find byUrl rows for product pages (URL pattern as in SO-CL-01) and the cart page (/cart). Compare each row's scr… |
| SO-CL-03 | CLARITY | How far phone shoppers scroll on your top product page |  | AI | From the Clarity snapshot: compare byDevice mobile scrollDepth with desktop scrollDepth, and the top product page's byUrl scrollDepth (URL… |

</details>

<details><summary>Media buyer (103 points)</summary>

| ID | Section | Point | From | Decided by | How it's checked |
|---|---|---|---|---|---|
| MB-GA4-01 | GA4 | Paid campaign that brings clicks but almost no sales | GA4-07 | Code | GA4 fact GA4-07: run_report 28 days, dimensions=[sessionCampaignName, sessionDefaultChannelGroup, landingPage], metrics=[sessions, transact… |
| MB-GA4-02 | GA4 | Same order counted twice in GA4 | GA4-18 | Code | GA4: run_report 28 days, eventName=purchase, dimensions=[transactionId] metrics=[eventCount]; fail only when a transaction ID has eventCoun… |
| MB-GA4-03 | GA4 | GA4 purchase revenue zero, in mixed currencies, or not matching its items | GA4-18 | Code | GA4: run_report 28 days eventName=purchase metrics=[eventCount, purchaseRevenue, itemRevenue]; run_report dimensions=[currencyCode] for pur… |
| MB-GA4-04 | GA4 | Where paid visitors drop after the click | GA4-01, GA4-02, GA4-03, GA4-04 | Code | GA4: run_report 28 days dimensions=[eventName, sessionDefaultChannelGroup] metrics=[totalUsers] for view_item, add_to_cart, begin_checkout,… |
| MB-GA4-05 | GA4 | Key events count only real sales | GA4-20 | Code | GA4 fact GA4-20: list_key_events; flag purchase missing, any noise or audience-trigger event marked as a key event, and key events with zer… |
| MB-GA4-06 | GA4 | Tracking live with no sudden drop | GA4-15 | Code | GA4 fact GA4-15: run_realtime_report activeUsers; run_report sessions and purchase eventCount for the last 7 vs the prior 7 days. |
| MB-GA4-07 | GA4 | Payment gateways taking credit for paid sales | GA4-19 | Code | GA4 fact GA4-19: run_report dimensions=[sessionSource, sessionMedium] metrics=[sessions, transactions], matched against a gateway domain li… |
| MB-GA4-08 | GA4 | Paid landing pages that don't convert | GA4-06 | Code | GA4: run_report 28 days dimensions=[landingPage, sessionDefaultChannelGroup] metrics=[sessions, transactions], paid channel groups only; co… |
| MB-GA4-09 | GA4 | Paid sessions with an unknown source | GA4-08 | Code | GA4 fact GA4-08: run_report 28 days dimensions=[sessionDefaultChannelGroup] metrics=[sessions, transactions]; list the top source/medium pa… |
| MB-GA4-10 | GA4 | Session breaks between store domains |  | AI | GA4: run_report 28 days dimensions=[sessionSource, sessionMedium] metrics=[sessions, transactions], flag the store's own hostnames and chec… |
| MB-GA4-11 | GA4 | Clean UTM names on paid links |  | Code | GA4: run_report 28 days dimensions=[sessionSource, sessionMedium, sessionCampaignName] metrics=[sessions, transactions]; code flags case va… |
| MB-GA4-12 | GA4 | Paid traffic on phones vs desktop | GA4-05 | Code | GA4: run_report 28 days dimensions=[deviceCategory, sessionDefaultChannelGroup] metrics=[sessions, transactions], paid channel groups only… |
| MB-GA4-13 | GA4 | Paid sales from new buyers vs returning ones | GA4-12 | Code | GA4: run_report 28 days dimensions=[newVsReturning, sessionDefaultChannelGroup] metrics=[sessions, transactions, purchaseRevenue], paid cha… |
| MB-GA4-14 | GA4 | Paid sessions that look like bots |  | Code | GA4: run_report 28 days dimensions=[sessionSource, sessionMedium, sessionCampaignName] metrics=[sessions, engagementRate, userEngagementDur… |
| MB-GA4-15 | GA4 | Google Ads linked to GA4 | GA4-21 | Code | GA4 fact GA4-21: list_google_ads_links. Whether purchase is the primary conversion in Google Ads is not verifiable from the audit: check in… |
| MB-GA4-16 | GA4 | Funnel events all reach GA4 with sane counts | GA4-17, GTM-06 | AI | GA4 fact GA4-17: run_report dimensions=[eventName] metrics=[eventCount] for the ecommerce events; plus run_report dimensions=[pagePath] met… |
| MB-GA4-26 | GA4 | Returned and cancelled orders reach GA4 |  | Code | GA4 fact GA4-P17: the 90-day event list; fail when purchases exist and no refund event was recorded. |
| MB-GA4-18 | GA4 | Retargeting audiences ready | GA4-14 | Code | GA4 fact GA4-14: list_audiences and list_google_ads_links. |
| MB-GA4-19 | GA4 | Product pages that get views but no add to cart | GA4-10 | Code | GA4 fact GA4-10: run_report 28 days dimensions=[pagePath, eventName] metrics=[eventCount] for view_item and add_to_cart. |
| MB-GA4-20 | GA4 | Order value vs free-shipping threshold | GA4-11 | Code | GA4 fact GA4-11: AOV from purchaseRevenue / transactions, 28 days; threshold read from the live store pages and the cart in the headless vi… |
| MB-GA4-21 | GA4 | Countries that get visits but never buy | GA4-09 | Code | GA4 fact GA4-09: run_report 28 days dimensions=[country, sessionDefaultChannelGroup] metrics=[sessions, transactions]. |
| MB-GA4-22 | GA4 | Data comes only from the live store |  | Code | GA4: run_report 28 days dimensions=[hostName] metrics=[sessions, transactions, purchaseRevenue]; flag any hostname that is not the store's… |
| MB-GA4-23 | GA4 | Internal links that overwrite the ad source |  | AI | Public crawl of home, one collection, one product and the cart: list links to the store's own domain whose href has utm_source, utm_medium… |
| MB-GA4-24 | GA4 | Hours and days that convert | GA4-16 | Code | GA4 fact GA4-16: run_report 28 days dimensions=[dayOfWeek, hour] metrics=[sessions, transactions]. |
| MB-GA4-25 | GA4 | Property currency and timezone match the store | GA4-22 | Code | GA4 fact GA4-22: get_property (currencyCode, timeZone), compared with the top country by sessions and transactions. |
| MB-GTM-01 | GTM | Purchase tags fire on a thank-you page view or without an order ID | GTM-01, GTM-07 | AI | GTM read: list every purchase/conversion tag for each platform, its firing trigger (custom event vs page view + URL filter) and whether tra… |
| MB-GTM-02 | GTM | Shopify checkout purchases actually reach the platforms | GTM-21 | AI | Crawl/browser: detect Shopify. GTM read: find begin_checkout and Purchase tags and check whether they rely on triggers that can only fire i… |
| MB-GTM-03 | GTM | Purchase tags mapped to value, currency and items | GTM-02 | AI | GTM read: for each platform's Purchase tag, the value, currency and items/contents parameters and the variables behind them (paths such as… |
| MB-GTM-04 | GTM | Consent default set first in the container, per region | GTM-16, GTM-25 | AI | GTM read: the consent/CMP tag's trigger and firing order, its default parameters and region lists, and the consent settings on each Meta, S… |
| MB-GTM-05 | GTM | Meta events carry an event_id for CAPI dedupe | GTM-03 | AI | GTM read: eventID parameter on Meta Purchase and AddToCart tags and the variable behind it (unique per event, not a constant). Browser: the… |
| MB-GTM-06 | GTM | Meta tags set up for every funnel step | GTM-04 | AI | GA4 report: sessionSource/medium for facebook, instagram, meta paid traffic. GTM read: Meta tags for ViewContent, AddToCart, InitiateChecko… |
| MB-GTM-07 | GTM | Container sends data to IDs the store doesn't own | GTM-10, GTM-20 | AI | GTM read: list every tag's platform and ID (direct or through variables), paused tags, tags with no trigger, and IDs that differ from the m… |
| MB-GTM-08 | GTM | Server route for Meta CAPI, Snap CAPI and TikTok Events API |  | AI | GTM read: server_container_url / transport_url on the Google tag, server-bound tags or templates for Meta CAPI, Snap CAPI or TikTok Events… |
| MB-GTM-09 | GTM | Conversion tags that fire on every page |  | AI | GTM read: the triggers on each conversion tag across platforms; flag All Pages, page-view triggers with no URL or event condition, and trig… |
| MB-GTM-10 | GTM | Add to Cart tags triggered by a button click, not the add event | GTM-24 | AI | GTM read: the trigger type and conditions behind each platform's Add to Cart tag (custom event vs click, element selector or form submit). |
| MB-GTM-11 | GTM | Google Ads conversion tag, Conversion Linker and Enhanced Conversions set | GTM-05, GTM-14 | AI | GA4 report: google / cpc traffic. GTM read: awct and Conversion Linker tags, their triggers, and the conversion tag's user-provided-data se… |
| MB-GTM-12 | GTM | Snap tags set up for the funnel your Snap ads need | GTM-04 | AI | GA4 report: sessionSource for snapchat paid traffic. GTM read: Snap tags for VIEW_CONTENT, ADD_CART and PURCHASE and their triggers. Browse… |
| MB-GTM-13 | GTM | Snap events carry a dedupe id for Snap CAPI |  | AI | GTM read: client_dedup_id (or the template's dedupe field) on Snap PURCHASE and ADD_CART tags and the variable behind it. Browser: the dedu… |
| MB-GTM-14 | GTM | TikTok tags set up for the funnel your TikTok ads need | GTM-04 | AI | GA4 report: sessionSource for tiktok paid traffic. GTM read: TikTok tags for ViewContent, AddToCart, InitiateCheckout and CompletePayment/P… |
| MB-GTM-15 | GTM | TikTok events carry an event_id for Events API dedupe |  | AI | GTM read: event_id on TikTok purchase and AddToCart tags and the variable behind it. Browser: event_id on the live AddToCart hit. Whether t… |
| MB-GTM-16 | GTM | Click-ID and analytics cookies last long enough |  | AI, from our browser facts | Browser (Chromium): after landing with test click IDs, read each cookie's expiry and whether it was set by script or by an HTTP header. GTM… |
| MB-GTM-17 | GTM | WhatsApp clicks tracked as a signal | GTM-11 | AI | Browser: WhatsApp and tel: links found on home, product and cart. GTM read: link-click triggers on wa.me / api.whatsapp.com / tel: and the… |
| MB-GTM-18 | GTM | Accepting the banner late still credits the ad |  | AI, from our browser facts | Browser: open a landing URL with test UTMs and fbclid/ttclid/ScCid; wait; accept the banner; check that the first GA4 page_view and each pi… |
| MB-GTM-19 | GTM | Built-in variables your triggers need are switched on |  | AI | GTM read: list_built_in_variables compared with the variables referenced in trigger filters and tag fields; flag any reference to a disable… |
| MB-GTM-20 | GTM | Pixels pasted as Custom HTML and unknown scripts | GTM-19 | AI | GTM read: tag types per platform; flag Custom HTML tags whose code loads fbevents.js, Snap tr, TikTok analytics or gtag, list what each sen… |
| MB-GTM-21 | GTM | Team and staff visits marked so they don't count as shoppers | GTM-23 | AI | GTM read: a traffic_type parameter on the Google tag, internal-traffic rules, and blocking triggers or exceptions for staff/admin sessions… |
| MB-GTM-22 | GTM | Page changes without a reload still send a page view |  | AI | Browser: check whether moving from home to collection to product reloads the document. If not, GTM read: History Change or custom page-view… |
| MB-GTM-23 | GTM | Live site runs the latest published container version |  | AI | GTM read: get_live_version (version id). Browser: the gtm.js request for the store's container ID on the visited pages and the version it r… |
| MB-GTM-24 | GTM | Snap, TikTok and Google event tags wait for their base tag |  | AI | GTM read: tags sharing a trigger, their firing priority and setup/teardown sequencing; flag Snap, TikTok and Google event tags with no orde… |
| MB-GTM-25 | GTM | Custom JavaScript variables behind value and IDs only return a value |  | AI | GTM read: the code of each Custom JavaScript variable referenced by ecommerce or conversion tags; flag dataLayer.push, cookie writes, DOM c… |
| MB-WC-01 | WEBCODE | Same event sent twice by two setups | W-24, GTM-09 | AI, from our browser facts | Browser: on home, product and cart (phone and desktop), count gtag/js loads per Measurement ID and collect hits per event name per platform… |
| MB-WC-02 | WEBCODE | Our Add to Cart click really fills the cart | W-01 | AI, from our browser facts * | Browser facts from the worker's own store visit (src/fud/collect.ts addToCartAndCapture, reported by src/site-checks.ts as addToCart): it s… |
| MB-WC-03 | WEBCODE | Pixel missing or blocked for a platform you run | W-25 | AI, from our browser facts | Crawl HTML for pixel IDs plus browser network requests to each vendor on home, product and cart; record loaded, fired, blocked or failed pe… |
| MB-WC-04 | WEBCODE | Click IDs and UTMs lost between the ad click and the cart | W-26, W-06 | AI, from our browser facts | Browser (phone): open home and one product URL with test utm_source/medium/campaign and test fbclid, ttclid, ScCid and gclid; record the re… |
| MB-WC-05 | WEBCODE | Tracking missing on pages your ads land on | W-21 | AI, from our browser facts | Crawl and browser: GTM snippet and container ID in the HTML and a gtm.js request on home, one collection, one product, the cart and GA4's t… |
| MB-WC-06 | WEBCODE | Live product and cart events sent without value, currency or items | W-23 | AI, from our browser facts | Browser: read the dataLayer ecommerce objects and the GA4 and pixel hit parameters for view_item and our add_to_cart on the product page; f… |
| MB-WC-07 | WEBCODE | Consent state on live hits blocks or ignores ad tags | W-29 | AI, from our browser facts | Browser: record gcs/gcd on Google hits and which vendor hits fire before any choice, after accept and after refuse (separate visits). If no… |
| MB-WC-08 | WEBCODE | Our successful Add to Cart reaches GA4 and every pixel | W-22 | AI, from our browser facts | Browser facts: atcEvents from the worker's visit (dataLayer entries, GA4 event names and vendor:event pixel hits recorded after the click,… |
| MB-WC-09 | WEBCODE | Value sent as text or in the wrong currency |  | AI, from our browser facts | Browser: compare the dataLayer and pixel value/currency for view_item and add_to_cart with the price and currency shown on the product page… |
| MB-WC-10 | WEBCODE | Product IDs differ between pixels, GA4 and the page | GTM-08 | AI, from our browser facts | Browser: on the product page and after our Add to Cart click, compare content_ids / content_id / item_ids in pixel hits with GA4 item_id an… |
| MB-WC-11 | WEBCODE | Main content shows late after the ad click | W-09 | AI, from our browser facts | Browser: performance trace with mobile throttling on home and product (LCP, plus TTFB and the LCP element). |
| MB-WC-12 | WEBCODE | Script errors stop tracking and the cart | W-02 | AI, from our browser facts | Browser: console errors on home, product and cart, matched to the dataLayer pushes and hits that follow them. |
| MB-WC-13 | WEBCODE | Pixel fires too late in the page load |  | AI, from our browser facts | Browser: on home and product (throttled phone), record the time of each platform's first hit against first paint and load; read the GTM tri… |
| MB-WC-14 | WEBCODE | Non-standard event names |  | AI, from our browser facts | Browser: list event names in the dataLayer and in pixel/GA4 hits on collection, product and cart; flag non-standard names. |
| MB-WC-15 | WEBCODE | Personal data in page URLs | W-30 | AI, from our browser facts | Browser and crawl: scan visited URLs and the dl / page URL parameters of pixel and GA4 hits for email or phone patterns. |
| MB-WC-16 | WEBCODE | Taps lag on the phone after the ad click | W-11 | AI, from our browser facts | Browser: performance trace with mobile throttling on home and product; list main-thread tasks over 200 ms and the scripts behind them. |
| MB-WC-17 | WEBCODE | dataLayer set before the tag loads | W-28 | AI, from our browser facts | Crawl and browser: position of the dataLayer declaration and first pushes against the GTM snippet in the HTML of home and product, and the… |
| MB-WC-18 | WEBCODE | Heavy or blocking files on first load | W-12, W-14, W-17, W-18, W-19 | AI, from our browser facts | Browser (phone): performance trace (render-blocking resources), JS and CSS transfer size, response encoding and cache headers, first-screen… |
| MB-WC-19 | WEBCODE | Failed or hanging requests on landing pages | W-03, W-04 | AI, from our browser facts | Browser: network log status codes and durations on home, product and cart. |
| MB-WC-20 | WEBCODE | Third-party apps slow the page | W-15 | AI, from our browser facts | Browser: transfer size and timing by third-party domain on home and product. |
| MB-WC-21 | WEBCODE | Page jumps while it loads | W-10 | AI, from our browser facts | Browser: CLS and the shifting elements from the phone performance trace on home and product. |
| MB-WC-22 | WEBCODE | Embedded widgets that hide conversions |  | AI, from our browser facts | Browser: list iframes on home, product and cart and their domains; where one is a form or checkout, check for postMessage pushes into the p… |
| MB-WC-23 | WEBCODE | Old cart items attached to new events |  | AI, from our browser facts | Browser: dataLayer sequence on product then cart; check for ecommerce:null before each push and for items carried over. |
| MB-WC-24 | WEBCODE | Item fields use old or platform names |  | AI, from our browser facts | Browser: read item field names in dataLayer ecommerce objects on product and cart. |
| MB-WC-25 | WEBCODE | Product schema price or stock wrong | W-40, W-41 | AI | Crawl: JSON-LD Product/Offer on the product page vs the visible price and stock. |
| MB-CRO-01 | CRO | Shipping cost shown before checkout |  | AI, from our browser facts | Browser (phone): read product page and cart DOM after our add for shipping cost text or a shipping estimator; screenshot. GA4: quote add_to… |
| MB-CRO-02 | CRO | Top paid campaigns: landing page conversion and what the page offers |  | AI | GA4: run_report 28 days, dimensions sessionCampaignName + landingPage for paid channels, metrics sessions, addToCarts, ecommercePurchases;… |
| MB-CRO-03 | CRO | Advertised products that can't be bought | W-08 | AI * | GA4: run_report 28 days, dimension itemName, metrics itemsViewed and itemsAddedToCart; list the top-viewed items with zero adds or the lowe… |
| MB-CRO-04 | CRO | Paid landing pages that show 'page not found' | W-05 | AI | GA4: run_report 28 days, dimensions landingPagePlusQueryString + pageTitle + sessionDefaultChannelGroup (paid channels), metric sessions; f… |
| MB-CRO-05 | CRO | Local payment options visible before checkout |  | AI, from our browser facts | Browser: read product page and cart DOM, image alt text and network for payment icons and BNPL widget scripts (Tabby, Tamara); screenshot.… |
| MB-CRO-06 | CRO | Cart shows the full total before checkout |  | AI, from our browser facts | Browser: after our add, read the cart DOM for subtotal, fee lines, VAT wording and a total line; screenshot. GA4: quote add_to_cart→begin_c… |
| MB-CRO-07 | CRO | Cart price matches the product page price |  | AI, from our browser facts | Browser: read the price, currency and any compare-at price on the product page, then the line price in the cart after our add; flag any dif… |
| MB-CRO-08 | CRO | Phone layout works for mobile paid traffic | W-20 | AI, from our browser facts | Browser (phone): compare document width with the viewport, measure tap-target and font sizes on home, product and cart; screenshot. GA4: qu… |
| MB-CRO-09 | CRO | Clear checkout button in the cart |  | AI, from our browser facts | Browser (phone): after our add, find the checkout button in the cart DOM, record its position against the viewport and any overlay; screens… |
| MB-CRO-10 | CRO | Cart doesn't force sign-in before checkout |  | AI, from our browser facts | Browser: read the cart DOM after our add for login-only buttons, account prompts or a guest option; screenshot. Steps after the cart: not c… |
| MB-CRO-11 | CRO | Landing page speaks the shopper's language | W-45 | AI, from our browser facts | Browser/crawl: read html lang, dir, hreflang and the language switcher on landing and product pages; screenshot the Arabic product page. GA… |
| MB-CRO-12 | CRO | Delivery time shown before checkout |  | AI, from our browser facts | Browser: read product page, collection and cart DOM for delivery-time text; screenshot. GA4: quote add_to_cart→begin_checkout (GA4-03) besi… |
| MB-CRO-13 | CRO | Free-shipping threshold set against order value |  | AI, from our browser facts | Browser: read free-shipping text on the product page and cart, including any 'add X more' message after our add. GA4: quote AOV from the co… |
| MB-CRO-14 | CRO | Ways to add a second item |  | AI | Browser: detect recommendation blocks, bundle or multi-buy offers on the product page and cart (DOM and known app scripts). GA4: compute it… |
| MB-CRO-15 | CRO | WhatsApp or contact visible and working on the product page | W-07 | AI, from our browser facts * | Browser facts: wa.me / api.whatsapp.com / tel: links, phone numbers and chat widgets found on the visited pages, with each number's format… |
| MB-CRO-16 | CRO | Reviews visible where paid shoppers decide |  | AI, from our browser facts | Browser: on the top product (focus.productUrl) and the visited collection, read the DOM and known review-app scripts for rating, review cou… |
| MB-CRO-17 | CRO | Promo codes from your ads have a place to go |  | AI, from our browser facts | Browser: read the cart DOM after our add for a discount code input. Whether a given code works: not checked. When the reader typed the ad c… |
| MB-CRO-18 | CRO | Product page answers the buying questions |  | AI, from our browser facts | Browser: on the top product (focus.productUrl) read description length and language, and look for size, material or spec fields; screenshot… |
| MB-CRO-19 | CRO | Enough product photos on the top product |  | AI, from our browser facts | Browser: count gallery images on the top product (focus.productUrl) and record their sizes; screenshot. GA4: flag high only when that produ… |
| MB-CRO-20 | CRO | Return policy reachable from the product page |  | AI, from our browser facts | Browser: read product page and cart DOM for return text or links; crawl the linked policy page for a live response. |
| MB-CRO-21 | CRO | Add to Cart reachable on the phone first screen |  | AI, from our browser facts | Browser (phone): record the Add to Cart button position against the viewport and whether it stays fixed on scroll; screenshot. GA4: flag hi… |
| MB-CRO-22 | CRO | Prices shown on collection pages |  | AI, from our browser facts | Browser: on the collection we visit, count product cards and cards with a price; screenshot. GA4: note whether paid sessions land on collec… |
| MB-CRO-23 | CRO | Search easy to find and returning results |  | AI, from our browser facts | Browser: find the search input or icon in the header on phone and desktop; read the worker's search test from the store visit (searchTest)… |
| MB-CRO-24 | CRO | Every page loads on a secure connection |  | AI, from our browser facts | Browser and crawl: final URL scheme, certificate errors and mixed-content console messages on home, collection, product and cart. |
| MB-CRO-25 | CRO | Cart quantity and remove controls work |  | AI, from our browser facts | Browser: after our add, raise the quantity by one in the cart, read the total before and after, then remove the item and confirm the cart u… |
| MB-CL-01 | CLARITY | Share of visitors in Facebook/Instagram in-app browsers, and whether mobile breaks |  | AI | From the Clarity snapshot (store's own Clarity, last 3 days): sum sessions for in-app entries in browsers (FacebookApp, InstagramApp, plus… |
| MB-CL-02 | CLARITY | Quick-backs on the top landing page |  | AI | From the Clarity snapshot: take topPages[0] (or the top non-home page if paid traffic lands on product or collection pages), find its byUrl… |
| MB-CL-03 | CLARITY | Bot traffic inflating the session count |  | AI | From the Clarity snapshot: botSessions and sessions give the bot share, reported as a fact. From GA4 OAuth: sessions for the same 3 dates (… |

</details>

## 3. Conversion review rules (48)

The AI judge reads the page and proposes pass, warn or fail. Code then checks it against its own detector ("signal") and can only make it safer: a fail becomes a warn if the detector found the thing, a weak pass becomes "not confirmed". A rule with "Can fail" = no is never shown worse than warn.

| ID | Group | Rule | Page | Code detector | Can fail |
|---|---|---|---|---|---|
| A1 | trust | Shipping cost shown before checkout | cart | yes | yes |
| A2 | trust | Price backed by reasons to pay it | product | yes | no |
| A3 | trust | Cart shows the full cost clearly | cart | yes | yes |
| A4 | trust | Installments or cash on delivery visible | product | yes | yes |
| B1 | trust | Returns or guarantee next to the button | product | yes | yes |
| B4 | trust | Size help next to the size choice | product | yes | yes |
| B5 | trust | Stock and delivery time near the button | product | yes | yes |
| C1 | trust | Social proof on the first screen | product | yes | yes |
| C3 | trust | Reviews look real | product | yes | yes |
| C4 | trust | Trust badges you can check | home | none (AI only) | no |
| C5 | trust | A real business behind the store | home | yes | yes |
| D1 | trust | Reassurance right under the button | product | yes | yes |
| D2 | trust | Trust signals in the cart | cart | yes | yes |
| D3 | trust | Easy to reach a person | product | yes | yes |
| C6 | collection | Product cards show price and proof | collection | yes | no |
| D4 | collection | Easy to narrow down the products | collection | yes | yes |
| D5 | collection | Quick-add buttons say the same thing | collection | yes | no |
| H1 | homepage | Homepage says what you sell in 3 seconds | home | yes | no |
| H2 | homepage | One clear next step on the first screen | home | yes | yes |
| P1 | product | Enough product photos and video | product | yes | no |
| P2 | product | Options are one-tap buttons | product | yes | no |
| P3 | product | Buy button stays on screen while scrolling | product | yes | yes |
| P4 | product | Product details are easy to scan | product | yes | no |
| N1 | navigation | Menu is short and specific | home | yes | no |
| N2 | navigation | Search is easy to find and finds products | home | yes | yes |
| M1 | buy_more | Reasons to buy more than one | product | yes | no |
| M2 | buy_more | Add-ons suggested on the product page and in the cart | cart | yes | no |
| M3 | buy_more | Free-shipping threshold set to lift order value | cart | yes | no |
| R1 | buy_again | A reason to leave an email or WhatsApp number | home | yes | no |
| R2 | buy_again | Reasons to come back and buy again | home | yes | no |
| L1 | local | Arabic version that reads naturally | home | yes | no |
| L2 | local | Local payment and delivery shown before checkout | product | yes | no |
| U1 | popups | No popup in the way on arrival | home | yes | no |
| H3 | homepage | An offer bar at the very top | home | yes | no |
| H4 | homepage | A rating on the first screen | home | yes | no |
| H5 | homepage | Three benefits under the headline | home | yes | no |
| H6 | homepage | The main button says what happens | home | yes | no |
| P5 | product | The product headline sells a benefit | product | yes | no |
| P6 | product | What happens after you order, in steps | product | yes | no |
| P7 | product | Benefits come before features | product | none (AI only) | no |
| P8 | product | Customer photos or videos | product | yes | no |
| P9 | product | A comparison with the alternative | product | yes | no |
| P10 | product | An FAQ answers the last doubts | product | yes | no |
| P11 | product | The page ends with a reason and a buy button | product | none (AI only) | no |
| P12 | product | Says what's included | product | yes | no |
| K1 | buy_more | The cart shows what they saved | cart | yes | no |
| G1 | collection | The collection opens with a promise and a rating | collection | yes | no |
| G2 | collection | Badges help shoppers choose | collection | yes | no |

## 4. Manual CRO checklist (377)

The CRO team's manual checklist, word for word from the workbook. All decided by AI from the phone visit.

| Tab | Points |
|---|---|
| Sitewide & Header | 34 |
| Homepage | 50 |
| Collection Page | 26 |
| Product Page | 59 |
| Cart Drawer & Cart | 28 |
| Checkout | 16 |
| Thank You & Post-Purchase | 6 |
| Mobile | 11 |
| Trust & Social Proof | 10 |
| Pricing, Offers & Urgency | 9 |
| Copy & Messaging | 22 |
| Landing Pages | 106 |

<details><summary>All 377 checkpoints</summary>

| ID | Tab | Checkpoint | Importance |
|---|---|---|---|
| SW-001 | Sitewide & Header | An announcement (notice) bar sits above the header on every page | Medium |
| SW-002 | Sitewide & Header | The bar states a concrete, current reason to buy (free-shipping threshold, active sale, delivery promise, guarantee) | Medium |
| SW-003 | Sitewide & Header | If the bar rotates several messages, each stays long enough to read (≥4 s) and none is outdated | Low |
| SW-004 | Sitewide & Header | The free-shipping threshold shown in the bar is the same amount used in the cart and checkout | High |
| SW-005 | Sitewide & Header | The logo is visible top-left (top-right on Arabic/RTL sites) and links back to the homepage | Low |
| SW-006 | Sitewide & Header | Main navigation has 5 links or fewer at the top level | Medium |
| SW-007 | Sitewide & Header | Menu labels use the words customers use (product types / problems solved), not internal or brand jargon | Medium |
| SW-008 | Sitewide & Header | Dropdown / mega-menu opens reliably, does not close while the mouse moves to it, and every link works | High |
| SW-009 | Sitewide & Header | Search is visible (icon or bar) in the header on desktop and phone | Medium |
| SW-010 | Sitewide & Header | Cart icon is visible at all times, shows the item count, and opens the cart drawer or cart page | High |
| SW-011 | Sitewide & Header | If returns or exchanges need an account, a login / account icon is easy to find in the header | Low |
| SW-012 | Sitewide & Header | The header becomes sticky (stays on screen) when scrolling, or a sticky buy bar replaces it on product pages | Low |
| SW-013 | Sitewide & Header | Language and currency switchers (if the store sells to several countries) are easy to find and work | Medium |
| SW-014 | Sitewide & Header | The footer contains: contact details (phone/WhatsApp/email), shipping, returns, privacy and terms links | Medium |
| SW-015 | Sitewide & Header | Payment method icons and a security/trust message appear in the footer | Low |
| SW-016 | Sitewide & Header | Social media links point to the brand's real, active accounts | Low |
| SW-017 | Sitewide & Header | No leftover template content anywhere (placeholder text, demo addresses, 'Lorem ipsum', theme-demo links, fake testimonials) | Critical |
| SW-018 | Sitewide & Header | Every page loads without visible errors, blank gaps, broken images or overlapping elements | Critical |
| SW-019 | Sitewide & Header | Pop-ups (newsletter, discount, exit-intent) do not appear in the first seconds and are easy to close | High |
| SW-020 | Sitewide & Header | Chat / WhatsApp bubble never covers the add-to-cart, checkout or quantity buttons on mobile | High |
| SW-021 | Sitewide & Header | Cookie / consent banner (where needed) is small, does not cover the main CTA, and both Accept and Decline work | Medium |
| SW-022 | Sitewide & Header | Brand colours, fonts and button styles are consistent across all pages | Low |
| SW-023 | Sitewide & Header | The primary call-to-action colour is used only for buying actions and stands out from everything else | High |
| SW-024 | Sitewide & Header | Text is readable: body text ≥16px on mobile, good contrast with the background, short paragraphs | Medium |
| SW-025 | Sitewide & Header | All buttons and links look clickable and have a clear hover/tap state | Low |
| SW-026 | Sitewide & Header | Custom 404 page exists and helps the visitor continue (search, best sellers, home link) | Low |
| SW-027 | Sitewide & Header | Arabic / RTL layout (if used) mirrors correctly: text right-aligned, arrows and steppers in the right direction, no mixed-direction glitches | Medium |
| SW-028 | Sitewide & Header | Search returns the right product for the product's exact name and for common misspellings / Arabic-English variants | High |
| SW-029 | Sitewide & Header | Search shows live suggestions with product images and prices while typing | Medium |
| SW-030 | Sitewide & Header | A 'no results' search shows helpful alternatives (best sellers, categories, contact) | Low |
| SW-031 | Sitewide & Header | Shipping policy states costs, delivery times per region, and couriers in plain language | High |
| SW-032 | Sitewide & Header | Return / exchange policy is clear, fair and easy to find (linked near add-to-cart and in footer) | High |
| SW-033 | Sitewide & Header | An About page tells the brand story with real people, photos and why the brand exists | Medium |
| SW-034 | Sitewide & Header | Contact page offers at least two fast channels (WhatsApp/phone + email/form) and states response time | Medium |
| HP-001 | Homepage | Main navigation has 5–6 links max, and weak links (e.g. Blog) are replaced with buying links (e.g. 'On sale') | Medium |
| HP-002 | Homepage | 5-second test passed: a stranger can say what the store sells, for whom, and why it is better within 5 seconds | Critical |
| HP-003 | Homepage | A star rating with a number and customer count sits directly ABOVE the hero headline (e.g. '★★★★★ Rated 4.8/5 by 20,000+ customers') | High |
| HP-004 | Homepage | The headline is a value proposition built on a benefit — not just the brand name, a sale or a 'new flavour' announcement | High |
| HP-005 | Homepage | A subheadline explains who it is for and how it works / which problem it solves | Medium |
| HP-006 | Homepage | 3 check-mark benefit/proof bullets sit under the headline | Medium |
| HP-007 | Homepage | ONE primary hero button: solid, high-contrast, large (not an outline/ghost button or small pill) | High |
| HP-008 | Homepage | Hero button label is specific (e.g. 'Shop Bestsellers', 'Find my routine') rather than 'Shop now' / 'Shop all' | Medium |
| HP-009 | Homepage | On mobile, headline + bullets + button are all visible in the first screen; a large image does not push them below the fold | High |
| HP-010 | Homepage | Text placed over a hero image is readable (dark overlay / contrast); no promotional text baked into the image | Medium |
| HP-011 | Homepage | Single-product brands: a clean packshot of the product sits next to the copy (desktop) or between headline and bullets (mobile) | Medium |
| HP-012 | Homepage | Payment logos and/or 'Secure checkout' appear directly under (or above, on mobile) the main CTAs | Low |
| HP-013 | Homepage | A short testimonial (photo, name, 'Verified buyer', stars, 1–2 lines) sits near the hero CTA | Low |
| HP-014 | Homepage | Chat bubbles, discount teasers and pop-ups never cover the hero headline or button on mobile | High |
| HP-015 | Homepage | If the hero is a slider/carousel, the first slide carries the main message and the slider does not auto-rotate too fast | Medium |
| HP-016 | Homepage | An 'As recommended by' / press or partner logo bar appears right after the hero (only real logos) | Medium |
| HP-017 | Homepage | A USP strip (shipping, returns, quality/reviews, support) sits under the header; on mobile it is a one-line rotating ticker | Medium |
| HP-018 | Homepage | The USPs include a guarantee (money-back, happiness guarantee) — only if the store really offers one | Medium |
| HP-019 | Homepage | A 3-step 'Transformation' / how-it-works section (order → delivered → result) with icons appears early on the page | Medium |
| HP-020 | Homepage | Benefit claims are backed by numbers, studies or certifications where possible | Low |
| HP-021 | Homepage | A 'Best sellers' grid sits high on the page (4 across desktop, 2×2 mobile) with image, rating, name and price on each card | High |
| HP-022 | Homepage | Product cards have a quick 'Add to cart' button (and it actually works) | High |
| HP-023 | Homepage | Cards use real badges ('New', 'Best seller', 'Low stock') sparingly | Low |
| HP-024 | Homepage | Category tiles (about 3) with image, label and CTA link to the right collections; placed right under the hero when the catalogue is large | Medium |
| HP-025 | Homepage | Categories are named the way customers think (by need or problem, e.g. 'Shop by health need') where relevant | Low |
| HP-026 | Homepage | Bundles / offers show an itemised value stack (what's included, crossed-out values, 'You save X') | Low |
| HP-027 | Homepage | Customisation / personalisation options are highlighted on the homepage (if the store offers them) | Medium |
| HP-028 | Homepage | Alternating image + text blocks each have an emotive headline, ~3 bullets, a CTA and a rating next to the CTA | Medium |
| HP-029 | Homepage | Every major section ends with a CTA, so the visitor is never more than one scroll from a buy button | Medium |
| HP-030 | Homepage | Single-product brands: a story block, benefit icon grid (~6 icons), comparison table and multi-angle gallery are present | Medium |
| HP-031 | Homepage | A comparison (us vs. others, without naming competitors) highlights our column with checks on every row | Low |
| HP-032 | Homepage | A 'Right for you if…' self-qualification block with a first-person CTA ('Yes, this is me') for problem-solving products | Low |
| HP-033 | Homepage | Best sellers are placed directly BELOW the 3-step transformation section | Medium |
| HP-034 | Homepage | A section highlights the benefits customers can expect (image/icon + text) | Medium |
| HP-035 | Homepage | A dedicated reviews section shows ~3 testimonials with photo, stars, name and quote (swipe carousel on mobile) | High |
| HP-036 | Homepage | An aggregate rating ('4.8/5 from 2,300 reviews') + CTA follows the testimonials | Medium |
| HP-037 | Homepage | Testimonials describe outcomes ('I finally sleep through the night'), not just praise ('Great product') | Medium |
| HP-038 | Homepage | Reviews are clearly real: names, dates, 'Verified buyer' tags, some photos; no copy-pasted or template testimonials | Critical |
| HP-039 | Homepage | A UGC / Instagram image strip (horizontal scroller desktop, grid mobile) shows real customers using the product | Low |
| HP-040 | Homepage | An FAQ accordion (~6 questions) answers ordering, shipping, returns, payment and product questions before the footer | Medium |
| HP-041 | Homepage | A closing section repeats rating + emotive headline + CTA (+ testimonial or payment logos) just before the footer | High |
| HP-042 | Homepage | USP strip is repeated just above the footer | Low |
| HP-043 | Homepage | Footer has link columns (site map, policies, contact), newsletter field + button, social icons, payment logos; columns become accordions on… | Medium |
| HP-044 | Homepage | Mobile header is reduced to hamburger + centred logo + cart (search reachable in one tap) | Low |
| HP-045 | Homepage | Grids reflow correctly: 4 products → 2×2, 3 categories → 1 per row, 3 steps → stacked, 3 reviews → swipe carousel | Medium |
| HP-046 | Homepage | Mobile keeps the same persuasion order as desktop (proof → transformation → products → content → reviews → FAQ → closing CTA) | Medium |
| HP-047 | Homepage | All mobile CTAs are near full width and at least 44px tall | Medium |
| HP-048 | Homepage | Hero: benefit-driven value proposition + star rating, quick product description, 3 benefit bullets, CTA anchored with payment seals, produc… | High |
| HP-049 | Homepage | A detailed product section built from customer survey answers (why they bought, what they love) | Medium |
| HP-050 | Homepage | Benefit icons with text, social proof (comment, image, rating, full name), CTA with proof + trust, comparison vs competitor with product im… | Medium |
| CL-001 | Collection Page | The collection opens with a short banner: emotive headline, collection-level rating (e.g. 4.8/5 from N reviews) and 1–2 lines of description | Medium |
| CL-002 | Collection Page | Products appear in the first screen on mobile (the banner doesn't push the grid below the fold) | High |
| CL-003 | Collection Page | Product count ('32 products') is shown | Low |
| CL-004 | Collection Page | Breadcrumb or clear page title shows where the visitor is | Low |
| CL-005 | Collection Page | Desktop shows as many products as possible above the fold; no large white space above the grid | High |
| CL-006 | Collection Page | Sort control (best selling, price, newest, top rated) sits top-right of the grid and defaults to 'Best selling' or 'Featured' | Medium |
| CL-007 | Collection Page | Desktop: left-sidebar filter accordions; Mobile: horizontally scrollable filter chips or a filter drawer | Medium |
| CL-008 | Collection Page | Filters match how customers choose (skin type, size, scent, concern, price) and never return empty results | Medium |
| CL-009 | Collection Page | Sub-category quick chips (e.g. 'Slides / Sandals / Slingbacks') at the top of large collections | Low |
| CL-010 | Collection Page | On mobile, filters are compact (one chip row or a 'Filter' button) and do not push products below the fold; about 2 products visible per sc… | High |
| CL-011 | Collection Page | Every card shows: image, star rating + score, product name, price ('From X' for variants) | High |
| CL-012 | Collection Page | Card titles are clear and benefit-led where possible (not internal SKU codes) | Medium |
| CL-013 | Collection Page | Images have the same ratio and style across the grid; product is clearly visible | Low |
| CL-014 | Collection Page | A second image on hover (desktop) or swipe/indicator (mobile) shows another angle or the product in use | High |
| CL-015 | Collection Page | Every card has a direct 'Add to cart' (and optional 'View product'); variant products open a quick variant picker | High |
| CL-016 | Collection Page | Quick-add / quick view actually works and shows the full product details (price, variants, description, reviews) | Critical |
| CL-017 | Collection Page | Honest badges ('Selling fast', 'New', '-20%') used on a few cards, not all | Low |
| CL-018 | Collection Page | Sale cards show the original price crossed out next to the sale price | Medium |
| CL-019 | Collection Page | Out-of-stock products are labelled clearly and pushed to the end (or hidden) | Medium |
| CL-020 | Collection Page | Colour/variant swatches on cards where colour is a key choice | Low |
| CL-021 | Collection Page | Desktop grid 3–4 columns; mobile grid 2 columns with readable text and tappable buttons | Medium |
| CL-022 | Collection Page | Load more / pagination works, keeps filters, and the back button returns to the same scroll position | High |
| CL-023 | Collection Page | Promo / editorial blocks after the grid support the collection (bundle, guide, story) — not random banners | Low |
| CL-024 | Collection Page | A cross-sell row ('Explore by series' / related collections) sits before the footer | Low |
| CL-025 | Collection Page | A short, helpful text block (below the grid) explains the collection and links to guides | Low |
| CL-026 | Collection Page | Announcement bar, header, USP strip and footer are identical to the homepage and PDP | Low |
| PDP-001 | Product Page | Navigation on the PDP has max 5 top-level links (see Sitewide tab for detail) | Medium |
| PDP-002 | Product Page | A dynamic notice bar shows a current sale / free shipping / promotion message on the PDP | Medium |
| PDP-003 | Product Page | Only ONE offer message is visible (no promo bar + floating '20% off' tab + pop-up competing) | High |
| PDP-004 | Product Page | A trust/policy bar (shipping, returns, reviews, support) sits under the header; one-line ticker on mobile | Medium |
| PDP-005 | Product Page | Payment plans / BNPL (valU, Tabby, Tamara, AfterPay…) are shown close to the CTA if offered | High |
| PDP-006 | Product Page | Clear, high-quality images from multiple angles and in different settings (packshot, in use, scale, details, texture) | Medium |
| PDP-007 | Product Page | Gallery includes infographic images (benefits, how to use, ingredients) and UGC photos, not only packshots | Medium |
| PDP-008 | Product Page | Thumbnails (desktop) or dots/peek + arrows (mobile) show there are more images | Low |
| PDP-009 | Product Page | Images zoom on click/pinch and are sharp; first image loads fast | Medium |
| PDP-010 | Product Page | On mobile the gallery is not so tall that the price and CTA disappear below the first screen | High |
| PDP-011 | Product Page | A product video (demo / UGC) is available in the gallery or near the top | Low |
| PDP-012 | Product Page | Selecting a variant switches the gallery to that variant's image | Medium |
| PDP-013 | Product Page | Social proof like '★★★★★ 4.8 out of 5 from 10,000 happy customers' sits ABOVE the title and close to the CTA | High |
| PDP-014 | Product Page | The rating line is written as a claim ('Rated 4.7/5 by 20,000+ customers'), not just '2981 reviews' | Medium |
| PDP-015 | Product Page | The value proposition is prominent: benefit-led title or a one-line promise right under the product name | High |
| PDP-016 | Product Page | A short one-sentence description follows the title with key claims in bold | Low |
| PDP-017 | Product Page | Price is clearly visible next to the title ('From X' when variants differ), in the local currency | Critical |
| PDP-018 | Product Page | A REAL scarcity or time element sits near the price (low-stock count, sale end countdown, delivery cut-off) | High |
| PDP-019 | Product Page | Sale price shows the original price crossed out and the saving ('Save 25%' / 'Save 100 EGP') | Medium |
| PDP-020 | Product Page | The description is converted into THREE benefit-driven bullet points with check icons, outcome words in bold | High |
| PDP-021 | Product Page | Variant options (colour, size, scent) are visible button tiles or swatches — not hidden in a dropdown | Medium |
| PDP-022 | Product Page | The selected variant is clearly highlighted; unavailable variants are crossed out (not hidden) | Medium |
| PDP-023 | Product Page | Size/fit guide or 'which one is right for me' helper is next to the variant selector (where relevant) | Medium |
| PDP-024 | Product Page | Bundle / quantity tiers (1 / 2 / 3) with escalating savings; middle tier tagged 'Most popular', top tier 'Best value' | Medium |
| PDP-025 | Product Page | Subscribe-and-save vs one-time purchase shown as radio cards with saving badge and 'Cancel anytime' (for consumables) | Low |
| PDP-026 | Product Page | Quantity selector sits next to a full-width, high-contrast Add-to-cart button with a clear label | Critical |
| PDP-027 | Product Page | Add-to-cart gives instant feedback (drawer opens / message / count updates) and never fails silently | Critical |
| PDP-028 | Product Page | Payment seals (Visa, Mastercard, Apple Pay, COD, BNPL) + 'Secure checkout' are anchored directly under the CTA | High |
| PDP-029 | Product Page | Delivery details: specific timing ('Order in 3h → delivered Thursday'), estimated duration, and free-shipping threshold BELOW the delivery… | High |
| PDP-030 | Product Page | A reassurance box below the CTA: delivery, returns/guarantee, support (3 icon rows) | Medium |
| PDP-031 | Product Page | A money-back / satisfaction guarantee is visible near the buy box (if the store offers one) | Medium |
| PDP-032 | Product Page | A mini testimonial (photo, first + last name, stars, short quote) sits in or under the buy box | Medium |
| PDP-033 | Product Page | Description / details / ingredients / shipping in tabs (desktop) or accordions (mobile), first one open | Medium |
| PDP-034 | Product Page | Floating widgets (chat, WhatsApp, discount tab, cookie banner) never cover the variant picker, price or CTA | High |
| PDP-035 | Product Page | Sticky add-to-cart bar appears on mobile once the main button scrolls out of view | Medium |
| PDP-036 | Product Page | Mobile buy-box order: rating → title → price + stock → bullets → variants → secure line → qty + CTA → payment icons | Medium |
| PDP-037 | Product Page | Authentic brands / press / retailers the brand has worked with are shown ('As recommended by') | Medium |
| PDP-038 | Product Page | A transformation section with 3 clear steps: how to order → delivery speed → the benefit received | High |
| PDP-039 | Product Page | A benefits section with supporting images (alternating image/text rows) — short copy, outcomes only | High |
| PDP-040 | Product Page | A features / ingredients section with images; every feature statement ends with the benefit it delivers | Medium |
| PDP-041 | Product Page | A 'How to use' visual (steps or short video) is on the page | Medium |
| PDP-042 | Product Page | A CTA directly below the features with star rating and payment seals | Medium |
| PDP-043 | Product Page | 'What's included' section shows every item in a bundle/package (with image and short list) | Medium |
| PDP-044 | Product Page | Social proof section with star ratings, comments, customer images and user names | High |
| PDP-045 | Product Page | Reviews widget shows total count, rating breakdown, filters/sort, 'Write a review', dates; includes some 3–4★ reviews | Medium |
| PDP-046 | Product Page | Products with zero/few reviews borrow proof (brand-level reviews, best-seller badge, guarantee) instead of showing an empty widget | Medium |
| PDP-047 | Product Page | User-generated content (customer videos / photos) is shown, e.g. a carousel of portrait video tiles | Medium |
| PDP-048 | Product Page | Another CTA with trust and payment seals after the social proof — use ONE consistent CTA label and colour everywhere | Medium |
| PDP-049 | Product Page | A comparison section shows our advantages over competitors WITHOUT naming them ('Other brands') | Medium |
| PDP-050 | Product Page | Our column is larger, highlighted (dimmed background around it), with bigger icons and a check on every row | Medium |
| PDP-051 | Product Page | FAQ with at least 5–6 real questions covering: benefits, proof, how to use, shipping cost/time, returns, how often/how long | High |
| PDP-052 | Product Page | An objection block names who the product is for (conditions/problems) and confirms fit | Low |
| PDP-053 | Product Page | More UGC after the FAQ: additional reviews, images or videos (e.g. an Instagram-style strip) | Medium |
| PDP-054 | Product Page | Another CTA with star reviews and payment seals near the end — the page never ends without a CTA | High |
| PDP-055 | Product Page | Upsell / downsell / cross-sell below the final CTA: related products with reviews and short descriptions | Medium |
| PDP-056 | Product Page | 'Frequently bought together' / bundle suggestion near the buy box for complementary products | Low |
| PDP-057 | Product Page | Section order follows ATIDFA: Attention (buy box) → Transformation → Interest (benefits, features) → Desire (reviews, UGC, comparison) → FA… | High |
| PDP-058 | Product Page | On mobile all sections stack cleanly; carousels show 1 item with arrows/dots; nothing is hidden compared with desktop | Medium |
| PDP-059 | Product Page | Repeated USP strip above the footer and complete footer as on other pages | Low |
| CT-001 | Cart Drawer & Cart | Adding a product opens a cart drawer (slide-in) or clear confirmation, not a silent page refresh | High |
| CT-002 | Cart Drawer & Cart | Drawer header shows 'Your cart (N items)' and an obvious close (×); on mobile it covers the full width | Low |
| CT-003 | Cart Drawer & Cart | Sitewide offer / countdown repeats inside the drawer and matches the announcement bar | Medium |
| CT-004 | Cart Drawer & Cart | The page behind the cart drawer is dimmed (lower opacity overlay) so the drawer is the focus; clicking the overlay closes it | Low |
| CT-005 | Cart Drawer & Cart | Empty drawer says it is empty and links to best sellers, top collections and suggested single products | Medium |
| CT-006 | Cart Drawer & Cart | The drawer is short: no excessive elements that force scrolling to reach the checkout button | Medium |
| CT-007 | Cart Drawer & Cart | A progress bar shows how far the customer is from free shipping / a free gift, with the exact remaining amount | High |
| CT-008 | Cart Drawer & Cart | The free-shipping threshold in the cart equals the one in the announcement bar and checkout | High |
| CT-009 | Cart Drawer & Cart | Progress bar uses milestone icons (truck, gift) and encouraging copy ('Almost there!') | Low |
| CT-010 | Cart Drawer & Cart | Each item shows image, name, variant (size/colour/scent), purchase type and price (with compare-at if on sale) | Medium |
| CT-011 | Cart Drawer & Cart | Quantity stepper (−/+) and a separate trash/remove icon work instantly and update totals | High |
| CT-012 | Cart Drawer & Cart | Stepper +/− are in the correct order in Arabic/RTL layouts | Medium |
| CT-013 | Cart Drawer & Cart | Subscribe & save toggle in the cart for consumables | Low |
| CT-014 | Cart Drawer & Cart | An upsell section with a benefit-led heading ('Complete your routine') shows ~2 relevant products, not a long list | Medium |
| CT-015 | Cart Drawer & Cart | Upsell cards show image, name, price (with saving), rating and a one-tap 'Add' button; variants selectable on the card | Medium |
| CT-016 | Cart Drawer & Cart | Upsell buttons are visually secondary to the checkout button | Medium |
| CT-017 | Cart Drawer & Cart | Summary panel shows 'You saved X', subtotal and 'Shipping & taxes calculated at checkout' (or the actual shipping cost) | Medium |
| CT-018 | Cart Drawer & Cart | Shipping cost (or how it is calculated) is visible BEFORE checkout — not first revealed on the payment step | Critical |
| CT-019 | Cart Drawer & Cart | Discount code field is either removed from the drawer (handled at checkout) or collapsed behind a small link | Medium |
| CT-020 | Cart Drawer & Cart | If a discount code is applied, it works and the saving is visible before checkout | High |
| CT-021 | Cart Drawer & Cart | Checkout button is full width, high contrast, short secure label ('Checkout securely') and never covered by chat widgets | Critical |
| CT-022 | Cart Drawer & Cart | Payment / express icons (Visa, Mastercard, Apple Pay, COD, BNPL) sit directly under the checkout button | Medium |
| CT-023 | Cart Drawer & Cart | Express checkout buttons (Shop Pay / Apple Pay / PayPal) available in the drawer where the platform supports it | Low |
| CT-024 | Cart Drawer & Cart | The /cart page mirrors the drawer: line items, progress bar, summary, shipping info, checkout + payment icons | Medium |
| CT-025 | Cart Drawer & Cart | Empty cart state shows best sellers / categories and a 'Continue shopping' button | Low |
| CT-026 | Cart Drawer & Cart | Trust reminders near checkout: returns promise, guarantee, delivery time | Low |
| CT-027 | Cart Drawer & Cart | Cart contents persist after closing the browser and returning (same device) | Medium |
| CT-028 | Cart Drawer & Cart | Gift message / order note field (if relevant to the category) is available but not in the way | Low |
| CO-001 | Checkout | Checkout opens in one click from the cart drawer and cart page, with no forced account creation | Critical |
| CO-002 | Checkout | Express payment buttons (Apple Pay / Google Pay / Shop Pay / PayPal, as available) appear at the top of checkout | Medium |
| CO-003 | Checkout | Field labels are clear, in the customer's language, and say exactly what to type (e.g. 'Building number', 'Nearest landmark') | High |
| CO-004 | Checkout | Error messages say what is wrong and how to fix it, next to the field, in plain language | High |
| CO-005 | Checkout | Button text describes the next step ('Continue to shipping', 'Pay now', 'Place order') rather than 'Submit' | Medium |
| CO-006 | Checkout | Shipping, payment and delivery wording is clear: cost, time and courier are stated before payment | Critical |
| CO-007 | Checkout | Trust and reassurance messages appear near the pay button (secure payment, returns, support contact) | Medium |
| CO-008 | Checkout | Cash-on-delivery (if offered) is clearly explained: any fee, and what happens at the door | High |
| CO-009 | Checkout | Guest and logged-in checkout both work end to end; the number of steps and fields is minimal | High |
| CO-010 | Checkout | Form usability on mobile: correct keyboards (numeric for phone, email keyboard for email), autofill works, tap targets ≥44px | High |
| CO-011 | Checkout | Shipping options and payment methods offered match what the market expects (COD, wallets, cards, BNPL) | High |
| CO-012 | Checkout | Order summary (products, images, quantities, discounts, shipping, total) is visible and easy to expand on mobile | Medium |
| CO-013 | Checkout | No distractions: no main navigation, pop-ups or links that pull the shopper out of checkout | Medium |
| CO-014 | Checkout | Discount-code field works, shows a clear success/error message, and is not so prominent that it sends people to search for codes | Medium |
| CO-015 | Checkout | Thank-you page loads after payment with the order number and next steps (see Post-purchase tab) | Medium |
| CO-016 | Checkout | Each checkout finding is marked as a 'Copy change' (always possible) or a 'Layout change' (depends on platform, e.g. Shopify Plus) | Medium |
| TY-001 | Thank You & Post-Purchase | Thank-you page shows the order number, items, total, delivery address and expected delivery date | Medium |
| TY-002 | Thank You & Post-Purchase | Thank-you page tells the customer what happens next (confirmation SMS/email/WhatsApp, courier call, tracking) | Medium |
| TY-003 | Thank You & Post-Purchase | Thank-you page offers a relevant next action (follow on social, refer a friend, one-click add-on, survey) | Low |
| TY-004 | Thank You & Post-Purchase | Order confirmation message arrives within minutes and matches the order | Medium |
| TY-005 | Thank You & Post-Purchase | A review request is sent after delivery (not before) with a direct link to leave a review | Medium |
| TY-006 | Thank You & Post-Purchase | A post-purchase survey asks 'What almost stopped you from buying?' and 'Where did you hear about us?' | Low |
| MB-001 | Mobile | On a 390×844 phone, the first screen shows what the product/brand is, why it is worth it, and a visible CTA | Critical |
| MB-002 | Mobile | On the product page, price and add-to-cart are reachable within one scroll (or a sticky buy bar appears) | High |
| MB-003 | Mobile | A sticky add-to-cart bar appears on product pages after scrolling past the main button | High |
| MB-004 | Mobile | Hamburger menu opens quickly, shows main categories first, and closes easily | Medium |
| MB-005 | Mobile | All buttons, links, swatches and quantity controls are at least 44×44px and spaced apart | High |
| MB-006 | Mobile | Key actions (add to cart, checkout) sit in the lower, easy-to-reach part of the screen | Medium |
| MB-007 | Mobile | Long sections are collapsed into accordions or tabs, and images are not cropped badly | Medium |
| MB-008 | Mobile | Every form field uses the right keyboard and zoom does not jump when tapping a field (font ≥16px) | Medium |
| MB-009 | Mobile | Pages feel fast on 4G: content appears in under ~2.5 s and nothing jumps while loading | High |
| MB-010 | Mobile | Key flows work inside the Instagram, TikTok and Facebook in-app browsers (product page → cart → checkout) | High |
| MB-011 | Mobile | The site works in landscape and on small phones (360px) without horizontal scrolling | Low |
| TR-001 | Trust & Social Proof | Star rating + review count are shown consistently: homepage product tiles, collection cards, product page (near title) and cart | High |
| TR-002 | Trust & Social Proof | Reviews are believable: real names, dates, photos, a mix of 4 and 5 stars, and the brand replies to negative ones | High |
| TR-003 | Trust & Social Proof | The highest-priced products have the strongest proof (not the weakest) | Medium |
| TR-004 | Trust & Social Proof | Customer photos/videos (UGC) appear on the homepage and product pages | Medium |
| TR-005 | Trust & Social Proof | A risk-reversal (money-back / exchange / satisfaction guarantee) is stated near the add-to-cart button | High |
| TR-006 | Trust & Social Proof | Payment and security seals sit right next to the add-to-cart and checkout buttons (not only in the footer) | High |
| TR-007 | Trust & Social Proof | Press mentions, certifications, awards, retailer or partner logos are shown (only real ones) | Medium |
| TR-008 | Trust & Social Proof | Third-party verification badges (if the brand has them) are placed near price/CTA, not buried below reviews | High |
| TR-009 | Trust & Social Proof | A headline social-proof number is shown ('4.8/5 from 10,000 customers', '50,000 orders delivered') and is true | Medium |
| TR-010 | Trust & Social Proof | A real phone number / WhatsApp and physical address (if any) are easy to find | Medium |
| PO-001 | Pricing, Offers & Urgency | Prices are shown clearly with currency, and any compare-at (old) price and saving are visible | High |
| PO-002 | Pricing, Offers & Urgency | Value is framed (cost per use / per ml, 'X days supply', compared with alternatives) | High |
| PO-003 | Pricing, Offers & Urgency | Bundle and multi-buy savings are quantified ('Save 120 EGP'), not just implied ('2×1') | Medium |
| PO-004 | Pricing, Offers & Urgency | Payment plans / BNPL (e.g. valU, Tabby, Tamara, Klarna) are shown near the price or CTA where available | Medium |
| PO-005 | Pricing, Offers & Urgency | Any scarcity or urgency (low stock, countdown, limited batch) is REAL and verifiable | High |
| PO-006 | Pricing, Offers & Urgency | Where real stock or sale-end data exists, it is shown near the price ('Only 6 left', 'Sale ends Friday') | Medium |
| PO-007 | Pricing, Offers & Urgency | The current offer is consistent across ads, announcement bar, product page, cart and checkout | High |
| PO-008 | Pricing, Offers & Urgency | A free-shipping progress bar ('Add 120 EGP more for free shipping') appears in the cart drawer, and ideally on the product page | Medium |
| PO-009 | Pricing, Offers & Urgency | Relevant cross-sells ('Complete your routine', 'Frequently bought together') appear on the product page and in the cart | Medium |
| CP-001 | Copy & Messaging | Attention: the first screen has a value proposition, trust cues, social proof, product imagery and ONE clear CTA | Critical |
| CP-002 | Copy & Messaging | Transformation: the page shows how easy buying is and the end result (order → delivery → outcome) | High |
| CP-003 | Copy & Messaging | Interest: benefits come BEFORE features; features explain HOW the benefit is delivered | High |
| CP-004 | Copy & Messaging | Desire: reviews, testimonials, case studies and UGC show the outcome the buyer wants | Medium |
| CP-005 | Copy & Messaging | FAQ: answers ordering, returns, delivery and product-specific questions before the final CTA | Medium |
| CP-006 | Copy & Messaging | Action: CTA repeated at the bottom with product, rating, price and payment/trust icons | High |
| CP-007 | Copy & Messaging | Long pages also include Compare (us vs. them) and Objections stages (ATIDCOA, from the layouts deck) | Low |
| CP-008 | Copy & Messaging | Every key page has ONE clear value proposition that names the outcome, not just the product | Critical |
| CP-009 | Copy & Messaging | The value proposition says why THIS brand is different (unique mechanism, origin, quality proof, guarantee) | High |
| CP-010 | Copy & Messaging | Section headlines are benefit statements ('Sleep deeper from night one'), not labels ('Benefits', 'Features') | Medium |
| CP-011 | Copy & Messaging | Copy uses the customer's own words (from reviews, surveys, support chats) for problems and outcomes | Medium |
| CP-012 | Copy & Messaging | Copy is skimmable: short paragraphs (≤3 lines on mobile), bullet points, bold key phrases | Medium |
| CP-013 | Copy & Messaging | Every feature statement ends with the benefit it delivers ('… so you wake up without grogginess') | Medium |
| CP-014 | Copy & Messaging | Claims are specific and provable (numbers, timeframes, certifications) and legally safe (no medical cure claims) | High |
| CP-015 | Copy & Messaging | Spelling, grammar, and translation are correct in every language; no placeholder or template text | High |
| CP-016 | Copy & Messaging | Tone matches the audience and brand consistently across pages | Low |
| CP-017 | Copy & Messaging | CTA labels state the action/outcome ('Get my kit', 'Add to cart – ships today'), and the same label is used for the same action everywhere | High |
| CP-018 | Copy & Messaging | Microcopy under/near CTAs removes the last doubt (delivery time, free returns, secure payment, cancel anytime) | Medium |
| CP-019 | Copy & Messaging | Error and empty-state messages are helpful (what went wrong + how to fix) | Medium |
| CP-020 | Copy & Messaging | The offer is stated in one sentence (what you get, the saving, until when) | Medium |
| CP-021 | Copy & Messaging | Social proof copy is quantified ('4.8/5 from 10,000 happy customers') and consistent across pages | High |
| CP-022 | Copy & Messaging | Testimonials show first + last name (or first name + initial), photo, and a specific outcome | Medium |
| LP-001 | Landing Pages | The page is more aggressive and sales-oriented than a normal PDP (one product, one offer, no navigation leaks) | High |
| LP-002 | Landing Pages | Above the fold: trust bar with seals, social proof rating, value proposition, 3 benefit bullets, simple CTA with payment seals, 3 delivery… | Critical |
| LP-003 | Landing Pages | Buy box includes 'Starting from' price + real stock indicator, visible variant buttons, quantity next to CTA | Medium |
| LP-004 | Landing Pages | 'As featured on' / 'As recommended by' trust indicators under the hero | Medium |
| LP-005 | Landing Pages | Transformation: Step 1 checkout → Step 2 delivery → Step 3 beneficial outcome | Medium |
| LP-006 | Landing Pages | Benefit images with text, then feature images with text (zig-zag) | Medium |
| LP-007 | Landing Pages | 'What's included' describes every item, especially for bundles | Medium |
| LP-008 | Landing Pages | Social proof: testimonials and reviews + UGC-style videos | High |
| LP-009 | Landing Pages | CTA with payment and trust seals after the social proof (and after features) | Medium |
| LP-010 | Landing Pages | Comparison vs competitor with OUR slot larger and more prominent | Medium |
| LP-011 | Landing Pages | FAQ section, then UGC images, then one clear CTA at the end | High |
| LP-012 | Landing Pages | Top: headline + sub-headline, author photo with first and last name (top left) and a publish date | High |
| LP-013 | Landing Pages | Credibility bar ('As recommended by' / 'Featured in') right under the hero (wraps to 2 rows on mobile) | Medium |
| LP-014 | Landing Pages | Each list item has an image or GIF, a numbered headline, a short paragraph and a list of benefits | High |
| LP-015 | Landing Pages | Social proof (testimonials) is placed intermittently between items (e.g. after items 3 and 6) | Medium |
| LP-016 | Landing Pages | A boxed offer after the list gives exclusivity for this page's visitors + real urgency, described in one sentence | High |
| LP-017 | Landing Pages | Offer box includes star rating, product name, its 3 benefits and a CTA (full width on mobile); a testimonial follows | Medium |
| LP-018 | Landing Pages | No CTAs cluttering the list items; header has logo + one CTA (kept on mobile) | Low |
| LP-019 | Landing Pages | The page pre-sells the product by comparing it to other products, with a benefit-driven headline | High |
| LP-020 | Landing Pages | Intro explains the page and who made the list; author photo, first and last name and date | Medium |
| LP-021 | Landing Pages | 2–3 list items are visible above the fold | High |
| LP-022 | Landing Pages | Each item: visible rank number, company logo, benefit-driven USP headline, overall rating/social proof, reviews, price and a CTA | High |
| LP-023 | Landing Pages | Top 3 have a stroke/border and labels ('Highest rated', 'Sells fast'); #1 is the most emphasised | Medium |
| LP-024 | Landing Pages | After the list: buying guide / methodology content, FAQ, and a closing CTA | Low |
| LP-025 | Landing Pages | Looks like an article: logo/name top left, links top right (hamburger on mobile), large header image, article title, author name + date + i… | High |
| LP-026 | Landing Pages | The main CTA sits at the very bottom so the page feels informative; any inline 'Sign up now' boxes are soft, with rating + lock line | Medium |
| LP-027 | Landing Pages | Images inside the article break up text every 1–2 sections; all images and CTAs link to the offer page | High |
| LP-028 | Landing Pages | Social proof with first and last names appears in the body (at least twice) | Medium |
| LP-029 | Landing Pages | Real scarcity is used (limited offer/stock/deadline) | Low |
| LP-030 | Landing Pages | Contextual links inside paragraphs point to the offer | Medium |
| LP-031 | Landing Pages | Desktop sidebar contains reviews and a fixed (sticky) CTA; removed on mobile with CTA boxes stacked | Medium |
| LP-032 | Landing Pages | No scrolling required — the whole opt-in fits in one screen on desktop and mobile | High |
| LP-033 | Landing Pages | Social proof line ('4.8/5 based on 1,000 happy customers') + benefit-driven value prop naming the outcome of opting in | High |
| LP-034 | Landing Pages | 3 benefit-driven bullets, scannable with highlighted words | Medium |
| LP-035 | Landing Pages | One clear CTA explaining what happens after clicking ('Send me the free guide') | High |
| LP-036 | Landing Pages | Testimonial with image and first + last name | Medium |
| LP-037 | Landing Pages | CTA opens a modal that blurs the background with an email field and a submit CTA; the email actually arrives | Critical |
| LP-038 | Landing Pages | Above the fold: benefit-driven headline naming the outcome, with the video directly below it | High |
| LP-039 | Landing Pages | Video autoplays muted with captions and a clear 'tap to unmute' prompt; loads fast on mobile | High |
| LP-040 | Landing Pages | CTA anchored with trust seals and ratings, naming the next step ('Book my free call') | Medium |
| LP-041 | Landing Pages | Sections: Recommended by → Transformation (book call → receive call → outcome) → Benefits → CTA → Features → CTA → About us → Social proof/… | High |
| LP-042 | Landing Pages | Booking/next step works end-to-end (calendar loads, confirmation email arrives) | Critical |
| LP-043 | Landing Pages | The page has ONE goal and every button leads to it (no competing offers, minimal or no navigation) | High |
| LP-044 | Landing Pages | A star-rating strip ('★★★★★ 4.8/5 from X reviews') sits above the headline AND directly above every repeated CTA | Medium |
| LP-045 | Landing Pages | The CTA is repeated after every major section (at least 4 times on a long page) | Medium |
| LP-046 | Landing Pages | A security/privacy line (lock icon + short reassurance) sits directly under every form button and CTA | Medium |
| LP-047 | Landing Pages | A guarantee / risk-reversal block exists (none of the wireframes include one, so check the live page specifically) | High |
| LP-048 | Landing Pages | CTA buttons carry a specific, benefit-led label (not 'Submit' / 'Click here') | High |
| LP-049 | Landing Pages | On mobile, USP bars and testimonials become swipe carousels with visible arrows, logo rows wrap, and images sit above their text | Low |
| LP-050 | Landing Pages | A value-proposition headline sits above the quiz and the first question is visible without scrolling (desktop and mobile) | High |
| LP-051 | Landing Pages | A progress indicator shows the total number of steps and the current step, and it moves forward after each answer | High |
| LP-052 | Landing Pages | A time expectation is shown ('This should take less than 3 minutes') | Medium |
| LP-053 | Landing Pages | One question per screen, phrased as a question, with about 4 answer choices | Medium |
| LP-054 | Landing Pages | Answers are large tappable tiles (full width on mobile) with an icon each, and the selected tile is clearly highlighted | Medium |
| LP-055 | Landing Pages | A full-width, high-contrast continue button sits directly under the options | Medium |
| LP-056 | Landing Pages | A testimonial (face, stars, name) sits under the CTA | Low |
| LP-057 | Landing Pages | Header is logo-only and the footer is minimal (no links pulling people away) | Medium |
| LP-058 | Landing Pages | Email / contact capture comes AFTER the questions (before showing the result), never before question 1 | High |
| LP-059 | Landing Pages | The result page gives a specific recommendation with a direct add-to-cart / next step | High |
| LP-060 | Landing Pages | NOTE: the sheet's Quiz tab is currently a copy of the Home Page tab — use the quiz rows above (from the 09-Quiz wireframe) until the sheet… | Low |
| LP-061 | Landing Pages | The form is above the fold on desktop (right column) and directly after the hero copy on mobile | High |
| LP-062 | Landing Pages | The form has its own headline and asks for 3 fields or fewer | High |
| LP-063 | Landing Pages | A step indicator (1-2-3) is shown even on a short form | Low |
| LP-064 | Landing Pages | Hero = rating strip + benefit-led H1 + short paragraph + 3 check-mark benefits + a testimonial near the form | Medium |
| LP-065 | Landing Pages | A USP bar with 4 icon promises sits under the header (and is repeated above the footer) | Low |
| LP-066 | Landing Pages | An 'As recommended by' / press-logo bar sits right below the hero (real logos only) | Medium |
| LP-067 | Landing Pages | The page includes: Transformation (3 steps) → What's included → Social proof (3 testimonials) → FAQ (~6 questions) → closing CTA band | Medium |
| LP-068 | Landing Pages | The submit button shows a success message / thank-you page and the lead actually arrives (CRM / email) | Critical |
| LP-069 | Landing Pages | Company logo top left; trust policy bar; social proof + trust + security with a CTA that scrolls to the form | Medium |
| LP-070 | Landing Pages | Form stands out (outlined border/card), has a headline saying exactly what happens, a progress bar, placeholders in fields and a full-width… | High |
| LP-071 | Landing Pages | Transformation explains: Step 1 how you fill the form → Step 2 what happens after → Step 3 the outcome | Medium |
| LP-072 | Landing Pages | Benefits of the service with an image, social proof from people who went through the process, FAQ, and a final CTA that pulls the user back… | Medium |
| LP-073 | Landing Pages | The first step is an easy, low-commitment question (e.g. a Yes/No toggle), not name/email/phone | High |
| LP-074 | Landing Pages | On mobile the form card comes immediately after the headline, before the body copy | High |
| LP-075 | Landing Pages | The step indicator shows the correct total and current step (the desktop wireframe mislabels it '1 2 2 2 2' — make sure the live page doesn… | Medium |
| LP-076 | Landing Pages | Contact details are only asked in the later steps | High |
| LP-077 | Landing Pages | The page stays short and focused: hero + form + logos + 4 benefits + footer, nothing competing with the form | Medium |
| LP-078 | Landing Pages | Back navigation between steps keeps previous answers | Medium |
| LP-079 | Landing Pages | Used to gamify long lead forms: logo top left, trust bar, form on the right, social proof, 3 bullets, testimonial, form headline explaining… | Medium |
| LP-080 | Landing Pages | Starts with the most interesting question; answer buttons are large and full width; progress bar on the form | High |
| LP-081 | Landing Pages | Logo-only header (no navigation) | Medium |
| LP-082 | Landing Pages | Registration form above the fold on desktop, right after the benefit bullets on mobile | High |
| LP-083 | Landing Pages | Form asks only First name, Last name, Email (+ optional 'Your question') with visible labels above each field | Medium |
| LP-084 | Landing Pages | Event essentials are shown: date, time WITH timezone, duration, and what attendees will learn (agenda) | Critical |
| LP-085 | Landing Pages | Host/speaker block with real photo, name and credentials (fix template typos such as 'Abouts Us') | Medium |
| LP-086 | Landing Pages | Countdown, seats remaining or replay info are shown (only if true) | Low |
| LP-087 | Landing Pages | After registering: confirmation page with add-to-calendar buttons and a confirmation email | High |
| LP-088 | Landing Pages | Benefits & Features in alternating image/text rows, social proof (3 testimonials), FAQ (~6) — each followed by a register CTA | Medium |
| LP-089 | Landing Pages | Logo top middle; social proof; headline with value proposition; paragraph on what the webinar is and how it helps; 3 benefit bullets; testi… | Medium |
| LP-090 | Landing Pages | The form shows a progress bar and states how long it takes ('Takes 30 seconds') | Medium |
| LP-091 | Landing Pages | About Us section includes a photo of the person giving the webinar; social proof from people who got results; FAQ + final CTA | Medium |
| LP-092 | Landing Pages | Hero = rating strip + benefit H1 + 3 bullets + CTA + App Store / Google Play badges + product shown in a device mockup + testimonial | Medium |
| LP-093 | Landing Pages | Benefits are presented BEFORE features, in numbered alternating image/text rows | Medium |
| LP-094 | Landing Pages | A 3-step 'how it works' (Transformation) section is present | Medium |
| LP-095 | Landing Pages | A comparison table shows the brand column highlighted with a check on every row vs. 1–2 unnamed competitors | Medium |
| LP-096 | Landing Pages | Store badges are repeated after every CTA | Low |
| LP-097 | Landing Pages | Pricing / plans, free-trial or 'no card needed' wording, integrations and security badges are present (missing from the wireframe) | High |
| LP-098 | Landing Pages | Navigation links top right; star-review social proof; benefit-driven value prop; 3 bullets; CTA (book a demo / sign up); App Store / Play S… | High |
| LP-099 | Landing Pages | USP breakdown with image, social proof (rating, full name, image, comment), comparison vs competitors, FAQs and another CTA | Medium |
| LP-100 | Landing Pages | Header shows nav + centred logo + a header CTA on desktop; hamburger + cart/contact icon on mobile | Low |
| LP-101 | Landing Pages | Hero = rating strip + benefit H1 + 3 bullets + CTA + image + testimonial; press-logo bar below | Medium |
| LP-102 | Landing Pages | Benefits shown as a 6-icon grid (3×2 desktop, 2×3 mobile) and features as alternating image/text blocks with check bullets | Medium |
| LP-103 | Landing Pages | A 'Secure checkout' / reassurance line sits above the final CTA, and the footer shows payment badges, social links and a newsletter field | Medium |
| LP-104 | Landing Pages | Service area, availability / booking slots and response time are stated | High |
| LP-105 | Landing Pages | Logo top middle; CTA stating the next step; star-rating social proof; benefit value prop; 3 bullets; video or picture on the right | High |
| LP-106 | Landing Pages | A CTA anchored with a success story (image + full name); 'As recommended / trusted by'; transformation steps; benefits; features (image + t… | Medium |

</details>
