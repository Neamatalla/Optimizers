import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import type { ActionOwner, AuditResult, CategoryKey, CategoryResult, FindingAction, FindingSeverity, FudBand, FudFinding, FudPageType, Ga4FunnelEvent, Handoff, Opportunity } from "./types.js";
import { CHECK_GROUP_LABELS, GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, type BaseChecklistPoint, type ChecklistPoint as ActionChecklistPoint } from "./checklist.js";
import { LEGACY_GA4_CHECKLIST, LEGACY_GTM_CHECKLIST, LEGACY_WEBSITE_CHECKLIST, LEGACY_WEBSITE_CODE_CHECKLIST } from "./checklist-legacy.js";
import { personaChecklistFor, personaOf, personaOfFindings } from "./persona-checklist.js";
import { PERSONA_SHARED_SOURCES } from "./checklist-persona-data.js";
import { OPPORTUNITY_LABEL, OWNER_LABEL } from "./actions.js";

// Display code works on either checklist generation: the action-point lists
// (checklist.ts) or the ones older saved results were scored against.
type ChecklistPoint = BaseChecklistPoint & Partial<Pick<ActionChecklistPoint, "group" | "opportunity">>;
import { groupOf, ruleById, type FudGroup } from "./fud/rules.js";
import { formatMoney, STEP_BENCHMARKS } from "./fud/insights.js";
import { READER_QUESTIONS } from "./reader-questions.js";
import { mediaBuyerLane, mediaBuyerRank, roleSeverity, type AudienceRole } from "./audience.js";
import { AD_EFFECT_CHIP, AD_EFFECT_ROLES, AD_EFFECT_SIZE_LABEL, adEffectOf, adEffectSize } from "./ad-impact.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "assets");

// Optimizers website palette (computed from optimizers.agency): green-black
// page, near-black cards, white ink at stepped opacities flattened to solids,
// Optimizers Green as the accent, the site's amber and slate blue for
// medium/low severity. Coral marks critical failures. INK_3 still clears
// 4.5:1 on the page for small text.
const PAGE = "#020601"; // site body
const PAGE_SOFT = "#0f120e"; // site cards
const NAVY = "#050905"; // top bar
const NAVY_DEEP = "#000000"; // footer
const INK = "#ffffff";
const INK_2 = "#b8bab7"; // ~white .72
const INK_3 = "#8e908d"; // ~white .55
const LINE = "rgba(255,255,255,.06)";
const LINE_STRONG = "rgba(255,255,255,.12)";
const GREEN_FILL = "#6ae499";
const GREEN = "#6ae499";
const AMBER = "#fcd34d";
const BLUE = "#87a2cf";
const RED = "#ff6b57";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";

// Three possible category combinations run per audit (see scoring.ts's
// countedCategories, always exactly 50 checks): GA4+GTM together, one
// tracking tool + Website together, or Website alone. result.categories
// already holds exactly the one route's categories.
const CATEGORY_LABELS: Record<CategoryKey, string> = {
  GA4: "Google Analytics 4",
  GTM: "Google Tag Manager",
  Website: "Website & CRO",
};

const CATEGORY_SHORT: Record<CategoryKey, [string, string]> = {
  GA4: ["GA4", "GA4"],
  GTM: ["GTM", "GTM"],
  Website: ["Website", "الموقع"],
};

const CATEGORY_ICON: Record<CategoryKey, string> = {
  GA4: "chart-growth.png",
  GTM: "tag.png",
  Website: "cart.png",
};

// Plain-language "where this came from" line shown under each section title.
// Worded as "checking your setup", not "reviewing your account": GA4/GTM can
// also be audited from public detection when no Google access was granted.
const CATEGORY_CAPTION: Record<CategoryKey, string> = {
  GA4: "Google Analytics 4 is the tool that counts your visitors and sales. We checked what it records, which actions it counts as sales, and whether its numbers add up.",
  GTM: "Google Tag Manager loads the tracking codes on your site. We checked which codes it loads and whether each one runs at the right moment.",
  Website: "We visited your site the way a customer would. We checked its tracking, how fast its pages load, and how easy it is to buy.",
};

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  critical: "Critical",
  medium: "Medium",
  low: "Low",
};

const DATA_SOURCE_LABEL: Record<string, string> = {
  live: "Live data",
  detection: "Detected",
  public: "Public data",
};

// Section anchor ids, fixed rather than derived from the labels since they
// have to be valid HTML id fragments.
const SECTION_SLUG: Record<CategoryKey, string> = {
  GA4: "ga4",
  GTM: "gtm",
  Website: "website",
};

// ---- Arabic (MSA) counterparts of the chrome dictionaries above.
// Per-finding text is translated separately, per audit, by translate-ar.ts;
// this is only the static report scaffolding that's identical on every run.
const CATEGORY_LABELS_AR: Record<CategoryKey, string> = {
  GA4: "تحليلات جوجل 4 (GA4)",
  GTM: "مدير علامات جوجل (GTM)",
  Website: "الموقع الإلكتروني وتحسين التحويل",
};

const CATEGORY_CAPTION_AR: Record<CategoryKey, string> = {
  GA4: "تحليلات جوجل 4 هي الأداة التي تحسب زوارك ومبيعاتك. فحصنا ما تسجّله، وأي الإجراءات تحتسبها مبيعات، وهل أرقامها صحيحة.",
  GTM: "مدير علامات جوجل يشغّل أكواد التتبع على موقعك. فحصنا أي الأكواد يشغّلها، وهل يعمل كل كود في اللحظة الصحيحة.",
  Website: "زرنا موقعك كما يزوره أي عميل. فحصنا التتبع فيه، وسرعة تحميل صفحاته، ومدى سهولة الشراء منه.",
};

// On the Website-alone route (visitor had neither GA4 nor GTM), Website IS
// the whole audit, so it drops the CRO framing for a name that matches what
// it evaluates: live-site code + browser devtools signals.
function categoryLabel(key: CategoryKey, result: AuditResult, ar: boolean): string {
  if (key === "Website" && result.categories.length === 1 && result.categories[0].category === "Website") {
    return ar ? "كود الموقع وأدوات المطوّر (DevTools)" : "Website Code & DevTools";
  }
  return ar ? CATEGORY_LABELS_AR[key] : CATEGORY_LABELS[key];
}

const SEVERITY_LABEL_AR: Record<FindingSeverity, string> = {
  critical: "حرج",
  medium: "متوسط",
  low: "منخفض",
};

const DATA_SOURCE_LABEL_AR: Record<string, string> = {
  live: "بيانات مباشرة",
  detection: "تم رصده",
  public: "بيانات عامة",
};

export interface AuditHtmlReport {
  html: string;
}

// Percent-encoded paths in finding text ("/ar-sa/products/%D8%B9…") shown
// readable; anything that is not valid UTF-8 stays as it was.
function decodePaths(value: string): string {
  return value.replace(/(?:%[0-9A-Fa-f]{2})+/g, m => { try { return decodeURIComponent(m); } catch { return m; } });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Bilingual inline text: an English and an Arabic copy of the same static UI
 * string as sibling spans, so the CSS-only EN/AR toggle (#i18n-en/#i18n-ar)
 * can show exactly one. dir="rtl" sits on the Arabic copy permanently, so
 * Arabic bidi rendering never depends on JavaScript.
 */
function bi(en: string, ar: string): string {
  return `<span class="i18n-en">${escapeHtml(en)}</span><span class="i18n-ar" dir="rtl">${escapeHtml(ar)}</span>`;
}

/** Same as `bi`, for fragments that are already-safe HTML on one or both sides. */
function biHtml(enHtml: string, arHtml: string): string {
  return `<span class="i18n-en">${enHtml}</span><span class="i18n-ar" dir="rtl">${arHtml}</span>`;
}

// Arabic numeral-noun agreement for "check(s)" (بند) is irregular
// (singular/dual/plural-genitive/singular-accusative all differ).
function arChecksNoun(n: number): string {
  if (n === 1) return "بند";
  if (n === 2) return "بندان";
  if (n >= 3 && n <= 10) return "بنود";
  return "بندًا";
}

function checksWord(n: number): string {
  return n === 1 ? "check" : "checks";
}

// Percent of checks passed. No letter grade on purpose: a mid-range score read
// as a harsh "F", so the color alone carries the verdict (0-40 red, 40-80
// amber, 80+ green, i.e. 0-20 / 20-40 / 40-50 on a 50-check audit).
function scoreColor(percent: number): string {
  if (percent >= 80) return GREEN;
  if (percent >= 40) return AMBER;
  return RED;
}

// Google's own PageSpeed bands, so the numbers read the same as in
// PageSpeed Insights itself.
function speedColor(score: number): string {
  if (score >= 90) return GREEN;
  if (score >= 50) return AMBER;
  return RED;
}

/**
 * Failed checks by severity, plus the passed total. Only FAILED findings
 * count toward critical/medium/low: every check carries a severity whether
 * it passed or not (it's how much the check matters), so counting all
 * findings reported "16 critical issues" on a run where 2 critical checks
 * had failed.
 */
function resultCounts(result: AuditResult) {
  let critical = 0;
  let medium = 0;
  let low = 0;
  for (const cat of result.categories) {
    for (const finding of cat.findings) {
      if (finding.status !== "fail") continue;
      if (finding.severity === "critical") critical++;
      if (finding.severity === "medium") medium++;
      if (finding.severity === "low") low++;
    }
  }
  const failed = critical + medium + low;
  return { critical, medium, low, failed, passed: result.overallScore, total: result.possiblePoints };
}

async function dataUri(relativePath: string, mime: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:${mime};base64,${file.toString("base64")}`;
}

async function fontFaceUri(relativePath: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:font/woff2;base64,${file.toString("base64")}`;
}

// Everything is inlined so the report stays one self-contained file: the
// wordmark, Sora (display) + Inter (body) per the brand tokens, Noto Sans
// Arabic (the main site's Arabic face, src/styles/fonts.css), and the three
// category icons.
async function brandAssets() {
  const [wordmark, icon, sora400, sora600, sora700, inter400, inter500, inter600, ar400, ar600, ar700, ...categoryIcons] = await Promise.all([
    dataUri("wordmark-white-trim.png", "image/png"),
    dataUri("icon-white-trim.png", "image/png"),
    fontFaceUri("Sora-Regular.woff2"),
    fontFaceUri("Sora-SemiBold.woff2"),
    fontFaceUri("Sora-Bold.woff2"),
    fontFaceUri("Inter-Regular.woff2"),
    fontFaceUri("Inter-Medium.woff2"),
    fontFaceUri("Inter-SemiBold.woff2"),
    fontFaceUri("NotoSansArabic-Regular.woff2"),
    fontFaceUri("NotoSansArabic-SemiBold.woff2"),
    fontFaceUri("NotoSansArabic-Bold.woff2"),
    ...(Object.keys(CATEGORY_ICON) as CategoryKey[]).map(k => dataUri(`icons/${CATEGORY_ICON[k]}`, "image/png")),
  ]);
  const categoryKeys = Object.keys(CATEGORY_ICON) as CategoryKey[];
  const categoryIconMap = Object.fromEntries(categoryKeys.map((k, i) => [k, categoryIcons[i]])) as Record<CategoryKey, string>;
  return { wordmark, icon, sora400, sora600, sora700, inter400, inter500, inter600, ar400, ar600, ar700, categoryIconMap };
}

type BrandAssets = Awaited<ReturnType<typeof brandAssets>>;

// GSAP core + ScrollTrigger, inlined like the fonts so the report stays one
// file that works offline. Read once per process.
const requireFromHere = createRequire(import.meta.url);
let motionLibsCache: Promise<string> | null = null;
function motionLibs(): Promise<string> {
  motionLibsCache ??= Promise.all(
    ["gsap/dist/gsap.min.js", "gsap/dist/ScrollTrigger.min.js"].map(m => readFile(requireFromHere.resolve(m), "utf8")),
  ).then(files => files.join(";\n"));
  return motionLibsCache;
}

function fontFace(family: string, weight: number, uri: string): string {
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:swap;src:url("${uri}") format("woff2");}`;
}

// "Website" is the only category whose checklist size varies by route: the
// full 50-item WEBSITE_CHECKLIST when the visitor has neither GA4 nor GTM, or
// the curated 25-item WEBSITE_CODE_CHECKLIST alongside one tracking tool.
// checklistTally.total already reflects which one ran.
function checklistForDisplay(category: CategoryKey, total: number, findingIds: string[] = []): ChecklistPoint[] {
  // A store owner's or media buyer's audit ran that reader's own points.
  const persona = personaOfFindings(findingIds);
  if (persona) return personaChecklistFor(persona, category, total === 50 ? [] : ["GA4"]);
  const current = category === "GA4" ? GA4_CHECKLIST : category === "GTM" ? GTM_CHECKLIST : total === WEBSITE_CODE_CHECKLIST.length ? WEBSITE_CODE_CHECKLIST : WEBSITE_CHECKLIST;
  // A result scored before the action-point rewrite cites the old ids.
  if (findingIds.length && !findingIds.some(id => current.some(p => p.id === id))) {
    if (category === "GA4") return LEGACY_GA4_CHECKLIST;
    if (category === "GTM") return LEGACY_GTM_CHECKLIST;
    return total === LEGACY_WEBSITE_CODE_CHECKLIST.length ? LEGACY_WEBSITE_CODE_CHECKLIST : LEGACY_WEBSITE_CHECKLIST;
  }
  return current;
}

function techToggleId(cat: Pick<CategoryResult, "category">, point: Pick<ChecklistPoint, "id">): string {
  return `tech-${cat.category}-${point.id}`.replace(/[^A-Za-z0-9_-]/g, "-");
}

function rowId(cat: Pick<CategoryResult, "category">, point: Pick<ChecklistPoint, "id">): string {
  return `row-${techToggleId(cat, point)}`;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const SEVERITY_RANK: Record<FindingSeverity, number> = { critical: 0, medium: 1, low: 2 };

// Checks inside each tool's section, split by what kind of check they are.
// Ids not listed land in a trailing "Other checks" group, so a checklist.ts
// addition never silently disappears from the report.
const GA4_DATA_IDS = Array.from({ length: 15 }, (_, i) => `GA4-D${i + 1}`);
const CHECK_GROUPS: Record<CategoryKey, Array<{ en: string; ar: string; ids: string[] }>> = {
  GA4: [
    { en: "What your data is telling you", ar: "ما تخبرك به بياناتك", ids: GA4_DATA_IDS },
    { en: "Sales, leads & event tracking", ar: "تتبع المبيعات والعملاء المحتملين والأحداث", ids: ["GA4-3", "GA4-12", "GA4-13"] },
    { en: "Account setup & attribution", ar: "إعداد الحساب وإسناد التحويلات", ids: ["GA4-1", "GA4-4", "GA4-8"] },
    { en: "Privacy & data protection", ar: "الخصوصية وحماية البيانات", ids: ["GA4-2", "GA4-5", "GA4-6", "GA4-10"] },
  ],
  GTM: [
    { en: "Installation & setup", ar: "التثبيت والإعداد", ids: ["GTM-1", "GTM-2", "GTM-3", "GTM-4", "GTM-5"] },
    { en: "Data accuracy", ar: "دقة البيانات", ids: ["GTM-6", "GTM-7", "GTM-8", "GTM-9", "GTM-10", "GTM-11"] },
    { en: "Container cleanup & site speed", ar: "تنظيف الحاوية وسرعة الموقع", ids: ["GTM-12", "GTM-13", "GTM-14", "GTM-15"] },
    { en: "Privacy & consent", ar: "الخصوصية والموافقة", ids: ["GTM-16", "GTM-17", "GTM-18", "GTM-19"] },
    { en: "Advanced tracking", ar: "التتبع المتقدم", ids: ["GTM-20", "GTM-21", "GTM-22", "GTM-23", "GTM-24", "GTM-25"] },
  ],
  Website: [
    { en: "Tracking, data & consent", ar: "التتبع والبيانات والموافقة", ids: ["WEB-1", "WEB-2", "WEB-3", "WEB-4", "WEB-5", "WEB-6", "WEB-7", "WEB-16", "WEB-17", "WEB-24", "WEB-50", "WEB-57", "WEB-58", "WEB-59"] },
    { en: "Errors, checkout & mobile experience", ar: "الأخطاء وصفحة الدفع وتجربة الموبايل", ids: ["WEB-14", "WEB-15", "WEB-18", "WEB-21", "WEB-23", "WEB-26", "WEB-54", "WEB-56"] },
    { en: "Speed & performance", ar: "السرعة والأداء", ids: ["WEB-8", "WEB-13", "WEB-60", "WEB-61", "WEB-62", "WEB-63"] },
    { en: "Security & trust", ar: "الأمان والثقة", ids: ["WEB-22", "WEB-27", "WEB-28", "WEB-29", "WEB-30", "WEB-31", "WEB-32", "WEB-33", "WEB-34"] },
    { en: "Search visibility & accessibility", ar: "الظهور في البحث وسهولة الوصول", ids: ["WEB-35", "WEB-36", "WEB-37", "WEB-38", "WEB-40", "WEB-41", "WEB-42", "WEB-55", "WEB-43", "WEB-44", "WEB-45", "WEB-46", "WEB-49"] },
  ],
};

function groupChecklist(key: CategoryKey, checklist: ChecklistPoint[]) {
  // Action-point checklists carry their own section per point.
  if (checklist.some(p => p.group)) {
    const order = [...new Set(checklist.map(p => p.group ?? "other"))];
    return order.map(g => ({
      en: CHECK_GROUP_LABELS[g]?.en ?? "Other checks",
      ar: CHECK_GROUP_LABELS[g]?.ar ?? "بنود أخرى",
      points: checklist.filter(p => (p.group ?? "other") === g),
    }));
  }
  const byId = new Map(checklist.map(p => [p.id, p]));
  const used = new Set<string>();
  const groups = CHECK_GROUPS[key].map(g => {
    const points = g.ids.map(id => byId.get(id)).filter((p): p is ChecklistPoint => Boolean(p));
    points.forEach(p => used.add(p.id));
    return { en: g.en, ar: g.ar, points };
  });
  const rest = checklist.filter(p => !used.has(p.id));
  if (rest.length) groups.push({ en: "Other checks", ar: "بنود أخرى", points: rest });
  return groups.filter(g => g.points.length > 0);
}

const CHEVRON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW = `<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ALERT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5L2.5 20h19L12 3.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.15" fill="currentColor"/></svg>`;

// Severity as a small colored dot + word, never color alone and never a
// filled pill: problems read clearly without shouting (PRODUCT.md principle 4).
function severityTag(sev: FindingSeverity): string {
  return `<span class="sev sev--${sev}">${bi(SEVERITY_LABEL[sev], SEVERITY_LABEL_AR[sev])}</span>`;
}

// ---- summary: the opening of the document ----
// Leads with the answer in a sentence, then the few facts behind it as a
// plain key/value list (per tool, plus mobile speed when it ran).
function summaryHtml(result: AuditResult, counts: ReturnType<typeof resultCounts>, generatedAt: string, generatedAtAr: string, contactUrl: string, shots = ""): string {
  const name = escapeHtml(result.businessName || hostOf(result.websiteUrl));
  const percent = counts.total > 0 ? (counts.passed / counts.total) * 100 : 0;
  const color = scoreColor(percent);

  const headlineEn = `<span class="client-name">${name}</span> passed <span class="hl" style="--c:${color}"><span class="count" data-to="${counts.passed}">${counts.passed}</span> of ${counts.total}</span> checks`;
  const headlineAr = `اجتاز <span class="client-name">${name}</span> <span class="hl" style="--c:${color}"><span class="count" data-to="${counts.passed}">${counts.passed}</span> من ${counts.total}</span> ${arChecksNoun(counts.total)}`;
  const copy = copyFor(result);
  const [leadEn, leadAr] = counts.failed > 0 ? copy.lead(counts, result) : copy.leadPass;

  const facts = result.categories.map(cat => {
    const { passed, total } = cat.checklistTally;
    const p = total > 0 ? (passed / total) * 100 : 0;
    return `
          <div class="fact">
            <dt>${biHtml(escapeHtml(categoryLabel(cat.category, result, false)), escapeHtml(categoryLabel(cat.category, result, true)))}</dt>
            <dd><a href="#sec-${SECTION_SLUG[cat.category]}"><b class="count" data-to="${passed}" style="color:${scoreColor(p)}">${passed}</b> / ${total} ${bi("passed", "ناجح")}</a><span class="bar"><span style="width:${p.toFixed(1)}%;background:${scoreColor(p)}"></span></span></dd>
          </div>`;
  });
  // Purchase friction is its own score, never part of the passed-checks
  // headline above it; shown only when there was enough coverage for one.
  const friction = result.fud?.score;
  if (friction !== null && friction !== undefined) {
    facts.push(`
          <div class="fact">
            <dt>${bi("Conversion score", "مؤشر التحويل")}</dt>
            <dd><a href="#friction"><b class="count" data-to="${friction}" style="color:${scoreColor(friction)}">${friction}</b> / 100</a><span class="bar"><span style="width:${friction}%;background:${scoreColor(friction)}"></span></span></dd>
          </div>`);
  }
  const mobile = result.pageSpeed?.average.mobile;
  if (mobile !== null && mobile !== undefined) {
    facts.push(`
          <div class="fact">
            <dt>${bi("Page speed on mobile", "سرعة الصفحات على الموبايل")}</dt>
            <dd><a href="#speed"><b class="count" data-to="${mobile}" style="color:${speedColor(mobile)}">${mobile}</b> / 100 ${bi("average", "متوسط")}</a><span class="bar"><span style="width:${mobile}%;background:${speedColor(mobile)}"></span></span></dd>
          </div>`);
  }

  const alert = counts.critical > 0
    ? `
        <div class="callout callout--critical" role="note">
          ${ALERT_ICON}
          <p>${bi(
            `${counts.critical} critical ${checksWord(counts.critical)} failed. Fix ${counts.critical === 1 ? "it" : "them"} before anything else.`,
            `${counts.critical} ${arChecksNoun(counts.critical)} حرجة لم تجتز الفحص. ابدأ بإصلاحها قبل أي شيء آخر.`,
          )}</p>
        </div>`
    : "";

  return `
      <section class="doc-section summary" id="overview">
        <div class="hero-fx" aria-hidden="true"><span class="glow glow--a"></span><span class="glow glow--b"></span><span class="gate gate--l"></span><span class="gate gate--r"></span></div>
        <p class="crumbs">${bi("Free store audit", "تدقيق مجاني لمتجرك")}<span aria-hidden="true">/</span><span dir="ltr">${escapeHtml(hostOf(result.websiteUrl))}</span><span aria-hidden="true">/</span>${biHtml(escapeHtml(generatedAt), escapeHtml(generatedAtAr))}</p>
        <h1>${biHtml(headlineEn, headlineAr)}</h1>
        ${shots}
        <p class="lead">${bi(leadEn, leadAr)}</p>
        ${alert}
        <dl class="facts">${facts.join("")}</dl>
        <div class="actions">
          <a class="btn btn--primary magnetic" href="${contactUrl}">${bi("Book a free call", "احجز مكالمة مجانية")}</a>
          ${counts.failed > 0 ? `<a class="btn btn--link" href="#fix-first">${bi(...copy.fixLink)}${ARROW}</a>` : ""}
        </div>
      </section>`;
}

// ---- screenshots ----
// Best-effort (screenshots.ts): renders nothing when neither shot came back,
// and just the one it has when only one did.
function screenshotsHtml(result: AuditResult): string {
  const shots = result.screenshots;
  if (!shots?.desktop && !shots?.mobile) return "";
  const host = escapeHtml(hostOf(result.websiteUrl));
  const desktop = shots?.desktop
    ? `
          <figure class="shot shot--desktop">
            <div class="shot-frame"><img src="${shots.desktop}" alt="Your homepage on a 1440 pixel wide desktop screen, ${host}" /><span class="shot-bar" aria-hidden="true"><span></span></span></div>
            <figcaption>${bi("Desktop, 1440 × 900", "سطح المكتب، 1440 × 900")}</figcaption>
          </figure>`
    : "";
  const mobile = shots?.mobile
    ? `
          <figure class="shot shot--mobile">
            <div class="shot-frame"><img src="${shots.mobile}" alt="Your homepage on a 390 pixel wide phone screen, ${host}" /><span class="shot-bar" aria-hidden="true"><span></span></span></div>
            <figcaption>${bi("Mobile, 390 × 844", "الموبايل، 390 × 844")}</figcaption>
          </figure>`
    : "";
  // Sits right under the report's headline (every hero takes it), so the
  // reader sees their own store before any finding.
  return `
        <div class="hero-shots" id="screens">
          <div class="shots"><span class="shots-glow" aria-hidden="true"></span>${desktop}${mobile}</div>
          <p class="shots-note">${bi("Your homepage on desktop and on a phone, the day we ran the audit.", "صفحتك الرئيسية على الكمبيوتر وعلى الهاتف، يوم إجراء التدقيق.")}</p>
        </div>`;
}

// ---- the first section after the summary: one per reader ----
// audience.ts: every reader gets the same 50 checks. This section, the copy
// around the checks and the call to action are where each reader's report
// differs (icp/*.md, from the ICP cards). No role (rows from before the
// field) keeps the original "Fix these first" list.

type FailedRow = { cat: CategoryResult; f: CategoryResult["findings"][number] };
type Money = NonNullable<FindingAction["money"]>;

function failedRows(result: AuditResult): FailedRow[] {
  return result.categories.flatMap(cat => cat.findings.filter(f => f.status === "fail").map(f => ({ cat, f })));
}

function bySeverity(rows: FailedRow[]): FailedRow[] {
  return [...rows].sort((a, b) => SEVERITY_RANK[a.f.severity] - SEVERITY_RANK[b.f.severity]);
}

// Points with a GA4 money range first (biggest first), then by severity.
function byMoney(rows: FailedRow[]): FailedRow[] {
  return [...rows].sort((a, b) => (b.f.action?.money?.high ?? 0) - (a.f.action?.money?.high ?? 0) || SEVERITY_RANK[a.f.severity] - SEVERITY_RANK[b.f.severity]);
}

function laneCounts(result: AuditResult): { signal: number; postClick: number } {
  const rows = failedRows(result);
  return {
    signal: rows.filter(r => mediaBuyerLane(r.f.checklistId) === "signal").length,
    postClick: rows.filter(r => mediaBuyerLane(r.f.checklistId) === "post_click").length,
  };
}

// Fixes that need no developer: the store owner, content or marketing can
// make them in the store admin.
function isDiy(f: FailedRow["f"]): boolean {
  return Boolean(f.action?.owners?.length) && !f.action!.owners.includes("dev");
}

function moneyRange(m: Money): string {
  return `${formatMoney(m.low, m.currency)}–${formatMoney(m.high, m.currency)}`;
}

// Tile-sized: "SAR 723K–1.45M". Same numbers, rounded for a narrow box.
function moneyRangeShort(m: Money): string {
  const short = (n: number) => { const c = compactMoney(n); return `${c.dec ? c.value.toFixed(c.dec).replace(/.?0+$/, "") : c.value.toLocaleString("en-US")}${c.en}`; };
  return `${m.currency ? `${m.currency} ` : ""}${short(m.low)}–${short(m.high)}`;
}

// The single biggest money range among failed points. One number, never a
// sum: overlapping GA4 points would count the same sales twice.
function biggestMoney(result: AuditResult): { row: FailedRow; money: Money } | null {
  const top = byMoney(failedRows(result)).find(r => r.f.action?.money);
  return top ? { row: top, money: top.f.action!.money! } : null;
}

function periodOf(result: AuditResult): number {
  return result.ga4Facts?.periodDays ?? result.ga4Metrics?.periodDays ?? 28;
}

function fixItemsHtml(rows: FailedRow[], extra?: (r: FailedRow) => string): string {
  return rows
    .map((r, i) => {
      const { cat, f } = r;
      const ar = f.ar?.business ?? f.business;
      const [shortEn, shortAr] = CATEGORY_SHORT[cat.category];
      return `
          <li class="beam" style="--bd:-${i * 4}s">
            <a href="#${rowId(cat, { id: f.checklistId })}">
              <span class="fix-meta">${severityTag(f.severity)}<span>${bi(shortEn, shortAr)}</span>${extra ? extra(r) : ""}</span>
              <span class="fix-title">${biHtml(escapeHtml(f.business.summary), escapeHtml(ar.summary))}</span>
            </a>
          </li>`;
    })
    .join("");
}

const effortTag = ({ f }: FailedRow): string =>
  !f.action ? "" : isDiy(f)
    ? `<span class="fix-tag fix-tag--diy">${bi("You can do this", "تقدر تسويه بنفسك")}</span>`
    : `<span class="fix-tag">${bi("Needs a developer", "يحتاج مطوّر")}</span>`;

// Which way the point moves ROAS/CAC (ad-impact.ts), for the readers judged
// on them. A direction and, when GA4 gave a money range, a size band.
function adEffectChip(result: AuditResult | undefined, f: FailedRow["f"]): string {
  if (!result?.audienceRole || !AD_EFFECT_ROLES.has(result.audienceRole) || f.status !== "fail") return "";
  const effect = adEffectOf(f.checklistId);
  if (!effect) return "";
  const chip = AD_EFFECT_CHIP[effect];
  const size = effect === "performance" || effect === "aov" ? adEffectSize(f.action?.money ?? null, result) : null;
  const sizeEn = size ? ` (est. ${AD_EFFECT_SIZE_LABEL[size].en})` : " (est.)";
  const sizeAr = size ? ` (تقدير: ${AD_EFFECT_SIZE_LABEL[size].ar})` : " (تقدير)";
  const m = `<bdi dir="ltr">${escapeHtml(chip.metrics)}</bdi>`;
  const arMetrics = effect === "inflated" ? `<bdi dir="ltr">ROAS</bdi> المُبلَّغ أعلى من الحقيقي` : effect === "deflated" ? `<bdi dir="ltr">ROAS</bdi> المُبلَّغ أقل من الحقيقي` : m;
  return `<span class="adfx adfx--${effect}">${biHtml(`${escapeHtml(chip.en)} ${m}${escapeHtml(sizeEn)}`, `${escapeHtml(chip.ar)} ${arMetrics}${escapeHtml(sizeAr)}`)}</span>`;
}

const ownerTag = ({ f }: FailedRow): string => (f.action?.owners?.length ? `<span class="fix-tag">${ownersBi(f.action.owners)}</span>` : "");

const moneyTag = ({ f }: FailedRow): string => (f.action?.money ? `<span class="fix-tag fix-tag--money">${bi(`${moneyRange(f.action.money)} / month`, `${moneyRange(f.action.money)} شهريًا`)}</span>` : "");

type Kpi = { value: string; en: string; ar: string };

function kpisHtml(tiles: Kpi[]): string {
  if (!tiles.length) return "";
  return `
        <dl class="rkpis">${tiles.map(t => `
          <div class="rkpi"><dt>${bi(t.en, t.ar)}</dt><dd dir="ltr">${escapeHtml(t.value)}</dd></div>`).join("")}
        </dl>`;
}

// The store's own GA4 numbers, as tiles. Conversion rate is purchases over
// visits (never key events), already sanitised in ga4Metrics.
function storeKpis(result: AuditResult, want: Array<"cr" | "aov" | "revenue" | "step">): Kpi[] {
  const m = result.ga4Metrics;
  const facts = result.ga4Facts;
  const currency = facts?.currency ?? m?.currency ?? null;
  const days = periodOf(result);
  const out: Kpi[] = [];
  for (const k of want) {
    if (k === "cr" && typeof m?.conversionRate === "number" && m.conversionRate > 0 && m.conversionRate <= 100) {
      out.push({ value: `${fmtPct(m.conversionRate)}%`, en: "Conversion rate", ar: "معدل التحويل" });
    }
    if (k === "aov" && facts?.aov) out.push({ value: formatMoney(facts.aov, currency), en: "Average order value", ar: "متوسط قيمة الطلب" });
    if (k === "revenue" && (facts?.revenue ?? m?.revenue)) {
      out.push({ value: formatMoney((facts?.revenue ?? m?.revenue)!, currency), en: `Revenue, last ${days} days`, ar: `الإيرادات، آخر ${days} يومًا` });
    }
    if (k === "step" && facts?.focus.step) {
      const s = facts.focus.step;
      out.push({ value: `${fmtPct(s.rate * 100)}% vs ${fmtPct(s.benchmark * 100)}%`, en: `Weakest step: ${s.from} → ${s.to} (vs benchmark)`, ar: `أضعف خطوة: ${s.from} ← ${s.to} (مقابل المعيار)` });
    }
  }
  return out;
}

function storeOwnerFirstHtml(result: AuditResult): string {
  const rows = byMoney(failedRows(result));
  if (!rows.length) return "";
  const big = biggestMoney(result);
  const diy = rows.filter(r => isDiy(r.f)).length;
  const hero = big
    ? `
        <p class="money-hero">${bi(`Your biggest leak: about ${moneyRange(big.money)} a month`, `أكبر تسريب في متجرك: نحو ${moneyRange(big.money)} شهريًا`)}</p>
        <p class="money-src">${biHtml(
          `${escapeHtml(big.row.f.business.summary)} <span class="src">Source: your own GA4 data, last ${periodOf(result)} days. An estimate, not a promise.</span>`,
          `${escapeHtml((big.row.f.ar?.business ?? big.row.f.business).summary)} <span class="src">المصدر: بيانات GA4 الخاصة بمتجرك، آخر ${periodOf(result)} يومًا. تقدير وليس وعدًا.</span>`,
        )}</p>`
    : "";
  return `
      <section class="doc-section" id="fix-first">
        <h2>${bi("What's costing you sales", "وش اللي يكلّفك مبيعات")}</h2>
        ${hero}
        ${kpisHtml(storeKpis(result, ["cr", "aov"]))}
        <p class="section-lead">${bi(
          `Start with number 1. ${diy} of the ${rows.length} fixes don't need a developer: you can make them yourself in your store admin.`,
          `ابدأ بالرقم 1. ${diy} من ${rows.length} إصلاحات ما تحتاج مطوّر، تقدر تسويها بنفسك من لوحة تحكم متجرك.`,
        )}</p>
        <ol class="fix-list">${fixItemsHtml(dedupeFunnel(rows, result).slice(0, 3), r => `${moneyTag(r)}${effortTag(r)}`)}</ol>
      </section>`;
}

// The ROAS line under the heading: the store's own conversion rate when GA4
// gave one (purchases / visits, never key events), else the plain formula.
function roasMathHtml(result: AuditResult): string {
  const cr = result.ga4Metrics?.conversionRate;
  if (typeof cr === "number" && cr > 0 && cr <= 100) {
    const up = cr * 1.2;
    return bi(
      `ROAS = conversion rate × AOV ÷ CPC. The store converts ${fmtPct(cr)}% of visits today. Lifting that to ${fmtPct(up)}% lifts ROAS by about 20% and cuts CPA by about 17% on the same spend and the same ads.`,
      `ROAS = معدل التحويل × AOV ÷ CPC. يحوّل المتجر اليوم ${fmtPct(cr)}% من الزيارات. رفعه إلى ${fmtPct(up)}% يرفع ROAS بنحو 20% ويخفض CPA بنحو 17% بنفس الإنفاق ونفس الإعلانات.`,
    );
  }
  return bi(
    "ROAS = conversion rate × AOV ÷ CPC. Two of the three live on the site, so every leak fixed after the click raises ROAS on the same spend.",
    "ROAS = معدل التحويل × AOV ÷ CPC. اثنان من الثلاثة على الموقع، لذلك كل تسريب يُصلَح بعد الضغط على الإعلان يرفع ROAS بنفس الإنفاق.",
  );
}

function laneHtml(en: string, ar: string, leadEn: string, leadAr: string, list: FailedRow[], emptyEn: string, emptyAr: string, extra?: (r: FailedRow) => string): string {
  return `
        <div class="lane">
          <h3 class="lane-head">${bi(en, ar)}</h3>
          <p class="lane-lead">${bi(leadEn, leadAr)}</p>
          ${list.length ? `<ol class="fix-list">${fixItemsHtml(list, extra)}</ol>` : `<p class="lane-empty">${bi(emptyEn, emptyAr)}</p>`}
        </div>`;
}

// "Is the number real?" in one line: which way the failing tracking points
// bias reported ROAS (ad-impact.ts). Counted, not estimated.
function roasVerdictHtml(result: AuditResult): string {
  const rows = failedRows(result);
  const up = rows.filter(r => adEffectOf(r.f.checklistId) === "inflated").length;
  const down = rows.filter(r => adEffectOf(r.f.checklistId) === "deflated").length;
  if (!up && !down) {
    return `<p class="verdict verdict--ok">${bi(
      "Reported ROAS: no tracking problem found that would push it up or down. Judge campaigns on it as it is.",
      "ROAS المُبلَّغ: لم نجد مشكلة تتبع ترفعه أو تخفضه. قيّم الحملات عليه كما هو.",
    )}</p>`;
  }
  const [en, ar] = up && down
    ? [`Reported ROAS is off in both directions: ${up} ${up === 1 ? "issue over-counts" : "issues over-count"} sales and ${down} ${down === 1 ? "under-counts" : "under-count"} or mis-credit them. Fix tracking before judging, scaling or cutting campaigns.`,
       `ROAS المُبلَّغ منحرف في الاتجاهين: ${up} مشكلة تحسب المبيعات أكثر من الحقيقي و${down} تحسبها أقل أو تنسبها لمصدر خاطئ. أصلح التتبع قبل تقييم الحملات أو زيادة ميزانيتها أو إيقافها.`]
    : up
      ? [`Reported ROAS likely reads higher than real: ${up} ${up === 1 ? "issue over-counts" : "issues over-count"} sales. Losing campaigns can look like winners until it's fixed.`,
         `ROAS المُبلَّغ غالبًا أعلى من الحقيقي: ${up} مشكلة تحسب المبيعات أكثر من الحقيقي. الحملات الخاسرة ممكن تبان رابحة لحد ما تتصلح.`]
      : [`Reported ROAS likely reads lower than real: ${down} ${down === 1 ? "issue misses or mis-credits" : "issues miss or mis-credit"} sales. Winning campaigns can get cut, and the algorithm learns from fewer sales.`,
         `ROAS المُبلَّغ غالبًا أقل من الحقيقي: ${down} مشكلة تفوّت مبيعات أو تنسبها لمصدر خاطئ. الحملات الرابحة ممكن تتوقف، والخوارزمية بتتعلم من مبيعات أقل.`];
  return `<p class="verdict">${bi(en, ar)}</p>`;
}

