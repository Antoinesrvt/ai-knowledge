'use client';

import { useState } from 'react';
import { X, Mail, UserPlus, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

interface TeamInviteModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InviteEmail {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'pending' | 'sent' | 'error';
  error?: string;
}

export function TeamInviteModal({ team, isOpen, onClose, onSuccess }: TeamInviteModalProps) {
  const [emails, setEmails] = useState<InviteEmail[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentRole, setCurrentRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = () => {
    if (!currentEmail.trim()) return;
    
    if (!validateEmail(currentEmail)) {
      return;
    }

    if (emails.some(e => e.email === currentEmail)) {
      return;
    }

    setEmails(prev => [...prev, {
      email: currentEmail,
      role: currentRole,
      status: 'pending'
    }]);
    setCurrentEmail('');
  };

  const removeEmail = (index: number) => {
    setEmails(prev => prev.filter((_, i) => i !== index));
  };

  const updateEmailRole = (index: number, role: 'admin' | 'member' | 'viewer') => {
    setEmails(prev => prev.map((email, i) => 
      i === index ? { ...email, role } : email
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const sendInvites = async () => {
    if (emails.length === 0) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/teams/${team.id}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invites: emails.map(e => ({ email: e.email, role: e.role })),
          message: message.trim() || undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update email statuses based on response
        setEmails(prev => prev.map(email => {
          const invite = result.invites.find((i: any) => i.email === email.email);
          return {
            ...email,
            status: invite?.success ? 'sent' : 'error',
            error: invite?.error
          };
        }));

        // If all successful, close modal after a delay
        if (result.invites.every((i: any) => i.success)) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      } else {
        // Mark all as error
        setEmails(prev => prev.map(email => ({
          ...email,
          status: 'error',
          error: 'Failed to send invitation'
        })));
      }
    } catch (error) {
      setEmails(prev => prev.map(email => ({
        ...email,
        status: 'error',
        error: 'Network error'
      })));
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Invite Team Members</CardTitle>
            <CardDescription className="mt-1">
              Invite people to join <strong>{team.name}</strong>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto">
          {/* Add Email Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={currentRole} onValueChange={(value: 'admin' | 'member' | 'viewer') => setCurrentRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={addEmail} 
              disabled={!currentEmail.trim() || !validateEmail(currentEmail)}
              className="w-full md:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Invite List
            </Button>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Pending Invitations ({emails.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {emails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(email.status)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{email.email}</div>
                          {email.error && (
                            <div className="text-xs text-red-600 mt-1">{email.error}</div>
                          )}
                        </div>
                        <Select 
                          value={email.role} 
                          onValueChange={(value: 'admin' | 'member' | 'viewer') => updateEmailRole(index, value)}
                          disabled={email.status === 'sent'}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {email.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmail(index)}
                          className="ml-2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Custom Message */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <textarea
                id="message"
                placeholder="Add a personal message to your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20 text-sm"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right">
                {message.length}/500 characters
              </div>
            </div>
          )}

          {/* Role Descriptions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Role Permissions</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div><strong>Admin:</strong> Full team management, invite members, manage projects</div>
              <div><strong>Member:</strong> Create and edit content, participate in discussions</div>
              <div><strong>Viewer:</strong> Read-only access to team content</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={sendInvites} 
              disabled={emails.length === 0 || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Invites ({emails.length})
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}