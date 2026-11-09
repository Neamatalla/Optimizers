// Tracking QA: drives every interaction on the built site and checks the dataLayer events.
// GTM/GA/Clarity/Convert are blocked (no analytics pollution); /api/contact is mocked (no real email).
// Usage: BASE_URL=http://localhost:4173/ node scripts/qa-tracking.mjs   (CHROME_PATH optional)
// Exits 1 on: unknown event names, missing event_category, personal data in a push, untagged clicks, or required events missing.
import fs from "fs";
const puppeteer = (await import("puppeteer")).default;
const BASE = process.env.BASE_URL || "http://localhost:4173/";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const BLOCK = /googletagmanager|google-analytics|clarity\.ms|convertexperiments|doubleclick/;
const PII = ["QA Tester", "qa.tester@example-agency.com", "example-agency.com", "Increase repeat buyers"];

const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true, args: ["--autoplay-policy=no-user-gesture-required", ...(process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] : [])] });
const log = [];

async function setup(vp) {
  const p = await b.newPage();
  await p.setViewport(vp);
  await p.setRequestInterception(true);
  p.on("request", (r) => {
    const u = r.url();
    if (BLOCK.test(u)) return r.abort();
    if (u.includes("/api/contact")) return r.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    r.continue();
  });
  await p.evaluateOnNewDocument(() => localStorage.setItem("language", "en"));
  await p.goto(BASE, { waitUntil: "networkidle2", timeout: 90000 });
  await sleep(1000);
  return p;
}
const events = (p) => p.evaluate(() => (window.dataLayer || []).filter(e => e && e.event && !String(e.event).startsWith("gtm.")).map(e => JSON.parse(JSON.stringify(e))));
const click = (p, sel, i = 0) => p.evaluate((sel, i) => { const el = document.querySelectorAll(sel)[i]; if (!el) return false; el.scrollIntoView({ block: "center" }); el.click(); return true; }, sel, i);
const clickText = (p, sel, text) => p.evaluate((sel, text) => { const el = [...document.querySelectorAll(sel)].find(e => e.innerText.trim() === text); if (!el) return false; el.scrollIntoView({ block: "center" }); el.click(); return true; }, sel, text);
const scrollPage = async (p, step = 500, wait = 160) => { const h = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y <= h; y += step) { await p.evaluate(y => window.scrollTo(0, y), y); await sleep(wait); } };
const typeInto = async (p, name, text) => { await p.evaluate(n => document.querySelector(`input[name="${n}"]`)?.scrollIntoView({ block: "center" }), name); await p.click(`input[name="${name}"]`); await p.type(`input[name="${name}"]`, text); await p.evaluate(n => document.querySelector(`input[name="${n}"]`).blur(), name); await sleep(200); };
const step = async (label, fn) => { try { const r = await fn(); log.push(`${r === false ? "MISS" : "ok  "} ${label}`); } catch (e) { log.push(`FAIL ${label}: ${e.message.slice(0, 120)}`); } };

