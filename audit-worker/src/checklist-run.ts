/**
 * Dev-only: runs the CRO manual checklist (fud/manual-checklist.ts) on saved
 * friction evidence, without browsing or the rule review.
 *
 *   npx tsx src/checklist-run.ts output/fud-<host>-evidence.json [role]
 *
 * Writes output/checklist-<host>.json (gitignored); the preview attaches it
 * with `npm run preview-report -- --fud --checklist=output/checklist-<host>.json`.
 */
import "./logger.js";
import "dotenv/config";
import { readFile, writeFile } from "fs/promises";
import { audienceRoleOf } from "./audience.js";
import type { StoreEvidence } from "./fud/evidence.js";
import { runManualChecklist, runnableCheckpoints, scoreChecklist } from "./fud/manual-checklist.js";

// --pages=checkout,landing   only those page types (so only their tabs run)
// --merge=<checklist json>   add the new verdicts to a saved result
const flags = process.argv.slice(2).filter(a => a.startsWith("--"));
const [file, roleArg] = process.argv.slice(2).filter(a => !a.startsWith("--"));
if (!file) throw new Error("usage: npx tsx src/checklist-run.ts output/fud-<host>-evidence.json [role] [--pages=checkout,landing] [--merge=output/checklist-<host>.json]");
const role = audienceRoleOf(roleArg ?? "media_buyer");
const only = flags.find(f => f.startsWith("--pages="))?.slice("--pages=".length).split(",");
const mergeFile = flags.find(f => f.startsWith("--merge="))?.slice("--merge=".length);
const full: StoreEvidence = JSON.parse(await readFile(file, "utf8"));
const evidence: StoreEvidence = only ? { ...full, pages: full.pages.filter(p => only.includes(p.pageType)) } : full;
console.log(`[checklist-run] ${evidence.website}: ${runnableCheckpoints(evidence).length} checkpoints on ${evidence.pages.filter(p => p.loaded).map(p => p.pageType).join(", ")}`);
const t0 = Date.now();
let result = await runManualChecklist(evidence, `checklist-${Date.now()}`, role);
if (mergeFile) {
  const old: typeof result = JSON.parse(await readFile(mergeFile, "utf8"));
  const fresh = new Set(result.items.map(i => i.id));
  result = { ...result, items: [...old.items.filter(i => !fresh.has(i.id)), ...result.items], ran: old.ran + result.ran, dropped: old.dropped + result.dropped, failedBatches: old.failedBatches + result.failedBatches };
}
const host = new URL(evidence.website).hostname;
await writeFile(`output/checklist-${host}.json`, JSON.stringify(result, null, 2), "utf8");
const s = scoreChecklist(result);
console.log(`[checklist-run] done in ${Math.round((Date.now() - t0) / 1000)}s: ${result.ran} run, ${result.items.length} shown, ${result.dropped} dropped (doesn't apply / can't tell), ${result.items.filter(i => i.x).length} written up, ${result.failedBatches} failed calls, total score ${s.total.score}%`);
for (const t of s.tabs.filter(x => x.judged)) console.log(`  ${t.tab}: ${t.score}% (${t.judged} judged, ${t.criticalFailing} critical failing)`);
