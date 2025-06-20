'use client';

import { useState } from 'react';
import { PanelResizeHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from '@/components/tiptap-editor';
import { Chat } from '@/components/chat';
import { FileIcon, MessageSquareIcon, SplitIcon, ArrowLeftIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import type { Document } from '@/lib/db/schema';
import { usePendingChanges } from '@/hooks/use-pending-changes';
import { useDocumentChatLink } from '@/hooks/use-document-chat-link';
import { GuestAccessBanner } from '@/components/guest-access-banner';
import type { UserType } from '@/lib/auth-utils';

interface SplitViewProps {
  document: Document;
  userId: string;
  isOwner: boolean;
  onSave: (title: string, content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
  onBack?: () => void;
  session?: any;
  isReadOnly?: boolean;
  userType?: UserType;
}

type ViewMode = 'document' | 'chat' | 'split';

export function SplitView({ 
  document, 
  userId, 
  isOwner, 
  onSave, 
  onDelete, 
  isDeleting = false, 
  onBack, 
  session,
  isReadOnly = false,
  userType = 'unauthenticated'
}: SplitViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('document');
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isInverted, setIsInverted] = useState(false);

  // Custom hooks for managing document-chat linking and pending changes
  const { chatId: linkedChatId, isLoading: isLinkLoading, createAndLinkChat } = useDocumentChatLink({
    documentId: document.id,
    documentCreatedAt: document.createdAt,
    autoCreateChat: true
  });

  const { pendingChanges, acceptChange, rejectChange } = usePendingChanges({
    documentId: document.id,
    documentCreatedAt: document.createdAt,
    onContentUpdate: setContent,
  });



  const handleSave = async () => {
    if (isReadOnly) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave(title, content);
    } finally {
      setIsSaving(false);
    }
  };



  const renderDocumentView = () => (
    <div className="flex flex-col h-full bg-background">
      {/* Pending Changes Bar */}
      {pendingChanges.length > 0 && (
        <div className="border-b bg-yellow-50 dark:bg-yellow-900/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {pendingChanges.length} pending change{pendingChanges.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              {pendingChanges.map((change) => (
                <div key={change.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded px-2 py-1 border">
                  <span className="text-xs text-muted-foreground truncate max-w-32">
                    {change.description}
                  </span>
                  <Button
                     size="sm"
                     variant="ghost"
                     onClick={() => acceptChange(change.id)}
                     className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                   >
                     <CheckIcon size={12} />
                   </Button>
                   <Button
                     size="sm"
                     variant="ghost"
                     onClick={() => rejectChange(change.id)}
                     className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                   >
                     <XIcon size={12} />
                   </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        <TiptapEditor
          content={content}
          onChange={isOwner && !isReadOnly ? setContent : () => {}}
          placeholder={isOwner && !isReadOnly ? "Start writing your document..." : "This document is read-only"}
          className="min-h-full py-8"
          editable={isOwner && !isReadOnly}
        />
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className="h-full">
      {linkedChatId && !isLinkLoading ? (
        <Chat
          key={`chat-${linkedChatId}`}
          id={linkedChatId}
          initialMessages={[]}
          initialChatModel="gpt-4o-mini"
          initialVisibilityType="private"
          isReadonly={!isOwner || isReadOnly}
          session={session}
          autoResume={false}
          userType={userType}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <MessageSquareIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>{isLinkLoading ? 'Initializing chat...' : 'Chat not available'}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Unified Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 flex items-center justify-between gap-4">
          {/* Left Section: Navigation & Title */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2 hover:bg-muted/70 transition-colors duration-200 shrink-0"
              >
                <ArrowLeftIcon size={16} />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            
            {/* Smart Title Management */}
            <div className="min-w-0 flex-1">
              {viewMode === 'document' && isOwner && !isReadOnly ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-muted-foreground focus:ring-0 truncate"
                  placeholder="Untitled Document"
                />
              ) : (
                <h1 className="text-xl font-semibold text-foreground truncate">
                  {title || 'Untitled Document'}
                </h1>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>Created {new Date(document.createdAt).toLocaleDateString()}</span>
                {viewMode === 'document' && (
                  <span className="text-blue-600 dark:text-blue-400">• Editing</span>
                )}
                {viewMode === 'chat' && (
                  <span className="text-green-600 dark:text-green-400">• Chat Mode</span>
                )}
                {viewMode === 'split' && (
                  <span className="text-purple-600 dark:text-purple-400">• Split View</span>
                )}
              </div>
            </div>
          </div>

          {/* Center Section: View Mode Selector */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'document' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('document')}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                viewMode === 'document' ? 'shadow-sm' : 'hover:bg-background/80'
              )}
            >
              <FileIcon size={14} />
              <span className="hidden lg:inline">Document</span>
              {pendingChanges.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingChanges.length}
                </span>
              )}
            </Button>
            <Button
              variant={viewMode === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('chat')}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                viewMode === 'chat' ? 'shadow-sm' : 'hover:bg-background/80'
              )}
            >
              <MessageSquareIcon size={14} />
              <span className="hidden lg:inline">Chat</span>
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                viewMode === 'split' ? 'shadow-sm' : 'hover:bg-background/80'
              )}
            >
              <SplitIcon size={14} />
              <span className="hidden lg:inline">Split</span>
            </Button>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === 'split' && (
              <Button
                onClick={() => setIsInverted(!isInverted)}
                variant="ghost"
                size="sm"
                className="transition-all duration-200"
                title="Invert panels"
              >
                <SplitIcon size={16} className={cn("transition-transform", isInverted && "rotate-180")} />
              </Button>
            )}
            {viewMode === 'document' && isOwner && !isReadOnly && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="transition-all duration-200"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
            {onDelete && isOwner && !isReadOnly && (
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashIcon size={16} />
                )}
                <span className="hidden sm:inline">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile View Mode Selector */}
        <div className="md:hidden border-t p-2 flex gap-1 overflow-x-auto">
          <Button
            variant={viewMode === 'document' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('document')}
            className="flex items-center gap-2 shrink-0"
          >
            <FileIcon size={16} />
            Document
          </Button>
          <Button
            variant={viewMode === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('chat')}
            className="flex items-center gap-2 shrink-0"
          >
            <MessageSquareIcon size={16} />
            Chat
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            className="flex items-center gap-2 shrink-0"
          >
            <SplitIcon size={16} />
            Split View
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'document' && renderDocumentView()}
        {viewMode === 'chat' && renderChatView()}
        {viewMode === 'split' && (
          <PanelGroup direction="horizontal" className="h-full">
            {!isInverted ? (
              <>
                <Panel defaultSize={50} minSize={30}>
                  {renderDocumentView()}
                </Panel>
                <PanelResizeHandle className="w-2 bg-border hover:bg-muted transition-colors" />
                <Panel defaultSize={50} minSize={30}>
                  {renderChatView()}
                </Panel>
              </>
            ) : (
              <>
                <Panel defaultSize={50} minSize={30}>
                  {renderChatView()}
                </Panel>
                <PanelResizeHandle className="w-2 bg-border hover:bg-muted transition-colors" />
                <Panel defaultSize={50} minSize={30}>
                  {renderDocumentView()}
                </Panel>
              </>
            )}
          </PanelGroup>
        )}
      </div>
    </div>
  );
}