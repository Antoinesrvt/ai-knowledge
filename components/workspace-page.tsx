'use client';

import React, { useEffect } from 'react';
import { PanelResizeHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from '@/components/tiptap-editor';
import { ChatContent } from '@/components/chat-content';
import { 
  FileIcon, 
  MessageSquareIcon, 
  SplitIcon, 
  ArrowLeftIcon, 
  TrashIcon, 
  CheckIcon, 
  XIcon,
  PanelLeftIcon,
  PanelRightIcon,
  MaximizeIcon,
  MinimizeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, Chat } from '@/lib/db/schema';
import { useWorkspaceState } from '@/hooks/use-workspace-state';
import { usePendingChanges } from '@/hooks/use-pending-changes';
import { ChatHeader } from '@/components/chat-header';
import type { VisibilityType } from '@/components/visibility-selector';
import { GuestAccessBanner } from '@/components/guest-access-banner';
import type { UserType } from '@/lib/auth-utils';
import type { WorkspaceEntryType, WorkspaceViewMode } from '@/lib/workspace-utils';
import { toast } from 'sonner';

interface WorkspacePageProps {
  entryType: WorkspaceEntryType;
  entryId: string;
  workspaceData: any;
  userId: string;
  isOwner: boolean;
  onSave?: (title: string, content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
  onBack?: () => void;
  session?: any;
  isReadOnly?: boolean;
  userType?: UserType;
  viewMode?: WorkspaceViewMode;
}

// Internal component that uses the workspace state
function WorkspaceContent({ 
  entryType,
  entryId,
  workspaceData,
  userId, 
  isOwner,
  onDelete, 
  isDeleting = false, 
  onBack, 
  session,
  isReadOnly = false,
  userType,
  viewMode: initialViewMode
}: WorkspacePageProps) {
  const workspace = useWorkspaceState({
    entryType,
    entryId,
    workspaceData,
    userId,
    isOwner,
    isReadOnly,
  });
  
  const {
    viewMode,
    panelFocus,
    documentData,
    documentTitle,
    documentContent,
    documentIsDirty,
    documentIsSaving,
    chatData,
    activeChatId,
    updateDocumentTitle,
    updateDocumentContent,
    saveDocument,
    setViewMode,
    setPanelFocus,
    setActiveChatId,
    createMainChat,
  } = workspace;

  // Integrate with existing hooks for document-specific features
  const { pendingChanges, acceptChange, rejectChange } = usePendingChanges({
    documentId: documentData?.id,
    documentCreatedAt: documentData?.createdAt,
    onContentUpdate: updateDocumentContent,
  });

  // Auto-save with debouncing
  useEffect(() => {
    if (!documentIsDirty || isReadOnly || !documentData) return;
    
    const timer = setTimeout(() => {
      saveDocument().catch(err => {
        toast.error('Failed to save document');
        console.error('Auto-save failed:', err);
      });
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [documentIsDirty, saveDocument, isReadOnly, documentData]);

  // Smart panel sizing based on focus
  const getPanelSizes = () => {
    switch (panelFocus) {
      case 'document':
        return { document: 70, chat: 30 };
      case 'chat':
        return { document: 30, chat: 70 };
      default:
        return { document: 50, chat: 50 };
    }
  };

  const handleCreateChat = async () => {
    if (!activeChatId && entryType === 'document') {
      try {
        const newChatId = await createMainChat(documentTitle || 'Document Chat');
        if (newChatId) {
          setActiveChatId(newChatId);
          if (viewMode === 'document') {
            setViewMode('split');
          }
        }
      } catch (error) {
        toast.error('Failed to create chat');
      }
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
          content={documentContent}
          onChange={isOwner && !isReadOnly ? updateDocumentContent : () => {}}
          placeholder={isOwner && !isReadOnly ? "Start writing your document..." : "This document is read-only"}
          className="min-h-full py-8"
          editable={isOwner && !isReadOnly}
        />
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className="h-full flex flex-col">
      {activeChatId ? (
        <>
          {/* Chat without its own header since we have unified header */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            <ChatContent
              key={`chat-${activeChatId}`}
              id={activeChatId}
              initialMessages={[]}
              initialChatModel="gpt-4o-mini"
              initialVisibilityType="private"
              isReadonly={!isOwner || isReadOnly}
              session={session}
              autoResume={false}
              userType={userType}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <MessageSquareIcon size={48} className="mx-auto mb-4 opacity-50" />
            {entryType === 'document' ? (
              <div className="space-y-4">
                <p>No chat linked to this document</p>
                <Button onClick={handleCreateChat} size="sm">
                  Create Chat
                </Button>
              </div>
            ) : (
              <p>Chat not found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const panelSizes = getPanelSizes();

  return (
    <div className="flex flex-col h-full">
      {/* Unified Workspace Header */}
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
              {viewMode !== 'chat' && isOwner && !isReadOnly && documentData ? (
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => updateDocumentTitle(e.target.value)}
                  className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-muted-foreground focus:ring-0 truncate"
                  placeholder="Untitled Document"
                />
              ) : (
                <h1 className="text-xl font-semibold text-foreground truncate">
                  {entryType === 'document' ? (documentTitle || 'Untitled Document') : (chatData?.title || 'Chat')}
                </h1>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>Created {new Date((documentData || chatData)?.createdAt).toLocaleDateString()}</span>
                {documentIsDirty && (
                  <span className="text-orange-600 dark:text-orange-400">• Unsaved changes</span>
                )}
                {documentIsSaving && (
                  <span className="text-blue-600 dark:text-blue-400">• Saving...</span>
                )}
                {viewMode === 'document' && (
                  <span className="text-blue-600 dark:text-blue-400">• Document</span>
                )}
                {viewMode === 'chat' && activeChatId && (
                  <span className="text-green-600 dark:text-green-400">• Chat</span>
                )}
                {viewMode === 'split' && (
                  <span className="text-purple-600 dark:text-purple-400">• Split View</span>
                )}
              </div>
            </div>
          </div>

          {/* Center Section: Smart View Controls & Chat Settings */}
          <div className="hidden md:flex items-center gap-3">
            {/* View Mode Controls */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
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
                onClick={() => activeChatId ? setViewMode('chat') : handleCreateChat()}
                className={cn(
                  "flex items-center gap-2 transition-all duration-200",
                  viewMode === 'chat' ? 'shadow-sm' : 'hover:bg-background/80'
                )}
              >
                <MessageSquareIcon size={14} />
                <span className="hidden lg:inline">{activeChatId ? 'Chat' : 'Create Chat'}</span>
                {!activeChatId && entryType === 'document' && (
                  <span className="text-xs opacity-60">(New)</span>
                )}
              </Button>
              {activeChatId && (
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
              )}
            </div>

            {/* Chat Settings (when chat is active) */}
            {activeChatId && (viewMode === 'chat' || viewMode === 'split') && (
              <div className="border-l pl-3 ml-1">
                <ChatHeader
                  chatId={activeChatId}
                  selectedModelId="gpt-4o-mini"
                  selectedVisibilityType="private"
                  isReadonly={!isOwner || isReadOnly}
                  session={session}
                  compact={true}
                />
              </div>
            )}
          </div>

          {/* Right Section: Actions & Focus Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === 'split' && activeChatId && (
              <div className="hidden lg:flex items-center gap-1 bg-muted/30 rounded p-1">
                <Button
                  onClick={() => setPanelFocus('document')}
                  variant={panelFocus === 'document' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  title="Focus document"
                >
                  <PanelLeftIcon size={12} />
                </Button>
                <Button
                  onClick={() => setPanelFocus('balanced')}
                  variant={panelFocus === 'balanced' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  title="Balanced view"
                >
                  <MaximizeIcon size={12} />
                </Button>
                <Button
                  onClick={() => setPanelFocus('chat')}
                  variant={panelFocus === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  title="Focus chat"
                >
                  <PanelRightIcon size={12} />
                </Button>
              </div>
            )}
            {isOwner && !isReadOnly && documentData && (
              <Button
                onClick={saveDocument}
                disabled={documentIsSaving || !documentIsDirty}
                size="sm"
                className="transition-all duration-200"
              >
                {documentIsSaving ? 'Saving...' : documentIsDirty ? 'Save' : 'Saved'}
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
            onClick={() => activeChatId ? setViewMode('chat') : handleCreateChat()}
            className="flex items-center gap-2 shrink-0"
          >
            <MessageSquareIcon size={16} />
            {activeChatId ? 'Chat' : 'Create Chat'}
          </Button>
          {activeChatId && (
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="flex items-center gap-2 shrink-0"
            >
              <SplitIcon size={16} />
              Split View
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'document' && renderDocumentView()}
        {viewMode === 'chat' && renderChatView()}
        {viewMode === 'split' && activeChatId && (
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={panelSizes.document} minSize={25}>
              {renderDocumentView()}
            </Panel>
            <PanelResizeHandle className="w-2 bg-border hover:bg-muted transition-colors" />
            <Panel defaultSize={panelSizes.chat} minSize={25}>
              {renderChatView()}
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}

// Main component
export function WorkspacePage(props: WorkspacePageProps) {
  return <WorkspaceContent {...props} />;
}