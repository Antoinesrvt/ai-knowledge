import { cookies, headers } from 'next/headers';

import { auth } from '../(auth)/auth';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore, headersList] = await Promise.all([auth(), cookies(), headers()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  
  // Check if we're on a document page to hide sidebar
  const pathname = headersList.get('x-pathname') || '';
  const isDocumentPage = pathname.includes('/document');

  // If it's a document page, render without sidebar
  if (isDocumentPage) {
    return (
      <>
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
          strategy="beforeInteractive"
        />
        <div className="h-screen w-full bg-background">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
  
        {children}
    </>
  );
}
