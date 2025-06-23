import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { WorkspaceEntryType, WorkspaceViewMode } from '@/lib/workspace-utils';
import { 
  updateDocumentViewModeAction, 
  setActiveMainChatAction, 
  createMainChatForDocumentAction 
} from '@/app/actions/workspace';
import { saveChatAction } from '@/app/actions/chat';
import { saveDocumentAction } from '@/app/actions/documents';

export interface UseWorkspaceStateProps {
  entryType: WorkspaceEntryType;
  entryId: string;
  workspaceData: any;
  userId: string;
  isOwner: boolean;
  isReadOnly?: boolean;
}

export interface WorkspaceState {
  // Entry and view state
  entryType: WorkspaceEntryType;
  entryId: string;
  viewMode: WorkspaceViewMode;
  panelFocus: 'document' | 'chat' | 'balanced';
  
  // Document state
  documentData: any;
  documentTitle: string;
  documentContent: string;
  documentIsDirty: boolean;
  documentIsSaving: boolean;
  
  // Chat state
  chatData: any;
  activeChatId: string | null;
  chatIsDirty: boolean;
  chatIsSaving: boolean;
  
  // UI state
  isOwner: boolean;
  isReadOnly: boolean;
  
  // Actions
  updateDocumentTitle: (title: string) => void;
  updateDocumentContent: (content: string) => void;
  saveDocument: () => Promise<void>;
  setViewMode: (mode: WorkspaceViewMode) => void;
  setPanelFocus: (focus: 'document' | 'chat' | 'balanced') => void;
  setActiveChatId: (chatId: string | null) => void;
  createMainChat: (title?: string) => Promise<string | null>;
  saveChat: () => Promise<void>;
}

export function useWorkspaceState({
  entryType,
  entryId,
  workspaceData,
  userId,
  isOwner,
  isReadOnly = false,
}: UseWorkspaceStateProps): WorkspaceState {
  // Determine initial view mode and data based on entry type
  const getInitialViewMode = (): WorkspaceViewMode => {
    if (entryType === 'document') {
      return workspaceData.lastViewMode || 'document';
    }
    return 'chat';
  };

  const getInitialDocumentData = () => {
    if (entryType === 'document') {
      return workspaceData;
    }
    return workspaceData.primaryDocument;
  };

  const getInitialChatData = () => {
    if (entryType === 'chat') {
      return workspaceData;
    }
    return null;
  };

  // State
  const [viewMode, setViewModeState] = useState<WorkspaceViewMode>(getInitialViewMode());
  const [panelFocus, setPanelFocus] = useState<'document' | 'chat' | 'balanced'>('balanced');
  
  const [documentData, setDocumentData] = useState(getInitialDocumentData());
  const [documentTitle, setDocumentTitle] = useState(documentData?.title || '');
  const [documentContent, setDocumentContent] = useState(documentData?.content || '');
  const [documentIsDirty, setDocumentIsDirty] = useState(false);
  const [documentIsSaving, setDocumentIsSaving] = useState(false);
  
  const [chatData, setChatData] = useState(getInitialChatData());
  const [activeChatId, setActiveChatIdState] = useState<string | null>(
    entryType === 'chat' ? entryId : workspaceData.currentMainChatId || null
  );
  const [chatIsDirty, setChatIsDirty] = useState(false);
  const [chatIsSaving, setChatIsSaving] = useState(false);

  // Actions
  const updateDocumentTitle = useCallback((title: string) => {
    setDocumentTitle(title);
    setDocumentIsDirty(true);
  }, []);

  const updateDocumentContent = useCallback((content: string) => {
    setDocumentContent(content);
    setDocumentIsDirty(true);
  }, []);

  const saveDocument = useCallback(async () => {
    if (!documentData || !documentIsDirty || isReadOnly) return;
    
    setDocumentIsSaving(true);
    try {
      await saveDocumentAction(
        documentData.id,
        documentTitle,
        documentContent
      );
      setDocumentIsDirty(false);
      toast.success('Document saved');
    } catch (error) {
      toast.error('Failed to save document');
      throw error;
    } finally {
      setDocumentIsSaving(false);
    }
  }, [documentData, documentTitle, documentContent, documentIsDirty, isReadOnly]);

  const setViewMode = useCallback(async (mode: WorkspaceViewMode) => {
    setViewModeState(mode);
    
    // Update document view mode preference if this is a document entry
    if (entryType === 'document' && documentData) {
      try {
        await updateDocumentViewModeAction(documentData.id, mode);
      } catch (error) {
        console.error('Failed to update view mode preference:', error);
      }
    }
  }, [entryType, documentData]);

  const setActiveChatId = useCallback(async (chatId: string | null) => {
    setActiveChatIdState(chatId);
    
    // Update active main chat for document if this is a document entry
    if (entryType === 'document' && documentData && chatId) {
      try {
        await setActiveMainChatAction(documentData.id, chatId);
      } catch (error) {
        console.error('Failed to set active main chat:', error);
      }
    }
  }, [entryType, documentData]);

  const createMainChat = useCallback(async (title?: string): Promise<string | null> => {
    if (!documentData || entryType !== 'document') return null;
    
    try {
      const chatTitle = title || `Chat: ${documentData.title}`;
      const newChatId = await createMainChatForDocumentAction(
         documentData.id,
         documentData.createdAt,
         chatTitle
       );
      
      setActiveChatIdState(newChatId);
      toast.success('Chat created');
      return newChatId;
    } catch (error) {
      toast.error('Failed to create chat');
      console.error('Failed to create main chat:', error);
      return null;
    }
  }, [documentData, entryType, userId]);

  const saveChat = useCallback(async () => {
    if (!chatData || !chatIsDirty) return;
    
    setChatIsSaving(true);
    try {
      // Implementation depends on chat saving logic
      // await saveChatAction(chatData);
      setChatIsDirty(false);
      toast.success('Chat saved');
    } catch (error) {
      toast.error('Failed to save chat');
      throw error;
    } finally {
      setChatIsSaving(false);
    }
  }, [chatData, chatIsDirty]);

  return {
    // Entry and view state
    entryType,
    entryId,
    viewMode,
    panelFocus,
    
    // Document state
    documentData,
    documentTitle,
    documentContent,
    documentIsDirty,
    documentIsSaving,
    
    // Chat state
    chatData,
    activeChatId,
    chatIsDirty,
    chatIsSaving,
    
    // UI state
    isOwner,
    isReadOnly,
    
    // Actions
    updateDocumentTitle,
    updateDocumentContent,
    saveDocument,
    setViewMode,
    setPanelFocus,
    setActiveChatId,
    createMainChat,
    saveChat,
  };
}