import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import postgres from 'postgres';
import { generateUUID } from '../../utils';
import { team, teamMember } from '../schema';
import { ChatSDKError } from '@/lib/errors';
import type { Team, TeamMember } from '../schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// Team Management Functions
export async function createTeam(
  name: string,
  organizationId: string,
  description?: string,
  color?: string,
  ownerId?: string
) {
  const [newTeam] = await db
    .insert(team)
    .values({
      name,
      organizationId,
      description,
      color,
    })
    .returning();

  return newTeam;
}

export async function getTeamById(teamId: string) {
  return await db
    .select()
    .from(team)
    .where(eq(team.id, teamId))
    .then((rows) => rows[0]);
}

export async function getOrganizationTeams(organizationId: string) {
  return await db
    .select()
    .from(team)
    .where(eq(team.organizationId, organizationId));
}

export async function getUserTeams(userId: string, organizationId?: string) {
  const whereConditions = [eq(teamMember.userId, userId)];
  
  if (organizationId) {
    whereConditions.push(eq(team.organizationId, organizationId));
  }

  return await db
    .select({
      team: team,
      role: teamMember.role,
      joinedAt: teamMember.joinedAt,
    })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .where(and(...whereConditions));
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: 'lead' | 'member' = 'member'
): Promise<TeamMember> {
  try {
    const [newMember] = await db
      .insert(teamMember)
      .values({
        teamId,
        userId,
        role,
        joinedAt: new Date(),
      })
      .returning();

    return newMember;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to add team member',
    );
  }
}

export async function removeTeamMember(
  teamId: string,
  userId: string
) {
  try {
    await db
      .delete(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamId),
          eq(teamMember.userId, userId)
        )
      );
  } catch (error) {
    console.error('Error removing team member:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to remove team member',
    );
  }
}

export async function updateTeam(
  teamId: string,
  updates: Partial<Pick<Team, 'name' | 'description'>>
) {
  const [updatedTeam] = await db
    .update(team)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(team.id, teamId))
    .returning();

  return updatedTeam;
}

export async function deleteTeam(teamId: string) {
  await db
    .delete(team)
    .where(eq(team.id, teamId));
}

export async function getTeamMembers(teamId: string) {
  return await db
    .select({
      user: {
        id: teamMember.userId,
      },
      role: teamMember.role,
      joinedAt: teamMember.joinedAt,
    })
    .from(teamMember)
    .where(eq(teamMember.teamId, teamId));
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: 'lead' | 'member'
) {
  const [updatedMember] = await db
    .update(teamMember)
    .set({ role })
    .where(
      and(
        eq(teamMember.teamId, teamId),
        eq(teamMember.userId, userId)
      )
    )
    .returning();

  return updatedMember;
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const member = await db
    .select()
    .from(teamMember)
    .where(
      and(
        eq(teamMember.teamId, teamId),
        eq(teamMember.userId, userId)
      )
    )
    .then((rows) => rows[0]);

  return !!member;
}

export async function getTeamMemberRole(teamId: string, userId: string) {
  const member = await db
    .select({ role: teamMember.role })
    .from(teamMember)
    .where(
      and(
        eq(teamMember.teamId, teamId),
        eq(teamMember.userId, userId)
      )
    )
    .then((rows) => rows[0]);

  return member?.role;
}