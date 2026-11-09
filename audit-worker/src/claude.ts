import { spawn } from "child_process";

// Project settings only: the machine user's own hooks, plugins and skills
// (~/.claude) stay out of the worker's runs. On the laptop, user-level
// SessionStart hooks injected their text into every call, and Claude Code
// 2.1.300 crashed on it (exit 0xC0000409) before the first API turn.
// Managed settings (the Docker image's) still apply.
const SETTING_SOURCES = ["--setting-sources", "project"];
import { recordClaudeCall, type ClaudeCallMetrics, type ModelCallUsage, type TokenCounts } from "./run-metrics.js";

export interface ClaudeRunOptions {
  prompt: string;
  mcpConfigPath: string;
  allowedTools: string[];
  timeoutMs?: number;
  // "low"/"medium"/"high"/"xhigh"/"max" — passed straight through as
  // `--effort`. Omitted entirely (CLI default) for the main audit run, which
  // genuinely needs to reason across live tool calls; set to "low" for
  // mechanical, no-tool work like translate-ar.ts's pass, where extended
  // thinking is pure overhead on a task that has nothing to decide.
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  // "main" (default) runs on CLAUDE_MODEL. "writer" runs on
  // CLAUDE_WRITER_MODEL: the steps that only write text from evidence the
  // worker already has (checklist, translation, judge, action repair).
  model?: "main" | "writer";
  // Name for this call in the [claude-usage] log and run-metrics summary.
  label?: string;
}

// How much raw stdout to keep for error messages. stream-json writes every
// turn (tool results included, which can be whole page snapshots), so the
// full stream is never held in memory — only parsed line by line.
const STDOUT_TAIL_CHARS = 8000;

/** What one claude -p call's stream said about itself, filled in line by line. */
export interface StreamInfo {
  // From the first (system/init) event.
  model?: string;
  authSource?: string;
  // system/api_retry events: API calls the CLI retried itself.
  retries: number;
  retryStatuses: number[];
  // The final result event (the old --output-format json envelope).
  result: any | null;
}

export function newStreamInfo(): StreamInfo {
  return { retries: 0, retryStatuses: [], result: null };
}

/** Reads one parsed stream-json event into `info`. Unknown events are ignored. */
export function readStreamEvent(info: StreamInfo, event: any): void {
  if (event?.type === "system" && event.subtype === "init") {
    if (typeof event.model === "string") info.model = event.model;
    if (typeof event.apiKeySource === "string") info.authSource = event.apiKeySource;
  } else if (event?.type === "system" && event.subtype === "api_retry") {
    info.retries++;
    if (typeof event.error_status === "number") info.retryStatuses.push(event.error_status);
  } else if (event?.type === "result") {
    info.result = event;
  }
}

const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const maybeNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

/**
 * The metrics for one finished call. Tokens come from modelUsage (per model,
 * subagents included) when the result has it, else from usage (main loop only).
 */
export function callMetricsFrom(info: StreamInfo, call: { label: string; startedAt: number; endedAt: number; ok: boolean }): ClaudeCallMetrics {
  const r = info.result;
  let models: Record<string, ModelCallUsage> | undefined;
  if (r?.modelUsage && typeof r.modelUsage === "object") {
    models = {};
    for (const [name, u] of Object.entries<any>(r.modelUsage)) {
      models[name] = {
        input: count(u?.inputTokens),
        output: count(u?.outputTokens),
        cacheRead: count(u?.cacheReadInputTokens),
        cacheCreation: count(u?.cacheCreationInputTokens),
        costUsd: maybeNumber(u?.costUSD),
        costBasis: typeof u?.costBasis === "string" ? u.costBasis : undefined,
      };
    }
  }
  let tokens: TokenCounts | undefined;
  if (models && Object.keys(models).length > 0) {
    const all = Object.values(models);
    tokens = {
      input: all.reduce((s, m) => s + m.input, 0),
      output: all.reduce((s, m) => s + m.output, 0),
      cacheRead: all.reduce((s, m) => s + m.cacheRead, 0),
      cacheCreation: all.reduce((s, m) => s + m.cacheCreation, 0),
    };
  } else if (r?.usage) {
    tokens = {
      input: count(r.usage.input_tokens),
      output: count(r.usage.output_tokens),
      cacheRead: count(r.usage.cache_read_input_tokens),
      cacheCreation: count(r.usage.cache_creation_input_tokens),
    };
  }
  return {
    ...call,
    model: info.model,
    authSource: info.authSource,
    retries: info.retries,
    retryStatuses: info.retries > 0 ? info.retryStatuses : undefined,
    apiMs: maybeNumber(r?.duration_api_ms),
    turns: maybeNumber(r?.num_turns),
    costUsd: maybeNumber(r?.total_cost_usd),
    tokens,
    models,
  };
}

