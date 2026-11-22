/**
 * Browser-side scripts for the page facts the CRO rules need beyond text:
 * navigation, search, product media, sticky buttons, popups, language.
 * Plain JS strings for the same reason as collect.ts's EXTRACT_JS: tsx
 * wraps named TS functions in __name() helpers that don't exist inside the
 * page, so page.evaluate(fn) would break.
 */

// Lorem ipsum and other template text (TRUST-09). Also run on text blocks by
// the rule itself, so the page read and the rule agree.
export const PLACEHOLDER_SOURCE =
  "lorem ipsum|dolor sit amet|consectetur adipiscing|your (?:store|company|brand|shop) name here|your (?:text|address|content|description|title|email) here|dummy (?:text|content)|placeholder (?:text|title|content|description)|insert (?:your )?text|add your (?:text|content) here|click here to edit|enter your (?:text|content) here|example\\.(?:com|org)\\b|yourdomain\\.|yourstore\\.|\\b123 main st|john doe|jane doe|demo store|\\bnote: this is a demo|نص تجريبي|لوريم ايبسوم|لوريم إيبسوم";

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

  // ---- Round 23: facts for the master-point rules ----
  function bx(r) { return { x: Math.round(r.left), y: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height) }; }
  function attr(el, n) { return (el.getAttribute(n) || "").toLowerCase(); }
  function cls(el) { return typeof el.className === "string" ? el.className : ""; }
  var ATC_RE = /add to (cart|bag|basket)|buy (it )?now|order now|اضف|أضف|إضافة|اضافة|اشتر|اطلب/i;
  function inFixed(el) {
    for (var p = el; p && p !== document.body; p = p.parentElement) { var pos = getComputedStyle(p).position; if (pos === "fixed" || pos === "sticky") return true; }
    return false;
  }

  // Form fields: type, keyboard, autocomplete, height, font size (never values).
  var SKIP_TYPE = /^(hidden|checkbox|radio|submit|button|image|file|range|color|reset)$/;
  var inputs = [];
  document.querySelectorAll("input, select, textarea").forEach(function (el) {
    var ty = (el.tagName === "INPUT" ? (el.getAttribute("type") || "text") : el.tagName.toLowerCase()).toLowerCase();
    if (SKIP_TYPE.test(ty) || inputs.length >= 40) return;
    var r = vis(el);
    if (!r) return;
    var lab = el.getAttribute("placeholder") || el.getAttribute("aria-label") || "";
    if (!lab && el.id) { var l = document.querySelector('label[for="' + el.id.replace(/"/g, "") + '"]'); if (l) lab = l.textContent || ""; }
    inputs.push({
      type: ty, inputmode: attr(el, "inputmode"), autocomplete: attr(el, "autocomplete"),
      name: ((el.getAttribute("name") || "") + " " + (el.id || "")).trim().toLowerCase().slice(0, 60),
      label: lab.replace(/\s+/g, " ").trim().slice(0, 50),
      w: Math.round(r.width), h: Math.round(r.height), fs: Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10 || 0,
      inHeader: !!el.closest("header, [role=banner]"),
    });
  });

  // Header controls.
  var hdr = document.querySelector("header, [role=banner], #header, .header, .site-header");
  var hdrCart = null, hdrMenu = null, hdrSearch = null;
  if (hdr) {
    var HC = /cart|basket|bag|سلة|السلة|سله/i;
    var cands = hdr.querySelectorAll("a[href], button, [role=button], summary");
    for (var ci = 0; ci < cands.length; ci++) {
      var c = cands[ci], cr = vis(c);
      if (!cr) continue;
      var sig = (c.getAttribute("aria-label") || "") + " " + (c.getAttribute("title") || "") + " " + (c.getAttribute("href") || "") + " " + cls(c) + " " + (c.id || "") + " " + label(c).slice(0, 30);
      if (!hdrCart && HC.test(sig) && !/add to|checkout|اضف|أضف/i.test(sig) && cr.width <= 200) {
        var cnt = null, cont = c.parentElement && c.parentElement !== hdr ? c.parentElement : c;
        var bad = cont.querySelectorAll('[class*="count" i], [class*="badge" i], [class*="bubble" i], [class*="qty" i], [class*="quantity" i], [id*="count" i], [id*="badge" i], [data-cart-count], [data-cart-item-count]');
        for (var bi = 0; bi < bad.length && cnt === null; bi++) {
          var bt = (bad[bi].textContent || "").replace(/\s+/g, " ").trim();
          if (/^\(?\d{1,3}\+?\)?$/.test(bt) && (vis(bad[bi]) || bt !== "0")) cnt = parseInt(bt.replace(/\D/g, ""), 10);
        }
        if (cnt === null) { var lt = (c.getAttribute("aria-label") || "") + " " + label(c); var cm = lt.match(/\(\s*(\d{1,3})\s*\)|(\d{1,3})\s*(items?|عنصر|منتج)/i); if (cm) cnt = parseInt(cm[1] || cm[2], 10); }
        var hf = (c.getAttribute("href") || "");
        hdrCart = { box: bx(cr), count: cnt, opens: c.tagName === "A" && /cart|basket|سلة|السلة/i.test(hf) ? "page" : (c.tagName !== "A" || hf === "#" || hf === "" || c.getAttribute("aria-controls") || c.getAttribute("aria-haspopup")) ? "drawer" : null };
        continue;
      }
      if (!hdrMenu && /menu|hamburger|nav-toggle|navtoggle|drawer|القائمة|قائمة/i.test(sig) && !/search|cart|بحث/i.test(sig) && cr.width <= 120 && cr.height <= 120) { hdrMenu = bx(cr); continue; }
      if (!hdrSearch && /search|بحث/i.test(sig) && cr.width <= 300 && cr.height <= 120) { hdrSearch = bx(cr); continue; }
    }
    if (!hdrSearch && sInput && vis(sInput) && sInput.closest("header, [role=banner]")) hdrSearch = bx(vis(sInput));
  }

  // Language switch: where is it?
  var langAt = null;
  var LSW = /^(english|en|eng|عربي|العربية|ar|arabic)$/;
  var LRANK = { header: 4, menu: 3, body: 2, footer: 1 };
  document.querySelectorAll("a[href], button").forEach(function (a) {
    var t = (a.textContent || "").replace(/\s+/g, " ").trim().toLowerCase(), h = (a.getAttribute("href") || "").toLowerCase();
    if (!(LSW.test(t) || /^\/(ar|en)(\/|$)|[?&](locale|lang)=/.test(h))) return;
    var rr = vis(a), where;
    if (a.closest("footer, [role=contentinfo]")) where = "footer";
    else if (a.closest("header, [role=banner], nav")) where = rr && rr.top + sy < 200 ? "header" : "menu";
    else where = "body";
    if (!langAt || LRANK[where] > LRANK[langAt]) langAt = where;
  });

  // Footer: contact details and policy links (text and hrefs, even collapsed).
  var footers = document.querySelectorAll("footer, [role=contentinfo]");
  var ft = footers.length ? footers[footers.length - 1] : document.querySelector("#footer, .site-footer, .footer");
  var footer = { found: false, links: 0, phone: false, whatsapp: false, email: false, kinds: [] };
  if (ft) {
    footer.found = true;
    var FK = [
      ["shipping", /shipping|delivery|الشحن|شحن|التوصيل|توصيل/i],
      ["returns", /return|refund|exchange|الاسترجاع|الاسترداد|الاستبدال|ارجاع|إرجاع|استرجاع|استبدال/i],
      ["privacy", /privacy|الخصوصية|خصوصية/i],
      ["terms", /terms|conditions|\btos\b|الشروط|الأحكام|الاحكام|شروط/i],
    ];
    ft.querySelectorAll("a[href]").forEach(function (a) {
      footer.links++;
      var h = a.getAttribute("href") || "", t = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (/^tel:/i.test(h)) footer.phone = true;
      if (/wa\.me|api\.whatsapp\.com|^whatsapp:/i.test(h)) footer.whatsapp = true;
      if (/^mailto:/i.test(h)) footer.email = true;
      FK.forEach(function (k) { if (footer.kinds.indexOf(k[0]) < 0 && (k[1].test(t) || k[1].test(h))) footer.kinds.push(k[0]); });
    });
    var ftxt = ft.textContent || "";
    if (/(?:\+|00)\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}|\b0\d{9,10}\b/.test(ftxt)) footer.phone = true;
    if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/.test(ftxt)) footer.email = true;
  }

  // Floating things on screen (chat bubbles, discount tabs, banners).
  var floaters = [];
  var CHATSIG = /chat|whatsapp|wa\.me|intercom|tawk|crisp|tidio|zendesk|gorgias|drift|jivo|smartsupp|freshchat|livechat|messenger|واتساب|واتس/i;
  document.querySelectorAll("body *").forEach(function (el) {
    if (floaters.length >= 8) return;
    var cs = getComputedStyle(el);
    if (cs.position !== "fixed") return;
    var r = vis(el);
    if (!r || r.width < 24 || r.height < 24) return;
    if (r.width * r.height > 0.3 * vw * vh) return; // big overlays: POPUPS_JS
    if (el.tagName === "HEADER" || el.querySelector("header, nav") || (hdr && (hdr === el || hdr.contains(el) || el.contains(hdr)))) return;
    var txt = label(el).slice(0, 200);
    if (/cookie|cookies|كوكيز|ملفات تعريف الارتباط/i.test(txt)) return;
    var btn = [].some.call(el.querySelectorAll("button, a, input[type=submit], [role=button]"), function (b) { return ATC_RE.test(label(b).slice(0, 40)); });
    if (btn || ATC_RE.test(txt.slice(0, 40))) return; // a sticky buy bar is the CTA, not a widget
    if (floaters.some(function (f) { return f.el.contains(el) || el.contains(f.el); })) return;
    var wa = el.querySelector('a[href*="wa.me"], a[href*="api.whatsapp.com"], iframe');
    var sig = (el.id || "") + " " + cls(el) + " " + (el.getAttribute("aria-label") || "") + " " + (el.getAttribute("title") || "") + " " + (el.tagName === "IFRAME" ? (el.getAttribute("src") || "") : "") + " " + (wa ? (wa.getAttribute("href") || wa.getAttribute("src") || "") + " " + (wa.getAttribute("title") || "") : "");
    var kind = CHATSIG.test(sig) ? "chat" : /discount|coupon|offer|spin|gift|reward|خصم|كوبون|هدية/i.test(sig + " " + txt) ? "tab" : r.width >= vw * 0.9 ? "banner" : "other";
    floaters.push({ el: el, kind: kind, box: bx(r) });
  });
  floaters = floaters.map(function (f) { return { kind: f.kind, box: f.box }; });

  // Buy button as painted, quantity selector, variant pills.
  var atcEl = null;
  var atcList = document.querySelectorAll("button, input[type=submit], a[role=button], [role=button]");
  for (var ai = 0; ai < atcList.length && !atcEl; ai++) {
    var ab = atcList[ai], abr = vis(ab);
    if (!abr || abr.width < 60 || abr.height < 24 || ab.closest("header, footer, nav")) continue;
    var abl = label(ab).slice(0, 60);
    if (abl.length > 40 || !ATC_RE.test(abl) || inFixed(ab)) continue;
    atcEl = ab;
  }
  var atc = null, qty = null, swatches = [];
  if (atcEl) {
    var acs = getComputedStyle(atcEl);
    var alphaOf = function (c) { var m = /rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\s*\)/.exec(c); return m ? parseFloat(m[1]) : (c === "transparent" ? 0 : 1); };
    var bgc = "", complex = false;
    for (var up = atcEl, hops = 0; up && hops < 6; up = up.parentElement, hops++) {
      var ucs = getComputedStyle(up);
      if (ucs.backgroundImage && ucs.backgroundImage !== "none") complex = true;
      var ua = alphaOf(ucs.backgroundColor);
      if (ua > 0) { bgc = ucs.backgroundColor; if (ua < 1) complex = true; break; }
    }
    if (!bgc) complex = true;
    atc = { box: bx(atcEl.getBoundingClientRect()), fg: acs.color, bg: bgc, bgComplex: complex };
    var root = atcEl.closest("form");
    var qi = root ? root.querySelector('input[name="quantity"], input[name*="qty" i], input[type="number"], input.qty, [class*="quantity" i] input, [class*="qty" i] input') : null;
    var pmb = root ? [].filter.call(root.querySelectorAll("button, [role=button], a"), function (b) {
      var t = (b.textContent || "").replace(/\s+/g, "");
      return (/^(plus|minus|increase|decrease)$/i.test(attr(b, "name")) || /increase|decrease|plus|minus|زيادة|نقص|إنقاص/i.test(b.getAttribute("aria-label") || "") || /^[+\-−–]$/.test(t)) && vis(b);
    }) : [];
    if (qi || pmb.length) {
      var holder = qi ? (qi.closest('[class*="quantity" i], [class*="qty" i]') || qi.parentElement) : pmb[0].parentElement;
      var hr2 = holder ? vis(holder) : null;
      var ctl = pmb.map(function (b) { return bx(vis(b)); });
      if (qi && vis(qi)) ctl.push(bx(vis(qi)));
      if (hr2 || ctl.length) qty = { box: hr2 ? bx(hr2) : ctl[0], controls: ctl.slice(0, 4) };
    }
    if (root) {
      var swSel = root.querySelectorAll('[class*="swatch" i], [class*="variant" i] button, [class*="option" i] button, [class*="pill" i], label[for]');
      var swEls = [].filter.call(swSel, function (e) {
        if (e.tagName === "LABEL") { var inp = document.getElementById(e.getAttribute("for") || ""); if (!inp || inp.getAttribute("type") !== "radio") return false; }
        var r = vis(e);
        return r && r.width <= 200 && r.height <= 120;
      });
      swEls = swEls.filter(function (e) { return !swEls.some(function (o) { return o !== e && e.contains(o); }); });
      swatches = swEls.slice(0, 20).map(function (e) { return bx(e.getBoundingClientRect()); });
    }
  }

  // Sideways scroll: real scroll width, and the widest in-flow element.
  var clipX = function (e) { var v = getComputedStyle(e).overflowX; return v === "hidden" || v === "clip"; };
  var wide = 0, nodes = 0;
  (function walk(el, clipped) {
    for (var k = el.firstElementChild; k && nodes < 6000; k = k.nextElementSibling) {
      nodes++;
      var cs2 = getComputedStyle(k);
      if (cs2.display === "none" || cs2.position === "fixed" || cs2.visibility === "hidden" || parseFloat(cs2.opacity) === 0 || k.getAttribute("aria-hidden") === "true") continue;
      var rr2 = k.getBoundingClientRect();
      if (!clipped && rr2.width > 0 && rr2.right > wide) wide = rr2.right;
      walk(k, clipped || cs2.overflowX !== "visible");
    }
  })(document.body, false);
  var overflow = { iw: vw, sw: html.scrollWidth, wide: Math.round(wide), clipped: clipX(html) || clipX(document.body) };

  // Template text and demo links, and utm_ tags on the store's own links.
  var PH = new RegExp(${JSON.stringify(PLACEHOLDER_SOURCE)}, "i");
  var phText = [], bodyTxt = (document.body.innerText || "").slice(0, 400000);
  var pmatch = PH.exec(bodyTxt);
  if (pmatch) phText.push(bodyTxt.slice(Math.max(0, pmatch.index - 20), pmatch.index + 60).replace(/\s+/g, " ").trim());
  var DEMO = /(^|\.)example\.(com|org|net)$|themeforest\.net$|themes\.shopify\.com$|theme-?demo|demo.*\.myshopify\.com$/i;
  var phHrefs = [], utmN = 0, utmInt = 0, utmSamples = [];
  var ownHost = location.host.replace(/^www\./, "");
  document.querySelectorAll("a[href]").forEach(function (a) {
    var u;
    try { u = new URL(a.getAttribute("href") || "", location.href); } catch (e) { return; }
    if (u.protocol === "mailto:" && /@example\./i.test(u.href)) { if (phHrefs.length < 5) phHrefs.push("mailto:@example"); return; }
    if (!/^https?:$/.test(u.protocol)) return;
    var host = u.host.replace(/^www\./, "");
    if (host !== ownHost) { if (DEMO.test(u.hostname) && phHrefs.length < 5) phHrefs.push((u.hostname + u.pathname).slice(0, 80)); return; }
    utmInt++;
    if (/[?&]utm_/i.test(u.search)) {
      utmN++;
      if (utmSamples.length < 3) utmSamples.push((u.pathname + "?" + u.search.slice(1).split("&").map(function (p) { return p.split("=")[0]; }).filter(function (p) { return /^utm_/i.test(p); }).join("&")).slice(0, 100));
    }
  });

  // Content images: format, natural vs displayed width, loading attribute.
  var imgs = [], imgTotal = 0;
  document.querySelectorAll("img").forEach(function (img) {
    var r = img.getBoundingClientRect();
    if (r.width < 48 || getComputedStyle(img).display === "none") return;
    var src = img.currentSrc || img.src || "";
    if (!src || /^data:/i.test(src)) return;
    var u;
    try { u = new URL(src, location.href); } catch (e) { return; }
    var path = u.pathname.toLowerCase();
    if (/\.svg$/.test(path)) return;
    imgTotal++;
    if (imgs.length >= 150) return;
    var q = u.search.toLowerCase();
    var ext = (/\.(webp|avif|jpe?g|png|gif)$/.exec(path) || [])[1] || "";
    var qf = (/[?&](?:format|fm|f|output)=(webp|avif|jpe?g|png)/.exec(q) || /\/f_(webp|avif)/.exec(path) || [])[1] || "";
    var f = (qf || ext).replace("jpeg", "jpg");
    imgs.push({
      host: u.hostname.slice(0, 60), path: path.slice(0, 100), fmt: f || "other",
      auto: /f_auto|auto=format|auto=compress,format|format=auto|fm=auto|[?&]f=auto/.test(q + path),
      nw: img.naturalWidth || 0, dw: Math.round(r.width), top: Math.round(r.top + sy),
      lazy: img.getAttribute("loading") === "lazy" || !!img.getAttribute("data-src") || /lazyload|lazyloaded|lazy-load/i.test(cls(img)),
    });
  });

  return {
    inputs: inputs,
    header: { found: !!hdr, cart: hdrCart, menu: hdrMenu, search: hdrSearch },
    langAt: langAt,
    footer: footer,
    floaters: floaters,
    qty: qty,
    swatches: swatches,
    atc: atc,
    overflow: overflow,
    placeholder: { text: phText, hrefs: phHrefs },
    utm: { internal: utmInt, withUtm: utmN, samples: utmSamples },
    images: imgs,
    imagesTotal: imgTotal,
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
