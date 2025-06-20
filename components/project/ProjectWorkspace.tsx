"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  Plus, 
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Star,
  Archive
} from 'lucide-react'
import { toast } from 'sonner'

interface Document {
  id: string
  title: string
  type: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image'
  size: number
  lastModified: Date
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  isStarred: boolean
  isArchived: boolean
}

interface Chat {
  id: string
  title: string
  lastMessage: string
  lastActivity: Date
  participants: number
  isActive: boolean
}

interface ProjectWorkspaceProps {
  project: {
    id: string
    name: string
    description?: string
    team: {
      id: string
      name: string
    }
    members: Array<{
      id: string
      name: string
      email: string
      avatar?: string
      role: 'admin' | 'member' | 'viewer'
    }>
    documentCount: number
    chatCount: number
    lastActivity: Date
  }
  documents: Document[]
  chats: Chat[]
  onCreateDocument: () => void
  onCreateChat: () => void
  onDocumentClick: (document: Document) => void
  onChatClick: (chat: Chat) => void
}

export function ProjectWorkspace({ 
  project, 
  documents, 
  chats, 
  onCreateDocument, 
  onCreateChat,
  onDocumentClick,
  onChatClick 
}: ProjectWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('modified')
  const [showArchived, setShowArchived] = useState(false)

  const filteredDocuments = documents
    .filter(doc => {
      if (showArchived !== doc.isArchived) return false
      if (filterType !== 'all' && doc.type !== filterType) return false
      if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'size':
          return b.size - a.size
        case 'modified':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
    })

  const filteredChats = chats
    .filter(chat => 
      !searchQuery || chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />
      case 'spreadsheet': return <Grid3X3 className="h-4 w-4" />
      case 'presentation': return <FileText className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'image': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{project.team.name}</Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {project.documentCount} documents, {project.chatCount} chats
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Last activity {formatDate(project.lastActivity)}
            </span>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{project.members.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents and chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
            <SelectItem value="presentation">Presentations</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="image">Images</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modified">Last Modified</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
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

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Documents ({filteredDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chats ({filteredChats.length})
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({project.members.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={showArchived ? 'outline' : 'default'}
                size="sm"
                onClick={() => setShowArchived(false)}
              >
                Active
              </Button>
              <Button
                variant={showArchived ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(true)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archived
              </Button>
            </div>
            <Button onClick={onCreateDocument}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((document) => (
                <Card 
                  key={document.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onDocumentClick(document)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(document.type)}
                        <Badge variant="outline" className="text-xs">
                          {document.type}
                        </Badge>
                      </div>
                      {document.isStarred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{document.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={document.author.avatar} />
                          <AvatarFallback className="text-xs">
                            {document.author.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{document.author.name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatDate(document.lastModified)}</span>
                        <span>{formatFileSize(document.size)}</span>
                      </div>
                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {document.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{document.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => (
                <Card 
                  key={document.id} 
                  className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => onDocumentClick(document)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(document.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{document.title}</h3>
                            {document.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={document.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {document.author.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{document.author.name}</span>
                            </div>
                            <span>{formatDate(document.lastModified)}</span>
                            <span>{formatFileSize(document.size)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{document.type}</Badge>
                        {document.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first document'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateDocument}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chats" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={onCreateChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <Card 
                key={chat.id} 
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onChatClick(chat)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <MessageSquare className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{chat.title}</h3>
                          {chat.isActive && (
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{chat.participants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(chat.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChats.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No chats found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Start a conversation with your team'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateChat}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}