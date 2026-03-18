---
description: How to perform a holistic performance audit and implement high-efficiency fixes for React/Framer Motion applications.
---

### 1. Performance Audit Phase
1. **Identify Bottlenecks**: Use Chrome DevTools (Performance Tab) to record scroll/animation sequences. Look for long "Paint" and "Composite Layers" tasks.
2. **Lighthouse Baseline**: Run a Lighthouse audit to check for high Cumulative Layout Shift (CLS) and Main Thread work.
3. **Audit SVG Filters**: Search for `feGaussianBlur` or `feDropShadow` with `stdDeviation` values > 20. These are extremely expensive for GPU.
4. **Leak Detection**: Check if global event listeners (`mousemove`, `scroll`) are active even when components are off-screen.

### 2. Implementation Phase: SVG & GPU
1. **Simplify Filters**: Reduce Gaussian blur radii. Values like `30` or `80` provide similar visual softness to `150+` at a fraction of the processing cost.
2. **GPU Hinting**: Add `will-change: transform, opacity` to elements that animate frequently.
    > [!IMPORTANT]
    > Don't over-use `will-change`. Apply it only to the specific layer that is moving, not the entire page.
3. **Avoid Layer Overlap**: Ensure large transparent SVG layers don't overlap interactive elements unnecessarily (use `pointer-events: none`).

### 3. Implementation Phase: React & DOM Management
1. **Active Mount Gating**: For multi-slide sections, unmount inactive slides completely rather than just hiding them with `display: none`.
    ```tsx
    {mountedIndices.includes(i) && <Component />}
    ```
2. **IntersectionObserver Gating**: Wrap global listeners (like mouse tracking) in an `IntersectionObserver`.
    ```tsx
    useEffect(() => {
        if (!isInView) return;
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isInView]);
    ```
3. **Memoization**: Wrap complex leaf components in `React.memo` to prevent re-renders when the parent scroll progress updates.

### 4. Resource Loading
1. **Async Decoding**: Add `decoding="async"` to all images to prevent main-thread jank during image load.
2. **Strategic Loading**: Use `loading="eager"` for the first visible slide and `loading="lazy"` (or unmounted state) for subsequent ones.

### 5. Verification Phase
1. **Stress Test**: Scroll rapidly through the optimized section to ensure no frame drops.
2. **Memory Profile**: Monitor memory usage in the Task Manager to verify that unmounted components are being correctly garbage collected.
