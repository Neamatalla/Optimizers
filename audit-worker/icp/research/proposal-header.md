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
