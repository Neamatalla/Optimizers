import type { PointTemplate } from "./types.js";
import { BUYING_PATH } from "./buying-path.js";
import { NAVIGATION } from "./navigation.js";
import { PRODUCT_PAGE } from "./product-page.js";
import { SPEED } from "./speed.js";
import { TRACKING } from "./tracking.js";
import { TRACKING_2 } from "./tracking-2.js";
import { TRACKING_3 } from "./tracking-3.js";
import { TRACKING_4 } from "./tracking-4.js";
import { COLLECTION } from "./collection.js";
import { HOMEPAGE } from "./homepage.js";
import { TRUST } from "./trust.js";
import { OFFERS } from "./offers.js";
import { LANDING } from "./landing.js";
import { FINDABILITY } from "./findability.js";
import { RISK } from "./risk.js";
import { FRAMES_TRACKING } from "./frames-tracking.js";
import { FRAMES_PATH } from "./frames-path.js";
import { FRAMES_PDP_HOME } from "./frames-pdp-home.js";
import { FRAMES_TRUST } from "./frames-trust.js";
import { FRAMES_OFFERS } from "./frames-offers.js";
import { FRAMES_LANDING } from "./frames-landing.js";

export type * from "./types.js";

/** Report text by master point id (see types.ts). One file per category. */
export const TEMPLATES: Record<string, PointTemplate> = {
  ...TRACKING, ...TRACKING_2, ...TRACKING_3, ...TRACKING_4, ...BUYING_PATH, ...PRODUCT_PAGE, ...COLLECTION, ...HOMEPAGE, ...NAVIGATION,
  ...TRUST, ...OFFERS, ...LANDING, ...SPEED, ...FINDABILITY, ...RISK,
  // Frames for AI-judged points.
  ...FRAMES_TRACKING, ...FRAMES_PATH, ...FRAMES_PDP_HOME, ...FRAMES_TRUST, ...FRAMES_OFFERS, ...FRAMES_LANDING,
};
