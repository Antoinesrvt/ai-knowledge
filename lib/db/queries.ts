import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
  documentBranch,
  documentVersion,
  documentMerge,
  chatDocument,
  branchRequest,
  type DocumentBranch,
  type DocumentVersion,
  type DocumentMerge,
  type ChatDocument,
  type BranchRequest,
} from './schema';
import { pendingChange, type PendingChange } from './schema-pending-changes';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function updateDocument({
  id,
  createdAt,
  title,
  content,
  kind,
}: {
  id: string;
  createdAt: Date;
  title?: string;
  content?: string;
  kind?: 'text' | 'code' | 'image' | 'sheet';
}): Promise<Document> {
  try {
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (kind !== undefined) updateData.kind = kind;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(document)
      .set(updateData)
      .where(
        and(
          eq(document.id, id),
          eq(document.createdAt, createdAt)
        )
      )
      .returning();

    return updated;
  } catch (error) {
    console.error('Error updating document:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update document',
    );
  }
}

export async function getDocumentBranchById({
  branchId,
}: {
  branchId: string;
}): Promise<DocumentBranch | null> {
  try {
    const [branch] = await db
      .select()
      .from(documentBranch)
      .where(eq(documentBranch.id, branchId))
      .limit(1);

    return branch || null;
  } catch (error) {
    console.error('Error getting document branch by id:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document branch',
    );
  }
}

