# Owner market research: what helps a GCC store owner reading a free store audit

Research date: 2026-11-12. Web research only, no interviews. Purpose: ground 21 improvement rounds of the store-owner (ICP1) report.
Reader: see `audit-worker/icp/store-owner.md` and the canonical ICP1 card (`ICP1-Self-Serve-GCC-Store-Owner.md`). This file adds outside evidence; it does not repeat the card.

**Evidence tags**
- **[Official]** government, platform help center, or the regulation itself, read directly.
- **[Survey]** a named survey with sample size, read directly (most are run by a payments company, so they lean toward payment topics).
- **[Secondary]** press or a summary of someone else's data.
- **[Vendor]** a claim by a company selling the thing it measures.
- **[Unverified]** could not confirm; do not put in the report as fact.
- **[Inference]** our own conclusion from the above.

---

## 0. The 12 facts that matter most

1. **Shoppers' top checkout frustration in KSA/UAE is "my payment method isn't listed" (35%)**, ahead of "no OTP received" (19%). Survey of 12,015 shoppers, 10,296 of them Saudi. [Survey] Tabby, *A Retailer's Guide to 2025*, https://cdn.tabby.ai/assets/retailers-guide/tabby-guide-en.pdf
2. **Top red flags on an unknown store: no reviews (21.1%), no contact options (18.7%), few payment options (15.9%).** Slow speed is last (6.4%). [Survey] same source.
3. **Top online frustrations (Nov 2025, 20,999 KSA+UAE shoppers): unclear product descriptions 18.5%, high delivery costs 17.7%, out of stock 15.7%, lack of trust in the site 12.7%, unclear returns 10.8%, poor support 9.7%, slow site 6.8%.** 17.0% abandon carts over delivery costs. [Survey] Tabby, *Ultimate Middle East Shopping Survey 2026*, https://cdn.tabby.ai/assets/Tabby-Survey-2026-English-compressed.pdf
4. **Purchase intent "more than doubles" when delivery is built into the price and labelled free**, at the same total (AED 70 test). [Survey experiment] Tabby 2025 guide.
5. **Saudi law already requires most trust signals the report could check**: merchant name/address, CR or freelance number, tax number, approved authentication (Saudi Business Center), phone + email, Arabic live chat, complaint channel with response times, terms/privacy/returns pages, total price incl. tax and delivery before purchase, 7-day returns, cancel if delivery is 15+ days late. Fines up to SAR 1M or store blocking. [Official] Salla merchant-obligations article (updated 27 Aug 2026), https://help.salla.sa/en/article/merchant-ecommerce-obligations/g0cbvwqncrfmptexs580y6f7
6. **Maroof is gone: the Saudi Business Center (business.sa) is the only approved e-store authentication; the badge sits in the store footer and links to the SBC site.** [Official] MoC https://mc.gov.sa/en/mediacenter/News/Pages/29-03-23-02.aspx ; Salla https://help.salla.sa/en/article/verify-store-on-business-platform-instead-of-maroof/gno9ilestioyspm61yu5buzp
7. **Salla's own "Store Performance" page shows conversion rate, a 5-step funnel, abandoned carts, payments and delivery, but no benchmark against similar stores, no health score and no recommendations.** That gap is what the audit can fill. [Official] https://help.salla.sa/en/article/store-performance-page-your-gateway-to-growth-1/fqieyzzp3p4jrvbbasqhfp0i
8. **Shopify's benchmark format is median + 25th/75th percentile of similar stores** (by order volume and category). That is the trusted format to copy, labelled as our own data. [Official] https://help.shopify.com/cs/manual/reports-and-analytics/shopify-reports/report-types/using-reports/benchmarks_in_reports
9. **COD delivery fee example: Aramex via Salla charges SAR 8 + 1% of order value per COD order; COD is hidden for carts under SAR 20.** [Official] https://help.salla.sa/en/article/connect-aramex-standard-shipping/al1wqxesz2bj7goy2x58fa5x
10. **BNPL is over 20% of Saudi online retail value (2024); Tabby + Tamara hold 95%+ of BNPL volume.** [Secondary/analyst] Redseer https://redseer.com/articles/bnpl-a-key-growth-engine-for-online-retail-in-ksa/
11. **Ramadan 1448 is projected for ~8 Feb to 8 Mar 2027, so Founding Day (22 Feb 2027) falls inside Ramadan.** White Friday is 27 Nov 2026. Discounts need a Ministry of Commerce licence before they are announced, online stores included. [Secondary + Official]
12. **What owners pay for, by app-store review counts:** WhatsApp abandoned-cart reminders (509 reviews, SAR 99/mo), "social proof" offer notifications (301 reviews, SAR 20/mo) and bundles/upsell (169 reviews, from SAR 49/mo) lead the Salla featured list. Clarity is free (4.66 from 163 ratings). [Official listing] https://apps.salla.sa/ar , https://apps.salla.sa/ar/app/471536295

---

## 1. What store owners in Saudi/GCC struggle with and pay for

**Evidence quality:** no survey of Saudi/GCC store *owners* was found. The evidence below is indirect: what they install and pay for, what their platforms build for them, how platforms word help articles (written around merchant questions), Elevr posts already in the ICP card (§16), and consumer complaints that become the owner's legal risk.

### 1.1 What they pay for (app stores)

| Signal | Value | Source |
|---|---|---|
| Salla app-store categories | Marketing, Site optimisation, Conversations, Analytics, AI, Sales growth, **Abandoned carts** (its own category) | [Official] https://apps.salla.sa/ar |
| Most-reviewed featured Salla apps | «كارتات إشعارات واتساب» WhatsApp cart reminders + order updates: 4.5 (509), SAR 99/mo · «نوتي موني» offer/social-proof popups: 4.76 (301), SAR 20/mo · «باقات العروض أب سيل و كروس سيل» bundles: 4.9 (169), from SAR 49/mo · «زود» upsell/bundles: 5 (46), SAR 69/mo | [Official] same page (prices excl. 15% VAT) |
| Salla "smart sales" bundle | Groups four upsell/bundle apps; upsell is the most crowded category on the page | [Official] same |
| Microsoft Clarity on Salla | Free, 4.66 from 163 ratings | [Official] https://apps.salla.sa/ar/app/471536295 |
| Zid app market | 500+ apps, 420,000+ installs. Largest category **Shipping & Storage (233 apps)**, then Operations (70), Customer experience (58), Sales & conversion (58), AI & analytics (50), Finance & payments (29). Featured: GA4 (free, 4.8), WhatsApp notifications with cart reminders and **review requests** («لتس بوت») | [Official] https://apps.zid.sa/ |
| Platform plan prices (context) | Salla Plus SAR 129/mo, Pro SAR 389/mo; Zid «الانطلاقة» SAR 99/mo, «النمو» SAR 299/mo | ICP card §17.3, §19.4 |

**[Inference]** Owners spend real money on three jobs: getting abandoned carts back over WhatsApp, raising order value (bundles/upsell), and nudging with offers. They do not pay for analytics (free). A report that ties its findings to these three jobs speaks to money they already spend.

### 1.2 What they look at daily (their benchmark for us)

- **Salla Reports > Store Performance** shows: total sales, costs, net profit; orders, conversion rate, AOV, best sellers; repeat-purchase rate; visits, devices and top pages (only with GA4 connected); abandoned-cart rate, estimated lost revenue, most-abandoned products; wishlists; **payments: cost per method, acceptance rate, digital-payment share, refunds; delivery: costs, speed, free-delivery share, top carriers**; out-of-stock requests; drop-off per funnel step; landing pages (Pro/Special only). **No health score, no benchmark against similar stores, no automated recommendations.** [Official] https://help.salla.sa/en/article/store-performance-page-your-gateway-to-growth-1/fqieyzzp3p4jrvbbasqhfp0i (updated 31 Aug 2026)
- **Salla conversion report**: rate = completed orders ÷ total visits × 100. Funnel steps: **Visits → Add to cart → Cart view → Checkout started → Order completed.** Path: Reports > Store performance > Conversion rate. Salla states no "good" rate. [Official] https://help.salla.sa/en/article/conversion-rate-reports/ndt3banqnk8z60luzrod1nu6 (updated 29 Aug 2026)
- **Salla abandoned-cart report**: count, potential lost revenue, % recovered after reminders, most-abandoned products. Salla's two help articles define "recovered %" differently (per reminder sent vs per abandoned cart, last 60 days). [Official] https://help.salla.sa/en/article/abandoned-cart-reports/bmgrwya9qdlyh6xi6g7g9t04
- **Salla «مشمّر»** AI assistant analyses sales and abandoned carts (ICP card §19.3). Salla's free «محلل المتاجر» covers SEO/GEO only (ICP card §19.3).
- **Shopify Benchmarks**: median + 25th/75th percentile of similar stores, in report charts. [Official] https://help.shopify.com/cs/manual/reports-and-analytics/shopify-reports/report-types/using-reports/benchmarks_in_reports ; https://www.shopify.com/blog/benchmarks

