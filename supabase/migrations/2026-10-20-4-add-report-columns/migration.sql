-- Three more report-level fields on audit_reports. See README.md in this folder.
--
--   clarity_facts    The store's Clarity numbers (audit-worker/src/clarity-facts.ts),
--                    shown in the report's Clarity section. null without Clarity.
--   site_checks      What our own phone visit to the store saw
--                    (audit-worker/src/site-checks.ts). The report uses it to
--                    say the store visit ran. null when the visit didn't run.
--   category_tallies Per category: { total, evaluated, implicit_passes }.
--                    Results from before 2026-09-06 listed failed checks only,
--                    so their passes have no rows; implicit_passes counts them
--                    (0 for newer results). The page adds it to the passes it
--                    counts from audit_findings.

alter table audit_reports
  add column if not exists clarity_facts jsonb,
  add column if not exists site_checks jsonb,
  add column if not exists category_tallies jsonb;
