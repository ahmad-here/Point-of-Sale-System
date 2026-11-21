/**
 * Site-wide configuration. Set these in your hosting provider's environment
 * variables (or a local .env.local file) before deploying.
 */
export const siteConfig = {
  name: 'TOSPOS',
  title: 'TOSPOS – Free Online POS System for Small Businesses',
  shortDescription: 'Free browser-based point of sale with inventory, sales, payments and analytics.',
  description:
    'TOSPOS is a free, browser-based point of sale (POS) system for retail shops, cafés and small businesses. Ring up sales, print receipts, track inventory and stock alerts, record payments and view sales analytics — no installation or sign-up required.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://tospos.com').replace(/\/$/, ''),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@tospos.com',
  /** e.g. ca-pub-1234567890123456 — enables the AdSense script and /ads.txt */
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
  /** The token from Google Search Console's "HTML tag" verification method */
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  /** Optional Google Analytics 4 measurement ID, e.g. G-XXXXXXXXXX */
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  keywords: [
    'free POS system',
    'online point of sale',
    'POS software for small business',
    'retail POS',
    'inventory management software',
    'browser based POS',
    'cash register app',
    'sales tracking',
    'receipt printing',
    'stock management',
  ],
  locale: 'en_US',
};

export type SiteConfig = typeof siteConfig;

/**
 * Page-level `openGraph` objects replace the root one instead of merging, so
 * pages that set their own must include the share image explicitly.
 */
export const ogImages = [{ url: '/opengraph-image', width: 1200, height: 630, alt: siteConfig.title }];
