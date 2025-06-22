'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextStatsProps {
  documentsCount: number;
  chatsCount: number;
  contextType: 'personal' | 'organization' | 'team';
}

export function ContextStats({ documentsCount, chatsCount, contextType }: ContextStatsProps) {
  const stats = [
    {
      title: 'Documents',
      value: documentsCount,
      icon: FileText,
      description: getDocumentsDescription(contextType),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Chats',
      value: chatsCount,
      icon: MessageSquare,
      description: getChatsDescription(contextType),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Items',
      value: documentsCount + chatsCount,
      icon: TrendingUp,
      description: getTotalDescription(contextType),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function getDocumentsDescription(contextType: 'personal' | 'organization' | 'team'): string {
  switch (contextType) {
    case 'personal':
      return 'Your personal documents';
    case 'organization':
      return 'Organization documents';
    case 'team':
      return 'Team documents';
    default:
      return 'Total documents';
  }
}

function getChatsDescription(contextType: 'personal' | 'organization' | 'team'): string {
  switch (contextType) {
    case 'personal':
      return 'Your personal chats';
    case 'organization':
      return 'Organization chats';
    case 'team':
      return 'Team chats';
    default:
      return 'Total chats';
  }
}

function getTotalDescription(contextType: 'personal' | 'organization' | 'team'): string {
  switch (contextType) {
    case 'personal':
      return 'All your content';
    case 'organization':
      return 'All organization content';
    case 'team':
      return 'All team content';
    default:
      return 'Total content items';
  }
}