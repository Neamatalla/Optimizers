// Shared fakes for the API tests. Nothing here touches the network or a real
// database: every endpoint is called with a fake request/response, and
// Supabase is replaced by fakeSupabase below.
import { mock, beforeEach, afterEach } from "node:test";

export function fakeReq({ method = "GET", query = {}, body, headers = {} } = {}) {
  return { method, query, body, headers };
}

// Covers both styles the handlers use: Express-like res.status().json() and
// Node's res.statusCode = ...; res.end().
export function fakeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { res.statusCode = code; return res; },
    setHeader(name, value) { res.headers[name.toLowerCase()] = value; return res; },
    json(body) { res.body = body; return res; },
    send(body) { res.body = body; return res; },
    end(body) { res.body = body; return res; },
  };
  return res;
}

/**
 * A stand-in for a supabase-js client. `db(query)` decides what each table
 * call returns ({ data, error }), where query is
 *   { table, op: "select" | "insert" | "update", columns, filters, row, fields }.
 * `files` maps "bucket/path" to the stored text, for storage downloads.
 * Every call is recorded in `calls` (table queries) and `uploads`.
 */
export function fakeSupabase({ db = () => ({ data: null, error: null }), files = {} } = {}) {
  const calls = [];
  const uploads = [];

  function from(table) {
    const query = { table, op: "select", columns: null, filters: {}, row: null, fields: null };
    const run = async () => {
      calls.push(query);
      return db(query);
    };
    const builder = {
      select(columns) { if (query.op === "select") query.columns = columns; return builder; },
      insert(row) { query.op = "insert"; query.row = row; return builder; },
      update(fields) { query.op = "update"; query.fields = fields; return builder; },
      eq(column, value) { query.filters[column] = value; return builder; },
      order() { return builder; },
      limit() { return builder; },
      maybeSingle: run,
      single: run,
      then(resolve, reject) { return run().then(resolve, reject); },
    };
    return builder;
  }

  const storage = {
    from(bucket) {
      return {
        async download(path) {
          const text = files[`${bucket}/${path}`];
          return text === undefined
            ? { data: null, error: { message: "Object not found" } }
            : { data: new Blob([text]), error: null };
        },
        async upload(path, body, options) {
          uploads.push({ bucket, path, body: body.toString(), options });
          return { error: null };
        },
      };
    },
  };

  return { from, storage, calls, uploads };
}

/** Sets env vars before each test and puts the old values back after. */
export function useEnv(vars) {
  let saved;
  beforeEach(() => {
    saved = {};
    for (const [key, value] of Object.entries(vars)) {
      saved[key] = process.env[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

/**
 * Makes any real network call fail, and hides the handlers' console output
 * so test results stay readable. Tests that need a fetch replace it with
 * mockFetch below.
 */
export function offlineAndQuiet() {
  let mocked = [];
  beforeEach(() => {
    mocked = [
      mock.method(globalThis, "fetch", async url => {
        throw new Error(`Network is disabled in tests (tried ${url})`);
      }),
      ...["log", "warn", "error"].map(level => mock.method(console, level, () => {})),
    ];
  });
  // Restored one by one: mock.restoreAll() would also undo the module mocks.
  afterEach(() => mocked.forEach(fn => fn.mock.restore()));
}

/** Replaces fetch for one test. `handler(url, init)` returns a Response. */
export function mockFetch(handler) {
  globalThis.fetch.mock.mockImplementation(async (url, init) => handler(String(url), init));
}

/** Fake Resend: every send lands in `sent`; set `result` to change the reply. */
export function mockResend() {
  const state = { sent: [], result: { data: { id: "email_1" }, error: null } };
  mock.module("resend", {
    exports: {
      Resend: class {
        emails = {
          send: async message => {
            state.sent.push(message);
            if (state.result instanceof Error) throw state.result;
            return state.result;
          },
        };
      },
    },
  });
  return state;
}

/** Routes createClient() to whatever `holder.client` is when the handler runs. */
export function mockSupabaseModule() {
  const holder = { client: fakeSupabase() };
  mock.module("@supabase/supabase-js", {
    exports: { createClient: () => holder.client },
  });
  return holder;
}
