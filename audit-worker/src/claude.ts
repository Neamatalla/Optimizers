import { spawn } from "child_process";

export interface ClaudeRunOptions {
  prompt: string;
  mcpConfigPath: string;
  allowedTools: string[];
  timeoutMs?: number;
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
  // text per point) plus the site-wide PageSpeed sweep JSON routinely blows
  // past that on its own, and did — spawn() failed outright with
  // ENAMETOOLONG before claude ever ran. `-p` with no following value reads
  // the prompt from stdin instead, which has no such length limit.
  const args = ["-p", "--output-format", "json", "--mcp-config", opts.mcpConfigPath];
  // Omit the flag entirely when empty (e.g. OAuth already covered both GA4
  // and GTM, no Clarity token) rather than passing --allowedTools "" — an
  // empty value there is untested territory, not obviously equivalent to
  // "no tools allowed".
  if (opts.allowedTools.length > 0) {
    args.push("--allowedTools", opts.allowedTools.join(","));
  }

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] });
    child.stdin.end(opts.prompt);
    let stdout = "";
    let stderr = "";
    // The curated checklist (checklist.ts) can put 13-26+ detailed points in
    // front of Claude at once, plus live GA4/GTM/Clarity MCP tool calls —
    // genuinely slower than a short open-ended prompt. This runs as a
    // background job (the visitor already got their response), so a
    // generous ceiling costs nothing but a slower failure if something's
    // truly stuck.
    const timeoutMs = opts.timeoutMs ?? 15 * 60 * 1000;
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
        reject(new Error(`claude -p exited with code ${code}: ${stderr.slice(0, 2000)}`));
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
    const braceMatch = candidate.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]);
    }
    throw new Error("Could not locate a JSON object in claude -p's final answer");
  }
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
