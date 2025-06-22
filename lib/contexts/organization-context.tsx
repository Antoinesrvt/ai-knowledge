'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@stackframe/stack';
import { getUserOrganizationsAction, getUserTeamsAction } from '@/app/actions';
import type { Organization, Team } from '../db/schema';

interface OrganizationContextType {
  // Current context
  currentOrganization: Organization | null;
  currentTeam: Team | null;
  
  // Available options
  organizations: Array<{ organization: Organization; role: string; joinedAt: Date }>;
  teams: Array<{ team: Team; role: string; joinedAt: Date }>;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  refreshOrganizations: () => Promise<void>;
  refreshTeams: () => Promise<void>;
  
  // Helpers
  isPersonalContext: boolean;
  canCreateContent: boolean;
  canManageOrganization: boolean;
  canManageTeam: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const user = useUser();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ organization: Organization; role: string; joinedAt: Date }>>([]);
  const [teams, setTeams] = useState<Array<{ team: Team; role: string; joinedAt: Date }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's organizations and teams
  const loadUserData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load organizations
      const userOrgs = await getUserOrganizationsAction();
      setOrganizations(userOrgs);
      
      // Set default organization if none selected
      if (!currentOrganization && userOrgs.length > 0) {
        setCurrentOrganization(userOrgs[0].organization);
      }
      
      // Load teams for current organization
      if (currentOrganization) {
        const userTeams = await getUserTeamsAction(user.id, currentOrganization.id);
        setTeams(userTeams);
        
        // Set default team if none selected
        if (!currentTeam && userTeams.length > 0) {
          setCurrentTeam(userTeams[0].team);
        }
      } else {
        setTeams([]);
        setCurrentTeam(null);
      }
    } catch (error) {
      console.error('Failed to load user organizations and teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh organizations
  const refreshOrganizations = async () => {
    if (!user?.id) return;
    
    try {
      const userOrgs = await getUserOrganizationsAction();
      setOrganizations(userOrgs);
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
    }
  };

  // Refresh teams
  const refreshTeams = async () => {
    if (!user?.id || !currentOrganization) return;
    
    try {
      const userTeams = await getUserTeamsAction(user.id, currentOrganization.id);
      setTeams(userTeams);
    } catch (error) {
      console.error('Failed to refresh teams:', error);
    }
  };

  // Handle organization change
  const handleSetCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganization(org);
    setCurrentTeam(null); // Reset team when organization changes
    
    // Load teams for new organization
    if (org && user?.id) {
      getUserTeamsAction(user.id, org.id).then(userTeams => {
        setTeams(userTeams);
        if (userTeams.length > 0) {
          setCurrentTeam(userTeams[0].team);
        }
      }).catch(error => {
        console.error('Failed to load teams for organization:', error);
      });
    } else {
      setTeams([]);
    }
  };

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  // Helper functions
  const isPersonalContext = !currentOrganization;
  
  const getCurrentUserRole = (type: 'organization' | 'team') => {
    if (type === 'organization' && currentOrganization) {
      const membership = organizations.find(org => org.organization.id === currentOrganization.id);
      return membership?.role;
    }
    
    if (type === 'team' && currentTeam) {
      const membership = teams.find(team => team.team.id === currentTeam.id);
      return membership?.role;
    }
    
    return null;
  };
  
  const canCreateContent = !!user; // Any authenticated user can create content
  
  const canManageOrganization = () => {
    const role = getCurrentUserRole('organization');
    return role === 'owner' || role === 'admin';
  };
  
  const canManageTeam = () => {
    const role = getCurrentUserRole('team');
    return role === 'owner' || role === 'admin';
  };

  const value: OrganizationContextType = {
    currentOrganization,
    currentTeam,
    organizations,
    teams,
    isLoading,
    setCurrentOrganization: handleSetCurrentOrganization,
    setCurrentTeam,
    refreshOrganizations,
    refreshTeams,
    isPersonalContext,
    canCreateContent,
    canManageOrganization: canManageOrganization(),
    canManageTeam: canManageTeam(),
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// Helper hook for getting current context info
export function useCurrentContext() {
  const { currentOrganization, currentTeam, isPersonalContext } = useOrganization();
  
  const getContextLabel = () => {
    if (isPersonalContext) return 'Personal';
    if (currentTeam) return `${currentOrganization?.name} / ${currentTeam.name}`;
    if (currentOrganization) return currentOrganization.name;
    return 'Personal';
  };
  
  const getContextType = (): 'personal' | 'organization' | 'team' => {
    if (isPersonalContext) return 'personal';
    if (currentTeam) return 'team';
    return 'organization';
  };
  
  return {
    currentOrganization,
    currentTeam,
    isPersonalContext,
    contextLabel: getContextLabel(),
    contextType: getContextType(),
  };
}