import type { PointTemplate } from "./types.js";

// RISK-02 hands over {pages} (a count) on a pass and different keys on each
// fail path. RISK-06 always hands over headerControls, optionCount,
// quantityControls, ctaWidth and span. RISK-07 hands over {pages} (the
// failing page/width list) on a fail and nothing on a pass. RISK-12 always
// hands over {fields} and {pages}.
export const RISK: Record<string, PointTemplate> = {
  "RISK-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "All {pages} loaded pages, checkout included, are on https, and no image, script or stylesheet was requested over plain http." },
          business: { summary: "Every page of your store, checkout included, loads on a secure connection.", detail: "Browsers show the padlock, with no not-secure warning at payment." },
          protect: "Use https links for every new image, app script and embed added to the theme.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "A page loads on plain http, or an https page requests files such as images, scripts or styles over http. Browsers block http scripts on https pages and can show a not-secure warning for mixed content." },
          business: { summary: "Part of your store doesn't load on a secure connection.", detail: "Browsers can mark the page not secure or block parts of it. Shoppers who see the warning near checkout often won't enter card details." },
          step: "Ask your developer to redirect every http address to https, and change http links to images and scripts in the theme and apps to https.",
          doneWhen: "Every page, checkout included, loads on https, and no file is requested over plain http.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Part of your store isn't on a secure connection.", detail: "Customers can see a not-secure warning in the browser. Many won't pay on a page that looks unsafe." } },
      },
      media_buyer: {
        fail: { business: { summary: "Some pages or files load over plain http, so paid clicks can hit a not-secure warning and CPA rises.", detail: "Shoppers who see a browser warning after the ad click rarely continue. Those clicks are spend with no chance to convert. The developer fixes it in the theme and redirects." } },
      },
      agency: {
        pass: { business: { summary: "Every page of the store, checkout included, loads on a secure connection.", detail: "Browsers show the padlock, with no not-secure warning at payment." } },
        fail: { business: { summary: "Part of the store doesn't load on a secure connection.", detail: "Browsers can mark the page not secure or block parts of it. Shoppers who see the warning near checkout often won't enter card details." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل الصفحات، ومنها الدفع، تعمل على https دون أي طلب http.", detail: "كل الصفحات المحمّلة ({pages})، ومنها الدفع، على https، ولم تُطلب أي صورة أو سكربت أو ملف تنسيق عبر http." },
          business: { summary: "كل صفحات المتجر، ومنها الدفع، تعمل على اتصال آمن.", detail: "المتصفح يعرض القفل، دون تحذير «غير آمن» عند الدفع." },
          protect: "استخدم روابط https لكل صورة أو سكربت تطبيق أو تضمين جديد يُضاف إلى القالب.",
        },
        fail: {
          technical: { summary: "صفحة تعمل على http، أو صفحة https تطلب ملفات عبر http.", detail: "صفحة تُحمَّل على http عادي، أو صفحة https تطلب ملفات مثل الصور أو السكربتات أو التنسيقات عبر http. المتصفحات تحجب سكربتات http في صفحات https وقد تعرض تحذير «غير آمن» للمحتوى المختلط." },
          business: { summary: "جزء من المتجر لا يعمل على اتصال آمن.", detail: "قد يصف المتصفح الصفحة بأنها غير آمنة أو يحجب أجزاء منها. ومن يرى التحذير قرب الدفع غالبًا لا يُدخل بيانات بطاقته." },
          step: "اطلب من المطوّر تحويل كل عنوان http إلى https، وتغيير روابط http للصور والسكربتات في القالب والتطبيقات إلى https.",
          doneWhen: "كل صفحة، ومنها الدفع، تعمل على https، ولا يُطلب أي ملف عبر http.",
        },
      },
      store_owner: {
        fail: { business: { summary: "جزء من متجرك مو على اتصال آمن.", detail: "العميل ممكن يشوف تحذير «غير آمن» في المتصفح. وكثير ما يدفعون في صفحة شكلها مو آمن." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحات أو ملفات بتحمّل على http عادي، فالكليك المدفوع ممكن يقابل تحذير «غير آمن» والـ CPA بيعلى.", detail: "اللي بيشوف تحذير المتصفح بعد الكليك نادرًا ما بيكمّل. الكليكات دي فلوس مدفوعة من غير أي فرصة تحويل. التصليح عند المطوّر في القالب والـ redirects." } },
      },
      agency: {
        fail: { business: { summary: "جزء من «المتجر» لا يعمل على اتصال آمن.", detail: "قد يصف المتصفح الصفحة بأنها غير آمنة أو يحجب أجزاء منها. ومن يرى التحذير قرب الدفع غالبًا لا يُدخل بيانات بطاقته." } },
      },
    },
  },
  "RISK-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "{headerControls} home header control(s), the buy button, {quantityControls} quantity control(s) and {optionCount} option button(s) are all at least 44x44px, and the buy button spans {span}px of the 390px screen." },
          business: { summary: "Your main buttons are big enough to tap easily on a phone.", detail: "Menu, cart, options and Add to cart are thumb-sized, and the buy button runs close to full width." },
          protect: "Test new buttons and option styles on a phone before they go live.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Checked on a 390px phone: {headerControls} home header control(s) (menu, cart, search), the Add to cart button ({ctaWidth}px wide), {quantityControls} quantity control(s), {optionCount} option button(s) and the cart page's checkout button. Each must be at least 44x44px, option buttons at least 8px apart, and the buy button with its quantity selector at least 80% of the screen wide. It spans {span}px." },
          business: { summary: "Some buttons on your store are too small or too close together for a thumb.", detail: "Shoppers miss the button they mean, hit the wrong option, or have to zoom. Each missed tap is a chance to give up before checkout." },
          step: "Ask your developer to make the buttons listed at least 44x44px on phones, space option buttons at least 8px apart, and stretch Add to cart close to full width.",
          doneWhen: "On a 390px phone, the header icons, Add to cart, quantity, option and checkout buttons are all at least 44x44px, option buttons are at least 8px apart, and the buy button spans at least 80% of the screen.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some buttons on your store are too small to tap easily on a phone.", detail: "Customers miss the button or pick the wrong size or colour. Some give up before they reach checkout." } },
      },
      media_buyer: {
        fail: { business: { summary: "Buttons are too small or cramped on phones, so mis-taps cut CVR on mobile paid traffic.", detail: "Paid visitors who miss Add to cart or the right option often give up. CPA rises on the same spend. The developer fixes the button sizes on the store." } },
      },
      agency: {
        pass: { business: { summary: "The store's main buttons are big enough to tap easily on a phone.", detail: "Menu, cart, options and Add to cart are thumb-sized, and the buy button runs close to full width." } },
        fail: { business: { summary: "Some buttons on the store are too small or too close together for a thumb.", detail: "Shoppers miss the button they mean, hit the wrong option, or have to zoom. Each missed tap is a chance to give up before checkout." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "أزرار الهيدر والشراء والكمية والخيارات كلها 44x44px أو أكبر، وزر الشراء قريب من عرض الشاشة.", detail: "{headerControls} من أزرار هيدر الرئيسية، وزر الشراء، و{quantityControls} من أزرار الكمية، و{optionCount} من أزرار الخيارات كلها 44x44px على الأقل، وزر الشراء بعرض {span}px من شاشة 390px." },
          business: { summary: "الأزرار الرئيسية كبيرة بما يكفي للضغط بسهولة على الجوال.", detail: "القائمة والسلة والخيارات وزر الإضافة للسلة بحجم الإصبع، وزر الشراء قريب من عرض الشاشة كاملًا." },
          protect: "جرّب أي زر أو شكل خيارات جديد على الجوال قبل نشره.",
        },
        fail: {
          technical: { summary: "بعض الأزرار الأساسية أصغر من 44x44px، أو متلاصقة، أو زر الشراء أضيق من 80% من الشاشة.", detail: "الفحص على جوال بعرض 390px: {headerControls} من أزرار هيدر الرئيسية (القائمة، السلة، البحث)، وزر الإضافة للسلة (بعرض {ctaWidth}px)، و{quantityControls} من أزرار الكمية، و{optionCount} من أزرار الخيارات، وزر الدفع في صفحة السلة. يجب أن يكون كل منها 44x44px على الأقل، والمسافة بين أزرار الخيارات 8px على الأقل، وزر الشراء مع الكمية بعرض 80% من الشاشة على الأقل. عرضه الحالي {span}px." },
          business: { summary: "بعض الأزرار صغيرة جدًا أو متقاربة جدًا للضغط بالإصبع.", detail: "يخطئ العميل الزر الذي يقصده، أو يختار خيارًا خاطئًا، أو يضطر للتكبير. وكل ضغطة خاطئة فرصة للتخلي قبل الدفع." },
          step: "اطلب من المطوّر تكبير الأزرار المذكورة إلى 44x44px على الأقل على الجوال، وترك 8px على الأقل بين أزرار الخيارات، وتوسيع زر الإضافة للسلة إلى قرب عرض الشاشة.",
          doneWhen: "على جوال بعرض 390px: أزرار الهيدر والإضافة للسلة والكمية والخيارات والدفع كلها 44x44px على الأقل، وبين أزرار الخيارات 8px على الأقل، وزر الشراء بعرض 80% من الشاشة على الأقل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض أزرار متجرك صغيرة وصعب تنضغط على الجوال.", detail: "العميل يضغط غلط أو يختار مقاس أو لون غلط. وبعضهم يتركها قبل ما يوصل للدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الأزرار صغيرة أو لازقة في بعض على الموبايل، فالدوس الغلط بيقلّل الـ CVR على الترافيك المدفوع.", detail: "الزائر المدفوع اللي بيغلط في Add to cart أو في الاختيار الصح غالبًا بيسيب. والـ CPA بيعلى على نفس الصرف. المطوّر يصلّح مقاسات الأزرار في المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض أزرار «المتجر» صغيرة جدًا أو متقاربة جدًا للضغط بالإصبع.", detail: "يخطئ العميل الزر الذي يقصده، أو يختار خيارًا خاطئًا، أو يضطر للتكبير. وكل ضغطة خاطئة فرصة للتخلي قبل الدفع." } },
      },
    },
  },
  "RISK-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Page width stays within the screen on home, collection, product and cart at 390px and at 360px." },
          business: { summary: "Your pages fit the phone screen, even on smaller phones.", detail: "Shoppers scroll straight down without the page sliding sideways." },
          protect: "Check new banners, tables and app widgets on a small phone before publishing them.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Pages wider than the screen: {pages}. The usual cause is a fixed-width image, table, banner or app widget, or an element pushed past the edge by a margin." },
          business: { summary: "Some of your pages slide sideways on a phone.", detail: "The page wobbles when shoppers scroll, and parts of it sit off screen. It looks broken, and some buyers leave on the way to the cart." },
          step: "Ask your developer to find the element wider than the screen on each page listed and make it fit the phone width.",
          doneWhen: "Home, collection, product and cart scroll only up and down at 390px and 360px wide.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some of your store pages slide sideways on a phone.", detail: "The page wobbles as customers scroll, and part of it hides off the screen. It looks broken, and some leave before the cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "Pages scroll sideways on phones, which can hold mobile CVR down and push CPA up on paid traffic.", detail: "Most paid social clicks come from phones. A page that slides around looks broken right after the click. The developer fixes the overflowing element." } },
      },
      agency: {
        pass: { business: { summary: "The store's pages fit the phone screen, even on smaller phones.", detail: "Shoppers scroll straight down without the page sliding sideways." } },
        fail: { business: { summary: "Some of the store's pages slide sideways on a phone.", detail: "The page wobbles when shoppers scroll, and parts of it sit off screen. It looks broken, and some buyers leave on the way to the cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا تتحرك أي من الرئيسية أو التصنيف أو المنتج أو السلة أفقيًا على عرض 390px و360px.", detail: "عرض الصفحة لا يتجاوز الشاشة في الرئيسية والتصنيف والمنتج والسلة على 390px وعلى 360px." },
          business: { summary: "الصفحات تناسب شاشة الجوال، حتى على الجوالات الأصغر.", detail: "العميل ينزل في الصفحة مباشرة دون أن تنزلق جانبيًا." },
          protect: "جرّب البانرات والجداول وأدوات التطبيقات الجديدة على جوال صغير قبل نشرها.",
        },
        fail: {
          technical: { summary: "بعض الصفحات أعرض من الشاشة وتتحرك أفقيًا على الجوال.", detail: "الصفحات الأعرض من الشاشة: {pages}. السبب المعتاد صورة أو جدول أو بانر أو أداة تطبيق بعرض ثابت، أو عنصر يدفعه هامش خارج حافة الشاشة." },
          business: { summary: "بعض الصفحات تنزلق جانبيًا على الجوال.", detail: "الصفحة تهتز عند التمرير، وأجزاء منها خارج الشاشة. تبدو معطّلة، وبعض المشترين يغادرون في الطريق إلى السلة." },
          step: "اطلب من المطوّر إيجاد العنصر الأعرض من الشاشة في كل صفحة مذكورة وضبطه على عرض الجوال.",
          doneWhen: "الرئيسية والتصنيف والمنتج والسلة تتحرك للأعلى والأسفل فقط على عرض 390px و360px.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض صفحات متجرك تتحرك يمين ويسار على الجوال.", detail: "الصفحة تهتز والعميل ينزل فيها، وجزء منها يختفي برا الشاشة. شكلها خربان، وبعضهم يطلع قبل السلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحات بتتحرك بالعرض على الموبايل، وده ممكن يشد الـ CVR على الموبايل لتحت ويعلّي الـ CPA على الترافيك المدفوع.", detail: "أغلب كليكات الـ paid social من الموبايل. والصفحة اللي بتتزحلق بتبان بايظة بعد الكليك على طول. المطوّر يصلّح العنصر اللي خارج عن الشاشة." } },
      },
      agency: {
        fail: { business: { summary: "بعض صفحات «المتجر» تنزلق جانبيًا على الجوال.", detail: "الصفحة تهتز عند التمرير، وأجزاء منها خارج الشاشة. تبدو معطّلة، وبعض المشترين يغادرون في الطريق إلى السلة." } },
      },
    },
  },
  "RISK-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "All {fields} form fields read on the {pages} page(s), checkout included, use 16px text or more, and phone and email fields open the right keyboard." },
          business: { summary: "Form fields on your store are easy to fill on a phone.", detail: "The page doesn't zoom when shoppers tap a field, and phone and email fields open the right keyboard." },
          protect: "Keep field text at 16px or more when changing checkout or form styles.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Read {fields} form fields on the {pages} page(s). Text under 16px makes iPhone Safari zoom in on tap. Phone fields need type=tel or inputmode tel or numeric, and email fields type=email or inputmode email." },
          business: { summary: "Some form fields make the phone zoom in or show the wrong keyboard.", detail: "The page jumps in when shoppers tap a field, and they have to zoom back out. Typing a phone number on a letter keyboard is slower. Both add effort right at checkout." },
          step: "Ask your developer to set form field text to at least 16px on phones, use type=tel for phone fields and type=email for email fields.",
          doneWhen: "Every form field read uses 16px text or more, phone fields use type=tel or inputmode tel or numeric, and email fields use type=email or inputmode email.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some form fields on your store zoom in or show the wrong keyboard on a phone.", detail: "Customers tap a field and the page zooms in. Typing a phone number on a letter keyboard takes longer. Both slow them down at checkout." } },
      },
      media_buyer: {
        fail: { business: { summary: "Form fields zoom or open the wrong keyboard on phones, which adds effort at checkout and lowers CVR on paid traffic.", detail: "Paid visitors reach checkout and then fight the form. Some give up, and CPA rises on the same spend. The developer fixes it in the form styles." } },
      },
      agency: {
        pass: { business: { summary: "Form fields on the store are easy to fill on a phone.", detail: "The page doesn't zoom when shoppers tap a field, and phone and email fields open the right keyboard." } },
        fail: { business: { summary: "Some of the store's form fields make the phone zoom in or show the wrong keyboard.", detail: "The page jumps in when shoppers tap a field, and they have to zoom back out. Typing a phone number on a letter keyboard is slower. Both add effort right at checkout." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "حقول النماذج بخط 16px أو أكبر، وحقول الهاتف والبريد تفتح لوحة المفاتيح الصحيحة.", detail: "كل الحقول المقروءة ({fields}) في صفحات {pages}، ومنها الدفع، بخط 16px أو أكبر، وحقول الهاتف والبريد تفتح لوحة المفاتيح المناسبة." },
          business: { summary: "حقول النماذج سهلة التعبئة على الجوال.", detail: "الصفحة لا تتكبر عند الضغط على حقل، وحقول الهاتف والبريد تفتح لوحة المفاتيح المناسبة." },
          protect: "أبقِ خط الحقول 16px أو أكبر عند تغيير تنسيق الدفع أو النماذج.",
        },
        fail: {
          technical: { summary: "بعض حقول النماذج بخط أصغر من 16px، أو حقل هاتف أو بريد يفتح لوحة مفاتيح خاطئة.", detail: "قرأنا {fields} حقلًا في صفحات {pages}. الخط الأصغر من 16px يجعل Safari على iPhone يكبّر الصفحة عند الضغط. حقول الهاتف تحتاج type=tel أو inputmode بقيمة tel أو numeric، وحقول البريد تحتاج type=email أو inputmode بقيمة email." },
          business: { summary: "بعض حقول النماذج تكبّر الصفحة أو تفتح لوحة مفاتيح خاطئة على الجوال.", detail: "تتكبر الصفحة عند الضغط على حقل، فيضطر العميل لتصغيرها. وكتابة رقم الهاتف على لوحة حروف أبطأ. وكلاهما يضيف جهدًا عند الدفع." },
          step: "اطلب من المطوّر ضبط خط الحقول على 16px على الأقل في الجوال، واستخدام type=tel لحقول الهاتف وtype=email لحقول البريد.",
          doneWhen: "كل حقل مقروء بخط 16px أو أكبر، وحقول الهاتف تستخدم type=tel أو inputmode بقيمة tel أو numeric، وحقول البريد تستخدم type=email أو inputmode بقيمة email.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض الحقول في متجرك تكبّر الصفحة أو تفتح كيبورد غلط على الجوال.", detail: "العميل يضغط على الحقل والصفحة تتكبر. وكتابة رقم الجوال على كيبورد حروف تاخذ وقت أطول. وهذا كله يبطّئه عند الدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الحقول بتعمل zoom أو بتفتح كيبورد غلط على الموبايل، وده بيزوّد المجهود في الـ checkout ويقلّل الـ CVR على الترافيك المدفوع.", detail: "الزائر المدفوع بيوصل للـ checkout وبعدين يتخانق مع الفورم. بعضهم بيسيب، والـ CPA بيعلى على نفس الصرف. المطوّر يصلّحها في تنسيق الفورم." } },
      },
      agency: {
        fail: { business: { summary: "بعض حقول النماذج في «المتجر» تكبّر الصفحة أو تفتح لوحة مفاتيح خاطئة على الجوال.", detail: "تتكبر الصفحة عند الضغط على حقل، فيضطر العميل لتصغيرها. وكتابة رقم الهاتف على لوحة حروف أبطأ. وكلاهما يضيف جهدًا عند الدفع." } },
      },
    },
  },
};
