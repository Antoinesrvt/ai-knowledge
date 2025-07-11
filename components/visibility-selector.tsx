'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
} from 'lucide-react';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

export type VisibilityType = 'private' | 'public' | 'organization' | 'team';

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can access this chat',
    icon: <LockIcon />,
  },
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone with the link can access this chat',
    icon: <GlobeIcon />,
  },
  {
    id: 'organization',
    label: 'Organization',
    description: 'Anyone in your organization can access this chat',
    icon: <GlobeIcon />,
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Anyone in your team can access this chat',
    icon: <GlobeIcon />,
  },
];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
  compact = false,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  compact?: boolean;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((visibility) => visibility.id === visibilityType),
    [visibilityType],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="visibility-selector"
          variant="outline"
          className={cn(
            "hidden md:flex md:px-2 md:h-[34px]",
            compact && "h-8 px-2 text-xs flex"
          )}
        >
          <span className={compact ? "h-3 w-3" : ""}>{selectedVisibility?.icon}</span>
          {!compact && selectedVisibility?.label}
          <ChevronDownIcon className={compact ? "h-3 w-3" : ""} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {visibilities.map((visibility) => (
          <DropdownMenuItem
            data-testid={`visibility-selector-item-${visibility.id}`}
            key={visibility.id}
            onSelect={() => {
              setVisibilityType(visibility.id);
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={visibility.id === visibilityType}
          >
            <div className="flex flex-col gap-1 items-start">
              {visibility.label}
              {visibility.description && (
                <div className="text-xs text-muted-foreground">
                  {visibility.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
