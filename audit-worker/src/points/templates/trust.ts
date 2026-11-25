import type { PointTemplate } from "./types.js";

export const TRUST: Record<string, PointTemplate> = {
  // collect.ts trust02: only when the store has reviews. Product page: a reviews link within 300px of the title
  // (or in the first 844px if the title isn't found) that shows a number; collection: at least half the cards show a rating.
  "TRUST-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The reviews link near the product title reads \"{link}\", and {cardsWithRating} of {cards} collection cards show a rating (at least half are needed)." },
          business: { summary: "Your ratings show next to the product title and on most product cards.", detail: "Shoppers see that others bought and liked a product before they open it, and again before they add it to the cart." },
          protect: "Keep asking recent buyers for a review so new products get ratings too.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Reviews link found on the product page: {link}. The rule needs a rating or review count within 300px of the product title, linking to the reviews, and a rating on at least half of the collection cards." },
          business: { summary: "The store has reviews, but they don't show where shoppers decide.", detail: "A rating next to the product title, and stars on product cards, show a first-time shopper that others bought. When they are missing or far down the page, more shoppers hesitate and leave." },
          step: "In your reviews app or theme settings, show the star rating with its count right under the product title, linked to the reviews section, and turn on star ratings on collection cards.",
          doneWhen: "On the product page, a rating with a number sits within 300px of the title and links to the reviews, and at least half of the collection page's cards show a rating.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store has reviews, but shoppers don't see them next to the product name or on the product cards.", detail: "Reviews from other buyers are what convince a hesitant first-time shopper. If the stars are hidden or far down the page, that shopper may leave without adding to cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store has reviews but hides them where paid shoppers decide, so cold traffic sees no proof others bought.", detail: "Cold paid shoppers who see no rating near the title tend to hesitate, which keeps CVR on product ads lower and CPA higher. The owner turns the ratings on in the reviews app or theme." } },
      },
      agency: {
        pass: { business: { summary: "The store's ratings show next to the product title and on most product cards.", detail: "Shoppers see that others bought and liked a product before they open it, and again before they add it to the cart." } },
        fail: { business: { summary: "The store has reviews, but they don't show where shoppers decide.", detail: "A rating next to the product title, and stars on product cards, show a first-time shopper that others bought. When they are missing or far down the page, more shoppers hesitate and leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "التقييم يظهر قرب عنوان المنتج ويربط بالمراجعات، ويظهر على نصف بطاقات التصنيف أو أكثر.", detail: "رابط المراجعات قرب عنوان المنتج: \"{link}\"، و{cardsWithRating} من {cards} بطاقة في صفحة التصنيف تعرض تقييمًا (المطلوب النصف على الأقل)." },
          business: { summary: "التقييمات تظهر بجانب عنوان المنتج وعلى أغلب بطاقات المنتجات.", detail: "يرى العميل أن غيره اشترى المنتج وأعجبه قبل أن يفتحه، ومرة أخرى قبل أن يضيفه للسلة." },
          protect: "استمر في طلب التقييم من المشترين الجدد حتى تحصل المنتجات الجديدة على تقييمات أيضًا.",
        },
        fail: {
          technical: { summary: "للمتجر تقييمات، لكنها لا تظهر قرب عنوان المنتج أو على نصف بطاقات التصنيف على الأقل.", detail: "المطلوب تقييم أو عدد مراجعات على بعد 300px أو أقل من عنوان المنتج، مع رابط إلى المراجعات، وتقييم على نصف بطاقات صفحة التصنيف على الأقل." },
          business: { summary: "للمتجر تقييمات، لكنها لا تظهر في المكان الذي يقرر فيه العميل.", detail: "التقييم بجانب عنوان المنتج والنجوم على البطاقات تُظهر للعميل الجديد أن غيره اشترى. وحين تغيب أو تكون في أسفل الصفحة يتردد عملاء أكثر ويغادرون." },
          step: "من تطبيق التقييمات أو إعدادات القالب، اعرض النجوم مع عدد التقييمات تحت عنوان المنتج مباشرة مع رابط إلى قسم المراجعات، وفعّل النجوم على بطاقات التصنيف.",
          doneWhen: "في صفحة المنتج، يظهر تقييم برقم على بعد 300px أو أقل من العنوان ويربط بالمراجعات، ونصف بطاقات صفحة التصنيف على الأقل تعرض تقييمًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك فيه تقييمات، بس العميل ما يشوفها جنب اسم المنتج ولا على بطاقات المنتجات.", detail: "تقييمات المشترين هي اللي تقنع العميل المتردد أول مرة. وإذا النجوم مخفية أو تحت في الصفحة، ممكن يطلع بدون ما يضيف للسلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "المتجر عنده reviews بس مخبيها في المكان اللي العميل المدفوع بيقرر فيه، فالترافيك البارد مش شايف دليل إن غيره اشترى.", detail: "العميل البارد اللي مش شايف تقييم جنب العنوان غالبًا بيتردد، وده بيخلّي الـ CVR على إعلانات المنتجات أقل والـ CPA أعلى. صاحب المتجر يفعّل التقييمات من تطبيق الـ reviews أو الثيم." } },
      },
      agency: {
        fail: { business: { summary: "للمتجر تقييمات، لكنها لا تظهر في المكان الذي يقرر فيه العميل.", detail: "التقييم بجانب عنوان المنتج والنجوم على البطاقات تُظهر للعميل الجديد أن غيره اشترى، وحين تغيب أو تكون في أسفل الصفحة يتردد عملاء أكثر ويغادرون." } },
      },
    },
  },

  // facts.ts trust09: scans every loaded page except checkout; pass names home, collection, product and cart.
  "TRUST-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "We scanned the text and links of each page we visited, checkout aside, for Lorem ipsum, demo addresses, theme-demo links and placeholder text." },
          business: { summary: "Your pages show your own content, with no leftover template text.", detail: "Shoppers see a finished store, which is one of the first things they judge before trusting it with a payment." },
          protect: "Before publishing a new page or theme section, read it once on a phone for sample text or demo links.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Template or placeholder content was found on {hits} page(s). The scan covers text and links on every page we visited except checkout." },
          business: { summary: "Some pages still show template text or demo content from the theme.", detail: "Sample text like Lorem ipsum, or a demo address, makes a store look unfinished or fake. Shoppers who notice it often won't trust it with their payment." },
          step: "Open each page named in this finding, replace the sample text, demo address or demo link with your own content, or remove the section.",
          doneWhen: "A re-scan finds no Lorem ipsum, demo address, theme-demo link or placeholder text on the home, collection, product and cart pages.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some pages in your store still show sample text or demo content from the theme.", detail: "Text like Lorem ipsum, or a demo address, makes your store look unfinished. Shoppers who see it often don't trust it enough to pay." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store shows leftover template or demo content, so paid visitors see a store that looks unfinished.", detail: "Cold traffic judges trust fast, and sample text pushes some of it away before buying: CVR down, CPA up. The owner replaces the content." } },
      },
      agency: {
        pass: { business: { summary: "The store's pages show its own content, with no leftover template text.", detail: "Shoppers see a finished store, which is one of the first things they judge before trusting it with a payment." } },
        fail: { business: { summary: "Some of the store's pages still show template text or demo content from the theme.", detail: "Sample text like Lorem ipsum, or a demo address, makes a store look unfinished or fake. Shoppers who notice it often won't trust it with their payment." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا يوجد نص تجريبي أو عنوان أو رابط من نسخة القالب التجريبية في الصفحات التي زرناها.", detail: "فحصنا نصوص وروابط كل صفحة زرناها، عدا الدفع، بحثًا عن Lorem ipsum والعناوين التجريبية وروابط نسخة القالب التجريبية والنصوص المؤقتة." },
          business: { summary: "الصفحات تعرض محتوى المتجر نفسه بدون بقايا نصوص القالب.", detail: "يرى العميل متجرًا مكتملًا، وهذا من أول ما يحكم عليه قبل أن يثق به في الدفع." },
          protect: "قبل نشر أي صفحة أو قسم جديد في القالب، اقرأه مرة على الجوال بحثًا عن نص تجريبي أو رابط تجريبي.",
        },
        fail: {
          technical: { summary: "وُجد محتوى تجريبي أو نص مؤقت من القالب.", detail: "وُجد المحتوى التجريبي في {hits} صفحة. يشمل الفحص النصوص والروابط في كل صفحة زرناها عدا الدفع." },
          business: { summary: "بعض الصفحات ما زالت تعرض نصوصًا أو محتوى تجريبيًا من القالب.", detail: "نص مثل Lorem ipsum أو عنوان تجريبي يجعل المتجر يبدو غير مكتمل أو غير حقيقي. والعميل الذي يلاحظه غالبًا لا يثق به في الدفع." },
          step: "افتح كل صفحة مذكورة، واستبدل النص أو العنوان أو الرابط التجريبي بمحتوى المتجر، أو احذف القسم.",
          doneWhen: "لا يجد الفحص التالي Lorem ipsum ولا عنوانًا تجريبيًا ولا رابطًا لنسخة القالب التجريبية ولا نصًا مؤقتًا في الرئيسية والتصنيف والمنتج والسلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه صفحات في متجرك لسا فيها نصوص أو محتوى تجريبي من القالب.", detail: "نص مثل Lorem ipsum أو عنوان تجريبي يخلي متجرك يبان مو مكتمل. والعميل اللي يشوفه غالبًا ما يثق يدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "المتجر فيه محتوى تجريبي من الثيم، فالزائر المدفوع بيشوف متجر شكله مش مكتمل.", detail: "الترافيك البارد بيحكم على الثقة بسرعة، والنص التجريبي بيطفّش جزء منه قبل الشراء: الـ CVR بيقل والـ CPA بيعلى. صاحب المتجر يغيّر المحتوى." } },
      },
      agency: {
        fail: { business: { summary: "بعض صفحات المتجر ما زالت تعرض نصوصًا أو محتوى تجريبيًا من القالب.", detail: "نص مثل Lorem ipsum أو عنوان تجريبي يجعل المتجر يبدو غير مكتمل أو غير حقيقي، والعميل الذي يلاحظه غالبًا لا يثق به في الدفع." } },
      },
    },
  },
};
