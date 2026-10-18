# Reader brief: media buyer (ICP2, "Prove it's not my ads")

This audit is read by a **media buyer**: the person who runs the store's paid
ads (Meta first, then TikTok, Snapchat, which is key in KSA, and Google).
Typically Egyptian, often running Saudi or other GCC accounts from Cairo, as
a freelancer, an agency employee or in-house. They are not the store owner.
They control budgets, audiences, creatives and bids. They do NOT control the
website, the checkout, the offer or the tracking setup, yet they are judged
on results that depend on all of them. Their job, in their words: "Tell me if
it's the ads or the site, and give me proof the owner will accept."

Human source: ICP2-Media-Buyer.md (the canonical ICP card).

## How they think

- Paid on **ROAS** first, then CPP/CPA, CVR and CAC. Seniors also track
  break-even ROAS, MER and POAS; in COD markets, delivered-order CPA.
- They think they know CRO, but what they know is a best-practice checklist
  (sticky add to cart, timers, reviews, free-shipping bar). Show them leaks no
  checklist would catch, from this store's own data.
- Their biggest pains: ad numbers that don't match the store, "is it the ads
  or the site?", leaks they can see but can't fix or prove, and owners who
  won't act without proof.

Every finding must answer one of two questions:
1. **Is the number real?** Do the ad platforms and GA4 see every sale once,
   with the right value and currency? If not, ROAS is wrong and the
   algorithm learns from bad data. Undercounted sales get winning campaigns
   cut; double-counted sales get losing campaigns scaled.
2. **Does paid traffic convert?** Where do people who clicked an ad drop off
   after the click, and what does that do to CVR, ROAS and CAC?

The math to use in words when it fits: ROAS = conversion rate × AOV ÷ CPC,
and CPA = CPC ÷ conversion rate. A 20% better conversion rate is about 20%
more ROAS and about 17% lower CPA on the same spend. Never invent ROAS, CPC,
CPA, CAC or spend figures: this audit does not see ad accounts. Use the
store's own numbers and the money ranges code already added.

## ROAS and CAC: direction, never a number

The audit doesn't see ad spend, so it never states a ROAS, CPA, CAC or spend
value. It does estimate the DIRECTION from the store's own GA4 and GTM data,
and every failed finding must say it, labelled as an estimate ("likely",
"expect", "estimated"):
- Post-click leaks: fixing them converts more of the same paid clicks, so
  ROAS goes up and CAC goes down. When the action has a GA4 money range,
  size it against the store's revenue in words ("a large share of current
  revenue"), never as a ROAS figure.
- Order value: fixing raises AOV, so ROAS goes up at the same CAC.
- Wasted clicks (traffic that can't buy, sold-out products advertised): CAC
  is higher than it needs to be right now.
- Over-counting (duplicate Purchase, non-sales as key events, URL-based
  conversions): reported ROAS reads higher than real; losing campaigns can
  look like winners. Fixing it may LOWER reported ROAS; say that this is the
  truth showing, not performance dropping.
- Under-counting or wrong credit (missing events, missing value, payment
  gateways as sources, lost click IDs, consent over-blocking): reported ROAS
  reads lower than real; winning campaigns can get cut and the algorithm
  learns from fewer sales.
- Weak signal (funnel events, catalog data, audiences, Google Ads link):
  fixing it improves targeting and bidding, so ROAS rises and CAC falls over
  time.
Each checklist point above carries its "Ad effect when failing" line; use
it, and don't claim an effect the point doesn't have.

## Business voice for this reader

- **Use their terms directly. They are not jargon to this reader:** ROAS,
  CAC, CPA, CPP, CPC, CVR, AOV, MER, pixel, event, Purchase, Add to Cart,
  ViewContent, InitiateCheckout, CAPI / Conversions API, server events,
  event_id and deduplication, Event Match Quality (EMQ), Events Manager,
  click IDs (fbclid, gclid, ttclid, ScCid), UTMs, landing page, funnel,
  retargeting audience, signal, the algorithm, scale.
- Explain GA4 and GTM internals in a few words the first time (for example
  "key events, the actions GA4 counts as conversions").
- **summary**: one line that names the effect on ROAS, CPA/CAC, CVR, or the
  data the ad platforms optimize on. Every failed summary must name at least
  one of these. Example: "Meta sees each purchase twice, so reported ROAS is
  about double the real one."
- **detail**: the campaign decision this distorts (scale, cut, budget split,
  creative winner), the audience it shrinks, or the paid clicks it wastes
  after the landing page, how it shows up in Ads Manager or GA4, and how
  they can confirm it themselves (Test Events, Pixel Helper, GA4 DebugView,
  the browser Network tab).
- Talk to them as "you" (the buyer) and "your campaigns"; call the shop "the
  store". Never assume they can edit the site: say who has to change it, so
  they can forward the point to the owner or developer as proof.
- Short sentences, numbers first. No moralizing, no selling.

## Emphasis by point type

- **Tracking and tags (GTM, GA4 data quality, browser facts):** what the
  platforms see vs what really happened. Name the likely cause when the
  evidence fits: pixel + CAPI without a shared event_id; Purchase firing
  again on a refreshed thank-you page; two setups (app + GTM + hard-coded)
  sending it; value sent as text or before discounts; missing currency or
  items; Add to Cart firing on the click when nothing was added; checkout
  events lost in Shopify's sandboxed custom pixel; payment gateways (Tabby,
  Tamara, Tap, PayTabs) taking sales credit as traffic sources;
  non-purchase events marked as GA4 key events; no server events (ad
  blockers, Safari, iOS); consent defaults blocking ad tags; click IDs and
  UTMs dropped on redirect; COD and WhatsApp orders that never fire a
  purchase. Never claim a cause the evidence doesn't show.
- **Funnel and landing pages (GA4-01 to 07, GA4-10, GA4-11):** paid traffic
  bought and then lost, and the CVR/ROAS effect of closing part of it.
- **Speed, mobile, cart and checkout:** post-click conversion and wasted
  clicks (people who leave before the page loads never count as a landing
  page view).
- **Privacy, security, SEO, accessibility:** short and factual. Tie to ads
  only when the link is real (consent blocking ad tags, link previews used
  by ads, wording that can get ads rejected).
- **Passed points ("protect"):** what this keeps working for their campaigns.

## Arabic

Everyday Egyptian-friendly Arabic, not formal MSA (formal MSA reads like the
news to them). Keep metric and event names in Latin script: ROAS, CPA, CAC,
CVR, AOV, CAPI, Pixel, Purchase, Add to Cart, Events Manager, EMQ.
