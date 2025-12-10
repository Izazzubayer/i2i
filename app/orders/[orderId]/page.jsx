'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Sparkles,
  Cloud,
  X,
  ChevronRight,
  ChevronLeft,
  Layers,
  FileCode,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { getOrderDetails } from '@/api'
import DamConnectDialog from '@/components/DamConnectDialog'
import DamSelectionDialog from '@/components/DamSelectionDialog'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.orderId
  const { getOrder, addDamConnection, activeDamConnection, damConnections, setActiveDamConnection, removeDamConnection } = useStore()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [selectedTab, setSelectedTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [uploadingToDAM, setUploadingToDAM] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(null)
  const [selectedDams, setSelectedDams] = useState([]) // Track selected DAMs for this order
  const [showSummary, setShowSummary] = useState(false)
  const [imageSizes, setImageSizes] = useState({})

  // Fetch order details from API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return
      
      try {
        setLoading(true)
        setError(null)
        const orderData = await getOrderDetails(orderId)
        setOrder(orderData)
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

  // Use order from API and transform it - group by input (each input = one image with multiple versions)
  const displayOrder = useMemo(() => {
    if (!order) return null
    
    // Group versions by input
    const inputsMap = new Map()
    
    // Ensure inputs, versions, and images are arrays
    const inputs = Array.isArray(order.inputs) ? order.inputs : []
    const versions = Array.isArray(order.versions) ? order.versions : []
    const apiImages = Array.isArray(order.images) ? order.images : []
    
    // First, create entries for all inputs
    inputs.forEach((input, idx) => {
      // Extract filename from downloadUrl
      let originalName = `image-${idx + 1}.jpg`
      if (input.downloadUrl) {
        try {
          const url = new URL(input.downloadUrl)
          const pathParts = url.pathname.split('/')
          const filename = pathParts[pathParts.length - 1]
          if (filename && filename !== '') {
            originalName = filename.split('?')[0]
          }
        } catch (e) {
          // Use default if parsing fails
        }
      }
      
      const image = apiImages.find(img => img.orderInputId === input.orderInputId)
      
      inputsMap.set(input.orderInputId, {
        orderInputId: input.orderInputId,
        imageId: image?.imageId,
        originalName: originalName,
        originalUrl: input.downloadUrl || '',
        instruction: input.promptText || '',
        versions: [],
      })
    })
    
    // Add versions to their corresponding inputs
    versions.forEach((version) => {
      const input = inputsMap.get(version.orderInputId)
      if (input) {
        input.versions.push({
          id: version.versionId,
          versionId: version.versionId,
          processedUrl: version.downloadUrl || '',
          timestamp: new Date(version.createdAt || new Date()),
          isReprocess: (version.versionNumber || 1) > 1,
          prompt: version.promptUsed || input.instruction || '',
          versionNumber: version.versionNumber || 1,
          isActive: version.isActive,
          processingTimeMS: version.processingTimeMS,
          tokensUsed: version.tokensUsed,
          price: version.price,
        })
      }
    })
    
    // Transform to images array (one image per input)
    const images = Array.from(inputsMap.values()).map((input, index) => {
      const latestVersion = input.versions
        .filter(v => v.isActive && v.processedUrl)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || 
        input.versions
          .filter(v => v.processedUrl)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] ||
        input.versions[0]
      
      return {
        id: input.orderInputId || `img-${index}`,
        orderInputId: input.orderInputId,
        imageId: input.imageId,
        name: input.originalName,
        status: latestVersion?.isActive && latestVersion?.processedUrl ? 'approved' : 
                latestVersion?.processedUrl ? 'needs-retouch' : 'failed',
        size: 'N/A',
        processedUrl: latestVersion?.processedUrl || '',
        inputUrl: input.originalUrl,
        versionNumber: latestVersion?.versionNumber,
        promptUsed: latestVersion?.prompt,
        processingTimeMS: latestVersion?.processingTimeMS,
        tokensUsed: latestVersion?.tokensUsed,
        price: latestVersion?.price,
        versions: input.versions.map(v => ({
          id: v.id,
          versionId: v.versionId,
          processedUrl: v.processedUrl,
          timestamp: v.timestamp,
          isReprocess: v.isReprocess,
          prompt: v.prompt,
          versionNumber: v.versionNumber,
          isActive: v.isActive,
        })),
        selectedVersionId: latestVersion?.id || input.versions[0]?.id,
      }
    })
    
    // Transform API response to match UI structure
    const transformedOrder = {
      id: order.orderId,
      orderId: order.orderId,
      orderNumber: order.orderName || order.orderId,
      name: order.orderName || `Order ${order.orderId.substring(0, 8)}`,
      status: order.status, // Keep UUID status
      statusLookupId: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      expireAt: order.expireAt,
      // Calculate stats
      imageCount: inputs.length || 0,
      processedCount: images.filter(img => img.status === 'approved' || img.processedUrl).length,
      approvedCount: images.filter(img => img.status === 'approved').length,
      retouchCount: images.filter(img => img.status === 'needs-retouch').length,
      failedCount: images.filter(img => img.status === 'failed').length,
      // Get instructions from first input
      instructions: inputs[0]?.promptText || 'No instructions provided',
      // Calculate processing time
      processingTime: Array.isArray(versions) ? versions.reduce((sum, v) => sum + (v.processingTimeMS || 0), 0) : 0,
      // Images grouped by input
      images: images,
      // Full API data for reference
      _apiData: order,
    }
    
    return transformedOrder
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.orderId, order?.orderInputs, order?.orderVersions])

  // Helper to check if order is completed (for UUID statuses)
  const isOrderCompleted = useMemo(() => {
    if (!displayOrder) return false
    // Check if order has been updated significantly after creation
    if (displayOrder.updatedAt && displayOrder.createdAt) {
      const created = new Date(displayOrder.createdAt)
      const updated = new Date(displayOrder.updatedAt)
      const diffMinutes = (updated - created) / (1000 * 60)
      // If updated more than 5 minutes after creation and has processed images, likely completed
      if (diffMinutes > 5 && displayOrder.processedCount > 0) {
        return true
      }
    }
    // Also check if all inputs have processed versions
    if (displayOrder.images && displayOrder.images.length > 0) {
      const allProcessed = displayOrder.images.every(img => img.status === 'approved' || img.processedUrl)
      return allProcessed
    }
    return false
  }, [displayOrder])

  // Group images by status - must be before early returns
  const imagesByStatus = useMemo(() => {
    if (!displayOrder?.images) return { processed: [], amendment: [], deleted: [] }
    
    return {
      processed: displayOrder.images.filter(img => img.status === 'processed' || img.status === 'approved'),
      amendment: displayOrder.images.filter(img => img.status === 'amendment' || img.status === 'needs-retouch'),
      deleted: displayOrder.images.filter(img => img.status === 'deleted'),
    }
  }, [displayOrder?.images])

  // Fetch image sizes - must be before early returns
  useEffect(() => {
    if (!displayOrder?.images) return
    
    const fetchSizes = async () => {
      const sizes = {}
      for (const image of displayOrder.images) {
        try {
          if (image.inputUrl) {
            const response = await fetch(image.inputUrl, { method: 'HEAD', mode: 'cors' })
            const contentLength = response.headers.get('content-length')
            if (contentLength) {
              sizes[image.id] = parseInt(contentLength, 10)
            }
          }
        } catch (e) {
          // Ignore errors, will show N/A
        }
      }
      setImageSizes(sizes)
    }
    
    fetchSizes()
  }, [displayOrder?.images])

  const getStatusBadge = (status, orderData = null) => {
    const icons = {
      completed: <CheckCircle2 className="h-3 w-3" />,
      processing: <Loader2 className="h-3 w-3 animate-spin" />,
      queued: <Clock className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
    }

    // Normalize status (handle UUIDs)
    let normalizedStatus = status
    if (status && status.length > 20 && status.includes('-')) {
      // It's a UUID - try to determine status from order data
      if (orderData?.updatedAt && orderData?.createdAt) {
        const created = new Date(orderData.createdAt)
        const updated = new Date(orderData.updatedAt)
        const diffMinutes = (updated - created) / (1000 * 60)
        // If updated more than 5 minutes after creation, likely completed
        if (diffMinutes > 5) {
          normalizedStatus = 'completed'
        } else {
          normalizedStatus = 'processing'
        }
      } else {
        normalizedStatus = 'processing' // Default for UUIDs
      }
    } else if (status) {
      normalizedStatus = status.toLowerCase()
    } else {
      normalizedStatus = 'pending'
    }

    const statusMap = {
      completed: { label: 'Completed', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
      processing: { label: 'Processing', tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300' },
      pending: { label: 'Pending', tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
      queued: { label: 'Queued', tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
      failed: { label: 'Failed', tone: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    }
    
    const statusInfo = statusMap[normalizedStatus] || { 
      label: 'Processing', 
      tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300' 
    }
    
    return (
      <Badge 
        variant="outline" 
        className={`border ${statusInfo.tone} gap-1.5`}
      >
        {icons[normalizedStatus] || <AlertCircle className="h-3 w-3" />}
        {statusInfo.label}
      </Badge>
    )
  }

  const getImageStatusBadge = (status) => {
    const icons = {
      processed: <CheckCircle2 className="h-3 w-3" />,
      amendment: <FileText className="h-3 w-3" />,
      deleted: <XCircle className="h-3 w-3" />,
    }

    const label = status.charAt(0).toUpperCase() + status.slice(1)
    
    return (
      <Badge 
        variant="outline" 
        className="border-border bg-muted/50 text-foreground gap-1.5 text-xs"
      >
        {icons[status] || <AlertCircle className="h-3 w-3" />}
        {label}
      </Badge>
    )
  }

  const filteredImages = displayOrder?.images?.filter(img => {
    if (selectedTab === 'all') return true
    return img.status === selectedTab
  }) || []

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const handleConnectDAM = () => {
    setDamDialogOpen(true)
  }

  const handleSelectDam = (connection) => {
    // Handle both single connection and array of connections
    const connections = Array.isArray(connection) ? connection : [connection]
    
    setActiveDamConnection(connections[0]) // Set first as active
    setSelectedDams(connections) // Store selected DAMs
    setDamDialogOpen(false)
    
    // Automatically upload to the first selected DAM
    if (connections.length > 0) {
      handleUploadToDAM(connections[0].config)
    }
  }

  const handleAddDam = (connection) => {
    addDamConnection(connection.config || connection)
  }

  const handleRemoveDam = (connectionId) => {
    removeDamConnection(connectionId)
    setSelectedDams(prev => prev.filter(dam => dam.id !== connectionId))
  }


  const handleUploadToDAM = async (damConfig = null) => {
    const config = damConfig || activeDamConnection?.config
    if (!config) {
      toast.error('No DAM connection configured')
      setDamDialogOpen(true)
      return
    }

    if (!displayOrder.imagesData || displayOrder.imagesData.length === 0) {
      toast.error('No images to upload')
      return
    }

    const processedImages = displayOrder.imagesData.filter(img => 
      img.status !== 'deleted' && img.processedUrl
    )

    if (processedImages.length === 0) {
      toast.error('No processed images to upload')
      return
    }

    setUploadingToDAM(true)
    try {
      toast.loading(`Uploading ${processedImages.length} images to DAM...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.dismiss()
      toast.success(`Successfully uploaded ${processedImages.length} images to ${activeDamConnection?.name || 'DAM'}`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to upload images to DAM')
    } finally {
      setUploadingToDAM(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
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
        <Navbar />
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

  const handleDownloadOrder = async () => {
    try {
      if (!displayOrder) return
      
      const imagesToDownload = displayOrder.images?.filter(img => 
        img.status !== 'deleted' && img.processedUrl
      ) || []

      if (imagesToDownload.length === 0) {
        toast.error('No images to download')
        return
      }

      toast.loading(`Downloading ${imagesToDownload.length} image(s)...`, { id: 'download-order' })
      
      // Download each image
      for (let i = 0; i < imagesToDownload.length; i++) {
        const img = imagesToDownload[i]
        try {
          // Use processedUrl if available, otherwise use inputUrl
          const imageUrl = img.processedUrl || img.inputUrl
          
          if (!imageUrl) {
            console.warn(`Skipping image ${i + 1}: No URL available`)
            continue
          }
          
          const response = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit',
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = img.name || `image-${i + 1}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          // Small delay between downloads to avoid browser blocking
          if (i < imagesToDownload.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (err) {
          console.error(`Error downloading image ${i + 1}:`, err)
          toast.error(`Failed to download image ${i + 1}: ${err.message || 'Unknown error'}`)
        }
      }

      toast.dismiss('download-order')
      toast.success(`Downloaded ${imagesToDownload.length} image(s)`)
    } catch (error) {
      console.error('Error downloading order:', error)
      toast.dismiss('download-order')
      toast.error('Failed to download order')
    }
  }
  
  const handleDownloadImage = async (image) => {
    try {
      // Use processedUrl if available, otherwise use inputUrl (original)
      const imageUrl = image.processedUrl || image.inputUrl
      
      if (!imageUrl) {
        toast.error('No image URL available')
        return
      }
      
      toast.loading('Downloading image...', { id: 'download-image' })
      
      // Fetch the image with CORS mode
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = image.name || `image-${image.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss('download-image')
      toast.success('Image downloaded')
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.dismiss('download-image')
      toast.error(`Failed to download image: ${error.message || 'Unknown error'}`)
    }
  }

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt)
    setCopiedPrompt(prompt)
    toast.success('Prompt copied to clipboard')
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Helper function to get file type from filename or URL
  const getFileType = (filename, url) => {
    if (filename) {
      const ext = filename.split('.').pop()?.toUpperCase()
      if (ext) return ext
    }
    if (url) {
      const pathname = url.split('?')[0]
      const ext = pathname.split('.').pop()?.toUpperCase()
      if (ext) return ext
    }
    return 'N/A'
  }

  const currentImage = selectedImage ? displayOrder?.images?.find(img => img.id === selectedImage) : null
  const selectedVersion = currentImage?.versions?.find(v => v.id === selectedVersionId) || 
                         currentImage?.versions?.[0] || null

  if (!displayOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order youre looking for doesnt exist.</p>
          <Button onClick={() => router.push('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/orders')}
                className="border-border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">{displayOrder.name || displayOrder.id || displayOrder.orderNumber}</h1>
                  {getStatusBadge(displayOrder.status, displayOrder)}
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{displayOrder.id}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {displayOrder.status === 'completed' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleConnectDAM}
                      disabled={uploadingToDAM}
                      className="border-border"
                    >
                      {uploadingToDAM ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Cloud className="mr-2 h-4 w-4" />
                          Connect to DAM
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownloadOrder}>
                      <Download className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </>
                )}
              </div>
              
              {/* Display selected connected DAMs with status */}
              {selectedDams.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Connected DAMs:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDams.map((dam) => {
                      const isActive = activeDamConnection?.id === dam.id
                      const uploadStatus = uploadingToDAM && isActive ? 'uploading' : isActive ? 'active' : 'connected'
                      
                      return (
                        <Badge
                          key={dam.id}
                          variant="outline"
                          className={`${
                            uploadStatus === 'uploading'
                              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
                              : uploadStatus === 'active'
                              ? 'border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                              : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                          }`}
                        >
                          {uploadStatus === 'uploading' ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              <span className="text-blue-700 dark:text-blue-400">Uploading to {dam.provider || dam.name}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              <span className={uploadStatus === 'active' ? 'text-green-700 dark:text-green-400 font-medium' : 'text-green-600 dark:text-green-500'}>
                                {dam.provider || dam.name}
                                {uploadStatus === 'active' && ' (Active)'}
                              </span>
                            </>
                          )}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Images</p>
                    <p className="text-sm font-semibold">{displayOrder.imageCount || displayOrder.images?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Processed</p>
                    <p className="text-sm font-semibold">{displayOrder.processedCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Amendments</p>
                    <p className="text-sm font-semibold">{displayOrder.retouchCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-semibold">{formatDate(displayOrder.createdAt)}</p>
                  </div>
                </div>
                {displayOrder.completedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-sm font-semibold">{formatDate(displayOrder.completedAt)}</p>
                    </div>
                  </div>
                )}
                {displayOrder.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-semibold">{formatDate(displayOrder.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {displayOrder.instructions && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Processing Instructions:</p>
                  <p className="text-sm">{displayOrder.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Images Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">All Images</CardTitle>
                  <CardDescription className="text-sm">
                    View all processed images with their versions, prompts, and instructions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="border-border"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="border-border"
                  >
                    List
                  </Button>
                </div>
              </div>
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
                            <p className="text-sm font-medium truncate">
                              {image.name && image.name.length > 20 
                                ? image.name.substring(0, 20) + '...'
                                : image.name}
                            </p>
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
                                onClick={() => handleDownloadImage(image)}
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

              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayOrder.imagesData?.map((image) => (
                    <motion.div
                      key={image.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Card 
                        className="overflow-hidden border-border cursor-pointer hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedImage(image.id)
                          setSelectedVersionId(image.versions?.[0]?.id || null)
                        }}
                      >
                        <div className="relative aspect-[4/3] bg-muted">
                          <Image
                            src={image.processedUrl || image.originalUrl}
                            alt={image.originalName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute top-2 right-2">
                            {getImageStatusBadge(image.status)}
                          </div>
                          {image.versions && image.versions.length > 1 && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="outline" className="border-border bg-background/80 gap-1.5">
                                <Layers className="h-3 w-3" />
                                {image.versions.length}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium truncate mb-2">
                            {image.originalName && image.originalName.length > 20 
                              ? image.originalName.substring(0, 20) + '...'
                              : image.originalName}
                          </p>
                          {image.instruction && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {image.instruction}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayOrder.imagesData?.map((image) => (
                    <Card 
                      key={image.id}
                      className="border-border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedImage(image.id)
                        setSelectedVersionId(image.versions?.[0]?.id || null)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={image.processedUrl || image.originalUrl}
                              alt={image.originalName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-medium truncate">
                                {image.originalName && image.originalName.length > 20 
                                  ? image.originalName.substring(0, 20) + '...'
                                  : image.originalName}
                              </p>
                              {getImageStatusBadge(image.status)}
                            </div>
                            {image.instruction && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {image.instruction}
                              </p>
                            )}
                            {image.versions && image.versions.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Layers className="h-3 w-3" />
                                <span>{image.versions.length} version(s)</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {currentImage && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg mb-1">{currentImage.originalName}</DialogTitle>
                    <DialogDescription className="text-sm">
                      {getImageStatusBadge(currentImage.status)}
                      {currentImage.versions && currentImage.versions.length > 0 && (
                        <span className="ml-2 text-muted-foreground">
                          • {currentImage.versions.length} version(s)
                        </span>
                      )}
                    </DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column: Image Viewer */}
                    <div className="flex gap-4 h-full">
                      {/* All Images List - Narrow Vertical Strip */}
                      <div className="flex flex-col w-9 flex-shrink-0">
                        <h3 className="text-[10px] font-medium mb-2 text-center">All Images</h3>
                        <ScrollArea className="flex-1 h-full">
                          <div className="space-y-2">
                            {displayOrder?.images?.map((image) => {
                              const truncatedName = image.name 
                                ? (image.name.length > 20 ? image.name.substring(0, 20) + '...' : image.name)
                                : `Image ${image.id?.substring(0, 8) || ''}`
                              
                              return (
                                <div
                                  key={image.id}
                                  className="group relative cursor-pointer"
                                  onClick={() => {
                                    setSelectedImage(image.id)
                                    setSelectedVersionId(image.versions?.[0]?.id || null)
                                  }}
                                >
                                  {/* Thumbnail */}
                                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-foreground/50 transition-colors mb-1">
                                    {image.inputUrl ? (
                                      <Image
                                        src={image.inputUrl}
                                        alt={image.name}
                                        fill
                                        className="object-cover"
                                        sizes="36px"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Truncated Filename */}
                                  <p className="text-[9px] text-muted-foreground truncate text-center leading-tight" title={image.name}>
                                    {truncatedName}
                                  </p>
                                  
                                  {/* Hover Preview */}
                                  <div className="absolute left-full ml-3 top-0 z-50 hidden group-hover:block pointer-events-none">
                                    <div className="relative w-64 h-64 rounded-lg overflow-hidden bg-background border-2 border-border shadow-xl">
                                      {image.inputUrl ? (
                                        <Image
                                          src={image.inputUrl}
                                          alt={image.name}
                                          fill
                                          className="object-contain"
                                          sizes="256px"
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full">
                                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Processed Image */}
                      <div className="flex flex-col flex-1">
                        <h3 className="text-sm font-medium mb-3">Processed</h3>
                        <div className="relative flex-1 rounded-lg overflow-hidden bg-muted border border-border min-h-[400px]">
                          {selectedVersion?.processedUrl ? (
                            <Image
                              src={selectedVersion.processedUrl}
                              alt={currentImage.name || 'Processed image'}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : currentImage?.processedUrl ? (
                            <Image
                              src={currentImage.processedUrl}
                              alt={currentImage.name || 'Processed image'}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No processed image available</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Version Selector */}
                        {currentImage.versions && currentImage.versions.length > 1 && (
                          <div className="space-y-3 mt-4">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">Select Version:</p>
                            </div>
                            <ScrollArea className="h-32">
                              <div className="space-y-2">
                                {currentImage.versions.map((version, idx) => {
                                  const isSelected = selectedVersionId === version.id
                                  const versionLabel = version.isAmendment 
                                    ? `Amendment ${currentImage.versions.filter(v => v.isAmendment).indexOf(version) + 1}`
                                    : version.isReprocess
                                    ? `Reprocess ${currentImage.versions.filter(v => v.isReprocess && !v.isAmendment).indexOf(version) + 1}`
                                    : 'Original Processed'
                                  
                                  return (
                                    <button
                                      key={version.id}
                                      onClick={() => setSelectedVersionId(version.id)}
                                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                                        isSelected
                                          ? 'border-foreground bg-muted'
                                          : 'border-border hover:bg-muted/50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {versionLabel && versionLabel.length > 20 
                                              ? versionLabel.substring(0, 20) + '...'
                                              : versionLabel}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(version.timestamp)}
                                          </p>
                                        </div>
                                        {isSelected && (
                                          <CheckCircle2 className="h-4 w-4 text-foreground flex-shrink-0 ml-2" />
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Details Panel */}
                    <div className="space-y-4">
                      {/* Instructions */}
                      {currentImage.instruction && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Original Instructions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{currentImage.instruction}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Selected Version Prompt */}
                      {selectedVersion && selectedVersion.prompt && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <FileCode className="h-4 w-4" />
                                {selectedVersion.isAmendment ? 'Amendment Instructions' : 
                                 selectedVersion.isReprocess ? 'Reprocess Instructions' : 
                                 'Processing Prompt'}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPrompt(selectedVersion.prompt)}
                                className="h-7 w-7 p-0"
                              >
                                {copiedPrompt === selectedVersion.prompt ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-32">
                              <p className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                                {selectedVersion.prompt}
                              </p>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}

                      {/* Version History */}
                      {currentImage.versions && currentImage.versions.length > 0 && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Version History
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-48">
                              <div className="space-y-3">
                                {currentImage.versions.map((version, idx) => (
                                  <div
                                    key={version.id}
                                    className={`p-3 rounded-lg border ${
                                      selectedVersionId === version.id
                                        ? 'border-foreground bg-muted'
                                        : 'border-border'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {version.isAmendment ? (
                                          <Badge variant="outline" className="text-xs border-border">
                                            Amendment
                                          </Badge>
                                        ) : version.isReprocess ? (
                                          <Badge variant="outline" className="text-xs border-border">
                                            Reprocess
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-xs border-border">
                                            Original
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(version.timestamp)}
                                      </p>
                                    </div>
                                    {version.prompt && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                        {version.prompt}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => currentImage && handleDownloadImage(currentImage)}
                    className="flex items-center gap-2 text-sm"
                    disabled={!currentImage?.processedUrl}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download this image</span>
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedVersion) {
                          const index = currentImage.versions.findIndex(v => v.id === selectedVersionId)
                          const prevIndex = index > 0 ? index - 1 : currentImage.versions.length - 1
                          setSelectedVersionId(currentImage.versions[prevIndex].id)
                        }
                      }}
                      disabled={!currentImage.versions || currentImage.versions.length <= 1}
                      className="border-border"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedVersion) {
                          const index = currentImage.versions.findIndex(v => v.id === selectedVersionId)
                          const nextIndex = index < currentImage.versions.length - 1 ? index + 1 : 0
                          setSelectedVersionId(currentImage.versions[nextIndex].id)
                        }
                      }}
                      disabled={!currentImage.versions || currentImage.versions.length <= 1}
                      className="border-border"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DAM Connect Dialog */}
      {/* DAM Selection Dialog */}
      <DamSelectionDialog
        open={damDialogOpen}
        onOpenChange={(open) => {
          setDamDialogOpen(open)
        }}
        damConnections={damConnections || []}
        activeDamConnection={activeDamConnection}
        onSelectDam={handleSelectDam}
        onAddDam={handleAddDam}
        onRemoveDam={handleRemoveDam}
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
  

    </div>

  )
}
