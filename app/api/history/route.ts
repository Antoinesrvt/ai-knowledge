import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getChatsForUser,
  getChatsByOrganization,
  getChatsByTeam
} from '@/lib/db/queries';
import type { ChatHistory } from '@/components/sidebar-history';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const teamId = searchParams.get('teamId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const endingBefore = searchParams.get('ending_before');

    let chats;

    if (organizationId && teamId) {
      // Get chats for specific team
      chats = await getChatsByTeam(teamId);
    } else if (organizationId) {
      // Get chats for organization
      chats = await getChatsByOrganization(organizationId);
    } else {
      // Get personal chats (no organization/team context)
      chats = await getChatsForUser(user.id);
    }

    // Apply pagination manually since the functions don't support it yet
    let filteredChats = chats;
    if (endingBefore) {
      const endingBeforeDate = new Date(endingBefore);
      filteredChats = chats.filter(chat => 
        new Date(chat.updatedAt) < endingBeforeDate
      );
    }

    // Limit results
    const paginatedChats = filteredChats.slice(0, limit);
    const hasMore = filteredChats.length > limit;

    const response: ChatHistory = {
      chats: paginatedChats,
      hasMore
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}