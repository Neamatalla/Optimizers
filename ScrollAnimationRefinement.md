# Scroll-Triggered Fixed-Duration Animations

This document outlines the technical approach used to transition from direct scroll-scrubbing to a more refined, professional "triggered" animation system.

## The Problem
Direct scroll-scrubbing (linking animation progress directly to scroll position) often feels jumpy or "flashes" past if the user scrolls quickly. It lacks the deliberate feel of premium UI transitions.

## The Solution: The "Trigger & Animate" Pattern

### 1. Section Structure
Use a long scroll container (e.g., `350vh`) to provide enough "scrolling room" without requiring excessive effort.
- **Sticky Wrapper**: Keep the content centered and "stuck" to the screen while the user scrolls through the container.

### 2. Threshold Detection
Instead of linking values to `scrollYProgress` directly, use it as a trigger for a state change.
```tsx
const { scrollYProgress } = useScroll({ target: containerRef });
const [activeIndex, setActiveIndex] = useState(0);

useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Determine which slide should be active (e.g., in 20% increments)
    const index = Math.min(Math.floor(latest / 0.2), MAX_INDEX);
    if (index !== activeIndex) setActiveIndex(index);
});
```

### 3. Time-Based Animations
Use the `animate` function inside a `useEffect` that listens to `activeIndex`. This ensures that once a user hits a scroll threshold, the animation plays for a **fixed duration** (e.g., 0.5s or 1s) regardless of how fast they keep scrolling.

```tsx
useEffect(() => {
    const DURATION = 0.5;
    const EASE = "easeInOut";

    // Handle all slides in parallel
    slides.forEach((_, i) => {
        animate(opacities[i], i === activeIndex ? 1 : 0, { duration: DURATION, ease: EASE });
        
        let targetY = i < activeIndex ? '-30%' : (i > activeIndex ? '30%' : '0%');
        animate(positions[i], targetY, { duration: DURATION, ease: EASE });
    });
}, [activeIndex]);
```

### 4. Handling Intro "Gates" (Hybrid Approach)
For interactive intros (like "opening" bars), use a hybrid approach where the **Intro is scroll-based** (direct scrubbing) and the **Slides are time-based**.

- **Gate (0% to 15% scroll)**: `useTransform(scrollYProgress, [0, 0.15], [...])`
- **Slide 1 (Starts at 20% scroll)**: Triggered when `activeIndex` hits 1.
- **Tip**: Ensure a small "gap" (e.g., 15% to 20%) between the gate ending and the first slide starting to prevent visual overlap.

## Key Optimizations Made
- **Container Height**: Reduced to `350vh` to make "slide jumping" feel snappy rather than a chore.
- **Hook Rules**: Always define `useTransform` at the component's top level. Never create transforms inside the `render` style objects, as this will crash the page (White Screen of Death).
- **Duration Tuning**:
    - **Top Clients**: 1s (Best for counting numbers and content reveal).
    - **Case Studies**: 0.5s (Best for quick, high-impact visuals).

## Implementation Checklist
1. [ ] Remove any wheel event listeners (avoid scroll hijacking).
2. [ ] Set container `min-height` in both CSS and inline styles.
3. [ ] Define `useMotionValue` arrays for opacities and positions.
4. [ ] Implement the `useMotionValueEvent` threshold listener.
5. [ ] Define the `animate` triggers inside `useEffect`.
