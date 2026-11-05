---
name: Ayar Souq (سوق عيار)
colors:
  surface: '#fff8f3'
  surface-dim: '#e3d8cc'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fef2e5'
  surface-container: '#f8ecdf'
  surface-container-high: '#f2e6da'
  surface-container-highest: '#ece1d4'
  on-surface: '#201b13'
  on-surface-variant: '#4d4635'
  inverse-surface: '#352f27'
  inverse-on-surface: '#fbefe2'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#665d51'
  on-secondary: '#ffffff'
  secondary-container: '#ebdece'
  on-secondary-container: '#6b6155'
  tertiary: '#795909'
  on-tertiary: '#ffffff'
  tertiary-container: '#d6ad59'
  on-tertiary-container: '#5a4100'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#eee0d1'
  secondary-fixed-dim: '#d2c4b5'
  on-secondary-fixed: '#211b11'
  on-secondary-fixed-variant: '#4e453a'
  tertiary-fixed: '#ffdea3'
  tertiary-fixed-dim: '#ecc06a'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#fff8f3'
  on-background: '#201b13'
  surface-variant: '#ece1d4'
typography:
  display-hero:
    fontFamily: Tajawal
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: 4.25rem
  display-hero-mobile:
    fontFamily: Tajawal
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: 2.85rem
  headline-xl:
    fontFamily: Tajawal
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 3.25rem
  headline-xl-mobile:
    fontFamily: Tajawal
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
  headline-lg:
    fontFamily: Tajawal
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.6rem
  headline-md:
    fontFamily: Tajawal
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
  headline-sm:
    fontFamily: Tajawal
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Tajawal
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.85rem
  body-md:
    fontFamily: Tajawal
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.65rem
  body-sm:
    fontFamily: Tajawal
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.45rem
  label-lg:
    fontFamily: Tajawal
    fontSize: 0.875rem
    fontWeight: '700'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Tajawal
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
  label-micro:
    fontFamily: Tajawal
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

## Brand & Style

The design system embodies the regal heritage and modern prestige of the United Arab Emirates' gold and precious metals trade. It merges high-trust fintech precision with the bespoke intimacy of private bullion and high-jewelry salons. 

### Core Aesthetic: Emirati Luxe Modernism
- **Personality**: Sovereign, impeccably trustworthy, discerning, contemporary, and warmly hospitable.
- **RTL-First Architecture**: Built natively for Arabic script flow, typography, and visual progression from right to left, while seamlessly scaling to bi-lingual English counterparts.
- **Visual Rhythm**: Borrowed from premier luxury digital platforms—generous breathing room, deliberate vertical progression, soft champagne backing panels, pill-shaped micro-badges, and alternating hero-style showcase modules.
- **Emotional Response**: Evokes the physical sensation of stepping into an exclusive private vault in the Dubai Gold Souk or an elite jeweler's lounge in Abu Dhabi: substantial, authentic, secure, and luminous.

## Colors

The palette balances warm metallic radiance with grounded, deep earth tones to reinforce value and authenticity.

### Palette Architecture
- **Primary Gold (`#D4AF37`)**: The definitive 24-karat hallmark. Applied to primary call-to-actions, live karat tickers, verified badges, and active state highlights.
- **Deep Espresso (`#292218`)**: Grounding foundational dark tone. Used for deep security sections, inverted banner showcases, high-contrast headline texts, and master navigation bars.
- **Dark Gold Accent (`#896719`)**: Rich, burnished gold used for borders, active icon fills, and sub-headers that demand elevated contrast against pale backgrounds.
- **Warm Ivory Surface (`#FBF9F5`)**: Canvas background that softens harsh screen brightness, providing a silky, parchment-like backdrop.
- **Champagne Fill (`#F2E8D2`)**: Secondary card container fill, providing soft warm contrast behind pristine white cards.
- **Pure Bullion White (`#FFFFFF`)**: Primary foreground container surface used to float gold pieces, inspection certificates, and live transaction modules.
- **Secondary Neutral Muted (`#726A60`)**: Body secondary text and passive border lines, formulated to avoid clinical cool grays.

## Typography

The design system exclusively utilizes **Tajawal**, an exceptionally refined modern Arabic typeface that harmonizes geometric clarity with authentic Naskh calligraphic proportion.

### Script & Hierarchy Rules
- **Line Heights**: Arabic script features ascenders, descenders, and accent marks (Tashkeel) requiring ~20-30% taller line-height allowances compared to Latin sans-serifs to prevent clipping and optical crowding.
- **Kashida & Kerning**: Natural fluid letter connections with strict avoidance of artificial character spacing (`letter-spacing: 0` is strictly enforced for Arabic styles).
- **Numerals**: Uses localized Eastern Arabic Numerals (`٠١٢٣٤٥٦٧٨٩`) for sovereign/formal certificate views, and standard Western numerals for high-speed live trading charts and karat tickers (`18K`, `21K`, `24K`).

## Layout & Spacing