function mediaBuyerFirstHtml(result: AuditResult): string {
  const rows = failedRows(result).sort((a, b) => mediaBuyerRank(a.f.checklistId, SEVERITY_RANK[a.f.severity]) - mediaBuyerRank(b.f.checklistId, SEVERITY_RANK[b.f.severity]));
  const signal = rows.filter(r => mediaBuyerLane(r.f.checklistId) === "signal").slice(0, 3);
  const postClick = dedupeFunnel(rows.filter(r => mediaBuyerLane(r.f.checklistId) === "post_click"), result).slice(0, 3);
  if (signal.length === 0 && postClick.length === 0) return "";
  return `
      <section class="doc-section" id="fix-first">
        <h2>${bi("What's holding your ROAS back", "ما الذي يحدّ من ROAS")}</h2>
        <p class="section-lead">${roasMathHtml(result)}</p>
        ${kpisHtml(storeKpis(result, ["cr", "aov", "step"]))}
        ${funnelStripHtml(result)}
        ${roasVerdictHtml(result)}
        ${laneHtml(
          "1. Is the number real?",
          "1. هل الرقم حقيقي؟",
          "What the ad platforms and GA4 see. A sale missed or counted twice makes the algorithm learn from the wrong data, and ROAS in Ads Manager stops matching real orders.",
          "ما تراه منصات الإعلانات وGA4. أي عملية شراء لا تُسجَّل أو تُسجَّل مرتين تجعل الخوارزمية تتعلم من بيانات خاطئة، فلا يطابق ROAS في Ads Manager الطلبات الحقيقية.",
          signal,
          "No tracking problems found. The ad platforms and GA4 get each sale as it happens.",
          "لم نجد مشكلات في التتبع. تستقبل منصات الإعلانات وGA4 كل عملية شراء كما تحدث.",
          r => `${adEffectChip(result, r.f)}${ownerTag(r)}`,
        )}
        ${laneHtml(
          "2. Does paid traffic convert?",
          "2. هل تتحوّل الزيارات المدفوعة؟",
          "What happens after the click: the steps, pages and speed that lose shoppers you already paid for.",
          "ما يحدث بعد الضغط على الإعلان: الخطوات والصفحات والسرعة التي تُضيّع متسوقين دفعت ثمن وصولهم.",
          postClick,
          "No post-click leaks found in the steps we could measure.",
          "لم نجد تسريبات بعد الضغط على الإعلان في الخطوات التي أمكن قياسها.",
          r => `${adEffectChip(result, r.f)}${ownerTag(r)}`,
        )}
        ${ownerHandoverHtml(result)}
        <p class="lane-note">${bi(
          "Every point names who has to fix it, so you can forward it to the store owner or developer as proof.",
          "كل بند يحدد مين لازم يصلحه، فتقدر تبعته لصاحب المتجر أو المطوّر كدليل.",
        )}</p>
      </section>`;
}

const TEAMS: ActionOwner[] = ["dev", "content", "marketing", "owner"];

function marketingManagerFirstHtml(result: AuditResult): string {
  const rows = byMoney(failedRows(result));
  if (!rows.length) return "";
  const big = biggestMoney(result);
  const tiles = storeKpis(result, ["cr", "revenue", "aov"]);
  if (big) tiles.push({ value: moneyRangeShort(big.money), en: "Biggest leak, a month", ar: "أكبر تسريب، شهريًا" });
  const teams = TEAMS.map(team => {
    const owned = rows.filter(r => r.f.action?.owners?.includes(team));
    if (!owned.length) return "";
    const top = owned[0].f;
    const topAr = (top.ar?.business ?? top.business).summary;
    return `
          <li><b>${bi(OWNER_LABEL[team].en, OWNER_LABEL[team].ar)}</b> <span class="team-n">${bi(`${owned.length} ${owned.length === 1 ? "fix" : "fixes"}`, `${owned.length} ${owned.length === 1 ? "إصلاح" : "إصلاحات"}`)}</span>
            <span class="team-top">${biHtml(`First: ${escapeHtml(top.business.summary)}`, `الأول: ${escapeHtml(topAr)}`)}</span></li>`;
  }).join("");
  return `
      <section class="doc-section" id="fix-first">
        <h2>${bi("Executive summary", "الملخص التنفيذي")}</h2>
        <p class="section-lead">${bi(
          "The short version for leadership: the store's numbers, the three fixes worth most, and which team owns each fix.",
          "النسخة المختصرة للإدارة: أرقام المتجر، وأهم ثلاثة إصلاحات من حيث القيمة، والفريق المسؤول عن كل إصلاح.",
        )}</p>
        ${kpisHtml(tiles)}
        ${funnelStripHtml(result)}
        <div class="lane">
          <h3 class="lane-head">${bi("Top 3 priorities", "أهم ثلاث أولويات")}</h3>
          <ol class="fix-list">${fixItemsHtml(dedupeFunnel(rows, result).slice(0, 3), r => `${moneyTag(r)}${adEffectChip(result, r.f)}${ownerTag(r)}`)}</ol>
        </div>
        ${teams ? `
        <div class="lane">
          <h3 class="lane-head">${bi("Who owns what", "من المسؤول عن ماذا")}</h3>
          <p class="lane-lead">${bi("Hand each team its list. Every point has the step, the owner and how to confirm it's done.", "سلّم كل فريق قائمته. كل بند فيه الخطوة والمسؤول وطريقة التأكد من الإنجاز.")}</p>
          <ul class="team-list">${teams}</ul>
        </div>` : ""}
      </section>`;
}

function agencyFirstHtml(result: AuditResult): string {
  const rows = bySeverity(failedRows(result));
  if (!rows.length) return "";
  const counts = resultCounts(result);
  const all = result.categories.flatMap(c => c.findings);
  const live = all.filter(f => f.dataSource === "live").length;
  const big = biggestMoney(result);
  const tiles: Kpi[] = [
    { value: `${counts.passed} / ${counts.total}`, en: "Checks passed", ar: "البنود الناجحة" },
    { value: String(counts.critical), en: "Critical issues", ar: "مشكلات حرجة" },
    { value: `${live} / ${all.length}`, en: "Findings from live account data", ar: "نتائج من بيانات الحساب المباشرة" },
  ];
  if (big) tiles.push({ value: moneyRangeShort(big.money), en: "Biggest leak, a month (GA4 estimate)", ar: "أكبر تسريب شهريًا (تقدير من GA4)" });
  const stream = (lane: ReturnType<typeof mediaBuyerLane>) => rows.filter(r => mediaBuyerLane(r.f.checklistId) === lane);
  const ws = (en: string, ar: string, leadEn: string, leadAr: string, list: FailedRow[]) =>
    list.length ? laneHtml(`${en} · ${list.length}`, `${ar} · ${list.length}`, leadEn, leadAr, list.slice(0, 3), "", "", r => `${adEffectChip(result, r.f)}${ownerTag(r)}`) : "";
  return `
      <section class="doc-section" id="fix-first">
        <h2>${bi("Client audit summary", "ملخص التدقيق للعميل")}</h2>
        <p class="section-lead">${bi(
          "Every number in this report comes from the store's own GA4, its tag setup or our visit to the store, and each finding says which. The workstreams below group the work for scoping.",
          "كل رقم في هذا التقرير مصدره بيانات GA4 الخاصة بالمتجر أو إعداد الوسوم أو زيارتنا للمتجر، وكل نتيجة توضح مصدرها. مسارات العمل أدناه تجمع المهام لتحديد نطاق العمل.",
        )}</p>
        ${kpisHtml(tiles)}
        ${ws("Tracking and data", "التتبع والبيانات", "What GA4 and the ad platforms record versus what really happened.", "ما يسجله GA4 ومنصات الإعلانات مقارنة بما حدث فعلًا.", stream("signal"))}
        ${ws("Conversion", "التحويل", "Funnel steps, landing pages, speed, cart and checkout.", "خطوات مسار التحويل وصفحات الهبوط والسرعة والسلة وإتمام الشراء.", stream("post_click"))}
        ${ws("Tech, trust and compliance", "التقنية والثقة والامتثال", "Security, privacy, search visibility and accessibility.", "الأمان والخصوصية والظهور في البحث وسهولة الوصول.", stream("other"))}
        <div class="method">
          <h3 class="lane-head">${bi("How this audit was made", "كيف أُعدّ هذا التدقيق")}</h3>
          <ul class="method-list">
            <li>${bi("50 fixed checks, each passed or failed against a stated standard (\u201cWhat good looks like\u201d on every finding).", "50 بندًا ثابتًا، كل بند ناجح أو غير ناجح مقابل معيار مذكور («شكل النتيجة السليمة» في كل نتيجة).")}</li>
            <li>${bi("Evidence: the store's GA4 and GTM through the account owner's Google sign-in, a phone-sized visit with one real add to cart (analytics blocked), and the public pages. Each finding says which.", "الأدلة: بيانات GA4 وGTM للمتجر عبر تسجيل دخول صاحب الحساب في Google، وزيارة بحجم الجوال مع إضافة حقيقية واحدة للسلة (مع حجب التحليلات)، والصفحات العامة. كل نتيجة توضح مصدرها.")}</li>
            <li>${bi("Money: closing 10% to 25% of the gap to the benchmark, never more than 10% of monthly revenue for one point, never summed across points.", "المبالغ: سد 10% إلى 25% من الفجوة عن المعيار، ولا تتجاوز 10% من الإيرادات الشهرية لبند واحد، ولا تُجمع بين البنود.")}</li>
            <li>${bi("Order: severity first, then money at stake, then fixes with no developer.", "الترتيب: الخطورة أولًا، ثم المبلغ المعرّض، ثم الإصلاحات التي لا تحتاج مطوّرًا.")}</li>
          </ul>
        </div>
      </section>`;
}

// ---- fix these first ----
// A real sequence (the order to work in), so it's a numbered list: the three
// most serious failed checks, worst first. The reader's own version replaces
// it when the form named one.
function fixFirstHtml(result: AuditResult): string {
  switch (result.audienceRole) {
    case "store_owner": return storeOwnerFirstHtml(result);
    case "media_buyer": return mediaBuyerFirstHtml(result);
    case "marketing_manager": return marketingManagerFirstHtml(result);
    case "agency": return agencyFirstHtml(result);
  }
  const top = bySeverity(failedRows(result)).slice(0, 3);
  if (top.length === 0) return "";
  return `
      <section class="doc-section" id="fix-first">
        <h2>${bi("Fix these first", "أصلح هذه أولًا")}</h2>
        <p class="section-lead">${bi("The problems costing your store the most. Start with number 1.", "المشكلات التي تكلّف متجرك أكثر من غيرها. ابدأ بالرقم 1.")}</p>
        <ol class="fix-list">${fixItemsHtml(top)}</ol>
      </section>`;
}

// ---- "What you asked, answered" (reader-questions.ts) ----
// The reader came with problems; this section answers each one, in their
// words, from this store's results: the findings behind it, or what was
// checked and came back clean.

function fudIssues(result: AuditResult, ids: string[] | undefined): FudFinding[] {
  const fud = result.fud;
  if (!fud || !ids?.length) return [];
  return fud.findings.filter(f => ids.includes(f.ruleId) && f.override?.to !== "hidden" && (f.status === "fail" || f.status === "warn"));
}

function questionsHtml(result: AuditResult): string {
  const role = result.audienceRole;
  if (!role) return "";
  const failed = failedRows(result);
  const cards = READER_QUESTIONS[role].map(q => {
    let rows: FailedRow[];
    if (q.kind === "diy") rows = byMoney(failed.filter(r => isDiy(r.f)));
    // A persona point answers the question its shared source points answer.
    else rows = byMoney(failed.filter(r => q.points.includes(r.f.checklistId) || (PERSONA_SHARED_SOURCES[r.f.checklistId] ?? []).some(id => q.points.includes(id))));
    rows = dedupeFunnel(rows, result);
    const fud = q.kind === "diy" ? [] : fudIssues(result, q.fud);
    const checked = q.kind === "diy" ? failed.length : q.points.length + (q.fud?.length ?? 0);
    const found = rows.length + fud.length;
    const big = q.kind === "money" ? rows.find(r => r.f.action?.money) : undefined;

    const verdict = found === 0
      ? `<p class="qa-verdict qa-verdict--ok">${bi(`No problem found. ${q.cleanEn}`, `لا توجد مشكلة. ${q.cleanAr}`)} <span class="qa-n">${bi(`${checked} checks behind this answer`, `${checked} فحصًا وراء هذه الإجابة`)}</span></p>`
      : q.kind === "diy"
        ? `<p class="qa-verdict">${bi(`${found} ${found === 1 ? "fix needs" : "fixes need"} no developer. Start with these:`, `${found} إصلاحات ما تحتاج مطوّر. ابدأ بهذي:`)}</p>`
        : `<p class="qa-verdict">${bi(`Yes: ${found} ${found === 1 ? "problem" : "problems"} found.`, `نعم: وجدنا ${found} ${found === 1 ? "مشكلة" : "مشكلات"}.`)}${big ? ` <b class="qa-money">${bi(`Biggest: about ${moneyRange(big.f.action!.money!)} a month (GA4 estimate).`, `الأكبر: نحو ${moneyRange(big.f.action!.money!)} شهريًا (تقدير من GA4).`)}</b>` : ""}</p>`;

    const items = [
      ...rows.slice(0, 3).map(({ cat, f }) => `<li><a href="#${rowId(cat, { id: f.checklistId })}">${biHtml(escapeHtml(f.business.summary), escapeHtml((f.ar?.business ?? f.business).summary))}</a></li>`),
      ...fud.slice(0, Math.max(0, 3 - Math.min(3, rows.length))).map(f => `<li><a href="#row-${`tech-FUD-${f.ruleId}`.replace(/[^A-Za-z0-9_-]/g, "-")}">${biHtml(escapeHtml(f.business.summary), escapeHtml((f.ar?.business ?? f.business).summary))}</a></li>`),
    ];
    const more = found > items.length ? `<p class="qa-more">${bi(`And ${found - items.length} more in the checks below.`, `و${found - items.length} أخرى في البنود أدناه.`)}</p>` : "";
    return `
        <article class="qa${found ? "" : " qa--ok"}">
          <h3 class="qa-q">${bi(q.en, q.ar)}</h3>
          ${verdict}
          ${items.length ? `<ul class="qa-list">${items.join("")}</ul>` : ""}
          ${more}
        </article>`;
  }).join("");
  return `
      <section class="doc-section" id="answers">
        <h2>${bi("What you asked, answered", "أسئلتك، وإجاباتها")}</h2>
        <p class="section-lead">${bi(
          "The questions people in your role bring us, answered from this store's own data. Each answer links to the checks behind it.",
          "الأسئلة اللي يجيبها لنا أصحاب دورك، وإجاباتها من بيانات هذا المتجر نفسه. كل إجابة مربوطة بالبنود اللي وراها.",
        )}</p>
        <div class="qa-grid">${cards}</div>
      </section>`;
}

// When the biggest funnel leak (GA4-01) is a step that has its own point,
// that point says the same thing again: keep GA4-01, drop the repeat.
const STEP_POINT: Record<string, string> = {
  "view_item>add_to_cart": "GA4-02",
  "add_to_cart>begin_checkout": "GA4-03",
  "begin_checkout>purchase": "GA4-04",
};

function dedupeFunnel(rows: FailedRow[], result: AuditResult): FailedRow[] {
  const step = result.ga4Facts?.focus.step;
  const repeat = step ? STEP_POINT[`${step.from}>${step.to}`] : undefined;
  if (!repeat || !rows.some(r => r.f.checklistId === "GA4-01")) return rows;
  return rows.filter(r => r.f.checklistId !== repeat);
}

// The funnel as a strip: each step's rate against its benchmark, from the
// store's own GA4 event counts.
const STRIP_LABEL: Record<string, [string, string]> = {
  view_item: ["Product views", "مشاهدات المنتج"],
  add_to_cart: ["Add to cart", "الإضافة للسلة"],
  begin_checkout: ["Checkout", "إتمام الشراء"],
  purchase: ["Purchase", "الشراء"],
};

function funnelStripHtml(result: AuditResult): string {
  const funnel = result.ga4Metrics?.funnel ?? [];
  const order = ["view_item", "add_to_cart", "begin_checkout", "purchase"];
  const steps = order.map(e => funnel.find(s => s.event === e)).filter((s): s is NonNullable<typeof s> => Boolean(s && s.count > 0));
  if (steps.length < 3) return "";
  const cells = steps.map((s, i) => {
    const [en, ar] = STRIP_LABEL[s.event] ?? [s.event, s.event];
    if (i === 0) return `<li class="fs-step"><span class="fs-name">${bi(en, ar)}</span><b dir="ltr">${fmtInt(s.count)}</b></li>`;
    const prev = steps[i - 1];
    const rate = s.count / prev.count;
    const bench = STEP_BENCHMARKS[`${prev.event}>${s.event}`];
    const low = bench !== undefined && rate < bench;
    return `<li class="fs-step${low ? " fs-step--low" : ""}"><span class="fs-name">${bi(en, ar)}</span><b dir="ltr">${fmtInt(s.count)}</b><span class="fs-rate" dir="ltr">${fmtPct(rate * 100)}%${bench !== undefined ? ` <i>vs ${fmtPct(bench * 100)}%</i>` : ""}</span></li>`;
  }).join("");
  return `
        <div class="fstrip">
          <p class="fstrip-head">${bi(`Your funnel, last ${periodOf(result)} days (each step vs benchmark)`, `مسار الشراء، آخر ${periodOf(result)} يومًا (كل خطوة مقابل المعيار)`)}</p>
          <ol class="fs">${cells}</ol>
        </div>`;
}

// Inside the buyer's report: the three fixes in plain words, to forward to
// the store owner as they are (ICP2: proof the owner will accept).
function ownerHandoverHtml(result: AuditResult): string {
  const rows = dedupeFunnel(byMoney(failedRows(result)).filter(r => r.f.action), result).slice(0, 3);
  if (!rows.length) return "";
  const items = rows.map(({ f }) => {
    const noStop = (t: string) => t.trim().replace(/[.。]+$/, "");
    const step = decodePaths(f.action!.step);
    const stepAr = decodePaths(f.ar?.action?.step ?? f.action!.step);
    const done = noStop(f.action!.doneWhen);
    const doneAr = noStop(f.ar?.action?.doneWhen ?? f.action!.doneWhen);
    return `<li>${biHtml(
      `${escapeHtml(step)} <span class="ho-meta">Who: ${escapeHtml(f.action!.owners.map(o => OWNER_LABEL[o].en).join(" + "))}. Done when: ${escapeHtml(done)}${f.action!.money ? `. Worth about ${escapeHtml(moneyRange(f.action!.money))} a month (GA4 estimate)` : ""}.</span>`,
      `${escapeHtml(stepAr)} <span class="ho-meta">المسؤول: ${escapeHtml(f.action!.owners.map(o => OWNER_LABEL[o].ar).join(" + "))}. يكتمل عندما: ${escapeHtml(doneAr)}${f.action!.money ? `. قيمته نحو ${escapeHtml(moneyRange(f.action!.money))} شهريًا (تقدير من GA4)` : ""}.</span>`,
    )}</li>`;
  }).join("");
  return `
        <div class="handover" id="handover">
          <h3 class="lane-head">${bi("Send this to the store owner", "ابعت ده لصاحب المتجر")}</h3>
          <p class="lane-lead">${bi("The three fixes worth most, in plain words, with who does each one. Copy it as it is.", "أهم تلات إصلاحات بكلام بسيط، ومين بيعمل كل واحد. انسخه زي ما هو.")}</p>
          <ol class="ho-list">${items}</ol>
        </div>`;
}

// ---- persona reports: store owner and media buyer ----
// These two readers run their own points (persona-checklist.ts) and get their
// own opening, plan and closing sections (ICP-REPORT-PLAN.md §2). The psych
// map principle behind each block is named in its comment
// (icp/research/psych-map.md). Every other reader keeps summaryHtml and
// fixFirstHtml above.

// What this audit could and couldn't see, from what actually ran (#27
// ambiguity aversion: say what wasn't checked, next to the claims).
function scopeOf(result: AuditResult): { checked: Bi2[]; notChecked: Bi2[] } {
  const checked: Bi2[] = [];
  const hasGa4Live = Boolean(result.ga4Facts || result.ga4Metrics);
  if (hasGa4Live) checked.push([`Your Google Analytics, last ${periodOf(result)} days`, `Google Analytics الخاص بمتجرك، آخر ${periodOf(result)} يومًا`]);
  else if (result.categories.some(c => c.category === "GA4")) checked.push(["Your Google Analytics setup, from the site", "إعداد Google Analytics كما يظهر في الموقع"]);
  if (result.categories.some(c => c.category === "GTM")) checked.push(["Your Google Tag Manager container", "حاوية Google Tag Manager الخاصة بك"]);
  if (result.siteChecks || result.fud) checked.push(["A visit to your store on a phone, with one product added to the cart", "زيارة لمتجرك من الجوال، مع إضافة منتج للسلة"]);
  checked.push(["Your store's public pages and code", "صفحات متجرك العامة وكودها"]);
  if (result.clarityFacts) checked.push([`Your Microsoft Clarity, last ${result.clarityFacts.days} days`, `Microsoft Clarity الخاص بمتجرك، آخر ${result.clarityFacts.days} أيام`]);
  const notChecked: Bi2[] = [
    ["Checkout after the cart (we never place an order)", "إتمام الطلب بعد السلة (ما نسوي طلب حقيقي)"],
    ["Your store admin settings", "إعدادات لوحة تحكم متجرك"],
    ["Your ad accounts", "حسابات إعلاناتك"],
  ];
  if (!hasGa4Live) notChecked.unshift(["Your sales numbers (Google Analytics wasn't connected)", "أرقام مبيعاتك (ما تم ربط Google Analytics)"]);
  return { checked, notChecked };
}

function scopeStripHtml(result: AuditResult, buyer: boolean): string {
  const { checked, notChecked } = scopeOf(result);
  const list = (items: Bi2[]) => items.map(([en, ar]) => `<li>${bi(en, buyer ? ar.replace("ما نسوي", "مش بنعمل") : ar)}</li>`).join("");
  return `
        <div class="scope">
          <div><p class="scope-h">${bi("What we checked", buyer ? "اللي فحصناه" : "وش فحصنا")}</p><ul>${list(checked)}</ul></div>
          <div><p class="scope-h">${bi("What we couldn't check", buyer ? "اللي مقدرناش نفحصه" : "وش ما قدرنا نفحص")}</p><ul>${list(notChecked)}</ul></div>
        </div>`;
}

// The small score line: the pass count is a fact here, not the headline
// (PRODUCT.md anti-reference: no hero score).
function scoreLineHtml(result: AuditResult, counts: ReturnType<typeof resultCounts>, ar: (n: number, t: number) => string): string {
  const friction = result.fud?.score;
  return `<p class="score-line"><a href="#checks">${bi(`Passed ${counts.passed} of ${counts.total} checks`, ar(counts.passed, counts.total))}</a>${friction !== null && friction !== undefined ? `<span aria-hidden="true">·</span><a href="#friction">${bi(`Conversion score ${friction}/100`, `مؤشر التحويل ${friction}/100`)}</a>` : ""}</p>`;
}


function whoDoesIt(f: FailedRow["f"], buyer: boolean): Bi2 {
  if (!f.action) return ["", ""];
  if (buyer) return [`Who fixes it: ${f.action.owners.map(o => OWNER_LABEL[o].en).join(" + ")}`, `مين يصلحه: ${f.action.owners.map(o => OWNER_LABEL[o].ar).join(" + ")}`];
  return isDiy(f) ? ["You, in your store admin", "أنت، من لوحة تحكم متجرك"] : ["Your developer", "المطوّر حقك"];
}

// One fix with its who, what and done-when (#44 implementation intentions).
function planItemHtml(r: FailedRow, buyer: boolean, result?: AuditResult): string {
  const { cat, f } = r;
  const arBusiness = f.ar?.business ?? f.business;
  const step = f.action ? decodePaths(f.action.step) : "";
  const stepAr = f.action ? decodePaths(f.ar?.action?.step ?? f.action.step) : "";
  const done = f.action?.doneWhen ?? "";
  const doneAr = f.ar?.action?.doneWhen ?? done;
  const [whoEn, whoAr] = whoDoesIt(f, buyer);
  return `
          <li class="plan-item">
            <a class="plan-title" href="#${rowId(cat, { id: f.checklistId })}">${biHtml(escapeHtml(f.business.summary), escapeHtml(arBusiness.summary))}</a>
            <span class="fix-meta">${severityTag(f.severity)}${buyer ? adEffectChip(result, f) : moneyTag(r)}</span>
            ${whoEn ? `<p class="plan-who">${bi(whoEn, whoAr)}</p>` : ""}
            ${step ? `<p class="plan-step">${biHtml(`<b>Change:</b> ${escapeHtml(step)}`, `<b>${buyer ? "المطلوب" : "وش تغيّر"}:</b> ${escapeHtml(stepAr)}`)}</p>` : ""}
            ${done ? `<p class="plan-done">${biHtml(`<b>Done when:</b> ${escapeHtml(done)}`, `<b>${buyer ? "يخلص لما" : "تعرف إنه انحل لما"}:</b> ${escapeHtml(doneAr)}`)}</p>` : ""}
          </li>`;
}

// Store owner opening (#31 primacy, #9 framing, #51 uncertainty reduction,
// #53 trust transfer, #27 scope, #44 fixes with who/where/done, #45 two
// equal paths). Money first and sourced; no money without GA4 (ICP1 card §9).
function ownerHeroHtml(result: AuditResult, counts: ReturnType<typeof resultCounts>, generatedAt: string, generatedAtAr: string, contactUrl: string, shots = ""): string {
  const name = escapeHtml(result.businessName || hostOf(result.websiteUrl));
  const rows = dedupeFunnel(byMoney(failedRows(result)), result);
  const big = biggestMoney(result);
  const top = rows[0];
  const days = periodOf(result);

  let h1: string;
  let lead = "";
  let source: string;
  if (big) {
    h1 = biHtml(
      `${name} is losing about <span class="hl" style="--c:${RED}">${escapeHtml(moneyRange(big.money))}</span> a month`,
      `${name} يضيّع نحو <span class="hl" style="--c:${RED}">${escapeHtml(moneyRange(big.money))}</span> شهريًا`,
    );
    // No lead line here: fix 1 right below says where the money goes.
    source = bi(
      `From your own Google Analytics, last ${days} days: sales at stake at this one step, not a promise. How we estimate it is at the end of the report.`,
      `من Google Analytics الخاص بمتجرك، آخر ${days} يومًا: مبيعات معرّضة للضياع عند هذي الخطوة بس، مو وعد. طريقة الحساب في آخر التقرير.`,
    );
  } else if (top) {
    h1 = bi(top.f.business.summary, (top.f.ar?.business ?? top.f.business).summary);
    lead = bi(`This is the first thing costing ${result.businessName || "your store"} sales. Two more are right below.`, `هذا أول شي يكلّف متجرك مبيعات. وتحته اثنين بعد.`);
    source = result.ga4Facts
      ? bi("Your Google Analytics didn't show a money figure for this one.", "Google Analytics حقك ما أعطى رقم مبيعات لهذا البند.")
      : bi("Connect Google Analytics on your next audit to see what each fix is worth in your currency.", "اربط Google Analytics في التدقيق الجاي عشان تشوف كم يسوى كل إصلاح بعملتك.");
  } else {
    h1 = biHtml(`${name} passed all ${counts.total} checks`, `اجتاز ${name} كل البنود الـ${counts.total}`);
    source = bi("Nothing in these checks is costing you sales. The list below is what to keep as it is.", "ما فيه شي في هالبنود يكلّفك مبيعات. القائمة تحت هي اللي تخليه زي ما هو.");
  }

  const fixes = rows.slice(0, 3);
  return `
      <section class="doc-section summary persona-hero" id="overview">
        <div class="hero-fx" aria-hidden="true"><span class="glow glow--a"></span><span class="glow glow--b"></span><span class="gate gate--l"></span><span class="gate gate--r"></span></div>
        <p class="crumbs">${bi("Free store audit", "تدقيق مجاني لمتجرك")}<span aria-hidden="true">/</span><span dir="ltr">${escapeHtml(hostOf(result.websiteUrl))}</span><span aria-hidden="true">/</span>${biHtml(escapeHtml(generatedAt), escapeHtml(generatedAtAr))}</p>
        <h1>${h1}</h1>
        ${shots}
        ${lead ? `<p class="lead">${lead}</p>` : ""}
        <p class="hero-src">${source}</p>
        ${fixes.length ? `
        <h2 class="hero-h2">${bi("Fix these 3 first", "ابدأ بهالثلاث")}</h2>
        <ol class="plan-list plan-list--hero">${fixes.map(r => planItemHtml(r, false)).join("")}</ol>` : ""}
        ${scopeStripHtml(result, false)}
        ${scoreLineHtml(result, counts, (p, t) => `اجتاز ${p} من ${t} ${arChecksNoun(t)}`)}
        <div class="actions">
          <a class="btn btn--primary magnetic" href="${contactUrl}">${bi("Let us fix it: book a free call", "خلّنا نصلحها: احجز مكالمة مجانية")}</a>
          ${rows.length ? `<a class="btn btn--link" href="#fix-first">${bi("Fix it yourself: see your full plan", "صلّحها بنفسك: شوف خطتك كاملة")}${ARROW}</a>` : ""}
        </div>
      </section>`;
}

// Store owner plan: every failed point, split by who does it (#23 chunking,
// #44), money first inside each group. Replaces "What's costing you sales".
function ownerPlanHtml(result: AuditResult): string {
  const rows = dedupeFunnel(byMoney(failedRows(result)), result);
  if (!rows.length) return "";
  const diy = rows.filter(r => isDiy(r.f));
  const dev = rows.filter(r => !isDiy(r.f));
  const group = (en: string, ar: string, leadEn: string, leadAr: string, list: FailedRow[]) => list.length ? `
        <div class="plan-group">
          <h3 class="lane-head">${bi(en, ar)}</h3>
          <p class="lane-lead">${bi(leadEn, leadAr)}</p>
          <ol class="plan-list">${list.slice(0, 8).map(r => planItemHtml(r, false)).join("")}</ol>
          ${list.length > 8 ? `<p class="qa-more">${bi(`And ${list.length - 8} more in the checks below.`, `و${list.length - 8} بعد في البنود تحت.`)}</p>` : ""}
        </div>` : "";
  return `
      <section class="doc-section" id="fix-first">
        <h2>${bi("Your action plan", "خطتك للإصلاح")}</h2>
        <p class="section-lead">${bi(
          `${rows.length} fixes, biggest money first. ${diy.length} you can do yourself in your store admin. The rest need your developer. Each one says how you'll know it's done.`,
          `${rows.length} إصلاحات، الأكبر قيمة أول. ${diy.length} تقدر تسويها بنفسك من لوحة تحكم متجرك، والباقي يحتاج المطوّر. كل واحد يقولك كيف تعرف إنه انحل.`,
        )}</p>
        ${kpisHtml(storeKpis(result, ["cr", "aov"]))}
        ${group("You can do these yourself", "تقدر تسويها بنفسك", "In your Salla, Zid or Shopify admin. No code.", "من لوحة تحكم سلة أو زد أو شوبيفاي. بدون كود.", diy)}
        ${group("Send these to your developer", "أرسلها للمطوّر حقك", "Copy each one as it is: it says what to change and how to check it's done.", "انسخ كل واحد زي ما هو: فيه وش يتغيّر وكيف يتأكد إنه انحل.", dev)}
      </section>`;
}

