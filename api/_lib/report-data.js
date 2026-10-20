// Loads one report's data for the static report page (api/audit-report.js)
// and the edit endpoint (api/report/edit.js). A report is rows in
// audit_reports/audit_findings (written by audit-worker/src/supabase.ts
// saveAuditReport); an old one that was never converted is still one HTML
// file in Storage, returned as { legacyHtml }.
import { log } from "./log.js";

// What both endpoints read from report_pages: where the report lives, plus
// the request fields the page needs and the status that decides visibility.
export const REPORT_PAGE_COLUMNS =
  "audit_request_id, bucket, storage_path, audit_requests(status, scheduled_send_at, website, business_name, audience_role)";

export async function loadReportData({ supabase, slug, page, defaultBucket }) {
  if (page) {
    const id = page.audit_request_id;
    const { data: report, error } = await supabase.from("audit_reports").select("*").eq("audit_request_id", id).maybeSingle();
    if (error) {
      log.error("audit_reports lookup error", { error });
      return { status: 500, body: { error: "Could not load audit report." } };
    }
    if (report) {
      const { data: findings, error: findingsError } = await supabase
        .from("audit_findings")
        .select("*")
        .eq("audit_request_id", id)
        .order("kind")
        .order("sort_order");
      if (findingsError) {
        log.error("audit_findings lookup error", { error: findingsError });
        return { status: 500, body: { error: "Could not load audit report." } };
      }
      const request = page.audit_requests || {};
      return {
        status: 200,
        body: {
          request: { website: request.website, business_name: request.business_name ?? null, audience_role: request.audience_role ?? null },
          report,
          findings: findings ?? [],
        },
      };
    }
    if (!page.storage_path) {
      return { status: 404, body: { error: "Audit report not found." } };
    }
  }

  // An old report: one HTML file. A slug with no report_pages row at all
  // predates that table and uses the default path.
  const bucket = page?.bucket || defaultBucket;
  const objectPath = page?.storage_path || `reports/${slug}/index.html`;
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error || !data) {
    log.error("Supabase report download error", { error });
    return { status: 404, body: { error: "Audit report not found." } };
  }
  return { status: 200, body: { legacyHtml: await data.text() } };
}
