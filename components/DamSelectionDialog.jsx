'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Cloud, Plus, CheckCircle2, Settings, Trash2, Cog } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import DamConnectDialog from '@/components/DamConnectDialog'
import IntegrationConnectDialog from '@/components/IntegrationConnectDialog'

// Provider logo mapping
const providerLogos = {
  'Creative Force': '/logos/integrations/creative-force.png',
  'Dalim': '/logos/integrations/dalim.png',
  'Spin Me': '/logos/integrations/spin-me.png',
  'Facebook': '/logos/integrations/facebook.png',
  'Instagram': '/logos/integrations/instagram.png',
  'Shopify': '/logos/integrations/shopify.png',
  'GlobalEdit': '/logos/integrations/globaledit.png',
}

// Available DAM providers
const availableProviders = [
  { id: 'creative-force', name: 'Creative Force', description: 'E-commerce content production management' },
  { id: 'dalim', name: 'Dalim', description: 'Print, packaging, and digital content solutions' },
  { id: 'spin-me', name: 'Spin Me', description: 'Workflow solutions for managing digital assets' },
  { id: 'facebook', name: 'Facebook', description: 'Social media platform integration' },
  { id: 'instagram', name: 'Instagram', description: 'Photo and video sharing platform' },
  { id: 'shopify', name: 'Shopify', description: 'E-commerce platform integration' },
  { id: 'globaledit', name: 'GlobalEdit', description: 'Digital asset management platform' },
  { id: 'custom', name: 'Custom platform', description: 'Connect to a custom DAM or API' },
]

