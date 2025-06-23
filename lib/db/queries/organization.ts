import { db } from '@/lib/db/client';
import { eq, and } from 'drizzle-orm';
import { organization, organizationMember } from '../schema';
import { ChatSDKError } from '@/lib/errors';
import type { Organization, OrganizationMember } from '../schema';

// Organization Management Functions
export async function createOrganization(
  name: string,
  description?: string,
  ownerId?: string
) {
  const [newOrg] = await db
    .insert(organization)
    .values({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      description,
    })
    .returning();

  return newOrg;
}

export async function getOrganizationById(organizationId: string) {
  return await db
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId))
    .then((rows) => rows[0]);
}

export async function getUserOrganizations(userId: string) {
  return await db
    .select({
      organization: organization,
      role: organizationMember.role,
      joinedAt: organizationMember.joinedAt,
    })
    .from(organizationMember)
    .innerJoin(organization, eq(organizationMember.organizationId, organization.id))
    .where(eq(organizationMember.userId, userId));
}

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<OrganizationMember> {
  try {
    const [newMember] = await db
      .insert(organizationMember)
      .values({
        organizationId,
        userId,
        role,
        joinedAt: new Date(),
      })
      .returning();

    return newMember;
  } catch (error) {
    console.error('Error adding organization member:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to add organization member',
    );
  }
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
) {
  try {
    await db
      .delete(organizationMember)
      .where(
        and(
          eq(organizationMember.organizationId, organizationId),
          eq(organizationMember.userId, userId)
        )
      );
  } catch (error) {
    console.error('Error removing organization member:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to remove organization member',
    );
  }
}

export async function updateOrganization(
  organizationId: string,
  updates: Partial<Pick<Organization, 'name' | 'description'>>
) {
  const [updatedOrg] = await db
    .update(organization)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(organization.id, organizationId))
    .returning();

  return updatedOrg;
}

export async function deleteOrganization(organizationId: string) {
  await db
    .delete(organization)
    .where(eq(organization.id, organizationId));
}

export async function getOrganizationMembers(organizationId: string) {
  return await db
    .select({
      user: {
        id: organizationMember.userId,
      },
      role: organizationMember.role,
      joinedAt: organizationMember.joinedAt,
    })
    .from(organizationMember)
    .where(eq(organizationMember.organizationId, organizationId));
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member'
) {
  const [updatedMember] = await db
    .update(organizationMember)
    .set({ role })
    .where(
      and(
        eq(organizationMember.organizationId, organizationId),
        eq(organizationMember.userId, userId)
      )
    )
    .returning();

  return updatedMember;
}