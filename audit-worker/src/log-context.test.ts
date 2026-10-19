import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { currentLogContext, fileLine, jsonLine, runWithLog, setLogContext } from "./log-context.js";

test("the audit ID survives awaits, timers and child-process callbacks", async () => {
  const seen = await runWithLog({ auditId: "a1" }, async () => {
    const out: (string | undefined)[] = [];
    await new Promise(resolve => setTimeout(resolve, 5));
    out.push(currentLogContext().auditId);
    await new Promise<void>(resolve => {
      const beat = setInterval(() => { out.push(currentLogContext().auditId); clearInterval(beat); resolve(); }, 1);
    });
    await new Promise<void>(resolve => {
      const child = spawn(process.execPath, ["-e", "console.log('hi')"]);
      child.stdout.on("data", () => out.push(currentLogContext().auditId));
      child.on("close", () => resolve());
    });
    return out;
  });
  assert.deepEqual(seen, ["a1", "a1", "a1"]);
  assert.equal(currentLogContext().auditId, undefined);
});

test("two audits running at once keep their own IDs", async () => {
  const run = (id: string, wait: number) => runWithLog({ auditId: id }, async () => {
    await new Promise(resolve => setTimeout(resolve, wait));
    return currentLogContext().auditId;
  });
  assert.deepEqual(await Promise.all([run("first", 20), run("second", 5)]), ["first", "second"]);
});

test("setLogContext adds to the current context only", async () => {
  setLogContext({ auditId: "outside" });
  assert.equal(currentLogContext().auditId, undefined);
  await runWithLog({}, async () => {
    setLogContext({ auditId: "late" });
    await Promise.resolve();
    assert.equal(currentLogContext().auditId, "late");
  });
});

test("jsonLine is what Railway reads: level, message, then the context", () => {
  const line = JSON.parse(jsonLine("warn", ["[audit-worker] Heartbeat failed:", { code: 1 }], { auditId: "a1" }));
  assert.deepEqual(line, { level: "warn", message: "[audit-worker] Heartbeat failed: { code: 1 }", auditId: "a1" });
});

test("fileLine has the time, level and full audit ID", () => {
  const now = new Date("2026-10-19T12:00:00.000Z");
  assert.equal(fileLine("info", ["Saved"], { auditId: "a1" }, now), "[2026-10-19T12:00:00.000Z] [INFO] [a1] Saved\n");
  assert.equal(fileLine("error", ["Boom"], {}, now), "[2026-10-19T12:00:00.000Z] [ERROR] Boom\n");
});
