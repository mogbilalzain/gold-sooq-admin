---
name: The Cinematic Scholar
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#d0c5b6'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#998f81'
  outline-variant: '#4d4639'
  surface-tint: '#e3c287'
  primary: '#fffdff'
  on-primary: '#402d00'
  primary-container: '#ffdd9f'
  on-primary-container: '#79602e'
  inverse-primary: '#735b29'
  secondary: '#c2c7cf'
  on-secondary: '#2b3137'
  secondary-container: '#42474e'
  on-secondary-container: '#b0b5bd'
  tertiary: '#fffeff'
  on-tertiary: '#2a313c'
  tertiary-container: '#dbe2f1'
  on-tertiary-container: '#5d6471'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea3'
  primary-fixed-dim: '#e3c287'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#594314'
  secondary-fixed: '#dee3eb'
  secondary-fixed-dim: '#c2c7cf'
  on-secondary-fixed: '#171c22'
  on-secondary-fixed-variant: '#42474e'
  tertiary-fixed: '#dce3f2'
  tertiary-fixed-dim: '#c0c7d5'
  on-tertiary-fixed: '#151c27'
  on-tertiary-fixed-variant: '#404753'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
  unread-glow: rgba(255, 221, 159, 0.15)
  glass-border: rgba(255, 255, 255, 0.08)
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  notification-title:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  micro-label:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.2em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-max: 1280px
  notification-gap: 12px
---

## Brand & Style

The Cinematic Scholar brand embodies an intersection of academic rigor and film noir aesthetics. It targets a sophisticated audience of researchers and cinephiles who value deep focus, intellectual history, and the art of presence. 

The design style is **Cinematic Glassmorphism**. It utilizes a dark, moody foundation characterized by high tonal contrast, heavy use of backdrop blurs, and "light-leak" accents. The emotional response is one of curated exclusivity—reminiscent of a private library or a high-end editorial archive. Elements feel light but substantial, using transparency and soft glows to represent the "projected" nature of film.

## Colors

The palette is anchored in a "Midnight Archive" theme.
- **Primary (Champagne Gold):** Used for highlighting "active presence," unread states, and critical actions. It mimics the warm glow of a film projector.
- **Secondary (Steel Blue-Grey):** Used for supporting text and non-interactive UI elements to maintain a low-profile hierarchy.
- **Neutral (Deep Obsidian):** The foundation of the UI, providing the high-contrast "black levels" necessary for a cinematic feel.

Transparency is a functional color state: 
- `glass-card`: `rgba(255, 255, 255, 0.03)` with a `20px` blur.
- `surface-tint`: Gold-tinted overlays at `10%` opacity for "active" sidebar or filter states.

## Typography

The system uses a pairing of **EB Garamond** (Serif) and **Manrope** (Sans-serif). 
- **The Serif** is used for editorial moments, high-level headers, and quotes. It should frequently utilize `italic` styles to emphasize the scholarly nature of the content.
- **The Sans-serif** handles all functional UI, body text, and metadata.
- **Letter Spacing:** Generous tracking is applied to all `label-caps` and `micro-labels` (up to `0.2em`) to evoke a premium, architectural feel.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. 
- **Navigation:** A fixed 256px (`w-64`) sidebar on desktop; a bottom persistent bar on mobile.
- **Main Content:** Centered with a max-width of 1280px. It uses an asymmetric grid for the "Archive" view, where a 3-column sticky filter sits beside a 9-column scrollable list.
- **Rhythm:** An 8px base unit drives all spacing. Headlines are separated from content by `32px` (4 units). List items are separated by `16px` (2 units).
- **Breakpoints:** 
  - Mobile (<768px): Sidebar hidden, margins reduced to 20px, display fonts scaled down.
  - Desktop (>1024px): 64px margins, sticky sidebar enabled.

## Elevation & Depth

Depth is established through **Luminance and Blur** rather than traditional dropshadows.
- **Level 0 (Background):** Pure `#111317`.
- **Level 1 (Sidebar/Filters):** `#0c0e11`. No blur, sharp border (`outline-variant`).
- **Level 2 (Glass Cards):** Semi-transparent white (`3%`) with `20px` backdrop blur. Used for primary interactive content blocks.
- **Level 3 (Unread State):** Elevated via a `primary_color` (gold) glow (`shadow-primary/15`) with a `15px` radius.
- **Hover States:** Increase glass opacity to `6%` and add a subtle `20px` gold-tinted shadow.

## Shapes

The shape language is primarily **Soft-Geometric**.
- **Standard Cards:** Use `rounded-xl` (0.5rem - 0.75rem) to soften the density of the information.
- **Interactive Icons/Avatars:** Circular (`rounded-full`) to contrast against the rectangular grid.
- **Checkboxes:** Small radius (0.125rem) to maintain a technical, archival feel.
- **Action Buttons:** Small radius (0.25rem) for a structured, sturdy appearance.

## Components

### Buttons
- **Primary Action:** Solid `primary_color` background, `on_primary` text. Always capitalized with high tracking.
- **Secondary Action:** Transparent background with `primary_color/20` border.
- **Ghost Action:** No background/border, `primary_color` text with icon. Visible only on hover of the parent card.

### Cards (Glass)
- Built with `rgba(255, 255, 255, 0.03)` and `backdrop-filter: blur(20px)`.
- Must include a `1px` border of `rgba(255, 255, 255, 0.08)`.
- Unread states feature a `3px` solid vertical bar of `primary_color` on the left edge.

### Inputs & Filters
- **Checkboxes:** `outline-variant` borders with a solid `primary_color` fill on check.
- **Sidebar Links:** High-contrast `primary_color` border-left (`4px`) and a tinted background (`primary/10`) for the active state.

### Decorative Elements
- **Horizontal Rules:** Use a gradient-to-transparent line from `primary_color` to zero opacity.
- **Active Dot:** A small `6px` solid `primary_color` circle positioned to the left of unread titles.