'use client';

import { ChevronUp, LoaderIcon } from 'lucide-react';
import Image from 'next/image';
import type { User } from '@/lib/types';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from './toast';
import { guestRegex } from '@/lib/constants';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const stackUser = useUser();
  const { setTheme, resolvedTheme } = useTheme();

  const isGuest = guestRegex.test(stackUser?.primaryEmail ?? '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {status === 'loading' ? (
          <Button variant="ghost" className="h-10 justify-between px-3">
            <div className="flex flex-row gap-2 items-center">
              <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
              <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
                Loading auth status
              </span>
            </div>
            <div className="animate-spin text-zinc-500">
              <LoaderIcon className="h-4 w-4" />
            </div>
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="h-10 px-3 justify-start gap-2"
            data-testid="user-nav-button"
          >
            <Image
              src={`https://avatar.vercel.sh/${user.email}`}
              alt={user.email ?? 'User Avatar'}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span data-testid="user-email" className="truncate max-w-[120px]">
              {isGuest ? 'Guest' : user?.email}
            </span>
            <ChevronUp className="ml-auto h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-testid="user-nav-menu"
        side="bottom"
        align="end"
        className="w-[200px]"
      >
        <DropdownMenuItem
          data-testid="user-nav-item-theme"
          className="cursor-pointer"
          onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {`Toggle ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        </DropdownMenuItem>
        {!isGuest && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="user-nav-item-settings"
              className="cursor-pointer"
              onSelect={() => router.push('/settings')}
            >
              Settings
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="user-nav-item-sign-out"
          className="cursor-pointer"
          onSelect={async () => {
            await stackUser?.signOut();
            router.push('/');
            toast({
              type: 'success',
              description: 'Signed out successfully',
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}