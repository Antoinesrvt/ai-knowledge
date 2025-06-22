'use server'

import { auth } from '@/app/(auth)/auth'
import {
  createOrganization,
  getOrganizationById,
  getUserOrganizations,
  addOrganizationMember,
  removeOrganizationMember,
  getOrganizationTeams,
  updateOrganization
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrganizationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    throw new Error('Organization name is required')
  }

  try {
    const organization = await createOrganization(name, description, session.user.id)
    
    revalidatePath('/dashboard')
    revalidatePath('/organization')
    
    return { success: true, organization }
  } catch (error) {
    console.error('Error creating organization:', error)
    throw new Error('Failed to create organization')
  }
}

export async function getOrganizationAction(organizationId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const organization = await getOrganizationById(organizationId)
    return organization
  } catch (error) {
    console.error('Error fetching organization:', error)
    throw new Error('Failed to fetch organization')
  }
}

export async function getUserOrganizationsAction(userId?: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Use provided userId or fall back to session user id
  const targetUserId = userId || session.user.id
  
  // Only allow users to fetch their own organizations unless they're admin
  if (targetUserId !== session.user.id) {
    throw new Error('Unauthorized to access other user data')
  }

  try {
    const organizations = await getUserOrganizations(targetUserId)
    return organizations
  } catch (error) {
    console.error('Error fetching user organizations:', error)
    throw new Error('Failed to fetch organizations')
  }
}

export async function addOrganizationMemberAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const organizationId = formData.get('organizationId') as string
  const userId = formData.get('userId') as string
  const role = formData.get('role') as 'owner' | 'admin' | 'member'

  if (!organizationId || !userId || !role) {
    throw new Error('Organization ID, user ID, and role are required')
  }

  try {
    const member = await addOrganizationMember(organizationId, userId, role)
    
    revalidatePath('/organization/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true, member }
  } catch (error) {
    console.error('Error adding organization member:', error)
    throw new Error('Failed to add organization member')
  }
}

export async function removeOrganizationMemberAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const organizationId = formData.get('organizationId') as string
  const userId = formData.get('userId') as string

  if (!organizationId || !userId) {
    throw new Error('Organization ID and user ID are required')
  }

  try {
    await removeOrganizationMember(organizationId, userId)
    
    revalidatePath('/organization/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error removing organization member:', error)
    throw new Error('Failed to remove organization member')
  }
}

export async function updateOrganizationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const organizationId = formData.get('organizationId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!organizationId) {
    throw new Error('Organization ID is required')
  }

  if (!name) {
    throw new Error('Organization name is required')
  }

  try {
    const updatedOrg = await updateOrganization(organizationId, {
      name,
      description: description || undefined
    })
    
    revalidatePath('/settings/organizations')
    revalidatePath('/organization/[id]', 'page')
    revalidatePath('/dashboard')
    
    return updatedOrg
  } catch (error) {
    console.error('Error updating organization:', error)
    throw new Error('Failed to update organization')
  }
}

export async function getOrganizationMembersAction(organizationId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const members = await getOrganizationTeams(organizationId)
    return members
  } catch (error) {
    console.error('Error fetching organization members:', error)
    throw new Error('Failed to fetch organization members')
  }
}