// Store owner: what is working and should stay (#46 negativity bias used
// defensively: calm, and the good news is part of the truth).
function keepItHtml(result: AuditResult): string {
  const passed = result.categories.flatMap(cat => cat.findings.filter(f => f.status === "pass" && f.dataSource === "live").map(f => ({ cat, f })));
  if (passed.length < 2) return "";
  const items = bySeverity(passed).slice(0, 6).map(({ cat, f }) => {
    const ar = f.ar?.business ?? f.business;
    return `<li><a href="#${rowId(cat, { id: f.checklistId })}">${biHtml(escapeHtml(f.business.summary), escapeHtml(ar.summary))}</a></li>`;
  }).join("");
  return `
      <section class="doc-section" id="keep">
        <h2>${bi("What's working: keep it", "اللي شغّال: خلّه زي ما هو")}</h2>
        <p class="section-lead">${bi("These are helping your sales right now. Don't change them when you edit your store.", "هذي تساعد مبيعاتك الحين. لا تغيّرها لما تعدّل متجرك.")}</p>
        <ul class="keep-list">${items}</ul>
      </section>`;
}

// Media buyer opening (#31 a verdict first, #49 say so when the site is
// clean, #56 what the scan saw, #23 the two questions, #9 direction only,
// #53 forwardable proof).
function buyerHeroHtml(result: AuditResult, counts: ReturnType<typeof resultCounts>, generatedAt: string, generatedAtAr: string, contactUrl: string, shots = ""): string {
  const rows = failedRows(result).sort((a, b) => mediaBuyerRank(a.f.checklistId, SEVERITY_RANK[a.f.severity]) - mediaBuyerRank(b.f.checklistId, SEVERITY_RANK[b.f.severity]));
  const signal = rows.filter(r => mediaBuyerLane(r.f.checklistId) === "signal");
  const postClick = dedupeFunnel(rows.filter(r => mediaBuyerLane(r.f.checklistId) === "post_click"), result);
  const up = rows.filter(r => adEffectOf(r.f.checklistId) === "inflated").length;
  const down = rows.filter(r => adEffectOf(r.f.checklistId) === "deflated").length;

  const [h1En, h1Ar]: Bi2 = up && down
    ? ["Reported ROAS is off in both directions", "ROAS المُبلَّغ منحرف في الاتجاهين"]
    : up ? ["Reported ROAS likely reads higher than real", "ROAS المُبلَّغ غالبًا أعلى من الحقيقي"]
    : down ? ["Reported ROAS likely reads lower than real", "ROAS المُبلَّغ غالبًا أقل من الحقيقي"]
    : signal.length ? ["The ad platforms get a weak signal from this store", "منصات الإعلانات بتستقبل إشارة ضعيفة من المتجر ده"]
    : postClick.length ? ["Tracking is clean. The leak is after the click.", "التتبع سليم. التسريب بعد الضغط على الإعلان."]
    : ["Tracking and the site passed: look at targeting and creative", "التتبع والموقع سليمين: راجع الاستهداف والكريتيف"];
  const [leadEn, leadAr]: Bi2 = postClick.length && (up || down || signal.length)
    ? [`After the click: ${postClick[0].f.business.summary}`, `بعد الضغط على الإعلان: ${(postClick[0].f.ar?.business ?? postClick[0].f.business).summary}`]
    : signal.length ? [signal[0].f.business.summary, (signal[0].f.ar?.business ?? signal[0].f.business).summary]
    : postClick.length ? [postClick[0].f.business.summary, (postClick[0].f.ar?.business ?? postClick[0].f.business).summary]
    : ["Nothing on the site or in the tracking explains weak results. The problem, if there is one, is in the account.", "مفيش حاجة في الموقع أو التتبع تفسّر ضعف النتايج. لو فيه مشكلة، فهي في الحساب نفسه."];

  const ga4 = result.ga4Facts || result.ga4Metrics ? [`GA4: last ${periodOf(result)} days`, `GA4: آخر ${periodOf(result)} يوم`] : ["GA4: not connected", "GA4: مش مربوط"];
  const gtm = result.categories.some(c => c.category === "GTM") ? ["GTM container read", "اتقرت حاوية GTM"] : ["GTM: not shared", "GTM: مش متشارك"];
  const visit = result.siteChecks || result.fud ? ["Store visit with Add to Cart", "زيارة للمتجر مع Add to Cart"] : ["Store visit: not run", "زيارة المتجر: متعملتش"];
  const clarity = result.clarityFacts ? [`Clarity: last ${result.clarityFacts.days} days`, `Clarity: آخر ${result.clarityFacts.days} أيام`] : null;
  const status = [ga4, gtm, visit, ...(clarity ? [clarity] : []), ["Checkout: not observed", "Checkout: متشافش"]];

  const col = (en: string, ar: string, list: FailedRow[], emptyEn: string, emptyAr: string) => `
          <div class="q-col">
            <h2 class="hero-h2">${bi(en, ar)}</h2>
            ${list.length ? `<ol class="plan-list plan-list--hero">${list.slice(0, 2).map(r => planItemHtml(r, true, result)).join("")}</ol>` : `<p class="lane-empty">${bi(emptyEn, emptyAr)}</p>`}
          </div>`;
  return `
      <section class="doc-section summary persona-hero" id="overview">
        <div class="hero-fx" aria-hidden="true"><span class="glow glow--a"></span><span class="glow glow--b"></span><span class="gate gate--l"></span><span class="gate gate--r"></span></div>
        <p class="crumbs">${bi("Free tracking and site audit", "تدقيق مجاني للتتبع والموقع")}<span aria-hidden="true">/</span><span dir="ltr">${escapeHtml(hostOf(result.websiteUrl))}</span><span aria-hidden="true">/</span>${biHtml(escapeHtml(generatedAt), escapeHtml(generatedAtAr))}</p>
        <h1>${bi(h1En, h1Ar)}</h1>
        ${shots}
        <p class="lead">${bi(leadEn, leadAr)}</p>
        <p class="status-line">${status.map(([en, ar]) => `<span>${bi(en, ar)}</span>`).join(`<span aria-hidden="true">·</span>`)}</p>
        <div class="q-cols">
          ${col("Is the number real?", "هل الرقم حقيقي؟", signal, "No tracking problem found: each sale reaches GA4 and the pixels once.", "مفيش مشكلة تتبع: كل عملية شراء بتوصل GA4 والبيكسلات مرة واحدة.")}
          ${col("Does paid traffic convert?", "هل الزيارات المدفوعة بتتحوّل؟", postClick, "No post-click leak found in the steps we could measure.", "مفيش تسريب بعد الضغط في الخطوات اللي قدرنا نقيسها.")}
        </div>
        <p class="hero-src">${bi("ROAS and CAC effects are directions, never numbers: this audit doesn't see your ad accounts.", "تأثير ROAS وCAC اتجاه بس، مش أرقام: التدقيق ده مش بيشوف حسابات الإعلانات.")}</p>
        ${scoreLineHtml(result, counts, (p, t) => `نجح ${p} من ${t} بند`)}
        <div class="actions">
          ${rows.length ? `<a class="btn btn--primary magnetic" href="#handover">${bi("Get the summary to send the store owner", "خد الملخص اللي تبعته لصاحب المتجر")}</a>` : ""}
          <a class="btn ${rows.length ? "btn--link" : "btn--primary magnetic"}" href="${contactUrl}">${bi("Book a free call", "احجز مكالمة مجانية")}${rows.length ? ARROW : ""}</a>
        </div>
      </section>`;
}

const BEHAVIOUR_AR: Record<string, string> = {
  deadClicks: "ضغطات على أشياء ما تشتغل",
  rageClicks: "ضغطات متكررة من الضيق",
  quickbacks: "رجوع سريع من الصفحة",
  scriptErrors: "أخطاء في الصفحة",
};

// The store's own Clarity, framed per reader (SO-CL / MB-CL in the persona
// lists). Compared only with the store itself; Clarity gives no benchmark.
function claritySectionHtml(result: AuditResult, buyer: boolean): string {
  const c = result.clarityFacts;
  if (!c) return "";
  const pathOf = (url: string) => { try { return decodeURIComponent(new URL(url).pathname); } catch { return url; } };
  const hot = (key: string) => c.hotPages?.find(p => p.behaviour === key) ?? null;
  const pct = (n: number | null | undefined) => (n === null || n === undefined ? null : `${fmtPct(n)}%`);
  const items: Array<{ en: string; ar: string; flag: boolean }> = [];
  const unavailable = c.hotPages === null;
  const pageLine = (key: string, enName: string): { en: string; ar: string; flag: boolean } | null => {
    const h = hot(key);
    const site = pct(c.sitewide[key as keyof typeof c.sitewide]);
    if (!site) return null;
    if (h) return { flag: true, en: `${enName}: ${pct(h.pageRate)} of sessions on ${pathOf(h.url)} against ${site} across your store (${fmtInt(h.sessions)} sessions).`, ar: `${BEHAVIOUR_AR[key]}: ${pct(h.pageRate)} من الجلسات في ${pathOf(h.url)} مقابل ${site} في متجرك كامل (${fmtInt(h.sessions)} جلسة).` };
    return { flag: false, en: `${enName}: ${site} of sessions across your store${unavailable ? ". Clarity didn't give a per-page split this time." : ", no page far above that."}`, ar: `${BEHAVIOUR_AR[key]}: ${site} من الجلسات في متجرك${unavailable ? ". Clarity ما أعطى تفصيل لكل صفحة هالمرة." : "، وما فيه صفحة أعلى منها بكثير."}` };
  };
  if (buyer) {
    if (c.inAppShare) items.push({ flag: c.inAppShare >= 25, en: `${pct(c.inAppShare)} of sessions open inside the Facebook, Instagram or TikTok app browser (${c.inAppBrowsers.map(b => b.name).join(", ")}). That's where paid social lands: test the cart and checkout there, not only in Chrome.`, ar: `${pct(c.inAppShare)} من الجلسات بتفتح جوه متصفح تطبيق فيسبوك أو انستجرام أو تيك توك (${c.inAppBrowsers.map(b => b.name).join(", ")}). ده المكان اللي الإعلانات بتنزل فيه: جرّب السلة والدفع هناك، مش في كروم بس.` });
    const q = pageLine("quickbacks", "Quick-backs (left a page within seconds)");
    if (q) items.push(q);
    if (c.botShare !== null) items.push({ flag: c.botShare >= 15, en: `Clarity filtered ${pct(c.botShare)} of sessions as bots. Bot clicks can inflate paid sessions in GA4 and make conversion rate look worse than it is.`, ar: `Clarity استبعد ${pct(c.botShare)} من الجلسات على إنها بوتات. ضغطات البوتات ممكن تنفخ الجلسات المدفوعة في GA4 وتخلي معدل التحويل يبان أوحش من الحقيقي.` });
  } else {
    const d = pageLine("deadClicks", "Taps on things that do nothing");
    if (d) items.push(d);
    const e = pageLine("scriptErrors", "Errors on your pages");
    if (e) items.push(e);
    if (c.scrollDepth !== null) items.push({ flag: false, en: `On average, shoppers scroll ${pct(c.scrollDepth)} of the way down a page. Anything you need them to see (price, delivery, payment logos) should sit above that point on the phone.`, ar: `المتسوقين ينزلون بالمتوسط ${pct(c.scrollDepth)} من الصفحة. أي شي تبيهم يشوفونه (السعر، التوصيل، شعارات الدفع) خلّه فوق هالنقطة في الجوال.` });
  }
  if (!items.length) return "";
  return `
      <section class="doc-section" id="clarity">
        <h2>${bi(buyer ? "What paid visitors did (Clarity)" : "What your shoppers did (Clarity)", buyer ? "الزوار عملوا إيه (Clarity)" : "وش سوّوا المتسوقين (Clarity)")}</h2>
        <p class="section-lead">${bi(
          `From your own Microsoft Clarity, last ${c.days} days, ${fmtInt(c.sessions)} sessions${c.mobileShare !== null ? `, ${pct(c.mobileShare)} on phones` : ""}. Compared only with your own store.`,
          buyer
            ? `من Microsoft Clarity بتاعك، آخر ${c.days} أيام، ${fmtInt(c.sessions)} جلسة${c.mobileShare !== null ? `، ${pct(c.mobileShare)} منها موبايل` : ""}. المقارنة مع متجرك نفسه بس.`
            : `من Microsoft Clarity الخاص بمتجرك، آخر ${c.days} أيام، ${fmtInt(c.sessions)} جلسة${c.mobileShare !== null ? `، ${pct(c.mobileShare)} منها من الجوال` : ""}. المقارنة مع متجرك نفسه بس.`,
        )}</p>
        <ul class="clarity-list">${items.map(i => `<li${i.flag ? ' class="is-flag"' : ""}>${i.flag ? `<span class="fix-tag">${bi("Worth a look", buyer ? "يستاهل نظرة" : "يستاهل تشوفه")}</span>` : ""}${bi(i.en, i.ar)}</li>`).join("")}</ul>
      </section>`;
}

// How the audit works (#3 authority with substance, #51, #52 expectations):
// sources, what "estimated" means, what we can't see.
function methodHtml(result: AuditResult, buyer: boolean, generatedAt: string, generatedAtAr: string): string {
  const { checked } = scopeOf(result);
  const lines: Bi2[] = [
    ...checked.map(([en, ar]): Bi2 => [`Source: ${en}.`, `المصدر: ${ar}.`]),
    ["Money figures come only from your Google Analytics: the gap between a funnel step and its benchmark, turned into sales for that step. They are estimates, shown as a range, and never added together, so the same sale is never counted twice.", "أرقام المبيعات من Google Analytics فقط: الفرق بين خطوة في مسار الشراء ومعيارها، محسوب كمبيعات لهذي الخطوة. هي تقديرات، تظهر كنطاق، وما نجمعها مع بعض عشان ما تنحسب نفس المبيعات مرتين."],
    buyer
      ? ["We never see your ad accounts, so ROAS, CPA and spend appear as directions only. Confirm tracking findings yourself in Events Manager, Test Events or Tag Assistant.", "إحنا مش بنشوف حسابات الإعلانات، فـ ROAS وCPA والإنفاق بيظهروا كاتجاهات بس. اتأكد من نتايج التتبع بنفسك في Events Manager أو Test Events أو Tag Assistant."]
      : ["Points that depend on settings inside your store admin say so. Check those yourself before changing anything.", "البنود اللي تعتمد على إعدادات داخل لوحة تحكم متجرك مكتوب عليها هذا. تأكد منها بنفسك قبل ما تغيّر شي."],
  ];
  return `
      <section class="doc-section" id="method">
        <h2>${bi("How this audit works", buyer ? "التدقيق ده اتعمل إزاي" : "كيف سوّينا هالتدقيق")}</h2>
        <ul class="method-list">${lines.map(([en, ar]) => `<li>${bi(en, buyer ? ar.replace("من Google Analytics فقط", "من Google Analytics بس") : ar)}</li>`).join("")}</ul>
        <p class="method-date">${biHtml(`Run by the Optimizers team on ${escapeHtml(generatedAt)}.`, `أعدّه فريق Optimizers بتاريخ ${escapeHtml(generatedAtAr)}.`)}</p>
      </section>`;
}

// ---- per-reader copy around the report ----
type Bi2 = [string, string];

interface RoleCopy {
  lead(counts: ReturnType<typeof resultCounts>, result: AuditResult): Bi2;
  leadPass: Bi2;
  fixLink: Bi2;
  toc: Bi2;
  jump: Bi2;
  guide: Bi2;
  checksIntro: Bi2;
  cta: { title: Bi2; titlePass: Bi2; body: Bi2; button: Bi2 };
}

const DEFAULT_COPY: RoleCopy = {
  lead: c => [
    `${c.failed} ${checksWord(c.failed)} need work: ${c.critical} critical, ${c.medium} medium and ${c.low} low. Each one below says what it means for your store and what to change.`,
    `${c.failed} ${arChecksNoun(c.failed)} تحتاج إلى إصلاح: ${c.critical} حرجة، و${c.medium} متوسطة، و${c.low} منخفضة. يوضح كل بند أدناه ماذا يعني لمتجرك وما الذي يجب تغييره.`,
  ],
  leadPass: [
    "Every check in this audit passed. The details below show what each check confirmed about your store.",
    "اجتاز موقعك جميع بنود هذا التدقيق. توضح التفاصيل أدناه ما أكده كل بند عن متجرك.",
  ],
  fixLink: ["See what to fix first", "ما الذي يجب إصلاحه أولًا"],
  toc: ["Fix these first", "أصلح هذه أولًا"],
  jump: ["Fix first", "أصلح أولًا"],
  guide: ["to fix first", "للإصلاح أولًا"],
  checksIntro: [
    "Each check tells you what it means for your store. Turn on Technical details to see the exact setup your developer will need.",
    "يشرح كل بند ماذا يعني لمتجرك. فعِّل «التفاصيل التقنية» لترى الإعداد الدقيق الذي سيحتاجه المطوّر.",
  ],
  cta: {
    title: ["Want these fixed?", "هل تريد إصلاح هذه المشكلات؟"],
    titlePass: ["Want a second opinion on what's next?", "هل تريد رأيًا في خطوتك التالية؟"],
    body: [
      "Book a free call with our team. We'll walk through your results, show you which fixes bring in the most sales, and plan the next steps for your store. You don't have to work with us afterwards.",
      "احجز مكالمة مجانية مع فريقنا. سنراجع نتائجك معك، ونوضح أي الإصلاحات تجلب أكثر مبيعات، ونخطط للخطوات التالية لمتجرك. لن تكون ملزمًا بالعمل معنا بعدها.",
    ],
    button: ["Book my free call", "احجز مكالمتي المجانية"],
  },
};

const ROLE_COPY: Record<AudienceRole, RoleCopy> = {
  store_owner: {
    ...DEFAULT_COPY,
    lead: (c, result) => {
      const diy = failedRows(result).filter(r => isDiy(r.f)).length;
      return [
        `${c.failed} ${checksWord(c.failed)} cost your store sales or put it at risk. You can fix ${diy} of them yourself in your store admin. Each one says what it costs, what to change and where.`,
        `${c.failed} ${arChecksNoun(c.failed)} تكلّف متجرك مبيعات أو تعرّضه للخطر، و${diy} منها تقدر تصلحها بنفسك من لوحة تحكم المتجر. كل بند يوضح كم يكلّفك، وش تغيّر، ووين.`,
      ];
    },
    fixLink: ["See what's costing you sales", "وش اللي يكلّفك مبيعات"],
    toc: ["Your action plan", "خطتك للإصلاح"],
    jump: ["Your plan", "خطتك"],
    guide: ["biggest leaks", "أكبر التسريبات"],
    checksIntro: [
      "Each check says what it costs or protects for your sales, and what to change. Turn on Technical details for the exact setup your developer will need.",
      "كل بند يوضح كم يكلّف مبيعاتك أو يحميها، ووش تغيّر. فعِّل «التفاصيل التقنية» لترى الإعداد الدقيق اللي يحتاجه المطوّر.",
    ],
    cta: {
      ...DEFAULT_COPY.cta,
      title: ["Short on time to fix these?", "ما عندك وقت تصلحها؟"],
      body: [
        "Optimizers, the team behind this audit, can make these fixes for you. Book a free call and we'll go through your results and the quickest wins together. You don't have to work with us afterwards.",
        "فريق Optimizers، اللي سوّى هذا التدقيق، يقدر ينفّذ هذه الإصلاحات عنك. احجز مكالمة مجانية ونراجع نتائجك وأسرع المكاسب مع بعض، وما تكون ملزم تشتغل معنا بعدها.",
      ],
    },
  },
  media_buyer: {
    ...DEFAULT_COPY,
    lead: (c, result) => {
      const lanes = laneCounts(result);
      return [
        `${c.failed} ${checksWord(c.failed)} need work. ${lanes.signal} change what the ad platforms and GA4 see, ${lanes.postClick} lose paid traffic after the click. Each point says what it does to ROAS or CAC, who has to fix it and how to check it's done.`,
        `${c.failed} ${arChecksNoun(c.failed)} تحتاج إلى إصلاح. ${lanes.signal} منها تغيّر ما تراه منصات الإعلانات وGA4، و${lanes.postClick} تُضيّع الزيارات المدفوعة بعد الضغط على الإعلان. يوضح كل بند أثره على ROAS أو CAC، ومن يجب أن يصلحه، وكيف تتأكد من إصلاحه.`,
      ];
    },
    leadPass: [
      "Every check passed. The ad platforms and GA4 get clean data, and nothing we tested loses paid traffic after the click.",
      "اجتاز المتجر جميع البنود. منصات الإعلانات وGA4 تستقبل بيانات سليمة، ولم نجد ما يُضيّع الزيارات المدفوعة بعد الضغط على الإعلان.",
    ],
    fixLink: ["See what's holding ROAS back", "ما الذي يحدّ من ROAS"],
    toc: ["What holds ROAS back", "ما يحدّ من ROAS"],
    jump: ["ROAS", "ROAS"],
    guide: ["ROAS blockers", "ما يحدّ من ROAS"],
    checksIntro: [
      "Each check says what it does to ROAS, CAC or the data your campaigns learn from. Turn on Technical details for the exact events, tags and values to forward to the developer.",
      "يوضح كل بند أثره على ROAS أو CAC أو على البيانات التي تتعلم منها حملاتك. فعِّل «التفاصيل التقنية» لترى الأحداث والوسوم والقيم الدقيقة لإرسالها إلى المطوّر.",
    ],
    cta: {
      ...DEFAULT_COPY.cta,
      title: ["Want the site side fixed?", "عايز جانب الموقع يتصلح؟"],
      body: [
        "Book a free call. We'll go through the tracking and funnel findings with you and show which fixes move ROAS fastest. You keep the account; we handle the store side.",
        "احجز مكالمة مجانية. هنراجع معاك نتائج التتبع ومسار التحويل ونوضح أي إصلاحات بترفع ROAS أسرع. الحساب يفضل معاك، واحنا نشتغل على جانب المتجر.",
      ],
    },
  },
  marketing_manager: {
    ...DEFAULT_COPY,
    lead: c => [
      `${c.failed} ${checksWord(c.failed)} need work, ${c.critical} of them critical. The executive summary ranks the fixes worth most to the business and shows which team owns each one.`,
      `${c.failed} ${arChecksNoun(c.failed)} تحتاج إلى إصلاح، منها ${c.critical} حرجة. يرتّب الملخص التنفيذي الإصلاحات الأعلى قيمة للأعمال ويوضح الفريق المسؤول عن كل منها.`,
    ],
    leadPass: [
      "Every check in this audit passed. The details below show what each check confirmed, ready to share with your team and leadership.",
      "اجتاز المتجر جميع بنود هذا التدقيق. توضح التفاصيل أدناه ما أكده كل بند، جاهزة للمشاركة مع فريقك والإدارة.",
    ],
    fixLink: ["Read the executive summary", "اقرأ الملخص التنفيذي"],
    toc: ["Executive summary", "الملخص التنفيذي"],
    jump: ["Exec summary", "الملخص التنفيذي"],
    guide: ["top priorities", "أهم الأولويات"],
    checksIntro: [
      "Each check is written as a brief: the business effect, who owns the fix and how to confirm it's done. Turn on Technical details for the specifics your developers will need.",
      "كل بند مكتوب كموجز عمل: الأثر على الأعمال، والمسؤول عن الإصلاح، وطريقة التأكد من إنجازه. فعِّل «التفاصيل التقنية» لترى التفاصيل التي يحتاجها المطوّرون.",
    ],
    cta: {
      ...DEFAULT_COPY.cta,
      title: ["Want help turning this into a roadmap?", "هل تريد مساعدة في تحويل هذا إلى خطة عمل؟"],
      body: [
        "Book a free call. We'll go through the priorities with you and your team, and plan the fixes worth most to the business.",
        "احجز مكالمة مجانية. سنراجع الأولويات معك ومع فريقك، ونخطط للإصلاحات الأعلى قيمة للأعمال.",
      ],
    },
  },
  agency: {
    ...DEFAULT_COPY,
    lead: c => [
      `${c.failed} of ${c.total} checks need work, ${c.critical} of them critical. Every finding states its evidence, the work needed, who does it and how both sides will know it's done.`,
      `${c.failed} من ${c.total} ${arChecksNoun(c.total)} تحتاج إلى إصلاح، منها ${c.critical} حرجة. كل نتيجة توضح دليلها، والعمل المطلوب، ومن ينفذه، وكيف يتأكد الطرفان من إنجازه.`,
    ],
    leadPass: [
      "Every check in this audit passed. Each finding below states what was checked and the evidence, ready to share with the client.",
      "اجتاز المتجر جميع بنود هذا التدقيق. توضح كل نتيجة أدناه ما تم فحصه ودليله، جاهزة للمشاركة مع العميل.",
    ],
    fixLink: ["See the client summary", "ملخص التدقيق للعميل"],
    toc: ["Client summary", "ملخص العميل"],
    jump: ["Client summary", "ملخص العميل"],
    guide: ["scope", "نطاق العمل"],
    checksIntro: [
      "Each check shows its evidence and the work it needs, ready to share with the client. Turn on Technical details for the exact setup.",
      "يعرض كل بند دليله والعمل الذي يحتاجه، جاهزًا للمشاركة مع العميل. فعِّل «التفاصيل التقنية» لترى الإعداد الدقيق.",
    ],
    cta: {
      ...DEFAULT_COPY.cta,
      title: ["Questions about this audit?", "لديك أسئلة عن هذا التدقيق؟"],
      titlePass: ["Questions about this audit?", "لديك أسئلة عن هذا التدقيق؟"],
      body: [
        "Book a call with the Optimizers team to go through the method and the findings.",
        "احجز مكالمة مع فريق Optimizers لمراجعة المنهجية والنتائج.",
      ],
      button: ["Book a call", "احجز مكالمة"],
    },
  },
};

function copyFor(result: AuditResult): RoleCopy {
  return result.audienceRole ? ROLE_COPY[result.audienceRole] : DEFAULT_COPY;
}

// ---- action layer (ACTION-POINTS-PROPOSAL.md) ----
// Every failed point carries an action (step, owner, done when, impact, and a
// hand-off to the section that continues it); every passed point says what to
// protect. Results from before the action layer render without these.

function oppChip(o: Opportunity | undefined): string {
  if (!o) return "";
  const l = OPPORTUNITY_LABEL[o];
  return `<span class="opp opp--${o}">${bi(l.en, l.ar)}</span>`;
}

function ownersBi(owners: ActionOwner[]): string {
  return bi(owners.map(o => OWNER_LABEL[o].en).join(" + "), owners.map(o => OWNER_LABEL[o].ar).join(" + "));
}

function categoryOfId(id: string): CategoryKey | null {
  return id.startsWith("GA4-") ? "GA4" : id.startsWith("GTM-") ? "GTM" : id.startsWith("W-") ? "Website" : null;
}

function handoffLink(h: Handoff | undefined, result: AuditResult): string {
  if (!h) return "";
  if (h.kind === "cro") {
    if (!result.fud || result.fud.assessed === 0) return "";
    const [pageEn, pageAr] = FUD_PAGE_LABEL[h.page];
    const href = result.ga4Facts?.focus.page === h.page ? "#ga4-followup" : "#friction";
    return `<a class="act-handoff" href="${href}">${bi(`Next: see what we found on your ${pageEn}`, `الخطوة التالية: ما وجدناه في ${pageAr}`)}</a>`;
  }
  const cat = categoryOfId(h.id);
  const target = cat && result.categories.find(c => c.category === cat && c.findings.some(f => f.checklistId === h.id));
  if (!target) return "";
  return `<a class="act-handoff" href="#${rowId(target, { id: h.id })}">${bi(`Next: ${h.id}`, `الخطوة التالية: ${h.id}`)}</a>`;
}

function actionBlockHtml(
  action: FindingAction,
  ar: { step?: string; doneWhen?: string; impact?: string } | undefined,
  result: AuditResult,
): string {
  const impactEn = action.impact;
  const impactAr = ar?.impact ?? action.impact;
  // A store owner hands developer work on as it is (ICP1: fix it myself,
  // or know exactly what to send).
  const toDev = result.audienceRole === "store_owner" && action.owners.includes("dev");
  const [labelEn, labelAr] = toDev ? ["Send this to your developer:", "أرسل هذا لمطوّرك:"] : ["Action:", "الإجراء:"];
  return `
                  <div class="act">
                    <p class="act-step">${biHtml(`<b>${labelEn}</b> ${escapeHtml(decodePaths(action.step))}`, `<b>${labelAr}</b> ${escapeHtml(decodePaths(ar?.step ?? action.step))}`)}</p>
                    <dl class="act-meta">
                      <div><dt>${bi("Owner", "المسؤول")}</dt><dd>${ownersBi(action.owners)}</dd></div>
                      <div><dt>${bi("Done when", "يكتمل عندما")}</dt><dd>${bi(action.doneWhen, ar?.doneWhen ?? action.doneWhen)}</dd></div>
                      ${impactEn ? `<div><dt>${bi("Impact", "الأثر")}</dt><dd>${bi(impactEn, impactAr ?? impactEn)}</dd></div>` : ""}
                    </dl>
                    ${handoffLink(action.handoff, result)}
                  </div>`;
}

function protectHtml(en: string | undefined, ar: string | undefined): string {
  if (!en) return "";
  return `<p class="act-protect">${biHtml(`<b>Keep:</b> ${escapeHtml(en)}`, `<b>حافظ على:</b> ${escapeHtml(ar ?? en)}`)}</p>`;
}

const STEP_AR: Record<string, string> = {
  "view_item>add_to_cart": "من صفحة المنتج إلى الإضافة للسلة",
  "add_to_cart>begin_checkout": "من السلة إلى إتمام الشراء",
  "add_to_cart>add_shipping_info": "من السلة إلى إتمام الشراء",
  "begin_checkout>purchase": "من إتمام الشراء إلى الشراء",
  "add_shipping_info>purchase": "من إتمام الشراء إلى الشراء",
};

// The GA4 → Conversion review hand-off: the worst funnel step, then what we
// found on the page behind it.
function ga4FollowUpHtml(result: AuditResult): string {
  const focus = result.ga4Facts?.focus;
  const fud = result.fud;
  if (!focus?.page || !focus.step || !fud) return "";
  const list = fud.findings.filter(f => f.focus && f.override?.to !== "hidden" && f.status !== "unassessed");
  // Checks on the focus page that couldn't run (an empty cart, a page that
  // didn't load): named, so the block never looks like a full answer when it isn't.
  const notChecked = fud.findings.filter(f => f.pageType === focus.page && f.status === "unassessed" && f.override?.to !== "hidden");
  // The GA4 step point's own action is the audit's answer to "why do they
  // leave here" (GA4-02 product, GA4-03 cart, GA4-04 checkout).
  const stepKey = `${focus.step.from}>${focus.step.to}`;
  const stepId = stepKey === "view_item>add_to_cart" ? "GA4-02" : /purchase$/.test(stepKey) ? "GA4-04" : "GA4-03";
  const stepFinding = result.categories.find(c => c.category === "GA4")?.findings.find(f => f.checklistId === stepId);
  if (!list.length && !stepFinding?.action) return "";
  const leak = result.ga4Facts?.facts["GA4-01"];
  const [pageEn, pageAr] = FUD_PAGE_LABEL[focus.page];
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  const stepAr = STEP_AR[`${focus.step.from}>${focus.step.to}`] ?? `${focus.step.from} → ${focus.step.to}`;
  const leadAr = `أكبر تسرب في مسار الشراء لديك: ${stepAr}، ${pct(focus.step.rate)} مقابل معدل معتاد ${pct(focus.step.benchmark)} (فقدان ${pct(1 - focus.step.rate)}). لذلك فحصنا ${pageAr} أولًا.`;
  const issues = list.filter(f => f.status === "fail" || f.status === "warn");
  const crop = list.find(f => f.evidence.crop)?.evidence.crop;
  const rows = list
    .map(f => {
      const tone = f.status === "fail" ? "critical" : f.status === "warn" ? "medium" : "pass";
      const label = f.status === "pass" ? bi("Working", "يعمل") : f.status === "fail" ? bi("Missing", "غير موجود") : bi("Needs work", "يحتاج تحسينًا");
      return `<li><a href="#row-${`tech-FUD-${f.ruleId}`.replace(/[^A-Za-z0-9_-]/g, "-")}"><span class="sev sev--${tone}">${label}</span><span>${bi(f.business.summary, f.ar?.business.summary ?? f.business.summary)}</span></a></li>`;
    })
    .join("");
  return `
        <div class="followup" id="ga4-followup">
          <p class="followup-kicker">${bi("Follow-up from GA4-01", "متابعة من GA4-01")}</p>
          <h3>${bi(`Why shoppers leave at your ${pageEn}`, `لماذا يغادر المتسوقون عند ${pageAr}`)}</h3>
          <p class="followup-lead">${bi(`${leak?.en ?? ""} So we checked your ${pageEn} first.`, leadAr)}</p>
          ${stepFinding?.action ? `<p class="act-step followup-why">${biHtml(`<b>Most likely cause and what to change (${stepId}):</b> ${escapeHtml(stepFinding.action.step)}`, `<b>السبب الأرجح وما يجب تغييره (${stepId}):</b> ${escapeHtml(stepFinding.ar?.action?.step ?? stepFinding.action.step)}`)}</p>` : ""}
          <div class="followup-body">
            <ul class="followup-list">${rows}</ul>
            ${crop ? `<figure class="fud-crop"><img src="${crop}" alt="${escapeHtml(`Your ${pageEn} on a phone`)}" loading="lazy" /><figcaption>${bi(`Your ${pageEn}, on a phone, the day we ran the audit`, `${pageAr} لديك على الهاتف، يوم إجراء التدقيق`)}</figcaption></figure>` : ""}
          </div>
          <p class="fud-note">${bi(`Checks on your ${pageEn}: ${issues.length} to fix, ${list.length - issues.length} working.`, `بنود ${pageAr}: ${issues.length} للإصلاح، ${list.length - issues.length} تعمل.`)}</p>
          ${notChecked.length ? `<p class="fud-note followup-gap">${bi(
            `Not checked this time: ${notChecked.map(f => ruleById(f.ruleId)?.title.en ?? f.ruleId).join(", ")}. ${focus.page === "cart" && fud.findings.some(f => f.pageType === "cart" && /empty/i.test(f.unassessedReason ?? ""))
              ? "Our test cart stayed empty, so these couldn't be seen."
              : "We couldn't see them clearly enough on this visit."} Check them by hand before acting on this step.`,
            `لم يتم فحصها هذه المرة: ${notChecked.map(f => ruleById(f.ruleId)?.title.ar ?? f.ruleId).join("، ")}. افحصها يدويًا قبل العمل على هذه الخطوة.`,
          )}</p>` : ""}
        </div>`;
}

function techSwitchHtml(id: string): string {
  return `<label for="${id}" class="tech-switch"><span class="tech-box" aria-hidden="true"></span>${bi("Technical details", "التفاصيل التقنية")}</label>`;
}

