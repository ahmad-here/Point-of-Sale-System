import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, ogImages } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About TOSPOS',
  description: 'Why we built TOSPOS: a free, private, browser-based point of sale for independent shops, cafés and market traders.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title: 'About TOSPOS', images: ogImages },
};

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-4xl font-bold text-[#252422]">About {siteConfig.name}</h1>
      <div className="prose-content text-lg">
        <p>
          {siteConfig.name} is a free point of sale system that runs entirely in your web browser. We built it for the independent
          businesses that big POS vendors overlook: the corner shop, the weekend market stall, the small café and the one-person boutique.
        </p>
        <h2>Why it exists</h2>
        <p>
          Many small sellers still use a notebook and a calculator because commercial POS software comes with monthly fees, contracts,
          proprietary hardware and per-transaction charges. Those costs make sense for large retailers, but not for a business making a few
          dozen sales a day. We wanted a tool that gives small sellers proper sales records, receipts, stock alerts and reports — at no cost.
        </p>
        <h2>How it works</h2>
        <p>
          Instead of storing your data on our servers, {siteConfig.name} keeps it in your own browser’s storage on your device. That means
          there is no account to create, nothing for us to bill you for, and no business data of yours on our systems. It also means you are
          in control of backups: you can download a complete backup file at any time from Settings and restore it on another device.
        </p>
        <h2>What we believe</h2>
        <ul>
          <li>
            <strong>Your data is yours.</strong> Every record can be exported to CSV or JSON in one click.
          </li>
          <li>
            <strong>Simple beats complicated.</strong> A cashier should be able to learn the register in minutes.
          </li>
          <li>
            <strong>Honest numbers.</strong> Refunds reverse stock and money properly, and reports exclude them.
          </li>
        </ul>
        <h2>How we keep it free</h2>
        <p>
          The POS itself has no ads. Our public website pages (such as this page and our <Link href="/guides">guides</Link>) may display
          advertising, which covers hosting and development costs.
        </p>
        <h2>Get in touch</h2>
        <p>
          Feature requests, bug reports and feedback are welcome. <Link href="/contact">Contact us</Link> or email{' '}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
