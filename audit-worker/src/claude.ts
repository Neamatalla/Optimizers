import { spawn } from "child_process";

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
}

/**
 * Runs `claude -p` (headless/non-interactive mode) with a scoped MCP config
 * and a pre-approved tool allowlist (required for headless runs — there's no
 * TTY to answer an interactive permission prompt). Returns raw stdout.
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
  const args = ["-p", "--output-format", "json", "--mcp-config", opts.mcpConfigPath];
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
    let stdout = "";
    let stderr = "";
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
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`claude -p timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("error", err => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", code => {
      clearTimeout(timer);
      if (code !== 0) {
        // BOTH streams, because the CLI puts its actual diagnosis on STDOUT,
        // not stderr — a usage-limit refusal exits 1 with stderr completely
        // empty. Reporting stderr alone produced "claude -p exited with code
        // 1: " with nothing after the colon, which threw away the only copy
        // of the reason AND defeated poll.ts's isRateLimitError (it matches
        // on this message), so a transient limit was recorded as a permanent
        // failure instead of being retried. Two real audits died that way.
        const detail = [stderr.trim(), stdout.trim()].filter(Boolean).join(" | ") || "(no output on either stream)";
        reject(new Error(`claude -p exited with code ${code}: ${detail.slice(0, 4000)}`));
        return;
      }
      resolve(stdout);
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
