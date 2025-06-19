import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { RecentActivity } from '@/components/recent-activity';
import { NotificationCenter } from '@/components/notification-center';
import { CentralSearchBar } from '@/components/central-search-bar';
import { getDocuments, getChats } from '@/lib/db/queries';
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
  if (!canAccessDashboard(session)) {
    redirect('/login');
  }

  const [documents, chats] = await Promise.all([
    getDocuments(session.user.id),
    getChats(session.user.id)
  ]);

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <DashboardHeader user={session.user} />

      <main className="container mx-auto space-y-8 px-4 py-6">
        {/* Central Search and Quick Actions */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Suspense fallback={<div>Loading search...</div>}>
              <CentralSearchBar />
            </Suspense>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Left Column */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading recent activity...</div>}>
              <RecentActivity
                documents={documents.slice(0, 8)}
                chats={chats.slice(0, 8)}
              />
            </Suspense>
          </div>

          {/* Notifications - Right Column */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading notifications...</div>}>
              <NotificationCenter
                documentsCount={documents.length}
                chatsCount={chats.length}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}