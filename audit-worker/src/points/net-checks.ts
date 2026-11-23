/**
 * Plain HTTP checks for master points SEO-01, SEO-07, NAV-01 and LAND-02.
 * No browser: robots.txt, meta robots / X-Robots-Tag, hreflang alternates,
 * link and landing-page statuses, and a made-up URL for the 404 page.
 *
 * Bounded: every request has a timeout, at most MAX_REQUESTS in total (a
 * redirect hop counts), same-site only. The one exception is hreflang
 * alternates, which are fetched on their own host. Returns plain JSON.
 * Not wired into poll.ts yet.
 */

const USER_AGENT = "Mozilla/5.0 (compatible; OptimizersAuditBot/1.0; +https://optimizers.example)";
export const MAX_REQUESTS = 60;
const TIMEOUT_MS = 8_000;
const MAX_HOPS = 4;
const MAX_BODY = 400_000;
const CONCURRENCY = 4;
const MAX_PAGES = 5;
const MAX_ALTERNATES = 4;
const MAX_LANDING = 4;

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface NetPageInput {
  url: string;
  type?: "home" | "product" | "collection" | string;
}

export interface NetChecksInput {
  website: string;
  pages?: NetPageInput[];
  paidLandingUrls?: string[];
  // Menu and footer hrefs, collected by the caller (PageFacts.nav has labels only).
  menuLinks?: string[];
}

export interface RobotsRules {
  allow: string[];
  disallow: string[];
}

export interface FetchInfo {
  url: string;
  finalUrl?: string;
  status?: number;
  error?: string;
  // Not fetched: the request budget ran out.
  skipped?: string;
}

export interface NetPage extends FetchInfo {
  type?: string;
  robotsAllowed: boolean | null;
  metaRobots?: string;
  xRobotsTag?: string;
  noindex?: boolean;
  nofollow?: boolean;
  lang?: string;
  dir?: string;
  hreflang?: { lang: string; href: string }[];
  title?: string;
}

export interface NetAlternate extends FetchInfo {
  lang: string;
  href: string;
  htmlLang?: string;
  dir?: string;
  noindex?: boolean;
  // Does this page list the home page in its own hreflang set? null = not read.
  reciprocal: boolean | null;
}

export interface NetNotFound extends FetchInfo {
  hasSearch?: boolean;
  hasHomeLink?: boolean;
  hasProductLinks?: boolean;
}

export interface NetLanding extends FetchInfo {
  title?: string;
  // Final path is the home page although another page was asked for.
  redirectedHome?: boolean;
  // 2xx page whose title says not found.
  softNotFound?: boolean;
}

export interface NetChecks {
  website: string;
  robots: { url: string; status?: number; error?: string; rules?: RobotsRules };
  pages: NetPage[];
  alternates: NetAlternate[];
  links: FetchInfo[];
  notFound: NetNotFound | null;
  landing: NetLanding[];
  // Inputs we left alone: other hosts, mailto/tel, anchors.
  skipped: string[];
  requests: number;
}

// ---- pure helpers (tested on plain data) ----

/** The rules of the group that applies to Googlebot (its own group, else "*"). */
export function parseRobots(text: string, agent = "googlebot"): RobotsRules {
  const groups: { agents: string[]; allow: string[]; disallow: string[] }[] = [];
  let cur: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], allow: [], disallow: [] };
        groups.push(cur);
      }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!cur) continue;
    if (key === "allow" && val) cur.allow.push(val);
    else if (key === "disallow" && val) cur.disallow.push(val);
  }
  const own = groups.filter(g => g.agents.some(a => a !== "*" && agent.includes(a)));
  const chosen = own.length ? own : groups.filter(g => g.agents.includes("*"));
  return { allow: chosen.flatMap(g => g.allow), disallow: chosen.flatMap(g => g.disallow) };
}

