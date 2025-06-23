'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Trash2, Lock, Unlock, Eye, Calendar, Clock } from 'lucide-react';
import type { Document } from '@/lib/db/schema';

interface DocumentGridProps {
  documents: Document[];
}

type SortOption = 'newest' | 'oldest' | 'alphabetical';

export function DocumentGrid({ documents }: DocumentGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { deleteDocumentAction } = await import('@/app/actions/documents');
      await deleteDocumentAction(documentId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const filteredAndSortedDocuments = documents
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedDocuments.map((doc) => (
          <Card key={doc.id} className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                    {doc.title || 'Untitled Document'}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.visibility === 'private' ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
              
              {/* Document Preview/Description */}
              {doc.content && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {doc.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistance(new Date(doc.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.visibility === 'private' 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {doc.visibility}
                  </span>
                </div>
              </div>
              
              {/* Document Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Type:</span>
                <span className="text-xs font-medium capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                  {doc.kind || 'document'}
                </span>
              </div>
            </CardContent>
            
            <CardFooter className="flex gap-2 pt-4">
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-2 group-hover:shadow-md transition-all"
                onClick={() => router.push(`/workspace/${doc.id}`)}
              >
                <Eye className="h-4 w-4" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                onClick={() => handleDeleteDocument(doc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredAndSortedDocuments.length === 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No documents found</p>
        </div>
      )}
    </div>
  );
}