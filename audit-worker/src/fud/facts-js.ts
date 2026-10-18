/**
 * Browser-side scripts for the page facts the CRO rules need beyond text:
 * navigation, search, product media, sticky buttons, popups, language.
 * Plain JS strings for the same reason as collect.ts's EXTRACT_JS: tsx
 * wraps named TS functions in __name() helpers that don't exist inside the
 * page, so page.evaluate(fn) would break.
 */

// Popups/overlays on screen right now. Run once before Escape (what the
// shopper meets) and once after (does Escape close them?).
export const POPUPS_JS = String.raw`
(function () {
  var vw = innerWidth, vh = innerHeight, found = [];
  document.querySelectorAll("body *").forEach(function (el) {
    var cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "absolute") return;
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.2) return;
    var r = el.getBoundingClientRect();
    var w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)), h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    var cover = (w * h) / (vw * vh);
    var txt = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (txt.length < 8) return;
    var cookie = /cookie|cookies|كوكيز|ملفات تعريف الارتباط|ملفات الارتباط/i.test(txt);
    // Big overlay (modal) or a cookie bar; ignore sticky headers/footers.
    if (!(cover >= 0.3 || (cookie && cover >= 0.05))) return;
    if (found.some(function (f) { return f.el.contains(el) || el.contains(f.el); })) {
      // keep the outermost
      found = found.filter(function (f) { return !el.contains(f.el); });
      if (found.some(function (f) { return f.el.contains(el); })) return;
    }
    var kind = cookie ? "cookie" : el.querySelector('input[type="email"], input[name*="mail" i]') ? "email" : /\d+\s?%|off\b|discount|coupon|خصم|كوبون|كود/i.test(txt) ? "discount" : /whatsapp|واتساب/i.test(txt) ? "whatsapp" : "other";
    found.push({ el: el, kind: kind, cover: Math.round(cover * 100), text: txt.slice(0, 120) });
  });
  return found.slice(0, 6).map(function (f) { return { kind: f.kind, cover: f.cover, text: f.text }; });
})()`;

// Sticky Add-to-Cart: scroll well past the main button and look for a fixed
// or sticky element holding a buy button.
export const STICKY_JS = String.raw`
(async function () {
  var ATC = /add to (cart|bag|basket)|buy (it )?now|order now|اضف|أضف|إضافة|اضافة|اشتر|اطلب/i;
  var y = Math.min(document.documentElement.scrollHeight * 0.55, 3200);
  window.scrollTo(0, y);
  await new Promise(function (r) { setTimeout(r, 900); });
  var hit = null;
  document.querySelectorAll("body *").forEach(function (el) {
    if (hit) return;
    var cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") return;
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.2) return;
    var r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight || r.width < 120) return;
    var btn = [].filter.call(el.querySelectorAll("button, a, input[type=submit], [role=button]"), function (b) {
      var l = (b.innerText || b.value || b.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      var br = b.getBoundingClientRect();
      return l.length <= 40 && ATC.test(l) && br.width > 40 && br.height > 20 && br.bottom > 0 && br.top < innerHeight;
    })[0];
    if (btn) hit = (btn.innerText || btn.value || "").replace(/\s+/g, " ").trim().slice(0, 40);
  });
  window.scrollTo(0, 0);
  await new Promise(function (r) { setTimeout(r, 300); });
  return hit;
})()`;

