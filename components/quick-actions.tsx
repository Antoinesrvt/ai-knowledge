'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquarePlus, FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

export function QuickActions() {
  const router = useRouter();

  const handleNewChat = () => {
    const chatId = generateUUID();
    router.push(`/chat/${chatId}`);
  };

  const handleNewDocument = () => {
    // For now, redirect to documents page where user can create a new document
    router.push('/documents/new');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start"
          variant="outline"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Start New Chat
        </Button>
        
        <Button
          onClick={handleNewDocument}
          className="w-full justify-start"
          variant="outline"
        >
          <FileText className="mr-2 h-4 w-4" />
          Create Document
        </Button>
      </CardContent>
    </Card>
  );
}