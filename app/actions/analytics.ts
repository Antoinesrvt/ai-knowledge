'use server'

import { auth } from '@/app/(auth)/auth'
import {
  getRecentActivity,
  getStats
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

export async function getRecentActivityAction() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const activity = await getRecentActivity(session.user.id)
    return activity
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    throw new Error('Failed to fetch recent activity')
  }
}

export async function getStatsAction() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const stats = await getStats(session.user.id)
    return stats
  } catch (error) {
    console.error('Error fetching stats:', error)
    throw new Error('Failed to fetch stats')
  }
}

export async function getOrganizationStatsAction(organizationId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!organizationId) {
    throw new Error('Organization ID is required')
  }

  // TODO: Implement organization-specific stats when available
  throw new Error('Organization stats not yet implemented')
}

export async function getTeamStatsAction(teamId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!teamId) {
    throw new Error('Team ID is required')
  }

  // TODO: Implement team-specific stats when available
  throw new Error('Team stats not yet implemented')
}

export async function getUserActivityTimelineAction(userId?: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // If no userId provided, use current user's ID
  const targetUserId = userId || session.user.id

  // Users can only view their own timeline unless they're an admin
  if (targetUserId !== session.user.id) {
    throw new Error('Unauthorized to view this user\'s activity')
  }

  // TODO: Implement user activity timeline when available
  throw new Error('User activity timeline not yet implemented')
}

export async function getDashboardAnalyticsAction(context?: {
  type: 'personal' | 'organization' | 'team'
  id?: string
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    let stats, activity

    if (!context || context.type === 'personal') {
      // Personal dashboard
      const [userStats, userActivity] = await Promise.all([
        getStats(session.user.id),
        getRecentActivity(session.user.id)
      ])
      stats = userStats
      activity = userActivity
    } else if (context.type === 'organization' && context.id) {
      // Organization dashboard - use personal stats for now
      const [userStats, userActivity] = await Promise.all([
        getStats(session.user.id),
        getRecentActivity(session.user.id)
      ])
      stats = userStats
      activity = userActivity
    } else if (context.type === 'team' && context.id) {
      // Team dashboard - use personal stats for now
      const [userStats, userActivity] = await Promise.all([
        getStats(session.user.id),
        getRecentActivity(session.user.id)
      ])
      stats = userStats
      activity = userActivity
    } else {
      throw new Error('Invalid context provided')
    }

    return { stats, activity }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    throw new Error('Failed to fetch dashboard analytics')
  }
}