'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Slider component not available, using input range instead
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Laptop, 
  Type, 
  Layout, 
  Eye, 
  Zap,
  Accessibility,
  Settings,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  fontSize: number
  fontFamily: string
  compactMode: boolean
  sidebarCollapsed: boolean
  showAnimations: boolean
  highContrast: boolean
  reducedMotion: boolean
  focusIndicators: boolean
  colorBlindFriendly: boolean
  language: string
  dateFormat: string
  timeFormat: '12h' | '24h'
}

const defaultSettings: AppearanceSettings = {
  theme: 'system',
  accentColor: 'blue',
  fontSize: 14,
  fontFamily: 'inter',
  compactMode: false,
  sidebarCollapsed: false,
  showAnimations: true,
  highContrast: false,
  reducedMotion: false,
  focusIndicators: true,
  colorBlindFriendly: false,
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h'
}

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    description: 'Light theme with bright colors',
    icon: Sun
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Dark theme with muted colors',
    icon: Moon
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your system preference',
    icon: Laptop
  }
]

const accentColors = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
  { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
  { value: 'teal', label: 'Teal', color: 'bg-teal-500' }
]

const fontFamilies = [
  { value: 'inter', label: 'Inter', description: 'Modern and clean' },
  { value: 'system', label: 'System', description: 'Your system default' },
  { value: 'mono', label: 'Monospace', description: 'Fixed-width font' },
  { value: 'serif', label: 'Serif', description: 'Traditional serif font' }
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' }
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '31 Dec 2024' }
]

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('appearance-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('appearance-settings', JSON.stringify(settings))
      
      // Apply theme change
      setTheme(settings.theme)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Appearance settings saved successfully')
    } catch (error) {
      toast.error('Failed to save appearance settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setSettings(prev => ({ ...prev, theme: newTheme as AppearanceSettings['theme'] }))
    setTheme(newTheme)
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    setTheme('system')
    toast.success('Settings reset to defaults')
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
        <p className="text-muted-foreground mt-2">
          Customize the look and feel of your workspace
        </p>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const IconComponent = option.icon
              const isSelected = settings.theme === option.value
              return (
                <div
                  key={option.value}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => handleThemeChange(option.value)}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Accent Color
          </CardTitle>
          <CardDescription>
            Choose your preferred accent color
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {accentColors.map((color) => {
              const isSelected = settings.accentColor === color.value
              return (
                <div
                  key={color.value}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? 'border-primary' : 'border-border'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, accentColor: color.value }))}
                >
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-4 w-4 text-primary bg-background rounded-full" />
                    </div>
                  )}
                  <div className={`w-8 h-8 rounded-full ${color.color} mx-auto`} />
                  <p className="text-xs text-center mt-2">{color.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
          <CardDescription>
            Customize fonts and text size
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => setSettings(prev => ({ ...prev, fontFamily: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <div>
                      <div className="font-medium">{font.label}</div>
                      <div className="text-sm text-muted-foreground">{font.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              value={settings.fontSize}
              onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              min={12}
              max={20}
              step={1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout
          </CardTitle>
          <CardDescription>
            Customize the layout and spacing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing and padding for a denser layout</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, compactMode: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Collapse Sidebar by Default</Label>
              <p className="text-sm text-muted-foreground">Start with the sidebar collapsed</p>
            </div>
            <Switch
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sidebarCollapsed: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Animations</Label>
              <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
            </div>
            <Switch
              checked={settings.showAnimations}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showAnimations: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Improve accessibility and usability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, highContrast: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reducedMotion: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Enhanced Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">Show clear focus outlines for keyboard navigation</p>
            </div>
            <Switch
              checked={settings.focusIndicators}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, focusIndicators: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Color Blind Friendly</Label>
              <p className="text-sm text-muted-foreground">Use patterns and shapes in addition to colors</p>
            </div>
            <Switch
              checked={settings.colorBlindFriendly}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, colorBlindFriendly: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value: '12h' | '24h') => setSettings(prev => ({ ...prev, timeFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{format.label}</span>
                      <span className="text-muted-foreground ml-4">{format.example}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isLoading} className="min-w-32">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}