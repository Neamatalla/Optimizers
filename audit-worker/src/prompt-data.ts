import type { Ga4Facts } from "./types.js";

/**
 * The raw Google data the main audit prompt carries, in a compact form.
 *
 * It used to be JSON.stringify(data, null, 2): GA4's report rows as nested
 * { metricValues: [{ value }], dimensionValues: [{ value }] } objects, one
 * line per value. That was ~520K characters (~190K tokens) for a big store,
 * and the whole audit's input. Nothing is dropped here except wrapper noise:
 * each report becomes its column names plus one array per row, and GTM
 * parameter lists become key/value objects.
 *
 * The one real cut: the hour-by-weekday report (168 rows) is left out when the
 * code already decided its action point (GA4-16, "Computed GA4 facts" quotes
 * it). The model is told to quote that fact, never recompute it.
 */

type Row = { dimensionValues?: Array<{ value?: unknown }>; metricValues?: Array<{ value?: unknown }> };
type Report = {
  rows?: Row[];
  totals?: Row[];
  rowCount?: number;
  metricHeaders?: Array<{ name?: string }>;
  dimensionHeaders?: Array<{ name?: string }>;
  metadata?: { currencyCode?: string; timeZone?: string };
};

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // Metric values are numbers as text; send them as numbers.
  return s !== "" && /^-?\d+(\.\d+)?$/.test(s) && String(Number(s)) === s ? Number(s) : s;
};
const rowOf = (r: Row) => [...(r.dimensionValues ?? []).map(d => cell(d.value)), ...(r.metricValues ?? []).map(m => cell(m.value))];

/** One GA4 report as { columns, rows[], rowCount }, same values as the API's answer. */
export function compactReport(r: unknown): unknown {
  const rep = r as Report | null;
  if (!rep || typeof rep !== "object" || !Array.isArray(rep.rows)) return r;
  const dims = (rep.dimensionHeaders ?? []).map(h => h.name ?? "");
  const metrics = (rep.metricHeaders ?? []).map(h => h.name ?? "");
  return {
    columns: [...dims, ...metrics],
    rows: rep.rows.map(rowOf),
    ...(rep.totals?.length ? { totals: rep.totals.map(rowOf) } : {}),
    ...(typeof rep.rowCount === "number" && rep.rowCount !== rep.rows.length ? { rowCount: rep.rowCount } : {}),
  };
}

/** The OAuth GA4 pull with its reports compacted. Other keys are left as they are. */
export function compactGa4(data: unknown, facts?: Ga4Facts | null): unknown {
  const d = data as { reportData?: Record<string, unknown> } | null;
  if (!d || typeof d !== "object" || !d.reportData || typeof d.reportData !== "object") return data;
  const decided = (id: string) => { const f = facts?.facts[id]; return Boolean(f && f.status !== "no_data"); };
  const meta = Object.values(d.reportData).map(r => (r as Report | null)?.metadata).find(Boolean);
  const reportData: Record<string, unknown> = {};
  for (const [name, report] of Object.entries(d.reportData)) {
    if (name === "hourDay" && decided("GA4-16")) continue;
    reportData[name] = compactReport(report);
  }
  return { ...d, reportData, ...(meta ? { reportsCurrency: meta.currencyCode, reportsTimeZone: meta.timeZone } : {}) };
}

type Param = { key?: string; type?: string; value?: unknown; list?: unknown; map?: unknown };
function params(list: unknown): unknown {
  if (!Array.isArray(list) || !list.every((p: Param) => p && typeof p.key === "string" && "value" in p && !p.list && !p.map)) return list;
  return Object.fromEntries((list as Param[]).map(p => [p.key as string, p.value]));
}

/** The GTM pull with each tag/trigger/variable's parameter list as { key: value }. */
export function compactGtm(data: unknown): unknown {
  const d = data as { liveVersion?: Record<string, unknown> } | null;
  if (!d || typeof d !== "object" || !d.liveVersion) return data;
  const walk = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(walk);
    if (!x || typeof x !== "object") return x;
    return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === "parameter" ? params(v) : walk(v)]));
  };
  return { ...d, liveVersion: walk(d.liveVersion) };
}

/** Compact JSON for a prompt. */
export const json = (x: unknown) => JSON.stringify(x);

/** Characters per named part, for the "[audit-prompt] sizes" log line. */
export function sizeLine(parts: Record<string, string | undefined | null>): string {
  const total = Object.values(parts).reduce((s, v) => s + (v?.length ?? 0), 0);
  return Object.entries(parts).filter(([, v]) => v).map(([k, v]) => `${k} ${v!.length}`).join(", ") + ` (parts total ${total})`;
}
