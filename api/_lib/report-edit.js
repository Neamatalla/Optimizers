// Report-edit logic, used by api/report/edit.js. Kept apart from the
// handler since none of this touches req/res.
import crypto from "node:crypto";
import { log } from "./log.js";
import { REPORT_PAGE_COLUMNS, loadReportData } from "./report-data.js";

// Same slug shape api/audit-report.js already validates against.
export const REPORT_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

// Constant-time compare so a timing attack can't narrow down the key
// character-by-character.
export function isAuthorized(providedKey, expectedKey) {
  if (!expectedKey) return false;
  if (typeof providedKey !== "string") return false;
  const a = Buffer.from(providedKey);
  const b = Buffer.from(expectedKey);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function findPage(supabase, slug) {
  const { data: page, error } = await supabase
    .from("report_pages")
    .select(`${REPORT_PAGE_COLUMNS}, public_url`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    log.error("report_pages lookup error", { error });
    return { result: { status: 500, body: { error: "Could not look up report page." } } };
  }
  if (!page) return { result: { status: 404, body: { error: "Unknown report slug." } } };
  return { page };
}

/** The report's rows, at any stage (no client-visibility check). */
export async function getReport({ supabase, bucket, slug }) {
  if (!REPORT_SLUG_RE.test(slug)) {
    return { status: 400, body: { error: "Invalid slug." } };
  }
  const { page, result } = await findPage(supabase, slug);
  if (!page) return result;
  const data = await loadReportData({ supabase, slug, page, defaultBucket: bucket });
  if (data.status !== 200) return data;
  if (data.body.legacyHtml !== undefined) {
    return { status: 409, body: { error: "This report is an old HTML file with no finding rows. Convert it with npm run backfill-report-rows in audit-worker." } };
  }
  return { status: 200, body: { slug, publicUrl: page.public_url, ...data.body } };
}

const isVoice = v => Boolean(v) && typeof v === "object" && typeof v.summary === "string" && typeof v.detail === "string";
const isObjectOrNull = v => v === null || (typeof v === "object" && !Array.isArray(v));
const isStringOrNull = v => v === null || typeof v === "string";

// The fields a PATCH may change, and what each must look like.
const EDITABLE = {
  technical: isVoice,
  business: isVoice,
  ar: isObjectOrNull,
  action: isObjectOrNull,
  protect: isStringOrNull,
  status: v => typeof v === "string",
};
const STATUSES = { check: ["pass", "fail"], friction: ["pass", "warn", "fail", "unassessed"] };

/** Changes one finding row. The page shows it on its next load. */
export async function updateFinding({ supabase, slug, findingId, changes }) {
  const trimmedSlug = String(slug || "").trim();
  if (!REPORT_SLUG_RE.test(trimmedSlug)) {
    return { status: 400, body: { error: "Invalid slug." } };
  }
  if (typeof findingId !== "string" || !findingId) {
    return { status: 400, body: { error: "findingId is required (the id of a finding from GET)." } };
  }
  if (!changes || typeof changes !== "object" || Array.isArray(changes) || Object.keys(changes).length === 0) {
    return { status: 400, body: { error: `changes must be an object with one or more of: ${Object.keys(EDITABLE).join(", ")}.` } };
  }
  for (const [field, value] of Object.entries(changes)) {
    if (!EDITABLE[field]) return { status: 400, body: { error: `${field} can't be edited. Editable: ${Object.keys(EDITABLE).join(", ")}.` } };
    if (!EDITABLE[field](value)) return { status: 400, body: { error: `${field} has the wrong shape.` } };
  }

  const { page, result } = await findPage(supabase, trimmedSlug);
  if (!page) return result;

  const { data: finding, error: findingError } = await supabase
    .from("audit_findings")
    .select("id, kind, audit_request_id")
    .eq("id", findingId)
    .maybeSingle();
  if (findingError) {
    log.error("audit_findings lookup error", { error: findingError });
    return { status: 500, body: { error: "Could not look up the finding." } };
  }
  if (!finding || finding.audit_request_id !== page.audit_request_id) {
    return { status: 404, body: { error: "No finding with that id in this report." } };
  }
  if (changes.status !== undefined && !STATUSES[finding.kind].includes(changes.status)) {
    return { status: 400, body: { error: `status must be one of: ${STATUSES[finding.kind].join(", ")}.` } };
  }

  const { error: updateError } = await supabase.from("audit_findings").update(changes).eq("id", findingId);
  if (updateError) {
    log.error("audit_findings update error", { error: updateError });
    return { status: 500, body: { error: "Could not save the finding." } };
  }
  return { status: 200, body: { success: true, slug: trimmedSlug, findingId } };
}
