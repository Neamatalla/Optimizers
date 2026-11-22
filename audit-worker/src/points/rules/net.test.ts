import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_REQUESTS, parseHtml, parseRobots, robotsAllows, robotsDirectives, runNetChecks, sameUrl } from "../net-checks.js";
import type { FetchLike, NetChecks } from "../net-checks.js";
import { RULES } from "./index.js";

// ---- fake fetch ----
type Reply = { status?: number; body?: string; headers?: Record<string, string> } | Error;
function fake(routes: Record<string, Reply>, log: string[] = []): FetchLike {
  return async url => {
    log.push(url);
    const hit = routes[url] ?? (url.includes("optimizers-audit-no-such-page") ? routes["*404"] : undefined) ?? { status: 404, body: "" };
    if (hit instanceof Error) throw hit;
    return new Response(hit.body ?? "", { status: hit.status ?? 200, headers: hit.headers });
  };
}
const page = (head = "", body = "", htmlAttrs = "") => `<html ${htmlAttrs}><head>${head}</head><body>${body}</body></html>`;
const S = "https://shop.com";

// ---- pure helpers ----
test("robots.txt: Googlebot group beats *, longest rule wins, Allow wins a tie, wildcards and $", () => {
  const r = parseRobots("User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nDisallow: /cart\nDisallow: /*?sort=\nAllow: /cart/public\nDisallow: /*.pdf$");
  assert.equal(robotsAllows(r, "/products/a"), true);
  assert.equal(robotsAllows(r, "/cart"), false);
  assert.equal(robotsAllows(r, "/cart/public"), true);
  assert.equal(robotsAllows(r, "/collections/x?sort=price"), false);
  assert.equal(robotsAllows(r, "/a.pdf"), false);
  assert.equal(robotsAllows(r, "/a.pdf?x=1"), true);
  const star = parseRobots("User-agent: *\nDisallow: /collections/\n# comment\nUser-agent: bingbot\nDisallow:");
  assert.equal(robotsAllows(star, "/collections/a"), false);
  assert.equal(robotsAllows(parseRobots("User-agent: *\nDisallow:"), "/anything"), true);
});

test("robots directives: noindex, nofollow, none, bot-specific values", () => {
  assert.deepEqual(robotsDirectives(["index, follow"]), { noindex: false, nofollow: false });
  assert.deepEqual(robotsDirectives(["NOINDEX, nofollow"]), { noindex: true, nofollow: true });
  assert.deepEqual(robotsDirectives(["none"]), { noindex: true, nofollow: true });
  assert.deepEqual(robotsDirectives(["googlebot: noindex"]), { noindex: true, nofollow: false });
  assert.deepEqual(robotsDirectives(["bingbot: noindex"]), { noindex: false, nofollow: false });
  assert.deepEqual(robotsDirectives(["max-snippet:-1, unavailable_after: 25 Jun 2030"]), { noindex: false, nofollow: false });
});

test("parseHtml reads lang, dir, title, meta robots, hreflang, search and links", () => {
  const h = parseHtml(
    page('<title> Oops \n 404 </title><meta name="robots" content="noindex"><link rel="alternate" hreflang="AR" href="/ar/"><link rel="canonical" href="/">', '<form role="search"></form><a href="/">Home</a><a href="/products/a">A</a><a href="https://other.com/products/z">Z</a>', 'lang="en" dir="LTR"'),
    S + "/x",
  );
  assert.deepEqual([h.lang, h.dir, h.title, h.metaRobots], ["en", "ltr", "Oops 404", ["noindex"]]);
  assert.deepEqual(h.hreflang, [{ lang: "ar", href: S + "/ar/" }]);
  assert.deepEqual([h.hasSearch, h.hasHomeLink, h.hasProductLinks], [true, true, true]);
  const bare = parseHtml(page("", '<a href="https://other.com/">x</a>'), S);
  assert.deepEqual([bare.hasSearch, bare.hasHomeLink, bare.hasProductLinks], [false, false, false]);
  assert.equal(parseHtml(page("", '<input name="q">'), S).hasSearch, true);
});

