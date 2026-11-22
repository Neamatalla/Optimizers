import type { PointTemplate } from "./types.js";

export const TRACKING: Record<string, PointTemplate> = {
  "TRK-20": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Purchase conversion rate by device category over 28 days, from GA4." },
          business: { summary: "Phone shoppers buy almost as often as desktop shoppers.", detail: "Most visits come from phones, so a phone experience that keeps up with desktop protects most of your sales." },
          protect: "Re-check phone conversion after every theme or app change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Purchase conversion rate by device category over 28 days, from GA4. Phones convert under 60% of desktop's rate." },
          business: { summary: "Phone shoppers buy far less often than desktop shoppers.", detail: "Most of your visits come from phones, so the gap costs more sales than any desktop issue. The cause is usually on the phone product or cart page: slow loading, a buy button out of reach, or a hard checkout." },
          step: "Open your product and cart pages on a phone and fix what slows or blocks buying there first.",
          doneWhen: "Phone conversion reaches at least 60% of desktop's in GA4 over 14 days.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "Paid phone clicks convert at a fraction of desktop, so CPA on mobile placements is inflated.", detail: "Most Meta, TikTok and Snap traffic is phone traffic. Every phone click that doesn't buy raises your CPA and lowers ROAS on the same spend. Check the device breakdown in Ads Manager against GA4's device report; the fix is on the store's phone pages, not in the campaigns." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "معدل تحويل الجوال قريب من معدل تحويل الكمبيوتر خلال 28 يومًا في GA4.", detail: "معدل تحويل المشتريات حسب نوع الجهاز من GA4." },
          business: { summary: "زوار الجوال يشترون تقريبًا بنفس معدل زوار الكمبيوتر.", detail: "معظم الزيارات من الجوال، لذلك تجربة جوال بمستوى الكمبيوتر تحمي معظم المبيعات." },
          protect: "أعد فحص تحويل الجوال بعد كل تغيير في القالب أو التطبيقات.",
        },
        fail: {
          technical: { summary: "معدل تحويل الجوال أقل من 60% من معدل الكمبيوتر خلال 28 يومًا في GA4.", detail: "معدل تحويل المشتريات حسب نوع الجهاز من GA4." },
          business: { summary: "زوار الجوال يشترون أقل بكثير من زوار الكمبيوتر.", detail: "معظم الزيارات من الجوال، لذلك هذه الفجوة تكلّف مبيعات أكثر من أي مشكلة على الكمبيوتر. السبب غالبًا في صفحة المنتج أو السلة على الجوال: بطء، أو زر شراء بعيد، أو دفع صعب." },
          step: "افتح صفحات المنتج والسلة على الجوال وأصلح أولًا ما يبطئ الشراء أو يعيقه.",
          doneWhen: "يصل تحويل الجوال إلى 60% على الأقل من تحويل الكمبيوتر في GA4 خلال 14 يومًا.",
        },
      },
      store_owner: {
        pass: { business: { summary: "زوار الجوال يشترون من متجرك تقريبًا مثل زوار الكمبيوتر.", detail: "أغلب زوارك من الجوال، وتجربة الجوال عندك ماشية زين وتحمي أغلب مبيعاتك." } },
        fail: { business: { summary: "زوار الجوال يشترون من متجرك أقل بكثير من زوار الكمبيوتر.", detail: "أغلب زوارك من الجوال، فهالفرق يخسرك مبيعات أكثر من أي شي ثاني. السبب غالبًا في صفحة المنتج أو السلة على الجوال: بطء، أو زر أضف للسلة بعيد، أو دفع معقد." } },
      },
      media_buyer: {
        fail: { business: { summary: "كليكات الجوال المدفوعة بتحوّل أقل بكتير من الكمبيوتر، فالـ CPA على الموبايل أعلى من اللازم.", detail: "أغلب ترافيك Meta و TikTok و Snap جاي من الموبايل. كل كليك موبايل مبيشتريش بيرفع الـ CPA ويقلل الـ ROAS على نفس الصرف. قارن تقسيم الأجهزة في Ads Manager بتقرير الأجهزة في GA4؛ الحل في صفحات المتجر على الموبايل مش في الحملات." } },
      },
    },
  },
  "TRK-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Purchase and conversion tags in the GTM container fire on a dataLayer custom event and send an order ID: {conversionTags}." },
          business: { summary: "Each sale is reported once, at the moment it happens.", detail: "Ad platforms and GA4 learn from real purchases only, so the sales numbers you see are the real ones." },
          protect: "Keep purchase tags on the purchase event when you add a new ad platform.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "A purchase tag on All Pages fires for every visitor, and one on a thank-you page view fires again on every reload or revisit. Without an order ID, platforms can't drop the repeats." },
          business: { summary: "Sales can be counted more than once, or for visits that didn't buy.", detail: "Your ad platforms then report more sales than you made, so campaigns look better than they are and budget follows the wrong ones." },
          step: "In GTM, move every purchase tag to a purchase custom-event trigger and send the order ID in each one.",
          doneWhen: "Each test order shows exactly one purchase, with its order ID, in GTM Preview and in each platform's test tool.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "Purchase tags fire on the wrong trigger or without an order ID, so reported ROAS reads higher than real.", detail: "Duplicate or false Purchases make losing campaigns look like winners and teach the algorithm the wrong buyers. Fixing it may lower reported ROAS: that is the truth showing, not performance dropping. Confirm with Meta Test Events or the Pixel Helper on a test order." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "وسوم الشراء في حاوية GTM تعمل على حدث dataLayer وترسل رقم الطلب.", detail: "{conversionTags}" },
          business: { summary: "كل عملية بيع تُسجَّل مرة واحدة في لحظة حدوثها.", detail: "منصات الإعلان و GA4 تتعلم من المشتريات الحقيقية فقط، فأرقام المبيعات التي تراها حقيقية." },
          protect: "أبقِ وسوم الشراء على حدث الشراء عند إضافة أي منصة إعلانية جديدة.",
        },
        fail: {
          technical: { summary: "وسم شراء يعمل على كل الصفحات أو على زيارة صفحة الشكر، أو لا يرسل رقم الطلب.", detail: "وسم الشراء على كل الصفحات يعمل لكل زائر، وعلى صفحة الشكر يعمل مجددًا مع كل تحديث. بدون رقم الطلب لا تستطيع المنصات حذف التكرار." },
          business: { summary: "قد تُحسب المبيعات أكثر من مرة، أو لزيارات لم تشترِ.", detail: "منصاتك الإعلانية تعرض مبيعات أكثر من الحقيقية، فتبدو الحملات أفضل مما هي عليه وتذهب الميزانية للحملات الخطأ." },
          step: "في GTM، انقل كل وسوم الشراء إلى مشغّل حدث شراء مخصص وأرسل رقم الطلب في كل منها.",
          doneWhen: "كل طلب تجريبي يظهر كعملية شراء واحدة برقم الطلب في معاينة GTM وأداة الاختبار في كل منصة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "مبيعاتك ممكن تنحسب أكثر من مرة في منصات الإعلان.", detail: "المنصات تشوف مبيعات أكثر من اللي صارت فعلًا، فتحسب إن الحملة ناجحة وهي مو كذا، وتصرف فلوسك على الحملة الغلط." } },
      },
      media_buyer: {
        fail: { business: { summary: "وسوم الـ Purchase شغالة على trigger غلط أو من غير order ID، فالـ ROAS المعروض أعلى من الحقيقي.", detail: "الـ Purchase المكرر أو الوهمي بيخلي حملات خسرانة تبان كسبانة وبيعلّم الـ algorithm المشترين الغلط. التصليح ممكن ينزّل الـ ROAS المعروض: ده الرقم الحقيقي، مش هبوط في الأداء. اتأكد بـ Test Events أو Pixel Helper على أوردر تجريبي." } },
      },
    },
  },
};