**[Inference]** The owner will compare our numbers with the Salla funnel and conversion rate. Our step names, definitions and the money number must line up with Salla's, or say why they differ.

### 1.3 Pains (indirect evidence)

| Pain | Evidence | Tag |
|---|---|---|
| COD losses | Salla's own COD article: COD "may be one of the biggest sources of non-serious orders, high returns, shipping losses"; Salla built payment restrictions (hide COD below a cart value, block non-serious customers) and a pre-order acknowledgment to cut returns | [Official] https://help.salla.sa/ar/article/enabling-and-managing-cash-on-delivery-with-salla-shipping-labels/koda8pykc6pdhylg7zb2iu0g |
| Too many apps, unclear cost | Salla help article titled "How many of the apps installed on your store are you actually using?" | [Official] https://help.salla.sa/en/article/manage-installed-apps/p2b49tm6ssijwwjxwp2d64gu |
| Reports too complex | Salla article titled "Are complex reports making it hard to track store performance and make quick decisions?" | [Official] https://help.salla.sa/en/article/store-reports/lpwuqxp7z7fifo5s4g2pl2oh |
| Losses at the last step; tracking misses orders | Elevr: 1,232 PDP views → 4 orders; 85% drop at payment despite Tamara/mada/Apple Pay; GA4 misses 28% of orders | ICP card §16 |
| Legal exposure grows | E-commerce stores were the top consumer-complaint category in Q3 2025; return/exchange-policy complaints stayed among the top in Q2 2026; MoC fined two stores in Dec 2025 for late delivery | [Secondary] MoC releases via search summary (mc.gov.sa 19-10-25, okaz) — not read in full |
| Traffic without sales | Saudi agency content: "high visits without sales is rarely an ad problem; it's what happens after the click", and tracking is often broken | [Vendor] https://origami.sa/blog/traffic-but-no-sales/ |

### 1.4 What they dislike about audit and analytics tools

- Merchants in a Shopify community thread (Aug 2026) on AI CRO audits want findings "prioritized by actual customer behavior, not theoretical improvements", an **evidence chain** (issue → affected journey → behaviour evidence → confidence → fix), **crawl facts kept separate from data that still needs checking**, and **one root cause instead of "40 generic recommendations"**; "the answer is not a longer issue list"; a crawler "cannot prove that the link is costing sales". [Forum, 3 replies, one vendor] https://community.shopify.com/t/what-would-you-want-an-ai-cro-audit-to-actually-find-on-your-store/665098
- Google's free retail audit (Grow My Store, 22 metrics, benchmark vs sector) was reviewed as "promises so much, yet delivers so little". [Agency opinion] https://browsermedia.agency/blog/google-retail-site-analysis-tool-grow-my-store/
- Small owners do not act on analytics: "too many numbers and no clear answer"; owners "get lost in the dashboards". Databox figure (58% of SMB GA4 users look at fewer than 3 reports/month) is second-hand. [Forum/Vendor, Unverified figure] https://community.shopify.com/t/does-anyone-else-find-shopify-analytics-overwhelming/577960
- Lighthouse/PageSpeed scores move about ±5 points between identical runs, and the lab score is not real-user data. Owners who re-test and see a different score lose trust. [Secondary] https://web.dev/lab-and-field-data-differences ; https://www.debugbear.com/blog/lighthouse-lab-data-not-matching-field-data
- From the ICP card (§7): contradicting money figures, false "your score dropped", English on Arabic screens, mixed numerals, one disprovable finding (e.g. ZATCA).

---

## 2. GCC e-commerce reality, in numbers

### 2.1 Conversion and abandonment

| Metric | Value | Source | Tag |
|---|---|---|---|
| Saudi conversion rate | **No verified public figure.** An agency blog says 1.5–3.5% is "normal" for Saudi stores | https://origami.sa/blog/traffic-but-no-sales/ | [Vendor, Unverified] |
| KSA cart abandonment | 76.0–76.5% (modelled) | ECDB via ICP card §17.4 | [Secondary] |
| Global cart abandonment | 70.22% (avg of 50 studies, 2006–2025) | https://baymard.com/lists/cart-abandonment-rate | [Official-ish research] |
| Global abandonment reasons (excl. "just browsing") | Extra costs 40% · slow delivery 20% · didn't trust site with card 19% · forced account 18% · checkout too long 17% · errors 17% · returns policy 13% · total cost not visible up front 12% · card declined 10% · not enough payment methods 9% | Baymard, same page | [Survey, US] |
| Better checkout design | +35.26% conversion for an average large site | Baymard, same page | [Research claim] |
| Mobile vs desktop CR | Sources conflict (mobile ≈ half of desktop vs nearly equal). No Saudi split found | https://www.nudgenow.com/blogs/e-commerce-conversion-rates-benchmark | [Vendor, conflicting] |
| Shopify median CR | ~1.4%, top quartile >3.2% | ICP card §17.4 | [Secondary] |

**[Inference]** Do not show an outside "good conversion rate" for Saudi. Use the store's own GA4 (phone vs desktop, step by step, against Salla's 5-step funnel) and, later, our own corpus labelled as ours.

### 2.2 Order value and mobile

| Metric | Value | Source | Tag |
|---|---|---|---|
| AOV, Dec 2025 season | KSA $50 → $52 (≈ SAR 195); UAE $105; MENA $44 → $53 during White Friday/Cyber Monday | Admitad + Flowwow, 5M MENA orders, https://focus.hidubai.com/early-festive-rush-sparks-mena-e-commerce-up-59-in-2025 | [Secondary, affiliate/gifting sample] |
| AOV, 2024 festive | Kuwait $127 · UAE $102 · Egypt $74 · KSA $52 · Qatar $50 | ICP card §17.4 | [Secondary] |
| Kuwait AOV with bundles | ~18 KWD | ICP card §16 (Elevr) | [Anecdote] |
| Saudi web traffic by device, Oct 2026 | Mobile 66.57% · desktop 32.12% · tablet 1.31% (all websites) | https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/saudi-arabia | [Official stats] |
| Share of online purchases on mobile | KSA 62%, UAE 60% (2024) | https://www.arabnews.com/node/2583642 | [Secondary] |
| Mobile share of sales (affiliate sample) | KSA 50–56%, UAE 51–52% (2025) | hidubai/Admitad, above | [Secondary, conflicting] |
| Salla claim | "More than 80% of Saudi store shopping happens on mobile" | ICP card §19.2 | [Vendor] |
| Saudi mobile speed | Median mobile download 216 Mbps (2025, CST using Ookla); speeds drop 31–52% at peak hours | https://alriyadhdaily.com/article/f244e320dc374c3c81c1d8bc8aef7149 ; https://telecomlead.com/4g-lte/gulf-mobile-networks-2026-qatar-and-uae-lead-peak-hour-performance-as-saudi-networks-face-capacity-pressure-127755 | [Secondary] |

**[Inference]** "Page speed on 4G" is less about bandwidth in KSA than page weight, apps/scripts and mid-range phone CPU, and peak-hour congestion (evenings, i.e. Ramadan nights).

### 2.3 Payments

| Metric | Value | Source | Tag |
|---|---|---|---|
| E-payments share of retail payments, KSA | 85% (2025) vs 79% (2024) | SAMA https://sama.gov.sa/en-US/MediaCenter/News/Pages/news-1139.aspx | [Official, via search summary] |
| mada e-commerce | Record SAR 30.7bn in Oct 2025 (+68% YoY) | https://www.arabnews.pk/node/2627424 | [Secondary, SAMA data] |
| BNPL share of KSA online retail | >20% of value (2024); Tabby + Tamara >95% of BNPL volume | Redseer, above | [Analyst] |
| Wallet preference | Apple Pay 36% · PayPal 29% · STC Pay 26% | KAE via ICP card §17.4 | [Secondary] |
| BNPL brand preference | Tabby 49% · Tamara 11% | KAE via ICP card | [Secondary] |
| What makes shoppers trust a checkout | Secure payment options 24.2% · well-known brand 22.7% · customer reviews 18.9% | Tabby 2026 | [Survey] |
| In-store payment priority, KSA | Speed 32.2% · security 25.5% · flexibility 19.0% · rewards 13.9% | Tabby 2026 | [Survey] |
| "Would avoid a retailer without flexible payments like Tabby" | 69.9% yes | Tabby 2026 | [Survey, leading question by a BNPL firm] |
| Apple Pay effect | +22.3% conversion on eligible checkouts (global, Stripe test of 50+ methods) | https://stripe.com/blog/testing-the-conversion-impact-of-50-plus-global-payment-methods | [Vendor experiment] |
| COD preference | MENA 41% (2020) → 20% (2023); "as low as 10%" in KSA, UAE, Kuwait | https://www.checkout.com/newsroom/checkout-coms-4th-annual-mena-report-finds-cash-on-delivery-usage-halved-amongst-maturing-digital-economy | [Vendor survey] |
| COD share, Egypt | ~40–45% of e-commerce payments | https://www.orchestrapay.com/coverage/africa/egypt ; https://www.psmarketresearch.com/market-analysis/egypt-e-commerce-market | [Secondary, conflicting] |
| Kuwait | Cards ~45% (KNET central); COD 10–20% | psmarketresearch / Mordor / Checkout.com via search | [Secondary, conflicting] |
| UAE COD | Estimates 30% (vendor); COD use down 37–53% since 2020 | https://www.khaleejtimes.com/business/uae-shopping-behaviour-consumers-2025 | [Secondary, conflicting] |
| Failed payment | 1 in 3 MENA shoppers would switch to a competitor after a single failed payment; 23% had a false decline in 3 months | Checkout.com, above | [Vendor survey] |

