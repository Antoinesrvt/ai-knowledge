import { cookies, headers } from 'next/headers';
import { auth } from '../(auth)/auth';
import Script from 'next/script';
import { Suspense } from 'react';
import { OrganizationProvider } from '@/lib/contexts/organization-context';

export const experimental_ppr = true;

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

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore, headersList] = await Promise.all([auth(), cookies(), headers()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  
  // Check if we're on a workspace page to hide sidebar
  const pathname = headersList.get('x-pathname') || '';
  const isWorkspacePage = pathname.includes('/workspace') || pathname.includes('/document');

  // If it's a workspace page, render without sidebar
  if (isWorkspacePage) {
    return (
      <>
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
          strategy="beforeInteractive"
        />
        <Suspense fallback={<LoadingFallback />}>
          <OrganizationProvider>
            <div className="h-screen w-full bg-background">
              {children}
            </div>
          </OrganizationProvider>
        </Suspense>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <Suspense fallback={<LoadingFallback />}>
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
      </Suspense>
    </>
  );
}
