import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuide } from '@/lib/guides';
import JsonLd from '@/components/site/json-ld';
import { siteConfig, ogImages } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: 'article',
      url: `/guides/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
      images: ogImages,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const others = guides.filter(g => g.slug !== guide.slug).slice(0, 3);
  const url = `${siteConfig.url}/guides/${guide.slug}`;

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            datePublished: guide.published,
            dateModified: guide.updated,
            mainEntityOfPage: url,
            author: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
            publisher: { '@type': 'Organization', name: siteConfig.name, logo: { '@type': 'ImageObject', url: `${siteConfig.url}/icon.png` } },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteConfig.url}/guides` },
              { '@type': 'ListItem', position: 3, name: guide.title, item: url },
            ],
          },
        ]}
      />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[#403d39]">
          <Link href="/" className="hover:text-[#c43d19]">Home</Link> / <Link href="/guides" className="hover:text-[#c43d19]">Guides</Link>
        </nav>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-[#252422] sm:text-4xl">{guide.title}</h1>
        <p className="mb-8 text-sm text-[#403d39]/80">
          By the {siteConfig.name} team · Updated{' '}
          <time dateTime={guide.updated}>{new Date(guide.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time> ·{' '}
          {guide.readMinutes} min read
        </p>
        <div className="prose-content text-lg">{guide.body}</div>

        <aside className="mt-12 rounded-2xl border border-[#eb5e28]/40 bg-[#eb5e28]/5 p-6">
          <h2 className="mb-2 text-xl font-semibold text-[#252422]">Put this into practice</h2>
          <p className="mb-4 text-[#403d39]">TOSPOS is a free browser-based POS with inventory alerts, tax, receipts and sales reports.</p>
          <Link href="/dashboard" className="inline-block rounded-lg bg-[#eb5e28] px-5 py-2.5 font-semibold text-white hover:bg-[#d94a1f]">
            Open the POS free
          </Link>
        </aside>
      </article>

      <section className="mx-auto mt-16 max-w-5xl">
        <h2 className="mb-6 text-2xl font-bold text-[#252422]">More guides</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {others.map(g => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-xl border border-[#ccc5b9]/50 bg-white/60 p-5 transition hover:border-[#eb5e28]/50">
              <h3 className="mb-2 font-semibold text-[#252422]">{g.title}</h3>
              <p className="text-sm text-[#403d39]">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
