import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, ogImages } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms that apply when you use the ${siteConfig.name} website and point of sale application.`,
  alternates: { canonical: '/terms' },
  openGraph: { url: '/terms', title: `${siteConfig.name} Terms of Service`, images: ogImages },
};

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-4xl font-bold text-[#252422]">Terms of Service</h1>
      <p className="mb-10 text-sm text-[#403d39]">Last updated: November 21, 2026</p>
      <div className="prose-content">
        <p>
          By accessing {siteConfig.url} (the “Site”) or using the {siteConfig.name} point of sale application (the “App”), you agree to these
          terms. If you do not agree, please do not use the Site or App.
        </p>

        <h2>1. The service</h2>
        <p>
          {siteConfig.name} provides a free, browser-based tool for recording sales, payments, inventory and customers. The App does not process
          card payments or move money; it records transactions you complete by other means.
        </p>

        <h2>2. Your data and backups</h2>
        <p>
          All data you enter in the App is stored locally in your browser on your device. We do not host, back up or have access to it. You are
          solely responsible for keeping backups (available under Settings → Backup &amp; restore). Data may be lost if you clear your browser
          data, use private browsing, change devices, or if your browser or device fails.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You agree not to use the Site or App:</p>
        <ul>
          <li>for any unlawful purpose or to record unlawful transactions;</li>
          <li>to attempt to disrupt, overload or gain unauthorised access to the Site;</li>
          <li>in a way that infringes the rights of others.</li>
        </ul>

        <h2>4. Tax and accounting</h2>
        <p>
          The App performs calculations based on the settings you choose, such as tax rates and discounts. You are responsible for configuring
          it correctly and for meeting your own tax, accounting and record-keeping obligations. Content in our guides is general information,
          not legal, tax or financial advice.
        </p>

        <h2>5. Advertising</h2>
        <p>
          The Site may display third-party advertisements. We are not responsible for the content of third-party ads or websites they link to.
          See our <Link href="/privacy">Privacy Policy</Link> for how advertising cookies are used.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          The Site, App, design and content are owned by {siteConfig.name} and protected by intellectual property laws. You may use the App for
          your business, but you may not copy, resell or redistribute it without permission.
        </p>

        <h2>7. Disclaimer</h2>
        <p>
          The Site and App are provided “as is” and “as available”, without warranties of any kind, express or implied, including fitness for a
          particular purpose, accuracy, or uninterrupted availability.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} will not be liable for any indirect, incidental or consequential damages, or
          for any loss of data, revenue or profits, arising from your use of or inability to use the Site or App.
        </p>

        <h2>9. Changes</h2>
        <p>We may update these terms. Continued use after changes are posted means you accept the updated terms.</p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
