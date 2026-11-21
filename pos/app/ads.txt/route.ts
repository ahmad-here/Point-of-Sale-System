import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * Serves /ads.txt for Google AdSense once NEXT_PUBLIC_ADSENSE_CLIENT is set.
 * f08c47fec0942fa0 is Google's published certification authority ID.
 */
export function GET() {
  const pub = siteConfig.adsenseClient.replace(/^ca-/, '');
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# AdSense publisher ID not configured\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
