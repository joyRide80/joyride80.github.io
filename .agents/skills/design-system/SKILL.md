---
name: joy-object-design-system
description: Design system rules and specifications for the Joy·Object portfolio website. All components, pages, and styles must follow these guidelines.
---

# Joy·Object Design System

## Philosophy

The site is **bold and minimalist** — a warm beige canvas with dark typography. The refinement lies in **subtle GSAP animations**, not flashy visuals. The duality of **craft and technology** is expressed through the interplay of serif fonts (Pantasia) and pixel fonts (Tiny5).

## Figma Source of Truth

All visual specs are derived from these Figma frames:
- Home Cloud: `node-id=246-1156`
- Home Timeline: `node-id=254-133`
- Home Cloud Hover: `node-id=256-249`
- Home Timeline Hover: `node-id=2001-170`
- Project Page: `node-id=2006-216`
- About Page: `node-id=2020-392`

File: `https://www.figma.com/design/o3o6SRPOYHJzQZiLfQ2qSy/joySite`

---

## Colors

Use CSS custom properties exclusively. Never use raw hex values.

```css
:root {
  --bg-100: #f5f1e6;     /* Page background (warm beige) */
  --bg-150: #e4e2d5;     /* Button backgrounds, secondary surfaces */
  --gray-900: #1c1c1c;   /* Primary text, dark buttons */
  --gray-600: #848080;   /* Secondary text, tags */
  --gray-0: #ffffff;     /* Light text on dark buttons */
  --placeholder: #d7d3c8; /* Image placeholder boxes */
}
```

## Typography

### Font Stack

1. **Pantasia** (self-hosted woff2) — Display/headlines. Fallback: Hedvig Letters Serif.
2. **Hedvig Letters Serif** (Google Fonts) — Body text.
3. **DM Mono** (Google Fonts) — UI labels, buttons, meta info.
4. **Instrument Serif** (Google Fonts) — Logo only.
5. **Tiny5** (Google Fonts) — Pixel font for "joy" text throughout the site.

### Type Scale (8pt grid for line heights)

| CSS Class | Font | Size | Weight | Line Height | Letter Spacing | Transform |
|---|---|---|---|---|---|---|
| `.type-logo` | Instrument Serif | 32px | 400 | 40px | 0 | none |
| `.type-h1` | Pantasia | 64px | 400 | 56px | -1.28px | uppercase |
| `.type-h3` | Pantasia | 44px | 400 | 48px | -0.88px | uppercase |
| `.type-subtitle` | Pantasia | 25px | 400 | 32px | 0 | none |
| `.type-body-intro` | Pantasia | 18px | 400 | 24px | -0.36px | none |
| `.type-body-bio` | Pantasia | 16px | 400 | 20px | -0.32px | none |
| `.type-body` | Hedvig Letters Serif 18pt | 17px | 400 | 24px | 0 | none |
| `.type-mono` | DM Mono | 15px | 500 | 24px | 0 | none |
| `.type-mono-sm` | DM Mono | 13px | 500 | 20px | 0 | none |
| `.type-button` | DM Mono | 13px | 400 | 24px | 0 | none |
| `.type-tiny` | DM Mono | 11px | 400 | 20px | 0.33px | uppercase |
| `.type-pixel` | Tiny5 | 16px | 400 | 20px | 0 | none |
| `.type-ascii` | DM Mono | 12px | 400 | 12px | 0 | none |

### Special Rules

- The word **"joy"** in bio text ALWAYS uses Tiny5 (`.type-pixel`), regardless of context.
- All section labels (e.g., "INTRODUCTION", "MY DESIGN ROLE") use `.type-tiny` with uppercase transform.
- Button text uses `.type-button` — never bold.

---

## Components

### ButtonLight
```css
.btn-light {
  background: var(--bg-150);
  color: var(--gray-900);
  padding: 4px 12px;
  border-radius: 16px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  line-height: 24px;
  border: none;
  cursor: pointer;
}
```

### ButtonDark
```css
.btn-dark {
  background: var(--gray-900);
  color: var(--gray-0);
  padding: 4px 12px;
  border-radius: 16px;
  font-family: 'DM Mono', monospace;
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  border: none;
  cursor: pointer;
}
```

### Switch (Cloud/Timeline Toggle)
- Horizontal flex layout: `CLOUD` label — pill toggle — `TIMELINE` label
- Toggle pill: 56px × 19px, rounded, dark circle indicator
- Labels: `.type-tiny` uppercase
- Positioned: bottom center of viewport, 20px from bottom

