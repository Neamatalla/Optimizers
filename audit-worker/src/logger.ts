// Tees every console.* call to a daily log file, in addition to stdout —
// so a worker with no attached terminal to scroll back through still has a
// persistent record. Import this FIRST, before any
// other module, so nothing logs before the tee is installed.
//
// Every line carries the audit it belongs to (see log-context.ts). In
// production (the Docker image) stdout is one JSON line per call for
// Railway; in a terminal it stays plain console output, prefixed with a
// short ID. Every script imports this too, so a run from a shell on the
// container lands in the same daily file.
import { appendFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { currentLogContext, fileLine, jsonLine } from "./log-context.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, "..", "logs");
mkdirSync(logDir, { recursive: true });

// JSON only for what Railway collects: the worker's own stdout, a pipe. A
// script run from a shell on the container (requeue, fud-run) has a terminal,
// and its output never reaches Railway's logs anyway, so it stays readable.
const json = process.env.NODE_ENV === "production" && !process.stdout.isTTY;
// Daily files older than this are deleted; the volume isn't an archive.
const KEEP_DAYS = 30;

let today = "";

function currentLogFile(): string {
  const day = new Date().toISOString().slice(0, 10);
  // Checked on each new day, not just at startup: the worker can run for weeks.
  if (day !== today) {
    today = day;
    pruneOldLogs();
  }
  return path.join(logDir, `worker-${day}.log`);
}

function pruneOldLogs(): void {
  const cutoff = new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  try {
    for (const name of readdirSync(logDir)) {
      const day = name.match(/^worker-(\d{4}-\d{2}-\d{2})\.log$/)?.[1];
      if (day && day < cutoff) unlinkSync(path.join(logDir, name));
    }
  } catch {
    // Old files are only a disk-space matter; never worth crashing over.
  }
}

function wrap(level: string, original: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    const ctx = currentLogContext();
    if (json) original(jsonLine(level, args, ctx));
    else if (ctx.auditId) original(`[${ctx.auditId.slice(0, 8)}]`, ...args);
    else original(...args);
    try {
      appendFileSync(currentLogFile(), fileLine(level, args, ctx));
    } catch {
      // Logging must never crash the worker — stdout already has it either way.
    }
  };
}

console.log = wrap("info", console.log.bind(console));
console.info = wrap("info", console.info.bind(console));
console.warn = wrap("warn", console.warn.bind(console));
console.error = wrap("error", console.error.bind(console));
