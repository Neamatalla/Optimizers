import type { PointTemplate } from "./types.js";

export const SPEED: Record<string, PointTemplate> = {
  "SPEED-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Largest Contentful Paint from Google PageSpeed Insights, phone run with throttling. Good is under 2.5 s." },
          business: { summary: "Your main content shows quickly on a phone.", detail: "Shoppers see the product photo and price fast, even on a slower mobile connection." },
          protect: "Compress new banners and product photos before uploading them.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Largest Contentful Paint from Google PageSpeed Insights, phone run with throttling. Good is under 2.5 s. The usual causes are large hero images, render-blocking files and slow app scripts." },
          business: { summary: "Your pages take too long to show their main content on a phone.", detail: "Shoppers wait for the photo and price to appear, and the longer they wait the more of them leave before seeing the product." },
          step: "Compress the largest image on the slow page, serve it in WebP, and defer app scripts that load before it.",
          doneWhen: "PageSpeed Insights shows LCP under 2.5 s on the phone run for home and product.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "Slow first paint on phones loses paid clicks before the page shows, so you pay for visits that never see the offer.", detail: "Ad platforms count the click; the shopper leaves while the page loads. That gap shows as clicks far above landing-page views in Ads Manager, and it raises CPA. The fix is on the store side: forward it to the developer." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "المحتوى الرئيسي يظهر بسرعة على الجوال (LCP أقل من 2.5 ثانية).", detail: "من Google PageSpeed Insights، تشغيل الجوال مع إبطاء الشبكة." },
          business: { summary: "المحتوى الرئيسي يظهر بسرعة على الجوال.", detail: "العميل يرى صورة المنتج والسعر بسرعة حتى على اتصال جوال أبطأ." },
          protect: "اضغط البانرات وصور المنتجات الجديدة قبل رفعها.",
        },
        fail: {
          technical: { summary: "المحتوى الرئيسي يتأخر في الظهور على الجوال (LCP أكثر من 2.5 ثانية).", detail: "من Google PageSpeed Insights، تشغيل الجوال مع إبطاء الشبكة. الأسباب المعتادة: صور كبيرة، وملفات تعطل العرض، وسكربتات تطبيقات بطيئة." },
          business: { summary: "صفحاتك تتأخر في عرض محتواها الرئيسي على الجوال.", detail: "العميل ينتظر ظهور الصورة والسعر، وكلما طال الانتظار غادر عدد أكبر قبل رؤية المنتج." },
          step: "اضغط أكبر صورة في الصفحة البطيئة واعرضها بصيغة WebP، وأخّر سكربتات التطبيقات التي تُحمَّل قبلها.",
          doneWhen: "يظهر LCP أقل من 2.5 ثانية في PageSpeed Insights لتشغيل الجوال في الرئيسية والمنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات متجرك تتأخر قبل ما تبين على الجوال.", detail: "العميل ينتظر الصورة والسعر، وكل ما طال الانتظار طلع عدد أكبر قبل ما يشوف المنتج." } },
      },
    },
  },
};
