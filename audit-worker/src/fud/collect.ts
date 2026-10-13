import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { pageTypeOf } from "../discover-pages.js";
import { findChrome } from "../screenshots.js";
import type { FudPageType } from "../types.js";
import type { PageEvidence, StoreEvidence, TextBlock } from "./evidence.js";
import { widgetsIn } from "./signals.js";

/**
 * Visits the home, one product and the cart page the way a phone shopper
 * would, adds one item to the cart, and returns plain evidence (text blocks
 * with positions, the CTA region, widgets, region crops). No LLM here.
 *
 * Guardrails (FUD-PASS-DESIGN.md §3.2.1):
 * - one throwaway browser context per audit, so the cart dies with it;
 * - one item, quantity 1, first in-stock variant; never past the cart;
 * - analytics/ad collection hits are aborted, so the bot never shows up in
 *   the client's GA4/Meta/TikTok data or retargeting audiences — the tag
 *   scripts still load, only their hits are dropped;
 * - a user-agent suffix identifies the visit as ours.
 */

interface Profile {
  viewport: { width: number; height: number; deviceScaleFactor: number; isMobile?: boolean; hasTouch?: boolean };
  userAgent: string;
}
const MOBILE_PROFILE: Profile = {
  viewport: { width: 390, height: 844, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true },
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 OptimizersAudit/1.0",
};
const DESKTOP_PROFILE: Profile = {
  viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OptimizersAudit/1.0",
};
const MOBILE = MOBILE_PROFILE.viewport;
const NAV_TIMEOUT_MS = 25_000;
const TOTAL_TIMEOUT_MS = 170_000;
const DRAWER_WAIT_MS = 8_000;
const MAX_TEXT_PER_PAGE = 12_000;

// Collection endpoints only — gtm.js / gtag.js / fbevents.js themselves load.
export const BLOCKED_HITS: RegExp[] = [
  /\/g\/collect/,
  /\/j\/collect/,
  /google-analytics\.com\/(?:.*\/)?collect/,
  /analytics\.google\.com\/g\/collect/,
  /(?:www\.)?facebook\.com\/tr\b/,
  /analytics\.tiktok\.com\/api\//,
  /tr\.snapchat\.com\//,
  /ct\.pinterest\.com\//,
  /\.clarity\.ms\/collect/,
  /doubleclick\.net\/(?:pagead|activity|ccm)/,
  /google\.com\/(?:pagead|ccm)\/(?:conversion|collect|1p-conversion)/,
  /googleadservices\.com\/pagead\/conversion/,
  /klaviyo\.com\/(?:api\/)?(?:track|client\/events|onsite\/track)/,
  /hotjar\.(?:com|io)\/(?:api|c)\//,
  /snap\.licdn\.com\/li\.lms-analytics|px\.ads\.linkedin\.com/,
  // Shopify's own analytics (sessions and add-to-carts in the store admin)
  // and its customer-events pipeline.
  /monorail-edge\.shopifysvc\.com/,
  /\/\.well-known\/shopify\/monorail/,
  /\/api\/collect(?:\?|$)/,
  /shopify\.com\/.*\/produce(?:_batch)?/,
  // Server-side GTM / first-party GA4 endpoints and other common pixels.
  /[?&]en=(?:page_view|view_item|add_to_cart|begin_checkout|view_cart|scroll|user_engagement)/,
  /bat\.bing\.com\//,
  // Found by the leak audit on tharaa.shop (2026-10-13): Google Ads audience
  // pings fired by GA4, and Clarity's cookie-sync pixels.
  /\/ads\/ga-audiences/,
  /clarity\.ms\/c\.gif/,
  /c\.bing\.com\/c\.gif/,
  /twitter\.com\/i\/adsct|t\.co\/i\/adsct|analytics\.twitter\.com/,
  /omnisend\.com\/.*(?:track|events)/,
  /yandex\.(?:ru|com)\/(?:watch|clmap)/,
  /triplewhale|triplepixel/,
  /app\.posthog\.com\/(?:e|capture)/,
  /mixpanel\.com\/(?:track|engage)/,
  /segment\.(?:io|com)\/v1\/(?:t|p|track|page)/,
];

