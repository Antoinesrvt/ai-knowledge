'use client';

import { formatDistanceToNow } from 'date-fns';
import { Users, FolderOpen, Settings, UserPlus, MoreVertical, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  projectCount: number;
  visibility: 'public' | 'private';
  role: 'admin' | 'member' | 'viewer';
  lastActivity: Date;
  avatar?: string;
}

interface TeamCardProps {
  team: Team;
  viewMode: 'grid' | 'list';
  userRole: 'owner' | 'admin' | 'member';
  onClick: () => void;
  onSettings: () => void;
  onInvite: () => void;
}

export function TeamCard({ team, viewMode, userRole, onClick, onSettings, onInvite }: TeamCardProps) {
  const canManageTeam = team.role === 'admin' || userRole === 'owner' || userRole === 'admin';
  const canInviteMembers = canManageTeam || team.role === 'member';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'member':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4" onClick={onClick}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={team.avatar} alt={team.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(team.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {team.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={getRoleBadgeColor(team.role)}
                  >
                    {team.role}
                  </Badge>
                  {team.visibility === 'private' ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {team.description && (
                  <p className="text-gray-600 text-sm truncate mb-2">
                    {team.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{team.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-4 w-4" />
                    <span>{team.projectCount} projects</span>
                  </div>
                  <span>•</span>
                  <span>Active {formatDistanceToNow(team.lastActivity)} ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canInviteMembers && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInvite();
                  }}
                  className="flex items-center gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              )}
              
              {canManageTeam && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onSettings}>
                      <Settings className="h-4 w-4 mr-2" />
                      Team Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onInvite}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Members
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3" onClick={onClick}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={team.avatar} alt={team.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                {team.visibility === 'private' ? (
                  <Lock className="h-4 w-4 text-gray-400" />
                ) : (
                  <Globe className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <Badge 
                variant="outline" 
                className={`${getRoleBadgeColor(team.role)} text-xs`}
              >
                {team.role}
              </Badge>
            </div>
          </div>
          
          {canManageTeam && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Team Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onInvite}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={onClick}>
        {team.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {team.description}
          </CardDescription>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{team.memberCount} members</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <FolderOpen className="h-4 w-4" />
              <span>{team.projectCount} projects</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Active {formatDistanceToNow(team.lastActivity)} ago
          </div>
          
          {canInviteMembers && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                onInvite();
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}