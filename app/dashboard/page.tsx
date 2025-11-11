'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Image as ImageIcon,
  Package,
  Coins,
  CreditCard,
  ArrowRight,
  Plus,
  Download,
  Eye
} from 'lucide-react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  // Mock data - replace with actual API calls
  const stats = {
    totalOrders: 48,
    inProgress: 3,
    completed: 42,
    failed: 3,
    credits: 250,
    creditsUsed: 750,
    plan: 'Pro'
  }

  const inProgressJobs = [
    {
      id: '1',
      name: 'Product Shoot 2024',
      images: 45,
      processed: 30,
      status: 'processing',
      startedAt: '10 mins ago'
    },
    {
      id: '2',
      name: 'Website Hero Images',
      images: 12,
      processed: 8,
      status: 'processing',
      startedAt: '25 mins ago'
    },
    {
      id: '3',
      name: 'Social Media Content',
      images: 20,
      processed: 5,
      status: 'processing',
      startedAt: '1 hour ago'
    }
  ]

  const recentOrders = [
    {
      id: 'order-1',
      name: 'E-commerce Catalog',
      images: 120,
      status: 'completed',
      completedAt: '2 hours ago'
    },
    {
      id: 'order-2',
      name: 'Marketing Assets',
      images: 35,
      status: 'completed',
      completedAt: '1 day ago'
    },
    {
      id: 'order-3',
      name: 'Blog Images',
      images: 15,
      status: 'completed',
      completedAt: '2 days ago'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Currently processing
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">98.5%</span> success rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.credits}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.creditsUsed} used this month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Start a new project or manage existing ones</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Link href="/upload">
                    <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                      <Upload className="h-6 w-6" />
                      <span className="font-semibold">New Upload</span>
                      <span className="text-xs opacity-90">Start processing images</span>
                    </Button>
                  </Link>
                  
                  <Link href="/orders">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                      <Package className="h-6 w-6" />
                      <span className="font-semibold">View Orders</span>
                      <span className="text-xs text-muted-foreground">Browse order history</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* In Progress Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>In Progress</CardTitle>
                    <CardDescription>Jobs currently being processed</CardDescription>
                  </div>
                  <Badge>{stats.inProgress} active</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inProgressJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{job.name}</h4>
                          <Badge variant="secondary" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Processing
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{job.processed} / {job.images} images processed</span>
                            <span>{Math.round((job.processed / job.images) * 100)}%</span>
                          </div>
                          <Progress value={(job.processed / job.images) * 100} className="h-2" />
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Started {job.startedAt}
                          </div>
                        </div>
                      </div>
                      <Link href={`/processing/${job.id}`}>
                        <Button variant="ghost" size="icon" className="ml-4">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Your latest completed orders</CardDescription>
                  </div>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{order.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.images} images · {order.completedAt}
                          </p>
                        </div>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-2 border-purple-200 dark:border-purple-900">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                      {stats.plan} Plan
                    </Badge>
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-medium">Credits Used</span>
                      <span className="text-2xl font-bold">{stats.creditsUsed}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.credits} credits remaining
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next billing</span>
                      <span className="font-medium">Dec 15, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly cost</span>
                      <span className="font-medium">$49/mo</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href="/billing" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Manage Plan
                      </Button>
                    </Link>
                    <Link href="/tokens">
                      <Button className="flex-1 w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Buy Credits
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Usage This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Images Processed</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Storage Used</span>
                      <span className="font-semibold">2.4 GB</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">API Calls</span>
                      <span className="font-semibold">3,891</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Help Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check our documentation or contact support for assistance.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/resources" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Docs
                      </Button>
                    </Link>
                    <Link href="/support" className="flex-1">
                      <Button size="sm" className="w-full">
                        Support
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

