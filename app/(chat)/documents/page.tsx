import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getDocuments } from '@/lib/db/queries';
import { DocumentGrid } from '@/components/document-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  FileTextIcon, 
  FolderIcon, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Share2, 
  Lock, 
  Users, 
  Calendar,
  SortAsc,
  SortDesc
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DocumentsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const documents = await getDocuments(session.user.id);
  const publicDocuments = documents.filter(doc => doc.visibility === 'public');
  const privateDocuments = documents.filter(doc => doc.visibility === 'private');
  
  // Mock shared documents - in a real app, these would come from your backend
  const sharedWithMeDocuments = documents.filter(doc => doc.visibility === 'public').slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FolderIcon className="h-8 w-8 text-primary" />
                My Drive
              </h1>
              <p className="text-muted-foreground">
                Organize, search, and manage your knowledge documents
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10 w-64"
                />
              </div>
              
              <Select defaultValue="modified">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modified">Modified</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              
              <Link href="/documents/new">
                <Button className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  New
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-6">
        {documents.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-8 mb-6">
              <FileTextIcon className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Your drive is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md text-lg">
              Start building your knowledge base by creating your first document. 
              Organize, share, and collaborate on your ideas.
            </p>
            <Link href="/documents/new">
              <Button size="lg" className="gap-2 text-lg px-8 py-3">
                <PlusIcon className="h-5 w-5" />
                Create Your First Document
              </Button>
            </Link>
          </div>
        ) : (
          // Drive Interface with Tabs
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="all" className="gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="private" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Private
                </TabsTrigger>
                <TabsTrigger value="shared" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Shared
                </TabsTrigger>
                <TabsTrigger value="shared-with-me" className="gap-2">
                  <Users className="h-4 w-4" />
                  With Me
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <FileTextIcon className="h-3 w-3" />
                  {documents.length} total
                </Badge>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Documents</h2>
                <div className="text-sm text-muted-foreground">
                  {documents.length} document{documents.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              }>
                <DocumentGrid documents={documents} />
              </Suspense>
            </TabsContent>

            <TabsContent value="private" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  Private Documents
                </h2>
                <div className="text-sm text-muted-foreground">
                  {privateDocuments.length} document{privateDocuments.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {privateDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No private documents</h3>
                  <p className="text-muted-foreground mb-4">Create a private document to get started</p>
                  <Link href="/documents/new">
                    <Button variant="outline" className="gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Create Private Document
                    </Button>
                  </Link>
                </div>
              ) : (
                <DocumentGrid documents={privateDocuments} />
              )}
            </TabsContent>

            <TabsContent value="shared" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  Shared Documents
                </h2>
                <div className="text-sm text-muted-foreground">
                  {publicDocuments.length} document{publicDocuments.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {publicDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No shared documents</h3>
                  <p className="text-muted-foreground mb-4">Share a document to collaborate with others</p>
                  <Link href="/documents/new">
                    <Button variant="outline" className="gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Create Shared Document
                    </Button>
                  </Link>
                </div>
              ) : (
                <DocumentGrid documents={publicDocuments} />
              )}
            </TabsContent>

            <TabsContent value="shared-with-me" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Shared With Me
                </h2>
                <div className="text-sm text-muted-foreground">
                  {sharedWithMeDocuments.length} document{sharedWithMeDocuments.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {sharedWithMeDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No shared documents</h3>
                  <p className="text-muted-foreground">Documents shared with you will appear here</p>
                </div>
              ) : (
                <DocumentGrid documents={sharedWithMeDocuments} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}