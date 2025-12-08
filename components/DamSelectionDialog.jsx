'use client'

import { useState } from 'react'
import { Cloud, Plus, CheckCircle2, Settings, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import DamConnectDialog from '@/components/DamConnectDialog'
import IntegrationConnectDialog from '@/components/IntegrationConnectDialog'

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

export default function DamSelectionDialog({ 
  open, 
  onOpenChange, 
  damConnections = [], 
  activeDamConnection,
  onSelectDam,
  onAddDam,
  onRemoveDam,
}) {
  const [addDamDialogOpen, setAddDamDialogOpen] = useState(false)
  const [customDamDialogOpen, setCustomDamDialogOpen] = useState(false)
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)

  const handleSelectDam = (connection) => {
    onSelectDam?.(connection)
    onOpenChange(false)
    toast.success(`Switched to ${connection.name}`)
  }

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider)
    setAddDamDialogOpen(false)
    
    if (provider.id === 'custom') {
      setCustomDamDialogOpen(true)
    } else {
      setIntegrationDialogOpen(true)
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
  }

  const handleRemoveDam = (connectionId) => {
    onRemoveDam?.(connectionId)
    toast.success('DAM connection removed')
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
            {/* Connected DAMs */}
            {damConnections.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Connected DAMs</h3>
                {damConnections.map((connection) => (
                  <Card 
                    key={connection.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      activeDamConnection?.id === connection.id 
                        ? 'border-primary bg-primary/5' 
                        : ''
                    }`}
                    onClick={() => handleSelectDam(connection)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{connection.name}</h4>
                            {activeDamConnection?.id === connection.id && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {connection.provider} • {connection.workspace}
                          </p>
                          {connection.lastSync && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last synced: {new Date(connection.lastSync).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {activeDamConnection?.id !== connection.id && (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveDam(connection.id)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No DAM connections yet</p>
                <p className="text-sm mt-1">Click "Add DAM" to get started</p>
              </div>
            )}

            {/* Add DAM Button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setAddDamDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add DAM
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add DAM Provider Selection Dialog */}
      <Dialog open={addDamDialogOpen} onOpenChange={setAddDamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select DAM Provider</DialogTitle>
            <DialogDescription>
              Choose a DAM provider to connect to
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto py-4">
            {availableProviders.map((provider) => (
              <Card
                key={provider.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectProvider(provider)}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
