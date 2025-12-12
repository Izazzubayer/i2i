'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { ImageWalkthrough } from '@/components/ImageWalkthrough'
import {
  CheckCircle2,
  Loader2,
  Trash2,
  RotateCcw,
  FileEdit,
  X,
  CheckSquare,
  Square,
  Filter,
  Eye,
  Download,
  MoreVertical,
  MoreHorizontal,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  Undo2,
  ArrowRight,
  Zap,
  Rocket,
  Building2,
  AlertTriangle,
  Cloud,
  Upload,
  Link2,
  Sparkles as SparklesIcon,
  HelpCircle,
  MousePointer2,
  Clock,
  History,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { confirmOrder, startOrder, processOrder } from '@/api'
import { getPendingOrder, removePendingOrder } from '@/lib/storage'

const STATUSES = {
  PROCESSED: 'processed',
  IN_PROGRESS: 'in_progress',
  DELETED: 'deleted',
  AMENDMENT: 'amendment',
}

function ProcessingResultsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId')
  const { batch, updateImageStatus, addOrder, damConnections, activeDamConnection } = useStore()
  const [images, setImages] = useState([])
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(false) // Start as false to show images immediately
  const [error, setError] = useState(null)
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(STATUSES.PROCESSED)
  const [viewingImage, setViewingImage] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [amendmentModalOpen, setAmendmentModalOpen] = useState(false)
  const [amendmentImageId, setAmendmentImageId] = useState(null)
  const [amendmentInstruction, setAmendmentInstruction] = useState('')
  const [isApplyingAmendment, setIsApplyingAmendment] = useState(false)
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false)
  const [reprocessModalOpen, setReprocessModalOpen] = useState(false)
  const [reprocessImageId, setReprocessImageId] = useState(null)
  const [reprocessPrompt, setReprocessPrompt] = useState('')
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [reloadWarningModalOpen, setReloadWarningModalOpen] = useState(false)
  const [navigationIntent, setNavigationIntent] = useState(null) // Track navigation intent: 'back', 'reload', 'close', 'navigate'
  const [damConnectModalOpen, setDamConnectModalOpen] = useState(false)
  const [confirmedOrderData, setConfirmedOrderData] = useState(null)
  const [isUploadingToDAM, setIsUploadingToDAM] = useState(false)
  const [imageSizes, setImageSizes] = useState({})
  const [instructionAccordionOpen, setInstructionAccordionOpen] = useState(false)

  // Helper function to truncate text to a word limit
  const truncateText = (text, maxWords = 50) => {
    if (!text) return text
    const words = text.trim().split(/\s+/)
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(' ') + '...'
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

  // Fetch image sizes
  useEffect(() => {
    if (!images || images.length === 0) return
    
    const fetchSizes = async () => {
      const sizes = {}
      for (const image of images) {
        try {
          if (image.originalUrl) {
            const response = await fetch(image.originalUrl, { method: 'HEAD', mode: 'cors' })
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
  }, [images])
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [walkthroughTargetId, setWalkthroughTargetId] = useState(null)
  const progressToastIdRef = useRef(null)
  const contextMenuRef = useRef(null)
  const processingStartedRef = useRef(false)
  const imageHistoryRef = useRef(new Map()) // Store previous states for undo
  const allowLeaveRef = useRef(false) // Track if user confirmed leaving
  const pollIntervalRef = useRef(null) // Poll interval for order updates
  const reprocessTextareaRef = useRef(null)
  const pendingTabSwitchRef = useRef(null) // Track pending tab switch after warning

  // Get user's current plan from localStorage (default to Starter)
  const getUserPlan = useCallback(() => {
    if (typeof window === 'undefined') return 'Starter'
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        return user.plan || 'Starter'
      }
    } catch (error) {
      console.error('Error getting user plan:', error)
    }
    return 'Starter'
  }, [])

  // Get reprocess limit based on plan
  const getReprocessLimit = useCallback((plan) => {
    switch (plan) {
      case 'Starter':
        return 10
      case 'Pro':
        return 10
      case 'Enterprise':
        return Infinity // Unlimited
      default:
        return 10
    }
  }, [])

  // Handle pending uploads from upload page
  useEffect(() => {
    const handlePendingOrder = async () => {
      if (orderId) return // Don't process if we already have an orderId
      
      try {
        const pendingOrder = await getPendingOrder()
        if (!pendingOrder) return
        
        const { images: imagesData, instruction } = pendingOrder
        
        // Show images immediately with processing status before API calls
        const initialImages = imagesData.map((imgData, index) => ({
          id: `pending-${index}`,
          orderInputId: `pending-${index}`,
          originalName: imgData.name,
          originalUrl: imgData.dataUrl, // Use data URL immediately
          processedUrl: '', // Will be populated when processing completes
          status: STATUSES.IN_PROGRESS,
          instruction: instruction || '',
          timestamp: new Date(),
          versions: [],
          selectedVersionId: null,
          _notified: false,
        }))
        
        // Set images immediately so they show up right away
        setImages(initialImages)
        setLoading(false) // Don't block UI
        
        // Clear pending order from storage
        await removePendingOrder()
        
        // Convert data URLs back to File objects
        const imageFiles = await Promise.all(
          imagesData.map(async (imgData) => {
            const response = await fetch(imgData.dataUrl)
            const blob = await response.blob()
            return new File([blob], imgData.name, {
              type: imgData.type,
              lastModified: imgData.lastModified
            })
          })
        )
        
        if (imageFiles.length === 0) return
        
        // Start order
        const orderResponse = await startOrder()
        const newOrderId = orderResponse.orderId
        
        // Update URL with orderId
        router.replace(`/processing-results?orderId=${newOrderId}`)
        
        // Process all images in parallel (not sequentially)
        // All images will be submitted at once and show processing status
        await Promise.all(
          imageFiles.map(async (image, index) => {
            try {
              await processOrder({
                orderId: newOrderId,
                image: image,
                prompt: instruction || '',
              })
            } catch (error) {
              console.error(`Error processing image ${index + 1}:`, error)
              // Errors will be shown via polling
            }
          })
        )
      } catch (error) {
        console.error('Error handling pending order:', error)
        if (error?.status === 401) {
          toast.error('Your session has expired. Please sign in again.', {
            duration: 5000
          })
          setTimeout(() => {
            router.push('/sign-in')
          }, 2000)
        } else {
          toast.error(`Failed to start order: ${error.message || 'Unknown error'}`, {
            duration: 5000
          })
        }
      }
    }
    
    handlePendingOrder()
  }, [orderId, router])

  // Fetch order details from API and poll for updates
  useEffect(() => {
    if (!orderId) {
      // Fallback to batch if no orderId - show images immediately
      if (batch && batch.images) {
        processingStartedRef.current = false
        setImages(
          batch.images.map((img) => {
            const initialProcessedUrl = img.status === 'completed' 
              ? (img.processedUrl || `https://picsum.photos/seed/${img.id}/800/600`)
              : ''
            
            return {
              ...img,
              status: img.status === 'completed' ? STATUSES.PROCESSED : img.status === 'processing' ? STATUSES.IN_PROGRESS : STATUSES.PROCESSED,
              amendmentInstruction: null,
              originalUrl: img.originalUrl || `https://picsum.photos/seed/${img.id}-original/800/600`,
              processedUrl: initialProcessedUrl,
              versions: initialProcessedUrl ? [{
                id: 'v1',
                processedUrl: initialProcessedUrl,
                timestamp: new Date(),
                isReprocess: false,
                prompt: img.instruction || batch?.instruction || '',
              }] : [],
              selectedVersionId: initialProcessedUrl ? 'v1' : null,
            }
          })
        )
        setLoading(false) // Don't block - images are ready
      } else {
        setLoading(false) // No images to show, but don't block
      }
      return
    }

    let isMounted = true

    const fetchOrderData = async () => {
      try {
        if (!isMounted) return
        
        // Don't set loading to true - show images immediately
        // setLoading(true) // Removed to avoid blocking UI
        setError(null)
        
        // DUMMY DATA - Replace real API call with mock data
        const getOrderDetailsDummy = async (orderId, params = {}) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Generate dummy data based on orderId or use default
          const dummyOrderDetails = {
            orderId: orderId || 'dummy-order-123',
            orderNumber: 'ORD-2024-001',
            orderName: 'Sample Order',
            status: 'processed',
            createdAt: new Date().toISOString(),
            inputs: [
              {
                orderInputId: 'input-1',
                downloadUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                promptText: 'Make this image more vibrant and colorful',
              },
              {
                orderInputId: 'input-2',
                downloadUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop',
                promptText: 'Apply vintage film effect',
              },
            ],
            versions: [
              {
                versionId: 'version-1-1',
                orderInputId: 'input-1',
                downloadUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
                versionNumber: 1,
                isActive: true,
                promptUsed: 'Make this image more vibrant and colorful',
                statusLookupId: 'processed',
                processingTimeMS: 3450,
                tokensUsed: 250,
                price: 0.05,
              },
              {
                versionId: 'version-2-1',
                orderInputId: 'input-2',
                downloadUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop',
                createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 minutes ago
                versionNumber: 1,
                isActive: true,
                promptUsed: 'Apply vintage film effect',
                statusLookupId: 'processed',
                processingTimeMS: 2890,
                tokensUsed: 220,
                price: 0.04,
              },
            ],
            images: [
              {
                orderInputId: 'input-1',
                imageId: 'img-1',
              },
              {
                orderInputId: 'input-2',
                imageId: 'img-2',
              },
            ],
          }
          
          return dummyOrderDetails
        }
        
        const orderDetails = await getOrderDetailsDummy(orderId, { expirationMinutes: 60 })
        
        if (!isMounted) return
        
        // Validate API response
        if (!orderDetails) {
          throw new Error('Order details not found')
        }
        
        // Log API response for debugging
        console.log('📥 Order Details API Response:', {
          hasInputs: !!orderDetails.inputs,
          inputsCount: Array.isArray(orderDetails.inputs) ? orderDetails.inputs.length : 0,
          hasVersions: !!orderDetails.versions,
          versionsCount: Array.isArray(orderDetails.versions) ? orderDetails.versions.length : 0,
          hasImages: !!orderDetails.images,
          imagesCount: Array.isArray(orderDetails.images) ? orderDetails.images.length : 0,
        })
        
        setOrderData(orderDetails)

        // Group versions by input (each input = one image)
        const inputsMap = new Map()
        
        // Ensure inputs, versions, and images are arrays
        const inputs = Array.isArray(orderDetails.inputs) ? orderDetails.inputs : []
        const versions = Array.isArray(orderDetails.versions) ? orderDetails.versions : []
        const images = Array.isArray(orderDetails.images) ? orderDetails.images : []
        
        // Show images immediately from inputs (before processing versions)
        // This ensures images appear right away with processing status
        // Note: This will be replaced by the full data below, but shows images immediately
        
        // First, create entries for all inputs
        inputs.forEach((input, idx) => {
          // Extract filename from downloadUrl or use default
          let originalName = `image-${idx + 1}.jpg`
          if (input.downloadUrl) {
            try {
              const url = new URL(input.downloadUrl)
              const pathParts = url.pathname.split('/')
              const filename = pathParts[pathParts.length - 1]
              if (filename && filename !== '') {
                originalName = filename.split('?')[0] // Remove query params
              }
            } catch (e) {
              // If URL parsing fails, use default
            }
          }
          
          inputsMap.set(input.orderInputId, {
            orderInputId: input.orderInputId,
            originalName: originalName,
            originalUrl: input.downloadUrl || '',
            instruction: input.promptText || '',
            versions: [],
            status: STATUSES.IN_PROGRESS,
            _notified: false,
            imageId: images.find(img => img.orderInputId === input.orderInputId)?.imageId,
          })
        })

        // Then, add versions to their corresponding inputs
        versions.forEach((version) => {
          const input = inputsMap.get(version.orderInputId)
          if (input) {
            const versionData = {
              id: version.versionId,
              processedUrl: version.downloadUrl || '',
              timestamp: new Date(version.createdAt || new Date()),
              isReprocess: (version.versionNumber || 1) > 1,
              prompt: version.promptUsed || input.instruction || '',
              versionNumber: version.versionNumber || 1,
              isActive: version.isActive,
              statusLookupId: version.statusLookupId,
              processingTimeMS: version.processingTimeMS,
              tokensUsed: version.tokensUsed,
              price: version.price,
            }
            
            input.versions.push(versionData)
            
            // Update status based on versions
            // Check for active processed versions (isActive + has processedUrl)
            const hasActiveProcessed = input.versions.some(v => 
              v.isActive && v.processedUrl
            )
            
            // Check if any version failed (has statusLookupId but no downloadUrl and isActive)
            const hasFailed = input.versions.some(v => 
              v.isActive && !v.processedUrl && v.statusLookupId
            )
            
            if (hasActiveProcessed) {
              input.status = STATUSES.PROCESSED
            } else if (hasFailed && input.versions.length > 0) {
              input.status = 'error'
            } else if (input.versions.length > 0) {
              // Has versions but none are active/processed yet - still processing
              input.status = STATUSES.IN_PROGRESS
            } else {
              // No versions yet - still processing
              input.status = STATUSES.IN_PROGRESS
            }
          }
        })

        // Transform to images array
        const transformedImages = Array.from(inputsMap.values()).map((input, index) => {
          // Ensure versions is always an array
          const versions = Array.isArray(input.versions) ? input.versions : []
          
          // Get the latest active processed version, or fallback to latest version
          // Priority: 1) Active version with processedUrl, 2) Any version with processedUrl, 3) Latest version
          const latestVersion = versions.length > 0 ? (
            versions
              .filter(v => v.isActive && v.processedUrl)
              .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                return dateB - dateA
              })[0] || 
            versions
              .filter(v => v.processedUrl)
              .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                return dateB - dateA
              })[0] ||
            versions
              .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                return dateB - dateA
              })[0]
          ) : null

          return {
            id: input.orderInputId || `img-${index}`,
            orderInputId: input.orderInputId,
            imageId: input.imageId,
            originalName: input.originalName,
            originalUrl: input.originalUrl,
            processedUrl: latestVersion?.processedUrl || '',
            status: input.status,
            instruction: input.instruction,
            timestamp: latestVersion?.timestamp || new Date(),
            versions: versions
              .filter(v => v.processedUrl) // Only include versions with processed URLs
              .map(v => ({
                id: v.id,
                processedUrl: v.processedUrl,
                timestamp: v.timestamp,
                isReprocess: v.isReprocess,
                prompt: v.prompt,
                versionNumber: v.versionNumber,
                isActive: v.isActive,
              })),
            selectedVersionId: latestVersion?.id || versions.find(v => v.processedUrl && v.id)?.id,
            _notified: input._notified,
          }
        })

        setImages(transformedImages)
        processingStartedRef.current = false

        // Check if any images are still processing
        const hasProcessingImages = transformedImages.some(img => 
          img.status === STATUSES.IN_PROGRESS || 
          (!img.processedUrl && img.versions.length === 0)
        )
        
        // Poll for updates if there are processing images
        // Clear existing interval before setting new one
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        
        if (hasProcessingImages && isMounted) {
          pollIntervalRef.current = setInterval(() => {
            if (isMounted) {
              fetchOrderData()
            }
          }, 3000) // Poll every 3 seconds
        }
      } catch (err) {
        console.error('Error fetching order details:', err)
        if (isMounted) {
          setError(err.message || 'Failed to load order details')
          toast.error(err.message || 'Failed to load order details')
        }
      } finally {
        if (isMounted) {
          setLoading(false) // Ensure loading is false
        }
      }
    }

    fetchOrderData()

    return () => {
      isMounted = false
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [orderId, batch])

  // Show walkthrough during processing
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check if user has selected "Never Show Again"
    const hasSeenWalkthrough = localStorage.getItem('imageWalkthroughSeen') === 'true'
    if (hasSeenWalkthrough) return
    
    // Find first processing image
    const firstProcessingImage = images.find((img) => 
      img.status === STATUSES.IN_PROGRESS || 
      (!img.processedUrl && img.versions.length === 0)
    )

    // Show walkthrough when processing starts (every time, unless user selected "Never Show Again")
    if (firstProcessingImage && !walkthroughOpen) {
      // Wait a bit for the image to render
      const timer = setTimeout(() => {
        setWalkthroughTargetId(firstProcessingImage.id)
        setWalkthroughOpen(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [images, walkthroughOpen])

  // Show real-time processing progress toast
  useEffect(() => {
    if (!orderId || images.length === 0) return

    // Filter out reprocessing images (images that are IN_PROGRESS but have existing versions)
    const inProgressImages = images.filter((img) => {
      const isReprocessing = img.status === STATUSES.IN_PROGRESS && (img.versions || []).length > 0
      if (isReprocessing) return false // Exclude reprocessing images
      return img.status === STATUSES.IN_PROGRESS || 
        (!img.processedUrl && img.versions.length === 0)
    })
    const processedImages = images.filter((img) => 
      img.status === STATUSES.PROCESSED && 
      img.processedUrl
    )
    const totalImages = images.length
    const processedCount = processedImages.length
    const inProgressCount = inProgressImages.length

    // Show or update progress toast (only for initial processing, not reprocessing)
    if (inProgressCount > 0) {
      const progressPercentage = totalImages > 0 ? Math.round((processedCount / totalImages) * 100) : 0
      
      const toastContent = (
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Processing Images
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {processedCount} of {totalImages} completed ({progressPercentage}%)
            </p>
            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            </div>
          </div>
        </div>
      )

      if (progressToastIdRef.current) {
        // Update existing toast
        toast.loading(toastContent, {
          id: progressToastIdRef.current,
          duration: Infinity,
        })
      } else {
        // Create new toast
        progressToastIdRef.current = 'processing-progress'
        toast.loading(toastContent, {
          id: progressToastIdRef.current,
          duration: Infinity,
        })
      }
    } else if (progressToastIdRef.current && processedCount === totalImages && totalImages > 0) {
      // All images processed - dismiss progress toast and show completion
      // Only show if there are no reprocessing images in progress
      const hasReprocessingImages = images.some((img) => 
        img.status === STATUSES.IN_PROGRESS && (img.versions || []).length > 0
      )
      
      if (!hasReprocessingImages) {
        toast.dismiss(progressToastIdRef.current)
        progressToastIdRef.current = null
        
        toast.success(
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-black dark:text-white">
                All images processed
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {totalImages} {totalImages === 1 ? 'image' : 'images'} completed successfully
              </p>
            </div>
          </div>,
          { duration: 3000 }
        )
      } else {
        // Just dismiss the progress toast if reprocessing is happening
        toast.dismiss(progressToastIdRef.current)
        progressToastIdRef.current = null
      }
    } else if (progressToastIdRef.current && inProgressCount === 0) {
      // No more processing - dismiss toast
      toast.dismiss(progressToastIdRef.current)
      progressToastIdRef.current = null
    }
  }, [images, orderId])

  // Mark images as notified (no individual toasts - only progress bar toast)
  useEffect(() => {
    if (!orderId || images.length === 0) return

    const processedImages = images.filter((img) => 
      img.status === STATUSES.PROCESSED && 
      img.processedUrl &&
      !img._notified
    )

    // Mark as notified without showing individual toasts
    processedImages.forEach((img) => {
      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id ? { ...i, _notified: true } : i
        )
      )
    })
  }, [images, orderId])

  // Handle right-click context menu
  const handleContextMenu = useCallback((e, image) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      image,
    })
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  // Filter images by status
  const filteredImages = useMemo(() => {
    // When PROCESSED is selected, show both PROCESSED and IN_PROGRESS images
    // But exclude AMENDMENT images (they should only show in Amendment tab)
    if (selectedStatusFilter === STATUSES.PROCESSED) {
      return images.filter((img) => 
        (img.status === STATUSES.PROCESSED || img.status === STATUSES.IN_PROGRESS) &&
        img.status !== STATUSES.AMENDMENT
      )
    }
    return images.filter((img) => img.status === selectedStatusFilter)
  }, [images, selectedStatusFilter])

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      all: images.length,
      processed: images.filter((img) => 
        img.status === STATUSES.PROCESSED || img.status === STATUSES.IN_PROGRESS
      ).length, // Combined count for "All Images" tab
      deleted: images.filter((img) => img.status === STATUSES.DELETED).length,
      amendment: images.filter((img) => img.status === STATUSES.AMENDMENT).length,
    }
  }, [images])

  // Check if there are any processing images
  const hasProcessingImages = useMemo(() => {
    return images.some((img) => 
      img.status === STATUSES.IN_PROGRESS || 
      (!img.processedUrl && img.versions.length === 0)
    )
  }, [images])

  // Dynamic label for "All Images" tab
  const allImagesTabLabel = useMemo(() => {
    return hasProcessingImages ? 'Processing' : 'Processed'
  }, [hasProcessingImages])

  // Check if all images in current filter are selected
  const allSelected = useMemo(() => {
    return filteredImages.length > 0 && filteredImages.every((img) => selectedImages.has(img.id))
  }, [filteredImages, selectedImages])

  // Update viewing image when filter changes - navigate to first filtered image or close modal
  useEffect(() => {
    if (viewingImage) {
      const isCurrentImageInFilter = filteredImages.some(img => img.id === viewingImage.id)
      if (!isCurrentImageInFilter) {
        // Current image is not in filtered set
        if (filteredImages.length > 0) {
          // Navigate to first filtered image
          setViewingImage(filteredImages[0])
        } else {
          // No filtered images, close modal
          setViewingImage(null)
        }
      }
    }
    // Only depend on filteredImages, not viewingImage to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredImages])

  // Toggle select all for current filter
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedImages((prev) => {
        const newSet = new Set(prev)
        filteredImages.forEach((img) => newSet.delete(img.id))
        return newSet
      })
    } else {
      setSelectedImages((prev) => {
        const newSet = new Set(prev)
        filteredImages.forEach((img) => newSet.add(img.id))
        return newSet
      })
    }
  }, [allSelected, filteredImages])

  // Toggle individual image selection
  const toggleImageSelection = useCallback((imageId) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(imageId)) {
        newSet.delete(imageId)
      } else {
        newSet.add(imageId)
      }
      return newSet
    })
  }, [])

  // Handle open reprocess modal
  const handleOpenReprocess = useCallback((imageId) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    // Check reprocess limit
    const userPlan = getUserPlan()
    const reprocessLimit = getReprocessLimit(userPlan)
    const currentReprocessCount = (image.versions || []).filter(v => v.isReprocess).length

    // If limit exceeded, show upgrade modal
    if (currentReprocessCount >= reprocessLimit) {
      setUpgradeModalOpen(true)
      setContextMenu(null)
      return
    }

    // Pre-fill with the last reprocess prompt if available, or original prompt
    const lastReprocess = image?.versions?.filter(v => v.isReprocess).slice(-1)[0]
    const initialPrompt = lastReprocess?.prompt || image?.instruction || batch?.instruction || ''
    
    setReprocessImageId(imageId)
    setReprocessPrompt(initialPrompt)
    setReprocessModalOpen(true)
    setContextMenu(null)
  }, [images, batch, getUserPlan, getReprocessLimit])

  // Handle reprocess with prompt
  const handleReprocess = useCallback(async () => {
    if (!reprocessImageId) return

    setIsReprocessing(true)
    try {
      // Update status to in progress
      setImages((prev) =>
        prev.map((img) =>
          img.id === reprocessImageId
            ? {
                ...img,
                status: STATUSES.IN_PROGRESS,
              }
            : img
        )
      )

      // Simulate reprocessing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setImages((prev) => {
        const image = prev.find((img) => img.id === reprocessImageId)
        if (image && image.status === STATUSES.IN_PROGRESS) {
          const reprocessCount = (image.versions || []).filter(v => v.isReprocess).length + 1
          const newProcessedUrl = `https://picsum.photos/seed/${reprocessImageId}-reprocessed-${reprocessCount}/800/600`
          const newVersion = {
            id: `v${Date.now()}`,
            processedUrl: newProcessedUrl,
            timestamp: new Date(),
            isReprocess: true,
            prompt: reprocessPrompt.trim() || 'Reprocessed without specific instructions',
          }
          
          return prev.map((img) =>
            img.id === reprocessImageId
              ? {
                  ...img,
                  status: STATUSES.PROCESSED,
                  processedUrl: newProcessedUrl,
                  versions: [...(img.versions || []), newVersion],
                  selectedVersionId: newVersion.id, // Auto-select the new reprocessed version
                }
              : img
          )
        }
        return prev
      })
      
      toast.success(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <RotateCcw className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Image reprocessed
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Processing completed successfully
            </p>
          </div>
        </div>
      )
      setReprocessModalOpen(false)
      setReprocessPrompt('')
      setReprocessImageId(null)
    } catch (error) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Reprocessing failed
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please try again later
            </p>
          </div>
        </div>
      )
    } finally {
      setIsReprocessing(false)
    }
  }, [reprocessImageId, reprocessPrompt])

  // Handle delete - support single or bulk
  const handleDelete = useCallback((imageId = null) => {
    // If imageId provided, it's a single delete
    // If not provided and images are selected, it's a bulk delete
    const imagesToDelete = imageId 
      ? [imageId] 
      : (selectedImages.size > 0 ? Array.from(selectedImages).filter(id => {
          const img = images.find(i => i.id === id)
          return img && img.status !== STATUSES.DELETED
        }) : [])
    
    if (imagesToDelete.length === 0) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              No images selected
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please select at least one image to delete
            </p>
          </div>
        </div>
      )
      return
    }

    setImages((prev) => {
      // Store previous states for undo
      imagesToDelete.forEach((id) => {
        const image = prev.find(img => img.id === id)
        if (image) {
          imageHistoryRef.current.set(id, {
            status: image.status,
            processedUrl: image.processedUrl,
            amendmentInstruction: image.amendmentInstruction,
          })
        }
      })
      
      return prev.map((img) =>
        imagesToDelete.includes(img.id) ? { ...img, status: STATUSES.DELETED } : img
      )
    })
    
    // Clear selections after bulk delete
    const deletedImageIds = imagesToDelete
    
    if (imagesToDelete.length > 1) {
      setSelectedImages((prev) => {
        const newSet = new Set(prev)
        imagesToDelete.forEach(id => newSet.delete(id))
        return newSet
      })
      toast.warning(
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              {imagesToDelete.length} images deleted
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              You can undo this action
            </p>
          </div>
          <button
            onClick={() => {
              deletedImageIds.forEach(id => handleUndo(id))
            }}
            className="ml-2 px-3 py-1.5 text-xs font-medium bg-background hover:bg-accent border border-border rounded-md transition-colors"
          >
            Undo
          </button>
        </div>
      )
    } else {
      toast.warning(
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Image deleted
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              You can undo this action
            </p>
          </div>
          <button
            onClick={() => {
              handleUndo(deletedImageIds[0])
            }}
            className="ml-2 px-3 py-1.5 text-xs font-medium bg-background hover:bg-accent border border-border rounded-md transition-colors"
          >
            Undo
          </button>
        </div>
      )
    }
    setContextMenu(null)
  }, [images, selectedImages])

  // Handle undo
  const handleUndo = useCallback((imageId) => {
    const previousState = imageHistoryRef.current.get(imageId)
    if (previousState) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                status: previousState.status,
                processedUrl: previousState.processedUrl,
                amendmentInstruction: previousState.amendmentInstruction,
              }
            : img
        )
      )
      imageHistoryRef.current.delete(imageId)
      toast.success(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Undo2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Action undone
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Previous state restored
            </p>
          </div>
        </div>
      )
    }
    setContextMenu(null)
  }, [])

  // Handle restore single deleted image (for context menu)
  const handleRestoreSingle = useCallback((imageId) => {
    const image = images.find(i => i.id === imageId)
    if (!image || image.status !== STATUSES.DELETED) return

    setImages((prev) => {
      return prev.map((img) => {
        if (img.id === imageId) {
          const previousState = imageHistoryRef.current.get(imageId)
          if (previousState) {
            return {
              ...img,
              status: previousState.status,
              processedUrl: previousState.processedUrl,
              amendmentInstruction: previousState.amendmentInstruction,
            }
          }
          // If no history, restore to PROCESSED
          return { ...img, status: STATUSES.PROCESSED }
        }
        return img
      })
    })

    // Clear history for restored image
    imageHistoryRef.current.delete(imageId)
    
    toast.success(
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-black dark:text-white">
            Image restored
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            The image has been restored
          </p>
        </div>
      </div>
    )
  }, [images])

  // Handle delete forever single image (for context menu)
  const handleDeleteForeverSingle = useCallback((imageId) => {
    const image = images.find(i => i.id === imageId)
    if (!image || image.status !== STATUSES.DELETED) return

    // Confirm permanent deletion
    if (!confirm('Are you sure you want to permanently delete this image? This action cannot be undone.')) {
      return
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId))
    
    // Clear history for permanently deleted image
    imageHistoryRef.current.delete(imageId)
    
    toast.error(
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-black dark:text-white">
            Image permanently deleted
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            The image has been removed
          </p>
        </div>
      </div>
    )
  }, [images])

  // Handle restore deleted images
  const handleRestore = useCallback(() => {
    const selectedIds = Array.from(selectedImages).filter(id => {
      const img = images.find(i => i.id === id)
      return img?.status === STATUSES.DELETED
    })
    
    if (selectedIds.length === 0) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              No deleted images selected
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please select at least one deleted image to restore
            </p>
          </div>
        </div>
      )
      return
    }

    setImages((prev) => {
      return prev.map((img) => {
        if (selectedIds.includes(img.id)) {
          const previousState = imageHistoryRef.current.get(img.id)
          if (previousState) {
            return {
              ...img,
              status: previousState.status,
              processedUrl: previousState.processedUrl,
              amendmentInstruction: previousState.amendmentInstruction,
            }
          }
          // If no history, restore to PROCESSED
          return { ...img, status: STATUSES.PROCESSED }
        }
        return img
      })
    })

    // Clear history for restored images
    selectedIds.forEach(id => imageHistoryRef.current.delete(id))
    
    setSelectedImages(new Set())
    
    toast.success(
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-black dark:text-white">
            {selectedIds.length === 1 ? 'Image restored' : `${selectedIds.length} images restored`}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {selectedIds.length === 1 ? 'The image has been restored' : 'The images have been restored'}
          </p>
        </div>
      </div>
    )
  }, [images, selectedImages])

  // Handle delete forever (permanent deletion)
  const handleDeleteForever = useCallback(() => {
    const selectedIds = Array.from(selectedImages).filter(id => {
      const img = images.find(i => i.id === id)
      return img?.status === STATUSES.DELETED
    })
    
    if (selectedIds.length === 0) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              No deleted images selected
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please select at least one deleted image to permanently delete
            </p>
          </div>
        </div>
      )
      return
    }

    // Confirm permanent deletion
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length === 1 ? 'this image' : `${selectedIds.length} images`}? This action cannot be undone.`)) {
      return
    }

    setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)))
    
    // Clear history for permanently deleted images
    selectedIds.forEach(id => imageHistoryRef.current.delete(id))
    
    setSelectedImages(new Set())
    
    toast.error(
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-black dark:text-white">
            {selectedIds.length === 1 ? 'Image permanently deleted' : `${selectedIds.length} images permanently deleted`}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {selectedIds.length === 1 ? 'The image has been removed' : 'The images have been removed'}
          </p>
        </div>
      </div>
    )
  }, [images, selectedImages])

  // Handle version selection
  const handleSelectVersion = useCallback((imageId, versionId) => {
    setImages((prev) => {
      const updated = prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              selectedVersionId: versionId,
              processedUrl: img.versions?.find(v => v.id === versionId)?.processedUrl || img.processedUrl,
            }
          : img
      )
      
      // Update viewing image if it's the same image
      if (viewingImage && viewingImage.id === imageId) {
        const updatedImage = updated.find(img => img.id === imageId)
        if (updatedImage) {
          setViewingImage(updatedImage)
        }
      }
      
      return updated
    })
  }, [viewingImage])

  // Handle amendment - support single or bulk
  const handleOpenAmendment = useCallback((imageId = null) => {
    // If imageId provided, it's a single image amendment
    // If not provided and images are selected, it's a bulk amendment
    const targetImageId = imageId || (selectedImages.size > 0 ? Array.from(selectedImages)[0] : null)
    
    if (!targetImageId) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FileEdit className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              No images selected
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please select at least one image to amend
            </p>
          </div>
        </div>
      )
      return
    }
    
    setAmendmentImageId(targetImageId)
    setAmendmentInstruction('')
    setAmendmentModalOpen(true)
    setContextMenu(null)
  }, [selectedImages])

  // Apply amendment - support single or bulk, handle all state transitions
  const handleApplyAmendment = useCallback(async () => {
    if (!amendmentImageId || !amendmentInstruction.trim()) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FileEdit className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Instructions required
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please enter amendment instructions
            </p>
          </div>
        </div>
      )
      return
    }

    setIsApplyingAmendment(true)
    try {
      // Determine which images to amend
      // If multiple images are selected, amend all selected (bulk)
      // Otherwise, amend just the single image
      // Works for: processed -> amendment, deleted -> amendment, amendment -> amendment
      const imagesToAmend = selectedImages.size > 1 && selectedImages.has(amendmentImageId)
        ? Array.from(selectedImages).filter(id => {
            const img = images.find(i => i.id === id)
            return img && img.status !== STATUSES.IN_PROGRESS // Allow deleted and amendment to be amended
          }) // Bulk amendment - filter out only IN_PROGRESS
        : [amendmentImageId] // Single amendment

      // Store previous states for undo (for all cases: processed, deleted, amendment)
      setImages((prev) => {
        imagesToAmend.forEach((imgId) => {
          const image = prev.find(img => img.id === imgId)
          if (image) {
            imageHistoryRef.current.set(imgId, {
              status: image.status,
              processedUrl: image.processedUrl,
              amendmentInstruction: image.amendmentInstruction,
            })
          }
        })
        return prev
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setImages((prev) => {
        return prev.map((img) => {
          if (imagesToAmend.includes(img.id)) {
            const newProcessedUrl = `https://picsum.photos/seed/${img.id}-amended-${Date.now()}/800/600`
            const newVersion = {
              id: `v${Date.now()}-${img.id}`,
              processedUrl: newProcessedUrl,
              timestamp: new Date(),
              isReprocess: false,
              isAmendment: true,
              amendmentInstruction: amendmentInstruction,
              prompt: amendmentInstruction,
            }
            
            return {
              ...img,
              status: STATUSES.AMENDMENT, // Always move to amendment section
              amendmentInstruction: amendmentInstruction,
              processedUrl: newProcessedUrl,
              versions: [...(img.versions || []), newVersion],
              selectedVersionId: newVersion.id,
            }
          }
          return img
        })
      })

      // Clear selections after bulk amendment
      if (imagesToAmend.length > 1) {
        setSelectedImages((prev) => {
          const newSet = new Set(prev)
          imagesToAmend.forEach(id => newSet.delete(id))
          return newSet
        })
        toast.success(
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileEdit className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-black dark:text-white">
                {imagesToAmend.length} images amended
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Amendment applied successfully
              </p>
            </div>
          </div>
        )
      } else {
        toast.success(
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileEdit className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-black dark:text-white">
                Amendment applied
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Your changes have been saved
              </p>
            </div>
          </div>
        )
      }
      
      setAmendmentModalOpen(false)
      setAmendmentInstruction('')
      setAmendmentImageId(null)
    } catch (error) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Amendment failed
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please try again later
            </p>
          </div>
        </div>
      )
    } finally {
      setIsApplyingAmendment(false)
    }
  }, [amendmentImageId, amendmentInstruction, selectedImages, images])

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case STATUSES.PROCESSED:
        return <CheckCircle2 className="h-4 w-4 text-foreground" />
      case STATUSES.IN_PROGRESS:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Loader2 className="h-4 w-4 text-foreground" />
          </motion.div>
        )
      case STATUSES.DELETED:
        return <Trash2 className="h-4 w-4 text-foreground" />
      case STATUSES.AMENDMENT:
        return <FileEdit className="h-4 w-4 text-foreground" />
      default:
        return null
    }
  }

  // Get status badge - don't show for processed images
  const getStatusBadge = (status) => {
    switch (status) {
      case STATUSES.PROCESSED:
        return null // Don't show badge for processed images
      case STATUSES.IN_PROGRESS:
        return (
          <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-50/90 dark:bg-amber-950/30 backdrop-blur-md shadow-sm px-2.5 py-1 text-xs font-medium">
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case STATUSES.DELETED:
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-700 dark:text-red-400 bg-red-50/90 dark:bg-red-950/30 backdrop-blur-md shadow-sm px-2.5 py-1 text-xs font-medium">
            Deleted
          </Badge>
        )
      case STATUSES.AMENDMENT:
        return (
          <Badge variant="outline" className="border-blue-500/50 text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/30 backdrop-blur-md shadow-sm px-2.5 py-1 text-xs font-medium">
            Amendment
          </Badge>
        )
      default:
        return null
    }
  }

  // Get count of confirmable images
  const confirmableImagesCount = useMemo(() => {
    return images.filter(img => img.status === STATUSES.PROCESSED || img.status === STATUSES.AMENDMENT).length
  }, [images])

  // Handle upload to DAM
  const handleUploadToDAM = useCallback(async (damConnection) => {
    if (!confirmedOrderData) return

    setIsUploadingToDAM(true)
    try {
      const processedImages = confirmedOrderData.imagesData?.filter(img => 
        img.status !== STATUSES.DELETED && img.processedUrl
      ) || []

      if (processedImages.length === 0) {
        toast.error(
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-black dark:text-white">
                No images to upload
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                No processed images available
              </p>
            </div>
          </div>
        )
        return
      }

      // Simulate upload API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Cloud className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Upload successful!
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {processedImages.length} image{processedImages.length !== 1 ? 's' : ''} uploaded to {damConnection.name}
            </p>
          </div>
        </div>
      )

      setDamConnectModalOpen(false)
    } catch (error) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Upload failed
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Please try again later
            </p>
          </div>
        </div>
      )
    } finally {
      setIsUploadingToDAM(false)
    }
  }, [confirmedOrderData])

  // Check if there are unconfirmed orders (images ready to confirm)
  const hasUnconfirmedOrder = useMemo(() => {
    return confirmableImagesCount > 0
  }, [confirmableImagesCount])

  // Handler for UI tab clicks - warn if there are unconfirmed orders
  const handleTabClick = useCallback((newStatus) => {
    // If clicking the same tab, allow it
    if (newStatus === selectedStatusFilter) {
      return
    }

    // If there are unconfirmed orders, show warning
    if (hasUnconfirmedOrder && !allowLeaveRef.current) {
      setNavigationIntent('tab')
      setReloadWarningModalOpen(true)
      // Store the intended tab to switch to after confirmation
      pendingTabSwitchRef.current = newStatus
      return
    }

    // Otherwise, allow the tab switch
    setSelectedStatusFilter(newStatus)
  }, [hasUnconfirmedOrder, selectedStatusFilter])

  // Navigation interceptor for navbar - warns if there are unconfirmed orders
  const handleNavigationAttempt = useCallback((path, event) => {
    // If there are unconfirmed orders and user hasn't confirmed leaving, show warning
    if (hasUnconfirmedOrder && !allowLeaveRef.current) {
      // Don't navigate to the same page
      if (path === pathname || (path !== '/' && pathname?.startsWith(path))) {
        return true // Allow same-page navigation
      }
      
      setNavigationIntent('navigate')
      setReloadWarningModalOpen(true)
      // Store the intended path to navigate to after confirmation
      pendingTabSwitchRef.current = path
      return false // Prevent navigation
    }
    
    return true // Allow navigation
  }, [hasUnconfirmedOrder, pathname])

  // Handle page reload, back button, and tab close warnings
  useEffect(() => {
    if (!hasUnconfirmedOrder) {
      allowLeaveRef.current = false
      setNavigationIntent(null)
      return
    }

    // Push a state entry when there are unconfirmed orders to intercept back button
    const handlePopState = (e) => {
      if (allowLeaveRef.current) {
        return // Allow navigation if user confirmed
      }
      e.preventDefault()
      setNavigationIntent('back')
      setReloadWarningModalOpen(true)
      // Push state again to keep user on page
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    // Handle beforeunload for tab close/refresh
    const handleBeforeUnload = (e) => {
      if (allowLeaveRef.current) {
        return // Allow if user confirmed
      }
      e.preventDefault()
      e.returnValue = '' // Required for Chrome
      setNavigationIntent('reload')
      setReloadWarningModalOpen(true)
    }

    // Handle browser tab switch warning
    const handleVisibilityChange = () => {
      if (allowLeaveRef.current) {
        return // Allow if user confirmed
      }
      
      // When user switches away from the tab (page becomes hidden)
      if (document.hidden) {
        // Show warning immediately if there are unconfirmed orders
        // Note: We can't prevent browser tab switching, but we can warn
        if (hasUnconfirmedOrder && !allowLeaveRef.current) {
          setNavigationIntent('tab')
          setReloadWarningModalOpen(true)
        }
        return
      }
      
      // When user switches back to the tab (page becomes visible)
      // Show warning if there are unconfirmed orders
      if (hasUnconfirmedOrder && !allowLeaveRef.current) {
        setNavigationIntent('tab')
        setReloadWarningModalOpen(true)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hasUnconfirmedOrder])

  // Removed blocking loading screen - images will show immediately
  // Show loading indicator only if we have no images and are actually loading
  if (loading && images.length === 0 && !orderId) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNav onNavigationAttempt={handleNavigationAttempt} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!orderId && !batch)) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNav onNavigationAttempt={handleNavigationAttempt} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle confirm order
  const handleConfirmOrder = async () => {
    const processedImages = images.filter(img => 
      img.status === STATUSES.PROCESSED || 
      img.status === STATUSES.AMENDMENT
    )
    
    if (processedImages.length === 0) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              No images to confirm
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              No processed images available. Please wait for processing to complete.
            </p>
          </div>
        </div>
      )
      return
    }

    if (!orderId) {
      // If no orderId, just save to store (fallback mode)
      const totalSize = images.reduce((acc, img) => acc + 2.5, 0)
      const sizeInGB = (totalSize / 1024).toFixed(1)
      
      const orderDataForStore = {
        id: batch?.orderId || `order-${Date.now()}`,
        name: batch?.name || `Order ${new Date().toLocaleDateString()}`,
        images: images.length,
        status: 'completed',
        completedAt: new Date().toISOString(),
        tokens: images.reduce((sum, img) => sum + (img.tokensUsed || 0), 0),
        size: `${sizeInGB} GB`,
        instructions: batch?.instruction || batch?.instructions || '',
        processedCount: processedImages.length,
        approvedCount: processedImages.length,
        retouchCount: 0,
        failedCount: images.filter(img => img.status === STATUSES.DELETED || img.status === 'error').length,
        imagesData: images.map(img => ({
          id: img.id,
          originalName: img.originalName,
          originalUrl: img.originalUrl,
          processedUrl: img.processedUrl,
          status: img.status,
          versions: img.versions || [],
        })),
      }
      
      addOrder(orderDataForStore)
      router.push('/orders')
      return
    }

    setIsConfirmingOrder(true)
    try {
      // Confirm order via API
      await confirmOrder(orderId)
      
      // Calculate order statistics
      const totalSize = images.reduce((acc, img) => {
        return acc + 2.5 // MB per image estimate
      }, 0)
      const sizeInGB = (totalSize / 1024).toFixed(1)
      
      // Calculate total tokens from order data
      const totalTokens = (Array.isArray(orderData?.versions) 
        ? orderData.versions.reduce((sum, v) => sum + (v.tokensUsed || 0), 0) 
        : 0) || 
        (Array.isArray(images) 
          ? images.reduce((sum, img) => sum + (img.tokensUsed || 0), 0) 
          : 0)
      
      // Save order to store for local reference
      const orderDataForStore = {
        id: orderId,
        orderId: orderId,
        name: orderData?.orderName || batch?.name || `Order ${new Date().toLocaleDateString()}`,
        images: images.length,
        status: 'completed',
        completedAt: new Date().toISOString(),
        tokens: totalTokens,
        size: `${sizeInGB} GB`,
        instructions: orderData?.inputs?.[0]?.promptText || batch?.instruction || batch?.instructions || '',
        processedCount: processedImages.length,
        approvedCount: processedImages.length,
        retouchCount: 0,
        failedCount: images.filter(img => img.status === STATUSES.DELETED || img.status === 'error').length,
        imagesData: images.map(img => ({
          id: img.id,
          originalName: img.originalName,
          originalUrl: img.originalUrl,
          processedUrl: img.processedUrl,
          status: img.status,
          versions: img.versions || [],
        })),
      }
      
      const savedOrder = addOrder(orderDataForStore)
      setConfirmedOrderData(savedOrder)
      
      toast.success(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Order confirmed successfully
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Redirecting to orders page...
            </p>
          </div>
        </div>
      )
      
      // Navigate to orders page after a short delay
      setTimeout(() => {
      router.push('/orders')
      }, 1000)
    } catch (error) {
      console.error('Error confirming order:', error)
      toast.error(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Order confirmation failed
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {error.message || 'Please try again later'}
            </p>
          </div>
        </div>
      )
    } finally {
      setIsConfirmingOrder(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background relative">
      {/* Page Lock Overlay - Shows when confirming order */}
      <AnimatePresence>
        {isConfirmingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
              />
              <div className="text-center">
                <p className="font-semibold text-lg">Confirming Order...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we process your order
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disable interactions when confirming */}
      {isConfirmingOrder && (
        <div className="fixed inset-0 z-[9998] pointer-events-none" />
      )}

      <div className={isConfirmingOrder ? "pointer-events-none opacity-50" : ""}>
        <AuthenticatedNav onNavigationAttempt={handleNavigationAttempt} />

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 py-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Status Tabs */}
            <div className="flex items-center gap-4 border-b border-border w-fit">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabClick(STATUSES.PROCESSED)}
                className={`
                  relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors
                  ${selectedStatusFilter === STATUSES.PROCESSED 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
                aria-pressed={selectedStatusFilter === STATUSES.PROCESSED}
              >
                {hasProcessingImages ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>{allImagesTabLabel}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                  {statusCounts.processed}
                </Badge>
                {selectedStatusFilter === STATUSES.PROCESSED && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabClick(STATUSES.DELETED)}
                className={`
                  relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors
                  ${selectedStatusFilter === STATUSES.DELETED 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
                aria-pressed={selectedStatusFilter === STATUSES.DELETED}
              >
                <Trash2 className="h-4 w-4" />
                <span>Deleted</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                  {statusCounts.deleted}
                </Badge>
                {selectedStatusFilter === STATUSES.DELETED && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabClick(STATUSES.AMENDMENT)}
                className={`
                  relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors
                  ${selectedStatusFilter === STATUSES.AMENDMENT 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
                aria-pressed={selectedStatusFilter === STATUSES.AMENDMENT}
              >
                <FileEdit className="h-4 w-4" />
                <span>Amendment</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                  {statusCounts.amendment}
                </Badge>
                {selectedStatusFilter === STATUSES.AMENDMENT && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            </div>
        </motion.div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24">
        {/* Toolbar */}
        <motion.div 
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 flex-1">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
              <span className="text-sm font-medium">
                {allSelected ? 'Deselect All' : 'Select All'} ({selectedStatusFilter})
              </span>
            </motion.div>
            {selectedImages.size > 0 && (
              <>
                <Badge variant="secondary" className="gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {selectedImages.size} selected
                </Badge>
                
                {/* Bulk Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  {selectedStatusFilter === STATUSES.DELETED ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleRestore}
                        disabled={Array.from(selectedImages).every(id => {
                          const img = images.find(i => i.id === id)
                          return img?.status !== STATUSES.DELETED
                        })}
                        className="gap-2"
                      >
                        <Undo2 className="h-4 w-4" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDeleteForever}
                        disabled={Array.from(selectedImages).every(id => {
                          const img = images.find(i => i.id === id)
                          return img?.status !== STATUSES.DELETED
                        })}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Forever
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const firstSelectedId = Array.from(selectedImages)[0]
                          if (firstSelectedId) {
                            handleOpenReprocess(firstSelectedId)
                          }
                        }}
                        disabled={Array.from(selectedImages).every(id => {
                          const img = images.find(i => i.id === id)
                          return img?.status === STATUSES.IN_PROGRESS || img?.status === STATUSES.DELETED
                        })}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reprocess
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenAmendment()}
                        disabled={Array.from(selectedImages).every(id => {
                          const img = images.find(i => i.id === id)
                          return img?.status === STATUSES.IN_PROGRESS
                        })}
                        className="gap-2"
                      >
                        <FileEdit className="h-4 w-4" />
                        Amendment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const selectedIds = Array.from(selectedImages)
                          selectedIds.forEach(id => {
                            const img = images.find(i => i.id === id)
                            if (img && img.status !== STATUSES.DELETED) {
                              handleDelete(id)
                            }
                          })
                          setSelectedImages(new Set())
                        }}
                        disabled={Array.from(selectedImages).every(id => {
                          const img = images.find(i => i.id === id)
                          return img?.status === STATUSES.DELETED
                        })}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  delay: index * 0.03,
                  duration: 0.2
                }}
                className="relative group"
              >
                <Card
                  data-image-id={image.id}
                  className={`overflow-hidden transition-all duration-200 cursor-pointer border-2 ${
                    selectedImages.has(image.id) 
                      ? 'border-primary shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:shadow-lg'
                  } bg-card`}
                  onContextMenu={(e) => handleContextMenu(e, image)}
                  onClick={() => {
                    // Allow viewing any image in the filtered set (processed, amendment, or deleted)
                    // Since we're already iterating over filteredImages, we can view any of them
                    setViewingImage(image)
                  }}
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    {(() => {
                      // Get the selected version's processed URL
                      const selectedVersion = image.versions?.find(v => v.id === image.selectedVersionId)
                      const displayProcessedUrl = selectedVersion?.processedUrl || image.processedUrl
                      // Fallback to original image if processed image not available
                      const displayImageUrl = displayProcessedUrl || image.originalUrl
                      
                      return image.status === STATUSES.IN_PROGRESS ? (
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center bg-muted/50"
                        animate={{ 
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {/* Show original image as background when processing */}
                        {image.originalUrl && (
                          <div className="absolute inset-0 opacity-30">
                            <Image
                              src={image.originalUrl}
                              alt={image.originalName}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        )}
                        <motion.div
                          className="relative z-10"
                          animate={{ 
                            scale: [1, 1.15, 1],
                            rotate: 360
                          }}
                          transition={{ 
                            scale: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            },
                            rotate: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }
                          }}
                        >
                          <Loader2 className="h-12 w-12 text-foreground" />
                        </motion.div>
                      </motion.div>
                    ) : image.status === STATUSES.DELETED ? (
                      <div className="relative w-full h-full">
                        {/* Show image normally with a subtle deleted indicator */}
                        {displayImageUrl ? (
                          <Image
                            src={displayImageUrl}
                            alt={image.originalName}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : image.originalUrl ? (
                          <Image
                            src={image.originalUrl}
                            alt={image.originalName}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : null}
                      </div>
                    ) : displayImageUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={displayImageUrl}
                          alt={image.originalName}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        {/* Badge indicating if showing original vs processed */}
                        {!displayProcessedUrl && displayImageUrl && (
                          <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground border shadow-sm z-10">
                            Original
                          </div>
                        )}
                      </div>
                    ) : (
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center bg-muted"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="h-12 w-12 text-muted-foreground" />
                      </motion.div>
                    )
                    })()}

                    {/* Top Right Badges Container */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
                      {/* Version Count Badge - Hide for deleted images */}
                      {image.versions && image.versions.length > 1 && image.status !== STATUSES.DELETED && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                        >
                          <Badge 
                            variant="secondary" 
                            className="gap-1.5 bg-background/95 backdrop-blur-md border shadow-md px-2.5 py-1 text-xs font-medium"
                          >
                            <RotateCcw className="h-3 w-3" />
                            {image.versions.length}
                          </Badge>
                        </motion.div>
                      )}

                      {/* Status Badge - Only show for non-processed, non-deleted images */}
                      {image.status !== STATUSES.PROCESSED && image.status !== STATUSES.AMENDMENT && image.status !== STATUSES.DELETED && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, type: "spring" }}
                        >
                          {getStatusBadge(image.status)}
                        </motion.div>
                      )}
                    </div>

                    {/* Status Icon Overlay - Bottom Left */}
                    {image.status === STATUSES.IN_PROGRESS && (
                      <motion.div 
                        className="absolute bottom-3 left-3 z-20"
                        animate={{
                          y: [0, -4, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="bg-background/95 backdrop-blur-md rounded-lg p-2 shadow-lg border">
                          {getStatusIcon(image.status)}
                        </div>
                      </motion.div>
                    )}


                  </div>

                  {/* Card Footer - Improved Design */}
                  <CardContent className="p-4 border-t bg-card">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate flex-1" title={image.originalName}>
                          {image.originalName}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Undo Action for Deleted/Amendment */}
                          {(image.status === STATUSES.DELETED || image.status === STATUSES.AMENDMENT) && (
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-background/95 backdrop-blur-md border shadow-md hover:bg-background"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUndo(image.id)
                              }}
                              title="Undo Action"
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {image.amendmentInstruction && (
                        <div className="pt-1">
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            <span className="font-medium text-foreground">Amendment:</span> {image.amendmentInstruction}
                          </p>
                        </div>
                      )}
                      {image.versions && image.versions.length > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            <p className="text-xs text-muted-foreground">
                              {image.versions.length} {image.versions.length === 1 ? 'version' : 'versions'}
                            </p>
                          </div>
                          {/* 3-Dot Menu Button */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.button
                                type="button"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.05, type: "spring" }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:outline-none"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              {image.status === STATUSES.DELETED ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRestoreSingle(image.id)
                                    }}
                                    className="gap-2"
                                  >
                                    <Undo2 className="h-4 w-4" />
                                    Restore
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteForeverSingle(image.id)
                                    }}
                                    className="gap-2 text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Forever
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  {/* Undo option for amendment */}
                                  {image.status === STATUSES.AMENDMENT && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleUndo(image.id)
                                        }}
                                        className="gap-2"
                                      >
                                        <Undo2 className="h-4 w-4" />
                                        Undo
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  
                                  {/* View option - for processed and amendment images */}
                                  {(image.status === STATUSES.PROCESSED || image.status === STATUSES.AMENDMENT) && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setViewingImage(image)
                                      }}
                                      className="gap-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {/* Reprocess option - hide for deleted and in-progress images */}
                                  {image.status !== STATUSES.DELETED && image.status !== STATUSES.IN_PROGRESS && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenReprocess(image.id)
                                      }}
                                      className="gap-2"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                      Reprocess
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {/* Amendment option - hide for deleted and in-progress images */}
                                  {image.status !== STATUSES.DELETED && image.status !== STATUSES.IN_PROGRESS && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenAmendment(image.id)
                                      }}
                                      className="gap-2"
                                    >
                                      <FileEdit className="h-4 w-4" />
                                      Amendment
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {/* Delete option - hide for deleted images */}
                                  {image.status !== STATUSES.DELETED && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDelete(image.id)
                                        }}
                                        className="gap-2 text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No images found for this status</p>
          </div>
        )}
      </main>

      {/* Sticky Confirm Order Footer */}
      {confirmableImagesCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {confirmableImagesCount} image{confirmableImagesCount !== 1 ? 's' : ''} ready to confirm
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review your processed images and confirm the order
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={isConfirmingOrder}
                  className="gap-2"
                >
                  {isConfirmingOrder ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Confirm Order
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <motion.div
          ref={contextMenuRef}
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed z-50 min-w-[200px] rounded-md border bg-popover shadow-lg"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            {contextMenu.image.status === STATUSES.DELETED ? (
              <>
                {/* Restore option for deleted images */}
                <div
                  className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => {
                    handleRestoreSingle(contextMenu.image.id)
                    setContextMenu(null)
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleRestoreSingle(contextMenu.image.id)
                    setContextMenu(null)
                  }}
                >
                  <Undo2 className="mr-2 h-4 w-4" />
                  Restore
                </div>
                <div className="-mx-1 my-1 h-px bg-muted" />
                {/* Delete Forever option for deleted images */}
                <div
                  className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer text-destructive focus:bg-accent focus:text-accent-foreground"
                  onClick={() => {
                    handleDeleteForeverSingle(contextMenu.image.id)
                    setContextMenu(null)
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleDeleteForeverSingle(contextMenu.image.id)
                    setContextMenu(null)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Forever
                </div>
              </>
            ) : (
              <>
                {/* Undo option for amendment */}
                {contextMenu.image.status === STATUSES.AMENDMENT && (
                  <>
                    <div
                      className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onClick={() => handleUndo(contextMenu.image.id)}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleUndo(contextMenu.image.id)
                      }}
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      Undo
                    </div>
                    <div className="-mx-1 my-1 h-px bg-muted" />
                  </>
                )}
                
                {/* Reprocess option - hide for deleted images */}
                {contextMenu.image.status !== STATUSES.DELETED && (
                  <div
                    className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => handleOpenReprocess(contextMenu.image.id)}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      if (contextMenu.image.status !== STATUSES.IN_PROGRESS) {
                        handleOpenReprocess(contextMenu.image.id)
                      }
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reprocess
                  </div>
                )}
                
                {/* Amendment option - hide for deleted images */}
                {contextMenu.image.status !== STATUSES.DELETED && (
                  <div
                    className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => handleOpenAmendment(contextMenu.image.id)}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      // Allow amending: processed and amendment images (all except IN_PROGRESS and DELETED)
                      if (contextMenu.image.status !== STATUSES.IN_PROGRESS) {
                        handleOpenAmendment(contextMenu.image.id)
                      }
                    }}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Amendment
                  </div>
                )}
                
                {/* Delete option - hide for deleted images */}
                {contextMenu.image.status !== STATUSES.DELETED && (
                  <>
                    <div className="-mx-1 my-1 h-px bg-muted" />
                    <div
                      className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer text-destructive focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => handleDelete(contextMenu.image.id)}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleDelete(contextMenu.image.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Image View Modal with Before/After Slider */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          {viewingImage && (() => {
            const currentImage = images.find(img => img.id === viewingImage.id) || viewingImage
            
            // Get all versions including amendments, sorted by timestamp (newest first)
            const allVersions = [...(currentImage.versions || [])].sort((a, b) => {
              const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
              const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
              return dateB - dateA
            })
            
            // Filter out amendment versions for comparison slider
            const nonAmendmentVersions = allVersions.filter(v => !v.isAmendment && !v.amendmentInstruction)
            
            // Get the selected version (prioritize non-amendment versions for slider)
            const selectedVersion = nonAmendmentVersions.find(v => v.id === currentImage.selectedVersionId) || 
                                   nonAmendmentVersions.find(v => !v.isReprocess) ||
                                   nonAmendmentVersions[0] ||
                                   allVersions.find(v => v.id === currentImage.selectedVersionId) ||
                                   allVersions[0] ||
                                   null
            
            const beforeImage = currentImage.originalUrl
            const afterImage = selectedVersion?.processedUrl || currentImage.processedUrl
            
            // Get current version (the most recent active version)
            const currentVersion = allVersions.find(v => v.isActive && v.processedUrl) || allVersions[0]
            const isCurrentVersion = selectedVersion?.id === currentVersion?.id
            
            // Calculate version numbers for all versions (oldest = Version 1, newest = highest number)
            const versionNumbers = new Map()
            // Reverse the sorted array to get oldest first, then assign version numbers
            const versionsOldestFirst = [...allVersions].reverse()
            versionsOldestFirst.forEach((v, index) => {
              versionNumbers.set(v.id, index + 1)
            })

            // Find current image index for navigation within filtered images
            const currentImageIndex = filteredImages.findIndex(img => img.id === currentImage.id)
            
            // If current image is not in filtered images, don't render modal content
            // The useEffect will handle navigation or closing
            if (currentImageIndex === -1) {
              return (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )
            }

            const hasNext = currentImageIndex < filteredImages.length - 1
            const hasPrevious = currentImageIndex > 0

            const handleNext = () => {
              if (hasNext) {
                const nextImage = filteredImages[currentImageIndex + 1]
                setViewingImage(nextImage)
              } else {
                // No more images in filtered set, close modal
                setViewingImage(null)
              }
            }

            const handlePrevious = () => {
              if (hasPrevious) {
                const prevImage = filteredImages[currentImageIndex - 1]
                setViewingImage(prevImage)
              } else {
                // No more images in filtered set, close modal
                setViewingImage(null)
              }
            }

            return (
              <div className="flex flex-col h-full max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-lg font-semibold truncate">
                        {currentImage.originalName}
                      </DialogTitle>
                      {currentImage.status === STATUSES.AMENDMENT && currentImage.amendmentInstruction && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Amendment: {currentImage.amendmentInstruction.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="flex items-center gap-2">
                    {/* Navigation Buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={!hasPrevious}
                      className="h-9 w-9"
                      title="View previous output"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="h-9 w-9"
                      title="View next output"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            handleOpenReprocess(currentImage.id)
                          }}
                          disabled={currentImage.status === STATUSES.IN_PROGRESS}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reprocess
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            handleOpenAmendment(currentImage.id)
                          }}
                          disabled={currentImage.status === STATUSES.IN_PROGRESS}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          Amend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setViewingImage(null)
                            handleDelete(currentImage.id)
                          }}
                          disabled={currentImage.status === STATUSES.DELETED}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const imageUrl = afterImage || currentImage.originalUrl
                              if (!imageUrl) {
                                toast.error('No image URL available')
                                return
                              }
                              
                              toast.loading('Downloading image...', { id: 'download-viewing-image' })
                              
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
                              link.download = currentImage.originalName || `image-${currentImage.id}.jpg`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              window.URL.revokeObjectURL(url)
                              
                              toast.dismiss('download-viewing-image')
                              toast.success('Image downloaded')
                            } catch (error) {
                              console.error('Error downloading image:', error)
                              toast.dismiss('download-viewing-image')
                              toast.error(`Failed to download image: ${error.message || 'Unknown error'}`)
                            }
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingImage(null)}
                      className="h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 2-Column Layout */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left Column - Side by Side Layout */}
                  <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    <div className="grid grid-cols-[40%_60%] gap-4 h-full">
                      {/* Left: All Images List */}
                      <div className="flex flex-col min-h-0">
                        <ScrollArea className="h-[650px]">
                          <div className="space-y-3">
                            {images.map((image) => {
                              const fileSize = imageSizes[image.id] 
                                ? formatFileSize(imageSizes[image.id])
                                : 'N/A'
                              const fileType = getFileType(image.originalName, image.originalUrl)
                              
                              return (
                                <Card key={image.id} className="border-border">
                                  <CardContent className="p-4">
                                    <div className="flex gap-4">
                                      {/* Thumbnail */}
                                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                        {image.originalUrl ? (
                                          <Image
                                            src={image.originalUrl}
                                            alt={image.originalName}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center h-full">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* File Details */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate mb-1">
                                          {(image.originalName || `Image ${image.id}`).length > 20 
                                            ? (image.originalName || `Image ${image.id}`).substring(0, 20) + '...'
                                            : (image.originalName || `Image ${image.id}`)}
                                        </p>
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                          <p>File Size: {fileSize}</p>
                                          <p>File Type: {fileType}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Right: Processed Image */}
                      <div className="flex flex-col">
                        <div className="relative flex-1 rounded-lg overflow-hidden bg-muted min-h-[400px]">
                          {afterImage ? (
                            <Image
                              src={afterImage}
                              alt={currentImage.originalName || 'Processed image'}
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
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Instructions & Version Timeline */}
                  <div className="w-96 flex flex-col overflow-hidden min-h-0">
                    <div className="p-6 pl-2 flex flex-col h-full">
                      {/* Instruction */}
                      <Accordion 
                        type="single" 
                        collapsible 
                        className="w-full"
                        value={instructionAccordionOpen ? "instruction" : ""}
                        onValueChange={(value) => setInstructionAccordionOpen(value === "instruction")}
                      >
                        <AccordionItem value="instruction" className="border-none">
                          <AccordionTrigger className="text-sm font-semibold py-2 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <FileEdit className="h-4 w-4 text-muted-foreground" />
                              Instruction
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 rounded-lg bg-background border mb-4 max-h-[200px] overflow-y-auto">
                              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                {(() => {
                                  const instructionText = selectedVersion?.prompt || currentImage.instruction || 'No instructions provided'
                                  return truncateText(instructionText, 50)
                                })()}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Divider */}
                      <div className="border-t border-border my-4"></div>

                      {/* Version Timeline */}
                      <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center gap-2 mb-3">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-semibold">Version History</h3>
                        </div>
                        <ScrollArea className="flex-1">
                          <div className="space-y-2 pr-2">
                              {allVersions.length === 0 ? (
                                <div className="p-4 rounded-lg bg-background border text-center text-sm text-muted-foreground">
                                  No versions available
                                </div>
                              ) : (
                                allVersions.map((version, index) => {
                                const isSelected = version.id === selectedVersion?.id
                                const isActive = index === 0
                                const isReprocess = version.isReprocess
                                const isAmendment = version.isAmendment || version.amendmentInstruction
                                
                                return (
                                  <div
                                    key={version.id}
                                    onClick={() => !isSelected && handleSelectVersion(currentImage.id, version.id)}
                                    className={`
                                      p-2 rounded-lg border cursor-pointer transition-colors
                                      ${isSelected 
                                        ? 'bg-primary/10 border-primary shadow-sm' 
                                        : 'bg-background border-border hover:border-primary/50'
                                      }
                                    `}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          {isReprocess && (
                                            <RotateCcw className="h-3 w-3 text-muted-foreground" />
                                          )}
                                          {isAmendment && (
                                            <FileEdit className="h-3 w-3 text-muted-foreground" />
                                          )}
                                          {!isReprocess && !isAmendment && (
                                            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                                          )}
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">
                                              Version {versionNumbers.get(version.id) || 1}
                                            </span>
                                            {index === 0 && (
                                              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                                Current
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        {version.timestamp && (
                                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{new Date(version.timestamp).toLocaleString()}</span>
                                          </div>
                                        )}
                                        {version.prompt && (
                                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2">
                                            <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                            <p className="line-clamp-2">
                                              {version.prompt.substring(0, 80)}...
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      {isSelected && index !== 0 && version.id !== currentVersion?.id && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-xs gap-1.5"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (currentVersion) {
                                              handleSelectVersion(currentImage.id, currentVersion.id)
                                            }
                                          }}
                                          title="Rollback to current version"
                                        >
                                          <Undo2 className="h-3 w-3" />
                                          Rollback
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })
                            )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Reprocess Modal */}
      <Dialog open={reprocessModalOpen} onOpenChange={setReprocessModalOpen}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onKeyDown={(e) => {
            // Don't interfere with textarea keyboard shortcuts
            if (e.target.tagName === 'TEXTAREA') {
              const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
              const isModifierKey = isMac ? e.metaKey : e.ctrlKey
              if (isModifierKey) {
                const key = e.key.toLowerCase()
                if (key === 'a' || key === 'c' || key === 'v' || key === 'x') {
                  // Let the textarea handle these shortcuts
                  e.stopPropagation()
                }
              }
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Reprocess Image{selectedImages.size > 1 && selectedImages.has(reprocessImageId) ? ` (${selectedImages.size})` : ''}
            </DialogTitle>
            <DialogDescription>
              {selectedImages.size > 1 && selectedImages.has(reprocessImageId)
                ? `Enter or edit the processing instructions for reprocessing ${selectedImages.size} selected images`
                : 'Enter or edit the processing instructions for this reprocess'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  Processing Instructions
                </label>
                <span className="text-xs text-muted-foreground font-normal">
                  {reprocessPrompt.trim() ? reprocessPrompt.trim().split(/\s+/).filter(word => word.length > 0).length : 0} / 300 words
                </span>
              </div>
              <Textarea
                ref={reprocessTextareaRef}
                value={reprocessPrompt}
                onChange={(e) => {
                  const text = e.target.value
                  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
                  if (words.length <= 300 || text.length < reprocessPrompt.length) {
                    setReprocessPrompt(text)
                  }
                }}
                onKeyDown={(e) => {
                  // Handle Ctrl/Cmd+A (select all), Ctrl/Cmd+C (copy), Ctrl/Cmd+V (paste), Ctrl/Cmd+X (cut)
                  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
                  const isModifierKey = isMac ? e.metaKey : e.ctrlKey
                  
                  if (isModifierKey) {
                    const key = e.key.toLowerCase()
                    if (key === 'a') {
                      // Select all - use native method
                      e.preventDefault()
                      e.stopPropagation()
                      if (reprocessTextareaRef.current) {
                        reprocessTextareaRef.current.focus()
                        reprocessTextareaRef.current.select()
                      }
                    } else if (key === 'c' || key === 'x' || key === 'v') {
                      // Copy, Cut, or Paste - allow default browser behavior
                      // Don't stop propagation to let browser handle it naturally
                    }
                  }
                }}
                placeholder="Enter processing instructions... (e.g., enhance colors, adjust brightness, remove background)"
                rows={12}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can use the existing prompt or write new instructions for this reprocess
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReprocessModalOpen(false)
                setReprocessPrompt('')
                setReprocessImageId(null)
              }}
              disabled={isReprocessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReprocess}
              disabled={isReprocessing || !reprocessPrompt.trim()}
            >
              {isReprocessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reprocessing...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reprocess
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Amendment Modal */}
      <Dialog open={amendmentModalOpen} onOpenChange={setAmendmentModalOpen}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onKeyDown={(e) => {
            // Don't interfere with textarea keyboard shortcuts
            if (e.target.tagName === 'TEXTAREA') {
              const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
              const isModifierKey = isMac ? e.metaKey : e.ctrlKey
              if (isModifierKey) {
                const key = e.key.toLowerCase()
                if (key === 'a' || key === 'c' || key === 'v' || key === 'x') {
                  // Let the textarea handle these shortcuts
                  e.stopPropagation()
                }
              }
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedImages.size > 1 && selectedImages.has(amendmentImageId) 
                ? `Add Amendment (${selectedImages.size} images)` 
                : 'Add Amendment'}
            </DialogTitle>
            <DialogDescription>
              {selectedImages.size > 1 && selectedImages.has(amendmentImageId)
                ? `Enter instructions for amending ${selectedImages.size} selected images`
                : 'Enter instructions for amending this image'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  Amendment Instructions
                </label>
              </div>
              <Textarea
                value={amendmentInstruction}
                onChange={(e) => setAmendmentInstruction(e.target.value)}
                placeholder="Enter amendment instructions..."
                rows={12}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAmendmentModalOpen(false)
                setAmendmentInstruction('')
                setAmendmentImageId(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyAmendment} disabled={isApplyingAmendment || !amendmentInstruction.trim()}>
              {isApplyingAmendment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Apply Amendment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Reprocess Limit Reached
            </DialogTitle>
            <DialogDescription>
              You&apos;ve reached the maximum number of reprocesses allowed for your current {getUserPlan()} plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className={`flex items-start gap-3 ${getUserPlan() === 'Starter' ? 'opacity-50' : ''}`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Starter Plan</p>
                    {getUserPlan() === 'Starter' && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">10 reprocesses per image</p>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 ${getUserPlan() === 'Pro' ? 'opacity-50' : ''}`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Pro Plan</p>
                    {getUserPlan() === 'Pro' && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">10 reprocesses per image</p>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 ${getUserPlan() === 'Enterprise' ? 'opacity-50' : ''}`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Enterprise Plan</p>
                    {getUserPlan() === 'Enterprise' && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Unlimited reprocesses</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {getUserPlan() === 'Enterprise' 
                ? 'You already have unlimited reprocesses. Please contact support if you need assistance.'
                : 'Upgrade your plan to unlock more reprocesses per image and access additional features.'
              }
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
              Cancel
            </Button>
            {getUserPlan() !== 'Enterprise' && (
              <Button onClick={() => {
                setUpgradeModalOpen(false)
                window.open('/pricing', '_blank', 'noopener,noreferrer')
              }}>
                Upgrade Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reload Warning Modal */}
      <Dialog open={reloadWarningModalOpen} onOpenChange={setReloadWarningModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Unconfirmed Order
            </DialogTitle>
            <DialogDescription>
              You have {confirmableImagesCount} image{confirmableImagesCount !== 1 ? 's' : ''} ready to confirm. If you leave this page, you&apos;ll need to come back to confirm your order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {navigationIntent === 'back' 
                ? 'Are you sure you want to go back? We recommend confirming your order before leaving this page.'
                : navigationIntent === 'reload'
                ? 'Are you sure you want to reload? We recommend confirming your order before refreshing this page.'
                : navigationIntent === 'tab'
                ? 'You switched to another tab. We recommend confirming your order before navigating away from this page.'
                : navigationIntent === 'navigate'
                ? 'Are you sure you want to leave? We recommend confirming your order before navigating away from this page.'
                : 'Are you sure you want to leave? We recommend confirming your order before navigating away.'
              }
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setReloadWarningModalOpen(false)
                setNavigationIntent(null)
              }}
            >
              Stay on Page
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                allowLeaveRef.current = true
                const intendedPath = pendingTabSwitchRef.current
                setReloadWarningModalOpen(false)
                setNavigationIntent(null)
                pendingTabSwitchRef.current = null
                
                // If this was triggered by navbar navigation, navigate to the intended path
                if (intendedPath && typeof intendedPath === 'string' && intendedPath.startsWith('/')) {
                  // Clear any pending orders to start fresh
                  try {
                    await removePendingOrder()
                  } catch (error) {
                    console.error('Error clearing pending order:', error)
                  }
                  
                  // Navigate to the intended path
                  setTimeout(() => {
                    router.push(intendedPath)
                    // Reset after a delay to allow navigation to complete
                    setTimeout(() => {
                      allowLeaveRef.current = false
                    }, 500)
                  }, 100)
                } else {
                  // For other navigation intents (back, reload, tab), navigate to upload page
                  try {
                    await removePendingOrder()
                  } catch (error) {
                    console.error('Error clearing pending order:', error)
                  }
                  
                  setTimeout(() => {
                    router.push('/upload')
                    setTimeout(() => {
                      allowLeaveRef.current = false
                    }, 500)
                  }, 100)
                }
              }}
            >
              Leave Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Tooltip - Fixed Bottom Right */}
      <div className={`fixed right-6 z-[60] ${confirmableImagesCount > 0 ? 'bottom-24' : 'bottom-6'} transition-all duration-300`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-muted"
              >
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent 
            className="max-w-md max-h-[80vh] p-4 overflow-y-auto" 
            side="left"
            sideOffset={8}
            align="start"
            avoidCollisions={true}
            collisionPadding={16}
          >
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Filter & View</h4>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Filter images by status: All Images (processed and in progress), Deleted, or Amendment</li>
                  <li>View image counts for each status category</li>
                  <li>Click on processed images to view them in detail</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Selection & Bulk Actions</h4>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Select individual images or use &quot;Select All&quot; to select all filtered images</li>
                  <li>Reprocess Selected: Reprocess the first selected image with new instructions</li>
                  <li>Amend Selected: Apply amendments to selected images with custom instructions</li>
                  <li>Delete Selected: Remove selected images (can be undone)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Image Actions</h4>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Right-click on images for context menu with actions</li>
                  <li>Reprocess: Create a new version with updated processing instructions</li>
                  <li>Amendment: Request changes to processed images</li>
                  <li>Delete: Remove images (can be undone)</li>
                  <li>View multiple versions and compare before/after</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Management</h4>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Confirm Order: Finalize and save your processed images</li>
                  <li>View processing progress in real-time</li>
                  <li>Undo actions for deleted or amended images</li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    const firstProcessed = images.find(img => 
                      img.status === STATUSES.PROCESSED && img.processedUrl
                    )
                    if (firstProcessed) {
                      setWalkthroughTargetId(firstProcessed.id)
                      setWalkthroughOpen(true)
                    }
                  }}
                >
                  <MousePointer2 className="h-4 w-4" />
                  Show Interactive Tour
                </Button>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Image Walkthrough */}
      <ImageWalkthrough
        isOpen={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
        targetImageId={walkthroughTargetId}
      />
      </div>
    </div>
    </TooltipProvider>
  )
}

export default function ProcessingResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <AuthenticatedNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ProcessingResultsContent />
    </Suspense>
  )
}

