import fs from "node:fs";
import { arabicRegisterRule } from "./audience.js";
import { extractJsonPayload, runClaudeHeadless } from "./claude.js";
import { MANUAL_CHECKPOINTS } from "./fud/manual-checklist-data.js";
import { buildMcpConfig } from "./mcp-config.js";

/**
 * One-off: writes src/fud/manual-checklist-static.ts, the "means" and "done"
 * text for all CRO checkpoints in English and Arabic (see that file).
 * Uses the writer model, about 15 calls. Run by hand, review, commit:
 *   npm run gen-static-writeups
 * Needs the same env as the worker (ANTHROPIC_API_KEY, CLAUDE_WRITER_MODEL).
 */
const BATCH = 25;
const OUT = new URL("./fud/manual-checklist-static.ts", import.meta.url);

const prompt = (list: typeof MANUAL_CHECKPOINTS) => `You are a senior CRO specialist at Optimizers. For each checkpoint below, write two short texts the client reads in an audit report. They explain the checkpoint in general, for any store: do not mention a specific store.

${list.map(c => `### ${c.id}\nCheckpoint: ${c.checkpoint}\nWhy it matters (agency's note): ${c.why}\nHow a specialist checks: ${c.how}\nPass looks like: ${c.pass}`).join("\n\n")}

For each checkpoint write:
- "means": 3-4 sentences. What this checkpoint is about, why it matters to a shopper deciding to buy, and what it does to sales when it is wrong.
- "done": 1-2 sentences. How the store can check it is fixed, based on "Pass looks like".

Rules:
- Plain words. Short sentences, one idea each, 14 words or fewer. No semicolons.
- Explain any term the first time you use it.
- Never invent numbers or facts.
- "en" is English. "ar" is the same content in Arabic, written naturally, not word for word. ${arabicRegisterRule(null) ?? "Write natural, plain Arabic a store owner in Egypt or the Gulf reads easily. Keep tool, app and code names in Latin script."}

Answer with JSON only, no prose before or after:
{"items":[{"id":"SW-001","means":{"en":"...","ar":"..."},"done":{"en":"...","ar":"..."}}]}`;

const ok = (o: any) => o && typeof o.en === "string" && o.en.trim() && typeof o.ar === "string" && o.ar.trim();

async function main() {
  const mcp = await buildMcpConfig("gen-static-writeups", { ga4Admin: false, gtm: false, browser: false });
  const out: Record<string, unknown> = {};
  try {
    for (let i = 0; i < MANUAL_CHECKPOINTS.length; i += BATCH) {
      const list = MANUAL_CHECKPOINTS.slice(i, i + BATCH);
      const raw = await runClaudeHeadless({ prompt: prompt(list), mcpConfigPath: mcp.configPath, allowedTools: [], timeoutMs: 12 * 60 * 1000, effort: "low", model: "writer", label: `static write-ups ${i / BATCH + 1}` });
      const parsed = extractJsonPayload(raw) as { items?: any[] };
      for (const x of parsed.items ?? []) {
        if (x && list.some(c => c.id === x.id) && ok(x.means) && ok(x.done)) out[x.id] = { means: { en: x.means.en.trim(), ar: x.means.ar.trim() }, done: { en: x.done.en.trim(), ar: x.done.ar.trim() } };
      }
    }
  } finally {
    await mcp.cleanup();
  }
  const missing = MANUAL_CHECKPOINTS.filter(c => !out[c.id]).map(c => c.id);
  const body = Object.entries(out).map(([id, v]) => `  ${JSON.stringify(id)}: ${JSON.stringify(v)},`).join("\n");
  fs.writeFileSync(OUT, fs.readFileSync(OUT, "utf8").replace(/export const STATIC_WRITEUP[\s\S]*$/, `export const STATIC_WRITEUP: Record<string, { means: ManualText; done: ManualText }> = {\n${body}\n};\n`));
  console.log(`wrote ${Object.keys(out).length} of ${MANUAL_CHECKPOINTS.length}; missing (still written per audit): ${missing.join(", ") || "none"}`);
}
main();
