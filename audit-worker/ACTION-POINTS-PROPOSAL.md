# Action points (v2, implemented 2026-10-13)

## Where it lives in the code

| Piece | File |
|---|---|
| The 125 points (GA4 25, GTM 25, Website 50, code slice 25) with type, default action, owner, done when, hand-off | `src/checklist.ts` (old lists kept in `src/checklist-legacy.ts` so older reports still render) |
| GA4 numbers, verdicts and money ranges computed by code; the GA4 focus page | `src/ga4-facts.ts` |
| New GA4 reports (per-product views/adds, campaign × landing page, country, hour × weekday, source/medium, search terms, landing × device), audiences, full GTM parameters; `begin_checkout` added to the funnel pull (it was missing) | `api/_lib/google-oauth.js` |
| Store visit before the audit: events after our Add-to-Cart click, WhatsApp/phone links, sold-out badges, hero video, visiting the GA4 product/landing page | `src/fud/collect.ts`, `src/fud/facts-js.ts`, `src/site-checks.ts` |
| Actionability rule (validation, one repair call, checklist defaults) | `src/actions.ts` |
| Prompt: computed facts block, browser facts block, action/protect fields; GA4 status forced from the facts | `src/audit-prompt.ts` |
| Conversion review: owner/done-when per rule, type per group, focus page from GA4 | `src/fud/rule-actions.ts`, `src/fud/index.ts`, `src/fud/judge.ts` |
| Report: type chips, action blocks, Keep lines, Action plan, "Follow-up from GA4" | `src/html-report.ts` |
| Client email: top 3 actions with type and money | `src/email.ts` |
| Run order: GA4 focus → store visit → GA4 facts → audit → Conversion review on the same visit | `src/poll.ts` |

Notes:
- The new GA4 reports only exist for requests whose OAuth connection happens after this change; older requests show those points as no data (Claude judges them from what was pulled).
- The store visit only runs where the Conversion review runs (`FUD_PASS`). Without it, the browser-fact points fall back to Claude's own browser checks.
- Preview: `npm run preview-report -- --path=tracking --fud --no-ar` (add `--legacy` for the old checklists).

---

# Proposal as reviewed

Goal: every point in the audit tells the client what to do, who does it, and
how to know it's done. Each point carries one of four opportunity types and,
where possible, a hand-off to the section that continues it (GA4 finds where,
CRO shows why on screen, GTM/Website check the number can be trusted).

v2 changes: weak points swapped for actionable ones, platform-controlled
website checks merged, and every failed point must carry Action + Owner +
Done when (enforced in code, see §1).

## 1. The point format (all tools, CRO included)

| Field | Meaning |
|---|---|
| Type | one of the four below |
| Fires when | the measured trigger, with the threshold |
| Finding | what we measured, with the store's own numbers |
| Action | one imperative step naming the exact object (URL, tag, product, event) |
| Owner | Dev / Mkt (marketing, ads) / Content / Owner (store owner) |
| Done when | a checkable end state |
| Hand-off | link to the section that continues it |
| Impact | money range when GA4 data allows, otherwise the concrete consequence |
| Effort | Quick win / Dev task / Test first (PEXTI bands) |

### Actionability rule (enforced in code)

A failed point is rejected and retried when:
- Action is empty, or names no specific object (page, tag, product, event, setting).
- Owner is not one of the four values.
- Done when is empty or not checkable (must name a report, tool view, page state, or number).

