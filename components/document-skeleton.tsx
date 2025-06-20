'use client';

import { ArtifactKind } from './artifact';

export const DocumentSkeleton = ({
  artifactKind,
}: {
  artifactKind?: ArtifactKind;
} = {}) => {
  return artifactKind === 'image' ? (
    <div className="flex flex-col gap-4 w-full justify-center items-center h-[calc(100dvh-60px)]">
      <div className="animate-pulse rounded-lg bg-muted-foreground/20 size-96" />
    </div>
  ) : (
    <div className="flex flex-col gap-4 w-full p-4">
      {/* Document header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="animate-pulse rounded-lg h-8 bg-muted-foreground/20 w-32" />
        <div className="animate-pulse rounded-lg h-8 bg-muted-foreground/20 w-24" />
      </div>
      
      {/* Document title skeleton */}
      <div className="animate-pulse rounded-lg h-12 bg-muted-foreground/20 w-3/4 mb-4" />
      
      {/* Document content skeleton */}
      <div className="space-y-3">
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-4/5" />
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-3/4" />
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-2/3" />
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex gap-2 mt-6">
        <div className="animate-pulse rounded-lg h-10 bg-muted-foreground/20 w-20" />
        <div className="animate-pulse rounded-lg h-10 bg-muted-foreground/20 w-16" />
      </div>
    </div>
  );
};

export const InlineDocumentSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-48" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-1/2" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-40" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-36" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64" />
    </div>
  );
};
