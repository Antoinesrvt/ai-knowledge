'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquarePlus, FileText, Plus, Zap, BookOpen, Brain, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

export function QuickActions() {
  const router = useRouter();

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

  const quickActions = [
    {
      title: 'Start New Chat',
      description: 'Begin an AI conversation',
      icon: MessageSquarePlus,
      onClick: handleNewChat,
      variant: 'default' as const,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Create Document',
      description: 'Write and organize knowledge',
      icon: FileText,
      onClick: handleNewDocument,
      variant: 'outline' as const,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Browse Documents',
      description: 'Explore your knowledge base',
      icon: BookOpen,
      onClick: handleViewDocuments,
      variant: 'outline' as const,
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'View Chats',
      description: 'Continue conversations',
      icon: Brain,
      onClick: handleViewChats,
      variant: 'outline' as const,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          Quick Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground">Get started with AI-powered tools</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                onClick={action.onClick}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
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