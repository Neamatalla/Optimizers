import type { PageSpeedPage, PageSpeedResult } from "../../pagespeed.js";
import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";

/**
 * Speed rules, from the phone (throttled) PageSpeed Insights run that
 * pagespeed.ts already makes for the Page Speed tab. Thresholds are Google's
 * "good" lines: LCP 2.5 s, CLS 0.1, TBT 200 ms.
 */

type Metric = "lcpMs" | "cls" | "tbtMs";

function pagesWith(ps: PageSpeedResult | null | undefined, types: string[], metric: Metric): Array<{ p: PageSpeedPage; v: number }> {
  return (ps?.pages ?? [])
    .filter(p => types.includes(p.type))
    .map(p => ({ p, v: p.mobileMetrics?.[metric] }))
    .filter((x): x is { p: PageSpeedPage; v: number } => typeof x.v === "number");
}

function threshold(metric: Metric, types: string[], limit: number, show: (v: number) => string, label: string): Rule {
  return ({ pageSpeed }) => {
    const rows = pagesWith(pageSpeed, types, metric);
    if (!rows.length) return unverified(`PageSpeed returned no ${label} for the ${types.join(", ")} page(s) this run.`);
    const worst = [...rows].sort((a, b) => b.v - a.v)[0];
    const facts = Object.fromEntries(rows.map(r => [r.p.type, show(r.v)]));
    const list = rows.map(r => `${r.p.type} ${show(r.v)}`).join(", ");
    return worst.v < limit
      ? { status: "pass", reason: `${label} on a throttled phone: ${list}, all under ${show(limit)}.`, facts }
      : { status: "fail", reason: `${label} on a throttled phone is ${show(worst.v)} on the ${worst.p.type} page (good is under ${show(limit)}). All: ${list}.`, facts };
  };
}

const secs = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const ms = (v: number) => `${Math.round(v)} ms`;
const cls = (v: number) => v.toFixed(2);

// Platform and image CDNs count as the store's own bytes, not third-party apps.
const OWN = /shopify|salla|zid|youcan|woocommerce|wordpress|cloudinary|imgix|cloudflare|cloudfront|akamai|fastly|jsdelivr/i;

const speed06: Rule = ({ pageSpeed }) => {
  const home = pageSpeed?.pages.find(p => p.type === "home")?.mobileMetrics;
  if (!home?.totalBytes || !home.thirdParty) return unverified("PageSpeed returned no page weight for the home page this run.");
  const apps = home.thirdParty.filter(t => !OWN.test(t.entity) && t.bytes > 0).sort((a, b) => b.bytes - a.bytes);
  const total = apps.reduce((s, t) => s + t.bytes, 0);
  const share = total / home.totalBytes;
  const top = apps[0];
  const topShare = top ? top.bytes / home.totalBytes : 0;
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const facts = { thirdPartyShare: pct(share), topApp: top?.entity ?? "none", topAppShare: pct(topShare), homeKB: Math.round(home.totalBytes / 1024) };
  const out: RuleResult = share < 0.5 && topShare < 0.2
    ? { status: "pass", reason: `Third-party apps are ${pct(share)} of the home page's ${facts.homeKB} KB${top ? `; the largest, ${top.entity}, is ${pct(topShare)}` : ""}.`, facts }
    : { status: "fail", reason: `${share >= 0.5 ? `Third-party apps are ${pct(share)} of the home page's ${facts.homeKB} KB` : `${top!.entity} alone is ${pct(topShare)} of the home page's weight`}${share >= 0.5 && top ? `; ${top.entity} alone is ${pct(topShare)}` : ""}.`, facts };
  return out;
};

export const SPEED_RULES: Record<string, Rule> = {
  "SPEED-01": threshold("lcpMs", ["product", "home"], 2500, secs, "Main content load time (LCP)"),
  "SPEED-02": threshold("cls", ["home", "collection", "product"], 0.1, cls, "Layout shift (CLS)"),
  "SPEED-03": threshold("tbtMs", ["home", "product"], 200, ms, "Blocking time (TBT)"),
  "SPEED-06": speed06,
};