export async function getBranchRequests({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<BranchRequest[]> {
  try {
    return await db
      .select()
      .from(branchRequest)
      .where(
        and(
          eq(branchRequest.documentId, documentId),
          eq(branchRequest.documentCreatedAt, documentCreatedAt),
        ),
      )
      .orderBy(desc(branchRequest.createdAt));
  } catch (error) {
    console.error('Error getting branch requests:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get branch requests',
    );
  }
}

export async function updateBranchRequest({
  requestId,
  status,
  finalName,
}: {
  requestId: string;
  status: 'approved' | 'rejected';
  finalName?: string;
}): Promise<BranchRequest> {
  try {
    const updateData: any = {
      status,
      respondedAt: new Date(),
    };
    
    if (finalName && status === 'approved') {
      updateData.proposedName = finalName;
    }
    
    const [updated] = await db
      .update(branchRequest)
      .set(updateData)
      .where(eq(branchRequest.id, requestId))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error updating branch request:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update branch request',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function getDocuments(userId: string) {
  try {
    return await db
      .select()
      .from(document)
      .where(eq(document.userId, userId))
      .orderBy(desc(document.updatedAt));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get documents');
  }
}

export async function getChats(userId: string) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.updatedAt));
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

export async function getRecentActivity(userId: string) {
  try {
    const [recentDocuments, recentChats] = await Promise.all([
      db
        .select()
        .from(document)
        .where(eq(document.userId, userId))
        .orderBy(desc(document.updatedAt))
        .limit(5),
      db
        .select()
        .from(chat)
        .where(eq(chat.userId, userId))
        .orderBy(desc(chat.updatedAt))
        .limit(5)
    ]);

    return { recentDocuments, recentChats };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get recent activity');
  }
}

export async function getStats(userId: string) {
  try {
    const [documentCount, chatCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(document)
        .where(eq(document.userId, userId))
        .then((result) => result[0]?.count ?? 0),
      db
        .select({ count: count() })
        .from(chat)
        .where(eq(chat.userId, userId))
        .then((result) => result[0]?.count ?? 0)
    ]);

    return { documentCount, chatCount };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get stats');
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

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
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
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

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
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

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Database error in getDocumentsById:', {
      id,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to get documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function getDocumentsByUserId({ userId }: { userId: string }) {
  try {
    return await db
      .select()
      .from(document)
      .where(eq(document.userId, userId))
      .orderBy(desc(document.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by user id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
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
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

// Document Branching Functions

export async function createBranchRequest({
  documentId,
  documentCreatedAt,
  proposedName,
  reason,
  requestedById,
}: {
  documentId: string;
  documentCreatedAt: Date;
  proposedName: string;
  reason?: string;
  requestedById: string;
}): Promise<BranchRequest> {
  try {
    const [branchReq] = await db
      .insert(branchRequest)
      .values({
        id: generateUUID(),
        documentId,
        documentCreatedAt,
        proposedName,
        reason,
        requestedByType: 'ai',
        requestedById,
        status: 'pending',
        createdAt: new Date(),
      })
      .returning();
    
    return branchReq;
  } catch (error) {
    console.error('Error creating branch request:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create branch request',
    );
  }
}

export async function getBranchRequestsByDocument({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<BranchRequest[]> {
  try {
    return await db
      .select()
      .from(branchRequest)
      .where(
        and(
          eq(branchRequest.documentId, documentId),
          eq(branchRequest.documentCreatedAt, documentCreatedAt),
        ),
      )
      .orderBy(desc(branchRequest.createdAt));
  } catch (error) {
    console.error('Error getting branch requests:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get branch requests',
    );
  }
}

export async function updateBranchRequestStatus({
  requestId,
  status,
  finalName,
}: {
  requestId: string;
  status: 'approved' | 'rejected';
  finalName?: string;
}): Promise<BranchRequest> {
  try {
    const updateData: any = {
      status,
      respondedAt: new Date(),
    };
    
    if (finalName && status === 'approved') {
      updateData.proposedName = finalName;
    }
    
    const [updated] = await db
      .update(branchRequest)
      .set(updateData)
      .where(eq(branchRequest.id, requestId))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error updating branch request status:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update branch request status',
    );
  }
}

export async function createDocumentBranch({
  id,
  documentId,
  documentCreatedAt,
  name,
  parentBranchId,
  createdByType,
  createdById,
  isActive
}: {
  id: string
  documentId: string
  documentCreatedAt: Date
  name: string
  parentBranchId?: string | null
  createdByType: 'user' | 'ai'
  createdById: string
  isActive: boolean
}): Promise<DocumentBranch> {
  try {
    const [branch] = await db
      .insert(documentBranch)
      .values({
        id,
        documentId,
        documentCreatedAt,
        name,
        parentBranchId,
        createdByType,
        createdById,
        isActive,
        createdAt: new Date(),
      })
      .returning();
    
    return branch;
  } catch (error) {
    console.error('Error creating document branch:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create document branch',
    );
  }
}

export async function getDocumentBranches({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<DocumentBranch[]> {
  try {
    return await db
      .select()
      .from(documentBranch)
      .where(
        and(
          eq(documentBranch.documentId, documentId),
          eq(documentBranch.documentCreatedAt, documentCreatedAt),
          eq(documentBranch.isActive, true),
        ),
      )
      .orderBy(desc(documentBranch.createdAt));
  } catch (error) {
    console.error('Error getting document branches:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document branches',
    );
  }
}

export async function createDocumentVersion({
  branchId,
  content,
  commitMessage,
  authorId,
  authorType,
  parentVersionId,
}: {
  branchId: string;
  content: string;
  commitMessage?: string;
  authorId: string;
  authorType: 'user' | 'ai';
  parentVersionId?: string;
}): Promise<DocumentVersion> {
  try {
    const [version] = await db
      .insert(documentVersion)
      .values({
        branchId,
        content,
        commitMessage,
        authorId,
        authorType,
        parentVersionId,
      })
      .returning();
    
    return version;
  } catch (error) {
    console.error('Error creating document version:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create document version',
    );
  }
}

export async function getBranchVersions({
  branchId,
}: {
  branchId: string;
}): Promise<DocumentVersion[]> {
  try {
    return await db
      .select()
      .from(documentVersion)
      .where(eq(documentVersion.branchId, branchId))
      .orderBy(desc(documentVersion.createdAt));
  } catch (error) {
    console.error('Error getting branch versions:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get branch versions',
    );
  }
}

export async function linkChatToDocument({
  chatId,
  documentId,
  documentCreatedAt,
  branchId,
  linkType = 'created',
}: {
  chatId: string;
  documentId: string;
  documentCreatedAt: Date;
  branchId?: string;
  linkType?: 'created' | 'referenced' | 'updated';
}): Promise<ChatDocument> {
  try {
    const [link] = await db
      .insert(chatDocument)
      .values({
        chatId,
        documentId,
        documentCreatedAt,
        branchId,
        linkType,
      })
      .returning();
    
    return link;
  } catch (error) {
    console.error('Error linking chat to document:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to link chat to document',
    );
  }
}

export async function getDocumentChats({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<(ChatDocument & { chat: Chat })[]> {
  try {
    return await db
      .select({
        chatId: chatDocument.chatId,
        documentId: chatDocument.documentId,
        documentCreatedAt: chatDocument.documentCreatedAt,
        branchId: chatDocument.branchId,
        linkType: chatDocument.linkType,
        linkedAt: chatDocument.linkedAt,
        chat: {
          id: chat.id,
          title: chat.title,
          userId: chat.userId,
          visibility: chat.visibility,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          linkedDocumentId: chat.linkedDocumentId,
          linkedDocumentCreatedAt: chat.linkedDocumentCreatedAt,
        },
      })
      .from(chatDocument)
      .innerJoin(chat, eq(chatDocument.chatId, chat.id))
      .where(
        and(
          eq(chatDocument.documentId, documentId),
          eq(chatDocument.documentCreatedAt, documentCreatedAt),
        ),
      )
      .orderBy(desc(chatDocument.linkedAt));
  } catch (error) {
    console.error('Error getting document chats:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document chats',
    );
  }
}

// Chat-Document Linking Functions

export async function unlinkChatFromDocument(chatId: string): Promise<void> {
  try {
    await db
      .update(chat)
      .set({
        linkedDocumentId: null,
        linkedDocumentCreatedAt: null,
      })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Error unlinking chat from document:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to unlink chat from document',
    );
  }
}

export async function getChatLinkedDocument(chatId: string): Promise<Document | null> {
  try {
    const result = await db
      .select({
        document: {
          id: document.id,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          title: document.title,
          content: document.content,
          kind: document.kind,
          visibility: document.visibility,
          userId: document.userId,
          pendingChanges: document.pendingChanges,
          hasUnpushedChanges: document.hasUnpushedChanges,
        },
      })
      .from(chat)
      .innerJoin(
        document,
        and(
          eq(chat.linkedDocumentId, document.id),
          eq(chat.linkedDocumentCreatedAt, document.createdAt),
        ),
      )
      .where(eq(chat.id, chatId))
      .limit(1);

    return result[0]?.document || null;
  } catch (error) {
    console.error('Error getting chat linked document:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat linked document',
    );
  }
}

// Pending Changes Functions
export async function createPendingChange({
  documentId,
  documentCreatedAt,
  changes,
  description,
  changeType,
  authorType,
  authorId,
}: {
  documentId: string;
  documentCreatedAt: Date;
  changes: any;
  description: string;
  changeType: 'ai_suggestion' | 'user_edit';
  authorType: 'user' | 'ai';
  authorId: string;
}): Promise<PendingChange> {
  try {
    const [newPendingChange] = await db
      .insert(pendingChange)
      .values({
        documentId,
        documentCreatedAt,
        changes,
        description,
        changeType,
        authorType,
        authorId,
      })
      .returning();

    // Mark document as having unpushed changes
    await db
      .update(document)
      .set({ hasUnpushedChanges: true })
      .where(
        and(
          eq(document.id, documentId),
          eq(document.createdAt, documentCreatedAt),
        ),
      );

    return newPendingChange;
  } catch (error) {
    console.error('Error creating pending change:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create pending change',
    );
  }
}

export async function getPendingChanges({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<PendingChange[]> {
  try {
    return await db
      .select()
      .from(pendingChange)
      .where(
        and(
          eq(pendingChange.documentId, documentId),
          eq(pendingChange.documentCreatedAt, documentCreatedAt),
          eq(pendingChange.status, 'pending'),
        ),
      )
      .orderBy(asc(pendingChange.createdAt));
  } catch (error) {
    console.error('Error getting pending changes:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get pending changes',
    );
  }
}

export async function acceptPendingChange({
  changeId,
  newContent,
}: {
  changeId: string;
  newContent: string;
}): Promise<void> {
  try {
    // Get the pending change
    const [change] = await db
      .select()
      .from(pendingChange)
      .where(eq(pendingChange.id, changeId))
      .limit(1);

    if (!change) {
      throw new ChatSDKError('not_found:document', 'Pending change not found');
    }

    // Update the document content
    await db
      .update(document)
      .set({
        content: newContent,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(document.id, change.documentId),
          eq(document.createdAt, change.documentCreatedAt),
        ),
      );

    // Mark the change as accepted
    await db
      .update(pendingChange)
      .set({
        status: 'accepted',
        resolvedAt: new Date(),
      })
      .where(eq(pendingChange.id, changeId));

    // Create a new version
    await createDocumentVersion({
      branchId: change.documentId,
      content: newContent,
      commitMessage: `Accept change: ${change.description}`,
      authorType: 'user',
      authorId: change.authorId,
    });

    // Check if there are any more pending changes
    const remainingChanges = await db
      .select({ count: count() })
      .from(pendingChange)
      .where(
        and(
          eq(pendingChange.documentId, change.documentId),
          eq(pendingChange.documentCreatedAt, change.documentCreatedAt),
          eq(pendingChange.status, 'pending'),
        ),
      );

    // If no more pending changes, mark document as not having unpushed changes
    if (remainingChanges[0]?.count === 0) {
      await db
        .update(document)
        .set({ hasUnpushedChanges: false })
        .where(
          and(
            eq(document.id, change.documentId),
            eq(document.createdAt, change.documentCreatedAt),
          ),
        );
    }
  } catch (error) {
    console.error('Error accepting pending change:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to accept pending change',
    );
  }
}

export async function rejectPendingChange(changeId: string): Promise<void> {
  try {
    // Get the pending change
    const [change] = await db
      .select()
      .from(pendingChange)
      .where(eq(pendingChange.id, changeId))
      .limit(1);

    if (!change) {
      throw new ChatSDKError('not_found:document', 'Pending change not found');
    }

    // Mark the change as rejected
    await db
      .update(pendingChange)
      .set({
        status: 'rejected',
        resolvedAt: new Date(),
      })
      .where(eq(pendingChange.id, changeId));

    // Check if there are any more pending changes
    const remainingChanges = await db
      .select({ count: count() })
      .from(pendingChange)
      .where(
        and(
          eq(pendingChange.documentId, change.documentId),
          eq(pendingChange.documentCreatedAt, change.documentCreatedAt),
          eq(pendingChange.status, 'pending'),
        ),
      );

    // If no more pending changes, mark document as not having unpushed changes
    if (remainingChanges[0]?.count === 0) {
      await db
        .update(document)
        .set({ hasUnpushedChanges: false })
        .where(
          and(
            eq(document.id, change.documentId),
            eq(document.createdAt, change.documentCreatedAt),
          ),
        );
    }
  } catch (error) {
    console.error('Error rejecting pending change:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to reject pending change',
    );
  }
}

export async function pushLocalChanges({
  documentId,
  documentCreatedAt,
  content,
  commitMessage,
  userId,
}: {
  documentId: string;
  documentCreatedAt: Date;
  content: string;
  commitMessage?: string;
  userId: string;
}): Promise<void> {
  try {
    // Update the document content
    await db
      .update(document)
      .set({
        content,
        updatedAt: new Date(),
        hasUnpushedChanges: false,
      })
      .where(
        and(
          eq(document.id, documentId),
          eq(document.createdAt, documentCreatedAt),
        ),
      );

    // Create a new version
    await createDocumentVersion({
      branchId: documentId, // Use document ID as branch ID
      content,
      commitMessage: commitMessage || 'Push local changes',
      authorType: 'user',
      authorId: userId,
    });
  } catch (error) {
    console.error('Error pushing local changes:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to push local changes',
    );
  }
}
