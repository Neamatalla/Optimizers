import { useEffect, useState, type RefObject } from "react";
import { isNavScrolling, onNavScrollEnd } from "./index";

/**
 * True while the element crosses the middle of the viewport — "on screen" for
 * tall, sticky or scroll-driven sections where a ratio threshold misleads.
 * Stays false while a nav click is smooth-scrolling past the element, and is
 * re-checked when that scroll settles.
 * Pass a resetKey (e.g. isMobile) when the ref moves to a different element.
 */
export function useOnScreenCenter(ref: RefObject<Element | null>, resetKey?: unknown): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const crossesMiddle = () => {
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      return r.top <= mid && r.bottom >= mid;
    };
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting && !isNavScrolling()), { rootMargin: "-49% 0px -50% 0px" });
    io.observe(el);
    const off = onNavScrollEnd(() => setOnScreen(crossesMiddle()));
    return () => { io.disconnect(); off(); };
  }, [ref, resetKey]);
  return onScreen;
}
