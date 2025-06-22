import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { branchRequest, documentBranch, documentVersion } from '../schema';
import { generateUUID } from '@/lib/utils'
import { ChatSDKError } from '@/lib/errors';
import type { BranchRequest, DocumentBranch, DocumentVersion } from '../schema';

const connectionString = process.env.POSTGRES_URL!;
const pool = postgres(connectionString, { max: 1 });
const db = drizzle(pool);

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
  id,
  branchId,
  content,
  commitMessage,
  authorType,
  authorId,
  parentVersionId,
}: {
  id?: string;
  branchId: string;
  content: string;
  commitMessage?: string;
  authorType: 'user' | 'ai';
  authorId: string;
  parentVersionId?: string;
}): Promise<DocumentVersion> {
  try {
    const [version] = await db
      .insert(documentVersion)
      .values({
        id,
        branchId,
        content,
        commitMessage,
        authorType,
        authorId,
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