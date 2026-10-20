import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import type { AuditResult } from "./types.js";
import { renderAuditReport, type ReportAssets } from "./html-report.js";

/**
 * The report as one self-contained HTML file, for local output
 * (preview-report.ts, test-run.ts). Published reports are rendered in the
 * browser instead (src/audit-report/main.ts) from the audit_findings rows.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "assets");

export interface AuditHtmlReport {
  html: string;
}

async function dataUri(relativePath: string, mime: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:${mime};base64,${file.toString("base64")}`;
}

// Everything is inlined so the file works on its own and offline: the
// wordmark, Sora (display) + Inter (body) per the brand tokens, Noto Sans
// Arabic (the main site's Arabic face, src/styles/fonts.css), and GSAP core +
// ScrollTrigger. Read once per process.
const requireFromHere = createRequire(import.meta.url);
let assetsCache: Promise<ReportAssets> | null = null;
function inlineAssets(): Promise<ReportAssets> {
  assetsCache ??= (async () => {
    const font = (file: string) => dataUri(file, "font/woff2");
    const [wordmark, icon, sora400, sora600, sora700, inter400, inter500, inter600, ar400, ar600, ar700, motion] = await Promise.all([
      dataUri("wordmark-white-trim.png", "image/png"),
      dataUri("icon-white-trim.png", "image/png"),
      font("Sora-Regular.woff2"),
      font("Sora-SemiBold.woff2"),
      font("Sora-Bold.woff2"),
      font("Inter-Regular.woff2"),
      font("Inter-Medium.woff2"),
      font("Inter-SemiBold.woff2"),
      font("NotoSansArabic-Regular.woff2"),
      font("NotoSansArabic-SemiBold.woff2"),
      font("NotoSansArabic-Bold.woff2"),
      Promise.all(["gsap/dist/gsap.min.js", "gsap/dist/ScrollTrigger.min.js"].map(m => readFile(requireFromHere.resolve(m), "utf8"))).then(files => files.join(";\n")),
    ]);
    const siteUrl = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";
    return { wordmark, icon, sora400, sora600, sora700, inter400, inter500, inter600, ar400, ar600, ar700, motion: { inline: motion }, siteUrl };
  })();
  return assetsCache;
}

export async function buildAuditHtmlReport(result: AuditResult): Promise<AuditHtmlReport> {
  return { html: renderAuditReport(result, await inlineAssets()) };
}