Inspired by modern luxury editorial layouts, spacing creates intentional pauses, drawing total focus toward bullion purity, hallmark stamps, and certified artisan craft.

### Layout Principles
- **Grid Architecture**: 12-column dynamic fluid grid on desktop (`1280px` max-width content container), condensing to 6 columns on tablet and 2 columns on mobile.
- **RTL Reversal**: The reading direction starts from top-right. Back buttons, chevron indicators, progression steppers, and pricing plan cards mirror symmetrically across the vertical axis.
- **Compositional Rhythm**: Alternates between:
  1. Open, airy ivory sections with floating pure-white item cards.
  2. Full-bleed deep espresso bands (`#292218`) containing gold vaults, bullion guarantee seals, and verification features.
  3. Paired split modules featuring 3D mobile previews offset against step-by-step marketplace workflows.

## Elevation & Depth

Visual hierarchy rejects harsh drop shadows in favor of ambient warm radiance and physical vault-grade depth.

### Elevation Levels
- **Level 0 (Flat / Recessed)**: `#FBF9F5` canvas base and `#F2E8D2` champagne structural containers.
- **Level 1 (Card Rest)**: Pure white cards (`#FFFFFF`) floating with ambient warm gold diffusion:
  `box-shadow: 0 10px 30px -10px rgba(137, 103, 25, 0.08), 0 1px 3px 0 rgba(41, 34, 24, 0.04);`
  Bordered with an ultra-fine 1px tone: `rgba(212, 175, 55, 0.2)`.
- **Level 2 (Interactive Hover / Floating Nav)**:
  `box-shadow: 0 20px 40px -12px rgba(137, 103, 25, 0.16), 0 2px 6px 0 rgba(41, 34, 24, 0.06);`
- **Level 3 (Modals / Vault Sheets)**:
  `box-shadow: 0 32px 64px -16px rgba(41, 34, 24, 0.25);`
- **Lustre Overlay**: Elevated badges and metallic cards utilize a subtle linear gradient angle of 135deg with a highlight sweep: `linear-gradient(135deg, #DFBE52 0%, #D4AF37 50%, #B89223 100%)`.

## Shapes

The design system employs refined roundedness with distinct 24px (`1.5rem`) curved radiuses across principal showcase cards, instilling a soft, modern touch that tempers the rigid nature of financial bullion.

### Geometric Rules
- **Showcase & Product Cards**: Uniform `24px` radius (`rounded-xl`).
- **Input Fields & Interactive Controls**: `12px` radius (`rounded-md`).
- **Badges, Filter Pills, Action Buttons**: Complete pill radius (`9999px`) to create smooth jewel-like interactive contact points.
- **RTL Corner Asymmetry**: In testimonial quotes or callout accents, where asymmetrical corners are used, the trailing tail strictly originates on the right flank to align with Arabic reading flow.

## Components

### Buttons
- **Primary Sovereign Button**: Pill-shaped (`rounded-full`), solid background `#D4AF37` gradient down to `#C49B28`, label colored `#292218` in `Tajawal Bold`. Accompanied by a soft gold halo shadow on hover.
- **Secondary Espresso Button**: Deep `#292218` background, pure white or `#D4AF37` text label, used for high-importance enterprise authentication or checkout triggers.
- **Tertiary Champagne Outline**: Border of 1.5px in `#D4AF37`, transparent fill, text `#896719`.

### Micro-Badges & Verification Marks
- **Government / Authenticity Badges**: Pill-shaped micro-containers (`padding: 4px 12px`) with `#F2E8D2` background, an authentic micro-seal icon in gold, and `label-micro` typography in `#896719`.
- **UAE Karat Badges**: Ultra-crisp indicators (`24K`, `21K`, `18K`) styled with a 1px border of `#D4AF37` and subtle metallic gradient fill.

### Marketplace Cards
- **Product & Bullion Cards**: Set on pure white (`#FFFFFF`) with 24px corner radii. The image sits within a slightly tinted champagne inset (`#FBF9F5`) to display gold jewelry with maximum contrast. Live spot-market pricing updates in deep espresso `#211E19`.
- **Feature Stepper Cards**: Inspired by luxury fintech setups; step index numbers (`٠١`, `٠٢`, `٠٣`) are watermarked at 80px size in ultra-light `#F2E8D2` in the background, with modern mobile UI previews beside them.

### Input Fields & Search Bars
- **Market Search**: Floating white pill container with a dual Karat/Gram selector on the left, an Arabic placeholder (`ابحث عن سبائك، مجوهرات، أو عيار محدد...`) aligned to the right, and an integrated search button finished in brushed gold.
- **Borders**: Inactive state features `1px solid rgba(114, 106, 96, 0.2)`; active focus transitions smoothly to `1.5px solid #D4AF37` with an ambient ring.

### Live Gold Ticker Strip
- A dark espresso ribbon (`#292218`) situated at the top or directly below the hero. Real-time per-gram rates for 24K, 22K, 21K, and 18K in AED with subtle positive/negative indicator arrows in gold and muted terracotta.