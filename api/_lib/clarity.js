// Microsoft Clarity, read through its Data Export API with a token the
// visitor pastes on the audit form (Clarity: Settings > Data Export >
// Generate new API token).
//
// The token is used once, here, at intake, and never stored: the form calls
// api/clarity/connect.js, which pulls a snapshot and hands it back to the
// browser, and the form submits that snapshot with the rest of the request
// (same pattern as ga4_oauth_data). The worker only ever sees the snapshot.
//
// Limits that shape this file (Clarity's, not ours):
//   - 10 API calls per project per day, so one connect spends at most 3.
//   - Only the last 1-3 days of data.
//   - The per-dimension breakdowns (URL, Device) have answered 400 for a
//     working token while the plain call succeeded (checked 2026-10-20), so
//     they are best-effort: a failure leaves that breakdown null.

export const CLARITY_API_BASE = "https://www.clarity.ms/export-data/api/v1/project-live-insights";
export const CLARITY_DAYS = 3;

// A Clarity Data Export token is a JWT: three base64url parts.
const TOKEN_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MAX_TOKEN_LENGTH = 4000;

export function isValidClarityToken(token) {
  const t = String(token || "").trim();
  return t.length > 20 && t.length <= MAX_TOKEN_LENGTH && TOKEN_RE.test(t);
}

export class ClarityError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // "auth" | "limit" | "unavailable"
  }
}

