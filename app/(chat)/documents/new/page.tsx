import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { DocumentEditor } from '@/components/document-editor';

export default async function NewDocumentPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <DocumentEditor
          userId={session.user.id}
          isNew={true}
        />
      </div>
    </div>
  );
}