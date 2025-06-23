import { db } from '@/lib/db/client';
import { eq, and, or, desc, asc, inArray } from 'drizzle-orm';
import { document as documentTable, organization, organizationMember, team, teamMember } from '../schema';
import { ChatSDKError } from '@/lib/errors';
import { generateUUID } from '@/lib/utils';
import type { Document } from '../schema';

// Document Management Functions with Multi-tenant Support

// Get all documents for a user (legacy function for backward compatibility)
export async function getDocuments(userId: string) {
  try {
    return await db
      .select()
      .from(documentTable)
      .where(eq(documentTable.userId, userId))
      .orderBy(desc(documentTable.updatedAt));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get documents');
  }
}

// Get documents for a specific user (personal documents)
export async function getDocumentsForUser(userId: string) {
  return await db
    .select()
    .from(documentTable)
    .where(
      and(
        eq(documentTable.userId, userId),
        eq(documentTable.visibility, 'private')
      )
    )
    .orderBy(desc(documentTable.createdAt));
}

// Get documents for an organization
export async function getDocumentsByOrganization(organizationId: string, userId?: string) {
  const query = db
    .select()
    .from(documentTable)
    .where(
      and(
        eq(documentTable.organizationId, organizationId),
        or(
          eq(documentTable.visibility, 'organization'),
          eq(documentTable.visibility, 'public')
        )
      )
    )
    .orderBy(desc(documentTable.createdAt));

  return await query;
}

// Get documents for a specific team
export async function getDocumentsByTeam(teamId: string, userId?: string) {
  return await db
    .select()
    .from(documentTable)
    .where(
      and(
        eq(documentTable.teamId, teamId),
        or(
          eq(documentTable.visibility, 'team'),
          eq(documentTable.visibility, 'organization'),
          eq(documentTable.visibility, 'public')
        )
      )
    )
    .orderBy(desc(documentTable.createdAt));
}

// Get all accessible documents for a user (considering their organization and team memberships)
export async function getAccessibleDocuments(userId: string) {
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

  // Build conditions for accessible documents
  const conditions = [
    eq(documentTable.visibility, 'public'), // Public documents
    and(
      eq(documentTable.userId, userId),
      eq(documentTable.visibility, 'private')
    ), // User's private documents
  ];

  if (orgIds.length > 0) {
    conditions.push(
      and(
        inArray(documentTable.organizationId, orgIds),
        eq(documentTable.visibility, 'organization')
      )
    );
  }

  if (teamIds.length > 0) {
    conditions.push(
      and(
        inArray(documentTable.teamId, teamIds),
        eq(documentTable.visibility, 'team')
      )
    );
  }

  return await db
    .select()
    .from(documentTable)
    .where(or(...conditions))
    .orderBy(desc(documentTable.createdAt));
}

// Create a new document
export async function createDocument(
  title: string,
  content: string,
  userId: string,
  kind: 'text' | 'code' | 'image' | 'sheet' = 'text',
  visibility: 'public' | 'private' | 'organization' | 'team' = 'private',
  organizationId?: string,
  teamId?: string
): Promise<Document> {
  try {
    const documentId = generateUUID();
    const now = new Date();

    const [newDocument] = await db
      .insert(documentTable)
      .values({
        id: documentId,
        title,
        content,
        kind,
        userId,
        visibility,
        organizationId,
        teamId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return newDocument;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create document',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
  visibility = 'private',
  organizationId,
  teamId,
}: {
  id: string;
  title: string;
  kind: 'text' | 'code' | 'image' | 'sheet';
  content: string;
  userId: string;
  visibility?: 'public' | 'private' | 'organization' | 'team';
  organizationId?: string;
  teamId?: string;
}) {
  try {
    const now = new Date();
    return await db
      .insert(documentTable)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        visibility,
        organizationId,
        teamId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

// Update document
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
      .update(documentTable)
      .set(updateData)
      .where(
        and(
          eq(documentTable.id, id),
          eq(documentTable.createdAt, createdAt)
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

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(documentTable)
      .where(eq(documentTable.id, id))
      .orderBy(asc(documentTable.createdAt));

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
      'Failed to get documents by ID',
    );
  }
}

// Get document by ID with access check
export async function getDocumentById(documentId: string, userId?: string) {
  const document = await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.id, documentId))
    .then((rows) => rows[0]);

  if (!document) {
    return null;
  }

  // Check access permissions
  if (document.visibility === 'public') {
    return document;
  }

  if (!userId) {
    return null; // No user, can only access public documents
  }

  if (document.userId === userId) {
    return document; // Owner can always access
  }

  // Check organization access
  if (document.visibility === 'organization' && document.organizationId) {
    const isMember = await db
      .select()
      .from(organizationMember)
      .where(
        and(
          eq(organizationMember.organizationId, document.organizationId),
          eq(organizationMember.userId, userId)
        )
      )
      .then((rows) => rows.length > 0);

    if (isMember) {
      return document;
    }
  }

  // Check team access
  if (document.visibility === 'team' && document.teamId) {
    const isMember = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, document.teamId),
          eq(teamMember.userId, userId)
        )
      )
      .then((rows) => rows.length > 0);

    if (isMember) {
      return document;
    }
  }

  return null; // No access
}

// Delete document
export async function deleteDocument(documentId: string, userId: string) {
  await db
    .delete(documentTable)
    .where(
      and(
        eq(documentTable.id, documentId),
        eq(documentTable.userId, userId)
      )
    );
}

// Get public documents
export async function getPublicDocuments(limit: number = 50) {
  return await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.visibility, 'public'))
    .orderBy(desc(documentTable.createdAt))
    .limit(limit);
}

// Search documents within user's accessible scope
export async function searchDocuments(
  query: string,
  userId: string,
  organizationId?: string,
  teamId?: string
) {
  // This is a simplified search - in production you'd want to use full-text search
  const accessibleDocs = await getAccessibleDocuments(userId);
  
  return accessibleDocs.filter(doc => 
    doc.title.toLowerCase().includes(query.toLowerCase()) ||
    doc.content?.toLowerCase().includes(query.toLowerCase())
  );
}