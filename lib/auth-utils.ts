import type { Session } from 'next-auth';
import { guestRegex } from './constants';

export type UserType = 'unauthenticated' | 'guest' | 'regular';

/**
 * Determines the user type based on session
 */
export function getUserType(session: Session | null): UserType {
  if (!session?.user) return 'unauthenticated';
  
  const isGuest = guestRegex.test(session.user.email ?? '');
  return isGuest ? 'guest' : 'regular';
}

/**
 * Checks if user can access the dashboard
 */
export function canAccessDashboard(session: Session | null): boolean {
  const userType = getUserType(session);
  return userType === 'regular';
}

/**
 * Checks if user can create content (documents/chats)
 */
export function canCreateContent(session: Session | null): boolean {
  const userType = getUserType(session);
  return userType === 'regular';
}

/**
 * Checks if user can access public content without authentication
 */
export function canAccessPublicContent(): boolean {
  return true; // Public content is always accessible
}

/**
 * Checks if user is a guest user
 */
export function isGuestUser(session: Session | null): boolean {
  const userType = getUserType(session);
  return userType === 'guest';
}

/**
 * Checks if user is authenticated (guest or regular)
 */
export function isAuthenticated(session: Session | null): boolean {
  const userType = getUserType(session);
  return userType !== 'unauthenticated';
}

/**
 * Checks if user can edit specific content
 */
export function canEditContent(session: Session | null, contentUserId: string): boolean {
  if (!session?.user) return false;
  return session.user.id === contentUserId;
}

/**
 * Gets appropriate redirect URL based on user type
 */
export function getRedirectUrl(userType: UserType): string {
  switch (userType) {
    case 'regular':
      return '/dashboard';
    case 'guest':
    case 'unauthenticated':
    default:
      return '/login';
  }
}

/**
 * Checks if content is publicly accessible
 */
export function isPublicContent(visibility: 'public' | 'private'): boolean {
  return visibility === 'public';
}

/**
 * Determines if user can access specific content
 */
export function canAccessContent(
  session: Session | null,
  contentVisibility: 'public' | 'private',
  contentUserId: string
): boolean {
  // Public content is accessible to everyone
  if (contentVisibility === 'public') {
    return true;
  }
  
  // Private content requires authentication and ownership
  if (!session?.user) {
    return false;
  }
  
  return session.user.id === contentUserId;
}