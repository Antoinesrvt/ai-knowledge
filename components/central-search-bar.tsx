'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MessageSquarePlus, FileText, Sparkles, Zap } from 'lucide-react';
import { generateUUID } from '@/lib/utils';
import { useOrganization } from '@/lib/contexts/organization-context';

interface CentralSearchBarProps {
  contextType: 'personal' | 'organization' | 'team';
  contextLabel: string;
}

export function CentralSearchBar({ contextType, contextLabel }: CentralSearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentOrganization, currentTeam } = useOrganization();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, redirect to documents page with search query
      router.push(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewChat = () => {
    const chatId = generateUUID();
    router.push(`/workspace/${chatId}`);
  };

  const handleNewDocument = () => {
    router.push('/documents/new');
  };

  return (
    <Card className="overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Welcome Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {contextType === 'personal' ? 'Welcome to AI Knowledge' : `Welcome to ${contextLabel}`}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {contextType === 'personal' 
                ? 'Search your personal knowledge base or start a new conversation'
                : `Search ${contextLabel} knowledge base or collaborate with your team`
              }
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents, chats, or ask AI anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg border-2 focus:border-primary/50 transition-all"
              />
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleNewChat}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageSquarePlus className="h-5 w-5" />
              Start New Chat
            </Button>
            
            <Button
              onClick={handleNewDocument}
              variant="outline"
              size="lg"
              className="gap-2 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
            >
              <FileText className="h-5 w-5" />
              Create Document
            </Button>
          </div>

          {/* Quick Tips */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Press Enter to search</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Or use quick actions above</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CentralSearchBar;