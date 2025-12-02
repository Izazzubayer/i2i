"use client"

import { useState } from 'react'
import Image from 'next/image'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Cloud, 
  Plus, 
  Settings, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Folder,
  Upload,
  Download,
  Clock,
  Link2,
  Unlink,
  Loader2,
  Cog,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import DamConnectDialog from '@/components/DamConnectDialog'
import IntegrationConnectDialog from '@/components/IntegrationConnectDialog'

// Provider logo mapping - using local images
const providerLogos: Record<string, string> = {
  'Cloudinary': '/logos/integrations/cloudinary.png',
  'Adobe AEM': '/logos/integrations/adobe.png',
  'Dropbox': '/logos/integrations/dropbox.png',
  'Google Drive': '/logos/integrations/google-drive.png',
  'AWS S3': '/logos/integrations/aws.png',
  'Azure Blob': '/logos/integrations/azure.png',
  'Shopify': '/logos/integrations/shopify.png',
  'Meta': '/logos/integrations/meta.png',
  'Slack': '/logos/integrations/slack.png',
  'Salesforce': '/logos/integrations/salesforce.png',
  'WordPress': '/logos/integrations/wordpress.png',
  'WooCommerce': '/logos/integrations/woocommerce.png',
  'Zapier': '/logos/integrations/zapier.png',
  'HubSpot': '/logos/integrations/hubspot.png',
  'Airtable': '/logos/integrations/airtable.png',
  'Notion': '/logos/integrations/notion.png',
}

interface Integration {
  id: string
  name: string
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: string
  workspace: string
  targetFolder: string
  totalUploads: number
  totalDownloads: number
  autoSync: boolean
  createdAt: string
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Product Catalog',
    provider: 'Shopify',
    status: 'connected',
    lastSync: '2 minutes ago',
    workspace: 'acme-store',
    targetFolder: '/products',
    totalUploads: 1247,
    totalDownloads: 89,
    autoSync: true,
    createdAt: 'Oct 15, 2025',
  },
  {
    id: '2',
    name: 'Media Library',
    provider: 'Cloudinary',
    status: 'connected',
    lastSync: '1 hour ago',
    workspace: 'acme-media',
    targetFolder: '/assets/images',
    totalUploads: 3562,
    totalDownloads: 234,
    autoSync: true,
    createdAt: 'Sep 22, 2025',
  },
  {
    id: '3',
    name: 'Brand Assets',
    provider: 'Adobe AEM',
    status: 'error',
    lastSync: '3 days ago',
    workspace: 'brand-central',
    targetFolder: '/brand/assets',
    totalUploads: 456,
    totalDownloads: 12,
    autoSync: false,
    createdAt: 'Aug 10, 2025',
  },
]

// Provider Logo Component
const ProviderLogo = ({ provider, size = 'md' }: { provider: string; size?: 'sm' | 'md' | 'lg' }) => {
  const logoPath = providerLogos[provider]
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }
  
  if (logoPath) {
    return (
      <Image
        src={logoPath}
        alt={`${provider} logo`}
        width={size === 'lg' ? 32 : size === 'md' ? 24 : 20}
        height={size === 'lg' ? 32 : size === 'md' ? 24 : 20}
        className={`${sizeClasses[size]} object-contain`}
        unoptimized
      />
    )
  }
  
  // Fallback to generic icon
  return <Cog className={sizeClasses[size]} />
}

