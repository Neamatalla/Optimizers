import type { FudPageType } from "../types.js";
import type { ProbeResults } from "./collect-probes.js";

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

/**
 * What one pixel/analytics hit carried, read off the blocked request (round
 * 19). Never values that identify a person: only whether user data was sent.
 */
export interface HitParams {
  // The event's money value, when sent (GA4 epn.value, Meta cd[value], TikTok properties.value).
  value?: number;
  currency?: string;
  // Products named in the event (GA4 pr1…, Meta content_ids / contents, TikTok contents).
  items?: number;
  // Meta eid / TikTok event_id: lets the platform drop the server (CAPI) copy.
  eventId?: boolean;
  // Hashed customer data sent with the event (Meta ud[…], TikTok context.user).
  userData?: boolean;
  // Meta cd[content_type] ("product" / "product_group").
  contentType?: string;
  // GA4 only: for each product (pr1, pr2…) which of the GA4 item fields the
  // hit named: item_id (id), item_name (nm), price (pr), quantity (qt).
  itemFields?: ItemFields[];
}

export interface ItemFields {
  id: boolean;
  name: boolean;
  price: boolean;
  qty: boolean;
}

// A dataLayer push for a shopping event, reduced to its money fields.
export interface DataLayerPush {
  event: string;
  value?: number;
  currency?: string;
  items?: ItemFields[];
}

// What the browser logged while one page was open (collect.ts preparePage).
// Requests we aborted on purpose (BLOCKED_HITS) are never listed as failures.
export interface PageNet {
  // Uncaught script errors (pageerror). host: where the failing script came from, when the stack names it.
  errors: Array<{ msg: string; host?: string }>;
  // Responses with status 400+ and network errors (first 30).
  failed: Array<{ url: string; type: string; status?: number; error?: string }>;
  // http:// requests as "type url" (first 15): mixed content on an https page.
  http: string[];
  // gtag/js?id= script requests per measurement ID.
  gtag: Record<string, number>;
  // Video/audio responses with their size when the headers give it.
  media: Array<{ url: string; status: number; bytes?: number }>;
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
  // offer: an Offer node was seen (set by the current collector, so a missing
  // price on evidence without it means "not recorded", not "not there").
  jsonLd: { types: string[]; ratingValue?: number; reviewCount?: number; availability?: string; price?: number; priceCurrency?: string; offer?: boolean };
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
    // Cards showing an image, a name, and a struck-through price.
    withImage?: number;
    withName?: number;
    withStrike?: number;
    // Cards whose text or badge talks about a discount (% off, sale, save).
    withSaleText?: number;
    // Per card in page order: does it carry a sold-out label?
    soldOutFlags?: boolean[];
    // The selected sort ("text|value", lower case), when a select or checked radio shows it.
    sort?: string;
    // Page y of the top-most visible filter or sort control.
    controlsTop?: number;
    // Page y of the first product card.
    firstCardTop?: number;
    // Up to 12 cards, top to bottom then left to right (columns, carousels).
    cardBoxes?: Box[];
  };
  // Struck-through (del, s, strike, line-through) prices on the page.
  struck?: Array<{ text: string; y: number }>;
  // Product pages: a link to the reviews (#reviews…) with its text and page y.
  reviewAnchor?: { text: string; y: number; href: string } | null;
  // Visible <video> elements: autoplay flag, source, position.
  videos?: Array<{ autoplay: boolean; muted: boolean; src: string; y: number; w: number; h: number }>;
  // Script errors, failed files, http requests seen while this page was open.
  net?: PageNet;
  // Layout facts the text alone can't give (facts-js.ts). Absent on cart
  // drawers and on evidence saved before they existed.
  facts?: PageFacts;
  // Overlays on screen when the page first loads, and whether Escape closed
  // them. Only kept for the first page of a visit (later pages reuse cookies).
  popups?: { onLoad: Array<{ kind: string; cover: number; text: string }>; afterEscape: number };
  // Product pages: label of a buy button still on screen after scrolling
  // well past the main one (sticky add-to-cart), or null.
  sticky?: string | null;
  // Landing pages only: why we opened it (the GA4 campaign or landing report)
  // and, when the same URL was already visited as another page, which one.
  landing?: { source: string; sameAs?: FudPageType };
  // Region crops, JPEG data URIs: "fold" (first screen), "cta", "cart".
  crops: Partial<Record<"fold" | "cta" | "cart", string>>;
  // What happened when the visit tried the page's controls (collect.ts):
  // home: tapping the phone menu icon; cart: + then − on the first line.
  interactions?: {
    menu?: { found: boolean; opened: boolean; linksShown: number };
    quantity?: { plusFound: boolean; plusChanged: boolean; minusFound: boolean; minusChanged: boolean; removeFound: boolean };
  };
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
  // ---- Round 23: facts for the master-point rules (src/points/rules/facts.ts).
  // All optional: evidence saved before they existed still loads. Boxes are
  // page coordinates (same as cta.box). Never holds what a shopper typed.
  // Visible form fields (never their values): keyboard type, autocomplete, height, font size.
  inputs?: FactInput[];
  // Header cart / menu / search controls, read from the header element.
  header?: { found: boolean; cart: { box: Box; count: number | null; opens: "page" | "drawer" | null } | null; menu: Box | null; search: Box | null };
  // Where the language switch sits: visible in the header, hidden inside the
  // header/menu, in the footer, or elsewhere. Null when there is none.
  langAt?: "header" | "menu" | "footer" | "body" | null;
  // Footer contents (booleans only, no numbers or addresses kept).
  footer?: { found: boolean; links: number; phone: boolean; whatsapp: boolean; email: boolean; kinds: string[] };
  // Fixed-position elements on screen that are not the header or a buy bar.
  floaters?: Array<{ kind: "chat" | "tab" | "banner" | "other"; box: Box }>;
  // Quantity selector near the buy button (box around it, its +/- boxes).
  qty?: { box: Box; controls: Box[] } | null;
  // Variant option pills / swatches near the buy button.
  swatches?: Box[];
  // The Add to Cart button as the page paints it. bgComplex: gradient, image
  // or see-through background, so contrast can't be computed.
  atc?: { box: Box; fg: string; bg: string; bgComplex: boolean } | null;
  // Sideways scroll: layout width vs scroll width, the widest in-flow element,
  // and whether html/body hide overflow (which masks real scrolling).
  overflow?: PageOverflow;
  // The same read after a 360px viewport. Filled by collect.ts when it re-reads.
  overflow360?: PageOverflow;
  // Template text and demo links found anywhere on the page.
  placeholder?: { text: string[]; hrefs: string[] };
  // Links to the store's own domain, and how many carry utm_ parameters.
  utm?: { internal: number; withUtm: number; samples: string[] };
  // Content images (not SVG, 48px wide or more), and the page's true total
  // when the list was cut.
  images?: PageImage[];
  imagesTotal?: number;
}

