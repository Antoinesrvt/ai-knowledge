'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@/lib/contexts/organization-context';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  Upload,
  Zap,
  BookOpen,
  Brain
} from 'lucide-react';
import { generateUUID } from '@/lib/utils';

interface QuickActionsProps {
  contextType: 'personal' | 'organization' | 'team';
}

export function QuickActions({ contextType }: QuickActionsProps) {
  const router = useRouter();
  const { canCreateContent, canManageOrganization, canManageTeam } = useOrganization();

  const handleNewChat = () => {
    const chatId = generateUUID();
    router.push(`/chat/${chatId}`);
  };

  const handleNewDocument = () => {
    router.push('/documents/new');
  };

  const handleViewDocuments = () => {
    router.push('/documents');
  };

  const handleViewChats = () => {
    router.push('/chats');
  };

  const getActions = () => {
    const baseActions = [
      {
        title: 'New Chat',
        description: 'Start a new conversation',
        icon: MessageSquare,
        onClick: handleNewChat,
        variant: 'default' as const,
        enabled: canCreateContent,
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        title: 'New Document',
        description: 'Create a new document',
        icon: FileText,
        onClick: handleNewDocument,
        variant: 'outline' as const,
        enabled: canCreateContent,
        gradient: 'from-green-500 to-emerald-500',
      },
      {
        title: 'Browse Documents',
        description: 'Explore your knowledge base',
        icon: BookOpen,
        onClick: handleViewDocuments,
        variant: 'outline' as const,
        enabled: true,
        gradient: 'from-purple-500 to-pink-500',
      },
    ];

    const contextSpecificActions = [];

    if (contextType === 'personal') {
      contextSpecificActions.push(
        {
          title: 'Upload Files',
          description: 'Upload documents to your library',
          icon: Upload,
          onClick: () => router.push('/documents/upload'),
          variant: 'outline' as const,
          enabled: canCreateContent,
          gradient: 'from-orange-500 to-red-500',
        }
      );
    }

    if (contextType === 'organization') {
      contextSpecificActions.push(
        {
          title: 'Invite Members',
          description: 'Invite people to your organization',
          icon: Users,
          onClick: () => router.push('/organization/members'),
          variant: 'outline' as const,
          enabled: canManageOrganization,
          gradient: 'from-indigo-500 to-blue-500',
        },
        {
          title: 'Organization Settings',
          description: 'Manage organization settings',
          icon: Settings,
          onClick: () => router.push('/organization/settings'),
          variant: 'ghost' as const,
          enabled: canManageOrganization,
          gradient: 'from-gray-500 to-slate-500',
        }
      );
    }

    if (contextType === 'team') {
      contextSpecificActions.push(
        {
          title: 'Team Members',
          description: 'Manage team members',
          icon: Users,
          onClick: () => router.push('/team/members'),
          variant: 'outline' as const,
          enabled: canManageTeam,
          gradient: 'from-teal-500 to-green-500',
        },
        {
          title: 'Team Settings',
          description: 'Configure team settings',
          icon: Settings,
          onClick: () => router.push('/team/settings'),
          variant: 'ghost' as const,
          enabled: canManageTeam,
          gradient: 'from-gray-500 to-slate-500',
        }
      );
    }

    return [...baseActions, ...contextSpecificActions].filter(action => action.enabled);
  };

  const quickActions = getActions();

  if (quickActions.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <Zap className="h-4 w-4" />
          </div>
          Quick Actions
        </CardTitle>
        <CardDescription>
          {getContextDescription(contextType)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant={action.variant}
                onClick={action.onClick}
                className="h-auto p-4 flex flex-col items-center gap-3 text-center group transition-all duration-200 hover:scale-105"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white group-hover:shadow-lg transition-shadow`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getContextDescription(contextType: 'personal' | 'organization' | 'team'): string {
  switch (contextType) {
    case 'personal':
      return 'Manage your personal content and settings';
    case 'organization':
      return 'Create content and manage your organization';
    case 'team':
      return 'Collaborate with your team and manage team resources';
    default:
      return 'Quick actions for your current context';
  }
}