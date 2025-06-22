import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-6">
        {/* Stats and Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-xl" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </div>

        {/* Content and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-[150px]" />
              <Skeleton className="h-10 w-[300px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[180px] rounded-xl" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-8 w-[150px]" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[60px] rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}