test("sameUrl ignores trailing slash, fragment and www", () => {
  assert.equal(sameUrl("https://www.shop.com/ar/", "https://shop.com/ar#top"), true);
  assert.equal(sameUrl("https://shop.com/ar", "https://shop.com/en"), false);
});

// ---- runNetChecks ----
test("runNetChecks collects robots, page directives, alternates, 404 page, landing and links", async () => {
  const log: string[] = [];
  const f = fake(
    {
      [S + "/robots.txt"]: { body: "User-agent: *\nDisallow: /cart" },
      [S + "/"]: { body: page('<link rel="alternate" hreflang="en" href="https://shop.com/"><link rel="alternate" hreflang="ar" href="https://shop.com/ar/">', "", 'lang="en" dir="ltr"') },
      [S + "/products/a"]: { body: page('<meta name="robots" content="noindex">'), headers: { "x-robots-tag": "nofollow" } },
      [S + "/ar/"]: { body: page('<link rel="alternate" hreflang="en" href="https://shop.com">', "", 'lang="ar" dir="rtl"') },
      "*404": { status: 404, body: page("", '<input type="search"><a href="/products/b">b</a>') },
      [S + "/lp"]: { body: page("<title>Sale</title>") },
      [S + "/about"]: { status: 200 },
      [S + "/old"]: { status: 301, headers: { location: "/about" } },
      [S + "/gone"]: { status: 404 },
    },
    log,
  );
  const n = await runNetChecks(
    { website: S, pages: [{ url: S + "/products/a", type: "product" }, { url: "https://other.com/x", type: "product" }], paidLandingUrls: ["/lp"], menuLinks: ["/about", "/old", "/gone", "mailto:a@b.c", "#top", "https://facebook.com/x"] },
    f,
  );
  assert.equal(n.robots.status, 200);
  assert.deepEqual(n.pages.map(p => [p.type, p.status, p.robotsAllowed]), [["home", 200, true], ["product", 200, true]]);
  assert.deepEqual([n.pages[1].noindex, n.pages[1].nofollow, n.pages[1].xRobotsTag], [true, true, "nofollow"]);
  assert.deepEqual(n.alternates.map(a => [a.lang, a.status, a.reciprocal, a.htmlLang, a.dir]), [["ar", 200, true, "ar", "rtl"]]);
  assert.deepEqual([n.notFound?.status, n.notFound?.hasSearch, n.notFound?.hasProductLinks], [404, true, true]);
  assert.equal(n.landing[0].title, "Sale");
  assert.deepEqual(n.links.map(l => l.status), [200, 200, 404], "redirect followed on the same site");
  assert.ok(n.skipped.some(s => s.includes("other.com")) && n.skipped.some(s => s.includes("facebook")));
  assert.ok(!log.some(u => u.includes("facebook") || u.includes("other.com")), "never leaves the site");
});

test("runNetChecks: off-site redirect is not followed, errors are recorded, request budget holds", async () => {
  const log: string[] = [];
  const f = fake({ [S + "/robots.txt"]: new Error("timeout"), [S + "/a"]: { status: 302, headers: { location: "https://evil.com/" } } }, log);
  const links = Array.from({ length: 60 }, (_, i) => `/p${i}`);
  const n = await runNetChecks({ website: S, menuLinks: ["/a", ...links] }, f);
  assert.equal(n.robots.error, "timeout");
  assert.equal(n.robots.rules, undefined);
  assert.match(n.links[0].error ?? "", /another site/);
  assert.ok(!log.includes("https://evil.com/"));
  assert.ok(log.length <= MAX_REQUESTS && n.requests <= MAX_REQUESTS);
  assert.ok(n.links.some(l => l.skipped), "links past the budget are marked skipped");
});

test("runNetChecks: bad website URL", async () => {
  const n = await runNetChecks({ website: "not a url" }, fake({}));
  assert.equal(n.requests, 0);
  assert.ok(n.robots.error);
});

