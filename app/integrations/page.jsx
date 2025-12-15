"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { getDamSystems, getDamConnections, updateDamConnectionStatus } from '@/api/dam/dam'
import { Loader2 } from 'lucide-react'
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Folder,
  Upload,
  Download,
  Link2,
  Unlink,
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

// Provider logo mapping (fallback for when API doesn't provide iconUrl)
const providerLogos = {
  'Creative Force': '/logos/integrations/creative-force.png',
  'Dalim': '/logos/integrations/dalim.png',
  'Spin Me': '/logos/integrations/spin-me.png',
  'Facebook': '/logos/integrations/facebook.png',
  'Instagram': '/logos/integrations/instagram.png',
  'Shopify': '/logos/integrations/shopify.png',
  'GlobalEdit': '/logos/integrations/globaledit.png',
}

// Provider Logo Component
// First tries iconUrl from API, then falls back to local logo mapping
const ProviderLogo = ({ provider, iconUrl, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }
  
  // Try API iconUrl first
  if (iconUrl && typeof iconUrl === 'string' && iconUrl.trim() !== '' && iconUrl !== 'null') {
    return (
      <Image
        src={iconUrl}
        alt={`${provider} logo`}
        width={size === 'lg' ? 32 : size === 'md' ? 24 : 20}
        height={size === 'lg' ? 32 : size === 'md' ? 24 : 20}
        className={`${sizeClasses[size]} object-contain rounded`}
        unoptimized
      />
    )
  }
  
  // Fallback to local logo mapping
  const logoPath = providerLogos[provider]
  if (logoPath) {
    return (
      <Image
        src={logoPath}
        alt={`${provider} logo`}
        width={size === 'lg' ? 32 : size === 'md' ? 24 : 20}
        height={size === 'lg' ? 32 : size === 'md' ? 24 : 20}
        className={`${sizeClasses[size]} object-contain rounded`}
        unoptimized
      />
    )
  }
  
  // Final fallback to generic icon
  return <Cog className={`${sizeClasses[size]} text-muted-foreground`} />
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([])
  const [availableProviders, setAvailableProviders] = useState([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState(null)

  // Fetch DAM systems from API
  useEffect(() => {
    const fetchDamSystems = async () => {
      try {
        setIsLoadingProviders(true)
        const response = await getDamSystems({ onlyActive: true })
        
        if (response && response.systems) {
          // Map API response to provider format
          const providers = response.systems.map((system) => ({
            id: system.systemCode.toLowerCase().replace(/\s+/g, '-'),
            name: system.systemName,
            description: system.description,
            iconUrl: (system.iconUrl && system.iconUrl.trim() !== '' && system.iconUrl !== 'null') ? system.iconUrl : null,
            systemCode: system.systemCode,
            damSystemId: system.damSystemId,
            // Include field information from API
            requiredFields: system.requiredFields || [],
            optionalFields: system.optionalFields || [],
            defaultEndpoint: system.defaultEndpoint || null,
          }))
          
          // Sort by displayOrder if available
          const sortedProviders = providers.sort((a, b) => {
            const systemA = response.systems.find(s => s.systemCode === a.systemCode)
            const systemB = response.systems.find(s => s.systemCode === b.systemCode)
            return (systemA?.displayOrder || 999) - (systemB?.displayOrder || 999)
          })
          
          setAvailableProviders(sortedProviders)
          console.log('✅ Loaded DAM systems:', sortedProviders)
        }
      } catch (error) {
        console.error('❌ Error fetching DAM systems:', error)
        toast.error('Failed to load DAM systems. Please try again.')
      } finally {
        setIsLoadingProviders(false)
      }
    }

    fetchDamSystems()
  }, [])

  // Fetch DAM connections from API
  const fetchConnections = useCallback(async () => {
    try {
      const response = await getDamConnections()
      
      if (response && response.connections) {
        // Map API response to integration format
        const mappedIntegrations = response.connections.map((connection) => {
          // Try to infer systemCode if it's null
          let inferredSystemCode = connection.systemCode
          
          // If systemCode is null, try to infer from configuration or endpoint
          if (!inferredSystemCode) {
            // Check for SFTP/FTP characteristics (Username, Password, Port)
            if (connection.configuration?.Username && 
                connection.configuration?.Password && 
                connection.configuration?.Port !== undefined) {
              // Check if endpoint suggests SFTP (usually port 22) or FTP (usually port 21)
              const port = connection.configuration.Port
              if (port === 22) {
                inferredSystemCode = 'SFTP'
              } else if (port === 21) {
                inferredSystemCode = 'FTP'
              } else {
                // Default to SFTP if port is not 21
                inferredSystemCode = 'SFTP'
              }
            }
            // Check for Shopify
            else if (connection.endpoint && connection.endpoint.includes('shopify')) {
              inferredSystemCode = 'Shopify'
            }
          }
          
          // Find provider from availableProviders using systemCode
          let provider = null
          let systemName = 'Unknown'
          let systemCode = inferredSystemCode
          
          if (systemCode) {
            provider = availableProviders.find(p => 
              p.systemCode === systemCode || 
              p.damSystemId === systemCode
            )
            if (provider) {
              systemName = provider.name // Use systemName from systems API
              systemCode = provider.systemCode // Use the correct systemCode from provider
            } else {
              // Provider not found in availableProviders, use systemCode as name
              systemName = systemCode
            }
          }
          
          // Extract display name from configuration
          let displayName = connection.connectionName
          
          if (!displayName) {
            // Use Username for SFTP/FTP
            if ((systemName === 'SFTP' || systemName === 'FTP') && connection.configuration?.Username) {
              displayName = `${systemName} - ${connection.configuration.Username}`
            }
            // For Shopify: use StoreName or shopDomain
            else if (systemName === 'Shopify') {
              const storeName = connection.configuration?.StoreName || 
                               connection.configuration?.ShopDomain?.split('.')[0] ||
                               connection.shopDomain?.split('.')[0] ||
                               connection.endpoint?.match(/https?:\/\/([^.]+)\./)?.[1] ||
                               'default'
              displayName = `${systemName} - ${storeName}`
            }
            // For other systems: use endpoint or default
            else {
              const identifier = connection.configuration?.StoreName ||
                               connection.configuration?.Username ||
                               connection.endpoint?.match(/https?:\/\/([^.]+)\./)?.[1] ||
                               connection.endpoint?.split('/').pop() ||
                               'default'
              displayName = `${systemName} - ${identifier}`
            }
          }
          
          // Extract workspace/identifier for subtitle
          const workspace = connection.workspace || 
                           connection.configuration?.Username ||
                           connection.configuration?.StoreName ||
                           connection.configuration?.shopDomain?.split('.')[0] ||
                           connection.endpoint?.match(/https?:\/\/([^.]+)\./)?.[1] ||
                           'default'
          
          return {
            id: connection.connectionId,
            name: displayName,
            provider: systemName, // Use systemName from systems API
            systemCode: systemCode, // Store systemCode for matching
            status: connection.isActive ? 'connected' : 'disconnected',
            workspace: workspace,
            targetFolder: connection.targetFolder || '/uploads',
            totalUploads: 0, // These would come from other API calls
            totalDownloads: 0,
            createdAt: connection.createdAt 
              ? new Date(connection.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            // Store full connection data for details
            connectionData: connection,
          }
        })
        
        setIntegrations(mappedIntegrations)
        console.log('✅ Loaded DAM connections:', mappedIntegrations)
      }
    } catch (error) {
      console.error('❌ Error fetching DAM connections:', error)
      // Don't show error toast on initial load, just log it
    }
  }, [availableProviders])

  // Fetch connections on mount and when availableProviders change
  useEffect(() => {
    if (availableProviders.length > 0) {
      fetchConnections()
    }
  }, [availableProviders.length, fetchConnections])

  const handleDisconnect = async () => {
    if (!selectedIntegration) return
    
    try {
      // Get connectionId from the integration
      const connectionId = selectedIntegration.id || selectedIntegration.connectionData?.connectionId
      
      if (!connectionId) {
        toast.error('Connection ID not found')
        return
      }
      
      // Call API to deactivate and delete the connection
      await updateDamConnectionStatus({
        connectionId: connectionId,
        isActive: false,
        isDeleted: true,
      })
      
      // Refresh connections from API
      await fetchConnections()
      
      setDisconnectDialogOpen(false)
      setSelectedIntegration(null)
      toast.success('Integration disconnected successfully')
    } catch (error) {
      console.error('❌ Failed to disconnect:', error)
      const errorMessage = error?.message || error?.data?.message || 'Failed to disconnect integration'
      toast.error(errorMessage)
    }
  }


  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider)
    setAddDialogOpen(false)
    // Show custom DAM dialog for custom providersstandard dialog for others
    if (provider.id === 'custom') {
      setDamDialogOpen(true)
    } else {
      setIntegrationDialogOpen(true)
    }
  }

  const handleIntegrationConnect = async (apiResponse) => {
    if (!selectedProvider) return

    // Refresh connections from API to get the latest data
    await fetchConnections()
    
    setIntegrationDialogOpen(false)
    setSelectedProvider(null)
    toast.success(`${selectedProvider.name} connected successfully!`)
  }

  const handleDamConnect = () => {
    // Add new integration
    const newIntegration = {
      id: Date.now().toString(),
      name: `${selectedProvider?.name} Integration`,
      provider: selectedProvider?.name || 'Custom API',
      status: 'connected',
      workspace: 'new-workspace',
      targetFolder: '/uploads',
      totalUploads: 0,
      totalDownloads: 0,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setIntegrations(prev => [...prev, newIntegration])
    setDamDialogOpen(false)
    setSelectedProvider(null)
  }


  const getStatusBadge = (status) => {
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
    }
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">DAM Integrations</h1>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Connect your Digital Asset Management systems to streamline your creative workflows.
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
                    Connect your DAM system to automatically upload your processed images.
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
                                <Upload className="h-4 w-4" />
                                <span>{integration.totalUploads.toLocaleString()} uploads</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
            <CardTitle className="leading-tight">Available DAM Integrations</CardTitle>
            <CardDescription className="leading-relaxed">
              Connect to supported Digital Asset Management systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProviders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading integrations...</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableProviders.map((provider) => {
                  // Check if provider has an active connection by matching systemCode
                  const isConnected = integrations.some(i => 
                    i.status === 'connected' && 
                    (i.systemCode === provider.systemCode || i.provider === provider.name)
                  )
                  return (
                    <div 
                      key={provider.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-all cursor-pointer hover:bg-muted/50 ${
                        isConnected ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : ''
                      }`}
                      onClick={() => !isConnected && handleSelectProvider(provider)}
                    >
                      <ProviderLogo provider={provider.name} iconUrl={provider.iconUrl} size="md" />
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="leading-tight">Add DAM Integration</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Select a Digital Asset Management system to connect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {isLoadingProviders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading integrations...</span>
              </div>
            ) : (
              availableProviders.map((provider) => {
                // Check if provider has an active connection by matching systemCode
                const isConnected = integrations.some(i => 
                  i.status === 'connected' && 
                  (i.systemCode === provider.systemCode || i.provider === provider.name)
                )
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
                    <ProviderLogo provider={provider.name} iconUrl={provider.iconUrl} size="lg" />
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
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Standard Integration Connect Dialog */}
      {selectedProvider && selectedProvider.id !== 'custom' && (
        <IntegrationConnectDialog
          open={integrationDialogOpen}
          onOpenChange={(open) => {
            setIntegrationDialogOpen(open)
            if (!open) {
              setSelectedProvider(null)
            }
          }}
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
                  <Label className="text-xs text-muted-foreground">Workspace</Label>
                  <p className="text-sm font-medium">{selectedIntegration.workspace}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Target Folder</Label>
                  <p className="text-sm font-medium">{selectedIntegration.targetFolder}</p>
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
              Are you sure you want to disconnect this integration? This will stop automatic uploads to {selectedIntegration?.provider}.
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

