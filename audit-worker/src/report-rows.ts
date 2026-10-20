import type { AuditResult, CategoryFinding, CategoryKey, CategoryResult, FudFinding, FudResult, JobProgress, AuditRequestRow } from "./types.js";
import { audienceRoleOf } from "./audience.js";
import { computeOverallPoints } from "./scoring.js";
import { frictionScore, sortFindings } from "./fud/score.js";

/**
 * An audit's result as database rows (supabase/schema.sql: audit_reports,
 * audit_findings) and back. The worker writes with toRows (supabase.ts
 * saveAuditReport); the static report page reads with fromRows
 * (src/audit-report/main.ts). No Node APIs: this module also runs in the
 * browser.
 *
 * Scores are never stored. fromRows counts passes from the finding rows, so
 * a status edited through api/report/edit.js updates every score with it.
 */

// The audit_requests fields the report needs.
export interface ReportRequest {
  website: string;
  business_name: string | null;
  audience_role?: string | null;
}

// FudResult without its findings and scores.
export type FrictionSummary = Omit<FudResult, "findings" | "score" | "assessed" | "applicable">;

export interface ReportRow {
  generated_at: string;
  discovered_pages: string[];
  page_speed: AuditResult["pageSpeed"] | null;
  ga4_metrics: AuditResult["ga4Metrics"] | null;
  ga4_facts: AuditResult["ga4Facts"] | null;
  friction: FrictionSummary | null;
  screenshot_desktop_url: string | null;
  screenshot_mobile_url: string | null;
}

// FudFinding fields that have no column of their own.
export type FrictionDetails = Omit<FudFinding, "ruleId" | "pageType" | "status" | "opportunity" | "technical" | "business" | "ar" | "action">;

export interface FindingRow {
  // Set by the database; absent on rows not saved yet.
  id?: string;
  kind: "check" | "friction";
  category: string;
  point_id: string;
  sort_order: number;
  status: string;
  severity: string | null;
  opportunity: string | null;
  data_source: string | null;
  technical: CategoryFinding["technical"];
  business: CategoryFinding["business"];
  ar: CategoryFinding["ar"] | FudFinding["ar"] | null;
  action: CategoryFinding["action"] | null;
  protect: string | null;
  criteria: string | null;
  details: FrictionDetails | null;
}

export function toRows(result: AuditResult): { report: ReportRow; findings: FindingRow[] } {
  const fud = result.fud ?? null;
  const report: ReportRow = {
    generated_at: result.generatedAt ?? new Date().toISOString(),
    discovered_pages: result.discoveredPages ?? [],
    page_speed: result.pageSpeed ?? null,
    ga4_metrics: result.ga4Metrics ?? null,
    ga4_facts: result.ga4Facts ?? null,
    friction: fud ? frictionSummary(fud) : null,
    screenshot_desktop_url: result.screenshots?.desktop ?? null,
    screenshot_mobile_url: result.screenshots?.mobile ?? null,
  };
  return { report, findings: [...checkRows(result.categories), ...frictionRows(fud)] };
}

export function frictionSummary(fud: FudResult): FrictionSummary {
  const { findings: _findings, score: _score, assessed: _assessed, applicable: _applicable, ...summary } = fud;
  return summary;
}

function checkRows(categories: CategoryResult[]): FindingRow[] {
  const rows: FindingRow[] = [];
  for (const cat of categories) {
    for (const f of cat.findings) {
      rows.push({
        kind: "check",
        category: cat.category,
        point_id: f.checklistId,
        // One running order across categories, so it also keeps their order.
        sort_order: rows.length,
        status: f.status,
        severity: f.severity ?? null,
        opportunity: f.opportunity ?? null,
        data_source: f.dataSource ?? null,
        technical: f.technical,
        business: f.business,
        ar: f.ar ?? null,
        action: f.action ?? null,
        protect: f.protect ?? null,
        criteria: f.criteria ?? null,
        details: null,
      });
    }
  }
  return rows;
}

