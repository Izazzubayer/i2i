'use client'

import { useState } from 'react'
import { Cloud, Folder, Lock, Tag, Users, Settings, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface DamConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect?: (config: DamConfig) => void
}

export interface DamConfig {
  // Authentication
  provider: string
  authType: 'oauth' | 'api-key' | 'basic'
  apiUrl: string
  apiKey?: string
  username?: string
  password?: string
  clientId?: string
  clientSecret?: string

  // Organization
  workspace: string
  projectId?: string

  // Upload Settings
  targetFolder: string
  createSubfolders: boolean
  subfolderPattern: string

  // Metadata
  addMetadata: boolean
  metadataTemplate: string
  customMetadata: Record<string, string>

  // Permissions
  setPermissions: boolean
  visibility: 'private' | 'public' | 'restricted'
  allowedUsers: string[]
  allowedGroups: string[]

  // Processing
  autoTag: boolean
  autoVersion: boolean
  notifyOnComplete: boolean
  webhookUrl?: string
}

export default function DamConnectDialog({ open, onOpenChange, onConnect }: DamConnectDialogProps) {
  const [connecting, setConnecting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [config, setConfig] = useState<DamConfig>({
    // Authentication defaults
    provider: 'custom',
    authType: 'api-key',
    apiUrl: '',
    workspace: '',

    // Upload defaults
    targetFolder: '/uploads',
    createSubfolders: true,
    subfolderPattern: 'YYYY/MM/DD',

    // Metadata defaults
    addMetadata: true,
    metadataTemplate: 'default',
    customMetadata: {},

    // Permissions defaults
    setPermissions: false,
    visibility: 'private',
    allowedUsers: [],
    allowedGroups: [],

    // Processing defaults
    autoTag: true,
    autoVersion: true,
    notifyOnComplete: false,
  })

  const updateConfig = <K extends keyof DamConfig>(key: K, value: DamConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    if (!config.apiUrl) {
      toast.error('Please enter API URL')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock validation
      if (config.authType === 'api-key' && !config.apiKey) {
        throw new Error('API key required')
      }
      if (config.authType === 'basic' && (!config.username || !config.password)) {
        throw new Error('Username and password required')
      }
      if (config.authType === 'oauth' && (!config.clientId || !config.clientSecret)) {
        throw new Error('OAuth credentials required')
      }

      setConnectionStatus('success')
      toast.success('Connection successful!')
    } catch (error: any) {
      setConnectionStatus('error')
      toast.error(error.message || 'Connection failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleConnect = async () => {
    if (connectionStatus !== 'success') {
      toast.error('Please test connection first')
      return
    }

    setConnecting(true)

    try {
      // Simulate saving and connecting
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('DAM configured successfully!')
      onConnect?.(config)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to configure DAM')
    } finally {
      setConnecting(false)
    }
  }

  const popularProviders = [
    { id: 'bynder', name: 'Bynder', icon: '🎯' },
    { id: 'cloudinary', name: 'Cloudinary', icon: '☁️' },
    { id: 'widen', name: 'Widen Collective', icon: '📦' },
    { id: 'adobe-aem', name: 'Adobe AEM Assets', icon: '🅰️' },
    { id: 'canto', name: 'Canto', icon: '🎨' },
    { id: 'brandfolder', name: 'Brandfolder', icon: '📁' },
    { id: 'custom', name: 'Custom / Other', icon: '⚙️' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Connect to Digital Asset Management
          </DialogTitle>
          <DialogDescription>
            Configure your DAM connection and upload settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="authentication" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="authentication">
              <Lock className="h-4 w-4 mr-2" />
              Auth
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Folder className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="metadata">
              <Tag className="h-4 w-4 mr-2" />
              Metadata
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Users className="h-4 w-4 mr-2" />
              Access
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">DAM Provider</CardTitle>
                <CardDescription>Select your DAM system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {popularProviders.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => updateConfig('provider', provider.id)}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary ${config.provider === provider.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                    >
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="text-xs font-medium text-center">{provider.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL *</Label>
                <Input
                  id="apiUrl"
                  placeholder="https://api.your-dam.com"
                  value={config.apiUrl}
                  onChange={(e) => updateConfig('apiUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace">Workspace / Organization *</Label>
                <Input
                  id="workspace"
                  placeholder="your-organization"
                  value={config.workspace}
                  onChange={(e) => updateConfig('workspace', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">Project / Collection ID (Optional)</Label>
                <Input
                  id="projectId"
                  placeholder="project-123"
                  value={config.projectId || ''}
                  onChange={(e) => updateConfig('projectId', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authType">Authentication Method</Label>
                <Select
                  value={config.authType}
                  onValueChange={(value) => updateConfig('authType', value as any)}
                >
                  <SelectTrigger id="authType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api-key">API Key</SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.authType === 'api-key' && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key *</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={config.apiKey || ''}
                    onChange={(e) => updateConfig('apiKey', e.target.value)}
                  />
                </div>
              )}

              {config.authType === 'basic' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="username"
                      value={config.username || ''}
                      onChange={(e) => updateConfig('username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={config.password || ''}
                      onChange={(e) => updateConfig('password', e.target.value)}
                    />
                  </div>
                </>
              )}

              {config.authType === 'oauth' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID *</Label>
                    <Input
                      id="clientId"
                      placeholder="client-id"
                      value={config.clientId || ''}
                      onChange={(e) => updateConfig('clientId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret *</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="••••••••"
                      value={config.clientSecret || ''}
                      onChange={(e) => updateConfig('clientSecret', e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleTestConnection}
                disabled={testingConnection || !config.apiUrl}
                variant="outline"
                className="w-full"
              >
                {testingConnection ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Testing Connection...
                  </>
                ) : connectionStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Connection Successful
                  </>
                ) : connectionStatus === 'error' ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                    Connection Failed - Retry
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Upload Settings Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="targetFolder">Target Folder Path</Label>
              <Input
                id="targetFolder"
                placeholder="/uploads"
                value={config.targetFolder}
                onChange={(e) => updateConfig('targetFolder', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Where to upload files in your DAM
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="createSubfolders"
                checked={config.createSubfolders}
                onCheckedChange={(checked) => updateConfig('createSubfolders', !!checked)}
              />
              <Label htmlFor="createSubfolders" className="font-normal">
                Create subfolders automatically
              </Label>
            </div>

            {config.createSubfolders && (
              <div className="space-y-2">
                <Label htmlFor="subfolderPattern">Subfolder Pattern</Label>
                <Select
                  value={config.subfolderPattern}
                  onValueChange={(value) => updateConfig('subfolderPattern', value)}
                >
                  <SelectTrigger id="subfolderPattern">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY/MM/DD">Date: YYYY/MM/DD</SelectItem>
                    <SelectItem value="YYYY-MM">Date: YYYY-MM</SelectItem>
                    <SelectItem value="batch-id">By Batch ID</SelectItem>
                    <SelectItem value="project">By Project</SelectItem>
                    <SelectItem value="user">By User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Example: {config.targetFolder}/{config.subfolderPattern === 'YYYY/MM/DD' ? '2024/10/30' : config.subfolderPattern}
                </p>
              </div>
            )}

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Upload Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <code className="text-xs">
                      {config.targetFolder}
                      {config.createSubfolders && '/2024/10/30'}
                      /image-1.jpg
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Files will be uploaded to this location
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="addMetadata"
                checked={config.addMetadata}
                onCheckedChange={(checked) => updateConfig('addMetadata', !!checked)}
              />
              <Label htmlFor="addMetadata" className="font-normal">
                Add metadata to uploaded assets
              </Label>
            </div>

            {config.addMetadata && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="metadataTemplate">Metadata Template</Label>
                  <Select
                    value={config.metadataTemplate}
                    onValueChange={(value) => updateConfig('metadataTemplate', value)}
                  >
                    <SelectTrigger id="metadataTemplate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Basic Info)</SelectItem>
                      <SelectItem value="iptc">IPTC Standard</SelectItem>
                      <SelectItem value="xmp">XMP Extended</SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Auto-Applied Metadata</CardTitle>
                    <CardDescription>These will be added to all uploads</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Source</span>
                        <Badge variant="secondary">i2i Platform</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Processing Type</span>
                        <Badge variant="secondary">AI Enhanced</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Upload Date</span>
                        <Badge variant="secondary">Auto</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Batch ID</span>
                        <Badge variant="secondary">Auto</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Custom Metadata Fields (Optional)</Label>
                  <Textarea
                    placeholder="campaign=summer-2024&#10;department=marketing&#10;status=approved"
                    className="min-h-[100px] font-mono text-xs"
                    onChange={(e) => {
                      const lines = e.target.value.split('\n')
                      const metadata: Record<string, string> = {}
                      lines.forEach(line => {
                        const [key, value] = line.split('=')
                        if (key && value) metadata[key.trim()] = value.trim()
                      })
                      updateConfig('customMetadata', metadata)
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    One per line, format: key=value
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setPermissions"
                checked={config.setPermissions}
                onCheckedChange={(checked) => updateConfig('setPermissions', !!checked)}
              />
              <Label htmlFor="setPermissions" className="font-normal">
                Configure access permissions
              </Label>
            </div>

            {config.setPermissions && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={config.visibility}
                    onValueChange={(value) => updateConfig('visibility', value as any)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (Only You)</SelectItem>
                      <SelectItem value="restricted">Restricted (Specific Users/Groups)</SelectItem>
                      <SelectItem value="public">Public (Everyone in Workspace)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.visibility === 'restricted' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="allowedUsers">Allowed Users (comma-separated)</Label>
                      <Input
                        id="allowedUsers"
                        placeholder="user1@example.com, user2@example.com"
                        onChange={(e) => {
                          const users = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                          updateConfig('allowedUsers', users)
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allowedGroups">Allowed Groups (comma-separated)</Label>
                      <Input
                        id="allowedGroups"
                        placeholder="marketing, design, management"
                        onChange={(e) => {
                          const groups = e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                          updateConfig('allowedGroups', groups)
                        }}
                      />
                    </div>
                  </>
                )}

                <Card className="bg-muted border-border">
                  <CardContent className="pt-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Permissions will be applied based on your DAM system's access control settings.
                        Make sure the API user has permission to set these.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoTag"
                  checked={config.autoTag}
                  onCheckedChange={(checked) => updateConfig('autoTag', !!checked)}
                />
                <Label htmlFor="autoTag" className="font-normal">
                  Auto-tag assets with AI-generated tags
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoVersion"
                  checked={config.autoVersion}
                  onCheckedChange={(checked) => updateConfig('autoVersion', !!checked)}
                />
                <Label htmlFor="autoVersion" className="font-normal">
                  Enable version control (keep original + processed)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyOnComplete"
                  checked={config.notifyOnComplete}
                  onCheckedChange={(checked) => updateConfig('notifyOnComplete', !!checked)}
                />
                <Label htmlFor="notifyOnComplete" className="font-normal">
                  Send notification when upload completes
                </Label>
              </div>

              {config.notifyOnComplete && (
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://your-app.com/webhook"
                    value={config.webhookUrl || ''}
                    onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Receive POST notification when upload is complete
                  </p>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Processing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fileNaming">File Naming Convention</Label>
                    <Select defaultValue="original">
                      <SelectTrigger id="fileNaming">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Keep Original Names</SelectItem>
                        <SelectItem value="sanitized">Sanitize & Lowercase</SelectItem>
                        <SelectItem value="uuid">Generate UUID</SelectItem>
                        <SelectItem value="sequential">Sequential Numbering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conflictResolution">Duplicate Handling</Label>
                    <Select defaultValue="rename">
                      <SelectTrigger id="conflictResolution">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rename">Auto-rename (append number)</SelectItem>
                        <SelectItem value="overwrite">Overwrite existing</SelectItem>
                        <SelectItem value="skip">Skip duplicates</SelectItem>
                        <SelectItem value="version">Create new version</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={connecting || connectionStatus !== 'success'}
            className="w-full sm:w-auto"
          >
            {connecting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <Cloud className="mr-2 h-4 w-4" />
                Connect & Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

