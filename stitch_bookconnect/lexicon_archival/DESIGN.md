---
name: Lexicon Archival
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d5e3fd'
  on-surface: '#0d1c2f'
  on-surface-variant: '#44474c'
  inverse-surface: '#233144'
  inverse-on-surface: '#ebf1ff'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#121617'
  on-tertiary: '#ffffff'
  tertiary-container: '#272a2c'
  on-tertiary-container: '#8e9193'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0d1c2f'
  surface-variant: '#d5e3fd'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system focuses on precision, archival clarity, and intellectual trust. The target audience includes researchers, bibliophiles, and students who require a tool that prioritizes information density without sacrificing legibility. 

The aesthetic is **Corporate Modern with a Swiss-minimalist influence**. It utilizes a systematic approach to whitespace and information hierarchy to ensure that dense book metadata remains scannable. The emotional response should be one of "quiet productivity"—a neutral, reliable environment where the content (the books) remains the primary focus.

## Colors
The palette is rooted in a deep navy primary to establish authority and stability. An off-white background (#F8FAFC) is used specifically to reduce the harsh contrast of pure white, facilitating long reading sessions.

- **Primary:** Used for navigation, primary buttons, and headings.
- **Secondary:** Used for metadata, borders, and secondary icons.
- **Status Accents:** Used exclusively for availability indicators. These use high-chroma but professional tones to ensure they stand out within dense lists.
- **Backgrounds:** The interface uses subtle shifts in light gray to differentiate between the global canvas and content containers.

## Typography
This design system utilizes **Hanken Grotesk** for its contemporary, sharp, and highly legible characteristics. It provides a professional "tech-literary" feel.

- **Titles:** Book titles must always use `title-lg` or `headline-md` with a semi-bold weight (600) to ensure they are the first element captured in a scan.
- **Metadata:** Author names, ISBNs, and dates use `body-md` in the secondary color (#64748B) to create a clear visual step-down from the title.
- **Labels:** Small caps or increased letter spacing should be applied to `label-md` when used for technical metadata like "ISBN" or "PUBLISHER".

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict 4px increments. 

- **Mobile:** A single-column stack with 16px side margins. Cards occupy 100% of the width.
- **Desktop:** A 12-column grid. Information-dense "Price Comparison" tables should span at least 8 columns to ensure horizontal breathing room for multiple price points.
- **Density:** To balance the high information density, vertical "stack" spacing between distinct book entries is kept generous (stack-lg), while internal card spacing is tighter (stack-sm) to keep related data grouped.

## Elevation & Depth
This design system uses **Low-contrast outlines** and **Tonal layers** rather than heavy shadows to maintain a clean, archival feel.

- **Level 0 (Canvas):** Off-white background (#F8FAFC).
- **Level 1 (Cards/Surface):** Pure white (#FFFFFF) with a 1px solid border in a soft slate (#E2E8F0). No shadow.
- **Level 2 (Modals/Popovers):** Pure white with a very soft, high-diffusion shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) to provide focus without breaking the minimalist aesthetic.
- **Interactive States:** On hover, a card's border color shifts to the primary navy at 20% opacity.

## Shapes
The shape language is **Soft**. This provides a slight approachability to an otherwise rigid, professional system.

- **Standard Elements:** Input fields, buttons, and book cards use a 0.25rem (4px) radius.
- **Badges/Chips:** Use `rounded-xl` (0.75rem) to differentiate them from functional buttons and clickable cards. 
- **Book Covers:** Should retain a slight 2px radius to mimic the physical nature of a book's edge.

## Components
- **Information-Dense Cards:** Use a horizontal layout on desktop with the book cover on the left (fixed width), followed by a middle column for title/metadata, and a right-aligned column for the "primary" price or status.
- **Acquisition Badges:** Use a "Pill" shape with a light background tint of the accent color and dark text (e.g., Success Green background at 10% opacity with 100% opacity text).
- **Notion-Style Inputs:** Select fields should have a subtle background color (#F1F5F9) and no border until focused. Multi-select tags appear inside the field with a "remove" icon.
- **Comparison Tables:** Use a structured grid with `border-bottom` separators only. Avoid vertical lines to keep the scanning path clear. Headers should be `label-md` in all-caps.
- **Icons:** Use 20px or 24px stroke-based icons with a 1.5px weight. Avoid filled icons unless indicating a "selected" state (e.g., a bookmarked book).