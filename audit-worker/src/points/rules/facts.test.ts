import assert from "node:assert/strict";
import { test } from "node:test";
import type { Box, FactInput, PageEvidence, PageFacts, PageImage, PageOverflow, StoreEvidence } from "../../fud/evidence.js";
import { PLACEHOLDER_SOURCE } from "../../fud/facts-js.js";
import { contrast, fieldKind, FACTS_RULES, judgeImage, parseRgb } from "./facts.js";
import { RULES } from "./index.js";

// ---- builders ----
const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h });
const base = {
  lang: "en", dir: "ltr", hreflang: [], langSwitch: false, h1: [], h1Count: 1, nav: [], search: { present: true, visible: true, action: "", param: "q" },
  media: { images: 5, video: false, zoom: false }, infoSections: { details: 0, expanders: 0 }, heroButtons: [], hero: null, capture: { email: false, phone: false, account: false },
};
const facts = (over: Partial<PageFacts> = {}): PageFacts => ({ ...base, ...over }) as PageFacts;
function pg(pageType: PageEvidence["pageType"], over: Partial<PageEvidence> = {}): PageEvidence {
  return { pageType, url: `https://x.com/${pageType}`, loaded: true, blocks: [], widgets: [], jsonLd: { types: [] }, policyLinks: [], crops: {}, ...over };
}
const block = (text: string, y: number) => ({ id: `b${y}`, text, tag: "p", box: box(10, y, 300, 24), aboveFold: y < 844 });
function store(pages: PageEvidence[], over: Partial<StoreEvidence> = {}): StoreEvidence {
  return { website: "https://x.com", pages, addToCart: { attempted: true, ok: true, via: "click", clickAdded: true }, blockedHits: 0, durationMs: 1, ...over } as StoreEvidence;
}
const run = (id: string, e: StoreEvidence | null) => FACTS_RULES[id]({ evidence: e });
const input = (over: Partial<FactInput> = {}): FactInput => ({ type: "text", inputmode: "", autocomplete: "name", name: "name", label: "Name", w: 300, h: 48, fs: 16, inHeader: false, ...over });
const okOverflow: PageOverflow = { iw: 390, sw: 390, wide: 390, clipped: false };

test("every facts rule is registered and belongs to an active, code-decided point", () => {
  assert.equal(Object.keys(FACTS_RULES).length, 12);
  for (const id of Object.keys(FACTS_RULES)) assert.equal(RULES[id], FACTS_RULES[id], id);
});

test("every facts rule is unverified without a store visit", () => {
  for (const id of Object.keys(FACTS_RULES)) assert.equal(run(id, null).status, "unverified", id);
});

// ---- helpers ----
test("parseRgb and contrast", () => {
  assert.deepEqual(parseRgb("rgb(255, 255, 255)"), { r: 255, g: 255, b: 255 });
  assert.equal(parseRgb("rgba(0, 0, 0, 0.5)"), null, "see-through colours are not read");
  assert.equal(parseRgb("color(srgb 1 1 1)"), null);
  assert.equal(Math.round(contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })), 21);
  assert.ok(contrast({ r: 119, g: 119, b: 119 }, { r: 255, g: 255, b: 255 }) > 4.4);
  assert.ok(contrast({ r: 200, g: 200, b: 200 }, { r: 255, g: 255, b: 255 }) < 3);
});

test("fieldKind tells phone, email and text apart", () => {
  assert.equal(fieldKind(input({ type: "tel" })), "phone");
  assert.equal(fieldKind(input({ name: "checkout[shipping_address][phone]" })), "phone");
  assert.equal(fieldKind(input({ label: "رقم الجوال" })), "phone");
  assert.equal(fieldKind(input({ type: "email" })), "email");
  assert.equal(fieldKind(input({ name: "email_address" })), "email");
  assert.equal(fieldKind(input({ name: "city", label: "City" })), "text");
});