async function callClarity(token, params) {
  const query = new URLSearchParams({ numOfDays: String(CLARITY_DAYS), ...params });
  let res;
  try {
    res = await fetch(`${CLARITY_API_BASE}?${query}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new ClarityError("unavailable", `Could not reach Clarity: ${err?.message || err}`);
  }
  if (res.status === 401 || res.status === 403) throw new ClarityError("auth", "Clarity did not accept this token.");
  if (res.status === 429) throw new ClarityError("limit", "Clarity's daily limit for this project is used up.");
  if (!res.ok) {
    // Clarity's reply text names the cause (it has answered 400, not 429,
    // for a used-up daily quota). Kept short; it goes to the server log only.
    const detail = (await res.text().catch(() => "")).replace(/\s+/g, " ").trim().slice(0, 300);
    if (/limit|quota|exceed|too many/i.test(detail)) throw new ClarityError("limit", "Clarity's daily limit for this project is used up.");
    throw new ClarityError("unavailable", `Clarity answered ${res.status}${detail ? `: ${detail}` : "."}`);
  }
  const body = await res.json().catch(() => null);
  if (!Array.isArray(body)) throw new ClarityError("unavailable", "Clarity sent an unexpected response.");
  return body;
}

// ---------------------------------------------------------------------------
// Turning Clarity's metric list into one small, fixed-shape snapshot
// ---------------------------------------------------------------------------

const num = v => (typeof v === "number" && Number.isFinite(v) ? v : null);
const pct = v => {
  const n = num(v);
  return n === null ? null : Math.min(100, Math.max(0, Math.round(n * 100) / 100));
};
const text = (v, max = 300) => (typeof v === "string" ? v.slice(0, max) : null);
const metric = (list, name) => list.find(m => m?.metricName === name)?.information || [];

// The "share of sessions with this behaviour" metrics.
const BEHAVIOURS = {
  deadClicks: "DeadClickCount",
  rageClicks: "RageClickCount",
  quickbacks: "QuickbackClick",
  excessiveScroll: "ExcessiveScroll",
  scriptErrors: "ScriptErrorCount",
  errorClicks: "ErrorClickCount",
};

function behaviour(info) {
  const row = info?.[0];
  if (!row) return null;
  return {
    sessionsPct: pct(row.sessionsWithMetricPercentage),
    pageViews: num(row.pagesViews),
    count: num(row.subTotal),
  };
}

function named(info, limit = 10) {
  return info
    .map(r => ({ name: text(r?.name, 200), sessions: num(r?.sessionsCount) }))
    .filter(r => r.name && r.sessions !== null)
    .slice(0, limit);
}

/** The plain (no-dimension) call: sitewide numbers for the period. */
export function parseOverview(list) {
  const traffic = metric(list, "Traffic")[0] || {};
  const engagement = metric(list, "EngagementTime")[0] || {};
  const behaviours = {};
  for (const [key, name] of Object.entries(BEHAVIOURS)) behaviours[key] = behaviour(metric(list, name));
  return {
    sessions: num(traffic.totalSessionCount),
    botSessions: num(traffic.totalBotSessionCount),
    distinctUsers: num(traffic.distinctUserCount),
    pagesPerSession: num(traffic.pagesPerSessionPercentage),
    engagement: { totalSeconds: num(engagement.totalTime), activeSeconds: num(engagement.activeTime) },
    scrollDepth: pct(metric(list, "ScrollDepth")[0]?.averageScrollDepth),
    behaviours,
    devices: named(metric(list, "Device")),
    browsers: named(metric(list, "Browser")),
    os: named(metric(list, "OS")),
    countries: named(metric(list, "Country")),
    referrers: named(metric(list, "ReferrerUrl")),
    pageTitles: named(metric(list, "PageTitle")),
    topPages: metric(list, "PopularPages")
      .map(r => ({ url: text(r?.url, 500), visits: num(r?.visitsCount) }))
      .filter(r => r.url && r.visits !== null)
      .slice(0, 10),
  };
}

// A dimension call returns the same metrics, one information row per value
// of the dimension. The value's field name isn't documented, so take the
// row's first string field.
const NUMERIC_FIELDS = new Set(["sessionsCount", "sessionsWithMetricPercentage", "sessionsWithoutMetricPercentage", "pagesViews", "subTotal", "averageScrollDepth"]);
function dimensionValue(row) {
  for (const [k, v] of Object.entries(row || {})) {
    if (!NUMERIC_FIELDS.has(k) && typeof v === "string" && v) return v.slice(0, 500);
  }
  return null;
}

/** A URL or Device breakdown: one row per value, top 15 by sessions. */
export function parseBreakdown(list) {
  const rows = new Map();
  const get = key => {
    if (!rows.has(key)) rows.set(key, { name: key, sessions: null, scrollDepth: null });
    return rows.get(key);
  };
  for (const [key, name] of Object.entries(BEHAVIOURS)) {
    for (const r of metric(list, name)) {
      const value = dimensionValue(r);
      if (!value) continue;
      const row = get(value);
      row[key] = pct(r.sessionsWithMetricPercentage);
      row.sessions = row.sessions ?? num(r.sessionsCount);
    }
  }
  for (const r of metric(list, "ScrollDepth")) {
    const value = dimensionValue(r);
    if (value) get(value).scrollDepth = pct(r.averageScrollDepth);
  }
  const out = [...rows.values()].filter(r => r.sessions !== null).sort((a, b) => b.sessions - a.sessions).slice(0, 15);
  return out.length ? out : null;
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Does this Clarity project belong to the audited website? True when any of
 * Clarity's popular pages is on that hostname. A token for another site
 * would otherwise put someone else's behaviour data in this store's report,
 * so the worker ignores a snapshot that doesn't match.
 */
export function clarityMatchesSite(topPages, websiteHostname) {
  const site = String(websiteHostname || "").toLowerCase().replace(/^www\./, "");
  if (!site || !Array.isArray(topPages)) return false;
  return topPages.some(p => {
    const host = hostOf(p?.url);
    return !!host && (host === site || host.endsWith(`.${site}`));
  });
}

/** One connect: the overview (required) plus two best-effort breakdowns. */
export async function fetchClaritySnapshot(token, websiteHostname) {
  const overview = parseOverview(await callClarity(token, {}));
  const breakdown = async dimension => {
    try {
      return parseBreakdown(await callClarity(token, { dimension1: dimension }));
    } catch (err) {
      if (err instanceof ClarityError && err.kind === "auth") throw err;
      return null;
    }
  };
  const byUrl = await breakdown("URL");
  const byDevice = await breakdown("Device");
  return {
    source: "clarity",
    fetchedAt: new Date().toISOString(),
    days: CLARITY_DAYS,
    hostMatch: clarityMatchesSite(overview.topPages, websiteHostname),
    ...overview,
    byUrl,
    byDevice,
  };
}

/**
 * The form submits the snapshot back to us, so audit-request.js rebuilds it
 * here from known fields only: anything else is dropped, numbers are
 * checked, lists and strings are capped, and the site match is worked out
 * again from the pages rather than trusted. Returns null for anything that
 * isn't a Clarity snapshot.
 */
export function sanitizeClaritySnapshot(raw, websiteHostname) {
  if (!raw || typeof raw !== "object" || raw.source !== "clarity") return null;
  const behaviours = {};
  for (const key of Object.keys(BEHAVIOURS)) {
    const b = raw.behaviours?.[key];
    behaviours[key] = b && typeof b === "object" ? { sessionsPct: pct(b.sessionsPct), pageViews: num(b.pageViews), count: num(b.count) } : null;
  }
  const namedList = (list, limit = 10) =>
    (Array.isArray(list) ? list : [])
      .map(r => ({ name: text(r?.name, 200), sessions: num(r?.sessions) }))
      .filter(r => r.name && r.sessions !== null)
      .slice(0, limit);
  const breakdown = list => {
    if (!Array.isArray(list)) return null;
    const rows = list.slice(0, 15).map(r => {
      const row = { name: text(r?.name, 500), sessions: num(r?.sessions), scrollDepth: pct(r?.scrollDepth) };
      for (const key of Object.keys(BEHAVIOURS)) row[key] = pct(r?.[key]);
      return row;
    }).filter(r => r.name && r.sessions !== null);
    return rows.length ? rows : null;
  };
  const topPages = (Array.isArray(raw.topPages) ? raw.topPages : [])
    .map(r => ({ url: text(r?.url, 500), visits: num(r?.visits) }))
    .filter(r => r.url && r.visits !== null)
    .slice(0, 10);
  const fetchedAt = text(raw.fetchedAt, 40);
  return {
    source: "clarity",
    fetchedAt: fetchedAt && !Number.isNaN(Date.parse(fetchedAt)) ? fetchedAt : null,
    days: [1, 2, 3].includes(raw.days) ? raw.days : CLARITY_DAYS,
    hostMatch: clarityMatchesSite(topPages, websiteHostname),
    sessions: num(raw.sessions),
    botSessions: num(raw.botSessions),
    distinctUsers: num(raw.distinctUsers),
    pagesPerSession: num(raw.pagesPerSession),
    engagement: { totalSeconds: num(raw.engagement?.totalSeconds), activeSeconds: num(raw.engagement?.activeSeconds) },
    scrollDepth: pct(raw.scrollDepth),
    behaviours,
    devices: namedList(raw.devices),
    browsers: namedList(raw.browsers),
    os: namedList(raw.os),
    countries: namedList(raw.countries),
    referrers: namedList(raw.referrers),
    pageTitles: namedList(raw.pageTitles),
    topPages,
    byUrl: breakdown(raw.byUrl),
    byDevice: breakdown(raw.byDevice),
  };
}
