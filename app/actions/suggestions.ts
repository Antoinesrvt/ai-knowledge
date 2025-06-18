'use server'

import { auth } from '@/app/(auth)/auth'
import {
  saveSuggestions,
  getSuggestionsByDocumentId,
  getDocumentsById
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { generateUUID } from '@/lib/utils'
import type { Suggestion, Vote } from '@/lib/db/schema'

export async function createSuggestionAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const documentId = formData.get('documentId') as string
  const originalText = formData.get('originalText') as string
  const suggestedText = formData.get('suggestedText') as string
  const description = formData.get('description') as string
  const selectionStart = parseInt(formData.get('selectionStart') as string)
  const selectionEnd = parseInt(formData.get('selectionEnd') as string)

  if (!documentId || !originalText || !suggestedText) {
    throw new Error('Document ID, original text, and suggested text are required')
  }

  // Check if user has access to the document
  const documents = await getDocumentsById({ id: documentId })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.visibility === 'private' && document.userId !== session.user.id) {
    throw new Error('Forbidden: You cannot create suggestions for private documents you do not own')
  }

  try {
    const suggestionId = generateUUID()
    const timestamp = new Date()

    const suggestion: Suggestion = {
      id: suggestionId,
      documentId,
      documentCreatedAt: document.createdAt,
      originalText,
      suggestedText,
      description: description || null,
      userId: session.user.id,
      createdAt: timestamp,
      isResolved: false
    }

    await saveSuggestions({ suggestions: [suggestion] })
    revalidatePath(`/document/${documentId}`)
    
    return { success: true, suggestionId }
  } catch (error) {
    console.error('Failed to create suggestion:', error)
    throw new Error('Failed to create suggestion')
  }
}

export async function getDocumentSuggestionsAction(documentId: string) {
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
    throw new Error('Forbidden: You cannot access suggestions for private documents you do not own')
  }

  try {
    const suggestions = await getSuggestionsByDocumentId({ documentId })
    return suggestions
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    throw new Error('Failed to fetch suggestions')
  }
}

// resolveSuggestionAction removed - getSuggestionById function not available

// Functions removed - dependent on non-existent getSuggestionById and saveVote functions

// getUserVotesAction removed - getVotesByUserId function not available

export async function generateAISuggestionAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const documentId = formData.get('documentId') as string
  const selectedText = formData.get('selectedText') as string
  const context = formData.get('context') as string
  const suggestionType = formData.get('suggestionType') as string

  if (!documentId || !selectedText) {
    throw new Error('Document ID and selected text are required')
  }

  // Check if user has access to the document
  const documents = await getDocumentsById({ id: documentId })
  const [document] = documents

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.visibility === 'private' && document.userId !== session.user.id) {
    throw new Error('Forbidden: You cannot generate suggestions for private documents you do not own')
  }

  try {
    // Here you would integrate with your AI service
    // For now, we'll return a mock suggestion
    const aiSuggestion = {
      originalText: selectedText,
      suggestedText: `[AI-improved] ${selectedText}`,
      description: `AI suggestion for ${suggestionType || 'improvement'}`,
      confidence: 0.85
    }

    return { success: true, suggestion: aiSuggestion }
  } catch (error) {
    console.error('Failed to generate AI suggestion:', error)
    throw new Error('Failed to generate AI suggestion')
  }
}