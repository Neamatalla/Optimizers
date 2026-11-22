import type { AudienceRole } from "../audience.js";
import type { AdEffect } from "../ad-impact.js";
import type { ActionOwner, FindingSeverity, Opportunity } from "../types.js";

/**
 * The master audit point list (master-points/README.md). One entry per issue
 * we check, replacing the old lists: the shared 50 checks (checklist.ts), the
 * store-owner and media-buyer versions (checklist-persona-data.ts), the
 * Conversion review rules (fud/rules*.ts) and the manual CRO checklist
 * (fud/manual-checklist-data.ts).
 *
 * Not wired into the audit yet: the old lists still run. This is the data the
 * next steps build on (code rules, templates).
 */

export type PointCategory =
  | "tracking" | "buying-path" | "product-page" | "collection" | "homepage" | "navigation"
  | "trust" | "offers" | "landing" | "speed" | "findability" | "risk";

// Who decides pass/fail. "code+ai": code settles one side (often only the
// pass) or gathers the facts, the AI judges the rest.
export type Decider = "code" | "code+ai" | "ai";

// What the point needs. account = GA4/GTM settings; visit = our own headless
// store visit (collect.ts); crawl = the static page fetch (crawl.ts).
export type DataNeed = "ga4" | "gtm" | "crawl" | "visit" | "clarity";

export type PageKind = "home" | "product" | "collection" | "cart" | "checkout" | "landing" | "sitewide" | "account";

// "parked": kept with its reason but not run. Re-enable by setting "active".
export type PointStatus = "active" | "parked";

// What a role-specific old point said, kept so no reader context is lost.
// Filled from the store-owner (SO-) and media-buyer (MB-) points a master
// point replaces.
export interface RoleCopy {
  title: string;
  whyItMatters?: string;
  // Media buyer and other ROAS readers: which way a fail moves ROAS/CAC.
  adEffect?: AdEffect;
  // Media buyer report lanes (signal vs. post-click).
  lane?: "signal" | "post_click";
}

export interface AuditPoint {
  // Stable, never reused. Prefix = category (TRK, PATH, PDP…).
  id: string;
  category: PointCategory;
  title: string;
  // The one pass line. Two reviewers should agree on it.
  rule: string;
  severity: FindingSeverity;
  decidedBy: Decider;
  pages: PageKind[];
  needs: DataNeed[];
  // Roles this point serves. Built from its origins: a point built from a
  // shared check, a Conversion review rule or a manual checkpoint serves all
  // roles; one built only from SO-/MB- points serves only those roles.
  roles: AudienceRole[];
  status: PointStatus;
  parkedReason?: string;
  roleCopy: Partial<Record<AudienceRole, RoleCopy>>;
  // Carried over from the old points, for the report and the templates.
  opportunity?: Opportunity;
  owners?: ActionOwner[];
  defaultAction?: string;
  doneWhen?: string;
  // Every old point id this replaces. Old reports map through this.
  origin: string[];
  // Threshold to tune, data gap, review note.
  note?: string;
}

// An old point with no master point, and why.
export interface DroppedPoint {
  id: string;
  reason: string;
  // How many of the saved reports (as of 22 Nov 2026) showed it.
  shownInPastReports: number;
  // Past reports gave it verdicts our visit can't support.
  aiGuessed?: boolean;
}
