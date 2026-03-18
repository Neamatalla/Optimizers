---
description: how to implement fading corner borders using CSS masking
---

# Fading Corner Borders Workflow

Use this workflow to implement premium-style borders that are bright at the corners and fade into transparency along the edges.

1. **Identify Target Container**: The element must have `position: relative`.
2. **Add Overlay Element**:
   - Create an absolute-positioned `div` as the first child of the container.
   - Use `inset-0 pointer-events-none rounded-[inherit]`.
3. **Configure Style Props**:
   - Set `padding` to the desired border thickness (e.g., `1px`).
   - Set `background` to a `linear-gradient` (e.g., `135deg, #4ade80 0%, transparent 20%, transparent 80%, #4ade80 100%`).
4. **Apply Masking Logic**:
   - `WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)"`
   - `WebkitMaskComposite: "xor"`
   - `maskComposite: "exclude"`

Example implementation:
```tsx
<div className="relative rounded-[16px]">
  <div
    className="absolute inset-0 pointer-events-none rounded-[inherit]"
    style={{
      padding: "1px",
      background: "linear-gradient(135deg, #4ade80 0%, transparent 20%, transparent 80%, #4ade80 100%)",
      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
    }}
  />
</div>
```
