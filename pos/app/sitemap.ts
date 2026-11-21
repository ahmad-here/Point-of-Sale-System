import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import { guides } from '@/lib/guides';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/guides`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];
  const guidePages: MetadataRoute.Sitemap = guides.map(g => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  return [...staticPages, ...guidePages];
}
