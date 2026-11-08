/**
 * Lead attribution: where the visitor came from (first and latest touch) and
 * their GA4 client/session ids, so each lead email says which channel it came
 * from and server-side events (Calendly webhook, deal stages) join the session.
 * Stored in localStorage; nothing here is personal data.
 */

const CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "li_fat_id", "twclid"];
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const FIRST_KEY = "opt_first_touch";
const LAST_KEY = "opt_last_touch";
const LEAD_KEY = "opt_is_lead";

export interface Touch {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  click_id_type?: string;
  click_id?: string;
  referrer?: string;
  landing_page: string;
  timestamp: string;
}

const read = (k: string): Touch | null => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

function currentTouch(): Touch | null {
  const q = new URLSearchParams(window.location.search);
  const clickType = CLICK_IDS.find((k) => q.get(k));
  const hasUtm = UTM.some((k) => q.get(k));
  let refHost = "";
  try { refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch { /* bad referrer */ }
  const own = window.location.hostname.replace(/^www\./, "");
  const externalRef = refHost && refHost !== own ? refHost : "";
  if (!hasUtm && !clickType && !externalRef) return null; // internal navigation or direct: not a new touch

  const paidBy: Record<string, [string, string]> = { gclid: ["google", "cpc"], gbraid: ["google", "cpc"], wbraid: ["google", "cpc"], fbclid: ["facebook", "paid_social"], msclkid: ["bing", "cpc"], ttclid: ["tiktok", "paid_social"], li_fat_id: ["linkedin", "paid_social"], twclid: ["x", "paid_social"] };
  const source = q.get("utm_source") || (clickType ? paidBy[clickType][0] : externalRef);
  const medium = q.get("utm_medium") || (clickType ? paidBy[clickType][1] : /google|bing|yahoo|duckduckgo|yandex|baidu/.test(externalRef) ? "organic" : /facebook|instagram|linkedin|t\.co|twitter|x\.com|tiktok|youtube/.test(externalRef) ? "social" : "referral");
  return {
    source, medium,
    campaign: q.get("utm_campaign") || undefined,
    term: q.get("utm_term") || undefined,
    content: q.get("utm_content") || undefined,
    click_id_type: clickType,
    click_id: clickType ? (q.get(clickType) || "").slice(0, 100) : undefined,
    referrer: externalRef || undefined,
    landing_page: window.location.pathname,
    timestamp: new Date().toISOString(),
  };
}

/** Call once per page load. Direct visits never overwrite an earlier touch. */
export function captureAttribution(): void {
  const touch = currentTouch() || (read(FIRST_KEY) ? null : { source: "(direct)", medium: "(none)", landing_page: window.location.pathname, timestamp: new Date().toISOString() });
  if (!touch) return;
  if (!read(FIRST_KEY)) write(FIRST_KEY, touch);
  write(LAST_KEY, touch);
}

export const firstTouch = () => read(FIRST_KEY);
export const lastTouch = () => read(LAST_KEY) || read(FIRST_KEY);
export const touchLabel = (t: Touch | null) => (t ? `${t.source} / ${t.medium}` : undefined);

export const isLead = () => { try { return localStorage.getItem(LEAD_KEY) === "1"; } catch { return false; } };
export const markLead = () => { try { localStorage.setItem(LEAD_KEY, "1"); } catch { /* storage blocked */ } };

/** GA4 ids from the _ga / _ga_<stream> cookies (GS1 and GS2 formats). */
export function gaIds(): { client_id?: string; session_id?: string; session_number?: string } {
  const cookies = document.cookie.split(/;\s*/);
  const ga = cookies.find((c) => c.startsWith("_ga="));
  const client_id = ga ? ga.split("=")[1].split(".").slice(-2).join(".") : undefined;
  const stream = cookies.find((c) => c.startsWith("_ga_QVT0L5BCEB=")) || cookies.find((c) => /^_ga_[A-Z0-9]+=/.test(c));
  let session_id: string | undefined, session_number: string | undefined;
  if (stream) {
    const v = stream.split("=")[1];
    if (v.startsWith("GS2.")) {
      const part = v.split(".")[2] || "";
      session_id = part.match(/(?:^|\$)s(\d+)/)?.[1];
      session_number = part.match(/\$o(\d+)/)?.[1];
    } else {
      const p = v.split(".");
      session_id = p[2]; session_number = p[3];
    }
  }
  return { client_id, session_id, session_number };
}

/** Everything the server needs for the lead email and server-side events. */
export function leadAttribution() {
  const f = firstTouch(), l = lastTouch();
  return {
    first_source: f?.source, first_medium: f?.medium, first_campaign: f?.campaign, first_landing_page: f?.landing_page, first_click_id_type: f?.click_id_type, first_touch_at: f?.timestamp,
    last_source: l?.source, last_medium: l?.medium, last_campaign: l?.campaign, last_term: l?.term, last_content: l?.content, last_click_id_type: l?.click_id_type, last_click_id: l?.click_id, last_referrer: l?.referrer,
    ...gaIds(),
  };
}