// Hosts and paths that carry analytics data. Anything matching this that was
// NOT aborted by BLOCKED_HITS is reported as a leak (StoreEvidence.leakedHits),
// so a tracker the blocklist doesn't know yet shows up in the run log instead
// of silently reaching the client's data. Scripts and documents don't count —
// loading gtm.js sends nothing.
const ANALYTICS_LIKE =
  /google-analytics\.com|analytics\.google\.com|[?&]tid=G-|\/collect\?|facebook\.com\/tr|tiktok\.com\/api|tr\.snapchat\.com|pinterest\.com\/v3|clarity\.ms|monorail|bat\.bing|doubleclick\.net|hotjar|klaviyo\.com\/(?:api|client)|omnisend|yandex\.(?:ru|com)\/watch|linkedin\.com\/px|adsct|triplewhale|posthog|mixpanel|segment\.io/;

export function isAnalyticsLike(url: string): boolean {
  return ANALYTICS_LIKE.test(url);
}

export function isBlockedHit(url: string): boolean {
  return BLOCKED_HITS.some(re => re.test(url));
}

// ---- browser-side scripts --------------------------------------------------
// Plain JS strings, not TS functions: tsx/esbuild wraps named functions in
// __name() helpers that don't exist inside the page, which breaks
// page.evaluate(fn). A string evaluates exactly as written.

