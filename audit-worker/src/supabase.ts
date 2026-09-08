import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuditRequestRow } from "./types.js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set — see audit-worker/.env.example");
  }
  client = createClient(url, key);
  return client;
}

/**
 * Atomically claims the oldest pending row by flipping it to "processing" and
 * returning it — using status="pending" in the WHERE clause means two worker
 * instances racing on the same row will only have one succeed the update.
 */
export async function claimNextPendingRequest(): Promise<AuditRequestRow | null> {
  const supabase = getClient();

  // retry_after is null on a fresh row and only ever set by
  // markRequestRateLimited() below — excluding rows still inside their
  // backoff window is what makes the queue "wait out" a rate limit instead
  // of hammering it, while a still-pending row's created_at (untouched)
  // keeps its original place in line once retry_after passes.
  const nowIso = new Date().toISOString();
  const { data: candidates, error: selectError } = await supabase
    .from("audit_requests")
    .select("id")
    .eq("status", "pending")
    .or(`retry_after.is.null,retry_after.lte.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(1);

  if (selectError) throw new Error(`Supabase select error: ${selectError.message}`);
  if (!candidates || candidates.length === 0) return null;

  const { data: claimed, error: updateError } = await supabase
    .from("audit_requests")
    .update({ status: "processing" })
    .eq("id", candidates[0].id)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (updateError) throw new Error(`Supabase claim error: ${updateError.message}`);
  // Null means another worker instance claimed it first between the select and
  // the update — not an error, just try again next poll tick.
  return (claimed as AuditRequestRow) ?? null;
}

// ASCII-only on purpose: business names here are frequently Arabic-script
// (GCC/MENA client base), which strips to nothing under a plain a-z0-9
// slugify — reportSlug() below always has a Latin-safe fallback (the
// website's hostname) ready for exactly that case, rather than silently
// producing an empty/near-empty slug.
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
 * The audit link's client-facing slug — e.g. "nour-home-goods-a1b2c3", not
 * a bare UUID. Prefers the business name (optional in the intake form);
 * falls back to the site's hostname when there's no business name, or when
 * the business name is non-Latin script and slugify() strips it to nothing.
 * Always suffixed with 6 hex chars from the request id: this is what
 * actually guarantees uniqueness (two audits can share a business name or
 * hostname), computed deterministically so publishing never needs an
 * existence-check round trip before upload.
 */
function reportSlug(opts: { requestId: string; businessName: string | null; website: string }): string {
  const fromName = opts.businessName ? slugify(opts.businessName) : "";
  const base = fromName || slugify(hostnameOf(opts.website)) || "audit";
  const shortId = opts.requestId.replace(/-/g, "").slice(0, 6);
  return `${base}-${shortId}`;
}

export async function publishAuditReport(opts: { requestId: string; html: string; businessName: string | null; website: string }): Promise<{ publicUrl: string; slug: string }> {
  const supabase = getClient();
  const bucket = process.env.AUDIT_REPORTS_BUCKET || "audit-reports";
  const slug = reportSlug(opts);
  const objectPath = `reports/${slug}/index.html`;
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, Buffer.from(opts.html, "utf8"), {
      contentType: "text/html; charset=utf-8",
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase report upload error: ${uploadError.message}`);
  }

  const publicUrl = `${siteUrl.replace(/\/$/, "")}/audit-reports/${encodeURIComponent(slug)}`;

  // Dedicated record of "the links of the pages" (report_pages — see
  // supabase/schema-content-backend.sql), separate from audit_requests'
  // own report_url column — this is also the row api/report/edit.js reads/
  // writes against when a published report's content needs to change
  // later. Upserted on slug so a retried/re-run publish for the same
  // request doesn't fail on the unique constraint.
  //
  // Deliberately non-fatal: report_pages.audit_request_id has a real FK
  // constraint against audit_requests(id), but test-run.ts/test-run-oauth.ts
  // call this with a synthetic requestId ("test-<timestamp>", not a UUID
  // and not a real row) for local testing without a queued request. The
  // report itself is already safely uploaded to Storage above and the
  // caller (test-run, or poll.ts in production, where requestId always IS
  // a real audit_requests.id) already has publicUrl — losing the bookkeeping
  // row shouldn't fail publishing or block emailing the client their link.
  const { error: reportPageError } = await supabase
    .from("report_pages")
    .upsert(
      { audit_request_id: opts.requestId, slug, storage_path: objectPath, public_url: publicUrl },
      { onConflict: "slug" },
    );
  if (reportPageError) {
    console.warn(`[supabase] report_pages upsert failed (non-fatal): ${reportPageError.message}`);
  }

  return { publicUrl, slug };
}

export async function markRequestFailed(id: string, message: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("audit_requests")
    .update({ status: "failed", result_error: message.slice(0, 2000) })
    .eq("id", id);
  if (error) throw new Error(`Supabase markRequestFailed error: ${error.message}`);
}

// Bounces a request that hit a rate limit mid-run back to 'pending' instead
// of failing it out of the queue — created_at is untouched, so it re-claims
// in its original order once retry_after passes. Backoff doubles per hit
// (5, 10, 20, 40, 60min...) and caps at 60min so a persistent limit doesn't
// balloon the wait into hours.
export async function markRequestRateLimited(id: string, previousRetryCount: number, message: string): Promise<Date> {
  const supabase = getClient();
  const backoffMinutes = Math.min(60, 5 * 2 ** previousRetryCount);
  const retryAfter = new Date(Date.now() + backoffMinutes * 60_000);
  const { error } = await supabase
    .from("audit_requests")
    .update({
      status: "pending",
      retry_after: retryAfter.toISOString(),
      retry_count: previousRetryCount + 1,
      result_error: message.slice(0, 2000),
    })
    .eq("id", id);
  if (error) throw new Error(`Supabase markRequestRateLimited error: ${error.message}`);
  return retryAfter;
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
