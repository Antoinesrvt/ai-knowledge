'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingChangesAction, acceptPendingChangeAction, rejectPendingChangeAction } from '@/app/actions/pending-changes';
import type { PendingChange } from '@/lib/db/schema-pending-changes';
import { toast } from 'sonner';

interface UsePendingChangesProps {
  documentId: string;
  documentCreatedAt: Date;
  onContentUpdate?: (content: string) => void;
}

interface UsePendingChangesReturn {
  pendingChanges: PendingChange[];
  isLoading: boolean;
  acceptChange: (changeId: string) => Promise<void>;
  rejectChange: (changeId: string) => Promise<void>;
  refreshChanges: () => Promise<void>;
}

export function usePendingChanges({
  documentId,
  documentCreatedAt,
  onContentUpdate,
}: UsePendingChangesProps): UsePendingChangesReturn {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshChanges = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPendingChangesAction(documentId);
      setPendingChanges(result);
    } catch (error) {
      console.error('Error fetching pending changes:', error);
      toast.error('Failed to load pending changes');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const acceptChange = useCallback(async (changeId: string) => {
    try {
      // Note: We need to get the current content to pass to the action
      // For now, we'll pass an empty string and let the backend handle it
      const result = await acceptPendingChangeAction({ changeId, newContent: '' });
      if (result.success) {
        await refreshChanges();
        toast.success('Change accepted successfully');
      }
    } catch (error) {
      console.error('Error accepting change:', error);
      toast.error('Failed to accept change');
    }
  }, [refreshChanges]);

  const rejectChange = useCallback(async (changeId: string) => {
    try {
      const result = await rejectPendingChangeAction(changeId);
      if (result.success) {
        await refreshChanges();
        toast.success('Change rejected');
      }
    } catch (error) {
      console.error('Error rejecting change:', error);
      toast.error('Failed to reject change');
    }
  }, [refreshChanges]);

  useEffect(() => {
    refreshChanges();
  }, [refreshChanges]);

  return {
    pendingChanges,
    isLoading,
    acceptChange,
    rejectChange,
    refreshChanges,
  };
}