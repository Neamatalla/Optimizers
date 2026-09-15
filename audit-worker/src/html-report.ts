import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { AuditResult, CategoryKey, CategoryResult, FindingSeverity } from "./types.js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, type ChecklistPoint } from "./checklist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "assets");

// Real Optimizers brand colors (BRAND_IDENTITY.md §4, verbatim from the brand
// PDF p.14) plus a small set of deliberately-chosen supporting tones — never
// generic grays, always a hue nudge toward the brand palette.
const BLACK_FOREST = "#020601";
const BIG_STONE = "#162A3D";
const STONE_RAISED = "#1E3A52"; // one step lighter than Big Stone, for header rows / hover-weight
const ACCENT = "#6AE499";
const INK = "#EAF3EC"; // near-white with a whisper of green, not pure white
const MUTED = "#93ADA8"; // blue-green-gray from the Big Stone family, not a generic gray
const HAIRLINE = "rgba(234,243,236,.09)";
const CRITICAL = "#FF6B57";
const MEDIUM = "#F2B75E";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";

// Three possible category combinations run per audit (see scoring.ts's
// countedCategories, always exactly 50 checks): GA4+GTM together, one
// tracking tool + Website together, or Website alone — never any other
// combination. Clarity/SessionRecording was dropped as a category before
// this report existed; PageSpeed was a real fourth category (its own tab,
// plus a full Lighthouse sweep rendered under it) until 2026-09-09, when
// the sweep's run time got it removed — what it scored is now WEB-60..63
// inside Website. All three keep the icon-in-circle treatment established
// in the PPTX report for visual consistency across every deliverable this
// audit produces, and all three tabs always render, even for a category
// that didn't run this specific audit (see categorySection's not-run
// branch).
const CATEGORY_LABELS: Record<CategoryKey, string> = {
  GA4: "Google Analytics 4",
  GTM: "Google Tag Manager",
  Website: "Website & CRO",
};

const CATEGORY_ICON: Record<CategoryKey, string> = {
  GA4: "chart-growth.png",
  GTM: "tag.png",
  Website: "cart.png",
};

const CATEGORY_CAPTION: Record<CategoryKey, string> = {
  GA4: "Measurement layer — key events, conversions, audience data",
  GTM: "Container deployment — tags, triggers, pixel firing",
  Website: "Live-site crawl + live browser — deployed tracking, structure, resource weight, conversion readiness",
};

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  critical: "Critical",
  medium: "Medium",
  low: "Low",
};

const SEVERITY_COLOR: Record<FindingSeverity, string> = {
  critical: CRITICAL,
  medium: MEDIUM,
  low: ACCENT,
};

const SEVERITY_ICON: Record<FindingSeverity, string> = {
  critical: "warning.png",
  medium: "info.png",
  low: "check.png",
};

const DATA_SOURCE_LABEL: Record<string, string> = {
  live: "Live data",
  detection: "Detected",
  public: "Public data",
};

// Slug used for the tab radio/label/panel id triplet — fixed, not derived
// from CATEGORY_LABELS, since it has to be a valid HTML id fragment.
const TAB_SLUG: Record<CategoryKey, string> = {
  GA4: "ga4",
  GTM: "gtm",
  Website: "website",
};

// ---- Arabic (MSA) counterparts of every EN/AR chrome dictionary above.
// Per-finding text (the actual audit findings) is translated separately, per
// audit, by translate-ar.ts — this is only the static report scaffolding
// that's identical on every run, so it's hand-written once here rather than
// asked of Claude on every request.
const CATEGORY_LABELS_AR: Record<CategoryKey, string> = {
  GA4: "تحليلات جوجل 4 (GA4)",
  GTM: "مدير علامات جوجل (GTM)",
  Website: "الموقع الإلكتروني وتحسين التحويل",
};