const EXTRACT_JS = String.raw`
(function (rootSel, prefix, maxText) {
  var root = rootSel ? document.querySelector(rootSel) : document.body;
  if (!root) return null;
  var vw = window.innerWidth, vh = window.innerHeight, sy = window.scrollY;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, SVG: 1, HEAD: 1, IFRAME: 1 };
  function visible(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    if (r.right <= 0 || r.left >= vw) return null;
    var cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return null;
    return r;
  }
  function blockOf(node) {
    var el = node.parentElement;
    while (el && el !== root.parentElement) {
      if (SKIP[el.tagName]) return null;
      var d = getComputedStyle(el).display;
      if (d !== "inline" && d !== "contents") return el;
      el = el.parentElement;
    }
    return null;
  }
  var order = [], textOf = new Map();
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var n;
  while ((n = walker.nextNode())) {
    var t = (n.nodeValue || "").replace(/\s+/g, " ").trim();
    if (t.length < 2) continue;
    var el = blockOf(n);
    if (!el) continue;
    if (!textOf.has(el)) { textOf.set(el, []); order.push(el); }
    textOf.get(el).push(t);
  }
  var blocks = [], used = 0, i = 0;
  function push(el, text, tag) {
    var r = visible(el);
    if (!r) return;
    text = text.replace(/\s+/g, " ").trim().slice(0, 300);
    if (text.length < 2 || used > maxText) return;
    used += text.length;
    var id = prefix + (++i);
    el.setAttribute("data-fud", id);
    var y = Math.round(r.top + sy);
    blocks.push({ id: id, text: text, tag: tag, box: { x: Math.round(r.left), y: y, w: Math.round(r.width), h: Math.round(r.height) }, aboveFold: rootSel ? r.top < vh : y < vh });
  }
  for (var k = 0; k < order.length && blocks.length < 450; k++) push(order[k], textOf.get(order[k]).join(" "), order[k].tagName.toLowerCase());
  var icons = root.querySelectorAll("img[alt], svg[aria-label], [role=img][aria-label], img[title]");
  for (var m = 0; m < icons.length && blocks.length < 520; m++) {
    var ic = icons[m];
    var label = ic.getAttribute("alt") || ic.getAttribute("aria-label") || ic.getAttribute("title") || "";
    if (label.trim().length >= 2 && label.length <= 80) push(ic, label, "img");
  }

  // Primary CTA: add to cart on a product page, checkout in a cart.
  var ATC = /add to (cart|bag|basket)|buy (it )?now|order now|ajouter au panier|اضف|أضف|إضافة|اضافة|اشتر|اشتري|اطلب الآن|اطلب الان|إلى السلة|الى السلة/i;
  var CHECKOUT = /check ?out|proceed|complete order|إتمام|اتمام|الدفع|ادفع|متابعة|إكمال|اكمال/i;
  var want = rootSel || /cart/.test(location.pathname) ? CHECKOUT : ATC;
  var best = null, bestArea = 0;
  var cands = root.querySelectorAll("button, input[type=submit], input[type=button], a, [role=button]");
  for (var c = 0; c < cands.length; c++) {
    var b = cands[c];
    var label2 = (b.innerText || b.value || b.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
    var cls = (b.className && b.className.baseVal === undefined ? b.className : "") + " " + (b.getAttribute("name") || "");
    var hit = (label2.length <= 60 && want.test(label2)) || (want === ATC && /add-to-cart|addtocart|single_add_to_cart|product-form__submit|btn-cart|\badd\b/i.test(cls));
    if (!hit) continue;
    var r2 = visible(b);
    if (!r2) continue;
    var area = r2.width * r2.height;
    if (area > bestArea) { best = { el: b, r: r2, label: label2 }; bestArea = area; }
  }
  var cta = null;
  if (best) {
    best.el.setAttribute("data-fud-cta", "1");
    var cy = Math.round(best.r.top + sy), ch = Math.round(best.r.height);
    var near = blocks.filter(function (bl) { return bl.box.y + bl.box.h >= cy - 220 && bl.box.y <= cy + ch + 220; }).map(function (bl) { return bl.id; });
    cta = { text: best.label.slice(0, 80), box: { x: Math.round(best.r.left), y: cy, w: Math.round(best.r.width), h: ch }, disabled: !!(best.el.disabled || best.el.getAttribute("aria-disabled") === "true" || /disabled|sold.?out/i.test(best.el.className || "")), nearbyBlockIds: near };
  }

  // schema.org essentials.
  var ld = { types: [] };
  var walk = function (o) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    var ty = o["@type"];
    if (ty) [].concat(ty).forEach(function (x) { if (ld.types.indexOf(x) < 0) ld.types.push(String(x)); });
    var ar = o.aggregateRating;
    if (ar && ld.ratingValue === undefined) { ld.ratingValue = parseFloat(ar.ratingValue) || undefined; ld.reviewCount = parseInt(ar.reviewCount || ar.ratingCount, 10) || undefined; }
    var of = o.offers;
    if (of && !ld.availability) { var o1 = [].concat(of)[0]; if (o1 && o1.availability) ld.availability = String(o1.availability).replace(/^https?:\/\/schema\.org\//, ""); }
    if (o["@graph"]) walk(o["@graph"]);
  };
  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) { try { walk(JSON.parse(s.textContent || "")); } catch (e) {} });

  // Policy / identity links, anywhere on the page (usually the footer).
  var KINDS = [
    ["returns", /return|refund|exchange|الاسترجاع|الاسترداد|الاستبدال|ارجاع|إرجاع/i],
    ["shipping", /shipping|delivery|الشحن|التوصيل/i],
    ["contact", /contact|تواصل|اتصل/i],
    ["about", /about|our story|who we are|من نحن|قصتنا|عن المتجر|عنا/i],
    ["faq", /faq|questions|الأسئلة|الاسئلة|اسئلة/i],
  ];
  var links = [], seen = {};
  document.querySelectorAll("a[href]").forEach(function (a) {
    var txt = (a.innerText || a.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
    var href = a.getAttribute("href") || "";
    if (!txt || txt.length > 60 || /^(javascript|mailto|tel):/.test(href) && !/mailto|tel/.test(href)) return;
    for (var q = 0; q < KINDS.length; q++) {
      var kind = KINDS[q][0];
      if ((seen[kind] || 0) >= 2) continue;
      if (KINDS[q][1].test(txt) || KINDS[q][1].test(href)) { seen[kind] = (seen[kind] || 0) + 1; links.push({ kind: kind, text: txt.slice(0, 60), href: href.slice(0, 200) }); break; }
    }
  });

  // Variant controls on a product page.
  var SIZE = /size|sizes|المقاس|مقاس|القياس|المقاسات/i;
  var form = document.querySelector('form[action*="/cart/add"], form.cart, form.variations_form, product-form form') || document;
  var groups = [], hasSize = false, control = "none";
  form.querySelectorAll("select").forEach(function (s) {
    var lab = (s.getAttribute("name") || "") + " " + (s.getAttribute("aria-label") || "") + " " + (s.id ? ((document.querySelector('label[for="' + s.id + '"]') || {}).innerText || "") : "");
    if (s.options.length < 2) return;
    groups.push(lab.trim().slice(0, 40) || "select");
    if (SIZE.test(lab) || [].some.call(s.options, function (op) { return /^(xs|s|m|l|xl|xxl|\d{2})$/i.test(op.text.trim()); })) { hasSize = true; if (control === "none") control = "dropdown"; }
  });
  var radioNames = {};
  form.querySelectorAll("input[type=radio]").forEach(function (r3) { radioNames[r3.name] = radioNames[r3.name] || []; radioNames[r3.name].push(r3); });
  Object.keys(radioNames).forEach(function (name) {
    var fs = radioNames[name][0].closest("fieldset");
    var lab = name + " " + (fs && fs.querySelector("legend") ? fs.querySelector("legend").innerText : "");
    groups.push(lab.trim().slice(0, 40));
    var vals = radioNames[name].map(function (r4) { return r4.value; }).join(" ");
    if (SIZE.test(lab) || /\b(xs|s|m|l|xl|xxl)\b/i.test(vals)) { hasSize = true; control = "pills"; }
  });

  // Collection/listing pages: what each product card shows.
  var listing = null;
  var seenHref = {}, cards = [];
  // A product's handle: the same product is often linked both as
  // /products/x and /collections/all/products/x.
  function handleOf(el) {
    var h = (el.getAttribute("href") || "").split("?")[0].split("#")[0].replace(/\/$/, "");
    var m = h.match(/\/products?\/([^\/]+)$/);
    return m ? m[1] : "";
  }
  document.querySelectorAll('a[href*="/products/"], a[href*="/product/"]').forEach(function (a) {
    var href = handleOf(a);
    if (!href || seenHref[href]) return;
    // The card is the largest ancestor that still holds only this product:
    // climb until the parent would also contain a different product's link.
    var card = a, up = a.parentElement, depth = 0;
    while (up && up !== document.body && depth < 8) {
      var other = false, ls = up.querySelectorAll('a[href*="/products/"], a[href*="/product/"]');
      for (var z = 0; z < ls.length; z++) {
        var oh = handleOf(ls[z]);
        if (oh && oh !== href) { other = true; break; }
      }
      if (other) break;
      card = up; up = up.parentElement; depth++;
    }
    if (!card || card === a || !visible(card)) return;
    var r5 = card.getBoundingClientRect();
    if (r5.height < 80 || r5.height > 1400) return;
    seenHref[href] = 1;
    cards.push(card);
  });
  if (cards.length >= 4) {
    var PRICE = /\d[\d,.]*\s?(?:egp|le|l\.e|ج\.?\s?م|جنيه|sar|ر\.?\s?س|ريال|aed|د\.?\s?إ|درهم|kwd|qar|usd|\$|€|£)|(?:egp|le|l\.e|sar|aed|kwd|qar|usd|\$|€|£)\s?\d/i;
    var QUICK = /add to (cart|bag|basket)|quick (add|buy|shop|view)|choose options|select options|buy now|اضف|أضف|إضافة|اضافة|اشتر|اختر|اختاري|عرض سريع/i;
    var withPrice = 0, withRating = 0, quickAdd = 0, labels = {};
    cards.forEach(function (c2) {
      var txt = c2.innerText || "";
      if (PRICE.test(txt)) withPrice++;
      if (/★|⭐/.test(txt) || c2.querySelector('[class*="rating" i], [class*="star" i], [class*="review" i], [class*="jdgm" i], [class*="loox" i], [class*="yotpo" i]')) withRating++;
      var btn = [].filter.call(c2.querySelectorAll("button, a, [role=button], input[type=submit]"), function (b2) {
        var l = (b2.innerText || b2.value || b2.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
        return l.length <= 40 && QUICK.test(l);
      })[0];
      if (btn) { quickAdd++; labels[(btn.innerText || btn.value || btn.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().toLowerCase()] = 1; }
    });
    var FILTER = /filter|refine|فلتر|تصفية|فلترة|تصفيه/i, SORT = /sort|ترتيب|فرز|رتب/i;
    var hasFilter = false, hasSort = false;
    document.querySelectorAll("button, summary, select, label, [role=button], facet-filters-form").forEach(function (el2) {
      var l2 = ((el2.innerText || "").slice(0, 60) + " " + (el2.getAttribute("aria-label") || "") + " " + (el2.getAttribute("name") || "") + " " + (typeof el2.className === "string" ? el2.className : "")).toLowerCase();
      if (!visible(el2)) return;
      if (FILTER.test(l2)) hasFilter = true;
      if (SORT.test(l2)) hasSort = true;
    });
    var firstTop = Math.min.apply(null, cards.map(function (c3) { return c3.getBoundingClientRect().top + sy; }));
    var pills = 0, pillSeen = {};
    document.querySelectorAll('a[href*="/collections/"], a[href*="/product-category/"], a[href*="/category/"]').forEach(function (a2) {
      var r6 = visible(a2);
      if (!r6) return;
      var top = r6.top + sy, h2 = a2.getAttribute("href");
      var l3 = (a2.innerText || "").trim();
      if (top > 140 && top < firstTop && l3.length > 1 && l3.length <= 30 && !pillSeen[h2]) { pillSeen[h2] = 1; pills++; }
    });
    listing = { cards: cards.length, withPrice: withPrice, withRating: withRating, quickAdd: quickAdd, quickAddLabels: Object.keys(labels).slice(0, 6), hasFilter: hasFilter, hasSort: hasSort, pills: pills };
  }

  var srcs = [].map.call(document.scripts, function (s) { return s.src || ""; }).join(" ");
  return {
    listing: listing,
    title: document.title || "",
    blocks: blocks,
    cta: cta,
    jsonLd: ld,
    policyLinks: links,
    variants: { hasSize: hasSize, control: control, groups: groups.slice(0, 6) },
    html: (srcs + " " + document.documentElement.outerHTML).slice(0, 1500000),
  };
})`;

