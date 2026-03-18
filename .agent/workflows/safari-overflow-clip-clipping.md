---
description: How to fix Safari clipping content when using overflow clip with sticky positioning and transforms
---

# Safari `overflow: clip` Clipping Issue

## Problem

Safari handles `overflow: clip` more aggressively than Chrome and Firefox. When combined with:
- `position: sticky` on the same element
- Child elements using CSS `transform` animations (e.g., Framer Motion `y` translations)
- Content that extends beyond the container's visible bounds

Safari may clip content (especially at the bottom) that Chrome/Firefox would render correctly.

## Symptoms

- Elements appear cut off at the bottom (or sides) of a sticky container
- The issue only appears in Safari / WebKit browsers
- Content renders fine in Chrome/Firefox

## Root Cause

`overflow: clip` is a newer CSS property that clips content without creating a scroll container. However, Safari's WebKit engine computes the clipping boundary more tightly, especially when transforms are involved. This causes child elements near the edges to be visually cut off.

## Fix

Replace `overflow: clip` with `overflow: hidden` on the sticky container:

```diff
.sticky-container {
    position: sticky;
    top: 0;
    height: 100vh;
-   overflow: clip;
-   -webkit-overflow-scrolling: touch;
+   overflow: hidden;
}
```

## Why This Works

- `overflow: hidden` is widely supported and behaves consistently across all browsers
- When `position: sticky` is on the **same element** as `overflow: hidden`, the sticky behavior is **not broken** (sticky only breaks when `overflow: hidden` is on a **parent** of the sticky element)
- `-webkit-overflow-scrolling: touch` is unnecessary with `overflow: hidden` and is a deprecated property

## When to Use `overflow: clip` vs `overflow: hidden`

| Property | Use Case |
|---|---|
| `overflow: clip` | When you need clipping without a scroll container and are **not** targeting Safari with transforms |
| `overflow: hidden` | When you need broad browser compatibility, especially with sticky + transforms |

## Key Takeaway

If you see bottom/edge clipping **only in Safari** on a sticky element with animated children, switch from `overflow: clip` to `overflow: hidden`.
