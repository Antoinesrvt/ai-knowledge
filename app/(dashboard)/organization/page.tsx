"use client"

import React, { useState, useEffect } from 'react'
import { OrganizationSettings } from '@/components/organization/OrganizationSettings'
import { toast } from 'sonner'

// Mock data - replace with actual API calls
const mockOrganization = {
  id: 'org-1',
  name: 'Acme Corporation',
  description: 'A leading technology company focused on AI-powered solutions for knowledge management and collaboration.',
  domain: 'acme.com',
  plan: 'pro' as const,
  memberCount: 24,
  teamCount: 4,
  storageUsed: 15 * 1024 * 1024 * 1024, // 15 GB in bytes
  storageLimit: 100 * 1024 * 1024 * 1024, // 100 GB in bytes
  settings: {
    allowGuestAccess: true,
    requireTwoFactor: false,
    allowPublicTeams: true,
    defaultTeamVisibility: 'internal' as const,
    autoArchiveInactiveDays: 90,
    emailNotifications: true,
    slackIntegration: false
  }
}

export default function OrganizationPage() {
  const [organization, setOrganization] = useState(mockOrganization)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateOrganization = async (updates: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update organization data
      setOrganization(prev => ({
        ...prev,
        name: updates.name || prev.name,
        description: updates.description !== undefined ? updates.description : prev.description,
        domain: updates.domain !== undefined ? updates.domain : prev.domain,
        settings: {
          ...prev.settings,
          allowGuestAccess: updates.allowGuestAccess !== undefined ? updates.allowGuestAccess : prev.settings.allowGuestAccess,
          requireTwoFactor: updates.requireTwoFactor !== undefined ? updates.requireTwoFactor : prev.settings.requireTwoFactor,
          allowPublicTeams: updates.allowPublicTeams !== undefined ? updates.allowPublicTeams : prev.settings.allowPublicTeams,
          defaultTeamVisibility: updates.defaultTeamVisibility || prev.settings.defaultTeamVisibility,
          autoArchiveInactiveDays: updates.autoArchiveInactiveDays !== undefined ? updates.autoArchiveInactiveDays : prev.settings.autoArchiveInactiveDays,
          emailNotifications: updates.emailNotifications !== undefined ? updates.emailNotifications : prev.settings.emailNotifications,
          slackIntegration: updates.slackIntegration !== undefined ? updates.slackIntegration : prev.settings.slackIntegration
        }
      }))
      
      toast.success('Organization settings updated successfully')
    } catch (error) {
      toast.error('Failed to update organization settings')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOrganization = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would redirect to a goodbye page or sign out
      toast.success('Organization deletion initiated')
      
      // Simulate redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      toast.error('Failed to delete organization')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <OrganizationSettings
        organization={organization}
        onUpdate={handleUpdateOrganization}
        onDelete={handleDeleteOrganization}
      />
    </div>
  )
}