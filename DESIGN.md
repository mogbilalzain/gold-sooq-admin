---
name: Ayar Sooq Gold Exchange
colors:
  surface: '#f1fbff'
  surface-dim: '#d1dce0'
  surface-bright: '#f1fbff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf5fa'
  surface-container: '#e4f0f4'
  surface-container-high: '#dfeaef'
  surface-container-highest: '#d9e4e9'
  on-surface: '#131d21'
  on-surface-variant: '#4d4635'
  inverse-surface: '#283236'
  inverse-on-surface: '#e7f3f7'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#586062'
  on-secondary: '#ffffff'
  secondary-container: '#dae1e3'
  on-secondary-container: '#5d6466'
  tertiary: '#5c5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#b1b3b4'
  on-tertiary-container: '#434546'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#dde4e6'
  secondary-fixed-dim: '#c1c8ca'
  on-secondary-fixed: '#161d1f'
  on-secondary-fixed-variant: '#41484a'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f1fbff'
  on-background: '#131d21'
  surface-variant: '#d9e4e9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-padding: 2rem
  section-gap: 2.5rem
  element-gap: 1rem
  grid-columns: '12'
  gutter: 24px
  sidebar-width: 280px
---

## Brand & Style

The design system is engineered for the high-end gold and precious metals market, specifically tailored for the **Ayar Sooq** admin ecosystem. The brand personality is **Prestigious, Secure, and Sophisticated**, aiming to evoke a sense of trust and exclusivity. 

The visual style blends **Minimalism** with **Modern Fintech** aesthetics. It utilizes heavy whitespace to allow the premium typography and gold accents to breathe. The interface avoids clutter, focusing on high-value data and effortless navigation. To align with luxury expectations, the system employs high-quality rendering metaphors: soft-depth shadows, subtle micro-interactions, and a focus on clarity. The RTL (Right-to-Left) orientation is the primary structural foundation, ensuring the cultural and linguistic requirements of the Arabic-speaking market are met with native precision.

## Colors

The palette is anchored by **Premium Gold (#D4AF37)**, used sparingly for primary actions, active states, and brand-critical highlights to maintain its value without overwhelming the user. 

- **Backgrounds:** The interface utilizes a tiered white system. The base page background is **Soft Off-White (#F8F9FA)**, while functional containers and cards use **Pure White (#FFFFFF)** to create subtle contrast.
- **Typography:** Headlines and primary labels use **Charcoal (#2D3436)** for maximum legibility. Secondary metadata uses a lighter neutral gray.
- **Statuses:** High-end fintech requires clear feedback. We use desaturated, pastel-inspired washes for backgrounds with high-contrast text to signal state:
    - **Emerald Wash:** Successful transactions/Published items.
    - **Amber Wash:** Items in review/Pending.
    - **Rose Wash:** Errors/Rejected entries.

## Typography

This design system uses **Plus Jakarta Sans** as the sole typeface. Chosen for its modern, geometric construction and soft terminals, it mirrors the premium yet accessible nature of the brand. Its wide apertures ensure excellent legibility for complex financial data.

The hierarchy is built on a high-contrast scale. Large display sizes are reserved for portfolio balances and primary dashboard totals. For the Arabic implementation, the system maintains generous line heights (minimum 1.5x for body text) to accommodate the taller ascenders and descenders characteristic of Arabic script. All letter-spacing is neutralized or slightly tightened for headlines to maintain a "tight," professional look.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model optimized for **RTL (Right-to-Left)**. The primary navigation sidebar is docked to the right, with the main content area expanding to fill the viewport width.

- **Grid:** A 12-column system is used for the dashboard. KPI cards typically span 3 columns on desktop and 12 on mobile.
- **Rhythm:** We employ an 8px spacing scale. However, for this luxury dashboard, "Generous Whitespace" is a core principle. Standard card padding is set to **32px (2rem)** to ensure data points do not feel cramped.
- **Breakpoints:**
    - **Desktop (1440px+):** Sidebar is expanded (280px). 32px page margins.
    - **Tablet (768px - 1024px):** Sidebar collapses to icons only. 24px page margins.
    - **Mobile (<768px):** Sidebar moves to a bottom navigation or hidden drawer. 16px page margins.

## Elevation & Depth

To convey a "High-End" feel, the design system avoids harsh borders. Instead, it uses **Ambient Deep Shadows** to create a sense of physical layering.

- **Level 1 (Cards):** Low-position, highly diffused shadow. (Blur: 30px, Y: 10px, Opacity: 4% Black). This makes cards appear as if they are floating slightly above the off-white background.
- **Level 2 (Active States/Dropdowns):** Deeper, more pronounced shadow to indicate focus or interactivity.
- **Level 0 (Ghosting):** For inactive or secondary sections, a 1px border in a very light gray (#E2E8F0) is used without a shadow to keep the hierarchy clear.

Background blurs (Glassmorphism) are used exclusively for the Sidebar and Header to provide a sense of context and depth as content scrolls beneath them.

## Shapes

The shape language is defined by **Exaggerated Roundness**. Following the requirement for a 20px base radius, we utilize a large corner radius to soften the technical nature of fintech data and make the interface feel more organic and "welcoming."

- **Primary Containers/Cards:** 20px (1.25rem) corner radius.
- **Buttons & Inputs:** Fully pill-shaped or 12px radius minimum to maintain consistency.
- **Data Tables:** Outer table containers must match the card radius (20px), while internal row highlights use a smaller 8px radius.

## Components

### KPI Cards
The hallmark of the dashboard. Each card features a "Gold Accent" top border (2px) or a subtle gold-tinted icon background. They include a large primary metric, a sparkline chart for trend visualization, and a status badge for percentage change.

### Data Tables
Tables are designed with high row heights (64px+) and minimal vertical borders. The header row is distinguished by a subtle gray background. Hover states should apply a soft gold-tinted wash (#FAF7ED) to the entire row.

### Status Badges
Used for "Published," "Pending," and "Rejected." These are pill-shaped with small font sizes (label-sm) and semi-bold weights. The background is a soft pastel wash of the status color, and the text is a darkened version of the same hue.

### Primary Buttons
These use a solid **Gold (#D4AF37)** background with white text. To maintain the luxury feel, they use a subtle gradient (top-to-bottom) and a soft shadow that matches the button color.

### Sophisticated Charts
Charts should use a custom palette of Gold, Charcoal, and muted Slate. Grid lines should be nearly invisible. Area charts are preferred over line charts, using a gradient fill that fades from the primary gold to transparent.