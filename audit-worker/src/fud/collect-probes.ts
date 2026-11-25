import type { Browser, HTTPRequest, Page } from "puppeteer-core";

/**
 * Extra browser probes that need interactions collect.ts does not make: an
 * empty cart, a second variant, campaign parameters, in-app navigation, tags
 * on every page type, and hit timing against LCP. Each probe returns plain
 * JSON, is bounded by its own timeout, never throws out of runProbes, and
 * never fails the visit.
 *
 * Guardrails (same as collect.ts): every probe runs in its own throwaway
 * browser context (no cookies in, nothing kept); analytics and pixel hits are
 * aborted before they leave the browser, so the bot never reaches the
 * client's GA4 or ad data (the test campaign parameters included); nothing is
 * typed, no personal data is entered, no order can be placed (the cart is
 * only opened, checkout is never visited).
 *
 * Browser-side scripts are ES5 strings, like collect.ts (see the note there).
 */

// ---- result types (saved on StoreEvidence.probes) ---------------------------

export interface ProbeLink {
  text: string;
  href: string;
}

// PATH-15: the cart page opened in a fresh context, before anything is added.
export interface EmptyCartProbe {
  loaded: boolean;
  url: string;
  finalUrl?: string;
  note?: string;
  // Visible text of the cart page's main area (first 1500 characters).
  text?: string;
  // Links and buttons in the main area (header, footer and menus left out).
  links?: ProbeLink[];
  // Shopify's own item count (/cart.js). Null when the store has no such endpoint.
  itemCount?: number | null;
}

// PDP-12: a second option picked on the product page.
export interface VariantImageProbe {
  loaded: boolean;
  url: string;
  note?: string;
  // The option group we used and its two options (names only).
  group?: string;
  from?: string;
  to?: string;
  // The page confirmed the new option is the selected one.
  selected?: boolean;
  // Main gallery image before and after (src, as the browser resolved it).
  before?: string;
  after?: string;
  // ?variant= in the address bar, before and after.
  urlVariantBefore?: string | null;
  urlVariantAfter?: string | null;
}

export interface Ga4HitSeen {
  // Epoch ms when the request was issued.
  t: number;
  name: string;
  tid?: string;
  // GA4 "dl": the page_location the tag sent.
  dl?: string;
}

// TRK-23: home opened with test campaign parameters.
export interface CampaignParamsProbe {
  loaded: boolean;
  requestedUrl: string;
  finalUrl?: string;
  note?: string;
  // The test parameters we added.
  params: string[];
  ga4: Ga4HitSeen[];
  // Cookie names on the store's domain after the landing (TRK-48: were the
  // click IDs saved?). Names only, never values. Absent on older visits.
  cookies?: string[];
  consentBanner?: boolean;
}

export interface NavStep {
  from: string;
  to?: string;
  // The URL changed and the document was not reloaded.
  spa: boolean;
  // The click changed nothing in 5 s.
  clickFailed?: boolean;
  // GA4 page_view hits sent after the click, and how many of them named the new page.
  pageViews: number;
  pageViewsForNewPage: number;
  // Any GA4 hit after the click.
  ga4Hits: number;
}

// TRK-31: in-app navigation and the GA4 page_views it sent.
export interface SpaNavProbe {
  loaded: boolean;
  url: string;
  note?: string;
  // GA4 page_view hits sent while the first page loaded.
  initialPageViews: number;
  steps: NavStep[];
}

export interface TagPageProbe {
  page: "home" | "collection" | "product" | "cart";
  profile: "phone" | "desktop";
  url: string;
  loaded: boolean;
  botWall?: boolean;
  // A cookie / consent banner was on screen (tags may wait for a choice).
  consentBanner?: boolean;
  // GTM containers requested (gtm.js?id=), gtag.js ids, GA4 measurement IDs
  // and ad pixel IDs ("meta:123…") seen on the page.
  gtmIds: string[];
  gtagIds: string[];
  ga4Ids: string[];
  pixelIds: string[];
}

// TRK-19: tags on each page type, phone and desktop.
export interface TagCoverageProbe {
  pages: TagPageProbe[];
}

export interface TimedHit {
  vendor: string;
  name: string;
  // ms after navigation start (the same clock as lcpMs).
  tMs: number;
}

