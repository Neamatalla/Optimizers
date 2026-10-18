import type { ActionOwner, Opportunity } from "../types.js";
import type { FudGroup } from "./rules.js";

/**
 * The action layer for the Conversion review's rules: who fixes each one and
 * how the store can tell it's fixed. The judge writes the store-specific
 * step (its `recommendation`); these never change per store.
 */
export const RULE_ACTIONS: Record<string, { owners: ActionOwner[]; doneWhen: { en: string; ar: string } }> = {
  A1: { owners: ["owner", "dev"], doneWhen: { en: "The cart shows the shipping cost or the free-shipping rule before checkout.", ar: "السلة تعرض تكلفة الشحن أو شرط الشحن المجاني قبل إتمام الشراء." } },
  A2: { owners: ["content"], doneWhen: { en: "The product page shows at least three reasons the price is worth it, above the fold or next to the price.", ar: "صفحة المنتج تعرض ثلاثة أسباب على الأقل تبرر السعر بجانب السعر أو في أول الشاشة." } },
  A3: { owners: ["dev"], doneWhen: { en: "The cart shows item price, shipping and total before the checkout button.", ar: "السلة تعرض سعر المنتج والشحن والإجمالي قبل زر إتمام الشراء." } },
  A4: { owners: ["owner", "dev"], doneWhen: { en: "Installments or cash on delivery are named next to the price on the product page.", ar: "التقسيط أو الدفع عند الاستلام مذكور بجانب السعر في صفحة المنتج." } },
  B1: { owners: ["content"], doneWhen: { en: "A returns or guarantee line is visible within one screen of the Add to Cart button.", ar: "سطر سياسة الاسترجاع أو الضمان ظاهر على بُعد شاشة واحدة من زر الإضافة للسلة." } },
  B4: { owners: ["content", "dev"], doneWhen: { en: "A size guide link sits next to the size options.", ar: "رابط دليل المقاسات موجود بجانب خيارات المقاس." } },
  B5: { owners: ["dev", "content"], doneWhen: { en: "Stock status and delivery time are shown next to the Add to Cart button.", ar: "حالة التوفر ومدة التوصيل ظاهرة بجانب زر الإضافة للسلة." } },
  C1: { owners: ["dev"], doneWhen: { en: "A star rating or review count shows on the product's first screen.", ar: "التقييم أو عدد المراجعات ظاهر في أول شاشة لصفحة المنتج." } },
  C3: { owners: ["owner"], doneWhen: { en: "Reviews show names, dates and some photos, with a mix of ratings.", ar: "المراجعات تعرض الأسماء والتواريخ وبعض الصور مع تقييمات متنوعة." } },
  C4: { owners: ["content"], doneWhen: { en: "Every trust badge links to or names something a shopper can check.", ar: "كل شارة ثقة تشير إلى شيء يمكن للمتسوق التحقق منه." } },
  C5: { owners: ["content"], doneWhen: { en: "The site shows a business address or registration, a phone or WhatsApp and an About page.", ar: "الموقع يعرض عنوانًا أو سجلًا تجاريًا ورقم هاتف أو واتساب وصفحة من نحن." } },
  D1: { owners: ["content", "dev"], doneWhen: { en: "A short reassurance line (returns, delivery, payment) sits right under the Add to Cart button.", ar: "سطر طمأنة قصير (الاسترجاع، التوصيل، الدفع) أسفل زر الإضافة للسلة مباشرة." } },
  D2: { owners: ["dev"], doneWhen: { en: "The cart shows payment options and a returns or security line next to the checkout button.", ar: "السلة تعرض طرق الدفع وسطر الاسترجاع أو الأمان بجانب زر إتمام الشراء." } },
  D3: { owners: ["owner", "dev"], doneWhen: { en: "A WhatsApp or chat link is reachable from the product page in one tap.", ar: "رابط واتساب أو محادثة يمكن الوصول إليه من صفحة المنتج بضغطة واحدة." } },
  C6: { owners: ["dev"], doneWhen: { en: "Every product card on collection pages shows its price, and rating where reviews exist.", ar: "كل بطاقة منتج في صفحات الأقسام تعرض السعر، والتقييم إن وُجدت مراجعات." } },
  D4: { owners: ["dev"], doneWhen: { en: "Collection pages have a filter and a sort control on phones.", ar: "صفحات الأقسام فيها فلتر وترتيب على الهاتف." } },
  D5: { owners: ["dev", "content"], doneWhen: { en: "Every quick-add button uses the same label.", ar: "كل أزرار الإضافة السريعة تحمل نفس العبارة." } },
  H1: { owners: ["content"], doneWhen: { en: "The homepage first screen says what you sell and for whom in one line.", ar: "أول شاشة في الصفحة الرئيسية توضح ما تبيعه ولمن في سطر واحد." } },
  H2: { owners: ["content", "dev"], doneWhen: { en: "The homepage first screen has one main button to shop.", ar: "أول شاشة في الصفحة الرئيسية فيها زر رئيسي واحد للتسوق." } },
  P1: { owners: ["content"], doneWhen: { en: "Each product has at least 5 photos, including one in use, and a video where possible.", ar: "كل منتج له 5 صور على الأقل منها صورة أثناء الاستخدام، وفيديو إن أمكن." } },
  P2: { owners: ["dev"], doneWhen: { en: "Size and colour options are tap buttons, not dropdowns.", ar: "خيارات المقاس واللون أزرار بضغطة، وليست قوائم منسدلة." } },
  P3: { owners: ["dev"], doneWhen: { en: "An Add to Cart button stays on screen while scrolling the product page on a phone.", ar: "زر الإضافة للسلة يبقى ظاهرًا أثناء التمرير في صفحة المنتج على الهاتف." } },
  P4: { owners: ["content", "dev"], doneWhen: { en: "Product details are split into short sections or tabs with headings.", ar: "تفاصيل المنتج مقسمة إلى أقسام قصيرة أو تبويبات بعناوين." } },
  N1: { owners: ["dev", "content"], doneWhen: { en: "The main menu has 7 or fewer specific items.", ar: "القائمة الرئيسية فيها 7 عناصر محددة أو أقل." } },
  N2: { owners: ["dev"], doneWhen: { en: "Search is visible in the phone header and a product-name search returns that product.", ar: "البحث ظاهر في رأس الصفحة على الهاتف والبحث باسم منتج يعرضه." } },
  M1: { owners: ["owner", "dev"], doneWhen: { en: "A bundle or multi-buy offer shows next to the Add to Cart button.", ar: "عرض الباقة أو الشراء المتعدد ظاهر بجانب زر الإضافة للسلة." } },
  M2: { owners: ["dev"], doneWhen: { en: "The product page and the cart each suggest related add-ons.", ar: "صفحة المنتج والسلة تقترح كل منهما منتجات مكملة." } },
  M3: { owners: ["owner"], doneWhen: { en: "The free-shipping threshold is 1.2–1.5× the average order value and shown in the cart with the amount left.", ar: "حد الشحن المجاني بين 1.2 و1.5 ضعف متوسط قيمة الطلب ويظهر في السلة مع المبلغ المتبقي." } },
  R1: { owners: ["marketing", "dev"], doneWhen: { en: "An email or WhatsApp signup with a first-order offer is live on the site.", ar: "نموذج اشتراك بالبريد أو واتساب مع عرض لأول طلب يعمل على الموقع." } },
  R2: { owners: ["marketing"], doneWhen: { en: "The site shows a loyalty, referral or subscribe-and-save offer.", ar: "الموقع يعرض برنامج ولاء أو إحالة أو اشتراك بخصم." } },
  L1: { owners: ["content", "dev"], doneWhen: { en: "The Arabic version covers menus, product pages and cart in natural Arabic.", ar: "النسخة العربية تغطي القوائم وصفحات المنتجات والسلة بلغة عربية طبيعية." } },
  L2: { owners: ["owner", "dev"], doneWhen: { en: "Local payment options and delivery coverage are shown on the product page or cart.", ar: "طرق الدفع المحلية ونطاق التوصيل ظاهرة في صفحة المنتج أو السلة." } },
  U1: { owners: ["marketing", "dev"], doneWhen: { en: "No popup covers the page in the first 10 seconds of a visit.", ar: "لا تظهر نافذة منبثقة تغطي الصفحة في أول 10 ثوانٍ من الزيارة." } },
};

// Trust and cost doubts lose shoppers who already wanted to buy; layout,
// navigation and offer gaps are sales the store could be making.
export const GROUP_OPPORTUNITY: Record<FudGroup, Opportunity> = {
  trust: "revenue_loss",
  homepage: "revenue_gain",
  product: "revenue_gain",
  navigation: "revenue_gain",
  collection: "revenue_gain",
  buy_more: "revenue_gain",
  buy_again: "revenue_gain",
  local: "revenue_gain",
  popups: "revenue_loss",
};
