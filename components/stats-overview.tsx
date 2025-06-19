'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText, MessageSquare, Star, TrendingUp, Activity, Clock } from 'lucide-react';

interface StatsOverviewProps {
  documentsCount: number;
  chatsCount: number;
}

export function StatsOverview({ documentsCount, chatsCount }: StatsOverviewProps) {
  const totalInteractions = documentsCount + chatsCount;
  const recentActivity = Math.floor(totalInteractions * 0.3); // Simulate recent activity
  
  const stats = [
    {
      name: 'Total Documents',
      value: documentsCount,
      icon: FileText,
      description: 'Knowledge documents',
      trend: documentsCount > 0 ? '+' + Math.floor(documentsCount * 0.15) + '%' : '0%',
      trendDirection: 'up' as const,
      color: 'bg-blue-500/10 text-blue-600',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Active Chats',
      value: chatsCount,
      icon: MessageSquare,
      description: 'AI conversations',
      trend: chatsCount > 0 ? '+' + Math.floor(chatsCount * 0.25) + '%' : '0%',
      trendDirection: 'up' as const,
      color: 'bg-green-500/10 text-green-600',
      iconColor: 'text-green-600',
    },
    {
      name: 'Total Interactions',
      value: totalInteractions,
      icon: Activity,
      description: 'Combined activities',
      trend: totalInteractions > 0 ? '+' + Math.floor(totalInteractions * 0.18) + '%' : '0%',
      trendDirection: 'up' as const,
      color: 'bg-purple-500/10 text-purple-600',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Recent Activity',
      value: recentActivity,
      icon: Clock,
      description: 'This week',
      trend: recentActivity > 0 ? '+' + Math.floor(recentActivity * 0.4) + '%' : '0%',
      trendDirection: 'up' as const,
      color: 'bg-orange-500/10 text-orange-600',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">Your AI workspace stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      {stat.trend}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">{stat.name}</h3>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>

                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${stat.iconColor.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(stat.value * 10, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}