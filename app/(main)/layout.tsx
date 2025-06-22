import { Suspense } from 'react';
import { OrganizationProvider } from '@/lib/contexts/organization-context';

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrganizationProvider>
        {children}
      </OrganizationProvider>
    </Suspense>
  );
}