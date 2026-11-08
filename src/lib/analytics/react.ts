import { useEffect, useState, type RefObject } from "react";

/**
 * True while the element crosses the middle of the viewport — "on screen" for
 * tall, sticky or scroll-driven sections where a ratio threshold misleads.
 * Pass a resetKey (e.g. isMobile) when the ref moves to a different element.
 */
export function useOnScreenCenter(ref: RefObject<Element | null>, resetKey?: unknown): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "-49% 0px -50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, resetKey]);
  return onScreen;
}
