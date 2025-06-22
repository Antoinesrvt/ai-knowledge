'use server'

import { auth } from '@/app/(auth)/auth'
import {
  getUser,
  createUser
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getUserAction(email: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const users = await getUser(email)
    return users[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }
}

export async function getUserByIdAction(userId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // TODO: Implement getUserById when available
  throw new Error('Get user by ID not yet implemented')
}

export async function createUserAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  try {
    const user = await createUser(email, password)
    
    revalidatePath('/dashboard')
    
    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export async function updateUserAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const bio = formData.get('bio') as string
  const location = formData.get('location') as string
  const website = formData.get('website') as string

  if (!userId) {
    throw new Error('User ID is required')
  }

  // Users can only update their own profile unless they're an admin
  if (userId !== session.user.id) {
    throw new Error('Unauthorized to update this user')
  }

  try {
    // For now, we'll use Stack Auth's user update functionality
    // In a real implementation, you might also update a local user table
    const updatedUser = {
      id: userId,
      name: name || session.user.name,
      email: email || session.user.email,
      bio,
      location,
      website
    }
    
    // Note: Stack Auth handles user updates through their API
    // This is a simplified version for demonstration
    
    revalidatePath('/settings/profile')
    revalidatePath('/dashboard')
    
    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user profile')
  }
}

export async function deleteUserAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = formData.get('userId') as string

  if (!userId) {
    throw new Error('User ID is required')
  }

  // Users can only delete their own account unless they're an admin
  if (userId !== session.user.id) {
    throw new Error('Unauthorized to delete this user')
  }

  // TODO: Implement deleteUser when available
  throw new Error('Delete user not yet implemented')
}

export async function searchUsersAction(query: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!query || query.length < 2) {
    throw new Error('Search query must be at least 2 characters')
  }

  // TODO: Implement searchUsers when available
  throw new Error('Search users not yet implemented')
}

export async function getCurrentUserAction() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Return the user from the session for now
  return session.user
}