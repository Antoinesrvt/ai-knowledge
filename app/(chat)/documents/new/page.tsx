import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { CreateDocumentInterface } from '@/components/create-document-interface';

export default async function NewDocumentPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Create New Document
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose from various document types, import existing files, or start with a template to bring your ideas to life.
            </p>
          </div>
          
          <CreateDocumentInterface userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}