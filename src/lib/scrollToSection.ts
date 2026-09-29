/**
 * Scrolls to an element by id, correcting the scroll position as the page
 * keeps growing — needed for any target that sits behind a React.lazy +
 * Suspense boundary (or behind one earlier in the tree). A plain
 * `getElementById(id)?.scrollIntoView(...)` either no-ops if the chunk
 * hasn't mounted yet, or scrolls to a position that a still-loading section
 * above the target invalidates a moment later (the browser never
 * re-adjusts scrollTop when content above the viewport grows).
 *
 * Returns a cancel function (e.g. for a caller's effect cleanup); safe to
 * ignore for a one-shot click handler.
 */
export function scrollToSection(id: string): () => void {
  let stopped = false;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  const scrollNow = () => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    resizeObserver.disconnect();
    if (settleTimer) clearTimeout(settleTimer);
    clearTimeout(hardStop);
  };
  // No further layout changes for 1s straight — the page has settled.
  const armSettleTimer = () => {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(stop, 1000);
  };

  const resizeObserver = new ResizeObserver(() => {
    if (stopped) return;
    scrollNow();
    armSettleTimer();
  });
  resizeObserver.observe(document.body);

  scrollNow();
  armSettleTimer();
  // Absolute ceiling regardless of ongoing layout churn.
  const hardStop = setTimeout(stop, 8000);

  return stop;
}
