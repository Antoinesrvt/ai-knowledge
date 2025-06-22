'use client';

import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Clock } from 'lucide-react';
import type { Document, Chat } from '@/lib/db/schema';

interface RecentActivityProps {
  documents: Document[];
  chats: Chat[];
  contextLabel?: string;
}

export function RecentActivity({ documents, chats, contextLabel }: RecentActivityProps) {
  const getActivityDescription = () => {
    if (contextLabel && contextLabel !== 'Personal') {
      return `Latest activity in ${contextLabel}`;
    }
    return 'Your latest work';
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">{getActivityDescription()}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last updated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent documents</p>
              ) : (
                documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/document/${doc.id}`}
                    className="flex items-start space-x-3 p-3 rounded-lg group hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30 transition-colors">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="font-medium leading-none truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {doc.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(new Date(doc.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/20">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Recent Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent chats</p>
              ) : (
                chats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="flex items-start space-x-3 p-3 rounded-lg group hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 dark:bg-green-900/20 dark:group-hover:bg-green-900/30 transition-colors">
                      <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="font-medium leading-none truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {chat.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(new Date(chat.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}