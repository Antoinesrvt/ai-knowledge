'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Document } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { User } from '@/lib/types';

interface DocumentListProps {
  user: User | undefined;
}

export function DocumentList({ user }: DocumentListProps) {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: documents,
    isLoading,
    mutate,
  } = useSWR<Document[]>(
    user?.id ? `/api/documents?userId=${user.id}` : null,
    fetcher,
    {
      fallbackData: [],
    },
  );

  const handleCreateDocument = async () => {
    if (!user?.id || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Document',
          content: '',
          kind: 'text',
        }),
      });

      if (response.ok) {
        const newDocument = await response.json();
        mutate();
        setOpenMobile(false);
        router.push(`/document/${newDocument.id}`);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const { deleteDocumentAction } = await import('@/app/actions/documents');
      await deleteDocumentAction(documentId);
      mutate();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between px-2 py-2">
        <span className="font-semibold text-foreground">Documents</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted/70 transition-colors duration-200 disabled:opacity-50"
              onClick={handleCreateDocument}
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlusIcon size={16} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create New Document</TooltipContent>
        </Tooltip>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading ? (
            <div className="flex flex-col gap-2 py-2">
              {[...Array(3)].map((_, i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-2 bg-muted/70 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            documents.map((document) => (
              <SidebarMenuItem key={document.id}>
                <SidebarMenuButton asChild>
                  <Link
                    href={`/document/${document.id}`}
                    onClick={() => setOpenMobile(false)}
                    className="flex items-center justify-between group hover:bg-muted/50 transition-all duration-200 rounded-md px-2 py-2.5 border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileIcon size={16} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground group-hover:text-foreground">
                          {document.title || 'Untitled Document'}
                        </div>
                        <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                          {formatDistance(new Date(document.createdAt), new Date(), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive rounded-sm"
                      onClick={(e) => handleDeleteDocument(document.id, e)}
                      title="Delete document"
                    >
                      <TrashIcon size={12} />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <FileIcon size={24} />
              </div>
              <div className="text-sm font-medium text-muted-foreground text-center mb-1">
                No documents yet
              </div>
              <div className="text-xs text-muted-foreground/70 text-center max-w-[200px] leading-relaxed">
                Create your first document to start building your knowledge base
              </div>
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}