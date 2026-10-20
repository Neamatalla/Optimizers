import { checklistPoint, type ChecklistPoint } from "./checklist.js";
import { extractJsonPayload, runClaudeHeadless } from "./claude.js";
import { formatMoney } from "./fud/insights.js";
import { buildMcpConfig } from "./mcp-config.js";
import type { ActionOwner, CategoryFinding, CategoryResult, FindingAction, Ga4Fact } from "./types.js";

/**
 * The actionability rule (ACTION-POINTS-PROPOSAL.md §1). A failed point must
 * carry an action that names a specific thing to change, a valid owner and a
 * checkable "done when". What the model wrote is kept when it passes; what
 * fails gets one repair call (repairActions), and anything still failing
 * falls back to the checklist's own default for that point — so every failed
 * row in a report is a task someone can pick up and tick off.
 */

export const OWNERS: ActionOwner[] = ["dev", "marketing", "content", "owner"];

// Words that show an action points at something concrete. Any one is enough,
// as is a quote, a URL/path, a number or a checklist id.
const OBJECT = /\b(page|tag|trigger|variable|event|pixel|product|cart|checkout|button|banner|campaign|link|schema|image|photo|video|script|setting|filter|audience|menu|search|header|footer|form|field|threshold|font|redirect|cookie|header|policy|domain|url|title|description|canonical|sitemap|robots|key event|retention|currency|timezone|container|app|theme|drawer|popup|badge|review|price|shipping|delivery|payment|whatsapp|number|signup|offer|label|alt|consent|ads?|account|report|stream|referral|utm|layer|datalayer|css|js|javascript|css|library|file|header|ip|team|country|hour|day)s?\b/i;
const ANCHOR = /["“”'/]|\d|GA4-|GTM-|W-\d/;
// Words that make "done when" checkable: a number, a named view or report,
// or an observable state.
const CHECKABLE = /\d|%|\b(reach(es)?|rate|average|benchmark|updates?|lists?|declared|declares|names|unique|cached|compressed|changes?|blocks?|ga4|debugview|report|shows?|appears?|visible|records?|test|rich results|events manager|zero|none|no |under|above|at least|returns?|loads?|opens?|fires?|listed|set|active|exists?|present|indexable|passes|labelled|named|paused|tagged|equal|match(es)?|identical|stored|live|arrive)\b/i;

export function stepIsActionable(step: unknown): step is string {
  if (typeof step !== "string") return false;
  const s = step.trim();
  if (s.split(/\s+/).length < 5 || s.length > 400) return false;
  return OBJECT.test(s) || ANCHOR.test(s);
}

export function doneWhenIsCheckable(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const s = v.trim();
  return s.split(/\s+/).length >= 3 && s.length <= 300 && CHECKABLE.test(s);
}

function ownersOf(v: unknown): ActionOwner[] | null {
  const list = (Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,+/]| and /) : [])
    .map(x => String(x).trim().toLowerCase())
    .map(x => (x === "developer" ? "dev" : x === "mkt" || x === "ads" ? "marketing" : x === "store owner" ? "owner" : x));
  const valid = [...new Set(list.filter((x): x is ActionOwner => (OWNERS as string[]).includes(x)))];
  return valid.length ? valid : null;
}

export interface RawAction {
  step?: unknown;
  owners?: unknown;
  owner?: unknown;
  doneWhen?: unknown;
  impact?: unknown;
}

function moneyImpact(fact: Ga4Fact | undefined): string | undefined {
  const m = fact?.money;
  return m ? `Estimated gain: ${formatMoney(m.low, m.currency)}–${formatMoney(m.high, m.currency)} a month.` : undefined;
}

/**
 * The action for one finding. Returns the action and whether the model's own
 * wording was rejected (so the caller can try a repair).
 */
