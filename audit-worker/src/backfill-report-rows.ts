/**
 * Converts reports published as HTML files (before 2026-10-20) into rows in
 * audit_reports/audit_findings, so they render through the same static page
 * as new reports. Run once per project after the 2026-10-20 migration:
 *
 *   npm run backfill-report-rows -- --dry-run
 *   npm run backfill-report-rows
 *
 * Rebuilt from each request's saved audit data (progress), not from the HTML
 * file. A request with no saved result is skipped and keeps its HTML file,
 * which api/audit-report.js still serves. Reports whose HTML was edited by
 * hand are listed: those edits are in the file only, so check them after.
 * Safe to re-run: requests that already have rows are left alone.
 */
import "./logger.js";
import "dotenv/config";
import { isFudResult } from "./fud/index.js";
import { auditResultFrom } from "./report-rows.js";
import { getClient, saveAuditReport } from "./supabase.js";
import type { AuditRequestRow } from "./types.js";

// report_pages.updated_at this long after created_at means the HTML was
// replaced through /api/report/edit, not just written once.
const EDITED_AFTER_MS = 5 * 60_000;

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabase = getClient();

  const { data: pages, error } = await supabase
    .from("report_pages")
    .select("audit_request_id, slug, created_at, updated_at")
    .order("created_at");
  if (error) throw new Error(`report_pages select error: ${error.message}`);
  const { data: converted, error: convertedError } = await supabase.from("audit_reports").select("audit_request_id");
  if (convertedError) throw new Error(`audit_reports select error: ${convertedError.message}`);
  const done = new Set((converted ?? []).map(r => r.audit_request_id as string));

  const todo = (pages ?? []).filter(p => !done.has(p.audit_request_id));
  console.log(`${pages?.length ?? 0} published reports, ${done.size} already rows, ${todo.length} to convert${dryRun ? " (dry run)" : ""}.`);

  const skipped: string[] = [];
  const edited: string[] = [];
  let ok = 0;
  for (const page of todo) {
    // One row at a time: progress holds base64 screenshots.
    const { data: row, error: rowError } = await supabase.from("audit_requests").select("*").eq("id", page.audit_request_id).maybeSingle();
    if (rowError) throw new Error(`audit_requests select error: ${rowError.message}`);
    const request = row as AuditRequestRow | null;
    const progress = request?.progress ?? {};
    if (!request || !progress.categories?.length) {
      skipped.push(`${page.slug} (${request ? "no saved audit result" : "request deleted"})`);
      continue;
    }
    if (new Date(page.updated_at).getTime() - new Date(page.created_at).getTime() > EDITED_AFTER_MS) edited.push(page.slug);

    if (dryRun) {
      console.log(`  would convert ${page.slug}`);
      ok++;
      continue;
    }
    const result = { ...auditResultFrom(request, progress, isFudResult(progress.fud) ? progress.fud : null), generatedAt: page.created_at };
    await saveAuditReport({ requestId: request.id, result, isTest: request.is_test, slug: page.slug });
    console.log(`  converted ${page.slug}`);
    ok++;
  }

  console.log(`\n${dryRun ? "Would convert" : "Converted"} ${ok}.`);
  if (skipped.length) console.log(`Skipped ${skipped.length} (they keep their HTML file):\n  ${skipped.join("\n  ")}`);
  if (edited.length) console.log(`HTML edited by hand, check these after converting:\n  ${edited.join("\n  ")}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
