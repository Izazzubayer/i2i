'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Code,
  Book,
  Terminal,
  Zap,
  Shield,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Header from '@/components/Header'
import { toast } from 'sonner'

// Mock API keys
const mockApiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_example_prod_key_1234567890',
    created: '2024-10-15T10:00:00',
    lastUsed: '2024-10-28T14:30:00',
    requests: 1250,
    status: 'active',
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'sk_test_example_dev_key_abcdef123456',
    created: '2024-09-20T08:00:00',
    lastUsed: '2024-10-27T16:45:00',
    requests: 450,
    status: 'active',
  },
]

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/process',
    description: 'Upload and process images',
    category: 'Processing',
    parameters: [
      { name: 'images', type: 'File[]', required: true, description: 'Array of image files (JPG, PNG, WebP, TIFF, max 50MB each)' },
      { name: 'instructions', type: 'string', required: false, description: 'Natural language processing instructions' },
      { name: 'preset', type: 'string', required: false, description: 'Preset configuration (e.g., "background_removal", "enhance", "retouch")' },
      { name: 'outputFormat', type: 'string', required: false, description: 'Output format: jpg, png, webp (default: same as input)' },
      { name: 'quality', type: 'number', required: false, description: 'Output quality 1-100 (default: 95)' },
    ],
    requestBody: {
      type: 'multipart/form-data',
      example: { images: ['file1.jpg', 'file2.png'], instructions: 'Remove background and enhance colors' }
    },
    responseExample: {
      success: true,
      data: {
        batchId: 'batch_abc123xyz',
        status: 'queued',
        imageCount: 2,
        estimatedTime: '3-5 minutes',
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/status/:batchId',
    description: 'Get processing status',
    category: 'Processing',
    parameters: [
      { name: 'batchId', type: 'string', required: true, description: 'Unique batch identifier from process endpoint' },
    ],
    responseExample: {
      success: true,
      data: {
        batchId: 'batch_abc123xyz',
        status: 'processing',
        progress: 65,
        completed: 13,
        total: 20,
        failed: 0,
        estimatedTimeRemaining: '2 minutes',
        startedAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:32:00Z'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/results/:batchId',
    description: 'Get processed results',
    category: 'Processing',
    parameters: [
      { name: 'batchId', type: 'string', required: true, description: 'Unique batch identifier' },
      { name: 'format', type: 'string', required: false, description: 'Response format: json, zip (default: json)' },
    ],
    responseExample: {
      success: true,
      data: {
        batchId: 'batch_abc123xyz',
        status: 'completed',
        images: [
          {
            id: 'img_123',
            originalUrl: 'https://cdn.i2i.ai/originals/img_123.jpg',
            processedUrl: 'https://cdn.i2i.ai/processed/img_123.jpg',
            status: 'completed',
            processingTime: 12.5,
            metadata: { width: 1920, height: 1080, format: 'jpg', size: 245678 }
          }
        ],
        summary: {
          total: 20,
          completed: 20,
          failed: 0,
          totalProcessingTime: 240
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/retouch/:imageId',
    description: 'Request image retouch',
    category: 'Processing',
    parameters: [
      { name: 'imageId', type: 'string', required: true, description: 'Image identifier from results' },
      { name: 'instructions', type: 'string', required: true, description: 'Detailed retouching instructions' },
      { name: 'priority', type: 'string', required: false, description: 'Processing priority: low, normal, high (default: normal)' },
    ],
    requestBody: {
      type: 'application/json',
      example: { instructions: 'Remove blemishes and smooth skin tone', priority: 'high' }
    },
    responseExample: {
      success: true,
      data: {
        retouchId: 'retouch_xyz789',
        imageId: 'img_123',
        status: 'queued',
        estimatedTime: '2-3 minutes'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/orders',
    description: 'List all orders',
    category: 'Orders',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20, max: 100)' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status: queued, processing, completed, failed' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order: created_at, updated_at (default: created_at)' },
      { name: 'order', type: 'string', required: false, description: 'Sort direction: asc, desc (default: desc)' },
    ],
    responseExample: {
      success: true,
      data: {
        orders: [
          {
            id: 'order_123',
            batchId: 'batch_abc123xyz',
            status: 'completed',
            imageCount: 20,
            createdAt: '2024-01-15T10:30:00Z',
            completedAt: '2024-01-15T10:35:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 45,
          totalPages: 3
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/orders/:orderId',
    description: 'Get order details',
    category: 'Orders',
    parameters: [
      { name: 'orderId', type: 'string', required: true, description: 'Unique order identifier' },
    ],
    responseExample: {
      success: true,
      data: {
        id: 'order_123',
        batchId: 'batch_abc123xyz',
        status: 'completed',
        imageCount: 20,
        completedCount: 20,
        failedCount: 0,
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:35:00Z',
        totalCost: 2.50,
        images: []
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/export',
    description: 'Export processed images',
    category: 'Export',
    parameters: [
      { name: 'batchId', type: 'string', required: true, description: 'Batch identifier to export' },
      { name: 'format', type: 'string', required: false, description: 'Export format: zip, tar (default: zip)' },
      { name: 'destination', type: 'object', required: false, description: 'Export destination configuration' },
    ],
    requestBody: {
      type: 'application/json',
      example: { batchId: 'batch_abc123xyz', format: 'zip', destination: { type: 's3', bucket: 'my-bucket', path: '/exports' } }
    },
    responseExample: {
      success: true,
      data: {
        exportId: 'export_456',
        batchId: 'batch_abc123xyz',
        status: 'processing',
        downloadUrl: null,
        estimatedTime: '1-2 minutes'
      }
    }
  },
]

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [showKey, setShowKey] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0])

  const handleCopyKey = (key, keyId) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(keyId)
    toast.success('API key copied to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    const newKey = {
      id: String(Date.now()),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(215)}${Math.random().toString(36).substring(215)}`,
      created: new Date().toISOString(),
      lastUsed: 'Never',
      requests: 0,
      status: 'active',
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    setShowNewKeyDialog(false)
    toast.success('New API key generated successfully')
  }

  const handleRevokeKey = (keyId) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(prev => prev.filter(k => k.id !== keyId))
      toast.success('API key revoked')
    }
  }

  const getMethodBadge = (method) => {
    const colors = {
      GET: 'bg-blue-600',
      POST: 'bg-green-600',
      PUT: 'bg-yellow-600',
      DELETE: 'bg-red-600',
    }
    return <Badge className={`${colors[method]} font-mono`}>{method}</Badge>
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-4 md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
            <p className="text-muted-foreground mt-2">
              Integrate i2i AI image processing into your applications
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">
                <Book className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="keys">
                <Key className="mr-2 h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="endpoints">
                <Terminal className="mr-2 h-4 w-4" />
                Endpoints
              </TabsTrigger>
              <TabsTrigger value="examples">
                <Code className="mr-2 h-4 w-4" />
                Code Examples
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Getting Started */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Getting Started</CardTitle>
                  <CardDescription className="text-sm">
                    Quick guide to integrate i2i API into your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    i2i provides an AI-powered image processing API that integrates seamlessly into your workflow. 
                    Process images with background removal, enhancement, retouching, and more.
                        </p>
                  <div className="space-y-4 mt-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0 text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Generate API Key</h3>
                        <p className="text-sm text-muted-foreground">
                          Create an API key from the &quot;API Keys&quot; tab and include it in your requests.
                        </p>
                        </div>
                      </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0 text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Upload Images</h3>
                        <p className="text-sm text-muted-foreground">
                          Send images via POST request with your processing instructions.
                        </p>
                        </div>
                      </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0 text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Retrieve Results</h3>
                        <p className="text-sm text-muted-foreground">
                          Get your processed images via API or FTP/SFTP delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Base URL</p>
                    <div className="rounded-lg bg-muted p-3 font-mono text-sm">
                      https://api.i2i.ai/v1
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Authentication</p>
                    <div className="rounded-lg bg-muted p-3 font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      All API requests require authentication using a Bearer token in the Authorization header. 
                      Generate your API key from the API Keys tab above.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Content Type</p>
                    <div className="rounded-lg bg-muted p-3 font-mono text-sm">
                      Content-Type: application/json
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use multipart/form-data for file upload endpoints (POST /api/v1/process).
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Secure your API requests with bearer token authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The i2i API uses Bearer token authentication. Include your API key in the Authorization header 
                    for every request. API keys are scoped to your account and provide full access to your resources.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Request Header Format</h4>
                    <div className="rounded-lg bg-muted p-3 font-mono text-sm">
                      <div>Authorization: Bearer sk_live_your_api_key_here</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Example cURL Request</h4>
                    <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                      <pre>{`curl -X GET https://api.i2i.ai/v1/orders \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
  -H "Content-Type: application/json"`}</pre>
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          Security Best Practices
                        </p>
                        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                          <li>Never expose your API keys in client-side code or public repositories</li>
                          <li>Rotate keys regularly, especially if compromised</li>
                          <li>Use environment variables to store keys securely</li>
                          <li>Restrict key usage by IP address when possible</li>
                          <li>Monitor key usage for unauthorized access</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Rate Limits
                  </CardTitle>
                  <CardDescription className="text-sm">
                    API request limits and quota management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Rate limits are applied to ensure fair usage and maintain API performance. 
                    Limits vary based on your subscription plan.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold text-sm mb-2">Free Plan</h4>
                      <p className="text-2xl font-bold">100</p>
                      <p className="text-xs text-muted-foreground mt-1">requests/hour</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold text-sm mb-2">Pro Plan</h4>
                      <p className="text-2xl font-bold">1,000</p>
                      <p className="text-xs text-muted-foreground mt-1">requests/hour</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold text-sm mb-2">Enterprise</h4>
                      <p className="text-2xl font-bold">10,000+</p>
                      <p className="text-xs text-muted-foreground mt-1">requests/hour</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Rate Limit Headers</h4>
                    <div className="rounded-lg bg-muted p-3 space-y-2 font-mono text-xs">
                      <div>X-RateLimit-Limit: 1000</div>
                      <div>X-RateLimit-Remaining: 999</div>
                      <div>X-RateLimit-Reset: 1698742800</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rate limit information is included in response headers for all API requests.
                    </p>
                  </div>

                  <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                          Rate Limit Exceeded
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400">
                          When rate limits are exceeded, you&apos;ll receive a 429 Too Many Requests response. 
                          Wait until the reset time indicated in the X-RateLimit-Reset header before retrying.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Handling */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Error Handling</CardTitle>
                  <CardDescription className="text-sm">
                    Understanding API errors and responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The i2i API uses standard HTTP status codes to indicate success or failure. 
                    All errors return a JSON response with error details.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-green-600">200</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">OK</p>
                        <p className="text-xs text-muted-foreground">Request succeeded</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-red-600">400</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Bad Request</p>
                        <p className="text-xs text-muted-foreground">Invalid request parameters or malformed data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-red-600">401</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Unauthorized</p>
                        <p className="text-xs text-muted-foreground">Missing or invalid API key</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-red-600">403</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Forbidden</p>
                        <p className="text-xs text-muted-foreground">Valid key but insufficient permissions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-red-600">404</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Not Found</p>
                        <p className="text-xs text-muted-foreground">Resource does not exist</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-yellow-600">429</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Too Many Requests</p>
                        <p className="text-xs text-muted-foreground">Rate limit exceeded</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="bg-red-600">500</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Internal Server Error</p>
                        <p className="text-xs text-muted-foreground">Server error - contact support</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Error Response Format</h4>
                    <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                      <pre>{`{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing required parameters",
    "details": {
      "field": "images",
      "reason": "At least one image is required"
    }
  }
}`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your API Keys</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your API keys for authentication
                  </p>
                </div>
                <Button onClick={() => setShowNewKeyDialog(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  Generate New Key
                </Button>
              </div>

              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                        Keep your API keys secure
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Never share your API keys publicly or commit them to version control.
                        Treat them like passwords.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <Card key={apiKey.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{apiKey.name}</h3>
                              <Badge variant="secondary" className="bg-green-600/10 text-green-700">
                                Active
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(apiKey.created).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeKey(apiKey.id)}
                            className="text-destructive"
                          >
                            Revoke
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type={showKey === apiKey.id ? 'text' : 'password'}
                              value={apiKey.key}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                            >
                              {showKey === apiKey.id ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                            >
                              {copiedKey === apiKey.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Last Used</p>
                            <p className="font-medium">
                              {typeof apiKey.lastUsed === 'string' && apiKey.lastUsed !== 'Never'
                                ? new Date(apiKey.lastUsed).toLocaleString()
                                : apiKey.lastUsed}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Requests</p>
                            <p className="font-medium">{apiKey.requests.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Endpoints Tab */}
            <TabsContent value="endpoints" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold">API Endpoints</h2>
                <p className="text-sm text-muted-foreground">
                  Browse available endpoints and view request/response examples
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Endpoints</CardTitle>
                    <CardDescription className="text-xs">Click to view details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {endpoints.map((endpoint, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedEndpoint(endpoint)}
                          className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors ${selectedEndpoint.path === endpoint.path ? 'bg-muted' : ''
                            }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getMethodBadge(endpoint.method)}
                            </div>
                            <span className="font-mono text-xs">{endpoint.path}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getMethodBadge(selectedEndpoint.method)}
                      <CardTitle className="font-mono text-lg">{selectedEndpoint.path}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">{selectedEndpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Detailed Description */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedEndpoint.path === '/api/v1/process' && 
                          'Upload single or multiple images for AI processing. Supports batch operations up to 100 images. Include processing instructions in natural language or use preset configurations.'
                        }
                        {selectedEndpoint.path === '/api/v1/status/:batchId' && 
                          'Monitor the real-time processing status of your batch. Returns detailed progress information including completed images, remaining images, and estimated completion time.'
                        }
                        {selectedEndpoint.path === '/api/v1/results/:batchId' && 
                          'Retrieve processed images once the batch is complete. Returns download URLs, metadata, and processing statistics. URLs are valid for 7 days.'
                        }
                        {selectedEndpoint.path === '/api/v1/retouch/:imageId' && 
                          'Request additional modifications to a previously processed image. Useful for iterative refinements without re-uploading the original.'
                        }
                        {selectedEndpoint.path === '/api/v1/orders' && 
                          'List all your processing orders with pagination support. Filter by status, date range, or tags. Includes summary statistics.'
                        }
                        {selectedEndpoint.path === '/api/v1/orders/:orderId' && 
                          'Get comprehensive details about a specific order including all images, processing parameters, costs, and delivery status.'
                        }
                        {selectedEndpoint.path === '/api/v1/export' && 
                          'Export processed images to FTP/SFTP, DAM systems, or cloud storage. Configure delivery preferences and folder structures.'
                        }
                      </p>
                    </div>

                    {/* Parameters */}
                    {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">Parameters</h4>
                        <div className="space-y-2">
                          {selectedEndpoint.parameters.map((param, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs p-3 rounded bg-muted">
                              <Badge variant="outline" className={`text-xs ${param.required ? 'border-red-300 text-red-700' : ''}`}>
                                {param.required ? 'Required' : 'Optional'}
                              </Badge>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="font-mono font-semibold">{param.name}</code>
                                  <span className="text-muted-foreground text-xs">({param.type})</span>
                                </div>
                                <p className="text-muted-foreground">{param.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Path Parameters */}
                    {selectedEndpoint.path.includes(':') && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">Path Parameters</h4>
                        <div className="space-y-2">
                          {selectedEndpoint.path.match(/:(\w+)/g)?.map((param, idx) => {
                            const paramName = param.replace(':', '')
                            return (
                              <div key={idx} className="flex items-start gap-3 text-xs p-3 rounded bg-muted">
                                <Badge variant="outline" className="text-xs border-red-300 text-red-700">Required</Badge>
                                <div>
                                  <code className="font-mono">{paramName}</code>
                                  <span className="text-muted-foreground ml-2">- Path parameter in URL</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Request Example */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Request Example</h4>
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        {selectedEndpoint.method === 'POST' && selectedEndpoint.requestBody?.type === 'multipart/form-data' ? (
                          <pre>{`curl -X POST https://api.i2i.ai/v1${selectedEndpoint.path.replace(/:(\w+)/g, 'REPLACE_WITH_$1')} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "images=@image1.jpg" \\
  -F "images=@image2.png" \\
  -F "instructions=Remove background and enhance colors"`}</pre>
                        ) : selectedEndpoint.method === 'POST' ? (
                          <pre>{`curl -X POST https://api.i2i.ai/v1${selectedEndpoint.path.replace(/:(\w+)/g, 'REPLACE_WITH_$1')} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(selectedEndpoint.requestBody?.example || {}, null, 2)}'`}</pre>
                        ) : (
                          <pre>{`curl -X ${selectedEndpoint.method} https://api.i2i.ai/v1${selectedEndpoint.path.replace(/:(\w+)/g, 'REPLACE_WITH_$1')} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                        )}
                      </div>
                    </div>

                    {/* Response Example */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Response Example</h4>
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(selectedEndpoint.responseExample || {
                          success: true,
                          data: {}
                        }, null, 2)}</pre>
                      </div>
                    </div>

                    {/* Response Codes */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Response Codes</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs p-2 rounded bg-green-50 dark:bg-green-950/20">
                          <Badge className="bg-green-600">200</Badge>
                          <span>Success - Request completed successfully</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs p-2 rounded bg-red-50 dark:bg-red-950/20">
                          <Badge className="bg-red-600">401</Badge>
                          <span>Unauthorized - Invalid or missing API key</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
                          <Badge className="bg-yellow-600">429</Badge>
                          <span>Rate Limit - Too many requests</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Code Examples Tab */}
            <TabsContent value="examples" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold">Code Examples</h2>
                <p className="text-sm text-muted-foreground">
                  Implementation examples in popular languages
                </p>
              </div>

              <Tabs defaultValue="javascript" className="w-full">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload and Process Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        <pre>{`const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function processImages(imagePaths, instructions) {
  const formData = new FormData();
  
  // Add images
  imagePaths.forEach(path => {
    formData.append('images', fs.createReadStream(path));
  });
  
  // Add processing instructions
  if (instructions) {
    formData.append('instructions', instructions);
  }

  try {
    const response = await axios.post(
      'https://api.i2i.ai/v1/process',
      formData,
      {
        headers: {
          'Authorization': \`Bearer \${process.env.I2I_API_KEY}\`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('Batch ID:', response.data.data.batchId);
    console.log('Status:', response.data.data.status);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status);
      console.error('Error Details:', error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
    throw error;
  }
}

// Usage
processImages(['image1.jpg', 'image2.png'], 'Remove background')
  .then(batch => {
    console.log('Processing started:', batch.batchId);
  })
  .catch(error => {
    console.error('Failed to process images:', error);
  });`}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Check Processing Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        <pre>{`async function checkStatus(batchId) {
  try {
    const response = await axios.get(
      \`https://api.i2i.ai/v1/status/\${batchId}\`,
      {
        headers: {
          'Authorization': \`Bearer \${process.env.I2I_API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const { status, progress, completed, total } = response.data.data;
    console.log(\`Status: \${status} - \${completed}/\${total} (\${progress}%)\`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking status:', error.response?.data || error.message);
    throw error;
  }
}

// Poll status until complete
async function waitForCompletion(batchId, intervalMs = 5000) {
  while (true) {
    const status = await checkStatus(batchId);
    
    if (status.status === 'completed') {
      console.log('Processing completed!');
      return status;
    }
    
    if (status.status === 'failed') {
      throw new Error('Processing failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="python" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload and Process Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        <pre>{`import requests
import os
from typing import List

def process_images(image_paths: List[str], instructions: str = None):
    """
    Upload and process images using i2i API
    
    Args:
        image_paths: List of paths to image files
        instructions: Optional processing instructions
    """
    url = 'https://api.i2i.ai/v1/process'
    headers = {
        'Authorization': f"Bearer {os.getenv('I2I_API_KEY')}"
    }
    
    # Prepare files
    files = []
    for path in image_paths:
        files.append(('images', open(path, 'rb')))
    
    # Prepare data
    data = {}
    if instructions:
        data['instructions'] = instructions
    
    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        
        result = response.json()
        batch_id = result['data']['batchId']
        print(f"Batch ID: {batch_id}")
        print(f"Status: {result['data']['status']}")
        
        # Close file handles
        for _, file in files:
            file.close()
        
        return result['data']
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e.response.status_code}")
        print(f"Error Details: {e.response.json()}")
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise

# Usage
if __name__ == "__main__":
    batch = process_images(
        ['image1.jpg', 'image2.png'],
        'Remove background and enhance colors'
    )
    print(f"Processing started: {batch['batchId']}")`}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Check Status with Polling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                        <pre>{`import time

def check_status(batch_id: str):
    """Check processing status of a batch"""
    url = f'https://api.i2i.ai/v1/status/{batch_id}'
    headers = {
        'Authorization': f"Bearer {os.getenv('I2I_API_KEY')}",
        'Content-Type': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()['data']

def wait_for_completion(batch_id: str, interval: int = 5):
    """Poll status until processing completes"""
    while True:
        status = check_status(batch_id)
        
        print(f"Status: {status['status']} - "
              f"{status['completed']}/{status['total']} "
              f"({status['progress']}%)")
        
        if status['status'] == 'completed':
            print("Processing completed!")
            return status
        
        if status['status'] == 'failed':
            raise Exception("Processing failed")
        
        time.sleep(interval)`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="php" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload and Process Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`<?php
$ch = curl_init();

$data = array(
    'images' => new CURLFile('image.jpg'),
    'instructions' => 'Remove background, enhance colors'
);

curl_setopt($ch, CURLOPT_URL, 'https://api.i2i.ai/v1/process');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer YOUR_API_KEY'
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo 'Batch ID: ' . $result['batchId'];
?>`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="curl" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload and Process Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`curl -X POST https://api.i2i.ai/v1/process \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "images=@image.jpg" \\
  -F "instructions=Remove background, enhance colors"`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <a
                  href="#"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Book className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Full Documentation</p>
                      <p className="text-xs text-muted-foreground">Complete API reference guide</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Terminal className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">API Status</p>
                      <p className="text-xs text-muted-foreground">Real-time API health status</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact our support team at <a href="mailto:api@i2i.ai" className="text-primary hover:underline">api@i2i.ai</a> or 
                visit our <a href="/support" className="text-primary hover:underline">support center</a> for assistance.
                </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate New Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription className="text-sm">
              Create a new API key for your application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Key Name</label>
              <Input
                placeholder="e.g.Production API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Choose a descriptive name to identify this key
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateKey}>
              <Key className="mr-2 h-4 w-4" />
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

