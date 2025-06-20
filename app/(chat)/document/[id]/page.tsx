import { notFound } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { getDocumentsById } from '@/lib/db/queries';
import { canAccessContent, getUserType } from '@/lib/auth-utils';
import { DocumentView } from '@/components/document-view';
import { GuestAccessBanner } from '@/components/guest-access-banner';
import { ChatSDKError } from '@/lib/errors';
import { Suspense } from 'react';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { DocumentErrorComponent } from '@/components/document-error';

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}



export default async function DocumentPage({ params }: DocumentPageProps) {
  const startTime = Date.now();
  let session: any = null;
  let id: string = '';
  let documents: any[] = [];
  let document: any = null;
  let userType: any = 'unauthenticated';
  let canAccess = false;

  try {
    // Step 1: Get document ID
    console.log('DocumentPage: Starting document load process');
    const resolvedParams = await params;
    id = resolvedParams.id;
    console.log('DocumentPage: Document ID resolved:', id);

    // Step 2: Get user session
    console.log('DocumentPage: Getting user session...');
    try {
      session = await auth();
      console.log('DocumentPage: Session obtained:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
    } catch (authError) {
      console.error('DocumentPage: Auth error:', authError);
      throw new ChatSDKError('unauthorized:auth', `Authentication failed: ${authError instanceof Error ? authError.message : 'Unknown auth error'}`);
    }

    // Step 3: Get user type
    console.log('DocumentPage: Getting user type...');
    try {
      userType = await getUserType();
      console.log('DocumentPage: User type obtained:', userType);
    } catch (userTypeError) {
      console.error('DocumentPage: User type error:', userTypeError);
      // Don't throw here, default to unauthenticated
      userType = 'unauthenticated';
    }

    // Step 4: Fetch document from database
    console.log('DocumentPage: Fetching document from database...');
    try {
      documents = await getDocumentsById({ id });
      console.log('DocumentPage: Documents fetched:', {
        count: documents.length,
        documentIds: documents.map(d => d.id)
      });
    } catch (dbError) {
      console.error('DocumentPage: Database error:', dbError);
      throw dbError; // Re-throw database errors as they're already wrapped
    }

    document = documents[0];
    if (!document) {
      console.log('DocumentPage: Document not found in database');
      notFound();
    }

    console.log('DocumentPage: Document found:', {
      id: document.id,
      title: document.title,
      visibility: document.visibility,
      userId: document.userId,
      organizationId: document.organizationId,
      teamId: document.teamId
    });

    // Step 5: Check access permissions
    console.log('DocumentPage: Checking access permissions...');
    const isOwner = session?.user?.id === document.userId;
    
    try {
      // For private documents, owner should always have access
      if (document.visibility === 'private') {
        canAccess = isOwner;
      } else {
        canAccess = await canAccessContent(
          document.visibility, 
          document.userId, 
          document.organizationId ?? undefined, 
          document.teamId ?? undefined
        );
      }
      
      console.log('DocumentPage: Access check result:', {
        canAccess,
        userType,
        isOwner,
        documentVisibility: document.visibility
      });
    } catch (accessError) {
      console.error('DocumentPage: Access check error:', accessError);
      throw new ChatSDKError('forbidden:document', `Access check failed: ${accessError instanceof Error ? accessError.message : 'Unknown access error'}`);
    }

    if (!canAccess) {
      console.log('DocumentPage: Access denied');
      notFound();
    }
    const isReadOnly = !session?.user || !isOwner;

    const loadTime = Date.now() - startTime;
    console.log('DocumentPage: Successfully loaded document in', loadTime, 'ms');

    return (
      <div className="h-full flex flex-col">
        <GuestAccessBanner 
          userType={userType} 
          contentType="document" 
          className="mx-4 mt-4" 
        />
        <div className="flex-1">
          <Suspense fallback={<DocumentSkeleton />}>
            <DocumentView
              document={document}
              userId={session?.user?.id || ''}
              isOwner={isOwner}
              session={session}
              isReadOnly={isReadOnly}
              userType={userType}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    console.error('DocumentPage: Fatal error after', Date.now() - startTime, 'ms:', {
      error: {
        message: errorObj.message,
        name: errorObj.name,
        stack: errorObj.stack,
      },
      documentId: id,
      sessionExists: !!session,
      userType,
      documentsFound: documents?.length || 0,
      canAccess,
    });
    
    return <DocumentErrorComponent error={errorObj} documentId={id} />;
  }
}