# ICP scoring spec (condensed)

Built 2026-10-20 from five files:
- `audit-worker/icp/media-buyer-full.md` (694 lines, dated Oct 18 per caller; the file itself has no date)
- `audit-worker/icp/media-buyer.md` (118 lines, Oct 15 per caller; read for diff)
- `audit-worker/icp/store-owner.md` (50 lines)
- `Downloads/ICP1-Self-Serve-GCC-Store-Owner.md` (canonical card, store owner, 472 lines)
- `Downloads/ICP2-Media-Buyer.md` (canonical card, media buyer, 500 lines)

Evidence tags used below come from the cards: [Certain], [Likely], [Guessing], [Inference]. The ICP1 card says every behaviour claim is a documented hypothesis with no interviews yet. The ICP2 card says the evidence for the person is strong, but willingness to pay is unproven.

---

## Store owner (ICP1)

**Job:** "Tell me what's costing me sales and let me fix it myself." (card section 1)

**Top 5 pains and needs (card sections 5 and 9)**

1. **No help between "see the problem" and "apply the fix".** The card's biggest product gap. Evidence level: hypothesis (cites FEATURE-DISCOVERY-REPORT, no tag).
2. **Money numbers must be believable and attributed.** One contradicting or unattributed number kills trust. Evidence level: hypothesis (simulated assessment #5).
3. **Payment-mix leak.** Card cites COD returns of 15-40% against about 6% for prepaid, and BNPL lifting AOV 30-50%. Evidence level: hypothesis. The COD share itself is [Guessing] (card section 17.4: sources say 10% to under 30%).
4. **Nothing brings them back.** No retention loop; WhatsApp, not email, is their channel. Evidence level: hypothesis. The channel usage figure is cited but untagged.
5. **Copy pains P1-P8.** Welcome-only headline, MSA translationese, buried COD/BNPL messaging, no Arabic SEO, missing Arabic reviews, policy-style text, fear of being lied to, no time or skill. Evidence level: hypothesis (COPY-OPTIMIZER-FEATURE-DOC).

Weak direct evidence (single Elevr posts, card section 16): S6#32 "all the loss is in the last step", S6#166 (85% drop at the payment step, unresolved), S6#206 (GA4 misses 28% of orders). Treat as anecdote.

### What a finding must do for this reader

- **Money first, in SAR (the store's currency), before any technical term.** The number must come from GA4 (card section 9: GA4 is the single source of truth for orders and markets). See conflicts below.
- **Show the source of every money number.** Never invent a figure. If GA4 is missing, say the figure is unavailable. Do not estimate (card section 15: honest "unavailable" states).
- **One money number per finding.** No two currencies. One numeral system (Western digits, per tool brief).
- **Say exactly what to change and where.** Name a Salla, Zid or Shopify menu path only if you are certain it exists. Otherwise name the setting in plain words.
- **Say who does it:** the owner in the admin, or a developer.
- **Use GCC terms when a finding touches them:** mada, Apple Pay, STC Pay, Tabby, Tamara, COD and its fee, delivery cost and free-delivery threshold, the WhatsApp button, Arabic product titles, Arabic pages on mobile.
- **No fabrication.** A finding the owner can disprove discredits the whole report (card section 7). ZATCA findings only when revenue is likely above the SAR 375K/yr Wave 24 threshold (card section 17.7).
- **Summary = one line on what it costs or protects.** Detail = what the customer experiences, what it does to sales, what they can change. For a passed point, say what is working and should stay.
- **Tone:** plain, practical, short sentences. No fear or hype words ("disaster", "urgent", "huge"). Gulf Arabic (توصيل, أضف للسلة), not MSA and not Egyptian. Arabic-first; English on Arabic trust moments is a defect.
- **Legible at 375px.**

### What "good" looks like for scoring

**Scores high (in order of weight):**
- Money at stake from the GA4 funnel: the worst step, times sessions, times the gap.
- Checkout and payment gaps: mada, Apple Pay, Tabby or Tamara not visible; COD fee hidden until checkout.
- Free-delivery threshold missing or unclear; shipping cost revealed late; WhatsApp button hidden.
- Arabic product titles, Arabic RTL breaks in cart or checkout on mobile.
- Coupon advertised one way, price at checkout another (S6#302).

**Scores medium:** trust on the product page (reviews, returns, delivery time), price and CTA clarity, a missing Arabic product description.

**The reader cannot act on these, so they score low unless they change sales:**
- Internal engineering: code structure, server-side container architecture, API design, bundle size.
- GA4 admin settings (retention, attribution model, custom dimensions) with no effect on sales.
- Pure SEO meta, schema or OpenGraph tags. Salla's free analyzer already covers SEO and GEO. Card section 19.3: differentiate on money and checkout, never on SEO meta.

### Points that should score low for this reader

- Internal engineering with no sales link (code quality, framework versions, build tooling).
- GA4 or GTM configuration that does not change a sales number (for example, an unused custom dimension).
- SEO-only findings (meta description length, OG image size, schema types) with no money or checkout effect.
- Ad-platform internals the owner never touches (pixel IDs, dedupe settings) unless the store loses sales because of them.
- Features the owner cannot buy or switch on (card section 14: "a working way to pay" is an open ask, so payment-gateway recommendations need a real option to point to).
- Generic CRO best practice with no store-specific leak.

---

## Media buyer (ICP2)

**Job:** "Tell me if it's the ads or the site, and give me proof the owner will accept." (tool brief). Their own words: "المشكلة مش في الإعلان" (the problem isn't the ad), "برا الداشبورد" (outside the dashboard).

**Role:** user and champion. Judged on ROAS, CAC and CVR. Does not control the site, checkout, offer, tracking setup or GTM. Sells the verdict to the owner. Card section 15 (decided 2026-10-14): **customer for our tools** (pays from own budget, low and fair price); **referrer for our retainer** (recommends us, owner pays).

### The two questions every finding must answer

**1. Is the number real?** Do the ad platforms and GA4 see every sale once, with the right value and currency? Undercounted sales get winning campaigns cut. Double-counted sales get losing campaigns scaled.

Point types that answer it:
- GTM tags and triggers: Purchase firing again on a refreshed thank-you page; value sent as text, missing currency, missing items; Add to Cart on the click when nothing was added; duplicate sources (app plus GTM plus hard-coded snippet; Zid or Salla collector plus pixel); consent defaults blocking tags.
- GA4: non-purchase events marked as key events (rates above 100%); payment gateways (Tabby, Tamara, Tap, PayTabs) showing as traffic sources.
- Redirects: click IDs and UTMs dropped on the way to checkout or the gateway.
- Missing server-side events, or COD and WhatsApp orders that never fire a purchase.
- Snap and TikTok pixel and event configuration, not only Meta.

**2. Does paid traffic convert?** Where do people who clicked an ad drop off after the click, and what does that do to CVR, ROAS and CAC?

Point types that answer it:
- Link-click to landing-page-view gap (page speed).
- Landing page versus ad promise (message match), and whether each campaign has a page that fits.
- Funnel steps by device: view_item, add_to_cart, begin_checkout, purchase.
- Add to Cart that does not add; empty-cart states not recognised; Arabic or RTL mobile product pages.
- Shipping cost shown only at checkout; payment options missing (COD, BNPL, mada, Apple Pay); no guest checkout.
- Trust on the product page; AOV levers (free-shipping threshold, bundles); product titles and images in the catalogue; returning-customer flows.

### Direction rules (tool brief)

- **Never state a ROAS, CPA, CAC, CPC or spend figure.** The audit has no ad accounts. Give the direction only, labelled as an estimate ("likely", "expect", "estimated").
- Each checklist point carries an "Ad effect when failing" line. Use it. Do not claim an effect the point does not have.
- Over-count fixes can lower reported ROAS. Say that this is the truth showing, not performance dropping.
- Every failed summary must name ROAS, CPA or CAC, CVR, or the data the platforms optimise on.
- Name who must change the site or tag, so the buyer can forward the point as proof.

### Platforms and terms that matter

- **Meta** (first; leads tracked spend): Pixel, Conversions API (CAPI), Events Manager, Test Events, Pixel Helper; dedupe by event_id (same event name and ID, within about 48 hours [Likely]); Event Match Quality (EMQ); data sharing set to Maximum; fbclid, fbc, fbp; ctwa_clid for click-to-WhatsApp.
- **TikTok:** TikTok pixel, Events API, Test Events, ttclid.
- **Snapchat** (leads reach in KSA, 25.3M adults [Certain] as ad-tool estimate; not tracked spend): Snap Pixel, Conversions API, Snap Pixel Helper, ScCid. Score it; keep Meta first.
- **Google:** Google Ads conversions, gclid, Enhanced Conversions, Consent Mode v2 (four parameters), landing page experience and Quality Score (top scores linked to 30-50% lower CPC [Research]), GA4 to Google Ads link.
- **Terms:** ROAS, MER (blended ROAS), POAS, break-even ROAS (= 1 / margin), CPA or CPP, CAC, nCAC, delivered-order CPA (COD markets), CVR, AOV, CPC, CPM, CTR, LPV, EMQ, CAPI, event_id, key events, UTMs, LTV:CAC, incrementality holdouts.

### Points that should score low for this reader

- Best-practice checklist items with no measured leak: sticky add-to-cart, countdown timers, reviews widget, trust badges, a free-shipping bar taken alone. The card calls this a checklist, not CRO.
- Brand, aesthetic or general UX taste with no funnel or ROAS link.
- Anything that needs ad-account data (spend, CPC, EMQ scores, Events Manager status, match rates). Mark it "not verifiable from audit; check in Events Manager".
- Internal engineering (code, server-container architecture) unless it breaks an event.
- SEO-only, accessibility-only or privacy-text findings, unless the link to ads is real (consent blocking ad tags, link previews used by ads, wording that gets ads rejected).
- GA4 admin settings with no effect on paid optimisation.
- Retention or LTV claims without repeat-purchase data.
- Checkout-step findings beyond the cart on stores where the buyer cannot see checkout (sandboxed Shopify custom pixel, non-Plus). Mark them "not observed".

---

## Differences found

### media-buyer-full.md (Oct 18) vs media-buyer.md (Oct 15)

The two files are different kinds of document. **media-buyer-full.md** is an ICP v2 strategy and sales brief (personas, lever library, outreach copy, scorecard). **media-buyer.md** is the audit reader brief (how to write findings for this reader). Neither replaces the other. Diff by topic:

- **Purpose:** full = who to sell to and how to pitch. Tool = how to phrase findings.
- **Personas:** full has three tiers (Technician, Operator/Bridge, Strategist) and three composite personas (Youssef, Khaled, Rana), all tagged [Inferred]. Tool has one reader.
- **Two questions:** only the tool brief states them. Full section 13 gives a three-step diagnosis (tracking, then site, then media).
- **Numbers:** full has a worked ROAS example (1.88 to 3.20), a COD formula, a "3x ROAS on 30% margin is breakeven" claim and CPM figures. The tool forbids stating ROAS or spend in findings. Treat full's numbers as sales copy, not scoring inputs.
- **Event failure library:** full has 19 causes, each with a confirm step and a fix (Snap, TikTok, Consent Mode v2, ctwa_clid, Shopify custom-pixel sandbox, gateway redirects, Zid double-fire). Tool has only an emphasis list.
- **CRO depth ladder (levels 0-5)** and the **bottom-of-funnel lever library:** full only.
- **MENA table:** full only.
- **KPIs:** full adds nCAC, LTV:CAC, CAC payback and incrementality. Both mention MER, POAS and break-even ROAS.
- **Google:** full covers Quality Score and landing-page experience. Tool mentions Google only as a platform.
- **Ad effect line:** tool only. Full has no equivalent field.
- **Arabic:** tool gives Egyptian-friendly rules and Latin metric names. Full gives Egyptian and Gulf examples and leaves the language split open (section 20, question 4).
- **Audit mapping:** full section 15 maps audit areas to point IDs (GTM-01..25, GA4-06/07, GA4-17..25, W-01..50). Tool names no IDs.
- **Qualification scorecard** (SAR 10k and 50k thresholds), outreach scripts and hooks: full only.
- **Open decisions:** full section 20 lists "customer or channel?" as open. Tool is silent.

### Conflicts

**Media buyer (ICP2 card vs full file vs tool brief):**
1. **Role.** Card section 15 (decided 2026-10-14): customer for tools, referrer for retainer. Full section 20 keeps it open and treats Strategists as customers with budget. Full section 11 adds white-label, which the card does not have. Tool brief is silent.
2. **ICP count.** Full header says "one of three Optimizers ICPs". Card section 14.10 says four (media buyer = ICP2, agency = ICP4). The full file's header is stale.
3. **Who the buyer is.** Card ICP2 section 1: Egypt-based, typically 22-35, junior-heavy, about 25% on Saudi stores. Full Strategist persona Rana is Riyadh-based, runs about SAR 400k/month, and has budget power. These are different buyers. Card section 12.1 treats senior Elevr-calibre buyers ($5K+/month spend) as the paying group.
4. **Fit thresholds.** Full section 18: SAR 10k to 50k+ per store. Card section 14.8: about $3K+/month, which is about SAR 11K. Card section 12.1: Elevr bar of $5K+/month, about SAR 19K. Three different numbers.
5. **Easy Orders.** Card section 13 resolves to "yes, as a separate path". Full sections 8 and 20 still say "decide".

**Store owner (ICP1 card vs tool brief vs full ICP2 file):**
6. **COD share (cross-card).** Card ICP1 section 17.4 gives 10% to under 30% [Guessing]. Full ICP2 file section 12 gives 45-70% of orders in KSA [Research]. These cannot both be used. Do not score on a COD share until one source is confirmed.
7. **Money source.** Tool brief (store-owner.md): money from "the store's own data (GA4, our visit)". Card ICP1 section 9: GA4 is the single source of truth and never estimated traffic. Card section 2 says GA4 is often missing. Use the card's rule: money comes from GA4 only. Our visit can show what the page says, not money.
8. **Regulatory checks.** Card section 17.7 corrects ZATCA relevance (Wave 24, above SAR 375K/yr) and says Maroof has been replaced by the Saudi Business Center (business.sa). Tool brief is silent. Check for the SBC badge, not the word "Maroof".
9. **Paste-ready fixes.** Card section 9 asks for paste-ready fixes per finding. Tool brief says name a menu path only if sure. Not a true conflict, but scorers must not pad findings with invented paths.
10. Minor, no scoring effect: card header ranks ICP1 "1 of 4", while card section 17.10 says "priority #2".

---

## Scoring hints per reader

Rules are for scoring Impact, Actionability and Measurability. Measurability is judged against the tools we have: GA4 OAuth reports; GTM read via service account; headless browser visit; public crawl. No ad accounts. No store admin access.

### Store owner (KPI: sales, conversion, SAR lost)

1. **Impact:** rate by SAR at stake from the GA4 funnel (worst step times sessions times the gap). If GA4 is unavailable, Impact is "unknown", capped at medium, and no SAR figure is given.
2. **Impact:** checkout and payment gaps (no mada, Apple Pay, Tabby or Tamara visible; COD fee hidden) score high only when GA4 shows a checkout or purchase drop. Otherwise medium.
3. **Impact:** missing free-delivery threshold, late shipping cost, or hidden WhatsApp button score high on mobile-heavy stores.
4. **Impact:** Arabic RTL breaks and English on trust moments score high when mobile is most GA4 sessions.
5. **Actionability:** high when the owner can change it in the Salla, Zid or Shopify admin (payment methods, shipping, banners, product titles). Medium when a developer is needed. Low when it needs code.
6. **Actionability:** a finding with no named place, no plain-words fix, and no "done when" check is capped at medium.
7. **Measurability:** visible storefront facts (WhatsApp button, Arabic titles, shipping text, BNPL badges, RTL layout, prices, mobile layout) are high via headless visit and public crawl.
8. **Measurability:** SAR figures and funnel steps are GA4 OAuth only. COD share, payment configuration and theme code are not measurable (no store admin). Mark them "confirm with owner".
9. **Impact:** SEO meta, schema and OG-only findings score low (Salla's analyzer covers them; card section 19.3).
10. **Measurability:** ZATCA and SBC checks are visible-only (the SBC badge on the page). The revenue threshold cannot be checked without GA4 revenue. Show ZATCA only when GA4 revenue is above about SAR 31K/month.

### Media buyer (KPI: ROAS, CAC/CPA, CVR, data quality)

1. **Impact:** a post-click leak on paid landing pages (from GA4 landing-page or campaign data) is high on the ROAS/CAC direction. State direction only, never a number.
2. **Impact:** purchase over-count (duplicate on refresh; app plus GTM plus hard-coded) is high, because it drives scaling into loss. Say reported ROAS may read high.
3. **Impact:** purchase under-count (value, currency or items missing; gateway redirect; COD or WhatsApp orders; consent blocking) is high. Say reported ROAS may read low.
4. **Impact:** Add to Cart firing on the click, or cart that does not add, is medium-high. Needs GTM config or page evidence.
5. **Impact:** link-click to landing-page-view gap is medium at most. Measure with headless timing only, since ad-side LPV data is not available.
6. **Impact:** AOV levers (threshold, bundles, COD-first, missing payment methods) are medium unless GA4 shows an AOV gap.
7. **Actionability:** score by "owner named, done-when present, forwardable". The buyer cannot edit the site or GTM, so a point with no owner is capped at low.
8. **Actionability:** Meta, Snap or TikTok server-side fixes (CAPI, Events API, dedupe) are medium (developer). A GTM tag fix is high if the container is readable.
9. **Measurability:** GTM tags, triggers and variables (service account) plus headless network and dataLayer checks are high for presence and config. Ad-side EMQ, Test Events, Events Manager status and dedupe warnings are not measurable. Mark them "verify in Events Manager".
10. **Measurability:** never score a point that needs ROAS, CPA, CAC, CPC, spend or ad-account data. Checkout steps beyond the cart are not observable (no order is placed), so mark them "not checked".
