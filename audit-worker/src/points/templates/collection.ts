import type { PointTemplate } from "./types.js";

// Collection points COL-02, 03, 04, 05, 10. Conditions follow collect.ts:
// all read the phone collection page (390x844) and need 4+ product cards.
export const COLLECTION: Record<string, PointTemplate> = {
  "COL-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Of {cards} cards read on the phone collection page, {soldOut} carry a sold-out label, all after the last in-stock card (card {lastInStock})." },
          business: { summary: "Sold-out products are labelled and sit at the end of the collection.", detail: "Shoppers see products they can buy first, so they don't waste their first look on items they can't order." },
          protect: "Keep the collection sorted with sold-out products last when you restock or add new products.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Of {cards} cards read on the phone collection page, {soldOut} carry a sold-out label. The first sold-out card is card {firstSoldOut}, ahead of in-stock card {lastInStock}." },
          business: { summary: "Sold-out products sit among products shoppers can buy.", detail: "Shoppers, often from ads, tap a product they like and find it sold out. Some leave instead of scrolling on to something they could buy." },
          step: "Set the collection to place sold-out products after in-stock ones, or hide them, in the theme or the platform's inventory settings.",
          doneWhen: "On the phone collection page, every card with a sold-out label comes after the last in-stock card, or sold-out products don't show.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Sold-out products are mixed in with the ones customers can buy.", detail: "A customer taps a product they like and finds it sold out. Many leave instead of looking for something else, even when you have it in stock." } },
      },
      media_buyer: {
        fail: { business: { summary: "Sold-out products sit ahead of in-stock ones on the collection, so CVR on collection-page traffic is lower than it could be.", detail: "Paid visitors who tap a sold-out card hit a dead end, and some leave instead of scrolling on, which raises CPA. The owner changes the collection sort or stock display in the store." } },
      },
      agency: {
        fail: { business: { summary: "Sold-out products sit among products shoppers can buy in the store's collection.", detail: "Shoppers, often from ads, tap a product they like and find it sold out. Some leave instead of scrolling on to something they could buy." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "المنتجات النافدة موسومة وتأتي بعد كل المنتجات المتوفرة في صفحة التصنيف.", detail: "من {cards} بطاقة مقروءة في صفحة التصنيف على الجوال، {soldOut} تحمل وسم نفاد، وكلها بعد آخر بطاقة متوفرة (البطاقة {lastInStock})." },
          business: { summary: "المنتجات النافدة موسومة وفي آخر التصنيف.", detail: "يرى العميل أولًا ما يمكنه شراؤه، فلا تضيع نظرته الأولى على منتجات لا يستطيع طلبها." },
          protect: "أبقِ ترتيب التصنيف بحيث تأتي المنتجات النافدة في الآخر عند إعادة التخزين أو إضافة منتجات.",
        },
        fail: {
          technical: { summary: "منتج نافد يظهر قبل منتجات متوفرة في صفحة التصنيف.", detail: "من {cards} بطاقة مقروءة في صفحة التصنيف على الجوال، {soldOut} تحمل وسم نفاد. أول بطاقة نافدة هي البطاقة {firstSoldOut}، قبل البطاقة المتوفرة {lastInStock}." },
          business: { summary: "المنتجات النافدة مختلطة بالمنتجات المتاحة للشراء.", detail: "العميل، وغالبًا قادم من إعلان، يضغط على منتج أعجبه فيجده نافدًا. وبعضهم يغادر بدل أن يكمل التصفح إلى منتج متوفر." },
          step: "اضبط التصنيف ليضع المنتجات النافدة بعد المتوفرة، أو أخفِها، من إعدادات القالب أو المخزون في المنصة.",
          doneWhen: "في صفحة التصنيف على الجوال، كل بطاقة تحمل وسم نفاد تأتي بعد آخر بطاقة متوفرة، أو لا تظهر المنتجات النافدة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "المنتجات الخلصانة مخلوطة مع اللي يقدر العميل يشتريها.", detail: "العميل يضغط على منتج عاجبه ويلقاه خلصان. وكثير منهم يطلعون بدل ما يدورون غيره، حتى لو عندك بديل متوفر." } },
      },
      media_buyer: {
        fail: { business: { summary: "منتجات sold out قبل المتوفرة في الـ collection، فالـ CVR على ترافيك صفحات التصنيف أقل مما ينفع.", detail: "الزائر المدفوع اللي بيدوس على منتج خلصان بيقف، وناس بتمشي بدل ما تكمل، والـ CPA بيعلى. صاحب المتجر يغيّر ترتيب التصنيف أو عرض المخزون." } },
      },
      agency: {
        fail: { business: { summary: "المنتجات النافدة مختلطة بالمنتجات المتاحة في تصنيفات «المتجر».", detail: "العميل، وغالبًا قادم من إعلان، يضغط على منتج أعجبه فيجده نافدًا. وبعضهم يغادر بدل أن يكمل التصفح إلى منتج متوفر." } },
      },
    },
  },
  "COL-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On a phone, a filter or sort control or category chips show above the first product card, and the collection opens sorted by best selling or featured." },
          business: { summary: "Shoppers can narrow the collection on a phone, and the best products come first.", detail: "On a large collection, filters and a good default order help shoppers reach a product they want before they give up." },
          protect: "Keep filters, sort and best-selling order on when you change the theme or add collections.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On a phone, it fails when no filter or sort control sits above the first product card and there are no category chips, or when the collection opens sorted by price, name, date or rating instead of best selling or featured." },
          business: { summary: "Shoppers on phones can't easily narrow the collection, or it opens with the wrong products first.", detail: "On a large collection, shoppers who can't filter or who see random products first scroll a little and leave. The products most likely to sell never get seen." },
          step: "Turn on phone filters and sort above the product grid (or category chips) in the theme, and set the collection's default sort to best selling or featured.",
          doneWhen: "On a phone, a filter or sort control or category chips show above the first product card, and the collection opens sorted by best selling or featured.",
        },
      },
      store_owner: {
        fail: { business: { summary: "On phones, customers can't easily filter your collection, or it doesn't open with your best sellers.", detail: "A customer who can't narrow down a big collection gives up before finding the right product. Showing best sellers first puts your strongest products in front of them." } },
      },
      media_buyer: {
        fail: { business: { summary: "The phone collection has no visible filter, sort or chips, or opens on a weak sort, so CVR on collection-page traffic is lower than it could be.", detail: "Paid visitors landing on a collection need to find a product fast. Without filters or with random order first, more of them bounce, which raises CPA. The owner changes it in the theme settings." } },
      },
      agency: {
        fail: { business: { summary: "Shoppers on phones can't easily narrow the store's collection, or it opens with the wrong products first.", detail: "On a large collection, shoppers who can't filter or who see random products first scroll a little and leave. The products most likely to sell never get seen." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "أدوات الفلترة أو الترتيب أو أزرار التصنيفات ظاهرة فوق المنتجات، والترتيب الافتراضي هو الأكثر مبيعًا أو المميز.", detail: "على الجوال، تظهر أداة فلترة أو ترتيب أو أزرار تصنيفات فوق أول بطاقة منتج، وتُفتح الصفحة مرتبة حسب الأكثر مبيعًا أو المميز." },
          business: { summary: "العميل يضيّق التصنيف على الجوال بسهولة، وأفضل المنتجات تظهر أولًا.", detail: "في التصنيفات الكبيرة، تساعد الفلاتر والترتيب الجيد العميل على الوصول إلى منتج يريده قبل أن يملّ." },
          protect: "أبقِ الفلاتر والترتيب حسب الأكثر مبيعًا مفعّلة عند تغيير القالب أو إضافة تصنيفات.",
        },
        fail: {
          technical: { summary: "لا توجد أداة فلترة أو ترتيب أو أزرار تصنيفات فوق المنتجات على الجوال، أو الترتيب الافتراضي ليس الأكثر مبيعًا أو المميز.", detail: "على الجوال، يفشل البند عندما لا توجد أداة فلترة أو ترتيب فوق أول بطاقة منتج ولا أزرار تصنيفات، أو عندما تُفتح الصفحة مرتبة حسب السعر أو الاسم أو التاريخ أو التقييم بدل الأكثر مبيعًا أو المميز." },
          business: { summary: "العميل على الجوال لا يستطيع تضييق التصنيف بسهولة، أو تُفتح الصفحة بمنتجات غير مناسبة أولًا.", detail: "في التصنيفات الكبيرة، العميل الذي لا يجد فلترًا أو يرى منتجات عشوائية أولًا يمرّر قليلًا ثم يغادر. فلا تُرى المنتجات الأقرب للبيع." },
          step: "فعّل الفلاتر والترتيب فوق شبكة المنتجات على الجوال (أو أزرار التصنيفات) من إعدادات القالب، واجعل الترتيب الافتراضي الأكثر مبيعًا أو المميز.",
          doneWhen: "على الجوال، تظهر أداة فلترة أو ترتيب أو أزرار تصنيفات فوق أول بطاقة منتج، وتُفتح الصفحة مرتبة حسب الأكثر مبيعًا أو المميز.",
        },
      },
      store_owner: {
        fail: { business: { summary: "على الجوال، عميلك ما يقدر يفلتر التصنيف بسهولة، أو الصفحة ما تبدأ بالأكثر مبيعًا.", detail: "العميل اللي ما يقدر يضيّق تصنيف كبير يمل قبل ما يلقى المنتج المناسب. وعرض الأكثر مبيعًا أول يحط أقوى منتجاتك قدامه." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة الـ collection على الموبايل من غير filter أو sort أو chips ظاهرة، أو بتفتح على ترتيب ضعيف، فالـ CVR على ترافيك صفحات التصنيف أقل مما ينفع.", detail: "الزائر المدفوع اللي نازل على collection محتاج يلاقي منتج بسرعة. من غير فلاتر أو مع ترتيب عشوائي ناس أكتر بتعمل bounce، والـ CPA بيعلى. صاحب المتجر يغيّرها من إعدادات القالب." } },
      },
      agency: {
        fail: { business: { summary: "العميل على الجوال لا يستطيع تضييق تصنيفات «المتجر» بسهولة، أو تُفتح بمنتجات غير مناسبة أولًا.", detail: "في التصنيفات الكبيرة، العميل الذي لا يجد فلترًا أو يرى منتجات عشوائية أولًا يمرّر قليلًا ثم يغادر. فلا تُرى المنتجات الأقرب للبيع." } },
      },
    },
  },
  "COL-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On a 390x844 phone screen, the first product card's top sits {firstCardTop}px down, inside the {screen}px first screen." },
          business: { summary: "Products show as soon as the collection page opens on a phone.", detail: "Shoppers see what's on offer right away, without scrolling past banners first." },
          protect: "Keep banners and text above the grid short on phones when you update collections.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On a 390x844 phone screen, the first product card's top sits {firstCardTop}px down, past the {screen}px first screen. Banners, text or filters above the grid push it out of view." },
          business: { summary: "On phones, shoppers see no products until they scroll the collection page.", detail: "The first screen is spent on a banner or text instead of products. Shoppers who expected products, often from an ad, leave before scrolling." },
          step: "Shrink or remove the banner and text above the product grid on phones so the first row starts in the first screen.",
          doneWhen: "On a 390x844 phone screen, the first product row starts less than 844px down the collection page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "On phones, your collection page shows no products until the customer scrolls.", detail: "The first thing customers see is a banner or text. Many expected products and leave before scrolling down to them." } },
      },
      media_buyer: {
        fail: { business: { summary: "The phone collection page shows no product in the first screen, so CVR on collection-page traffic is lower than it could be.", detail: "Paid visitors who land on a banner instead of products bounce faster, and CPA rises on the same spend. The owner or developer trims what sits above the grid." } },
      },
      agency: {
        fail: { business: { summary: "On phones, the store's collection page shows no products until shoppers scroll.", detail: "The first screen is spent on a banner or text instead of products. Shoppers who expected products, often from an ad, leave before scrolling." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "أول صف منتجات يظهر في الشاشة الأولى لصفحة التصنيف على الجوال.", detail: "على شاشة جوال 390x844، أعلى أول بطاقة منتج عند {firstCardTop} بكسل، داخل الشاشة الأولى ({screen} بكسل)." },
          business: { summary: "المنتجات تظهر فور فتح صفحة التصنيف على الجوال.", detail: "يرى العميل المعروض مباشرة دون أن يمرّر أولًا فوق البانرات." },
          protect: "أبقِ البانرات والنصوص فوق الشبكة قصيرة على الجوال عند تحديث التصنيفات.",
        },
        fail: {
          technical: { summary: "أول صف منتجات يبدأ تحت الشاشة الأولى لصفحة التصنيف على الجوال.", detail: "على شاشة جوال 390x844، أعلى أول بطاقة منتج عند {firstCardTop} بكسل، بعد الشاشة الأولى ({screen} بكسل). البانرات أو النصوص أو الفلاتر فوق الشبكة تدفعه خارج الشاشة." },
          business: { summary: "على الجوال، لا يرى العميل أي منتج قبل أن يمرّر صفحة التصنيف.", detail: "الشاشة الأولى تذهب لبانر أو نص بدل المنتجات. والعميل الذي توقّع منتجات، وغالبًا قادم من إعلان، يغادر قبل التمرير." },
          step: "صغّر البانر والنص فوق شبكة المنتجات على الجوال أو احذفهما ليبدأ أول صف في الشاشة الأولى.",
          doneWhen: "على شاشة جوال 390x844، يبدأ أول صف منتجات قبل 844 بكسل من أعلى صفحة التصنيف.",
        },
      },
      store_owner: {
        fail: { business: { summary: "على الجوال، صفحة التصنيف عندك ما تبين أي منتج إلا لما العميل ينزل.", detail: "أول شي يشوفه العميل بانر أو كلام. وكثير منهم كانوا يبون منتجات ويطلعون قبل ما ينزلون لها." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة الـ collection على الموبايل مفيهاش منتج في أول شاشة، فالـ CVR على ترافيك صفحات التصنيف أقل مما ينفع.", detail: "الزائر المدفوع اللي بينزل على بانر بدل منتجات بيعمل bounce أسرع، والـ CPA بيعلى على نفس الصرف. صاحب المتجر أو المطوّر يقلّل اللي فوق الشبكة." } },
      },
      agency: {
        fail: { business: { summary: "على الجوال، لا تعرض صفحة التصنيف لدى «المتجر» أي منتج قبل التمرير.", detail: "الشاشة الأولى تذهب لبانر أو نص بدل المنتجات. والعميل الذي توقّع منتجات، وغالبًا قادم من إعلان، يغادر قبل التمرير." } },
      },
    },
  },
  "COL-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Of {cards} cards on the phone collection page: {withImage} with an image, {withName} with a name, {withPrice} with a price and currency." },
          business: { summary: "Every product card shows a photo, a name and a price.", detail: "Shoppers can compare products straight from the collection without opening each one." },
          protect: "Check new products have a photo and price before they go live in a collection.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Of {cards} cards on the phone collection page: {withImage} with an image, {withName} with a name, {withPrice} with a price and currency. Every card needs all three." },
          business: { summary: "Some product cards are missing a photo, a name or a price.", detail: "Shoppers can't compare what they can't see. Cards without a price or photo get skipped, or force a tap that many shoppers won't make." },
          step: "Ask your developer to show an image, the product name and a price with currency on every product card (From X for products with options).",
          doneWhen: "Every product card on the phone collection page shows an image, a name and a price with currency.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some of your product cards have no photo, name or price.", detail: "Customers skip products they can't judge at a glance. A card with no price makes many think it's expensive or unavailable." } },
      },
      media_buyer: {
        fail: { business: { summary: "Collection cards are missing a price, name or image, so CVR on collection-page campaigns reads lower.", detail: "Paid visitors who can't compare prices on the collection drop off instead of opening each product, which raises CPA. The developer fixes the card template in the theme." } },
      },
      agency: {
        fail: { business: { summary: "Some of the store's product cards are missing a photo, a name or a price.", detail: "Shoppers can't compare what they can't see. Cards without a price or photo get skipped, or force a tap that many shoppers won't make." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل بطاقات المنتجات في صفحة التصنيف تعرض صورة واسمًا وسعرًا بعملة.", detail: "من {cards} بطاقة في صفحة التصنيف على الجوال: {withImage} بصورة، و{withName} باسم، و{withPrice} بسعر وعملة." },
          business: { summary: "كل بطاقة منتج تعرض صورة واسمًا وسعرًا.", detail: "يقارن العميل المنتجات من صفحة التصنيف مباشرة دون فتح كل منتج." },
          protect: "تأكد أن لكل منتج جديد صورة وسعرًا قبل نشره في أي تصنيف.",
        },
        fail: {
          technical: { summary: "بعض بطاقات المنتجات في صفحة التصنيف بلا صورة أو اسم أو سعر بعملة.", detail: "من {cards} بطاقة في صفحة التصنيف على الجوال: {withImage} بصورة، و{withName} باسم، و{withPrice} بسعر وعملة. كل بطاقة تحتاج الثلاثة." },
          business: { summary: "بعض بطاقات المنتجات تنقصها صورة أو اسم أو سعر.", detail: "لا يستطيع العميل مقارنة ما لا يراه. البطاقات بلا سعر أو صورة يتجاوزها، أو تتطلب نقرة لا يقوم بها كثيرون." },
          step: "اطلب من المطوّر عرض صورة واسم المنتج وسعر بعملة على كل بطاقة منتج (يبدأ من X للمنتجات ذات الخيارات).",
          doneWhen: "كل بطاقة منتج في صفحة التصنيف على الجوال تعرض صورة واسمًا وسعرًا بعملة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض بطاقات منتجاتك ما فيها صورة أو اسم أو سعر.", detail: "العميل يتجاوز المنتج اللي ما يقدر يحكم عليه من نظرة. والبطاقة اللي بدون سعر تخلي كثير يحسبونه غالي أو مو متوفر." } },
      },
      media_buyer: {
        fail: { business: { summary: "بطاقات الـ collection ناقصها سعر أو اسم أو صورة، فالـ CVR على حملات صفحات التصنيف أقل.", detail: "الزائر المدفوع اللي مش قادر يقارن الأسعار في الـ collection بيمشي بدل ما يفتح كل منتج، والـ CPA بيعلى. المطوّر يصلّح قالب البطاقة في الثيم." } },
      },
      agency: {
        fail: { business: { summary: "بعض بطاقات المنتجات لدى «المتجر» تنقصها صورة أو اسم أو سعر.", detail: "لا يستطيع العميل مقارنة ما لا يراه. البطاقات بلا سعر أو صورة يتجاوزها، أو تتطلب نقرة لا يقوم بها كثيرون." } },
      },
    },
  },
  "COL-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The first row of the phone collection grid holds {columns} cards side by side on a 390px screen." },
          business: { summary: "The phone collection shows 2 products per row.", detail: "Shoppers see enough products per screen while photos and prices stay easy to read." },
          protect: "Keep the phone grid at 2 columns when you change the theme.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The first row of the phone collection grid holds {columns} card(s) on a 390px screen. One column makes shoppers scroll far to see a few products; 3 or more shrink photos and prices." },
          business: { summary: "The phone collection grid doesn't show 2 products per row.", detail: "With one per row, shoppers see very few products before they tire of scrolling. With three or more, photos and prices get too small to judge." },
          step: "In the theme settings, set the phone collection grid to 2 columns.",
          doneWhen: "The first row of the phone collection grid shows 2 product cards side by side.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your collection on phones doesn't show 2 products per row.", detail: "With one per row, customers see few products and stop scrolling. With more than two, photos and prices are too small to judge." } },
      },
      media_buyer: {
        fail: { business: { summary: "The phone collection grid isn't 2 columns, so CVR on collection-page traffic is lower than it could be.", detail: "Paid visitors browse fewer products per screen, or can't read them, and more leave without opening one, which raises CPA. The owner changes the grid in the theme settings." } },
      },
      agency: {
        fail: { business: { summary: "The store's phone collection grid doesn't show 2 products per row.", detail: "With one per row, shoppers see very few products before they tire of scrolling. With three or more, photos and prices get too small to judge." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "شبكة صفحة التصنيف على الجوال بعمودين.", detail: "أول صف في شبكة التصنيف على الجوال يضم {columns} بطاقة جنبًا إلى جنب على شاشة عرضها 390 بكسل." },
          business: { summary: "صفحة التصنيف على الجوال تعرض منتجين في كل صف.", detail: "يرى العميل عددًا كافيًا من المنتجات في كل شاشة، مع صور وأسعار سهلة القراءة." },
          protect: "أبقِ شبكة الجوال بعمودين عند تغيير القالب.",
        },
        fail: {
          technical: { summary: "شبكة صفحة التصنيف على الجوال ليست بعمودين.", detail: "أول صف في شبكة التصنيف على الجوال يضم {columns} بطاقة على شاشة عرضها 390 بكسل. العمود الواحد يجبر العميل على تمرير طويل لرؤية منتجات قليلة، و3 أعمدة أو أكثر تصغّر الصور والأسعار." },
          business: { summary: "شبكة التصنيف على الجوال لا تعرض منتجين في كل صف.", detail: "بمنتج واحد في الصف، يرى العميل منتجات قليلة جدًا قبل أن يملّ التمرير. وبثلاثة أو أكثر، تصغر الصور والأسعار فيصعب الحكم عليها." },
          step: "من إعدادات القالب، اجعل شبكة التصنيف على الجوال بعمودين.",
          doneWhen: "أول صف في شبكة التصنيف على الجوال يعرض بطاقتي منتج جنبًا إلى جنب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة التصنيف عندك على الجوال ما تعرض منتجين في كل صف.", detail: "بمنتج واحد في الصف، العميل يشوف منتجات قليلة ويوقف. وبأكثر من اثنين، الصور والأسعار تصير صغيرة وما يقدر يحكم عليها." } },
      },
      media_buyer: {
        fail: { business: { summary: "شبكة الـ collection على الموبايل مش عمودين، فالـ CVR على ترافيك صفحات التصنيف أقل مما ينفع.", detail: "الزائر المدفوع بيشوف منتجات أقل في كل شاشة، أو مش قادر يقراها، وناس أكتر بتمشي من غير ما تفتح منتج، والـ CPA بيعلى. صاحب المتجر يغيّر الشبكة من إعدادات القالب." } },
      },
      agency: {
        fail: { business: { summary: "شبكة التصنيف لدى «المتجر» على الجوال لا تعرض منتجين في كل صف.", detail: "بمنتج واحد في الصف، يرى العميل منتجات قليلة جدًا قبل أن يملّ التمرير. وبثلاثة أو أكثر، تصغر الصور والأسعار فيصعب الحكم عليها." } },
      },
    },
  },
};
