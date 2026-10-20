import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuditRequestRow, AuditResult, FudResult, JobProgress } from "./types.js";
import { frictionRows, frictionSummary, toRows, type FindingRow, type ReportRow } from "./report-rows.js";

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set — see audit-worker/.env.example");
  }
  client = createClient(url, key);
  return client;
}

// A processing row whose heartbeat is older than this belongs to a worker
// that died (crash, reboot, sleep, deploy). The live worker refreshes the
// heartbeat every HEARTBEAT_MS, so a healthy long claude -p run never expires.
export const LEASE_MS = Number(process.env.LEASE_MS ?? 10 * 60_000);
export const HEARTBEAT_MS = 60_000;

// Thrown when this worker no longer holds a row (another worker reclaimed it
// after our lease lapsed). The caller must stop without touching the row.
export class LostLeaseError extends Error {}

/**
 * Claims the next job: the oldest ready pending row, or else a processing row
 * whose lease expired. Either way the claim is a conditional update on the
 * exact state that was read (status, and the stale heartbeat for a reclaim),
 * so two workers racing on one row can't both win. Claiming counts an attempt.
 */
export async function claimNextRequest(workerId: string): Promise<AuditRequestRow | null> {
  const supabase = getClient();
  const now = new Date();
  const nowIso = now.toISOString();

  // retry_after holds a row back while it waits out a backoff (rate limit or
  // a failed attempt); created_at is never touched, so it keeps its place.
  const { data: pending, error: pendingError } = await supabase
    .from("audit_requests")
    .select("id, attempts")
    .eq("status", "pending")
    .or(`retry_after.is.null,retry_after.lte.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(1);
  if (pendingError) throw new Error(`Supabase select error: ${pendingError.message}`);

  if (pending && pending.length > 0) {
    const { data: claimed, error } = await supabase
      .from("audit_requests")
      .update({ status: "processing", locked_by: workerId, heartbeat_at: nowIso, attempts: (pending[0].attempts ?? 0) + 1 })
      .eq("id", pending[0].id)
      .eq("status", "pending")
      .select()
      .maybeSingle();
    if (error) throw new Error(`Supabase claim error: ${error.message}`);
    // Null: another worker got it between the select and the update.
    return (claimed as AuditRequestRow) ?? null;
  }

  const staleBefore = new Date(now.getTime() - LEASE_MS).toISOString();
  const { data: stale, error: staleError } = await supabase
    .from("audit_requests")
    .select("id, attempts, heartbeat_at")
    .eq("status", "processing")
    .or(`heartbeat_at.is.null,heartbeat_at.lt.${staleBefore}`)
    .order("created_at", { ascending: true })
    .limit(1);
  if (staleError) throw new Error(`Supabase stale select error: ${staleError.message}`);
  if (!stale || stale.length === 0) return null;

  const row = stale[0];
  let reclaim = supabase
    .from("audit_requests")
    .update({ locked_by: workerId, heartbeat_at: nowIso, attempts: (row.attempts ?? 0) + 1 })
    .eq("id", row.id)
    .eq("status", "processing");
  reclaim = row.heartbeat_at ? reclaim.eq("heartbeat_at", row.heartbeat_at) : reclaim.is("heartbeat_at", null);
  const { data: reclaimed, error: reclaimError } = await reclaim.select().maybeSingle();
  if (reclaimError) throw new Error(`Supabase reclaim error: ${reclaimError.message}`);
  if (reclaimed) console.warn(`[supabase] Reclaimed ${row.id} from a worker whose lease expired`);
  return (reclaimed as AuditRequestRow) ?? null;
}

/**
 * Refreshes this worker's lease. Returns false when the row is no longer
 * ours (another worker reclaimed it, or it left 'processing'), so the caller
 * can stop before it double-delivers.
 */
export async function heartbeat(id: string, workerId: string): Promise<boolean> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("audit_requests")
    .update({ heartbeat_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "processing")
    .eq("locked_by", workerId)
    .select("id");
  if (error) throw new Error(`Supabase heartbeat error: ${error.message}`);
  return Boolean(data && data.length > 0);
}

/** Persists the progress object after a stage finishes. Only while we hold the lease. */
export async function saveProgress(id: string, workerId: string, progress: JobProgress): Promise<void> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("audit_requests")
    .update({ progress, heartbeat_at: new Date().toISOString() })
    .eq("id", id)
    .eq("locked_by", workerId)
    .select("id");
  if (error) throw new Error(`Supabase saveProgress error: ${error.message}`);
  if (!data || data.length === 0) throw new LostLeaseError(`Lost the lease on ${id} while saving progress`);
}

/**
 * Manual retry (npm run requeue). Puts a request back in line with fresh
 * attempts. Keeps saved progress unless `fresh`, so by default it resumes.
 * Refuses rows already past the audit (awaiting approval, scheduled, done)
 * unless `force`, since re-running those would redo delivered work.
 */
export async function requeueRequest(id: string, opts: { fresh?: boolean; force?: boolean } = {}): Promise<{ previousStatus: string }> {
  const supabase = getClient();
  const { data: row, error: readError } = await supabase.from("audit_requests").select("id, status").eq("id", id).maybeSingle();
  if (readError) throw new Error(`Supabase read error: ${readError.message}`);
  if (!row) throw new Error(`No audit request with id ${id}`);
  const allowed = ["failed", "pending", "processing"];
  if (!allowed.includes(row.status) && !opts.force) {
    throw new Error(`${id} is '${row.status}'. Re-running it would redo work that already finished; pass --force if that's intended.`);
  }
  const update: Record<string, unknown> = { status: "pending", attempts: 0, retry_after: null, locked_by: null, heartbeat_at: null, result_error: null };
  if (opts.fresh) update.progress = {};
  const { error } = await supabase.from("audit_requests").update(update).eq("id", id);
  if (error) throw new Error(`Supabase requeue error: ${error.message}`);
  return { previousStatus: row.status };
}

