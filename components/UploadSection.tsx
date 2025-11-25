'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, ArrowRight, Image as ImageIcon, HardDrive, Sparkles, Edit, Coins, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { formatFileSize, generateId } from '@/lib/utils'
import InstructionChat from './InstructionChat'

export default function UploadSection() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [instructionFile, setInstructionFile] = useState<File | null>(null)
  const [instructionText, setInstructionText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)
  const [projectSummary, setProjectSummary] = useState('')
  const [isEditingeSummary, setIsEditingSummary] = useState(false)

  const { batch, createBatch } = useStore()

  const onDropImages = useCallback((acceptedFiles: File[]) => {
    setImages(prev => [...prev, ...acceptedFiles])
    toast.success(`${acceptedFiles.length} image(s) added`)
  }, [])

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: true,
  })

  const handleInstructionChange = (instruction: string) => {
    setInstructionText(instruction)
  }

  const handleFileChange = (file: File | null) => {
    setInstructionFile(file)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleStartProcessing = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    if (!instructionFile && !instructionText.trim()) {
      toast.error('Please provide instructions')
      return
    }

    // Generate AI summary
    const summary = `This batch contains ${images.length} images for AI-powered processing with the following objectives:

${instructionText || instructionFile?.name || 'No specific instructions provided'}

The AI will analyze each image and apply the following transformations:
• Background enhancement and removal
• Color correction and optimization
• Object detection and masking
• Smart cropping and composition
• Quality enhancement using advanced algorithms

Expected processing time: ${Math.ceil(images.length * 2.5)} seconds
Total file size: ${formatFileSize(images.reduce((acc, file) => acc + file.size, 0))}

All processed images will maintain original quality while applying the requested enhancements. The system will automatically detect and optimize each image based on its content and composition.`

    setProjectSummary(summary)
    setShowSummaryDialog(true)
  }

  const handleProceed = async () => {
    setShowSummaryDialog(false)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const instructions = instructionFile || instructionText
      const response = await apiClient.upload(images, instructions)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Create batch in store
      createBatch(response.batchId, instructionText || instructionFile?.name || '', images.length)

      setTimeout(() => {
        setCollapsed(true)
        toast.success('Upload complete! Processing started...')
        // Navigate to processing page
        router.push('/processing')
      }, 500)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  if (collapsed && batch) {
    return null
  }

  // Calculate total size
  const totalSize = images.reduce((acc, file) => acc + file.size, 0)
  const hasImages = images.length > 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-8 px-4 md:px-8"
    >
      <div className="mx-auto max-w-5xl">
        {!hasImages && (
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">Upload Your Images</h2>
            <p className="text-muted-foreground">
              Drag and drop your images and instructions to get started
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Images
              </CardTitle>
              <CardDescription>
                Upload images to process (PNG, JPG, WEBP)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasImages && (
                <div
                  {...getImageRootProps()}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isImageDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                >
                  <input {...getImageInputProps()} />
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium">
                    {isImageDragActive ? 'Drop images here' : 'Drag & drop images'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse
                  </p>
                </div>
              )}

              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{images.length} image(s) selected</p>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto">
                    <AnimatePresence>
                      {images.map((file, index) => {
                        // Create preview URL for image
                        const previewUrl = URL.createObjectURL(file)

                        return (
                          <motion.div
                            key={file.name + index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between rounded-lg border p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                                <img
                                  src={previewUrl}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Instruction Chat */}
          <InstructionChat
            onInstructionChange={handleInstructionChange}
            onFileChange={handleFileChange}
          />
        </div>

        {/* Stats and Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {uploading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Uploading...</p>
                    <p className="text-sm text-muted-foreground">
                      {uploadProgress}%
                    </p>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Stats Section */}
              {images.length > 0 && (
                <Card>
                  <CardContent className="py-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold tracking-tight">{images.length}</p>
                          <p className="text-sm text-muted-foreground">Images</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <HardDrive className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold tracking-tight">{formatFileSize(totalSize)}</p>
                          <p className="text-sm text-muted-foreground">File Size</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Coins className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold tracking-tight">{(images.length * 150).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Tokens</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold tracking-tight">${((images.length * 150 * 0.002) / 1000).toFixed(3)}</p>
                          <p className="text-sm text-muted-foreground">Est. Cost</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Continue Button */}
              <Button
                onClick={handleStartProcessing}
                size="lg"
                className="w-full h-14 text-base font-semibold"
                disabled={images.length === 0 || (!instructionFile && !instructionText.trim())}
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Generated Project Summary
            </DialogTitle>
            <DialogDescription>
              Review the AI-generated summary of your batch processing request
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            {isEditingeSummary ? (
              <Textarea
                value={projectSummary}
                onChange={(e) => setProjectSummary(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            ) : (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {projectSummary}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditingSummary(!isEditingeSummary)}
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditingeSummary ? 'Save Changes' : 'Edit'}
            </Button>
            <Button
              onClick={handleProceed}
              className="w-full sm:w-auto"
            >
              Proceed
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  )
}

