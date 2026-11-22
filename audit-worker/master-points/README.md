# Master points

One list of audit points to replace the old 731 (the shared 50 checks, the store-owner and media-buyer versions, the Conversion review rules and the manual CRO checklist).

**Source of truth: `audit-worker/src/points/`.** Edit `registry.ts` (the points) and `dropped.ts` (old points with no master point) by hand. The CSVs here are read-only exports for viewing in a spreadsheet.

**Not wired into the audit yet.** The old lists still run. Next: code rules for the code-decided points, then templates.

## What's in it (22 Nov 2026)

- **201 points:** 163 active (code 81, code+ai 72, ai 10) and 38 parked. Parked points keep their reason and don't run. Set `status: "active"` to bring one back.
- **217 dropped old points**, each with a reason, how many past reports showed it, and whether past reports show the AI guessed a verdict for it.
- **Every one of the 731 old ids is in exactly one place:** a point's `origin` or the dropped list. `points.test.ts` checks this against the live old lists.

## Each point

- `id` (stable, never reused), `category`, `title`, `rule` (the one pass line), `severity`
- `decidedBy`: code, code+ai (code settles one side or gathers facts) or ai
- `pages`, `needs` (ga4, gtm, crawl, visit, clarity)
- `roles`: who it serves. Built from a shared check, a Conversion review rule or a manual checkpoint → all roles. Built only from store-owner (SO-) or media-buyer (MB-) points → only those roles.
- `roleCopy`: what each role's old point said (title, why it matters, ROAS/CAC direction, buyer lane), so no reader context is lost when the old persona file goes.
- `opportunity`, `owners`, `defaultAction`, `doneWhen`: carried over from the old points for the report.
- `origin`: every old id it replaces. `pointForOldId("W-07")` finds the point.

## How it was made

AI reviewers merged the old lists by topic, ran a pass for duplicates across topics, then five more reviewers checked the result against the 22 saved reports (27 of the 28 audit requests were test runs). They fixed 81 rules, split 9 merges, restored 9 dropped points and corrected 44 drop reasons. Thresholds are first drafts to tune on real stores. Map with filters: https://claude.ai/artifact/9WHDayKju6UvViXEXUeT3D