// ───────── DESKTOP ─────────
let p = await setup({ width: 1440, height: 900 });
await step("scroll whole page", () => scrollPage(p));
await p.evaluate(() => window.scrollTo(0, 0)); await sleep(400);
for (const t of ["services", "about_us", "roi_calculator", "case_studies", "team", "contact"]) await step(`header nav ${t}`, async () => { const r = await click(p, `[data-track="header_nav_${t}_click"]`); await sleep(250); return r; });
await step("language switch en->ar", async () => { const r = await click(p, '[data-track="header_language_switch_click"]'); await sleep(600); return r; });
await step("language switch ar->en", async () => { const r = await click(p, '[data-track="header_language_switch_click"]'); await sleep(600); return r; });
await step("header book call", () => click(p, '[data-track="header_book_call_click"]'));
for (const t of ["services_book_call_click", "top_clients_book_consultation_click", "guarantee_book_call_click", "process_book_call_click", "faq_book_call_click", "footer_cta_success_story_click"]) {
  await step(`cta ${t}`, async () => { const r = await p.evaluate(t => { const el = [...document.querySelectorAll(`[data-track="${t}"]`)].find(e => e.offsetParent !== null || getComputedStyle(e).position === "fixed"); if (!el) return false; el.click(); return true; }, t); await sleep(250); return r; });
}
// ROI calculator
await step("roi currency USD", () => clickText(p, "#roi-calculator button", "USD"));
await step("roi lift 30%", () => clickText(p, "#roi-calculator button", "30%"));
await step("roi visitors input", async () => { await p.evaluate(() => document.querySelector("#roi-calculator input").scrollIntoView({ block: "center" })); const inp = await p.$$("#roi-calculator input"); await inp[0].click({ clickCount: 3 }); await inp[0].type("80000"); await p.evaluate(() => document.querySelectorAll("#roi-calculator input")[0].blur()); await sleep(200); });
await step("roi conv input", async () => { const inp = await p.$$("#roi-calculator input"); await inp[1].click({ clickCount: 3 }); await inp[1].type("3.1"); await p.evaluate(() => document.querySelectorAll("#roi-calculator input")[1].blur()); await sleep(200); });
await step("roi aov input", async () => { const inp = await p.$$("#roi-calculator input"); await inp[2].click({ clickCount: 3 }); await inp[2].type("420"); await p.evaluate(() => document.querySelectorAll("#roi-calculator input")[2].blur()); await sleep(200); });
await step("roi reset", () => clickText(p, "#roi-calculator button", "Reset to defaults"));
// FAQ
await step("faq open q2", async () => { const r = await clickText(p, "button", "How quickly will I see results?"); await sleep(300); return r; });
await step("faq close q2", async () => { const r = await clickText(p, "button", "How quickly will I see results?"); await sleep(300); return r; });
// Form
await step("form scroll to card", async () => { await p.evaluate(() => document.querySelector('[data-name="Card"]').scrollIntoView({ block: "center" })); await sleep(800); });
await step("form traffic option", async () => { const r = await clickText(p, '[data-track-section="strategy_session"] div', "100k-200k Visitors"); await sleep(700); return r; });
await step("form conversions option", async () => { const r = await clickText(p, '[data-track-section="strategy_session"] div', "From 100 to 1K"); await sleep(700); return r; });
await step("form objective Other", async () => { const r = await clickText(p, '[data-track-section="strategy_session"] div', "Other"); await sleep(500); return r; });
await step("form custom objective", () => typeInto(p, "customObjective", "Increase repeat buyers"));
await step("form next (step3)", async () => { const r = await clickText(p, "button", "Next"); await sleep(500); return r; });
await step("form website invalid", () => typeInto(p, "website", "notaurl"));
await step("form website valid", async () => { await p.click('input[name="website"]', { clickCount: 3 }); await p.type('input[name="website"]', "https://example-agency.com"); await p.evaluate(() => document.querySelector('input[name="website"]').blur()); await sleep(200); });
await step("form back", async () => { const r = await clickText(p, "button", "Back"); await sleep(500); return r; });
await step("form stepper -> 4", async () => { const r = await p.evaluate(() => { const el = [...document.querySelectorAll('[data-name="Stepper"] .cursor-pointer')].find(e => /^4/.test(e.innerText.trim())); if (!el) return false; el.click(); return true; }); await sleep(500); return r; });
await step("form next (step4)", async () => { const r = await clickText(p, "button", "Next"); await sleep(500); return r; });
await step("form first name", () => typeInto(p, "firstName", "QA Tester"));
await step("form email", () => typeInto(p, "email", "qa.tester@example-agency.com"));
await step("form submit", async () => { const r = await clickText(p, "button", "Next"); await sleep(3000); return r; });
await step("calendly load wait", async () => { await sleep(6000); });
// Video
await step("video play", async () => { const r = await click(p, '[data-track="ceo_video_play_click"]'); await sleep(9000); return r; });
// Footer
for (const t of ["about", "services", "roi_calculator", "contact"]) await step(`footer nav ${t}`, async () => { const r = await click(p, `[data-track="footer_nav_${t}_click"]`); await sleep(250); return r; });
await step("footer social linkedin (prevented nav)", () => p.evaluate(() => { const a = document.querySelector('[data-track="footer_social_linkedin_click"]'); a.addEventListener("click", e => e.preventDefault(), { once: true }); a.click(); return true; }));
await step("footer blog (prevented nav)", () => p.evaluate(() => { const a = document.querySelector('[data-track="footer_nav_blog_click"]'); a.addEventListener("click", e => e.preventDefault(), { once: true }); a.click(); return true; }));
await step("scroll to top", async () => { await p.evaluate(() => window.scrollTo(0, 3000)); await sleep(500); return click(p, '[data-track="scroll_to_top_click"]'); });
await step("time milestone wait", () => sleep(2000));
await step("pagehide (abandon check)", () => p.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide"))));
const desktop = await events(p);
await p.close();

// ───────── MOBILE ─────────
p = await setup({ width: 390, height: 844, isMobile: true, hasTouch: true });
await step("m menu open", async () => { const r = await click(p, '[data-track="mobile_menu_open"]'); await sleep(500); return r; });
await step("m menu nav services", async () => { const r = await click(p, '[data-track="mobile_menu_nav_services_click"]'); await sleep(500); return r; });
await step("m menu open 2", async () => { const r = await click(p, '[data-track="mobile_menu_open"]'); await sleep(500); return r; });
await step("m menu social instagram (prevented)", () => p.evaluate(() => { const a = document.querySelector('[data-track="mobile_menu_social_instagram_click"]'); a.addEventListener("click", e => e.preventDefault(), { once: true }); a.click(); return true; }));
await step("m menu close button", async () => { const r = await click(p, '[data-track="mobile_menu_close"][data-track-close-method="close_button"]'); await sleep(500); return r; });
await step("m menu open 3", async () => { const r = await click(p, '[data-track="mobile_menu_open"]'); await sleep(500); return r; });
await step("m menu backdrop", async () => { const r = await p.evaluate(() => { const o = document.querySelector(".mobile-nav-overlay"); o.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; }); await sleep(500); return r; });
await step("m menu open 4 + book call", async () => { await click(p, '[data-track="mobile_menu_open"]'); await sleep(500); const r = await click(p, '[data-track="mobile_menu_book_call_click"]'); await sleep(500); return r; });
await step("m top clients in view", async () => { await p.evaluate(() => document.getElementById("case-studies").scrollIntoView({ block: "start" })); await sleep(1200); });
await step("m top clients next", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies button[aria-label="Next slide"]'); if (!el) return false; el.click(); return true; }); await sleep(600); return r; });
await step("m top clients prev", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies button[aria-label="Previous slide"]'); if (!el) return false; el.click(); return true; }); await sleep(600); return r; });
await step("m top clients dot 4", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies button[aria-label="Go to slide 4"]'); if (!el) return false; el.click(); return true; }); await sleep(600); return r; });
await step("m top clients swipe", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies [style*="isolation"]') || document.querySelector("#case-studies > div"); const t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 }); el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [t(300)], changedTouches: [t(300)] })); el.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [t(150)] })); return true; }); await sleep(600); return r; });
await step("m case studies in view", async () => { await p.evaluate(() => document.getElementById("case-studies-section").scrollIntoView({ block: "start" })); await sleep(2500); });
await step("m case studies next", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies-section button[aria-label="Next slide"]'); if (!el) return false; el.click(); return true; }); await sleep(800); return r; });
await step("m case studies prev", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies-section button[aria-label="Previous slide"]'); if (!el) return false; el.click(); return true; }); await sleep(800); return r; });
await step("m case studies dot 5", async () => { const r = await p.evaluate(() => { const el = document.querySelector('#case-studies-section button[aria-label="Go to slide 5"]'); if (!el) return false; el.click(); return true; }); await sleep(800); return r; });
await step("m footer social facebook (prevented)", () => p.evaluate(() => { const a = document.querySelector('[data-track="footer_social_facebook_click"]'); a.addEventListener("click", e => e.preventDefault(), { once: true }); a.click(); return true; }));
const mobile = await events(p);
await p.close();
await b.close();

// ───────── report ─────────
const catalog = Object.keys(Object.fromEntries([...fs.readFileSync("src/lib/analytics/events.ts", "utf8").matchAll(/^\s+([a-z0-9_]+): "([a-z_]+)",/gm)].map(m => [m[1], m[2]])));
const all = [...desktop.map(e => ({ ...e, _vp: "desktop" })), ...mobile.map(e => ({ ...e, _vp: "mobile" }))];
const fired = new Set(all.map(e => e.event));
const notInCatalog = [...fired].filter(e => !catalog.includes(e));
const neverFired = catalog.filter(e => !fired.has(e));
const piiHits = all.filter(e => PII.some(s => JSON.stringify(e).includes(s)));
const noCategory = all.filter(e => !e.event_category);
const untagged = all.filter(e => e.event === "ui_click_untagged");
console.log(log.filter(l => !l.startsWith("ok")).join("\n") || "all steps ok");
console.log(`\nevents: desktop ${desktop.length}, mobile ${mobile.length}; distinct ${fired.size}/${catalog.length} catalog`);
console.log("not in catalog:", notInCatalog);
console.log("no event_category:", noCategory.length, "| PII hits:", piiHits.length, piiHits.map(e => e.event));
console.log("untagged clicks:", untagged.map(e => `${e.element_tag}:${e.element_text}@${e.section_name}`));
console.log("never fired:", neverFired);
const counts = {}; for (const e of all) counts[e.event] = (counts[e.event] || 0) + 1;
console.log(Object.entries(counts).map(([k, v]) => `${k}=${v}`).join("  "));

const REQUIRED = ["section_view", "page_scroll_depth", "header_nav_team_click", "header_book_call_click", "roi_lift_select", "faq_question_expand", "strategy_form_start", "strategy_form_step_view", "strategy_form_submit_success", "generate_lead", "ceo_video_play_click", "mobile_menu_open", "top_clients_slide_view", "case_study_view", "web_vital"];
const missing = REQUIRED.filter((e) => !fired.has(e));
const failures = [
  notInCatalog.length && "events not in the tracking plan: " + notInCatalog.join(", "),
  noCategory.length && noCategory.length + " events without event_category",
  piiHits.length && "personal data in: " + piiHits.map((e) => e.event).join(", "),
  untagged.length && "untagged clicks: " + untagged.map((e) => e.element_text).join(", "),
  missing.length && "required events missing: " + missing.join(", "),
  log.some((l) => l.startsWith("FAIL")) && "steps failed",
].filter(Boolean);
if (failures.length) {
  console.error("\nTRACKING QA FAILED\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("\nTRACKING QA PASSED");
