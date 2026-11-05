// Ayar Premium design tokens — shared Tailwind config for the public site.
// Source of truth: web-side-ayar/ayar_prestige/DESIGN.md
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "gold-accent": "#d6b42c",
        "on-tertiary-container": "#4d3e00",
        "outline": "#7d7766",
        "surface": "#fdf8f8",
        "inverse-primary": "#e0c566",
        "on-primary-fixed-variant": "#554500",
        "deep-neutral": "#171717",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "surface-main": "#fcf9f8",
        "on-surface": "#1c1b1b",
        "on-error": "#ffffff",
        "primary-fixed-dim": "#e0c566",
        "outline-variant": "#cec6b2",
        "surface-container-lowest": "#ffffff",
        "primary": "#554600",
        "surface-container": "#f0eded",
        "inverse-on-surface": "#f4f0ef",
        "surface-container-highest": "#e6e1e1",
        "error": "#ba1a1a",
        "surface-container-high": "#ece7e7",
        "surface-bright": "#fdf8f8",
        "on-background": "#1c1b1b",
        "primary-fixed": "#fde17e",
        "secondary-fixed": "#e5e79e",
        "on-primary-fixed": "#221b00",
        "on-secondary-fixed": "#1c1d00",
        "secondary-fixed-dim": "#c9cb84",
        "secondary": "#606227",
        "background": "#fdf8f8",
        "surface-container-low": "#f7f2f2",
        "on-tertiary-fixed": "#231b00",
        "tertiary-fixed-dim": "#e7c43c",
        "on-primary-container": "#f3d876",
        "inverse-surface": "#313030",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "tertiary-fixed": "#ffe178",
        "tertiary": "#715d00",
        "on-secondary-fixed-variant": "#484a10",
        "on-primary": "#ffffff",
        "surface-tint": "#715d00",
        "on-surface-variant": "#4c4637",
        "secondary-container": "#e3e49b",
        "tertiary-container": "#caa91f",
        "on-tertiary-fixed-variant": "#554500",
        "surface-variant": "#e6e1e1",
        "surface-dim": "#ddd9d8",
        "on-secondary-container": "#64662a",
        "primary-container": "#715d00"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1.5rem",
        "squircle": "18px",
        "full": "9999px"
      },
      spacing: {
        "base": "8px",
        "margin-mobile": "20px",
        "lg": "40px",
        "gutter": "16px",
        "xs": "4px",
        "xl": "64px",
        "md": "24px",
        "margin-desktop": "120px",
        "sm": "12px"
      },
      fontFamily: {
        "headline-lg-mobile": ["Tajawal"],
        "label-sm": ["IBM Plex Sans Arabic"],
        "headline-lg": ["Tajawal"],
        "display-lg": ["Tajawal"],
        "body-lg": ["Tajawal"],
        "body-md": ["Tajawal"],
        "headline-md": ["Tajawal"],
        "label-lg": ["IBM Plex Sans Arabic"],
        "headline-sm": ["Tajawal"]
      },
      fontSize: {
        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "700" }],
        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
        "display-lg": ["40px", { "lineHeight": "52px", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.02em", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }]
      },
      boxShadow: {
        "premium": "0px 4px 20px rgba(0, 0, 0, 0.04)",
        "gold-glow": "0px 10px 30px rgba(214, 180, 44, 0.08)"
      }
    }
  }
};
