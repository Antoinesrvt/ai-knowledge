import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import postgres from 'postgres';
import { chatDocument, chat, document } from '../schema';
import { ChatSDKError } from '@/lib/errors';
import type { ChatDocument, Chat, Document } from '../schema';

const connectionString = process.env.POSTGRES_URL!;
const pool = postgres(connectionString, { max: 1 });
const db = drizzle(pool);

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
          organizationId: chat.organizationId,
          teamId: chat.teamId,
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
          organizationId: document.organizationId,
          teamId: document.teamId,
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

export async function getChatLinkedToDocument({
  documentId,
  documentCreatedAt
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<{ chatId: string } | null> {
  try {
    const result = await db
      .select({
        chatId: chatDocument.chatId,
      })
      .from(chatDocument)
      .where(
        and(
          eq(chatDocument.documentId, documentId),
          eq(chatDocument.documentCreatedAt, documentCreatedAt)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting chat linked to document:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat linked to document',
    );
  }
}