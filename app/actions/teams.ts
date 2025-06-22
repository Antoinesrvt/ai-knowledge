'use server'

import { auth } from '@/app/(auth)/auth'
import {
  createTeam,
  getTeamById,
  getOrganizationTeams,
  getUserTeams,
  addTeamMember,
  removeTeamMember,
  updateTeam
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTeamAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const organizationId = formData.get('organizationId') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string

  if (!name || !organizationId) {
    throw new Error('Team name and organization ID are required')
  }

  try {
    const team = await createTeam(name, organizationId, description, color, session.user.id)
    
    revalidatePath('/teams')
    revalidatePath('/organization/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true, team }
  } catch (error) {
    console.error('Error creating team:', error)
    throw new Error('Failed to create team')
  }
}

export async function getTeamAction(teamId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const team = await getTeamById(teamId)
    return team
  } catch (error) {
    console.error('Error fetching team:', error)
    throw new Error('Failed to fetch team')
  }
}

export async function getOrganizationTeamsAction(organizationId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const teams = await getOrganizationTeams(organizationId)
    return teams
  } catch (error) {
    console.error('Error fetching organization teams:', error)
    throw new Error('Failed to fetch organization teams')
  }
}

export async function getUserTeamsAction(userId?: string, organizationId?: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Use provided userId or fall back to session user id
  const targetUserId = userId || session.user.id
  
  // Only allow users to fetch their own teams unless they're admin
  if (targetUserId !== session.user.id) {
    throw new Error('Unauthorized to access other user data')
  }

  try {
    const teams = await getUserTeams(targetUserId, organizationId)
    return teams
  } catch (error) {
    console.error('Error fetching user teams:', error)
    throw new Error('Failed to fetch user teams')
  }
}

export async function addTeamMemberAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const teamId = formData.get('teamId') as string
  const userId = formData.get('userId') as string
  const role = formData.get('role') as 'lead' | 'member'

  if (!teamId || !userId || !role) {
    throw new Error('Team ID, user ID, and role are required')
  }

  try {
    const member = await addTeamMember(teamId, userId, role)
    
    revalidatePath('/teams/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true, member }
  } catch (error) {
    console.error('Error adding team member:', error)
    throw new Error('Failed to add team member')
  }
}

export async function removeTeamMemberAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const teamId = formData.get('teamId') as string
  const userId = formData.get('userId') as string

  if (!teamId || !userId) {
    throw new Error('Team ID and user ID are required')
  }

  try {
    await removeTeamMember(teamId, userId)
    
    revalidatePath('/teams/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error removing team member:', error)
    throw new Error('Failed to remove team member')
  }
}

export async function getTeamMembersAction(teamId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // TODO: Implement getTeamMembers when available
  throw new Error('Get team members not yet implemented')
}

export async function updateTeamAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const teamId = formData.get('teamId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!teamId) {
    throw new Error('Team ID is required')
  }

  if (!name) {
    throw new Error('Team name is required')
  }

  try {
    const updatedTeam = await updateTeam(teamId, {
      name,
      description: description || undefined
    })
    
    revalidatePath('/settings/organizations')
    revalidatePath('/teams')
    revalidatePath('/organization/[id]', 'page')
    revalidatePath('/dashboard')
    
    return updatedTeam
  } catch (error) {
    console.error('Error updating team:', error)
    throw new Error('Failed to update team')
  }
}

export async function deleteTeamAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const teamId = formData.get('teamId') as string

  if (!teamId) {
    throw new Error('Team ID is required')
  }

  // TODO: Implement deleteTeam when available
  throw new Error('Delete team not yet implemented')
}