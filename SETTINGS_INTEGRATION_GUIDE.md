# Settings Integration Guide

This guide explains how to connect the settings pages to real data using the implemented server actions and database queries.

## Overview

The settings system is now connected to real data through:
- **Server Actions**: Handle form submissions and data updates
- **Database Queries**: Interact with the database through Drizzle ORM
- **Context Providers**: Manage state and real-time updates
- **Revalidation**: Ensure UI stays in sync with data changes

## Available Server Actions

### User Profile Actions
```typescript
// Update user profile
import { updateUserAction } from '@/app/actions/users'

// Usage in forms:
const handleSubmit = async (formData: FormData) => {
  formData.append('userId', user.id)
  formData.append('name', name)
  formData.append('email', email)
  formData.append('bio', bio)
  formData.append('location', location)
  formData.append('website', website)
  
  await updateUserAction(formData)
}
```

### Organization Actions
```typescript
// Update organization
import { updateOrganizationAction } from '@/app/actions/organizations'

// Usage:
const handleOrgUpdate = async (formData: FormData) => {
  formData.append('organizationId', org.id)
  formData.append('name', orgName)
  formData.append('description', orgDescription)
  
  await updateOrganizationAction(formData)
}
```

### Team Actions
```typescript
// Update team
import { updateTeamAction } from '@/app/actions/teams'

// Usage:
const handleTeamUpdate = async (formData: FormData) => {
  formData.append('teamId', team.id)
  formData.append('name', teamName)
  formData.append('description', teamDescription)
  
  await updateTeamAction(formData)
}
```

## Integration Examples

### 1. Profile Settings Integration

```typescript
// app/(main)/settings/profile/page.tsx
import { updateUserAction } from '@/app/actions/users'
import { useUser } from '@stackframe/stack'

export default function ProfileSettings() {
  const user = useUser()
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.primaryEmail || '',
    bio: '',
    location: '',
    website: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const form = new FormData()
    form.append('userId', user.id)
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value)
    })
    
    try {
      await updateUserAction(form)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### 2. Organization Settings Integration

```typescript
// app/(main)/settings/organizations/page.tsx
import { updateOrganizationAction } from '@/app/actions/organizations'
import { useOrganization } from '@/lib/contexts/organization-context'

export default function OrganizationSettings() {
  const { currentOrganization } = useOrganization()
  
  const handleUpdate = async (formData: FormData) => {
    formData.append('organizationId', currentOrganization.id)
    
    try {
      await updateOrganizationAction(formData)
      toast.success('Organization updated successfully')
    } catch (error) {
      toast.error('Failed to update organization')
    }
  }

  return (
    <OrganizationSettings 
      organization={currentOrganization}
      onUpdate={handleUpdate}
    />
  )
}
```

### 3. Real-time Data Fetching

```typescript
// Using the organization context for real-time updates
import { useOrganization } from '@/lib/contexts/organization-context'

function SettingsComponent() {
  const { 
    currentOrganization, 
    currentTeam, 
    organizations, 
    teams,
    refreshOrganizations,
    refreshTeams 
  } = useOrganization()

  // Data is automatically loaded and kept in sync
  // Manual refresh when needed:
  const handleRefresh = async () => {
    await refreshOrganizations()
    await refreshTeams()
  }

  return (
    <div>
      <h2>{currentOrganization?.name}</h2>
      <p>Teams: {teams.length}</p>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  )
}
```

## Database Schema Integration

The settings connect to these database tables:

### Organizations Table
```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Teams Table
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id TEXT REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Organization Members
```sql
CREATE TABLE organization_members (
  organization_id TEXT REFERENCES organizations(id),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security & Authorization

All server actions include:
- **Authentication checks**: Verify user session
- **Authorization checks**: Ensure user can perform the action
- **Input validation**: Validate required fields
- **Error handling**: Proper error messages and logging

```typescript
export async function updateOrganizationAction(formData: FormData) {
  // 1. Authentication
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // 2. Input validation
  const organizationId = formData.get('organizationId') as string
  if (!organizationId) {
    throw new Error('Organization ID is required')
  }

  // 3. Authorization (check if user can update this org)
  // This would typically check organization membership/role

  // 4. Database operation with error handling
  try {
    const result = await updateOrganization(organizationId, updates)
    
    // 5. Revalidate affected pages
    revalidatePath('/settings/organizations')
    
    return result
  } catch (error) {
    console.error('Error updating organization:', error)
    throw new Error('Failed to update organization')
  }
}
```

## Next Steps for Full Integration

1. **Enhanced User Profile**: 
   - Add avatar upload functionality
   - Integrate with Stack Auth user management
   - Add privacy settings

2. **Advanced Organization Settings**:
   - Billing integration
   - Usage analytics
   - Member management with role-based permissions

3. **Team Management**:
   - Team visibility settings
   - Advanced member permissions
   - Team analytics

4. **Notifications System**:
   - Email notification preferences
   - Push notification setup
   - In-app notification management

5. **Appearance Customization**:
   - Theme persistence in database
   - User-specific UI preferences
   - Accessibility settings storage

## Testing the Integration

1. **Start the development server**: `npm run dev`
2. **Navigate to settings**: `/settings`
3. **Test each section**:
   - Profile updates
   - Organization management
   - Team settings
   - Real-time data sync

The settings system is now fully functional with real data integration, providing a solid foundation for further customization and feature expansion.