/**
 * A failed attempt that still has attempts left: back to pending after a
 * backoff, keeping its saved progress so the next attempt resumes.
 */
export async function scheduleRetry(id: string, message: string, retryAfter: Date): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("audit_requests")
    .update({ status: "pending", retry_after: retryAfter.toISOString(), result_error: message.slice(0, 2000), locked_by: null, heartbeat_at: null })
    .eq("id", id);
  if (error) throw new Error(`Supabase scheduleRetry error: ${error.message}`);
}

// Only ever outputs [a-z0-9-] — reportSlug() relies on that to keep test
// slugs (which contain "_") from ever colliding with a real one.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics so e.g. "Café" -> "cafe", not dropped
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function hostnameOf(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "site";
  }
}

/**
 * The audit link's client-facing slug: the site's domain, e.g.
 * "https://www.tharaa.shop/" -> "tharaa-shop". Unique because a real audit
 * is one per domain (api/_lib/audit-intake.js). Test runs skip that rule,
 * so they get "test_" in front: slugify() never outputs "_", so a test slug
 * can never take a client's. Repeated test runs of one site share a slug
 * and overwrite each other, which is fine for throwaway runs.
 */
export function reportSlug(opts: { website: string; isTest?: boolean }): string {
  const base = slugify(hostnameOf(opts.website)) || "site";
  return opts.isTest ? `test_${base}` : base;
}

