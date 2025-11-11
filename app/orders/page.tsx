'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Package, Search, Calendar } from 'lucide-react'
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

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const orders = [
    {
      id: 'ORD-2024-001',
      name: 'Product Catalog 2024',
      images: 120,
      status: 'completed',
      createdAt: '2024-11-10 14:30',
      completedAt: '2024-11-10 15:45',
      credits: 120,
      size: '4.2 GB'
    },
    {
      id: 'ORD-2024-002',
      name: 'Website Hero Images',
      images: 45,
      status: 'processing',
      createdAt: '2024-11-10 16:00',
      progress: 67,
      credits: 45,
      size: '1.8 GB'
    },
    {
      id: 'ORD-2024-003',
      name: 'Marketing Campaign',
      images: 85,
      status: 'completed',
      createdAt: '2024-11-09 10:15',
      completedAt: '2024-11-09 12:30',
      credits: 85,
      size: '3.1 GB'
    },
    {
      id: 'ORD-2024-004',
      name: 'Social Media Content',
      images: 30,
      status: 'failed',
      createdAt: '2024-11-08 09:00',
      error: 'Processing timeout',
      credits: 15,
      size: '890 MB'
    },
    {
      id: 'ORD-2024-005',
      name: 'E-commerce Product Shots',
      images: 200,
      status: 'completed',
      createdAt: '2024-11-07 08:00',
      completedAt: '2024-11-07 11:20',
      credits: 200,
      size: '6.8 GB'
    },
    {
      id: 'ORD-2024-006',
      name: 'Blog Images',
      images: 15,
      status: 'queued',
      createdAt: '2024-11-10 17:00',
      credits: 15,
      size: '520 MB'
    }
  ]

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesSearch =
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'images':
          return b.images - a.images
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return sorted
  }, [orders, searchQuery, statusFilter, sortBy])

  const ordersByStatus = useMemo(
    () => ({
      all: filteredOrders.length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      processing: filteredOrders.filter(o => o.status === 'processing').length,
      failed: filteredOrders.filter(o => o.status === 'failed').length,
      queued: filteredOrders.filter(o => o.status === 'queued').length
    }),
    [filteredOrders]
  )

  const getStatusBadge = (status: string) => {
    const label = status.charAt(0).toUpperCase() + status.slice(1)
    const tone: Record<string, string> = {
      completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      processing: 'border-blue-200 bg-blue-50 text-blue-700',
      queued: 'border-amber-200 bg-amber-50 text-amber-700',
      failed: 'border-rose-200 bg-rose-50 text-rose-700'
    }

    return (
      <Badge variant="outline" className={`border ${tone[status] ?? 'border-muted text-muted-foreground'}`}>
        {label}
      </Badge>
    )
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
                Keep track of every batch you send to i2i. Search, filter, and jump back into work in seconds.
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
              { label: 'Queued', value: ordersByStatus.queued }
            ].map(stat => (
              <Card key={stat.label} className="border-muted">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
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
                      <span>{order.images} images</span>
                      <span>{order.size}</span>
                      <span>{order.credits} credits</span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {order.createdAt}
                      </span>
                    </div>
                    {order.status === 'processing' && order.progress && (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-full rounded-full bg-muted" role="presentation">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${order.progress}%` }}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={order.progress}
                            role="progressbar"
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{order.progress}%</span>
                      </div>
                    )}
                    {order.status === 'completed' && order.completedAt && (
                      <p className="text-sm text-muted-foreground">
                        Completed {order.completedAt}
                      </p>
                    )}
                    {order.status === 'failed' && order.error && (
                      <p className="text-sm font-medium text-rose-600">
                        {order.error}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:w-40">
                    <Button asChild variant="outline">
                      <Link href={`/orders/${order.id}`}>View details</Link>
                    </Button>
                    {order.status === 'completed' && (
                      <Button variant="secondary">Download</Button>
                    )}
                    {order.status === 'failed' && (
                      <Button variant="secondary">Retry</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredOrders.length === 0 && (
              <Card className="border-dashed border-muted">
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold">No orders match your filters</p>
                    <p className="text-sm text-muted-foreground">
                      Try a different search term or reset the filters.
                    </p>
                  </div>
                  <Button variant="outline" onClick={resetFilters}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  )
}
