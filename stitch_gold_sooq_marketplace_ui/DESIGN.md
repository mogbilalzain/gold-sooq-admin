---
name: Gold Sooq Design System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4d4635'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#745b00'
  primary: '#745b00'
  on-primary: '#ffffff'
  primary-container: '#c5a028'
  on-primary-container: '#493800'
  inverse-primary: '#eac249'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5e604d'
  on-tertiary: '#ffffff'
  tertiary-container: '#a5a690'
  on-tertiary-container: '#3a3c2a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe08b'
  primary-fixed-dim: '#eac249'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e4cc'
  tertiary-fixed-dim: '#c8c8b0'
  on-tertiary-fixed: '#1b1d0e'
  on-tertiary-fixed-variant: '#474836'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built upon a foundation of **Modern Minimalism** infused with **High-Fidelity Fintech** aesthetics. It is designed to evoke a sense of absolute security, heritage, and exclusivity. The visual language balances the traditional value of gold with the speed and precision of a contemporary SaaS platform.

The UI relies on generous whitespace (macro-typography) and a "less-is-more" philosophy, where the quality of the materials (gold accents and refined type) communicates luxury rather than decorative clutter. The emotional response should be one of "Quiet Luxury"—unassuming yet undeniably premium. 

Key principles:
- **Precision:** Perfect alignment and consistent spacing to reflect the accuracy of weight and value.
- **Luster:** Use of subtle gradients and lighting effects to mimic the reflective quality of precious metals.
- **Heritage:** Traditional typographic elements paired with modern structural layouts.

## Colors

The palette is anchored by "Investment Gold," a refined metallic hue that serves as the primary action color. This is balanced against a high-contrast "Dark Charcoal" to ensure readability and a professional fintech feel.

- **Primary (Gold):** Used for primary CTAs, active states, and critical price indicators.
- **Backgrounds:** A tiered system starting with pure white for content areas, transitioning to off-white (#F9F9F9) for page sections, and warm light beige for subtle depth.
- **Functional Colors:** Success (Emerald), Error (Ruby), and Warning (Amber) should be used sparingly and desaturated to maintain the premium aesthetic.

## Typography

The typographic scale uses a serif/sans-serif pairing to distinguish between "Value" (Headlines) and "Utility" (UI/Data).

**RTL Adaptation:**
- For Arabic text, `IBM Plex Sans` serves as the primary driver for its exceptional legibility in technical contexts.
- Ensure line-height is increased by approximately 15-20% for Arabic scripts compared to Latin equivalents to prevent character clipping.
- **Alignment:** All layouts must default to right-alignment. Optical kerning should be disabled for Arabic strings.

**Hierarchy:**
- **Display/Headline:** Use `Playfair Display` for marketing sections, product titles, and hero statements to inject a sense of elegance.
- **Body/Data:** Use `IBM Plex Sans` for all functional interface elements, price tickers, and transactional details.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model for desktop to maintain a prestigious, centered "gallery" feel, while transitioning to a fluid model for mobile devices.

- **Grid:** A 12-column grid is standard for desktop. On mobile, a 4-column grid with 16px side margins is used.
- **Rhythm:** An 8px base unit governs all spatial relationships. 
- **Density:** High-density layouts should be avoided. The "luxury" of the interface is communicated through "negative space," allowing the eye to focus on high-value items without distraction.
- **Reflow:** In RTL mode, the column order reverses (Column 1 starts on the right).

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Gold-Tinted Shadows**.

- **Surface Tiers:**
    - **Level 0 (Background):** Light Beige (#F5F5DC) or Off-white.
    - **Level 1 (Cards/Containers):** Pure White (#FFFFFF).
    - **Level 2 (Popovers/Modals):** Pure White with elevated shadows.
- **Shadows:** Avoid harsh black shadows. Use a soft, multi-layered blur with a tiny hint of the primary gold color in the shadow's tint (e.g., `rgba(197, 160, 40, 0.08)`) to create a warm, glowing lift.
- **Glassmorphism:** Use sparingly for navigation bars or floating action buttons. Apply a 20px backdrop blur with a 10% white tint and a 1px border of #EDEDED.

## Shapes

The shape language is sophisticated and approachable. While corners are rounded, they maintain enough structure to feel professional and secure.

- **Primary Radius:** 16px (1rem) for standard cards and containers.
- **Component Radius:** 8px (0.5rem) for buttons and input fields to provide a more "engineered" feel.
- **Interactive Elements:** Use full pill-shapes (32px+) exclusively for tags, chips, or search bars to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid Gold (#C5A028) with white or dark charcoal text. Use a subtle linear gradient (Top: #D4AF37 to Bottom: #C5A028) for a metallic sheen.
- **Secondary:** Ghost style with a 1.5px Dark Charcoal border.

### Input Fields
- **Style:** Minimalist. No background color (transparent) with a 1px bottom border of #EDEDED that transitions to a 1px Gold border on focus.
- **Labels:** Small, uppercase `label-md` positioned above the input field.

### Cards
- **Product Cards:** Must feature a 1px border of #EDEDED. Images should have a light beige background to ensure gold jewelry items pop. 
- **Shadow:** Apply a soft Level 1 shadow on hover to indicate interactivity.

### Chips & Badges
- **Purity Tags:** Used to denote gold karats (e.g., 24K). Small, rounded-pill shapes with a Light Beige background and Gold text.

### List Items
- **Price Tickers:** Use monospaced numerals if available within the font family for vertical alignment of numbers. Trends (Up/Down) should be indicated by small, elegant chevrons rather than heavy arrows.