// PUBLIC_SITE_URL set without a scheme (as it once was on staging) made
// every stored report link scheme-less, which email clients won't open.
export function publicSiteUrl(): string {
  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://optimizers.agency").replace(/\/$/, "");
  return /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`;
}

const IMAGES_BUCKET = process.env.AUDIT_IMAGES_BUCKET || "audit-images";

/**
 * Uploads a data-URI image to the public audit-images bucket and returns its
 * URL. A value that is already a URL (a rebuilt report) is returned as is.
 */
async function uploadImage(requestId: string, name: string, value: string | null | undefined, version: string): Promise<string | null> {
  if (!value) return null;
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(value);
  if (!match) return value;
  const [, mime, base64] = match;
  const objectPath = `${requestId}/${name}.${mime === "image/png" ? "png" : "jpg"}`;
  const supabase = getClient();
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(objectPath, Buffer.from(base64, "base64"), { contentType: mime, cacheControl: "31536000", upsert: true });
  if (error) throw new Error(`Supabase image upload error (${objectPath}): ${error.message}`);
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(objectPath);
  // A rebuild uploads to the same path; the version keeps caches from
  // showing the old image.
  return `${data.publicUrl}?v=${version}`;
}

// The screenshots and friction crops are base64 in progress; the rows hold URLs.
async function withUploadedImages(requestId: string, result: AuditResult): Promise<AuditResult> {
  const version = Date.now().toString(36);
  const shots = result.screenshots;
  const screenshots = shots
    ? { desktop: await uploadImage(requestId, "desktop", shots.desktop, version), mobile: await uploadImage(requestId, "mobile", shots.mobile, version) }
    : shots;
  return { ...result, screenshots, fud: result.fud ? await withUploadedCrops(requestId, result.fud, version) : result.fud };
}

async function withUploadedCrops(requestId: string, fud: FudResult, version: string): Promise<FudResult> {
  const findings = await Promise.all(
    fud.findings.map(async f => (f.evidence?.crop ? { ...f, evidence: { ...f.evidence, crop: await uploadImage(requestId, `crop-${f.ruleId}`, f.evidence.crop, version) } } : f)),
  );
  return { ...fud, findings };
}

// Replaces an audit's finding rows: all of them, or only one kind.
async function replaceFindingRows(requestId: string, rows: FindingRow[], kind?: FindingRow["kind"]): Promise<void> {
  const supabase = getClient();
  let del = supabase.from("audit_findings").delete().eq("audit_request_id", requestId);
  if (kind) del = del.eq("kind", kind);
  const { error: deleteError } = await del;
  if (deleteError) throw new Error(`Supabase audit_findings delete error: ${deleteError.message}`);
  if (!rows.length) return;
  const { error } = await supabase.from("audit_findings").insert(rows.map(r => ({ ...r, audit_request_id: requestId })));
  if (error) throw new Error(`Supabase audit_findings insert error: ${error.message}`);
}

/**
 * Publishes an audit: its result as rows in audit_reports/audit_findings,
 * its images in the audit-images bucket, and its slug in report_pages.
 * /audit-reports/<slug> renders the rows in the browser. Safe to re-run: it
 * replaces the audit's rows, so hand edits made through /api/report/edit are
 * lost on a re-run.
 */
export async function saveAuditReport(opts: { requestId: string; result: AuditResult; isTest?: boolean; slug?: string }): Promise<{ publicUrl: string; slug: string }> {
  const supabase = getClient();
  const { report, findings } = toRows(await withUploadedImages(opts.requestId, opts.result));

  const { error: reportError } = await supabase
    .from("audit_reports")
    .upsert({ audit_request_id: opts.requestId, ...report }, { onConflict: "audit_request_id" });
  if (reportError) throw new Error(`Supabase audit_reports upsert error: ${reportError.message}`);
  await replaceFindingRows(opts.requestId, findings);

  // The slug is the site's domain (test runs are prefixed), so a re-run of
  // the same request keeps its link; the backfill passes an old report's
  // own. storage_path is left out: an old report converted to rows keeps it,
  // a new one has none.
  const slug = opts.slug ?? reportSlug({ website: opts.result.websiteUrl, isTest: opts.isTest });
  const publicUrl = `${publicSiteUrl()}/audit-reports/${encodeURIComponent(slug)}`;
  const { error: pageError } = await supabase
    .from("report_pages")
    .upsert({ audit_request_id: opts.requestId, slug, public_url: publicUrl }, { onConflict: "slug" });
  if (pageError) throw new Error(`Supabase report_pages upsert error: ${pageError.message}`);

  return { publicUrl, slug };
}

/** An audit's saved rows, or null when it has none (not published, or an old HTML report). */
export async function loadAuditReport(requestId: string): Promise<{ report: ReportRow; findings: FindingRow[] } | null> {
  const supabase = getClient();
  const { data: report, error } = await supabase.from("audit_reports").select("*").eq("audit_request_id", requestId).maybeSingle();
  if (error) throw new Error(`Supabase audit_reports select error: ${error.message}`);
  if (!report) return null;
  const { data: findings, error: findingsError } = await supabase
    .from("audit_findings")
    .select("*")
    .eq("audit_request_id", requestId)
    .order("kind")
    .order("sort_order");
  if (findingsError) throw new Error(`Supabase audit_findings select error: ${findingsError.message}`);
  return { report: report as ReportRow, findings: (findings ?? []) as FindingRow[] };
}

/** Replaces only the friction rows and summary (fud-override.ts); the check rows and their edits stay. */
export async function saveFrictionRows(requestId: string, fud: FudResult): Promise<void> {
  const supabase = getClient();
  const withCrops = await withUploadedCrops(requestId, fud, Date.now().toString(36));
  const { error } = await supabase.from("audit_reports").update({ friction: frictionSummary(withCrops) }).eq("audit_request_id", requestId);
  if (error) throw new Error(`Supabase audit_reports update error: ${error.message}`);
  await replaceFindingRows(requestId, frictionRows(withCrops), "friction");
}

export async function markRequestFailed(id: string, message: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("audit_requests")
    .update({ status: "failed", result_error: message.slice(0, 2000), locked_by: null, heartbeat_at: null })
    .eq("id", id);
  if (error) throw new Error(`Supabase markRequestFailed error: ${error.message}`);
}

// Bounces a request that hit a rate limit mid-run back to 'pending' instead
// of failing it out of the queue — created_at is untouched, so it re-claims
// in its original order once retry_after passes. Backoff doubles per hit
// (5, 10, 20, 40, 60min...) and caps at 60min so a persistent limit doesn't
// balloon the wait into hours.
export async function markRequestRateLimited(
  id: string,
  previousRetryCount: number,
  // attempts as it was before this claim: a rate limit isn't the job's fault,
  // so it gives the attempt back instead of burning one of MAX_ATTEMPTS.
  attemptsBeforeClaim: number,
  message: string,
  // The limit's own stated reset time, when the message carried one (see
  // poll.ts's parseLimitResetAt). A plan usage limit resets at an appointed
  // hour, so waiting until exactly then beats doubling blindly toward it —
  // one wait instead of a claim-and-fail cycle every hour. Null falls back
  // to the backoff, which is the right shape for a true rate limit.
  resetAt?: Date | null,
): Promise<Date> {
  const supabase = getClient();
  const backoffMinutes = Math.min(60, 5 * 2 ** previousRetryCount);
  // +30s so the retry lands just after the reset, not exactly on it.
  const retryAfter = resetAt ? new Date(resetAt.getTime() + 30_000) : new Date(Date.now() + backoffMinutes * 60_000);
  const { error } = await supabase
    .from("audit_requests")
    .update({
      status: "pending",
      retry_after: retryAfter.toISOString(),
      retry_count: previousRetryCount + 1,
      attempts: attemptsBeforeClaim,
      result_error: message.slice(0, 2000),
      locked_by: null,
      heartbeat_at: null,
    })
    .eq("id", id);
  if (error) throw new Error(`Supabase markRequestRateLimited error: ${error.message}`);
  return retryAfter;
}

// Test-mode run finished AND already emailed to whoever submitted it — the
// whole review/approval/delay chain is skipped for these, so this lands
// directly on 'done' (see poll.ts's processRequest and types.ts's is_test).
// No approval_token is ever minted for a test row: there's nothing to
// approve, and a token sitting on a done row would be a live credential
// for no reason.
export async function markTestRequestSent(id: string, opts: { reportUrl: string; categoriesAudited: string[] }): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("audit_requests")
    .update({
      status: "done",
      report_url: opts.reportUrl,
      categories_audited: opts.categoriesAudited,
      sent_to_client_at: new Date().toISOString(),
      result_error: null,
      locked_by: null,
      heartbeat_at: null,
    })
    .eq("id", id);
  if (error) throw new Error(`Supabase markTestRequestSent error: ${error.message}`);
}

// Audit finished — parked for internal review instead of emailed straight
// to the requester. See api/_lib/audit-approve.js for what flips it to
// 'scheduled'.
export async function markRequestAwaitingApproval(id: string, opts: { reportUrl: string; approvalToken: string; categoriesAudited: string[] }): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("audit_requests")
    .update({
      status: "awaiting_approval",
      report_url: opts.reportUrl,
      approval_token: opts.approvalToken,
      categories_audited: opts.categoriesAudited,
      result_error: null,
      locked_by: null,
      heartbeat_at: null,
    })
    .eq("id", id);
  if (error) throw new Error(`Supabase markRequestAwaitingApproval error: ${error.message}`);
}

// scheduled_send_at has passed — the worker is about to email the client.
export async function findDueScheduledRequests(): Promise<AuditRequestRow[]> {
  const supabase = getClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("audit_requests")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_send_at", nowIso)
    .order("scheduled_send_at", { ascending: true });
  if (error) throw new Error(`Supabase findDueScheduledRequests error: ${error.message}`);
  return (data as AuditRequestRow[]) ?? [];
}

export async function markSentToClient(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("audit_requests")
    .update({ status: "done", sent_to_client_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Supabase markSentToClient error: ${error.message}`);
}

