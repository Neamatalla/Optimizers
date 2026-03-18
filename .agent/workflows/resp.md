---
description: Making any fixed-width section fully responsive across all desktop screen sizes using the two-layer viewport scaling pattern
---

## Step 1 — Identify the Design Canvas Size

Find the fixed width the section was designed at (usually in the component's CSS or JSX):

```css
width: 1440px; /* ← CANVAS_WIDTH */
height: 935px; /* ← CANVAS_HEIGHT */
```

## Step 2 — Set Up the Two-Layer CSS Structure

Replace any fixed-width wrapper with two layers:

```css
/* Layer 1: fills the viewport — never overflows */
.your-content-box {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

/* Layer 2: the actual fixed-size canvas, centered */
.your-content-scaler {
    position: absolute;
    width: 1440px;    /* ← CANVAS_WIDTH */
    height: 935px;    /* ← CANVAS_HEIGHT */
    top: 50%;
    left: 50%;
    translate: -50% -50%;
}
```

> IMPORTANT: `transform: scale()` does NOT affect CSS layout size. The outer box MUST be viewport-sized (`inset: 0`), otherwise the fixed-width canvas still causes layout overflow even when visually scaled.

## Step 3 — Compute Scale in the Component

Add this `useEffect` to the React component:

```tsx
const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 935;

const [scale, setScale] = useState(1);

useEffect(() => {
    const update = () => {
        const scaleX = window.innerWidth / CANVAS_WIDTH;
        const scaleY = window.innerHeight / CANVAS_HEIGHT;
        setScale(Math.min(scaleX, scaleY, 1)); // never upscale beyond 1
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
}, []);
```

Apply the scale to the inner canvas layer:

```tsx
<div className="your-content-box">
    <div
        className="your-content-scaler"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
        {/* all section content goes here */}
    </div>
</div>
```

## Step 4 — Use Canvas-Relative Units for Internal Positioning

Any elements positioned inside the canvas must use pixel values or percentages **of the canvas**, not the viewport:

| ✅ Do | ❌ Don't |
|---|---|
| `left: 50%` of the canvas box | `left: 13vw` |
| Motion `x` in pixels relative to canvas center | `left: 13%` of the viewport |
| `width: 200px` inside the canvas | `width: 14vw` |

## Step 5 — Standardize Animations Across Screen Sizes

Because the entire canvas is scaled by `transform: scale(n)`, animations defined in **canvas-pixel units** automatically scale with it. Follow these rules:

### ✅ Motion/Framer Motion values

Always express animation targets in **canvas pixels**, never `vw`/`vh`:

```tsx
// ✅ Correct — pixel offset relative to canvas center
const BAR_OPEN_PX = CANVAS_WIDTH / 2 - CANVAS_WIDTH * 0.09; // ~590px

// ❌ Wrong — viewport-relative, breaks on smaller screens
const BAR_OPEN_VW = window.innerWidth * 0.09;
```

For `useTransform` clip paths and percentages, express them as **percentages of the canvas element**, not the viewport:

```tsx
// ✅ Clip path as % of the canvas box
const clipPct = useTransform(progress, [0, 1], [50, 9]);
const clip = useTransform(clipPct, v => `inset(0 ${v}% 0 ${v}%)`);
```

### ✅ CSS keyframe animations

Animations defined in CSS (e.g. `@keyframes`, `animation`) that use `px` or `%` of the parent element are automatically scaled by the canvas transform. No changes needed.

Animations using `vw`/`vh` in keyframes will **not** scale correctly — convert them to `px` or `%` of the canvas:

```css
/* ❌ Wrong */
@keyframes slide { to { transform: translateX(10vw); } }

/* ✅ Correct */
@keyframes slide { to { transform: translateX(144px); } } /* 10% of 1440px canvas */
```

### ✅ Scroll-driven animations (`useScroll`, `useTransform`)

Scroll progress is viewport-relative and unaffected by canvas scale — this is fine. Only the **output values** (pixel offsets, sizes) must be canvas-relative:

```tsx
const { scrollYProgress } = useScroll({ target: ref });

// ✅ Output in canvas pixels
const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

// ❌ Output in viewport units
const y = useTransform(scrollYProgress, [0, 1], ['0vh', '-30vh']);
```

### ✅ Duration and easing

Timing (`duration`, `delay`, `ease`) is **not** affected by scale — keep it as-is. Do not adjust animation speed based on viewport size.

### ✅ `will-change` and GPU hints

Add `will-change: transform` to animated elements inside the canvas to prevent jank during scaling:

```css
.animated-element {
    will-change: transform;
}
```

## Scale Reference

| Screen | Viewport Width | Scale (1440px canvas) |
|---|---|---|
| 1440px+ | ≥ 1440px | `1.0` |
| ASUS X515E | 1366px | `0.948` |
| MacBook Pro 13" | 1280px | `0.889` |
| iPad landscape | 1024px | `0.711` |

## Checklist

- [ ] Identify `CANVAS_WIDTH` and `CANVAS_HEIGHT`
- [ ] Outer box: `position: absolute; inset: 0; overflow: hidden`
- [ ] Inner scaler: `position: absolute; width: CANVAS_WIDTH; height: CANVAS_HEIGHT; top: 50%; left: 50%; translate: -50% -50%`
- [ ] Add `useEffect` scale computation in the component
- [ ] Apply `transform: scale(n)` + `transformOrigin: center center` to the inner scaler
- [ ] Ensure all internal positioning uses canvas-relative units (not `vw`/`vh`)
- [ ] Motion animation targets use canvas pixels, not `vw`/`vh`
- [ ] CSS keyframe animations use `px` or canvas-`%`, not `vw`/`vh`
- [ ] `useTransform` output values are canvas-relative
- [ ] Add `will-change: transform` to heavily animated elements inside the canvas
