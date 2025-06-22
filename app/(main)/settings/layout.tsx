import { Suspense } from 'react'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { SettingsHeader } from '@/components/settings/SettingsHeader'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SettingsLayoutProps {
  children: React.ReactNode
}

function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Settings Sidebar */}
      <div className="w-64 border-r bg-muted/10">
        <Suspense fallback={<div className="p-4"><Skeleton className="h-8 w-32" /></div>}>
          <SettingsSidebar />
        </Suspense>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Settings Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Suspense fallback={<div className="p-4"><Skeleton className="h-10 w-48" /></div>}>
            <SettingsHeader />
          </Suspense>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto p-6">
            <Suspense fallback={<SettingsLoadingSkeleton />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}