// ---- one check row ----
// Every check renders, passed ones included, each with a real Claude-written
// finding (see types.ts's FindingStatus). Arabic falls back to the English
// text per field when translate-ar.ts missed a finding, never a blank row.
// The .tech-toggle checkbox must stay the row's first child: the CSS-only
// business/technical switch reaches the voices through it (~ * selectors).
function checkRowHtml(cat: CategoryResult, point: ChecklistPoint, finding: CategoryResult["findings"][number] | undefined, result?: AuditResult): string {
  const id = techToggleId(cat, point);
  const failed = finding?.status === "fail";
  const fallbackEn = `${point.title}: no specific finding was reported for this check this run.`;
  const fallbackAr = `${point.title}: لم يتم تسجيل نتيجة محدَّدة لهذا البند في هذا التشغيل.`;
  const business = finding?.business ?? { summary: fallbackEn, detail: "" };
  const technical = finding?.technical ?? { summary: fallbackEn, detail: "" };
  const businessAr = finding?.ar?.business ?? (finding ? finding.business : { summary: fallbackAr, detail: "" });
  const technicalAr = finding?.ar?.technical ?? (finding ? finding.technical : { summary: fallbackAr, detail: "" });
  const status = failed ? finding!.severity : "pass";
  const side = failed ? severityTag(finding!.severity) : `<span class="sev sev--pass">${bi("Passed", "ناجح")}</span>`;
  const meta = finding
    ? `<span class="check-meta"><code>${escapeHtml(point.id)}</code>${bi(DATA_SOURCE_LABEL[finding.dataSource] ?? finding.dataSource, DATA_SOURCE_LABEL_AR[finding.dataSource] ?? finding.dataSource)}</span>`
    : "";
  const detail = (text: string, cls: string, ar: boolean) => (text ? `<p class="voice ${cls} ${ar ? "i18n-ar" : "i18n-en"}"${ar ? ' dir="rtl"' : ""}>${escapeHtml(text)}</p>` : "");

  return `
          <article class="check check--${status}" id="${rowId(cat, point)}" data-status="${status}">
            ${finding ? `<input type="checkbox" class="tech-toggle" id="${id}" />` : ""}
            <div class="check-main">
              <div class="check-side">${side}</div>
              <div class="check-body">
                <button type="button" class="check-head" aria-expanded="true">
                  <span class="check-titles">
                    <h3 class="voice voice-business i18n-en">${escapeHtml(business.summary)}</h3>
                    <h3 class="voice voice-business i18n-ar" dir="rtl">${escapeHtml(businessAr.summary)}</h3>
                    <h3 class="voice voice-technical i18n-en">${escapeHtml(technical.summary)}</h3>
                    <h3 class="voice voice-technical i18n-ar" dir="rtl">${escapeHtml(technicalAr.summary)}</h3>
                    ${finding?.opportunity || (failed && finding) ? `<span class="check-tags">${oppChip(finding!.opportunity)}${failed && finding ? adEffectChip(result, finding) : ""}</span>` : ""}
                  </span>
                  <span class="chevron">${CHEVRON}</span>
                </button>
                <div class="check-detail">
                  ${detail(business.detail, "voice-business", false)}
                  ${detail(businessAr.detail, "voice-business", true)}
                  ${detail(technical.detail, "voice-technical", false)}
                  ${detail(technicalAr.detail, "voice-technical", true)}
                  ${criteriaHtml(point, finding, result)}
                  ${failed && finding?.action && result ? actionBlockHtml(finding.action, finding.ar?.action, result) : ""}
                  ${!failed && finding?.protect ? protectHtml(finding.protect, finding.ar?.protect) : ""}
                  ${finding ? `<div class="check-foot">${techSwitchHtml(id)}${meta}</div>` : ""}
                </div>
              </div>
            </div>
          </article>`;
}

// "What good looks like": the standard the point is judged against (the
// criteria of an audit finding). Always in the technical view; also in the
// business view for readers who defend numbers to others (manager, agency).
function criteriaHtml(point: ChecklistPoint, finding: CategoryResult["findings"][number] | undefined, result?: AuditResult): string {
  const en = finding?.criteria ?? point.expectedState;
  if (!en) return "";
  const ar = finding?.ar?.criteria ?? en;
  const line = (voice: string, isAr: boolean) =>
    `<p class="voice ${voice} crit ${isAr ? "i18n-ar" : "i18n-en"}"${isAr ? ' dir="rtl"' : ""}><b>${isAr ? "شكل النتيجة السليمة:" : "What good looks like:"}</b> ${escapeHtml(isAr ? ar : en)}</p>`;
  const business = result?.audienceRole === "marketing_manager" || result?.audienceRole === "agency";
  return [line("voice-technical", false), line("voice-technical", true), ...(business ? [line("voice-business", false), line("voice-business", true)] : [])].join("");
}

function checkGroupsHtml(cat: CategoryResult, result?: AuditResult): string {
  const checklist = checklistForDisplay(cat.category, cat.checklistTally.total, cat.findings.map(f => f.checklistId));
  const findingsById = new Map(cat.findings.map(f => [f.checklistId, f]));
  // Issues first, worst first; passed checks last (stable sort keeps
  // checklist order for ties).
  const rank = (point: ChecklistPoint): number => {
    const f = findingsById.get(point.id);
    return f?.status === "fail" ? SEVERITY_RANK[f.severity] : 3;
  };
  return groupChecklist(cat.category, checklist)
    .map(g => {
      const points = [...g.points].sort((a, b) => rank(a) - rank(b));
      const issues = points.filter(p => rank(p) < 3);
      const passed = points.filter(p => rank(p) === 3);
      const rows = (list: ChecklistPoint[]) => list.map(p => checkRowHtml(cat, p, findingsById.get(p.id), result)).join("");
      // Passed checks are shown open and highlighted, never folded away:
      // what already works is part of the result, not a detail to dig for.
      return `
        <div class="check-group">
          <div class="group-head">
            <h3>${bi(g.en, g.ar)}</h3>
            <span>${bi(`${issues.length} to fix · ${passed.length} passed`, `${issues.length} للإصلاح · ${passed.length} ناجح`)}</span>
          </div>
          ${issues.length ? `<div class="check-list">${rows(issues)}</div>` : ""}
          ${passed.length ? `
          <div class="passed-block">
            <h4 class="passed-head">${bi(`${passed.length} passed ${checksWord(passed.length)}`, `${passed.length} ${arChecksNoun(passed.length)} ناجحة`)}</h4>
            <div class="check-list check-list--passed">${rows(passed)}</div>
          </div>` : ""}
        </div>`;
    })
    .join("");
}

// One filter for the whole report as plain text tabs (status), a search box
// and the "technical details for every check" switch. Filtering is
// client-side on each row's data-status and text (script block at the end).
function checksIntroHtml(counts: ReturnType<typeof resultCounts>, result: AuditResult): string {
  const tab = (filter: string, en: string, ar: string, n: number, active = false) =>
    `<button type="button" class="chip${active ? " is-active" : ""}" data-filter="${filter}" aria-pressed="${active}">${bi(en, ar)} <span class="chip-n">${n}</span></button>`;
  return `
      <section class="doc-section checks-intro" id="checks">
        <h2>${biHtml(`All ${counts.total} checks`, `جميع البنود (${counts.total})`)}</h2>
        <p class="section-lead">${bi(...copyFor(result).checksIntro)}</p>
        ${checkMapHtml(result, counts)}
        <div class="controls">
          <div class="chips" role="group" aria-label="Filter checks">
            <span class="chip-ink" aria-hidden="true"></span>
            ${tab("all", "All", "الكل", counts.total, true)}
            ${tab("fail", "Need work", "تحتاج إصلاحًا", counts.failed)}
            ${counts.critical ? tab("critical", "Critical", "حرجة", counts.critical) : ""}
            ${tab("pass", "Passed", "ناجحة", counts.passed)}
          </div>
          <div class="controls-end">
            <input type="search" class="search i18n-en" placeholder="Search checks" aria-label="Search checks" />
            <input type="search" class="search i18n-ar" dir="rtl" placeholder="ابحث في البنود" aria-label="ابحث في البنود" />
            <button type="button" class="tech-all" id="tech-all" aria-pressed="false" hidden>
              <span class="tech-box" aria-hidden="true"></span>${bi("Technical details for every check", "التفاصيل التقنية لكل البنود")}
            </button>
          </div>
        </div>
        <p class="filter-empty" hidden>${bi("No checks match.", "لا توجد بنود مطابقة.")}</p>
      </section>`;
}

function categorySectionHtml(cat: CategoryResult, result: AuditResult, _assets: BrandAssets): string {
  const key = cat.category;
  const { passed, total } = cat.checklistTally;
  const percent = total > 0 ? (passed / total) * 100 : 0;
  const color = scoreColor(percent);
  return `
      <section class="doc-section category" id="sec-${SECTION_SLUG[key]}">
        <header class="cat-head">
          <h2>${biHtml(escapeHtml(categoryLabel(key, result, false)), escapeHtml(categoryLabel(key, result, true)))}</h2>
          <p class="cat-score">${ringSvg(percent, color)}<span><b class="count" data-to="${passed}" style="color:${color}">${passed}</b> / ${total} ${bi("passed", "ناجح")}</span></p>
        </header>
        <p class="section-lead">${biHtml(escapeHtml(CATEGORY_CAPTION[key]), escapeHtml(CATEGORY_CAPTION_AR[key]))}</p>
        ${checkGroupsHtml(cat, result)}
      </section>`;
}

const SPEED_PAGE_LABEL: Record<string, [string, string]> = {
  home: ["Homepage", "الصفحة الرئيسية"],
  collection: ["Collection page", "صفحة المجموعة"],
  cart: ["Cart", "سلة التسوق"],
  product: ["Product page", "صفحة المنتج"],
};

function speedValue(score: number | null): string {
  return score === null ? `<span class="na">—</span>` : `<span class="count" data-to="${score}" style="color:${speedColor(score)}">${score}</span>`;
}

function speedSectionHtml(ps: NonNullable<AuditResult["pageSpeed"]>): string {
  const card = (titleHtml: string, url: string | null, mobile: number | null, desktop: number | null, avg = false) => `
          <div class="speed-card${avg ? " speed-card--avg" : ""}">
            <h3>${titleHtml}</h3>
            ${url ? `<span class="speed-url" dir="ltr">${escapeHtml(url)}</span>` : ""}
            <div class="gauges">${gaugeHtml(mobile, "Mobile", "الموبايل")}${gaugeHtml(desktop, "Desktop", "الكمبيوتر")}</div>
          </div>`;
  const pages = ps.pages
    .map(p => {
      const [en, ar] = SPEED_PAGE_LABEL[p.type] ?? [p.type, p.type];
      return card(bi(en, ar), p.url, p.mobile, p.desktop);
    })
    .join("");
  return `
      <section class="doc-section" id="speed">
        <h2>${bi("Page speed", "سرعة الصفحات")}</h2>
        <p class="section-lead">${bi(
          "Google's own speed test scores each page out of 100, on mobile and on desktop. 90 or more is fast, 50 to 89 needs work, and under 50 is slow. Slow pages make shoppers wait, and many leave before they see a product. This score is separate from your 50 checks.",
          "اختبار السرعة من Google يعطي كل صفحة درجة من 100 على الموبايل والكمبيوتر. 90 فأكثر سريعة، ومن 50 إلى 89 تحتاج إلى تحسين، وأقل من 50 بطيئة. الصفحة البطيئة تجعل العميل ينتظر، وكثيرون يغادرون قبل أن يروا المنتج. هذه الدرجة منفصلة عن البنود الخمسين.",
        )}</p>
        <div class="speed-grid">
          ${card(bi("Average", "المتوسط"), null, ps.average.mobile, ps.average.desktop, true)}
          ${pages}
        </div>
      </section>`;
}

// Every source this run drew on. GA4/GTM wording depends on whether any
// finding in that category came from live account data (Google access
// granted) or only from the public site.
function sourcesHtml(result: AuditResult): string {
  const cat = (k: CategoryKey) => result.categories.find(c => c.category === k);
  const usedLiveData = (k: CategoryKey) => cat(k)?.findings.some(f => f.dataSource === "live") ?? false;
  const sources: string[] = [];
  if (cat("GA4")) {
    sources.push(usedLiveData("GA4")
      ? bi("Your Google Analytics 4 account (you gave us read-only access)", "حساب تحليلات جوجل 4 الخاص بك (منحتنا صلاحية الاطلاع فقط)")
      : bi("The Google Analytics 4 code anyone can see on your site", "كود تحليلات جوجل 4 الظاهر لأي زائر على موقعك"));
  }
  if (cat("GTM")) {
    sources.push(usedLiveData("GTM")
      ? bi("Your Google Tag Manager account (you gave us read-only access)", "حساب مدير علامات جوجل الخاص بك (منحتنا صلاحية الاطلاع فقط)")
      : bi("The Google Tag Manager code anyone can see on your site", "كود مدير علامات جوجل الظاهر لأي زائر على موقعك"));
  }
  sources.push(bi("Your website's public code and list of pages", "الكود العام لموقعك وقائمة صفحاته"));
  if (cat("Website")) {
    sources.push(bi("A visit to your site in a real browser, the way a customer sees it", "زيارة لموقعك من متصفح حقيقي، كما يراه العميل"));
  }
  const speedPages = result.pageSpeed?.pages.filter(p => p.mobile !== null || p.desktop !== null).length ?? 0;
  if (speedPages > 0) {
    sources.push(bi(`Google's speed test (PageSpeed Insights), run on ${speedPages} of your pages`, `اختبار السرعة من Google (PageSpeed Insights) على ${speedPages} من صفحاتك`));
  }
  if (result.fud) {
    const loaded = result.fud.pagesSampled.filter(p => p.loaded).length;
    sources.push(bi(
      `A phone visit to ${loaded} of your pages, adding one product to the cart (our visit was kept out of your analytics). Purchase-friction rules ${result.fud.ruleSetVersion}.`,
      `زيارة من هاتف لعدد ${loaded} من صفحاتك مع إضافة منتج واحد إلى السلة (استبعدنا زيارتنا من بيانات التحليلات لديك). قواعد عوائق الشراء ${result.fud.ruleSetVersion}.`,
    ));
  }
  const pages = result.discoveredPages.map(u => `<li dir="ltr">${escapeHtml(u)}</li>`).join("");
  return `
      <section class="doc-section" id="sources">
        <h2>${bi("Where this data came from", "مصادر بيانات هذا التدقيق")}</h2>
        <div class="sources">
          <ul class="source-list">${sources.map(s => `<li>${s}</li>`).join("")}</ul>
          ${pages ? `
          <div>
            <h3>${bi("Pages we checked", "الصفحات التي فحصناها")}</h3>
            <ul class="page-list">${pages}</ul>
          </div>` : ""}
        </div>
      </section>`;
}

// ---- purchase friction (FUD pass, src/fud/) ----
// Its own section with its own score, never part of the 50-check tally.
// Reuses the check-row markup (summary/detail toggle, business/technical
// switch, EN/AR), with three additions per issue: the fix, ready-to-paste
// copy, and a crop of the store's own page. Rendered only when the pass ran
// and assessed something — otherwise the report is exactly as before.

const FUD_BAND_LABEL: Record<FudBand, [string, string]> = {
  quick_win: ["Quick win", "مكسب سريع"],
  dev_task: ["Needs a developer", "يحتاج إلى مطوّر"],
  test_first: ["Test first", "اختبره أولًا"],
};
const FUD_PAGE_LABEL: Record<FudPageType, [string, string]> = {
  home: ["homepage", "الصفحة الرئيسية"],
  product: ["product page", "صفحة المنتج"],
  cart: ["cart", "سلة التسوق"],
  collection: ["collection page", "صفحة المجموعة"],
};
// Detector-based note on how the same check looks on a desktop screen (the
// findings themselves are judged on the phone visit — see FudFinding.desktop).
const FUD_DESKTOP_NOTE: Record<"issue" | "pass", Partial<Record<NonNullable<FudFinding["desktop"]>, [string, string]>>> = {
  issue: {
    same: ["On desktop: the same gap.", "على سطح المكتب: الفجوة نفسها."],
    better: ["On desktop this looks in place, so it is mainly a phone problem.", "على سطح المكتب يبدو هذا في مكانه، فالمشكلة في الهاتف أساسًا."],
    worse: ["On desktop it is further from where shoppers need it than on the phone.", "على سطح المكتب يبتعد هذا عن المكان الذي يحتاجه المتسوق أكثر من الهاتف."],
  },
  pass: {
    worse: ["On desktop we did not find this in the same place. Worth a look on a large screen.", "على سطح المكتب لم نجد هذا في المكان نفسه. يستحق المراجعة على شاشة كبيرة."],
  },
};
const FUD_GROUP_LABEL: Record<FudGroup, [string, string]> = {
  trust: ["Trust & cost", "الثقة والتكلفة"],
  homepage: ["Homepage", "الصفحة الرئيسية"],
  product: ["Product page", "صفحة المنتج"],
  navigation: ["Navigation & search", "التنقل والبحث"],
  collection: ["Collection page", "صفحة المجموعة"],
  buy_more: ["Order value", "قيمة الطلب"],
  buy_again: ["Repeat purchases", "تكرار الشراء"],
  local: ["Local market", "السوق المحلي"],
  popups: ["Popups", "النوافذ المنبثقة"],
};

function fudGroupLabel(ruleId: string): [string, string] {
  const rule = ruleById(ruleId);
  return FUD_GROUP_LABEL[rule ? groupOf(rule) : "trust"];
}

const FUNNEL_STEP_TEXT: Partial<Record<string, [string, string]>> = {
  "view_item>add_to_cart": ["of product views led to an add to cart", "من مشاهدات المنتجات انتهت بالإضافة إلى السلة"],
  "add_to_cart>begin_checkout": ["of add-to-carts went on to start checkout", "من الإضافات إلى السلة انتقلت إلى بدء إتمام الشراء"],
  "begin_checkout>purchase": ["of started checkouts ended in a purchase", "من عمليات بدء إتمام الشراء انتهت بعملية شراء"],
};

function fudRowHtml(f: FudFinding, open: boolean, periodDays: number | null, result?: AuditResult): string {
  const id = `tech-FUD-${f.ruleId}`.replace(/[^A-Za-z0-9_-]/g, "-");
  const issue = f.status === "fail" || f.status === "warn";
  const tone = f.status === "fail" ? "critical" : f.status === "warn" ? "medium" : "pass";
  const side =
    f.status === "fail" ? `<span class="sev sev--critical">${bi("Missing", "غير موجود")}</span>`
    : f.status === "warn" ? `<span class="sev sev--medium">${bi("Needs work", "يحتاج تحسينًا")}</span>`
    : `<span class="sev sev--pass">${bi("Working", "يعمل")}</span>`;
  const ar = f.ar ?? { technical: f.technical, business: f.business, recommendation: f.recommendation };
  const voice = (text: string, cls: string, isAr: boolean) => (text ? `<p class="voice ${cls} ${isAr ? "i18n-ar" : "i18n-en"}"${isAr ? ' dir="rtl"' : ""}>${escapeHtml(text)}</p>` : "");
  const [pageEn, pageAr] = FUD_PAGE_LABEL[f.pageType];

  const step = f.funnel ? FUNNEL_STEP_TEXT[`${f.funnel.from}>${f.funnel.to}`] : undefined;
  const pct = f.funnel ? Math.round(f.funnel.rate * 100) : 0;
  const days = periodDays ?? 28;
  const funnel = f.funnel && step
    ? `<p class="fud-funnel">${bi(`Your GA4: only ${pct}% ${step[0]} in the last ${days} days.`, `بيانات GA4 لديك: ${pct}% فقط ${step[1]} خلال آخر ${days} يومًا.`)}</p>`
    : "";
  const desktopText = f.desktop ? FUD_DESKTOP_NOTE[issue ? "issue" : "pass"][f.desktop] : undefined;
  const desktopNote = desktopText ? `<p class="fud-desktop">${bi(desktopText[0], desktopText[1])}</p>` : "";
  const rec = issue && f.recommendation
    ? `<p class="fud-rec">${biHtml(`<b>What to change:</b> ${escapeHtml(f.recommendation)}`, `<b>ما الذي يجب تغييره:</b> ${escapeHtml(ar.recommendation ?? f.recommendation)}`)}</p>`
    : "";
  const copy = issue && f.exampleCopy
    ? `
                  <div class="fud-copy">
                    <span class="fud-copy-label">${bi("Copy you can use", "نص يمكنك استخدامه")}</span>
                    <p dir="ltr" lang="en">${escapeHtml(f.exampleCopy.en)}</p>
                    <p dir="rtl" lang="ar">${escapeHtml(f.exampleCopy.ar)}</p>
                  </div>`
    : "";
  const crop = issue && f.evidence.crop
    ? `
                  <figure class="fud-crop">
                    <img src="${f.evidence.crop}" alt="${escapeHtml(`Your ${pageEn} on a phone, where this check looks`)}" loading="lazy" />
                    <figcaption>${bi(`Your ${pageEn}, on a phone, the day we ran the audit`, `${pageAr} لديك على الهاتف، يوم إجراء التدقيق`)}</figcaption>
                  </figure>`
    : "";
  const meta = `<span class="check-meta"><code>${escapeHtml(f.ruleId)}</code>${f.band && f.pexti ? `${bi(FUD_BAND_LABEL[f.band][0], FUD_BAND_LABEL[f.band][1])}<span>PEXTI ${f.pexti.score}</span>` : ""}${bi(pageEn, pageAr)}</span>`;
  const [groupEn, groupAr] = fudGroupLabel(f.ruleId);
  const bandTag = `<span class="fud-tags">${oppChip(f.opportunity)}${issue && f.band ? `<span class="fud-band fud-band--${f.band}">${bi(FUD_BAND_LABEL[f.band][0], FUD_BAND_LABEL[f.band][1])}</span>` : ""}<span class="fud-group-tag">${bi(groupEn, groupAr)}</span></span>`;
  const act = issue && f.action && result ? actionBlockHtml(f.action, { step: ar.recommendation, doneWhen: f.ar?.doneWhen }, result) : "";

  return `
          <article class="check check--${tone} fud-row${open ? "" : " is-collapsed"}" id="row-${id}" data-fud-status="${f.status}">
            <input type="checkbox" class="tech-toggle" id="${id}" />
            <div class="check-main">
              <div class="check-side">${side}</div>
              <div class="check-body">
                <button type="button" class="check-head" aria-expanded="${open ? "true" : "false"}">
                  <span class="check-titles">
                    <h3 class="voice voice-business i18n-en">${escapeHtml(f.business.summary)}</h3>
                    <h3 class="voice voice-business i18n-ar" dir="rtl">${escapeHtml(ar.business.summary)}</h3>
                    <h3 class="voice voice-technical i18n-en">${escapeHtml(f.technical.summary)}</h3>
                    <h3 class="voice voice-technical i18n-ar" dir="rtl">${escapeHtml(ar.technical.summary)}</h3>
                    ${bandTag}
                  </span>
                  <span class="chevron">${CHEVRON}</span>
                </button>
                <div class="check-detail">
                  ${voice(f.business.detail, "voice-business", false)}
                  ${voice(ar.business.detail, "voice-business", true)}
                  ${voice(f.technical.detail, "voice-technical", false)}
                  ${voice(ar.technical.detail, "voice-technical", true)}
                  ${funnel}
                  ${desktopNote}
                  ${act || rec}
                  ${copy}
                  ${crop}
                  <div class="check-foot">${techSwitchHtml(id)}${meta}</div>
                </div>
              </div>
            </div>
          </article>`;
}

const TONE_LABEL: Record<"good" | "bad" | "neutral", [string, string]> = {
  good: ["Strength", "نقطة قوة"],
  bad: ["Opportunity", "فرصة"],
  neutral: ["Context", "سياق"],
};

// "Where the money is": the store's own GA4 numbers, turned into a revenue
// range (clearly an estimate) and a few plain-language segment findings.
function insightsHtml(fud: NonNullable<AuditResult["fud"]>): string {
  const ins = fud.insights;
  if (!ins || (!ins.text && ins.lines.length === 0)) return "";
  const opp = ins.opportunity;
  const head = opp && ins.text
    ? `
          <p class="fud-money-figure">${biHtml(
            `<b>${escapeHtml(formatMoney(opp.low, ins.currency))}–${escapeHtml(formatMoney(opp.high, ins.currency))}</b> a month`,
            `<b>${escapeHtml(formatMoney(opp.low, ins.currency, true))}–${escapeHtml(formatMoney(opp.high, ins.currency, true))}</b> شهريًا`,
          )}</p>
          <p class="fud-money-text">${bi(ins.text.en, ins.text.ar)}</p>
          <p class="fud-note">${bi(
            `An estimate, not a promise: it assumes the weakest steps of your funnel close a quarter to a half of the gap to typical benchmarks, from your last ${ins.periodDays} days of GA4 data (revenue ${formatMoney(opp.monthlyRevenue, ins.currency)} a month). It is capped at 30% of current revenue.`,
            `تقدير وليس وعدًا: يفترض أن أضعف خطوات مسار الشراء تقلّص ربع إلى نصف الفجوة مع المعدلات المعتادة، اعتمادًا على بيانات GA4 لآخر ${ins.periodDays} يومًا (إيرادات ${formatMoney(opp.monthlyRevenue, ins.currency, true)} شهريًا). الحد الأقصى 30% من الإيرادات الحالية.`,
          )}</p>`
    : "";
  const lines = ins.lines
    .map(l => `
            <li class="fud-insight fud-insight--${l.tone}"><span class="fud-insight-tag">${bi(TONE_LABEL[l.tone][0], TONE_LABEL[l.tone][1])}</span><span>${bi(l.en, l.ar)}</span></li>`)
    .join("");
  return `
        <div class="fud-money">
          <h3>${bi("Where the money is", "أين تكمن الفرصة")}</h3>
          ${head}
          ${lines ? `<ul class="fud-insights">${lines}</ul>` : ""}
        </div>`;
}

function frictionSectionHtml(result: AuditResult): string {
  const fud = result.fud;
  if (!fud || fud.assessed === 0) return "";
  // A reviewer can hide a finding (npm run fud-override); it then leaves the
  // report and the score, but stays in the saved result for calibration.
  const shown = fud.findings.filter(f => f.override?.to !== "hidden");
  const issues = shown.filter(f => f.status === "fail" || f.status === "warn");
  const quick = issues.filter(f => f.band === "quick_win").slice(0, 3);
  const quickIds = new Set(quick.map(f => f.ruleId));
  const rest = issues.filter(f => !quickIds.has(f.ruleId));
  const working = shown.filter(f => f.status === "pass");
  const unassessed = shown.filter(f => f.status === "unassessed");
  const periodDays = result.ga4Metrics?.periodDays ?? null;

  const scanned = fud.pagesSampled.filter(p => p.loaded).map(p => FUD_PAGE_LABEL[p.pageType]);
  const scannedEn = scanned.map(s => s[0]).join(", ");
  const scannedAr = scanned.map(s => s[1]).join("، ");
  const leadEn = fud.score !== null
    ? `Conversion score ${fud.score}/100 — ${fud.assessed} of ${fud.applicable} checks assessed on your ${scannedEn}, on a phone: the doubts that make shoppers hesitate, and the layout, navigation and offer gaps that cost sales and order value.`
    : `We checked your ${scannedEn} on a phone for what stops shoppers buying and what lowers order value. Too few checks could be completed for a score, so only the findings are shown.`;
  const leadAr = fud.score !== null
    ? `مؤشر التحويل ${fud.score}/100 — تم فحص ${fud.assessed} من ${fud.applicable} بندًا على ${scannedAr} لديك من الهاتف: الشكوك التي تجعل المتسوق يتردد، وفجوات التصميم والتنقل والعروض التي تكلفك مبيعات وقيمة طلب.`
    : `فحصنا ${scannedAr} لديك من الهاتف بحثًا عمّا يمنع المتسوق من الشراء وما يخفض قيمة الطلب. لم نتمكن من فحص عدد كافٍ من البنود لحساب مؤشر، لذلك نعرض النتائج فقط.`;

  const group = (titleEn: string, titleAr: string, list: FudFinding[], open: boolean) =>
    list.length
      ? `
        <div class="fud-group">
          <div class="group-head"><h3>${bi(titleEn, titleAr)}</h3><span>${list.length}</span></div>
          <div class="check-list">${list.map(f => fudRowHtml(f, open, periodDays, result)).join("")}</div>
        </div>`
      : "";

  const workingFold = working.length
    ? `
        <div class="passed-block fud-group">
          <h4 class="passed-head">${bi(`Already working (${working.length})`, `يعمل بالفعل (${working.length})`)}</h4>
          <div class="check-list check-list--passed">${working.map(f => fudRowHtml(f, true, periodDays, result)).join("")}</div>
        </div>`
    : "";

  const notChecked = unassessed.length
    ? `<p class="fud-note">${bi(
        `Not confirmed this time: ${unassessed.map(f => f.ruleId).join(", ")} — we couldn't reach the page, or couldn't tell with enough certainty.`,
        `لم يتم تأكيدها هذه المرة: ${unassessed.map(f => f.ruleId).join("، ")} — تعذّر الوصول إلى الصفحة أو لم نتمكن من التأكد بدرجة كافية.`,
      )}</p>`
    : "";

  // Store owner and media buyer: the same findings, grouped by who acts on
  // them (#23 chunking) and framed for that reader. Biggest PEXTI first.
  const persona = personaOf(result.audienceRole);
  if (persona) {
    const buyer = persona === "media_buyer";
    const byScore = (list: FudFinding[]) => [...list].sort((a, b) => (b.pexti?.score ?? 0) - (a.pexti?.score ?? 0));
    const bands = {
      quick: byScore(issues.filter(f => f.band === "quick_win")),
      dev: byScore(issues.filter(f => f.band === "dev_task")),
      test: byScore(issues.filter(f => f.band !== "quick_win" && f.band !== "dev_task")),
    };
    const [titleEn, titleAr] = buyer
      ? ["After the click: what loses paid visitors", "بعد الضغط: إيه اللي بيضيّع الزوار المدفوعين"]
      : ["What stops your shoppers buying", "وش يوقّف المتسوقين عن الشراء"];
    const [pLeadEn, pLeadAr] = buyer
      ? [`We visited your ${scannedEn} on a phone, the way a paid visitor lands. Every leak here converts fewer of the clicks you pay for, so fixing it raises ROAS on the same spend.${fud.score !== null ? ` Conversion score ${fud.score}/100.` : ""}`,
         `زرنا ${scannedAr} من الموبايل بنفس الطريقة اللي الزائر المدفوع بيوصل بيها. كل تسريب هنا بيحوّل كليكات أقل من اللي بتدفع فيها، وإصلاحه بيرفع ROAS بنفس الإنفاق.${fud.score !== null ? ` مؤشر التحويل ${fud.score}/100.` : ""}`]
      : [`We visited your ${scannedEn} on a phone, like your customers do, and noted what makes them hesitate or leave.${fud.score !== null ? ` Conversion score ${fud.score}/100.` : ""}`,
         `زرنا ${scannedAr} من الجوال مثل ما يسوي عملاؤك، وسجّلنا وش يخليهم يترددون أو يطلعون.${fud.score !== null ? ` مؤشر التحويل ${fud.score}/100.` : ""}`];
    return `
      <section class="doc-section fud" id="friction">
        <h2>${bi(titleEn, titleAr)}</h2>
        <p class="section-lead">${bi(pLeadEn, pLeadAr)}</p>
        ${insightsHtml(fud)}
        ${ga4FollowUpHtml(result)}
        ${group(buyer ? "Fix before you scale spend" : "You can do these yourself", buyer ? "صلّحها قبل ما تزوّد الميزانية" : "تقدر تسويها بنفسك", bands.quick, true)}
        ${group(buyer ? "Send to the developer" : "Needs your developer", buyer ? "ابعتها للمطوّر" : "تحتاج المطوّر حقك", bands.dev, !bands.quick.length)}
        ${group("Test before you change it", buyer ? "جرّبها قبل ما تغيّرها" : "جرّبها قبل ما تغيّرها", bands.test, false)}
        ${!issues.length ? `<p class="fud-note">${bi("Nothing stood out on the pages we checked.", buyer ? "مفيش حاجة لفتت النظر في الصفحات اللي فحصناها." : "ما فيه شي لفت النظر في الصفحات اللي فحصناها.")}</p>` : ""}
        ${workingFold}
        ${notChecked}
      </section>`;
  }

  return `
      <section class="doc-section fud" id="friction">
        <h2>${bi("Conversion review", "مراجعة التحويل")}</h2>
        <p class="section-lead">${bi(leadEn, leadAr)}</p>
        ${insightsHtml(fud)}
        ${ga4FollowUpHtml(result)}
        ${group("Fix these first", "أصلح هذه أولًا", quick, true)}
        ${group(quick.length ? "Also worth improving" : "Worth improving", quick.length ? "تستحق التحسين أيضًا" : "تستحق التحسين", rest, false)}
        ${!issues.length ? `<p class="fud-note">${bi("Nothing stood out on the pages we checked.", "لم يظهر ما يستدعي التحسين في الصفحات التي فحصناها.")}</p>` : ""}
        ${workingFold}
        ${notChecked}
      </section>`;
}

// The closing band sits on the card color, a step up from the page, so the
// call to action reads as the end of the document.
function ctaHtml(counts: ReturnType<typeof resultCounts>, contactUrl: string, result: AuditResult): string {
  const cta = copyFor(result).cta;
  return `
    <section class="cta-band">
      <div class="cta-gate" aria-hidden="true"><span class="gate gate--l"></span><span class="gate gate--r"></span></div>
      <div class="wrap cta-card beam">
       <div class="cta-wave" aria-hidden="true"></div>
       <div class="cta-inner">
        <div>
          <h2>${counts.failed > 0 ? bi(...cta.title) : bi(...cta.titlePass)}</h2>
          <p>${bi(...cta.body)}</p>
        </div>
        <a class="btn btn--primary btn--lg magnetic" href="${contactUrl}">${bi(...cta.button)}</a>
       </div>
      </div>
    </section>`;
}