test("judgeImage: good, bad, unknown", () => {
  const img = (o: Partial<PageImage>): PageImage => ({ host: "x.com", path: "/a.webp", fmt: "webp", auto: false, nw: 600, dw: 390, top: 100, lazy: false, ...o });
  assert.equal(judgeImage(img({})), "good");
  assert.equal(judgeImage(img({ nw: 1000 })), "bad", "wider than 2x display");
  assert.equal(judgeImage(img({ fmt: "jpg", path: "/a.jpg" })), "bad", "plain jpg on the store's own host");
  assert.equal(judgeImage(img({ fmt: "jpg", host: "cdn.shopify.com" })), "unknown", "CDN may negotiate WebP");
  assert.equal(judgeImage(img({ nw: 0 })), "unknown", "not loaded");
  assert.equal(judgeImage(img({ fmt: "jpg", auto: true })), "unknown");
});

test("placeholder pattern", () => {
  const re = new RegExp(PLACEHOLDER_SOURCE, "i");
  assert.ok(re.test("Lorem ipsum dolor sit amet"));
  assert.ok(re.test("Email us at hello@example.com"));
  assert.ok(re.test("Your text here"));
  assert.ok(!re.test("Our honey comes from real hives"));
});

// ---- PATH-12 ----
const checkout = (inputs: FactInput[] | undefined, over: Partial<PageEvidence> = {}) => pg("checkout", { facts: inputs ? facts({ inputs }) : undefined, ...over });
const goodForm = () => [input({ type: "email", name: "email", autocomplete: "email" }), input({ type: "tel", name: "phone", autocomplete: "tel" }), input({ name: "address", autocomplete: "street-address" })];
test("PATH-12", () => {
  assert.equal(run("PATH-12", store([checkout(goodForm())])).status, "pass");
  const noKeyboard = goodForm();
  noKeyboard[1] = input({ type: "text", name: "phone", autocomplete: "tel" });
  const r = run("PATH-12", store([checkout(noKeyboard)]));
  assert.equal(r.status, "fail");
  assert.match(r.reason, /numeric/);
  const short = goodForm();
  short[2] = input({ name: "address", h: 36 });
  assert.match(run("PATH-12", store([checkout(short)])).reason, /36px tall/);
  const noAuto = goodForm();
  noAuto[2] = input({ name: "address", autocomplete: "" });
  assert.match(run("PATH-12", store([checkout(noAuto)])).reason, /no autocomplete/);
  // a discount-code field never needs autocomplete
  assert.equal(run("PATH-12", store([checkout([...goodForm(), input({ name: "discount", label: "Discount code", autocomplete: "" })])])).status, "pass");
  // unverified: login page, not loaded, no facts, too few fields
  assert.equal(run("PATH-12", store([checkout(goodForm(), { note: "first checkout screen only: the store sent us to a log-in page" })])).status, "unverified");
  assert.equal(run("PATH-12", store([pg("checkout", { loaded: false })])).status, "unverified");
  assert.equal(run("PATH-12", store([checkout(undefined)])).status, "unverified");
  assert.equal(run("PATH-12", store([checkout([input()])])).status, "unverified");
  assert.equal(run("PATH-12", store([pg("home")])).status, "unverified");
});

// ---- RISK-12 ----
test("RISK-12", () => {
  const home = pg("home", { facts: facts({ inputs: [input({ type: "search", name: "q", fs: 16 })] }) });
  assert.equal(run("RISK-12", store([home, checkout(goodForm())])).status, "pass");
  const small = pg("home", { facts: facts({ inputs: [input({ type: "search", name: "q", fs: 14 })] }) });
  const r = run("RISK-12", store([small, checkout(goodForm())]));
  assert.equal(r.status, "fail");
  assert.match(r.reason, /14px/);
  assert.equal(run("RISK-12", store([checkout([input({ type: "tel", name: "phone", inputmode: "" }), input({ type: "text", name: "phone2" })])])).status, "fail");
  // checkout behind login: font sizes elsewhere fine, but the form wasn't seen
  const login = checkout(goodForm(), { note: "sent us to a log-in page" });
  assert.equal(run("RISK-12", store([home, login])).status, "unverified");
  assert.equal(run("RISK-12", store([pg("home")])).status, "unverified", "no fields read");
});

