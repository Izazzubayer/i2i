'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import AuthenticatedNav from '@/components/AuthenticatedNav'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getOrders, getOrderStats } from '@/api'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import DamConnectDialog from '@/components/DamConnectDialog'

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
}

export default function OrdersPage() {
  const router = useRouter()
  const { deleteOrder, addDamConnection, activeDamConnection, damConnections } = useStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUSES.ALL)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST)
  const [dateRange, setDateRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [damDialogOpen, setDamDialogOpen] = useState(false)
  const [damSelectModalOpen, setDamSelectModalOpen] = useState(false)
  const [selectedOrderForDAM, setSelectedOrderForDAM] = useState(null)
  const [uploadingToDAM, setUploadingToDAM] = useState(false)
  const [downloadingOrder, setDownloadingOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(50)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch orders and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch orders and stats in parallel
        const [ordersResponse, statsResponse] = await Promise.all([
          getOrders({
            pageNumber,
            pageSize,
            ...(statusFilter !== 'all' && { statusLookupId: statusFilter }),
          }),
          getOrderStats(),
        ])

        // Transform orders from API to match UI structure
        const transformedOrders = ordersResponse.orders?.map((order) => {
          // Status is a UUID, we'll determine status from updatedAt vs createdAt
          let status = 'pending'
          if (order.updatedAt && order.createdAt) {
            const created = new Date(order.createdAt)
            const updated = new Date(order.updatedAt)
            const diffMinutes = (updated - created) / (1000 * 60)
            // If updated more than 5 minutes after creation, likely completed
            if (diffMinutes > 5) {
              status = 'completed'
            } else if (diffMinutes > 0) {
              status = 'processing'
            }
          }
          
          return {
            id: order.orderId,
            orderId: order.orderId,
            name: order.orderName || `Order ${order.orderId.substring(0, 8)}`,
            images: 0, // Will be calculated from order details if needed
            status: status,
            statusLookupId: order.status, // Keep original UUID
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            expireAt: order.expireAt,
            // Additional fields from API
            _apiData: order,
          }
        }) || []

        setOrders(transformedOrders)
        setTotalCount(ordersResponse.totalCount || 0)
        setStats(statsResponse)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err.message || 'Failed to load orders')
        toast.error(err.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageNumber, pageSize, statusFilter])

  const filteredOrders = useMemo(() => {
    // Client-side search filtering
    let filtered = orders.filter(order => {
      const matchesSearch =
        (order.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.instructions || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === STATUSES.ALL || order.status === statusFilter
      
      // Date range filter
      let matchesDate = true
      if (dateRange !== 'all' && order.createdAt) {
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

    // Client-side sorting
    const sorted = [...filtered].sort((a, b) => {
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
        case SORT_OPTIONS.NEWEST:
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return sorted
  }, [orders, searchQuery, statusFilter, sortBy, dateRange])

  // Use stats from API, fallback to calculated from filtered orders
  const ordersByStatus = useMemo(
    () => {
      if (stats) {
        return {
          all: stats.totalOrders || 0,
          completed: stats.completedOrders || 0,
          processing: stats.inProcessOrders || 0,
          failed: stats.failedOrders || 0,
          queued: 0, // Not provided in stats API
        }
      }
      // Fallback to calculated from orders
      return {
        all: orders.length,
        completed: orders.filter(o => o.status === 'completed').length,
        processing: orders.filter(o => o.status === 'processing' || o.status === 'pending').length,
        failed: orders.filter(o => o.status === 'failed').length,
        queued: orders.filter(o => o.status === 'queued').length
      }
    },
    [stats, orders]
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

    const statusMap = {
      completed: { label: 'Completed', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
      processing: { label: 'Processing', tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300' },
      pending: { label: 'Pending', tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
      queued: { label: 'Queued', tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
      failed: { label: 'Failed', tone: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    }
    
    const statusInfo = statusMap[status] || { 
      label: status.charAt(0).toUpperCase() + status.slice(1), 
      tone: 'border-muted text-muted-foreground' 
    }
    
    return (
      <Badge variant="outline" className={`border ${statusInfo.tone} gap-1.5`}>
        {icons[status] || <AlertCircle className="h-3 w-3" />}
        {statusInfo.label}
      </Badge>
    )
  }

  const handleConnectDAM = useCallback((order) => {
    setSelectedOrderForDAM(order)
    
    // If no DAM connections, redirect to integrations page in new tab
    if (!damConnections || damConnections.length === 0) {
      // Open integrations page in new tab so user can connect DAM
      window.open('/integrations', '_blank')
      toast.info(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              Connect DAM First
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Opening integrations page in a new tab. Connect a DAM and return here to upload.
            </p>
          </div>
        </div>
      )
      return
    }
    
    // Show selection modal with connected DAMs
    setDamSelectModalOpen(true)
  }, [damConnections])

  const handleDamConnect = useCallback(async (config) => {
    const newConnection = addDamConnection(config)
    setDamDialogOpen(false)
    if (selectedOrderForDAM) {
      // After connecting new DAM, show selection modal so user can choose
      // This allows them to see all available options including the new one
      setDamSelectModalOpen(true)
    }
  }, [selectedOrderForDAM, addDamConnection])

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
    setDamSelectModalOpen(false)
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
  }, [activeDamConnection])

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
    deleteOrder(orderId)
    toast.success('Order deleted')
  }, [deleteOrder])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter(STATUSES.ALL)
    setSortBy(SORT_OPTIONS.NEWEST)
    setDateRange('all')
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
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

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
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
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-border">
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading orders...</span>
                  </CardContent>
                </Card>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-dashed border-border">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Failed to load orders</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : filteredOrders.length === 0 ? (
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
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Order Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold">{order.name || 'Unnamed Order'}</h2>
                            {getStatusBadge(order.status)}
                            <span className="text-sm text-muted-foreground font-mono">
                              {order.id}
                            </span>
                          </div>

                          {/* Order Stats */}
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Images</p>
                                <p className="text-sm font-semibold">{order.images || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Processed</p>
                                <p className="text-sm font-semibold">{order.processedCount || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Size</p>
                                <p className="text-sm font-semibold">{order.size || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-semibold">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            {order.completedAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Completed</p>
                                  <p className="text-sm font-semibold">{formatDate(order.completedAt)}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Instructions Preview */}
                          {order.instructions && (
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                              <p className="text-xs text-muted-foreground mb-1">Instructions:</p>
                              <p className="text-sm line-clamp-2">{order.instructions}</p>
                            </div>
                          )}

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
                        <div className="flex flex-col gap-2 lg:w-48">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-border"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {order.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-border"
                                onClick={() => handleConnectDAM(order)}
                                disabled={uploadingToDAM}
                              >
                                {uploadingToDAM && selectedOrderForDAM?.id === order.id ? (
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
                                variant="default"
                                size="sm"
                                className="w-full"
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
                                    Download All
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          
          {/* Pagination info */}
          {!loading && !error && totalCount > pageSize && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(p => p + 1)}
                  disabled={pageNumber * pageSize >= totalCount || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* DAM Connect Dialog */}
      <DamConnectDialog
        open={damDialogOpen}
        onOpenChange={(open) => {
          setDamDialogOpen(open)
          if (!open) setSelectedOrderForDAM(null)
        }}
        onConnect={handleDamConnect}
      />

      {/* DAM Selection Modal - Shows all connected DAMs in grid */}
      <Dialog open={damSelectModalOpen} onOpenChange={setDamSelectModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select DAM Platform</DialogTitle>
            <DialogDescription>
              {selectedOrderForDAM 
                ? `Choose a DAM platform to upload ${selectedOrderForDAM.images || 0} image${selectedOrderForDAM.images !== 1 ? 's' : ''} from "${selectedOrderForDAM.name}"`
                : 'Choose which Digital Asset Management platform to upload your images to'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {damConnections && damConnections.map((connection) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-all cursor-pointer ${
                    activeDamConnection?.id === connection.id
                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 shadow-md'
                      : 'border-border bg-background hover:bg-muted/50 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (selectedOrderForDAM) {
                      handleUploadToDAM(selectedOrderForDAM, connection)
                    }
                  }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{connection.name}</p>
                      {activeDamConnection?.id === connection.id && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{connection.provider}</p>
                    {connection.workspace && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {connection.workspace}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDamSelectModalOpen(false)
                setSelectedOrderForDAM(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setDamSelectModalOpen(false)
                // Open integrations page in new tab to connect new DAM
                window.open('/integrations', '_blank')
              }}
            >
              <Cloud className="mr-2 h-4 w-4" />
              Connect New Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