function footerHtml(assets: BrandAssets, attributedTo: string, generatedAt: string, generatedAtAr: string, contactUrl: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return `
    <footer class="footer">
      <div class="wrap footer-grid">
        <div class="footer-col footer-brand">
          <a class="footer-logo" href="${SITE_URL}"><img src="${assets.wordmark}" alt="Optimizers" /></a>
          <p>${bi("CRO agency for e-commerce brands in the GCC.", "وكالة لتحسين معدلات التحويل لمتاجر التجارة الإلكترونية في الخليج.")}</p>
          <div class="social">
            <a href="https://web.facebook.com/optimizersagency" aria-label="Optimizers on Facebook">f</a>
            <a href="https://x.com/optimizersCRO/" aria-label="Optimizers on X">X</a>
            <a href="https://www.linkedin.com/company/optimizersagency" aria-label="Optimizers on LinkedIn">in</a>
            <a href="https://www.instagram.com/optimizersagency?igsh=b3g3NTR5NGltOW05" aria-label="Optimizers on Instagram">IG</a>
          </div>
        </div>
        <div class="footer-col">
          <h3>${bi("Quick Links", "روابط سريعة")}</h3>
          <a href="${SITE_URL}">${bi("About", "من نحن")}</a>
          <a href="${base}/#services">${bi("Services", "الخدمات")}</a>
          <a href="${base}/#roi-calculator">${bi("ROI Calculator", "حاسبة العائد على الاستثمار")}</a>
          <a href="${contactUrl}">${bi("Contact", "تواصل معنا")}</a>
        </div>
        <div class="footer-col">
          <h3>${bi("Services", "خدماتنا")}</h3>
          <a href="${base}/#services">${bi("Conversion Rate Optimization", "تحسين معدل التحويل")}</a>
          <a href="${base}/#services">${bi("A/B Testing", "اختبارات A/B")}</a>
          <a href="${base}/#services">${bi("User Experience Design", "تصميم تجربة المستخدم")}</a>
          <a href="${base}/#services">${bi("Analytics & Tracking", "التحليلات والتتبع")}</a>
        </div>
        <div class="footer-col">
          <h3>${bi("Contact Us", "معلومات التواصل")}</h3>
          <p>${bi("Ras Al Khaimah Economic Zone Office", "مكتب المنطقة الاقتصادية في رأس الخيمة")}</p>
          <p>${bi("Office Business Hub, New Cairo, Egypt", "مركز الأعمال، القاهرة الجديدة، مصر")}</p>
          <p dir="ltr">+971 564800881</p>
          <p dir="ltr">+20 1021001000</p>
        </div>
      </div>
      <div class="wrap footer-bottom">
        <p>${biHtml(
          `This audit was generated by <strong>Optimizers</strong> for <strong>${attributedTo}</strong> on ${escapeHtml(generatedAt)}.`,
          `تم إعداد هذا التدقيق من قِبل <strong>Optimizers</strong> لـ <strong>${attributedTo}</strong> بتاريخ ${escapeHtml(generatedAtAr)}.`,
        )}</p>
        <a href="${SITE_URL}">optimizers.agency</a>
      </div>
    </footer>`;
}

// Phone-width section bar: the contents list is hidden below 1024px, so a
// sticky row of section links takes its place on a long single-column page.
type NavExtra = { before: Array<[string, string, string]>; after: Array<[string, string, string]> };

function jumpBarHtml(result: AuditResult, hasFixFirst: boolean, hasSpeed: boolean, hasNumbers = false, hasFriction = false, extra: NavExtra = { before: [], after: [] }): string {
  const links: Array<[string, string, string]> = [["overview", "Summary", "الملخص"]];
  if (hasFixFirst) links.push(["fix-first", ...copyFor(result).jump]);
  if (hasNumbers) links.push(["numbers", "Numbers", "الأرقام"]);
  if (hasFriction) links.push(["friction", "Conversion", "التحويل"]);
  links.push(...extra.before);
  for (const cat of result.categories) {
    const [en, ar] = CATEGORY_SHORT[cat.category];
    links.push([`sec-${SECTION_SLUG[cat.category]}`, en, ar]);
  }
  if (hasSpeed) links.push(["speed", "Speed", "السرعة"]);
  links.push(...extra.after);
  links.push(["sources", "Sources", "المصادر"]);
  return `<nav class="jump" aria-label="Report sections">${links.map(([id, en, ar]) => `<a href="#${id}" data-spy="${id}">${bi(en, ar)}</a>`).join("")}</nav>`;
}

// Stripe-docs style table of contents: sticky beside the reading column on
// wide screens, one line per section, groups listed under each tool.
function tocHtml(result: AuditResult, hasFixFirst: boolean, hasScreens: boolean, hasSpeed: boolean, hasNumbers = false, hasFriction = false, extra: NavExtra = { before: [], after: [] }): string {
  const link = (id: string, en: string, ar: string, sub = false) =>
    `<li${sub ? ' class="toc-sub"' : ""}><a href="#${id}" data-spy="${id}">${bi(en, ar)}</a></li>`;
  const items: string[] = [link("overview", "Summary", "الملخص")];
  if (result.audienceRole) items.push(link("answers", "Your questions", "أسئلتك"));
  if (hasFixFirst) items.push(link("fix-first", ...copyFor(result).toc));
  if (hasScreens) items.push(link("screens", "Your store", "متجرك"));
  if (hasNumbers) items.push(link("numbers", "Your numbers", "أرقامك"));
  if (hasFriction) {
    const score = result.fud?.score;
    items.push(`<li><a href="#friction" data-spy="friction">${bi("Conversion review", "مراجعة التحويل")}${score !== null && score !== undefined ? `<span class="toc-n">${score}/100</span>` : ""}</a></li>`);
  }
  for (const [id, en, ar] of extra.before) items.push(link(id, en, ar));
  for (const cat of result.categories) {
    const { passed, total } = cat.checklistTally;
    items.push(`<li><a href="#sec-${SECTION_SLUG[cat.category]}" data-spy="sec-${SECTION_SLUG[cat.category]}">${biHtml(escapeHtml(categoryLabel(cat.category, result, false)), escapeHtml(categoryLabel(cat.category, result, true)))}<span class="toc-n">${passed}/${total}</span></a></li>`);
  }
  if (hasSpeed) items.push(link("speed", "Page speed", "سرعة الصفحات"));
  for (const [id, en, ar] of extra.after) items.push(link(id, en, ar));
  items.push(link("sources", "Data sources", "مصادر البيانات"));
  return `
      <nav class="toc" aria-label="Report contents">
        <p class="toc-title">${bi("On this report", "في هذا التقرير")}</p>
        <ul><span class="toc-pill" aria-hidden="true"></span>${items.join("")}</ul>
        <span class="toc-rail" aria-hidden="true"><span></span></span>
      </nav>`;
}

// ---- charts ----
// Every chart draws only numbers this audit actually produced: the check
// tallies, PageSpeed scores, and (when the GA4 property was a live match)
// the store's own GA4 numbers in result.ga4Metrics. Values ship as text in
// the markup; the script block only animates them in.

const FUNNEL_LABEL: Record<Ga4FunnelEvent, [string, string]> = {
  page_view: ["Page views", "مشاهدات الصفحات"],
  view_item: ["Product views", "مشاهدات المنتجات"],
  add_to_cart: ["Added to cart", "إضافات إلى السلة"],
  begin_checkout: ["Checkouts started", "بدء إتمام الشراء"],
  add_shipping_info: ["Shipping details entered", "إدخال بيانات الشحن"],
  add_payment_info: ["Payment details entered", "إدخال بيانات الدفع"],
  purchase: ["Purchases", "عمليات الشراء"],
};

// GA4's default channel group names, as GA4 spells them.
const CHANNEL_AR: Record<string, string> = {
  "Organic Search": "البحث المجاني",
  "Paid Search": "البحث المدفوع",
  "Organic Social": "التواصل الاجتماعي المجاني",
  "Paid Social": "التواصل الاجتماعي المدفوع",
  "Direct": "الزيارات المباشرة",
  "Referral": "الإحالات",
  "Email": "البريد الإلكتروني",
  "Unassigned": "غير محدد المصدر",
  "Cross-network": "عبر الشبكات",
  "Paid Other": "مدفوع آخر",
  "Organic Shopping": "التسوق المجاني",
  "Paid Shopping": "التسوق المدفوع",
  "Organic Video": "الفيديو المجاني",
  "Paid Video": "الفيديو المدفوع",
  "Display": "الإعلانات المصوّرة",
  "Affiliates": "التسويق بالعمولة",
  "SMS": "الرسائل النصية",
  "Mobile Push Notifications": "إشعارات الجوال",
  "Audio": "الإعلانات الصوتية",
};

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function fmtPct(n: number): string {
  return n.toFixed(n < 10 ? 2 : 1).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

// A number the script counts up from zero. The final value is already the
// text, so the page reads correctly without script.
function countHtml(value: number, decimals = 0, suffix = ""): string {
  const text = decimals ? value.toFixed(decimals) : fmtInt(value);
  return `<span class="count" data-to="${value}"${decimals ? ` data-dec="${decimals}"` : ""}${suffix ? ` data-suf="${escapeHtml(suffix)}"` : ""}>${text}${escapeHtml(suffix)}</span>`;
}

function compactMoney(n: number): { value: number; dec: number; en: string; ar: string } {
  if (n >= 1_000_000) return { value: Math.round(n / 10_000) / 100, dec: 2, en: "M", ar: " مليون" };
  if (n >= 10_000) return { value: Math.round(n / 100) / 10, dec: 1, en: "K", ar: " ألف" };
  return { value: Math.round(n), dec: 0, en: "", ar: "" };
}

function ratioText(a: number, b: number): string {
  const r = a / b;
  return r >= 10 ? String(Math.round(r)) : r.toFixed(1).replace(/\.0$/, "");
}

function numbersSectionHtml(result: AuditResult): string {
  const m = result.ga4Metrics;
  if (!m) return "";
  const name = escapeHtml(result.businessName || hostOf(result.websiteUrl));
  const days = m.periodDays;

  // headline figures
  const purchases = m.funnel.find(s => s.event === "purchase")?.count ?? null;
  const kpis: string[] = [];
  const kpi = (valueEn: string, valueAr: string, labelEn: string, labelAr: string) =>
    `<div class="kpi"><dt>${bi(labelEn, labelAr)}</dt><dd>${biHtml(valueEn, valueAr)}</dd></div>`;
  if (m.sessions !== null) kpis.push(kpi(countHtml(m.sessions), countHtml(m.sessions), "Visits", "الزيارات"));
  if (purchases !== null) kpis.push(kpi(countHtml(purchases), countHtml(purchases), "Purchases", "عمليات الشراء"));
  else if (m.conversions !== null) kpis.push(kpi(countHtml(m.conversions), countHtml(m.conversions), "Conversions", "التحويلات"));
  if (m.conversionRate !== null) {
    const cr = countHtml(m.conversionRate, 2, "%");
    kpis.push(kpi(cr, cr, "Conversion rate", "معدل التحويل"));
  }
  if (m.revenue !== null) {
    const c = compactMoney(m.revenue);
    const cur = m.currency ? ` ${m.currency}` : "";
    kpis.push(kpi(countHtml(c.value, c.dec, c.en), countHtml(c.value, c.dec, c.ar), `Revenue${cur}`, `الإيرادات${cur}`));
  }

  // funnel: bar length is the 0.35 power of each step's share of the first,
  // so a 0.5% purchase step stays visible next to page views; the counts
  // beside each bar are exact.
  // A step bigger than the one before it (e.g. more shipping-info events
  // than checkouts started, when shoppers re-enter the form) would read as
  // "109% continue", so the funnel shows only steps that narrow.
  const steps: typeof m.funnel = [];
  for (const step of m.funnel) if (!steps.length || step.count <= steps[steps.length - 1].count) steps.push(step);
  let funnel = "";
  if (steps.length >= 2) {
    const first = steps[0].count;
    const rows = steps.map((step, i) => {
      const w = Math.max(6, Math.pow(step.count / first, 0.35) * 100);
      const [en, ar] = FUNNEL_LABEL[step.event];
      const prev = i > 0 ? steps[i - 1] : null;
      const rate = prev ? (step.count / prev.count) * 100 : null;
      const cont = rate !== null
        ? `<span class="f-cont">${bi(`${fmtPct(rate)}% continue`, `يواصل ${fmtPct(rate)}%`)}</span>`
        : "";
      return `
            <li class="f-row" style="--w:${w.toFixed(1)}%; --i:${i}">
              ${cont}
              <span class="f-main"><span class="f-label">${bi(en, ar)}</span><span class="f-track"><span class="f-fill"></span></span><span class="f-num">${countHtml(step.count)}</span></span>
            </li>`;
    }).join("");
    const views = steps.find(s => s.event === "view_item")?.count;
    let insight = "";
    if (views && purchases !== null) {
      const per = (purchases / views) * 1000;
      const perText = per < 10 ? per.toFixed(1).replace(/\.0$/, "") : String(Math.round(per));
      insight = `<p class="chart-insight">${biHtml(
        `For every 1,000 product views, ${name} makes about <b>${perText}</b> sales.`,
        `مقابل كل 1,000 مشاهدة منتج، يحقق ${name} نحو <b>${perText}</b> عملية بيع.`,
      )}</p>`;
    }
    funnel = `
        <div class="chart">
          <h3>${bi("Your conversion funnel", "مسار التحويل في متجرك")}</h3>
          <p class="chart-note">${bi(`How many times each step happened in the last ${days} days.`, `عدد مرات حدوث كل خطوة خلال آخر ${days} يومًا.`)}</p>
          <ol class="funnel">${rows}</ol>
          ${insight}
        </div>`;
  }

  // channels, best first, against the store average
  let channels = "";
  if (m.channels.length >= 2) {
    const sorted = [...m.channels].sort((a, b) => b.conversionRate - a.conversionRate);
    const avg = m.conversionRate;
    const max = Math.max(...sorted.map(c => c.conversionRate), avg ?? 0) || 1;
    const rows = sorted.map((c, i) => {
      const up = avg === null || c.conversionRate >= avg;
      return `
            <li class="c-row" style="--w:${((c.conversionRate / max) * 100).toFixed(1)}%; --i:${i}">
              <span class="c-name">${bi(c.name, CHANNEL_AR[c.name] ?? c.name)}</span>
              <span class="c-track">${avg !== null ? `<span class="c-avg" style="--x:${((avg / max) * 100).toFixed(1)}%"></span>` : ""}<span class="c-fill${up ? " is-up" : " is-down"}"></span></span>
              <span class="c-val">${countHtml(c.conversionRate, 2, "%")}</span>
            </li>`;
    }).join("");
    const below = avg !== null ? sorted.filter(c => c.conversionRate < avg).length : 0;
    const insight = avg !== null && below > 0
      ? `<p class="chart-insight">${biHtml(
          `<b>${below} of ${sorted.length}</b> traffic sources convert below your store's average conversion rate.`,
          `<b>${below} من ${sorted.length}</b> مصادر معدل تحويلها أقل من متوسط معدل التحويل في متجرك.`,
        )}</p>`
      : "";
    channels = `
        <div class="chart">
          <h3>${bi("Conversion rate by traffic source", "معدل التحويل حسب مصدر الزيارات")}</h3>
          <p class="chart-note">${avg !== null
            ? bi(`The white line is your store's average conversion rate, ${fmtPct(avg)}%.`, `الخط الأبيض هو متوسط معدل التحويل في متجرك: ${fmtPct(avg)}%.`)
            : bi("Conversion rate of each traffic source.", "معدل التحويل (Conversion Rate) لكل مصدر زيارات.")}</p>
          <ul class="channels">${rows}</ul>
          ${insight}
        </div>`;
  }

  // new vs returning
  let segments = "";
  const nw = m.segments.find(s => s.name === "new");
  const ret = m.segments.find(s => s.name === "returning");
  if (nw && ret) {
    const max = Math.max(nw.conversionRate, ret.conversionRate) || 1;
    const row = (s: typeof nw, en: string, ar: string) => `
            <li class="s-row" style="--w:${((s.conversionRate / max) * 100).toFixed(1)}%">
              <span class="s-name">${bi(en, ar)}${s.sessions !== null ? `<small>${bi(`${fmtInt(s.sessions)} visits`, `${fmtInt(s.sessions)} زيارة`)}</small>` : ""}</span>
              <span class="s-track"><span class="s-fill"></span></span>
              <span class="s-val">${countHtml(s.conversionRate, 2, "%")}</span>
            </li>`;
    let headline: string;
    if (nw.conversionRate > 0 && ret.conversionRate / nw.conversionRate >= 1.2) {
      const r = ratioText(ret.conversionRate, nw.conversionRate);
      headline = biHtml(`Returning visitors convert at <b>${r}×</b> the rate of new ones.`, `معدل تحويل الزوار العائدين أعلى بـ<b>${r}</b> مرة من الزوار الجدد.`);
    } else if (ret.conversionRate > 0 && nw.conversionRate / ret.conversionRate >= 1.2) {
      const r = ratioText(nw.conversionRate, ret.conversionRate);
      headline = biHtml(`New visitors convert at <b>${r}×</b> the rate of returning ones.`, `معدل تحويل الزوار الجدد أعلى بـ<b>${r}</b> مرة من الزوار العائدين.`);
    } else {
      headline = bi("New and returning visitors convert at about the same rate.", "معدل التحويل متقارب بين الزوار الجدد والعائدين.");
    }
    segments = `
        <div class="chart">
          <h3>${bi("Conversion rate: new vs returning visitors", "معدل التحويل: الزوار الجدد مقابل العائدين")}</h3>
          <p class="chart-insight chart-insight--lead">${headline}</p>
          <ul class="segments">${row(nw, "New visitors", "زوار جدد")}${row(ret, "Returning visitors", "زوار عائدون")}</ul>
        </div>`;
  }

  if (!kpis.length && !funnel && !channels && !segments) return "";
  return `
      <section class="doc-section numbers" id="numbers">
        <h2>${biHtml(`${name} in the last ${days} days`, `${name} خلال آخر ${days} يومًا`)}</h2>
        <p class="section-lead">${bi(
          "Pulled from your Google Analytics account during the audit.",
          "مأخوذة من حساب تحليلات جوجل الخاص بك أثناء التدقيق.",
        )}</p>
        ${kpis.length ? `<dl class="kpis">${kpis.join("")}</dl>` : ""}
        ${funnel}${channels}${segments}
      </section>`;
}

// Score ring for a category header: stroke offset is the share of checks
// that failed, so the drawn arc is the share that passed.
function ringSvg(percent: number, color: string): string {
  const off = (100 - percent).toFixed(1);
  return `<svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" class="ring-bg"/><circle cx="24" cy="24" r="20" class="ring-fg" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${off}" data-off="${off}" style="stroke:${color}"/></svg>`;
}

// All 50 checks at a glance: one stacked bar by result, then one square
// per check (in checklist order) that links to its row.
function checkMapHtml(result: AuditResult, counts: ReturnType<typeof resultCounts>): string {
  const segs: Array<[string, number, string, string]> = ([
    ["critical", counts.critical, "critical", "حرجة"],
    ["medium", counts.medium, "medium", "متوسطة"],
    ["low", counts.low, "low", "منخفضة"],
    ["pass", counts.passed, "passed", "ناجحة"],
  ] as Array<[string, number, string, string]>).filter(s => s[1] > 0);
  const bar = `<div class="sevbar" role="img" aria-label="${segs.map(s => `${s[1]} ${s[2]}`).join(", ")}">${segs.map(([k, n]) => `<span class="seg seg--${k}" style="flex-grow:${n}"></span>`).join("")}</div>`;
  const legend = `<ul class="sev-legend">${segs.map(([k, n, en, ar]) => `<li><span class="sev sev--${k}">${bi(`${n} ${en}`, `${n} ${ar}`)}</span></li>`).join("")}</ul>`;
  let idx = 0;
  const rows = result.categories.map(cat => {
    const byId = new Map(cat.findings.map(f => [f.checklistId, f]));
    const cells = checklistForDisplay(cat.category, cat.checklistTally.total, cat.findings.map(f => f.checklistId)).map(point => {
      const f = byId.get(point.id);
      const st = f?.status === "fail" ? f.severity : "pass";
      const en = f?.business.summary ?? point.title;
      const ar = f?.ar?.business.summary ?? en;
      return `<a class="cell cell--${st}" href="#${rowId(cat, point)}" data-en="${escapeHtml(en)}" data-ar="${escapeHtml(ar)}" title="${escapeHtml(en)}" aria-label="${escapeHtml(en)}" style="--i:${idx++}"></a>`;
    }).join("");
    const [shortEn, shortAr] = CATEGORY_SHORT[cat.category];
    return `<div class="cmap-row"><span class="cmap-label">${bi(shortEn, shortAr)}</span><div class="cmap-cells">${cells}</div></div>`;
  }).join("");
  return `
        <div class="checkmap">
          ${bar}
          ${legend}
          <div class="cmap">${rows}</div>
          <p class="chart-note">${bi("Each square is one check. Click or tap one to jump to it.", "كل مربع بند واحد. اضغط على أي مربع للانتقال إليه.")}</p>
        </div>`;
}

function gaugeHtml(score: number | null, en: string, ar: string): string {
  if (score === null) {
    return `<div class="gauge gauge--na"><svg viewBox="0 0 120 68" aria-hidden="true"><path d="M10 62 A50 50 0 0 1 110 62" class="g-bg" pathLength="100"/></svg><span class="g-num na">—</span><span class="g-cap">${bi(en, ar)}</span></div>`;
  }
  const c = speedColor(score);
  return `<div class="gauge"><svg viewBox="0 0 120 68" aria-hidden="true"><path d="M10 62 A50 50 0 0 1 110 62" class="g-bg" pathLength="100"/><path d="M10 62 A50 50 0 0 1 110 62" class="g-fg" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - score}" data-off="${100 - score}" style="stroke:${c}"/></svg><span class="g-num" style="color:${c}">${countHtml(score)}</span><span class="g-cap">${bi(en, ar)}</span></div>`;
}

// The guide: the Optimizers mark glides a curved path through the report,
// waits beside each section heading with a short label, and lands on the
// closing call to action. Labels ship here; the script block positions everything and keeps
// the whole thing hidden when motion is off.
function guideHtml(result: AuditResult, counts: ReturnType<typeof resultCounts>, has: { fixFirst: boolean; screens: boolean; numbers: boolean; speed: boolean; friction?: boolean }): string {
  const stops: Array<[string, string, string, "ok" | "bad"]> = [];
  stops.push(["overview", `${counts.passed}/${counts.total} passed`, `${counts.passed}/${counts.total} ناجح`, counts.critical > 0 ? "bad" : "ok"]);
  if (has.fixFirst) {
    const n = Math.min(3, counts.failed);
    const [gEn, gAr] = copyFor(result).guide;
    stops.push(["fix-first", `${n} ${gEn}`, `${n} ${gAr}`, "bad"]);
  }
  if (has.screens) stops.push(["screens", "Your store", "متجرك", "ok"]);
  if (has.numbers) {
    const cr = result.ga4Metrics?.conversionRate;
    stops.push(cr !== null && cr !== undefined
      ? ["numbers", `${fmtPct(cr)}% conversion`, `تحويل ${fmtPct(cr)}%`, "ok"]
      : ["numbers", "Your numbers", "أرقامك", "ok"]);
  }
  if (has.friction && result.fud) {
    const issues = result.fud.findings.filter(f => f.override?.to !== "hidden" && (f.status === "fail" || f.status === "warn")).length;
    stops.push(["friction", `${issues} to improve`, `${issues} للتحسين`, issues > 0 ? "bad" : "ok"]);
  }
  stops.push(["checks", `${counts.failed} need work`, `${counts.failed} تحتاج إصلاحًا`, counts.failed > 0 ? "bad" : "ok"]);
  for (const cat of result.categories) {
    const { passed, total } = cat.checklistTally;
    const [shortEn, shortAr] = CATEGORY_SHORT[cat.category];
    stops.push([`sec-${SECTION_SLUG[cat.category]}`, `${shortEn} ${passed}/${total}`, `${shortAr} ${passed}/${total}`, passed < total ? "bad" : "ok"]);
  }
  const mobile = result.pageSpeed?.average.mobile;
  if (has.speed) {
    stops.push(mobile !== null && mobile !== undefined
      ? ["speed", `Mobile ${mobile}/100`, `الموبايل ${mobile}/100`, mobile < 50 ? "bad" : "ok"]
      : ["speed", "Page speed", "سرعة الصفحات", "ok"]);
  }
  stops.push(["sources", "Sources", "المصادر", "ok"]);
  stops.push(["end", "Let's fix it", "لنصلحها معًا", "ok"]);
  return `
  <div class="guide" aria-hidden="true" hidden>
    <svg class="g-path" aria-hidden="true"><path class="gp-base"/><path class="gp-glow"/><path class="gp-fill"/><path class="gp-probe"/></svg>
    <div class="g-dots"></div>
    <div class="g-mark"><div class="g-body"><span class="g-icon"></span><svg class="g-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/></svg><span class="g-label"><span class="g-text"></span></span></div></div>
    <div class="g-stops">${stops.map(([id, en, ar, tone]) => `<span data-for="${id}" data-tone="${tone}" data-en="${escapeHtml(en)}" data-ar="${escapeHtml(ar)}"></span>`).join("")}</div>
  </div>`;
}

