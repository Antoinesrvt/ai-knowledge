import { auth } from '@/app/(auth)/auth'
import { getUserChatsAction } from '@/app/actions/chat'
import { Chat } from '@/lib/db/schema'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect to dashboard as the main page is now dashboard-centric
  redirect('/dashboard');
}
