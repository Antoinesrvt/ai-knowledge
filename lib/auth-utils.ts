import { stackServerApp } from '../stack';
import { guestRegex } from './constants';

export type UserType = 'unauthenticated' | 'guest' | 'regular';

export async function getUserType(headers?: Headers) {
  const user = await stackServerApp.getUser();
  if (!user?.primaryEmail) return 'unauthenticated';
  return guestRegex.test(user.primaryEmail) ? 'guest' : 'regular';
}

export async function canAccessDashboard(headers?: Headers) {
  const userType = await getUserType(headers);
  return userType === 'regular';
}

export async function canCreateContent(headers?: Headers) {
  const userType = await getUserType(headers);
  return userType === 'regular';
}

export async function canAccessPublicContent() {
  return true; // Public content is accessible to everyone
}

export async function isGuestUser(headers?: Headers) {
  const userType = await getUserType(headers);
  return userType === 'guest';
}

export async function isAuthenticated(headers?: Headers) {
  const userType = await getUserType(headers);
  return userType !== 'unauthenticated';
}

export async function getCurrentUser(headers?: Headers) {
  return await stackServerApp.getUser();
}

export async function getCurrentUserWithOrganization(headers?: Headers) {
  const user = await stackServerApp.getUser();
  if (!user) return null;
  
  // Get user's current team/organization from Stack Auth
  const teams = await stackServerApp.listTeams();
  const currentTeam = teams?.[0]; // For now, use the first team
  
  return {
    user,
    currentTeam,
    teams,
  };
}

/**
 * Checks if user can edit specific content
 */
export async function canEditContent(
  contentUserId: string,
  organizationId?: string,
  teamId?: string,
  headers?: Headers
): Promise<boolean> {
  const user = await stackServerApp.getUser();
  if (!user) return false;
  
  // Owner can always edit
  if (user.id === contentUserId) return true;
  
  // Check organization/team permissions
  if (organizationId || teamId) {
    const userWithOrg = await getCurrentUserWithOrganization(headers);
    if (!userWithOrg) return false;
    
    // For now, team members can edit team content
    // This can be expanded with more granular permissions
    return true;
  }
  
  return false;
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
      return '/auth/signin';
  }
}

/**
 * Checks if content is publicly accessible
 */
export function isPublicContent(visibility: 'public' | 'private' | 'organization' | 'team'): boolean {
  return visibility === 'public';
}

/**
 * Determines if user can access specific content
 */
export async function canAccessContent(
  contentVisibility: 'public' | 'private' | 'organization' | 'team',
  contentUserId: string,
  organizationId?: string,
  teamId?: string,
  headers?: Headers
): Promise<boolean> {
  // Public content is accessible to everyone
  if (contentVisibility === 'public') {
    return true;
  }
  
  const user = await stackServerApp.getUser();
  if (!user) return false;
  
  // Owner can always access their content
  if (user.id === contentUserId) return true;
  
  // Organization content requires organization membership
  if (contentVisibility === 'organization' && organizationId) {
    const userWithOrg = await getCurrentUserWithOrganization(headers);
    return userWithOrg?.currentTeam?.id === organizationId;
  }
  
  // Team content requires team membership
  if (contentVisibility === 'team' && teamId) {
    const userWithOrg = await getCurrentUserWithOrganization(headers);
    return userWithOrg?.teams?.some(team => team.id === teamId) ?? false;
  }
  
  // Private content requires ownership (already checked above)
  return false;
}

/**
 * Check if user has specific role in organization
 */
export async function hasOrganizationRole(
  organizationId: string,
  role: 'owner' | 'admin' | 'member' | 'viewer',
  headers?: Headers
): Promise<boolean> {
  const user = await stackServerApp.getUser();
  if (!user) return false;
  
  // This would need to be implemented with your database queries
  // For now, return true for any authenticated user
  return true;
}

/**
 * Check if user can invite members to organization
 */
export async function canInviteMembers(
  organizationId: string,
  headers?: Headers
): Promise<boolean> {
  return await hasOrganizationRole(organizationId, 'admin', headers) ||
         await hasOrganizationRole(organizationId, 'owner', headers);
}