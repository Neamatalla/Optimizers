import type { PointTemplate } from "./types.js";

export const PRODUCT_PAGE: Record<string, PointTemplate> = {
  "PDP-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Measured on a 390x844 phone screen: the Add to Cart button ends {buttonBottom}px down." },
          business: { summary: "Shoppers can add to cart without scrolling.", detail: "On a phone, the price and the buy button are in view as soon as the product page opens." },
          protect: "Keep the buy button in the first screen when you add banners or apps above it.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Measured on a 390x844 phone screen: the Add to Cart button ends {buttonBottom}px down and no sticky buy bar appears." },
          business: { summary: "Shoppers have to scroll to find the buy button on a phone.", detail: "Each extra scroll before the button loses some shoppers who were ready to buy, and phone visits are most of your traffic." },
          step: "Move the price and Add to Cart into the first phone screen, or add a sticky buy bar that appears when the button scrolls away.",
          doneWhen: "On a phone, the product page shows the price and Add to Cart without scrolling, or a sticky bar follows.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors land on a product page with no buy button in view, so CVR on that traffic drops.", detail: "Ad clicks arrive ready to act; a buy button below the fold loses part of them before they see it, which raises CPA on the same spend. The fix is in the store theme: forward it to the owner or developer." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "زر الإضافة للسلة والسعر يظهران في الشاشة الأولى على الجوال.", detail: "القياس على شاشة جوال 390x844." },
          business: { summary: "العميل يضيف للسلة بدون تمرير.", detail: "على الجوال، السعر وزر الشراء ظاهران فور فتح صفحة المنتج." },
          protect: "أبقِ زر الشراء في الشاشة الأولى عند إضافة أي بانر أو تطبيق فوقه.",
        },
        fail: {
          technical: { summary: "زر الإضافة للسلة أسفل الشاشة الأولى على الجوال ولا يوجد شريط شراء ثابت.", detail: "القياس على شاشة جوال 390x844: الزر ينتهي عند {buttonBottom} بكسل." },
          business: { summary: "العميل يحتاج إلى التمرير ليجد زر الشراء على الجوال.", detail: "كل تمرير إضافي قبل الزر يخسرك بعض العملاء الجاهزين للشراء، وزيارات الجوال هي معظم زياراتك." },
          step: "انقل السعر وزر الإضافة للسلة إلى الشاشة الأولى على الجوال، أو أضف شريط شراء ثابتًا يظهر عند اختفاء الزر.",
          doneWhen: "صفحة المنتج على الجوال تعرض السعر وزر الإضافة للسلة بدون تمرير، أو يتبعها شريط ثابت.",
        },
      },
      store_owner: {
        pass: { business: { summary: "عميلك يقدر يضغط أضف للسلة بدون ما ينزل.", detail: "على الجوال، السعر وزر أضف للسلة يبانون أول ما تفتح صفحة المنتج." } },
        fail: { business: { summary: "عميلك لازم ينزل في الصفحة عشان يلقى زر أضف للسلة.", detail: "كل نزول زيادة قبل الزر يخسرك عملاء كانوا جاهزين يشترون، وأغلب زوارك من الجوال." } },
      },
    },
  },
};
