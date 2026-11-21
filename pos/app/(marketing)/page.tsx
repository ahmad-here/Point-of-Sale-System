import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  ShieldCheck,
  ScanLine,
  Download,
  Smartphone,
  Check,
  ArrowRight,
} from 'lucide-react';
import JsonLd from '@/components/site/json-ld';
import { siteConfig } from '@/lib/site';
import { guides } from '@/lib/guides';

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

const features = [
  {
    icon: ShoppingCart,
    title: 'Fast checkout register',
    description:
      'Tap products or scan a barcode to build the bill, apply discounts and tax automatically, take cash with change calculation, card, wallet, bank transfer or check.',
  },
  {
    icon: Receipt,
    title: 'Printable receipts',
    description:
      'Every sale produces a clean receipt with your store name, address, tax breakdown and custom footer. Print it, or reprint any past order from sales history.',
  },
  {
    icon: Package,
    title: 'Inventory & stock alerts',
    description:
      'Stock is deducted on every sale and restored on refunds. Set a reorder level per product and get low-stock alerts before shelves run empty.',
  },
  {
    icon: ScanLine,
    title: 'Bulk CSV import',
    description:
      'Bring your catalogue over from a spreadsheet in seconds. Re-importing an existing SKU adds the delivered quantity to its stock.',
  },
  {
    icon: BarChart3,
    title: 'Sales analytics',
    description:
      'See revenue trends, average order value, best-selling products, revenue by category, refund rate and your busiest hours of the day.',
  },
  {
    icon: Users,
    title: 'Customer history',
    description:
      'Add a name or phone at checkout to build a customer list with order counts, lifetime spend and full purchase history.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description:
      'Your business data is stored in your own browser, not on our servers. No account, no sign-up, nothing to leak.',
  },
  {
    icon: Download,
    title: 'Backup & export',
    description:
      'Download a full JSON backup any time, restore it on another device, or export products, sales, payments and customers to CSV for your accountant.',
  },
  {
    icon: Smartphone,
    title: 'Works on any device',
    description:
      'Runs in any modern browser on a laptop, desktop, tablet or phone. No installation and no special hardware required.',
  },
];

const steps = [
  { title: 'Add your products', text: 'Enter items one by one or import a CSV with names, SKUs, prices and quantities.' },
  { title: 'Set up your store', text: 'Add your store name, currency, tax rate and receipt message in Settings.' },
  { title: 'Start selling', text: 'Ring up sales at the register, take payment and print a receipt. Inventory updates itself.' },
];

const audiences = ['Retail & convenience stores', 'Cafés, bakeries & food stalls', 'Boutiques & gift shops', 'Market traders & pop-ups', 'Salons & service counters', 'Pharmacies & hardware stores'];

