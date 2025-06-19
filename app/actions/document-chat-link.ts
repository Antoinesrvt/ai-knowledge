'use server';

import { auth } from '@/app/(auth)/auth';
import {
  linkChatToDocument,
  unlinkChatFromDocument,
  getChatLinkedDocument,
  getDocumentsById,
  getChatById,
} from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export async function linkChatToDocumentAction(
  chatId: string,
  documentId: string,
  documentCreatedAt: Date
) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify user owns both chat and document
  const [chatData, documentsData] = await Promise.all([
    getChatById({ id: chatId }),
    getDocumentsById({ id: documentId }),
  ]);

  if (!chatData || chatData.userId !== session.user.id) {
    throw new Error('Chat not found or access denied');
  }

  const documentData = documentsData?.[0];
  if (!documentData || documentData.userId !== session.user.id) {
    throw new Error('Document not found or access denied');
  }

  await linkChatToDocument({
    chatId,
    documentId,
    documentCreatedAt,
    linkType: 'created' as const,
  });

  return { success: true };
}

export async function unlinkChatFromDocumentAction(chatId: string) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify user owns the chat
  const chatData = await getChatById({ id: chatId });

  if (!chatData || chatData.userId !== session.user.id) {
    throw new Error('Chat not found or access denied');
  }

  await unlinkChatFromDocument(chatId);

  return { success: true };
}

export async function getChatLinkedDocumentAction(chatId: string) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify user owns the chat
  const chatData = await getChatById({ id: chatId });

  if (!chatData || chatData.userId !== session.user.id) {
    throw new Error('Chat not found or access denied');
  }

  const linkedDocument = await getChatLinkedDocument(chatId);

  // Verify user owns the linked document if it exists
  if (linkedDocument && linkedDocument.userId !== session.user.id) {
    throw new Error('Document access denied');
  }

  return linkedDocument;
}