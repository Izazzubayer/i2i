'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, FileText, Edit2, Check, X, Loader2, Cloud } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import JSZip from 'jszip'
import DamConnectDialog from '@/components/DamConnectDialog'
import type { DamConfig } from '@/components/DamConnectDialog'
import { apiClient } from '@/lib/api'

export default function SummaryDrawer() {
  const { summaryDrawerOpen, toggleSummaryDrawer, batch, setSummary, resetBatch, addDamConnection, activeDamConnection } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  const [exporting, setExporting] = useState(false)
  const [showDamDialog, setShowDamDialog] = useState(false)

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setSummary(editedSummary)
      toast.success('Summary updated')
    } else {
      // Start editing
      setEditedSummary(batch?.summary || '')
    }
    setIsEditing(!isEditing)
  }

  const handleDownloadAll = async () => {
    if (!batch) return

    setExporting(true)
    toast.info('Preparing download...')

    try {
      const zip = new JSZip()
      
      // Add summary file
      zip.file('summary.txt', `
i2i Processing Summary
======================

Batch ID: ${batch.id}
Total Images: ${batch.totalImages}
Processed: ${batch.processedCount}
Approved: ${batch.approvedCount}
Needs Retouch: ${batch.retouchCount}

Summary:
${batch.summary}

Instructions:
${batch.instructions}

Processed Images:
${batch.images.map((img, i) => `${i + 1}. ${img.originalName} - Status: ${img.status}`).join('\n')}
      `)

      // In a real app, you would fetch and add actual images
      // For now, we'll create a manifest
      const manifest = batch.images.map(img => ({
        id: img.id,
        originalName: img.originalName,
        processedUrl: img.processedUrl,
        status: img.status,
      }))
      
      zip.file('manifest.json', JSON.stringify(manifest, null, 2))

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `i2i-batch-${batch.id}.zip`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Download started!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleConnectDAM = async (config: DamConfig) => {
    if (!batch) return

    setExporting(true)
    addDamConnection(config)

    try {
      // Get all approved or completed images
      const imageIds = batch.images
        .filter(img => img.status === 'approved' || img.status === 'completed')
        .map(img => img.id)

      if (imageIds.length === 0) {
        toast.error('No images ready to upload')
        setExporting(false)
        return
      }

      toast.loading(`Uploading ${imageIds.length} images to ${config.provider}...`, {
        id: 'dam-upload-summary',
      })

      const response = await apiClient.uploadToDAM({
        imageIds,
        damConfig: config,
        batchId: batch.id,
      })

      toast.success('Upload complete!', {
        id: 'dam-upload-summary',
        description: `${response.uploadedCount} images uploaded to ${response.damWorkspace}`,
      })
      
      setShowDamDialog(false)
    } catch (error) {
      console.error('DAM upload failed:', error)
      toast.error('Upload failed', {
        id: 'dam-upload-summary',
        description: 'Please check your connection and try again',
      })
    } finally {
      setExporting(false)
    }
  }

  const handleNewBatch = () => {
    if (confirm('Start a new batch? This will clear all current data.')) {
      resetBatch()
      toggleSummaryDrawer(false)
      toast.success('Ready for a new batch!')
    }
  }

  if (!batch) return null

  return (
    <Drawer open={summaryDrawerOpen} onOpenChange={toggleSummaryDrawer}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Batch Summary & Export</DrawerTitle>
            <DrawerDescription>
              Review your batch results and export your processed images
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-6 p-4 pb-0">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{batch.totalImages}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Processed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {batch.processedCount}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {batch.approvedCount}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Needs Retouch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">
                    {batch.retouchCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      AI Generated Summary
                    </CardTitle>
                    <CardDescription>
                      {isEditing ? 'Edit the summary' : 'Overview of the processing results'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    {isEditing ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="min-h-[120px]"
                  />
                ) : (
                  <p className="leading-relaxed text-muted-foreground">
                    {batch.summary}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Download your images or connect to your DAM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDownloadAll}
                  disabled={exporting}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download All (ZIP with Summary)
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowDamDialog(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={exporting}
                >
                  <Cloud className="mr-2 h-5 w-5" />
                  {activeDamConnection ? 'Upload to DAM' : 'Connect to DAM'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <DrawerFooter>
            <div className="flex gap-2">
              <Button
                onClick={handleNewBatch}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Start New Batch
              </Button>
              <DrawerClose asChild>
                <Button variant="secondary" size="lg">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>

      {/* DAM Connection Dialog */}
      <DamConnectDialog
        open={showDamDialog}
        onOpenChange={setShowDamDialog}
        onConnect={handleConnectDAM}
      />
    </Drawer>
  )
}