const availableProviders = [
  { id: 'shopify', name: 'Shopify', description: 'E-commerce platform integration' },
  { id: 'cloudinary', name: 'Cloudinary', description: 'Media management and delivery' },
  { id: 'adobe-aem', name: 'Adobe AEM', description: 'Adobe Experience Manager' },
  { id: 'meta', name: 'Meta', description: 'Facebook & Instagram integration' },
  { id: 'google-drive', name: 'Google Drive', description: 'Cloud storage by Google' },
  { id: 'dropbox', name: 'Dropbox', description: 'Cloud storage and sharing' },
  { id: 'aws-s3', name: 'AWS S3', description: 'Amazon Simple Storage Service' },
  { id: 'azure-blob', name: 'Azure Blob', description: 'Microsoft Azure storage' },
  { id: 'salesforce', name: 'Salesforce', description: 'CRM and marketing platform' },
  { id: 'hubspot', name: 'HubSpot', description: 'Marketing and sales platform' },
  { id: 'slack', name: 'Slack', description: 'Team communication' },
  { id: 'wordpress', name: 'WordPress', description: 'Content management system' },
  { id: 'woocommerce', name: 'WooCommerce', description: 'WordPress e-commerce' },
  { id: 'zapier', name: 'Zapier', description: 'Workflow automation' },
  { id: 'airtable', name: 'Airtable', description: 'Database and spreadsheet' },
  { id: 'notion', name: 'Notion', description: 'Workspace and documentation' },
  { id: 'custom', name: 'Custom / Other', description: 'Connect to a custom DAM or API' },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<typeof availableProviders[0] | null>(null)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId)
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: 'syncing' as const } : i
    ))
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: 'connected' as const, lastSync: 'Just now' } : i
    ))
    setSyncing(null)
    toast.success('Sync completed successfully')
  }

  const handleDisconnect = () => {
    if (!selectedIntegration) return
    
    setIntegrations(prev => prev.filter(i => i.id !== selectedIntegration.id))
    setDisconnectDialogOpen(false)
    setSelectedIntegration(null)
    toast.success('Integration disconnected')
  }

  const handleToggleAutoSync = (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, autoSync: enabled } : i
    ))
    toast.success(`Auto-sync ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleSelectProvider = (provider: typeof availableProviders[0]) => {
    setSelectedProvider(provider)
    setAddDialogOpen(false)
    // Show custom DAM dialog for custom providers, standard dialog for others
    if (provider.id === 'custom') {
      setDamDialogOpen(true)
    } else {
      setIntegrationDialogOpen(true)
    }
  }

  const handleIntegrationConnect = (config: Record<string, string>) => {
    if (!selectedProvider) return

    const newIntegration: Integration = {
      id: Date.now().toString(),
      name: `${selectedProvider.name} Integration`,
      provider: selectedProvider.name,
      status: 'connected',
      lastSync: 'Just now',
      workspace: config.workspace || 'default-workspace',
      targetFolder: config.targetFolder || '/uploads',
      totalUploads: 0,
      totalDownloads: 0,
      autoSync: true,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setIntegrations(prev => [...prev, newIntegration])
    setIntegrationDialogOpen(false)
    setSelectedProvider(null)
  }

  const handleDamConnect = () => {
    // Add new integration
    const newIntegration: Integration = {
      id: Date.now().toString(),
      name: `${selectedProvider?.name} Integration`,
      provider: selectedProvider?.name || 'Custom API',
      status: 'connected',
      lastSync: 'Just now',
      workspace: 'new-workspace',
      targetFolder: '/uploads',
      totalUploads: 0,
      totalDownloads: 0,
      autoSync: true,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setIntegrations(prev => [...prev, newIntegration])
    setDamDialogOpen(false)
    setSelectedProvider(null)
  }


  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case 'disconnected':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case 'syncing':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        )
    }
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">Integrations</h1>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Connect your Digital Asset Management systems and cloud storage.
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>

        {/* Integrations List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({integrations.length})</TabsTrigger>
            <TabsTrigger value="connected">Connected ({connectedCount})</TabsTrigger>
            <TabsTrigger value="issues">Issues ({integrations.filter(i => i.status === 'error').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {integrations.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold text-lg mb-2">No integrations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your DAM or cloud storage to start syncing your processed images.
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <ProviderLogo provider={integration.provider} size="lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg leading-tight">{integration.name}</h3>
                              {getStatusBadge(integration.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {integration.provider} • {integration.workspace}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Folder className="h-4 w-4" />
                                <span>{integration.targetFolder}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Last sync: {integration.lastSync}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Upload className="h-4 w-4" />
                                <span>{integration.totalUploads.toLocaleString()} uploads</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 mr-4">
                            <Label htmlFor={`auto-sync-${integration.id}`} className="text-sm text-muted-foreground">
                              Auto-sync
                            </Label>
                            <Switch
                              id={`auto-sync-${integration.id}`}
                              checked={integration.autoSync}
                              onCheckedChange={(checked) => handleToggleAutoSync(integration.id, checked)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                            disabled={syncing === integration.id || integration.status === 'syncing'}
                          >
                            {syncing === integration.id || integration.status === 'syncing' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedIntegration(integration)
                                  setDetailsDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedIntegration(integration)
                                  setDisconnectDialogOpen(true)
                                }}
                              >
                                <Unlink className="mr-2 h-4 w-4" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="connected" className="mt-6">
            <div className="space-y-4">
              {integrations.filter(i => i.status === 'connected').map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <ProviderLogo provider={integration.provider} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg leading-tight">{integration.name}</h3>
                            {getStatusBadge(integration.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {integration.provider} • {integration.workspace}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                      >
                        {syncing === integration.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Now
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="issues" className="mt-6">
            {integrations.filter(i => i.status === 'error').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-semibold text-lg mb-2">All integrations healthy</h3>
                  <p className="text-muted-foreground">
                    No issues detected with your connected integrations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {integrations.filter(i => i.status === 'error').map((integration) => (
                  <Card key={integration.id} className="border-red-200 dark:border-red-800">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <ProviderLogo provider={integration.provider} size="lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg leading-tight">{integration.name}</h3>
                              {getStatusBadge(integration.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {integration.provider} • {integration.workspace}
                            </p>
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-red-700 dark:text-red-400">Connection Error</p>
                                <p className="text-red-600 dark:text-red-300">
                                  Unable to authenticate. Please check your credentials and try again.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Fix Issue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Available Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="leading-tight">Available Integrations</CardTitle>
            <CardDescription className="leading-relaxed">
              Connect to popular DAM systems and cloud storage providers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableProviders.map((provider) => {
                const isConnected = integrations.some(i => i.provider === provider.name)
                return (
                  <div 
                    key={provider.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-all cursor-pointer hover:bg-muted/50 ${
                      isConnected ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : ''
                    }`}
                    onClick={() => !isConnected && handleSelectProvider(provider)}
                  >
                    <ProviderLogo provider={provider.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{provider.name}</p>
                        {isConnected && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{provider.description}</p>
                    </div>
                    {!isConnected && (
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="leading-tight">Add Integration</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Select a DAM system or cloud storage provider to connect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {availableProviders.map((provider) => {
              const isConnected = integrations.some(i => i.provider === provider.name)
              return (
                <button
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider)}
                  disabled={isConnected}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-all text-left ${
                    isConnected 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-muted/50 hover:border-primary cursor-pointer'
                  }`}
                >
                  <ProviderLogo provider={provider.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{provider.name}</p>
                      {isConnected && (
                        <Badge variant="secondary" className="text-xs">Connected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                  {!isConnected && (
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Standard Integration Connect Dialog */}
      {selectedProvider && selectedProvider.id !== 'custom' && (
        <IntegrationConnectDialog
          open={integrationDialogOpen}
          onOpenChange={setIntegrationDialogOpen}
          provider={selectedProvider}
          onConnect={handleIntegrationConnect}
        />
      )}

      {/* DAM Connect Dialog (for Custom/Other) */}
      <DamConnectDialog 
        open={damDialogOpen} 
        onOpenChange={setDamDialogOpen}
        onConnect={handleDamConnect}
      />

      {/* Integration Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && (
                <>
                  <ProviderLogo provider={selectedIntegration.provider} size="lg" />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedIntegration.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedIntegration.provider}</p>
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Integration details and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedIntegration.status)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Auto-sync</Label>
                  <div className="text-sm">
                    {selectedIntegration.autoSync ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Workspace</Label>
                  <p className="text-sm font-medium">{selectedIntegration.workspace}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Target Folder</Label>
                  <p className="text-sm font-medium">{selectedIntegration.targetFolder}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Last Sync</Label>
                  <p className="text-sm font-medium">{selectedIntegration.lastSync}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="text-sm font-medium">{selectedIntegration.createdAt}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Uploads</Label>
                  <p className="text-sm font-medium">{selectedIntegration.totalUploads.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Downloads</Label>
                  <p className="text-sm font-medium">{selectedIntegration.totalDownloads.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 leading-tight">
              <Unlink className="h-5 w-5 text-destructive" />
              Disconnect Integration
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              Are you sure you want to disconnect this integration? This will stop all syncing with {selectedIntegration?.provider}.
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <ProviderLogo provider={selectedIntegration.provider} size="md" />
                <div>
                  <p className="font-medium">{selectedIntegration.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedIntegration.provider} • {selectedIntegration.workspace}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This will not delete any files already uploaded to your DAM. You can reconnect at any time.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

