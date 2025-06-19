import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - AI Knowledge',
  description: 'Manage your AI-powered documents and conversations.',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col w-full">
      <div className="flex-1">{children}</div>
    </div>
  );
}