// ---- PDP-05 ----
const product = (over: Partial<PageFacts> = {}, pageOver: Partial<PageEvidence> = {}) =>
  pg("product", { cta: { text: "Add to cart", box: box(15, 500, 360, 48), disabled: false, nearbyBlockIds: [] }, blocks: [block("KD 12.500", 440)], facts: facts({ floaters: [], ...over }), ...pageOver });
const cart = (over: Partial<PageFacts> = {}) => pg("cart", { cta: { text: "Checkout", box: box(15, 600, 360, 48), disabled: false, nearbyBlockIds: [] }, cart: { source: "page", empty: false }, facts: facts({ floaters: [], ...over }) });
test("PDP-05", () => {
  assert.equal(run("PDP-05", store([product(), cart()])).status, "pass");
  const covered = run("PDP-05", store([product({ floaters: [{ kind: "chat", box: box(330, 520, 56, 56) }] }), cart()]));
  assert.equal(covered.status, "fail");
  assert.match(covered.reason, /Add to cart/);
  assert.equal(run("PDP-05", store([product(), cart({ floaters: [{ kind: "banner", box: box(0, 590, 390, 70) }] })])).status, "fail");
  const farAway = product({ floaters: [{ kind: "chat", box: box(330, 760, 56, 56) }] });
  assert.equal(run("PDP-05", store([farAway, cart()])).status, "pass");
  // unverified: chat tool named but nothing floating yet; cart drawer; pages missing
  assert.equal(run("PDP-05", store([product({}, { widgets: ["Tidio chat"] }), cart()])).status, "unverified");
  assert.equal(run("PDP-05", store([product(), pg("cart", { cart: { source: "drawer", empty: false } })])).status, "unverified");
  assert.equal(run("PDP-05", store([pg("product", { loaded: false }), cart()])).status, "unverified");
  assert.equal(run("PDP-05", store([product()])).status, "unverified");
});

// ---- PDP-08 ----
const qtyFacts = (over: Partial<PageFacts> = {}) => ({ qty: { box: box(15, 450, 120, 44), controls: [box(15, 450, 44, 44), box(91, 450, 44, 44)] }, atc: { box: box(15, 500, 360, 48), fg: "rgb(255, 255, 255)", bg: "rgb(20, 20, 20)", bgComplex: false }, ...over });
test("PDP-08", () => {
  assert.equal(run("PDP-08", store([product(qtyFacts())])).status, "pass");
  assert.equal(run("PDP-08", store([product(qtyFacts({ qty: null }))])).status, "fail");
  assert.equal(run("PDP-08", store([product(qtyFacts({ qty: { box: box(15, 100, 120, 44), controls: [] } }))])).status, "fail", "quantity far from the button");
  const narrow = product(qtyFacts(), { cta: { text: "Add to cart", box: box(100, 500, 150, 48), disabled: false, nearbyBlockIds: [] } });
  assert.equal(run("PDP-08", store([narrow])).status, "fail");
  const lowContrast = run("PDP-08", store([product(qtyFacts({ atc: { box: box(15, 500, 360, 48), fg: "rgb(200, 200, 200)", bg: "rgb(255, 255, 255)", bgComplex: false } }))]));
  assert.equal(lowContrast.status, "fail");
  assert.match(lowContrast.reason, /contrast/);
  // same row: button + selector together fill the width
  const row = product({ ...qtyFacts({ qty: { box: box(15, 500, 100, 48), controls: [] } }), }, { cta: { text: "Add to cart", box: box(125, 500, 250, 48), disabled: false, nearbyBlockIds: [] } });
  assert.equal(run("PDP-08", store([row])).status, "pass");
  // unverified
  assert.equal(run("PDP-08", store([product(qtyFacts({ atc: { box: box(15, 500, 360, 48), fg: "rgb(255, 255, 255)", bg: "rgb(0, 0, 0)", bgComplex: true } }))])).status, "unverified");
  assert.equal(run("PDP-08", store([product(qtyFacts({ atc: null }))])).status, "unverified");
  assert.equal(run("PDP-08", store([pg("product", { loaded: false })])).status, "unverified");
  assert.equal(run("PDP-08", store([pg("product", { cta: { text: "Add", box: box(0, 0, 300, 48), disabled: false, nearbyBlockIds: [] }, facts: facts() })])).status, "unverified", "old evidence");
});

