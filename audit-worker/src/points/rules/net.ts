import type { FetchInfo, NetChecks, NetNotFound } from "../net-checks.js";
import { sameUrl } from "../net-checks.js";
import type { Rule } from "./types.js";
import { unverified } from "./types.js";

/**
 * Rules read from plain HTTP checks (points/net-checks.ts). A page that
 * answers 403/429/5xx may be a bot wall, so it is never a fail: only a
 * 404/410 or a directive we read in the page itself proves a problem.
 */

const noNet = unverified("The robots.txt, link and landing-page checks didn't run this time.");

const isDead = (s?: number) => s === 404 || s === 410;
const isOk = (s?: number) => s !== undefined && s >= 200 && s < 400;
const status = (f: FetchInfo) => (f.status !== undefined ? String(f.status) : f.error ?? f.skipped ?? "no answer");
const short = (list: string[], n = 3) => list.slice(0, n).join(", ") + (list.length > n ? ` and ${list.length - n} more` : "");

// ---- SEO-01: product and collection pages indexable ----
const seo01: Rule = ({ net }) => {
  if (!net) return noNet;
  const targets = net.pages.filter(p => p.type === "product" || p.type === "collection");
  if (!targets.length) return unverified("No product or collection page address was given to check.");
  const problems: string[] = [];
  const unread: string[] = [];
  for (const p of targets) {
    const where = p.finalUrl ?? p.url;
    if (p.robotsAllowed === false) problems.push(`robots.txt blocks ${where}`);
    const flags = [p.noindex && "noindex", p.nofollow && "nofollow"].filter(Boolean);
    if (flags.length) problems.push(`${where} carries ${flags.join(" and ")}${p.xRobotsTag ? ` (X-Robots-Tag: ${p.xRobotsTag})` : p.metaRobots ? ` (meta robots: ${p.metaRobots})` : ""}`);
    if (!isOk(p.status)) unread.push(`${where} (${status(p)})`);
    else if (p.robotsAllowed === null) unread.push(`${where} (robots.txt not read)`);
  }
  const facts = { checked: targets.map(p => p.finalUrl ?? p.url), robotsStatus: net.robots.status ?? net.robots.error ?? "none", problems, unread };
  if (problems.length) return { status: "fail", reason: `${problems.length} of ${targets.length} product or collection pages can't be indexed: ${short(problems)}.`, facts };
  if (unread.length) return unverified(`No problem found, but ${short(unread)} could not be read, so indexability isn't proven.`, facts);
  return { status: "pass", reason: `robots.txt allows all ${targets.length} product and collection pages checked and none carries noindex or nofollow.`, facts };
};

// ---- SEO-07: language tags and hreflang ----
const dirFor = (lang: string) => (/^(?:ar|he|fa|ur)\b/.test(lang) ? "rtl" : "ltr");
const primaryOf = (l: string) => l.toLowerCase().split(/[-_]/)[0];

const seo07: Rule = ({ net }) => {
  if (!net) return noNet;
  const home = net.pages[0];
  if (!home || !isOk(home.status)) return unverified(`The home page didn't load for the language check (${home ? status(home) : "no answer"}).`);
  const langs = new Set((home.hreflang ?? []).map(h => primaryOf(h.lang)));
  if (!(langs.has("en") && langs.has("ar"))) {
    return { status: "n/a", reason: `The home page declares ${langs.size ? `hreflang ${[...langs].join(", ")}` : "no hreflang"}, not both English and Arabic versions.`, facts: { hreflang: [...langs] } };
  }
  const fails: string[] = [];
  const unread: string[] = [];
  // The home page's own tags must match its own hreflang entry.
  const self = (home.hreflang ?? []).find(h => sameUrl(h.href, home.finalUrl ?? home.url));
  if (self && home.lang && primaryOf(home.lang) !== primaryOf(self.lang)) fails.push(`the home page says lang="${home.lang}" but its hreflang entry is ${self.lang}`);
  const homeLang = self?.lang ?? home.lang;
  if (homeLang && home.dir && home.dir !== dirFor(homeLang)) fails.push(`the home page has dir="${home.dir}" for ${homeLang}`);
  for (const a of net.alternates) {
    if (!isOk(a.status) || a.reciprocal === null) {
      unread.push(`${a.href} (${status(a)})`);
      continue;
    }
    if (a.reciprocal === false) fails.push(`${a.href} (${a.lang}) doesn't list the home page back in its hreflang`);
    if (a.htmlLang && primaryOf(a.htmlLang) !== primaryOf(a.lang)) fails.push(`${a.href} says lang="${a.htmlLang}" but hreflang says ${a.lang}`);
    if (a.dir && a.dir !== dirFor(a.lang)) fails.push(`${a.href} has dir="${a.dir}" for ${a.lang}`);
    if (primaryOf(a.lang) === "ar" && a.noindex) fails.push(`the Arabic page ${a.href} carries noindex`);
  }
  if (home.lang && primaryOf(home.lang) === "ar" && home.noindex) fails.push("the Arabic home page carries noindex");
  const facts = { hreflang: (home.hreflang ?? []).map(h => `${h.lang} ${h.href}`), fails, unread };
  if (fails.length) return { status: "fail", reason: `Language tags are wrong: ${short(fails)}.`, facts };
  if (unread.length || !net.alternates.length) return unverified(`No fault found, but ${net.alternates.length ? short(unread) : "no alternate page"} could not be read, so reciprocity isn't proven.`, facts);
  return { status: "pass", reason: `The English and Arabic pages (${net.alternates.length} alternate(s) read) point at each other, their html lang and dir match, and Arabic is not noindex.`, facts };
};

