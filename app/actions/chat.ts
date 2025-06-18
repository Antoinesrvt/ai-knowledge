'use server'

import { auth } from '@/app/(auth)/auth'
import {
  saveChat,
  deleteChatById,
  getChatById,
  getChatsByUserId,
  getDocumentsById,
  linkChatToDocument
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
    revalidatePath(`/document/${documentId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Failed to link chat to document:', error)
    throw new Error('Failed to link chat to document')
  }
}