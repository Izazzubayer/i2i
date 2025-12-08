'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Package,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ArrowUpDown,
  CalendarDays,
  Cloud,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import DamConnectDialog from '@/components/DamConnectDialog'
import DamSelectionDialog from '@/components/DamSelectionDialog'

const STATUSES = {
  ALL: 'all',
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  QUEUED: 'queued',
  FAILED: 'failed',
}

const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  NAME: 'name',
  IMAGES: 'images',
  SIZE: 'size',
  IMAGES: 'images',
}

export default function OrdersPage() {
  const router = useRouter()
  const { orders, deleteOrder, restoreOrder, addDamConnection, activeDamConnection, damConnections, setActiveDamConnection, removeDamConnection } = useStore()
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUSES.ALL)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST)
  const [dateRange, setDateRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [selectedOrderForDAM, setSelectedOrderForDAM] = useState(null)
  const [uploadingToDAM, setUploadingToDAM] = useState(false)
  const [selectedDamsForOrder, setSelectedDamsForOrder] = useState({}) // Track selected DAMs per order
  const [downloadingOrder, setDownloadingOrder] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deletedOrder, setDeletedOrder] = useState(null) // Store deleted order for undo
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false)
  const [selectedOrderInstructions, setSelectedOrderInstructions] = useState(null)

  // Check authentication status - same logic as Navbar
  useEffect(() => {
    setMounted(true)
    
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      
      const authToken = localStorage.getItem('authToken')
      
      // SIMPLE RULE: If token exists, user is authenticated
      // Token is only given after successful signin, so it's the primary indicator
      if (authToken) {
        console.log('✅ Orders page: User authenticated (token found)')
        setIsAuthenticated(true)
      } else {
        console.log('❌ Orders page: Not authenticated (no token)')
        setIsAuthenticated(false)
      }
    }

    // Initial check
    checkAuth()
    
    // Also check after short delays to catch data stored just before page load
    const delayedCheck1 = setTimeout(() => {
      checkAuth()
    }, 100)
    
    const delayedCheck2 = setTimeout(() => {
      checkAuth()
    }, 500)
    
    // Listen for auth changes
    const handleStorageChange = () => {
      console.log('🔄 Orders page: localStorageChange event detected')
      checkAuth()
    }
    
    const handleStorageEvent = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        console.log('🔄 Orders page: Storage event detected', e.key)
        checkAuth()
      }
    }
    
    window.addEventListener('localStorageChange', handleStorageChange)
    window.addEventListener('storage', handleStorageEvent)
    
    // Also check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Orders page: Page visible - checking auth')
        checkAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearTimeout(delayedCheck1)
      clearTimeout(delayedCheck2)
      window.removeEventListener('localStorageChange', handleStorageChange)
      window.removeEventListener('storage', handleStorageEvent)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Mock orders if store is empty (for demo)
  const allOrders = useMemo(() => {
    if (orders.length === 0) {
      return [
        {
          id: 'ORD-2024-001',
          name: 'Product Catalog 2024',
          images: 120,
          status: 'completed',
          createdAt: '2024-11-10T14:30:00',
          completedAt: '2024-11-10T15:45:00',
          images: 120,
          tokens: 2400,
          size: '4.2 GB',
          instructions: 'Remove background, enhance colors, resize to 1920x1080',
          processedCount: 120,
          approvedCount: 115,
          retouchCount: 5,
          failedCount: 0,
        },
        {
          id: 'ORD-2024-002',
          name: 'Website Hero Images',
          images: 45,
          status: 'processing',
          createdAt: '2024-11-10T16:00:00',
          progress: 67,
          images: 45,
          tokens: 900,
          size: '1.8 GB',
          instructions: 'Enhance contrast, remove noise, optimize for web',
          processedCount: 30,
          approvedCount: 25,
          retouchCount: 5,
          failedCount: 0,
        },
        {
          id: 'ORD-2024-003',
          name: 'Marketing Campaign',
          images: 85,
          status: 'completed',
          createdAt: '2024-11-09T10:15:00',
          completedAt: '2024-11-09T12:30:00',
          images: 85,
          tokens: 1700,
          size: '3.1 GB',
          instructions: 'Color correction, background removal, smart cropping',
          processedCount: 85,
          approvedCount: 82,
          retouchCount: 3,
          failedCount: 0,
        },
        {
          id: 'ORD-2024-004',
          name: 'Social Media Content',
          images: 30,
          status: 'failed',
          createdAt: '2024-11-08T09:00:00',
          error: 'Processing timeout',
          images: 15,
          tokens: 300,
          size: '890 MB',
          instructions: 'Resize to social media formats, add branding',
          processedCount: 15,
          approvedCount: 12,
          retouchCount: 0,
          failedCount: 15,
        },
        {
          id: 'ORD-2024-005',
          name: 'E-commerce Product Shots',
          images: 200,
          status: 'completed',
          createdAt: '2024-11-07T08:00:00',
          completedAt: '2024-11-07T11:20:00',
          images: 200,
          tokens: 4000,
          size: '6.8 GB',
          instructions: 'White background, consistent lighting, product isolation',
          processedCount: 200,
          approvedCount: 195,
          retouchCount: 5,
          failedCount: 0,
        },
        {
          id: 'ORD-2024-006',
          name: 'Blog Images',
          images: 15,
          status: 'queued',
          createdAt: '2024-11-10T17:00:00',
          images: 15,
          tokens: 300,
          size: '520 MB',
          instructions: 'Optimize for web, compress without quality loss',
          processedCount: 0,
          approvedCount: 0,
          retouchCount: 0,
          failedCount: 0,
        },
      ]
    }
    return orders
  }, [orders])

  const filteredOrders = useMemo(() => {
    let filtered = allOrders.filter(order => {
      const matchesSearch =
        order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.instructions?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === STATUSES.ALL || order.status === statusFilter
      
      // Date range filter
      let matchesDate = true
      if (dateRange !== 'all') {
        const orderDate = new Date(order.createdAt)
        const now = new Date()
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24))
        
        switch (dateRange) {
          case 'today':
            matchesDate = daysDiff === 0
            break
          case 'week':
            matchesDate = daysDiff <= 7
            break
          case 'month':
            matchesDate = daysDiff <= 30
            break
          case 'year':
            matchesDate = daysDiff <= 365
            break
          default:
            matchesDate = true
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate
    })

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.OLDEST:
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case SORT_OPTIONS.NAME:
          return (a.name || '').localeCompare(b.name || '')
        case SORT_OPTIONS.IMAGES:
          return (b.images || 0) - (a.images || 0)
        case SORT_OPTIONS.SIZE:
          // Simple size comparison (assuming format like "4.2 GB")
          const sizeA = parseFloat(a.size || '0')
          const sizeB = parseFloat(b.size || '0')
          return sizeB - sizeA
        case SORT_OPTIONS.IMAGES:
          return (b.images || 0) - (a.images || 0)
        case SORT_OPTIONS.NEWEST:
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [allOrders, searchQuery, statusFilter, sortBy, dateRange])

  const ordersByStatus = useMemo(
    () => ({
      all: allOrders.length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      processing: allOrders.filter(o => o.status === 'processing').length,
      queued: allOrders.filter(o => o.status === 'queued').length,
      failed: allOrders.filter(o => o.status === 'failed').length,
    }),
    [allOrders]
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'queued':
        return <Clock className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status) => {
    const icons = {
      completed: <CheckCircle2 className="h-3 w-3" />,
      processing: <Loader2 className="h-3 w-3 animate-spin" />,
      queued: <Clock className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
    }

    const label = status.charAt(0).toUpperCase() + status.slice(1)
    
    const statusStyles = {
      completed: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400',
      processing: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
      queued: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
      failed: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400',
    }
    
    return (
      <Badge 
        variant="outline" 
        className={`${statusStyles[status] || 'border-border bg-muted/50 text-foreground'} gap-1.5`}
      >
        {icons[status] || <AlertCircle className="h-3 w-3" />}
        {label}
      </Badge>
    )
  }

  const handleConnectDAM = useCallback((order) => {
    setSelectedOrderForDAM(order)
    // Show the DAM selection dialog (it handles empty state and allows adding)
    setDamDialogOpen(true)
  }, [])

  const handleUploadToDAM = useCallback(async (order, damConnection = null) => {
    const connection = damConnection || activeDamConnection
    if (!connection) {
      toast.error('No DAM connection configured')
      setDamDialogOpen(true)
      return
    }

    if (!order.imagesData || order.imagesData.length === 0) {
      toast.error('No images to upload')
      return
    }

    setUploadingToDAM(true)
    try {
      // Get processed images (not deleted)
      const processedImages = order.imagesData.filter(img => 
        img.status !== 'deleted' && img.processedUrl
      )

      if (processedImages.length === 0) {
        toast.error('No processed images to upload')
        setUploadingToDAM(false)
        return
      }

      toast.loading(`Uploading ${processedImages.length} images to DAM...`)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.dismiss()
      toast.success(`Successfully uploaded ${processedImages.length} images to ${connection.name || 'DAM'}`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to upload images to DAM')
      console.error('DAM upload error:', error)
    } finally {
      setUploadingToDAM(false)
    }
  }, [activeDamConnection, setDamDialogOpen])

  const handleSelectDam = useCallback((connection) => {
    // Handle both single connection and array of connections
    const connections = Array.isArray(connection) ? connection : [connection]
    
    setActiveDamConnection(connections[0]) // Set first as active
    
    // Store selected DAMs for the order
    if (selectedOrderForDAM) {
      setSelectedDamsForOrder(prev => ({
        ...prev,
        [selectedOrderForDAM.id]: connections
      }))
    }
    
    setDamDialogOpen(false)
    
    // If there's a selected order, automatically upload to the selected DAMs
    if (selectedOrderForDAM && connections.length > 0) {
      handleUploadToDAM(selectedOrderForDAM, connections[0])
    }
  }, [selectedOrderForDAM, setActiveDamConnection, handleUploadToDAM, setDamDialogOpen])

  const handleAddDam = useCallback((connection) => {
    addDamConnection(connection.config || connection)
  }, [addDamConnection])

  const handleRemoveDam = useCallback((connectionId) => {
    removeDamConnection(connectionId)
  }, [removeDamConnection])

  const handleDownloadOrder = useCallback(async (order) => {
    setDownloadingOrder(order.id)
    try {
      toast.loading(`Preparing download for ${order.name || order.id}...`)

      // Simulate API call to prepare download
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Get all processed images
      const imagesToDownload = order.imagesData?.filter(img => 
        img.status !== 'deleted' && img.processedUrl
      ) || []

      if (imagesToDownload.length === 0) {
        toast.error('No images to download')
        setDownloadingOrder(null)
        return
      }

      // Create a zip file (simulated)
      toast.dismiss()
      toast.success(`Download started: ${imagesToDownload.length} image(s) from ${order.name || order.id}`)
      
      // In a real app, this would trigger an actual download
      // For now, we'll just show success
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download order')
      console.error('Download error:', error)
    } finally {
      setDownloadingOrder(null)
    }
  }, [])

  const handleDeleteOrder = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setOrderToDelete(order)
      setDeleteDialogOpen(true)
    }
  }, [orders])

  const confirmDeleteOrder = useCallback(() => {
    if (!orderToDelete) return
    
    // Store the order for potential undo
    const orderToRestore = { ...orderToDelete }
    setDeletedOrder(orderToRestore)
    
    // Delete the order
    deleteOrder(orderToDelete.id)
    
    // Close dialog
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
    
    // Show toast with undo option
    const toastId = toast.success('Order deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore the order
          handleUndoDelete(orderToRestore)
          toast.dismiss(toastId)
        },
      },
      duration: 5000, // Show for 5 seconds
    })
  }, [orderToDelete, deleteOrder])

  const handleUndoDelete = useCallback((order) => {
    if (!order) return
    
    // Restore the order using the store's restoreOrder function
    restoreOrder(order)
    
    toast.success('Order restored')
    setDeletedOrder(null)
  }, [restoreOrder])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter(STATUSES.ALL)
    setSortBy(SORT_OPTIONS.NEWEST)
    setDateRange('all')
  }, [])

  const formatOrderId = (id) => {
    if (!id) return 'ORD-UNKNOWN'
    return id.startsWith('ORD-') ? id : `ORD-${id}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Show loading state during mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // If not authenticated, show message and redirect option
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-3xl font-bold mb-2">Sign in to view your orders</h1>
              <p className="text-muted-foreground mb-6">
                You need to be signed in to view and manage your image processing orders.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/sign-in')}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => router.push('/sign-up')}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sticky Header */}
      <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your image processing orders
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild>
                <Link href="/upload">
                  <Package className="mr-2 h-4 w-4" />
                  New Order
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Status Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { label: 'All Orders', value: ordersByStatus.all, icon: Package },
            { label: 'Completed', value: ordersByStatus.completed, icon: CheckCircle2 },
            { label: 'Processing', value: ordersByStatus.processing, icon: Loader2 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-semibold">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Main Search and Quick Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search orders by name, ID, or instructions..."
                      className="pl-10 border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] border-border">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={STATUSES.ALL}>All Status</SelectItem>
                        <SelectItem value={STATUSES.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={STATUSES.PROCESSING}>Processing</SelectItem>
                        <SelectItem value={STATUSES.QUEUED}>Queued</SelectItem>
                        <SelectItem value={STATUSES.FAILED}>Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] border-border">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SORT_OPTIONS.NEWEST}>Newest First</SelectItem>
                        <SelectItem value={SORT_OPTIONS.OLDEST}>Oldest First</SelectItem>
                        <SelectItem value={SORT_OPTIONS.NAME}>Name (A-Z)</SelectItem>
                        <SelectItem value={SORT_OPTIONS.IMAGES}>Most Images</SelectItem>
                        <SelectItem value={SORT_OPTIONS.SIZE}>Largest Size</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="border-border"
                    >
                      {showFilters ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Hide Filters
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          More Filters
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 pt-4 border-t border-border md:flex-row md:items-center">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Date Range:</Label>
                        </div>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger className="w-[180px] border-border">
                            <SelectValue placeholder="Date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="ml-auto"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reset Filters
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-dashed border-border">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== STATUSES.ALL || dateRange !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'Get started by creating your first order.'}
                    </p>
                    {(!searchQuery && statusFilter === STATUSES.ALL && dateRange === 'all') && (
                      <Button asChild>
                        <Link href="/upload">
                          <Package className="mr-2 h-4 w-4" />
                          Create New Order
                        </Link>
                      </Button>
                    )}
                    {(searchQuery || statusFilter !== STATUSES.ALL || dateRange !== 'all') && (
                      <Button variant="outline" onClick={resetFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="border-border hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Order Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold">
                              {formatOrderId(order.id)}
                            </h2>
                            {getStatusBadge(order.status)}
                          </div>

                          {/* Order Stats */}
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                            <div className="flex items-start gap-2">
                              <ImageIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Images</p>
                                <p className="text-sm font-semibold">{order.images || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Processed</p>
                                <p className="text-sm font-semibold">{order.processedCount || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Size</p>
                                <p className="text-sm font-semibold">{order.size || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-semibold">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            {order.completedAt && (
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Completed</p>
                                  <p className="text-sm font-semibold">{formatDate(order.completedAt)}</p>
                                </div>
                              </div>
                            )}
                          </div>


                          {/* Progress Bar for Processing */}
                          {order.status === 'processing' && order.progress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Processing</span>
                                <span className="font-medium">{order.progress}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full bg-foreground rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${order.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {order.status === 'failed' && order.error && (
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                              <p className="text-xs text-muted-foreground mb-1">Error:</p>
                              <p className="text-sm text-foreground">{order.error}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Project
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {order.instructions && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrderInstructions({
                                      orderId: order.id,
                                      orderName: order.name || formatOrderId(order.id),
                                      instructions: order.instructions,
                                    })
                                    setInstructionsDialogOpen(true)
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Instruction
                                </DropdownMenuItem>
                              )}
                              {order.status === 'completed' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleConnectDAM(order)}
                                    disabled={uploadingToDAM && selectedOrderForDAM?.id === order.id}
                                  >
                                    {uploadingToDAM && selectedOrderForDAM?.id === order.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                      </>
                                    ) : selectedDamsForOrder[order.id] && selectedDamsForOrder[order.id].length > 0 ? (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Connected({selectedDamsForOrder[order.id].length})
                                      </>
                                    ) : (
                                      <>
                                        <Cloud className="mr-2 h-4 w-4" />
                                        Connect to DAM
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDownloadOrder(order)}
                                    disabled={downloadingOrder === order.id}
                                  >
                                    {downloadingOrder === order.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Preparing...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Project
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* DAM Selection Dialog */}
      <DamSelectionDialog
        open={damDialogOpen}
        onOpenChange={(open) => {
          setDamDialogOpen(open)
          if (!open) setSelectedOrderForDAM(null)
        }}
        damConnections={damConnections || []}
        activeDamConnection={activeDamConnection}
        onSelectDam={handleSelectDam}
        onAddDam={handleAddDam}
        onRemoveDam={handleRemoveDam}
      />

      {/* Instructions Dialog */}
      <Dialog open={instructionsDialogOpen} onOpenChange={setInstructionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Processing Instructions
            </DialogTitle>
            <DialogDescription>
              {selectedOrderInstructions?.orderName && (
                <>Instructions for {selectedOrderInstructions.orderName}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm whitespace-pre-wrap break-words">
                {selectedOrderInstructions?.instructions || 'No instructions available.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInstructionsDialogOpen(false)
                setSelectedOrderInstructions(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone, but you can restore it from the notification.
            </DialogDescription>
          </DialogHeader>
          {orderToDelete && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-semibold">{orderToDelete.name || formatOrderId(orderToDelete.id)}</h4>
                  {getStatusBadge(orderToDelete.status)}
                </div>
                
                {/* Order Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Images</p>
                      <p className="text-sm font-semibold">{orderToDelete.images || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Processed</p>
                      <p className="text-sm font-semibold">{orderToDelete.processedCount || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-semibold">{orderToDelete.size || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-semibold">{formatDate(orderToDelete.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Order ID */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="text-xs font-mono text-foreground mt-0.5">{formatOrderId(orderToDelete.id)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setOrderToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteOrder}
            >
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
