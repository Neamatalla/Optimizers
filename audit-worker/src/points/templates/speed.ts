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
  // SPEED-02 and SPEED-03 hand over one fact per page PageSpeed measured
  // (home, collection, product), so a page may be missing: no slots here.
  "SPEED-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Cumulative Layout Shift from Google PageSpeed Insights, phone run with throttling, on the home, collection and product pages. Good is under 0.1." },
          business: { summary: "Your pages stay still while they load on a phone.", detail: "Buttons stay where shoppers expect them, so a tap lands on what they meant." },
          protect: "Set a width and height on new images and banners, and test any new app on a phone before it goes live.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Cumulative Layout Shift from Google PageSpeed Insights, phone run with throttling, on the home, collection and product pages. Good is under 0.1. The usual causes are images without set sizes, banners and app widgets that push content down after it shows, and late fonts." },
          business: { summary: "Your pages jump around while they load on a phone.", detail: "Content moves as images, banners and app widgets load. Shoppers tap the wrong thing or lose their place, and some leave." },
          step: "Ask your developer to set a width and height on images, reserve space for banners and app widgets, and load fonts so text doesn't reflow.",
          doneWhen: "PageSpeed Insights shows CLS under 0.1 on the phone run for home, collection and product.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store pages jump while they load on a phone.", detail: "A customer taps a button, the page moves, and they hit something else. It feels broken, and some leave before buying." } },
      },
      media_buyer: {
        fail: { business: { summary: "The page jumps while it loads on phones, so CVR on paid clicks is lower than the traffic deserves.", detail: "Paid visitors mis-tap or lose the product as banners and widgets push content around. CPA rises on the same spend. The developer fixes it on the store side." } },
      },
      agency: {
        pass: { business: { summary: "The store's pages stay still while they load on a phone.", detail: "Buttons stay where shoppers expect them, so a tap lands on what they meant." } },
        fail: { business: { summary: "The store's pages jump around while they load on a phone.", detail: "Content moves as images, banners and app widgets load. Shoppers tap the wrong thing or lose their place, and some leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "الصفحات لا تتحرك أثناء التحميل على الجوال (CLS أقل من 0.1).", detail: "من Google PageSpeed Insights، تشغيل الجوال مع إبطاء الشبكة، على الصفحة الرئيسية وصفحة التصنيف وصفحة المنتج." },
          business: { summary: "الصفحات ثابتة أثناء تحميلها على الجوال.", detail: "الأزرار تبقى في مكانها، فيضغط العميل على ما يقصده." },
          protect: "حدد العرض والارتفاع لكل صورة وبانر جديد، وجرّب أي تطبيق جديد على الجوال قبل تفعيله.",
        },
        fail: {
          technical: { summary: "الصفحات تتحرك أثناء التحميل على الجوال (CLS بقيمة 0.1 أو أكثر).", detail: "من Google PageSpeed Insights، تشغيل الجوال مع إبطاء الشبكة، على الرئيسية والتصنيف والمنتج. الأسباب المعتادة: صور بلا أبعاد محددة، وبانرات وأدوات تطبيقات تدفع المحتوى للأسفل بعد ظهوره، وخطوط تتأخر في التحميل." },
          business: { summary: "الصفحات تقفز أثناء تحميلها على الجوال.", detail: "المحتوى يتحرك مع تحميل الصور والبانرات وأدوات التطبيقات. فيضغط العميل على الشيء الخطأ أو يفقد مكانه، وبعضهم يغادر." },
          step: "اطلب من المطوّر تحديد العرض والارتفاع للصور، وحجز مساحة للبانرات وأدوات التطبيقات، وتحميل الخطوط بطريقة لا تحرّك النص.",
          doneWhen: "يظهر CLS أقل من 0.1 في PageSpeed Insights لتشغيل الجوال في الرئيسية والتصنيف والمنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات متجرك تتحرك وهي تحمّل على الجوال.", detail: "العميل يضغط على زر، والصفحة تتحرك، فيضغط على شي ثاني. يحس إن المتجر خربان، وبعضهم يطلع قبل ما يشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "الصفحة بتتنطط وهي بتحمّل على الموبايل، فالـ CVR على الكليكات المدفوعة أقل من اللي الترافيك يستاهله.", detail: "الزائر المدفوع بيدوس غلط أو بيتوه عن المنتج لما البانرات والـ widgets تزق المحتوى. فالـ CPA بيعلى على نفس الصرف. التصليح عند المطوّر في المتجر." } },
      },
      agency: {
        fail: { business: { summary: "صفحات «المتجر» تقفز أثناء تحميلها على الجوال.", detail: "المحتوى يتحرك مع تحميل الصور والبانرات وأدوات التطبيقات. فيضغط العميل على الشيء الخطأ أو يفقد مكانه، وبعضهم يغادر." } },
      },
    },
  },
  "SPEED-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Total Blocking Time from Google PageSpeed Insights, phone run with throttling, on the home and product pages. Good is under 200 ms." },
          business: { summary: "Taps get a quick response on a phone.", detail: "Buttons react when shoppers press them, even while the page is still loading." },
          protect: "Re-run PageSpeed Insights on a phone after adding any new app or tracking tag.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Total Blocking Time from Google PageSpeed Insights, phone run with throttling, on the home and product pages. Good is under 200 ms. Long JavaScript tasks, often from apps, chat widgets and tracking tags, keep the phone busy, so taps wait." },
          business: { summary: "On a phone, your pages are slow to react to taps while they load.", detail: "Shoppers press a button and nothing happens for a moment. Many tap again or think the store is broken, and some leave." },
          step: "Ask your developer to remove unused apps and delay chat widgets and other non-essential scripts until the page is usable.",
          doneWhen: "PageSpeed Insights shows Total Blocking Time under 200 ms on the phone run for home and product.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Buttons on your store react late on a phone.", detail: "A customer taps Add to cart and nothing happens for a moment. They think the store is broken, and some leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "Taps lag on phones while the page loads, so CVR drops on clicks you already paid for.", detail: "Paid visitors tap Add to cart, get no response, and give up. CPA rises on the same spend. The fix is in the store's scripts: forward it to the developer." } },
      },
      agency: {
        fail: { business: { summary: "On a phone, the store's pages are slow to react to taps while they load.", detail: "Shoppers press a button and nothing happens for a moment. Many tap again or think the store is broken, and some leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "الصفحات تستجيب للضغط دون تأخير على الجوال (TBT أقل من 200 ms).", detail: "من Google PageSpeed Insights، تشغيل الجوال مع إبطاء الشبكة، على الصفحة الرئيسية وصفحة المنتج." },
          business: { summary: "الضغطات تلقى استجابة سريعة على الجوال.", detail: "الأزرار تستجيب عند الضغط عليها، حتى أثناء تحميل الصفحة." },
          protect: "أعد فحص PageSpeed Insights على الجوال بعد إضافة أي تطبيق أو وسم تتبع جديد.",
        },
        fail: {
          technical: { summary: "الصفحات تتأخر في الاستجابة للضغط على الجوال (TBT بقيمة 200 ms أو أكثر).", detail: "من Google PageSpeed Insights، تشغيل الجوال مع إبطاء الشبكة، على الرئيسية والمنتج. مهام JavaScript الطويلة، غالبًا من التطبيقات وأدوات الدردشة ووسوم التتبع، تشغل الجوال فتنتظر الضغطات." },
          business: { summary: "الصفحات بطيئة في الاستجابة للضغط أثناء تحميلها على الجوال.", detail: "يضغط العميل على زر فلا يحدث شيء للحظة. كثيرون يضغطون مرة أخرى أو يظنون أن المتجر معطّل، وبعضهم يغادر." },
          step: "اطلب من المطوّر حذف التطبيقات غير المستخدمة، وتأخير أدوات الدردشة والسكربتات غير الأساسية حتى تصبح الصفحة قابلة للاستخدام.",
          doneWhen: "يظهر Total Blocking Time أقل من 200 ms في PageSpeed Insights لتشغيل الجوال في الرئيسية والمنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أزرار متجرك تتأخر في الاستجابة على الجوال.", detail: "العميل يضغط أضف للسلة وما يصير شي للحظة. يحس إن المتجر خربان، وبعضهم يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الضغطات بتهنّج على الموبايل وهي الصفحة بتحمّل، فالـ CVR بينزل على كليكات إنت دفعت تمنها.", detail: "الزائر المدفوع بيدوس Add to cart ومفيش رد، فبيسيب. والـ CPA بيعلى على نفس الصرف. التصليح في سكربتات المتجر، ابعته للمطوّر." } },
      },
      agency: {
        fail: { business: { summary: "صفحات «المتجر» بطيئة في الاستجابة للضغط أثناء تحميلها على الجوال.", detail: "يضغط العميل على زر فلا يحدث شيء للحظة. كثيرون يضغطون مرة أخرى أو يظنون أن «المتجر» معطّل، وبعضهم يغادر." } },
      },
    },
  },
  // SPEED-05 always hands over images, good, unknown, bad, belowFold and lazy.
  "SPEED-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "{good} of {images} content images are up to 2x their display width and WebP or AVIF, and {lazy} of {belowFold} images below the first screen use loading=lazy." },
          business: { summary: "Your images are sized and compressed for phones.", detail: "Photos download quickly on mobile data, and images further down wait until the shopper scrolls." },
          protect: "Upload new photos as WebP, at no more than twice the size they show at.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Of {images} content images: {good} are up to 2x their display width and WebP or AVIF, {bad} are too large or a plain JPG or PNG, and {unknown} couldn't be judged. {lazy} of {belowFold} images below the first screen use loading=lazy. It fails when under 90% can be right-sized and modern, or under 90% of those below the first screen are lazy." },
          business: { summary: "Your photos and banners are heavier than they need to be.", detail: "Large or old-format images take longer to download on mobile data. Pages show later, and some shoppers leave before the photos appear." },
          step: "Ask your developer to resize images to no more than twice the size they show at, serve them as WebP or AVIF, and add loading=lazy to images below the first screen.",
          doneWhen: "At least 90% of content images are up to 2x their display width and WebP or AVIF, and at least 90% of images below the first screen use loading=lazy.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product photos are heavier than they need to be.", detail: "Big photos take longer to load on mobile data. Your pages show later, and some customers leave before they see the product." } },
      },
      media_buyer: {
        fail: { business: { summary: "Heavy images slow the landing page on phones, so more paid clicks leave before it shows and CPA rises.", detail: "Visitors on mobile data wait for large photos, and the click-to-landing-page-view gap widens. The developer, or whoever uploads images, fixes it on the store." } },
      },
      agency: {
        pass: { business: { summary: "The store's images are sized and compressed for phones.", detail: "Photos download quickly on mobile data, and images further down wait until the shopper scrolls." } },
        fail: { business: { summary: "The store's photos and banners are heavier than they need to be.", detail: "Large or old-format images take longer to download on mobile data. Pages show later, and some shoppers leave before the photos appear." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "صور المحتوى بحجم مناسب وبصيغة WebP أو AVIF، والصور أسفل الشاشة الأولى تُحمَّل عند الحاجة.", detail: "{good} من {images} صورة لا يتجاوز عرضها ضعف عرض عرضها على الشاشة وبصيغة WebP أو AVIF، و{lazy} من {belowFold} صورة أسفل الشاشة الأولى تستخدم loading=lazy." },
          business: { summary: "الصور مضبوطة الحجم ومضغوطة للجوال.", detail: "الصور تُحمَّل بسرعة على بيانات الجوال، والصور في أسفل الصفحة تنتظر حتى ينزل العميل إليها." },
          protect: "ارفع الصور الجديدة بصيغة WebP، وبحجم لا يتجاوز ضعف الحجم الذي تظهر به.",
        },
        fail: {
          technical: { summary: "صور المحتوى أكبر من اللازم أو بصيغة قديمة، أو الصور أسفل الشاشة الأولى لا تستخدم loading=lazy.", detail: "من {images} صورة: {good} بحجم مناسب وبصيغة WebP أو AVIF، و{bad} أكبر من اللازم أو JPG أو PNG عادية، و{unknown} لم يمكن الحكم عليها. و{lazy} من {belowFold} صورة أسفل الشاشة الأولى تستخدم loading=lazy. يفشل البند عندما تقل الصور المناسبة عن 90%، أو تقل الصور الكسولة أسفل الشاشة الأولى عن 90%." },
          business: { summary: "الصور والبانرات أثقل من اللازم.", detail: "الصور الكبيرة أو بالصيغ القديمة تحتاج وقتًا أطول على بيانات الجوال. فتظهر الصفحات متأخرة، وبعض العملاء يغادرون قبل ظهور الصور." },
          step: "اطلب من المطوّر تصغير الصور إلى ضعف الحجم الذي تظهر به على الأكثر، وعرضها بصيغة WebP أو AVIF، وإضافة loading=lazy للصور أسفل الشاشة الأولى.",
          doneWhen: "90% على الأقل من صور المحتوى لا يتجاوز عرضها ضعف عرض ظهورها وبصيغة WebP أو AVIF، و90% على الأقل من الصور أسفل الشاشة الأولى تستخدم loading=lazy.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صور منتجاتك أثقل من اللازم.", detail: "الصور الكبيرة تتأخر على بيانات الجوال. فصفحاتك تبين متأخر، وبعض العملاء يطلعون قبل ما يشوفون المنتج." } },
      },
      media_buyer: {
        fail: { business: { summary: "الصور التقيلة بتبطّأ صفحة الهبوط على الموبايل، فكليكات مدفوعة أكتر بتمشي قبل ما الصفحة تظهر والـ CPA بيعلى.", detail: "الزائر على داتا الموبايل بيستنى الصور الكبيرة، والفرق بين الكليكات والـ landing page views بيوسع. التصليح عند المطوّر أو اللي بيرفع الصور في المتجر." } },
      },
      agency: {
        fail: { business: { summary: "صور «المتجر» وبانراته أثقل من اللازم.", detail: "الصور الكبيرة أو بالصيغ القديمة تحتاج وقتًا أطول على بيانات الجوال. فتظهر صفحات «المتجر» متأخرة، وبعض العملاء يغادرون قبل ظهور الصور." } },
      },
    },
  },
  // SPEED-06 always hands over thirdPartyShare, topApp, topAppShare and
  // homeKB. On a pass topApp can be "none", so the pass text leaves it out.
  "SPEED-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Home page, PageSpeed Insights phone run: third-party apps send {thirdPartyShare} of {homeKB} KB, and no single app reaches 20%. Platform and image CDN files count as the store's own." },
          business: { summary: "Apps and tags add little weight to your home page.", detail: "Most of what a shopper downloads is the store itself, so add-ons don't hold the page back." },
          protect: "Check the home page in PageSpeed Insights after installing any new app.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Home page, PageSpeed Insights phone run: third-party apps send {thirdPartyShare} of {homeKB} KB, and the largest, {topApp}, sends {topAppShare}. Platform and image CDN files count as the store's own. It fails at 50% or more for all apps together, or 20% or more for one app." },
          business: { summary: "Apps and tags make up too much of your home page's weight.", detail: "Every app adds files the phone must download. {topApp} alone is {topAppShare} of the page. Shoppers wait longer, and some leave." },
          step: "Remove apps you no longer use, and ask your developer to delay {topApp} and other non-essential apps until after the page shows.",
          doneWhen: "PageSpeed Insights shows third-party apps under 50% of the home page's bytes, with no single app at 20% or more.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Apps on your store slow down your home page.", detail: "{topApp} alone is {topAppShare} of what the page downloads. Customers wait longer to see your products, and some leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "Third-party apps weigh down the home page, so the click-to-landing-page-view gap widens and CVR drops.", detail: "{topApp} alone is {topAppShare} of the home page. Paid visitors wait for these files on phones, and some leave before the page shows. The owner and developer decide which apps to cut or delay." } },
      },
      agency: {
        pass: { business: { summary: "Apps and tags add little weight to the store's home page.", detail: "Most of what a shopper downloads is the store itself, so add-ons don't hold the page back." } },
        fail: { business: { summary: "Apps and tags make up too much of the store's home page weight.", detail: "Every app adds files the phone must download. {topApp} alone is {topAppShare} of the page. Shoppers wait longer, and some leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "التطبيقات الخارجية تشكّل {thirdPartyShare} من حجم الصفحة الرئيسية، ولا يصل أي تطبيق وحده إلى 20%.", detail: "من تشغيل الجوال في PageSpeed Insights: حجم الصفحة الرئيسية {homeKB} KB. ملفات المنصة وشبكة توزيع الصور تُحسب من ملفات المتجر نفسه." },
          business: { summary: "التطبيقات والوسوم تضيف وزنًا قليلًا إلى الصفحة الرئيسية.", detail: "معظم ما يحمّله العميل هو المتجر نفسه، فلا تؤخر الإضافات الصفحة." },
          protect: "افحص الصفحة الرئيسية في PageSpeed Insights بعد تثبيت أي تطبيق جديد.",
        },
        fail: {
          technical: { summary: "التطبيقات الخارجية تشكّل {thirdPartyShare} من حجم الصفحة الرئيسية، وأكبرها {topApp} بنسبة {topAppShare}.", detail: "من تشغيل الجوال في PageSpeed Insights: حجم الصفحة الرئيسية {homeKB} KB. ملفات المنصة وشبكة توزيع الصور تُحسب من ملفات المتجر نفسه. يفشل البند عند 50% أو أكثر لكل التطبيقات معًا، أو 20% أو أكثر لتطبيق واحد." },
          business: { summary: "التطبيقات والوسوم تشكّل جزءًا كبيرًا من وزن الصفحة الرئيسية.", detail: "كل تطبيق يضيف ملفات يجب أن يحمّلها الجوال. {topApp} وحده {topAppShare} من الصفحة. فينتظر العميل أكثر، وبعضهم يغادر." },
          step: "احذف التطبيقات غير المستخدمة، واطلب من المطوّر تأخير {topApp} والتطبيقات غير الأساسية حتى تظهر الصفحة.",
          doneWhen: "يُظهر PageSpeed Insights أن التطبيقات الخارجية أقل من 50% من حجم الصفحة الرئيسية، ولا يصل أي تطبيق وحده إلى 20%.",
        },
      },
      store_owner: {
        fail: { business: { summary: "التطبيقات في متجرك تبطّئ الصفحة الرئيسية.", detail: "{topApp} لحاله {topAppShare} من اللي تحمّله الصفحة. العميل ينتظر أكثر عشان يشوف منتجاتك، وبعضهم يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "تطبيقات خارجية بتتقّل الصفحة الرئيسية، فالفرق بين الكليكات والـ landing page views بيوسع والـ CVR بينزل.", detail: "{topApp} لوحده {topAppShare} من الصفحة الرئيسية. الزائر المدفوع بيستنى الملفات دي على الموبايل، وبعضهم بيمشي قبل ما الصفحة تظهر. صاحب المتجر والمطوّر يقرروا أنهي تطبيقات تتشال أو تتأخر." } },
      },
      agency: {
        fail: { business: { summary: "التطبيقات والوسوم تشكّل جزءًا كبيرًا من وزن الصفحة الرئيسية لـ«المتجر».", detail: "كل تطبيق يضيف ملفات يجب أن يحمّلها الجوال. {topApp} وحده {topAppShare} من الصفحة. فينتظر العميل أكثر، وبعضهم يغادر." } },
      },
    },
  },
  // SPEED-07: a pass hands over {videos} (a count), a fail {src} and {megabytes}.
  "SPEED-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Home page on a phone: no autoplay video in the first screen (the top 844px) is over 1 MB." },
          business: { summary: "The top of your home page doesn't make phones download a heavy video.", detail: "The first screen shows without waiting on a large video file, even on mobile data." },
          protect: "If you add a hero video, keep it under 1 MB or show a poster image on phones.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The autoplay video {src} sits in the phone first screen of home and weighs {megabytes} MB. The limit is 1 MB. Autoplay starts the download as soon as the page opens, competing with the images and scripts the first screen needs." },
          business: { summary: "A heavy video plays at the top of your home page on phones.", detail: "Phones on mobile data start downloading it right away. The first screen shows later, and some visitors leave before they see a product." },
          step: "Ask your developer to show a poster image on phones instead of the video, or cut the video to under 1 MB.",
          doneWhen: "No autoplay video over 1 MB sits in the phone first screen of the home page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "A heavy video plays at the top of your home page on phones.", detail: "Customers on mobile data wait for it to load. Your first screen shows later, and some leave before seeing a product." } },
      },
      media_buyer: {
        fail: { business: { summary: "A heavy autoplay video slows the home page's first screen on phones, so more paid clicks leave before it shows and CPA rises.", detail: "The {megabytes} MB video competes with the page for bandwidth right after the click. It hurts most when ads send traffic to the home page. The developer swaps it for a poster image on phones." } },
      },
      agency: {
        pass: { business: { summary: "The top of the store's home page doesn't make phones download a heavy video.", detail: "The first screen shows without waiting on a large video file, even on mobile data." } },
        fail: { business: { summary: "A heavy video plays at the top of the store's home page on phones.", detail: "Phones on mobile data start downloading it right away. The first screen shows later, and some visitors leave before they see a product." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا يوجد فيديو تلقائي التشغيل أكبر من 1 MB في الشاشة الأولى للصفحة الرئيسية على الجوال.", detail: "الصفحة الرئيسية على الجوال: لا يتجاوز أي فيديو تلقائي التشغيل في الشاشة الأولى (أعلى 844px) حجم 1 MB." },
          business: { summary: "أعلى الصفحة الرئيسية لا يُجبر الجوال على تحميل فيديو ثقيل.", detail: "الشاشة الأولى تظهر دون انتظار ملف فيديو كبير، حتى على بيانات الجوال." },
          protect: "إذا أضفت فيديو في أعلى الصفحة، اجعله أقل من 1 MB أو اعرض صورة بديلة على الجوال.",
        },
        fail: {
          technical: { summary: "فيديو تلقائي التشغيل حجمه {megabytes} MB في الشاشة الأولى للصفحة الرئيسية على الجوال، والحد 1 MB.", detail: "الفيديو {src} في الشاشة الأولى للرئيسية على الجوال. التشغيل التلقائي يبدأ التحميل فور فتح الصفحة، فينافس الصور والسكربتات التي تحتاجها الشاشة الأولى." },
          business: { summary: "فيديو ثقيل يعمل في أعلى الصفحة الرئيسية على الجوال.", detail: "الجوال على بيانات الهاتف يبدأ تحميله فورًا. فتظهر الشاشة الأولى متأخرة، وبعض الزوار يغادرون قبل رؤية أي منتج." },
          step: "اطلب من المطوّر عرض صورة بديلة على الجوال بدل الفيديو، أو تصغير الفيديو إلى أقل من 1 MB.",
          doneWhen: "لا يوجد فيديو تلقائي التشغيل أكبر من 1 MB في الشاشة الأولى للصفحة الرئيسية على الجوال.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيديو ثقيل يشتغل في أعلى صفحتك الرئيسية على الجوال.", detail: "العميل على بيانات الجوال ينتظر تحميله. فأول شاشة تبين متأخر، وبعضهم يطلع قبل ما يشوف أي منتج." } },
      },
      media_buyer: {
        fail: { business: { summary: "فيديو autoplay تقيل بيبطّأ أول شاشة في الصفحة الرئيسية على الموبايل، فكليكات مدفوعة أكتر بتمشي والـ CPA بيعلى.", detail: "الفيديو ده {megabytes} MB وبينافس الصفحة على النت بعد الكليك على طول. بيأثر أكتر لو الإعلانات بتودّي على الصفحة الرئيسية. المطوّر يحط صورة بدل الفيديو على الموبايل." } },
      },
      agency: {
        fail: { business: { summary: "فيديو ثقيل يعمل في أعلى الصفحة الرئيسية لـ«المتجر» على الجوال.", detail: "الجوال على بيانات الهاتف يبدأ تحميله فورًا. فتظهر الشاشة الأولى متأخرة، وبعض الزوار يغادرون قبل رؤية أي منتج." } },
      },
    },
  },
};