export function buildAction(raw: RawAction | undefined, point: ChecklistPoint, fact?: Ga4Fact): { action: FindingAction; rejected: boolean } {
  const stepOk = stepIsActionable(raw?.step);
  const doneOk = doneWhenIsCheckable(raw?.doneWhen);
  const owners = ownersOf(raw?.owners ?? raw?.owner);
  const impact = moneyImpact(fact) ?? (typeof raw?.impact === "string" && raw.impact.trim() ? raw.impact.trim().slice(0, 300) : undefined);
  return {
    action: {
      step: stepOk ? (raw!.step as string).trim() : point.action,
      owners: owners ?? point.owners,
      doneWhen: doneOk ? (raw!.doneWhen as string).trim() : point.doneWhen,
      impact,
      handoff: fact?.handoff ?? point.handoff,
      money: fact?.money ?? null,
    },
    rejected: !stepOk || !doneOk,
  };
}

export function defaultProtect(point: ChecklistPoint): string {
  return `Keep as it is: ${point.expectedState.replace(/\.$/, "")}.`;
}

// ---------------------------------------------------------------------------
// Repair: one tool-less call for every rejected action in the run.

const REPAIR_TIMEOUT_MS = 4 * 60 * 1000;

interface RepairItem {
  key: string;
  point: ChecklistPoint;
  finding: CategoryFinding;
}

function repairPrompt(items: RepairItem[]): string {
  const payload = items.map(i => ({
    key: i.key,
    check: i.point.title,
    whatWasFound: `${i.finding.business.summary} ${i.finding.technical.summary}`.slice(0, 500),
    defaultAction: i.point.action,
    defaultDoneWhen: i.point.doneWhen,
  }));
  return `You are finishing an e-commerce audit. Each entry below is a failed check. Write the action for THIS store from what was found.

Rules for every entry:
- "step": one imperative sentence, 8-30 words, that names the exact thing to change (the page, tag, event, product, setting or link from what was found). No "consider", no "review", no "ensure".
- "owners": one or more of "dev", "marketing", "content", "owner".
- "doneWhen": a checkable end state with a number, a report or tool view, or an observable page state (for example "add_to_cart appears in GA4 DebugView after a drawer add").
- Keep the store's own names and numbers from whatWasFound. Never invent numbers.
- No em dashes.

Return ONLY a JSON array: [{"key": "<copied>", "step": "...", "owners": ["dev"], "doneWhen": "..."}]

INPUT:
${JSON.stringify(payload)}`;
}

/**
 * Rewrites the rejected actions in one call. Never throws: on any error the
 * checklist defaults already in place stay.
 */
export async function repairActions(categories: CategoryResult[], rejected: Array<{ category: string; id: string }>, jobId: string): Promise<{ repaired: number; error?: string }> {
  const items: RepairItem[] = [];
  for (const r of rejected) {
    const finding = categories.find(c => c.category === r.category)?.findings.find(f => f.checklistId === r.id);
    const point = checklistPoint(r.id);
    if (finding && point && finding.status === "fail") items.push({ key: `${r.category}:${r.id}`, point, finding });
  }
  if (!items.length) return { repaired: 0 };
  const mcp = await buildMcpConfig(`${jobId}-actions`, { ga4Admin: false, gtm: false, browser: false });
  try {
    const raw = await runClaudeHeadless({ prompt: repairPrompt(items), mcpConfigPath: mcp.configPath, allowedTools: [], timeoutMs: REPAIR_TIMEOUT_MS, effort: "low", label: `action repair (${items.length})` });
    const parsed = extractJsonPayload(raw);
    if (!Array.isArray(parsed)) return { repaired: 0, error: "repair response was not a JSON array" };
    let repaired = 0;
    for (const entry of parsed as Array<Record<string, unknown>>) {
      const item = items.find(i => i.key === entry?.key);
      if (!item || !item.finding.action) continue;
      if (stepIsActionable(entry.step)) item.finding.action.step = entry.step.trim();
      if (doneWhenIsCheckable(entry.doneWhen)) item.finding.action.doneWhen = entry.doneWhen.trim();
      const owners = ownersOf(entry.owners);
      if (owners) item.finding.action.owners = owners;
      if (stepIsActionable(entry.step) && doneWhenIsCheckable(entry.doneWhen)) repaired++;
    }
    return { repaired };
  } catch (err) {
    return { repaired: 0, error: err instanceof Error ? err.message.slice(0, 300) : String(err) };
  } finally {
    await mcp.cleanup();
  }
}
