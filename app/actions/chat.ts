'use server'

import { auth } from '@/app/(auth)/auth'
import {
  saveChat,
  deleteChatById,
  getChatById,
  getChatsByUserId,
  getDocumentsById,
  linkChatToDocument,
  getChatLinkedToDocument,
  saveDocument
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateUUID } from '@/lib/utils'
import type { Chat } from '@/lib/db/schema'

export async function saveChatAction(chatData: {
  id?: string
  title: string
  messages: any[]
  userId: string
  visibility?: 'private' | 'public'
  path?: string
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Ensure user can only save their own chats
  if (chatData.userId !== session.user.id) {
    throw new Error('Forbidden: You can only save your own chats')
  }

  try {
    const chatId = chatData.id || generateUUID()
    const timestamp = new Date()

    await saveChat({
      id: chatId,
      title: chatData.title,
      userId: session.user.id,
      visibility: chatData.visibility || 'private'
    })
    revalidatePath('/chat')
    revalidatePath(`/chat/${chatId}`)
    
    return { success: true, chatId }
  } catch (error) {
    console.error('Failed to save chat:', error)
    throw new Error('Failed to save chat')
  }
}

export async function deleteChatAction(chatId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    // Check if user owns the chat
    const chat = await getChatById({ id: chatId })
    if (!chat) {
      throw new Error('Chat not found')
    }

    if (chat.userId !== session.user.id) {
      throw new Error('Forbidden: You can only delete your own chats')
    }

    await deleteChatById({ id: chatId })
    revalidatePath('/chat')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete chat:', error)
    throw new Error('Failed to delete chat')
  }
}

export async function getChatAction(chatId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const chat = await getChatById({ id: chatId })
    if (!chat) {
      throw new Error('Chat not found')
    }

    // Check access permissions
    if (chat.visibility === 'private' && chat.userId !== session.user.id) {
      throw new Error('Forbidden: You cannot access private chats you do not own')
    }

    return chat
  } catch (error) {
    console.error('Failed to fetch chat:', error)
    throw error
  }
}

export async function getUserChatsAction() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const chats = await getChatsByUserId({ 
      id: session.user.id,
      limit: 50,
      startingAfter: null,
      endingBefore: null
    })
    return chats
  } catch (error) {
    console.error('Failed to fetch user chats:', error)
    throw new Error('Failed to fetch user chats')
  }
}

export async function shareChatAction(chatId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    // Check if user owns the chat
    const chat = await getChatById({ id: chatId })
    if (!chat) {
      throw new Error('Chat not found')
    }

    if (chat.userId !== session.user.id) {
      throw new Error('Forbidden: You can only share your own chats')
    }

    // Update chat visibility to public
    const updatedChat: Chat = {
      ...chat,
      visibility: 'public',
      updatedAt: new Date()
    }

    await saveChat(updatedChat)
    revalidatePath('/chat')
    revalidatePath(`/chat/${chatId}`)
    
    return { success: true, shareUrl: `/chat/${chatId}` }
  } catch (error) {
    console.error('Failed to share chat:', error)
    throw new Error('Failed to share chat')
  }
}

export async function linkChatToDocumentAction(chatId: string, documentId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    // Check if user owns the chat
    const chat = await getChatById({ id: chatId })
    if (!chat) {
      throw new Error('Chat not found')
    }

    if (chat.userId !== session.user.id) {
      throw new Error('Forbidden: You can only link your own chats')
    }

    // Check if user has access to the document
    const documents = await getDocumentsById({ id: documentId })
    const [document] = documents

    if (!document) {
      throw new Error('Document not found')
    }

    if (document.visibility === 'private' && document.userId !== session.user.id) {
      throw new Error('Forbidden: You cannot link to private documents you do not own')
    }

    // Link chat to document using the linkChatToDocument function
    await linkChatToDocument({
      chatId,
      documentId,
      documentCreatedAt: document.createdAt,
      branchId: undefined,
      linkType: 'referenced'
    })
    revalidatePath('/chat')
    revalidatePath(`/chat/${chatId}`)
    revalidatePath(`/workspace/${documentId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Failed to link chat to document:', error)
    throw new Error('Failed to link chat to document')
  }
}

/**
 * Creates a new chat and links it to a document
 */
export async function createChatForDocument({
  documentId,
  documentCreatedAt,
  title
}: {
  documentId: string;
  documentCreatedAt: Date;
  title?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify user owns the document
  const documentsData = await getDocumentsById({ id: documentId });
  const document = documentsData?.[0];
  
  if (!document || document.userId !== session.user.id) {
    throw new Error('Document not found or access denied');
  }

  const chatId = generateUUID();
  const chatTitle = title || `Chat for ${document.title}`;
  
  try {
    // Create the chat first
    await saveChat({
      id: chatId,
      userId: session.user.id,
      title: chatTitle,
      visibility: 'private'
    });
    
    // Then link it to the document
    await linkChatToDocument({
      chatId,
      documentId,
      documentCreatedAt,
      linkType: 'created'
    });
    
    // Revalidate relevant paths
    revalidatePath(`/workspace/${documentId}`);
    revalidatePath(`/chat/${chatId}`);
    revalidatePath('/chats');
    
    return { chatId, success: true };
  } catch (error) {
    console.error('Failed to create chat for document:', error);
    throw new Error('Failed to create chat for document');
  }
}

/**
 * Gets the linked chat for a document, creating one if needed
 */
export async function getOrCreateChatForDocument({
  documentId,
  documentCreatedAt,
  autoCreate = false
}: {
  documentId: string;
  documentCreatedAt: Date;
  autoCreate?: boolean;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    // First, try to get existing linked chat
    const linkedDocument = await getChatLinkedToDocument({ documentId, documentCreatedAt });
    
    if (linkedDocument?.chatId) {
      // Verify the chat still exists and user has access
      const chatData = await getChatById({ id: linkedDocument.chatId });
      if (chatData && chatData.userId === session.user.id) {
        return { chatId: linkedDocument.chatId, created: false, success: true };
      }
    }
    
    // If no linked chat exists and autoCreate is true, create one
    if (autoCreate) {
      const result = await createChatForDocument({
        documentId,
        documentCreatedAt
      });
      return { chatId: result.chatId, created: true, success: true };
    }
    
    return { chatId: null, created: false, success: true };
  } catch (error) {
    console.error('Failed to get or create chat for document:', error);
    throw new Error('Failed to get or create chat for document');
  }
}

/**
 * Creates a new document and links it to a chat
 */
export async function createDocumentForChat({
  chatId,
  title,
  content = '',
  kind = 'text'
}: {
  chatId: string;
  title: string;
  content?: string;
  kind?: 'text' | 'code' | 'sheet' | 'image';
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify user owns the chat
  const chatData = await getChatById({ id: chatId });
  
  if (!chatData || chatData.userId !== session.user.id) {
    throw new Error('Chat not found or access denied');
  }

  const documentId = generateUUID();
  const documentCreatedAt = new Date();
  
  try {
    // Create the document
    await saveDocument({
      id: documentId,
      title,
      content,
      kind,
      userId: session.user.id
    });
    
    // Link the chat to the document
    await linkChatToDocument({
      chatId,
      documentId,
      documentCreatedAt,
      linkType: 'created'
    });
    
    // Revalidate relevant paths
    revalidatePath(`/workspace/${documentId}`);
    revalidatePath(`/chat/${chatId}`);
    revalidatePath('/documents');
    
    return { documentId, success: true };
  } catch (error) {
    console.error('Failed to create document for chat:', error);
    throw new Error('Failed to create document for chat');
  }
}