import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl font-bold text-[#eb5e28]">404</p>
      <h1 className="mb-3 text-2xl font-bold text-[#252422]">We couldn’t find that page</h1>
      <p className="mb-8 max-w-md text-[#403d39]">The link may be broken or the page may have moved.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="rounded-lg bg-[#eb5e28] px-5 py-2.5 font-semibold text-white hover:bg-[#d94a1f]">
          Go to homepage
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-[#ccc5b9] px-5 py-2.5 font-semibold text-[#252422] hover:bg-[#ccc5b9]/20">
          Open the POS
        </Link>
      </div>
    </div>
  );
}
