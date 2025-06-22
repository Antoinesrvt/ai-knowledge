'use client';

import { useEffect, useState } from 'react';
import { useOrganization, useCurrentContext } from '@/lib/contexts/organization-context';
import { RecentActivity } from '@/components/recent-activity';
import { NotificationCenter } from '@/components/notification-center';
import { CentralSearchBar } from '@/components/central-search-bar';
import { ContextStats } from '@/components/context-stats';
import { QuickActions } from '@/components/quick-actions';
import { getDashboardData, type DashboardData } from '@/app/actions/dashboard';
import type { Document, Chat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, MessageSquare, Users, Building, Crown, User } from 'lucide-react';

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const { currentOrganization, currentTeam, isLoading: contextLoading } = useOrganization();
  const { contextLabel, contextType } = useCurrentContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on current context
  useEffect(() => {
    const fetchData = async () => {
      if (contextLoading) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getDashboardData(
          userId,
          contextType,
          currentOrganization?.id,
          currentTeam?.id
        );
        
        setDocuments(data.documents);
        setChats(data.chats);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, currentOrganization, currentTeam, contextType, contextLoading]);

  if (contextLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Dashboard
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {contextType === 'personal' ? 'Personal Dashboard' : `${contextLabel} Dashboard`}
          </h1>
          <p className="text-muted-foreground">
            {contextType === 'personal' && 'Your personal documents and chats'}
            {contextType === 'organization' && `Organization-wide content for ${currentOrganization?.name}`}
            {contextType === 'team' && `Team content for ${currentTeam?.name} in ${currentOrganization?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {contextType === 'personal' && <Users className="h-4 w-4" />}
          {contextType === 'organization' && <Building className="h-4 w-4" />}
          {contextType === 'team' && <Users className="h-4 w-4" />}
          <span>{contextLabel}</span>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <ContextStats 
        documentsCount={documents.length}
        chatsCount={chats.length}
        contextType={contextType}
      /> */}

      {/* Quick Actions */}
      <QuickActions contextType={contextType} />

      {/* Central Search Bar */}
      <CentralSearchBar
        contextType={contextType}
        contextLabel={contextLabel}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Left Column */}
        <div className="lg:col-span-2">
          <RecentActivity
            documents={documents.slice(0, 8)}
            chats={chats.slice(0, 8)}
            contextLabel={contextLabel}
          />
        </div>

        {/* Notifications and Stats - Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Teams Section */}
          <TeamsSection />
          
          <NotificationCenter
              documentsCount={documents.length}
              chatsCount={chats.length}
              contextType={contextType}
              contextLabel={contextLabel}
            />
        </div>
      </div>
    </div>
  );
}

function TeamsSection() {
  const { teams, currentTeam, setCurrentTeam, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Teams
          </CardTitle>
          <CardDescription>
            Teams you're a member of
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            You're not a member of any teams yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Teams ({teams.length})
        </CardTitle>
        <CardDescription>
          Teams you're a member of
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teams.map(({ team, role }) => (
            <div
              key={team.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                currentTeam?.id === team.id ? 'bg-muted border-primary' : 'bg-background'
              }`}
              onClick={() => setCurrentTeam(team)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{team.name}</p>
                    {team.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {team.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                    {role === 'member' && <User className="h-3 w-3 mr-1" />}
                    {role}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}