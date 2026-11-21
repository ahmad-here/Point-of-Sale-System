import type { Metadata } from 'next';
import AppShell from '@/components/app-shell';

// The POS workspace stores data in the visitor's browser, so its screens have no
// public content. Keep them out of search results; the marketing pages are indexed.
export const metadata: Metadata = {
  title: 'POS Workspace',
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