// ---- rules ----
const ok = (url: string, over: object = {}) => ({ url, status: 200, ...over });
function net(over: Partial<NetChecks> = {}): NetChecks {
  return { website: S, robots: { url: S + "/robots.txt", status: 200, rules: { allow: [], disallow: [] } }, pages: [{ ...ok(S + "/"), type: "home", robotsAllowed: true }], alternates: [], links: [], notFound: null, landing: [], skipped: [], requests: 1, ...over };
}
const prod = (over: object = {}) => ({ ...ok(S + "/products/a"), type: "product", robotsAllowed: true, ...over });
const nf404 = (over: object = {}) => ({ url: S + "/x", status: 404, hasSearch: true, hasHomeLink: true, hasProductLinks: false, ...over });

test("every net rule says unverified when the checks didn't run", () => {
  for (const id of ["SEO-01", "SEO-07", "NAV-01", "LAND-02"]) assert.equal(RULES[id]({}).status, "unverified", id);
});

test("SEO-01: pass, fail (robots, noindex, nofollow), unverified", () => {
  assert.equal(RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod(), { ...prod(), type: "collection", url: S + "/collections/c" }] }) }).status, "pass");
  const blocked = RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod({ robotsAllowed: false })] }) });
  assert.equal(blocked.status, "fail");
  assert.match(blocked.reason, /robots\.txt blocks https:\/\/shop\.com\/products\/a/);
  const noindex = RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod({ noindex: true, nofollow: true, metaRobots: "noindex, nofollow" })] }) });
  assert.equal(noindex.status, "fail");
  assert.match(noindex.reason, /noindex and nofollow/);
  assert.equal(RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod({ nofollow: true, xRobotsTag: "nofollow" })] }) }).status, "fail");
  assert.equal(RULES["SEO-01"]({ net: null }).status, "unverified");
  assert.equal(RULES["SEO-01"]({ net: net() }).status, "unverified", "no product or collection page given");
  assert.equal(RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod({ status: 403 })] }) }).status, "unverified", "bot wall");
  assert.equal(RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod({ robotsAllowed: null })] }) }).status, "unverified", "robots.txt fetch failed");
  // A proven fail beats an unread page.
  assert.equal(RULES["SEO-01"]({ net: net({ pages: [...net().pages, prod({ noindex: true }), { ...prod(), url: S + "/products/b", status: 403 }] }) }).status, "fail");
});

const homeBilingual = (over: object = {}) => ({ ...ok(S + "/"), type: "home", robotsAllowed: true, lang: "en", dir: "ltr", hreflang: [{ lang: "en", href: S + "/" }, { lang: "ar", href: S + "/ar/" }], ...over });
const arAlt = (over: object = {}) => ({ ...ok(S + "/ar/"), lang: "ar", href: S + "/ar/", htmlLang: "ar", dir: "rtl", noindex: false, reciprocal: true, ...over });

