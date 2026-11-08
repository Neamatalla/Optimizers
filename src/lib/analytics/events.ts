/**
 * Tracking plan: every dataLayer event the site can push, with its category.
 *
 * This file is the single source of truth. The GTM side (one Custom Event
 * trigger + one GA4 Event tag per category) is generated from it, so an event
 * added here must keep a category below or GTM will not send it to GA4.
 *
 * Naming: <area>_<element>_<action>, snake_case, <= 40 chars (GA4 limit).
 */

export const EVENT_CATEGORIES = [
  "navigation",
  "cta",
  "social",
  "slider",
  "video",
  "roi_calculator",
  "form",
  "calendly",
  "faq",
  "engagement",
  "fallback",
  "performance",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const TRACKING_EVENTS = {
  // ── Header (desktop nav + language switch, shown on every layout) ──
  header_nav_services_click: "navigation",
  header_nav_about_us_click: "navigation",
  header_nav_roi_calculator_click: "navigation",
  header_nav_case_studies_click: "navigation",
  header_nav_team_click: "navigation",
  header_nav_contact_click: "navigation",
  header_language_switch_click: "navigation",
  header_book_call_click: "cta",

  // ── Mobile menu (hamburger overlay) ──
  mobile_menu_open: "navigation",
  mobile_menu_close: "navigation",
  mobile_menu_nav_services_click: "navigation",
  mobile_menu_nav_about_us_click: "navigation",
  mobile_menu_nav_roi_calculator_click: "navigation",
  mobile_menu_nav_case_studies_click: "navigation",
  mobile_menu_nav_team_click: "navigation",
  mobile_menu_nav_contact_click: "navigation",
  mobile_menu_social_facebook_click: "social",
  mobile_menu_social_instagram_click: "social",
  mobile_menu_social_x_click: "social",
  mobile_menu_social_linkedin_click: "social",
  mobile_menu_book_call_click: "cta",

  // ── Page section CTAs ──
  services_book_call_click: "cta",
  top_clients_book_consultation_click: "cta",
  guarantee_book_call_click: "cta",
  process_book_call_click: "cta",
  faq_book_call_click: "cta",
  footer_cta_success_story_click: "cta",

  // ── Top clients & results slider (#case-studies) ──
  top_clients_slider_prev_click: "slider",
  top_clients_slider_next_click: "slider",
  top_clients_slider_dot_click: "slider",
  top_clients_slider_swipe: "slider",
  top_clients_slide_view: "slider",

  // ── Case studies (scroll gate on desktop, slider on mobile) ──
  case_studies_slider_prev_click: "slider",
  case_studies_slider_next_click: "slider",
  case_studies_slider_dot_click: "slider",
  case_study_view: "slider",

  // ── CEO video (YouTube embed) ──
  ceo_video_play_click: "video",
  ceo_video_start: "video",
  ceo_video_pause: "video",
  ceo_video_resume: "video",
  ceo_video_progress: "video",
  ceo_video_complete: "video",

  // ── ROI calculator ──
  roi_calculator_engaged: "roi_calculator",
  roi_currency_select: "roi_calculator",
  roi_visitors_change: "roi_calculator",
  roi_conversion_rate_change: "roi_calculator",
  roi_avg_order_value_change: "roi_calculator",
  roi_lift_select: "roi_calculator",
  roi_reset_click: "roi_calculator",

  // ── Strategy session form (#contact) ──
  strategy_form_step_view: "form",
  strategy_form_start: "form",
  strategy_form_traffic_select: "form",
  strategy_form_conversions_select: "form",
  strategy_form_objective_select: "form",
  strategy_form_custom_objective_focus: "form",
  strategy_form_custom_objective_complete: "form",
  strategy_form_website_focus: "form",
  strategy_form_website_complete: "form",
  strategy_form_first_name_focus: "form",
  strategy_form_first_name_complete: "form",
  strategy_form_email_focus: "form",
  strategy_form_email_complete: "form",
  strategy_form_validation_error: "form",
  strategy_form_next_click: "form",
  strategy_form_back_click: "form",
  strategy_form_stepper_click: "form",
  strategy_form_submit_click: "form",
  strategy_form_submit_success: "form",
  strategy_form_submit_error: "form",
  strategy_form_abandon: "form",
  generate_lead: "form",

  // ── Calendly widget (last form step) ──
  calendly_profile_view: "calendly",
  calendly_event_type_view: "calendly",
  calendly_date_time_select: "calendly",
  calendly_event_scheduled: "calendly",

  // ── FAQ ──
  faq_question_expand: "faq",
  faq_question_collapse: "faq",

  // ── Footer ──
  footer_social_facebook_click: "social",
  footer_social_x_click: "social",
  footer_social_linkedin_click: "social",
  footer_social_instagram_click: "social",
  footer_nav_about_click: "navigation",
  footer_nav_services_click: "navigation",
  footer_nav_roi_calculator_click: "navigation",
  footer_nav_blog_click: "navigation",
  footer_nav_contact_click: "navigation",

  // ── Global ──
  scroll_to_top_click: "navigation",
  section_view: "engagement",
  page_scroll_depth: "engagement",
  page_time_milestone: "engagement",
  ui_click_untagged: "fallback",

  // ── Performance & errors ──
  web_vital: "performance",
  js_error: "performance",
} as const satisfies Record<string, EventCategory>;

export type TrackingEventName = keyof typeof TRACKING_EVENTS;
