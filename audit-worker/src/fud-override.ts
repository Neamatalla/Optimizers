/**
 * Reviewer override for one purchase-friction finding, before the report is
 * approved or sent. Changes the finding's status (or hides it), recomputes
 * the Conversion score score, saves it on the request, and republishes the
 * report at the same URL. The machine's original status is kept on the
 * finding (`override.from`) — those are the labels the rules get calibrated
 * against.
 *
 *   npm run fud-override -- <request-id> --list
 *   npm run fud-override -- <request-id> <RULE> <pass|warn|fail|unassessed|hidden> "<reason>"
 *   npm run fud-override -- <request-id> <RULE> hidden "store shows COD in the header" --dry-run
 *   npm run fud-override -- <request-id> --republish
 *     (no override: just rebuild the report from the saved data with the
 *     current report code, e.g. after a design change)
 *
 * <request-id> is the full id, or its first few characters (copy it from
 * audit_requests in Supabase; report slugs are the domain only, no id).
 *
 * IMPORTANT: republishing rebuilds the report from the saved audit data, so
 * hand edits made through /api/report/edit are overwritten. Do overrides
 * first, hand edits after.
 */
import "./logger.js";
import "dotenv/config";
import { buildAuditHtmlReport } from "./html-report.js";
import { applyOverride, isFudResult } from "./fud/index.js";
import { computeOverallPoints } from "./scoring.js";
import { audienceRoleOf } from "./audience.js";
import { getRequestById, publishAuditReport, saveProgressDirect } from "./supabase.js";
import type { AuditRequestRow, AuditResult, FudResult, FudStatus, JobProgress } from "./types.js";

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
  if (republishOnly) {
    if (row.status === "pending" || row.status === "processing") throw new Error(`request is still '${row.status}' — wait for the audit to finish`);
    if (!progress.categories) throw new Error("request has no saved audit result to rebuild the report from");
    const url = await rebuild(row, progress, isFudResult(progress.fud) ? progress.fud : null);
    console.log(`Rebuilt and republished: ${url}\n(Hand edits made through /api/report/edit before this were overwritten.)`);
    return;
  }
  if (!isFudResult(progress.fud)) throw new Error(`request ${row.id} has no purchase-friction result${progress.fud ? ` (the pass failed: ${(progress.fud as { error: string }).error})` : " (FUD_PASS was off for this run)"}`);
  console.log(`${row.website} — request ${row.id}, status ${row.status}${row.is_test ? ", TEST" : ""}`);

  if (wantList) {
    list(progress.fud);
    return;
  }
  if (!(STATUSES as readonly string[]).includes(to)) throw new Error(`status must be one of: ${STATUSES.join(", ")}`);
  if (row.status === "pending" || row.status === "processing") throw new Error(`request is still '${row.status}' — wait for the audit to finish`);
  if (!progress.categories) throw new Error("request has no saved audit result to rebuild the report from");

  const updated = applyOverride(progress.fud, ruleId, to as FudStatus | "hidden", reasonParts.join(" "));
  console.log("\nAfter the override:");
  list(updated);
  if (dryRun) {
    console.log("\n--dry-run: nothing saved, report not republished.");
    return;
  }

  progress.fud = updated;
  await saveProgressDirect(row.id, progress);
  const publicUrl = await rebuild(row, progress, updated);
  console.log(`\nSaved and republished: ${publicUrl}\n(Hand edits made through /api/report/edit before this were overwritten.)`);
}

async function rebuild(row: AuditRequestRow, progress: JobProgress, fud: FudResult | null): Promise<string> {
  const categories = progress.categories!;
  const { earned, possible } = computeOverallPoints(categories);
  const result: AuditResult = {
    categories,
    overallScore: earned,
    possiblePoints: possible,
    websiteUrl: row.website,
    businessName: row.business_name,
    audienceRole: audienceRoleOf(row.audience_role),
    discoveredPages: progress.discoveredPages ?? [],
    pageSpeed: progress.pageSpeed,
    screenshots: progress.screenshots,
    ga4Metrics: progress.ga4Metrics ?? null,
    fud,
    ga4Facts: progress.ga4Facts ?? null,
    siteChecks: progress.siteChecks ?? null,
  };
  const { html } = await buildAuditHtmlReport(result);
  const { publicUrl } = await publishAuditReport({ requestId: row.id, html, businessName: row.business_name, website: row.website, isTest: row.is_test });
  return publicUrl;
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
