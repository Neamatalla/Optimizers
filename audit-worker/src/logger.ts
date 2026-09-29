// Tees every console.* call to a daily log file, in addition to stdout —
// so the service running under tmole (no attached terminal to scroll back
// through) still has a persistent record. Import this FIRST, before any
// other module, so nothing logs before the tee is installed.
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, "..", "logs");
mkdirSync(logDir, { recursive: true });

function currentLogFile(): string {
  return path.join(logDir, `worker-${new Date().toISOString().slice(0, 10)}.log`);
}

function format(args: unknown[]): string {
  return args.map(a => (typeof a === "string" ? a : inspect(a, { depth: 4 }))).join(" ");
}

function wrap(level: string, original: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    original(...args);
    try {
      appendFileSync(currentLogFile(), `[${new Date().toISOString()}] [${level}] ${format(args)}\n`);
    } catch {
      // Logging must never crash the worker — stdout already has it either way.
    }
  };
}

console.log = wrap("LOG", console.log.bind(console));
console.info = wrap("INFO", console.info.bind(console));
console.warn = wrap("WARN", console.warn.bind(console));
console.error = wrap("ERROR", console.error.bind(console));
