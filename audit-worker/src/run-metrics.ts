import fs from "node:fs";
import path from "node:path";

/**
 * Per-run timing + Claude plan usage for one audit request.
 *
 * Wall-clock time comes from Date.now() around the whole job (tick() in
 * poll.ts). Plan usage comes from the `rate_limit_event` lines `claude -p
 * --output-format stream-json` emits (see claude.ts): each carries the
 * account's current 5-hour and 7-day window utilization as a 0-1 fraction.
 * The first reading of the first call vs the last reading of the last call
 * is how much of the window this run moved.
 *
 * Caveat, stated in every summary: the window is shared by the whole
 * account, so anything else using Claude at the same time (an interactive
 * Claude Code session, claude.ai) lands in the same delta. Run nothing else
 * during a measurement run for a clean number.
 *
 * Every finished run is also appended to output/run-metrics.jsonl, so the
 * numbers survive the terminal (the worker has been killed mid-session
 * before, taking its console output with it).
 */

export interface UsageWindows {
  fiveHour?: number;
  sevenDay?: number;
  fiveHourResetsAt?: number;
}

export interface ClaudeCallMetrics {
  label: string;
  startedAt: number;
  endedAt: number;
  ok: boolean;
  apiMs?: number;
  turns?: number;
  costUsd?: number;
  tokens?: { input: number; output: number; cacheRead: number; cacheCreation: number };
  // First and last rate_limit_event seen during this call.
  usageStart?: UsageWindows;
  usageEnd?: UsageWindows;
}

interface ActiveRun {
  requestId: string;
  website: string;
  attempt: number;
  startedAt: number;
  calls: ClaudeCallMetrics[];
}

let active: ActiveRun | null = null;

export function startRunMetrics(requestId: string, website: string, attempt: number): void {
  active = { requestId, website, attempt, startedAt: Date.now(), calls: [] };
}

// A call outside a tracked run (test-run.ts, preview scripts) is still
// logged on its own line, just not added to any job summary.
export function recordClaudeCall(call: ClaudeCallMetrics): void {
  console.log(`[claude-usage] ${describeCall(call)}`);
  active?.calls.push(call);
}

/** Exact elapsed time between two timestamps, as "1h 04m 09.312s". */
export function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, "0")}m ${seconds}s` : `${minutes}m ${seconds}s`;
}

function pct(fraction: number | undefined): string {
  return fraction === undefined ? "n/a" : `${(fraction * 100).toFixed(1)}%`;
}

function windowDelta(start?: number, end?: number): string {
  if (start === undefined || end === undefined) return `${pct(start)} -> ${pct(end)}`;
  const delta = (end - start) * 100;
  return `${pct(start)} -> ${pct(end)} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts)`;
}

function describeCall(c: ClaudeCallMetrics): string {
  const t = c.tokens;
  return [
    `${c.label}${c.ok ? "" : " (FAILED)"}: ${formatDuration(c.endedAt - c.startedAt)} wall`,
    c.apiMs !== undefined ? `${formatDuration(c.apiMs)} API` : null,
    c.turns !== undefined ? `${c.turns} turns` : null,
    t ? `tokens in ${t.input} / out ${t.output} / cache read ${t.cacheRead} / cache write ${t.cacheCreation}` : null,
    c.costUsd !== undefined ? `$${c.costUsd.toFixed(2)} list-price equiv.` : null,
    `5h window ${windowDelta(c.usageStart?.fiveHour, c.usageEnd?.fiveHour)}`,
  ].filter(Boolean).join(" · ");
}

/**
 * Logs the run summary and appends it to output/run-metrics.jsonl.
 * `endUsage` is a reading taken after the last call (readUsageWindows in
 * claude.ts) — without it the end of the window delta is the START of the
 * last call, missing whatever that call itself used.
 */
export function hasClaudeCalls(): boolean {
  return (active?.calls.length ?? 0) > 0;
}

export function finishRunMetrics(outcome: string, endUsage?: UsageWindows): void {
  if (!active) return;
  const run = active;
  active = null;
  const endedAt = Date.now();

  const readings = [...run.calls.flatMap(c => [c.usageStart, c.usageEnd]), endUsage].filter((u): u is UsageWindows => Boolean(u));
  const first = readings[0];
  const last = readings[readings.length - 1];
  const claudeMs = run.calls.reduce((sum, c) => sum + (c.endedAt - c.startedAt), 0);
  const cost = run.calls.reduce((sum, c) => sum + (c.costUsd ?? 0), 0);

  const lines = [
    `===== Run metrics: ${run.requestId} (${run.website}), attempt ${run.attempt} =====`,
    `Outcome:           ${outcome}`,
    `Started:           ${new Date(run.startedAt).toISOString()}`,
    `Finished:          ${new Date(endedAt).toISOString()}`,
    `Total time:        ${formatDuration(endedAt - run.startedAt)}`,
    `claude -p calls:   ${run.calls.length}, ${formatDuration(claudeMs)} combined`,
    ...run.calls.map(c => `  - ${describeCall(c)}`),
    `5-hour window:     ${windowDelta(first?.fiveHour, last?.fiveHour)}` +
      (last?.fiveHourResetsAt ? `, resets ${new Date(last.fiveHourResetsAt * 1000).toISOString()}` : ""),
    `7-day window:      ${windowDelta(first?.sevenDay, last?.sevenDay)}`,
    `Cost (list price): $${cost.toFixed(2)} (plan usage, not billed)`,
    `Note: the windows are account-wide; other Claude use during this run is included in the delta.`,
    `=====`,
  ];
  console.log(lines.join("\n"));

  try {
    const dir = path.resolve(process.cwd(), "output");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(
      path.join(dir, "run-metrics.jsonl"),
      JSON.stringify({
        requestId: run.requestId,
        website: run.website,
        attempt: run.attempt,
        outcome,
        startedAt: new Date(run.startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        totalMs: endedAt - run.startedAt,
        totalFormatted: formatDuration(endedAt - run.startedAt),
        fiveHourStart: first?.fiveHour,
        fiveHourEnd: last?.fiveHour,
        sevenDayStart: first?.sevenDay,
        sevenDayEnd: last?.sevenDay,
        costUsd: cost,
        calls: run.calls,
      }) + "\n",
    );
  } catch (err) {
    console.warn("[run-metrics] Could not write output/run-metrics.jsonl:", err instanceof Error ? err.message : err);
  }
}
