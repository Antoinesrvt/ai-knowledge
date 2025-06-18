'use server'

import { auth } from '@/app/(auth)/auth'
import {
  createDocumentVersion,
  getDocumentsById,
  getDocumentBranchById,
  getBranchVersions as getBranchVersionsFromDB
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { generateUUID } from '@/lib/utils'
import type { ArtifactKind } from '@/components/artifact'

export async function createVersion(branchId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const commitMessage = formData.get('commitMessage') as string
  const kind = formData.get('kind') as ArtifactKind

  if (!title || !content || !commitMessage) {
    throw new Error('Title, content, and commit message are required')
  }

  // Check if user has access to the branch
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
    throw new Error('Forbidden: You cannot create versions for private documents you do not own')
  }

  try {
    const versionId = generateUUID()
    const timestamp = new Date()

    // Get the current version number for this branch
    const existingVersions = await getBranchVersions(branchId)
    const versionNumber = existingVersions.length + 1

    await createDocumentVersion({
      branchId,
      content,
      commitMessage,
      authorId: session.user.id,
      authorType: 'user' as const,
    })

    revalidatePath(`/document/${document.id}`)
    return { success: true, versionId, versionNumber }
  } catch (error) {
    console.error('Failed to create version:', error)
    throw new Error('Failed to create version')
  }
}

export async function getBranchVersions(branchId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check if user has access to the branch
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
    throw new Error('Forbidden: You cannot access versions for private documents you do not own')
  }

  // Get versions for this branch
  return await getBranchVersionsFromDB({ branchId })
}

// getVersionById and compareVersions removed - getDocumentVersionById function not available