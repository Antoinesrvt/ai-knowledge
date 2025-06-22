'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Plus, 
  Settings, 
  Users, 
  Crown, 
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { useOrganization } from '@/lib/contexts/organization-context'
import { OrganizationSettings } from '@/components/organization/OrganizationSettings'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { updateOrganizationAction } from '@/app/actions'
import type { Organization } from '@/lib/db/schema'

export default function OrganizationsSettingsPage() {
  const { 
    currentOrganization, 
    setCurrentOrganization, 
    organizations, 
    isLoading,
    refreshOrganizations 
  } = useOrganization()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const selectedOrg = organizations.find(org => org.organization.id === selectedOrgId)?.organization

  const handleSwitchOrganization = (orgId: string) => {
    const orgData = organizations.find(o => o.organization.id === orgId)
    if (orgData) {
      setCurrentOrganization(orgData.organization)
      toast.success(`Switched to ${orgData.organization.name}`)
    }
  }

  const handleLeaveOrganization = async (orgId: string) => {
    const orgData = organizations.find(o => o.organization.id === orgId)
    if (orgData) {
      // TODO: Implement leave organization action
      toast.success(`Left ${orgData.organization.name}`)
      await refreshOrganizations()
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'member': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />
      case 'admin': return <Settings className="h-3 w-3" />
      case 'member': return <Users className="h-3 w-3" />
      default: return null
    }
  }

  if (selectedOrgId && selectedOrg) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedOrgId(null)}
            className="flex items-center gap-2"
          >
            ← Back to Organizations
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedOrg.name} Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage settings for {selectedOrg.name}
            </p>
          </div>
        </div>
        
        <OrganizationSettings 
                organization={selectedOrg}
                onUpdate={async (updates) => {
                  try {
                    const formData = new FormData()
                    formData.append('organizationId', selectedOrg.id)
                    formData.append('name', updates.name || selectedOrg.name)
                    formData.append('description', updates.description || selectedOrg.description || '')
                    
                    await updateOrganizationAction(formData)
                    toast.success('Organization updated successfully')
                    await refreshOrganizations()
                  } catch (error) {
                    toast.error('Failed to update organization')
                  }
                }}
                onDelete={async () => {
                  // TODO: Implement delete organization action
                  toast.error('Delete organization not yet implemented')
                }}
              />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground mt-2">
              Loading your organizations...
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organizations and workspaces
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Current Organization */}
      {currentOrganization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Current Organization
            </CardTitle>
            <CardDescription>
              You are currently working in this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentOrganization.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentOrganization.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs">
                      Current
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedOrgId(currentOrganization.id)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Organizations
          </CardTitle>
          <CardDescription>
            Organizations you're a member of
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((orgData) => {
              const org = orgData.organization;
              const role = orgData.role;
              return (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{org.name}</h3>
                      {currentOrganization?.id === org.id && (
                        <Badge className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {org.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={`text-xs ${getRoleColor(role)}`}>
                          {getRoleIcon(role)}
                          <span className="ml-1 capitalize">{role}</span>
                        </Badge>
                      </div>
                      <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentOrganization?.id !== org.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSwitchOrganization(org.id)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Switch
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrgId(org.id)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  
                  {role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleLeaveOrganization(org.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Leave Organization
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Organization Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Organization
            </CardTitle>
            <CardDescription>
              Create a new organization to collaborate with your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Organization Creation</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Organizations help you collaborate with teams and manage access to your projects. You can invite members and assign roles after creation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Organization creation feature coming soon!')
                setShowCreateForm(false)
              }}>
                Create Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Limits</CardTitle>
          <CardDescription>
            Current usage and limits for your organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Organizations</h4>
                <p className="text-sm text-muted-foreground">Number of organizations you can create or join</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">{organizations.length} / 10</div>
                <div className="text-xs text-muted-foreground">Current plan limit</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Members per Organization</h4>
                <p className="text-sm text-muted-foreground">Maximum members you can invite to each organization</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">Unlimited</div>
                <div className="text-xs text-muted-foreground">Pro plan</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}