// TRK-32: when the first tracking hits go out, against LCP.
export interface HitTimingProbe {
  loaded: boolean;
  url: string;
  note?: string;
  // CPU and network throttling were applied (4x CPU, 1.6 Mbps, 150 ms).
  throttled: boolean;
  lcpMs?: number;
  hits: TimedHit[];
}

export interface ProbeResults {
  ranMs: number;
  // Probes not run (out of time) or that failed, with why.
  skipped?: Record<string, string>;
  emptyCart?: EmptyCartProbe;
  variantImage?: VariantImageProbe;
  campaignParams?: CampaignParamsProbe;
  spaNav?: SpaNavProbe;
  tagCoverage?: TagCoverageProbe;
  hitTiming?: HitTimingProbe;
}

// ---- pure helpers (tested) ---------------------------------------------------

const GA4_URL = /google-analytics\.com|analytics\.google\.com|\/g\/collect|\/collect\?v=\d+&tid=|[?&]en=(?:page_view|view_item|add_to_cart|begin_checkout|view_cart|scroll|user_engagement)/;

/** GA4 events in one request: name, measurement id and the page_location (dl) each carried. */
export function ga4HitsOf(url: string, body: string | undefined): Array<{ name: string; tid?: string; dl?: string }> {
  if (!GA4_URL.test(url)) return [];
  let shared: URLSearchParams;
  try { shared = new URL(url).searchParams; } catch { return []; }
  const tid = /^G-[A-Z0-9]+$/i.test(shared.get("tid") ?? "") ? shared.get("tid")! : undefined;
  const out: Array<{ name: string; tid?: string; dl?: string }> = [];
  const push = (f: URLSearchParams) => {
    const name = f.get("en");
    if (!name) return;
    const dl = f.get("dl") ?? shared.get("dl") ?? undefined;
    out.push({ name, ...(tid && { tid }), ...(dl && { dl }) });
  };
  if (shared.has("en")) push(shared);
  for (const line of (body ?? "").split(/\r?\n/)) {
    if (!/(?:^|&)en=/.test(line)) continue;
    try { push(new URLSearchParams(line)); } catch { /* skip a malformed line */ }
  }
  return out;
}

/** Same picture whatever the size or cache suffix: protocol, query and Shopify "_600x" size dropped. */
export function imageKey(src: string | undefined | null): string {
  if (!src) return "";
  let s = src.trim();
  try {
    const u = new URL(s, "https://x.invalid");
    s = u.host === "x.invalid" ? u.pathname : u.host + u.pathname;
  } catch { s = s.split("?")[0]; }
  return s.toLowerCase().replace(/_(?:\d+x\d*|\d*x\d+|pico|icon|thumb|small|compact|medium|large|grande|master)(?=\.[a-z0-9]+$)/, "");
}

/** The share of Arabic letters among all letters (0..1), or null when there are too few letters to tell. */
export function arabicShare(text: string, minLetters = 30): number | null {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < minLetters) return null;
  const ar = text.match(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g) ?? [];
  return ar.length / letters.length;
}

/** Query parameter names the TRK-23 probe adds to the home URL (values are obvious test values). */
export const TEST_PARAMS: Array<[string, string]> = [
  ["utm_source", "optimizers_audit"],
  ["utm_medium", "qa"],
  ["utm_campaign", "param_test"],
  ["gclid", "OPTAUDIT_GCLID"],
  ["fbclid", "OPTAUDIT_FBCLID"],
  ["ttclid", "OPTAUDIT_TTCLID"],
];

export function withTestParams(url: string): string {
  const u = new URL(url);
  for (const [k, v] of TEST_PARAMS) u.searchParams.set(k, v);
  return u.toString();
}

/** Which of the test parameters (name=value) are missing from a URL. Empty when all are kept. */
export function missingTestParams(url: string | undefined): string[] {
  if (!url) return TEST_PARAMS.map(([k]) => k);
  let q: URLSearchParams;
  try { q = new URL(url).searchParams; } catch { return TEST_PARAMS.map(([k]) => k); }
  return TEST_PARAMS.filter(([k, v]) => q.get(k) !== v).map(([k]) => k);
}

// ---- browser-side scripts (ES5) ---------------------------------------------