/** The model every claude -p call asks for (CLAUDE_MODEL), or undefined for the CLI default. */
export function claudeModel(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.CLAUDE_MODEL?.trim() || undefined;
}

/** The model for the writing steps (CLAUDE_WRITER_MODEL), or CLAUDE_MODEL when that's blank. */
export function writerModel(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.CLAUDE_WRITER_MODEL?.trim() || claudeModel(env);
}

export interface ApiKeyStatus {
  ok: boolean;
  // For the log line and alert email. Never contains the key itself.
  detail: string;
}

/**
 * Whether ANTHROPIC_API_KEY is set. The worker bills Claude to that key:
 * with it set, `claude -p` always uses it, ahead of any saved subscription
 * login. poll.ts checks it before claiming work, so a missing key pauses the
 * worker instead of failing audits (or quietly using a subscription login).
 * A key that is set but wrong shows up later as an account error
 * (isAccountError). Never throws.
 */
export function checkApiKey(env: NodeJS.ProcessEnv = process.env): ApiKeyStatus {
  return env.ANTHROPIC_API_KEY?.trim()
    ? { ok: true, detail: "ANTHROPIC_API_KEY is set" }
    : { ok: false, detail: "ANTHROPIC_API_KEY is not set" };
}

// Heuristic match against whatever `claude -p` printed (runClaudeHeadless
// reports BOTH its streams for exactly this reason) or a thrown Google API
// error surfaces — there's no structured error type to inspect across both
// sources, just message text. False negatives just mean a rate-limited run
// gets marked failed instead of retained (safe); false positives would
// wrongly retry a real failure, which is why this stays narrow to actual
// rate/quota vocabulary rather than e.g. generic "error". "usage limit" is
// the Claude CLI's own wording for a plan limit, distinct from an API 429.
// Shared by poll.ts (whole-request retry) and translate-ar.ts (which stops
// its per-category loop on one, since every later batch would fail too).
export function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /rate.?limit|usage limit|429|quota|resource_exhausted|too many requests|overloaded/i.test(message);
}

/**
 * The Anthropic account refused the call, and every other call will be
 * refused the same way until someone fixes it: no credit left, a spend limit
 * reached, a wrong or revoked key, no permission (API errors 400/401/402/403
 * and a spend-limit 429). Check this BEFORE isRateLimitError: a spend-limit
 * 429 also matches "429" there. Same message-text heuristic, kept narrow to
 * the API's own wording.
 */
export function isAccountError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /credit balance is too low|billing_error|authentication_error|permission_error|invalid (x-)?api[ -]key|api key (is )?(revoked|expired|disabled)|spend(ing)? limit|api usage limits?/i.test(message);
}

// When a claude -p call last finished with a result (0 = never). poll.ts uses
// it to tell that an account problem is over.
let lastSuccessAt = 0;
export function lastClaudeSuccessAt(): number {
  return lastSuccessAt;
}

