// "Check it yourself" for the media buyer (ICP2): how to confirm a tracking
// finding with the tools they already have open (Events Manager Test Events,
// Pixel Helper, GA4 DebugView and Realtime, the browser Network tab), so the
// report is proof they can show the owner or developer, not our word for it.
// From the event-failure library in icp/media-buyer-full.md §8.
//
// Instructions only: what to open and what a healthy result looks like. They
// never state what this store's result will be. Keyed by the shared checklist
// id; the media buyer's own points (MB-*) resolve through
// PERSONA_SHARED_SOURCES. Arabic is everyday Egyptian with tool and event
// names kept in Latin script (icp/media-buyer.md, "Arabic").

import { PERSONA_SHARED_SOURCES } from "./checklist-persona-data.js";

type Steps = { en: string; ar: string };

const VERIFY: Readonly<Record<string, Steps>> = {
  "GTM-01": {
    en: "Open Events Manager → Test Events. Place one test order. You should see one Purchase. Two means the order is counted twice. In GA4 DebugView, its transaction_id should appear once.",
    ar: "افتح Events Manager ← Test Events. اعمل أوردر تجريبي واحد. المفروض يظهر Purchase واحد بس. اتنين معناها إن الأوردر بيتحسب مرتين. وفي GA4 DebugView الـ transaction_id يظهر مرة واحدة.",
  },
  "GTM-02": {
    en: "On the thank-you page, open the browser Network tab. Click the purchase hit. value should be the amount charged. currency should be a code like EGP or SAR. items should not be empty.",
    ar: "في صفحة الشكر افتح Network tab في المتصفح. دوس على الـ purchase hit. الـ value لازم تكون المبلغ اللي اتدفع. الـ currency كود زي EGP أو SAR. والـ items مش فاضية.",
  },
  "GTM-03": {
    en: "Open Events Manager → your pixel → Purchase. Browser and server events should share one event_id. The overview shouldn't warn about duplicates.",
    ar: "افتح Events Manager ← الـ Pixel بتاعك ← Purchase. أحداث المتصفح والسيرفر لازم يكون ليهم نفس الـ event_id. والـ overview مايبقاش فيه تحذير duplicates.",
  },
  "GTM-04": {
    en: "Open the store with Meta, TikTok and Snap Pixel Helper. Check each platform you spend on. It should show PageView on the homepage. It should show Purchase on a test order.",
    ar: "افتح المتجر وMeta وTikTok وSnap Pixel Helper شغالين. بُص على كل منصة بتصرف عليها. لازم يظهر PageView في الصفحة الرئيسية. ولازم يظهر Purchase في أوردر تجريبي.",
  },
  "GTM-05": {
    en: "Open Google Ads → Goals → Conversions. The purchase action should say \"Recording conversions\". \"Inactive\" or \"No recent conversions\" means a problem.",
    ar: "افتح Google Ads ← Goals ← Conversions. الـ purchase action لازم يكون جنبه \"Recording conversions\". لو مكتوب \"Inactive\" أو \"No recent conversions\" يبقى فيه مشكلة.",
  },
  "GTM-06": {
    en: "Open GA4 DebugView and browse the store. Open a product: view_item. Add it to the cart: add_to_cart. Start checkout: begin_checkout. Finish a test order: purchase.",
    ar: "افتح GA4 DebugView واتصفح المتجر. افتح منتج: view_item. ضيفه للسلة: add_to_cart. ابدأ الدفع: begin_checkout. كمّل أوردر تجريبي: purchase.",
  },
  "GTM-07": {
    en: "Open Test Events and DebugView. Refresh the thank-you page. Nothing new should fire. A second Purchase means the conversion follows the page URL, not the order.",
    ar: "افتح Test Events وDebugView. اعمل refresh لصفحة الشكر. المفروض مفيش حاجة جديدة تظهر. لو ظهر Purchase تاني يبقى التحويل مربوط بلينك الصفحة، مش بالأوردر.",
  },
  "GTM-08": {
    en: "Open DebugView. add_to_cart and purchase should carry item_id, price and quantity. Events Manager → Diagnostics shouldn't show \"missing content_ids\".",
    ar: "افتح DebugView. الـ add_to_cart والـ purchase لازم يكون فيهم item_id وprice وquantity. وEvents Manager ← Diagnostics مايبقاش فيه \"missing content_ids\".",
  },
  "GTM-10": {
    en: "Open the page source. Search for \"G-\" and \"GTM-\". You should find one GA4 ID and one container.",
    ar: "افتح الـ page source. دوّر على \"G-\" و\"GTM-\". المفروض تلاقي GA4 ID واحد وcontainer واحد.",
  },
  "GTM-11": {
    en: "Open GA4 DebugView. Tap the WhatsApp or call button. A contact event should appear.",
    ar: "افتح GA4 DebugView. دوس على زرار الواتساب أو الاتصال. المفروض يظهر contact event.",
  },
  "GTM-14": {
    en: "Open the store with ?fbclid=test at the end of the link. Go to a product page. Open DevTools → Application → Cookies. You should see _fbc.",
    ar: "افتح المتجر وفي آخر اللينك ?fbclid=test. روح لصفحة منتج. افتح DevTools ← Application ← Cookies. المفروض تلاقي _fbc.",
  },
  "GTM-21": {
    en: "GTM Preview can't see the Shopify checkout. Place a test order instead. Look for begin_checkout and purchase in Test Events and GA4 DebugView.",
    ar: "GTM Preview مش بيشوف الـ checkout في Shopify. اعمل أوردر تجريبي بداله. دوّر على begin_checkout والـ purchase في Test Events وGA4 DebugView.",
  },
  "GTM-24": {
    en: "Open DebugView. Add a product from the cart drawer or quick-add. add_to_cart should fire once. The product should really be in the cart.",
    ar: "افتح DebugView. ضيف منتج من الـ cart drawer أو الـ quick-add. الـ add_to_cart لازم يتبعت مرة واحدة. والمنتج لازم يكون فعلًا في السلة.",
  },
  "GTM-25": {
    en: "Open the store in a private window. Don't touch the cookie banner. Pixel Helper should still show tags in consent mode. Nothing at all means visits are lost.",
    ar: "افتح المتجر في private window. متلمسش بانر الكوكيز. Pixel Helper لازم يفضل يبيّن tags في consent mode. لو مفيش ولا حاجة يبقى الزيارات بتضيع.",
  },
  "GA4-08": {
    en: "Open GA4 → Reports → Acquisition → Traffic acquisition. \"(not set)\" and \"Unassigned\" should be a small share of sessions.",
    ar: "افتح GA4 ← Reports ← Acquisition ← Traffic acquisition. الـ \"(not set)\" والـ \"Unassigned\" لازم يبقوا نسبة صغيرة من الـ sessions.",
  },
  "GA4-14": {
    en: "Open GA4 → Admin → Audiences. Look for cart abandoners and product viewers. Each should have users in it.",
    ar: "افتح GA4 ← Admin ← Audiences. دوّر على اللي سابوا السلة واللي شافوا المنتجات. كل واحدة لازم يكون فيها users.",
  },
  "GA4-15": {
    en: "Open GA4 → Realtime. Browse the store. You should show up within a minute.",
    ar: "افتح GA4 ← Realtime. اتصفح المتجر. المفروض تظهر خلال دقيقة.",
  },
  "GA4-17": {
    en: "Open GA4 → Admin → Events. Look for view_item, add_to_cart, begin_checkout and purchase. Each should have a count.",
    ar: "افتح GA4 ← Admin ← Events. دوّر على view_item وadd_to_cart وbegin_checkout وpurchase. كل واحد لازم يكون جنبه عدد.",
  },
  "GA4-18": {
    en: "Take last week's purchases and revenue in GA4. Compare them with the store's orders for the same days. A gap over about 20% means sales are missing or counted twice.",
    ar: "خد الـ purchases والـ revenue بتوع الأسبوع اللي فات في GA4. قارنهم بأوردرات المتجر لنفس الأيام. لو الفرق أكتر من حوالي 20% يبقى فيه مبيعات ناقصة أو بتتحسب مرتين.",
  },
  "GA4-19": {
    en: "Open GA4 → Traffic acquisition by session source. Payment sites like Paymob, Tabby, Tamara, Tap and PayTabs shouldn't appear.",
    ar: "افتح GA4 ← Traffic acquisition حسب الـ session source. مواقع الدفع زي Paymob وTabby وTamara وTap وPayTabs مايظهروش.",
  },
  "GA4-20": {
    en: "Open GA4 → Admin → Key events. Only real outcomes like purchase should be marked. A marked page_view or add_to_cart inflates conversions.",
    ar: "افتح GA4 ← Admin ← Key events. المفروض تتعلّم بس النتايج الحقيقية زي purchase. لو page_view أو add_to_cart متعلّمين، التحويلات بتبقى منفوخة.",
  },
  "GA4-21": {
    en: "Open GA4 → Admin → Product links → Google Ads links. Your Ads account should be listed.",
    ar: "افتح GA4 ← Admin ← Product links ← Google Ads links. حساب Google Ads بتاعك لازم يكون موجود.",
  },
};

/** The steps for a point, by its own id or the shared point it comes from. */
export function verifyFor(checklistId: string): Steps | null {
  if (VERIFY[checklistId]) return VERIFY[checklistId];
  for (const src of PERSONA_SHARED_SOURCES[checklistId] ?? []) if (VERIFY[src]) return VERIFY[src];
  return null;
}