A passed point has no action by definition. It says what to protect
("Cart step healthy at 52% vs 50% benchmark. Don't change the cart while
fixing product pages.") and keeps its type.

### The four types

| Code | EN | AR | Used for |
|---|---|---|---|
| RG | Revenue gain | زيادة الإيرادات | more sales or bigger orders from traffic you already have |
| RL | Revenue loss aversion | إيقاف خسارة الإيرادات | money leaking now: broken steps, wasted ad spend, sales reported wrong to ad platforms |
| RA | Risk aversion | تجنّب المخاطر | legal/privacy, security, account suspension, data loss |
| BG | Benefit gain | مكسب إضافي | non-revenue wins: right decisions, findability, cleaner data |

### The evidence chain (how tools hand off)

1. GA4 finds the step / device / page / product where money leaks, with numbers and a money range.
2. Tracking gate: GA4-17, GTM-06 and W-22 check the step's event really fires. If it's missing, or the step rate is under 30% of benchmark, the action becomes "fix tracking", not "fix the page".
3. Tracking fine: the CRO pass is pointed at that exact page. It takes extra screenshots of it, the judge is told the drop number, findings on that page rank higher, and the report shows "GA4-01 → Cart review (3 issues)".
4. The hand-off is required. If the CRO pass couldn't reach the page, the GA4 point says so and falls back to a manual check list for that page.
5. Checkout stays manual (no automated checkout): GA4-04 gives a short manual test list.

## 2. GA4: 25 points

Numbers computed by the worker from the GA4 reports, so GA4, CRO and the email show the same figures. Claude writes the words.

### A. Where the funnel leaks money
| ID | Point | Fires when | Action / hand-off | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GA4-01 | Biggest funnel leak | worst of view_item→add_to_cart, add_to_cart→begin_checkout, begin_checkout→purchase vs benchmark | "Cart drop-off is 59%, the highest in your funnel. Fix the cart first." → CRO review of that page, money range | Dev + Owner | that step's rate within 10% of benchmark over 14 days | RG |
| GA4-02 | Product page → add to cart | view_item→add_to_cart below benchmark | → CRO product review of the worst product (GA4-10) | Dev + Content | add-to-cart rate up on that product over 14 days | RG |
| GA4-03 | Cart → checkout | add_to_cart→begin_checkout below benchmark | → CRO cart/drawer review with screenshot | Dev | cart→checkout rate at benchmark over 14 days | RL |
| GA4-04 | Checkout → purchase | begin_checkout→purchase below benchmark; add_shipping_info / add_payment_info locate the sub-step | manual checkout test list: shipping cost shown late, COD, forced account, payment options (half actionable: no automated checkout) | Owner | each item on the list tested and fixed or ruled out | RL |
| GA4-05 | Mobile vs desktop gap | mobile conversion under 60% of desktop | → CRO phone review of the GA4-01 page; money = closing half the gap on mobile visits | Dev | mobile conversion at 60%+ of desktop | RG |

### B. Where traffic is wasted
| ID | Point | Fires when | Action / hand-off | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GA4-06 | Landing pages with visits but no sales | top pages by visits converting under 1/3 of site average | → CRO visits that exact URL; fix it or stop sending traffic there | Dev + Mkt | page converts at 1/2+ of site average, or no paid traffic goes to it | RL |
| GA4-07 | Worst paid campaign × landing page (NEW report) | a paid campaign with many visits and near-zero sales, named with its landing page | pause it or change its landing page → CRO visits that page | Mkt | campaign paused, or its conversion rate up after the change | RL |
| GA4-08 | Unknown traffic source | Unassigned + (not set) above 10% of visits | add UTMs to ads, bio links, WhatsApp/SMS → GTM-14, W-26 | Mkt | Unassigned under 5% | BG |
| GA4-09 | Visits from countries you don't ship to (NEW report) | meaningful visits (or paid visits) from countries with no sales/shipping | exclude those countries in ad targeting | Mkt | those countries' paid visits near zero | RL |
| GA4-10 | Products viewed but not added (NEW report) | items with many views and add-to-cart rate far below the store average | fix that product (price, photos, stock, size info) → CRO visits that product | Content + Owner | that product's add-to-cart rate at store average | RG |

### C. Bigger orders and repeat buyers
| ID | Point | Fires when | Action / hand-off | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GA4-11 | Average order value vs free-shipping threshold | threshold not 1.2–1.5× AOV, or none | set the threshold from the real AOV → CRO M3 | Owner | threshold set at 1.2–1.5× AOV and shown in cart | RG |
| GA4-12 | Returning buyers, tied to site evidence | returning conversion under 2× new, or returning share under 15%, AND CRO R1 finds no email/WhatsApp capture | add capture with a first-order offer, plus a post-purchase message | Mkt + Dev | capture live on site; returning share rising | RG |
| GA4-13 | Site search (NEW report) | searchers convert better but search is hidden, or top terms point to missing products | make search visible; stock or route the top terms → CRO N2 | Dev + Owner | search visible on phone; top 5 terms return products | RG |
| GA4-14 | Remarketing audiences | no cart-abandoner / product-viewer audiences, or not shared with Ads | create them and link to Ads | Mkt | audiences exist and are populating in Ads | RG |
| GA4-16 | Hours and days that convert (NEW report) | strong gap in conversion rate by hour or weekday, with enough volume | schedule ad budget to the converting hours/days | Mkt | ad schedule set to match | RL |

### D. Can the numbers be trusted
| ID | Point | Fires when | Action / hand-off | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GA4-15 | Tracking live and stable | realtime 0, last-24h events near zero, or last 7 days vs prior 7 drops over 40% with no matching change in sales | fix the tag before anything else; check the last GTM publish / site release → W-21 | Dev | events flowing; no unexplained cliff | RL |
| GA4-17 | Funnel events complete (tracking gate) | any of view_item, add_to_cart, begin_checkout, add_shipping_info, add_payment_info, purchase missing, or a step under 30% of benchmark | add the missing event → GTM-06, W-22 | Dev | every step event visible in GA4 with plausible counts | BG |
| GA4-18 | Purchases and revenue agree | purchase count ≠ transactions, revenue 0, or currency missing | fix the purchase tag → GTM-01/02 | Dev | purchases = transactions, revenue matches the store admin within 5% | RL |
| GA4-19 | Payment gateways stealing sales credit (NEW report) | tabby, tamara, paymob, paypal or checkout domains show as a traffic source | add them as unwanted referrals | Mkt | they no longer appear as sources | BG |
| GA4-20 | Key events | purchase not a key event, or noise (page_view, scroll) marked as key | mark only real conversions | Mkt | key events = purchase (+ lead if used) | RL |
| GA4-21 | Google Ads link and conversion import | Ads link missing, or purchase not imported | link Ads and import purchase so bidding learns from sales | Mkt | purchase shows as a primary conversion in Ads | RG |
| GA4-22 | Currency and timezone | don't match the market | correct them | Mkt | settings match the store | BG |
| GA4-23 | Data retention | 2 months | switch to 14 months, so Ramadan / White Friday compare year on year | Mkt | retention shows 14 months | BG |

### E. Protect the account
| ID | Point | Fires when | Action / hand-off | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GA4-24 | Personal data in GA4 | emails/phones in page URLs or event values | redact them; Google can delete the property's data | Dev | none found in page_location or event params | RA |
| GA4-25 | Internal traffic | no internal-traffic filter, or the team/agency shows in the data | define internal IPs and activate the filter | Mkt | filter active | BG |

Dropped: GA4-D open slots (insights, not actions), bot-traffic point (GA4 can't remove past bot traffic; country point replaces it), traffic cliff as its own point (folded into GA4-15), Google Signals, Measurement Protocol secrets, change-history and access-report slots.

## 3. GTM: 25 points

Needs the GTM OAuth fetch expanded to full tag/trigger/variable parameters (today it only saves names and types).

### Ad platforms get the right signal
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GTM-01 | Purchase counted once | no transaction_id dedup, or purchase fires on a thank-you-page view | trigger on the dataLayer purchase event with transaction_id | Dev | one purchase per order in GA4 and ad platforms | RL |
| GTM-02 | Purchase sends value, currency, items | any missing | add them so ads can bid on revenue | Dev | purchase events carry all three | RG |
| GTM-03 | Meta pixel + Conversions API dedup | Meta purchase missing, or no event_id | add event_id; set up CAPI | Dev | Events Manager shows deduplicated purchases | RL |
| GTM-04 | Pixels for channels you pay for | GA4 shows TikTok/Snap/Meta paid traffic but no matching pixel events | add that pixel's ecommerce events | Dev | the pixel reports add-to-cart and purchase | RL |
| GTM-05 | Google Ads conversion, linker, enhanced conversions | any missing | add them | Dev | Ads shows the conversion as recording, enhanced on | RG |
| GTM-06 | Every funnel step has a tag | view_item, add_to_cart, begin_checkout, add_payment_info missing | add the tags (feeds GA4-17) | Dev | each step visible in GA4 | BG |
| GTM-07 | Conversions on dataLayer events, not URLs | URL/page-view conversion triggers | switch to event triggers | Dev | no URL-based conversion triggers left | RL |
| GTM-08 | Item data complete | items lack item_id/price/quantity | map them (makes GA4-10 possible) | Dev | item report in GA4 shows names and revenue | BG |
| GTM-09 | Double page_view / double GA4 config | duplicates | remove one | Dev | one page_view per page load | BG |
| GTM-10 | One measurement ID, no stray IDs | hardcoded or old IDs sending data elsewhere | one constant variable | Dev | only the store's ID in the container | RA |

### Track what shoppers in the region really do
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GTM-11 | WhatsApp / call clicks tracked | WhatsApp or tel: links with no event | track them as conversions; WhatsApp orders are invisible today | Dev | whatsapp_click appears in GA4 | RL |
| GTM-12 | Signup / lead forms tracked | email/phone capture with no event | add generate_lead / sign_up | Dev | event appears in GA4 | BG |
| GTM-13 | Site search tracked | search exists, no search event | add it (feeds GA4-13) | Dev | search terms appear in GA4 | BG |
| GTM-14 | Click IDs kept | gclid / fbclid / ttclid not captured | capture them for attribution | Dev | IDs stored and passed on conversion | BG |
| GTM-15 | Behaviour recordings | no Clarity/Hotjar | add Clarity (free) so CRO fixes can be checked on recordings | Dev | recordings visible in Clarity | BG |

### Consent, privacy, security
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GTM-16 | Consent defaults load first | consent default not on Consent Initialization | move it | Dev | default fires before any tag | RA |
| GTM-17 | Marketing tags respect "deny" | tags without consent checks | add consent requirements | Dev | denied visitors fire no marketing tags | RA |
| GTM-18 | No personal data in tags | email/phone in tag parameters unhashed | remove or hash | Dev | no raw email/phone in any tag | RA |
| GTM-19 | Unknown Custom HTML scripts | Custom HTML from unknown vendors | remove or replace with templates | Dev | every Custom HTML tag has a known owner | RA |
| GTM-20 | Old agency / campaign tags | paused or dead tags, ex-vendor pixels still firing | delete them | Dev | none left | RA |

### Container fit for this store
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| GTM-21 | Shopify checkout events | Shopify store, but begin_checkout/purchase rely on GTM (GTM doesn't run in Shopify checkout) | add a Customer Events pixel for checkout and purchase | Dev | checkout and purchase events arrive from the custom pixel | RL |
| GTM-22 | Heavy tags on every page | heavy tags on All Pages | scope them to the pages that need them | Dev | only core tags on All Pages | RL |
| GTM-23 | Internal traffic marker | no traffic_type for team visits | add it (pairs with GA4-25) | Dev | team visits tagged internal | BG |
| GTM-24 | Add to cart from the drawer tracked | add_to_cart only fires on page submit, not on drawer/AJAX adds | listen for the theme's AJAX add event | Dev | drawer add produces add_to_cart (checked by our real click) | BG |
| GTM-25 | Consent over-blocking for GCC visitors | tags denied by default for regions with no law requiring it | set region-specific defaults | Dev | GCC visits record normally, EEA stays denied | RL |

Dropped: publish hygiene, SPA pageviews, tag sequencing (weak evidence or filler).

## 4. Website: 50 points (no GA4/GTM access) and the 25-point code slice (one tool)

Technical only. Anything a shopper sees as UX lives in the CRO pass, so the two don't repeat each other.

### A. The buying path works (RL)
| ID | Point | Fires when | Action | Owner | Done when |
|---|---|---|---|---|---|
| W-01 | Add to cart works | our real click doesn't add the item (CRO collector) | fix the button / theme script | Dev | click adds the item, cart count updates |
| W-02 | Cart and checkout load clean | JS errors (including repeating ones) or failed loads on cart/checkout | fix the errors | Dev | zero errors on cart/checkout load |
| W-03 | Broken files on money pages | 404/500 images or scripts on home/product/cart | fix or remove | Dev | zero failed requests |
| W-04 | Hanging requests | requests over 3s blocking content | defer or remove | Dev | none over 3s |
| W-05 | Broken links / 404 page | dead nav/footer links, 404 with no way back | fix links; add a 404 with search | Dev | no dead links; 404 has search |
| W-06 | Redirect chains | http→www→https chains | one hop | Dev | single redirect |
| W-07 | WhatsApp / contact link works (NEW) | wa.me link broken, wrong number format, or tel: invalid | fix the link | Owner | link opens a chat with the right number |
| W-08 | Sold-out products still promoted (NEW) | home/collection features sold-out items | hide or move them down; promote in-stock | Content | no sold-out item in hero or first row |

### B. Speed on phones (RL)
| ID | Point | Fires when | Action | Owner | Done when |
|---|---|---|---|---|---|
| W-09 | Main content shows late (LCP) | over 2.5s on product page | preload hero image, cut blocking files | Dev | LCP under 2.5s |
| W-10 | Page jumps while loading (CLS) | over 0.1 | set image sizes, reserve banner space | Dev | CLS under 0.1 |
| W-11 | Slow to respond to taps (INP/TBT) | long main-thread tasks | defer heavy scripts | Dev | no task over 200ms on load |
| W-12 | Render-blocking files | blocking CSS/JS in head | defer/async | Dev | none blocking first paint |
| W-13 | Image weight (merged: size, format, lazy load) | images much bigger than shown, no WebP/AVIF, below-fold images load first | resize, modern formats, lazy-load | Dev | no image over 2× its display size |
| W-14 | Heavy JS/CSS | first-load payload over budget | remove unused code | Dev | under budget |
| W-15 | Third-party app weight | chat, review, popup apps heavy | drop or delay them | Owner + Dev | third-party JS under budget |
| W-16 | Leftover scripts from removed apps (NEW) | scripts from app domains that no longer do anything | remove them from the theme | Dev | no orphan app scripts |
| W-17 | Heavy hero video on phones (NEW) | autoplay video above the fold on mobile | use a poster image on phones | Dev | no autoplay video on mobile first screen |
| W-18 | Compression and caching | no gzip/brotli, short cache on static files | turn on | Dev | text compressed, long cache |
| W-19 | Arabic font loading | text invisible until the font loads | font-display: swap, subset | Dev | text visible immediately |
| W-20 | Mobile layout | overflow, tap targets too small | fix the CSS | Dev | no horizontal scroll, targets 44px+ |

### C. Tracking seen from outside
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| W-21 | Tag on every page type | missing on product/cart | install it | Dev | tag loads on home/product/cart | RL |
| W-22 | Ecommerce events really fire (tracking gate) | our add-to-cart click produces no add_to_cart in the dataLayer | add the event | Dev | add_to_cart appears on our click | BG |
| W-23 | Event data complete | items/value/currency missing | complete them | Dev | all fields present | BG |
| W-24 | Duplicate firing | tags or events fire twice | remove the duplicate | Dev | one hit per event | BG |
| W-25 | Ad pixels present | no Meta/TikTok/Snap/Google Ads tags | add the ones for channels you pay for | Mkt + Dev | pixels load and fire | RL |
| W-26 | UTMs survive | redirects strip UTMs, or internal links carry UTMs | fix redirects / links | Dev | UTMs reach the landing page; none internal | BG |
| W-27 | Old Universal Analytics | UA still loaded | remove it | Dev | no UA script | BG |
| W-28 | dataLayer before the tag | dataLayer declared after GTM | move it | Dev | declared first | BG |

### D. Risk (RA)
| ID | Point | Fires when | Action | Owner | Done when |
|---|---|---|---|---|---|
| W-29 | Consent banner wired | banner exists, no consent signal reaches scripts | connect it | Dev | consent state changes tag behaviour |
| W-30 | Personal data in URLs | emails/phones in query strings | change the forms to POST | Dev | none in URLs |
| W-31 | HTTPS and checkout trust (merged) | http reachable, mixed content, or checkout on another domain without HTTPS/branding | force HTTPS; fix checkout domain | Dev | all pages and checkout on HTTPS |
| W-32 | Security headers and cookies (merged) | HSTS/CSP/frame protection/cookie flags missing, only when the client controls hosting; on Shopify/Salla/Zid it passes as platform-managed | add headers and flags | Dev | headers present |
| W-33 | Exposed files | source maps, .env, backups reachable | remove | Dev | all return 404 |
| W-34 | Vulnerable libraries | known-vulnerable jQuery etc. | update | Dev | no known-vulnerable versions |
| W-35 | Undisclosed trackers | third-party trackers not in the privacy policy | remove or disclose | Owner | policy lists every tracker |

### E. Findability and sales channels
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| W-36 | Money pages blocked from Google | noindex/nofollow on product/collection | remove it | Dev | indexable | RL |
| W-37 | Titles | missing/duplicate/too long on product and collection | rewrite with product + intent | Content | unique, under 60 chars | RG |
| W-38 | Descriptions and canonicals (merged) | missing/duplicate descriptions, wrong canonicals | write them; fix canonicals | Content + Dev | unique descriptions, self canonicals | BG |
| W-39 | robots.txt and sitemap | missing, blocking, or no sitemap | fix | Dev | sitemap listed and reachable | RL |
| W-40 | Product schema | no price/availability | add it | Dev | valid in Rich Results Test | RG |
| W-41 | Schema matches the page (NEW) | schema price/stock differs from the visible page (Google Shopping disapproval) | sync them | Dev | identical values | RL |
| W-42 | Brand / GTIN in schema (NEW) | missing, limiting free Shopping listings | add brand and GTIN/MPN | Content | fields present | RG |
| W-43 | Review stars and breadcrumbs | reviews exist but no markup | add it | Dev | stars eligible in Rich Results Test | RG |
| W-44 | WhatsApp/Instagram link previews | no OG image/title | add them (links shared in chats look like ads) | Dev | preview shows image and title | RG |
| W-45 | Arabic/English versions | wrong lang/dir, no hreflang, Arabic not indexable | fix | Dev | both versions indexable with hreflang | RG |
| W-46 | Filter/sort URLs indexed (NEW) | ?filter/?sort collection URLs indexable | noindex or canonical them | Dev | only clean collection URLs indexable | BG |

### F. Accessibility on the buying path
| ID | Point | Fires when | Action | Owner | Done when | Type |
|---|---|---|---|---|---|---|
| W-47 | Contrast on price and buttons | WCAG AA fails on price/CTA | darken colours | Dev | AA passes | BG |
| W-48 | Product image alt text | product images without alt | add product names | Content | every product image has alt | BG |
| W-49 | Form labels | inputs without labels | add them | Dev | all labelled | RA |
| W-50 | Icon buttons named | cart/menu/search icons with no name | add aria-label | Dev | all named | RA |

**25-point code slice (only GA4 or only GTM connected):** W-01, 02, 03, 04, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 29, 30, 36, 40, 41, 44.

Dropped or merged: looping console errors (into W-02), clickjacking and cookie flags (into W-32), checkout domain (into W-31), lazy loading and image formats (into W-13), canonicals (into W-38).

## 5. CRO (Conversion review, 31 rules): what changes

- Every rule gets a type: trust and cost rules (A, B, C1–C5, D1–D3) → RL; buy-more (M1–M3) → RG; navigation (N, C6, D4, D5) → RG; repeat buyers (R) → RG; local fit (L) → RG; usability (H, P, U) → RG, or RL when they sit on the GA4-01 page.
- Each rule's existing recommendation becomes the Action, plus Owner and Done when. PEXTI stays as Effort.
- Focus page from GA4: the page behind GA4-01, the URL from GA4-06/07 and the product from GA4-10 get visited and screenshotted on purpose, instead of the first product found. The judge is told the drop number. Findings there get an impact boost and appear under "Follow-up from GA4".

## 6. Report and email changes

- New top section "Action plan": every failed point from every tool, grouped by the four types, money first, each with owner, effort and done when.
- Every row shows a type chip, the Action, Owner, Done when and the Hand-off link.
- The client email lists the top three actions with type and money.

## 7. New data the worker must pull

- GA4: item report (views, adds to cart, purchases by item), campaign × landing page, country × conversions, hour × weekday conversions, source/medium (GA4-19), search terms (GA4-13), audiences (GA4-14), landing page × device.
- GTM: full tag, trigger and variable parameters in the OAuth fetch.
- CRO collector: read the dataLayer after the add-to-cart click (W-22, GTM-24); visit the GA4 landing page, campaign page and product (GA4-06/07/10); check the WhatsApp link (W-07).
- Platform detection (Shopify/Salla/Zid/custom) for GTM-21 and W-32.
