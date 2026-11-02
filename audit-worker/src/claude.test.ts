import { test } from "node:test";
import assert from "node:assert/strict";
import { callMetricsFrom, checkApiKey, claudeModel, isAccountError, isRateLimitError, newStreamInfo, readStreamEvent } from "./claude.js";
import { buildRunMetricsRow, type ActiveRun, type ClaudeCallMetrics } from "./run-metrics.js";

test("API key check: set, blank or missing", () => {
  assert.equal(checkApiKey({ ANTHROPIC_API_KEY: "sk-ant-api03-x" }).ok, true);
  assert.equal(checkApiKey({ ANTHROPIC_API_KEY: "   " }).ok, false);
  assert.equal(checkApiKey({}).ok, false);
  // The key never ends up in the log or email text.
  assert.ok(!checkApiKey({ ANTHROPIC_API_KEY: "sk-ant-secret" }).detail.includes("sk-ant-secret"));
});

test("model comes from CLAUDE_MODEL, blank means the CLI default", () => {
  assert.equal(claudeModel({ CLAUDE_MODEL: " claude-opus-5-5 " }), "claude-opus-5-5");
  assert.equal(claudeModel({ CLAUDE_MODEL: "" }), undefined);
  assert.equal(claudeModel({}), undefined);
});

test("account errors are told apart from rate limits", () => {
  const account = [
    'claude -p exited with code 1: API Error: 401 {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}',
    "claude -p exited with code 1: Invalid API key · Fix external API key",
    "Credit balance is too low",
    'API Error: 403 {"type":"error","error":{"type":"permission_error","message":"Your API key does not have permission to use the specified resource."}}',
    'API Error: 402 {"type":"error","error":{"type":"billing_error","message":"There is an issue with your billing information."}}',
    'API Error: 400 {"type":"error","error":{"type":"invalid_request_error","message":"You have reached your specified API usage limits. You will regain access on 2026-12-01 at 00:00 UTC."}}',
    "API Error: 429 workspace spend limit reached",
  ];
  for (const message of account) assert.equal(isAccountError(new Error(message)), true, message);

  const rateOnly = [
    'API Error: 429 {"type":"error","error":{"type":"rate_limit_error","message":"Number of request tokens has exceeded your per-minute rate limit"}}',
    'API Error: 529 {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}',
    "Claude AI usage limit reached|1757440800",
  ];
  for (const message of rateOnly) {
    assert.equal(isAccountError(new Error(message)), false, message);
    assert.equal(isRateLimitError(new Error(message)), true, message);
  }

  // Ordinary failures, and a store page that talks about store credit.
  for (const message of ["Audit response missing a 'categories' array: {}", "claude -p timed out after 60000ms: Check your credit balance in your account"]) {
    assert.equal(isAccountError(new Error(message)), false, message);
  }
});

const stream = [
  { type: "system", subtype: "init", model: "claude-opus-5-5", apiKeySource: "ANTHROPIC_API_KEY", tools: [] },
  { type: "assistant", message: {} },
  { type: "system", subtype: "api_retry", error_status: 529 },
  { type: "system", subtype: "api_retry", error_status: 429 },
  {
    type: "result",
    subtype: "success",
    result: "{}",
    num_turns: 7,
    duration_api_ms: 61_000,
    total_cost_usd: 1.2345,
    usage: { input_tokens: 1, output_tokens: 1 },
    modelUsage: {
      "claude-opus-5-5": { inputTokens: 1000, outputTokens: 200, cacheReadInputTokens: 5000, cacheCreationInputTokens: 300, costUSD: 1.2, costBasis: "list" },
      "claude-haiku-5-5": { inputTokens: 10, outputTokens: 2, cacheReadInputTokens: 0, cacheCreationInputTokens: 0, costUSD: 0.0345, costBasis: "list" },
    },
  },
];

test("a call's metrics are read from its stream", () => {
  const info = newStreamInfo();
  for (const event of stream) readStreamEvent(info, event);
  const m = callMetricsFrom(info, { label: "audit", startedAt: 0, endedAt: 90_000, ok: true });

  assert.equal(m.model, "claude-opus-5-5");
  assert.equal(m.authSource, "ANTHROPIC_API_KEY");
  assert.equal(m.retries, 2);
  assert.deepEqual(m.retryStatuses, [529, 429]);
  assert.equal(m.turns, 7);
  assert.equal(m.apiMs, 61_000);
  assert.equal(m.costUsd, 1.2345);
  // Summed across models (modelUsage), not the main-loop-only usage.
  assert.deepEqual(m.tokens, { input: 1010, output: 202, cacheRead: 5000, cacheCreation: 300 });
  assert.equal(m.models?.["claude-haiku-5-5"]?.costUsd, 0.0345);
});

test("tokens fall back to usage when the result has no modelUsage", () => {
  const info = newStreamInfo();
  readStreamEvent(info, { type: "result", usage: { input_tokens: 5, output_tokens: 6, cache_read_input_tokens: 7, cache_creation_input_tokens: 8 } });
  const m = callMetricsFrom(info, { label: "x", startedAt: 0, endedAt: 1, ok: true });
  assert.deepEqual(m.tokens, { input: 5, output: 6, cacheRead: 7, cacheCreation: 8 });
  assert.equal(m.retries, 0);
  assert.equal(m.retryStatuses, undefined);
  assert.equal(m.authSource, undefined);
});

test("a finished run becomes one audit_run_metrics row", () => {
  const call = (over: Partial<ClaudeCallMetrics>): ClaudeCallMetrics => ({
    label: "c", startedAt: 0, endedAt: 1000, ok: true, retries: 0,
    model: "claude-opus-5-5", authSource: "ANTHROPIC_API_KEY",
    tokens: { input: 10, output: 5, cacheRead: 100, cacheCreation: 1 },
    ...over,
  });
  const run: ActiveRun = {
    requestId: "req-1", website: "https://store.com", attempt: 2, isTest: true, workerId: "w-1",
    startedAt: Date.parse("2026-11-02T10:00:00Z"),
    calls: [call({ costUsd: 1.11114, retries: 1 }), call({ startedAt: 5000, endedAt: 8000, costUsd: 0.2 })],
    stages: { audit: 60_000, translate: 9000 },
  };
  const row = buildRunMetricsRow(run, Date.parse("2026-11-02T10:05:00Z"), "failed", "x".repeat(3000));

  assert.equal(row.audit_request_id, "req-1");
  assert.equal(row.attempt, 2);
  assert.equal(row.is_test, true);
  assert.equal(row.outcome, "failed");
  assert.equal(row.error?.length, 2000);
  assert.equal(row.model, "claude-opus-5-5");
  assert.equal(row.auth_source, "ANTHROPIC_API_KEY");
  assert.equal(row.total_ms, 300_000);
  assert.equal(row.claude_ms, 4000);
  assert.equal(row.cost_usd, 1.3111);
  assert.equal(row.input_tokens, 20);
  assert.equal(row.cache_read_tokens, 200);
  assert.equal(row.retries, 1);
  assert.deepEqual(row.stages, { audit: 60_000, translate: 9000 });
  assert.equal(row.calls.length, 2);
});

test("a run with no Claude calls still makes a row, with zeros and no model", () => {
  const run: ActiveRun = { requestId: "r", website: "w", attempt: 1, isTest: false, workerId: "w", startedAt: 0, calls: [], stages: {} };
  const row = buildRunMetricsRow(run, 10, "completed");
  assert.equal(row.model, null);
  assert.equal(row.auth_source, null);
  assert.equal(row.error, null);
  assert.equal(row.cost_usd, 0);
});
