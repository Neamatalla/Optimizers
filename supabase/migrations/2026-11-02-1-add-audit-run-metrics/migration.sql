-- Time and Claude API cost per audit attempt. See README.md in this folder.
--
-- The worker inserts one row when an attempt ends, however it ends
-- (audit-worker/src/run-metrics.ts builds it, supabase.ts saves it). A
-- request retried three times has three rows. Cost is the Claude CLI's own
-- estimate; the Anthropic Console is the bill.

create table if not exists audit_run_metrics (
  id uuid primary key default gen_random_uuid(),
  audit_request_id uuid not null references audit_requests(id) on delete cascade,
  attempt int not null,
  worker_id text not null,
  is_test boolean not null default false,
  -- completed | retry_scheduled | failed | rate_limited | account_error | lost_lease
  outcome text not null,
  error text,
  -- The model(s) the calls ran on, and what they were billed to
  -- ('ANTHROPIC_API_KEY' when billed to the API key, as expected).
  model text,
  auth_source text,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  total_ms bigint not null,
  -- Wall time spent inside claude -p calls.
  claude_ms bigint not null default 0,
  cost_usd numeric(10, 4) not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  cache_read_tokens bigint not null default 0,
  cache_write_tokens bigint not null default 0,
  -- API calls the Claude CLI retried itself (429, 529 ...).
  retries int not null default 0,
  -- One entry per claude -p call: label, time, model, tokens, cost.
  calls jsonb not null default '[]',
  -- Stage name -> milliseconds, for the stages this attempt finished.
  stages jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists audit_run_metrics_request_idx on audit_run_metrics (audit_request_id);
create index if not exists audit_run_metrics_started_idx on audit_run_metrics (started_at);

-- Only the worker (secret key) reads and writes it.
alter table audit_run_metrics enable row level security;
