Act as a senior React architect and frontend engineer.

Build a maintainable, scalable React website for **سوق عيار — Ayar Souq**, starting with its public landing page.

Use the supplied project report, approved design direction, and any Stitch exports or screenshots as references.

The priority is a clean architecture that supports future growth while remaining straightforward for a small development team.

Inspect the workspace first, briefly explain your implementation decisions, and then proceed with implementation. Do not stop after providing a plan.

## 1. Inspect the existing project

Before changing files:

* Read repository instructions, package.json, configuration, and the lockfile.
* Identify existing routing, styling, localization, assets, and components.
* Preserve unrelated work and existing functionality.
* If a suitable React project already exists, improve it incrementally and retain its framework.
* For a new project, use Next.js App Router with React and TypeScript.
* If this workspace contains the Angular administration panel, create the public website as an isolated project without modifying the admin application’s tooling.
* Use the existing package manager consistently.
* Check current official documentation for the installed framework versions.

Do not introduce a monorepo, migrate frameworks, or rewrite unrelated applications solely to achieve this folder structure.

## 2. Product scope

Ayar Souq is a specialized classifieds platform for gold, jewelry, and precious metals, initially targeting the UAE.

The public website introduces the mobile application and explains:

* Listing discovery and filtering.
* Structured specifications such as karat and weight.
* Metal prices as a market reference.
* Individual identity-verification badges.
* Business-verification badges and business profiles.
* Administrative review of advertisements.

The initial deliverable is the marketing website.

Do not implement authentication, administration screens, checkout, escrow, chat, subscriptions, auctions, or a full web marketplace.

Do not invent user statistics, customer testimonials, commercial plans, or functionality absent from the report.

## 3. Technology choices

For a new project, use:

* React with Next.js App Router.
* TypeScript with strict mode.
* Tailwind CSS and CSS custom properties for design tokens.
* next-intl for Arabic and English localization.
* Native fetch for confirmed API integrations.
* ESLint with framework-appropriate configuration.

Use compatible stable package versions and retain the lockfile.

Keep dependencies minimal:

* Use React state for local interactions.
* Do not add Redux, Zustand, Axios, or a query library without an actual requirement.
* Prefer CSS for simple animations.
* Add an animation library only if the supplied design requires behavior that justifies it.
* Use accessible native HTML before adding a component library.

For an existing project, use compatible equivalents already present instead of duplicating tools.

## 4. Architecture

Use a lightweight feature-based structure.

Separate:

1. Framework routing and page composition.
2. Feature-specific sections and behavior.
3. Shared UI and layout components.
4. Localized content.
5. Configuration and design tokens.
6. External data access.

Suggested structure for a new Next.js project:

```text
public/
  images/
  fonts/

src/
  app/
    [locale]/
      layout.tsx
      (marketing)/
        layout.tsx
        page.tsx
    globals.css
    robots.ts
    sitemap.ts

  features/
    home/
      sections/
      components/
      content.ts

  components/
    ui/
    layout/
    brand/

  config/
    site.ts
    navigation.ts

  i18n/
    routing.ts
    navigation.ts
    request.ts
    messages/
      ar.json
      en.json

  lib/
    seo/

  styles/
    tokens.css

tests/
  e2e/

docs/
  architecture.md

.env.example
README.md
```

This structure defines responsibilities. Create files only when the implementation needs them.

Add API helpers or additional feature folders when they have a real consumer. Avoid empty directories, speculative services, and unused abstractions.

### Dependency rules

* Route files compose features and layouts.
* Features may depend on shared components and utilities.
* Shared components must not import page-specific features.
* Keep feature-specific components, types, and hooks close to their feature.
* Extract shared code when it has a clear reusable purpose.
* Avoid circular dependencies and catch-all barrel exports.
* Use an `@/` import alias.

Do not turn the homepage into one giant JSX file.

Do not split every small HTML fragment into a separate component.

## 5. Homepage composition

Keep the homepage route focused on composing sections.

Suggested section components:

* HeroSection
* ProductOverviewSection
* MetalPricesSection
* FeaturesSection
* BusinessProfilesSection
* HowItWorksSection
* AudienceSection
* VerificationSection
* FAQSection
* DownloadSection

Place the shared header and footer in the marketing layout.

Create reusable building blocks where appropriate:

* Container
* SectionHeading
* Button
* AppDownloadButtons
* PhoneMockup
* VerificationBadge
* LanguageSwitcher
* MobileNavigation

Use explicit section composition. Do not introduce a generic page-builder engine or a complex JSON-driven renderer for this landing page.

Preserve the supplied Stitch design’s composition, spacing, and responsive behavior while converting its exported markup into maintainable components.

## 6. Content and configuration

Keep responsibilities distinct:

* Translation files contain user-facing text.
* Feature content files define structured items, stable IDs, image references, and translation keys.
* Site configuration contains brand information, the canonical website URL, confirmed store links, and other public settings.
* Design tokens contain reusable visual values.

Avoid duplicating the same content across these layers.

Do not embed long marketing paragraphs, store URLs, or repeated configuration values throughout components.

Repeated cards and FAQ items should be data-driven and use stable IDs as React keys.

