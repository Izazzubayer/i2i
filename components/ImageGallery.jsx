'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Edit, Eye, Loader2, Grid3x3, List, CheckSquare, Square, Download, Cloud } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import DamConnectDialog from '@/components/DamConnectDialog'
import { apiClient } from '@/lib/api'

// Type removed 'grid' | 'list'
// Type removed 'all' | 'approved' | 'needs-retouch' | 'completed' | 'processing'

export default function ImageGallery() {
  const { batch, approveImage, openRetouchDrawer, markForRetouch, addDamConnection, activeDamConnection } = useStore()
  const [hoveredImage, setHoveredImage] = useState(null)
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [viewMode, setViewMode] = useState('grid')
  const [filterMode, setFilterMode] = useState('all')
  const [damDialogOpensetDamDialogOpen] = useState(false)
  const [uploadingToDAMsetUploadingToDAM] = useState(false)

  // Filter images based on selected filter - must be before early return
  const filteredImages = useMemo(() => {
    if (!batch || batch.images.length === 0) return []
    if (filterMode === 'all') return batch.images
    return batch.images.filter(img => {
      if (filterMode === 'needs-retouch') return img.status === 'needs-retouch'
      return img.status === filterMode
    })
  }, [batch, filterMode])

  if (!batch || batch.images.length === 0) return null

  // Selection handlers
  const toggleImageSelection = (imageId) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)))
    }
  }

  const clearSelection = () => setSelectedImages(new Set())

  // Bulk actions
  const handleBulkApprove = () => {
    selectedImages.forEach(id => approveImage(id))
    toast.success(`${selectedImages.size} image(s) approved`)
    clearSelection()
  }

  const handleBulkRetouch = () => {
    selectedImages.forEach(id => markForRetouch(id))
    toast.success(`${selectedImages.size} image(s) marked for retouch`)
    clearSelection()
  }

  const handleBulkDownload = () => {
    toast.info('Downloading selected images...')
    // Implement bulk download logic
    clearSelection()
  }

  const handleConnectDam = () => {
    setDamDialogOpen(true)
  }

  const handleDamConnect = async (config) => {
    addDamConnection(config)
    toast.success(`Connected to ${config.provider}`, {
      description: 'Connection saved successfully',
    })

    // If images are selectedoffer to upload them immediately
    if (selectedImages.size > 0) {
      setTimeout(() => {
        handleUploadToDAM(config)
      }, 500)
    }
  }

  const handleUploadToDAM = async (damConfig) => {
    if (!batch) return

    const config = damConfig || activeDamConnection?.config
    if (!config) {
      toast.error('No DAM connection configured')
      setDamDialogOpen(true)
      return
    }

    if (selectedImages.size === 0) {
      toast.error('No images selected')
      return
    }

    setUploadingToDAM(true)
    const imageIds = Array.from(selectedImages)

    toast.loading(`Uploading ${imageIds.length} images to ${config.provider}...`, {
      id: 'dam-upload',
    })

    try {
      const response = await apiClient.uploadToDAM({
        imageIds,
        damConfig: config,
        batchId: batch.id,
      })

      toast.success('Upload complete!', {
        id: 'dam-upload',
        description: `${response.uploadedCount} images uploaded to ${response.damWorkspace}`,
      })

      clearSelection()
    } catch (error) {
      console.error('DAM upload failed:', error)
      toast.error('Upload failed', {
        id: 'dam-upload',
        description: 'Please check your connection and try again',
      })
    } finally {
      setUploadingToDAM(false)
    }
  }

  // Individual actions
  const handleApprove = (imageocessedImage) => {
    approveImage(image.id)
    toast.success('Image approved')
  }

  const handleRetouch = (imageocessedImage) => {
    openRetouchDrawer(image)
  }

  // Get counts for filters
  const getCounts = () => {
    return {
      all: batch.images.length,
      approved: batch.images.filter(img => img.status === 'approved').length,
      needsRetouch: batch.images.filter(img => img.status === 'needs-retouch').length,
      completed: batch.images.filter(img => img.status === 'completed').length,
      processing: batch.images.filter(img => img.status === 'processing').length,
    }
  }

  const counts = getCounts()

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="border-primary text-primary">Approved</Badge>
      case 'needs-retouch':
        return <Badge variant="secondary">Needs Retouch</Badge>
      case 'completed':
        return <Badge variant="secondary">Ready</Badge>
      case 'processing':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="container py-8 px-4 md:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header with title and stats */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Processed Images</h2>
            <p className="text-sm text-muted-foreground">
              Review and approve your processed images
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{batch.approvedCount} Approved</Badge>
            <Badge variant="outline">{batch.retouchCount} Needs Review</Badge>
          </div>
        </div>

        {/* Toolbar with filtersview modeand selection */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('all')}
              >
                All ({counts.all})
              </Button>
              <Button
                variant={filterMode === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('completed')}
              >
                Ready ({counts.completed})
              </Button>
              <Button
                variant={filterMode === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('approved')}
              >
                Approved ({counts.approved})
              </Button>
              <Button
                variant={filterMode === 'needs-retouch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('needs-retouch')}
              >
                Needs Retouch ({counts.needsRetouch})
              </Button>
              <Button
                variant={filterMode === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('processing')}
              >
                Processing ({counts.processing})
              </Button>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Selection toolbar (shows when images are selected) */}
          <AnimatePresence>
            {selectedImages.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4"
              >
                <span className="text-sm font-medium">
                  {selectedImages.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRetouch}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Mark for Retouch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={activeDamConnection ? () => handleUploadToDAM() : handleConnectDam}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Select all button */}
        {filteredImages.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="gap-2"
            >
              {selectedImages.size === filteredImages.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredImages.length} image(s)
            </span>
          </div>
        )}

        {/* Image grid or list */}
        <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredImage(image.id)}
                onHoverEnd={() => setHoveredImage(null)}
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                <Card className={`overflow-hidden transition-all hover:shadow-lg ${selectedImages.has(image.id) ? 'ring-2 ring-primary' : ''
                  } ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                  <div className={`relative bg-muted ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[4/3]'
                    }`}>
                    {/* Selection checkbox */}
                    <div className="absolute left-2 top-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleImageSelection(image.id)
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-white bg-black/50 backdrop-blur-sm transition-all hover:bg-black/70"
                      >
                        {selectedImages.has(image.id) ? (
                          <CheckSquare className="h-4 w-4 text-white" />
                        ) : (
                          <Square className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                    {image.processedUrl ? (
                      <>
                        <Image
                          src={image.processedUrl}
                          alt={image.originalName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw(max-width: 1200px) 50vw33vw"
                        />

                        {/* Hover Overlay */}
                        <AnimatePresence>
                          {hoveredImage === image.id && image.status !== 'processing' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 backdrop-blur-sm"
                            >
                              {image.status !== 'approved' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-12 w-12 rounded-full"
                                      onClick={() => handleApprove(image)}
                                    >
                                      <Check className="h-6 w-6" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Approve</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-12 w-12 rounded-full"
                                    onClick={() => handleRetouch(image)}
                                  >
                                    <Edit className="h-6 w-6" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Retouch</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-12 w-12 rounded-full"
                                     onClick={() => window.open(image.processedUrl, '_blank')}
                                  >
                                    <Eye className="h-6 w-6" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Full Size</p>
                                </TooltipContent>
                              </Tooltip>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute right-2 top-2">
                      {getStatusBadge(image.status)}
                    </div>
                  </div>

                  <div className={`p-4 ${viewMode === 'list' ? 'flex flex-1 items-center justify-between' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className="mb-1 truncate font-medium">
                        {image.originalName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Processed at {new Date(image.timestamp).toLocaleTimeString()}
                      </p>

                      {image.instruction && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="mt-2 truncate text-xs text-muted-foreground">
                              Instruction: {image.instruction}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{image.instruction}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {/* Quick actions for list view */}
                    {viewMode === 'list' && image.status !== 'processing' && (
                      <div className="flex items-center gap-2">
                        {image.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(image)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetouch(image)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Retouch
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* DAM Connection Dialog */}
      <DamConnectDialog
        open={damDialogOpen}
        onOpenChange={setDamDialogOpen}
        onConnect={handleDamConnect}
      />
    </motion.section>
  )
}

