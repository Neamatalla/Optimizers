// The report page for /audit-reports/<slug> (audit-report.html). Fetches the
// report's rows from /api/audit-report and renders them with the same code
// the worker uses for local files (audit-worker/src/html-report.ts), so a
// report looks the same either way. Fonts, logos and GSAP are loaded as
// files here instead of being inlined.
import { renderAuditReport, type ReportAssets } from "../../audit-worker/src/html-report";
import { fromRows, type FindingRow, type ReportRequest, type ReportRow } from "../../audit-worker/src/report-rows";
import wordmark from "../../audit-worker/assets/wordmark-white-trim.png?url";
import icon from "../../audit-worker/assets/icon-white-trim.png?url";
import sora400 from "../../audit-worker/assets/Sora-Regular.woff2?url";
import sora600 from "../../audit-worker/assets/Sora-SemiBold.woff2?url";
import sora700 from "../../audit-worker/assets/Sora-Bold.woff2?url";
import inter400 from "../../audit-worker/assets/Inter-Regular.woff2?url";
import inter500 from "../../audit-worker/assets/Inter-Medium.woff2?url";
import inter600 from "../../audit-worker/assets/Inter-SemiBold.woff2?url";
import ar400 from "../../audit-worker/assets/NotoSansArabic-Regular.woff2?url";
import ar600 from "../../audit-worker/assets/NotoSansArabic-SemiBold.woff2?url";
import ar700 from "../../audit-worker/assets/NotoSansArabic-Bold.woff2?url";
import gsap from "gsap/dist/gsap.min.js?url";
import scrollTrigger from "gsap/dist/ScrollTrigger.min.js?url";

type ReportResponse =
  | { request: ReportRequest; report: ReportRow; findings: FindingRow[] }
  | { legacyHtml: string }
  | { error: string };

const assets: ReportAssets = {
  wordmark, icon, sora400, sora600, sora700, inter400, inter500, inter600, ar400, ar600, ar700,
  motion: { src: [gsap, scrollTrigger] },
  siteUrl: window.location.origin,
};

// Replaces this page with the report. document.write runs the report's own
// scripts in order, as they run in a standalone report file.
function show(html: string) {
  document.open();
  document.write(html);
  document.close();
}

function message(title: string, text: string) {
  document.title = title;
  document.body.innerHTML = "";
  const box = document.createElement("div");
  box.style.cssText = "max-width:420px;padding:0 24px;text-align:center";
  const h = document.createElement("h1");
  h.style.cssText = "color:#fff;font-size:20px;margin:0 0 8px";
  h.textContent = title;
  const p = document.createElement("p");
  p.style.margin = "0";
  p.textContent = text;
  box.append(h, p);
  document.body.append(box);
}

async function main() {
  const slug = decodeURIComponent(window.location.pathname.replace(/\/+$/, "").split("/").pop() ?? "");
  const query = new URLSearchParams({ slug });
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview) query.set("preview", preview);

  let res: Response;
  let body: ReportResponse | null;
  try {
    res = await fetch(`/api/audit-report?${query}`);
    body = await res.json().catch(() => null);
  } catch {
    return message("Couldn't load the audit", "Check your connection and refresh the page.");
  }

  if (res.status === 404 || res.status === 400) {
    return message("Audit not found", "This link doesn't match an audit that's ready to view.");
  }
  if (!res.ok || !body || "error" in body) {
    return message("Couldn't load the audit", "Something went wrong on our side. Refresh the page in a minute.");
  }
  if ("legacyHtml" in body) return show(body.legacyHtml);
  show(renderAuditReport(fromRows(body.request, body.report, body.findings), assets));
}

main();
