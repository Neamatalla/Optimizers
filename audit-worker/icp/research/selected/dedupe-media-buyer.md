# Media buyer: cross-section dedupe log (2026-10-20)

Rule used: one concern lives in the section whose tool measures it best (GA4 numbers → GA4; container config → GTM; live page behaviour/network/dataLayer/speed/crawl → WEBCODE; what the shopper sees and can do → CRO). Only co-appearing pairs checked: GA4+GTM, GA4+WEBCODE, GTM+WEBCODE, WEBCODE+CRO. Old ids below are the ids before renumbering; new ids in brackets.

Totals: 17 points removed as duplicates (GA4 2, GTM 9, WEBCODE 3, CRO 3). Backfilled: GA4 2, GTM 9, WEBCODE 3, CRO 3. Every file is back to 25, renumbered 01–25 in value order.

## Removed

| Removed | Kept in | Why |
|---|---|---|
| MB-WC-01 Purchase can fire twice | MB-GTM-01 [GTM-01] | Same check (Purchase trigger type + order id), measured by gtm_read; container concern belongs in GTM. Sources CHK-B-006, CHK-B-014, CHK-B-003 merged into GTM-01. |
| MB-GTM-03 One setup per platform | MB-WC-02 [WC-01] | Live double hits per action are a network-log finding. Sources CHK-A-042, EXIST-GTM-09 merged into WC-01. Its stray/ex-agency ID part became a container-only backfill (GTM-07). |
| MB-GA4-04 GA4 tag loads only once | MB-WC-02 [WC-01] | Browser count of gtag loads/collect hits = same as WC duplicate-hits check. Sources CHK-A-039, CHK-A-004, CHK-C-006 merged into WC-01. |
| MB-GTM-08 Tracking on every landing page | MB-WC-13 [WC-05] | Crawl/browser presence per page = WC page-type coverage. Container-ID match and top paid landing URLs folded into WC-05; sources CHK-A-077, CHK-A-041 merged. |
| MB-GTM-11 fbclid → _fbc | MB-WC-04 [WC-04] | Browser click-ID survival. WC-04 now covers all click IDs + UTMs through to the cart. CHK-A-053 merged. |
| MB-GTM-18 UTMs reach GA4 on first page | MB-WC-04 [WC-04] | Same redirect/UTM test. |
| MB-GTM-19 ScCid kept | MB-WC-04 [WC-04] | Same test, Snap click ID. |
| MB-GTM-20 ttclid kept | MB-WC-04 [WC-04] | Same test, TikTok click ID. |
| MB-GA4-06 UTMs and click IDs survive | MB-WC-04 [WC-04] | Browser test, not GA4 data. CHK-B-038, CHK-B-037 merged into WC-04. CHK-A-009 (GA4 URL redaction) dropped: redaction is applied inside GA4 and is not visible in the hit, so it can't be measured from the page. |
| MB-CRO-08 Campaign tags survive | MB-WC-04 [WC-04] | Same redirect test; EXIST-W-26, EXIST-W-06 (one-hop redirect) kept in WC-04. Internal-link UTMs already covered by GA4-23 (GA4+CRO never co-appear). |
| MB-GTM-17 Consent Mode v2 four signals | MB-WC-10 [WC-07] | gcs/gcd on live hits is a network finding; merged into WC-07 with sources CHK-B-022, CHK-B-029, CHK-B-030, CHK-A-056. Its "tag consent settings" part moved into GTM-04. |
| MB-GTM-24 Product IDs match | MB-WC-09 [WC-10] | Same live ID comparison across pixel hits. EXIST-GTM-08, CHK-A-051 merged into WC-10. |
| MB-GTM-25 GA4 sees every funnel step | MB-GA4-17 [GA4-16] | "Tag exists" vs "event arrives in GA4" read as one finding; GA4 counts measure it best (also catch events sent by apps). EXIST-GTM-06 merged into GA4-16. |
| MB-CRO-01 Add to Cart really adds | MB-WC-07 [WC-02] | What the page does on our click → WEBCODE. UX-011 (cart icon in nav) dropped as a source. |
| MB-CRO-11 Landing page shows fast | MB-WC-24 [WC-18] | Speed = what the page does. Hero video, compression/cache, font loading (EXIST-W-17/18/19) merged into WC-18. |
| MB-WC-17 Sold-out products featured | MB-CRO-07 [CRO-03] | Stock the shopper sees → CRO. EXIST-W-08 merged into CRO-03. |
| MB-WC-21 WhatsApp links broken | MB-CRO-21 [CRO-15] | What the shopper can do → CRO. EXIST-W-07 and the number-format check merged into CRO-15. |

