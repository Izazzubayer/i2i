'use client'

import { useState } from 'react'
import { Cloud, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function DamConnectDialog({ open, onOpenChange, onConnect }) {
  const [connecting, setConnecting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('idle')

  const [config, setConfig] = useState({
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

  const updateConfig = (key, value) => {
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
    } catch (error) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Connect to Digital Asset Management
          </DialogTitle>
          <DialogDescription>
            Configure your DAM connection settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
                  onValueChange={(value) => updateConfig('authType', value)}
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
        </div>

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

