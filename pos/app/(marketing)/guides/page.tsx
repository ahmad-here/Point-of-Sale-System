import type { Metadata } from 'next';
import { ogImages } from '@/lib/site';
import Link from 'next/link';
import { guides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'POS & Retail Guides for Small Business Owners',
  description:
    'Practical guides on choosing a POS system, inventory management, sales tax at checkout and closing the cash register — written for small shop owners.',
  alternates: { canonical: '/guides' },
  openGraph: { url: '/guides', title: 'POS & Retail Guides for Small Business Owners', images: ogImages },
};

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-bold text-[#252422]">Guides</h1>
      <p className="mb-12 max-w-2xl text-lg text-[#403d39]">
        Straightforward advice on running the counter, managing stock and keeping your numbers right.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {guides.map(g => (
          <article key={g.slug} className="rounded-xl border border-[#ccc5b9]/50 bg-white/60 p-6 transition hover:border-[#eb5e28]/50 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold text-[#252422]">
              <Link href={`/guides/${g.slug}`} className="hover:text-[#c43d19]">
                {g.title}
              </Link>
            </h2>
            <p className="mb-4 text-[#403d39]">{g.description}</p>
            <p className="text-sm text-[#403d39]/70">
              <time dateTime={g.updated}>{new Date(g.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time> · {g.readMinutes} min read
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
