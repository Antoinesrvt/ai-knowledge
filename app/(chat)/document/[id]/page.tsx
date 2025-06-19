import { notFound, redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { getDocumentsById } from '@/lib/db/queries';
import { DocumentView } from '@/components/document-view';
import { canAccessContent, getUserType } from '@/lib/auth-utils';
import { GuestAccessBanner } from '@/components/guest-access-banner';

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth();
  const { id } = await params;
  const documents = await getDocumentsById({ id });
  const document = documents[0];

  if (!document) {
    notFound();
  }

  // Check if user can access this document
  if (!canAccessContent(session, document.visibility, document.userId)) {
    notFound();
  }

  const userType = getUserType(session);
  const isOwner = session?.user?.id === document.userId;
  const isReadOnly = !session?.user || !isOwner;

  return (
    <div className="h-full flex flex-col">
      <GuestAccessBanner 
        userType={userType} 
        contentType="document" 
        className="mx-4 mt-4" 
      />
      <div className="flex-1">
        <DocumentView
          document={document}
          userId={session?.user?.id || ''}
          isOwner={isOwner}
          session={session}
          isReadOnly={isReadOnly}
          userType={userType}
        />
      </div>
    </div>
  );
}