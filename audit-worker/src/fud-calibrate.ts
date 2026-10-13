/**
 * Calibration run for the purchase-friction rules (rollout phase 1 in
 * FUD-PASS-DESIGN.md): runs the pass on a list of stores, one after another,
 * and writes a labelling sheet for a human to mark each finding right or
 * wrong.
 *
 *   npm run fud-calibrate -- https://store-a.com https://store-b.com
 *   npm run fud-calibrate -- --file=stores.txt        (one URL per line, # for comments)
 *   npm run fud-calibrate -- --score                  (after labelling: precision per rule)
 *
 * Outputs (all in output/, gitignored):
 *   fud-<host>-evidence.json, fud-<host>-result.json   per store
 *   fud-calibration.csv                                one row per finding;
 *     fill the "correct" column with y or n (and "should_be" when n), in
 *     Excel or Google Sheets, then run --score.
 *
 * Each store gets one product added to its cart (throwaway session,
 * analytics blocked) — run this on client stores and stores you have
 * permission to test, not on arbitrary sites.
 */
import "dotenv/config";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { crawlWebsite } from "./crawl.js";
import { discoverPages } from "./discover-pages.js";
import { collectStoreEvidence } from "./fud/collect.js";
import { runFudPass } from "./fud/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "output");
const SHEET = path.join(OUT, "fud-calibration.csv");
const HEADER = ["store", "rule", "status", "confidence", "pexti", "band", "desktop", "page", "summary", "correct", "should_be", "notes"];

const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || ch === ";" || ch === "\t") {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (ch !== "\r") cur += ch;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

async function score(): Promise<void> {
  if (!existsSync(SHEET)) throw new Error(`no sheet at ${SHEET} — run a calibration first`);
  const rows = parseCsv((await readFile(SHEET, "utf8")).replace(/^﻿/, ""));
  const head = rows[0].map(h => h.trim().toLowerCase());
  const col = (name: string) => head.indexOf(name);
  const by = new Map<string, { n: number; right: number; failN: number; failRight: number }>();
  let labelled = 0;
  for (const r of rows.slice(1)) {
    const mark = (r[col("correct")] ?? "").trim().toLowerCase();
    if (mark !== "y" && mark !== "n") continue;
    labelled++;
    const rule = r[col("rule")];
    const s = by.get(rule) ?? { n: 0, right: 0, failN: 0, failRight: 0 };
    s.n++;
    if (mark === "y") s.right++;
    if (r[col("status")] === "fail") {
      s.failN++;
      if (mark === "y") s.failRight++;
    }
    by.set(rule, s);
  }
  if (labelled === 0) throw new Error('no labelled rows yet — fill the "correct" column with y or n');
  const stores = new Set(rows.slice(1).filter(r => /^[yn]$/i.test((r[col("correct")] ?? "").trim())).map(r => r[col("store")]));
  console.log(`${labelled} labelled findings across ${stores.size} store(s)\n`);
  console.log("rule  findings  correct   FAILs  FAILs correct   verdict");
  let allFail = 0;
  let allFailRight = 0;
  for (const [rule, s] of [...by.entries()].sort()) {
    allFail += s.failN;
    allFailRight += s.failRight;
    const failPrecision = s.failN ? s.failRight / s.failN : null;
    const verdict = failPrecision === null ? "no FAILs yet" : failPrecision >= 0.9 ? "ok to auto-FAIL" : "keep as WARN (set autoFail: false)";
    console.log(`${rule.padEnd(5)} ${String(s.n).padStart(8)}  ${`${Math.round((100 * s.right) / s.n)}%`.padStart(7)}  ${String(s.failN).padStart(6)}  ${(failPrecision === null ? "-" : `${Math.round(failPrecision * 100)}%`).padStart(13)}   ${verdict}`);
  }
  const overall = allFail ? Math.round((100 * allFailRight) / allFail) : null;
  console.log(`\nFAIL precision overall: ${overall === null ? "no FAILs labelled" : `${overall}%`} (target 90%+ over 15-20 stores before FUD_ALLOW_FAIL=true)`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--score")) return score();
  const file = args.find(a => a.startsWith("--file="))?.split("=").slice(1).join("=");
  let urls = args.filter(a => !a.startsWith("--"));
  if (file) urls = urls.concat((await readFile(file, "utf8")).split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#")));
  if (urls.length === 0) throw new Error("usage: npm run fud-calibrate -- <store url> [<store url> ...] | --file=stores.txt | --score");
  await mkdir(OUT, { recursive: true });

  // Append to an existing sheet so labels already filled in are kept.
  const lines: string[] = [];
  const existing = existsSync(SHEET) ? (await readFile(SHEET, "utf8")).replace(/^﻿/, "") : "";
  const done = new Set(parseCsv(existing).slice(1).map(r => r[0]));
  if (!existing) lines.push(HEADER.join(","));

  for (const raw of urls) {
    const url = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (done.has(host)) {
      console.log(`[calibrate] ${host}: already in the sheet, skipping (delete its rows to re-run)`);
      continue;
    }
    console.log(`\n[calibrate] ${host}`);
    try {
      const crawl = await crawlWebsite(url);
      const pages = await discoverPages(url, crawl.html);
      const evidence = await collectStoreEvidence(url, pages);
      await writeFile(path.join(OUT, `fud-${host}-evidence.json`), JSON.stringify(evidence), "utf8");
      const result = await runFudPass({ website: url, discoveredPages: pages, ga4Metrics: null, jobId: `calibrate-${host}`, allowFail: true, evidence });
      await writeFile(path.join(OUT, `fud-${host}-result.json`), JSON.stringify(result, null, 2), "utf8");
      if ("error" in result) {
        console.error(`[calibrate] ${host}: failed — ${result.error}`);
        continue;
      }
      console.log(`[calibrate] ${host}: Buyer confidence ${result.score ?? "n/a"}, ${result.assessed}/${result.applicable} assessed, cart from ${evidence.pages.find(p => p.pageType === "cart")?.cart?.source ?? "nothing"}, leaks ${evidence.leakedHits?.length ?? 0}`);
      for (const f of result.findings) {
        lines.push([host, f.ruleId, f.status, f.confidence.toFixed(2), f.pexti?.score ?? "", f.band ?? "", f.desktop ?? "", f.pageUrl ?? "", f.business.summary, "", "", f.unassessedReason ?? ""].map(cell).join(","));
      }
    } catch (err) {
      console.error(`[calibrate] ${host}: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (lines.length) await writeFile(SHEET, (existing ? existing.replace(/\s*$/, "\n") : "﻿") + lines.join("\n") + "\n", "utf8");
  console.log(`\nLabelling sheet: ${SHEET}\nOpen it, mark each row y or n in "correct" (the per-store report helps: npm run preview-report -- --no-ar --fud=output/fud-<host>-result.json), then: npm run fud-calibrate -- --score`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