export interface FactInput {
  type: string;
  inputmode: string;
  autocomplete: string;
  // The field's own name/id and placeholder/label, to tell phone from email.
  name: string;
  label: string;
  w: number;
  h: number;
  // Computed font size in px.
  fs: number;
  inHeader: boolean;
}

export interface PageOverflow {
  iw: number;
  sw: number;
  wide: number;
  clipped: boolean;
}

export interface PageImage {
  // Host and URL path (no query), to read the file type.
  host: string;
  path: string;
  // "webp", "avif", "jpg", "png", "gif" or "other", from the file name or format parameter.
  fmt: string;
  // The URL asks the CDN to choose the format (f_auto, auto=format, ...).
  auto: boolean;
  // Natural width (0 = not loaded) and displayed width in px, page y of the top edge.
  nw: number;
  dw: number;
  top: number;
  lazy: boolean;
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
  // The same click's pixel hits with what each carried (round 19).
  atcHits?: Array<{ vendor: string; name: string; id?: string; q?: HitParams }>;
  // view_item (product page, before the click) and add_to_cart (the click)
  // pushes to the dataLayer, money fields only.
  dlPushes?: { view?: DataLayerPush[]; atc?: DataLayerPush[] };
  // Every analytics/pixel hit seen while a page loaded (before any tap),
  // with the page and, for GA4 and Meta, the measurement / pixel ID.
  pageHits?: Array<{ page: string; vendor: string; name: string; id?: string; q?: HitParams }>;
  // The cart drawer after Add to Cart, when the store has one and the full
  // cart page was opened as well (that page is the "cart" in pages).
  cartDrawer?: PageEvidence;
  // Pages the collector was pointed at by GA4 (ga4-facts.ts focus) instead
  // of the first ones discovery found.
  focusUrls?: { product?: string; collection?: string };
  // Store-level numbers from GA4 the rules can use (index.ts fills it in
  // before judging): average order value for M3.
  context?: { aov?: number; currency?: string | null; focus?: string };
  // Searched the store for a word from the product's name and counted the
  // product links on the results page. Absent when no search was found.
  searchTest?: { query: string; url: string; results: number; loaded: boolean };
  // Extra browser probes (collect-probes.ts): empty cart, second variant,
  // campaign parameters, in-app navigation, tags per page type, hit timing.
  probes?: ProbeResults;
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
