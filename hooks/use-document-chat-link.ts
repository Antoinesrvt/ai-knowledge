'use client';

import { useState, useEffect } from 'react';
import { linkChatToDocumentAction } from '@/app/actions/document-chat-link';
import { getOrCreateChatForDocument } from '@/app/actions/chat';
import { generateUUID } from '@/lib/utils';

interface UseDocumentChatLinkProps {
  documentId: string;
  documentCreatedAt: Date;
  autoCreateChat?: boolean;
}

export function useDocumentChatLink({
  documentId,
  documentCreatedAt,
  autoCreateChat = false
}: UseDocumentChatLinkProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkToChat = async (targetChatId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await linkChatToDocumentAction(targetChatId, documentId, documentCreatedAt);
      if (result.success) {
        setChatId(targetChatId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link chat');
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkFromChat = async () => {
    // Implementation for unlinking would go here
    setChatId(null);
  };

  const createAndLinkChat = async (title?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getOrCreateChatForDocument({
        documentId,
        documentCreatedAt,
        autoCreate: true
      });
      
      if (result.success && result.chatId) {
        setChatId(result.chatId);
        return result.chatId;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create and link chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-create chat if enabled and get existing chat if available
  useEffect(() => {
    if (!documentId || !documentCreatedAt) return;
    
    const initializeChat = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await getOrCreateChatForDocument({
          documentId,
          documentCreatedAt,
          autoCreate: autoCreateChat
        });
        
        if (result.success && result.chatId) {
          setChatId(result.chatId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [documentId, documentCreatedAt, autoCreateChat]);

  return {
    chatId,
    isLoading,
    error,
    linkToChat,
    unlinkFromChat,
    createAndLinkChat
  };
}