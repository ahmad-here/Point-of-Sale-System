import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // Everything stays crawlable. The POS workspace routes carry a `noindex`
    // robots meta tag instead of a robots.txt block, so Google can see the tag
    // and keep them out of results (a disallow would hide the tag).
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
