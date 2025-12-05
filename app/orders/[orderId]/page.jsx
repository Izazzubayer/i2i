'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Check,
  X,
  FileText,
  Sparkles,
  Cloud,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Header from '@/components/Header'
import DamConnectDialog from '@/components/DamConnectDialog'
import { useStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

// Mock order details
const mockOrderDetails = {
  id: 'ORD-2024-001',
  createdAt: '2024-10-28T10:30:00',
  completedAt: '2024-10-28T10:32:15',
  status: 'completed',
  imageCount: 45,
  processedCount: 45,
  approvedCount: 42,
  retouchCount: 3,
  failedCount: 0,
  totalSize: '1.2 GB',
  instructions: 'Remove backgroundenhance colorsresize to 1920x1080',
  processingTime: '2m 15s',
  summary: `This batch contains 45 images for AI-powered processing with the following objectives:

Remove backgroundenhance colorsresize to 1920x1080

The AI will analyze each image and apply the following transformations:
• Background enhancement and removal
• Color correction and optimization
• Object detection and masking
• Smart cropping and composition
• Quality enhancement using advanced algorithms

Expected processing time: 113 seconds
Total file size: 1.2 GB

All processed images will maintain original quality while applying the requested enhancements. The system will automatically detect and optimize each image based on its content and composition.`,
  images: [
    { id: 'img-1', name: 'product-001.jpg', status: 'approved', size: '28 MB', processedUrl: 'https://picsum.photos/seed/1/400/300' },
    { id: 'img-2', name: 'product-002.jpg', status: 'approved', size: '25 MB', processedUrl: 'https://picsum.photos/seed/2/400/300' },
    { id: 'img-3', name: 'product-003.jpg', status: 'needs-retouch', size: '30 MB', processedUrl: 'https://picsum.photos/seed/3/400/300' },
    { id: 'img-4', name: 'product-004.jpg', status: 'approved', size: '27 MB', processedUrl: 'https://picsum.photos/seed/4/400/300' },
    { id: 'img-5', name: 'product-005.jpg', status: 'approved', size: '26 MB', processedUrl: 'https://picsum.photos/seed/5/400/300' },
    { id: 'img-6', name: 'product-006.jpg', status: 'needs-retouch', size: '29 MB', processedUrl: 'https://picsum.photos/seed/6/400/300' },
    { id: 'img-7', name: 'product-007.jpg', status: 'approved', size: '24 MB', processedUrl: 'https://picsum.photos/seed/7/400/300' },
    { id: 'img-8', name: 'product-008.jpg', status: 'approved', size: '31 MB', processedUrl: 'https://picsum.photos/seed/8/400/300' },
    { id: 'img-9', name: 'product-009.jpg', status: 'needs-retouch', size: '28 MB', processedUrl: 'https://picsum.photos/seed/9/400/300' },
    { id: 'img-10', name: 'product-010.jpg', status: 'approved', size: '27 MB', processedUrl: 'https://picsum.photos/seed/10/400/300' },
  ],
}

export default function OrderDetailPage({ params }) {
  const [showSummary, setShowSummary] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const order = mockOrderDetails
  
  // DAM state
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [uploadingToDAM, setUploadingToDAM] = useState(false)
  const { addDamConnection, activeDamConnection } = useStore()

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-600"><Clock className="mr-1 h-3 w-3" />Processing</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>
      default:
        return <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" />{status}</Badge>
    }
  }

  const getImageStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-white text-green-700 shadow-sm"><Check className="mr-1 h-3 w-3" />Approved</Badge>
      case 'needs-retouch':
        return <Badge variant="secondary" className="bg-white text-yellow-700 shadow-sm"><Edit className="mr-1 h-3 w-3" />Needs Retouch</Badge>
      case 'failed':
        return <Badge variant="secondary" className="bg-white text-red-700 shadow-sm"><X className="mr-1 h-3 w-3" />Failed</Badge>
      default:
        return <Badge variant="secondary" className="bg-white">{status}</Badge>
    }
  }

  const filteredImages = order.images.filter(img => {
    if (selectedTab === 'all') return true
    return img.status === selectedTab
  })

  // Handle DAM connection
  const handleConnectDam = () => {
    if (activeDamConnection) {
      handleUploadToDAM()
    } else {
      setDamDialogOpen(true)
    }
  }

  const handleDamConnect = async (configmConfig) => {
    addDamConnection(config)
    setDamDialogOpen(false)
    await handleUploadToDAM()
  }

  const handleUploadToDAM = async () => {
    if (!activeDamConnection) {
      toast.error('No DAM connection found')
      return
    }

    // Get approved images from the order
    const approvedImages = order.images.filter(img => img.status === 'approved')
    const approvedImageIds = approvedImages.map(img => img.id)

    if (approvedImageIds.length === 0) {
      toast.error('No approved images to upload')
      return
    }

    try {
      setUploadingToDAM(true)
      toast.loading(`Uploading ${approvedImageIds.length} approved images to DAM...`)

      await apiClient.uploadToDAM({
        imageIds: approvedImageIds,
        damConfig: activeDamConnection.config,
        batchId: order.id,
      })

      toast.dismiss()
      toast.success(`Successfully uploaded ${approvedImageIds.length} images to ${activeDamConnection.name}`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to upload images to DAM')
      console.error('DAM upload error:', error)
    } finally {
      setUploadingToDAM(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-4 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>

          {/* Order Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{order.id}</h1>
              <div className="hidden lg:block text-2xl text-muted-foreground">|</div>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowSummary(true)}>
                <FileText className="mr-2 h-4 w-4" />
                View Summary
              </Button>
              {order.status === 'completed' && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleConnectDam}
                    disabled={uploadingToDAM}
                  >
                    {uploadingToDAM ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Cloud className="mr-2 h-4 w-4" />
                        {activeDamConnection ? 'Upload to DAM' : 'Connect DAM'}
                      </>
                    )}
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download Project
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Date and Time Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground -mt-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm">Total Images</CardDescription>
                <CardTitle className="text-3xl">{order.imageCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm">Processed</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{order.processedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm">Approved</CardDescription>
                <CardTitle className="text-3xl text-green-600">{order.approvedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm">Needs Retouch</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{order.retouchCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm">Total Size</CardDescription>
                <CardTitle className="text-3xl">{order.totalSize}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Processing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Instructions</p>
                  <p className="mt-1 text-sm font-medium">{order.instructions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing Time</p>
                  <p className="mt-1 text-sm font-medium">{order.processingTime}</p>
                </div>
                {order.completedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Completed At</p>
                    <p className="mt-1 text-sm font-medium">
                      {new Date(order.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="mt-2">
                    <Progress value={(order.processedCount / order.imageCount) * 100} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.processedCount}/{order.imageCount} images processed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processed Images</CardTitle>
              <CardDescription className="text-sm">
                View and manage all processed images from this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({order.imageCount})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({order.approvedCount})</TabsTrigger>
                  <TabsTrigger value="needs-retouch">Retouch ({order.retouchCount})</TabsTrigger>
                  {order.failedCount > 0 && (
                    <TabsTrigger value="failed">Failed ({order.failedCount})</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value={selectedTab} className="mt-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="relative aspect-[4/3] bg-muted">
                          <Image
                            src={image.processedUrl}
                            alt={image.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw(max-width: 1200px) 50vw33vw"
                          />
                          <div className="absolute top-2 right-2">
                            {getImageStatusBadge(image.status)}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium truncate">{image.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{image.size}</p>
                          <div className="mt-3 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="mr-1 h-3 w-3" />
                              Save
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DAM Connect Dialog */}
      <DamConnectDialog
        open={damDialogOpen}
        onOpenChange={setDamDialogOpen}
        onConnect={handleDamConnect}
      />

      {/* AI Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Generated Project Summary
            </DialogTitle>
            <DialogDescription className="text-sm">
              Order {order.id} - Processing Summary
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {order.summary}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowSummary(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

