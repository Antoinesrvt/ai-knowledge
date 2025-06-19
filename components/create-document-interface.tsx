'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Code, Table, Image, MessageSquare } from 'lucide-react';
import { createEmptyDocument } from '@/app/actions/documents';
import type { ArtifactKind } from './artifact';

const documentTypes = [
  {
    kind: 'text' as ArtifactKind,
    title: 'Text Document',
    description: 'Create a new text document for writing and notes',
    icon: FileText,
  },
  {
    kind: 'code' as ArtifactKind,
    title: 'Code Document',
    description: 'Create a new code document for programming',
    icon: Code,
  },
  {
    kind: 'sheet' as ArtifactKind,
    title: 'Spreadsheet',
    description: 'Create a new spreadsheet for data and calculations',
    icon: Table,
  },
  {
    kind: 'image' as ArtifactKind,
    title: 'Image Document',
    description: 'Create a new document for images and visual content',
    icon: Image,
  },
];

interface CreateDocumentInterfaceProps {
  userId: string;
}

export function CreateDocumentInterface({ userId }: CreateDocumentInterfaceProps) {
  const [selectedType, setSelectedType] = useState<ArtifactKind | null>(null);
  const [title, setTitle] = useState('');
  const [withChat, setWithChat] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDocument = async (kind: ArtifactKind) => {
    if (!selectedType) {
      setSelectedType(kind);
      return;
    }

    setIsCreating(true);
    try {
      await createEmptyDocument({
        kind,
        title: title || undefined,
        withChat,
        userId
      });
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setTitle('');
    setWithChat(false);
  };

  if (selectedType) {
    const selectedDocType = documentTypes.find(type => type.kind === selectedType);
    const Icon = selectedDocType?.icon || FileText;

    return (
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Configure Your Document</h1>
          <p className="text-muted-foreground">
            Customize your {selectedDocType?.title.toLowerCase()}
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>{selectedDocType?.title}</CardTitle>
                <CardDescription>{selectedDocType?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Enter a title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="withChat"
                checked={withChat}
                onChange={(e) => setWithChat(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="withChat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Create with linked chat
              </Label>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => handleCreateDocument(selectedType)}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : `Create ${selectedDocType?.title}`}
              </Button>
              <Button 
                variant="outline"
                onClick={resetForm}
                disabled={isCreating}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create New Document</h1>
        <p className="text-muted-foreground">
          Choose the type of document you want to create
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {documentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.kind} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleCreateDocument(type.kind)}
                  className="w-full"
                >
                  Create {type.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}