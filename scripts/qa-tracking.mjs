// Tracking QA: triggers EVERY event in the tracking plan (src/lib/analytics/events.ts) on the built
// site and checks the dataLayer pushes. Fails if any planned event never fires, an unknown event
// appears, an event lacks event_category, personal data leaks into a push, or a real link/button
// goes untagged.
//
// GTM/GA/Clarity/Convert are blocked (no analytics pollution); /api/contact is mocked (no real
// email); Calendly and the untagged-click/JS-error cases are simulated the way the browser would
// report them.
//
// Usage: BASE_URL=http://localhost:4173/ node scripts/qa-tracking.mjs   (CHROME_PATH optional)
import fs from "fs";
const puppeteer = (await import("puppeteer")).default;

const BASE = process.env.BASE_URL || "http://localhost:4173/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BLOCK = /googletagmanager|google-analytics|clarity\.ms|convertexperiments|doubleclick/;
const PII = ["QA Tester", "qa.tester@example-agency.com", "example-agency.com", "Increase repeat buyers"];
// The untagged button the test adds on purpose (not counted as real untagged UI).
const SYNTHETIC_UNTAGGED = "QA untagged button";

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", ...(process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] : [])],
});
const log = [];
const all = [];

async function open(viewport, { apiStatus = 200 } = {}) {
  const p = await browser.newPage();
  await p.setViewport(viewport);
  await p.setRequestInterception(true);
  p.on("request", (r) => {
    const u = r.url();
    if (BLOCK.test(u)) return r.abort();
    if (u.includes("/api/contact")) {
      return r.respond({ status: apiStatus, contentType: "application/json", body: JSON.stringify(apiStatus === 200 ? { success: true } : { error: "QA forced failure" }) });
    }
    r.continue();
  });
  await p.evaluateOnNewDocument(() => localStorage.setItem("language", "en"));
  await p.goto(BASE, { waitUntil: "networkidle2", timeout: 90000 });
  await sleep(1000);
  return p;
}
async function collect(p, label) {
  const ev = await p.evaluate(() => (window.dataLayer || []).filter((e) => e && e.event && !String(e.event).startsWith("gtm.")).map((e) => JSON.parse(JSON.stringify(e))));
  all.push(...ev.map((e) => ({ ...e, _session: label })));
  await p.close();
}
const step = async (label, fn) => {
  try { const r = await fn(); log.push(`${r === false ? "MISS" : "ok  "} ${label}`); }
  catch (e) { log.push(`FAIL ${label}: ${String(e.message).slice(0, 140)}`); }
};
// DOM helpers (run in the page)
const click = (p, sel, i = 0) => p.evaluate((sel, i) => { const el = document.querySelectorAll(sel)[i]; if (!el) return false; el.scrollIntoView({ block: "center" }); el.click(); return true; }, sel, i);
const clickText = (p, sel, text) => p.evaluate((sel, text) => { const el = [...document.querySelectorAll(sel)].find((e) => e.innerText.trim() === text); if (!el) return false; el.scrollIntoView({ block: "center" }); el.click(); return true; }, sel, text);
const clickVisible = (p, sel) => p.evaluate((sel) => { const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null || getComputedStyle(e).position === "fixed"); if (!el) return false; el.click(); return true; }, sel);
// Outbound links: fire the click (tracking) but keep the test on the page.
const clickNoNav = (p, sel) => p.evaluate((sel) => { const a = document.querySelector(sel); if (!a) return false; a.addEventListener("click", (e) => e.preventDefault(), { once: true }); a.click(); return true; }, sel);
const scrollPage = async (p) => { const h = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y <= h; y += 500) { await p.evaluate((y) => window.scrollTo(0, y), y); await sleep(150); } };
const typeInto = async (p, name, text) => {
  await p.evaluate((n) => document.querySelector(`input[name="${n}"]`)?.scrollIntoView({ block: "center" }), name);
  await p.click(`input[name="${name}"]`, { clickCount: 3 });
  await p.type(`input[name="${name}"]`, text);
  await p.evaluate((n) => document.querySelector(`input[name="${n}"]`).blur(), name);
  await sleep(200);
};
const pickOption = (p, text) => clickText(p, '[data-track-section="strategy_session"] div', text);
const nextButton = (p) => clickText(p, "button", "Next");
const yt = (p, func, args = []) => p.evaluate((func, args) => document.querySelector('iframe[src*="youtube"]')?.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*"), func, args);
const calendly = (p, event, payload = {}) => p.evaluate((event, payload) => window.postMessage({ event, payload }, "*"), event, payload);

async function fillFormToContact(p, { custom = false } = {}) {
  await p.evaluate(() => document.querySelector('[data-name="Card"]').scrollIntoView({ block: "center" }));
  await sleep(800);
  await pickOption(p, "100k-200k Visitors"); await sleep(700);
  await pickOption(p, "From 100 to 1K"); await sleep(700);
  if (custom) {
    await pickOption(p, "Other"); await sleep(500);
    await typeInto(p, "customObjective", "Increase repeat buyers");
    await nextButton(p); await sleep(500);
  } else {
    await pickOption(p, "Online Sales (eCommerce)"); await sleep(700);
  }
}

// ───────── Session 1: desktop, every desktop interaction + full successful lead ─────────
let p = await open({ width: 1440, height: 900 });
await step("scroll whole page", () => scrollPage(p));
await p.evaluate(() => window.scrollTo(0, 0)); await sleep(400);
for (const t of ["services", "about_us", "roi_calculator", "case_studies", "team", "contact"]) {
  await step(`header nav ${t}`, async () => { const r = await click(p, `[data-track="header_nav_${t}_click"]`); await sleep(400); return r; });
}
await step("language en->ar", async () => { const r = await click(p, '[data-track="header_language_switch_click"]'); await sleep(600); return r; });
await step("language ar->en", async () => { const r = await click(p, '[data-track="header_language_switch_click"]'); await sleep(600); return r; });
await step("header book call", () => click(p, '[data-track="header_book_call_click"]'));
for (const t of ["services_book_call_click", "top_clients_book_consultation_click", "guarantee_book_call_click", "process_book_call_click", "faq_book_call_click", "footer_cta_success_story_click"]) {
  await step(`cta ${t}`, async () => { const r = await clickVisible(p, `[data-track="${t}"]`); await sleep(300); return r; });
}
// ROI calculator
await step("roi currency USD", () => clickText(p, "#roi-calculator button", "USD"));
await step("roi lift 30%", () => clickText(p, "#roi-calculator button", "30%"));
for (const [i, v] of [[0, "80000"], [1, "3.1"], [2, "420"]]) {
  await step(`roi input ${i}`, async () => {
    await p.evaluate(() => document.querySelector("#roi-calculator input").scrollIntoView({ block: "center" }));
    const inputs = await p.$$("#roi-calculator input");
    await inputs[i].click({ clickCount: 3 }); await inputs[i].type(v);
    await p.evaluate((i) => document.querySelectorAll("#roi-calculator input")[i].blur(), i); await sleep(200);
  });
}
await step("roi reset", () => clickText(p, "#roi-calculator button", "Reset to defaults"));
// FAQ
await step("faq open q2", async () => { const r = await clickText(p, "button", "How quickly will I see results?"); await sleep(300); return r; });
await step("faq close q2", async () => { const r = await clickText(p, "button", "How quickly will I see results?"); await sleep(300); return r; });
// Team cards: photo, name, title
await step("team photo / name / title", async () => {
  await p.evaluate(() => document.getElementById("team").scrollIntoView({ block: "center" })); await sleep(600);
  return p.evaluate(() => {
    const cards = [...document.querySelectorAll('#team [data-name="Safer"]')];
    if (cards.length < 3) return false;
    cards[0].querySelector("img").click();
    cards[1].querySelectorAll("p")[0].click();
    cards[2].querySelectorAll("p")[1].click();
    return true;
  });
});
// Gallery click
await step("gallery image click", async () => {
  await p.evaluate(() => document.querySelector('[data-track-section="gallery"]').scrollIntoView({ block: "center" })); await sleep(800);
  return p.evaluate(() => { const t = document.querySelector("[data-gallery-image]"); if (!t) return false; t.click(); return true; });
});
// Fallback: a new, untagged button
await step("untagged button", () => p.evaluate((label) => { const b = document.createElement("button"); b.textContent = label; document.querySelector('[data-track-section="team"]').appendChild(b); b.click(); b.remove(); return true; }, SYNTHETIC_UNTAGGED));
// JS error from a site script (not a cross-origin "Script error.")
await step("js error", async () => { await p.evaluate(() => { const s = document.createElement("script"); s.textContent = 'setTimeout(function(){ throw new Error("QA test error"); }, 0);'; document.body.appendChild(s); }); await sleep(300); });
// Form: full successful lead (custom objective path, validation error, back, stepper)
await step("form to contact (custom objective)", () => fillFormToContact(p, { custom: true }));
await step("form website invalid", () => typeInto(p, "website", "notaurl"));
await step("form website valid", () => typeInto(p, "website", "https://example-agency.com"));
await step("form back", async () => { const r = await clickText(p, "button", "Back"); await sleep(500); return r; });
await step("form stepper -> 4", async () => { const r = await p.evaluate(() => { const el = [...document.querySelectorAll('[data-name="Stepper"] .cursor-pointer')].find((e) => /^4/.test(e.innerText.trim())); if (!el) return false; el.click(); return true; }); await sleep(500); return r; });
await step("form next (website)", async () => { const r = await nextButton(p); await sleep(500); return r; });
await step("form first name", () => typeInto(p, "firstName", "QA Tester"));
await step("form email", () => typeInto(p, "email", "qa.tester@example-agency.com"));
await step("form submit (success)", async () => { const r = await nextButton(p); await sleep(3000); return r; });
// Calendly: the widget loads for real (event_type_view); the rest replays Calendly's own messages.
await step("calendly widget load", () => sleep(5000));
await step("calendly profile view", async () => { await calendly(p, "calendly.profile_page_viewed"); await sleep(200); });
await step("calendly date/time select", async () => { await calendly(p, "calendly.date_and_time_selected"); await sleep(200); });
await step("calendly scheduled", async () => { await calendly(p, "calendly.event_scheduled", { event: { uri: "https://api.calendly.com/scheduled_events/QA" }, invitee: { uri: "https://api.calendly.com/scheduled_events/QA/invitees/QA" } }); await sleep(300); });
// CEO video: play, then drive the YouTube player through pause, resume, 25/50/75% and the end.
await step("video play click", async () => { const r = await click(p, '[data-track="ceo_video_play_click"]'); await sleep(9000); return r; });
await step("video start/pause/resume/progress/complete", async () => {
  await yt(p, "mute"); await yt(p, "playVideo"); await sleep(3000);
  await yt(p, "pauseVideo"); await sleep(1500);
  await yt(p, "playVideo"); await sleep(2000);
  const duration = 5116;
  for (const pct of [0.26, 0.51, 0.76]) { await yt(p, "seekTo", [Math.round(duration * pct), true]); await sleep(2500); }
  await yt(p, "seekTo", [duration - 2, true]); await sleep(6000);
});
// Footer
for (const t of ["about", "services", "roi_calculator", "contact"]) {
  await step(`footer nav ${t}`, async () => { const r = await click(p, `[data-track="footer_nav_${t}_click"]`); await sleep(300); return r; });
}
await step("footer blog", () => clickNoNav(p, '[data-track="footer_nav_blog_click"]'));
for (const s of ["facebook", "x", "linkedin", "instagram"]) await step(`footer social ${s}`, () => clickNoNav(p, `[data-track="footer_social_${s}_click"]`));
await step("scroll to top", async () => { await p.evaluate(() => window.scrollTo(0, 3000)); await sleep(500); return click(p, '[data-track="scroll_to_top_click"]'); });
await step("time milestones", () => sleep(2000));
await collect(p, "desktop");

// ───────── Session 2: desktop, the lead email fails (submit error) ─────────
p = await open({ width: 1440, height: 900 }, { apiStatus: 500 });
await step("error: form to contact", () => fillFormToContact(p));
await step("error: website", async () => { await typeInto(p, "website", "https://shop.example.org"); await nextButton(p); await sleep(500); });
await step("error: contact", async () => { await typeInto(p, "firstName", "QA"); await typeInto(p, "email", "qa@gmail.com"); await nextButton(p); await sleep(3000); });
await collect(p, "desktop-submit-error");

// ───────── Session 3: desktop, form started then the page is left (abandon) ─────────
p = await open({ width: 1440, height: 900 });
await step("abandon: start form", async () => { await p.evaluate(() => document.querySelector('[data-name="Card"]').scrollIntoView({ block: "center" })); await sleep(800); return pickOption(p, "500k+ Visitors"); });
await step("abandon: leave page", async () => { await sleep(800); await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide"))); });
await collect(p, "desktop-abandon");

// ───────── Session 4: mobile, menu (every link + social), sliders ─────────
p = await open({ width: 390, height: 844, isMobile: true, hasTouch: true });
const openMenu = async () => { await click(p, '[data-track="mobile_menu_open"]'); await sleep(500); };
for (const t of ["services", "about_us", "roi_calculator", "case_studies", "team", "contact"]) {
  await step(`m menu nav ${t}`, async () => { await openMenu(); const r = await click(p, `[data-track="mobile_menu_nav_${t}_click"]`); await sleep(700); return r; });
}
await step("m menu socials", async () => { await openMenu(); for (const s of ["facebook", "instagram", "x", "linkedin"]) await clickNoNav(p, `[data-track="mobile_menu_social_${s}_click"]`); });
await step("m menu close button", async () => { const r = await click(p, '[data-track="mobile_menu_close"][data-track-close-method="close_button"]'); await sleep(500); return r; });
await step("m menu backdrop", async () => { await openMenu(); await p.evaluate(() => document.querySelector(".mobile-nav-overlay").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await sleep(500); });
await step("m menu book call", async () => { await openMenu(); const r = await click(p, '[data-track="mobile_menu_book_call_click"]'); await sleep(500); return r; });
await step("m top clients in view", async () => { await p.evaluate(() => document.getElementById("case-studies").scrollIntoView({ block: "start" })); await sleep(1200); });
for (const [label, aria] of [["next", "Next slide"], ["prev", "Previous slide"], ["dot 4", "Go to slide 4"]]) {
  await step(`m top clients ${label}`, async () => { const r = await click(p, `#case-studies button[aria-label="${aria}"]`); await sleep(600); return r; });
}
await step("m top clients swipe", async () => {
  await p.evaluate(() => {
    const el = document.querySelector('#case-studies [style*="isolation"]') || document.querySelector("#case-studies > div");
    const t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 });
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [t(300)], changedTouches: [t(300)] }));
    el.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [t(150)] }));
  });
  await sleep(600);
});
await step("m case studies in view", async () => { await p.evaluate(() => document.getElementById("case-studies-section").scrollIntoView({ block: "start" })); await sleep(2500); });
for (const [label, aria] of [["next", "Next slide"], ["prev", "Previous slide"], ["dot 5", "Go to slide 5"]]) {
  await step(`m case studies ${label}`, async () => { const r = await click(p, `#case-studies-section button[aria-label="${aria}"]`); await sleep(800); return r; });
}
await collect(p, "mobile");
await browser.close();

