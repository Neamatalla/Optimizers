# Store owner report (ICP1): gap audit

Date: 2026-11-12. Branch `feature/store-owner-icp`. Research only: no tracked file changed.
Reader: ICP1, the self-serve GCC store owner ("Tell me what's costing me sales and let me fix it myself").
Measured against: `Downloads/ICP1-Self-Serve-GCC-Store-Owner.md` (the card, cited as §N), `icp/store-owner.md` (the brief), `icp/ICP-PLAYBOOK.md` §3, `icp/research/psych-map.md` (ICP1 principles #N), and the 21 buyer rounds in `ROUNDS-LOG.md`.

## How this was measured

- **Rendered:**
  - `npx tsx src/preview-report.ts --path=tracking --role=store_owner --site --fud --clarity --no-ar --checklist=output/checklist-tharaa.shop.json`. This is the main subject.
  - The same with `--role=media_buyer`, for comparison.
  - `--path=website --role=store_owner --fud --no-ar --checklist=…`: the owner who connects no GA4 and no GTM. The card says this is the common case: "GA4 often missing", and ~76% of Zid stores have no GA4 tag (§19.2).
- **Tools** (all gitignored, under `audit-worker/output/`):
  - `owner-dump.mjs` dumps each section's height and visible text, in EN or AR, at any width, with reduced motion.
  - `owner-shot.mjs` takes screenshots in EN or AR.
  - `owner-gap/textaudit.cjs` counts jargon and sentences over 14 words.
  - `owner-gap/arscan.cjs` scans the Arabic for register markers.
  - Dumps and screenshots are in `output/owner-gap/`: `p-en-*`, `p-ar-*`, `p2-*` (phone 390) and `d-en-*` (desktop 1440).
- **Widths and languages:** phone 390×844 and desktop 1440, English and Arabic.
  - No sideways scroll on the phone (scrollWidth 390).
  - No page errors in any render.

### What the preview can and can't tell us (read before the findings)

The preview is **not** a faithful owner run. Every finding below is tagged:
- **[code]**: comes from `html-report.ts` or other worker code. It happens on every real owner report.
- **[fixture]**: comes from sample data. It must be checked on a real run.

Why the preview falls short:
1. **Wrong checklist.** The fixture uses the **shared checklist ids** (`GA4-01…GTM-25`), not the owner's own points (`SO-GA4-*`, `SO-GTM-*`, `SO-WC-*`, `SO-CRO-*`, `SO-CL-*` in `checklist-persona-data.ts`). The finding text is shared fixture English, not owner voice.
2. **Wrong store and currency.** Currency is **EGP** and the store is "Nour Home & Living" (Egypt). The CRO checklist sample is tharaa.shop, also Egyptian, and it was generated for the **media buyer** (Egyptian register, ad-spend framing).
3. **No AI Arabic.** `--no-ar` (as instructed) leaves AI-written finding text in English in Arabic mode. Only code-written Arabic is judged here.
4. **No mockups.** No screenshots, so the real hero is taller: desktop and phone mockups sit under the headline.
5. **No real owner run exists.** Not one owner report has been rendered from a real run.
   - `output/` has 76 HTML files. None contains an `SO-` id.
   - Round 21 found that "all 50 GA4/GTM checks became generic passes for role-based readers" in production. That bug hit store owners too, and it was only re-verified on a media buyer run.

---

## 0. Top findings (short)

1. **Contradictions a store owner will catch** (card §7: "Three numbers, two currencies, one store", instant distrust):
   - **Seven scoring systems:**
     - the hero: "Passed 28 of 62 checks";
     - the desktop guide: "26/50 passed";
     - "All 50 checks";
     - "Conversion score 54/100";
     - "Checklist score 60%";
     - "10 / 25 passed" and "16 / 25 passed";
     - "Average 44 Mobile".
   - **Two "biggest" leaks:** the hero's phone gap (EGP 16,500–35,400) versus "Biggest leak: cart to checkout" (EGP 7,761–19,400), which is shown 4 times.
   - **"Purchases 369" next to "Conversion rate 1.50%"**: 369 ÷ 20,000 = 1.85%. **[code]**
   - **WhatsApp:** the visit found 1 of 2 WhatsApp links broken. The owner is told "Working: Shoppers can message you on WhatsApp from any page".
   - **No-GA4 route:** the hero says add-to-cart is broken. "What's costing me sales?" answers **"No problem found … 9 checks behind this answer"**, but those 9 GA4 checks never ran. **[code]**
2. **"What you asked, answered" reads backwards.** Three of five answers start "Yes: N problems found":
   - "Does my store work well on phones? **Yes**: 1 problem found."
   - "Can I trust the numbers? **Yes**: 4 problems found."
   - "What's costing me sales, and how much? **Yes**: 4 problems found."

   **[code]** Buyer round 1 removed this section for the buyer for exactly this reason.
3. **Each top fix appears 5–6 times.** Hero, answers (1–2 times), plan, and the GA4 row (summary and detail) all repeat it. The three sources are listed 3 times. Buyer round 4 cut this from 17 duplicates to 1.
4. **The phone page is 89,440px, about 106 phone screens.**
   - The CRO checklist alone is 41,723px (49 screens, **47 % of the page**), with 158 "points to fix".
   - The GA4 and GTM rows render fully open: 25,923px (31 screens). The buyer's are folded: 7,026px.
5. **"Fix it myself" is undermined by the data, not only the layout.** **[code]**
   - On the GA4+GTM route the owner runs 25 GTM points, and **all 25 involve a developer**.
   - The 25 GCC owner points (mada, Apple Pay, Tabby, Tamara, COD fee, delivery cost, free-delivery threshold, WhatsApp, Arabic titles, RTL) only run when the owner connects **nothing** (`persona-checklist.ts`).
   - **0 of 103 owner points name a Salla or Zid place.**
   - The platform detector has no Salla or Zid pattern (`crawl.ts` `CMS_PATTERNS`).
   - The form's `store_platform` is "Not read by the worker" (`types.ts:52`).
6. **"You can do these yourself — In your Salla, Zid or Shopify admin. No code."** holds 7 GA4 Admin / Google Ads / ad-targeting tasks. Examples: "Open the GA4 data stream…", "Link Google Ads to GA4. Import purchase.", "Exclude those countries from ad targeting". `isDiy()` treats `marketing` as DIY. **[code]**
7. **The Arabic is not Gulf in most code-written sections.** **[code]**
   - The CRO checklist section labels are **Egyptian** for every reader: "حرجة: صلّح دول الأول", "نقطة معمولة كويس", "افتح الكارت تشوف لقينا إيه".
   - The conversion review, numbers, GA4/GTM headings, sources, speed and footer are **formal MSA**: "لماذا يغادر المتسوقون", "يكتمل عندما", "منحتنا صلاحية الاطلاع فقط", "تم إعداد هذا التدقيق من قِبل".
   - "شحن" appears 29 times.
   - Three words for "phone": الموبايل ×31, الجوال ×6, الهاتف ×3.
   - The ready-to-paste copy uses Arabic-Indic digits: "أضف ٢٥٠ ج.م".
8. **Internal IDs leak 156 times.**
   - In the friction and GA4 sections: "Follow-up from GA4-01", "(GA4-03)", "Next: GA4-01", "Next: GTM-14".
   - In the checklist: "CP-001 · Page framework (ATIDFA)", "LP-002 · Sales page".
   - In sources: "fud-2.1.0".

   Buyer round 3 removed these for the buyer only.
9. **Collected but never shown to the owner** (detail in §3):
   - from the phone visit: the broken WhatsApp link, sold-out products up front, the checkout log-in wall, the buy button missing from the first phone screen;
   - from Clarity: in-app share, quick-backs, bots;
   - from GA4: best-sellers, top search terms, 90-day daily trend, channel/campaign sales, best hours.
10. **Card needs with no data behind them** (detail in §4):
    - real orders vs GA4 (S6#206: GA4 misses 28 % of orders);
    - COD share and fee in SAR (§4.5);
    - Salla/Zid platform paths;
    - a season line (White Friday is **27 Nov 2026, 15 days from today**);
    - ZATCA / SBC (Saudi Business Center);
    - a WhatsApp route (D3);
    - any reason to come back (D1).

---

## 1. Section inventory: the owner report as it renders today

Order (`renderReport`, non-buyer branch): hero → answers → plan → numbers → friction → CRO checklist → Clarity → keep → checks intro → GA4 → GTM → speed → method → sources, then the CTA band and the footer. Sticky chrome on the phone: top bar 61px plus jump bar 61px = **122px (14 % of an 844px screen)**.

Wow score (1–10), as in buyer round 11: is it about **their sales and money**, is it **surprising**, can they **act on it today, themselves**.

| # | Section (id) | Phone EN / AR px | Phone screens | Desktop px | What it says (quoted) | Wow | Why |
|---|---|---|---|---|---|---|---|
| 1 | Hero `#overview` | 1,770 / 1,660 | 2.1 | 1,305 | "Nour Home & Living is losing about **EGP 16,500–EGP 35,400** a month" · "From your own Google Analytics, last 28 days: sales at stake at this one step, not a promise…" · "Fix these 3 first" (who / Change / Done when) · "What we checked / What we couldn't check" · "Passed 28 of 62 checks" | **8** | Money in their currency, sourced, first screen (headline, source and fix 1 fit in 844px). It loses points because fix 1 is "Your developer", titles are URL paths of 20–23 words ("/collections/sale is the first page for 3,000 visits in 28 days and converts at 0.1%…"), there are 3 "Critical" pills, the score line differs from every other count, and there is no platform path. |
| 2 | Answers `#answers` | 1,937 / 1,793 | 2.3 | 1,240 | "What's costing me sales, and how much? **Yes: 4 problems found.** Biggest: about EGP 16,500–EGP 35,400 a month (GA4 estimate)" · "What can I fix myself…? 10 fixes need no developer" then lists "No campaign data in this GA4 pull." and "tabby.ai / referral (40 visits, 12 sales)…" · "Does my store work well on phones? Yes: 1 problem found." · "Can I trust the numbers…? Yes: 4 problems found." | **3** | Repeats the hero's top 3. Three answers read backwards. The DIY list shows GA4 admin chores. On the no-GA4 route it says "No problem found" for money (false). |
| 3 | Your action plan `#fix-first` | 5,055 / 5,002 | 6.0 | 3,758 | "23 fixes, biggest money first. 10 you can do yourself in your store admin…" · KPIs "Conversion rate 1.5% · Average order value EGP 1,100" · "You can do these yourself — In your Salla, Zid or Shopify admin. No code." (8 shown, 2 hidden) · "Send these to your developer — Copy each one as it is" (8 shown, 5 hidden) | **6** | The split by who, and "Done when" on every fix, fit the card (#44, #23). But the DIY group is GA4/Ads work, the hero's 3 fixes repeat, 23 fixes overwhelm (§7), and there is no menu path and no copy button for the developer pack. |
| 4 | Numbers `#numbers` | 953 / 929 | 1.1 | 654 | "Nour Home & Living in the last 28 days" · Visits 20,000 · Purchases 369 · Conversion rate 1.50% · Revenue EGP 330K · funnel "Product views 15,000 → 8% continue → Added to cart 1,200 → 41% continue → Checkouts started 492 → 75% continue → Purchases 369" · "For every 1,000 product views… about 25 sales" | **5** | Their own numbers, but no verdict, no money on the leak, no phone vs computer, no best-sellers. 369 purchases don't match 1.50 %. It is the only chart for the owner. |
| 5 | What stops your shoppers buying `#friction` | 5,205 / 4,558 | 6.2 | 3,598 | "We visited your homepage, product page, cart on a phone… Conversion score 54/100." · yellow box "**Follow-up from GA4-01** · Why shoppers leave at your cart…" · groups "You can do these yourself 2" / "Needs your developer 8" / "Already working (2)" · cart crop, "Copy you can use: Add 250 EGP more for free delivery / أضف ٢٥٠ ج.م للحصول على توصيل مجاني" | **7** | The most "fix it myself" section: their own cart on a phone, ready copy. Loses points for IDs, "Stop revenue loss / Quick win / Trust & cost" chips, MSA labels, a DIY card that says "Send this to your developer", two "not checked" notes, and the 41 % vs 31 % contradiction. |
| 6 | The full CRO checklist `#cro-checklist` | **41,723 / 38,528** | **49.4** | 32,843 | "Optimizers' manual CRO audit has 377 points. 193 of them apply…" · "60% Checklist score" · "158 points to fix · 2 critical points failing · 35 points done well" · 11 tab bars · filter chips · "Critical: fix these first **9**" · 158 cards with "CP-001 · Page framework (ATIDFA)", "The checkpoint: Attention: the first screen has a value proposition…" | **3** | Each card is good CRO advice, but this is half the page. 158 to-dos for a team of 1–5, 9 cards on the same rating mismatch, IDs and English checkpoint text, Egyptian labels. The fixture is written for a buyer: "When paid visitors land and leave here, the ad spend is wasted". |
| 7 | Clarity `#clarity` | 523 / 467 | 0.6 | 383 | "From your own Microsoft Clarity, last 3 days, 6,810 sessions, 96.5% on phones." · "Taps on things that do nothing: 8% of sessions on /products/sample against 3.5%…" · "Errors on your pages: 4.6% of sessions…" · "shoppers scroll 35.4% of the way down a page…" | **5** | Their own shoppers' behaviour, and the scroll line is actionable. But "sessions" jargon, a URL path not a product name, no tile design, no link to a fix, and the 96.5 % phone share contradicts GA4's 85 %. Leaves out in-app share (55.8 %), quick-backs and bots, which the buyer gets. |
| 8 | What's working: keep it `#keep` | 726 / 671 | 0.9 | 508 | "These are helping your sales right now." then "✓ Of 15,000 people who viewed a product, 1,200 added to cart (8%…): **a 92% drop-off**" · "✓ …369 bought (75%…): a 25% drop-off" · "✓ 5,000 visits in the last 7 days…; 12 active users" · "✓ All funnel events record: view_item, add_to_cart…" · "✓ 300 purchase events, 300 transactions, EGP 330,000 revenue" · "✓ No email or phone found in the 4 page paths read." | **2** | A "92 % drop-off" called "helping your sales". Event names. A privacy pass that reads like "your phone number is missing". 300 vs 369 purchases. |
| 9 | All 50 checks (intro + map) `#checks` | 878 / 827 | 1.0 | 612 | "All 50 checks · 6 critical · 6 medium · 12 low · 26 passed · GA4 · GTM · Each square is one check…" · filters "All 50 / Need work 24 / Critical 6 / Passed 26" | **2** | A reference map. "50" conflicts with the hero's "62". |
| 10 | Google Analytics 4 `#sec-ga4` | 14,091 / 13,816 | 16.7 | 10,259 | "10 / 25 passed · Google Analytics 4 is the tool that counts your visitors and sales…" · groups "Where the funnel leaks money", "Where traffic is wasted", "Bigger orders and repeat buyers", "Can the numbers be trusted", "Protect the account" · every row open, with "Send this to your developer:", "Owner", "Done when", "Impact", "Next: GA4-01", "Technical details" | **3** | All of it repeats rows 1–3. Every row is open, nothing is folded. Event names and IDs show. Passed rows repeat their own sentence ("Keep: … Keep it that way while the fixes above go in." 26 times). |
| 11 | Google Tag Manager `#sec-gtm` | 11,832 / 11,551 | 14.0 | 8,491 | "16 / 25 passed · Google Tag Manager loads the tracking codes on your site…" · "Each purchase counted once: not in place on example.com." · "Fire purchase tags on the dataLayer purchase event. Send transaction_id with them." | **1.5** | Developer territory. In a real owner run, all 25 SO-GTM points involve a developer (23 are developer-only). |
| 12 | Page speed `#speed` | 1,331 / 1,303 | 1.6 | 664 | "Google's own speed test scores each page out of 100… This score is separate from your 50 checks." · "Average 44 Mobile 77 Desktop" · "Product page https://example.com/products/best-seller 35 Mobile 66 Desktop" | **4** | Their slowest page (product page, 35) is the likely cause of the hero's phone gap. The report never connects them. Scores out of 100, not seconds or sales. Raw URLs. Sits at the end. |
| 13 | How this audit works `#method` | 650 / 580 | 0.8 | 580 | "Source: Your Google Analytics, last 28 days." ×5 (same as the hero strip) · "Money figures come only from your Google Analytics: the gap between a funnel step and its benchmark…" · "Points that depend on settings inside your store admin say so." | **2** | Repeats the hero strip. The money method sentence is wrong for 3 of the 4 money figures shown (phone vs computer, landing page vs average, product vs average). |
| 14 | Where this data came from `#sources` | 564 / 506 | 0.7 | 430 | "Your Google Analytics 4 account (you gave us read-only access)" · "A phone visit to 3 of your pages… Purchase-friction rules fud-2.1.0." · "Pages we checked" + 4 URLs | **1.5** | The third copy of the sources. Leaks a version string. "3 pages" conflicts with the checklist's checkout and landing tabs. |
| 15 | CTA band | 535 / 433 | 0.6 | 417 | "Short on time to fix these? Optimizers, the team behind this audit, can make these fixes for you. Book a free call…" · "Book my free call" | **4** | Calm, no pressure (#45). No WhatsApp route (§2: WhatsApp 89.4 % vs email 11.7 %; D3 still open). |
| 16 | Footer | 947 / 947 | 1.1 | 376 | "CRO agency for e-commerce brands in the GCC." · "Ras Al Khaimah… · Office Business Hub, New Cairo, Egypt · +971… · +20…" · "A/B Testing", "ROI Calculator" | **1** | Agency site footer, nearly a full phone screen. "CRO" jargon. An Egyptian address and number shown to a Saudi owner. |
| | **Total** | **89,440 / 84,293** | **106** | **66,939** | | | |

Comparisons:
- **Buyer report, same fixture:** 83,054px on the phone. Its GA4 + GTM is 7,026px (folded, failed rows moved to lanes; rounds 2 and 4) against the owner's 25,923px. Its hero is 3,010px but holds the whole diagnosis.
- **No-GA4 owner** (`--path=website`): 77,431px.
  - Hero 1,497, answers 1,282, plan 2,910, friction 4,297, CRO checklist 41,723, checks intro 811, "Website Code & DevTools" 20,542, speed 1,331, method 487, sources 506.
  - No numbers, no Clarity, and no "keep it" (it needs 2 or more live passed points).
- **Where the length goes (owner, phone):** 74 % of the page is reference material (checklist 47 %, GA4 + GTM 29 %). The first three sections (hero, answers, plan = 8,762px, 10 screens) show the same failed points three ways.

### Wow-ordered view (what a round-11-style reorder would start from)

1. Hero (8)
2. Friction, with crops and paste-ready copy (7)
3. Plan (6)
4. Numbers (5)
5. Clarity (5)
6. Speed (4)
7. CTA (4)
8. Answers (3)
9. CRO checklist (3)
10. GA4 (3)
11. Keep (2)
12. Checks intro (2)
13. Method (2)
14. GTM (1.5)
15. Sources (1.5)
16. Footer (1)

Today's order matches this except for two things:
- answers sit second;
- friction sits after numbers, and is followed by a 49-screen checklist that pushes Clarity, "keep it" and speed past screen 67.

---

## 2. Problems

### 2.1 Contradictions (buyer rounds 1 and 6 found the same kind)

| # | Where | What the owner reads | Why it's wrong | Type |
|---|---|---|---|---|
| C1 | Hero, guide, checks, TOC, friction, checklist, speed | "Passed 28 of 62 checks" · guide "26/50 passed" · "All 50 checks" · "Conversion score 54/100" · "Checklist score 60%" · "10 / 25 passed" · "16 / 25 passed" · 11 tab percentages (40–83 %) · "Average 44 Mobile" | **Seven scoring systems** for one store. The hero's 62 = 50 checks + 12 conversion rules. Buyer round 1 found the same ("28 of 56" vs "All 50"). PRODUCT.md: no hero score. Card §7. | code |
| C2 | Hero vs plan, friction, GA4 | Hero: biggest = phones, EGP 16,500–35,400. Plan, friction box and GA4 row: "**Biggest leak**: cart to checkout", EGP 7,761–19,400 | Two "biggest". The GA4-01 fact sentence means "biggest gap against benchmark"; the hero means "biggest money". | code (fact text in `ga4-facts.ts`) |
| C3 | Numbers | "Purchases 369" next to "Conversion rate 1.50%" (20,000 visits) | 369 ÷ 20,000 = 1.85 %. `numbersSectionHtml` takes purchases from the funnel's `purchase` event count but the rate from `ga4Metrics.conversionRate` (300 conversions). "Keep it" then says "300 purchase events, 300 transactions". | code |
| C4 | Numbers vs hero fix 2 | Funnel "8% continue" (product to cart) vs "against **6.5%** across your products" | Event-level and item-level add-to-cart rates, both shown as the store average, unlabelled. | code + fixture |
| C5 | Friction | Box: "Of 1,200 people who added to cart, 492 started checkout (41%…)". Card below: "Your GA4: only **31%** of add-to-carts went on to start checkout" | Two rates for one step, side by side. The FUD finding's GA4 line should be code-written from the same number. | fixture (guard needed) |
| C6 | "Keep it" | "✓ … a 92% drop-off", "✓ … a 25% drop-off", "✓ 12 active users at the time of the audit", "✓ No email or phone found in the 4 page paths read." | A drop-off presented as "helping your sales". A privacy pass that reads like a missing contact number. `keepItHtml` takes the first 6 live passes by severity with no reader filter. | code |
| C7 | Friction "Already working" | "Working: Shoppers can message you on WhatsApp from any page" | `siteChecks.contactLinks` has **1 of 2 WhatsApp links broken**. The buyer sees "WhatsApp links: 1 of 2 broken"; the owner never does. Card §16 #4: "The WhatsApp button must be visible". | code (owner has no visit block) |
| C8 | Hero scope strip vs checklist | "What we couldn't check: Checkout after the cart (we never place an order)" vs "Checkout 76% · 6 to fix", "Checkout has no one-tap payment buttons at the top" | Round 19 opens the first checkout screen. The scope strip predates it. Sources say "A phone visit to 3 of your pages", but the checklist has Checkout and Landing pages tabs. | code |
| C9 | No-GA4 route, answers | Hero: "Add to cart works: not in place" (Critical). Answer: "What's costing me sales, and how much? **No problem found.** No big leak in the funnel steps we could measure. **9 checks behind this answer**" | The 9 points are GA4 points that didn't run. `questionsHtml` counts `q.points.length` whether or not the route ran them. A false all-clear is the card's #1 trust killer (§7: "a finding they can disprove"). | code |
| C10 | Answers | "Does my store work well on phones? **Yes**: 1 problem found." · "Can I trust the numbers in my dashboard? **Yes**: 4 problems found." · "What's costing me sales, and how much? **Yes**: 4 problems found." | "Yes" answers the question the wrong way round in 2 of them, and doesn't fit a what/how-much question. Buyer round 1 found "Is it the ads or the site? **Yes**". Arabic: "نعم: وجدنا 4 مشكلات". | code |
| C11 | Plan DIY group | Lead: "In your Salla, Zid or Shopify admin. **No code.**" Items: "Open the GA4 data stream. Add those sites to the unwanted referrals list." · "Mark purchase… as key events" · "Add UTM tags to every link" · "Exclude those countries from ad targeting" · "Create cart-abandoner… audiences and share them with Google Ads" · "Link Google Ads to GA4. Import purchase." | 7 of the 8 shown are GA4 Admin or Google Ads tasks, not store admin. `isDiy()` = owners without `dev`, so `marketing` counts as DIY. | code |
| C12 | Friction DIY group | Group "You can do these yourself", card says "**Send this to your developer**: Add a free-shipping progress line…", Owner "Store owner + Developer" | Band `quick_win` puts it in DIY; the owner list includes dev, so `actionBlockHtml` says "send to developer". | code |
| C13 | Hero source, method | "sales at stake at this one step" · "Money figures come only from… the gap between a funnel step and its benchmark" | The hero figure is the **phone vs computer** gap. Fixes 2 and 3 compare against the **store average**. Only "cart to checkout" is a funnel step against a benchmark. | code |
| C14 | Clarity vs GA4 | "6,810 sessions [in 3 days], 96.5% on phones" vs GA4 "20,000 visits [28 days]", phones 17,000 of 20,000 = 85 % | Two traffic sizes (Clarity's rate would be about 63,500 per 28 days) and two phone shares, with no line explaining why (bots, consent, sampling). | fixture, but real stores differ too: needs a reconcile line |
| C15 | CRO checklist | "**2** critical points failing" vs "Critical: fix these first **9**" · bar "Homepage 35 to fix" vs group "34 to fix", "Product page 35" vs "34", "Cart 13" vs "11", "Checkout 6" vs "5", "On a phone 2" vs "1", "Copy 14" vs "12", "Landing 15" vs "14" | `criticalFailing` counts badly/missing only. The critical group holds any non-"well" Critical. Bars count critical cards that the groups moved out. **7 of 11 tabs disagree with their own group.** | code |
| C16 | GA4 passed row vs friction | "Average order value is EGP 1,100. The store's pages weren't visited this run, so the free-shipping threshold is unknown." (Passed) vs friction copy "Add 250 EGP more for free delivery" | The visit happened. The preview passes no evidence to the fact. A real run should pass it: verify. | fixture |
| C17 | Money notation | "EGP 16,500" · "EGP 330K" · "EGP 330,000" · "LE 1,399" · "٢٥٠ ج.م" · "EGP 7,761" (exact, the others rounded) | Four notations for one currency, and two rounding rules. Card §9: "one currency notation everywhere (R15)". | code + fixture |
| C18 | No-GA4 hero | "Connect Google Analytics **on your next audit** to see what each fix is worth" | D1 (2026-10-20): one free audit per site, ever. There is no next audit. | code |

### 2.2 The same finding shown in several places (as in buyer round 4)

| Item | Times on the page | Where |
|---|---|---|
| "EGP 16,500–EGP 35,400" | 6 | hero h1 and fix tag, answers, plan, GA4 row ×2 |
| "Phones convert at 1.2% (17,000 visits)…" | 6 | hero, answers ×2, plan, GA4 ×2 |
| "/products/best-seller was viewed 6,000 times…" | 6 | hero, answers ×2, plan, GA4 ×2 |
| "/collections/sale is the first page…" | 5 | hero, answers, plan, GA4 ×2 |
| "tabby.ai / referral (40 visits, 12 sales)…" | 5 | answers ×2, plan, GA4 ×2 |
| "Biggest leak: cart to checkout" / "EGP 7,761" | 4 / 4 | plan, friction box, GA4 ×2 |
| "492 started checkout" | 4 | friction box, GA4 ×3 (GA4-01 and GA4-03 both shown in checks; `dedupeFunnel` only applies to the hero and plan) |
| "Key events: purchase, page_view" | 4 | answers, plan, GA4 ×2 |
| "Shoppers first see the shipping cost at checkout" | 3, plus 2 checklist cards on the same issue | answers, friction ×2; checklist "Shipping cost stays hidden until the payment step", "Shipping cost is not shown until checkout" |
| The 5 data sources | 3 lists | hero scope strip, method ("Source: …" ×5), sources section |
| Passed row sentence | 2 per row, 26 rows | summary, then "Keep: [same sentence]. Keep it that way while the fixes above go in." |
| "Cart shows the full cost clearly" not checked | 2 | "Not checked this time" in the box, "Not confirmed this time" at the end |
| Checklist rating mismatch | 9 cards | "Store shows four different ratings…", "Rating claim says 4.7 from 2,982 customers, page shows 4.4", "Different rating numbers on different pages look unreliable", "Star rating sits under buttons, and the numbers don't match", "…ratings clash" ×3, "…rating conflicts", "…ratings don't match" |
| Checklist "no payment logos" | 7 or more cards | buy button, cart, closing block, mid-page button, footer… |
| Friction vs checklist topic overlap | 6 topics | shipping cost, returns, reviews, size chart, payment logos, instalments |

The three opening sections (hero 1,770 + answers 1,937 + plan 5,055 = **8,762px, 10 phone screens**) show the same failed points three ways. Card §14 #8 asks to "merge duplicates (R04)".

### 2.3 Numbers with no label or no source (as in buyer round 6)

- **"benchmark 50%"** appears 19 times. Whose benchmark is it? The card says "Peer benchmarks must come from our own audit data, labelled as ours" (§17.4).
- **"Conversion score 54/100"**: no rules named, no scale given.
- **"60% Checklist score — Well 3 · adequately 2 · badly 1 · missing 0 points, like the manual audit."**: scoring mechanics, not meaning.
- **"Estimated gain: EGP 7,761–EGP 19,400 a month"** on every money row: no basis on the row, odd precision.
- **"12 active users at the time of the audit"**, **"(2.0×; a healthy store sees about 2×)"**, **"35.4% of the way down"**: no meaning attached.
- **KPI formats:** "Conversion rate 1.5%" in the plan, "1.50%" in numbers.
- **"Average 44 Mobile 77 Desktop"**: an average of page scores, not tied to sales.
- **Money tag "/ month"**: never says "at stake" or "from GA4". Only the h1 has a source line.

### 2.4 Jargon a store owner won't know (card §3: "money language, not metrics"; brief: "No analytics or ad jargon")

Counted on the English phone page, visible text only, closed cards excluded (`textaudit.cjs`):

| Term | Count | Examples |
|---|---|---|
| Internal IDs | **156** | 149 in the checklist ("CP-001 · Page framework (ATIDFA)", "LP-002 · Sales page", "PDP-028 · Buy box"); "Follow-up from GA4-01", "(GA4-03)", "Next: GA4-01", "Next: GTM-14", "This is the biggest leak (GA4-01)" |
| tag / trigger / container | 63 | "Move conversion tags to custom-event triggers", "Your Google Tag Manager container" |
| H1 / CTA / PDP / above the fold | 58 | checklist checkpoint text (English only) |
| Event names | 43 | "Keep: view_item→add_to_cart at or above 8%", "All funnel events record: view_item, add_to_cart, begin_checkout, purchase", "transaction_id" |
| GA4 (bare) | 34 | "No campaign data in this GA4 pull.", "Unassigned visits under 5% in GA4" |
| benchmark | 19 | see 2.3 |
| consent | 17 | "Move the consent default to the Consent Initialization trigger" |
| funnel | 12 | "Fix the page behind the worst funnel step first" |
| Conversion review | 10 | names a section that is titled "What stops your shoppers buying" |
| key events | 8 | "Mark purchase (and lead, if used) as key events" |
| pixel | 8 | "Pixels for the channels you pay for" |
| referral | 7 | "tabby.ai / referral" |
| sessions | 5 | Clarity section (buyer round 6 changed these to "visits", for the buyer only) |
| Opportunity chips | 62 | "Stop revenue loss" 24, "Revenue gain" 16, "Benefit gain" 15, "Risk reduction" 7, including on **passed** rows (buyer round 3 removed them for the buyer) |
| "Technical details" toggles | 56 | every row |
| Other | | "fud-2.1.0" (sources), "Website Code & DevTools" (no-GA4 category title), "Page jumps while loading (CLS)" (no-GA4 answer), nav chips "GA4", "GTM", "CRO checklist", "Conversion" |

### 2.5 Long sentences (over 14 words; round 12 rule)

- **133 of 1,058 sentences** (12.6 %) are over 14 words.
  - By section: hero 5 of 31, answers 7 of 28, plan 8 of 87, friction 12 of 52, CRO checklist 56 of 514, GA4 25 of 155, GTM 7 of 134, Clarity 3 of 7, method 3 of 11.
- **Finding titles are the worst**, because titles are what a phone reader scans:
  - "/collections/sale is the first page for 3,000 visits in 28 days and converts at 0.1%, against a store average of 1.5% (2 sales)" (23 words, 4 lines at 390px);
  - "tabby.ai / referral (40 visits, 12 sales) appear as traffic sources, taking credit for 12 sales that belong to the ad or channel that brought the shopper." (27 words).
  - These come from `ga4-facts.ts` sentences reused as titles **[code]**.
- **Code-written examples:**
  - hero source line (25 words);
  - method "Money figures come only from your Google Analytics: the gap between a funnel step and its benchmark, turned into sales for that step." (23 words);
  - Clarity "Anything you need them to see (price, delivery, payment logos) should sit above that point on the phone." (18 words);
  - speed lead, CTA and checks intro (15 words each).

### 2.6 Arabic: MSA and Egyptian where the brief says Gulf/Saudi

Code-written strings only. The AI text is English in this render.

| Section | Register | Quotes |
|---|---|---|
| Hero, plan | **Gulf, good** | "وش تغيّر", "تعرف إنه انحل لما", "المطوّر حقك", "ابدأ بهالثلاث", "أنت، من لوحة تحكم متجرك" |
| Answers | MSA | "نعم: وجدنا 4 مشكلات." · "و1 أخرى في البنود أدناه." |
| Numbers (shared with every reader) | MSA | "مأخوذة من حساب تحليلات جوجل الخاص بك أثناء التدقيق." · "يواصل 8%" · "عمليات الشراء" · "بدء إتمام الشراء" · "يحقق … نحو 25 عملية بيع" |
| Friction (shared labels) | MSA | "لماذا يغادر المتسوقون عند سلة التسوق" · "السبب الأرجح وما يجب تغييره" · "لم يتم فحصها هذه المرة… افحصها يدويًا قبل العمل على هذه الخطوة" · "سلة التسوق لديك على الهاتف، يوم إجراء التدقيق" · "نص يمكنك استخدامه" · "المسؤول" · "يكتمل عندما" · "الإجراء" · "الأثر" · "إيقاف خسارة الإيرادات" · "مكسب سريع" · "يعمل بالفعل" |
| CRO checklist (same strings for every reader) | **Egyptian** | "حرجة: صلّح دول الأول" · "النقط اللي بتضيّع أكتر مبيعات" · "نقطة محتاجة إصلاح" · "نقطة معمولة كويس" · "افتح الكارت تشوف لقينا إيه، وليه مهم، وإزاي تصلحه" · "اللي لقيناه" · "ده معناه إيه" · "إزاي تصلحها" · "تعرف إنها اتصلحت لما" · "محتاجين إصلاح · معمولين كويس" (`html-report.ts:1281–1347`) |
| GA4 / GTM headings (`checklist.ts` group names) | MSA | "تحليلات جوجل 4 هي الأداة التي تحسب زوارك ومبيعاتك…" · "أين يخسر مسار الشراء المال" |
| Speed, sources, footer, CTA, guide | MSA | "تحتاج إلى تحسين" · "حساب تحليلات جوجل 4 الخاص بك (منحتنا صلاحية الاطلاع فقط)" · "الصفحات التي فحصناها" · "تم إعداد هذا التدقيق من قِبل" · "هذه الإصلاحات" · guide end stop "لنصلحها معًا" |

Other Arabic problems:
- **"شحن"** appears 5 times in the friction section and 24 times in the checklist. The brief says توصيل.
- **Three words for phone:** الموبايل ×31, الجوال ×6, الهاتف ×3.
- **Product names in two forms:** "Google Analytics" (hero, plan) vs "تحليلات جوجل 4" (numbers, GA4 header, sources); "Google Tag Manager" vs "مدير علامات جوجل".
- **Money in Arabic** shows the Latin code ("EGP 16,500–EGP 35,400 شهريًا"). `moneyRange()` has no Arabic form, while `insightsHtml` uses `formatMoney(…, true)`. Two forms on one page.
- **Arabic-Indic digits in ready-to-paste copy:** "أضف ٢٥٠ ج.م", "خلال ١٤ يومًا".
  - The register rule says Western digits.
  - The FUD judge's `exampleCopy` rule asks for "Gulf/Egyptian-friendly Modern Standard Arabic" (`fud/judge.ts:150`), not the store's own dialect.
  - Card §16: "Copy is rewritten into Saudi dialect (S7#256)".
- **English inserted into Arabic:** `translate-ar.ts:107` adds the English name in brackets on first use ("معدل التحويل (Conversion Rate)"). Card §7: English on Arabic trust moments = "not built for me".
- **Bidi break:** "(GA4-03):" splits into "(-GA4" … "03):" in the Arabic follow-up box (phone screenshot `p2-ar-0.png`).
- **The checklist's "The checkpoint:" and "Check it yourself:"** stay English in Arabic mode (round 18 known limit).
- **Fixture check:** the AI-written checklist Arabic is Egyptian ("الزبونة", "اطلبيه دلوقتي" from the store, "بتقرر"). A real owner run gets the Gulf rule (`manual-checklist.ts:97`). This must be confirmed on a real run.

### 2.7 Internal IDs and versions leaking (buyer round 3 fixed these for the buyer only)

- `ga4FollowUpHtml`: "Follow-up from GA4-01", "Most likely cause and what to change (GA4-03):".
- `handoffLink`: "Next: GA4-01", "Next: GTM-14", in Arabic "الخطوة التالية: GA4-01".
- Fact text: "This is the biggest leak (GA4-01)".
- Checklist: `ck-id` "CP-001 · Page framework (ATIDFA)" on every card (149 on screen, more in closed cards).
- Sources: "Purchase-friction rules fud-2.1.0".

### 2.8 Buyer-ish or irrelevant for a store owner

- **On the GA4+GTM route the owner runs 25 SO-GTM points.**
  - All 25 involve a developer; 23 are developer-only.
  - Examples: "Ad pixel loads before its events", "Triggers don't depend on switched-off settings", "Pages that change without reloading are still counted", "Visits to missing pages are recorded", "Old agency and campaign tags removed".
  - The playbook rule was "developer-only items impact ≤ 1 for this reader". Omar kept GTM at 25 on 2026-10-20.
  - Meanwhile the **19 do-it-yourself SO-CRO points never run on this route** (`personaChecklistFor`: WEBCODE+CRO only when `tools.length === 0`).
- **DIY plan items are ad-account work:** audiences for Google Ads, linking Ads, excluding countries "from ad targeting", UTM tags. The owner is reached *through* their media buyer (card §16, §18.3). These belong in a "send to whoever runs your ads" handover, not "No code, in your Salla admin".
- **CRO checklist cards (fixture)** talk ads: "When paid visitors land and leave here, the ad spend is wasted", "You pay for the click, but many leave…". The Landing pages tab (15 to fix) is buyer material.
- **"Can I trust the numbers in my dashboard?"** answers with tracking findings ("Each purchase counted once: not in place", "Key events: purchase, page_view"). The owner's dashboard is Salla/Zid. Card §3: "reads Salla/Zid dashboards daily and judges us against them". Nothing compares GA4 with that dashboard.
- **Footer:** agency services ("A/B Testing", "ROI Calculator"), a Cairo address and a +20 number.

### 2.9 Phone layout (375–390px; card §9 "Mobile-legible report at 375px")

- **106 phone screens** in EN (84,293px in AR).
  - The CRO checklist is 49 screens, and its scorecard alone is 1,303px before the first card.
  - GA4 + GTM rows are open: 31 screens. The buyer's are folded to one line each: 8.3 screens.
- **Sticky chrome is 122px** (14 % of the screen).
- **The jump bar has 9 chips:** Summary · Your plan · Numbers · Conversion · CRO checklist · GA4 · GTM · Speed · Sources.
  - It leaves out "Your questions", "Clarity", "Keep it" and "How it works".
  - It uses jargon for the chip names.
  - Buyer round 11 made the buyer's bar follow the page order.
- **Titles:** URL-path titles wrap to 3–4 lines. The speed cards print full URLs ("https://example.com/collections/all").
- **First screen works:** headline, source line, "Fix these 3 first" and all of fix 1 fit in 844px (`p-en-0.png`). But fix 1 is "Your developer".
- **Desktop TOC** carries scores ("Conversion review 54/100", "Google Analytics 4 10/25", "Google Tag Manager 16/25").
- **No sideways scroll** at 390 in EN, AR or no-GA4. **No page errors.**

### 2.10 Missing "who does it" and "where in Salla / Zid / Shopify"

- **Platform paths:**
  - The brief: "Name the place in their platform when you know it ("in Salla: Settings > Shipping"…)".
  - The card §9: "Platform paste-in fixes for Salla / Zid / Shopify, tied to each finding".
  - The report: the only platform words are the group lead "In your Salla, Zid or Shopify admin. No code." No fix names a menu.
- **Owner points:** **0 of 103 SO-* actions name Salla or Zid**; 1 names Shopify ("Settings > Customer events"). 65 of 103 involve a developer.
- **We can't tell which platform the store is on:**
  - `crawl.ts` `CMS_PATTERNS` knows Shopify, WooCommerce, WordPress, Wix, Squarespace, Webflow, Magento and BigCommerce, but **not Salla or Zid** (round 21: "The platform shows as unknown").
  - The form's `store_platform` (Intellia) is stored but "Not read by the worker" (`types.ts:52`).
- **"Who" has four values and the owner sees two:**
  - The owner sees "You, in your store admin" or "Your developer".
  - Marketing tasks (whoever runs the ads) are labelled "You, in your store admin".
  - Content tasks are labelled the same, with no hint of who writes the copy (card §3: "Writes their own copy… no copywriter").
- **No developer pack:** buyer round 2's "Copy the tracking fixes" ticket button has no owner equivalent, even though the plan says "Copy each one as it is".

---

## 3. Collected but not used for the owner (as in buyer round 9)

| Data (where it lives) | Collected by | Owner report today | What the ICP1 card says the owner would get from it |
|---|---|---|---|
| WhatsApp / tel links and whether each number is valid (`siteChecks.contactLinks`) | phone visit | **Not shown.** The friction section says WhatsApp works | §16 #4 "The WhatsApp button must be visible"; §2 WhatsApp 89.4 %; a broken WhatsApp number is a lost order today, and a fix they can make in 2 minutes |
| Add to cart worked on our visit (`siteChecks.addToCart`) | phone visit | Only as a GTM/website finding on some routes | §9: proof they can repeat on their own phone; trust (§15 "honest unavailable states") |
| Sold-out products promoted up front (`soldOutPromoted`) | phone visit | Not shown (SO-CRO-19 only on the no-tools route) | Wasted visits on products nobody can buy; a store-admin fix (hide or sort sold-out) |
| Autoplay video on the phone first screen (`heroVideoMobile`) | phone visit | Not shown (SO-CRO-25 no-tools only) | §3: mid/low-end Android on slow data |
| Ad landing pages: first phone screen crop, price and buy button in the first screen, H1 (`siteChecks.landing`) | phone visit (round 20) | Buyer only | SO-CRO-06 "Add to cart is in the first phone screen"; a picture of *their* page beats a rule ("before/after mockups", §15) |
| First checkout screen: log-in wall, coupon field (`siteChecks.checkout`) | phone visit (round 19) | Only inside checklist cards; the scope strip says checkout wasn't checked | Zid's log-in wall (round 21: sso.zid.store) is an owner setting (guest checkout); §16 #1 payment-step drop |
| Platform guess (`siteChecks.platform`, `crawl.cmsPlatformGuess`) and the form's `store_platform` | crawl + form | Not used to word fixes | §9, brief: "in Salla: Settings > Shipping" |
| Pixel map, signal quality (`pixelMap`, `signal`) | phone visit | Buyer only | Low for the owner, except "Meta pixel installed twice → Meta counts double" (SO-GTM-05) in plain words |
| Clarity in-app browser share (`inAppShare`, `inAppBrowsers`; sample 55.8 % Facebook / Instagram / TikTok) | Clarity | Buyer only | §2 and §17.2: Instagram 53–69 %, TikTok 30–44 %, Snapchat 30–37 % of GCC stores' channels; "test your checkout inside Instagram" is a DIY check |
| Clarity quick-backs (13.2 %), rage clicks, bots (18.6 %), top pages, phone vs computer behaviour (`byDevice`), engagement time, countries, referrers | Clarity | Only dead clicks, script errors and scroll depth (3 lines) | §19.4: Clarity is free on Salla, so the report must show **what Clarity can't** (money, ranked fixes) and tie behaviour to a fix. Bots → "your conversion rate looks lower than it is" (§5 pain 2, believable numbers) |
| GA4 `dailyTrend`, 90 days (visits, engaged, sales per day) | GA4 OAuth (P14/P15) | Only inside spike/no-data facts | §6 seasonal urgency, §17.5: show the last peak and the White Friday run-up; §16 "dip from the 11th, recover around the 20th" (salary week) |
| GA4 `itemSales`, `itemFunnel` (revenue, units, views, adds per product) | GA4 OAuth | Only the single worst product (GA4-10) | §4.1 "what's costing me sales": best-sellers and the products that leak. **Item names tell whether product titles are in Arabic** (§16 #3, S6#203: Gulf sales come from Arabic titles), with no extra collection needed |
| GA4 `searchTerms` (what shoppers type) | GA4 OAuth | "800 searches in 28 days." | "What your customers look for" (stock, titles, Arabic spelling): a store-admin action |
| GA4 `trafficSources` and `campaigns` with revenue (channel / source / medium / campaign) | GA4 OAuth (round 14) | Buyer only; the owner gets the worst campaign as one finding | §2: Instagram 53 %, TikTok 30 %, Snapchat ~30 %; §17.6 Snapchat is the #1 reach channel in KSA; "which channel brings sales in SAR" is the owner's version of the buyer's campaign cards |
| GA4 `dayOfWeek × hour` (GA4-16) | GA4 OAuth | "Too few sales by hour and weekday to judge." (shown as passed) | SO-GA4-25 "Hours and days your store sells best": when to send WhatsApp broadcasts and run offers (§2 WhatsApp-first) |
| GA4 device sessions, conversions and revenue (`deviceConv`) | GA4 OAuth | One sentence (GA4-05) | §3 phone-first: a phone vs computer tile with money; link to the product page's phone speed (35/100) |
| GA4 country × device, country conversions | GA4 OAuth | "Germany (1,500 visits)…" | §2 GCC markets: share of sales per GCC country (KSA / UAE / KW) and currency fit; §16 #2 currency switching by IP |
| GA4 funnel incl. `add_shipping_info` / `add_payment_info` | GA4 OAuth | Collected; the numbers funnel shows only the narrowing steps; no payment-step line | §16 S6#166 "85 % drop between payment info and purchase", §16 #1 payment-step drop |
| GA4 retention setting (GA4-23 "last Ramadan or White Friday can't be compared") | GA4 Admin | A check row only | §6 seasons: "keep 14 months of data before Ramadan" in owner words |
| GA4 realtime active users | GA4 | Misused in "keep it" ("12 active users") | Little value; drop it |
| FUD money insights (`fud.insights.opportunity`, `lines`) | worker from GA4 | Rendered as "Where the money is" when present (not in this fixture). It is a **second, multi-step money total** next to the hero's single-step figure | §5 pain 2 / §7: "One coherent money number"; it must be tied to the hero or dropped |
| FUD `desktop` flag (same / better / worse on desktop) | phone + desktop visit | Not shown | Explains the phone gap: "fine on desktop, broken on phones" |
| FUD `pexti` score | judge | Not shown (fine) | n/a |
| Screenshots (desktop + phone mockups) | screenshots.ts | Under the hero h1 (real runs) | Kept: §15 "before/after mockups" are loved |
| `ad_context` (ad text + coupon) | form (buyer only) | Not asked of the owner | §16 #8 "Coupon on the ad vs price at checkout": owners also post offers on Snap/IG |

---

## 4. Missing entirely: card needs the audit doesn't collect

| Need (card) | Why it matters | What it would take |
|---|---|---|
| **Real orders vs GA4 orders** (§16 S6#206 "GA4 misses 28 % of orders and 48 % of revenue"; §3 "reads Salla/Zid dashboards daily and judges us against them") | The owner checks our numbers against Salla's first. If GA4 undercounts, every money figure looks invented | A form question: "Orders in the last 28 days (from your Salla/Zid dashboard)". Or a Salla/Zid app connector. Show "GA4 sees X of your Y orders" |
| **COD share, COD fee, refusal rate in SAR** (§4.5 "Tell me, in riyals, what my COD habit costs — and don't invent numbers"; §5 pain 4) | The card's named job-to-be-done. Blocked by the plan rule "COD share is not quoted until resolved" | Form fields (COD %, COD fee, refused %). An owner version of the buyer's break-even "turns into cash" row, filled only from the owner's own inputs |
| **Salla / Zid platform detection and verified menu paths** (§9, brief rule 2) | "No help between see and fix" is pain #1 (§5) | Salla/Zid patterns in `crawl.ts` (e.g. Salla CDN and script hosts, `raqeeb.zid.sa`, Zid's `google_tag_manager` key); read the form's `store_platform`; a hand-checked path table per SO point for Salla/Zid/Shopify |
| **Season line** (§6, §17.5, §19.5: White Friday 27 Nov 2026, Cyber Monday 30 Nov, Ramadan 2027 ≈ 8 Feb) | "Fix the store before you pay peak CPMs" (§19.5: Ramadan CPMs +68 %) | A date table in code, a line under the hero ("White Friday is in 15 days: fix 1 and 2 first"), and the 90-day trend already pulled |
| **ZATCA Phase 2 and the SBC verification badge** (§9, §17.7) | Loved GCC checks; ZATCA only when revenue > SAR 31K/month, because a wrong flag "discredits the whole report" | GA4 revenue gate + a crawl for the SBC badge/number (business.sa) and the VAT number on the invoice/checkout pages. Listed as "Not done" in `COMPARISON.md` |
| **Payment methods actually offered at checkout** (mada, Apple Pay, STC Pay, Tabby, Tamara; §16 #1, §17.4 "the valuable check is a missing or broken method") | Table stakes in KSA. The first checkout screen is captured but its methods aren't extracted for the owner | Parse the captured checkout screen and cart for method logos and names. A "Payment methods your shoppers see" tile (product page / cart / checkout) |
| **Delivery fee, delivery time, free-delivery threshold per city** (§16 #5) | GA4-11 compares the threshold with AOV only when a threshold string is found | Extract the delivery line from cart and checkout; ask the threshold on the form if it's not found |
| **Currency and language switch by visitor country** (§16 #2, S6#147 Kuwait) | Wrong currency = lost GCC sale outside KSA | A second visit with a KW/AE locale or `Accept-Language` (crawler only); SO-CRO-20 already exists but only on the no-tools route |
| **Peer benchmarks labelled as ours** (§6 "competitor data = #1 upgrade trigger"; §17.4 "Peer benchmarks must come from our own audit data") | "benchmark 50 %" has no owner meaning | Aggregate our own audits by platform and vertical (anonymised); "Salla stores we audited: median cart → checkout 46 %" |
| **A reason to come back** (§4.3 fix → re-scan → watch the score rise; §5 pain 3; §12 success metric) | D1 says one audit per site, ever | Within D1: a 14-day WhatsApp/email "did you fix these 3?" note, using "done when" checks they run in their own dashboard (playbook §3 "check again" email). Otherwise D1 has to be revisited |
| **WhatsApp contact route** (§2, §9, §20.4) | Email is the wrong channel (11.7 %) | D3: the number, then `wa.me` on the CTA and "Stuck? Message us" (#65) |
| **Arabic copy quality on the store** (§5 P1–P8: translationese MSA, welcome-only headline, missing Arabic reviews) | The owner writes their own copy | Partly covered (FUD "Arabic version that reads naturally"); a store-copy register check against Saudi dialect would need a judge rule |
| **Low-end Android / slow data reality** (§3) | PageSpeed emulates a mid phone; Clarity's device split exists | Show seconds to first view on a slow phone, in plain words; it's in the PageSpeed payload already (LCP), just not shown |

---

## 5. ICP1 card coverage, section by section

| Card § | What it asks | Status | Where (or why not) |
|---|---|---|---|
| §1 Identity, "Tell me what's costing me sales and let me fix it myself" | Money + DIY | **Partly** | Hero money ✓. DIY is undermined: fix 1 is a developer job, the DIY group is GA4/Ads chores, 37 of 50 tracking-route points need a developer |
| §2 Firmographics: Saudi, Salla > Zid > Shopify, Arabic-first, GA4 often missing, WhatsApp-first | Platform-aware, Arabic-first, honest without GA4 | **Partly** | Arabic default ✓, no-GA4 hero branch ✓. No Salla/Zid detection. No WhatsApp route. The no-GA4 answers give a false "No problem found" |
| §3 The person: no code, money not LCP/CLS, phone-first, judges us against the Salla/Zid dashboard, writes own copy | Plain words, phone, dashboard reconcile, copy help | **Partly** | Phone first screen ✓, paste-ready copy ✓ (friction). 106-screen page, 156 IDs, tracking jargon, "CLS" on the no-GA4 route. No comparison with the Salla/Zid dashboard |
| §4 JTBD 1: what's wrong and how much | Money hero | **Covered** | Hero h1 + source line |
| §4 JTBD 2: "the line, not the lecture" | Paste-ready fixes | **Partly** | "Change:" lines + friction copy ✓. No menu paths. Checklist cards are long lectures (What we found / What this means / The problem / How to fix) |
| §4 JTBD 3: fix → re-scan → watch your score rise | Loop | **Not** | D1: no re-check. No "check it yourself" in their dashboard |
| §4 JTBD 4: fast wins, effort labels, money framing, 375px | Effort + money | **Partly** | "You can do this" / "Needs a developer" ✓, money tags ✓. Effort labels are wrong for marketing tasks. 375px works but is long |
| §4 JTBD 5: COD cost in riyals, no invented numbers | COD in SAR | **Not** | Not collected; plan rule blocks quoting COD share |
| §5 Pain 1: no help between see and fix | Who / where / done-when | **Partly** | Who + done-when ✓, where ✗ (0 Salla/Zid paths), no developer copy button |
| §5 Pain 2: believable, attributed money | One sourced number | **Partly** | Hero sourced ✓. Contradictions C2, C3, C13, C17. Money tags under each fix carry no source |
| §5 Pain 3: nothing brings them back | Retention | **Not** | One audit per site; email only |
| §5 Pain 4: payment-mix leak (COD 15–40 %, BNPL) | Payment checks | **Partly** | FUD rules (instalments/COD shown), checklist cards. SO-CRO payment points don't run on the GA4+GTM route |
| §5 Pain 5: copy pains P1–P8 | Copy | **Partly** | Checklist "Copy and messaging" tab, FUD copy; no Saudi-dialect check |
| §6 Buy triggers: money number + platform quick win · competitor data · seasons · named peer proof | | **Partly** | Money ✓. Platform quick win ✗. Competitor/peer ✗. Season ✗ |
| §7 Fears: contradicting figures / two currencies | One number, one notation | **Not met** | 7 scores, two "biggest", 369 vs 1.50 %, 4 money notations |
| §7 Fears: false regression | — | n/a | No re-scan |
| §7 Fears: English on Arabic trust moments | | **Partly** | AR default ✓. English checkpoint text in the checklist; "(Conversion Rate)" inserts; Latin "EGP" in the Arabic hero |
| §7 Fears: mixed numeral systems | Western digits | **Not met** | "٢٥٠", "١٤" in paste-ready copy |
| §7 Fears: a finding they can disprove | | **At risk** | WhatsApp "working" while a link is broken (C7); "No problem found" without GA4 (C9); "checkout not checked" vs checkout cards (C8) |
| §7 Fears: ~20 nav items → overwhelm | Report / Issues / Fix-loop | **Not met** | 13 TOC items, 9 jump chips, 158 checklist to-dos, 23 fixes |
| §8 Pricing | — | n/a | Not in the report (by design) |
| §9 Arabic + local currency, one numeral system | | **Partly** | See §7 rows |
| §9 One coherent money number with source | | **Partly** | Hero ✓; the rest unsourced; FUD "Where the money is" (real runs) adds a second total |
| §9 Platform paste-in fixes for Salla/Zid/Shopify tied to each finding and mockup | | **Not** | No paths, no platform detection |
| §9 Re-scan loop | | **Not** | D1 |
| §9 WhatsApp-native re-engagement | | **Not** | D3 open |
| §9 Mobile-legible at 375px | | **Partly** | Legible, no sideways scroll; 106 screens; 122px sticky chrome |
| §9 Free preview: 3 quick wins + 3 critical titles | | **Partly** | "Fix these 3 first" ✓ (mixes quick wins and developer jobs) |
| §9 GCC checks (ZATCA, Maroof/SBC, STC Pay, Apple Pay, Tabby/Tamara, WhatsApp) | | **Partly** | Tabby/Tamara referral (GA4-19/SO-GA4-14) ✓, instalments/COD FUD rule ✓, WhatsApp FUD rule ✓. ZATCA, SBC, STC Pay, mada at checkout: ✗. SO-CRO points not on the tracking route |
| §9 GA4 as the single source of truth, never estimated traffic | | **Covered** | Money only from GA4; honest no-GA4 hero |
| §10 Voice: plain, money-first, Gulf, every number sourced, no guarantees | | **Partly** | "not a promise" ✓, Gulf hero/plan ✓. MSA/Egyptian elsewhere; unsourced numbers |
| §10 Promise line «انسخ، الصق، أعد الفحص» | | **Not** | No copy-paste pack, no re-scan |
| §10 Low-fit honesty «بصراحة: متجرك خارج نطاقنا الأمثل» | | **Not in report** | Form's store check only (COMPARISON #10) |
| §11 Anti-personas | | n/a | Form |
| §12 Success: fix-through + re-scan in 30 days; fixes applied and not reverted | | **Partly** | "Done when" ✓; no follow-up |
| §13 Assessment history | | n/a | — |
| §14 Open asks: 2 fix-myself apply flow · 5 owner report verified at 375px · 6 one currency notation · 8 merge duplicates, readable titles | | **Partly** | #5 partly (390px, not 375; no real run). #6 not met. #8 not met (duplicates 5–6×; 20–27-word titles) |
| §15 Loved: Arabic-first intake; one SAR money hero; GCC checks + seasonal readiness; before/after mockups; honest "unavailable" | | **Partly** | Money hero ✓, mockups ✓ (real runs), honest no-GA4 lines ✓. Seasonal readiness ✗. GCC checks thin on the tracking route |
| §16 Elevr: 8 owner checks (payment visibility + payment-step drop, currency by IP, Arabic titles, WhatsApp visible, free-delivery threshold, COD fee, Salla/Zid tracking duplication, coupon vs checkout) | | **Partly** | As SO-CRO points: no-tools route only. On the tracking route: FUD instalments/COD/WhatsApp rules; duplicate pixels (SO-GTM-05, developer framing). Payment-step drop, currency by IP, coupon: ✗ |
| §17 Deep research: ZATCA gate, SBC not Maroof, GCC payments, seasons, Snapchat | | **Not** | None in the report |
| §18 ECD: owners reached through ICP2/ICP4; "the owner-shareable report is the bridge" | | **Partly** | The buyer report has "Send this to the store owner". The owner report has no "send to whoever runs your ads" handover for the marketing tasks it lists |
| §19 Differentiate on money + checkout/payment fixes, never SEO; Salla's free analyzer owns SEO | | **Covered** (SEO dropped) | But the checkout/payment checks are weak on the tracking route |
| §20 Final read: money not SEO; WhatsApp/Telegram reach; White Friday timing | | **Partly** | Money ✓; WhatsApp and timing ✗ |

---

## 6. The 25 most valuable improvements, ranked

Size: S = one session, small diff · M = one round · L = needs data, form or decisions. "Mirrors" = the buyer round with the same method.

| # | What | Why (card) | Size | Mirrors |
|---|---|---|---|---|
| 1 | **An owner-faithful fixture and a real owner run.** Fixture: a Saudi Salla store, SAR, `SO-*` ids, owner-voice finding text, Gulf Arabic, platform "Salla", screenshots. Then a `local-pipeline/run.ts --role=store_owner` trial on a real Saudi store. Re-measure every finding in this file against both | Every [fixture] item here (C5, C14, C16, checklist register, buyer framing) can only be confirmed this way. Round 21 found persona-id bugs that hit owners. Card §13 QA 4.5/10, §14 #5 "owner report verified" | M | Round 21; plan S1 |
| 2 | **Remove every contradiction:**<br>- one score line (drop the 62/50/54/60 % mix, or label each);<br>- "biggest" only for the hero figure;<br>- purchases and conversion rate from one measure;<br>- one add-to-cart average;<br>- the checklist critical count = critical group, and bar counts = group counts;<br>- the scope strip updated for the first checkout screen;<br>- "next audit" wording (D1);<br>- a reconcile line when Clarity and GA4 disagree | §5 pain 2, §7 "contradicting money figures", §14 #6 | M | Round 1 (one honest count), round 6 |
| 3 | **Fix or drop "What you asked, answered":**<br>- no "Yes:" verdicts;<br>- questions phrased so the verdict reads right;<br>- a question whose points didn't run says "We couldn't check this: connect Google Analytics" (fixes the no-GA4 false all-clear);<br>- or fold the five answers into hero chips that link down | §7 "a finding they can disprove", §5 pain 2 | S | Round 1 (removed the answers section for the buyer) |
| 4 | **One home for every finding:**<br>- the hero's 3 fixes don't repeat in the plan (the plan starts at fix 4, or the hero links into the plan);<br>- answers link instead of listing;<br>- GA4/GTM rows that live in the plan become a one-line note with a link;<br>- sources once (hero strip + method box merged);<br>- the passed-row "Keep:" sentence not repeated;<br>- GA4-03 hidden in checks when GA4-01 names that step | §14 #8 "merge duplicates", §7 overwhelm | M | Round 4 (17 → 1 duplicates) |
| 5 | **GCC owner checks on the GA4+GTM route.** Run the SO-CRO points (mada/Apple Pay/STC Pay/Tabby/Tamara visible, delivery cost, free-delivery threshold, COD fee, WhatsApp on phones, Arabic titles, RTL cart) from the phone visit on every owner route. E.g. swap the 10–15 developer-only SO-GTM points for them, or run them as their own owner block outside the 50 | §9 "GCC-specific checks — loved in every assessment", §16 eight Elevr checks, §15. Needs Omar: GTM 25 was his call on 2026-10-20 | M (decision) | Round 9 (use what's collected) |
| 6 | **Fix "who does it":**<br>- three groups: "You, in your store admin" / "Whoever runs your ads or Google account" / "Your developer";<br>- the DIY lead only promises "no code" where true;<br>- the FUD "quick win" card doesn't say "Send this to your developer";<br>- a "Send to whoever runs your ads" copy pack (the owner→buyer bridge) | §3, §5 pain 1, §16 and §18.3 (owners reached through ICP2) | S | Round 2 (copy-the-fixes pack), round 3 |
| 7 | **Salla / Zid detection and "where in your admin":**<br>- Salla and Zid patterns in `crawl.ts`;<br>- read the form's `store_platform`;<br>- a hand-verified path table per DIY point for Salla, Zid and Shopify;<br>- an "In Salla: …" line on each fix, plus a "done when" they can see in their own dashboard;<br>- no path when unsure (brief rule) | §9 "platform paste-in fixes", brief rule 2, psych #65 | L | Round 1 (`buyer-verify.ts` "check it yourself") |
| 8 | **Hero rework:**<br>- fix 1 = the biggest **DIY** fix, or the 3 split "you today / your developer";<br>- titles in owner words with the product name, not URL paths (≤ 12 words);<br>- source line true for the figure's type (phone gap / page vs average / funnel step);<br>- calm severity words instead of 3 "Critical" pills;<br>- "Let us fix it" as a second equal path in the hero (#45) | §4 JTBD 1–2, §6 "money + a platform quick win", psych #31, #44, #45 | M | Round 11 (order by wow), round 6 |
| 9 | **Shrink the CRO checklist for the owner:**<br>- open only Critical plus the top cards on the GA4 leak page;<br>- merge same-issue cards (ratings ×9, payment logos ×7, shipping ×2) into one card with the places listed;<br>- fold the rest under "All 158 points" closed;<br>- hide `CP-001 · (ATIDFA)` codes;<br>- translate the checkpoint;<br>- one score, not three tiles + 11 bars + filters on the phone.<br>Target: 49 → under 10 phone screens | §7 "~20 nav items → overwhelm", §14 #8, §3 no time | M | Round 2 (fold), round 4 (merge), round 12 (carousels) |
| 10 | **Fold the GA4 and GTM lists for the owner:**<br>- one line per row, as the buyer has;<br>- failed rows that live in the plan become a link note;<br>- rename the sections "Your sales data (Google Analytics)" and "Your tracking setup (for your developer)", nav included.<br>Target: 31 → about 8 screens | §3, §9 375px | S | Rounds 2 and 4 |
| 11 | **Gulf Arabic pass on every code-written string the owner sees:**<br>- friction labels, the checklist section (now Egyptian), numbers, GA4/GTM group names (`checklist.ts`), speed, sources, footer, CTA, guide;<br>- the action box labels المسؤول / يكتمل عندما / الإجراء / الأثر;<br>- one word for phone (الجوال), توصيل not شحن;<br>- Arabic money format in the hero;<br>- the FUD judge's `exampleCopy` in the store's own dialect with Western digits;<br>- stop the "(Conversion Rate)" English inserts for the owner;<br>- fix the bidi break | §10 "native Gulf/Saudi Arabic", §7 English and mixed numerals, §2 "English leaking = defect" | M | Round 1 (buyer Egyptian rewrite), round 6 |
| 12 | **Remove internal IDs and versions:**<br>- "Follow-up from GA4-01" → "From your Google Analytics";<br>- "(GA4-03)" → nothing;<br>- "Next: GA4-01" → the check's name;<br>- checklist codes hidden;<br>- "fud-2.1.0" removed | §3, §7 | S | Round 3 |
| 13 | **Plain words and labelled numbers for the owner:**<br>- drop the 62 opportunity chips (one money/size tag instead);<br>- "sessions" → "visits";<br>- no event names in titles, protect lines or "keep it";<br>- "benchmark" → "typical store (our data)";<br>- "Conversion review" → the section's name;<br>- "DevTools" title gone;<br>- every number says what it is and where it came from | §3 money not metrics, §10 every number sourced | S | Round 6 (number audit), round 3 (chips) |
| 14 | **Short-sentence pass:**<br>- the GA4 fact sentences used as owner titles rewritten as owner headlines, e.g. "Phones buy 3 times less than computers" instead of the 23-word line (owner titles in `ga4-facts.ts` or a title layer);<br>- code strings ≤ 14 words;<br>- the hero source line split | §3 no time, brief "short sentences" | S | Round 12 |
| 15 | **Rebuild "What's working: keep it":**<br>- only passed points that protect sales in owner terms (payment options visible, WhatsApp works, checkout opens fast, delivery shown);<br>- never drop-offs, tracking internals or privacy passes;<br>- 3–4 items;<br>- from the FUD "Already working" list too | psych #46 (calm, true), §15 | S | Round 11 (score each block) |
| 16 | **Show the owner what our phone visit saw, as tiles:**<br>- Add to cart worked?;<br>- WhatsApp links working/broken;<br>- sold-out up front;<br>- buy button in the first phone screen (with the round-20 crop);<br>- checkout asks shoppers to log in;<br>- payment logos seen on product / cart / checkout.<br>Each with a one-line store-admin fix | §16 #1 and #4, §9 GCC checks, §15 mockups loved | M | Rounds 2 and 9 ("What our phone visit saw"), round 12 tiles |
| 17 | **"Your numbers" as the owner's money ledger:**<br>- sales, orders, conversion, average order with a source line;<br>- the funnel with the one leak flagged and its money;<br>- phone vs computer;<br>- top 5 products by sales (`itemSales`);<br>- sales by channel (Instagram / Snap / TikTok / WhatsApp from `trafficSources`);<br>- labelled "from your Google Analytics, last 28 days" | §4 JTBD 1, §6 money trigger, §2 channels | M | Rounds 5 and 10 ("From click to cash" ledger), round 14 |
| 18 | **One money notation and one total:**<br>- SAR / ر.س (or the store's GA4 currency) in one format in each language;<br>- one rounding rule;<br>- every money tag says "at stake a month";<br>- the FUD "Where the money is" total tied to the hero (or hidden) so there's never a second competing figure | §7, §9 "one coherent money number", §14 #6 | S | Round 6 |
| 19 | **Season line:**<br>- "White Friday is in N days (27 Nov): fix 1 and 2 first" under the hero, or Ramadan from late December;<br>- the 90-day daily trend (already pulled) as a small chart with the last peak;<br>- the GA4 retention point in owner words ("keep 14 months so you can compare Ramadan") | §6 seasonal urgency, §17.5, §19.5 dates | S/M | — |
| 20 | **WhatsApp route:**<br>- `wa.me` button next to "Book my free call";<br>- "Stuck on a fix? Message us" under the plan;<br>- a GCC-only footer for KSA owners (the Egypt address and +20 number off the owner page) | §2 WhatsApp 89.4 %, §9, §20.4, psych #65 | S (needs D3) | Round 3 (closing ask rewritten for its reader) |
| 21 | **Clarity for the owner as tiles with an action each:**<br>- in-app browsers ("55 % open your store inside Instagram/TikTok/Snap: test your checkout there");<br>- quick-backs on the top page;<br>- bots ("your conversion rate looks lower than it is");<br>- dead taps on <product name>;<br>- scroll depth with "move price, delivery and payment logos above this line" | §19.4 (Clarity is free: show what it can't), §2 social channels | S | Rounds 9 and 12 (buyer Clarity tiles) |
| 22 | **Speed tied to money and moved up:**<br>- the phone-gap fix names "your product page takes N seconds on a phone (Google)" as the likely cause;<br>- speed in seconds and plain words;<br>- the section moved next to the plan or the friction section;<br>- product names, not URLs | §3 "doesn't understand LCP/CLS", phone-first | S | Round 3 (speed moved next to the conversion review, rewritten for its reader) |
| 23 | **Phone navigation:**<br>- the jump bar in page order and owner words (Summary · Fixes · Numbers · Shoppers · Checklist · Tracking · Speed), with Clarity and Keep added;<br>- no scores in the TOC;<br>- consider letting the top bar hide on scroll to get back 61px | §7 "~20 nav items", §9 375px | S | Round 11 (nav follows the page, one-row bar) |
| 24 | **Owner form questions** (optional, two minutes): orders last 28 days from the Salla/Zid dashboard, COD share, COD fee, delivery fee and free-delivery threshold. Then show "GA4 sees X of your Y orders" and "COD costs you about SAR X a month (from your numbers)" | §16 S6#206, §4 JTBD 5, §5 pain 4 | L (form + API) | Round 9 "missing" table; round 15 (inputs → live money) |
| 25 | **ZATCA Phase 2 and SBC badge points for Saudi stores:**<br>- shown only when GA4 revenue is above SAR 31K a month (ZATCA);<br>- SBC badge/number on the footer or checkout ("معروف" kept as the familiar word) | §9 GCC checks, §17.7 (a wrong ZATCA flag discredits all), COMPARISON "Not done" | M | — |

### Suggested first rounds (from the ranking)

1. Item 1: get an honest owner baseline.
2. Items 2–4: trust (contradictions, answers, one home).
3. Items 6, 8 and 12: who, hero, IDs.
4. Items 9–10: length.
5. Item 11: Gulf Arabic.
6. Items 13–15: words, sentences, keep.
7. Items 16–17: visit tiles and the money ledger.
8. Items 18, 19, 21 and 22.
9. Items 5, 7, 20, 24 and 25: these need decisions (GTM 25, D3, form changes).

### Not audited here
- The owner client email (`email.ts` `ownerBody`).
- The internal review email's owner talk track.
- The form copy.
- Print layout.
- The desktop guide's motion.
