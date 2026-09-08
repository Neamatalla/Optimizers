import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { ToolId } from "./types.js";

interface McpServerEntry {
  type: "stdio";
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface BuiltMcpConfig {
  configPath: string;
  serverNames: string[];
  cleanup: () => Promise<void>;
}

export interface NeededMcpServers {
  ga4Admin: boolean;
  gtm: boolean;
  browser: boolean;
}

/**
 * Single source of truth for "which MCP servers does THIS run actually
 * need" — used both here (to decide what to build/require env vars for)
 * and by audit-prompt.ts's buildAllowedTools (to decide what to allowlist
 * for claude -p). Keeping this in one place means the two can't drift out
 * of sync the way they briefly did: buildMcpConfig used to build/require
 * both GA4 and GTM servers unconditionally on every run — including a
 * "none of these" run that needs neither — so a deployment missing either
 * server's env vars (e.g. GA4_ADMIN_MCP_SCRIPT_PATH) would fail EVERY
 * audit, not just GA4 ones.
 */
export function neededMcpServers(opts: { tools: ToolId[]; ga4OAuthData: unknown; gtmOAuthData: unknown }): NeededMcpServers {
  return {
    // Only needed when the visitor picked the tool AND didn't already
    // supply live OAuth data for it — OAuth data is used directly, no MCP
    // round trip required.
    ga4Admin: opts.tools.includes("GA4") && !opts.ga4OAuthData,
    gtm: opts.tools.includes("GTM") && !opts.gtmOAuthData,
    // Needed whenever the run's other 25 points come from a real
    // website-code audit instead of a second tracking-tool checklist — that's
    // BOTH the "visitor has neither GA4 nor GTM" route (tools.length === 0,
    // full 46-item Website checklist) AND the "visitor has exactly one of
    // GA4/GTM" route (tools.length === 1, the 21-item WEBSITE_CODE_CHECKLIST
    // — see scoring.ts's countedCategories and checklist.ts). Only the
    // "visitor has both" route (tools.length === 2) skips Website/PageSpeed
    // entirely and so needs no browser.
    browser: opts.tools.length < 2,
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — see audit-worker/.env.example`);
  }
  return value;
}

/**
 * Builds a per-job MCP config for `claude -p --mcp-config <path>` —
 * ONLY the servers `needed` (see neededMcpServers above) actually says
 * this run requires. GA4/GTM use the operator's own existing service-
 * account-backed MCP servers (ga4-admin, google-tag-manager-mcp-server) —
 * same identity every job, no login step, works headless on a VPS.
 *
 * The browser server (chrome-devtools-mcp, real headless Chrome via
 * puppeteer, npx-fetched — no direct dependency needed in package.json)
 * adds real latency (browser boot + navigation) and a one-time ~300MB
 * Chromium install on the VPS, so it's only built when this run's other
 * 25 (or 50) points come from a real website-code audit rather than a
 * second tracking-tool checklist — the visitor picked zero or one of
 * GA4/GTM (see neededMcpServers.browser's own comment).
 */
export async function buildMcpConfig(jobId: string, needed: NeededMcpServers): Promise<BuiltMcpConfig> {
  const mcpServers: Record<string, McpServerEntry> = {};

  if (needed.ga4Admin) {
    mcpServers["ga4-admin"] = {
      type: "stdio",
      command: "node",
      args: [requireEnv("GA4_ADMIN_MCP_SCRIPT_PATH")],
      env: { GA4_SA_KEY: requireEnv("GA4_SA_KEY_PATH") },
    };
  }

  if (needed.gtm) {
    mcpServers["google-tag-manager-mcp-server"] = {
      type: "stdio",
      command: "node",
      args: [requireEnv("GTM_MCP_SCRIPT_PATH")],
      env: { GTM_SERVICE_ACCOUNT_PATH: requireEnv("GTM_SERVICE_ACCOUNT_PATH") },
    };
  }

  if (needed.browser) {
    mcpServers["chrome-devtools"] = {
      type: "stdio",
      command: "npx",
      // --isolated: temp Chrome profile per launch, not the shared default
      // one — avoids a profile-lock conflict if a prior run's browser
      // process ever gets left behind. --headless: no display on the VPS.
      // --no-usage-statistics: client website data shouldn't phone home to
      // Google's telemetry by default.
      args: ["-y", "chrome-devtools-mcp@latest", "--headless", "--isolated", "--no-usage-statistics"],
      env: {},
    };
  }

  const serverNames = Object.keys(mcpServers);

  const configPath = path.join(os.tmpdir(), `audit-worker-mcp-${jobId}.json`);
  await fs.writeFile(configPath, JSON.stringify({ mcpServers }, null, 2), "utf8");

  return {
    configPath,
    serverNames,
    cleanup: async () => {
      await fs.rm(configPath, { force: true });
    },
  };
}
