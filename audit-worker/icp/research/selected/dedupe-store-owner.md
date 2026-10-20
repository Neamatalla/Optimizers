# Store owner: cross-section dedupe log (2026-10-20)

Pairs checked: GA4+GTM, GA4+WEBCODE, GTM+WEBCODE, WEBCODE+CRO. All ids below are the **old** ids unless marked "new id". Every file is renumbered 01-25 in value order. The full old-to-new mapping is at the end.

## Removed (13)

| Removed | Kept in | Why |
|---|---|---|
| SO-WC-07 Each order counted once in GA4 | SO-GA4-06 | Purchase/transactionId duplicates are a GA4 number check; WC-07 was a pure GA4 Data API query. |
| SO-GTM-05 Every buying step tracked | SO-GA4-08 | Same concern (all 4 funnel steps recorded). GA4 sees all steps incl. begin_checkout/purchase, which our visit never reaches. |
| SO-WC-09 Every shopping step recorded | SO-GA4-08 | Same as above. |
| SO-GA4-09 Store sends every visit to GA4 twice | SO-WC-10 (new SO-WC-08) | Measured from live network hits, which is WEBCODE. Sources merged into WC-10. |
| SO-GTM-12 Visits are counted once | SO-WC-10 (new SO-WC-08) | Same double-counting concern. The live hit count catches every cause (app + GTM, two Google tags, manual page_view). Source merged. |
| SO-GTM-01 Tracking runs on every page | SO-WC-11 (new SO-WC-06) | Live page check. WC-11 now also checks that the container ID matches the one we read, on phone and desktop. Severity raised to critical. Sources merged. |
| SO-GTM-03 Orders carry value, currency, products | SO-GA4-06 (+ WC-06, WC-08, GA4-22) | Purchase value and currency are measured in GA4 (GA4-06), purchase items in GA4 (GA4-22), and browse-event value and currency on the live page (WC-06, WC-08). Sources added to GA4-06. |
| SO-GTM-14 Product names and prices reach reports | SO-WC-06 (new SO-WC-07) | Its own check was the view_item/add_to_cart hits, the same as WC-06. Price and quantity were added to WC-06's pass. Sources merged. |
| SO-GTM-11 Tags don't slow store on phones | SO-WC-17 (new SO-WC-14) | Speed belongs to WEBCODE. WC-17 is widened to "apps and tags". Sources merged. |
| SO-GTM-24 See what shoppers search for | SO-GA4-21 | Found in this pass, not in the known list. Both check that searches are recorded, and GA4's searchTerm report measures that best. |
| SO-WC-25 Customer emails/phones out of page links | SO-GA4-23 | GA4 page paths over 28 days show what was actually stored. Our 4-page visit submits no forms. |
| SO-WC-12 No sold-out products where shoppers look first | SO-CRO-19 | What the shopper sees belongs in CRO. CRO-19 now also covers the home banner and first rows. Source EXIST-W-08 merged. |
| SO-CRO-25 Menu and footer links work, 404 way back | SO-WC-20 (new SO-WC-16) | One crawl of the same menu links. Merged into WC-20, which now covers missing categories, dead menu/footer links and the not-found page. Source EXIST-W-05 merged. |

## Kept both, titles or scope sharpened

