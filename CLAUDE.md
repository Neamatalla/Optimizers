# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 18 + TypeScript landing page for Optimizers, a CRO/conversion optimization agency targeting e-commerce brands in the GCC/MENA region. Built with Vite, styled with Tailwind CSS v4.

## Commands

- `npm run dev` — Start dev server on port 4000
- `npm run build` — Production build via Vite
- `npm run share` — ngrok tunnel (port 9000)

No test framework is configured.

## Architecture

**Entry flow:** `index.html` → `src/main.tsx` (wraps app in `LanguageProvider`) → `src/app/App.tsx` (sets up `QueryClientProvider`, renders all sections)

**Path alias:** `@` maps to `src/` (configured in both vite.config.ts and tsconfig.json)

### Key Directories

- `src/app/components/ui/` — 50+ shadcn/ui-style primitives built on Radix UI
- `src/app/components/figma/` — Figma-generated components
- `src/imports/` — Page sections (hero, case studies, ROI calculator, FAQ, footer, etc.) and SVG components
- `src/app/contexts/LanguageContext.tsx` — i18n provider (English/Arabic) with RTL support and MutationObserver-based DOM translation
- `src/app/translations/ar.ts` — Arabic translation dictionary
- `src/hooks/` — Custom hooks (`useScrollReveal`, `use-toast`)
- `src/lib/queryClient.ts` — API request utility with TanStack React Query
- `src/styles/` — CSS modules: `theme.css` (variables), `rtl.css`, `scroll-reveal.css`, `responsive.css`, etc.

### Animation System

Two animation patterns coexist (documented in `ScrollAnimationRefinement.md`):
1. **Direct scroll scrubbing** — Gate section ties animation progress directly to scroll position
2. **Fixed-duration triggered animations** — Slide transitions use Framer Motion animations triggered at scroll thresholds via IntersectionObserver (`useScrollReveal` hook). Scroll reveal is mobile-only; skipped on desktop.

### API

- **Dev:** Custom Vite middleware in `vite.config.ts` handles `POST /api/contact`
- **Prod:** Serverless function via Vercel; sends email through Resend API
- `vercel.json` rewrites all non-API routes to `/index.html` (SPA)

### Strategy Session Form

Multi-step wizard in `src/imports/StrategySession.tsx` — 5 steps collecting conversion volume, business objectives, website URL, contact details, then Calendly booking integration.

### Performance Patterns

- Lazy loading with `React.lazy` + `Suspense` for below-fold sections (ROI calculator, team, etc.)
- `content-visibility: auto` on heavy sections
- WebP images with fallbacks

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin (PostCSS config is intentionally empty). Also uses Emotion CSS-in-JS for Material-UI components. Custom CSS variables defined in `src/styles/theme.css`.
