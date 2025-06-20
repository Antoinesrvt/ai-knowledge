import { NextRequest, NextResponse } from 'next/server'
import { getDocumentsById } from '@/lib/db/queries'

// Public API endpoint for accessing public documents
// Renamed from /api/documents/[id] to avoid routing conflict with /document/[id] page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const documents = await getDocumentsById({ id })
    const [document] = documents

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Only return public documents via API
    if (document.visibility !== 'public') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Return sanitized document data for API consumers
    const apiDocument = {
      id: document.id,
      title: document.title,
      content: document.content,
      kind: document.kind,
      visibility: document.visibility,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }

    return NextResponse.json(apiDocument)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}