import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getChats } from '@/lib/db/queries';
import { ChatGrid } from '@/components/chat-grid';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  MessageSquareIcon, 
  LockIcon, 
  UnlockIcon,
  Search,
  Filter,
  Grid3X3,
  MessageSquare,
  Lock,
  Share2,
  Users,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { generateUUID } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ChatsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const chats = await getChats(session.user.id);
  const publicChats = chats.filter(chat => chat.visibility === 'public');
  const privateChats = chats.filter(chat => chat.visibility === 'private');
  
  const handleNewChat = () => {
    const chatId = generateUUID();
    return `/chat/${chatId}`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                AI Conversations
              </h1>
              <p className="text-muted-foreground">
                Explore, organize, and continue your AI conversations
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 w-64"
                />
              </div>
              
              <Select defaultValue="recent">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              
              <Link href={handleNewChat()}>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  New Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-6">
        {chats.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-8 mb-6">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Start your AI journey</h2>
            <p className="text-muted-foreground mb-8 max-w-md text-lg">
              Begin your first conversation with AI to explore ideas, 
              get help with projects, or learn something new.
            </p>
            <Link href={handleNewChat()}>
              <Button size="lg" className="gap-2 text-lg px-8 py-3">
                <Sparkles className="h-5 w-5" />
                Start Your First Chat
              </Button>
            </Link>
          </div>
        ) : (
          // Clean Chat Grid Interface
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
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
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {chats.length} total
                </Badge>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Conversations</h2>
                <div className="text-sm text-muted-foreground">
                  {chats.length} conversation{chats.length !== 1 ? 's' : ''}
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
                <ChatGrid chats={chats} />
              </Suspense>
            </TabsContent>

            <TabsContent value="private" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  Private Conversations
                </h2>
                <div className="text-sm text-muted-foreground">
                  {privateChats.length} conversation{privateChats.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {privateChats.length === 0 ? (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No private conversations</h3>
                  <p className="text-muted-foreground mb-4">Start a private chat to keep your conversations secure</p>
                  <Link href={handleNewChat()}>
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Start Private Chat
                    </Button>
                  </Link>
                </div>
              ) : (
                <ChatGrid chats={privateChats} />
              )}
            </TabsContent>

            <TabsContent value="shared" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  Shared Conversations
                </h2>
                <div className="text-sm text-muted-foreground">
                  {publicChats.length} conversation{publicChats.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {publicChats.length === 0 ? (
                <div className="text-center py-12">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No shared conversations</h3>
                  <p className="text-muted-foreground mb-4">Share a conversation to collaborate with others</p>
                  <Link href={handleNewChat()}>
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Start Shared Chat
                    </Button>
                  </Link>
                </div>
              ) : (
                <ChatGrid chats={publicChats} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}