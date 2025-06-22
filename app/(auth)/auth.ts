import { stackServerApp } from '@/stack';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserType } from '@/lib/auth-utils';
import { syncStackUser } from '@/lib/db/queries';
import type { UserType } from '@/lib/types';

export { type UserType };

export async function auth() {
  const stackUser = await stackServerApp.getUser();
  
  if (!stackUser) {
    return { user: null };
  }

  try {
    // Sync Stack Auth user to local database
    const localUser = await syncStackUser(stackUser);
    
    return {
      user: {
        id: localUser.id, // Use local database ID
        email: stackUser.primaryEmail,
        name: stackUser.displayName,
        image: stackUser.profileImageUrl,
        stackUserId: stackUser.id,
      },
    };
  } catch (error) {
    console.error('Failed to sync Stack user:', error);
    // Fallback to Stack user data if sync fails
    return {
      user: {
        id: stackUser.id,
        email: stackUser.primaryEmail,
        name: stackUser.displayName,
        image: stackUser.profileImageUrl,
        stackUserId: stackUser.id,
      },
    };
  }
}

export async function signIn(provider?: string, options?: { redirectTo?: string }) {
  // For Stack Auth, redirect to the sign-in page
  redirect('/auth/signin');
}

export async function signOut(options?: { redirectTo?: string }) {
  // For Stack Auth, we'll handle sign out on the client side
  redirect(options?.redirectTo || '/');
}

export async function requireAuth() {
  const session = await auth();
  if (!session.user) {
    redirect('/auth/signin');
  }
  return session;
}

export async function getUserTypeFromAuth(): Promise<UserType> {
  const headersList = await headers();
  return await getUserType(headersList);
}