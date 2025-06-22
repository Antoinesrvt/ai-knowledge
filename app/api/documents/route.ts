import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getDocumentsForUser,
  getDocumentsByOrganization,
  getDocumentsByTeam,
  saveDocument
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const teamId = searchParams.get('teamId');

    let documents;

    if (organizationId && teamId) {
      // Get documents for specific team
      documents = await getDocumentsByTeam({
        teamId,
        userId: user.id
      });
    } else if (organizationId) {
      // Get documents for organization
      documents = await getDocumentsByOrganization({
        organizationId,
        userId: user.id
      });
    } else {
      // Get personal documents
      documents = await getDocumentsForUser({
        userId: user.id
      });
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, kind, organizationId, teamId, visibility = 'private' } = body;

    if (!title || !content || !kind) {
      return NextResponse.json(
        { error: 'Title, content, and kind are required' },
        { status: 400 }
      );
    }

    const documentData = {
      title,
      content,
      kind,
      visibility,
      userId: user.id,
      ...(organizationId && { organizationId }),
      ...(teamId && { teamId })
    };

    const [document] = await saveDocument(documentData);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}