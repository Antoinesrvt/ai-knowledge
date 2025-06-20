'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Document } from '@/lib/db/schema';
import type { User } from '@/lib/types';
import type { Session } from '@/lib/types';
import { ArrowLeftIcon, TrashIcon } from 'lucide-react';
import { SplitView } from '@/components/split-view';
import type { UserType } from '@/lib/auth-utils';

interface DocumentViewProps {
  document: Document;
  userId: string;
  isOwner: boolean;
  session?: Session | null;
  isReadOnly?: boolean;
  userType?: UserType;
}

export function DocumentView({ 
  document, 
  userId, 
  isOwner, 
  session, 
  isReadOnly = false,
  userType = 'unauthenticated'
}: DocumentViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (title: string, content: string) => {
    if (!isOwner || isReadOnly) {
      toast.error('You do not have permission to edit this document');
      return;
    }

    try {
      const response = await fetch('/api/document', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: document.id,
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isReadOnly) {
      toast.error('You do not have permission to delete this document');
      return;
    }

    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: document.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Document deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SplitView
        document={document}
        userId={userId}
        isOwner={isOwner}
        onSave={handleSave}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        onBack={() => router.back()}
        session={session}
        isReadOnly={isReadOnly}
        userType={userType}
      />
    </div>
  );
}