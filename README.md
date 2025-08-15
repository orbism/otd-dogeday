# Doge Day 2025 Web

Single-page Next.js site for Doge Day 2025 (Chiba, Japan).

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Branding & Content

- Colors/themes: `styles/brand/themes.scss`
  - Three presets: `default`, `sunset`, `aqua`
  - Add/edit maps and they will be exposed as CSS variables; toggle via the header.
- Images:
  - Splash hero: place your hero image at `public/branding/hero.jpg`
  - Loader uses CSS spinner; you can replace with a PNG if desired.
- Content strings: `content/site.ts`
  - Event name, location, date, links, social.

## Sections

Four 100vh sections with scroll snapping (toggle in header):
- Splash
- Details
- Sign Up (stub)
- Footer (3 columns)

## Animations (Progressive Enhancement)
- Scroll-driven background and fade-in animations guarded by `@supports (animation-timeline: ...)`.
- Respects `prefers-reduced-motion`.

## Env Vars (future)
- `.env.example` lists SMTP vars for future email signup.
- API stub at `/api/signup` returns 501 until enabled.

## Build

```bash
npm run build
npm run start
```
