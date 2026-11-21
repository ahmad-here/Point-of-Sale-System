import Script from 'next/script';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import JsonLd from '@/components/site/json-ld';
import { siteConfig } from '@/lib/site';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
          logo: `${siteConfig.url}/icon.png`,
          email: siteConfig.contactEmail,
        }}
      />
      {siteConfig.adsenseClient && (
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClient}`}
        />
      )}
    </>
  );
}