const CATEGORY_CAPTION_AR: Record<CategoryKey, string> = {
  GA4: "طبقة القياس — الأحداث الرئيسية، التحويلات، بيانات الجمهور",
  GTM: "نشر الحاوية — العلامات، المحفِّزات، تفعيل بيكسل التتبع",
  Website: "زحف مباشر للموقع + متصفح حقيقي — التتبع المنشور فعليًا، بنية الموقع، حجم الموارد، جاهزية التحويل",
};

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Bilingual inline text: both an English and an Arabic copy of the same
 * static UI string, wrapped as siblings so the EN/AR toggle (#i18n-en /
 * #i18n-ar, see renderReport's CSS) can show exactly one of them. Always
 * inline (span) — the surrounding tag (h1, p, li, button label, ...) already
 * establishes whatever block/heading context is needed, so this never has
 * to branch on element type the way the business/technical register toggle
 * does for the findings themselves (checklistRows renders those directly as
 * h3/p/span because THAT toggle needs a different display value per tag).
 * `dir="rtl"` is a static attribute on the Arabic copy regardless of which
 * language is currently selected — it's inert while hidden, and means the
 * Arabic run is never dependent on JavaScript to get correct bidi text
 * rendering once shown.
 */
function bi(en: string, ar: string): string {
  return `<span class="i18n-en">${escapeHtml(en)}</span><span class="i18n-ar" dir="rtl">${escapeHtml(ar)}</span>`;
}

/**
 * Same as `bi`, but for a fragment that's already-safe HTML on one or both
 * sides (e.g. a string built from other escaped pieces) — used the few
 * places a bilingual string has to carry a nested tag (a <strong>, a
 * cross-reference) rather than plain text. Callers are responsible for
 * escaping any interpolated user data themselves before calling this.
 */
function biHtml(enHtml: string, arHtml: string): string {
  return `<span class="i18n-en">${enHtml}</span><span class="i18n-ar" dir="rtl">${arHtml}</span>`;
}

// Arabic-numeral-noun agreement for "check(s)" (بند) is genuinely irregular
// (singular/dual/plural-genitive/singular-accusative all differ), so this
// picks the grammatically correct form rather than always pluralizing —
// unlike English checksLabel below, which only ever has two forms.
function arChecksNoun(n: number): string {
  if (n === 1) return "بند";
  if (n === 2) return "بندان";
  if (n >= 3 && n <= 10) return "بنود";
  return "بندًا";
}

/**
 * Device-framed mockup of the audited site: the desktop screenshot in a
 * browser chrome, the mobile one in a phone bezel, side by side directly
 * under the hero meta.
 *
 * Sits across both hero-grid columns rather than inside the left one — a
 * 1440px-wide screenshot squeezed into half a column reads as a thumbnail,
 * not a mockup. Reading order is still immediately after .hero-meta.
 *
 * Renders nothing at all when neither screenshot came back (screenshots.ts
 * is best-effort: no browser on the machine, or a page that wouldn't load),
 * and renders just the one it has when only one succeeded. An empty frame
 * would look like a broken report, which is worse than no mockup.
 */
function deviceMockupHtml(result: AuditResult): string {
  const shots = result.screenshots;
  if (!shots?.desktop && !shots?.mobile) return "";

  // Host only — the frame is a browser chrome, and a full URL with protocol
  // and path in a fake address bar reads as clutter.
  let host = result.websiteUrl;
  try {
    host = new URL(result.websiteUrl).host.replace(/^www\./, "");
  } catch {
    // Leave it as-is; the audit validated this URL upstream, so this is
    // belt-and-braces rather than an expected branch.
  }

  const desktop = shots?.desktop
    ? `
        <figure class="device device-desktop reveal" style="--d:0ms">
          <div class="device-chrome">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            <span class="device-url">${escapeHtml(host)}</span>
          </div>
          <div class="device-screen"><img src="${shots.desktop}" alt="Desktop view of ${escapeHtml(host)}" loading="lazy" /></div>
          <figcaption>${bi("Desktop · 1440×900", "سطح المكتب · 1440×900")}</figcaption>
        </figure>`
    : "";

  const mobile = shots?.mobile
    ? `
        <figure class="device device-mobile reveal" style="--d:90ms">
          <div class="device-bezel">
            <span class="device-notch"></span>
            <div class="device-screen"><img src="${shots.mobile}" alt="Mobile view of ${escapeHtml(host)}" loading="lazy" /></div>
          </div>
          <figcaption>${bi("Mobile · 390×844", "الموبايل · 390×844")}</figcaption>
        </figure>`
    : "";

  return `
      <div class="device-mockup">
        <p class="device-mockup-label">${bi("What visitors actually see, above the fold", "ما يراه الزوار فعليًا، في الجزء المرئي الأول من الصفحة")}</p>
        <div class="device-mockup-row">${desktop}${mobile}</div>
      </div>`;
}

function scoreColor(score: number): string {
  if (score >= 75) return ACCENT;
  if (score >= 50) return MEDIUM;
  return "#FF8979";
}

function letterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// "1 check" vs "13 checks" — not a weighted point scale, a flat count of
// checks (see scoring.ts), so this only ever fires singular for a lone-item
// category.
function checksLabel(value: number): string {
  return value === 1 ? "check" : "checks";
}

// The literal tally behind a category's checks-passed figure — "21 of 25
// checks passed" — so it's always traceable back to an exact, auditable
// count instead of reading as an abstract percentage. `tally.evaluated` is
// hard-guaranteed equal to `tally.total` by audit-prompt.ts's
// computeCategoryResult (no "skipped/not evaluable" bucket any more), so
// this only ever needs `total`, not `evaluated` — kept as a plain reference
// to `tally.total` for a single fewer moving part in this function.
function checklistTallyLabel(tally: CategoryResult["checklistTally"]): string {
  return `${tally.passed} of ${tally.total} check${tally.total === 1 ? "" : "s"} passed`;
}

function checklistTallyLabelAr(tally: CategoryResult["checklistTally"]): string {
  return `${tally.passed} من ${tally.total} ${arChecksNoun(tally.total)} تم تجاوزها بنجاح`;
}

function severityCounts(result: AuditResult) {
  let critical = 0;
  let medium = 0;
  let low = 0;
  for (const cat of result.categories) {
    for (const finding of cat.findings) {
      if (finding.severity === "critical") critical++;
      if (finding.severity === "medium") medium++;
      if (finding.severity === "low") low++;
    }
  }
  return { critical, medium, low, total: critical + medium + low };
}

async function dataUri(relativePath: string, mime: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:${mime};base64,${file.toString("base64")}`;
}

async function fontFaceUri(relativePath: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:font/ttf;base64,${file.toString("base64")}`;
}

async function brandAssets() {
  // No tiled/repeating pattern asset any more — the ambient background is
  // pure CSS (gradient glow + hairline grid), see .page::before/::after.
  // pattern-bg-blackforest.png is intentionally not loaded here.
  const [wordmark, icon, fontRegular, fontSemiBold, fontBold, arFontRegular, arFontSemiBold, arFontBold, ...categoryIcons] = await Promise.all([
    dataUri("wordmark-white-trim.png", "image/png"),
    dataUri("icon-white-trim.png", "image/png"),
    fontFaceUri("Sora-Regular.ttf"),
    fontFaceUri("Sora-SemiBold.ttf"),
    fontFaceUri("Sora-Bold.ttf"),
    // Sora has no Arabic glyphs — Noto Sans Arabic is the main site's own
    // choice for Arabic (src/styles/fonts.css), pulled in here rather than
    // loaded from Google Fonts so the report stays one self-contained file.
    fontFaceUri("NotoSansArabic-Regular.ttf"),
    fontFaceUri("NotoSansArabic-SemiBold.ttf"),
    fontFaceUri("NotoSansArabic-Bold.ttf"),
    ...(Object.keys(CATEGORY_ICON) as CategoryKey[]).map(k => dataUri(`icons/${CATEGORY_ICON[k]}`, "image/png")),
    ...(Object.keys(SEVERITY_ICON) as FindingSeverity[]).map(s => dataUri(`icons/${SEVERITY_ICON[s]}`, "image/png")),
  ]);

  const categoryKeys = Object.keys(CATEGORY_ICON) as CategoryKey[];
  const severityKeys = Object.keys(SEVERITY_ICON) as FindingSeverity[];
  const categoryIconMap = Object.fromEntries(categoryKeys.map((k, i) => [k, categoryIcons[i]])) as Record<CategoryKey, string>;
  const severityIconMap = Object.fromEntries(severityKeys.map((s, i) => [s, categoryIcons[categoryKeys.length + i]])) as Record<FindingSeverity, string>;

  return { wordmark, icon, fontRegular, fontSemiBold, fontBold, arFontRegular, arFontSemiBold, arFontBold, categoryIconMap, severityIconMap };
}

type BrandAssets = Awaited<ReturnType<typeof brandAssets>>;

// The single real content-mechanic worth visualizing structurally (per
// "structure is information," not decoration): each included category's
// share of this run's checklist IS how the audit was actually scored, so
// it's rendered as literal proportional segments sized by checklistTally.
// Only the categories that actually ran this audit appear here — the three
// routes (scoring.ts's countedCategories) never overlap, so there's no
// "missing" category to redistribute around any more.
function weightStrip(result: AuditResult): string {
  const total = result.possiblePoints;

  const segments = result.categories.map(cat => {
    const pct = total > 0 ? (cat.checklistTally.evaluated / total) * 100 : 0;
    const color = scoreColor(cat.score);
    return `<div class="weight-seg" style="--w:${pct};--c:${color}" title="${escapeHtml(CATEGORY_LABELS[cat.category])}: ${cat.checklistTally.evaluated} ${checksLabel(cat.checklistTally.evaluated)}"></div>`;
  }).join("");

  const legend = result.categories.map(cat => `
      <label class="weight-legend-item" for="tab-${TAB_SLUG[cat.category]}">
        <span class="dot" style="--c:${scoreColor(cat.score)}"></span>
        <span class="name">${biHtml(escapeHtml(CATEGORY_LABELS[cat.category]), escapeHtml(CATEGORY_LABELS_AR[cat.category]))}</span>
        <span class="value">${cat.checklistTally.passed} / ${cat.checklistTally.evaluated} ${biHtml(escapeHtml(checksLabel(cat.checklistTally.evaluated)), escapeHtml(arChecksNoun(cat.checklistTally.evaluated)))}</span>
      </label>`).join("");

  return `
    <section class="weight-band">
      <div class="wrap">
        <div class="weight-panel reveal">
          <p class="eyebrow">${biHtml(`How this ${total}-check audit is built`, `كيف يُبنى هذا التدقيق المكوَّن من ${total} ${arChecksNoun(total)}`)}</p>
          <div class="weight-strip">${segments}</div>
          <div class="weight-legend">${legend}</div>
        </div>
      </div>
    </section>`;
}

// "Website" is the only category whose checklist size varies by route — the
// full 50-item WEBSITE_CHECKLIST when the visitor has neither GA4 nor GTM,
// or the curated 25-item WEBSITE_CODE_CHECKLIST when they have exactly one
// (see checklist.ts's own doc comment and scoring.ts's countedCategories).
// `checklistTally.total` already reflects which one actually ran this audit
// (audit-prompt.ts's computeCategoryResult sets it from the real checklist
// array's length), so it's used here to pick the matching array back up for
// display — no separate route flag needs to be threaded through.
function checklistForDisplay(category: CategoryKey, total: number): ChecklistPoint[] {
  if (category === "GA4") return GA4_CHECKLIST;
  if (category === "GTM") return GTM_CHECKLIST;
  return total === WEBSITE_CODE_CHECKLIST.length ? WEBSITE_CODE_CHECKLIST : WEBSITE_CHECKLIST;
}

// Every single check in this category's checklist gets its own row, in
// checklist order — not just the broken ones. A prior version of this
// report only ever rendered `cat.findings` (i.e. only what failed), so a
// category with 16 of 25 checks passing only ever showed the 9 broken
// ones — a real, working check that passed was invisible anywhere in the
// report, with nothing to show for the other 16 beyond an aggregate number.
//
// 2026-09-06: passed rows used to fall back to checklist.ts's own static
// expectedState/commonFailure text — generic scaffolding written once per
// checklist point, not this run's actual result. Most visible (and most
// wrong) on the open GA4-D slots, whose placeholder text literally reads
// "No fixed expected state — see ... in audit-prompt.ts" — internal
// dev-facing text that was leaking straight into the client-facing report.
// Every point now gets a real, Claude-written finding regardless of outcome
// (see types.ts's FindingStatus doc comment and audit-prompt.ts's "no
// implicit pass" instruction), so BOTH branches below render the finding's
// own `issue`/`businessImpact` text — never checklist.ts's static fields.
// The `??` fallbacks only cover a finding that's missing outright (a
// hand-built fixture like preview-report.ts that doesn't bother covering
// every point, or a real gap computeCategoryResult already logs a warning
// for) — even then, never checklist.ts's expectedState/commonFailure.
function checklistRows(cat: CategoryResult, checklist: ChecklistPoint[], assets: BrandAssets): string {
  const findingsById = new Map(cat.findings.map(f => [f.checklistId, f]));

  const rows = checklist
    .map((point, index) => {
      const idx = String(index + 1).padStart(2, "0");
      const finding = findingsById.get(point.id);
      const status = finding?.status ?? "pass";

      if (status === "fail" && finding) {
        // Arabic falls back to the English text per-field when translate-ar.ts
        // didn't produce (or wasn't run for) this specific finding — never a
        // blank row just because the best-effort translation pass missed one
        // item (see types.ts's CategoryFinding.ar doc comment).
        const arBusiness = finding.ar?.business ?? finding.business;
        const arTechnical = finding.ar?.technical ?? finding.technical;
        return `
    <article class="finding finding--${finding.severity} reveal" data-status="${finding.severity}" style="--i:${index}">
      <button type="button" class="finding-toggle" aria-expanded="true">
        <div class="finding-meta">
          <span class="idx">${idx}</span>
          <span class="pill severity-pill" style="--c:${SEVERITY_COLOR[finding.severity]}">${bi(SEVERITY_LABEL[finding.severity], SEVERITY_LABEL_AR[finding.severity])}</span>
          <span class="pill">${bi(DATA_SOURCE_LABEL[finding.dataSource] ?? finding.dataSource, DATA_SOURCE_LABEL_AR[finding.dataSource] ?? finding.dataSource)}</span>
          <span class="pill checklist-id-pill">${escapeHtml(finding.checklistId)}</span>
          <span class="chevron" aria-hidden="true">⌄</span>
        </div>
        <h3 class="voice voice-business i18n-en">${escapeHtml(finding.business.summary)}</h3>
        <h3 class="voice voice-business i18n-ar" dir="rtl">${escapeHtml(arBusiness.summary)}</h3>
        <h3 class="voice voice-technical i18n-en">${escapeHtml(finding.technical.summary)}</h3>
        <h3 class="voice voice-technical i18n-ar" dir="rtl">${escapeHtml(arTechnical.summary)}</h3>
      </button>
      <div class="finding-body">
        <p class="voice voice-business i18n-en">${escapeHtml(finding.business.detail)}</p>
        <p class="voice voice-business i18n-ar" dir="rtl">${escapeHtml(arBusiness.detail)}</p>
        <p class="voice voice-technical i18n-en">${escapeHtml(finding.technical.detail)}</p>
        <p class="voice voice-technical i18n-ar" dir="rtl">${escapeHtml(arTechnical.detail)}</p>
      </div>
    </article>`;
      }

      const fallbackSummary = `${point.title} — no specific finding was reported for this check this run.`;
      const fallbackSummaryAr = `${point.title} — لم يتم تسجيل نتيجة محدَّدة لهذا البند في هذا التشغيل.`;
      const passBusiness = finding?.business ?? { summary: fallbackSummary, detail: "" };
      const passTechnical = finding?.technical ?? { summary: fallbackSummary, detail: "" };
      const passBusinessAr = finding?.ar?.business ?? (finding ? finding.business : { summary: fallbackSummaryAr, detail: "" });
      const passTechnicalAr = finding?.ar?.technical ?? (finding ? finding.technical : { summary: fallbackSummaryAr, detail: "" });
      const passSeverity = finding?.severity ?? point.severity;
      return `
    <div class="check-pass-row reveal" data-status="pass" style="--i:${index}">
      <button type="button" class="check-pass-toggle" aria-expanded="false">
        <span class="idx">${idx}</span>
        <span class="check-icon"><img src="${assets.severityIconMap.low}" alt="" width="12" height="12" /></span>
        <span class="check-id">${escapeHtml(point.id)}</span>
        <span class="check-title voice voice-business i18n-en">${escapeHtml(passBusiness.summary)}</span>
        <span class="check-title voice voice-business i18n-ar" dir="rtl">${escapeHtml(passBusinessAr.summary)}</span>
        <span class="check-title voice voice-technical i18n-en">${escapeHtml(passTechnical.summary)}</span>
        <span class="check-title voice voice-technical i18n-ar" dir="rtl">${escapeHtml(passTechnicalAr.summary)}</span>
        <span class="pill pass-pill">${bi("Passed", "ناجح")}</span>
        <span class="chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="check-pass-body">
        ${passBusiness.detail ? `<p class="voice voice-business i18n-en">${escapeHtml(passBusiness.detail)}</p>` : ""}
        ${passBusinessAr.detail ? `<p class="voice voice-business i18n-ar" dir="rtl">${escapeHtml(passBusinessAr.detail)}</p>` : ""}
        ${passTechnical.detail ? `<p class="voice voice-technical i18n-en">${escapeHtml(passTechnical.detail)}</p>` : ""}
        ${passTechnicalAr.detail ? `<p class="voice voice-technical i18n-ar" dir="rtl">${escapeHtml(passTechnicalAr.detail)}</p>` : ""}
        <p class="check-pass-severity"><span class="pill severity-pill" style="--c:${SEVERITY_COLOR[passSeverity]}">${bi(`${SEVERITY_LABEL[passSeverity]} if failed`, `${SEVERITY_LABEL_AR[passSeverity]} إذا فشل هذا البند`)}</span></p>
      </div>
    </div>`;
    })
    .join("");

  return `<div class="findings-grid">${rows}</div>`;
}

// Search box + status dropdown rendered above a category's checklist rows —
// filtered client-side (script block near the end of the document) by each
// row's data-status attribute (severity, or "pass") and its text content.
// No server round-trip: this is a static, already-generated file.
function filterBarHtml(): string {
  return `
    <div class="filter-bar">
      <input type="search" class="filter-search i18n-en" placeholder="Search checks…" aria-label="Search checks in this category" />
      <input type="search" class="filter-search i18n-ar" dir="rtl" placeholder="ابحث في البنود…" aria-label="ابحث في بنود هذه الفئة" />
      <select class="filter-select i18n-en" aria-label="Filter checks by status">
        <option value="all">All checks</option>
        <option value="critical">Critical only</option>
        <option value="medium">Medium only</option>
        <option value="low">Low only</option>
        <option value="pass">Passed only</option>
      </select>
      <select class="filter-select i18n-ar" dir="rtl" aria-label="تصفية البنود حسب الحالة">
        <option value="all">جميع البنود</option>
        <option value="critical">الحرجة فقط</option>
        <option value="medium">المتوسطة فقط</option>
        <option value="low">المنخفضة فقط</option>
        <option value="pass">الناجحة فقط</option>
      </select>
    </div>
    <p class="filter-empty i18n-en" hidden>No checks match your search.</p>
    <p class="filter-empty i18n-ar" dir="rtl" hidden>لا توجد بنود مطابقة لبحثك.</p>`;
}

// The pages the audit actually looked at (AuditResult.discoveredPages —
// discover-pages.ts's homepage-plus-one-per-commerce-type pick). Rendered
// under the Website section so the reader can see the audit wasn't just a
// homepage glance: the browser checks for cart/checkout (WEB-54/56) and a
// product page (WEB-55) navigate to these exact URLs. Replaces the much
// heavier per-page Lighthouse detail the removed PageSpeed tab used to
// render for the same page list.
function pagesCoveredHtml(pages: string[]): string {
  if (pages.length === 0) return "";
  const items = pages.map(u => `<li>${escapeHtml(u)}</li>`).join("");
  return `
    <div class="pages-covered reveal">
      <h3 class="subhead">${bi("Pages covered this audit", "الصفحات التي شملها هذا التدقيق")}</h3>
      <p class="subhead-caption">${bi(
        "Picked deterministically from the site's own sitemap (or its homepage links) — the homepage plus one representative page per commerce-relevant type.",
        "يتم اختيارها بشكل ثابت من خريطة الموقع نفسها (أو روابط الصفحة الرئيسية) — الصفحة الرئيسية بالإضافة إلى صفحة واحدة تمثيلية لكل نوع ذي صلة بالتجارة الإلكترونية.",
      )}</p>
      <ul class="page-list">${items}</ul>
    </div>`;
}

// Why a category didn't run this audit. THREE possible routes (see
// scoring.ts's countedCategories): GA4+GTM together (both connected),
// exactly one tracking tool + Website (a real website-code audit fills the
// other 25 checks instead of guessing about the unpicked tool), or Website
// alone (neither connected). Each route leaves a different, specific
// category missing — worth naming which one and why, not one generic
// message.
function pathNotRunReason(key: CategoryKey, result: AuditResult): string {
  const included = new Set(result.categories.map(c => c.category));
  const hasGa4 = included.has("GA4");
  const hasGtm = included.has("GTM");
  const hasWebsiteRoute = included.has("Website");

  if (key === "Website") {
    return hasGa4 && hasGtm
      ? "This audit ran the GA4 + GTM path — the visitor had both connected, so a separate website-code audit wasn't needed this run."
      : "This category wasn't run this audit.";
  }

  // key is GA4 or GTM here.
  const otherTool: CategoryKey = key === "GA4" ? "GTM" : "GA4";
  if (included.has(otherTool) && hasWebsiteRoute) {
    return `The visitor had ${CATEGORY_LABELS[otherTool]} but not ${CATEGORY_LABELS[key]}, so this run paired ${CATEGORY_LABELS[otherTool]} with a real website-code audit for the other 25 checks instead of guessing about ${CATEGORY_LABELS[key]} — see the Website & CRO tab.`;
  }
  if (hasWebsiteRoute) {
    return "This audit ran the full website-code path instead — the visitor didn't have GA4 or GTM connected.";
  }
  return `${CATEGORY_LABELS[key]} is normally evaluated alongside ${CATEGORY_LABELS[otherTool]} on this path — it's missing from this specific run's response, which shouldn't normally happen.`;
}

// Arabic counterpart of pathNotRunReason above — same four routes, kept as
// a separate function rather than a lookup table because each sentence
// interpolates which category is missing and which one it's paired with.
function pathNotRunReasonAr(key: CategoryKey, result: AuditResult): string {
  const included = new Set(result.categories.map(c => c.category));
  const hasGa4 = included.has("GA4");
  const hasGtm = included.has("GTM");
  const hasWebsiteRoute = included.has("Website");

  if (key === "Website") {
    return hasGa4 && hasGtm
      ? "اعتمد هذا التدقيق على مسار GA4 + GTM — إذ كان لدى الزائر كلا الأداتين متصلتين، فلم تكن هناك حاجة لتدقيق منفصل لكود الموقع في هذا التشغيل."
      : "لم يتم تشغيل هذه الفئة في هذا التدقيق.";
  }

  const otherTool: CategoryKey = key === "GA4" ? "GTM" : "GA4";
  if (included.has(otherTool) && hasWebsiteRoute) {
    return `كان لدى الزائر ${CATEGORY_LABELS_AR[otherTool]} ولكن دون ${CATEGORY_LABELS_AR[key]}، فقام هذا التشغيل بدمج ${CATEGORY_LABELS_AR[otherTool]} مع تدقيق حقيقي لكود الموقع للبنود الـ25 المتبقية عِوضًا عن التخمين بشأن ${CATEGORY_LABELS_AR[key]} — راجع تبويب الموقع وتحسين التحويل.`;
  }
  if (hasWebsiteRoute) {
    return "اعتمد هذا التدقيق مسار كود الموقع الكامل بدلاً من ذلك — لم يكن لدى الزائر GA4 أو GTM متصلين.";
  }
  return `تُقيَّم ${CATEGORY_LABELS_AR[key]} عادةً جنبًا إلى جنب مع ${CATEGORY_LABELS_AR[otherTool]} على هذا المسار — وهي غائبة عن استجابة هذا التشغيل بالتحديد، وهو أمر لا ينبغي حدوثه عادةً.`;
}

function categorySection(key: CategoryKey, result: AuditResult, assets: BrandAssets, extraHtml: string = ""): string {
  const cat = result.categories.find(c => c.category === key);

  if (!cat) {
    return `
      <section class="report-section is-missing" id="${key}">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="icon-circle"><img src="${assets.categoryIconMap[key]}" alt="" width="20" height="20" /></span>
            <div>
              <p class="section-caption">${biHtml(escapeHtml(CATEGORY_CAPTION[key]), escapeHtml(CATEGORY_CAPTION_AR[key]))}</p>
              <h2>${biHtml(escapeHtml(CATEGORY_LABELS[key]), escapeHtml(CATEGORY_LABELS_AR[key]))}</h2>
            </div>
          </div>
          <span class="pill not-run-pill">${bi("Not part of this audit", "لم يُدرَج في هذا التدقيق")}</span>
        </div>
        <div class="not-run-row reveal">
          <p class="i18n-en">${escapeHtml(pathNotRunReason(key, result))}</p>
          <p class="i18n-ar" dir="rtl">${escapeHtml(pathNotRunReasonAr(key, result))}</p>
        </div>
        ${extraHtml}
      </section>`;
  }

  return `
    <section class="report-section" id="${key}">
      <div class="section-head reveal">
        <div class="section-head-left">
          <span class="icon-circle"><img src="${assets.categoryIconMap[key]}" alt="" width="20" height="20" /></span>
          <div>
            <p class="section-caption">${biHtml(
              `${escapeHtml(CATEGORY_CAPTION[key])} · ${cat.checklistTally.evaluated} checklist ${cat.checklistTally.evaluated === 1 ? "item" : "items"}`,
              `${escapeHtml(CATEGORY_CAPTION_AR[key])} · ${cat.checklistTally.evaluated} ${arChecksNoun(cat.checklistTally.evaluated)} من قائمة التحقق`,
            )}</p>
            <h2>${biHtml(escapeHtml(CATEGORY_LABELS[key]), escapeHtml(CATEGORY_LABELS_AR[key]))}</h2>
          </div>
        </div>
        <div class="section-score">
          <strong style="color:${scoreColor(cat.score)}">${cat.checklistTally.passed}</strong><span>/ ${cat.checklistTally.evaluated} ${biHtml(escapeHtml(checksLabel(cat.checklistTally.evaluated)), escapeHtml(arChecksNoun(cat.checklistTally.evaluated)))}</span>
          <p class="section-tally">${biHtml(escapeHtml(checklistTallyLabel(cat.checklistTally)), escapeHtml(checklistTallyLabelAr(cat.checklistTally)))}</p>
        </div>
      </div>
      <div class="section-bar reveal"><div class="section-bar-fill" style="--w:${cat.score};--c:${scoreColor(cat.score)}"></div></div>
      ${filterBarHtml()}
      ${checklistRows(cat, checklistForDisplay(key, cat.checklistTally.total), assets)}
      ${extraHtml}
    </section>`;
}

// Radio-driven tabs — CSS-only, no <script> needed (more robust for a
// static file with no build step than a JS-driven implementation: works
// even with JS disabled, nothing to error out). Each category gets a fixed
// radio/label/panel id triplet via TAB_SLUG; GA4 opens by default. The tab
// bar mirrors the site's own Stepper pattern for a many-items-in-a-row
// problem (src/styles/responsive.css's [data-name="Stepper"] rules) —
// overflow-x:auto + flex-wrap:nowrap so it scrolls horizontally on mobile
// instead of wrapping or cramming, rather than reintroducing page-level
// horizontal overflow.
function renderTabs(result: AuditResult, assets: BrandAssets): string {
  const keys = Object.keys(CATEGORY_LABELS) as CategoryKey[];

  const radios = keys.map((k, i) => `<input type="radio" name="report-tab" id="tab-${TAB_SLUG[k]}" class="tab-radio"${i === 0 ? " checked" : ""} />`).join("");

  const tabBtns = keys
    .map(k => {
      const cat = result.categories.find(c => c.category === k);
      const dotColor = cat ? scoreColor(cat.score) : MUTED;
      return `
      <label for="tab-${TAB_SLUG[k]}" class="tab-btn" id="tabbtn-${TAB_SLUG[k]}" role="tab">
        <img class="tab-icon" src="${assets.categoryIconMap[k]}" alt="" width="16" height="16" />
        <span>${biHtml(escapeHtml(CATEGORY_LABELS[k]), escapeHtml(CATEGORY_LABELS_AR[k]))}</span>
        <span class="tab-dot" style="--c:${dotColor}"></span>
      </label>`;
    })
    .join("");

  const panels = keys
    .map(k => `<div class="tab-panel" id="panel-${TAB_SLUG[k]}">${categorySection(k, result, assets, k === "Website" ? pagesCoveredHtml(result.discoveredPages) : "")}</div>`)
    .join("");

  return `
    <div class="tabs">
      ${radios}
      <div class="lang-switch reveal">
        <div class="lang-switch-label">${bi("Reading this as", "أنت تقرأ هذا التقرير بصيغة")}</div>
        <div class="lang-switch-buttons">
          <label for="lang-business" class="lang-btn" id="langbtn-business">${bi("Business impact", "الأثر على الأعمال")}</label>
          <label for="lang-technical" class="lang-btn" id="langbtn-technical">${bi("Technical detail", "التفاصيل التقنية")}</label>
        </div>
        <p class="lang-switch-note voice voice-business i18n-en">Every check below, in plain language: what it means and what it costs or protects.</p>
        <p class="lang-switch-note voice voice-business i18n-ar" dir="rtl">كل بند أدناه، بلغة مبسّطة: ماذا يعني، وما الذي يُكلِّفه أو يحميه.</p>
        <p class="lang-switch-note voice voice-technical i18n-en">Every check below, as configuration and data: the exact values found, and the mechanism behind them.</p>
        <p class="lang-switch-note voice voice-technical i18n-ar" dir="rtl">كل بند أدناه، كإعدادات وبيانات: القيم الدقيقة التي تم رصدها، والآلية التي تقف خلفها.</p>
      </div>
      <div class="tab-bar reveal" role="tablist">${tabBtns}</div>
      <div class="tab-panels">${panels}</div>
    </div>`;
}

function fontFace(family: string, weight: number, uri: string): string {
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:swap;src:url("${uri}") format("truetype");}`;
}

async function renderReport(result: AuditResult): Promise<string> {
  const assets = await brandAssets();
  const counts = severityCounts(result);
  const contactUrl = `${SITE_URL.replace(/\/$/, "")}/#contact`;
  const generatedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  // Arabic month name, Latin digits for the year/day — matches how Arabic
  // technical/business writing conventionally keeps numerals (see
  // translate-ar.ts's own prompt instruction for the same rule inside
  // findings text), rather than switching to Arabic-Indic digits mid-report.
  const generatedAtAr = new Date().toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric", numberingSystem: "latn" });

  const verdict = counts.critical > 0
    ? `${counts.critical} critical issue${counts.critical === 1 ? "" : "s"} ${counts.critical === 1 ? "is" : "are"} actively costing revenue right now.`
    : counts.total > 0
      ? `${counts.total} opportunit${counts.total === 1 ? "y" : "ies"} to tighten up, nothing on fire.`
      : `Strong foundation — no material issues found this run.`;

  const verdictAr = counts.critical > 0
    ? (counts.critical === 1 ? "توجد مشكلة حرجة واحدة تُكلِّف الإيراد فعليًا الآن." : `توجد ${counts.critical} مشكلة حرجة تُكلِّف الإيراد فعليًا الآن.`)
    : counts.total > 0
      ? (counts.total === 1 ? "توجد فرصة واحدة للتحسين، ولا يوجد ما يستدعي القلق." : `توجد ${counts.total} فرصة للتحسين، ولا يوجد ما يستدعي القلق.`)
      : "أساس قوي — لم يتم رصد مشكلات جوهرية في هذا التشغيل.";

  const tabsHtml = renderTabs(result, assets);
  // Proper noun (business name) or a bare URL either way — never translated.
  const attributedTo = escapeHtml(result.businessName || result.websiteUrl);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- Sets html.js before body ever paints, so the .reveal/entrance CSS below
     (scoped under html.js) never causes a flash of visible-then-hidden
     content — same reasoning as Modernizr's classic no-js/js swap. Without
     JavaScript this line never runs, the class never appears, and every
     .reveal rule below simply doesn't match — content stays at its normal
     static opacity, not permanently hidden. -->
<script>document.documentElement.className += " js";</script>
<title>${escapeHtml(result.businessName ? `${result.businessName} — Audit Report` : "Optimizers Audit Report")}</title>
<style>
${fontFace("Sora", 400, assets.fontRegular)}
${fontFace("Sora", 600, assets.fontSemiBold)}
${fontFace("Sora", 700, assets.fontBold)}
${fontFace("Noto Sans Arabic", 400, assets.arFontRegular)}
${fontFace("Noto Sans Arabic", 600, assets.arFontSemiBold)}
${fontFace("Noto Sans Arabic", 700, assets.arFontBold)}

:root{
  color-scheme:dark;
  --forest:${BLACK_FOREST}; --stone:${BIG_STONE}; --stone-raised:${STONE_RAISED};
  --green:${ACCENT}; --ink:${INK}; --muted:${MUTED}; --hairline:${HAIRLINE};
  --crit:${CRITICAL}; --med:${MEDIUM};
  --r-sm:10px; --r-md:14px; --r-lg:20px;
  --shadow-card:0 1px 0 rgba(255,255,255,.03) inset, 0 14px 32px -20px rgba(0,0,0,.65);
  --shadow-panel:0 1px 0 rgba(255,255,255,.04) inset, 0 28px 64px -28px rgba(0,0,0,.7);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0; background:var(--forest); color:var(--ink);
  font-family:'Sora',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  font-weight:400; line-height:1.6; -webkit-font-smoothing:antialiased;
}
@media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto} }
/* clip, not hidden: hidden can create a new scroll container around
   position:sticky content (the topbar); clip can't — same reasoning
   src/styles/responsive.css uses site-wide, ported here deliberately. */