const SELECT_VARIANTS_JS = String.raw`
(function () {
  var form = document.querySelector('form[action*="/cart/add"], form.cart, form.variations_form, product-form form') || document;
  var changed = 0;
  form.querySelectorAll("select").forEach(function (s) {
    var cur = s.options[s.selectedIndex];
    if (cur && cur.value && !cur.disabled) return;
    for (var i = 0; i < s.options.length; i++) {
      var op = s.options[i];
      if (op.value && !op.disabled && !/sold.?out|out of stock|نفذ|غير متوفر/i.test(op.text)) {
        s.selectedIndex = i;
        s.dispatchEvent(new Event("change", { bubbles: true }));
        changed++;
        break;
      }
    }
  });
  var names = {};
  form.querySelectorAll("input[type=radio]").forEach(function (r) { (names[r.name] = names[r.name] || []).push(r); });
  Object.keys(names).forEach(function (n) {
    var list = names[n];
    if (list.some(function (r) { return r.checked && !r.disabled; })) return;
    var pick = list.filter(function (r) { return !r.disabled; })[0];
    if (pick) { (document.querySelector('label[for="' + pick.id + '"]') || pick).click(); changed++; }
  });
  return changed;
})()`;

const CLICK_CTA_JS = String.raw`
(function () {
  var el = document.querySelector("[data-fud-cta]");
  if (!el) return "no_cta";
  if (el.disabled || el.getAttribute("aria-disabled") === "true") return "disabled";
  el.scrollIntoView({ block: "center" });
  el.click();
  return "clicked";
})()`;

