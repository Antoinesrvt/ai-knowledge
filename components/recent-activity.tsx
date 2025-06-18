'use client';

import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Clock } from 'lucide-react';
import type { Document, Chat } from '@/lib/db/schema';

interface RecentActivityProps {
  documents: Document[];
  chats: Chat[];
}

export function RecentActivity({ documents, chats }: RecentActivityProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Your latest work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Documents</CardTitle>
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
                    className="flex items-start space-x-3 group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="font-medium leading-none truncate group-hover:text-primary transition-colors">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Chats</CardTitle>
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
                    className="flex items-start space-x-3 group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="font-medium leading-none truncate group-hover:text-primary transition-colors">
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