html,body{overflow-x:clip; max-width:100vw}
a{color:inherit}
img{display:block; max-width:100%}
h1,h2,h3{font-weight:700; margin:0; text-wrap:balance}
.wrap{width:min(1080px,calc(100% - 40px)); margin:0 auto; min-width:0}
.page{position:relative}
/* Ambient backdrop — no repeating logo tile. Two soft, non-repeating
   brand-green glows plus a faint hairline grid that fades out by mid-page,
   all pinned to the viewport (fixed) so it reads as depth behind the
   content rather than texture printed on it. */
.page::before{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(900px 560px at 12% -8%, rgba(106,228,153,.14), transparent 62%),
    radial-gradient(760px 620px at 104% 6%, rgba(30,58,82,.55), transparent 58%),
    radial-gradient(680px 520px at 46% 108%, rgba(106,228,153,.07), transparent 62%);
}
.page::after{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(234,243,236,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(234,243,236,.05) 1px, transparent 1px);
  background-size:64px 64px;
  -webkit-mask-image:radial-gradient(ellipse 75% 55% at 50% 0%, black 25%, transparent 72%);
  mask-image:radial-gradient(ellipse 75% 55% at 50% 0%, black 25%, transparent 72%);
}
.page > *{position:relative; z-index:1}

/* ---- EN/AR language toggle ----
   #i18n-en/#i18n-ar are two more CSS-only radios (same mechanism as the
   business/technical register toggle below them): every static UI string in
   this report ships in both languages via bi()/biHtml() as sibling
   .i18n-en/.i18n-ar spans, and every finding's own text ships the same way
   via checklistRows' explicit .i18n-en/.i18n-ar elements. English is
   selected by default (#i18n-en checked) — the audit is written for the
   business owner who requested it, in whatever language the form was
   submitted in, and Arabic is one click away.

   dir="rtl" is a static attribute baked onto every .i18n-ar element already
   (see bi()) rather than toggled by JS, so correct bidi text rendering for
   Arabic never depends on script executing — only the SHOW/HIDE state and
   the whole-page direction flip below need the radio. */
