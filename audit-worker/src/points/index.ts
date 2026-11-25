import type { AudienceRole } from "../audience.js";
import { DROPPED } from "./dropped.js";
import { POINTS } from "./registry.js";
import type { AuditPoint, DroppedPoint } from "./types.js";

export { POINTS, DROPPED };
export type * from "./types.js";

const byId = new Map(POINTS.map(p => [p.id, p]));
const byOldId = new Map(POINTS.flatMap(p => p.origin.map(o => [o, p] as const)));
const droppedById = new Map(DROPPED.map(d => [d.id, d]));

export function pointById(id: string): AuditPoint | undefined {
  return byId.get(id);
}

/** The master point an old id (W-07, SO-WC-04, A1, SW-001…) now lives in. */
export function pointForOldId(oldId: string): AuditPoint | undefined {
  return byOldId.get(oldId);
}

/** Why an old id has no master point, or undefined if it has one. */
export function droppedOldId(oldId: string): DroppedPoint | undefined {
  return droppedById.get(oldId);
}

/** Points that run, optionally only those serving one role. */
export function activePoints(role?: AudienceRole | null): AuditPoint[] {
  return POINTS.filter(p => p.status === "active" && (!role || p.roles.includes(role)));
}
