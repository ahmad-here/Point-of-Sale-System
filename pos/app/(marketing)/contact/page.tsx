import type { Metadata } from 'next';
import { Mail, Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import ContactForm from './contact-form';
import { siteConfig, ogImages } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Questions, feedback or a bug to report? Contact the ${siteConfig.name} team.`,
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', title: `Contact ${siteConfig.name}`, images: ogImages },
};

export default function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-bold text-[#252422]">Contact us</h1>
      <p className="mb-12 max-w-2xl text-lg text-[#403d39]">
        We read every message. For help using the POS, check the <Link href="/#faq" className="text-[#c43d19] underline">FAQ</Link> first —
        your answer may already be there.
      </p>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_300px]">
        <ContactForm email={siteConfig.contactEmail} />
        <aside className="space-y-6">
          <div className="flex gap-3">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-[#eb5e28]" aria-hidden />
            <div>
              <h2 className="font-semibold text-[#252422]">Email</h2>
              <a href={`mailto:${siteConfig.contactEmail}`} className="break-all text-[#403d39] hover:text-[#c43d19]">
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-1 h-5 w-5 shrink-0 text-[#eb5e28]" aria-hidden />
            <div>
              <h2 className="font-semibold text-[#252422]">Response time</h2>
              <p className="text-[#403d39]">We aim to reply within two business days.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#eb5e28]" aria-hidden />
            <div>
              <h2 className="font-semibold text-[#252422]">About your data</h2>
              <p className="text-[#403d39]">
                Your POS data is stored only in your browser, so we cannot see or recover it. Please keep regular backups.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