.i18n-ar{display:none}
/* :not(.voice) — a .voice element (a finding's own text) is governed
   entirely by the register+language compound rules a few lines down, which
   only ever fire for the ONE matching combination and stay silent (no
   display value at all) for the other three. Without this exclusion, THIS
   generic rule would be the most specific one left standing for, say, the
   technical-register Arabic copy while business register is selected — the
   compound rules correctly have nothing to say about that combination, but
   this rule doesn't know about registers at all and would show it anyway. */
#i18n-ar:checked ~ .topbar .i18n-en,
#i18n-ar:checked ~ main .i18n-en:not(.voice){display:none}
/* display:revert (not a hardcoded "inline") — bi()/biHtml() wrap this class
   around everything from a <span> inside a pill to a standalone <p> (the
   not-run explanation, the filter's "no results" message), and revert
   restores each element's own normal tag default (inline for a span, block
   for a p, inline-block for a form control) instead of forcing every one of
   them inline. :not([hidden]) matters specifically for the "no results" p —
   it stays under the filter script's own hidden/shown control (toggled via
   the DOM "hidden" property) even while it's the active language; without
   this the language toggle's higher specificity would force it visible
   regardless of whether there's actually anything to report. */
#i18n-ar:checked ~ .topbar .i18n-ar,
#i18n-ar:checked ~ main .i18n-ar:not(.voice):not([hidden]){display:revert}
/* Mirrors the whole page: flexbox/grid main-axis order, text alignment, and
   list markers all follow the "direction" property per spec, so this one
   line does most of the RTL work — the handful of remaining physical left/right
   declarations elsewhere in this file are written as logical properties
   (margin-inline-*, border-inline-*, text-align:start/end) specifically so
   they follow along without a second, RTL-only override block. */
#i18n-ar:checked ~ .topbar,
#i18n-ar:checked ~ main{
  direction:rtl;
  font-family:'Noto Sans Arabic','Sora',-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,sans-serif;
}
/* The findings' own register toggle (#lang-business/#lang-technical) still
   decides WHICH voice shows; this only adds the second axis (which
   LANGUAGE that voice is in) on top — see checklistRows and the
   lang-switch-note rows in renderTabs, which are the only three tag types
   (h3/p/span) this combination needs to cover. */
#lang-business:checked ~ #i18n-en:checked ~ main h3.voice-business.i18n-en,
#lang-business:checked ~ #i18n-en:checked ~ main p.voice-business.i18n-en,
#lang-technical:checked ~ #i18n-en:checked ~ main h3.voice-technical.i18n-en,
#lang-technical:checked ~ #i18n-en:checked ~ main p.voice-technical.i18n-en,
#lang-business:checked ~ #i18n-ar:checked ~ main h3.voice-business.i18n-ar,
#lang-business:checked ~ #i18n-ar:checked ~ main p.voice-business.i18n-ar,
#lang-technical:checked ~ #i18n-ar:checked ~ main h3.voice-technical.i18n-ar,
#lang-technical:checked ~ #i18n-ar:checked ~ main p.voice-technical.i18n-ar
{display:block}
#lang-business:checked ~ #i18n-en:checked ~ main span.voice-business.i18n-en,
#lang-technical:checked ~ #i18n-en:checked ~ main span.voice-technical.i18n-en,
#lang-business:checked ~ #i18n-ar:checked ~ main span.voice-business.i18n-ar,
#lang-technical:checked ~ #i18n-ar:checked ~ main span.voice-technical.i18n-ar
{display:inline}
.i18n-toggle{display:inline-flex; gap:4px; background:rgba(234,243,236,.05); border:1px solid var(--hairline); border-radius:999px; padding:4px; flex-shrink:0}
.i18n-toggle-btn{display:inline-flex; align-items:center; cursor:pointer; user-select:none; padding:7px 13px; border-radius:999px; font-size:12.5px; font-weight:700; color:var(--muted)}
.i18n-toggle-btn:hover{color:var(--ink)}
#i18n-en:checked ~ .topbar #i18n-btn-en,
#i18n-ar:checked ~ .topbar #i18n-btn-ar{background:var(--green); color:var(--forest)}

/* ---- top bar ---- */
.topbar{border-bottom:1px solid var(--hairline); position:sticky; top:0; z-index:40; backdrop-filter:blur(8px); background:rgba(2,6,1,.86)}
.topbar-inner{display:flex; align-items:center; justify-content:space-between; padding:16px 0}
.brand{display:flex; align-items:center; gap:10px; text-decoration:none}
.brand img{height:20px; width:auto}
.topbar-links{display:flex; align-items:center; gap:18px}
.nav-link{color:var(--muted); font-size:13px; text-decoration:none}
.nav-link:hover{color:var(--ink)}
.topbar-cta{
  display:inline-flex; align-items:center; gap:8px; background:var(--green); color:var(--forest);
  font-weight:700; font-size:13px; text-decoration:none; padding:10px 16px; border-radius:999px; white-space:nowrap;
}
.topbar-cta:hover{filter:brightness(.94)}

/* ---- hero ---- */
.hero{padding:72px 0 44px}
.hero-grid{display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:48px; align-items:start}
.hero-grid > div{min-width:0}
.eyebrow{color:var(--green); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.09em; margin:0 0 16px}
.hero h1{font-size:clamp(32px,4.6vw,50px); line-height:1.04; margin:0 0 18px; overflow-wrap:break-word; letter-spacing:-.01em}
.hero p{max-width:62ch; color:var(--muted); font-size:16px; margin:0; overflow-wrap:break-word}
.hero-meta{display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; font-size:13px; color:var(--muted)}
.hero-meta span{
  min-width:0; overflow-wrap:anywhere; background:rgba(234,243,236,.045);
  border:1px solid var(--hairline); border-radius:999px; padding:7px 14px;
}
.hero-meta b{color:var(--ink); font-weight:600}

/* ---- device-framed site mockup, under the hero meta ----
   Spans both hero-grid columns (see deviceMockupHtml) so the desktop shot
   gets real width. The screenshots are inlined JPEG data URIs, same as
   every other asset in this file. */
