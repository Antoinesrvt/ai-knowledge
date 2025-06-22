'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Building2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOrganization } from '@/lib/contexts/organization-context'
import { Badge } from '@/components/ui/badge'

interface BreadcrumbItem {
  label: string
  href?: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Settings', href: '/settings' }]
  
  if (segments.length > 1) {
    const settingsSegments = segments.slice(1) // Remove 'settings'
    
    settingsSegments.forEach((segment, index) => {
      const isLast = index === settingsSegments.length - 1
      const href = isLast ? undefined : `/settings/${settingsSegments.slice(0, index + 1).join('/')}`
      
      // Format segment names
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (label === 'Organizations') label = 'Organizations'
      if (label === 'Teams') label = 'Teams'
      if (label === 'Account') label = 'Account & Security'
      
      breadcrumbs.push({ label, href })
    })
  }
  
  return breadcrumbs
}

export function SettingsHeader() {
  const pathname = usePathname()
  const { currentOrganization, organizations, setCurrentOrganization, currentTeam, teams } = useOrganization()
  
  const breadcrumbs = getBreadcrumbs(pathname)
  const isOrganizationSettings = pathname.includes('/organizations/')
  const isTeamSettings = pathname.includes('/teams/')
  
  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.label} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground'}>
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>
      
      {/* Context Switchers */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher */}
        {(isOrganizationSettings || isTeamSettings) && organizations.length > 0 && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select
              value={currentOrganization?.id || ''}
              onValueChange={(value) => {
                const org = organizations.find(o => o.organization.id === value)
                if (org) setCurrentOrganization(org.organization)
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.organization.id} value={org.organization.id}>
                    <div className="flex items-center gap-2">
                      <span>{org.organization.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {org.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Team Switcher */}
        {isTeamSettings && teams.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select
              value={currentTeam?.id || ''}
              onValueChange={(value) => {
                // This would need to be implemented in the organization context
                console.log('Switch to team:', value)
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.team.id} value={team.team.id}>
                    <div className="flex items-center gap-2">
                      <span>{team.team.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {team.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}