// Everything else, read once per page after it has settled.
export const FACTS_JS = String.raw`
(function () {
  var vw = innerWidth, vh = innerHeight, sy = window.scrollY;
  function vis(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.right <= 0 || r.left >= vw) return null;
    var cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return null;
    return r;
  }
  function label(el) { return (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\s+/g, " ").trim(); }
  var html = document.documentElement;

  // Language
  var hreflang = [].map.call(document.querySelectorAll('link[rel="alternate"][hreflang]'), function (l) { return l.getAttribute("hreflang"); }).slice(0, 8);
  var langSwitch = [].some.call(document.querySelectorAll("a[href], button"), function (a) {
    var t = label(a).toLowerCase(), h = (a.getAttribute("href") || "").toLowerCase();
    return /^(english|en|eng|عربي|العربية|ar|arabic)$/.test(t) || /^\/(ar|en)(\/|$)|[?&](locale|lang)=/.test(h);
  });

  // Headings
  var h1s = [].filter.call(document.querySelectorAll("h1"), function (h) { return vis(h); }).map(function (h) { return label(h).slice(0, 120); }).filter(Boolean);

  // Navigation: top-level links in the header/main nav.
  var header = document.querySelector("header, [role=banner], #header, .header, .site-header") || document.body;
  var NOT_NAV = /cart|bag|basket|account|login|log in|sign in|search|wishlist|سلة|السلة|حسابي|تسجيل|دخول|بحث|المفضلة|^\s*$/i;
  var navSeen = {}, nav = [];
  header.querySelectorAll("nav a, [role=navigation] a, .menu a, .nav a, ul a").forEach(function (a) {
    var r = vis(a);
    if (!r || r.top + sy > 260) return; // top-level row only
    var t = label(a);
    if (t.length < 2 || t.length > 32 || NOT_NAV.test(t) || navSeen[t]) return;
    navSeen[t] = 1;
    nav.push(t);
  });

  // Search
  // The text box itself, not the hidden inputs search forms carry.
  var sInput = [].filter.call(document.querySelectorAll('input[type="search"], input[name="q"], input[name="s"], [role="search"] input, form[action*="search"] input'), function (i) {
    var t = (i.getAttribute("type") || "text").toLowerCase();
    return (t === "search" || t === "text") && (i.getAttribute("name") || "").indexOf("[") < 0;
  })[0] || null;
  var sForm = sInput ? sInput.closest("form") : document.querySelector('form[action*="search"], form[role="search"]');
  var sIcon = [].some.call(document.querySelectorAll('a[href*="search"], button, [role=button]'), function (b) { return /search|بحث/i.test(label(b) + " " + (b.getAttribute("href") || "") + " " + (typeof b.className === "string" ? b.className : "")) && vis(b); });
  var search = {
    present: !!(sInput || sForm || sIcon),
    visible: !!((sInput && vis(sInput)) || sIcon),
    action: sForm ? (sForm.getAttribute("action") || "") : "",
    param: sInput ? (sInput.getAttribute("name") || "q") : "q",
  };

  // Product media
  var srcSeen = {}, images = 0;
  document.querySelectorAll("main img, #MainContent img, [class*='product' i] img, img").forEach(function (img) {
    var r = img.getBoundingClientRect();
    if (r.top + sy > 2200 || img.closest("header, footer, nav")) return;
    var src = img.currentSrc || img.src || img.getAttribute("data-src") || "";
    var key = src.split("?")[0].replace(/_(\d+x\d*|\d*x\d+)(?=\.)/, "");
    if (!key || srcSeen[key]) return;
    var w = Math.max(r.width, img.naturalWidth > 0 ? Math.min(img.naturalWidth, 600) / 3 : 0);
    if (w < 60) return;
    srcSeen[key] = 1;
    images++;
  });
  var video = !!document.querySelector('main video, [class*="product" i] video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="tiktok"], [class*="video" i] iframe');
  var zoom = !!document.querySelector('[class*="zoom" i], [class*="lightbox" i], [class*="photoswipe" i], [class*="fancybox" i], [data-zoom], [class*="pswp" i]');

  // Organised product info
  var details = document.querySelectorAll("main details, details").length;
  var expanders = [].filter.call(document.querySelectorAll("main [aria-expanded], [class*='accordion' i], [class*='collapsible' i], [role=tab]"), function (e) { return !e.closest("header, nav, footer"); }).length;

  // First screen: buttons and the hero image
  var heroButtons = [];
  document.querySelectorAll("a, button").forEach(function (b) {
    if (b.closest("header, nav, [role=banner]") || b.querySelector("img, picture")) return;
    var r = vis(b);
    if (!r || r.top + sy > vh || r.height < 30 || r.width < 70) return;
    var cs = getComputedStyle(b);
    var filled = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
    var bordered = parseFloat(cs.borderTopWidth) >= 1;
    var t = label(b);
    if ((filled || bordered) && t.length >= 2 && t.length <= 40) heroButtons.push(t);
  });
  var hero = null, heroArea = 0;
  document.querySelectorAll("img, video, picture").forEach(function (m) {
    var r = vis(m);
    if (!r || r.top + sy > vh) return;
    var a = r.width * Math.min(r.height, vh);
    if (a > heroArea) { heroArea = a; hero = m; }
  });
  var heroSrc = hero ? (hero.currentSrc || hero.src || (hero.querySelector && hero.querySelector("img") ? hero.querySelector("img").src : "") || "") : "";

  // Email / phone capture
  var emailInputs = [].filter.call(document.querySelectorAll('input[type="email"], input[name*="email" i], input[name*="contact[email]" i]'), function (i) { return !i.closest("[data-fud-root]"); });
  var emailCapture = emailInputs.length > 0;
  var phoneCapture = !!document.querySelector('input[type="tel"]:not([form]), input[name*="phone" i]');
  var account = [].some.call(document.querySelectorAll("a[href]"), function (a) { return /\/account|\/login|\/my-account|\/sign-in|\/auth\//i.test(a.getAttribute("href") || ""); });

  // WhatsApp / phone links anywhere on the page (W-07, GTM-11).
  var contact = [];
  document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href^="whatsapp:"], a[href^="tel:"]').forEach(function (a) {
    var h = (a.getAttribute("href") || "").slice(0, 160);
    if (h && contact.indexOf(h) < 0 && contact.length < 10) contact.push(h);
  });
  // "Sold out" badges in the first one and a half screens (W-08).
  var soldOut = 0;
  var SOLD = /^(sold ?out|out of stock|نفد(ت)?( الكمية)?|نفذت الكمية|غير متوفر|نفدت من المخزون)$/i;
  document.querySelectorAll("span, div, p, small, strong, label").forEach(function (el) {
    if (el.children.length > 1) return;
    var t = (el.innerText || "").trim();
    if (!t || t.length > 30 || !SOLD.test(t)) return;
    var r = vis(el);
    if (r && r.top + sy < vh * 1.5) soldOut++;
  });

  return {
    contactLinks: contact,
    soldOutTop: soldOut,
    lang: (html.getAttribute("lang") || "").slice(0, 10),
    dir: (html.getAttribute("dir") || getComputedStyle(document.body).direction || "").slice(0, 4),
    hreflang: hreflang,
    langSwitch: langSwitch,
    h1: h1s.slice(0, 3),
    h1Count: h1s.length,
    nav: nav.slice(0, 20),
    search: search,
    media: { images: images, video: video, zoom: zoom },
    infoSections: { details: details, expanders: expanders },
    heroButtons: heroButtons.slice(0, 6),
    hero: hero ? { kind: hero.tagName.toLowerCase(), src: heroSrc.slice(0, 200), alt: (hero.getAttribute && hero.getAttribute("alt") || "").slice(0, 120), coverPct: Math.round((heroArea / (vw * vh)) * 100) } : null,
    capture: { email: emailCapture, phone: phoneCapture, account: account },
  };
})()`;
