import type { FudPageType } from "../types.js";

/**
 * What collect.ts captures from one page, and the only thing judge.ts and
 * signals.ts ever see of the store. Plain data so it can be logged, saved as
 * a fixture, and replayed through the judge without a browser.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextBlock {
  // "p12" — stable within one page's evidence; the judge cites these.
  id: string;
  text: string;
  // "img" for alt/aria text pulled from images and icons (payment logos,
  // trust badges), otherwise the element's tag name.
  tag: string;
  box: Box;
  // Top edge inside the first mobile screen.
  aboveFold: boolean;
}

export interface PageEvidence {
  pageType: FudPageType;
  url: string;
  loaded: boolean;
  // Why it didn't load, or what's special about it ("drawer", "empty cart").
  note?: string;
  title?: string;
  blocks: TextBlock[];
  // Primary Add-to-Cart / checkout button and the blocks within reach of it.
  cta?: { text: string; box: Box; disabled: boolean; nearbyBlockIds: string[] };
  // Review apps, installment providers, chat/support widgets found in the
  // page's scripts and markup (signals.ts WIDGETS).
  widgets: string[];
  // schema.org essentials only — @type list, rating, availability.
  jsonLd: { types: string[]; ratingValue?: number; reviewCount?: number; availability?: string };
  policyLinks: Array<{ kind: "shipping" | "returns" | "contact" | "about" | "faq"; text: string; href: string }>;
  // Product pages: how variants are chosen, if at all.
  variants?: { hasSize: boolean; control: "pills" | "dropdown" | "none"; groups: string[] };
  // Cart only: where the evidence came from and whether it holds the item.
  cart?: { source: "drawer" | "page"; empty: boolean };
  // Region crops, JPEG data URIs: "fold" (first screen), "cta", "cart".
  crops: Partial<Record<"fold" | "cta" | "cart", string>>;
}

export interface StoreEvidence {
  website: string;
  pages: PageEvidence[];
  // Add-to-Cart attempt on the product page, for the cart rules and Sources.
  addToCart: { attempted: boolean; ok: boolean; reason?: string };
  // Analytics/ad hits aborted during collection (should be > 0 on any store
  // with tracking — proves the bot stayed out of the client's data).
  blockedHits: number;
  durationMs: number;
}

export function pageOf(evidence: StoreEvidence, type: FudPageType): PageEvidence | undefined {
  return evidence.pages.find(p => p.pageType === type && p.loaded);
}
