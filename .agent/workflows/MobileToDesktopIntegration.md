---
description: How to merge a standalone mobile Figma/React export into an existing complex desktop layout without breaking the desktop design.
---
# Integrating Standalone Mobile UI into Complex Desktop Layouts

This workflow documents how to take an isolated, pixel-perfect mobile slice from a Figma-to-Code export and integrate it seamlessly onto an existing complex, sticky-scrolled, or animated desktop layout locally using Tailwind CSS and native CSS.

### 1. Identify the Exact Current Desktop Code
- Locate the main page file (e.g., `src/app/App.tsx`).
- Locate the wrapper `div` of the complex section you want to integrate (e.g., `<div id="services">`).

### 2. Prepare the Mobile Styles
- Create a new, dedicated CSS file in `src/styles/` (e.g., `services.css`).
- Copy the raw mobile CSS properties into exactly named classes (e.g., `.services-container`, `.service-card-inner`).
- Ensure breakpoints in the CSS file handle spacing overrides (e.g., `@media (min-width: 768px)`).

### 3. Extract the Mobile JSX into a Separate Internal Component
- Inside the main file, clone the raw HTML/JSX for the mobile unit but strip all the ugly inline `style={{...}}` blocks.
- Replace them with the exact CSS class mappings (e.g., `className="service-card-inner"`).
- Make sure to pass necessary props (title, description, image).

### 4. Wire the Two Layouts using Conditional Tailwind
- *DO NOT* try and force desktop animations (like sticky scrolling) into responsive media queries if the structures fundamentally differ.
- Wrap the newly created Mobile layout block in a toggled wrapper explicitly for smaller breakpoints: `<div className="flex lg:hidden flex-col ...">`
- Wrap the complex legacy Desktop layout block in a toggled wrapper explicitly for larger breakpoints: `<div className="hidden lg:flex ...">`
- This ensures the exact, raw Figma mobile structure loads beautifully on mobile devices, while the complex, JavaScript-animated layout powers the larger displays.

---

## 🌟 What You Provided That Made This Work Perfectly
When requesting this feature, providing the following made the execution exactly what you wanted:

1. **The Exact CSS Rules**: You gave me the raw CSS file detailing the exact padding, font sizes, margins, shadow colors, and abstract blob configurations. Because I had the exact code, I didn't have to "guess" how the mobile version looked.
2. **The Inline-to-Class Name Mapping**: You provided a 1-to-1 mapping of what the old ugly `style={{...}}` blocks were, mapped directly to their new CSS counterparts (e.g., *"Old: `<div style={{ backgroundColor: '#0f120e' ...}}>` New: `<div className="service-card-inner">`"*).
3. **Clear Bounds**: You explicitly stated to "find the our services section in the desktop... without messing anything up in the desktop meaning add media queries." This told me *exactly* where to focus and exactly what the failure condition was (breaking the desktop).

## 📝 What Else Could You Provide Next Time?
While this request was incredibly detailed and perfect, here are a few things that could speed up similar requests in the future:
1. **The Target Breakpoint**: Specifying exactly when the layout should snap (e.g., "The desktop layout breaks at `1024px`, so use `lg:hidden` and `hidden lg:flex`"). I assumed `lg:` for this context which was safe, but exact breakpoints are always helpful.
2. **Interaction Changes**: If the buttons on Mobile should behave differently than Desktop (e.g., "On mobile, the button should open a full-screen drawer, but on desktop it should just scroll").
3. **Asset Variations**: Mention if there are any mobile-specific image assets (e.g., "Use `imgOurServicesMobile.png` instead of the desktop version").
