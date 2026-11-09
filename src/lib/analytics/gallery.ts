/**
 * "Behind The Scenes" gallery photos, named by what they show (same order as
 * ALL_IMAGES in src/imports/GallerySection.tsx). Sent as image_name /
 * image_description with gallery_image_view and gallery_image_click.
 * Note: #2 and #12 (team-photo.jpg) are the same portrait.
 */
export const GALLERY_IMAGES: { name: string; description: string }[] = [
  { name: "office_selfie_at_desks", description: "Selfie in the Optimizers office with a colleague at the desks" },
  { name: "workshop_attendee_at_table", description: "Attendee listening at a workshop table with laptop" },
  { name: "speaker_portrait_lanyard", description: "Smiling speaker with a lanyard holding a microphone" },
  { name: "cro_funnel_slide_presentation", description: "Presenter pointing at a CRO funnel slide (visitors x conversion rate)" },
  { name: "arab_affiliate_summit_keynote", description: "Keynote on stage at Arab Affiliate Summit with audience" },
  { name: "panel_speaker_saudi_egypt_flags", description: "Panel speaker with microphone next to Saudi and Egyptian flags" },
  { name: "attendee_taking_notes", description: "Attendee taking notes during a session" },
  { name: "outdoor_event_audience", description: "Large outdoor event audience under a canopy" },
  { name: "conference_hall_talk", description: "Talk in a large conference hall with a full audience" },
  { name: "arab_affiliate_summit_panel", description: "Speakers seated at the Arab Affiliate Summit panel table" },
  { name: "office_meeting_room_screen", description: "Team meeting in the office meeting room in front of a screen" },
  { name: "team_member_at_desk", description: "Team member working at a desk in the office" },
  { name: "speaker_portrait_lanyard_2", description: "Smiling speaker with a lanyard (same photo as speaker_portrait_lanyard)" },
  { name: "team_group_photo_office", description: "Optimizers team group photo in the office" },
];