const faqs = [
  {
    q: 'Is TOSPOS really free?',
    a: 'Yes. The POS runs entirely in your browser, so there are no servers to pay for on your behalf and no subscription. The public website is supported by advertising.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Open the POS and start adding products. There is no sign-up, password or email required.',
  },
  {
    q: 'Where is my data stored?',
    a: 'All products, sales, payments and customers are saved in your browser’s local storage on the device you use. We never receive or store your business data. Because of this, make regular backups from Settings → Backup & restore.',
  },
  {
    q: 'Can I use it on more than one device?',
    a: 'Each browser keeps its own data. To move to another device, download a backup on the first device and restore it on the second. Real-time multi-device sync is not available.',
  },
  {
    q: 'Does it work with a barcode scanner and receipt printer?',
    a: 'Yes. USB and Bluetooth barcode scanners that act as a keyboard work out of the box: scan into the register search box and the matching SKU is added. Receipts print through your browser to any printer your computer can use, including thermal receipt printers.',
  },
  {
    q: 'Does TOSPOS process card payments?',
    a: 'No. TOSPOS records how a customer paid (cash, card, wallet, transfer or check). Card payments are taken on your existing card terminal and then recorded in TOSPOS.',
  },
  {
    q: 'Can I charge sales tax or VAT?',
    a: 'Yes. Set a tax percentage in Settings and it is applied to every checkout and shown on receipts. Use 0% if your prices already include tax.',
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-[#fffcf2] via-[#ccc5b9]/20 to-[#fffcf2] text-[#252422]">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: siteConfig.name,
            url: siteConfig.url,
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Point of Sale',
            operatingSystem: 'Any (web browser)',
            description: siteConfig.description,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: features.map(f => f.title),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteConfig.name,
            url: siteConfig.url,
          },
        ]}
      />

      {/* Hero */}
      <section className="px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 inline-block rounded-full bg-[#eb5e28]/10 px-4 py-1 text-sm font-medium text-[#c43d19]">
            Free · No sign-up · Runs in your browser
          </p>
          <h1 className="mb-6 bg-gradient-to-r from-[#252422] via-[#403d39] to-[#eb5e28] bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl md:text-6xl">
            Free Online POS System for Small Businesses
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[#403d39] sm:text-xl">
            Ring up sales, print receipts, track inventory and see what’s selling — all from your web browser. No installation,
            no subscription, and your data stays on your device.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#eb5e28] to-[#d94a1f] px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl">
              Open the POS free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center rounded-lg border border-[#ccc5b9] bg-[#403d39] px-6 py-3 text-lg font-semibold text-[#fffcf2] transition hover:bg-[#252422]">
              See features
            </Link>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section aria-label="Key facts" className="border-y border-[#ccc5b9]/40 px-4 py-12 sm:px-6 lg:px-8">
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            ['$0', 'Free to use'],
            ['0 min', 'Setup — no account needed'],
            ['5', 'Payment methods recorded'],
            ['100%', 'Data kept on your device'],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd className="mb-1 text-3xl font-bold text-[#eb5e28] sm:text-4xl">{v}</dd>
              <dd className="text-sm text-[#403d39]">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Everything a small shop needs at the counter</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#403d39]">
              A complete point of sale workflow — from stocking shelves to closing the day — without expensive hardware or monthly fees.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <article key={f.title} className="rounded-xl border border-[#ccc5b9]/40 bg-white/60 p-6 transition hover:border-[#eb5e28]/50 hover:shadow-lg">
                <div className="mb-4 w-fit rounded-lg bg-[#eb5e28]/15 p-3 text-[#eb5e28]">
                  <f.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-[#403d39]">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-[#ccc5b9]/40 bg-white/40 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">Start selling in three steps</h2>
          <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eb5e28] text-xl font-bold text-white">{i + 1}</span>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-[#403d39]">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14">
            <h3 className="mb-4 text-center text-xl font-semibold">Built for businesses like yours</h3>
            <ul className="flex flex-wrap justify-center gap-3">
              {audiences.map(a => (
                <li key={a} className="rounded-full border border-[#ccc5b9] bg-[#fffcf2] px-4 py-2 text-sm text-[#403d39]">{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Simple pricing: free</h2>
          <p className="mb-10 text-lg text-[#403d39]">No trials, tiers or transaction fees. Every feature is included.</p>
          <div className="rounded-2xl border-2 border-[#eb5e28] bg-white p-8 text-left shadow-xl">
            <div className="mb-6 flex items-end gap-2">
              <span className="text-5xl font-bold">$0</span>
              <span className="mb-2 text-[#403d39]">forever</span>
            </div>
            <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {['Unlimited products & sales', 'Receipts with your branding', 'Tax, discounts & change', 'Low-stock alerts', 'Sales analytics', 'Customer history', 'CSV import & export', 'Full JSON backups'].map(i => (
                <li key={i} className="flex items-center gap-2 text-[#403d39]">
                  <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden /> {i}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="block rounded-lg bg-gradient-to-r from-[#eb5e28] to-[#d94a1f] px-6 py-3 text-center text-lg font-semibold text-white shadow-lg transition hover:shadow-xl">
              Start selling now
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-[#ccc5b9]/40 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="group rounded-xl border border-[#ccc5b9]/50 bg-white/60 p-5 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="text-[#eb5e28] transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-[#403d39]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="border-t border-[#ccc5b9]/40 bg-white/40 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">Guides for shop owners</h2>
            <Link href="/guides" className="font-medium text-[#c43d19] hover:underline">All guides →</Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {guides.map(g => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-xl border border-[#ccc5b9]/40 bg-[#fffcf2] p-5 transition hover:border-[#eb5e28]/50 hover:shadow-lg">
                <h3 className="mb-2 font-semibold">{g.title}</h3>
                <p className="text-sm text-[#403d39]">{g.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#ccc5b9]/40 bg-gradient-to-r from-[#eb5e28]/10 to-[#d94a1f]/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to ring up your first sale?</h2>
          <p className="mb-8 text-lg text-[#403d39]">Open the register, add a few products and you’re selling in minutes.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#eb5e28] to-[#d94a1f] px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl">
            Launch TOSPOS <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
