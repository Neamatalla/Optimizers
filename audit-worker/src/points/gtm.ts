/**
 * Reads the GTM container export the visitor shared through OAuth
 * (api/_lib/google-oauth.js fetchAllGTMContainers: liveVersion tags,
 * triggers, variables) into the few plain facts the code rules need: which
 * tags send purchases or add-to-carts, to which platform, on which trigger,
 * and whether they carry an order ID or an event ID.
 *
 * Custom HTML is kept up to 6,000 characters by the API (older pulls: 400).
 * A body that was cut ("…" at the end) may hide a call, so it is flagged.
 */

export type GtmPlatform = "ga4" | "ads" | "meta" | "tiktok" | "snap" | "other";
export type GtmEvent = "purchase" | "add_to_cart" | null;

export interface GtmTrigger {
  id: string;
  kind: "custom_event" | "all_pages" | "page_view" | "other" | "unknown";
  name?: string;
  // Custom event name, or the URL filter text of a page-view trigger.
  detail?: string;
  thankYouUrl?: boolean;
}

export interface GtmTag {
  name: string;
  type: string;
  paused: boolean;
  platform: GtmPlatform;
  event: GtmEvent;
  triggers: GtmTrigger[];
  sendsOrderId: boolean;
  sendsEventId: boolean;
  htmlCut: boolean;
}

export interface GtmSummary {
  tags: GtmTag[];
  // Live tags that send a purchase or an Ads conversion.
  conversionTags: GtmTag[];
  // Custom HTML tags whose body was cut and named no event we could read.
  unreadable: string[];
}

type Param = { key?: string; type?: string; value?: unknown; list?: Param[]; map?: Param[] };
type RawTag = { name?: string; type?: string; paused?: boolean; firingTriggerId?: string[]; parameter?: Param[] };
type RawTrigger = { triggerId?: string; name?: string; type?: string; customEventFilter?: unknown; filter?: unknown };

// GTM's built-in "All Pages" trigger has this id and no row in the export.
const ALL_PAGES_ID = "2147479553";
const THANK_YOU = /thank|success|order[-_]?(received|complete|confirm)|checkout\/.*(complete|success)|شكرا|تم-الطلب/i;
const PAGE_TYPES = new Set(["pageview", "domReady", "windowLoaded"]);

// Every string inside a parameter list, flattened, for text checks.
function strings(params: Param[] | undefined): string[] {
  const out: string[] = [];
  const walk = (ps?: Param[]) => {
    for (const p of ps ?? []) {
      if (typeof p.value === "string") out.push(p.value);
      walk(p.list);
      walk(p.map);
    }
  };
  walk(params);
  return out;
}
const param = (params: Param[] | undefined, key: string): unknown => params?.find(p => p.key === key)?.value;

function triggerOf(id: string, byId: Map<string, RawTrigger>): GtmTrigger {
  if (id === ALL_PAGES_ID) return { id, kind: "all_pages", name: "All Pages" };
  const t = byId.get(id);
  if (!t) return { id, kind: "unknown" };
  const text = JSON.stringify(t.customEventFilter ?? t.filter ?? "");
  if (t.type === "customEvent") return { id, kind: "custom_event", name: t.name, detail: (JSON.stringify(t.customEventFilter ?? "").match(/"value":"([^"]+)"/g) ?? []).map(s => s.slice(9, -1)).filter(v => v !== "{{_event}}").join(", ") };
  if (PAGE_TYPES.has(t.type ?? "")) {
    const hasFilter = Boolean(t.filter && JSON.stringify(t.filter) !== "[]");
    return { id, kind: hasFilter ? "page_view" : "all_pages", name: t.name, detail: text.slice(0, 160), thankYouUrl: THANK_YOU.test(text) };
  }
  return { id, kind: "other", name: t.name };
}

function platformOf(tag: RawTag, text: string): GtmPlatform {
  if (tag.type === "gaawe" || tag.type === "googtag") return "ga4";
  if (tag.type === "awct" || tag.type === "gclidw") return "ads";
  if (/fbq\(|facebook|connect\.facebook\.net|pixelid/i.test(text)) return "meta";
  if (/ttq\.|tiktok/i.test(text)) return "tiktok";
  if (/snaptr|sc-static\.net|snapchat/i.test(text)) return "snap";
  return "other";
}

function eventOf(tag: RawTag, platform: GtmPlatform, text: string): GtmEvent {
  if (platform === "ga4") {
    const name = String(param(tag.parameter, "eventName") ?? "");
    return name === "purchase" ? "purchase" : name === "add_to_cart" ? "add_to_cart" : null;
  }
  if (platform === "ads") return tag.type === "awct" ? "purchase" : null;
  if (/['"](Purchase|CompletePayment|PlaceAnOrder|PURCHASE)['"]|\b(Purchase|CompletePayment|PURCHASE)\b/.test(text)) return "purchase";
  if (/['"](AddToCart|ADD_CART)['"]|\b(AddToCart|ADD_CART)\b/.test(text)) return "add_to_cart";
  return null;
}

function orderIdOf(tag: RawTag, platform: GtmPlatform, text: string): boolean {
  if (platform === "ga4") return param(tag.parameter, "sendEcommerceData") === "true" || /transaction_id/.test(text);
  if (platform === "ads") return Boolean(param(tag.parameter, "orderId"));
  return /order_?id|transaction_?id|content_ids|eventID|event_id/i.test(text);
}

const eventIdOf = (platform: GtmPlatform, text: string): boolean =>
  platform === "snap" ? /client_dedup_id/i.test(text) : /eventID|event_id|eventId/.test(text);

export function parseGtm(data: unknown): GtmSummary | null {
  const lv = (data as { liveVersion?: { tags?: RawTag[]; triggers?: RawTrigger[] } } | null)?.liveVersion;
  if (!lv || !Array.isArray(lv.tags)) return null;
  const byId = new Map((lv.triggers ?? []).filter(t => t.triggerId).map(t => [String(t.triggerId), t]));
  const tags: GtmTag[] = lv.tags.map(t => {
    const text = strings(t.parameter).join("\n");
    const platform = platformOf(t, text);
    const html = String(param(t.parameter, "html") ?? "");
    return {
      name: t.name ?? "(unnamed)",
      type: t.type ?? "",
      paused: Boolean(t.paused),
      platform,
      event: eventOf(t, platform, text),
      triggers: (t.firingTriggerId ?? []).map(id => triggerOf(String(id), byId)),
      sendsOrderId: orderIdOf(t, platform, text),
      sendsEventId: eventIdOf(platform, text),
      htmlCut: t.type === "html" && html.endsWith("…"),
    };
  });
  const live = tags.filter(t => !t.paused);
  return {
    tags,
    conversionTags: live.filter(t => t.event === "purchase"),
    unreadable: live.filter(t => t.htmlCut && !t.event).map(t => t.name),
  };
}
