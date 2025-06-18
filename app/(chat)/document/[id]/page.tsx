import { auth } from '@/app/(auth)/auth';
import { notFound, redirect } from 'next/navigation';
import { getDocumentsById } from '@/lib/db/queries';
import { DocumentView } from '@/components/document-view';

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const documents = await getDocumentsById({ id });
  const document = documents[0];

  if (!document) {
    notFound();
  }

  // Check if user has access to private documents
  if (document.visibility === 'private' && document.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen">
      <DocumentView 
        document={document} 
        userId={session.user.id}
        isOwner={document.userId === session.user.id}
      />
    </div>
  );
}