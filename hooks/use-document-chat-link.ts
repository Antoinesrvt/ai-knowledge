'use client';

import { useState, useEffect, useCallback } from 'react';
import { linkChatToDocumentAction, unlinkChatFromDocumentAction } from '@/app/actions/document-chat-link';
import { generateUUID } from '@/lib/utils';

interface UseDocumentChatLinkProps {
  documentId: string;
  documentCreatedAt: Date;
  autoCreateChat?: boolean;
}

interface UseDocumentChatLinkReturn {
  linkedChatId: string | null;
  isLoading: boolean;
  linkChat: (chatId: string) => Promise<boolean>;
  unlinkChat: () => Promise<boolean>;
  createAndLinkChat: () => Promise<string | null>;
}

export function useDocumentChatLink({
  documentId,
  documentCreatedAt,
  autoCreateChat = true,
}: UseDocumentChatLinkProps): UseDocumentChatLinkReturn {
  const [linkedChatId, setLinkedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const linkChat = async (chatId: string) => {
    try {
      const result = await linkChatToDocumentAction(chatId, documentId, documentCreatedAt);
      if (result.success) {
        setLinkedChatId(chatId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error linking chat:', error);
      return false;
    }
  };

  const unlinkChat = async () => {
    if (!linkedChatId) return false;
    
    try {
      const result = await unlinkChatFromDocumentAction(linkedChatId);
      if (result.success) {
        setLinkedChatId(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unlinking chat:', error);
      return false;
    }
  };

  const createAndLinkChat = async (): Promise<string | null> => {
    const newChatId = generateUUID();
    const success = await linkChat(newChatId);
    return success ? newChatId : null;
  };

  useEffect(() => {
    const initializeLink = async () => {
      if (!documentId || !documentCreatedAt) return;
      
      setIsLoading(true);
      try {
        if (autoCreateChat) {
          // Create a new chat and link it to the document
          const newChatId = generateUUID();
          const linkResult = await linkChatToDocumentAction(newChatId, documentId, documentCreatedAt);
          if (linkResult.success) {
            setLinkedChatId(newChatId);
          }
        }
      } catch (error) {
        console.error('Error initializing chat link:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLink();
  }, [documentId, documentCreatedAt, autoCreateChat]);

  return {
    linkedChatId,
    isLoading,
    linkChat,
    unlinkChat,
    createAndLinkChat,
  };
}