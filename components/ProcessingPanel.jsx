'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import Link from 'next/link'

export default function ProcessingPanel() {
  const { batch, updateBatchProgress, addLog, updateImageStatus, setSummary, toggleSummaryDrawer } = useStore()
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (!batch || batch.status !== 'processing') return

    // Simulate AI processing
    const processingInterval = setInterval(() => {
      const processedCount = batch.images.filter(
        img => img.status === 'completed' || img.status === 'approved'
      ).length

      if (processedCount < batch.totalImages) {
        const nextImage = batch.images.find(img => img.status === 'processing')

        if (nextImage) {
          // Simulate processing with mock URL
          updateImageStatus(
            nextImage.id,
            'completed',
            `https://picsum.photos/seed/${nextImage.id}/400/300`
          )

          addLog(`Processed ${nextImage.originalName} successfully`, 'success')

          const newProgress = ((processedCount + 1) / batch.totalImages) * 100
          updateBatchProgress(newProgress, processedCount + 1 === batch.totalImages ? 'completed' : 'processing')
        }
      } else {
        // All images processed
        clearInterval(processingInterval)
        addLog('All images processed successfully!', 'success')
        updateBatchProgress(100, 'completed')

        // Generate mock summary
        setSummary(
          `Successfully processed ${batch.totalImages} images with AI enhancement. ` +
          `Background replacement and color enhancement applied according to instructions. ` +
          `All images are ready for review and export.`
        )

        // Auto-open summary drawer
        setTimeout(() => {
          toggleSummaryDrawer(true)
        }, 1000)
      }
    }, 2000)

    return () => clearInterval(processingInterval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch?.id, batch?.status, batch?.totalImages])

  if (!batch) return null

  const getStatusIcon = () => {
    switch (batch.status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-primary" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (batch.status) {
      case 'processing':
        return <Badge variant="default">Processing</Badge>
      case 'completed':
        return <Badge variant="outline" className="border-primary text-primary">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Idle</Badge>
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="container py-8 px-4 md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Processing Status</h2>
            <p className="text-sm text-muted-foreground">
              Overview of batch progress and statistics
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Link href={`/processing/${batch.id}`}>
              <Button
                variant="outline"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-muted-foreground">
                        {batch.processedCount} / {batch.totalImages} images
                      </span>
                    </div>
                    <Progress value={batch.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(batch.progress)}% complete
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-2xl font-bold">{batch.totalImages}</p>
                      <p className="text-xs text-muted-foreground">Total Images</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-2xl font-bold text-primary">{batch.processedCount}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-2xl font-bold text-primary">{batch.approvedCount}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-2xl font-bold text-primary">{batch.retouchCount}</p>
                      <p className="text-xs text-muted-foreground">Needs Retouch</p>
                    </div>
                  </div>

                  {/* AI Summary (when processing complete) */}
                  {batch.status === 'completed' && batch.summary && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-lg border bg-muted/50 p-4"
                    >
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        AI Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {batch.summary}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="mt-6 border-b" />
      </div>
    </motion.section>
  )
}

