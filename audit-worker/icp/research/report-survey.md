# Audit report survey (read-only, 2026-10-20) — saved from subagent hand-back

Renderer: audit-worker/src/html-report.ts (3787 lines). buildAuditHtmlReport :3770 -> withReaderSeverity :3777 -> renderReport :3699.

Render order: jump bar :1739 / TOC :1755 -> summary hero #overview summaryHtml :364 (same for all roles; lead text per role)
-> #answers questionsHtml :814 -> #fix-first fixFirstHtml :786 (storeOwnerFirstHtml :589, mediaBuyerFirstHtml :664 incl. roasMathHtml :617, funnelStripHtml :882, roasVerdictHtml :643, ownerHandoverHtml :905)
-> #screens :431 -> #numbers numbersSectionHtml :1846 (needs ga4Metrics) -> #friction frictionSectionHtml :1608 (insightsHtml :1580, ga4FollowUpHtml :1159, fudRowHtml :1496)
-> #checks checksIntroHtml :1314 / checkMapHtml :1999 -> categories categorySectionHtml :1342 / checkGroupsHtml :1277 / checkRowHtml :1217
-> #speed :1369 -> #sources :1399 -> ctaHtml :1672 -> footerHtml :1690 -> guideHtml :2042. Copy tables DEFAULT_COPY :941, ROLE_COPY :969-1082.

Above the fold today: same summary block for every role (H1 "X passed N of 50", lead, critical callout, per-category bars). Owner money hero sits 2+ screens down, after #answers.

GA4: ga4Facts (ga4-facts.ts computeGa4Facts :614) currency, periodDays, sessions, purchases, revenue, conversionRate, aov, focus{step,page,productUrl,landingUrl,campaignLandingUrl}, facts GA4-01..GA4-24 {status,en,money,handoff}. ga4Metrics (:701) funnel[], channels[], segments[]. No structured device array, no landing table. biggestMoney :505 never sums.
FUD: result.fud findings[] (ruleId, status, business/technical, recommendation, exampleCopy en/ar, evidence.crop, pexti, band, desktop), insights {opportunity, lines[], text}. STEP_BENCHMARKS fud/insights.ts:19.
Role: audienceRole (types.ts:269); audience.ts readerBrief, arabicRegisterRule, judgeBusinessRule, roleSeverity, mediaBuyerLane/Rank; ad-impact.ts AD_EFFECT; reader-questions.ts; email.ts topActionsOf :88, emailCopy :118, TALK_TRACK.
Preview: cd audit-worker; npm run preview-report -- --path=tracking --role=store_owner --fud --no-ar  -> output/preview-tracking-store_owner.html (media_buyer same). --fud=output/fud-tharaa.shop-result.json for real insights. Preview sets ga4Facts not ga4Metrics.
Clarity/Hotjar: no integration; detection only (crawl.ts:23-24,212-213), GTM-15 mentions Clarity; fud/collect.ts blocks their hits.
Samples: no full AuditResult JSON saved; FUD results only (tharaa has insights).
Risks: bilingual bi()/biHtml() + CSS toggle; RTL rules; print @media :2594/:2744/:2785; .js-motion HIDDEN list :2954 + reveal fallback :2799 (rename classes => content at opacity 0); anchors (#fix-first, #friction, rowId); no HTML tests; legacy results must still render; every section must return "" without data; single self-contained file; never sum money.
