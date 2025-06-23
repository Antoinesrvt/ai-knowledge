'use server'

import { auth } from '@/app/(auth)/auth'
import {
  linkChatToDocument,
  getDocumentChats,
  unlinkChatFromDocument,
  getChatLinkedToDocument
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function linkChatToDocumentAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const chatId = formData.get('chatId') as string
  const documentId = formData.get('documentId') as string
  const documentCreatedAt = formData.get('documentCreatedAt') as string
  const branchId = formData.get('branchId') as string
  const linkType = formData.get('linkType') as 'created' | 'referenced' | 'updated'

  if (!chatId || !documentId || !documentCreatedAt) {
    throw new Error('Chat ID, document ID, and document created date are required')
  }

  try {
    const link = await linkChatToDocument({
      chatId,
      documentId,
      documentCreatedAt: new Date(documentCreatedAt),
      branchId: branchId || undefined,
      linkType: linkType || 'created'
    })
    
    revalidatePath('/chat/[id]', 'page')
    revalidatePath('/workspace/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true, link }
  } catch (error) {
    console.error('Error linking chat to document:', error)
    throw new Error('Failed to link chat to document')
  }
}

export async function getDocumentChatsAction(documentId: string, documentCreatedAt: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!documentId || !documentCreatedAt) {
    throw new Error('Document ID and created date are required')
  }

  try {
    const chats = await getDocumentChats({
      documentId,
      documentCreatedAt: new Date(documentCreatedAt)
    })
    return chats
  } catch (error) {
    console.error('Error fetching document chats:', error)
    throw new Error('Failed to fetch document chats')
  }
}

export async function getChatDocumentsAction(chatId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!chatId) {
    throw new Error('Chat ID is required')
  }

  // TODO: Implement getChatDocuments when available
  throw new Error('Get chat documents not yet implemented')
}

export async function unlinkChatFromDocumentAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const chatId = formData.get('chatId') as string

  if (!chatId) {
    throw new Error('Chat ID is required')
  }

  try {
    await unlinkChatFromDocument(chatId)
    
    revalidatePath('/chat/[id]', 'page')
    revalidatePath('/workspace/[id]', 'page')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error unlinking chat from document:', error)
    throw new Error('Failed to unlink chat from document')
  }
}

export async function updateChatDocumentLinkAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const chatId = formData.get('chatId') as string
  const documentId = formData.get('documentId') as string
  const documentCreatedAt = formData.get('documentCreatedAt') as string

  if (!chatId || !documentId || !documentCreatedAt) {
    throw new Error('Chat ID, document ID, and document created date are required')
  }

  // TODO: Implement updateChatDocumentLink when available
  throw new Error('Update chat document link not yet implemented')
}

export async function getChatDocumentLinkAction(documentId: string, documentCreatedAt: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!documentId || !documentCreatedAt) {
    throw new Error('Document ID and document created date are required')
  }

  try {
    const link = await getChatLinkedToDocument({
      documentId,
      documentCreatedAt: new Date(documentCreatedAt)
    })
    return link
  } catch (error) {
    console.error('Error fetching chat document link:', error)
    throw new Error('Failed to fetch chat document link')
  }
}