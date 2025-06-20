"use client"

import React, { useState, useEffect } from 'react'
import { ProjectWorkspace } from '@/components/project/ProjectWorkspace'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Mock data - replace with actual API calls
const mockProject = {
  id: 'proj-1',
  name: 'AI Knowledge Platform',
  description: 'Core platform development for the next-generation knowledge management system with advanced AI capabilities and seamless collaboration features.',
  team: {
    id: 'team-1',
    name: 'Product Team'
  },
  members: [
    { id: '1', name: 'Alice Johnson', email: 'alice@acme.com', avatar: undefined, role: 'admin' as const },
    { id: '2', name: 'Bob Smith', email: 'bob@acme.com', avatar: undefined, role: 'member' as const },
    { id: '3', name: 'Carol Davis', email: 'carol@acme.com', avatar: undefined, role: 'member' as const },
    { id: '4', name: 'David Wilson', email: 'david@acme.com', avatar: undefined, role: 'viewer' as const },
    { id: '5', name: 'Eva Martinez', email: 'eva@acme.com', avatar: undefined, role: 'member' as const },
    { id: '6', name: 'Frank Brown', email: 'frank@acme.com', avatar: undefined, role: 'viewer' as const }
  ],
  documentCount: 24,
  chatCount: 8,
  lastActivity: new Date('2024-01-15')
}

const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Product Requirements Document',
    type: 'document' as const,
    size: 2048576, // 2MB
    lastModified: new Date('2024-01-15'),
    author: {
      id: '1',
      name: 'Alice Johnson',
      avatar: undefined
    },
    tags: ['requirements', 'product', 'planning'],
    isStarred: true,
    isArchived: false
  },
  {
    id: 'doc-2',
    title: 'Technical Architecture Diagram',
    type: 'presentation' as const,
    size: 5242880, // 5MB
    lastModified: new Date('2024-01-14'),
    author: {
      id: '2',
      name: 'Bob Smith',
      avatar: undefined
    },
    tags: ['architecture', 'technical', 'design'],
    isStarred: false,
    isArchived: false
  },
  {
    id: 'doc-3',
    title: 'User Research Findings',
    type: 'pdf' as const,
    size: 3145728, // 3MB
    lastModified: new Date('2024-01-13'),
    author: {
      id: '3',
      name: 'Carol Davis',
      avatar: undefined
    },
    tags: ['research', 'users', 'insights'],
    isStarred: true,
    isArchived: false
  },
  {
    id: 'doc-4',
    title: 'API Documentation',
    type: 'document' as const,
    size: 1048576, // 1MB
    lastModified: new Date('2024-01-12'),
    author: {
      id: '2',
      name: 'Bob Smith',
      avatar: undefined
    },
    tags: ['api', 'documentation', 'technical'],
    isStarred: false,
    isArchived: false
  },
  {
    id: 'doc-5',
    title: 'Design System Guidelines',
    type: 'document' as const,
    size: 4194304, // 4MB
    lastModified: new Date('2024-01-11'),
    author: {
      id: '5',
      name: 'Eva Martinez',
      avatar: undefined
    },
    tags: ['design', 'guidelines', 'ui'],
    isStarred: false,
    isArchived: false
  },
  {
    id: 'doc-6',
    title: 'Performance Metrics Q4',
    type: 'spreadsheet' as const,
    size: 1572864, // 1.5MB
    lastModified: new Date('2024-01-10'),
    author: {
      id: '1',
      name: 'Alice Johnson',
      avatar: undefined
    },
    tags: ['metrics', 'performance', 'analytics'],
    isStarred: false,
    isArchived: false
  },
  {
    id: 'doc-7',
    title: 'Old Project Proposal',
    type: 'document' as const,
    size: 512000, // 500KB
    lastModified: new Date('2023-12-15'),
    author: {
      id: '4',
      name: 'David Wilson',
      avatar: undefined
    },
    tags: ['proposal', 'archived'],
    isStarred: false,
    isArchived: true
  }
]

const mockChats = [
  {
    id: 'chat-1',
    title: 'Product Planning Discussion',
    lastMessage: 'Let\'s schedule the next sprint planning meeting for tomorrow',
    lastActivity: new Date('2024-01-15'),
    participants: 4,
    isActive: true
  },
  {
    id: 'chat-2',
    title: 'Technical Architecture Review',
    lastMessage: 'The new microservices approach looks promising',
    lastActivity: new Date('2024-01-14'),
    participants: 3,
    isActive: true
  },
  {
    id: 'chat-3',
    title: 'User Feedback Analysis',
    lastMessage: 'Great insights from the latest user interviews',
    lastActivity: new Date('2024-01-13'),
    participants: 2,
    isActive: false
  },
  {
    id: 'chat-4',
    title: 'Design System Updates',
    lastMessage: 'New components are ready for review',
    lastActivity: new Date('2024-01-12'),
    participants: 3,
    isActive: false
  },
  {
    id: 'chat-5',
    title: 'Performance Optimization',
    lastMessage: 'Database queries are now 40% faster',
    lastActivity: new Date('2024-01-11'),
    participants: 2,
    isActive: false
  }
]

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState(mockProject)
  const [documents, setDocuments] = useState(mockDocuments)
  const [chats, setChats] = useState(mockChats)
  const [isLoading, setIsLoading] = useState(false)

  // In a real app, you would fetch project data based on the ID
  useEffect(() => {
    // Simulate API call to fetch project data
    const fetchProject = async () => {
      setIsLoading(true)
      try {
        // await api.getProject(projectId)
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        toast.error('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleCreateDocument = async () => {
    try {
      toast.success('Document creation feature coming soon!')
      // In a real app, this would open a document creation modal or redirect
    } catch (error) {
      toast.error('Failed to create document')
    }
  }

  const handleCreateChat = async () => {
    try {
      toast.success('Chat creation feature coming soon!')
      // In a real app, this would open a chat creation modal
    } catch (error) {
      toast.error('Failed to create chat')
    }
  }

  const handleDocumentClick = (document: any) => {
    toast.info(`Opening document: ${document.title}`)
    // In a real app, this would navigate to the document viewer/editor
  }

  const handleChatClick = (chat: any) => {
    toast.info(`Opening chat: ${chat.title}`)
    // In a real app, this would navigate to the chat interface
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Project Workspace */}
      <ProjectWorkspace
        project={project}
        documents={documents}
        chats={chats}
        onCreateDocument={handleCreateDocument}
        onCreateChat={handleCreateChat}
        onDocumentClick={handleDocumentClick}
        onChatClick={handleChatClick}
      />
    </div>
  )
}