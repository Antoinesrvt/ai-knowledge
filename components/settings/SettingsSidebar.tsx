'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Building2, 
  Users, 
  Search,
  Settings
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useOrganization } from '@/lib/contexts/organization-context'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Personal information and preferences'
  },
  {
    title: 'Account & Security',
    href: '/settings/account',
    icon: Shield,
    description: 'Password, 2FA, and security settings'
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email and push notification preferences'
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Theme, language, and display options'
  },
  {
    title: 'Organizations',
    href: '/settings/organizations',
    icon: Building2,
    description: 'Manage organizations and teams'
  }
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const { currentOrganization, organizations } = useOrganization()

  const filteredItems = navigationItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          <h2 className="font-semibold">Settings</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-2">
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', isActive ? 'text-accent-foreground' : 'text-muted-foreground')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Context Info */}
      {currentOrganization && (
        <div className="p-4 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground mb-1">Current Organization</div>
          <div className="font-medium text-sm truncate">{currentOrganization.name}</div>
          {organizations.length > 1 && (
            <div className="text-xs text-muted-foreground mt-1">
              {organizations.length - 1} other organization{organizations.length > 2 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}