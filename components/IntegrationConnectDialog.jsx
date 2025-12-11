'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createDamConnection, testDamConnection } from '@/api/dam/dam'

// Provider logo mapping
const providerLogos = {
  'Creative Force': '/logos/integrations/creative-force.png',
  'Dalim': '/logos/integrations/dalim.png',
  'Spin Me': '/logos/integrations/spin-me.png',
  'Facebook': '/logos/integrations/facebook.png',
  'Instagram': '/logos/integrations/instagram.png',
  'GlobalEdit': '/logos/integrations/globaledit.png',
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

// Provider-specific field configurations
const providerFields = {
  'creative-force': [
    { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://api.creativeforce.io', required: true },
    { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Enter API token', required: true },
    { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'Enter project ID', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/assets', required: true },
  ],
  'dalim': [
    { key: 'serverUrl', label: 'Server URL', type: 'text', placeholder: 'https://your-server.dalim.com', required: true },
    { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter username', required: true },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/content', required: true },
  ],
  'spin-me': [
    { key: 'apiEndpoint', label: 'API Endpoint', type: 'text', placeholder: 'https://api.spin-me.com', required: true },
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'accountId', label: 'Account ID', type: 'text', placeholder: 'Enter account ID', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/media', required: true },
  ],
  'facebook': [
    { key: 'pageId', label: 'Page ID', type: 'text', placeholder: 'Enter Facebook Page ID', required: true },
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter access token', required: true },
    { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Enter app secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/media', required: true },
  ],
  'instagram': [
    { key: 'accountId', label: 'Business Account ID', type: 'text', placeholder: 'Enter Instagram Business Account ID', required: true },
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter access token', required: true },
    { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Enter app secret', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/posts', required: true },
  ],
  'globaledit': [
    { key: 'serverUrl', label: 'Server URL', type: 'text', placeholder: 'https://your-instance.globaledit.com', required: true },
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
    { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter client ID', required: true },
    { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'workspace-name', required: true },
    { key: 'targetFolder', label: 'Target Folder', type: 'text', placeholder: '/brand/assets', required: true },
  ],
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

export default function IntegrationConnectDialog({ open, onOpenChange, provider, onConnect }) {
  const [connecting, setConnecting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('idle')
  const [formData, setFormData] = useState({})

  // Use fields from API if available, otherwise fall back to hardcoded fields
  const getFieldsFromApi = () => {
    if (provider.requiredFields) {
      const fields = []
      
      console.log('🔧 Generating fields from API for provider:', provider.name)
      console.log('📋 Required Fields:', provider.requiredFields)
      
      // Add only required fields
      if (provider.requiredFields && Array.isArray(provider.requiredFields)) {
        provider.requiredFields.forEach((fieldName) => {
          // Determine field type based on field name
          const isPassword = fieldName.toLowerCase().includes('password') || 
                            fieldName.toLowerCase().includes('secret') || 
                            fieldName.toLowerCase().includes('token') ||
                            (fieldName.toLowerCase().includes('key') && !fieldName.toLowerCase().includes('json'))
          
          // Check if it's a JSON field (should be textarea)
          const isJson = fieldName.toLowerCase().includes('json')
          
          // Get placeholder based on field name and defaultEndpoint
          let placeholder = `Enter ${fieldName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`
          if ((fieldName === 'Endpoint' || fieldName === 'ApiUrl') && provider.defaultEndpoint) {
            placeholder = provider.defaultEndpoint
          } else if (fieldName === 'Workspace') {
            placeholder = 'workspace-name'
          } else if (fieldName === 'TargetFolder') {
            placeholder = '/assets'
          } else if (isJson) {
            placeholder = '{"key": "value"}'
          }
          
          // Format field label nicely (e.g., "ApiUrl" -> "Api Url", "ProjectId" -> "Project Id")
          const formattedLabel = fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
          
          fields.push({
            key: fieldName,
            label: formattedLabel,
            type: isPassword ? 'password' : 'text',
            isTextarea: isJson,
            placeholder: placeholder,
            required: true,
          })
        })
      }
      
      console.log('✅ Generated fields:', fields)
      return fields
    }
    
    // Fallback to hardcoded fields if API doesn't provide field info
    console.log('⚠️ Using fallback hardcoded fields for:', provider.id)
    return providerFields[provider.id] || []
  }

  const fields = getFieldsFromApi()

  // Reset form when provider changes or dialog opens
  useEffect(() => {
    if (open && provider) {
      setFormData({})
      setConnectionStatus('idle')
      console.log('🔄 Form reset for provider:', provider.name)
    }
  }, [open, provider?.damSystemId])

  const handleFieldChange = (key, value) => {
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
      // Get systemCode from provider (from dam system API response)
      const systemCode = provider.systemCode || provider.damSystemId || ''
      
      // Build test request body - API expects PascalCase
      const testData = {
        SystemCode: systemCode,
      }
      
      // Map all form fields to API format (API expects PascalCase)
      Object.keys(formData).forEach((fieldName) => {
        const value = formData[fieldName]
        if (value && value.trim() !== '') {
          // Handle numeric fields like Port
          if (fieldName === 'Port' || fieldName === 'port') {
            const portValue = parseInt(value, 10)
            if (!isNaN(portValue)) {
              testData.Port = portValue
            } else {
              testData.Port = value.trim()
            }
          } else {
            // Keep PascalCase for all other fields (form already uses PascalCase)
            testData[fieldName] = value.trim()
          }
        }
      })
      
      console.log('🧪 Testing connection with data:', testData)
      
      // Call the test connection API
      const response = await testDamConnection(testData)
      
      // Check if the test was successful (double check even though API should throw)
      if (response && response.isSuccess === false) {
        throw new Error(response.message || 'Test connection failed')
      }
      
      setConnectionStatus('success')
      toast.success('Test successful!')
    } catch (error) {
      setConnectionStatus('error')
      const errorMessage = error?.message || error?.data?.message || error?.errorCode || 'Connection failed'
      toast.error(errorMessage)
    } finally {
      setTestingConnection(false)
    }
  }

  // Map form field names (PascalCase from requiredFields) to API request body field names (camelCase)
  // This mapping ensures form fields match the connections API request body structure
  const mapFieldToApiFormat = (fieldName, value) => {
    if (!value || value.trim() === '') return null
    
    // Special handling for Instagram AccountId -> instagramAccountId
    if (fieldName === 'AccountId' && provider.systemCode === 'Instagram') {
      return { instagramAccountId: value.trim() }
    }
    
    // Complete mapping of all possible fields from requiredFields to connections API request body
    // Based on: POST /api/v1/dam/connections request body structure
    const fieldMapping = {
      // Connection info
      'ConnectionName': 'connectionName',
      
      // Endpoint/URL fields
      'Endpoint': 'endpoint',
      'ApiUrl': 'apiUrl',
      
      // Authentication fields
      'ApiKey': 'apiKey',
      'ApiToken': 'apiToken',
      'ApiSecret': 'apiSecret',
      'Username': 'username',
      'Password': 'password',
      'AccessToken': 'accessToken',
      
      // Project/Workspace fields
      'ProjectId': 'projectId',
      'Workspace': 'workspace',
      'TargetFolder': 'targetFolder',
      'AccountId': 'accountId',
      'Port': 'port',
      
      // App/Platform fields
      'AppId': 'appId',
      'AppSecret': 'appSecret',
      'PageId': 'pageId',
      'ShopDomain': 'shopDomain',
      'StoreName': 'storeName',
      
      // JSON configuration fields
      'CredentialsJson': 'credentialsJson',
      'ConfigurationJson': 'configurationJson',
    }
    
    // Use mapping if available, otherwise convert PascalCase to camelCase
    const apiFieldName = fieldMapping[fieldName] || fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
    return { [apiFieldName]: value.trim() }
  }

  // Map form fields to PascalCase for connection API (API expects PascalCase)
  const mapFieldToPascalCase = (fieldName, value) => {
    if (!value || value.trim() === '') return null
    
    // Special handling for Instagram AccountId
    if (fieldName === 'AccountId' && provider.systemCode === 'Instagram') {
      return { InstagramAccountId: value.trim() }
    }
    
    // API expects PascalCase, so keep field names as-is (form already uses PascalCase)
    // Just ensure the value is trimmed
    return { [fieldName]: value.trim() }
  }

  const handleConnect = async () => {
    // Validate required fields
    const missingFields = fields.filter(f => f.required && !formData[f.key])
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    setConnecting(true)

    try {
      // Get systemCode from provider (from dam system API response)
      const systemCode = provider.systemCode || provider.damSystemId || ''
      
      // Build connection request body - API expects PascalCase
      const requestBody = {
        SystemCode: systemCode,
      }
      
      // Map all form fields to API format (API expects PascalCase)
      Object.keys(formData).forEach((fieldName) => {
        const value = formData[fieldName]
        if (value && value.trim() !== '') {
          // Handle numeric fields like Port
          if (fieldName === 'Port' || fieldName === 'port') {
            const portValue = parseInt(value, 10)
            if (!isNaN(portValue)) {
              requestBody.Port = portValue
            } else {
              requestBody.Port = value.trim()
            }
          } else {
            // Keep PascalCase for all other fields
            const mappedField = mapFieldToPascalCase(fieldName, value)
            if (mappedField) {
              Object.assign(requestBody, mappedField)
            }
          }
        }
      })

      console.log('📤 Sending connection request:', requestBody)

      // Call the API
      const response = await createDamConnection(requestBody)
      
      console.log('✅ Connection created successfully:', response)
      
      // Call the onConnect callback with the response data
      onConnect(response || formData)
      onOpenChange(false)
      setFormData({})
      setConnectionStatus('idle')
      toast.success(`${provider.name} connected successfully!`)
    } catch (error) {
      console.error('❌ Failed to connect:', error)
      let errorMessage = 'Failed to connect. Please try again.'
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      toast.error(errorMessage)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {provider.iconUrl && (
              <Image
                src={provider.iconUrl}
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
              {field.isTextarea ? (
                <Textarea
                  id={field.key}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                  rows={4}
                  className="font-mono text-sm"
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                />
              )}
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
                Test Successful
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