.device-mockup{grid-column:1 / -1; margin-top:40px; padding-top:32px; border-top:1px solid var(--hairline)}
.device-mockup-label{font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin:0 0 18px}
.device-mockup-row{display:flex; flex-wrap:wrap; gap:28px; align-items:flex-end}
.device{margin:0; min-width:0}
.device figcaption{margin-top:10px; font-size:11.5px; color:var(--muted); letter-spacing:.02em}
.device-screen{overflow:hidden; background:var(--forest); line-height:0}
.device-screen img{display:block; width:100%; height:auto}

/* desktop: browser chrome with a dot bar and an address pill */
.device-desktop{flex:1 1 420px; max-width:760px}
.device-desktop .device-chrome{
  display:flex; align-items:center; gap:7px; padding:10px 14px;
  background:var(--stone-raised); border:1px solid var(--hairline); border-bottom:none;
  border-radius:var(--r-md) var(--r-md) 0 0;
}
.device-desktop .dot{width:9px; height:9px; border-radius:50%; background:rgba(234,243,236,.22); flex-shrink:0}
.device-url{
  margin-inline-start:10px; padding:3px 12px; border-radius:999px; background:rgba(2,6,1,.45);
  font-size:11px; color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.device-desktop .device-screen{
  border:1px solid var(--hairline); border-radius:0 0 var(--r-md) var(--r-md);
  box-shadow:var(--shadow-card);
}

/* mobile: phone bezel with a notch */
.device-mobile{flex:0 0 232px}
.device-mobile .device-bezel{
  position:relative; padding:12px 10px; background:var(--stone-raised);
  border:1px solid var(--hairline); border-radius:28px; box-shadow:var(--shadow-card);
}
.device-notch{
  position:absolute; top:5px; left:50%; transform:translateX(-50%);
  width:58px; height:4px; border-radius:999px; background:rgba(234,243,236,.22);
}
.device-mobile .device-screen{border-radius:18px}

@media (max-width:767px){
  .device-mockup{margin-top:32px; padding-top:24px}
  .device-mockup-row{gap:22px}
  .device-mobile{flex:1 1 200px; max-width:232px}
}
.generated-for{margin:18px 0 0; font-size:13.5px; color:var(--muted); overflow-wrap:break-word}
.generated-for strong{color:var(--ink); font-weight:700}

.score-card{
  position:relative; overflow:hidden; isolation:isolate;
  background:linear-gradient(168deg,var(--stone-raised) 0%,var(--stone) 58%,#101F2C 130%);
  border:1px solid rgba(106,228,153,.25); border-radius:var(--r-lg); padding:30px 26px;
  box-shadow:var(--shadow-panel);
}
.score-card::before{
  content:""; position:absolute; z-index:-1; top:-45%; right:-35%; width:75%; height:75%;
  background:radial-gradient(circle,rgba(106,228,153,.24),transparent 70%); pointer-events:none;
}
.score-row{display:flex; align-items:baseline; gap:8px; font-variant-numeric:tabular-nums; flex-wrap:wrap; min-width:0}
.score-num{font-size:clamp(44px,10vw,68px); line-height:1; font-weight:700; color:var(--green); letter-spacing:-.02em}
.score-den{font-size:17px; color:var(--muted)}
.score-grade{
  display:inline-block; font-size:12px; color:var(--ink); margin-top:12px; font-weight:700;
  background:rgba(106,228,153,.14); border:1px solid rgba(106,228,153,.3); border-radius:999px;
  padding:4px 12px; letter-spacing:.02em;
}
.score-verdict{font-size:13.5px; color:var(--ink); margin-top:18px; line-height:1.55; padding-top:16px; border-top:1px solid var(--hairline)}
.severity-counts{display:flex; gap:8px; margin-top:16px; font-size:11.5px; color:var(--muted); flex-wrap:wrap}
/* Direct-child combinator, not a descendant selector: each pill's own
   .i18n-en/.i18n-ar text spans (see bi()) are nested one level deeper, and
   a bare "span" descendant selector here would otherwise beat the i18n
   toggle's .i18n-ar{display:none} on specificity alone (class+type beats
   class), showing both languages' text superimposed. */
.severity-counts > span{
  display:inline-flex; align-items:center; gap:6px; background:rgba(2,6,1,.35);
  border:1px solid var(--hairline); border-radius:999px; padding:5px 10px 5px 8px;
}
.severity-counts span::before{content:""; width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0}
.severity-counts span:nth-child(1){color:var(--crit)}
.severity-counts span:nth-child(2){color:var(--med)}
.severity-counts span:nth-child(3){color:var(--green)}
.severity-counts b{color:var(--ink); font-variant-numeric:tabular-nums; font-weight:700}

/* ---- weight band ---- */
.weight-band{padding:8px 0 44px}
.weight-panel{
  background:var(--stone); border:1px solid var(--hairline); border-radius:var(--r-lg);
  padding:26px 28px; box-shadow:var(--shadow-card);
}
.weight-panel .eyebrow{margin-bottom:16px}
.weight-strip{display:flex; height:10px; border-radius:999px; overflow:hidden; background:var(--forest); margin-top:0; box-shadow:inset 0 1px 3px rgba(0,0,0,.5)}
.weight-seg{width:calc(var(--w) * 1%); background:var(--c)}
.weight-legend{display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px 20px; margin-top:20px}
.weight-legend-item{display:flex; align-items:center; gap:8px; font-size:12.5px; flex-wrap:wrap; min-width:0}
.weight-legend-item .dot{width:8px; height:8px; border-radius:50%; background:var(--c); flex-shrink:0; box-shadow:0 0 0 3px rgba(234,243,236,.07)}
.weight-legend-item .name{color:var(--ink); font-weight:600; overflow-wrap:break-word; min-width:0}
.weight-legend-item .value{color:var(--muted); font-variant-numeric:tabular-nums}
.weight-legend-item.is-missing .name,.weight-legend-item.is-missing .value{color:var(--muted); font-weight:400}

/* ---- category sections ---- */
.report-section{padding:44px 0; border-top:1px solid var(--hairline)}
.section-head{display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:20px}
.section-head-left{display:flex; align-items:flex-start; gap:16px; min-width:0}
.section-head-left > div{min-width:0}
.icon-circle{
  flex-shrink:0; width:44px; height:44px; border-radius:50%;
  background:linear-gradient(150deg,var(--stone-raised),var(--forest));
  border:1px solid var(--hairline);
  box-shadow:0 0 0 4px rgba(106,228,153,.05), var(--shadow-card);
  display:flex; align-items:center; justify-content:center;
}
.icon-circle img{width:20px; height:20px}
.section-caption{margin:0 0 5px; font-size:12px; color:var(--green); font-weight:600; text-transform:uppercase; letter-spacing:.04em; overflow-wrap:break-word}
.section-head h2{font-size:24px}
.section-score{
  font-variant-numeric:tabular-nums; white-space:nowrap; text-align:end;
  background:rgba(234,243,236,.03); border:1px solid var(--hairline); border-radius:var(--r-md);
  padding:10px 18px;
}
.section-score strong{font-size:29px; font-weight:700}
.section-score span{color:var(--muted); font-size:14px}
.section-tally{white-space:normal; overflow-wrap:break-word; margin:4px 0 0; font-size:12px; color:var(--muted); max-width:220px}
.section-bar{height:6px; border-radius:999px; background:var(--stone); margin-bottom:26px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,.5)}
.section-bar-fill{height:100%; width:calc(var(--w) * 1%); background:var(--c); border-radius:999px; box-shadow:0 0 12px -2px var(--c)}

.is-missing .section-head{margin-bottom:16px}
.not-run-pill{color:var(--muted); border-color:var(--hairline)}
.not-run-row{background:rgba(147,173,168,.06); border:1px solid var(--hairline); border-radius:var(--r-md); padding:18px 20px; color:var(--muted); font-size:14px; line-height:1.6}

.findings-grid{display:grid; gap:14px}
.finding{
  position:relative; background:var(--stone); border:1px solid var(--hairline); border-inline-start:3px solid var(--hairline);
  border-radius:var(--r-md); padding:22px 24px; box-shadow:var(--shadow-card);
}
.finding--critical{border-inline-start-color:var(--crit); background:linear-gradient(135deg,rgba(255,107,87,.09),var(--stone) 45%)}
.finding--medium{border-inline-start-color:var(--med); background:linear-gradient(135deg,rgba(242,183,94,.08),var(--stone) 45%)}
.finding--low{border-inline-start-color:var(--green); background:linear-gradient(135deg,rgba(106,228,153,.06),var(--stone) 45%)}
.finding-meta{display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px}
.finding-meta .idx{color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; margin-inline-end:2px}
.pill{border:1px solid var(--hairline); border-radius:999px; padding:4px 10px; color:var(--muted); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.02em; background:rgba(2,6,1,.2)}
.severity-pill{border-color:var(--c); color:var(--c); background:rgba(2,6,1,.25)}
.checklist-id-pill{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; letter-spacing:0; text-transform:none; font-size:10.5px}
.finding h3{font-size:17px; font-weight:600; line-height:1.4; margin:0 0 9px; overflow-wrap:break-word}
.finding p{margin:0; color:var(--muted); font-size:14.5px; line-height:1.6; overflow-wrap:break-word}

.check-pass-row{display:flex; align-items:center; gap:12px; background:rgba(106,228,153,.04); border:1px solid rgba(106,228,153,.14); border-radius:var(--r-md); padding:12px 16px}
.check-pass-row .idx{color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; flex-shrink:0}
.check-pass-row .check-icon{flex-shrink:0; width:22px; height:22px; border-radius:50%; background:rgba(106,228,153,.14); display:flex; align-items:center; justify-content:center}
.check-pass-row .check-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; color:var(--muted); flex-shrink:0}
.check-pass-row .check-title{font-size:13.5px; color:var(--ink); flex:1; min-width:0; overflow-wrap:break-word}
.pass-pill{border-color:rgba(106,228,153,.35); color:var(--green); flex-shrink:0}

/* ---- tabs ---- */
/* Radio-driven, CSS-only — no <script> needed. Each input precedes its
   sibling .tab-bar/.tab-panels, so :checked ~ reaches both. */
.tabs{margin-top:8px}
.tab-radio{position:absolute; opacity:0; width:0; height:0; pointer-events:none}
.tab-bar{
  display:flex; gap:4px; overflow-x:auto; -webkit-overflow-scrolling:touch;
  scrollbar-width:none; flex-wrap:nowrap; margin-bottom:32px;
  background:var(--stone); border:1px solid var(--hairline); border-radius:var(--r-md);
  padding:6px; box-shadow:var(--shadow-card);
}
.tab-bar::-webkit-scrollbar{display:none}
.tab-btn{
  flex-shrink:0; display:inline-flex; align-items:center; gap:8px; cursor:pointer;
  padding:11px 16px; font-size:13.5px; font-weight:600; color:var(--muted); white-space:nowrap;
  user-select:none; border-radius:calc(var(--r-md) - 4px);
}
.tab-btn:hover{color:var(--ink); background:rgba(234,243,236,.05)}
.tab-btn .tab-icon{width:16px; height:16px; opacity:.7; filter:grayscale(1)}
.tab-btn .tab-dot{width:6px; height:6px; border-radius:50%; background:var(--c); flex-shrink:0}
.tab-panel{display:none}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm,
#tab-website:checked ~ .tab-bar #tabbtn-website{
  color:var(--forest); background:var(--green); box-shadow:0 8px 20px -8px rgba(106,228,153,.55);
}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4:hover,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm:hover,
#tab-website:checked ~ .tab-bar #tabbtn-website:hover{color:var(--forest); background:var(--green)}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4 .tab-icon,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm .tab-icon,
#tab-website:checked ~ .tab-bar #tabbtn-website .tab-icon{filter:none; opacity:1}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4 .tab-dot,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm .tab-dot,
#tab-website:checked ~ .tab-bar #tabbtn-website .tab-dot{background:var(--forest); opacity:.45}
#tab-ga4:checked ~ .tab-panels #panel-ga4,
#tab-gtm:checked ~ .tab-panels #panel-gtm,
#tab-website:checked ~ .tab-panels #panel-website{display:block}
.tab-panel > .report-section{border-top:none; padding-top:4px}

