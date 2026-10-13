# 2026-10-13: production pre-launch wipe

**Type:** data only, production only. The schema, indexes, triggers, RLS and buckets are unchanged.

Production wasn't live yet, and everything in it came from testing. That includes non-test-flagged rows, which would otherwise have used up the one free audit for those sites and email addresses at launch. Every row was deleted, after `2026-10-13-1-clean-report-slugs.md` had already emptied both report buckets.

| Table | Rows deleted |
|---|---|
| `audit_requests` | 35 |
| `audit_digest_log` | 11 |
| `checklist_points` | 100 |
| `report_pages` | 0 (already empty) |

Storage: `audit-reports` and `audit-reports-test` both empty.

## Restoring reference data
`checklist_points` is a copy of `audit-worker/src/checklist.ts`, not real data. Rebuild it from `audit-worker/` (with `.env` pointing at production) using:

```
npm run seed-checklist
```

## Not for reuse
This was a one-time action and has no script. Never run the equivalent against a project with real client data.
