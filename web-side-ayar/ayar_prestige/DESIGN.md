---
name: Ayar Premium
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f2f2'
  surface-container: '#f0eded'
  surface-container-high: '#ece7e7'
  surface-container-highest: '#e6e1e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4c4637'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#7d7766'
  outline-variant: '#cec6b2'
  surface-tint: '#715d00'
  primary: '#554600'
  on-primary: '#ffffff'
  primary-container: '#715d00'
  on-primary-container: '#f3d876'
  inverse-primary: '#e0c566'
  secondary: '#606227'
  on-secondary: '#ffffff'
  secondary-container: '#e3e49b'
  on-secondary-container: '#64662a'
  tertiary: '#715d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#caa91f'
  on-tertiary-container: '#4d3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fde17e'
  primary-fixed-dim: '#e0c566'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#554500'
  secondary-fixed: '#e5e79e'
  secondary-fixed-dim: '#c9cb84'
  on-secondary-fixed: '#1c1d00'
  on-secondary-fixed-variant: '#484a10'
  tertiary-fixed: '#ffe178'
  tertiary-fixed-dim: '#e7c43c'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e6e1e1'
  surface-main: '#fcf9f8'
  gold-accent: '#d6b42c'
  deep-neutral: '#171717'
typography:
  display-lg:
    fontFamily: Tajawal
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
  headline-lg:
    fontFamily: Tajawal
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Tajawal
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Tajawal
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Tajawal
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Tajawal
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Tajawal
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  base: 8px
  sm: 12px
  gutter: 16px
  margin-mobile: 20px
  md: 24px
  lg: 40px
  xl: 64px
  margin-desktop: 120px
---

## Brand & Style

Ayar Premium is a high-end marketplace for gold and precious metals. The brand identity balances **Modern Corporate** reliability with **Premium Luxury** aesthetics. The target audience includes both professional traders and retail consumers looking for security and prestige. 

The visual style is characterized by "Digital Gold" — using sophisticated ochre and mustard tones rather than gaudy yellows. The interface utilizes generous whitespace (Minimalism) combined with subtle depth effects (Tonal layering) to create an environment that feels expensive, trustworthy, and organized. The emotional response should be one of confidence and exclusivity.

## Colors

The palette is rooted in an earthy, sophisticated gold spectrum. 

- **Primary Gold (#715d00):** Used for key branding elements and primary actions to signify value and heritage.
- **Primary Container (#d6b42c):** A brighter, metallic gold used for highlights and high-impact calls to action.
- **Background (#fcf9f8):** An off-white, warm "paper" tone that reduces eye strain compared to pure white and adds a touch of warmth.
- **Deep Neutral (#171717):** Used for high-contrast buttons and navigation elements to ground the lighter gold tones.
- **Secondary Sage (#606227):** A muted olive-green used sparingly for secondary features, providing a natural complement to the gold tones.

## Typography

The system uses a dual-font approach optimized for Arabic and Latin script legibility.

- **Tajawal** is the primary typeface for headlines and body copy. Its clean, geometric structure feels modern while maintaining traditional calligraphic roots.
- **IBM Plex Sans Arabic** is reserved for labels, buttons, and UI metadata. It provides a technical, systematic contrast to the softer Tajawal, improving hierarchy in dense information areas.

Hierarchy is strictly enforced through weight: Headlines use **Bold (700)** or **Semi-Bold (600)**, while body text stays at **Regular (400)** to maintain a clean, airy feel.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain a premium "magazine" feel, while transitioning to a fluid model for mobile.

- **Desktop:** 1440px max-width container with 120px side margins. 
- **Mobile:** 20px side margins with a single-column stacked flow.
- **Vertical Rhythm:** Sections are separated by large gaps (`xl`: 64px) to create breathing room. Smaller internal components use a base-8 increment system.
- **Navigation:** A fixed top bar (96px height) uses a backdrop blur to maintain context during scrolling.

## Elevation & Depth

Depth is used sparingly to signify "Premium" quality rather than standard utility.

- **Tonal Layering:** The primary method of separation. Section backgrounds alternate between `background` (#fcf9f8) and `surface-container` (#f0eded).
- **Gold Ambient Shadows:** Significant elements (like primary CTA sections) use a unique shadow: `0px 10px 30px rgba(214, 180, 44, 0.08)`. This "Gold Glow" reinforces the brand identity.
- **Standard Cards:** Use a very soft, neutral shadow (`0px 4px 20px rgba(0, 0, 0, 0.04)`) to lift white cards off the warm background.
- **Navigation:** Employs a `backdrop-blur-md` effect with a 95% opacity background, creating a glassmorphic layer that feels lightweight.

## Shapes

The design uses a "Highly Rounded" language to feel approachable and modern.

- **Large Components:** Hero cards and major sections use a **32px (2rem)** radius.
- **Standard Cards:** Use a **24px (1.5rem)** radius for a soft, friendly appearance.
- **Buttons:** Primary buttons use a **18px (1.125rem)** radius, creating a distinct "squircle" shape that sits between a standard rectangle and a pill.
- **Form Inputs:** Follow the standard `rounded-lg` (0.5rem) for a more structured, functional look.

## Components

### Buttons
- **Primary:** High-contrast solid background (`#171717`), white text, 18px radius. Includes a `hover:translate-y-[-2px]` transition for tactile feedback.
- **Secondary:** Outlined or subtle gold tint, focusing on typography and iconography.

### Cards
- **Premium Card:** White background, 24px radius, soft neutral shadow. Padding should be generous (`md` or `lg` spacing).
- **CTA Banner:** `inverse-surface` (#313030) background with gold ambient shadows and large 32px corner radius.

### Navigation
- **Top Nav:** Fixed position, blur effect, `primary` color for active states with a 2px bottom border offset.
- **Badges:** Store download buttons should remain standard official black badges to maintain user familiarity and trust.

### Inputs & Selection
- **Text Fields:** Minimalist style with `outline-variant` borders. Focus states should use the `primary` gold color.
- **Lists:** Use `surface-container` for list item backgrounds to distinguish from the main page surface.