/* ---- language switch: business register vs technical register ----
   Both copies of every finding are in the DOM; these rules decide which is
   visible. The display value has to be set per element type rather than
   with a single "block" — the pass-row summary is a <span> inside a flex row and
   would break the row layout if it were blockified. */
/* position:fixed, not absolute: these inputs have to live at the very top of
   <body> (before .topbar/<main>) so their CSS "~" sibling selectors above
   can reach the whole rest of the page — but that means clicking their
   <label> down in .lang-switch or the topbar's i18n toggle focuses a target
   sitting way up at the top of a long report, and every browser auto-scrolls
   a newly-focused element into view. position:absolute (the old value) put
   that target at the top of the PAGE, so focusing it scrolled all the way up
   — reported 2026-09-15 as "clicking Business/Technical jumps to the top".
   position:fixed instead pins it to the top-left of the VIEWPORT, which is
   always already on-screen at any scroll position, so there's nothing for
   the browser to scroll into view. */
.lang-radio{position:fixed; top:0; left:0; width:1px; height:1px; opacity:0; pointer-events:none}
.lang-switch{margin-bottom:18px}
.lang-switch-label{font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:8px}
.lang-switch-buttons{
  display:inline-flex; gap:4px; background:var(--stone); border:1px solid var(--hairline);
  border-radius:999px; padding:4px; box-shadow:var(--shadow-card);
}
.lang-btn{
  display:inline-flex; align-items:center; cursor:pointer; user-select:none; white-space:nowrap;
  padding:8px 16px; border-radius:999px; font-size:12.5px; font-weight:600; color:var(--muted);
}
.lang-btn:hover{color:var(--ink)}
.lang-switch-note{font-size:12.5px; color:var(--muted); margin:10px 0 0; max-width:64ch; line-height:1.6}
/* Reserve two lines so switching register does not nudge the tab bar down
   — the technical note wraps to two lines and the business one does not. */
.lang-switch-note{min-height:40px}  /* two lines at this size/line-height */

#lang-business:checked ~ main #langbtn-business,
#lang-technical:checked ~ main #langbtn-technical{
  background:var(--green); color:var(--forest); box-shadow:0 6px 16px -8px rgba(106,228,153,.55);
}

.voice{display:none}
/* The actual show/hide-by-register-and-language rules for .voice elements
   live up near the i18n toggle CSS (the #lang-*:checked ~ #i18n-*:checked
   ~ main ... block) — both axes have to be checked together now, not
   register alone, or an element would show in whichever language it
   happens to be regardless of the language toggle. */

/* ---- pages covered (under the Website tab) ---- */
.pages-covered{margin-top:36px; padding-top:28px; border-top:1px solid var(--hairline)}
.subhead{font-size:17px; margin:0 0 5px}
.subhead-caption{color:var(--muted); font-size:13px; margin:0 0 16px}
.page-list{margin:0; padding-inline-start:18px; font-size:13px; color:var(--muted); line-height:1.9}
.page-list li{overflow-wrap:anywhere}
/* ---- CTA ---- */
.cta{margin:48px 0 0; padding:64px 0}
.cta-panel{
  position:relative; overflow:hidden; background:linear-gradient(135deg,#7BEBA8,var(--green) 55%,#59CF87);
  color:var(--forest); border-radius:var(--r-lg); padding:40px; display:flex; align-items:center;
  justify-content:space-between; gap:24px; flex-wrap:wrap;
  box-shadow:0 32px 70px -30px rgba(106,228,153,.45), var(--shadow-panel);
}
.cta-panel::before{
  content:""; position:absolute; top:-60%; right:-10%; width:60%; height:220%;
  background:radial-gradient(circle,rgba(255,255,255,.28),transparent 65%); pointer-events:none;
}
.cta-panel h2{font-size:clamp(21px,4.5vw,27px); margin-bottom:8px; position:relative}
.cta-panel p{margin:0; max-width:46ch; color:rgba(2,6,1,.72); font-size:14.5px; position:relative}
.cta-panel a{
  position:relative; background:var(--forest); color:#fff; text-decoration:none; border-radius:999px; padding:15px 24px;
  font-weight:700; font-size:14px; white-space:nowrap; box-shadow:0 14px 30px -12px rgba(0,0,0,.5);
}
.cta-panel a:hover{filter:brightness(1.15)}

/* ---- footer (content/structure/links ported from src/imports/Footer.tsx,
   translated to plain HTML in this theme's own dark palette) ---- */
.site-footer{padding:56px 0 28px; border-top:1px solid var(--hairline); margin-top:48px}
.footer-grid{display:grid; grid-template-columns:1.3fr repeat(3,1fr); gap:32px; padding-bottom:32px}
.footer-col{min-width:0}
.footer-col h3{font-size:15px; margin:0 0 14px; color:var(--ink)}
.footer-col p,.footer-col a{display:block; font-size:13.5px; color:var(--muted); text-decoration:none; margin:0 0 10px; overflow-wrap:anywhere}
.footer-col a:hover{color:var(--ink)}
.footer-brand .footer-logo{display:inline-block; margin-bottom:14px}
.footer-brand .footer-logo img{height:20px; width:auto}
.footer-brand p{max-width:34ch}
.footer-service-lead{color:var(--ink); font-weight:600}
.footer-social{display:flex; gap:8px; margin-top:8px}
.footer-social-btn{
  display:flex; align-items:center; justify-content:center; width:34px; height:34px;
  border-radius:50%; background:rgba(234,243,236,.06); border:1px solid var(--hairline); flex-shrink:0; margin:0;
  font-size:12.5px; font-weight:700; color:var(--ink);
}
.footer-social-btn:hover{background:rgba(106,228,153,.14); border-color:rgba(106,228,153,.3); color:var(--green)}
.footer-bottom{border-top:1px solid var(--hairline); padding-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; color:var(--muted); font-size:12.5px}
.footer-bottom a{color:var(--muted); text-decoration:none}
.footer-bottom a:hover{color:var(--ink)}
.footer-generated{margin:0; max-width:60ch}
.footer-generated strong{color:var(--ink)}

/* Breakpoints match the main site's own system exactly (src/styles/
   responsive.css): mobile <768, tablet 768-1023, laptop 1024-1439,
   desktop 1440+ — same tiers, same rigor, not this report's own scale. */

/* ---- Tablet & below (<1024px) — same cutoff the site uses for its own
   nav/header adaptation, not full content stacking yet ---- */
@media (max-width:1023px){
  .topbar-links .nav-link{display:none}
  .weight-legend{grid-template-columns:repeat(2,1fr)}
  .hero{padding:48px 0 32px}
  .footer-grid{grid-template-columns:1fr 1fr}
}

/* ---- Mobile (<768px) — full stacking, same threshold the site stacks
   its own multi-column sections at ---- */
@media (max-width:767px){
  .wrap{width:min(1080px,calc(100% - 32px))}
  .hero{padding:32px 0 24px}
  .hero-grid{grid-template-columns:1fr; gap:24px}
  .score-card{padding:22px}
  .weight-panel{padding:20px}
  .section-head{flex-direction:column}
  .section-score{align-self:flex-start; text-align:start; padding:8px 14px}
  .section-tally{max-width:none}
  .report-section{padding:32px 0}
  .finding{padding:18px}
  .tab-bar{padding:5px}
  .tab-btn{padding:11px 14px; font-size:13px; gap:6px}
  .cta{padding:40px 0}
  .cta-panel{flex-direction:column; align-items:flex-start; padding:28px; border-radius:var(--r-md)}
  .cta-panel a{width:100%; text-align:center}
  .footer-grid{grid-template-columns:1fr; gap:28px}
  .footer-bottom{flex-direction:column; align-items:flex-start}
}

/* ---- Small mobile (<480px) — the site's own extra tier for the
   narrowest phones, same idea here: tighten what's still cramped ---- */
@media (max-width:479px){
  .hero h1{font-size:clamp(26px,8vw,36px)}
  .section-head h2{font-size:20px}
  .cta-panel h2{font-size:22px}
}

/* ---- interactive layer: filter bar, collapsible findings/pass rows,
   click-to-jump legend + severity pills — behavior wired up by the script
   block near the end of <body> ---- */
.filter-bar{display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px}
.filter-search{
  flex:1; min-width:160px; background:rgba(2,6,1,.3); border:1px solid var(--hairline); color:var(--ink);
  border-radius:999px; padding:9px 16px; font-size:13px; font-family:inherit;
}
.filter-search::placeholder{color:var(--muted)}
.filter-search:focus{outline:none; border-color:rgba(106,228,153,.5)}
.filter-select{
  background:rgba(2,6,1,.3); border:1px solid var(--hairline); color:var(--ink);
  border-radius:999px; padding:9px 16px; font-size:13px; font-family:inherit; cursor:pointer;
}
.filter-select:focus{outline:none; border-color:rgba(106,228,153,.5)}
.filter-empty{color:var(--muted); font-size:13px; padding:14px 0; margin:0}

.finding-toggle{all:unset; display:flex; flex-direction:column; width:100%; cursor:pointer; font-family:inherit; color:inherit}
.finding-toggle:focus-visible{outline:2px solid var(--green); outline-offset:4px; border-radius:10px}
.finding-meta .chevron{margin-inline-start:auto; color:var(--muted); font-size:13px; line-height:1; transition:transform .2s ease; flex-shrink:0}
.finding.is-collapsed .finding-meta .chevron{transform:rotate(-90deg)}
.finding.is-collapsed .finding-body{display:none}
.finding.flash{animation:findingFlash 1.6s ease-out}
@keyframes findingFlash{
  0%{box-shadow:0 0 0 0 rgba(106,228,153,.55)}
  70%{box-shadow:0 0 0 16px rgba(106,228,153,0)}
  100%{box-shadow:0 0 0 0 rgba(106,228,153,0)}
}

.check-pass-row{flex-direction:column; align-items:stretch; padding:0; gap:0}
.check-pass-toggle{
  all:unset; display:flex; align-items:center; gap:12px; width:100%; cursor:pointer;
  font-family:inherit; color:inherit; padding:12px 16px; box-sizing:border-box;
}
.check-pass-toggle:focus-visible{outline:2px solid var(--green); outline-offset:-2px; border-radius:var(--r-md)}
.check-pass-toggle .chevron{margin-inline-start:auto; color:var(--muted); font-size:12px; line-height:1; transition:transform .2s ease; flex-shrink:0}
.check-pass-row.is-expanded .check-pass-toggle .chevron{transform:rotate(180deg)}
.check-pass-body{display:none; padding-block:0 14px; padding-inline-start:50px; padding-inline-end:16px}
.check-pass-row.is-expanded .check-pass-body{display:block}
.check-pass-body p{margin:0; color:var(--muted); font-size:12.5px; line-height:1.6; overflow-wrap:break-word}
/* The "Low/Medium/Critical if failed" pill sits right after the visible
   detail paragraph — .check-pass-body p above resets ALL paragraph margins
   to 0 (needed so the business/technical detail pairs and their EN/AR
   copies stack with no gap when only one of each pair is shown), which left
   this pill flush against that paragraph's last line with no breathing
   room. A dedicated rule, not a tweak to the shared p{margin:0} reset, since
   only this one paragraph needs the space back. */
.check-pass-body .check-pass-severity{margin-top:12px}

.weight-legend-item{cursor:pointer}
.weight-legend-item:hover .name{color:var(--green)}

.severity-counts span[data-jump]{cursor:pointer}
.severity-counts span[data-jump]:hover{border-color:currentColor; background:rgba(2,6,1,.55)}
.severity-counts span[data-jump]:focus-visible{outline:2px solid currentColor; outline-offset:2px}

@media (max-width:767px){
  .check-pass-body{padding-inline-start:16px}
}

/* ---- motion ----
   Progressive enhancement: every .reveal rule is scoped under html.js,
   a class the very first inline script in <body> adds before anything else
   runs (see the bottom of this file). Without JavaScript — or if it's
   blocked — html.js is never added, none of these rules match, and every
   .reveal element just sits at its normal static opacity/position. Content
   is never hidden waiting on a script that might not run.

   prefers-reduced-motion turns all of it off outright, restoring the
   instant, static layout for anyone who's asked for that — same guard this
   file already applies to smooth-scroll above. */
html.js .reveal{opacity:0; transform:translateY(18px); transition:opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1); transition-delay:calc(var(--i,0) * 70ms)}
html.js .reveal.is-visible{opacity:1; transform:none}
html.js .device-mockup .reveal{transition-delay:var(--d,0ms)}
@media (prefers-reduced-motion: reduce){
  html.js .reveal, html.js .reveal.is-visible{opacity:1; transform:none; transition:none}
}

