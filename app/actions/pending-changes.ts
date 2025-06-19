'use server';

import { auth } from '@/app/(auth)/auth';
import {
  createPendingChange,
  getPendingChanges,
  acceptPendingChange,
  rejectPendingChange,
  pushLocalChanges,
  getDocumentsById,
} from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import type { PendingChange } from '@/lib/db/schema-pending-changes';

export async function createPendingChangeAction({
  documentId,
  changes,
  description,
  changeType,
  authorType,
  authorId,
}: {
  documentId: string;
  changes: any;
  description: string;
  changeType: 'ai_suggestion' | 'user_edit';
  authorType: 'user' | 'ai';
  authorId: string;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify user owns the document
  const documentsData = await getDocumentsById({ id: documentId });
  const documentData = documentsData?.[0];

  if (!documentData || documentData.userId !== session.user.id) {
    throw new Error('Document not found or access denied');
  }

  const pendingChange = await createPendingChange({
    documentId: documentData.id,
    documentCreatedAt: documentData.createdAt,
    changes,
    description,
    changeType,
    authorType,
    authorId,
  });

  return pendingChange;
}

export async function getPendingChangesAction(documentId: string): Promise<PendingChange[]> {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify user owns the document
  const documentsData = await getDocumentsById({ id: documentId });
  const documentData = documentsData?.[0];

  if (!documentData || documentData.userId !== session.user.id) {
    throw new Error('Document not found or access denied');
  }

  return await getPendingChanges({
    documentId: documentData.id,
    documentCreatedAt: documentData.createdAt,
  });
}

export async function acceptPendingChangeAction({
  changeId,
  newContent,
}: {
  changeId: string;
  newContent: string;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Note: acceptPendingChange function will verify ownership through the change record
  await acceptPendingChange({ changeId, newContent });

  return { success: true };
}

export async function rejectPendingChangeAction(changeId: string) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Note: rejectPendingChange function will verify ownership through the change record
  await rejectPendingChange(changeId);

  return { success: true };
}

export async function pushLocalChangesAction({
  documentId,
  content,
  commitMessage,
}: {
  documentId: string;
  content: string;
  commitMessage?: string;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify user owns the document
  const documentsData = await getDocumentsById({ id: documentId });
  const documentData = documentsData?.[0];

  if (!documentData || documentData.userId !== session.user.id) {
    throw new Error('Document not found or access denied');
  }

  await pushLocalChanges({
    documentId: documentData.id,
    documentCreatedAt: documentData.createdAt,
    content,
    commitMessage,
    userId: session.user.id,
  });

  return { success: true };
}