/* Configuration Tailwind partagée — reprend le design system Africadôme (DESIGN.md)
   Les couleurs sont des variables CSS (style.css) : thème sombre par défaut, thème clair via html.light */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "rgb(var(--c-surface) / <alpha-value>)",
        "surface-dim": "rgb(var(--c-surface-dim) / <alpha-value>)",
        "surface-bright": "rgb(var(--c-surface-bright) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--c-surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--c-surface-container-low) / <alpha-value>)",
        "surface-container": "rgb(var(--c-surface-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--c-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--c-surface-container-highest) / <alpha-value>)",
        "surface-variant": "rgb(var(--c-surface-variant) / <alpha-value>)",
        "on-surface": "rgb(var(--c-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--c-on-surface-variant) / <alpha-value>)",
        "outline": "rgb(var(--c-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--c-outline-variant) / <alpha-value>)",
        "primary": "rgb(var(--c-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--c-on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--c-primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--c-on-primary-container) / <alpha-value>)",
        "primary-fixed": "rgb(var(--c-primary-fixed) / <alpha-value>)",
        "secondary": "rgb(var(--c-secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--c-on-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--c-secondary-container) / <alpha-value>)",
        "tertiary": "rgb(var(--c-tertiary) / <alpha-value>)",
        "on-tertiary": "rgb(var(--c-on-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--c-tertiary-container) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--c-tertiary-fixed) / <alpha-value>)",
        "error": "rgb(var(--c-error) / <alpha-value>)",
        "error-container": "rgb(var(--c-error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--c-on-error-container) / <alpha-value>)",
        "white": "rgb(var(--c-white) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"]
      },
      fontSize: {
        "display-hero": ["48px", { lineHeight: "56px", letterSpacing: "-0.03em", fontWeight: "800" }],
        "headline-xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-xl-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "headline-lg": ["22px", { lineHeight: "30px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "title-sm": ["15px", { lineHeight: "22px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-badge": ["11px", { lineHeight: "14px", letterSpacing: "0.06em", fontWeight: "800" }],
        "label-meta": ["12px", { lineHeight: "16px", fontWeight: "500" }]
      },
      spacing: {
        "margin": "1rem",
        "margin-md": "2rem",
        "margin-lg": "3.5rem",
        "gutter": "1.25rem",
        "gutter-lg": "1.75rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.25rem",
        "space-2xl": "3.5rem"
      }
    }
  }
};
