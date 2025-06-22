'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  Users, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Shield, 
  Zap,
  CheckCircle,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  email: {
    enabled: boolean
    frequency: 'immediate' | 'daily' | 'weekly' | 'never'
    types: {
      security: boolean
      teamUpdates: boolean
      documentChanges: boolean
      mentions: boolean
      comments: boolean
      deadlines: boolean
      marketing: boolean
      productUpdates: boolean
    }
  }
  push: {
    enabled: boolean
    types: {
      security: boolean
      teamUpdates: boolean
      mentions: boolean
      comments: boolean
      deadlines: boolean
    }
  }
  inApp: {
    enabled: boolean
    types: {
      security: boolean
      teamUpdates: boolean
      documentChanges: boolean
      mentions: boolean
      comments: boolean
      deadlines: boolean
    }
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    frequency: 'immediate',
    types: {
      security: true,
      teamUpdates: true,
      documentChanges: true,
      mentions: true,
      comments: false,
      deadlines: true,
      marketing: false,
      productUpdates: true
    }
  },
  push: {
    enabled: true,
    types: {
      security: true,
      teamUpdates: false,
      mentions: true,
      comments: false,
      deadlines: true
    }
  },
  inApp: {
    enabled: true,
    types: {
      security: true,
      teamUpdates: true,
      documentChanges: true,
      mentions: true,
      comments: true,
      deadlines: true
    }
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'America/Los_Angeles'
  }
}

const notificationTypes = [
  {
    key: 'security' as const,
    label: 'Security Alerts',
    description: 'Login attempts, password changes, and security events',
    icon: Shield,
    priority: 'high' as const,
    recommended: true
  },
  {
    key: 'teamUpdates' as const,
    label: 'Team Updates',
    description: 'Team member changes, role updates, and announcements',
    icon: Users,
    priority: 'medium' as const,
    recommended: true
  },
  {
    key: 'documentChanges' as const,
    label: 'Document Changes',
    description: 'Document edits, new versions, and collaborative changes',
    icon: FileText,
    priority: 'medium' as const,
    recommended: false
  },
  {
    key: 'mentions' as const,
    label: 'Mentions & Direct Messages',
    description: 'When someone mentions you or sends a direct message',
    icon: MessageSquare,
    priority: 'high' as const,
    recommended: true
  },
  {
    key: 'comments' as const,
    label: 'Comments & Replies',
    description: 'New comments on documents and reply notifications',
    icon: MessageSquare,
    priority: 'low' as const,
    recommended: false
  },
  {
    key: 'deadlines' as const,
    label: 'Deadlines & Reminders',
    description: 'Task deadlines, meeting reminders, and scheduled events',
    icon: Calendar,
    priority: 'high' as const,
    recommended: true
  }
]

const emailOnlyTypes = [
  {
    key: 'marketing' as const,
    label: 'Marketing & Promotions',
    description: 'Product announcements, feature highlights, and special offers',
    icon: Zap,
    priority: 'low' as const,
    recommended: false
  },
  {
    key: 'productUpdates' as const,
    label: 'Product Updates',
    description: 'New features, improvements, and platform updates',
    icon: Settings,
    priority: 'medium' as const,
    recommended: true
  }
]

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification settings saved successfully')
    } catch (error) {
      toast.error('Failed to save notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      if (permission === 'granted') {
        toast.success('Push notifications enabled')
        setSettings(prev => ({ ...prev, push: { ...prev.push, enabled: true } }))
      } else {
        toast.error('Push notifications denied')
        setSettings(prev => ({ ...prev, push: { ...prev.push, enabled: false } }))
      }
    }
  }

  const updateEmailType = (type: keyof NotificationSettings['email']['types'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        types: {
          ...prev.email.types,
          [type]: enabled
        }
      }
    }))
  }

  const updatePushType = (type: keyof NotificationSettings['push']['types'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        types: {
          ...prev.push.types,
          [type]: enabled
        }
      }
    }))
  }

  const updateInAppType = (type: keyof NotificationSettings['inApp']['types'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      inApp: {
        ...prev.inApp,
        types: {
          ...prev.inApp.types,
          [type]: enabled
        }
      }
    }))
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
            {settings.email.enabled && (
              <Badge variant="default" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Receive notifications via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications in your email inbox</p>
            </div>
            <Switch
              checked={settings.email.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email: { ...prev.email, enabled: checked } }))}
            />
          </div>

          {settings.email.enabled && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <Label>Email Frequency</Label>
                <Select
                  value={settings.email.frequency}
                  onValueChange={(value: NotificationSettings['email']['frequency']) => 
                    setSettings(prev => ({ ...prev, email: { ...prev.email, frequency: value } }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <Label>Email Notification Types</Label>
                <div className="space-y-4">
                  {notificationTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg mt-0.5">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{type.label}</h4>
                              {type.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(type.priority)}`}>
                                {type.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.email.types[type.key]}
                          onCheckedChange={(checked) => updateEmailType(type.key, checked)}
                        />
                      </div>
                    )
                  })}
                  
                  {emailOnlyTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg mt-0.5">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{type.label}</h4>
                              {type.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(type.priority)}`}>
                                {type.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.email.types[type.key]}
                          onCheckedChange={(checked) => updateEmailType(type.key, checked)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
            {settings.push.enabled && (
              <Badge variant="default" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Receive instant notifications on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get instant notifications on your device</p>
            </div>
            <div className="flex items-center gap-2">
              {pushPermission === 'denied' && (
                <Badge variant="destructive" className="text-xs">
                  Blocked
                </Badge>
              )}
              {!settings.push.enabled && pushPermission !== 'granted' ? (
                <Button onClick={requestPushPermission} size="sm">
                  Enable Push
                </Button>
              ) : (
                <Switch
                  checked={settings.push.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push: { ...prev.push, enabled: checked } }))}
                  disabled={pushPermission === 'denied'}
                />
              )}
            </div>
          </div>

          {settings.push.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <Label>Push Notification Types</Label>
                <div className="space-y-4">
                  {notificationTypes.filter(type => type.key !== 'documentChanges').map((type) => {
                    const IconComponent = type.icon
                    return (
                      <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg mt-0.5">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{type.label}</h4>
                              {type.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(type.priority)}`}>
                                {type.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.push.types[type.key]}
                          onCheckedChange={(checked) => updatePushType(type.key, checked)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            In-App Notifications
            {settings.inApp.enabled && (
              <Badge variant="default" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Show notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notification badges and alerts in the app</p>
            </div>
            <Switch
              checked={settings.inApp.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, inApp: { ...prev.inApp, enabled: checked } }))}
            />
          </div>

          {settings.inApp.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <Label>In-App Notification Types</Label>
                <div className="space-y-4">
                  {notificationTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg mt-0.5">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{type.label}</h4>
                              {type.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(type.priority)}`}>
                                {type.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.inApp.types[type.key]}
                          onCheckedChange={(checked) => updateInAppType(type.key, checked)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quiet Hours
            {settings.quietHours.enabled && (
              <Badge variant="default" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Pause non-urgent notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">Pause notifications during your specified quiet hours</p>
            </div>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, quietHours: { ...prev.quietHours, enabled: checked } }))}
            />
          </div>

          {settings.quietHours.enabled && (
            <>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select
                    value={settings.quietHours.start}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, quietHours: { ...prev.quietHours, start: value } }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select
                    value={settings.quietHours.end}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, quietHours: { ...prev.quietHours, end: value } }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.quietHours.timezone}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, quietHours: { ...prev.quietHours, timezone: value } }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Security alerts and urgent notifications will still be delivered during quiet hours.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="min-w-32">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}