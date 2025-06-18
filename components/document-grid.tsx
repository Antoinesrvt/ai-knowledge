'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Trash2 } from 'lucide-react';
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
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedDocuments.map((doc) => (
          <Card key={doc.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-lg font-medium truncate">
                {doc.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span className="capitalize">{doc.kind}</span>
                </div>
                <span>•</span>
                <span>
                  {formatDistance(new Date(doc.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button
                variant="ghost"
                className="hover:bg-primary/10 hover:text-primary"
                onClick={() => router.push(`/document/${doc.id}`)}
              >
                Open
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-destructive/10 hover:text-destructive"
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