Keep all visible messages localized, including accessibility labels, loading states, unavailable states, and errors.

## 7. Arabic and English support

Implement localization from the beginning.

Requirements:

* Arabic is the default language.
* Support dedicated `/ar` and `/en` routes.
* Use the URL as the source of truth for the locale.
* Set HTML `lang` and `dir` correctly in the initial rendered document.
* Arabic uses RTL; English uses LTR.
* Language switching preserves the equivalent route where available.
* Unsupported locale URLs resolve correctly to a not-found response.
* Keep translation keys consistent and typed where supported.
* Use the routing integration appropriate to the installed Next.js and next-intl versions.

Use CSS logical properties and direction-aware layouts.

Do not determine the initial language or direction through a browser-only effect.

Format dates, numbers, and AED currency consistently using locale-aware formatting. Use Asia/Dubai explicitly where time-zone-sensitive display requires it.

## 8. Rendering strategy

For a new Next.js implementation:

* Prefer statically prerendered marketing content.
* Use Server Components for content and composition that do not need browser interaction.
* Add Client Components only for interactive elements such as the mobile menu, tabs, and language switching when required.
* Keep client boundaries narrow.
* Do not mark the whole homepage or root layout with `"use client"` just for a few interactions.
* Follow the installed version’s documented locale-prerendering approach.

Use a normal Next.js production build by default.

Do not enable static export automatically. Document it as a separate deployment option only when the target hosting requires it and the implementation supports its limitations.

## 9. External API readiness

The initial site must render and build without depending on unavailable backend services.

The supplied report primarily describes administration APIs. Do not assume those endpoints are public or suitable for the marketing site.

When a confirmed public endpoint is available:

* Put feature-specific data access beside its feature.
* Keep shared HTTP behavior small and reusable.
* Validate external data at the boundary.
* Convert backend responses into explicit frontend models.
* Keep transport details out of presentational components.
* Define loading, empty, unavailable, and error behavior.
* Specify caching and freshness deliberately.
* Keep private credentials server-side.

For metal prices:

* Display currency, unit, relevant purity, and update time.
* Do not describe data as live unless the update mechanism supports that claim.
* Never silently replace unavailable data with fabricated current prices.
* Clearly distinguish illustrative design data from real market data.
* An unavailable price service must not prevent the rest of the landing page from rendering.

Do not invent endpoint paths or response contracts.

## 10. Design system

Preserve the approved Ayar visual identity:

* Gold accent: #D4AF37.
* Warm ivory backgrounds.
* Dark, readable text.
* Soft champagne surfaces.
* Rounded cards and subtle shadows.
* Tajawal for Arabic.
* Refined phone mockups and restrained animation.

Centralize tokens for:

* Colors.
* Typography.
* Spacing.
* Container widths.
* Border radii.
* Shadows.
* Motion durations.

Avoid scattering repeated arbitrary values through components.

Use existing font and image assets when provided. Do not reference fictional asset filenames.

Build responsive layouts for mobile, tablet, and desktop.

## 11. Accessibility and performance

Implement:

* Semantic page landmarks.
* One meaningful H1.
* A logical heading hierarchy.
* Visible keyboard focus.
* Accessible mobile navigation and tabs.
* Reduced-motion support.
* Appropriate image alternative text.
* Readable contrast.
* No horizontal overflow on small screens.

Optimize images with correct dimensions and responsive sizing.

Prioritize essential hero media and lazy-load suitable below-the-fold images.

Do not hide meaningful marketing content behind client-only loading or scroll animations.

## 12. SEO and public links

Implement localized:

* Page titles and descriptions.
* Canonical URLs.
* Language alternate links.
* Open Graph metadata.
* Sitemap entries.
* Robots configuration.

Use the framework’s metadata facilities when available.

Do not invent ratings, prices, or organization details for structured data.

Render working store links only when confirmed destinations are configured.

Do not use misleading `href="#"` links for downloads, policies, or support.

Create legal pages only when approved content is supplied. Keep missing-content items documented rather than publishing invented legal text.

## 13. Verification

Run checks appropriate to the implementation:

* Lint.
* Type checking.
* Production build.
* A focused set of browser checks or Playwright smoke tests.

Cover meaningful behavior:

* Arabic and English routes render.
* Initial HTML language and direction are correct.
* Language switching reaches the equivalent page.
* Mobile navigation works with keyboard interaction.
* Configured download links are correct.
* Missing optional API configuration does not break the page.
* The mobile layout has no horizontal overflow.

Do not create repetitive tests for every static card.

Report actual results. Do not claim checks passed unless they were run.

## 14. Documentation and completion

Provide:

1. A working project, not only a proposed directory tree.
2. README instructions for installation, development, checks, and production builds.
3. An `.env.example` with descriptive placeholders and no secrets.
4. A short architecture document explaining:

   * Folder responsibilities.
   * Server/client boundaries.
   * How to add or reorder a landing section.
   * How to add a localized page.
   * How to connect a confirmed public API.
   * How to update content, assets, store links, and design tokens.
5. A concise completion report listing changes, verification results, and missing external inputs.

Make routine implementation decisions independently.

Build the smallest coherent architecture that supports this website today and provides clear extension points for tomorrow.