// Run BEFORE the click: remembers which big fixed panels were already on
// screen (cookie bars, chat windows, sticky add-to-cart bars), so the generic
// drawer search below only considers panels the click itself opened.
const MARK_PRE_JS = String.raw`
(function () {
  var n = 0;
  document.querySelectorAll("body *").forEach(function (el) {
    var cs = getComputedStyle(el);
    if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") return;
    var r = el.getBoundingClientRect();
    if (r.width < 150 || r.height < 200 || r.right <= 0 || r.left >= innerWidth || r.bottom <= 0 || r.top >= innerHeight) return;
    el.setAttribute("data-fud-pre", "1");
    n++;
  });
  return n;
})()`;

// A cart drawer, found two ways: by the names themes give it, and — because
// every theme names it differently (tharaa.shop's Kalles theme calls it
// #t4s-mini_cart, which the first version of this list missed) — by what it
// is: a large fixed panel that appeared after the click and reads like a
// cart. Only counts once it has finished sliding in.
const FIND_DRAWER_JS = String.raw`
(function () {
  var vw = innerWidth, vh = innerHeight;
  var SELS = ['cart-drawer', '#CartDrawer', '#cart-drawer', '.cart-drawer', '.drawer--cart', '.mini-cart', '.minicart', '.side-cart', '#sidebar-cart', '.cart-sidebar', '.offcanvas-cart', '.widget_shopping_cart', '.xoo-wsc-modal', '.wc-block-mini-cart__drawer', '#slideout-cart', '[id*="cart-drawer" i]', '[class*="cart-drawer" i]', '[class*="CartDrawer"]', '[id*="mini-cart" i]', '[class*="mini-cart" i]', '[id*="mini_cart" i]', '[class*="mini_cart" i]', '[id*="minicart" i]', '[class*="minicart" i]', '[class*="side-cart" i]', '[class*="drawer" i][class*="cart" i]', '[id*="cart" i][class*="drawer" i]', '[role="dialog"]'];
  var CARTY = /cart|basket|bag|سلة|السلة|checkout|subtotal|المجموع|الإجمالي|الاجمالي|إتمام|اتمام|إكمال الطلب|اكمال الطلب/i;
  function ok(el) {
    var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width < 150 || r.height < 200) return false;
    // Settled: fully slid into the viewport, not mid-animation.
    if (r.left < -8 || r.right > vw + 8 || r.bottom <= 0 || r.top >= vh) return false;
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.1) return false;
    var t = el.innerText || "";
    return t.length >= 10 && CARTY.test(t);
  }
  function take(el) {
    document.querySelectorAll("[data-fud-root]").forEach(function (x) { x.removeAttribute("data-fud-root"); });
    el.setAttribute("data-fud-root", "1");
    return true;
  }
  for (var i = 0; i < SELS.length; i++) {
    var els = document.querySelectorAll(SELS[i]);
    for (var j = 0; j < els.length; j++) if (ok(els[j])) return take(els[j]);
  }
  // Generic: a new fixed panel covering a good part of the screen.
  var best = null, bestLen = 0;
  document.querySelectorAll("body *").forEach(function (el) {
    if (el.hasAttribute("data-fud-pre")) return;
    if (getComputedStyle(el).position !== "fixed") return;
    var r = el.getBoundingClientRect();
    if (r.width < vw * 0.55 || r.height < vh * 0.45) return;
    if (!ok(el)) return;
    var len = (el.innerText || "").length;
    if (len > bestLen) { best = el; bestLen = len; }
  });
  return best ? take(best) : false;
})()`;

