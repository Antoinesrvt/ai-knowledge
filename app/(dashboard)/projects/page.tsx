"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  Users, 
  Calendar,
  Grid3X3,
  List,
  Star,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// Mock data - replace with actual API calls
const mockProjects = [
  {
    id: 'proj-1',
    name: 'AI Knowledge Platform',
    description: 'Core platform development for the next-generation knowledge management system',
    team: {
      id: 'team-1',
      name: 'Product Team'
    },
    members: [
      { id: '1', name: 'Alice Johnson', email: 'alice@acme.com', avatar: undefined, role: 'admin' as const },
      { id: '2', name: 'Bob Smith', email: 'bob@acme.com', avatar: undefined, role: 'member' as const },
      { id: '3', name: 'Carol Davis', email: 'carol@acme.com', avatar: undefined, role: 'member' as const },
      { id: '4', name: 'David Wilson', email: 'david@acme.com', avatar: undefined, role: 'viewer' as const }
    ],
    documentCount: 24,
    chatCount: 8,
    lastActivity: new Date('2024-01-15'),
    isStarred: true,
    status: 'active' as const
  },
  {
    id: 'proj-2',
    name: 'Design System v2',
    description: 'Complete redesign of our component library and design tokens',
    team: {
      id: 'team-2',
      name: 'Design System'
    },
    members: [
      { id: '5', name: 'Eva Martinez', email: 'eva@acme.com', avatar: undefined, role: 'admin' as const },
      { id: '6', name: 'Frank Brown', email: 'frank@acme.com', avatar: undefined, role: 'member' as const }
    ],
    documentCount: 18,
    chatCount: 5,
    lastActivity: new Date('2024-01-14'),
    isStarred: false,
    status: 'active' as const
  },
  {
    id: 'proj-3',
    name: 'Mobile App',
    description: 'Native mobile application for iOS and Android platforms',
    team: {
      id: 'team-1',
      name: 'Engineering'
    },
    members: [
      { id: '7', name: 'Grace Lee', email: 'grace@acme.com', avatar: undefined, role: 'admin' as const },
      { id: '8', name: 'Henry Taylor', email: 'henry@acme.com', avatar: undefined, role: 'member' as const },
      { id: '9', name: 'Ivy Chen', email: 'ivy@acme.com', avatar: undefined, role: 'member' as const }
    ],
    documentCount: 12,
    chatCount: 3,
    lastActivity: new Date('2024-01-13'),
    isStarred: true,
    status: 'planning' as const
  },
  {
    id: 'proj-4',
    name: 'Marketing Website',
    description: 'New company website with improved SEO and conversion optimization',
    team: {
      id: 'team-3',
      name: 'Marketing'
    },
    members: [
      { id: '10', name: 'Jack Anderson', email: 'jack@acme.com', avatar: undefined, role: 'admin' as const },
      { id: '11', name: 'Kate Miller', email: 'kate@acme.com', avatar: undefined, role: 'member' as const }
    ],
    documentCount: 8,
    chatCount: 2,
    lastActivity: new Date('2024-01-10'),
    isStarred: false,
    status: 'completed' as const
  }
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'planning' | 'completed'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'documents'>('activity')

  const teams = Array.from(new Set(projects.map(p => p.team.name)))

  const filteredProjects = projects
    .filter(project => {
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !project.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filterTeam !== 'all' && project.team.name !== filterTeam) {
        return false
      }
      if (filterStatus !== 'all' && project.status !== filterStatus) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'documents':
          return b.documentCount - a.documentCount
        case 'activity':
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      }
    })

  const handleToggleStar = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, isStarred: !project.isStarred }
        : project
    ))
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'planning': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'planning': return 'secondary'
      case 'completed': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Organize your work into focused project workspaces
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map(team => (
              <SelectItem key={team} value={team}>{team}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activity">Last Activity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Projects</span>
          </div>
          <div className="text-2xl font-bold mt-2">{projects.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-green-500 rounded-full" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {projects.filter(p => p.status === 'active').length}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">Starred</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {projects.filter(p => p.isStarred).length}
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Members</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {projects.reduce((sum, p) => sum + p.members.length, 0)}
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline">{project.team.name}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleStar(project.id)
                    }}
                  >
                    <Star className={`h-4 w-4 ${project.isStarred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
                <CardTitle className="text-lg">
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{project.documentCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{project.members.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(project.lastActivity)}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 4 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor(project.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          <Link href={`/projects/${project.id}`} className="hover:underline">
                            {project.name}
                          </Link>
                        </h3>
                        {project.isStarred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <Badge variant="outline">{project.team.name}</Badge>
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-4 w-4" />
                      <span>{project.documentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.members.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(project.lastActivity)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleStar(project.id)
                      }}
                    >
                      <Star className={`h-4 w-4 ${project.isStarred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery || filterTeam !== 'all' || filterStatus !== 'all'
              ? 'No projects found'
              : 'No projects yet'
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterTeam !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first project to organize your work'
            }
          </p>
          {!searchQuery && filterTeam === 'all' && filterStatus === 'all' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  )
}