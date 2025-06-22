'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  Copy,
  Download,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@stackframe/stack'

interface SecuritySettings {
  twoFactorEnabled: boolean
  backupCodesGenerated: boolean
  loginNotifications: boolean
  suspiciousActivityAlerts: boolean
}

interface LoginSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
  browser: string
  ip: string
}

const mockSessions: LoginSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    location: 'San Francisco, CA',
    lastActive: '2 minutes ago',
    current: true,
    browser: 'Chrome 120.0',
    ip: '192.168.1.100'
  },
  {
    id: '2',
    device: 'iPhone 15 Pro',
    location: 'San Francisco, CA',
    lastActive: '1 hour ago',
    current: false,
    browser: 'Safari Mobile',
    ip: '192.168.1.101'
  },
  {
    id: '3',
    device: 'Windows Desktop',
    location: 'New York, NY',
    lastActive: '3 days ago',
    current: false,
    browser: 'Edge 120.0',
    ip: '203.0.113.1'
  }
]

const backupCodes = [
  '1a2b-3c4d-5e6f',
  '7g8h-9i0j-1k2l',
  '3m4n-5o6p-7q8r',
  '9s0t-1u2v-3w4x',
  '5y6z-7a8b-9c0d',
  '1e2f-3g4h-5i6j',
  '7k8l-9m0n-1o2p',
  '3q4r-5s6t-7u8v'
]

export default function AccountSettingsPage() {
  const user = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    backupCodesGenerated: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  })

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password updated successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSettings(prev => ({ ...prev, twoFactorEnabled: true }))
      toast.success('Two-factor authentication enabled')
    } catch (error) {
      toast.error('Failed to enable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateBackupCodes = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSettings(prev => ({ ...prev, backupCodesGenerated: true }))
      setShowBackupCodes(true)
      toast.success('Backup codes generated')
    } catch (error) {
      toast.error('Failed to generate backup codes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Session revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke session')
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast.success('Backup codes copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account & Security</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and authentication settings
        </p>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="2fa" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Two-Factor Auth
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Login Sessions
          </TabsTrigger>
        </TabsList>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="min-w-32"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Two-Factor Authentication Tab */}
        <TabsContent value="2fa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
                {settings.twoFactorEnabled && (
                  <Badge variant="default" className="ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!settings.twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Secure Your Account</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={handleEnable2FA} disabled={isLoading}>
                    {isLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">2FA Enabled</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">Your account is protected with two-factor authentication</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Disable 2FA
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Backup Codes</h4>
                        <p className="text-sm text-muted-foreground">Use these codes if you lose access to your authenticator app</p>
                      </div>
                      {!settings.backupCodesGenerated ? (
                        <Button variant="outline" onClick={handleGenerateBackupCodes} disabled={isLoading}>
                          Generate Codes
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => setShowBackupCodes(!showBackupCodes)}>
                          {showBackupCodes ? 'Hide Codes' : 'Show Codes'}
                        </Button>
                      )}
                    </div>
                    
                    {showBackupCodes && settings.backupCodesGenerated && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">Your Backup Codes</h5>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                              <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                            {backupCodes.map((code, index) => (
                              <div key={index} className="p-2 bg-background rounded border">
                                {code}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-yellow-900 dark:text-yellow-100">Important:</p>
                                <p className="text-yellow-700 dark:text-yellow-300">Store these codes in a safe place. Each code can only be used once.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Security Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone signs in to your account</p>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginNotifications: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Suspicious Activity Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get alerts for unusual account activity</p>
                    </div>
                    <Switch
                      checked={settings.suspiciousActivityAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, suspiciousActivityAlerts: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices and browsers that are signed in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{session.device}</h4>
                          {session.current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {session.lastActive} • IP: {session.ip}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Revoke All Sessions</h4>
                  <p className="text-sm text-muted-foreground">Sign out from all devices except this one</p>
                </div>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  Revoke All Other Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}