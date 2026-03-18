---
description: How to fix Safari-specific color shifts (blue instead of green) in SVG filters
---

# Safari SVG Color Shift Fix

Safari (WebKit) can exhibit dramatic color shifts in SVGs using complex filters, often turning green elements blue. This workflow describes how to stabilize these filters.

## Steps to Fix

1. **Replace Unstable Blend Modes**
   Identify `feBlend` primitives using these modes and replace them with stable alternatives:
   - Change `mode="color-burn"` → `mode="multiply"` (Stable for shadows)
   - Change `mode="color-dodge"` → `mode="screen"` (Stable for highlights)

2. **Normalize Color Matrices**
   Examine `feColorMatrix` values. If a matrix sets a single channel (like Blue) to 1.0 based on Alpha, it acts as a "fallback" if the subsequent blend fails.
   - Adjust `values` to use lower coefficients or colors within the project's actual palette.
   - **Example**: Change `0 0 0 0 0 ... 0 0 0 0 1` to manually specified RGB coefficients like `0 0 0 0 0.05 ... 0 0 0 1 0`.

3. **Cap Gaussian Blurs**
   Extremely large blurs can cause filter failure in Safari.
   - Keep `stdDeviation` in `feGaussianBlur` under **100**.

4. **Explicit Color Interpolation**
   Forced consistent color processing:
   - Add `color-interpolation-filters="sRGB"` to the `<filter>` or `<linearGradient>` elements.

## Example Code Change

```diff
- <feColorMatrix type="matrix" values="0 0 0 0 0.2 0 0 0 0 0 0 0 0 0 1 0 0 0 1 0" />
- <feBlend in2="shape" mode="color-burn" result="shadow" />
+ <feColorMatrix type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.15 0 0 0 0 0.1 0 0 0 1 0" />
+ <feBlend in2="shape" mode="multiply" result="shadow" />
```
