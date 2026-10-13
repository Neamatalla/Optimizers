# 2026-10-13: clean report slugs

**Type:** data only, no schema change. Recorded as Markdown rather than SQL because it moves Storage files, which SQL can't do.

## What changed
`reportSlug()` in `audit-worker/src/supabase.ts` now builds a report's slug from the site's domain alone:

| | Before | After |
|---|---|---|
| Real report | `tharaa-shop-b1b62c` (business name or domain, plus 6 hex of the request ID) | `tharaa-shop` |
| Test report | `tharaa-shop-89c134` | `test_tharaa-shop` |

Real slugs are unique because a real audit is limited to one per domain. Test runs skip that limit, so they carry `test_`. `slugify()` never outputs `_`, so a test slug can't take a client's.

The migration rewrote every existing report to match:
- **Storage:** the file is **moved** (not copied) from `reports/<old>/index.html` to `reports/<new>/index.html`, in the same bucket.
- **`report_pages`:** `slug`, `storage_path`, `public_url`.
- **`audit_requests`:** `report_url`, `progress.slug`, `progress.reportUrl`.
- **Scheme:** links missing `https://` gained it. Staging's `PUBLIC_SITE_URL` had been set without one; `publicSiteUrl()` now adds it for new reports too.

Old suffixed links aren't redirected. Production wasn't live, so no client held one.

## How to apply
From `audit-worker/`, with `.env` pointing at the target project:

```
npm run migrate-clean-slugs              # dry run: prints old -> new per report, writes nothing
npm run migrate-clean-slugs -- --apply   # moves the files and updates the rows
```

- **Clashes:** if two reports would get the same slug, or a slug is already taken, it aborts before writing anything.
- **`--drop-test-reports`** deletes every test report first (files and `report_pages` rows; `audit_requests` rows stay). Use it where many test runs of one site would all want its single `test_` slug.
- **`--drop-all-reports`** deletes every report, test or not, and empties both buckets' `reports/` folders. Only for a project whose reports were all throwaway.
- **Re-running:** safe; reports already on their clean slug are skipped.
- **Mid-row failure:** it names the row and the step that failed, so the rest can be finished by hand.

Script: `audit-worker/src/migrate-clean-slugs.ts`.

## Applied
| Project | Date | Result |
|---|---|---|
| Staging | 2026-10-13 | 2 reports: `tharaa-shop-b1b62c` → `tharaa-shop`; `tharaa-shop-89c134` → `test_tharaa-shop` |
| Production | 2026-10-13 | Not live yet, every report was a test. Ran with `--drop-all-reports`: 30 reports and 1 stray folder deleted, both buckets emptied, `report_pages` empty. 35 `audit_requests` rows left in place (deleted later the same day, see `2026-10-13-2-production-prelaunch-wipe.md`). |