## Kept both (rewritten so each reads as its own finding)

- GA4-02 "GA4 records more purchases than real orders" (GA4 order data) vs GTM-01 "Purchase tags fire on a thank-you page view or without an order ID" (container cause). Effect vs cause.
- GA4-03 "GA4 purchase revenue zero, in mixed currencies, or not matching its items" vs GTM-03 "Purchase tags mapped to value, currency and items" vs WC-06 "Live product and cart events sent without value, currency or items" vs WC-09 value format. GTM-03 trimmed to Purchase-tag mapping only (Purchase is never seen live); WC-06 to live view_item/add_to_cart only.
- GTM-10 "Add to Cart tags triggered by a button click, not the add event" (trigger type, container only; browser part removed) vs WC-08 "Our successful Add to Cart reaches GA4 and every pixel" (atcEvents after a successful add; the "fires on a failed click" part removed because atcEvents is null when the click didn't add). WC-02 (cart actually filled) is a third, separate finding.
- GTM-04 "Consent default set first in the container, per region" (container only, browser part removed, tag consent settings added) vs WC-07 "Consent state on live hits blocks or ignores ad tags" (live hits only).
- GTM-06/12/14 Meta/Snap/TikTok "tags set up for every funnel step" (per-event container setup, measured_by changed to gtm_read) vs WC-03 "Pixel missing or blocked for a platform you run" (loads/fires at all).
- GTM-11 Google Ads conversion tag: test gclid cookie step removed (lives in WC-04); container setup only.
- GTM-16 cookie lifetime and GTM-18 late-accept credit kept: different concern from WC-04 (how long the ID lasts; consent timing), not a duplicate.

## Fixes requested

1. Add to Cart really adds → WC-02, sourced on the worker's own visit: src/fud/collect.ts `addToCartAndCapture` (variant select, one click, drawer/URL wait, store cart count, cart page) and src/site-checks.ts `addToCart` {attempted, ok, reason, via, clickAdded}. via=api reported as "unconfirmed, may be our automated browser"; atc_disabled_or_out_of_stock routed to CRO-03. Source EXIST-W-01 only; UX-011 dropped.
2. CRO-04 → CRO-02 "Top paid campaigns: landing page conversion and what the page offers": GA4 campaign × landing page conversion vs the store's paid average, plus the top campaign landing page's headline/offer from the visit, compared with the campaign name. "Check against the ad in Ads Manager" removed.

## Backfilled (from each section's pool, not selected anywhere, not duplicates)

- GA4-13 Paid sales from new buyers vs returning ones — EXIST-GA4-12 (extended to paid sessions, new_fact).
- GA4-17 Attribution settings that decide paid credit — CHK-A-013 (get_attribution_settings). Skipped CHK-C-026 (item not-set share) as a near-duplicate of WC-24 item field names; skipped EXIST-GA4-25 (team visits) because GTM-21 covers it.
- GTM-07 Container sends data to IDs the store doesn't own — EXIST-GTM-10, EXIST-GTM-20.
- GTM-09 Conversion tags that fire on every page — CHK-A-047.
- GTM-19 Built-in variables your triggers need are switched on — CHK-A-072.
- GTM-20 Pixels pasted as Custom HTML and unknown scripts — CHK-A-063, EXIST-GTM-19.
- GTM-21 Team and staff visits marked as internal — EXIST-GTM-23, CHK-A-073.
- GTM-22 Page changes without a reload still send a page view — CHK-C-014, CHK-A-057.
- GTM-23 Live site runs the latest published container version — CHK-A-076.
- GTM-24 Snap, TikTok and Google event tags wait for their base tag — CHK-A-067.
- GTM-25 Custom JavaScript variables only return a value — CHK-A-050.
  Skipped in GTM: CHK-B-043, CHK-B-049, CHK-B-050, CHK-B-052, CHK-B-059 (need ad-account data); CHK-A-079 (duplicates WC-03); CHK-A-074, EXIST-GTM-22 (duplicate WC speed); EXIST-GTM-17, EXIST-GTM-18 (duplicate WC-07 refusal / WC-15 PII); lead-form items (low value for an ecommerce buyer).
- WC-16 Taps lag on the phone — EXIST-W-11.
- WC-17 dataLayer set before the tag loads — CHK-B-008 (+ EXIST-W-28 from the CRO pool, same check).
- WC-21 Page jumps while it loads (CLS) — EXIST-W-10.
- CRO-16 Reviews visible where paid shoppers decide — UX-051, UX-023, UX-157.
- CRO-23 Search easy to find and returning results — UX-009.
- CRO-24 Every page loads on a secure connection — UX-005.