### Project Overlay (hover card)
- Appears on hover over project images in cloud/timeline
- Width: 270px
- Contains:
  - Project name: `.type-h1` (Pantasia 64px uppercase, right-aligned)
  - URL: `.type-mono-sm` (DM Mono 13px medium, `--gray-900`)
  - Category: `.type-mono-sm` (DM Mono 13px medium, `--gray-600`)
  - Divider: 1px solid `--gray-900`
  - "VIEW PROJECT →": `.type-tiny` uppercase with arrow icon

### NavPrevNext
- Flex row with gap-24px
- Each item: arrow icon + text "PREV" / "NEXT"
- Font: Hedvig Letters Serif 17px
- Arrow: 20px icon, flipped horizontally for PREV

---

## Layout Specifications

### Home Page
- Full viewport height (100vh)
- Logo: top-left (28px, 20px)
- Nav buttons: left side (26px, 80px and 120px)
- Bio text: top-right area (positioned at ~60% from left, 20px from top), 481px wide
- "say hi" button: below bio text
- Cloud/Timeline content: center area
- Switch: bottom center, 20px from bottom
- "Get in touch": bottom-left (28px from left)

### Project Page
- 4-column conceptual grid
- Max content width: ~960px with padding
- Title/subtitle: left-aligned, rows 2 from top
- Intro + meta: two-column, row 3
- Image collage: 5-column sub-grid (2 large + 1 small per row)
- Image placeholder height: 333px (large), 153px (small), 380px (bottom row)

### About Page
- Two-column split at ~60% from left
- Left: portrait image (tilted -4°)
- Right: ASCII art → intro text → body paragraphs → CV button
- Links in body text: underlined, standard anchor behavior

---

## Animation Guidelines (GSAP)

### General Principles
- Duration: 0.3–0.5s for hover transitions
- Easing: `power2.out` for most transitions
- Never use CSS transitions for complex animations — always GSAP

### Cloud View
- **Default**: All project images at 40% opacity
- **Hover on project**: 
  - Hovered project images → 100% opacity (0.3s)
  - All other images → 20% opacity (0.3s)
  - Overlay fades in with `y: 10 → 0` translateY
- **Text glitch**: On hover, cycle font-family rapidly (Tiny5 → Pantasia, 3-4 frames over 0.2s)

### Page Transitions
- Fade out current page (0.3s)
- Fade in new page (0.3s)
- Project page: title slides up slightly on load

### Scroll Animations (Project Page)
- Content sections reveal with subtle `y: 20 → 0` + `opacity: 0 → 1`
- Stagger: 0.1s between elements

---

## Responsive Breakpoints

| Breakpoint | Width | Changes |
|---|---|---|
| Mobile | ≤ 768px | Cloud → simple grid, single column project layout, stacked about page |
| Tablet | 769–1024px | Reduced cloud density, 2-column project images |
| Desktop | 1025–1280px | Design target — follow Figma exactly |
| Large | ≥ 1440px | More whitespace, same proportions |

---

## Content Structure

### Project Frontmatter Schema
```yaml
---
title: "Klara Karbon"
slug: "klara-karbon"
headline: "The Making of Klara"
subtitle: "An AI-Powered Carbon Accounting Tool for Small Businesses"
year: "2023-2024"
url: "klarakarbon.no"
tags:
  - "Product design"
  - "Prototyping"
  - "User research"
  - "UI design"
  - "Design system"
  - "Branding"
category: "Climatetech, AI"
order: 1
thumbnail: "/images/projects/klara/thumbnail.png"
cloudImages:
  - src: "/images/projects/klara/cloud-1.png"
    width: 2
  - src: "/images/projects/klara/cloud-2.png"
    width: 1
heroImages:
  - src: "/images/projects/klara/hero-1.png"
    caption: "Transaction page"
    size: "large"
  - src: "/images/projects/klara/hero-2.png"
    caption: "Emission page"
    size: "large"
  - src: "/images/projects/klara/hero-3.png"
    caption: "Overview page"
    size: "small"
---
```

### Image Naming Convention
- Cloud/timeline images: `cloud-1.png`, `cloud-2.png`
- Hero/collage images: `hero-1.png`, `hero-2.png`
- Inline content images: descriptive names matching captions

---

## File Naming Conventions
- Pages: `kebab-case.astro`
- Components: `PascalCase.astro`
- Scripts: `camelCase.js`
- CSS: `global.css` (single file for design system)
- Content: `kebab-case.md`
- Images: organized by project slug in `/public/images/projects/[slug]/`
