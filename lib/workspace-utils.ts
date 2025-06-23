import { db } from '@/lib/db/client';
import { chat, document } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type WorkspaceEntryType = 'document' | 'chat';
export type WorkspaceViewMode = 'document' | 'chat' | 'split';

export interface WorkspaceEntry {
  id: string;
  type: WorkspaceEntryType;
  createdAt: Date;
}

export interface WorkspaceState {
  entryType: WorkspaceEntryType;
  entryId: string;
  viewMode: WorkspaceViewMode;
  documentData?: any;
  chatData?: any;
  primaryDocument?: any;
  mainChats?: any[];
  usedDocuments?: any[];
}

/**
 * Detects whether an ID belongs to a document or chat
 */
export async function detectWorkspaceEntryType(id: string): Promise<WorkspaceEntry | null> {
  // First check if it's a document
  const documentResult = await db
    .select({
      id: document.id,
      createdAt: document.createdAt,
    })
    .from(document)
    .where(eq(document.id, id))
    .limit(1);

  if (documentResult.length > 0) {
    return {
      id: documentResult[0].id,
      type: 'document',
      createdAt: documentResult[0].createdAt,
    };
  }

  // Then check if it's a chat
  const chatResult = await db
    .select({
      id: chat.id,
      createdAt: chat.createdAt,
    })
    .from(chat)
    .where(eq(chat.id, id))
    .limit(1);

  if (chatResult.length > 0) {
    return {
      id: chatResult[0].id,
      type: 'chat',
      createdAt: chatResult[0].createdAt,
    };
  }

  return null;
}

/**
 * Determines the view mode based on entry type and user preferences
 */
export function determineViewMode(
  entryType: WorkspaceEntryType,
  userPreference?: WorkspaceViewMode | null
): WorkspaceViewMode {
  // If user has a preference and it's not null, use it
  if (userPreference && userPreference !== null) {
    return userPreference;
  }

  // Default view mode based on entry type
  return entryType === 'document' ? 'document' : 'chat';
}

/**
 * Updates the last accessed time and view mode for a document
 */
export async function updateDocumentAccess(
  documentId: string,
  viewMode: WorkspaceViewMode
) {
  await db
    .update(document)
    .set({
      lastAccessedAt: new Date(),
      lastViewMode: viewMode,
    })
    .where(eq(document.id, documentId));
}

/**
 * Gets the workspace URL for a given ID
 */
export function getWorkspaceUrl(id: string): string {
  return `/workspace/${id}`;
}

/**
 * Validates workspace access permissions
 */
export async function validateWorkspaceAccess(
  entryId: string,
  entryType: WorkspaceEntryType,
  userId: string
): Promise<boolean> {
  if (entryType === 'document') {
    const result = await db
      .select({ id: document.id })
      .from(document)
      .where(and(eq(document.id, entryId), eq(document.userId, userId)))
      .limit(1);
    return result.length > 0;
  } else {
    const result = await db
      .select({ id: chat.id })
      .from(chat)
      .where(and(eq(chat.id, entryId), eq(chat.userId, userId)))
      .limit(1);
    return result.length > 0;
  }
}