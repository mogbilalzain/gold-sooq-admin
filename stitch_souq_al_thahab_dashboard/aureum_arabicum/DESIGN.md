---
name: Aureum Arabicum
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#fff9ef'
  on-secondary: '#3a3000'
  secondary-container: '#ffdb3c'
  on-secondary-container: '#725f00'
  tertiary: '#ffc551'
  on-tertiary: '#412d00'
  tertiary-container: '#e1aa36'
  on-tertiary-container: '#5b4000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdea6'
  tertiary-fixed-dim: '#f7bd48'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered for a high-end gold trading platform, blending traditional Middle Eastern luxury with modern fintech precision. The brand personality is **Prestigious, Secure, and Sophisticated**. It targets high-net-worth investors and professional traders who demand a digital environment that reflects the tangible value of the assets they trade.

The visual style is a hybrid of **Modern Minimalism** and **Glassmorphism**. By utilizing deep, light-absorbing blacks against shimmering metallic accents, the UI creates a "vault-like" atmosphere. Elements appear as if they are etched into obsidian or floating on smoked glass, using subtle glow effects to highlight critical financial data without overwhelming the user.

## Colors

The palette is anchored in a dual-black foundation to provide maximum depth. **Deep Charcoal (#0A0A0A)** serves as the base background, while **Black (#121212)** defines elevated surface layers.

Gold is applied through a multi-tonal strategy:
- **Primary Gold (#D4AF37):** Used for primary actions, active states, and brand iconography.
- **Vibrant Gold (#FFD700):** Reserved for highlights, hover states, and critical price movements.
- **Deep Bronze (#B8860B):** Used for subtle gradients and secondary interactive elements to provide a weathered, authentic metallic feel.

All surface containers utilize a semi-transparent glass effect with a soft `backdrop-filter: blur(12px)` to maintain legibility over complex backgrounds or charts.

## Typography

The design system utilizes **IBM Plex Sans Arabic** for its exceptional clarity and professional weight distribution across both Arabic and Latin scripts. 

- **Hierarchy:** High contrast between titles and body text is essential. Use Bold (700) weights for financial figures and Semi-Bold (600) for section headers.
- **Alignment:** As a mandatory RTL system, all typography must default to right-aligned. Numeric data (prices/quantities) should utilize tabular lining figures to ensure vertical alignment in lists.
- **Style:** Headings should occasionally utilize the Gold Gradient (Primary to Secondary) to emphasize brand presence on marketing or dashboard landing spots.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for high-density financial data. 

- **Grid:** A 12-column grid is used for desktop with 24px gutters. On tablet, this shifts to 8 columns, and on mobile to 4 columns.
- **RTL Logic:** The layout direction is strictly Right-to-Left. Sidebars are anchored to the right, and content flows toward the left. Back buttons and "forward" chevrons must be mirrored accordingly.
- **Rhythm:** A 4px baseline grid ensures vertical consistency. Dashboard widgets should use `lg` (24px) internal padding to maintain a premium, spacious feel even when data-heavy.

## Elevation & Depth

Depth is communicated through **Tonal Layering** and **Subtle Glows** rather than heavy shadows.

- **Level 0 (Base):** Deep Charcoal (#0A0A0A) background.
- **Level 1 (Cards/Panels):** Black (#121212) with a 1px metallic border at 20% opacity.
- **Level 2 (Hover/Modals):** Increased surface brightness via a gold-tinted inner glow (`box-shadow: inset 0 0 10px rgba(212, 175, 55, 0.1)`).
- **Shadows:** Use extremely soft, large-radius shadows for floating elements: `0 20px 40px rgba(0, 0, 0, 0.6)`.

The interaction of glassmorphism and thin borders creates the "etched" premium look characteristic of luxury watch or jewelry catalogs.

## Shapes

The design system employs a **Rounded (Level 2)** shape language to soften the industrial nature of a dark-themed fintech app.

- **Standard Containers:** Cards and major panels use a 16px radius (`rounded-lg`).
- **Input Fields/Buttons:** Use an 8px radius (`rounded-md`) for a more precise, tool-like feel.
- **Interactive Icons:** Utilize a circular background (Pill) when used as standalone action triggers.

All borders are 1px thick, utilizing the metallic gold palette at low opacities to define edges without creating visual clutter.

## Components

### Buttons
- **Primary:** Gold-to-Bronze linear gradient with black text (Bold). Subtle 4px outer gold glow on hover.
- **Secondary:** Transparent background with a 1px Gold border. Text is Gold.
- **Tertiary:** No background or border. Subtle gold underline on hover.

### Inputs
Fields feature the **Level 1** background with a bottom-only 2px gold border that illuminates when focused. Labels are positioned above the field in `label-caps` style.

### Cards & Widgets
Dashboard widgets must include a 1px metallic border. Header sections within cards should be separated by a subtle 1px divider (`rgba(255,255,255,0.05)`).

### Gold Price Tickers
Price movements use the system's success/error colors but with a "neon" treatment—thin lines and high-saturation colors to ensure legibility against the dark background.

### Chips/Badges
Used for status (e.g., "Active Order"). These should be glassmorphic with tinted borders matching the status (Green for success, Gold for pending).