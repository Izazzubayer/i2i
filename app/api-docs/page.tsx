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
  },
  {
    method: 'GET',
    path: '/api/v1/status/:batchId',
    description: 'Get processing status',
    category: 'Processing',
  },
  {
    method: 'GET',
    path: '/api/v1/results/:batchId',
    description: 'Get processed results',
    category: 'Processing',
  },
  {
    method: 'POST',
    path: '/api/v1/retouch/:imageId',
    description: 'Request image retouch',
    category: 'Processing',
  },
  {
    method: 'GET',
    path: '/api/v1/orders',
    description: 'List all orders',
    category: 'Orders',
  },
  {
    method: 'GET',
    path: '/api/v1/orders/:orderId',
    description: 'Get order details',
    category: 'Orders',
  },
  {
    method: 'POST',
    path: '/api/v1/export',
    description: 'Export processed images',
    category: 'Export',
  },
]

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0])

  const handleCopyKey = (key: string, keyId: string) => {
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
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
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

  const handleRevokeKey = (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(k => k.id !== keyId))
      toast.success('API key revoked')
    }
  }

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
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
                          Create an API key from the "API Keys" tab and include it in your requests.
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
                          className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors ${selectedEndpoint === endpoint ? 'bg-muted' : ''
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
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Parameters</h4>
                      <div className="space-y-2">
                        {selectedEndpoint.path === '/api/v1/process' && (
                          <>
                            <div className="flex items-start gap-3 text-xs p-3 rounded bg-muted">
                              <Badge variant="outline" className="text-xs">Required</Badge>
                              <div>
                                <code className="font-mono">images</code>
                                <span className="text-muted-foreground ml-2">- Array of image files (JPG, PNG, WebP)</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 text-xs p-3 rounded bg-muted">
                              <Badge variant="outline" className="text-xs">Optional</Badge>
                              <div>
                                <code className="font-mono">instructions</code>
                                <span className="text-muted-foreground ml-2">- Processing instructions (string)</span>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedEndpoint.path.includes(':batchId') && (
                          <div className="flex items-start gap-3 text-xs p-3 rounded bg-muted">
                            <Badge variant="outline" className="text-xs">Required</Badge>
                            <div>
                              <code className="font-mono">batchId</code>
                              <span className="text-muted-foreground ml-2">- Unique batch identifier (string)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Request Example</h4>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`curl -X ${selectedEndpoint.method} \\
  https://api.i2i.ai/v1${selectedEndpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Response Example</h4>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`{
  "success": true,
  "data": {
    "batchId": "batch_${Math.random().toString(36).substr(2, 9)}",
    "status": "${selectedEndpoint.path.includes('status') ? 'processing' : 'queued'}",
    "imageCount": 10,
    "estimatedTime": "5 minutes"
  }
}`}</pre>
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

                <TabsContent value="javascript" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload and Process Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const formData = new FormData();
formData.append('images', fs.createReadStream('image.jpg'));
formData.append('instructions', 'Remove background, enhance colors');

axios.post('https://api.i2i.ai/v1/process', formData, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    ...formData.getHeaders()
  }
})
.then(response => {
  console.log('Batch ID:', response.data.batchId);
})
.catch(error => {
  console.error('Error:', error);
});`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="python" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload and Process Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`import requests

url = 'https://api.i2i.ai/v1/process'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}
files = {
    'images': open('image.jpg', 'rb')
}
data = {
    'instructions': 'Remove background, enhance colors'
}

response = requests.post(url, headers=headers, files=files, data=data)
print('Batch ID:', response.json()['batchId'])`}</pre>
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
                placeholder="e.g., Production API Key"
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

