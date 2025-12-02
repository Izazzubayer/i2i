'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
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
import { toast } from 'sonner'

// Provider logo mapping
const providerLogos: Record<string, string> = {
  'Shopify': '/logos/integrations/shopify.png',
  'Cloudinary': '/logos/integrations/cloudinary.png',
  'Adobe AEM': '/logos/integrations/adobe.png',
  'Meta': '/logos/integrations/meta.png',
  'Google Drive': '/logos/integrations/google-drive.png',
  'Dropbox': '/logos/integrations/dropbox.png',
  'AWS S3': '/logos/integrations/aws.png',
  'Azure Blob': '/logos/integrations/azure.png',
  'Salesforce': '/logos/integrations/salesforce.png',
  'HubSpot': '/logos/integrations/hubspot.png',
  'Slack': '/logos/integrations/slack.png',
  'WordPress': '/logos/integrations/wordpress.png',
  'WooCommerce': '/logos/integrations/woocommerce.png',
  'Zapier': '/logos/integrations/zapier.png',
  'Airtable': '/logos/integrations/airtable.png',
  'Notion': '/logos/integrations/notion.png',
}

interface IntegrationConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: { id: string; name: string; description: string }
  onConnect: (config: Record<string, string>) => void
}

// Provider-specific field configurations
const providerFields: Record<string, Array<{ key: string; label: string; type: string; placeholder: string; required: boolean }>> = {
  'shopify': [
    { key: 'storeUrl', label: 'Store URL', type: 'text', placeholder: 'your-store.myshopify.com', required: true },
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Enter API secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/products', required: true },
  ],
  'cloudinary': [
    { key: 'cloudName', label: 'Cloud Name', type: 'text', placeholder: 'your-cloud-name', required: true },
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Enter API secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/assets', required: true },
  ],
  'adobe-aem': [
    { key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://author.your-domain.com', required: true },
    { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter username', required: true },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/content/dam', required: true },
  ],
  'meta': [
    { key: 'appId', label: 'App ID', type: 'text', placeholder: 'Enter App ID', required: true },
    { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Enter App Secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/media', required: true },
  ],
  'google-drive': [
    { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter Client ID', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter Client Secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'dropbox': [
    { key: 'appKey', label: 'App Key', type: 'text', placeholder: 'Enter App Key', required: true },
    { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Enter App Secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'aws-s3': [
    { key: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'your-bucket-name', required: true },
    { key: 'accessKey', label: 'Access Key', type: 'password', placeholder: 'Enter Access Key', required: true },
    { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter Secret Key', required: true },
    { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'azure-blob': [
    { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'your-account-name', required: true },
    { key: 'accountKey', label: 'Account Key', type: 'password', placeholder: 'Enter Account Key', required: true },
    { key: 'containerName', label: 'Container Name', type: 'text', placeholder: 'container-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'salesforce': [
    { key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://your-instance.salesforce.com', required: true },
    { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter Client ID', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter Client Secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/assets', required: true },
  ],
  'hubspot': [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'slack': [
    { key: 'workspaceUrl', label: 'Workspace URL', type: 'text', placeholder: 'your-workspace.slack.com', required: true },
    { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter Client ID', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter Client Secret', required: true },
    { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'wordpress': [
    { key: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https://your-site.com', required: true },
    { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter username', required: true },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/wp-content/uploads', required: true },
  ],
  'woocommerce': [
    { key: 'storeUrl', label: 'Store URL', type: 'text', placeholder: 'https://your-store.com', required: true },
    { key: 'consumerKey', label: 'Consumer Key', type: 'password', placeholder: 'Enter Consumer Key', required: true },
    { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'Enter Consumer Secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/products', required: true },
  ],
  'zapier': [
    { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/hooks/catch/...', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'airtable': [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'Enter Base ID', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
  'notion': [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/uploads', required: true },
  ],
}

export default function IntegrationConnectDialog({ open, onOpenChange, provider, onConnect }: IntegrationConnectDialogProps) {
  const [connecting, setConnecting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState<Record<string, string>>({})

  const fields = providerFields[provider.id] || []

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setConnectionStatus('idle')
  }

  const handleTestConnection = async () => {
    // Validate required fields
    const missingFields = fields.filter(f => f.required && !formData[f.key])
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1500))
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
    // Validate required fields
    const missingFields = fields.filter(f => f.required && !formData[f.key])
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    if (connectionStatus !== 'success') {
      toast.error('Please test connection first')
      return
    }

    setConnecting(true)

    try {
      // Simulate saving and connecting
      await new Promise(resolve => setTimeout(resolve, 1000))
      onConnect(formData)
      onOpenChange(false)
      setFormData({})
      setConnectionStatus('idle')
      toast.success(`${provider.name} connected successfully!`)
    } catch (error) {
      toast.error('Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  const logoPath = providerLogos[provider.name]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {logoPath && (
              <Image
                src={logoPath}
                alt={`${provider.name} logo`}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                unoptimized
              />
            )}
            Connect to {provider.name}
          </DialogTitle>
          <DialogDescription>
            {provider.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                required={field.required}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleTestConnection}
            disabled={testingConnection || !fields.every(f => !f.required || formData[f.key])}
            variant="outline"
            className="w-full"
          >
            {testingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : connectionStatus === 'success' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setFormData({})
              setConnectionStatus('idle')
            }}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