/* Hero plays on load rather than waiting on a scroll observer — it's
   already above the fold the instant the page paints. */
@keyframes heroIn{from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none}}
html.js .hero .reveal{opacity:0; animation:heroIn .7s cubic-bezier(.16,1,.3,1) both; animation-delay:calc(var(--i,0) * 120ms); transform:none; transition:none}
@media (prefers-reduced-motion: reduce){ html.js .hero .reveal{animation:none; opacity:1} }

/* Category tab switch — free: toggling display:none -> block via the
   existing radio-driven CSS restarts a freshly-assigned animation on its
   own, no JS needed, and it still degrades gracefully (an instant switch)
   under reduced motion. */
@keyframes panelIn{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none}}
#tab-ga4:checked ~ .tab-panels #panel-ga4,
#tab-gtm:checked ~ .tab-panels #panel-gtm,
#tab-website:checked ~ .tab-panels #panel-website{animation:panelIn .45s cubic-bezier(.16,1,.3,1) both}
@media (prefers-reduced-motion: reduce){
  #tab-ga4:checked ~ .tab-panels #panel-ga4,
  #tab-gtm:checked ~ .tab-panels #panel-gtm,
  #tab-website:checked ~ .tab-panels #panel-website{animation:none}
}

/* Score bar + weight strip grow in from zero once their section scrolls
   into view, instead of appearing already at full width. transform:scaleX,
   not width — animating "width" itself is a layout property (triggers
   reflow every frame); scaling the already-sized bar is compositor-only.
   Default (no JS, or already revealed) is the real, un-scaled bar — see
   .reveal's own doc comment, same no-JS-never-breaks-layout reasoning.
   transform-origin follows reading direction (flipped for Arabic, alongside
   this file's other RTL rules) so the bar always grows from the start. */
.section-bar-fill,.weight-seg{transform-origin:0% 50%; transition:transform 1s cubic-bezier(.16,1,.3,1) .15s}
#i18n-ar:checked ~ main .section-bar-fill,
#i18n-ar:checked ~ main .weight-seg{transform-origin:100% 50%}
html.js .section-bar:not(.is-visible) .section-bar-fill,
html.js .weight-panel:not(.is-visible) .weight-seg{transform:scaleX(0)}
@media (prefers-reduced-motion: reduce){
  html.js .section-bar:not(.is-visible) .section-bar-fill,
  html.js .weight-panel:not(.is-visible) .weight-seg{transform:none; transition:none}
}

/* The big score number counts up from 0 on load (see the script block's
   own count-up loop) — starts at the real value in the markup itself, so a
   no-JS reader still sees the correct number, just without the count-up. */
.score-num{font-variant-numeric:tabular-nums}

/* Small hover lifts on the handful of things that are actually
   interactive/clickable, not on static text — a findings card, a device
   mockup figure, the CTA panel. A failing card also picks up a soft glow in
   its own severity color (using the same --crit/--med/--green vars as its
   left border) so the lift reads as "this one" rather than generic chrome. */
.finding, .device, .cta-panel{transition:transform .25s ease, box-shadow .25s ease}
.finding:hover{transform:translateY(-2px)}
.finding--critical:hover{box-shadow:var(--shadow-card), 0 0 0 1px rgba(255,107,87,.22), 0 18px 36px -22px rgba(255,107,87,.35)}
.finding--medium:hover{box-shadow:var(--shadow-card), 0 0 0 1px rgba(242,183,94,.2), 0 18px 36px -22px rgba(242,183,94,.3)}
.finding--low:hover{box-shadow:var(--shadow-card), 0 0 0 1px rgba(106,228,153,.18), 0 18px 36px -22px rgba(106,228,153,.28)}
.cta-panel:hover{transform:translateY(-2px)}

/* Device mockup: a light 3D tilt that follows the cursor (set via --tilt-x/
   --tilt-y custom properties from the mousemove handler below) instead of a
   flat lift — reads as a physical screen being glanced at rather than a
   button. Falls back to the plain lift when JS never sets the vars (no-JS,
   reduced motion, or a touch pointer that has no hover to drive it from). */
.device{transition:transform .2s ease-out, box-shadow .25s ease}
.device:hover{
  transform:perspective(900px) rotateX(var(--tilt-y,0deg)) rotateY(var(--tilt-x,0deg)) translateY(-3px) scale(1.012);
  box-shadow:0 30px 60px -30px rgba(0,0,0,.55);
}

/* Chevrons ease out the same way every other reveal in this file does,
   rather than the default linear rotate, so the toggle reads as a deliberate
   motion instead of a CSS default. */
.finding-meta .chevron,
.check-pass-toggle .chevron{transition-timing-function:cubic-bezier(.16,1,.3,1)}

/* Critical-severity count on the score card pulses (only ever rendered with
   data-jump when the count is >0 — see the score-card markup) so a report
   with a critical fail draws the eye there without any extra markup. */
@keyframes criticalPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,87,.35)} 50%{box-shadow:0 0 0 5px rgba(255,107,87,0)}}
.severity-counts span[data-jump="critical"]{animation:criticalPulse 2.2s ease-in-out infinite}
.severity-counts span[data-jump="critical"]:hover{animation-play-state:paused}

/* Score card's corner glow gets a slow rotation instead of sitting static —
   the number itself already counts up on load, this keeps the card feeling
   alive at rest without calling attention away from the number. */
@keyframes scoreGlowSpin{from{transform:rotate(0deg)} to{transform:rotate(360deg)}}
.score-card::before{animation:scoreGlowSpin 26s linear infinite}

/* Score number gets one quick glow the instant its count-up finishes (class
   added by the script block below) — a small punctuation mark on the number
   that matters most in the whole report, not a highlight anyone can miss. */
@keyframes scoreDone{0%{text-shadow:0 0 0 rgba(106,228,153,0)} 40%{text-shadow:0 0 22px rgba(106,228,153,.85)} 100%{text-shadow:0 0 0 rgba(106,228,153,0)}}
.score-num.is-done{animation:scoreDone .8s ease-out}

/* CTA button gets a slow diagonal light sweep so the report's one real call
   to action keeps a faint pulse of motion even when nobody's hovering it. */
.cta-panel a{overflow:hidden}
.cta-panel a::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.4) 50%,transparent 60%);
  background-size:220% 100%; background-position:150% 0;
  animation:ctaSweep 3.6s ease-in-out infinite;
}
@keyframes ctaSweep{0%,60%{background-position:150% 0} 100%{background-position:-50% 0}}
.cta-panel a:hover{filter:brightness(1.15)}

/* Footer social icons get a small bounce-rotate instead of just a color
   swap, matching the overshoot chevrons use above. */
.footer-social-btn{transition:transform .25s cubic-bezier(.16,1,.3,1), background .2s ease, border-color .2s ease, color .2s ease}
.footer-social-btn:hover{transform:translateY(-2px) rotate(-8deg) scale(1.08)}

/* Sticky top bar picks up a real shadow once the page has actually scrolled
   (is-scrolled toggled by the script block below) — distinguishes "docked
   at the top of a long page" from "sitting at the top because nothing has
   scrolled yet". box-shadow only, deliberately: no padding/height change,
   which would animate layout instead of just compositing (see this file's
   own reasoning on .section-bar-fill/.weight-seg above). */
.topbar{transition:box-shadow .2s ease}
.topbar.is-scrolled{box-shadow:0 12px 28px -18px rgba(0,0,0,.6)}

@media (prefers-reduced-motion: reduce){
  .device:hover{transform:translateY(-3px)}
  .severity-counts span[data-jump="critical"]{animation:none}
  .score-card::before{animation:none}
  .score-num.is-done{animation:none}
  .cta-panel a::after{animation:none}
  .footer-social-btn:hover{transform:none}
}

/* Ambient backdrop: a slow, barely-there breathing glow rather than a
   static gradient — deliberately subtle (22s, opacity only, no position
   movement) so it reads as depth on a business document, not a landing
   page. Off entirely under reduced motion. */
@keyframes ambientBreathe{0%,100%{opacity:1} 50%{opacity:.82}}
.page::before{animation:ambientBreathe 22s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){ .page::before{animation:none} }
</style>
</head>
<body>
<div class="page">
  <!-- Language toggle. Every finding is written twice (see types.ts's
       FindingVoice) and BOTH copies ship in the HTML; these two radios pick
       which one is visible. Deliberately CSS-only and placed here, as
       siblings of <main>, so the switch works with JavaScript disabled and
       in an email client's preview — the same reasoning as the category
       tabs. Business is checked by default: the audit goes to a business
       owner, and the technical register is one click away for whoever
       actually implements the fixes. -->
  <input type="radio" name="report-lang" id="lang-business" class="lang-radio" checked />
  <input type="radio" name="report-lang" id="lang-technical" class="lang-radio" />
  <!-- Same CSS-only mechanism, second axis: which LANGUAGE is showing,
       independent of which register (see the i18n-* rules above lang-radio's
       own :root block). English checked by default. -->
  <input type="radio" name="report-i18n" id="i18n-en" class="lang-radio" checked />
  <input type="radio" name="report-i18n" id="i18n-ar" class="lang-radio" />
  <div class="topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="${SITE_URL}"><img src="${assets.wordmark}" alt="Optimizers" /></a>
      <div class="topbar-links">
        <a class="nav-link" href="${SITE_URL}">optimizers.agency</a>
        <div class="i18n-toggle" role="group" aria-label="Report language">
          <label for="i18n-en" class="i18n-toggle-btn" id="i18n-btn-en">EN</label>
          <label for="i18n-ar" class="i18n-toggle-btn" id="i18n-btn-ar">ع</label>
        </div>
        <a class="topbar-cta" href="${contactUrl}">${bi("Book a session", "احجز جلسة")}</a>
      </div>
    </div>
  </div>

  <main>
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="reveal" style="--i:0">
          <p class="eyebrow">${bi("Free CRO & Analytics Audit", "تدقيق مجاني لتحسين التحويل والتحليلات")}</p>
          <h1>${escapeHtml(result.businessName || "Audit report")}</h1>
          <p>${biHtml(
            `Analytics, tag deployment, and on-site conversion signals for ${escapeHtml(result.websiteUrl)}, scored against ${result.possiblePoints} checks for the audit path that applied.`,
            `تحليلات الموقع، ونشر العلامات، وإشارات التحويل داخل الموقع لـ ${escapeHtml(result.websiteUrl)}، بتقييم مقابل ${result.possiblePoints} ${arChecksNoun(result.possiblePoints)} لمسار التدقيق المطبَّق.`,
          )}</p>
          <p class="generated-for">${biHtml(
            `This audit was generated by <strong>Optimizers</strong> for <strong>${attributedTo}</strong>.`,
            `تم إعداد هذا التدقيق من قِبل <strong>Optimizers</strong> لـ <strong>${attributedTo}</strong>.`,
          )}</p>
          <div class="hero-meta">
            <span>${bi("Site:", "الموقع:")} <b>${escapeHtml(result.websiteUrl)}</b></span>
            <span>${bi("Generated:", "تاريخ الإصدار:")} <b class="i18n-en">${escapeHtml(generatedAt)}</b><b class="i18n-ar" dir="rtl">${escapeHtml(generatedAtAr)}</b></span>
          </div>
        </div>
        <aside class="score-card reveal" style="--i:1">
          <div class="score-row"><span class="score-num" data-count-to="${result.overallScore}">${result.overallScore}</span><span class="score-den">/ ${result.possiblePoints}</span></div>
          <div class="score-grade">${bi("Grade", "التقييم")} ${letterGrade(result.possiblePoints > 0 ? (result.overallScore / result.possiblePoints) * 100 : 0)}</div>
          <div class="score-verdict"><span class="i18n-en">${escapeHtml(verdict)}</span><span class="i18n-ar" dir="rtl">${escapeHtml(verdictAr)}</span></div>
          <div class="severity-counts">
            <span${counts.critical ? ' data-jump="critical" role="button" tabindex="0"' : ""}><b>${counts.critical}</b> ${bi("critical", "حرج")}</span>
            <span${counts.medium ? ' data-jump="medium" role="button" tabindex="0"' : ""}><b>${counts.medium}</b> ${bi("medium", "متوسط")}</span>
            <span${counts.low ? ' data-jump="low" role="button" tabindex="0"' : ""}><b>${counts.low}</b> ${bi("low", "منخفض")}</span>
          </div>
        </aside>
