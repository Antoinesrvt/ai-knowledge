import { db } from '@/lib/db/client';
import { eq, and, asc, count } from 'drizzle-orm';
import { pendingChange, document } from '../schema';
import { generateUUID } from '@/lib/utils';
import { ChatSDKError } from '@/lib/errors';
import { createDocumentVersion } from './branch';
import type { PendingChange } from '../schema';

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