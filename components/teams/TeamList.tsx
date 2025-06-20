'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TeamCard } from './TeamCard';
import { TeamInviteModal } from './TeamInviteModal';
import { TeamSettingsModal } from './TeamSettingsModal';

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

interface TeamListProps {
  organizationId: string;
  userRole: 'owner' | 'admin' | 'member';
}

export function TeamList({ organizationId, userRole }: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTeams();
  }, [organizationId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${organizationId}/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    // Navigate to team creation page
    window.location.href = '/teams/create';
  };

  const handleTeamClick = (team: Team) => {
    window.location.href = `/teams/${team.id}`;
  };

  const handleTeamSettings = (team: Team) => {
    setSelectedTeam(team);
    setShowSettingsModal(true);
  };

  const handleInviteMembers = (team: Team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  const canCreateTeam = userRole === 'owner' || userRole === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">
            Collaborate with your team members across projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              List
            </Button>
          </div>
          {canCreateTeam && (
            <Button onClick={handleCreateTeam} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              Across your organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((sum, team) => sum + team.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total team members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((sum, team) => sum + team.projectCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all teams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid/List */}
      {teams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first team to start collaborating with your organization.
            </p>
            {canCreateTeam && (
              <Button onClick={handleCreateTeam} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Create Your First Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              viewMode={viewMode}
              userRole={userRole}
              onClick={() => handleTeamClick(team)}
              onSettings={() => handleTeamSettings(team)}
              onInvite={() => handleInviteMembers(team)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showInviteModal && selectedTeam && (
        <TeamInviteModal
          team={selectedTeam}
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedTeam(null);
          }}
          onSuccess={fetchTeams}
        />
      )}

      {showSettingsModal && selectedTeam && (
        <TeamSettingsModal
          team={selectedTeam}
          isOpen={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedTeam(null);
          }}
          onSuccess={fetchTeams}
        />
      )}
    </div>
  );
}