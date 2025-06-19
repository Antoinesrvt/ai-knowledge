'use client';

import { User } from 'next-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { Search, Bell } from 'lucide-react';
import { useState } from 'react';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-lg">Knowledge</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/documents" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Documents
            </Link>
            <Link 
              href="/chats" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Chats
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents, chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}