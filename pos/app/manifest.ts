import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} – Free POS System`,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#fffcf2',
    theme_color: '#252422',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