function styles(assets: BrandAssets): string {
  return `
${fontFace("Sora", 400, assets.sora400)}
${fontFace("Sora", 600, assets.sora600)}
${fontFace("Sora", 700, assets.sora700)}
${fontFace("Inter", 400, assets.inter400)}
${fontFace("Inter", 500, assets.inter500)}
${fontFace("Inter", 600, assets.inter600)}
${fontFace("Noto Sans Arabic", 400, assets.ar400)}
${fontFace("Noto Sans Arabic", 600, assets.ar600)}
${fontFace("Noto Sans Arabic", 700, assets.ar700)}

/* The Optimizers website palette, laid out as a document (PRODUCT.md: read like
   a document; the Stripe-docs reference): thin dividers on the dark page,
   cards only for the closing band. */
:root{
  color-scheme:dark;
  --bg:${PAGE}; --bg-soft:${PAGE_SOFT};
  --navy:${NAVY}; --navy-deep:${NAVY_DEEP};
  --ink:${INK}; --ink-2:${INK_2}; --ink-3:${INK_3};
  --line:${LINE}; --line-strong:${LINE_STRONG};
  --green:${GREEN_FILL}; --green-ink:${GREEN}; --green-tint:rgba(106,228,153,.12);
  --red-ink:${RED}; --red-tint:rgba(255,107,87,.12);
  --amber-ink:${AMBER}; --amber-tint:rgba(252,211,77,.12);
  --blue-ink:${BLUE}; --blue-tint:rgba(135,162,207,.12);
  --display:'Sora',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --body:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --arabic:'Noto Sans Arabic','Segoe UI',Tahoma,sans-serif;
  --ease:cubic-bezier(.22,1,.36,1);
  --card-border:rgba(106,228,153,.16); --card-border-hover:rgba(106,228,153,.34); --card-hover:#151a14;
  --z-sticky:20;
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth; scroll-padding-top:84px}
@media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto} *{transition:none !important} }
html,body{overflow-x:clip; max-width:100vw}
body{margin:0; background:var(--bg); color:var(--ink); font-family:var(--body); font-size:16px; line-height:1.65; -webkit-font-smoothing:antialiased}
a{color:inherit}
img{display:block; max-width:100%}
h1,h2,h3{margin:0; text-wrap:balance}
p{margin:0; text-wrap:pretty}
.wrap{width:min(1200px,calc(100% - 48px)); margin:0 auto}
:focus-visible{outline:2px solid var(--green-ink); outline-offset:3px; border-radius:4px}

/* ---- EN/AR toggle ----
   Two CSS-only radios placed before .topbar and <main> so their ~
   selectors reach the whole page. Every static string ships in both
   languages via bi()/biHtml(); every finding's text ships as explicit
   .i18n-en/.i18n-ar elements. English is selected by default. */
.i18n-ar{display:none}
#i18n-ar:checked ~ .topbar .i18n-en,
#i18n-ar:checked ~ main .i18n-en:not(.voice){display:none}
/* display:revert restores each element's own default (inline span, block
   p, inline-block input). :not([hidden]) keeps the filter script in charge
   of the "no checks match" message. */
#i18n-ar:checked ~ .topbar .i18n-ar,
#i18n-ar:checked ~ main .i18n-ar:not(.voice):not([hidden]){display:revert}
#i18n-ar:checked ~ .topbar,
#i18n-ar:checked ~ main{direction:rtl; font-family:var(--arabic)}
#i18n-ar:checked ~ main :is(h1,h2,h3,.btn,.speed-table td){font-family:var(--arabic)}
/* Which voice shows is decided per check by its .tech-toggle checkbox
   (unchecked = business, checked = technical); the language radio picks the
   copy. A passed check with no finding has no toggle, so its single text is
   matched by the :not(:has) rows. */
.voice{display:none}
#i18n-en:checked ~ main .tech-toggle:not(:checked) ~ * .voice-business.i18n-en,
#i18n-en:checked ~ main .tech-toggle:checked ~ * .voice-technical.i18n-en,
#i18n-ar:checked ~ main .tech-toggle:not(:checked) ~ * .voice-business.i18n-ar,
#i18n-ar:checked ~ main .tech-toggle:checked ~ * .voice-technical.i18n-ar,
#i18n-en:checked ~ main .check:not(:has(> .tech-toggle)) .voice-business.i18n-en,
#i18n-ar:checked ~ main .check:not(:has(> .tech-toggle)) .voice-business.i18n-ar{display:block}
/* Fixed, not absolute: focusing a radio through its label would otherwise
   scroll the page to wherever the input sits. */
.lang-radio{position:fixed; top:0; left:0; width:1px; height:1px; opacity:0; pointer-events:none}

/* ---- top bar (darkest) ---- */
.topbar{position:sticky; top:0; z-index:var(--z-sticky); background:var(--navy); color:#fff; border-bottom:1px solid var(--line)}
.topbar-inner{display:flex; align-items:center; gap:16px; height:60px}
.brand img{height:20px; width:auto}
.topbar-end{display:flex; align-items:center; gap:12px; margin-inline-start:auto}
.lang{display:inline-flex; gap:2px; padding:2px; border:1px solid var(--line-strong); border-radius:999px}
.lang label{cursor:pointer; user-select:none; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:500; line-height:1.4; color:var(--ink-3); transition:color .15s var(--ease), background .15s var(--ease)}
.lang label:hover{color:var(--ink-2)}
#i18n-en:checked ~ .topbar #lang-en,
#i18n-ar:checked ~ .topbar #lang-ar{color:var(--ink-2); background:rgba(255,255,255,.06)}

/* ---- buttons ---- */
.btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px 20px; border-radius:8px; font-family:var(--display); font-size:15px; font-weight:600; text-decoration:none; white-space:nowrap; transition:background .2s var(--ease), color .2s var(--ease)}
.btn--primary{background:var(--green); color:var(--navy)}
.btn--primary:hover{background:#82eaad}
.btn--sm{padding:8px 14px; font-size:14px}
.btn--lg{padding:15px 26px; font-size:16px}
.btn--link{padding:12px 4px; color:var(--green-ink)}
.btn--link:hover{color:var(--ink)}
.btn--link .arrow{transition:transform .2s var(--ease)}
.btn--link:hover .arrow{transform:translateX(3px)}
#i18n-ar:checked ~ main .arrow{transform:scaleX(-1)}
#i18n-ar:checked ~ main .btn--link:hover .arrow{transform:scaleX(-1) translateX(3px)}

/* phone section bar */
.jump{display:none}

/* ---- layout: contents + reading column ---- */
.layout{display:grid; grid-template-columns:200px minmax(0,1fr); gap:72px; padding-bottom:80px}
.content{max-width:780px; min-width:0}
.toc{position:sticky; top:92px; align-self:start; padding-top:56px}
.toc-title{font-size:13px; font-weight:600; color:var(--ink); margin-bottom:12px}
.toc ul{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:2px}
.toc a{display:flex; justify-content:space-between; gap:8px; padding:6px 10px; margin-inline-start:-10px; border-radius:6px; font-size:14px; color:var(--ink-2); text-decoration:none; transition:background .15s var(--ease), color .15s var(--ease)}
.toc a:hover{color:var(--ink); background:var(--bg-soft)}
.toc a[aria-current="true"]{color:var(--ink); font-weight:600; background:var(--bg-soft)}
.toc-n{font-variant-numeric:tabular-nums; color:var(--ink-3); font-weight:400}

/* ---- sections ---- */
.doc-section{padding-top:56px}
.doc-section + .doc-section{margin-top:56px; border-top:1px solid var(--line)}
.doc-section h2{font-family:var(--display); font-size:clamp(24px,2.6vw,30px); font-weight:700; line-height:1.2; letter-spacing:-.015em}
.section-lead{margin-top:10px; font-size:17px; color:var(--ink-2); max-width:64ch}

/* summary */
.crumbs{display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; font-size:14px; color:var(--ink-3)}
.crumbs span[aria-hidden]{color:var(--line-strong)}
.summary h1{margin-top:16px; font-family:var(--display); font-size:clamp(34px,4.6vw,52px); font-weight:700; line-height:1.08; letter-spacing:-.03em}
.hl{color:var(--c); white-space:nowrap}
.lead{margin-top:18px; font-size:clamp(18px,1.6vw,20px); line-height:1.55; color:var(--ink-2); max-width:58ch}
.callout{display:flex; gap:12px; align-items:flex-start; margin-top:28px; padding:14px 16px; border-radius:10px; border:1px solid transparent}
.callout svg{flex-shrink:0; margin-top:2px}
.callout p{font-weight:600}
.callout--critical{background:var(--red-tint); border-color:rgba(255,107,87,.3); color:var(--red-ink)}
.callout--critical p{color:#ffd3cc}
.facts{margin:32px 0 0; border-top:1px solid var(--line)}
.fact{display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid var(--line)}
.fact dt{color:var(--ink-2); font-size:15px}
.fact dd{margin:0; display:flex; align-items:center; gap:16px; font-size:15px; color:var(--ink-2)}
.fact dd a{display:inline-flex; align-items:center; gap:.3em; min-height:44px; text-decoration:none; white-space:nowrap}
.fact dd a:hover{color:var(--ink)}
.fact b{font-family:var(--display); font-size:18px; font-weight:700; font-variant-numeric:tabular-nums}
.bar{display:block; width:120px; height:6px; border-radius:999px; background:rgba(255,255,255,.08); overflow:hidden}
.bar > span{display:block; height:100%; border-radius:inherit}
.actions{display:flex; flex-wrap:wrap; align-items:center; gap:8px 20px; margin-top:32px}

/* screenshots */
.shots{display:flex; flex-wrap:wrap; align-items:flex-end; gap:24px; margin-top:28px}
.shot{margin:0; min-width:0}
.shot--desktop{flex:1 1 420px}
.shot--mobile{flex:0 0 188px}
.shot-frame{border-radius:12px; overflow:hidden; border:1px solid var(--line-strong); box-shadow:0 20px 48px -24px rgba(0,0,0,.6); background:var(--navy)}
.shot--mobile .shot-frame{border-radius:20px}
.shot img{width:100%; height:auto}
.shot-frame{position:relative}
.shot--desktop .shot-frame{aspect-ratio:1440 / 900}
.shot--mobile .shot-frame{aspect-ratio:390 / 844}
.shot-bar{position:absolute; top:6px; bottom:6px; right:4px; width:4px; border-radius:4px; background:rgba(255,255,255,.1); opacity:0; transition:opacity .4s var(--ease); pointer-events:none}
.shot-bar span{display:block; width:100%; height:30px; border-radius:inherit; background:rgba(106,228,153,.85); box-shadow:0 0 8px rgba(106,228,153,.6)}
.shot-frame.is-scrolling .shot-bar{opacity:1}
.shot figcaption{margin-top:10px; font-size:13px; color:var(--ink-3)}
.hero-shots{position:relative; margin:26px 0 30px}
.hero-shots .shots{margin-top:0}
.shots-note{margin:12px 0 0; font-size:13px; color:var(--ink-3)}

/* fix these first */
.fix-list{list-style:none; margin:28px 0 0; padding:0; counter-reset:fix; display:flex; flex-direction:column; gap:12px}
.fix-list li{counter-increment:fix}
.lane{margin-top:36px}
.lane-head{font-family:var(--display); font-size:19px; font-weight:700; color:var(--ink)}
.lane-lead{margin-top:6px; color:var(--ink-2); max-width:68ch}
.lane .fix-list{margin-top:16px}
.lane-empty{margin-top:12px; color:var(--ink-3)}
.lane-note{margin-top:20px; color:var(--ink-3); font-size:14px}
.rkpis{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:24px 0 0}
.rkpi{padding:16px 18px; border-radius:12px; background:var(--bg-soft); border:1px solid var(--card-border)}
.rkpi dt{color:var(--ink-3); font-size:13px; line-height:1.4}
.rkpi dd{margin:6px 0 0; font-family:var(--display); font-size:22px; font-weight:700; color:var(--ink); font-variant-numeric:tabular-nums}
.money-hero{margin-top:20px; font-family:var(--display); font-size:24px; font-weight:700; color:var(--ink); line-height:1.3}
.money-src{margin-top:8px; color:var(--ink-2); max-width:68ch}
.money-src .src{display:block; margin-top:4px; color:var(--ink-3); font-size:13px}
.fix-tag{display:inline-block; margin-inline-start:8px; padding:2px 8px; border-radius:999px; border:1px solid var(--card-border); color:var(--ink-2); font-size:12px}
.fix-tag--diy{border-color:rgba(49,218,114,.4); color:#7fe8a6}
.fix-tag--money{border-color:rgba(242,183,94,.4); color:#f5c97f}
.qa-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; margin-top:24px}
.qa{padding:18px 20px; border-radius:14px; background:var(--bg-soft); border:1px solid rgba(255,107,87,.28)}
.qa--ok{border-color:rgba(49,218,114,.28)}
.qa-q{font-family:var(--display); font-size:17px; font-weight:700; color:var(--ink); line-height:1.35}
.qa-verdict{margin-top:8px; color:var(--ink-2)}
.qa-verdict--ok{color:#c9f5d9}
.qa-money{display:block; margin-top:4px; color:#f5c97f; font-weight:600}
.qa-n{display:block; margin-top:4px; color:var(--ink-3); font-size:13px}
.qa-list{margin:10px 0 0; padding-inline-start:18px; display:flex; flex-direction:column; gap:6px}
.qa-list a{color:var(--ink); text-decoration:underline; text-decoration-color:rgba(255,255,255,.25); text-underline-offset:3px}
.qa-more{margin-top:8px; color:var(--ink-3); font-size:13px}
.fstrip{margin-top:24px}
.fstrip-head{color:var(--ink-3); font-size:13px}
.fs{list-style:none; margin:10px 0 0; padding:0; display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:10px}
.fs-step{padding:12px 14px; border-radius:12px; background:var(--bg-soft); border:1px solid var(--card-border); display:flex; flex-direction:column; gap:4px}
.fs-step--low{border-color:rgba(255,107,87,.45)}
.fs-name{color:var(--ink-3); font-size:13px}
.fs-step b{font-family:var(--display); font-size:20px; color:var(--ink)}
.fs-rate{font-size:13px; color:var(--ink-2)}
.fs-step--low .fs-rate{color:#ffb3a8}
.fs-rate i{font-style:normal; color:var(--ink-3)}
.handover{margin-top:36px; padding:18px 20px; border-radius:14px; border:1px dashed var(--card-border)}
/* Persona openings and sections (store owner, media buyer) */
.persona-hero h1{font-size:clamp(28px,4.6vw,44px); line-height:1.15}
.persona-hero .lead{max-width:62ch}
.hero-src{margin-top:10px; font-size:14px; color:var(--ink-3); max-width:68ch}
.hero-h2{margin-top:32px; font-family:var(--display); font-size:18px; font-weight:600; color:var(--ink)}
.plan-list{list-style:none; margin:14px 0 0; padding:0; counter-reset:plan}
.plan-item{counter-increment:plan; position:relative; padding-block:16px; padding-inline:40px 0; border-top:1px solid var(--line)}
.plan-item::before{content:counter(plan); position:absolute; inset-inline-start:0; top:16px; width:26px; height:26px; border-radius:50%; border:1px solid var(--line-strong); display:grid; place-items:center; font-size:13px; font-weight:600; color:var(--ink-2); font-variant-numeric:tabular-nums}
.plan-title{display:block; font-weight:600; color:var(--ink); text-decoration:none; line-height:1.45}
.plan-title:hover{text-decoration:underline; text-underline-offset:3px}
.plan-item .fix-meta{margin-top:8px}
.plan-who{margin-top:8px; font-size:13px; font-weight:600; color:var(--ink-3)}
.plan-step,.plan-done{margin-top:8px; font-size:15px; color:var(--ink-2); max-width:70ch}
.plan-step b,.plan-done b{color:var(--ink); font-weight:600}
.plan-group{margin-top:36px}
.scope{display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:28px; padding-top:20px; border-top:1px solid var(--line)}
.scope ul{margin:8px 0 0; padding-inline-start:18px; color:var(--ink-2); font-size:14px}
.scope li{margin-top:4px}
.scope-h{font-size:13px; font-weight:600; color:var(--ink)}
.score-line,.status-line{display:flex; flex-wrap:wrap; gap:6px 10px; margin-top:16px; font-size:14px; color:var(--ink-3)}
.score-line a{color:var(--ink-2)}
.status-line span[aria-hidden]{color:var(--line-strong)}
.q-cols{display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:8px}
.q-col .hero-h2{margin-top:28px}
.keep-list,.clarity-list,.method-list{margin:16px 0 0; padding:0; list-style:none}
.keep-list li,.clarity-list li,.method-list li{padding:12px 0; border-top:1px solid var(--line); color:var(--ink-2); max-width:72ch}
.keep-list a{color:var(--ink-2); text-decoration:none}
.keep-list a:hover{color:var(--ink); text-decoration:underline}
.keep-list li::before{content:"✓"; color:var(--green-ink); font-weight:700; margin-inline-end:10px}
.clarity-list .fix-tag{margin-inline-end:8px}
.clarity-list li.is-flag{color:var(--ink)}
.method-date{margin-top:14px; font-size:13px; color:var(--ink-3)}
@media (max-width:767px){
  .scope,.q-cols{grid-template-columns:1fr; gap:12px}
  .plan-item{padding-inline-start:36px}
}
@media print{
  .persona-hero .actions{display:none}
  .plan-item,.keep-list li,.clarity-list li,.method-list li{break-inside:avoid}
}
.ho-list{margin:12px 0 0; padding-inline-start:20px; display:flex; flex-direction:column; gap:10px; color:var(--ink)}
.ho-meta{display:block; margin-top:2px; color:var(--ink-3); font-size:13px}
.method{margin-top:36px}
.method-list{margin:10px 0 0; padding-inline-start:20px; display:flex; flex-direction:column; gap:6px; color:var(--ink-2); font-size:14px}
.crit{margin-top:10px; font-size:14px; color:var(--ink-2)}
.verdict{margin-top:24px; padding:14px 18px; border-radius:12px; border:1px solid rgba(255,107,87,.3); background:var(--red-tint); color:#ffd3cc; font-weight:600; max-width:76ch}
.verdict--ok{border-color:rgba(49,218,114,.3); background:rgba(49,218,114,.08); color:#c9f5d9}
.adfx{display:inline-block; margin-inline-start:8px; padding:2px 8px; border-radius:999px; font-size:12px; border:1px solid var(--card-border); color:var(--ink-2); white-space:nowrap}
.adfx--performance,.adfx--aov,.adfx--optimization{border-color:rgba(49,218,114,.4); color:#7fe8a6}
.adfx--cost,.adfx--inflated,.adfx--deflated{border-color:rgba(255,107,87,.4); color:#ffb3a8}
.team-list{list-style:none; margin:16px 0 0; padding:0; display:flex; flex-direction:column; gap:10px}
.team-list li{padding:14px 18px; border-radius:12px; background:var(--bg-soft); border:1px solid var(--card-border)}
.team-list b{color:var(--ink)}
.team-n{margin-inline-start:8px; color:var(--ink-3); font-size:13px}
.team-top{display:block; margin-top:4px; color:var(--ink-2); font-size:14px}
.fix-list a{display:grid; grid-template-columns:40px minmax(0,1fr); gap:4px 16px; padding:20px 24px; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border); text-decoration:none; transition:border-color .2s var(--ease), background .2s var(--ease)}
.fix-list a::before{content:counter(fix); grid-row:span 2; font-family:var(--display); font-size:22px; font-weight:700; line-height:1.25; color:var(--ink-3)}
.fix-list a:hover{border-color:var(--card-border-hover); background:var(--card-hover)}
.fix-meta{display:flex; align-items:center; gap:12px; font-size:13px; color:var(--ink-3)}
.fix-title{font-size:17px; font-weight:600; line-height:1.45; color:var(--ink)}

/* severity: dot + word */
.sev{display:inline-flex; align-items:center; gap:7px; font-size:13px; font-weight:600; white-space:nowrap}
.sev::before{content:""; width:8px; height:8px; border-radius:50%; background:currentColor; flex-shrink:0}
.sev--critical{color:var(--red-ink)}
.sev--medium{color:var(--amber-ink)}
.sev--low{color:var(--blue-ink)}
.sev--pass{color:var(--green-ink)}
.sev--pass::before{content:""; width:10px; height:6px; border-radius:0; background:none; border:solid currentColor; border-width:0 0 2px 2px; transform:rotate(-45deg) translate(1px,-1px)}

/* controls: text tabs, search, technical switch */
.controls{display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:16px 24px; margin-top:24px; border-bottom:1px solid var(--line)}
.chips{display:flex; flex-wrap:wrap; gap:4px 24px}
.chip{all:unset; cursor:pointer; padding:10px 0 12px; margin-bottom:-1px; font-size:15px; font-weight:500; color:var(--ink-2); border-bottom:2px solid transparent; transition:color .15s var(--ease), border-color .15s var(--ease)}
.chip:hover{color:var(--ink)}
.chip.is-active{color:var(--ink); font-weight:600; border-bottom-color:var(--green)}
.chip:focus-visible{outline:2px solid var(--green-ink); outline-offset:2px; border-radius:4px}
.chip-n{color:var(--ink-3); font-weight:400; font-variant-numeric:tabular-nums}
.controls-end{display:flex; flex-wrap:wrap; align-items:center; gap:16px; padding-bottom:10px}
.search{width:200px; max-width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--line-strong); background:var(--bg-soft); color:var(--ink); font:inherit; font-size:14px}
.search::placeholder{color:var(--ink-3)}
.search:focus{outline:none; border-color:rgba(106,228,153,.5); box-shadow:0 0 0 3px rgba(106,228,153,.12)}
.tech-all{all:unset; display:inline-flex; align-items:center; gap:8px; min-height:44px; cursor:pointer; font-size:14px; color:var(--ink-2)}
.tech-all[hidden]{display:none}
.tech-all:hover{color:var(--ink)}
.tech-all:focus-visible{outline:2px solid var(--green-ink); outline-offset:3px; border-radius:4px}
.filter-empty{margin-top:24px; color:var(--ink-2)}

/* category sections */
.category{scroll-margin-top:84px}
.checks-intro + .category{margin-top:8px; border-top:0}
.cat-head{display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:12px 24px}
.cat-score{display:flex; align-items:center; gap:12px; font-size:15px; color:var(--ink-2)}
.cat-score b{font-family:var(--display); font-size:22px; font-weight:700; font-variant-numeric:tabular-nums}
.check-group{margin-top:40px}
.check-group[hidden]{display:none}
.group-head{display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:8px 16px; padding-bottom:14px}
.check-list{display:flex; flex-direction:column; gap:12px}
.group-head h3{font-family:var(--display); font-size:18px; font-weight:600; letter-spacing:-.005em}
.group-head > span{font-size:14px; color:var(--ink-3)}

/* check rows: metadata column + finding */
.check{position:relative; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border); transition:border-color .2s var(--ease), background .2s var(--ease)}
.check:hover{border-color:var(--card-border-hover)}
.check[hidden]{display:none}
/* status colour on every row, not just the small tag: a stripe on the
   reading-start edge (flips for Arabic) plus a faint tint behind it */
.check{--status:transparent; --status-tint:transparent; box-shadow:inset 4px 0 0 var(--status); background:linear-gradient(90deg, var(--status-tint), transparent 45%) var(--bg-soft)}
#i18n-ar:checked ~ main .check{box-shadow:inset -4px 0 0 var(--status); background:linear-gradient(270deg, var(--status-tint), transparent 45%) var(--bg-soft)}
.check--critical{--status:var(--red-ink); --status-tint:var(--red-tint)}
.check--medium{--status:var(--amber-ink); --status-tint:var(--amber-tint)}
.check--low{--status:var(--blue-ink); --status-tint:var(--blue-tint)}
.check--pass{--status:var(--green-ink); --status-tint:rgba(106,228,153,.2); border-color:rgba(106,228,153,.38)}
.check--pass .sev--pass{font-weight:700}
.passed-block{margin-top:16px}
.passed-head{display:flex; align-items:center; gap:8px; padding:14px 0 12px; font-family:var(--body); font-size:15px; font-weight:700; color:var(--green-ink)}
.passed-head::before{content:""; width:11px; height:6px; border:solid currentColor; border-width:0 0 2.5px 2.5px; transform:rotate(-45deg) translate(1px,-2px)}
.check.is-target{background:var(--card-hover); border-color:var(--card-border-hover)}
.tech-toggle{position:absolute; top:0; left:0; width:1px; height:1px; opacity:0; pointer-events:none}
.check-main{display:grid; grid-template-columns:104px minmax(0,1fr); gap:20px; padding:20px 24px}
.check-side{padding-top:3px}
.check-head{all:unset; box-sizing:border-box; display:flex; gap:16px; align-items:flex-start; width:100%; cursor:pointer}
.check-head:focus-visible{outline:2px solid var(--green-ink); outline-offset:4px; border-radius:4px}
.check-titles{flex:1; min-width:0}
.check h3{font-family:var(--body); font-size:17px; font-weight:600; line-height:1.45; overflow-wrap:break-word; text-wrap:pretty}
.chevron{flex-shrink:0; display:flex; padding:3px; color:var(--ink-3); transition:transform .2s var(--ease), color .15s var(--ease)}
.check-head:hover .chevron{color:var(--ink)}
.check.is-collapsed .chevron{transform:rotate(-90deg)}
#i18n-ar:checked ~ main .check.is-collapsed .chevron{transform:rotate(90deg)}
.check-detail{margin-top:8px}
.check.is-collapsed .check-detail{display:none}
.check-detail p{font-size:16px; color:var(--ink-2); max-width:68ch; overflow-wrap:break-word}
.check-foot{display:flex; flex-wrap:wrap; align-items:center; gap:0 20px; margin-top:6px}
.tech-switch{display:inline-flex; align-items:center; gap:8px; min-height:44px; cursor:pointer; user-select:none; font-size:14px; color:var(--ink-2)}
.tech-switch:hover{color:var(--ink)}
.tech-box{width:16px; height:16px; border-radius:4px; border:1.5px solid rgba(255,255,255,.3); background:transparent; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; transition:background .15s var(--ease), border-color .15s var(--ease)}
.tech-toggle:checked ~ * .tech-box,
.tech-all[aria-pressed="true"] .tech-box{background:var(--green); border-color:var(--green)}
.tech-toggle:checked ~ * .tech-box::after,
.tech-all[aria-pressed="true"] .tech-box::after{content:""; width:4px; height:8px; border:solid var(--navy); border-width:0 2px 2px 0; transform:translateY(-1px) rotate(45deg)}
.tech-toggle:focus-visible ~ * .tech-switch{outline:2px solid var(--green-ink); outline-offset:3px; border-radius:4px}
.check-meta{display:none; align-items:center; gap:10px; font-size:13px; color:var(--ink-3)}
.tech-toggle:checked ~ * .check-meta{display:inline-flex}
.check-meta code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; color:var(--ink-2); background:var(--bg-soft); padding:2px 6px; border-radius:4px}


.fud-group{margin-top:32px}
.fud-tags{display:flex; flex-wrap:wrap; gap:6px 14px; margin-top:6px}
.fud .check-titles .fud-band{display:inline; margin-top:0}
.fud-group-tag{font-size:13px; font-weight:500; color:var(--ink-3)}
.fud-money{margin-top:28px; padding:22px 24px; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border)}
.fud-money h3{font-family:var(--display); font-size:18px; font-weight:600}
.fud-money-figure{margin-top:12px; font-family:var(--display); font-size:clamp(26px,3.4vw,34px); line-height:1.15; color:var(--green-ink)}
.fud-money-figure b{font-weight:700}
.fud-money-text{margin-top:6px; font-size:16px; color:var(--ink); max-width:68ch}
.fud-money .fud-note{margin-top:10px}
.fud-insights{list-style:none; margin:16px 0 0; padding:0; display:flex; flex-direction:column; gap:12px}
.fud-insight{display:grid; grid-template-columns:104px minmax(0,1fr); gap:4px 16px; font-size:16px; color:var(--ink-2); max-width:76ch}
.fud-insight-tag{font-size:13px; font-weight:700; padding-top:3px}
.fud-insight--good .fud-insight-tag{color:var(--green-ink)}
.fud-insight--bad .fud-insight-tag{color:var(--amber-ink)}
.fud-insight--neutral .fud-insight-tag{color:var(--ink-3)}
@media (max-width:767px){ .fud-insight{grid-template-columns:1fr} .fud-money{padding:18px} }
.fud .check-titles .fud-band{display:inline-block; margin-top:6px; font-size:13px; font-weight:600; color:var(--ink-3)}
.fud-band--quick_win{color:var(--green-ink) !important}
.fud-funnel{font-weight:600; color:var(--amber-ink) !important}
.fud-desktop{font-size:14px !important; color:var(--ink-3) !important}
.fud-rec{color:var(--ink) !important}
.opp{display:inline-block; font-size:12px; font-weight:700; letter-spacing:.02em; padding:2px 8px; border-radius:999px; border:1px solid currentColor; line-height:1.5}
.opp--revenue_loss{color:var(--red-ink)}
.opp--revenue_gain{color:var(--green-ink)}
.opp--risk{color:var(--amber-ink)}
.opp--benefit{color:var(--blue-ink)}
.check-tags{display:flex; flex-wrap:wrap; gap:8px; margin-top:6px}
.act{margin-top:16px; padding:16px 18px; border-radius:12px; background:var(--bg); border:1px solid var(--line-strong); max-width:72ch}
.act-step{margin:0; color:var(--ink) !important; font-size:16px}
.act-step b{font-weight:700}
.act-meta{display:grid; grid-template-columns:auto minmax(0,1fr); gap:6px 16px; margin:12px 0 0; font-size:14px}
.act-meta div{display:contents}
.act-meta dt{color:var(--ink-3); font-weight:600}
.act-meta dd{margin:0; color:var(--ink-2)}
.act-handoff{display:inline-block; margin-top:12px; font-size:14px; font-weight:600; color:var(--green-ink); text-decoration:none}
.act-handoff:hover{text-decoration:underline}
.act-protect{margin-top:12px; font-size:15px; color:var(--ink-2) !important}
.act-protect b{color:var(--green-ink); font-weight:700}
.followup{margin-top:24px; padding:22px; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border); border-inline-start:3px solid var(--amber-ink)}
.followup-kicker{margin:0; font-size:13px; font-weight:700; color:var(--amber-ink)}
.followup h3{margin:6px 0 0; font-size:20px}
.followup-lead{margin:10px 0 0; color:var(--ink-2); max-width:72ch}
.followup-why{margin-top:14px; padding:12px 14px; border-radius:10px; background:var(--bg); border:1px solid var(--line-strong); max-width:72ch}
.followup-gap{color:var(--amber-ink) !important}
.followup-body{display:grid; grid-template-columns:minmax(0,1fr) minmax(0,260px); gap:20px; margin-top:16px; align-items:start}
@media (max-width:767px){ .followup-body{grid-template-columns:1fr} }
.followup-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}
.followup-list a{display:flex; gap:12px; align-items:baseline; text-decoration:none; color:var(--ink); font-size:15px}
.followup-list a:hover span:last-child{text-decoration:underline}

.fud-rec b{font-weight:600}
.fud-copy{margin-top:14px; padding:14px 16px; border-radius:10px; background:var(--bg); border:1px solid var(--line-strong); max-width:68ch}
.fud-copy-label{display:block; font-size:13px; font-weight:600; color:var(--ink-3); margin-bottom:6px}
.fud-copy p{margin:0; color:var(--ink) !important; font-size:16px}
.fud-copy p + p{margin-top:6px; font-family:var(--arabic)}
.fud-crop{margin:16px 0 4px; max-width:300px}
.fud-crop img{display:block; width:100%; height:auto; max-height:380px; object-fit:cover; object-position:top; border-radius:12px; border:1px solid var(--line-strong)}
.fud-crop figcaption{margin-top:8px; font-size:13px; color:var(--ink-3)}
.fud-note{margin-top:20px; font-size:14px; color:var(--ink-3); max-width:68ch}
.fud .check-meta span + span{color:var(--ink-3)}


/* speed table */
.table-wrap{margin-top:24px; overflow-x:auto}
.speed-table{width:100%; border-collapse:collapse; font-size:15px}
.speed-table th,.speed-table td{padding:14px 0; text-align:start; border-bottom:1px solid var(--line)}
.speed-table thead th{font-size:13px; font-weight:600; color:var(--ink-3); border-bottom-color:var(--line-strong)}
.speed-table tbody th,.speed-table tfoot th{font-weight:600}
.speed-table td{width:110px; font-family:var(--display); font-size:20px; font-weight:700; font-variant-numeric:tabular-nums}
.speed-table tfoot th,.speed-table tfoot td{border-bottom:0; border-top:1px solid var(--line-strong)}
.speed-url{display:block; margin-top:2px; font-size:13px; font-weight:400; color:var(--ink-3); overflow-wrap:anywhere}
.na{color:var(--ink-3); font-weight:400}

/* sources */
.sources{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px 48px; margin-top:20px}
.sources h3{font-family:var(--body); font-size:15px; font-weight:600; margin-bottom:8px}
.source-list,.page-list{margin:0; padding-inline-start:20px; color:var(--ink-2); line-height:1.8}
.source-list li::marker{color:var(--green-ink)}
.page-list{font-size:14px}
.page-list li{overflow-wrap:anywhere}

/* closing band (card color) */
.cta-band{background:var(--bg-soft); color:#fff; padding:72px 0; border-top:1px solid var(--line)}
.cta-inner{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:28px 48px}
.cta-band h2{font-family:var(--display); font-size:clamp(28px,3.2vw,38px); font-weight:700; letter-spacing:-.02em}
.cta-band p{margin-top:12px; max-width:60ch; color:rgba(255,255,255,.78); font-size:17px}

/* footer */
.footer{background:var(--navy-deep); color:rgba(255,255,255,.72); padding:56px 0 28px}
.footer-grid{display:grid; grid-template-columns:1.4fr repeat(3,1fr); gap:32px; padding-bottom:32px}
.footer-col h3{font-family:var(--display); font-size:15px; font-weight:600; color:#fff; margin-bottom:14px}
.footer-col a,.footer-col p{display:block; margin:0 0 10px; font-size:14px; text-decoration:none; overflow-wrap:anywhere}
.footer-col a:hover{color:var(--green)}
.footer-logo img{height:20px; width:auto; margin-bottom:14px}
.footer-brand p{max-width:34ch}
.social{display:flex; gap:8px; margin-top:6px}
.social a{width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; margin:0; border-radius:8px; border:1px solid rgba(255,255,255,.14); font-size:13px; font-weight:700; color:#fff}
.social a:hover{border-color:var(--green); color:var(--green)}
.footer-bottom{display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; padding-top:20px; border-top:1px solid rgba(255,255,255,.1); font-size:13px}
.footer-bottom strong{color:#fff}
.footer-bottom a{text-decoration:none}
.footer-bottom a:hover{color:var(--green)}

/* ---- motion layer ----
   Borrowed from optimizers.agency: the case-studies light gate (two glowing
   bars splitting while a title wipes open from the center), the comparison
   table's conic comet beam, the strategy-session wave panel, the CTA glow
   pulse and the green-amber-coral hover border. GSAP drives the timelines
   (script block); everything here is either a loop or a hidden start state.
   Start states only apply under html.js-motion, which the head script sets
   when motion is allowed and drops after 3s if GSAP never started, so the
   report is always readable without script. */
@property --beam{syntax:'<angle>'; inherits:false; initial-value:0deg}

.scroll-progress{position:absolute; inset-inline:0; bottom:-1px; height:2px; pointer-events:none}
.scroll-progress span{display:block; height:100%; background:linear-gradient(90deg,#6ae499,#fde68a 55%,#ff6b57); transform:scaleX(0); transform-origin:left center}
#i18n-ar:checked ~ .topbar .scroll-progress span{transform-origin:right center; background:linear-gradient(270deg,#6ae499,#fde68a 55%,#ff6b57)}
.topbar{transition:background .3s var(--ease)}
.topbar.is-scrolled{background:rgba(5,9,5,.72); -webkit-backdrop-filter:blur(14px) saturate(140%); backdrop-filter:blur(14px) saturate(140%)}

.cursor-glow{position:fixed; top:0; left:0; width:560px; height:560px; margin:-280px 0 0 -280px; border-radius:50%; pointer-events:none; z-index:3; opacity:0; background:radial-gradient(circle, rgba(106,228,153,.075), rgba(106,228,153,0) 62%); mix-blend-mode:screen}
@media (hover:none), (pointer:coarse){ .cursor-glow{display:none} }
main{position:relative; z-index:2}

/* hero: green glows like the site's hero, plus the light gate */
.summary{position:relative; isolation:isolate}
.hero-fx{position:absolute; inset:-40px -120px -20px; z-index:-1; pointer-events:none}
.glow{position:absolute; border-radius:50%; filter:blur(70px)}
.glow--a{width:520px; height:360px; top:-40px; inset-inline-start:-80px; background:radial-gradient(closest-side, rgba(60,130,80,.6), rgba(26,58,39,.18) 60%, transparent)}
.glow--b{width:420px; height:320px; top:120px; inset-inline-end:-60px; background:radial-gradient(closest-side, rgba(106,228,153,.22), rgba(253,230,138,.06) 60%, transparent)}
.gate{position:absolute; top:70px; height:330px; left:50%; width:3px; margin-left:-1.5px; border-radius:3px; color:#ffffff; background:currentColor; opacity:0; box-shadow:0 0 12px currentColor, 0 0 30px currentColor, 0 0 64px currentColor}
.gate::after{content:""; position:absolute; left:50%; bottom:-14px; width:120px; height:10px; margin-left:-60px; border-radius:50%; background:currentColor; filter:blur(14px); opacity:.55; mix-blend-mode:screen}

/* comet beam (comparison table on the site): two tails, 12s a lap */
.beam{position:relative}
.beam::after{content:""; position:absolute; inset:0; border-radius:inherit; padding:1.5px; pointer-events:none; z-index:2;
  background:conic-gradient(from var(--beam), transparent 0deg, #ff8979 8deg, #fcd34d 22deg, #92ebb4 38deg, transparent 55deg, transparent 180deg, #ff8979 188deg, #fcd34d 202deg, #92ebb4 218deg, transparent 235deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude;
  animation:beam 12s linear infinite; animation-delay:var(--bd,0s)}
@keyframes beam{to{--beam:360deg}}
.fix-list li.beam{border-radius:14px}
.fix-list li.beam > a{border-color:transparent}

/* hover: spotlight under the cursor + the site's gradient border */
.check, .fix-list a{isolation:isolate}
.fix-list a{position:relative}
.check::before, .fix-list a::after{content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:-1; opacity:0; transition:opacity .3s var(--ease);
  background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(106,228,153,.09), transparent 45%)}
.check:hover::before, .fix-list a:hover::after{opacity:1}
.check::after{content:""; position:absolute; inset:-1px; border-radius:inherit; padding:1px; pointer-events:none; opacity:0; transition:opacity .35s var(--ease);
  background:linear-gradient(135deg,#6ae499,#fde68a 50%,#ff6b57);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude}
.check:hover::after{opacity:.7}
.check:hover{border-color:transparent}

/* critical dots breathe */
.sev--critical::before{animation:sev-pulse 2.2s var(--ease) infinite}
@keyframes sev-pulse{0%{box-shadow:0 0 0 0 rgba(255,107,87,.55)} 70%,100%{box-shadow:0 0 0 7px rgba(255,107,87,0)}}

/* glow pulse + shine on the main buttons (site CTA) */
.btn--primary.magnetic{animation:cta-pulse 2.5s ease-in-out infinite}
@keyframes cta-pulse{0%,100%{box-shadow:0 0 22px rgba(106,228,153,.28)} 50%{box-shadow:0 0 42px rgba(106,228,153,.5)}}
.btn--primary{position:relative; overflow:hidden}
.btn--primary::after{content:""; position:absolute; inset:0; background:linear-gradient(110deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%); transform:translateX(-120%); animation:shine 4.5s var(--ease) infinite 1.5s; pointer-events:none}
@keyframes shine{0%{transform:translateX(-120%)} 30%,100%{transform:translateX(120%)}}

/* screenshots float on a glow */
.shots{position:relative; perspective:1400px}
.shots-glow{position:absolute; inset:10% 5% -6%; border-radius:50%; background:radial-gradient(closest-side, rgba(106,228,153,.2), rgba(135,162,207,.08) 55%, transparent); filter:blur(40px); z-index:-1; pointer-events:none}
.shot{transform-origin:50% 100%}

/* toc: sliding pill + scroll rail */
.toc ul{position:relative; z-index:0}
.toc-pill{position:absolute; top:0; inset-inline-start:-10px; inset-inline-end:0; height:0; border-radius:6px; background:var(--bg-soft); border:1px solid var(--card-border); opacity:0; pointer-events:none; z-index:-1}
.js-motion .toc a[aria-current="true"]{background:transparent}
.toc-rail{position:absolute; top:56px; bottom:0; inset-inline-start:-24px; width:2px; border-radius:2px; background:var(--line)}
.toc-rail span{display:block; width:100%; height:100%; border-radius:inherit; background:linear-gradient(180deg,#6ae499,#fde68a 60%,#ff6b57); transform:scaleY(0); transform-origin:top center}

/* filter tabs: one underline that slides */
.chips{position:relative}
.chip-ink{position:absolute; left:0; bottom:-1px; height:2px; width:0; border-radius:2px; background:var(--green); box-shadow:0 0 12px rgba(106,228,153,.6); pointer-events:none; opacity:0}
.js-motion .chip.is-active{border-bottom-color:transparent}

/* closing card: wave panel (strategy session) under a dark vignette */
.cta-band{position:relative; background:transparent; overflow:hidden; border-top:0}
.cta-card{position:relative; border-radius:24px; overflow:hidden; border:1px solid rgba(255,255,255,.08); padding:56px; isolation:isolate}
.cta-wave{position:absolute; inset:0; z-index:-1;
  background:radial-gradient(120% 140% at 25% 50%, rgba(2,6,1,.9) 0%, rgba(2,6,1,.72) 50%, rgba(2,6,1,.25) 100%),
    linear-gradient(87.19deg, rgb(66,102,164), rgb(146,235,180) 25%, rgb(66,102,164) 50%, rgb(146,235,180) 75%, rgb(66,102,164));
  background-size:100% 100%, 400% 100%; animation:wave 8s ease-in-out infinite}
@keyframes wave{0%,100%{background-position:0 0, 0% 0} 50%{background-position:0 0, 100% 0}}
.cta-gate{position:absolute; inset:0; pointer-events:none; z-index:3}
.cta-gate .gate{top:14%; height:auto; bottom:14%}
.cta-inner{position:relative}

/* hidden start states (motion only) */
.js-motion :is(.crumbs, .lead, .summary .callout, .fact, .actions, .section-lead, .fix-list li, .group-head, .check, .passed-head, .cat-score, .speed-table tbody tr, .speed-table tfoot tr, .sources li, .sources h3, .shot figcaption, .cta-inner > div > p, .cta-inner > .btn, .footer-col, .controls){opacity:0}
.js-motion :is(.summary h1, .doc-section h2, .cta-band h2){clip-path:inset(-20% 50% -30% 50%)}
.js-motion .bar > span{transform:scaleX(0); transform-origin:left center}
#i18n-ar:checked ~ main .bar > span{transform-origin:right center}
.check-detail{overflow:hidden}

@media (max-width:1023px){ .toc-rail{display:none} .hero-fx{inset:-30px -16px -10px} .glow--a{width:340px; height:280px} .glow--b{width:260px; height:220px} }
@media (max-width:767px){ .hero-fx .gate{top:50px; height:220px} .cta-card{padding:32px 22px; border-radius:18px} }
@media (prefers-reduced-motion: reduce){ *,*::before,*::after{animation:none !important} .gate,.cursor-glow{display:none} }
@media print{ .hero-fx,.cursor-glow,.scroll-progress,.cta-gate,.toc-rail{display:none} .js-motion *{opacity:1 !important; clip-path:none !important} .js-motion .bar > span{transform:none !important} }

/* ---- personal layer: client colour, store numbers, charts, guide ---- */

/* the store's own colour (sampled from its screenshot by the script)
   underlines its name; green until then */
.client-name{background:linear-gradient(var(--client,#6ae499),var(--client,#6ae499)) 0 94%/0% 4px no-repeat; transition:background-size 1.3s var(--ease) 1.9s}
.has-client .client-name{background-size:100% 4px}
#i18n-ar:checked ~ main .client-name{background-position:100% 94%}
.has-client .shots-glow{background:radial-gradient(closest-side, color-mix(in srgb, var(--client) 30%, transparent), rgba(135,162,207,.08) 55%, transparent)}

/* store numbers */
.kpis{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:28px 0 0}
.kpi{display:flex; flex-direction:column-reverse; gap:4px; padding:18px 20px; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border)}
.kpi dt{font-size:14px; color:var(--ink-3)}
.kpi dd{margin:0; font-family:var(--display); font-size:clamp(24px,2.6vw,30px); font-weight:700; letter-spacing:-.02em; line-height:1.15; white-space:nowrap; font-variant-numeric:tabular-nums; color:var(--ink)}
.chart, .checkmap{margin-top:20px; padding:24px; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border)}
.checkmap{margin-top:28px}
.chart h3{font-family:var(--display); font-size:18px; font-weight:600; letter-spacing:-.005em}
.chart-note{margin-top:6px; font-size:14px; color:var(--ink-3)}
.chart-insight{margin-top:18px; font-size:16px; color:var(--ink-2)}
.chart-insight b{font-family:var(--display); color:var(--green-ink)}
.chart-insight--lead{margin-top:8px; font-size:17px; color:var(--ink)}

.funnel, .channels, .segments{list-style:none; margin:20px 0 0; padding:0; display:flex; flex-direction:column}
.funnel{gap:4px}
.channels, .segments{gap:12px}
.f-main, .c-row, .s-row{display:grid; grid-template-columns:160px minmax(0,1fr) 84px; grid-template-areas:"name track val"; align-items:center; gap:6px 16px}
.f-label, .c-name, .s-name{grid-area:name; font-size:14px; color:var(--ink-2)}
.f-track, .c-track, .s-track{grid-area:track}
.f-num, .c-val, .s-val{grid-area:val; font-family:var(--display); font-weight:700; text-align:end; font-variant-numeric:tabular-nums; color:var(--ink)}
.f-cont{display:block; margin:2px 0 4px; padding-inline-start:176px; font-size:12px; color:var(--ink-3)}
.f-cont::before{content:"↓ "; color:var(--green-ink); font-weight:700}
.f-track{height:28px; border-radius:7px; background:rgba(255,255,255,.04); overflow:hidden}
.f-fill{display:block; height:100%; width:var(--w); border-radius:7px; background:linear-gradient(90deg,#31da72,#6ae499 70%,#92ebb4); box-shadow:0 0 18px rgba(106,228,153,.25); transform-origin:left center}
.f-row:last-child .f-fill{background:linear-gradient(90deg,#f2b75e,#fcd34d 60%,#fde68a); box-shadow:0 0 18px rgba(252,211,77,.35)}
.c-track{position:relative; height:14px; border-radius:999px; background:rgba(255,255,255,.04)}
.c-fill{position:absolute; top:0; bottom:0; inset-inline-start:0; width:var(--w); border-radius:inherit; transform-origin:left center}
.c-fill.is-up{background:linear-gradient(90deg,#31da72,#6ae499)}
.c-fill.is-down{background:linear-gradient(90deg,#ff6b57,#ff8979)}
.c-avg{position:absolute; top:-6px; bottom:-6px; inset-inline-start:var(--x); width:2px; margin-inline-start:-1px; border-radius:2px; background:rgba(255,255,255,.6); z-index:1; transform-origin:center}
.s-name{display:flex; flex-direction:column; color:var(--ink)}
.s-name small{font-size:12px; color:var(--ink-3)}
.s-track{height:24px; border-radius:8px; background:rgba(255,255,255,.04); overflow:hidden}
.s-fill{display:block; height:100%; width:var(--w); border-radius:inherit; background:linear-gradient(90deg,#87a2cf,#6ae499); transform-origin:left center}
#i18n-ar:checked ~ main :is(.f-fill,.c-fill,.s-fill,.seg){transform-origin:right center}

/* 50-check map */
.sevbar{display:flex; gap:3px; height:14px; border-radius:999px; overflow:hidden}
.seg{display:block; min-width:6px; transform-origin:left center}
.seg--critical{background:var(--red-ink)}
.seg--medium{background:var(--amber-ink)}
.seg--low{background:var(--blue-ink)}
.seg--pass{background:var(--green-ink)}
.sev-legend{list-style:none; margin:14px 0 0; padding:0; display:flex; flex-wrap:wrap; gap:8px 20px}
.cmap{margin-top:20px; display:flex; flex-direction:column; gap:12px}
.cmap-row{display:grid; grid-template-columns:72px minmax(0,1fr); align-items:center; gap:12px}
.cmap-label{font-size:13px; font-weight:600; color:var(--ink-3)}
.cmap-cells{display:flex; flex-wrap:wrap; gap:6px}
.cell{position:relative; display:block; width:24px; height:24px; border-radius:6px; transition:transform .2s var(--ease), box-shadow .2s var(--ease)}
.cell--pass{background:rgba(106,228,153,.2); box-shadow:inset 0 0 0 1px rgba(106,228,153,.45)}
.cell--critical{background:var(--red-ink); box-shadow:0 0 12px rgba(255,107,87,.55)}
.cell--medium{background:var(--amber-ink)}
.cell--low{background:var(--blue-ink)}
.cell:hover, .cell:focus-visible{transform:scale(1.3); z-index:1}
.checkmap .chart-note{margin-top:14px}

/* category score ring */
.cat-score .ring{width:46px; height:46px; transform:rotate(-90deg); flex-shrink:0}
.ring-bg, .ring-fg{fill:none; stroke-width:5}
.ring-bg{stroke:rgba(255,255,255,.08)}
.ring-fg{stroke-linecap:round}

/* page speed gauges */
.speed-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:12px; margin-top:24px}
.speed-card{min-width:0; padding:20px; border-radius:14px; background:var(--bg-soft); border:1px solid var(--card-border)}
.speed-card--avg{border-color:rgba(106,228,153,.4); background:linear-gradient(180deg, rgba(106,228,153,.08), var(--bg-soft))}
.speed-card h3{font-family:var(--display); font-size:16px; font-weight:600}
.gauges{display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px}
.gauge{display:flex; flex-direction:column; align-items:center; min-width:0}
.gauge svg{width:100%; max-width:130px; overflow:visible}
.g-bg, .g-fg{fill:none; stroke-width:9; stroke-linecap:round}
.g-bg{stroke:rgba(255,255,255,.08)}
.g-num{margin-top:-30px; font-family:var(--display); font-size:24px; font-weight:700; line-height:1; font-variant-numeric:tabular-nums}
.g-cap{margin-top:8px; font-size:12px; color:var(--ink-3)}

/* the guide: Optimizers mark on a line down the report */
body{position:relative}
.guide{position:absolute; top:0; left:0; width:0; height:0; pointer-events:none}
.guide[hidden]{display:none}
.g-stops{display:none}
.g-path{position:absolute; top:0; left:0; z-index:1; overflow:visible}
.gp-base, .gp-glow, .gp-fill, .gp-probe{fill:none; stroke-linecap:round; stroke-linejoin:round}
.gp-base{stroke:rgba(255,255,255,.13); stroke-width:1.5; stroke-dasharray:2 8}
.gp-glow{stroke:rgba(106,228,153,.16); stroke-width:9}
.gp-fill{stroke:#6ae499; stroke-width:2}
.gp-probe{stroke:none; visibility:hidden}
.g-dots{position:absolute; top:0; left:0; z-index:3}
.g-dot{position:absolute; top:0; left:0; width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%; background:var(--bg); border:2px solid rgba(255,255,255,.25); transition:border-color .3s, background .3s, box-shadow .3s}
.g-dot.is-done.g-dot--ok{border-color:#6ae499; background:#6ae499; box-shadow:0 0 10px rgba(106,228,153,.7)}
.g-dot.is-done.g-dot--bad{border-color:#ff6b57; background:#ff6b57; box-shadow:0 0 10px rgba(255,107,87,.7)}
.g-mark{position:absolute; top:0; left:0; width:0; height:0; z-index:1}
.g-mark.is-landed{z-index:15}
.g-body{position:absolute; left:-19px; top:-19px; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 35% 30%, #1a2a1c, #050905 70%); border:1.5px solid rgba(106,228,153,.7); box-shadow:0 0 0 4px rgba(106,228,153,.08), 0 0 24px rgba(106,228,153,.45); transition:background .35s, border-color .3s, box-shadow .3s}
.g-icon{width:20px; height:20px; background:#6ae499; -webkit-mask:url(${assets.icon}) center/contain no-repeat; mask:url(${assets.icon}) center/contain no-repeat; transition:background .3s, opacity .3s}
.g-check{position:absolute; width:20px; height:20px; fill:none; stroke:#020601; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:1; stroke-dashoffset:1; opacity:0}
.g-mark.is-alert .g-body{border-color:rgba(255,107,87,.85); box-shadow:0 0 0 4px rgba(255,107,87,.1), 0 0 26px rgba(255,107,87,.55)}
.g-mark.is-alert .g-icon{background:#ff8979}
.g-body{transition:background .35s, border-color .3s, box-shadow .3s, opacity .35s}
.g-mark.is-landed .g-body{background:#6ae499; border-color:#6ae499; box-shadow:0 0 0 6px rgba(106,228,153,.18), 0 0 36px rgba(106,228,153,.8)}
.g-mark.is-landed .g-icon{opacity:0}
.g-mark.is-landed .g-check{opacity:1}
.g-label{position:absolute; top:4px; left:49px; white-space:nowrap; padding:6px 11px; border-radius:999px; font-size:12px; font-weight:600; line-height:1.2; color:var(--ink); background:rgba(15,18,14,.94); border:1px solid var(--card-border); opacity:0; transform:translateX(-6px); transition:opacity .35s var(--ease), transform .35s var(--ease)}
.g-label.is-on{opacity:1; transform:none}
.g-label.is-flip{left:auto; right:49px; transform:translateX(6px)}
.g-label.is-flip.is-on{transform:none}
.g-label.is-above, .g-label.is-above.is-flip{top:-34px; left:50%; right:auto; transform:translate(-50%, 6px)}
.g-label.is-above.is-on{transform:translate(-50%, 0)}
.g-mark.is-alert .g-label{border-color:rgba(255,107,87,.45)}
#i18n-ar:checked ~ .guide .g-text{font-family:var(--arabic)}
.guide.is-compact .g-path, .guide.is-compact .g-dots, .guide.is-compact .g-label{display:none}
.guide.is-compact .g-mark{position:fixed; top:60px; z-index:25}
.guide.is-compact .g-body{width:22px; height:22px; left:-11px; top:-11px; box-shadow:0 0 14px rgba(106,228,153,.55)}
.guide.is-compact .g-icon{width:12px; height:12px}
.guide.is-compact .g-check{width:13px; height:13px}
.cta-band .btn--lg.is-landed{animation:land-ring 1.4s var(--ease) 3}
@keyframes land-ring{0%{box-shadow:0 0 0 0 rgba(106,228,153,.65)} 100%{box-shadow:0 0 0 24px rgba(106,228,153,0)}}

/* glass cards: the guide's green trail shows through, softened; the mark
   itself fades out before it slides under one (script: .is-under) */
.check, .chart, .checkmap, .fix-list a, .kpi, .speed-card:not(.speed-card--avg){background:rgba(18,24,17,.5); -webkit-backdrop-filter:blur(10px) saturate(150%); backdrop-filter:blur(10px) saturate(150%)}
.speed-card--avg{-webkit-backdrop-filter:blur(10px) saturate(150%); backdrop-filter:blur(10px) saturate(150%)}
.g-body{transition:background .35s, border-color .3s, box-shadow .3s, opacity .25s var(--ease)}
.g-mark.is-under .g-body{opacity:0}

/* hidden start states for the new pieces (motion only) */
.js-motion :is(.kpi, .chart, .checkmap, .speed-card){opacity:0}
.js-motion :is(.f-fill, .c-fill, .s-fill, .seg){transform:scaleX(0)}
.js-motion .cell{opacity:0}
/* Set by revealFallbackScript when a scroll-triggered reveal never fires
   (embedded viewers that don't scroll the document). */
.force-in{opacity:1 !important; clip-path:none !important; transform:none !important}
/* Where an in-page link landed: a faint green wash and ring, then gone. */
.nav-flash{position:absolute; z-index:60; pointer-events:none; border-radius:16px; background:rgba(106,228,153,.14); box-shadow:0 0 0 2px rgba(106,228,153,.75), 0 0 36px 6px rgba(106,228,153,.28); opacity:0; animation:nav-flash 1.8s cubic-bezier(.16,1,.3,1) forwards}
@keyframes nav-flash{0%{opacity:0; transform:scale(.985)} 12%{opacity:1; transform:scale(1)} 30%{opacity:.55} 45%{opacity:1} 100%{opacity:0}}
@media (prefers-reduced-motion: reduce){ .nav-flash{animation:none; opacity:1; transition:opacity 1.6s} }

@media (max-width:767px){
  .f-main, .c-row, .s-row{grid-template-columns:minmax(0,1fr) auto; grid-template-areas:"name val" "track track"}
  .f-cont{padding-inline-start:0}
  .cmap-row{grid-template-columns:1fr; gap:8px}
  .chart, .checkmap{padding:18px}
  .cell{width:26px; height:26px}
}
@media print{ .guide{display:none} .js-motion :is(.f-fill,.c-fill,.s-fill,.seg){transform:none !important} }

/* ---- responsive ---- */
@media (max-width:1023px){
  .layout{grid-template-columns:1fr; gap:0}
  .toc{display:none}
  html{scroll-padding-top:124px}
  .jump{display:flex; gap:8px; position:sticky; top:60px; z-index:var(--z-sticky); overflow-x:auto; scrollbar-width:none; padding:10px 24px; background:var(--navy); border-bottom:1px solid var(--line)}
  .jump::-webkit-scrollbar{display:none}
  .jump a{flex:0 0 auto; display:inline-flex; align-items:center; min-height:40px; padding:0 14px; border-radius:999px; border:1px solid var(--card-border); font-size:14px; color:var(--ink-2); text-decoration:none}
  .jump a[aria-current="true"]{color:var(--ink); border-color:var(--green); background:var(--green-tint)}
  .content{max-width:none}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:767px){
  .wrap{width:calc(100% - 32px)}
  .jump{padding:10px 16px}
  .doc-section{padding-top:40px}
  .doc-section + .doc-section{margin-top:40px}
  .fact{grid-template-columns:1fr; gap:6px}
  .bar{width:100%; max-width:none; flex:1}
  .shot--mobile{flex:1 1 160px; max-width:200px}
  .check-main{grid-template-columns:1fr; gap:8px; padding:16px 18px}
  .fix-list a{padding:16px 18px; grid-template-columns:28px minmax(0,1fr); gap:4px 12px}
  .check-side{padding-top:0}
  .controls{align-items:stretch}
  .controls-end{width:100%}
  .search{flex:1}
  .cta-band{padding:56px 0}
  .cta-band .btn{width:100%}
  .footer-grid{grid-template-columns:1fr}
  /* RTL: content pushed past the left edge can't be scrolled to, so on phones
     the nav chips wrap instead of scrolling and the tags/chips wrap their text. */
  .jump{flex-wrap:wrap; overflow:visible}
  .fix-list a{grid-template-columns:minmax(0,1fr)}
  .fix-meta{flex-wrap:wrap; row-gap:6px}
  .fix-list a > *{min-width:0; overflow-wrap:anywhere}
  .fix-tag, .adfx{white-space:normal; max-width:100%; overflow-wrap:anywhere}
  .shot, .shot-frame{max-width:100%; min-width:0}
}

@media print{
  .topbar,.toc,.controls,.chevron{display:none}
  .layout{grid-template-columns:1fr}
  .check.is-collapsed .check-detail{display:block}
  .cta-band,.footer{-webkit-print-color-adjust:exact; print-color-adjust:exact}
}
`;
}

