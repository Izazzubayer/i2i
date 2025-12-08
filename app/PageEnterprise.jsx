'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  FolderOpen,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Filter,
  Search,
  BarChart3,
  Clock,
  HardDrive,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Grid3x3,
  List,
  Server,
  TrendingUp
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useStore } from '@/lib/store'

/**
 * PageEnterprise - Enterprise/SME Large Batch Processing Interface
 * 
 * Features:
 * - Optimized for 1000+ image batches
 * - Advanced queue management
 * - Resource usage monitoring
 * - Batch operations and priority controls
 * - Real-time performance metrics
 * - Multi-batch parallel processing
 * - Advanced filtering and search
 * - Export management
 * 
 * Best for: SMEs, professional studios, high-volume operations
 */

// BatchJob type removed

export default function PageEnterprise() {
  const { resetBatch } = useStore()

  const [batches, setBatches] = useState([
    {
      id: 'batch-1',
      name: 'Product Catalog Q4 2024',
      status: 'processing',
      totalImages: 1247,
      processedImages: 673,
      progress: 54,
      priority: 'high',
      startTime: new Date(Date.now() - 3600000),
      estimatedCompletion: new Date(Date.now() + 3200000),
      resourceUsage: { cpu: 68, memory: 45, storage: 12 }
    },
    {
      id: 'batch-2',
      name: 'Marketing Campaign Assets',
      status: 'queued',
      totalImages: 856,
      processedImages: 0,
      progress: 0,
      priority: 'normal',
      resourceUsage: { cpu: 0, memory: 0, storage: 8 }
    },
    {
      id: 'batch-3',
      name: 'Social Media Content - March',
      status: 'completed',
      totalImages: 2103,
      processedImages: 2103,
      progress: 100,
      priority: 'normal',
      startTime: new Date(Date.now() - 7200000),
      resourceUsage: { cpu: 0, memory: 0, storage: 18 }
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const totalImages = batches.reduce((sum, b) => sum + b.totalImages, 0)
  const totalProcessed = batches.reduce((sum, b) => sum + b.processedImages, 0)
  const activeBatches = batches.filter(b => b.status === 'processing').length
  const queuedBatches = batches.filter(b => b.status === 'queued').length

  const getStatusBadge = (status) => {
    const variants = {
      queued: { variant: 'secondary', icon: Clock },
      processing: { variant: 'default', icon: Zap },
      paused: { variant: 'secondary', icon: Pause },
      completed: { variant: 'outline', icon: CheckCircle2, className: 'border-green-600 text-green-600' },
      failed: { variant: 'destructive', icon: AlertCircle }
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-red-500'
    }
    return colors[priority]
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Enterprise Dashboard Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container py-6 px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Enterprise Processing Dashboard
              </h1>
              <p className="text-muted-foreground">
                High-volume batch processing with advanced queue management
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 px-4 md:px-8">
        <div className="grid gap-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalImages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalProcessed.toLocaleString()} processed
                </p>
                <Progress
                  value={(totalProcessed / totalImages) * 100}
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeBatches}</div>
                <p className="text-xs text-muted-foreground">
                  {queuedBatches} in queue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4s</div>
                <p className="text-xs text-muted-foreground">
                  per image
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">38 GB</div>
                <p className="text-xs text-muted-foreground">
                  of 500 GB available
                </p>
                <Progress value={7.6} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="batches">
                <Layers className="mr-2 h-4 w-4" />
                Batches
              </TabsTrigger>
              <TabsTrigger value="performance">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="exports">
                <Download className="mr-2 h-4 w-4" />
                Exports
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Resource Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Resources</CardTitle>
                    <CardDescription>Real-time resource utilization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">CPU Usage</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Memory</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Storage I/O</span>
                        <span className="font-medium">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Network</span>
                        <span className="font-medium">24%</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest batch operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: 'Batch completed', batch: 'Social Media Content', time: '5 min ago', success: true },
                        { action: 'Processing started', batch: 'Product Catalog Q4', time: '1 hour ago', success: true },
                        { action: 'Batch queued', batch: 'Marketing Campaign', time: '2 hours ago', success: true },
                        { action: 'Export completed', batch: 'Winter Collection', time: '3 hours ago', success: true }
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${activity.success ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                            {activity.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.batch}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Batches Tab */}
            <TabsContent value="batches" className="space-y-4">
              {/* Filters and Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search batches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="queued">Queued</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Batch List */}
              <div className="space-y-4">
                {batches.map((batch) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Batch Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Checkbox />
                                <h3 className="font-semibold">{batch.name}</h3>
                                {getStatusBadge(batch.status)}
                                <Badge
                                  variant="outline"
                                  className={getPriorityColor(batch.priority)}
                                >
                                  {batch.priority} priority
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{batch.totalImages.toLocaleString()} images</span>
                                {batch.startTime && (
                                  <span>Started {batch.startTime.toLocaleTimeString()}</span>
                                )}
                                {batch.estimatedCompletion && batch.status === 'processing' && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    ~{Math.round((batch.estimatedCompletion.getTime() - Date.now()) / 60000)} min remaining
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {batch.status === 'processing' && (
                                <Button size="sm" variant="outline">
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                              {batch.status === 'paused' && (
                                <Button size="sm" variant="outline">
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              {batch.status === 'completed' && (
                                <Button size="sm" variant="outline">
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {batch.status !== 'queued' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {batch.processedImages.toLocaleString()} / {batch.totalImages.toLocaleString()}
                                </span>
                                <span className="font-medium">{batch.progress}%</span>
                              </div>
                              <Progress value={batch.progress} className="h-2" />
                            </div>
                          )}

                          {/* Resource Usage */}
                          {batch.status === 'processing' && (
                            <div className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/30 p-3">
                              <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">CPU</p>
                                  <p className="text-sm font-medium">{batch.resourceUsage.cpu}%</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Memory</p>
                                  <p className="text-sm font-medium">{batch.resourceUsage.memory}%</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Storage</p>
                                  <p className="text-sm font-medium">{batch.resourceUsage.storage} GB</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>System performance and throughput statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Images/Hour</p>
                      <p className="text-3xl font-bold">1,847</p>
                      <p className="text-xs text-green-600">↑ 12% from last hour</p>
                    </div>
                    <div className="space-y-2 rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-3xl font-bold">99.2%</p>
                      <p className="text-xs text-green-600">↑ 0.3% this week</p>
                    </div>
                    <div className="space-y-2 rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Avg Queue Time</p>
                      <p className="text-3xl font-bold">3.2m</p>
                      <p className="text-xs text-green-600">↓ 18% improvement</p>
                    </div>
                  </div>

                  <div className="h-64 flex items-center justify-center rounded-lg border bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                      <p>Performance charts would render here</p>
                      <p className="text-sm">(Prototype UI)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exports Tab */}
            <TabsContent value="exports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Management</CardTitle>
                  <CardDescription>Manage and download processed batches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {batches.filter(b => b.status === 'completed').map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{batch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.totalImages.toLocaleString()} images • {batch.resourceUsage.storage} GB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download ZIP
                          </Button>
                          <Button variant="outline" size="sm">
                            Export to DAM
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

