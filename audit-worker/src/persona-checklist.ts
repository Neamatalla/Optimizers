/**
 * Which checklist an audit runs, by reader.
 *
 * The store owner and the media buyer each have their own points
 * (checklist-persona-data.ts, generated from icp/PERSONA-POINTS-PROPOSAL.md).
 * Every other reader, and requests with no role, keep the shared lists in
 * checklist.ts. The three routes and the 50-point scale are the same either
 * way, so scoring and the report don't change shape:
 *   GA4 + GTM  -> GA4 25 + GTM 25
 *   one tool   -> that tool's 25 + Website (the persona's WEBCODE 25)
 *   neither    -> Website 50 (the persona's WEBCODE 25 + CRO 25)
 */
import type { AudienceRole } from "./audience.js";
import type { CategoryKey, ToolId } from "./types.js";
import { PERSONA_CHECKLISTS, type PersonaChecklistPoint, type PersonaRole } from "./checklist-persona-data.js";

export function personaOf(role: AudienceRole | null | undefined): PersonaRole | null {
  return role === "store_owner" || role === "media_buyer" ? role : null;
}

export function personaChecklistFor(persona: PersonaRole, category: CategoryKey, tools: ToolId[]): PersonaChecklistPoint[] {
  const lists = PERSONA_CHECKLISTS[persona];
  if (category === "GA4") return lists.GA4;
  if (category === "GTM") return lists.GTM;
  return tools.length === 0 ? [...lists.WEBCODE, ...lists.CRO] : lists.WEBCODE;
}

const ALL_PERSONA_POINTS: PersonaChecklistPoint[] = Object.values(PERSONA_CHECKLISTS).flatMap(sections => Object.values(sections).flat());

export function personaPoint(id: string): PersonaChecklistPoint | undefined {
  return ALL_PERSONA_POINTS.find(p => p.id === id);
}

/** The persona whose points these finding ids are, or null for shared-list results. */
export function personaOfFindings(ids: string[]): PersonaRole | null {
  if (ids.some(id => id.startsWith("SO-"))) return "store_owner";
  if (ids.some(id => id.startsWith("MB-"))) return "media_buyer";
  return null;
}