const EMPTY_CART_JS = String.raw`(async function () {
  var root = document.querySelector("main, #MainContent, [role=main], #main, .main-content") || document.body;
  function skip(el) { return !!el.closest("header, footer, nav, [role=navigation], [id*=shopify-section-header], [id*=shopify-section-footer]"); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  var links = [];
  root.querySelectorAll("a[href], button").forEach(function (el) {
    if (links.length >= 30 || skip(el) || !vis(el)) return;
    var t = (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 60);
    var h = el.tagName === "A" ? el.href : (el.closest("a[href]") ? el.closest("a[href]").href : "");
    if (!t && !h) return;
    links.push({ text: t, href: h });
  });
  var count = null;
  try {
    var r = await fetch("/cart.js", { credentials: "same-origin", headers: { Accept: "application/json" } });
    if (r.ok) { var j = await r.json(); if (typeof j.item_count === "number") count = j.item_count; }
  } catch (e) {}
  return { text: (root.innerText || "").replace(/\s+/g, " ").trim().slice(0, 1500), links: links, itemCount: count };
})()`;

const MAIN_IMAGE_JS = String.raw`(function () {
  var best = null, area = 0;
  document.querySelectorAll("img").forEach(function (img) {
    if (img.closest("header, footer, nav")) return;
    var r = img.getBoundingClientRect();
    if (r.width < 150 || r.height < 150 || r.bottom < 0 || r.top > 1400) return;
    var w = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
    var a = w * r.height;
    if (a > area) { area = a; best = img; }
  });
  var u = null;
  try { u = new URL(location.href).searchParams.get("variant"); } catch (e) {}
  return { src: best ? (best.currentSrc || best.src || best.getAttribute("data-src") || "") : "", variant: u };
})()`;

// Picks a second option in a non-size group (colour first). Radios, selects
// and ARIA radio groups; clicks it the way the shopper would.
const PICK_VARIANT_JS = String.raw`(function () {
  var SIZE = /size|مقاس|حجم|taille|talla/i, COLOR = /colou?r|لون|style|finish|material|اللون/i, SOLD = /sold.?out|out of stock|unavailable|نفذ|غير متوفر/i;
  var form = document.querySelector('form[action*="/cart/add"], form.cart, form.variations_form, product-form form') || document;
  var groups = [];
  function labelOf(el) {
    var l = el.id ? document.querySelector('label[for="' + el.id.replace(/"/g, "") + '"]') : null;
    return ((l && l.innerText) || el.getAttribute("aria-label") || el.getAttribute("data-value") || el.value || el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40);
  }
  function groupName(el, fallback) {
    var fs = el.closest("fieldset"); var lg = fs && fs.querySelector("legend");
    var lab = el.id && el.tagName === "SELECT" ? document.querySelector('label[for="' + el.id.replace(/"/g, "") + '"]') : null;
    return ((lg && lg.innerText) || (lab && lab.innerText) || el.getAttribute("aria-label") || fallback || "").replace(/\s+/g, " ").trim().slice(0, 40);
  }
  form.querySelectorAll("select").forEach(function (s) {
    var opts = [];
    for (var i = 0; i < s.options.length; i++) { var o = s.options[i]; if (o.value && !o.disabled && !SOLD.test(o.text)) opts.push({ i: i, label: o.text.replace(/\s+/g, " ").trim().slice(0, 40) }); }
    if (opts.length >= 2) groups.push({ kind: "select", el: s, name: groupName(s, s.name || s.id), opts: opts, cur: s.selectedIndex });
  });
  var radios = {};
  form.querySelectorAll("input[type=radio]").forEach(function (r) { (radios[r.name] = radios[r.name] || []).push(r); });
  Object.keys(radios).forEach(function (n) {
    var list = radios[n].filter(function (r) { return !r.disabled && !SOLD.test(labelOf(r)) && !/disabled|sold/i.test((document.querySelector('label[for="' + (r.id || "").replace(/"/g, "") + '"]') || r).className || ""); });
    if (list.length >= 2) groups.push({ kind: "radio", name: groupName(list[0], n), opts: list.map(function (r, i) { return { i: i, label: labelOf(r), el: r }; }), cur: list.findIndex(function (r) { return r.checked; }) });
  });
  form.querySelectorAll("[role=radiogroup]").forEach(function (g) {
    var items = [].slice.call(g.querySelectorAll("[role=radio]")).filter(function (e) { return e.getAttribute("aria-disabled") !== "true" && !SOLD.test(labelOf(e)); });
    if (items.length >= 2) groups.push({ kind: "aria", name: groupName(g, ""), opts: items.map(function (e, i) { return { i: i, label: labelOf(e), el: e }; }), cur: items.findIndex(function (e) { return e.getAttribute("aria-checked") === "true"; }) });
  });
  // Not variant pickers: phone country codes, country/currency/language and
  // quantity dropdowns (regal-honey.com, 22 Nov: a "+973" dial-code select was picked).
  var NOT_VARIANT = /phone|tel|mobile|country|dial|code|currency|lang|qty|quantity|كمية|الدولة|العملة|اللغة/i;
  function dialCodes(g) { var n = 0; g.opts.forEach(function (o) { if (/^\+?\d{1,4}$|^\+\d/.test(o.label)) n++; }); return n * 2 > g.opts.length; }
  var usable = groups.filter(function (g) { return !SIZE.test(g.name) && !NOT_VARIANT.test(g.name) && !dialCodes(g) && !(g.el && g.el.closest && g.el.closest("[class*=phone],[class*=country],[class*=currency]")) && g.cur >= 0; });
  if (!usable.length) return { ok: false, why: groups.length ? "only size options, or no option was selected by default" : "no variant options found", groups: groups.length };
  usable.sort(function (a, b) { return (COLOR.test(b.name) ? 1 : 0) - (COLOR.test(a.name) ? 1 : 0); });
  var g = usable[0];
  var from = g.opts.filter(function (o) { return o.i === g.cur; })[0];
  var to = g.opts.filter(function (o) { return o.i !== g.cur; })[0];
  if (!to) return { ok: false, why: "no second option", groups: groups.length };
  var selected = false;
  if (g.kind === "select") {
    g.el.selectedIndex = to.i;
    g.el.dispatchEvent(new Event("input", { bubbles: true }));
    g.el.dispatchEvent(new Event("change", { bubbles: true }));
    selected = g.el.selectedIndex === to.i;
  } else if (g.kind === "radio") {
    var lab = to.el.id ? document.querySelector('label[for="' + to.el.id.replace(/"/g, "") + '"]') : null;
    (lab || to.el).click();
    selected = to.el.checked;
  } else {
    to.el.click();
    selected = to.el.getAttribute("aria-checked") === "true";
  }
  return { ok: true, group: g.name || g.kind, from: from ? from.label : "", to: to.label, selected: selected };
})()`;