### 2.4 COD fees, refusals and returns

| Item | Value | Source | Tag |
|---|---|---|---|
| Aramex COD fee via Salla | SAR 8 + 1% of order value, excl. VAT; COD not shown for carts < SAR 20 | https://help.salla.sa/en/article/connect-aramex-standard-shipping/al1wqxesz2bj7goy2x58fa5x | [Official] |
| J&T COD fee | SAR 8 (express SAR 18, 1–2 days, Jun 2025 comparison) | https://www.tryoto.com/otopedia/blog/ارخص-شركة-شحن-داخلي-في-السعودية | [Vendor] |
| SMSA | SAR 25.65 first 15 kg; COD SAR 8 + 2% | https://sellershipment.pages.dev/ae-en/ecommerce-shipping-cost/smsa-express-shipping-rates/ | [Unverified] |
| COD refusal rate | "Up to 10%" of COD orders refused | https://toppandigital.com/us/blog-us/cod-trust | [Unverified, no source] |
| COD returns 15–40% vs ~6% prepaid | ICP card §5 | [Unverified hypothesis] |
| Owner anecdote | A +20 SAR COD fee pushes buyers to pay online | ICP card §16 (Elevr S5#23) | [Anecdote] |

**[Inference]** No public refusal rate is trustworthy. A COD cost line must use the store's own numbers (owner input or platform export), never a market average.

### 2.5 Delivery expectations

| Item | Value | Source | Tag |
|---|---|---|---|
| Most-valued online perks | Discounts 60.4% · free delivery 57.0% · flexible payments 42.6% · next-day delivery 31.1% | Tabby 2026 | [Survey] |
| Abandon over delivery cost | 17.0% | Tabby 2026 | [Survey] |
| Free delivery labelled in price | Purchase intent more than doubles vs same total with a delivery line (AED 70 test); weaker but still clear at AED 200 | Tabby 2025 guide | [Survey experiment] |
| Who wants next-day | Younger shoppers much more than older | Tabby 2025 guide | [Survey] |
| Free-delivery thresholds seen | SAR 300–400 with a SAR 25–28 fee below (Kaafmeem 300/25, Rubaiyat 399/25, Mihyar 399/28, Caffeine Lab 350); iHerb SA 99/15 | store policy pages via search | [Small sample, Inference] |
| Courier cost | Zid published domestic rates ~SAR 20–35 excl. VAT | https://zid.sa/en/solutions/shipping | [Secondary summary] |
| Delivery-time rule | State delivery time before purchase and on the invoice; customer can cancel if 15+ days late | E-Commerce Council 2022 standards https://amlak.net.sa/en/35110 ; Salla obligations | [Official/Secondary] |
| Unmet expectations | 59% of Saudi shoppers won't shop again with a retailer that misses their online expectations; 65% want "compressed" inspiration-to-purchase | VML Future Shopper 2025, https://campaignme.com/uae-62-and-ksa-59-consumers-unhappy-with-online-shopping-vml-study-reveals/ | [Survey] |

### 2.6 WhatsApp, social and language

| Item | Value | Source | Tag |
|---|---|---|---|
| WhatsApp reach | 9 in 10 Saudi adults use it daily | Meta citing BCG, https://english.aawsat.com/node/5288606 | [Secondary] |
| Open to brand chat | 85% of Saudi social users (13–44) open to brand messages in chat | Snap/Media Trials 2025 via https://communicateonline.me/news/social-chat-and-ai-reshape-consumer-behavior-in-uae-saudi-report/ | [Vendor survey] |
| Where Saudis shop online | Online-only retailers 80% · physical retailers' sites 33% · aggregators 31% · brand websites 24% · social pages 21% · **ordering through a messaging app 17%** | Ipsos KSA, Nov 2024, n=500 (saved PDF of https://www.ipsos.com/sites/default/files/ct/news/documents/2024-11/Spotlight%20KSA%20-%20Online%20Shopping%20Behaviour%20%26%20Attitudes.pdf) | [Survey] |
| Why they shop online | Promotions 74% · convenience 53% · prices 41% | Ipsos KSA 2024 | [Survey] |
| Preferred support channel | Social media first, WhatsApp a close second | Tabby 2025 guide | [Survey] |
| WhatsApp vs email (owner channel) | WhatsApp 89.4% vs email newsletter 11.7% | ICP card §2 | [Internal] |
| WhatsApp cart messages | 70–94% read rates vs 40–45% for email; recovery-rate claims (15–65%) conflict | vendor blogs via search | [Vendor; recovery Unverified] |
| Arabic | Law: products displayed in Arabic; complaints and live chat in Arabic (KSA). UAE: Arabic required, other languages alongside. No reliable survey % on Arabic preference (the common "88% prefer native language" is unsourced) | https://amlak.net.sa/en/35110 ; https://pipelaws.com/print/pdf/node/52901 | [Official/Secondary; preference % Unverified] |

### 2.7 What shoppers say stops them (summary table for the report writer)

| Shopper says | % | Survey |
|---|---|---|
| Preferred payment method not listed (checkout) | 35% | Tabby 2025 |
| Honest reviews improve the experience most | 36.0% | Tabby 2025 |
| No reviews = biggest red flag | 21.1% | Tabby 2025 |
| Not getting an OTP (checkout) | 19% | Tabby 2025 |
| No contact options = red flag | 18.7% | Tabby 2025 |
| Unclear product descriptions | 18.5% | Tabby 2026 |
| Ads or pop-ups at checkout | 18% | Tabby 2025 |
| High delivery costs | 17.7% | Tabby 2026 |
| Few payment options = red flag | 15.9% | Tabby 2025 |
| Out of stock | 15.7% / 13.3% | Tabby 2026 / 2025 |
| Unclear returns policy | 10.8% | Tabby 2026 |
| No guest checkout | 7% | Tabby 2025 |
| Slow website | 6.8% / 6.4% | Tabby 2026 / 2025 |

---

## 3. Saudi rules and trust signals (and what the crawl can check)

Primary list: Salla's merchant-obligations article (updated 27 Aug 2026), which restates the E-Commerce Law and its Implementing Regulations, plus the 2022 E-Commerce Council standards. MoC's 2025 review of the top 100 stores (10 criteria) found ~99% had customer-service contact and a returns policy, but only 75–79% met three standards including complaint handling and **store verification**; ~220 stores were reviewed in 2026, including clarity of returns and delivery terms. [Secondary summary of MoC releases]

| # | Requirement | Source | Checkable from public pages? |
|---|---|---|---|
| 1 | Merchant name (or identifier) and address | Salla obligations [Official] | Yes: footer, About, Contact |
| 2 | CR number if held; otherwise freelance certificate | Salla obligations | Mostly: footer text / SBC badge |
| 3 | Tax number + certificate **if VAT-registered**. Registration is mandatory above SAR 375,000 taxable supplies in 12 months (voluntary from SAR 187,500) | Salla obligations; ZATCA SME guideline https://zatca.gov.sa/en/HelpCenter/guidelines/Documents/%28SMEs%29%20Guidelines%20%E2%80%93%20Zatca%201.pdf | Yes for presence; **never flag absence as a violation** unless revenue (GA4 or owner) suggests > SAR 375k/yr |
| 4 | Authentication with an approved body: **Saudi Business Center (business.sa)**, replaced Maroof in March 2023. Requires CR or freelance certificate, bank account, Absher, Saudi nationality, live store, verified domain. Badge in footer links to the SBC site | MoC https://mc.gov.sa/en/mediacenter/News/Pages/29-03-23-02.aspx ; Salla https://help.salla.sa/en/article/verify-store-on-business-platform-instead-of-maroof/gno9ilestioyspm61yu5buzp | Yes: footer badge + link target domain. Non-Saudi owners cannot get it, so word it as "if you're eligible" |
| 5 | Phone number and email | Salla obligations; 2022 standards #1–2 | Yes |
| 6 | Live chat **in Arabic** | Salla obligations; 2022 standards #3, #11 | Partly: chat widget present; Arabic only if the widget text shows it |
| 7 | Complaints via website and social, with stated response and resolution times, in Arabic | Salla obligations; 2022 standards #5–8, #10 | Partly: search policy/contact text for complaint channel and times |
| 8 | Terms, privacy policy, exchange & return policy as pages | Salla obligations; 2022 standard #13 | Yes |
| 9 | 7-day return right (excluded categories aside); consumer pays return cost unless agreed; cancel if delivery 15+ days late | Salla obligations | Partly: parse the policy for the day count; flag < 7 days carefully (exclusions exist) |
| 10 | E-contract before sale: specs, **total price incl. taxes and delivery fees**, warranty | Salla obligations | Partly: product page + cart (checkout often behind phone login) |
| 11 | Displayed prices are final, VAT-inclusive | MoC (2020) https://mc.gov.sa/en/mediacenter/News/Pages/04-08-20-01.aspx ; Salla VAT display (Pro/Special plans; path in §5.1; the older article says Store settings > VAT) https://help.salla.sa/en/article/set-up-display-vat/xkspnkuqw3lqhiexv4tsmfju | Partly: compare PDP price with cart line; look for «شامل الضريبة» |
| 12 | Delivery time stated before purchase and on the invoice | 2022 standard #9 | Yes for PDP/cart; invoice no |
| 13 | Products displayed in Arabic | 2022 standard #12 | Yes |
| 14 | Discount licence before any discount is announced (online stores included); before/after price shown; discount within licensed range; return policy visible during the offer. Seasons set by MoC (e.g. Ramadan–Eid 2025: 9 Feb–3 Apr; 2026 "Sales Season" 1 Aug–31 Oct). Apply at sales.mc.gov.sa | https://amlak.net.sa/en/74008/ ; https://origami.sa/en/blog/discount-license-price-system-match/ [Secondary/Vendor] | Partly: strike-through prices visible; licence not checkable → ask the owner |
| 15 | E-invoicing: Phase 2 Wave 24 covered revenue > SAR 375k (2022/23/24), deadline 30 Jun 2026 | ICP card §17.7 | No. Advice only, gated on revenue |
| 16 | Penalties | Warning; fine up to SAR 1M; temporary/permanent suspension; partial/full blocking | Salla obligations |

**UAE** [Secondary]: Federal Law 15/2020 on Consumer Protection + Cabinet Decision 66/2023 (in force 14 Oct 2023); Federal Decree-Law 14/2023 on trading through modern technology. Arabic is required (other languages may be added); suppliers must disclose identity, publish complaint mechanisms, and issue a dated invoice. Return-window rules: **not verified**. Sources: https://cms.law/en/are/legal-updates/the-uae-s-new-consumer-protection-landscape-implications-and-key-provisions ; https://www.mondaq.com/dodd-frank-consumer-protection-act/1418004/update-uae-consumer-protection-and-e-commerce-laws
**Kuwait**: **not verified** (search returned nothing usable). Do not ship Kuwait legal checks yet.
**Egypt** [Secondary]: Law 181/2018 + Decree 822/2019: 14 days to return/exchange without reason; 30 days for defective goods; sources conflict on a 7- vs 14-day online cancellation window. Tax Authority e-receipt mandate widened from 15 Sep 2025. https://alp.unescwa.org/legislations/law-181-2018-promulgating-consumer-protection-law ; https://kpmg.com/us/en/taxnewsflash/news/2025/07/tnf-egypt-new-taxpayers-required-to-comply-with-mandate-to-issue-electronic-receipts-for-b2c-transactions.html

**[Inference]** Frame this block as "what the Ministry checks and what shoppers look for", not as legal advice. Every item states "found / not found on the pages we visited" with the page link, so the owner can check it in seconds. The ICP card warns that one disprovable compliance finding discredits the report: gate VAT and e-invoicing items, and treat SBC as "eligible Saudi stores".

---

## 4. Seasonality (dates for 2026–2027)

Hijri dates follow the Umm al-Qura projection and can move a day with moon sighting. Weekdays computed.

| Season | Date | What moves | Prep window | Tag |
|---|---|---|---|---|
| Payday | 27th of each Gregorian month (moves for weekends) | Spending dips in the weeks before payday and rebounds after (POS data). Elevr owners: sales dip from the 11th, recover ~20th | Every month: time offers/reminders to the 25th–28th | [Secondary] https://www.intellinews.com/saudi-point-of-sale-transactions-reach-sar11-5bn-last-week-377793/ |
| 11.11 | 11 Nov 2026 (passed); 11 Nov 2027 (Thu) | Part of the Nov peak | — | ICP card §19.5 |
| **White Friday / Cyber Monday** | **Fri 27 Nov 2026 / Mon 30 Nov 2026**; Fri 26 Nov 2027 | MENA: GMV +59%, orders +46% vs the 2025 average week; Nov +44% in 2023–24. KSA 2024: revenue +40% (Campaign ME) | Now (2 weeks left); 2027: from early Oct | [Secondary] hidubai/Admitad; ICP card §17.5 |
| UAE National Day | 2 Dec 2026 | UAE stores | Late Oct–Nov | ICP card |
| December | — | MENA Dec +19% (2023–24) | — | [Secondary] |
| School mid-year break | from ~8 Jan 2027 | Travel; unmeasured | — | [Secondary aggregator] |
| **Ramadan–Eid discount season (MoC)** | 2025 ran 10 Sha'ban–5 Shawwal (9 Feb–3 Apr 2025). For 1448 that is **≈ 18 Jan–13 Mar 2027** | Licensed discounts don't use the annual allowance | Apply for licence before announcing | [Official 2025 via amlak; 2027 = Inference] |
| Week before Ramadan | ≈ 1–7 Feb 2027 | Saudi spending +34.7% in the pre-Ramadan week (one year) | Stock, offers and fixes live by end of January | [Secondary via Tamara] https://tamara.co/en-sa/blog-post/the-ramadan-2026-playbook-turn-business-insights-into-revenue |
| **Ramadan 1448** | **≈ Mon 8 Feb – Mon 8 Mar 2027** | Tamara orders up to +60% in the first week of Ramadan 2025 (KSA+UAE); retail search +45% in KSA as the month goes on; shopping +38% after Taraweeh, peak **10 pm–2 am**; Noon +45% and Amazon.sa +38% orders in Ramadan 2026 (weak source); Meta CPMs +68% (agency) | Fix-before-peak push: **late Dec 2026–mid Jan 2027** | [Vendor/Secondary] Tamara; https://themiddleeastinsider.com/2026/03/14/saudi-ramadan-economy-2026-spending-retail-trends/ ; BIMO via ICP |
| **Founding Day** | **Mon 22 Feb 2027 (inside Ramadan)** | Heritage products, traditional wear; 2026 had a "Super Weekend" 20–22 Feb | Combine with Ramadan creative | [Vendor] Tamara |
| Kuwait National/Liberation Days | 25–26 Feb 2027 | Kuwait stores | — | [Known, not researched] |
| **Eid al-Fitr** | **≈ Tue 9 Mar 2027** | Ramadan/Eid +11%/+14% (MENA, 2023–24); clothes, perfume, gifts | Last-10-nights delivery cut-off messaging | [Secondary] |
| **Eid al-Adha** | **≈ Sun 16 May 2027** (Arafat 15 May) | Gifting, clothes; unmeasured | Early May | [Secondary aggregator] https://www.officeholidays.com/holidays/saudi-arabia/eid-al-adha |
| School year ends | ≈ 24 Jun 2027 | Summer travel; unmeasured | — | [Secondary aggregator] https://mdares.ai/sa-en/calendar |
| MoC "Sales Season" | 1 Aug–31 Oct 2026 (2027 not yet announced) | Back to school + National Day | — | [Secondary] origami.sa citing SPA |
| Back to school | 2026 started ~23 Aug 2026; 2027 ≈ mid/late Aug | Stationery, kids, electronics | Late Jul | [Secondary; 2027 Unverified] |
| **Saudi National Day** | **Thu 23 Sep 2027** | MoC issued 4,218 discount licences in 2025, >3,500 in 2026. **POS spend in National Day week rose only +3.0% WoW (2025) and +11.9% (2024), and that week is also payday week.** Riyadh 35.7% of spend | Offers are licence-driven; it shifts what people buy more than how much | [Official/Secondary] https://cdn.saudigazette.com.sa/article/655101 ; https://www.qoyod.com/en/reports/saudi-national-day-spending/ |

**[Inference]** Ramadan + Founding Day + Eid is the single biggest window and starts ~8 Feb 2027; the owner's fix deadline is mid-January. White Friday is the only peak left in 2026. National Day is an offer season, not a market-wide spike, so the report should not promise a National Day jump.

---

## 5. Platform specifics (exact admin paths, official help docs only)

Checked 12 Nov 2026 in official help articles only. "Not confirmed" = no official article found; do not print a path for it. Salla's new dashboard puts most pages under the main menu's **«الكل»** (All); older articles (marked ⚠OLD, which Salla flags «هذه المقالة قديمة») still use the old sidebar «إعدادات المتجر». Prefer the newer paths in report copy.

### 5.1 Salla (help.salla.sa)

| Fix | Path | Source (last updated) | Notes |
|---|---|---|---|
| Carriers + prices | الكل > الشحن والتوصيل | https://help.salla.sa/article/البدء-مع-إدارة-الشحن-الموحد-shipping-management/avovvtw08svsd6wso6g5uras (29 Aug 2026) | Prices per zone |
| **Free delivery above X** | الكل > إعدادات الشحن > الشحن المجاني (set minimum order, by country/city) | https://help.salla.sa/article/%D8%AA%D8%AE%D8%B5%D9%8A%D8%B5-%D8%A5%D8%B9%D8%AF%D8%A7%D8%AF%D8%A7%D8%AA-%D8%B4%D8%B1%D9%83%D8%A7%D8%AA-%D8%A7%D9%84%D8%B4%D8%AD%D9%86-1/a3rs9t99nha3ebcr1noflpkp (11 Nov 2026) | COD min/max order on the same page |
| Payment methods | الكل > الإعدادات والأدوات > طرق الدفع > تفعيل | https://help.salla.sa/article/تفعيل-طرق-الدفع-في-المتجر/dcrwxldslve7spa8eqdgii8g (31 Aug 2026) | COD works on the Basic plan; online payment needs a paid plan |
| mada / Apple Pay / STC Pay | طرق الدفع > المدفوعات الإلكترونية > تفعيل; Apple Pay turns on with mada + Visa; STC Pay under wallets | https://help.salla.sa/article/-إدارة-طرق-الدفع-وتفعيل-المدفوعات-الإلكترونية/dtdojcntv3f4lwqzj4h0jvij (⚠OLD) | |
| Tabby / Tamara | طرق الدفع > اشترِ الآن وادفع لاحقاً > تابي | https://help.salla.sa/article/تفعيل-وسيلة-الدفع-الآجل-تابي-tabby/dy7yvan3npix92pammram3jv (31 Aug 2026) | New Tabby account from Salla: Saudi stores only. **PDP installment widget: not confirmed** |
| **COD fee** | Open the carrier > تبويب تسعيرة الشحن > turn on الدفع عند الاستلام and enter the fee. Store-wide COD rules: إعدادات الشحن والتوصيل > تخصيص الدفع عند الاستلام | https://help.salla.sa/article/%D8%AA%D9%81%D8%B9%D9%8A%D9%84-%D9%88%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%AF%D9%81%D8%B9-%D8%B9%D9%86%D8%AF-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%84%D8%A7%D9%85-%D9%85%D8%B9-%D8%A8%D9%88%D9%84%D9%8A%D8%B5%D8%A7%D8%AA-%D8%B3%D9%84%D8%A9/koda8pykc6pdhylg7zb2iu0g (12 Nov 2026) | Fee may be above or below the carrier's charge |
| Product options | المنتجات > إدارة التصنيفات والخيارات > + إضافة الخيارات (or the options section in the product) | https://help.salla.sa/article/%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%AE%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC/fz6e4g9ohl7rnv4g561vexl6 (4 Nov 2026) | **Size guide: not confirmed** |
| **Reviews** | إعدادات الأسئلة والتقييمات: «إتاحة التقييم في صفحة المنتج» + «رسائل طلب التقييم» (content, timing, channel) | https://help.salla.sa/article/%D8%A5%D8%B9%D8%AF%D8%A7%D8%AF%D8%A7%D8%AA-%D8%A7%D9%84%D8%A3%D8%B3%D8%A6%D9%84%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D9%82%D9%8A%D9%8A%D9%85%D8%A7%D8%AA/aabq56x93oe6zhg855369kzc (12 Oct 2026) | PDP reviews on paid plans only; new article gives no menu path (⚠OLD: sidebar > الأسئلة والتقييمات) |
| **Abandoned-cart reminders** | التسويق > السلات المتروكة > تبويب التذكيرات التلقائية | https://help.salla.sa/article/التذكير-بالسلة-المتروكة-بدون-إرسال-خصم/ivwfzya8mtzhew7dfzptak24 (9 Sep 2026) | SMS, email; push (App Maker only); WhatsApp (Salla WhatsApp subscription only). Up to 5 reminders per market. Alt: الكل > الأدوات المساعدة > الأتمتة > القوالب > «استرجاع السلات المتروكة» (paid plans) |
| WhatsApp / contact | الإعدادات الأساسية > contact channels (phone, WhatsApp, social) → shown in footer | https://help.salla.sa/article/229626873 (⚠OLD) | **Floating WhatsApp button: apps only**, no built-in one confirmed |
| **Policy pages** | المتجر وقنوات البيع > الصفحات التعريفية > صفحة جديدة; type: عامة / سياسة الاستخدام والخصوصية / سياسة الاستبدال والاسترجاع | https://help.salla.sa/article/إدارة-الصفحات-التعريفية/kdcldn0jro4n50amy4zwusga (12 Oct 2026) | No shipping-policy page type (use a general page) |
| SEO | Store: الأدوات التسويقية > تحسين محركات البحث > الإعدادات العامة > تحسينات الصفحة الرئيسية. Product: بيانات المنتج > تحسينات SEO | https://help.salla.sa/article/233488822 (18 Aug 2026) | |
| GA4 / GTM | GA4: الكل > متجر التطبيقات > Google Analytics > تثبيت > الانتقال لإكمال التفعيل. GTM: All > Helper tools > App Store > Google Tag Manager > Install > App connection settings > Activate | https://help.salla.sa/article/الربط-مع-google-analytics-1/z4rsuykst74ym5nh77ct7im2 (1 Sep 2026); https://help.salla.sa/en/article/connect-google-tag-manager/o26202al1ruesf4mzawzij5q (29 Aug 2026) | Meta pixel app ⚠OLD; **Snap/TikTok paths not confirmed** |
| **VAT number in footer** | الكل > الإعدادات والأدوات > طرق الدفع > تبويب ضريبة القيمة المضافة → set tax number; shows in footer with certificate | https://help.salla.sa/article/%D8%A5%D8%B9%D8%AF%D8%A7%D8%AF-%D8%B6%D8%B1%D9%8A%D8%A8%D8%A9-%D8%A7%D9%84%D9%82%D9%8A%D9%85%D8%A9-%D8%A7%D9%84%D9%85%D8%B6%D8%A7%D9%81%D8%A9/itdzlot4huy9zpfw3o342j6k (31 Aug 2026) | **Salla Pro and Special plans only** |
| **CR / SBC badge** | الكل > توثيق المتجر: CR details → badge in footer; enter the SBC e-commerce certificate number on the same page → SBC logo + link in footer automatically. Older route: store design > header & footer > footer settings > «Business Platform certificate» | https://help.salla.sa/article/%D8%AA%D9%88%D8%AB%D9%8A%D9%82-%D9%85%D8%AA%D8%AC%D8%B1%D9%83-%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF-%D9%81%D9%8A-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9/ig4b4l5hc542j4bcd2tp82bz (4 Nov 2026); https://help.salla.sa/en/article/verify-store-on-business-platform-instead-of-maroof/gno9ilestioyspm61yu5buzp (22 Aug 2026) | Salla's own verification and SBC verification are separate; SBC itself is done on business.sa (DNS TXT record proves the domain) |
| Bundles / "you may also like" | Products > + Create new product > Bundle product; «عرض منتجات ربما تعجبك في صفحة المنتج» in store options | https://help.salla.sa/en/article/bundle-product-multiple-products/uiiuungjg24n3bbtcqbt6phy (17 Oct 2026); https://help.salla.sa/en/article/you-may-also-like-products/y0isabjqis4toyjwzlnkbfov (⚠OLD) | Fixed bundle up to 10 products |
| Announcement bar | المتجر وقنوات البيع > تصميم المتجر > تخصيص > صفحات المتجر > تبويب رأس الصفحة > الشريط الإعلاني > + إنشاء إعلان جديد | https://help.salla.sa/article/%D8%AA%D8%AE%D8%B5%D9%8A%D8%B5-%D8%A7%D9%84%D8%B4%D8%B1%D9%8A%D8%B7-%D8%A7%D9%84%D8%AA%D8%B1%D9%88%D9%8A%D8%AC%D9%8A-%D8%A3%D8%B9%D9%84%D9%89-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/k70g0e7z5tto9xx8ilgyvq6n (1 Nov 2026) | **Free-delivery progress bar: not confirmed** |
| Reports (owner's own numbers) | Reports > Store performance (> Conversion rate / Abandoned carts) | see §1.2 | |

### 5.2 Zid (help.zid.sa new help center; all updated Oct–Nov 2026)

Use these, not the Dec 2024 intercom.help/zid copies (outdated paths). URLs are relative to https://help.zid.sa.

| Fix | Path | Source | Notes |
|---|---|---|---|
| Carriers | الشحن والتوصيل > «شركات الشحن الأخرى» > استعراض > عرض التفاصيل > تفعيل الآن | /ar/logistics/integrations (5 Nov) | |
| **Free delivery above X** | اللوجستيات > الإعدادات > شروط الشحن المجاني > تخصيص → الحد الأدنى للمشتريات | /ar/logistics/free-shipping (5 Nov) | Threshold counts the cart **including VAT** |
| Payments | المدفوعات > تفعيل الدفع الإلكتروني (بطاقات الدفع card); mada/Visa/Apple Pay: المدفوعات > إدارة > تبويب شبكات الدفع; BNPL: المدفوعات > الدفع لاحقاً > تابي / تمارا | /ar/payments (2 Nov); /ar/payments/apple-pay (3 Nov); /ar/payments/tabby, /ar/payments/tamara (2 Nov) | Card payments plan-dependent. **STC Pay not confirmed** |
| **COD + fee** | اللوجستيات > طرق الشحن > [method] > تبويب التخصيص > تعديل (zone) → «الدفع عند الاستلام (COD)» + «سعر الدفع عند الاستلام (COD)» | /ar/payments/cash-on-delivery (5 Nov) | Per zone; COD restriction rules need Growth/Professional/Enterprise |
| Options / **BNPL widget on PDP** | Options: المنتجات > مكتبة الخيارات > إنشاء. Widget: tick «إظهار تابي في صفحة المنتج» or «عرض خيار تمارا في صفحة المنتج» in the provider form (cart checkbox too) | /ar/products/variants (28 Oct); Tabby/Tamara articles | **Size guide not confirmed** |
| **Reviews** | العملاء > التقييمات > تفعيل الآن; review requests in إعدادات الإشعارات (SMS/email/WhatsApp, X hours after order) | /ar/customers/reviews (28 Oct) | Some features plan-dependent |
| **Abandoned carts** | الطلبات > السلات المتروكة > إدارة التنبيهات | /ar/orders/abandoned-carts (28 Oct) | Not on free plans; WhatsApp needs subscription + balance; SMS needs approved sender |
| **WhatsApp button** | الواتساب > الإعدادات > زر واتساب | /ar/whatsapp/store-widget (26 Oct) | Needs Zid WhatsApp subscription |
| **Policy pages** | الإعدادات > المتجر > الصفحات القانونية (or المتجر الإلكتروني > الصفحات > الصفحات القانونية) | /ar/store-settings/legal-pages (28 Oct) | Privacy, terms, returns & exchange, **complaints**, licences. No shipping-policy page |
| SEO | Store: المتجر الإلكتروني > تحسين محركات البحث > إدارة (عنوان الصفحة / وصف الصفحة). Product: المنتجات > كل المنتجات > [product] > تحسين محركات البحث | /ar/online-store/seo; /ar/products/product-details (28 Oct) | |
| GA4 / GTM / pixels | التطبيقات > سوق التطبيقات: Google Analytics, Tag Manager (free); Meta/TikTok/Snap/X pixels: app page > تفعيل | /ar/apps/google-tools (26 Oct); /ar/apps/ad-pixels (27 Oct) | Meta CAPI only on Growth+ |
| **VAT / CR in footer** | VAT: الإعدادات > عام > إعدادات الضرائب → «عرض الرقم الضريبي في تذييل صفحة المتجر» / «عرض شهادة ضريبة القيمة المضافة في تذييل…». CR: الإعدادات > المتجر > بيانات المتجر > تبويب تفاصيل النشاط التجاري | /ar/sales-settings/tax (28 Oct); /ar/store-settings (5 Nov); /ar/store-settings/business-platform-verification (26 Oct) | VAT footer options appear when country = Saudi; CR option not for individuals. **SBC footer badge in Zid: not confirmed** (Zid only adds the TXT record) |
| Bundles / upsell | التسويق > الحزم التسويقية > إنشاء > «اشتر منتج واحصل على الآخر»; upsell via partner app «زيادة حجم السلة بالذكاء» | /ar/discounts/bundle-offers (26 Oct); /ar/apps/upsell (28 Oct) | Plan-dependent; app is paid |
| Announcement bar | المتجر الإلكتروني > الثيمات > تخصيص > شريط الإعلانات | /ar/online-store/theme-editor (27 Oct) | Built-in free-delivery progress bar not confirmed (upsell app has a free-shipping goal) |

### 5.3 Shopify (help.shopify.com/en; pages show no date)

Current labels: theme editor is **Online Store > Edit theme** (not "Themes > Customize"); abandoned-checkout emails live under **Apps > Messaging > Automations**.

| Fix | Path | Source | Notes |
|---|---|---|---|
| **Free delivery above X** | Settings > Shipping and delivery > [profile] > [zone] > Add shipping option > "Offer free shipping" + minimum order (or "Order amount" tiers with 0 on top tier) | /manual/fulfillment/setup/shipping-rates/flat-shipping-rate | |
| Payments | BNPL: Settings > Payments > Additional payment methods > Add payment methods > search > Activate. Apple Pay: Settings > Payments > Manage > Wallets. COD: Settings > Payments > Payment providers > manual method | /manual/payments/additional-payment-methods/activate-payment-methods; /manual/payments/accelerated-checkouts/apple-pay/set-up; /manual/payments/manual-payments | Docs don't name Tabby/Tamara; **COD fee, mada, STC Pay not confirmed** |
| Variants | Products > [product] > Variants > "+ Add options like size or color" | /manual/products/variants/add-variants | Max 3 options |
| Reviews | No built-in storefront reviews; use a supported app | /manual/products/product-reviews | |
| Abandoned checkout | Apps > Messaging > Automations > "Abandoned checkout emails by Shopify" > Edit settings > send automatically | /manual/orders/abandoned-checkouts/abandoned-checkout-emails | Email only; WhatsApp needs an app |
| Chat | Online Store > Edit theme > App embeds > Online store chat (Shopify Inbox) | /manual/inbox/chat-settings-and-appearance/settings | WhatsApp button: app (not confirmed) |
| Policies | Settings > Policies > Written policies (refund, privacy, terms, shipping) | /manual/checkout-settings/refund-privacy-tos | |
| SEO | Store: Online Store > Preferences > "Social sharing image and SEO". Product: Products > [product] > Search engine listing | /manual/promoting-marketing/seo/adding-keywords | |
| GA4 / pixels | GA4: Google & YouTube sales channel; custom pixels/GTM: Settings > Customer events > Add pixel | /manual/reports-and-analytics/google-analytics/google-analytics-setup; /manual/promoting-marketing/pixels/custom-pixels/manage | Snap/TikTok not confirmed |
| Bundles / FBT | Apps > Bundles > Create bundle; Apps > Search & Discovery > Product recommendations > Complementary products, then Edit theme > Default product > Add block | /manual/products/bundles/shopify-bundles; /manual/online-store/search-and-discovery/product-recommendations | |
| Announcement bar | Online Store > Edit theme > Announcement bar > Add Announcement | /manual/online-store/themes/customizing-themes/common-customizations/add-announcement-banner | Up to 12 announcements |
| Benchmarks | Reports > (compatible report) > Compare > Benchmarks | §1.2 | |

**Not confirmed anywhere (say "in your platform settings" instead of a path):** size guide (all three); free-delivery progress bar (all three); BNPL PDP widget (Salla, Shopify); STC Pay (Zid, Shopify); mada and COD fee (Shopify); Snap/TikTok pixel paths (Salla, Shopify); SBC footer badge (Zid).

**[Inference] Plan gates matter for advice:** Salla VAT number display (Pro/Special), Salla PDP reviews (paid plans), Salla WhatsApp reminders (subscription), Zid abandoned carts (not on free plan), Zid COD rules and Meta CAPI (Growth+), Zid WhatsApp button (subscription). A fix that needs a plan upgrade must say so, or the owner hits a wall.

---

## 6. What makes a self-serve audit valuable and trusted

### 6.1 What existing tools do (and don't)

| Tool | What it gives | What it lacks for this owner | Source |
|---|---|---|---|
| Salla Store Performance | Funnel, CR, abandoned carts with lost revenue, payments, delivery, inventory | No benchmark, no score, no recommendations; visits need GA4 | [Official] above |
| Salla «محلل المتاجر» | Free Arabic paste-a-URL SEO/GEO score, ranked fixes, honest "limited analysis" | No CRO, money, checkout or payment checks | ICP card §19.3 |
| Shopify Benchmarks | Median + 25th/75th percentile of similar stores in charts | Shopify only; no "why" or fix | [Official] above |
| Google Grow My Store | 22 metrics in 8 categories, benchmark vs sector, tips | Seen as generic; pushes Google products | [Secondary] https://www.cyberclick.net/numericalblogen/googles-grow-my-store-what-is-it-and-how-to-use-it-in-your-ecommerce |
| Clarity / Hotjar | Free recordings, heatmaps, rage/dead clicks | No diagnosis, no money, no fixes; owner must watch sessions | ICP card §19.4 |
| Lighthouse / PageSpeed | Lab score + field data (CrUX, 28 days) when available | Score swings ±5 between runs; lab ≠ real users; fixes are developer language | [Secondary] web.dev, DebugBear |
| Shopify AI audit apps (AuditIQ etc.) | 40+ CRO checks, revenue-impact ranking, $10–99/mo | English, Shopify-only; complaint pattern: generic lists, non-delivery | ICP card §19.3; appnavigator reviews |

### 6.2 Formats that get acted on (evidence)

- **Progress you can see.** Pre-filled progress nearly doubles completion: 34% vs 19% in the car-wash card field test (Nunes & Drèze 2006, J. Consumer Research). [Research, secondary summary] https://siliconcanals.com/t-car-wash-loyalty-cards-endowed-progress/ → a checklist that starts with the passed points already ticked, and a re-scan that ticks the next ones.
- **Benchmarks as a band, not a single "average".** Shopify uses median and quartiles of similar stores. [Official]
- **Evidence chain and grouped root causes.** Shopify merchants ask for it explicitly (6.1). [Forum]
- **Separate "proven by our visit" from "needs your check".** Same thread; matches the ICP rule that every number shows its source. [Forum + ICP]
- **Seen with their own eyes.** Owners trust what they can check (ICP §6: named, checkable proof). Annotated phone screenshots per finding are the cheapest proof. [Inference]
- **Short, ranked, effort-labelled.** Owners get lost in dashboards (forum); Tabby's 2026 report itself presents fixes as Priority / Shopper impact / Effort tables and recommends "high-impact, low-effort fixes such as product clarity, pricing transparency and trust signals" first. [Survey publisher's framing]
- **Calculators** only with the owner's own inputs (COD, free-delivery threshold). [Inference from ICP pain #2]
- **Short videos**: no evidence found for or against for this audience. [Unverified]

### 6.3 What makes owners distrust a report

1. A number that contradicts their Salla/Zid dashboard with no explanation (ICP §7).
2. A finding they can disprove (ICP §7; e.g. a VAT or ZATCA flag on a store below the threshold, or "no WhatsApp" when it is in a floating button the crawl missed).
3. A speed score that changes when they re-test (±5 noise). Show field data or a range, and say what changed.
4. Generic advice ("add trust badges", "improve CTAs") without their page, their product or their number (forum).
5. English or mixed numerals on Arabic screens (ICP §7).
6. Market averages presented as their loss (e.g. COD refusal %).

---

## 7. High-ROI fixes for small GCC stores, ranked by evidence

Strength: **A** = several independent surveys/experiments incl. GCC; **B** = one GCC survey or strong global evidence; **C** = vendor claims/anecdote.

| Rank | Fix | Evidence | Strength | Owner can do it? |
|---|---|---|---|---|
| 1 | Show the total cost early: delivery fee or free-delivery threshold on PDP and cart; no COD/other surprise at the last step; VAT-inclusive prices | Baymard 40% extra costs + 12% total not visible; Tabby 2026 17.0% abandon on delivery cost, 17.7% frustrated; Tabby 2025 ×2 intent when delivery is "free" in the price; legal requirement (total price incl. tax and delivery) | **A** | Yes (settings + text) |
| 2 | Show the payment methods Saudis expect (mada, Apple Pay, STC Pay, Tabby/Tamara, COD) before checkout | Tabby 2025: 35% top checkout frustration, 15.9% red flag; Tabby 2026: secure payment options top trust driver 24.2%; Stripe Apple Pay +22.3%; BNPL >20% of online value | **A/B** | Yes (enable + PDP widget) |
| 3 | Reviews on product pages (count, Arabic, photos) | Tabby 2025: #1 improver 36.0%, #1 red flag 21.1%; Tabby 2026: 18.9% judge trust by reviews; Spiegel: 5 reviews → purchase likelihood +270%, +380% for higher-priced items (https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales); photo UGC impression lift only +2.5–3.8% (PowerReviews; the 100%+ "interactor" lift is self-selected) | **A** | Yes (built-in + review-request messages) |
| 4 | Visible contact: WhatsApp/phone/email + Arabic chat | Tabby 2025: 18.7% red flag; legal requirement; WhatsApp daily 9/10 | **A/B** | Yes |
| 5 | Clear product info: Arabic title/description, specs, size guide, real photos, stock status | Tabby 2026: 18.5% #1 frustration; out of stock 15.7%; Arabic display is law; Elevr: Gulf sales come from Arabic titles | **B** | Yes |
| 6 | Delivery promise as days/date per city on PDP and cart | Legal requirement; Baymard: users stall without a date (https://baymard.com/blog/shipping-speed-vs-delivery-date); Baymard 20% abandon on slow delivery; 31.1% value next-day | **B** | Yes (text; delivery settings) |
| 7 | Returns policy clear and linked near Add to Cart | Tabby 2026 10.8%; Baymard 13%; returns complaints top at MoC | **B** | Yes |
| 8 | Abandoned-cart reminders on WhatsApp (built-in Salla/Zid or app) | Read rates 70–94% vs 40–45% email [Vendor]; owners already pay for it (509 reviews); Salla built-in reminders with/without discount | **C** (effect size unverified) | Yes |
| 9 | Remove checkout friction: pop-ups, forced account, OTP problems | Tabby 2025: OTP 19%, pop-ups 18%, no guest checkout 7%; Baymard 18% forced account | **B** (but OTP/login is largely platform-controlled) | Partly |
| 10 | SBC badge + CR/VAT number in footer | Legal; MoC found store verification among the weakest standards (75–79%); "secure / well-known" are top trust drivers. **No study of the badge's conversion effect found** | **C** for conversion, **A** for compliance | Yes (if eligible) |
| 11 | Page weight / apps / images on phone | Deloitte: 0.1 s faster mobile → retail conversions +8.4%, AOV +9.2% (https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html); but shoppers rank slowness last (6.4–6.8%) and KSA bandwidth is high | **B** global / low stated priority | Partly (apps, images; theme is platform) |
| 12 | COD fee disclosed and COD limits set (hide below SAR X, block repeat refusers) | Aramex SAR 8 + 1%; Salla built COD restrictions for this; Elevr anecdote | **C** | Yes |
| 13 | Bundles / quantity offers to lift AOV | Owners pay SAR 25–99/mo for it; uplift evidence vendor-only | **C** | Yes (app) |
| 14 | Free-delivery bar / announcement bar | Follows from #1; no independent effect size found | **C** | Yes |

---

## 8. What this means for the report: 25 ranked features

Ranked by benefit to this owner (money at stake × evidence × how often it applies to small Salla/Zid stores). "Data" says what the audit already has: **Crawl** = crawl/phone visit of public pages; **GA4**; **Clarity**; **New** = needs something we don't collect. "Today" notes what the worker already does, from a grep of `audit-worker/src` (2026-11-12). Across all 25: each fix should name the confirmed path from §5 and any plan gate (e.g. Salla has no built-in floating WhatsApp button, only apps; Zid's needs a WhatsApp subscription; Salla's VAT-number display needs Pro/Special).

1. **"Total cost before checkout" finding (delivery fee or free-delivery threshold, COD fee, VAT-inclusive price) shown on the phone screenshots of PDP and cart.** Evidence: Baymard 40%; Tabby 17.0%/17.7%; Tabby ×2 intent; legal total-price rule. Data: Crawl (exists: `fud/rules.ts` shipping-cost + cart-total rules). New: read the COD fee on the checkout page when reachable without login.
2. **Payment-methods row: mada · Apple Pay · STC Pay · Tabby · Tamara · COD, each "shown on product page / only at checkout / not found".** Evidence: 35% top checkout frustration; 15.9% red flag; BNPL >20% of value; Apple Pay +22.3%. Data: Crawl (exists: `paymentNames`, Tabby/Tamara widget detection in `fud/signals.ts`). Change: one per-method table instead of a pass/fail.
3. **Free-delivery threshold from the store's own AOV, with one SAR number and the copy to paste («توصيل مجاني للطلبات فوق 250 ر.س»).** Evidence: Tabby experiment; 57% value free delivery; local thresholds SAR 300–400. Data: GA4 + Crawl (exists: GA4-11, 1.1–1.6× AOV band). New (nice): order-value distribution from GA4 to show how many orders sit just below the threshold.
4. **"What the Ministry checks" trust block (Saudi stores): SBC badge, CR/freelance number, VAT number (only "if registered"), phone + email, Arabic chat, complaint channel + response time, terms/privacy/returns pages, 7-day returns, delivery time, Arabic product display.** Each line: found / not found + page link + platform path. Evidence: Salla obligations (fines up to SAR 1M); MoC weakest standards include verification; Tabby "no contact" 18.7%. Data: Crawl. **New check** (no SBC/CR/VAT-number check exists in the worker today). Gate VAT/e-invoicing on revenue; SBC worded for eligible Saudi owners.
5. **Reviews finding: count on top products, Arabic, photos, placement near price; how to switch on review-request messages.** Evidence: Tabby 36.0% / 21.1%; Spiegel +270%. Data: Crawl (review widgets/stars on PDP). New: per-product review count extraction if not already parsed.
6. **Delivery promise check: days or date by city, on PDP and cart, matching the delivery policy.** Evidence: legal; Baymard; next-day 31.1%. Data: Crawl (exists: "Delivery time is shown before buying" in `checklist-persona-data.ts`). Change: add the legal reason and a paste-ready Arabic line («يوصلك خلال 1-3 أيام عمل داخل الرياض»).
7. **One money number reconciled with the Salla/Zid dashboard: same 5 step names (Visits → Add to cart → Cart view → Checkout started → Order completed), same CR definition, and a line explaining any gap (e.g. "GA4 sees 72 of your 100 orders").** Evidence: Salla funnel definitions; ICP pain #2; Elevr GA4 missing 28% of orders. Data: GA4 (exists). New: owner types their Salla order count (or a Salla/Zid connector) to compute the tracking gap.
8. **Group symptoms into root causes; owner view capped at ~10 findings, each written as: what we saw → what it costs → what to do → how sure we are.** Evidence: Shopify merchants' "evidence chain", "not a longer list"; Salla help admits reports overwhelm. Data: existing findings; ordering/merging only.
9. **Every finding carries an annotated phone screenshot (and the "after" mockup where we have one).** Evidence: ICP "checkable proof"; 62–80% mobile; forum. Data: Crawl (exists: evidence crops, screens section). Change: no finding without a crop in the owner view.
10. **Fix checklist with progress and a re-scan delta ("6 of 14 done; 2 fixed since last scan").** Evidence: endowed progress 34% vs 19%; ICP JTBD #3. Data: Crawl rescan diff. New: stored state per store between scans.
11. **Season card: next 2 peaks with dates and a "fix by" date (now: White Friday 27 Nov 2026; then Ramadan ≈ 8 Feb 2027 with Founding Day 22 Feb inside it, fix by mid-Jan), plus the MoC discount-licence reminder.** Evidence: section 4. Data: none needed (calendar) + GA4 year-on-year when retention is 14 months (exists: GA4-23). **New section** in the worker (no seasonal readiness today).
12. **Arabic content check: Arabic product titles/descriptions, Arabic default on phone, no English leaking on key pages.** Evidence: law (products in Arabic); Tabby 18.5% unclear descriptions; Elevr. Data: Crawl (partly exists in checklist). Change: show the product names that are English-only.
13. **WhatsApp: button visible on PDP and cart with a valid wa.me number; abandoned-cart reminders set up (path in Salla/Zid).** Evidence: 9/10 daily WhatsApp; most-reviewed paid app; MoC Arabic chat rule. Data: Crawl (exists: `site-checks.ts` validates WhatsApp/tel links). Reminder settings are not public → ask "do you send reminders?" with the platform path.
14. **Product page clarity: size guide, specs, stock status, real (not mannequin-only) photos.** Evidence: Tabby 18.5%, 15.7%; Elevr S6#411. Data: Crawl (partly exists). Change: tie to GA4-10 (products with weak add-to-cart rate) so the owner sees *which* products.
15. **Tracking health in owner words: "GA4 sees X of your Y orders; purchase step not recorded".** Evidence: Elevr GA4 gaps; ~3 in 4 Zid stores show no GA4 tag (ICP §19.2). Data: GA4 (exists: GA4-17, GA4-20). New: order count from owner/platform for the X-of-Y line.
16. **COD cost line in SAR using the store's own inputs (COD share, refusal rate, courier COD fee).** Evidence: ICP JTBD #5; Aramex SAR 8 + 1%; Salla's COD restrictions. Data: **New** (owner input or platform export; GA4 rarely has payment type). Never use a market refusal rate.
17. **Benchmark band "stores like yours" (median and 25th–75th percentile) from our own audit corpus, labelled as ours, shown only with enough stores per category.** Evidence: Shopify Benchmarks format; Salla has none; competitor data is the #1 upgrade trigger (ICP §6). Data: **New** (corpus aggregation).
18. **Clarity behaviour tied to an element and a fix ("38 rage taps on the size selector on phone").** Evidence: forum "prioritise by actual behaviour"; Clarity free on Salla. Data: Clarity (exists: `clarity-facts.ts` dead/rage/quick-back/excessive scroll). Change: element/page level where Clarity gives it.
19. **Speed in owner terms: real-user (field) data when available, a range not one score, and only what the owner controls on Salla/Zid (apps, images, pop-ups).** Evidence: ±5 noise; lab ≠ field; Deloitte +8.4%; shoppers rank slowness last. Data: PageSpeed (exists: `pagespeed.ts`). Change: demote below payments/costs/reviews unless field data is poor.
20. **Checkout friction check: pop-ups over the checkout, forced account, OTP step, number of steps on phone.** Evidence: Tabby OTP 19%, pop-ups 18%, guest 7%; Baymard 18%. Data: Crawl/phone visit up to the login wall. Note: OTP/login is mostly platform-controlled; say what the owner can change.
21. **Offer consistency: strike-through prices, ad coupon vs checkout price, and "licensed discount" reminder in season.** Evidence: MoC licence rule; Elevr S6#302. Data: Crawl (prices). New: ad-landing coupon comparison (media-buyer data).
22. **AOV levers: bundles/quantity offers and cart add-ons, sized with GA4 items per order.** Evidence: owners pay for upsell apps; KW AOV 18 KWD with bundles. Data: Crawl (widget detection) + GA4 (items/order: new field).
23. **Country fit for UAE/Kuwait/Egypt stores: currency and language by visitor country, KNET for Kuwait, Arabic required in UAE, 14-day returns in Egypt.** Evidence: section 3; Elevr S6#147. Data: GA4 country (exists: GA4-09) + Crawl. New: geo-located crawl to see currency switching.
24. **WhatsApp delivery of the summary and a pre-season re-scan reminder.** Evidence: WhatsApp 89.4% vs email 11.7% (ICP); 85% open to brand chat (Snap). Data: **New** (channel, opt-in).
25. **10–30 second "where to click" clip or GIF per platform fix.** Evidence: none found specific to this audience [Unverified]; owners are non-technical. Data: **New** (content production). Lowest priority.

---

## 9. Could not verify (do not state as fact)

- Saudi/GCC conversion rate and mobile-vs-desktop split from a primary source.
- COD refusal and return rates by country (only vendor or hypothesis figures).
- Arabic-language preference percentage for Saudi shoppers.
- Conversion effect of the SBC badge, Tabby/Tamara PDP widgets, free-delivery bars, size guides, WhatsApp cart reminders (all vendor claims).
- Kuwait e-commerce legal display rules; UAE return-window rules.
- 2027 MoC season windows; 2027 back-to-school date; exact Hijri dates (moon sighting).
- National Day and Founding Day e-commerce uplift (only POS data found).
- SMSA COD fee (two conflicting secondary figures).
- Whether Salla/Zid checkout OTP/login can be changed by the merchant.

## Sources (main)

Surveys: Tabby 2025 guide https://cdn.tabby.ai/assets/retailers-guide/tabby-guide-en.pdf · Tabby 2026 survey https://cdn.tabby.ai/assets/Tabby-Survey-2026-English-compressed.pdf · Ipsos KSA 2024 https://www.ipsos.com/sites/default/files/ct/news/documents/2024-11/Spotlight%20KSA%20-%20Online%20Shopping%20Behaviour%20%26%20Attitudes.pdf · VML Future Shopper 2025 https://campaignme.com/uae-62-and-ksa-59-consumers-unhappy-with-online-shopping-vml-study-reveals/ · Checkout.com MENA https://www.checkout.com/newsroom/checkout-coms-4th-annual-mena-report-finds-cash-on-delivery-usage-halved-amongst-maturing-digital-economy · Baymard https://baymard.com/lists/cart-abandonment-rate
Official/platform: Salla obligations https://help.salla.sa/en/article/merchant-ecommerce-obligations/g0cbvwqncrfmptexs580y6f7 · Salla SBC https://help.salla.sa/en/article/verify-store-on-business-platform-instead-of-maroof/gno9ilestioyspm61yu5buzp · Salla VAT display https://help.salla.sa/en/article/set-up-display-vat/xkspnkuqw3lqhiexv4tsmfju · Salla Store Performance https://help.salla.sa/en/article/store-performance-page-your-gateway-to-growth-1/fqieyzzp3p4jrvbbasqhfp0i · Salla conversion report https://help.salla.sa/en/article/conversion-rate-reports/ndt3banqnk8z60luzrod1nu6 · Salla Aramex https://help.salla.sa/en/article/connect-aramex-standard-shipping/al1wqxesz2bj7goy2x58fa5x · Salla apps https://apps.salla.sa/ar · Zid apps https://apps.zid.sa/ · MoC SBC https://mc.gov.sa/en/mediacenter/News/Pages/29-03-23-02.aspx · ZATCA SME guideline (above) · E-Commerce Council standards https://amlak.net.sa/en/35110 · MoC Ramadan season https://amlak.net.sa/en/74008/ · Shopify Benchmarks (above) · StatCounter KSA (above)
Market: Redseer BNPL https://redseer.com/articles/bnpl-a-key-growth-engine-for-online-retail-in-ksa/ · Admitad/Flowwow https://focus.hidubai.com/early-festive-rush-sparks-mena-e-commerce-up-59-in-2025 · Tamara Ramadan 2026 https://tamara.co/en-sa/blog-post/the-ramadan-2026-playbook-turn-business-insights-into-revenue · Qoyod National Day https://www.qoyod.com/en/reports/saudi-national-day-spending/ · Stripe payment methods https://stripe.com/blog/testing-the-conversion-impact-of-50-plus-global-payment-methods · Deloitte https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html · Spiegel https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales · Shopify community thread https://community.shopify.com/t/what-would-you-want-an-ai-cro-audit-to-actually-find-on-your-store/665098
