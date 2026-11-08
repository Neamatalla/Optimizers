/**
 * Site analytics: every interaction is pushed to the GTM dataLayer as
 * { event: "<name>", event_category, ...common params, ...event params }.
 *
 * - track(): programmatic events (stateful UI: form, sliders, ROI, video…).
 * - data-track="<event>" on an element: declarative click events, picked up
 *   by one delegated listener. data-track-foo-bar="x" adds param foo_bar="x".
 *   data-track-ignore marks an element whose clicks are tracked in code.
 * - Clicks on links/buttons with no data-track send ui_click_untagged, so
 *   new UI never goes untracked silently.
 * - section_view, page_scroll_depth and page_time_milestone run on their own.
 *
 * Never push personal data (name, email, website, free text) — GA4 forbids it.
 */
import { TRACKING_EVENTS, type TrackingEventName } from "./events";
import { captureAttribution, firstTouch, isLead, touchLabel } from "./attribution";

type ParamValue = string | number | boolean | null | undefined;
export type TrackParams = Record<string, ParamValue>;

declare global {
  interface Window { dataLayer?: unknown[] }
}

const PAGE_START = Date.now();
let lastKeys: string[] = [];

export function pageType(): string {
  const p = window.location.pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return "home";
  return p.slice(1).replace(/\//g, "_");
}

export function deviceLayout(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  return w >= 1024 ? "desktop" : w >= 768 ? "tablet" : "mobile";
}

function scrollPercent(): number {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / max) * 100));
}

function commonParams(): TrackParams {
  return {
    event_id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    page_type: pageType(),
    page_path: window.location.pathname,
    site_language: document.documentElement.lang || "en",
    device_layout: deviceLayout(),
    viewport_width: window.innerWidth,
    scroll_percent: scrollPercent(),
    time_on_page_sec: Math.round((Date.now() - PAGE_START) / 1000),
    // Visitor-level (sent as GA4 user properties too)
    visitor_is_lead: isLead() ? "yes" : "no",
    first_touch_source: touchLabel(firstTouch()),
    ab_experiments: abExperiments(),
  };
}

/** Running Convert.com experiences as "experienceId:variationId|…" so every event splits by A/B variant. */
function abExperiments(): string | undefined {
  try {
    const exps = (window as any).convert?.currentData?.experiences;
    if (!exps || typeof exps !== "object") return undefined;
    const parts = Object.entries(exps).map(([id, e]: [string, any]) => `${id}:${e?.variation?.id ?? "?"}`);
    return parts.length ? parts.join("|").slice(0, 100) : undefined;
  } catch {
    return undefined;
  }
}

/** Push one event. Params from the previous event are cleared so they never leak into this one. */
export function track(event: TrackingEventName, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  const category = TRACKING_EVENTS[event];
  if (!category && import.meta.env.DEV) console.warn(`[analytics] "${event}" is not in the tracking plan (src/lib/analytics/events.ts)`);
  const payload: Record<string, unknown> = { event_category: category, ...commonParams() };
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    payload[k] = typeof v === "string" ? v.slice(0, 100) : v;
  }
  const reset: Record<string, undefined> = {};
  for (const k of lastKeys) if (!(k in payload)) reset[k] = undefined;
  lastKeys = Object.keys(payload);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ...reset, event, ...payload });
  if (import.meta.env.DEV && (window as any).__ANALYTICS_DEBUG__) console.debug("[analytics]", event, payload);
}

// ─── helpers ───

export const cleanText = (s: string | null | undefined, max = 100) => (s || "").replace(/\s+/g, " ").trim().slice(0, max);

export function linkParams(href: string | null | undefined): TrackParams {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return {};
  try {
    const u = new URL(href, window.location.href);
    const host = u.hostname.replace(/^www\./, "");
    const own = window.location.hostname.replace(/^www\./, "");
    return { link_url: u.href, link_domain: host, outbound: host !== own };
  } catch {
    return {};
  }
}

export function sectionOf(el: Element | null): string | undefined {
  return el?.closest("[data-track-section]")?.getAttribute("data-track-section") || undefined;
}

export function isInViewport(el: Element | null, minRatio = 0.25): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return visible > 0 && visible / Math.min(r.height || 1, window.innerHeight) >= minRatio;
}

/** "Free webmail" vs business address — a lead-quality signal that carries no personal data. */
const FREE_MAIL = /^(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|gmx|mail|yandex|zoho)\./i;
export function emailDomainType(email: string): "business" | "free_email" | "unknown" {
  const domain = email.split("@")[1];
  if (!domain || !domain.includes(".")) return "unknown";
  return FREE_MAIL.test(domain) ? "free_email" : "business";
}

const snake = (camel: string) => camel.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());

// ─── nav-driven smooth scrolls ───
// A nav/CTA click smooth-scrolls past many sections; those must not count as
// "viewed". While it runs, view tracking is paused; when scrolling settles,
// listeners re-check what is actually on screen.
let navScrolling = false;
const navScrollEndListeners = new Set<() => void>();
export const isNavScrolling = () => navScrolling;
export function onNavScrollEnd(cb: () => void): () => void {
  navScrollEndListeners.add(cb);
  return () => navScrollEndListeners.delete(cb);
}
function startNavScroll() {
  navScrolling = true;
  let idle = 0;
  const end = () => {
    if (!navScrolling) return;
    navScrolling = false;
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(idle);
    window.clearTimeout(cap);
    navScrollEndListeners.forEach((cb) => cb());
  };
  const onScroll = () => { window.clearTimeout(idle); idle = window.setTimeout(end, 250); };
  window.addEventListener("scroll", onScroll, { passive: true });
  idle = window.setTimeout(end, 500); // no scroll at all (already there) → end quickly
  const cap = window.setTimeout(end, 4000);
}

