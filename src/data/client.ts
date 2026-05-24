/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CLIENT DATA
 * ─────────────────────────────────────────────────────────────────────────────
 * Business-specific copy: name, phone, email, address, socials.
 * Imported by Header, Footer, Contact page, and Head/SEO components.
 *
 * No component should hardcode a business name or phone number —
 * everything comes from this file or brand.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const client = {
  name: '1822 Media',
  email: '1822lax@gmail.com',
  phoneForTel: '',
  phoneFormatted: '',
  license: '',
  address: {
    lineOne: '',
    lineTwo: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    mapLink: '',
  },
  socials: {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    google: '',
  },
  domain: 'https://media.1822lax.com',
} as const;

export type Client = typeof client;
