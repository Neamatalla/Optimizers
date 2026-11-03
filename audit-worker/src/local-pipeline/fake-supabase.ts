/**
 * Stand-in for src/supabase.ts inside the local pipeline run
 * (local-pipeline.ts). Nothing reaches a database: progress is written to
 * output/pipeline-<host>-progress.json, and "publishing" does what the live
 * page does with the saved rows: toRows, a JSON round trip (as Postgres
 * jsonb would), fromRows, then the same renderer the live page uses. So the
 * HTML it writes is what the live report would show for this run.
 */
import { writeFileSync } from "fs";
import path from "path";
import { fromRows, toRows } from "../report-rows.js";
import { buildAuditHtmlReport } from "../html-report-node.js";
import type { AuditRequestRow, AuditResult, JobProgress } from "../types.js";

const OUT = path.join(process.cwd(), "output");
console.log("[local-pipeline] fake supabase in use: nothing goes to a database");
const row = (): AuditRequestRow => (globalThis as any).__pipelineRow;
// No dots: the dev server only serves [a-zA-Z0-9_-]+.html from output/.
const host = () => new URL(row().website).hostname.replace(/^www\./, "").replace(/\./g, "-");

export const LEASE_MS = 10 * 60_000;
export const HEARTBEAT_MS = 60_000;
export class LostLeaseError extends Error {}

export async function heartbeat(): Promise<boolean> { return true; }
export async function saveProgress(_id: string, _worker: string, progress: JobProgress): Promise<void> {
  writeFileSync(path.join(OUT, `pipeline-${host()}-progress.json`), JSON.stringify(progress, null, 2), "utf8");
}

export async function saveAuditReport(opts: { requestId: string; result: AuditResult; isTest?: boolean }): Promise<{ publicUrl: string; slug: string }> {
  const rows = JSON.parse(JSON.stringify(toRows(opts.result)));
  const r = row();
  const rebuilt = fromRows({ website: r.website, business_name: r.business_name, audience_role: r.audience_role ?? null, ad_context: r.ad_context ?? null }, rows.report, rows.findings);
  const file = `pipeline-${host()}.html`;
  writeFileSync(path.join(OUT, file), (await buildAuditHtmlReport(rebuilt)).html, "utf8");
  writeFileSync(path.join(OUT, `pipeline-${host()}-rows.json`), JSON.stringify(rows, null, 2), "utf8");
  console.log(`[local-pipeline] published from rows: output/${file} (report row ${Math.round(JSON.stringify(rows.report).length / 1024)} KB, ${rows.findings.length} finding rows)`);
  return { publicUrl: `http://localhost:5173/audit-reports/local/${file}`, slug: `local-${host()}` };
}

const noop = async (..._a: unknown[]) => {};
export const markTestRequestSent = noop;
export const markRequestAwaitingApproval = noop;
export const markRequestFailed = noop;
export const markRequestRateLimited = noop;
export const scheduleRetry = noop;
export const markSentToClient = noop;
export const recordDigestSent = noop;
export async function claimNextRequest(): Promise<null> { return null; }
export async function findDueScheduledRequests(): Promise<never[]> { return []; }
export async function findScheduledDeliveries(): Promise<never[]> { return []; }
export async function getLastDigestDateUtc(): Promise<string | null> { return null; }