/**
 * Runs `claude -p` (headless/non-interactive mode) with a scoped MCP config
 * and a pre-approved tool allowlist (required for headless runs — there's no
 * TTY to answer an interactive permission prompt). Resolves with the final
 * result envelope as JSON text (what --output-format json used to print).
 */
export async function runClaudeHeadless(opts: ClaudeRunOptions): Promise<string> {
  const bin = process.env.CLAUDE_BIN || "claude";
  // The prompt itself is NOT in argv — it's written to the child's stdin
  // below instead. Windows caps a spawned process's total command line at
  // ~32K characters; a 50-item checklist (full expected/failure/validate
  // text per point) plus the crawl's own structural-signal JSON routinely blows
  // past that on its own, and did — spawn() failed outright with
  // ENAMETOOLONG before claude ever ran. `-p` with no following value reads
  // the prompt from stdin instead, which has no such length limit.
  // stream-json (not json) because only the stream carries the init event
  // (model, billing source) and the api_retry events that run-metrics.ts
  // reports per call. --verbose is required for stream-json in print mode.
  // The final `result` line is the same envelope --output-format json used
  // to print, and is what this function still resolves with.
  // --no-session-persistence: nothing ever reads these transcripts back, and
  // each one holds whole page snapshots — in the container, HOME is on the
  // persistent volume, so they'd pile up there run after run.
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence", ...SETTING_SOURCES, "--mcp-config", opts.mcpConfigPath];
  // Omit the flag entirely when empty (e.g. OAuth already covered both GA4
  // and GTM, so no MCP server is needed) rather than passing --allowedTools "" — an
  // empty value there is untested territory, not obviously equivalent to
  // "no tools allowed".
  if (opts.allowedTools.length > 0) {
    args.push("--allowedTools", opts.allowedTools.join(","));
  }
  if (opts.effort) {
    args.push("--effort", opts.effort);
  }
  // CLAUDE_MODEL for the main audit, CLAUDE_WRITER_MODEL for the writing
  // steps. Unset: no flag, so the CLI's own default applies.
  const model = opts.model === "writer" ? writerModel() : claudeModel();
  if (model) {
    args.push("--model", model);
  }

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] });
    child.stdin.end(opts.prompt);
    let stdoutBytes = 0;
    let stdoutTail = "";
    let pendingLine = "";
    let stderr = "";
    // The init, retry and final `result` events, pulled out of the stream as
    // it arrives (readStreamEvent).
    const info = newStreamInfo();
    // The curated checklist (checklist.ts) puts 50 detailed points in front
    // of Claude at once, each answered in two registers (types.ts's
    // FindingVoice), plus live GA4/GTM API calls and — on the routes that
    // grant it — a real headless-browser pass over several pages. That is
    // genuinely slower than a short open-ended prompt, and the browser route
    // is the slowest of the three by a wide margin.
    //
    // A flat 15 minutes used to be hardcoded here, which killed a real
    // GA4-only run mid-flight (2026-09-09) — the browser route needs more
    // than that. Callers now pass a route-aware budget (audit-prompt.ts's
    // runAudit), and CLAUDE_TIMEOUT_MS overrides everything for an operator
    // who knows their machine is slower or faster.
    //
    // This runs as a background job (the visitor already got their
    // response), so a generous ceiling costs nothing but a slower failure
    // when something is truly stuck.
    const envTimeout = Number(process.env.CLAUDE_TIMEOUT_MS);
    const timeoutMs = Number.isFinite(envTimeout) && envTimeout > 0
      ? envTimeout
      : opts.timeoutMs ?? 20 * 60 * 1000;
    const startedAt = Date.now();
    let recorded = false;
    const record = (ok: boolean) => {
      if (recorded) return;
      recorded = true;
      recordClaudeCall(callMetricsFrom(info, { label: opts.label ?? "claude -p", startedAt, endedAt: Date.now(), ok }));
    };
    const handleLine = (line: string) => {
      if (!line.trim()) return;
      let event: any;
      try {
        event = JSON.parse(line);
      } catch {
        return;
      }
      const hadSource = info.authSource !== undefined;
      readStreamEvent(info, event);
      // The worker must bill the API key. With the key set, the CLI always
      // uses it, so this only fires if something unexpected wins.
      if (!hadSource && info.authSource !== undefined && info.authSource !== "ANTHROPIC_API_KEY") {
        console.warn(`[claude] WARNING: ${opts.label ?? "claude -p"} is billed to "${info.authSource}", not ANTHROPIC_API_KEY`);
      }
    };
    // Everything the process printed that isn't parsed out above is only
    // kept as a short tail, for the error messages below.
    const failureDetail = () => {
      const resultEvent = info.result;
      const resultText = typeof resultEvent?.result === "string" ? resultEvent.result : "";
      return [stderr.trim(), resultText.trim(), stdoutTail.trim()].filter(Boolean).join(" | ");
    };
    // A prior timeout here (2026-09-15, GA4+GTM route, 25min) discarded
    // stdout/stderr entirely on reject, so there was zero evidence of what
    // claude -p was doing when it got killed. The heartbeat tells the next
    // occurrence whether the process was making progress (stdout climbing —
    // stream-json writes every turn as it happens) or truly hung (flatlined).
    const heartbeat = setInterval(() => {
      const elapsedSec = Math.round((Date.now() - startedAt) / 1000);
      console.log(`[claude] still running after ${elapsedSec}s — stdout ${stdoutBytes}B, stderr ${stderr.length}B`);
    }, 60_000);
    const timer = setTimeout(() => {
      clearInterval(heartbeat);
      child.kill("SIGKILL");
      record(false);
      const detail = failureDetail() || "(no output captured on either stream before the kill)";
      reject(new Error(`claude -p timed out after ${timeoutMs}ms: ${detail.slice(0, 4000)}`));
    }, timeoutMs);

    child.stdout.on("data", chunk => {
      const text = chunk.toString();
      stdoutBytes += text.length;
      stdoutTail = (stdoutTail + text).slice(-STDOUT_TAIL_CHARS);
      const lines = (pendingLine + text).split(/\r?\n/);
      pendingLine = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
    });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("error", err => {
      clearTimeout(timer);
      clearInterval(heartbeat);
      record(false);
      reject(err);
    });
    child.on("close", code => {
      clearTimeout(timer);
      clearInterval(heartbeat);
      handleLine(pendingLine);
      pendingLine = "";
      const resultEvent = info.result;
      record(code === 0 && resultEvent !== null);
      if (code !== 0) {
        // Both streams AND the result text, because the CLI puts its actual
        // diagnosis on STDOUT, not stderr — a usage-limit refusal exits 1
        // with stderr completely empty. Reporting stderr alone produced
        // "claude -p exited with code 1: " with nothing after the colon,
        // which threw away the only copy of the reason AND defeated poll.ts's
        // isRateLimitError (it matches on this message), so a transient
        // limit was recorded as a permanent failure instead of being
        // retried. Two real audits died that way.
        const detail = failureDetail() || "(no output on either stream)";
        reject(new Error(`claude -p exited with code ${code}: ${detail.slice(0, 4000)}`));
        return;
      }
      if (!resultEvent) {
        reject(new Error(`claude -p exited 0 without a result event: ${(failureDetail() || "(no output)").slice(0, 4000)}`));
        return;
      }
      // Same envelope --output-format json printed, so extractJsonPayload /
      // extractTextPayload below are unchanged.
      if (resultEvent.is_error !== true) lastSuccessAt = Date.now();
      resolve(JSON.stringify(resultEvent));
    });
  });
}

