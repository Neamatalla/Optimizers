/**
 * Microsoft Clarity behaviour data for an audit.
 *
 * The snapshot is pulled at intake (api/clarity/connect.js, from a token the
 * visitor pasted; the token is never stored) and saved as
 * audit_requests.clarity_data, already rebuilt from known fields by
 * api/_lib/clarity.js. Here it becomes facts in the prompt and the report.
 *
 * No outside benchmarks: every comparison is the store against itself (a page
 * against the site average, phone against desktop), because there is no
 * published baseline we could stand behind.
 */

export interface ClarityBehaviour {
  sessionsPct: number | null;
  pageViews: number | null;
  count: number | null;
}

export interface ClarityBreakdownRow {
  name: string;
  sessions: number;
  scrollDepth: number | null;
  deadClicks?: number | null;
  rageClicks?: number | null;
  quickbacks?: number | null;
  excessiveScroll?: number | null;
  scriptErrors?: number | null;
  errorClicks?: number | null;
}

export interface ClaritySnapshot {
  source: "clarity";
  fetchedAt: string | null;
  days: number;
  hostMatch: boolean;
  sessions: number | null;
  botSessions: number | null;
  distinctUsers: number | null;
  pagesPerSession: number | null;
  engagement: { totalSeconds: number | null; activeSeconds: number | null };
  scrollDepth: number | null;
  behaviours: Record<BehaviourKey, ClarityBehaviour | null>;
  devices: { name: string; sessions: number }[];
  browsers: { name: string; sessions: number }[];
  os: { name: string; sessions: number }[];
  countries: { name: string; sessions: number }[];
  referrers: { name: string; sessions: number }[];
  pageTitles: { name: string; sessions: number }[];
  topPages: { url: string; visits: number }[];
  byUrl: ClarityBreakdownRow[] | null;
  byDevice: ClarityBreakdownRow[] | null;
}

export type BehaviourKey = "deadClicks" | "rageClicks" | "quickbacks" | "excessiveScroll" | "scriptErrors" | "errorClicks";

export const BEHAVIOUR_LABELS: Record<BehaviourKey, string> = {
  deadClicks: "dead clicks (taps on things that do nothing)",
  rageClicks: "rage clicks (repeated taps in frustration)",
  quickbacks: "quick-backs (left a page within seconds and went back)",
  excessiveScroll: "excessive scrolling (scrolling up and down looking for something)",
  scriptErrors: "script errors",
  errorClicks: "clicks that caused an error",
};

// In-app browsers of the ad platforms. Paid social traffic lands here, and a
// store that breaks in them loses that traffic without any error showing.
const IN_APP = /^(FacebookApp|InstagramApp|TikTok|Snapchat|MessengerApp)/i;

export interface ClarityFacts {
  days: number;
  sessions: number;
  botShare: number | null;
  mobileShare: number | null;
  inAppShare: number | null;
  inAppBrowsers: { name: string; sessions: number }[];
  activeShare: number | null;
  scrollDepth: number | null;
  sitewide: Partial<Record<BehaviourKey, number>>;
  // Pages whose rate is at least twice the site's own rate, with enough
  // sessions to mean something (byUrl only; null when Clarity didn't give it).
  hotPages: { url: string; behaviour: BehaviourKey; pageRate: number; siteRate: number; sessions: number }[] | null;
  mobileVsDesktop: { behaviour: BehaviourKey; mobile: number; desktop: number }[] | null;
  topPages: { url: string; visits: number }[];
}

const share = (part: number | null | undefined, whole: number | null | undefined) =>
  part != null && whole ? Math.round((part / whole) * 1000) / 10 : null;

const MIN_PAGE_SESSIONS = 50;