// Every approved-but-not-yet-sent row — the daily digest table (all rows
// with a due date, not just the ones due today).
export async function findScheduledDeliveries(): Promise<AuditRequestRow[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("audit_requests")
    .select("*")
    .eq("status", "scheduled")
    .order("scheduled_send_at", { ascending: true });
  if (error) throw new Error(`Supabase findScheduledDeliveries error: ${error.message}`);
  return (data as AuditRequestRow[]) ?? [];
}

// audit_digest_log is a plain append-only log, not in-memory state, so a
// worker restart can't cause the daily digest to double-send or get skipped
// for the day — see poll.ts's maybeSendDailyDigest.
export async function getLastDigestDateUtc(): Promise<string | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("audit_digest_log")
    .select("sent_at")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Supabase getLastDigestDateUtc error: ${error.message}`);
  if (!data) return null;
  return String((data as { sent_at: string }).sent_at).slice(0, 10);
}

export async function recordDigestSent(): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("audit_digest_log").insert({});
  if (error) throw new Error(`Supabase recordDigestSent error: ${error.message}`);
}

// Reviewer tooling (fud-override.ts): read one request and write its saved
// progress back without holding the worker's lease. Only for rows the worker
// has finished with — the caller checks the status first.
export async function getRequestById(id: string): Promise<AuditRequestRow | null> {
  const supabase = getClient();
  // Accept a short id: the first characters of the UUID.
  const query = supabase.from("audit_requests").select("*");
  const { data, error } = id.length >= 32 ? await query.eq("id", id).limit(1) : await query.order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(`Supabase getRequestById error: ${error.message}`);
  const rows = (data as AuditRequestRow[]) ?? [];
  if (id.length >= 32) return rows[0] ?? null;
  const short = id.replace(/-/g, "").toLowerCase();
  return rows.find(r => r.id.replace(/-/g, "").startsWith(short)) ?? null;
}

export async function saveProgressDirect(id: string, progress: JobProgress): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("audit_requests").update({ progress }).eq("id", id);
  if (error) throw new Error(`Supabase saveProgressDirect error: ${error.message}`);
}
