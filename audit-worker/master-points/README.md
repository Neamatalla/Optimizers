# Master points

One list of audit points to replace the old 731 (the shared 50 checks, the store-owner and media-buyer versions, the Conversion review rules and the manual CRO checklist).

**Source of truth: `audit-worker/src/points/`.** Edit `registry.ts` (the points) and `dropped.ts` (old points with no master point) by hand. The CSVs here are read-only exports for viewing in a spreadsheet.

**Wired in behind `POINTS_PIPELINE=on`** (off by default, so the old lists still run in production). Code rules, templates, the AI judge and the browser step are built; see the worker README "Master points" and `PHASE1-PLAN.md`.

## What's in it (25 Nov 2026)

- **205 points:** 169 active (code 87, code+ai 51, ai 31) and 36 parked. Every code+ai point has a code rule (`rules/mixed.ts`, `rules/tracking.ts`, LAND-11); points with no sure code side are labelled ai. Parked points keep their reason and don't run. Set `status: "active"` to bring one back.
- **GA4 and GTM tabs: 25 active points each, for every role.** Each point has a `tab` (GA4, GTM or Website): the tool the check is about. A point sits in one tab only. `pipeline.test.ts` checks the 25 + 25.
- **209 dropped old points**, each with a reason, how many past reports showed it, and whether past reports show the AI guessed a verdict for it.
- **Every one of the 731 old ids is in exactly one place:** a point's `origin` or the dropped list. `points.test.ts` checks this against the live old lists.

## Each point

- `id` (stable, never reused), `category`, `tab` (the report tab), `title`, `rule` (the one pass line), `severity`
- `decidedBy`: code, code+ai (code settles one side or gathers facts) or ai
- `pages`, `needs` (ga4, gtm, crawl, visit, clarity)
- `roles`: who it serves. GA4 and GTM points serve every role. A Website point built from a shared check, a Conversion review rule or a manual checkpoint serves all roles; one built only from store-owner (SO-) or media-buyer (MB-) points serves only those roles.
- `roleCopy`: what each role's old point said (title, why it matters, ROAS/CAC direction, buyer lane), so no reader context is lost when the old persona file goes.
- `opportunity`, `owners`, `defaultAction`, `doneWhen`: carried over from the old points for the report.
- `origin`: every old id it replaces. `pointForOldId("W-07")` finds the point.

## How it was made

AI reviewers merged the old lists by topic, ran a pass for duplicates across topics, then five more reviewers checked the result against the 22 saved reports (27 of the 28 audit requests were test runs). They fixed 81 rules, split 9 merges, restored 9 dropped points and corrected 44 drop reasons. Thresholds are first drafts to tune on real stores. Map with filters: https://claude.ai/artifact/9WHDayKju6UvViXEXUeT3D