const EMPTY_CART = /your (?:cart|bag|basket) is (?:currently )?empty|cart is empty|no items in (?:your )?cart|السلة فارغة|سلة التسوق فارغة|سلتك فارغة|لا توجد منتجات|عربة التسوق فارغة/i;
const BOT_WALL = /just a moment|attention required|access denied|are you a robot|captcha|verify you are human|request blocked/i;

// ---- node side -------------------------------------------------------------

interface Extracted {
  title: string;
  blocks: TextBlock[];
  cta: PageEvidence["cta"] | null;
  jsonLd: PageEvidence["jsonLd"];
  policyLinks: PageEvidence["policyLinks"];
  variants: NonNullable<PageEvidence["variants"]>;
  listing: PageEvidence["listing"] | null;
  html: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface HitCounter {
  blocked: number;
  leaked: string[];
}

async function preparePage(browserContext: Awaited<ReturnType<Browser["createBrowserContext"]>>, counter: HitCounter, profile: Profile): Promise<Page> {
  const page = await browserContext.newPage();
  await page.setViewport(profile.viewport);
  await page.setUserAgent(profile.userAgent);
  await page.setRequestInterception(true);
  page.on("request", req => {
    if (req.isInterceptResolutionHandled()) return;
    const url = req.url();
    if (isBlockedHit(url)) {
      counter.blocked++;
      req.abort("blockedbyclient").catch(() => {});
      return;
    }
    const type = req.resourceType();
    if (type !== "script" && type !== "document" && type !== "stylesheet" && type !== "font" && isAnalyticsLike(url) && counter.leaked.length < 40) {
      counter.leaked.push(`${type} ${url.slice(0, 160)}`);
    }
    req.continue().catch(() => {});
  });
  return page;
}

async function settle(page: Page): Promise<void> {
  await sleep(2500);
  // Close the newsletter/cookie popup most stores open on first visit, so
  // the crops show the page and not the popup.
  await page.keyboard.press("Escape").catch(() => {});
  await page
    .evaluate(String.raw`(async function () {
      var end = Math.min(document.documentElement.scrollHeight, 6000);
      for (var y = 0; y < end; y += 600) { window.scrollTo(0, y); await new Promise(function (r) { setTimeout(r, 150); }); }
      window.scrollTo(0, 0);
    })()`)
    .catch(() => {});
  await sleep(600);
}

async function extract(page: Page, rootSel: string | null, prefix: string): Promise<Extracted | null> {
  return (await page.evaluate(`${EXTRACT_JS}(${JSON.stringify(rootSel)}, ${JSON.stringify(prefix)}, ${MAX_TEXT_PER_PAGE})`)) as Extracted | null;
}

async function crop(page: Page, clip: { x: number; y: number; width: number; height: number }): Promise<string | undefined> {
  try {
    const b64 = await page.screenshot({ type: "jpeg", quality: 58, encoding: "base64", captureBeyondViewport: true, clip });
    return `data:image/jpeg;base64,${b64}`;
  } catch {
    return undefined;
  }
}

function toEvidence(pageType: FudPageType, url: string, x: Extracted): PageEvidence {
  return {
    pageType,
    url,
    loaded: true,
    title: x.title.slice(0, 120),
    blocks: x.blocks,
    cta: x.cta ?? undefined,
    widgets: widgetsIn(x.html),
    jsonLd: x.jsonLd,
    policyLinks: x.policyLinks,
    variants: pageType === "product" ? x.variants : undefined,
    listing: pageType === "collection" ? x.listing ?? undefined : undefined,
    crops: {},
  };
}

function failed(pageType: FudPageType, url: string, note: string): PageEvidence {
  return { pageType, url, loaded: false, note, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {} };
}

async function visit(page: Page, pageType: FudPageType, url: string, prefix: string, withCrops = true): Promise<PageEvidence> {
  // One retry: a single dropped connection (seen as net::ERR_NO_BUFFER_SPACE
  // on Windows) shouldn't cost a whole page's rules.
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
      break;
    } catch (err) {
      if (attempt >= 2) return failed(pageType, url, `did not load: ${err instanceof Error ? err.message.slice(0, 120) : String(err)}`);
      await sleep(2000);
    }
  }
  await settle(page);
  const x = await extract(page, null, prefix).catch(() => null);
  if (!x) return failed(pageType, url, "could not read the page");
  if (BOT_WALL.test(x.title) && x.blocks.length < 15) return failed(pageType, url, "blocked by a bot check");
  const ev = toEvidence(pageType, page.url(), x);
  if (!withCrops) return ev;
  ev.crops.fold = await crop(page, { x: 0, y: 0, width: MOBILE.width, height: MOBILE.height });
  if (ev.cta) {
    const top = Math.max(0, ev.cta.box.y - 280);
    ev.crops.cta = await crop(page, { x: 0, y: top, width: MOBILE.width, height: Math.min(720, ev.cta.box.h + 560) });
  }
  return ev;
}