// ─── automatic listeners ───

let started = false;

export function initAnalytics(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  captureAttribution();
  initClickTracking();
  initSectionViews();
  initScrollDepth();
  initTimeMilestones();
  initErrorTracking();
  void initWebVitals();
}

/** Core Web Vitals (LCP, INP, CLS, FCP, TTFB) once each per page, with Google's rating. */
async function initWebVitals() {
  const { onLCP, onINP, onCLS, onFCP, onTTFB } = await import("web-vitals");
  const send = (m: { name: string; value: number; rating: string; navigationType?: string }) =>
    track("web_vital", {
      metric_name: m.name,
      metric_value: m.name === "CLS" ? Math.round(m.value * 1000) / 1000 : Math.round(m.value),
      metric_rating: m.rating,
      navigation_type: m.navigationType,
    });
  onLCP(send); onINP(send); onCLS(send); onFCP(send); onTTFB(send);
}

/** Uncaught JS errors and promise rejections (max 10 per page, deduplicated). */
function initErrorTracking() {
  const seen = new Set<string>();
  const report = (message: string, source: string, kind: string) => {
    const key = message + source;
    if (seen.has(key) || seen.size >= 10) return;
    seen.add(key);
    track("js_error", { error_message: cleanText(message), error_source: cleanText(source), error_kind: kind });
  };
  window.addEventListener("error", (e) => {
    if (!e.message) return; // resource load errors carry no message
    const file = (e.filename || "").replace(window.location.origin, "");
    report(e.message, `${file}:${e.lineno}:${e.colno}`, "error");
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r: any = e.reason;
    report(r?.message || String(r), (r?.stack || "").split("\n")[1]?.trim() || "promise", "unhandled_rejection");
  });
}

function initClickTracking() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element | null;
      if (!target || !(target instanceof Element)) return;
      if (target.closest("[data-track-ignore]")) return;
      const el = target.closest<HTMLElement>("[data-track]");
      if (el) {
        const event = el.dataset.track as TrackingEventName;
        const params: TrackParams = {};
        for (const [key, value] of Object.entries(el.dataset)) {
          if (key === "track" || !key.startsWith("track") || key === "trackIgnore") continue;
          const name = snake(key.slice(5)).replace(/^_/, "");
          params[name] = value === "true" ? true : value === "false" ? false : value;
        }
        const link = el.closest("a");
        Object.assign(params, {
          element_text: cleanText(el.innerText || el.getAttribute("aria-label")),
          element_type: params.element_type ?? (link ? "link" : el.tagName === "BUTTON" ? "button" : "button_div"),
          section_name: params.section_name ?? sectionOf(el),
          ...linkParams(link?.getAttribute("href")),
        });
        track(event, params);
        if (params.nav_target && !link?.getAttribute("href")?.startsWith("http")) startNavScroll();
        return;
      }
      const fallback = target.closest<HTMLElement>("a[href], button, [role='button'], input[type='submit']");
      if (fallback) {
        track("ui_click_untagged", {
          element_tag: fallback.tagName.toLowerCase(),
          element_text: cleanText(fallback.innerText || fallback.getAttribute("aria-label") || fallback.getAttribute("title")),
          element_id: fallback.id || undefined,
          section_name: sectionOf(fallback),
          ...linkParams(fallback.getAttribute("href")),
        });
      }
    },
    true,
  );
}

function initSectionViews() {
  const seen = new Set<string>();
  const observed = new WeakSet<Element>();
  // data-track-no-view: always-visible chrome (fixed header, menu overlay) — used for click attribution only.
  const SECTIONS = "[data-track-section]:not([data-track-no-view])";
  const order = () => Array.from(document.querySelectorAll(SECTIONS)).map((n) => n.getAttribute("data-track-section"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const name = entry.target.getAttribute("data-track-section");
        if (!name || seen.has(name) || !entry.isIntersecting || navScrolling) continue;
        // "Viewed" = covers half the viewport, or half of itself if shorter than the viewport.
        const coverage = entry.intersectionRect.height / Math.min(entry.boundingClientRect.height || 1, window.innerHeight);
        if (coverage < 0.5) continue;
        seen.add(name);
        track("section_view", { section_name: name, section_index: order().indexOf(name) + 1 });
      }
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  );
  const scan = () => document.querySelectorAll(SECTIONS).forEach((n) => {
    if (!observed.has(n)) { observed.add(n); io.observe(n); }
  });
  scan();
  // After a nav scroll, re-observe so IntersectionObserver reports the sections now on screen.
  onNavScrollEnd(() => document.querySelectorAll(SECTIONS).forEach((n) => { io.unobserve(n); io.observe(n); }));
  // Lazy-loaded sections mount later.
  let pending = 0;
  new MutationObserver(() => { window.clearTimeout(pending); pending = window.setTimeout(scan, 300); })
    .observe(document.body, { childList: true, subtree: true });
}

function initScrollDepth() {
  const marks = [25, 50, 75, 90, 100];
  const fired = new Set<number>();
  let ticking = false;
  const check = () => {
    ticking = false;
    const pct = scrollPercent();
    for (const m of marks) if (pct >= m && !fired.has(m)) { fired.add(m); track("page_scroll_depth", { scroll_threshold: m }); }
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
}

function initTimeMilestones() {
  const marks = [15, 30, 60, 120, 300, 600];
  let visibleSeconds = 0;
  const timer = window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    visibleSeconds += 1;
    if (marks.includes(visibleSeconds)) track("page_time_milestone", { engagement_seconds: visibleSeconds });
    if (visibleSeconds >= marks[marks.length - 1]) window.clearInterval(timer);
  }, 1000);
}
