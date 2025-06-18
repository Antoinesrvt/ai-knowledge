'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText, MessageSquare, Star, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  documentsCount: number;
  chatsCount: number;
}

export function StatsOverview({ documentsCount, chatsCount }: StatsOverviewProps) {
  const stats = [
    {
      name: 'Total Documents',
      value: documentsCount,
      icon: FileText,
      description: 'Documents created',
      trend: '+4.75%',
      trendDirection: 'up',
    },
    {
      name: 'Active Chats',
      value: chatsCount,
      icon: MessageSquare,
      description: 'AI conversations',
      trend: '+12.3%',
      trendDirection: 'up',
    },
    {
      name: 'AI Interactions',
      value: documentsCount + chatsCount,
      icon: Star,
      description: 'Total AI assists',
      trend: '+8.2%',
      trendDirection: 'up',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">Your AI workspace stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">{stat.name}</h3>
                  </div>
                  <span
                    className={`text-xs font-medium ${stat.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>

                <div className="mt-4 h-[60px]">
                  {/* Placeholder for future charts/graphs */}
                  <div className="w-full h-full bg-gradient-to-r from-primary/5 to-primary/20 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}