/** null when Clarity wasn't connected, isn't for this site, or has no sessions. */
export function computeClarityFacts(raw: unknown): ClarityFacts | null {
  const snap = raw as ClaritySnapshot | null;
  if (!snap || snap.source !== "clarity" || !snap.hostMatch || !snap.sessions) return null;

  const sitewide: Partial<Record<BehaviourKey, number>> = {};
  for (const key of Object.keys(BEHAVIOUR_LABELS) as BehaviourKey[]) {
    const pct = snap.behaviours?.[key]?.sessionsPct;
    if (pct != null) sitewide[key] = pct;
  }

  const deviceSessions = (name: string) => snap.devices.find(d => d.name.toLowerCase() === name)?.sessions ?? 0;
  const inAppBrowsers = snap.browsers.filter(b => IN_APP.test(b.name));
  const inAppSessions = inAppBrowsers.reduce((sum, b) => sum + b.sessions, 0);

  let hotPages: ClarityFacts["hotPages"] = null;
  if (snap.byUrl) {
    hotPages = [];
    for (const row of snap.byUrl) {
      if (row.sessions < MIN_PAGE_SESSIONS) continue;
      for (const key of ["deadClicks", "rageClicks", "quickbacks", "scriptErrors"] as BehaviourKey[]) {
        const pageRate = row[key];
        const siteRate = sitewide[key];
        if (pageRate != null && siteRate && pageRate >= siteRate * 2) {
          hotPages.push({ url: row.name, behaviour: key, pageRate, siteRate, sessions: row.sessions });
        }
      }
    }
    hotPages.sort((a, b) => b.sessions * b.pageRate - a.sessions * a.pageRate);
    hotPages = hotPages.slice(0, 8);
  }

  let mobileVsDesktop: ClarityFacts["mobileVsDesktop"] = null;
  const mobile = snap.byDevice?.find(r => r.name.toLowerCase() === "mobile");
  const desktop = snap.byDevice?.find(r => r.name.toLowerCase() === "pc");
  if (mobile && desktop) {
    mobileVsDesktop = (["deadClicks", "rageClicks", "quickbacks", "scriptErrors"] as BehaviourKey[])
      .filter(k => mobile[k] != null && desktop[k] != null)
      .map(k => ({ behaviour: k, mobile: mobile[k]!, desktop: desktop[k]! }));
  }

  return {
    days: snap.days,
    sessions: snap.sessions,
    botShare: share(snap.botSessions, snap.sessions),
    mobileShare: share(deviceSessions("mobile"), snap.sessions),
    inAppShare: share(inAppSessions, snap.sessions),
    inAppBrowsers,
    activeShare: share(snap.engagement?.activeSeconds, snap.engagement?.totalSeconds),
    scrollDepth: snap.scrollDepth,
    sitewide,
    hotPages,
    mobileVsDesktop,
    topPages: snap.topPages.slice(0, 5),
  };
}

/** The prompt section: numbers to quote, never to recompute. */
export function clarityFactsPromptBlock(f: ClarityFacts): string {
  const lines = [
    `From the store's own Microsoft Clarity, last ${f.days} days, ${f.sessions} sessions.`,
    f.botShare != null ? `- Bot sessions Clarity filtered out: ${f.botShare}% of sessions.` : null,
    f.mobileShare != null ? `- Phone sessions: ${f.mobileShare}%.` : null,
    f.inAppShare != null && f.inAppShare > 0
      ? `- Sessions inside ad-platform in-app browsers: ${f.inAppShare}% (${f.inAppBrowsers.map(b => `${b.name} ${b.sessions}`).join(", ")}).`
      : null,
    f.scrollDepth != null ? `- Average scroll depth: ${f.scrollDepth}% of the page.` : null,
    f.activeShare != null ? `- Active time: ${f.activeShare}% of time on site.` : null,
    ...Object.entries(f.sitewide).map(([k, v]) => `- Sessions with ${BEHAVIOUR_LABELS[k as BehaviourKey]}: ${v}%.`),
    f.hotPages?.length
      ? `- Pages at least twice the site's own rate:\n${f.hotPages.map(p => `  - ${p.url}: ${BEHAVIOUR_LABELS[p.behaviour]} in ${p.pageRate}% of its ${p.sessions} sessions (site ${p.siteRate}%).`).join("\n")}`
      : f.hotPages === null ? `- Per-page breakdown: not available from Clarity for this run.` : null,
    f.mobileVsDesktop?.length
      ? `- Phone vs desktop: ${f.mobileVsDesktop.map(m => `${BEHAVIOUR_LABELS[m.behaviour]} ${m.mobile}% vs ${m.desktop}%`).join("; ")}.`
      : null,
    `- Most visited pages: ${f.topPages.map(p => `${p.url} (${p.visits})`).join(", ")}.`,
  ];
  return lines.filter(Boolean).join("\n");
}
