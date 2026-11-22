import type { PointTemplate } from "./types.js";

export const BUYING_PATH: Record<string, PointTemplate> = {
  "PATH-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Every wa.me, api.whatsapp.com and tel: link found on the visited pages carries 8 to 15 digits with the country code: {links}." },
          business: { summary: "Your WhatsApp and call buttons reach you.", detail: "A shopper with a question before buying can message or call you in one tap." },
          protect: "Keep the full number with the country code when you change the WhatsApp button or app.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "These links have a missing or short number, so WhatsApp or the dialler opens with nothing to reach: {broken}." },
          business: { summary: "Your WhatsApp or call button doesn't reach you.", detail: "A shopper who taps it to ask before buying gets an error or a blank chat, and many leave instead of trying again." },
          step: "Fix the WhatsApp or phone link to the full international number, for example https://wa.me/9665XXXXXXXX.",
          doneWhen: "Tapping the button on a phone opens a chat or call with your number.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "The WhatsApp button paid visitors use to ask before buying is broken, so those clicks are wasted.", detail: "In the Gulf many shoppers message before a first order. A broken link turns those ready-to-buy clicks into bounces, which raises CPA. Forward this to the store owner: it is a one-line fix in the store settings." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "روابط واتساب والاتصال تحمل الرقم الدولي كاملًا.", detail: "{links}" },
          business: { summary: "زر واتساب والاتصال يصل إليك.", detail: "العميل الذي لديه سؤال قبل الشراء يراسلك أو يتصل بك بضغطة واحدة." },
          protect: "احتفظ بالرقم كاملًا مع رمز الدولة عند تغيير زر واتساب أو تطبيقه.",
        },
        fail: {
          technical: { summary: "رابط واتساب أو اتصال برقم ناقص أو قصير.", detail: "{broken}" },
          business: { summary: "زر واتساب أو الاتصال لا يصل إليك.", detail: "العميل الذي يضغطه ليسأل قبل الشراء يرى خطأ أو محادثة فارغة، وكثيرون يغادرون بدل المحاولة مرة أخرى." },
          step: "صحّح رابط واتساب أو الهاتف إلى الرقم الدولي كاملًا، مثل https://wa.me/9665XXXXXXXX.",
          doneWhen: "الضغط على الزر من الجوال يفتح محادثة أو اتصالًا برقمك.",
        },
      },
      store_owner: {
        pass: { business: { summary: "زر الواتساب والاتصال في متجرك شغال ويوصلك.", detail: "أي عميل عنده سؤال قبل ما يشتري يقدر يراسلك بضغطة وحدة." } },
        fail: { business: { summary: "زر الواتساب أو الاتصال في متجرك ما يوصلك.", detail: "العميل اللي يبي يسأل قبل الشراء يطلع له خطأ أو محادثة فاضية، وكثير منهم يطلعون بدون ما يشترون." } },
      },
      media_buyer: {
        fail: { business: { summary: "زرار الواتساب اللي الزوار المدفوعين بيسألوا منه قبل الشراء بايظ، فالكليكات دي ضايعة.", detail: "في الخليج ناس كتير بتسأل على واتساب قبل أول أوردر. اللينك البايظ بيحوّل الكليكات الجاهزة للشراء لـ bounce وبيرفع الـ CPA. ابعت النقطة دي لصاحب المتجر: تصليحها سطر واحد في الإعدادات." } },
      },
    },
  },
};