function patternRegex(p: string): RegExp {
  const anchored = p.endsWith("$");
  const body = (anchored ? p.slice(0, -1) : p).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/** Longest matching rule wins; Allow wins a tie; no match means allowed. */
export function robotsAllows(rules: RobotsRules, pathAndQuery: string): boolean {
  let best = -1;
  let allowed = true;
  const test = (list: string[], allow: boolean) => {
    for (const p of list) {
      if (!patternRegex(p).test(pathAndQuery)) continue;
      const len = p.replace(/\*/g, "").length;
      if (len > best || (len === best && allow)) {
        best = len;
        allowed = allow;
      }
    }
  };
  test(rules.disallow, false);
  test(rules.allow, true);
  return allowed;
}

function attr(tag: string, name: string): string | undefined {
  const m = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
}

function safeUrl(u: string, base?: string): URL | null {
  try {
    return new URL(u, base);
  } catch {
    return null;
  }
}

/** Absolute http(s) URL, or null for anchors, mailto, tel, javascript and junk. */
function resolve(href: string, base: string): string | null {
  const h = href.trim();
  if (!h || h.startsWith("#") || /^(?:mailto|tel|javascript|sms|whatsapp):/i.test(h)) return null;
  const u = safeUrl(h, base);
  return u && /^https?:$/.test(u.protocol) ? u.href : null;
}

const host = (u: URL) => u.hostname.toLowerCase().replace(/^www\./, "");
export function sameSite(a: string, b: string): boolean {
  const x = safeUrl(a);
  const y = safeUrl(b);
  return !!x && !!y && host(x) === host(y);
}

/** Same URL ignoring fragment, trailing slash and a leading www. */
export function sameUrl(a: string, b: string): boolean {
  const norm = (s: string) => {
    const u = safeUrl(s);
    return u ? `${host(u)}${u.pathname.replace(/\/+$/, "")}${u.search}` : s;
  };
  return norm(a) === norm(b);
}

export interface ParsedHtml {
  lang?: string;
  dir?: string;
  title?: string;
  metaRobots: string[];
  hreflang: { lang: string; href: string }[];
  hasSearch: boolean;
  hasHomeLink: boolean;
  hasProductLinks: boolean;
}

export function parseHtml(html: string, pageUrl: string): ParsedHtml {
  const htmlTag = /<html\b[^>]*>/i.exec(html)?.[0] ?? "";
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.replace(/\s+/g, " ").trim();
  const metaRobots: string[] = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = attr(m[0], "name")?.toLowerCase();
    if (name === "robots" || name === "googlebot") metaRobots.push(attr(m[0], "content")?.toLowerCase() ?? "");
  }
  const hreflang: { lang: string; href: string }[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(m[0], "rel")?.toLowerCase();
    const l = attr(m[0], "hreflang");
    const href = attr(m[0], "href");
    if (rel?.split(/\s+/).includes("alternate") && l && href) {
      const abs = resolve(href, pageUrl);
      if (abs) hreflang.push({ lang: l.toLowerCase(), href: abs });
    }
  }
  let hasHomeLink = false;
  let hasProductLinks = false;
  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], "href");
    const abs = href ? resolve(href, pageUrl) : null;
    const u = abs ? safeUrl(abs) : null;
    if (!u || !sameSite(u.href, pageUrl)) continue;
    if (u.pathname === "/" || u.pathname === "") hasHomeLink = true;
    else if (/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:products|collections)\//i.test(u.pathname)) hasProductLinks = true;
  }
  const hasSearch =
    /<form\b[^>]*(?:role\s*=\s*["']search["']|action\s*=\s*["'][^"']*search)/i.test(html) ||
    /<input\b[^>]*type\s*=\s*["']search["']/i.test(html) ||
    /<input\b[^>]*name\s*=\s*["'](?:q|query|search)["']/i.test(html);
  return { lang: attr(htmlTag, "lang"), dir: attr(htmlTag, "dir")?.toLowerCase(), title, metaRobots, hreflang, hasSearch, hasHomeLink, hasProductLinks };
}

/** What meta robots / X-Robots-Tag values say to Google. */
export function robotsDirectives(values: string[]): { noindex: boolean; nofollow: boolean } {
  let noindex = false;
  let nofollow = false;
  for (const v of values) {
    for (const part of v.toLowerCase().split(",")) {
      let tok = part.trim();
      // "googlebot: noindex" targets one bot; another bot's rule doesn't apply to us.
      const m = /^([a-z0-9-]+)\s*:\s*(.+)$/.exec(tok);
      if (m && m[1] !== "unavailable_after" && !m[1].startsWith("max-")) {
        if (m[1] !== "googlebot" && m[1] !== "robots") continue;
        tok = m[2].trim();
      }
      if (tok === "none") noindex = nofollow = true;
      if (tok === "noindex") noindex = true;
      if (tok === "nofollow") nofollow = true;
    }
  }
  return { noindex, nofollow };
}

export const NOT_FOUND_TITLE = /\b404\b|not found|لم يتم العثور|الصفحة غير موجودة/i;

// ---- the checks ----

interface Got extends FetchInfo {
  html?: string;
  headers?: Headers;
}

export async function runNetChecks(input: NetChecksInput, fetchImpl: FetchLike = fetch): Promise<NetChecks> {
  const site = safeUrl(input.website);
  if (!site) return { website: input.website, robots: { url: "", error: "The website address is not a valid URL." }, pages: [], alternates: [], links: [], notFound: null, landing: [], skipped: [], requests: 0 };

  let used = 0;
  const skipped: string[] = [];

  // One fetch with manual redirects. Every hop counts against the budget.
  async function get(url: string, opts: { body: boolean; stayOn?: string }): Promise<Got> {
    let cur = url;
    for (let hop = 0; hop <= MAX_HOPS; hop++) {
      if (used >= MAX_REQUESTS) return { url, skipped: "Request limit reached." };
      used++;
      let res: Response;
      try {
        res = await fetchImpl(cur, { redirect: "manual", headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      } catch (e) {
        return { url, finalUrl: cur, error: e instanceof Error ? e.message : String(e) };
      }
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) {
        const next = resolve(loc, cur);
        res.body?.cancel().catch(() => {});
        if (!next) return { url, finalUrl: cur, status: res.status, error: "Redirect to an address we can't follow." };
        if (!sameSite(next, opts.stayOn ?? site!.href)) return { url, finalUrl: next, status: res.status, error: "Redirects to another site." };
        cur = next;
        continue;
      }
      let html: string | undefined;
      if (opts.body) {
        try {
          html = (await res.text()).slice(0, MAX_BODY);
        } catch (e) {
          return { url, finalUrl: cur, status: res.status, headers: res.headers, error: `Could not read the page: ${e instanceof Error ? e.message : String(e)}` };
        }
      } else res.body?.cancel().catch(() => {});
      return { url, finalUrl: cur, status: res.status, html, headers: res.headers };
    }
    return { url, finalUrl: cur, error: "Too many redirects." };
  }

  const strip = (g: Got): FetchInfo => {
    const { html: _h, headers: _hd, ...rest } = g;
    return rest;
  };

  // Same-site http(s) URLs only; what we leave out is recorded.
  const sameSiteUrls = (list: string[] | undefined, max: number, label: string): string[] => {
    const out: string[] = [];
    for (const raw of list ?? []) {
      const abs = resolve(raw, site.href);
      if (!abs || !sameSite(abs, site.href)) {
        skipped.push(`${label}: ${raw}`);
        continue;
      }
      if (!out.some(o => sameUrl(o, abs))) out.push(abs);
    }
    if (out.length > max) skipped.push(`${label}: ${out.length - max} more over the limit`);
    return out.slice(0, max);
  };

  // 1. robots.txt
  const robotsUrl = new URL("/robots.txt", site).href;
  const rb = await get(robotsUrl, { body: true });
  const robots: NetChecks["robots"] = { url: robotsUrl };
  if (rb.status !== undefined) robots.status = rb.status;
  if (rb.error || rb.skipped) robots.error = rb.error ?? rb.skipped;
  if (rb.status !== undefined && rb.status >= 200 && rb.status < 300 && rb.html !== undefined) robots.rules = parseRobots(rb.html);
  // No robots.txt means everything is allowed.
  else if (rb.status === 404 || rb.status === 410) robots.rules = { allow: [], disallow: [] };

  // 2. pages: the home page always, then the given product and collection pages
  const wanted: NetPageInput[] = [{ url: site.href, type: "home" }];
  for (const p of input.pages ?? []) {
    const [u] = sameSiteUrls([p.url], 1, "page");
    if (u && !wanted.some(w => sameUrl(w.url, u))) wanted.push({ url: u, type: p.type });
  }
  const pageList = wanted.slice(0, MAX_PAGES);
  const gotPages = await pool(pageList, p => get(p.url, { body: true }));
  const pages: NetPage[] = pageList.map((p, i) => {
    const g = gotPages[i];
    const url = safeUrl(g.finalUrl ?? p.url) ?? site;
    const out: NetPage = { ...strip(g), type: p.type, robotsAllowed: robots.rules ? robotsAllows(robots.rules, url.pathname + url.search) : null };
    const xrt = g.headers?.get("x-robots-tag") ?? undefined;
    if (xrt) out.xRobotsTag = xrt;
    if (g.html !== undefined && g.status !== undefined && g.status < 400) {
      const h = parseHtml(g.html, g.finalUrl ?? p.url);
      const d = robotsDirectives([...h.metaRobots, ...(xrt ? [xrt] : [])]);
      if (h.metaRobots.length) out.metaRobots = h.metaRobots.join("; ");
      Object.assign(out, { noindex: d.noindex, nofollow: d.nofollow, hreflang: h.hreflang, ...(h.lang && { lang: h.lang }), ...(h.dir && { dir: h.dir }), ...(h.title && { title: h.title }) });
    }
    return out;
  });

  // 3. hreflang alternates of the home page, fetched on their own host
  const home = pages[0];
  const homeUrl = home.finalUrl ?? home.url;
  const altInputs = (home.hreflang ?? []).filter(a => a.lang !== "x-default" && !sameUrl(a.href, homeUrl)).slice(0, MAX_ALTERNATES);
  const gotAlts = await pool(altInputs, a => get(a.href, { body: true, stayOn: a.href }));
  const alternates: NetAlternate[] = altInputs.map((a, i) => {
    const g = gotAlts[i];
    const out: NetAlternate = { ...strip(g), lang: a.lang, href: a.href, reciprocal: null };
    if (g.html !== undefined && g.status !== undefined && g.status < 400) {
      const h = parseHtml(g.html, g.finalUrl ?? a.href);
      const xrt = g.headers?.get("x-robots-tag");
      out.noindex = robotsDirectives([...h.metaRobots, ...(xrt ? [xrt] : [])]).noindex;
      if (h.lang) out.htmlLang = h.lang;
      if (h.dir) out.dir = h.dir;
      out.reciprocal = h.hreflang.some(x => sameUrl(x.href, homeUrl) || sameUrl(x.href, input.website));
    }
    return out;
  });

  // 4. a made-up URL for the 404 page
  const probe = new URL(`/optimizers-audit-no-such-page-${Math.random().toString(36).slice(2, 8)}`, site).href;
  const nf = await get(probe, { body: true });
  const notFound: NetNotFound = strip(nf);
  if (nf.html !== undefined) {
    const h = parseHtml(nf.html, nf.finalUrl ?? probe);
    Object.assign(notFound, { hasSearch: h.hasSearch, hasHomeLink: h.hasHomeLink, hasProductLinks: h.hasProductLinks });
  }

  // 5. paid landing pages
  const landingUrls = sameSiteUrls(input.paidLandingUrls, MAX_LANDING, "landing");
  const gotLanding = await pool(landingUrls, u => get(u, { body: true }));
  const landing: NetLanding[] = landingUrls.map((u, i) => {
    const g = gotLanding[i];
    const out: NetLanding = strip(g);
    if (g.html !== undefined) {
      const title = parseHtml(g.html, g.finalUrl ?? u).title;
      if (title) out.title = title;
      if (g.status !== undefined && g.status < 400 && title && NOT_FOUND_TITLE.test(title)) out.softNotFound = true;
    }
    const fin = safeUrl(g.finalUrl ?? u);
    const asked = safeUrl(u);
    if (fin && asked && fin.pathname.replace(/\/+$/, "") === "" && asked.pathname.replace(/\/+$/, "") !== "") out.redirectedHome = true;
    return out;
  });

  // 6. menu and footer links, with whatever budget is left
  const linkUrls = sameSiteUrls(input.menuLinks, MAX_REQUESTS, "link").filter(u => !landingUrls.some(l => sameUrl(l, u)));
  const gotLinks = await pool(linkUrls, u => get(u, { body: false }));
  const links = gotLinks.map(strip);

  return { website: input.website, robots, pages, alternates, links, notFound, landing, skipped, requests: used };
}

// Runs fn over items a few at a time, keeping the order of results.
async function pool<T, R>(items: T[], fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return out;
}
