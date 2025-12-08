'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
import { getOrderDetails } from '@/api'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params?.orderId
  
  const [showSummary, setShowSummary] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // DAM state
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [uploadingToDAM, setUploadingToDAM] = useState(false)
  const { addDamConnection, activeDamConnection } = useStore()

  // Fetch order details
  useEffect(() => {
    if (!orderId) return

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const orderData = await getOrderDetails(orderId, { expirationMinutes: 60 })
        
        // Transform API response to match UI structure
        const transformedOrder = {
          id: orderData.orderId,
          orderNumber: orderData.orderName || orderData.orderId,
          createdAt: orderData.createdAt,
          updatedAt: orderData.updatedAt,
          expireAt: orderData.expireAt,
          status: orderData.status?.toLowerCase() || 'pending',
          // Calculate stats from versions
          imageCount: orderData.versions?.length || 0,
          processedCount: orderData.versions?.filter(v => v.statusLookupId).length || 0,
          approvedCount: orderData.versions?.filter(v => v.isActive && v.statusLookupId).length || 0,
          retouchCount: 0, // This would need to come from status lookup
          failedCount: orderData.versions?.filter(v => v.statusLookupId && v.statusLookupId.includes('failed')).length || 0,
          // Get instructions from first input
          instructions: orderData.inputs?.[0]?.promptText || 'No instructions provided',
          // Calculate processing time
          processingTime: orderData.versions?.reduce((sum, v) => sum + (v.processingTimeMS || 0), 0) || 0,
          // Transform versions to images
          images: orderData.versions?.map((version, index) => {
            const input = orderData.inputs?.find(i => i.orderInputId === version.orderInputId)
            return {
              id: version.versionId,
              orderInputId: version.orderInputId,
              imageId: version.imageId,
              name: input?.downloadUrl ? `image-${index + 1}.jpg` : `version-${version.versionNumber}.jpg`,
              status: version.isActive ? 'approved' : version.statusLookupId?.includes('failed') ? 'failed' : 'needs-retouch',
              size: 'N/A', // Size not provided in API
              processedUrl: version.downloadUrl || '',
              inputUrl: input?.downloadUrl || '',
              versionNumber: version.versionNumber,
              promptUsed: version.promptUsed,
              processingTimeMS: version.processingTimeMS,
              tokensUsed: version.tokensUsed,
              price: version.price,
            }
          }) || [],
          // Full API data for reference
          _apiData: orderData,
        }
        
        setOrder(transformedOrder)
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError(err.message || 'Failed to load order details')
        toast.error(err.message || 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

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

  const filteredImages = order?.images?.filter(img => {
    if (selectedTab === 'all') return true
    return img.status === selectedTab
  }) || []

  // Handle DAM connection
  const handleConnectDam = () => {
    if (activeDamConnection) {
      handleUploadToDAM()
    } else {
      setDamDialogOpen(true)
    }
  }

  const handleDamConnect = async (config) => {
    addDamConnection(config)
    setDamDialogOpen(false)
    await handleUploadToDAM()
  }

  const handleUploadToDAM = async () => {
    if (!activeDamConnection) {
      toast.error('No DAM connection found')
      return
    }

    if (!order) {
      toast.error('Order not loaded')
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

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 px-4 md:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading order details...</span>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 px-4 md:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <Card>
              <CardContent className="py-10 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Failed to Load Order</h2>
                <p className="text-muted-foreground">{error || 'Order not found'}</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">{order.orderNumber || order.id}</h1>
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
                  <p className="mt-1 text-sm font-medium">
                    {order.processingTime > 0 
                      ? `${Math.floor(order.processingTime / 1000 / 60)}m ${Math.floor((order.processingTime / 1000) % 60)}s`
                      : 'N/A'}
                  </p>
                </div>
                {order.updatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="mt-1 text-sm font-medium">
                      {new Date(order.updatedAt).toLocaleString()}
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
                  {filteredImages.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No images found for this filter</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden">
                          <div className="relative aspect-[4/3] bg-muted">
                            {image.processedUrl ? (
                              <Image
                                src={image.processedUrl}
                                alt={image.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              {getImageStatusBadge(image.status)}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm font-medium truncate">{image.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {image.size || `Version ${image.versionNumber || 'N/A'}`}
                            </p>
                            {image.promptUsed && (
                              <p className="text-xs text-muted-foreground mt-1 truncate" title={image.promptUsed}>
                                {image.promptUsed}
                              </p>
                            )}
                            <div className="mt-3 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  if (image.processedUrl) {
                                    window.open(image.processedUrl, '_blank')
                                  } else {
                                    toast.error('Image URL not available')
                                  }
                                }}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  if (image.processedUrl) {
                                    const link = document.createElement('a')
                                    link.href = image.processedUrl
                                    link.download = image.name
                                    link.click()
                                  } else {
                                    toast.error('Image URL not available')
                                  }
                                }}
                              >
                                <Download className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
              Order {order.orderNumber || order.id} - Processing Summary
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Instructions:</p>
                  <p className="text-sm text-muted-foreground">{order.instructions}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Order Details:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Total Images: {order.imageCount}</li>
                    <li>• Processed: {order.processedCount}</li>
                    <li>• Approved: {order.approvedCount}</li>
                    {order.retouchCount > 0 && <li>• Needs Retouch: {order.retouchCount}</li>}
                    {order.failedCount > 0 && <li>• Failed: {order.failedCount}</li>}
                  </ul>
                </div>
                {order.processingTime > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Processing Time:</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(order.processingTime / 1000 / 60)}m {Math.floor((order.processingTime / 1000) % 60)}s
                    </p>
                  </div>
                )}
              </div>
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

