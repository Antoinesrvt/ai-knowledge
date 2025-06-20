'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle, Globe, Lock, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface TeamSettings {
  name: string;
  description: string;
  visibility: 'public' | 'private';
  defaultMemberRole: 'admin' | 'member' | 'viewer';
  allowMemberInvites: boolean;
  requireApprovalForJoining: boolean;
  allowGuestAccess: boolean;
  autoArchiveInactiveDays: number;
}

interface TeamSettingsModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TeamSettingsModal({ team, isOpen, onClose, onSuccess }: TeamSettingsModalProps) {
  const [settings, setSettings] = useState<TeamSettings>({
    name: team.name,
    description: team.description || '',
    visibility: team.visibility,
    defaultMemberRole: 'member',
    allowMemberInvites: false,
    requireApprovalForJoining: true,
    allowGuestAccess: false,
    autoArchiveInactiveDays: 90
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeamSettings();
    }
  }, [isOpen, team.id]);

  useEffect(() => {
    const originalSettings = {
      name: team.name,
      description: team.description || '',
      visibility: team.visibility,
      defaultMemberRole: 'member' as const,
      allowMemberInvites: false,
      requireApprovalForJoining: true,
      allowGuestAccess: false,
      autoArchiveInactiveDays: 90
    };
    
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, team]);

  if (!isOpen) return null;

  const fetchTeamSettings = async () => {
    try {
      const response = await fetch(`/api/teams/${team.id}/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to fetch team settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update team settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== team.name) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Redirect to teams page
        window.location.href = '/teams';
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof TeamSettings>(key: K, value: TeamSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Team Settings</CardTitle>
            <CardDescription className="mt-1">
              Manage settings for <strong>{team.name}</strong>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={settings.name}
                    onChange={(e) => updateSetting('name', e.target.value)}
                    placeholder="Enter team name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="team-description">Description</Label>
                  <textarea
                    id="team-description"
                    value={settings.description}
                    onChange={(e) => updateSetting('description', e.target.value)}
                    placeholder="Describe what this team works on..."
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md resize-none h-24 text-sm"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {settings.description.length}/500 characters
                  </div>
                </div>

                <div>
                  <Label htmlFor="visibility">Team Visibility</Label>
                  <Select 
                    value={settings.visibility} 
                    onValueChange={(value: 'public' | 'private') => updateSetting('visibility', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Private</div>
                            <div className="text-xs text-gray-500">Only invited members can see this team</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Public</div>
                            <div className="text-xs text-gray-500">Anyone in the organization can see this team</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="default-role">Default Role for New Members</Label>
                  <Select 
                    value={settings.defaultMemberRole} 
                    onValueChange={(value: 'admin' | 'member' | 'viewer') => updateSetting('defaultMemberRole', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                      <SelectItem value="member">Member - Can create and edit content</SelectItem>
                      <SelectItem value="admin">Admin - Full team management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Members to Invite Others</Label>
                      <div className="text-sm text-gray-500">
                        Let team members invite new people to the team
                      </div>
                    </div>
                    <Switch
                      checked={settings.allowMemberInvites}
                      onCheckedChange={(checked) => updateSetting('allowMemberInvites', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Approval for Joining</Label>
                      <div className="text-sm text-gray-500">
                        Team admins must approve new member requests
                      </div>
                    </div>
                    <Switch
                      checked={settings.requireApprovalForJoining}
                      onCheckedChange={(checked) => updateSetting('requireApprovalForJoining', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Guest Access</Label>
                    <div className="text-sm text-gray-500">
                      Allow external collaborators to access team content
                    </div>
                  </div>
                  <Switch
                    checked={settings.allowGuestAccess}
                    onCheckedChange={(checked) => updateSetting('allowGuestAccess', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="auto-archive">Auto-archive Inactive Content</Label>
                  <Select 
                    value={settings.autoArchiveInactiveDays.toString()} 
                    onValueChange={(value) => updateSetting('autoArchiveInactiveDays', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">After 30 days</SelectItem>
                      <SelectItem value="60">After 60 days</SelectItem>
                      <SelectItem value="90">After 90 days</SelectItem>
                      <SelectItem value="180">After 6 months</SelectItem>
                      <SelectItem value="365">After 1 year</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 mt-1">
                    Automatically archive documents and chats that haven't been accessed
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-6">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-700">
                      These actions cannot be undone. Please proceed with caution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!showDeleteConfirm ? (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Team
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="delete-confirm">Type the team name to confirm deletion:</Label>
                          <Input
                            id="delete-confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={team.name}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteConfirmText !== team.name || isLoading}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {isLoading ? 'Deleting...' : 'Delete Team'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}