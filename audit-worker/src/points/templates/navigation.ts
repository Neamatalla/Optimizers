import type { PointTemplate } from "./types.js";

export const NAVIGATION: Record<string, PointTemplate> = {
  "NAV-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "No overlay covering 30% or more of the phone screen appeared on the home page in the first seconds (cookie banners are judged separately)." },
          business: { summary: "Nothing gets in the way when a shopper arrives.", detail: "Visitors see your offer and products straight away instead of a popup to close." },
          protect: "Show signup or discount popups after a shopper scrolls or spends time, not on arrival.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Overlays on arrival: {popups}." },
          business: { summary: "A popup covers the screen the moment a shopper arrives.", detail: "The first thing a visitor sees is something to close, not your products. Many phone visitors leave at that point, especially ones coming from an ad." },
          step: "Delay the popup until the shopper scrolls or has been on the page for a while, and make it easy to close with one tap.",
          doneWhen: "Opening the home page on a phone shows the page itself first, with no overlay covering it.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors hit a full-screen popup on arrival, so part of every click bounces before seeing the offer.", detail: "Ad traffic is the least patient: an overlay on arrival lowers CVR and raises CPA on the same spend. Ask the owner to delay it or show it only to returning visitors." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا توجد نافذة منبثقة تغطي الشاشة عند وصول الزائر.", detail: "لم تظهر نافذة تغطي 30% أو أكثر من شاشة الجوال في الصفحة الرئيسية خلال الثواني الأولى." },
          business: { summary: "لا شيء يعترض العميل عند وصوله.", detail: "الزائر يرى عرضك ومنتجاتك مباشرة بدل نافذة يجب إغلاقها." },
          protect: "اعرض نوافذ التسجيل أو الخصم بعد تمرير العميل أو بقائه فترة، لا عند الوصول.",
        },
        fail: {
          technical: { summary: "نافذة منبثقة تغطي شاشة الجوال عند الوصول.", detail: "{popups}" },
          business: { summary: "نافذة منبثقة تغطي الشاشة لحظة وصول العميل.", detail: "أول ما يراه الزائر شيء يجب إغلاقه وليس منتجاتك. كثير من زوار الجوال يغادرون عند هذه النقطة، خاصة القادمين من إعلان." },
          step: "أخّر النافذة حتى يمرر العميل أو يبقى في الصفحة قليلًا، واجعل إغلاقها سهلًا بضغطة واحدة.",
          doneWhen: "فتح الصفحة الرئيسية على الجوال يعرض الصفحة نفسها أولًا بدون نافذة تغطيها.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه نافذة تطلع وتغطي الشاشة أول ما يدخل العميل متجرك.", detail: "أول شي يشوفه العميل شي لازم يسكره مو منتجاتك، وكثير من زوار الجوال يطلعون من هنا." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيقابلوا popup مغطي الشاشة أول ما يدخلوا، فجزء من كل كليك بيعمل bounce.", detail: "ترافيك الإعلانات أقل صبر: أي overlay أول ما يدخل بيقلل الـ CVR ويرفع الـ CPA على نفس الصرف. اطلب من صاحب المتجر يأخّره أو يعرضه للزوار الراجعين بس." } },
      },
    },
  },
};
