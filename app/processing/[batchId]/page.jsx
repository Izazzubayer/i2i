'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import {
  ArrowLeft,
  Download,
  Trash2,
  CheckCircle,
  Edit3,
  Send,
  X,
  Loader2,
  Image as ImageIcon,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import Image from 'next/image'

export default function ProcessingPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId

  const { batchupdateImageStatusapproveImageaddLog } = useStore()

  // Stage 3: cessing Stage
  const [selectedImagessetSelectedImages] = useState>(new Set())
  const [isProcessingsetIsProcessing] = useState(false)

  // Stage 4: cessing Feedback
  const [estimatedTimeRemainingsetEstimatedTimeRemaining] = useState(0)
  const [canCancelsetCanCancel] = useState(true)

  // Stage 5: ult Stage
  const [selectedImageForViewsetSelectedImageForView] = useState(null)
  const [beforeAfterSlidersetBeforeAfterSlider] = useState(50)
  const [retouchModalOpensetRetouchModalOpen] = useState(false)
  const [retouchImageIdsetRetouchImageId] = useState(null)
  const [retouchInstructionsetRetouchInstruction] = useState('')
  const [isRetouching, setIsRetouching] = useState(false)

  // Stage 6: Review Stage (Activity Log)
  const [activityLog, setActivityLog] = useState([])

  // Stage 7: roval Stage
  const [approveModalOpensetApproveModalOpen] = useState(false)
  const [imagesToApprovesetImagesToApprove] = useState([])

  // Stage 8: ort Stage
  const [exportModalOpensetExportModalOpen] = useState(false)
  const [exportFormatsetExportFormat] = useState('jpg')
  const [exportQualitysetExportQuality] = useState(90)
  const [isExportingsetIsExporting] = useState(false)
  const [exportProgresssetExportProgress] = useState(0)
  const [damModalOpensetDamModalOpen] = useState(false)
  const [isDamSendingsetIsDamSending] = useState(false)

  // Stage 9: pletion Stage
  const [showCompletionBannersetShowCompletionBanner] = useState(false)
  const [allApprovedsetAllApproved] = useState(false)

  // Delete functionality
  const [deleteModalOpensetDeleteModalOpen] = useState(false)
  const [imagesToDeletesetImagesToDelete] = useState([])

  // Check if batch exists
  useEffect(() => {
    if (!batch || batch.id !== batchId) {
      toast.error('Batch not found')
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, router])

  // Monitor completion
  useEffect(() => {
    if (batch && batch.status === 'completed') {
      const approved = batch.images.every(img => img.status === 'approved')
      setAllApproved(approved)
      if (approved && !showCompletionBanner) {
        setShowCompletionBanner(true)
        addActivityLog('approve', 'All images approved', 'Batch completed successfully')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch?.status, batch?.images, showCompletionBanner])

  // Calculate estimated time
  useEffect(() => {
    if (batch && batch.status === 'processing') {
      const remaining = batch.totalImages - batch.processedCount
      const avgTimePerImage = 2.5 // seconds
      setEstimatedTimeRemaining(remaining * avgTimePerImage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch?.status, batch?.totalImages, batch?.processedCount])

  // Add activity log entry
  const addActivityLog = (
    type,
    action,
    description
  ) => {
    const entrytivityLogEntry = {
      id: `log-${Date.now()}`,
      action,
      description,
      timestamp: new Date(),
      type,
      user: 'Current User'
    }
    setActivityLog(prev => [entry, ...prev])
  }

  // Stage 3: cel Processing
  const handleCancelProcessing = () => {
    if (batch && batch.status === 'processing') {
      toast.info('Processing cancelled')
      addActivityLog('process', 'Processing Cancelled', 'User cancelled the batch processing')
      setIsProcessing(false)
      setCanCancel(false)
    }
  }

  // Stage 5: View Image (Before/After)
  const handleViewImage = (imageId) => {
    setSelectedImageForView(imageId)
    setBeforeAfterSlider(50)
  }

  // Stage 5: Open Retouch Modal
  const handleOpenRetouch = (imageId) => {
    setRetouchImageId(imageId)
    setRetouchInstruction('')
    setRetouchModalOpen(true)
  }

  // Stage 5: ly Retouch
  const handleApplyRetouch = async () => {
    if (!retouchImageId || !retouchInstruction.trim()) {
      toast.error('Please enter retouch instructions')
      return
    }

    setIsRetouching(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      updateImageStatus(retouchImageId, 'completed', undefined)
      toast.success('Retouch applied successfully')
      addActivityLog('retouch', 'Image Retouched', `Applied retouch: \"${retouchInstruction.substring(0, 50)}...\"`)

      setRetouchModalOpen(false)
      setRetouchInstruction('')
      setRetouchImageId(null)
    } catch (error) {
      toast.error('Failed to apply retouch')
    } finally {
      setIsRetouching(false)
    }
  }

  // Stage 7: Open Approve Modal
  const handleOpenApproveModal = (imageIds) => {
    setImagesToApprove(imageIds)
    setApproveModalOpen(true)
  }

  // Stage 7: firm Approval
  const handleConfirmApproval = () => {
    imagesToApprove.forEach(imageId => {
      approveImage(imageId)
    })
    toast.success(`${imagesToApprove.length} image(s) approved`)
    addActivityLog('approve', 'Images Approved', `Approved ${imagesToApprove.length} image(s)`)
    setApproveModalOpen(false)
    setImagesToApprove([])
  }

  // Stage 5: Open Delete Modal
  const handleOpenDeleteModal = (imageIds) => {
    setImagesToDelete(imageIds)
    setDeleteModalOpen(true)
  }

  // Stage 5: firm Delete
  const handleConfirmDelete = () => {
    // In a real appyou'd call API to delete
    toast.success(`${imagesToDelete.length} image(s) deleted`)
    addActivityLog('delete', 'Images Deleted', `Deleted ${imagesToDelete.length} image(s)`)
    setDeleteModalOpen(false)
    setImagesToDelete([])
  }

  // Stage 8: nload with Format Selection
  const handleDownloadImages = async () => {
    if (!batch) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      const selectedImagesList = Array.from(selectedImages).length > 0
        ? batch.images.filter(img => selectedImages.has(img.id))
        : batch.images

      // Simulate download with progress
      for (let i = 0; i < selectedImagesList.length; i++) {
        await new Promise(resolve => setTimeout(resolve100))
        setExportProgress(((i + 1) / selectedImagesList.length) * 100)
      }

      toast.success(`Downloaded ${selectedImagesList.length} image(s) as ${exportFormat.toUpperCase()}`)
      addActivityLog('export', 'Images Downloaded', `Downloaded ${selectedImagesList.length} images in ${exportFormat} format`)
      setExportModalOpen(false)
    } catch (error) {
      toast.error('Download failed')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  // Stage 8: d to DAM
  const handleSendToDAM = async () => {
    if (!batch) return

    setIsDamSending(true)
    try {
      await new Promise(resolve => setTimeout(resolve2000))

      const count = selectedImages.size > 0 ? selectedImages.size : batch.images.length
      toast.success(`Successfully sent ${count} image(s) to DAM`)
      addActivityLog('export', 'Sent to DAM', `Transferred ${count} images to DAM system`)
      setDamModalOpen(false)

      // Show link to DAM (mock)
      toast.info('View in DAM', {
        description: 'Click to open in your DAM system',
        action: {
          label: 'Open DAM',
          onClick: () => window.open('https://dam.example.com', '_blank')
        }
      })
    } catch (error) {
      toast.error('Failed to send to DAM')
    } finally {
      setIsDamSending(false)
    }
  }

  // Stage 9: rt New Project
  const handleStartNewProject = () => {
    router.push('/')
    toast.success('Ready to start a new project!')
  }

  if (!batch) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return <ImageIcon className="h-4 w-4" />
      case 'process': return <Loader2 className="h-4 w-4" />
      case 'retouch': return <Edit3 className="h-4 w-4" />
      case 'approve': return <CheckCircle2 className="h-4 w-4" />
      case 'delete': return <XCircle className="h-4 w-4" />
      case 'export': return <Download className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'upload': return 'text-blue-600'
      case 'process': return 'text-purple-600'
      case 'retouch': return 'text-orange-600'
      case 'approve': return 'text-green-600'
      case 'delete': return 'text-red-600'
      case 'export': return 'text-indigo-600'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Stage 9: pletion Banner */}
      <AnimatePresence>
        {showCompletionBanner && allApproved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">All images processed successfully!</h3>
                  <p className="text-sm opacity-90">Your batch is complete and ready for export.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setExportModalOpen(true)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompletionBanner(false)}
                  className="text-white hover:bg-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Batch Processing</h1>
                <p className="text-sm text-muted-foreground">
                  Batch ID: {batchId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={batch.status === 'completed' ? 'default' : 'secondary'}>
                {batch.status}
              </Badge>
              <Badge variant="outline">
                {batch.processedCount} / {batch.totalImages} processed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Stage 4: cessing Feedback */}
            {batch.status === 'processing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Processing {batch.progress}%</h3>
                          <p className="text-sm text-muted-foreground">
                            {estimatedTimeRemaining > 0 && (
                              <>Almost there! ~{Math.ceil(estimatedTimeRemaining)}s remaining</>
                            )}
                          </p>
                        </div>
                      </div>
                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelProcessing}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <Progress value={batch.progress} className="h-2" />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Stage 5: ion Panel */}
            {batch.status === 'completed' && (
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => {
                      const selected = Array.from(selectedImages)
                      if (selected.length > 0) {
                        handleOpenApproveModal(selected)
                      } else {
                        toast.info('Please select images to approve')
                      }
                    }}
                    disabled={selectedImages.size === 0}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Selected
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setExportModalOpen(true)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setDamModalOpen(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to DAM
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const selected = Array.from(selectedImages)
                      if (selected.length > 0) {
                        handleOpenDeleteModal(selected)
                      } else {
                        toast.info('Please select images to delete')
                      }
                    }}
                    disabled={selectedImages.size === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>

                  <div className="ml-auto text-sm text-muted-foreground">
                    {selectedImages.size > 0 ? `${selectedImages.size} selected` : 'No selection'}
                  </div>
                </div>
              </Card>
            )}

            {/* Stage 3 & 5age Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batch.images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative aspect-[4/3] bg-muted">
                      {image.processedUrl ? (
                        <Image
                          src={image.processedUrl}
                          alt={image.originalName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {/* Selection Checkbox */}
                      {batch.status === 'completed' && (
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedImages)
                              if (e.target.checked) {
                                newSelected.add(image.id)
                              } else {
                                newSelected.delete(image.id)
                              }
                              setSelectedImages(newSelected)
                            }}
                            className="h-5 w-5 rounded border-2 border-white shadow-lg"
                          />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge variant={image.status === 'approved' ? 'default' : 'secondary'}>
                          {image.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 truncate font-medium text-sm">{image.originalName}</h3>

                      <div className="flex flex-wrap gap-2">
                        {image.processedUrl && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewImage(image.id)}
                            >
                              Compare
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenRetouch(image.id)}
                            >
                              <Edit3 className="mr-1 h-3 w-3" />
                              Retouch
                            </Button>
                            {image.status !== 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenApproveModal([image.id])}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebarage 6tivity Log */}
          <div>
            <Card className="sticky top-24">
              <div className="border-b p-4">
                <h3 className="font-semibold">Activity Log</h3>
                <p className="text-sm text-muted-foreground">
                  Chronological history
                </p>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-3">
                  {activityLog.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No activity yet
                    </div>
                  ) : (
                    activityLog.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-l-2 border-muted pl-3 pb-3 relative"
                      >
                        <div className={`absolute -left-2 top-0 rounded-full bg-background p-1 ${getActivityColor(entry.type)}`}>
                          {getActivityIcon(entry.type)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{entry.action}</span>
                            <span className="text-xs text-muted-foreground">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{entry.description}</p>
                          {entry.user && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {entry.user}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>

      {/* Stage 5: ore/After Comparison Modal */}
      <Dialog open={selectedImageForView !== null} onOpenChange={() => setSelectedImageForView(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before / After Comparison</DialogTitle>
            <DialogDescription>
              Drag the slider to compare the original and processed images
            </DialogDescription>
          </DialogHeader>

          {selectedImageForView && (() => {
            const image = batch.images.find(img => img.id === selectedImageForView)
            if (!image) return null

            return (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {/* Before Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={image.originalUrl}
                      alt="Before"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* After Image with Clip Path */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: `inset(0 ${100 - beforeAfterSlider}% 0 0)`
                    }}
                  >
                    <Image
                      src={image.processedUrl}
                      alt="After"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${beforeAfterSlider}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                      <div className="flex gap-1">
                        <div className="w-1 h-4 bg-gray-400 rounded"></div>
                        <div className="w-1 h-4 bg-gray-400 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                    After
                  </div>
                </div>

                <Slider
                  value={[beforeAfterSlider]}
                  onValueChange={(value) => setBeforeAfterSlider(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Original</span>
                  <span>Processed</span>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Stage 5: ouch Modal */}
      <Dialog open={retouchModalOpen} onOpenChange={setRetouchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retouch Image</DialogTitle>
            <DialogDescription>
              Describe the changes you want to apply to this image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="e.g.Brighten the imageremove shadowsadjust colors..."
              value={retouchInstruction}
              onChange={(e) => setRetouchInstruction(e.target.value)}
              rows={4}
            />

            <div className="text-xs text-muted-foreground">
              {retouchInstruction.length} characters
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRetouchModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyRetouch}
              disabled={isRetouching || !retouchInstruction.trim()}
            >
              {isRetouching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply Retouch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage 7: roval Confirmation Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {imagesToApprove.length} image(s)?
              Approved images will be locked and cannot be modified.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Mark images as approved</li>
                  <li>Lock images from further editing</li>
                  <li>Make images ready for export</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmApproval}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage 5: ete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Images</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {imagesToDelete.length} image(s)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                  Warningrmanent Deletion
                </p>
                <p className="text-red-700 dark:text-red-300">
                  Deleted images cannot be recovered. Make sure you have backups if needed.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage 8: ort Modal with Format Selection */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Images</DialogTitle>
            <DialogDescription>
              Choose format and quality settings for your export
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG - Best for photos</SelectItem>
                  <SelectItem value="png">PNG - Lossless quality</SelectItem>
                  <SelectItem value="webp">WebP - Modern format</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Quality</label>
                <span className="text-sm text-muted-foreground">{exportQuality}%</span>
              </div>
              <Slider
                value={[exportQuality]}
                onValueChange={(value) => setExportQuality(value[0])}
                min={60}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size
              </p>
            </div>

            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Preparing download...</span>
                  <span>{Math.round(exportProgress)}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadImages}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download {selectedImages.size > 0 ? `(${selectedImages.size})` : 'All'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage 8: d to DAM Modal */}
      <Dialog open={damModalOpen} onOpenChange={setDamModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to DAM</DialogTitle>
            <DialogDescription>
              Transfer selected images to your Digital Asset Management system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex items-start gap-3">
                <Send className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    DAM Connection Active
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Images will be transferred to: <strong>production.dam.example.com</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedImages.size > 0
                ? `${selectedImages.size} selected image(s) will be transferred`
                : `All ${batch.images.length} images will be transferred`
              }
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDamModalOpen(false)}
              disabled={isDamSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendToDAM}
              disabled={isDamSending}
            >
              {isDamSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to DAM
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

