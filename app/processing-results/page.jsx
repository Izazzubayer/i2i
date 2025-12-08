'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { BeforeAfterSliderImproved } from '@/components/BeforeAfterSliderImproved'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { getOrderDetails, confirmOrder } from '@/api'

const STATUSES = {
  PROCESSED: 'processed',
  IN_PROGRESS: 'in_progress',
  DELETED: 'deleted',
  AMENDMENT: 'amendment',
}

function ProcessingResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId')
  const { batch, updateImageStatus, addOrder, damConnections, activeDamConnection } = useStore()
  const [images, setImages] = useState([])
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')
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
  const contextMenuRef = useRef(null)
  const processingStartedRef = useRef(false)
  const imageHistoryRef = useRef(new Map()) // Store previous states for undo
  const allowLeaveRef = useRef(false) // Track if user confirmed leaving
  const pollIntervalRef = useRef(null) // Poll interval for order updates

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
        return 3
      case 'Pro':
        return 10
      case 'Enterprise':
        return Infinity // Unlimited
      default:
        return 3
    }
  }, [])

  // Fetch order details from API and poll for updates
  useEffect(() => {
    if (!orderId) {
      // Fallback to batch if no orderId
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
        setLoading(false)
      } else {
        setLoading(false)
      }
      return
    }

    let isMounted = true

    const fetchOrderData = async () => {
      try {
        if (!isMounted) return
        
        setLoading(true)
        setError(null)
        
        const orderDetails = await getOrderDetails(orderId, { expirationMinutes: 60 })
        
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
          setLoading(false)
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

  // Show toast notifications when images finish processing (only for API-based orders)
  useEffect(() => {
    if (!orderId || images.length === 0) return

    const processedImages = images.filter((img) => 
      img.status === STATUSES.PROCESSED && 
      img.processedUrl &&
      !img._notified
    )

    processedImages.forEach((img) => {
      // Mark as notified
      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id ? { ...i, _notified: true } : i
        )
      )
            
            toast.success(
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-black dark:text-white">
                    {img.originalName || 'Image'} processed
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Processing completed successfully
                  </p>
                </div>
              </div>,
              { duration: 2000 }
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
    if (selectedStatusFilter === 'all') return images
    return images.filter((img) => img.status === selectedStatusFilter)
  }, [images, selectedStatusFilter])

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      all: images.length,
      processed: images.filter((img) => img.status === STATUSES.PROCESSED).length,
      in_progress: images.filter((img) => img.status === STATUSES.IN_PROGRESS).length,
      deleted: images.filter((img) => img.status === STATUSES.DELETED).length,
      amendment: images.filter((img) => img.status === STATUSES.AMENDMENT).length,
    }
  }, [images])

  // Check if all images in current filter are selected
  const allSelected = useMemo(() => {
    return filteredImages.length > 0 && filteredImages.every((img) => selectedImages.has(img.id))
  }, [filteredImages, selectedImages])

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
    if (imagesToDelete.length > 1) {
      setSelectedImages((prev) => {
        const newSet = new Set(prev)
        imagesToDelete.forEach(id => newSet.delete(id))
        return newSet
      })
      toast.success(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              {imagesToDelete.length} images deleted
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              You can undo this action
            </p>
          </div>
        </div>
      )
    } else {
      toast.success(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Image deleted
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              You can undo this action
            </p>
          </div>
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
          <Badge variant="outline" className="border-border text-foreground bg-muted">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            In Progress
          </Badge>
        )
      case STATUSES.DELETED:
        return (
          <Badge variant="outline" className="border-border text-foreground bg-muted">Deleted</Badge>
        )
      case STATUSES.AMENDMENT:
        return (
          <Badge variant="outline" className="border-border text-foreground bg-muted">
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

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnconfirmedOrder])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNav />
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
        <AuthenticatedNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{error || 'No order found'}</p>
            <Button onClick={() => router.push('/orders')} className="mt-4">
              Go to Orders
            </Button>
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
        <AuthenticatedNav />

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 py-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                animate={{ 
                  y: [0, -3, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <h1 className="text-3xl font-bold tracking-tight">Processing Results</h1>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" onClick={() => router.push('/')}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </motion.div>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStatusFilter === 'all' ? 'ring-2 ring-foreground' : ''
                }`}
                onClick={() => setSelectedStatusFilter('all')}
              >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStatusFilter === 'all'}
                      onCheckedChange={() => setSelectedStatusFilter('all')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-2xl font-bold">{statusCounts.all}</p>
                      <p className="text-xs text-muted-foreground">All Images</p>
                    </div>
                  </div>
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStatusFilter === STATUSES.PROCESSED ? 'ring-2 ring-foreground' : ''
                }`}
                onClick={() => setSelectedStatusFilter(STATUSES.PROCESSED)}
              >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStatusFilter === STATUSES.PROCESSED}
                      onCheckedChange={() => setSelectedStatusFilter(STATUSES.PROCESSED)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {statusCounts.processed}
                      </p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-foreground" />
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStatusFilter === STATUSES.IN_PROGRESS ? 'ring-2 ring-foreground' : ''
                }`}
                onClick={() => setSelectedStatusFilter(STATUSES.IN_PROGRESS)}
              >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStatusFilter === STATUSES.IN_PROGRESS}
                      onCheckedChange={() => setSelectedStatusFilter(STATUSES.IN_PROGRESS)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {statusCounts.in_progress}
                      </p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                  <Loader2 className={`h-5 w-5 text-foreground ${statusCounts.in_progress > 0 ? 'animate-spin' : ''}`} />
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStatusFilter === STATUSES.DELETED ? 'ring-2 ring-foreground' : ''
                }`}
                onClick={() => setSelectedStatusFilter(STATUSES.DELETED)}
              >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStatusFilter === STATUSES.DELETED}
                      onCheckedChange={() => setSelectedStatusFilter(STATUSES.DELETED)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {statusCounts.deleted}
                      </p>
                      <p className="text-xs text-muted-foreground">Deleted</p>
                    </div>
                  </div>
                  <Trash2 className="h-5 w-5 text-foreground" />
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStatusFilter === STATUSES.AMENDMENT ? 'ring-2 ring-foreground' : ''
                }`}
                onClick={() => setSelectedStatusFilter(STATUSES.AMENDMENT)}
              >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStatusFilter === STATUSES.AMENDMENT}
                      onCheckedChange={() => setSelectedStatusFilter(STATUSES.AMENDMENT)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {statusCounts.amendment}
                      </p>
                      <p className="text-xs text-muted-foreground">Amendment</p>
                    </div>
                  </div>
                  <FileEdit className="h-5 w-5 text-foreground" />
                </div>
              </CardContent>
            </Card>
            </motion.div>
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    {selectedImages.size} selected
                  </Badge>
                </motion.div>
                
                {/* Bulk Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAmendment()}
                      disabled={Array.from(selectedImages).every(id => {
                        const img = images.find(i => i.id === id)
                        return img?.status === STATUSES.IN_PROGRESS
                      })}
                      className="gap-2"
                    >
                      <FileEdit className="h-4 w-4" />
                      Amend Selected
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
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
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </Button>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <Card
                  className={`overflow-hidden transition-all hover:shadow-xl cursor-pointer ${
                    selectedImages.has(image.id) ? 'ring-2 ring-foreground shadow-lg' : ''
                  } ${image.status === STATUSES.DELETED ? 'opacity-50' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, image)}
                  onClick={() => {
                    // Allow viewing processed images and amendments (amendments are in their own section)
                    if (image.status === STATUSES.PROCESSED || image.status === STATUSES.AMENDMENT) {
                      setViewingImage(image)
                    }
                  }}
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
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
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                        {/* Show original image faded when deleted */}
                        {image.originalUrl && (
                          <div className="absolute inset-0 opacity-20">
                            <Image
                              src={image.originalUrl}
                              alt={image.originalName}
                              fill
                              className="object-cover grayscale"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        )}
                        <Trash2 className="h-12 w-12 text-muted-foreground relative z-10" />
                      </div>
                    ) : displayImageUrl ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={displayImageUrl}
                          alt={image.originalName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Badge indicating if showing original vs processed */}
                        {!displayProcessedUrl && displayImageUrl && (
                          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
                            Original
                          </div>
                        )}
                      </motion.div>
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

                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        className="bg-black/50 backdrop-blur-sm rounded p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleImageSelection(image.id)
                        }}
                      >
                        {selectedImages.has(image.id) ? (
                          <CheckSquare className="h-5 w-5 text-white" />
                        ) : (
                          <Square className="h-5 w-5 text-white/70" />
                        )}
                      </div>
                    </div>

                    {/* Version Count Badge */}
                    {image.versions && image.versions.length > 1 && (
                      <motion.div 
                        className="absolute top-2 right-2 z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Badge variant="secondary" className="gap-1">
                          <RotateCcw className="h-3 w-3" />
                          {image.versions.length} versions
                        </Badge>
                      </motion.div>
                    )}

                    {/* Status Badge - Only show for non-processed images */}
                    {image.status !== STATUSES.PROCESSED && image.status !== STATUSES.AMENDMENT && (
                      <motion.div 
                        className="absolute top-2 right-2 z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {getStatusBadge(image.status)}
                      </motion.div>
                    )}

                    {/* Status Icon Overlay */}
                    <motion.div 
                      className="absolute bottom-2 left-2 z-10"
                      animate={image.status === STATUSES.IN_PROGRESS ? {
                        y: [0, -5, 0],
                      } : {}}
                      transition={image.status === STATUSES.IN_PROGRESS ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                    >
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                        {getStatusIcon(image.status)}
                      </div>
                    </motion.div>

                    {/* Undo Button for Deleted/Amendment */}
                    {(image.status === STATUSES.DELETED || image.status === STATUSES.AMENDMENT) && (
                      <motion.div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="lg"
                            variant="secondary"
                            className="gap-2 shadow-lg bg-background/95"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUndo(image.id)
                            }}
                          >
                            <Undo2 className="h-5 w-5" />
                            Undo
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Hover Overlay */}
                    {image.status !== STATUSES.IN_PROGRESS && image.status !== STATUSES.DELETED && image.status !== STATUSES.AMENDMENT && (
                      <motion.div 
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="flex gap-2"
                          initial={{ scale: 0.8, y: 10 }}
                          whileHover={{ scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-12 w-12 rounded-full shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingImage(image)
                              }}
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{image.originalName}</p>
                    {image.amendmentInstruction && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Amendment: {image.amendmentInstruction.substring(0, 30)}...
                      </p>
                    )}
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
            {/* Undo option for deleted/amendment */}
            {(contextMenu.image.status === STATUSES.DELETED || contextMenu.image.status === STATUSES.AMENDMENT) && (
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
            <div
              className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleOpenAmendment(contextMenu.image.id)}
              onMouseDown={(e) => {
                e.stopPropagation()
                // Allow amending: processed, deleted, and amendment images (all except IN_PROGRESS)
                if (contextMenu.image.status !== STATUSES.IN_PROGRESS) {
                  handleOpenAmendment(contextMenu.image.id)
                }
              }}
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Amendment
            </div>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <div
              className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer text-destructive focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleDelete(contextMenu.image.id)}
              onMouseDown={(e) => {
                e.stopPropagation()
                // Allow deleting: processed, in_progress, and amendment images (all except already deleted)
                if (contextMenu.image.status !== STATUSES.DELETED) {
                  handleDelete(contextMenu.image.id)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </div>
          </div>
        </motion.div>
      )}

      {/* Image View Modal with Before/After Slider */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingImage?.originalName}</DialogTitle>
            <DialogDescription>
              {viewingImage?.status === STATUSES.AMENDMENT && viewingImage?.amendmentInstruction && (
                <p className="mt-2 text-sm">Amendment: {viewingImage.amendmentInstruction}</p>
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingImage && (() => {
            const currentImage = images.find(img => img.id === viewingImage.id) || viewingImage
            
            // Filter out amendment versions - amendments are in their own section
            const nonAmendmentVersions = currentImage.versions?.filter(v => !v.isAmendment && !v.amendmentInstruction) || []
            
            // Get the selected version (from non-amendment versions)
            const selectedVersion = nonAmendmentVersions.find(v => v.id === currentImage.selectedVersionId) || 
                                   nonAmendmentVersions.find(v => !v.isReprocess) || // Fallback to original
                                   currentImage.versions?.find(v => v.id === currentImage.selectedVersionId) || // Fallback to any version
                                   currentImage.versions?.[0] // Final fallback to first version
            
            // Always use: before = originalUrl, after = selected version's processedUrl
            // This ensures consistent structure for all versions
            const beforeImage = currentImage.originalUrl
            const afterImage = selectedVersion?.processedUrl || currentImage.processedUrl

            return (
              <>
                {/* Version Selector - Only show Original and Reprocess versions, NOT amendments */}
                {nonAmendmentVersions.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <p className="text-sm font-medium">Select Version to Compare:</p>
                    <div className="flex flex-wrap gap-2">
                      {nonAmendmentVersions.map((version, index) => {
                        const reprocessIndex = nonAmendmentVersions
                          .slice(0, index + 1)
                          .filter(v => v.isReprocess).length
                        
                        return (
                          <motion.div
                            key={version.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant={currentImage.selectedVersionId === version.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSelectVersion(currentImage.id, version.id)}
                              className="gap-2"
                            >
                              {version.isReprocess ? (
                                <>
                                  <RotateCcw className="h-3 w-3" />
                                  Reprocess {reprocessIndex}
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Original Processed
                                </>
                              )}
                              {currentImage.selectedVersionId === version.id && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                            </Button>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* Show prompt for selected version - Only for reprocess, not amendments */}
                {(() => {
                  // Only show prompt for reprocess versions, not amendments (amendments are in their own section)
                  if (selectedVersion?.prompt && selectedVersion?.isReprocess && !selectedVersion?.isAmendment && !selectedVersion?.amendmentInstruction) {
                    return (
                      <div className="mb-4 p-3 rounded-lg bg-muted border">
                        <p className="text-xs font-medium mb-1 text-muted-foreground">
                          Reprocess Instructions
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {selectedVersion.prompt}
                        </p>
                      </div>
                    )
                  }
                  return null
                })()}
                
                {/* Show amendment instruction if viewing an amendment image */}
                {currentImage.status === STATUSES.AMENDMENT && currentImage.amendmentInstruction && (
                  <div className="mb-4 p-3 rounded-lg bg-muted border">
                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                      Amendment Instructions
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {currentImage.amendmentInstruction}
                    </p>
                  </div>
                )}

                {/* Before/After Slider - Consistent structure for ALL versions */}
                {/* Before = Original Raw Image, After = Selected Version's Processed Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  {beforeImage && afterImage ? (
                    <BeforeAfterSliderImproved
                      beforeImage={beforeImage}
                      afterImage={afterImage}
                    />
                  ) : beforeImage ? (
                    <Image
                      src={beforeImage}
                      alt={currentImage.originalName}
                      fill
                      className="object-contain"
                    />
                  ) : afterImage ? (
                    <Image
                      src={afterImage}
                      alt={currentImage.originalName}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>
              </>
            )
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingImage(null)}>
              Close
            </Button>
            {viewingImage && (
              <Button
                onClick={async () => {
                  try {
                    const imageUrl = viewingImage.processedUrl || viewingImage.originalUrl
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
                    link.download = viewingImage.originalName || `image-${viewingImage.id}.jpg`
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
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reprocess Modal */}
      <Dialog open={reprocessModalOpen} onOpenChange={setReprocessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprocess Image</DialogTitle>
            <DialogDescription>
              Enter or edit the processing instructions for this reprocess
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Processing Instructions
              </label>
              <Textarea
                value={reprocessPrompt}
                onChange={(e) => setReprocessPrompt(e.target.value)}
                placeholder="Enter processing instructions... (e.g., enhance colors, adjust brightness, remove background)"
                rows={6}
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
        <DialogContent>
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
            <Textarea
              value={amendmentInstruction}
              onChange={(e) => setAmendmentInstruction(e.target.value)}
              placeholder="Enter amendment instructions..."
              rows={6}
            />
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
                  <p className="text-xs text-muted-foreground">3 reprocesses per image</p>
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
                router.push('/pricing')
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
                : 'Are you sure you want to  leave? We recommend confirming your order before navigating away.'
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
              onClick={() => {
                allowLeaveRef.current = true
                const intent = navigationIntent
                setReloadWarningModalOpen(false)
                setNavigationIntent(null)
                
                // Execute the intended action based on what triggered the modal
                setTimeout(() => {
                  if (intent === 'reload') {
                    window.location.reload()
                  } else if (intent === 'back') {
                    // Allow back navigation
                    window.history.back()
                  } else {
                    // Default: go to home
                    router.push('/')
                  }
                  // Reset after a delay to allow navigation to complete
                  setTimeout(() => {
                    allowLeaveRef.current = false
                  }, 500)
                }, 100)
              }}
            >
              Leave Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
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

