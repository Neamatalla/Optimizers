// Shared, platform-agnostic Google OAuth + GA4/GTM data-fetch logic.
// Imported by both api/oauth/google/*.js (the real Vercel functions) and
// vite.config.ts's dev middleware — one implementation, not the usual
// duplicated-per-platform pattern, since none of this touches req/res.
//
// Underscore-prefixed directory so Vercel's builder doesn't treat this as a
// route of its own.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA4_ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta";
// enhancedMeasurementSettings, dataRedactionSettings, googleSignalsSettings,
// and attributionSettings are still v1alpha-only resources as of this
// writing (confirmed directly: identical requests 404 on v1beta with a
// generic Google-frontend error page — not a permission/JSON API error —
// and return real 200 JSON on v1alpha) — despite v1beta covering everything
// else used in this file (property/stream/keyEvent/customDimension/etc.).
const GA4_ADMIN_ALPHA_BASE = "https://analyticsadmin.googleapis.com/v1alpha";
const GA4_DATA_BASE = "https://analyticsdata.googleapis.com/v1beta";
const GTM_BASE = "https://www.googleapis.com/tagmanager/v2";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/tagmanager.readonly",
].join(" ");

export function buildAuthorizeUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "online", // one-shot read at consent time — no refresh token to store/secure long-term
    prompt: "consent",
    state,
    include_granted_scopes: "false",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken({ clientId, clientSecret, redirectUri, code }) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${json.error_description || json.error || res.status}`);
  }
  return json.access_token;
}

async function gget(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`GET ${url} -> ${res.status}: ${body.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function gpost(url, token, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const responseBody = await res.text().catch(() => "");
    const err = new Error(`POST ${url} -> ${res.status}: ${responseBody.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

const LAST_28_DAYS = { startDate: "28daysAgo", endDate: "today" };

/**
 * Real GA4 Data API pulls for one property, using the visitor's own OAuth
 * token — the fix for a real gap: GA4-D1 through GA4-D15 in checklist.ts are
 * "open data-driven analysis slots" that need actual run_report/
 * run_realtime_report results, but a visitor who connects via this OAuth
 * popup (rather than sharing access with the shared service account) never
 * had any of that real data available to audit-prompt.ts — only the
 * config-only fields above (property settings, retention, key events list).
 * Fetched here, eagerly, same reasoning as fetchAllGA4Properties' own doc
 * comment: the token is online/one-shot and gone once this request ends.
 *
 * Each call is independently best-effort (see fetchAllGA4Properties) so one
 * missing permission or an empty property doesn't drop the rest. Deliberately
 * does NOT attempt change-history or Data Access Reports — GA4-D13/GA4-D14
 * used to be those, but are now the ecommerce funnel's browse/checkout
 * halves instead (see FUNNEL_EVENTS below and checklist.ts's own entries for
 * those two ids). Change-history and Data Access Reports are no longer
 * scored checklist points at all, on any route.
 */
// Standard GA4 Enhanced Ecommerce funnel events, in journey order — used for
// GA4-D13 (browse: view_item_list/view_item/add_to_cart) and GA4-D14
// (checkout: add_shipping_info/add_payment_info/purchase). Real,
// Google-recommended event names, not a business-specific guess (same
// reasoning as purchaseMetrics' "purchase" filter below).
const FUNNEL_EVENTS = ["view_item_list", "view_item", "add_to_cart", "add_shipping_info", "add_payment_info", "purchase"];

async function fetchGa4ReportData(propertyName, token) {
  const runReport = (body) => gpost(`${GA4_DATA_BASE}/${propertyName}:runReport`, token, body).catch(e => ({ error: e.message }));

  const [realtime, weekOverWeek, eventVolume, channels, totals, landingPages, geoDevice, newVsReturning, purchaseMetrics, funnel] = await Promise.all([
    gpost(`${GA4_DATA_BASE}/${propertyName}:runRealtimeReport`, token, { metrics: [{ name: "activeUsers" }] }).catch(e => ({ error: e.message })),
    // NOTE: `dateRange` must NOT be listed in `dimensions` — confirmed
    // directly against the real API: "Field dateRange is not a dimension.
    // This field can be used in a Pivot or OrderBy like a dimension, but
    // does not need to be listed in the Dimensions." With 2+ dateRanges
    // entries, GA4 automatically includes a dateRange column (its `name`
    // value) in every response row without it being requested.
    runReport({
      dateRanges: [
        { startDate: "7daysAgo", endDate: "today", name: "last7Days" },
        { startDate: "14daysAgo", endDate: "8daysAgo", name: "prior7Days" },
      ],
      metrics: [{ name: "sessions" }, { name: "eventCount" }],
    }),
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: "25",
    }),
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
    }),
    runReport({
      dateRanges: [LAST_28_DAYS],
      metrics: [{ name: "sessions" }, { name: "engagedSessions" }, { name: "averageSessionDuration" }, { name: "conversions" }],
    }),
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "15",
    }),
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "country" }, { name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "20",
    }),
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
    }),
    // "purchase" is GA4's own standard Enhanced Ecommerce event name (per
    // Google's recommended-events schema), not a business-specific guess —
    // safe to query directly by exact name rather than relying on it
    // surfacing in eventVolume's top-25-by-count list above (a business
    // with far more page_view/view_item traffic than purchases, same as
    // this one, can easily have "purchase" fall outside that top 25 even
    // though it fires plenty in absolute terms).
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }, { name: "purchaseRevenue" }, { name: "transactions" }],
      dimensionFilter: {
        filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "purchase" } },
      },
    }),
    // Real step-by-step ecommerce funnel (GA4-D13 browse half, GA4-D14
    // checkout half) — totalUsers per step, not just eventCount, since a
    // single user can fire the same event (e.g. view_item) many times;
    // totalUsers is the closer real proxy for "how many distinct people
    // actually reached this step" that a funnel drop-off calculation needs.
    runReport({
      dateRanges: [LAST_28_DAYS],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
      dimensionFilter: {
        filter: { fieldName: "eventName", inListFilter: { values: FUNNEL_EVENTS } },
      },
    }),
  ]);

  return { realtime, weekOverWeek, eventVolume, channels, totals, landingPages, geoDevice, newVsReturning, purchaseMetrics, funnel };
}

/**
 * Lists EVERY GA4 property the consenting user's token can see (that has a
 * web data stream) and pulls checklist-relevant detail for each — not just
 * one exact-matched property. This is what powers the form's "pick your
 * property from a dropdown" step: the visitor sees every property, with
 * whichever one the site crawl detected pre-selected/starred client-side
 * (see GetFreeAudit.tsx) rather than the server silently deciding for them.
 *
 * Fetches everything eagerly, in this one call, because the access token is
 * "online" (no refresh token) and lives only as long as this OAuth callback
 * round-trip — there's no session to hold it in for a later "now fetch the
 * one they picked" request. Known tradeoff: an account with a very large
 * number of properties means a lot of parallel Admin API calls in one shot;
 * fine at this tool's personal/agency scale, would need paging + real
 * concurrency limits before that stopped being true.
 */
/**
 * One log line per returned property/container, with exactly the fields the
 * client-side auto-selection keys off: the measurement id, each web stream's
 * defaultUri, and (for containers) the GA4 ids found inside the container's
 * own config. When a visitor reports "it picked the wrong property", this is
 * the evidence needed to tell which signal was missing, without asking them
 * to reconnect.
 */
export function describeOAuthResult({ ga4Properties, gtmContainers }) {
  const lines = [];
  if (Array.isArray(ga4Properties)) {
    for (const p of ga4Properties) {
      const uris = (p.dataStreams || []).map(s => s.webStreamData?.defaultUri).filter(Boolean).join(" ") || "(no stream uri)";
      lines.push(`  GA4  ${p.measurementId || "(no web stream)"}  ${p.displayName}  streams: ${uris}`);
    }
  } else if (ga4Properties?.error) {
    lines.push(`  GA4  FETCH FAILED: ${ga4Properties.error}`);
  }
  if (Array.isArray(gtmContainers)) {
    for (const c of gtmContainers) {
      const discovered = (c.discoveredGa4MeasurementIds || []).join(",") || "none";
      const domains = (c.domainName || []).join(" ") || "(none declared)";
      lines.push(`  GTM  ${c.publicId}  ${c.containerName}  domains: ${domains}  ga4-in-container: ${discovered}`);
    }
  } else if (gtmContainers?.error) {
    lines.push(`  GTM  FETCH FAILED: ${gtmContainers.error}`);
  }
  return lines.join("\n");
}

export async function fetchAllGA4Properties(token) {
  let summaries;
  try {
    summaries = await gget(`${GA4_ADMIN_BASE}/accountSummaries?pageSize=200`, token);
  } catch (err) {
    return { error: `Could not list GA4 accounts: ${err.message}` };
  }

  const propertySummaries = (summaries.accountSummaries || []).flatMap(a => a.propertySummaries || []);

  const properties = await Promise.all(propertySummaries.map(async prop => {
    const propertyName = prop.property; // "properties/12345"
    let streams;
    try {
      streams = await gget(`${GA4_ADMIN_BASE}/${propertyName}/dataStreams?pageSize=50`, token);
    } catch {
      return null;
    }
    const webStream = (streams.dataStreams || []).find(s => s.webStreamData?.measurementId);
    if (!webStream) return null; // no web stream on this property — nothing for the audit to key off

    // Each call independently best-effort so one missing permission doesn't
    // drop the whole property from the list. Six of these back GA4-3/4/5/6/
    // 10/13 specifically (enhancedMeasurement, dataRedaction,
    // measurementProtocolSecrets are sub-resources of the web STREAM, not the
    // property — googleSignals, customDimensions, customMetrics are
    // property-level): those checklist points were failing outright on the
    // OAuth route because this pre-fetch never included them and
    // mcp__ga4-admin isn't allowlisted here to fall back on (same root cause
    // as fetchGa4ReportData's own doc comment, just for Admin API config
    // instead of Data API report pulls).
    const [
      details, retention, keyEvents, adsLinks, attribution, reportData,
      enhancedMeasurement, dataRedaction, measurementProtocolSecrets,
      googleSignals, customDimensions, customMetrics,
    ] = await Promise.all([
      gget(`${GA4_ADMIN_BASE}/${propertyName}`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_BASE}/${propertyName}/dataRetentionSettings`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_BASE}/${propertyName}/keyEvents?pageSize=50`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_BASE}/${propertyName}/googleAdsLinks?pageSize=50`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_ALPHA_BASE}/${propertyName}/attributionSettings`, token).catch(e => ({ error: e.message })),
      fetchGa4ReportData(propertyName, token),
      gget(`${GA4_ADMIN_ALPHA_BASE}/${webStream.name}/enhancedMeasurementSettings`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_ALPHA_BASE}/${webStream.name}/dataRedactionSettings`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_BASE}/${webStream.name}/measurementProtocolSecrets?pageSize=50`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_ALPHA_BASE}/${propertyName}/googleSignalsSettings`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_BASE}/${propertyName}/customDimensions?pageSize=200`, token).catch(e => ({ error: e.message })),
      gget(`${GA4_ADMIN_BASE}/${propertyName}/customMetrics?pageSize=200`, token).catch(e => ({ error: e.message })),
    ]);

    return {
      propertyName,
      displayName: prop.displayName || propertyName,
      measurementId: webStream.webStreamData.measurementId,
      details,
      dataStreams: streams.dataStreams,
      retention,
      keyEvents: keyEvents.keyEvents || keyEvents,
      googleAdsLinks: adsLinks.googleAdsLinks || adsLinks,
      attribution,
      enhancedMeasurement,
      dataRedaction,
      measurementProtocolSecrets: measurementProtocolSecrets.measurementProtocolSecrets || measurementProtocolSecrets,
      googleSignals,
      customDimensions: customDimensions.customDimensions || customDimensions,
      customMetrics: customMetrics.customMetrics || customMetrics,
      // Real Data API pulls (see fetchGa4ReportData's own doc comment) — the
      // fix for GA4-D1..D15 having nothing real to work with on the OAuth
      // route. `{error}` on any individual field means that specific pull
      // failed (permission/quota/empty property), not the whole property.
      reportData,
    };
  }));

  return properties.filter(Boolean);
}

/**
 * Same idea for GTM: every container the token can see, each with its live
 * version's tag/trigger/variable inventory — not just one exact-matched
 * container. See fetchAllGA4Properties' doc comment for why this fetches
 * everything eagerly instead of "list now, fetch detail after the visitor
 * picks."
 */
export async function fetchAllGTMContainers(token) {
  let accounts;
  try {
    accounts = await gget(`${GTM_BASE}/accounts`, token);
  } catch (err) {
    return { error: `Could not list GTM accounts: ${err.message}` };
  }

  const containersByAccount = await Promise.all((accounts.account || []).map(async account => {
    try {
      const containers = await gget(`${GTM_BASE}/accounts/${account.accountId}/containers`, token);
      return (containers.container || [])
        .filter(c => c.publicId)
        .map(container => ({ account, container }));
    } catch {
      return [];
    }
  }));

  const flat = containersByAccount.flat();

  return Promise.all(flat.map(async ({ account, container }) => {
    const path = `${GTM_BASE}/accounts/${account.accountId}/containers/${container.containerId}`;
    const [liveVersion, workspaces, versions] = await Promise.all([
      gget(`${path}/versions:live`, token).catch(e => ({ error: e.message })),
      gget(`${path}/workspaces`, token).catch(e => ({ error: e.message })),
      gget(`${path}/versions`, token).catch(e => ({ error: e.message })),
    ]);
    return {
      accountId: account.accountId,
      containerId: container.containerId,
      publicId: container.publicId,
      containerName: container.name,
      // Domains the container owner has associated with it in GTM itself —
      // when present, this is a direct, reliable signal for "does this
      // container belong to the site the visitor entered" instead of
      // inferring it from what the JS-free crawl happened to see.
      domainName: container.domainName || [],
      liveVersion: {
        tags: (liveVersion.tag || []).map(t => ({ name: t.name, type: t.type })),
        triggers: (liveVersion.trigger || []).map(t => ({ name: t.name, type: t.type })),
        variables: (liveVersion.variable || []).map(v => ({ name: v.name, type: v.type })),
      },
      // GA4 measurement IDs configured *inside this container's own tags*
      // (typically a "Google tag" / googtag-type tag's parameters) — the
      // fix for a real gap: a site that deploys GA4 entirely through GTM,
      // with no literal gtag.js snippet server-rendered anywhere, is
      // invisible to the plain-HTML site crawl (api/_lib/detect-tracking.js)
      // by construction — GTM injects that script client-side at runtime,
      // after the JS-free crawl has already finished reading. Once
      // connected, though, the real tag config is right here, so this scans
      // it directly instead of trying to guess from HTML.
      discoveredGa4MeasurementIds: extractGa4IdsFromContainerVersion(liveVersion),
      workspaceCount: workspaces.workspace?.length,
      versionCount: versions.containerVersionHeader?.length,
    };
  }));
}

// Matches a parameter's *whole* value, not embedded in a longer string —
// GTM parameter values are structured config, not free-form page text, so
// this doesn't need the URL-anchored patterns above (which exist specifically
// to avoid false positives like the `g-recaptcha` CSS class in raw HTML).
const GA4_ID_VALUE_RE = /^G-[A-Z0-9]{6,}$/i;

// For values that are NOT just an id — a Custom HTML tag pasting a real
// gtag.js snippet, say. Same anchoring as detect-tracking.js's patterns, for
// the same reason: a bare "G-something" scan over script text matches too
// much.
const GA4_ID_IN_TEXT_PATTERNS = [
  /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]{6,})/gi,
  /gtag\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]{6,})['"]/gi,
];

// GTM parameters are a TREE, not a flat list: a "Google tag" stores its
// config rows as a LIST parameter of MAP parameters, each with its own
// nested `list`/`map` arrays. Walking only the top level (what this used to
// do) misses every id that isn't a direct scalar on the tag itself.
function collectParamValues(params, out) {
  for (const param of params || []) {
    if (typeof param.value === "string") out.push(param.value);
    if (Array.isArray(param.list)) collectParamValues(param.list, out);
    if (Array.isArray(param.map)) collectParamValues(param.map, out);
  }
  return out;
}

/**
 * Every GA4 measurement id configured anywhere in a container's live
 * version. Takes the whole version, not just its tags, because the id
 * usually isn't on the tag at all.
 *
 * Found by inspecting a real production container (tharaa.shop,
 * GTM-NLHFNL8G): its GA4 id lives in a CONSTANT VARIABLE named "GA4
 * Measurement ID" (`type: "c"`), and every GA4 tag references it as
 * `{{GA4 Measurement ID}}`. Scanning tags alone therefore found nothing —
 * and this scan is the only fallback for exactly that deployment style,
 * where GTM injects gtag.js at runtime and the JS-free site crawl can't see
 * the id either. Net effect of the old version: the site's own property was
 * unmatchable, and the auto-selection fell back to whatever sorted first in
 * the connected account.
 *
 * Sources scanned, all of them nested-aware:
 *   - variable[]  — constants, lookup tables, anything holding the id
 *   - tag[]       — a tag configuring the id inline
 *   - the raw text of any value, for a pasted gtag.js snippet
 */
function extractGa4IdsFromContainerVersion(liveVersion) {
  const found = new Set();
  const values = [
    ...collectParamValues(liveVersion?.variable ? liveVersion.variable.flatMap(v => v.parameter || []) : [], []),
    ...collectParamValues(liveVersion?.tag ? liveVersion.tag.flatMap(t => t.parameter || []) : [], []),
  ];

  for (const raw of values) {
    const value = raw.trim();
    if (GA4_ID_VALUE_RE.test(value)) {
      found.add(value.toUpperCase());
      continue;
    }
    for (const pattern of GA4_ID_IN_TEXT_PATTERNS) {
      for (const match of value.matchAll(pattern)) {
        if (match[1]) found.add(match[1].toUpperCase());
      }
    }
  }

  return Array.from(found);
}