// ---- NAV-05 ----
const withHeader = (type: PageEvidence["pageType"], cartIcon: PageFacts["header"] extends infer H ? H : never, over: Partial<PageEvidence> = {}) => pg(type, { facts: facts({ header: cartIcon }), ...over });
const headerWith = (count: number | null, opens: "page" | "drawer" | null = "page") => ({ found: true, cart: { box: box(330, 10, 44, 44), count, opens }, menu: null, search: null });
test("NAV-05", () => {
  const pages = (count: number | null, opens: "page" | "drawer" | null = "page") => [withHeader("home", headerWith(null)), withHeader("product", headerWith(null)), withHeader("cart", headerWith(count, opens), { cart: { source: "page", empty: false } })];
  const ok = run("NAV-05", store(pages(2)));
  assert.equal(ok.status, "pass");
  assert.equal(run("NAV-05", store([withHeader("home", { found: true, cart: null, menu: null, search: null }), ...pages(2).slice(1)])).status, "fail", "no icon on home");
  assert.equal(run("NAV-05", store(pages(0))).status, "fail", "badge 0 after add");
  assert.equal(run("NAV-05", store(pages(null))).status, "unverified", "badge may be late");
  assert.equal(run("NAV-05", store(pages(2, null))).status, "unverified");
  assert.equal(run("NAV-05", store(pages(2), { addToCart: { attempted: true, ok: false, reason: "no button" } })).status, "unverified");
  assert.equal(run("NAV-05", store([withHeader("home", headerWith(null)), pg("cart", { cart: { source: "drawer", empty: false } })])).status, "unverified", "drawer");
  assert.equal(run("NAV-05", store([withHeader("home", { found: false, cart: null, menu: null, search: null })])).status, "unverified", "no header");
});

// ---- NAV-06 ----
test("NAV-06", () => {
  const home = (f: Partial<PageFacts>) => store([pg("home", { facts: facts(f) })]);
  assert.equal(run("NAV-06", home({ langAt: "header" })).status, "pass");
  assert.equal(run("NAV-06", home({ langAt: "footer" })).status, "fail");
  assert.equal(run("NAV-06", home({ langAt: "menu" })).status, "unverified");
  assert.equal(run("NAV-06", home({ langAt: null })).status, "n/a");
  assert.equal(run("NAV-06", home({ langAt: null, hreflang: ["ar", "en-US"] })).status, "unverified", "two languages declared but no switch seen");
  assert.equal(run("NAV-06", home({})).status, "unverified", "old evidence");
  assert.equal(run("NAV-06", store([pg("home", { loaded: false })])).status, "unverified");
});

// ---- NAV-07 ----
test("NAV-07", () => {
  const home = (footer: PageFacts["footer"]) => store([pg("home", { facts: facts({ footer }) })]);
  const full = { found: true, links: 12, phone: false, whatsapp: true, email: false, kinds: ["shipping", "returns", "privacy", "terms"] };
  assert.equal(run("NAV-07", home(full)).status, "pass");
  const noTerms = run("NAV-07", home({ ...full, kinds: ["shipping", "returns", "privacy"] }));
  assert.equal(noTerms.status, "fail");
  assert.match(noTerms.reason, /terms/);
  assert.match(run("NAV-07", home({ ...full, whatsapp: false })).reason, /contact details/);
  assert.equal(run("NAV-07", home({ ...full, found: false })).status, "unverified");
  assert.equal(run("NAV-07", home({ ...full, links: 1 })).status, "unverified");
  assert.equal(run("NAV-07", store([pg("home", { facts: facts() })])).status, "unverified");
  assert.equal(run("NAV-07", store([pg("home", { loaded: false })])).status, "unverified");
});

