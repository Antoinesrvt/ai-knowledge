'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';

import { 
  PlusIcon, 
  FileTextIcon, 
  MessageSquareIcon, 
  LayoutDashboardIcon,
  BuildingIcon,
  UsersIcon,
  ChevronDownIcon,
  CheckIcon
} from 'lucide-react';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { DocumentList } from '@/components/document-list';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import { useOrganization, useCurrentContext } from '@/lib/contexts/organization-context';

// Context Switcher Component
function ContextSwitcher() {
  const {
    currentOrganization,
    currentTeam,
    organizations,
    teams,
    setCurrentOrganization,
    setCurrentTeam,
    isLoading
  } = useOrganization();
  const { contextLabel } = useCurrentContext();

  if (isLoading) {
    return (
      <div className="px-2 py-1 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Organization Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2 text-left"
          >
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4" />
              <span className="truncate">
                {currentOrganization?.name || 'Personal'}
              </span>
            </div>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCurrentOrganization(null)}
            className="flex items-center gap-2"
          >
            {!currentOrganization && <CheckIcon className="h-4 w-4" />}
            <span className={!currentOrganization ? 'ml-0' : 'ml-6'}>Personal</span>
          </DropdownMenuItem>
          {organizations.map(({ organization }) => (
            <DropdownMenuItem
              key={organization.id}
              onClick={() => setCurrentOrganization(organization)}
              className="flex items-center gap-2"
            >
              {currentOrganization?.id === organization.id && <CheckIcon className="h-4 w-4" />}
              <span className={currentOrganization?.id === organization.id ? 'ml-0' : 'ml-6'}>
                {organization.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Team Switcher - Only show if in organization context */}
      {currentOrganization && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-2 text-left"
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span className="truncate">
                  {currentTeam?.name || 'All Teams'}
                </span>
              </div>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCurrentTeam(null)}
              className="flex items-center gap-2"
            >
              {!currentTeam && <CheckIcon className="h-4 w-4" />}
              <span className={!currentTeam ? 'ml-0' : 'ml-6'}>All Teams</span>
            </DropdownMenuItem>
            {teams.map(({ team }) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => setCurrentTeam(team)}
                className="flex items-center gap-2"
              >
                {currentTeam?.id === team.id && <CheckIcon className="h-4 w-4" />}
                <span className={currentTeam?.id === team.id ? 'ml-0' : 'ml-6'}>
                  {team.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Documents',
      href: '/documents',
      icon: FileTextIcon,
    },
    {
      title: 'Chats',
      href: '/chats',
      icon: MessageSquareIcon,
    },
  ];

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
        {/* Context Switcher */}
        <div className="px-2 pb-2">
          <ContextSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'w-full justify-start gap-3',
                        isActive && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarHistory user={user} />
        <DocumentList user={user} />
      </SidebarContent>
      <SidebarFooter className="gap-0">
        {user && (
          <SidebarGroup>
            <SidebarUserNav />
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
