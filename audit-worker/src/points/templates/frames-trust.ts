import type { PointTemplate } from "./types.js";

// Frames for AI-judged points: fixed text, the AI's finding in {observation} (types.ts).
export const FRAMES_TRUST: Record<string, PointTemplate> = {
  "TRUST-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A returns page loads from the footer of home, product and cart, states the return window and who pays, and the product page or cart mentions returns." },
          business: { summary: "Your return policy is easy to find and clear.", detail: "A first-time shopper can see how returns work before paying, which takes away a common reason to hold back." },
          protect: "Keep the footer link and the returns line near Add to cart when you change theme or policy.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked that a returns page loads from the footer of home, product and cart, that it states the return window and who pays, and that the product page or cart mentions returns. At least one of these is missing." },
          business: { summary: "Your return policy is hard to find or leaves out the key terms.", detail: "A shopper who doesn't know the store wants to know they can send it back and who pays for that. When the answer is missing or buried, many leave before buying." },
          step: "Publish a short return and exchange policy that states the window in days and who pays for the return, in Arabic and English. Link it in the footer, and add one line near Add to cart, for example 'Exchange within X days'.",
          doneWhen: "The footer on home, product and cart links to a returns page that states the window and who pays, and the product page or cart mentions returns.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Shoppers can't easily find your return terms.", detail: "Someone buying from you for the first time wants to know they can return or exchange, and who pays for it. If they can't find that, many leave without ordering." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers can't see clear return terms, which likely holds CVR down.", detail: "Cold traffic from ads weighs the risk of buying from a store it doesn't know. Missing or buried return terms lose some of those clicks, which raises CPA. Forward this to the store owner: it is a policy page and one line on the product page." } },
      },
      agency: {
        pass: { business: { summary: "The store's return policy is easy to find and clear.", detail: "A first-time shopper can see how returns work before paying, which takes away a common reason to hold back." } },
        fail: { business: { summary: "The store's return policy is hard to find or leaves out the key terms.", detail: "A shopper who doesn't know the store wants to know they can send it back and who pays for that. When the answer is missing or buried, many leave before buying." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "صفحة الاسترجاع تفتح من تذييل الرئيسية والمنتج والسلة، وتذكر مدة الاسترجاع ومن يدفع تكلفته، وصفحة المنتج أو السلة تذكر الاسترجاع." },
          business: { summary: "سياسة الاسترجاع سهلة الوصول وواضحة.", detail: "العميل الجديد يعرف كيف يعمل الاسترجاع قبل الدفع، وهذا يزيل سببًا شائعًا للتردد." },
          protect: "أبقِ رابط التذييل وسطر الاسترجاع قرب زر الإضافة للسلة عند تغيير القالب أو السياسة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا أن صفحة الاسترجاع تفتح من تذييل الرئيسية والمنتج والسلة، وأنها تذكر مدة الاسترجاع ومن يدفع تكلفته، وأن صفحة المنتج أو السلة تذكر الاسترجاع. أحد هذه العناصر غير موجود." },
          business: { summary: "سياسة الاسترجاع صعبة الوصول أو تنقصها الشروط الأساسية.", detail: "العميل الذي لا يعرف المتجر يريد أن يعرف أنه يستطيع الإرجاع ومن يدفع تكلفته. عندما تغيب الإجابة أو تكون مخفية، يغادر كثيرون قبل الشراء." },
          step: "انشر سياسة استرجاع واستبدال قصيرة تذكر المدة بالأيام ومن يدفع تكلفة الإرجاع، بالعربية والإنجليزية. ضع رابطها في التذييل، وأضف سطرًا قرب زر الإضافة للسلة مثل «استبدال خلال X يوم».",
          doneWhen: "تذييل الرئيسية والمنتج والسلة يربط بصفحة استرجاع تذكر المدة ومن يدفع، وصفحة المنتج أو السلة تذكر الاسترجاع.",
        },
      },
      store_owner: {
        pass: { business: { summary: "سياسة الاسترجاع في متجرك واضحة وسهل يلقاها العميل.", detail: "العميل اللي أول مرة يشتري منك يعرف كيف يرجّع قبل ما يدفع، وهذا يشيل عنه التردد." } },
        fail: { business: { summary: "العميل ما يلقى شروط الاسترجاع في متجرك بسهولة.", detail: "اللي يشتري منك أول مرة يبي يعرف إنه يقدر يرجّع أو يبدّل، ومين يتحمل تكلفة الإرجاع. إذا ما لقى هالشي، كثير منهم يطلعون بدون طلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين مش شايفين شروط استرجاع واضحة، وده غالبًا بيقلل الـ CVR.", detail: "الترافيك البارد من الإعلانات بيحسبها قبل ما يشتري من متجر ميعرفوش. شروط الاسترجاع الناقصة أو المستخبية بتضيّع جزء من الكليكات دي وبترفع الـ CPA. ابعت النقطة دي لصاحب المتجر: صفحة سياسة وسطر واحد في صفحة المنتج." } },
      },
      agency: {
        pass: { business: { summary: "سياسة الاسترجاع في المتجر سهلة الوصول وواضحة.", detail: "العميل الجديد يعرف كيف يعمل الاسترجاع قبل الدفع، وهذا يزيل سببًا شائعًا للتردد." } },
        fail: { business: { summary: "سياسة الاسترجاع في المتجر صعبة الوصول أو تنقصها الشروط الأساسية.", detail: "العميل الذي لا يعرف المتجر يريد أن يعرف أنه يستطيع الإرجاع ومن يدفع تكلفته. عندما تغيب الإجابة أو تكون مخفية، يغادر كثيرون قبل الشراء." } },
      },
    },
  },

  "TRUST-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Product reviews come from a review app, carry dates, include some customer photos, and show a mix of ratings." },
          business: { summary: "Your reviews look like they come from real buyers.", detail: "Dates, photos and a mix of ratings are what make a shopper believe the reviews and act on them." },
          protect: "Keep asking recent buyers for reviews with a photo, and leave lower ratings visible.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked that product reviews come from a review app, carry dates, include some customer photos, and are not all 5 stars. At least one of these is missing." },
          business: { summary: "Your reviews are hard to believe.", detail: "Shoppers have learned to spot reviews that look written by the store: no dates, no photos, every one 5 stars. Reviews that look fake don't reassure, and can make a shopper trust the store less." },
          step: "Collect reviews through a review app that shows the date and lets buyers add photos. Ask recent buyers for a review with a photo, for example by WhatsApp after delivery, and leave honest lower ratings visible.",
          doneWhen: "Reviews on the product page show names, dates and some photos, with a mix of ratings.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your reviews look like they may not be real.", detail: "Shoppers can tell when reviews have no dates, no photos and are all 5 stars. Instead of reassuring them, those reviews make them doubt the store." } },
      },
      media_buyer: {
        fail: { business: { summary: "The reviews paid shoppers see look unverified, so they likely do little for CVR.", detail: "Cold traffic checks reviews before buying from a new store. Reviews with no dates, no photos or only 5 stars don't convince, so product ad clicks convert less and CPA rises. Forward this to the store owner: it is a review app setting and a habit of asking buyers." } },
      },
      agency: {
        pass: { business: { summary: "The store's reviews look like they come from real buyers.", detail: "Dates, photos and a mix of ratings are what make a shopper believe the reviews and act on them." } },
        fail: { business: { summary: "The store's reviews are hard to believe.", detail: "Shoppers have learned to spot reviews that look written by the store: no dates, no photos, every one 5 stars. Reviews that look fake don't reassure, and can make a shopper trust the store less." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "تقييمات المنتجات تأتي من تطبيق تقييمات، ومؤرخة، وفيها بعض صور العملاء، وتتنوع درجاتها." },
          business: { summary: "التقييمات تبدو من مشترين حقيقيين.", detail: "التواريخ والصور وتنوع الدرجات هي ما يجعل العميل يصدّق التقييمات ويتصرف بناءً عليها." },
          protect: "استمر في طلب تقييمات بالصور من المشترين الجدد، وأبقِ التقييمات الأقل ظاهرة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا أن تقييمات المنتجات تأتي من تطبيق تقييمات، ومؤرخة، وفيها بعض صور العملاء، وليست كلها 5 نجوم. أحد هذه العناصر غير موجود." },
          business: { summary: "التقييمات يصعب تصديقها.", detail: "العملاء يميزون التقييمات التي تبدو مكتوبة من المتجر: بلا تواريخ، بلا صور، وكلها 5 نجوم. التقييمات التي تبدو مزيفة لا تطمئن العميل، وقد تقلل ثقته بالمتجر." },
          step: "اجمع التقييمات عبر تطبيق تقييمات يعرض التاريخ ويسمح للمشترين بإضافة صور. اطلب من المشترين الجدد تقييمًا بصورة، مثلًا عبر واتساب بعد التوصيل، وأبقِ التقييمات الأقل الصادقة ظاهرة.",
          doneWhen: "التقييمات في صفحة المنتج تعرض الأسماء والتواريخ وبعض الصور، مع تنوع في الدرجات.",
        },
      },
      store_owner: {
        pass: { business: { summary: "التقييمات في متجرك باينة إنها من عملاء حقيقيين.", detail: "التاريخ والصور وتنوع النجوم يخلي العميل يصدّق التقييمات ويشتري." } },
        fail: { business: { summary: "التقييمات في متجرك ممكن تبين إنها مو حقيقية.", detail: "العميل يعرف إذا التقييمات بدون تاريخ ولا صور وكلها 5 نجوم. بدل ما تطمّنه، تخليه يشك في المتجر." } },
      },
      media_buyer: {
        fail: { business: { summary: "التقييمات اللي الزوار المدفوعين بيشوفوها شكلها مش موثوق، فغالبًا مش بتفيد الـ CVR.", detail: "الترافيك البارد بيبص على التقييمات قبل ما يشتري من متجر جديد. تقييمات من غير تاريخ ولا صور أو كلها 5 نجوم مش بتقنع، فكليكات إعلانات المنتجات بتحوّل أقل والـ CPA بيعلى. ابعت النقطة دي لصاحب المتجر: إعداد في تطبيق التقييمات وعادة إنه يطلب تقييمات من المشترين." } },
      },
      agency: {
        pass: { business: { summary: "تقييمات المتجر تبدو من مشترين حقيقيين.", detail: "التواريخ والصور وتنوع الدرجات هي ما يجعل العميل يصدّق التقييمات ويتصرف بناءً عليها." } },
        fail: { business: { summary: "تقييمات المتجر يصعب تصديقها.", detail: "العملاء يميزون التقييمات التي تبدو مكتوبة من المتجر: بلا تواريخ، بلا صور، وكلها 5 نجوم. التقييمات التي تبدو مزيفة لا تطمئن العميل، وقد تقلل ثقته بالمتجر." } },
      },
    },
  },

  "TRUST-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The first phone screen of the home page shows a star rating with a number, a customer count, or a short named testimonial." },
          business: { summary: "Your home page shows proof from other buyers right away.", detail: "A new visitor sees that others bought and liked the store before scrolling, which gives them a reason to keep looking." },
          protect: "Keep the rating or testimonial in the first screen when you change the home banner.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the first phone screen of the home page for a star rating with a number, a customer count, or a short named testimonial. None of these shows there." },
          business: { summary: "Your home page opens with no proof that others bought.", detail: "Most new visitors decide in the first screen whether the store is worth their time. Without a sign that others bought and were happy, more of them leave without scrolling." },
          step: "Add a short proof line to the top of the home page on phone, for example the store rating with the number of reviews, the number of customers served, or one short testimonial with the buyer's name.",
          doneWhen: "On a phone, the home page shows a rating with a number, a customer count or a named testimonial without scrolling.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The top of your home page doesn't show that others bought from you.", detail: "A new visitor decides fast whether to trust your store. A rating or a customer's words at the top gives them that reason; without it, more of them leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors landing on home see no social proof up front, which likely lowers CVR.", detail: "Cold traffic sent to the home page decides in the first screen. With no rating or testimonial there, more clicks bounce and CPA on home-page campaigns rises. Forward this to the store owner or developer: it is one line at the top of the home page." } },
      },
      agency: {
        pass: { business: { summary: "The store's home page shows proof from other buyers right away.", detail: "A new visitor sees that others bought and liked the store before scrolling, which gives them a reason to keep looking." } },
        fail: { business: { summary: "The store's home page opens with no proof that others bought.", detail: "Most new visitors decide in the first screen whether the store is worth their time. Without a sign that others bought and were happy, more of them leave without scrolling." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الشاشة الأولى للصفحة الرئيسية على الجوال تعرض تقييمًا بالنجوم مع رقم، أو عدد العملاء، أو رأي عميل قصيرًا باسمه." },
          business: { summary: "الصفحة الرئيسية تعرض دليلًا من المشترين من البداية.", detail: "الزائر الجديد يرى أن غيره اشترى ورضي قبل أن ينزل في الصفحة، وهذا يعطيه سببًا ليكمل التصفح." },
          protect: "أبقِ التقييم أو رأي العميل في الشاشة الأولى عند تغيير بانر الصفحة الرئيسية.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا الشاشة الأولى للصفحة الرئيسية على الجوال بحثًا عن تقييم بالنجوم مع رقم، أو عدد العملاء، أو رأي عميل قصير باسمه. لا يظهر أي منها." },
          business: { summary: "الصفحة الرئيسية تبدأ بلا أي دليل على أن غيرك اشترى.", detail: "معظم الزوار الجدد يقررون من الشاشة الأولى هل المتجر يستحق وقتهم. بدون إشارة إلى أن آخرين اشتروا ورضوا، يغادر عدد أكبر منهم دون أن ينزل في الصفحة." },
          step: "أضف سطر دليل قصيرًا أعلى الصفحة الرئيسية على الجوال، مثل تقييم المتجر مع عدد التقييمات، أو عدد العملاء، أو رأي عميل قصير باسمه.",
          doneWhen: "على الجوال، تعرض الصفحة الرئيسية تقييمًا مع رقم أو عدد العملاء أو رأي عميل باسمه دون تمرير.",
        },
      },
      store_owner: {
        pass: { business: { summary: "أول ما يفتح العميل متجرك يشوف إن غيره اشترى ورضي.", detail: "هالشي يعطي الزائر الجديد سبب يكمل ويتصفح." } },
        fail: { business: { summary: "أعلى الصفحة الرئيسية في متجرك ما يبيّن إن أحد اشترى منك.", detail: "الزائر الجديد يقرر بسرعة إذا يثق في متجرك. تقييم أو كلام عميل في الأعلى يعطيه هالسبب، وبدونه كثير يطلعون." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين اللي بينزلوا على الهوم مش شايفين أي social proof في الأول، وده غالبًا بيقلل الـ CVR.", detail: "الترافيك البارد اللي رايح للهوم بيقرر من أول شاشة. من غير تقييم أو رأي عميل هناك، كليكات أكتر بتعمل bounce والـ CPA على حملات الهوم بيعلى. ابعت النقطة دي لصاحب المتجر أو المطوّر: سطر واحد فوق في الهوم." } },
      },
      agency: {
        pass: { business: { summary: "الصفحة الرئيسية للمتجر تعرض دليلًا من المشترين من البداية.", detail: "الزائر الجديد يرى أن غيره اشترى ورضي قبل أن ينزل في الصفحة، وهذا يعطيه سببًا ليكمل التصفح." } },
        fail: { business: { summary: "الصفحة الرئيسية للمتجر تبدأ بلا أي دليل على أن آخرين اشتروا.", detail: "معظم الزوار الجدد يقررون من الشاشة الأولى هل المتجر يستحق وقتهم. بدون إشارة إلى أن آخرين اشتروا ورضوا، يغادر عدد أكبر منهم دون أن ينزل في الصفحة." } },
      },
    },
  },

  "TRUST-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A money-back, return or exchange guarantee line sits in the product buy box, next to Add to cart." },
          business: { summary: "Your product page reassures shoppers right at the buy button.", detail: "A shopper about to add to cart sees they can return or exchange, at the moment doubt is highest." },
          protect: "Keep the guarantee line in the buy box when you change theme or product page layout.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product buy box for a money-back, return or exchange guarantee line next to Add to cart. None sits there." },
          business: { summary: "Your product page says nothing about returns at the buy button.", detail: "Doubt peaks just before adding to cart. A shopper who has to search the footer for the return terms often gives up instead." },
          step: "Add one short line under or beside Add to cart, for example 'Free exchange within X days', with a link to the full policy. Use the window and terms the store actually offers.",
          doneWhen: "A returns or guarantee line is visible within one screen of Add to cart on the product page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Next to your Add to cart button, nothing tells shoppers they can return or exchange.", detail: "That is the moment they hesitate most. One line saying they can exchange or return helps them go ahead and order." } },
      },
      media_buyer: {
        fail: { business: { summary: "No guarantee line by the buy button, so paid product page visitors likely convert less.", detail: "Cold shoppers from product ads hesitate right at Add to cart. A missing return or guarantee line there holds CVR down and raises CPA. Forward this to the store owner: it is one line of text on the product page." } },
      },
      agency: {
        pass: { business: { summary: "The store's product page reassures shoppers right at the buy button.", detail: "A shopper about to add to cart sees they can return or exchange, at the moment doubt is highest." } },
        fail: { business: { summary: "The store's product page says nothing about returns at the buy button.", detail: "Doubt peaks just before adding to cart. A shopper who has to search the footer for the return terms often gives up instead." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "سطر ضمان استرداد أو إرجاع أو استبدال موجود في منطقة الشراء بجانب زر الإضافة للسلة." },
          business: { summary: "صفحة المنتج تطمئن العميل عند زر الشراء مباشرة.", detail: "العميل الذي يوشك على الإضافة للسلة يرى أنه يستطيع الإرجاع أو الاستبدال، في لحظة أعلى تردد." },
          protect: "أبقِ سطر الضمان في منطقة الشراء عند تغيير القالب أو تصميم صفحة المنتج.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا منطقة الشراء في صفحة المنتج بحثًا عن سطر ضمان استرداد أو إرجاع أو استبدال بجانب زر الإضافة للسلة. لا يوجد." },
          business: { summary: "صفحة المنتج لا تذكر الاسترجاع عند زر الشراء.", detail: "التردد يبلغ أقصاه قبل الإضافة للسلة مباشرة. العميل الذي يضطر للبحث في التذييل عن شروط الاسترجاع كثيرًا ما يتوقف." },
          step: "أضف سطرًا قصيرًا تحت زر الإضافة للسلة أو بجانبه، مثل «استبدال مجاني خلال X يوم»، مع رابط للسياسة الكاملة. استخدم المدة والشروط التي يقدمها المتجر فعلًا.",
          doneWhen: "سطر استرجاع أو ضمان يظهر ضمن شاشة واحدة من زر الإضافة للسلة في صفحة المنتج.",
        },
      },
      store_owner: {
        pass: { business: { summary: "جنب زر أضف للسلة في متجرك سطر يطمّن العميل إنه يقدر يرجّع.", detail: "هذي اللحظة اللي يتردد فيها العميل أكثر شي، والسطر هذا يساعده يكمل." } },
        fail: { business: { summary: "جنب زر أضف للسلة في متجرك ما فيه شي يقول للعميل إنه يقدر يرجّع أو يبدّل.", detail: "هذي اللحظة اللي يتردد فيها أكثر شي. سطر واحد يقول إنه يقدر يبدّل أو يرجّع يساعده يكمل الطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش سطر ضمان جنب زرار الشراء، فزوار صفحة المنتج المدفوعين غالبًا بيحوّلوا أقل.", detail: "الشوبر البارد الجاي من إعلانات المنتجات بيتردد عند Add to cart بالظبط. غياب سطر الاسترجاع أو الضمان هناك بيقلل الـ CVR وبيرفع الـ CPA. ابعت النقطة دي لصاحب المتجر: سطر نص واحد في صفحة المنتج." } },
      },
      agency: {
        pass: { business: { summary: "صفحة المنتج في المتجر تطمئن العميل عند زر الشراء مباشرة.", detail: "العميل الذي يوشك على الإضافة للسلة يرى أنه يستطيع الإرجاع أو الاستبدال، في لحظة أعلى تردد." } },
        fail: { business: { summary: "صفحة المنتج في المتجر لا تذكر الاسترجاع عند زر الشراء.", detail: "التردد يبلغ أقصاه قبل الإضافة للسلة مباشرة. العميل الذي يضطر للبحث في التذييل عن شروط الاسترجاع كثيرًا ما يتوقف." } },
      },
    },
  },

  "TRUST-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Near the cart checkout button, at least 2 of these show: returns note, guarantee, delivery promise, secure payment icons, support contact." },
          business: { summary: "Your cart reassures shoppers right before checkout.", detail: "Shoppers see how they can pay, what happens if something goes wrong, or how to reach you, at the step where many drop off." },
          protect: "Re-check the cart after theme or app changes, since cart apps often move or hide these lines.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked near the cart checkout button for at least 2 of: returns note, guarantee, delivery promise, secure payment icons, support contact. Fewer than 2 show." },
          business: { summary: "Your cart gives shoppers little reason to feel safe going to checkout.", detail: "The cart is where many shoppers stop and think twice. Without payment icons, a returns or delivery note, or a way to reach you, more of them leave with a full cart." },
          step: "Add at least 2 of these next to the checkout button: the payment method icons the store accepts, a short returns or exchange line, the delivery time, or a WhatsApp support link.",
          doneWhen: "The cart shows at least 2 of: payment icons, a returns or guarantee line, a delivery promise, or a support contact, next to the checkout button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart doesn't reassure shoppers before they go to pay.", detail: "Many shoppers stop at the cart and hesitate. Showing how they can pay, how returns work or how to reach you helps more of them finish the order." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers reach the cart and find few trust signals, so cart-to-checkout likely drops.", detail: "Shoppers you already paid to bring this far hesitate at the cart. Missing payment icons, returns or support lines there lose some of them, which lowers CVR and raises CPA. Forward this to the store owner or developer: it is a cart page change." } },
      },
      agency: {
        pass: { business: { summary: "The store's cart reassures shoppers right before checkout.", detail: "Shoppers see how they can pay, what happens if something goes wrong, or how to reach the store, at the step where many drop off." } },
        fail: { business: { summary: "The store's cart gives shoppers little reason to feel safe going to checkout.", detail: "The cart is where many shoppers stop and think twice. Without payment icons, a returns or delivery note, or a way to reach the store, more of them leave with a full cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "قرب زر إتمام الطلب في السلة يظهر عنصران على الأقل من: ملاحظة الاسترجاع، ضمان، وعد بموعد التوصيل، أيقونات الدفع الآمن، وسيلة تواصل مع الدعم." },
          business: { summary: "السلة تطمئن العميل قبل إتمام الطلب مباشرة.", detail: "العميل يرى طرق الدفع أو ما يحدث إذا حصلت مشكلة أو كيف يتواصل، في الخطوة التي يتوقف عندها كثيرون." },
          protect: "أعد فحص السلة بعد تغيير القالب أو التطبيقات، لأن تطبيقات السلة كثيرًا ما تنقل هذه الأسطر أو تخفيها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا محيط زر إتمام الطلب في السلة بحثًا عن عنصرين على الأقل من: ملاحظة الاسترجاع، ضمان، وعد بموعد التوصيل، أيقونات الدفع الآمن، وسيلة تواصل مع الدعم. يظهر أقل من عنصرين." },
          business: { summary: "السلة لا تعطي العميل سببًا كافيًا ليشعر بالأمان قبل إتمام الطلب.", detail: "السلة هي المكان الذي يتوقف فيه كثير من العملاء ويعيدون التفكير. بدون أيقونات الدفع أو ملاحظة استرجاع أو توصيل أو وسيلة تواصل، يغادر عدد أكبر منهم والسلة ممتلئة." },
          step: "أضف عنصرين على الأقل بجانب زر إتمام الطلب: أيقونات طرق الدفع التي يقبلها المتجر، سطر استرجاع أو استبدال قصير، مدة التوصيل، أو رابط دعم عبر واتساب.",
          doneWhen: "السلة تعرض عنصرين على الأقل من: أيقونات الدفع، سطر استرجاع أو ضمان، وعد بموعد التوصيل، وسيلة تواصل، بجانب زر إتمام الطلب.",
        },
      },
      store_owner: {
        pass: { business: { summary: "السلة في متجرك تطمّن العميل قبل ما يدفع.", detail: "يشوف طرق الدفع وكيف يرجّع أو يتواصل معك، في الخطوة اللي يوقف فيها كثير من العملاء." } },
        fail: { business: { summary: "السلة في متجرك ما تطمّن العميل قبل ما يروح يدفع.", detail: "كثير من العملاء يوقفون عند السلة ويترددون. لما يشوفون طرق الدفع وكيف يرجّعون أو يتواصلون معك، يكمّل عدد أكبر منهم الطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيوصلوا للسلة ويلاقوا trust signals قليلة، فالانتقال من السلة للـ checkout غالبًا بيقل.", detail: "الشوبرز اللي دفعت عشان توصّلهم لحد هنا بيترددوا عند السلة. غياب أيقونات الدفع أو سطر الاسترجاع أو الدعم بيضيّع جزء منهم، فالـ CVR بيقل والـ CPA بيعلى. ابعت النقطة دي لصاحب المتجر أو المطوّر: تعديل في صفحة السلة." } },
      },
      agency: {
        pass: { business: { summary: "سلة المتجر تطمئن العميل قبل إتمام الطلب مباشرة.", detail: "العميل يرى طرق الدفع أو ما يحدث إذا حصلت مشكلة أو كيف يتواصل مع المتجر، في الخطوة التي يتوقف عندها كثيرون." } },
        fail: { business: { summary: "سلة المتجر لا تعطي العميل سببًا كافيًا ليشعر بالأمان قبل إتمام الطلب.", detail: "السلة هي المكان الذي يتوقف فيه كثير من العملاء ويعيدون التفكير. بدون أيقونات الدفع أو ملاحظة استرجاع أو توصيل أو وسيلة تواصل مع المتجر، يغادر عدد أكبر منهم والسلة ممتلئة." } },
      },
    },
  },

  "TRUST-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A shipping policy page is linked from the footer and states the cost, the delivery time per region and the couriers used." },
          business: { summary: "Your shipping policy tells shoppers what delivery costs and how long it takes.", detail: "Shoppers can check delivery to their city before buying, so fewer leave at checkout over a surprise." },
          protect: "Update the policy page when delivery prices, regions or couriers change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked for a shipping policy page linked from the footer that states the cost, the delivery time per region and the couriers. The page is missing, unlinked, or leaves at least one of these out." },
          business: { summary: "Your shipping policy doesn't tell shoppers clearly what delivery costs or how long it takes.", detail: "Delivery cost and time are among the first things a shopper checks. When the answer isn't there, some leave to ask elsewhere, and others drop off when the cost first appears at checkout." },
          step: "Write a shipping page that lists the delivery cost, the delivery time for each region or city group, and the couriers used. Link it in the footer.",
          doneWhen: "The footer links to a shipping page that states the cost, the delivery time per region and the couriers.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your delivery page doesn't clearly say what delivery costs or how long it takes.", detail: "Shoppers want to know when their order will arrive and what it costs before they buy. If they can't find it, some leave, and some drop off when the cost shows up at checkout." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers can't find delivery cost and time, so CVR likely suffers at checkout.", detail: "Unclear delivery terms cause late drop-offs when the cost first shows at checkout, which wastes clicks that already reached the end of the funnel and raises CPA. Forward this to the store owner: it is one policy page and a footer link." } },
      },
      agency: {
        pass: { business: { summary: "The store's shipping policy tells shoppers what delivery costs and how long it takes.", detail: "Shoppers can check delivery to their city before buying, so fewer leave at checkout over a surprise." } },
        fail: { business: { summary: "The store's shipping policy doesn't tell shoppers clearly what delivery costs or how long it takes.", detail: "Delivery cost and time are among the first things a shopper checks. When the answer isn't there, some leave to ask elsewhere, and others drop off when the cost first appears at checkout." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "صفحة سياسة الشحن مرتبطة من التذييل وتذكر التكلفة ومدة التوصيل لكل منطقة وشركات الشحن." },
          business: { summary: "سياسة الشحن توضح للعميل تكلفة التوصيل ومدته.", detail: "العميل يتحقق من التوصيل إلى مدينته قبل الشراء، فيقل عدد من يغادرون عند الدفع بسبب مفاجأة." },
          protect: "حدّث صفحة السياسة عند تغيير أسعار التوصيل أو المناطق أو شركات الشحن.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا وجود صفحة سياسة شحن مرتبطة من التذييل تذكر التكلفة ومدة التوصيل لكل منطقة وشركات الشحن. الصفحة غير موجودة، أو غير مرتبطة، أو ينقصها عنصر واحد على الأقل." },
          business: { summary: "سياسة الشحن لا توضح للعميل تكلفة التوصيل أو مدته.", detail: "تكلفة التوصيل ومدته من أول ما يتحقق منه العميل. عندما تغيب الإجابة يغادر بعضهم ليسأل في مكان آخر، ويتوقف آخرون عندما تظهر التكلفة لأول مرة عند الدفع." },
          step: "اكتب صفحة شحن تذكر تكلفة التوصيل، ومدته لكل منطقة أو مجموعة مدن، وشركات الشحن المستخدمة. ضع رابطها في التذييل.",
          doneWhen: "التذييل يربط بصفحة شحن تذكر التكلفة ومدة التوصيل لكل منطقة وشركات الشحن.",
        },
      },
      store_owner: {
        pass: { business: { summary: "صفحة التوصيل في متجرك توضح كم يكلف التوصيل وكم ياخذ وقت.", detail: "العميل يعرف متى يوصله طلبه قبل ما يشتري، فما يتفاجأ عند الدفع." } },
        fail: { business: { summary: "صفحة التوصيل في متجرك ما توضح كم يكلف التوصيل وكم ياخذ وقت.", detail: "العميل يبي يعرف متى يوصله طلبه وكم بيدفع قبل ما يشتري. إذا ما لقى هالشي بعضهم يطلعون، وبعضهم يوقفون لما تطلع التكلفة عند الدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين مش لاقيين تكلفة ومدة التوصيل، فالـ CVR غالبًا بيتأثر عند الـ checkout.", detail: "شروط التوصيل المش واضحة بتعمل drop-off متأخر لما التكلفة تظهر لأول مرة في الـ checkout، وده بيضيّع كليكات وصلت لآخر الـ funnel وبيرفع الـ CPA. ابعت النقطة دي لصاحب المتجر: صفحة سياسة واحدة ولينك في الفوتر." } },
      },
      agency: {
        pass: { business: { summary: "سياسة الشحن في المتجر توضح للعميل تكلفة التوصيل ومدته.", detail: "العميل يتحقق من التوصيل إلى مدينته قبل الشراء، فيقل عدد من يغادرون عند الدفع بسبب مفاجأة." } },
        fail: { business: { summary: "سياسة الشحن في المتجر لا توضح للعميل تكلفة التوصيل أو مدته.", detail: "تكلفة التوصيل ومدته من أول ما يتحقق منه العميل. عندما تغيب الإجابة يغادر بعضهم ليسأل في مكان آخر، ويتوقف آخرون عندما تظهر التكلفة لأول مرة عند الدفع." } },
      },
    },
  },

  "TRUST-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A real phone or WhatsApp number and an email address or contact form are each reachable in one tap from the header, footer or contact page." },
          business: { summary: "Shoppers can reach you easily before they buy.", detail: "A shopper with a question can message, call or email in one tap, and a visible way to reach the store also shows there are real people behind it." },
          protect: "Keep the WhatsApp number and email current, and check the links after any theme change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the header, footer and contact page for a real phone or WhatsApp number and an email address or contact form, each one tap away. At least one of the two is missing or not reachable in one tap." },
          business: { summary: "Shoppers can't easily find a way to reach you.", detail: "Many shoppers in the region want to ask before a first order, and a store with no visible phone or email looks harder to trust. When they can't reach anyone, many leave without buying." },
          step: "Add a WhatsApp or phone link with the full international number and an email address or contact form to the footer, and to the header or a contact page.",
          doneWhen: "From the header, footer or contact page, one tap opens a WhatsApp chat or call, and one tap opens an email or contact form.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Shoppers can't easily find how to contact you.", detail: "Many shoppers want to ask on WhatsApp before their first order. If there's no clear number or email, they trust the store less and many leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers can't easily reach the store, so pre-purchase questions turn into bounces and CVR likely drops.", detail: "In the Gulf many first-time buyers ask on WhatsApp before ordering. Without a visible number or email, those ready-to-buy clicks leave instead, which raises CPA. Forward this to the store owner: it is a settings and footer change." } },
      },
      agency: {
        pass: { business: { summary: "Shoppers can reach the store easily before they buy.", detail: "A shopper with a question can message, call or email in one tap, and a visible way to reach the store also shows there are real people behind it." } },
        fail: { business: { summary: "Shoppers can't easily find a way to reach the store.", detail: "Many shoppers in the region want to ask before a first order, and a store with no visible phone or email looks harder to trust. When they can't reach anyone, many leave without buying." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "رقم هاتف أو واتساب حقيقي، وبريد إلكتروني أو نموذج تواصل، كل منهما يُفتح بضغطة واحدة من الهيدر أو التذييل أو صفحة التواصل." },
          business: { summary: "العميل يتواصل مع المتجر بسهولة قبل الشراء.", detail: "العميل الذي لديه سؤال يراسل أو يتصل أو يرسل بريدًا بضغطة واحدة، ووسيلة التواصل الظاهرة تبيّن أن خلف المتجر أشخاصًا حقيقيين." },
          protect: "حدّث رقم واتساب والبريد باستمرار، وافحص الروابط بعد أي تغيير في القالب.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا الهيدر والتذييل وصفحة التواصل بحثًا عن رقم هاتف أو واتساب حقيقي، وبريد إلكتروني أو نموذج تواصل، كل منهما بضغطة واحدة. أحدهما غير موجود أو لا يُفتح بضغطة واحدة." },
          business: { summary: "العميل لا يجد بسهولة وسيلة للتواصل مع المتجر.", detail: "كثير من العملاء في المنطقة يريدون السؤال قبل أول طلب، والمتجر بلا هاتف أو بريد ظاهر تصعب الثقة به. عندما لا يجدون من يرد، يغادر كثيرون دون شراء." },
          step: "أضف رابط واتساب أو هاتف بالرقم الدولي كاملًا، وبريدًا إلكترونيًا أو نموذج تواصل، في التذييل وفي الهيدر أو صفحة التواصل.",
          doneWhen: "من الهيدر أو التذييل أو صفحة التواصل، ضغطة واحدة تفتح محادثة واتساب أو اتصالًا، وضغطة واحدة تفتح البريد أو نموذج التواصل.",
        },
      },
      store_owner: {
        pass: { business: { summary: "العميل يقدر يتواصل معك بسهولة قبل ما يشتري.", detail: "أي عميل عنده سؤال يراسلك أو يتصل بضغطة وحدة، وهذا يبيّن إن وراء المتجر ناس حقيقيين." } },
        fail: { business: { summary: "العميل ما يلقى طريقة يتواصل فيها معك بسهولة.", detail: "كثير من العملاء يبون يسألون على الواتساب قبل أول طلب. إذا ما فيه رقم أو إيميل واضح، تقل ثقتهم في المتجر وكثير منهم يطلعون." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين مش عارفين يوصلوا للمتجر بسهولة، فأسئلة ما قبل الشراء بتتحول لـ bounce والـ CVR غالبًا بيقل.", detail: "في الخليج ناس كتير بتسأل على واتساب قبل أول أوردر. من غير رقم أو إيميل باين، الكليكات الجاهزة للشراء دي بتمشي، وده بيرفع الـ CPA. ابعت النقطة دي لصاحب المتجر: تعديل في الإعدادات والفوتر." } },
      },
      agency: {
        pass: { business: { summary: "العميل يتواصل مع المتجر بسهولة قبل الشراء.", detail: "العميل الذي لديه سؤال يراسل أو يتصل أو يرسل بريدًا بضغطة واحدة، ووسيلة التواصل الظاهرة تبيّن أن خلف المتجر أشخاصًا حقيقيين." } },
        fail: { business: { summary: "العميل لا يجد بسهولة وسيلة للتواصل مع المتجر.", detail: "كثير من العملاء في المنطقة يريدون السؤال قبل أول طلب، والمتجر بلا هاتف أو بريد ظاهر تصعب الثقة به. عندما لا يجدون من يرد، يغادر كثيرون دون شراء." } },
      },
    },
  },

  "TRUST-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The product reviews section shows a total count, a star breakdown, sort or filter, and individual reviews with text, name and date." },
          business: { summary: "Your reviews section gives shoppers the detail they look for.", detail: "Shoppers can see how many people reviewed, how the ratings split, and read what buyers said, which helps them decide." },
          protect: "Keep the review app's full layout when you change the product page design.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product reviews section for a total count, a star breakdown, sort or filter, and individual reviews with text, name and date. At least one of these is missing." },
          business: { summary: "Your reviews section leaves out details shoppers look for.", detail: "Shoppers look at how many people reviewed, how the stars split and what real buyers wrote. With parts of that missing, the reviews do less to convince them." },
          step: "In the review app settings, turn on the total count, the star breakdown and sorting or filtering, and show each review with its text, the buyer's name and the date.",
          doneWhen: "The product page reviews section shows a total count, a star breakdown, sort or filter, and reviews with text, name and date.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your reviews section is missing details shoppers look for.", detail: "Shoppers want to see how many people reviewed, how many gave each star, and what they wrote, with a name and date. Without that, your reviews convince fewer of them." } },
      },
      media_buyer: {
        fail: { business: { summary: "The reviews section paid shoppers check is thin, so it likely does less for CVR.", detail: "Cold traffic from product ads reads reviews before buying. Without a count, a breakdown, or named and dated reviews, the section convinces fewer of them, which holds CVR down. Forward this to the store owner: it is mostly review app settings." } },
      },
      agency: {
        pass: { business: { summary: "The store's reviews section gives shoppers the detail they look for.", detail: "Shoppers can see how many people reviewed, how the ratings split, and read what buyers said, which helps them decide." } },
        fail: { business: { summary: "The store's reviews section leaves out details shoppers look for.", detail: "Shoppers look at how many people reviewed, how the stars split and what real buyers wrote. With parts of that missing, the reviews do less to convince them." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "قسم التقييمات في صفحة المنتج يعرض العدد الإجمالي، وتوزيع النجوم، والفرز أو التصفية، وتقييمات فردية بالنص والاسم والتاريخ." },
          business: { summary: "قسم التقييمات يعطي العميل التفاصيل التي يبحث عنها.", detail: "العميل يرى عدد من قيّموا، وكيف تتوزع الدرجات، ويقرأ ما قاله المشترون، وهذا يساعده على القرار." },
          protect: "أبقِ التصميم الكامل لتطبيق التقييمات عند تغيير تصميم صفحة المنتج.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا قسم التقييمات في صفحة المنتج بحثًا عن العدد الإجمالي، وتوزيع النجوم، والفرز أو التصفية، وتقييمات فردية بالنص والاسم والتاريخ. أحد هذه العناصر غير موجود." },
          business: { summary: "قسم التقييمات تنقصه تفاصيل يبحث عنها العميل.", detail: "العميل ينظر إلى عدد من قيّموا، وتوزيع النجوم، وما كتبه المشترون الحقيقيون. عندما ينقص جزء من ذلك، تقنعه التقييمات بدرجة أقل." },
          step: "في إعدادات تطبيق التقييمات، فعّل العدد الإجمالي وتوزيع النجوم والفرز أو التصفية، واعرض كل تقييم بنصه واسم المشتري والتاريخ.",
          doneWhen: "قسم التقييمات في صفحة المنتج يعرض العدد الإجمالي، وتوزيع النجوم، والفرز أو التصفية، وتقييمات بالنص والاسم والتاريخ.",
        },
      },
      store_owner: {
        pass: { business: { summary: "قسم التقييمات في متجرك فيه كل اللي يدوّر عليه العميل.", detail: "يشوف كم واحد قيّم، وكيف توزعت النجوم، ويقرأ وش قالوا المشترين، وهذا يساعده يقرر." } },
        fail: { business: { summary: "قسم التقييمات في متجرك ناقصه تفاصيل يدوّر عليها العميل.", detail: "العميل يبي يشوف كم واحد قيّم، وكم واحد عطى كل نجمة، ووش كتبوا مع الاسم والتاريخ. بدون هالشي، التقييمات تقنع عدد أقل." } },
      },
      media_buyer: {
        fail: { business: { summary: "قسم التقييمات اللي الزوار المدفوعين بيبصوا عليه ناقص، فغالبًا بيفيد الـ CVR أقل.", detail: "الترافيك البارد من إعلانات المنتجات بيقرا التقييمات قبل الشراء. من غير عدد إجمالي أو توزيع نجوم أو تقييمات بالاسم والتاريخ، القسم بيقنع ناس أقل، وده بيقلل الـ CVR. ابعت النقطة دي لصاحب المتجر: أغلبها إعدادات في تطبيق التقييمات." } },
      },
      agency: {
        pass: { business: { summary: "قسم التقييمات في المتجر يعطي العميل التفاصيل التي يبحث عنها.", detail: "العميل يرى عدد من قيّموا، وكيف تتوزع الدرجات، ويقرأ ما قاله المشترون، وهذا يساعده على القرار." } },
        fail: { business: { summary: "قسم التقييمات في المتجر تنقصه تفاصيل يبحث عنها العميل.", detail: "العميل ينظر إلى عدد من قيّموا، وتوزيع النجوم، وما كتبه المشترون الحقيقيون. عندما ينقص جزء من ذلك، تقنعه التقييمات بدرجة أقل." } },
      },
    },
  },

  "TRUST-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The landing page states a guarantee or returns promise within 300px of the main CTA." },
          business: { summary: "Your landing page reassures visitors right at the main button.", detail: "A visitor about to act sees they can return or get their money back, which lowers the risk of a first order." },
          protect: "Keep the guarantee line next to the main button when you edit or duplicate the landing page.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the landing page for a guarantee or returns promise within 300px of the main CTA. None sits that close." },
          business: { summary: "Your landing page has no guarantee near the main button.", detail: "Landing page visitors are often new to the store and the product. Without a return or money-back promise where they decide, more of them hold back." },
          step: "Add one short guarantee or returns line directly under or beside the main landing page button, using the terms the store actually offers, for example 'Exchange within X days'.",
          doneWhen: "A guarantee or returns line sits within 300px of the main button on the landing page, on phone and desktop.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your landing page doesn't promise a return or refund near the main button.", detail: "People on a landing page usually don't know your store yet. A line saying they can return or exchange, right by the button, helps them order." } },
      },
      media_buyer: {
        fail: { business: { summary: "No guarantee by the landing page CTA, so paid traffic likely converts less.", detail: "Landing pages get cold paid traffic deciding on one button. Without a return or guarantee line there, CVR stays lower and CPA rises. Forward this to whoever builds the landing page: it is one line next to the CTA." } },
      },
      agency: {
        pass: { business: { summary: "The store's landing page reassures visitors right at the main button.", detail: "A visitor about to act sees they can return or get their money back, which lowers the risk of a first order." } },
        fail: { business: { summary: "The store's landing page has no guarantee near the main button.", detail: "Landing page visitors are often new to the store and the product. Without a return or money-back promise where they decide, more of them hold back." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "صفحة الهبوط تذكر ضمانًا أو وعد استرجاع على بعد 300px أو أقل من زر الدعوة الرئيسي." },
          business: { summary: "صفحة الهبوط تطمئن الزائر عند الزر الرئيسي مباشرة.", detail: "الزائر الذي يوشك على الطلب يرى أنه يستطيع الإرجاع أو استرداد ماله، فيقل خطر الطلب الأول في نظره." },
          protect: "أبقِ سطر الضمان بجانب الزر الرئيسي عند تعديل صفحة الهبوط أو نسخها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة الهبوط بحثًا عن ضمان أو وعد استرجاع على بعد 300px أو أقل من زر الدعوة الرئيسي. لا يوجد ضمن هذه المسافة." },
          business: { summary: "صفحة الهبوط بلا ضمان قرب الزر الرئيسي.", detail: "زوار صفحة الهبوط غالبًا جدد على المتجر والمنتج. بدون وعد بالإرجاع أو استرداد المال حيث يقررون، يتردد عدد أكبر منهم." },
          step: "أضف سطر ضمان أو استرجاع قصيرًا تحت الزر الرئيسي في صفحة الهبوط أو بجانبه، بالشروط التي يقدمها المتجر فعلًا، مثل «استبدال خلال X يوم».",
          doneWhen: "سطر ضمان أو استرجاع يظهر على بعد 300px أو أقل من الزر الرئيسي في صفحة الهبوط، على الجوال والكمبيوتر.",
        },
      },
      store_owner: {
        pass: { business: { summary: "صفحة الهبوط في متجرك فيها ضمان جنب الزر الرئيسي.", detail: "الزائر يعرف إنه يقدر يرجّع أو يسترد فلوسه، فيطلب وهو مرتاح." } },
        fail: { business: { summary: "صفحة الهبوط في متجرك ما فيها وعد بالإرجاع أو استرداد الفلوس جنب الزر الرئيسي.", detail: "اللي يدخل صفحة الهبوط غالبًا ما يعرف متجرك. سطر يقول إنه يقدر يرجّع أو يبدّل، جنب الزر على طول، يساعده يطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش ضمان جنب الـ CTA في صفحة الهبوط، فالترافيك المدفوع غالبًا بيحوّل أقل.", detail: "صفحات الهبوط بتستقبل ترافيك مدفوع بارد بيقرر على زرار واحد. من غير سطر استرجاع أو ضمان هناك، الـ CVR بيفضل أقل والـ CPA بيعلى. ابعت النقطة دي للي بيبني صفحة الهبوط: سطر واحد جنب الـ CTA." } },
      },
      agency: {
        pass: { business: { summary: "صفحة الهبوط في المتجر تطمئن الزائر عند الزر الرئيسي مباشرة.", detail: "الزائر الذي يوشك على الطلب يرى أنه يستطيع الإرجاع أو استرداد ماله، فيقل خطر الطلب الأول في نظره." } },
        fail: { business: { summary: "صفحة الهبوط في المتجر بلا ضمان قرب الزر الرئيسي.", detail: "زوار صفحة الهبوط غالبًا جدد على المتجر والمنتج. بدون وعد بالإرجاع أو استرداد المال حيث يقررون، يتردد عدد أكبر منهم." } },
      },
    },
  },

  "TRUST-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The main landing page CTA has a lock or security line, payment icons or a trust seal within 300px." },
          business: { summary: "Your landing page shows that paying is safe, right by the main button.", detail: "A visitor about to act sees familiar payment methods or a security sign, which removes a worry at the last step." },
          protect: "Keep the payment icons or security line next to the main button when you edit or duplicate the landing page.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked within 300px of the main landing page CTA for a lock or security line, payment icons or a trust seal. None sits that close." },
          business: { summary: "Your landing page shows no sign of safe payment near the main button.", detail: "Visitors who don't know the store yet worry about paying it. Without payment icons or a security line where they decide, more of them hesitate and leave." },
          step: "Add the icons of the payment methods the store accepts, or a short secure-payment line, directly under the main landing page button. Only use seals the store actually holds.",
          doneWhen: "Payment icons, a security line or a trust seal sit within 300px of the main button on the landing page, on phone and desktop.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Next to the main button on your landing page, nothing shows that paying is safe.", detail: "People who don't know your store yet worry about paying. Showing the payment methods they know, like Mada or Apple Pay if you accept them, right by the button helps them order." } },
      },
      media_buyer: {
        fail: { business: { summary: "No payment or security signals by the landing page CTA, so paid traffic likely converts less.", detail: "Cold paid visitors are unsure about paying a new store. Without familiar payment icons or a security line by the CTA, CVR stays lower and CPA rises. Forward this to whoever builds the landing page: it is a small block under the CTA." } },
      },
      agency: {
        pass: { business: { summary: "The store's landing page shows that paying is safe, right by the main button.", detail: "A visitor about to act sees familiar payment methods or a security sign, which removes a worry at the last step." } },
        fail: { business: { summary: "The store's landing page shows no sign of safe payment near the main button.", detail: "Visitors who don't know the store yet worry about paying it. Without payment icons or a security line where they decide, more of them hesitate and leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "زر الدعوة الرئيسي في صفحة الهبوط بجانبه قفل أو سطر أمان أو أيقونات دفع أو ختم ثقة على بعد 300px أو أقل." },
          business: { summary: "صفحة الهبوط تبيّن أن الدفع آمن، بجانب الزر الرئيسي مباشرة.", detail: "الزائر الذي يوشك على الطلب يرى طرق دفع مألوفة أو علامة أمان، فيزول قلق في الخطوة الأخيرة." },
          protect: "أبقِ أيقونات الدفع أو سطر الأمان بجانب الزر الرئيسي عند تعديل صفحة الهبوط أو نسخها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا مسافة 300px حول زر الدعوة الرئيسي في صفحة الهبوط بحثًا عن قفل أو سطر أمان أو أيقونات دفع أو ختم ثقة. لا يوجد ضمن هذه المسافة." },
          business: { summary: "صفحة الهبوط لا تعرض أي إشارة لأمان الدفع قرب الزر الرئيسي.", detail: "الزوار الذين لا يعرفون المتجر بعد يقلقون من الدفع له. بدون أيقونات الدفع أو سطر أمان حيث يقررون، يتردد عدد أكبر منهم ويغادر." },
          step: "أضف أيقونات طرق الدفع التي يقبلها المتجر، أو سطرًا قصيرًا عن الدفع الآمن، تحت الزر الرئيسي في صفحة الهبوط مباشرة. استخدم فقط الأختام التي يملكها المتجر فعلًا.",
          doneWhen: "أيقونات الدفع أو سطر الأمان أو ختم الثقة تظهر على بعد 300px أو أقل من الزر الرئيسي في صفحة الهبوط، على الجوال والكمبيوتر.",
        },
      },
      store_owner: {
        pass: { business: { summary: "جنب الزر الرئيسي في صفحة الهبوط عندك شي يبيّن إن الدفع آمن.", detail: "الزائر يشوف طرق دفع يعرفها، فيطلب وهو مطمئن." } },
        fail: { business: { summary: "جنب الزر الرئيسي في صفحة الهبوط عندك ما فيه شي يبيّن إن الدفع آمن.", detail: "اللي ما يعرف متجرك يتردد قبل ما يدفع. لما يشوف طرق الدفع اللي يعرفها، مثل مدى أو Apple Pay إذا كنت تقبلها، جنب الزر على طول، يطلب وهو مرتاح." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش أيقونات دفع أو أمان جنب الـ CTA في صفحة الهبوط، فالترافيك المدفوع غالبًا بيحوّل أقل.", detail: "الزائر المدفوع البارد مش متأكد إنه يدفع لمتجر جديد. من غير أيقونات دفع مألوفة أو سطر أمان جنب الـ CTA، الـ CVR بيفضل أقل والـ CPA بيعلى. ابعت النقطة دي للي بيبني صفحة الهبوط: بلوك صغير تحت الـ CTA." } },
      },
      agency: {
        pass: { business: { summary: "صفحة الهبوط في المتجر تبيّن أن الدفع آمن، بجانب الزر الرئيسي مباشرة.", detail: "الزائر الذي يوشك على الطلب يرى طرق دفع مألوفة أو علامة أمان، فيزول قلق في الخطوة الأخيرة." } },
        fail: { business: { summary: "صفحة الهبوط في المتجر لا تعرض أي إشارة لأمان الدفع قرب الزر الرئيسي.", detail: "الزوار الذين لا يعرفون المتجر بعد يقلقون من الدفع له. بدون أيقونات الدفع أو سطر أمان حيث يقررون، يتردد عدد أكبر منهم ويغادر." } },
      },
    },
  },

  "TRUST-14": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "At least 3 real customer photos or videos show on product pages, with some on the home page." },
          business: { summary: "Your store shows real customers using the products.", detail: "Photos and videos from buyers show what the product looks like in real life, which a studio photo can't." },
          protect: "Keep asking buyers for photos and videos, and refresh the home page selection from time to time.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked product pages for at least 3 real customer photos or videos, and the home page for some. Fewer show than that, or none on the home page." },
          business: { summary: "Your store shows few or no photos and videos from real customers.", detail: "Shoppers want to see the product in a real buyer's hands before ordering. Without that, they rely on studio photos alone, which convince fewer of them." },
          step: "Turn on photo and video reviews in the review app, ask recent buyers for a photo or short video, for example by WhatsApp after delivery, and show the best ones on product pages and in a section on the home page.",
          doneWhen: "Product pages show at least 3 customer photos or videos, and the home page shows some.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store shows few or no photos from real customers.", detail: "Shoppers want to see your product with real buyers, not only in studio photos. Asking happy customers for a photo on WhatsApp and showing it helps more people order." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers see little customer content on the store, so the post-click page likely converts less.", detail: "Cold traffic that clicked on a polished ad looks for proof from real buyers. Without customer photos or videos on the product page, CVR stays lower and CPA rises. The same content also feeds UGC-style ads. Forward this to the store owner or marketing team." } },
      },
      agency: {
        pass: { business: { summary: "The store shows real customers using the products.", detail: "Photos and videos from buyers show what the product looks like in real life, which a studio photo can't." } },
        fail: { business: { summary: "The store shows few or no photos and videos from real customers.", detail: "Shoppers want to see the product in a real buyer's hands before ordering. Without that, they rely on studio photos alone, which convince fewer of them." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "3 صور أو فيديوهات حقيقية من العملاء على الأقل تظهر في صفحات المنتجات، وبعضها في الصفحة الرئيسية." },
          business: { summary: "المتجر يعرض عملاء حقيقيين يستخدمون المنتجات.", detail: "صور المشترين وفيديوهاتهم تُظهر شكل المنتج في الواقع، وهذا ما لا تفعله صورة الاستوديو." },
          protect: "استمر في طلب الصور والفيديوهات من المشترين، وجدّد المختارات في الصفحة الرئيسية من وقت لآخر.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحات المنتجات بحثًا عن 3 صور أو فيديوهات حقيقية من العملاء على الأقل، والصفحة الرئيسية بحثًا عن بعضها. العدد أقل من ذلك، أو لا يظهر شيء في الصفحة الرئيسية." },
          business: { summary: "المتجر يعرض صورًا وفيديوهات قليلة أو معدومة من عملاء حقيقيين.", detail: "العميل يريد أن يرى المنتج مع مشترٍ حقيقي قبل الطلب. بدون ذلك يعتمد على صور الاستوديو وحدها، وهي تقنع عددًا أقل." },
          step: "فعّل التقييمات بالصور والفيديو في تطبيق التقييمات، واطلب من المشترين الجدد صورة أو فيديو قصيرًا، مثلًا عبر واتساب بعد التوصيل، واعرض أفضلها في صفحات المنتجات وفي قسم بالصفحة الرئيسية.",
          doneWhen: "صفحات المنتجات تعرض 3 صور أو فيديوهات من العملاء على الأقل، والصفحة الرئيسية تعرض بعضها.",
        },
      },
      store_owner: {
        pass: { business: { summary: "متجرك يعرض صور وفيديوهات من عملاء حقيقيين.", detail: "العميل يشوف المنتج على الطبيعة مع ناس اشتروه، وهذا يقنعه أكثر من صور الاستوديو." } },
        fail: { business: { summary: "متجرك فيه صور قليلة أو ما فيه صور من عملاء حقيقيين.", detail: "العميل يبي يشوف منتجك مع ناس اشتروه، مو بس صور استوديو. اطلب من عملائك الراضين صورة على الواتساب واعرضها، وهذا يساعد ناس أكثر يطلبون." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيشوفوا محتوى قليل من العملاء على المتجر، فالصفحة بعد الكليك غالبًا بتحوّل أقل.", detail: "الترافيك البارد اللي داس على إعلان متظبط بيدوّر على دليل من مشترين حقيقيين. من غير صور أو فيديوهات عملاء في صفحة المنتج، الـ CVR بيفضل أقل والـ CPA بيعلى. نفس المحتوى ده كمان بينفع لإعلانات UGC. ابعت النقطة دي لصاحب المتجر أو فريق التسويق." } },
      },
      agency: {
        pass: { business: { summary: "المتجر يعرض عملاء حقيقيين يستخدمون المنتجات.", detail: "صور المشترين وفيديوهاتهم تُظهر شكل المنتج في الواقع، وهذا ما لا تفعله صورة الاستوديو." } },
        fail: { business: { summary: "المتجر يعرض صورًا وفيديوهات قليلة أو معدومة من عملاء حقيقيين.", detail: "العميل يريد أن يرى المنتج مع مشترٍ حقيقي قبل الطلب. بدون ذلك يعتمد على صور الاستوديو وحدها، وهي تقنع عددًا أقل." } },
      },
    },
  },

  "TRUST-21": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The home page shows at least one recognised press, certification or partner logo, as an image with alt text or as text, above the footer." },
          business: { summary: "Your home page shows a name shoppers already trust.", detail: "A recognised press mention, certification or partner lends its trust to a store the shopper doesn't know yet." },
          protect: "Keep each logo current and linked to where a shopper can check it, and remove any that no longer apply.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the home page above the footer for at least one recognised press, certification or partner logo, as an image alt or text. None shows." },
          business: { summary: "Your home page shows no press, certification or partner a shopper would recognise.", detail: "A store a shopper doesn't know has to earn trust on its own. A recognised name, such as a business registration, a known partner or a press mention, does part of that work." },
          step: "If the store has a business registration, a certification, a known partner or a press mention, show its logo or name in a strip on the home page, linked to where a shopper can check it. Only show what the store actually holds.",
          doneWhen: "The home page shows at least one recognised press, certification or partner logo above the footer, and each one names or links to something a shopper can check.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your home page doesn't show any name shoppers already trust.", detail: "If you have a business registration, a known partner or a press mention, showing it on the home page helps new shoppers trust your store faster." } },
      },
      media_buyer: {
        fail: { business: { summary: "No recognised logos on the home page, so cold paid visitors get one less reason to trust the store.", detail: "Cold traffic landing on home weighs whether a new store is safe to buy from. A recognised certification or partner can lift CVR a little; without one, the page leans on reviews alone. Forward this to the store owner: it only applies if the store has such a name to show." } },
      },
      agency: {
        pass: { business: { summary: "The store's home page shows a name shoppers already trust.", detail: "A recognised press mention, certification or partner lends its trust to a store the shopper doesn't know yet." } },
        fail: { business: { summary: "The store's home page shows no press, certification or partner a shopper would recognise.", detail: "A store a shopper doesn't know has to earn trust on its own. A recognised name, such as a business registration, a known partner or a press mention, does part of that work." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الصفحة الرئيسية تعرض شعارًا معروفًا واحدًا على الأقل لجهة إعلامية أو شهادة أو شريك، كصورة بنص بديل أو كنص، فوق التذييل." },
          business: { summary: "الصفحة الرئيسية تعرض اسمًا يثق به العميل مسبقًا.", detail: "ذكر إعلامي أو شهادة أو شريك معروف يمنح ثقته لمتجر لا يعرفه العميل بعد." },
          protect: "أبقِ كل شعار محدثًا ومرتبطًا بمكان يستطيع العميل التحقق منه، واحذف ما لم يعد ينطبق.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا الصفحة الرئيسية فوق التذييل بحثًا عن شعار معروف واحد على الأقل لجهة إعلامية أو شهادة أو شريك، كنص بديل لصورة أو كنص. لا يظهر أي منها." },
          business: { summary: "الصفحة الرئيسية لا تعرض أي جهة إعلامية أو شهادة أو شريك يعرفه العميل.", detail: "المتجر الذي لا يعرفه العميل يكسب الثقة وحده. اسم معروف، مثل السجل التجاري أو شريك معروف أو ذكر إعلامي، يقوم بجزء من هذا العمل." },
          step: "إذا كان لدى المتجر سجل تجاري أو شهادة أو شريك معروف أو ذكر إعلامي، اعرض شعاره أو اسمه في شريط بالصفحة الرئيسية مع رابط يتحقق منه العميل. اعرض فقط ما يملكه المتجر فعلًا.",
          doneWhen: "الصفحة الرئيسية تعرض شعارًا معروفًا واحدًا على الأقل لجهة إعلامية أو شهادة أو شريك فوق التذييل، وكل شعار يسمّي شيئًا أو يربط بشيء يستطيع العميل التحقق منه.",
        },
      },
      store_owner: {
        pass: { business: { summary: "الصفحة الرئيسية في متجرك تعرض اسم يثق فيه العميل.", detail: "شهادة أو شريك معروف أو ذكر في الإعلام يخلي العميل الجديد يثق في متجرك أسرع." } },
        fail: { business: { summary: "الصفحة الرئيسية في متجرك ما تعرض أي اسم يثق فيه العميل.", detail: "إذا عندك سجل تجاري أو شريك معروف أو أحد كتب عنك في الإعلام، اعرضه في الصفحة الرئيسية، وهذا يخلي العملاء الجدد يثقون في متجرك أسرع." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش لوجوهات معروفة في الهوم، فالزائر المدفوع البارد عنده سبب أقل يثق في المتجر.", detail: "الترافيك البارد اللي بينزل على الهوم بيحسبها هل المتجر الجديد ده آمن. شهادة أو شريك معروف ممكن يرفع الـ CVR شوية، ومن غيره الصفحة بتعتمد على التقييمات بس. ابعت النقطة دي لصاحب المتجر: بتنطبق بس لو المتجر عنده اسم زي ده يعرضه." } },
      },
      agency: {
        pass: { business: { summary: "الصفحة الرئيسية للمتجر تعرض اسمًا يثق به العميل مسبقًا.", detail: "ذكر إعلامي أو شهادة أو شريك معروف يمنح ثقته لمتجر لا يعرفه العميل بعد." } },
        fail: { business: { summary: "الصفحة الرئيسية للمتجر لا تعرض أي جهة إعلامية أو شهادة أو شريك يعرفه العميل.", detail: "المتجر الذي لا يعرفه العميل يكسب الثقة وحده. اسم معروف، مثل السجل التجاري أو شريك معروف أو ذكر إعلامي، يقوم بجزء من هذا العمل." } },
      },
    },
  },
};
