'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { BeforeAfterSliderImproved } from '@/components/BeforeAfterSliderImproved'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import DamConnectDialog from '@/components/DamConnectDialog'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.orderId
  const { getOrder, addDamConnection, activeDamConnection } = useStore()
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [uploadingToDAM, setUploadingToDAM] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(null)

  const order = useMemo(() => {
    if (!orderId) return null
    return getOrder(orderId)
  }, [orderId, getOrder])

  // If order not found, show mock data for demo
  const displayOrder = useMemo(() => {
    if (order) return order
    
    // Mock order for demo
    return {
      id: orderId || 'ORD-2024-001',
      name: 'Product Catalog 2024',
      status: 'completed',
      createdAt: '2024-11-10T14:30:00',
      completedAt: '2024-11-10T15:45:00',
      instructions: 'Remove background, enhance colors, resize to 1920x1080',
      images: 16,
      processedCount: 16,
      approvedCount: 14,
      retouchCount: 2,
      failedCount: 0,
      images: 16,
      tokens: 320,
      size: '4.2 GB',
      imagesData: Array.from({ length: 16 }, (_, i) => ({
        id: `img-${i}`,
        originalName: `image-${i + 1}.jpg`,
        originalUrl: `https://picsum.photos/seed/original-${i}/800/600`,
        processedUrl: `https://picsum.photos/seed/processed-${i}/800/600`,
        status: i < 14 ? 'processed' : i < 16 ? 'amendment' : 'deleted',
        instruction: 'Remove background, enhance colors, resize to 1920x1080',
        versions: [
          {
            id: `v1-${i}`,
            processedUrl: `https://picsum.photos/seed/processed-${i}/800/600`,
            timestamp: new Date('2024-11-10T14:30:00'),
            isReprocess: false,
            isAmendment: false,
            prompt: 'Remove background, enhance colors, resize to 1920x1080',
          },
          ...(i % 3 === 0 ? [{
            id: `v2-${i}`,
            processedUrl: `https://picsum.photos/seed/reprocess-${i}/800/600`,
            timestamp: new Date('2024-11-10T14:35:00'),
            isReprocess: true,
            isAmendment: false,
            prompt: 'Increase saturation, add more contrast, sharpen edges',
          }] : []),
          ...(i >= 14 ? [{
            id: `v3-${i}`,
            processedUrl: `https://picsum.photos/seed/amendment-${i}/800/600`,
            timestamp: new Date('2024-11-10T14:40:00'),
            isReprocess: false,
            isAmendment: true,
            amendmentInstruction: 'Fix color balance, remove artifacts',
            prompt: 'Fix color balance, remove artifacts',
          }] : []),
        ],
      })),
    }
  }, [order, orderId])

  const getStatusBadge = (status) => {
    const icons = {
      completed: <CheckCircle2 className="h-3 w-3" />,
      processing: <Loader2 className="h-3 w-3 animate-spin" />,
      queued: <Clock className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
    }

    const label = status.charAt(0).toUpperCase() + status.slice(1)
    
    return (
      <Badge 
        variant="outline" 
        className="border-border bg-muted/50 text-foreground gap-1.5"
      >
        {icons[status] || <AlertCircle className="h-3 w-3" />}
        {label}
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleConnectDAM = () => {
    if (activeDamConnection) {
      handleUploadToDAM()
    } else {
      setDamDialogOpen(true)
    }
  }

  const handleDamConnect = async (config) => {
    addDamConnection(config)
    setDamDialogOpen(false)
    await handleUploadToDAM(config)
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

  const handleDownloadOrder = async () => {
    try {
      toast.loading(`Preparing download for ${displayOrder.name || displayOrder.id}...`)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const imagesToDownload = displayOrder.imagesData?.filter(img => 
        img.status !== 'deleted' && img.processedUrl
      ) || []

      if (imagesToDownload.length === 0) {
        toast.error('No images to download')
        return
      }

      toast.dismiss()
      toast.success(`Download started: ${imagesToDownload.length} image(s)`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download order')
    }
  }

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt)
    setCopiedPrompt(prompt)
    toast.success('Prompt copied to clipboard')
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  const currentImage = selectedImage ? displayOrder.imagesData?.find(img => img.id === selectedImage) : null
  const selectedVersion = currentImage?.versions?.find(v => v.id === selectedVersionId) || 
                         currentImage?.versions?.[0] || null

  // Group images by status
  const imagesByStatus = useMemo(() => {
    if (!displayOrder.imagesData) return { processed: [], amendment: [], deleted: [] }
    
    return {
      processed: displayOrder.imagesData.filter(img => img.status === 'processed'),
      amendment: displayOrder.imagesData.filter(img => img.status === 'amendment'),
      deleted: displayOrder.imagesData.filter(img => img.status === 'deleted'),
    }
  }, [displayOrder.imagesData])

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
                  <h1 className="text-2xl font-semibold">{displayOrder.name || displayOrder.id}</h1>
                  {getStatusBadge(displayOrder.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{displayOrder.id}</p>
              </div>
            </div>
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
                        {activeDamConnection ? 'Upload to DAM' : 'Connect DAM'}
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
                    <p className="text-sm font-semibold">{displayOrder.images || 0}</p>
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
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                    <p className="text-sm font-semibold">{displayOrder.tokens || 0}</p>
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
                          <p className="text-sm font-medium truncate mb-2">{image.originalName}</p>
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
                              <p className="text-sm font-medium truncate">{image.originalName}</p>
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
                    {/* Image Viewer */}
                    <div className="space-y-4">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border">
                        {selectedVersion && (
                          <BeforeAfterSliderImproved
                            beforeImage={currentImage.originalUrl}
                            afterImage={selectedVersion.processedUrl}
                          />
                        )}
                      </div>

                      {/* Version Selector */}
                      {currentImage.versions && currentImage.versions.length > 1 && (
                        <div className="space-y-3">
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
                                        <p className="text-sm font-medium truncate">{versionLabel}</p>
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

                    {/* Details Panel */}
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
                              <p className="text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>Download this image</span>
                  </div>
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
      <DamConnectDialog
        open={damDialogOpen}
        onOpenChange={setDamDialogOpen}
        onConnect={handleDamConnect}
      />
    </div>
  )
}