/**
 * `--output-format json` wraps the final answer in a CLI result envelope
 * (roughly `{ type: "result", result: "<final text>", ... }`). Our prompt
 * instructs Claude to make that final text pure JSON matching AuditResult,
 * but models sometimes wrap it in prose or a ```json fence anyway, so this
 * unwraps defensively rather than assuming an exact shape.
 */
export function extractJsonPayload(rawStdout: string): unknown {
  let outer: any;
  try {
    outer = JSON.parse(rawStdout);
  } catch {
    throw new Error("claude -p did not return valid JSON on stdout");
  }

  // Already the shape we want (no envelope).
  if (outer && typeof outer === "object" && "categories" in outer && "overallScore" in outer) {
    return outer;
  }

  const innerText: string | undefined = outer?.result ?? outer?.content ?? undefined;
  if (typeof innerText !== "string") {
    throw new Error("claude -p JSON envelope had no 'result' text to parse");
  }

  const fenced = innerText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : innerText;

  try {
    return JSON.parse(candidate);
  } catch {
    // A naive `\{[\s\S]*\}` / `\[[\s\S]*\]` greedy-regex fallback (the old
    // approach here) breaks two different ways this candidate text has
    // actually shown up malformed in practice, both discovered 2026-09-15
    // debugging why translate-ar.ts's GTM batch kept failing:
    //   1. For an ARRAY of N objects, a "{...}"-shaped regex spans from the
    //      first item's opening "{" to the LAST item's closing "}" — i.e.
    //      multiple top-level objects joined by commas, which isn't valid
    //      JSON on its own and throws right after the first item closes.
    //   2. Real observed content: Claude attempted a Write tool call this
    //      pass has deliberately left off `allowedTools` for (translate-ar's
    //      calls are pure text-in/text-out, no tools needed) — the CLI
    //      blocks it and injects "Write blocked. Output result directly
    //      instead." into the SAME final-answer text, right before the
    //      actual JSON. A greedy regex still finds a first "[" and a last
    //      "]", but if that preamble (or anything after the real JSON ends)
    //      contains ITS OWN brackets, the "first-to-last" span silently
    //      grabs more than just the real payload.
    // extractBalancedJson below fixes both: it finds the first "[" or "{"
    // and walks forward tracking bracket depth (ignoring brackets inside
    // string literals) until depth returns to zero, then hands JSON.parse
    // exactly that substring — correct regardless of what surrounds it.
    const extracted = extractBalancedJson(candidate);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        // Include a real snippet of what Claude actually returned — a bare
        // position number (JSON.parse's own error) is useless for diagnosing
        // a recurrence without this, since the raw response is never logged
        // anywhere else.
        throw new Error(`claude -p's final answer wasn't valid JSON even after extracting the outer bracketed value (${reason}). First 300 chars: ${JSON.stringify(candidate.slice(0, 300))}`);
      }
    }
    throw new Error(`Could not locate a JSON array or object in claude -p's final answer. First 300 chars: ${JSON.stringify(candidate.slice(0, 300))}`);
  }
}

/**
 * Finds the first top-level "[" or "{" in `text` and returns the exact
 * substring up through its matching close, tracking depth and skipping over
 * string-literal contents (so a bracket character inside a quoted JSON
 * string value never throws off the count). Returns null if no balanced
 * bracketed value is found. See extractJsonPayload's own comment for why a
 * plain greedy regex isn't safe here.
 */
function extractBalancedJson(text: string): string | null {
  const start = text.search(/[[{]/);
  if (start === -1) return null;

  const open = text[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export function extractTextPayload(rawStdout: string): string {
  let outer: any;
  try {
    outer = JSON.parse(rawStdout);
  } catch {
    throw new Error("claude -p did not return valid JSON on stdout");
  }

  if (typeof outer === "string") return outer;

  const innerText: string | undefined = outer?.result ?? outer?.content ?? undefined;
  if (typeof innerText !== "string") {
    throw new Error("claude -p JSON envelope had no 'result' text to parse");
  }

  return innerText;
}
