'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Share2, FileText, MessageSquare, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface NotificationCenterProps {
  documentsCount: number;
  chatsCount: number;
  contextType: 'personal' | 'organization' | 'team';
  contextLabel: string;
}

interface Notification {
  id: string;
  type: 'share' | 'system' | 'collaboration';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action: string | null;
}

export function NotificationCenter({ documentsCount, chatsCount, contextType, contextLabel }: NotificationCenterProps) {
  // Context-aware notifications - in a real app, these would come from your backend
  const getContextNotifications = (): Notification[] => {
    const baseNotifications: Notification[] = [
      {
        id: '2',
        type: 'system',
        title: 'Backup completed',
        message: `Your ${contextType === 'personal' ? 'personal' : contextLabel} content has been backed up`,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        action: null,
      },
    ];

    if (contextType === 'organization' || contextType === 'team') {
      baseNotifications.unshift(
        {
          id: '1',
          type: 'share',
          title: `Document shared in ${contextLabel}`,
          message: `John shared "AI Research Notes" in ${contextLabel}`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          action: 'View Document',
        },
        {
          id: '3',
          type: 'collaboration',
          title: `New activity in ${contextLabel}`,
          message: `Sarah commented on "Project Proposal"`,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: false,
          action: 'View Comment',
        }
      );
    } else {
      baseNotifications.unshift(
        {
          id: '1',
          type: 'share',
          title: 'Document shared with you',
          message: 'John shared "Personal Notes" with you',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          action: 'View Document',
        }
      );
    }

    return baseNotifications;
  };

  const notifications = getContextNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'share':
        return <Share2 className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'collaboration':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    const opacity = read ? '5' : '10';
    switch (type) {
      case 'share':
        return `bg-blue-500/${opacity}`;
      case 'system':
        return `bg-green-500/${opacity}`;
      case 'collaboration':
        return `bg-purple-500/${opacity}`;
      default:
        return `bg-gray-500/${opacity}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/20">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              Notifications
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                  notification.read ? 'bg-muted/30' : 'bg-background border-primary/20'
                } ${getNotificationBg(notification.type, notification.read)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        notification.read ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistance(notification.timestamp, new Date(), { addSuffix: true })}
                      </span>
                      {notification.action && (
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          {notification.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {notifications.length > 0 && (
            <Button variant="ghost" className="w-full text-sm" size="sm">
              View All Notifications
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}