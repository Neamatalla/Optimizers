import type { SiteChecks } from "./types.js";

/**
 * Checks that code decides from our own visit to the store (site-checks.ts),
 * the way ga4-facts.ts decides the computed GA4 points. The model still
 * writes the text, but the status is set here and computeCategoryResult
 * enforces it.
 *
 * Only what the facts show for certain is decided. Anything else returns
 * null and the model judges it as before:
 *   - A failed Add-to-Cart click may be our automated browser, so only a
 *     click that really filled the cart decides W-01 (pass).
 *   - A missing add_to_cart event may just be late, so only a seen event
 *     decides W-22 (pass).
 *   - No contact links found may mean they render later, so W-07 is decided
 *     only when links were found.
 *   - Sold-out badges and the hero video are read on the home page, so a
 *     pass needs the home page to have loaded.
 */

export type BrowserFactKey = "addToCart" | "contactLinks" | "soldOut" | "heroVideo" | "atcEvent";

export interface BrowserFact {
  status: "pass" | "fail";
  reason: string;
}

// Which checklist points each fact decides. A reader's own point that asks
// for more than the fact shows (e.g. "sold-out pages offer similar items")
// is `failOnly`: the fact can prove it fails, never that it passes.
// Persona points that merge several checks (MB-WC-18) are left out.
const DECIDED: Record<string, { fact: BrowserFactKey; failOnly?: true }> = {
  "W-01": { fact: "addToCart" },
  "SO-WC-01": { fact: "addToCart" },
  "MB-WC-02": { fact: "addToCart" },
  "W-07": { fact: "contactLinks" },
  "SO-WC-04": { fact: "contactLinks" },
  "MB-CRO-15": { fact: "contactLinks", failOnly: true },
  "W-08": { fact: "soldOut" },
  "SO-CRO-19": { fact: "soldOut", failOnly: true },
  "MB-CRO-03": { fact: "soldOut", failOnly: true },
  "W-17": { fact: "heroVideo" },
  "SO-CRO-25": { fact: "heroVideo" },
  "W-22": { fact: "atcEvent" },
};

function homeLoaded(s: SiteChecks): boolean {
  return s.pagesVisited.some(p => p.pageType === "home" && p.loaded);
}

export function browserFact(key: BrowserFactKey, s: SiteChecks): BrowserFact | null {
  switch (key) {
    case "addToCart": {
      const a = s.addToCart;
      if (a.attempted && a.ok && a.method !== "api" && a.clickAdded !== false) {
        return { status: "pass", reason: `our Add-to-Cart click filled the cart${a.via ? ` (via the ${a.via})` : ""}` };
      }
      return null;
    }
    case "contactLinks": {
      if (s.contactLinks.length === 0) return null;
      const bad = s.contactLinks.filter(c => !c.valid);
      return bad.length
        ? { status: "fail", reason: `invalid number in ${bad.map(c => c.href).join(", ")}` }
        : { status: "pass", reason: `all ${s.contactLinks.length} WhatsApp/phone link(s) use a full international number` };
    }
    case "soldOut": {
      if (s.soldOutPromoted > 0) return { status: "fail", reason: `${s.soldOutPromoted} "sold out" badge(s) in the first screens of home/collection` };
      return homeLoaded(s) ? { status: "pass", reason: `no "sold out" badge in the first screens of home/collection` } : null;
    }
    case "heroVideo": {
      if (s.heroVideoMobile) return { status: "fail", reason: "an autoplay video fills the phone first screen" };
      return homeLoaded(s) ? { status: "pass", reason: "no autoplay video fills the phone first screen" } : null;
    }
    case "atcEvent": {
      const ev = s.atcEvents;
      if (ev && [...ev.dataLayer, ...ev.ga4].includes("add_to_cart")) {
        return { status: "pass", reason: "our click produced add_to_cart" };
      }
      return null;
    }
  }
}

/** The status code sets for this point, or null when the model decides it. */
export function browserFactFor(pointId: string, s: SiteChecks | null | undefined): BrowserFact | null {
  const d = DECIDED[pointId];
  if (!d || !s) return null;
  const fact = browserFact(d.fact, s);
  if (!fact || (d.failOnly && fact.status === "pass")) return null;
  return fact;
}

/** Prompt lines for the decided points in this run's checklists. */
export function browserFactsPromptLines(pointIds: string[], s: SiteChecks | null | undefined): string[] {
  return pointIds.flatMap(id => {
    const f = browserFactFor(id, s);
    return f ? [`- ${id}: ${f.status.toUpperCase()} (${f.reason})`] : [];
  });
}
