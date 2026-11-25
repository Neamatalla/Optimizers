import type { PointTemplate } from "./types.js";

// Frames for AI-judged points: fixed text, the AI's finding in {observation} (types.ts).
export const FRAMES_PDP_HOME: Record<string, PointTemplate> = {
  "PDP-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Gallery of the opened product: 4 or more distinct image URLs, at least one in-use or close-detail shot, and each image's natural width at least 1.5x its displayed width." },
          business: { summary: "The product page has enough sharp photos to judge the product.", detail: "Shoppers can see angles, detail and the product in use before they add to cart." },
          protect: "Upload the same full, high-resolution photo set for every new product.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The gallery misses at least one of: 4 distinct image URLs, an in-use or close-detail shot, or a natural width of 1.5x the displayed width. Images under that width look soft on phone screens." },
          business: { summary: "The product page doesn't show enough sharp photos to judge the product.", detail: "Shoppers can't touch the product, so photos answer their questions about look, size and quality. With few, repeated or blurry photos, more of them leave without adding to cart." },
          step: "Upload at least 4 distinct photos per product, starting with best sellers: different angles, a close detail, the product in use and a size reference, each at least 1.5 times the size it shows on screen.",
          doneWhen: "On a phone, the product gallery shows 4 or more different sharp photos, including one of the product in use or up close.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product page doesn't have enough clear photos.", detail: "Customers can't touch the product, so photos are how they decide. Few or blurry photos mean fewer add to carts and fewer orders." } },
      },
      media_buyer: {
        fail: { business: { summary: "The landing product's gallery is thin or soft, so paid clicks add to cart less.", detail: "The ad image sets an expectation the product page has to back up. A thin or blurry gallery likely holds add-to-cart rate and CVR down and pushes CPA up on the same spend. The fix is on the store: more and sharper product photos." } },
      },
      agency: {
        fail: { business: { summary: "The store's product page doesn't show enough sharp photos.", detail: "Shoppers judge look, size and quality from photos alone, so a thin or blurry gallery means fewer add to carts from all traffic. More photos per product is a content task for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "معرض المنتج المفتوح: 4 روابط صور مختلفة أو أكثر، وصورة استخدام أو لقطة قريبة واحدة على الأقل، وعرض كل صورة الأصلي 1.5 ضعف عرضها المعروض على الأقل." },
          business: { summary: "صفحة المنتج تعرض صورًا واضحة كافية للحكم على المنتج.", detail: "يرى العميل الزوايا والتفاصيل والمنتج أثناء الاستخدام قبل الإضافة إلى السلة." },
          protect: "ارفع نفس مجموعة الصور الكاملة وبدقة عالية لكل منتج جديد.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "المعرض يفتقد واحدًا على الأقل من: 4 روابط صور مختلفة، أو صورة استخدام أو لقطة قريبة، أو عرض أصلي يعادل 1.5 ضعف العرض المعروض. الصور الأصغر من ذلك تظهر باهتة على شاشة الجوال." },
          business: { summary: "صفحة المنتج لا تعرض صورًا واضحة كافية للحكم على المنتج.", detail: "العميل لا يستطيع لمس المنتج، فالصور تجيب عن أسئلته عن الشكل والمقاس والجودة. ومع صور قليلة أو مكررة أو غير واضحة يغادر عدد أكبر دون الإضافة إلى السلة." },
          step: "ارفع 4 صور مختلفة على الأقل لكل منتج، بدءًا بالأكثر مبيعًا: زوايا مختلفة، ولقطة قريبة، والمنتج أثناء الاستخدام، ومرجع للمقاس، وكل صورة بحجم يعادل 1.5 ضعف حجم ظهورها على الشاشة على الأقل.",
          doneWhen: "يعرض معرض المنتج على الجوال 4 صور مختلفة وواضحة أو أكثر، منها صورة استخدام أو لقطة قريبة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة المنتج في متجرك ما فيها صور واضحة كفاية.", detail: "العميل ما يقدر يلمس المنتج، فالصور هي اللي يقرر منها. صور قليلة أو مو واضحة تعني إضافات أقل للسلة وطلبات أقل." } },
      },
      media_buyer: {
        fail: { business: { summary: "معرض صور المنتج اللي الإعلان بيودّي عليه فقير أو الصور مش واضحة، فالكليكات المدفوعة بتضيف للسلة أقل.", detail: "صورة الإعلان بتعمل توقع لازم صفحة المنتج تكمّله. معرض فقير أو صور باهتة غالبًا بيقلل الـ add to cart والـ CVR وبيرفع الـ CPA على نفس الصرف. الحل في المتجر: صور أكتر وأوضح للمنتج." } },
      },
      agency: {
        fail: { business: { summary: "صفحة المنتج في المتجر لا تعرض صورًا واضحة كافية.", detail: "يحكم العميل على الشكل والمقاس والجودة من الصور وحدها، فالمعرض الفقير أو غير الواضح يعني إضافات أقل إلى السلة من كل الزيارات. زيادة الصور لكل منتج مهمة محتوى لفريق المتجر." } },
      },
    },
  },

  "PDP-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Each option group (size, colour, scent) renders as visible buttons or swatches instead of a dropdown, the selected value is highlighted, and sold-out values stay visible with a marking." },
          business: { summary: "Product options are easy to see and pick.", detail: "Shoppers see every choice at once and can tell which one is picked and which are sold out." },
          protect: "Keep swatches on when the theme changes, and add a photo for each new colour.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "At least one of these fails: an option group renders as a dropdown, the selected value has no visible highlight, or sold-out values are hidden instead of marked. Shoppers then can't see the choices or tell which one is picked." },
          business: { summary: "Product options are hard to see or pick.", detail: "When options hide in a dropdown or the chosen one isn't clear, shoppers pick wrong or give up before Add to cart. Hidden sold-out options also make a size or colour look like it was never offered." },
          step: "In the theme or variant settings, show every option as buttons or swatches, highlight the selected one, and mark sold-out options instead of hiding them. Add a photo for each colour. Ask the developer or theme support if the theme has no such setting.",
          doneWhen: "On a phone product page, every option shows as a button or swatch, the chosen one is highlighted, and sold-out ones are greyed or crossed out.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Choosing a size or colour in your store isn't clear.", detail: "When options sit in a dropdown or the chosen one doesn't stand out, customers pick wrong or leave before Add to cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "Options on the product page are hard to pick, so some paid clicks stall before add to cart.", detail: "A dropdown or an unclear selected state adds a step and doubt right before add to cart, which likely lowers CVR and raises CPA. Forward it to the store owner: it is usually a theme setting." } },
      },
      agency: {
        fail: { business: { summary: "Options on the store's product page are hard to see or pick.", detail: "Shoppers who can't see the choices or the selected one pick wrong or stop before Add to cart. It is usually a theme setting the store team can switch." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "كل مجموعة خيارات (مقاس، لون، رائحة) تظهر كأزرار أو عينات لون مرئية بدل قائمة منسدلة، والخيار المحدد مميز، والخيارات النافدة تبقى ظاهرة مع علامة." },
          business: { summary: "خيارات المنتج سهلة الرؤية والاختيار.", detail: "يرى العميل كل الخيارات مرة واحدة ويعرف ما اختاره وما نفد." },
          protect: "أبقِ عينات الألوان مفعلة عند تغيير القالب، وأضف صورة لكل لون جديد.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "واحد على الأقل من هذه يخفق: مجموعة خيارات تظهر كقائمة منسدلة، أو الخيار المحدد بلا تمييز ظاهر، أو الخيارات النافدة مخفية بدل تمييزها. فلا يرى العميل الخيارات ولا يعرف أيها اختار." },
          business: { summary: "خيارات المنتج صعبة الرؤية أو الاختيار.", detail: "عندما تختفي الخيارات في قائمة منسدلة أو لا يتضح الخيار المحدد، يختار العميل خطأ أو يتوقف قبل زر الإضافة إلى السلة. وإخفاء الخيارات النافدة يوحي بأن المقاس أو اللون غير متوفر أصلًا." },
          step: "من إعدادات القالب أو الخيارات، اعرض كل خيار كأزرار أو عينات لون، وميّز الخيار المحدد، وضع علامة على الخيارات النافدة بدل إخفائها. وأضف صورة لكل لون. اطلب من المطور أو دعم القالب ذلك إن لم يوجد إعداد له.",
          doneWhen: "في صفحة المنتج على الجوال، يظهر كل خيار كزر أو عينة لون، والخيار المحدد مميز، والخيارات النافدة باهتة أو مشطوبة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "اختيار المقاس أو اللون في متجرك مو واضح.", detail: "لما تكون الخيارات في قائمة منسدلة أو الخيار المختار ما يبين، العميل يختار غلط أو يطلع قبل ما يضغط أضف للسلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "الخيارات في صفحة المنتج صعب تختارها، فجزء من الكليكات المدفوعة بيقف قبل الـ add to cart.", detail: "القائمة المنسدلة أو الخيار المحدد اللي مش باين بيزوّدوا خطوة وتردد قبل الـ add to cart، وده غالبًا بيقلل الـ CVR وبيرفع الـ CPA. ابعتها لصاحب المتجر: غالبًا إعداد في القالب." } },
      },
      agency: {
        fail: { business: { summary: "خيارات المنتج في المتجر صعبة الرؤية أو الاختيار.", detail: "العميل الذي لا يرى الخيارات أو الخيار المحدد يختار خطأ أو يتوقف قبل الإضافة إلى السلة. وهو غالبًا إعداد في القالب يستطيع فريق المتجر تفعيله." } },
      },
    },
  },

  "PDP-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "First phone screen of the product page: a line of 120 characters or fewer under the product name that states a benefit or result." },
          business: { summary: "The product name comes with a clear reason to buy.", detail: "Shoppers see what the product does for them in the first screen, next to the name and price." },
          protect: "Add the benefit line to every new product when it goes live.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "No line of 120 characters or fewer under the product name states a benefit or result in the first phone screen. The line is missing, too long, or lists features only." },
          business: { summary: "The product name has no clear reason to buy next to it.", detail: "On a phone, the first screen is where most shoppers decide to scroll or leave. A name and price with no benefit leave them to work out why it's worth buying, and many don't." },
          step: "Write one short line under each product name, 120 characters or fewer, saying what the product does for the buyer, starting with best sellers. The content owner adds it in the product editor or a theme block.",
          doneWhen: "Every product shows a benefit line or 2 to 4 benefit points next to its name and price on a phone.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product names have no line saying why to buy.", detail: "Customers on a phone decide in the first screen. If they only see a name and a price, many leave before they see the value." } },
      },
      media_buyer: {
        fail: { business: { summary: "The landing product shows no benefit near its name, so the ad's promise isn't picked up above the fold.", detail: "Paid visitors arrive with the ad's hook in mind. With no benefit line in the first screen, fewer keep reading, which likely lowers CVR and raises CPA. The store team adds it in the product editor." } },
      },
      agency: {
        fail: { business: { summary: "The store's product names have no benefit line next to them.", detail: "Shoppers decide in the first phone screen whether to read on. A short benefit line under each name is a content task for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الشاشة الأولى لصفحة المنتج على الجوال: سطر من 120 حرفًا أو أقل تحت اسم المنتج يذكر فائدة أو نتيجة." },
          business: { summary: "اسم المنتج يرافقه سبب واضح للشراء.", detail: "يرى العميل ما يقدمه المنتج له في الشاشة الأولى، بجانب الاسم والسعر." },
          protect: "أضف سطر الفائدة لكل منتج جديد عند نشره.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لا يوجد في الشاشة الأولى على الجوال سطر من 120 حرفًا أو أقل تحت اسم المنتج يذكر فائدة أو نتيجة. السطر غائب، أو طويل، أو يسرد مواصفات فقط." },
          business: { summary: "اسم المنتج بلا سبب واضح للشراء بجانبه.", detail: "على الجوال، الشاشة الأولى هي التي يقرر فيها أغلب العملاء المتابعة أو المغادرة. والاسم والسعر بلا فائدة يتركان العميل ليستنتج قيمة المنتج وحده، وكثيرون لا يفعلون." },
          step: "اكتب سطرًا قصيرًا تحت اسم كل منتج، 120 حرفًا أو أقل، يقول ما يقدمه المنتج للمشتري، بدءًا بالأكثر مبيعًا. يضيفه مسؤول المحتوى من محرر المنتج أو من قسم في القالب.",
          doneWhen: "كل منتج يعرض سطر فائدة أو من 2 إلى 4 نقاط فوائد بجانب اسمه وسعره على الجوال.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أسماء منتجاتك ما معها سطر يقول ليش يشتري العميل.", detail: "العميل على الجوال يقرر من أول شاشة. إذا شاف اسم وسعر بس، كثير يطلعون قبل ما يعرفون قيمة المنتج." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة المنتج اللي الإعلان بيودّي عليها مفيهاش فايدة جنب الاسم، فوعد الإعلان مش بيكمل فوق الـ fold.", detail: "الزائر المدفوع جاي وفي دماغه الـ hook بتاع الإعلان. من غير سطر فايدة في أول شاشة ناس أقل بتكمل قراءة، وده غالبًا بيقلل الـ CVR وبيرفع الـ CPA. فريق المتجر بيضيفه من محرر المنتج." } },
      },
      agency: {
        fail: { business: { summary: "أسماء المنتجات في المتجر بلا سطر فائدة بجانبها.", detail: "يقرر العميل في الشاشة الأولى على الجوال إن كان سيتابع القراءة. وسطر فائدة قصير تحت كل اسم مهمة محتوى لفريق المتجر." } },
      },
    },
  },

  "PDP-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Product description, in the page language: material or specs, size or fit, usage and what is included." },
          business: { summary: "The product description answers the main buying questions.", detail: "Shoppers find material, size, use and what's in the box without leaving to ask." },
          protect: "Use the same description checklist for every new product.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The description misses at least one of: material or specs, size or fit, usage, what is included. A description in another language than the page counts as missing." },
          business: { summary: "The product description leaves buying questions open.", detail: "A shopper who can't find the material, size, how to use it or what's in the box has to message, search elsewhere or guess. Many leave instead." },
          step: "Ask the content owner to add material or specs, size or fit, how to use it and what is included to each description, in the page language, starting with the top advertised product.",
          doneWhen: "The top product page shows a description in the page language covering material, size, use and what is included.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product description doesn't answer what customers ask before buying.", detail: "Missing details on material, size or use send customers to ask on WhatsApp or to buy elsewhere." } },
      },
      media_buyer: {
        fail: { business: { summary: "The landing product's description misses buying facts, so paid visitors leave to find them.", detail: "Visitors who can't find size, material or what's included don't add to cart, so CVR on product ads likely stays low and CPA rises. The fix is content on the store, starting with the advertised product." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "وصف المنتج بلغة الصفحة: الخامة أو المواصفات، والمقاس أو القياس، وطريقة الاستخدام، ومحتويات العبوة." },
          business: { summary: "وصف المنتج يجيب عن أسئلة الشراء الأساسية.", detail: "يجد العميل الخامة والمقاس والاستخدام ومحتويات العبوة دون أن يغادر ليسأل." },
          protect: "استخدم نفس قائمة عناصر الوصف لكل منتج جديد.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "الوصف يفتقد واحدًا على الأقل من: الخامة أو المواصفات، والمقاس أو القياس، والاستخدام، ومحتويات العبوة. والوصف بلغة غير لغة الصفحة يُعد غائبًا." },
          business: { summary: "وصف المنتج يترك أسئلة الشراء بلا إجابة.", detail: "العميل الذي لا يجد الخامة أو المقاس أو طريقة الاستخدام أو محتويات العبوة يضطر للمراسلة أو البحث في مكان آخر أو التخمين. وكثيرون يغادرون." },
          step: "اطلب من مسؤول المحتوى إضافة الخامة أو المواصفات والمقاس وطريقة الاستخدام ومحتويات العبوة إلى كل وصف، بلغة الصفحة، بدءًا بالمنتج الأكثر إعلانًا.",
          doneWhen: "صفحة المنتج الأول تعرض وصفًا بلغة الصفحة يغطي الخامة والمقاس والاستخدام ومحتويات العبوة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "وصف المنتج في متجرك ما يجاوب على أسئلة العميل قبل الشراء.", detail: "نقص التفاصيل عن الخامة أو المقاس أو الاستخدام يخلي العميل يسأل على الواتساب أو يشتري من غيرك." } },
      },
      media_buyer: {
        fail: { business: { summary: "وصف المنتج اللي الإعلان بيودّي عليه ناقص معلومات الشراء، فالزوار المدفوعين بيمشوا يدوروا عليها.", detail: "الزائر اللي مش لاقي المقاس أو الخامة أو محتوى العلبة مش بيعمل add to cart، فالـ CVR على إعلانات المنتجات غالبًا بيفضل واطي والـ CPA بيعلى. الحل محتوى في المتجر، ابدأ بالمنتج اللي عليه إعلانات." } },
      },
    },
  },

  "PDP-13": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A size guide link or pop-up sits next to the size or fit selector on the product page." },
          business: { summary: "A size guide sits right next to the size options.", detail: "Shoppers can check their size at the moment they choose it." },
          protect: "Add the size guide to every new product that has sizes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The product has size or fit options but no size guide link or pop-up next to the selector. A guide that is missing or placed elsewhere on the page counts as a fail." },
          business: { summary: "Shoppers have no size guide where they pick the size.", detail: "Without it, shoppers guess, leave to check elsewhere or don't buy. Wrong guesses also come back as returns and exchanges." },
          step: "Add a size guide link or pop-up next to the size selector, with measurements for each size. Most themes have a size chart block or app; the developer can place one if not.",
          doneWhen: "A size guide link sits next to the size options on a phone product page and opens the measurements.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your customers can't check their size where they pick it.", detail: "Customers who aren't sure of the size either leave or order the wrong one and send it back, which costs you the sale or the delivery." } },
      },
      media_buyer: {
        fail: { business: { summary: "No size guide next to the size picker, so unsure paid visitors don't add to cart.", detail: "Size doubt is a common reason to stall on clothing and fit products. It likely lowers CVR and raises CPA, and wrong sizes come back as returns. The store team adds the guide next to the options." } },
      },
      agency: {
        fail: { business: { summary: "The store has no size guide next to the size options.", detail: "Shoppers who can't check their size leave, or order wrong and return it. A size chart next to the selector is a quick theme or app change for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "رابط أو نافذة دليل المقاسات بجانب خيار المقاس أو القياس في صفحة المنتج." },
          business: { summary: "دليل المقاسات بجانب خيارات المقاس مباشرة.", detail: "يتأكد العميل من مقاسه في لحظة اختياره." },
          protect: "أضف دليل المقاسات لكل منتج جديد له مقاسات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "للمنتج خيارات مقاس أو قياس، لكن لا يوجد رابط أو نافذة دليل مقاسات بجانب الخيار. الدليل الغائب أو الموضوع في مكان آخر من الصفحة يُعد إخفاقًا." },
          business: { summary: "لا يجد العميل دليل مقاسات حيث يختار المقاس.", detail: "بدونه يخمّن العميل، أو يغادر ليتأكد في مكان آخر، أو لا يشتري. والتخمين الخاطئ يعود مرتجعات واستبدالات." },
          step: "أضف رابط أو نافذة دليل المقاسات بجانب خيار المقاس، مع القياسات لكل مقاس. معظم القوالب فيها قسم أو تطبيق لجدول المقاسات، وإن لم يوجد يضيفه المطور.",
          doneWhen: "رابط دليل المقاسات بجانب خيارات المقاس في صفحة المنتج على الجوال، ويفتح القياسات.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عملاءك ما يقدرون يتأكدون من المقاس وقت ما يختارونه.", detail: "العميل اللي مو متأكد من مقاسه يا يطلع، يا يطلب مقاس غلط ويرجعه، وهذا يخسرك البيعة أو تكلفة التوصيل." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش دليل مقاسات جنب اختيار المقاس، فالزوار المدفوعين المترددين مش بيعملوا add to cart.", detail: "الشك في المقاس من أشهر أسباب التوقف في الملابس والمنتجات اللي ليها قياس. ده غالبًا بيقلل الـ CVR وبيرفع الـ CPA، والمقاسات الغلط بترجع مرتجعات. فريق المتجر بيضيف الدليل جنب الخيارات." } },
      },
      agency: {
        fail: { business: { summary: "لا يوجد في المتجر دليل مقاسات بجانب خيارات المقاس.", detail: "العميل الذي لا يستطيع التأكد من مقاسه يغادر، أو يطلب مقاسًا خاطئًا ويرجعه. وجدول المقاسات بجانب الخيار تعديل سريع في القالب أو بتطبيق لفريق المتجر." } },
      },
    },
  },

  "PDP-14": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Description, details and shipping sit in labelled tabs or accordions that cover the main buying questions." },
          business: { summary: "Product details are split into short labelled sections.", detail: "Shoppers jump straight to the answer they need, such as size or delivery." },
          protect: "Fill the same sections for every new product.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Description, details and shipping run as one long text block, or the labelled sections leave out main buying questions such as specs or shipping." },
          business: { summary: "Product details are hard to scan.", detail: "On a phone, one long block of text hides the answer a shopper is looking for, such as size or delivery. Shoppers who can't find it quickly tend to leave." },
          step: "Split the product details into labelled tabs or accordions: description, details or specs, and shipping and returns. Most themes have a collapsible tab block; the developer can add one if not.",
          doneWhen: "Product details show as short sections or tabs with headings, shipping included, on a phone product page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Product details in your store are hard to read on the phone.", detail: "Customers want quick answers on size and delivery. A long block of text makes them give up and leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product details are one long block, so paid visitors struggle to find answers and stall.", detail: "Visitors who can't find size or shipping quickly don't add to cart, which likely lowers CVR and raises CPA. Forward it to the store team: it is a theme block." } },
      },
      agency: {
        fail: { business: { summary: "Product details on the store are hard to scan.", detail: "One long block hides the answers on size and delivery. Labelled tabs are a theme block the store team can add." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الوصف والتفاصيل والشحن في تبويبات أو أقسام قابلة للطي بعناوين، وتغطي أسئلة الشراء الأساسية." },
          business: { summary: "تفاصيل المنتج مقسمة إلى أقسام قصيرة بعناوين.", detail: "ينتقل العميل مباشرة إلى الإجابة التي يحتاجها، مثل المقاس أو التوصيل." },
          protect: "املأ نفس الأقسام لكل منتج جديد.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "الوصف والتفاصيل والشحن في كتلة نص واحدة طويلة، أو الأقسام المعنونة تغفل أسئلة شراء أساسية مثل المواصفات أو الشحن." },
          business: { summary: "تفاصيل المنتج صعبة التصفح.", detail: "على الجوال، كتلة النص الطويلة تخفي الإجابة التي يبحث عنها العميل، مثل المقاس أو التوصيل. ومن لا يجدها بسرعة يميل إلى المغادرة." },
          step: "قسّم تفاصيل المنتج إلى تبويبات أو أقسام قابلة للطي بعناوين: الوصف، والتفاصيل أو المواصفات، والشحن والإرجاع. معظم القوالب فيها قسم تبويبات قابل للطي، وإن لم يوجد يضيفه المطور.",
          doneWhen: "تظهر تفاصيل المنتج في صفحة المنتج على الجوال كأقسام أو تبويبات قصيرة بعناوين، منها الشحن.",
        },
      },
      store_owner: {
        fail: { business: { summary: "تفاصيل المنتج في متجرك صعبة القراءة على الجوال.", detail: "العميل يبي جواب سريع عن المقاس والتوصيل. النص الطويل المتكتل يخليه يمل ويطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "تفاصيل المنتج بلوك واحد طويل، فالزوار المدفوعين بيتعبوا يلاقوا الإجابات وبيقفوا.", detail: "الزائر اللي مش لاقي المقاس أو الشحن بسرعة مش بيعمل add to cart، وده غالبًا بيقلل الـ CVR وبيرفع الـ CPA. ابعتها لفريق المتجر: ده قسم في القالب." } },
      },
      agency: {
        fail: { business: { summary: "تفاصيل المنتج في المتجر صعبة التصفح.", detail: "الكتلة الطويلة تخفي الإجابات عن المقاس والتوصيل. والتبويبات المعنونة قسم في القالب يستطيع فريق المتجر إضافته." } },
      },
    },
  },

  "PDP-15": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The bundle or set's product page names every item in the package in a list or line." },
          business: { summary: "The page says exactly what comes in the package.", detail: "Shoppers know what they get for the price." },
          protect: "Update the list whenever the contents of a set change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The product is a bundle or set, but no list or line on the page names every item in the package." },
          business: { summary: "The page doesn't say exactly what comes in the package.", detail: "Shoppers buying a set or bundle can't judge the price without the contents. Many leave or ask first, and unclear contents lead to complaints after delivery." },
          step: "Add a short list to each bundle or set naming every item with its quantity or size, near the price or at the top of the description.",
          doneWhen: "Every bundle or set product page lists exactly what is in the package.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your bundle pages don't say exactly what's inside.", detail: "Customers can't tell if the price is worth it without knowing what they get, and unclear contents bring complaints after delivery." } },
      },
      media_buyer: {
        fail: { business: { summary: "Bundle pages don't list the contents, so paid visitors can't judge the offer.", detail: "A bundle offer converts when the shopper sees what's in it. Missing contents likely lower CVR and raise CPA on bundle ads. The store team adds the list." } },
      },
      agency: {
        fail: { business: { summary: "The store's bundle pages don't list what's inside.", detail: "Shoppers can't judge the price without the contents, and unclear contents lead to complaints. A short contents list is a content task for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "صفحة الباقة أو المجموعة تسمّي كل قطعة في العبوة في قائمة أو سطر." },
          business: { summary: "الصفحة تذكر بالضبط ما في العبوة.", detail: "يعرف العميل ما يحصل عليه مقابل السعر." },
          protect: "حدّث القائمة كلما تغيرت محتويات المجموعة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "المنتج باقة أو مجموعة، لكن لا توجد في الصفحة قائمة أو سطر يسمّي كل قطعة في العبوة." },
          business: { summary: "الصفحة لا تذكر بالضبط ما في العبوة.", detail: "العميل الذي يشتري مجموعة أو باقة لا يستطيع الحكم على السعر دون معرفة المحتويات. كثيرون يغادرون أو يسألون أولًا، والمحتويات غير الواضحة تجلب شكاوى بعد التوصيل." },
          step: "أضف قائمة قصيرة لكل باقة أو مجموعة تسمّي كل قطعة مع كميتها أو مقاسها، قرب السعر أو في أعلى الوصف.",
          doneWhen: "كل صفحة باقة أو مجموعة تذكر بالضبط ما في العبوة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات الباقات في متجرك ما تقول وش داخلها بالضبط.", detail: "العميل ما يعرف إذا السعر يستاهل وهو ما يدري وش بيوصله، والمحتوى الغامض يجيب شكاوى بعد التوصيل." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحات الباقات مش كاتبة المحتوى، فالزوار المدفوعين مش قادرين يحكموا على العرض.", detail: "عرض الباقة بيحوّل لما العميل يشوف جواها إيه. غياب المحتوى غالبًا بيقلل الـ CVR وبيرفع الـ CPA على إعلانات الباقات. فريق المتجر بيضيف القائمة." } },
      },
      agency: {
        fail: { business: { summary: "صفحات الباقات في المتجر لا تذكر ما بداخلها.", detail: "لا يستطيع العميل الحكم على السعر دون المحتويات، والمحتويات غير الواضحة تجلب شكاوى. وقائمة المحتويات القصيرة مهمة محتوى لفريق المتجر." } },
      },
    },
  },

  "PDP-19": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "First phone screen of the product page: Add to cart or checkout is the most visually dominant element by colour, size and contrast." },
          business: { summary: "The buy button is the first thing the eye goes to.", detail: "Shoppers who decide to buy find the next step at once." },
          protect: "Keep the buy colour for buying actions only when adding banners, apps or new buttons.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "In the first phone screen, Add to cart or checkout is not the most dominant element: another button, banner or element shares its colour or draws more attention." },
          business: { summary: "The buy button doesn't stand out on the product page.", detail: "When other buttons or banners use the same colour or draw more attention, shoppers take longer to find how to buy, and some tap elsewhere instead." },
          step: "Give Add to cart one strong colour used only for buying actions, and make it the largest, highest-contrast button in the first screen. Restyle other buttons and banners in quieter colours, in the theme settings or through the developer.",
          doneWhen: "A phone screenshot of the product page shows Add to cart as the most eye-catching element, with no other element in its colour.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The Add to cart button doesn't stand out on your product page.", detail: "If other buttons look the same or louder, customers take longer to find it and some tap away." } },
      },
      media_buyer: {
        fail: { business: { summary: "Add to cart isn't the strongest element above the fold, so some paid clicks drift away from buying.", detail: "Competing buttons or banners split attention right where the click should happen. That likely lowers CVR and raises CPA. Forward it to the store team: it is a colour and theme change." } },
      },
      agency: {
        fail: { business: { summary: "The buy button doesn't stand out on the store's product page.", detail: "Other elements in the same colour, or louder ones, pull attention away from buying. Restyling them is a theme change for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الشاشة الأولى لصفحة المنتج على الجوال: زر الإضافة إلى السلة أو الدفع هو العنصر الأبرز بصريًا من حيث اللون والحجم والتباين." },
          business: { summary: "زر الشراء أول ما تقع عليه العين.", detail: "العميل الذي قرر الشراء يجد الخطوة التالية فورًا." },
          protect: "أبقِ لون الشراء لأزرار الشراء فقط عند إضافة لافتات أو تطبيقات أو أزرار جديدة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "في الشاشة الأولى على الجوال، زر الإضافة إلى السلة أو الدفع ليس العنصر الأبرز: زر أو لافتة أو عنصر آخر يشاركه اللون أو يجذب انتباهًا أكبر." },
          business: { summary: "زر الشراء لا يبرز في صفحة المنتج.", detail: "عندما تستخدم أزرار أو لافتات أخرى نفس اللون أو تجذب انتباهًا أكبر، يتأخر العميل في إيجاد طريقة الشراء، وبعضهم يضغط في مكان آخر." },
          step: "خصص لزر الإضافة إلى السلة لونًا قويًا واحدًا لا يُستخدم إلا لأزرار الشراء، واجعله أكبر الأزرار وأعلاها تباينًا في الشاشة الأولى. وغيّر الأزرار واللافتات الأخرى إلى ألوان أهدأ، من إعدادات القالب أو عبر المطور.",
          doneWhen: "لقطة شاشة لصفحة المنتج على الجوال تُظهر زر الإضافة إلى السلة كأبرز عنصر، ولا عنصر آخر بلونه.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زر أضف للسلة ما يبرز في صفحة المنتج بمتجرك.", detail: "إذا الأزرار الثانية نفس شكله أو أوضح منه، العميل يتأخر يلقاه وبعضهم يضغط على شي ثاني." } },
      },
      media_buyer: {
        fail: { business: { summary: "زرار الـ add to cart مش أقوى عنصر فوق الـ fold، فجزء من الكليكات المدفوعة بيتشتت بعيد عن الشراء.", detail: "الزراير أو البانرات المنافسة بتقسم الانتباه في نفس المكان اللي المفروض يحصل فيه الكليك. ده غالبًا بيقلل الـ CVR وبيرفع الـ CPA. ابعتها لفريق المتجر: تغيير ألوان في القالب." } },
      },
      agency: {
        fail: { business: { summary: "زر الشراء لا يبرز في صفحة المنتج في المتجر.", detail: "العناصر الأخرى بنفس اللون أو الأوضح منه تسحب الانتباه بعيدًا عن الشراء. وتعديلها تغيير في القالب لفريق المتجر." } },
      },
    },
  },

  "HOME-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Home first screen on a 390x844 phone: an H1, a product image or hero, one primary CTA, and the H1 or image makes clear what is sold." },
          business: { summary: "The homepage first screen shows what the store sells.", detail: "A new visitor on a phone understands the store at a glance and has a clear button to start shopping." },
          protect: "Check the phone first screen whenever the hero banner changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "On a 390x844 phone, the home first screen lacks an H1, a product image or hero, or a primary CTA, or none of them makes clear what is sold." },
          business: { summary: "The homepage first screen doesn't make clear what the store sells.", detail: "A new visitor on a phone decides in seconds whether to stay. With no clear headline, product image or shop button, more of them leave before seeing a product." },
          step: "Rework the phone hero: a headline that says what you sell and for whom, a product image, and one shop button, all visible without scrolling. The theme editor or the developer can set this.",
          doneWhen: "The homepage first screen on a phone says what you sell and for whom in one line, with a product image and a shop button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your homepage doesn't show what you sell at first look.", detail: "Visitors on a phone decide in seconds. If they don't see what you sell and a shop button, many leave before seeing any product." } },
      },
      media_buyer: {
        fail: { business: { summary: "The home first screen doesn't say what's sold, so paid traffic landing on home bounces more.", detail: "Clicks sent to the homepage need to recognise the offer at once. An unclear first screen likely raises bounce, lowers CVR and raises CPA. The store team fixes it in the theme hero." } },
      },
      agency: {
        fail: { business: { summary: "The store's homepage first screen doesn't make clear what it sells.", detail: "New visitors decide in seconds. A clear headline, a product image and one shop button is a theme change for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الشاشة الأولى للصفحة الرئيسية على جوال 390x844: عنوان H1، وصورة منتج أو واجهة، وزر رئيسي واحد، والعنوان أو الصورة يوضحان ما يُباع." },
          business: { summary: "الشاشة الأولى للصفحة الرئيسية توضح ما يبيعه المتجر.", detail: "يفهم الزائر الجديد على الجوال المتجر من النظرة الأولى، ويجد زرًا واضحًا لبدء التسوق." },
          protect: "افحص الشاشة الأولى على الجوال كلما تغيرت لافتة الواجهة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "على جوال 390x844، تفتقد الشاشة الأولى للصفحة الرئيسية عنوان H1، أو صورة منتج أو واجهة، أو زرًا رئيسيًا، أو لا يوضح أي منها ما يُباع." },
          business: { summary: "الشاشة الأولى للصفحة الرئيسية لا توضح ما يبيعه المتجر.", detail: "يقرر الزائر الجديد على الجوال في ثوانٍ إن كان سيبقى. ومع غياب عنوان واضح أو صورة منتج أو زر تسوق، يغادر عدد أكبر قبل رؤية أي منتج." },
          step: "أعد تصميم الواجهة على الجوال: عنوان يقول ماذا تبيع ولمن، وصورة منتج، وزر تسوق واحد، وكلها ظاهرة دون تمرير. يمكن ضبط ذلك من محرر القالب أو عبر المطور.",
          doneWhen: "الشاشة الأولى للصفحة الرئيسية على الجوال تقول ماذا تبيع ولمن في سطر واحد، مع صورة منتج وزر تسوق.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحتك الرئيسية ما توضح وش تبيع من أول نظرة.", detail: "الزائر على الجوال يقرر في ثواني. إذا ما شاف وش تبيع وزر للتسوق، كثير يطلعون قبل ما يشوفون أي منتج." } },
      },
      media_buyer: {
        fail: { business: { summary: "أول شاشة في الهوم مش موضحة بتبيع إيه، فالترافيك المدفوع اللي بينزل على الهوم بيعمل bounce أكتر.", detail: "الكليكات اللي رايحة للهوم لازم تفهم العرض على طول. أول شاشة مش واضحة غالبًا بترفع الـ bounce وبتقلل الـ CVR وبترفع الـ CPA. فريق المتجر بيصلحها في الـ hero بتاع القالب." } },
      },
      agency: {
        fail: { business: { summary: "الشاشة الأولى للصفحة الرئيسية في المتجر لا توضح ما يبيعه.", detail: "يقرر الزائر الجديد في ثوانٍ. والعنوان الواضح وصورة المنتج وزر التسوق الواحد تغيير في القالب لفريق المتجر." } },
      },
    },
  },

  "HOME-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The home H1 names an outcome or reason to buy beyond the brand name, a sale or a new-product announcement." },
          business: { summary: "The homepage headline gives a reason to buy.", detail: "Visitors learn what they gain from the store before they scroll." },
          protect: "Keep a benefit in the headline when seasonal or sale banners go up.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The home H1 is only the brand name, a sale or a new-product announcement, or has no text, so no outcome or reason to buy is stated." },
          business: { summary: "The homepage headline gives no reason to buy.", detail: "A brand name or a sale line tells a new visitor nothing about what they gain. Without a reason, fewer of them scroll on to the products." },
          step: "Rewrite the homepage headline to name the result or reason to buy, and move the brand name, sale or launch into a smaller line or the announcement bar.",
          doneWhen: "The homepage headline names a benefit or result for the shopper, with any brand, sale or launch message in a smaller line.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your homepage headline doesn't say why to buy from you.", detail: "A store name or a sale line alone doesn't tell new customers what they gain, so fewer scroll on to your products." } },
      },
      media_buyer: {
        fail: { business: { summary: "The home headline has no benefit, so cold paid traffic gets no reason to stay.", detail: "Cold visitors don't know the brand yet. A headline with only the name or a sale likely lowers CVR and raises CPA on traffic sent to the homepage. The store team rewrites it." } },
      },
      agency: {
        fail: { business: { summary: "The store's homepage headline gives no reason to buy.", detail: "New visitors need to see what they gain before they scroll. Rewriting the headline around a benefit is a copy task for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "عنوان H1 في الصفحة الرئيسية يذكر نتيجة أو سببًا للشراء يتجاوز اسم العلامة أو التخفيض أو إعلان منتج جديد." },
          business: { summary: "عنوان الصفحة الرئيسية يقدم سببًا للشراء.", detail: "يعرف الزائر ما يكسبه من المتجر قبل أن يمرر." },
          protect: "أبقِ الفائدة في العنوان عند وضع لافتات المواسم أو التخفيضات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "عنوان H1 في الصفحة الرئيسية هو اسم العلامة فقط، أو تخفيض، أو إعلان منتج جديد، أو بلا نص، فلا يذكر نتيجة أو سببًا للشراء." },
          business: { summary: "عنوان الصفحة الرئيسية لا يقدم سببًا للشراء.", detail: "اسم العلامة أو سطر التخفيض لا يخبر الزائر الجديد بما يكسبه. ودون سبب، يمرر عدد أقل منهم إلى المنتجات." },
          step: "أعد كتابة عنوان الصفحة الرئيسية ليذكر النتيجة أو سبب الشراء، وانقل اسم العلامة أو التخفيض أو الإطلاق إلى سطر أصغر أو إلى شريط الإعلانات.",
          doneWhen: "عنوان الصفحة الرئيسية يذكر فائدة أو نتيجة للعميل، وأي رسالة عن العلامة أو التخفيض أو الإطلاق في سطر أصغر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عنوان صفحتك الرئيسية ما يقول ليش العميل يشتري منك.", detail: "اسم المتجر أو سطر التخفيض لحاله ما يقول للعميل الجديد وش بيستفيد، فأقل منهم ينزلون لمنتجاتك." } },
      },
      media_buyer: {
        fail: { business: { summary: "عنوان الهوم مفيهوش فايدة، فالترافيك البارد المدفوع مش لاقي سبب يفضل.", detail: "الزوار الباردين لسه ميعرفوش البراند. عنوان فيه الاسم أو الخصم بس غالبًا بيقلل الـ CVR وبيرفع الـ CPA على الترافيك اللي رايح للهوم. فريق المتجر بيعيد كتابته." } },
      },
      agency: {
        fail: { business: { summary: "عنوان الصفحة الرئيسية في المتجر لا يقدم سببًا للشراء.", detail: "يحتاج الزائر الجديد أن يرى ما يكسبه قبل أن يمرر. وإعادة كتابة العنوان حول فائدة مهمة نصوص لفريق المتجر." } },
      },
    },
  },

  "HOME-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Home first screen: one solid, high-contrast, large primary button, with other buttons visibly secondary." },
          business: { summary: "The homepage has one clear main button to start shopping.", detail: "Visitors know where to tap first." },
          protect: "Keep a single main button when new hero slides or banners go up.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The home first screen has no solid, high-contrast primary button, or several buttons look equally strong, so none reads as the main action." },
          business: { summary: "The homepage has no single clear button to start shopping.", detail: "With no button, or several equal ones, visitors hesitate over where to tap. Some scroll without direction and some leave." },
          step: "Keep one solid, high-contrast shop button in the hero, large enough to tap easily, and turn other hero buttons into outline buttons or text links.",
          doneWhen: "The homepage first screen on a phone has one main shop button, with any other buttons clearly lighter.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your homepage has no single clear shop button.", detail: "When there's no button or several look the same, customers don't know where to tap and some leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "No single clear CTA in the home hero, so paid visitors landing there hesitate.", detail: "Missing or equal buttons slow the first click into the catalogue, which likely lowers CVR and raises CPA on homepage traffic. The store team fixes it in the theme hero." } },
      },
      agency: {
        fail: { business: { summary: "The store's homepage has no single clear shop button.", detail: "Visitors hesitate when buttons compete or none stands out. Making one button primary is a theme change for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الشاشة الأولى للصفحة الرئيسية: زر رئيسي واحد مصمت وعالي التباين وكبير، والأزرار الأخرى ثانوية بوضوح." },
          business: { summary: "في الصفحة الرئيسية زر رئيسي واحد واضح لبدء التسوق.", detail: "يعرف الزائر أين يضغط أولًا." },
          protect: "أبقِ زرًا رئيسيًا واحدًا عند إضافة شرائح أو لافتات جديدة في الواجهة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لا يوجد في الشاشة الأولى للصفحة الرئيسية زر رئيسي مصمت وعالي التباين، أو تبدو عدة أزرار بنفس القوة، فلا يظهر أي منها كالإجراء الرئيسي." },
          business: { summary: "لا يوجد في الصفحة الرئيسية زر واحد واضح لبدء التسوق.", detail: "مع غياب الزر أو تساوي عدة أزرار، يتردد الزائر في أين يضغط. بعضهم يمرر بلا اتجاه وبعضهم يغادر." },
          step: "أبقِ زر تسوق واحدًا مصمتًا وعالي التباين في الواجهة، كبيرًا بما يكفي للضغط بسهولة، وحوّل الأزرار الأخرى إلى أزرار بإطار فقط أو روابط نصية.",
          doneWhen: "في الشاشة الأولى للصفحة الرئيسية على الجوال زر تسوق رئيسي واحد، وأي أزرار أخرى أخف منه بوضوح.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحتك الرئيسية ما فيها زر تسوق واحد واضح.", detail: "لما ما فيه زر أو فيه كذا زر بنفس الشكل، العميل ما يدري وين يضغط وبعضهم يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش CTA واحد واضح في الـ hero بتاع الهوم، فالزوار المدفوعين بيترددوا.", detail: "غياب الزرار أو تساوي الزراير بيبطّأ أول كليك للمنتجات، وده غالبًا بيقلل الـ CVR وبيرفع الـ CPA على ترافيك الهوم. فريق المتجر بيصلحها في الـ hero بتاع القالب." } },
      },
      agency: {
        fail: { business: { summary: "لا يوجد في الصفحة الرئيسية للمتجر زر تسوق واحد واضح.", detail: "يتردد الزائر عندما تتنافس الأزرار أو لا يبرز أي منها. وجعل زر واحد رئيسيًا تغيير في القالب لفريق المتجر." } },
      },
    },
  },

  "HOME-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Within the first 2 phone screens, home has a section under a benefit heading with 3 or more items, each with an icon or image and short text." },
          business: { summary: "Reasons to buy show near the top of the homepage.", detail: "Visitors see the store's main promises before they scroll far." },
          protect: "Keep the benefit points true and current when delivery or payment terms change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Within the first 2 phone screens, home has no section under a benefit heading with 3 or more items that each carry an icon or image and short text." },
          business: { summary: "The homepage doesn't list reasons to buy near the top.", detail: "Short points on delivery, payment, returns or quality answer a new visitor's first doubts. When they're missing or far down, fewer visitors trust the store enough to shop." },
          step: "Add a section near the top of the homepage with 3 or 4 benefit points, each with an icon and a short line, such as delivery time, payment options, returns or quality.",
          doneWhen: "Within the first 2 phone screens of the homepage, a section shows 3 or more short benefit points, each with an icon.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your homepage doesn't show why to buy from you near the top.", detail: "Delivery, cash on delivery and returns are what customers check first. If they don't see them early, fewer trust the store enough to order." } },
      },
      media_buyer: {
        fail: { business: { summary: "Home has no benefit strip near the top, so paid visitors don't see reasons to trust the store.", detail: "Delivery, payment and return promises ease first-order doubt for cold traffic. Missing them likely lowers CVR and raises CPA. The store team adds the section in the theme." } },
      },
      agency: {
        fail: { business: { summary: "The store's homepage doesn't list reasons to buy near the top.", detail: "Benefit points answer first doubts about delivery, payment and returns. A short icon section is a theme task for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "خلال أول شاشتين على الجوال، في الصفحة الرئيسية قسم تحت عنوان فوائد فيه 3 عناصر أو أكثر، لكل منها أيقونة أو صورة ونص قصير." },
          business: { summary: "أسباب الشراء تظهر قرب أعلى الصفحة الرئيسية.", detail: "يرى الزائر وعود المتجر الأساسية قبل أن يمرر بعيدًا." },
          protect: "أبقِ نقاط الفوائد صحيحة ومحدثة عند تغير شروط التوصيل أو الدفع.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "خلال أول شاشتين على الجوال، لا يوجد في الصفحة الرئيسية قسم تحت عنوان فوائد فيه 3 عناصر أو أكثر لكل منها أيقونة أو صورة ونص قصير." },
          business: { summary: "الصفحة الرئيسية لا تعرض أسباب الشراء قرب الأعلى.", detail: "النقاط القصيرة عن التوصيل والدفع والإرجاع والجودة تجيب عن أول شكوك الزائر الجديد. وعندما تغيب أو تكون في الأسفل، يثق عدد أقل بالمتجر بما يكفي للتسوق." },
          step: "أضف قسمًا قرب أعلى الصفحة الرئيسية فيه 3 أو 4 نقاط فوائد، لكل منها أيقونة وسطر قصير، مثل مدة التوصيل وخيارات الدفع والإرجاع والجودة.",
          doneWhen: "خلال أول شاشتين من الصفحة الرئيسية على الجوال، يعرض قسم 3 نقاط فوائد قصيرة أو أكثر، لكل منها أيقونة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحتك الرئيسية ما توضح ليش يشترون منك من فوق.", detail: "التوصيل والدفع عند الاستلام والإرجاع أول أشياء يدور عليها العميل. إذا ما شافها بدري، أقل ناس يثقون بالمتجر ويطلبون." } },
      },
      media_buyer: {
        fail: { business: { summary: "الهوم مفيهوش شريط فوايد قريب من فوق، فالزوار المدفوعين مش شايفين أسباب يثقوا في المتجر.", detail: "وعود التوصيل والدفع والإرجاع بتقلل تردد أول أوردر عند الترافيك البارد. غيابها غالبًا بيقلل الـ CVR وبيرفع الـ CPA. فريق المتجر بيضيف القسم في القالب." } },
      },
      agency: {
        fail: { business: { summary: "الصفحة الرئيسية للمتجر لا تعرض أسباب الشراء قرب الأعلى.", detail: "نقاط الفوائد تجيب عن أول الشكوك حول التوصيل والدفع والإرجاع. وقسم قصير بأيقونات مهمة في القالب لفريق المتجر." } },
      },
    },
  },

  "HOME-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Hero text over the image has clear contrast (an overlay or a solid background), and no key promo text is baked into the image." },
          business: { summary: "The homepage hero text is easy to read.", detail: "Visitors read the headline and offer at a glance on any screen." },
          protect: "Upload new hero images without text in them, and keep the overlay on.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Hero text sits on the image with weak contrast, or key promo text is baked into the image file. Baked-in text can't scale, be translated or be read by search engines, and often crops on phones." },
          business: { summary: "The homepage hero text is hard to read.", detail: "Text lost against a busy image, or printed inside the image, is hard to read on a phone. Visitors miss the message and the offer meant to keep them." },
          step: "Set hero text as live text over a dark or light overlay or a solid band, and remove promo text from the image file. The theme editor or the developer can set the overlay.",
          doneWhen: "On a phone, the hero headline and offer read clearly over the image, and the image itself carries no promo text.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The text on your homepage banner is hard to read.", detail: "When text blends into the photo or is printed inside it, customers on a phone miss your offer." } },
      },
      media_buyer: {
        fail: { business: { summary: "Hero text is hard to read or baked into the image, so the offer paid visitors came for gets missed.", detail: "If the hero message doesn't read on a phone, the ad's promise doesn't carry through, which likely lowers CVR and raises CPA. The store team fixes it in the theme hero." } },
      },
      agency: {
        fail: { business: { summary: "The store's homepage hero text is hard to read.", detail: "Text with weak contrast or printed into the image gets missed on phones. Moving it to live text over an overlay is a theme task for the store team." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "نص الواجهة فوق الصورة واضح التباين (طبقة تظليل أو خلفية مصمتة)، ولا يوجد نص عرض أساسي مطبوع داخل الصورة." },
          business: { summary: "نص واجهة الصفحة الرئيسية سهل القراءة.", detail: "يقرأ الزائر العنوان والعرض من نظرة على أي شاشة." },
          protect: "ارفع صور الواجهة الجديدة دون نص بداخلها، وأبقِ طبقة التظليل مفعلة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "نص الواجهة فوق الصورة ضعيف التباين، أو نص العرض الأساسي مطبوع داخل ملف الصورة. النص المطبوع لا يتغير حجمه ولا يُترجم ولا تقرؤه محركات البحث، وكثيرًا ما يُقص على الجوال." },
          business: { summary: "نص واجهة الصفحة الرئيسية صعب القراءة.", detail: "النص الضائع فوق صورة مزدحمة أو المطبوع داخلها صعب القراءة على الجوال. فيفوت الزائر الرسالة والعرض اللذين وُضعا لإبقائه." },
          step: "اجعل نص الواجهة نصًا حيًا فوق طبقة تظليل داكنة أو فاتحة أو على شريط مصمت، واحذف نص العرض من ملف الصورة. يمكن ضبط التظليل من محرر القالب أو عبر المطور.",
          doneWhen: "على الجوال، يُقرأ عنوان الواجهة والعرض بوضوح فوق الصورة، والصورة نفسها بلا نص عرض.",
        },
      },
      store_owner: {
        fail: { business: { summary: "الكلام على بنر صفحتك الرئيسية صعب يتقرا.", detail: "لما الكلام يضيع مع الصورة أو يكون مطبوع داخلها، العميل على الجوال ما ينتبه لعرضك." } },
      },
      media_buyer: {
        fail: { business: { summary: "كلام الـ hero صعب يتقرا أو مطبوع جوه الصورة، فالعرض اللي الزائر المدفوع جاي عشانه بيضيع.", detail: "لو رسالة الـ hero مش مقروءة على الموبايل، وعد الإعلان مش بيكمل، وده غالبًا بيقلل الـ CVR وبيرفع الـ CPA. فريق المتجر بيصلحها في الـ hero بتاع القالب." } },
      },
      agency: {
        fail: { business: { summary: "نص واجهة الصفحة الرئيسية في المتجر صعب القراءة.", detail: "النص ضعيف التباين أو المطبوع داخل الصورة يفوت على زوار الجوال. ونقله إلى نص حي فوق طبقة تظليل مهمة في القالب لفريق المتجر." } },
      },
    },
  },

  "HOME-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A bar above the header on all pages states a concrete current reason: a free-shipping threshold, an active sale, a delivery promise or a guarantee." },
          business: { summary: "A top bar on every page gives a concrete reason to buy now.", detail: "Shoppers see the offer or delivery promise on whatever page they land." },
          protect: "Update the bar the day an offer starts or ends.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "There is no bar above the header, it doesn't show on all pages, or its message is vague or expired instead of a free-shipping threshold, active sale, delivery promise or guarantee." },
          business: { summary: "There's no clear offer in a top bar across the store.", detail: "Many shoppers land on a product or collection page and never see the homepage. A top bar with one specific offer, like free delivery over an amount, gives each of them a reason to buy now." },
          step: "Turn on the announcement bar in the theme and show it on every page with one specific current offer: free delivery over a stated amount, cash on delivery, a delivery time or a guarantee. Update or remove it when the offer ends.",
          doneWhen: "A top bar on every page states one specific offer: free shipping over an amount, COD or delivery time.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store has no top bar with a clear offer on every page.", detail: "Most customers land on a product page and never see the homepage. A bar like free delivery over a set amount gives them a reason to order now." } },
      },
      media_buyer: {
        fail: { business: { summary: "No concrete offer bar across the site, so paid visitors landing on product pages miss the offer.", detail: "Ads often send traffic straight to product pages. A sitewide bar with free delivery, COD or a delivery time backs the ad's offer; without it CVR likely stays lower and CPA higher. The store team turns it on in the theme." } },
      },
      agency: {
        fail: { business: { summary: "The store has no top bar with a concrete offer on every page.", detail: "Most visitors land deep in the store. A sitewide bar with one specific offer is a theme setting the store team can switch on." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "شريط فوق الترويسة في كل الصفحات يذكر سببًا حاليًا محددًا: حد الشحن المجاني، أو تخفيض قائم، أو وعد توصيل، أو ضمان." },
          business: { summary: "شريط علوي في كل صفحة يقدم سببًا محددًا للشراء الآن.", detail: "يرى العميل العرض أو وعد التوصيل في أي صفحة يصل إليها." },
          protect: "حدّث الشريط في يوم بدء العرض أو انتهائه.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لا يوجد شريط فوق الترويسة، أو لا يظهر في كل الصفحات، أو رسالته عامة أو منتهية بدل حد الشحن المجاني أو تخفيض قائم أو وعد توصيل أو ضمان." },
          business: { summary: "لا يوجد عرض واضح في شريط علوي عبر المتجر.", detail: "كثير من العملاء يصلون إلى صفحة منتج أو تصنيف ولا يرون الصفحة الرئيسية أبدًا. والشريط العلوي بعرض محدد، مثل التوصيل المجاني فوق مبلغ معين، يعطي كلًا منهم سببًا للشراء الآن." },
          step: "فعّل شريط الإعلانات في القالب واعرضه في كل الصفحات بعرض حالي محدد واحد: توصيل مجاني فوق مبلغ معلن، أو الدفع عند الاستلام، أو مدة التوصيل، أو ضمان. حدّثه أو احذفه عند انتهاء العرض.",
          doneWhen: "شريط علوي في كل صفحة يذكر عرضًا محددًا واحدًا: شحن مجاني فوق مبلغ معين، أو الدفع عند الاستلام، أو مدة التوصيل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك ما فيه شريط فوق بعرض واضح في كل الصفحات.", detail: "أغلب العملاء يدخلون على صفحة منتج وما يشوفون الصفحة الرئيسية. شريط مثل توصيل مجاني فوق مبلغ معين يعطيهم سبب يطلبون الحين." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش شريط عرض واضح على كل الموقع، فالزوار المدفوعين اللي بينزلوا على صفحات المنتج مش بيشوفوا العرض.", detail: "الإعلانات غالبًا بتودّي الترافيك على صفحات المنتج على طول. شريط على كل الموقع فيه توصيل مجاني أو COD أو مدة توصيل بيدعم عرض الإعلان، ومن غيره الـ CVR غالبًا بيفضل أقل والـ CPA أعلى. فريق المتجر بيفعّله من القالب." } },
      },
      agency: {
        fail: { business: { summary: "لا يوجد في المتجر شريط علوي بعرض محدد في كل الصفحات.", detail: "أغلب الزوار يصلون إلى صفحات داخلية. والشريط بعرض محدد واحد على كل الموقع إعداد في القالب يستطيع فريق المتجر تفعيله." } },
      },
    },
  },

  "HOME-13": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The homepage value proposition gives a reason specific to this brand: a unique mechanism, origin, quality proof or guarantee." },
          business: { summary: "The homepage says what makes this brand different.", detail: "Visitors see a reason to buy here over a similar store." },
          protect: "Keep the brand's specific claim in the hero when campaign banners change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The homepage value proposition gives no reason specific to this brand: no unique mechanism, origin, quality proof or guarantee. Its claims could sit on any competitor's store." },
          business: { summary: "The homepage doesn't say what makes this brand different.", detail: "When the claims could belong to any store, shoppers compare on price alone or go back to a brand they know." },
          step: "Add one line near the top of the homepage stating what only this brand offers: how the product is made, where it comes from, proof of quality or a guarantee. Back it with a detail the shopper can check.",
          doneWhen: "The homepage's first screens state a reason to buy that is specific to this brand, such as its origin, method, quality proof or guarantee.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your homepage doesn't say what makes you different.", detail: "If your claims sound like any other store, customers compare on price or buy from a name they already know." } },
      },
      media_buyer: {
        fail: { business: { summary: "Home doesn't say why this brand over others, so cold traffic compares on price.", detail: "Without a specific reason to choose the brand, cold visitors shop around, which likely lowers CVR and raises CPA. The store owner has to supply the claim before the team can place it on the homepage." } },
      },
      agency: {
        fail: { business: { summary: "The store's homepage doesn't say what makes the brand different.", detail: "Generic claims push shoppers to compare on price. The client needs to name what only they offer before it can go on the homepage." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "عرض القيمة في الصفحة الرئيسية يقدم سببًا خاصًا بهذه العلامة: طريقة فريدة، أو منشأ، أو إثبات جودة، أو ضمان." },
          business: { summary: "الصفحة الرئيسية تقول ما يميز هذه العلامة.", detail: "يرى الزائر سببًا للشراء من هنا بدل متجر مشابه." },
          protect: "أبقِ ميزة العلامة الخاصة في الواجهة عند تغيير لافتات الحملات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "عرض القيمة في الصفحة الرئيسية لا يقدم سببًا خاصًا بهذه العلامة: لا طريقة فريدة ولا منشأ ولا إثبات جودة ولا ضمان. ويمكن أن تظهر ادعاءاته في متجر أي منافس." },
          business: { summary: "الصفحة الرئيسية لا تقول ما يميز هذه العلامة.", detail: "عندما تصلح الادعاءات لأي متجر، يقارن العميل بالسعر وحده أو يعود إلى علامة يعرفها." },
          step: "أضف سطرًا قرب أعلى الصفحة الرئيسية يذكر ما تقدمه هذه العلامة وحدها: طريقة صنع المنتج، أو منشؤه، أو إثبات جودته، أو ضمان. وادعمه بتفصيل يستطيع العميل التحقق منه.",
          doneWhen: "الشاشات الأولى من الصفحة الرئيسية تذكر سببًا للشراء خاصًا بهذه العلامة، مثل منشئها أو طريقتها أو إثبات جودتها أو ضمانها.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحتك الرئيسية ما تقول وش يميزك.", detail: "إذا كلامك يشبه أي متجر ثاني، العميل يقارن بالسعر أو يشتري من اسم يعرفه." } },
      },
      media_buyer: {
        fail: { business: { summary: "الهوم مش بيقول ليه البراند ده بالذات، فالترافيك البارد بيقارن بالسعر.", detail: "من غير سبب واضح يختار بيه البراند، الزائر البارد بيلف على متاجر تانية، وده غالبًا بيقلل الـ CVR وبيرفع الـ CPA. صاحب المتجر لازم يحدد الميزة الأول، وبعدها الفريق يحطها في الهوم." } },
      },
      agency: {
        fail: { business: { summary: "الصفحة الرئيسية للمتجر لا تقول ما يميز العلامة.", detail: "الادعاءات العامة تدفع العميل إلى المقارنة بالسعر. ويحتاج العميل صاحب المتجر أن يحدد ما يقدمه وحده قبل وضعه في الصفحة الرئيسية." } },
      },
    },
  },
};
