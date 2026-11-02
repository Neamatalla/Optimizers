import fs from "node:fs";
import path from "node:path";

/**
 * Per-run timing and Claude API cost for one audit attempt.
 *
 * Wall-clock time comes from Date.now() around the whole job (runClaimed in
 * poll.ts) and around each stage (poll.ts's stageTimer). Each claude -p call
 * reports its model, billing source, retries, tokens and cost, read from its
 * stream-json output (claude.ts).
 *
 * The cost is the CLI's own estimate, from the price table bundled with it.
 * The Anthropic Console's Usage page is the bill: compare the two now and
 * then.
 *
 * A finished run is printed, appended to output/run-metrics.jsonl (so the
 * numbers survive the terminal) and returned as a row for the
 * audit_run_metrics table, which poll.ts saves.
 */

export interface TokenCounts {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

// One model's share of a call (the CLI's modelUsage). costBasis "unknown"
// means the CLI has no price for that model, so its cost can't be trusted.
export interface ModelCallUsage extends TokenCounts {
  costUsd?: number;
  costBasis?: string;
}

export interface ClaudeCallMetrics {
  label: string;
  startedAt: number;
  endedAt: number;
  ok: boolean;
  // The model the call ran on, and what it was billed to ("ANTHROPIC_API_KEY"
  // when it billed the API key, as it should).
  model?: string;
  authSource?: string;
  // API calls the CLI retried itself (429/529 and the like), with their statuses.
  retries: number;
  retryStatuses?: number[];
  apiMs?: number;
  turns?: number;
  costUsd?: number;
  tokens?: TokenCounts;
  models?: Record<string, ModelCallUsage>;
}

export type RunOutcome = "completed" | "retry_scheduled" | "failed" | "rate_limited" | "account_error" | "lost_lease";

export interface ActiveRun {
  requestId: string;
  website: string;
  attempt: number;
  isTest: boolean;
  workerId: string;
  startedAt: number;
  calls: ClaudeCallMetrics[];
  // Stage name -> milliseconds, for the stages this attempt finished.
  stages: Record<string, number>;
}

// One row of audit_run_metrics (supabase/migrations/2026-11-02-1-add-audit-run-metrics).
export interface RunMetricsRow {
  audit_request_id: string;
  attempt: number;
  worker_id: string;
  is_test: boolean;
  outcome: RunOutcome;
  error: string | null;
  model: string | null;
  auth_source: string | null;
  started_at: string;
  ended_at: string;
  total_ms: number;
  claude_ms: number;
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  retries: number;
  calls: ClaudeCallMetrics[];
  stages: Record<string, number>;
}

let active: ActiveRun | null = null;

export function startRunMetrics(requestId: string, website: string, attempt: number, opts: { isTest: boolean; workerId: string }): void {
  active = { requestId, website, attempt, isTest: opts.isTest, workerId: opts.workerId, startedAt: Date.now(), calls: [], stages: {} };
}

// A call outside a tracked run (test-run.ts, preview scripts) is still
// logged on its own line, just not added to any job summary.
export function recordClaudeCall(call: ClaudeCallMetrics): void {
  console.log(`[claude-usage] ${describeCall(call)}`);
  active?.calls.push(call);
}

export function recordStage(stage: string, ms: number): void {
  if (active) active.stages[stage] = ms;
}

/** Exact elapsed time between two timestamps, as "1h 04m 09.312s". */
export function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, "0")}m ${seconds}s` : `${minutes}m ${seconds}s`;
}

function tokenText(t: TokenCounts): string {
  return `tokens in ${t.input} / out ${t.output} / cache read ${t.cacheRead} / cache write ${t.cacheCreation}`;
}

function describeCall(c: ClaudeCallMetrics): string {
  return [
    `${c.label}${c.ok ? "" : " (FAILED)"}: ${formatDuration(c.endedAt - c.startedAt)} wall`,
    c.apiMs !== undefined ? `${formatDuration(c.apiMs)} API` : null,
    c.turns !== undefined ? `${c.turns} turns` : null,
    c.model ? `model ${c.model}` : null,
    c.tokens ? tokenText(c.tokens) : null,
    c.costUsd !== undefined ? `$${c.costUsd.toFixed(2)} (estimate)` : null,
    c.retries > 0 ? `${c.retries} API retries (${(c.retryStatuses ?? []).join(", ") || "status n/a"})` : null,
    c.authSource && c.authSource !== "ANTHROPIC_API_KEY" ? `billed to ${c.authSource}, not the API key` : null,
  ].filter(Boolean).join(" · ");
}

// The distinct non-empty values, comma-joined, or null when there are none.
function distinct(values: (string | undefined)[]): string | null {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).join(", ") || null;
}

/** The audit_run_metrics row for a finished run. Pure, so it can be tested. */
export function buildRunMetricsRow(run: ActiveRun, endedAt: number, outcome: RunOutcome, error?: string): RunMetricsRow {
  const sum = (pick: (c: ClaudeCallMetrics) => number | undefined) => run.calls.reduce((total, c) => total + (pick(c) ?? 0), 0);
  return {
    audit_request_id: run.requestId,
    attempt: run.attempt,
    worker_id: run.workerId,
    is_test: run.isTest,
    outcome,
    error: error ? error.slice(0, 2000) : null,
    model: distinct(run.calls.map(c => c.model)),
    auth_source: distinct(run.calls.map(c => c.authSource)),
    started_at: new Date(run.startedAt).toISOString(),
    ended_at: new Date(endedAt).toISOString(),
    total_ms: endedAt - run.startedAt,
    claude_ms: sum(c => c.endedAt - c.startedAt),
    // Rounded to the column's 4 decimals.
    cost_usd: Math.round(sum(c => c.costUsd) * 10_000) / 10_000,
    input_tokens: sum(c => c.tokens?.input),
    output_tokens: sum(c => c.tokens?.output),
    cache_read_tokens: sum(c => c.tokens?.cacheRead),
    cache_write_tokens: sum(c => c.tokens?.cacheCreation),
    retries: sum(c => c.retries),
    calls: run.calls,
    stages: run.stages,
  };
}

/**
 * Ends the run: logs the summary, appends it to output/run-metrics.jsonl and
 * returns the row for audit_run_metrics (null when no run was started).
 */
export function finishRunMetrics(outcome: RunOutcome, error?: string): RunMetricsRow | null {
  if (!active) return null;
  const run = active;
  active = null;
  const row = buildRunMetricsRow(run, Date.now(), outcome, error);

  const stages = Object.entries(row.stages).map(([stage, ms]) => `${stage} ${formatDuration(ms)}`).join(" · ");
  const offKey = row.auth_source && row.auth_source.split(", ").some(s => s !== "ANTHROPIC_API_KEY");
  const unpriced = Array.from(new Set(run.calls.flatMap(c => Object.entries(c.models ?? {}).filter(([, u]) => u.costBasis === "unknown").map(([m]) => m))));
  const lines = [
    `===== Run metrics: ${run.requestId} (${run.website}), attempt ${run.attempt} =====`,
    `Outcome:           ${outcome}${row.error ? `: ${row.error.slice(0, 200)}` : ""}`,
    `Started:           ${row.started_at}`,
    `Finished:          ${row.ended_at}`,
    `Total time:        ${formatDuration(row.total_ms)}`,
    `Stages:            ${stages || "none finished"}`,
    `claude -p calls:   ${run.calls.length}, ${formatDuration(row.claude_ms)} combined`,
    ...run.calls.map(c => `  - ${describeCall(c)}`),
    `Model:             ${row.model ?? "n/a"}`,
    `Tokens:            ${tokenText({ input: row.input_tokens, output: row.output_tokens, cacheRead: row.cache_read_tokens, cacheCreation: row.cache_write_tokens })}`,
    `API retries:       ${row.retries}`,
    `Cost (estimate):   $${row.cost_usd.toFixed(2)}, from the CLI's price table; the Anthropic Console is the bill`,
    ...(offKey ? [`WARNING: billed to ${row.auth_source}, not only ANTHROPIC_API_KEY`] : []),
    ...(unpriced.length ? [`WARNING: the CLI has no price for ${unpriced.join(", ")}; the cost above is incomplete`] : []),
    `=====`,
  ];
  console.log(lines.join("\n"));

  try {
    const dir = path.resolve(process.cwd(), "output");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, "run-metrics.jsonl"), JSON.stringify({ ...row, website: run.website }) + "\n");
  } catch (err) {
    console.warn("[run-metrics] Could not write output/run-metrics.jsonl:", err instanceof Error ? err.message : err);
  }
  return row;
}