// ---- TRUST-09 ----
test("TRUST-09", () => {
  const clean = () => [pg("home", { facts: facts({ placeholder: { text: [], hrefs: [] } }) }), pg("collection", { facts: facts({ placeholder: { text: [], hrefs: [] } }) }), product({ placeholder: { text: [], hrefs: [] } }), cart({ placeholder: { text: [], hrefs: [] } })];
  assert.equal(run("TRUST-09", store(clean())).status, "pass");
  const lorem = clean();
  lorem[1] = pg("collection", { facts: facts({ placeholder: { text: ["Lorem ipsum dolor sit"], hrefs: [] } }) });
  assert.equal(run("TRUST-09", store(lorem)).status, "fail");
  const demo = clean();
  demo[0] = pg("home", { facts: facts({ placeholder: { text: [], hrefs: ["prestige-theme-demo.myshopify.com/"] } }) });
  assert.match(run("TRUST-09", store(demo)).reason, /demo/);
  // a cart drawer's text blocks are scanned too
  const drawer = [...clean().slice(0, 3), pg("cart", { cart: { source: "drawer", empty: false }, blocks: [block("Your text here", 10)] })];
  assert.equal(run("TRUST-09", store(drawer)).status, "fail");
  assert.equal(run("TRUST-09", store([...clean().slice(0, 3), pg("cart", { cart: { source: "drawer", empty: false } })])).status, "pass");
  assert.equal(run("TRUST-09", store(clean().slice(0, 3))).status, "unverified", "cart missing");
  const oldHome = clean();
  oldHome[0] = pg("home");
  assert.equal(run("TRUST-09", store(oldHome)).status, "unverified", "home text only partly scanned");
});

// ---- RISK-06 ----
const hdr = (menu: Box | null, cartBox: Box | null, search: Box | null) => ({ found: true, cart: cartBox ? { box: cartBox, count: null, opens: "page" as const } : null, menu, search });
test("RISK-06", () => {
  const home = (h: ReturnType<typeof hdr>) => pg("home", { facts: facts({ header: h }) });
  const good = hdr(box(0, 0, 48, 48), box(340, 0, 48, 48), box(290, 0, 48, 48));
  assert.equal(run("RISK-06", store([home(good), product(qtyFacts())])).status, "pass");
  const small = run("RISK-06", store([home(hdr(box(0, 0, 32, 32), box(340, 0, 48, 48), null)), product(qtyFacts())]));
  assert.equal(small.status, "fail");
  assert.match(small.reason, /menu button is 32x32/);
  assert.equal(run("RISK-06", store([home(good), product(qtyFacts({ swatches: [box(15, 400, 30, 30)] }))])).status, "fail");
  assert.match(run("RISK-06", store([home(good), product(qtyFacts({ swatches: [box(15, 400, 48, 48), box(67, 400, 48, 48)] }))])).reason, /neighbours/);
  assert.equal(run("RISK-06", store([home(good), product(qtyFacts({ swatches: [box(15, 400, 48, 48), box(71, 400, 48, 48)] }))])).status, "pass");
  const narrow = product(qtyFacts({ qty: null }), { cta: { text: "Add to cart", box: box(100, 500, 150, 48), disabled: false, nearbyBlockIds: [] } });
  assert.equal(run("RISK-06", store([home(good), narrow])).status, "fail", "not near full width");
  assert.equal(run("RISK-06", store([home(hdr(null, null, null)), product(qtyFacts())])).status, "unverified", "no header control found");
  assert.equal(run("RISK-06", store([pg("home"), product(qtyFacts())])).status, "unverified");
  assert.equal(run("RISK-06", store([home(good), pg("product", { loaded: false })])).status, "unverified");
});

// ---- RISK-07 ----
test("RISK-07", () => {
  const withOverflow = (type: PageEvidence["pageType"], o: PageOverflow, o360?: PageOverflow) => pg(type, { facts: facts({ overflow: o, overflow360: o360 }) });
  const all = (o: PageOverflow, o360?: PageOverflow) => (["home", "collection", "product", "cart"] as const).map(t => withOverflow(t, o, o360));
  const ok360 = { iw: 360, sw: 360, wide: 358, clipped: false };
  // the 390px reading proves a failure on its own
  const scroll = run("RISK-07", store([withOverflow("home", { ...okOverflow, sw: 470 }), ...all(okOverflow).slice(1)]));
  assert.equal(scroll.status, "fail");
  assert.match(scroll.reason, /home at 390px/);
  assert.equal(run("RISK-07", store(all(okOverflow, { ...ok360, sw: 400 }))).status, "fail", "360px re-read scrolls");
  // a pass needs both widths on all four pages
  assert.equal(run("RISK-07", store(all(okOverflow))).status, "unverified", "360px not read yet");
  assert.equal(run("RISK-07", store(all(okOverflow, ok360))).status, "pass");
  assert.equal(run("RISK-07", store([...all(okOverflow, ok360).slice(0, 3), pg("cart", { cart: { source: "drawer", empty: false } })])).status, "unverified", "cart drawer");
  const masked = { ...okOverflow, clipped: true, wide: 520 };
  assert.equal(run("RISK-07", store(all(masked, ok360))).status, "unverified", "overflow hidden masks scrolling");
  assert.equal(run("RISK-07", store([pg("home")])).status, "unverified");
});