/* Fallback for the scroll-triggered reveals. GSAP's ScrollTrigger only fires on
   document scroll, so in an embed that doesn't scroll the page (the Claude
   artifact viewer), elements stay at opacity 0. Any hidden element that is in
   view and still hidden 2.5s later gets .force-in. Normal reveals finish well
   before that, so they are unaffected. */
const revealFallbackScript = `(function(){
  if (!("IntersectionObserver" in window)) return;
  var sel = ".fix-list li, .lane-lead, .lead, .section-lead, .actions, .fact, .check, .group-head, .passed-head, .cat-score, .kpi, .chart, .checkmap, .speed-card, .cell, .sources li, .sources h3, .speed-table tbody tr, .speed-table tfoot tr, .shot figcaption, .footer-col";
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      setTimeout(function(){
        if (parseFloat(getComputedStyle(el).opacity) < 0.5) el.classList.add("force-in");
      }, 2500);
    });
  });
  document.querySelectorAll(sel).forEach(function(el){ io.observe(el); });
})();`;

function scriptBlock(): string {
  return `
(function(){
  "use strict";

  function openRow(target){
    var fold = target.closest(".passed-fold");
    if (fold) fold.open = true;
    target.hidden = false;
    var group = target.closest(".check-group");
    if (group) group.hidden = false;
    target.classList.remove("is-collapsed");
    var head = target.querySelector(".check-head");
    if (head) head.setAttribute("aria-expanded", "true");
  }

  // Row expand/collapse, and in-page links to a check (hero map squares,
  // "Fix these first" cards) that also open a folded or filtered-out row.
  document.addEventListener("click", function(e){
    var head = e.target.closest(".check-head");
    if (head) {
      var row = head.closest(".check");
      var willOpen = row.classList.contains("is-collapsed");
      head.setAttribute("aria-expanded", String(willOpen));
      if (window.__animateRow) window.__animateRow(row, willOpen);
      else row.classList.toggle("is-collapsed", !willOpen);
      return;
    }
    var link = e.target.closest('a[href^="#"]');
    if (link && link.getAttribute("href").length > 1) {
      var target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      goTo(target, true);
    }
  });

  // Every in-page link lands the same way: the destination (and whatever
  // the motion script still has hidden inside it) is shown at the click,
  // not when its scroll reveal would fire, then it flashes green once the
  // scroll stops so the eye finds it.
  var REVEAL = ".crumbs, .lead, .callout, .fact, .actions, .section-lead, .fix-list li, .group-head, .check, .passed-head, .cat-score, .speed-table tbody tr, .speed-table tfoot tr, .sources li, .sources h3, .shot figcaption, .shots-note, .shot, .footer-col, .controls, .kpi, .chart, .checkmap, .speed-card, .cell, .sev-legend li, .f-cont, .c-avg, h1, h2, .bar > span, .f-fill, .c-fill, .s-fill, .seg";
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function show(el){
    if (window.gsap) window.gsap.killTweensOf(el);
    el.classList.add("force-in");
  }
  function reveal(el){
    var list = [el].concat(Array.prototype.slice.call(el.querySelectorAll(REVEAL)));
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (p.matches && p.matches(REVEAL)) list.push(p);
    }
    list.forEach(function(x){ if (x === el ? el.matches(REVEAL) : true) show(x); });
  }
  function revealInView(){
    var vh = innerHeight;
    document.querySelectorAll(REVEAL).forEach(function(x){
      var r = x.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && r.height > 0 && parseFloat(getComputedStyle(x).opacity) < 0.99) show(x);
    });
  }
  // A tall section flashes its heading, not the whole page of content.
  function flashBox(el){
    if (el.getBoundingClientRect().height <= innerHeight * .7) return el;
    var head = el.querySelector(":scope > h2, :scope > h1, :scope > .group-head, h2");
    return head || el;
  }
  function flash(el){
    var box = flashBox(el);
    var r = box.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var f = document.createElement("div");
    f.className = "nav-flash";
    f.setAttribute("aria-hidden", "true");
    var pad = 10;
    f.style.left = (r.left + scrollX - pad) + "px";
    f.style.top = (r.top + scrollY - pad) + "px";
    f.style.width = (r.width + pad * 2) + "px";
    f.style.height = (r.height + pad * 2) + "px";
    document.body.appendChild(f);
    setTimeout(function(){ if (f.parentNode) f.parentNode.removeChild(f); }, 1900);
  }
  // Resolves when the page stops moving (scrollend where supported, else a
  // few still frames), with a cap so a stalled scroll still flashes.
  function whenStill(done){
    var finished = false, lastY = scrollY, still = 0, started = Date.now();
    function end(){ if (finished) return; finished = true; window.removeEventListener("scrollend", end); done(); }
    window.addEventListener("scrollend", end, { once: true });
    (function tick(){
      if (finished) return;
      if (Math.abs(scrollY - lastY) < 1) still++; else { still = 0; lastY = scrollY; }
      if (still > 8 || Date.now() - started > 1800) return end();
      requestAnimationFrame(tick);
    })();
  }
  var navSeq = 0;
  function goTo(target, smooth){
    var seq = ++navSeq;
    if (target.classList.contains("check")) openRow(target);
    reveal(target);
    var isRow = target.classList.contains("check") || target.closest(".plan-list, .keep-list");
    target.scrollIntoView({ behavior: smooth && !reduced ? "smooth" : "auto", block: isRow ? "center" : "start" });
    if (target.classList.contains("check")) {
      target.classList.add("is-target");
      setTimeout(function(){ target.classList.remove("is-target"); }, 2000);
    }
    history.replaceState(null, "", "#" + target.id);
    whenStill(function(){
      if (seq !== navSeq) return;
      revealInView();
      flash(target);
    });
  }
  window.__goTo = goTo;
  if (location.hash.length > 1) {
    var initial = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (initial) setTimeout(function(){ goTo(initial, false); }, 60);
  }

  // "Technical details for every check" flips every per-check toggle.
  var techAll = document.getElementById("tech-all");
  if (techAll) {
    techAll.hidden = false;
    techAll.addEventListener("click", function(){
      var on = techAll.getAttribute("aria-pressed") !== "true";
      techAll.setAttribute("aria-pressed", String(on));
      document.querySelectorAll(".tech-toggle").forEach(function(box){ box.checked = on; });
    });
  }

  // One filter for the whole report: severity chips + search, matched on
  // each row's data-status and text. "fail" means any failed severity.
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var searches = Array.prototype.slice.call(document.querySelectorAll(".search"));
  var groups = Array.prototype.slice.call(document.querySelectorAll(".check-group"));
  var empty = document.querySelector(".filter-empty");
  var filter = "all";
  function apply(){
    var q = (searches.map(function(el){ return (el.value || "").trim(); }).filter(Boolean)[0] || "").toLowerCase();
    var shown = 0;
    groups.forEach(function(group){
      var groupShown = 0;
      group.querySelectorAll(".check[data-status]").forEach(function(row){
        var status = row.getAttribute("data-status");
        var statusOk = filter === "all" || status === filter || (filter === "fail" && status !== "pass");
        var show = statusOk && (!q || row.textContent.toLowerCase().indexOf(q) !== -1);
        row.hidden = !show;
        if (show) groupShown++;
      });
      group.hidden = groupShown === 0;
      if (filter === "pass" || q) group.querySelectorAll(".passed-fold").forEach(function(d){ d.open = true; });
      shown += groupShown;
    });
    if (empty) empty.hidden = shown !== 0;
  }
  chips.forEach(function(chip){
    chip.addEventListener("click", function(){
      filter = chip.getAttribute("data-filter");
      chips.forEach(function(c){
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });
  searches.forEach(function(el){ el.addEventListener("input", apply); });

  // Highlight the section in view in the top nav.
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
  if ("IntersectionObserver" in window && spyLinks.length) {
    var byId = {};
    spyLinks.forEach(function(a){ byId[a.getAttribute("data-spy")] = true; });
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function(a){
          if (a.getAttribute("data-spy") === entry.target.id) {
            a.setAttribute("aria-current", "true");
            if (a.closest(".jump")) a.scrollIntoView({ block: "nearest", inline: "nearest" });
          } else {
            a.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach(function(id){
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  var topbar = document.querySelector(".topbar");
  if (topbar) {
    var onScroll = function(){ topbar.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();

// ---- motion (GSAP + ScrollTrigger, inlined above) ----
// Choreography borrowed from optimizers.agency: a light gate opens the
// summary the way it opens Case Studies, the closing card re-runs it, and
// everything else rises with the site's (0.16,1,0.3,1) ease (expo.out).
// The head script set html.js-motion only when motion is allowed; if
// anything here throws, every start state is dropped and the page shows as
// a plain document.
(function(){
  "use strict";
  var root = document.documentElement;
  if (!root.classList.contains("js-motion")) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (!gsap || !ST) { root.classList.remove("js-motion"); return; }
  window.__motion = true;
  gsap.registerPlugin(ST);

  var EASE = "expo.out";
  var HIDDEN = ".shots-note, .shot, .crumbs, .lead, .summary .callout, .fact, .actions, .section-lead, .fix-list li, .group-head, .check, .passed-head, .cat-score, .speed-table tbody tr, .speed-table tfoot tr, .sources li, .sources h3, .shot figcaption, .cta-inner > div > p, .cta-inner > .btn, .footer-col, .controls, .kpi, .chart, .checkmap, .speed-card, .cell";
  var WIPED = ".summary h1, .doc-section h2, .cta-band h2";
  var fine = window.matchMedia && matchMedia("(pointer:fine)").matches;
  function q(sel, ctx){ return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function isAr(){ var r = document.getElementById("i18n-ar"); return !!(r && r.checked); }
  var queued = false;
  function refreshSoon(){ if (queued) return; queued = true; setTimeout(function(){ queued = false; ST.refresh(); }, 140); }

  function fail(){
    try { ST.getAll().forEach(function(t){ t.kill(); }); } catch (e) {}
    root.classList.remove("js-motion");
    q(HIDDEN + ", " + WIPED + ", .bar > span, .f-fill, .c-fill, .s-fill, .seg").forEach(function(el){ el.style.opacity = ""; el.style.transform = ""; el.style.clipPath = ""; });
  }

  function fmt(v, dec){ return dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"); }
  function countUp(el, delay){
    var to = parseFloat(el.getAttribute("data-to"));
    if (!isFinite(to)) return;
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var suf = el.getAttribute("data-suf") || "";
    var o = { v: 0 };
    el.textContent = fmt(0, dec) + suf;
    gsap.to(o, { v: to, duration: 1.5, delay: delay || 0, ease: "power3.out",
      onUpdate: function(){ el.textContent = fmt(o.v, dec) + suf; },
      onComplete: function(){ el.textContent = fmt(to, dec) + suf; } });
  }
  function counts(ctx, delay){ q(".count", ctx).forEach(function(c){ countUp(c, delay); }); }
  function fill(ctx, delay){
    var bars = q(".bar > span", ctx);
    if (bars.length) gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: EASE, stagger: .1, delay: delay || 0 });
  }
  function rise(targets, fromY, extra){
    targets = targets.filter(Boolean);
    if (!targets.length) return null;
    var to = { opacity: 1, y: 0, x: 0, duration: .8, ease: EASE, stagger: .08, clearProps: "transform" };
    for (var k in extra || {}) to[k] = extra[k];
    return gsap.fromTo(targets, { opacity: 0, y: fromY }, to);
  }
  function wipe(el, delay, dur){
    if (!el) return null;
    return gsap.fromTo(el, { clipPath: "inset(-20% 50% -30% 50%)", y: 18 },
      { clipPath: "inset(-20% -10% -30% -10%)", y: 0, duration: dur || 1.1, ease: "expo.inOut", delay: delay || 0,
        onComplete: function(){ gsap.set(el, { clipPath: "none", clearProps: "transform" }); } });
  }
  function onEnter(el, fn, start){
    if (!el) return;
    ST.create({ trigger: el, start: start || "top 88%", once: true, onEnter: fn });
  }

  try {
    // ---- the light gate over the summary ----
    var hero = document.querySelector(".summary");
    if (hero) {
      var h1 = hero.querySelector("h1");
      var gates = q(".hero-fx .gate", hero);
      var glows = q(".glow", hero);
      var spread = Math.min(hero.getBoundingClientRect().width * .52, 470);
      gsap.set(glows, { opacity: 0, scale: .6 });
      var tl = gsap.timeline({ delay: .12 });
      tl.fromTo(gates, { opacity: 0, scaleY: 0, x: 0, color: "#ffffff" }, { opacity: 1, scaleY: 1, duration: .45, ease: "power2.out" }, 0)
        .to(gates[0], { x: -spread, duration: 1.25, ease: "expo.inOut" }, .4)
        .to(gates[1], { x: spread, duration: 1.25, ease: "expo.inOut" }, .4)
        .to(gates, { color: "#ff8979", duration: .55, ease: "none" }, .4)
        .to(gates, { color: "#6ae499", duration: .6, ease: "none" }, .95)
        .to(gates, { opacity: 0, duration: .7, ease: "power2.out" }, 1.55)
        .to(glows, { opacity: 1, scale: 1, duration: 1.8, ease: EASE, stagger: .2 }, 1.2);
      if (h1) {
        tl.fromTo(h1, { clipPath: "inset(-20% 50% -30% 50%)" }, { clipPath: "inset(-20% -10% -30% -10%)", duration: 1.25, ease: "expo.inOut",
          onComplete: function(){ gsap.set(h1, { clipPath: "none" }); } }, .4);
        tl.add(function(){ counts(h1); }, .75);
      }
      tl.add(function(){ rise(q(".crumbs", hero), 14, { duration: .7 }); }, .3)
        .add(function(){ rise(q(".lead", hero), 22); }, 1.25)
        .add(function(){
          var c = hero.querySelector(".callout");
          if (!c) return;
          rise([c], 18);
          var icon = c.querySelector("svg");
          if (icon) gsap.to(icon, { keyframes: { rotate: [0, -12, 9, -5, 0] }, duration: .7, delay: .35, ease: "power1.inOut" });
          gsap.fromTo(c, { boxShadow: "0 0 0 0 rgba(255,107,87,0)" }, { boxShadow: "0 0 34px 0 rgba(255,107,87,.32)", duration: .9, delay: .3, yoyo: true, repeat: 3, ease: "sine.inOut" });
        }, 1.4)
        .add(function(){
          rise(q(".fact", hero), 16, { stagger: .09 });
          fill(hero, .15);
          q(".fact .count", hero).forEach(function(c, i){ countUp(c, .15 + i * .09); });
        }, 1.55)
        .add(function(){ rise(q(".actions", hero), 16); }, 1.9);

      // slow drift, then parallax away as the summary scrolls off
      glows.forEach(function(g, i){
        gsap.to(g, { x: i ? -70 : 80, y: i ? 50 : -36, scale: i ? 1.18 : .88, duration: 9 + i * 3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
      });
      gsap.to(hero.querySelector(".hero-fx"), { yPercent: 30, opacity: .3, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      if (h1) gsap.to(h1, { y: -36, opacity: .55, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .6 } });
    }

    // ---- section headings wipe open, leads follow ----
    q(".doc-section:not(.summary) h2").forEach(function(h){
      onEnter(h, function(){ wipe(h); });
    });
    q(".doc-section:not(.summary) .section-lead").forEach(function(p){
      onEnter(p, function(){ rise([p], 20, { delay: .3 }); });
    });

    // ---- fix these first: cards slide in, worst first ----
    var fixList = document.querySelector(".fix-list");
    onEnter(fixList, function(){
      gsap.fromTo(q("li", fixList), { opacity: 0, y: 26, x: isAr() ? -48 : 48 },
        { opacity: 1, y: 0, x: 0, duration: .9, ease: EASE, stagger: .14, clearProps: "transform" });
    });

    // ---- screenshots rise into place like the site's hero mockup ----
    var shots = document.querySelector(".shots");
    if (shots) {
      var desk = shots.querySelector(".shot--desktop");
      var mob = shots.querySelector(".shot--mobile");
      var sg = shots.querySelector(".shots-glow");
      if (shots.closest(".summary")) {
        // Under the headline they're on screen at load: a timed rise right
        // after the headline opens, nothing tied to scroll.
        if (desk) gsap.fromTo(desk, { y: 60, scale: .94, rotateX: 12, opacity: 0 }, { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 1.1, ease: EASE, delay: .9, clearProps: "transform" });
        if (mob) gsap.fromTo(mob, { y: 110, rotate: 4, opacity: 0 }, { y: -12, rotate: 0, opacity: 1, duration: 1.2, ease: EASE, delay: 1.05 });
        if (sg) gsap.fromTo(sg, { scale: .55, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 1.6, ease: EASE, delay: 1 });
        rise(q("figcaption, .shots-note", shots.parentElement), 10, { delay: 1.4 });
      } else {
        if (desk) gsap.fromTo(desk, { y: 110, scale: .86, rotateX: 18, opacity: .25 }, { y: 0, scale: 1, rotateX: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: shots, start: "top bottom", end: "center 62%", scrub: .6 } });
        if (mob) gsap.fromTo(mob, { y: 210, rotate: 5, opacity: .25 }, { y: -24, rotate: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: shots, start: "top bottom", end: "bottom 55%", scrub: .8 } });
        if (sg) gsap.fromTo(sg, { scale: .55, opacity: 0 }, { scale: 1.1, opacity: 1, ease: "none",
          scrollTrigger: { trigger: shots, start: "top bottom", end: "center center", scrub: true } });
        onEnter(shots, function(){ rise(q("figcaption", shots), 10, { delay: .5 }); }, "top 70%");
      }
      // center-weighted cursor parallax (site hero mockup)
      if (fine) {
        var figs = q(".shot-frame", shots).map(function(f, i){
          return { x: gsap.quickTo(f, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(f, "y", { duration: 1.2, ease: "power3.out" }), k: i ? 1.7 : 1 };
        });
        window.addEventListener("mousemove", function(e){
          var r = shots.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          var dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
          var dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
          var w = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / .6);
          figs.forEach(function(f){ f.x(-dx * 40 * f.k * w); f.y(-dy * 26 * f.k * w); });
        }, { passive: true });
      }
    }

    // ---- the store scrolls top to bottom inside each frame ----
    // A loop while the section is on screen: down at reading pace, a pause
    // at the bottom, back to the top. Hovering a frame holds it still.
    q(".shot-frame").forEach(function(frame, i){
      var img = frame.querySelector("img");
      var thumb = frame.querySelector(".shot-bar span");
      if (!img) return;
      var tl = null, active = false, held = false;
      function build(){
        if (tl) tl.kill();
        tl = null;
        gsap.set(img, { y: 0 });
        var fh = frame.clientHeight, ih = img.offsetHeight;
        var travel = ih - fh;
        if (travel < 40 || !fh) { frame.classList.remove("is-scrolling"); return; }
        frame.classList.add("is-scrolling");
        var th = Math.max(24, (fh - 12) * fh / ih);
        if (thumb) { thumb.style.height = th + "px"; gsap.set(thumb, { y: 0 }); }
        var down = Math.min(22, 3 + (travel / fh) * 1.8);
        tl = gsap.timeline({ repeat: -1, paused: true, delay: i * .5 });
        tl.to(img, { y: -travel, duration: down, ease: "sine.inOut" }, 1.2);
        if (thumb) tl.to(thumb, { y: fh - 12 - th, duration: down, ease: "sine.inOut" }, 1.2);
        tl.to(img, { y: 0, duration: 1.8, ease: "power3.inOut" }, "+=1.6");
        if (thumb) tl.to(thumb, { y: 0, duration: 1.8, ease: "power3.inOut" }, "<");
        tl.to({}, { duration: 1 });
        if (active && !held) tl.play();
      }
      ST.create({ trigger: frame, start: "top bottom", end: "bottom top", onToggle: function(self){
        active = self.isActive;
        if (tl) { if (active && !held) tl.play(); else tl.pause(); }
      } });
      frame.addEventListener("pointerenter", function(){ held = true; if (tl) tl.pause(); });
      frame.addEventListener("pointerleave", function(){ held = false; if (tl && active) tl.play(); });
      if (img.complete && img.naturalHeight) build(); else img.addEventListener("load", build);
      var rt = null;
      window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(build, 200); }, { passive: true });
    });

    // ---- checks ----
    onEnter(document.querySelector(".controls"), function(){ rise(q(".controls"), 14, { delay: .35 }); });
    q(".cat-score").forEach(function(s){
      onEnter(s, function(){ rise([s], 12, { delay: .25 }); fill(s, .35); counts(s, .35); });
    });
    q(".group-head, .passed-head").forEach(function(el){
      onEnter(el, function(){ rise([el], 16); }, "top 92%");
    });
    ST.batch(".check", { start: "top 94%", once: true, onEnter: function(batch){ rise(batch, 26, { stagger: .07, duration: .75 }); } });

    // ---- page speed ----
    var speed = document.querySelector(".speed-table");
    onEnter(speed, function(){
      rise(q("tbody tr, tfoot tr", speed), 18, { stagger: .1 });
      q("tr", speed).forEach(function(tr, i){ counts(tr, .1 + i * .1); });
    }, "top 82%");

    // ---- sources, footer ----
    var sources = document.querySelector(".sources");
    onEnter(sources, function(){
      rise(q("h3, li", sources), 12, { stagger: .05, duration: .6 });
    });
    var foot = document.querySelector(".footer");
    onEnter(foot, function(){ rise(q(".footer-col", foot), 20, { stagger: .1 }); }, "top 92%");

    // ---- closing card: the light gate again, triggered then timed ----
    var band = document.querySelector(".cta-band");
    if (band) {
      onEnter(band, function(){
        var g2 = q(".cta-gate .gate", band);
        var h2 = band.querySelector("h2");
        var sp = Math.min(band.getBoundingClientRect().width * .45, 560);
        var t2 = gsap.timeline();
        t2.fromTo(g2, { opacity: 0, scaleY: 0, x: 0, color: "#ffffff" }, { opacity: 1, scaleY: 1, duration: .4, ease: "power2.out" }, 0)
          .to(g2[0], { x: -sp, duration: 1.2, ease: "expo.inOut" }, .35)
          .to(g2[1], { x: sp, duration: 1.2, ease: "expo.inOut" }, .35)
          .to(g2, { color: "#fcd34d", duration: .5, ease: "none" }, .35)
          .to(g2, { color: "#6ae499", duration: .6, ease: "none" }, .85)
          .to(g2, { opacity: 0, duration: .6 }, 1.45);
        if (h2) t2.add(wipe(h2, 0, 1.2), .35);
        t2.add(function(){ rise(q(".cta-inner > div > p, .cta-inner > .btn", band), 20, { stagger: .12 }); }, 1.05);
      }, "top 78%");
    }

    // ---- scroll progress, toc rail ----
    var prog = document.querySelector(".scroll-progress span");
    if (prog) gsap.to(prog, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
    var rail = document.querySelector(".toc-rail span");
    if (rail) gsap.to(rail, { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

    // ---- toc pill follows the section in view ----
    var pill = document.querySelector(".toc-pill");
    function movePill(){
      if (!pill) return;
      var a = document.querySelector(".toc a[aria-current='true']");
      if (!a) { gsap.to(pill, { opacity: 0, duration: .2 }); return; }
      gsap.to(pill, { y: a.parentElement.offsetTop, height: a.offsetHeight, opacity: 1, duration: .55, ease: EASE });
    }
    if (pill && window.MutationObserver) {
      new MutationObserver(movePill).observe(document.querySelector(".toc"), { attributes: true, subtree: true, attributeFilter: ["aria-current"] });
    }

    // ---- filter tabs: sliding underline, rows re-enter ----
    var ink = document.querySelector(".chip-ink");
    function moveInk(instant){
      var c = document.querySelector(".chip.is-active");
      if (!ink || !c) return;
      var vars = { x: c.offsetLeft, y: c.offsetTop + c.offsetHeight - 2, width: c.offsetWidth, opacity: 1 };
      if (instant) gsap.set(ink, vars); else gsap.to(ink, Object.assign(vars, { duration: .5, ease: EASE }));
    }
    if (ink) { gsap.set(ink, { top: 0, bottom: "auto" }); moveInk(true); }
    function reenter(){
      setTimeout(function(){
        var rows = q(".check").filter(function(r){ return !r.hidden && r.offsetParent; });
        var vh = innerHeight;
        var inView = rows.filter(function(r){ var b = r.getBoundingClientRect(); return b.top < vh && b.bottom > 0; }).slice(0, 18);
        gsap.set(rows.concat(q(".group-head, .passed-head")), { opacity: 1, clearProps: "transform" });
        if (inView.length) gsap.fromTo(inView, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: EASE, stagger: .03, clearProps: "transform" });
        refreshSoon();
      }, 0);
    }
    q(".chip").forEach(function(c){ c.addEventListener("click", function(){ moveInk(); reenter(); }); });
    q(".search").forEach(function(s){ s.addEventListener("input", reenter); });

    // ---- check rows open and close with height, not a jump ----
    window.__animateRow = function(row, open){
      var d = row.querySelector(".check-detail");
      if (!d) { row.classList.toggle("is-collapsed", !open); return; }
      gsap.killTweensOf(d);
      if (open) {
        row.classList.remove("is-collapsed");
        gsap.fromTo(d, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: .5, ease: EASE, clearProps: "height,opacity", onComplete: refreshSoon });
      } else {
        gsap.to(d, { height: 0, opacity: 0, duration: .3, ease: "power2.in", onComplete: function(){
          row.classList.add("is-collapsed");
          gsap.set(d, { clearProps: "height,opacity" });
          refreshSoon();
        } });
      }
    };

    // ---- language switch: soft crossfade, re-measure ----
    q(".lang-radio").forEach(function(r){
      r.addEventListener("change", function(){
        gsap.fromTo(".content, .cta-card, .footer-grid", { opacity: .25, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: .55, ease: "power2.out", clearProps: "filter,opacity" });
        requestAnimationFrame(function(){ moveInk(true); movePill(); refreshSoon(); });
      });
    });
    window.addEventListener("resize", function(){ moveInk(true); movePill(); }, { passive: true });

    // ---- pointer: card spotlight, page glow, magnetic buttons ----
    document.addEventListener("pointermove", function(e){
      var c = e.target && e.target.closest ? e.target.closest(".check, .fix-list a") : null;
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
    var cg = document.querySelector(".cursor-glow");
    if (cg && fine) {
      var gx = gsap.quickTo(cg, "x", { duration: .9, ease: "power3.out" });
      var gy = gsap.quickTo(cg, "y", { duration: .9, ease: "power3.out" });
      var lit = false;
      window.addEventListener("pointermove", function(e){
        gx(e.clientX); gy(e.clientY);
        if (!lit) { lit = true; gsap.to(cg, { opacity: 1, duration: .6 }); }
      }, { passive: true });
      document.documentElement.addEventListener("mouseleave", function(){ lit = false; gsap.to(cg, { opacity: 0, duration: .4 }); });
    }
    if (fine) q(".magnetic").forEach(function(b){
      var mx = gsap.quickTo(b, "x", { duration: .5, ease: "power3.out" });
      var my = gsap.quickTo(b, "y", { duration: .5, ease: "power3.out" });
      b.addEventListener("pointerenter", function(){ gsap.to(b, { scale: 1.05, duration: .3, ease: "power2.out" }); });
      b.addEventListener("pointermove", function(e){
        var r = b.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .25);
        my((e.clientY - r.top - r.height / 2) * .35);
      });
      b.addEventListener("pointerleave", function(){ mx(0); my(0); gsap.to(b, { scale: 1, duration: .45, ease: "power2.out" }); });
      b.addEventListener("pointerdown", function(){ gsap.to(b, { scale: .96, duration: .12 }); });
      b.addEventListener("pointerup", function(){ gsap.to(b, { scale: 1.05, duration: .2 }); });
    });

    // ---- rings and gauges draw their arcs ----
    q(".ring-fg, .g-fg").forEach(function(c){ gsap.set(c, { strokeDashoffset: 100 }); });
    function arcs(ctx, delay){
      q(".ring-fg, .g-fg", ctx).forEach(function(c, i){
        gsap.to(c, { strokeDashoffset: parseFloat(c.getAttribute("data-off")), duration: 1.6, ease: EASE, delay: (delay || 0) + i * .12 });
      });
    }
    q(".cat-score").forEach(function(s){ onEnter(s, function(){ arcs(s, .3); }); });

    // ---- the store's numbers ----
    var kpis = document.querySelector(".kpis");
    onEnter(kpis, function(){
      var ks = q(".kpi", kpis);
      rise(ks, 22, { stagger: .1 });
      ks.forEach(function(k, i){ counts(k, .15 + i * .1); });
    });
    q(".chart").forEach(function(ch){
      onEnter(ch, function(){
        rise([ch], 26, { duration: .9 });
        var fills = q(".f-fill, .c-fill, .s-fill", ch);
        if (fills.length) gsap.fromTo(fills, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: EASE, stagger: .14, delay: .35 });
        q(".f-row, .c-row, .s-row", ch).forEach(function(r, i){ counts(r, .35 + i * .14); });
        var avg = q(".c-avg", ch);
        if (avg.length) gsap.fromTo(avg, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: .5, ease: EASE, stagger: .05, delay: .4 + fills.length * .14 });
        var conts = q(".f-cont", ch);
        if (conts.length) gsap.fromTo(conts, { opacity: 0, x: isAr() ? 10 : -10 }, { opacity: 1, x: 0, duration: .5, ease: EASE, stagger: .14, delay: .6 });
        q(".chart-insight b", ch).forEach(function(b){
          gsap.fromTo(b, { textShadow: "0 0 0px rgba(106,228,153,0)" }, { textShadow: "0 0 18px rgba(106,228,153,.9)", duration: .7, delay: .9 + fills.length * .14, yoyo: true, repeat: 1, ease: "sine.inOut", onComplete: function(){ gsap.set(b, { clearProps: "textShadow" }); } });
        });
      }, "top 85%");
    });

    // ---- the 50-check map: the bar splits, squares fill in ----
    var cmap = document.querySelector(".checkmap");
    onEnter(cmap, function(){
      rise([cmap], 24);
      var segs = q(".seg", cmap);
      if (segs.length) gsap.fromTo(segs, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE, stagger: .12, delay: .3 });
      rise(q(".sev-legend li", cmap), 10, { stagger: .08, delay: .5 });
      var cells = q(".cell", cmap);
      if (cells.length) gsap.fromTo(cells, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: .5, ease: EASE, stagger: .018, delay: .55, clearProps: "transform" });
      var hot = q(".cell--critical", cmap);
      if (hot.length) gsap.to(hot, { boxShadow: "0 0 22px rgba(255,107,87,.95)", duration: .9, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.8 });
    }, "top 85%");

    // ---- page speed gauges ----
    q(".speed-card").forEach(function(card, i){
      var d = (i % 3) * .1;
      onEnter(card, function(){ rise([card], 22, { delay: d }); arcs(card, .25 + d); counts(card, .25 + d); }, "top 90%");
    });

    // ---- the guide: the Optimizers mark glides a curved path through the report ----
    // One smooth spline runs through every section stop (beside its heading)
    // and, between stops, through waypoints that swing it across the page:
    // into the gap by the contents list, behind the cards, out to the far
    // margin. Waypoints come from a generator seeded by the page title, so a
    // report keeps the same path on every reload. The path sits under the
    // content (it shows in the gaps between cards); the mark rides on top,
    // waits beside each heading with its label, and ends on the call button.
    var guide = document.querySelector(".guide");
    if (guide) (function(){
      guide.hidden = false;
      var svg = guide.querySelector(".g-path");
      var base = svg.querySelector(".gp-base"), glow = svg.querySelector(".gp-glow"), fillP = svg.querySelector(".gp-fill"), probe = svg.querySelector(".gp-probe");
      var dotsEl = guide.querySelector(".g-dots");
      var mark = guide.querySelector(".g-mark"), body = guide.querySelector(".g-body"), icon = guide.querySelector(".g-icon");
      var label = guide.querySelector(".g-label"), text = guide.querySelector(".g-text"), check = guide.querySelector(".g-check path");
      var all = q(".g-stops > span", guide).map(function(s){
        return { id: s.getAttribute("data-for"), en: s.getAttribute("data-en"), ar: s.getAttribute("data-ar"), tone: s.getAttribute("data-tone") };
      });
      var endDef = all.filter(function(d){ return d.id === "end"; })[0];
      var defs = all.filter(function(d){ return d.id !== "end" && document.getElementById(d.id); });
      var cta = document.querySelector(".cta-band .btn--lg");
      if (!defs.length) { guide.hidden = true; return; }
      var stops = [], dots = [], alerts = [], rail = false, total = 1, cur = null, landed = false, wantLand = false;
      var STEP = 6, ys = [], covers = [];
      var prox = { len: 0 };
      var qlen = gsap.quickTo(prox, "len", { duration: .4, ease: "power2.out", onUpdate: render });
      var MID = .5;
      var qcx = gsap.quickTo(mark, "x", { duration: .6, ease: "power3.out" });

      function pageTop(el){ var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
      function pageLeft(el){ var v = 0; while (el) { v += el.offsetLeft; el = el.offsetParent; } return v; }
      function anchorY(id){
        var sec = document.getElementById(id);
        var h = sec.querySelector("h1, h2") || sec;
        return pageTop(h) + Math.min(h.offsetHeight, 64) / 2;
      }
      function hash(str){
        var h = 2166136261;
        for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
        return h;
      }
      function rng(seed){
        return function(){
          seed = seed + 0x6D2B79F5 | 0;
          var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
      // Catmull-Rom through the points, as cubic Beziers; "upto" stops after
      // that many segments but still uses the full point list for tangents,
      // so a prefix measures exactly like the same stretch of the whole path.
      function curve(P, upto){
        var n = upto === undefined ? P.length - 1 : upto;
        var f = function(v){ return v.toFixed(1); };
        var d = "M" + f(P[0].x) + " " + f(P[0].y);
        for (var i = 0; i < n; i++) {
          var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
          // kx < 1 flattens the sideways swing at a point (the narrow gap)
          var k1 = p1.kx === undefined ? 1 : p1.kx, k2 = p2.kx === undefined ? 1 : p2.kx;
          d += " C" + f(p1.x + (p2.x - p0.x) / 6 * k1) + " " + f(p1.y + (p2.y - p0.y) / 6) + " " + f(p2.x - (p3.x - p1.x) / 6 * k2) + " " + f(p2.y - (p3.y - p1.y) / 6) + " " + f(p2.x) + " " + f(p2.y);
        }
        return d;
      }
      function say(def){
        if (!def) { label.classList.remove("is-on"); return; }
        text.textContent = isAr() ? def.ar : def.en;
        text.dir = isAr() ? "rtl" : "ltr";
        label.classList.add("is-on");
      }
      function setLanded(on){
        landed = on;
        mark.classList.toggle("is-landed", on);
        if (cta) cta.classList.toggle("is-landed", on);
        if (on) {
          mark.classList.remove("is-alert");
          gsap.fromTo(check, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .5, ease: "power2.out" });
          gsap.fromTo(body, { scale: 1.35 }, { scale: 1, duration: .6, ease: EASE });
        } else {
          gsap.set(check, { strokeDashoffset: 1 });
        }
      }

      function measure(){
        if (landed) setLanded(false);
        var content = document.querySelector(".content");
        var ar = isAr();
        var W = document.documentElement.clientWidth;
        var cl = pageLeft(content), cw = content.offsetWidth, cr = cl + cw;
        var free = ar ? cl : W - cr;
        rail = free >= 190 && innerWidth >= 1024;
        guide.classList.toggle("is-rail", rail);
        guide.classList.toggle("is-compact", !rail);
        label.classList.toggle("is-flip", ar);
        label.classList.toggle("is-above", free < 250);
        cur = null;
        if (!rail) { gsap.set(mark, { y: 0 }); update(true); return; }

        var r = rng(hash(document.title + "|" + (ar ? "ar" : "en")));
        var outside = function(off){ return ar ? cl - off : cr + off; };
        var gapX = ar ? cr + 36 : cl - 36;
        var list = defs.map(function(d){ return { d: d, y: anchorY(d.id) }; }).sort(function(a, b){ return a.y - b.y; });
        if (cta && endDef) list.push({ d: endDef, y: pageTop(cta) - 2, x: pageLeft(cta) + cta.offsetWidth / 2, end: true });
        // The path only crosses the reading column under a full-width card:
        // in at the card's outer edge, out into the gap by the contents list,
        // down that gap, and back out under a later card. Everywhere else it
        // stays in empty margin, so it never runs under text.
        var cards = q(".check, .chart, .checkmap, .fix-list li").filter(function(el){
          return !el.hidden && el.offsetParent && el.offsetHeight >= 110 && el.offsetWidth >= cw * .9;
        }).map(function(el){ return { top: pageTop(el), h: el.offsetHeight }; }).sort(function(a, b){ return a.top - b.top; });
        covers = q(".check, .chart, .checkmap, .fix-list li, .kpi, .speed-card, .cta-card").filter(function(el){ return !el.hidden && el.offsetParent; }).map(function(el){
          var l = pageLeft(el), t = pageTop(el);
          return [l, t, l + el.offsetWidth, t + el.offsetHeight];
        });
        var outX = function(){ return outside(Math.min(free - 40, 70 + r() * 110)); };
        var inX = function(){ return gapX + (r() - .5) * 10; };
        var points = [], stopIdx = [];
        list.forEach(function(s, i){
          if (i > 0) {
            var cursor = points[points.length - 1].y;
            for (var trips = 0; trips < 3; trips++) {
              var pool = cards.filter(function(c){ return c.top > cursor + 90 && c.top + c.h < s.y - 120; });
              if (pool.length < 2 || r() > .8) break;
              var a = pool[Math.floor(r() * Math.min(pool.length, 3))];
              var later = pool.filter(function(c){ return c.top > a.top + a.h + 220; });
              if (!later.length) break;
              var b = later[Math.floor(r() * Math.min(later.length, 4))];
              if (a.top - cursor > 300) points.push({ x: outX(), y: (cursor + a.top) / 2 });
              points.push({ x: outside(18), y: a.top + a.h * .3 });
              points.push({ x: inX(), y: a.top + a.h * .7, kx: .12 });
              var run = b.top - (a.top + a.h);
              if (run > 500) points.push({ x: inX(), y: a.top + a.h + run / 2, kx: .12 });
              points.push({ x: inX(), y: b.top + b.h * .3, kx: .12 });
              points.push({ x: outside(18), y: b.top + b.h * .7 });
              cursor = b.top + b.h;
            }
            var gap = s.y - cursor;
            var m = gap > 1300 ? 2 : gap > 340 ? 1 : 0;
            for (var j = 0; j < m; j++) points.push({ x: outX(), y: cursor + gap * (j + 1) / (m + 1) + (r() - .5) * gap * .12 });
          }
          var sx = s.end ? s.x : outside(44 + r() * Math.max(0, Math.min(40, free - 210)));
          s.x = sx;
          stopIdx.push(points.length);
          points.push({ x: sx, y: s.y });
        });
        stops = list;

        // collapse the path first: as part of the page it would otherwise
        // hold the page at its previous (possibly taller) height
        svg.setAttribute("height", "0");
        var docH = document.documentElement.scrollHeight;
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(docH));
        svg.setAttribute("viewBox", "0 0 " + W + " " + docH);
        var d = curve(points);
        base.setAttribute("d", d); glow.setAttribute("d", d); fillP.setAttribute("d", d);
        total = Math.max(1, base.getTotalLength());
        stops.forEach(function(s, i){
          if (stopIdx[i] === 0) { s.len = 0; return; }
          probe.setAttribute("d", curve(points, stopIdx[i]));
          s.len = probe.getTotalLength();
        });
        // height along the curve every STEP px of length, to find the point
        // at a given height (the curve's y only ever runs downward between stops)
        ys = [];
        for (var Ls = 0; Ls <= total; Ls += STEP) ys.push(base.getPointAtLength(Ls).y);
        fillP.style.strokeDasharray = total + " " + total;
        glow.style.strokeDasharray = total + " " + total;

        dotsEl.innerHTML = stops.map(function(s){ return s.end ? "" : '<span class="g-dot g-dot--' + s.d.tone + '"></span>'; }).join("");
        dots = q(".g-dot", dotsEl);
        dots.forEach(function(dot, i){ gsap.set(dot, { x: stops[i].x, y: stops[i].y }); });
        alerts = q(".check:not(.check--pass)").filter(function(row){ return !row.hidden && row.offsetParent; }).map(function(row){ var t = pageTop(row); return [t, t + row.offsetHeight]; });

        // Scroll points that reach each stop, kept reachable at the bottom
        // of the page however tall the screen is.
        var tmax = Math.max(0, docH - innerHeight) + innerHeight * MID - 12;
        for (var k = stops.length - 1; k >= 0; k--) {
          var lim = k === stops.length - 1 ? tmax : stops[k + 1].t - 90;
          stops[k].t = Math.min(stops[k].y, lim);
        }
        // the first stop's pause starts at the top of the page
        stops[0].t = Math.max(stops[0].t, innerHeight * MID + 1);
        if (stops[1]) stops[0].t = Math.min(stops[0].t, stops[1].t - 120);
        update(true);
        render();
      }

      // Length along the curve, between two stops, where it reaches height y.
      function lenAtY(y, a, b){
        var i = Math.floor(a / STEP), end = Math.min(ys.length - 1, Math.ceil(b / STEP));
        for (; i < end; i++) {
          if (ys[i + 1] >= y) {
            var span = ys[i + 1] - ys[i];
            var f = span > 0 ? (y - ys[i]) / span : 0;
            return Math.max(a, Math.min(b, (i + Math.max(0, Math.min(1, f))) * STEP));
          }
        }
        return b;
      }
      // Where along the path the mark belongs for this scroll position: it
      // waits at a stop for a stretch, then follows the reading line down
      // while the curve carries it side to side.
      function follow(){
        var t = scrollY + innerHeight * MID, n = stops.length;
        if (t <= stops[0].t) return { len: stops[0].len, i: 0 };
        for (var i = 0; i < n - 1; i++) {
          var s = stops[i], nx = stops[i + 1];
          if (t < nx.t) {
            // short pause beside the heading, then straight back to the
            // middle of the screen and on with the scroll
            var gap = nx.t - s.t, R = Math.min(90, gap * .3);
            if (t - s.t < R) return { len: s.len, i: i };
            var f = (t - s.t) / gap;
            var y = t + (s.y - s.t) * (1 - f) + (nx.y - nx.t) * f;
            y = Math.max(s.y, Math.min(nx.y, y));
            return { len: lenAtY(y, s.len, nx.len), i: -1 };
          }
        }
        return { len: stops[n - 1].len, i: n - 1 };
      }

      function render(){
        if (!rail) return;
        var L = Math.max(0, Math.min(total, prox.len));
        var pt = base.getPointAtLength(L);
        gsap.set(mark, { x: pt.x, y: pt.y });
        var off = total - L;
        fillP.style.strokeDashoffset = off;
        glow.style.strokeDashoffset = off;
        gsap.set(icon, { rotation: L * .35 });
        var under = false;
        if (!landed) for (var c = 0; c < covers.length; c++) {
          var cv = covers[c];
          if (pt.x > cv[0] - 14 && pt.x < cv[2] + 14 && pt.y > cv[1] - 14 && pt.y < cv[3] + 14) { under = true; break; }
        }
        if (under !== mark.classList.contains("is-under")) mark.classList.toggle("is-under", under);
        if (wantLand && !landed && L >= total - 4) setLanded(true);
        if (!wantLand && landed) setLanded(false);
        var hot = false;
        if (!landed) for (var i = 0; i < alerts.length; i++) { if (pt.y >= alerts[i][0] && pt.y <= alerts[i][1]) { hot = true; break; } }
        if (hot !== mark.classList.contains("is-alert")) mark.classList.toggle("is-alert", hot);
        for (var j = 0; j < dots.length; j++) {
          var done = stops[j].len <= L + 2;
          if (done !== dots[j].classList.contains("is-done")) dots[j].classList.toggle("is-done", done);
        }
      }

      function update(force){
        if (!rail) {
          // phones: the mark rides the scroll-progress bar under the top bar
          var max = document.documentElement.scrollHeight - innerHeight;
          var pr = max > 0 ? Math.min(1, scrollY / max) : 0;
          var w = document.documentElement.clientWidth;
          qcx(isAr() ? w - 14 - pr * (w - 28) : 14 + pr * (w - 28));
          var ctaOn = !!cta && cta.getBoundingClientRect().top < innerHeight * .72;
          if (ctaOn !== landed) setLanded(ctaOn);
          return;
        }
        if (!stops.length) return;
        var f = follow();
        qlen(f.len);
        var s = f.i >= 0 ? stops[f.i] : null;
        wantLand = !!(s && s.end);
        var def = s ? s.d : null;
        if (def !== cur || force) {
          cur = def;
          say(def);
          if (def && !wantLand) gsap.fromTo(body, { scale: 1.25 }, { scale: 1, duration: .6, ease: EASE });
        }
        if (!wantLand && landed) setLanded(false);
      }

      ST.addEventListener("refresh", measure);
      q("img").forEach(function(im){ if (!im.complete) im.addEventListener("load", refreshSoon); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);
      ST.create({ start: 0, end: "max", onUpdate: function(){ update(); } });
      q(".lang-radio").forEach(function(radio){ radio.addEventListener("change", function(){ requestAnimationFrame(measure); }); });
      measure();
      gsap.fromTo([svg, dotsEl], { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 1.7 });
      gsap.fromTo(mark, { opacity: 0 }, { opacity: 1, duration: .7, delay: 1.9 });
    })();

    // Anything already above the fold line on load (a reload mid-page, an
    // anchor link) shows at once instead of waiting for a trigger.
    requestAnimationFrame(function(){
      ST.refresh();
      q(HIDDEN + ", " + WIPED).forEach(function(el){
        if (el.closest(".summary")) return;
        if (el.getBoundingClientRect().bottom < 0) { gsap.set(el, { opacity: 1, clipPath: "none" }); q(".bar > span, .f-fill, .c-fill, .s-fill, .seg", el).forEach(function(b){ gsap.set(b, { scaleX: 1 }); }); q(".ring-fg, .g-fg", el).forEach(function(c){ gsap.set(c, { strokeDashoffset: parseFloat(c.getAttribute("data-off")) }); }); }
      });
    });
  } catch (err) {
    fail();
  }
})();

// ---- personal touches that work with or without motion ----
(function(){
  "use strict";
  var root = document.documentElement;
  function isAr(){ var r = document.getElementById("i18n-ar"); return !!(r && r.checked); }

  // check-map squares carry their check's headline in both languages
  function titles(){
    var ar = isAr();
    Array.prototype.forEach.call(document.querySelectorAll(".cell"), function(c){
      var t = c.getAttribute(ar ? "data-ar" : "data-en") || "";
      c.title = t;
      c.setAttribute("aria-label", t);
    });
  }
  titles();
  Array.prototype.forEach.call(document.querySelectorAll(".lang-radio"), function(r){ r.addEventListener("change", titles); });
  // keep the page language in step with the switch, for screen readers
  Array.prototype.forEach.call(document.querySelectorAll(".lang-radio"), function(r){
    r.addEventListener("change", function(){ root.lang = isAr() ? "ar" : "en"; });
  });

  // The store's own accent colour, sampled from its homepage screenshot:
  // the most common saturated hue, lifted so it reads on the dark page.
  // A near-monochrome site keeps the Optimizers green.
  var shot = document.querySelector(".shot--desktop img") || document.querySelector(".shot img");
  if (!shot) return;
  var img = new Image();
  img.onload = function(){
    try {
      var W = 72, H = 45;
      var c = document.createElement("canvas");
      c.width = W; c.height = H;
      var ctx = c.getContext("2d");
      var sw = img.naturalWidth, sh = Math.min(img.naturalHeight, Math.round(sw * .625));
      ctx.drawImage(img, 0, 0, sw, sh, 0, 0, W, H);
      var d = ctx.getImageData(0, 0, W, H).data;
      var bins = [];
      for (var b = 0; b < 24; b++) bins.push({ w: 0, r: 0, g: 0, b: 0 });
      var total = 0;
      for (var p = 0; p < d.length; p += 4) {
        total++;
        var r = d[p] / 255, g = d[p + 1] / 255, bl = d[p + 2] / 255;
        var mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), l = (mx + mn) / 2;
        if (mx === mn) continue;
        var s = l > .5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
        if (s < .3 || l < .18 || l > .85) continue;
        var h = mx === r ? (g - bl) / (mx - mn) : mx === g ? (bl - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
        h = (h * 60 + 360) % 360;
        var bin = bins[Math.floor(h / 15) % 24];
        bin.w += s; bin.r += d[p] * s; bin.g += d[p + 1] * s; bin.b += d[p + 2] * s;
      }
      var best = bins[0];
      for (var k = 1; k < 24; k++) if (bins[k].w > best.w) best = bins[k];
      if (best.w < total * .015) return;
      var R = best.r / best.w / 255, G = best.g / best.w / 255, B = best.b / best.w / 255;
      var max = Math.max(R, G, B), min = Math.min(R, G, B), L = (max + min) / 2, S = 0, HH = 0;
      if (max !== min) {
        S = L > .5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
        HH = max === R ? (G - B) / (max - min) : max === G ? (B - R) / (max - min) + 2 : (R - G) / (max - min) + 4;
        HH = (HH * 60 + 360) % 360;
      }
      L = Math.max(L, .64);
      S = Math.min(Math.max(S, .45), .85);
      root.style.setProperty("--client", "hsl(" + Math.round(HH) + " " + Math.round(S * 100) + "% " + Math.round(L * 100) + "%)");
      root.classList.add("has-client");
    } catch (e) {}
  };
  img.src = shot.currentSrc || shot.src;
})();
`;
}