const CONSENT_JS = String.raw`(function () {
  var els = document.querySelectorAll('[id*=cookie i], [class*=cookie i], [id*=consent i], [class*=consent i], [id*=gdpr i], [class*=gdpr i], [id*=cmp i], [class*=cmp-]');
  for (var i = 0; i < els.length; i++) {
    var r = els[i].getBoundingClientRect();
    if (r.width > 120 && r.height > 30 && /cookie|consent|accept|privacy|ملفات تعريف|الكوكيز|ملفات الارتباط/i.test(els[i].innerText || "")) return true;
  }
  return false;
})()`;

// Marks the page and lists same-site links worth tapping for an in-app
// navigation: shop pages first, never cart, checkout, account or downloads.
const PICK_LINK_JS = String.raw`(function (exclude) {
  window.__optProbe = 1;
  var here = location.pathname, out = [], seen = {};
  document.querySelectorAll("a[href]").forEach(function (a) {
    var u; try { u = new URL(a.href); } catch (e) { return; }
    if (u.origin !== location.origin || u.pathname === here || exclude.indexOf(u.pathname) >= 0 || seen[u.pathname]) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    if (/\/(cart|checkout|account|login|logout|register|search|wishlist)\b|\.(pdf|jpe?g|png|zip)$|add-to|\/pages\/(contact|privacy|terms)/i.test(u.pathname + u.search)) return;
    var r = a.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.top < 0 || r.top > 2500) return;
    seen[u.pathname] = 1;
    var score = /collections|\/products|category|\/shop|المنتجات/i.test(u.pathname) ? 2 : 1;
    out.push({ a: a, score: score, top: r.top, path: u.pathname });
  });
  out.sort(function (x, y) { return y.score - x.score || x.top - y.top; });
  var pick = out[0];
  if (!pick) return null;
  pick.a.setAttribute("data-opt-probe", "1");
  return pick.path;
})`;

