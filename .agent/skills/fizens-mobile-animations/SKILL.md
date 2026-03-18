---
name: fizens-mobile-animations
description: Fizens-inspired mobile animation patterns — scroll reveals, spring transitions, floating elements, stagger effects, touch feedback, and glow pulses. Use for polishing mobile UX on dark-theme SaaS websites.
---

# Fizens Mobile Animation Patterns

Reference patterns extracted from [Fizens Finance SaaS Template](https://fizens.framer.ai/) for reuse in mobile-first dark-theme websites.

## Core Architecture

### 1. Scroll-Reveal Hook (IntersectionObserver)
Lightweight React hook that triggers CSS class changes when elements enter the viewport. Desktop auto-bypass at ≥1024px.

```typescript
// src/hooks/useScrollReveal.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealOptions {
  threshold?: number;      // 0–1, default 0.15
  rootMargin?: string;     // default '0px 0px -60px 0px'
  once?: boolean;          // default true
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggered = useRef(false);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      setIsVisible(true);
      if (once) hasTriggered.current = true;
    } else if (!once && !hasTriggered.current) {
      setIsVisible(false);
    }
  }, [once]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Skip on desktop — mobile-only animations
    if (window.innerWidth >= 1024) { setIsVisible(true); return; }
    const observer = new IntersectionObserver(handleIntersect, { threshold, rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, handleIntersect]);

  return [ref, isVisible];
}
```

**Usage:**
```tsx
const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });
<div ref={ref} className={isVisible ? 'reveal-visible' : 'reveal-hidden'}>
  Content
</div>
```

---

## Animation Patterns

### 2. Fade-Up Entrance (Slide + Fade)
The foundation animation — elements start 32px below and faded out, then animate into place.

```css
.reveal-hidden {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Key easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — this is a "spring-like" curve that overshoots slightly for a premium feel.

### 3. Staggered Entrance
Cards, list items, or grid children animate in one-by-one with increasing delays.

```css
.reveal-stagger-0 { transition-delay: 0ms; }
.reveal-stagger-1 { transition-delay: 120ms; }
.reveal-stagger-2 { transition-delay: 240ms; }
.reveal-stagger-3 { transition-delay: 360ms; }
/* etc. */
```

**Best practice:** Use 100–150ms between items for noticeable cascade. Under 80ms is too subtle. Over 200ms feels sluggish.

**Usage with scroll-reveal:**
```tsx
{items.map((item, i) => (
  <div className={`${isVisible ? 'reveal-visible' : 'reveal-hidden'} reveal-stagger-${i}`}>
    {item}
  </div>
))}
```

### 4. Scale Entrance Variant
Alternative to slide-up — elements scale from 94% to 100%.

```css
.reveal-scale.reveal-hidden { transform: scale(0.94); }
.reveal-scale.reveal-visible { transform: scale(1); }
```

### 5. Floating / Breathing Animation
Subtle continuous up/down motion for icons, badges, or decorative elements.

```css
@keyframes float-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.float-bob { animation: float-bob 3s ease-in-out infinite; }
/* Stagger so icons aren't in sync */
.float-bob-0 { animation-delay: 0s; }
.float-bob-1 { animation-delay: 0.3s; }
.float-bob-2 { animation-delay: 0.6s; }
```

### 6. CTA Glow Pulse
Pulsing glow on call-to-action buttons to draw attention.

```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 25px rgba(106, 228, 153, 0.3),
                inset 0 0 30px rgba(106, 228, 153, 0.6);
  }
  50% {
    box-shadow: 0 0 40px rgba(106, 228, 153, 0.5),
                inset 0 0 40px rgba(106, 228, 153, 0.8);
  }
}
.cta-glow-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
```

Adjust `rgba(106, 228, 153, ...)` to match your brand's accent color.

### 7. Spring-Like Carousel Transitions
Replace default `ease` with spring easing for carousel card transitions.

```css
.carousel-spring {
  transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

Combine with a subtle `translateY(12px)` on hidden cards for a "slide up into place" feel.

### 8. Mobile Nav Link Cascade
When the hamburger menu opens, links stagger in one-by-one.

```css
.nav-link-stagger {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link-stagger.nav-link-visible {
  opacity: 1;
  transform: translateY(0);
}
.nav-link-stagger:nth-child(1) { transition-delay: 0.05s; }
.nav-link-stagger:nth-child(2) { transition-delay: 0.10s; }
/* etc. */
```

**Trigger:** Apply `nav-link-visible` class when the menu `isOpen` state is true.

### 9. Mobile Tap Feedback
Subtle scale-down on touch/tap for interactive elements.

```css
@media (max-width: 1023px) {
  .tap-feedback {
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .tap-feedback:active { transform: scale(0.96) !important; }

  .tap-feedback-card {
    transition: transform 0.1s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .tap-feedback-card:active { transform: scale(0.98) !important; }
}
```

### 10. Desktop Override
Always bypass mobile-only animations on desktop to avoid interfering with desktop layout.

```css
@media (min-width: 1024px) {
  .reveal-hidden {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

---

## Design Principles

### Dark Theme Adaptation
- Use **inset box-shadows** with brand-color translucency for glow effects (not solid borders)
- `backdrop-filter: blur()` on nav and overlays for glassmorphism depth
- Gradient borders via `background: linear-gradient(...)` on a 1px padding wrapper

### Animation Timing Guidelines
| Animation Type | Duration | Delay Between Items |
|---|---|---|
| Fade-up entrance | 600–800ms | 100–150ms stagger |
| Scale entrance | 500–700ms | 80–120ms stagger |
| Float/bob loop | 2.5–3.5s | 0.3s offset per icon |
| Glow pulse | 2–3s | N/A (continuous) |
| Tap feedback | 100–150ms | N/A |
| Nav link cascade | 400ms | 50ms per link |

### Performance Notes
- Use `IntersectionObserver` not scroll event listeners
- Prefer CSS transitions over JS animation libraries
- Use `translateY` and `scale` (GPU-composited), avoid `top`/`left`
- `will-change: transform, opacity` only when actively animating
- Always add `-webkit-tap-highlight-color: transparent` on touch targets
