---
description: How to make a fixed-width website responsive across all screen sizes
---

# Making a Fixed-Width Website Responsive

## Problem
Website is designed at 1440px and uses hardcoded pixel widths throughout components, breaking layout on mobile, tablet, and laptop screens.

## Root Causes
1. **Hardcoded `w-[1440px]`** on layout containers causes horizontal overflow
2. **`vw`-based font sizes** (e.g. `text-[2.4vw]`) become unreadable on small screens
3. **Fixed pixel widths** (e.g. `w-[500px]`) overflow on mobile
4. **Scroll-hijack animations** that rely on viewport height break on touch devices
5. **Absolute positioning** with `left-1/2` and `-translate-x-1/2` on containers that exceed viewport width

## Fix Strategy

### Step 1: Create `responsive.css` with breakpoint system
- Import it as the FIRST import in `index.css`
- Define breakpoints: Mobile `< 768px`, Tablet `768–1023px`, Laptop `1024–1366px`, Desktop `1440px+`
- Add `overflow-x: hidden` on `html, body` for `< 1024px`

### Step 2: Fix the header container
- Add `max-w-[100vw]` to the header element alongside its `w-[1440px]`
- Add `w-full max-w-[1440px]` to the header's parent wrapper
- CSS rule: `[data-name="Header"] { width: 100% !important; max-width: 100vw !important; }`

### Step 3: Add hamburger menu for mobile
- Create a `.mobile-menu-btn` button with 3 `<span>` elements
- Create a `.mobile-nav-overlay` fixed fullscreen overlay
- Show hamburger at `< 1024px` via `@media (max-width: 1023px)`
- Hide desktop nav links: `[data-name="Links"] { display: none !important; }`
- Add React `useState` for open/close state

### Step 4: Disable scroll-hijack on small screens
- In any `handleWheel` function, add at the top: `if (window.innerWidth < 1024) return;`
- This prevents scroll-snap behavior from breaking touch/trackpad scrolling

### Step 5: Fix hardcoded widths and font sizes
- Replace `w-[500px]` → `w-full max-w-[500px]`
- Replace `text-[2.4vw]` → `text-[20px] lg:text-[2.4vw]`
- Replace `min-h-[50.9vw]` → `min-h-[70vh] lg:min-h-[50.9vw]`
- Use `clamp()` for fluid typography: `font-size: clamp(28px, 6vw, 72px)`

### Step 6: Fix viewport-scaled sections
- For components that use `transform: scale(windowWidth / CANVAS_WIDTH)`:
  - Add a `minScale` check for mobile: `Math.max(scaleX, 0.35)`
  - This prevents content from shrinking to unreadable sizes

### Step 7: Handle decorative elements on mobile
- Hide complex floating/animated elements that overlap on small screens
- Use CSS: `@media (max-width: 767px) { .element { display: none; } }`

### Step 8: Add reduced-motion support
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Verification
1. Test at 375px (mobile), 768px (tablet), 1366px (laptop), 1920px (desktop)
2. Verify hamburger menu opens and closes
3. Verify no horizontal scrollbar appears on mobile
4. Verify all text is readable and no content overflows viewport
5. Verify scroll-based animations work without hijack on mobile
