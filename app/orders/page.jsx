'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Package, Search, Calendar, Loader2 } from 'lucide-react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getOrders, getOrderStats } from '@/api'
import { toast } from 'sonner'

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
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
        const transformedOrders = ordersResponse.orders?.map((order) => ({
          id: order.orderId,
          orderId: order.orderId,
          name: order.orderName || `Order ${order.orderId.substring(0, 8)}`,
          images: 0, // Will be calculated from order details if needed
          status: order.status?.toLowerCase() || 'pending',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          expireAt: order.expireAt,
          // Additional fields from API
          _apiData: order,
        })) || []

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
    const filtered = orders.filter(order => {
      const matchesSearch =
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })

    // Client-side sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return sorted
  }, [orders, searchQuery, sortBy])

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
      // Fallback to calculated from filtered orders
      return {
        all: filteredOrders.length,
        completed: filteredOrders.filter(o => o.status === 'completed').length,
        processing: filteredOrders.filter(o => o.status === 'processing' || o.status === 'pending').length,
        failed: filteredOrders.filter(o => o.status === 'failed').length,
        queued: filteredOrders.filter(o => o.status === 'queued').length
      }
    },
    [stats, filteredOrders]
  )

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completed', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
      processing: { label: 'Processing', tone: 'border-blue-200 bg-blue-50 text-blue-700' },
      pending: { label: 'Pending', tone: 'border-amber-200 bg-amber-50 text-amber-700' },
      queued: { label: 'Queued', tone: 'border-amber-200 bg-amber-50 text-amber-700' },
      failed: { label: 'Failed', tone: 'border-rose-200 bg-rose-50 text-rose-700' },
    }
    
    const statusInfo = statusMap[status] || { 
      label: status.charAt(0).toUpperCase() + status.slice(1), 
      tone: 'border-muted text-muted-foreground' 
    }

    return (
      <Badge variant="outline" className={`border ${statusInfo.tone}`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateString
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('newest')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />

      <div className="px-4">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-12">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Orders</p>
              <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Keep track of every batch you send to i2i. Searchfilterand jump back into work in seconds.
              </p>
            </div>
            <Button asChild>
              <Link href="/upload">
                <Package className="mr-2 h-4 w-4" />
                New order
              </Link>
            </Button>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid gap-3 sm:grid-cols-4"
          >
            {[
              { label: 'All', value: ordersByStatus.all },
              { label: 'Completed', value: ordersByStatus.completed },
              { label: 'Processing', value: ordersByStatus.processing },
              { label: 'Failed', value: ordersByStatus.failed }
            ].map(stat => (
              <Card key={stat.label} className="border-muted">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card"
            aria-labelledby="orders-filters"
          >
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                <label className="flex flex-1 items-center gap-3 rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">Search orders</span>
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by order name or ID"
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="images">Most images</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
            aria-live="polite"
          >
            {loading ? (
              <Card className="border-muted/70">
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading orders...</span>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-dashed border-muted">
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold">Failed to load orders</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card className="border-dashed border-muted">
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold">No orders found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try a different search term or reset the filters.'
                        : 'You haven\'t created any orders yet. Start by creating a new order.'}
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== 'all') && (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredOrders.map(order => (
                  <Card key={order.id} className="border-muted/70">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold">{order.name}</h2>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            {order.id}
                          </span>
                          {order.images > 0 && <span>{order.images} images</span>}
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            {formatDate(order.createdAt)}
                          </span>
                          {order.expireAt && (
                            <span className="text-xs">
                              Expires: {formatDate(order.expireAt)}
                            </span>
                          )}
                        </div>
                        {order.status === 'processing' || order.status === 'pending' ? (
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-full rounded-full bg-muted" role="presentation">
                              <div
                                className="h-2 rounded-full bg-primary transition-all animate-pulse"
                                style={{ width: '60%' }}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={60}
                                role="progressbar"
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">Processing...</span>
                          </div>
                        ) : null}
                        {order.updatedAt && order.status === 'completed' && (
                          <p className="text-sm text-muted-foreground">
                            Updated {formatDate(order.updatedAt)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:w-40">
                        <Button asChild variant="outline">
                          <Link href={`/orders/${order.orderId || order.id}`}>View details</Link>
                        </Button>
                        {order.status === 'completed' && (
                          <Button variant="secondary">Download</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Pagination info */}
                {totalCount > pageSize && (
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
              </>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  )
}
