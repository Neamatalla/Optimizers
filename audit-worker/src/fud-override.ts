/**
 * Reviewer override for one purchase-friction finding, before the report is
 * approved or sent. Changes the finding's status (or hides it), saves it on
 * the request, and rewrites the report's friction rows. The report page
 * shows the change on its next load. The machine's original status is kept
 * on the finding (`override.from`) — those are the labels the rules get
 * calibrated against.
 *
 *   npm run fud-override -- <request-id> --list
 *   npm run fud-override -- <request-id> <RULE> <pass|warn|fail|unassessed|hidden> "<reason>"
 *   npm run fud-override -- <request-id> <RULE> hidden "store shows COD in the header" --dry-run
 *   npm run fud-override -- <request-id> --republish
 *     (no override: rebuild all the report's rows from the saved audit data)
 *
 * <request-id> is the full id, or its first few characters (copy it from
 * audit_requests in Supabase; report slugs are the domain only, no id).
 *
 * An override starts from the report's current friction rows, so hand edits
 * made through /api/report/edit stay. --republish rebuilds every row from the
 * saved audit data, so it drops them.
 */
import "./logger.js";
import "dotenv/config";
import { applyOverride, isFudResult } from "./fud/index.js";
import { auditResultFrom, fromRows } from "./report-rows.js";
import { getRequestById, loadAuditReport, saveAuditReport, saveFrictionRows, saveProgressDirect } from "./supabase.js";
import type { FudResult, FudStatus } from "./types.js";

const STATUSES = ["pass", "warn", "fail", "unassessed", "hidden"] as const;

function list(fud: FudResult): void {
  console.log(`Conversion score: ${fud.score ?? "n/a"} (${fud.assessed}/${fud.applicable} assessed), rules ${fud.ruleSetVersion}`);
  for (const f of fud.findings) {
    const o = f.override ? `  [override: ${f.override.from} -> ${f.override.to}: ${f.override.reason}]` : "";
    console.log(`  ${f.ruleId.padEnd(3)} ${f.status.padEnd(10)} ${f.pexti ? `PEXTI ${String(f.pexti.score).padStart(3)}` : "         "}  ${f.business.summary}${o}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const wantList = args.includes("--list");
  const republishOnly = args.includes("--republish");
  const [id, ruleId, to, ...reasonParts] = args.filter(a => !a.startsWith("--"));
  if (!id || (!wantList && !republishOnly && (!ruleId || !to))) {
    console.error('Usage: npm run fud-override -- <request-id> --list\n       npm run fud-override -- <request-id> <RULE> <pass|warn|fail|unassessed|hidden> "<reason>" [--dry-run]');
    process.exit(1);
  }

  const row = await getRequestById(id);
  if (!row) throw new Error(`no audit request matches "${id}"`);
  const progress = row.progress ?? {};
  // The published rows hold any hand edits, so they're the starting point.
  const saved = await loadAuditReport(row.id);
  if (republishOnly) {
    if (row.status === "pending" || row.status === "processing") throw new Error(`request is still '${row.status}' — wait for the audit to finish`);
    if (!progress.categories) throw new Error("request has no saved audit result to rebuild the report from");
    // Keep the original report date.
    const result = { ...auditResultFrom(row, progress, isFudResult(progress.fud) ? progress.fud : null), generatedAt: saved?.report.generated_at };
    const { publicUrl } = await saveAuditReport({ requestId: row.id, result, isTest: row.is_test });
    console.log(`Rebuilt the report rows: ${publicUrl}\n(Hand edits made through /api/report/edit before this were dropped.)`);
    return;
  }
  const fud = saved ? fromRows(row, saved.report, saved.findings).fud : isFudResult(progress.fud) ? progress.fud : null;
  if (!fud) throw new Error(`request ${row.id} has no purchase-friction result${progress.fud && !isFudResult(progress.fud) ? ` (the pass failed: ${progress.fud.error})` : " (FUD_PASS was off for this run)"}`);
  console.log(`${row.website} — request ${row.id}, status ${row.status}${row.is_test ? ", TEST" : ""}`);

  if (wantList) {
    list(fud);
    return;
  }
  if (!(STATUSES as readonly string[]).includes(to)) throw new Error(`status must be one of: ${STATUSES.join(", ")}`);
  if (row.status === "pending" || row.status === "processing") throw new Error(`request is still '${row.status}' — wait for the audit to finish`);

  const updated = applyOverride(fud, ruleId, to as FudStatus | "hidden", reasonParts.join(" "));
  console.log("\nAfter the override:");
  list(updated);
  if (dryRun) {
    console.log("\n--dry-run: nothing saved.");
    return;
  }

  progress.fud = updated;
  await saveProgressDirect(row.id, progress);
  if (saved) {
    await saveFrictionRows(row.id, updated);
    console.log(`\nSaved. ${row.report_url ?? "The report"} shows it on its next load.`);
  } else {
    console.log("\nSaved on the request. The report isn't published yet and picks this up when it is.");
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
