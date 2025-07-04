'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from '@/lib/types';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  compact = false,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const { width: windowWidth } = useWindowSize();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {!isReadonly && (
          <>
            <ModelSelector
              session={session}
              selectedModelId={selectedModelId}
              onModelChange={() => {}}
              compact={true}
            />
            <VisibilitySelector
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
              className=""
              compact={true}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!isReadonly && (
        <div className="order-1 md:order-2">
          <ModelSelector
            session={session}
            selectedModelId={selectedModelId}
            onModelChange={() => {}}
          />
        </div>
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

    
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
