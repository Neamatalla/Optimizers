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
  // PDP-02: account.ts pdp02 (Clarity). {sessions} and {url} are on pass and
  // fail; the per-behaviour shares only when Clarity returned them.
  "PDP-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On {url} ({sessions} Clarity sessions), the share of sessions with dead clicks and with rage clicks is at or below the site-wide share." },
          business: { summary: "Shoppers on the top product page aren't tapping things that do nothing.", detail: "Taps on the busiest product page get a response, so shoppers move on to the options and the buy button." },
          protect: "When you add badges, icons or banners to the product page, make each one either do something on tap or look like plain text.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On {url} ({sessions} Clarity sessions), more sessions than site-wide have dead clicks (a tap with no response) or rage clicks (fast repeated taps on one spot). Something on the page looks tappable and does nothing, or responds too slowly." },
          business: { summary: "Shoppers keep tapping things that don't respond on the top product page.", detail: "This is the page that sells the most. When a tap does nothing, some shoppers give up before Add to Cart." },
          step: "Open the top product page on a phone and tap everything that looks tappable: photos, colour and size options, the price, delivery and payment badges. Make each one respond (zoom, select, open details) or make it look like plain text. Clarity's recordings for this page show where people tap.",
          doneWhen: "In the next Clarity snapshot, with 100 or more sessions on the top product page, its dead-click and rage-click session shares are at or below the site-wide share.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Shoppers tap things that don't work on your top product page.", detail: "This is your busiest product. When a tap does nothing, some people give up before Add to Cart, and you lose those sales." } },
      },
      agency: {
        fail: { business: { summary: "Shoppers keep tapping things that don't respond on the store's top product page.", detail: "This is the store's busiest product page. When a tap does nothing, some shoppers give up before Add to Cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "نسبة جلسات النقرات الميتة ونقرات الغضب في أكثر صفحة منتج زيارة لا تتجاوز نسبة الموقع كله.", detail: "الصفحة {url}، عبر {sessions} جلسة في Clarity." },
          business: { summary: "العملاء في أهم صفحة منتج لا يضغطون على أشياء لا تستجيب.", detail: "الضغطات في أكثر صفحة منتج زيارة تلقى استجابة، فينتقل العميل إلى الخيارات وزر الشراء." },
          protect: "عند إضافة شارات أو أيقونات أو بانرات لصفحة المنتج، اجعل كل منها يستجيب للضغط أو يبدو كنص عادي.",
        },
        fail: {
          technical: { summary: "نسبة جلسات النقرات الميتة أو نقرات الغضب في أكثر صفحة منتج زيارة أعلى من نسبة الموقع كله.", detail: "الصفحة {url}، عبر {sessions} جلسة في Clarity. النقرة الميتة ضغطة بلا استجابة، ونقرة الغضب ضغطات سريعة متكررة على نفس المكان. شيء في الصفحة يبدو قابلًا للضغط ولا يستجيب، أو يستجيب ببطء." },
          business: { summary: "العملاء يضغطون على أشياء لا تستجيب في أهم صفحة منتج.", detail: "هذه الصفحة الأكثر بيعًا. عندما لا تستجيب الضغطة، يترك بعض العملاء قبل الإضافة للسلة." },
          step: "افتح أهم صفحة منتج على الجوال واضغط كل ما يبدو قابلًا للضغط: الصور وخيارات اللون والمقاس والسعر وشارات التوصيل والدفع. اجعل كل عنصر يستجيب (تكبير أو اختيار أو فتح تفاصيل) أو يبدو كنص عادي. تسجيلات Clarity لهذه الصفحة تبيّن أين يضغط العملاء.",
          doneWhen: "في لقطة Clarity التالية، مع 100 جلسة أو أكثر على أهم صفحة منتج، تكون نسبة جلسات النقرات الميتة ونقرات الغضب فيها مساوية لنسبة الموقع كله أو أقل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "العملاء يضغطون على أشياء ما تشتغل في أهم صفحة منتج عندك.", detail: "هذي أكثر صفحة تبيع في متجرك. لما الضغطة ما تسوي شي، بعض العملاء يطلعون قبل أضف للسلة وتخسر البيعة." } },
      },
      agency: {
        fail: { business: { summary: "العملاء يضغطون على أشياء لا تستجيب في أهم صفحة منتج في «المتجر».", detail: "هذه أكثر صفحة منتج زيارة في «المتجر». عندما لا تستجيب الضغطة، يترك بعض العملاء قبل الإضافة للسلة." } },
      },
    },
  },
  // PDP-05: facts.ts pdp05. Fail has {page}, {kind} and {covers}; pass has
  // {floating}. It doesn't check that a WhatsApp button exists.
  "PDP-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Floating elements on screen on the phone product page and cart: {floating}. None overlaps the options, price, quantity selector, Add to Cart or checkout button." },
          business: { summary: "Chat buttons and banners leave the buy buttons clear.", detail: "On a phone, shoppers can reach the options, price and buy buttons without tapping a widget by mistake." },
          protect: "When you add a chat, WhatsApp or discount widget, check on a phone that it stays clear of the buy buttons.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On the phone {page} page, a floating element ({kind}) overlaps the {covers}. A tap on that spot hits the widget, so the shopper can't reach the control under it." },
          business: { summary: "A floating button or banner covers part of the buying controls on a phone.", detail: "Shoppers who try to pick an option or tap the buy button open a chat or banner instead. Some give up after a couple of tries." },
          step: "Move the chat, WhatsApp or discount button so it doesn't sit over the buying controls on phones, for example higher up the side of the screen, or hide it on the product and cart pages.",
          doneWhen: "On a phone, no floating button or banner overlaps the options, price, quantity selector, Add to Cart or checkout button on the product page and cart.",
        },
      },
      store_owner: {
        fail: { business: { summary: "A floating button or banner covers the buying controls in your store on a phone.", detail: "Customers trying to tap Add to Cart or pick a size open a chat or banner instead. Some give up and leave without ordering." } },
      },
      media_buyer: {
        fail: { business: { summary: "A floating widget covers buy controls on phone, so mobile paid visitors mis-tap and CVR drops.", detail: "Most ad clicks land on a phone, where the widget sits over the option, price or buy button. Missed taps mean fewer adds and a higher CPA. The store owner moves the widget in its app settings." } },
      },
      agency: {
        fail: { business: { summary: "A floating button or banner covers part of the store's buying controls on a phone.", detail: "Shoppers who try to pick an option or tap the buy button open a chat or banner instead. Some give up after a couple of tries." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا عنصر عائم يغطي الخيارات أو السعر أو زر الإضافة للسلة أو زر الدفع على الجوال.", detail: "العناصر العائمة الظاهرة في صفحة المنتج والسلة على الجوال: {floating}." },
          business: { summary: "أزرار المحادثة والبانرات لا تغطي أزرار الشراء.", detail: "على الجوال يصل العميل إلى الخيارات والسعر وأزرار الشراء دون أن يضغط أداة بالخطأ." },
          protect: "عند إضافة أداة محادثة أو واتساب أو خصم، تأكد على الجوال أنها بعيدة عن أزرار الشراء.",
        },
        fail: {
          technical: { summary: "عنصر عائم يغطي أحد عناصر الشراء على الجوال.", detail: "في صفحة {page} على الجوال، عنصر عائم ({kind}) يغطي {covers}. الضغط على هذا المكان يصيب الأداة، فلا يصل العميل إلى العنصر تحتها." },
          business: { summary: "زر أو بانر عائم يغطي جزءًا من عناصر الشراء على الجوال.", detail: "العميل الذي يحاول اختيار خيار أو الضغط على زر الشراء يفتح محادثة أو بانرًا بدلًا منه. وبعضهم يترك بعد محاولتين." },
          step: "انقل زر المحادثة أو واتساب أو الخصم بحيث لا يقع فوق عناصر الشراء على الجوال، مثل رفعه على جانب الشاشة، أو أخفه في صفحتي المنتج والسلة.",
          doneWhen: "على الجوال، لا يغطي أي زر أو بانر عائم الخيارات أو السعر أو محدد الكمية أو زر الإضافة للسلة أو زر الدفع في صفحة المنتج والسلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زر أو بانر عائم يغطي أزرار الشراء في متجرك على الجوال.", detail: "العميل يبي يضغط أضف للسلة أو يختار المقاس، وتنفتح له محادثة أو بانر بداله. بعضهم يزهق ويطلع بدون طلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "widget عائم بيغطي زراير الشراء على الموبايل، فالزوار المدفوعين بيدوسوا غلط والـ CVR بينزل.", detail: "أغلب كليكات الإعلانات بتوصل من الموبايل، والـ widget قاعد فوق الخيار أو السعر أو زرار الشراء. الضغطات الضايعة يعني add to cart أقل وCPA أعلى. صاحب المتجر يحرّك الـ widget من إعدادات التطبيق." } },
      },
      agency: {
        fail: { business: { summary: "زر أو بانر عائم يغطي جزءًا من عناصر الشراء في «المتجر» على الجوال.", detail: "العميل الذي يحاول اختيار خيار أو الضغط على زر الشراء يفتح محادثة أو بانرًا بدلًا منه. وبعضهم يترك بعد محاولتين." } },
      },
    },
  },
  // PDP-08: facts.ts pdp08. Checks in order: quantity selector present, within
  // 100px, button row at least 80% of 390px (312px), contrast 3:1. Each fail
  // path hands over a different fact, so fail text uses no slots; pass has
  // {gap}, {span} and {ratio}.
  "PDP-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The quantity selector is {gap}px from the button, the button row spans {span}px of the 390px phone screen, and the button text has {ratio}:1 contrast." },
          business: { summary: "The buy button is easy to find and use on a phone.", detail: "Shoppers can set a quantity and tap a wide, readable Add to Cart button in one place." },
          protect: "Keep the button's colours at 3:1 contrast or more when you change the theme colours.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The check needs a quantity selector within 100px of the Add to Cart button, a button row at least 312px wide (80% of the 390px phone screen, counting a selector on the same row), and button text contrast of 3:1 or more." },
          business: { summary: "The buy button area is harder to use than it should be on a phone.", detail: "A missing quantity selector, a narrow button or faint button text slows shoppers at the moment they decide. Some buy one item instead of two, and some miss the button." },
          step: "Put a quantity selector next to Add to Cart, make the button (with the selector) span the phone screen width, and use button and text colours with at least 3:1 contrast.",
          doneWhen: "On the phone product page, a quantity selector sits within 100px of Add to Cart, the button row is at least 312px wide on a 390px screen, and the button text contrast is 3:1 or more.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your Add to Cart area is harder to use than it should be on a phone.", detail: "No quantity picker, a small button or faint text makes buying slower. Some customers buy fewer items, and some miss the button." } },
      },
      media_buyer: {
        fail: { business: { summary: "The Add to Cart area is weak on phone, so paid visitors add less often and CVR drops.", detail: "A narrow or faint button is easy to miss right after an ad click, and no quantity picker holds back multi-item orders. Fewer adds raise CPA on the same spend. The fix is in the store theme: forward it to the owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "The store's buy button area is harder to use than it should be on a phone.", detail: "A missing quantity selector, a narrow button or faint button text slows shoppers at the moment they decide. Some buy one item instead of two, and some miss the button." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "محدد الكمية بجانب زر إضافة للسلة بعرض الشاشة وبتباين نص كافٍ.", detail: "محدد الكمية على بعد {gap}px من الزر، وصف الزر يمتد {span}px من شاشة الجوال 390px، وتباين نص الزر {ratio}:1." },
          business: { summary: "زر الشراء سهل الإيجاد والاستخدام على الجوال.", detail: "العميل يحدد الكمية ويضغط زر إضافة للسلة عريضًا وواضحًا في مكان واحد." },
          protect: "أبقِ تباين ألوان الزر 3:1 أو أكثر عند تغيير ألوان القالب.",
        },
        fail: {
          technical: { summary: "محدد الكمية غائب أو بعيد، أو زر الإضافة للسلة ضيق، أو تباين نصه أقل من 3:1.", detail: "يتطلب الفحص محدد كمية على بعد 100px أو أقل من زر الإضافة للسلة، وصف زر بعرض 312px على الأقل (80% من شاشة جوال 390px، مع احتساب المحدد إن كان في الصف نفسه)، وتباين نص الزر 3:1 أو أكثر." },
          business: { summary: "منطقة زر الشراء أصعب استخدامًا مما يجب على الجوال.", detail: "غياب محدد الكمية أو ضيق الزر أو باهتية نصه يبطئ العميل لحظة القرار. بعضهم يشتري قطعة بدل اثنتين، وبعضهم لا يرى الزر." },
          step: "ضع محدد الكمية بجانب زر الإضافة للسلة، واجعل الزر مع المحدد بعرض شاشة الجوال، واستخدم ألوانًا للزر ونصه بتباين 3:1 على الأقل.",
          doneWhen: "في صفحة المنتج على الجوال: محدد الكمية على بعد 100px أو أقل من زر الإضافة للسلة، وصف الزر بعرض 312px أو أكثر على شاشة 390px، وتباين نص الزر 3:1 أو أكثر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "منطقة زر أضف للسلة في متجرك أصعب من اللازم على الجوال.", detail: "ما فيه اختيار للكمية، أو الزر صغير، أو كتابته باهتة. كذا الشراء يصير أبطأ، وبعض العملاء ياخذون أقل أو ما ينتبهون للزر." } },
      },
      media_buyer: {
        fail: { business: { summary: "منطقة الـ Add to Cart ضعيفة على الموبايل، فالزوار المدفوعين بيضيفوا أقل والـ CVR بينزل.", detail: "الزرار الضيق أو الباهت سهل يتفوّت بعد كليك الإعلان، وغياب اختيار الكمية بيقلل الأوردرات اللي فيها أكتر من قطعة. adds أقل يعني CPA أعلى على نفس الصرف. التصليح في ثيم المتجر: ابعته لصاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "منطقة زر الشراء في «المتجر» أصعب استخدامًا مما يجب على الجوال.", detail: "غياب محدد الكمية أو ضيق الزر أو باهتية نصه يبطئ العميل لحظة القرار. بعضهم يشتري قطعة بدل اثنتين، وبعضهم لا يرى الزر." } },
      },
    },
  },
  // PDP-11: visit.ts pdp11 only returns pass ({images}) or unverified; it has
  // no fail path yet, so the fail copy below is written without slots.
  "PDP-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The product gallery ({images} images) has a zoom or lightbox in its markup, so a tap opens a larger view." },
          business: { summary: "Shoppers can zoom into product photos.", detail: "A closer look at texture, size and details answers questions a description can't." },
          protect: "Keep the gallery's zoom or lightbox setting on when you change the theme or gallery app.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "No zoom or lightbox was found in the product gallery markup. Without one, a tap on a photo doesn't open a larger view." },
          business: { summary: "Shoppers can't zoom into product photos.", detail: "People want to see texture, stitching and labels before they buy. When they can't look closer, some leave to find a store that shows more." },
          step: "Turn on image zoom or a lightbox in the theme's product gallery settings, or add a gallery app that has it.",
          doneWhen: "The product gallery has a zoom or lightbox, and tapping a photo opens a larger view.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Customers can't zoom into your product photos.", detail: "People want a close look before they pay. If they can't zoom, some leave to buy where they can." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product photos don't zoom, so paid visitors who want a closer look can leave and CVR slips.", detail: "Ad clicks often come from a close-up creative, and the product page can't match it. Doubts that a closer look would settle end the visit. The store owner turns on zoom in the theme settings." } },
      },
      agency: {
        fail: { business: { summary: "Shoppers can't zoom into the store's product photos.", detail: "People want to see texture, stitching and labels before they buy. When they can't look closer, some leave to find a store that shows more." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "معرض صور المنتج فيه تكبير أو عارض صور.", detail: "المعرض ({images} صور) فيه تكبير أو عارض صور في الكود، فالضغط على الصورة يفتح عرضًا أكبر." },
          business: { summary: "العميل يستطيع تكبير صور المنتج.", detail: "النظر عن قرب إلى الخامة والحجم والتفاصيل يجيب عن أسئلة لا يجيب عنها الوصف." },
          protect: "أبقِ خيار التكبير أو عارض الصور مفعّلًا عند تغيير القالب أو تطبيق المعرض.",
        },
        fail: {
          technical: { summary: "لم نجد تكبيرًا أو عارض صور في معرض صور المنتج.", detail: "لا يوجد تكبير أو عارض صور في كود المعرض. بدونه، الضغط على الصورة لا يفتح عرضًا أكبر." },
          business: { summary: "العميل لا يستطيع تكبير صور المنتج.", detail: "العميل يريد رؤية الخامة والخياطة والملصقات قبل الشراء. عندما لا يستطيع التكبير، يغادر بعضهم إلى متجر يعرض أكثر." },
          step: "فعّل تكبير الصور أو عارض الصور من إعدادات معرض المنتج في القالب، أو أضف تطبيق معرض يدعمه.",
          doneWhen: "معرض المنتج فيه تكبير أو عارض صور، والضغط على الصورة يفتح عرضًا أكبر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عملاؤك ما يقدرون يكبّرون صور منتجاتك.", detail: "العميل يبي يشوف المنتج عن قرب قبل ما يدفع. لو ما قدر، بعضهم يروح يشتري من مكان ثاني." } },
      },
      media_buyer: {
        fail: { business: { summary: "صور المنتج مش بتتكبّر، فالزوار المدفوعين اللي عايزين يشوفوا عن قرب ممكن يمشوا والـ CVR يقل.", detail: "كليكات الإعلانات كتير بتيجي من creative قريب على المنتج، وصفحة المنتج مش بتكمّل الصورة دي. الشك اللي كانت نظرة قريبة هتحلّه بينهي الزيارة. صاحب المتجر يفعّل الـ zoom من إعدادات الثيم." } },
      },
      agency: {
        fail: { business: { summary: "العميل لا يستطيع تكبير صور منتجات «المتجر».", detail: "العميل يريد رؤية الخامة والخياطة والملصقات قبل الشراء. عندما لا يستطيع التكبير، يغادر بعضهم إلى متجر يعرض أكثر." } },
      },
    },
  },
  // PDP-12: probes.ts pdp12. Pass and fail both carry url, group, from, to,
  // before and after.
  "PDP-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On {url}, choosing {group} \"{to}\" instead of \"{from}\" changed the main photo from {before} to {after}." },
          business: { summary: "Picking a colour or option shows that option's photo.", detail: "Shoppers see the exact version they are about to buy." },
          protect: "Give each new variant its own photo when you add products or options.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On {url}, choosing {group} \"{to}\" instead of \"{from}\" moved the page to the new variant, but the main photo stayed {after}. The variant likely has no image of its own linked to it." },
          business: { summary: "Picking a different colour or option leaves the old photo on screen.", detail: "Shoppers can't see the version they chose. Some buy the wrong one and return it, and some leave unsure." },
          step: "In the product settings, link each colour or option to its own photo (the variant image), so the gallery switches when a shopper picks it.",
          doneWhen: "On the product page, choosing a different option switches the main photo to that option's image.",
        },
      },
      store_owner: {
        fail: { business: { summary: "When a customer picks another colour, your product page keeps showing the old photo.", detail: "Customers can't see what they're about to buy. Some order the wrong one and send it back, and some don't order at all." } },
      },
      media_buyer: {
        fail: { business: { summary: "Choosing a variant doesn't change the photo, so paid visitors can't see what they pick and CVR slips.", detail: "Visitors from an ad showing one colour can't confirm the option they chose. Doubt at the choice step means fewer adds and a higher CPA. The store owner links variant images in the product settings." } },
      },
      agency: {
        fail: { business: { summary: "Picking a different colour or option on the store's product page leaves the old photo on screen.", detail: "Shoppers can't see the version they chose. Some buy the wrong one and return it, and some leave unsure." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "اختيار خيار مختلف يغيّر الصورة الرئيسية في صفحة المنتج.", detail: "في {url}، اختيار {group} \"{to}\" بدل \"{from}\" غيّر الصورة الرئيسية من {before} إلى {after}." },
          business: { summary: "اختيار لون أو خيار يعرض صورة هذا الخيار.", detail: "العميل يرى النسخة نفسها التي سيشتريها." },
          protect: "أعطِ كل خيار جديد صورته الخاصة عند إضافة منتجات أو خيارات.",
        },
        fail: {
          technical: { summary: "اختيار خيار مختلف ينقل الصفحة إلى الخيار الجديد لكن الصورة الرئيسية لا تتغير.", detail: "في {url}، اختيار {group} \"{to}\" بدل \"{from}\" نقل الصفحة إلى الخيار الجديد، لكن الصورة الرئيسية بقيت {after}. على الأرجح لا توجد صورة مربوطة بهذا الخيار." },
          business: { summary: "اختيار لون أو خيار آخر يُبقي الصورة القديمة على الشاشة.", detail: "العميل لا يرى النسخة التي اختارها. بعضهم يشتري الخطأ ويعيده، وبعضهم يغادر مترددًا." },
          step: "في إعدادات المنتج، اربط كل لون أو خيار بصورته الخاصة (صورة الخيار)، ليتغير المعرض عند اختيار العميل.",
          doneWhen: "في صفحة المنتج، اختيار خيار مختلف يغيّر الصورة الرئيسية إلى صورة هذا الخيار.",
        },
      },
      store_owner: {
        fail: { business: { summary: "لما العميل يختار لون ثاني، صفحة المنتج في متجرك تظل تعرض الصورة القديمة.", detail: "العميل ما يشوف وش بيشتري. بعضهم يطلب الغلط ويرجّعه، وبعضهم ما يطلب أبدًا." } },
      },
      media_buyer: {
        fail: { business: { summary: "اختيار الـ variant مش بيغيّر الصورة، فالزوار المدفوعين مش شايفين اللي اختاروه والـ CVR بيقل.", detail: "الزائر الجاي من إعلان بلون معيّن مش قادر يتأكد من الاختيار اللي عمله. التردد في خطوة الاختيار يعني add to cart أقل وCPA أعلى. صاحب المتجر يربط صور الـ variants من إعدادات المنتج." } },
      },
      agency: {
        fail: { business: { summary: "اختيار لون أو خيار آخر في صفحة منتج «المتجر» يُبقي الصورة القديمة على الشاشة.", detail: "العميل لا يرى النسخة التي اختارها. بعضهم يشتري الخطأ ويعيده، وبعضهم يغادر مترددًا." } },
      },
    },
  },
};
