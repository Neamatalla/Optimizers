/**
 * Dev-only: runs the purchase-friction (FUD) pass on one live store, without
 * Supabase, the 50-check audit or any email. Use it to calibrate the rules
 * (rollout phase 1 in FUD-PASS-DESIGN.md).
 *
 *   npm run fud-run -- https://store.com                 collect + judge
 *   npm run fud-run -- https://store.com --collect-only  browser only, no Claude call
 *   npm run fud-run -- --evidence=output/fud-<host>-evidence.json   re-judge saved evidence
 *   add --competitor=<url> to benchmark a competitor, --request=<id> to use
 *   that audit request's GA4 data for the money/segment insights
 *
 * Writes output/fud-<host>-evidence.json and output/fud-<host>-result.json
 * (gitignored). Render the result in a report with:
 *   npm run preview-report -- --no-ar --fud=output/fud-<host>-result.json
 *
 * Note: this really adds one product to that store's cart (in a throwaway
 * browser session, with analytics hits blocked) — run it on client stores
 * or test stores, not on random sites.
 */
import "dotenv/config";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { crawlWebsite } from "./crawl.js";
import { discoverPages } from "./discover-pages.js";
import { collectStoreEvidence } from "./fud/collect.js";
import type { StoreEvidence } from "./fud/evidence.js";
import { runFudPass } from "./fud/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stripCrops(e: StoreEvidence): StoreEvidence {
  return { ...e, pages: e.pages.map(p => ({ ...p, crops: Object.fromEntries(Object.entries(p.crops).map(([k, v]) => [k, v ? `${v.slice(0, 40)}…(${v.length} chars)` : v])) })) };
}

async function main() {
  const args = process.argv.slice(2);
  const evidenceFile = args.find(a => a.startsWith("--evidence="))?.split("=").slice(1).join("=");
  const collectOnly = args.includes("--collect-only");
  // --competitor=<url> also benchmarks a competitor (status only).
  const competitorUrl = args.find(a => a.startsWith("--competitor="))?.split("=").slice(1).join("=") || null;
  // --request=<id> reads that audit request's GA4 OAuth data from Supabase,
  // for the money/segment insights.
  const requestId = args.find(a => a.startsWith("--request="))?.split("=")[1];
  let url = args.find(a => !a.startsWith("--"));

  const outDir = path.join(__dirname, "..", "output");
  await mkdir(outDir, { recursive: true });

  let evidence: StoreEvidence;
  if (evidenceFile) {
    evidence = JSON.parse(await readFile(evidenceFile, "utf8"));
    url = evidence.website;
  } else {
    if (!url) throw new Error("usage: npm run fud-run -- <store url> [--collect-only]");
    if (!/^https?:\/\//.test(url)) url = `https://${url}`;
    const crawl = await crawlWebsite(url);
    const pages = await discoverPages(url, crawl.html);
    console.log(`[fud-run] discovered ${pages.length} pages:\n  ${pages.join("\n  ")}`);
    evidence = await collectStoreEvidence(url, pages);
  }

  const host = new URL(url!).hostname.replace(/^www\./, "");
  const evidencePath = path.join(outDir, `fud-${host}-evidence.json`);
  if (!evidenceFile) await writeFile(evidencePath, JSON.stringify(evidence, null, 2), "utf8");

  console.log(`[fud-run] add-to-cart: ${JSON.stringify(evidence.addToCart)}; analytics hits blocked: ${evidence.blockedHits}, NOT blocked: ${evidence.leakedHits?.length ?? 0}; desktop pages: ${evidence.desktop?.filter(p => p.loaded).length ?? 0}; ${Math.round(evidence.durationMs / 1000)}s`);
  for (const leak of evidence.leakedHits ?? []) console.warn(`[fud-run] NOT blocked (add to BLOCKED_HITS in fud/collect.ts): ${leak}`);
  for (const p of evidence.pages) {
    console.log(`  ${p.pageType.padEnd(8)} ${p.loaded ? "ok " : "-- "} ${p.blocks.length} blocks, cta: ${p.cta ? `"${p.cta.text}" (${p.cta.nearbyBlockIds.length} near)` : "none"}, widgets: ${p.widgets.join(",") || "none"}, crops: ${Object.keys(p.crops).filter(k => (p.crops as any)[k]).join(",") || "none"}${p.note ? `, note: ${p.note}` : ""}`);
  }
  if (collectOnly) {
    console.log(`[fud-run] evidence: ${evidencePath}`);
    console.log(JSON.stringify(stripCrops(evidence)).length, "chars of evidence (without crops)");
    return;
  }

  let ga4OAuthData: unknown = null;
  let ga4Metrics = null;
  if (requestId) {
    const { getRequestById } = await import("./supabase.js");
    const row = await getRequestById(requestId);
    ga4OAuthData = row?.ga4_oauth_data ?? null;
    ga4Metrics = row?.progress?.ga4Metrics ?? null;
    console.log(`[fud-run] GA4 data from request ${row?.id ?? "(not found)"}`);
  }
  const result = await runFudPass({ website: url!, discoveredPages: [], ga4Metrics, ga4OAuthData, jobId: `fud-run-${host}`, allowFail: true, evidence, competitorUrl });
  const resultPath = path.join(outDir, `fud-${host}-result.json`);
  await writeFile(resultPath, JSON.stringify(result, null, 2), "utf8");
  if ("error" in result) {
    console.error(`[fud-run] failed: ${result.error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\nConversion score: ${result.score ?? "n/a"} (${result.assessed}/${result.applicable} assessed)`);
  for (const f of result.findings) {
    console.log(`  ${f.ruleId.padEnd(3)} ${f.status.padEnd(10)} ${f.pexti ? `PEXTI ${String(f.pexti.score).padStart(3)} ${f.band}` : "".padEnd(20)}  ${f.business.summary}${f.unassessedReason ? ` [${f.unassessedReason}]` : ""}`);
  }
  console.log(`\n[fud-run] result: ${resultPath}\n[fud-run] preview: npm run preview-report -- --no-ar --fud=${path.relative(process.cwd(), resultPath)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