test("SEO-07: pass, fail (reciprocity, lang, dir, noindex), n/a, unverified", () => {
  assert.equal(RULES["SEO-07"]({ net: net({ pages: [homeBilingual()], alternates: [arAlt()] }) }).status, "pass");
  const fails = (alt: object) => RULES["SEO-07"]({ net: net({ pages: [homeBilingual()], alternates: [arAlt(alt)] }) });
  assert.match(fails({ reciprocal: false }).reason, /doesn't list the home page back/);
  assert.equal(fails({ htmlLang: "en" }).status, "fail");
  assert.match(fails({ dir: "ltr" }).reason, /dir="ltr" for ar/);
  assert.match(fails({ noindex: true }).reason, /Arabic page .* noindex/);
  assert.equal(RULES["SEO-07"]({ net: net({ pages: [homeBilingual({ dir: "rtl" })], alternates: [arAlt()] }) }).status, "fail", "home dir doesn't match en");
  assert.equal(RULES["SEO-07"]({ net: net({ pages: [homeBilingual({ hreflang: [{ lang: "en-kw", href: S + "/" }, { lang: "en-ae", href: S + "/ae/" }] })] }) }).status, "n/a");
  assert.equal(RULES["SEO-07"]({ net: net({ pages: [homeBilingual({ hreflang: [] })] }) }).status, "n/a");
  assert.equal(fails({ status: 500, reciprocal: null }).status, "unverified", "alternate fetch failed");
  assert.equal(RULES["SEO-07"]({ net: net({ pages: [homeBilingual()], alternates: [] }) }).status, "unverified");
  assert.equal(RULES["SEO-07"]({ net: net({ pages: [{ ...homeBilingual(), status: 403 }] }) }).status, "unverified");
});

test("NAV-01: pass, fail (dead link, bare 404 page), unverified", () => {
  const links = [ok(S + "/a"), ok(S + "/b", { status: 301 })];
  assert.equal(RULES["NAV-01"]({ net: net({ links, notFound: nf404() }) }).status, "pass");
  const dead = RULES["NAV-01"]({ net: net({ links: [...links, ok(S + "/gone", { status: 404 })], notFound: nf404() }) });
  assert.equal(dead.status, "fail");
  assert.match(dead.reason, /1 of 3 .* https:\/\/shop\.com\/gone \(404\)/);
  const bare = RULES["NAV-01"]({ net: net({ links, notFound: nf404({ hasSearch: false, hasHomeLink: true, hasProductLinks: false }) }) });
  assert.equal(bare.status, "fail", "a home link alone is not search or product links");
  assert.equal(RULES["NAV-01"]({ net: net({ links: [], notFound: nf404({ hasSearch: false }) }) }).status, "fail", "the 404 part is certain even without hrefs");
  assert.equal(RULES["NAV-01"]({ net: net({ links: [], notFound: nf404() }) }).status, "unverified", "no hrefs collected");
  assert.equal(RULES["NAV-01"]({ net: net({ links: [...links, ok(S + "/c", { status: 403 })], notFound: nf404() }) }).status, "unverified", "bot wall");
  assert.equal(RULES["NAV-01"]({ net: net({ links, notFound: nf404({ status: 200 }) }) }).status, "unverified", "soft-404 store");
  assert.equal(RULES["NAV-01"]({ net: net({ links, notFound: null }) }).status, "unverified");
  assert.equal(RULES["NAV-01"]({ net: net({ links: [{ url: S + "/t", error: "timeout" }], notFound: nf404() }) }).status, "unverified");
});

test("LAND-02: pass, fail (404, soft not-found title, bare 404 page), unverified", () => {
  const lp = [ok(S + "/lp", { title: "Sale" })];
  assert.equal(RULES["LAND-02"]({ net: net({ landing: lp, notFound: nf404({ hasSearch: false, hasHomeLink: true }) }) }).status, "pass", "a way back is enough");
  const gone = RULES["LAND-02"]({ net: net({ landing: [...lp, ok(S + "/old", { status: 404 })], notFound: nf404() }) });
  assert.equal(gone.status, "fail");
  assert.match(gone.reason, /1 of 2 paid landing pages .* https:\/\/shop\.com\/old \(404\)/);
  assert.equal(RULES["LAND-02"]({ net: net({ landing: [ok(S + "/lp", { title: "Page not found", softNotFound: true })], notFound: nf404() }) }).status, "fail");
  assert.equal(RULES["LAND-02"]({ net: net({ landing: lp, notFound: nf404({ hasSearch: false, hasHomeLink: false, hasProductLinks: false }) }) }).status, "fail");
  assert.equal(RULES["LAND-02"]({ net: net({ landing: [] }) }).status, "unverified", "no OAuth or no rows");
  assert.equal(RULES["LAND-02"]({ net: net({ landing: [ok(S + "/lp", { status: 403 })], notFound: nf404() }) }).status, "unverified", "bot wall");
  assert.equal(RULES["LAND-02"]({ net: net({ landing: [ok(S + "/lp", { redirectedHome: true })], notFound: nf404() }) }).status, "unverified", "redirect to home");
  assert.equal(RULES["LAND-02"]({ net: net({ landing: lp, notFound: nf404({ status: 200 }) }) }).status, "unverified");
});
