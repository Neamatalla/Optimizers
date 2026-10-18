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
  // Collection pages: what the product cards show, counted in the browser.
  listing?: {
    cards: number;
    withPrice: number;
    withRating: number;
    quickAdd: number;
    quickAddLabels: string[];
    hasFilter: boolean;
    hasSort: boolean;
    // Sub-category links sitting above the product grid.
    pills: number;
  };
  // Layout facts the text alone can't give (facts-js.ts). Absent on cart
  // drawers and on evidence saved before they existed.
  facts?: PageFacts;
  // Overlays on screen when the page first loads, and whether Escape closed
  // them. Only kept for the first page of a visit (later pages reuse cookies).
  popups?: { onLoad: Array<{ kind: string; cover: number; text: string }>; afterEscape: number };
  // Product pages: label of a buy button still on screen after scrolling
  // well past the main one (sticky add-to-cart), or null.
  sticky?: string | null;
  // Region crops, JPEG data URIs: "fold" (first screen), "cta", "cart".
  crops: Partial<Record<"fold" | "cta" | "cart", string>>;
}

export interface PageFacts {
  lang: string;
  dir: string;
  hreflang: string[];
  langSwitch: boolean;
  h1: string[];
  h1Count: number;
  // Top-level header/menu link labels (from the desktop visit for nav rules).
  nav: string[];
  search: { present: boolean; visible: boolean; action: string; param: string };
  media: { images: number; video: boolean; zoom: boolean };
  infoSections: { details: number; expanders: number };
  // Filled/outlined buttons on the first screen, outside the header.
  heroButtons: string[];
  // wa.me / api.whatsapp.com / tel: links on the page (W-07, GTM-11).
  contactLinks?: string[];
  // "Sold out" badges in the first one and a half screens (W-08).
  soldOutTop?: number;
  hero: { kind: string; src: string; alt: string; coverPct: number } | null;
  capture: { email: boolean; phone: boolean; account: boolean };
}

export interface StoreEvidence {
  website: string;
  // The phone visit: home, product, cart, collection. Everything the judge
  // reads and every crop comes from here.
  pages: PageEvidence[];
  // The same home and product pages at 1440px — text and positions only (no
  // cart, no crops). Used by the detectors to say whether desktop differs;
  // the judge never sees it. Absent when the desktop visit was off or failed.
  desktop?: PageEvidence[];
  // Analytics-looking requests that were NOT blocked. Should be empty; a
  // non-empty list means BLOCKED_HITS in collect.ts needs a new entry.
  leakedHits?: string[];
  // Add-to-Cart attempt on the product page, for the cart rules and Sources.
  // via: how the item got there ("api" = our click left the cart empty and
  // the store's cart endpoint added it); clickAdded: whether the click alone
  // added it (known on Shopify stores).
  addToCart: { attempted: boolean; ok: boolean; reason?: string; via?: "click" | "api"; clickAdded?: boolean };
  // Event names the click produced: new dataLayer entries, and the GA4 /
  // pixel hits we blocked (W-22, GTM-24). Absent when nothing was clicked.
  atcEvents?: { dataLayer: string[]; ga4: string[]; pixels: string[] };
  // Pages the collector was pointed at by GA4 (ga4-facts.ts focus) instead
  // of the first ones discovery found.
  focusUrls?: { product?: string; collection?: string };
  // Store-level numbers from GA4 the rules can use (index.ts fills it in
  // before judging): average order value for M3.
  context?: { aov?: number; currency?: string | null; focus?: string };
  // Searched the store for a word from the product's name and counted the
  // product links on the results page. Absent when no search was found.
  searchTest?: { query: string; url: string; results: number; loaded: boolean };
  // Analytics/ad hits aborted during collection (should be > 0 on any store
  // with tracking — proves the bot stayed out of the client's data).
  blockedHits: number;
  durationMs: number;
}

export function pageOf(evidence: StoreEvidence, type: FudPageType): PageEvidence | undefined {
  return evidence.pages.find(p => p.pageType === type && p.loaded);
}

/**
 * The same store as a desktop shopper sees it: home and product swapped for
 * their 1440px versions, cart and collection kept from the phone visit.
 * Null when there is no usable desktop evidence.
 */
export function desktopView(evidence: StoreEvidence): StoreEvidence | null {
  const loaded = (evidence.desktop ?? []).filter(p => p.loaded);
  if (loaded.length === 0) return null;
  const swapped = new Set(loaded.map(p => p.pageType));
  return { ...evidence, pages: [...evidence.pages.filter(p => !swapped.has(p.pageType)), ...loaded] };
}