// ---- 404 page: shared by NAV-01 and LAND-02 ----
type NotFoundCheck = { state: "ok" | "bad" | "unknown"; text: string };
function notFoundPage(nf: NetNotFound | null, accepts: (n: NetNotFound) => boolean, want: string): NotFoundCheck {
  if (!nf) return { state: "unknown", text: "the made-up URL wasn't opened" };
  if (isDead(nf.status)) {
    if (nf.hasSearch === undefined) return { state: "unknown", text: "the 404 page could not be read" };
    return accepts(nf) ? { state: "ok", text: `the 404 page offers ${want}` } : { state: "bad", text: `the 404 page (${nf.finalUrl ?? nf.url}) has no ${want}` };
  }
  if (isOk(nf.status)) return { state: "unknown", text: `a made-up URL answered ${nf.status} instead of 404 (the store shows a catch-all page)` };
  return { state: "unknown", text: `the made-up URL couldn't be read (${status(nf)})` };
}

// ---- NAV-01: no dead menu or footer links ----
const nav01: Rule = ({ net }) => {
  if (!net) return noNet;
  const dead = net.links.filter(l => isDead(l.status));
  const unread = net.links.filter(l => !isOk(l.status) && !isDead(l.status));
  const nf = notFoundPage(net.notFound, n => !!(n.hasSearch || n.hasProductLinks), "search or product links");
  const facts = { linksChecked: net.links.length, dead: dead.map(l => `${l.url} (${l.status})`), unread: unread.map(l => `${l.url} (${status(l)})`), notFound: nf.text };
  if (dead.length) return { status: "fail", reason: `${dead.length} of ${net.links.length} menu or footer links return not-found: ${short(dead.map(l => `${l.url} (${l.status})`))}.`, facts };
  if (nf.state === "bad") return { status: "fail", reason: `${nf.text[0].toUpperCase()}${nf.text.slice(1)}.`, facts };
  if (!net.links.length) return unverified(`No menu or footer link addresses were collected, and ${nf.text}.`, facts);
  if (unread.length) return unverified(`No dead link found, but ${unread.length} could not be read (${short(unread.map(l => `${l.url} (${status(l)})`))}).`, facts);
  if (nf.state === "unknown") return unverified(`All ${net.links.length} menu and footer links work, but ${nf.text}.`, facts);
  return { status: "pass", reason: `All ${net.links.length} menu and footer links work and ${nf.text}.`, facts };
};

// ---- LAND-02: paid landing pages do not show not-found ----
const land02: Rule = ({ net }) => {
  if (!net) return noNet;
  if (!net.landing.length) return unverified("No paid landing page addresses were available (no GA4 access or no paid landing rows).");
  const broken = net.landing.filter(l => isDead(l.status) || l.softNotFound);
  const unread = net.landing.filter(l => !broken.includes(l) && (!isOk(l.status) || l.redirectedHome));
  const nf = notFoundPage(net.notFound, n => !!(n.hasSearch || n.hasHomeLink || n.hasProductLinks), "search or a way back");
  const desc = (l: FetchInfo) => `${l.url} (${l.status ?? status(l)})`;
  const facts = { landingChecked: net.landing.map(l => l.finalUrl ?? l.url), broken: broken.map(desc), unread: unread.map(l => (l.redirectedHome ? `${l.url} (redirects to the home page)` : desc(l))), notFound: nf.text };
  if (broken.length) return { status: "fail", reason: `${broken.length} of ${net.landing.length} paid landing pages show not-found: ${short(broken.map(l => (l.softNotFound ? `${l.url} (title "${l.title}")` : desc(l))))}.`, facts };
  if (nf.state === "bad") return { status: "fail", reason: `${nf.text[0].toUpperCase()}${nf.text.slice(1)}.`, facts };
  if (unread.length) return unverified(`No not-found landing page seen, but ${short(facts.unread)} could not be judged (bot wall or redirect to home).`, facts);
  if (nf.state === "unknown") return unverified(`All ${net.landing.length} paid landing pages load, but ${nf.text}.`, facts);
  return { status: "pass", reason: `All ${net.landing.length} paid landing pages load and ${nf.text}.`, facts };
};

export const NET_RULES: Record<string, Rule> = { "SEO-01": seo01, "SEO-07": seo07, "NAV-01": nav01, "LAND-02": land02 };

export type { NetChecks };