${deviceMockupHtml(result)}
      </div>
    </section>

    ${weightStrip(result)}

    <div class="wrap">
      ${tabsHtml}

      <section class="cta">
        <div class="cta-panel reveal">
          <div>
            <h2>${bi("Turn this audit into a fix plan.", "حوِّل هذا التدقيق إلى خطة عمل فعلية.")}</h2>
            <p>${bi(
              "Book a free strategy session and we'll walk through every finding, prioritized by revenue impact.",
              "احجز جلسة استراتيجية مجانية وسنراجع معك كل نتيجة، مرتّبة بحسب تأثيرها على الإيراد.",
            )}</p>
          </div>
          <a href="${contactUrl}">${bi("Book a Strategy Session", "احجز جلسة استراتيجية")}</a>
        </div>
      </section>
    </div>

    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div class="footer-col footer-brand reveal" style="--i:0">
          <a class="footer-logo" href="${SITE_URL}"><img src="${assets.wordmark}" alt="Optimizers" /></a>
          <p>${bi(
            "Leading CRO agency specializing in GCC e-commerce optimization.",
            "وكالة رائدة في تحسين معدلات التحويل، متخصصة في تحسين التجارة الإلكترونية بمنطقة الخليج.",
          )}</p>
          <div class="footer-social">
            <a class="footer-social-btn" href="https://web.facebook.com/optimizersagency" aria-label="Optimizers on Facebook">f</a>
            <a class="footer-social-btn" href="https://x.com/optimizersCRO/" aria-label="Optimizers on X">X</a>
            <a class="footer-social-btn" href="https://www.linkedin.com/company/optimizersagency" aria-label="Optimizers on LinkedIn">in</a>
            <a class="footer-social-btn" href="https://www.instagram.com/optimizersagency?igsh=b3g3NTR5NGltOW05" aria-label="Optimizers on Instagram">IG</a>
          </div>
        </div>
        <div class="footer-col reveal" style="--i:1">
          <h3>${bi("Quick Links", "روابط سريعة")}</h3>
          <a href="${SITE_URL}">${bi("About", "من نحن")}</a>
          <a href="${SITE_URL.replace(/\/$/, "")}/#services">${bi("Services", "الخدمات")}</a>
          <a href="${SITE_URL.replace(/\/$/, "")}/#roi-calculator">${bi("ROI Calculator", "حاسبة العائد على الاستثمار")}</a>
          <a href="${contactUrl}">${bi("Contact", "تواصل معنا")}</a>
        </div>
        <div class="footer-col reveal" style="--i:2">
          <h3>${bi("Services", "خدماتنا")}</h3>
          <p class="footer-service-lead">${bi("Conversion Rate Optimization", "تحسين معدل التحويل")}</p>
          <p>${bi("A/B Testing", "اختبارات A/B")}</p>
          <p>${bi("User Experience Design", "تصميم تجربة المستخدم")}</p>
          <p>${bi("Analytics & Tracking", "التحليلات والتتبع")}</p>
        </div>
        <div class="footer-col reveal" style="--i:3">
          <h3>${bi("Contact Us", "معلومات التواصل")}</h3>
          <p>${bi("Ras Al Khaimah Economic Zone Office", "مكتب المنطقة الاقتصادية في رأس الخيمة")}</p>
          <p>${bi("Office Business Hub, New Cairo, Egypt", "مركز الأعمال، القاهرة الجديدة، مصر")}</p>
          <p dir="ltr">+971 564800881</p>
          <p dir="ltr">+20 1021001000</p>
        </div>
      </div>
      <div class="wrap footer-bottom">
        <p class="footer-generated">${biHtml(
          `This audit was generated by <strong>Optimizers</strong> for <strong>${attributedTo}</strong> on ${escapeHtml(generatedAt)}.`,
          `تم إعداد هذا التدقيق من قِبل <strong>Optimizers</strong> لـ <strong>${attributedTo}</strong> بتاريخ ${escapeHtml(generatedAtAr)}.`,
        )}</p>
        <a href="${SITE_URL}">optimizers.agency</a>
      </div>
    </footer>
  </main>
</div>
<script>
(function(){
  "use strict";

  // Collapsible finding cards + collapsible passed-check rows, both via
  // one delegated click listener (elements are static, but delegation
  // means this keeps working even if a future template tweak changes
  // how many of each there are).
  document.addEventListener("click", function(e){
    var findingBtn = e.target.closest(".finding-toggle");
    if (findingBtn) {
      var article = findingBtn.closest(".finding");
      var collapsed = article.classList.toggle("is-collapsed");
      findingBtn.setAttribute("aria-expanded", String(!collapsed));
      return;
    }

    var passBtn = e.target.closest(".check-pass-toggle");
    if (passBtn) {
      var row = passBtn.closest(".check-pass-row");
      var expanded = row.classList.toggle("is-expanded");
      passBtn.setAttribute("aria-expanded", String(expanded));
      return;
    }

    var jump = e.target.closest("[data-jump]");
    if (jump) {
      var severity = jump.getAttribute("data-jump");
      var target = document.querySelector(".finding--" + severity);
      if (!target) return;
      var panel = target.closest(".tab-panel");
      if (panel) {
        var radio = document.getElementById(panel.id.replace("panel-", "tab-"));
        if (radio) radio.checked = true;
      }
      target.classList.remove("is-collapsed");
      var toggle = target.querySelector(".finding-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      void target.offsetHeight; // force layout so the just-revealed tab panel's real position is used below
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("flash");
      setTimeout(function(){ target.classList.remove("flash"); }, 1600);
    }
  });

  // Per-category search + status filter — narrows a category's checklist
  // rows (findings + passed checks alike) by text and by data-status.
  //
  // Each filter-bar carries TWO of each control (.i18n-en/.i18n-ar — see
  // filterBarHtml) so the placeholder/options are in the right language;
  // only one of the pair is ever visible at a time (the CSS-only language
  // toggle), but either can be typed into if the reader switches languages
  // mid-search, so both get listeners and apply() just combines whichever
  // actually holds a value.
  document.querySelectorAll(".filter-bar").forEach(function(bar){
    var section = bar.closest(".report-section");
    var grid = section && section.querySelector(".findings-grid");
    if (!grid) return;
    var searches = Array.prototype.slice.call(bar.querySelectorAll(".filter-search"));
    var selects = Array.prototype.slice.call(bar.querySelectorAll(".filter-select"));
    var empties = Array.prototype.slice.call(section.querySelectorAll(".filter-empty"));

    function apply(){
      var q = searches.map(function(el){ return (el.value || "").trim(); }).find(Boolean) || "";
      q = q.toLowerCase();
      var status = selects.map(function(el){ return el.value; }).find(function(v){ return v && v !== "all"; }) || "all";
      var visible = 0;
      Array.prototype.forEach.call(grid.children, function(row){
        var rowStatus = row.getAttribute("data-status");
        var text = row.textContent.toLowerCase();
        var show = (status === "all" || rowStatus === status) && (!q || text.indexOf(q) !== -1);
        row.hidden = !show;
        if (show) visible++;
      });
      empties.forEach(function(el){ el.hidden = visible !== 0; });
    }

    searches.forEach(function(el){ el.addEventListener("input", apply); });
    selects.forEach(function(el){ el.addEventListener("change", apply); });
  });

  // Scroll reveal for every .reveal element (cards, panels, footer columns,
  // the device mockup, ...) — adds .is-visible once ~12% of the element has
  // entered the viewport, then stops watching it (a report is read once,
  // not re-animated every time something scrolls back into view).
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function(el){ observer.observe(el); });
  } else {
    // No IntersectionObserver support: reveal everything immediately rather
    // than leaving it permanently at opacity:0.
    document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("is-visible"); });
  }

  // Score number count-up. The markup already shows the real score (its own
  // no-JS fallback) — this only resets to 0 and animates back up when a
  // script is actually going to run the animation, so a reader is never
  // left looking at a "0" that never finishes counting up.
  var countEl = document.querySelector(".score-num");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (countEl && !reduceMotion) {
    var target = parseInt(countEl.getAttribute("data-count-to") || "0", 10);
    if (target > 0) {
      countEl.textContent = "0";
      var start = null;
      var duration = 900;
      function tick(ts){
        if (start === null) start = ts;
        var progress = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        countEl.textContent = String(Math.round(eased * target));
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // One quick glow once the number lands on its real value (see the
          // .score-num.is-done keyframe) — never re-added, this plays once.
          countEl.classList.add("is-done");
        }
      }
      requestAnimationFrame(tick);
    }
  }

  // Top bar shadow: on past its own height, not on any scroll at all, so it
  // doesn't flicker on the tiny rubber-band scroll some browsers allow at
  // rest. Passive listener — this never calls preventDefault.
  var topbar = document.querySelector(".topbar");
  if (topbar) {
    var applyScrolled = function(){
      topbar.classList.toggle("is-scrolled", window.scrollY > topbar.offsetHeight);
    };
    applyScrolled();
    window.addEventListener("scroll", applyScrolled, { passive: true });
  }

  // Device mockup tilt: follows the cursor via --tilt-x/--tilt-y (consumed
  // by the .device:hover rule above), skipped entirely under reduced motion
  // or on a coarse/touch pointer that has no continuous hover to drive it —
  // .device:hover's own reduced-motion fallback covers both cases with the
  // plain lift instead.
  var canTilt = !reduceMotion && window.matchMedia && window.matchMedia("(pointer:fine)").matches;
  if (canTilt) {
    document.querySelectorAll(".device").forEach(function(el){
      el.addEventListener("mousemove", function(e){
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--tilt-x", (px * 8).toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", (py * -8).toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", function(){
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      });
    });
  }
})();
</script>
</body>
</html>`;
}

export async function buildAuditHtmlReport(result: AuditResult): Promise<AuditHtmlReport> {
  return { html: await renderReport(result) };
}