const CLICK_PICKED_JS = String.raw`(function () {
  var a = document.querySelector("[data-opt-probe]");
  if (!a) return false;
  a.removeAttribute("data-opt-probe");
  a.click();
  return true;
})()`;

const LCP_INIT_JS = String.raw`(function () {
  window.__optLcp = 0;
  try {
    new PerformanceObserver(function (l) { var e = l.getEntries(); if (e.length) window.__optLcp = e[e.length - 1].startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {}
})()`;

// ---- plumbing ------------------------------------------------------------------

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const BOT_WALL = /just a moment|attention required|access denied|are you a robot|captcha|verify you are human|request blocked/i;

interface Profile { viewport: { width: number; height: number; deviceScaleFactor: number; isMobile?: boolean; hasTouch?: boolean }; userAgent: string }
const PHONE: Profile = { viewport: { width: 390, height: 844, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 OptimizersAudit/1.0" };
const DESKTOP: Profile = { viewport: { width: 1440, height: 900, deviceScaleFactor: 1 }, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OptimizersAudit/1.0" };

/** collect.ts passes its own blocklist and parser, so the probes block exactly what the visit blocks. */
export interface ProbeDeps {
  isBlocked(url: string): boolean;
  hitEvents(url: string, body: string | undefined): Array<{ vendor: string; name: string; id?: string }>;
}

export interface ProbeInput {
  browser: Browser;
  homepage: string;
  productUrl?: string;
  collectionUrl?: string;
  cartUrl: string;
  deps: ProbeDeps;
  // Epoch ms by which every probe must be finished.
  deadline: number;
}

interface Seen {
  t: number;
  vendor: string;
  name: string;
  id?: string;
  tid?: string;
  dl?: string;
}

interface Sink {
  hits: Seen[];
  gtm: string[];
  gtag: string[];
}

interface Session {
  page: Page;
  sink: Sink;
  close(): Promise<void>;
}

async function openSession(input: ProbeInput, profile: Profile): Promise<Session> {
  const ctx = await input.browser.createBrowserContext();
  const sink: Sink = { hits: [], gtm: [], gtag: [] };
  const close = async () => { await ctx.close().catch(() => {}); };
  try {
    const page = await ctx.newPage();
    await page.setViewport(profile.viewport);
    await page.setUserAgent(profile.userAgent);
    await page.setRequestInterception(true);
    const note = (url: string, body: string | undefined, t: number) => {
      if (sink.hits.length >= 200) return;
      const ga4 = ga4HitsOf(url, body);
      for (const h of ga4) sink.hits.push({ t, vendor: "ga4", name: h.name, ...(h.tid && { id: h.tid, tid: h.tid }), ...(h.dl && { dl: h.dl }) });
      if (ga4.length) return;
      for (const h of input.deps.hitEvents(url, body)) sink.hits.push({ t, vendor: h.vendor, name: h.name, ...(h.id && { id: h.id }) });
    };
    page.on("request", (req: HTTPRequest) => {
      if (req.isInterceptResolutionHandled()) return;
      const url = req.url();
      if (input.deps.isBlocked(url)) {
        const t = Date.now();
        let body: string | undefined;
        try { body = req.postData(); } catch { body = undefined; }
        if (body === undefined && req.hasPostData()) {
          req.fetchPostData().catch(() => undefined).then(b => note(url, b, t)).finally(() => req.abort("blockedbyclient").catch(() => {}));
          return;
        }
        note(url, body, t);
        req.abort("blockedbyclient").catch(() => {});
        return;
      }
      const gtm = /googletagmanager\.com\/gtm\.js\?(?:[^#]*&)?id=(GTM-[A-Z0-9]+)/i.exec(url)?.[1];
      if (gtm && !sink.gtm.includes(gtm.toUpperCase())) sink.gtm.push(gtm.toUpperCase());
      const gtag = /googletagmanager\.com\/gtag\/js\?(?:[^#]*&)?id=([A-Z0-9-]+)/i.exec(url)?.[1];
      if (gtag && !sink.gtag.includes(gtag.toUpperCase())) sink.gtag.push(gtag.toUpperCase());
      req.continue().catch(() => {});
    });
    return { page, sink, close };
  } catch (err) {
    await close();
    throw err;
  }
}

async function goto(page: Page, url: string, timeout = 20_000): Promise<string | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    return null;
  } catch (err) {
    return `did not load: ${err instanceof Error ? err.message.slice(0, 100) : String(err)}`;
  }
}

/** Runs one probe in its own session, bounded by `ms` and by the overall deadline; always closes the session. */
async function bounded<T>(input: ProbeInput, profile: Profile, ms: number, fn: (s: Session) => Promise<T>): Promise<T> {
  const left = input.deadline - Date.now();
  if (left < 5000) throw new Error("out of time");
  const s = await openSession(input, profile);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn(s),
      new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error(`probe timed out after ${Math.round(Math.min(ms, left) / 1000)}s`)), Math.min(ms, left)); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    await s.close();
  }
}

const ev = <T>(page: Page, script: string): Promise<T | null> => page.evaluate(script).then(r => r as T).catch(() => null);

// ---- probes ----------------------------------------------------------------------

/** PATH-15: the cart page, opened before anything is added. */
export async function probeEmptyCart(input: ProbeInput): Promise<EmptyCartProbe> {
  return bounded(input, PHONE, 25_000, async ({ page }) => {
    const out: EmptyCartProbe = { loaded: false, url: input.cartUrl };
    const err = await goto(page, input.cartUrl);
    if (err) return { ...out, note: err };
    await sleep(2500);
    out.finalUrl = page.url();
    const title = await page.title().catch(() => "");
    if (BOT_WALL.test(title)) return { ...out, note: "blocked by a bot check" };
    const r = await ev<{ text: string; links: ProbeLink[]; itemCount: number | null }>(page, EMPTY_CART_JS);
    if (!r) return { ...out, note: "could not read the cart page" };
    return { ...out, loaded: true, text: r.text, links: r.links, itemCount: r.itemCount };
  });
}

/** PDP-12: pick a second option, compare the main image. */
export async function probeVariantImage(input: ProbeInput): Promise<VariantImageProbe> {
  const url = input.productUrl;
  if (!url) return { loaded: false, url: "", note: "no product page" };
  return bounded(input, PHONE, 30_000, async ({ page }) => {
    const out: VariantImageProbe = { loaded: false, url };
    const err = await goto(page, url);
    if (err) return { ...out, note: err };
    await sleep(2500);
    const before = await ev<{ src: string; variant: string | null }>(page, MAIN_IMAGE_JS);
    if (!before?.src) return { ...out, loaded: true, note: "no main gallery image found" };
    const pick = await ev<{ ok: boolean; why?: string; group?: string; from?: string; to?: string; selected?: boolean }>(page, PICK_VARIANT_JS);
    if (!pick) return { ...out, loaded: true, before: before.src, note: "could not read the variant options" };
    if (!pick.ok) return { ...out, loaded: true, before: before.src, note: pick.why };
    // A gallery swap can be lazy: read again after a short and a longer wait.
    await sleep(1500);
    let after = await ev<{ src: string; variant: string | null }>(page, MAIN_IMAGE_JS);
    if (after && imageKey(after.src) === imageKey(before.src)) {
      await sleep(2000);
      after = await ev<{ src: string; variant: string | null }>(page, MAIN_IMAGE_JS);
    }
    return { ...out, loaded: true, group: pick.group, from: pick.from, to: pick.to, selected: pick.selected, before: before.src, after: after?.src, urlVariantBefore: before.variant, urlVariantAfter: after?.variant };
  });
}

/** TRK-23: home with test campaign parameters; what GA4 saw as page_location. */
export async function probeCampaignParams(input: ProbeInput): Promise<CampaignParamsProbe> {
  const requestedUrl = withTestParams(input.homepage);
  const params = TEST_PARAMS.map(([k]) => k);
  return bounded(input, PHONE, 28_000, async ({ page, sink }) => {
    const out: CampaignParamsProbe = { loaded: false, requestedUrl, params, ga4: [] };
    const err = await goto(page, requestedUrl);
    if (err) return { ...out, note: err };
    // Wait for the first GA4 page_view, up to 8 s.
    const start = Date.now();
    while (Date.now() - start < 8000 && !sink.hits.some(h => h.vendor === "ga4" && h.name === "page_view")) await sleep(400);
    await sleep(800);
    const cookies = ((await page.cookies().catch(() => [])) as Array<{ name: string }>).map(c => c.name).slice(0, 80);
    const consentBanner = (await ev<boolean>(page, CONSENT_JS)) === true;
    return { ...out, loaded: true, finalUrl: page.url(), cookies, consentBanner, ga4: sink.hits.filter(h => h.vendor === "ga4").slice(0, 20).map(h => ({ t: h.t, name: h.name, ...(h.tid && { tid: h.tid }), ...(h.dl && { dl: h.dl.slice(0, 600) }) })) };
  });
}

/** TRK-31: tap in-app links, count GA4 page_views per navigation. */
export async function probeSpaNav(input: ProbeInput): Promise<SpaNavProbe> {
  return bounded(input, PHONE, 45_000, async ({ page, sink }) => {
    const out: SpaNavProbe = { loaded: false, url: input.homepage, initialPageViews: 0, steps: [] };
    const err = await goto(page, input.homepage);
    if (err) return { ...out, note: err };
    await sleep(3500);
    out.loaded = true;
    const pv = (since: number) => sink.hits.filter(h => h.vendor === "ga4" && h.name === "page_view" && h.t >= since);
    out.initialPageViews = pv(0).length;
    const tried: string[] = [];
    for (let i = 0; i < 2; i++) {
      const pathOf = (u: string) => { try { return new URL(u).pathname; } catch { return u; } };
      const from = page.url();
      const picked = await page.evaluate(`${PICK_LINK_JS}(${JSON.stringify(tried)})`).catch(() => null) as string | null;
      if (!picked) { if (i === 0) out.note = "no in-app link to tap"; break; }
      tried.push(picked);
      const at = Date.now();
      await page.evaluate(CLICK_PICKED_JS).catch(() => false);
      const step: NavStep = { from, spa: false, pageViews: 0, pageViewsForNewPage: 0, ga4Hits: 0 };
      let changed = false, marker = false;
      const start = Date.now();
      while (Date.now() - start < 5000) {
        await sleep(400);
        if (pathOf(page.url()) !== pathOf(from)) {
          changed = true;
          const m = await page.evaluate("window.__optProbe === 1").catch(() => null);
          marker = m === true;
          // Marker gone: the document reloaded. A failed read mid-load is retried.
          if (m === false || marker) break;
        }
      }
      step.to = page.url();
      if (!changed) { step.clickFailed = true; out.steps.push(step); break; }
      if (!marker) { out.steps.push(step); break; }
      step.spa = true;
      // Hits for a history change can take a moment.
      await sleep(3500);
      const views = pv(at);
      const newPath = pathOf(step.to);
      step.pageViews = views.length;
      step.pageViewsForNewPage = views.filter(h => h.dl && pathOf(h.dl) === newPath).length;
      step.ga4Hits = sink.hits.filter(h => h.vendor === "ga4" && h.t >= at).length;
      out.steps.push(step);
    }
    return out;
  });
}

async function tagPage(page: Page, sink: Sink, which: TagPageProbe["page"], profile: TagPageProbe["profile"], url: string): Promise<TagPageProbe> {
  const out: TagPageProbe = { page: which, profile, url, loaded: false, gtmIds: [], gtagIds: [], ga4Ids: [], pixelIds: [] };
  sink.hits.length = 0; sink.gtm.length = 0; sink.gtag.length = 0;
  const err = await goto(page, url, 18_000);
  if (err) return out;
  await sleep(3500);
  const title = await page.title().catch(() => "");
  out.url = page.url();
  out.loaded = true;
  if (BOT_WALL.test(title)) out.botWall = true;
  out.consentBanner = (await ev<boolean>(page, CONSENT_JS)) === true;
  out.gtmIds = [...sink.gtm];
  out.gtagIds = [...sink.gtag];
  out.ga4Ids = [...new Set(sink.hits.filter(h => h.vendor === "ga4" && h.id).map(h => h.id!.toUpperCase()))];
  out.pixelIds = [...new Set(sink.hits.filter(h => h.vendor !== "ga4" && h.id).map(h => `${h.vendor}:${h.id}`))];
  return out;
}

/** TRK-19: GTM container, GA4 and pixel IDs on home, collection, product and cart, phone and desktop. */
export async function probeTagCoverage(input: ProbeInput): Promise<TagCoverageProbe> {
  const list: Array<[TagPageProbe["page"], string | undefined]> = [["home", input.homepage], ["collection", input.collectionUrl], ["product", input.productUrl], ["cart", input.cartUrl]];
  const run = (profile: Profile, name: TagPageProbe["profile"]) =>
    bounded(input, profile, 70_000, async ({ page, sink }) => {
      const pages: TagPageProbe[] = [];
      for (const [which, url] of list) {
        if (!url || Date.now() > input.deadline - 6000) continue;
        pages.push(await tagPage(page, sink, which, name, url));
      }
      return pages;
    });
  const [phone, desktop] = await Promise.allSettled([run(PHONE, "phone"), run(DESKTOP, "desktop")]);
  const pages = [...(phone.status === "fulfilled" ? phone.value : []), ...(desktop.status === "fulfilled" ? desktop.value : [])];
  if (!pages.length) throw new Error(phone.status === "rejected" ? String(phone.reason?.message ?? phone.reason) : "no page opened");
  return { pages };
}

/** TRK-32: first hit times against LCP on the home page, CPU and network throttled. */
export async function probeHitTiming(input: ProbeInput): Promise<HitTimingProbe> {
  return bounded(input, PHONE, 45_000, async ({ page, sink }) => {
    const out: HitTimingProbe = { loaded: false, url: input.homepage, throttled: false, hits: [] };
    try {
      await page.emulateCPUThrottling(4);
      await page.emulateNetworkConditions({ download: (1.6 * 1024 * 1024) / 8, upload: (750 * 1024) / 8, latency: 150 });
      out.throttled = true;
    } catch {
      // Without throttling the times are still captured, but never compared.
      await page.emulateCPUThrottling(null).catch(() => {});
      await page.emulateNetworkConditions(null).catch(() => {});
    }
    await page.evaluateOnNewDocument(LCP_INIT_JS);
    const err = await goto(page, input.homepage, 30_000);
    if (err) return { ...out, note: err };
    out.loaded = true;
    // LCP keeps moving until the page settles: read it until it holds for 2.5 s (max 14 s).
    let last = -1, stableSince = Date.now();
    const start = Date.now();
    while (Date.now() - start < 14_000) {
      await sleep(500);
      const lcp = (await ev<number>(page, "window.__optLcp || 0")) ?? 0;
      if (lcp !== last) { last = lcp; stableSince = Date.now(); } else if (lcp > 0 && Date.now() - stableSince > 2500) break;
    }
    const origin = await ev<number>(page, "performance.timeOrigin");
    if (last > 0) out.lcpMs = Math.round(last);
    if (origin) out.hits = sink.hits.slice(0, 40).map(h => ({ vendor: h.vendor, name: h.name, tMs: Math.round(h.t - origin) }));
    else out.note = "could not read the page's time origin";
    return out;
  });
}

// ---- runner --------------------------------------------------------------------------

/**
 * Runs every probe in three bounded batches (cheap ones in parallel, the
 * timing one alone so the other pages don't slow it). A probe that fails or
 * has no time left is listed under `skipped` and never throws.
 */
export async function runProbes(input: ProbeInput): Promise<ProbeResults> {
  const started = Date.now();
  const res: ProbeResults = { ranMs: 0 };
  const skipped: Record<string, string> = {};
  const run = async <K extends Exclude<keyof ProbeResults, "ranMs" | "skipped">>(key: K, fn: (i: ProbeInput) => Promise<NonNullable<ProbeResults[K]>>) => {
    try {
      res[key] = (await fn(input)) as ProbeResults[K];
    } catch (err) {
      skipped[key] = err instanceof Error ? err.message.slice(0, 120) : String(err);
    }
  };
  await Promise.all([run("emptyCart", probeEmptyCart), run("campaignParams", probeCampaignParams), run("variantImage", probeVariantImage)]);
  await Promise.all([run("spaNav", probeSpaNav), run("tagCoverage", probeTagCoverage)]);
  await run("hitTiming", probeHitTiming);
  if (Object.keys(skipped).length) res.skipped = skipped;
  res.ranMs = Date.now() - started;
  return res;
}
