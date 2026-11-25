import type { PointTemplate } from "./types.js";

export const LANDING: Record<string, PointTemplate> = {
  // net.ts land02: the paid landing URLs from GA4 (the pages with the most paid visits, up to 2) fail on 404/410
  // or a not-found title; the 404 page needs search, a home link or product links.
  "LAND-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Paid landing pages checked: {landingChecked}, the pages with the most paid visits in GA4. A made-up URL showed that {notFound}." },
          business: { summary: "The pages your ads send people to all load.", detail: "Every paid click reaches a working page, and a broken ad link would still lead shoppers back to products." },
          protect: "Before deleting or renaming a product or collection, check whether an ad points at it and redirect the old address.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Paid landing pages checked: {landingChecked}. A page fails when it answers 404 or 410, or loads with a not-found title. The 404 page passes with a search box, a home link or product links, and here {notFound}." },
          business: { summary: "An ad sends people to a page that doesn't exist, or the missing-page screen offers no way back.", detail: "Every click on that ad is paid for and lands on an error. Shoppers who see a not-found page almost always leave." },
          step: "The ad manager changes each ad URL that points to a dead page. The developer redirects deleted product URLs to the closest live product or collection, and adds search or a home link to the 404 page.",
          doneWhen: "The paid landing pages from GA4 load without a 404, 410 or not-found title, and a made-up address on the store shows a 404 page with search, a home link or product links.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your ads send people to a page in your store that doesn't exist.", detail: "You pay for every click on that ad, and each one lands on an error page. Almost everyone who sees it leaves." } },
      },
      media_buyer: {
        fail: { business: { summary: "A paid landing page shows not-found, or the 404 page has no way back, so those clicks can't convert.", detail: "Every click to a dead page is spend with zero chance of a sale, which pushes CAC and CPA up right now. Swap the ad URLs yourself and ask the store's developer to redirect the deleted pages." } },
      },
      agency: {
        pass: { business: { summary: "The pages the store's ads send people to all load.", detail: "Every paid click reaches a working page, and a broken ad link would still lead shoppers back to products." } },
        fail: { business: { summary: "An ad sends people to a page on the store that doesn't exist, or the missing-page screen offers no way back.", detail: "Every click on that ad is paid for and lands on an error. Shoppers who see a not-found page almost always leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "صفحات الهبوط المدفوعة تعمل، وصفحة 404 تعرض بحثًا أو طريقًا للعودة.", detail: "صفحات الهبوط التي فحصناها: {landingChecked}، وهي الصفحات الأكثر زيارات مدفوعة في GA4." },
          business: { summary: "الصفحات التي ترسل إليها الإعلانات تعمل كلها.", detail: "كل نقرة مدفوعة تصل إلى صفحة تعمل، ورابط الإعلان المعطل سيعيد العميل إلى المنتجات." },
          protect: "قبل حذف منتج أو تصنيف أو تغيير اسمه، تحقق إن كان إعلان يشير إليه، ووجّه العنوان القديم إلى صفحة قائمة.",
        },
        fail: {
          technical: { summary: "صفحة هبوط مدفوعة تعيد صفحة غير موجودة، أو صفحة 404 بلا بحث ولا طريق للعودة.", detail: "صفحات الهبوط التي فحصناها: {landingChecked}. تفشل الصفحة إذا أعادت 404 أو 410 أو حمل عنوانها عبارة غير موجودة. وتنجح صفحة 404 إذا احتوت على بحث أو رابط للرئيسية أو روابط منتجات." },
          business: { summary: "إعلان يرسل الناس إلى صفحة غير موجودة، أو صفحة الخطأ لا تعيدهم إلى المتجر.", detail: "كل نقرة على هذا الإعلان مدفوعة وتصل إلى صفحة خطأ. ومن يرى صفحة غير موجودة يغادر في أغلب الحالات." },
          step: "يغيّر مسؤول الإعلانات كل رابط إعلان يشير إلى صفحة معطلة. ويوجّه المطوّر روابط المنتجات المحذوفة إلى أقرب منتج أو تصنيف قائم، ويضيف بحثًا أو رابطًا للرئيسية في صفحة 404.",
          doneWhen: "صفحات الهبوط المدفوعة من GA4 تعمل بدون 404 أو 410 أو عنوان غير موجود، وعنوان وهمي على المتجر يعرض صفحة 404 فيها بحث أو رابط للرئيسية أو روابط منتجات.",
        },
      },
      store_owner: {
        fail: { business: { summary: "إعلاناتك ترسل الناس لصفحة في متجرك مو موجودة.", detail: "أنت تدفع على كل ضغطة على هالإعلان، وكلها توصل لصفحة خطأ. وتقريبًا كل اللي يشوفها يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة هبوط مدفوعة بتطلع not found، أو صفحة الـ 404 مفيهاش طريق رجوع، فالكليكات دي مستحيل تتحوّل.", detail: "كل كليك لصفحة ميتة صرف من غير أي فرصة بيع، وده بيرفع الـ CAC والـ CPA دلوقتي. غيّر روابط الإعلانات بنفسك واطلب من مطوّر المتجر يعمل redirect للصفحات المحذوفة." } },
      },
      agency: {
        fail: { business: { summary: "إعلان يرسل الناس إلى صفحة غير موجودة في المتجر، أو صفحة الخطأ لا تعيدهم إليه.", detail: "كل نقرة على هذا الإعلان مدفوعة وتصل إلى صفحة خطأ، ومن يرى صفحة غير موجودة يغادر في أغلب الحالات." } },
      },
    },
  },

  // account.ts land05: Clarity's most-visited page stands in for the top landing page; 100+ sessions;
  // fails when its quick-back share is above the site-wide share.
  "LAND-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On {url}, {quickbacksPage}% of {sessions} sessions had a quick-back, against {quickbacksSite}% site-wide. Clarity has no landing-page report, so its most-visited page stands in for the top landing page." },
          business: { summary: "Visitors to your busiest page don't bounce back any more than elsewhere on the store.", detail: "People who arrive there find what they came for at least as often as on your other pages." },
          protect: "Compare this page's quick-backs in Clarity after changing its first screen or the ads that point to it.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Clarity counts a quick-back when a visitor opens a page and goes straight back to the one before. On {url}, {quickbacksPage}% of {sessions} sessions had one, against {quickbacksSite}% site-wide. Clarity's most-visited page stands in for the top landing page." },
          business: { summary: "Visitors to your busiest page turn back more often than on the rest of the store.", detail: "A quick turn back usually means the first screen didn't match what the visitor expected. If this is where ads land, part of that paid traffic leaves before it can buy." },
          step: "Open this page on a phone next to the ads that point to it. Make the first screen show the product and offer from the ad, and if an ad sells one product, land it on that product page.",
          doneWhen: "In the next Clarity snapshot, with 100 or more sessions on the most-visited page, its quick-back share is at or below the site-wide share.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Visitors to the busiest page in your store go back more often than on your other pages.", detail: "They usually turn back when the first thing they see isn't what they expected. If your ads send people here, you pay for visitors who leave in seconds." } },
      },
      media_buyer: {
        fail: { business: { summary: "The top landing page gets more quick-backs than the rest of the site, so paid clicks bounce before they can convert.", detail: "CVR reads low and CAC high because of the page, so the targeting may be fine. Forward to the store owner: match the first screen to the ad, or land single-product ads on that product." } },
      },
      agency: {
        pass: { business: { summary: "Visitors to the store's busiest page don't bounce back any more than elsewhere on the store.", detail: "People who arrive there find what they came for at least as often as on the other pages." } },
        fail: { business: { summary: "Visitors to the store's busiest page turn back more often than on the rest of the store.", detail: "A quick turn back usually means the first screen didn't match what the visitor expected. If this is where ads land, part of that paid traffic leaves before it can buy." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "نسبة العودة السريعة في الصفحة الأكثر زيارة عند متوسط الموقع أو أقل في Clarity.", detail: "في {url}، {quickbacksPage}% من {sessions} جلسة فيها عودة سريعة، مقابل {quickbacksSite}% في الموقع كله. لا يوفر Clarity تقرير صفحات هبوط، فالصفحة الأكثر زيارة تحل محل صفحة الهبوط الأولى." },
          business: { summary: "زوار أكثر صفحة زيارة لا يعودون للخلف أكثر من بقية المتجر.", detail: "من يصل إليها يجد ما جاء من أجله بقدر بقية الصفحات على الأقل." },
          protect: "قارن العودة السريعة لهذه الصفحة في Clarity بعد تغيير شاشتها الأولى أو الإعلانات التي تشير إليها.",
        },
        fail: {
          technical: { summary: "نسبة العودة السريعة في الصفحة الأكثر زيارة أعلى من متوسط الموقع في Clarity.", detail: "يحسب Clarity عودة سريعة حين يفتح الزائر صفحة ويرجع فورًا إلى السابقة. في {url}، {quickbacksPage}% من {sessions} جلسة فيها عودة سريعة، مقابل {quickbacksSite}% في الموقع كله. الصفحة الأكثر زيارة في Clarity تحل محل صفحة الهبوط الأولى." },
          business: { summary: "زوار أكثر صفحة زيارة يعودون للخلف أكثر من بقية المتجر.", detail: "العودة السريعة تعني غالبًا أن الشاشة الأولى لم تطابق ما توقعه الزائر. وإذا كانت الإعلانات تهبط هنا، فجزء من الزيارات المدفوعة يغادر قبل أن يشتري." },
          step: "افتح هذه الصفحة على الجوال بجانب الإعلانات التي تشير إليها. اجعل الشاشة الأولى تعرض المنتج والعرض نفسه الذي في الإعلان، وإذا كان الإعلان لمنتج واحد فاجعله يهبط على صفحة ذلك المنتج.",
          doneWhen: "في لقطة Clarity التالية، ومع 100 جلسة أو أكثر على الصفحة الأكثر زيارة، تكون نسبة العودة السريعة فيها عند متوسط الموقع أو أقل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زوار أكثر صفحة تنزار في متجرك يرجعون للخلف أكثر من باقي الصفحات.", detail: "غالبًا يرجعون لأن أول شي شافوه مو اللي توقعوه. وإذا إعلاناتك ترسل الناس هنا، أنت تدفع على زوار يطلعون خلال ثواني." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة الهبوط الأولى عليها quick-backs أكتر من باقي الموقع، فالكليكات المدفوعة بترجع قبل ما تتحوّل.", detail: "الـ CVR باين واطي والـ CAC عالي بسبب الصفحة، فممكن الـ targeting يكون سليم. ابعت لصاحب المتجر: الشاشة الأولى لازم تطابق الإعلان، وإعلانات المنتج الواحد تهبط على صفحة المنتج ده." } },
      },
      agency: {
        fail: { business: { summary: "زوار أكثر صفحة زيارة في المتجر يعودون للخلف أكثر من بقية الصفحات.", detail: "العودة السريعة تعني غالبًا أن الشاشة الأولى لم تطابق ما توقعه الزائر، وإذا كانت الإعلانات تهبط هنا فجزء من الزيارات المدفوعة يغادر قبل أن يشتري." } },
      },
    },
  },

  // probes.ts land06: text 60%+ Arabic needs lang=ar and dir=rtl; text 10% Arabic or less needs a non-Arabic lang
  // and no dir=rtl, plus a language switch or an Arabic hreflang to pass. GA4 Arabic sessions aren't checked.
  "LAND-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On {url}, {arabicShare}% of the visible text is Arabic, and the html lang and dir match it. Whether Arabic-language GA4 sessions land on Arabic pages isn't checked yet." },
          business: { summary: "Your landing page is set up in the language it is written in.", detail: "Browsers, translation tools and screen layout all read the page the right way, and English pages offer an Arabic version." },
          protect: "When adding a new landing page or language, check its lang and dir before pointing ads at it.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On {url}, {arabicShare}% of the visible text is Arabic. Text 60% Arabic or more needs lang=\"ar\" and dir=\"rtl\"; text 10% Arabic or less needs a non-Arabic lang and no dir=\"rtl\"." },
          business: { summary: "The landing page is marked as the wrong language for its text.", detail: "Browsers may then offer to translate it, lay it out in the wrong direction or show the wrong font. A shopper from an ad who sees a broken page in their language often leaves." },
          step: "The developer sets the page's html lang and dir to match its text: lang=\"ar\" and dir=\"rtl\" on Arabic pages, an English lang and no dir=\"rtl\" on English pages. Point Arabic ads at the Arabic URLs.",
          doneWhen: "Our visit finds the landing page's lang and dir matching its text: lang=\"ar\" and dir=\"rtl\" on Arabic text, or a non-Arabic lang and no dir=\"rtl\" on English text with a language switch or an Arabic hreflang link.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The page your ads land on is marked as the wrong language for what it says.", detail: "The browser may then offer to translate it or show it the wrong way round. A shopper who sees a broken page in their own language often leaves your store." } },
      },
      media_buyer: {
        fail: { business: { summary: "The landing page's language settings don't match its text, so shoppers from an Arabic or English ad may land on a broken-looking page.", detail: "An ad that wins the shopper loses them on a page that reads wrong: CVR likely drops and CPA rises. Point Arabic ads at Arabic URLs and ask the store's developer to fix lang and dir." } },
      },
      agency: {
        pass: { business: { summary: "The store's landing page is set up in the language it is written in.", detail: "Browsers, translation tools and screen layout all read the page the right way, and English pages offer an Arabic version." } },
        fail: { business: { summary: "The store's landing page is marked as the wrong language for its text.", detail: "Browsers may then offer to translate it, lay it out in the wrong direction or show the wrong font. A shopper from an ad who sees a broken page in their language often leaves." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "إعدادات lang و dir في صفحة الهبوط تطابق لغة نصها.", detail: "في {url}، {arabicShare}% من النص الظاهر عربي، وقيمتا lang و dir في html تطابقانه. لم نفحص بعد هبوط جلسات GA4 العربية على صفحات عربية." },
          business: { summary: "صفحة الهبوط مضبوطة على اللغة المكتوبة بها.", detail: "المتصفحات وأدوات الترجمة واتجاه الصفحة تقرأها بشكل صحيح، والصفحات الإنجليزية تعرض نسخة عربية." },
          protect: "عند إضافة صفحة هبوط أو لغة جديدة، تحقق من lang و dir قبل توجيه الإعلانات إليها.",
        },
        fail: {
          technical: { summary: "إعدادات lang أو dir في صفحة الهبوط لا تطابق لغة نصها.", detail: "في {url}، {arabicShare}% من النص الظاهر عربي. النص العربي بنسبة 60% أو أكثر يحتاج lang=\"ar\" و dir=\"rtl\"، والنص العربي بنسبة 10% أو أقل يحتاج lang غير عربية وبدون dir=\"rtl\"." },
          business: { summary: "صفحة الهبوط معرّفة بلغة لا تطابق نصها.", detail: "قد يعرض المتصفح ترجمتها أو يعرضها باتجاه خاطئ أو بخط خاطئ. والعميل القادم من إعلان حين يرى صفحة مكسورة بلغته غالبًا يغادر." },
          step: "يضبط المطوّر lang و dir في html لتطابق نص الصفحة: lang=\"ar\" و dir=\"rtl\" في الصفحات العربية، و lang إنجليزية بدون dir=\"rtl\" في الصفحات الإنجليزية. وجّه الإعلانات العربية إلى الروابط العربية.",
          doneWhen: "تجد زيارتنا lang و dir في صفحة الهبوط مطابقتين لنصها: lang=\"ar\" و dir=\"rtl\" للنص العربي، أو lang غير عربية بدون dir=\"rtl\" للنص الإنجليزي مع زر تغيير لغة أو رابط hreflang عربي.",
        },
      },
      store_owner: {
        fail: { business: { summary: "الصفحة اللي تهبط عليها إعلاناتك معرّفة بلغة غير لغة كلامها.", detail: "المتصفح ممكن يعرض ترجمتها أو يقلب اتجاهها غلط. والعميل اللي يشوف صفحة مكسورة بلغته غالبًا يطلع من متجرك." } },
      },
      media_buyer: {
        fail: { business: { summary: "إعدادات لغة صفحة الهبوط مش مطابقة للنص، فالعميل الجاي من إعلان عربي أو إنجليزي ممكن يلاقي صفحة شكلها مكسور.", detail: "الإعلان اللي كسب العميل بيخسره على صفحة بتتقري غلط: الـ CVR غالبًا بيقل والـ CPA بيعلى. وجّه الإعلانات العربية للروابط العربية واطلب من مطوّر المتجر يصلّح lang و dir." } },
      },
      agency: {
        fail: { business: { summary: "صفحة الهبوط في المتجر معرّفة بلغة لا تطابق نصها.", detail: "قد يعرض المتصفح ترجمتها أو يعرضها باتجاه خاطئ أو بخط خاطئ، والعميل القادم من إعلان حين يرى صفحة مكسورة بلغته غالبًا يغادر." } },
      },
    },
  },
};
