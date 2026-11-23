import type { PointTemplate } from "./types.js";

// Frames for AI-judged points: fixed text, the AI's finding in {observation} (types.ts).
export const FRAMES_LANDING: Record<string, PointTemplate> = {
  // Top-3 paid campaigns (50+ sessions): landing page add-to-cart rate >= 70% of the paid average. Media buyer only.
  "LAND-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "For each of the top 3 paid campaigns with 50+ sessions in GA4, the add-to-cart rate of its main landing page against the add-to-cart rate of all paid sessions. Each reaches at least 70% of the paid average." },
          business: { summary: "The top paid campaigns land on pages that turn visits into add to carts.", detail: "Paid clicks reach pages that convert close to the rest of the paid traffic, so the spend gets a fair chance to sell." },
          protect: "Re-check the landing page's add-to-cart rate in GA4 whenever a campaign gets a new destination URL or the page is redesigned.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "For each of the top 3 paid campaigns with 50+ sessions in GA4, the add-to-cart rate of its main landing page against the add-to-cart rate of all paid sessions. At least one campaign lands on a page under 70% of that average." },
          business: { summary: "At least one top paid campaign lands on a page that turns few visits into add to carts.", detail: "Its clicks cost the same as the rest but convert below the paid average. Common causes are a page that doesn't show the product or offer from the ad, or a general page used for an ad about one product." },
          step: "Point each weak campaign at the product or collection page it advertises. If it has to keep the same page, ask the store owner to put that product or offer and a clear headline on the page's first screen.",
          doneWhen: "In GA4 over 14 days, each top paid campaign's main landing page has an add-to-cart rate of at least 70% of the paid average.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "A top campaign sends paid clicks to a page that converts well under the paid average, so CVR is lower and CAC higher than the traffic deserves.", detail: "The same spend buys fewer add to carts, so that campaign's ROAS drops and the platform gets fewer conversion events to learn from. Change the destination URL to the product or collection the ad sells; changes to the page itself go to the store owner." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "لكل حملة من أعلى 3 حملات مدفوعة لديها 50 جلسة أو أكثر في GA4، قورن معدل الإضافة للسلة في صفحة الهبوط الرئيسية بمعدل الإضافة للسلة لكل الجلسات المدفوعة. كل حملة تبلغ 70% على الأقل من المتوسط المدفوع." },
          business: { summary: "أهم الحملات المدفوعة تصل إلى صفحات تحوّل الزيارات إلى إضافات للسلة.", detail: "النقرات المدفوعة تصل إلى صفحات تحقق نتائج قريبة من بقية الزيارات المدفوعة، فيحصل الإنفاق على فرصة عادلة للبيع." },
          protect: "أعد فحص معدل الإضافة للسلة لصفحة الهبوط في GA4 كلما تغيّر رابط وجهة حملة أو أُعيد تصميم الصفحة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لكل حملة من أعلى 3 حملات مدفوعة لديها 50 جلسة أو أكثر في GA4، قورن معدل الإضافة للسلة في صفحة الهبوط الرئيسية بمعدل كل الجلسات المدفوعة. حملة واحدة على الأقل تصل إلى صفحة أقل من 70% من هذا المتوسط." },
          business: { summary: "حملة مدفوعة رئيسية واحدة على الأقل تصل إلى صفحة يضيف فيها قليل من الزوار إلى السلة.", detail: "نقراتها تكلف مثل غيرها لكنها تحقق أقل من المتوسط المدفوع. من الأسباب الشائعة صفحة لا تعرض المنتج أو العرض الذي ذكره الإعلان، أو صفحة عامة لإعلان عن منتج واحد." },
          step: "وجّه كل حملة ضعيفة إلى صفحة المنتج أو المجموعة التي تعلن عنها. وإن لزم بقاء الصفحة نفسها، اطلب من صاحب المتجر وضع ذلك المنتج أو العرض وعنوان واضح في الشاشة الأولى من الصفحة.",
          doneWhen: "في GA4 خلال 14 يومًا، معدل الإضافة للسلة في صفحة الهبوط الرئيسية لكل حملة مدفوعة رئيسية يبلغ 70% على الأقل من المتوسط المدفوع.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "حملة من أهم الحملات بتودّي الكليكات المدفوعة لصفحة بتحوّل أقل بكتير من متوسط الـ paid، فالـ CVR أقل والـ CAC أعلى من اللي الترافيك يستاهله.", detail: "نفس الصرف بيجيب add to cart أقل، فالـ ROAS بتاع الحملة دي بينزل والمنصة بتاخد conversion events أقل تتعلم منها. غيّر الـ destination URL لصفحة المنتج أو الـ collection اللي الإعلان بيبيعها، وأي تعديل في الصفحة نفسها يروح لصاحب المتجر." } },
      },
    },
  },

  // No main menu, at most 2 header links, one main offer, every main button leads to the same action.
  "LAND-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the landing page for a main navigation menu, the number of header links (2 at most), competing offers, and where each main button leads. The page has no main menu, one offer, and main buttons that share one action." },
          business: { summary: "The landing page keeps visitors on one goal.", detail: "With no menu or rival offers to wander into, visitors who arrive from an ad move toward the one action the page asks for." },
          protect: "Check the landing page again after adding a banner, offer or app, since each one can bring a second goal.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the landing page for a main navigation menu, the number of header links (2 at most), competing offers, and where each main button leads. At least one breaks the rule: a main menu, more header links, a second offer, or buttons that lead to different actions." },
          business: { summary: "The landing page splits visitors' attention between several goals.", detail: "Menus, extra links, rival offers or buttons that go to different places give visitors ways off the path the ad started. Each exit takes some of them away from buying." },
          step: "Ask the developer to remove or hide the main menu on the landing page, keep 2 header links at most, keep one offer, and point every main button at the same action, such as adding the advertised product to the cart.",
          doneWhen: "On a phone, the landing page shows no main menu, 2 header links or fewer, one offer, and every main button leads to the same action.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your landing page pulls visitors in several directions.", detail: "The menu, extra links or other offers let shoppers who came from your ads wander off before buying. Each way out costs you some of the sales you paid to bring in." } },
      },
      media_buyer: {
        fail: { business: { summary: "The landing page gives paid visitors several ways out, so CVR is lower and CPA higher than it should be.", detail: "Menus, extra links and rival offers pull clicks away from the action the ad sold. A page with one goal converts more of the same traffic, which lifts ROAS. The page change goes to the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "The store's landing page splits visitors' attention between several goals.", detail: "Menus, extra links, rival offers or mixed buttons let visitors from ads leave the path before buying. A page with one goal keeps more of the paid traffic moving toward the sale." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فُحصت صفحة الهبوط بحثًا عن قائمة تنقل رئيسية، وعدد روابط الرأس (2 كحد أقصى)، والعروض المتنافسة، ووجهة كل زر رئيسي. الصفحة بلا قائمة رئيسية، وفيها عرض واحد، وأزرارها الرئيسية تؤدي إلى إجراء واحد." },
          business: { summary: "صفحة الهبوط تُبقي الزوار على هدف واحد.", detail: "من دون قائمة أو عروض منافسة تشتتهم، يتجه الزوار القادمون من الإعلان نحو الإجراء الوحيد الذي تطلبه الصفحة." },
          protect: "أعد فحص صفحة الهبوط بعد إضافة أي بانر أو عرض أو تطبيق، فكل منها قد يضيف هدفًا ثانيًا.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فُحصت صفحة الهبوط بحثًا عن قائمة تنقل رئيسية، وعدد روابط الرأس (2 كحد أقصى)، والعروض المتنافسة، ووجهة كل زر رئيسي. عنصر واحد على الأقل يخالف القاعدة: قائمة رئيسية، أو روابط رأس أكثر، أو عرض ثانٍ، أو أزرار تؤدي إلى إجراءات مختلفة." },
          business: { summary: "صفحة الهبوط توزّع انتباه الزوار على أكثر من هدف.", detail: "القوائم والروابط الإضافية والعروض المنافسة والأزرار المتفرقة تفتح للزوار طرقًا للخروج من المسار الذي بدأه الإعلان. وكل مخرج يُبعد بعضهم عن الشراء." },
          step: "اطلب من المطوّر إزالة القائمة الرئيسية من صفحة الهبوط أو إخفاءها، والإبقاء على رابطين في الرأس كحد أقصى، وعرض واحد، وتوجيه كل زر رئيسي إلى الإجراء نفسه، مثل إضافة المنتج المُعلن عنه إلى السلة.",
          doneWhen: "على الجوال، لا تظهر في صفحة الهبوط قائمة رئيسية، وفي الرأس رابطان أو أقل، وفيها عرض واحد، وكل زر رئيسي يؤدي إلى الإجراء نفسه.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة الهبوط في متجرك تشتت العميل بين أكثر من هدف.", detail: "القائمة والروابط الزايدة والعروض الثانية تخلي العميل اللي جا من إعلانك يسرح ويطلع قبل ما يشتري. وكل طريق للخروج يضيّع عليك جزء من المبيعات اللي دفعت عشان تجيبها." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة الهبوط بتدي الزوار المدفوعين طرق كتير يخرجوا منها، فالـ CVR أقل والـ CPA أعلى من اللازم.", detail: "القوايم واللينكات الزيادة والعروض التانية بتشد الكليكات بعيد عن الأكشن اللي الإعلان باعه. صفحة بهدف واحد بتحوّل أكتر من نفس الترافيك، وده بيرفع الـ ROAS. تعديل الصفحة عند صاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "صفحة الهبوط في المتجر توزّع انتباه الزوار على أكثر من هدف.", detail: "القوائم والروابط الإضافية والعروض المنافسة والأزرار المتفرقة تتيح لزوار الإعلانات مغادرة المسار قبل الشراء. والصفحة ذات الهدف الواحد تُبقي جزءًا أكبر من الزيارات المدفوعة متجهًا نحو البيع." } },
      },
    },
  },

  // First phone screen: benefit-led headline, 3 short benefit points, one clear CTA.
  "LAND-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the landing page's first phone screen for a headline that states a benefit, 3 short benefit points and one clear call-to-action button. All three show before scrolling." },
          business: { summary: "The first screen tells visitors what they get and what to do next.", detail: "A visitor sees the benefit, the reasons behind it and the next step without scrolling." },
          protect: "Re-check the first screen on a phone after changing the hero banner, headline or announcement bar.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the landing page's first phone screen for a headline that states a benefit, 3 short benefit points and one clear call-to-action button. At least one of the three is missing, unclear or pushed below the first screen." },
          business: { summary: "The first screen doesn't clearly tell visitors what they get and what to do next.", detail: "Many visitors judge the page on its first screen. Without a clear benefit, short reasons and one button, some leave before they scroll." },
          step: "The store owner or designer rewrites the top of the landing page: a headline that says what the shopper gets, 3 short benefit points under it, and one button for the main action. Check on a phone that all three fit before scrolling.",
          doneWhen: "On a phone, the landing page's first screen shows a benefit headline, 3 short benefit points and one clear button, with no scrolling.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The first screen of your landing page doesn't clearly say what shoppers get or what to do.", detail: "Many shoppers decide on the first screen whether to stay. If they don't see the benefit and one clear button there, some leave before they ever reach your products." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors land on a first screen with no clear benefit or next step, so CVR is lower and CPA higher.", detail: "The ad won the click, but the page doesn't carry the promise forward, so more paid visitors bounce in the first seconds. A clear headline, benefits and one button convert more of the same traffic. The page change goes to the store owner." } },
      },
      agency: {
        fail: { business: { summary: "The first screen of the store's landing page doesn't clearly say what visitors get or what to do.", detail: "Many visitors judge the page on its first screen. Without a clear benefit, short reasons and one button, some leave before scrolling, including those the ads paid for." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فُحصت الشاشة الأولى من صفحة الهبوط على الجوال بحثًا عن عنوان يذكر فائدة، و3 نقاط فائدة قصيرة، وزر دعوة واضح واحد. العناصر الثلاثة ظاهرة قبل التمرير." },
          business: { summary: "الشاشة الأولى تخبر الزائر بما سيحصل عليه وبالخطوة التالية.", detail: "يرى الزائر الفائدة وأسبابها والخطوة التالية من دون تمرير." },
          protect: "أعد فحص الشاشة الأولى على الجوال بعد تغيير البانر الرئيسي أو العنوان أو شريط الإعلانات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فُحصت الشاشة الأولى من صفحة الهبوط على الجوال بحثًا عن عنوان يذكر فائدة، و3 نقاط فائدة قصيرة، وزر دعوة واضح واحد. عنصر واحد على الأقل مفقود أو غير واضح أو نازل تحت الشاشة الأولى." },
          business: { summary: "الشاشة الأولى لا توضح للزائر ما سيحصل عليه ولا ما يفعله بعدها.", detail: "كثير من الزوار يحكمون على الصفحة من شاشتها الأولى. ومن دون فائدة واضحة وأسباب قصيرة وزر واحد، يغادر بعضهم قبل التمرير." },
          step: "يعيد صاحب المتجر أو المصمم كتابة أعلى صفحة الهبوط: عنوان يذكر ما يحصل عليه العميل، و3 نقاط فائدة قصيرة تحته، وزر واحد للإجراء الرئيسي. ثم يتأكد على الجوال أن الثلاثة تظهر قبل التمرير.",
          doneWhen: "على الجوال، تعرض الشاشة الأولى من صفحة الهبوط عنوان فائدة و3 نقاط فائدة قصيرة وزرًا واضحًا واحدًا، من دون تمرير.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أول شاشة في صفحة الهبوط بمتجرك ما توضح للعميل وش بيستفيد ولا وش يسوي.", detail: "واجد عملاء يقررون من أول شاشة إذا بيكملون أو لا. وإذا ما شافوا الفايدة وزر واضح، بعضهم يطلع قبل ما يوصل لمنتجاتك." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيوصلوا لأول شاشة من غير فايدة واضحة ولا خطوة جاية، فالـ CVR أقل والـ CPA أعلى.", detail: "الإعلان كسب الكليك، بس الصفحة مش بتكمّل الوعد، فزوار مدفوعين أكتر بيعملوا bounce في أول ثواني. عنوان واضح ونقط فايدة وزرار واحد بيحوّلوا أكتر من نفس الترافيك. تعديل الصفحة عند صاحب المتجر." } },
      },
      agency: {
        fail: { business: { summary: "الشاشة الأولى من صفحة الهبوط في المتجر لا توضح للزائر ما سيحصل عليه ولا ما يفعله.", detail: "كثير من الزوار يحكمون على الصفحة من شاشتها الأولى. ومن دون فائدة واضحة وأسباب قصيرة وزر واحد، يغادر بعضهم قبل التمرير، ومنهم زوار الإعلانات المدفوعة." } },
      },
    },
  },

  // Star rating with count, or 2+ testimonials with first and last name, within the first two phone screens.
  "LAND-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the landing page's first two phone screens for a star rating with its review count, or at least 2 testimonials with the customer's first and last name. One of them is there." },
          business: { summary: "Visitors see proof from real customers early on the landing page.", detail: "A rating with a count or named reviews near the top shows new visitors that others bought and were happy." },
          protect: "Keep the reviews near the top when the page is redesigned, and keep collecting new ones so the count stays current.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the landing page's first two phone screens for a star rating with its review count, or at least 2 testimonials with the customer's first and last name. Neither is there: the proof is missing, unnamed, without a count, or placed further down." },
          business: { summary: "The landing page doesn't show named customer proof near the top.", detail: "Visitors from ads often don't know the store yet. Without a rating count or named reviews early on, more of them hesitate or leave to look for reviews elsewhere." },
          step: "Ask the developer to show a star rating with the number of reviews, or at least 2 short reviews with the customer's first and last name, within the first two phone screens of the landing page. If reviews aren't collected yet, add a reviews app the store platform supports.",
          doneWhen: "On a phone, a star rating with its review count, or 2 reviews with first and last names, shows within the first two screens of the landing page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your landing page doesn't show proof from named customers near the top.", detail: "Shoppers from ads often don't know your store yet. If they don't see a rating with a count or reviews with real names early, more of them hesitate or leave to check you elsewhere." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors see no named customer proof near the top of the landing page, so CVR is lower and CPA higher.", detail: "Cold traffic from ads needs a reason to trust a store it just found. A rating count or named reviews in the first two screens converts more of the same clicks. The change goes to the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "The store's landing page doesn't show named customer proof near the top.", detail: "Visitors from ads often don't know the store yet. Without a rating count or named reviews early on, more of them hesitate or leave to look for reviews elsewhere." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فُحصت أول شاشتين من صفحة الهبوط على الجوال بحثًا عن تقييم بالنجوم مع عدد المراجعات، أو شهادتين على الأقل باسم العميل الأول والأخير. أحدهما موجود." },
          business: { summary: "يرى الزوار دليلًا من عملاء حقيقيين في أعلى صفحة الهبوط.", detail: "تقييم مع عدد أو مراجعات بأسماء أصحابها قرب الأعلى يُظهر للزائر الجديد أن غيره اشترى وكان راضيًا." },
          protect: "أبقِ المراجعات قرب الأعلى عند إعادة تصميم الصفحة، واستمر في جمع مراجعات جديدة ليبقى العدد حديثًا.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فُحصت أول شاشتين من صفحة الهبوط على الجوال بحثًا عن تقييم بالنجوم مع عدد المراجعات، أو شهادتين على الأقل باسم العميل الأول والأخير. لا يوجد أي منهما: الدليل مفقود، أو بلا أسماء، أو بلا عدد، أو في موضع أسفل." },
          business: { summary: "صفحة الهبوط لا تعرض دليلًا من عملاء بأسمائهم قرب الأعلى.", detail: "زوار الإعلانات غالبًا لا يعرفون المتجر بعد. ومن دون عدد تقييمات أو مراجعات بأسماء أصحابها في البداية، يتردد عدد أكبر منهم أو يغادر للبحث عن مراجعات في مكان آخر." },
          step: "اطلب من المطوّر عرض تقييم بالنجوم مع عدد المراجعات، أو مراجعتين قصيرتين على الأقل باسم العميل الأول والأخير، ضمن أول شاشتين من صفحة الهبوط على الجوال. وإن لم تكن المراجعات تُجمع بعد، أضف تطبيق مراجعات تدعمه منصة المتجر.",
          doneWhen: "على الجوال، يظهر تقييم بالنجوم مع عدد المراجعات، أو مراجعتان بالاسم الأول والأخير، ضمن أول شاشتين من صفحة الهبوط.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة الهبوط في متجرك ما تعرض آراء عملاء بأسمائهم قريب من فوق.", detail: "العملاء اللي يجون من الإعلانات غالبًا ما يعرفون متجرك. وإذا ما شافوا تقييم مع عدد أو مراجعات بأسماء حقيقية من البداية، أكثرهم يتردد أو يطلع يدوّر عليك في مكان ثاني." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين مش شايفين social proof بأسماء حقيقية في أول الصفحة، فالـ CVR أقل والـ CPA أعلى.", detail: "الترافيك البارد من الإعلانات محتاج سبب يثق بيه في متجر لسه عارفه. عدد تقييمات أو ريفيوز بأسماء في أول شاشتين بيحوّل أكتر من نفس الكليكات. التعديل عند صاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "صفحة الهبوط في المتجر لا تعرض دليلًا من عملاء بأسمائهم قرب الأعلى.", detail: "زوار الإعلانات غالبًا لا يعرفون المتجر بعد. ومن دون عدد تقييمات أو مراجعات بأسماء أصحابها في البداية، يتردد عدد أكبر منهم أو يغادر للبحث عن مراجعات في مكان آخر." } },
      },
    },
  },

  // Page longer than 4 phone screens: main CTA at least 4 times, including after the hero and at the close.
  "LAND-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked whether the landing page is longer than 4 phone screens and, if so, that the main call-to-action appears at least 4 times, including right after the hero and at the end." },
          business: { summary: "Visitors can act from anywhere on the landing page.", detail: "Whenever a visitor decides to buy while scrolling, a button to do it is close by." },
          protect: "When adding new sections to the landing page, repeat the main button after them too.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked whether the landing page is longer than 4 phone screens and, if so, that the main call-to-action appears at least 4 times, including right after the hero and at the end. The page is longer, and the button appears fewer times or is missing after the hero or at the end." },
          business: { summary: "On a long landing page, the main button doesn't come back often enough.", detail: "A visitor who is convinced halfway down or at the end has to scroll back up to act. Some don't, and the decision fades." },
          step: "Ask the developer to repeat the main button on the landing page at least 4 times: right after the hero, between the main sections, and at the end. Every copy uses the same label and leads to the same action.",
          doneWhen: "Scrolling the landing page on a phone shows the main button at least 4 times, including right after the hero and at the end.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your landing page is long, and the buy button doesn't come back often enough.", detail: "A shopper who makes up their mind halfway down has to scroll all the way back to buy. Some won't bother, and you lose a sale that was almost made." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors who scroll the long landing page lose sight of the main button, so CVR is lower and CPA higher.", detail: "Visitors convinced lower down have no button in reach, and some drop off instead of scrolling back. Repeating the button converts more of the same clicks. The page change goes to the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "The store's landing page is long, and the main button doesn't come back often enough.", detail: "A visitor convinced halfway down or at the end has to scroll back up to act. Some don't, and the store loses sales that were close." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فُحص ما إذا كانت صفحة الهبوط أطول من 4 شاشات جوال، وإن كانت كذلك، أن زر الدعوة الرئيسي يظهر 4 مرات على الأقل، منها مباشرة بعد الواجهة الرئيسية وفي النهاية." },
          business: { summary: "يستطيع الزائر التصرف من أي مكان في صفحة الهبوط.", detail: "متى قرر الزائر الشراء أثناء التمرير، يجد زرًا قريبًا لذلك." },
          protect: "عند إضافة أقسام جديدة إلى صفحة الهبوط، كرر الزر الرئيسي بعدها أيضًا.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فُحص ما إذا كانت صفحة الهبوط أطول من 4 شاشات جوال، وإن كانت كذلك، أن زر الدعوة الرئيسي يظهر 4 مرات على الأقل، منها مباشرة بعد الواجهة الرئيسية وفي النهاية. الصفحة أطول، والزر يظهر مرات أقل أو يغيب بعد الواجهة أو في النهاية." },
          business: { summary: "في صفحة هبوط طويلة، لا يتكرر الزر الرئيسي بما يكفي.", detail: "الزائر الذي يقتنع في منتصف الصفحة أو آخرها يضطر للتمرير إلى الأعلى ليتصرف. بعضهم لا يفعل، ويتلاشى القرار." },
          step: "اطلب من المطوّر تكرار الزر الرئيسي في صفحة الهبوط 4 مرات على الأقل: مباشرة بعد الواجهة الرئيسية، وبين الأقسام الأساسية، وفي النهاية. كل نسخة بالنص نفسه وتؤدي إلى الإجراء نفسه.",
          doneWhen: "عند تمرير صفحة الهبوط على الجوال يظهر الزر الرئيسي 4 مرات على الأقل، منها مباشرة بعد الواجهة الرئيسية وفي النهاية.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة الهبوط في متجرك طويلة، وزر الشراء ما يتكرر كفاية.", detail: "العميل اللي يقتنع في نص الصفحة لازم يرجع لفوق عشان يشتري. بعضهم ما يكلف نفسه، وتروح عليك بيعة كانت شبه مضمونة." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين اللي بيعملوا scroll في الصفحة الطويلة بيتوهوا عن الزرار الرئيسي، فالـ CVR أقل والـ CPA أعلى.", detail: "اللي بيقتنع تحت مش لاقي زرار قريب، وبعضهم بيخرج بدل ما يطلع لفوق. تكرار الزرار بيحوّل أكتر من نفس الكليكات. تعديل الصفحة عند صاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "صفحة الهبوط في المتجر طويلة، ولا يتكرر الزر الرئيسي فيها بما يكفي.", detail: "الزائر الذي يقتنع في منتصف الصفحة أو آخرها يضطر للتمرير إلى الأعلى ليتصرف. بعضهم لا يفعل، فيخسر المتجر مبيعات كانت قريبة." } },
      },
    },
  },

  // Main buttons carry a specific benefit or next-step label, not Submit, Click here or Learn more.
  "LAND-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the labels of the landing page's main buttons for a specific benefit or next step, against generic labels such as Submit, Click here or Learn more. The main buttons say what happens next." },
          business: { summary: "The landing page's buttons say what the visitor gets.", detail: "Labels that name the next step, such as Add to cart, tell visitors what the tap does before they tap." },
          protect: "Use the same specific kind of label on any new button or section added to the page.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the labels of the landing page's main buttons for a specific benefit or next step, against generic labels such as Submit, Click here or Learn more. At least one main button uses a generic label that doesn't say what happens next." },
          business: { summary: "Some main buttons on the landing page use vague labels.", detail: "A label like Learn more or Submit doesn't say what the visitor gets. Visitors hesitate on buttons that hide what comes next, and some don't tap at all." },
          step: "Rename each main button on the landing page to what the visitor gets or does next, such as Add to cart, Order now or Choose your size. The store owner or developer changes the label in the theme or page builder.",
          doneWhen: "No main button on the landing page reads Submit, Click here or Learn more, and each label says what happens next.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some main buttons on your landing page have vague labels.", detail: "A button that says Learn more or Submit doesn't tell shoppers what they get. Some hesitate and don't tap, and those taps were steps toward a sale." } },
      },
      media_buyer: {
        fail: { business: { summary: "Main buttons on the landing page use vague labels, so fewer paid visitors take the next step and CVR is lower.", detail: "A label that names the outcome moves more of the same clicks forward, which lowers CPA. Renaming the buttons is a quick change for the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "Some main buttons on the store's landing page use vague labels.", detail: "A label like Learn more or Submit doesn't say what the visitor gets. Visitors hesitate on buttons that hide what comes next, and some don't tap at all." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فُحصت نصوص الأزرار الرئيسية في صفحة الهبوط بحثًا عن فائدة محددة أو خطوة تالية، مقابل نصوص عامة مثل «إرسال» أو «اضغط هنا» أو «اعرف المزيد». الأزرار الرئيسية توضح ما يحدث بعدها." },
          business: { summary: "أزرار صفحة الهبوط توضح ما سيحصل عليه الزائر.", detail: "النصوص التي تسمي الخطوة التالية، مثل «أضف إلى السلة»، تخبر الزائر بما يفعله الزر قبل الضغط." },
          protect: "استخدم النوع نفسه من النصوص المحددة على أي زر أو قسم جديد يُضاف إلى الصفحة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فُحصت نصوص الأزرار الرئيسية في صفحة الهبوط بحثًا عن فائدة محددة أو خطوة تالية، مقابل نصوص عامة مثل «إرسال» أو «اضغط هنا» أو «اعرف المزيد». زر رئيسي واحد على الأقل يحمل نصًا عامًا لا يوضح ما يحدث بعده." },
          business: { summary: "بعض الأزرار الرئيسية في صفحة الهبوط تحمل نصوصًا مبهمة.", detail: "نص مثل «اعرف المزيد» أو «إرسال» لا يوضح ما سيحصل عليه الزائر. يتردد الزوار أمام الأزرار التي تخفي ما بعدها، وبعضهم لا يضغط أبدًا." },
          step: "غيّر نص كل زر رئيسي في صفحة الهبوط إلى ما يحصل عليه الزائر أو يفعله بعدها، مثل «أضف إلى السلة» أو «اطلب الآن» أو «اختر مقاسك». يغيّر صاحب المتجر أو المطوّر النص من القالب أو أداة بناء الصفحة.",
          doneWhen: "لا يحمل أي زر رئيسي في صفحة الهبوط نص «إرسال» أو «اضغط هنا» أو «اعرف المزيد»، وكل نص يوضح ما يحدث بعده.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض الأزرار الرئيسية في صفحة الهبوط بمتجرك نصوصها مو واضحة.", detail: "زر مكتوب عليه «اعرف المزيد» أو «إرسال» ما يقول للعميل وش بياخذ. بعضهم يتردد وما يضغط، وهالضغطات كانت خطوات نحو بيعة." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزراير الرئيسية في صفحة الهبوط نصوصها مبهمة، فزوار مدفوعين أقل بياخدوا الخطوة الجاية والـ CVR أقل.", detail: "النص اللي بيقول النتيجة بيحرّك أكتر من نفس الكليكات لقدام، وده بينزّل الـ CPA. تغيير نصوص الزراير تعديل سريع عند صاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "بعض الأزرار الرئيسية في صفحة الهبوط بالمتجر تحمل نصوصًا مبهمة.", detail: "نص مثل «اعرف المزيد» أو «إرسال» لا يوضح ما سيحصل عليه الزائر. يتردد الزوار أمام الأزرار التي تخفي ما بعدها، وبعضهم لا يضغط أبدًا." } },
      },
    },
  },

  // Form or buy box in the first phone screen, or directly after the headline, with no body copy to scroll past.
  "LAND-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked where the form or buy box sits on the landing page on a phone: in the first screen, or directly after the headline with no body copy before it. It meets one of the two." },
          business: { summary: "Visitors can start buying as soon as they land.", detail: "The buy box or form is right there, so a visitor who is ready doesn't have to look for it." },
          protect: "Keep new banners and text blocks below the buy box or form when updating the page.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked where the form or buy box sits on the landing page on a phone: in the first screen, or directly after the headline with no body copy before it. It sits further down, after body copy the visitor has to scroll past." },
          business: { summary: "Visitors have to scroll past text to reach the buy box or form.", detail: "Visitors who arrive ready to buy have to dig for the next step. Some read on and act, others leave before they find it." },
          step: "Ask the developer to move the buy box or form into the first phone screen, or directly under the headline. The longer description, details and stories go below it.",
          doneWhen: "On a phone, the buy box or form shows in the first screen of the landing page, or right after the headline with no text in between.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Shoppers on your landing page have to scroll past text before they can buy.", detail: "Someone who arrives ready to order has to dig for the buy button. Some find it, others leave first, and those were the easiest sales to make." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors have to scroll past text to reach the buy box, so CVR is lower and CPA higher.", detail: "The most ready clicks lose time looking for the next step, and some drop off. Putting the buy box in the first screen converts more of the same traffic. The page change goes to the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "Visitors to the store's landing page have to scroll past text to reach the buy box or form.", detail: "Visitors who arrive ready to buy have to dig for the next step. Some read on and act, others leave before they find it." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فُحص موضع النموذج أو صندوق الشراء في صفحة الهبوط على الجوال: في الشاشة الأولى، أو مباشرة بعد العنوان دون نص قبله. أحد الشرطين متحقق." },
          business: { summary: "يستطيع الزائر بدء الشراء فور وصوله.", detail: "صندوق الشراء أو النموذج أمامه مباشرة، فلا يبحث عنه الزائر الجاهز للشراء." },
          protect: "أبقِ البانرات والنصوص الجديدة تحت صندوق الشراء أو النموذج عند تحديث الصفحة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فُحص موضع النموذج أو صندوق الشراء في صفحة الهبوط على الجوال: في الشاشة الأولى، أو مباشرة بعد العنوان دون نص قبله. هو في موضع أسفل، بعد نص يضطر الزائر لتمريره." },
          business: { summary: "على الزائر تمرير نصوص ليصل إلى صندوق الشراء أو النموذج.", detail: "الزائر الذي يصل جاهزًا للشراء يضطر للبحث عن الخطوة التالية. بعضهم يكمل القراءة ويشتري، وآخرون يغادرون قبل أن يجدوها." },
          step: "اطلب من المطوّر نقل صندوق الشراء أو النموذج إلى الشاشة الأولى على الجوال، أو مباشرة تحت العنوان، ووضع الوصف الطويل والتفاصيل والقصص تحته.",
          doneWhen: "على الجوال، يظهر صندوق الشراء أو النموذج في الشاشة الأولى من صفحة الهبوط، أو مباشرة بعد العنوان دون نص بينهما.",
        },
      },
      store_owner: {
        fail: { business: { summary: "العميل في صفحة الهبوط بمتجرك لازم ينزل ويتعدى كلام قبل ما يقدر يشتري.", detail: "اللي يجي جاهز يطلب لازم يدوّر على زر الشراء. بعضهم يلقاه، وغيرهم يطلع قبل، وهذولا كانوا أسهل بيعات." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين لازم يعملوا scroll فوق كلام عشان يوصلوا لصندوق الشراء، فالـ CVR أقل والـ CPA أعلى.", detail: "أكتر الكليكات جاهزية بتضيّع وقت تدوّر على الخطوة الجاية، وبعضها بيخرج. إنك تحط صندوق الشراء في أول شاشة بيحوّل أكتر من نفس الترافيك. تعديل الصفحة عند صاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "على زوار صفحة الهبوط في المتجر تمرير نصوص للوصول إلى صندوق الشراء أو النموذج.", detail: "الزائر الذي يصل جاهزًا للشراء يضطر للبحث عن الخطوة التالية. بعضهم يكمل القراءة ويشتري، وآخرون يغادرون قبل أن يجدوها." } },
      },
    },
  },
};
