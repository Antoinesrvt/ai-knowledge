'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentGrid } from '@/components/document-grid';
import { ChatGrid } from '@/components/chat-grid';
import type { Document, Chat } from '@/lib/db/schema';

interface ContentTabsProps {
  documents: Document[];
  chats: Chat[];
}

export function ContentTabs({ documents, chats }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <Tabs
      defaultValue="documents"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Your Content</h2>
        <TabsList className="grid w-[300px] grid-cols-2">
          <TabsTrigger value="documents" className="relative">
            Documents
            {documents.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {documents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="chats" className="relative">
            Chats
            {chats.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {chats.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="documents" className="space-y-4">
        <DocumentGrid documents={documents} />
      </TabsContent>

      <TabsContent value="chats" className="space-y-4">
        <ChatGrid chats={chats} />
      </TabsContent>
    </Tabs>
  );
}