// Provider Logo Component
const ProviderLogo = ({ provider, size = 'md' }) => {
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

export default function DamSelectionDialog({ 
  open, 
  onOpenChange, 
  damConnections = [], 
  activeDamConnection,
  onSelectDam,
  onAddDam,
  onRemoveDam,
  allowMultiSelect = true,
}) {
  const [customDamDialogOpen, setCustomDamDialogOpen] = useState(false)
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedDamIds, setSelectedDamIds] = useState(new Set())

  // Helper to get connection description
  const getConnectionDescription = (connection, provider) => {
    // If workspace exists and is not 'default', show it
    if (connection.workspace && connection.workspace !== 'default') {
      return `${connection.workspace} workspace`
    }
    
    // If name exists and contains useful info, extract it
    if (connection.name && connection.name !== `${provider.name} - default`) {
      const nameParts = connection.name.split(' - ')
      if (nameParts.length > 1 && nameParts[1] !== 'default') {
        return nameParts[1]
      }
    }
    
    // Fallback to provider description
    return provider.description || 'Connected workspace'
  }

  // Dummy connections for testing (Facebook, Shopify)
  const dummyConnections = useMemo(() => [
    {
      id: 'dummy-facebook',
      name: 'Facebook - Social Media Assets',
      provider: 'Facebook',
      workspace: 'Social Media Assets',
      isConnected: true,
      lastSync: new Date(),
      config: { provider: 'Facebook', workspace: 'Social Media Assets' },
    },
    {
      id: 'dummy-shopify',
      name: 'Shopify - Product Catalog',
      provider: 'Shopify',
      workspace: 'Product Catalog',
      isConnected: true,
      lastSync: new Date(),
      config: { provider: 'Shopify', workspace: 'Product Catalog' },
    },
  ], [])

  // Use dummy connections if no real connections exist
  const effectiveConnections = damConnections.length > 0 ? damConnections : dummyConnections

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDamIds(new Set())
    }
  }, [open])

  const handleSelectDam = (connection) => {
    if (allowMultiSelect) {
      // Toggle selection in multi-select mode
      setSelectedDamIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(connection.id)) {
          newSet.delete(connection.id)
        } else {
          newSet.add(connection.id)
        }
        return newSet
      })
    } else {
      // Single select mode - close dialog
      onSelectDam?.(connection)
      onOpenChange(false)
      toast.success(`Switched to ${connection.name}`)
    }
  }

  const handleConfirmSelection = () => {
    const selectedConnections = effectiveConnections.filter(conn => selectedDamIds.has(conn.id))
    if (selectedConnections.length > 0) {
      onSelectDam?.(selectedConnections.length === 1 ? selectedConnections[0] : selectedConnections)
      onOpenChange(false)
      toast.success(`Selected ${selectedConnections.length} DAM${selectedConnections.length !== 1 ? 's' : ''}`)
      setSelectedDamIds(new Set())
    }
  }

  const handleAddDam = (config) => {
    const newConnection = {
      id: `dam-${Date.now()}`,
      name: `${config.provider || selectedProvider?.name} - ${config.workspace || 'default'}`,
      provider: config.provider || selectedProvider?.name,
      apiUrl: config.apiUrl || '',
      workspace: config.workspace || 'default',
      isConnected: true,
      lastSync: new Date(),
      config,
    }
    
    onAddDam?.(newConnection)
    setCustomDamDialogOpen(false)
    setIntegrationDialogOpen(false)
    setSelectedProvider(null)
    toast.success(`Connected to ${newConnection.name}`)
  }

  const handleIntegrationConnect = (config) => {
    if (!selectedProvider) return
    
    const newConnection = {
      id: `dam-${Date.now()}`,
      name: `${selectedProvider.name} - ${config.workspace || 'default'}`,
      provider: selectedProvider.name,
      workspace: config.workspace || 'default',
      isConnected: true,
      lastSync: new Date(),
      config: { ...config, provider: selectedProvider.name },
    }
    
    onAddDam?.(newConnection)
    setIntegrationDialogOpen(false)
    setSelectedProvider(null)
    toast.success(`Connected to ${newConnection.name}`)
    // Keep dialog open so user can see the updated state
  }

  const handleRemoveDam = (connectionId) => {
    onRemoveDam?.(connectionId)
    toast.success('DAM connection removed')
  }

  // Get connection for a provider - improved matching logic
  const getProviderConnection = (providerName) => {
    if (!effectiveConnections || effectiveConnections.length === 0) return null
    
    // Try exact match first
    let connection = effectiveConnections.find(conn => 
      conn.provider?.toLowerCase() === providerName.toLowerCase()
    )
    
    if (connection) return connection
    
    // Try partial match in provider name
    connection = effectiveConnections.find(conn => 
      conn.provider?.toLowerCase().includes(providerName.toLowerCase()) ||
      providerName.toLowerCase().includes(conn.provider?.toLowerCase() || '')
    )
    
    if (connection) return connection
    
    // Try matching in connection name
    connection = effectiveConnections.find(conn => 
      conn.name?.toLowerCase().includes(providerName.toLowerCase())
    )
    
    return connection || null
  }

  // Organize providers into connected and unconnected
  const { connectedProviders, unconnectedProviders } = useMemo(() => {
    const connected = []
    const unconnected = []

    availableProviders.forEach(provider => {
      const connection = getProviderConnection(provider.name)
      if (connection && connection.isConnected !== false) {
        connected.push({ provider, connection })
      } else {
        unconnected.push({ provider })
      }
    })

    return { connectedProviders: connected, unconnectedProviders: unconnected }
  }, [effectiveConnections])

  // Handle provider click
  const handleProviderClick = (provider, connection = null) => {
    if (provider.id === 'custom') {
      setSelectedProvider(provider)
      setCustomDamDialogOpen(true)
      return
    }

    if (connection) {
      // If connected, handle selection
      handleSelectDam(connection)
    } else {
      // If not connected, open connection dialog
      setSelectedProvider(provider)
      setIntegrationDialogOpen(true)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Select DAM Connection
            </DialogTitle>
            <DialogDescription>
              Choose a connected DAM or add a new one to upload your processed images.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Connected DAMs Section */}
            {connectedProviders.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Connected ({connectedProviders.length})
                </h3>
                <div className="space-y-2">
                  {connectedProviders.map(({ provider, connection }) => {
                    const isSelected = selectedDamIds.has(connection.id)
                    const isActive = activeDamConnection?.id === connection.id
                    
                    return (
                      <Card
                        key={provider.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                            : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 hover:border-green-300 dark:hover:border-green-700'
                        }`}
                        onClick={() => handleProviderClick(provider, connection)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {allowMultiSelect && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSelectDam(connection)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0"
                              />
                            )}
                            <ProviderLogo provider={provider.name} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{provider.name}</h4>
                                {isActive && !allowMultiSelect && (
                                  <Badge variant="default" className="text-xs">
                                    Active
                                  </Badge>
                                )}
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {getConnectionDescription(connection, provider)}
                              </p>
                            </div>
                            {!allowMultiSelect && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectDam(connection)
                                }}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Unconnected DAMs Section */}
            {unconnectedProviders.length > 0 && (
              <div className="space-y-2">
                {connectedProviders.length > 0 && (
                  <div className="border-t pt-4 mt-2" />
                )}
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Available to Connect ({unconnectedProviders.length})
                </h3>
                <div className="space-y-2">
                  {unconnectedProviders.map(({ provider }) => (
                    <Card
                      key={provider.id}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handleProviderClick(provider)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <ProviderLogo provider={provider.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{provider.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {provider.description}
                            </p>
                          </div>
                          <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {connectedProviders.length === 0 && unconnectedProviders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No DAM providers available</p>
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          {allowMultiSelect && selectedDamIds.size > 0 && (
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSelection}>
                Select {selectedDamIds.size} DAM{selectedDamIds.size !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>


      {/* Custom DAM Dialog */}
      <DamConnectDialog
        open={customDamDialogOpen}
        onOpenChange={setCustomDamDialogOpen}
        onConnect={handleAddDam}
      />

      {/* Integration Dialog */}
      {selectedProvider && (
        <IntegrationConnectDialog
          open={integrationDialogOpen}
          onOpenChange={setIntegrationDialogOpen}
          provider={selectedProvider}
          onConnect={handleIntegrationConnect}
        />
      )}
    </>
  )
}
