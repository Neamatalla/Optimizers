# Extraction schema (shared by all extraction agents)

Output: one JSON object per line (JSONL) in the file you are assigned. No prose in the file. Keep every field, use `null` when unknown. Do not invent values; if the source doesn't say, write `null` or `"unknown"`.

## Fields

```
{
  "pid": "<SRC-PREFIX>-<n>",          // unique: DH-001, CRO-W7-001, VAULT-001, EXIST-GA4-01
  "src": "AGENCY-DH | TOOL-CRO | OWN-MASTER | EXIST-TOOL",
  "src_file": "<file name or note name>",
  "src_ref": "<page / slide / section / row>",
  "store": "<store name or URL if the source is per store, else null>",
  "title": "<short name of the check>",
  "group": "<topic: funnel, traffic, orders, trust, account, gtm-signal, gtm-shoppers, gtm-privacy, gtm-fit, web-path, web-speed, web-tracking, web-risk, web-find, web-a11y, pricing, payments, delivery, mobile, search, checkout, reviews, other>",
  "condition": "<what to look at / what was found>",
  "criteria": "<what good looks like, the expected state>",
  "cause": "<likely cause if stated, else null>",
  "business_effect": "<effect on sales/revenue/trust, in the source's words, short>",
  "ad_effect": "<one of: roas_up_cac_down | overcount_roas_inflated | undercount_roas_deflated | wasted_clicks | signal_weak | none | unknown>",
  "ad_effect_note": "<short note, else null>",
  "data_needed": "<one or more of: GA4 | GTM | browser | site_crawl | store_admin | ad_platform | manual>",
  "measurable_by_tool": "<yes | partial | no>",
  "measurable_note": "<why, against our access: GA4 OAuth reports, GTM service-account read, headless browser visit, public crawl, no ad accounts, no store admin>",
  "severity_stated": "<critical | high | medium | low | unknown>",
  "fix_owner": "<store_owner | developer | media_buyer | agency | platform | unknown>",
  "fix_effort": "<low | medium | high | unknown>",
  "icp_hint": "<store_owner | media_buyer | both | neither>",
  "result": "<pass | fail | warning | not_applicable | not_evaluated | n/a for checklist-only source>",
  "maps_to_existing": "<EXIST id if this is the same check as one in the existing checklist index, else null>"
}
```

## Rules
1. One line per distinct check. Split a compound finding into separate points only if the source lists them separately; otherwise keep one point.
2. Do not merge two different checks just because they sit in the same section.
3. Keep the source's own wording for `condition` and `criteria` where short. Translate nothing.
4. `result` for a TOOL-CRO store is that store's result for that check. For AGENCY-DH and OWN-MASTER, use `n/a` unless the source reports a result for the one store audited.
5. `icp_hint`: `media_buyer` if the point answers "is the number real?" or "does paid traffic convert?"; `store_owner` if it is about shop UX, money, GCC payments, delivery, WhatsApp or the owner's fix; `both` if either; `neither` if it is pure engineering/compliance with no reader-facing effect.
6. Do not rank or score points. That happens later.
7. When done, reply with ONLY: file path, point count, and up to 3 lines on anything you could not read or parse. Nothing else.

## Rubric for the ranking phase (later, not for extraction agents)
Per ICP, score each point 0-5 on four axes and weight them:
- Impact on that reader's KPI (store owner: sales/money; media buyer: ROAS/CAC/data trust): 40%
- Measurability by our tool (yes=5, partial=3, no=0): 25%
- Actionability for that reader (who can fix it, how plainly): 20%
- Frequency across sources and stores (how many sources/stores raise it): 15%