// ---- TRK-24 ----
test("TRK-24", () => {
  const withUtm = (type: PageEvidence["pageType"], n: number, over: Partial<PageEvidence> = {}) => pg(type, { facts: facts({ utm: { internal: 40, withUtm: n, samples: n ? ["/collections/all?utm_source&utm_medium"] : [] } }), ...over });
  const all = (n = 0) => (["home", "collection", "product", "cart"] as const).map(t => withUtm(t, t === "collection" ? n : 0));
  assert.equal(run("TRK-24", store(all())).status, "pass");
  const bad = run("TRK-24", store(all(3)));
  assert.equal(bad.status, "fail");
  assert.match(bad.reason, /3 on the collection page/);
  assert.equal(run("TRK-24", store([...all().slice(0, 3), pg("cart", { cart: { source: "drawer", empty: false } })])).status, "unverified", "drawer links not read");
  assert.equal(run("TRK-24", store(all().slice(0, 3))).status, "unverified", "cart missing");
  assert.equal(run("TRK-24", store([...all(2).slice(0, 3), pg("cart", { cart: { source: "drawer", empty: false } })])).status, "fail", "a tagged link is proof even with the drawer unread");
});

// ---- SPEED-05 ----
const im = (o: Partial<PageImage> = {}): PageImage => ({ host: "x.com", path: "/a.webp", fmt: "webp", auto: false, nw: 600, dw: 390, top: 100, lazy: false, ...o });
const imgPage = (type: PageEvidence["pageType"], images: PageImage[], total = images.length) => pg(type, { facts: facts({ images, imagesTotal: total }) });
test("SPEED-05", () => {
  const good = [im(), im({ top: 1200, lazy: true }), im({ top: 2000, lazy: true })];
  assert.equal(run("SPEED-05", store([imgPage("home", good), imgPage("product", good)])).status, "pass");
  const heavy = [im({ nw: 2000 }), im({ nw: 2000 }), im()];
  const f = run("SPEED-05", store([imgPage("home", heavy), imgPage("product", heavy)]));
  assert.equal(f.status, "fail");
  assert.match(f.reason, /right size/);
  const eager = [im(), im({ top: 1200 }), im({ top: 2000 })];
  assert.match(run("SPEED-05", store([imgPage("home", eager), imgPage("product", eager)])).reason, /loading=lazy/);
  const jpgs = [im({ fmt: "jpg", path: "/a.jpg" }), im({ fmt: "jpg", path: "/b.jpg" })];
  assert.equal(run("SPEED-05", store([imgPage("home", jpgs), imgPage("product", jpgs)])).status, "fail");
  // jpg names on a CDN that may negotiate WebP can't be called either way
  const cdn = [im({ fmt: "jpg", host: "cdn.shopify.com" }), im({ fmt: "jpg", host: "cdn.shopify.com" })];
  assert.equal(run("SPEED-05", store([imgPage("home", cdn), imgPage("product", cdn)])).status, "unverified");
  assert.equal(run("SPEED-05", store([imgPage("home", good, 400), imgPage("product", good)])).status, "unverified", "list was cut");
  assert.equal(run("SPEED-05", store([imgPage("home", []), imgPage("product", [])])).status, "unverified", "no images");
  assert.equal(run("SPEED-05", store([pg("home"), imgPage("product", good)])).status, "unverified", "old evidence");
  assert.equal(run("SPEED-05", store([imgPage("home", good), pg("product", { loaded: false })])).status, "unverified");
});
