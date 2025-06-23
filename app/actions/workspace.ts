'use server';

import { auth } from '@/app/(auth)/auth';
import { 
  updateDocumentViewMode, 
  setActiveMainChat, 
  createMainChatForDocument 
} from '@/lib/db/queries/workspace';
import type { WorkspaceViewMode } from '@/lib/workspace-utils';
import { revalidatePath } from 'next/cache';

export async function updateDocumentViewModeAction(
  documentId: string, 
  viewMode: WorkspaceViewMode
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await updateDocumentViewMode(documentId, viewMode);
  revalidatePath(`/workspace/${documentId}`);
}

export async function setActiveMainChatAction(
  documentId: string, 
  chatId: string | null
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // If chatId is null, create a new chat on the fly
  if (chatId === null) {
    // Get document to access createdAt for new chat creation
    const { getDocumentById } = await import('@/lib/db/queries');
    const document = await getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Create new chat and set it as active
    const newChatId = await createMainChatForDocument(
      documentId,
      document.createdAt,
      `Chat: ${document.title}`,
      session.user.id
    );
    
    await setActiveMainChat(documentId, newChatId);
  } else {
    await setActiveMainChat(documentId, chatId);
  }
  
  revalidatePath(`/workspace/${documentId}`);
}

export async function createMainChatForDocumentAction(
  documentId: string, 
  documentCreatedAt: Date,
  title?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const chatId = await createMainChatForDocument(
    documentId, 
    documentCreatedAt,
    title || 'New Chat',
    session.user.id
  );
  
  revalidatePath(`/workspace/${documentId}`);
  return chatId;
}