/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BRAND CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Single file to edit when adapting the theme for a new client.
 *
 * Colors flow into  → src/styles/theme.css  (CSS custom properties)
 * Fonts flow into   → astro.config.mjs      (Astro 6 built-in font optimizer)
 * Meta flows into   → src/layouts/BaseLayout.astro
 *
 * Color format: use hex (#1a1a2e) or CSS color values.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const brand = {
  name: '1822 Media',
  tagline: 'Capturing the game, delivering the memories.',
  description:
    'Professional lacrosse event photography and videography by c4studio. Browse and download event galleries for your team.',
  url: 'https://media.1822lax.com',
  locale: 'en_US',

  fonts: {
    body: 'Inter',
    display: 'Oswald',
  },

  colors: {
    primary:      '#001822',
    primaryLight: '#003040',
    primaryFg:    '#FAFAFA',

    accent:       '#00FFFF',
    accentFg:     '#001822',

    background:   '#FAFAFA',
    surface:      '#F0F4F8',
    border:       '#D1D9E0',

    text:         '#001822',
    textMuted:    '#4A6070',

    dark:         '#001822',
    darkSurface:  '#0A2535',
  },

  radius: {
    sm:   '0.375rem',
    md:   '0.625rem',
    lg:   '1rem',
    full: '9999px',
  },
} as const;

export type Brand = typeof brand;
