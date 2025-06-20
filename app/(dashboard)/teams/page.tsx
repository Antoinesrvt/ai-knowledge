"use client"

import React, { useState, useEffect } from 'react'
import { TeamList } from '@/components/team/TeamList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Users, Building2 } from 'lucide-react'
import { toast } from 'sonner'

// Mock data - replace with actual API calls
const mockTeams = [
  {
    id: '1',
    name: 'Product Team',
    description: 'Building the next generation of AI-powered knowledge management',
    memberCount: 8,
    projectCount: 3,
    visibility: 'internal' as const,
    lastActivity: new Date('2024-01-15'),
    role: 'admin' as const,
    avatar: undefined
  },
  {
    id: '2',
    name: 'Engineering',
    description: 'Core platform development and infrastructure',
    memberCount: 12,
    projectCount: 5,
    visibility: 'private' as const,
    lastActivity: new Date('2024-01-14'),
    role: 'member' as const,
    avatar: undefined
  },
  {
    id: '3',
    name: 'Design System',
    description: 'UI/UX design and component library maintenance',
    memberCount: 4,
    projectCount: 2,
    visibility: 'internal' as const,
    lastActivity: new Date('2024-01-13'),
    role: 'viewer' as const,
    avatar: undefined
  },
  {
    id: '4',
    name: 'Marketing',
    description: 'Growth, content, and community engagement',
    memberCount: 6,
    projectCount: 4,
    visibility: 'public' as const,
    lastActivity: new Date('2024-01-12'),
    role: 'member' as const,
    avatar: undefined
  }
]

const mockOrganization = {
  id: 'org-1',
  name: 'Acme Corporation',
  plan: 'pro' as const,
  memberCount: 24,
  teamCount: 4
}

export default function TeamsPage() {
  const [teams, setTeams] = useState(mockTeams)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'internal' | 'private'>('all')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member' | 'viewer'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)

  const filteredTeams = teams.filter(team => {
    if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !team.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filterVisibility !== 'all' && team.visibility !== filterVisibility) {
      return false
    }
    if (filterRole !== 'all' && team.role !== filterRole) {
      return false
    }
    return true
  })

  const handleCreateTeam = async (teamData: {
    name: string
    description: string
    visibility: 'public' | 'internal' | 'private'
  }) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newTeam = {
        id: Date.now().toString(),
        ...teamData,
        memberCount: 1,
        projectCount: 0,
        lastActivity: new Date(),
        role: 'admin' as const,
        avatar: undefined
      }
      
      setTeams(prev => [newTeam, ...prev])
      toast.success('Team created successfully')
    } catch (error) {
      toast.error('Failed to create team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMembers = async (teamId: string, invitations: Array<{
    email: string
    role: 'admin' | 'member' | 'viewer'
  }>) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update team member count
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, memberCount: team.memberCount + invitations.length }
          : team
      ))
      
      toast.success(`Invited ${invitations.length} member(s) successfully`)
    } catch (error) {
      toast.error('Failed to send invitations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTeam = async (teamId: string, updates: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTeams(prev => prev.map(team => 
        team.id === teamId ? { ...team, ...updates } : team
      ))
      
      toast.success('Team updated successfully')
    } catch (error) {
      toast.error('Failed to update team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTeams(prev => prev.filter(team => team.id !== teamId))
      toast.success('Team deleted successfully')
    } catch (error) {
      toast.error('Failed to delete team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {mockOrganization.name}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {mockOrganization.teamCount} teams, {mockOrganization.memberCount} members
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mockOrganization.plan === 'enterprise' ? 'default' : 'secondary'}>
            {mockOrganization.plan.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterVisibility} onValueChange={(value: any) => setFilterVisibility(value)}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
          <SelectTrigger className="w-40">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Teams</span>
          </div>
          <div className="text-2xl font-bold mt-2">{teams.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Your Teams</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {teams.filter(t => t.role === 'admin' || t.role === 'member').length}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Public Teams</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {teams.filter(t => t.visibility === 'public').length}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Admin Rights</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {teams.filter(t => t.role === 'admin').length}
          </div>
        </div>
      </div>

      {/* Team List */}
      <TeamList
        teams={filteredTeams}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateTeam={handleCreateTeam}
        onInviteMembers={handleInviteMembers}
        onUpdateTeam={handleUpdateTeam}
        onDeleteTeam={handleDeleteTeam}
        isLoading={isLoading}
      />

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery || filterVisibility !== 'all' || filterRole !== 'all' 
              ? 'No teams found' 
              : 'No teams yet'
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterVisibility !== 'all' || filterRole !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first team to start collaborating'
            }
          </p>
          {!searchQuery && filterVisibility === 'all' && filterRole === 'all' && (
            <Button onClick={() => {/* Handle create team */}}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>
      )}
    </div>
  )
}