import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealOptions {
    /** IntersectionObserver threshold (0–1). Default: 0.15 */
    threshold?: number;
    /** Root margin string. Default: '0px 0px -60px 0px' (trigger slightly before fully visible) */
    rootMargin?: string;
    /** If true, only animate once (don't re-hide). Default: true */
    once?: boolean;
}

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Returns a ref to attach to the element and a boolean `isVisible`.
 *
 * Usage:
 *   const [ref, isVisible] = useScrollReveal();
 *   <div ref={ref} className={isVisible ? 'reveal-visible' : 'reveal-hidden'}>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: ScrollRevealOptions = {}
): [React.RefObject<T | null>, boolean] {
    const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
    const ref = useRef<T | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const hasTriggered = useRef(false);

    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (once) hasTriggered.current = true;
            } else if (!once && !hasTriggered.current) {
                setIsVisible(false);
            }
        },
        [once]
    );

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Skip on desktop — these animations are mobile-only
        if (window.innerWidth >= 1024) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(handleIntersect, {
            threshold,
            rootMargin,
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, rootMargin, handleIntersect]);

    return [ref, isVisible];
}

export default useScrollReveal;
