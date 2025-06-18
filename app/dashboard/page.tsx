import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { StatsOverview } from '@/components/stats-overview';
import { ContentTabs } from '@/components/content-tabs';
import { RecentActivity } from '@/components/recent-activity';
import { QuickActions } from '@/components/quick-actions';
import { getDocuments, getChats } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading stats...</div>}>
              <StatsOverview
                documentsCount={documents.length}
                chatsCount={chats.length}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading quick actions...</div>}>
              <QuickActions />
            </Suspense>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading content...</div>}>
              <ContentTabs
                documents={documents}
                chats={chats}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading activity...</div>}>
              <RecentActivity
                documents={documents.slice(0, 5)}
                chats={chats.slice(0, 5)}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}