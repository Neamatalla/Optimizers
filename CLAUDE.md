# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 18 + TypeScript landing page for Optimizers, a CRO/conversion optimization agency targeting e-commerce brands in the GCC/MENA region. Built with Vite, styled with Tailwind CSS v4. Deployed on Vercel.

## Commands

- `npm run dev` — Start dev server on port 4000
- `npm run build` — Production build via Vite
- `npm run preview` — Preview production build on port 4173
- `npm run share` — ngrok tunnel (tunnels port 5173)
- `npm run compress-images` — Optimize images via Sharp (`scripts/compress-images.js`)

No test framework or linter is configured.

## Architecture

**Entry flow:** `index.html` → `src/main.tsx` (wraps app in `LanguageProvider`) → `src/app/App.tsx` (sets up `QueryClientProvider`, renders all sections)

**Path alias:** `@` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`)

### Section Rendering Order (in App.tsx)

HeaderNav (persistent) → HeaderSection → Services (mobile/desktop variants) → AnimatedHeroSection → Component333 → ProcessWithAnimation → Table → AnimatedCaseStudies (lazy) → Frame2147223150 → ROICalculator (lazy) → PartnersAndTools (lazy) → StrategySession (`#contact`) → MeetTheTeam (lazy, `#team`) → FAQSection (lazy) → GallerySection (lazy) → Footer

### Key Directories

- `src/app/components/ui/` — shadcn/ui-style primitives built on Radix UI
- `src/app/components/figma/` — Figma-generated components
- `src/imports/` — Page sections (hero, case studies, ROI calculator, FAQ, footer, etc.) and SVG components
- `src/app/contexts/LanguageContext.tsx` — i18n provider (English/Arabic) with RTL support and MutationObserver-based DOM translation
- `src/app/translations/ar.ts` — Arabic translation dictionary
- `src/hooks/` — Custom hooks (`useScrollReveal`, `use-toast`)
- `src/lib/queryClient.ts` — API request utility with TanStack React Query
- `src/styles/` — CSS files: `theme.css` (variables), `rtl.css`, `scroll-reveal.css`, `responsive.css`, `services.css`, `case-studies-animations.css`, `top-clients-scroll.css`, `fonts.css`

### i18n System

The `LanguageContext` uses a DOM-level MutationObserver approach: it walks text nodes and replaces English strings with Arabic translations from the dictionary (`ar.ts`), and vice versa. The `t()` function handles React-rendered text; the observer handles text injected after render. Dynamic patterns (e.g., "Step X of Y") use regex replacers. Curly/smart quotes are normalized before lookup.

### Animation System

Two animation patterns coexist (documented in `ScrollAnimationRefinement.md`):
1. **Direct scroll scrubbing** — Gate section ties animation progress directly to scroll position
2. **Fixed-duration triggered animations** — Uses `motion` package (Framer Motion v12+) triggered at scroll thresholds via IntersectionObserver (`useScrollReveal` hook). Scroll reveal is mobile-only; skipped on desktop.

### API

- **Dev:** Custom Vite middleware plugin in `vite.config.ts` handles `POST /api/contact` (has a hardcoded Resend API key fallback)
- **Prod:** Serverless function at `api/contact.js` on Vercel; sends email through Resend API
- `vercel.json` rewrites all non-API routes to `/index.html` (SPA)

### Strategy Session Form

Multi-step wizard in `src/imports/StrategySession.tsx` — 5 steps collecting conversion volume, business objectives, website URL, contact details, then Calendly booking integration.

### Performance Patterns

- Lazy loading with `React.lazy` + `Suspense` for below-fold sections (ROI calculator, team, case studies, gallery, FAQ, partners)
- `content-visibility: auto` on heavy sections
- WebP images with fallbacks

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin (PostCSS config is intentionally empty). Also uses Emotion CSS-in-JS for Material-UI components. Custom CSS variables defined in `src/styles/theme.css`. Many components use inline styles with the Sora font family directly rather than Tailwind classes.
