'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentEditorProps {
  userId: string;
  isNew?: boolean;
  documentId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialVisibility?: 'public' | 'private';
}

export function DocumentEditor({
  userId,
  isNew = false,
  documentId,
  initialTitle = '',
  initialContent = '',
  initialVisibility = 'private'
}: DocumentEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [visibility, setVisibility] = useState<'public' | 'private'>(initialVisibility);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your document');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/documents', {
        method: isNew ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(documentId && { id: documentId }),
          title: title.trim(),
          content: content.trim(),
          visibility,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      const savedDocument = await response.json();
      
      toast.success(isNew ? 'Document created successfully!' : 'Document updated successfully!');
      
      if (isNew) {
        router.push(`/document/${savedDocument.id}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isNew ? 'Create New Document' : 'Edit Document'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Private
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Public
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Start writing your document..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : (isNew ? 'Create Document' : 'Save Changes')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}