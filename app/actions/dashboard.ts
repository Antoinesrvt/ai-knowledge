'use server';

import {
  getDocumentsForUser,
  getChatsForUser,
  getDocumentsByOrganization,
  getChatsByOrganization,
  getDocumentsByTeam,
  getChatsByTeam
} from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import type { Document, Chat } from '@/lib/db/schema';

export interface DashboardData {
  documents: Document[];
  chats: Chat[];
}

export async function getDashboardData(
  userId: string,
  contextType: 'personal' | 'organization' | 'team',
  organizationId?: string,
  teamId?: string
): Promise<DashboardData> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  // Only allow users to fetch their own data
  if (userId !== session.user.id) {
    throw new Error('Unauthorized to access other user data');
  }
  try {
    let documentsData: Document[] = [];
    let chatsData: Chat[] = [];

    if (contextType === 'personal') {
      // Personal context - fetch user's personal documents and chats
      [documentsData, chatsData] = await Promise.all([
        getDocumentsForUser(userId),
        getChatsForUser(userId)
      ]);
    } else if (contextType === 'team' && teamId && organizationId) {
      // Team context - fetch team-specific data
      [documentsData, chatsData] = await Promise.all([
        getDocumentsByTeam(teamId),
        getChatsByTeam(teamId)
      ]);
    } else if (contextType === 'organization' && organizationId) {
      // Organization context - fetch organization-wide data
      [documentsData, chatsData] = await Promise.all([
        getDocumentsByOrganization(organizationId),
        getChatsByOrganization(organizationId)
      ]);
    }

    return {
      documents: documentsData,
      chats: chatsData
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw new Error('Failed to load dashboard data');
  }
}