function isEmptyCart(ev: PageEvidence): boolean {
  return EMPTY_CART.test(ev.blocks.map(b => b.text).join(" ")) || ev.blocks.length < 3;
}

/** Adds the product to the cart and captures the drawer, or the cart page as fallback. */
async function addToCartAndCapture(
  page: Page,
  product: PageEvidence | undefined,
  cartUrl: string,
): Promise<{ cart: PageEvidence; atc: StoreEvidence["addToCart"] }> {
  let atc: StoreEvidence["addToCart"] = { attempted: false, ok: false, reason: "no product page" };

  if (product?.loaded && product.cta) {
    atc = { attempted: true, ok: false };
    await page.evaluate(SELECT_VARIANTS_JS).catch(() => 0);
    await sleep(600);
    await page.evaluate(MARK_PRE_JS).catch(() => 0);
    const clicked = (await page.evaluate(CLICK_CTA_JS).catch(() => "error")) as string;
    if (clicked !== "clicked") {
      atc.reason = clicked === "disabled" ? "atc_disabled_or_out_of_stock" : "atc_not_clickable";
    } else {
      const start = Date.now();
      // Path only: picking a variant often appends ?variant=… to the URL,
      // which is not a navigation away from the product page.
      const pathOf = (u: string) => {
        try {
          const x = new URL(u);
          return x.origin + x.pathname;
        } catch {
          return u;
        }
      };
      const before = pathOf(page.url());
      let drawer = false;
      while (Date.now() - start < DRAWER_WAIT_MS) {
        await sleep(500);
        if (pathOf(page.url()) !== before) break;
        drawer = (await page.evaluate(FIND_DRAWER_JS).catch(() => false)) as boolean;
        if (drawer) break;
      }
      if (drawer) {
        await sleep(1200);
        const x = await extract(page, "[data-fud-root]", "c").catch(() => null);
        if (x && x.blocks.length > 0) {
          const ev = toEvidence("cart", page.url(), x);
          ev.cart = { source: "drawer", empty: isEmptyCart(ev) };
          ev.note = "cart drawer";
          ev.crops.cart = await crop(page, { x: 0, y: await page.evaluate("window.scrollY") as number, width: MOBILE.width, height: MOBILE.height });
          atc = ev.cart.empty ? { attempted: true, ok: false, reason: "atc_drawer_empty" } : { attempted: true, ok: true };
          if (!ev.cart.empty) return { cart: ev, atc };
        }
      } else if (pathOf(page.url()) === before) {
        atc.reason = "atc_no_drawer";
      }
    }
  }

  // Cart page: with the item in it if the click worked, empty otherwise.
  const ev = await visit(page, "cart", cartUrl, "c");
  if (ev.loaded) {
    ev.cart = { source: "page", empty: isEmptyCart(ev) };
    ev.crops.cart = ev.crops.fold;
    if (!ev.cart.empty) atc = { attempted: atc.attempted, ok: true };
    else ev.note = "cart page was empty";
  }
  return { cart: ev, atc };
}

