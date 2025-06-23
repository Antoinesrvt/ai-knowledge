'use server'

import { auth } from '@/app/(auth)/auth'
import {
  saveDocument,
  getDocumentsForUser,
  getDocumentsById,
  deleteDocument,
  updateDocument as updateDocumentQuery
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ArtifactKind } from '@/components/artifact'
import type { VisibilityType } from '@/components/visibility-selector'
import { generateUUID } from '@/lib/utils'

export async function createDocument(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const kind = (formData.get('kind') as ArtifactKind) || 'text'
  const visibility = (formData.get('visibility') as VisibilityType) || 'private'

  if (!title || !content) {
    throw new Error('Title and content are required')
  }

  try {
    const documentId = generateUUID()
    const timestamp = new Date()

    await saveDocument({
      id: documentId,
      title,
      content,
      kind,
      userId: session.user.id
    })

    revalidatePath('/documents')
    revalidatePath('/dashboard')
    redirect(`/workspace/${documentId}`)
  } catch (error) {
    console.error('Failed to create document:', error)
    throw new Error('Failed to create document')
  }
}

export async function createEmptyDocument(options?: {
  withChat?: boolean;
  title?: string;
  kind?: 'text' | 'code' | 'sheet' | 'image';
  userId?: string;
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  let documentId: string
  
  try {
    const id = generateUUID()
    const title = options?.title || 'Untitled Document'
    const kind = options?.kind || 'text'

    const [savedDocument] = await saveDocument({
      id,
      title,
      content: '',
      kind,
      userId: options?.userId || session.user.id,
    })

    // Optionally create and link a chat
    if (options?.withChat) {
      try {
        const { createChatForDocument } = await import('./chat')
        await createChatForDocument({
          documentId: id,
          documentCreatedAt: savedDocument.createdAt,
          title: `Chat for ${title}`
        })
      } catch (chatError) {
        console.error('Failed to create linked chat:', chatError)
        // Don't fail the document creation if chat creation fails
      }
    }

    documentId = id
    revalidatePath('/documents')
  } catch (error) {
    console.error('Failed to create document:', error)
    throw new Error('Failed to create document')
  }
  
  // Redirect outside try-catch to avoid catching NEXT_REDIRECT
  redirect(`/workspace/${documentId}`)
}

export async function updateDocument(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check if user owns the document
  const documents = await getDocumentsById({ id })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.userId !== session.user.id) {
    throw new Error('Forbidden: You can only edit your own documents')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const visibility = formData.get('visibility') as VisibilityType

  try {
    const timestamp = new Date()

    await updateDocumentQuery({
      id,
      createdAt: document.createdAt,
      title: title || document.title,
      content: content ?? document.content,
      kind: document.kind
    })

    revalidatePath(`/workspace/${id}`)
    revalidatePath('/documents')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update document:', error)
    throw new Error('Failed to update document')
  }
}

export async function saveDocumentAction(id: string, title: string, content: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check if user owns the document
  const documents = await getDocumentsById({ id })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.userId !== session.user.id) {
    throw new Error('Forbidden: You can only edit your own documents')
  }

  try {
    await updateDocumentQuery({
      id,
      createdAt: document.createdAt,
      title: title || document.title,
      content: content ?? document.content,
      kind: document.kind
    })

    revalidatePath(`/workspace/${id}`)
    revalidatePath('/documents')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to save document:', error)
    throw new Error('Failed to save document')
  }
}

export async function deleteDocumentAction(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check if user owns the document
  const documents = await getDocumentsById({ id })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.userId !== session.user.id) {
    throw new Error('Forbidden: You can only delete your own documents')
  }

  try {
    await deleteDocument(id, session.user.id)

    revalidatePath('/documents')
    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    console.error('Failed to delete document:', error)
    throw new Error('Failed to delete document')
  }
}

export async function getUserDocuments(userId?: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const targetUserId = userId || session.user.id
  
  // Users can only fetch their own documents
  if (targetUserId !== session.user.id) {
    throw new Error('Forbidden: You can only access your own documents')
  }

  try {
    const documents = await getDocumentsForUser(targetUserId)
    return documents
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    throw new Error('Failed to fetch documents')
  }
}

export async function getDocumentById(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const documents = await getDocumentsById({ id })
    const [document] = documents

    if (!document) {
      throw new Error('Document not found')
    }

    // Check access permissions
    if (document.visibility === 'private' && document.userId !== session.user.id) {
      throw new Error('Forbidden: This document is private')
    }

    return document
  } catch (error) {
    console.error('Failed to fetch document:', error)
    throw error
  }
}