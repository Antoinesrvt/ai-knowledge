import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { CentralSearchBar } from '@/components/central-search-bar';
import { DashboardContent } from '@/components/dashboard-content';
import { canAccessDashboard, isGuestUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  
  // Block unauthenticated users
  if (!session?.user) {
    redirect('/login');
  }
  
  // Block guest users from dashboard
  if (!(await canAccessDashboard())) {
    redirect('/login');
  }

  // Data fetching is now handled by DashboardContent component
  // to support organization/team context switching

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <DashboardHeader user={session.user} />

      <main className="container mx-auto space-y-8 px-4 py-6">


        {/* Main Dashboard Content with Context Support */}
        <Suspense fallback={<div className="flex items-center justify-center py-12">Loading dashboard...</div>}>
          <DashboardContent userId={session.user.id} />
        </Suspense>
      </main>
    </div>
  );
}