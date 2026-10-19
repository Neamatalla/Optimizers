// One JSON line per log event, for the Vercel runtime logs. Every line made
// while a request is running carries that request's context (route, and the
// audit ID or report slug once known), so searching an audit ID finds every
// line about it — here and in the worker's Railway logs, which use the same
// field name (audit-worker/src/log-context.ts).
//
// The context lives in AsyncLocalStorage, not a module variable: one Vercel
// instance can serve several requests at once, and each request's awaits,
// timers and callbacks see only its own context.
import { AsyncLocalStorage } from "node:async_hooks";
import { sendErrorAlert } from "./error-alert.js";

const context = new AsyncLocalStorage();

// Errors don't survive JSON.stringify on their own (they become {}).
function replacer(_key, value) {
  return value instanceof Error ? { message: value.message, stack: value.stack } : value;
}

function write(level, message, fields) {
  const line = JSON.stringify({ level, message, ...context.getStore(), ...fields }, replacer);
  // console.error/warn so Vercel's level filter still works.
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (message, fields) => write("info", message, fields),
  warn: (message, fields) => write("warn", message, fields),
  error: (message, fields) => write("error", message, fields),
};

/** Adds fields (auditId, slug) to every later line of the current request. No-op outside one. */
export function setLogContext(fields) {
  const store = context.getStore();
  if (store) Object.assign(store, fields);
}

/**
 * Wraps a Vercel handler: runs it inside a fresh context and logs one line
 * when it finishes, with the status, time taken and the response's error text
 * (no request data), so every outcome shows up, not only crashes. A 5xx or a
 * crash also emails the reviewer (error-alert.js).
 */
export function withLog(route, handler) {
  return (req, res) =>
    context.run({ route }, async () => {
      const started = Date.now();
      let error;
      const json = res.json.bind(res);
      res.json = body => {
        if (body?.error) error = body.error;
        return json(body);
      };
      let crashed = false;
      try {
        return await handler(req, res);
      } catch (err) {
        crashed = true;
        error = err?.message || String(err);
        log.error("Handler crashed", { error: err });
        throw err;
      } finally {
        const status = res.statusCode;
        const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
        write(level, `${req.method} ${route} ${status}`, { status, ms: Date.now() - started, ...(error && { error }) });
        if (crashed || status >= 500) {
          const { auditId, slug } = context.getStore();
          try {
            await sendErrorAlert({ route, status: crashed ? "crashed" : status, error, auditId, slug });
          } catch (alertErr) {
            log.warn("Error alert email failed", { error: alertErr });
          }
        }
      }
    });
}