- **SO-WC-04 vs SO-CRO-05 (WhatsApp):** both kept. WC-04 is now "WhatsApp and call links use a number that works". CRO-05 is now "WhatsApp button is easy to see on phones and doesn't cover the buy button", and its number-format check was removed.
- **SO-WC-01 vs SO-GTM-06 (add to cart):** both kept. WC-01 checks that the product really goes into the cart. GTM-06 is now "Add to cart is counted once in tracking for each real add". The headless add-to-cart check was removed from GA4-08's validate.
- **SO-GA4-18 vs SO-GTM-19 (campaign credit):** both kept because they measure different things. GA4-18 checks that UTMs survive redirects for GA4 and is now "Campaign tags survive redirects so GA4 credits the right source". GTM-19 checks that click-ID cookies are stored for ad platforms and is now "Ad click IDs are saved so ad platforms can match sales".
- **SO-GA4-06 vs SO-GTM-02 (order counted once):** both kept. GA4-06 is the result in GA4 numbers. GTM-02 is the purchase-trigger config, now titled "Purchase tags fire once, only on the real purchase".
- **SO-WC-06 vs SO-WC-08 (value/currency):** both kept. WC-06 checks that the fields are present. WC-08 is now "The value sent matches the price shown on the page".
- **SO-GTM-10 vs SO-WC-14 (ad pixels):** both kept. GTM-10 is now "Purchase tag set up for every ad platform you pay for" (GTM read only). WC-14 is now "Ad pixels fire on your live pages" (live page view and add to cart only).
- **SO-GTM-17 vs SO-GA4-23 (personal data):** both kept. GTM-17 is narrowed to plain email or phone in tag parameters (GTM read only) and retitled. Personal data in URLs stays in GA4-23.
- **SO-GA4-15 vs new SO-GA4-15 (self-referrals):** GA4-15 (new SO-GA4-14) is narrowed to payment providers, banks and gateways. The store's own checkout domains moved to the new backfilled point.
- **Within CRO:** SO-CRO-18 dropped its cart part (CRO-09 covers price carry-over into the cart). SO-CRO-16 dropped its failed-image-request check (WC-13 covers broken files).
- Not changed (checked, distinct): GTM-07 vs WC-10 (ad pixel loaded twice vs GA4 hits twice), GTM-21 vs WC-22 (old GTM tags vs leftover theme app code), GTM-09 vs WC-04 (click tracking vs working number), GTM-04 vs GA4-08 (Shopify cause vs GA4 result).

## Backfilled (13)

| Section | New id | Point | Source (pool) |
|---|---|---|---|
| GA4 | SO-GA4-15 | Your own store domains showing as a traffic source | CHK-A-003 (pools/store-owner-GA4) |
| GTM | SO-GTM-11 | Each ad platform gets your sales on one pixel ID | CHK-A-044 |
| GTM | SO-GTM-13 | Key tags fire on store events, not on how buttons look | CHK-A-046 |
| GTM | SO-GTM-14 | Newsletter and contact form sign-ups are counted | EXIST-GTM-12 + CHK-C-017 |
| GTM | SO-GTM-17 | Your latest tracking fixes are actually live | CHK-A-076 |
| GTM | SO-GTM-19 | Pages that change without reloading are still counted | CHK-A-057 + CHK-C-014 |
| GTM | SO-GTM-22 | Triggers don't depend on switched-off settings | CHK-A-072 |
| GTM | SO-GTM-25 | Visits to missing pages are recorded | CHK-C-015 |
| WEBCODE | SO-WC-18 | Tracking starts before phone shoppers leave a slow page | CHK-B-073 |
| WEBCODE | SO-WC-21 | Colour options shown as swatches on the product page | UX-029 |
| WEBCODE | SO-WC-23 | Home banners record views and taps | CHK-B-020 |
| WEBCODE | SO-WC-25 | Product data is ready and fresh when tags read it | CHK-B-008 + CHK-B-007 (+ EXIST-W-28 from CRO pool, same check) |
| CRO | SO-CRO-22 | Cart icon is always visible in the phone header | UX-011 |

These candidates were skipped as duplicates or because they can't be measured: EXIST-GA4-25 (dup of GTM team-visits), EXIST-GA4-21 (overlaps GTM Google Ads), EXIST-W-29 (dup of GTM consent points), UX-095 (dup of GTM recordings), UX-038/UX-024 (dup of CRO filter/sort), CHK-A-061 (publish access not readable with the service account), CHK-B-003/CHK-B-004 (need a test order or backend).

## Old to new ids

- GA4: 01-08 unchanged; 10-15 became 09-14; new point is 15; 16-25 unchanged.
- GTM: 02→01, 04→02, 08→03, 06→04, 07→05, 10→06, 09→07, 13→08, 15→09, 16→10, new 11, 18→12, new 13, new 14, 19→15, 17→16, new 17, 20→18, new 19, 21→20, 23→21, new 22, 22→23, 25→24, new 25.
- WEBCODE: 01-05 unchanged; 11→06, 06→07, 10→08, 08→09, 13→10, 14→11, 15→12, 16→13, 17→14, 18→15, 20→16, 19→17, new 18, 21→19, 22→20, new 21, 23→22, new 23, 24 unchanged, new 25.
- CRO: 01-21 unchanged; new 22; 22→23, 23→24, 24→25.
