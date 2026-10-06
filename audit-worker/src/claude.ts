import { spawn } from "child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { recordClaudeCall, type UsageWindows } from "./run-metrics.js";

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
  // Name for this call in the [claude-usage] log and run-metrics summary.
  label?: string;
}

// How much raw stdout to keep for error messages. stream-json writes every
// turn (tool results included, which can be whole page snapshots), so the
// full stream is never held in memory — only parsed line by line.
const STDOUT_TAIL_CHARS = 8000;

function readWindows(info: any): UsageWindows | undefined {
  const windows = info?.unifiedWindows;
  if (!windows) return undefined;
  return {
    fiveHour: typeof windows.five_hour?.utilization === "number" ? windows.five_hour.utilization : undefined,
    sevenDay: typeof windows.seven_day?.utilization === "number" ? windows.seven_day.utilization : undefined,
    fiveHourResetsAt: typeof windows.five_hour?.resetsAt === "number" ? windows.five_hour.resetsAt : undefined,
  };
}

/**
 * One throwaway `claude -p` call made only to read the account's current
 * 5-hour/7-day utilization. The CLI emits a single rate_limit_event per
 * call, at its start — so the last real call of a run can't report what it
 * used itself; this reading after it can. Stripped to the minimum
 * (no tools, MCP, skills or session file; low effort), measured at ~21k
 * tokens vs ~105k for a default call on this machine. --bare would be
 * smaller still, but it only accepts ANTHROPIC_API_KEY auth, not the plan
 * login the worker runs on. Never throws; undefined if it fails.
 */
export async function readUsageWindows(): Promise<UsageWindows | undefined> {
  const bin = process.env.CLAUDE_BIN || "claude";
  const emptyMcp = path.join(os.tmpdir(), "audit-worker-empty-mcp.json");
  try {
    fs.writeFileSync(emptyMcp, JSON.stringify({ mcpServers: {} }));
  } catch {
    return undefined;
  }
  const args = [
    "-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence",
    "--disable-slash-commands", "--strict-mcp-config", "--mcp-config", emptyMcp, "--tools", "", "--effort", "low",
  ];
  return new Promise(resolve => {
    let pending = "";
    let windows: UsageWindows | undefined;
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "ignore"] });
    const timer = setTimeout(() => child.kill("SIGKILL"), 90_000);
    child.stdin.end("Reply with the single word ok.");
    child.stdout.on("data", chunk => {
      const lines = (pending + chunk.toString()).split(/\r?\n/);
      pending = lines.pop() ?? "";
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event?.type === "rate_limit_event") windows = readWindows(event.rate_limit_info) ?? windows;
        } catch {
          // not a JSON line
        }
      }
    });
    child.on("error", () => { clearTimeout(timer); resolve(undefined); });
    child.on("close", () => { clearTimeout(timer); resolve(windows); });
  });
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
  // stream-json (not json) because only the stream carries rate_limit_event
  // lines — the account's live 5-hour/7-day window utilization, which
  // run-metrics.ts reports per run. --verbose is required for stream-json in
  // print mode. The final `result` line is the same envelope --output-format
  // json used to print, and is what this function still resolves with.
  // --no-session-persistence: nothing ever reads these transcripts back, and
  // each one holds whole page snapshots — in the container, HOME is on the
  // persistent volume, so they'd pile up there run after run.
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence", "--mcp-config", opts.mcpConfigPath];
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

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] });
    child.stdin.end(opts.prompt);
    let stdoutBytes = 0;
    let stdoutTail = "";
    let pendingLine = "";
    let stderr = "";
    // The final `result` line (the old --output-format json envelope) and
    // the usage readings, pulled out of the stream as it arrives.
    let resultEvent: any = null;
    let usageStart: UsageWindows | undefined;
    let usageEnd: UsageWindows | undefined;
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
      const usage = resultEvent?.usage;
      recordClaudeCall({
        label: opts.label ?? "claude -p",
        startedAt,
        endedAt: Date.now(),
        ok,
        apiMs: typeof resultEvent?.duration_api_ms === "number" ? resultEvent.duration_api_ms : undefined,
        turns: typeof resultEvent?.num_turns === "number" ? resultEvent.num_turns : undefined,
        costUsd: typeof resultEvent?.total_cost_usd === "number" ? resultEvent.total_cost_usd : undefined,
        tokens: usage
          ? {
              input: usage.input_tokens ?? 0,
              output: usage.output_tokens ?? 0,
              cacheRead: usage.cache_read_input_tokens ?? 0,
              cacheCreation: usage.cache_creation_input_tokens ?? 0,
            }
          : undefined,
        usageStart,
        usageEnd,
      });
    };
    const handleLine = (line: string) => {
      if (!line.trim()) return;
      let event: any;
      try {
        event = JSON.parse(line);
      } catch {
        return;
      }
      if (event?.type === "rate_limit_event") {
        const windows = readWindows(event.rate_limit_info);
        if (windows) {
          usageStart ??= windows;
          usageEnd = windows;
        }
      } else if (event?.type === "result") {
        resultEvent = event;
      }
    };
    // Everything the process printed that isn't parsed out above is only
    // kept as a short tail, for the error messages below.
    const failureDetail = () => {
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
