import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, ogImages } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} handles your information, cookies and advertising.`,
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', title: `${siteConfig.name} Privacy Policy`, images: ogImages },
};

const UPDATED = 'November 21, 2026';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-4xl font-bold text-[#252422]">Privacy Policy</h1>
      <p className="mb-10 text-sm text-[#403d39]">Last updated: {UPDATED}</p>
      <div className="prose-content">
        <p>
          This policy explains what information {siteConfig.name} (“we”, “us”) collects when you visit {siteConfig.url} (the “Site”) and use
          the {siteConfig.name} point of sale application (the “App”), and how that information is used.
        </p>

        <h2>1. Your business data stays on your device</h2>
        <p>
          Products, categories, sales, payments, customer records and settings you enter in the App are stored in your web browser’s local
          storage on your own device. This data is <strong>not transmitted to or stored on our servers</strong>, and we cannot access, view or
          recover it. You can export or delete it at any time from Settings in the App. Clearing your browser data will permanently remove it,
          so keep regular backups.
        </p>
        <p>
          If you record personal information about your own customers (such as names, phone numbers or email addresses) in the App, you are
          responsible for handling that information in line with the privacy laws that apply to your business.
        </p>

        <h2>2. Information collected automatically</h2>
        <p>
          Like most websites, our hosting provider automatically records standard technical information when you load a page, such as your IP
          address, browser type, referring page, and the date and time of the request. This is used to operate, secure and troubleshoot the
          Site.
        </p>
        <p>
          We may use Google Analytics to understand how visitors use the Site (for example, which pages are viewed). Google Analytics uses
          cookies and collects information such as pages visited and approximate location. You can opt out using the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">Google Analytics opt-out browser add-on</a>.
        </p>

        <h2>3. Advertising</h2>
        <p>
          The public pages of the Site may show advertisements served by Google AdSense. The App’s working screens do not display ads.
        </p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this Site or other websites.</li>
          <li>
            Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this Site and/or other
            sites on the Internet.
          </li>
          <li>
            You may opt out of personalised advertising by visiting{' '}
            <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>. You can also opt out
            of some third-party vendors’ use of cookies for personalised advertising at{' '}
            <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">www.aboutads.info</a>.
          </li>
          <li>
            Learn more about how Google uses information from sites that use its services at{' '}
            <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">
              policies.google.com/technologies/partner-sites
            </a>
            .
          </li>
        </ul>
        <p>
          Visitors in the European Economic Area, the United Kingdom and Switzerland will be asked for consent before personalised ads or
          non-essential cookies are used, through a consent message provided by Google’s certified consent management platform.
        </p>

        <h2>4. Cookies and local storage</h2>
        <p>We and our partners use:</p>
        <ul>
          <li>
            <strong>Local storage</strong> — essential for the App to save your business data on your device.
          </li>
          <li>
            <strong>Session storage</strong> — keeps the current bill if you refresh the register.
          </li>
          <li>
            <strong>Analytics and advertising cookies</strong> — set by Google as described above.
          </li>
        </ul>
        <p>You can block or delete cookies in your browser settings. Blocking local storage will prevent the App from working.</p>

        <h2>5. Emails you send us</h2>
        <p>
          If you contact us by email, we use your email address and message only to respond to you. We do not sell or share it with third
          parties for marketing.
        </p>

        <h2>6. Your rights</h2>
        <p>
          Depending on where you live (for example under the GDPR or the California Consumer Privacy Act), you may have rights to access,
          correct or delete personal information we hold about you, and to object to certain processing. Because App data is held only on your
          device, you can exercise these rights over it directly. For any other request, <Link href="/contact">contact us</Link>.
        </p>

        <h2>7. Children</h2>
        <p>The Site and App are intended for businesses and are not directed at children under 13. We do not knowingly collect their information.</p>

        <h2>8. Changes to this policy</h2>
        <p>We may update this policy from time to time. The “Last updated” date above shows when it last changed.</p>

        <h2>9. Contact</h2>
        <p>
          Questions about this policy: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
