"use client"

import React, { useState } from 'react'
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
import { AlertTriangle, Building2, Shield, Users, CreditCard, Bell, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface OrganizationSettingsProps {
  organization: {
    id: string
    name: string
    description?: string
    domain?: string
    plan: 'free' | 'pro' | 'enterprise'
    memberCount: number
    teamCount: number
    storageUsed: number
    storageLimit: number
    settings: {
      allowGuestAccess: boolean
      requireTwoFactor: boolean
      allowPublicTeams: boolean
      defaultTeamVisibility: 'private' | 'internal' | 'public'
      autoArchiveInactiveDays: number
      emailNotifications: boolean
      slackIntegration: boolean
    }
  }
  onUpdate: (updates: any) => Promise<void>
  onDelete: () => Promise<void>
}

export function OrganizationSettings({ organization, onUpdate, onDelete }: OrganizationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || '',
    domain: organization.domain || '',
    ...organization.settings
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const storagePercentage = (organization.storageUsed / organization.storageLimit) * 100

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="company.com"
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
              <CardTitle>Team Defaults</CardTitle>
              <CardDescription>
                Default settings for new teams in your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Public Teams</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow teams to be visible to anyone on the internet
                  </p>
                </div>
                <Switch
                  checked={formData.allowPublicTeams}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, allowPublicTeams: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Default Team Visibility</Label>
                <Select
                  value={formData.defaultTeamVisibility}
                  onValueChange={(value: 'private' | 'internal' | 'public') => 
                    setFormData({ ...formData, defaultTeamVisibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require all members to enable 2FA
                  </p>
                </div>
                <Switch
                  checked={formData.requireTwoFactor}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, requireTwoFactor: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Guest Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow non-members to access public content
                  </p>
                </div>
                <Switch
                  checked={formData.allowGuestAccess}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, allowGuestAccess: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Auto-archive Inactive Content</Label>
                <Select
                  value={formData.autoArchiveInactiveDays.toString()}
                  onValueChange={(value) => 
                    setFormData({ ...formData, autoArchiveInactiveDays: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Overview</CardTitle>
              <CardDescription>
                Current organization membership statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{organization.memberCount}</div>
                  <div className="text-sm text-muted-foreground">Total Members</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{organization.teamCount}</div>
                  <div className="text-sm text-muted-foreground">Active Teams</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                Monitor your organization's storage consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Used: {(organization.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                  <span>Limit: {(organization.storageLimit / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      storagePercentage > 90 ? 'bg-red-500' : 
                      storagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {storagePercentage.toFixed(1)}% of storage used
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how your organization receives notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Slack Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to Slack channels
                  </p>
                </div>
                <Switch
                  checked={formData.slackIntegration}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, slackIntegration: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
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

        <div className="flex gap-2">
          <Button variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}