async function renderReport(result: AuditResult): Promise<string> {
  const [assets, libs] = await Promise.all([brandAssets(), motionLibs()]);
  const counts = resultCounts(result);
  const contactUrl = `${SITE_URL.replace(/\/$/, "")}/#contact`;
  const generatedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  // Arabic month name, Latin digits, matching how the findings text keeps
  // numerals (translate-ar.ts's own prompt rule).
  const generatedAtAr = new Date().toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric", numberingSystem: "latn" });
  // Proper noun (business name) or a bare URL either way, never translated.
  const attributedTo = escapeHtml(result.businessName || result.websiteUrl);
  const speed = result.pageSpeed && result.pageSpeed.pages.some(p => p.mobile !== null || p.desktop !== null) ? result.pageSpeed : null;
  // The store owner and the media buyer get their own opening and sections;
  // everyone else keeps the shared layout.
  const persona = personaOf(result.audienceRole);
  const buyer = persona === "media_buyer";
  const fixFirst = persona === "store_owner" ? ownerPlanHtml(result) : fixFirstHtml(result);
  const screens = screenshotsHtml(result);
  const numbers = numbersSectionHtml(result);
  const friction = frictionSectionHtml(result);
  const clarity = persona ? claritySectionHtml(result, buyer) : "";
  const keep = persona === "store_owner" ? keepItHtml(result) : "";
  const method = persona ? methodHtml(result, buyer, generatedAt, generatedAtAr) : "";
  const hero = persona === "store_owner"
    ? ownerHeroHtml(result, counts, generatedAt, generatedAtAr, contactUrl, screens)
    : buyer
      ? buyerHeroHtml(result, counts, generatedAt, generatedAtAr, contactUrl, screens)
      : summaryHtml(result, counts, generatedAt, generatedAtAr, contactUrl, screens);
  const checks = `${checksIntroHtml(counts, result)}${result.categories.map(cat => categorySectionHtml(cat, result, assets)).join("")}`;
  const speedHtml = speed ? speedSectionHtml(speed) : "";
  // Section order per reader: the owner reads money and fixes before the
  // detail; the buyer reads the tracking verdict, then behaviour, then pages.
  // Same order as the table of contents (tocHtml): Clarity and "keep it"
  // before the full checks, "how it works" at the end.
  const body = [hero, questionsHtml(result), fixFirst, numbers, friction, clarity, keep, checks, speedHtml, method, sourcesHtml(result)];
  const extraNav = {
    before: [
      ...(clarity ? [["clarity", "Clarity", "Clarity"] as [string, string, string]] : []),
      ...(keep ? [["keep", "Keep it", "خلّه زي ما هو"] as [string, string, string]] : []),
    ],
    after: method ? [["method", "How it works", buyer ? "اتعمل إزاي" : "كيف سوّيناه"] as [string, string, string]] : [],
  };
  const title = `${result.businessName || hostOf(result.websiteUrl)} · Optimizers Audit`;

  return `<!doctype html>
<html lang="ar">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${styles(assets)}</style>
<script>try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-motion");setTimeout(function(){if(!window.__motion)document.documentElement.classList.remove("js-motion")},3000)}}catch(e){}</script>
</head>
<body>
  <input type="radio" name="report-i18n" id="i18n-en" class="lang-radio" />
  <input type="radio" name="report-i18n" id="i18n-ar" class="lang-radio" checked />
  <div class="cursor-glow" aria-hidden="true"></div>
  <header class="topbar">
    <div class="scroll-progress" aria-hidden="true"><span></span></div>
    <div class="wrap topbar-inner">
      <a class="brand" href="${SITE_URL}"><img src="${assets.wordmark}" alt="Optimizers" /></a>
      <div class="topbar-end">
        <div class="lang" role="group" aria-label="Report language">
          <label for="i18n-en" id="lang-en">EN</label>
          <label for="i18n-ar" id="lang-ar">عربي</label>
        </div>
        <a class="btn btn--primary btn--sm" href="${contactUrl}">${bi("Book a call", "احجز مكالمة")}</a>
      </div>
    </div>
  </header>
  <main>
    ${jumpBarHtml(result, Boolean(fixFirst), Boolean(speed), Boolean(numbers), Boolean(friction))}
    <div class="wrap layout">
      ${tocHtml(result, Boolean(fixFirst), false, Boolean(speed), Boolean(numbers), Boolean(friction), extraNav)}
      <div class="content">
        ${body.join("\n")}
      </div>
    </div>
    ${ctaHtml(counts, contactUrl, result)}
    ${footerHtml(assets, attributedTo, generatedAt, generatedAtAr, contactUrl)}
  </main>
  ${guideHtml(result, counts, { fixFirst: Boolean(fixFirst), screens: false, numbers: Boolean(numbers), speed: Boolean(speed), friction: Boolean(friction) })}
<script>${libs}</script>
<script>${scriptBlock()}</script>
<script>${revealFallbackScript}</script>
</body>
</html>`;
}

export async function buildAuditHtmlReport(result: AuditResult): Promise<AuditHtmlReport> {
  return { html: await renderReport(withReaderSeverity(result)) };
}

// Each reader sees the severity their ICP gives a point (audience.ts
// roleSeverity): counts, ordering, tags and the first section all follow it.
// A copy, so the saved audit keeps the checklist severity.
function withReaderSeverity(result: AuditResult): AuditResult {
  const role = result.audienceRole;
  if (!role) return result;
  return {
    ...result,
    categories: result.categories.map(cat => ({
      ...cat,
      findings: cat.findings.map(f => (f.status === "fail" ? { ...f, severity: roleSeverity(role, f.checklistId, f.severity) } : f)),
    })),
  };
}
