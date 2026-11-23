/**
 * How the AI decides the points it flipped on between two Regal runs
 * (23 Nov 2026). Each guide turns a vague line into a test two readers would
 * agree on, and says what to do when the evidence can't show it (answer
 * unverified: the browser step then tests it). Shown to the AI under the
 * point's PASS line as "How to decide".
 */
export const AI_GUIDES: Record<string, string> = {
  "PDP-19": "Look at the first-screen picture. Pass when Add to cart is the largest solid-filled button on that screen and no other solid button of equal size sits next to it. Its colour matching the header does not matter. Fail only when another button is larger or equally prominent.",
  "PDP-03": "Judge only the count and the content: count distinct image URLs and look for one in-use or close-detail shot. Ignore sharpness (code measures it, you can't see it). Pass with 4 or more and one in-use or detail shot. Fail with fewer than 4 images.",
  "PATH-17": "All three must show: an item count in the drawer title (for example 'Your cart (2)' or '2 items'), a clear × close, and full phone width. A missing count is a fail, even when the other two are fine.",
  "NAV-09": "Read the Arabic text in the evidence. Fail only when you can quote a clear spelling or translation error. Otherwise pass.",
  "OFFER-02": "Passing needs both parts: price by the title in local currency, and the price changing with the variant. If the evidence doesn't show the price changing, answer unverified.",
  "COL-03": "Passing needs the filter or sort controls above the grid and the default sort being a sensible one. If you can't read the default sort, answer unverified.",
  "OFFER-09": "A cart that already qualifies for free shipping may hide the bar. Fail only when the evidence shows a cart below the threshold with no bar or amount left. Otherwise answer unverified.",
  "HOME-07": "The benefit section must sit within the first 2 phone screens (about 1,700px from the top). Use the block positions in the evidence. If positions aren't given, answer unverified.",
  "SPEED-08": "List the tags that fire on All Pages from the GTM data. Pass when they are only core tags (consent, GA4 or Google tag, Conversion Linker, one analytics or heatmap tool). Fail when ad pixels or many tools fire there. Don't judge tag weight.",
  "PDP-15": "Only for bundles and sets. If the product is a single item, answer n/a. For a bundle, pass only when the page names each item in the package. A pack size alone (for example '5 jars') does not name the items.",
  "PDP-14": "Labelled tabs count as sections. Pass when the tabs or accordions together cover description, details and shipping or returns. Fail when there are no tabs or accordions at all. If tabs exist but their content isn't shown, answer unverified.",
  "PDP-04": "Pass when every option is a visible tile or swatch and the chosen one is highlighted. The sold-out part only matters when a sold-out option exists: if none is sold out, ignore it. A hidden select in the page code doesn't count against it.",
  "TRUST-03": "Fail only when you can see the reviews all have 5 stars across 10 or more reviews, or no reviews are dated. Pass when they are dated and the ratings vary or customer photos show. Otherwise unverified.",
  "TRUST-14": "Count customer photos or videos the evidence shows on product pages. Fail when the product page evidence shows its reviews with no customer photos. If the product page reviews aren't shown, answer unverified.",
  "OFFER-07": "Both places count: by Add to cart on the product page, and by the cart checkout button. Pass when payment icons or names sit by at least one of them and a secure-checkout line is near. Footer-only is a fail.",
  "OFFER-14": "Count the offer messages visible on the product page's first phone screen: promo bar, sale badge, floating discount tab, pop-up. Pass with 2 or fewer. Fail with 3 or more competing offers. Labels like 'limited quantity' are not offers.",
  "TRK-16": "If the store is not on Shopify, answer n/a.",
  "LAND-03": "Count the menu links and offers from the landing page evidence. If the landing page header and menu aren't shown separately, answer unverified.",
};