export function frictionRows(fud: FudResult | null): FindingRow[] {
  return (fud?.findings ?? []).map((f, i) => {
    const { ruleId, pageType, status, opportunity, technical, business, ar, action, ...details } = f;
    return {
      kind: "friction",
      category: pageType,
      point_id: ruleId,
      sort_order: i,
      status,
      severity: null,
      opportunity: opportunity ?? null,
      data_source: null,
      technical,
      business,
      ar: ar ?? null,
      action: action ?? null,
      protect: null,
      criteria: null,
      details,
    };
  });
}

export function fromRows(request: ReportRequest, report: ReportRow, findings: FindingRow[]): AuditResult {
  const rows = [...findings].sort((a, b) => a.sort_order - b.sort_order);

  const byCategory = new Map<CategoryKey, CategoryFinding[]>();
  for (const r of rows) {
    if (r.kind !== "check") continue;
    const key = r.category as CategoryKey;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(checkFinding(r));
  }
  const categories: CategoryResult[] = [...byCategory].map(([category, list]) => {
    const passed = list.filter(f => f.status === "pass").length;
    return {
      category,
      score: list.length ? Math.round((passed / list.length) * 100) : 0,
      checklistTally: { total: list.length, evaluated: list.length, passed },
      findings: list,
    };
  });
  const { earned, possible } = computeOverallPoints(categories);

  let fud: FudResult | null = null;
  if (report.friction) {
    const list = sortFindings(rows.filter(r => r.kind === "friction").map(frictionFinding));
    // Same score as fud/index.ts: hidden findings don't count.
    const scores = frictionScore(list.filter(f => f.override?.to !== "hidden").map(f => f.status));
    fud = { ...report.friction, ...scores, findings: list };
  }

  const screenshots = report.screenshot_desktop_url || report.screenshot_mobile_url
    ? { desktop: report.screenshot_desktop_url, mobile: report.screenshot_mobile_url }
    : undefined;

  return {
    categories,
    overallScore: earned,
    possiblePoints: possible,
    websiteUrl: request.website,
    businessName: request.business_name,
    audienceRole: audienceRoleOf(request.audience_role),
    discoveredPages: report.discovered_pages ?? [],
    pageSpeed: report.page_speed ?? undefined,
    screenshots,
    ga4Metrics: report.ga4_metrics ?? null,
    fud,
    ga4Facts: report.ga4_facts ?? null,
    generatedAt: report.generated_at,
  };
}

// Leaves optional fields out rather than setting them to undefined, so a
// round trip gives back the same object.
function checkFinding(r: FindingRow): CategoryFinding {
  const f = {
    checklistId: r.point_id,
    status: r.status,
    severity: r.severity,
    dataSource: r.data_source,
    technical: r.technical,
    business: r.business,
  } as CategoryFinding;
  if (r.ar) f.ar = r.ar as CategoryFinding["ar"];
  if (r.criteria !== null) f.criteria = r.criteria;
  if (r.opportunity) f.opportunity = r.opportunity as CategoryFinding["opportunity"];
  if (r.action) f.action = r.action;
  if (r.protect !== null) f.protect = r.protect;
  return f;
}

function frictionFinding(r: FindingRow): FudFinding {
  const f = {
    ...(r.details as FrictionDetails),
    ruleId: r.point_id,
    pageType: r.category,
    status: r.status,
    technical: r.technical,
    business: r.business,
  } as FudFinding;
  if (r.ar) f.ar = r.ar as FudFinding["ar"];
  if (r.opportunity) f.opportunity = r.opportunity as FudFinding["opportunity"];
  if (r.action) f.action = r.action;
  return f;
}

/**
 * The AuditResult the worker saved in progress, with the request's own
 * fields. Shared by poll.ts, fud-override.ts and backfill-report-rows.ts.
 */
export function auditResultFrom(row: Pick<AuditRequestRow, "website" | "business_name" | "audience_role">, progress: JobProgress, fud: FudResult | null): AuditResult {
  const categories = progress.categories ?? [];
  const { earned, possible } = computeOverallPoints(categories);
  return {
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
}
