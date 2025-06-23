import { db } from '@/lib/db/client';
import { eq, and, or, asc, desc, inArray, gt, lt, gte, count, type SQL } from 'drizzle-orm';
import { generateUUID } from '@/lib/utils'
import { chat as chatTable, message as messageTable, vote, stream, organizationMember, teamMember } from '../schema';
import type { Chat } from '../schema';
import { ChatSDKError } from '../../errors';

// Chat Management Functions with Multi-tenant Support

// Get all chats for a user (legacy function for backward compatibility)
export async function getChats(userId: string) {
  try {
    return await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.userId, userId))
      .orderBy(desc(chatTable.updatedAt));
  } catch (error) {
    console.error('Database error in getChats:', {
      userId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to get chats: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Get chats by user ID with pagination (legacy function for backward compatibility)
export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chatTable)
        .where(
          whereCondition
            ? and(whereCondition, eq(chatTable.userId, id))
            : eq(chatTable.userId, id),
        )
        .orderBy(desc(chatTable.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chatTable)
        .where(eq(chatTable.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chatTable.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chatTable)
        .where(eq(chatTable.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chatTable.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error('Database error in getChatsByUserId:', {
      userId: id,
      limit,
      startingAfter,
      endingBefore,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to get chats by user id: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Get chats for a specific user (personal chats)
export async function getChatsForUser(userId: string) {
  return await db
    .select()
    .from(chatTable)
    .where(
      and(
        eq(chatTable.userId, userId),
        eq(chatTable.visibility, 'private')
      )
    )
    .orderBy(desc(chatTable.createdAt));
}

// Get chats for an organization
export async function getChatsByOrganization(organizationId: string, userId?: string) {
  return await db
    .select()
    .from(chatTable)
    .where(
      and(
        eq(chatTable.organizationId, organizationId),
        or(
          eq(chatTable.visibility, 'organization'),
          eq(chatTable.visibility, 'public')
        )
      )
    )
    .orderBy(desc(chatTable.createdAt));
}

// Get chats for a specific team
export async function getChatsByTeam(teamId: string, userId?: string) {
  return await db
    .select()
    .from(chatTable)
    .where(
      and(
        eq(chatTable.teamId, teamId),
        or(
          eq(chatTable.visibility, 'team'),
          eq(chatTable.visibility, 'organization'),
          eq(chatTable.visibility, 'public')
        )
      )
    )
    .orderBy(desc(chatTable.createdAt));
}

// Get all accessible chats for a user (considering their organization and team memberships)
export async function getAccessibleChats(userId: string) {
  // Get user's organizations and teams
  const userOrgs = await db
    .select({ organizationId: organizationMember.organizationId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, userId));

  const userTeams = await db
    .select({ teamId: teamMember.teamId })
    .from(teamMember)
    .where(eq(teamMember.userId, userId));

  const orgIds = userOrgs.map(org => org.organizationId);
  const teamIds = userTeams.map(team => team.teamId);

  // Build conditions for accessible chats
  const conditions = [
    eq(chatTable.visibility, 'public'), // Public chats
    and(
      eq(chatTable.userId, userId),
      eq(chatTable.visibility, 'private')
    ), // User's private chats
  ];

  if (orgIds.length > 0) {
    conditions.push(
      and(
        inArray(chatTable.organizationId, orgIds),
        eq(chatTable.visibility, 'organization')
      )
    );
  }

  if (teamIds.length > 0) {
    conditions.push(
      and(
        inArray(chatTable.teamId, teamIds),
        eq(chatTable.visibility, 'team')
      )
    );
  }

  return await db
    .select()
    .from(chatTable)
    .where(or(...conditions))
    .orderBy(desc(chatTable.createdAt));
}

export async function createChat(
  title: string,
  userId: string,
  visibility: 'public' | 'private' | 'organization' | 'team' = 'private',
  organizationId?: string,
  teamId?: string
): Promise<Chat> {
  try {
    const chatId = generateUUID();
    const now = new Date();

    const [newChat] = await db
      .insert(chatTable)
      .values({
        id: chatId,
        title,
        userId,
        visibility,
        organizationId,
        teamId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return newChat;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create chat',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
  organizationId,
  teamId,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: 'public' | 'private' | 'organization' | 'team';
  organizationId?: string;
  teamId?: string;
}) {
  try {
    return await db.insert(chatTable).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
      organizationId,
      teamId,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

// Get chat by ID with access check
export async function getChatById({ id, userId }: { id: string; userId?: string }) {
  const chat = await db
    .select()
    .from(chatTable)
    .where(eq(chatTable.id, id))
    .then((rows) => rows[0]);

  if (!chat) {
    return null;
  }

  // Check access permissions
  if (chat.visibility === 'public') {
    return chat;
  }

  if (!userId) {
    return null; // No user, can only access public chats
  }

  if (chat.userId === userId) {
    return chat; // Owner can always access
  }

  // Check organization access
  if (chat.visibility === 'organization' && chat.organizationId) {
    const isMember = await db
      .select()
      .from(organizationMember)
      .where(
        and(
          eq(organizationMember.organizationId, chat.organizationId),
          eq(organizationMember.userId, userId)
        )
      )
      .then((rows) => rows.length > 0);

    if (isMember) {
      return chat;
    }
  }

  // Check team access
  if (chat.visibility === 'team' && chat.teamId) {
    const isMember = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, chat.teamId),
          eq(teamMember.userId, userId)
        )
      )
      .then((rows) => rows.length > 0);

    if (isMember) {
      return chat;
    }
  }

  return null; // No access
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Note: These imports need to be added to the top of the file
    // await db.delete(vote).where(eq(vote.chatId, id));
    // await db.delete(message).where(eq(message.chatId, id));
    // await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chatTable)
      .where(eq(chatTable.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

// Get messages for a chat
export async function getMessagesByChatId({ id, userId }: { id: string; userId?: string }) {
  // First check if user has access to the chat
  const chat = await getChatById({ id, userId });
  if (!chat) {
    return [];
  }

  return await db
    .select()
    .from(messageTable)
    .where(eq(messageTable.chatId, id))
    .orderBy(asc(messageTable.createdAt));
}

// Save messages - updated to match schema
export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id?: string;
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    parts: any[];
    attachments: any[];
    createdAt?: Date;
  }>;
}) {
  try {
    const messagesToInsert = messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt || new Date(),
    }));
    return await db.insert(messageTable).values(messagesToInsert).returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

// Get public chats
export async function getPublicChats(limit: number = 50) {
  return await db
    .select()
    .from(chatTable)
    .where(eq(chatTable.visibility, 'public'))
    .orderBy(desc(chatTable.createdAt))
    .limit(limit);
}

// Search chats within user's accessible scope
export async function searchChats(
  query: string,
  userId: string,
  organizationId?: string,
  teamId?: string
) {
  // This is a simplified search - in production you'd want to use full-text search
  const accessibleChats = await getAccessibleChats(userId);
  
  return accessibleChats.filter(chat => 
    chat.title.toLowerCase().includes(query.toLowerCase())
  );
}

// Get recent chat activity for dashboard
export async function getRecentChatActivity(userId: string, limit: number = 10) {
  const accessibleChats = await getAccessibleChats(userId);
  
  return accessibleChats
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

// Update chat visibility by ID
export async function updateChatVisiblityById(
  chatId: string,
  visibility: 'public' | 'private' | 'organization' | 'team',
  userId: string
) {
  try {
    const [updatedChat] = await db
      .update(chatTable)
      .set({ 
        visibility
      })
      .where(
        and(
          eq(chatTable.id, chatId),
          eq(chatTable.userId, userId)
        )
      )
      .returning();

    if (!updatedChat) {
      throw new ChatSDKError(
        'bad_request:chat',
        'Chat not found or you do not have permission to update it'
      );
    }

    return updatedChat;
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility'
    );
  }
}

// Message-related functions (consolidated from message.ts)

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(messageTable).where(eq(messageTable.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: messageTable.id })
      .from(messageTable)
      .where(
        and(eq(messageTable.chatId, chatId), gte(messageTable.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(messageTable)
        .where(
          and(eq(messageTable.chatId, chatId), inArray(messageTable.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function getMessagesByUserId({ userId }: { userId: string }) {
  try {
    // Join with chat table to get messages by user
    const result = await db
      .select({
        id: messageTable.id,
        chatId: messageTable.chatId,
        role: messageTable.role,
        parts: messageTable.parts,
        attachments: messageTable.attachments,
        createdAt: messageTable.createdAt,
      })
      .from(messageTable)
      .innerJoin(chatTable, eq(messageTable.chatId, chatTable.id))
      .where(eq(chatTable.userId, userId))
      .orderBy(desc(messageTable.createdAt));

    return result;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by user id',
    );
  }
}

export async function getMessageCount({ userId }: { userId: string }) {
  try {
    // Join with chat table to get messages by user
    const result = await db
      .select({ count: count() })
      .from(messageTable)
      .innerJoin(chatTable, eq(messageTable.chatId, chatTable.id))
      .where(eq(chatTable.userId, userId));

    return result.length > 0 ? Number(result[0].count) : 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  chatId,
}: {
  chatId: string;
}) {
  try {
    const streamId = generateUUID();
    const [streamResult] = await db.insert(stream).values({
      id: streamId,
      chatId,
      createdAt: new Date(),
    }).returning();
    return streamResult;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    return await db
      .select()
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}