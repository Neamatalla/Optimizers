import { useEffect, type RefObject } from "react";
import { track, type TrackParams } from "./index";
import type { TrackingEventName } from "./events";

type VideoEvents = { start: TrackingEventName; pause: TrackingEventName; resume: TrackingEventName; progress: TrackingEventName; complete: TrackingEventName };

/**
 * Tracks a YouTube embed (needs enablejsapi=1 in its src) through the iframe
 * postMessage API: start, pause, resume, 25/50/75% progress, complete.
 */
export function useYouTubeTracking(iframeRef: RefObject<HTMLIFrameElement | null>, active: boolean, events: VideoEvents, base: TrackParams) {
  useEffect(() => {
    if (!active) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let started = false, paused = false, completed = false, gotMessage = false;
    let duration = 0, currentTime = 0, title = "";
    const firedProgress = new Set<number>();

    const params = (): TrackParams => ({
      ...base,
      video_provider: "youtube",
      video_title: title || (base.video_title as string),
      video_duration: duration ? Math.round(duration) : undefined,
      video_current_time: Math.round(currentTime),
      video_percent: duration ? Math.min(100, Math.round((currentTime / duration) * 100)) : undefined,
    });

    // YouTube only starts reporting after it receives "listening"; repeat until it answers.
    const listen = () => iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "ga-video", channel: "widget" }), "*");
    const retry = window.setInterval(() => { if (gotMessage) window.clearInterval(retry); else listen(); }, 500);
    iframe.addEventListener("load", listen);

    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow || !/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
      let data: any;
      try { data = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      gotMessage = true;
      const info = data?.info;
      if (!info || typeof info !== "object") return;
      if (typeof info.duration === "number" && info.duration > 0) duration = info.duration;
      if (typeof info.currentTime === "number") currentTime = info.currentTime;
      if (info.videoData?.title) title = info.videoData.title;

      if (started && duration) {
        const pct = (currentTime / duration) * 100;
        for (const mark of [25, 50, 75]) {
          if (pct >= mark && !firedProgress.has(mark)) { firedProgress.add(mark); track(events.progress, { ...params(), video_percent: mark }); }
        }
      }
      const state = info.playerState;
      if (state === 1) {
        if (!started) { started = true; track(events.start, params()); }
        else if (paused) track(events.resume, params());
        paused = false;
      } else if (state === 2 && started && !paused && !completed) {
        paused = true;
        track(events.pause, params());
      } else if (state === 0 && started && !completed) {
        completed = true;
        currentTime = duration || currentTime;
        track(events.complete, { ...params(), video_percent: 100 });
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.clearInterval(retry);
      iframe.removeEventListener("load", listen);
      window.removeEventListener("message", onMessage);
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
}