export interface CollectOptions {
  // Also visit home + product at 1440px (no cart, no crops) so position-
  // sensitive rules can say whether desktop differs. Default true.
  desktop?: boolean;
}

export async function collectStoreEvidence(website: string, discoveredPages: string[], opts: CollectOptions = {}): Promise<StoreEvidence> {
  const startedAt = Date.now();
  const homepage = discoveredPages[0] ?? website;
  const productUrl = discoveredPages.find(u => pageTypeOf(u, homepage) === "product");
  const collectionUrl = discoveredPages.find(u => pageTypeOf(u, homepage) === "collection");
  let cartUrl = discoveredPages.find(u => pageTypeOf(u, homepage) === "cart");
  if (!cartUrl) {
    try {
      cartUrl = new URL("/cart", homepage).toString();
    } catch {
      cartUrl = homepage;
    }
  }

  const executablePath = findChrome();
  if (!executablePath) throw new Error("no Chrome/Chromium found — set CHROME_PATH");

  const counter: HitCounter = { blocked: 0, leaked: [] };
  let browser: Browser | undefined;
  const work = (async (): Promise<StoreEvidence> => {
    browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"] });
    // Throwaway context: no cookies in, nothing kept after close().
    const context = await browser.createBrowserContext();
    const page = await preparePage(context, counter, MOBILE_PROFILE);
    const pages: PageEvidence[] = [];

    pages.push(await visit(page, "home", homepage, "h"));
    const product = productUrl ? await visit(page, "product", productUrl, "p") : failed("product", homepage, "no product page found on the site");
    pages.push(product);
    const { cart, atc } = await addToCartAndCapture(page, product, cartUrl!);
    pages.push(cart);
    // After the cart, so a slow listing page can never cost the cart rules.
    pages.push(collectionUrl ? await visit(page, "collection", collectionUrl, "l") : failed("collection", homepage, "no collection page found on the site"));
    await context.close().catch(() => {});

    // Desktop: text and positions only, in its own throwaway context.
    let desktop: PageEvidence[] | undefined;
    if (opts.desktop !== false) {
      try {
        const dctx = await browser.createBrowserContext();
        const dpage = await preparePage(dctx, counter, DESKTOP_PROFILE);
        desktop = [await visit(dpage, "home", homepage, "dh", false)];
        if (productUrl) desktop.push(await visit(dpage, "product", productUrl, "dp", false));
        await dctx.close().catch(() => {});
      } catch {
        desktop = undefined;
      }
    }

    return { website, pages, desktop, addToCart: atc, blockedHits: counter.blocked, leakedHits: counter.leaked, durationMs: Date.now() - startedAt };
  })();
  // On timeout the race below rejects first and closes the browser, which
  // makes `work` reject later — swallow that so it isn't an unhandled rejection.
  work.catch(() => {});

  try {
    return await Promise.race([
      work,
      sleep(TOTAL_TIMEOUT_MS).then(() => {
        throw new Error(`collector timed out after ${TOTAL_TIMEOUT_MS / 1000}s`);
      }),
    ]);
  } finally {
    await (browser as Browser | undefined)?.close().catch(() => {});
  }
}