// ───────── Report ─────────
const catalog = [...fs.readFileSync("src/lib/analytics/events.ts", "utf8").matchAll(/^\s+([a-z0-9_]+): "([a-z_]+)",/gm)].map((m) => m[1]);
const fired = new Set(all.map((e) => e.event));
const notInCatalog = [...fired].filter((e) => !catalog.includes(e));
const neverFired = catalog.filter((e) => !fired.has(e));
const piiHits = all.filter((e) => PII.some((s) => JSON.stringify(e).includes(s)));
const noCategory = all.filter((e) => !e.event_category);
const realUntagged = all.filter((e) => e.event === "ui_click_untagged" && e.element_text !== SYNTHETIC_UNTAGGED);

const counts = {};
for (const e of all) counts[e.event] = (counts[e.event] || 0) + 1;
console.log(log.filter((l) => !l.startsWith("ok")).join("\n") || "all steps ok");
console.log(`\nevents pushed: ${all.length}; distinct ${fired.size}/${catalog.length} in the plan`);
console.log(Object.entries(counts).sort().map(([k, v]) => `${k}=${v}`).join("  "));

const failures = [
  neverFired.length && `planned events that never fired: ${neverFired.join(", ")}`,
  notInCatalog.length && `events not in the tracking plan: ${notInCatalog.join(", ")}`,
  noCategory.length && `${noCategory.length} events without event_category`,
  piiHits.length && `personal data in: ${piiHits.map((e) => e.event).join(", ")}`,
  realUntagged.length && `untagged clicks on real UI: ${realUntagged.map((e) => `${e.element_tag}:${e.element_text}@${e.section_name}`).join(", ")}`,
  log.some((l) => l.startsWith("FAIL") || l.startsWith("MISS")) && "some steps failed (see above)",
].filter(Boolean);
if (failures.length) {
  console.error("\nTRACKING QA FAILED\n- " + failures.join("\n- "));
  // Surface the reasons as GitHub annotations (visible on the commit without opening the logs).
  if (process.env.GITHUB_ACTIONS) {
    for (const f of failures) console.log(`::error title=Tracking QA::${String(f).replace(/\n/g, " ")}`);
    const misses = log.filter((l) => !l.startsWith("ok")).join(" | ");
    if (misses) console.log(`::error title=Tracking QA steps::${misses}`);
  }
  process.exit(1);
}
console.log(`\nTRACKING QA PASSED: all ${catalog.length} planned events fired`);
