// The audit a log line belongs to. poll.ts starts a context per audit with
// runWithLog; logger.ts reads it on every console.* call and adds the ID, so
// lines from deep inside crawl, claude -p, the prompt checks or the heartbeat
// timer all carry it without anything passing it down. Same field name as the
// API's Vercel logs (api/_lib/log.js): one audit ID finds both.
//
// AsyncLocalStorage follows awaits, promise chains, timers and child-process
// callbacks started inside runWithLog, and never leaks into anything outside.
// Kept apart from logger.ts (which patches console on import) so tests can
// use it without that side effect.
import { AsyncLocalStorage } from "node:async_hooks";
import { inspect } from "node:util";

export interface LogContext {
  auditId?: string;
}

const context = new AsyncLocalStorage<LogContext>();

export function runWithLog<T>(fields: LogContext, fn: () => T): T {
  return context.run({ ...fields }, fn);
}

/** Adds fields to the current context. No-op outside one. */
export function setLogContext(fields: LogContext): void {
  const store = context.getStore();
  if (store) Object.assign(store, fields);
}

export function currentLogContext(): LogContext {
  return context.getStore() ?? {};
}

/** The console.* arguments as one string, the way console itself would show them. */
export function formatArgs(args: unknown[]): string {
  return args.map(a => (typeof a === "string" ? a : inspect(a, { depth: 4 }))).join(" ");
}

/**
 * One stdout line for Railway: JSON whose `level` and `message` Railway reads
 * natively; every other field (auditId) is filterable, e.g. @auditId:<id>.
 */
export function jsonLine(level: string, args: unknown[], ctx: LogContext): string {
  return JSON.stringify({ level, message: formatArgs(args), ...ctx });
}

/** One line for the daily log file. */
export function fileLine(level: string, args: unknown[], ctx: LogContext, now = new Date()): string {
  const id = ctx.auditId ? ` [${ctx.auditId}]` : "";
  return `[${now.toISOString()}] [${level.toUpperCase()}]${id} ${formatArgs(args)}\n`;
}
