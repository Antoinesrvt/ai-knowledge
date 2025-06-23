'use server'

import { auth } from '@/app/(auth)/auth'
import {
  createDocumentBranch,
  getDocumentBranches,
  getDocumentBranchById,
  createBranchRequest,
  getBranchRequests,
  updateBranchRequest,
  getDocumentsById
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateUUID } from '@/lib/utils'

export async function createBranch(documentId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sourceVersion = formData.get('sourceVersion') as string

  if (!name) {
    throw new Error('Branch name is required')
  }

  // Check if user has access to the document
  const documents = await getDocumentsById({ id: documentId })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.visibility === 'private' && document.userId !== session.user.id) {
    throw new Error('Forbidden: You cannot create branches for private documents you do not own')
  }

  try {
    const branchId = generateUUID()
    const timestamp = new Date()

    await createDocumentBranch({
      id: branchId,
      documentId,
      documentCreatedAt: document.createdAt,
      name,
      parentBranchId: sourceVersion || null,
      createdByType: 'user',
      createdById: session.user.id,
      isActive: true
    })

    revalidatePath(`/workspace/${documentId}`)
    return { success: true, branchId }
  } catch (error) {
    console.error('Failed to create branch:', error)
    throw new Error('Failed to create branch')
  }
}

export async function getDocumentBranchesAction(documentId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check if user has access to the document
  const documents = await getDocumentsById({ id: documentId })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.visibility === 'private' && document.userId !== session.user.id) {
    throw new Error('Forbidden: You cannot access branches for private documents you do not own')
  }

  try {
    const branches = await getDocumentBranches({ 
      documentId, 
      documentCreatedAt: document.createdAt 
    })
    return branches
  } catch (error) {
    console.error('Failed to fetch branches:', error)
    throw new Error('Failed to fetch branches')
  }
}

export async function getBranchById(branchId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  try {
    const branch = await getDocumentBranchById({ branchId })
    
    if (!branch) {
      throw new Error('Branch not found')
    }

    // Check if user has access to the parent document
    const documents = await getDocumentsById({ id: branch.documentId })
    const [document] = documents

    if (!document) {
      throw new Error('Parent document not found')
    }

    if (document.visibility === 'private' && document.userId !== session.user.id) {
      throw new Error('Forbidden: You cannot access this branch')
    }

    return branch
  } catch (error) {
    console.error('Failed to fetch branch:', error)
    throw error
  }
}

export async function createBranchRequestAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const documentId = formData.get('documentId') as string
  const branchId = formData.get('branchId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!documentId || !branchId || !title) {
    throw new Error('Document ID, branch ID, and title are required')
  }

  // Check if user has access to the document
  const documents = await getDocumentsById({ id: documentId })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.visibility === 'private' && document.userId !== session.user.id) {
    throw new Error('Forbidden: You cannot create merge requests for private documents you do not own')
  }

  try {
    const requestId = generateUUID()
    const timestamp = new Date()

    await createBranchRequest({
      documentId,
      documentCreatedAt: document.createdAt,
      proposedName: title,
      reason: description || undefined,
      requestedById: session.user.id
    })

    revalidatePath(`/workspace/${documentId}`)
    return { success: true, requestId }
  } catch (error) {
    console.error('Failed to create branch request:', error)
    throw new Error('Failed to create branch request')
  }
}

export async function getBranchRequestsAction(documentId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check if user has access to the document
  const documents = await getDocumentsById({ id: documentId })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.visibility === 'private' && document.userId !== session.user.id) {
    throw new Error('Forbidden: You cannot access merge requests for private documents you do not own')
  }

  try {
    const requests = await getBranchRequests({ documentId, documentCreatedAt: document.createdAt })
    return requests
  } catch (error) {
    console.error('Failed to fetch branch requests:', error)
    throw new Error('Failed to fetch branch requests')
  }
}

export async function updateBranchRequestAction(requestId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const status = formData.get('status') as 'pending' | 'approved' | 'rejected'
  const reviewComment = formData.get('reviewComment') as string
  const finalName = formData.get('finalName') as string

  if (!status) {
    throw new Error('Status is required')
  }

  try {
    const timestamp = new Date()

    await updateBranchRequest({
      requestId,
      status: status as 'approved' | 'rejected',
      finalName: finalName || undefined
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to update branch request:', error)
    throw new Error('Failed to update branch request')
  }
}