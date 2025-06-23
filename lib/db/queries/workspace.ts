import { db } from '@/lib/db/client';
import {
  chat,
  document,
  chatDocument,
  documentMainChat,
  user,
} from '../schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { WorkspaceViewMode } from '@/lib/workspace-utils';

/**
 * Get document with its main chats for workspace view
 */
export async function getDocumentForWorkspace(documentId: string, userId: string) {
  const documentResult = await db
    .select({
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
      currentMainChatId: document.currentMainChatId,
      lastViewMode: document.lastViewMode,
      lastAccessedAt: document.lastAccessedAt,
    })
    .from(document)
    .where(and(eq(document.id, documentId), eq(document.userId, userId)))
    .limit(1);

  if (documentResult.length === 0) {
    return null;
  }

  const doc = documentResult[0];

  // Get main chats for this document
  const mainChats = await db
    .select({
      chatId: documentMainChat.chatId,
      isActive: documentMainChat.isActive,
      createdAt: documentMainChat.createdAt,
      chatTitle: chat.title,
      chatCreatedAt: chat.createdAt,
      chatUpdatedAt: chat.updatedAt,
    })
    .from(documentMainChat)
    .innerJoin(chat, eq(documentMainChat.chatId, chat.id))
    .where(
      and(
        eq(documentMainChat.documentId, documentId),
        eq(documentMainChat.isActive, true)
      )
    )
    .orderBy(desc(documentMainChat.createdAt));

  return {
    ...doc,
    mainChats,
  };
}

/**
 * Get chat with its primary document and used documents for workspace view
 */
export async function getChatForWorkspace(chatId: string, userId: string) {
  const chatResult = await db
    .select({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      title: chat.title,
      userId: chat.userId,
      organizationId: chat.organizationId,
      teamId: chat.teamId,
      visibility: chat.visibility,
      workspaceType: chat.workspaceType,
      primaryDocumentId: chat.primaryDocumentId,
      primaryDocumentCreatedAt: chat.primaryDocumentCreatedAt,
    })
    .from(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    .limit(1);

  if (chatResult.length === 0) {
    return null;
  }

  const chatData = chatResult[0];

  // Get primary document if exists
  let primaryDocument = null;
  if (chatData.primaryDocumentId) {
    const primaryDocResult = await db
      .select({
        id: document.id,
        createdAt: document.createdAt,
        title: document.title,
        content: document.content,
        kind: document.kind,
      })
      .from(document)
      .where(
        and(
          eq(document.id, chatData.primaryDocumentId),
          eq(document.createdAt, chatData.primaryDocumentCreatedAt!)
        )
      )
      .limit(1);

    if (primaryDocResult.length > 0) {
      primaryDocument = primaryDocResult[0];
    }
  }

  // Get all documents used by this chat
  const usedDocuments = await db
    .select({
      documentId: chatDocument.documentId,
      documentCreatedAt: chatDocument.documentCreatedAt,
      relationshipType: chatDocument.relationshipType,
      linkedAt: chatDocument.linkedAt,
      documentTitle: document.title,
      documentKind: document.kind,
    })
    .from(chatDocument)
    .innerJoin(
      document,
      and(
        eq(chatDocument.documentId, document.id),
        eq(chatDocument.documentCreatedAt, document.createdAt)
      )
    )
    .where(eq(chatDocument.chatId, chatId))
    .orderBy(desc(chatDocument.linkedAt));

  return {
    ...chatData,
    primaryDocument,
    usedDocuments,
  };
}

/**
 * Create a main chat for a document
 */
export async function createMainChatForDocument(
  documentId: string,
  documentCreatedAt: Date,
  chatTitle: string,
  userId: string
) {
  // Create the chat
  const newChat = await db
    .insert(chat)
    .values({
      title: chatTitle,
      userId,
      workspaceType: 'document',
      primaryDocumentId: documentId,
      primaryDocumentCreatedAt: documentCreatedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: chat.id, createdAt: chat.createdAt });

  const chatId = newChat[0].id;

  // Add to DocumentMainChat table
  await db.insert(documentMainChat).values({
    documentId,
    documentCreatedAt,
    chatId,
    isActive: true,
    createdAt: new Date(),
  });

  // Add to ChatDocument table as main_chat relationship
  await db.insert(chatDocument).values({
    chatId,
    documentId,
    documentCreatedAt,
    relationshipType: 'main_chat',
    linkedAt: new Date(),
  });

  // Update document's current main chat
  await db
    .update(document)
    .set({ currentMainChatId: chatId })
    .where(eq(document.id, documentId));

  return chatId;
}

/**
 * Set active main chat for a document
 */
export async function setActiveMainChat(
  documentId: string,
  chatId: string
) {
  await db
    .update(document)
    .set({ currentMainChatId: chatId })
    .where(eq(document.id, documentId));
}

/**
 * Track document modification by chat
 */
export async function trackDocumentModification(
  chatId: string,
  documentId: string,
  documentCreatedAt: Date
) {
  // Check if relationship already exists
  const existing = await db
    .select({ chatId: chatDocument.chatId })
    .from(chatDocument)
    .where(
      and(
        eq(chatDocument.chatId, chatId),
        eq(chatDocument.documentId, documentId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    // Create new relationship
    await db.insert(chatDocument).values({
      chatId,
      documentId,
      documentCreatedAt,
      relationshipType: 'modified',
      linkedAt: new Date(),
    });
  } else {
    // Update existing relationship to modified if it's not already main_chat
    await db
      .update(chatDocument)
      .set({
        relationshipType: 'modified',
        linkedAt: new Date(),
      })
      .where(
        and(
          eq(chatDocument.chatId, chatId),
          eq(chatDocument.documentId, documentId),
          eq(chatDocument.relationshipType, 'created')
        )
      );
  }
}

/**
 * Update document view mode preference
 */
export async function updateDocumentViewMode(
  documentId: string,
  viewMode: WorkspaceViewMode
) {
  await db
    .update(document)
    .set({
      lastViewMode: viewMode,
      lastAccessedAt: new Date(),
    })
    .where(eq(document.id, documentId));
}