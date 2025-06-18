'use server'

import { auth } from '@/app/(auth)/auth'
import {
  saveDocument,
  getDocumentsByUserId,
  getDocumentsById,
  deleteDocumentsByIdAfterTimestamp,
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
    redirect(`/document/${documentId}`)
  } catch (error) {
    console.error('Failed to create document:', error)
    throw new Error('Failed to create document')
  }
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

    revalidatePath(`/document/${id}`)
    revalidatePath('/documents')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update document:', error)
    throw new Error('Failed to update document')
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
    const timestamp = new Date()
    await deleteDocumentsByIdAfterTimestamp({ id, timestamp })

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
    const documents = await getDocumentsByUserId({ userId: targetUserId })
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