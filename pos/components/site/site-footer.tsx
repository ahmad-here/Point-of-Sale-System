import Link from 'next/link';
import { siteConfig } from '@/lib/site';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/dashboard', label: 'Open the POS' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/guides', label: 'Guides' },
      { href: '/guides/how-to-choose-a-pos-system', label: 'Choosing a POS' },
      { href: '/guides/inventory-management-basics', label: 'Inventory basics' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#ccc5b9]/40 bg-[#fffcf2] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map(c => (
            <div key={c.title}>
              <h2 className="mb-4 font-semibold text-[#252422]">{c.title}</h2>
              <ul className="space-y-2 text-[#403d39]">
                {c.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition hover:text-[#eb5e28]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#ccc5b9]/40 pt-8 text-sm text-[#403d39] md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-[#eb5e28]">
            {siteConfig.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
