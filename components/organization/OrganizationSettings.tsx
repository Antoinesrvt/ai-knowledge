"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Building2, Shield, Users, CreditCard, Bell, Trash2, Plus, Settings, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { TeamSettingsModal } from '@/components/teams/TeamSettingsModal'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import type { Organization, Team } from '@/lib/db/schema'

interface OrganizationSettingsProps {
  organization: Organization
  onUpdate: (updates: any) => Promise<void>
  onDelete: () => Promise<void>
}

export function OrganizationSettings({ organization, onUpdate, onDelete }: OrganizationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || '',
    slug: organization.slug,
    plan: organization.plan
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showTeamSettings, setShowTeamSettings] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [organization.id])

  const fetchTeams = async () => {
    try {
      setTeamsLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/organizations/${organization.id}/teams`)
      // const data = await response.json()
      // setTeams(data.teams)
      
      // Mock data for now
      setTeams([
        {
          id: '1',
          organizationId: organization.id,
          name: 'Product Team',
          description: 'Building the next generation of AI-powered knowledge management',
          color: '#3b82f6',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          organizationId: organization.id,
          name: 'Engineering',
          description: 'Core platform development and infrastructure',
          color: '#10b981',
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14')
        }
      ])
    } catch (error) {
      toast.error('Failed to fetch teams')
    } finally {
      setTeamsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate(formData)
      toast.success('Organization settings updated successfully')
    } catch (error) {
      toast.error('Failed to update organization settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsLoading(true)
    try {
      await onDelete()
      toast.success('Organization deleted successfully')
    } catch (error) {
      toast.error('Failed to delete organization')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCreateTeam = () => {
    setShowCreateTeam(true)
  }

  const handleTeamSettings = (team: Team) => {
    setSelectedTeam(team)
    setShowTeamSettings(true)
  }

  const handleTeamUpdate = async (teamId: string, updates: Partial<Team>) => {
    try {
      // TODO: Replace with actual API call
      // await updateTeam(teamId, updates)
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, ...updates } : team
      ))
      toast.success('Team updated successfully')
      setShowTeamSettings(false)
    } catch (error) {
      toast.error('Failed to update team')
    }
  }

  const handleTeamDelete = async (teamId: string) => {
    try {
      // TODO: Replace with actual API call
      // await deleteTeam(teamId)
      setTeams(teams.filter(team => team.id !== teamId))
      toast.success('Team deleted successfully')
      setShowTeamSettings(false)
    } catch (error) {
      toast.error('Failed to delete team')
    }
  }

  // Storage information would need to be calculated separately if needed

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's configuration and preferences
          </p>
        </div>
        <Badge variant={organization.plan === 'enterprise' ? 'default' : 'secondary'}>
          {organization.plan.toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Organization Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="organization-slug"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your organization"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
              <CardDescription>
                Current subscription plan for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Current Plan</Label>
                  <p className="text-sm text-muted-foreground">
                    Your organization's subscription level
                  </p>
                </div>
                <Badge variant={organization.plan === 'enterprise' ? 'default' : 'secondary'}>
                  {organization.plan.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Teams</h3>
              <p className="text-sm text-muted-foreground">
                Manage teams within this organization
              </p>
            </div>
            <Button onClick={handleCreateTeam} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </div>

          {teamsLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No teams yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first team to start collaborating
                </p>
                <Button onClick={handleCreateTeam} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                           className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                           style={{ backgroundColor: team.color || '#6366f1' }}
                         >
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {team.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Created {new Date(team.createdAt).toLocaleDateString()}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleTeamSettings(team)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete this organization and all its data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={showDeleteConfirm ? "destructive" : "outline"}
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete Organization'}
              </Button>
              {showDeleteConfirm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Click again to permanently delete this organization
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Team Settings Modal */}
      {selectedTeam && (
        <TeamSettingsModal
          team={selectedTeam}
          isOpen={showTeamSettings}
          onClose={() => {
            setShowTeamSettings(false)
            setSelectedTeam(null)
          }}
          onSuccess={() => {
            fetchTeams()
            setShowTeamSettings(false)
            setSelectedTeam(null)
          }}
        />
      )}
    </div>
  )
}