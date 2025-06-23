'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Document } from '@/lib/db/schema';
import type { UserType } from '@/lib/auth-utils';

type ViewMode = 'document' | 'chat' | 'split';
type PanelFocus = 'document' | 'chat' | 'balanced';

interface WorkspaceState {
  // Core state
  document: Document | null;
  viewMode: ViewMode;
  panelFocus: PanelFocus;
  
  // Document state
  title: string;
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  
  // Chat state
  linkedChatId: string | null;
  isChatLoading: boolean;
  
  // UI state
  isDocumentPanelCollapsed: boolean;
  isChatPanelCollapsed: boolean;
  showPendingChanges: boolean;
  
  // Permissions
  isOwner: boolean;
  isReadOnly: boolean;
  userType: UserType;
}

interface WorkspaceActions {
  // Document actions
  setDocument: (document: Document) => void;
  updateTitle: (title: string) => void;
  updateContent: (content: string) => void;
  saveDocument: () => Promise<void>;
  
  // View actions
  setViewMode: (mode: ViewMode) => void;
  setPanelFocus: (focus: PanelFocus) => void;
  toggleDocumentPanel: () => void;
  toggleChatPanel: () => void;
  
  // Chat actions
  setLinkedChatId: (chatId: string | null) => void;
  setChatLoading: (loading: boolean) => void;
  
  // Smart view detection
  detectOptimalView: () => ViewMode;
  adaptToContent: () => void;
}

type WorkspaceContextType = WorkspaceState & WorkspaceActions;

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialDocument?: Document;
  onSave?: (title: string, content: string) => Promise<void>;
  isOwner?: boolean;
  isReadOnly?: boolean;
  userType?: UserType;
}

export function WorkspaceProvider({
  children,
  initialDocument,
  onSave,
  isOwner = false,
  isReadOnly = false,
  userType = 'unauthenticated'
}: WorkspaceProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state
  const [state, setState] = useState<WorkspaceState>({
    document: initialDocument || null,
    viewMode: 'document',
    panelFocus: 'balanced',
    title: initialDocument?.title || '',
    content: initialDocument?.content || '',
    isDirty: false,
    isSaving: false,
    linkedChatId: null,
    isChatLoading: false,
    isDocumentPanelCollapsed: false,
    isChatPanelCollapsed: false,
    showPendingChanges: true,
    isOwner,
    isReadOnly,
    userType
  });

  // Smart view detection based on content and context
  const detectOptimalView = useCallback((): ViewMode => {
    const hasChat = !!state.linkedChatId;
    const hasContent = state.content.length > 100;
    const urlMode = searchParams.get('mode') as ViewMode;
    
    // Respect URL parameter if valid
    if (urlMode && ['document', 'chat', 'split'].includes(urlMode)) {
      return urlMode;
    }
    
    // Smart detection logic
    if (!hasChat) return 'document';
    if (!hasContent) return 'chat';
    
    // Default to split for rich content with chat
    return 'split';
  }, [state.linkedChatId, state.content, searchParams]);

  // Adapt view based on content changes
  const adaptToContent = useCallback(() => {
    const optimalView = detectOptimalView();
    if (optimalView !== state.viewMode) {
      setState(prev => ({ ...prev, viewMode: optimalView }));
    }
  }, [detectOptimalView, state.viewMode]);

  // Actions
  const actions: WorkspaceActions = {
    setDocument: useCallback((document: Document) => {
      setState(prev => ({
        ...prev,
        document,
        title: document.title,
        content: document.content || '',
        isDirty: false
      }));
    }, []),

    updateTitle: useCallback((title: string) => {
      setState(prev => ({
        ...prev,
        title,
        isDirty: prev.title !== title || prev.isDirty
      }));
    }, []),

    updateContent: useCallback((content: string) => {
      setState(prev => ({
        ...prev,
        content,
        isDirty: prev.content !== content || prev.isDirty
      }));
    }, []),

    saveDocument: useCallback(async () => {
      if (!onSave || state.isSaving || !state.isDirty) return;
      
      setState(prev => ({ ...prev, isSaving: true }));
      try {
        await onSave(state.title, state.content);
        setState(prev => ({ ...prev, isDirty: false }));
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [onSave, state.isSaving, state.isDirty, state.title, state.content]),

    setViewMode: useCallback((mode: ViewMode) => {
      setState(prev => ({ ...prev, viewMode: mode }));
      
      // Update URL without navigation
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('mode', mode);
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }, [router, searchParams]),

    setPanelFocus: useCallback((focus: PanelFocus) => {
      setState(prev => ({ ...prev, panelFocus: focus }));
    }, []),

    toggleDocumentPanel: useCallback(() => {
      setState(prev => ({
        ...prev,
        isDocumentPanelCollapsed: !prev.isDocumentPanelCollapsed
      }));
    }, []),

    toggleChatPanel: useCallback(() => {
      setState(prev => ({
        ...prev,
        isChatPanelCollapsed: !prev.isChatPanelCollapsed
      }));
    }, []),

    setLinkedChatId: useCallback((chatId: string | null) => {
      setState(prev => ({ ...prev, linkedChatId: chatId }));
    }, []),

    setChatLoading: useCallback((loading: boolean) => {
      setState(prev => ({ ...prev, isChatLoading: loading }));
    }, []),

    detectOptimalView,
    adaptToContent
  };

  // Auto-adapt view when content or chat changes
  useEffect(() => {
    const timer = setTimeout(adaptToContent, 500); // Debounce
    return () => clearTimeout(timer);
  }, [state.content, state.linkedChatId, adaptToContent]);

  const contextValue: WorkspaceContextType = {
    ...state,
    ...actions
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

// Utility hooks for specific aspects
export function useWorkspaceDocument() {
  const { document, title, content, isDirty, isSaving, updateTitle, updateContent, saveDocument } = useWorkspace();
  return { document, title, content, isDirty, isSaving, updateTitle, updateContent, saveDocument };
}

export function useWorkspaceView() {
  const { viewMode, panelFocus, setViewMode, setPanelFocus, detectOptimalView } = useWorkspace();
  return { viewMode, panelFocus, setViewMode, setPanelFocus, detectOptimalView };
}

export function useWorkspaceChat() {
  const { linkedChatId, isChatLoading, setLinkedChatId, setChatLoading } = useWorkspace();
  return { linkedChatId, isChatLoading, setLinkedChatId, setChatLoading };
}